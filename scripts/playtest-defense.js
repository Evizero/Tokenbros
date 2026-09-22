async(page)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/src/main.ts*',async route=>{const r=await route.fetch();await route.fulfill({response:r,body:(await r.text())+'\nwindow.__qa=game;'});});await page.reload();await page.locator('#start').click();await page.keyboard.press('Enter');
 const result=await page.evaluate(()=>{
 const g=window.__qa;cancelAnimationFrame(g.frame);const assert=(v,m)=>{if(!v)throw Error(m);};
 function clean(character){g.selectCharacter(character);g.start();g.finishIntro();g.effects=false;g.invuln=0;g.pointer.active=false;g.face=1;g.aimAngle=0;g.player.x=100;g.player.y=828;g.enemies=[];g.barrels=[];g.bullets=[];g.world.blocks.fill(null);for(let x=0;x<204;x++)g.world.set(x,43,3);}
 function bullet(x=230,vx=-400,y=844){const b={x,y,vx,vy:0,life:3,hostile:true,power:1,pierce:0,boost:false,hit:new Set()};g.bullets.push(b);return b;}
 function tick(seconds){for(let i=0;i<seconds*120;i++){g.defense.update(1/120);g.updateBullets(1/120);}}
 clean('peter');g.press('KeyQ');g.release('KeyQ');const deployed={...g.defense.active};assert(deployed.kind==='prism','Q did not deploy prism');
 g.player.x=40;g.peterKit.throw();const pet=g.peterKit.pets[0];pet.x=120;pet.y=839;const hp=pet.hp;
 bullet();tick(.3);assert(pet.hp===hp&&g.health===3,'Barrier failed to protect pet behind fixed position');assert(g.defense.active.x===deployed.x&&g.defense.active.y===deployed.y,'Prism followed Peter');assert(g.defense.active.hits===2,'Hit budget did not decrement');
 bullet();tick(.3);bullet();tick(.3);assert(!g.defense.active&&g.defense.blocks===3,'Prism survived >3 hits');assert(!g.defense.activate(),'Cooldown permits shield spam');
 g.peterKit.pets=[];bullet();tick(.6);assert(g.health===2,'Broken shield still protects player');
 clean('peter');g.defense.activate();g.defense.update(1.81);assert(!g.defense.active&&g.defense.cooldown>4,'Prism did not expire on timer');
 clean('peter');g.defense.activate();bullet(70,400);tick(.12);assert(g.health===2,'Rear attack incorrectly blocked');
 clean('peter');g.defense.activate();const friendly=bullet();friendly.hostile=false;tick(.3);assert(g.defense.active.hits===3,'Friendly fire consumed shield');
 clean('tibo');g.usage=500;const shooter=g.spawnEnemy(220,830,'gunner');g.enemies=[shooter];g.press('KeyQ');assert(g.defense.cooldown===0,'Cooldown began while holding');
 for(let i=0;i<4;i++){bullet(150);tick(.06);}assert(g.usage===596&&g.defense.active.tokens===96&&g.defense.blocks===4,'Held shield did not convert four shots');assert(shooter.hp===4,'Shield still reflects instead of absorbing');assert(!g.defense.activate(),'Activation reset held shield');g.release('KeyQ');assert(!g.defense.active&&Math.abs(g.defense.cooldown-4.4)<.001,'Token-dependent cooldown wrong');assert(!g.defense.activate(),'Cooldown does not gate activation');
 clean('tibo');g.usage=990;g.press('KeyQ');bullet(150);tick(.06);assert(g.usage===1000&&g.defense.active.tokens===10,'Conversion overflowed cap');g.release('KeyQ');assert(g.defense.cooldown===2.25,'Cooldown should count only actual tokens');
 clean('tibo');g.press('KeyQ');bullet(150);tick(.06);g.release('KeyQ');assert(g.usage===1000&&g.defense.cooldown===2,'Full budget paid a conversion penalty');
 clean('tibo');g.usage=0;g.press('KeyQ');const friendlyTibo=bullet(150);friendlyTibo.hostile=false;tick(.06);assert(g.usage===0&&g.defense.blocks===0,'Friendly fire generates tokens');bullet(70,400);tick(.12);assert(g.health===2&&g.usage===0,'Rear shot blocked or converted');
 clean('tibo');g.usage=0;g.press('KeyQ');g.face=-1;g.defense.update(1/120);bullet(60,400);tick(.09);assert(g.usage===24&&g.health===3,'Shield did not follow changed aim');
 clean('tibo');g.press('KeyQ');tick(2.01);assert(!g.defense.active&&g.defense.cooldown>1.9,'Held shield did not expire and start cooldown');tick(2.1);assert(!g.defense.active&&g.defense.cooldown===0,'Held key automatically raised another shield');g.release('KeyQ');
 clean('tibo');g.usage=500;g.press('KeyQ');bullet(150);tick(.06);g.pause();assert(!g.defense.active&&g.defense.cooldown===2.6,'Pause did not end hold safely');g.update(.5);assert(g.defense.cooldown===2.6,'Pause consumed cooldown');g.resume();
 clean('tibo');g.press('KeyQ');g.release('KeyQ');bullet(150);tick(.2);assert(g.health===2,'Released shield keeps blocking');
 clean('peter');g.defense.activate();g.die();assert(!g.defense.active,'Shield survived death');g.respawn();assert(g.defense.cooldown===0,'Defense failed to reset on respawn');
 // Representative local shield remains ahead while owner and pets regroup behind it.
 g.start();g.finishIntro();g.effects=false;g.invuln=0;g.player.x=300;g.player.y=828;g.cam=0;g.camY=440;g.pointer.active=false;g.face=1;g.enemies=[];g.barrels=[];g.peterKit.throw();g.peterKit.pets[0].x=268;g.peterKit.pets[0].y=848;g.defense.activate();g.player.x=240;document.querySelector('.toast').innerHTML='';g.hud();g.render();
 return {prism:'fixed world position protects companion; 3 hits or 1.8s; 6.5s cooldown; rear and friendly shots handled',absorb:'held shots recover tokens, actual gain determines post-release cooldown; cap/rear/friendly/aim/timeout/pause checked',lifecycle:'clears on death and respawn'};
 });
 await page.screenshot({path:'output/playwright/peter-prism-v11.png'});
 await page.evaluate(()=>{const g=window.__qa;g.selectCharacter('tibo');g.start();g.finishIntro();g.invuln=0;g.effects=false;g.player.x=280;g.player.y=828;g.pointer.active=false;g.face=1;g.usage=600;g.press('KeyQ');g.bullets.push({x:330,y:844,vx:-400,vy:0,life:1,hostile:true,power:1,pierce:0,boost:false,hit:new Set()});g.defense.update(.02);g.updateBullets(.04);document.querySelector('.toast').innerHTML='';g.hud();g.render();});await page.screenshot({path:'output/playwright/tibo-absorb-v20.png'});
 await page.setViewportSize({width:800,height:640});const hud=await page.locator('.resources').boundingBox();const q=await page.locator('#defense-ready').boundingBox();if(q.x+q.width>hud.x+hud.width)throw Error('Q status overflows compact HUD');await page.setViewportSize({width:1280,height:720});
 if(errors.length)throw Error(errors.join('\n'));await page.unroute('**/src/main.ts*');await page.reload();return {result,errors};
}
