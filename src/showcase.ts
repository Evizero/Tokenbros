import { Game } from './game';
import { stageDemo, type DemoScene } from './showcase-scenes';

type Clip = { id: string; title: string; mode: number; tip: string; duration?: number };
export const SHOWCASES: Record<Game['character'], readonly Clip[]> = {
 theo: [
  {id:'deck-run',title:'E · THROW / CATCH',mode:0,tip:'Kick a bot into a ride, then recall through the survivors. Catch and keep moving forward; clean catches build speed.',duration:6.8},
  {id:'deck-ram',title:'MOVE · FULL SEND',mode:0,tip:'Keep pushing to build speed. The cyan rush marks ram speed: ride through light bots and keep your line.',duration:5},
  {id:'deck-grip',title:'LMB · DECK COMBO',mode:0,tip:'Swing on foot. Land two hits to earn a heavy third swing. Without the board, keep fighting with weaker punches.',duration:5.8},
  {id:'deck-parry',title:'Q · SHIELD TOSS',mode:0,tip:'Throw the board broadside into incoming fire. Shots shove it; the board protects anyone behind it. E brings it back.',duration:5},
  {id:'deck-flip',title:'SPACE · KICKFLIP',mode:0,tip:'Jump, then press Space again to kick the deck downward and pop higher. Recall or land on it to catch it.',duration:6.6},
 ],
 tibo: [
  {id:'reset',title:'F · HARD RESET',mode:1,tip:'Spend your quota, then throw RESET into the fight. The slam refills you and blasts nearby bots.'},
  {id:'tokens',title:'LMB · TOKEN FIRE',mode:0,tip:'Strafe while firing. Scroll up for heavier shots that burn more tokens.'},
  {id:'double',title:'E · OTHER TIBO',mode:0,tip:'Your double throws bots and sends tokens back. Run into him before he fades to ready E again.'},
  {id:'boots',title:'SPACE · ROCKET BOOTS',mode:0,tip:'Hold Space after jumping to burn tokens for lift. Release to stop the boots and save ammunition.'},
  {id:'absorb',title:'Q · ABSORB',mode:0,tip:'Hold Q toward incoming shots to turn them into tokens. More recovered tokens mean a longer cooldown.'},
 ],
 peter: [
  {id:'pincher',title:'E · PINCHER',mode:0,tip:'Throw a red claw with E, then click a bot to send it hunting. A small, very determined smart grenade.'},
  {id:'skipper',title:'E · SKIPPER',mode:1,tip:'Throw the blue claw, then click to focus the pack. It charges through bots; your held claw fires too.'},
  {id:'crusher',title:'E · CRUSHER',mode:2,tip:'Send a heavy claw after enemies behind cover. It digs, brawls and throws its weight around.'},
  {id:'prism',title:'Q · PRISM',mode:1,tip:'Plant a shield, then move behind it. It stays where you placed it and catches incoming shots.'},
  {id:'grapple',title:'SPACE · CLAW GRAPPLE',mode:0,tip:'Aim at a ledge and hold Space to fire your claw and pull yourself up. Release to detach.'},
  {id:'molt',title:'F · MOLT',mode:2,tip:'Molt, close the gap and punch through the bots. Turn a blocked path into a close-range brawl.'},
 ],
 dimillian: [
  {id:'duelist',title:'LMB · DUELIST',mode:0,tip:'Land two swings to unlock the finisher. Press Space again in the air to double jump. F delivers a grand slam.'},
  {id:'remote',title:'E + Q · REMOTE',mode:0,tip:'E pairs through walls. Your bot follows and guards you. Tap Q to enter the iPhone: WASD drives an overcharged bot; W/S climbs ladders. Mouse fires. Tap Q again to leave.'},
  {id:'mage',title:'LMB · MAGE',mode:1,tip:'Hold and release lightning to chain between bots. In the air, hold Space briefly, aim and release to teleport. F calls a meteor.'},
  {id:'sheep',title:'E + Q · SHEEP',mode:1,tip:'Turn a threat into a sheep with E. Hold Q for a bubble that moves with you and protects allies inside.'},
  {id:'pilot',title:'E + Q · PILOT',mode:2,tip:'Fly with WASD, bomb straight down with E, and point your held Q shield toward incoming fire.'},
  {id:'rocket',title:'F · ROCKET',mode:2,tip:'Aim and press F to launch a heavy rocket. Break a clustered defense with one explosive hit.'},
 ],
 pidalf: [
  {id:'slop',title:'LMB · SLOP',mode:0,tip:'A small shockwave travels fast. Scroll up to sweep a wider area with a slower, heavier wave.'},
  {id:'force',title:'E + LMB · FORCE',mode:0,tip:'Hold E to lift a bot. Move the mouse, then click while holding E to crush what you grabbed.'},
  {id:'compact',title:'F · COMPACT',mode:2,tip:'At large scale, aim at a space and press F. Pull a group into one heavy rolling problem.'},
  {id:'levitate',title:'SPACE · LEVITATE',mode:0,tip:'Hold Space to hover. W rises, S descends; let go of W/S to hold altitude. Land to recover airtime.'},
  {id:'repel',title:'Q · REPEL',mode:1,tip:'Tap Q to swat shots away toward your aim. Hold Q to raise the staff, then release a powerful radial slam.'},
 ],
 marcus: [
  {id:'cartridges',title:'LMB + E · RECALL',mode:0,tip:'Fire bouncing cartridges, sidestep, then recall with E. The return trip can hit bots again.'},
  {id:'lcd',title:'SPACE · LCD',mode:0,tip:'Jump, then press and hold Space again in midair to freeze, aim and charge. Release to launch through cover.'},
  {id:'invader',title:'LMB · INVADER',mode:1,tip:'Hold to grow your invader, release to send it bombing. Keep moving while it does the work.'},
  {id:'pacman',title:'LMB · CHAIN',mode:2,tip:'Launch a bite, aim at the next bot, then click again. Chain your way to the final crunch.'},
  {id:'batch',title:'F + Q · BATCH',mode:0,tip:'F multiplies your cartridge shots. Flip through danger with Q, then recall your volley with E.'},
 ],
};

// A silent, isolated instance of actual combat. The reel uses the same input
// edges and held buttons as a player, so the displayed keys explain real moves.
export class Showcase {
 scene: Game; phase=0; time=0; frame=0; last=0; dead=false;
 paused=matchMedia('(prefers-reduced-motion: reduce)').matches;
 private drawWidth=0; private drawHeight=0;
 private fired=new Set<string>(); private target={x:360,y:844};
 private desired=new Set<string>(); private flashes=new Map<string,number>();
 private cue='AIM AT A BOT'; private cueUntil=0;
 private keyElements: HTMLElement[];
 private inputElement: HTMLElement;
 get clip(){return SHOWCASES[this.scene.character][this.phase];}
 get duration(){return this.clip.duration??8.5;}
 stage: DemoScene={setup:'',marks:[]};
 result='';
 finished=false;
 private settled=0;
 private lastKills=0;
 private readonly leadIn=1.25;
 private proof={maxKills:0,maxShieldHits:0,finisher:false,airHold:false,maxChain:0,reflected:0,refilled:false,caught:false,recovered:0};
 constructor(private canvas:HTMLCanvasElement,private host:HTMLElement,private owner:Game){
  const buffer=document.createElement('canvas');buffer.width=960;buffer.height=540;
  this.scene=new Game(buffer,true);
  this.scene.aimPoint=()=>this.target;
  this.scene.updateAim=()=>{const g=this.scene;g.aimAngle=Math.atan2(this.target.y-g.player.y-16,this.target.x-g.player.x-10);g.face=Math.cos(g.aimAngle)>=0?1:-1;g.aim=Math.atan2(Math.sin(g.aimAngle),Math.cos(g.aimAngle)*g.face);};
  this.keyElements=[...host.querySelectorAll<HTMLElement>('[data-demo-key]')];
  this.inputElement=host.querySelector<HTMLElement>('.showcase-inputs')!;
  host.querySelector('#preview-toggle')!.addEventListener('click',()=>{this.paused=!this.paused;this.last=0;this.status();});
  this.select(owner.character);this.frame=requestAnimationFrame(t=>this.loop(t));
 }
 select(id:Game['character']){
  this.scene.selectCharacter(id);this.phase=0;
  this.host.querySelector('#showcase-clips')!.innerHTML=SHOWCASES[id].map((c,i)=>`<button data-clip="${i}" aria-pressed="${i===0}">${c.title}</button>`).join('');
  this.host.querySelectorAll<HTMLButtonElement>('[data-clip]').forEach(b=>b.addEventListener('click',()=>{this.phase=Number(b.dataset.clip);this.reset();this.labels();}));
  this.reset();this.labels();
 }
 reset(){
  const g=this.scene,id=this.clip.id;g.start();g.effects=this.owner.effects;
  this.time=0;this.fired.clear();this.flashes.clear();this.desired.clear();this.cue='AIM AT A BOT';this.cueUntil=0;this.result='';this.finished=false;this.settled=0;this.lastKills=0;this.proof={maxKills:0,maxShieldHits:0,finisher:false,airHold:false,maxChain:0,reflected:0,refilled:false,caught:false,recovered:0};
  g.world.blocks.fill(null);g.world.destroyed=0;
  for(let x=0;x<48;x++)for(let y=43;y<50;y++)g.world.set(x,y,y===43?3:1);
  g.player.x=['duelist','molt'].includes(id)?230:175;g.player.y=828;g.cam=0;g.camY=440;
  g.enemies=[];g.barrels=[];g.relays=[];g.rescues=[];g.alarms=[];g.boss.active=false;g.time=0;
  // Preview actors already ignore damage; keep them visible, without respawn blinking.
  g.invuln=0;g.pointer.active=true;
  g.setThinking(this.clip.mode);
  this.stage=stageDemo(g,id);
  g.modeFeedback=0;this.target={x:345,y:844};g.updateAim();
  // Keep the wind-up and launch visible; never fast-forward past an input.
  this.draw();
 }
 private once(id:string,at:number,action:()=>void){if(this.time>=at+this.leadIn&&!this.fired.has(id)){this.fired.add(id);action();}}
 private say(label:string){this.cue=label;this.cueUntil=this.time+1.15;}
 private hold(key:string,start:number,end:number,label:string){
  if(this.time>=start+this.leadIn&&this.time<end+this.leadIn){this.desired.add(key);this.say(label);}
 }
 private tap(key:string,at:number,label:string){this.hold(key,at,at+.08,label);}
 private scroll(at:number,mode:number,label:string){this.once('scroll'+at,at,()=>{this.scene.setThinking(mode);this.flashes.set('SCROLL',this.time+.7);this.say(label);});}
 private attack(start:number,end:number,label='HOLD LMB · FIRE'){this.hold('MOUSE',start,end,label);}
 private move(key:string,start:number,end:number){this.hold(key,start,end,key==='KeyW'?'HOLD W · CLIMB':'HOLD '+key.slice(3)+' · REPOSITION');}
 private volley(at:number,fromLeft=false){
  this.once('volley'+at,at,()=>{
   const g=this.scene,e=g.enemies.find(e=>!e.dead&&!e.sheep&&e.hacked<=0&&(this.clip.id==='pilot'?e.type==='turret':fromLeft?e.x<g.player.x:e.x>g.player.x));
   if(!e)return;e.lockX=g.player.x+10;e.lockY=g.player.y+16;e.look=Math.atan2(e.lockY-e.y-15,e.lockX-e.x-10);e.face=fromLeft?1:-1;
   g.enemyShot(e);g.emit(e.x+10+Math.cos(e.look)*18,e.y+15,5,['#ffda95','#fff4cf'],55,2,.12);
  });
 }
 step(dt:number){
  const g=this.scene,t=this.time-this.leadIn,id=this.clip.id;this.desired.clear();
  const enemy=g.enemies.find(e=>!e.dead&&e.hacked<=0&&!e.sheep);
  this.target=enemy?{x:enemy.x+10,y:enemy.y+15}:{x:450,y:820};
  switch(id){
   case 'deck-run':
    this.move('KeyD',.2,.65);this.target={x:360,y:841};this.tap('KeyE',.68,'E · THROW THE DECK');this.tap('KeyE',1.45,'E · RECALL');this.move('KeyD',2.1,2.45);break;
   case 'deck-ram':
    this.move('KeyD',.2,1.15);break;
   case 'deck-grip':
    this.move('KeyD',.4,1.4);this.attack(.35,1.7,'LMB · HIT / HIT / FINISHER');break;
   case 'deck-parry':
    this.target={x:390,y:838};this.tap('KeyQ',.4,'Q · THROW SHIELD');this.volley(.45);this.volley(.6);this.tap('KeyE',1.2,'E · RECALL');break;
   case 'deck-flip':
    this.move('KeyD',.15,1.7);this.tap('Space',.55,'SPACE · OLLIE');this.tap('Space',.8,'SPACE · KICKFLIP');this.tap('KeyE',2,'E · CATCH DECK');break;
   case 'boots':
    this.hold('Space',.3,1.25,'HOLD SPACE · RISE');this.move('KeyD',.8,1.5);break;
   case 'levitate':
    this.hold('Space',.3,2.25,'HOLD SPACE · HOVER');this.move('KeyW',.7,1.9);this.move('KeyD',1.45,2.2);break;
   case 'grapple':
    this.target={x:380,y:690};this.hold('Space',.3,2.7,'HOLD SPACE · CLAW GRAPPLE');break;
   case 'reset':
    this.attack(.3,1.1,'HOLD LMB · SPEND TOKENS');
    if(t>1.1)this.target={x:350,y:840};
    this.tap('KeyF',1.35,'TAP F · THROW RESET');

    this.attack(3.4,4.8,'HOLD LMB · BACK IN BUSINESS');break;
   case 'tokens':
    this.attack(.3,3.6);this.scroll(1.6,2,'SCROLL UP · HEAVIER SHOTS');break;
   case 'double':
    this.tap('KeyE',.35,'TAP E · SEND OTHER TIBO');
    this.move('KeyD',.85,1.6);
    this.tap('KeyE',2.2,'TAP E · THROW HIM AGAIN');this.attack(3,4.2);break;
   case 'absorb':
    if(t<2.2)this.target={x:500,y:g.player.y+16};this.hold('KeyQ',.3,2.15,'HOLD Q · SHOTS BECOME TOKENS');
    for(const at of [.4,.8,1.2])this.volley(at);
    this.once('release',2.15,()=>this.say('RELEASE Q · RECOVERY STARTS'));this.attack(3.2,4.5);break;
   case 'pincher':case 'skipper':case 'crusher':
    if(t<.4||(t>=.9&&t<1.05))this.target=id==='pincher'?{x:435,y:835}:id==='crusher'?{x:310,y:915}:{x:330,y:935};
    this.tap('KeyE',.3,'TAP E · THROW A CLAW');if(id!=='pincher')this.tap('KeyE',.95,'TAP E · BUILD THE PACK');
    this.attack(id==='skipper'?.45:1.4,id==='skipper'?.55:1.6,'CLICK BOT · COMMAND THE PACK');if(id==='skipper')this.attack(3.2,3.6,'HOLD LMB · ATTACK WITH YOUR CLAW');break;
   case 'prism':
    this.target={x:500,y:g.player.y+16};
    this.tap('KeyQ',.3,'TAP Q · PLANT PRISM SHIELD');
    this.move('KeyA',.6,.78);this.volley(.35);this.volley(.7);this.volley(1.05);break;
   case 'molt':
    this.tap('KeyF',.3,'TAP F · MOLT');
    this.move('KeyD',.65,1.5);this.attack(.7,3.3,'HOLD LMB · PUNCH THROUGH THE BOTS');break;
   case 'duelist':
    this.attack(.3,1.9,'HOLD LMB · THREE-HIT COMBO');this.move('KeyD',1.9,2.2);this.tap('KeyF',2.4,'TAP F · GRAND SLAM');break;
   case 'remote':
    this.tap('KeyE',.3,'AIM + E · PAIR WITH A BOT');this.tap('KeyQ',.9,'TAP Q · IPHONE BUNKER');this.move('KeyD',1.05,1.35);
    this.attack(1.5,3.8,'LMB · FIRE THROUGH YOUR BOT');this.volley(1.1,true);this.volley(1.8,true);break;
   case 'mage':
    this.attack(.3,1.8,'HOLD LMB · CHARGE LIGHTNING');this.once('release',1.8,()=>this.say('RELEASE LMB · CHAIN LIGHTNING'));
    this.tap('KeyF',3.1,'TAP F · CALL DOWN A METEOR');break;
   case 'sheep':
    this.tap('KeyE',.3,'AIM + E · TURN BOT INTO SHEEP');this.hold('KeyQ',1,3.3,'HOLD Q · PROTECT INSIDE THE BUBBLE');
    this.move('KeyD',1.5,1.8);this.volley(.7);this.volley(1.5);this.attack(3.8,4.6,'HOLD LMB · CHARGE');break;
   case 'pilot':
    this.move('KeyW',.3,.5);this.move('KeyD',.5,1.3);this.tap('KeyE',1.45,'TAP E · BOMB STRAIGHT DOWN');
    if(t>=1.8){const turret=g.enemies.find(e=>!e.dead&&e.type==='turret');if(turret)this.target={x:turret.x+10,y:turret.y+15};}this.hold('KeyQ',2,3.8,'HOLD Q + AIM · DIRECTIONAL SHIELD');this.volley(1.9);this.volley(2.5);break;
   case 'rocket':
    this.target={x:405,y:839};this.tap('KeyF',.6,'AIM + F · LAUNCH ROCKET');break;
   case 'slop':
    this.attack(.3,.42,'CLICK · FAST SHOCKWAVE');this.scroll(1.8,2,'SCROLL UP · WIDER, SLOWER WAVE');this.attack(2.65,2.8,'CLICK · SWEEP THE LINE');break;
   case 'force':
    this.hold('KeyE',.3,2.25,'HOLD E · LIFT THE BOT');
    if(t>.55&&t<2.25)this.target={x:335+(t-.55)*45,y:740};
    this.attack(1.65,1.73,'HOLD E + CLICK · COMPACT IN YOUR HAND');this.once('release',2.25,()=>this.say('RELEASE E · THROW WHAT REMAINS'));break;
   case 'compact':
    this.target={x:385,y:830};this.tap('KeyF',.45,'AIM AT A SPACE + F · COMPACT');break;
   case 'repel':
    this.hold('KeyQ',.3,1.5,'HOLD Q · CHARGE REPEL');this.volley(1.42);this.volley(1.47,true);break;
   case 'cartridges':
    this.attack(.3,.4,'CLICK · BANK A CARTRIDGE');this.move('KeyD',.8,1.05);this.tap('KeyE',.95,'TAP E · RECALL THROUGH THE BOTS');break;
   case 'lcd':
    this.hold('Space',.3,.48,'SPACE · JUMP');this.target={x:445,y:860};this.hold('Space',.52,1.8,'HOLD SPACE IN AIR · FREEZE + CHARGE');
    this.once('release',1.8,()=>this.say('RELEASE SPACE · SMASH THROUGH COVER'));break;
   case 'invader':
    this.target={x:330,y:830};this.attack(.3,1.9,'HOLD LMB · GROW YOUR INVADER');
    this.once('release',1.9,()=>this.say('RELEASE LMB · SEND THE BOMBER'));break;
   case 'pacman': {
    const p=g.marcusKit.pacman.active;
    if(p){const next=g.enemies.find(e=>!e.dead&&!p.hit.has(e));if(next)this.target={x:next.x+10,y:next.y+15};
     if(p.phase==='bite'&&p.age>.22)this.once('bite'+p.chain,0,()=>{this.desired.add('MOUSE');this.say('AIM + CLICK AGAIN · NEXT BITE');});
    }else this.tap('MOUSE',.3,'CLICK · LAUNCH THE FIRST BITE');break;
   }
   case 'batch':
    this.tap('KeyF',.3,'TAP F · MULTIPLY YOUR VOLLEY');this.attack(.8,1.35,'HOLD LMB · BATCH FIRE');
    this.tap('KeyQ',1.55,'TAP Q · FLIP THROUGH DANGER');this.volley(1.3);this.tap('KeyE',2.1,'TAP E · RECALL THE VOLLEY');break;
  }
  g.updateAim();
  // Compare input states, preserving charge/release and combined-key behavior.
  for(const key of [...g.keys])if(!this.desired.has(key))g.release(key);
  for(const key of this.desired)if(key!=='MOUSE'&&!g.keys.has(key)){g.press(key);this.flashes.set(this.displayKey(key),this.time+.35);}
  const mouse=this.desired.has('MOUSE');if(mouse&&!g.pointer.down){g.pendingShot=.14;this.flashes.set('MOUSE',this.time+.35);}g.pointer.down=mouse;
  g.update(dt);g.cam=0;g.camY=440;g.modeFeedback=0;g.modeBurst=0;this.time+=dt;this.recordResult();this.updateEnding(dt);
  // Let the combat result deliver the punchline, rather than claiming a catch
  // or refill on a timer when the action may not actually have happened.
  if(id==='double'){
   if(g.otherTibo.catchFeedback>0)this.once('caught',0,()=>this.say('CAUGHT! · OTHER TIBO IS READY AGAIN'));
   else if(g.otherTibo.rewardTotal>0)this.once('reward',0,()=>this.say('HIT A BOT · GET YOUR TOKENS BACK'));
  }

 }
 private recordResult(){
  const g=this.scene,p=this.proof,id=this.clip.id;
  p.refilled ||= g.refillFeedback>0;
  p.caught ||= g.otherTibo.catchFeedback>0;
  p.recovered=Math.max(p.recovered,g.defense.recovered,g.otherTibo.rewardTotal);
  p.maxShieldHits=Math.max(p.maxShieldHits,100-g.dimillianKit.shieldHP);
  p.finisher ||= g.dimillianKit.swing?.step===2&&g.dimillianKit.swing.connected;
  p.airHold ||= g.marcusKit.lcd.charging&&!g.player.grounded;
  p.maxChain=Math.max(p.maxChain,g.marcusKit.pacman.bites);
  if(id==='repel')p.reflected=Math.max(p.reflected,g.bullets.filter(b=>!b.hostile&&b.owner===g.id).length);
  p.maxKills=Math.max(p.maxKills,g.kills);
  const kills=g.kills,broken=g.world.destroyed;
  const results:Record<string,string>={
   'deck-run':g.theoKit.carries>0&&g.theoKit.catches>0?'DECK HIT / CAUGHT':'',
   'deck-ram':g.theoKit.rams>=2?'FULL SEND':'',
   'deck-grip':g.theoKit.finishers>0?'DECK FINISHER':'',
   'deck-parry':g.theoKit.blocks>0?'VOLLEY BLOCKED':'',
   'deck-flip':g.theoKit.launches>0&&g.theoKit.catches>0?'KICKFLIP / CATCH':'',
   boots:g.player.grounded&&g.player.x>300&&g.player.y<700?'LEDGE REACHED WITH TOKEN THRUST':'',
   levitate:g.player.grounded&&g.player.x>300&&g.player.y<700?'LEVITATED ONTO THE LEDGE':'',
   grapple:g.vertical.grapple?.attached&&g.player.y<740?'CLAW LATCHED · PULLED UP TO THE LEDGE':'',
   reset:p.refilled&&kills>0?`QUOTA REFILLED · ${kills} BOTS CLEARED`:'',
   tokens:g.thinking===2&&kills>0?'ARMOR PIERCED · FIRING LINE BROKEN':'',
   double:p.caught&&p.recovered>0?`+${p.recovered} TOKENS · CATCH RECHARGED E`:'',
   absorb:g.defense.recovered>0&&kills>0?`+${g.defense.recovered} TOKENS · RETURNED AS GUNFIRE`:'',
   pincher:kills>=2?`${kills} BOTS · ONE LITTLE CLAW`:'',
   skipper:kills>=2?`${kills} BOTS CLEARED BY THE PACK`:'',
   crusher:broken>0&&kills>0?`WALL BREACHED · ${kills} BOTS CRUSHED`:'',
   prism:g.defense.blocks>=3?`${g.defense.blocks} SHOTS BLOCKED FROM COVER`:'',
   molt:kills>=2?`${kills} BOTS · ROADBLOCK REMOVED`:'',
   duelist:p.finisher?'TWO HITS LANDED · FINISHER CONNECTED':'',
   remote:g.dimillianKit.paired&&kills>0&&p.maxShieldHits>0?`${kills} BOTS SCRAPPED · SAFE IN THE BUNKER`:'',
   mage:kills>=3?`${kills} BOTS · CHAIN LIGHTNING`:'',
   sheep:g.enemies.some(e=>e.sheep)&&p.maxShieldHits>0?'THREAT DISARMED · INCOMING SHOTS ABSORBED':'',
   pilot:kills>0&&p.maxShieldHits>0?'BOMBS HIT BELOW · SHIELD CATCHES RETURN FIRE':'',
   rocket:kills>=3?`${kills} TARGETS CLEARED BY ONE ROCKET`:'',
   slop:kills>=3?'FAST PICK-OFF · WIDE FOLLOW-UP CLEARED THE GROUP':'',
   force:g.pidalfKit.props.length&&kills>0?'LIFTED OUT OF COVER · COMPACTED INTO SCRAP':'',
   compact:g.pidalfKit.props.some(b=>b.mass>=3)?`${kills} BOTS COMPRESSED INTO ONE BALL`:'',
   repel:p.reflected>0&&g.enemies.some(e=>e.flung>0||e.dead)?'CROSSFIRE REPELLED · SPACE TO FIGHT BACK':'',
   cartridges:g.marcusKit.returnHits>0&&g.marcusKit.catches>0?`OUTBOUND HIT + RETURN HIT · CARTRIDGE RECOVERED`:'',
   lcd:p.airHold&&g.marcusKit.lcd.broken>0&&g.marcusKit.lcd.hits>0?'AIR HELD · COVER SMASHED · BOTS KICKED':'',
   invader:g.marcusKit.invader.detonated>=2&&kills>=2?`${g.marcusKit.invader.detonated} BOMBS · ${kills} BOTS · STILL IN COVER`:'',
   pacman:g.marcusKit.pacman.finishers>0?'FOUR LINKED BITES · FINAL CRUNCH':'',
   batch:kills>=3&&g.marcusKit.returnHits>0?'MULTIPLIED VOLLEY · HITS ON THE RETURN TRIP':'',
  };
  if(results[id])this.result=results[id];
 }
 private updateEnding(dt:number){
  const g=this.scene,t=this.time-this.leadIn;
  // Wait for the move itself, not an arbitrary amount of empty footage. These
  // gates preserve follow-up moves in a combo and the last visible impact.
  let ready=!!this.result;
  switch(this.clip.id){
   case 'reset': ready &&= g.refillFeedback<.8&&!g.resetProp;break;
   case 'double': ready &&= t>2.25&&(!g.otherTibo.active||(g.otherTibo.active.phase==='guard'&&g.otherTibo.active.age>1));break;
   case 'duelist': ready &&= g.dimillianKit.fCooldown>0&&g.dimillianKit.special<=0&&!g.dimillianKit.swing;break;
   case 'mage': ready &&= g.dimillianKit.fCooldown>0&&!g.dimillianKit.meteor&&g.dimillianKit.special<=0&&!g.dimillianKit.lightning.length;break;
   case 'pilot': ready &&= !g.dimillianKit.bombs.length;break;
   case 'force': ready &&= t>2.25&&!g.pidalfKit.grabbing&&!g.pidalfKit.crush;break;
   case 'compact': ready &&= !g.pidalfKit.crush;break;
   case 'repel': ready &&= !g.pidalfKit.wardCharging&&g.pidalfKit.ward<=0;break;
   case 'lcd': ready &&= !g.marcusKit.lcd.flight&&!g.marcusKit.lcd.charging;break;
   case 'invader': ready &&= !g.marcusKit.invader.bombs.length&&(!g.marcusKit.invader.craft||g.marcusKit.invader.craft.phase==='back');break;
   case 'batch': ready &&= t>1.55&&g.marcusKit.catches>0;break;
   case 'pincher':case 'skipper':case 'crusher':case 'molt':case 'tokens':case 'rocket':case 'slop':
    ready &&= g.enemies.every(e=>e.dead);break;
  }
  // Give the last hit a short breath, restarting it if another bot goes down.
  this.settled=ready&&g.kills===this.lastKills?this.settled+dt:0;
  this.lastKills=g.kills;
  this.finished=this.settled>=.6||this.time>=this.duration;
 }
 private displayKey(key:string){return key==='Space'?'MOVE':['KeyA','KeyD','KeyW','KeyS'].includes(key)?'MOVE':key.replace('Key','');}
 labels(){
  this.host.querySelector('#showcase-caption')!.textContent=this.clip.tip;
  this.host.querySelectorAll<HTMLButtonElement>('[data-clip]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.clip)===this.phase)));this.status();
 }
 status(){const b=this.host.querySelector<HTMLButtonElement>('#preview-toggle')!;b.textContent=this.paused?'▶ PLAY':'Ⅱ PAUSE';b.setAttribute('aria-label',this.paused?'Play gameplay preview':'Pause gameplay preview');}
 private drawSceneMarks(){
  const g=this.scene,c=g.c;c.save();c.translate(0,-g.camY);
  // Small hazard markings belong to the scene, without tutorial labels.
  c.font='bold 7px monospace';c.textAlign='center';
  for(const {x} of this.stage.marks){
   c.fillStyle='#e9bb68';c.globalAlpha=.65;
   for(let i=-2;i<=2;i++)c.fillRect(x+i*8,863,4,2);
  }
  if(g.character==='tibo'){
   c.globalAlpha=1;c.fillStyle='#172325';c.fillRect(130,703,108,20);
   c.fillStyle='#d5ff60';c.textAlign='left';c.fillText(`${Math.round(g.usage)} / 1000 TOK`,135,712);
   c.fillStyle='#465451';c.fillRect(135,716,96,3);c.fillStyle=g.usage<50?'#ff9a72':'#d5ff60';c.fillRect(135,716,96*g.usage/1000,3);
  }
  c.restore();
 }
 draw(){
  const g=this.scene,invuln=g.invuln;g.invuln=0;g.render();g.invuln=invuln;this.drawSceneMarks();const c=this.canvas.getContext('2d')!,ratio=this.canvas.clientHeight/Math.max(1,this.canvas.clientWidth),height=Math.max(1,Math.round(960*ratio));
  if(this.canvas.height!==height)this.canvas.height=height;
  c.imageSmoothingEnabled=false;
  // Frame the floor AND airborne abilities above the input rail. Short windows
  // pull back rather than cropping the reset hand, a bomber or the player.
  const width=Math.max(1,this.canvas.clientWidth),combatHeight=Math.max(80,this.canvas.clientHeight-this.inputElement.offsetHeight-42);
  const span=Math.max(180,860-g.player.y+60),w=Math.min(820,Math.max(500,span*width/combatHeight)),h=w*ratio;
  const bottom=860-g.camY+(this.inputElement.offsetHeight+16)*w/width;
  c.fillStyle='#10141a';c.fillRect(0,0,960,height);
  c.drawImage(g.canvas,95,bottom-h,w,h,0,0,960,height);
  // The replay cursor makes aim-dependent specials and enemy commands legible.
  const x=(this.target.x-95)*960/w,y=(this.target.y-g.camY-bottom+h)*960/w;
  c.save();c.strokeStyle='#fff2cf';c.globalAlpha=.7;c.lineWidth=2;c.beginPath();c.arc(x,y,9,0,Math.PI*2);c.moveTo(x-15,y);c.lineTo(x-6,y);c.moveTo(x+6,y);c.lineTo(x+15,y);c.moveTo(x,y-15);c.lineTo(x,y-6);c.moveTo(x,y+6);c.lineTo(x,y+15);c.stroke();c.restore();
  const active=new Set([...this.desired].map(key=>this.displayKey(key)));
  for(const el of this.keyElements){const key=el.dataset.demoKey!;el.dataset.active=String(active.has(key)||(this.flashes.get(key)??0)>this.time);el.dataset.held=String(active.has(key));
   if(key==='MOVE')el.querySelector('kbd')!.textContent=this.desired.has('Space')?'SPACE':[...this.desired].filter(k=>/^Key[WASD]$/.test(k)).map(k=>k.slice(3)).join('+')||'WASD';}
  this.drawWidth=this.canvas.clientWidth;this.drawHeight=this.canvas.clientHeight;
  this.host.style.setProperty('--preview-progress',String(this.finished?1:Math.max(Math.min(.85,this.time/this.duration*.85),this.settled>0?.85+.15*this.settled/.6:0)));
  this.host.dataset.previewCharacter=g.character;this.host.dataset.previewPhase=String(this.phase);this.host.dataset.previewClip=this.clip.id;this.host.dataset.previewTime=this.time.toFixed(2);
 }
 loop(now:number){
  if(this.dead)return;if(!this.canvas.isConnected||this.owner.state!=='title'){this.destroy();return;}
  const dt=this.last?Math.min(.05,(now-this.last)/1000):0;this.last=now;
  if(!document.hidden&&!this.paused){let left=dt;while(left>0){const step=Math.min(1/120,left);this.step(step);left-=step;}if(this.finished){this.phase=(this.phase+1)%SHOWCASES[this.scene.character].length;this.reset();this.labels();}}
  if(!document.hidden&&(!this.paused||this.drawWidth!==this.canvas.clientWidth||this.drawHeight!==this.canvas.clientHeight))this.draw();this.frame=requestAnimationFrame(t=>this.loop(t));
 }
 destroy(){this.dead=true;cancelAnimationFrame(this.frame);this.scene.keys.clear();this.scene.pointer.down=false;this.scene.audio.silenceRobots();}
}
