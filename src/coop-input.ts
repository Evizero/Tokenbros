import type { PlayerRuntime } from "./player-runtime";
export const CONTROL_KEYS = new Set([
  "KeyA",
  "KeyD",
  "KeyW",
  "KeyS",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Space",
  "ControlLeft",
  "ControlRight",
  "KeyJ",
  "KeyE",
  "KeyQ",
  "KeyF",
  "KeyK",
  "KeyR",
  "Digit1",
  "Digit2",
  "Digit3",
  "Digit4",
]);
export type InputFrame = {
  seq: number;
  keys: string[];
  edges: [string, boolean][];
  down: boolean;
  tap: boolean;
  aim: { x: number; y: number };
  thinking: number;
};
export function validInput(v: any): v is InputFrame {
  return (
    !!v &&
    Number.isSafeInteger(v.seq) &&
    v.seq >= 0 &&
    Array.isArray(v.keys) &&
    v.keys.length <= 20 &&
    v.keys.every((k: any) => CONTROL_KEYS.has(k)) &&
    Array.isArray(v.edges) &&
    v.edges.length <= 40 &&
    v.edges.every(
      (e: any) =>
        Array.isArray(e) &&
        e.length === 2 &&
        CONTROL_KEYS.has(e[0]) &&
        typeof e[1] === "boolean",
    ) &&
    typeof v.down === "boolean" &&
    typeof v.tap === "boolean" &&
    Number.isFinite(v.thinking) &&
    v.thinking >= 0 &&
    v.thinking <= 3 &&
    v.aim &&
    Number.isFinite(v.aim.x) &&
    Number.isFinite(v.aim.y) &&
    Math.abs(v.aim.x) < 10000 &&
    Math.abs(v.aim.y) < 5000
  );
}
export function applyInput(a: PlayerRuntime, v: InputFrame) {
  a.networkAim = v.aim;
  a.pointer.active = true;
  a.updateAim();
  a.setThinking(v.thinking);
  for (const [key, pressed] of v.edges) {
    if (pressed) a.press(key);
    else a.release(key);
  }
  // Releases survive lost focus and stalled senders; never invent repeated ability presses.
  for (const key of a.keys) if (!v.keys.includes(key)) a.release(key);
  a.keys = new Set(v.keys);
  a.pointer.down = v.down;
  if (v.tap) a.pendingShot = 0.14;
}
export function neutralInput(a: PlayerRuntime) {
  for (const k of [...a.keys]) a.release(k);
  a.keys.clear();
  a.pointer.down = false;
  a.pendingShot = 0;
}
