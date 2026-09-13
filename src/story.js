export const objectives = [
  'Read the page by the door.',
  'The telephone is ringing.',
  'Open the door. Find the red light.',
  'Someone is awake in apartment 402.',
  'Find the loose page beneath the red light.',
  'The page says to turn off the red light. Decide.',
  'Go back to your apartment.',
  'Your room remembers. Inspect the page on the desk.',
  'You have reached Panel Zero.',
];

const sequence = ['page', 'phone', 'door', 'neighbor', 'hallpage', 'switch', 'door', 'finalpage'];
export function advance(stage, object) {
  return sequence[stage] === object ? stage + 1 : stage;
}

// ponytail: axis-aligned bounds cover this flat level; use a physics engine only for vertical traversal.
export function canWalk(x, z, stage) {
  const room = x > -2.75 && x < 2.75 && z > -2.75 && z < 3.65;
  const doorway = (stage >= 3 && stage < 6 || stage >= 7) && x > .05 && x < 1.75 && z > -3.7 && z < -2.5;
  const hall = stage >= 3 && x > -2.75 && x < 2.75 && z > -9.5 && z <= -3.5;
  const desk = x < -1.15 && z > -1.5 && z < 1.6;
  const bed = x > 1.3 && z > .15 && z < 3.55;
  const shelf = x < -1.8 && z < -1.7 && z > -2.75;
  return (room || doorway || hall) && !(room && (desk || bed || shelf));
}
