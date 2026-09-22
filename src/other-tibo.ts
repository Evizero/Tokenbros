import type { Game } from './game';
import type { Body } from './world';
import { overlap } from './world';
import { TOKEN_CAPACITY } from './tokens';
import { rect,text,tibo } from './art';

type Double=Body&{life:number;age:number;duration:number;startX:number;startY:number;tx:number;ty:number;angle:number;face:number;phase:'leap'|'grab'|'guard';grip:number;target:Game['enemies'][number]|null;thrown:boolean;blocks:number;flash:number;bark:number;catchable:boolean;};
type TokenFlight={x:number;y:number;fromX:number;fromY:number;age:number;duration:number;bend:number;};
export class OtherTibo {
 active:Double|null=null;cooldown=0;
 flights:TokenFlight[]=[];rewardFeedback=0;rewardTotal=0;catchFeedback=0;catchFrom:{x:number;y:number;face:number}|null=null;
 constructor(public g:Game){}
 activate(){
  const g=this.g;if(this.active||this.cooldown>0||g.state!=='playing')return false;g.updateAim();
  const point=g.aimPoint(),x=g.player.x+10,y=g.player.y+16,dx=point.x-x,dy=point.y-y,d=Math.hypot(dx,dy),range=Math.min(360,d),angle=d>1?Math.atan2(dy,dx):g.aimAngle;
  this.active={x:x-12,y:y-20,w:24,h:36,vx:0,vy:0,grounded:false,life:1.8,age:0,duration:Math.max(.16,range/850),startX:x-12,startY:y-20,tx:x+Math.cos(angle)*range-12,ty:y+Math.sin(angle)*range-18,angle,face:Math.cos(angle)>=0?1:-1,phase:'leap',grip:0,target:null,thrown:false,blocks:3,flash:0,bark:0,catchable:false};
  g.barks.request('double');this.cooldown=4.5;g.emit(x,y,18,['#d5ff60','#f4efcd','#778787'],120,4,.35);g.makeNoise(x,y,190);g.audio.tone(260,.14,'triangle',.045,700);return true;
 }
 grab(b:Double){
  if(b.thrown)return;
  const e=this.g.enemies.find(e=>!e.dead&&e.hacked<=0&&overlap({x:b.x-5,y:b.y-3,w:b.w+10,h:b.h+6},e)&&this.g.lineOfSight(b.x+12,b.y+18,e.x+10,e.y+15));
  if(!e)return;b.target=e;b.phase='grab';b.grip=.12;b.vx=0;b.vy=0;e.wind=0;e.stun=.25;e.vx=0;e.vy=0;
 }
 fling(b:Double){
  const g=this.g,e=b.target;b.target=null;b.thrown=true;b.phase='guard';b.bark=.8;
  if(!e||e.dead)return;
  if(e.shield>0)g.debris.armor(e.x,e.y,e.face);e.shield=0;e.wind=0;e.cool=1.1;e.hp-=3;e.vx=Math.cos(b.angle)*640;e.vy=Math.sin(b.angle)*480-200;e.stun=.85;e.flung=.75;e.grounded=false;
  if(e.hp<=0)g.kill(e,e.vx,e.vy,true);
  this.rewardTotal=0;for(let i=0;i<6;i++)this.flights.push({x:e.x+10,y:e.y+15,fromX:e.x+10,fromY:e.y+15,age:0,duration:.38+i*.055,bend:(i-2.5)*14});
  g.emit(e.x+10,e.y+15,22,['#f4edbf','#d5ff60','#a3b3ae'],210,4,.45);g.makeNoise(e.x+10,e.y+15,480);g.shake=Math.max(g.shake,5);if(g.effects)g.freeze=Math.max(g.freeze,.035);g.audio.noise(.1,.045,1200);g.audio.tone(125,.13,'square',.035,50);
 }
 collect(b:Double){
  const g=this.g;g.barks.request('catch');this.active=null;this.cooldown=0;this.catchFeedback=.85;this.catchFrom={x:b.x,y:b.y,face:b.face};
  g.emit(b.x+12,b.y+18,18,['#d5ff60','#fff6cb'],110,3,.35);
  g.rings.push({x:g.player.x+10,y:g.player.y+16,r:8,max:43,life:.3,color:'#e9ff9f'});
  g.audio.tone(440,.1,'triangle',.045,880);g.audio.tone(880,.19,'sine',.025,1320);
 }
 updateFeedback(dt:number){
  const g=this.g;this.catchFeedback=Math.max(0,this.catchFeedback-dt);this.rewardFeedback=Math.max(0,this.rewardFeedback-dt);
  for(const f of this.flights){
    f.age+=dt;const t=Math.min(1,f.age/f.duration),u=t*t*(3-2*t),dx=g.player.x+10-f.fromX,dy=g.player.y+16-f.fromY,d=Math.max(1,Math.hypot(dx,dy)),arc=Math.sin(t*Math.PI)*f.bend;
    f.x=f.fromX+dx*u-dy/d*arc;f.y=f.fromY+dy*u+dx/d*arc-Math.sin(t*Math.PI)*22;
    if(t>=1){const gain=Math.min(10,TOKEN_CAPACITY-g.usage);g.usage+=gain;g.tokenTrail=Math.max(g.tokenTrail,g.usage);this.rewardTotal+=gain;this.rewardFeedback=.85;
      if(gain>0){g.dryFeedback=0;g.dryFire=0;}g.emit(f.x,f.y,3,['#d5ff60','#fff7cc'],45,2,.2);g.audio.tone(620+this.rewardTotal*7,.045,'sine',.018,900+this.rewardTotal*7);
    }
  }
  this.flights=this.flights.filter(f=>f.age<f.duration);
 }
 update(dt:number){
  this.updateFeedback(dt);
  this.cooldown=Math.max(0,this.cooldown-dt);const b=this.active;if(!b)return;
  b.age+=dt;b.life-=dt;
  if(Math.hypot(b.x+12-this.g.player.x-10,b.y+18-this.g.player.y-16)>44)b.catchable=true;b.flash=Math.max(0,b.flash-dt);b.bark=Math.max(0,b.bark-dt);
  if(b.life<=0){if(b.target)this.fling(b);this.active=null;return;}
  if(b.phase==='guard'&&b.age>.25&&(b.catchable||b.thrown)&&overlap({x:b.x-8,y:b.y-6,w:b.w+16,h:b.h+12},this.g.player)&&this.g.lineOfSight(b.x+12,b.y+18,this.g.player.x+10,this.g.player.y+16)){this.collect(b);return;}
  if(b.phase==='grab'){
    const e=b.target;if(!e||e.dead){b.target=null;b.phase='guard';b.thrown=true;return;}
    e.stun=.25;e.wind=0;e.vx=0;e.vy=0;
    const x=b.x+b.face*20,y=b.y-8;if(!this.g.world.overlaps(x,y,e.w,e.h)){e.x=x;e.y=y;}
    b.grip-=dt;if(b.grip<=0)this.fling(b);return;
  }
  if(b.phase==='leap'){
    const t=Math.min(1,b.age/b.duration),x=b.startX+(b.tx-b.startX)*t,y=b.startY+(b.ty-b.startY)*t-Math.sin(t*Math.PI)*30;
    const dx=x-b.x,dy=y-b.y,steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/5));
    for(let i=0;i<steps&&b.phase==='leap';i++){
      b.vx=dx/dt;b.vy=dy/dt;const wall=this.g.world.move(b,dt/steps);this.grab(b);
      if(b.phase==='leap'&&(wall||b.grounded||Math.abs(dy)>.1&&b.vy===0)){b.phase='guard';b.vx=0;b.vy=0;}
    }
    if(b.phase==='leap'&&t>=1){b.phase='guard';b.vx=0;b.vy=0;}
  }else{b.vx=0;b.vy=Math.min(620,b.vy+1100*dt);this.g.world.move(b,dt);this.grab(b);}
 }
 block(shot:Game['bullets'][number]){
  const b=this.active;if(!b||!shot.hostile||shot.life<=0||shot.x<b.x-2||shot.x>b.x+b.w+2||shot.y<b.y-2||shot.y>b.y+b.h+2)return false;
  shot.life=0;b.blocks--;b.flash=.12;this.g.emit(shot.x,shot.y,8,['#fff2bc','#d5ff60'],130,3,.25);this.g.audio.tone(380,.055,'triangle',.03,140);
  if(b.blocks<=0){if(b.target)this.fling(b);this.g.emit(b.x+12,b.y+18,20,['#d5ff60','#dce6c1'],150,4,.4);this.active=null;}return true;
 }
 draw(){
  const g=this.g;if(g.state==='dead')return;const c=g.c;
  for(const f of this.flights){c.save();c.translate(f.x-g.cam,f.y);c.rotate(f.age*7);c.shadowColor='#d5ff60';c.shadowBlur=7;rect(c,-4,-4,8,8,'#d5ff60');rect(c,-1,-3,2,6,'#526234');c.restore();}
  if(this.catchFeedback>0){
    const t=Math.min(1,(.85-this.catchFeedback)/.32),a=this.catchFrom;
    if(a&&t<1){c.save();c.translate(a.x+(g.player.x-a.x)*t+10-g.cam,a.y+(g.player.y-a.y)*t+16);c.rotate(t*Math.PI*2);c.scale(1-t,1-t);c.globalAlpha=1-t;tibo(c,-10,-16,a.face,g.time,false,true,0,0,1,0,0,2);c.restore();}
    c.save();c.globalAlpha=Math.min(1,this.catchFeedback*5);text(c,'CAUGHT! · E READY',g.player.x+10-g.cam,g.player.y-36-(.85-this.catchFeedback)*12,'#efffc0',11,'center');c.restore();
  }
  if(this.rewardFeedback>0){c.save();c.globalAlpha=Math.min(1,this.rewardFeedback*5);text(c,this.rewardTotal?`+${this.rewardTotal} TOK`:'TOKENS FULL',g.player.x+10-g.cam,g.player.y-19,'#d5ff60',10,'center');rect(c,g.player.x-18-g.cam,g.player.y-12,56,3,'#27322b');rect(c,g.player.x-18-g.cam,g.player.y-12,56*g.usage/TOKEN_CAPACITY,3,'#d5ff60');c.restore();}
  const b=this.active;if(!b)return;const x=b.x-g.cam,y=b.y;
  c.save();c.globalAlpha=Math.min(1,b.life/.25);
  if(b.phase==='leap'){c.strokeStyle='#e8efb5';c.lineWidth=3;for(let i=0;i<3;i++){c.beginPath();c.moveTo(x+12-Math.cos(b.angle)*(18+i*9),y+12+i*5);c.lineTo(x+12-Math.cos(b.angle)*(32+i*9),y+12+i*5);c.stroke();}}
  const pose=b.phase==='leap'?1:b.phase==='grab'?2:b.bark>.5?3:4;
  tibo(c,x+2,y+2,b.face,g.time,b.phase==='leap',true,0,b.angle*b.face,1.05,0,0,pose);
  if(b.flash>0){c.strokeStyle='#fff8d6';c.lineWidth=2;c.strokeRect(x-2,y-2,b.w+4,b.h+4);}
  for(let i=0;i<b.blocks;i++)rect(c,x+4+i*7,y+42,5,3,'#d5ff60');
  text(c,b.bark>0?'YOU GET RESET!':b.catchable?'CATCH ME!':'OTHER TIBO',x+12,y-9,b.bark>0?'#fff0b5':'#d8e8b6',b.bark>0?10:7,'center');c.restore();
 }
}
