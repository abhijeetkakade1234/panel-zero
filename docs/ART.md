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
