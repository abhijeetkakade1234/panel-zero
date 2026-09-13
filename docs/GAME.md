# Panel Zero: The tenant in the margins

## Premise

At 00:07, a manga page slides under the door of apartment 404. It shows your room, your cup, and a telephone ringing at 00:08. The final panel shows you standing outside your own door. Someone inside is about to answer.

The player discovers that the chapter describes events only after the player reads them. The missing panel, Panel Zero, shows who has been turning the pages.

## First playable slice

First person is the initial implementation choice. The player explores a compact apartment and corridor with keyboard and mouse. Target first play: roughly five minutes; an informed replay may be much faster.

1. Begin in apartment 404 during a rainy night. A paper near the entrance draws attention. Inspecting household objects supplies optional observations.
2. Read the delivered chapter. It predicts a call and a hallway light going out. The apartment phone starts ringing after the page closes.
3. Answer the phone. Your own voice warns that the woman in 402 will say you are dead. It tells you to follow the next page. Under the voice, a woman whispers: "Keep it on." The entrance can now be opened.
4. Knock on 402. Mrs. Arai remembers your funeral yesterday. You returned and asked her to keep the red light on. Each time it goes out, she forgets your face. She has written your name on her wrist. She says you never owned a telephone.
5. Read the page beneath the red light. It depicts the conversation you just had, but replaces her words with "Turn off the light." Its final panel erases her apartment. The player now has firsthand evidence that the chapter lies.
6. Interact with the night-light switch. Choose "Turn it off" or "Leave it on." Escape backs out without deciding. The choice cannot be reversed during that run.
7. Return to the apartment. If the light went out, 402 is physically covered by a blank wall and your door reads 000. If it stayed on, 402 remains and your door still reads 404. The clock moves to 00:00 or 00:09 respectively.
8. Re-enter the room and inspect a new page on the desk. The room is cold and dim if you obeyed; the desk is warmly lit if you resisted. Both routes have a complete ending and replay.

Optional object descriptions enrich the room but never lock progress. Every required step has an objective hint. An informed replay is short; the expanded sequence targets five to eight minutes with reading and exploration. This is a target, not a measured first-player completion time.

## Story rules and endings

The chapter is an unreliable author. It can rewrite memories when no witness can see what happened. It predicts the player following its instructions because that is how the loop usually goes. The red light gives Mrs. Arai a continuous point of reference; preserving it keeps one witness outside the chapter's control. The game implies this rule through her account and the page's edits rather than explaining the supernatural system in a lecture.

**The delivery:** obey the page. The witness disappears, your apartment becomes 000, and Panel Zero shows you delivering the chapter and making the telephone call. A stack of identical pages is described in the ending. You have become the caller who guided your earlier self into the same choice.

**Outside the frame:** trust the witness. The last physical page on the desk is blank. The ending shows a panel with no instructions, signed on the back by Arai. The clock advances beyond 00:08. A telephone somewhere outside the building rings; you leave it unanswered. The loop is broken locally, but the origin of the chapters remains unresolved.

These are story consequences, not a morality score. The caller has a plausible promise: get home safely. The neighbor offers a contradiction the player can verify. Do not label either button "good ending" or "bad ending."

## Visual direction

Original manga-inspired psychological mystery. Ink-black edges, desaturated blue-green night, bone-colored paper, and a single vermilion accent. The room should feel lived in: wood flooring, desk, cup, books, futon, window blinds, cables, and paper.

Use full-screen 3D with sparse native text overlays. Comic reading switches to a carefully framed page with readable captions outside the illustration. A small crosshair and an interaction prompt support exploration. No dashboard or marketing layout.

Image-generated concept and comic art establish the mood. Actual walkable architecture is 3D geometry: this is an intentional departure from the frontend skill's sprite-oriented game defaults. Geometry supports changing viewpoints, occlusion, and collision. Blender is optional for later bespoke props; it is not required to block out this room.

## Controls and accessibility

- WASD: move; mouse: look; E: inspect or use.
- Arrow keys: look without pointer lock; click and drag: alternative mouse look.
- Escape: pause or close the current reading panel.
- Visible buttons for begin, resume, page close, mute, and replay.
- No timed failure, combat, flashing jump scares, or mandatory sound clues.
- Respect reduced motion, keep captions legible, and stop movement when focus is lost.

Desktop browser is the supported gameplay target. Small screens receive a clear keyboard-and-mouse notice; touch gameplay is outside this slice.

## Scope boundaries

No open world, multiplayer, inventory grid, procedural story, AI dialogue, accounts, backend, or desktop wrapper in this slice. No promise of photorealism. We judge success by whether the room looks intentional and the reveal makes the player want another chapter.

Later decisions follow playtesting: a larger story, character animation, save slots, Blender art, and desktop distribution. Before publication, check title availability and review final asset provenance.
