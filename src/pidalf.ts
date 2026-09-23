import type { PlayerRuntime as Game } from './player-runtime';
import { type Body,clamp,overlap,LEVEL_HEIGHT,TILE,COLS } from './world';
import { robot,rect,text } from './art';
import { PI_COLOR,forceWave } from './pidalf-art';
type Enemy=Game['enemies'][number];
type ScrapBall=Body&{mass:number;round:boolean;angle:number;life:number;hit:Map<Enemy,number>;flash:number;crate?:boolean};
type Barrel=Game['barrels'][number];
type Grenade=Game['grenades'][number];
type Held={body:Body;enemy?:Enemy;barrel?:Barrel;grenade?:Grenade;mass:number;ox:number;oy:number;vx:number;vy:number};
type SlopWave={x:number;y:number;angle:number;radius:number;travel:number;scale:number;remaining:number;hit:Set<Enemy>;pushed:Set<unknown>;life:number};
type Crush={x:number;y:number;scale:number;age:number;duration:number;targets:Enemy[];seen:Set<Enemy>;budget:number;fromGrab?:boolean;carry?:boolean};
export class PidalfKit {
 waves:SlopWave[]=[];props:ScrapBall[]=[];held:Held[]=[];grabbing=false;grabTime=0;grabCooldown=0;compactCooldown=0;crush:Crush|null=null;
 slap:{age:number;duration:number;x:number;y:number;scale:number;hit:boolean}|null=null;
 qCooldown=0;ward=0;wardHit=false;wardCharging=false;wardCharge=0;wardPower=0;wardDirectional=false;wardAngle=0;crunchRecoil=0;
 ghosts:{x:number;y:number;face:number;age:number;dx:number}[]=[];message='';messageLife=0;
 constructor(public g:Game){}
 get scale(){return this.g.thinking/2;}
 get radius(){return 20+this.scale*105;}
 get capacity(){return 1+Math.floor(this.scale*5);}
 get mass(){return this.held.reduce((s,h)=>s+h.mass,0);}
 get wardPose(){return this.wardCharging?.001+this.wardCharge*.349:this.ward>0&&!this.wardDirectional?.35+(1-this.ward/.65)*.65:0;}
 get swatPose(){return this.ward>0&&this.wardDirectional?1-this.ward/.26:0;}
 get wardRadius(){return this.wardDirectional?92:110+this.wardPower*120+this.scale*20;}
 get castPose(){return this.crush?Math.max(.001,this.crush.age/this.crush.duration):this.crunchRecoil>0?1+(1-this.crunchRecoil/.24)*.3:0;}
 get pose(){return this.slap?this.slap.age/this.slap.duration:0;}
 weight(e:Enemy){return e.type==='turret'?3:e.type==='shield'?2:1;}
 feedback(s:string){this.message=s;this.messageLife=1.1;}
 point(){const p=this.g.aimPoint(),g=this.g,x=g.player.x+10,y=g.player.y+16,d=Math.hypot(p.x-x,p.y-y),f=Math.min(1,360/Math.max(1,d));return {x:x+(p.x-x)*f,y:y+(p.y-y)*f};}
 inReach(b:Body){const g=this.g;return Math.hypot(b.x+b.w/2-g.player.x-10,b.y+b.h/2-g.player.y-16)<390;}
 visible(b:Body){const g=this.g;return this.inReach(b)&&g.lineOfSight(g.player.x+10,g.player.y+16,b.x+b.w/2,b.y+b.h/2);}
 targets(x:number,y:number,r:number,needsSight=true){return this.g.enemies.filter(e=>!e.dead&&e.hacked<=0&&!this.g.claimedByOther(e)&&Math.hypot(e.x+10-x,e.y+15-y)<=r&&(needsSight?this.visible(e):this.inReach(e))).sort((a,b)=>Math.hypot(a.x+10-x,a.y+15-y)-Math.hypot(b.x+10-x,b.y+15-y));}
 controls(e:Enemy){return this.held.some(h=>h.enemy===e)||!!this.crush?.targets.includes(e);}
 fire(){
  const g=this.g;if(this.slap||this.crush||this.ward>0||this.wardCharging)return;if(this.grabbing){this.compactHeld();g.fireTimer=.2;return;}const p=this.point(),s=this.scale;
  this.slap={age:0,duration:.46+s*.25,x:p.x,y:p.y,scale:s,hit:false};g.fireTimer=.62+s*.5;g.lastCooldown=g.fireTimer;g.shotCount++;
  g.audio.noise(.12,.025,1200);g.audio.tone(230,.12,'triangle',.025,100);
 }
 strike(a:NonNullable<PidalfKit['slap']>){
  const g=this.g,x=g.player.x+10,y=g.player.y+16,angle=Math.atan2(a.y-y,a.x-x);
  this.waves.push({x,y,angle,radius:14+a.scale*20,travel:0,scale:a.scale,remaining:1+Math.floor(a.scale*2),hit:new Set(),pushed:new Set(),life:1});g.barks.request('shockwave');
  g.audio.noise(.13,.055,950);g.audio.tone(210,.14,'triangle',.04,65);g.makeNoise(x,y,480);
 }
 waveHit(e:Enemy,w:SlopWave){
  const g=this.g,dx=Math.cos(w.angle),dy=Math.sin(w.angle);w.hit.add(e);w.remaining--;
  if(e.type==='turret'||e.type==='shield'&&e.shield>0){e.shield=0;e.hp-=4;e.stun=.65;e.vx=dx*230;e.vy=dy*180-100;e.flungBy=g.id;e.flung=.7;g.debris.armor(e.x,e.y,dx>=0?1:-1);if(e.hp<=0)g.kill(e,dx*420,dy*180-140,true);}
  else{this.ghosts.push({x:e.x,y:e.y,face:e.face,age:0,dx:dx>=0?1:-1});g.kill(e,dx*460,dy*200-130,true);}
  g.audio.scrap(true);g.audio.tone(85,.16,'sawtooth',.05,35);g.shake=Math.max(g.shake,5);if(g.effects)g.freeze=.045;
 }
 updateWaves(dt:number){
  const g=this.g;
  for(const w of this.waves){const distance=(1100-740*w.scale)*dt,steps=Math.max(1,Math.ceil(distance/5));
   for(let i=0;i<steps&&w.life>0;i++){
    w.x+=Math.cos(w.angle)*distance/steps;w.y+=Math.sin(w.angle)*distance/steps;w.travel+=distance/steps;
    const tile=g.world.at(w.x,w.y);
    if(tile){if(tile.kind===2){const p=this.loosenCrate({x:Math.floor(w.x/TILE)*TILE,y:Math.floor(w.y/TILE)*TILE,w:TILE,h:TILE,vx:0,vy:0,grounded:false});this.pushWithWave(w,p,p);w.remaining--;}else{const broken=g.world.damage(w.x,w.y,3+w.scale*4);g.emit(w.x,w.y,broken?15:8,[PI_COLOR,'#919d98'],150,3);w.life=0;break;}}
    for(const grenade of g.grenades)if(grenade.life>0&&Math.hypot(grenade.x-w.x,grenade.y-w.y)<w.radius+4&&g.lineOfSight(w.x,w.y,grenade.x,grenade.y)){grenade.owner=g.id;this.pushWithWave(w,grenade,grenade);}
    for(const barrel of g.barrels)if(!barrel.dead&&Math.hypot(barrel.x+9-w.x,barrel.y+15-w.y)<w.radius+12&&g.lineOfSight(w.x,w.y,barrel.x+9,barrel.y+15)){barrel.mobile=true;barrel.owner=g.id;this.pushWithWave(w,barrel,barrel);}
    for(const p of this.props)if(p.crate&&p.life>0&&Math.hypot(p.x+10-w.x,p.y+10-w.y)<w.radius+10&&g.lineOfSight(w.x,w.y,p.x+10,p.y+10))this.pushWithWave(w,p,p);
    for(const e of g.enemies){if(w.remaining<=0)break;if(e.dead||w.hit.has(e))continue;const xx=clamp(w.x,e.x,e.x+e.w),yy=clamp(w.y,e.y,e.y+e.h);if(Math.hypot(xx-w.x,yy-w.y)<w.radius&&g.lineOfSight(w.x,w.y,e.x+10,e.y+15))this.waveHit(e,w);}
    for(const p of this.props)if(!p.crate&&p.life>0&&w.remaining>0&&Math.hypot(p.x+p.w/2-w.x,p.y+p.h/2-w.y)<p.w/2+w.radius&&g.lineOfSight(w.x,w.y,p.x+p.w/2,p.y+p.h/2)){
     p.life=0;w.remaining--;g.emit(p.x,p.y,28,[PI_COLOR,'#829095','#ecdfc4'],340,5,.6);g.audio.scrap(true);for(const e of g.enemies)if(!e.dead&&e.hacked<=0&&Math.hypot(e.x+10-p.x,e.y+15-p.y)<75+p.mass*7&&g.lineOfSight(p.x,p.y,e.x+10,e.y+15)){e.hp-=4+p.mass;if(e.hp<=0)g.kill(e,Math.cos(w.angle)*350,-200,true);}
    }
    const b=g.boss;if(b.active&&!b.dead&&b.phase===2&&Math.hypot(b.x+38-w.x,b.y+38-w.y)<38+w.radius&&g.lineOfSight(w.x,w.y,b.x+38,b.y+38)){b.hp-=7;w.remaining=0;}
    if(w.remaining<=0||w.travel>=400)w.life=0;
   }
  }
  this.waves=this.waves.filter(w=>w.life>0);
 }

 grenadeBody(grenade:Grenade):Body{return {
  get x(){return grenade.x-4;},set x(v){grenade.x=v+4;},get y(){return grenade.y-4;},set y(v){grenade.y=v+4;},w:8,h:8,
  get vx(){return grenade.vx;},set vx(v){grenade.vx=v;},get vy(){return grenade.vy;},set vy(v){grenade.vy=v;},grounded:false
 };}
 crateCandidates(x:number,y:number,r:number){
  const found:Body[]=[];
  for(let cy=Math.floor((y-r)/TILE);cy<=Math.floor((y+r)/TILE);cy++)for(let cx=Math.floor((x-r)/TILE);cx<=Math.floor((x+r)/TILE);cx++)
   if(this.g.world.get(cx,cy)?.kind===2&&Math.hypot(cx*TILE+10-x,cy*TILE+10-y)<=r){const b={x:cx*TILE,y:cy*TILE,w:TILE,h:TILE,vx:0,vy:0,grounded:false};if(this.inReach(b))found.push(b);}
  return found;
 }
 loosenCrate(b:Body){
  const cx=Math.floor(b.x/TILE),cy=Math.floor(b.y/TILE);this.g.world.blocks[cy*COLS+cx]=null;
  const p:ScrapBall={...b,mass:1,round:false,crate:true,angle:0,life:60,hit:new Map(),flash:.18};this.props.push(p);return p;
 }
 pushWithWave(w:SlopWave,object:unknown,b:{vx:number;vy:number}){
  if(w.pushed.has(object))return;w.pushed.add(object);b.vx=Math.cos(w.angle)*(740-w.scale*220);b.vy=Math.sin(w.angle)*470-170;
  this.g.emit(w.x,w.y,5,[PI_COLOR,'#d9c09b'],130,2,.25);
 }
 grab(){
  if(this.grabbing||this.crush||this.slap||this.wardCharging||this.ward>0||this.grabCooldown>0)return;
  const p=this.point();let budget=this.capacity;const bodies:{body:Body;enemy?:Enemy;barrel?:Barrel;grenade?:Grenade;mass:number;crate?:boolean}[]=[...this.crateCandidates(p.x,p.y,this.radius).map(body=>({body,mass:1,crate:true})),...this.g.grenades.filter(b=>b.life>0&&Math.hypot(b.x-p.x,b.y-p.y)<this.radius&&this.inReach(this.grenadeBody(b))).map(grenade=>({body:this.grenadeBody(grenade),grenade,mass:1})),...this.g.barrels.filter(b=>!b.dead&&this.inReach(b)&&Math.hypot(b.x+b.w/2-p.x,b.y+b.h/2-p.y)<this.radius).map(barrel=>({body:barrel,barrel,mass:1})),...this.props.filter(b=>b.life>0&&this.inReach(b)&&Math.hypot(b.x+b.w/2-p.x,b.y+b.h/2-p.y)<this.radius).map(body=>({body,mass:body.mass})),...this.targets(p.x,p.y,this.radius,false).map(enemy=>({body:enemy,enemy,mass:this.weight(enemy)}))];
  bodies.sort((a,b)=>Math.hypot(a.body.x-p.x,a.body.y-p.y)-Math.hypot(b.body.x-p.x,b.body.y-p.y));
  for(const h of bodies){if(h.mass>budget||this.g.peers.some(a=>a!==this.g&&(a.dimillianKit.paired===h.enemy&&!!h.enemy||a.pidalfKit.held.some(o=>o.body===h.body||!!h.grenade&&o.grenade===h.grenade)||!!h.enemy&&(a.pidalfKit.controls(h.enemy)||a.marcusKit.pacman.controls(h.enemy)))))continue;budget-=h.mass;if(h.crate)h.body=this.loosenCrate(h.body);this.held.push({body:h.body,enemy:h.enemy,barrel:h.barrel,grenade:h.grenade,mass:h.mass,ox:clamp(h.body.x+h.body.w/2-p.x,-55,55),oy:clamp(h.body.y+h.body.h/2-p.y,-45,45),vx:0,vy:0});if(h.barrel)h.barrel.mobile=true;if(h.enemy){h.enemy.wind=0;h.enemy.dash=0;h.enemy.stun=.2;}}
  if(!this.held.length){this.feedback('AIM AT A BOT, BARREL OR SCRAP');return;}
  this.grabbing=true;this.grabTime=0;this.g.audio.tone(150,.22,'sine',.04,410);
 }
 release(throwing=true){
  if(this.crush)this.crush.carry=false;
  if(!this.grabbing)return;const mass=this.mass;
  for(const h of this.held){if(h.grenade&&throwing)h.grenade.owner=this.g.id;if(h.barrel&&throwing)h.barrel.owner=this.g.id;h.body.vx=throwing?clamp(h.vx*1.65,-980,980):0;h.body.vy=throwing?clamp(h.vy*1.65,-850,850):0;if(h.enemy&&!h.enemy.dead){h.enemy.stun=1.3;h.enemy.flungBy=this.g.id;h.enemy.flung=1.3;h.enemy.cool=.6;}}
  if(throwing){this.g.audio.noise(.12,.05,800);this.g.audio.tone(300,.1,'triangle',.03,80);}
  this.held=[];this.grabbing=false;this.grabCooldown=throwing?.75+mass*.2:.25;
 }
 // A small press needs a direct cursor hit; large fields can start in empty space.
 directTarget(x:number,y:number){return this.g.enemies.find(e=>!e.dead&&e.hacked<=0&&!this.g.claimedByOther(e)&&x>=e.x-4&&x<=e.x+e.w+4&&y>=e.y-4&&y<=e.y+e.h+4);}
 gather(a:Crush,candidates:Enemy[]){
  const g=this.g;
  for(const e of candidates){
   if(a.seen.has(e)||this.weight(e)>a.budget||!this.visible(e)||!g.lineOfSight(a.x,a.y,e.x+10,e.y+15))continue;
   a.seen.add(e);
   if((e.type==='shield'||e.type==='turret')&&e.shield>0){e.shield=0;e.hp-=2;e.stun=.7;g.debris.armor(e.x,e.y,g.face);if(e.hp<=0)g.kill(e);continue;}
   a.budget-=this.weight(e);a.targets.push(e);e.wind=0;e.dash=0;
  }
 }
 compactHeld(){
  if(this.crush||this.compactCooldown>0)return;
  const g=this.g,s=this.scale;
  const selected=this.held.flatMap(h=>h.enemy&&!h.enemy.dead&&this.visible(h.enemy)?[h.enemy]:[]);
  if(!selected.length){if(this.held.some(h=>h.enemy))this.feedback('PULL INTO VIEW · CLICK TO COMPACT');return;}
  const targets=s<.35?selected.slice(0,1):selected;
  const x=targets.reduce((n,e)=>n+e.x+10,0)/targets.length,y=targets.reduce((n,e)=>n+e.y+15,0)/targets.length;
  if(!g.lineOfSight(g.player.x+10,g.player.y+16,x,y)||g.world.at(x,y)){this.feedback('PULL INTO VIEW · CLICK TO COMPACT');return;}
  const a:Crush={x,y,scale:s,age:0,duration:.65+s*.8,targets:[],seen:new Set(),budget:this.capacity,fromGrab:true,carry:true};
  this.gather(a,targets);
  if(!a.targets.length){this.feedback('ARMOR STRIPPED');this.compactCooldown=.65;return;}
  this.held=this.held.filter(h=>!h.enemy||!a.targets.includes(h.enemy));
  this.crush=a;this.compactCooldown=3.5+s*4;
  g.audio.tone(210,.6,'sawtooth',.035,45);g.makeNoise(x,y,500+s*500);
 }
 compact(){
  if(this.grabbing){this.compactHeld();return;}
  if(this.crush||this.slap||this.wardCharging||this.ward>0||this.compactCooldown>0)return;
  const g=this.g,p=g.aimPoint(),s=this.scale,large=s>=.35;
  if(Math.hypot(p.x-g.player.x-10,p.y-g.player.y-16)>360){this.feedback('F OUT OF REACH');return;}
  const target=this.directTarget(p.x,p.y),center=!large&&target?{x:target.x+10,y:target.y+15}:p;
  if(!g.lineOfSight(g.player.x+10,g.player.y+16,center.x,center.y)||g.world.at(center.x,center.y)){this.feedback('F BLOCKED · E CAN GRAB');return;}
  const b=g.boss;
  if(!target&&b.active&&!b.dead&&b.phase===2&&p.x>=b.x&&p.x<=b.x+b.w&&p.y>=b.y&&p.y<=b.y+b.h){b.hp-=14;this.compactCooldown=5;g.emit(p.x,p.y,30,[PI_COLOR,'#ffffff'],180,4);g.audio.scrap(true);return;}
  if(!large&&!target){this.feedback('AIM AT A BOT · OR SCROLL UP');return;}
  this.release(false);
  const a:Crush={...center,scale:s,age:0,duration:.65+s*.8,targets:[],seen:new Set(),budget:this.capacity};
  this.gather(a,large?this.targets(p.x,p.y,22+s*120):[target!]);
  if(!large&&!a.targets.length){this.feedback(target&&this.weight(target)>this.capacity?'MORE SCALE TO COMPACT':'ARMOR STRIPPED');this.compactCooldown=.65;return;}
  this.crush=a;this.compactCooldown=3.5+s*4;
  g.audio.tone(210,.6,'sawtooth',.035,45);g.makeNoise(center.x,center.y,500+s*500);
 }
 defend(){
  if(this.qCooldown>0||this.wardCharging||this.ward>0)return;
  this.release(false);this.crush=null;this.slap=null;this.wardCharge=0;this.wardCharging=true;
  this.g.audio.tone(160,.16,'triangle',.025,300);
 }
 cancelDefense(){this.wardCharging=false;this.wardCharge=0;}
 releaseDefense(){
  if(!this.wardCharging)return;
  const g=this.g;g.updateAim();this.wardPower=this.wardCharge;this.wardDirectional=this.wardCharge<.2;this.wardAngle=g.aimAngle;
  this.cancelDefense();this.ward=this.wardDirectional?.26:.65;this.wardHit=false;
  this.qCooldown=this.wardDirectional?1.1:2.4+this.wardPower*3.6;
  if(this.wardDirectional){this.wardHit=true;this.repel();}
  else g.audio.tone(220,.12,'triangle',.045,80);
 }
 wardReaches(tx:number,ty:number){
  const g=this.g,x=g.player.x+10,y=g.player.y+16,dx=tx-x,dy=ty-y,d=Math.hypot(dx,dy);
  return d<this.wardRadius&&(!this.wardDirectional||dx*Math.cos(this.wardAngle)+dy*Math.sin(this.wardAngle)>d*.5)&&g.lineOfSight(x,y,tx,ty);
 }
 reflectShots(){
  const g=this.g,x=g.player.x+10,y=g.player.y+16;
  for(const b of g.bullets)if(b.hostile&&b.life>0&&this.wardReaches(b.x,b.y)){
   const a=this.wardDirectional?this.wardAngle:Math.atan2(b.y-y,b.x-x),v=Math.max(420,Math.hypot(b.vx,b.vy));
   b.vx=Math.cos(a)*v;b.vy=Math.sin(a)*v;b.hostile=false;b.owner=g.id;b.color='#e2eeeb';b.power=Math.min(3,b.power);b.hit.clear();b.life=Math.max(b.life,.5);g.emit(b.x,b.y,4,['#d6e7e4','#fff5d3'],140,2,.3);
  }
  for(const b of g.grenades)if((!this.wardDirectional||b.owner!==g.id)&&b.life>0&&this.wardReaches(b.x,b.y)){const a=this.wardDirectional?this.wardAngle:Math.atan2(b.y-y,b.x-x);b.owner=g.id;b.vx=Math.cos(a)*580;b.vy=Math.sin(a)*380-220;}
 }
 repel(){
  const g=this.g,x=g.player.x+10,y=g.player.y+16,r=this.wardRadius,power=this.wardPower,tap=this.wardDirectional;
  for(const e of g.enemies)if(!e.dead&&e.hacked<=0&&this.wardReaches(e.x+10,e.y+15)){
   const a=tap?this.wardAngle:Math.atan2(e.y+15-y,e.x+10-x),resist=this.weight(e)>1?.65:1,force=tap?260:460+power*340;
   e.vx=Math.cos(a)*force*resist;e.vy=Math.sin(a)*force*.7*resist-(tap?60:180);e.stun=tap?.25:.65+power*.5;e.flungBy=g.id;e.flung=tap?.3:1.1;e.wind=0;e.dash=0;
   e.hp-=tap?1:2+Math.floor(power*6);if(e.hp<=0)g.kill(e,e.vx,e.vy,true);else if(!tap)g.debris.armor(e.x,e.y,Math.sign(e.vx)||g.face);
  }
  if(!tap)for(const b of this.crateCandidates(x,y,r)){
   const cx=b.x+10,cy=b.y+10,d=Math.hypot(cx-x,cy-y);let clear=true;
   for(let t=4;t<d;t+=4){const xx=x+(cx-x)*t/d,yy=y+(cy-y)*t/d;if(g.world.at(xx,yy)){clear=Math.floor(xx/TILE)===Math.floor(b.x/TILE)&&Math.floor(yy/TILE)===Math.floor(b.y/TILE);break;}}
   if(clear)this.loosenCrate(b);
  }
  for(const p of [...this.props,...g.barrels.filter(b=>!b.dead)])if(this.wardReaches(p.x+p.w/2,p.y+p.h/2)){const a=tap?this.wardAngle:Math.atan2(p.y+p.h/2-y,p.x+p.w/2-x);if('fuse' in p){p.mobile=true;p.owner=g.id;}p.vx=Math.cos(a)*(tap?280:540+power*200);p.vy=Math.sin(a)*400-150;}
  this.reflectShots();
  const boss=g.boss;if(!tap&&boss.active&&!boss.dead&&boss.phase===2&&this.wardReaches(boss.x+38,boss.y+38))boss.hp-=4+power*10;
  if(tap){g.audio.noise(.09,.035,950);g.audio.tone(260,.1,'triangle',.025,100);g.makeNoise(x,y,210);return;}
  g.rings.push({x,y,r:8,max:r,life:.38,color:'#edf4eb'});g.rings.push({x,y,r:3,max:r*.88,life:.5,color:PI_COLOR});g.emit(x,y,24+power*28,[PI_COLOR,'#edf4eb','#baa47d'],300+power*180,4,.5);g.emit(x,g.player.y+32,20+power*16,['#8e8170','#c4ab7d','#f4d291'],220+power*100,5,.65);g.audio.noise(.18,.065,1200);g.audio.tone(95,.25,'sine',.06,32);g.shake=Math.max(g.shake,5+power*7);if(g.effects)g.freeze=.035+power*.045;g.makeNoise(x,y,700+power*250);g.barks.request('repel');
 }
 updateDefense(dt:number){
  const g=this.g;this.qCooldown=Math.max(0,this.qCooldown-dt);
  if(this.wardCharging){
   if(!g.keys.has('KeyQ'))this.releaseDefense();
   else{const before=this.wardCharge;this.wardCharge=Math.min(1,this.wardCharge+dt/1.1);
    if(before<1&&this.wardCharge===1){g.audio.tone(640,.18,'triangle',.04,960);g.emit(g.player.x+10,g.player.y-26,14,['#fff7dd',PI_COLOR],100,2,.4);}
   }
  }
  if(this.ward>0){this.ward=Math.max(0,this.ward-dt);
   if(!this.wardHit&&this.ward<=.53){this.wardHit=true;this.repel();}
   if(this.wardDirectional&&this.ward>.08)this.reflectShots();
  }
 }
 aimGuide(){
  const g=this.g,raw=g.aimPoint(),p=this.point(),x=g.player.x+10,y=g.player.y+16,d=Math.hypot(raw.x-x,raw.y-y);let wall:{x:number;y:number}|null=null;
  const candidates=g.enemies.filter(e=>!e.dead&&e.hacked<=0&&!this.g.claimedByOther(e)&&Math.hypot(e.x+10-raw.x,e.y+15-raw.y)<26+this.scale*68).sort((a,b)=>Math.hypot(a.x+10-raw.x,a.y+15-raw.y)-Math.hypot(b.x+10-raw.x,b.y+15-raw.y));
  const target=candidates[0],prop=this.props.find(b=>b.life>0&&Math.hypot(b.x+b.w/2-raw.x,b.y+b.h/2-raw.y)<b.w/2+20),barrel=g.barrels.find(b=>!b.dead&&Math.hypot(b.x+9-raw.x,b.y+15-raw.y)<29),grenade=g.grenades.find(b=>b.life>0&&Math.hypot(b.x-raw.x,b.y-raw.y)<20),crate=this.crateCandidates(raw.x,raw.y,16)[0],body=target??barrel??prop??(grenade?this.grenadeBody(grenade):crate);
  const linePoint=body&&d<=360?{x:body.x+body.w/2,y:body.y+body.h/2}:p,len=Math.hypot(linePoint.x-x,linePoint.y-y);for(let t=8;t<len;t+=4){const xx=x+(linePoint.x-x)*t/len,yy=y+(linePoint.y-y)*t/len;if(g.world.at(xx,yy)){wall={x:xx,y:yy};break;}}
  const compactTarget=this.scale<.35?this.directTarget(raw.x,raw.y):undefined;
  const compactPoint=compactTarget?{x:compactTarget.x+10,y:compactTarget.y+15}:raw;
  const blocked=!g.lineOfSight(x,y,compactPoint.x,compactPoint.y)||!!g.world.at(compactPoint.x,compactPoint.y);
  const grabValid=!!body&&d<=360&&this.inReach(body);
  const compactValid=d<=360&&!blocked&&(this.scale>=.35||!!compactTarget);
  return {x,y,raw,p,linePoint,wall,target,prop,barrel,grenade,crate,body,range:d>360,blocked,grabValid,compactValid,compactTarget,valid:grabValid||compactValid};
 }
 clear(){this.release(false);this.crush=null;this.crunchRecoil=0;this.slap=null;this.ward=0;this.cancelDefense();this.waves=[];this.props=[];this.ghosts=[];}
 update(dt:number){
  const g=this.g;this.crunchRecoil=Math.max(0,this.crunchRecoil-dt);this.updateDefense(dt);this.grabCooldown=Math.max(0,this.grabCooldown-dt);this.compactCooldown=Math.max(0,this.compactCooldown-dt);this.messageLife=Math.max(0,this.messageLife-dt);
  if(this.slap){const a=this.slap;a.age+=dt;if(!a.hit&&a.age/a.duration>=.27){a.hit=true;this.strike(a);}if(a.age>=a.duration)this.slap=null;}
  this.updateWaves(dt);
  this.ghosts.forEach(x=>x.age+=dt);this.ghosts=this.ghosts.filter(x=>x.age<.38);
  if(this.grabbing){
   if(!g.keys.has('KeyE'))this.release();
   else{if(!this.crush?.carry)this.grabTime+=dt;const p=this.point(),mass=this.mass;
    this.held=this.held.filter(h=>!h.enemy?.dead&&!h.barrel?.dead&&(!h.grenade||h.grenade.life>0)&&(!('life' in h.body)||(h.body as ScrapBall).life>0));
  for(const h of this.held){const b=h.body,ox=b.x,oy=b.y;
     const dx=p.x+h.ox-b.x-b.w/2,dy=p.y+h.oy-b.y-b.h/2;
     b.vx=clamp(dx*(11-mass*.65),-720,720);b.vy=clamp(dy*(11-mass*.65),-650,650);g.world.move(b,dt);
     const f=1-Math.exp(-18*dt);h.vx+=((b.x-ox)/dt-h.vx)*f;h.vy+=((b.y-oy)/dt-h.vy)*f;if(h.barrel)h.barrel.mobile=true;if(h.enemy){h.enemy.wind=0;h.enemy.stun=.15;}
    }
    if(this.grabTime>3.2||(!this.held.length&&!this.crush?.carry)){this.release();this.feedback('RELEASED');}
   }
  }
  if(this.crush){const a=this.crush;a.age+=dt;const t=clamp(a.age/a.duration,0,1);
   if(!a.fromGrab&&a.scale>=.35&&t<.7)this.gather(a,this.targets(a.x,a.y,22+a.scale*120));
   for(const e of a.targets){if(e.dead)continue;e.wind=0;e.stun=.2;const dx=a.x-e.x-10,dy=a.y-e.y-15;e.vx=dx*12;e.vy=dy*12;g.world.move(e,dt);}
   if(t>=1){this.crunchRecoil=.24;let mass=0;for(const e of a.targets)if(!e.dead){mass+=this.weight(e);e.hp=0;e.dead=true;g.kills++;g.chargeKills++;g.barks.killed();}
    if(mass){const size=a.scale<.35?18:24+mass*4;let x=a.x-size/2,y=a.y-size/2;let placed=!g.world.overlaps(x,y,size,size);for(let i=1;!placed&&i<=10;i++){y=a.y-size/2-i*8;placed=!g.world.overlaps(x,y,size,size);}if(placed){const prop:ScrapBall={x,y,w:size,h:size,vx:a.scale>.35?g.face*85:0,vy:40,grounded:false,mass,round:a.scale>=.35,angle:0,life:24,hit:new Map(),flash:.25};this.props.push(prop);
      if(a.carry&&g.keys.has('KeyE')){const p=this.point();this.held.push({body:prop,mass,ox:clamp(x+size/2-p.x,-55,55),oy:clamp(y+size/2-p.y,-45,45),vx:0,vy:0});this.grabbing=true;this.grabTime=Math.min(this.grabTime,1.7);g.rings.push({x:x+size/2,y:y+size/2,r:4,max:size+12,life:.3,color:PI_COLOR});}
     }
     if(this.props.length>6)this.props.shift();g.emit(a.x,a.y,28,[PI_COLOR,'#889497','#ede3cf'],150,4,.45);g.audio.scrap(true);g.audio.tone(65,.2,'triangle',.06,28);g.shake=Math.max(g.shake,7);if(g.effects)g.freeze=.07;this.feedback(mass>1?'COMPACTED':'NICE AND SMALL.');g.makeNoise(a.x,a.y,900);}
    this.crush=null;
   }
  }
  for(const p of this.props){p.life-=dt;p.flash=Math.max(0,p.flash-dt);if(this.held.some(h=>h.body===p))continue;
   p.vy=Math.min(850,p.vy+1100*dt);const vx=p.vx,vy=p.vy,speed=Math.hypot(vx,vy),wall=g.world.move(p,dt);
   if(wall){p.vx=-vx*.46;p.flash=.13;if(speed>180){g.audio.scrap(false);g.shake=Math.max(g.shake,3);}}
   if(p.grounded){if(vy>180){p.vy=-vy*.28;p.flash=.15;g.audio.tone(85,.08,'triangle',.035,35);g.emit(p.x+p.w/2,p.y+p.h,8,['#a49880',PI_COLOR],90,3);g.shake=Math.max(g.shake,Math.min(5,p.mass));}p.vx*=Math.exp(-(p.round?.65:7)*dt);}
   p.angle+=p.round?p.vx/p.w*dt:(!p.grounded?dt*p.vx*.008:0);
   if(speed>130){for(const e of g.enemies)if(!e.dead&&e.hacked<=0&&overlap(p,e)&&(p.hit.get(e)??0)<g.time){p.hit.set(e,g.time+.7);e.hp-=Math.min(9,2+p.mass*1.5);e.shield=0;e.stun=.6;e.flungBy=g.id;e.flung=.6;e.vx=vx*.65;e.vy=-140;if(e.hp<=0)g.kill(e,vx,-180,true);else g.debris.armor(e.x,e.y,Math.sign(vx)||1);p.flash=.15;g.audio.scrap(false);}
    for(const b of g.barrels)if(!b.dead&&overlap(p,b)){b.owner=g.id;b.fuse=b.fuse||.06;}
    const b=g.boss;if(b.active&&!b.dead&&b.phase===2&&overlap(p,b)&&p.flash<=0){b.hp-=3+p.mass;p.vx=-vx*.5;p.flash=.3;}
   }
  }
  this.props=this.props.filter(p=>p.life>0&&p.y<LEVEL_HEIGHT+70);
 }
 drawEnemy(e:Enemy){
  const a=this.crush;if(!a?.targets.includes(e)&&!this.held.some(h=>h.enemy===e))return false;
  const c=this.g.c,t=a?.targets.includes(e)?clamp(a.age/a.duration,0,1):0;
  c.save();c.translate(e.x+10-this.g.cam,e.y+15);if(t){c.rotate(Math.sin(t*25)*t*.16);c.scale(1-t*.58,1-t*.7);}else c.rotate(Math.sin(this.g.time*12+e.home)*.12+clamp(e.vx/2000,-.4,.4));
  robot(c,-10,-15,e.type,e.face,this.g.time,0,.02,e.shield,0);c.restore();return true;
 }
 draw(){
  const g=this.g,c=g.c,p=this.point(),s=this.scale;
  if(g.state==='playing'&&(g.pointer.active||g.preview)){
   const a=this.aimGuide(),end=this.grabbing?a.linePoint:a.wall??a.linePoint,color=a.range||(!a.grabValid&&a.blocked)?'#ec9275':a.valid?'#ffe9b9':PI_COLOR;
   c.save();c.strokeStyle=color;c.lineWidth=1;
   if(!this.grabbing&&g.modeFeedback>0&&(a.wall||a.range)){c.globalAlpha=.9;c.lineWidth=2;c.beginPath();c.moveTo(end.x-g.cam-4,end.y-4);c.lineTo(end.x-g.cam+4,end.y+4);c.moveTo(end.x-g.cam+4,end.y-4);c.lineTo(end.x-g.cam-4,end.y+4);c.stroke();}
   c.globalAlpha=g.modeFeedback>0?.5:this.grabbing||this.crush?0:.18;c.beginPath();c.arc(p.x-g.cam,p.y,this.radius,0,Math.PI*2);c.stroke();
   for(const e of (this.grabbing||this.crush?[]:this.targets(p.x,p.y,this.radius,false).slice(0,this.capacity))){c.globalAlpha=.85;c.strokeStyle=PI_COLOR;for(const dx of [-1,1])for(const dy of [-1,1]){const xx=e.x+10-g.cam+dx*14,yy=e.y+15+dy*20;c.beginPath();c.moveTo(xx-dx*5,yy);c.lineTo(xx,yy);c.lineTo(xx,yy-dy*5);c.stroke();}}
   c.globalAlpha=.95;
   const grabLabel=a.target?(this.weight(a.target)>this.capacity?'MORE SCALE TO GRAB':'E GRAB'):a.barrel?'E THROW BARREL':a.grenade?'E THROW GRENADE':a.crate?'E LIFT CRATE':a.prop?(a.prop.mass>this.capacity?'MORE SCALE TO LIFT':a.prop.crate?'E THROW CRATE':'E THROW SCRAP'):'';
   const compactLabel=a.blocked?'F BLOCKED':this.scale>=.35?'F AREA COMPACT':a.compactTarget?'F COMPACT':'F AIM AT BOT';
   const heldHint=this.crush?.carry?'COMPACTING…':this.held.some(h=>h.enemy)?(this.compactCooldown>0?'COMPACT RECHARGING':this.held.some(h=>h.enemy&&this.visible(h.enemy))?'CLICK TO COMPACT':'PULL INTO VIEW'):'RELEASE E TO THROW';
   const label=this.grabbing?heldHint:a.range?'OUT OF REACH':grabLabel?`${grabLabel} · ${compactLabel}`:compactLabel;
   if(a.body||this.grabbing||g.modeFeedback>0)text(c,label,clamp(p.x-g.cam,95,865),p.y+30,color,8,'center');

   c.restore();if(g.modeFeedback>0)text(c,`${Math.round(s*100)}% · ${this.capacity} MASS`,p.x-g.cam,p.y-this.radius-12,PI_COLOR,10,'center');
  }
  if(this.wardCharging){const q=this.wardCharge,x=g.player.x+10-g.cam,y=g.player.y+16;c.save();
   const lift=Math.sin(q*Math.PI/2)*24;c.strokeStyle='#e7dec2';c.lineWidth=1;
   for(let i=0;i<12;i++){const phase=(g.time*(.8+q*.5)+i/12)%1,a=i*2.4,rr=(1-phase)*(22+q*35)+5;c.globalAlpha=Math.sin(phase*Math.PI)*(.15+q*.4);c.beginPath();c.moveTo(x+Math.cos(a)*rr,y-18-lift+Math.sin(a)*rr*.65);c.lineTo(x+Math.cos(a)*(rr+4),y-18-lift+Math.sin(a)*(rr+4)*.65);c.stroke();}
   c.globalAlpha=.2+q*.35;c.beginPath();c.ellipse(x,y+16,17+q*15,4+q*3,0,0,Math.PI*2);c.stroke();
   const glow=c.createRadialGradient(x,y-18-lift,0,x,y-18-lift,8+q*21);glow.addColorStop(0,q===1?'#fff3ca88':'#efcf9e44');glow.addColorStop(1,'#efcf9e00');c.globalAlpha=1;c.fillStyle=glow;c.fillRect(x-30,y-48-lift,60,60);
   if(q===1){c.globalAlpha=.55+Math.sin(g.time*7)*.15;c.strokeStyle='#fff2cb';c.beginPath();c.ellipse(x,y+16,35,8,0,0,Math.PI*2);c.stroke();}c.restore();
  }
  if(this.ward>0){const x=g.player.x+10-g.cam,y=g.player.y+16;c.save();
   if(this.wardDirectional){const t=1-this.ward/.26;c.translate(x,y);c.rotate(this.wardAngle);c.globalAlpha=(1-t)*.55;c.strokeStyle='#e2eeeb';c.lineWidth=2*(1-t)+.5;c.beginPath();c.ellipse(8,0,18+t*55,15+t*45,0,-1.05,1.05);c.stroke();}
   else if(this.wardHit){const t=Math.min(1,(.53-this.ward)/.53),rr=20+Math.pow(t,.5)*this.wardRadius;c.globalAlpha=(1-t)*.7;c.strokeStyle='#edf4eb';c.lineWidth=4*(1-t)+1;c.beginPath();c.arc(x,y,rr,0,Math.PI*2);c.stroke();
    c.globalAlpha=(1-t)*.12;c.fillStyle='#e2e9da';c.beginPath();c.arc(x,y,Math.max(1,rr-8),0,Math.PI*2);c.fill();
    for(let i=0;i<16;i++){const a=i*Math.PI/8;c.globalAlpha=(1-t)*.4;c.strokeStyle=i%2?'#d9e8e4':PI_COLOR;c.beginPath();c.moveTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);c.lineTo(x+Math.cos(a)*(rr+15),y+Math.sin(a)*(rr+15));c.stroke();}}
   c.restore();}
  // Sparse force traces suggest direction without drawing a rope or orbit ring.
  for(const [index,h] of this.held.entries()){
   const b=h.body,x=b.x+b.w/2-g.cam,y=b.y+b.h/2,px=g.player.x+10-g.cam,py=g.player.y+12;
   const dx=x-px,dy=y-py,d=Math.max(1,Math.hypot(dx,dy)),speed=Math.hypot(b.vx,b.vy);
   c.save();c.strokeStyle=PI_COLOR;c.lineWidth=1;
   for(let i=0;i<3;i++){const t=.2+((g.time*.35+i/3+index*.13)%1)*.55;c.globalAlpha=.08+Math.sin(t*Math.PI)*.09;c.beginPath();c.moveTo(px+dx*t,py+dy*t);c.lineTo(px+dx*t+dx/d*5,py+dy*t+dy/d*5);c.stroke();}
   for(let i=0;i<6;i++){const phase=(g.time*.85+i/6)%1,side=i%2?1:-1,xx=x+side*(b.w/2+4+Math.sin(i*3+g.time*2)*3),yy=y+b.h*.6-phase*(b.h+12);c.globalAlpha=Math.sin(phase*Math.PI)*.55;rect(c,xx,yy,1.5,i%3?2:4,i%2?'#ffe7b2':'#baa68b');}
   if(speed>70){c.globalAlpha=Math.min(.28,speed/1800);for(const side of [-1,1]){c.beginPath();c.moveTo(x+side*(b.w/2+3),y);c.lineTo(x+side*(b.w/2+3)-b.vx/speed*Math.min(16,speed*.025),y-b.vy/speed*Math.min(16,speed*.025));c.stroke();}}
   c.restore();
  }

  for(const p of this.props){c.save();c.globalAlpha=Math.min(1,p.life);c.translate(p.x+p.w/2-g.cam,p.y+p.h/2);c.rotate(p.angle);if(p.crate){rect(c,-10,-10,20,20,p.flash>0?'#cbb08b':'#65594e');rect(c,-9,-9,18,2,'#b9a485');rect(c,-9,-7,2,15,'#8d7c65');rect(c,7,-7,2,16,'#39332f');rect(c,-5,-4,10,8,'#484039');rect(c,-3,-2,6,2,'#d1b78b');c.restore();continue;}c.fillStyle=p.flash>0?'#f8e8bf':'#727d80';c.strokeStyle='#232b32';c.lineWidth=3;c.beginPath();if(p.round)c.arc(0,0,p.w/2,0,Math.PI*2);else c.rect(-p.w/2,-p.h/2,p.w,p.h);c.fill();c.stroke();
   for(let i=0;i<5;i++){const a=i*2.4;rect(c,Math.cos(a)*p.w*.27-3,Math.sin(a)*p.h*.27-3,7,5,i%2?'#b5b3a4':'#3c4b54');}rect(c,-4,-3,3,2,'#ffb779');rect(c,2,-3,3,2,'#ffb779');c.restore();}
  if(this.crush){const a=this.crush,t=clamp(a.age/a.duration,0,1),x=a.x-g.cam,y=a.y,large=a.scale>=.35;
   // The same four-sided press at both scales. Pressure closes in; no orbit or vortex.
   const reach=large?42+a.scale*85:24,ease=1-Math.pow(1-t,2),r=reach+(10-reach)*ease,span=large?Math.max(13,r*.6):14;
   c.save();c.strokeStyle=PI_COLOR;c.lineWidth=2+t;
   for(const sign of [-1,1]){
    c.globalAlpha=.7+t*.3;c.beginPath();c.moveTo(x+sign*r,y-span);c.lineTo(x+sign*r,y+span);c.moveTo(x-span,y+sign*r);c.lineTo(x+span,y+sign*r);c.stroke();
    c.globalAlpha=.15;c.lineWidth=5;c.beginPath();c.moveTo(x+sign*(r+3),y-span*.85);c.lineTo(x+sign*(r+3),y+span*.85);c.moveTo(x-span*.85,y+sign*(r+3));c.lineTo(x+span*.85,y+sign*(r+3));c.stroke();c.lineWidth=2+t;
   }
   for(let i=0;i<(large?20:8);i++){
    const phase=(g.time*1.6+i/7)%1,side=i%4,offset=((i*17)%31-15)/15*span,rr=r+5+(1-phase)*(large?32:12);c.globalAlpha=Math.sin(phase*Math.PI)*.45;c.lineWidth=1;c.strokeStyle=i%2?'#e5e9dc':PI_COLOR;
    c.beginPath();if(side<2){const sign=side?1:-1;c.moveTo(x+sign*rr,y+offset);c.lineTo(x+sign*(rr+5),y+offset);}else{const sign=side===2?1:-1;c.moveTo(x+offset,y+sign*rr);c.lineTo(x+offset,y+sign*(rr+5));}c.stroke();
   }
   c.restore();}

  for(const q of this.ghosts){c.save();c.globalAlpha=1-q.age/.38;c.translate(q.x+10-g.cam,q.y+15+q.age*30);c.rotate(q.age*q.dx);rect(c,-2,-9,4,20,'#d2cdb8');rect(c,-8,-5,16,3,'#d2cdb8');for(let i=0;i<3;i++)rect(c,-5,-2+i*4,10,1,'#acb2ac');rect(c,-5,-13,10,6,'#495861');c.restore();}
  for(const w of this.waves)forceWave(c,w.x-g.cam,w.y,w.angle,w.radius,w.travel,g.time);
  if(this.messageLife>0)text(c,this.message,g.player.x+10-g.cam,g.player.y-18,PI_COLOR,9,'center');
  if(this.grabbing){const x=g.player.x-g.cam,y=g.player.y+42;rect(c,x,y,22,3,'#33363a');rect(c,x,y,22*(1-this.grabTime/3.2),3,PI_COLOR);}
 }
 snapshot(){return {scale:this.scale,waves:this.waves.length,held:this.held.length,grabbing:this.grabbing,grabCooldown:this.grabCooldown,compactCooldown:this.compactCooldown,qCooldown:this.qCooldown,ward:this.ward,wardCharging:this.wardCharging,wardCharge:this.wardCharge,wardPower:this.wardPower,wardDirectional:this.wardDirectional,compacting:!!this.crush,slap:!!this.slap,props:this.props.map(p=>({x:p.x,y:p.y,vx:p.vx,vy:p.vy,mass:p.mass,round:p.round}))};}
}
