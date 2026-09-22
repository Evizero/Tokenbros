import type { MarcusKit } from './marcus';
import { clamp,LEVEL_HEIGHT } from './world';
import { text,rect } from './art';
import { invaderArt,MARCUS_COLOR } from './marcus-art';
type Bomber={x:number;y:number;size:number;charge:number;tx:number;ty:number;dir:number;phase:'out'|'bomb'|'back';age:number;left:number;total:number;timer:number;kick:number;trail:{x:number;y:number}[];route:{x:number;y:number}[]};
type Bomb={x:number;y:number;vx:number;vy:number;life:number;fuse:number;radius:number;grounded:boolean;w:number;h:number};
export class Invader {
 charge=0;charging=false;wasFiring=false;craft:Bomber|null=null;bombs:Bomb[]=[];dropped=0;detonated=0;caught=0;cue=-1;
 constructor(public owner:MarcusKit){}
 get g(){return this.owner.g;}
 get occupied(){return this.charging||!!this.craft;}
 cancel(){this.charge=0;this.charging=false;this.cue=-1;}
 clear(){this.cancel();this.craft=null;this.bombs=[];this.wasFiring=false;}
 get amount(){return this.charge<.35?1:this.charge<.8?3:6;}
 input(dt:number,firing:boolean){
  const g=this.g,rising=firing&&!this.wasFiring;this.wasFiring=firing;
  if(this.owner.mode!==2){this.cancel();if(firing&&g.fireTimer<=0)this.owner.fire();return;}
  if(this.owner.flip>0){this.cancel();return;}
  if(rising&&!this.occupied&&this.owner.stock>0&&g.fireTimer<=0){this.charging=true;this.charge=.001;this.cue=-1;}
  if(this.charging){if(!firing){this.launch();return;}this.charge=Math.min(1,this.charge+dt/1.35);const n=this.amount;if(this.cue!==n){this.cue=n;g.audio.tone(160+n*65,.12,'square',.022,230+n*85);g.emit(this.hand().x,this.hand().y,6,[MARCUS_COLOR,'#ffe0a1'],65,2,.25);}}
 }
 hand(){const p=this.g.player;return {x:p.x+10+this.g.face*(19+this.charge*4),y:p.y+12-this.charge*43};}
 target(){const g=this.g,raw=g.aimPoint(),p=this.hand(),dx=raw.x-p.x,dy=raw.y-65-p.y,len=Math.hypot(dx,dy),r=Math.min(1,340/Math.max(1,len));return {x:clamp(p.x+dx*r,25,4050),y:clamp(p.y+dy*r,30,LEVEL_HEIGHT-25),dir:Math.abs(dx)>12?Math.sign(dx):g.face};}
 launch(){
  if(!this.charging)return;const g=this.g,p=this.hand(),t=this.target(),q=this.charge,n=this.amount+(this.owner.batch>0?2:0);
  this.craft={...p,size:.75+q*4.1,charge:q,tx:t.x,ty:t.y,dir:t.dir,phase:'out',age:0,left:n,total:n,timer:0,kick:0,trail:[],route:[{...p}]};this.cancel();this.owner.launch=.101;g.fireTimer=.4;g.lastCooldown=.4;g.shotCount++;
  g.audio.tone(100+q*100,.25,'sawtooth',.035,600);g.audio.noise(.1,.035,900);g.emit(p.x,p.y,18,[MARCUS_COLOR,'#ffe0a1'],150,3,.35);g.makeNoise(p.x,p.y,550);
 }
 recall(){const b=this.craft;if(!b||b.phase==='back')return false;b.phase='back';b.left=0;b.timer=0;this.g.audio.tone(620,.18,'triangle',.03,220);return true;}
 blocked(x:number,y:number,size:number){return this.g.world.overlaps(x-size*5.5,y-size*4,Math.max(5,size*11),Math.max(5,size*8));}
 move(b:Bomber,tx:number,ty:number,speed:number,dt:number){
  const dx=tx-b.x,dy=ty-b.y,len=Math.hypot(dx,dy),dist=Math.min(len,speed*dt),steps=Math.max(1,Math.ceil(dist/3));
  for(let i=0;i<steps;i++){const x=b.x+dx/Math.max(.001,len)*dist/steps,y=b.y+dy/Math.max(.001,len)*dist/steps;if(this.blocked(x,y,b.size))return false;b.x=x;b.y=y;}
  return true;
 }
 drop(b:Bomber){
  const g=this.g,x=b.x-4,y=b.y+b.size*4+2;if(g.world.overlaps(x,y,8,8)){this.recall();return;}
  this.bombs.push({x,y,vx:b.dir*25,vy:75,life:4,fuse:-1,radius:53+b.charge*23,grounded:false,w:8,h:8});b.left--;b.timer=.23;b.kick=1;this.dropped++;
  g.audio.tone(420,.09,'square',.02,140);g.emit(b.x,y,4,[MARCUS_COLOR,'#ffe0a1'],60,2,.2);
 }
 update(dt:number){
  const g=this.g,b=this.craft;
  if(b){b.age+=dt;b.timer-=dt;b.kick=Math.max(0,b.kick-dt*9);b.trail.push({x:b.x,y:b.y});if(b.trail.length>12)b.trail.shift();
   if(b.phase==='out'){
    if(!this.move(b,b.tx,b.ty,510-b.charge*230,dt)){g.emit(b.x,b.y,8,[MARCUS_COLOR,'#ffe0a1'],120,2,.3);this.recall();}
    else if(Math.hypot(b.tx-b.x,b.ty-b.y)<4)b.phase='bomb';
   }else if(b.phase==='bomb'){
    if(b.timer<=0&&b.left>0)this.drop(b);
    if(b.left===0&&b.phase==='bomb')this.recall();
    else if(b.phase==='bomb'&&!this.move(b,b.x+b.dir*100,b.y,245-b.charge*95,dt))this.recall();
   }else{
    const p=g.player;const home={x:p.x+10,y:p.y+12},route=b.route.at(-1),t=route??home;
    if(route&&Math.hypot(t.x-b.x,t.y-b.y)<10)b.route.pop();
    const near=Math.hypot(home.x-b.x,home.y-b.y);b.size=Math.max(.55,Math.min(b.size,(.75+b.charge*4.1)*clamp(near/110,.12,1)));
    this.move(b,t.x,t.y,620,dt);
    if(near<20&&g.lineOfSight(b.x,b.y,home.x,home.y)){
     this.caught++;this.owner.catches++;this.owner.catchPose=1;this.owner.catchFlash=.7;g.emit(home.x,home.y,12,[MARCUS_COLOR,'#ffe0a1'],100,2,.3);g.audio.tone(520,.12,'triangle',.035,1200);g.barks.request('catch');this.craft=null;
    }
   }
   if(b.phase!=='back'){const p=b.route.at(-1);if(!p||Math.hypot(p.x-b.x,p.y-b.y)>15)b.route.push({x:b.x,y:b.y});}
   if(b.age>7||b.y>LEVEL_HEIGHT+40){g.emit(b.x,b.y,14,[MARCUS_COLOR,'#ffe0a1'],100,3,.35);this.craft=null;}
  }
  for(const bomb of this.bombs){
   bomb.life-=dt;const oldVy=bomb.vy;bomb.vy=Math.min(620,bomb.vy+680*dt);g.world.move(bomb,dt);
   if(bomb.grounded&&bomb.fuse<0){bomb.fuse=.2;bomb.vy=-Math.min(95,Math.abs(oldVy)*.25);bomb.vx*=.4;}
   if(bomb.fuse<0&&g.enemies.some(e=>!e.dead&&Math.hypot(e.x+10-bomb.x-4,e.y+15-bomb.y-4)<17))bomb.fuse=.035;
   if(bomb.fuse>=0){bomb.fuse-=dt;if(bomb.fuse<=0)bomb.life=0;}
   if(bomb.life<=0){g.explode(bomb.x+4,bomb.y+4,bomb.radius);this.detonated++;g.rings.push({x:bomb.x+4,y:bomb.y+4,r:2,max:bomb.radius+12,life:.25,color:MARCUS_COLOR});}
  }
  this.bombs=this.bombs.filter(b=>b.life>0&&b.y<LEVEL_HEIGHT+60);
 }
 draw(){
  const g=this.g,c=g.c;
  if(this.charging){const p=this.hand(),t=this.target(),size=.75+this.charge*4.1;
   c.save();c.strokeStyle=MARCUS_COLOR;c.lineWidth=1;c.globalAlpha=.24;
   // Only the projected drop markers: no cursor-to-character tether.
   for(let i=0;i<this.amount;i++){const x=t.x+i*t.dir*(245-this.charge*95)*.23-g.cam;rect(c,x-2,t.y+24,4,6,'#ffe0a1');c.beginPath();c.moveTo(x,t.y+34);c.lineTo(x-3,t.y+30);c.moveTo(x,t.y+34);c.lineTo(x+3,t.y+30);c.stroke();}c.restore();
   invaderArt(c,p.x-g.cam,p.y,g.time,size,this.charge>.8?Math.sin(g.time*36)*.8:0);
   const w=30+this.charge*30;rect(c,p.x-g.cam-w/2,p.y-size*4-10,w,3,'#263d49');rect(c,p.x-g.cam-w/2,p.y-size*4-10,w*this.charge,3,MARCUS_COLOR);
   text(c,`${this.amount} ${this.amount===1?'BOMB':'BOMBS'}`,p.x-g.cam,p.y-size*4-15,'#fff0c9',9,'center');
  }
  const b=this.craft;if(b){c.save();for(let i=0;i<b.trail.length;i+=3){c.globalAlpha=i/b.trail.length*.12;invaderArt(c,b.trail[i].x-g.cam,b.trail[i].y,g.time,b.size);}c.restore();invaderArt(c,b.x-g.cam,b.y-b.kick*4,g.time,b.size,0,b.phase==='back');
   if(b.phase!=='back')for(let i=0;i<b.left;i++)rect(c,b.x-g.cam-b.total*3+i*6,b.y-b.size*4-7,4,3,'#ffe0a1');
  }
  for(const bomb of this.bombs){c.save();c.translate(bomb.x+4-g.cam,bomb.y+4);c.rotate(bomb.vx*.005);rect(c,-4,-4,8,8,'#253543');rect(c,-3,-2,6,6,bomb.fuse>=0&&Math.floor(g.time*30)%2?'#fff4c9':'#ffe0a1');rect(c,-2,-5,4,3,MARCUS_COLOR);rect(c,-1,0,2,2,'#8d5436');c.restore();}
 }
 snapshot(){return {charging:this.charging,charge:this.charge,bombCount:this.amount,craft:this.craft?{x:this.craft.x,y:this.craft.y,size:this.craft.size,phase:this.craft.phase,left:this.craft.left,total:this.craft.total}:null,bombs:this.bombs.length,dropped:this.dropped,detonated:this.detonated,caught:this.caught};}
}
