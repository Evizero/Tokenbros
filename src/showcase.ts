import { Game } from './game';

export const SHOWCASES={
 marcus:[['ROTATE / RECALL','Bank the shot. Move. Bring it back.'],['LCD / SELF-SLING','Three poses. One very physical punchline.'],['ZOOM / INVADER','Grow an arcade invader. Carpet-bomb the bots.'],['PAC-MAN / CHAIN','Pick the next bite. Build to the final crunch.']],
 pidalf:[['SLOP!','One gesture. Unnecessary parts removed.'],['FORCE','Hold. Swing. Let go.'],['COMPACT','A whole squad. One rolling problem.']],
 tibo:[['TOKEN FIRE','Spend big. Cut through the line.'],['OTHER TIBO','Send in the other Tibo.'],['HARD RESET','A fresh quota. A very local disaster.']],
 peter:[['PINCHER','A tiny claw with explosive ambitions.'],['SKIPPER','Charge. Launch. Punch straight through.'],['CRUSHER','Heavy claws. No respect for cover.']],
 dimillian:[['DUELIST','Two clean hits. One very impolite finisher.'],['MAGE','Hold the fireball. Let the whole room know.'],['PILOT','Lift off. Strafe the bots. Drop a little surprise.']],
} as const;

// A separate, silent instance of the actual combat simulation. No input
// listeners, HUD writes, mission progress or audio contexts belong to it.
export class Showcase {
 scene:Game;phase=0;time=0;frame=0;last=0;dead=false;paused=matchMedia('(prefers-reduced-motion: reduce)').matches;
 private drawWidth=0;private drawHeight=0;
 private fired=new Set<string>();private target={x:360,y:844};
 constructor(private canvas:HTMLCanvasElement,private host:HTMLElement,private owner:Game){
  const buffer=document.createElement('canvas');buffer.width=960;buffer.height=540;
  this.scene=new Game(buffer,true);
  this.scene.aimPoint=()=>this.target;
  this.scene.updateAim=()=>{const g=this.scene;g.aimAngle=Math.atan2(this.target.y-g.player.y-16,this.target.x-g.player.x-10);g.face=Math.cos(g.aimAngle)>=0?1:-1;g.aim=Math.atan2(Math.sin(g.aimAngle),Math.cos(g.aimAngle)*g.face);};
  host.querySelector('#preview-toggle')!.addEventListener('click',()=>{this.paused=!this.paused;this.last=0;this.status();});
  this.select(owner.character);this.frame=requestAnimationFrame(t=>this.loop(t));
 }
 select(id:Game['character']){this.scene.selectCharacter(id);this.phase=0;this.reset();this.host.querySelector('#showcase-clips')!.innerHTML=SHOWCASES[id].map((c,i)=>`<button data-clip="${i}" aria-pressed="${i===0}"><span>0${i+1}</span>${c[0]}</button>`).join('');
  this.host.querySelectorAll<HTMLButtonElement>('[data-clip]').forEach(b=>b.addEventListener('click',()=>{this.phase=Number(b.dataset.clip);this.reset();this.labels();}));this.labels();
 }
 reset(){
  const g=this.scene;g.start();g.effects=this.owner.effects;this.time=0;this.fired.clear();g.world.blocks.fill(null);g.world.destroyed=0;
  for(let x=0;x<48;x++)for(let y=43;y<50;y++)g.world.set(x,y,y===43?3:1);
  g.player.x=g.character==='dimillian'&&this.phase===0?230:175;g.player.y=828;g.cam=0;g.camY=440;g.enemies=[];g.barrels=[];g.relays=[];g.rescues=[];g.alarms=[];g.boss.active=false;g.time=0;
  const spawn=(x:number,type='gunner',y=830,hp=4)=>{const e=g.spawnEnemy(x,y,type,-1);e.hp=e.max=hp;e.cool=1.6;g.enemies.push(e);};
  if(g.character==='dimillian'&&this.phase===0){spawn(270,'shield',830,14);spawn(400);}
  else{spawn(335);spawn(435,'shield',830,7);spawn(515);}
  if(g.character==='dimillian'&&this.phase===2){g.setThinking(2);g.player.y=800;spawn(425,'drone',740);}
  if(g.character==='dimillian'&&this.phase===1)g.setThinking(1);
  if(g.character==='peter'||g.character==='marcus')g.setThinking(this.phase);if(g.character==='pidalf')g.setThinking(this.phase===2?2:0);
  if(g.character==='tibo'&&this.phase===0)g.setThinking(1);
  if(g.character==='tibo'&&this.phase===2){g.usage=180;g.tokenTrail=180;g.barrels.push({x:330,y:830,w:18,h:30,vx:0,vy:0,grounded:false,hp:2,dead:false,fuse:0});for(let y=41;y<43;y++)g.world.set(19,y,2);}
  if(g.character==='peter'&&this.phase===2)for(let y=41;y<43;y++)g.world.set(20,y,2);
  if(g.character==='marcus'&&this.phase===3){g.enemies=[];spawn(315);spawn(405,'drone',730);spawn(490);spawn(560,'drone',780);}
  if(g.character==='marcus'&&this.phase===2){for(let y=41;y<43;y++)g.world.set(14,y,2);}
  g.modeFeedback=0;this.target={x:350,y:844};g.updateAim();
  // Start on action instead of an idle first frame, including reduced motion.
  for(let i=0;i<60;i++)this.step(1/120);
  this.draw();
 }
 private once(id:string,at:number,action:()=>void){if(this.time>=at&&!this.fired.has(id)){this.fired.add(id);action();}}
 step(dt:number){
  const g=this.scene,t=this.time;g.keys.clear();g.pointer.down=false;
  const enemy=g.enemies.find(e=>!e.dead);this.target=enemy?{x:enemy.x+10,y:enemy.y+15}:{x:450,y:820};
  if(g.character==='marcus'){
   if(this.phase===3){const pac=g.marcusKit.pacman,p=pac.active;if(p){const next=g.enemies.find(e=>!e.dead&&!p.hit.has(e));if(next)this.target={x:next.x+10,y:next.y+15};if(p.phase==='bite'&&p.age>.22)this.once('bite'+p.chain,0,()=>pac.click());}else this.once('pac',.15,()=>pac.click());}
   if(this.phase!==3&&t<(this.phase===2?1.45:this.phase===1?.7:2.7))g.keys.add('KeyJ');if(t>.9&&t<1.25)g.keys.add('KeyD');if(this.phase<2)this.once('recall',1.3,()=>g.marcusKit.recall());
   if(this.phase===2)this.target={x:340,y:810};if(this.phase===1)this.target={x:470,y:839};
   if(this.phase===1)this.once('batch',.2,()=>g.marcusKit.ultimate());if(this.phase===2)this.once('flip',1.7,()=>g.marcusKit.dodge());
  }else if(g.character==='tibo'){
   if(this.phase===0){if(t<2.6)g.keys.add('KeyJ');if(t>.4&&t<.8)g.keys.add('KeyD');this.once('heavy',1.2,()=>g.setThinking(2));}
   if(this.phase===1){this.once('double',.3,()=>g.otherTibo.activate());if(t>1.6&&t<2.2){g.keys.add('KeyD');g.keys.add('KeyJ');}}
   if(this.phase===2){this.target={x:350,y:840};this.once('reset',.35,()=>g.reset());if(t>2.3&&t<3.2)g.keys.add('KeyJ');}
  }else if(g.character==='peter'){
   this.target={x:360,y:895};this.once('pet1',.15,()=>{g.updateAim();g.peterKit.throw();});this.once('pet2',.8,()=>{g.updateAim();g.peterKit.throw();});
   this.target=enemy?{x:enemy.x+10,y:enemy.y+15}:{x:450,y:840};
   this.once('command',1,()=>g.peterKit.command());if(this.phase===1&&t>2&&t<3)g.keys.add('KeyJ');
  }else if(g.character==='pidalf'){
   if(this.phase===0){this.once('slap',.25,()=>g.pidalfKit.fire());this.once('slap2',1.4,()=>g.pidalfKit.fire());this.once('slap3',2.7,()=>g.pidalfKit.fire());}
   if(this.phase===1){this.once('grab',.25,()=>g.pidalfKit.grab());if(t<1.3){g.keys.add('KeyE');if(t>.4)this.target={x:335+(t-.4)*100,y:820-Math.sin((t-.4)*2)*110};}this.once('throw',1.3,()=>g.pidalfKit.release());}
   if(this.phase===2){this.target={x:385,y:800};this.once('compact',.25,()=>g.pidalfKit.compact());}
  }else if(this.phase===0){
   if(t<1.5)g.keys.add('KeyJ');if(t>1.5&&t<1.95)g.keys.add('KeyD');this.once('slam',2.2,()=>g.dimillianKit.ultimate());
  }else if(this.phase===1){if(t<1.45)g.keys.add('KeyJ');this.once('meteor',2.3,()=>g.dimillianKit.ultimate());}
  else{if(t<.55)g.keys.add('KeyW');if(t>.7&&t<1.45)g.keys.add('KeyD');if(t<3)g.keys.add('KeyJ');this.once('bomb',1.5,()=>g.dimillianKit.secondary());if(t>1.8&&t<2.7)g.keys.add('KeyQ');}
  g.update(dt);g.cam=0;g.camY=440;g.modeFeedback=0;g.modeBurst=0;this.time+=dt;
 }
 labels(){const clips=SHOWCASES[this.scene.character];this.host.querySelector('#showcase-caption')!.textContent=clips[this.phase][1];this.host.querySelectorAll<HTMLButtonElement>('[data-clip]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.clip)===this.phase)));this.status();}
 status(){const b=this.host.querySelector<HTMLButtonElement>('#preview-toggle')!;b.textContent=this.paused?'▶ PLAY':'Ⅱ PAUSE';b.setAttribute('aria-label',this.paused?'Play gameplay preview':'Pause gameplay preview');}
 draw(){
  const g=this.scene;g.render();const c=this.canvas.getContext('2d')!,ratio=this.canvas.clientHeight/Math.max(1,this.canvas.clientWidth),height=Math.round(960*ratio);
  if(this.canvas.height!==height)this.canvas.height=height;
  c.imageSmoothingEnabled=false;const w=500,h=w*ratio,bottom=Math.min(445,g.player.y-g.camY+90);c.drawImage(g.canvas,95,bottom-h,w,h,0,0,960,height);
  this.drawWidth=this.canvas.clientWidth;this.drawHeight=this.canvas.clientHeight;
  this.host.style.setProperty('--preview-progress',String(Math.min(1,this.time/4.2)));
  this.host.dataset.previewCharacter=g.character;this.host.dataset.previewPhase=String(this.phase);this.host.dataset.previewTime=this.time.toFixed(2);
 }
 loop(now:number){
  if(this.dead)return;if(!this.canvas.isConnected||this.owner.state!=='title'){this.destroy();return;}
  const dt=this.last?Math.min(.05,(now-this.last)/1000):0;this.last=now;
  if(!document.hidden&&!this.paused){let left=dt;while(left>0){const step=Math.min(1/120,left);this.step(step);left-=step;}if(this.time>=4.2){this.phase=(this.phase+1)%SHOWCASES[this.scene.character].length;this.reset();this.labels();}}
  if(!document.hidden&&(!this.paused||this.drawWidth!==this.canvas.clientWidth||this.drawHeight!==this.canvas.clientHeight))this.draw();this.frame=requestAnimationFrame(t=>this.loop(t));
 }
 destroy(){this.dead=true;cancelAnimationFrame(this.frame);this.scene.keys.clear();this.scene.audio.silenceRobots();}
}
