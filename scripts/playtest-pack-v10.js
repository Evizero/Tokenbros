async(page)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/src/main.ts*',async route=>{const r=await route.fetch();await route.fulfill({response:r,body:(await r.text())+'\nwindow.__qa=game;'});});await page.reload();await page.locator('#start').click();await page.keyboard.press('Enter');
 const result=await page.evaluate(()=>{
 const g=window.__qa;cancelAnimationFrame(g.frame);const assert=(v,m)=>{if(!v)throw Error(m);};
 function clean(){g.selectCharacter('peter');g.start();g.finishIntro();g.effects=false;g.pointer.active=false;g.face=1;g.aimAngle=0;g.player.x=100;g.player.y=828;g.enemies=[];g.barrels=[];g.world.blocks.fill(null);for(let x=0;x<204;x++)g.world.set(x,43,3);}
 function tick(seconds){for(let i=0;i<seconds*120;i++){g.time+=1/120;g.peterKit.update(1/120);}}
 clean();for(const type of [0,1,2,0]){g.thinking=type;g.peterKit.throwCooldown=0;g.peterKit.throw();}const ids=g.peterKit.pets.map(p=>p.id);const stock=g.peterKit.stock;g.peterKit.throwCooldown=0;g.peterKit.throw();assert(g.peterKit.stock===stock&&g.peterKit.pets.length===4,'Full pack replaced a pet or spent stock');
 tick(20);assert(JSON.stringify(ids)===JSON.stringify(g.peterKit.pets.map(p=>p.id)),'Pets still expire');assert(g.peterKit.pets.every(p=>Math.abs(p.x-g.player.x)<140),'Idle pets did not gather');
 g.player.x=400;tick(5);assert(g.peterKit.pets.every(p=>Math.abs(p.x-g.player.x)<170),'Pack did not follow moving owner');
 g.player.y=250;tick(4);assert(g.peterKit.pets.some(p=>p.state==='return'||Math.abs(p.y-g.player.y)<80),'Pack stuck on lower floor');
 clean();g.peterKit.throw();const pet=g.peterKit.pets[0];const enemy=g.spawnEnemy(130,830,'shield');g.enemies=[enemy];tick(.2);assert(enemy.hp===7,'Deployment still does projectile damage');
 clean();g.thinking=0;g.peterKit.throw();const target=g.spawnEnemy(290,830,'gunner');target.hp=8;g.enemies=[target];g.peterKit.command();assert(g.peterKit.focus===target,'Click failed to mark target');tick(9);assert(target.dead,'Companion did not finish commanded target');tick(4);assert(g.peterKit.focus===null&&Math.abs(g.peterKit.pets[0].x-g.player.x)<140,'Pet did not regroup after kill');
 clean();g.thinking=2;g.peterKit.throw();const shield=g.spawnEnemy(275,830,'shield');g.enemies=[shield];g.peterKit.command();tick(6);assert(shield.shield===0&&shield.hp<7,'Crusher failed close combat');
 const hurt=g.peterKit.pets[0];for(let i=0;i<9;i++){hurt.hurt=0;g.peterKit.absorb(hurt.x+4,hurt.y+4);}tick(.1);assert(g.peterKit.pets.length===0,'Companions cannot die');
 clean();g.peterKit.throw();g.shoot();assert(g.peterKit.pets.length===1&&g.peterKit.commandPoint,'Click spawned instead of commanded');
 clean();g.thinking=2;for(let row=40;row<43;row++)g.world.set(10,row,2);g.peterKit.throw();g.peterKit.command();tick(8);assert(g.world.destroyed>0,'Crusher hopped over cover instead of breaking it');
 clean();g.player.x=3450;g.thinking=1;g.boss.active=true;g.boss.phase=2;g.peterKit.throw();g.peterKit.command();tick(8);assert(g.boss.hp<100,'Pack cannot hurt marked boss');
 return {persistence:'same four identities after 20s; full pack preserved',behavior:'follow, vertical catch-up, marked kill and regroup',damage:'deployment harmless, companion attacks and armor breaking',mortality:'finite health and death',controls:'E deploys; click commands'};
 });
 for(const character of ['peter','tibo'])for(const tier of [0,1,2]){
  await page.evaluate(({character,tier})=>{const g=window.__qa;g.selectCharacter(character);g.start();g.finishIntro();g.effects=false;g.invuln=0;g.player.x=440;g.player.y=708;g.cam=160;g.camY=340;g.pointer.active=false;g.face=1;g.aimAngle=0;g.aim=0;g.thinking=tier;g.modeFeedback=0;document.querySelector('.toast').innerHTML='';g.hud();g.render();},{character,tier});
  await page.screenshot({path:`output/playwright/${character}-weapon-${tier}-v10.png`});
 }
 await page.evaluate(()=>{const g=window.__qa;g.selectCharacter('peter');g.start();g.finishIntro();g.effects=false;g.invuln=0;g.enemies=[];g.player.x=310;g.player.y=828;g.cam=0;g.camY=440;for(const type of [0,1,2]){g.thinking=type;g.peterKit.throwCooldown=0;g.peterKit.throw();}for(let i=0;i<700;i++){g.time+=1/120;g.peterKit.update(1/120);}document.querySelector('.toast').innerHTML='';g.hud();g.render();});await page.screenshot({path:'output/playwright/persistent-pack-v10.png'});
 if(errors.length)throw Error(errors.join('\n'));await page.unroute('**/src/main.ts*');await page.reload();return {result,errors};
}
