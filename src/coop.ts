import Peer, { type DataConnection } from "peerjs";
import type { Game } from "./game";
import { PlayerRuntime } from "./player-runtime";
import { StateWriter, applyState, type WorldPacket } from "./coop-state";
import {
  CONTROL_KEYS,
  applyInput,
  neutralInput,
  validInput,
  type InputFrame,
} from "./coop-input";
import { showRoster } from "./roster";
import { clamp, COLS, TILE, LEVEL_HEIGHT } from "./world";
import { W, H, text } from "./art";
const PROTOCOL = 2,
  BUILD =
    typeof __COOP_BUILD__ === "undefined" ? "development" : __COOP_BUILD__,
  characters = ["tibo", "peter", "dimillian", "pidalf", "marcus", "theo"];
const escapeHTML = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
const token = () => crypto.randomUUID().replaceAll("-", "");
const timeoutMessage =
  "Could not reach your friend. Keep the host tab open, then retry. Some work/VPN networks block WebRTC; try another network.";
type History = {
  seq: number;
  dt: number;
  keys: string[];
  jump: number;
  aim: { x: number; y: number };
};
async function pack(packet: WorldPacket) {
  const raw = new TextEncoder().encode(JSON.stringify(packet));
  return new Response(
    new Blob([raw]).stream().pipeThrough(new CompressionStream("gzip")),
  ).arrayBuffer();
}
async function unpack(bytes: ArrayBuffer): Promise<WorldPacket> {
  if (ArrayBuffer.isView(bytes))
    bytes = bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength,
    ) as ArrayBuffer;
  if (!(bytes instanceof ArrayBuffer) || bytes.byteLength > 512000)
    throw Error("Invalid packet size");
  const stream = new Blob([bytes])
      .stream()
      .pipeThrough(new DecompressionStream("gzip")),
    reader = stream.getReader();
  let size = 0;
  const chunks: Uint8Array[] = [];
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 4000000) {
      await reader.cancel();
      throw Error("Snapshot too large");
    }
    chunks.push(value);
  }
  const joined = new Uint8Array(size);
  let offset = 0;
  for (const c of chunks) {
    joined.set(c, offset);
    offset += c.length;
  }
  return JSON.parse(new TextDecoder().decode(joined));
}
export class CoopSession {
  role: "solo" | "host" | "guest" = "solo";
  running = false;
  launching = false;
  menu = false;
  status = "";
  invite = "";
  private peer: Peer | null = null;
  private conn: DataConnection | null = null;
  private secret = "";
  private timer = 0;
  private sendTimer = 0;
  private lastInput = 0;
  private lastPacket = 0;
  private tick = 0;
  private seq = 0;
  private ack = 0;
  private lastTick = -1;
  private writer = new StateWriter();
  private packing = false;
  private edges: [string, boolean][] = [];
  private history: History[] = [];
  private incoming: InputFrame[] = [];
  private connectTimer: ReturnType<typeof setTimeout> | null = null;
  private decoding = Promise.resolve();
  private ending = false;
  private entitySamples = new Map<
    number,
    { x: number; y: number; targetX: number; targetY: number }
  >();
  private samples = new Map<
    string,
    { x: number; y: number; targetX: number; targetY: number }
  >();
  bytesPerSecond = 0;
  private bytes = 0;
  private byteClock = 0;
  rtt = 0;
  private pingClock = 0;
  constructor(public g: Game) {
    if (!g.preview)
      window.addEventListener("pagehide", () => {
        if (this.active) this.close();
      });
  }
  get active() {
    return this.role !== "solo";
  }
  get guest() {
    return this.running && this.role === "guest";
  }
  roster() {
    const bottom = document.querySelector(".roster-deploy");
    if (!bottom) return;
    const params = new URLSearchParams(location.hash.slice(1)),
      room = params.get("room"),
      key = params.get("key");
    const button = document.createElement("button");
    button.className = "coop-button";
    button.id = "coop-start";
    button.textContent = room && key ? "JOIN FRIEND →" : "HOST CO-OP ↗";
    bottom.insertBefore(button, document.querySelector("#start"));
    button.onclick = () => (room && key ? this.join(room, key) : this.host());
    const caption = document.createElement("div");
    caption.className = "coop-status";
    caption.id = "coop-status";
    caption.setAttribute("role", "status");
    caption.textContent = room
      ? "INVITE RECEIVED · SELECT YOUR BRO, THEN JOIN"
      : "2 BROS · INDEPENDENT CAMERAS · NO FRIENDLY FIRE";
    document.querySelector(".roster-bottom")?.before(caption);
  }
  private message(message: string) {
    this.status = message;
    const el = document.querySelector("#coop-status");
    if (el) el.textContent = message;
  }
  private makePeer() {
    // Explicit direct-connect configuration: PeerJS's bundled public TURN hosts are unavailable.
    // A managed relay can be added here later; never put a provider API secret in the browser.
    const peer = new Peer({
      config: {
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:stun.cloudflare.com:3478",
            ],
          },
        ],
      },
    });
    this.peer = peer;
    peer.on("error", (e) => {
      if (this.ending) return;
      this.fail(
        e.type === "peer-unavailable"
          ? "This room is no longer available. Ask your friend for a fresh invite."
          : `${timeoutMessage} (${e.type})`,
      );
    });
    peer.on("disconnected", () => {
      if (this.running) {
        this.message(
          "Signaling disconnected · existing game connection remains active",
        );
      } else if (this.role === "host")
        this.fail("Room service disconnected. Create a fresh invite.");
    });
    return peer;
  }
  host() {
    if (this.active) return;
    this.role = "host";
    this.ending = false;
    this.secret = token();
    this.message("OPENING CO-OP ROOM…");
    const peer = this.makePeer();
    this.armTimeout();
    peer.on("open", (id) => {
      this.clearTimeout();
      this.invite = `${location.origin}${location.pathname}#room=${encodeURIComponent(id)}&key=${this.secret}`;
      this.message("ROOM OPEN · SEND YOUR FRIEND THE INVITE");
      const button = document.querySelector<HTMLButtonElement>("#coop-start");
      if (button) {
        button.textContent = "COPY INVITE ↗";
        button.onclick = () => this.copyInvite();
      }
      this.showInvite();
      const start = document.querySelector<HTMLButtonElement>("#start");
      if (start) {
        start.disabled = true;
        start.textContent = "WAITING FOR YOUR FRIEND";
      }
    });
    peer.on("connection", (c) => {
      if (this.conn || this.running) {
        c.on("open", () => {
          c.send({ type: "reject", reason: "This room already has two bros." });
          setTimeout(() => c.close(), 200);
        });
        return;
      }
      let accepted = false;
      const t = setTimeout(() => c.close(), 12000);
      c.on("data", (message) => {
        const m = message as any;
        if (accepted) return;
        if (m?.type !== "hello" || m.key !== this.secret) {
          c.close();
          return;
        }
        if (this.conn) {
          c.send({ type: "reject", reason: "This room is full." });
          c.close();
          return;
        }
        if (
          m.protocol !== PROTOCOL ||
          m.build !== BUILD ||
          !characters.includes(m.character)
        ) {
          c.send({
            type: "reject",
            reason:
              "Different game versions. Both reload the page, then create a new room.",
          });
          setTimeout(() => c.close(), 200);
          return;
        }
        accepted = true;
        clearTimeout(t);
        this.conn = c;
        this.bind(c);
        this.beginHost(m.character);
      });
    });
  }
  private showInvite() {
    const old = document.querySelector(".coop-invite");
    old?.remove();
    const row = document.createElement("div");
    row.className = "coop-invite";
    const input = document.createElement("input");
    input.readOnly = true;
    input.value = this.invite;
    input.setAttribute("aria-label", "Co-op invite link");
    input.onclick = () => input.select();
    const cancel = document.createElement("button");
    cancel.textContent = "CANCEL ROOM";
    cancel.onclick = () => {
      this.close();
      showRoster(this.g);
    };
    row.append(input, cancel);
    document.querySelector(".roster-bottom")?.before(row);
  }
  private async copyInvite() {
    try {
      await navigator.clipboard.writeText(this.invite);
      this.message("INVITE COPIED · YOUR FRIEND PICKS A BRO AND JOINS");
    } catch {
      document.querySelector<HTMLInputElement>(".coop-invite input")?.select();
      this.message("SELECT AND COPY THE INVITE BELOW");
    }
  }
  join(room: string, key: string) {
    if (this.active) return;
    if (!/^[\w-]{1,100}$/.test(room) || !/^[\da-f]{32}$/.test(key)) {
      this.message("Invalid invite. Ask your friend for a new link.");
      return;
    }
    this.role = "guest";
    this.ending = false;
    this.secret = key;
    this.message("CONNECTING TO YOUR FRIEND…");
    this.armTimeout();
    const peer = this.makePeer();
    const button = document.querySelector<HTMLButtonElement>("#coop-start");
    if (button) button.disabled = true;
    peer.on("open", () => {
      const c = peer.connect(room, { reliable: true, serialization: "binary" });
      this.conn = c;
      this.bind(c);
      c.on("open", () =>
        c.send({
          type: "hello",
          protocol: PROTOCOL,
          build: BUILD,
          key,
          character: this.g.character,
        }),
      );
    });
  }
  private bind(c: DataConnection) {
    c.on("close", () => {
      if (!this.ending && this.conn === c)
        this.fail(
          this.role === "guest"
            ? "HOST DISCONNECTED · This mission has ended."
            : "YOUR FRIEND DISCONNECTED · Create a new room to play together again.",
        );
    });
    c.on("error", () => {
      if (!this.ending && this.conn === c) this.fail(timeoutMessage);
    });
    c.on("data", (message) => {
      const m = message as any;
      if (!m || typeof m !== "object") return;
      if (m.type === "leave") {
        this.fail(
          this.role === "guest"
            ? "HOST LEFT · This mission has ended."
            : "YOUR FRIEND LEFT · This mission has ended.",
        );
        return;
      }
      if (m.type === "reject") {
        this.fail(m.reason);
        return;
      }
      if (m.type === "ping") {
        c.send({ type: "pong", time: m.time });
        return;
      }
      if (m.type === "pong" && typeof m.time === "number") {
        this.rtt = Math.round(performance.now() - m.time);
        return;
      }
      if (this.role === "host" && m.type === "input") {
        if (
          !this.running ||
          !validInput(m.frame) ||
          m.frame.seq <= this.ack ||
          this.incoming.length >= 64
        )
          return;
        this.incoming.push(m.frame);
        this.lastInput = performance.now();
        return;
      }
      if (this.role === "guest" && m.type === "state") {
        this.lastPacket = performance.now();
        this.decoding = this.decoding
          .then(async () => {
            if (this.ending || this.conn !== c) return;
            const packet = await unpack(m.data);
            if (this.ending || this.conn !== c || packet.tick <= this.lastTick)
              return;
            if (!this.running) {
              if (!packet.full) throw Error("Missing initial world");
              this.beginGuest();
            }
            this.receive(packet);
          })
          .catch((error) => {
            console.error("Co-op snapshot:", error);
            this.fail(
              "The game state could not be read. Both reload and create a new room.",
            );
          });
      }
    });
  }
  private beginHost(character: PlayerRuntime["character"]) {
    const g = this.g;
    g.id = "p0";
    this.launching = true;
    g.start();
    this.launching = false;
    g.finishIntro();
    const friend = new PlayerRuntime(g.canvas, false, g.arena);
    friend.id = "p1";
    friend.character = character;
    friend.state = "playing";
    friend.player.x = 125;
    friend.invuln = 2;
    friend.networkAim = { x: 350, y: 840 };
    friend.audio.ctx = g.audio.ctx;
    friend.barks.request("spawn");
    this.running = true;
    this.attachSounds();
    this.lastInput = performance.now();
    this.lastPacket = performance.now();
    this.tick = 1;
    this.writer = new StateWriter();
    this.clearTimeout();
    this.message("CO-OP CONNECTED");
    g.notify(
      "TWO BROS. ONE REFINERY.",
      "Shields protect both bros · no friendly fire · independent respawns",
    );
    void this.sendState(true);
  }
  private attachSounds() {
    for (const actor of this.g.peers)
      actor.audio.onSound = (method, args) => {
        if (
          this.running &&
          !this.g.arena.replica &&
          this.g.arena.sounds.length < 120
        )
          this.g.arena.sounds.push({ actor: actor.id, method, args });
      };
  }
  private beginGuest() {
    const g = this.g;
    g.id = "p1";
    this.launching = true;
    g.start();
    this.launching = false;
    g.finishIntro();
    const host = new PlayerRuntime(g.canvas, false, g.arena);
    host.id = "p0";
    host.state = "playing";
    host.audio = g.audio;
    g.arena.replica = true;
    this.running = true;
    this.clearTimeout();
    this.history = [];
    this.lastPacket = performance.now();
    this.message("CO-OP CONNECTED");
    history.replaceState(null, "", location.pathname + location.search);
    g.notify(
      "CO-OP CONNECTED",
      "Your camera follows you. Stay close enough to help each other.",
    );
  }
  key(code: string, down: boolean) {
    if (!this.guest || !CONTROL_KEYS.has(code)) return false;
    if (this.menu) return true;
    this.edges.push([code, down]);
    if (down) {
      this.g.keys.add(code);
      if (code === "Space") this.g.jumpBuffer = 0.12;
      if (/^Digit[1-4]$/.test(code))
        this.g.setThinking(Number(code.at(-1)) - 1);
    } else {
      this.g.keys.delete(code);
      if (code === "Space" && this.g.player.vy < -180) this.g.player.vy = -180;
    }
    return true;
  }
  before(dt: number) {
    if (!this.running) return false;
    this.timer += dt;
    this.sendTimer += dt;
    this.pingClock += dt;
    if (this.pingClock > 2 && this.conn?.open) {
      this.pingClock = 0;
      this.conn.send({ type: "ping", time: performance.now() });
    }
    if (this.role === "host") {
      for (const a of this.g.peers)
        if (a !== this.g)
          a.audio.muted =
            this.g.audio.muted ||
            Math.hypot(
              a.player.x - this.g.player.x,
              a.player.y - this.g.player.y,
            ) > 720;
      if (performance.now() - this.lastInput > 15000) {
        this.fail(
          "YOUR FRIEND LOST CONNECTION · Create a fresh room to reconnect.",
        );
        return true;
      }
      const friend = this.g.peers.find((a) => a.id === "p1");
      if (friend) {
        for (const frame of this.incoming) {
          if (frame.seq > this.ack) {
            applyInput(friend, frame);
            this.ack = frame.seq;
          }
        }
        this.incoming = [];
        if (performance.now() - this.lastInput > 650) neutralInput(friend);
      }
      return false;
    }
    if (performance.now() - this.lastPacket > 15000) {
      this.fail("HOST CONNECTION LOST · The mission has ended.");
      return true;
    }
    const g = this.g;
    if (this.menu) {
      g.keys.clear();
      g.pointer.down = false;
      g.pendingShot = 0;
    }
    this.seq++;
    const aim = g.aimPoint();
    this.history.push({
      seq: this.seq,
      dt,
      keys: [...g.keys],
      jump: g.jumpBuffer,
      aim,
    });
    if (this.history.length > 240) this.history.shift();
    if (g.state === "playing") g.movePlayer(dt, true);
    for (const actor of g.peers) {
      actor.updateCosmetics(dt);
      if (actor !== g) {
        const s = this.samples.get(actor.id);
        if (s) {
          s.x += (s.targetX - s.x) * Math.min(1, dt * 22);
          s.y += (s.targetY - s.y) * Math.min(1, dt * 22);
          actor.player.x = s.x;
          actor.player.y = s.y;
        }
      }
    }
    for (const e of g.enemies) {
      if (e.id === undefined) continue;
      const s = this.entitySamples.get(e.id);
      if (s) {
        s.x += (s.targetX - s.x) * Math.min(1, dt * 24);
        s.y += (s.targetY - s.y) * Math.min(1, dt * 24);
        e.x = s.x;
        e.y = s.y;
      }
    }
    if (this.sendTimer >= 1 / 30) {
      this.sendTimer = 0;
      const frame: InputFrame = {
        seq: this.seq,
        keys: [...g.keys],
        edges: this.edges.splice(0, 40),
        down: g.pointer.down,
        tap: g.pendingShot > 0,
        aim,
        thinking: g.thinking,
      };
      g.pendingShot = 0;
      if (this.conn?.open) this.conn.send({ type: "input", frame });
    }
    g.hudTimer -= dt;
    if (g.hudTimer <= 0) {
      g.hudTimer = 0.05;
      g.hud();
    }
    return true;
  }
  after(dt: number) {
    if (!this.running || this.role !== "host") return;
    this.tick++;
    this.byteClock += dt;
    if (this.byteClock >= 1) {
      this.bytesPerSecond = this.bytes;
      this.bytes = 0;
      this.byteClock = 0;
    }
    if (this.sendTimer >= 1 / 20) {
      this.sendTimer = 0;
      void this.sendState();
    }
  }
  private async sendState(full = false) {
    const conn = this.conn;
    if (!conn?.open || this.packing || conn.dataChannel.bufferedAmount > 256000)
      return;
    this.packing = true;
    try {
      const packet = this.writer.capture(this.g, this.tick, this.ack, full),
        data = await pack(packet);
      if (conn.open) {
        conn.send({ type: "state", data });
        this.bytes += data.byteLength;
      }
    } catch {
      if (conn !== this.conn) return;
      this.fail(
        "Unable to synchronize the mission. Reload and try a new room.",
      );
    } finally {
      this.packing = false;
    }
  }
  private receive(packet: WorldPacket) {
    const g = this.g,
      oldCharacter = g.character,
      keys = g.keys,
      pointer = g.pointer,
      thinking = g.thinking,
      jump = g.jumpBuffer;
    const previousEnemies = new Map(
        g.enemies.map((e) => [e.id, { x: e.x, y: e.y }]),
      ),
      health = g.health;
    const previous = g.peers.map((a) => ({
      id: a.id,
      x: a.player.x,
      y: a.player.y,
    }));
    applyState(g, packet);
    this.lastTick = packet.tick;
    if (g.health < health) {
      g.flash = 0.18;
      g.shake = 7;
    }
    g.keys = keys;
    g.pointer = pointer;
    g.networkAim = null;
    // Replay only unacknowledged movement. Damage, terrain, pets and abilities stay authoritative.
    this.history = this.history.filter((h) => h.seq > packet.ack);
    if (g.state === "playing")
      for (const h of this.history) {
        g.keys = new Set(h.keys);
        g.networkAim = h.aim;
        g.jumpBuffer = h.jump;
        g.movePlayer(h.dt, true, false);
      }
    g.keys = keys;
    g.pointer = pointer;
    g.networkAim = null;
    g.jumpBuffer = jump;
    g.thinking = thinking;
    if (oldCharacter !== g.character) g.selectCharacter(g.character);
    for (const a of g.peers)
      if (a !== g) {
        const old = previous.find((p) => p.id === a.id)!;
        const far = Math.hypot(a.player.x - old.x, a.player.y - old.y) > 180;
        this.samples.set(a.id, {
          x: far ? a.player.x : old.x,
          y: far ? a.player.y : old.y,
          targetX: a.player.x,
          targetY: a.player.y,
        });
      }
    this.entitySamples.clear();
    for (const e of g.enemies) {
      if (e.id === undefined) continue;
      const old = previousEnemies.get(e.id);
      if (old && Math.hypot(e.x - old.x, e.y - old.y) < 150)
        this.entitySamples.set(e.id, { ...old, targetX: e.x, targetY: e.y });
    }
    g.cam = clamp(g.cam, 0, COLS * TILE - W);
    g.camY = clamp(g.camY, 0, LEVEL_HEIGHT - H);
    if (g.state === "won" && !document.querySelector("#panel-action")) g.win();
  }
  pause() {
    if (!this.running) return false;
    this.menu = true;
    neutralInput(this.g);
    this.edges = [];
    this.g.panel(
      "CO-OP STAYS LIVE.",
      "Your bro is still in the refinery.",
      "BACK TO YOUR BRO",
      () => this.resume(),
      '<button class="text-btn" id="leave-coop">LEAVE CO-OP</button>',
    );
    document.querySelector("#leave-coop")!.addEventListener("click", () => {
      this.close();
      showRoster(this.g);
    });
    return true;
  }
  resume() {
    this.menu = false;
    document.querySelector("#overlay")?.setAttribute("hidden", "");
    this.g.canvas.focus();
  }
  draw() {
    if (!this.running) return;
    const g = this.g,
      c = g.c;
    const friend = g.peers.find((a) => a !== g);
    if (!friend) return;
    const label =
      friend.state === "dead"
        ? `${friend.character.toUpperCase()} · RECONNECTING`
        : `${friend.character.toUpperCase()} · ${"♥".repeat(Math.max(0, friend.health))}`;
    text(c, label, 20, H - 20, friend.accent, 10);
    text(
      c,
      `${this.role === "host" ? "HOST" : "CO-OP"} · ${this.rtt}ms`,
      W - 16,
      H - 20,
      "#c5cbd4",
      9,
      "right",
    );
    const x = friend.player.x + 10 - g.cam,
      y = friend.player.y + 16 - g.camY;
    if (x < 15 || x > W - 15 || y < 110 || y > H - 40) {
      const xx = clamp(x, 22, W - 22),
        yy = clamp(y, 125, H - 55);
      text(
        c,
        x < 15 ? "◀" : x > W - 15 ? "▶" : y < 110 ? "▲" : "▼",
        xx,
        yy,
        friend.accent,
        15,
        "center",
      );
      text(
        c,
        "P" + (friend.id === "p0" ? "1" : "2"),
        xx,
        yy - 16,
        friend.accent,
        8,
        "center",
      );
    }
  }
  private armTimeout() {
    this.clearTimeout();
    this.connectTimer = setTimeout(() => this.fail(timeoutMessage), 25000);
  }
  private clearTimeout() {
    if (this.connectTimer) clearTimeout(this.connectTimer);
    this.connectTimer = null;
  }
  private fail(message: string) {
    this.close();
    this.g.rosterPreview?.destroy();
    this.g.rosterPreview = null;
    this.g.canvas.parentElement?.classList.remove("roster-open");
    this.g.state = "paused";
    this.g.panel(
      "CONNECTION CLOSED",
      escapeHTML(String(message).slice(0, 500)),
      "BACK TO ROSTER",
      () => showRoster(this.g),
    );
  }
  close() {
    this.ending = true;
    this.clearTimeout();
    this.running = false;
    this.launching = false;
    this.menu = false;
    if (this.conn?.open) this.conn.send({ type: "leave" });
    this.conn?.close();
    this.peer?.destroy();
    this.conn = null;
    this.peer = null;
    this.role = "solo";
    this.g.arena.replica = false;
    for (const a of this.g.peers) neutralInput(a);
    this.g.arena.players = [this.g];
    this.g.id = "p0";
    this.g.networkAim = null;
    this.history = [];
    this.incoming = [];
    this.edges = [];
    this.samples.clear();
    this.entitySamples.clear();
    this.lastTick = -1;
    this.ack = 0;
    this.seq = 0;
    this.sendTimer = 0;
    this.g.arena.effects = [];
    this.g.arena.sounds = [];
    this.g.arena.notices = [];
    this.g.audio.onSound = null;
    this.packing = false;
  }
  snapshot() {
    return {
      role: this.role,
      running: this.running,
      invite: this.invite,
      status: this.status,
      rtt: this.rtt,
      tick: this.role === "host" ? this.tick : this.lastTick,
      bytesPerSecond: this.bytesPerSecond,
      players: this.g.peers.map((a) => ({
        id: a.id,
        character: a.character,
        state: a.state,
        x: a.player.x,
        y: a.player.y,
        health: a.health,
        usage: a.usage,
        kills: a.kills,
      })),
    };
  }
}
