async(page)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/src/main.ts*',async route=>{const r=await route.fetch();await route.fulfill({response:r,body:(await r.text())+'\nwindow.__qa=game;'});});await page.reload();
 const result=await page.evaluate(()=>{
 const g=window.__qa;cancelAnimationFrame(g.frame);const assert=(v,m)=>{if(!v)throw Error(m);};
 function clean(){g.selectCharacter('tibo');g.start();g.finishIntro();g.effects=false;g.invuln=0;g.pointer.active=false;g.face=1;g.aimAngle=0;g.player.x=250;g.player.y=828;g.enemies=[];g.barrels=[];g.rescues=[];g.alarms=[];g.relays=[];g.boss.active=false;}
 function tick(t){for(let i=0;i<Math.ceil(t*120);i++)g.update(1/120);}
 clean();g.press('KeyJ');tick(1);g.release('KeyJ');assert(g.burstShots>=10&&g.burstSpend===g.burstShots*8&&g.burstSpend===1000-g.usage,'Held rapid fire did not accumulate exact paid costs');const rapid=g.burstSpend;tick(.8);assert(g.burstLife===0,'Pause did not expire burst');g.shoot();assert(g.burstSpend===8&&g.burstShots===1,'First shot after pause did not start fresh');
 clean();g.thinking=2;g.press('KeyJ');tick(2.65);g.release('KeyJ');assert(g.burstShots>=3&&g.burstSpend===g.shotCount*72,'High-thinking cooldown incorrectly resets streak');const high=g.burstSpend;tick(1.2);g.shoot();assert(g.burstSpend===72&&g.burstShots===1,'High mode pause did not start fresh');
 clean();g.shoot();g.thinking=2;g.shoot();assert(g.burstSpend===80&&g.lastSpend===72&&g.burstShots===2,'Mixed modes do not add actual costs');g.usage=0;g.shoot();assert(g.burstSpend===80&&g.burstLife===0,'Dry fire incorrectly counted as token spend');g.performReset(700,200);assert(g.burstSpend===0&&g.burstShots===0,'Reset did not clear burst');g.shoot();g.respawn();assert(g.burstSpend===0&&g.burstLife===0,'Respawn retained stale burst');
 clean();g.press('KeyJ');tick(1.25);g.release('KeyJ');g.cam=0;g.camY=440;document.querySelector('.toast').innerHTML='';g.hud();g.render();
 return {rapid,high,checks:'held fire accumulates exact spend; slow shots chain; pauses restart; mixed costs sum; dry fire never counts; reset/respawn clear'};
 });await page.screenshot({path:'output/playwright/tibo-token-streak-v15.png'});if(errors.length)throw Error(errors.join('\n'));await page.unroute('**/src/main.ts*');await page.reload();return {result,errors};
}
