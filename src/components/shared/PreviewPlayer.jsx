import { useEffect, useRef, useState } from 'react';

export default function PreviewPlayer({ url }) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setPlaying(false);
    setProgress(0);
    if (ref.current) ref.current.pause();
  }, [url]);

  const toggle = () => {
    if (!ref.current) return;
    if (playing) {
      ref.current.pause();
    } else {
      ref.current.play().catch(() => {});
    }
    setPlaying((p) => !p);
  };

  const onTime = () => {
    if (!ref.current?.duration) return;
    setProgress(ref.current.currentTime / ref.current.duration);
  };

  return (
    <div className="flex items-center gap-4 py-2">
      <button
        onClick={toggle}
        className="w-11 h-11 border border-cream-300/30 hover:border-ember-500 hover:text-ember-500 flex items-center justify-center transition-colors text-sm"
      >
        {playing ? '❚❚' : '▶'}
      </button>
      <div className="flex-1">
        <div className="font-mono text-[10px] uppercase tracking-widest text-cream-400 mb-1.5">
          {playing ? 'Now playing · 30s preview' : 'Preview · 30s'}
        </div>
        <div className="h-px bg-cream-300/15 relative">
          <div
            className="absolute left-0 top-0 h-full bg-ember-500 transition-all"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
      <audio
        ref={ref}
        src={url}
        onEnded={() => {
          setPlaying(false);
          setProgress(0);
        }}
        onTimeUpdate={onTime}
        preload="none"
      />
    </div>
  );
}
