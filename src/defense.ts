import type { PlayerRuntime as Game } from './player-runtime';
import { shieldCrossing,type ShieldPlane } from './defense-geometry';
import { TOKEN_CAPACITY } from './tokens';
import { rect,text } from './art';
type Barrier=ShieldPlane&{kind:'absorb'|'prism';life:number;duration:number;hits:number;tokens:number;flash:number};
const RAINBOW=['#ed8b96','#efb47f','#e6d992','#91c9a1','#89b9dc','#b49ad6'];
const HOLD_LIMIT=2,TOKENS_PER_HIT=24,BASE_COOLDOWN=2,SECONDS_PER_TOKEN=.025;
export class Defense {
 cooldown=0;active:Barrier|null=null;blocks=0;recovered=0;feedback=0;feedbackText='';
 constructor(public g:Game){}
 get pendingCooldown(){return this.active?.kind==='absorb'?BASE_COOLDOWN+this.active.tokens*SECONDS_PER_TOKEN:this.cooldown;}
 activate(){
  const g=this.g;if(this.active||this.cooldown>0||g.state!=='playing')return false;g.updateAim();const angle=g.aimAngle,nx=Math.cos(angle),ny=Math.sin(angle),ox=g.player.x+10,oy=g.player.y+16;
  const prism=g.character==='peter';let distance=24;
  if(prism){distance=16;for(let r=16;r<=60;r+=4){if(g.world.at(ox+nx*r,oy+ny*r))break;distance=r;}if(g.world.at(ox+nx*distance,oy+ny*distance))return false;}
  if(prism)g.barks.request('prism');this.cooldown=prism?6.5:0;
  this.active={kind:prism?'prism':'absorb',x:ox+nx*distance,y:oy+ny*distance,angle,half:prism?36:32,life:prism?1.8:HOLD_LIMIT,duration:prism?1.8:HOLD_LIMIT,hits:prism?3:0,tokens:0,flash:0};
  g.audio.tone(prism?440:340,.12,'triangle',.035,prism?660:520);return true;
 }
 release(){
  const s=this.active;if(!s||s.kind!=='absorb')return;
  this.cooldown=this.pendingCooldown;this.active=null;this.feedback=.9;this.feedbackText=`+${s.tokens} TOK / ${this.cooldown.toFixed(1)}s CD`;
  if(s.tokens>=48)this.g.barks.request('absorb');
  this.g.audio.tone(260,.09,'triangle',.025,110);
 }
 sync(){
  const s=this.active;if(!s||s.kind!=='absorb')return;
  const g=this.g;g.updateAim();s.angle=g.aimAngle;s.x=g.player.x+10+Math.cos(s.angle)*24;s.y=g.player.y+16+Math.sin(s.angle)*24;
 }
 update(dt:number){
  this.cooldown=Math.max(0,this.cooldown-dt);this.feedback=Math.max(0,this.feedback-dt);
  if(!this.active)return;this.active.life-=dt;this.active.flash=Math.max(0,this.active.flash-dt);
  if(this.active.kind==='absorb'){
    this.sync();if(this.active.life<=0||!this.g.keys.has('KeyQ'))this.release();
  }else if(this.active.life<=0)this.active=null;
 }
 intercept(b:Game['bullets'][number],from:{x:number;y:number}){
  const s=this.active;if(!s||!b.hostile||b.life<=0)return false;const g=this.g;this.sync();
  const hit=shieldCrossing(from,b,s);if(!hit)return false;
  b.life=0;this.blocks++;s.flash=.13;this.feedback=.6;
  if(s.kind==='absorb'){
    const gain=Math.min(TOKENS_PER_HIT,Math.max(0,TOKEN_CAPACITY-g.usage));g.usage+=gain;g.tokenTrail=Math.max(g.tokenTrail,g.usage);s.tokens+=gain;this.recovered+=gain;
    if(gain>0){g.dryFeedback=0;g.dryFire=0;}
    this.feedbackText=gain?`+${gain} TOK`:'TOKENS FULL';
    g.rings.push({x:hit.x,y:hit.y,r:16,max:0,life:.18,color:'#e6ffaf'});
  }else{s.hits--;this.feedbackText=s.hits?'PRISM BLOCK':'PRISM BROKEN';}
  g.emit(hit.x,hit.y,s.kind==='prism'&&s.hits===0?22:9,s.kind==='prism'?RAINBOW:['#d5ff60','#fff8cf'],120,3,.35);
  g.audio.tone(s.kind==='prism'?600:520+s.tokens*2,.09,'triangle',.035,800);
  if(s.kind==='prism'&&s.hits<=0)this.active=null;return true;
 }
 draw(){
  const g=this.g,c=g.c,s=this.active;
  if(s){
    this.sync();c.save();c.translate(s.x-g.cam,s.y);c.rotate(s.angle);
    c.globalAlpha=Math.min(1,s.life/.2);
    if(s.kind==='prism'){
      rect(c,-6,34,12,5,'#b3bbc5');rect(c,-3,32,6,3,'#eef0df');
      for(let i=0;i<6;i++){c.strokeStyle=RAINBOW[i];c.lineWidth=s.flash>0?3:2;c.beginPath();c.moveTo(-7+i*3,-36);c.quadraticCurveTo(1+i*3,0,-7+i*3,36);c.stroke();}
      for(let i=0;i<s.hits;i++)rect(c,-8+i*6,44,4,3,'#e8e5d6');
    }else{
      const energy=Math.min(1,s.tokens/144);c.strokeStyle=s.flash>0?'#fff8d6':'#d5ff60';c.lineWidth=3+energy*3;c.beginPath();c.moveTo(-3,-32);c.lineTo(8,-22);c.lineTo(8,22);c.lineTo(-3,32);c.stroke();
      rect(c,-6,-9,8,18,'#59764b');rect(c,-5,7-energy*16,6,2+energy*16,'#efffc5');rect(c,-10,-25,2,50,'#293a32');rect(c,-10,25-50*s.life/s.duration,2,50*s.life/s.duration,'#c2e79a');
    }
    c.restore();
    if(s.kind==='absorb'){text(c,`+${s.tokens} TOK`,g.player.x+10-g.cam,g.player.y-28,'#e6ffaf',10,'center');text(c,`RELEASE: ${this.pendingCooldown.toFixed(1)}s CD`,g.player.x+10-g.cam,g.player.y-16,'#c6d6b7',7,'center');}
  }
  if(this.feedback>0&&s?.kind!=='absorb'){c.save();c.globalAlpha=Math.min(1,this.feedback*4);text(c,this.feedbackText,g.player.x+10-g.cam,g.player.y-23,g.character==='peter'?'#ded1ec':'#e6ffaf',9,'center');c.restore();}
 }
}
