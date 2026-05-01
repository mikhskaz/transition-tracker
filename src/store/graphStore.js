import { create } from 'zustand';
import { uid } from '../lib/uid';

const blankEQ = () => ({ low: 0, mid: 0, high: 0 });

const snapshot = (state) => ({
  songs: state.songs.map((s) => ({ ...s })),
  transitions: state.transitions.map((t) => ({ ...t, eq: { ...t.eq }, fx: [...t.fx] })),
});

export const useGraphStore = create((set, get) => ({
  songs: [],
  transitions: [],
  selectedSongId: null,
  selectedTransitionId: null,
  panelKind: null,
  history: [],
  future: [],

  addSong(song = {}) {
    const newSong = {
      id: song.id || uid('s'),
      name: song.name || 'Untitled Track',
      artist: song.artist || 'Unknown Artist',
      album: song.album || '',
      year: song.year ?? null,
      coverUrl: song.coverUrl || '',
      previewUrl: song.previewUrl || '',
      spotifyUrl: song.spotifyUrl || '',
      spotifyId: song.spotifyId || '',
      bpm: song.bpm ?? null,
      x: song.x ?? Math.random() * 400 + 200,
      y: song.y ?? Math.random() * 300 + 150,
    };
    get()._pushHistory();
    set((state) => ({ songs: [...state.songs, newSong] }));
    return newSong.id;
  },

  updateSong(id, patch) {
    get()._pushHistory();
    set((state) => ({
      songs: state.songs.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  },

  removeSong(id) {
    get()._pushHistory();
    set((state) => ({
      songs: state.songs.filter((s) => s.id !== id),
      transitions: state.transitions.filter((t) => t.sourceId !== id && t.targetId !== id),
      selectedSongId: state.selectedSongId === id ? null : state.selectedSongId,
      panelKind: state.selectedSongId === id ? null : state.panelKind,
    }));
  },

  setSongPosition(id, x, y) {
    set((state) => ({
      songs: state.songs.map((s) => (s.id === id ? { ...s, x, y } : s)),
    }));
  },

  beginDrag() {
    get()._pushHistory();
  },

  addTransition(t = {}) {
    const now = new Date().toISOString();
    const newT = {
      id: t.id || uid('t'),
      sourceId: t.sourceId,
      targetId: t.targetId,
      label: t.label || '',
      notes: t.notes || '',
      eq: t.eq || blankEQ(),
      fx: t.fx || [],
      bpmDelta: t.bpmDelta ?? null,
      keyCompatibility: t.keyCompatibility || '',
      rating: t.rating || 0,
      createdAt: t.createdAt || now,
      updatedAt: now,
    };
    get()._pushHistory();
    set((state) => ({ transitions: [...state.transitions, newT] }));
    return newT.id;
  },

  updateTransition(id, patch) {
    get()._pushHistory();
    set((state) => ({
      transitions: state.transitions.map((t) =>
        t.id === id
          ? {
              ...t,
              ...patch,
              eq: patch.eq ? { ...t.eq, ...patch.eq } : t.eq,
              fx: patch.fx ?? t.fx,
              updatedAt: new Date().toISOString(),
            }
          : t
      ),
    }));
  },

  removeTransition(id) {
    get()._pushHistory();
    set((state) => ({
      transitions: state.transitions.filter((t) => t.id !== id),
      selectedTransitionId: state.selectedTransitionId === id ? null : state.selectedTransitionId,
      panelKind: state.selectedTransitionId === id ? null : state.panelKind,
    }));
  },

  selectSong(id) {
    set({ selectedSongId: id, selectedTransitionId: null, panelKind: id ? 'song' : null });
  },
  selectTransition(id) {
    set({ selectedTransitionId: id, selectedSongId: null, panelKind: id ? 'transition' : null });
  },
  closePanel() {
    set({ panelKind: null, selectedSongId: null, selectedTransitionId: null });
  },

  loadGraph(songs, transitions, mode = 'replace') {
    get()._pushHistory();
    if (mode === 'merge') {
      set((state) => {
        const songIds = new Set(state.songs.map((s) => s.id));
        const tIds = new Set(state.transitions.map((t) => t.id));
        return {
          songs: [...state.songs, ...songs.filter((s) => !songIds.has(s.id))],
          transitions: [...state.transitions, ...transitions.filter((t) => !tIds.has(t.id))],
        };
      });
    } else {
      set({
        songs,
        transitions,
        selectedSongId: null,
        selectedTransitionId: null,
        panelKind: null,
      });
    }
  },

  clearGraph() {
    get()._pushHistory();
    set({
      songs: [],
      transitions: [],
      selectedSongId: null,
      selectedTransitionId: null,
      panelKind: null,
    });
  },

  _pushHistory() {
    const state = get();
    const snap = snapshot(state);
    set({
      history: [...state.history, snap].slice(-50),
      future: [],
    });
  },

  undo() {
    const { history, future } = get();
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    const current = snapshot(get());
    set({
      ...prev,
      history: history.slice(0, -1),
      future: [current, ...future].slice(0, 50),
    });
  },

  redo() {
    const { history, future } = get();
    if (future.length === 0) return;
    const next = future[0];
    const current = snapshot(get());
    set({
      ...next,
      history: [...history, current].slice(-50),
      future: future.slice(1),
    });
  },
}));
