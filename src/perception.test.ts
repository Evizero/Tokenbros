import test from 'node:test';
import assert from 'node:assert/strict';
import { awareness, inView, hears, hear, perceive, reached, turnToward, angleDelta } from './perception.ts';

test('vision has a blind rear, finite range, and vertical boundaries',()=>{
  assert.equal(inView(0,0,0,360,.92,150,20),true);
  assert.equal(inView(0,0,0,360,.92,-20,0),false);
  assert.equal(inView(0,0,0,360,.92,361,0),false);
  assert.equal(inView(0,0,0,360,.92,20,150),false);
  assert.equal(inView(0,0,Math.PI,360,.92,-150,20),true);
});
test('turning takes time and follows the short arc across the angle seam',()=>{
  const next=turnToward(Math.PI-.1,-Math.PI+.1,2,.025);
  assert.ok(Math.abs(angleDelta(Math.PI-.1,next)-.05)<1e-6);
  assert.ok(Math.abs(turnToward(0,Math.PI,2,.1))<.21);
});
test('sound has a finite radius and solid cover attenuates it',()=>{
  assert.equal(hears(0,0,300,0,330,false),true);
  assert.equal(hears(0,0,300,0,330,true),false);
  assert.equal(hears(0,0,300,0,650,true),true);
  assert.equal(hears(0,0,700,0,650,false),false);
});
test('hearing creates an investigation, not automatic combat',()=>{
  const a=awareness(0,0);hear(a,180,20);
  assert.equal(a.state,'investigate');assert.equal(a.targetX,180);assert.ok(a.suspicion<1);
  perceive(a,false,999,999,.5);assert.equal(a.targetX,180);assert.equal(a.targetY,20);
});
test('brief glimpses give warning; losing sight preserves the last seen position',()=>{
  const a=awareness(0,0);perceive(a,true,100,20,.1);assert.notEqual(a.state,'combat');
  perceive(a,true,105,20,.25);assert.equal(a.state,'combat');
  perceive(a,false,-400,800,.1);assert.equal(a.state,'investigate');assert.equal(a.targetX,105);assert.equal(a.targetY,20);
  for(let i=0;i<80;i++)perceive(a,false,-400,800,.1);
  assert.equal(a.state,'patrol');assert.equal(a.suspicion,0);
});
test('reaching an investigation point starts a bounded search then returns to patrol',()=>{
  const a=awareness(0,0);hear(a,100,20);reached(a);assert.equal(a.state,'search');
  for(let i=0;i<30;i++)perceive(a,false,999,999,.1);
  assert.equal(a.state,'patrol');
});
test('a nearby distraction does not override fresh visual contact',()=>{
  const a=awareness(0,0);perceive(a,true,150,0,.4);hear(a,-200,0);
  assert.equal(a.state,'combat');assert.equal(a.targetX,150);
});
test('heavy blasts carry through cover and retain a longer, finite investigation',()=>{
  assert.equal(hears(0,0,1000,0,1300,true,.8),true);
  assert.equal(hears(0,0,1100,0,1300,true,.8),false);
  assert.equal(hears(0,0,1000,0,650,true),false);
  const a=awareness(0,0);hear(a,1000,40,8);
  perceive(a,false,5000,5000,5);assert.equal(a.state,'investigate');assert.equal(a.targetX,1000);
  perceive(a,false,5000,5000,4);assert.notEqual(a.state,'investigate');
});
