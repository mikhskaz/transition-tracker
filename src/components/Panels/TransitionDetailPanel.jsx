import { useState } from 'react';
import { useGraphStore } from '../../store/graphStore';
import EQSliders from '../shared/EQSliders';
import StarRating from '../shared/StarRating';

export default function TransitionDetailPanel() {
  const id = useGraphStore((s) => s.selectedTransitionId);
  const t = useGraphStore((s) => s.transitions.find((x) => x.id === id));
  const songs = useGraphStore((s) => s.songs);
  const updateTransition = useGraphStore((s) => s.updateTransition);
  const removeTransition = useGraphStore((s) => s.removeTransition);
  const closePanel = useGraphStore((s) => s.closePanel);
  const selectSong = useGraphStore((s) => s.selectSong);

  const [fxInput, setFxInput] = useState('');

  const transitions = useGraphStore((s) => s.transitions);

  if (!t) return null;
  const source = songs.find((s) => s.id === t.sourceId);
  const target = songs.find((s) => s.id === t.targetId);

  const reverse = () => {
    const reverseDup = transitions.some(
      (x) => x.id !== t.id && x.sourceId === t.targetId && x.targetId === t.sourceId
    );
    if (
      reverseDup &&
      !confirm('A transition already exists in the opposite direction. Reverse anyway?')
    ) {
      return;
    }
    updateTransition(t.id, { sourceId: t.targetId, targetId: t.sourceId });
  };

  const addFx = () => {
    const v = fxInput.trim();
    if (!v || t.fx.includes(v)) {
      setFxInput('');
      return;
    }
    updateTransition(t.id, { fx: [...t.fx, v] });
    setFxInput('');
  };
  const removeFx = (v) =>
    updateTransition(t.id, { fx: t.fx.filter((x) => x !== v) });

  return (
    <div className="h-full flex flex-col">
      <div className="px-7 pt-6 pb-4 border-b border-cream-300/10">
        <div className="flex items-center justify-between">
          <div className="font-mono text-[10px] uppercase tracking-widest text-cream-400">
            <span className="text-ember-500">▶</span> TRANSITION ·{' '}
            <span className="tabular">{t.id.slice(-8)}</span>
          </div>
          <button
            onClick={closePanel}
            className="font-mono text-[10px] uppercase tracking-widest text-cream-400 hover:text-ember-500 transition-colors"
          >
            close ✕
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-7 py-6 space-y-7">
        {/* From → To */}
        <div className="space-y-2">
          <div className="font-mono text-[10px] uppercase tracking-widest text-cream-400">
            Edge
          </div>
          <div className="font-display text-[26px] text-cream-50 leading-tight">
            <button
              onClick={() => source && selectSong(source.id)}
              className="italic hover:text-ember-500 transition-colors text-left"
            >
              {source?.name ?? '?'}
            </button>
            <button
              onClick={reverse}
              title="Reverse transition direction"
              className="text-ember-500 mx-3 not-italic align-middle hover:text-ember-400 hover:rotate-180 transition-all duration-300 inline-block"
            >
              →
            </button>
            <button
              onClick={() => target && selectSong(target.id)}
              className="italic hover:text-ember-500 transition-colors text-left"
            >
              {target?.name ?? '?'}
            </button>
          </div>
          <div className="font-mono text-[11px] uppercase tracking-widest text-cream-400">
            {source?.artist} <span className="text-cream-500 mx-1">·</span> {target?.artist}
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center justify-between border-y border-cream-300/10 py-4">
          <div className="font-mono text-[10px] uppercase tracking-widest text-cream-400">
            Rating
          </div>
          <StarRating
            value={t.rating || 0}
            onChange={(v) => updateTransition(t.id, { rating: v })}
          />
        </div>

        {/* Label */}
        <Field label="Edge Label">
          <input
            value={t.label || ''}
            onChange={(e) => updateTransition(t.id, { label: e.target.value })}
            placeholder="e.g. drop swap, vocal blend, kick swap"
            className="w-full"
          />
        </Field>

        {/* EQ */}
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-cream-400 mb-3">
            EQ Profile <span className="text-cream-500">— drag, dbl-click resets</span>
          </div>
          <EQSliders
            value={t.eq}
            onChange={(v) => updateTransition(t.id, { eq: v })}
          />
        </div>

        {/* FX */}
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-cream-400 mb-2">
            FX Chain
          </div>
          <div className="flex gap-2 flex-wrap mb-2 min-h-[1.5rem]">
            {t.fx.length === 0 && (
              <div className="text-cream-500 text-xs italic">no fx</div>
            )}
            {t.fx.map((f) => (
              <span
                key={f}
                className="font-mono text-[10px] uppercase tracking-widest bg-ink-700 border border-cream-300/15 px-2 py-1 inline-flex items-center gap-2"
              >
                {f}
                <button
                  onClick={() => removeFx(f)}
                  className="text-cream-400 hover:text-ember-500 transition-colors"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={fxInput}
              onChange={(e) => setFxInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addFx();
                }
              }}
              placeholder="add effect — filter sweep, reverb tail…"
              className="flex-1"
            />
            <button
              onClick={addFx}
              className="font-mono text-[10px] uppercase tracking-widest border border-cream-300/30 px-4 hover:border-ember-500 hover:text-ember-500 transition-colors"
            >
              add
            </button>
          </div>
        </div>

        {/* BPM + Key */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="BPM Δ (tgt − src)">
            <input
              type="number"
              value={t.bpmDelta ?? ''}
              onChange={(e) =>
                updateTransition(t.id, {
                  bpmDelta: e.target.value === '' ? null : Number(e.target.value),
                })
              }
              placeholder="e.g. +4"
              className="w-full"
            />
          </Field>
          <Field label="Key Match">
            <input
              value={t.keyCompatibility || ''}
              onChange={(e) =>
                updateTransition(t.id, { keyCompatibility: e.target.value })
              }
              placeholder="same key / +1 / relative…"
              className="w-full"
            />
          </Field>
        </div>

        {/* Notes */}
        <Field label="Notes">
          <textarea
            value={t.notes || ''}
            onChange={(e) => updateTransition(t.id, { notes: e.target.value })}
            rows={5}
            className="w-full resize-none"
            placeholder="bring it in over the breakdown, kill lows on src, drop on bar 8…"
          />
        </Field>

        <div className="font-mono text-[10px] uppercase tracking-widest text-cream-500 pt-1 leading-relaxed">
          Created {fmt(t.createdAt)} <span className="mx-1">·</span> Updated{' '}
          {fmt(t.updatedAt)}
        </div>
      </div>

      <div className="px-7 py-4 border-t border-cream-300/10">
        <button
          onClick={() => {
            if (confirm('Delete this transition?')) removeTransition(t.id);
          }}
          className="font-mono text-[10px] uppercase tracking-widest text-cream-400 hover:text-ember-500 transition-colors"
        >
          Delete Transition
        </button>
      </div>
    </div>
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

function fmt(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}
