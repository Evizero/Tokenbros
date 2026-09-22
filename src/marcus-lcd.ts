import type { MarcusKit } from './marcus';
import { clamp,TILE } from './world';
import { rect,text } from './art';
import { lcdFigure,MARCUS_COLOR } from './marcus-art';
type Flight={angle:number;left:number;charge:number;speed:number;age:number;hit:Set<unknown>;tiles:Set<number>;batch:boolean;drawX:number;drawY:number;nextFrame:number};
export class LCDLaunch {
 charging=false;charge=0;cooldown=0;airUsed=false;flight:Flight|null=null;land=0;angle=0;lastFace=1;poseClock=0;skid=0;launches=0;hits=0;broken=0;notice=0;impactPose=0;
 ghosts:{x:number;y:number;angle:number;face:number;pose:number;life:number}[]=[];
 constructor(public owner:MarcusKit){}
 get g(){return this.owner.g;}
 get driving(){return this.charging||!!this.flight;}
 drawX=0;drawY=0;drawAt=-1;drawGrounded=false;
 get visible(){return !!this.flight||this.land>0&&!this.charging;}
 get reach(){return 135+this.charge*190;}
 cancel(){this.charging=false;this.charge=0;this.drawAt=-1;}
 clear(){this.cancel();this.flight=null;this.land=0;this.impactPose=0;this.ghosts=[];this.skid=0;}
 input(dt:number,firing:boolean,rising:boolean){
  const g=this.g;
  if(this.owner.mode!==1){this.cancel();return;}
  if(this.flight||this.owner.flip>0)return;
  if(rising&&this.cooldown<=0&&!this.airUsed&&g.fireTimer<=0){this.charging=true;this.charge=.001;this.land=0;this.poseClock=0;g.player.vx=0;g.player.vy=0;this.drawAt=-1;g.climb=null;g.zip=false;g.audio.tone(170,.1,'square',.025,260);}
  else if(rising&&(this.cooldown>0||this.airUsed)){this.notice=.65;g.audio.tone(110,.045,'square',.015,75);}
  if(this.charging){g.updateAim();this.angle=g.aimAngle;this.lastFace=Math.cos(this.angle)>=0?1:-1;
   if(!firing){this.launch();return;}const old=this.charge;this.charge=Math.min(1,this.charge+dt/.58);if(old<1&&this.charge===1){g.audio.tone(780,.08,'square',.023,1000);g.emit(g.player.x+10,g.player.y+16,8,['#e6efd2',MARCUS_COLOR],95,2,.25);}
  }
 }
 launch(){
  if(!this.charging)return;const g=this.g,q=this.charge;this.flight={angle:this.angle,left:this.reach,charge:q,speed:980+q*260,age:0,hit:new Set(),tiles:new Set(),batch:this.owner.batch>0,drawX:g.player.x+10,drawY:g.player.y+16,nextFrame:0};this.cancel();this.airUsed=true;this.launches++;g.shotCount++;g.fireTimer=.2;g.lastCooldown=.2;g.climb=null;g.zip=false;g.zipCooldown=.35;g.jumpBuffer=0;g.wallGrip=0;g.player.grounded=false;
  g.makeNoise(g.player.x+10,g.player.y+16,520);g.audio.tone(750,.14,'square',.035,180);g.audio.noise(.09,.045,1300);g.emit(g.player.x+10,g.player.y+20,15,['#d9e6c4',MARCUS_COLOR,'#9eaa99'],150,3,.3);g.shake=Math.max(g.shake,2.5);g.barks.request('lcdLaunch');
 }
 end(impact=false){
  const f=this.flight;if(!f)return;const g=this.g,p=g.player;this.flight=null;this.cooldown=.65;this.land=2.2;this.skid=.28;g.wallRegrab=.1;
  p.vx=Math.cos(f.angle)*(impact?-70:210);p.vy=impact?Math.min(-70,p.vy):Math.sin(f.angle)*220;g.wallLock=.07;
  if(impact){g.audio.tone(85,.12,'square',.035,45);g.audio.noise(.09,.035,650);g.emit(p.x+10,p.y+22,15,['#c5d2b1','#8a9492'],170,3,.4);g.shake=Math.max(g.shake,4);if(g.effects)g.freeze=Math.max(g.freeze,.025);}
 }
 update(dt:number){
  const g=this.g;this.cooldown=Math.max(0,this.cooldown-dt);this.land=Math.max(0,this.land-dt);this.notice=Math.max(0,this.notice-dt);this.impactPose=Math.max(0,this.impactPose-dt);this.poseClock+=dt;
  if(g.player.grounded&&!this.flight)this.airUsed=false;
  if(this.skid>0){this.skid-=dt;if(g.player.grounded)g.emit(g.player.x+10,g.player.y+31,1,['#bcc6ac'],65,2,.22);}
  for(const p of this.ghosts)p.life-=dt;this.ghosts=this.ghosts.filter(p=>p.life>0);
 }
 move(dt:number){
  const g=this.g,p=g.player;
  if(this.charging){p.vx=0;p.vy=0;g.wallGrip=0;g.jumpBuffer=0;g.coyote=0;return;}
  const f=this.flight;if(!f)return;f.age+=dt;const dx=Math.cos(f.angle),dy=Math.sin(f.angle),distance=Math.min(f.left,f.speed*dt),steps=Math.max(1,Math.ceil(distance/3));
  for(let i=0;i<steps&&this.flight;i++){
   const step=distance/steps,nx=p.x+dx*step,ny=p.y+dy*step;
   if(f.charge>=.5&&g.world.overlaps(nx,ny,p.w,p.h)){
    for(let cy=Math.floor(ny/TILE);cy<=Math.floor((ny+p.h-.01)/TILE);cy++)for(let cx=Math.floor(nx/TILE);cx<=Math.floor((nx+p.w-.01)/TILE);cx++){
     const key=cy*204+cx;if(f.tiles.has(key))continue;f.tiles.add(key);
     if(g.world.damage(cx*TILE+10,cy*TILE+10,6)){this.broken++;g.emit(cx*TILE+10,cy*TILE+10,9,['#acb49a','#dbc8a0'],190,4,.45);g.audio.scrap(false);}
    }
   }
   p.vx=dx*f.speed;p.vy=dy*f.speed;g.world.move(p,step/f.speed);f.left-=step;
   // Resolve travel before the kick so steel and gates also block its reach.
   const hitWall=Math.abs(p.x-nx)>.2||Math.abs(p.y-ny)>.2;
   const hx=p.x+10+dx*15,hy=p.y+16+dy*15;
   for(const e of g.enemies)if(!e.dead&&!f.hit.has(e)&&Math.hypot(clamp(hx,e.x,e.x+e.w)-hx,clamp(hy,e.y,e.y+e.h)-hy)<15&&g.lineOfSight(p.x+10,p.y+16,e.x+10,e.y+15)){
    f.hit.add(e);this.impactPose=.17;this.hits++;this.owner.combo++;this.owner.comboLife=1.9;const power=5+f.charge*3+(f.batch?3:0);
    if(e.type==='shield'&&e.shield>0){e.shield=Math.max(0,e.shield-(f.charge>=.5?6:2));g.debris.armor(e.x,e.y,dx>=0?1:-1);}
    e.hp-=power;e.stun=.5;e.hurt=.2;e.flungBy=g.id;e.flung=.65;e.vx=dx*(640+f.charge*220);e.vy=dy*480-160;
    f.drawX=p.x+10;f.drawY=p.y+16;f.nextFrame=f.age+1/12;
    if(e.hp<=0)g.kill(e,e.vx,e.vy,true);else g.audio.scrap(true);
    g.emit(e.x+10,e.y+15,20,['#f1efd0',MARCUS_COLOR,'#728984'],260,4,.4);g.rings.push({x:hx,y:hy,r:2,max:38,life:.18,color:'#edf0cf'});g.audio.tone(120,.08,'square',.04,55);g.audio.tone(460,.07,'square',.018,280);g.shake=Math.max(g.shake,6);if(g.effects)g.freeze=Math.max(g.freeze,.045);
   }
   const b=g.boss;if(b.active&&!b.dead&&b.phase===2&&!f.hit.has(b)&&Math.hypot(hx-b.x-b.w/2,hy-b.y-b.h/2)<52&&g.lineOfSight(p.x+10,p.y+16,b.x+b.w/2,b.y+b.h/2)){f.hit.add(b);b.hp-=8+(f.batch?3:0);g.emit(hx,hy,20,[MARCUS_COLOR,'#fff3c4'],240,3,.4);}
   if(hitWall){this.end(true);break;}if(f.left<=.01){this.end();break;}
  }
  if(f.age>=f.nextFrame){f.drawX=p.x+10;f.drawY=p.y+16;f.nextFrame=f.age+1/12;}
  if(this.ghosts.length===0||this.ghosts.at(-1)!.life<.2)this.ghosts.push({x:p.x+10,y:p.y+16,angle:f.angle,face:dx>=0?1:-1,pose:Math.floor(f.age*14)%2?1:2,life:.25});
 }
 // Hold each world-space position like a physical LCD segment: no interpolation.
 sampleBody(){const g=this.g,p=g.player;
  if(this.drawAt<0||g.time>=this.drawAt||p.grounded!==this.drawGrounded||this.charging){this.drawX=p.x+10;this.drawY=p.y+16;this.drawGrounded=p.grounded;this.drawAt=g.time+1/12;}
 }
 drawHero(){const g=this.g;if(!this.visible){this.drawAt=-1;return false;}this.sampleBody();const f=this.flight,p=g.player;
  const pose=this.impactPose>0?3:this.charging?(this.charge<.25?0:this.charge<.7?1:0):f?Math.floor(f.age*12)%2?1:2:this.skid>0?0:!p.grounded?(p.vy<0?1:2):Math.abs(p.vx)>15?(Math.floor(g.time*12)%2?1:2):0;
  lcdFigure(g.c,(f?f.drawX:this.drawX)-g.cam,f?f.drawY:this.drawY,this.driving?this.lastFace:g.face,pose,f?f.angle:0,1,this.charging?'#142126':'#17252a');return true;
 }
 preview(){const g=this.g,p=g.player,dx=Math.cos(this.angle),dy=Math.sin(this.angle);let reach=0;
  for(let d=8;d<=this.reach;d+=8){const x=p.x+dx*d,y=p.y+dy*d;let blocked=false;for(let cy=Math.floor(y/TILE);cy<=Math.floor((y+p.h-.01)/TILE);cy++)for(let cx=Math.floor(x/TILE);cx<=Math.floor((x+p.w-.01)/TILE);cx++){const b=g.world.get(cx,cy);if(b&&(this.charge<.5||b.kind===3||b.kind===4))blocked=true;}if(blocked)break;reach=d;}return reach;
 }
 draw(){const g=this.g,c=g.c;
  for(const p of this.ghosts){c.save();c.globalAlpha=p.life/.25*.3;lcdFigure(c,p.x-g.cam,p.y,p.face,p.pose,p.angle,1,'#647d79');c.restore();}
  if(this.charging){
   const p=g.player,dx=Math.cos(this.angle),dy=Math.sin(this.angle),sx=p.x+10-g.cam,sy=p.y+16,reach=this.preview();
   c.save();for(let i=1;i<=3;i++){c.globalAlpha=.08+i*.035;lcdFigure(c,sx+dx*reach*i/3,sy+dy*reach*i/3,this.lastFace,i%3,this.angle,.8,'#c4d1b0');}c.restore();
   rect(c,sx-20,p.y-13,40,3,'#485956');rect(c,sx-20,p.y-13,this.charge*40,3,'#d5e7b9');text(c,this.charge>=1?'RELEASE!':!p.grounded?'AIR HOLD':'SLING',sx,p.y-19,'#e8eed3',9,'center');
  }
  if(this.notice>0)text(c,this.airUsed?'LAND TO RELOAD':'RECOVERING',g.player.x+10-g.cam,g.player.y-16,'#d1dfc0',9,'center');
 }
 snapshot(){return {charging:this.charging,charge:this.charge,flight:this.flight?{left:this.flight.left,angle:this.flight.angle,age:this.flight.age}:null,cooldown:this.cooldown,airUsed:this.airUsed,launches:this.launches,hits:this.hits,broken:this.broken};}
}
