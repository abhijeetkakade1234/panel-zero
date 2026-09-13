# Panel Zero

A short first-person mystery. A manga chapter arrives under your apartment door, depicting a night you haven't lived yet.

Explore an apartment, a hallway, and an enclosed outdoor courtyard before returning home with a missing manga panel. Target playtime: about 8–12 minutes on a first visit. Contains exactly three scripted jumpscares. Browser first, keyboard and mouse. This is a prototype, not the full game.

## Project docs

- [Game brief](docs/GAME.md): premise, playable sequence, visual direction, and scope.
- [Build plan](docs/BUILD.md): implementation decisions, milestones, and acceptance checks.

## Development

Requires Node.js 22.12+ (tested on 22.13.1).

```powershell
cd D:\panel-zero
npm install
npm run dev
```

Open the localhost address Vite prints, normally http://127.0.0.1:5173. Run `npm test` for the story and collision check; run `npm run build` to produce `dist/`, then `npm run preview` to serve that build locally.

For playing without development reloads, stop the dev server and run `npm run prod`. It builds once, then serves the compiled game at http://127.0.0.1:5173. Source edits will not affect that session until you restart the command. This removes development compilation and hot reload; it does not guarantee a higher rendering frame rate.

WASD moves, mouse or arrow keys look, E inspects, and Escape pauses. If mouse capture is unavailable, click and drag or use arrow keys. Pause includes mute and restart. Reading stops movement. Reload starts a new run.

Enter and Resume request browser fullscreen; if the browser blocks it, windowed play still works. Mouse look defaults to a slower speed and can be adjusted with the sensitivity slider in Pause. Reading dialogs stay centered in the visible viewport and scroll on short windows.

The sequence includes apartment exploration, Mrs. Arai in 402, a lying manga chapter, the red-light decision, an outdoor paper-boat/fuse/storm-drain investigation, and two endings reached by returning home. No AI API or paid service is required to play.

## Current limits

This is a compact prototype with modeled geometry and generated comic illustrations. Its realtime art is simpler than the painted concept. It uses text dialogue and synthesized ambience; there is no recorded voice acting. Keyboard-and-mouse desktop play is the target. Mobile layouts show a notice, but touch gameplay is not implemented.

There is no save system or desktop package. The large-chunk notice from Vite refers mainly to the bundled 3D renderer; it does not prevent the build. See [build notes](docs/BUILD.md) and [asset notes](docs/ART.md).
