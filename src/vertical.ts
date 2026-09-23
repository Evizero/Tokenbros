import type { PlayerRuntime } from './player-runtime';
import { rect, text } from './art';
import { LEVEL_HEIGHT,COLS,TILE } from './world';
import { dimillian } from './dimillian-art';
import { levitationBob } from './pidalf-art';

const LCD_HOLD_DELAY=.32,ROCKET_HOLD_DELAY=.35;

type Grapple = {x:number;y:number;vx:number;vy:number;distance:number;attached:boolean};

// Movement input is separate from the weapon, so changing ammunition never
// cancels a jump ability. World.move still resolves every physical movement.
export class VerticalAbility {
 held=0;active=false;lift=2.6;exhaust=0;sound=0;grapple:Grapple|null=null;
 attempted=false;cooldown=0;lcdStarted=false;spent=0;instantBoost=false;lcdArmed=false;
 blinkArrival=0;blinkGhost:{x:number;y:number;face:number;angle:number;life:number}|null=null;
 dimAirUsed=false;blinkArmed=false;blinkReady=false;
 portals:{x:number;y:number;life:number;arrival:boolean}[]=[];
 constructor(public g:PlayerRuntime){}
 clear(){this.cancel();this.lift=2.6;this.cooldown=0;this.spent=0;this.dimAirUsed=false;this.portals=[];this.blinkArrival=0;this.blinkGhost=null;}
 cancel(){this.held=0;this.active=false;this.grapple=null;this.attempted=false;this.lcdStarted=false;this.exhaust=0;this.instantBoost=false;this.lcdArmed=false;this.blinkArmed=false;this.blinkReady=false;}
 press(){
  this.held=0;this.attempted=false;this.lcdStarted=false;this.spent=0;
  const g=this.g,p=g.player;
  this.lcdArmed=g.character==='marcus'&&!p.grounded;
  this.blinkArmed=g.character==='dimillian'&&g.dimillianKit.form===1&&!p.grounded&&!g.zip&&g.climb===null&&!this.dimAirUsed;
  if(g.character==='dimillian'&&g.dimillianKit.form===0&&!p.grounded&&g.coyote<=0&&g.wallGrace<=0&&!g.zip&&g.climb===null&&!g.dimillianKit.shield&&!this.dimAirUsed){
   this.dimAirUsed=true;p.vy=-480;g.jumpBuffer=0;g.wallGrip=0;g.audio.tone(270,.13,'triangle',.035,650);g.emit(p.x+10,p.y+31,12,['#e3b77d','#f5dec0','#c39aff'],110,3,.3);return true;
  }
  // A fresh airborne press is deliberate thrust, not a ground tap/hold decision.
  this.instantBoost=g.character==='tibo'&&!p.grounded&&!g.zip&&g.climb===null;
  if(this.instantBoost&&g.usage>0){
   this.active=true;g.audio.noise(.085,.022,550);this.sound=.09;
   for(const offset of [-5,6])g.emit(p.x+10+offset,p.y+34,4,['#ffc668','#f17a48','#fff0b9'],55,2,.18);
  }
 }
 release(){
  const g=this.g;
  if(g.character==='dimillian'&&g.dimillianKit.form===1&&this.blinkReady)this.teleport();
  if(g.character==='marcus'){
   if(g.marcusKit.lcd.charging)g.marcusKit.lcd.input(0,false,false);
  }
  if(this.grapple?.attached)g.wallLock=Math.max(g.wallLock,.22);
  this.cancel();
 }
 update(dt:number){
  const g=this.g,p=g.player;this.cooldown=Math.max(0,this.cooldown-dt);this.sound=Math.max(0,this.sound-dt);
  this.blinkArrival=Math.max(0,this.blinkArrival-dt);if(this.blinkGhost){this.blinkGhost.life-=dt;if(this.blinkGhost.life<=0)this.blinkGhost=null;}
  for(const portal of this.portals)portal.life-=dt;this.portals=this.portals.filter(p=>p.life>0);
  if(p.grounded){this.lift=2.6;this.dimAirUsed=false;this.blinkArmed=false;this.blinkReady=false;}
  const wasActive=this.active;this.active=false;
  if(g.crouched){this.cancel();return;}
  if(!g.keys.has('Space')){this.held=0;this.grapple=null;return;}
  this.held+=dt;
  if(g.character==='dimillian'){
   if(g.dimillianKit.form!==1){this.blinkArmed=false;this.blinkReady=false;return;}
   if(this.blinkArmed&&!this.dimAirUsed&&this.held>=LCD_HOLD_DELAY){
    if(!this.blinkReady){g.audio.tone(320,.17,'sine',.035,900);g.emit(p.x+10,p.y+16,12,['#8de4ff','#b692ff'],65,2,.25);}
    this.blinkReady=true;this.active=true;g.climb=null;g.zip=false;g.wallGrip=0;g.jumpBuffer=0;g.coyote=0;
   }
   return;
  }
  if(g.character==='marcus'){
   if(p.grounded)this.lcdArmed=false;
   if(this.lcdArmed&&this.held>=LCD_HOLD_DELAY){const rising=!this.lcdStarted;this.lcdStarted=true;g.marcusKit.lcd.input(dt,true,rising);}
   return;
  }
  if(g.character==='peter'){
   if(this.held>=.18&&!this.attempted){this.attempted=true;this.shootGrapple();}
   this.updateGrapple(dt);this.active=!!this.grapple?.attached;return;
  }
  if((this.held<(g.character==='tibo'?ROCKET_HOLD_DELAY:.18)&&!this.instantBoost)||p.grounded||g.zip||g.climb!==null)return;
  if(g.character==='tibo'&&g.usage>0){
   const burn=Math.min(g.usage,150*dt);g.usage-=burn;this.spent+=burn;this.active=true;
   if(this.sound<=0){g.audio.noise(.085,.022,550);this.sound=.09;}
  }else if(g.character==='pidalf'&&this.lift>0){
   this.lift=Math.max(0,this.lift-dt);this.active=true;if(!wasActive)p.vy=0;
   if(this.sound<=0){g.audio.tone(105,.22,'sine',.008,150);this.sound=.22;}
  }
  if(this.active){g.wallGrip=0;this.exhaust+=dt;
   if(this.exhaust>.035){this.exhaust=0;g.emit(g.character==='tibo'?p.x+10:p.x+10+Math.sin(g.time*13)*17,g.character==='tibo'?p.y+34:p.y+12,2,g.character==='tibo'?['#ffc668','#f17a48','#fff0b9']:['#d8e9e0','#b9c9c7'],45,2,.3);}
  }
 }
 apply(dt:number){
  if(!this.active)return;
  const g=this.g,p=g.player;
  if(g.character==='dimillian'&&this.blinkReady){p.vx=0;p.vy=0;return;}
  if(g.character==='peter'&&this.grapple?.attached){
   p.vy-=1400*dt;
   const h=this.grapple,dx=h.x-p.x-10,dy=h.y-p.y-14,d=Math.hypot(dx,dy);
   const speed=Math.min(560,Math.max(0,d-25)*6),blend=1-Math.exp(-12*dt);
   p.vx+=(dx/Math.max(1,d)*speed-p.vx)*blend;
   p.vy+=(dy/Math.max(1,d)*speed-p.vy)*blend;
   if(d<30){p.vx=0;p.vy=0;}
   p.grounded=false;g.climb=null;g.zip=false;g.wallGrip=0;g.wallGrace=0;
  }else{
   p.vy-=1400*dt;
   if(g.character==='pidalf'){
    const up=g.keys.has('KeyW')||g.keys.has('ArrowUp'),down=g.keys.has('KeyS')||g.keys.has('ArrowDown');
    const direction=Number(down)-Number(up);
    // Neutral input holds altitude exactly, including after letting go of W/S.
    p.vy=direction?p.vy+(direction*320-p.vy)*(1-Math.exp(-12*dt)):0;
   }else p.vy+=(-285-p.vy)*(1-Math.exp(-7*dt));
  }
 }
 blinkDestination(){
  const g=this.g,p=g.player,aim=g.aimPoint(),dx=aim.x-p.x-p.w/2,dy=aim.y-p.y-p.h/2,d=Math.max(1,Math.hypot(dx,dy)),range=Math.min(560,d);
  // Only the destination must be clear. Work back from the cursor/range cap
  // if it is embedded in terrain; intervening walls do not block the blink.
  for(let step=range;step>=12;step-=3){
   const x=p.x+dx/d*step,y=p.y+dy/d*step;
   if(x>=0&&y>=0&&x+p.w<=COLS*TILE&&y+p.h<=LEVEL_HEIGHT&&!g.world.overlaps(x,y,p.w,p.h))return {x,y};
  }
  return {x:p.x,y:p.y};
 }
 teleport(){
  const g=this.g,p=g.player,to=this.blinkDestination();if(this.dimAirUsed||Math.hypot(to.x-p.x,to.y-p.y)<12)return;
  this.blinkGhost={x:p.x,y:p.y,face:g.face,angle:g.aim,life:.18};this.blinkArrival=.24;
  this.portals.push({x:p.x+10,y:p.y+16,life:.5,arrival:false},{x:to.x+10,y:to.y+16,life:.5,arrival:true});
  g.emit(p.x+10,p.y+16,18,['#b8edff','#9682ff','#edfaff'],160,2,.4);p.x=to.x;p.y=to.y;p.vx=0;p.vy=0;p.grounded=false;
  this.dimAirUsed=true;g.jumpBuffer=0;g.coyote=0;g.wallGrip=0;g.wallGrace=0;g.climb=null;g.zip=false;g.zipCooldown=.25;g.wallRegrab=.12;
  g.emit(p.x+10,p.y+16,22,['#b8edff','#9682ff','#edfaff'],190,2,.4);g.audio.noise(.19,.045,1800);g.audio.tone(180,.24,'sine',.05,940);g.audio.tone(1200,.22,'triangle',.025,300);
 }
 drawPortal(x:number,y:number,open:number,alpha:number){
  const g=this.g,c=g.c;c.save();c.translate(x-g.cam,y);c.globalAlpha=alpha;const rx=Math.max(1,14*open),ry=27;
  c.fillStyle='#17275799';c.beginPath();c.ellipse(0,0,rx,ry,0,0,Math.PI*2);c.fill();
  for(const [width,color] of [[7,'#8060e544'],[3,'#8297ff'],[1,'#d0f8ff']] as const){c.lineWidth=width;c.strokeStyle=color;c.beginPath();for(let i=0;i<=40;i++){const a=i/40*Math.PI*2,ripple=1+Math.sin(a*7+g.time*20)*.06,px=Math.cos(a)*rx*ripple,py=Math.sin(a)*ry*ripple;i?c.lineTo(px,py):c.moveTo(px,py);}c.closePath();c.stroke();}
  for(let i=0;i<6;i++){const a=i*Math.PI/3-g.time*5;rect(c,Math.cos(a)*rx-1,Math.sin(a)*ry-1,2,3,'#e1faff');}c.restore();
 }
 shootGrapple(){
  if(this.cooldown>0)return;const g=this.g;g.updateAim();
  this.grapple={x:g.player.x+10,y:g.player.y+12,vx:Math.cos(g.aimAngle)*1050,vy:Math.sin(g.aimAngle)*1050,distance:0,attached:false};
  this.cooldown=.3;g.audio.tone(450,.12,'triangle',.025,750);
 }
 updateGrapple(dt:number){
  const h=this.grapple;if(!h)return;const g=this.g,p=g.player;
  if(h.attached){
   if(!g.world.at(h.x,h.y)||Math.hypot(h.x-p.x-10,h.y-p.y-14)>510){this.grapple=null;return;}
   // A new wall across the rope breaks the connection; don't pull through cover.
   const dx=h.x-p.x-10,dy=h.y-p.y-14,d=Math.hypot(dx,dy);
   for(let t=14;t<d-12;t+=6)if(g.world.at(p.x+10+dx*t/d,p.y+14+dy*t/d)){this.grapple=null;return;}
  }else{
   const steps=Math.ceil(1050*dt/4);
   for(let i=0;i<steps;i++){
    h.x+=h.vx*dt/steps;h.y+=h.vy*dt/steps;h.distance+=1050*dt/steps;
    if(g.world.at(h.x,h.y)){h.attached=true;g.climb=null;g.zip=false;g.audio.tone(140,.1,'square',.03,70);g.emit(h.x,h.y,9,['#ffae83','#d4dbe1'],90,2,.25);break;}
    if(h.distance>450){this.grapple=null;break;}
   }
  }
 }
 draw(){
  const g=this.g,c=g.c,p=g.player,x=p.x+10-g.cam,y=p.y+(this.active&&g.character==='pidalf'?levitationBob(g.time):0);
  if(this.blinkGhost){const b=this.blinkGhost;c.save();c.globalAlpha=b.life/.18;dimillian(c,b.x-g.cam,b.y,b.face,g.time,false,1,b.angle,0,0,false,false,1,undefined,29,undefined,{teleport:1,departure:1-b.life/.18});c.restore();}
  for(const portal of this.portals){const t=1-portal.life/.5;this.drawPortal(portal.x,portal.y,Math.sin(t*Math.PI)**.4,Math.min(1,portal.life*5));}
  if(this.blinkReady&&g.character==='dimillian'&&g.dimillianKit.form===1){const to=this.blinkDestination();this.drawPortal(to.x+10,to.y+16,.8,.45);this.drawPortal(p.x+10,p.y+16,.7,.4);text(c,'RELEASE · TELEPORT',x,y-33,'#cce7ff',7,'center');}
  if(this.grapple){const h=this.grapple,dx=h.x-g.cam-x,dy=h.y-y-12,d=Math.hypot(dx,dy),sag=h.attached?0:Math.min(18,d*.04);
   c.save();c.lineWidth=2;c.strokeStyle='#352a2b';c.beginPath();c.moveTo(x,y+12);c.quadraticCurveTo(x+dx*.5,y+12+dy*.5+sag,h.x-g.cam,h.y);c.stroke();
   for(let t=0;t<d;t+=7){const u=t/Math.max(1,d);c.fillStyle=Math.floor(t/7)%2?'#dcad8f':'#967266';c.fillRect(x+dx*u-1,y+12+dy*u+Math.sin(u*Math.PI)*sag-1,3,2);}
   c.translate(h.x-g.cam,h.y);c.rotate(Math.atan2(h.vy,h.vx));rect(c,-8,-3,9,6,'#b84836');
   for(const sign of [-1,1]){c.save();c.scale(1,sign);c.rotate(h.attached?-.18:-.55);rect(c,-2,2,10,4,'#ee8061');rect(c,6,0,4,5,'#ffd0a0');c.restore();}c.restore();
  }
  if(!this.active||g.character==='peter'||g.character==='dimillian')return;
  c.save();
  if(g.character==='tibo'){
   for(const offset of [-5,6]){const length=17+Math.sin(g.time*53+offset)*5;
    rect(c,x+offset-4,y+28,8,5,'#586772');rect(c,x+offset-2,y+31,4,3,'#a7b6bd');
    c.fillStyle='#ee7047';c.beginPath();c.moveTo(x+offset-4,y+34);c.lineTo(x+offset,y+35+length);c.lineTo(x+offset+4,y+34);c.fill();
    c.fillStyle='#ffd58b';c.beginPath();c.moveTo(x+offset-2,y+33);c.lineTo(x+offset,y+32+length*.65);c.lineTo(x+offset+2,y+33);c.fill();rect(c,x+offset-1,y+33,2,5,'#fff5d6');
   }
   text(c,`−${Math.ceil(this.spent)} TOK`,x,y-16,'#ffd195',9,'center');
  }else{
   c.lineWidth=1;
   for(let i=0;i<9;i++){const phase=(g.time*1.2+i/9)%1,side=i%2?1:-1,xx=x+side*(15+Math.sin(i*3+g.time)*4),yy=y+39-phase*57;c.globalAlpha=Math.sin(phase*Math.PI)*.6;c.strokeStyle=i%3?'#d9e9e3':'#e9cf9c';c.beginPath();c.moveTo(xx,yy+7);c.quadraticCurveTo(xx+side*3,yy,xx,yy-5);c.stroke();}
   c.globalAlpha=.65;rect(c,x+26,y+6,2,22,'#34413f');rect(c,x+26,y+28-22*this.lift/2.6,2,22*this.lift/2.6,'#d9e6d8');
  }
  c.restore();
 }
}
