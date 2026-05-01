// Map BPM (0–200) to a color along: black → dark blue → red → white.
const STOPS = [
  { p: 0,    c: [0, 0, 0] },        // 0 BPM: black
  { p: 0.4,  c: [10, 25, 95] },     // ~80 BPM: dark blue
  { p: 0.7,  c: [200, 30, 25] },    // ~140 BPM: red
  { p: 1,    c: [255, 255, 255] },  // 200 BPM: white
];

export function bpmColor(bpm) {
  if (bpm == null || Number.isNaN(bpm)) return '#9C9479';
  const t = Math.max(0, Math.min(1, Number(bpm) / 200));
  let i = 0;
  while (i < STOPS.length - 1 && t > STOPS[i + 1].p) i++;
  const a = STOPS[i];
  const b = STOPS[i + 1] || a;
  const k = b.p === a.p ? 0 : (t - a.p) / (b.p - a.p);
  const r = Math.round(a.c[0] + k * (b.c[0] - a.c[0]));
  const g = Math.round(a.c[1] + k * (b.c[1] - a.c[1]));
  const bl = Math.round(a.c[2] + k * (b.c[2] - a.c[2]));
  return `rgb(${r}, ${g}, ${bl})`;
}
