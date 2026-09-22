import { MarcusKit } from "./marcus";
import { marcus, MARCUS_COLOR } from "./marcus-art";
import { LEVEL_ENEMIES, LEVEL_BARRELS, SECTORS } from "./level";
import { Encounters } from "./encounters";
import { PidalfKit } from "./pidalf";
import { pidalf, PI_COLOR } from "./pidalf-art";
import { HeroBarks } from "./hero-barks";
import { DimillianKit } from "./dimillian";
import { dimillian, sheep } from "./dimillian-art";
import { OtherTibo } from "./other-tibo";
import { Defense } from "./defense";
import { PeterKit } from "./peter";
import { peter } from "./peter-art";
import { throwButton, stepButton, type ResetButton } from "./throwable";
import {
  TILE,
  COLS,
  BASE,
  LADDERS,
  LEVEL_HEIGHT,
  clamp,
  overlap,
  type Body,
} from "./world";
import { Debris } from "./debris";
import { thinkingWeapon, canvasPoint, shieldHit } from "./combat";
import {
  awareness,
  perceive,
  hear,
  hears,
  inView,
  turnToward,
  reached,
} from "./perception";
import { TOKEN_CAPACITY, RESET_RECOVERY, spendTokens } from "./tokens";
import { AudioFX } from "./audio";
import { W, H, rect, text, wallGripPose, tibo, robot } from "./art";
import { SharedWorld } from "./shared-world";
import type { Enemy, Particle, Ring } from "./game-types";
const REFILL_ANIMATION = 1.35,
  REFILL_FEEDBACK = 2.2;
const rand = (a: number, b: number) => a + Math.random() * (b - a);
export class PlayerRuntime {
  local = false;
  id = "p0";
  networkAim: { x: number; y: number } | null = null;
  renderView: {
    c: CanvasRenderingContext2D;
    cam: number;
    camY: number;
  } | null = null;
  private context: CanvasRenderingContext2D;
  barks = new HeroBarks(this);
  rosterPreview: { destroy(): void } | null = null;
  otherTibo = new OtherTibo(this);
  defense = new Defense(this);
  character: "tibo" | "peter" | "dimillian" | "pidalf" | "marcus" = "dimillian";
  peterKit = new PeterKit(this);
  dimillianKit = new DimillianKit(this);
  pidalfKit = new PidalfKit(this);
  marcusKit = new MarcusKit(this);
  debris = new Debris();
  impactSound = 0;
  audio = new AudioFX();
  state: "title" | "intro" | "playing" | "paused" | "dead" | "won" = "title";
  player: Body = { x: 90, y: 828, w: 20, h: 32, vx: 0, vy: 0, grounded: true };
  keys = new Set<string>();
  particles: Particle[] = [];
  rings: Ring[] = [];
  modeFeedback = 0;
  modeBurst = 0;
  modeSound = 0;
  pointer = { active: false, x: 0, y: 0, down: false };
  thinking = 0;
  pendingShot = 0;
  lastCooldown = 0.095;
  aimAngle = 0;
  voiceCooldown = 0;
  lastBark = "";
  resetProp: ResetButton | null = null;
  footstep = 0;
  refillFeedback = 0;
  refillFrom = 0;
  tokenTrail = TOKEN_CAPACITY;
  resetRecovery = RESET_RECOVERY;
  burstSpend = 0;
  burstShots = 0;
  burstLife = 0;
  dryClick = 0;
  dryFire = 0;
  dryFeedback = 0;
  lastSpend = 0;
  spendFlash = 0;
  health = 3;
  usage = TOKEN_CAPACITY;
  charges = 2;
  invuln = 0;
  fireTimer = 0;
  muzzle = 0;
  face = 1;
  aim = 0;
  wall = 0;
  wallGrip = 0;
  wallGrace = 0;
  lastWall = 0;
  wallRegrab = 0;
  coyote = 0;
  jumpBuffer = 0;
  wallLock = 0;
  climb: number | null = null;
  private cameraX = 0;
  private cameraY = 440;
  introTimer = 0;
  zip = false;
  zipCooldown = 0;
  time = 0;
  elapsed = 0;
  shake = 0;
  freeze = 0;
  kills = 0;
  chargeKills = 0;
  deaths = 0;
  respawnTimer = 0;
  toastTimer = 0;
  flash = 0;
  effects = !matchMedia("(prefers-reduced-motion: reduce)").matches;
  frame = 0;
  last = 0;
  acc = 0;
  hudTimer = 0;
  shotCount = 0;
  resetCount = 0;
  get world() {
    return this.arena.world;
  }
  set world(value: SharedWorld["world"]) {
    this.arena.world = value;
  }
  get enemies() {
    return this.arena.enemies;
  }
  set enemies(value: SharedWorld["enemies"]) {
    this.arena.enemies = value;
  }
  get bullets() {
    return this.arena.bullets;
  }
  set bullets(value: SharedWorld["bullets"]) {
    this.arena.bullets = value;
  }
  get barrels() {
    return this.arena.barrels;
  }
  set barrels(value: SharedWorld["barrels"]) {
    this.arena.barrels = value;
  }
  get rescues() {
    return this.arena.rescues;
  }
  set rescues(value: SharedWorld["rescues"]) {
    this.arena.rescues = value;
  }
  get grenades() {
    return this.arena.grenades;
  }
  set grenades(value: SharedWorld["grenades"]) {
    this.arena.grenades = value;
  }
  get relays() {
    return this.arena.relays;
  }
  set relays(value: SharedWorld["relays"]) {
    this.arena.relays = value;
  }
  get alarms() {
    return this.arena.alarms;
  }
  set alarms(value: SharedWorld["alarms"]) {
    this.arena.alarms = value;
  }
  get boss() {
    return this.arena.boss;
  }
  set boss(value: SharedWorld["boss"]) {
    this.arena.boss = value;
  }
  get checkpoint() {
    return this.arena.checkpoint;
  }
  set checkpoint(value: SharedWorld["checkpoint"]) {
    this.arena.checkpoint = value;
  }
  get checkpointY() {
    return this.arena.checkpointY;
  }
  set checkpointY(value: SharedWorld["checkpointY"]) {
    this.arena.checkpointY = value;
  }
  get checkpointIndex() {
    return this.arena.checkpointIndex;
  }
  set checkpointIndex(value: SharedWorld["checkpointIndex"]) {
    this.arena.checkpointIndex = value;
  }
  get totalRescues() {
    return this.arena.totalRescues;
  }
  set totalRescues(value: SharedWorld["totalRescues"]) {
    this.arena.totalRescues = value;
  }
  get encounters() {
    return this.arena.encounters;
  }
  set encounters(value: SharedWorld["encounters"]) {
    this.arena.encounters = value;
  }

  get c() {
    return this.renderView?.c ?? this.context;
  }
  get cam() {
    return this.renderView?.cam ?? this.cameraX;
  }
  set cam(value: number) {
    this.cameraX = value;
  }
  get camY() {
    return this.renderView?.camY ?? this.cameraY;
  }
  set camY(value: number) {
    this.cameraY = value;
  }
  get peers() {
    return this.arena.players;
  }
  get living() {
    return this.peers.filter((p) => p.state === "playing");
  }
  get accent() {
    return this.character === "marcus"
      ? MARCUS_COLOR
      : this.character === "pidalf"
        ? PI_COLOR
        : this.character === "dimillian"
          ? "#c39aff"
          : this.character === "peter"
            ? "#ff805f"
            : "#d5ff60";
  }
  constructor(
    public canvas: HTMLCanvasElement,
    public preview = false,
    public arena = new SharedWorld(),
  ) {
    this.context = canvas.getContext("2d")!;
    this.context.imageSmoothingEnabled = false;
    arena.players.push(this);
    arena.encounters ??= new Encounters(this);
  }
  selectCharacter(character: PlayerRuntime["character"]) {
    this.character = character;
  }
  finishIntro() {
    if (this.state === "intro") this.state = "playing";
  }
  notify(a: string, b = "") {
    if (
      this.arena.coop &&
      !this.arena.replica &&
      this.arena.notices.length < 20
    )
      this.arena.notices.push({ actor: this.id, a, b });
  }
  clearToast() {}
  hud() {}
  win() {
    this.state = "won";
    this.keys.clear();
    this.pointer.down = false;
    this.barks.request("victory");
  }
  populate() {
    this.enemies = LEVEL_ENEMIES.map(([x, y, type], i) => {
      const e = this.spawnEnemy(x, y, type, i % 3 === 0 ? 1 : -1);
      e.sector = SECTORS.findIndex((s) => x >= s.from && x < s.to);
      return e;
    });
    this.alarms = [
      [850, 620],
      [1690, 220],
      [3000, 470],
    ].map(([x, y]) => ({
      x,
      y,
      triggered: false,
      timer: 0,
      targetX: x,
      targetY: y,
    }));
    this.barrels = LEVEL_BARRELS.map(([x, y]) => ({
      x,
      y,
      w: 18,
      h: 30,
      vx: 0,
      vy: 0,
      grounded: false,
      hp: 2,
      dead: false,
      fuse: 0,
    }));
    this.rescues = [
      { x: 1720, y: 286, done: false },
      { x: 2870, y: 566, done: false },
    ];
    this.relays = [
      { x: 1650, y: 286, done: false, supplied: false },
      { x: 2960, y: 566, done: false, supplied: false },
    ];
    this.grenades = [];
    this.zip = false;
  }
  spawnEnemy(x: number, y: number, type: string, face = -1): Enemy {
    return {
      id: ++this.arena.entitySerial,
      awareness: awareness(x + 10, y + 15),
      look: face > 0 ? 0 : Math.PI,
      patrol: face,
      patrolWait: 0.8,
      dash: 0,
      flung: 0,
      x,
      y,
      w: 20,
      h: 30,
      vx: 0,
      vy: 0,
      grounded: false,
      type,
      hp: type === "turret" ? 8 : type === "shield" ? 7 : 4,
      max: type === "turret" ? 8 : type === "shield" ? 7 : 4,
      face: face,
      cool: rand(0.6, 1.6),
      wind: 0,
      hurt: 0,
      dead: false,
      home: x,
      homeY: y,
      shield: 6,
      hacked: 0,
      turn: 0,
      alert: false,
      stun: 0,
      evade: 0,
      lockX: x,
      lockY: y,
      voiceCool: 0,
      shieldDown: 0,
    };
  }
  press(key: string) {
    this.keys.add(key);
    if (!this.pointer.active && ["ArrowLeft", "KeyA"].includes(key))
      this.face = -1;
    if (!this.pointer.active && ["ArrowRight", "KeyD"].includes(key))
      this.face = 1;
    if (
      this.state === "playing" &&
      (/^Digit[123]$/.test(key) ||
        (this.character === "marcus" && key === "Digit4"))
    )
      this.setThinking(Number(key.at(-1)) - 1);
    if (key === "Space" && this.state === "playing") this.jumpBuffer = 0.12;
    if ((key === "KeyF" || key === "KeyK") && this.state === "playing") {
      if (this.character === "marcus") this.marcusKit.ultimate();
      else if (this.character === "pidalf") this.pidalfKit.compact();
      else if (this.character === "dimillian") this.dimillianKit.ultimate();
      else if (this.character === "peter") this.peterKit.transform();
      else this.reset();
    }
    if (key === "KeyE" && this.state === "playing") {
      if (this.character === "marcus") {
        if (!this.overrideNearbyUplink()) this.marcusKit.recall();
        return;
      }
      if (this.character === "pidalf") {
        if (!this.overrideNearbyUplink()) this.pidalfKit.grab();
        return;
      }
      if (this.character === "dimillian") {
        if (!this.overrideNearbyUplink()) this.dimillianKit.secondary();
      } else if (this.character === "peter") {
        this.updateAim();
        if (!this.overrideNearbyUplink()) this.peterKit.throw();
      } else this.otherTibo.activate();
    }
    if (key === "KeyQ" && this.state === "playing") {
      if (this.character === "marcus") {
        this.marcusKit.dodge();
        return;
      }
      if (this.character === "pidalf") {
        this.pidalfKit.defend();
        return;
      }
      if (this.character === "dimillian") this.dimillianKit.defend();
      else this.defense.activate();
    }
    if (key === "KeyR" && this.state === "dead") this.respawn();
  }
  release(key: string) {
    this.keys.delete(key);
    if (key === "KeyE" && this.character === "pidalf") this.pidalfKit.release();
    if (key === "KeyQ") {
      this.defense.release();
      this.dimillianKit.releaseDefense();
    }
    if (key === "Space" && this.player.vy < -180) this.player.vy = -180;
  }
  emit(
    x: number,
    y: number,
    count: number,
    colors: string[],
    force = 140,
    size = 4,
    life = 0.6,
  ) {
    if (
      this.arena.coop &&
      !this.arena.replica &&
      this.arena.effects.length < 160
    )
      this.arena.effects.push({
        actor: this.id,
        x,
        y,
        count: Math.min(count, 24),
        colors,
        force,
        size,
        life,
      });
    for (let i = 0; i < count; i++)
      this.particles.push({
        x,
        y,
        vx: rand(-force, force),
        vy: rand(-force, force * 0.4),
        life: rand(life * 0.45, life),
        max: life,
        color: colors[Math.floor(rand(0, colors.length))],
        size: rand(1, size),
        gravity: 400,
      });
    if (this.particles.length > 800)
      this.particles.splice(0, this.particles.length - 800);
  }
  explode(x: number, y: number, r = 80, fromPlayer = true) {
    if (this.arena.coop && !this.arena.replica)
      this.arena.effects.push({
        actor: this.id,
        x,
        y,
        count: 0,
        colors: [],
        force: 0,
        size: 0,
        life: 0,
        kind: "blast",
      });
    this.makeNoise(x, y, r > 100 ? 1600 : 1300);
    this.triggerAlarm(x, y);
    this.audio.blast(r > 100);
    this.shake = Math.max(this.shake, r > 100 ? 10 : 6);
    if (this.effects) this.freeze = 0.035;
    this.emit(
      x,
      y,
      42,
      ["#fff2b5", "#ffc44f", "#ff7a3f", "#6c7960", "#394d37"],
      r * 3,
      8,
      0.9,
    );
    this.rings.push({ x, y, r: 0, max: r, life: 0.3, color: "#ffca67" });
    for (let dx = -r; dx <= r; dx += TILE)
      for (let dy = -r; dy <= r; dy += TILE)
        if (dx * dx + dy * dy < r * r) {
          const b = this.world.damage(x + dx, y + dy, 8);
          if (b) this.emit(x + dx, y + dy, 3, ["#98a969", "#506943"], 120, 5);
        }
    for (const b of this.barrels)
      if (!b.dead && Math.hypot(b.x + 9 - x, b.y + 15 - y) < r + 10) {
        b.fuse = b.fuse || rand(0.07, 0.2);
        if (fromPlayer) b.owner = this.id;
      }
    for (const e of this.enemies)
      if (
        !e.dead &&
        e.hacked <= 0 &&
        Math.hypot(e.x + 10 - x, e.y + 15 - y) < r + 15
      ) {
        e.hp -= 10;
        e.vx += (e.x > x ? 1 : -1) * 200;
        e.vy = -160;
        if (e.hp <= 0) this.kill(e, e.vx, -250, true);
      }
    if (!fromPlayer) {
      const protectedActors = new Set<PlayerRuntime>();
      for (const shield of this.living) {
        if (shield.character !== "dimillian") continue;
        const covered = this.living.filter(
          (a) =>
            Math.hypot(a.player.x + 10 - x, a.player.y + 16 - y) < r &&
            shield.dimillianKit.protects(a.player),
        );
        if (covered.length && shield.dimillianKit.absorbBlast(x, y))
          for (const a of covered) protectedActors.add(a);
      }
      for (const actor of this.living) {
        const p = actor.player;
        if (
          Math.hypot(p.x + 10 - x, p.y + 16 - y) < r &&
          !protectedActors.has(actor)
        )
          actor.damage();
        if (actor.character === "peter")
          for (const pet of actor.peterKit.pets)
            if (Math.hypot(pet.x + 7 - x, pet.y + 5 - y) < r)
              actor.peterKit.hurtPet(pet, 3, 0.5);
      }
    }
    if (
      this.boss.active &&
      !this.boss.dead &&
      this.boss.phase === 2 &&
      Math.hypot(this.boss.x + 38 - x, this.boss.y + 38 - y) < r + 35
    )
      this.boss.hp -= 8;
  }
  kill(e: Enemy, dx = e.vx || this.face * 160, dy = -140, big = false) {
    if (e.dead) return;
    e.dead = true;
    this.kills++;
    this.chargeKills++;
    this.barks.killed();
    if (this.arena.coop && !this.arena.replica)
      this.arena.effects.push({
        actor: this.id,
        x: e.x + 10,
        y: e.y + 12,
        count: 0,
        colors: [],
        force: 0,
        size: 0,
        life: 0,
        kind: "scrap",
      });
    this.debris.shatter(e.x + 10, e.y + 12, dx, dy, big);
    this.emit(
      e.x + 10,
      e.y + 12,
      22,
      ["#19343c", "#357e74", "#101d2a", "#8bd0b1"],
      big ? 290 : 180,
      4,
      0.85,
    );
    this.emit(
      e.x + 10,
      e.y + 12,
      12,
      ["#fff6bc", "#ffc764", "#fa8750"],
      220,
      3,
      0.4,
    );
    this.shake = Math.max(this.shake, big ? 7 : 3.5);
    if (this.effects) this.freeze = Math.max(this.freeze, big ? 0.055 : 0.025);
    this.audio.scrap(big);
    if (this.chargeKills >= 5 && this.character === "tibo") {
      this.chargeKills = 0;
      this.charges = Math.min(3, this.charges + 1);
      this.notify("RESET BANKED", "5 bots scrapped. Another round on Tibo.");
      this.audio.pickup();
    }
  }
  damage() {
    if (this.preview) return;
    if (
      this.invuln > 0 ||
      this.state !== "playing" ||
      (this.character === "marcus" &&
        (this.marcusKit.flip > 0.055 || !!this.marcusKit.lcd.flight))
    )
      return;
    this.health--;
    this.invuln = 0.85;
    this.flash = 0.18;
    this.shake = 7;
    this.audio.hurt();
    this.emit(
      this.player.x + 10,
      this.player.y + 15,
      9,
      ["#fff0ba", "#fa8760"],
      130,
      3,
    );
    if (this.health <= 0) this.die();
    else if (this.health === 1) this.barks.request("lowHealth");
  }
  die() {
    if (this.state !== "playing") return;
    this.marcusKit.clear();
    this.pidalfKit.clear();
    this.resetProp = null;
    this.defense.active = null;
    this.otherTibo.active = null;
    this.dimillianKit.clear();
    this.peterKit.pets = [];
    this.peterKit.molt = 0;
    this.state = "dead";
    this.barks.request("death");
    this.deaths++;
    this.respawnTimer = 1.1;
    this.keys.clear();
    this.pointer.down = false;
    this.pendingShot = 0;
    this.audio.blast();
    this.emit(
      this.player.x + 10,
      this.player.y + 15,
      35,
      [this.accent, "#ba9070", "#566351"],
      200,
      5,
      0.8,
    );
    const witness = this.enemies
      .filter(
        (e) =>
          !e.dead &&
          e.hacked <= 0 &&
          Math.hypot(e.x - this.player.x, e.y - this.player.y) < 650,
      )
      .sort(
        (a, b) => Math.abs(a.x - this.player.x) - Math.abs(b.x - this.player.x),
      )[0];
    if (witness) {
      witness.voiceCool = 0;
      this.enemyReaction(witness, "laugh");
    }
    this.notify(
      "CONNECTION LOST",
      "Reconnecting at the last deployment point…",
    );
  }
  respawn() {
    this.pidalfKit.clear();
    this.pidalfKit = new PidalfKit(this);
    this.marcusKit = new MarcusKit(this);
    this.wall = 0;
    this.wallGrip = 0;
    this.wallGrace = 0;
    this.lastWall = 0;
    this.wallRegrab = 0;
    this.wallLock = 0;
    this.coyote = 0;
    this.jumpBuffer = 0;
    this.refillFeedback = 0;
    this.player = {
      x: this.checkpoint,
      y: this.checkpointY - 30,
      w: 20,
      h: 32,
      vx: 0,
      vy: 0,
      grounded: false,
    };
    // Restore only the spawn's landing pad, at its actual vertical elevation.
    const row = Math.round((this.checkpointY + 32) / TILE);
    for (
      let x = Math.floor(this.checkpoint / TILE) - 1;
      x < Math.floor(this.checkpoint / TILE) + 3;
      x++
    )
      this.world.set(x, row, 3);
    for (let y = row - 3; y < row; y++)
      for (
        let x = Math.floor(this.checkpoint / TILE) - 1;
        x < Math.floor(this.checkpoint / TILE) + 3;
        x++
      )
        this.world.blocks[y * COLS + x] = null;
    this.zip = false;
    this.climb = null;
    this.camY = clamp(this.checkpointY - 325, 0, LEVEL_HEIGHT - H);

    this.burstSpend = 0;
    this.burstShots = 0;
    this.burstLife = 0;
    this.dryFire = 0;
    this.dryFeedback = 0;
    this.spendFlash = 0;
    this.defense = new Defense(this);
    this.otherTibo = new OtherTibo(this);
    this.peterKit = new PeterKit(this);
    this.dimillianKit.clear();
    this.dimillianKit = new DimillianKit(this);
    this.dimillianKit.form = thinkingWeapon(this.thinking).tier;
    this.health = 3;
    this.usage = TOKEN_CAPACITY;
    this.tokenTrail = TOKEN_CAPACITY;
    this.charges = Math.max(1, this.charges);
    this.invuln = 2;
    if (!this.arena.coop) this.bullets = this.bullets.filter((b) => !b.hostile);
    this.state = "playing";
    this.cam = clamp(this.checkpoint - 260, 0, COLS * TILE - W);
    this.keys.clear();
    this.pointer.down = false;
    this.pendingShot = 0;
    this.notify("BACK ONLINE", "Usage restored. You have work to do.");
    this.barks.request("respawn");
    if (!this.arena.coop && this.boss.active && !this.boss.dead) {
      this.boss.timer = 0;
      this.boss.phase = 0;
    }
  }
  reset() {
    if (this.resetProp) return;
    if (!this.charges) {
      this.notify(
        "RESET NOT READY",
        `Next reset in ${Math.ceil(this.resetRecovery)}s. Bot kills can earn one sooner.`,
      );
      return;
    }
    this.updateAim();
    this.charges--;
    this.resetCount++;
    this.resetProp = throwButton(
      this.player.x + 10,
      this.player.y + 17,
      this.aimAngle,
    );
    this.audio.tone(280, 0.22, "triangle", 0.055, 650);
  }
  updateReset(dt: number) {
    const r = this.resetProp;
    if (!r) return;
    stepButton(r, dt, this.world);
    if (r.landed && r.slam >= 0.4 && !r.struck) {
      r.struck = true;
      this.performReset(r.x + r.w / 2, r.y + r.h - 12);
    }
    if ((r.struck && r.slam >= 0.7) || r.y > LEVEL_HEIGHT + 80 || r.age > 10)
      this.resetProp = null;
  }
  overrideNearbyUplink() {
    const r = this.relays.find(
      (r) =>
        !r.done && Math.hypot(r.x - this.player.x, r.y - this.player.y) < 130,
    );
    if (!r) return false;
    this.openUplinks(r.x, r.y);
    this.audio.pickup();
    return true;
  }
  openUplinks(x: number, y: number) {
    for (const [i, r] of this.relays.entries())
      if (!r.done && Math.hypot(r.x - x, r.y - y) < 160) {
        r.done = true;
        this.barks.request("uplink");
        this.world.openGate(i);
        this.checkpoint = r.x + 20;
        this.checkpointY = r.y + 2;
        this.health = 3;
        this.emit(
          r.x + 10,
          r.y + 10,
          45,
          [this.accent, "#fff4b1", "#72c5aa"],
          220,
          5,
        );
        this.notify(
          `UPLINK ${i + 1} OVERRIDDEN`,
          i === 0
            ? "Gate open. Jump + hold ↑ to grab the cable."
            : "Both feeds down. Find the Rate Limiter →",
        );
      }
  }
  performReset(x: number, y: number) {
    this.barks.request("reset");
    this.refillFrom = this.usage;
    this.refillFeedback = REFILL_FEEDBACK;
    this.burstSpend = 0;
    this.burstShots = 0;
    this.burstLife = 0;
    this.dryFire = 0;
    this.dryFeedback = 0;
    this.spendFlash = 0;
    this.usage = TOKEN_CAPACITY;
    this.tokenTrail = TOKEN_CAPACITY;
    this.fireTimer = 0;
    this.audio.reset();
    for (const ally of this.living)
      if (
        ally !== this &&
        ally.character === "tibo" &&
        Math.hypot(ally.player.x + 10 - x, ally.player.y + 16 - y) < 180
      ) {
        ally.refillFrom = ally.usage;
        ally.refillFeedback = REFILL_FEEDBACK;
        ally.usage = TOKEN_CAPACITY;
        ally.tokenTrail = TOKEN_CAPACITY;
        ally.fireTimer = 0;
      }
    this.explode(x, y, 110);
    this.rings.push({ x, y, r: 0, max: 145, life: 0.4, color: this.accent });
    this.bullets = this.bullets.filter(
      (b) => !b.hostile || Math.hypot(b.x - x, b.y - y) > 130,
    );
    // Refill + one local impact; subsequent shots always cost tokens.
    this.openUplinks(x, y);
  }
  setThinking(level: number) {
    if (this.character === "dimillian" && this.dimillianKit.special > 0) {
      this.dimillianKit.feedback("FINISH THE MOVE");
      return;
    }
    const next = clamp(level, 0, this.character === "marcus" ? 3 : 2);
    if (next === this.thinking) return;
    const previousTier =
      this.character === "marcus"
        ? this.marcusKit.mode
        : thinkingWeapon(this.thinking).tier;
    if (
      this.character === "marcus" &&
      this.marcusKit.modeAt(next) !== previousTier
    ) {
      this.marcusKit.invader.cancel();
      this.marcusKit.lcd.cancel();
    }
    this.thinking = next;
    const tier =
      this.character === "marcus"
        ? this.marcusKit.mode
        : thinkingWeapon(next).tier;
    if (this.character === "dimillian") this.dimillianKit.changeForm(tier);
    this.modeFeedback = 1.5;
    if (tier !== previousTier) {
      this.modeBurst = 0.5;
      this.audio.tone(
        260 + tier * 180,
        0.14,
        "triangle",
        0.045,
        480 + tier * 240,
      );
      this.modeSound = 0.1;
    } else if (this.modeSound <= 0) {
      this.audio.tone(220 + next * 240, 0.045, "sine", 0.016, 260 + next * 240);
      this.modeSound = 0.065;
    }
    this.hud();
  }
  aimPoint() {
    if (this.networkAim) return this.networkAim;
    if (this.pointer.active) {
      const p = canvasPoint(
        this.pointer.x,
        this.pointer.y,
        this.canvas.getBoundingClientRect(),
      );
      return { x: p.x + this.cam, y: p.y + this.camY };
    }
    return {
      x: this.player.x + 10 + Math.cos(this.aimAngle) * 220,
      y: this.player.y + 16 + Math.sin(this.aimAngle) * 220,
    };
  }
  updateAim() {
    if (this.networkAim) {
      const p = this.networkAim;
      this.aimAngle = Math.atan2(
        p.y - this.player.y - 17,
        p.x - this.player.x - 10,
      );
      this.face = Math.cos(this.aimAngle) >= 0 ? 1 : -1;
      this.aim = Math.atan2(
        Math.sin(this.aimAngle),
        Math.cos(this.aimAngle) * this.face,
      );
      return;
    }
    let ax = 0,
      ay = 0;
    if (this.pointer.active) {
      const pos = canvasPoint(
        this.pointer.x,
        this.pointer.y,
        this.canvas.getBoundingClientRect(),
      );
      ax = pos.x + this.cam - (this.player.x + 10);
      ay = pos.y + this.camY - (this.player.y + 17);
      if (Math.abs(ax) > 0.5) this.face = ax > 0 ? 1 : -1;
    } else {
      ax =
        this.keys.has("KeyA") || this.keys.has("ArrowLeft")
          ? -1
          : this.keys.has("KeyD") || this.keys.has("ArrowRight")
            ? 1
            : 0;
      ay =
        this.keys.has("KeyW") || this.keys.has("ArrowUp")
          ? -1
          : this.keys.has("KeyS") || this.keys.has("ArrowDown")
            ? 1
            : 0;
    }
    if (!ax && !ay) ax = this.face;
    this.aimAngle = Math.atan2(ay, ax);
    this.aim = Math.atan2(ay, ax * this.face);
  }
  shoot() {
    if (this.character === "marcus") {
      this.marcusKit.fire();
      return;
    }
    if (this.character === "pidalf") {
      this.pidalfKit.fire();
      return;
    }
    if (this.character === "dimillian") {
      this.dimillianKit.fireInput(1 / 120, true);
      return;
    }
    if (this.character === "peter") {
      if (this.peterKit.molt > 0) this.peterKit.punchAttack();
      else {
        this.peterKit.command();
        this.peterKit.handAttack();
      }
      return;
    }
    const angle = this.aimAngle,
      mode = thinkingWeapon(this.thinking),
      tier = mode.tier;
    const remaining = spendTokens(this.usage, mode.cost);
    if (remaining === null) {
      this.barks.request("empty");
      this.fireTimer = 0.22;
      this.lastCooldown = 0.22;
      this.dryFire = 0.16;
      this.dryFeedback = 0.8;
      this.burstLife = 0;
      this.muzzle = 0;
      this.spendFlash = 0;
      if (this.dryClick <= 0) {
        this.audio.noise(0.025, 0.025, 2800);
        this.audio.tone(210, 0.04, "square", 0.02, 95);
        this.dryClick = 0.2;
      }
      return;
    }
    this.lastSpend = this.usage - remaining;
    if (this.burstLife <= 0) {
      this.burstSpend = 0;
      this.burstShots = 0;
    }
    this.burstSpend += this.lastSpend;
    this.burstShots++;
    this.burstLife = Math.max(0.7, mode.cooldown + 0.3);
    this.usage = remaining;
    this.spendFlash = 0.6;
    this.dryFire = 0;
    this.dryFeedback = 0;
    const originX = this.player.x + 10,
      originY = this.player.y + 17;
    this.makeNoise(originX, originY, [330, 430, 570][tier]);
    for (const spread of [tier === 0 ? rand(-0.014, 0.014) : 0]) {
      const a = angle + spread;
      this.bullets.push({
        owner: this.id,
        x: originX + Math.cos(a) * 10,
        y: originY + Math.sin(a) * 10,
        vx: Math.cos(a) * (tier === 2 ? 1300 : 850),
        vy: Math.sin(a) * (tier === 2 ? 1300 : 850),
        life: 1.1,
        hostile: false,
        power: mode.power,
        pierce: mode.pierce,
        boost: false,
        tier,
        color: mode.color,
        hit: new Set(),
      });
    }
    this.fireTimer = mode.cooldown;
    this.lastCooldown = this.fireTimer;
    this.muzzle = tier === 2 ? 0.1 : 0.05;
    this.audio.shoot(false, tier);
    this.shotCount++;
    this.debris.casing(originX - 4 * this.face, originY, this.face);
    if (tier === 2) this.shake = Math.max(this.shake, tier === 2 ? 3 : 1.2);
  }
  enemyReaction(
    e: Enemy,
    kind: "spot" | "block" | "hurt" | "attack" | "laugh" = "spot",
  ) {
    if (
      e.dead ||
      e.hacked > 0 ||
      e.voiceCool > 0 ||
      (this.voiceCooldown > 0 && kind !== "laugh")
    )
      return;
    e.voiceCool = 5;
    this.voiceCooldown = 2.8;
    this.lastBark = kind;
    this.audio.robot(
      kind,
      clamp((e.x + 10 - this.cam - W / 2) / (W / 2), -1, 1),
      Math.hypot(e.x - this.player.x, e.y - this.player.y),
    );
  }
  makeNoise(x: number, y: number, radius: number, source?: Enemy) {
    for (const e of this.enemies) {
      if (
        e === source ||
        e.dead ||
        e.hacked > 0 ||
        e.sheep ||
        Math.hypot(e.x + 10 - x, e.y + 12 - y) > radius
      )
        continue;
      if (
        hears(
          e.x + 10,
          e.y + 12,
          x,
          y,
          radius,
          !this.lineOfSight(e.x + 10, e.y + 12, x, y),
          radius >= 1000 ? 0.8 : 0.55,
        )
      )
        hear(e.awareness, x, y, radius >= 1000 ? 8 : 4);
    }
  }
  triggerAlarm(x: number, y: number) {
    // A finite response per sector. Sound reports the blast location, never the player.
    const a = this.alarms
      .filter((a) => Math.hypot(a.x - x, a.y - y) < 900)
      .sort(
        (a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y),
      )[0];
    if (!a || a.triggered) return;
    a.triggered = true;
    a.timer = 2.4;
    a.targetX = x;
    a.targetY = y;
  }
  updateAlarms(dt: number) {
    for (const a of this.alarms) {
      if (a.timer <= 0) continue;
      a.timer -= dt;
      if (a.timer > 0) continue;
      for (const offset of [-55, 55]) {
        const e = this.spawnEnemy(a.x + offset, a.y - 100, "drone");
        e.cool = 1.2;
        hear(e.awareness, a.targetX, a.targetY, 8);
        this.enemies.push(e);
        this.emit(e.x + 10, e.y + 12, 16, ["#ffb47c", "#899e97"], 75, 3, 0.6);
      }
    }
  }
  drawAlarms() {
    const c = this.c;
    for (const a of this.alarms) {
      const x = a.x - this.cam;
      if (x < -100 || x > W + 100) continue;
      rect(c, x - 4, a.y, 8, 38, "#526c5b");
      rect(c, x - 10, a.y - 3, 20, 9, "#1a302e");
      rect(
        c,
        x - 7,
        a.y - 6,
        14,
        6,
        a.timer > 0 && Math.floor(this.time * 8) % 2
          ? "#ff9765"
          : a.triggered
            ? "#805a45"
            : "#a2c28e",
      );
      if (a.timer > 0) {
        text(c, "BACKUP INCOMING", x, a.y - 25, "#ffc193", 9, "center");
        for (const offset of [-55, 55]) {
          c.strokeStyle = "#ffb47c";
          c.lineWidth = 1;
          c.beginPath();
          c.arc(
            x + offset,
            a.y - 85,
            12 + Math.sin(this.time * 9) * 3,
            0,
            Math.PI * 2,
          );
          c.stroke();
          rect(c, x + offset - 2, a.y - 87, 4, 4, "#ffce9c");
        }
      }
    }
  }
  sensor(e: Enemy) {
    return {
      x: e.x + 10,
      y: e.y + 8,
      angle: e.look,
      range: e.type === "turret" ? 440 : e.type === "drone" ? 420 : 360,
      half: e.type === "turret" ? 0.7 : e.type === "drone" ? 1.05 : 0.92,
    };
  }
  seesBody(e: Enemy, p: Body) {
    if (e.stun > 0 || e.hacked > 0) return false;
    const s = this.sensor(e),
      x = p.x + p.w / 2;
    return [0.15, 0.5, 0.85].some(
      (f) =>
        inView(s.x, s.y, s.angle, s.range, s.half, x, p.y + p.h * f) &&
        this.lineOfSight(s.x, s.y, x, p.y + p.h * f),
    );
  }
  enemyTarget(e: Enemy) {
    const candidates: Body[] = this.living.flatMap((actor) => {
      const bodies: Body[] = [actor.player];
      if (actor.character === "tibo" && actor.otherTibo.active)
        bodies.push(actor.otherTibo.active);
      if (
        actor.character === "dimillian" &&
        actor.dimillianKit.paired &&
        !actor.dimillianKit.paired.dead
      )
        bodies.push(actor.dimillianKit.paired);
      if (actor.character === "peter")
        bodies.push(
          ...actor.peterKit.pets.filter(
            (p) => p.hp > 0 && p.state !== "return",
          ),
        );
      return bodies;
    });
    const distance = (p: Body) =>
      Math.hypot(p.x + p.w / 2 - e.x - 10, p.y + p.h / 2 - e.y - 15);
    const visible = candidates
      .filter((p) => this.seesBody(e, p))
      .sort((a, b) => distance(a) - distance(b));
    // Keep a visible target unless another threat is substantially closer.
    const current = e.combatTarget;
    e.combatTarget =
      current &&
      visible.includes(current) &&
      distance(current) <= distance(visible[0]) * 1.35
        ? current
        : visible[0];
    return e.combatTarget;
  }
  claimedByOther(e: Enemy) {
    return this.peers.some(
      (a) =>
        a !== this &&
        (a.dimillianKit.paired === e ||
          a.pidalfKit.controls(e) ||
          a.marcusKit.pacman.controls(e)),
    );
  }
  lineOfSight(x: number, y: number, tx: number, ty: number) {
    const n = Math.ceil(Math.hypot(tx - x, ty - y) / 12);
    for (let i = 1; i < n; i++)
      if (this.world.at(x + ((tx - x) * i) / n, y + ((ty - y) * i) / n))
        return false;
    return true;
  }
  enemyShot(e: Enemy) {
    const target =
      e.hacked > 0
        ? this.enemies.find(
            (other) =>
              other !== e &&
              !other.dead &&
              other.hacked <= 0 &&
              Math.abs(other.x - e.x) < 550,
          )
        : { x: e.lockX - 10, y: e.lockY - 15 };
    if (!target) return;
    const dx = target.x - e.x,
      dy = target.y - e.y,
      a = Math.atan2(dy, dx);
    this.makeNoise(e.x + 10, e.y + 15, 260, e);
    if (e.type === "grenadier") {
      this.grenades.push({
        x: e.x + 10,
        y: e.y - 5,
        vx: clamp(dx * 1.15, -260, 260),
        vy: -330 + clamp(dy * 0.25, -90, 50),
        life: 1.7,
      });
      this.audio.tone(190, 0.13, "triangle", 0.045, 80);
      return;
    }
    for (const spread of e.type === "turret"
      ? [-0.13, 0.13]
      : e.type === "drone"
        ? [-0.1, 0, 0.1]
        : e.type === "gunner"
          ? [-0.055, 0.055]
          : [0])
      this.bullets.push({
        x: e.x + 10 + Math.cos(a) * 18,
        y: e.y + 15,
        vx: Math.cos(a + spread) * 265,
        vy: Math.sin(a + spread) * 265,
        life: 2.4,
        hostile: e.hacked <= 0,
        power: e.hacked > 0 ? 2 : 1,
        pierce: 0,
        boost: e.hacked > 0,
        hit: new Set([e]),
      });
    this.audio.tone(85, 0.08, "sawtooth", 0.018, 50);
  }
  updateGrenades(dt: number) {
    for (const g of this.grenades) {
      g.life -= dt;
      if (
        !this.peers.some((a) => a.pidalfKit.held.some((h) => h.grenade === g))
      ) {
        g.vy += 630 * dt;
        const body = {
            x: g.x - 4,
            y: g.y - 4,
            w: 8,
            h: 8,
            vx: g.vx,
            vy: g.vy,
            grounded: false,
          },
          vx = g.vx,
          vy = g.vy;
        const wall = this.world.move(body, dt);
        g.x = body.x + 4;
        g.y = body.y + 4;
        g.vx = wall ? -vx * 0.5 : body.vx;
        g.vy = body.grounded ? -Math.abs(vy) * 0.4 : body.vy;
      }
      if (g.life <= 0)
        (this.peers.find((a) => a.id === g.owner) ?? this).explode(
          g.x,
          g.y,
          64,
          !!g.owner,
        );
    }
    this.grenades = this.grenades.filter(
      (g) => g.life > 0 && g.y < LEVEL_HEIGHT + 50,
    );
  }
  touchingWall(side: number) {
    const p = this.player;
    return (
      side !== 0 && this.world.overlaps(p.x + side * 2, p.y + 4, p.w, p.h - 8)
    );
  }
  updateBullets(dt: number) {
    for (const b of this.bullets) {
      b.life -= dt;
      const steps = Math.ceil((Math.hypot(b.vx, b.vy) * dt) / 5);
      for (let s = 0; s < steps && b.life > 0; s++) {
        const from = { x: b.x, y: b.y };
        b.x += (b.vx * dt) / steps;
        b.y += (b.vy * dt) / steps;
        let blocked = false;
        for (const actor of this.living) {
          if (
            (actor.character === "dimillian" &&
              actor.dimillianKit.intercept(b, from)) ||
            actor.defense.intercept(b, from) ||
            (actor.character === "peter" && actor.peterKit.deflect(b)) ||
            (actor.character === "tibo" && actor.otherTibo.block(b))
          ) {
            blocked = true;
            break;
          }
          if (
            b.hostile &&
            actor.character === "peter" &&
            actor.peterKit.absorb(b.x, b.y)
          ) {
            b.life = 0;
            blocked = true;
            break;
          }
        }
        if (blocked) continue;
        const tile = this.world.at(b.x, b.y);
        if (tile && !b.hit.has(tile)) {
          b.hit.add(tile);
          const gone = this.world.damage(b.x, b.y, b.hostile ? 1 : b.power);
          if (gone)
            this.emit(b.x, b.y, 6, ["#adba78", "#64774d", "#354d33"], 120, 4);
          else
            this.emit(
              b.x,
              b.y,
              2,
              [b.hostile ? "#ffae6c" : "#d8e9a4"],
              90,
              2,
              0.2,
            );
          if (tile.kind === 3 || tile.kind === 4 || !gone || b.pierce-- <= 0)
            b.life = 0;
        }
        if (b.life <= 0) break;
        if (b.hostile)
          for (const actor of this.living) {
            const e = actor.dimillianKit.paired;
            if (
              e &&
              b.x > e.x &&
              b.x < e.x + e.w &&
              b.y > e.y &&
              b.y < e.y + e.h
            ) {
              e.hp -= b.power;
              e.hurt = 0.12;
              b.life = 0;
              if (e.hp <= 0) actor.kill(e, b.vx * 0.2, -120);
              break;
            }
          }
        if (b.life <= 0) break;
        if (b.hostile) {
          for (const actor of this.living) {
            const p = actor.player;
            if (b.x > p.x && b.x < p.x + p.w && b.y > p.y && b.y < p.y + p.h) {
              actor.damage();
              b.life = 0;
              break;
            }
          }
        } else {
          for (const e of this.enemies)
            if (
              !e.dead &&
              !b.hit.has(e) &&
              b.x > e.x - 2 &&
              b.x < e.x + 22 &&
              b.y > e.y - 2 &&
              b.y < e.y + 30
            ) {
              b.hit.add(e);
              if (e.hacked > 0) {
                continue;
              }
              if (e.type === "shield" && !e.sheep) {
                const defense = shieldHit(
                    b.tier ?? 0,
                    b.boost,
                    e.shieldDown > 0 ? 0 : e.shield,
                    b.vx,
                    b.vy,
                    e.face,
                  ),
                  broken =
                    e.shieldDown <= 0 && e.shield > 0 && defense.shield === 0;
                if (e.shieldDown <= 0) e.shield = defense.shield;
                if (defense.blocked) {
                  this.emit(b.x, b.y, 8, ["#74ccdf", "#d3eff2"], 180, 3, 0.3);
                  b.life = 0;
                  this.audio.tone(900, 0.04, "triangle", 0.035, 550);
                  if (broken) {
                    e.stun = 0.6;
                    e.wind = 0;
                    e.voiceCool = 0;
                    this.voiceCooldown = 0;
                    this.enemyReaction(e, "hurt");
                    this.debris.armor(e.x, e.y + 10, e.face);
                  } else this.enemyReaction(e, "block");
                  continue;
                }
              }
              e.sheep = 0;
              hear(
                e.awareness,
                e.x + 10 - Math.sign(b.vx) * 90,
                e.y + 15 - Math.sign(b.vy) * 40,
              );
              e.hp -= b.power;
              e.hurt = 0.1;
              e.vx += Math.sign(b.vx) * 35;
              e.evade = 0.75;
              if ((b.tier ?? 0) > 0 || b.boost) {
                e.stun = (b.tier ?? 0) === 2 ? 0.45 : 0.18;
                e.wind = 0;
              }
              if (e.hp > 0) this.enemyReaction(e, "hurt");
              this.emit(
                b.x,
                b.y,
                7,
                ["#fff5c1", "#ffbd63", "#488e82"],
                150,
                3,
                0.3,
              );
              this.rings.push({
                x: b.x,
                y: b.y,
                r: 2,
                max: 13,
                life: 0.1,
                color: "#fff1b1",
              });
              if (this.impactSound <= 0) {
                this.audio.impact();
                this.impactSound = 0.055;
              }
              if (e.hp <= 0)
                (this.peers.find((a) => a.id === b.owner) ?? this).kill(
                  e,
                  Math.sign(b.vx) *
                    (b.boost || (b.tier ?? 0) === 2 ? 350 : 190),
                  Math.min(-130, b.vy * 0.2),
                  b.boost,
                );
              if (b.pierce-- <= 0) b.life = 0;
            }
          const boss = this.boss;
          if (
            boss.active &&
            !boss.dead &&
            b.x > boss.x &&
            b.x < boss.x + boss.w &&
            b.y > boss.y &&
            b.y < boss.y + boss.h
          ) {
            if (boss.phase === 2) {
              boss.hp -= b.power;
              this.emit(b.x, b.y, 3, ["#fff1ae", "#fa9b4d"], 90, 3, 0.25);
            } else this.emit(b.x, b.y, 2, ["#7bb8ae"], 60, 2, 0.2);
            b.life = 0;
          }
        }
        for (const barrel of this.barrels)
          if (
            !barrel.dead &&
            !b.hit.has(barrel) &&
            b.x > barrel.x &&
            b.x < barrel.x + 18 &&
            b.y > barrel.y &&
            b.y < barrel.y + 30
          ) {
            b.hit.add(barrel);
            barrel.hp -= b.power;
            if (!b.hostile) barrel.owner = b.owner;
            if (barrel.hp <= 0) barrel.fuse = barrel.fuse || 0.04;
            b.life = 0;
          }
      }
    }
    for (const b of this.bullets)
      if (b.life <= 0 && b.spell) {
        const radius = b.spell;
        b.spell = undefined;
        (this.peers.find((a) => a.id === b.owner) ?? this).dimillianKit.area(
          b.x,
          b.y,
          radius,
          1 + radius / 22,
          false,
          true,
          true,
        );
      }
    this.bullets = this.bullets.filter(
      (b) =>
        b.life > 0 &&
        b.x >= 0 &&
        b.x < COLS * TILE &&
        b.y > -30 &&
        b.y < LEVEL_HEIGHT + 20,
    );
  }
  bossAim() {
    const b = this.boss,
      points = this.living.flatMap((a) => {
        const targets = [{ x: a.player.x + 10, y: a.player.y + 16 }];
        if (a.otherTibo.active)
          targets.push({
            x: a.otherTibo.active.x + 12,
            y: a.otherTibo.active.y + 18,
          });
        if (a.dimillianKit.paired)
          targets.push({
            x: a.dimillianKit.paired.x + 10,
            y: a.dimillianKit.paired.y + 15,
          });
        targets.push(
          ...a.peterKit.pets
            .filter((p) => p.hp > 0)
            .map((p) => ({ x: p.x + 7, y: p.y + 5 })),
        );
        return targets;
      });
    return points.sort(
      (a, c) =>
        Math.hypot(a.x - b.x - 8, a.y - b.y - 33) -
        Math.hypot(c.x - b.x - 8, c.y - b.y - 33),
    )[0];
  }
  updateBoss(dt: number) {
    const b = this.boss;
    if (b.dead) return;
    if (
      this.living.some((a) => a.player.x > 3280) &&
      !b.active &&
      this.relays.every((r) => r.done)
    ) {
      b.active = true;
      this.barks.place("boss");
      this.checkpoint = 3340;
      this.checkpointY = 828;
      this.charges = Math.max(1, this.charges);
      this.notify(
        "429 / RATE LIMITER",
        "Dodge the volley. Hit the orange core when it overheats.",
      );
    }
    if (!b.active) return;
    b.timer += dt;
    if (b.hp <= 0) {
      b.dead = true;
      this.bullets = this.bullets.filter((x) => !x.hostile);
      this.explode(b.x + 38, b.y + 38, 135);
      this.kills++;
      this.notify("RATE LIMIT REMOVED", "Extraction is open. Head right →");
      return;
    }
    if (b.phase === 0 && b.timer > 1.2) {
      b.phase = 1;
      b.timer = 0;
    }
    if (b.phase === 1) {
      const prior = Math.floor((b.timer - dt) / 0.2),
        current = Math.floor(b.timer / 0.2);
      if (current > prior) {
        const target = this.bossAim(),
          a = Math.atan2(target.y - (b.y + 33), target.x - (b.x + 8));
        for (const spread of [-0.2, 0, 0.2])
          this.bullets.push({
            x: b.x + 8,
            y: b.y + 33,
            vx: Math.cos(a + spread) * 250,
            vy: Math.sin(a + spread) * 250,
            life: 2.8,
            hostile: true,
            power: 1,
            pierce: 0,
            boost: false,
            hit: new Set(),
          });
        this.audio.tone(70, 0.12, "sawtooth", 0.025, 40);
      }
      if (b.timer > 1.2) {
        b.phase = 2;
        b.timer = 0;
        this.audio.tone(550, 0.4, "triangle", 0.05, 150);
        this.emit(b.x + 30, b.y, 25, ["#a9bb9a", "#eac77b"], 90, 4, 0.7);
      }
    } else if (b.phase === 2 && b.timer > 3.5) {
      b.phase = 0;
      b.timer = 0;
    }
    for (const actor of this.living)
      if (overlap(actor.player, b)) actor.damage();
  }
  drawReset() {
    const r = this.resetProp;
    if (!r) return;
    const c = this.c,
      x = r.x + r.w / 2 - this.cam,
      y = r.y + r.h;
    rect(c, x - 22, y - 8, 44, 8, "#283d39");
    rect(c, x - 24, y - 3, 48, 4, "#9caa78");
    rect(c, x - 15, y - (r.struck ? 10 : 16), 30, r.struck ? 3 : 9, "#8aac42");
    rect(c, x - 12, y - (r.struck ? 12 : 19), 24, 4, "#e1ff89");
    text(c, "RESET", x, y - 3, "#e6efbf", 7, "center");
    if (!r.landed || r.slam < 0.04) return;
    // Silhouette arrives, pauses over the button, then accelerates downward.
    const slam = clamp((r.slam - 0.22) / 0.18, 0, 1),
      lift = r.slam > 0.46 ? (r.slam - 0.46) * 250 : 0;
    const hy = y - 130 + slam * slam * 120 - lift;
    c.save();
    c.globalAlpha = Math.min(1, (0.7 - r.slam) * 8);
    rect(c, x - 21, hy - 120, 47, 77, "#122326");
    rect(c, x - 24, hy - 56, 53, 13, "#516264");
    rect(c, x - 21, hy - 46, 47, 37, "#ba8864");
    rect(c, x - 18, hy - 43, 41, 29, "#dba47b");
    rect(c, x - 28, hy - 29, 15, 20, "#bb8664");
    rect(c, x - 24, hy - 27, 11, 13, "#e6b48a");
    for (let i = 0; i < 4; i++) {
      rect(c, x - 17 + i * 10, hy - 15, 9, 14, "#a96f55");
      rect(c, x - 17 + i * 10, hy - 15, 8, 10, "#e3ad83");
    }
    rect(c, x - 17, hy - 41, 33, 4, "#efc399");
    if (slam > 0.3 && !r.struck)
      for (let i = 0; i < 4; i++)
        rect(c, x - 38 + i * 25, hy - 70, 2, 40, "#e5edb6");
    c.restore();
  }
  drawActor() {
    const c = this.c;
    if (
      this.state !== "dead" &&
      !(
        this.character === "dimillian" && this.dimillianKit.shield?.kind === 0
      ) &&
      (this.invuln <= 0 || Math.floor(this.time * 18) % 2 === 0)
    ) {
      if (this.character === "marcus") {
        if (!this.marcusKit.lcd.drawHero())
          marcus(
            c,
            this.player.x - this.cam,
            this.player.y,
            this.face,
            this.time,
            Math.abs(this.player.vx) > 15,
            this.aim,
            this.marcusKit.mode,
            this.marcusKit.launch,
            this.marcusKit.catchPose,
            this.marcusKit.flip,
            1,
            this.marcusKit.mode === 1
              ? this.marcusKit.lcd.charge
              : this.marcusKit.invader.charge,
          );
      } else if (this.character === "pidalf")
        pidalf(
          c,
          this.player.x - this.cam,
          this.player.y,
          this.face,
          this.time,
          Math.abs(this.player.vx) > 15,
          this.aim,
          this.pidalfKit.pose,
          this.pidalfKit.grabbing,
          this.pidalfKit.castPose,
          1,
          this.pidalfKit.scale,
          this.pidalfKit.wardPose,
        );
      else if (this.character === "peter")
        peter(
          c,
          this.player.x - this.cam,
          this.player.y,
          this.face,
          this.time,
          Math.abs(this.player.vx) > 15,
          this.peterKit.molt > 0,
          this.peterKit.punch,
          this.aim,
          1,
          this.peterKit.kind,
        );
      else if (this.character === "dimillian")
        dimillian(
          c,
          this.player.x - this.cam,
          this.player.y,
          this.face,
          this.time,
          Math.abs(this.player.vx) > 15,
          this.dimillianKit.form,
          this.aim,
          this.dimillianKit.attack,
          this.dimillianKit.charge / 1.15,
          this.dimillianKit.boosting,
          this.dimillianKit.special > 0,
          1,
          this.dimillianKit.swing
            ? Math.atan2(
                Math.sin(this.dimillianKit.swing.angle),
                Math.cos(this.dimillianKit.swing.angle) * this.face,
              )
            : undefined,
          this.dimillianKit.swing?.step === 3
            ? 140
            : this.dimillianKit.swing?.step === 2
              ? 33
              : 29,
          this.dimillianKit.swing ?? undefined,
        );
      else
        tibo(
          c,
          this.player.x - this.cam,
          this.player.y,
          this.face,
          this.time,
          Math.abs(this.player.vx) > 15,
          false,
          this.muzzle,
          this.aim,
          1,
          thinkingWeapon(this.thinking).tier,
          this.dryFire,
        );
      if (this.wallGrip)
        wallGripPose(
          c,
          this.player.x - this.cam,
          this.player.y,
          this.wallGrip,
          this.time,
          this.character === "peter"
            ? this.peterKit.molt > 0
              ? "#d5a27c"
              : "#607e9d"
            : "#344147",
        );
    }
    if (this.character === "marcus") this.marcusKit.draw();
    if (this.character === "pidalf") this.pidalfKit.draw();
    if (this.character === "peter") this.peterKit.draw();
    if (this.character === "tibo") this.otherTibo.draw();
    if (this.character === "dimillian") this.dimillianKit.draw();
    this.defense.draw();
    this.drawReset();
    if (this.zip) {
      c.strokeStyle = "#c4d48e";
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(this.player.x + 10 - this.cam, this.player.y + 12);
      c.lineTo(this.player.x - this.cam, this.player.y - 10);
      c.stroke();
    }
    for (const p of this.particles) {
      c.globalAlpha = Math.min(1, p.life * 3);
      rect(c, p.x - this.cam, p.y, p.size, p.size, p.color);
    }
    c.globalAlpha = 1;
    for (const r of this.rings) {
      c.globalAlpha = Math.min(1, r.life * 3);
      c.strokeStyle = r.color;
      c.lineWidth = r.life * 12;
      c.beginPath();
      c.arc(r.x - this.cam, r.y, r.r, 0, Math.PI * 2);
      c.stroke();
    }
    c.globalAlpha = 1;
    if (this.arena.coop && this.state !== "dead")
      text(
        c,
        this.id === "p0" ? "P1" : "P2",
        this.player.x + 10 - this.cam,
        this.player.y - 10,
        this.accent,
        8,
        "center",
      );
  }
  updateCosmetics(dt: number) {
    this.barks.update(dt);
    this.time += dt;
    this.impactSound -= dt;
    this.voiceCooldown -= dt;
    this.debris.update(dt, this.world);
    this.shake = Math.max(0, this.shake - dt * 24);
    this.flash = Math.max(0, this.flash - dt);
    this.muzzle = Math.max(0, this.muzzle - dt);
    for (const p of this.particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += p.gravity * dt;
      p.vx *= 1 - dt * 1.5;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
    for (const r of this.rings) {
      r.life -= dt;
      r.r += (r.max - r.r) * dt * 13;
    }
    this.rings = this.rings.filter((r) => r.life > 0);
    if (this.toastTimer > 0) {
      this.toastTimer -= dt;
      if (this.toastTimer <= 0) this.clearToast();
    }
  }
  updateActor(dt: number) {
    this.updateCosmetics(dt);
    if (this.state === "intro") {
      this.introTimer -= dt;
      if (this.introTimer <= 0) this.finishIntro();
      return;
    }
    if (this.state === "dead") {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) this.respawn();
      return;
    }
    if (this.state !== "playing") return;
    this.elapsed += dt;
    if (this.player.x > 1000 && this.player.y < 780) this.barks.place("tower");
    this.modeFeedback = Math.max(0, this.modeFeedback - dt);
    this.modeBurst = Math.max(0, this.modeBurst - dt);
    this.modeSound = Math.max(0, this.modeSound - dt);
    if (this.freeze > 0) {
      this.freeze -= dt;
      if (!this.arena.coop) return;
    }
    this.refillFeedback = Math.max(0, this.refillFeedback - dt);
    this.burstLife = Math.max(0, this.burstLife - dt);
    this.dryFire = Math.max(0, this.dryFire - dt);
    this.dryFeedback = Math.max(0, this.dryFeedback - dt);
    this.dryClick = Math.max(0, this.dryClick - dt);
    this.spendFlash = Math.max(0, this.spendFlash - dt);
    this.tokenTrail = Math.max(this.usage, this.tokenTrail - dt * 500);
    if (this.charges === 0) {
      this.resetRecovery -= dt;
      if (this.resetRecovery <= 0) {
        this.charges = 1;
        this.resetRecovery = RESET_RECOVERY;
        this.audio.tone(440, 0.14, "triangle", 0.035, 660);
      }
    } else this.resetRecovery = RESET_RECOVERY;
    if (this.character === "marcus") this.marcusKit.update(dt);
    if (this.character === "pidalf") this.pidalfKit.update(dt);
    this.defense.update(dt);
    this.updateReset(dt);
    if (this.character === "peter") this.peterKit.update(dt);
    this.otherTibo.update(dt);
    if (this.character === "dimillian") this.dimillianKit.update(dt);
    this.movePlayer(dt);
    const p = this.player;
    if (
      this.character === "peter" &&
      this.keys.has("KeyE") &&
      this.peterKit.throwCooldown <= 0 &&
      !this.relays.some(
        (r) => !r.done && Math.hypot(r.x - p.x, r.y - p.y) < 130,
      )
    )
      this.peterKit.throw();
    const firing =
      this.pointer.down || this.keys.has("KeyJ") || this.pendingShot > 0;
    if (this.character === "marcus") {
      this.marcusKit.fireInput(dt, firing);
      this.pendingShot = 0;
    } else if (this.character === "dimillian") {
      this.dimillianKit.fireInput(dt, firing);
      this.pendingShot = 0;
    } else if (firing && this.fireTimer <= 0) {
      this.shoot();
      this.pendingShot = 0;
    }
    this.pendingShot = Math.max(0, this.pendingShot - dt);
  }
  movePlayer(dt: number, predicting = false, followCamera = true) {
    const p = this.player;
    this.invuln = Math.max(0, this.invuln - dt);
    this.fireTimer -= dt;
    this.jumpBuffer -= dt;
    this.wallLock -= dt;
    this.wallRegrab = Math.max(0, this.wallRegrab - dt);
    this.wallGrace = Math.max(0, this.wallGrace - dt);
    this.zipCooldown = Math.max(0, this.zipCooldown - dt);
    const left = this.keys.has("KeyA") || this.keys.has("ArrowLeft"),
      right = this.keys.has("KeyD") || this.keys.has("ArrowRight");
    const dir = (right ? 1 : 0) - (left ? 1 : 0);
    if (dir && !this.pointer.active) this.face = dir;
    const bunkered =
      this.character === "dimillian" && this.dimillianKit.shield?.kind === 0;
    const flying =
      this.character === "dimillian" && this.dimillianKit.form === 2;
    if (this.character === "marcus" && this.marcusKit.lcd.driving) {
      if (!predicting) this.marcusKit.lcd.move(dt);
    } else if (bunkered) {
      const s = this.dimillianKit.shield!;
      p.x = s.x - 10;
      p.y = s.y - 16;
      p.vx = 0;
      p.vy = 0;
      this.jumpBuffer = 0;
      this.wallGrip = 0;
    } else if (flying) this.dimillianKit.fly(dt, dir);
    else {
      const contact = this.touchingWall(dir)
        ? dir
        : this.touchingWall(1)
          ? 1
          : this.touchingWall(-1)
            ? -1
            : 0;
      if (
        !p.grounded &&
        !this.zip &&
        this.climb === null &&
        contact &&
        this.wallRegrab <= 0
      ) {
        this.lastWall = contact;
        this.wallGrace = 0.12;
      }
      if (p.grounded) this.coyote = 0.09;
      else this.coyote -= dt;
      if (this.wallLock <= 0) {
        const target =
            dir *
            (this.keys.has("ShiftLeft") || this.keys.has("ShiftRight")
              ? 90
              : 235),
          accel = dir ? 2900 : 2200;
        p.vx += clamp(target - p.vx, -accel * dt, accel * dt);
      }
      if (
        !this.zip &&
        this.jumpBuffer > 0 &&
        (this.coyote > 0 || this.wallGrace > 0 || this.climb !== null)
      ) {
        const wallJump =
            this.coyote <= 0 && this.wallGrace > 0 && this.climb === null,
          side = this.lastWall;
        p.vy = -520;
        this.climb = null;
        this.zipCooldown = 0.25;
        if (wallJump) {
          const climbingSameWall = dir === side;
          p.vx = -side * (climbingSameWall ? 75 : 200);
          this.wallLock = climbingSameWall ? 0.025 : 0.07;
          this.wallRegrab = 0.12;
          this.wallGrace = 0;
          this.wallGrip = 0;
          if (!this.pointer.active && !climbingSameWall) this.face = -side;
        }
        this.coyote = 0;
        this.jumpBuffer = 0;
        p.grounded = false;
        if (!predicting) {
          this.audio.jump();
          this.emit(p.x + 10, p.y + 31, 6, ["#adba83", "#63765b"], 55, 3, 0.25);
        }
      }
      const up = this.keys.has("KeyW") || this.keys.has("ArrowUp"),
        down = this.keys.has("KeyS") || this.keys.has("ArrowDown");
      if (
        !this.zip &&
        this.climb === null &&
        this.zipCooldown <= 0 &&
        (up || down)
      ) {
        const i = LADDERS.findIndex(
          (l) =>
            Math.abs(p.x + 10 - l.x) < 22 &&
            p.y + 32 >= l.top - 2 &&
            p.y + 32 <= l.bottom + 5 &&
            (up ? p.y + 32 > l.top + 1 : p.y + 32 < l.bottom - 1),
        );
        if (i >= 0) this.climb = i;
      }
      if (this.climb !== null) {
        const l = LADDERS[this.climb];
        p.x = l.x - 10;
        p.y = clamp(
          p.y + (down ? 1 : up ? -1 : 0) * 150 * dt,
          l.top - 32,
          l.bottom - 32,
        );
        p.vx = 0;
        p.vy = 0;
        this.wall = 0;
        if (p.y <= l.top - 32 && up) {
          this.climb = null;
          p.grounded = true;
          this.coyote = 0.09;
        } else if (p.y >= l.bottom - 32 && down) {
          this.climb = null;
          this.zipCooldown = 0.2;
        }
      }
      const cableY = 250 + ((p.x - 1700) * 320) / 620;
      if (
        !this.zip &&
        this.zipCooldown <= 0 &&
        p.x > 1670 &&
        p.x < 2310 &&
        (this.keys.has("KeyW") || this.keys.has("ArrowUp")) &&
        Math.abs(p.y - cableY - 10) < 36
      ) {
        this.zip = true;
        this.barks.place("cable");
        this.notify("CABLE CONNECTED", "Fire while riding. SPACE to jump off.");
      }
      if (this.zip) {
        p.x += 320 * dt;
        p.y = 250 + ((p.x - 1700) * 320) / 620 + 10;
        p.vx = 0;
        p.vy = 0;
        p.grounded = false;
        if (this.jumpBuffer > 0 || p.x > 2320) {
          this.zip = false;
          this.zipCooldown = 0.5;
          p.vx = 280;
          p.vy = -330;
          this.jumpBuffer = 0;
          this.wallLock = 0.12;
        }
      }
      const fallingSpeed = p.vy,
        wasGrounded = p.grounded;
      if (!this.zip && this.climb === null) {
        p.vy = Math.min(660, p.vy + 1400 * dt);
        if (dir && this.touchingWall(dir) && this.wallRegrab <= 0)
          p.vy = Math.min(p.vy, 55);
        this.wall = this.world.move(p, dt);
      }
      this.wallGrip =
        !p.grounded &&
        !this.zip &&
        this.climb === null &&
        this.wallRegrab <= 0 &&
        dir &&
        this.touchingWall(dir)
          ? dir
          : 0;
      if (!wasGrounded && p.grounded && fallingSpeed > 380)
        if (!predicting) this.makeNoise(p.x + 10, p.y + 30, 140);
      this.footstep -= dt;
      if (p.grounded && Math.abs(p.vx) > 120 && this.footstep <= 0) {
        if (!predicting) this.makeNoise(p.x + 10, p.y + 30, 90);
        this.footstep = 0.32;
      }
    }
    if (!predicting && p.y > LEVEL_HEIGHT + 40) {
      this.die();
      return;
    }
    if (followCamera) {
      const targetCam = clamp(p.x - 320, 0, COLS * TILE - W);
      this.cam += (targetCam - this.cam) * Math.min(1, dt * 7);
      const targetY = clamp(p.y - 330, 0, LEVEL_HEIGHT - H);
      this.camY += (targetY - this.camY) * Math.min(1, dt * 5);
    }
    this.updateAim();
  }
  updateWorld(dt: number) {
    const p = this.player;
    this.updateAlarms(dt);
    this.encounters.update(dt);
    for (const e of this.enemies) {
      if (e.dead) continue;
      if (
        this.peers.some(
          (a) => a.marcusKit.pacman.controls(e) || a.pidalfKit.controls(e),
        )
      )
        continue;
      if ((e.arrival ?? 0) > 0) {
        e.arrival = Math.max(0, e.arrival! - dt);
        e.vy = Math.min(140, e.vy + 350 * dt);
        this.world.move(e, dt);
        e.cool = Math.max(e.cool, 0.5);
        continue;
      }
      if ((e.sheep ?? 0) > 0) {
        e.sheep = Math.max(0, e.sheep! - dt);
        e.wind = 0;
        e.dash = 0;
        e.cool = 0.7;
        e.vx = Math.sin(this.time * 1.4 + e.home) * 18;
        e.vy = Math.min(620, e.vy + 1400 * dt);
        if (
          e.grounded &&
          !this.world.at(e.x + 10 + Math.sign(e.vx) * 17, e.y + 35)
        )
          e.vx = 0;
        this.world.move(e, dt);
        if (e.y > LEVEL_HEIGHT + 50)
          (this.peers.find((a) => a.id === e.flungBy) ?? this).kill(e);
        continue;
      }
      if (this.peers.some((a) => e === a.dimillianKit.paired)) continue;
      e.hurt = Math.max(0, e.hurt - dt);
      e.hacked = Math.max(0, e.hacked - dt);
      e.turn -= dt;
      e.stun = Math.max(0, e.stun - dt);
      e.evade = Math.max(0, e.evade - dt);
      e.voiceCool -= dt;
      e.shieldDown = Math.max(0, e.shieldDown - dt);
      e.cool -= dt;
      e.patrolWait -= dt;
      const a = e.awareness,
        wasCombat = a.state === "combat";
      const target = this.enemyTarget(e),
        sees = !!target;
      perceive(
        a,
        sees,
        target ? target.x + target.w / 2 : a.targetX,
        target ? target.y + target.h / 2 : a.targetY,
        dt,
      );
      if (a.state === "combat" && !wasCombat) {
        this.enemyReaction(e, "spot");
        for (const ally of this.enemies)
          if (
            ally !== e &&
            !ally.dead &&
            ally.hacked <= 0 &&
            Math.hypot(ally.x - e.x, ally.y - e.y) < 340
          )
            hear(ally.awareness, a.targetX, a.targetY);
      }
      e.alert = a.state === "combat";
      // Distant idle guards sleep; alerted guards can still approach the disturbance.
      if (
        this.living.every((a) => Math.abs(e.x - a.player.x) > 950) &&
        a.state === "patrol"
      ) {
        e.wind = 0;
        continue;
      }
      if (e.stun > 0) {
        const speed = Math.hypot(e.vx, e.vy);
        e.vx *= Math.exp(-(e.flung > 0 ? 2 : 10) * dt);
        e.wind = 0;
        e.cool = Math.max(e.cool, 0.35);
        e.vy =
          e.type === "drone"
            ? e.vy * Math.exp(-3 * dt)
            : Math.min(650, e.vy + 1400 * dt);
        const impactVy = e.vy,
          hitWall = this.world.move(e, dt);
        if (
          e.flung > 0 &&
          speed > 290 &&
          (hitWall || (e.grounded && impactVy > 290))
        ) {
          e.hp -= Math.min(8, speed / 100);
          this.debris.armor(e.x, e.y, Math.sign(e.vx) || this.face);
          this.audio.scrap(true);
          this.shake = Math.max(this.shake, 5);
          e.flung = 0;
          if (e.hp <= 0) {
            (this.peers.find((a) => a.id === e.flungBy) ?? this).kill(
              e,
              e.vx,
              -150,
              true,
            );
            continue;
          }
        }
        if (e.flung > 0) {
          e.flung = Math.max(0, e.flung - dt);
          for (const barrel of this.barrels)
            if (!barrel.dead && overlap(e, barrel)) {
              barrel.fuse = barrel.fuse || 0.05;
            }
          for (const other of this.enemies)
            if (
              other !== e &&
              !other.dead &&
              other.stun <= 0 &&
              speed > 180 &&
              overlap(e, other)
            ) {
              other.hp -= 3;
              other.stun = 0.45;
              other.wind = 0;
              other.vx = e.vx * 0.5;
              other.vy = -150;
              if (other.hp <= 0) this.kill(other, other.vx, -150);
              this.emit(
                other.x + 10,
                other.y + 12,
                12,
                ["#ffcd87", "#83dae9"],
                160,
                3,
              );
              e.flung = 0;
            }
        }
        if (e.y > LEVEL_HEIGHT + 50)
          (this.peers.find((a) => a.id === e.flungBy) ?? this).kill(e);
        continue;
      }

      const fighting = sees && a.state === "combat",
        targetDist = Math.abs(a.targetX - (e.x + 10));
      let wanted = e.patrol > 0 ? 0 : Math.PI;
      if (a.state !== "patrol")
        wanted = Math.atan2(a.targetY - (e.y + 8), a.targetX - (e.x + 10));
      if (e.type === "drone" && a.state === "patrol")
        wanted += e.patrol > 0 ? 0.4 : -0.4;
      if (a.state === "search") wanted += Math.sin(this.time * 3) * 1.25;
      if (e.type === "turret" && a.state === "patrol")
        wanted += Math.sin(this.time * 0.6 + e.home) * 0.45;
      e.look = turnToward(e.look, wanted, e.type === "shield" ? 2 : 3.2, dt);
      e.face = Math.cos(e.look) >= 0 ? 1 : -1;
      let walking = 0;
      if (a.state === "investigate")
        walking = Math.sign(a.targetX - (e.x + 10)) * 85;
      else if (a.state === "patrol") {
        if (
          Math.abs(e.x - e.home) > 65 &&
          e.patrol === Math.sign(e.x - e.home)
        ) {
          e.patrol = e.x > e.home ? -1 : 1;
          e.patrolWait = 0.65;
        }
        walking = e.patrolWait > 0 ? 0 : e.patrol * 27;
      }
      if (a.state === "investigate" && (targetDist < 22 || e.type === "turret"))
        reached(a);
      if (a.state === "search") walking = 0;
      if (e.type === "drone") {
        if (e.wind <= 0) {
          const tx =
            a.state === "patrol"
              ? e.home + Math.sin(this.time * 0.65 + e.home) * 70
              : a.state === "search"
                ? e.x
                : a.targetX -
                  10 +
                  (fighting ? Math.sin(this.time * 1.25) * 95 : 0);
          const ty =
            a.state === "patrol"
              ? e.homeY + Math.sin(this.time * 1.5) * 20
              : a.state === "search"
                ? e.y
                : a.targetY - 110;
          const dx = Math.max(-70 * dt, Math.min(70 * dt, tx - e.x)),
            dy = Math.max(-55 * dt, Math.min(55 * dt, ty - e.y));
          if (!this.world.overlaps(e.x + dx, e.y, e.w, e.h)) e.x += dx;
          if (!this.world.overlaps(e.x, e.y + dy, e.w, e.h)) e.y += dy;
          if (a.state === "patrol" && Math.abs(dx) > 0.01)
            e.patrol = Math.sign(dx);
        }
      } else {
        if (e.type === "runner") {
          if (e.wind > 0) {
            e.wind -= dt;
            e.vx = 0;
            if (e.wind <= 0) {
              e.vx = e.face * 350;
              e.vy = -125;
              e.cool = 1.5;
              e.dash = 0.45;
            }
          } else if (e.dash > 0) {
            e.dash -= dt;
            e.vx = e.face * 350;
          } else if (
            fighting &&
            targetDist < 170 &&
            Math.abs(a.targetY - e.y) < 65 &&
            e.cool <= 0
          ) {
            e.wind = 0.45;
            e.vx = 0;
          } else e.vx = fighting ? e.face * 65 : walking;
        } else if (e.type === "turret") e.vx = 0;
        else if (e.grounded) {
          e.vx = fighting
            ? e.type === "gunner" && e.evade > 0
              ? -e.face * 105
              : targetDist > 200
                ? e.face * 50
                : e.type === "shield" && targetDist > 65
                  ? e.face * 35
                  : 0
            : walking;
        }
        if (e.grounded && e.vx !== 0) {
          const dir = Math.sign(e.vx),
            edgeX = e.x + (dir > 0 ? 25 : -5);
          if (
            !this.world.at(edgeX, e.y + e.h + 8) ||
            this.world.overlaps(e.x + dir * 5, e.y, e.w, e.h)
          ) {
            e.vx = 0;
            if (a.state === "patrol" && e.patrolWait <= 0) {
              e.patrol *= -1;
              e.patrolWait = 0.7;
            }
            if (a.state === "investigate") reached(a);
          }
        }
        e.vy = Math.min(650, e.vy + 1400 * dt);
        this.world.move(e, dt);
        if (e.y > LEVEL_HEIGHT + 50)
          (this.peers.find((a) => a.id === e.flungBy) ?? this).kill(e);
      }
      // A committed shot may finish at its old target; fresh attacks require visual confirmation.
      if (e.type !== "runner") {
        if (e.wind > 0) {
          e.wind -= dt;
          if (e.wind <= 0) {
            this.enemyShot(e);
            e.cool =
              e.type === "grenadier"
                ? 2.4
                : e.type === "drone"
                  ? 1.9
                  : e.type === "turret"
                    ? 1.3
                    : 1.7;
          }
        } else if ((fighting || e.hacked > 0) && e.cool <= 0) {
          e.wind =
            e.type === "grenadier" ? 0.75 : e.type === "drone" ? 0.85 : 0.48;
          e.lockX = a.targetX;
          e.lockY = a.targetY;
          if (e.type === "grenadier") this.enemyReaction(e, "attack");
        }
      }
      if (e.hacked <= 0)
        for (const actor of this.living) {
          const body = actor.player;
          if (overlap(body, e)) {
            hear(a, body.x + 10, body.y + 16);
            if (
              !this.living.some(
                (a) =>
                  a.character === "dimillian" &&
                  a.dimillianKit.protects(body) &&
                  a.dimillianKit.blockContact(e),
              )
            )
              actor.damage();
          }
          if (actor.character === "peter")
            for (const pet of actor.peterKit.pets)
              if (overlap(pet, e))
                actor.peterKit.hurtPet(
                  pet,
                  e.type === "runner" && e.dash > 0 ? 2 : 1,
                  0.6,
                );
        }
    }
    for (const b of this.barrels) {
      if (b.dead) continue;
      if (b.fuse > 0) {
        b.fuse -= dt;
        if (b.fuse <= 0) {
          b.dead = true;
          (this.peers.find((a) => a.id === b.owner) ?? this).explode(
            b.x + 9,
            b.y + 15,
          );
          continue;
        }
      }
      if (this.peers.some((a) => a.pidalfKit.held.some((h) => h.body === b)))
        continue;
      if (b.mobile) {
        b.vy = Math.min(850, b.vy + 1100 * dt);
        const speed = Math.hypot(b.vx, b.vy),
          fall = b.vy;
        const steps = Math.max(1, Math.ceil((speed * dt) / 6));
        for (let i = 0; i < steps; i++) {
          const wall = this.world.move(b, dt / steps);
          if (
            speed > 220 &&
            (wall ||
              (b.grounded && fall > 220) ||
              this.enemies.some((e) => !e.dead && overlap(b, e)))
          ) {
            b.fuse = b.fuse || 0.045;
            b.vx *= 0.15;
            break;
          }
        }
        if (b.grounded) b.vx *= Math.exp(-8 * dt);
        else b.angle = (b.angle ?? 0) + b.vx * dt * 0.006;
        if (b.y > LEVEL_HEIGHT + 40) b.dead = true;
        continue;
      }
      if (!this.world.at(b.x + 9, b.y + b.h + 1)) {
        b.y += Math.min(240, Math.max(25, (b.y - BASE - 390) * 5)) * dt;
        if (this.world.at(b.x + 9, b.y + b.h))
          b.y = Math.floor((b.y + b.h) / TILE) * TILE - b.h;
      }
      if (b.y > LEVEL_HEIGHT + 40) b.dead = true;
    }
    this.updateBullets(dt);
    this.updateGrenades(dt);
    this.updateBoss(dt);
  }
  updateObjectives() {
    const p = this.player;
    for (const r of this.rescues) {
      if (!r.done && Math.abs(p.x - r.x) < 48 && Math.abs(p.y - r.y) < 65) {
        r.done = true;
        this.checkpoint = r.x + 15;
        this.checkpointY = r.y + 2;
        this.checkpointIndex++;
        this.totalRescues++;
        this.charges = Math.min(3, this.charges + 1);
        this.health = 3;
        this.usage = TOKEN_CAPACITY;
        this.tokenTrail = TOKEN_CAPACITY;
        this.peterKit.stock = 6;
        this.audio.pickup();
        this.emit(r.x + 12, r.y + 15, 25, [this.accent, "#eaffbe"], 150, 4);
        this.barks.request("rescue");
        this.notify(
          "DEVELOPER RESCUED",
          "Checkpoint saved · health + usage restored · reset banked",
        );
      }
    }
    for (const r of this.relays)
      if (!r.done && !r.supplied && Math.hypot(p.x - r.x, p.y - r.y) < 100) {
        r.supplied = true;
        this.charges = Math.max(1, this.charges);
        this.notify(
          "UPLINK IN RANGE",
          this.character === "dimillian"
            ? "Press E to remotely override the uplink."
            : this.character === "peter"
              ? "Press E to let the claws override it."
              : "Throw F so the reset lands beside the uplink.",
        );
      }
    if (this.boss.dead && p.x > 3890) {
      for (const actor of this.peers) actor.win();
    }
  }
}
