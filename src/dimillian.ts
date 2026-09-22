import type { Game } from './game';
import { reflect,shieldCrossing } from './defense-geometry';
import { clamp } from './world';
import { rect,text } from './art';
import { baguette,dimillianSeated,DIM_COLORS,DIM_FORMS } from './dimillian-art';
type Enemy=Game['enemies'][number];
type Swing={step:number;connected:boolean;age:number;duration:number;windup:number;active:number;aim:number;direction:number;start:number;end:number;angle:number;prior:number;radius:number;power:number;force:number;heavy:boolean;hits:Set<unknown>};
type Shield={x:number;y:number;kind:number;life:number;age:number;hits:number;angle:number;flash:number};
export class DimillianKit {
 form=0;transform=0;attack=0;combo=0;comboHits=0;comboLife=0;charge=0;boosting=false;swing:Swing|null=null;
 qCooldown=0;fCooldown=0;eCooldown=0;shield:Shield|null=null;
 shieldHP=100;shieldBroken=false;shieldHit=0;contactGrace=0;
 bombs:{x:number;y:number;vy:number;life:number}[]=[];
 special=0;specialForm=0;specialAngle=0;slamDone=false;
 meteor:{x:number;y:number;targetY:number;life:number}|null=null;
 paired:Enemy|null=null;pairing:Enemy|null=null;pairTime=0;remoteTime=0;remoteShot=0;message='';messageLife=0;
 constructor(public g:Game){}
 get name(){return DIM_FORMS[this.form];}
 get color(){return DIM_COLORS[this.form];}
 get qName(){return ['BUNKER','BUBBLE','DEFLECT'][this.form];}
 get eName(){return ['PAIR','SHEEP','BOMB'][this.form];}
 get fName(){return ['GRAND SLAM','METEOR','OVERDRIVE'][this.form];}
 changeForm(kind:number){
  if(this.special>0||kind===this.form)return;
  this.form=kind;this.charge=0;this.swing=null;this.combo=0;this.comboHits=0;this.shield=null;this.disconnect();if(kind===2&&this.g.player.grounded)this.g.player.vy=-85;this.transform=.38;this.g.jumpBuffer=0;this.g.wallGrip=0;
  this.g.emit(this.g.player.x+10,this.g.player.y+16,14,['#c6a0ff','#eee0ff','#706086'],100,3,.32);
  this.g.audio.tone(220+kind*190,.13,'triangle',.04,800); // Attack/Q/F timers deliberately survive hot reload.
 }
 feedback(label:string){this.message=label;this.messageLife=.8;}
 hit(e:Enemy,power:number,vx:number,heavy=false,vy=-100){
  if(e.dead||e.hacked>0)return;
  const g=this.g;if(heavy&&e.shield>0){g.debris.armor(e.x,e.y,e.face);e.shield=0;}
  e.sheep=0;e.hp-=power;e.wind=0;e.hurt=.13;e.stun=heavy?.5:.16;e.vx=vx;e.vy=vy;e.flung=heavy?.5:0;e.grounded=false;
  g.emit(e.x+10,e.y+15,heavy?20:8,[this.color,'#fff0cc','#9976b4'],heavy?260:130,4,.35);
  if(e.hp<=0)g.kill(e,vx,vy,heavy);else{g.audio.impact();g.shake=Math.max(g.shake,heavy?5:2);if(g.effects)g.freeze=Math.max(g.freeze,heavy?.04:.02);}
 }
 smash(x:number,y:number,r:number){
  const g=this.g;for(let dx=-r;dx<=r;dx+=12)for(let dy=-r;dy<=r;dy+=12)if(dx*dx+dy*dy<r*r){if(g.world.damage(x+dx,y+dy,8))g.emit(x+dx,y+dy,4,['#b39da2','#d7bd91'],130,4);}
 }
 area(x:number,y:number,r:number,power:number,heavy=false,terrain=false,fire=false){
  const g=this.g;if(terrain)this.smash(x,y,r*.7);
  for(const e of g.enemies)if(Math.hypot(e.x+10-x,e.y+15-y)<r+12&&g.lineOfSight(x,y,e.x+10,e.y+15))this.hit(e,power,(Math.sign(e.x+10-x)||g.face)*(heavy?430:170),heavy,heavy?-240:-120);
  for(const b of g.barrels)if(!b.dead&&Math.hypot(b.x+9-x,b.y+15-y)<r)b.fuse=b.fuse||.08;
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
   for(const e of g.enemies)if(!e.dead&&e.hacked<=0&&!s.hits.has(e)&&contact(e.x+10,e.y+15)&&g.lineOfSight(x,y,e.x+10,e.y+15)){s.hits.add(e);const v=velocity(e.x+10,e.y+15);this.hit(e,s.power,v.vx,s.heavy,s.heavy?v.vy:-60);s.connected=true;if(!e.dead){e.flung=s.heavy?.65:.12;e.stun=s.heavy?.6:.17;}if(s.step===2){this.feedback('VOILÀ!');g.barks.request('finisher');}g.emit(e.x+10,e.y+15,15,['#ffe3a9','#d49b5e','#af7846'],210,4,.45);}
   const b=g.boss;if(b.active&&!b.dead&&b.phase===2&&!s.hits.has(b)&&contact(b.x+38,b.y+38,35)&&g.lineOfSight(x,y,b.x+38,b.y+38)){s.hits.add(b);b.hp-=s.power;s.connected=true;}
   for(const b of g.barrels)if(!b.dead&&!s.hits.has(b)&&contact(b.x+9,b.y+15)&&g.lineOfSight(x,y,b.x+9,b.y+15)){s.hits.add(b);b.hp-=s.power;if(b.hp<=0)b.fuse=.06;}
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
  const g=this.g;
  const a=g.aimAngle,side=g.shotCount%2?1:-1,boost=this.special>0&&this.specialForm===2,x=g.player.x+10,y=g.player.y+20;
  g.bullets.push({x:x+Math.cos(a)*12-Math.sin(a)*side*7,y:y+Math.sin(a)*12+Math.cos(a)*side*7,vx:Math.cos(a)*900,vy:Math.sin(a)*900,life:.85,hostile:false,power:boost?2.4:1.5,pierce:boost?1:0,boost:false,tier:boost?1:0,color:boost?'#e8c9ff':'#9ceaf2',hit:new Set()});
  g.fireTimer=boost?.065:.13;g.lastCooldown=g.fireTimer;g.shotCount++;this.attack=.08;g.makeNoise(x,y,400);g.audio.tone(boost?380:560,.06,'triangle',.03,130);
 }
 cast(){
  const g=this.g,t=clamp(this.charge/1.15,0,1),a=g.aimAngle;
  g.bullets.push({x:g.player.x+10+Math.cos(a)*12,y:g.player.y+16+Math.sin(a)*12,vx:Math.cos(a)*(380-t*60),vy:Math.sin(a)*(380-t*60),life:1.6,hostile:false,power:2+t*4,pierce:0,boost:false,tier:t>.55?1:0,color:'#ffb96a',fireball:t,spell:t>=.99?88:undefined,hit:new Set()});
  g.fireTimer=.3+t*.2;g.lastCooldown=g.fireTimer;g.shotCount++;this.attack=.18;this.charge=0;g.makeNoise(g.player.x,g.player.y,430);g.audio.noise(.17,.06,950);g.audio.tone(145,.19,'sine',.055,65);g.emit(g.player.x+10+Math.cos(a)*25,g.player.y+16+Math.sin(a)*25,8,['#ff9b49','#ffe5a3'],120,3,.3);
 }
 fireInput(dt:number,firing:boolean){
  const g=this.g;if(this.shield?.kind===0||this.special>0&&this.specialForm!==2)return;
  if(this.form===1){if(g.fireTimer<=0&&firing){const old=this.charge;this.charge=Math.min(1.15,this.charge+dt);if(old<1.15&&this.charge>=1.15){g.audio.tone(360,.17,'triangle',.04,720);this.feedback('FIREBALL READY');}}if(this.charge>0&&!firing)this.cast();return;}
  if(!firing||g.fireTimer>0)return;
  if(this.form===2)this.cannon();else{if(this.comboLife<=0){this.combo=0;this.comboHits=0;}this.melee();g.fireTimer=this.swing!.duration;g.lastCooldown=g.fireTimer;g.shotCount++;}
 }
 defend(){
  const g=this.g;if(this.shieldBroken||this.shieldHP<=0||g.state!=='playing'||this.form===0&&!g.player.grounded)return false;
  if(this.shield)return true;
  this.shield={x:g.player.x+10,y:g.player.y+16,kind:this.form,life:999,age:0,hits:Math.ceil(this.shieldHP/20),angle:g.aimAngle,flash:0};
  if(this.form===0){this.swing=null;this.combo=0;g.player.vx=0;g.player.vy=0;}g.audio.tone(380,.12,'triangle',.035,640);return true;
 }
 releaseDefense(){this.shield=null;}
 drainShield(amount:number){
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
  const v=reflect(b.vx,b.vy,a);b.vx=v.vx;b.vy=v.vy;b.hostile=false;b.hit.clear();b.power=Math.max(2,b.power);b.tier=Math.max(1,b.tier??0);b.life=Math.max(.7,b.life);b.color='#ffe0a1';
  g.emit(b.x,b.y,12,['#fff5d2','#ffd17e','#c7a0ff'],190,3,.25);g.rings.push({x:b.x,y:b.y,r:2,max:14,life:.14,color:'#fff0bc'});
  g.audio.tone(1050,.08,'triangle',.045,430);g.shake=Math.max(g.shake,1.5);if(g.effects)g.freeze=Math.max(g.freeze,.025);
  return true;
 }
 intercept(b:Game['bullets'][number],from:{x:number;y:number}){
  if(this.deflectSwing(b))return true;
  const s=this.shield,g=this.g;if(!s||!b.hostile||b.life<=0)return false;const x=g.player.x+10,y=g.player.y+16,r=56;
  if(s.kind===1){if(Math.hypot(from.x-x,from.y-y)<r||Math.hypot(b.x-x,b.y-y)>r)return false;}
  else if(s.kind===2){s.angle=g.aimAngle;if(!shieldCrossing(from,b,{x:x+Math.cos(s.angle)*27,y:y+Math.sin(s.angle)*27,angle:s.angle,half:34}))return false;}
  else{const inside=(p:{x:number;y:number})=>Math.abs(p.x-s.x)<33&&p.y>s.y-48&&p.y<s.y+17;if(inside(from)||!inside(b))return false;}
  b.life=0;this.drainShield(20*Math.max(1,b.power));g.emit(b.x,b.y,10,['#d4b3ff','#eef2ff'],130,3,.25);g.audio.tone(560,.07,'triangle',.035,260);return true;
 }
 absorbBlast(x:number,y:number){
  const s=this.shield;if(!s)return false;const dx=x-this.g.player.x-10,dy=y-this.g.player.y-16;
  if(s.kind===1&&Math.hypot(dx,dy)<56||s.kind===2&&dx*Math.cos(this.g.aimAngle)+dy*Math.sin(this.g.aimAngle)<25||s.kind===0&&Math.abs(x-s.x)<33&&y>s.y-48&&y<s.y+17)return false;
  this.drainShield(45);return true;
 }
 blockContact(e:Enemy){
  if(!this.shield)return false;
  if(this.shield.kind===2&&(e.x-this.g.player.x)*Math.cos(this.g.aimAngle)+(e.y-this.g.player.y)*Math.sin(this.g.aimAngle)<0)return false;
  if(this.contactGrace<=0){this.drainShield(20);this.contactGrace=.35;const a=Math.atan2(e.y-this.g.player.y,e.x-this.g.player.x);this.hit(e,0,Math.cos(a)*210,false,-100);}
  return true;
 }
 ultimate(){
  const g=this.g;if(this.shield?.kind===0||this.fCooldown>0||g.state!=='playing')return false;g.updateAim();this.fCooldown=18;this.specialForm=this.form;this.specialAngle=g.aimAngle;this.special=this.form===2?4:this.form===1?.85:.65;this.slamDone=false;this.charge=0;this.shield=null;if(this.form===0)this.melee(true);
  if(this.form===1){const p=g.aimPoint(),x=g.player.x+10,y=g.player.y+16,dx=p.x-x,dy=p.y-y,d=Math.max(1,Math.hypot(dx,dy)),k=Math.min(1,440/d);const tx=x+dx*k,ty=y+dy*k;this.meteor={x:tx,y:Math.max(-40,ty-360),targetY:ty,life:1.2};}
  g.barks.request((['duelistSpecial','mageSpecial','pilotSpecial'] as const)[this.form]);this.feedback(this.fName);g.audio.tone(130,.3,'sawtooth',.055,640);return true;
 }
 secondary(){
  const g=this.g;if(this.eCooldown>0||g.state!=='playing')return false;
  if(this.form===0)return this.pair();
  if(this.form===2){this.bombs.push({x:g.player.x+10,y:g.player.y+30,vy:30,life:5});this.eCooldown=2.8;g.audio.tone(210,.11,'triangle',.035,90);return true;}
  g.updateAim();const p=g.aimPoint(),e=g.enemies.filter(e=>!e.dead&&e.hacked<=0&&!e.sheep&&Math.hypot(e.x+10-p.x,e.y+15-p.y)<44&&Math.hypot(e.x-g.player.x,e.y-g.player.y)<400&&g.lineOfSight(g.player.x+10,g.player.y+16,e.x+10,e.y+15)).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
  if(!e){this.feedback('AIM AT A BOT');return false;}
  e.sheep=6;e.wind=0;e.dash=0;e.cool=1;e.stun=0;e.vx=0;e.vy=0;this.eCooldown=5.5;this.feedback('BÊÊÊ.');g.barks.request('sheep');g.emit(e.x+10,e.y+15,24,['#ead9ff','#faf0da','#bd92ec'],150,4,.5);g.audio.tone(380,.18,'triangle',.04,280);g.audio.tone(520,.14,'sine',.025,340);return true;
 }
 pair(){
  const g=this.g;if(this.form!==0||this.eCooldown>0||this.pairing||g.state!=='playing')return false;g.updateAim();const p=g.aimPoint();
  const e=g.enemies.filter(e=>!e.dead&&e.hacked<=0&&Math.hypot(e.x+10-p.x,e.y+15-p.y)<42&&Math.hypot(e.x-g.player.x,e.y-g.player.y)<380&&g.lineOfSight(g.player.x+10,g.player.y+16,e.x+10,e.y+15)).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
  if(!e){this.feedback('AIM AT A BOT');return false;}this.pairing=e;this.pairTime=.35;this.feedback('PAIRING…');g.audio.tone(660,.08,'sine',.025,900);return true;
 }
 disconnect(){if(this.paired){this.paired.hacked=0;this.paired.cool=.7;this.paired.wind=0;this.paired.stun=Math.max(this.paired.stun,.2);}this.paired=null;this.pairing=null;this.remoteTime=0;}
 remoteUpdate(dt:number){
  const g=this.g;if(this.pairing){const e=this.pairing;if(e.dead||Math.hypot(e.x-g.player.x,e.y-g.player.y)>400||!g.lineOfSight(g.player.x+10,g.player.y+16,e.x+10,e.y+15)){this.pairing=null;this.feedback('PAIR LOST');}
   else{this.pairTime-=dt;if(this.pairTime<=0){this.disconnect();this.paired=e;e.hacked=6;e.wind=0;e.stun=0;this.remoteTime=6;this.eCooldown=10;this.remoteShot=.1;this.feedback('REMOTE CONNECTED');g.barks.request('paired');g.audio.tone(900,.14,'sine',.04,1200);}}
  }
  const e=this.paired;if(!e)return;this.remoteTime-=dt;this.remoteShot-=dt;
  if(e.dead||this.remoteTime<=0||Math.hypot(e.x-g.player.x,e.y-g.player.y)>650){this.disconnect();this.feedback('DISCONNECTED');return;}
  e.hacked=this.remoteTime+.05;e.wind=0;e.cool=99;e.hurt=Math.max(0,e.hurt-dt);
  const aim=g.aimPoint(),a=Math.atan2(aim.y-e.y-15,aim.x-e.x-10);e.look=a;e.face=Math.cos(a)>=0?1:-1;
  if(e.type!=='drone'){e.vx=0;e.vy=Math.min(650,e.vy+1400*dt);g.world.move(e,dt);}
  const enemy=g.enemies.find(o=>o!==e&&!o.dead&&o.hacked<=0&&Math.hypot(o.x+10-aim.x,o.y+15-aim.y)<60);
  const firing=g.pointer.down||g.keys.has('KeyJ')||g.pendingShot>0;
  if(this.remoteShot<=0&&(firing||enemy)&&g.lineOfSight(e.x+10,e.y+15,aim.x,aim.y)){
    this.remoteShot=e.type==='turret'?.38:.65;
    if(e.type==='runner'){for(const o of g.enemies)if(o!==e&&Math.hypot(o.x-e.x,o.y-e.y)<65)this.hit(o,3,e.face*230,true);}
    else for(const spread of e.type==='drone'?[-.08,0,.08]:[0])g.bullets.push({x:e.x+10,y:e.y+15,vx:Math.cos(a+spread)*620,vy:Math.sin(a+spread)*620,life:1,hostile:false,power:e.type==='turret'?3:2,pierce:0,boost:false,tier:1,color:'#c9a4ff',hit:new Set([e])});
    g.audio.tone(460,.07,'triangle',.025,170);g.makeNoise(e.x,e.y,330,e);
  }
 }
 fly(dt:number,dir:number){
  const g=this.g,p=g.player;g.climb=null;g.zip=false;g.wallGrip=0;g.wallGrace=0;g.jumpBuffer=0;g.coyote=0;
  const up=g.keys.has('Space')||g.keys.has('KeyW')||g.keys.has('ArrowUp'),down=g.keys.has('KeyS')||g.keys.has('ArrowDown');this.boosting=up||down;
  const speed=this.special>0?270:225;p.vx+=clamp(dir*speed-p.vx,-2200*dt,2200*dt);
  const vy=(down?1:0)-(up?1:0);p.vy+=clamp(vy*235-p.vy,-1300*dt,1300*dt);
  g.world.move(p,dt);if(p.y<0){p.y=0;p.vy=Math.max(0,p.vy);}
 }
 update(dt:number){
  const g=this.g;this.shieldHit=Math.max(0,this.shieldHit-dt);this.contactGrace=Math.max(0,this.contactGrace-dt);this.fCooldown=Math.max(0,this.fCooldown-dt);this.eCooldown=Math.max(0,this.eCooldown-dt);this.transform=Math.max(0,this.transform-dt);this.attack=Math.max(0,this.attack-dt);this.comboLife=Math.max(0,this.comboLife-dt);this.messageLife=Math.max(0,this.messageLife-dt);
  this.updateSwing(dt);
  if(this.shield?.kind===0&&!g.world.at(g.player.x+10,g.player.y+33))this.shield=null;
  if(!g.keys.has('KeyQ'))this.shield=null;
  if(!this.shield&&(!g.keys.has('KeyQ')||this.shieldBroken||this.form===0&&!g.player.grounded)){this.shieldHP=Math.min(100,this.shieldHP+dt*20);if(this.shieldHP>=100)this.shieldBroken=false;}
  this.qCooldown=this.shieldBroken?(100-this.shieldHP)/20:0;
  if(g.keys.has('KeyQ')&&!this.shieldBroken)this.defend();
  if(this.shield){this.shield.age+=dt;this.shield.kind=this.form;this.shield.flash=Math.max(0,this.shield.flash-dt);}
  for(const b of this.bombs){b.life-=dt;b.vy=Math.min(620,b.vy+780*dt);const step=b.vy*dt;let hit=false;for(let i=0;i<=step;i+=3)if(g.world.at(b.x,b.y+i+5)||g.enemies.some(e=>!e.dead&&e.hacked<=0&&b.x>e.x-5&&b.x<e.x+25&&b.y+i>e.y-5&&b.y+i<e.y+30)){hit=true;break;}b.y+=hit?0:step;if(hit){this.area(b.x,b.y,84,8,true,true,true);b.life=0;}}
  this.bombs=this.bombs.filter(b=>b.life>0&&b.y<1100);
  if(this.special>0){this.special=Math.max(0,this.special-dt);}
  if(this.meteor){const m=this.meteor;m.life-=dt;const step=Math.min(650*dt,Math.max(0,m.targetY-m.y));let hit=false;for(let i=0;i<=step;i+=4){if(g.world.at(m.x,m.y+i)){m.y+=Math.max(0,i-4);hit=true;break;}}if(!hit)m.y+=step;
   if(hit||m.y>=m.targetY||m.life<=0){this.area(m.x,m.y,112,14,true,true,true);this.meteor=null;}
  }
  this.remoteUpdate(dt);
 }
 clear(){this.disconnect();this.shield=null;this.meteor=null;this.special=0;this.charge=0;this.swing=null;this.bombs=[];}
 draw(){
  const g=this.g,c=g.c,p=g.player,x=p.x+10-g.cam,y=p.y+16;if(g.state==='dead')return;
  if(this.transform>0){c.save();c.strokeStyle='#d6b8ff';c.lineWidth=1;c.globalAlpha=this.transform/.38;const h=46,w=this.form===2?66:42;c.strokeRect(x-w/2,y-h/2,w,h);for(const dx of [-1,1])for(const dy of [-1,1])rect(c,x+dx*w/2-3,y+dy*h/2-3,6,6,'#ead8ff');rect(c,x-w/2,y-23+(1-this.transform/.38)*46,w,2,'#fff0ff');c.restore();}
  if(this.swing){const s=this.swing;if(s.age>s.windup&&s.age<s.windup+s.active+.08){c.save();c.translate(x,y);c.strokeStyle=s.heavy?'#fff0bc':'#f6d092';c.lineWidth=s.heavy?7:s.step===1?4:3;c.globalAlpha=Math.min(1,(s.duration-s.age)*5);c.beginPath();c.arc(0,0,s.radius*.8,s.angle-s.direction*.9,s.angle,s.direction<0);c.stroke();c.globalAlpha*=.2;c.lineWidth=18;c.stroke();c.restore();}}
  if(this.charge>0){c.strokeStyle=this.charge>=1.15?'#fff1b8':'#ffad62';c.lineWidth=2;c.beginPath();c.arc(x,y-26,8,-Math.PI/2,-Math.PI/2+Math.PI*2*this.charge/1.15);c.stroke();}
  const s=this.shield;if(s){c.save();c.translate(s.kind===0?s.x-g.cam:x,s.kind===0?s.y:y);
   if(s.kind===0){
    rect(c,-35,-50,70,68,'#302b3c');rect(c,-33,-52,66,72,'#a49ab5');rect(c,-30,-49,60,66,'#151822');rect(c,-27,-43,54,55,'#453550');rect(c,-8,-46,16,3,'#0c1019');rect(c,-5,14,10,2,'#ded2ea');
    rect(c,-25,7,50,5,'#7f6894');dimillianSeated(c,-10,-14,g.face,g.time);rect(c,-24,-40,48,2,'#ba93dc');rect(c,-31,-21,3,12,'#f1d9ff');rect(c,28,-22,3,14,'#eee0fc');
    text(c,'REMOTE',0,-29,'#d7c0ed',6,'center');rect(c,-27,-57,54,3,'#3d304b');rect(c,-27,-57,54*this.shieldHP/100,3,'#c99fff');
   }else if(s.kind===1){
    c.fillStyle='#b98df30d';c.beginPath();c.arc(0,0,56,0,Math.PI*2);c.fill();c.strokeStyle=s.flash>0?'#fff3ff':'#ae86e6';c.lineWidth=s.flash>0?4:2;c.stroke();c.strokeStyle='#e3c5ff';c.lineWidth=3;c.beginPath();c.arc(0,0,59,-Math.PI/2,-Math.PI/2+Math.PI*2*this.shieldHP/100);c.stroke();for(let i=0;i<6;i++){const a=i*Math.PI/3+g.time*.25;rect(c,Math.cos(a)*55-2,Math.sin(a)*55-2,4,4,'#d4b5f4');}
   }else{c.rotate(g.aimAngle);c.strokeStyle=s.flash>0?'#fff8ff':'#9de4f0';c.lineWidth=3;c.beginPath();c.moveTo(16,-34);c.quadraticCurveTo(46,0,16,34);c.stroke();c.strokeStyle='#dcbcff';c.lineWidth=2;c.beginPath();c.moveTo(12,-34);c.quadraticCurveTo(41,0,12,34);c.stroke();for(let i=0;i<Math.ceil(this.shieldHP/20);i++)rect(c,33,-12+i*6,3,3,'#e5d1ff');}
   c.restore();}
  for(const b of this.bombs){const bx=b.x-g.cam;rect(c,bx-3,b.y-10,6,5,'#a890cc');rect(c,bx-6,b.y-5,12,14,'#54425f');rect(c,bx-4,b.y-3,8,9,'#e0c8a2');rect(c,bx-2,b.y+2,4,3,Math.sin(g.time*30)>0?'#ffbe6d':'#e77a55');for(let i=1;i<4;i++)rect(c,bx-1,b.y-10-i*6,2,3,'#bb9bdd');}
  if(this.special>0&&this.specialForm===0&&this.swing){const s=this.swing;c.save();c.translate(x,y);c.rotate(s.angle);c.strokeStyle='#ccb2ff';c.strokeRect(6,-11,148,22);rect(c,151,-14,6,6,'#efd9ff');c.restore();}
  if(this.meteor){const m=this.meteor,tx=m.x-g.cam;c.save();c.strokeStyle='#ecb5ff';c.lineWidth=2;c.beginPath();c.ellipse(tx,m.targetY,36,9,0,0,Math.PI*2);c.stroke();text(c,'↓',tx,m.targetY-12,'#edbbff',16,'center');c.fillStyle='#cf85dd';c.beginPath();c.moveTo(tx-13,m.y);c.lineTo(tx-25,m.y-75);c.lineTo(tx+18,m.y-45);c.lineTo(tx+15,m.y);c.closePath();c.fill();rect(c,tx-12,m.y-17,25,27,'#ffbc86');rect(c,tx-8,m.y-12,15,17,'#fff1b8');c.restore();}
  const e=this.pairing??this.paired;if(e&&!e.dead){const ex=e.x+10-g.cam,ey=e.y+15;c.save();c.strokeStyle=this.pairing?'#f0d6ff':'#be92ff';c.lineWidth=1;c.setLineDash([3,9]);c.beginPath();c.moveTo(x-10,y);c.lineTo(ex,ey);c.stroke();c.setLineDash([]);c.strokeRect(ex-16,ey-22,32,44);for(const dx of [-1,1])for(const dy of [-1,1])rect(c,ex+dx*16-2,ey+dy*22-2,4,4,'#debcff');text(c,this.pairing?'PAIRING':`REMOTE ${this.remoteTime.toFixed(1)}`,ex,ey-29,'#d8b6ff',7,'center');c.restore();}
  if(this.messageLife>0){c.save();c.globalAlpha=Math.min(1,this.messageLife*5);text(c,this.message,x,y-42,'#e2c5ff',9,'center');c.restore();}
 }
 snapshot(){return {form:this.name,charge:this.charge,hover:this.form===2,boosting:this.boosting,combo:this.combo,swingStep:this.swing?.step??null,shieldHP:this.shieldHP,shieldBroken:this.shieldBroken,bombs:this.bombs.length,qCooldown:this.qCooldown,fCooldown:this.fCooldown,eCooldown:this.eCooldown,shield:this.shield?{...this.shield}:null,special:this.special,specialForm:this.specialForm,meteor:this.meteor,remoteTime:this.remoteTime,paired:this.paired?{x:this.paired.x,y:this.paired.y,type:this.paired.type}:null,pairing:!!this.pairing};}
}
