async(page)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/src/main.ts*',async route=>{const r=await route.fetch();await route.fulfill({response:r,body:(await r.text())+'\nwindow.__qa=game;'});});await page.setViewportSize({width:1440,height:960});await page.reload();
 try{
 const result=await page.evaluate(async()=>{
  const g=window.__qa;cancelAnimationFrame(g.frame);const {SECTORS}=await import('/src/level.ts');const {LADDERS}=await import('/src/world.ts');const assert=(v,m)=>{if(!v)throw Error(m);};
  const reset=()=>{g.selectCharacter('tibo');g.start();g.finishIntro();g.audio.setMuted(true);g.effects=false;g.invuln=999;g.toastTimer=0;document.querySelector('.toast').innerHTML='';};
  reset();const enemies=g.enemies.length,barrels=g.barrels.length;assert(enemies>=35&&barrels>=30,'Missing encounter density');
  for(const e of g.enemies)assert(!g.world.overlaps(e.x,e.y,e.w,e.h),'Enemy in terrain '+JSON.stringify([e.x,e.y,e.type]));
  for(const b of g.barrels)assert(!g.world.overlaps(b.x,b.y,b.w,b.h),'Barrel in terrain '+JSON.stringify([b.x,b.y]));
  for(const l of LADDERS)assert(!g.world.overlaps(l.x-10,l.top-32,20,32),'Blocked ladder exit '+l.x);
  const landings=SECTORS.map(s=>s.doors.map(([x,y])=>g.encounters.landing(x,y)));assert(landings.every(a=>a.every(Boolean)),'Sector lacks valid reinforcement entrances '+JSON.stringify(landings));
  // Run finite encounter waves, keeping the fixture clear between drops.
  const waves=[];for(let sector=0;sector<SECTORS.length;sector++){reset();const s=SECTORS[sector];g.player.x=s.from+120;g.enemies=g.enemies.filter(e=>e.sector===sector);g.enemies.forEach((e,i)=>{if(i>0)e.dead=true;});const initial=g.enemies.length;
   g.encounters.update(.1);assert(g.encounters.states[sector].active,'Combat did not activate sector');g.encounters.states[sector].timer=0;g.encounters.update(.01);assert(g.encounters.pending.length>0&&g.enemies.length===initial,'Drops must be telegraphed');
   for(let i=0;i<600;i++){g.encounters.update(.1);for(const e of g.enemies)e.dead=true;}
   assert(g.encounters.states[sector].wave===s.waves.length,'Waves did not exhaust');const count=g.enemies.length;for(let i=0;i<300;i++)g.encounters.update(.1);assert(g.enemies.length===count,'Infinite reinforcements');waves.push(count-initial);
  }
  reset();g.player.x=1150;const before=g.enemies.length;g.enemies.find(e=>e.sector===1).awareness.state='combat';g.encounters.states[1].timer=0;g.encounters.update(.1);assert(!g.encounters.pending.length&&g.enemies.length===before,'Nearby enemy cap ignored');
  reset();const kit=g.encounters.supplies[0];g.health=1;g.usage=10;g.player.x=kit.x-10;g.player.y=kit.y-16;g.encounters.update(.01);assert(kit.used&&g.health===3&&g.usage===1000&&g.checkpoint===kit.x,'Field kit failed');g.health=1;g.encounters.update(.01);assert(g.health===1,'Field kit farmable');g.die();g.respawn();assert(g.encounters.supplies[0].used,'Respawn refilled used kit');
  reset();const deck=g.world.blocks.findIndex(b=>b?.kind===5),x=deck%204*20,y=Math.floor(deck/204)*20;g.world.damage(x+5,y+5,3);assert(!g.world.at(x+5,y+5),'Deck not destructible');
  // Core routes and uplinks still have stable anchors after all breakables are removed.
  for(let y=0;y<50;y++)for(let x=0;x<204;x++)g.world.damage(x*20+5,y*20+5,999);
  for(const l of LADDERS.slice(0,3))assert(g.world.at(l.x,l.top+1)?.kind===3,'Opening route lost');
  for(const r of g.relays)assert(g.world.at(r.x+10,r.y+35)?.kind===3,'Uplink loses footing');
  reset();g.player.x=540;g.player.y=650;g.cam=200;g.camY=370;g.triggerAlarm(650,680);g.encounters.states[0].active=true;g.encounters.states[0].timer=0;g.encounters.update(.01);g.hud();g.render();
  return {enemies,barrels,waves,landings};
 });
 await page.screenshot({path:'output/playwright/level-loading-yard-v30.png'});
 for(const [name,x,y,cam,camY] of [['tower',1300,530,940,180],['crossing',2240,670,1800,380],['demolition',2810,590,2520,260],['boss',3470,820,3100,440]]){
  await page.evaluate(({x,y,cam,camY})=>{const g=window.__qa;g.player.x=x;g.player.y=y;g.cam=cam;g.camY=camY;g.hud();g.render();},{x,y,cam,camY});await page.screenshot({path:'output/playwright/level-'+name+'-v30.png'});
 }
 if(errors.length)throw Error(errors.join('\n'));return {result,errors};
 }finally{await page.unroute('**/src/main.ts*');await page.reload();}
}
