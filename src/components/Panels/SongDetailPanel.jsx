import { useGraphStore } from '../../store/graphStore';
import PreviewPlayer from '../shared/PreviewPlayer';

export default function SongDetailPanel({ onMatchSpotify }) {
  const songId = useGraphStore((s) => s.selectedSongId);
  const song = useGraphStore((s) => s.songs.find((x) => x.id === songId));
  const songs = useGraphStore((s) => s.songs);
  const transitions = useGraphStore((s) => s.transitions);
  const updateSong = useGraphStore((s) => s.updateSong);
  const removeSong = useGraphStore((s) => s.removeSong);
  const closePanel = useGraphStore((s) => s.closePanel);
  const selectTransition = useGraphStore((s) => s.selectTransition);

  if (!song) return null;

  const outgoing = transitions.filter((t) => t.sourceId === song.id);
  const incoming = transitions.filter((t) => t.targetId === song.id);
  const nameOf = (id) => songs.find((s) => s.id === id)?.name ?? id;
  const initials = (song.name || '??').slice(0, 2).toUpperCase();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-7 pt-6 pb-4 border-b border-cream-300/10">
        <div className="flex items-center justify-between">
          <div className="font-mono text-[10px] uppercase tracking-widest text-cream-400">
            <span className="text-ember-500">●</span> SONG · <span className="tabular">{song.id.slice(-8)}</span>
          </div>
          <button
            onClick={closePanel}
            className="font-mono text-[10px] uppercase tracking-widest text-cream-400 hover:text-ember-500 transition-colors"
          >
            close ✕
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-7 py-6 space-y-7">
        {/* Cover + identity */}
        <div className="flex gap-5">
          <div className="w-28 h-28 bg-ink-700 border border-cream-300/15 overflow-hidden flex-shrink-0">
            {song.coverUrl ? (
              <img
                src={song.coverUrl}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-display italic text-4xl text-cream-200 bg-gradient-to-br from-ink-600 to-ink-800">
                {initials}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <input
              value={song.name}
              onChange={(e) => updateSong(song.id, { name: e.target.value })}
              className="!p-1 !bg-transparent !border-0 font-display text-2xl text-cream-50 leading-tight w-full focus:!bg-ink-900/50"
            />
            <input
              value={song.artist}
              onChange={(e) => updateSong(song.id, { artist: e.target.value })}
              className="!p-1 !bg-transparent !border-0 text-cream-200 w-full mt-1 focus:!bg-ink-900/50"
            />
            <div className="flex gap-2 mt-2 items-center">
              <input
                value={song.album}
                onChange={(e) => updateSong(song.id, { album: e.target.value })}
                placeholder="ALBUM"
                className="!p-1 !bg-transparent !border-0 font-mono text-[11px] uppercase tracking-widest text-cream-400 flex-1 focus:!bg-ink-900/50"
              />
              <input
                type="number"
                value={song.bpm ?? ''}
                onChange={(e) =>
                  updateSong(song.id, {
                    bpm: e.target.value ? Number(e.target.value) : null,
                  })
                }
                placeholder="BPM"
                className="!p-1 !bg-transparent !border-0 font-mono text-[11px] uppercase tracking-widest text-cream-400 w-12 focus:!bg-ink-900/50"
              />
              <input
                type="number"
                value={song.year ?? ''}
                onChange={(e) =>
                  updateSong(song.id, {
                    year: e.target.value ? Number(e.target.value) : null,
                  })
                }
                placeholder="YEAR"
                className="!p-1 !bg-transparent !border-0 font-mono text-[11px] uppercase tracking-widest text-cream-400 w-16 focus:!bg-ink-900/50"
              />
            </div>
          </div>
        </div>

        {/* URLs */}
        <div className="space-y-3">
          <Field label="Cover URL">
            <input
              value={song.coverUrl || ''}
              onChange={(e) => updateSong(song.id, { coverUrl: e.target.value })}
              className="w-full"
              placeholder="https://…"
            />
          </Field>
          <Field label="Spotify URL">
            <input
              value={song.spotifyUrl || ''}
              onChange={(e) => updateSong(song.id, { spotifyUrl: e.target.value })}
              className="w-full"
              placeholder="https://open.spotify.com/track/…"
            />
          </Field>
          <Field label="Preview MP3 URL">
            <input
              value={song.previewUrl || ''}
              onChange={(e) => updateSong(song.id, { previewUrl: e.target.value })}
              className="w-full"
              placeholder="https://…/preview.mp3"
            />
          </Field>
        </div>

        {song.previewUrl && <PreviewPlayer url={song.previewUrl} />}

        <div className="flex items-center gap-4 flex-wrap">
          {onMatchSpotify && (
            <button
              onClick={() => onMatchSpotify(song)}
              className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest border border-cream-300/30 px-3 py-2 hover:border-ember-500 hover:text-ember-500 transition-colors"
              title="Find this track on Spotify and rewrite metadata in place — transitions are preserved"
            >
              {song.spotifyId ? 'Re-match with Spotify ↻' : 'Match with Spotify ↻'}
            </button>
          )}
          {song.spotifyUrl && (
            <a
              href={song.spotifyUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-ember-500 hover:text-ember-400 transition-colors"
            >
              Open in Spotify ↗
            </a>
          )}
        </div>

        {/* Transitions */}
        <div className="grid grid-cols-2 gap-5 pt-2">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-cream-400 mb-2">
              ↳ Out · <span className="text-cream-100 tabular">{String(outgoing.length).padStart(2, '0')}</span>
            </div>
            <div className="space-y-1.5">
              {outgoing.map((t) => (
                <button
                  key={t.id}
                  onClick={() => selectTransition(t.id)}
                  className="text-left w-full text-sm text-cream-100 hover:text-ember-500 transition-colors truncate flex items-center gap-2"
                >
                  <span className="text-ember-500">→</span>
                  <span className="truncate">{nameOf(t.targetId)}</span>
                </button>
              ))}
              {outgoing.length === 0 && (
                <div className="text-cream-500 text-xs italic">no outgoing</div>
              )}
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-cream-400 mb-2">
              ↲ In · <span className="text-cream-100 tabular">{String(incoming.length).padStart(2, '0')}</span>
            </div>
            <div className="space-y-1.5">
              {incoming.map((t) => (
                <button
                  key={t.id}
                  onClick={() => selectTransition(t.id)}
                  className="text-left w-full text-sm text-cream-100 hover:text-ember-500 transition-colors truncate flex items-center gap-2"
                >
                  <span className="text-cream-400">←</span>
                  <span className="truncate">{nameOf(t.sourceId)}</span>
                </button>
              ))}
              {incoming.length === 0 && (
                <div className="text-cream-500 text-xs italic">no incoming</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-7 py-4 border-t border-cream-300/10">
        <button
          onClick={() => {
            if (confirm('Delete this song and all its transitions?')) removeSong(song.id);
          }}
          className="font-mono text-[10px] uppercase tracking-widest text-cream-400 hover:text-ember-500 transition-colors"
        >
          Delete Song
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
