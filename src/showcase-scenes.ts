import type { Game } from './game';

export type DemoScene = {
 setup: string;
 marks: { x: number; label: string }[];
};

// Small encounter dioramas, built from the same tiles and actors as the level.
// Each has a specific obstacle or enemy arrangement that earns the ability.
export function stageDemo(g: Game, id: string): DemoScene {
 const marks: DemoScene['marks']=[];
 const bot=(x:number,type='gunner',hp=6,y=830)=>{
  const e=g.spawnEnemy(x,y,type,-1);e.hp=e.max=hp;e.cool=4;e.patrolWait=20;g.enemies.push(e);return e;
 };
 const wall=(x:number,height=3,width=1,kind=2)=>{
  for(let xx=x;xx<x+width;xx++)for(let y=43-height;y<43;y++)g.world.set(xx,y,kind);
 };
 const barrel=(x:number)=>g.barrels.push({x,y:830,w:18,h:30,vx:0,vy:0,grounded:false,hp:2,dead:false,fuse:0});
 const mark=(x:number,label:string)=>marks.push({x,label});
 let setup='';
 switch(id){
  case 'deck-run':
   bot(350,'gunner',5);bot(430,'gunner',5);wall(25,3);break;
  case 'deck-ram':
   bot(465,'gunner',4);bot(515,'gunner',4);break;
  case 'deck-grip':
   g.player.x=245;bot(295,'gunner',6);bot(360,'gunner',6);bot(430,'shield',12);wall(24,3);break;
  case 'deck-parry':
   bot(390,'turret',4);break;
  case 'deck-flip':
   bot(240,'gunner',4);bot(370,'gunner',4);break;
  case 'boots':case 'levitate':case 'grapple':
   for(let x=16;x<23;x++)g.world.set(x,34,3);mark(380,'UPPER LEDGE');setup='REACH THE UPPER LEDGE.';break;
  case 'reset':
   g.usage=56;g.tokenTrail=56;bot(295,'shield',8);bot(355);bot(400);barrel(375);wall(21,2);
   mark(360,'BLAST ZONE');setup='ALMOST EMPTY. BOTS HOLD THE CHOKEPOINT.';break;
  case 'tokens':
   bot(335,'shield',10);bot(430);wall(24,3);mark(335,'ARMORED FRONT');setup='LIGHT SHOTS CANNOT GET THROUGH THIS SHIELD.';break;
  case 'double':
   g.usage=180;g.tokenTrail=180;bot(325,'gunner',6);bot(480,'gunner',6);mark(325,'THROW / CATCH');setup='SEND YOUR DOUBLE. FOLLOW UP AND CATCH HIM.';break;
  case 'absorb':
   g.usage=0;g.tokenTrail=0;bot(420,'gunner',8);mark(185,'EMPTY QUOTA');mark(430,'FIRING LINE');setup='NO TOKENS. LET THEIR GUNS RELOAD YOURS.';break;
  case 'pincher':
   wall(13,2);bot(380,'turret',4);bot(412,'turret',4);bot(444,'turret',4);barrel(355);mark(260,'LOW COVER');mark(410,'CLUSTER');setup='THROW OVER COVER. LET THE LITTLE CLAW FIND THE GROUP.';break;
  case 'skipper':
   bot(350,'gunner',4);bot(395,'gunner',4);bot(440,'gunner',4);mark(395,'DASH LANE');setup='THREE BOTS IN A LINE. ONE CHARGING CLAW.';break;
  case 'crusher':
   wall(17,4,2);bot(415,'shield',8);bot(490,'gunner',5);mark(350,'BREAKABLE COVER');setup='THE TARGET IS BEHIND A WALL. SEND THE HEAVY CLAW.';break;
  case 'prism':
   bot(460,'turret',4);mark(175,'RETREAT HERE');mark(245,'PLANT SHIELD');setup='PLANT COVER AND STEP BACK WHILE IT CATCHES THE VOLLEY.';break;
  case 'molt':
   g.player.x=245;bot(325,'shield',8);bot(370);bot(425);wall(24,3);mark(365,'BRAWL');setup='A CLOSE-RANGE ROADBLOCK. MOLT AND PUNCH THROUGH.';break;
  case 'duelist':
   g.player.x=245;bot(280,'gunner',14);bot(385,'shield',9);wall(22,3);mark(280,'COMBO TARGET');setup='STAY CLOSE: TWO HITS UNLOCK THE THIRD-HIT FINISHER.';break;
  case 'remote':
   bot(325,'gunner',12);bot(440,'gunner',4);bot(495,'gunner',4);const rear=bot(110,'turret',12);rear.face=1;mark(185,'BUNKER');mark(325,'PAIR THIS BOT');setup='TAKE THEIR GUN. FIRE IT FROM INSIDE YOUR BUNKER.';break;
  case 'mage':
   bot(355,'gunner',5);bot(395,'gunner',5);bot(430,'gunner',5);bot(520,'turret',8);wall(23,2);
   mark(385,'CHAIN TARGETS');setup='CHARGE, THEN RELEASE LIGHTNING THROUGH THE GROUP.';break;
  case 'sheep':
   bot(300,'turret',10);bot(460,'gunner',8);mark(300,'PRIORITY THREAT');setup='REMOVE ONE GUN FROM THE FIGHT. SHIELD THE REST.';break;
  case 'pilot':
   g.player.x=210;g.player.y=750;wall(14,5,1,3);bot(355,'gunner',4);bot(390,'gunner',4);bot(520,'turret',8,710);g.world.set(26,37,3);g.world.set(27,37,3);
   mark(280,'FLY OVER');mark(375,'BOMB BELOW');setup='A HIGH WALL AND BOTS BELOW. TAKE THE AIR ROUTE.';break;
  case 'rocket':
   g.player.y=750;bot(385,'gunner',4);bot(420,'shield',8);bot(465,'gunner',4);barrel(445);
   mark(420,'ROCKET TARGETS');setup='ONE HEAVY ROCKET BREAKS A CLUSTERED DEFENSE.';break;
  case 'slop':
   bot(310,'gunner',5);bot(420,'gunner',5);bot(455,'gunner',5);bot(490,'gunner',5);mark(310,'SINGLE');mark(455,'GROUP');setup='FAST WAVE FOR ONE BOT. WIDE WAVE FOR THE LINE.';break;
  case 'force':
   bot(335,'gunner',6);wall(14,3);bot(500,'gunner',6);mark(290,'LIFT ABOVE COVER');setup='A BOT BEHIND COVER. LIFT IT OUT BEFORE COMPACTING.';break;
  case 'compact':
   for(const x of [320,350,380,410,440])bot(x,'gunner',5);
   mark(385,'COMPACT THE GROUP');setup='FIVE BOTS. ONE COMPRESSION FIELD. ONE BALL OF SCRAP.';break;
  case 'repel':
   g.player.x=310;const left=bot(195,'turret',6);left.face=1;bot(435,'turret',6);bot(510,'gunner',6);
   mark(320,'SURROUNDED');setup='SHOTS FROM BOTH SIDES. MAKE YOUR OWN BREATHING ROOM.';break;
  case 'cartridges':
   bot(315,'gunner',18);wall(24,5,1,3);mark(480,'BOUNCE WALL');mark(315,'OUT + BACK');setup='BANK A CARTRIDGE, THEN RECALL IT THROUGH THE SAME BOT.';break;
  case 'lcd':
   wall(15,3,1);bot(375,'turret',6);bot(430,'turret',6);mark(300,'SMASH THROUGH');
   setup='JUMP, HOLD IN MIDAIR, THEN LAUNCH THROUGH THE CRATES.';break;
  case 'invader':
   wall(13,1);for(const x of [340,380,420,460])bot(x,'turret',4);mark(260,'COVER');mark(405,'BOMBING RUN');setup='STAY BEHIND COVER. SEND A BOMBER OVER THE WHOLE LINE.';break;
  case 'pacman':
   bot(300,'gunner',4);bot(380,'drone',4,740);bot(465,'gunner',4);bot(540,'drone',4,775);
   mark(410,'AIM THE NEXT BITE');setup='SCATTERED TARGETS. STEER EACH BITE TO THE NEXT BOT.';break;
  case 'batch':
   bot(340,'gunner',5);bot(380,'drone',5,790);bot(435,'gunner',5);bot(505,'gunner',5);wall(28,4,1,3);
   mark(420,'WIDE TARGET SPREAD');setup='MULTIPLY YOUR SHOTS. DODGE, THEN RECALL THE VOLLEY.';break;
 }
 return {setup,marks};
}
