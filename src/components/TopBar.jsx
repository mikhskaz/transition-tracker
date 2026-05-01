import { useGraphStore } from '../store/graphStore';
import { saveGraphToFile, loadGraphFromFile } from '../lib/fileIO';
import { exportGraphAsPng } from '../lib/graphExport';

export default function TopBar() {
  const songs = useGraphStore((s) => s.songs);
  const transitions = useGraphStore((s) => s.transitions);
  const loadGraph = useGraphStore((s) => s.loadGraph);

  const onSave = () => saveGraphToFile(songs, transitions);

  const onLoad = () =>
    loadGraphFromFile((s, t) => {
      if (songs.length || transitions.length) {
        const replace = confirm(
          'A graph is already loaded.\n\nOK = Replace · Cancel = Merge (deduped by ID)'
        );
        loadGraph(s, t, replace ? 'replace' : 'merge');
      } else {
        loadGraph(s, t, 'replace');
      }
    });

  return (
    <header className="relative z-10 flex items-center justify-between px-8 py-4 border-b border-cream-300/10 bg-ink-900/60 backdrop-blur-sm">
      {/* left: identity */}
      <div className="flex items-baseline gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-ember-500 rounded-full animate-pulse" />
          <div className="font-display italic text-[22px] text-cream-50 leading-none">
            Transition Tracker
          </div>
        </div>
        <div className="hidden md:block font-mono text-[10px] uppercase tracking-widest text-cream-400">
          VOL.01 · SET CARTOGRAPHER
        </div>
      </div>

      {/* center: stats */}
      <div className="hidden lg:flex items-center gap-7 font-mono text-[10px] uppercase tracking-widest text-cream-400">
        <Stat label="Nodes" value={songs.length} />
        <Stat label="Edges" value={transitions.length} />
        <Stat
          label="Density"
          value={
            songs.length > 1
              ? (transitions.length / songs.length).toFixed(1)
              : '0.0'
          }
        />
      </div>

      {/* right: actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => exportGraphAsPng()}
          className="font-mono text-[10px] uppercase tracking-widest border border-cream-300/30 px-3 py-2 hover:border-ember-500 hover:text-ember-500 transition-colors"
          title="Export graph as PNG"
        >
          PNG
        </button>
        <button
          onClick={onLoad}
          className="font-mono text-[10px] uppercase tracking-widest border border-cream-300/30 px-3 py-2 hover:border-ember-500 hover:text-ember-500 transition-colors"
        >
          Load
        </button>
        <button
          onClick={onSave}
          disabled={songs.length === 0}
          className="font-mono text-[10px] uppercase tracking-widest bg-cream-50 text-ink-900 px-4 py-2 hover:bg-ember-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Save .JSON
        </button>
      </div>
    </header>
  );
}

function Stat({ label, value }) {
  return (
    <div className="flex items-baseline gap-2">
      <span>{label}</span>
      <span className="text-cream-100 tabular text-[12px]">
        {typeof value === 'number' ? String(value).padStart(3, '0') : value}
      </span>
    </div>
  );
}
