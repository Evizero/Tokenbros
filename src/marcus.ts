import { Pacman } from './marcus-pacman';
import { LCDLaunch } from './marcus-lcd';
import { Invader } from './marcus-invader';
import type { Game } from './game';
import { clamp,LEVEL_HEIGHT } from './world';
import { text } from './art';
import { marcus,marcusPortrait,cartridgeArt,MARCUS_COLOR,AUGMENT_NAMES,AUGMENT_COLORS } from './marcus-art';
type Enemy=Game['enemies'][number];
type Disc={x:number;y:number;vx:number;vy:number;mode:number;r:number;power:number;age:number;life:number;back:boolean;hit:Set<unknown>;group:number;echo:boolean;bounces:number;trail:{x:number;y:number}[]};
export class MarcusKit {
 discs:Disc[]=[];serial=0;launch=0;pending:{mode:number;angle:number;scale:number}|null=null;catchPose=0;catchFlash=0;catches=0;combo=0;comboLife=0;
 flip=0;flipCooldown=0;flipDir=1;batch=0;batchCooldown=0;empty=0;
 ghosts:{x:number;y:number;life:number;face:number}[]=[];hitCount=0;returnHits=0;bounceCount=0;
 lcd=new LCDLaunch(this);wasFiring=false;
 invader=new Invader(this);pacman=new Pacman(this);
 constructor(public g:Game){}
 fireInput(dt:number,firing:boolean){const rising=firing&&!this.wasFiring;this.wasFiring=firing;if(this.mode===3&&!this.lcd.flight){this.invader.cancel();this.invader.wasFiring=firing;if(rising)this.pacman.click();return;}if(this.mode===1||this.lcd.flight){this.invader.cancel();this.invader.wasFiring=firing;this.lcd.input(dt,firing,rising);return;}this.invader.input(dt,firing);}
 modeAt(value:number){return Math.min(3,Math.floor(value*4/3));}
 get mode(){return this.modeAt(this.g.thinking);}
 get name(){return AUGMENT_NAMES[this.mode];}
 get stock(){return Math.max(0,3-new Set(this.discs.filter(d=>!d.echo&&d.life>0).map(d=>d.group)).size-(this.pending?1:0)-(this.invader.occupied?1:0)-(this.pacman.active?1:0));}
 clear(){this.pacman.clear();this.lcd.clear();this.wasFiring=false;this.invader.clear();this.discs=[];this.pending=null;this.launch=0;this.flip=0;this.batch=0;this.ghosts=[];this.catchPose=0;this.catchFlash=0;this.combo=0;this.comboLife=0;}
 fire(){
  const g=this.g;if(this.mode!==0||this.lcd.flight)return;if(this.pending||this.flip>0)return;
  if(!this.stock){g.fireTimer=.15;if(this.empty<=0){g.audio.tone(140,.055,'square',.018,70);this.empty=.6;}return;}
  g.updateAim();this.pending={mode:this.mode,angle:g.aimAngle,scale:g.thinking/2};this.launch=.001;g.fireTimer=[.32,.46,.74][this.mode];g.lastCooldown=g.fireTimer;
  g.audio.tone(180,.1,'triangle',.025,550);
 }
 releaseShot(p:NonNullable<MarcusKit['pending']>){
  const g=this.g,group=++this.serial,spread=p.mode===1?[-.16,.16]:[0],speed=[650,590,430][p.mode]+p.scale*25;
  const spawn=(offset:number,echo:boolean)=>{const a=p.angle+offset;this.discs.push({x:g.player.x+10,y:g.player.y+16,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,mode:p.mode,r:p.mode===2?11+p.scale*2:5+p.scale,power:([4,2.8,8][p.mode])*(echo?.5:1),age:0,life:3.1,back:false,hit:new Set(),group,echo,bounces:0,trail:[]});};
  for(const a of spread)spawn(a,false);if(this.batch>0)for(const a of [-.33,-.23,.23,.33])spawn(a,true);
  g.shotCount++;g.makeNoise(g.player.x+10,g.player.y+16,430);g.audio.tone(p.mode===2?100:440,.12,'triangle',.045,p.mode===2?45:170);g.audio.noise(.045,.025,1700);
  g.emit(g.player.x+10+Math.cos(p.angle)*20,g.player.y+16+Math.sin(p.angle)*20,6,[AUGMENT_COLORS[p.mode],'#fff3ce'],80,2,.18);
 }
 returnDisc(d:Disc){if(d.back)return;d.back=true;d.hit.clear();d.age=0;}
 recall(){const recalled=this.invader.recall(),chomp=this.pacman.recall();if(!recalled&&!chomp&&!this.discs.some(d=>!d.back))return;for(const d of this.discs)this.returnDisc(d);this.g.audio.tone(720,.16,'sine',.04,280);this.g.barks.request('recall');}
 dodge(){
  const g=this.g;if(this.lcd.flight||this.flipCooldown>0||this.flip>0)return;this.lcd.cancel();this.flip=.3;this.flipCooldown=1.45;
  this.flipDir=g.keys.has('KeyA')||g.keys.has('ArrowLeft')?-1:g.keys.has('KeyD')||g.keys.has('ArrowRight')?1:g.face;
  this.invader.cancel();this.pending=null;this.launch=0;g.climb=null;g.zip=false;g.audio.noise(.12,.025,2200);g.emit(g.player.x+10,g.player.y+28,9,[MARCUS_COLOR,'#b9cace'],120,2,.3);
 }
 ultimate(){if(this.batchCooldown>0)return;this.batch=4.5;this.batchCooldown=16;const g=this.g;g.barks.request('batch');g.rings.push({x:g.player.x+10,y:g.player.y+16,r:6,max:68,life:.4,color:MARCUS_COLOR});g.audio.tone(280,.16,'square',.035,900);}
 solid(x:number,y:number,r:number){const w=this.g.world;return !!(w.at(x,y)||w.at(x-r,y)||w.at(x+r,y)||w.at(x,y-r)||w.at(x,y+r));}
 catchDisc(d:Disc){
  d.life=0;if(d.echo)return;const g=this.g;this.catches++;this.catchPose=1;this.catchFlash=.6;
  g.emit(g.player.x+10,g.player.y+15,6,[MARCUS_COLOR,'#fff4d3'],80,2,.25);g.rings.push({x:g.player.x+10,y:g.player.y+15,r:4,max:23,life:.17,color:MARCUS_COLOR});g.audio.tone(640+Math.min(6,this.combo)*75,.08,'triangle',.026,1100);g.barks.request('catch');
 }
 hitEnemy(d:Disc,e:Enemy){
  d.hit.add(e);const g=this.g,frontal=e.type==='shield'&&e.shield>0&&e.shieldDown<=0&&Math.sign(d.vx)===-e.face&&Math.abs(d.vy)<Math.abs(d.vx)*.85;
  if(frontal&&d.mode<2){e.shield=Math.max(0,e.shield-1);d.vx*=-1;d.bounces++;g.emit(d.x,d.y,7,['#fff4c9','#8bcbd4'],140,2,.25);g.audio.tone(950,.06,'square',.02,300);return;}
  if(frontal){e.shield=0;g.debris.armor(e.x,e.y,Math.sign(d.vx)||1);}
  const knock=d.mode===2?520:170;e.hp-=d.power;e.hurt=.15;e.stun=d.mode===2?.38:.12;e.flung=d.mode===2?.5:.14;
  e.vx=Math.sign(d.vx)*knock;e.vy=d.mode===2?-240:-85;this.hitCount++;if(d.back)this.returnHits++;this.combo++;this.comboLife=1.9;
  g.emit(d.x,d.y,d.mode===2?16:7,[AUGMENT_COLORS[d.mode],'#fff0bc'],200,3,.3);g.shake=Math.max(g.shake,d.mode===2?5:2);if(g.effects)g.freeze=Math.max(g.freeze,d.mode===2?.035:.018);
  if(e.hp<=0)g.kill(e,e.vx,e.vy,d.mode===2);else g.audio.scrap(false);
 }
 update(dt:number){
  this.lcd.update(dt);this.invader.update(dt);this.pacman.update(dt);const g=this.g;this.flipCooldown=Math.max(0,this.flipCooldown-dt);this.batchCooldown=Math.max(0,this.batchCooldown-dt);this.batch=Math.max(0,this.batch-dt);this.catchPose=Math.max(0,this.catchPose-dt*5);this.catchFlash=Math.max(0,this.catchFlash-dt);this.empty=Math.max(0,this.empty-dt);this.comboLife=Math.max(0,this.comboLife-dt);if(!this.comboLife)this.combo=0;
  if(this.flip>0){this.flip=Math.max(0,this.flip-dt);g.player.vx=this.flipDir*490;g.wallLock=Math.max(g.wallLock,dt*2);if(this.ghosts.length===0||this.ghosts.at(-1)!.life<.18)this.ghosts.push({x:g.player.x,y:g.player.y,life:.21,face:g.face});}
  for(const p of this.ghosts)p.life-=dt;this.ghosts=this.ghosts.filter(p=>p.life>0);
  if(this.launch>0){this.launch+=dt;if(this.pending&&this.launch>=.1){const p=this.pending;this.pending=null;this.releaseShot(p);}if(this.launch>.34)this.launch=0;}
  for(const d of this.discs){
   d.age+=dt;d.life-=dt;if(!d.back&&d.age>(d.mode===2?.85:.72))this.returnDisc(d);
   if(d.back){const dx=g.player.x+10-d.x,dy=g.player.y+16-d.y,len=Math.hypot(dx,dy);if(len<18&&g.lineOfSight(d.x,d.y,g.player.x+10,g.player.y+16)){this.catchDisc(d);continue;}
    const speed=d.mode===2?650:840,k=Math.min(1,dt*12);d.vx+=(dx/Math.max(1,len)*speed-d.vx)*k;d.vy+=(dy/Math.max(1,len)*speed-d.vy)*k;
   }
   d.trail.push({x:d.x,y:d.y});if(d.trail.length>10)d.trail.shift();
   const steps=Math.max(1,Math.ceil(Math.hypot(d.vx,d.vy)*dt/3));
   for(let i=0;i<steps&&d.life>0;i++){
    const nx=d.x+d.vx*dt/steps,ny=d.y+d.vy*dt/steps;
    if(this.solid(nx,ny,d.r)){
     let broken=false;
     for(const [x,y] of [[nx,ny],[nx-d.r,ny],[nx+d.r,ny],[nx,ny-d.r],[nx,ny+d.r]])if(g.world.damage(x,y,d.mode===2?8:1))broken=true;
     if(broken)g.emit(nx,ny,10,['#a4b0b1',AUGMENT_COLORS[d.mode]],180,4,.4);
     if(this.solid(nx,ny,d.r)){
      if(this.solid(nx,d.y,d.r))d.vx*=-1;else d.vy*=-1;d.bounces++;this.bounceCount++;
      g.emit(d.x,d.y,4,[AUGMENT_COLORS[d.mode],'#fff5d6'],120,2,.2);if(d.bounces<5)g.audio.tone(700+d.bounces*90,.05,'triangle',.018,300);
      if(d.bounces>8){d.life=0;g.emit(d.x,d.y,8,[MARCUS_COLOR],80,2,.3);}break;
     }
    }
    d.x=nx;d.y=ny;
    for(const e of g.enemies)if(!e.dead&&!d.hit.has(e)&&Math.hypot(clamp(d.x,e.x,e.x+e.w)-d.x,clamp(d.y,e.y,e.y+e.h)-d.y)<d.r+2&&g.lineOfSight(d.x,d.y,e.x+e.w/2,e.y+e.h/2))this.hitEnemy(d,e);
    for(const b of g.barrels)if(!b.dead&&!d.hit.has(b)&&Math.hypot(d.x-b.x-9,d.y-b.y-15)<d.r+15&&g.lineOfSight(d.x,d.y,b.x+9,b.y+15)){d.hit.add(b);b.hp-=d.power;if(b.hp<=0)b.fuse=.06;}
    const b=g.boss;if(b.active&&!b.dead&&b.phase===2&&!d.hit.has(b)&&d.x+d.r>b.x&&d.x-d.r<b.x+b.w&&d.y+d.r>b.y&&d.y-d.r<b.y+b.h){d.hit.add(b);b.hp-=d.power;g.emit(d.x,d.y,12,[MARCUS_COLOR,'#fff4c9'],180,3,.3);}
    if(d.x<0||d.x>4080||d.y>LEVEL_HEIGHT+30||d.y<0)d.life=0;
   }
  }
  this.discs=this.discs.filter(d=>d.life>0);
 }
 draw(){const g=this.g,c=g.c;this.invader.draw();this.lcd.draw();this.pacman.draw();
  for(const p of this.ghosts){c.save();c.globalAlpha=p.life/.21*.3;marcus(c,p.x-g.cam,p.y,p.face,g.time,false,g.aim,this.mode,0,0,this.flip);c.restore();}
  for(const d of this.discs){c.save();for(let i=0;i<d.trail.length;i++){c.globalAlpha=(i/d.trail.length)*.24;cartridgeArt(c,d.trail[i].x-g.cam,d.trail[i].y,d.mode,g.time*24,d.r*(.4+i/d.trail.length*.6),d.echo);}c.globalAlpha=1;cartridgeArt(c,d.x-g.cam,d.y,d.mode,g.time*(d.back?-30:30),d.r,d.echo);if(d.back){c.strokeStyle='#f7f0d8';c.lineWidth=1;c.beginPath();c.arc(d.x-g.cam,d.y,d.r+4,g.time*12,g.time*12+Math.PI*.8);c.stroke();}c.restore();}
  if(this.combo>1&&this.comboLife>0)text(c,`${this.combo} HIT${this.combo===1?'':'S'}`,g.player.x+10-g.cam,g.player.y-30,MARCUS_COLOR,11,'center');
  if(this.catchFlash>0){c.save();c.globalAlpha=Math.min(1,this.catchFlash*4);text(c,'CATCH!',g.player.x+10-g.cam,g.player.y-14,'#fff2cc',10,'center');c.restore();}
  if(this.empty>0&&this.stock===0)text(c,'E · RECALL',g.player.x+10-g.cam,g.player.y-14,MARCUS_COLOR,9,'center');
  if(this.batch>0){for(let i=0;i<3;i++)cartridgeArt(c,g.player.x+10-g.cam+Math.cos(g.time*3+i*2.1)*24,g.player.y+17+Math.sin(g.time*3+i*2.1)*21, i,g.time*10,3,true);}
 }
 hud(){
  const g=this.g,$=(s:string)=>document.querySelector<HTMLElement>(s)!;
  $('.name').textContent='MARCUS';$('.role').textContent='THE AUGMENTOR';$('#resource-name').textContent='STOCK';$('#usage').textContent=`${this.stock} / 3`;
  for(const s of ['.meter-fill','.meter-trail'])$(s).style.width=`${this.stock/3*100}%`;$('.resources').classList.remove('tokens-low','tokens-empty');$('.resources').style.setProperty('--shot-color',AUGMENT_COLORS[this.mode]);
  if(this.mode===1){const ready=!this.lcd.airUsed&&this.lcd.cooldown<=0,pct=this.lcd.charging?this.lcd.charge*100:ready?100:this.lcd.airUsed?0:(1-this.lcd.cooldown/.65)*100;$('#resource-name').textContent='SLING';$('#usage').textContent=this.lcd.charging?`${Math.round(pct)}%`:this.lcd.flight?'FLYING':this.lcd.airUsed?'LAND':ready?'READY':'RECOVER';for(const name of ['.meter-fill','.meter-trail'])$(name).style.width=`${pct}%`;}
  $('#token-cost').textContent=this.mode===3?(this.pacman.active?.phase==='bite'?'CLICK ANOTHER BOT · CHAIN ×4':this.pacman.active?'CHOMP INCOMING':this.pacman.cooldown>0?'DIGESTING…':'CLICK TO LAUNCH · CLICK TO CHAIN'):this.mode===1?(this.lcd.airUsed?'LAND TO RELOAD':this.lcd.charging?'RELEASE TO LAUNCH YOURSELF':this.lcd.cooldown>0?'RECOVERING':'HOLD · AIM · RELEASE YOURSELF'):this.mode===2?(this.invader.charging?'RELEASE TO LAUNCH':this.invader.craft?'BOMBER OUT · E RECALL':'HOLD TO GROW · RELEASE TO BOMB'):this.stock?'LAUNCH · REPOSITION · RECALL':'CARTS OUT · E RECALL';$('#token-spend').textContent='';$('#thinking-label').textContent='AUGMENT';$('#thinking-level').textContent=this.name;
  const slider=$('#thinking-slider');slider.setAttribute('aria-label','Augmentation');slider.setAttribute('aria-valuetext',`${this.name}, ${Math.round(g.thinking/3*100)} percent`);
  $('#reset-status').textContent=this.batch>0?`BATCH ${this.batch.toFixed(1)}s`:this.batchCooldown>0?`BATCH ${Math.ceil(this.batchCooldown)}s`:'BATCH';$('.reset-label').classList.toggle('spent',this.batchCooldown>0&&!this.batch);
  $('#secondary-ready').textContent=g.relays.some(r=>!r.done&&Math.hypot(r.x-g.player.x,r.y-g.player.y)<130)?'E OVERRIDE':'E RECALL';$('#defense-ready').textContent=this.flipCooldown>0?`Q ${this.flipCooldown.toFixed(1)}s`:'Q FLIP';$('#defense-ready').classList.toggle('spent',this.flipCooldown>0);
  $('#control-fire').textContent=this.mode===3?'CLICK / CHAIN BITES':this.mode===1?'HOLD / SELF-LAUNCH':this.mode===2?'HOLD / RELEASE INVADER':'LAUNCH CART';$('#control-scroll').textContent='AUGMENT';$('#control-e').textContent='RECALL';$('#control-q').textContent='FLIP DODGE';$('#control-f').textContent='BATCH AUGMENT';
  marcusPortrait((document.querySelector('.portrait') as HTMLCanvasElement).getContext('2d')!,this.mode);
  g.canvas.setAttribute('aria-label','Marcus: WASD move and climb, Space jump, mouse aim, click launches cartridges; in LCD hold and release to launch yourself; in Zoom hold to grow an invader and release to launch a bombing run, in Pac-Man click to launch and click another enemy during each bite to chain up to four; scroll or 1 2 3 4 Rotate LCD Zoom Pac-Man, E recall or override nearby uplink, Q flip dodge, F batch augment, Escape pause.');
 }
 snapshot(){return {pacman:this.pacman.snapshot(),lcd:this.lcd.snapshot(),invader:this.invader.snapshot(),mode:this.name,stock:this.stock,pending:!!this.pending,discs:this.discs.map(d=>({x:d.x,y:d.y,vx:d.vx,vy:d.vy,mode:d.mode,back:d.back,echo:d.echo,group:d.group,bounces:d.bounces})),catches:this.catches,hits:this.hitCount,returnHits:this.returnHits,bounces:this.bounceCount,combo:this.combo,flip:this.flip,flipCooldown:this.flipCooldown,batch:this.batch,batchCooldown:this.batchCooldown};}
}
