import type { Game } from './game';
import lines from './hero-lines.json';
import { clamp } from './world';
import { W,H,text } from './art';
export type HeroEvent='spawn'|'death'|'respawn'|'multikill'|'lowHealth'|'empty'|'reset'|'double'|'catch'|'absorb'|'summon'|'molt'|'prism'|'finisher'|'sheep'|'paired'|'duelistSpecial'|'mageSpecial'|'pilotSpecial'|'tower'|'cable'|'uplink'|'rescue'|'boss'|'victory'|'shockwave'|'repel'|'recall'|'batch'|'lcdLaunch';
type Hero=Game['character'];
const bank:Record<Hero,Partial<Record<HeroEvent,string[]>>>=lines;
const priority=(event:HeroEvent)=>event==='death'||event==='victory'?100:event==='spawn'?90:event==='respawn'||event==='boss'?80:['lowHealth','uplink','rescue','tower','cable'].includes(event)?60:30;
export class HeroBarks {
 clock=0;gap=0;active:{event:HeroEvent;line:string;life:number;age:number;hero:Hero;x:number;y:number;fixed:boolean}|null=null;
 pending:{event:HeroEvent;expires:number}|null=null;
 private next=new Map<string,number>();private cooldowns=new Map<HeroEvent,number>();private places=new Set<HeroEvent>();private kills:number[]=[];
 constructor(private g:Game){}
 clear(){this.active=null;this.pending=null;if(!this.g.preview){const e=document.querySelector('#hero-caption');if(e)e.textContent='';}}
 reset(){this.clear();this.clock=0;this.gap=0;this.cooldowns.clear();this.places.clear();this.kills=[];}
 request(event:HeroEvent){
  const g=this.g;if(g.preview||!['playing','dead','won'].includes(g.state)||!bank[g.character][event])return false;
  if((this.cooldowns.get(event)??0)>this.clock)return false;
  const p=priority(event);
  if(this.active||this.clock<this.gap){
   if(p>=90&&(!this.active||p>priority(this.active.event))){this.clear();}
   else{if(p>=60&&(!this.pending||p>priority(this.pending.event)))this.pending={event,expires:this.clock+5};return false;}
  }
  const key=g.character+':'+event,variants=bank[g.character][event]!,i=this.next.get(key)??0,line=variants[i%variants.length];this.next.set(key,i+1);
  this.cooldowns.set(event,this.clock+(priority(event)>=80?1:25));this.gap=this.clock+7;
  const active={event,line,life:Math.max(2.4,line.length*.062),age:0,hero:g.character,x:g.player.x+10,y:g.player.y,fixed:event==='death'};this.active=active;
  const e=document.querySelector('#hero-caption');if(e)e.textContent=`${g.character.toUpperCase()}: ${line}`;
  return true;
 }
 place(event:HeroEvent){if(this.places.has(event))return;this.places.add(event);this.request(event);}
 killed(){this.kills=this.kills.filter(t=>this.clock-t<1.6);this.kills.push(this.clock);if(this.kills.length>=3){this.request('multikill');this.kills=[];}}
 update(dt:number){
  if(this.g.preview||!['playing','dead','won'].includes(this.g.state))return;
  this.clock+=dt;if(this.active){this.active.life-=dt;this.active.age+=dt;if(this.active.life<=0){this.active=null;const e=document.querySelector('#hero-caption');if(e)e.textContent='';}}
  if(this.pending){const p=this.pending;if(p.expires<this.clock)this.pending=null;else if(!this.active){this.pending=null;this.gap=this.clock;this.request(p.event);}}
 }
 draw(){
  const a=this.active,g=this.g;if(!a||g.preview||!['playing','dead'].includes(g.state))return;
  const c=g.c;c.save();c.font='bold 11px monospace';
  const words=a.line.split(' '),rows:string[]=[];let row='';for(const word of words){const next=row?row+' '+word:word;if(row&&c.measureText(next).width>202){rows.push(row);row=word;}else row=next;}if(row)rows.push(row);
  const width=Math.ceil(Math.max(70,...rows.map(s=>c.measureText(s).width)))+20,height=12+rows.length*14;
  const sx=(a.fixed?a.x:g.player.x+10)-g.cam,sy=(a.fixed?a.y:g.player.y)-g.camY;
  const feedback=g.pidalfKit.messageLife>0||g.otherTibo.catchFeedback>0||g.otherTibo.rewardFeedback>0||g.modeFeedback>0||g.burstLife>0||g.refillFeedback>0||g.dimillianKit.messageLife>0;
  const x=Math.round(clamp(sx-width/2,12,W-width-12)),y=Math.round(clamp(sy-height-(feedback?60:18),116,H-height-40)),tail=Math.round(clamp(sx-x,12,width-16));
  // One stepped comic silhouette, including its tail; no tooltip header or
  // colored edge. Integer coordinates keep the ink crisp at game resolution.
  const balloon=(ox:number,oy:number,fill:string)=>{c.fillStyle=fill;c.beginPath();c.moveTo(ox+5,oy);c.lineTo(ox+width-5,oy);c.lineTo(ox+width-5,oy+2);c.lineTo(ox+width-2,oy+2);c.lineTo(ox+width-2,oy+5);c.lineTo(ox+width,oy+5);c.lineTo(ox+width,oy+height-5);c.lineTo(ox+width-2,oy+height-5);c.lineTo(ox+width-2,oy+height-2);c.lineTo(ox+width-5,oy+height-2);c.lineTo(ox+width-5,oy+height);c.lineTo(ox+tail+8,oy+height);c.lineTo(ox+tail+8,oy+height+4);c.lineTo(ox+tail+4,oy+height+4);c.lineTo(ox+tail+4,oy+height+8);c.lineTo(ox+tail,oy+height+8);c.lineTo(ox+tail,oy+height);c.lineTo(ox+5,oy+height);c.lineTo(ox+5,oy+height-2);c.lineTo(ox+2,oy+height-2);c.lineTo(ox+2,oy+height-5);c.lineTo(ox,oy+height-5);c.lineTo(ox,oy+5);c.lineTo(ox+2,oy+5);c.lineTo(ox+2,oy+2);c.lineTo(ox+5,oy+2);c.closePath();c.fill();};
  c.globalAlpha=Math.min(1,a.age*12,a.life*4);balloon(x+2,y+3,'#080d14');balloon(x,y,'#f1e9d4');c.strokeStyle='#111821';c.lineWidth=2;c.stroke();
  rows.forEach((s,i)=>text(c,s,x+width/2,y+17+i*14,'#202630',11,'center'));c.restore();
 }
 snapshot(){return {active:this.active?{event:this.active.event,line:this.active.line,life:this.active.life,hero:this.active.hero}:null,pending:this.pending?.event??null};}
}
