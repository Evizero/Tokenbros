async (page)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/src/main.ts*',async route=>{const r=await route.fetch();await route.fulfill({response:r,body:(await r.text())+'\nwindow.__qa=game;'});});await page.reload();
 await page.screenshot({path:'output/playwright/peter-title-v8.png'});await page.locator('#start').click();await page.waitForTimeout(450);await page.screenshot({path:'output/playwright/peter-intro-v8.png'});await page.keyboard.press('Enter');
 const result=await page.evaluate(()=>{
  const g=window.__qa;cancelAnimationFrame(g.frame);const assert=(v,m)=>{if(!v)throw Error(m);};
  function clean(){g.start();g.finishIntro();g.effects=false;g.pointer.active=false;g.face=1;g.aimAngle=0;g.player.x=100;g.player.y=828;g.enemies=[];g.barrels=[];g.invuln=100;g.world.blocks.fill(null);for(let x=0;x<204;x++)g.world.set(x,43,3);}
  clean();const enemy=g.spawnEnemy(270,830,'shield');g.enemies=[enemy];g.thinking=2;g.peterKit.throw();for(let i=0;i<140;i++)g.peterKit.update(1/120);assert(enemy.shield===0,'Crusher did not strip armor');assert(enemy.hp<7,'Thrown claw did no impact damage');
  clean();for(let i=0;i<6;i++){g.peterKit.throwCooldown=0;g.peterKit.throw();}assert(g.peterKit.pets.length===4,'Unbounded swarm');assert(g.peterKit.stock===0,'Throws did not use stock');g.peterKit.throw();assert(g.peterKit.stock===0&&g.peterKit.pets.length===4,'Empty stock still throws');g.peterKit.update(1.31);assert(g.peterKit.stock===1,'Claws do not regrow');
  const stock=g.peterKit.stock;g.peterKit.command();assert(g.peterKit.pets.every(p=>p.order===2),'E did not order pets');assert(g.peterKit.stock===stock,'Command consumes ammo');
  const p=g.peterKit.pets[0];g.peterKit.absorb(p.x+3,p.y+3);g.peterKit.absorb(p.x+3,p.y+3);assert(p.hp<=0,'Pets cannot be destroyed');
  clean();g.thinking=2;for(let row=40;row<43;row++)g.world.set(10,row,2);g.peterKit.throw();for(let i=0;i<120;i++)g.peterKit.update(1/120);assert(g.world.destroyed>0,'Crusher cannot break route cover');
  clean();g.player.x=3570;g.player.y=828;g.boss.active=true;g.boss.phase=2;g.thinking=1;g.peterKit.throw();for(let i=0;i<80;i++)g.peterKit.update(1/120);assert(g.boss.hp<100,'Claw cannot hurt exposed boss');
  clean();const bot=g.spawnEnemy(150,830,'shield');g.enemies=[bot];g.peterKit.transform();assert(g.peterKit.molt===5,'No transform');g.shoot();assert(bot.dead,'Molt punch did not finish close shield bot');g.peterKit.update(5.1);assert(g.peterKit.molt===0&&g.peterKit.moltCooldown>0,'Molt permanent or cooldown absent');
  clean();for(const [i,r] of g.relays.entries()){g.player.x=r.x;g.player.y=r.y;g.press('KeyE');g.release('KeyE');assert(r.done,'Peter cannot override uplink '+i);}assert(!g.world.get(90,20)&&!g.world.get(160,30),'Gate stays closed');
  // Real throw descends >600px before arming, and only then restores tokens.
  g.selectCharacter('tibo');clean();g.player.y=150;g.usage=0;g.reset();for(let i=0;i<80;i++)g.updateReset(1/120);assert(g.resetProp&&!g.resetProp.landed&&g.usage===0,'Airborne reset activated');
  const x0=g.resetProp.x;let landing=null;for(let i=0;i<400&&g.resetProp;i++){g.updateReset(1/120);if(g.resetProp?.landed&&!landing)landing={x:g.resetProp.x,y:g.resetProp.y};}
  assert(landing&&landing.y===850&&landing.x>x0,'Button did not fall to floor');assert(g.usage===1000,'Ground slam failed to refill');g.thinking=0;g.shoot();assert(g.usage===992,'Tibo firing regression');assert(document.documentElement.dataset.character==='tibo','Tibo accent did not switch');
  // Use actual map for visual review.
  g.selectCharacter('peter');g.start();g.finishIntro();g.effects=false;g.invuln=0;g.player.x=540;g.player.y=708;g.cam=280;g.camY=350;g.pointer.active=false;g.face=1;g.aimAngle=-.25;
  for(const k of [0,1,2]){g.thinking=k;g.peterKit.throwCooldown=0;g.peterKit.throw();}for(let i=0;i<20;i++)g.peterKit.update(1/120);g.peterKit.command();document.querySelector('.toast').innerHTML='';g.hud();g.render();
  return {claws:'impact, armor break, cover break, boss damage, stock recovery, four-pet cap, commands, vulnerable pets',molt:'close melee kill, finite duration and cooldown',mission:'both Peter uplinks open',reset:'falls 700px before arming, refill only on impact, next shot costs tokens',landing,accent:getComputedStyle(document.documentElement).getPropertyValue('--acid')};
 });
 await page.screenshot({path:'output/playwright/peter-swarm-v8.png'});
 await page.evaluate(()=>{const g=window.__qa;g.peterKit.transform();g.peterKit.punchAttack();g.peterKit.terminalTime=.12;g.hud();g.render();});await page.screenshot({path:'output/playwright/peter-molt-v8.png'});
 await page.setViewportSize({width:800,height:640});await page.screenshot({path:'output/playwright/peter-compact-v8.png'});await page.setViewportSize({width:1280,height:720});
 if(errors.length)throw Error(errors.join('\n'));await page.unroute('**/src/main.ts*');await page.reload();return {result,errors};
}
