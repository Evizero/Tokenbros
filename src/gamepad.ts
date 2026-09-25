import type { Game } from './game';
import { padKeys, readPad } from './gamepad-input';

/** Adapts a pad to the same press/release path used by keyboard and co-op. */
export class Controller {
  active = false;
  private index: number | null = null;
  private previous = Array<boolean>(17).fill(false);
  private axes = [0, 0, 0, 0];
  private held = new Set<string>();
  private blocked = new Set<number>();
  private shooting = false;
  private aim = { x: 220, y: 0 };
  private context = '';
  private direction = '';
  private repeatAt = 0;
  private modeHeld = 0;
  private focusLost = false;
  private hintsAt = 0;
  constructor(private g: Game) {
    window.addEventListener('keydown', () => this.keyboard(), true);
    window.addEventListener('pointerdown', () => this.keyboard(), true);
    window.addEventListener('pointermove', e => { if (e.movementX || e.movementY) this.keyboard(); }, true);
    window.addEventListener('wheel', () => this.keyboard(), true);
    window.addEventListener('blur', () => this.suspend());
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.suspend(); });
  }
  private suspend() { this.focusLost = true; this.release(); }
  private release() {
    for (const key of this.held) this.g.release(key);
    this.held.clear();
    if (this.shooting) { this.g.pointer.down = false; this.g.pendingShot = 0; }
    this.shooting = false;
  }
  private keyboard() {
    if (!this.active) return;
    this.release(); this.active = false; this.g.controllerAim = null; this.g.pointer.active = false;
    document.documentElement.dataset.input = 'keyboard'; this.g.hud();
  }
  poll(dt: number, now: number) {
    let pads: (Gamepad | null)[];
    try { pads = Array.from(navigator.getGamepads?.() ?? []); } catch { return; }
    let pad = pads.find(p => p?.connected && p.mapping === 'standard' && p.index === this.index);
    if (!pad && this.index !== null) {
      const wasActive = this.active;
      this.keyboard(); this.index = null; this.previous.fill(false);
      if (wasActive && this.g.state === 'playing' && !this.g.coop.menu) this.g.pause();
    }
    pad ??= pads.find(p => p?.connected && p.mapping === 'standard');
    if (!pad) return;
    this.index = pad.index;
    const p = readPad(pad), b = p.buttons;
    const edge = (i: number) => b[i] && !this.previous[i];
    const axes = [p.move.x, p.move.y, p.aim.x, p.aim.y];
    const activity = b.some((v,i) => v && !this.previous[i]) || axes.some((v,i) => Math.abs(v) > .15 && Math.abs(v - this.axes[i]) > .08);
    if (document.hidden || this.focusLost) {
      // A held trigger must never fire as focus returns.
      this.previous = b; this.axes = axes;
      if (!document.hidden && document.hasFocus() && !b.some(Boolean) && axes.every(v => Math.abs(v) < .15)) this.focusLost = false;
      return;
    }
    if (activity && !this.active) {
      for (const key of [...this.g.keys]) this.g.release(key);
      this.active = true; this.aim = {x: this.g.face * 220, y: 0};
      document.documentElement.dataset.input = 'controller';
      this.g.audio.start(); this.hints();
    }
    const dialog = document.querySelector<HTMLDialogElement>('#options');
    const context = dialog?.open ? 'options' : this.g.coop.menu ? 'menu' : this.g.state;
    if (context !== this.context) {
      this.release(); this.direction = ''; this.modeHeld = 0;
      // Block buttons held across a screen transition; require a fresh press.
      b.forEach((v,i) => { if (v && this.previous[i]) this.blocked.add(i); });
      this.context = context;
    }
    b.forEach((v,i) => { if (!v) this.blocked.delete(i); });
    if (this.active) {
      if (context === 'playing') {
        if (edge(9) || edge(8)) { this.release(); this.g.pause(); }
        else {
          this.updateAim(p.aim);
          const usable = {...p, buttons: b.map((v,i) => v && !this.blocked.has(i))};
          const keys = padKeys(usable);
          for (const key of this.held) if (!keys.has(key)) this.g.release(key);
          for (const key of keys) if (!this.held.has(key)) this.g.press(key);
          this.held = keys;
          const fire = usable.buttons[7];
          if (fire && !this.shooting) { this.g.pendingShot = .14; this.g.audio.start(); }
          this.g.pointer.down = fire; this.shooting = fire;
          const mode = (usable.buttons[15] ? 1 : 0) - (usable.buttons[14] ? 1 : 0);
          if (mode) {
            if (mode !== this.modeHeld) this.g.setThinking(Math.max(0, Math.min(2, (mode > 0 ? Math.floor(this.g.thinking) : Math.ceil(this.g.thinking)) + mode)));
            else this.g.setThinking(this.g.thinking + mode * dt * 1.2);
          }
          this.modeHeld = mode;
        }
      } else if (context === 'intro') {
        if (edge(0) || edge(9) || edge(1)) this.g.finishIntro();
      } else if (context !== 'dead') {
        this.menu(p, edge, context, now, dt);
      }
      if (now > this.hintsAt) { this.hints(); this.hintsAt = now + 80; }
    }
    this.previous = b; this.axes = axes;
  }
  private updateAim(stick: {x:number;y:number}) {
    const g = this.g, length = Math.hypot(stick.x, stick.y);
    if (length > 0) {
      // Stick angle aims; pressure sets reach for grabs, grapples and teleports.
      const reach = 35 + length * 325;
      this.aim = {x: stick.x / length * reach, y: stick.y / length * reach};
    }
    const bot = g.dimillianKit.remoteDriving ? g.dimillianKit.paired : null;
    const x = bot ? bot.x + bot.w / 2 : g.player.x + 10;
    const y = bot ? bot.y + bot.h / 2 : g.bodyY + 1;
    g.controllerAim = {x: x + this.aim.x, y: y + this.aim.y};
    g.pointer.active = true; g.updateAim();
  }
  private menu(p: ReturnType<typeof readPad>, edge: (i:number)=>boolean, context: string, now:number, dt:number) {
    const dialog = document.querySelector<HTMLDialogElement>('#options');
    if (dialog?.open) dialog.scrollTop += p.aim.y * dt * 420;
    if (edge(1) || edge(8) || edge(9) && context !== 'title') {
      if (dialog?.open) dialog.close();
      else if (context === 'paused' || this.g.coop.menu) this.g.resume();
      return;
    }
    if (context === 'title' && edge(9)) { document.querySelector<HTMLButtonElement>('#start')?.click(); return; }
    if (edge(3) && !dialog?.open) { document.querySelector<HTMLButtonElement>('#open-options')?.click(); return; }
    const root = dialog?.open ? dialog : document.querySelector('#overlay');
    const buttons = Array.from(root?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? []).filter(el => el.getClientRects().length && !el.hidden);
    if (!buttons.length) return;
    let focused = buttons.find(b => b === document.activeElement);
    if (!focused) {
      focused = buttons.find(b => b.matches('[aria-pressed="true"],#panel-action')) ?? buttons[0];
      focused.focus({preventScroll:true});
    }
    const b=p.buttons, dx=(b[15]?1:0)-(b[14]?1:0)|| (Math.abs(p.move.x)>.5?Math.sign(p.move.x):0), dy=(b[13]?1:0)-(b[12]?1:0)||(Math.abs(p.move.y)>.5?Math.sign(p.move.y):0);
    const direction = dx ? (dx>0?'right':'left') : dy ? (dy>0?'down':'up') : '';
    if (direction && (direction !== this.direction || now >= this.repeatAt)) {
      this.repeatAt = now + (direction !== this.direction ? 330 : 150);
      const r=focused.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;
      const candidates=buttons.filter(el=>el!==focused).map(el=>{const q=el.getBoundingClientRect(),vx=q.x+q.width/2-x,vy=q.y+q.height/2-y;const forward=dx?vx*dx:vy*dy,side=dx?Math.abs(vy):Math.abs(vx);return {el,forward,score:forward+side*3};}).filter(v=>v.forward>5).sort((a,b)=>a.score-b.score);
      if (candidates[0]) { focused=candidates[0].el;focused.focus();focused.scrollIntoView({block:'nearest',inline:'nearest'});if(focused.matches('.bro-card'))focused.click(); }
    }
    this.direction=direction;
    if (edge(0)) focused.click();
  }
  label(message: string) {
    if (!this.active) return message;
    return message.replace(/SCROLL \/ 1 2 3/g,'D-PAD').replace(/\bSCROLL\b/gi,'D-PAD').replace(/\b(?:CLICK|LMB)\b/gi,'RT').replace(/\bSPACE\b/g,'LB').replace(/\bE\b/g,'RB').replace(/\bQ\b/g,'LT').replace(/\bF\b/g,'Y');
  }
  hints() {
    const controller=this.active;
    const labels=controller?['LS','B / L3','A / LB','RS · RT','D-PAD ← →','Y','X / RB','LT','MENU']:['W A S D','CTRL','SPACE','MOUSE','SCROLL ↑↓','F','E','Q','ESC'];
    document.querySelectorAll('.controls > span > kbd').forEach((el,i)=>{if(labels[i])el.textContent=labels[i];});
    const reset=document.querySelector('.reset-label kbd');if(reset)reset.textContent=controller?'Y':'F';
    if(controller){
      for(const [id,key] of [['secondary-ready','RB'],['defense-ready','LT']] as const){const el=document.getElementById(id);if(el)el.textContent=el.textContent!.replace(/^[EQ]\b/,key);}
    }
    if(controller){const cost=document.querySelector('#token-cost');if(cost)cost.textContent=this.label(cost.textContent!);}
    const hints=document.querySelector<HTMLElement>('.controller-menu-hint');
    if(hints)hints.hidden=!controller;
    const skip=document.querySelector('.skip-intro');if(skip)skip.textContent=controller?'A / SKIP INTRO ↗':'SPACE / SKIP INTRO ↗';
    const back=document.querySelector('#close-options');if(back)back.textContent=controller?'B · BACK':'BACK ↩';
    this.g.rosterPreview?.labels();
  }
}
