import type { MarcusKit } from './marcus';
import type { PlayerRuntime as Game } from './player-runtime';
import { text,robot } from './art';
import { pacmanArt } from './marcus-art';
type Enemy=Game['enemies'][number];
type Chomper={x:number;y:number;angle:number;phase:'fly'|'bite';age:number;life:number;chain:number;target:Enemy|null;hit:Set<Enemy>;queued:Enemy|null;perfect:boolean;queuedPerfect:boolean;damaged:boolean;batch:boolean;tx:number;ty:number;trail:{x:number;y:number}[]};
const WINDOW=.85;
export class Pacman {
 active:Chomper|null=null;cooldown=0;notice=0;launched=0;bites=0;finishers=0;
 eyes:{x:number;y:number;vx:number;life:number}[]=[];
 constructor(public owner:MarcusKit){}
 get g(){return this.owner.g;}
 clear(){this.active=null;this.cooldown=0;this.eyes=[];this.notice=0;}
 target(x:number,y:number,hit=new Set<Enemy>()){
  const a=this.g.aimPoint();return this.g.enemies.filter(e=>!e.dead&&!this.g.claimedByOther(e)&&e.hacked<=0&&!e.sheep&&!hit.has(e)&&Math.hypot(e.x+10-x,e.y+15-y)<480&&Math.hypot(e.x+10-a.x,e.y+15-a.y)<170&&this.g.lineOfSight(x,y,e.x+10,e.y+15))
   .sort((a1,b)=>Math.hypot(a1.x+10-a.x,a1.y+15-a.y)-Math.hypot(b.x+10-a.x,b.y+15-a.y))[0]??null;
 }
 click(){
  const g=this.g,p=this.active;
  if(p){if(p.phase!=='bite'||p.chain>=4||p.queued)return;const t=this.target(p.x,p.y,p.hit);if(!t){this.notice=.45;return;}p.queued=t;this.owner.catchPose=.6;p.queuedPerfect=p.age>=.08&&p.age<=.45;g.audio.tone(640+p.chain*90,.065,'square',.024,950);return;}
  if(this.cooldown>0||this.owner.stock<=0||this.owner.flip>0||g.fireTimer>0)return;
  g.updateAim();const x=g.player.x+10,y=g.player.y+15,a=g.aimPoint(),target=this.target(x,y);
  this.active={x,y,angle:g.aimAngle,phase:'fly',age:0,life:1.5,chain:0,target,hit:new Set(),queued:null,perfect:false,queuedPerfect:false,damaged:false,batch:this.owner.batch>0,tx:a.x,ty:a.y,trail:[]};this.launched++;this.owner.launch=.101;g.fireTimer=.22;g.lastCooldown=.22;g.shotCount++;
  g.audio.tone(480,.13,'square',.03,180);g.makeNoise(x,y,450);g.emit(x,y,8,['#ffe16a','#fff9cb'],95,2,.25);
 }
 end(){if(!this.active)return;const p=this.active;this.g.emit(p.x,p.y,12,['#ffe16a','#fff8bf'],120,3,.35);this.active=null;this.cooldown=1;}
 recall(){if(!this.active)return false;this.end();return true;}
 controls(e:Enemy){const p=this.active;return !!p&&p.phase==='bite'&&p.target===e&&!p.damaged;}
 bite(e:Enemy){const p=this.active!;p.phase='bite';p.age=0;p.chain++;p.hit.add(e);p.target=e;p.queued=null;p.damaged=false;p.x=e.x+10;p.y=e.y+15;e.wind=0;e.vx=0;e.vy=0;e.stun=Math.max(e.stun,.25);p.trail=[];this.g.audio.tone(300+p.chain*60,.07,'square',.025,160);}
 damage(){const p=this.active!,g=this.g,e=p.target;p.damaged=true;if(!e||e.dead)return;
  const final=p.chain===4,dx=Math.cos(p.angle),dy=Math.sin(p.angle),power=(final?13:5+(p.chain-1)*2)+(p.perfect?1:0)+(p.batch?2:0);
  if(e.type==='shield'&&e.shield>0){e.shield=Math.max(0,e.shield-(final?6:3));g.debris.armor(e.x,e.y,dx>=0?1:-1);}
  e.hp-=power;e.hurt=.2;e.stun=.35;e.flung=.5;e.vx=dx*(final?650:240+p.chain*70);e.vy=dy*220-(final?280:120);this.bites++;this.owner.combo++;this.owner.comboLife=1.9;
  if(e.hp<=0){g.kill(e,e.vx,e.vy,true);this.eyes.push({x:p.x,y:p.y,vx:dx*85,life:.9});}else g.audio.scrap(true);
  g.emit(p.x,p.y,final?38:14,['#ffe16a','#fff9d7','#aab8bd'],final?330:200,final?5:3,.45);g.rings.push({x:p.x,y:p.y,r:3,max:final?75:25+p.chain*7,life:.24,color:'#ffe16a'});g.audio.tone(160+p.chain*50,.1,'square',.04,55);g.audio.noise(final?.18:.08,final?.065:.035,700);g.shake=Math.max(g.shake,final?9:3+p.chain);if(g.effects)g.freeze=Math.max(g.freeze,final?.075:.025);g.makeNoise(p.x,p.y,final?850:480);
  if(final){this.finishers++;for(const other of g.enemies)if(!other.dead&&!p.hit.has(other)&&Math.hypot(other.x+10-p.x,other.y+15-p.y)<65&&g.lineOfSight(p.x,p.y,other.x+10,other.y+15)){other.hp-=4;other.flung=.5;other.vx=Math.sign(other.x+10-p.x)*550;other.vy=-260;other.stun=.35;if(other.hp<=0)g.kill(other,other.vx,other.vy,true);}}
 }
 update(dt:number){
  this.cooldown=Math.max(0,this.cooldown-dt);this.notice=Math.max(0,this.notice-dt);for(const e of this.eyes){e.life-=dt;e.x+=e.vx*dt;e.y-=65*dt;}this.eyes=this.eyes.filter(e=>e.life>0);
  const p=this.active;if(!p)return;const g=this.g;p.age+=dt;
  if(p.phase==='bite'){
   if(!p.damaged&&p.age>=.17)this.damage();
   if(p.chain>=4){if(p.age>.4)this.end();return;}
   if(p.queued&&p.age>=.3){const e=p.queued;if(!e.dead&&g.lineOfSight(p.x,p.y,e.x+10,e.y+15)){p.target=e;p.tx=e.x+10;p.ty=e.y+15;p.phase='fly';p.age=0;p.life=1.4;p.perfect=p.queuedPerfect;p.queuedPerfect=false;p.queued=null;}else{p.queued=null;this.notice=.4;}}
   if(p.phase==='bite'&&p.age>=WINDOW)this.end();return;
  }
  p.life-=dt;if(p.life<=0){this.end();return;}
  if(p.target?.dead)p.target=null;
  if(p.target){p.tx=p.target.x+10;p.ty=p.target.y+15;}
  const dx=p.tx-p.x,dy=p.ty-p.y,dist=Math.hypot(dx,dy);if(dist>1)p.angle=Math.atan2(dy,dx);
  const travel=Math.min(dist,dt*(570+p.chain*135)),steps=Math.max(1,Math.ceil(travel/3));
  for(let i=0;i<steps;i++){
   const nx=p.x+Math.cos(p.angle)*travel/steps,ny=p.y+Math.sin(p.angle)*travel/steps;
   if(g.world.at(nx,ny)){g.audio.tone(100,.1,'square',.03,60);this.end();return;}p.x=nx;p.y=ny;
   const e=p.target;if(e&&!e.dead&&Math.hypot(e.x+10-p.x,e.y+15-p.y)<14&&g.lineOfSight(p.x,p.y,e.x+10,e.y+15)){this.bite(e);return;}
  }
  if(dist<4&&!p.target){this.end();return;}
  p.trail.push({x:p.x,y:p.y});if(p.trail.length>9)p.trail.shift();
 }
 drawEnemy(e:Enemy){if(!this.controls(e))return false;const g=this.g,p=this.active!,q=Math.min(1,p.age/.17);g.c.save();g.c.translate(e.x+10-g.cam,e.y+15);g.c.scale(1+Math.sin(q*Math.PI)*.3,Math.max(.2,1-q*.8));robot(g.c,-10,-15,e.type,e.face,g.time,0,.2,e.shield,e.hacked);g.c.restore();return true;}
 draw(){const g=this.g,c=g.c,p=this.active;
  for(const e of this.eyes){c.save();c.globalAlpha=Math.min(1,e.life*3);for(const offset of [-4,4]){c.fillStyle='#fffbea';c.beginPath();c.ellipse(e.x-g.cam+offset,e.y,3.5,5,0,0,Math.PI*2);c.fill();c.fillStyle='#629ded';c.fillRect(e.x-g.cam+offset+Math.sign(e.vx),e.y-1,2,3);}c.restore();}
  if(!p)return;const radius=12+p.chain*4;
  for(let i=0;i<p.trail.length;i++){c.save();c.globalAlpha=i/p.trail.length*.18;pacmanArt(c,p.trail[i].x-g.cam,p.trail[i].y,radius,p.angle,.32);c.restore();}
  const next=p.phase==='bite'&&p.chain<4&&this.owner.mode===3?(p.queued??this.target(p.x,p.y,p.hit)):null;
  if(next){const dx=next.x+10-p.x,dy=next.y+15-p.y,len=Math.hypot(dx,dy);c.fillStyle=p.queued?'#fffbe0':'#ffe16a';for(let d=radius+10;d<len-12;d+=14){c.beginPath();c.arc(p.x-g.cam+dx*d/len,p.y+dy*d/len,p.queued?2.5:1.7,0,Math.PI*2);c.fill();}c.strokeStyle='#ffe16a';c.lineWidth=1.5;c.strokeRect(next.x-g.cam-4,next.y-4,next.w+8,next.h+8);}
  const mouth=p.phase==='fly'?.2+Math.abs(Math.sin(g.time*19))*.55:p.age<.17?.9*(1-p.age/.17):.08+Math.abs(Math.sin(p.age*15))*.13;
  const squash=p.phase==='bite'?1+Math.sin(Math.min(1,p.age/.3)*Math.PI)*.3:1;
  c.save();c.translate(p.x-g.cam,p.y);c.scale(squash,1/squash);pacmanArt(c,0,0,radius,p.angle,mouth);c.restore();
  if(p.phase==='bite'){const final=p.chain===4;text(c,final?'CRUNCH!':p.queued?'NEXT!':this.notice>0?'AIM AT A BOT':'CLICK NEXT',p.x-g.cam,p.y-radius-13,'#fff2ac',final?16:10,'center');
   if(!final){for(let i=0;i<4;i++){c.fillStyle=i<p.chain?'#ffe16a':'#59616a';c.beginPath();c.arc(p.x-g.cam-15+i*10,p.y+radius+12,3,0,Math.PI*2);c.fill();}c.strokeStyle='#fff4ae';c.lineWidth=2;c.beginPath();c.arc(p.x-g.cam,p.y,radius+5,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.max(0,1-p.age/WINDOW));c.stroke();}}
 }
 snapshot(){const p=this.active;return {cooldown:this.cooldown,launched:this.launched,bites:this.bites,finishers:this.finishers,active:p?{phase:p.phase,chain:p.chain,x:p.x,y:p.y,queued:!!p.queued,age:p.age}:null};}
}
