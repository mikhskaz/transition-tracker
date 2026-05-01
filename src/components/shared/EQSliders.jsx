import { useRef } from 'react';

function VBand({ label, value, onChange }) {
  const ref = useRef(null);

  const apply = (clientY) => {
    const rect = ref.current.getBoundingClientRect();
    const y = clientY - rect.top;
    const pct = 1 - Math.max(0, Math.min(1, y / rect.height));
    onChange(Math.round(pct * 24 - 12));
  };

  const onPointerDown = (e) => {
    e.preventDefault();
    apply(e.clientY);
    const move = (ev) => apply(ev.clientY);
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const reset = () => onChange(0);

  const fillTop = value >= 0 ? `${50 - (value / 12) * 50}%` : '50%';
  const fillHeight = `${Math.abs((value / 12) * 50)}%`;
  const thumbTop = `calc(${50 - (value / 12) * 50}% - 7px)`;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="font-mono text-[10px] tabular text-cream-100 w-12 text-center">
        {value > 0 ? '+' : ''}
        {value} <span className="text-cream-500">dB</span>
      </div>
      <div
        ref={ref}
        onPointerDown={onPointerDown}
        onDoubleClick={reset}
        className="relative h-44 w-7 cursor-pointer touch-none"
        title="Drag to adjust · double-click to reset"
      >
        {/* tick marks */}
        {[-12, -6, 0, 6, 12].map((tick) => (
          <div
            key={tick}
            className="absolute left-0 right-0 h-px bg-cream-300/15"
            style={{ top: `${50 - (tick / 12) * 50}%` }}
          />
        ))}
        {/* center line stronger */}
        <div className="absolute left-0 right-0 top-1/2 h-px bg-cream-300/40" />
        {/* vertical track */}
        <div className="absolute left-1/2 -translate-x-1/2 w-px h-full bg-cream-300/20" />
        {/* fill */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-[3px] bg-ember-500"
          style={{ top: fillTop, height: fillHeight }}
        />
        {/* thumb */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-6 h-3.5 bg-ember-500 border border-ink-900 transition-transform hover:scale-110"
          style={{ top: thumbTop }}
        />
      </div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-cream-400">
        {label}
      </div>
    </div>
  );
}

export default function EQSliders({ value, onChange }) {
  return (
    <div className="flex gap-7 justify-center py-3 px-2 border border-cream-300/10 bg-ink-900/40">
      <VBand
        label="Low"
        value={value.low}
        onChange={(v) => onChange({ ...value, low: v })}
      />
      <VBand
        label="Mid"
        value={value.mid}
        onChange={(v) => onChange({ ...value, mid: v })}
      />
      <VBand
        label="High"
        value={value.high}
        onChange={(v) => onChange({ ...value, high: v })}
      />
    </div>
  );
}
