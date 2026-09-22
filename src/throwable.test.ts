import test from 'node:test';import assert from 'node:assert/strict';
import { World } from './world.ts';import { throwButton,stepButton } from './throwable.ts';
test('reset button keeps falling beyond the former fixed animation range',()=>{
 const w=new World();w.blocks.fill(null);for(let x=0;x<100;x++)w.set(x,43,3);
 const b=throwButton(100,100,0);for(let i=0;i<100;i++)stepButton(b,1/120,w);
 assert.equal(b.landed,false);assert.ok(b.y>200);assert.equal(b.slam,0);
 for(let i=0;i<200&&!b.landed;i++)stepButton(b,1/120,w);
 assert.equal(b.landed,true);assert.equal(b.y+b.h,860);assert.ok(b.x>200);
 stepButton(b,.2,w);assert.ok(b.slam>=.2);
});
test('reset button hits walls and resumes falling if support is destroyed',()=>{
 const w=new World();w.blocks.fill(null);for(let y=0;y<43;y++)w.set(12,y,3);for(let x=0;x<12;x++)w.set(x,43,1);
 const b=throwButton(100,600,0);for(let i=0;i<300&&!b.landed;i++)stepButton(b,1/120,w);
 assert.ok(b.x+b.w<=240);assert.equal(b.landed,true);
 w.blocks.fill(null);stepButton(b,.1,w);assert.equal(b.landed,false);assert.equal(b.slam,0);
});
