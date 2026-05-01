import { motion } from 'framer-motion';

export default function EmptyState({ onAddSong }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[5]">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="text-center pointer-events-auto px-6 max-w-2xl"
      >
        <div className="font-mono text-[10px] uppercase tracking-widest text-cream-400 mb-5 flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-cream-300/30" />
          Blank Cartridge
          <span className="h-px w-10 bg-cream-300/30" />
        </div>

        <div className="font-display text-cream-50 leading-[0.95] mb-4">
          <div className="text-5xl md:text-7xl">
            <span className="italic">Begin</span>
          </div>
          <div className="text-5xl md:text-7xl">
            <span className="italic">your</span>{' '}
            <span className="text-ember-500 italic">set</span>.
          </div>
        </div>

        <div className="text-cream-300 max-w-md mx-auto mb-8 leading-relaxed">
          Map every blend you build. Drop tracks onto the canvas, draw transitions
          between them, and annotate each edge with EQ moves, FX, BPM Δ, and notes
          you'll want come gig night.
        </div>

        <button
          onClick={onAddSong}
          className="bg-ember-500 text-ink-900 px-6 py-3 font-mono text-[11px] uppercase tracking-widest hover:bg-ember-400 transition-colors inline-flex items-center gap-3 group"
        >
          <span className="text-lg leading-none group-hover:rotate-90 transition-transform">
            +
          </span>
          Add First Song
        </button>

        <div className="mt-10 grid grid-cols-3 gap-6 font-mono text-[10px] uppercase tracking-widest text-cream-500 max-w-md mx-auto">
          <div>
            <div className="text-cream-100 tabular text-2xl font-display not-italic mb-1">
              01
            </div>
            Drag<br />nodes
          </div>
          <div>
            <div className="text-cream-100 tabular text-2xl font-display not-italic mb-1">
              02
            </div>
            Shift+drag<br />to connect
          </div>
          <div>
            <div className="text-cream-100 tabular text-2xl font-display not-italic mb-1">
              03
            </div>
            Click edges<br />to annotate
          </div>
        </div>
      </motion.div>
    </div>
  );
}
