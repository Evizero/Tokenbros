import test from 'node:test';
import assert from 'node:assert/strict';
import { stick, readPad, padKeys } from './gamepad-input.ts';
const sample=(pressed:number[]=[],axes=[0,0,0,0])=>readPad({axes,buttons:Array.from({length:17},(_,i)=>({pressed:pressed.includes(i),value:pressed.includes(i)?1:0}))});
test('stick drift is ignored, diagonal reach is bounded, and pressure stays continuous',()=>{
  assert.deepEqual(stick(.1,-.1),{x:0,y:0});
  assert.deepEqual(stick(NaN,0),{x:0,y:0});
  assert.deepEqual(stick(1,0),{x:1,y:0});
  assert.ok(Math.abs(Math.hypot(...Object.values(stick(1,1)))-1)<1e-9);
  assert.ok(stick(.4,0).x<stick(.5,0).x);
});
test('thumb-free jump, grab, defend and fire can be held independently',()=>{
  const p=sample([4,5,6,7],[1,-1,0,-1]);
  assert.deepEqual([...padKeys(p)].sort(),['KeyD','KeyE','KeyQ','KeyW','Space'].sort());
  assert.equal(p.buttons[7],true);assert.equal(p.aim.y,-1);
});
test('alternate jump / secondary bindings collapse to one action',()=>{
  assert.deepEqual([...padKeys(sample([0,4,2,5]))],['Space','KeyE']);
  assert.deepEqual([...padKeys(sample([4,5]))],['Space','KeyE']);
  assert.equal(padKeys(sample()).size,0);
});
test('crouch and special use distinct buttons, triggers accept analog values',()=>{
  assert.deepEqual([...padKeys(sample([1,3]))],['ControlLeft','KeyF']);
  assert.deepEqual([...padKeys(sample([10]))],['ControlLeft']);
  assert.equal(readPad({axes:[],buttons:[{pressed:false,value:.3}]}).buttons[0],true);
  assert.equal(readPad({axes:[],buttons:[]}).buttons[7],false);
});
