import test from "node:test";
import assert from "node:assert/strict";
import { encodeGraph, decodeGraph } from "./coop-codec.ts";
import { validInput } from "./coop-input.ts";
test("snapshots preserve enemy identity across grabs, pets, hit sets and cyclic targets", () => {
  const enemy: any = { x: 12, hp: 4 };
  enemy.self = enemy;
  const source = {
    enemies: [enemy],
    held: [{ body: enemy, enemy }],
    pet: { focus: enemy },
    bullet: { hit: new Set([enemy]) },
    scrap: { hit: new Map([[enemy, 0.5]]) },
  };
  const copy = decodeGraph(encodeGraph(source));
  assert.notEqual(copy.enemies[0], enemy);
  assert.equal(copy.enemies[0], copy.held[0].body);
  assert.equal(copy.enemies[0], copy.pet.focus);
  assert.equal(copy.enemies[0].self, copy.enemies[0]);
  assert(copy.bullet.hit.has(copy.enemies[0]));
  assert.equal(copy.scrap.hit.get(copy.enemies[0]), 0.5);
});
test("decode rejects prototype mutations, unknown node kinds and invalid references", () => {
  assert.throws(() =>
    decodeGraph({
      root: { r: 0 },
      nodes: [{ t: "object", v: JSON.parse('{"__proto__":{"r":0}}') }],
    }),
  );
  assert.throws(() => decodeGraph({ root: { r: 3 }, nodes: [] }));
  assert.throws(() =>
    decodeGraph({ root: { r: 0 }, nodes: [{ t: "class" as any, v: {} }] }),
  );
  assert.equal(({} as any).polluted, undefined);
});
test("network controls reject malformed packets and unbounded input", () => {
  const input = {
    seq: 2,
    keys: ["KeyD"],
    edges: [["KeyE", true]],
    down: true,
    tap: false,
    aim: { x: 350, y: 830 },
    thinking: 1,
  };
  assert(validInput(input));
  for (const bad of [
    { ...input, seq: NaN },
    { ...input, keys: ["Escape"] },
    { ...input, aim: { x: Infinity, y: 0 } },
    { ...input, thinking: 4 },
    { ...input, edges: [["KeyE", "yes"]] },
    { ...input, edges: Array(41).fill(["KeyE", true]) },
  ])
    assert(!validInput(bad));
});
