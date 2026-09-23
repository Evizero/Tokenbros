import type { PlayerRuntime as Game } from './player-runtime';
import type { Bullet, Enemy } from './game-types';
import { clamp, COLS, TILE, LEVEL_HEIGHT } from './world';
import { text } from './art';
import { deck, shieldDeck, theo, theoPortrait, THEO_COLOR } from './theo-art';

type Point={x:number;y:number};
type Board={x:number;y:number;vx:number;vy:number;angle:number;state:'attached'|'out'|'return';kind:'ride'|'shield';normal:number;wobble:number;grounded:boolean;age:number;hit:Set<Enemy>;trail:Point[]};

/** One deck has one owner and one physical location, including during recall. */
export class TheoKit {
 board:Board={x:100,y:855,vx:0,vy:0,angle:0,state:'attached',kind:'ride',normal:0,wobble:0,grounded:true,age:0,hit:new Set(),trail:[]};
 passenger:Enemy|null=null;rideFace=1;attack=0;attackKind=0;attackAngle=0;attackHit=false;
 punchStep=0;punchCombo=0;punchLife=0;shieldPose=0;shieldAim=0;
 mounted=false;mountBlend=0;mounts=0;throwPose=0;combo=0;comboLife=0;finishers=0;blocks=0;shieldTosses=0;
 catchPose=0;kickPose=0;flip=0;airUsed=false;wasFiring=false;
 strikePower=0;attackDuration=.32;strikeOrigin={x:0,y:0};launchVelocity=0;flipRun=false;line=0;lineLife=0;returnHits=0;rams=0;rush=0;rushFlash=0;rammed=new Map<Enemy,number>();beforeMove={x:0,y:0};
 catches=0;launches=0;carries=0;crashes=0;hits=0;rollSound=0;
 get name(){return this.riding?'RIDING':this.attached?'IN HAND':this.board.state==='return'?'RETURNING':'DECK OUT';}
 get attached(){return this.board.state==='attached';}
 get riding(){return this.attached&&this.mounted&&this.g.climb===null&&!this.g.zip&&!this.g.wallGrip;}
 constructor(public g:Game){}
 controls(e:Enemy){return this.passenger===e;}
 clear(){this.releasePassenger(0,-100);this.board.state='attached';this.board.kind='ride';this.mounted=false;this.mountBlend=0;this.combo=0;this.comboLife=0;this.throwPose=0;this.board.hit.clear();this.board.trail=[];this.attack=0;this.punchCombo=0;this.punchLife=0;this.shieldPose=0;this.airUsed=false;this.wasFiring=false;this.flipRun=false;this.line=0;this.lineLife=0;this.rush=0;this.rushFlash=0;this.rammed.clear();this.sync();}
 sync(){const p=this.g.player,b=this.board;if(!this.attached)return;b.x=p.x+10;b.y=p.y+27;b.vx=p.vx;b.vy=p.vy;b.grounded=p.grounded;}
 horizontal(dt:number,dir:number){
  const g=this.g,p=g.player;if(g.climb!==null||g.zip)return false;
  const quiet=g.keys.has('ShiftLeft')||g.keys.has('ShiftRight');
  if(quiet){p.vx+=clamp(dir*90-p.vx,-1800*dt,1800*dt);return true;}
  if(this.riding){
   if(dir){this.rideFace=dir;const accel=p.vx*dir<0?1750:680;p.vx+=clamp(dir*(470+this.line*25)-p.vx,-accel*dt,accel*dt);}
   else p.vx*=Math.exp(-(p.grounded?1.8:.12)*dt);
  }else if(!this.attached){
   // With the deck away, movement is ordinary responsive running, not skating.
   p.vx+=clamp(dir*260-p.vx,-(dir?2900:2200)*dt,(dir?2900:2200)*dt);
  }else if(dir){
   p.vx+=clamp(dir*300-p.vx,-1050*dt,1050*dt);
  }else p.vx+=clamp(-p.vx,-1500*dt,1500*dt);
  return true;
 }
 jump(){
  const g=this.g,p=g.player;
  if(p.grounded||g.coyote>0||g.wallGrace>0||g.climb!==null||g.zip)return false;
  if(!this.attached||this.airUsed)return false;
  this.airUsed=true;this.flip=.52;this.kickPose=.4;
  this.launch(true);p.vy=-620;g.coyote=0;g.jumpBuffer=0;
  g.audio.tone(400,.13,'triangle',.035,1100);g.emit(p.x+10,p.y+30,10,[THEO_COLOR,'#effcff'],140,2,.25);
  return true;
 }
 fireInput(_dt:number,firing:boolean){
  this.wasFiring=firing;
  if(!firing||this.riding||this.attack>0||this.g.fireTimer>0)return;
  this.swing();
 }
 swing(){
  const g=this.g;g.updateAim();const bare=!this.attached,finisher=!bare&&this.combo>=2;
  if(bare){this.punchStep=this.punchLife>0?this.punchCombo:0;this.punchCombo=(this.punchStep+1)%3;this.punchLife=.9;}else{this.punchCombo=0;this.punchLife=0;}
  this.strikePower=finisher?1:0;this.attackDuration=bare?(this.punchStep===2?.32:.22):finisher?.42:.27;
  this.shieldPose=0;this.throwPose=0;
  this.attack=this.attackDuration;this.attackKind=bare?3:finisher?4:this.attackKind===1?2:1;
  this.attackAngle=g.aimAngle;this.strikeOrigin={x:g.player.x+10,y:g.player.y+12};this.attackHit=false;g.fireTimer=this.attackDuration+.02;
  if(!bare){
   const lunge=finisher?330:170,dir=Math.sign(Math.cos(this.attackAngle));
   if(Math.abs(g.player.vx)<lunge||g.player.vx*dir<0)g.player.vx=dir*lunge;
   g.wallLock=finisher?.14:.065;
  }
  g.audio.noise(finisher?.16:.085,finisher?.05:.026,bare?[1700,1250,750][this.punchStep]:finisher?450:1000);
 }
 secondary(){if(this.attached)this.launch();else this.recall();}
 launch(down=false){
  if(!this.attached)return;
  const g=this.g,p=g.player,b=this.board,wasRiding=this.riding;g.updateAim();this.sync();
  const a=down?Math.PI/2:g.aimAngle,speed=down?570:580+Math.min(230,Math.abs(p.vx)*.55);
  b.state='out';b.kind='ride';this.mounted=false;this.mountBlend=0;this.attack=0;this.combo=0;b.x=p.x+10;b.y=p.y+(down?31:17);b.vx=down?p.vx:Math.cos(a)*speed;b.vy=Math.sin(a)*speed-(down?0:90);b.angle=a;b.age=0;b.grounded=false;b.hit.clear();b.trail=[];
  this.kickPose=down||wasRiding?.4:0;this.throwPose=down||wasRiding?0:.3;this.launches++;g.fireTimer=.3;this.launchVelocity=p.vx;this.flipRun=down;
  if(!down&&wasRiding){p.vy=Math.min(p.vy,-270);p.grounded=false;g.coyote=0;}
  g.shotCount++;g.makeNoise(b.x,b.y,330);g.audio.noise(.08,.045,950);g.audio.tone(180,.14,'triangle',.04,75);
 }
 recall(){
  const b=this.board;if(this.attached||b.state==='return')return;
  this.releasePassenger(b.vx*.7,-260);this.flipRun=false;b.state='return';b.kind='ride';b.hit.clear();
  // Return phases through terrain, while a swept hit pass still catches bots.
  this.g.audio.tone(880,.16,'triangle',.035,320);this.g.barks.request('recall');
 }
 catchBoard(safety=false){
  const g=this.g,p=g.player,b=this.board,returning=b.state==='return',earned=!safety&&(b.hit.size>0||this.flipRun);
  const dir=Number(g.keys.has('KeyD')||g.keys.has('ArrowRight'))-Number(g.keys.has('KeyA')||g.keys.has('ArrowLeft'));
  const travel=dir||(Math.abs(p.vx)>35?Math.sign(p.vx):0);
  if(earned){this.line=Math.min(3,this.line+1);this.lineLife=5;}
  {
   // Returning velocity points BACK toward Theo. It is never his ride direction.
   if(returning){if(travel)p.vx=travel*Math.min(545,Math.max(Math.abs(p.vx),Math.abs(this.launchVelocity),180)+(earned?65:0));}
   else if(travel&&b.vx*travel>=0)p.vx=travel*Math.min(545,Math.max(Math.abs(p.vx),Math.abs(b.vx))+(earned?45:0));
   this.rideFace=travel||this.rideFace;g.wallLock=.12;
  }
  b.state='attached';b.kind='ride';this.mounted=Math.abs(p.vx)>=230;this.mountBlend=this.mounted?1:0;b.trail=[];this.releasePassenger(p.vx,-220);this.catchPose=.48;this.punchLife=0;this.punchCombo=0;if(this.attackKind===3)this.attack=0;this.shieldPose=0;this.catches++;this.flipRun=false;
  g.emit(p.x+10,p.y+26,earned?22:12,[THEO_COLOR,'#ffffff','#d4c8a4'],earned?190:110,2,.3);
  g.rings.push({x:p.x+10,y:p.y+22,r:3,max:earned?40:25,life:.2,color:THEO_COLOR});g.audio.tone(450+this.line*80,.06,'square',.025,700);g.audio.tone(850+this.line*100,.11,'triangle',.03,1300);g.barks.request('catch');this.sync();
 }
 releasePassenger(vx:number,vy:number){
  const e=this.passenger;if(!e)return;this.passenger=null;
  if(e.dead)return;e.vx=vx;e.vy=vy;e.grounded=false;e.flung=.65;e.flungBy=this.g.id;e.stun=.6;
 }
 impact(x:number,y:number,strong=false){
  const g=this.g;g.emit(x,y,strong?22:12,[THEO_COLOR,'#fff0ce','#667a88'],strong?260:160,3,.4);
  g.audio.noise(strong?.16:.09,strong?.065:.035,450);g.audio.tone(strong?110:190,.12,'triangle',.04,45);
  g.shake=Math.max(g.shake,strong?5:2);if(g.effects)g.freeze=Math.max(g.freeze,strong?.04:.018);
 }
 damage(e:Enemy,power:number,vx:number,vy:number){
  const g=this.g;e.hp-=power;e.hurt=.2;e.stun=.35;e.flung=.4;e.flungBy=g.id;e.vx=vx;e.vy=vy;e.grounded=false;this.hits++;
  if(e.hp<=0)g.kill(e,vx,vy,true);
 }
 crash(){
  const b=this.board,g=this.g;this.crashes++;this.impact(b.x,b.y,true);g.makeNoise(b.x,b.y,650);
  if(this.passenger){const e=this.passenger;this.releasePassenger(-b.vx*.25,-290);this.damage(e,8+this.line*2,-b.vx*.25,-290);}
  b.vx*=-.24;b.vy=-150;b.age=Math.max(.3,b.age);b.hit.clear();
 }
 hitBoard(e:Enemy){
  const b=this.board,g=this.g;if(b.hit.has(e)||g.claimedByOther(e)||e.hacked>0)return;b.hit.add(e);
  const speed=Math.hypot(b.vx,b.vy);if(speed<125)return;
  const heavy=e.type==='shield'||e.type==='turret';
  this.impact(e.x+e.w/2,e.y+e.h/2,!!this.passenger||heavy);
  if(b.kind==='shield'){this.damage(e,2,b.vx*.5,-85);b.vx*=.6;return;}
  if(b.state==='return'){if(heavy)e.shieldDown=1;this.damage(e,4+this.line,b.vx*.45,Math.min(-130,b.vy*.4));this.returnHits++;return;}
  if(this.passenger){const old=this.passenger;this.releasePassenger(b.vx*.8,-270);this.damage(old,7,b.vx*.8,-270);this.damage(e,9+this.line*2,b.vx*.8,-240);b.vx*=.55;this.crashes++;}
  else if(!heavy&&b.state==='out'&&Math.abs(b.vx)>180){
   // Leave one hit point for a readable ride, then finish them at the crash.
   e.hp=Math.max(1,e.hp-3);e.hurt=.2;e.stun=2;e.grounded=false;this.passenger=e;this.carries++;b.vx*=.86;
  }else{if(heavy)e.shieldDown=1.6;this.damage(e,heavy?5:4,b.vx*.65,Math.min(-170,b.vy));b.vx*=heavy?.55:.85;}
 }
 defend(){
  if(!this.attached)return;
  const g=this.g,p=g.player,b=this.board;g.updateAim();const a=g.aimAngle;
  const angle=a+Math.PI/2,rx=Math.abs(Math.cos(angle))*21+Math.abs(Math.sin(angle))*6,ry=Math.abs(Math.sin(angle))*21+Math.abs(Math.cos(angle))*6;
  const origin={x:p.x+10,y:p.y+10},candidates=[origin];
  // A broad deck needs room to turn. Find a nearby clear placement, never
  // initialize its collider inside a wall and let terrain resolution eject it.
  for(let d=4;d<=28;d+=4)for(const [dx,dy] of [[-Math.cos(a),-Math.sin(a)],[0,-1],[-1,0],[1,0]])candidates.push({x:origin.x+dx*d,y:origin.y+dy*d});
  const spawn=candidates.find(pos=>!g.world.overlaps(pos.x-rx,pos.y-ry,rx*2,ry*2)&&g.lineOfSight(origin.x,origin.y,pos.x,pos.y));
  if(!spawn)return;
  b.state='out';b.kind='shield';b.normal=a;b.angle=a+Math.PI/2;b.wobble=0;b.x=spawn.x;b.y=spawn.y;
  b.vx=Math.cos(a)*285+p.vx*.55;b.vy=Math.sin(a)*285-65;b.age=0;b.grounded=false;b.hit.clear();b.trail=[];
  this.mounted=false;this.mountBlend=0;this.attack=0;this.combo=0;this.punchCombo=0;this.punchLife=0;this.throwPose=0;this.shieldPose=.42;this.shieldAim=a;this.flipRun=false;this.launchVelocity=p.vx;this.shieldTosses++;
  g.audio.noise(.19,.05,700);g.audio.tone(320,.15,'triangle',.04,85);g.audio.tone(110,.08,'sine',.025,65);
  g.emit(p.x+10,p.y+30,p.grounded?9:3,['#a8bbc0','#e0d2b3'],95,2,.22);g.shake=Math.max(g.shake,1.5);g.makeNoise(b.x,b.y,160);
 }
 intercept(shot:Bullet,from={x:shot.x,y:shot.y}){
  const b=this.board;if(b.state!=='out'||b.kind!=='shield'||shot.life<=0)return false;
  // Swept segment vs the oriented broad face, independent of player position.
  const cs=Math.cos(b.angle),sn=Math.sin(b.angle),local=(p:Point)=>({x:(p.x-b.x)*cs+(p.y-b.y)*sn,y:-(p.x-b.x)*sn+(p.y-b.y)*cs});
  const a=local(from),z=local(shot);let enter=0,exit=1;
  for(const [start,delta,half] of [[a.x,z.x-a.x,23],[a.y,z.y-a.y,7]]){
   if(Math.abs(delta)<.00001){if(Math.abs(start)>half)return false;continue;}
   const t1=(-half-start)/delta,t2=(half-start)/delta;enter=Math.max(enter,Math.min(t1,t2));exit=Math.min(exit,Math.max(t1,t2));if(enter>exit)return false;
  }
  const impulse=Math.min(2.5,Math.max(.5,shot.power));b.vx=clamp(b.vx+shot.vx*.13*impulse,-420,420);b.vy=clamp(b.vy+shot.vy*.13*impulse,-420,420);
  b.wobble=clamp(b.wobble+(a.x/23)*.16,-.35,.35);b.grounded=false;shot.life=0;this.blocks++;
  this.g.emit(shot.x,shot.y,8,[THEO_COLOR,'#fff3ca','#d4b887'],140,2,.25);this.g.audio.tone(320,.075,'triangle',.03,110);this.g.audio.noise(.04,.02,1900);return true;
 }
 updateShield(dt:number){
  const g=this.g,b=this.board;b.wobble*=Math.exp(-5*dt);b.angle=b.normal+Math.PI/2+b.wobble;
  const angle=b.normal+Math.PI/2;
  // Impact wobble is visual; changing collider bounds at rest would dig into floors.
  const rx=Math.abs(Math.cos(angle))*21+Math.abs(Math.sin(angle))*6,ry=Math.abs(Math.sin(angle))*21+Math.abs(Math.cos(angle))*6;
  b.vy=Math.min(480,b.vy+510*dt);if(b.grounded)b.vx*=Math.exp(-3.2*dt);
  const vx=b.vx,vy=b.vy,body={x:b.x-rx,y:b.y-ry,w:rx*2,h:ry*2,vx,vy,grounded:false};
  const wall=g.world.move(body,dt);b.x=body.x+rx;b.y=body.y+ry;b.vx=wall?-vx*.3:body.vx;b.vy=body.grounded&&vy>90?-vy*.24:body.vy;b.grounded=body.grounded&&vy<=90;
  if(wall||body.grounded&&vy>150){g.emit(b.x,b.y+ry,5,['#d7bb90',THEO_COLOR],70,2,.2);g.audio.tone(130,.065,'triangle',.016,75);}
  for(const e of g.enemies)if(!e.dead&&e.x+e.w>b.x-rx&&e.x<b.x+rx&&e.y+e.h>b.y-ry&&e.y<b.y+ry)this.hitBoard(e);
 }
 melee(){
  const g=this.g,a=this.attackAngle,bare=this.attackKind===3,hook=bare&&this.punchStep===2,range=bare?(hook?34:30):61+this.strikePower*19;
  const punchDamage=hook?3:2,punchKnock=hook?330:this.punchStep===1?160:110;
  const x=this.strikeOrigin.x,y=this.strikeOrigin.y;let connected=false;
  for(const e of g.enemies){if(e.dead||e.hacked>0||g.claimedByOther(e))continue;const dx=e.x+e.w/2-x,dy=e.y+e.h/2-y;
   if(Math.hypot(dx,dy)<range+e.w/2&&(dx*Math.cos(a)+dy*Math.sin(a)>-4)&&g.lineOfSight(x,y,e.x+e.w/2,e.y+e.h/2)){
    connected=true;e.shieldDown=this.attackKind===3?.25:1+this.strikePower;this.damage(e,bare?punchDamage:6+this.strikePower*6,Math.cos(a)*(bare?punchKnock:500+this.strikePower*350),Math.sin(a)*300-(bare?(hook?235:75):180+this.strikePower*170));this.impact(e.x+10,e.y+15,!bare||hook);
   }
  }
  if(this.attackKind!==3)for(let d=18;d<range;d+=8)for(const offset of [-.28,0,.28]){const tx=x+Math.cos(a+offset)*d,ty=y+Math.sin(a+offset)*d;if(g.world.damage(tx,ty,2+this.strikePower*4))g.emit(tx,ty,6,['#97a3a6',THEO_COLOR],110,3,.25);}
  for(const b of g.barrels)if(!b.dead&&Math.hypot(b.x+9-x,b.y+15-y)<range){b.hp-=this.attackKind===3?1:3;if(b.hp<=0){b.owner=g.id;b.fuse=.08;}}
  const boss=g.boss;if(boss.active&&!boss.dead&&boss.phase===2&&Math.hypot(clamp(x,boss.x,boss.x+boss.w)-x,clamp(y,boss.y,boss.y+boss.h)-y)<range) {boss.hp-=bare?punchDamage:6+this.strikePower*10;connected=true;}
  if(this.attackKind!==3){if(this.attackKind===4){if(connected){this.finishers++;g.barks.request('finisher');}this.combo=0;}else this.combo=connected?this.combo+1:0;this.comboLife=1.4;}
 }
 update(dt:number){
  const g=this.g,p=g.player,b=this.board;
  this.beforeMove={x:p.x,y:p.y};
  for(const [e,t] of this.rammed){if(e.dead||t<=dt)this.rammed.delete(e);else this.rammed.set(e,t-dt);}
  if(p.grounded)this.airUsed=false;
  for(const key of ['catchPose','kickPose','flip','rollSound','lineLife','rushFlash','throwPose','comboLife','punchLife','shieldPose'] as const)this[key]=Math.max(0,this[key]-dt);
  if(this.lineLife===0)this.line=0;
  if(this.punchLife===0)this.punchCombo=0;
  if(this.comboLife===0&&this.attack<=0)this.combo=0;
  if(this.attack>0){this.attack=Math.max(0,this.attack-dt);if(!this.attackHit&&this.attack<this.attackDuration-(this.attackKind===4||this.attackKind===3&&this.punchStep===2?.1:.05)){this.attackHit=true;this.melee();}}
  if(this.riding&&p.grounded&&Math.abs(p.vx)>100&&this.rollSound<=0){g.audio.noise(.08,.006+Math.abs(p.vx)/60000,700);this.rollSound=.1;}
  if(this.attached){this.sync();return;}
  b.age+=dt;b.trail.push({x:b.x,y:b.y});if(b.trail.length>8)b.trail.shift();
  const px=p.x+10,py=p.y+22,dist=Math.hypot(px-b.x,py-b.y);
  if(b.age>.32&&dist<(this.flipRun?44:28)&&(!this.flipRun||p.vy>=0)&&!this.passenger&&g.lineOfSight(b.x,b.y,px,py)){this.catchBoard();return;}
  if(b.y>LEVEL_HEIGHT+50||b.x<0||b.x>COLS*TILE){this.catchBoard(true);return;}
  if(b.state==='return'){
   const dx=px-b.x,dy=py-b.y,len=Math.hypot(dx,dy);
   // Clamp travel to the remaining distance: a close catch must never overshoot
   // and oscillate. Terrain has no collision or damage on the return.
   if(len<=26){this.catchBoard();return;}
   const speed=Math.min(740,len/Math.max(.001,dt));b.vx=dx/len*speed;b.vy=dy/len*speed;
   const steps=Math.max(1,Math.ceil(speed*dt/4));
   for(let i=0;i<steps;i++){
    b.x+=b.vx*dt/steps;b.y+=b.vy*dt/steps;
    if(!g.world.at(b.x,b.y))for(const e of g.enemies)if(!e.dead&&Math.abs(b.x-e.x-e.w/2)<e.w/2+16&&b.y>e.y-7&&b.y<e.y+e.h+7)this.hitBoard(e);
   }
   b.angle+=dt*22;b.grounded=false;return;
  }
  if(b.kind==='shield'){this.updateShield(dt);return;}
  b.vy=Math.min(600,b.vy+950*dt);if(b.grounded&&!this.flipRun)b.vx*=Math.exp(-.48*dt);
  const steps=Math.max(1,Math.ceil(Math.hypot(b.vx,b.vy)*dt/3));
  for(let i=0;i<steps;i++){
   const nx=b.x+b.vx*dt/steps,ny=b.y+b.vy*dt/steps;
   // Deck slides along floors; leading edge crashes into walls, without tunneling.
   const edge=nx+Math.sign(b.vx)*14;
   if(g.world.at(edge,b.y-2)||g.world.at(edge,b.y+1)){
    if(Math.abs(b.vx)>180){for(const yy of [-9,1])g.world.damage(edge,b.y+yy,5);this.crash();}
    else b.vx=0;
    break;
   }
   b.x=nx;
   if(b.vy>=0&&g.world.at(b.x,ny+5)){
    if(b.vy>360){this.impact(b.x,b.y,!!this.passenger);if(this.passenger){const e=this.passenger;this.releasePassenger(b.vx,-200);this.damage(e,7,b.vx,-200);}}
    b.y=Math.floor((ny+5)/TILE)*TILE-5;b.vy=0;b.grounded=true;
   }else if(b.vy<0&&g.world.at(b.x,ny-4)){b.vy=60;}else{b.y=ny;b.grounded=false;}
   for(const e of g.enemies)if(!e.dead&&e!==this.passenger&&Math.abs(b.x-e.x-e.w/2)<e.w/2+15&&b.y>e.y-5&&b.y<e.y+e.h+8)this.hitBoard(e);
   for(const barrel of g.barrels)if(!barrel.dead&&Math.abs(b.vx)>160&&Math.abs(b.x-barrel.x-9)<24&&Math.abs(b.y-barrel.y-15)<25){barrel.owner=g.id;barrel.hp=0;barrel.fuse=.05;}
   const boss=g.boss;if(boss.active&&!boss.dead&&boss.phase===2&&b.x>boss.x-12&&b.x<boss.x+boss.w+12&&b.y>boss.y&&b.y<boss.y+boss.h&&Math.abs(b.vx)>120){boss.hp-=7;this.crash();break;}
  }
  b.angle=b.grounded?0:b.angle+dt*13;
  if(this.passenger){const e=this.passenger;if(e.dead)this.passenger=null;else{e.x=b.x-e.w/2;e.y=b.y-e.h-3;e.vx=b.vx;e.vy=b.vy;e.stun=.5;e.hurt=.1;e.face=Math.sign(b.vx)||1;if(b.age>1.65||Math.abs(b.vx)<110){this.releasePassenger(b.vx,-230);this.damage(e,5,b.vx,-230);}}}
 }
 afterMove(dt:number){
  if(this.g.state!=='playing')return;
  const g=this.g,p=g.player,speed=Math.abs(p.vx);
  const dirInput=Number(g.keys.has('KeyD')||g.keys.has('ArrowRight'))-Number(g.keys.has('KeyA')||g.keys.has('ArrowLeft'));
  if(!this.attached||g.climb!==null||g.zip||g.wallGrip)this.mounted=false;
  else if(this.mounted&&p.grounded&&speed<135)this.mounted=false;
  else if(!this.mounted&&p.grounded&&speed>=245&&dirInput&&this.attack<=0&&!this.wasFiring){this.mounted=true;this.mounts++;this.rideFace=Math.sign(p.vx)||g.face;g.audio.tone(150,.075,'triangle',.02,80);}
  this.mountBlend=clamp(this.mountBlend+(this.mounted?1:-1)*dt/0.22,0,1);
  const active=this.riding&&speed>=370&&this.mountBlend>.65;
  const was=this.rush;this.rush+=(Number(active)-this.rush)*Math.min(1,dt*16);
  if(active&&was<.1){this.rushFlash=.22;g.audio.noise(.09,.02,1300);}
  if(!active)return;
  const dir=Math.sign(p.vx),from=this.beforeMove;
  const left=Math.min(from.x,p.x)-6,right=Math.max(from.x,p.x)+p.w+12;
  const top=Math.min(from.y,p.y),bottom=Math.max(from.y,p.y)+p.h;
  for(const e of g.enemies){
   if(e.dead||e.hacked>0||g.claimedByOther(e)||this.rammed.has(e)||e.x+e.w<left||e.x>right||e.y+e.h<top||e.y>bottom)continue;
   if(!g.lineOfSight(p.x+10,p.y+17,e.x+e.w/2,e.y+e.h/2))continue;
   this.rammed.set(e,.65);const heavy=e.type==='shield'||e.type==='turret';e.shieldDown=1.5;
   this.damage(e,4.5+(speed-370)/65,dir*(speed+240),-220);this.impact(e.x+e.w/2,e.y+e.h/2,true);this.rams++;this.rushFlash=.24;
   // Light bots barely dent the run; armor has enough weight to demand a line.
   p.vx*=heavy?.84:.975;g.makeNoise(p.x+10,p.y+20,380);
  }
  const boss=g.boss;
  if(boss.active&&!boss.dead&&p.x+32>boss.x&&p.x-8<boss.x+boss.w&&p.y+32>boss.y&&p.y<boss.y+boss.h){
   if(boss.phase===2)boss.hp-=8;this.impact(p.x+10+dir*15,p.y+15,true);p.vx*=.55;
  }
 }
 drawHero(){theo(this.g.c,this.g.player.x-this.g.cam,this.g.player.y,this.g.face,this.g.time,this);}
 draw(){
  const g=this.g,b=this.board,c=g.c;
  if(!this.attached){
   c.save();for(let i=0;i<b.trail.length;i++){c.globalAlpha=i/b.trail.length*.16;(b.kind==='shield'?shieldDeck:deck)(c,b.trail[i].x-g.cam,b.trail[i].y,b.angle,1);}c.restore();c.save();if(b.state==='return')c.globalAlpha=.65;(b.kind==='shield'?shieldDeck:deck)(c,b.x-g.cam,b.y,b.angle,1);c.restore();
   if(b.state==='return'){text(c,'↩',b.x-g.cam,b.y-18,THEO_COLOR,12,'center');}
   else if(Math.abs(b.vx)<70&&b.age>.5){text(c,'E ↩',b.x-g.cam,b.y-16,THEO_COLOR,8,'center');}
   if(b.x<g.cam+20||b.x>g.cam+940||b.y<g.camY+20||b.y>g.camY+510){const x=clamp(b.x-g.cam,25,935),y=clamp(b.y,g.camY+35,g.camY+495);deck(c,x,y,0,.6);text(c,'E',x,y-10,THEO_COLOR,8,'center');}
  }
  if(this.passenger){const e=this.passenger;c.save();c.strokeStyle='#e2b178';c.lineWidth=3;const x=e.x+e.w/2-g.cam,y=e.y+10;c.beginPath();c.moveTo(x-5,y);c.lineTo(x-16,y-8+Math.sin(g.time*35)*6);c.moveTo(x+5,y);c.lineTo(x+16,y-10-Math.sin(g.time*35)*6);c.stroke();c.restore();}
  if(this.catchPose>0)text(c,this.line?`CLEAN CATCH ×${this.line}`:this.riding?'ROLL ON!':'CAUGHT!',g.player.x+10-g.cam,g.player.y-25,THEO_COLOR,9,'center');
 }
 hud(){
  const g=this.g,$=(s:string)=>document.querySelector<HTMLElement>(s)!;
  $('.name').textContent='THEO';$('.role').textContent='THE FREE RIDER';$('#resource-name').textContent='MOMENTUM';
  const speed=Math.round(Math.abs(g.player.vx)/470*100);$('#usage').textContent=this.attached?`${Math.min(100,speed)}%`:this.board.state==='return'?'RETURNING':'DECK OUT';
  for(const s of ['.meter-fill','.meter-trail'])$(s).style.width=`${this.attached?Math.min(100,speed):0}%`;
  $('.resources').classList.remove('tokens-low','tokens-empty');$('.resources').style.setProperty('--shot-color',THEO_COLOR);
  $('#token-cost').textContent=this.rush>.5?'RAM READY · KEEP YOUR LINE':!this.attached?(this.board.kind==='shield'?'DECK BLOCKING · E RECALL':'E RECALL · PUNCH WHILE IT FLIES'):this.riding?'E LAUNCH · Q SHIELD TOSS':this.combo>=2?'NEXT HIT · DECK FINISHER':'CLICK · DECK COMBO / RUN TO SKATE';$('#token-spend').textContent='';
  $('#secondary-ready').textContent=g.relays.some(r=>!r.done&&Math.hypot(r.x-g.player.x,r.y-g.player.y)<130)?'E OVERRIDE':this.attached?'E THROW':'E RECALL';
  $('#defense-ready').textContent=this.attached?'Q SHIELD TOSS':this.board.kind==='shield'?'Q DECK BLOCKING':'Q NEED DECK';$('#defense-ready').classList.toggle('spent',!this.attached);
  $('#control-jump').textContent='JUMP / AIR KICKFLIP';$('#control-fire').textContent=this.riding?'RAM AT SPEED':this.attached?'DECK COMBO':'BOXING COMBO';$('#control-e').textContent='THROW / RECALL';$('#control-q').textContent='THROW SHIELD';
  g.canvas.setAttribute('aria-label','Theo: A/D run and automatically mount your board at speed; slow down to carry it. Space jumps and again in midair launches a stronger kickflip. Mouse aims. Click for a board combo on foot, or weaker punches without it. Ride at speed to ram. E throws or recalls the board, or overrides a nearby uplink. Q tosses the physical board as a shield. Escape pauses.');
  theoPortrait((document.querySelector('.portrait') as HTMLCanvasElement).getContext('2d')!);
 }
 snapshot(){return {state:this.name,punchStep:this.punchStep,punchCombo:this.punchCombo,shieldPose:this.shieldPose,mounted:this.mounted,mountBlend:this.mountBlend,mounts:this.mounts,combo:this.combo,finishers:this.finishers,blocks:this.blocks,shieldTosses:this.shieldTosses,line:this.line,rams:this.rams,rush:this.rush,returnHits:this.returnHits,board:{kind:this.board.kind,x:this.board.x,y:this.board.y,state:this.board.state,vx:this.board.vx,vy:this.board.vy},passenger:this.passenger?.type??null,catches:this.catches,launches:this.launches,carries:this.carries,crashes:this.crashes,hits:this.hits,airUsed:this.airUsed};}
}
