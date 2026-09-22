import type { Game } from './game';
import { SECTORS,SUPPLIES } from './level';
import { rect,text } from './art';
import { hear } from './perception';
import { TOKEN_CAPACITY } from './tokens';
type Drop={x:number;y:number;floor:number;type:string;sector:number;time:number};
export class Encounters {
 states=SECTORS.map(()=>({active:false,wave:0,timer:2.5}));
 supplies=SUPPLIES.map(p=>({...p,used:false}));
 pending:Drop[]=[];
 constructor(private g:Game){}
 landing(x:number,floor:number){
  const w=this.g.world;
  for(const dy of [0,20,-20,40,-40,60,-60,80,-80])for(const dx of [0,-40,40,-80,80]){
   const xx=Math.round((x+dx)/20)*20,yy=floor+dy;
   if(w.at(xx+10,yy+1)&&!w.overlaps(xx,yy-105,20,105))return {x:xx,y:yy-100,floor:yy};
  }
  return null;
 }
 update(dt:number){
  const g=this.g;if(g.preview)return;
  for(const [i,s] of SECTORS.entries()){
   const state=this.states[i],near=g.player.x>s.from-60&&g.player.x<s.to+60;
   const locals=g.enemies.filter(e=>e.sector===i);
   if(!state.active&&near&&locals.some(e=>e.dead||e.awareness.state==='combat'))state.active=true;
   if(!state.active||!near||state.wave>=s.waves.length)continue;
   if(g.enemies.filter(e=>!e.dead&&Math.abs(e.x-g.player.x)<700).length>=10)continue;
   state.timer-=dt;if(state.timer>0)continue;
   const types=s.waves[state.wave];
   for(const [n,type] of types.entries()){
    const door=s.doors[(n+state.wave)%s.doors.length],spot=this.landing(door[0],door[1]);if(!spot)continue;
    this.pending.push({...spot,type,sector:i,time:1.8+n*.3});
   }
   state.wave++;state.timer=11;g.audio.tone(180,.15,'triangle',.025,300);
  }
  for(const drop of this.pending){drop.time-=dt;if(drop.time>0)continue;
   // A blast may have destroyed the landing during the warning; find safe footing again.
   const spot=this.landing(drop.x,drop.floor);if(!spot){drop.time=-999;continue;}
   const e=g.spawnEnemy(spot.x,spot.y,drop.type,spot.x>g.player.x?-1:1);e.sector=drop.sector;e.arrival=.8;e.cool=1.4;
   hear(e.awareness,g.player.x+10,g.player.y+16,6);g.enemies.push(e);g.emit(e.x+10,e.y,10,['#c6c5ad','#a0937b'],70,3,.4);drop.time=-999;
  }
  this.pending=this.pending.filter(d=>d.time>0);
  for(const s of this.supplies)if(!s.used&&Math.hypot(g.player.x+10-s.x,g.player.y+16-s.y)<42){
   s.used=true;g.health=3;g.usage=TOKEN_CAPACITY;g.tokenTrail=TOKEN_CAPACITY;g.peterKit.stock=6;g.charges=Math.max(1,g.charges);
   if(s.x>g.checkpoint){g.checkpoint=s.x;g.checkpointY=s.y-2;}
   g.emit(s.x,s.y,20,['#e9d8ac','#adc7bf'],120,3,.6);g.audio.pickup();g.barks.request('rescue');
  }
 }
 draw(){
  const g=this.g;if(g.preview)return;const c=g.c;
  for(const [i,s] of SECTORS.entries())for(const [x,floor] of s.doors){
   if(x-g.cam< -50||x-g.cam>1010)continue;
   const sx=x-g.cam,hot=this.pending.some(d=>d.sector===i&&Math.abs(d.x-x)<90);
   rect(c,sx-5,floor-58,42,58,'#151b23');rect(c,sx-5,floor-58,42,3,'#56606b');
   for(let y=0;y<6;y++)rect(c,sx,floor-52+y*8,32,4,hot?'#655549':'#333c46');
   rect(c,sx+2,floor-66,26,4,hot&&Math.floor(g.time*8)%2?'#ffd083':'#6c7277');
  }
  for(const d of this.pending){const x=d.x+10-g.cam,y=d.y+20;c.save();c.globalAlpha=.55+.3*Math.sin(g.time*14);c.strokeStyle='#edba81';c.lineWidth=1;c.setLineDash([3,6]);c.beginPath();c.moveTo(x,y);c.lineTo(x,d.floor-4);c.stroke();c.setLineDash([]);rect(c,x-13,d.floor-3,26,2,'#efbc81');text(c,'↓',x,y-10,'#ffd39a',16,'center');c.restore();}
  for(const s of this.supplies){const x=s.x-g.cam,y=s.y;if(x< -40||x>1000)continue;
   rect(c,x-12,y-10,24,25,'#303b43');rect(c,x-12,y-10,24,3,s.used?'#6c756f':'#b9d6c7');rect(c,x-3,y-6,6,17,s.used?'#52635e':'#dbebd5');rect(c,x-8,y-1,16,6,s.used?'#52635e':'#dbebd5');
   if(!s.used){text(c,'FIELD KIT',x,y-22,'#d4e4dc',8,'center');rect(c,x-2,y-17+Math.sin(g.time*3)*2,4,2,'#d4e4dc');}
  }
  for(const e of g.enemies)if(!e.dead&&(e.arrival??0)>0&&!e.grounded){
   const x=e.x+10-g.cam,y=e.y;c.save();c.strokeStyle='#b7b4a6';c.lineWidth=1;c.beginPath();c.moveTo(x-19,y-25);c.lineTo(x-5,y+3);c.moveTo(x+19,y-25);c.lineTo(x+5,y+3);c.stroke();c.fillStyle='#9d9273';c.beginPath();c.arc(x,y-25,21,Math.PI,Math.PI*2);c.fill();rect(c,x-20,y-25,40,3,'#4b4b42');c.restore();
  }
 }
 snapshot(){return {sectors:this.states.map(s=>({...s})),pending:this.pending.length,supplies:this.supplies.filter(s=>s.used).length};}
}
