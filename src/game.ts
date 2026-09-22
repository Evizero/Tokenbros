import { CoopSession } from './coop';
import { MarcusKit } from './marcus';
import { marcus, cartridgeArt, invaderArt, lcdFigure, pacmanArt, AUGMENT_NAMES, AUGMENT_COLORS } from './marcus-art';
import { FACADES, SECTORS } from './level';
import { Encounters } from './encounters';
import { PidalfKit } from './pidalf';
import { pidalf,pidalfPortrait,PI_COLOR } from './pidalf-art';

import { showRoster } from './roster';
import { DimillianKit } from './dimillian';
import { dimillian,dimillianPortrait,dimillianIntro,DIM_COLORS,DIM_FORMS,sheep } from './dimillian-art';
import { OtherTibo } from './other-tibo';
import { Defense } from './defense';
import { PeterKit } from './peter';
import { peter,peterPortrait,claw,CLAW_COLORS } from './peter-art';

import { World, BASE, LADDERS, clamp } from './world';
import { Debris } from './debris';
import { THINKING, thinkingWeapon, thinkingScroll, canvasPoint } from './combat';
import { awareness } from './perception';
import { TOKEN_CAPACITY, RESET_RECOVERY, shotCost } from './tokens';

import { W, H, rect, text, background, scenery, refinerySigns, terrain, tibo, portrait, robot } from './art';
import { PlayerRuntime } from './player-runtime';

const REFILL_ANIMATION=1.35,REFILL_FEEDBACK=2.2;
const rand=(a:number,b:number)=>a+Math.random()*(b-a);
const $=<T extends Element=HTMLElement>(s:string)=>document.querySelector<T>(s)!;
export class Game extends PlayerRuntime {
coop=new CoopSession(this);
constructor(canvas:HTMLCanvasElement,preview=false){
    super(canvas,preview);this.local=!preview;
    this.selectCharacter(this.character);
    this.populate();
    if(preview){this.audio.muted=true;this.effects=false;return;}
    window.addEventListener('keydown',e=>{if(e.target instanceof HTMLInputElement&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.code))return;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyJ','KeyK','KeyF','KeyE','KeyQ','ShiftLeft','ShiftRight','KeyW','KeyA','KeyS','KeyD','Escape'].includes(e.code))e.preventDefault();if(!e.repeat)this.press(e.code);});
    window.addEventListener('keyup',e=>this.release(e.code));
    window.addEventListener('blur',()=>{this.keys.clear();this.pointer.down=false;this.pendingShot=0;if(this.state==='playing')this.pause();});
    document.addEventListener('visibilitychange',()=>{if(document.hidden){this.keys.clear();this.pointer.down=false;this.pendingShot=0;if(this.state==='playing')this.pause();}});
    const point=(e:PointerEvent)=>{if(e.pointerType==='touch')return;this.pointer.active=true;this.pointer.x=e.clientX;this.pointer.y=e.clientY;};
    canvas.addEventListener('pointermove',point);
    canvas.addEventListener('pointerdown',e=>{if(e.button!==0||e.pointerType==='touch'||this.state!=='playing'||this.coop.menu)return;e.preventDefault();point(e);canvas.focus();canvas.setPointerCapture(e.pointerId);this.pointer.down=true;this.pendingShot=.14;this.audio.start();});
    const releasePointer=()=>{this.pointer.down=false;};
    window.addEventListener('pointerup',releasePointer);canvas.addEventListener('pointercancel',()=>{releasePointer();this.pendingShot=0;});canvas.addEventListener('lostpointercapture',releasePointer);
    canvas.addEventListener('pointerleave',()=>{if(!this.pointer.down)this.pointer.active=false;});
    canvas.parentElement!.addEventListener('wheel',e=>{if(this.state!=='playing'||this.coop.menu||e.ctrlKey)return;e.preventDefault();const step=thinkingScroll(e.deltaY,e.deltaMode);if(step)this.setThinking(this.thinking+step);},{passive:false});
    requestAnimationFrame(t=>this.loop(t));
  }
selectCharacter(character:'tibo'|'peter'|'dimillian'|'pidalf'|'marcus'){this.character=character;if(!this.preview)document.documentElement.dataset.character=character;}
  press(key:string){
    if(this.state==='intro'&&['Space','Enter','Escape'].includes(key)){this.finishIntro();return;}
    if(key==='Enter'&&this.state==='title'){this.start();return;}
    if(key==='Escape'){if(this.coop.menu){this.coop.resume();return;}if(this.state==='playing')this.pause();else if(this.state==='paused')this.resume();return;}
    if(this.coop.menu)return;if(this.coop.key(key,true))return;super.press(key);
  }
  release(key:string){if(this.coop.key(key,false))return;super.release(key);}
  clearToast(){if(this.local)$('.toast').innerHTML='';}
  update(dt:number){
    if(this.coop.before(dt))return;
    const frozen=this.freeze>0&&!this.arena.coop;
    for(const actor of this.peers)actor.updateActor(dt);
    if(!frozen&&this.living.length){this.updateWorld(dt);for(const actor of this.living)actor.updateObjectives();}
    this.coop.after(dt);
    this.hudTimer-=dt;if(this.hudTimer<=0){this.hud();this.hudTimer=.05;}
  }
start(){
    if(this.coop.active&&!this.coop.launching)return;
    this.barks.reset();this.pidalfKit.clear();this.pidalfKit=new PidalfKit(this);this.marcusKit=new MarcusKit(this);
    this.rosterPreview?.destroy();this.rosterPreview=null;
    if(!this.preview)this.canvas.parentElement!.classList.remove('roster-open');
    this.refillFeedback=0;
    this.burstSpend=0;this.burstShots=0;this.burstLife=0;this.dryFire=0;this.dryFeedback=0;this.dryClick=0;this.spendFlash=0;this.selectCharacter(this.character);this.defense=new Defense(this);this.otherTibo=new OtherTibo(this);this.peterKit=new PeterKit(this);this.dimillianKit.clear();this.dimillianKit=new DimillianKit(this);if(!this.preview)this.audio.start();this.audio.silenceRobots();this.thinking=0;this.modeFeedback=0;this.modeBurst=0;this.resetRecovery=RESET_RECOVERY;this.resetProp=null;this.fireTimer=0;this.lastCooldown=.095;this.voiceCooldown=0;this.world=new World();this.populate();this.encounters=new Encounters(this);this.player={x:90,y:828,w:20,h:32,vx:0,vy:0,grounded:true};
    this.health=3;this.usage=TOKEN_CAPACITY;this.tokenTrail=TOKEN_CAPACITY;this.charges=2;this.invuln=1;this.kills=0;this.chargeKills=0;this.deaths=0;this.elapsed=0;this.checkpoint=90;this.checkpointY=828;this.checkpointIndex=0;this.totalRescues=0;this.resetCount=0;this.shotCount=0;this.cam=0;this.camY=440;this.zip=false;this.climb=null;this.zipCooldown=0;this.freeze=0;
    this.debris=new Debris();this.bullets=[];this.particles=[];this.rings=[];this.face=1;this.wall=0;this.wallGrip=0;this.wallGrace=0;this.lastWall=0;this.wallRegrab=0;this.wallLock=0;this.coyote=0;this.jumpBuffer=0;this.keys.clear();this.pointer.down=false;this.pendingShot=0;this.boss={x:3620,y:784,w:76,h:76,hp:100,max:100,phase:0,timer:0,dead:false,active:false};
    if(this.preview){this.state='playing';this.invuln=0;return;}
    this.state='playing';$('#overlay').setAttribute('hidden','');$('.hud').removeAttribute('hidden');$('.touch').classList.add('active');this.canvas.focus();this.hud();this.showIntro();
  }
showIntro(){
    this.state='intro';this.introTimer=3;
    const o=$('#overlay');o.className='overlay intro-overlay';
    const isPeter=this.character==='peter';
    if(this.character==='marcus'){o.innerHTML=`<div class="reveal-speedlines"></div><img class="reveal-portrait" src="${import.meta.env.BASE_URL}assets/marcus-intro-v1.png" alt="Marcus with his arcade slingshot"><div class="reveal-band"><div class="reveal-kicker">ONE ORIGINAL. MANY PROBLEMS.</div><div class="reveal-name">MARCUS<span>THE AUGMENTOR</span></div><div class="reveal-bark">LET’S TRY ANOTHER ANGLE.</div></div><button class="skip-intro">SPACE / SKIP INTRO ↗</button>`;o.removeAttribute('hidden');$('.skip-intro').addEventListener('click',()=>this.finishIntro());this.audio.tone(180,.4,'triangle',.05,800);return;}
    if(this.character==='pidalf'){o.innerHTML=`<div class="reveal-speedlines"></div><img class="reveal-portrait" src="${import.meta.env.BASE_URL}assets/pidalf-intro-v2.png" alt="Pidalf with his pi staff and dismissive hand"><div class="reveal-band"><div class="reveal-kicker">SMALL HARNESS. BIG CONSEQUENCES.</div><div class="reveal-name">PIDALF<span>THE SLOP SLAYER</span></div><div class="reveal-bark">YOU DON'T NEED ALL THAT.</div></div><button class="skip-intro">SPACE / SKIP INTRO ↗</button>`;o.removeAttribute('hidden');$('.skip-intro').addEventListener('click',()=>this.finishIntro());this.audio.tone(100,.4,'triangle',.06,400);return;}
    if(this.character==='dimillian'){o.innerHTML=`<div class="reveal-speedlines"></div><img class="reveal-portrait" src="${dimillianIntro()}" alt="Dimillian hot-reloads into a mage and miniature spaceship"><div class="reveal-band"><div class="reveal-kicker">THE GAME IS EDITABLE // NOW DEPLOYING</div><div class="reveal-name">DIMILLIAN<span>THE HOT RELOADER</span></div><div class="reveal-bark">NEW BUILD. SAME CHAOS.</div></div><button class="skip-intro">SPACE / SKIP INTRO ↗</button>`;o.removeAttribute('hidden');$('.skip-intro').addEventListener('click',()=>this.finishIntro());this.audio.tone(180,.4,'triangle',.06,780);return;}
    o.innerHTML=`<div class="reveal-speedlines"></div><img class="reveal-portrait" src="${import.meta.env.BASE_URL}assets/${isPeter?'peter':'tibo'}-intro-v1.png" alt="${isPeter?'Peter commanding lobster companions':'Tibo holding his reset button'}"><div class="reveal-band"><div class="reveal-kicker">${isPeter?'OPENCLAW’S BEASTMASTER':'OPENAI’S QUARTERMASTER'} // NOW DEPLOYING</div><div class="reveal-name">${isPeter?'PETER':'TIBO'}<span>${isPeter?'THE CLAWFATHER':'THE RESET GUY'}</span></div><div class="reveal-bark">${isPeter?'CAME BACK WITH BACKUP.':'YOUR LIMITS ARE MY PROBLEM.'}</div></div><button class="skip-intro">SPACE / SKIP INTRO ↗</button>`;
    o.removeAttribute('hidden');$('.skip-intro').addEventListener('click',()=>this.finishIntro());this.audio.tone(80,.5,'sawtooth',.08,220);this.audio.blast();
  }
finishIntro(){if(this.state!=='intro')return;this.state='playing';this.barks.request('spawn');this.keys.clear();this.pointer.down=false;this.pendingShot=0;$('#overlay').className='overlay';$('#overlay').setAttribute('hidden','');this.canvas.focus();if(this.character==='marcus'){this.notify('ANOTHER ANGLE.','Click launches · E recalls · scroll augments · Q flips · F batches.');return;}if(this.character==='pidalf'){this.notify('LESS IS MORE.','Hold E to grab · click while holding to compact · release E to throw · F places compact.');return;}if(this.character==='dimillian'){this.notify('HOT RELOAD.','Scroll forms · click attacks · E pairs bots · Q defends · F goes big.');return;}this.notify(this.character==='peter'?'THE CLAW IS THE LAW.':'POINT. SHOOT. THINK BIGGER.',this.character==='peter'?'Click attacks + commands · E throws claws · scroll changes type · F molts.':'Mouse aims · click fires · scroll ↑ increases thinking · F throws RESET.');}
pause(){if(this.coop.pause())return;this.marcusKit.lcd.cancel();this.marcusKit.wasFiring=false;this.marcusKit.invader.cancel();this.marcusKit.invader.wasFiring=false;this.pidalfKit.release(false);this.defense.release();this.dimillianKit.releaseDefense();this.dimillianKit.charge=0;this.audio.silenceRobots();this.state='paused';this.keys.clear();this.pointer.down=false;this.pendingShot=0;this.panel('TAKE A BREATHER.','The refinery can wait.','RESUME OPERATION',()=>this.resume(),'<button class="text-btn" id="restart">RESTART MISSION</button><button class="text-btn" id="switch-bro">SWITCH BRO</button>');$('#restart').addEventListener('click',()=>this.start());$('#switch-bro').addEventListener('click',()=>showRoster(this));}
resume(){if(this.coop.running){this.coop.resume();return;}this.state='playing';this.keys.clear();this.pointer.down=false;this.pendingShot=0;$('#overlay').setAttribute('hidden','');this.canvas.focus();}
panel(title:string,body:string,button:string,action:()=>void,extra=''){
    const o=$('#overlay');o.className='overlay';o.innerHTML=`<div class="briefing"><div class="eyebrow">OPERATION HARD RESET</div><div class="result-title">${title}</div><div class="result-stats">${body}</div><div class="pause-actions"><button class="primary" id="panel-action">${button} <span class="arrow">↗</span></button>${extra}</div></div>`;o.removeAttribute('hidden');$('#panel-action').addEventListener('click',action);
  }
notify(a:string,b=''){if(this.preview)return;super.notify(a,b);const e=$('.toast');e.replaceChildren();const title=document.createElement('strong'),detail=document.createElement('small');title.textContent=a;detail.textContent=b;e.append(title,detail);this.toastTimer=3.2;}
win(){
    this.state='won';this.barks.request('victory');this.keys.clear();this.pointer.down=false;this.pendingShot=0;this.audio.pickup();$('.touch').classList.remove('active');
    const seconds=Math.floor(this.elapsed),clock=`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
    this.panel('ALL SYSTEMS<br>OVERRIDDEN.',`<div class="ending-quip"><b>${this.character.toUpperCase()}</b> “${this.barks.active?.line??'Mission complete.'}”</div>Mission complete. The squad is back online.<br><br>${clock} ELAPSED &nbsp; / &nbsp; ${this.kills} BOTS SCRAPPED<br>${this.world.destroyed} BLOCKS BROKEN &nbsp; / &nbsp; ${this.totalRescues}/2 RESCUED<br>${this.resetCount} RESETS &nbsp; / &nbsp; ${this.deaths} RECONNECTS`,this.coop.running?'BACK TO ROSTER':'RUN IT BACK',()=>{if(this.coop.running){this.coop.close();showRoster(this);}else this.start();});
  }
hud(){
    if(this.preview)return;
    $('#usage').textContent=`${this.usage.toLocaleString()} / ${TOKEN_CAPACITY.toLocaleString()}`;$('.meter-fill').setAttribute('style',`width:${this.usage/TOKEN_CAPACITY*100}%`);$('.meter-trail').setAttribute('style',`width:${this.tokenTrail/TOKEN_CAPACITY*100}%`);
    $('.resources').classList.toggle('tokens-gained',this.character==='tibo'&&this.otherTibo.rewardFeedback>0);
    $('.resources').classList.toggle('tokens-low',this.usage<200);$('.resources').classList.toggle('tokens-empty',this.usage<8);
    const cost=shotCost(thinkingWeapon(this.thinking).cost);$('#token-cost').textContent=this.usage<cost?'F RESET / LOWER THINKING':`${Math.floor(this.usage/cost)} SHOTS · ${cost} TOKENS / SHOT`;
    $('#token-spend').textContent=this.spendFlash>0?`−${this.lastSpend}`:'';$('#token-spend').style.opacity=String(Math.min(1,this.spendFlash*4));
    $('#reset-status').textContent=this.resetProp&&!this.resetProp.struck?'SLAM…':this.charges?`RESET ×${this.charges}`:`RESET ${Math.ceil(this.resetRecovery)}s`;
    $('.reset-label').classList.toggle('spent',this.charges===0);
    document.querySelectorAll('.health i').forEach((x,i)=>x.classList.toggle('empty',i>=this.health));
    $('#objective').textContent=this.boss.dead?'EXTRACT →':this.boss.active?(this.boss.phase===2?'CORE EXPOSED — FIRE!':'DODGE THE VOLLEY'):this.relays.every(r=>r.done)?'FIND THE RATE LIMITER →':`OVERLOAD UPLINKS ${this.relays.filter(r=>r.done).length}/2 ↑`;
    $('#secondary-ready').textContent=this.otherTibo.cooldown>0?`E ${this.otherTibo.cooldown.toFixed(1)}s`:'E OTHER TIBO';
    const mode=thinkingWeapon(this.thinking);$('#thinking-level').textContent=mode.name;
    const percent=this.thinking/(this.character==='marcus'?3:2)*100;const slider=$<HTMLInputElement>('#thinking-slider');slider.value=String(percent);slider.style.setProperty('--thinking-progress',`${percent}%`);slider.setAttribute('aria-valuetext',`${Math.round(this.thinking*50)} percent, ${mode.name}`);$('.resources').style.setProperty('--shot-color',mode.color);
    $('#defense-ready').hidden=false;$('#control-q').parentElement!.hidden=false;const isPeter=this.character==='peter';slider.setAttribute('aria-label',isPeter?'Claw type':'Thinking intensity');slider.setAttribute('aria-valuetext',isPeter?this.peterKit.name:`${Math.round(this.thinking*50)} percent, ${mode.name}`);$('.name').textContent=isPeter?'PETER':'TIBO';$('.role').textContent=isPeter?'THE CLAWFATHER':'THE RESET GUY';$('#resource-name').textContent=isPeter?'PACK':'TOKENS';$('#thinking-label').textContent=isPeter?'CLAW':'THINK';
    this.canvas.setAttribute('aria-label',isPeter?'Peter: WASD move, Space jump, click command and claw strike, punch during Molt, E throw claws or override nearby uplink, scroll claw type, F Molt, Q deploy prism shield, Escape pause.':'Tibo: WASD move, Space jump, click fire, scroll thinking power, E summon the other Tibo, F throw reset, hold Q to absorb bullets into tokens, Escape pause.');
    $('#defense-ready').textContent=this.defense.active?(isPeter?`Q PRISM ${this.defense.active.hits}`:`Q +${this.defense.active.tokens}`):this.defense.cooldown>0?`Q ${this.defense.cooldown.toFixed(1)}s`:`Q ${isPeter?'PRISM':'ABSORB'}`;$('#defense-ready').classList.toggle('spent',this.defense.cooldown>0&&!this.defense.active);$('#control-q').textContent=isPeter?'PRISM SHIELD':'HOLD / ABSORB';
    $('#control-fire').textContent=isPeter?'ATTACK / COMMAND':'AIM / CLICK FIRE';$('#control-scroll').textContent=isPeter?'CLAW TYPE':'THINKING';$('#control-f').textContent=isPeter?'MOLT':'RESET';$('#control-e').textContent=isPeter?'THROW CLAW':'OTHER TIBO';
    if(isPeter){const kit=this.peterKit;$('#usage').textContent=`${kit.pets.length} / 4`;
      $('.meter-fill').style.width=`${kit.pets.length/4*100}%`;$('.meter-trail').style.width=`${kit.pets.length/4*100}%`;$('.resources').classList.remove('tokens-low','tokens-empty');
      $('#token-cost').textContent=kit.molt>0?'CLICK · RIP & TEAR':kit.pets.length>=4?'PACK FULL · CLICK TO DIRECT':`${kit.stock} READY · E DEPLOYS A PET`;$('#token-spend').textContent='';
      $('#thinking-level').textContent=kit.name;$('.resources').style.setProperty('--shot-color',CLAW_COLORS[kit.kind]);
      $('#reset-status').textContent=kit.molt>0?`MOLT ${kit.molt.toFixed(1)}s`:kit.moltCooldown>0?`MOLT ${Math.ceil(kit.moltCooldown)}s`:'MOLT READY';$('.reset-label').classList.toggle('spent',kit.moltCooldown>0&&kit.molt<=0);
      $('#secondary-ready').textContent=this.relays.some(r=>!r.done&&Math.hypot(r.x-this.player.x,r.y-this.player.y)<130)?'E OVERRIDE':kit.throwCooldown>0?`E ${kit.throwCooldown.toFixed(1)}s`:kit.pets.length>=4?'E PACK FULL':'E DEPLOY';peterPortrait($<HTMLCanvasElement>('.portrait').getContext('2d')!,kit.molt>0,kit.kind);
    }else if(this.character==='dimillian'){
      const kit=this.dimillianKit;$('.name').textContent='DIMILLIAN';$('.role').textContent='THE HOT RELOADER';$('#resource-name').textContent='SHIELD';$('#usage').textContent=`${Math.ceil(kit.shieldHP)}%`;
      $('.meter-fill').style.width=`${kit.shieldHP}%`;$('.meter-trail').style.width=`${kit.shieldHP}%`;$('.resources').classList.remove('tokens-low','tokens-empty');
      $('#token-cost').textContent=kit.form===0?'LAND TWO SLASHES · UNLOCK FINISHER':kit.form===1?'HOLD FIREBALL · FULL CHARGE EXPLODES':'SPACE / W ↑ · S ↓ · RELEASE TO HOVER';$('#token-spend').textContent='';
      $('#thinking-label').textContent='FORM';$('#thinking-level').textContent=kit.name;$('.resources').style.setProperty('--shot-color',kit.color);slider.setAttribute('aria-label','Game form');slider.setAttribute('aria-valuetext',kit.name);
      $('#reset-status').textContent=kit.special>0?`${kit.fName} ${kit.special.toFixed(1)}`:kit.fCooldown>0?`${Math.ceil(kit.fCooldown)}s`:kit.fName;$('.reset-label').classList.toggle('spent',kit.fCooldown>0&&kit.special<=0);
      $('#secondary-ready').textContent=this.relays.some(r=>!r.done&&Math.hypot(r.x-this.player.x,r.y-this.player.y)<130)?'E OVERRIDE':kit.pairing?'E PAIRING':kit.paired?`E LINK ${Math.ceil(kit.remoteTime)}`:kit.eCooldown>0?`E ${Math.ceil(kit.eCooldown)}s`:`E ${kit.eName}`;
      $('#defense-ready').textContent=kit.shieldBroken?`Q ${kit.qCooldown.toFixed(1)}s`:kit.shield?'Q ACTIVE':'Q HOLD';$('#defense-ready').classList.toggle('spent',kit.qCooldown>0&&!kit.shield);
      $('#control-fire').textContent=kit.form===1?'HOLD / RELEASE SPELL':'AIM / ATTACK';$('#control-scroll').textContent='FORM';$('#control-q').textContent='HOLD '+kit.qName;$('#control-f').textContent=kit.fName;$('#control-e').textContent=kit.form===0?'REMOTE PAIR':kit.form===1?'SHEEP':'DROP BOMB';
      this.canvas.setAttribute('aria-label','Dimillian: WASD move, Space jump or ascend as pilot, W ascend, S descend, release to hover, mouse aim, click attack or hold and release mage spell, scroll or 1 2 3 transform, E remote pair as duelist, polymorph as mage, drop bomb as pilot, or override nearby uplink; hold Q iPhone bunker as duelist, bubble as mage, directional shield as pilot; all share regenerating shield health, F form special, Escape pause.');
      dimillianPortrait($<HTMLCanvasElement>('.portrait').getContext('2d')!,kit.form);
    }else if(this.character==='pidalf'){
      const kit=this.pidalfKit,pct=Math.round(kit.scale*100);$('.name').textContent='PIDALF';$('.role').textContent='THE SLOP SLAYER';$('#resource-name').textContent='INFLUENCE';$('#usage').textContent=`${pct}%`;
      $('.meter-fill').style.width=`${pct}%`;$('.meter-trail').style.width=`${pct}%`;$('.resources').classList.remove('tokens-low','tokens-empty');$('.resources').style.setProperty('--shot-color',PI_COLOR);
      $('#token-cost').textContent=kit.grabbing?`CLICK COMPACTS · RELEASE E THROWS`:`${kit.capacity} MASS · SCROLL TO SCALE`;$('#token-spend').textContent='';$('#thinking-label').textContent='SCALE';$('#thinking-level').textContent=pct<35?'PRECISE':pct<70?'BROAD':'MASSIVE';slider.setAttribute('aria-label','Influence scale');slider.setAttribute('aria-valuetext',`${pct} percent, ${kit.capacity} mass`);
      $('#reset-status').textContent=kit.crush?'COMPACTING':kit.compactCooldown>0?`COMPACT ${kit.compactCooldown.toFixed(1)}s`:'COMPACT';$('.reset-label').classList.toggle('spent',kit.compactCooldown>0);
      $('#secondary-ready').textContent=this.relays.some(r=>!r.done&&Math.hypot(r.x-this.player.x,r.y-this.player.y)<130)?'E OVERRIDE':kit.grabbing?'E RELEASE / THROW':kit.grabCooldown>0?`E ${kit.grabCooldown.toFixed(1)}s`:'E HOLD / GRAB';
      $('#defense-ready').textContent=kit.qCooldown>0?`Q ${kit.qCooldown.toFixed(1)}s`:'Q REPEL';$('#defense-ready').classList.toggle('spent',kit.qCooldown>0);$('#control-q').textContent='REPEL';$('#control-fire').textContent=kit.grabbing?'COMPACT HELD':'SLOP!';$('#control-scroll').textContent='INFLUENCE SCALE';$('#control-f').textContent='COMPACT';$('#control-e').textContent='HOLD GRAB / RELEASE THROW';
      this.canvas.setAttribute('aria-label','Pidalf: WASD move, Space jump, mouse aim, click backhand, hold E to grab bots or scrap and release to throw, F compact, Q repel nearby threats, scroll continuous influence scale, E near uplink overrides it, Escape pause.');pidalfPortrait($<HTMLCanvasElement>('.portrait').getContext('2d')!);
    }else if(this.character==='marcus')this.marcusKit.hud();else portrait($<HTMLCanvasElement>('.portrait').getContext('2d')!,false,this.usage/TOKEN_CAPACITY*100);
  }
render(){
    const c=this.c;c.save();c.clearRect(0,0,W,H);
    if(this.effects&&this.shake>0)c.translate(Math.round(rand(-this.shake,this.shake)),Math.round(rand(-this.shake*.65,this.shake*.65)));
    background(c,this.cam,this.time);
    c.save();c.translate(0,-Math.round(this.camY));
    c.save();c.translate(0,BASE);scenery(c,this.cam,this.time,this.accent,false);c.restore();
    this.drawStructures();this.encounters.draw();if(!this.preview){c.save();c.translate(0,BASE);refinerySigns(c,this.cam,this.time);c.restore();}this.drawAlarms();this.drawPerception();terrain(c,this.world,this.cam);for(const actor of this.peers)actor.debris.draw(c,this.cam);
    for(const b of this.barrels){if(b.dead||b.x-this.cam<-30||b.x-this.cam>W)continue;const x=b.x-this.cam,y=b.y;c.save();c.translate(x+9,y+15);c.rotate(b.angle??0);c.translate(-x-9,-y-15);
      rect(c,x+3,y,12,3,'#bc945c');rect(c,x,y+3,18,25,b.fuse>0?'#ffc564':'#9b573a');rect(c,x+2,y+5,3,21,'#ce8e52');rect(c,x,y+8,18,3,'#3a4431');rect(c,x,y+21,18,3,'#3a4431');rect(c,x+7,y+12,5,7,'#f4c884');rect(c,x+9,y+13,1,4,'#6e402c');rect(c,x+9,y+18,1,1,'#6e402c');c.restore();}
    for(const r of this.rescues){const x=r.x-this.cam,y=r.y;if(x<-60||x>W+40)continue;
      if(!r.done){rect(c,x-10,y-18,43,52,'#172b25');rect(c,x-10,y-18,43,3,'#b4c783');rect(c,x-8,y-13,39,7,'#435b3b');text(c,'LIMITED',x-5,y-7,'#d8e4ad',6);tibo(c,x+1,y+2,1,this.time,false,false,0,0,.85);for(let i=0;i<5;i++)rect(c,x-7+i*9,y-1,2,33,'#a7b39b');text(c,'RESCUE',x+12,y-27,this.accent,9,'center');rect(c,x+10,y-24+Math.sin(this.time*4)*3,4,4,this.accent);}
      else {rect(c,x+6,y-35,3,69,'#84936f');rect(c,x+9,y-35,29,18,this.accent);text(c,'✓',x+19,y-21,'#243621',12);text(c,'DEPLOYED',x+12,y-46,'#cadd9d',8,'center');}
    }
    for(const e of this.enemies)if(!e.dead&&e.x-this.cam>-40&&e.x-this.cam<W+40){if(this.peers.some(a=>{a.renderView={c,cam:this.cam,camY:this.camY};try{return a.marcusKit.pacman.drawEnemy(e)||a.pidalfKit.drawEnemy(e);}finally{a.renderView=null;}}))continue;if(e.sheep)sheep(c,e.x-this.cam,e.y,this.time,e.face);else robot(c,e.x-this.cam,e.y,e.type,e.face,this.time,e.wind,e.hurt,e.shieldDown>0?0:e.shield,e.hacked);}
    for(const e of this.enemies)if(!e.dead&&!e.sheep){
      const x=e.x+10-this.cam;
      if(e.type==='drone'&&e.wind>0&&e.hacked<=0){c.strokeStyle='#ffad6877';c.lineWidth=1;c.setLineDash([4,6]);c.beginPath();c.moveTo(x,e.y+15);c.lineTo(e.lockX-this.cam,e.lockY);c.stroke();c.setLineDash([]);rect(c,e.lockX-this.cam-4,e.lockY-4,8,1,'#ffb36b');}
      if(e.stun<=0&&e.hacked<=0){const a=e.awareness;if(a.state!=='patrol'){text(c,a.state==='combat'?'!':'?',x,e.y-10,a.state==='combat'?'#ff966b':'#e2ce8c',12,'center');rect(c,x-9,e.y-6,18,2,'#23382f');rect(c,x-9,e.y-6,18*a.suspicion,2,a.state==='combat'?'#ff966b':'#e2ce8c');}}
      if(e.stun>0)text(c,'* * *',x,e.y-9,'#83dae9',10,'center');
    }
    this.drawBoss();this.drawExit();this.drawRelays();
    for(const g of this.grenades){const x=g.x-this.cam;rect(c,x-4,g.y-4,8,8,Math.floor(g.life*12)%2?'#ffcb76':'#e9794e');c.strokeStyle='#ff9b5977';c.lineWidth=1;c.beginPath();c.arc(x,g.y,64*(1-g.life/1.7),0,Math.PI*2);c.stroke();}
    for(const b of this.bullets){const x=b.x-this.cam;c.strokeStyle=b.hostile?'#ff784e':b.boost?'#eeffba':b.color??THINKING[b.tier??0].color;c.lineWidth=b.hostile?3:b.boost?3:(b.tier??0)===2?5:(b.tier??0)===1?4:2;c.beginPath();c.moveTo(x-b.vx*((b.tier??0)===2?.04:.013),b.y-b.vy*((b.tier??0)===2?.04:.013));c.lineTo(x,b.y);c.stroke();rect(c,x-2,b.y-2,4,4,b.hostile?'#ffe3a1':'#f3ffce');if(b.fireball!==undefined){const r=5+b.fireball*9,a=Math.atan2(b.vy,b.vx);c.save();c.translate(x,b.y);c.rotate(a);for(let i=4;i>=0;i--){const rr=r*(1-i*.14);c.globalAlpha=1-i*.15;c.fillStyle=i%2?'#ffbd54':'#f16b35';c.beginPath();c.arc(-i*(5+b.fireball*3),Math.sin(this.time*35+i)*i,rr,0,Math.PI*2);c.fill();}c.globalAlpha=1;c.fillStyle='#ffe8a1';c.beginPath();c.arc(1,-1,r*.63,0,Math.PI*2);c.fill();rect(c,0,-3,5,5,'#fff8d9');if(b.fireball>=.99){c.strokeStyle='#efb5ff';c.lineWidth=1;c.beginPath();c.arc(0,0,r+3,0,Math.PI*2);c.stroke();}c.restore();}}
    for(const actor of this.peers){actor.renderView={c,cam:this.cam,camY:this.camY};try{actor.drawActor();}finally{actor.renderView=null;}}
    // Foreground bolts, service pipes, and shadowed foundation.
    for(let i=Math.floor(this.cam/90);i<(this.cam+W)/90;i++){const x=i*90-this.cam;rect(c,x,BASE+513,80,8,'#11251d');rect(c,x+10,BASE+515,3,3,'#415540');}
    c.restore();
    if(this.pointer.active&&this.state==='playing'){
      const p=canvasPoint(this.pointer.x,this.pointer.y,this.canvas.getBoundingClientRect()),ready=this.fireTimer<=0;
      c.strokeStyle=this.character==='marcus'?AUGMENT_COLORS[this.marcusKit.mode]:this.character==='pidalf'?PI_COLOR:this.character==='dimillian'?this.dimillianKit.color:this.character==='peter'?CLAW_COLORS[this.peterKit.kind]:thinkingWeapon(this.thinking).color;c.lineWidth=1.5;const r=7+this.thinking*2;
      const tier=this.character==='marcus'?this.marcusKit.mode:thinkingWeapon(this.thinking).tier;c.beginPath();
      if(this.character==='marcus'&&tier===3){c.moveTo(p.x,p.y);c.arc(p.x,p.y,r,.45,Math.PI*2-.45);c.closePath();}else if(tier===0)c.arc(p.x,p.y,r,0,Math.PI*2);
      else if(tier===1){c.moveTo(p.x,p.y-r);c.lineTo(p.x+r,p.y);c.lineTo(p.x,p.y+r);c.lineTo(p.x-r,p.y);c.closePath();}
      else c.rect(p.x-r,p.y-r,r*2,r*2);c.stroke();
      for(let i=0;i<=tier;i++)rect(c,p.x-3-tier*4+i*8,p.y+r+11,5,3,c.strokeStyle as string);
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){c.beginPath();c.moveTo(p.x+dx*(r+3),p.y+dy*(r+3));c.lineTo(p.x+dx*(r+7),p.y+dy*(r+7));c.stroke();}
      rect(c,p.x-1,p.y-1,2,2,ready?'#fff9d5':'#70877a');
      if(!ready){c.lineWidth=3;c.beginPath();c.arc(p.x,p.y,r+3,-Math.PI/2,-Math.PI/2+(1-clamp(this.fireTimer/this.lastCooldown,0,1))*Math.PI*2);c.stroke();}
    }
    this.drawThinkingFeedback();this.drawUsageFeedback();for(const actor of this.peers){actor.renderView={c,cam:this.cam,camY:this.camY};try{actor.barks.draw();}finally{actor.renderView=null;}}this.coop.draw();
    if(this.flash>0&&this.effects){c.fillStyle=`rgba(242,100,70,${this.flash*.6})`;c.fillRect(0,0,W,H);}

    c.restore();
  }
drawUsageFeedback(){
    if(this.character!=='tibo'||this.state!=='playing'||Math.max(this.burstLife,this.dryFeedback,this.refillFeedback)<=0)return;
    const c=this.c,dry=this.dryFeedback>0,refilling=this.refillFeedback>0,life=dry?this.dryFeedback:Math.max(this.burstLife,this.refillFeedback);
    const progress=clamp((REFILL_FEEDBACK-this.refillFeedback)/REFILL_ANIMATION,0,1),shown=refilling?Math.min(this.refillFrom,this.usage)+(this.usage-Math.min(this.refillFrom,this.usage))*(progress*progress*(3-2*progress)):this.usage;
    const x=clamp(this.player.x+10-this.cam+this.face*62,67,W-67),y=clamp(this.player.y-this.camY-23,140,H-58);
    const color=dry?'#ffab7c':refilling?'#d5ff60':thinkingWeapon(this.thinking).color;
    c.save();c.globalAlpha=Math.min(1,life*5);c.shadowColor='#10151c';c.shadowBlur=4;
    const lift=dry||refilling&&this.burstLife<=0?0:(1-Math.min(1,this.spendFlash/.6))*9;
    text(c,dry?(this.usage===0?'EMPTY · CLICK':'NOT ENOUGH'):refilling&&this.burstLife<=0?(progress<1?'REFILLING':'RELOADED'):"−"+this.burstSpend+' TOK',x,y-lift,color,dry?12:15+Math.min(3,Math.floor(this.burstShots/4)),'center');
    rect(c,x-34,y+5,68,4,'#141b24');if(!refilling)rect(c,x-34,y+5,68*this.tokenTrail/TOKEN_CAPACITY,4,'#aa9a7b');rect(c,x-34,y+5,68*shown/TOKEN_CAPACITY,4,color);
    if(refilling&&progress<1){rect(c,x-35+68*shown/TOKEN_CAPACITY,y+3,2,8,'#f6ffd8');}
    text(c,dry?(this.usage===0?'F RESET':`${this.usage} LEFT · NEED ${shotCost(thinkingWeapon(this.thinking).cost)}`):refilling?`${Math.round(shown)} / ${TOKEN_CAPACITY}`:`${this.burstShots} SHOT${this.burstShots===1?'':'S'} · −${this.lastSpend}/SHOT`,x,y+20,'#e1e5dc',8,'center');
    if(dry){c.strokeStyle=color;c.lineWidth=2;const jolt=this.dryFire>0?Math.sin(this.dryFire/.16*Math.PI)*3:0;c.strokeRect(x-5+jolt,y+27,10,8);rect(c,x-2+jolt,y+25,4,2,color);c.beginPath();c.moveTo(x-7+jolt,y+37);c.lineTo(x+7+jolt,y+25);c.stroke();}
    c.restore();
  }
drawThinkingFeedback(){
    if(this.character==='pidalf'||this.state!=='playing'||this.modeFeedback<=0)return;
    const c=this.c,isPeter=this.character==='peter',mode=thinkingWeapon(this.thinking),tier=this.character==='marcus'?this.marcusKit.mode:mode.tier;
    const isMarcus=this.character==='marcus',isDim=this.character==='dimillian',color=isMarcus?AUGMENT_COLORS[tier]:isDim?DIM_COLORS[tier]:isPeter?CLAW_COLORS[tier]:THINKING[tier].color;
    const names=isMarcus?AUGMENT_NAMES:isDim?DIM_FORMS:isPeter?['PINCHER','SKIPPER','CRUSHER']:['LOW · RAPID','MED · PULSE','HIGH · RAIL'];
    const hints=isMarcus?['FAST RICOCHETS / E RECALL','HOLD / AIM / SLING YOURSELF','HOLD TO GROW / RELEASE BOMBER','CLICK BOT / CLICK NEXT / CHAIN x4']:isDim?['SWING / E REMOTE / HOLD Q SHIELD','CHARGE FIREBALL / E SHEEP','TWIN CANNONS / E BOMB / SPACE UP']:isPeter?['CLICK BLAST / E SMART GRENADE','CLICK PISTOL / E DASH PET','CLICK MELEE / E DIGGING PET']:['FAST FIRE / LIGHT HITS','STAGGER / BREAK SHIELDS','HEAVY HITS / PIERCING'];
    // World-adjacent arcade readout: large enough to read while aiming, away from the HUD.
    const px=this.player.x+10-this.cam,py=this.player.y-this.camY;
    const x=clamp(px-132,16,W-280),y=clamp(py-124,125,H-108),burst=this.modeBurst/.5;
    c.save();c.globalAlpha=Math.min(1,this.modeFeedback*4);
    c.fillStyle='#111820ed';c.beginPath();c.moveTo(x+9,y);c.lineTo(x+264,y);c.lineTo(x+264,y+84);c.lineTo(x,y+84);c.lineTo(x,y+9);c.closePath();c.fill();
    if(this.effects&&burst>0){c.strokeStyle=color;c.lineWidth=2;c.globalAlpha*=burst;c.strokeRect(x-5-(1-burst)*8,y-5-(1-burst)*5,274+(1-burst)*16,94+(1-burst)*10);c.globalAlpha=Math.min(1,this.modeFeedback*4);}
    if(isMarcus){if(tier===3)pacmanArt(c,x+30,y+27,18,0,.5);else if(tier===2)invaderArt(c,x+30,y+27,this.time,2.5);else if(tier===1)lcdFigure(c,x+30,y+27,1,2,0,1.1);else cartridgeArt(c,x+30,y+27,tier,this.time*5,9);}else if(isDim)dimillian(c,x+20,y+12,1,this.time,false,tier,0,0,.3,false,false,1);else if(isPeter)claw(c,x+31,y+31,tier,this.time,1,tier===2?1.6:1.3);
    else for(let i=0;i<=tier;i++){rect(c,x+12,y+19+i*9,30,4,color);rect(c,x+42,y+18+i*9,6,6,'#f2eee1');}
    text(c,names[tier],x+62,y+30,color,20);text(c,hints[tier],x+12,y+49,'#dbe0e5',8);
    const barX=x+12,barY=y+59,barW=240;
    const count=isMarcus?4:3;for(let i=0;i<count;i++){rect(c,barX+i*barW/count,barY,barW/count-2,8,i===tier?color:'#48515d');}
    const marker=barX+this.thinking/(isMarcus?3:2)*barW;rect(c,marker-2,barY-3,4,14,'#fff6de');
    text(c,`${Math.round(this.thinking/(isMarcus?3:2)*100)}%`,x+252,y+80,color,9,'right');
    text(c,isMarcus?'AUGMENT · SCROLL / 1 2 3 4':isDim?'HOT RELOAD · SCROLL / 1 2 3':isPeter?'E THROW · CLICK ATTACK':'THINKING POWER',x+12,y+80,'#a8b4c2',7);
    if(this.pointer.active){const p=canvasPoint(this.pointer.x,this.pointer.y,this.canvas.getBoundingClientRect());
      // Shape and segment count change decisively at thresholds; radius follows every scroll sample.
      c.strokeStyle=color;c.lineWidth=2;const r=18+this.thinking*6+(this.effects?burst*10:0);c.beginPath();
      if(this.character==='marcus'&&tier===3){c.moveTo(p.x,p.y);c.arc(p.x,p.y,r,.45,Math.PI*2-.45);c.closePath();}else if(tier===0)c.arc(p.x,p.y,r,0,Math.PI*2);
      else if(tier===1){c.moveTo(p.x,p.y-r);c.lineTo(p.x+r,p.y);c.lineTo(p.x,p.y+r);c.lineTo(p.x-r,p.y);c.closePath();}
      else c.rect(p.x-r,p.y-r,r*2,r*2);c.stroke();
      for(let i=0;i<=tier;i++)rect(c,p.x-5-tier*5+i*10,p.y+r+7,7,4,color);
    }
    c.restore();
  }
drawPerception(){
    if(!this.pointer.active||this.state!=='playing')return;
    const point=canvasPoint(this.pointer.x,this.pointer.y,this.canvas.getBoundingClientRect()),hoverX=point.x+this.cam,hoverY=point.y+this.camY;
    const c=this.c;
    for(const e of this.enemies){
      if(e.dead||e.hacked>0||e.sheep||e.stun>0||Math.abs(e.x-this.player.x)>560||e.y-this.camY<-80||e.y-this.camY>H+80)continue;
      if(hoverX<e.x-8||hoverX>e.x+e.w+8||hoverY<e.y-8||hoverY>e.y+e.h+8)continue;
      const s=this.sensor(e),color=e.awareness.state==='combat'?'255,140,95':e.awareness.state==='patrol'?'176,209,161':'244,209,125';
      c.fillStyle=`rgba(${color},.025)`;c.strokeStyle=`rgba(${color},.06)`;c.lineWidth=1;c.beginPath();c.moveTo(s.x-this.cam,s.y);
      for(let i=0;i<=20;i++){
        const angle=s.angle-s.half+i/20*s.half*2,dx=Math.cos(angle),dy=Math.sin(angle);let r=0;
        for(r=8;r<s.range;r+=10)if(this.world.at(s.x+dx*r,s.y+dy*r))break;
        c.lineTo(s.x+dx*Math.min(r,s.range)-this.cam,s.y+dy*Math.min(r,s.range));
      }
      c.closePath();c.fill();c.stroke();
    }
  }
drawStructures(){
    const c=this.c;
    for(const [x,y,w,h,tint] of FACADES){
      const sx=x-this.cam;rect(c,sx,y,w,h,tint);rect(c,sx,y,w,5,'#6b7582');
      for(let a=0;a<w;a+=64){rect(c,sx+a,y+5,8,h-5,'#333a43');rect(c,sx+a+8,y+5,2,h-5,'#414955');}
      for(let a=0;a<w;a+=85)for(let b=35;b<h;b+=80){rect(c,sx+a+16,y+b,44,33,'#191c21');rect(c,sx+a+20,y+b+4,36,3,'#5a6574');for(let j=0;j<4;j++)rect(c,sx+a+20+j*9,y+b+13,4,3,(a+b+j)%3===0?'#959fad':'#3e4550');}
    }
    for(const [i,s] of SECTORS.entries()){const f=FACADES[i],x=f[0]-this.cam,y=f[1];rect(c,x+18,y+18,220,25,'#121a20');rect(c,x+18,y+18,220,2,s.color);text(c,s.name,x+28,y+35,s.color,10);}
    c.strokeStyle='#a9b1bc';c.lineWidth=3;c.beginPath();c.moveTo(1700-this.cam,250);c.lineTo(2320-this.cam,570);c.stroke();
    for(const [x,y] of [[1700,250],[2320,570]]){rect(c,x-this.cam-4,y-10,8,73,'#6b7582');rect(c,x-this.cam-9,y-8,18,9,'#a7b0bc');}
    for(const l of LADDERS){const x=l.x-this.cam;rect(c,x-10,l.top-8,3,l.bottom-l.top+8,'#a0a9b5');rect(c,x+8,l.top-8,3,l.bottom-l.top+8,'#a0a9b5');for(let y=l.top;y<l.bottom;y+=12)rect(c,x-9,y,19,3,'#a4adb9');}
  }
drawRelays(){
    const c=this.c;
    for(const [i,r] of this.relays.entries()){
      const x=r.x-this.cam,y=r.y;rect(c,x-5,y-12,31,45,'#2d333b');rect(c,x-3,y-10,27,4,'#717f92');rect(c,x+2,y-1,18,13,r.done?'#c8ef7b':'#d68b54');
      rect(c,x+7,y+18,10,4,'#8f99a8');rect(c,x+9,y-29,3,17,'#727f92');
      c.strokeStyle=r.done?this.accent:'#ffbd6d';c.lineWidth=2;c.beginPath();c.arc(x+10,y-22,10+Math.sin(this.time*4)*3,Math.PI,Math.PI*2);c.stroke();
      text(c,r.done?'OVERRIDDEN':`UPLINK ${i+1}`,x+10,y-39,r.done?this.accent:'#ffc387',10,'center');
      if(!r.done)text(c,this.character!=='tibo'?'[ E ] OVERRIDE':'[ F ] RESET',x+10,y+48,this.accent,10,'center');
    }
  }
drawBoss(){const b=this.boss,c=this.c,x=b.x-this.cam,y=b.y;if(x<-120||x>W+100)return;
    if(b.dead){rect(c,x,y+45,76,31,'#373e47');text(c,'200 OK',x+38,y+40,this.accent,12,'center');return;}
    const exposed=b.phase===2;rect(c,x-7,y+68,90,8,'#1d2025');rect(c,x,y+10,76,59,'#535b66');rect(c,x+7,y,60,16,'#758191');rect(c,x+8,y+17,61,43,'#282d34');rect(c,x+17,y+25,37,26,exposed?'#ff8f46':'#768395');rect(c,x+22,y+30,27,16,exposed?'#ffdda0':'#292e36');rect(c,x-20,y+26,39,12,'#414954');rect(c,x-25,y+23,9,18,b.phase===1?'#ffb26b':'#788597');
    for(let i=0;i<3;i++){rect(c,x+60,y+21+i*12,7,6,exposed?'#f6a567':'#adb4bf');rect(c,x+8+i*22,y+62,14,4,'#8490a0');}
    text(c,exposed?'OVERHEAT':'429',x+38,y-9,exposed?'#ffbd6b':'#c6ccd4',13,'center');
    if(b.active){rect(c,290,this.camY+107,380,5,'#1b1e22');rect(c,290,this.camY+107,380*Math.max(0,b.hp/b.max),5,exposed?'#ffb15c':'#98a2b0');text(c,'THE RATE LIMITER',480,this.camY+99,'#cacfd7',9,'center');}
    if(b.phase===0&&b.active){const target=this.bossAim();c.strokeStyle='#ff8c5c55';c.setLineDash([5,6]);c.beginPath();c.moveTo(x-20,y+32);c.lineTo(target.x-this.cam,target.y);c.stroke();c.setLineDash([]);}
  }
drawExit(){const x=3925-this.cam,c=this.c;if(x<-100||x>W+150)return;c.save();c.translate(0,BASE);rect(c,x-26,418,100,4,'#8f99a8');rect(c,x-18,280,5,140,'#616e7f');rect(c,x+65,280,5,140,'#616e7f');rect(c,x-18,280,88,6,'#8490a0');text(c,this.boss.dead?'EXTRACTION OPEN':'EXTRACTION LOCKED',x+25,265,this.boss.dead?this.accent:'#8d98a8',10,'center');
    if(this.boss.dead){c.globalAlpha=.12+Math.sin(this.time*6)*.05;rect(c,x-12,287,77,131,this.accent);c.globalAlpha=1;text(c,'→',x+25,364,this.accent,36,'center');}else{for(let y=292;y<412;y+=12)rect(c,x-12,y,77,2,'#bc77505c');}c.restore();}
loop(t:number){
    if(this.state==='title'&&this.rosterPreview){this.last=t;this.acc=0;this.frame=requestAnimationFrame(n=>this.loop(n));return;}
    const dt=Math.min(.05,(t-this.last)/1000||0);this.last=t;
    if(this.state==='paused'){this.render();}else{this.acc+=dt;let steps=0;while(this.acc>=1/120&&steps++<7){this.update(1/120);this.acc-=1/120;}this.render();}
    this.frame=requestAnimationFrame(n=>this.loop(n));
  }
snapshot(){return {coop:this.coop.snapshot(),marcus:this.marcusKit.snapshot(),encounters:this.encounters.snapshot(),pidalf:this.pidalfKit.snapshot(),dialogue:this.barks.snapshot(),dimillian:this.dimillianKit.snapshot(),refillFeedback:this.refillFeedback,refillFrom:this.refillFrom,burstSpend:this.burstSpend,burstShots:this.burstShots,burstLife:this.burstLife,dryFire:this.dryFire,dryFeedback:this.dryFeedback,spendFlash:this.spendFlash,lastSpend:this.lastSpend,character:this.character,defense:{cooldown:this.defense.cooldown,active:this.defense.active?{...this.defense.active}:null,blocks:this.defense.blocks,recovered:this.defense.recovered,pendingCooldown:this.defense.pendingCooldown},modeFeedback:this.modeFeedback,modeBurst:this.modeBurst,peter:{stock:this.peterKit.stock,throwCooldown:this.peterKit.throwCooldown,commandPoint:this.peterKit.commandPoint,orderTime:this.peterKit.orderTime,pets:this.peterKit.pets.map(p=>({x:p.x,y:p.y,id:p.id,type:p.type,hp:p.hp,state:p.state,charge:p.charge,dash:p.dash,fuse:p.fuse})),molt:this.peterKit.molt,moltCooldown:this.peterKit.moltCooldown,kind:this.peterKit.name},alarms:this.alarms.map(a=>({...a})),state:this.state,thinking:thinkingWeapon(this.thinking).name,thinkingPercent:this.thinking*50,weapon:thinkingWeapon(this.thinking),resetAnimation:this.resetProp?{x:this.resetProp.x,y:this.resetProp.y,landed:this.resetProp.landed,time:this.resetProp.age,slam:this.resetProp.slam,struck:this.resetProp.struck}:null,otherTibo:{cooldown:this.otherTibo.cooldown,tokenFlights:this.otherTibo.flights.length,recovered:this.otherTibo.rewardTotal,catchFeedback:this.otherTibo.catchFeedback,active:this.otherTibo.active?{x:this.otherTibo.active.x,y:this.otherTibo.active.y,phase:this.otherTibo.active.phase,life:this.otherTibo.active.life,blocks:this.otherTibo.active.blocks}:null},fireCooldown:this.fireTimer,aimAngle:this.aimAngle,face:this.face,quiet:this.keys.has('ShiftLeft')||this.keys.has('ShiftRight'),pointerActive:this.pointer.active,firing:this.pointer.down,lastBark:this.lastBark,enemyStates:this.enemies.filter(e=>!e.dead).map(e=>({type:e.type,x:e.x,y:e.y,face:e.face,look:e.look,awareness:{...e.awareness},hp:e.hp,shield:e.shield,shieldDown:e.shieldDown,stun:e.stun,wind:e.wind,hacked:e.hacked})),wallGrip:this.wallGrip,wallGrace:this.wallGrace,player:{x:Math.round(this.player.x),y:Math.round(this.player.y),grounded:this.player.grounded},health:this.health,usage:Math.round(this.usage),tokenCapacity:TOKEN_CAPACITY,tokenCost:shotCost(thinkingWeapon(this.thinking).cost),resetRecovery:this.resetRecovery,charges:this.charges,kills:this.kills,blocksDestroyed:this.world.destroyed,rescues:this.totalRescues,deaths:this.deaths,checkpoint:this.checkpoint,cam:this.cam,camY:this.camY,zip:this.zip,climb:this.climb,relays:this.relays.map(r=>({x:r.x,y:r.y,done:r.done})),boss:{hp:this.boss.hp,phase:this.boss.phase,active:this.boss.active,dead:this.boss.dead},shots:this.shotCount,resets:this.resetCount,scrap:this.debris.pieces.length,oil:this.debris.oil.length,particles:this.particles.length,bullets:this.bullets.length,elapsed:this.elapsed};}
}
