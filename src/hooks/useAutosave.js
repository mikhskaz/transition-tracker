import { useEffect } from 'react';
import { useGraphStore } from '../store/graphStore';

const KEY = 'transition-tracker-autosave';
const DEBOUNCE_MS = 1000;

export function useAutosave() {
  useEffect(() => {
    let timer;
    const unsub = useGraphStore.subscribe((state) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        try {
          const payload = {
            version: '1.0',
            savedAt: new Date().toISOString(),
            songs: state.songs,
            transitions: state.transitions,
          };
          localStorage.setItem(KEY, JSON.stringify(payload));
        } catch {
          /* quota / private mode — ignore */
        }
      }, DEBOUNCE_MS);
    });
    return () => {
      clearTimeout(timer);
      unsub();
    };
  }, []);
}

export function readAutosave() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.songs) || !Array.isArray(parsed.transitions)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearAutosave() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
