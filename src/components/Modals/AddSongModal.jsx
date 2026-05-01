import { useEffect, useState } from 'react';
import Modal from '../shared/Modal';
import { useGraphStore } from '../../store/graphStore';
import { useSpotify } from '../../hooks/useSpotify';

const blank = {
  name: '',
  artist: '',
  album: '',
  year: '',
  bpm: '',
  coverUrl: '',
  spotifyUrl: '',
  previewUrl: '',
};

export default function AddSongModal({ open, onClose, onAfterAdd, replaceTarget }) {
  const addSong = useGraphStore((s) => s.addSong);
  const updateSong = useGraphStore((s) => s.updateSong);
  const [tab, setTab] = useState('spotify');
  const [form, setForm] = useState(blank);

  const spotify = useSpotify();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchErr, setSearchErr] = useState(null);

  const isReplacing = !!replaceTarget;

  // Default to manual when Spotify not configured/authed (but not in replace mode)
  useEffect(() => {
    if (!spotify.configured && !isReplacing) setTab('manual');
  }, [spotify.configured, isReplacing]);

  // Pre-fill the search query AND the manual form when opened in replace mode
  useEffect(() => {
    if (open && replaceTarget) {
      setTab('spotify');
      const seed = `${replaceTarget.name ?? ''} ${replaceTarget.artist ?? ''}`.trim();
      setQuery(seed);
      setForm({
        name: replaceTarget.name ?? '',
        artist: replaceTarget.artist ?? '',
        album: replaceTarget.album ?? '',
        year: replaceTarget.year != null ? String(replaceTarget.year) : '',
        bpm: replaceTarget.bpm != null ? String(replaceTarget.bpm) : '',
        coverUrl: replaceTarget.coverUrl ?? '',
        spotifyUrl: replaceTarget.spotifyUrl ?? '',
        previewUrl: replaceTarget.previewUrl ?? '',
      });
    }
    if (!open) {
      setQuery('');
      setResults([]);
      setForm(blank);
    }
  }, [open, replaceTarget]);

  // Debounced search
  useEffect(() => {
    if (tab !== 'spotify' || !spotify.isAuthed) return;
    const q = query.trim();
    if (!q) {
      setResults([]);
      setSearchErr(null);
      return;
    }
    setSearching(true);
    const id = setTimeout(async () => {
      try {
        const r = await spotify.search(q, 20);
        setResults(r);
        setSearchErr(null);
      } catch (e) {
        setSearchErr(e.message);
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 280);
    return () => clearTimeout(id);
  }, [query, tab, spotify.isAuthed, spotify]);

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const payload = {
      name: form.name.trim(),
      artist: form.artist.trim() || 'Unknown Artist',
      album: form.album.trim(),
      year: form.year ? Number(form.year) : null,
      bpm: form.bpm ? Number(form.bpm) : null,
      coverUrl: form.coverUrl.trim(),
      spotifyUrl: form.spotifyUrl.trim(),
      previewUrl: form.previewUrl.trim(),
    };
    if (isReplacing) {
      updateSong(replaceTarget.id, payload);
      setForm(blank);
      onClose();
      return;
    }
    const prev = useGraphStore.getState().songs.at(-1)?.id ?? null;
    const newId = addSong(payload);
    setForm(blank);
    onClose();
    onAfterAdd?.(newId, prev);
  };

  const pickResult = (r) => {
    if (isReplacing) {
      // Preserve id, x, y, and BPM (Spotify search doesn't include BPM).
      // Replacing only metadata keeps every existing transition intact.
      updateSong(replaceTarget.id, {
        name: r.name,
        artist: r.artist,
        album: r.album,
        year: r.year,
        coverUrl: r.coverUrl,
        previewUrl: r.previewUrl,
        spotifyUrl: r.spotifyUrl,
        spotifyId: r.spotifyId,
      });
      setQuery('');
      setResults([]);
      onClose();
      return;
    }
    const prev = useGraphStore.getState().songs.at(-1)?.id ?? null;
    const newId = addSong(r);
    setQuery('');
    setResults([]);
    onClose();
    onAfterAdd?.(newId, prev);
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      label={
        isReplacing
          ? `MATCH SONG · ${(replaceTarget.name || '').slice(0, 32).toUpperCase()}`
          : 'ADD SONG · NEW NODE'
      }
    >
      {isReplacing && (
        <div className="px-6 py-3 border-b border-cream-300/10 bg-ink-700/40">
          <div className="font-mono text-[10px] uppercase tracking-widest text-cream-400 mb-1">
            <span className="text-ember-500">●</span> Replace metadata in place
          </div>
          <div className="text-cream-200 text-sm leading-snug">
            Picking a result rewrites name / artist / album / year / cover / preview / Spotify link on{' '}
            <span className="font-display italic text-cream-50">{replaceTarget.name}</span>. Position,
            BPM, and all transitions stay intact.
          </div>
        </div>
      )}
      <div className="flex border-b border-cream-300/10">
        {[
          { id: 'spotify', label: 'Spotify Search' },
          { id: 'manual', label: isReplacing ? 'Manual Override' : 'Manual Entry' },
        ].map((tb) => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className={`flex-1 py-3 font-mono text-[10px] uppercase tracking-widest transition-colors ${
              tab === tb.id
                ? 'text-cream-50 bg-ink-700 border-b border-ember-500'
                : 'text-cream-400 hover:text-cream-100'
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {tab === 'spotify' && (
        <div className="p-6 space-y-4">
          {!spotify.configured && (
            <div className="space-y-3">
              <div className="font-mono text-[11px] uppercase tracking-widest text-ember-500">
                // SPOTIFY CLIENT NOT CONFIGURED
              </div>
              <div className="text-cream-200 leading-relaxed">
                Add{' '}
                <span className="font-mono text-cream-50 bg-ink-700 px-1.5 py-0.5">
                  VITE_SPOTIFY_CLIENT_ID
                </span>{' '}
                to your <span className="font-mono text-cream-50">.env</span>, then
                restart the dev server.
              </div>
            </div>
          )}

          {spotify.configured && !spotify.isAuthed && (
            <div className="space-y-4 py-2">
              <div className="font-mono text-[10px] uppercase tracking-widest text-cream-400 leading-relaxed">
                Connect to Spotify to search the full catalog. You'll be redirected to
                spotify.com to authorize, then bounced back.
              </div>
              <button
                onClick={spotify.login}
                disabled={!spotify.ready}
                className="bg-ember-500 text-ink-900 font-mono text-[11px] uppercase tracking-widest px-5 py-2 hover:bg-ember-400 transition-colors disabled:opacity-40"
              >
                Connect Spotify →
              </button>
              {spotify.error && (
                <div className="font-mono text-[10px] uppercase tracking-widest text-ember-500 border-l-2 border-ember-500 pl-3 py-1">
                  // {spotify.error}
                </div>
              )}
            </div>
          )}

          {spotify.configured && spotify.isAuthed && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search artist or track…"
                  autoFocus
                  className="flex-1"
                />
                <button
                  onClick={spotify.logout}
                  className="font-mono text-[9px] uppercase tracking-widest text-cream-500 hover:text-ember-500 transition-colors"
                  title="Log out"
                >
                  disconnect
                </button>
              </div>

              {searchErr && (
                <div className="font-mono text-[10px] uppercase tracking-widest text-ember-500 border-l-2 border-ember-500 pl-3 py-1">
                  // {searchErr}
                </div>
              )}

              <div className="max-h-[48vh] overflow-y-auto -mx-1">
                {searching && results.length === 0 && (
                  <div className="font-mono text-[10px] uppercase tracking-widest text-cream-500 py-6 text-center">
                    searching…
                  </div>
                )}
                {!searching && query.trim() && results.length === 0 && !searchErr && (
                  <div className="font-mono text-[10px] uppercase tracking-widest text-cream-500 py-6 text-center">
                    no results
                  </div>
                )}
                {!query.trim() && (
                  <div className="font-mono text-[10px] uppercase tracking-widest text-cream-500 py-6 text-center leading-relaxed">
                    type to search the spotify catalog<br />
                    <span className="text-cream-500/60">click a result to add</span>
                  </div>
                )}
                <ul className="divide-y divide-cream-300/10">
                  {results.map((r) => (
                    <li key={r.spotifyId}>
                      <button
                        onClick={() => pickResult(r)}
                        className="w-full flex items-center gap-3 px-1 py-2.5 hover:bg-ink-700/60 transition-colors text-left group"
                      >
                        <div className="w-11 h-11 bg-ink-700 border border-cream-300/15 flex-shrink-0 overflow-hidden">
                          {r.coverUrl ? (
                            <img
                              src={r.coverUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-display italic text-sm text-cream-200">
                              {r.name.slice(0, 1)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-display text-cream-50 text-[15px] leading-tight truncate">
                            {r.name}
                          </div>
                          <div className="font-mono text-[10px] uppercase tracking-widest text-cream-400 truncate">
                            {r.artist}
                            {r.year ? <span className="text-cream-500"> · {r.year}</span> : null}
                          </div>
                        </div>
                        <div className="font-mono text-[10px] uppercase tracking-widest text-cream-500 group-hover:text-ember-500 transition-colors">
                          add →
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'manual' && (
        <form onSubmit={submit} className="p-6 space-y-4">
          <Field label="Title *">
            <input
              value={form.name}
              onChange={set('name')}
              required
              autoFocus
              placeholder="e.g. Strobe"
              className="w-full"
            />
          </Field>
          <div className="grid grid-cols-[1fr,auto] gap-3">
            <Field label="Artist">
              <input
                value={form.artist}
                onChange={set('artist')}
                placeholder="e.g. Deadmau5"
                className="w-full"
              />
            </Field>
            <Field label="Year">
              <input
                type="number"
                value={form.year}
                onChange={set('year')}
                placeholder="2009"
                className="w-24"
              />
            </Field>
          </div>
          <div className="grid grid-cols-[1fr,auto] gap-3">
            <Field label="Album">
              <input value={form.album} onChange={set('album')} className="w-full" />
            </Field>
            <Field label="BPM">
              <input
                type="number"
                value={form.bpm}
                onChange={set('bpm')}
                placeholder="128"
                min="0"
                max="300"
                className="w-20"
              />
            </Field>
          </div>
          <Field label="Cover Image URL">
            <input
              value={form.coverUrl}
              onChange={set('coverUrl')}
              placeholder="https://…/cover.jpg"
              className="w-full"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Spotify URL">
              <input
                value={form.spotifyUrl}
                onChange={set('spotifyUrl')}
                placeholder="https://open.spotify.com/…"
                className="w-full"
              />
            </Field>
            <Field label="Preview MP3 URL">
              <input
                value={form.previewUrl}
                onChange={set('previewUrl')}
                placeholder="https://…/preview.mp3"
                className="w-full"
              />
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="font-mono text-[11px] uppercase tracking-widest text-cream-400 hover:text-cream-100 px-3 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-ember-500 text-ink-900 font-mono text-[11px] uppercase tracking-widest px-5 py-2 hover:bg-ember-400 transition-colors"
            >
              {isReplacing ? 'Save Changes →' : 'Add to Set →'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-cream-400 mb-1">
        {label}
      </div>
      {children}
    </div>
  );
}
