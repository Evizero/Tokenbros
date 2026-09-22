async(page)=>{
 await page.route('**/src/main.ts*',async route=>{const r=await route.fetch();await route.fulfill({response:r,body:(await r.text())+'\nwindow.__qa=game;'});});await page.reload();
 try{
 const physics=await page.evaluate(()=>{
 const g=window.__qa;cancelAnimationFrame(g.frame);g.selectCharacter('dimillian');g.start();g.finishIntro();g.effects=false;g.enemies=[];g.barrels=[];g.rescues=[];g.relays=[];g.alarms=[];g.boss.active=false;g.invuln=99;g.player.x=200;g.player.y=828;g.pointer.active=false;g.face=1;g.aimAngle=0;
 const e=g.spawnEnemy(244,830,'shield');e.hp=30;e.cool=99;g.enemies.push(e);g.pointer.down=true;const steps=[];
 for(let i=0;i<130;i++){g.update(1/120);const step=g.dimillianKit.swing?.step;if(step!==undefined&&steps.at(-1)!==step)steps.push(step);}
 g.pointer.down=false;if(!steps.includes(2)||e.hp>19.5||e.x<290||e.y>780)throw Error(`Live combo failed ${JSON.stringify({steps,hp:e.hp,x:e.x,y:e.y})}`);
 return {steps,hp:e.hp,x:Math.round(e.x),y:Math.round(e.y)};
 });
 for(const [form,name] of ['bunker','bubble','deflector'].entries()){
 await page.evaluate(form=>{const g=window.__qa;g.start();g.finishIntro();g.effects=false;g.invuln=0;g.enemies=[];g.barrels=[];g.player.x=215;g.player.y=828;g.cam=0;g.camY=440;g.pointer.active=false;g.face=1;g.setThinking(form);g.dimillianKit.transform=0;g.modeFeedback=0;g.press('KeyQ');document.querySelector('.toast').innerHTML='';g.hud();g.render();},form);
 await page.screenshot({path:`output/playwright/dimillian-${name}-v23.png`});}
 await page.evaluate(()=>{const g=window.__qa;g.release('KeyQ');g.setThinking(1);g.modeFeedback=0;g.dimillianKit.transform=0;g.dimillianKit.charge=1.15;g.dimillianKit.cast();g.updateBullets(.24);const e=g.spawnEnemy(360,830,'shield');g.enemies.push(e);g.aimPoint=()=>({x:370,y:844});g.dimillianKit.secondary();g.hud();g.render();});await page.screenshot({path:'output/playwright/dimillian-fireball-sheep-v23.png'});
 return {physics};
 }finally{await page.unroute('**/src/main.ts*');await page.reload();}
}
