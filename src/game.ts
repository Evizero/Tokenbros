import { MarcusKit } from './marcus';
import { marcus,cartridgeArt,invaderArt,lcdFigure,pacmanArt,MARCUS_COLOR,AUGMENT_NAMES,AUGMENT_COLORS } from './marcus-art';
import { LEVEL_ENEMIES,LEVEL_BARRELS,FACADES,SECTORS } from './level';
import { Encounters } from './encounters';
import { PidalfKit } from './pidalf';
import { pidalf,pidalfPortrait,PI_COLOR } from './pidalf-art';
import { HeroBarks } from './hero-barks';
import { showRoster } from './roster';
import { DimillianKit } from './dimillian';
import { dimillian,dimillianPortrait,dimillianIntro,DIM_COLORS,DIM_FORMS,sheep } from './dimillian-art';
import { OtherTibo } from './other-tibo';
import { Defense } from './defense';
import { PeterKit } from './peter';
import { peter,peterPortrait,claw,CLAW_COLORS } from './peter-art';
import { throwButton,stepButton,type ResetButton } from './throwable';
import { World, TILE, COLS, BASE, LADDERS, LEVEL_HEIGHT, clamp, overlap, type Body } from './world';
import { Debris } from './debris';
import { THINKING, thinkingWeapon, thinkingScroll, canvasPoint, shieldHit } from './combat';
import { awareness, perceive, hear, hears, inView, turnToward, reached, type Awareness } from './perception';
import { TOKEN_CAPACITY, RESET_RECOVERY, shotCost, spendTokens } from './tokens';
import { AudioFX } from './audio';
import { W,H,rect,text,wallGripPose,background,scenery,refinerySigns,terrain,tibo,portrait,robot } from './art';
type Enemy=Body&{sector?:number;arrival?:number;sheep?:number;combatTarget?:Body;awareness:Awareness;look:number;patrol:number;patrolWait:number;dash:number;flung:number;type:string;hp:number;max:number;face:number;cool:number;wind:number;hurt:number;dead:boolean;home:number;homeY:number;shield:number;hacked:number;turn:number;alert:boolean;stun:number;evade:number;lockX:number;lockY:number;voiceCool:number;shieldDown:number};
type Bullet={x:number;y:number;vx:number;vy:number;life:number;hostile:boolean;power:number;pierce:number;boost:boolean;tier?:number;color?:string;spell?:number;fireball?:number;hit:Set<unknown>};
type Particle={x:number;y:number;vx:number;vy:number;life:number;max:number;color:string;size:number;gravity:number};
type Barrel=Body&{hp:number;dead:boolean;fuse:number;mobile?:boolean;angle?:number};
type Rescue={x:number;y:number;done:boolean};
type Grenade={x:number;y:number;vx:number;vy:number;life:number};
type Relay={x:number;y:number;done:boolean;supplied:boolean};
type Ring={x:number;y:number;r:number;max:number;life:number;color:string};
const REFILL_ANIMATION=1.35,REFILL_FEEDBACK=2.2;
const rand=(a:number,b:number)=>a+Math.random()*(b-a);
const $=<T extends Element=HTMLElement>(s:string)=>document.querySelector<T>(s)!;
export class Game {
  barks=new HeroBarks(this);
  encounters=new Encounters(this);
  rosterPreview:{destroy():void}|null=null;
  otherTibo=new OtherTibo(this);
  defense=new Defense(this);
  character:'tibo'|'peter'|'dimillian'|'pidalf'|'marcus'='dimillian';peterKit=new PeterKit(this);dimillianKit=new DimillianKit(this);pidalfKit=new PidalfKit(this);marcusKit=new MarcusKit(this);
  c:CanvasRenderingContext2D;debris=new Debris();impactSound=0;audio=new AudioFX();world=new World();state:'title'|'intro'|'playing'|'paused'|'dead'|'won'='title';
  player:Body={x:90,y:828,w:20,h:32,vx:0,vy:0,grounded:true};
  keys=new Set<string>();enemies:Enemy[]=[];bullets:Bullet[]=[];particles:Particle[]=[];barrels:Barrel[]=[];rescues:Rescue[]=[];rings:Ring[]=[];
  modeFeedback=0;modeBurst=0;modeSound=0;
  pointer={active:false,x:0,y:0,down:false};thinking=0;pendingShot=0;lastCooldown=.095;aimAngle=0;voiceCooldown=0;lastBark="";
  resetProp:ResetButton|null=null;
  footstep=0;
  alarms:{x:number;y:number;triggered:boolean;timer:number;targetX:number;targetY:number}[]=[];
  refillFeedback=0;refillFrom=0;tokenTrail=TOKEN_CAPACITY;resetRecovery=RESET_RECOVERY;burstSpend=0;burstShots=0;burstLife=0;dryClick=0;dryFire=0;dryFeedback=0;lastSpend=0;spendFlash=0;
  health=3;usage=TOKEN_CAPACITY;charges=2;invuln=0;fireTimer=0;muzzle=0;face=1;aim=0;wall=0;wallGrip=0;wallGrace=0;lastWall=0;wallRegrab=0;coyote=0;jumpBuffer=0;wallLock=0;
  climb:number|null=null;cam=0;camY=440;introTimer=0;zip=false;zipCooldown=0;grenades:Grenade[]=[];relays:Relay[]=[];time=0;elapsed=0;shake=0;freeze=0;kills=0;chargeKills=0;deaths=0;checkpoint=90;checkpointY=828;respawnTimer=0;toastTimer=0;flash=0;effects=!matchMedia('(prefers-reduced-motion: reduce)').matches;
  boss={x:3620,y:784,w:76,h:76,hp:100,max:100,phase:0,timer:0,dead:false,active:false};
  frame=0;last=0;acc=0;hudTimer=0;checkpointIndex=0;totalRescues=0;shotCount=0;resetCount=0;
  get accent(){return this.character==='marcus'?MARCUS_COLOR:this.character==='pidalf'?PI_COLOR:this.character==='dimillian'?'#c39aff':this.character==='peter'?'#ff805f':'#d5ff60';}
  selectCharacter(character:'tibo'|'peter'|'dimillian'|'pidalf'|'marcus'){this.character=character;if(!this.preview)document.documentElement.dataset.character=character;}
  constructor(public canvas:HTMLCanvasElement,public preview=false){
    this.selectCharacter(this.character);
    this.c=canvas.getContext('2d')!;this.c.imageSmoothingEnabled=false;this.populate();
    if(preview){this.audio.muted=true;this.effects=false;return;}
    window.addEventListener('keydown',e=>{if(e.target instanceof HTMLInputElement&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.code))return;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyJ','KeyK','KeyF','KeyE','KeyQ','ShiftLeft','ShiftRight','KeyW','KeyA','KeyS','KeyD','Escape'].includes(e.code))e.preventDefault();if(!e.repeat)this.press(e.code);});
    window.addEventListener('keyup',e=>this.release(e.code));
    window.addEventListener('blur',()=>{this.keys.clear();this.pointer.down=false;this.pendingShot=0;if(this.state==='playing')this.pause();});
    document.addEventListener('visibilitychange',()=>{if(document.hidden){this.keys.clear();this.pointer.down=false;this.pendingShot=0;if(this.state==='playing')this.pause();}});
    const point=(e:PointerEvent)=>{if(e.pointerType==='touch')return;this.pointer.active=true;this.pointer.x=e.clientX;this.pointer.y=e.clientY;};
    canvas.addEventListener('pointermove',point);
    canvas.addEventListener('pointerdown',e=>{if(e.button!==0||e.pointerType==='touch'||this.state!=='playing')return;e.preventDefault();point(e);canvas.focus();canvas.setPointerCapture(e.pointerId);this.pointer.down=true;this.pendingShot=.14;this.audio.start();});
    const releasePointer=()=>{this.pointer.down=false;};
    window.addEventListener('pointerup',releasePointer);canvas.addEventListener('pointercancel',()=>{releasePointer();this.pendingShot=0;});canvas.addEventListener('lostpointercapture',releasePointer);
    canvas.addEventListener('pointerleave',()=>{if(!this.pointer.down)this.pointer.active=false;});
    canvas.parentElement!.addEventListener('wheel',e=>{if(this.state!=='playing'||e.ctrlKey)return;e.preventDefault();const step=thinkingScroll(e.deltaY,e.deltaMode);if(step)this.setThinking(this.thinking+step);},{passive:false});
    requestAnimationFrame(t=>this.loop(t));
  }
  populate(){
    this.enemies=LEVEL_ENEMIES.map(([x,y,type],i)=>{const e=this.spawnEnemy(x,y,type,i%3===0?1:-1);e.sector=SECTORS.findIndex(s=>x>=s.from&&x<s.to);return e;});
    this.alarms=[[850,620],[1690,220],[3000,470]].map(([x,y])=>({x,y,triggered:false,timer:0,targetX:x,targetY:y}));
    this.barrels=LEVEL_BARRELS.map(([x,y])=>({x,y,w:18,h:30,vx:0,vy:0,grounded:false,hp:2,dead:false,fuse:0}));
    this.rescues=[{x:1720,y:286,done:false},{x:2870,y:566,done:false}];
    this.relays=[{x:1650,y:286,done:false,supplied:false},{x:2960,y:566,done:false,supplied:false}];
    this.grenades=[];this.zip=false;
  }

  spawnEnemy(x:number,y:number,type:string,face=-1):Enemy{return {awareness:awareness(x+10,y+15),look:face>0?0:Math.PI,patrol:face,patrolWait:.8,dash:0,flung:0,x,y,w:20,h:30,vx:0,vy:0,grounded:false,type,hp:type==='turret'?8:type==='shield'?7:4,max:type==='turret'?8:type==='shield'?7:4,face:face,cool:rand(.6,1.6),wind:0,hurt:0,dead:false,home:x,homeY:y,shield:6,hacked:0,turn:0,alert:false,stun:0,evade:0,lockX:x,lockY:y,voiceCool:0,shieldDown:0};}

  press(key:string){
    this.keys.add(key);
    if(!this.pointer.active&&['ArrowLeft','KeyA'].includes(key))this.face=-1;
    if(!this.pointer.active&&['ArrowRight','KeyD'].includes(key))this.face=1;
    if(this.state==='intro'&&['Space','Enter','Escape'].includes(key)){this.finishIntro();return;}
    if(key==='Enter'&&this.state==='title')this.start();
    if(key==='Escape'){if(this.state==='playing')this.pause();else if(this.state==='paused')this.resume();}
    if(this.state==='playing'&&(/^Digit[123]$/.test(key)||this.character==='marcus'&&key==='Digit4'))this.setThinking(Number(key.at(-1))-1);
    if(key==='Space'&&this.state==='playing')this.jumpBuffer=.12;
    if((key==='KeyF'||key==='KeyK')&&this.state==='playing'){if(this.character==='marcus')this.marcusKit.ultimate();else if(this.character==='pidalf')this.pidalfKit.compact();else if(this.character==='dimillian')this.dimillianKit.ultimate();else if(this.character==='peter')this.peterKit.transform();else this.reset();}
    if(key==='KeyE'&&this.state==='playing'){if(this.character==='marcus'){if(!this.overrideNearbyUplink())this.marcusKit.recall();return;}if(this.character==='pidalf'){if(!this.overrideNearbyUplink())this.pidalfKit.grab();return;}if(this.character==='dimillian'){if(!this.overrideNearbyUplink())this.dimillianKit.secondary();}else if(this.character==='peter'){this.updateAim();if(!this.overrideNearbyUplink())this.peterKit.throw();}else this.otherTibo.activate();}
    if(key==='KeyQ'&&this.state==='playing'){if(this.character==='marcus'){this.marcusKit.dodge();return;}if(this.character==='pidalf'){this.pidalfKit.defend();return;}if(this.character==='dimillian')this.dimillianKit.defend();else this.defense.activate();}
    if(key==='KeyR'&&this.state==='dead')this.respawn();
  }
  release(key:string){this.keys.delete(key);if(key==='KeyE'&&this.character==='pidalf')this.pidalfKit.release();if(key==='KeyQ'){this.defense.release();this.dimillianKit.releaseDefense();}if(key==='Space'&&this.player.vy<-180)this.player.vy=-180;}
  start(){
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
  pause(){this.marcusKit.lcd.cancel();this.marcusKit.wasFiring=false;this.marcusKit.invader.cancel();this.marcusKit.invader.wasFiring=false;this.pidalfKit.release(false);this.defense.release();this.dimillianKit.releaseDefense();this.dimillianKit.charge=0;this.audio.silenceRobots();this.state='paused';this.keys.clear();this.pointer.down=false;this.pendingShot=0;this.panel('TAKE A BREATHER.','The refinery can wait.','RESUME OPERATION',()=>this.resume(),'<button class="text-btn" id="restart">RESTART MISSION</button><button class="text-btn" id="switch-bro">SWITCH BRO</button>');$('#restart').addEventListener('click',()=>this.start());$('#switch-bro').addEventListener('click',()=>showRoster(this));}
  resume(){this.state='playing';this.keys.clear();this.pointer.down=false;this.pendingShot=0;$('#overlay').setAttribute('hidden','');this.canvas.focus();}
  panel(title:string,body:string,button:string,action:()=>void,extra=''){
    const o=$('#overlay');o.className='overlay';o.innerHTML=`<div class="briefing"><div class="eyebrow">OPERATION HARD RESET</div><div class="result-title">${title}</div><div class="result-stats">${body}</div><div class="pause-actions"><button class="primary" id="panel-action">${button} <span class="arrow">↗</span></button>${extra}</div></div>`;o.removeAttribute('hidden');$('#panel-action').addEventListener('click',action);
  }
  notify(a:string,b=''){if(this.preview)return;const e=$('.toast');e.innerHTML=`<strong>${a}</strong><small>${b}</small>`;this.toastTimer=3.2;}
  emit(x:number,y:number,count:number,colors:string[],force=140,size=4,life=.6){
    for(let i=0;i<count;i++)this.particles.push({x,y,vx:rand(-force,force),vy:rand(-force,force*.4),life:rand(life*.45,life),max:life,color:colors[Math.floor(rand(0,colors.length))],size:rand(1,size),gravity:400});
    if(this.particles.length>800)this.particles.splice(0,this.particles.length-800);
  }
  explode(x:number,y:number,r=80,fromPlayer=true){
    this.makeNoise(x,y,r>100?1600:1300);this.triggerAlarm(x,y);this.audio.blast(r>100);this.shake=Math.max(this.shake,r>100?10:6);if(this.effects)this.freeze=.035;
    this.emit(x,y,42,['#fff2b5','#ffc44f','#ff7a3f','#6c7960','#394d37'],r*3,8,.9);this.rings.push({x,y,r:0,max:r,life:.3,color:'#ffca67'});
    for(let dx=-r;dx<=r;dx+=TILE)for(let dy=-r;dy<=r;dy+=TILE)if(dx*dx+dy*dy<r*r){const b=this.world.damage(x+dx,y+dy,8);if(b)this.emit(x+dx,y+dy,3,['#98a969','#506943'],120,5);}
    for(const b of this.barrels)if(!b.dead&&Math.hypot(b.x+9-x,b.y+15-y)<r+10)b.fuse=b.fuse||rand(.07,.2);
    for(const e of this.enemies)if(!e.dead&&Math.hypot(e.x+10-x,e.y+15-y)<r+15){e.hp-=10;e.vx+=(e.x>x?1:-1)*200;e.vy=-160;if(e.hp<=0)this.kill(e,e.vx,-250,true);}
    if(!fromPlayer){
      const protectedByShield=this.character==='dimillian'&&Math.hypot(this.player.x+10-x,this.player.y+16-y)<r&&this.dimillianKit.absorbBlast(x,y);
      if(!protectedByShield&&Math.hypot(this.player.x+10-x,this.player.y+16-y)<r)this.damage();
      if(this.character==='peter')for(const pet of this.peterKit.pets)if(Math.hypot(pet.x+7-x,pet.y+5-y)<r)this.peterKit.hurtPet(pet,3,.5);
    }
    if(this.boss.active&&!this.boss.dead&&this.boss.phase===2&&Math.hypot(this.boss.x+38-x,this.boss.y+38-y)<r+35)this.boss.hp-=8;
  }
  kill(e:Enemy,dx=e.vx||this.face*160,dy=-140,big=false){
    if(e.dead)return;e.dead=true;this.kills++;this.chargeKills++;this.barks.killed();
    this.debris.shatter(e.x+10,e.y+12,dx,dy,big);
    this.emit(e.x+10,e.y+12,22,['#19343c','#357e74','#101d2a','#8bd0b1'],big?290:180,4,.85);
    this.emit(e.x+10,e.y+12,12,['#fff6bc','#ffc764','#fa8750'],220,3,.4);
    this.shake=Math.max(this.shake,big?7:3.5);if(this.effects)this.freeze=Math.max(this.freeze,big?.055:.025);this.audio.scrap(big);
    if(this.chargeKills>=5&&this.character==='tibo'){this.chargeKills=0;this.charges=Math.min(3,this.charges+1);this.notify('RESET BANKED','5 bots scrapped. Another round on Tibo.');this.audio.pickup();}
  }
  damage(){
    if(this.preview)return;
    if(this.invuln>0||this.state!=='playing'||this.character==='marcus'&&(this.marcusKit.flip>.055||!!this.marcusKit.lcd.flight))return;this.health--;this.invuln=.85;this.flash=.18;this.shake=7;this.audio.hurt();
    this.emit(this.player.x+10,this.player.y+15,9,['#fff0ba','#fa8760'],130,3);
    if(this.health<=0)this.die();else if(this.health===1)this.barks.request('lowHealth');
  }
  die(){
    if(this.state!=='playing')return;this.marcusKit.clear();this.pidalfKit.clear();this.resetProp=null;this.defense.active=null;this.otherTibo.active=null;this.dimillianKit.clear();this.peterKit.pets=[];this.peterKit.molt=0;this.state='dead';this.barks.request('death');this.deaths++;this.respawnTimer=1.1;this.keys.clear();this.pointer.down=false;this.pendingShot=0;this.audio.blast();this.emit(this.player.x+10,this.player.y+15,35,[this.accent,'#ba9070','#566351'],200,5,.8);const witness=this.enemies.filter(e=>!e.dead&&e.hacked<=0&&Math.hypot(e.x-this.player.x,e.y-this.player.y)<650).sort((a,b)=>Math.abs(a.x-this.player.x)-Math.abs(b.x-this.player.x))[0];if(witness){witness.voiceCool=0;this.enemyReaction(witness,'laugh');}
    this.notify('CONNECTION LOST','Reconnecting at the last deployment point…');
  }
  respawn(){
    this.pidalfKit.clear();this.pidalfKit=new PidalfKit(this);this.marcusKit=new MarcusKit(this);
    this.wall=0;this.wallGrip=0;this.wallGrace=0;this.lastWall=0;this.wallRegrab=0;this.wallLock=0;this.coyote=0;this.jumpBuffer=0;
    this.refillFeedback=0;
    this.player={x:this.checkpoint,y:this.checkpointY-30,w:20,h:32,vx:0,vy:0,grounded:false};
    // Restore only the spawn's landing pad, at its actual vertical elevation.
    const row=Math.round((this.checkpointY+32)/TILE);
    for(let x=Math.floor(this.checkpoint/TILE)-1;x<Math.floor(this.checkpoint/TILE)+3;x++)this.world.set(x,row,3);
    for(let y=row-3;y<row;y++)for(let x=Math.floor(this.checkpoint/TILE)-1;x<Math.floor(this.checkpoint/TILE)+3;x++)this.world.blocks[y*COLS+x]=null;
    this.zip=false;this.climb=null;this.camY=clamp(this.checkpointY-325,0,LEVEL_HEIGHT-H);

    this.burstSpend=0;this.burstShots=0;this.burstLife=0;this.dryFire=0;this.dryFeedback=0;this.spendFlash=0;this.defense=new Defense(this);this.otherTibo=new OtherTibo(this);this.peterKit=new PeterKit(this);this.dimillianKit.clear();this.dimillianKit=new DimillianKit(this);this.dimillianKit.form=thinkingWeapon(this.thinking).tier;this.health=3;this.usage=TOKEN_CAPACITY;this.tokenTrail=TOKEN_CAPACITY;this.charges=Math.max(1,this.charges);this.invuln=2;this.bullets=this.bullets.filter(b=>!b.hostile);this.state='playing';this.cam=clamp(this.checkpoint-260,0,COLS*TILE-W);this.keys.clear();this.pointer.down=false;this.pendingShot=0;this.notify('BACK ONLINE','Usage restored. You have work to do.');this.barks.request('respawn');
    if(this.boss.active&&!this.boss.dead){this.boss.timer=0;this.boss.phase=0;}
  }
  reset(){
    if(this.resetProp)return;
    if(!this.charges){this.notify('RESET NOT READY',`Next reset in ${Math.ceil(this.resetRecovery)}s. Bot kills can earn one sooner.`);return;}
    this.updateAim();this.charges--;this.resetCount++;
    this.resetProp=throwButton(this.player.x+10,this.player.y+17,this.aimAngle);this.audio.tone(280,.22,'triangle',.055,650);
  }
  updateReset(dt:number){
    const r=this.resetProp;if(!r)return;stepButton(r,dt,this.world);
    if(r.landed&&r.slam>=.4&&!r.struck){r.struck=true;this.performReset(r.x+r.w/2,r.y+r.h-12);}
    if((r.struck&&r.slam>=.7)||r.y>LEVEL_HEIGHT+80||r.age>10)this.resetProp=null;
  }
  overrideNearbyUplink(){
    const r=this.relays.find(r=>!r.done&&Math.hypot(r.x-this.player.x,r.y-this.player.y)<130);if(!r)return false;
    this.openUplinks(r.x,r.y);this.audio.pickup();return true;
  }
  openUplinks(x:number,y:number){
    for(const [i,r] of this.relays.entries())if(!r.done&&Math.hypot(r.x-x,r.y-y)<160){
      r.done=true;this.barks.request('uplink');this.world.openGate(i);this.checkpoint=r.x+20;this.checkpointY=r.y+2;this.health=3;
      this.emit(r.x+10,r.y+10,45,[this.accent,'#fff4b1','#72c5aa'],220,5);
      this.notify(`UPLINK ${i+1} OVERRIDDEN`,i===0?'Gate open. Jump + hold ↑ to grab the cable.':'Both feeds down. Find the Rate Limiter →');
    }
  }
  performReset(x:number,y:number){
    this.barks.request('reset');
    this.refillFrom=this.usage;this.refillFeedback=REFILL_FEEDBACK;
    this.burstSpend=0;this.burstShots=0;this.burstLife=0;this.dryFire=0;this.dryFeedback=0;this.spendFlash=0;this.usage=TOKEN_CAPACITY;this.tokenTrail=TOKEN_CAPACITY;this.fireTimer=0;this.audio.reset();
    this.explode(x,y,110);this.rings.push({x,y,r:0,max:145,life:.4,color:this.accent});
    this.bullets=this.bullets.filter(b=>!b.hostile||Math.hypot(b.x-x,b.y-y)>130);
    // Refill + one local impact; subsequent shots always cost tokens.
    this.openUplinks(x,y);
  }

  setThinking(level:number){
    if(this.character==='dimillian'&&this.dimillianKit.special>0){this.dimillianKit.feedback('FINISH THE MOVE');return;}
    const next=clamp(level,0,this.character==='marcus'?3:2);if(next===this.thinking)return;
    const previousTier=this.character==='marcus'?this.marcusKit.mode:thinkingWeapon(this.thinking).tier;if(this.character==='marcus'&&this.marcusKit.modeAt(next)!==previousTier){this.marcusKit.invader.cancel();this.marcusKit.lcd.cancel();}this.thinking=next;const tier=this.character==='marcus'?this.marcusKit.mode:thinkingWeapon(next).tier;if(this.character==='dimillian')this.dimillianKit.changeForm(tier);
    this.modeFeedback=1.5;
    if(tier!==previousTier){this.modeBurst=.5;this.audio.tone(260+tier*180,.14,'triangle',.045,480+tier*240);this.modeSound=.1;}
    else if(this.modeSound<=0){this.audio.tone(220+next*240,.045,'sine',.016,260+next*240);this.modeSound=.065;}
    this.hud();
  }
  aimPoint(){
    if(this.pointer.active){const p=canvasPoint(this.pointer.x,this.pointer.y,this.canvas.getBoundingClientRect());return {x:p.x+this.cam,y:p.y+this.camY};}
    return {x:this.player.x+10+Math.cos(this.aimAngle)*220,y:this.player.y+16+Math.sin(this.aimAngle)*220};
  }
  updateAim(){
    let ax=0,ay=0;
    if(this.pointer.active){
      const pos=canvasPoint(this.pointer.x,this.pointer.y,this.canvas.getBoundingClientRect());
      ax=pos.x+this.cam-(this.player.x+10);ay=pos.y+this.camY-(this.player.y+17);
      if(Math.abs(ax)>.5)this.face=ax>0?1:-1;
    }else{
      ax=this.keys.has('KeyA')||this.keys.has('ArrowLeft')?-1:this.keys.has('KeyD')||this.keys.has('ArrowRight')?1:0;
      ay=this.keys.has('KeyW')||this.keys.has('ArrowUp')?-1:this.keys.has('KeyS')||this.keys.has('ArrowDown')?1:0;
    }
    if(!ax&&!ay)ax=this.face;
    this.aimAngle=Math.atan2(ay,ax);this.aim=Math.atan2(ay,ax*this.face);
  }
  shoot(){
    if(this.character==='marcus'){this.marcusKit.fire();return;}
    if(this.character==='pidalf'){this.pidalfKit.fire();return;}
    if(this.character==='dimillian'){this.dimillianKit.fireInput(1/120,true);return;}
    if(this.character==='peter'){if(this.peterKit.molt>0)this.peterKit.punchAttack();else{this.peterKit.command();this.peterKit.handAttack();}return;}
    const angle=this.aimAngle,mode=thinkingWeapon(this.thinking),tier=mode.tier;
    const remaining=spendTokens(this.usage,mode.cost);
    if(remaining===null){
      this.barks.request('empty');
      this.fireTimer=.22;this.lastCooldown=.22;this.dryFire=.16;this.dryFeedback=.8;this.burstLife=0;this.muzzle=0;this.spendFlash=0;
      if(this.dryClick<=0){this.audio.noise(.025,.025,2800);this.audio.tone(210,.04,'square',.02,95);this.dryClick=.2;}
      return;
    }
    this.lastSpend=this.usage-remaining;
    if(this.burstLife<=0){this.burstSpend=0;this.burstShots=0;}
    this.burstSpend+=this.lastSpend;this.burstShots++;this.burstLife=Math.max(.7,mode.cooldown+.3);
    this.usage=remaining;this.spendFlash=.6;this.dryFire=0;this.dryFeedback=0;
    const originX=this.player.x+10,originY=this.player.y+17;this.makeNoise(originX,originY,[330,430,570][tier]);
    for(const spread of [tier===0?rand(-.014,.014):0]){
      const a=angle+spread;this.bullets.push({x:originX+Math.cos(a)*10,y:originY+Math.sin(a)*10,vx:Math.cos(a)*(tier===2?1300:850),vy:Math.sin(a)*(tier===2?1300:850),life:1.1,hostile:false,power:mode.power,pierce:mode.pierce,boost:false,tier,color:mode.color,hit:new Set()});
    }
    this.fireTimer=mode.cooldown;this.lastCooldown=this.fireTimer;this.muzzle=tier===2?.1:.05;this.audio.shoot(false,tier);this.shotCount++;
    this.debris.casing(originX-4*this.face,originY,this.face);if(tier===2)this.shake=Math.max(this.shake,tier===2?3:1.2);
  }
  enemyReaction(e:Enemy,kind:'spot'|'block'|'hurt'|'attack'|'laugh'='spot'){
    if(e.dead||e.hacked>0||e.voiceCool>0||(this.voiceCooldown>0&&kind!=='laugh'))return;
    e.voiceCool=5;this.voiceCooldown=2.8;this.lastBark=kind;this.audio.robot(kind,clamp((e.x+10-this.cam-W/2)/(W/2),-1,1),Math.hypot(e.x-this.player.x,e.y-this.player.y));
  }
  makeNoise(x:number,y:number,radius:number,source?:Enemy){
    for(const e of this.enemies){
      if(e===source||e.dead||e.hacked>0||e.sheep||Math.hypot(e.x+10-x,e.y+12-y)>radius)continue;
      if(hears(e.x+10,e.y+12,x,y,radius,!this.lineOfSight(e.x+10,e.y+12,x,y),radius>=1000?.8:.55))hear(e.awareness,x,y,radius>=1000?8:4);
    }
  }
  triggerAlarm(x:number,y:number){
    // A finite response per sector. Sound reports the blast location, never the player.
    const a=this.alarms.filter(a=>Math.hypot(a.x-x,a.y-y)<900).sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y))[0];
    if(!a||a.triggered)return;a.triggered=true;a.timer=2.4;a.targetX=x;a.targetY=y;
  }
  updateAlarms(dt:number){
    for(const a of this.alarms){if(a.timer<=0)continue;a.timer-=dt;if(a.timer>0)continue;
      for(const offset of [-55,55]){const e=this.spawnEnemy(a.x+offset,a.y-100,'drone');e.cool=1.2;hear(e.awareness,a.targetX,a.targetY,8);this.enemies.push(e);this.emit(e.x+10,e.y+12,16,['#ffb47c','#899e97'],75,3,.6);}
    }
  }
  drawAlarms(){
    const c=this.c;for(const a of this.alarms){const x=a.x-this.cam;if(x<-100||x>W+100)continue;
      rect(c,x-4,a.y,8,38,'#526c5b');rect(c,x-10,a.y-3,20,9,'#1a302e');rect(c,x-7,a.y-6,14,6,a.timer>0&&Math.floor(this.time*8)%2?'#ff9765':a.triggered?'#805a45':'#a2c28e');
      if(a.timer>0){text(c,'BACKUP INCOMING',x,a.y-25,'#ffc193',9,'center');for(const offset of [-55,55]){c.strokeStyle='#ffb47c';c.lineWidth=1;c.beginPath();c.arc(x+offset,a.y-85,12+Math.sin(this.time*9)*3,0,Math.PI*2);c.stroke();rect(c,x+offset-2,a.y-87,4,4,'#ffce9c');}}
    }
  }
  sensor(e:Enemy){return {x:e.x+10,y:e.y+8,angle:e.look,range:e.type==='turret'?440:e.type==='drone'?420:360,half:e.type==='turret'?.7:e.type==='drone'?1.05:.92};}
  seesBody(e:Enemy,p:Body){
    if(this.state!=='playing'||e.stun>0||e.hacked>0)return false;
    const s=this.sensor(e),x=p.x+p.w/2;
    return [.15,.5,.85].some(f=>inView(s.x,s.y,s.angle,s.range,s.half,x,p.y+p.h*f)&&this.lineOfSight(s.x,s.y,x,p.y+p.h*f));
  }
  enemyTarget(e:Enemy){
    const candidates:Body[]=[this.player];
    if(this.character==='tibo'&&this.otherTibo.active)candidates.push(this.otherTibo.active);
    if(this.character==='dimillian'&&this.dimillianKit.paired&&!this.dimillianKit.paired.dead)candidates.push(this.dimillianKit.paired);
    if(this.character==='peter')candidates.push(...this.peterKit.pets.filter(p=>p.hp>0&&p.state!=='return'));
    const distance=(p:Body)=>Math.hypot(p.x+p.w/2-e.x-10,p.y+p.h/2-e.y-15);
    const visible=candidates.filter(p=>this.seesBody(e,p)).sort((a,b)=>distance(a)-distance(b));
    // Keep a visible target unless another threat is substantially closer.
    const current=e.combatTarget;
    e.combatTarget=current&&visible.includes(current)&&distance(current)<=distance(visible[0])*1.35?current:visible[0];
    return e.combatTarget;
  }
  lineOfSight(x:number,y:number,tx:number,ty:number){
    const n=Math.ceil(Math.hypot(tx-x,ty-y)/12);
    for(let i=1;i<n;i++)if(this.world.at(x+(tx-x)*i/n,y+(ty-y)*i/n))return false;
    return true;
  }
  enemyShot(e:Enemy){
    const target=e.hacked>0?this.enemies.find(other=>other!==e&&!other.dead&&other.hacked<=0&&Math.abs(other.x-e.x)<550):{x:e.lockX-10,y:e.lockY-15};
    if(!target)return;
    const dx=target.x-e.x,dy=target.y-e.y,a=Math.atan2(dy,dx);this.makeNoise(e.x+10,e.y+15,260,e);
    if(e.type==='grenadier'){
      this.grenades.push({x:e.x+10,y:e.y-5,vx:clamp(dx*1.15,-260,260),vy:-330+clamp(dy*.25,-90,50),life:1.7});this.audio.tone(190,.13,'triangle',.045,80);return;
    }
    for(const spread of e.type==='turret'?[-.13,.13]:e.type==='drone'?[-.1,0,.1]:e.type==='gunner'?[-.055,.055]:[0])this.bullets.push({x:e.x+10+Math.cos(a)*18,y:e.y+15,vx:Math.cos(a+spread)*265,vy:Math.sin(a+spread)*265,life:2.4,hostile:e.hacked<=0,power:e.hacked>0?2:1,pierce:0,boost:e.hacked>0,hit:new Set([e])});
    this.audio.tone(85,.08,'sawtooth',.018,50);
  }
  updateGrenades(dt:number){
    for(const g of this.grenades){
      g.life-=dt;if(!this.pidalfKit.held.some(h=>h.grenade===g)){g.vy+=630*dt;const body={x:g.x-4,y:g.y-4,w:8,h:8,vx:g.vx,vy:g.vy,grounded:false},vx=g.vx,vy=g.vy;const wall=this.world.move(body,dt);g.x=body.x+4;g.y=body.y+4;g.vx=wall?-vx*.5:body.vx;g.vy=body.grounded?-Math.abs(vy)*.4:body.vy;}
      if(g.life<=0)this.explode(g.x,g.y,64,false);
    }
    this.grenades=this.grenades.filter(g=>g.life>0&&g.y<LEVEL_HEIGHT+50);
  }
  touchingWall(side:number){
    const p=this.player;return side!==0&&this.world.overlaps(p.x+side*2,p.y+4,p.w,p.h-8);
  }
  update(dt:number){
    this.barks.update(dt);
    this.time+=dt;this.impactSound-=dt;this.voiceCooldown-=dt;this.debris.update(dt,this.world);
    this.shake=Math.max(0,this.shake-dt*24);this.flash=Math.max(0,this.flash-dt);this.muzzle=Math.max(0,this.muzzle-dt);
    for(const p of this.particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.gravity*dt;p.vx*=1-dt*1.5;}this.particles=this.particles.filter(p=>p.life>0);
    for(const r of this.rings){r.life-=dt;r.r+=(r.max-r.r)*dt*13;}this.rings=this.rings.filter(r=>r.life>0);
    if(this.toastTimer>0){this.toastTimer-=dt;if(this.toastTimer<=0)$('.toast').innerHTML='';}
    if(this.state==='intro'){this.introTimer-=dt;if(this.introTimer<=0)this.finishIntro();return;}
    if(this.state==='dead'){this.respawnTimer-=dt;if(this.respawnTimer<=0)this.respawn();return;}
    if(this.state!=='playing')return;
    this.elapsed+=dt;if(this.player.x>1000&&this.player.y<780)this.barks.place('tower');this.modeFeedback=Math.max(0,this.modeFeedback-dt);this.modeBurst=Math.max(0,this.modeBurst-dt);this.modeSound=Math.max(0,this.modeSound-dt);
    if(this.freeze>0){this.freeze-=dt;return;}
    this.refillFeedback=Math.max(0,this.refillFeedback-dt);this.burstLife=Math.max(0,this.burstLife-dt);this.dryFire=Math.max(0,this.dryFire-dt);this.dryFeedback=Math.max(0,this.dryFeedback-dt);this.dryClick=Math.max(0,this.dryClick-dt);this.spendFlash=Math.max(0,this.spendFlash-dt);
    this.tokenTrail=Math.max(this.usage,this.tokenTrail-dt*500);
    if(this.charges===0){this.resetRecovery-=dt;if(this.resetRecovery<=0){this.charges=1;this.resetRecovery=RESET_RECOVERY;this.audio.tone(440,.14,'triangle',.035,660);}}
    else this.resetRecovery=RESET_RECOVERY;
    if(this.character==='marcus')this.marcusKit.update(dt);if(this.character==='pidalf')this.pidalfKit.update(dt);this.defense.update(dt);this.updateAlarms(dt);this.encounters.update(dt);this.updateReset(dt);if(this.character==='peter')this.peterKit.update(dt);this.otherTibo.update(dt);if(this.character==='dimillian')this.dimillianKit.update(dt);
    const p=this.player;this.invuln=Math.max(0,this.invuln-dt);this.fireTimer-=dt;this.jumpBuffer-=dt;this.wallLock-=dt;this.wallRegrab=Math.max(0,this.wallRegrab-dt);this.wallGrace=Math.max(0,this.wallGrace-dt);this.zipCooldown=Math.max(0,this.zipCooldown-dt);
    const left=this.keys.has('KeyA')||this.keys.has('ArrowLeft'),right=this.keys.has('KeyD')||this.keys.has('ArrowRight');
    const dir=(right?1:0)-(left?1:0);if(dir&&!this.pointer.active)this.face=dir;
    const bunkered=this.character==='dimillian'&&this.dimillianKit.shield?.kind===0;
    const flying=this.character==='dimillian'&&this.dimillianKit.form===2;
    if(this.character==='marcus'&&this.marcusKit.lcd.driving)this.marcusKit.lcd.move(dt);else if(bunkered){const s=this.dimillianKit.shield!;p.x=s.x-10;p.y=s.y-16;p.vx=0;p.vy=0;this.jumpBuffer=0;this.wallGrip=0;}else if(flying)this.dimillianKit.fly(dt,dir);else{
    const contact=this.touchingWall(dir)?dir:this.touchingWall(1)?1:this.touchingWall(-1)?-1:0;
    if(!p.grounded&&!this.zip&&this.climb===null&&contact&&this.wallRegrab<=0){this.lastWall=contact;this.wallGrace=.12;}
    if(p.grounded)this.coyote=.09;else this.coyote-=dt;
    if(this.wallLock<=0){const target=dir*(this.keys.has('ShiftLeft')||this.keys.has('ShiftRight')?90:235),accel=dir?2900:2200;p.vx+=clamp(target-p.vx,-accel*dt,accel*dt);}
    if(!this.zip&&this.jumpBuffer>0&&(this.coyote>0||this.wallGrace>0||this.climb!==null)){
      const wallJump=this.coyote<=0&&this.wallGrace>0&&this.climb===null,side=this.lastWall;
      p.vy=-520;this.climb=null;this.zipCooldown=.25;
      if(wallJump){const climbingSameWall=dir===side;p.vx=-side*(climbingSameWall?75:200);this.wallLock=climbingSameWall?.025:.07;this.wallRegrab=.12;this.wallGrace=0;this.wallGrip=0;if(!this.pointer.active&&!climbingSameWall)this.face=-side;}
      this.coyote=0;this.jumpBuffer=0;p.grounded=false;this.audio.jump();this.emit(p.x+10,p.y+31,6,['#adba83','#63765b'],55,3,.25);
    }
    const up=this.keys.has('KeyW')||this.keys.has('ArrowUp'),down=this.keys.has('KeyS')||this.keys.has('ArrowDown');
    if(!this.zip&&this.climb===null&&this.zipCooldown<=0&&(up||down)){
      const i=LADDERS.findIndex(l=>Math.abs(p.x+10-l.x)<22&&p.y+32>=l.top-2&&p.y+32<=l.bottom+5&&(up?p.y+32>l.top+1:p.y+32<l.bottom-1));
      if(i>=0)this.climb=i;
    }
    if(this.climb!==null){
      const l=LADDERS[this.climb];p.x=l.x-10;p.y=clamp(p.y+(down?1:up?-1:0)*150*dt,l.top-32,l.bottom-32);p.vx=0;p.vy=0;this.wall=0;
      if(p.y<=l.top-32&&up){this.climb=null;p.grounded=true;this.coyote=.09;}
      else if(p.y>=l.bottom-32&&down){this.climb=null;this.zipCooldown=.2;}
    }
    const cableY=250+(p.x-1700)*320/620;
    if(!this.zip&&this.zipCooldown<=0&&p.x>1670&&p.x<2310&&(this.keys.has('KeyW')||this.keys.has('ArrowUp'))&&Math.abs(p.y-cableY-10)<36){this.zip=true;this.barks.place('cable');this.notify('CABLE CONNECTED','Fire while riding. SPACE to jump off.');}
    if(this.zip){
      p.x+=320*dt;p.y=250+(p.x-1700)*320/620+10;p.vx=0;p.vy=0;p.grounded=false;
      if(this.jumpBuffer>0||p.x>2320){this.zip=false;this.zipCooldown=.5;p.vx=280;p.vy=-330;this.jumpBuffer=0;this.wallLock=.12;}
    }
    const fallingSpeed=p.vy,wasGrounded=p.grounded;
    if(!this.zip&&this.climb===null){
    p.vy=Math.min(660,p.vy+1400*dt);if(dir&&this.touchingWall(dir)&&this.wallRegrab<=0)p.vy=Math.min(p.vy,55);
    this.wall=this.world.move(p,dt);}
    this.wallGrip=!p.grounded&&!this.zip&&this.climb===null&&this.wallRegrab<=0&&dir&&this.touchingWall(dir)?dir:0;
    if(!wasGrounded&&p.grounded&&fallingSpeed>380)this.makeNoise(p.x+10,p.y+30,140);
    this.footstep-=dt;if(p.grounded&&Math.abs(p.vx)>120&&this.footstep<=0){this.makeNoise(p.x+10,p.y+30,90);this.footstep=.32;}
    }
    if(p.y>LEVEL_HEIGHT+40){this.die();return;}
    const targetCam=clamp(p.x-320,0,COLS*TILE-W);this.cam+=(targetCam-this.cam)*Math.min(1,dt*7);
    const targetY=clamp(p.y-330,0,LEVEL_HEIGHT-H);this.camY+=(targetY-this.camY)*Math.min(1,dt*5);
    this.updateAim();
    if(this.character==='peter'&&this.keys.has('KeyE')&&this.peterKit.throwCooldown<=0&&!this.relays.some(r=>!r.done&&Math.hypot(r.x-p.x,r.y-p.y)<130))this.peterKit.throw();
    const firing=this.pointer.down||this.keys.has('KeyJ')||this.pendingShot>0;
    if(this.character==='marcus'){this.marcusKit.fireInput(dt,firing);this.pendingShot=0;}else if(this.character==='dimillian'){this.dimillianKit.fireInput(dt,firing);this.pendingShot=0;}else if(firing&&this.fireTimer<=0){this.shoot();this.pendingShot=0;}
    this.pendingShot=Math.max(0,this.pendingShot-dt);
    for(const e of this.enemies){
      if(e.dead)continue;
      if(this.character==='marcus'&&this.marcusKit.pacman.controls(e))continue;if(this.character==='pidalf'&&this.pidalfKit.controls(e))continue;
      if((e.arrival??0)>0){e.arrival=Math.max(0,e.arrival!-dt);e.vy=Math.min(140,e.vy+350*dt);this.world.move(e,dt);e.cool=Math.max(e.cool,.5);continue;}
      if((e.sheep??0)>0){e.sheep=Math.max(0,e.sheep!-dt);e.wind=0;e.dash=0;e.cool=.7;e.vx=Math.sin(this.time*1.4+e.home)*18;e.vy=Math.min(620,e.vy+1400*dt);if(e.grounded&&!this.world.at(e.x+10+Math.sign(e.vx)*17,e.y+35))e.vx=0;this.world.move(e,dt);if(e.y>LEVEL_HEIGHT+50)this.kill(e);continue;}
      if(this.character==='dimillian'&&e===this.dimillianKit.paired)continue;
      e.hurt=Math.max(0,e.hurt-dt);e.hacked=Math.max(0,e.hacked-dt);e.turn-=dt;e.stun=Math.max(0,e.stun-dt);e.evade=Math.max(0,e.evade-dt);e.voiceCool-=dt;e.shieldDown=Math.max(0,e.shieldDown-dt);e.cool-=dt;e.patrolWait-=dt;
      const a=e.awareness,wasCombat=a.state==='combat';
      const target=this.enemyTarget(e),sees=!!target;perceive(a,sees,target?target.x+target.w/2:a.targetX,target?target.y+target.h/2:a.targetY,dt);
      if(a.state==='combat'&&!wasCombat){this.enemyReaction(e,'spot');for(const ally of this.enemies)if(ally!==e&&!ally.dead&&ally.hacked<=0&&Math.hypot(ally.x-e.x,ally.y-e.y)<340)hear(ally.awareness,a.targetX,a.targetY);}
      e.alert=a.state==='combat';
      // Distant idle guards sleep; alerted guards can still approach the disturbance.
      if(Math.abs(e.x-p.x)>950&&a.state==='patrol'){e.wind=0;continue;}
      if(e.stun>0){
        const speed=Math.hypot(e.vx,e.vy);e.vx*=Math.exp(-(e.flung>0?2:10)*dt);e.wind=0;e.cool=Math.max(e.cool,.35);
        e.vy=e.type==='drone'?e.vy*Math.exp(-3*dt):Math.min(650,e.vy+1400*dt);const impactVy=e.vy,hitWall=this.world.move(e,dt);
        if(this.character==='pidalf'&&e.flung>0&&speed>290&&(hitWall||e.grounded&&impactVy>290)){e.hp-=Math.min(8,speed/100);this.debris.armor(e.x,e.y,Math.sign(e.vx)||this.face);this.audio.scrap(true);this.shake=Math.max(this.shake,5);e.flung=0;if(e.hp<=0){this.kill(e,e.vx,-150,true);continue;}}
        if(e.flung>0){e.flung=Math.max(0,e.flung-dt);
          for(const barrel of this.barrels)if(!barrel.dead&&overlap(e,barrel)){barrel.fuse=barrel.fuse||.05;}
          for(const other of this.enemies)if(other!==e&&!other.dead&&other.stun<=0&&speed>180&&overlap(e,other)){other.hp-=3;other.stun=.45;other.wind=0;other.vx=e.vx*.5;other.vy=-150;if(other.hp<=0)this.kill(other,other.vx,-150);this.emit(other.x+10,other.y+12,12,['#ffcd87','#83dae9'],160,3);e.flung=0;}
        }
        if(e.y>LEVEL_HEIGHT+50)this.kill(e);continue;
      }

      const fighting=sees&&a.state==='combat',targetDist=Math.abs(a.targetX-(e.x+10));
      let wanted=e.patrol>0?0:Math.PI;
      if(a.state!=='patrol')wanted=Math.atan2(a.targetY-(e.y+8),a.targetX-(e.x+10));
      if(e.type==='drone'&&a.state==='patrol')wanted+=e.patrol>0?.4:-.4;
      if(a.state==='search')wanted+=Math.sin(this.time*3)*1.25;
      if(e.type==='turret'&&a.state==='patrol')wanted+=Math.sin(this.time*.6+e.home)*.45;
      e.look=turnToward(e.look,wanted,e.type==='shield'?2:3.2,dt);e.face=Math.cos(e.look)>=0?1:-1;
      let walking=0;
      if(a.state==='investigate')walking=Math.sign(a.targetX-(e.x+10))*85;
      else if(a.state==='patrol'){
        if(Math.abs(e.x-e.home)>65&&e.patrol===Math.sign(e.x-e.home)){e.patrol=e.x>e.home?-1:1;e.patrolWait=.65;}
        walking=e.patrolWait>0?0:e.patrol*27;
      }
      if(a.state==='investigate'&&(targetDist<22||e.type==='turret'))reached(a);
      if(a.state==='search')walking=0;
      if(e.type==='drone'){
        if(e.wind<=0){
          const tx=a.state==='patrol'?e.home+Math.sin(this.time*.65+e.home)*70:a.state==='search'?e.x:a.targetX-10+(fighting?Math.sin(this.time*1.25)*95:0);
          const ty=a.state==='patrol'?e.homeY+Math.sin(this.time*1.5)*20:a.state==='search'?e.y:a.targetY-110;
          const dx=Math.max(-70*dt,Math.min(70*dt,tx-e.x)),dy=Math.max(-55*dt,Math.min(55*dt,ty-e.y));
          if(!this.world.overlaps(e.x+dx,e.y,e.w,e.h))e.x+=dx;
          if(!this.world.overlaps(e.x,e.y+dy,e.w,e.h))e.y+=dy;
          if(a.state==='patrol'&&Math.abs(dx)>.01)e.patrol=Math.sign(dx);
        }
      }else{
        if(e.type==='runner'){
          if(e.wind>0){e.wind-=dt;e.vx=0;if(e.wind<=0){e.vx=e.face*350;e.vy=-125;e.cool=1.5;e.dash=.45;}}
          else if(e.dash>0){e.dash-=dt;e.vx=e.face*350;}
          else if(fighting&&targetDist<170&&Math.abs(a.targetY-e.y)<65&&e.cool<=0){e.wind=.45;e.vx=0;}
          else e.vx=fighting?e.face*65:walking;
        }else if(e.type==='turret')e.vx=0;
        else if(e.grounded){
          e.vx=fighting?(e.type==='gunner'&&e.evade>0?-e.face*105:targetDist>200?e.face*50:e.type==='shield'&&targetDist>65?e.face*35:0):walking;
        }
        if(e.grounded&&e.vx!==0){
          const dir=Math.sign(e.vx),edgeX=e.x+(dir>0?25:-5);
          if(!this.world.at(edgeX,e.y+e.h+8)||this.world.overlaps(e.x+dir*5,e.y,e.w,e.h)){
            e.vx=0;if(a.state==='patrol'&&e.patrolWait<=0){e.patrol*=-1;e.patrolWait=.7;}
            if(a.state==='investigate')reached(a);
          }
        }
        e.vy=Math.min(650,e.vy+1400*dt);this.world.move(e,dt);if(e.y>LEVEL_HEIGHT+50)this.kill(e);
      }
      // A committed shot may finish at its old target; fresh attacks require visual confirmation.
      if(e.type!=='runner'){
        if(e.wind>0){e.wind-=dt;if(e.wind<=0){this.enemyShot(e);e.cool=e.type==='grenadier'?2.4:e.type==='drone'?1.9:e.type==='turret'?1.3:1.7;}}
        else if((fighting||e.hacked>0)&&e.cool<=0){e.wind=e.type==='grenadier'?.75:e.type==='drone'?.85:.48;e.lockX=a.targetX;e.lockY=a.targetY;if(e.type==='grenadier')this.enemyReaction(e,'attack');}
      }
      if(e.hacked<=0&&overlap(p,e)){hear(a,p.x+10,p.y+16);if(this.character!=='dimillian'||!this.dimillianKit.blockContact(e))this.damage();}
      if(e.hacked<=0&&this.character==='peter')for(const pet of this.peterKit.pets)if(overlap(pet,e))this.peterKit.hurtPet(pet,e.type==='runner'&&e.dash>0?2:1,.6);
    }
    for(const b of this.barrels){if(b.dead)continue;if(b.fuse>0){b.fuse-=dt;if(b.fuse<=0){b.dead=true;this.explode(b.x+9,b.y+15);continue;}}
      if(this.pidalfKit.held.some(h=>h.body===b))continue;
      if(b.mobile){
        b.vy=Math.min(850,b.vy+1100*dt);const speed=Math.hypot(b.vx,b.vy),fall=b.vy;
        const steps=Math.max(1,Math.ceil(speed*dt/6));
        for(let i=0;i<steps;i++){const wall=this.world.move(b,dt/steps);
          if(speed>220&&(wall||b.grounded&&fall>220||this.enemies.some(e=>!e.dead&&overlap(b,e)))){b.fuse=b.fuse||.045;b.vx*=.15;break;}}
        if(b.grounded)b.vx*=Math.exp(-8*dt);else b.angle=(b.angle??0)+b.vx*dt*.006;
        if(b.y>LEVEL_HEIGHT+40)b.dead=true;continue;
      }
      if(!this.world.at(b.x+9,b.y+b.h+1)){b.y+=Math.min(240,Math.max(25,(b.y-BASE-390)*5))*dt;if(this.world.at(b.x+9,b.y+b.h))b.y=Math.floor((b.y+b.h)/TILE)*TILE-b.h;}if(b.y>LEVEL_HEIGHT+40)b.dead=true;}
    this.updateBullets(dt);this.updateGrenades(dt);this.updateBoss(dt);
    for(const r of this.rescues){if(!r.done&&Math.abs(p.x-r.x)<48&&Math.abs(p.y-r.y)<65){r.done=true;this.checkpoint=r.x+15;this.checkpointY=r.y+2;this.checkpointIndex++;this.totalRescues++;this.charges=Math.min(3,this.charges+1);this.health=3;this.usage=TOKEN_CAPACITY;this.tokenTrail=TOKEN_CAPACITY;this.peterKit.stock=6;this.audio.pickup();this.emit(r.x+12,r.y+15,25,[this.accent,'#eaffbe'],150,4);this.barks.request('rescue');this.notify('DEVELOPER RESCUED','Checkpoint saved · health + usage restored · reset banked');}}
    for(const r of this.relays)if(!r.done&&!r.supplied&&Math.hypot(p.x-r.x,p.y-r.y)<100){r.supplied=true;this.charges=Math.max(1,this.charges);this.notify('UPLINK IN RANGE',this.character==='dimillian'?'Press E to remotely override the uplink.':this.character==='peter'?'Press E to let the claws override it.':'Throw F so the reset lands beside the uplink.');}
    if(this.boss.dead&&p.x>3890){this.win();}
    this.hudTimer-=dt;if(this.hudTimer<=0){this.hud();this.hudTimer=.05;}
  }
  updateBullets(dt:number){
    for(const b of this.bullets){b.life-=dt;const steps=Math.ceil(Math.hypot(b.vx,b.vy)*dt/5);
      for(let s=0;s<steps&&b.life>0;s++){
        const from={x:b.x,y:b.y};b.x+=b.vx*dt/steps;b.y+=b.vy*dt/steps;
        if(this.character==='dimillian'&&this.dimillianKit.intercept(b,from))continue;
        if(this.defense.intercept(b,from))continue;
        if(this.character==='peter'&&this.peterKit.deflect(b))continue;
        if(this.character==='tibo'&&this.otherTibo.block(b))continue;
        if(b.hostile&&this.character==='peter'&&this.peterKit.absorb(b.x,b.y)){b.life=0;break;}
        const tile=this.world.at(b.x,b.y);
        if(tile&&!b.hit.has(tile)){
          b.hit.add(tile);const gone=this.world.damage(b.x,b.y,b.hostile?1:b.power);if(gone)this.emit(b.x,b.y,6,['#adba78','#64774d','#354d33'],120,4);
          else this.emit(b.x,b.y,2,[b.hostile?'#ffae6c':'#d8e9a4'],90,2,.2);
          if(tile.kind===3||tile.kind===4||!gone||b.pierce--<=0)b.life=0;
        }
        if(b.life<=0)break;
        if(b.hostile&&this.character==='dimillian'&&this.dimillianKit.paired){const e=this.dimillianKit.paired;if(b.x>e.x&&b.x<e.x+e.w&&b.y>e.y&&b.y<e.y+e.h){e.hp-=b.power;e.hurt=.12;b.life=0;if(e.hp<=0)this.kill(e,b.vx*.2,-120);continue;}}
        if(b.hostile){if(b.x>this.player.x&&b.x<this.player.x+20&&b.y>this.player.y&&b.y<this.player.y+32){this.damage();b.life=0;}}
        else{
          for(const e of this.enemies)if(!e.dead&&!b.hit.has(e)&&b.x>e.x-2&&b.x<e.x+22&&b.y>e.y-2&&b.y<e.y+30){b.hit.add(e);
            if(e.hacked>0){continue;}
            if(e.type==='shield'&&!e.sheep){
              const defense=shieldHit(b.tier??0,b.boost,e.shieldDown>0?0:e.shield,b.vx,b.vy,e.face),broken=e.shieldDown<=0&&e.shield>0&&defense.shield===0;if(e.shieldDown<=0)e.shield=defense.shield;
              if(defense.blocked){this.emit(b.x,b.y,8,['#74ccdf','#d3eff2'],180,3,.3);b.life=0;this.audio.tone(900,.04,'triangle',.035,550);
                if(broken){e.stun=.6;e.wind=0;e.voiceCool=0;this.voiceCooldown=0;this.enemyReaction(e,'hurt');this.debris.armor(e.x,e.y+10,e.face);}
                else this.enemyReaction(e,'block');continue;}
            }
            e.sheep=0;hear(e.awareness,e.x+10-Math.sign(b.vx)*90,e.y+15-Math.sign(b.vy)*40);e.hp-=b.power;e.hurt=.1;e.vx+=Math.sign(b.vx)*35;e.evade=.75;
            if((b.tier??0)>0||b.boost){e.stun=(b.tier??0)===2?.45:.18;e.wind=0;}
            if(e.hp>0)this.enemyReaction(e,'hurt');
            this.emit(b.x,b.y,7,['#fff5c1','#ffbd63','#488e82'],150,3,.3);
            this.rings.push({x:b.x,y:b.y,r:2,max:13,life:.1,color:'#fff1b1'});
            if(this.impactSound<=0){this.audio.impact();this.impactSound=.055;}
            if(e.hp<=0)this.kill(e,Math.sign(b.vx)*(b.boost||(b.tier??0)===2?350:190),Math.min(-130,b.vy*.2),b.boost);if(b.pierce--<=0)b.life=0;}
          const boss=this.boss;if(boss.active&&!boss.dead&&b.x>boss.x&&b.x<boss.x+boss.w&&b.y>boss.y&&b.y<boss.y+boss.h){if(boss.phase===2){boss.hp-=b.power;this.emit(b.x,b.y,3,['#fff1ae','#fa9b4d'],90,3,.25);}else this.emit(b.x,b.y,2,['#7bb8ae'],60,2,.2);b.life=0;}
        }
        for(const barrel of this.barrels)if(!barrel.dead&&!b.hit.has(barrel)&&b.x>barrel.x&&b.x<barrel.x+18&&b.y>barrel.y&&b.y<barrel.y+30){b.hit.add(barrel);barrel.hp-=b.power;if(barrel.hp<=0)barrel.fuse=barrel.fuse||.04;b.life=0;}
      }
    }
    for(const b of this.bullets)if(b.life<=0&&b.spell){const radius=b.spell;b.spell=undefined;this.dimillianKit.area(b.x,b.y,radius,1+radius/22,false,true,true);}
    this.bullets=this.bullets.filter(b=>b.life>0&&b.x>=0&&b.x<COLS*TILE&&b.y>-30&&b.y<LEVEL_HEIGHT+20);
  }
  bossAim(){
    const b=this.boss,points=[{x:this.player.x+10,y:this.player.y+16}],double=this.otherTibo.active;
    if(this.character==='tibo'&&double&&this.lineOfSight(b.x+8,b.y+33,double.x+12,double.y+18))points.push({x:double.x+12,y:double.y+18});
    const remote=this.character==='dimillian'?this.dimillianKit.paired:null;if(remote&&!remote.dead&&this.lineOfSight(b.x+8,b.y+33,remote.x+10,remote.y+15))points.push({x:remote.x+10,y:remote.y+15});
    if(this.character==='peter')for(const p of this.peterKit.pets)if(p.hp>0&&p.state!=='return'&&this.lineOfSight(b.x+8,b.y+33,p.x+7,p.y+5))points.push({x:p.x+7,y:p.y+5});
    return points.sort((a,c)=>Math.hypot(a.x-b.x-8,a.y-b.y-33)-Math.hypot(c.x-b.x-8,c.y-b.y-33))[0];
  }
  updateBoss(dt:number){
    const b=this.boss;if(b.dead)return;if(this.player.x>3280&&!b.active&&this.relays.every(r=>r.done)){b.active=true;this.barks.place('boss');this.checkpoint=3340;this.checkpointY=828;this.charges=Math.max(1,this.charges);this.notify('429 / RATE LIMITER','Dodge the volley. Hit the orange core when it overheats.');}
    if(!b.active)return;b.timer+=dt;
    if(b.hp<=0){b.dead=true;this.bullets=this.bullets.filter(x=>!x.hostile);this.explode(b.x+38,b.y+38,135);this.kills++;this.notify('RATE LIMIT REMOVED','Extraction is open. Head right →');return;}
    if(b.phase===0&&b.timer>1.2){b.phase=1;b.timer=0;}
    if(b.phase===1){
      const prior=Math.floor((b.timer-dt)/.2),current=Math.floor(b.timer/.2);
      if(current>prior){const target=this.bossAim(),a=Math.atan2(target.y-(b.y+33),target.x-(b.x+8));for(const spread of [-.2,0,.2])this.bullets.push({x:b.x+8,y:b.y+33,vx:Math.cos(a+spread)*250,vy:Math.sin(a+spread)*250,life:2.8,hostile:true,power:1,pierce:0,boost:false,hit:new Set()});this.audio.tone(70,.12,'sawtooth',.025,40);}
      if(b.timer>1.2){b.phase=2;b.timer=0;this.audio.tone(550,.4,'triangle',.05,150);this.emit(b.x+30,b.y,25,['#a9bb9a','#eac77b'],90,4,.7);}
    }else if(b.phase===2&&b.timer>3.5){b.phase=0;b.timer=0;}
    if(overlap(this.player,b))this.damage();
  }
  win(){
    this.state='won';this.barks.request('victory');this.keys.clear();this.pointer.down=false;this.pendingShot=0;this.audio.pickup();$('.touch').classList.remove('active');
    const seconds=Math.floor(this.elapsed),clock=`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
    this.panel('ALL SYSTEMS<br>OVERRIDDEN.',`<div class="ending-quip"><b>${this.character.toUpperCase()}</b> “${this.barks.active?.line??'Mission complete.'}”</div>Mission complete. The squad is back online.<br><br>${clock} ELAPSED &nbsp; / &nbsp; ${this.kills} BOTS SCRAPPED<br>${this.world.destroyed} BLOCKS BROKEN &nbsp; / &nbsp; ${this.totalRescues}/2 RESCUED<br>${this.resetCount} RESETS &nbsp; / &nbsp; ${this.deaths} RECONNECTS`,'RUN IT BACK',()=>this.start());
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
    this.drawStructures();this.encounters.draw();if(!this.preview){c.save();c.translate(0,BASE);refinerySigns(c,this.cam,this.time);c.restore();}this.drawAlarms();this.drawPerception();terrain(c,this.world,this.cam);this.debris.draw(c,this.cam);
    for(const b of this.barrels){if(b.dead||b.x-this.cam<-30||b.x-this.cam>W)continue;const x=b.x-this.cam,y=b.y;c.save();c.translate(x+9,y+15);c.rotate(b.angle??0);c.translate(-x-9,-y-15);
      rect(c,x+3,y,12,3,'#bc945c');rect(c,x,y+3,18,25,b.fuse>0?'#ffc564':'#9b573a');rect(c,x+2,y+5,3,21,'#ce8e52');rect(c,x,y+8,18,3,'#3a4431');rect(c,x,y+21,18,3,'#3a4431');rect(c,x+7,y+12,5,7,'#f4c884');rect(c,x+9,y+13,1,4,'#6e402c');rect(c,x+9,y+18,1,1,'#6e402c');c.restore();}
    for(const r of this.rescues){const x=r.x-this.cam,y=r.y;if(x<-60||x>W+40)continue;
      if(!r.done){rect(c,x-10,y-18,43,52,'#172b25');rect(c,x-10,y-18,43,3,'#b4c783');rect(c,x-8,y-13,39,7,'#435b3b');text(c,'LIMITED',x-5,y-7,'#d8e4ad',6);tibo(c,x+1,y+2,1,this.time,false,false,0,0,.85);for(let i=0;i<5;i++)rect(c,x-7+i*9,y-1,2,33,'#a7b39b');text(c,'RESCUE',x+12,y-27,this.accent,9,'center');rect(c,x+10,y-24+Math.sin(this.time*4)*3,4,4,this.accent);}
      else {rect(c,x+6,y-35,3,69,'#84936f');rect(c,x+9,y-35,29,18,this.accent);text(c,'✓',x+19,y-21,'#243621',12);text(c,'DEPLOYED',x+12,y-46,'#cadd9d',8,'center');}
    }
    for(const e of this.enemies)if(!e.dead&&e.x-this.cam>-40&&e.x-this.cam<W+40){if(this.character==='marcus'&&this.marcusKit.pacman.drawEnemy(e))continue;if(this.character==='pidalf'&&this.pidalfKit.drawEnemy(e))continue;if(e.sheep)sheep(c,e.x-this.cam,e.y,this.time,e.face);else robot(c,e.x-this.cam,e.y,e.type,e.face,this.time,e.wind,e.hurt,e.shieldDown>0?0:e.shield,e.hacked);}
    for(const e of this.enemies)if(!e.dead&&!e.sheep){
      const x=e.x+10-this.cam;
      if(e.type==='drone'&&e.wind>0&&e.hacked<=0){c.strokeStyle='#ffad6877';c.lineWidth=1;c.setLineDash([4,6]);c.beginPath();c.moveTo(x,e.y+15);c.lineTo(e.lockX-this.cam,e.lockY);c.stroke();c.setLineDash([]);rect(c,e.lockX-this.cam-4,e.lockY-4,8,1,'#ffb36b');}
      if(e.stun<=0&&e.hacked<=0){const a=e.awareness;if(a.state!=='patrol'){text(c,a.state==='combat'?'!':'?',x,e.y-10,a.state==='combat'?'#ff966b':'#e2ce8c',12,'center');rect(c,x-9,e.y-6,18,2,'#23382f');rect(c,x-9,e.y-6,18*a.suspicion,2,a.state==='combat'?'#ff966b':'#e2ce8c');}}
      if(e.stun>0)text(c,'* * *',x,e.y-9,'#83dae9',10,'center');
    }
    this.drawBoss();this.drawExit();this.drawRelays();
    for(const g of this.grenades){const x=g.x-this.cam;rect(c,x-4,g.y-4,8,8,Math.floor(g.life*12)%2?'#ffcb76':'#e9794e');c.strokeStyle='#ff9b5977';c.lineWidth=1;c.beginPath();c.arc(x,g.y,64*(1-g.life/1.7),0,Math.PI*2);c.stroke();}
    for(const b of this.bullets){const x=b.x-this.cam;c.strokeStyle=b.hostile?'#ff784e':b.boost?'#eeffba':b.color??THINKING[b.tier??0].color;c.lineWidth=b.hostile?3:b.boost?3:(b.tier??0)===2?5:(b.tier??0)===1?4:2;c.beginPath();c.moveTo(x-b.vx*((b.tier??0)===2?.04:.013),b.y-b.vy*((b.tier??0)===2?.04:.013));c.lineTo(x,b.y);c.stroke();rect(c,x-2,b.y-2,4,4,b.hostile?'#ffe3a1':'#f3ffce');if(b.fireball!==undefined){const r=5+b.fireball*9,a=Math.atan2(b.vy,b.vx);c.save();c.translate(x,b.y);c.rotate(a);for(let i=4;i>=0;i--){const rr=r*(1-i*.14);c.globalAlpha=1-i*.15;c.fillStyle=i%2?'#ffbd54':'#f16b35';c.beginPath();c.arc(-i*(5+b.fireball*3),Math.sin(this.time*35+i)*i,rr,0,Math.PI*2);c.fill();}c.globalAlpha=1;c.fillStyle='#ffe8a1';c.beginPath();c.arc(1,-1,r*.63,0,Math.PI*2);c.fill();rect(c,0,-3,5,5,'#fff8d9');if(b.fireball>=.99){c.strokeStyle='#efb5ff';c.lineWidth=1;c.beginPath();c.arc(0,0,r+3,0,Math.PI*2);c.stroke();}c.restore();}}
    if(this.state!=='dead'&&!(this.character==='dimillian'&&this.dimillianKit.shield?.kind===0)&&(this.invuln<=0||Math.floor(this.time*18)%2===0)){if(this.character==='marcus'){if(!this.marcusKit.lcd.drawHero())marcus(c,this.player.x-this.cam,this.player.y,this.face,this.time,Math.abs(this.player.vx)>15,this.aim,this.marcusKit.mode,this.marcusKit.launch,this.marcusKit.catchPose,this.marcusKit.flip,1,this.marcusKit.mode===1?this.marcusKit.lcd.charge:this.marcusKit.invader.charge);}else if(this.character==='pidalf')pidalf(c,this.player.x-this.cam,this.player.y,this.face,this.time,Math.abs(this.player.vx)>15,this.aim,this.pidalfKit.pose,this.pidalfKit.grabbing,this.pidalfKit.castPose,1,this.pidalfKit.scale,this.pidalfKit.wardPose);else if(this.character==='peter')peter(c,this.player.x-this.cam,this.player.y,this.face,this.time,Math.abs(this.player.vx)>15,this.peterKit.molt>0,this.peterKit.punch,this.aim,1,this.peterKit.kind);else if(this.character==='dimillian')dimillian(c,this.player.x-this.cam,this.player.y,this.face,this.time,Math.abs(this.player.vx)>15,this.dimillianKit.form,this.aim,this.dimillianKit.attack,this.dimillianKit.charge/1.15,this.dimillianKit.boosting,this.dimillianKit.special>0,1,this.dimillianKit.swing?Math.atan2(Math.sin(this.dimillianKit.swing.angle),Math.cos(this.dimillianKit.swing.angle)*this.face):undefined,this.dimillianKit.swing?.step===3?140:this.dimillianKit.swing?.step===2?33:29,this.dimillianKit.swing??undefined);else tibo(c,this.player.x-this.cam,this.player.y,this.face,this.time,Math.abs(this.player.vx)>15,false,this.muzzle,this.aim,1,thinkingWeapon(this.thinking).tier,this.dryFire);if(this.wallGrip)wallGripPose(c,this.player.x-this.cam,this.player.y,this.wallGrip,this.time,this.character==='peter'?(this.peterKit.molt>0?'#d5a27c':'#607e9d'):'#344147');}
    if(this.character==='marcus')this.marcusKit.draw();if(this.character==='pidalf')this.pidalfKit.draw();
    if(this.character==='peter')this.peterKit.draw();
    if(this.character==='tibo')this.otherTibo.draw();
    if(this.character==='dimillian')this.dimillianKit.draw();
    this.defense.draw();this.drawReset();
    if(this.zip){c.strokeStyle='#c4d48e';c.lineWidth=2;c.beginPath();c.moveTo(this.player.x+10-this.cam,this.player.y+12);c.lineTo(this.player.x-this.cam,this.player.y-10);c.stroke();}
    for(const p of this.particles){c.globalAlpha=Math.min(1,p.life*3);rect(c,p.x-this.cam,p.y,p.size,p.size,p.color);}c.globalAlpha=1;
    for(const r of this.rings){c.globalAlpha=Math.min(1,r.life*3);c.strokeStyle=r.color;c.lineWidth=r.life*12;c.beginPath();c.arc(r.x-this.cam,r.y,r.r,0,Math.PI*2);c.stroke();}c.globalAlpha=1;
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
    this.drawThinkingFeedback();this.drawUsageFeedback();this.barks.draw();
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
  drawReset(){
    const r=this.resetProp;if(!r)return;const c=this.c,x=r.x+r.w/2-this.cam,y=r.y+r.h;
    rect(c,x-22,y-8,44,8,'#283d39');rect(c,x-24,y-3,48,4,'#9caa78');
    rect(c,x-15,y-(r.struck?10:16),30,r.struck?3:9,'#8aac42');rect(c,x-12,y-(r.struck?12:19),24,4,'#e1ff89');text(c,'RESET',x,y-3,'#e6efbf',7,'center');
    if(!r.landed||r.slam<.04)return;
    // Silhouette arrives, pauses over the button, then accelerates downward.
    const slam=clamp((r.slam-.22)/.18,0,1),lift=r.slam>.46?(r.slam-.46)*250:0;
    const hy=y-130+slam*slam*120-lift;c.save();c.globalAlpha=Math.min(1,(.7-r.slam)*8);
    rect(c,x-21,hy-120,47,77,'#122326');rect(c,x-24,hy-56,53,13,'#516264');rect(c,x-21,hy-46,47,37,'#ba8864');
    rect(c,x-18,hy-43,41,29,'#dba47b');rect(c,x-28,hy-29,15,20,'#bb8664');rect(c,x-24,hy-27,11,13,'#e6b48a');
    for(let i=0;i<4;i++){rect(c,x-17+i*10,hy-15,9,14,'#a96f55');rect(c,x-17+i*10,hy-15,8,10,'#e3ad83');}
    rect(c,x-17,hy-41,33,4,'#efc399');
    if(slam>.3&&!r.struck)for(let i=0;i<4;i++)rect(c,x-38+i*25,hy-70,2,40,'#e5edb6');c.restore();
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
  snapshot(){return {marcus:this.marcusKit.snapshot(),encounters:this.encounters.snapshot(),pidalf:this.pidalfKit.snapshot(),dialogue:this.barks.snapshot(),dimillian:this.dimillianKit.snapshot(),refillFeedback:this.refillFeedback,refillFrom:this.refillFrom,burstSpend:this.burstSpend,burstShots:this.burstShots,burstLife:this.burstLife,dryFire:this.dryFire,dryFeedback:this.dryFeedback,spendFlash:this.spendFlash,lastSpend:this.lastSpend,character:this.character,defense:{cooldown:this.defense.cooldown,active:this.defense.active?{...this.defense.active}:null,blocks:this.defense.blocks,recovered:this.defense.recovered,pendingCooldown:this.defense.pendingCooldown},modeFeedback:this.modeFeedback,modeBurst:this.modeBurst,peter:{stock:this.peterKit.stock,throwCooldown:this.peterKit.throwCooldown,commandPoint:this.peterKit.commandPoint,orderTime:this.peterKit.orderTime,pets:this.peterKit.pets.map(p=>({x:p.x,y:p.y,id:p.id,type:p.type,hp:p.hp,state:p.state,charge:p.charge,dash:p.dash,fuse:p.fuse})),molt:this.peterKit.molt,moltCooldown:this.peterKit.moltCooldown,kind:this.peterKit.name},alarms:this.alarms.map(a=>({...a})),state:this.state,thinking:thinkingWeapon(this.thinking).name,thinkingPercent:this.thinking*50,weapon:thinkingWeapon(this.thinking),resetAnimation:this.resetProp?{x:this.resetProp.x,y:this.resetProp.y,landed:this.resetProp.landed,time:this.resetProp.age,slam:this.resetProp.slam,struck:this.resetProp.struck}:null,otherTibo:{cooldown:this.otherTibo.cooldown,tokenFlights:this.otherTibo.flights.length,recovered:this.otherTibo.rewardTotal,catchFeedback:this.otherTibo.catchFeedback,active:this.otherTibo.active?{x:this.otherTibo.active.x,y:this.otherTibo.active.y,phase:this.otherTibo.active.phase,life:this.otherTibo.active.life,blocks:this.otherTibo.active.blocks}:null},fireCooldown:this.fireTimer,aimAngle:this.aimAngle,face:this.face,quiet:this.keys.has('ShiftLeft')||this.keys.has('ShiftRight'),pointerActive:this.pointer.active,firing:this.pointer.down,lastBark:this.lastBark,enemyStates:this.enemies.filter(e=>!e.dead).map(e=>({type:e.type,x:e.x,y:e.y,face:e.face,look:e.look,awareness:{...e.awareness},hp:e.hp,shield:e.shield,shieldDown:e.shieldDown,stun:e.stun,wind:e.wind,hacked:e.hacked})),wallGrip:this.wallGrip,wallGrace:this.wallGrace,player:{x:Math.round(this.player.x),y:Math.round(this.player.y),grounded:this.player.grounded},health:this.health,usage:Math.round(this.usage),tokenCapacity:TOKEN_CAPACITY,tokenCost:shotCost(thinkingWeapon(this.thinking).cost),resetRecovery:this.resetRecovery,charges:this.charges,kills:this.kills,blocksDestroyed:this.world.destroyed,rescues:this.totalRescues,deaths:this.deaths,checkpoint:this.checkpoint,cam:this.cam,camY:this.camY,zip:this.zip,climb:this.climb,relays:this.relays.map(r=>({x:r.x,y:r.y,done:r.done})),boss:{hp:this.boss.hp,phase:this.boss.phase,active:this.boss.active,dead:this.boss.dead},shots:this.shotCount,resets:this.resetCount,scrap:this.debris.pieces.length,oil:this.debris.oil.length,particles:this.particles.length,bullets:this.bullets.length,elapsed:this.elapsed};}
}
