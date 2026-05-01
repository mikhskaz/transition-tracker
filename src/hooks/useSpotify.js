import { useCallback, useEffect, useState } from 'react';

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI =
  import.meta.env.VITE_SPOTIFY_REDIRECT_URI ||
  (typeof window !== 'undefined' ? `${window.location.origin}/callback` : '');
const SCOPES = '';

const TOKEN_KEY = 'spotify_token';
const VERIFIER_KEY = 'spotify_pkce_verifier';

function randomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  let out = '';
  for (let i = 0; i < length; i++) out += chars.charAt(values[i] % chars.length);
  return out;
}

async function sha256(plain) {
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(plain));
}

function base64Url(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function readToken() {
  try {
    const raw = sessionStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const t = JSON.parse(raw);
    if (Date.now() >= t.expiresAt - 30_000) return { ...t, expired: true };
    return t;
  } catch {
    return null;
  }
}

function writeToken(t) {
  sessionStorage.setItem(TOKEN_KEY, JSON.stringify(t));
}

function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(VERIFIER_KEY);
}

async function exchangeCode(code) {
  const verifier = sessionStorage.getItem(VERIFIER_KEY);
  if (!verifier) throw new Error('PKCE verifier missing');
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: verifier,
  });
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Token exchange failed (${res.status}) ${text.slice(0, 120)}`);
  }
  const data = await res.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}

async function refreshAccessToken(refreshToken) {
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) throw new Error('Refresh failed');
  const data = await res.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}

export function useSpotify() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      const err = url.searchParams.get('error');

      if (err) {
        setError(`Spotify auth: ${err}`);
        window.history.replaceState({}, '', '/');
      } else if (code) {
        const verifier = sessionStorage.getItem(VERIFIER_KEY);
        if (!verifier) {
          if (!cancelled) {
            setError(
              'PKCE verifier missing — make sure the URL you start auth from matches the redirect URI exactly (host, port, path). Click Connect again from this origin.'
            );
          }
          window.history.replaceState({}, '', '/');
        } else {
          try {
            const token = await exchangeCode(code);
            if (!cancelled) {
              writeToken(token);
              setIsAuthed(true);
            }
          } catch (e) {
            if (!cancelled) setError(e.message);
          } finally {
            sessionStorage.removeItem(VERIFIER_KEY);
            window.history.replaceState({}, '', '/');
          }
        }
      } else {
        const t = readToken();
        if (t && !t.expired) {
          if (!cancelled) setIsAuthed(true);
        } else if (t?.expired && t.refreshToken) {
          try {
            const fresh = await refreshAccessToken(t.refreshToken);
            writeToken(fresh);
            if (!cancelled) setIsAuthed(true);
          } catch {
            clearToken();
          }
        }
      }
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async () => {
    if (!CLIENT_ID) {
      setError('VITE_SPOTIFY_CLIENT_ID not set');
      return;
    }
    const verifier = randomString(64);
    sessionStorage.setItem(VERIFIER_KEY, verifier);
    const challenge = base64Url(await sha256(verifier));
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: 'code',
      redirect_uri: REDIRECT_URI,
      code_challenge_method: 'S256',
      code_challenge: challenge,
      scope: SCOPES,
    });
    window.location.href = `https://accounts.spotify.com/authorize?${params}`;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setIsAuthed(false);
  }, []);

  const getAccessToken = useCallback(async () => {
    let t = readToken();
    if (!t) return null;
    if (t.expired && t.refreshToken) {
      try {
        t = await refreshAccessToken(t.refreshToken);
        writeToken(t);
      } catch {
        clearToken();
        setIsAuthed(false);
        return null;
      }
    }
    return t.accessToken;
  }, []);

  const search = useCallback(
    async (query, limit = 20) => {
      const q = query.trim();
      if (!q) return [];
      const token = await getAccessToken();
      if (!token) throw new Error('Not authenticated');
      // Stripped to the bare minimum — Spotify rejected limit/offset for some
      // accounts; server default is 20 results which is what we want anyway.
      void limit;
      const url =
        `https://api.spotify.com/v1/search` +
        `?q=${encodeURIComponent(q)}` +
        `&type=track`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        clearToken();
        setIsAuthed(false);
        throw new Error('Session expired — connect again');
      }
      if (!res.ok) {
        let detail = '';
        try {
          const body = await res.json();
          detail = body?.error?.message || JSON.stringify(body);
        } catch {
          detail = await res.text().catch(() => '');
        }
        throw new Error(
          `Search ${res.status}: ${detail.slice(0, 160)} · sent: ${url.slice(0, 200)}`
        );
      }
      const data = await res.json();
      return (data.tracks?.items || []).map((item) => ({
        spotifyId: item.id,
        name: item.name,
        artist: item.artists.map((a) => a.name).join(', '),
        album: item.album?.name || '',
        year: item.album?.release_date
          ? Number(item.album.release_date.slice(0, 4))
          : null,
        coverUrl: item.album?.images?.[0]?.url || '',
        previewUrl: item.preview_url || '',
        spotifyUrl: item.external_urls?.spotify || '',
      }));
    },
    [getAccessToken]
  );

  return {
    configured: Boolean(CLIENT_ID),
    ready,
    isAuthed,
    error,
    login,
    logout,
    search,
  };
}
