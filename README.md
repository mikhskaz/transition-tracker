<p align="center">
  <img src="public/favicon.svg" alt="Transition Tracker" width="96">
</p>
<h1 align="center">Transition Tracker</h1>
<p align="center">
    <em>A directed-graph cartographer for DJ sets. Map the tracks, draw the transitions, annotate every blend.</em>
</p>
<p align="center">
<a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/license-MIT-FF4D17?style=for-the-badge" alt="License: MIT">
</a>
<a href="https://react.dev">
    <img src="https://img.shields.io/badge/React-18-0A0907?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 18">
</a>
<a href="https://vitejs.dev">
    <img src="https://img.shields.io/badge/Vite-5-0A0907?style=for-the-badge&logo=vite&logoColor=646CFF" alt="Vite 5">
</a>
<a href="https://reactflow.dev">
    <img src="https://img.shields.io/badge/React%20Flow-11-0A0907?style=for-the-badge" alt="React Flow 11">
</a>
<a href="https://tailwindcss.com">
    <img src="https://img.shields.io/badge/Tailwind-CSS-0A0907?style=for-the-badge&logo=tailwindcss&logoColor=06B6D4" alt="Tailwind CSS">
</a>
<a href="https://developer.spotify.com">
    <img src="https://img.shields.io/badge/Spotify-Web%20API-0A0907?style=for-the-badge&logo=spotify&logoColor=1DB954" alt="Spotify Web API">
</a>
</p>

---

**Source Code**: <a href="https://github.com/mikhskaz/transition-tracker">https://github.com/mikhskaz/transition-tracker</a>

---

Transition Tracker is a browser-based, no-backend tool for the part of DJing that lives between the tracks. Drop songs onto a canvas, draw directed arrows between them, and annotate each arrow with the EQ moves, FX, BPM delta, key compatibility, and notes you'll actually want when you're standing behind the decks.

The key features are:

* **DJ-first vocabulary**: EQ profile (low / mid / high, ±12 dB), FX chain, BPM delta, key compatibility, free-text notes, and a 1–5 star rating on every transition.
* **Spotify in two clicks**: PKCE auth lives entirely in the browser. Authenticate, search, click a track — name, artist, album, year, cover art, preview URL, and external link land on the canvas instantly.
* **Match-without-breaking**: Already added a song by hand? Click it, hit *Match with Spotify*, pick the right result. Metadata is rewritten in place — every transition you've drawn stays attached.
* **BPM as color**: A curved label tucked into the upper-left of every song, color-graded along a four-stop ramp from black (slow) → dark blue → red → white (200 BPM). Glance at the canvas and you see your set's tempo distribution.
* **Save anywhere**: localStorage autosave with a *Resume previous session?* prompt on startup, plus full Save / Load to a versioned `.json` file.
* **Editorial pro-audio aesthetic**: Warm near-black canvas, cream type, hot ember accents. Fraunces (italic display), Manrope (UI), JetBrains Mono (data). Subtle film grain, sharp 1px borders, tabular numerals throughout.
* **Built for the long press**: Undo / redo with 50-step history. Box-select on left drag. Middle / right-click drag to pan. Drag from the colored dot on a song to connect.

---

## Quickstart

Clone, install, run:

```bash
git clone https://github.com/mikhskaz/transition-tracker.git
cd transition-tracker
npm install
npm run dev
```

Open <a href="http://127.0.0.1:5173">http://127.0.0.1:5173</a>.

That's it. Manual song entry works without any environment configuration — Spotify is purely additive.

---

## Spotify setup (optional)

### Create the app

Create a Spotify app at <a href="https://developer.spotify.com/dashboard">developer.spotify.com</a>. Add this Redirect URI exactly:

```
http://127.0.0.1:5173/callback
```

> **Note**: Spotify deprecated `localhost` for new apps in April 2025. Use the IPv4 form `127.0.0.1` and visit the app at the same origin in the browser. PKCE verifiers live in `sessionStorage`, which is per-origin — mixing `localhost` and `127.0.0.1` will break the auth handshake.

### Configure it

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Fill in your Client ID:

```
VITE_SPOTIFY_CLIENT_ID=your_client_id_here
VITE_SPOTIFY_REDIRECT_URI=http://127.0.0.1:5173/callback
```

Restart the dev server. In the **+ Add Song** modal, the **Spotify Search** tab will now offer **Connect Spotify** — bounce to spotify.com, accept, and you're back with a token (auto-refreshed on 401).

---

## Example: anatomy of a transition

### Add a song

Hit **+ Add Song** in the toolbar (or press <kbd>Ctrl</kbd> + <kbd>K</kbd>). Search Spotify, or fill in the manual fields:

```
Title:   Strobe
Artist:  Deadmau5
Album:   For Lack of a Better Name
Year:    2009
BPM:     128
```

A circle appears on the canvas with album art (or initials, if you didn't provide a cover URL). The BPM renders as a curved color-graded label on the upper-left.

### Connect it

Drag from the **orange dot** on the right side of one song to another song's **cream dot** on the left. A directed arrow is drawn from source → target.

When you add a *second* song, a banner asks *"Chain to last song?"* — accept and the transition is created automatically.

### Annotate it

Click the arrow. The right panel opens with:

* **EQ sliders** (low / mid / high, drag, double-click to reset)
* **FX chain** (chip-style tags — type, press <kbd>Enter</kbd>)
* **BPM Δ** and **key compatibility**
* **Star rating** (1–5)
* **Notes** (free text)
* A clickable `→` arrow in the header that **reverses the transition direction** in place

The rating, BPM delta, and edge label render directly on the bezier curve via SVG `<textPath>`, with a paint-order halo for legibility.

### Save it

Hit **Save .JSON** in the top bar. Your set serializes to:

```json
{
  "version": "1.0",
  "savedAt": "2026-04-30T20:34:00Z",
  "songs": [
    {
      "id": "s_abc123",
      "name": "Strobe",
      "artist": "Deadmau5",
      "album": "For Lack of a Better Name",
      "year": 2009,
      "bpm": 128,
      "coverUrl": "...",
      "previewUrl": "...",
      "spotifyUrl": "...",
      "spotifyId": "...",
      "x": 220, "y": 140
    }
  ],
  "transitions": [
    {
      "id": "t_xyz",
      "sourceId": "s_abc123",
      "targetId": "s_def456",
      "label": "filter sweep into kick swap",
      "notes": "kill lows on src on bar 8...",
      "eq": { "low": -6, "mid": 0, "high": 2 },
      "fx": ["filter", "reverb tail"],
      "bpmDelta": 4,
      "keyCompatibility": "same key",
      "rating": 5,
      "createdAt": "2026-04-30T20:30:00Z",
      "updatedAt": "2026-04-30T20:34:00Z"
    }
  ]
}
```

**Load** validates the schema and prompts *Replace or Merge?* before applying.

---

## Interaction reference

| Gesture | Action |
|---|---|
| Click song | Open Song detail panel |
| Click edge | Open Transition detail panel |
| Drag song | Reposition (one undo step per drag) |
| Drag from colored dot | Draw a transition to another song |
| Drag canvas (left mouse) | Box-select |
| Middle / right-mouse drag | Pan canvas |
| Mouse wheel | Zoom |
| <kbd>Ctrl</kbd> + <kbd>Z</kbd> / <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Z</kbd> | Undo / redo |
| <kbd>Ctrl</kbd> + <kbd>K</kbd> | Open *Add Song* |
| <kbd>Delete</kbd> / <kbd>Backspace</kbd> | Remove selected |
| Click `→` in transition panel | Reverse direction |

---

## Stack

Transition Tracker stands on the shoulders of:

* <a href="https://reactflow.dev">React Flow</a> for the graph canvas, zoom/pan, custom nodes and edges.
* <a href="https://github.com/pmndrs/zustand">Zustand</a> for the single-source-of-truth store, plus a hand-rolled snapshot history for undo/redo.
* <a href="https://www.framer.com/motion/">framer-motion</a> for panel transitions, modal animations, and the empty-state reveal.
* <a href="https://tailwindcss.com">Tailwind CSS</a> for the utility-first styling layer.
* <a href="https://developer.spotify.com/documentation/web-api">Spotify Web API</a> via Authorization Code Flow with PKCE — entirely client-side, no backend.
* <a href="https://github.com/bubkoo/html-to-image">html-to-image</a> for PNG export.
* <a href="https://github.com/ai/nanoid">nanoid</a> for IDs.

No database. No server. No signup. Persistence is `<Blob>` + `<a download>` for files, and `localStorage` for autosave.

---

## Project layout

```
src/
├── components/
│   ├── Canvas/        GraphCanvas, SongNode, TransitionEdge
│   ├── Panels/        SongDetailPanel, TransitionDetailPanel
│   ├── Modals/        AddSongModal, AddTransitionModal, base Modal
│   ├── Toolbar/       GraphToolbar
│   ├── shared/        EQSliders, StarRating, PreviewPlayer
│   ├── TopBar.jsx
│   └── EmptyState.jsx
├── store/
│   └── graphStore.js  Single-source-of-truth + 50-step history
├── hooks/
│   ├── useAutosave.js Debounced localStorage subscription
│   └── useSpotify.js  PKCE flow + search + token refresh
├── lib/
│   ├── fileIO.js      JSON save/load + schema validation
│   ├── graphExport.js html-to-image PNG export
│   ├── bpmColor.js    BPM → 4-stop color interpolation
│   └── uid.js         nanoid wrapper
├── App.jsx
└── main.jsx
```

---

## Design notes

A few decisions worth highlighting, because they aren't obvious from the screen:

* **Floating handle anchors.** Each song's connection dot has a 28×28 hit-zone shifted outward so the box's center lands exactly where the visible 14px dot sits. React Flow uses the box center as the edge anchor — so drawn lines emerge *from the dot*, not from inside the album art. The visible dot scales 1.5× on hover from its own center via a `::before` pseudo-element.

* **Edge labels follow the curve.** Rating, BPM delta, and free-text label render as `<textPath>` along the bezier path, with `paint-order: stroke fill` for a dark halo so the text reads cleanly over both the canvas and the line itself.

* **BPM as a curved label, color-coded.** A `<textPath>` along a 90° arc on the upper-left of each circle, with a soft cream halo for legibility. Fill color is interpolated through four stops (black → dark blue → red → white), so a glance at the canvas tells you the tempo distribution of the whole set.

* **Drag performance.** Live drags update React Flow's local node state via `applyNodeChanges` — they do *not* round-trip through Zustand. Only the final position commits to the global store on drag end. `SongNode` is `React.memo`-wrapped with a custom comparator so updating one song's metadata doesn't re-render the rest.

* **Hand-rolled undo.** Pre-mutation snapshots live on a 50-step ring buffer; undo / redo restore by structural copy. Drag *start* pushes the snapshot, drag *end* commits the new position — so each drag is exactly one undo step, never one per frame.

* **Autosave UX, not autosave hell.** Writes are debounced 1s. On startup, the app checks for a saved session and asks *Resume?* / *Start fresh?* rather than silently restoring. Adding a song while a previous-session prompt is showing replaces the prompt with the newer pair — never queues stale prompts.

* **Match-with-Spotify preserves edges.** Re-matching a hand-typed song against the Spotify catalog rewrites *only* metadata. The song's `id`, position, BPM, and every transition referencing that id stay intact.

* **Shift suppresses text selection globally.** Holding <kbd>Shift</kbd> adds a body-level class that turns off `user-select` everywhere except inputs/textareas — so dragging from a handle while shift is held doesn't accidentally paint a text-selection across the entire UI.

---

## License

This project is licensed under the terms of the MIT license.
