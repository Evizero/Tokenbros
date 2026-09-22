import type { PlayerRuntime } from "./player-runtime";
import { encodeGraph, decodeGraph, type Graph } from "./coop-codec";
import type { Block } from "./world";
const actorFields =
  "id character state player networkAim thinking lastCooldown aimAngle aim face resetProp footstep refillFeedback refillFrom tokenTrail resetRecovery burstSpend burstShots burstLife dryClick dryFire dryFeedback lastSpend spendFlash health usage charges invuln fireTimer muzzle wall wallGrip wallGrace lastWall wallRegrab coyote jumpBuffer wallLock climb zip zipCooldown time elapsed kills chargeKills deaths respawnTimer shotCount resetCount modeFeedback modeBurst".split(
    " ",
  );
const worldFields =
  "enemies bullets barrels rescues grenades relays alarms boss checkpoint checkpointY checkpointIndex totalRescues".split(
    " ",
  );
const pick = (o: any, keys: string[]) =>
  Object.fromEntries(keys.map((k) => [k, o[k]]));
const data = (o: any, skip: string[] = []) =>
  pick(
    o,
    Object.keys(o).filter((k) => !["g", "owner", ...skip].includes(k)),
  );
const kits = (a: PlayerRuntime) => ({
  defense: a.defense,
  otherTibo: a.otherTibo,
  peterKit: a.peterKit,
  dimillianKit: a.dimillianKit,
  pidalfKit: a.pidalfKit,
  marcusKit: a.marcusKit,
  barks: a.barks,
});
function actorState(a: PlayerRuntime) {
  const k = kits(a),
    active = [
      "defense",
      "barks",
      a.character === "tibo" ? "otherTibo" : `${a.character}Kit`,
    ];
  return {
    ...pick(a, actorFields),
    networkAim: a.aimPoint(),
    kits: Object.fromEntries(
      active.map((name) => {
        const kit = k[name as keyof typeof k];
        return [
          name,
          name === "marcusKit"
            ? {
                ...data(kit, ["lcd", "invader", "pacman"]),
                lcd: data(a.marcusKit.lcd),
                invader: data(a.marcusKit.invader),
                pacman: data(a.marcusKit.pacman),
              }
            : data(kit),
        ];
      }),
    ),
  };
}
export type WorldPacket = {
  tick: number;
  ack: number;
  graph: Graph;
  terrain: [number, Block | null][];
  full: boolean;
  events: EffectEvent[];
  sounds: SoundEvent[];
  notices:{actor:string;a:string;b:string}[];
};
export type SoundEvent = {
  actor: string;
  method: "tone" | "noise";
  args: any[];
};
export type EffectEvent = {
  actor: string;
  x: number;
  y: number;
  count: number;
  colors: string[];
  force: number;
  size: number;
  life: number;
  kind?: "scrap" | "blast";
};
export class StateWriter {
  private terrain: string[] = [];
  capture(
    g: PlayerRuntime,
    tick: number,
    ack: number,
    full = false,
  ): WorldPacket {
    const changes: WorldPacket["terrain"] = [];
    g.world.blocks.forEach((b, i) => {
      const key = b ? `${b.kind},${b.hp},${b.seed}` : "";
      if (full || key !== this.terrain[i]) {
        changes.push([i, b ? { ...b } : null]);
        this.terrain[i] = key;
      }
    });
    return {
      tick,
      ack,
      full,
      terrain: changes,
      graph: encodeGraph({
        world: pick(g.arena, worldFields),
        destroyed: g.world.destroyed,
        encounters: data(g.encounters),
        players: g.peers.map(actorState),
      }),
      events: g.arena.effects.splice(0, 160),
      sounds: g.arena.sounds.splice(0, 120),
      notices:g.arena.notices.splice(0,20),
    };
  }
}
/** Only pre-existing, allowlisted kit instances receive fields; their methods and owners stay local. */
function applyData(target: any, state: any, excluded: string[] = []) {
  for (const key of Object.keys(target)) {
    if (["g", "owner", ...excluded].includes(key)) continue;
    if (Object.hasOwn(state, key)) target[key] = state[key];
  }
}
export function applyState(g: PlayerRuntime, packet: WorldPacket) {
  const s = decodeGraph(packet.graph);
  if (!s || s.players?.length !== 2) throw Error("Invalid player count");
  for (const key of worldFields)
    if (Object.hasOwn(s.world, key)) (g.arena as any)[key] = s.world[key];
  g.world.destroyed = s.destroyed;
  for (const [i, b] of packet.terrain) {
    if (!Number.isInteger(i) || i < 0 || i >= g.world.blocks.length)
      throw Error("Invalid terrain");
    g.world.blocks[i] = b;
  }
  applyData(g.encounters, s.encounters);
  for (const source of s.players) {
    const a = g.peers.find((a) => a.id === source.id);
    if (!a) throw Error("Unknown player");
    for (const key of actorFields)
      if (key !== "id" && Object.hasOwn(source, key))
        (a as any)[key] = source[key];
    const k = kits(a);
    for (const name of Object.keys(source.kits)) {
      if (!Object.hasOwn(k, name)) throw Error("Unknown kit");
      const target = k[name as keyof typeof k],
        state = source.kits[name];
      if (name === "marcusKit") {
        applyData(target, state, ["lcd", "invader", "pacman"]);
        for (const child of ["lcd", "invader", "pacman"] as const)
          applyData(a.marcusKit[child], state[child]);
      } else applyData(target, state);
    }
  }
  for (const e of packet.events) {
    const actor = g.peers.find((a) => a.id === e.actor) ?? g;
    actor.emit(e.x, e.y, e.count, e.colors, e.force, e.size, e.life);
    if (e.kind === "scrap") actor.debris.shatter(e.x, e.y, 180, -150, true);
    if (Math.hypot(e.x - g.player.x, e.y - g.player.y) < 700) {
      if (e.kind === "blast") g.shake = Math.max(g.shake, 6);
      else if (e.kind === "scrap") g.shake = Math.max(g.shake, 3);
    }
  }
  for(const notice of packet.notices??[])if(notice.actor===g.id)g.notify(notice.a,notice.b);
  for (const sound of packet.sounds ?? []) {
    const actor = g.peers.find((a) => a.id === sound.actor);
    if (
      !actor ||
      Math.hypot(actor.player.x - g.player.x, actor.player.y - g.player.y) > 720
    )
      continue;
    if (sound.method === "tone") {
      const [f, d, t, gain, end, pan] = sound.args;
      g.audio.tone(f, d, t, gain, end, pan);
    } else if (sound.method === "noise") {
      const [d, gain, f] = sound.args;
      g.audio.noise(d, gain, f);
    }
  }
}
