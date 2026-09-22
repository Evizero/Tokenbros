import test from 'node:test';
import assert from 'node:assert/strict';
import { TOKEN_CAPACITY, spendTokens, shotCost } from './tokens.ts';
import { thinkingWeapon } from './combat.ts';
test('shots spend the full integer token cost, including continuous thinking values',()=>{
  assert.equal(spendTokens(TOKEN_CAPACITY,thinkingWeapon(0).cost),992);
  assert.equal(spendTokens(TOKEN_CAPACITY,thinkingWeapon(1).cost),972);
  assert.equal(spendTokens(TOKEN_CAPACITY,thinkingWeapon(2).cost),928);
  assert.equal(shotCost(12.25),13);
});
test('insufficient tokens do not produce a shot or negative balance',()=>{
  assert.equal(spendTokens(71,72),null);assert.equal(spendTokens(0,8),null);
  assert.equal(spendTokens(8,8),0);assert.equal(spendTokens(50,8),42);
});
