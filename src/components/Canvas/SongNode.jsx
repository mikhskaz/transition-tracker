import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { useGraphStore } from '../../store/graphStore';
import { bpmColor } from '../../lib/bpmColor';

// Handles are 28px transparent hitboxes; the visible dot is drawn as a ::before
// pseudo-element pinned tangent to the circle's perimeter (see index.css).
const handleClass = 'handle-tt';

function SongNode({ id, data }) {
  const { song } = data;
  const selected = useGraphStore((s) => s.selectedSongId === id);
  const initials = (song.name || '??').slice(0, 2).toUpperCase();

  return (
    <div className="group relative select-none">
      <div
        className={`relative flex flex-col items-center transition-transform duration-200 ${
          selected ? 'scale-105' : 'group-hover:scale-[1.02]'
        }`}
      >
        {/* Circle wrapper: holds handles AND the clipped image. Not overflow-hidden
            so handles can sit on the perimeter without being clipped. */}
        <div className="relative w-24 h-24">
          <Handle
            type="target"
            position={Position.Left}
            className={`${handleClass} ${handleClass}--target`}
          />
          <Handle
            type="source"
            position={Position.Right}
            className={`${handleClass} ${handleClass}--source`}
          />

          <div
            className={`absolute inset-0 rounded-full overflow-hidden border bg-ink-700 transition-all ${
              selected
                ? 'border-ember-500 shadow-[0_0_0_3px_rgba(255,77,23,0.18),0_8px_28px_rgba(255,77,23,0.25)]'
                : 'border-cream-300/30 group-hover:border-cream-200/60'
            }`}
          >
            {song.coverUrl ? (
              <img
                src={song.coverUrl}
                alt=""
                draggable={false}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-display italic text-3xl text-cream-100 bg-gradient-to-br from-ink-600 to-ink-800">
                {initials}
              </div>
            )}
            <div className="absolute inset-0 ring-1 ring-inset ring-ink-900/40 rounded-full pointer-events-none" />
          </div>

          {song.bpm != null && (
            <svg
              className="absolute inset-0 pointer-events-none"
              width="100%"
              height="100%"
              viewBox="0 0 96 96"
              style={{ overflow: 'visible' }}
              aria-hidden="true"
            >
              <defs>
                {/* Arc on the upper-left, radius 56 (8px outside the song circle).
                    Sweep clockwise from 9 o'clock to 12 o'clock, ~90° of arc. */}
                <path
                  id={`bpm-arc-${id}`}
                  d="M -8 48 A 56 56 0 0 1 48 -8"
                  fill="none"
                />
              </defs>
              <text
                fill={bpmColor(song.bpm)}
                stroke="#F2EBD7"
                strokeWidth="2.5"
                strokeOpacity="0.55"
                strokeLinejoin="round"
                paintOrder="stroke"
                style={{
                  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: '0.18em',
                }}
              >
                <textPath
                  href={`#bpm-arc-${id}`}
                  startOffset="50%"
                  textAnchor="middle"
                >
                  {song.bpm} BPM
                </textPath>
              </text>
            </svg>
          )}
        </div>

        <div className="mt-3 text-center max-w-[180px] pointer-events-none">
          <div className="font-display text-cream-50 leading-tight text-[15px] line-clamp-2">
            {song.name}
          </div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-cream-400 mt-1 truncate">
            {song.artist}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(
  SongNode,
  (prev, next) => prev.id === next.id && prev.data.song === next.data.song
);
