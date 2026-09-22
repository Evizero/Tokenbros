import type { Game } from './game';
import type { Body } from './world';
import { clamp } from './world';
import { claw,terminal,CLAW_COLORS } from './peter-art';
import { rect,text } from './art';
import { reflect } from './defense-geometry';
type Pet=Body&{id:number;type:number;age:number;cool:number;hop:number;hp:number;maxHp:number;state:'deploy'|'follow'|'attack'|'return';stuck:number;bite:number;hurt:number;charge:number;chargeDuration:number;firstDash:boolean;slam:number;dash:number;fuse:number;attackAngle:number;dashHits:Set<unknown>};
export class PeterKit {
 handBurst:{x:number;y:number;angle:number;life:number}|null=null;
 serial=0;focus:Game['enemies'][number]|null=null;focusBoss=false;orderTime=0;
 pets:Pet[]=[];throwCooldown=0;stock=6;recharge=0;molt=0;moltCooldown=0;commandCooldown=0;terminalTime=0;punch=0;commandPoint:{x:number;y:number}|null=null;
 constructor(public g:Game){}
 get kind(){return Math.min(2,Math.floor(this.g.thinking*1.5));}
 get name(){return ['PINCHER','SKIPPER','CRUSHER'][this.kind];}
 throw(){
  const g=this.g;if(this.throwCooldown>0)return;
  if(this.stock<1){this.throwCooldown=.2;return;}
  if(this.pets.length>=4){this.throwCooldown=.4;return;}
  this.stock--;const a=g.aimAngle,k=this.kind,x=g.player.x+10,y=g.player.y+16;
  const maxHp=k===2?8:5;
  const p:Pet={id:++this.serial,x:x-7,y:y-5,w:14,h:10,vx:Math.cos(a)*620,vy:Math.sin(a)*480-230,grounded:false,type:k,age:0,cool:.12,hop:0,hp:maxHp,maxHp,state:'deploy',stuck:0,bite:0,hurt:0,charge:0,chargeDuration:.45,firstDash:true,slam:0,dash:0,fuse:0,attackAngle:0,dashHits:new Set()};
  g.barks.request('summon');this.pets.push(p);this.throwCooldown=.45;g.muzzle=.1;g.makeNoise(x,y,100);g.audio.tone(k===2?180:540,.1,'triangle',.04,250);
 }

 hit(e:Game['enemies'][number],damage:number,dx:number,heavy=false){
  const g=this.g;if(heavy&&e.shield>0){e.shield=0;g.debris.armor(e.x,e.y,e.face);}
  e.hp-=damage;e.hurt=.12;e.wind=0;e.stun=heavy?.4:.12;e.vx=dx;e.vy=heavy?-140:e.vy;
  g.emit(e.x+10,e.y+12,9,[CLAW_COLORS[this.kind],'#fff1bc'],170,3,.3);g.audio.tone(130,.06,'square',.025,60);
  if(e.hp<=0)g.kill(e,dx,-160,heavy);
 }
 smash(x:number,y:number,r:number){const g=this.g;for(let dx=-r;dx<=r;dx+=12)for(let dy=-r;dy<=r;dy+=12)if(dx*dx+dy*dy<r*r){const b=g.world.damage(x+dx,y+dy,5);if(b)g.emit(x+dx,y+dy,3,['#a4b17f','#e5bd68'],90,4);}}
 handAttack(){
  const g=this.g,a=g.aimAngle,x=g.player.x+10,y=g.player.y+16,k=this.kind;
  this.punch=k===2?.17:.1;g.fireTimer=[.55,.22,.42][k];g.lastCooldown=g.fireTimer;g.shotCount++;
  if(k===1){
    g.bullets.push({x:x+Math.cos(a)*18,y:y+Math.sin(a)*18,vx:Math.cos(a)*680,vy:Math.sin(a)*680,life:.7,hostile:false,power:1.5,pierce:0,boost:false,tier:0,color:CLAW_COLORS[1],hit:new Set()});
    g.makeNoise(x,y,280);g.audio.tone(720,.075,'triangle',.035,240);return;
  }
  if(k===0){
    // Short, directional snap blast; its brief pulse can swat incoming bullets.
    let reach=38;for(let r=8;r<=38;r+=3)if(g.world.at(x+Math.cos(a)*r,y+Math.sin(a)*r)){reach=Math.max(0,r-4);break;}
    const bx=x+Math.cos(a)*reach,by=y+Math.sin(a)*reach;
    this.handBurst={x:bx,y:by,angle:a,life:.1};
    g.emit(bx,by,17,['#ff8457','#ffcf91','#fff0ca'],170,4,.25);g.rings.push({x:bx,y:by,r:8,max:35,life:.15,color:'#ffb084'});g.shake=Math.max(g.shake,2);
    for(const e of g.enemies)if(!e.dead&&Math.hypot(e.x+10-bx,e.y+15-by)<42&&g.lineOfSight(x,y,e.x+10,e.y+15))this.hit(e,2,Math.cos(a)*105);
    const b=g.boss;if(b.active&&!b.dead&&b.phase===2&&Math.hypot(b.x+38-bx,b.y+38-by)<65&&g.lineOfSight(x,y,b.x+38,b.y+38))b.hp-=2;
    for(const b of g.bullets)this.deflect(b);
    g.makeNoise(bx,by,320);g.audio.noise(.09,.045,2200);g.audio.tone(150,.1,'triangle',.035,65);return;
  }
  for(const e of g.enemies){const dx=e.x+10-x,dy=e.y+15-y,d=Math.hypot(dx,dy);if(!e.dead&&d<82&&dx*Math.cos(a)+dy*Math.sin(a)>d*.4&&g.lineOfSight(x,y,e.x+10,e.y+15))this.hit(e,2.5,Math.cos(a)*130,true);}
  const b=g.boss,dx=b.x+38-x,dy=b.y+38-y,d=Math.hypot(dx,dy);
  if(b.active&&!b.dead&&b.phase===2&&d<110&&dx*Math.cos(a)+dy*Math.sin(a)>d*.4&&g.lineOfSight(x,y,b.x+38,b.y+38))b.hp-=2.5;
  g.makeNoise(x,y,120);g.audio.tone(150,.075,'triangle',.025,100);
 }
 deflect(b:Game['bullets'][number]){
  const pulse=this.handBurst;if(!pulse||pulse.life<=0||!b.hostile||b.life<=0)return false;
  const nx=Math.cos(pulse.angle),ny=Math.sin(pulse.angle);
  if(Math.hypot(b.x-pulse.x,b.y-pulse.y)>35||b.vx*nx+b.vy*ny>=0||!this.g.lineOfSight(pulse.x,pulse.y,b.x,b.y))return false;
  const v=reflect(b.vx,b.vy,pulse.angle);b.vx=v.vx;b.vy=v.vy;b.hostile=false;b.power=2;b.tier=0;b.pierce=0;b.color='#ffc193';b.hit.clear();b.life=1.2;
  this.g.emit(b.x,b.y,6,['#ffca91','#fff1c9'],130,2,.2);return true;
 }
 burst(p:Pet){
  const g=this.g,x=p.x+7,y=p.y+5;p.hp=0;p.fuse=0;
  g.emit(x,y,24,['#ff8457','#ffc88a','#fff0c1'],180,4,.5);g.rings.push({x,y,r:0,max:48,life:.22,color:'#ff986c'});g.shake=Math.max(g.shake,3);g.audio.noise(.18,.08,2100);g.audio.tone(110,.2,'sine',.08,35);g.makeNoise(x,y,560);
  for(const e of g.enemies)if(!e.dead&&Math.hypot(e.x+10-x,e.y+15-y)<52&&g.lineOfSight(x,y,e.x+10,e.y+15))this.hit(e,5,Math.sign(e.x-x)*180,true);
  for(const b of g.barrels)if(!b.dead&&Math.hypot(b.x+9-x,b.y+15-y)<48)b.fuse=b.fuse||.12;
  const b=g.boss;if(b.active&&!b.dead&&b.phase===2&&Math.hypot(b.x+38-x,b.y+38-y)<80&&g.lineOfSight(x,y,b.x+38,b.y+38)) b.hp-=6;
 }
 dashStep(p:Pet,dt:number){
  const g=this.g,distance=Math.min(p.dash,720*dt),steps=Math.max(1,Math.ceil(distance/5));
  for(let i=0;i<steps;i++){
    p.vx=Math.cos(p.attackAngle)*720;p.vy=Math.sin(p.attackAngle)*720;
    const wall=g.world.move(p,distance/steps/720);p.dash=Math.max(0,p.dash-distance/steps);
    for(const e of g.enemies)if(!e.dead&&!p.dashHits.has(e)&&Math.hypot(e.x+10-p.x-7,e.y+15-p.y-5)<26&&g.lineOfSight(p.x+7,p.y+5,e.x+10,e.y+15)){p.dashHits.add(e);this.hit(e,4,Math.cos(p.attackAngle)*160);p.bite=.15;}
    const b=g.boss;if(b.active&&!b.dead&&b.phase===2&&!p.dashHits.has(b)&&Math.hypot(b.x+38-p.x,b.y+38-p.y)<52&&g.lineOfSight(p.x+7,p.y+5,b.x+38,b.y+38)){p.dashHits.add(b);b.hp-=5;}
    if(wall||p.grounded||p.vx===0&&Math.abs(Math.cos(p.attackAngle))>.2||p.vy===0&&Math.abs(Math.sin(p.attackAngle))>.2){p.dash=0;break;}
  }
  if(p.dash<=0){p.vx=0;p.vy=0;p.cool=1.5;}
 }
 crusherSlam(p:Pet){
  const g=this.g,x=p.x+7,y=p.y+5,nx=Math.cos(p.attackAngle),ny=Math.sin(p.attackAngle);
  p.cool=.8;p.bite=.3;this.smash(x+nx*25,y+ny*25,30);
  for(const e of g.enemies){const dx=e.x+10-x,dy=e.y+15-y,d=Math.hypot(dx,dy);
    if(!e.dead&&e.hacked<=0&&d<55&&dx*nx+dy*ny>-d*.2&&g.lineOfSight(x,y,e.x+10,e.y+15)){
      this.hit(e,6,(Math.sign(nx)||g.face)*430,true);
      if(!e.dead){e.vy=-220;e.stun=.5;e.flung=.4;}
    }
  }
  const b=g.boss;if(this.focusBoss&&b.active&&!b.dead&&b.phase===2&&Math.hypot(b.x+38-x,b.y+38-y)<80&&g.lineOfSight(x,y,b.x+38,b.y+38))b.hp-=9;
  g.emit(x+nx*24,y+ny*24,22,['#ffe3a0','#e5bd68','#fff5cf'],240,4,.35);
  g.rings.push({x:x+nx*20,y:y+ny*20,r:8,max:42,life:.2,color:'#ffe0a0'});
  g.makeNoise(x,y,430);g.shake=Math.max(g.shake,5);if(g.effects)g.freeze=Math.max(g.freeze,.04);
  g.audio.noise(.12,.055,1100);g.audio.tone(95,.15,'triangle',.06,35);
 }
 punchAttack(){
  const g=this.g,a=g.aimAngle,x=g.player.x+10,y=g.player.y+16;this.punch=.18;g.fireTimer=.28;g.lastCooldown=.28;g.shotCount++;g.player.vx=Math.cos(a)*360;g.wallLock=.12;g.invuln=Math.max(g.invuln,.16);g.makeNoise(x,y,470);
  for(const e of g.enemies){const dx=e.x+10-x,dy=e.y+15-y,d=Math.hypot(dx,dy);if(!e.dead&&d<110&&(dx*Math.cos(a)+dy*Math.sin(a))>d*.25&&g.lineOfSight(x,y,e.x+10,e.y+15))this.hit(e,7,Math.cos(a)*390,true);}
  this.smash(x+Math.cos(a)*65,y+Math.sin(a)*65,34);
  for(const b of g.barrels)if(!b.dead&&Math.hypot(b.x-x,b.y-y)<100)b.fuse=.05;
  const boss=g.boss;if(boss.active&&!boss.dead&&boss.phase===2&&Math.hypot(boss.x+38-x,boss.y+38-y)<145)boss.hp-=9;
  g.rings.push({x:x+Math.cos(a)*55,y:y+Math.sin(a)*55,r:0,max:38,life:.16,color:'#ffbd82'});g.shake=4;g.audio.tone(95,.16,'sawtooth',.06,35);
 }
 transform(){
  if(this.moltCooldown>0)return;const g=this.g;g.barks.request('molt');this.molt=5;this.moltCooldown=16;this.stock=6;g.fireTimer=0;
  g.emit(g.player.x+10,g.player.y+16,24,['#617d9e','#90a8bb','#d9ac87'],240,6,.7);g.makeNoise(g.player.x,g.player.y,650);g.shake=6;g.audio.blast();
  for(const e of g.enemies)if(!e.dead&&Math.hypot(e.x-g.player.x,e.y-g.player.y)<80)this.hit(e,3,Math.sign(e.x-g.player.x)*330,true);
 }
 command(){
  const g=this.g;if(this.commandCooldown>0)return;this.commandCooldown=.2;this.terminalTime=0;
  const point=g.aimPoint(),dx=point.x-(g.player.x+10),dy=point.y-(g.player.y+16),d=Math.hypot(dx,dy),scale=Math.min(1,480/Math.max(1,d));
  this.commandPoint={x:g.player.x+10+dx*scale,y:g.player.y+16+dy*scale};
  this.focus=g.enemies.filter(e=>!e.dead&&e.hacked<=0&&Math.hypot(e.x+10-this.commandPoint!.x,e.y+15-this.commandPoint!.y)<85&&g.lineOfSight(g.player.x+10,g.player.y+16,e.x+10,e.y+15)).sort((a,b)=>Math.hypot(a.x-point.x,a.y-point.y)-Math.hypot(b.x-point.x,b.y-point.y))[0]??null;
  this.focusBoss=g.boss.active&&!g.boss.dead&&Math.hypot(g.boss.x+38-point.x,g.boss.y+38-point.y)<90;
  this.orderTime=d<65?0:8;
  if(d<65){this.focus=null;this.focusBoss=false;this.commandPoint=null;}
  const clicked=this.focus??(this.focusBoss?g.boss:null);
  if(clicked&&point.x>=clicked.x-6&&point.x<=clicked.x+clicked.w+6&&point.y>=clicked.y-6&&point.y<=clicked.y+clicked.h+6)this.terminalTime=.7;
  g.audio.tone(640,.12,'triangle',.035,960);
 }
 hurtPet(p:Pet,damage=1,grace=.3){
  if(p.hp<=0||p.state==='return'||p.hurt>0)return;
  p.hp-=damage;p.hurt=grace;this.g.emit(p.x+7,p.y+5,6,[CLAW_COLORS[p.type],'#fff1bc'],100,2);
 }
 absorb(x:number,y:number){const p=this.pets.find(p=>p.hp>0&&p.state!=='return'&&x>p.x-3&&x<p.x+p.w+3&&y>p.y-4&&y<p.y+p.h+4);if(!p)return false;this.hurtPet(p);return true;}
 diggablePath(x:number,y:number,tx:number,ty:number){
  const steps=Math.ceil(Math.hypot(tx-x,ty-y)/8);
  for(let i=1;i<steps;i++){const b=this.g.world.at(x+(tx-x)*i/steps,y+(ty-y)*i/steps);if(b&&(b.kind===3||b.kind===4))return false;}
  return true;
 }
 update(dt:number){
  if(this.handBurst){this.handBurst.life-=dt;if(this.handBurst.life<=0)this.handBurst=null;}
  const g=this.g;this.throwCooldown=Math.max(0,this.throwCooldown-dt);this.molt=Math.max(0,this.molt-dt);this.moltCooldown=Math.max(0,this.moltCooldown-dt);this.commandCooldown=Math.max(0,this.commandCooldown-dt);this.terminalTime=Math.max(0,this.terminalTime-dt);this.punch=Math.max(0,this.punch-dt);this.orderTime=Math.max(0,this.orderTime-dt);
  if(this.focus?.dead)this.focus=null;
  if(this.commandPoint&&Math.hypot(this.commandPoint.x-g.player.x,this.commandPoint.y-g.player.y)>680){this.focus=null;this.focusBoss=false;this.commandPoint=null;this.orderTime=0;}
  if(g.boss.dead)this.focusBoss=false;
  if(this.stock<6){this.recharge+=dt;if(this.recharge>=1.3){this.stock++;this.recharge=0;}}else this.recharge=0;
  for(const [i,p] of this.pets.entries()){
    p.age+=dt;p.cool-=dt;p.hop-=dt;p.hurt=Math.max(0,p.hurt-dt);p.bite=Math.max(0,p.bite-dt);if(p.hp<=0)continue;
    const homeX=g.player.x+10-g.face*(30+i*22),homeY=g.player.y+(p.type===1?-26:24);
    if(Math.hypot(p.x-g.player.x,p.y-g.player.y)>680||p.stuck>1.8||p.y>990){p.state='return';p.stuck=0;p.charge=0;p.dash=0;p.slam=0;}
    if(p.state==='return'){
      p.x+=(g.player.x-p.x)*Math.min(1,dt*8);p.y+=(g.player.y-p.y)*Math.min(1,dt*8);p.vx=0;p.vy=0;
      if(Math.hypot(p.x-g.player.x,p.y-g.player.y)<25){p.state='follow';p.hop=.2;}continue;
    }
    if(p.slam>0){p.slam-=dt;p.vx=0;p.vy=Math.min(620,p.vy+780*dt);g.world.move(p,dt);if(p.slam<=0)this.crusherSlam(p);continue;}
    if(p.fuse>0){p.fuse-=dt;if(p.fuse<=0)this.burst(p);continue;}
    if(p.charge>0){p.charge-=dt;p.vx=0;p.vy=0;if(p.charge<=0){p.dash=190;p.dashHits.clear();g.audio.tone(950,.1,'triangle',.04,250);}continue;}
    if(p.dash>0){this.dashStep(p,dt);continue;}
    const ordered=this.orderTime>0&&this.commandPoint;
    const canSee=(e:Game['enemies'][number])=>!e.dead&&e.hacked<=0&&Math.hypot(e.x-g.player.x,e.y-g.player.y)<700&&(g.lineOfSight(p.x+7,p.y+5,e.x+10,e.y+15)||p.type===2&&this.diggablePath(p.x+7,p.y+5,e.x+10,e.y+15));
    // The order defines a search area. After one target falls, find another in that area.
    const target=this.focus&&canSee(this.focus)?this.focus:this.focusBoss?undefined:g.enemies.filter(e=>canSee(e)&&(ordered?Math.hypot(e.x+10-this.commandPoint!.x,e.y+15-this.commandPoint!.y)<160:Math.hypot(e.x-p.x,e.y-p.y)<(p.type===1&&p.firstDash?230:150))).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
    const bossTarget=this.focusBoss&&g.boss.active&&!g.boss.dead;
    const tx=target?target.x+10:bossTarget?g.boss.x+38:ordered?this.commandPoint!.x:homeX;
    const ty=target?target.y+15:bossTarget?g.boss.y+38:ordered?this.commandPoint!.y:homeY;
    const attacking=!!target||bossTarget;
    if(p.state==='deploy'&&((p.age>.12&&p.grounded)||p.age>1.3))p.state='follow';
    if((p.state!=='deploy'||p.type!==2&&p.age>.12)&&attacking&&p.cool<=0){
      const distance=Math.hypot(tx-p.x-7,ty-p.y-5);
      if(p.type===0&&distance<(bossTarget?55:32)){p.state='attack';p.fuse=.16;p.vx=0;p.vy=0;g.audio.tone(680,.08,'square',.025,1000);continue;}
      if(p.type===1&&distance<230&&g.lineOfSight(p.x+7,p.y+5,tx,ty)){p.state='attack';p.chargeDuration=p.firstDash?.1:.45;p.firstDash=false;p.charge=p.chargeDuration;p.attackAngle=Math.atan2(ty-p.y-5,tx-p.x-7);p.vx=0;p.vy=0;continue;}
    }
    if(p.type===2&&p.state!=='deploy'&&(attacking||ordered)){
      const dx=tx-p.x-7,dy=ty-p.y-5,length=Math.max(1,Math.hypot(dx,dy));
      const x=p.x+7+dx/length*25,y=p.y+5+dy/length*25,block=g.world.at(x,y);
      if(block&&block.kind<3){
        p.vx=0;p.stuck=0;p.state='attack';
        if(p.cool<=0){this.smash(x,y,25);p.cool=.55;p.bite=.3;g.makeNoise(p.x+7,p.y+5,320);g.audio.tone(100,.1,'square',.025,50);}
        p.vy=Math.min(620,p.vy+780*dt);g.world.move(p,dt);continue;
      }
    }
    if(p.state!=='deploy'){
      p.state=attacking?'attack':'follow';
      if(p.type===1){
        // Skipper repositions between explicitly telegraphed, fixed-distance dashes.
        const orbit=attacking&&p.cool>.25,ox=orbit?Math.cos(g.time*4+i)*38:0,oy=orbit?-26:Math.sin(g.time*3+i)*5;
        p.vx=clamp((tx+ox-p.x-7)*5,-210,210);p.vy=clamp((ty+oy-p.y-5)*5,-200,200);
      }else{
        const speed=p.type===2?190:185;p.vx=Math.abs(tx-p.x-7)>15?Math.sign(tx-p.x-7)*speed:0;
        if(p.grounded&&p.hop<=0&&(ty<p.y-24||p.type===0&&Math.abs(tx-p.x)>90)){p.vy=-385;p.grounded=false;p.hop=.65;}

      }
    }
    if(p.type!==1||p.state==='deploy')p.vy=Math.min(620,p.vy+780*dt);
    const oldX=p.x,oldY=p.y,wall=g.world.move(p,dt);
    const obstacle=g.world.at(p.x+(tx>p.x?p.w+8:-8),p.y+5),breakable=p.type===2&&obstacle&&obstacle.kind<3;
    if(breakable&&p.state!=='deploy'&&p.cool<=0){this.smash(p.x+Math.sign(tx-p.x)*24,p.y+5,28);p.cool=1.1;p.bite=.3;}
    if(wall&&!breakable&&p.state!=='deploy'&&p.hop<=0){p.vy=-400;p.hop=.65;}
    if(Math.hypot(tx-p.x,ty-p.y)>60&&Math.hypot(p.x-oldX,p.y-oldY)<.25)p.stuck+=dt;else p.stuck=Math.max(0,p.stuck-dt*.5);
    // Deployment is harmless. All damage comes from a companion reaching and attacking a target.
    if(p.state!=='deploy'&&p.cool<=0){
      if(p.type===2&&attacking&&Math.hypot(tx-p.x-7,ty-p.y-5)<(bossTarget?65:44)&&g.lineOfSight(p.x+7,p.y+5,tx,ty)){
        p.slam=.14;p.attackAngle=Math.atan2(ty-p.y-5,tx-p.x-7);p.vx=0;
      }

    }
  }
  for(const p of this.pets)if(p.hp<=0)g.emit(p.x,p.y,10,[CLAW_COLORS[p.type]],100,3);
  this.pets=this.pets.filter(p=>p.hp>0);
 }
 draw(){
  const g=this.g,c=g.c;
  if(this.handBurst){const b=this.handBurst,f=b.life/.1,x=b.x-g.cam,y=b.y;c.save();c.translate(x,y);c.rotate(b.angle);c.globalAlpha=f;c.strokeStyle='#ffc591';c.lineWidth=3;c.beginPath();c.arc(0,0,12+(1-f)*23,-1.5,1.5);c.stroke();rect(c,-8*f,-4*f,19*f,8*f,'#fff0c8');rect(c,-3*f,-10*f,7*f,20*f,'#ffb16f');c.restore();}
  for(const p of this.pets){
    c.globalAlpha=p.state==='return'?.45:p.hurt>0&&Math.floor(g.time*20)%2?.5:1;
    const face=p.type===2&&(p.slam>0||p.bite>0)?Math.cos(p.attackAngle)>=0?1:-1:Math.abs(p.vx)>5?Math.sign(p.vx):g.face;
    claw(c,p.x+7-g.cam,p.y+5,p.type,g.time,face,(p.type===2?1.45:1.15)+(p.bite>0?.16:0),p.type===2?p.bite/.3:0,p.slam/.14);c.globalAlpha=1;
    if(p.charge>0){const x=p.x+7-g.cam,y=p.y+5;c.strokeStyle='#78dbea99';c.lineWidth=1;c.setLineDash([3,5]);c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.cos(p.attackAngle)*190,y+Math.sin(p.attackAngle)*190);c.stroke();c.setLineDash([]);rect(c,x-13,y-17,26*(1-p.charge/p.chargeDuration),3,'#b3f3ff');text(c,'CHARGE',x,y-23,'#a9eaf6',7,'center');}
    if(p.dash>0){c.strokeStyle='#78dbea';c.lineWidth=4;c.beginPath();c.moveTo(p.x+7-g.cam,p.y+5);c.lineTo(p.x+7-g.cam-Math.cos(p.attackAngle)*32,p.y+5-Math.sin(p.attackAngle)*32);c.stroke();}
    if(p.fuse>0){text(c,'!',p.x+7-g.cam,p.y-19,'#fff0b0',13,'center');c.strokeStyle=Math.floor(p.fuse*22)%2?'#fff4c1':'#ff8457';c.lineWidth=2;c.beginPath();c.arc(p.x+7-g.cam,p.y+5,12+(1-p.fuse/.16)*8,0,Math.PI*2);c.stroke();}
    rect(c,p.x-1-g.cam,p.y-8,16,2,'#17202a');rect(c,p.x-1-g.cam,p.y-8,16*p.hp/p.maxHp,2,CLAW_COLORS[p.type]);
    if(p.bite>0){text(c,p.type===2?'CRUNCH':p.type===0?'SNIP':'ZIP',p.x+7-g.cam,p.y-14,CLAW_COLORS[p.type],7,'center');}
    if(p.state==='return'){c.strokeStyle=CLAW_COLORS[p.type];c.lineWidth=1;c.beginPath();c.arc(p.x+7-g.cam,p.y+5,17,0,Math.PI*2);c.stroke();}
  }
  const marked=this.focus&&!this.focus.dead?{x:this.focus.x+10,y:this.focus.y+15}:this.focusBoss?{x:g.boss.x+38,y:g.boss.y+38}:this.orderTime>0?this.commandPoint:null;
  if(this.orderTime>0&&this.commandPoint){const x=this.commandPoint.x-g.cam,y=this.commandPoint.y;c.save();c.strokeStyle='#efac8460';c.lineWidth=1;c.setLineDash([5,12]);c.beginPath();c.arc(x,y,160,0,Math.PI*2);c.stroke();c.setLineDash([]);text(c,'HUNT AREA',x,y+28,'#e0b599',8,'center');c.restore();}
  if(marked){const x=marked.x-g.cam,y=marked.y;c.strokeStyle='#ff9679';c.lineWidth=2;c.strokeRect(x-18,y-22,36,43);text(c,'PACK TARGET',x,y-28,'#ffb099',8,'center');}
  if(this.terminalTime>0){c.save();c.globalAlpha=Math.min(1,this.terminalTime*4);terminal(c,g.player.x-g.cam-32,g.player.y-49,'openclaw onboard');c.restore();}
  if(this.molt>0)text(c,'MOLT '+this.molt.toFixed(1),g.player.x+10-g.cam,g.player.y-11,'#ffd39b',8,'center');
 }
}
