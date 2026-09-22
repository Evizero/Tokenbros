import type { EffectEvent, SoundEvent } from "./coop-state";
import { World } from "./world";
import type {
  Enemy,
  Bullet,
  Barrel,
  Rescue,
  Grenade,
  Relay,
} from "./game-types";
import type { PlayerRuntime } from "./player-runtime";
import type { Encounters } from "./encounters";
/** Authoritative state shared by every actor; never stepped once per player. */
export class SharedWorld {
  players: PlayerRuntime[] = [];
  replica = false;
  effects: EffectEvent[] = [];
  sounds: SoundEvent[] = [];
  entitySerial = 0;
  notices:{actor:string;a:string;b:string}[]=[];
  world = new World();
  enemies: Enemy[] = [];
  bullets: Bullet[] = [];
  barrels: Barrel[] = [];
  rescues: Rescue[] = [];
  grenades: Grenade[] = [];
  relays: Relay[] = [];
  alarms: {
    x: number;
    y: number;
    triggered: boolean;
    timer: number;
    targetX: number;
    targetY: number;
  }[] = [];
  boss = {
    x: 3620,
    y: 784,
    w: 76,
    h: 76,
    hp: 100,
    max: 100,
    phase: 0,
    timer: 0,
    dead: false,
    active: false,
  };
  checkpoint = 90;
  checkpointY = 828;
  checkpointIndex = 0;
  totalRescues = 0;
  encounters!: Encounters;
  get coop() {
    return this.players.length > 1;
  }
}
