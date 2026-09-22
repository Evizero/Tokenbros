async (page)=>{
 for(const extra of page.context().pages())if(extra!==page)await extra.close();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/src/main.ts*',async route=>{const r=await route.fetch();await route.fulfill({response:r,body:(await r.text())+'\nwindow.__qa=game;'});});await page.goto('http://127.0.0.1:5175/');
 await page.locator('[data-bro="tibo"]').click();await page.locator('#coop-start').click();
 await page.waitForFunction(()=>window.__qa.coop.invite,{timeout:30000});const invite=await page.evaluate(()=>window.__qa.coop.invite);
 const guest=await page.context().newPage();guest.on('pageerror',e=>errors.push('guest: '+e.message));guest.on('console',e=>{if(e.type()==='error')errors.push(e.text());});await guest.route('**/src/main.ts*',async route=>{const r=await route.fetch();await route.fulfill({response:r,body:(await r.text())+'\nwindow.__qa=game;'});});await guest.goto(invite);await guest.locator('[data-bro="peter"]').click();await guest.locator('#coop-start').click();
 await guest.waitForFunction(()=>window.__qa.coop.running||window.__qa.state==='paused',{timeout:30000});if(!await guest.evaluate(()=>window.__qa.coop.running))return {failed:await guest.locator('body').innerText(),errors};await page.waitForTimeout(800);
 const initial=await page.evaluate(()=>window.__qa.snapshot().coop),guestInitial=await guest.evaluate(()=>window.__qa.snapshot().coop);
 await guest.locator('#game').click({position:{x:430,y:340}});await guest.keyboard.down('KeyD');await guest.waitForTimeout(600);await guest.keyboard.up('KeyD');await guest.keyboard.press('KeyE');await guest.waitForTimeout(400);
 const moved=await page.evaluate(()=>({coop:window.__qa.snapshot().coop,pets:window.__qa.peers.find(a=>a.id==='p1').peterKit.pets.length}));
 await guest.screenshot({path:'output/playwright/coop-guest.png'});await page.screenshot({path:'output/playwright/coop-host.png'});
 const peerStats=await page.evaluate(async()=>{const stats=await window.__qa.coop.conn.peerConnection.getStats();return [...stats.values()].filter(x=>x.type==='candidate-pair'&&x.state==='succeeded').map(x=>({state:x.state,nominated:x.nominated,currentRoundTripTime:x.currentRoundTripTime}));});
 await guest.close();await page.waitForFunction(()=>!window.__qa.coop.running,{timeout:20000});const disconnected=await page.locator('.result-title').textContent();if(moved.pets<1)throw Error('Guest claw not authoritative');if(moved.coop.players.find(a=>a.id==='p1').x<=guestInitial.players.find(a=>a.id==='p1').x+40)throw Error('Guest did not move');if(errors.length)throw Error(errors.join('\n'));
 await page.unroute('**/src/main.ts*');await page.reload();return {initial,guestInitial,moved,peerStats,disconnected,errors};
}
