export function saveGraphToFile(songs, transitions) {
  const payload = {
    version: '1.0',
    savedAt: new Date().toISOString(),
    songs,
    transitions,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  a.download = `transition-tracker-${ts}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function loadGraphFromFile(onLoad) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.onchange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        validateGraphPayload(data);
        onLoad(data.songs, data.transitions);
      } catch (err) {
        alert(`Could not load file: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

export function validateGraphPayload(data) {
  if (!data || typeof data !== 'object') throw new Error('payload is not an object');
  if (typeof data.version !== 'string') throw new Error('missing version string');
  if (!Array.isArray(data.songs)) throw new Error('missing songs array');
  if (!Array.isArray(data.transitions)) throw new Error('missing transitions array');

  const songIds = new Set();
  for (const s of data.songs) {
    if (!s || typeof s !== 'object') throw new Error('song is not an object');
    if (!s.id || !s.name || !s.artist) throw new Error(`song missing id/name/artist (got ${JSON.stringify(s).slice(0, 80)})`);
    songIds.add(s.id);
  }

  for (const t of data.transitions) {
    if (!t || typeof t !== 'object') throw new Error('transition is not an object');
    if (!t.id || !t.sourceId || !t.targetId) throw new Error('transition missing id/sourceId/targetId');
    if (!songIds.has(t.sourceId)) throw new Error(`transition ${t.id} references unknown sourceId ${t.sourceId}`);
    if (!songIds.has(t.targetId)) throw new Error(`transition ${t.id} references unknown targetId ${t.targetId}`);
  }
}
