export const objectives = [
  'Read the page by the door.',
  'The telephone is ringing.',
  'Open the door. Find the red light.',
  'Someone is awake in apartment 402.',
  'Find the loose page beneath the red light.',
  'The page says to turn off the red light. Decide.',
  'The service door is unlocked. Go outside.',
  'Find the paper boat on the courtyard bench.',
  'Take the fuse to the red power cabinet.',
  'The storm drain is calling. Retrieve the missing panel.',
  'Get back inside. Return to your apartment.',
  'Your room remembers. Inspect the page on the desk.',
  'You have reached Panel Zero.',
];

const sequence = ['page', 'phone', 'door', 'neighbor', 'hallpage', 'switch', 'exit', 'boat', 'power', 'drain', 'door', 'finalpage'];
export function advance(stage, object) {
  return sequence[stage] === object ? stage + 1 : stage;
}

// ponytail: axis-aligned bounds cover this flat level; use a physics engine only for vertical traversal.
export function canWalk(x, z, stage) {
  const room = x > -2.75 && x < 2.75 && z > -2.75 && z < 3.65;
  const doorway = (stage >= 3 && stage < 6 || stage >= 11) && x > .05 && x < 1.75 && z > -3.7 && z < -2.5;
  const hall = stage >= 3 && x > -2.75 && x < 2.75 && z > -9.5 && z <= -3.5;
  const desk = x < -1.15 && z > -1.5 && z < 1.6;
  const bed = x > 1.3 && z > .15 && z < 3.55;
  const shelf = x < -1.8 && z < -1.7 && z > -2.75;
  const passage = stage >= 7 && x > -2 && x < -.6 && z > -10.7 && z < -9.2;
  const yard = stage >= 7 && x > -5.45 && x < 5.45 && z > -23.5 && z <= -10.4;
  const bench = x < -2.8 && z > -15 && z < -13.4;
  const swing = x > -1.4 && x < 1.4 && z > -19.7 && z < -17.7;
  return (room || doorway || hall || passage || yard) && !(room && (desk || bed || shelf)) && !(yard && (bench || swing));
}

// Exactly three one-shot story scares per run, independent of frame rate.
export function nextScare(stage, z, played) {
  if(stage===7 && z < -11.8 && !played.has('gate'))return 'gate';
  if(stage===8 && !played.has('boat'))return 'boat';
  if(stage===10 && !played.has('drain'))return 'drain';
  return null;
}
