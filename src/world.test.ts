import test from 'node:test';
import assert from 'node:assert/strict';
import { World, COLS, BASE, type Body } from './world.ts';
const body=(x:number,y:number,vx=0,vy=0):Body=>({x,y,w:20,h:32,vx,vy,grounded:false});
test('high-speed movement lands on a platform instead of tunneling through it',()=>{
  const w=new World();const p=body(100,BASE+350,0,1600);w.move(p,.1);
  assert.equal(p.y,BASE+388);assert.equal(p.vy,0);assert.equal(p.grounded,true);
});
test('a wall stops horizontal movement without overlapping the player',()=>{
  const w=new World();const p=body(435,BASE+385,900,0);w.move(p,.1);
  assert.equal(p.x,460);assert.equal(w.overlaps(p.x,p.y,p.w,p.h),false);
});
test('cover takes damage, breaks at its threshold, and becomes traversable',()=>{
  const w=new World();assert.equal(w.damage(485,BASE+365,3),null);assert.equal(w.at(485,BASE+365)?.hp,1);
  assert.ok(w.damage(485,BASE+365,1));assert.equal(w.at(485,BASE+365),null);assert.equal(w.destroyed,1);
});
test('reinforced geometry survives arbitrary explosive damage',()=>{
  const w=new World();assert.equal(w.damage(400,BASE+365,10000),null);assert.equal(w.at(400,BASE+365)?.kind,3);
});
test('holes permit falling and empty map edges are handled safely',()=>{
  const w=new World();const p=body(920,BASE+388,0,100);w.move(p,.1);assert.equal(p.grounded,false);assert.ok(p.y>BASE+388);
  assert.equal(w.get(-1,20),null);assert.equal(w.get(COLS,20),null);assert.equal(w.at(1,-100),null);
});
test('the boss arena stays at the same elevation after a chain reaction',()=>{
  const w=new World();
  for(let x=3320;x<4080;x+=20)w.damage(x+5,BASE+425,100);
  const p=body(3550,BASE+350,0,1000);w.move(p,.1);
  assert.equal(p.y,BASE+388);assert.equal(p.grounded,true);
});

test('the uplink opens its own gate without removing the second gate',()=>{
  const w=new World();assert.equal(w.at(1805,705)?.kind,4);assert.equal(w.at(3205,705)?.kind,4);
  w.openGate(0);assert.equal(w.at(1805,705),null);assert.equal(w.at(3205,705)?.kind,4);
  w.openGate(1);assert.equal(w.at(3205,705),null);
});
test('a tower landing catches the player at its own elevation',()=>{
  const w=new World();const p=body(1600,220,0,1500);w.move(p,.1);assert.equal(p.y,288);assert.equal(p.grounded,true);
});

// Secondary physics must not sink fragments through platforms or grow without bounds.
import { Debris } from './debris.ts';
test('scrapped robot pieces bounce, settle, and expire',()=>{
  const w=new World(),d=new Debris();d.shatter(100,780,140,-140,true);
  for(let i=0;i<480;i++)d.update(1/120,w);
  assert.equal(d.pieces.length,7);assert.ok(d.pieces.every(p=>p.y+p.h<=860.01));
  for(let i=0;i<500;i++)d.update(1/120,w);assert.equal(d.pieces.length,0);
});
test('scrap and oil have fixed upper bounds during a chain reaction',()=>{
  const d=new Debris();for(let i=0;i<100;i++)d.shatter(100,700,100,-200);
  assert.equal(d.pieces.length,180);assert.equal(d.oil.length,45);
});

test('marked decking breaks while nearby structural routes survive',()=>{
 const w=new World();assert.equal(w.at(405,745)?.kind,5);assert.equal(w.damage(405,745,2),null);assert.ok(w.damage(405,745,1));
 assert.equal(w.at(405,745),null);assert.equal(w.damage(355,685,999),null);assert.equal(w.at(355,685)?.kind,3);
});
