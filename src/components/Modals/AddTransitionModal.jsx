import { useEffect, useMemo, useState } from 'react';
import Modal from '../shared/Modal';
import { useGraphStore } from '../../store/graphStore';

export default function AddTransitionModal({ open, onClose }) {
  const songs = useGraphStore((s) => s.songs);
  const transitions = useGraphStore((s) => s.transitions);
  const addTransition = useGraphStore((s) => s.addTransition);
  const selectTransition = useGraphStore((s) => s.selectTransition);

  const sortedSongs = useMemo(
    () =>
      [...songs].sort(
        (a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }) ||
          a.artist.localeCompare(b.artist, undefined, { sensitivity: 'base' })
      ),
    [songs]
  );

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    if (!open) {
      setFrom('');
      setTo('');
    }
  }, [open]);

  const dup = useMemo(
    () =>
      from && to && transitions.some((t) => t.sourceId === from && t.targetId === to),
    [from, to, transitions]
  );

  const submit = (e) => {
    e.preventDefault();
    if (!from || !to || from === to) return;
    if (dup && !confirm('A transition already exists between these songs. Add another anyway?')) return;
    const id = addTransition({ sourceId: from, targetId: to });
    onClose();
    selectTransition(id);
  };

  return (
    <Modal open={open} onClose={onClose} label="ADD TRANSITION · NEW EDGE">
      <form onSubmit={submit} className="p-6 space-y-5">
        <div className="grid grid-cols-[1fr,auto,1fr] items-end gap-3">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-cream-400 mb-1">
              From
            </div>
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              required
              className="w-full"
            >
              <option value="">— select —</option>
              {sortedSongs.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.artist}
                </option>
              ))}
            </select>
          </div>
          <div className="font-display italic text-ember-500 text-3xl pb-1 leading-none">
            →
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-cream-400 mb-1">
              To
            </div>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              required
              className="w-full"
            >
              <option value="">— select —</option>
              {sortedSongs.map((s) => (
                <option key={s.id} value={s.id} disabled={s.id === from}>
                  {s.name} — {s.artist}
                </option>
              ))}
            </select>
          </div>
        </div>

        {dup && (
          <div className="font-mono text-[10px] uppercase tracking-widest text-ember-500 border-l-2 border-ember-500 pl-3 py-1">
            // Duplicate edge exists — submit will confirm
          </div>
        )}
        {from && to && from === to && (
          <div className="font-mono text-[10px] uppercase tracking-widest text-ember-500 border-l-2 border-ember-500 pl-3 py-1">
            // From and To must differ
          </div>
        )}

        <div className="text-cream-300 text-sm leading-relaxed">
          After creating, click the new edge on the canvas to set EQ, FX, BPM Δ, key,
          notes, and rating.
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-[11px] uppercase tracking-widest text-cream-400 hover:text-cream-100 px-3 py-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!from || !to || from === to}
            className="bg-ember-500 text-ink-900 font-mono text-[11px] uppercase tracking-widest px-5 py-2 hover:bg-ember-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Create Edge →
          </button>
        </div>
      </form>
    </Modal>
  );
}
