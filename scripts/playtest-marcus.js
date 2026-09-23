async(page)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/src/main.ts*',async route=>{const r=await route.fetch();await route.fulfill({response:r,body:(await r.text())+'\nwindow.__qa=game;'});});
 await page.setViewportSize({width:1440,height:960});await page.reload();
 try{
  await page.locator('[data-bro="marcus"]').click();
  await page.evaluate(()=>document.getAnimations().forEach(a=>a.finish()));
  await page.screenshot({path:'output/playwright/marcus-roster-v31.png'});
  await page.locator('#start').click();
  await page.evaluate(()=>document.getAnimations().forEach(a=>a.finish()));
  await page.screenshot({path:'output/playwright/marcus-intro-v31.png'});
  await page.locator('.skip-intro').click();
  await page.keyboard.press('Digit1');
  const canvas=await page.locator('#game').boundingBox();await page.mouse.move(canvas.x+canvas.width*.45,canvas.y+canvas.height*.65);await page.mouse.click(canvas.x+canvas.width*.45,canvas.y+canvas.height*.65);await page.waitForTimeout(150);
  if(!await page.evaluate(()=>window.__qa.shotCount>0&&window.__qa.marcusKit.mode===0))throw Error('Mouse launch / mode input failed');
  await page.keyboard.press('KeyE');await page.keyboard.press('KeyQ');await page.keyboard.press('KeyF');
  if(!await page.evaluate(()=>window.__qa.marcusKit.flipCooldown>0&&window.__qa.marcusKit.batch>0))throw Error('Q / F keyboard dispatch failed');
  await page.keyboard.press('Digit3');await page.mouse.wheel(180,180);
  await page.waitForTimeout(80);
  if(!await page.evaluate(()=>window.__qa.thinking<2&&window.__qa.modeFeedback>0))throw Error('Continuous scroll feedback failed');
  const tests=await page.evaluate(()=>{
   const g=window.__qa;cancelAnimationFrame(g.frame);g.audio.setMuted(true);g.finishIntro();g.effects=false;
   const assert=(ok,msg)=>{if(!ok)throw Error(msg);},results=[];
   const setup=(mode=0)=>{g.start();g.finishIntro();g.world.blocks.fill(null);for(let x=0;x<70;x++)g.world.set(x,43,3);g.enemies=[];g.barrels=[];g.alarms=[];g.relays=[];g.rescues=[];g.encounters.update=()=>{};g.boss.active=false;g.player.x=150;g.player.y=828;g.invuln=0;g.cam=0;g.camY=440;g.setThinking(mode);g.aimAngle=0;g.aim=0;g.face=1;g.updateAim=()=>{};g.aimPoint=()=>({x:500,y:844});g.barks.clear();return g.marcusKit;};
   const ticks=(k,n)=>{for(let i=0;i<n;i++)k.update(1/120);};
   let k=setup(),e=g.spawnEnemy(260,830,'gunner',-1);e.hp=30;g.enemies=[e];k.fire();ticks(k,60);assert(k.hitCount===1,'one outward hit');k.recall();ticks(k,180);assert(k.returnHits===1,'one return hit');assert(e.hp===22,'exactly one damage application per leg');assert(k.stock===4&&k.catches>0,'catch refunds stock');results.push('outbound + return hits and catch refund');
   k=setup();for(let y=37;y<43;y++)g.world.set(15,y,3);e=g.spawnEnemy(340,830,'gunner',-1);g.enemies=[e];k.fire();ticks(k,360);k.recall();ticks(k,720);assert(e.hp===4,'no through-steel hits');assert(k.bounceCount>0,'bankshot collision');assert(k.stock===4,'blocked disc recovers stock');results.push('steel obstruction, ricochet, stock recovery');
   k=setup();k.fire();ticks(k,13);g.setThinking(1);assert(k.discs.every(d=>d.mode===0),'in-flight mode locked');k.recall();ticks(k,360);assert(k.stock===4,'discs returned after mode change');results.push('disc mode lock and recall after switching');
   k=setup(1);g.aimPoint=()=>({x:330,y:830});for(let y=41;y<43;y++)g.world.set(18,y,2);e=g.spawnEnemy(320,830,'shield',-1);g.enemies=[e];for(let i=0;i<170;i++)k.fireInput(1/120,true);k.fireInput(1/120,false);ticks(k,600);assert(g.world.destroyed>0,'invader bombs destroy cover');assert(e.dead||e.hp<7,'invader bombs damage shield guard');results.push('invader bombing cover and armor');
   k=setup();g.keys.add('KeyD');g.press('KeyQ');g.damage();assert(g.health===3,'dodge absorbs damage during window');const before=g.player.x;for(let i=0;i<30;i++)g.update(1/120);assert(g.player.x>before+70,'dodge moves character');ticks(k,60);g.damage();assert(g.health===2,'damage resumes after dodge');g.press('KeyQ');assert(k.flip===0,'dodge cooldown respected');results.push('dodge window, movement and cooldown');
   k=setup();k.ultimate();assert(k.batch===4.5,'batch activates');k.fire();ticks(k,13);assert(k.discs.length===5&&k.stock===3,'bounded echoes do not cost slots');ticks(k,1440);assert(k.batch===0&&k.stock===4,'batch and discs expire');k.ultimate();assert(k.batch===0,'batch cooldown');results.push('batch echoes and cooldown');
   k=setup();for(let i=0;i<4;i++){k.fire();ticks(k,13);}assert(k.stock===0,'four cartridge limit');const count=k.discs.length;k.fire();ticks(k,1);assert(k.discs.length===count,'cannot overspend stock');g.die();assert(k.discs.length===0&&k.pending===null,'death clears discs');g.respawn();assert(g.marcusKit.stock===4,'respawn restores discs');results.push('stock cap, death and respawn');
   k=setup();g.enemies=[g.spawnEnemy(315,830,'gunner',-1),g.spawnEnemy(400,830,'shield',-1),g.spawnEnemy(460,790,'drone',-1)];k.ultimate();g.pointer.down=true;for(let i=0;i<38;i++)g.update(1/120);g.pointer.down=false;g.cam=0;g.camY=440;g.modeFeedback=0;g.toastTimer=0;document.querySelector('.toast').innerHTML='';g.hud();g.render();return {results,snapshot:k.snapshot()};
  });
  await page.screenshot({path:'output/playwright/marcus-combat-v31.png'});
  if(errors.length)throw Error(errors.join('\n'));return {tests,errors};
 }finally{await page.unroute('**/src/main.ts*');await page.reload();}
}
