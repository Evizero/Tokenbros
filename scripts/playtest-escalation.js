async (page) => {
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/src/main.ts*',async route=>{const r=await route.fetch();await route.fulfill({response:r,body:(await r.text())+'\nwindow.__qa=game;'});});
  await page.reload();await page.locator('[data-bro=tibo]').click();await page.keyboard.press('Enter');await page.keyboard.press('Enter');
  const result=await page.evaluate(()=>{
    const g=window.__qa;cancelAnimationFrame(g.frame);g.effects=false;g.keys.clear();g.pointer.active=false;g.enemies=[];g.barrels=[];g.invuln=100;
    const assert=(yes,message)=>{if(!yes)throw Error(message);};
    // A large blast can be heard through the refinery at ~1,000px, but has a finite range.
    const near=g.spawnEnemy(1180,828,'gunner'),far=g.spawnEnemy(1800,828,'gunner');g.enemies=[near,far];
    g.explode(200,830,80);assert(near.awareness.state==='investigate','Distant blast inaudible');assert(far.awareness.state==='patrol','Blast infinite range');
    const alarm=g.alarms[0];assert(alarm.timer===2.4,'No response warning');g.updateAlarms(2);assert(g.enemies.length===2,'Reinforcements arrived without warning');g.updateAlarms(.5);assert(g.enemies.length===4,'Missing backup');
    g.explode(200,830,80);g.updateAlarms(3);assert(g.enemies.length===4,'Repeat blast farmed reinforcements');
    // Independent visual confirmation rallies nearby allies to a last-known point only.
    g.start();g.finishIntro();g.effects=false;g.player.x=180;g.player.y=828;g.invuln=100;g.barrels=[];
    const spotter=g.spawnEnemy(310,830,'gunner'),ally=g.spawnEnemy(400,830,'gunner',1);spotter.patrolWait=100;ally.patrolWait=100;spotter.cool=100;ally.cool=100;g.enemies=[spotter,ally];
    for(let i=0;i<45;i++)g.update(1/120);assert(spotter.awareness.state==='combat','Spotter failed to acquire');assert(ally.awareness.state==='investigate','Nearby ally not rallied');
    // Refill is delayed until impact; blast kills locally; subsequent shot still costs tokens.
    g.start();g.finishIntro();g.effects=false;g.enemies=[g.spawnEnemy(320,830,'shield')];g.barrels=[];g.player.x=170;g.player.y=828;g.usage=0;g.thinking=0;g.reset();g.updateReset(.3);assert(g.usage===0,'Early refill');for(let i=0;i<150;i++)g.updateReset(1/120);assert(g.usage===1000,'Missing refill');assert(g.enemies[0].dead,'Slam has no local explosion');
    g.shoot();assert(g.usage===992,'Reset still gives free shots');assert(g.fireTimer===.095,'Reset boosts firing cadence');
    // Yoink must remove armor, interrupt wind-up and physically relocate the target.
    g.start();g.finishIntro();g.effects=false;g.player.x=120;g.player.y=828;g.barrels=[];g.invuln=100;g.pointer.active=false;g.face=1;
    const target=g.spawnEnemy(310,830,'shield');target.wind=.4;g.enemies=[target];g.yoink();assert(target.shield===0&&target.wind===0,'Yoink did not strip/interrupt');assert(g.yoinkCooldown===3,'Wrong yoink cooldown');
    const before=target.x;for(let i=0;i<24;i++)g.update(1/120);assert(target.x<before-50,'Yoink has no physical pull');
    // A pulled robot collides with, and primes, a barrel.
    g.start();g.finishIntro();g.effects=false;g.player.x=120;g.player.y=828;g.invuln=100;g.face=1;g.pointer.active=false;
    const dragged=g.spawnEnemy(310,830,'shield');g.enemies=[dragged];g.barrels=[{x:275,y:812,w:18,h:30,hp:2,dead:false,fuse:0}];g.yoink();for(let i=0;i<30;i++)g.update(1/120);assert(g.barrels[0].dead||g.barrels[0].fuse>0,'Dragged robot failed to hit barrel');
    // Solid cover prevents a grab.
    g.start();g.finishIntro();g.effects=false;g.player.x=120;g.player.y=828;g.face=1;g.pointer.active=false;g.enemies=[g.spawnEnemy(300,830,'shield')];for(let row=39;row<43;row++)g.world.set(11,row,3);g.yoink();assert(g.enemies[0].shield===6,'Yoink penetrated wall');assert(g.yoinkCooldown===.35,'Miss consumes long cooldown');
    // Ready a representative screenshot without altering the user's browser.
    g.start();g.finishIntro();g.effects=false;g.player.x=530;g.player.y=708;g.cam=230;g.camY=340;g.thinking=1.14;g.usage=684;g.tokenTrail=720;g.triggerAlarm(600,720);g.toastTimer=0;document.querySelector('.toast').innerHTML='';g.hud();g.render();
    return {hearing:'covered guard at 980px investigates; guard at 1600px stays idle',backup:'2.4s warning, two drones, one response per beacon',coordination:'nearby ally investigates confirmed sighting',reset:'refills on impact, local kill, next shot costs 8',yoink:'strips armor, interrupts, pulls >50px, detonates barrel, respects walls'};
  });
  await page.screenshot({path:'output/playwright/escalation-v7.png'});
  const hud=await page.locator('.resources').boundingBox();const panels=await page.locator('.thinking-control').count();
  await page.mouse.move(700,350);await page.mouse.wheel(0,-18);const after=await page.evaluate(()=>window.tokenbros.snapshot());if(Math.abs(after.thinkingPercent-60)>0.1)throw Error('Continuous scroll regression');
  await page.locator('#thinking-slider').fill('25');if((await page.evaluate(()=>window.tokenbros.snapshot())).thinkingPercent!==25)throw Error('Gauge drag broken');
  if(errors.length)throw Error(errors.join('\n'));
  await page.unroute('**/src/main.ts*');await page.reload();return {result,hud,thinkingGauges:panels,errors};
}
