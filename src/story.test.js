import test from 'node:test';
import assert from 'node:assert/strict';
import { advance, canWalk, nextScare, pullProgress } from './story.js';

test('complete story, out-of-order interactions, collision, and closed entrance', () => {
  let stage = 0;
  assert.equal(advance(stage, 'phone'), 0);
  assert.equal(canWalk(.9, -3, stage), false);
  for (const object of ['page', 'phone', 'door', 'neighbor', 'hallpage', 'switch', 'exit', 'boat', 'power', 'drain', 'door', 'finalpage']) stage = advance(stage, object);
  assert.equal(stage, 12);
  assert.equal(advance(stage, 'page'), 12);
  assert.equal(canWalk(.9, -3, 3), true);
  assert.equal(canWalk(.9, -3, 6), false);
  assert.equal(canWalk(.9, -3, 7), false);
  assert.equal(canWalk(.9, -3, 11), true);
  assert.equal(canWalk(-1, -3, 3), false);
  assert.equal(canWalk(0, -9, 3), true);
  assert.equal(canWalk(0, -10, 3), false);
  assert.equal(canWalk(-2, 0, 3), false);
  assert.equal(canWalk(2, 2, 3), false);
  assert.equal(canWalk(0, 2, 0), true);
  assert.equal(canWalk(-1.3, -10, 6), false);
  assert.equal(canWalk(-1.3, -10, 7), true);
  assert.equal(canWalk(-2.5, -14, 7), true);
  assert.equal(canWalk(-3.6, -14, 7), false);
  assert.equal(canWalk(0, -18.7, 7), false);
  assert.equal(canWalk(0, -25, 7), false);
  assert.equal(advance(7, 'power'), 7);
  assert.equal(advance(8, 'drain'), 8);
  const played=new Set();
  assert.equal(nextScare(7,-11,played),null);
  for(const [stage,z,id] of [[7,-12,'gate'],[8,-14,'boat'],[10,-22,'drain']]){
    assert.equal(nextScare(stage,z,played),id);played.add(id);
    assert.equal(nextScare(stage,z,played),null);
  }
  assert.equal(played.size,3);
  played.clear();assert.equal(nextScare(7,-12,played),'gate');
  assert.equal(pullProgress(0,true,1),1);
  assert.equal(pullProgress(1,false,.25),.5);
  assert.equal(pullProgress(.1,false,1),0);
  assert.equal(pullProgress(2.9,true,.2),3);
});
