import type { PlayerRuntime as Game } from './player-runtime';
import { reflect,shieldCrossing } from './defense-geometry';
import { clamp,LADDERS } from './world';
import { rect,text } from './art';
import { baguette,mageStaffTip,iphoneBunker,sheep,DIM_COLORS,DIM_FORMS } from './dimillian-art';
type Enemy=Game['enemies'][number];
type Swing={step:number;connected:boolean;age:number;duration:number;windup:number;active:number;aim:number;direction:number;start:number;end:number;angle:number;prior:number;radius:number;power:number;force:number;heavy:boolean;hits:Set<unknown>};
type Shield={x:number;y:number;kind:number;life:number;age:number;hits:number;angle:number;flash:number;pushed:Set<unknown>};
export class DimillianKit {
 form=0;transform=0;attack=0;combo=0;comboHits=0;comboLife=0;charge=0;boosting=false;swing:Swing|null=null;
 chargeSound=0;fullChargeFlash=0;dischargeFlash=0;dischargeStrength=0;
 lightning:{x:number;y:number;tx:number;ty:number;life:number;strength:number;root:boolean;seed:number}[]=[];
 sheepGesture=0;polymorph:{target:Enemy;x:number;y:number;fromX:number;fromY:number;age:number;duration:number;impact:boolean;trail:{x:number;y:number}[]}|null=null;
 qCooldown=0;fCooldown=0;eCooldown=0;shield:Shield|null=null;
 shieldHP=100;shieldBroken=false;shieldHit=0;contactGrace=0;
 bombs:{x:number;y:number;vy:number;life:number}[]=[];
 rocket:{x:number;y:number;angle:number;speed:number;life:number;trail:{x:number;y:number}[]}|null=null;
 rocketKick=0;
 thrusters={forward:0,reverse:0,up:0,down:0};
 forwardRun=0;forwardFace=0;sonicFlash=0;sonic=false;ramHits=new Set<unknown>();
 rocketFlight=false;flightBlend=0;flightAngle=0;flightSpeed=0;
 ramSpent=false;ramExit:{x:number;y:number;angle:number;life:number}|null=null;
 special=0;specialForm=0;specialAngle=0;slamDone=false;
 meteor:{x:number;y:number;targetY:number;life:number}|null=null;
 remoteJumpHeld=false;remoteSpaceHeld=false;remoteLadder:number|null=null;remoteOverclock=false;remoteSpark=0;
 paired:Enemy|null=null;pairing:Enemy|null=null;pairTime=0;remoteTime=0;remoteShot=0;message='';messageLife=0;
 constructor(public g:Game){}
 get remoteDriving(){return this.form===0&&this.shield?.kind===0&&!!this.paired&&!this.paired.dead;}
 get name(){return DIM_FORMS[this.form];}
 get color(){return DIM_COLORS[this.form];}
 get qName(){return ['BUNKER','BUBBLE','DEFLECT'][this.form];}
 get eName(){return ['PAIR','SHEEP','BOMB'][this.form];}
 get fName(){return ['GRAND SLAM','METEOR','ROCKET'][this.form];}
 changeForm(kind:number){
  if(this.special>0||kind===this.form)return;
  this.form=kind;this.resetFlight();this.g.vertical.cancel();this.cancelLightning();this.swing=null;this.combo=0;this.comboHits=0;this.shield=null;this.disconnect();if(kind===2&&this.g.player.grounded)this.g.player.vy=-85;this.transform=.38;this.g.jumpBuffer=0;this.g.wallGrip=0;
  this.g.emit(this.g.player.x+10,this.g.player.y+16,14,['#c6a0ff','#eee0ff','#706086'],100,3,.32);
  this.g.audio.tone(220+kind*190,.13,'triangle',.04,800); // Attack/Q/F timers deliberately survive hot reload.
 }
 feedback(label:string){this.message=label;this.messageLife=.8;}
 hit(e:Enemy,power:number,vx:number,heavy=false,vy=-100){
  if(e.dead||e.hacked>0)return;
  const g=this.g;if(heavy&&e.shield>0){g.debris.armor(e.x,e.y,e.face);e.shield=0;}
  e.sheep=0;e.hp-=power;e.wind=0;e.hurt=.13;e.stun=heavy?.5:.16;e.vx=vx;e.vy=vy;e.flungBy=g.id;e.flung=heavy?.5:0;e.grounded=false;
  g.emit(e.x+10,e.y+15,heavy?20:8,[this.color,'#fff0cc','#9976b4'],heavy?260:130,4,.35);
  if(e.hp<=0)g.kill(e,vx,vy,heavy);else{g.audio.impact();g.shake=Math.max(g.shake,heavy?5:2);if(g.effects)g.freeze=Math.max(g.freeze,heavy?.04:.02);}
 }
 smash(x:number,y:number,r:number){
  const g=this.g;for(let dx=-r;dx<=r;dx+=12)for(let dy=-r;dy<=r;dy+=12)if(dx*dx+dy*dy<r*r){if(g.world.damage(x+dx,y+dy,8))g.emit(x+dx,y+dy,4,['#b39da2','#d7bd91'],130,4);}
 }
 area(x:number,y:number,r:number,power:number,heavy=false,terrain=false,fire=false){
  const g=this.g;if(terrain)this.smash(x,y,r*.7);
  for(const e of g.enemies)if(Math.hypot(e.x+10-x,e.y+15-y)<r+12&&g.lineOfSight(x,y,e.x+10,e.y+15))this.hit(e,power,(Math.sign(e.x+10-x)||g.face)*(heavy?430:170),heavy,heavy?-240:-120);
  for(const b of g.barrels)if(!b.dead&&Math.hypot(b.x+9-x,b.y+15-y)<r){b.owner=g.id;b.fuse=b.fuse||.08;}
  const b=g.boss;if(b.active&&!b.dead&&b.phase===2&&Math.hypot(b.x+38-x,b.y+38-y)<r+35&&g.lineOfSight(x,y,b.x+38,b.y+38))b.hp-=power;
  g.rings.push({x,y,r:5,max:r,life:.28,color:fire?'#ffbd67':heavy?'#ffcaa1':'#d9b5ff'});g.emit(x,y,heavy?42:20,fire?['#ff6635','#ffb448','#fff0af']:['#d2aaff','#fff0dc',heavy?'#ff9869':'#94def3'],heavy?290:180,5,.5);
  g.makeNoise(x,y,heavy?1400:500);g.audio.noise(.16,.06,heavy?700:2100);g.audio.tone(heavy?90:340,.17,'triangle',.05,60);g.shake=Math.max(g.shake,heavy?8:3);if(g.effects)g.freeze=Math.max(g.freeze,heavy?.05:.02);
 }
 melee(slam=false){
  const g=this.g,a=slam?this.specialAngle:g.aimAngle,step=slam?3:this.combo,finish=step>=2,direction=(Math.cos(a)>=0?-1:1)*(step===1?-1:1);
  const windup=slam?.24:finish?.14:step===1?.065:.08,active=slam?.23:finish?.18:step===1?.12:.11;
  this.swing={step,connected:false,age:0,duration:windup+active+(finish?.22:.11),windup,active,aim:a,direction,start:a-direction*(finish?1.65:1.35),end:a+direction*(finish?1.45:1.1),angle:a-direction*(finish?1.65:1.35),prior:a-direction*(finish?1.65:1.35),radius:slam?150:finish?50:43,power:slam?12:finish?7:step===1?2:1.5,force:slam?850:finish?650:65,heavy:finish,hits:new Set()};
  this.attack=this.swing.duration;g.makeNoise(g.player.x,g.player.y,slam?1000:130);g.audio.tone(finish?130:step===1?300:230,windup,'triangle',.025,slam?65:150);
 }
 updateSwing(dt:number){
  const s=this.swing;if(!s)return;const g=this.g,old=s.age;s.age+=dt;
  const progress=clamp((s.age-s.windup)/s.active,0,1),previous=clamp((old-s.windup)/s.active,0,1);
  s.prior=s.angle;s.angle=s.start+(s.end-s.start)*(progress*progress*(3-2*progress));
  if(s.age>=s.windup&&old<s.windup+s.active){
   if(old<s.windup){g.audio.noise(.11,s.heavy?.07:.035,1100);g.audio.tone(s.heavy?100:170,.12,'triangle',.04,45);}
   const prior=s.start+(s.end-s.start)*(previous*previous*(3-2*previous)),x=g.player.x+10,y=g.player.y+16;
   const contact=(tx:number,ty:number,padding=16)=>{const dx=tx-x,dy=ty-y,d=Math.hypot(dx,dy),angle=Math.atan2(dy,dx);let relative=Math.atan2(Math.sin(angle-prior),Math.cos(angle-prior))*s.direction;return d<s.radius+padding&&relative>=-.28&&relative<=Math.abs(s.angle-prior)+.28;};
   const velocity=(tx:number,ty:number)=>{const a=Math.atan2(ty-y,tx-x),dx=-Math.sin(a)*s.direction*.8+Math.cos(s.aim)*.65,dy=Math.cos(a)*s.direction*.8+Math.sin(s.aim)*.65;return {vx:dx*s.force,vy:dy*s.force};};
   for(const e of g.enemies)if(!e.dead&&e.hacked<=0&&!s.hits.has(e)&&contact(e.x+10,e.y+15)&&g.lineOfSight(x,y,e.x+10,e.y+15)){s.hits.add(e);const v=velocity(e.x+10,e.y+15);this.hit(e,s.power,v.vx,s.heavy,s.heavy?v.vy:-60);s.connected=true;if(!e.dead){e.flungBy=g.id;e.flung=s.heavy?.65:.12;e.stun=s.heavy?.6:.17;}if(s.step===2){this.feedback('VOILÀ!');g.barks.request('finisher');}g.emit(e.x+10,e.y+15,15,['#ffe3a9','#d49b5e','#af7846'],210,4,.45);}
   const b=g.boss;if(b.active&&!b.dead&&b.phase===2&&!s.hits.has(b)&&contact(b.x+38,b.y+38,35)&&g.lineOfSight(x,y,b.x+38,b.y+38)){s.hits.add(b);b.hp-=s.power;s.connected=true;}
   for(const b of g.barrels)if(!b.dead&&!s.hits.has(b)&&contact(b.x+9,b.y+15)&&g.lineOfSight(x,y,b.x+9,b.y+15)){s.hits.add(b);b.hp-=s.power;if(b.hp<=0){b.owner=g.id;b.fuse=.06;}}
   // Trace the swept blade, stopping at the first wall on each ray. A tile
   // takes damage once per swing, even when several rays touch it.
   const sweep=Math.abs(s.angle-prior),rays=Math.max(1,Math.ceil(sweep*s.radius/5));
   let wallHit=false;
   for(let i=0;i<=rays;i++){
    const a=prior+(s.angle-prior)*i/rays;
    for(let r=10;r<=s.radius;r+=4){
     const tx=x+Math.cos(a)*r,ty=y+Math.sin(a)*r;
     // Horizontal dueling should chip walls, not excavate the floor under
     // both fighters. Aim down deliberately (or use Grand Slam) to dig.
     if(s.step<3&&Math.sin(s.aim)<.5&&ty>=g.player.y+32)continue;
     const tile=g.world.at(tx,ty);if(!tile)continue;
     if(!s.hits.has(tile)){
      s.hits.add(tile);const gone=g.world.damage(tx,ty,s.heavy?8:2);wallHit=true;
      g.emit(tx,ty,gone?10:5,tile.kind>=3?['#d7deed','#ac9dc4']:['#e5c39b','#a99078'],gone?160:90,3,.3);
     }
     break;
    }
   }
   if(wallHit){g.audio.impact();g.shake=Math.max(g.shake,s.heavy?4:1.5);}
   for(const bullet of g.bullets)this.deflectSwing(bullet);
  }
  if(s.age>=s.duration){if(s.step<3){if(s.step===0){this.combo=1;this.comboHits=s.connected?1:0;}else if(s.step===1){this.combo=s.connected&&this.comboHits===1?2:0;if(this.combo===2)this.feedback('FINISHER READY');}else{this.combo=0;this.comboHits=0;}this.comboLife=this.combo?1.05:0;}this.swing=null;}
 }
 cannon(){
  if(this.sonic||this.rocketFlight)return;
  const g=this.g;
  const a=g.aimAngle,side=g.shotCount%2?1:-1,x=g.player.x+10,y=g.player.y+20;
  g.bullets.push({owner:g.id,x:x+Math.cos(a)*12-Math.sin(a)*side*7,y:y+Math.sin(a)*12+Math.cos(a)*side*7,vx:Math.cos(a)*900,vy:Math.sin(a)*900,life:.85,hostile:false,power:1.5,pierce:0,boost:false,tier:0,color:'#9ceaf2',hit:new Set()});
  g.fireTimer=.13;g.lastCooldown=g.fireTimer;g.shotCount++;this.attack=.08;g.makeNoise(x,y,400);g.audio.tone(560,.06,'triangle',.03,130);
 }
 cancelLightning(){this.charge=0;this.lightning=[];this.chargeSound=0;this.fullChargeFlash=0;this.dischargeFlash=0;}
 staffTip(){const g=this.g;return mageStaffTip(g.player.x,g.player.y,g.face,g.aim,this.charge/1.15,this.attack,{strength:this.dischargeStrength,teleport:g.vertical.blinkReady?1:0,arrival:g.vertical.blinkArrival,polymorph:this.sheepGesture});}
 cast(){
  const strength=clamp(this.charge/1.15,0,1);this.dischargeStrength=strength;this.attack=.18+strength*.12;this.charge=0;
  const g=this.g,origin=this.staffTip(),aim=g.aimPoint();
  const angle=Math.atan2(aim.y-origin.y,aim.x-origin.x),range=Math.min(440,Math.hypot(aim.x-origin.x,aim.y-origin.y));
  const power=3+strength*9,enemies=g.enemies.filter(e=>!e.dead&&e.hacked<=0&&!g.claimedByOther(e));
  let end={...origin},first:Enemy|undefined;
  // Resolve the first collision along the bolt, so cover and bots in front of
  // the cursor intercept it. A small margin makes tiny targets forgiving.
  for(let d=0;d<=range;d+=3){
   end={x:origin.x+Math.cos(angle)*d,y:origin.y+Math.sin(angle)*d};
   if(g.world.at(end.x,end.y)){g.world.damage(end.x,end.y,power);g.emit(end.x,end.y,5,['#b9a3dc','#e9efff'],80,2,.2);break;}
   first=enemies.find(e=>end.x>=e.x-5&&end.x<=e.x+e.w+5&&end.y>=e.y-4&&end.y<=e.y+e.h+4);
   if(first){end={x:first.x+first.w/2,y:first.y+first.h/2};break;}
   const barrel=g.barrels.find(b=>!b.dead&&Math.abs(b.x+9-end.x)<12&&Math.abs(b.y+15-end.y)<17);
   if(barrel){barrel.hp-=power;if(barrel.hp<=0){barrel.owner=g.id;barrel.fuse=barrel.fuse||.06;}break;}
   const boss=g.boss;if(boss.active&&!boss.dead&&Math.abs(boss.x+38-end.x)<38&&Math.abs(boss.y+38-end.y)<38){if(boss.phase===2)boss.hp-=power;break;}
  }
  const arc=(from:{x:number;y:number},to:{x:number;y:number},root=false)=>this.lightning.push({x:from.x,y:from.y,tx:to.x,ty:to.y,life:.16+strength*.18,strength,root,seed:g.shotCount+this.lightning.length*7});
  arc(origin,end,true);
  const visited=new Set<Enemy>();
  const strike=(e:Enemy)=>{visited.add(e);this.hit(e,power,Math.sign(e.x-g.player.x)*strength*120,false,-strength*95);if(!e.dead)e.stun=.08+strength*.18;g.emit(e.x+10,e.y+12,7,['#f9ffff','#9cddff','#b986ff'],120,2,.23);};
  if(first){
   strike(first);
   // Each third of the held charge adds a hop on release. No bot can
   // be hit twice by a single discharge.
   for(let hop=0;hop<Math.floor(strength*3+.001);hop++){
    const next=enemies.filter(e=>!e.dead&&!visited.has(e)&&Math.hypot(e.x+e.w/2-end.x,e.y+e.h/2-end.y)<150&&g.lineOfSight(end.x,end.y,e.x+e.w/2,e.y+e.h/2)).sort((a,b)=>Math.hypot(a.x+a.w/2-end.x,a.y+a.h/2-end.y)-Math.hypot(b.x+b.w/2-end.x,b.y+b.h/2-end.y))[0];
    if(!next)break;const to={x:next.x+next.w/2,y:next.y+next.h/2};arc(end,to);strike(next);end=to;
   }
  }
  g.fireTimer=.18+strength*.18;g.lastCooldown=g.fireTimer;g.shotCount++;this.attack=.18+strength*.12;this.charge=0;this.chargeSound=0;this.fullChargeFlash=0;this.dischargeFlash=.25;this.dischargeStrength=strength;
  g.makeNoise(origin.x,origin.y,480);g.audio.noise(.07+strength*.12,.03+strength*.03,2400);g.audio.tone(650+strength*330,.09+strength*.12,'sawtooth',.02+strength*.015,120);g.emit(origin.x,origin.y,4+Math.floor(strength*10),['#f2ffff','#b691ff','#91deff'],75+strength*100,2,.25);
  g.audio.tone(105+strength*55,.12+strength*.16,'sine',.025+strength*.045,38);if(strength>.9)g.audio.tone(1400,.12,'triangle',.03,320);
  g.shake=Math.max(g.shake,.5+strength*3);if(g.effects&&visited.size)g.freeze=Math.max(g.freeze,.015+strength*.035);
 }
 drawLightning(){
  const g=this.g,c=g.c,p=g.player,tip=this.staffTip();
  if(this.charge>0){
   const t=clamp(this.charge/1.15,0,1),full=t>=.999,x=p.x+10-g.cam,y=p.y-38;
   c.save();const flash=this.fullChargeFlash/.3;
   text(c,full?'FULL CHARGE':`CHARGE · ${1+Math.floor(t*3+.001)} TARGET${t>=1/3?'S':''}`,x,y-9,full?'#f1ffff':'#d6c3ff',full?9:7,'center');
   rect(c,x-24,y,48,3,'#39334e');rect(c,x-24,y,48*t,3,full?'#f3ffff':'#bd9aff');rect(c,x-24+48*t-1,y-1,2,5,'#eeefff');
   for(let i=1;i<=3;i++){const ready=t>=i/3;rect(c,x-24+i*16-2,y+7,4,3,ready?'#dcecff':'#625472');}
   if(flash>0){c.globalAlpha=flash;for(const side of [-1,1]){rect(c,x+side*(29+(1-flash)*13)-3,y,6,2,'#eefaff');rect(c,x+side*(22+(1-flash)*7),y-6-(1-flash)*5,2,3,'#c5adff');}c.globalAlpha=1;}
   // Energy is drawn inward, toward the actual gem, rather than a floating orb.
   for(let i=0;i<10;i++){const phase=(g.time*(.8+t)+i/10)%1,a=i*2.4+g.time*.6,dist=(1-phase)*(20+t*23)+5;
    c.globalAlpha=phase*(.35+t*.6);c.strokeStyle=i%2?'#e6d5ff':'#8de9ff';c.lineWidth=1+t;
    c.beginPath();c.moveTo(tip.x-g.cam+Math.cos(a)*dist,tip.y+Math.sin(a)*dist);c.lineTo(tip.x-g.cam+Math.cos(a+.08)*(dist+5),tip.y+Math.sin(a+.08)*(dist+5));c.stroke();}
   c.restore();
  }
  if(this.dischargeFlash>0){const t=1-this.dischargeFlash/.25;c.save();c.globalAlpha=(1-t)*.65;c.strokeStyle='#e9e4ff';c.lineWidth=2*(1-t)+1;c.beginPath();const arc=this.lightning.find(a=>a.root),x=(arc?.x??tip.x)-g.cam,y=arc?.y??tip.y;c.arc(x,y,5+t*(12+this.dischargeStrength*25),0,Math.PI*2);c.stroke();c.restore();}
  for(const arc of this.lightning){
   const from=arc.root?tip:arc,dx=arc.tx-from.x,dy=arc.ty-from.y,len=Math.max(1,Math.hypot(dx,dy)),steps=Math.max(2,Math.ceil(len/12)),phase=Math.floor(g.time*35);
   const points=[{x:from.x-g.cam,y:from.y}];
   for(let i=1;i<steps;i++){const t=i/steps,noise=Math.sin(i*127.1+phase*311.7+arc.seed*74.7)*43758.5453,jitter=((noise-Math.floor(noise))*2-1)*(5+arc.strength*10)*Math.sin(t*Math.PI);points.push({x:from.x+dx*t-dy/len*jitter-g.cam,y:from.y+dy*t+dx/len*jitter});}
   points.push({x:arc.tx-g.cam,y:arc.ty});c.save();c.lineJoin='bevel';
   for(const [width,color,alpha] of [[9+arc.strength*5,'#9760fa',.14],[3+arc.strength,'#aaa5ff',.8],[1.3,'#efffff',1]] as const){c.lineWidth=width;c.strokeStyle=color;c.globalAlpha=alpha*Math.min(1,arc.life/.1);c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke();}
   c.globalAlpha=Math.min(1,arc.life/.12);c.strokeStyle='#dbd3ff';c.lineWidth=1;
   for(let i=2;i<points.length-1;i+=4){const p=points[i],side=i%3?1:-1;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x-dy/len*9*side-dx/len*4,p.y+dx/len*9*side-dy/len*4);c.lineTo(p.x-dy/len*15*side,p.y+dx/len*15*side);c.stroke();}
   c.restore();
  }
 }
 fireInput(dt:number,firing:boolean){
  const g=this.g;if(this.shield?.kind===0||this.special>0&&this.specialForm!==2)return;
  if(this.form===1){
   if(firing&&g.fireTimer<=0){
    const old=this.charge;this.charge=Math.min(1.15,this.charge+dt);const strength=this.charge/1.15;
    if(this.chargeSound<=0&&strength<1){g.audio.tone(220+strength*700,.13,'sine',.016+strength*.01,300+strength*800);this.chargeSound=.11;}
    if(Math.floor(old/(1.15/3))<Math.floor(this.charge/(1.15/3)))g.audio.tone(420+this.charge*400,.1,'triangle',.025,750+this.charge*400);
    if(old<1.15&&this.charge>=1.15){this.fullChargeFlash=.3;const tip=this.staffTip();g.emit(tip.x,tip.y,16,['#fbffff','#c7a8ff','#9beeff'],130,2,.3);g.audio.tone(880,.2,'triangle',.04,880);g.audio.tone(1320,.24,'sine',.035,1760);g.audio.noise(.06,.025,4200);}
   }
   if(!firing&&this.charge>0)this.cast();
   return;
  }
  if(!firing||g.fireTimer>0)return;
  if(this.form===2)this.cannon();else{if(this.comboLife<=0){this.combo=0;this.comboHits=0;}this.melee();g.fireTimer=this.swing!.duration;g.lastCooldown=g.fireTimer;g.shotCount++;}
 }
 pressDefense(){if(this.form===0&&this.shield){this.releaseDefense();return false;}return this.defend();}
 defend(){
  const g=this.g;if(this.shieldBroken||this.shieldHP<=0||g.state!=='playing'||this.form===0&&!g.player.grounded)return false;
  if(this.shield)return true;
  this.shield={x:g.player.x+10,y:g.player.y+16,kind:this.form,life:999,age:0,hits:Math.ceil(this.shieldHP/20),angle:g.aimAngle,flash:0,pushed:new Set()};
  if(this.form===0){this.swing=null;this.combo=0;g.player.vx=0;g.player.vy=0;}g.audio.tone(380,.12,'triangle',.035,640);return true;
 }
 bubbleRadius(age=this.shield?.age??0){const t=clamp(age/.18,0,1);return 56*(1-(1-t)*(1-t));}
 expandBubble(){
  const g=this.g,s=this.shield;if(!s||s.kind!==1)return;
  const x=g.player.x+10,y=g.player.y+16,r=this.bubbleRadius();
  const push=(body:{x:number;y:number;w:number;h:number;vx:number;vy:number;grounded:boolean},force:number)=>{
   const dx=body.x+body.w/2-x,dy=body.y+body.h/2-y,d=Math.hypot(dx,dy);
   if(s.pushed.has(body)||d>r+Math.min(body.w,body.h)/2||!g.lineOfSight(x,y,body.x+body.w/2,body.y+body.h/2))return false;
   s.pushed.add(body);const a=d>1?Math.atan2(dy,dx):g.aimAngle;body.vx=Math.cos(a)*force;body.vy=Math.sin(a)*force-95;body.grounded=false;g.emit(body.x+body.w/2,body.y+body.h/2,6,['#dbc8ff','#eafaff'],90,2,.2);return true;
  };
  for(const e of g.enemies)if(!e.dead&&e.hacked<=0&&!g.claimedByOther(e)&&push(e,310)){e.stun=Math.max(e.stun,.22);e.wind=0;e.flung=.3;e.flungBy=g.id;}
  for(const b of g.barrels)if(!b.dead&&push(b,240)){b.mobile=true;b.owner=g.id;}
  for(const b of g.grenades)if(!s.pushed.has(b)&&Math.hypot(b.x-x,b.y-y)<r+4&&g.lineOfSight(x,y,b.x,b.y)){s.pushed.add(b);const a=Math.atan2(b.y-y,b.x-x);b.vx=Math.cos(a)*340;b.vy=Math.sin(a)*340-90;b.owner=g.id;}
  // Catch shots swept up by the growing rim even before they move this frame.
  for(const b of g.bullets)if(b.hostile&&b.life>0&&Math.hypot(b.x-x,b.y-y)<=r&&g.lineOfSight(x,y,b.x,b.y))this.reflectBubble(b);
 }
 reflectBubble(b:Game['bullets'][number]){
  const g=this.g;if(!this.shield)return;
  const a=Math.atan2(b.y-g.player.y-16,b.x-g.player.x-10),v=reflect(b.vx,b.vy,a),speed=Math.max(350,Math.hypot(b.vx,b.vy));
  const outward=v.vx*Math.cos(a)+v.vy*Math.sin(a)>0;b.vx=outward?v.vx:Math.cos(a)*speed;b.vy=outward?v.vy:Math.sin(a)*speed;
  b.hostile=false;b.owner=g.id;b.hit.clear();b.life=Math.max(.7,b.life);b.color='#dbc4ff';b.power=Math.max(2,b.power);this.drainShield(20);
  g.emit(b.x,b.y,12,['#ffffff','#c3b0ff','#9feaff'],180,2,.25);g.audio.tone(1050,.09,'triangle',.04,540);g.shake=Math.max(g.shake,1.5);
 }
 releaseDefense(){this.shield=null;}
 drainShield(amount:number){
  // HP is stored as a percentage across forms; the bunker has 200 effective HP.
  if(this.shield?.kind===0)amount*=.5;
  this.shieldHP=Math.max(0,this.shieldHP-amount);this.shieldHit=.2;
  if(this.shield){this.shield.flash=.13;this.shield.hits=Math.ceil(this.shieldHP/20);}
  if(this.shieldHP<=0){this.shield=null;this.shieldBroken=true;this.qCooldown=5;this.feedback('SHIELD BROKEN');this.g.audio.noise(.14,.05,1900);}
 }
 deflectSwing(b:Game['bullets'][number]){
  const s=this.swing,g=this.g;
  if(this.form!==0||!s||!b.hostile||b.life<=0||s.age<s.windup||s.age>=s.windup+s.active)return false;
  const x=g.player.x+10,y=g.player.y+16,dx=b.x-x,dy=b.y-y,d=Math.hypot(dx,dy),a=Math.atan2(dy,dx);
  const relative=Math.atan2(Math.sin(a-s.prior),Math.cos(a-s.prior))*s.direction;
  if(d<10||d>s.radius+5||relative<-.2||relative>Math.abs(s.angle-s.prior)+.2||dx*b.vx+dy*b.vy>=0||!g.lineOfSight(x,y,b.x,b.y))return false;
  const v=reflect(b.vx,b.vy,a);b.vx=v.vx;b.vy=v.vy;b.hostile=false;b.owner=this.g.id;b.hit.clear();b.power=Math.max(2,b.power);b.tier=Math.max(1,b.tier??0);b.life=Math.max(.7,b.life);b.color='#ffe0a1';
  g.emit(b.x,b.y,12,['#fff5d2','#ffd17e','#c7a0ff'],190,3,.25);g.rings.push({x:b.x,y:b.y,r:2,max:14,life:.14,color:'#fff0bc'});
  g.audio.tone(1050,.08,'triangle',.045,430);g.shake=Math.max(g.shake,1.5);if(g.effects)g.freeze=Math.max(g.freeze,.025);
  return true;
 }
 intercept(b:Game['bullets'][number],from:{x:number;y:number}){
  if(this.deflectSwing(b))return true;
  const s=this.shield,g=this.g;if(!s||!b.hostile||b.life<=0)return false;const x=g.player.x+10,y=g.player.y+16,r=this.bubbleRadius();
  if(s.kind===1){
   if(Math.hypot(from.x-x,from.y-y)<r)return false;
   // Swept segment/circle contact catches fast shots that cross the entire bubble.
   const dx=b.x-from.x,dy=b.y-from.y,fx=from.x-x,fy=from.y-y,A=dx*dx+dy*dy,B=2*(fx*dx+fy*dy),C=fx*fx+fy*fy-r*r,D=B*B-4*A*C;
   if(A<1e-8||D<0)return false;const t=(-B-Math.sqrt(D))/(2*A);if(t<0||t>1)return false;
   b.x=from.x+dx*t;b.y=from.y+dy*t;
   if(s.age<.18){this.reflectBubble(b);return true;}
  }
  else if(s.kind===2){s.angle=g.aimAngle;if(!shieldCrossing(from,b,{x:x+Math.cos(s.angle)*27,y:y+Math.sin(s.angle)*27,angle:s.angle,half:34}))return false;}
  else{const inside=(p:{x:number;y:number})=>Math.abs(p.x-s.x)<31&&p.y>s.y-78&&p.y<s.y+17;if(inside(from)||!inside(b))return false;}
  b.life=0;this.drainShield(20*Math.max(1,b.power));g.emit(b.x,b.y,10,['#d4b3ff','#eef2ff'],130,3,.25);g.audio.tone(560,.07,'triangle',.035,260);return true;
 }
 protects(p:{x:number;y:number;w:number;h:number}){
  const s=this.shield;if(!s)return false;const x=p.x+p.w/2,y=p.y+p.h/2;
  if(p===this.g.player)return true;
  if(s.kind===1)return Math.hypot(x-this.g.player.x-10,y-this.g.player.y-16)<this.bubbleRadius();
  if(s.kind===0)return Math.abs(x-s.x)<31&&y>s.y-78&&y<s.y+17;
  return false;
 }
 absorbBlast(x:number,y:number){
  const s=this.shield;if(!s)return false;const dx=x-this.g.player.x-10,dy=y-this.g.player.y-16;
  if(s.kind===1&&Math.hypot(dx,dy)<this.bubbleRadius()||s.kind===2&&dx*Math.cos(this.g.aimAngle)+dy*Math.sin(this.g.aimAngle)<25||s.kind===0&&Math.abs(x-s.x)<31&&y>s.y-78&&y<s.y+17)return false;
  this.drainShield(45);return true;
 }
 blockContact(e:Enemy){
  if(!this.shield)return false;
  if(this.shield.kind===1&&Math.hypot(e.x+e.w/2-this.g.player.x-10,e.y+e.h/2-this.g.player.y-16)>this.bubbleRadius()+10)return false;
  if(this.shield.kind===2&&(e.x-this.g.player.x)*Math.cos(this.g.aimAngle)+(e.y-this.g.player.y)*Math.sin(this.g.aimAngle)<0)return false;
  if(this.contactGrace<=0){this.drainShield(20);this.contactGrace=.35;const a=Math.atan2(e.y-this.g.player.y,e.x-this.g.player.x);this.hit(e,0,Math.cos(a)*210,false,-100);}
  return true;
 }
 ultimate(){
  if(this.form===2&&(this.sonic||this.rocketFlight))return false;
  const g=this.g;if(this.shield?.kind===0||this.fCooldown>0||g.state!=='playing')return false;g.updateAim();this.fCooldown=this.form===2?9:18;this.specialForm=this.form;this.specialAngle=g.aimAngle;this.special=this.form===2?.3:this.form===1?.85:.65;this.slamDone=false;this.cancelLightning();this.shield=null;if(this.form===0)this.melee(true);
  if(this.form===2){
   const a=g.aimAngle,x=g.player.x+10,y=g.player.y+20;
   this.rocket={x,y,angle:a,speed:380,life:1.8,trail:[]};this.rocketKick=.28;
   g.player.vx-=Math.cos(a)*105;g.player.vy-=Math.sin(a)*85;
   g.emit(x+Math.cos(a)*20,y+Math.sin(a)*20,18,['#fff1c6','#ffb566','#befaff'],180,3,.3);
   g.makeNoise(x,y,900);g.shake=Math.max(g.shake,4);g.audio.noise(.2,.07,650);g.audio.tone(100,.28,'sawtooth',.045,45);
  }
  if(this.form===1){const p=g.aimPoint(),x=g.player.x+10,y=g.player.y+16,dx=p.x-x,dy=p.y-y,d=Math.max(1,Math.hypot(dx,dy)),k=Math.min(1,440/d);const tx=x+dx*k,ty=y+dy*k;this.meteor={x:tx,y:Math.max(-40,ty-360),targetY:ty,life:1.2};}
  g.barks.request((['duelistSpecial','mageSpecial','pilotSpecial'] as const)[this.form]);this.feedback(this.fName);g.audio.tone(130,.3,'sawtooth',.055,640);return true;
 }
 secondary(){
  if(this.form===2&&(this.sonic||this.rocketFlight))return false;
  const g=this.g;if(this.eCooldown>0||g.state!=='playing')return false;
  if(this.form===0)return this.pair();
  if(this.form===2){this.bombs.push({x:g.player.x+10,y:g.player.y+30,vy:30,life:5});this.eCooldown=2.8;g.audio.tone(210,.11,'triangle',.035,90);return true;}
  g.updateAim();const p=g.aimPoint(),e=g.enemies.filter(e=>!e.dead&&!g.claimedByOther(e)&&e.hacked<=0&&!e.sheep&&Math.hypot(e.x+10-p.x,e.y+15-p.y)<44&&Math.hypot(e.x-g.player.x,e.y-g.player.y)<400&&g.lineOfSight(g.player.x+10,g.player.y+16,e.x+10,e.y+15)).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
  if(!e){this.feedback('AIM AT A BOT');return false;}
  this.sheepGesture=.4;const tip=this.staffTip();this.eCooldown=5.5;
  this.polymorph={target:e,x:tip.x,y:tip.y,fromX:tip.x,fromY:tip.y,age:0,duration:.16+Math.hypot(e.x+10-tip.x,e.y+15-tip.y)/1600,impact:false,trail:[]};
  g.emit(tip.x,tip.y,10,['#efe6ff','#fff1cf','#bd92ec'],80,2,.25);g.audio.tone(720,.15,'sine',.035,1350);g.audio.tone(1080,.11,'triangle',.02,1600);return true;
 }
 updatePolymorph(dt:number){
  this.sheepGesture=Math.max(0,this.sheepGesture-dt);const m=this.polymorph;if(!m)return;const g=this.g,e=m.target;m.age+=dt;
  if(e.dead||e.hacked>0||g.claimedByOther(e)){this.polymorph=null;return;}
  if(m.impact){m.x=e.x+e.w/2;m.y=e.y+e.h/2;if(m.age>.42)this.polymorph=null;return;}
  const t=Math.min(1,m.age/m.duration),x=m.fromX+(e.x+e.w/2-m.fromX)*t,y=m.fromY+(e.y+e.h/2-m.fromY)*t-Math.sin(t*Math.PI)*22;
  const steps=Math.max(1,Math.ceil(Math.hypot(x-m.x,y-m.y)/3));
  for(let i=1;i<=steps;i++)if(g.world.at(m.x+(x-m.x)*i/steps,m.y+(y-m.y)*i/steps)){g.emit(m.x,m.y,8,['#baa1da','#f4eaff'],65,2,.25);this.polymorph=null;return;}
  m.trail.push({x:m.x,y:m.y});if(m.trail.length>13)m.trail.shift();m.x=x;m.y=y;
  if(t>=1){
   e.sheep=6;e.wind=0;e.dash=0;e.cool=1;e.stun=0;e.vx=0;e.vy=0;m.impact=true;m.age=0;
   g.emit(m.x,m.y,28,['#ead9ff','#fff4dd','#bd92ec'],155,4,.45);g.rings.push({x:m.x,y:m.y,r:4,max:32,life:.22,color:'#e6caff'});
   g.audio.tone(580,.18,'triangle',.045,190);g.audio.tone(290,.22,'sine',.04,420);g.barks.request('sheep');
  }
 }
 drawPolymorphEnemy(e:Enemy){
  const m=this.polymorph;if(!m?.impact||m.target!==e||!e.sheep)return false;
  const g=this.g,c=g.c,t=Math.min(1,m.age/.32),bounce=Math.sin(t*Math.PI)*Math.exp(-t*2),x=e.x+e.w/2-g.cam,y=e.y+e.h;
  c.save();c.translate(x,y);c.scale(1+bounce*.45,1-bounce*.35);sheep(c,-10,-30,g.time,e.face);c.restore();return true;
 }
 drawPolymorph(){
  const m=this.polymorph;if(!m)return;const g=this.g,c=g.c,x=m.x-g.cam,y=m.y;c.save();
  if(!m.impact){
   m.trail.forEach((p,i)=>{c.globalAlpha=(i+1)/m.trail.length*.55;c.fillStyle=i%2?'#c69bed':'#fff1d8';c.beginPath();c.arc(p.x-g.cam,p.y,1.5+i/m.trail.length*3,0,Math.PI*2);c.fill();});
   c.globalAlpha=1;c.fillStyle='#ba8cff44';c.beginPath();c.arc(x,y,12,0,Math.PI*2);c.fill();
   for(let i=0;i<5;i++){const a=i*Math.PI*2/5+g.time*12;c.fillStyle=i%2?'#fff5e2':'#dabdfa';c.beginPath();c.arc(x+Math.cos(a)*4,y+Math.sin(a)*4,3.5,0,Math.PI*2);c.fill();}
   rect(c,x-2,y-2,4,4,'#ffffff');
  }else{
   const t=m.age/.42;c.globalAlpha=(1-t)*.8;
   for(let i=0;i<8;i++){const a=i*Math.PI/4,r=9+t*33;c.fillStyle=i%2?'#fff3df':'#d3b4eb';c.beginPath();c.arc(x+Math.cos(a)*r,y+Math.sin(a)*r*.7,Math.max(1,(1-t)*8),0,Math.PI*2);c.fill();}
   c.globalAlpha=1-t;c.strokeStyle='#fff2ce';c.lineWidth=1.5;for(let i=0;i<4;i++){const a=i*Math.PI/2+.4,px=x+Math.cos(a)*(20+t*22),py=y+Math.sin(a)*(20+t*22);c.beginPath();c.moveTo(px-3,py);c.lineTo(px+3,py);c.moveTo(px,py-3);c.lineTo(px,py+3);c.stroke();}
  }c.restore();
 }
 pair(){
  const g=this.g;if(this.form!==0||this.eCooldown>0||this.pairing||g.state!=='playing')return false;g.updateAim();const p=g.aimPoint();
  const e=g.enemies.filter(e=>!e.dead&&!g.claimedByOther(e)&&e.hacked<=0&&Math.hypot(e.x+10-p.x,e.y+15-p.y)<42&&Math.hypot(e.x-g.player.x,e.y-g.player.y)<380).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
  if(!e){this.feedback('AIM AT A BOT');return false;}this.pairing=e;this.pairTime=.35;this.feedback('PAIRING…');g.audio.tone(660,.08,'sine',.025,900);return true;
 }
 disconnect(){if(this.paired){this.paired.hacked=0;this.paired.cool=.7;this.paired.wind=0;this.paired.stun=Math.max(this.paired.stun,.2);}this.paired=null;this.pairing=null;this.remoteTime=0;this.remoteJumpHeld=false;this.remoteSpaceHeld=false;this.remoteLadder=null;this.remoteOverclock=false;}
 remoteUpdate(dt:number){
  const g=this.g;if(this.pairing){const e=this.pairing;if(e.dead||Math.hypot(e.x-g.player.x,e.y-g.player.y)>400){this.pairing=null;this.feedback('PAIR LOST');}
   else{this.pairTime-=dt;if(this.pairTime<=0){if(g.peers.some(a=>a!==g&&(a.dimillianKit.paired===e||a.pidalfKit.controls(e)||a.marcusKit.pacman.controls(e)))){this.pairing=null;return;}this.disconnect();this.paired=e;e.hacked=1;e.wind=0;e.stun=0;this.remoteTime=1;this.remoteJumpHeld=g.keys.has('Space')||g.keys.has('KeyW')||g.keys.has('ArrowUp');this.eCooldown=10;this.remoteShot=.1;this.feedback('REMOTE CONNECTED');g.barks.request('paired');g.audio.tone(900,.14,'sine',.04,1200);}}
  }
  const e=this.paired;if(!e)return;this.remoteShot-=dt;
  if(e.dead||e.y>1020||Math.hypot(e.x-g.player.x,e.y-g.player.y)>1200){this.disconnect();this.feedback('DISCONNECTED');return;}
  e.hacked=1;e.wind=0;e.cool=99;e.hurt=Math.max(0,e.hurt-dt);e.stun=Math.max(0,e.stun-dt);
  const driving=this.remoteDriving,space=g.keys.has('Space'),climbUp=g.keys.has('KeyW')||g.keys.has('ArrowUp'),up=space||climbUp,down=g.keys.has('KeyS')||g.keys.has('ArrowDown');
  if(driving&&!this.remoteOverclock){g.emit(e.x+e.w/2,e.y+e.h/2,18,['#b6edff','#ba94ff','#f4ffff'],130,2,.35);g.audio.tone(260,.18,'triangle',.035,980);}
  this.remoteOverclock=driving;this.remoteSpark-=dt;
  if(driving&&this.remoteSpark<=0){this.remoteSpark=.08;g.emit(e.x+e.w/2,e.y+e.h/2,2,['#b6edff','#ba94ff'],35,2,.24);}
  if(!driving)this.remoteLadder=null;
  const followX=g.player.x-g.face*55,delta=followX-e.x;
  let dir=driving?Number(g.keys.has('KeyD')||g.keys.has('ArrowRight'))-Number(g.keys.has('KeyA')||g.keys.has('ArrowLeft')):Math.abs(delta)>35?Math.sign(delta):0;
  if(driving&&Math.hypot(e.x-g.player.x,e.y-g.player.y)>1000&&dir*Math.sign(e.x-g.player.x)>0)dir=0;
  if(e.type==='drone'){
   e.vx+=(dir*(driving?285:190)-e.vx)*Math.min(1,dt*12);
   const targetY=driving?(Number(down)-Number(up))*260:clamp((g.player.y-45-e.y)*3,-160,160);e.vy+=(targetY-e.vy)*Math.min(1,dt*12);g.world.move(e,dt);
  }else{
   if(driving&&this.remoteLadder===null&&!dir&&(climbUp||down)){
    const index=LADDERS.findIndex(l=>Math.abs(e.x+e.w/2-l.x)<22&&e.y+e.h>=l.top-2&&e.y+e.h<=l.bottom+5&&(climbUp?e.y+e.h>l.top+1:e.y+e.h<l.bottom-1));
    if(index>=0)this.remoteLadder=index;
   }
   if(this.remoteLadder!==null&&(dir||space&&!this.remoteSpaceHeld)){
    this.remoteLadder=null;e.grounded=false;if(space&&!this.remoteSpaceHeld)e.vy=-530;
   }
   if(this.remoteLadder!==null){
    const l=LADDERS[this.remoteLadder];e.x=l.x-e.w/2;e.y=clamp(e.y+(Number(down)-Number(climbUp))*200*dt,l.top-e.h,l.bottom-e.h);e.vx=0;e.vy=0;e.grounded=false;
    if(e.y<=l.top-e.h&&climbUp||e.y>=l.bottom-e.h&&down){this.remoteLadder=null;e.grounded=!!g.world.at(e.x+e.w/2,e.y+e.h+1);}
   }else{
    const grounded=e.grounded,obstacle=!!g.world.at(e.x+e.w/2+dir*(e.w/2+5),e.y+e.h-8);
    if(!driving&&dir&&grounded&&!g.world.at(e.x+e.w/2+dir*(e.w/2+8),e.y+e.h+6)&&g.player.y<e.y+35)dir=0;
    e.vx+=clamp(dir*(driving?285:180)-e.vx,-2000*dt,2000*dt);
    if(grounded&&(driving?up&&!this.remoteJumpHeld:dir!==0&&(obstacle||g.player.y<e.y-45)))e.vy=driving?-530:-490;
    e.vy=Math.min(650,e.vy+1400*dt);g.world.move(e,dt);
   }
  }
  this.remoteSpaceHeld=space;
  this.remoteJumpHeld=up;
  const firing=g.pointer.down||g.keys.has('KeyJ')||g.pendingShot>0,cursor=g.aimPoint();
  const enemy=g.enemies.filter(o=>o!==e&&!o.dead&&o.hacked<=0&&!g.claimedByOther(o)&&Math.hypot(o.x-e.x,o.y-e.y)<360&&g.lineOfSight(e.x+e.w/2,e.y+e.h/2,o.x+o.w/2,o.y+o.h/2)).sort((a,b)=>Math.hypot(a.x-e.x,a.y-e.y)-Math.hypot(b.x-e.x,b.y-e.y))[0];
  const aim=driving||firing||!enemy?cursor:{x:enemy.x+enemy.w/2,y:enemy.y+enemy.h/2},a=Math.atan2(aim.y-e.y-e.h/2,aim.x-e.x-e.w/2);e.look=a;e.face=Math.cos(a)>=0?1:-1;
  if(this.remoteShot<=0&&(firing||!driving&&enemy)&&g.lineOfSight(e.x+e.w/2,e.y+e.h/2,aim.x,aim.y)){
    this.remoteShot=(e.type==='turret'?.38:.65)*(driving?.55:1);
    if(e.type==='runner'){for(const o of g.enemies)if(o!==e&&Math.hypot(o.x-e.x,o.y-e.y)<65&&g.lineOfSight(e.x+10,e.y+15,o.x+10,o.y+15))this.hit(o,driving?6:3,e.face*(driving?380:230),true);}
    else for(const spread of e.type==='drone'?[-.08,0,.08]:[0])g.bullets.push({owner:g.id,x:e.x+e.w/2,y:e.y+e.h/2,vx:Math.cos(a+spread)*620,vy:Math.sin(a+spread)*620,life:1,hostile:false,power:(e.type==='turret'?3:2)*(driving?1.75:1),pierce:0,boost:false,tier:driving?2:1,color:driving?'#c4f2ff':'#c9a4ff',hit:new Set([e])});
    if(driving)g.emit(e.x+e.w/2+Math.cos(a)*15,e.y+e.h/2+Math.sin(a)*15,6,['#ecffff','#a4daff','#c2a2ff'],120,2,.18);
    g.audio.tone(driving?720:460,.07,'triangle',driving?.035:.025,170);g.makeNoise(e.x,e.y,330,e);
  }

 }
 resetFlight(){this.forwardRun=0;this.forwardFace=0;this.sonic=false;this.sonicFlash=0;this.rocketFlight=false;this.flightBlend=0;this.flightSpeed=0;this.ramSpent=false;this.ramHits.clear();}
 fly(dt:number,dir:number,predicting=false){
  const g=this.g,p=g.player;g.climb=null;g.zip=false;g.wallGrip=0;g.wallGrace=0;g.jumpBuffer=0;g.coyote=0;
  const up=g.keys.has('Space')||g.keys.has('KeyW')||g.keys.has('ArrowUp'),down=g.keys.has('KeyS')||g.keys.has('ArrowDown');
  const vy=(down?1:0)-(up?1:0),diagonal=dir&&vy?Math.SQRT1_2:1,oldX=p.vx,oldY=p.vy;
  this.sonicFlash=Math.max(0,this.sonicFlash-dt);
  // Keep the original thrust key while steering through a turn. Mouse-facing
  // flips must not silently change which held key propels rocket flight.
  if(this.rocketFlight&&dir!==this.forwardFace){this.rocketFlight=false;this.forwardRun=0;this.forwardFace=0;this.ramHits.clear();}
  if(this.rocketFlight){
   this.forwardRun=Math.min(1.25,this.forwardRun+dt);
   const aim=g.aimPoint(),target=Math.atan2(aim.y-p.y-20,aim.x-p.x-10),delta=Math.atan2(Math.sin(target-this.flightAngle),Math.cos(target-this.flightAngle));
   this.flightAngle+=clamp(delta,-3.8*dt,3.8*dt);this.flightSpeed=Math.min(620,this.flightSpeed+900*dt);
   p.vx=Math.cos(this.flightAngle)*this.flightSpeed;p.vy=Math.sin(this.flightAngle)*this.flightSpeed;
  }else{
   const forward=dir===g.face;
   if(forward){
    if(this.forwardFace!==g.face){this.forwardRun=0;this.ramHits.clear();if(this.flightBlend<.01)p.vx=g.face*Math.max(270*diagonal,p.vx*g.face);}
    this.forwardFace=g.face;this.forwardRun=Math.min(1.25,this.forwardRun+dt);
   }else{this.forwardRun=0;this.forwardFace=0;this.ramHits.clear();}
   const spool=this.forwardRun/1.25,speed=forward?270+350*(1-Math.pow(1-spool,1.4)):205;
   p.vx+=clamp(dir*speed*diagonal-p.vx,-1900*dt,1900*dt);p.vy+=clamp(vy*245*diagonal-p.vy,-1500*dt,1500*dt);
   const flat=g.face>0?0:Math.PI;
   if(this.flightBlend<=.001)this.flightAngle=flat;
   else this.flightAngle+=clamp(Math.atan2(Math.sin(flat-this.flightAngle),Math.cos(flat-this.flightAngle)),-7*dt,7*dt);
   if(forward&&this.forwardRun>=.55&&p.vx*g.face/diagonal>420){
    this.rocketFlight=true;this.flightSpeed=Math.hypot(p.vx,p.vy);this.flightAngle=Math.atan2(p.vy,p.vx);
    if(!predicting){g.audio.tone(220,.22,'triangle',.035,680);g.emit(p.x+10,p.y+20,10,['#e6ffff','#a1d7f0'],90,2,.25);}
   }
  }
  this.flightBlend=clamp(this.flightBlend+(this.rocketFlight?dt/ .24:-dt/ .32),0,1);
  const spool=this.forwardRun/1.25,ax=(p.vx-oldX)*g.face/Math.max(dt,.001),ay=(p.vy-oldY)/Math.max(dt,.001);
  const target=this.rocketFlight?{forward:1.3,reverse:0,up:0,down:0}:{forward:Math.max(dir===g.face?.7+spool*.6:0,clamp(ax/1900,0,1)),reverse:Math.max(dir===-g.face?.7:0,clamp(-ax/1900,0,1)),up:Math.max(vy<0?.85:0,clamp(-ay/1500,0,1)),down:Math.max(vy>0?.8:0,clamp(ay/1500,0,1))};
  for(const key of ['forward','reverse','up','down'] as const)this.thrusters[key]+=(target[key]-this.thrusters[key])*Math.min(1,dt*18);
  this.boosting=!!(dir||vy);
  const sonic=this.rocketFlight||dir===g.face&&this.forwardRun>=.38&&p.vx*g.face/diagonal>390;
  if(sonic&&!this.sonic&&!predicting){this.sonicFlash=.32;g.audio.noise(.13,.05,950);g.audio.tone(130,.2,'triangle',.04,50);g.makeNoise(p.x,p.y,700);g.emit(p.x+10+Math.cos(this.flightAngle)*30,p.y+20+Math.sin(this.flightAngle)*30,12,['#d2faff','#ffffff','#8dc9e9'],130,2,.25);}
  this.sonic=sonic;
  if(sonic&&!predicting)this.ram(dt);
  const intendedX=p.vx,intendedY=p.vy,wall=g.world.move(p,dt);
  if(wall||this.rocketFlight&&(Math.abs(intendedX)>1&&p.vx===0||Math.abs(intendedY)>1&&p.vy===0)){
   if(sonic&&!predicting)this.ramSpent=true;
   this.forwardRun=0;this.sonic=false;this.sonicFlash=0;this.rocketFlight=false;
  }
  if(p.y<0){p.y=0;p.vy=Math.max(0,p.vy);this.rocketFlight=false;this.forwardRun=0;this.sonic=false;}
  if(this.ramSpent&&!predicting)this.finishRam();
 }
 ram(dt:number){
  const g=this.g,p=g.player,speed=Math.hypot(p.vx,p.vy),nx=this.rocketFlight?Math.cos(this.flightAngle):g.face,ny=this.rocketFlight?Math.sin(this.flightAngle):0;
  const strength=clamp((speed-390)/230,0,1),power=6+strength*6;
  // Sweep the nose before movement. Cover gives way, reinforced walls stop
  // the hull, and each victim takes only one ram hit during a continuous run.
  const steps=Math.max(1,Math.ceil(speed*dt/4));let touched=false,remaining=speed;
  const spendMomentum=(cost:number)=>{remaining=Math.max(180,remaining-cost);};
  for(let i=0;i<=steps;i++){
   const cx=p.x+10+p.vx*dt*i/steps,cy=p.y+20+p.vy*dt*i/steps,tx=cx+nx*29,ty=cy+ny*29;
   for(let offset=-16;offset<=16;offset+=4){const x=tx-ny*offset,y=ty+nx*offset,tile=g.world.at(x,y);if(!tile||tile.kind===3||tile.kind===4)continue;
    if(remaining<390)break;
    if(g.world.damage(x,y,power)){spendMomentum(tile.kind===2?85:45);touched=true;g.emit(x,y,6,['#c8dce9','#d6b795','#f4e8cb'],220,3,.35);}
   }
   const reaches=(x:number,y:number,w:number,h:number)=>tx>x-14&&tx<x+w+14&&ty>y-14&&ty<y+h+14&&g.lineOfSight(cx,cy,x+w/2,y+h/2);
   for(const e of g.enemies)if(remaining>=390&&!e.dead&&e.hacked<=0&&!g.claimedByOther(e)&&!this.ramHits.has(e)&&reaches(e.x,e.y,e.w,e.h)){
    spendMomentum(e.shield>0||e.type==='turret'?185:e.type==='drone'?70:115);
    this.ramHits.add(e);this.hit(e,power,nx*(560+strength*260),true,ny*(560+strength*260)-130);touched=true;
   }
   for(const b of g.barrels)if(remaining>=390&&!b.dead&&!this.ramHits.has(b)&&reaches(b.x,b.y,b.w,b.h)){this.ramHits.add(b);spendMomentum(90);b.hp-=power;b.vx=nx*600;b.vy=ny*600-100;b.owner=g.id;if(b.hp<=0)b.fuse=.08;touched=true;}
   const b=g.boss;if(remaining>=390&&b.active&&!b.dead&&b.phase===2&&!this.ramHits.has(b)&&reaches(b.x,b.y,b.w,b.h)){this.ramHits.add(b);spendMomentum(300);b.hp-=power;touched=true;}
   if(remaining<390)break;
  }
  if(touched){
   const ratio=remaining/speed;p.vx*=ratio;p.vy*=ratio;this.flightSpeed=remaining;
   if(remaining<390){this.ramSpent=true;this.sonic=false;this.sonicFlash=0;}
   else if(!this.rocketFlight)this.forwardRun=Math.min(this.forwardRun,.45);
   g.shake=Math.max(g.shake,5);if(g.effects)g.freeze=Math.max(g.freeze,.035);g.audio.noise(.1,.06,650);g.audio.tone(95,.12,'triangle',.045,40);g.makeNoise(p.x,p.y,1000);
  }
 }
 finishRam(){
  const g=this.g,p=g.player,a=this.flightAngle,x=p.x+10,y=p.y+20;
  // Keep the blast origin inside the hull: a projecting nose can already be
  // inside reinforced cover, which must not let the blast leak through it.
  this.area(x,y,88,5,true,false,true);
  this.ramExit={x,y,angle:a,life:.45};this.special=0;g.setThinking(0);this.transform=0;g.modeFeedback=0;g.modeBurst=0;g.hud();
  p.vx=Math.cos(a)*150;p.vy=-280;p.grounded=false;g.invuln=Math.max(g.invuln,.3);
  g.emit(x,y,24,['#fff0cc','#d0b4e9','#b8f1ff','#d6c6a7'],240,4,.45);
  g.audio.tone(550,.18,'triangle',.045,190);
 }
 updateRocket(dt:number){
  this.rocketKick=Math.max(0,this.rocketKick-dt);const r=this.rocket;if(!r)return;const g=this.g;
  r.life-=dt;r.speed=Math.min(940,r.speed+1500*dt);const distance=r.speed*dt,steps=Math.ceil(distance/3),dx=Math.cos(r.angle)*distance/steps,dy=Math.sin(r.angle)*distance/steps;
  r.trail.push({x:r.x,y:r.y});if(r.trail.length>18)r.trail.shift();
  for(let i=0;i<steps;i++){
   const x=r.x+dx,y=r.y+dy,b=g.boss;
   const impact=g.world.at(x,y)||g.enemies.some(e=>!e.dead&&e.hacked<=0&&!g.claimedByOther(e)&&x>e.x-5&&x<e.x+e.w+5&&y>e.y-5&&y<e.y+e.h+5)||g.barrels.some(b=>!b.dead&&x>b.x-4&&x<b.x+b.w+4&&y>b.y-4&&y<b.y+b.h+4)||b.active&&!b.dead&&x>b.x&&x<b.x+b.w&&y>b.y&&y<b.y+b.h;
   if(impact){this.area(r.x,r.y,118,16,true,true,true);this.rocket=null;return;}
   r.x=x;r.y=y;
  }
  if(r.life<=0){this.area(r.x,r.y,118,16,true,true,true);this.rocket=null;}
 }
 drawRocket(){
  const r=this.rocket;if(!r)return;const g=this.g,c=g.c;c.save();
  r.trail.forEach((p,i)=>{const t=(i+1)/r.trail.length;c.globalAlpha=t*.5;c.fillStyle=i%2?'#d7d3e5':'#ffa46e';c.beginPath();c.arc(p.x-g.cam,p.y,2+(1-t)*8,0,Math.PI*2);c.fill();});
  c.globalAlpha=1;c.translate(r.x-g.cam,r.y);c.rotate(r.angle);
  const flame=18+Math.sin(g.time*60)*5;c.fillStyle='#ffad5a';c.beginPath();c.moveTo(-11,-5);c.lineTo(-11-flame,0);c.lineTo(-11,5);c.fill();rect(c,-23,-2,14,4,'#fff1bf');
  rect(c,-12,-5,22,10,'#52495f');rect(c,-10,-4,19,7,'#e4d9c0');rect(c,-8,-3,14,2,'#fff7e0');rect(c,-3,-5,4,10,'#b276d2');
  c.fillStyle='#e9b071';c.beginPath();c.moveTo(9,-5);c.lineTo(18,0);c.lineTo(9,5);c.fill();
  c.fillStyle='#897799';for(const side of [-1,1]){c.beginPath();c.moveTo(-6,side*4);c.lineTo(-14,side*10);c.lineTo(-12,side*3);c.fill();}c.restore();
 }
 update(dt:number){
  if(this.ramExit){this.ramExit.life-=dt;if(this.ramExit.life<=0)this.ramExit=null;}
  const g=this.g;this.shieldHit=Math.max(0,this.shieldHit-dt);this.contactGrace=Math.max(0,this.contactGrace-dt);this.fCooldown=Math.max(0,this.fCooldown-dt);this.eCooldown=Math.max(0,this.eCooldown-dt);this.transform=Math.max(0,this.transform-dt);this.attack=Math.max(0,this.attack-dt);this.comboLife=Math.max(0,this.comboLife-dt);this.messageLife=Math.max(0,this.messageLife-dt);
  this.chargeSound=Math.max(0,this.chargeSound-dt);this.fullChargeFlash=Math.max(0,this.fullChargeFlash-dt);this.dischargeFlash=Math.max(0,this.dischargeFlash-dt);
  for(const arc of this.lightning)arc.life-=dt;this.lightning=this.lightning.filter(arc=>arc.life>0);
  this.updatePolymorph(dt);
  this.updateRocket(dt);
  this.updateSwing(dt);
  if(this.shield?.kind===0&&!g.world.at(g.player.x+10,g.player.y+33))this.shield=null;
  if(this.form!==0&&!g.keys.has('KeyQ'))this.shield=null;
  if(!this.shield&&(!g.keys.has('KeyQ')||this.shieldBroken||this.form===0&&!g.player.grounded)){this.shieldHP=Math.min(100,this.shieldHP+dt*20);if(this.shieldHP>=100)this.shieldBroken=false;}
  this.qCooldown=this.shieldBroken?(100-this.shieldHP)/20:0;
  if(this.form!==0&&g.keys.has('KeyQ')&&!this.shieldBroken)this.defend();
  if(this.shield){const expanding=this.shield.age<.18;this.shield.age+=dt;this.shield.kind=this.form;this.shield.flash=Math.max(0,this.shield.flash-dt);if(expanding)this.expandBubble();}
  for(const b of this.bombs){b.life-=dt;b.vy=Math.min(620,b.vy+780*dt);const step=b.vy*dt;let hit=false;for(let i=0;i<=step;i+=3)if(g.world.at(b.x,b.y+i+5)||g.enemies.some(e=>!e.dead&&!g.claimedByOther(e)&&e.hacked<=0&&b.x>e.x-5&&b.x<e.x+25&&b.y+i>e.y-5&&b.y+i<e.y+30)){hit=true;break;}b.y+=hit?0:step;if(hit){this.area(b.x,b.y,84,8,true,true,true);b.life=0;}}
  this.bombs=this.bombs.filter(b=>b.life>0&&b.y<1100);
  if(this.special>0){this.special=Math.max(0,this.special-dt);}
  if(this.meteor){const m=this.meteor;m.life-=dt;const step=Math.min(650*dt,Math.max(0,m.targetY-m.y));let hit=false;for(let i=0;i<=step;i+=4){if(g.world.at(m.x,m.y+i)){m.y+=Math.max(0,i-4);hit=true;break;}}if(!hit)m.y+=step;
   if(hit||m.y>=m.targetY||m.life<=0){this.area(m.x,m.y,112,14,true,true,true);this.meteor=null;}
  }
  this.remoteUpdate(dt);
 }
 clear(){this.resetFlight();this.ramExit=null;this.rocket=null;this.rocketKick=0;this.thrusters={forward:0,reverse:0,up:0,down:0};this.polymorph=null;this.sheepGesture=0;this.disconnect();this.shield=null;this.meteor=null;this.special=0;this.cancelLightning();this.swing=null;this.bombs=[];}
 draw(){
  const g=this.g,c=g.c,p=g.player,x=p.x+10-g.cam,y=p.y+16;if(g.state==='dead')return;
  if(this.transform>0){c.save();c.strokeStyle='#d6b8ff';c.lineWidth=1;c.globalAlpha=this.transform/.38;const h=46,w=this.form===2?66:42;c.strokeRect(x-w/2,y-h/2,w,h);for(const dx of [-1,1])for(const dy of [-1,1])rect(c,x+dx*w/2-3,y+dy*h/2-3,6,6,'#ead8ff');rect(c,x-w/2,y-23+(1-this.transform/.38)*46,w,2,'#fff0ff');c.restore();}
  if(this.swing){const s=this.swing;if(s.age>s.windup&&s.age<s.windup+s.active+.08){c.save();c.translate(x,y);c.strokeStyle=s.heavy?'#fff0bc':'#f6d092';c.lineWidth=s.heavy?7:s.step===1?4:3;c.globalAlpha=Math.min(1,(s.duration-s.age)*5);c.beginPath();c.arc(0,0,s.radius*.8,s.angle-s.direction*.9,s.angle,s.direction<0);c.stroke();c.globalAlpha*=.2;c.lineWidth=18;c.stroke();c.restore();}}
  this.drawLightning();this.drawPolymorph();this.drawRocket();
  if(this.ramExit){const r=this.ramExit,t=1-r.life/.45;c.save();c.translate(r.x-g.cam,r.y);c.rotate(r.angle);c.globalAlpha=1-t;for(let i=0;i<5;i++){const side=i%2?1:-1;c.save();c.translate(-18+i*7-t*28,side*(5+t*(18+i*4)));c.rotate(side*t*2);rect(c,-7,-3,14,6,i%2?'#d6c6a7':'#867493');rect(c,-5,-2,10,2,'#e9dcca');c.restore();}c.restore();}
  const s=this.shield;if(s){c.save();c.translate(s.kind===0?s.x-g.cam:x,s.kind===0?s.y:y);
   if(s.kind===0){
    iphoneBunker(c,g.face,g.time,this.shieldHP,!!this.paired,s.age,s.flash);
   }else if(s.kind===1){
    const r=this.bubbleRadius(),growing=s.age<.18;
    c.fillStyle=growing?'#c5b0ff24':'#b98df30d';c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.fill();c.strokeStyle=s.flash>0?'#fff3ff':growing?'#e4d4ff':'#ae86e6';c.lineWidth=s.flash>0?4:growing?3:2;c.stroke();
    c.strokeStyle='#e3c5ff';c.lineWidth=2;c.beginPath();c.arc(0,0,r+3,-Math.PI/2,-Math.PI/2+Math.PI*2*this.shieldHP/100);c.stroke();
    if(growing){c.globalAlpha=.25;c.lineWidth=7;c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.stroke();c.globalAlpha=1;}
    for(let i=0;i<6;i++){const a=i*Math.PI/3+g.time*.25;rect(c,Math.cos(a)*r-2,Math.sin(a)*r-2,4,4,'#d4b5f4');}
   }else{c.rotate(g.aimAngle);c.strokeStyle=s.flash>0?'#fff8ff':'#9de4f0';c.lineWidth=3;c.beginPath();c.moveTo(16,-34);c.quadraticCurveTo(46,0,16,34);c.stroke();c.strokeStyle='#dcbcff';c.lineWidth=2;c.beginPath();c.moveTo(12,-34);c.quadraticCurveTo(41,0,12,34);c.stroke();for(let i=0;i<Math.ceil(this.shieldHP/20);i++)rect(c,33,-12+i*6,3,3,'#e5d1ff');}
   c.restore();}
  for(const b of this.bombs){const bx=b.x-g.cam;rect(c,bx-3,b.y-10,6,5,'#a890cc');rect(c,bx-6,b.y-5,12,14,'#54425f');rect(c,bx-4,b.y-3,8,9,'#e0c8a2');rect(c,bx-2,b.y+2,4,3,Math.sin(g.time*30)>0?'#ffbe6d':'#e77a55');for(let i=1;i<4;i++)rect(c,bx-1,b.y-10-i*6,2,3,'#bb9bdd');}
  if(this.special>0&&this.specialForm===0&&this.swing){const s=this.swing;c.save();c.translate(x,y);c.rotate(s.angle);c.strokeStyle='#ccb2ff';c.strokeRect(6,-11,148,22);rect(c,151,-14,6,6,'#efd9ff');c.restore();}
  if(this.meteor){const m=this.meteor,tx=m.x-g.cam;c.save();c.strokeStyle='#ecb5ff';c.lineWidth=2;c.beginPath();c.ellipse(tx,m.targetY,36,9,0,0,Math.PI*2);c.stroke();text(c,'↓',tx,m.targetY-12,'#edbbff',16,'center');c.fillStyle='#cf85dd';c.beginPath();c.moveTo(tx-13,m.y);c.lineTo(tx-25,m.y-75);c.lineTo(tx+18,m.y-45);c.lineTo(tx+15,m.y);c.closePath();c.fill();rect(c,tx-12,m.y-17,25,27,'#ffbc86');rect(c,tx-8,m.y-12,15,17,'#fff1b8');c.restore();}
  const e=this.pairing??this.paired;if(e&&!e.dead){const ex=e.x+10-g.cam,ey=e.y+15;c.save();if(this.remoteDriving){c.strokeStyle='#aedeff';c.lineWidth=1.5;for(const side of [-1,1]){c.beginPath();for(let i=0;i<6;i++){const xx=ex+side*(15+Math.sin(g.time*27+i*5)*3),yy=ey-22+i*8;i?c.lineTo(xx,yy):c.moveTo(xx,yy);}c.stroke();}if(this.remoteLadder!==null){for(const side of [-1,1])rect(c,ex+side*10-2,ey-5+Math.sin(g.time*14+side)*7,4,5,'#d2e4ed');}}c.strokeStyle=this.pairing?'#f0d6ff':'#be92ff';c.lineWidth=1;c.setLineDash([3,9]);c.beginPath();c.moveTo(x-10,y);c.lineTo(ex,ey);c.stroke();c.setLineDash([]);c.strokeRect(ex-16,ey-22,32,44);for(const dx of [-1,1])for(const dy of [-1,1])rect(c,ex+dx*16-2,ey+dy*22-2,4,4,'#debcff');text(c,this.pairing?'PAIRING':this.remoteDriving?'OVERCLOCK':'BODYGUARD',ex,ey-29,'#d8b6ff',7,'center');c.restore();}
  if(this.messageLife>0){c.save();c.globalAlpha=Math.min(1,this.messageLife*5);text(c,this.message,x,y-42,'#e2c5ff',9,'center');c.restore();}
 }
 snapshot(){return {form:this.name,rocketFlight:this.rocketFlight,flightBlend:this.flightBlend,forwardRun:this.forwardRun,sonic:this.sonic,rocket:this.rocket?{x:this.rocket.x,y:this.rocket.y}:null,thrusters:{...this.thrusters},polymorph:this.polymorph?{impact:this.polymorph.impact,x:this.polymorph.x,y:this.polymorph.y}:null,charge:this.charge,lightningArcs:this.lightning.length,bubbleRadius:this.shield?.kind===1?this.bubbleRadius():0,hover:this.form===2,boosting:this.boosting,combo:this.combo,swingStep:this.swing?.step??null,shieldHP:this.shieldHP,shieldBroken:this.shieldBroken,bombs:this.bombs.length,qCooldown:this.qCooldown,fCooldown:this.fCooldown,eCooldown:this.eCooldown,shield:this.shield?{...this.shield}:null,special:this.special,specialForm:this.specialForm,meteor:this.meteor,remoteTime:this.remoteTime,remoteDriving:this.remoteDriving,remoteLadder:this.remoteLadder,paired:this.paired?{x:this.paired.x,y:this.paired.y,type:this.paired.type}:null,pairing:!!this.pairing};}
}
