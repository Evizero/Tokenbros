/** Standard browser / Steam Input gamepad layout. */
export type PadSample = { axes: readonly number[]; buttons: readonly { value: number; pressed: boolean }[] };
export function stick(x = 0, y = 0, deadzone = .2) {
  const length = Math.hypot(x, y);
  if (!Number.isFinite(length) || length <= deadzone) return { x: 0, y: 0 };
  const scale = Math.min(1, (length - deadzone) / (1 - deadzone)) / length;
  return { x: x * scale, y: y * scale };
}
export function readPad(pad: PadSample) {
  const buttons = Array.from({length: 17}, (_, i) => !!pad.buttons[i] && (pad.buttons[i].pressed || pad.buttons[i].value > .25));
  return { buttons, move: stick(pad.axes[0], pad.axes[1]), aim: stick(pad.axes[2], pad.axes[3]) };
}
export function padKeys(p: ReturnType<typeof readPad>) {
  const b = p.buttons, keys = new Set<string>();
  if (p.move.x < -.18) keys.add('KeyA');
  if (p.move.x > .18) keys.add('KeyD');
  if (p.move.y < -.25) keys.add('KeyW');
  if (p.move.y > .25) keys.add('KeyS');
  if (b[0] || b[4]) keys.add('Space');
  if (b[1] || b[10]) keys.add('ControlLeft');
  if (b[2] || b[5]) keys.add('KeyE');
  if (b[3]) keys.add('KeyF');
  if (b[6]) keys.add('KeyQ');
  return keys;
}
