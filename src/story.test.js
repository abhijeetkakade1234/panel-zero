import test from 'node:test';
import assert from 'node:assert/strict';
import { advance, canWalk } from './story.js';

test('complete story, out-of-order interactions, collision, and closed entrance', () => {
  let stage = 0;
  assert.equal(advance(stage, 'phone'), 0);
  assert.equal(canWalk(.9, -3, stage), false);
  for (const object of ['page', 'phone', 'door', 'neighbor', 'hallpage', 'switch', 'door', 'finalpage']) stage = advance(stage, object);
  assert.equal(stage, 8);
  assert.equal(advance(stage, 'page'), 8);
  assert.equal(canWalk(.9, -3, 3), true);
  assert.equal(canWalk(.9, -3, 6), false);
  assert.equal(canWalk(.9, -3, 7), true);
  assert.equal(canWalk(-1, -3, 3), false);
  assert.equal(canWalk(0, -9, 3), true);
  assert.equal(canWalk(0, -10, 3), false);
  assert.equal(canWalk(-2, 0, 3), false);
  assert.equal(canWalk(2, 2, 3), false);
  assert.equal(canWalk(0, 2, 0), true);
});
