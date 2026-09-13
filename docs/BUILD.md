# Build plan

## Technical choice

Use Three.js for rendering, Vite for local development and production packaging, and plain JavaScript for the small game and native HTML interface. There is no need for React or a physics engine for one flat room and corridor.

Use explicit story stages and a small pure transition function. Keep scene construction, gameplay, and styling separate where it makes the files easier to read. Use rectangular collision bounds, clamp frame time, and cap pixel ratio. Audio begins only after a user action and has a mute control.

No API keys, network-generated dialogue, remote fonts, or remote runtime assets. Assets ship with the build. Reload starts a new run; persistence is unnecessary for a five-minute slice.

## Milestones

- [x] Write the game brief and technical plan.
- [x] Generate concept and production comic art; record prompts and provenance.
- [x] Build the furnished apartment and corridor with movement and collision.
- [x] Connect the read, call, witness, edited chapter, decision, return, and ending sequence.
- [x] Add sound, pause, alternate camera controls, and replay.
- [x] Verify build, story checks, and browser playthrough; record measured limitations.

## Acceptance checks

1. Fresh install, local server, and production build work with documented commands.
2. Player starts inside the room and cannot walk through walls or the closed entrance.
3. Required interactions work only in range, in the correct story order, and while unpaused.
4. Reading pauses movement. Closing a page restores play without leaving keys stuck.
5. The phone unlocks the hall. Speaking to 402 unlocks the next chapter. The switch decision changes the return door and room; the desk page reaches the corresponding ending.
6. Restart resets position, props, objectives, and story. Optional inspections cannot break progression.
7. Keyboard-only camera controls work, Escape pauses, mute works, and backgrounding pauses play.
8. No broken assets or uncaught console errors in a browser playthrough.
9. Compare concept and rendered game for composition, palette, typography, art, and interface. Record intentional differences instead of claiming a painted image is identical to realtime geometry.
10. Measure a desktop browser frame-time sample. Target 60 fps at 1080p on a recent integrated GPU, but do not claim this target is achieved without hardware evidence.

## Visual comparison

The 1536 x 1024 concept and 1536 x 1024 browser render were opened with image inspection tools. Later narrative dialogs were checked at 1280 x 800.

| Area | Reference and result |
| --- | --- |
| Composition | Door and delivered page remain the forward focal point, desk/window left, futon right. The playable room has wider traversal space. |
| Palette | Blue-green room, warm desk lamp, ink outlines, bone paper, and a red corridor light are preserved. The realtime room is brighter. |
| Typography | Native serif narrative and monospace controls remain readable. The title and chapter dialogs deliberately add UI states absent from the gameplay reference. |
| Asset treatment | The generated comic is used in reading panels and on physical pages. Captions and decision buttons are real HTML. |
| Detail | The realtime models have much simpler materials and weathering than the concept; this remains the principal visual limitation. |
| Visible copy | Gameplay retains PANEL ZERO, 00:07, the opening objective, and movement/inspect hints. An Escape hint is an intentional addition. Later objectives change with story state. |

This prototype preserves the concept's arrangement and mood; it is not a pixel-perfect recreation of the painted reference. The user confirmed the first version was playable and requested further story work, which is the current focus.

## Verification on 2026-09-13

- `npm test`, `npm run build`, and `git diff --check` passed. Vite reports a non-blocking bundle-size notice: approximately 566 kB JavaScript, 145 kB gzip.
- Playwright Chromium completed both branches using keyboard movement and real interaction buttons: page, phone, door, Arai, edited chapter, switch, return to the room, final page, replay. A temporary read-only camera/state probe helped steer the automated player; it was removed afterwards and was never used to advance the story.
- Escape at the decision leaves it unresolved. Both ending replays reset the story. Pause/resume and mute were exercised. A same-key Escape open/close bug was fixed and the pause dialog was verified to stay open.
- Final browser console: no errors or warnings. Final narrow-screen check: 390 x 844 with no horizontal overflow and the keyboard-and-mouse notice visible. Desktop checks used 1280 x 800 and 1536 x 1024. Touch gameplay remains unsupported.
- The in-app browser initially returned `ERR_BLOCKED_BY_CLIENT` for localhost; verification used Playwright instead. The user subsequently confirmed the running game was playable.
- A two-second automated-browser sample recorded 21 animation frames in 2032 ms at 1536 x 1024, about 10 fps. This does not meet the 60 fps target. It is a limited local automation sample with other browser sessions running, not a certified hardware benchmark; actual target-device profiling and further rendering optimization remain open.
- Static geometry is batched by material, and static shadow maps update on story transitions. Art detail, animation, voice acting, hardware performance, and title clearance remain later work.

## Desktop decision

Keep the browser build unless measured limitations justify a move. A desktop wrapper alone does not improve rendering. If the game later needs heavy lighting, many animated characters, or large streamed levels, evaluate a native engine before expanding the web implementation.
