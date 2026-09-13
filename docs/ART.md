# Art and interface notes

Generated with the built-in Image Gen tool on 2026-09-13. No external artist assets, logos, or character likenesses were supplied. Both source PNGs are retained in this repository; no runtime request goes to an image service.

- `docs/art/apartment-concept.png`: 1536 x 1024 primary gameplay reference.
- `public/art/chapter.png`: 1024 x 1536, three-panel production comic. Used on delivered pages and wall prints. Individual panels are framed with CSS; captions and controls are native HTML.

## Concept prompt

Create one complete primary gameplay screen concept for PANEL ZERO, an original first-person Japanese manga-inspired psychological mystery game. 1536x1024 landscape. Entire image is an implementable 3D scene seen from eye height in a tiny Japanese apartment at midnight. Center-right a weathered pale front door with 404 plaque, a single paper on floor at its foot; left foreground low wooden desk holding black telephone, cream mug and books; far left rain streaked window and blinds with teal night light; right foreground edge of low futon. Warm small desk lamp, blue-green shadows, black ink outlines, restrained cel shading, visible wood floorboards, detailed yet simple modeled architecture. Clear readable scene, not too dark. Sparse native HUD only: upper left small 'PANEL ZERO', under it '00:07'; bottom left 'Read the page by the door.'; bottom right 'WASD move / E inspect'; tiny white central crosshair. Full screen game, no website, no cards, no large title or begin button. Intended real-time Three.js low-poly graphics, elegant atmospheric composition. No people, no gore. This is a visual production reference, geometry will be built in 3D.

## Production comic prompt

Production manga page illustration for original psychological mystery game Panel Zero. Portrait 1024x1536. Three stacked cinematic panels, black ink and gray screentone on bone paper, painstaking architectural detail and unsettling negative space. Top panel: empty tiny Japanese apartment at night, black rotary telephone on wooden desk by rainy window, front door beyond. Middle panel: long apartment corridor under a single vermilion red ceiling lamp, closed doors, distant dark silhouette facing away. Bottom panel: extreme close-up of a human hand sliding a white manga page beneath an apartment door, impossible perspective as if seen from inside the paper. Strong linework, elegant manga composition, original art, no gore. NO text, no speech bubbles, no lettering, no watermark; readable captions will be added by the game as HTML. This is the production comic artifact displayed in a first-person 3D mystery.

## Implementation choices

Paper: #e9e6dc. Interface ink: #192023. Accent: #c35542. Night background: #101a1d. Georgia headings and narrative text; Courier New for clock, controls, and objectives. No font download.

The title screen intentionally adds the game title, premise, start button, chapter name, and controls to the live scene. Gameplay follows the concept's sparse overlay and adds an Escape hint. Reading uses a two-column image/text dialog on desktop and a stacked layout on narrow screens. The decision dialog uses two explicit buttons; Escape leaves the choice unresolved.

The scene uses actual 3D geometry instead of flat terrain or character sprites. Static meshes and outlines are batched. The rendered furniture, weathering, and material detail are simpler than the concept. This is an acknowledged prototype limitation, not a claim of pixel-perfect fidelity. A later art pass can replace visible props with Blender models without changing the story state machine.

## Courtyard and The Fold

Two additional images were made with the built-in Image Gen tool on 2026-09-13:

- `docs/art/courtyard-concept.png`: outdoor gameplay concept, 1536 x 1024. Palette and layout reference for the bench, swing, power cabinet, and drain. The playable area is actual 3D geometry with collision.
- `public/art/fold.png`: original full-body paper creature, 1024 x 1536 RGBA. Used as a camera-facing apparition for the first two scares and as an enlarged image for the final scare. It is an illustration, not a rigged 3D character. The alpha channel was checked.

Creature prompt: "Production transparent character asset for original manga psychological horror game Panel Zero. One full-body front-facing supernatural entity called The Fold. A tall thin adult-sized puppet made from wet folded manga paper, elongated angular paper limbs, oversized creased bone-white mask with two narrow asymmetrical black eye slits and an impossibly long ink-black smile. Draped shredded ink-black paper coat. Hands long angular folded paper fingers. Japanese ink illustration, strong silhouette, desaturated bone white, dirty gray, black, tiny vermilion ink marks. Frightening uncanny non-gory. No clown makeup, no red nose, no balloon, no existing movie character. Isolated on genuinely transparent background, entire body visible with generous margins, no ground shadow, no lettering. Designed as a readable billboard apparition in a realtime 3D courtyard, high contrast face."

Courtyard prompt: "Full gameplay visual concept, landscape 1536x1024, for PANEL ZERO original manga horror game. First-person eye-height view out of a narrow concrete apartment passage into a small enclosed rain-soaked Japanese residential courtyard at midnight. Blue-green night fog, angular ink outlined low-poly architecture, readable lighting. Left a wooden bench with one small cream paper boat beneath a warm lamp; right a rust-red wall mounted fuse cabinet; center beyond an empty abandoned swing frame, far back a barred black storm drain set into the wall with a small red warning lamp above. Puddles on slate stone paving reflect lights. Apartment balconies, utility pipes, fence and sparse weeds frame the yard. No ceiling over the yard, open night sky. Suspense, no creature yet. Simple practical Three.js 3D geometry with intentional cel-shaded look, not photorealism. HUD upper left small PANEL ZERO and 00:08; bottom left Find the paper boat. No other text, no dashboard, no marketing layout. Complete primary outdoor gameplay screen."

The requested film inspiration informs the childhood-memory lure and neighborhood dread. The Fold, Arai, the manga loop, dialogue, and ending consequences belong to this game's original story. Audio stings are synthesized in Web Audio. No film clips, score, dialogue, or branded character assets are used.

## Telephone voice

`public/audio/telephone.ogg` is a 26-second locally synthesized performance of the existing call dialogue. Microsoft David Desktop reads the caller, Microsoft Zira Desktop reads “Keep it on.” Generated with Windows System.Speech using slower SSML pacing, then FFmpeg high/low-pass telephone filtering and loudness normalization. No real person was cloned. The female line is mixed quieter. The clip is bundled locally, uses the game master volume/mute, stops on hang-up or restart, pauses when focus is lost, and can be replayed while the call is open. This is a synthetic prototype performance, not recorded voice acting.
## The Tenant replacement

`public/art/tenant.svg` is an original vector horror asset created for this revision after the external image-generation service hit its usage limit. It uses a tall asymmetrical silhouette, wet mask, red mouth slit, and long hands; it does not reference Pennywise, The IT creature, or any other copyrighted character. It is intentionally a transparent billboard while a future art pass can replace it with a rigged model.
