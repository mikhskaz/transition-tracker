import { useGraphStore } from '../../store/graphStore';

export default function GraphToolbar({ onAddSong, onAddTransition }) {
  const undo = useGraphStore((s) => s.undo);
  const redo = useGraphStore((s) => s.redo);
  const canUndo = useGraphStore((s) => s.history.length > 0);
  const canRedo = useGraphStore((s) => s.future.length > 0);
  const songs = useGraphStore((s) => s.songs);

  return (
    <div className="absolute top-6 left-6 z-20 flex flex-col gap-2 w-44">
      <div className="font-mono text-[9px] uppercase tracking-widest text-cream-500 mb-1 px-1">
        — Actions —
      </div>
      <button
        onClick={onAddSong}
        className="bg-ember-500 text-ink-900 px-4 py-3 font-mono text-[11px] uppercase tracking-widest hover:bg-ember-400 transition-colors flex items-center gap-3 group"
      >
        <span className="text-lg leading-none group-hover:rotate-90 transition-transform">
          +
        </span>
        Add Song
      </button>
      <button
        onClick={onAddTransition}
        disabled={songs.length < 2}
        className="bg-ink-800/90 backdrop-blur-sm border border-cream-300/30 px-4 py-3 font-mono text-[11px] uppercase tracking-widest hover:border-ember-500 hover:text-ember-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-3"
      >
        <span className="font-display italic text-lg leading-none">→</span>
        Transition
      </button>
      <div className="h-px bg-cream-300/10 my-1" />
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="bg-ink-800/90 backdrop-blur-sm border border-cream-300/30 px-2 py-2 font-mono text-[10px] uppercase tracking-widest hover:border-ember-500 hover:text-ember-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Undo (Ctrl+Z)"
        >
          ↶ Undo
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="bg-ink-800/90 backdrop-blur-sm border border-cream-300/30 px-2 py-2 font-mono text-[10px] uppercase tracking-widest hover:border-ember-500 hover:text-ember-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Redo (Ctrl+Shift+Z)"
        >
          ↷ Redo
        </button>
      </div>
      <div className="font-mono text-[9px] uppercase tracking-widest text-cream-500 mt-3 leading-relaxed px-1">
        Drag from dot<br />to connect<br /><br />
        Drag canvas<br />= box select<br /><br />
        Mid/right<br />drag = pan
      </div>
    </div>
  );
}
