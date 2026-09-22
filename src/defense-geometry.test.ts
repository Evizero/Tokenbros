import test from 'node:test';import assert from 'node:assert/strict';
import { shieldCrossing,reflect } from './defense-geometry.ts';
test('shield catches fast front shots, but not rear shots or shots around its edges',()=>{
 const s={x:100,y:100,angle:0,half:32};
 assert.deepEqual(shieldCrossing({x:200,y:100},{x:0,y:100},s),{x:100,y:100});
 assert.equal(shieldCrossing({x:0,y:100},{x:200,y:100},s),null);
 assert.equal(shieldCrossing({x:200,y:133},{x:0,y:133},s),null);
 assert.equal(shieldCrossing({x:101,y:50},{x:101,y:150},s),null);
});
test('upward and diagonal shields use the aimed plane rather than horizontal-only detection',()=>{
 assert.ok(shieldCrossing({x:100,y:0},{x:100,y:200},{x:100,y:100,angle:-Math.PI/2,half:32}));
 assert.ok(shieldCrossing({x:160,y:160},{x:40,y:40},{x:100,y:100,angle:Math.PI/4,half:32}));
});
test('parry reflection reverses the normal component and preserves speed',()=>{
 const r=reflect(-300,50,0);assert.deepEqual(r,{vx:300,vy:50});
 const d=reflect(-240,-80,Math.PI/4);assert.ok(Math.abs(Math.hypot(d.vx,d.vy)-Math.hypot(240,80))<1e-8);
 assert.ok(d.vx>0&&d.vy>0);
});
