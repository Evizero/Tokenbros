import test from 'node:test';
import assert from 'node:assert/strict';
import { THINKING, canvasPoint, shieldHit, thinkingScroll, thinkingWeapon } from './combat.ts';

test('mouse coordinates account for scaling and fullscreen letterboxing',()=>{
  assert.deepEqual(canvasPoint(740,550,{left:20,top:100,width:1440,height:900}),{x:480,y:270});
  assert.deepEqual(canvasPoint(20,145,{left:20,top:100,width:1440,height:900}),{x:0,y:0});
});
test('every scroll sample contributes continuously, including inertia and reversal',()=>{
  assert.equal(thinkingScroll(-3,0),.01);assert.equal(thinkingScroll(-3,0),.01);
  assert.equal(thinkingScroll(3,0),-.01);
  assert.equal(thinkingScroll(-3,1),thinkingScroll(-48,0));
  assert.equal(thinkingScroll(-1,2),thinkingScroll(-540,0));
});
test('shot tuning is continuous through category boundaries and clamps at endpoints',()=>{
  for(const boundary of [2/3,1,4/3]){
    const a=thinkingWeapon(boundary-.00001),b=thinkingWeapon(boundary+.00001);
    assert.ok(Math.abs(a.power-b.power)<.001);assert.ok(Math.abs(a.cooldown-b.cooldown)<.001);
  }
  assert.equal(thinkingWeapon(-4).power,1);assert.equal(thinkingWeapon(8).power,8);
  assert.equal(thinkingWeapon(.4).tier,0);assert.equal(thinkingWeapon(1).tier,1);assert.equal(thinkingWeapon(1.6).tier,2);
  assert.ok(thinkingWeapon(.3).power>thinkingWeapon(.2).power);
  assert.ok(thinkingWeapon(1.3).cooldown>thinkingWeapon(1.2).cooldown);
});
test('shield rejects weak frontal fire, medium breaks it in two hits, high and flanks penetrate',()=>{
  assert.deepEqual(shieldHit(0,false,6,850,0,-1),{blocked:true,shield:6});
  const a=shieldHit(1,false,6,850,0,-1);assert.deepEqual(a,{blocked:true,shield:3});
  assert.deepEqual(shieldHit(1,false,a.shield,850,0,-1),{blocked:true,shield:0});
  assert.equal(shieldHit(2,false,6,850,0,-1).blocked,false);
  assert.equal(shieldHit(0,true,6,850,0,-1).blocked,false);
  assert.equal(shieldHit(0,false,6,-850,0,-1).blocked,false);
  assert.equal(shieldHit(0,false,6,0,850,-1).blocked,false);
});
test('higher thinking trades recovery and usage for per-shot force rather than free DPS',()=>{
  assert.ok(THINKING[2].power>THINKING[1].power&&THINKING[1].power>THINKING[0].power);
  assert.ok(THINKING[2].cooldown>THINKING[1].cooldown&&THINKING[1].cooldown>THINKING[0].cooldown);
  assert.ok(THINKING[2].power/THINKING[2].cooldown<THINKING[0].power/THINKING[0].cooldown);
});
