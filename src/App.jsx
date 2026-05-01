import { useEffect, useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { AnimatePresence, motion } from 'framer-motion';
import TopBar from './components/TopBar';
import GraphCanvas from './components/Canvas/GraphCanvas';
import GraphToolbar from './components/Toolbar/GraphToolbar';
import EmptyState from './components/EmptyState';
import SongDetailPanel from './components/Panels/SongDetailPanel';
import TransitionDetailPanel from './components/Panels/TransitionDetailPanel';
import AddSongModal from './components/Modals/AddSongModal';
import AddTransitionModal from './components/Modals/AddTransitionModal';
import { useGraphStore } from './store/graphStore';
import { useAutosave, readAutosave, clearAutosave } from './hooks/useAutosave';

export default function App() {
  const songs = useGraphStore((s) => s.songs);
  const panelKind = useGraphStore((s) => s.panelKind);
  const undo = useGraphStore((s) => s.undo);
  const redo = useGraphStore((s) => s.redo);
  const loadGraph = useGraphStore((s) => s.loadGraph);
  const addTransition = useGraphStore((s) => s.addTransition);
  const selectTransition = useGraphStore((s) => s.selectTransition);

  const [addSongOpen, setAddSongOpen] = useState(false);
  const [addTransOpen, setAddTransOpen] = useState(false);
  const [autosave, setAutosave] = useState(null);
  const [connectPrompt, setConnectPrompt] = useState(null); // { fromId, toId }
  const [matchTarget, setMatchTarget] = useState(null); // song to replace via Spotify

  useAutosave();

  // Check for autosave on mount
  useEffect(() => {
    const auto = readAutosave();
    if (auto && (auto.songs?.length || auto.transitions?.length)) {
      setAutosave(auto);
    }
  }, []);

  // While Shift is held: disable text selection page-wide (so shift+drag from a
  // handle to connect doesn't paint a text-selection across the UI).
  useEffect(() => {
    const onDown = (e) => {
      if (e.key === 'Shift') document.body.classList.add('shift-held');
    };
    const onUp = (e) => {
      if (e.key === 'Shift') document.body.classList.remove('shift-held');
    };
    const onBlur = () => document.body.classList.remove('shift-held');
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      const cmd = e.metaKey || e.ctrlKey;
      const tag = e.target?.tagName;
      const editing = tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable;

      if (cmd && e.key.toLowerCase() === 'z') {
        if (editing) return;
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
      if (cmd && e.key.toLowerCase() === 'y') {
        if (editing) return;
        e.preventDefault();
        redo();
      }
      if ((cmd && e.key.toLowerCase() === 'k') || (e.key === '/' && !editing)) {
        e.preventDefault();
        setAddSongOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo]);

  const restore = () => {
    loadGraph(autosave.songs, autosave.transitions, 'replace');
    setAutosave(null);
  };
  const dismiss = () => {
    clearAutosave();
    setAutosave(null);
  };

  return (
    <ReactFlowProvider>
      <div className="h-screen flex flex-col relative">
        <TopBar />
        <div className="relative flex-1 flex min-h-0">
          <div className="relative flex-1">
            <GraphCanvas />
            {songs.length === 0 && (
              <EmptyState onAddSong={() => setAddSongOpen(true)} />
            )}
            <GraphToolbar
              onAddSong={() => setAddSongOpen(true)}
              onAddTransition={() => setAddTransOpen(true)}
            />

            {/* corner micro-info */}
            <div className="absolute bottom-4 left-6 z-10 font-mono text-[9px] uppercase tracking-widest text-cream-500 leading-relaxed pointer-events-none">
              <div>
                ⌘Z undo · ⌘⇧Z redo · ⌘K add song
              </div>
              <div className="text-cream-500/60">
                autosaved to localStorage every 1s
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {panelKind && (
              <motion.aside
                key={panelKind}
                initial={{ x: 480, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 480, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 30 }}
                className="w-[440px] flex-shrink-0 border-l border-cream-300/10 bg-ink-800/90 backdrop-blur-md"
              >
                {panelKind === 'song' && (
                  <SongDetailPanel onMatchSpotify={setMatchTarget} />
                )}
                {panelKind === 'transition' && <TransitionDetailPanel />}
              </motion.aside>
            )}
          </AnimatePresence>
        </div>

        {/* Autosave restore banner */}
        <AnimatePresence>
          {autosave && (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 240, damping: 24 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 bg-ink-700/95 backdrop-blur-md border border-cream-300/20 px-6 py-4 max-w-md shadow-2xl"
            >
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-cream-400 mb-2">
                <span className="w-1.5 h-1.5 bg-acid-500 rounded-full animate-pulse" />
                Previous Session Found
              </div>
              <div className="text-cream-100 text-sm mb-3 leading-relaxed">
                Last saved{' '}
                <span className="font-mono text-cream-50">
                  {new Date(autosave.savedAt).toLocaleString(undefined, {
                    month: 'short',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>{' '}
                — <span className="tabular">{autosave.songs.length}</span> nodes,{' '}
                <span className="tabular">{autosave.transitions.length}</span> edges.
              </div>
              <div className="flex gap-2">
                <button
                  onClick={restore}
                  className="bg-ember-500 text-ink-900 font-mono text-[10px] uppercase tracking-widest px-3 py-2 hover:bg-ember-400 transition-colors"
                >
                  Resume Session →
                </button>
                <button
                  onClick={dismiss}
                  className="border border-cream-300/30 font-mono text-[10px] uppercase tracking-widest px-3 py-2 hover:border-ember-500 hover:text-ember-500 transition-colors"
                >
                  Start Fresh
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* "Connect to most recent?" prompt after adding a song */}
        <AnimatePresence>
          {connectPrompt && (() => {
            const from = songs.find((s) => s.id === connectPrompt.fromId);
            const to = songs.find((s) => s.id === connectPrompt.toId);
            if (!from || !to) return null;
            const accept = () => {
              const id = addTransition({
                sourceId: connectPrompt.fromId,
                targetId: connectPrompt.toId,
              });
              setConnectPrompt(null);
              selectTransition(id);
            };
            const dismiss = () => setConnectPrompt(null);
            return (
              <motion.div
                key={`${connectPrompt.fromId}->${connectPrompt.toId}`}
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 80, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 bg-ink-700/95 backdrop-blur-md border border-cream-300/20 px-6 py-4 max-w-lg shadow-2xl"
              >
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-cream-400 mb-2">
                  <span className="w-1.5 h-1.5 bg-ember-500 rounded-full animate-pulse" />
                  Chain to last song?
                </div>
                <div className="text-cream-100 text-sm mb-3 leading-relaxed">
                  Add transition{' '}
                  <span className="font-display italic text-cream-50">{from.name}</span>{' '}
                  <span className="text-ember-500">→</span>{' '}
                  <span className="font-display italic text-cream-50">{to.name}</span>
                  ?
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={accept}
                    className="bg-ember-500 text-ink-900 font-mono text-[10px] uppercase tracking-widest px-3 py-2 hover:bg-ember-400 transition-colors"
                  >
                    Yes, connect →
                  </button>
                  <button
                    onClick={dismiss}
                    className="border border-cream-300/30 font-mono text-[10px] uppercase tracking-widest px-3 py-2 hover:border-ember-500 hover:text-ember-500 transition-colors"
                  >
                    No
                  </button>
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>

        <AddSongModal
          open={addSongOpen || !!matchTarget}
          replaceTarget={matchTarget}
          onClose={() => {
            setAddSongOpen(false);
            setMatchTarget(null);
          }}
          onAfterAdd={(newId, prevId) => {
            if (prevId && prevId !== newId) {
              setConnectPrompt({ fromId: prevId, toId: newId });
            }
          }}
        />
        <AddTransitionModal
          open={addTransOpen}
          onClose={() => setAddTransOpen(false)}
        />
      </div>
    </ReactFlowProvider>
  );
}
