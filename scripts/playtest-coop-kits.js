async(page)=>{
 for(const extra of page.context().pages())if(extra!==page)await extra.close();const errors=[],results=[];
 const instrument=async p=>{p.on('pageerror',e=>errors.push(e.message));p.on('console',e=>{if(e.type()==='error')errors.push(e.text());});await p.route('**/src/main.ts*',async route=>{const r=await route.fetch();await route.fulfill({response:r,body:(await r.text())+'\nwindow.__qa=game;'});});};
 await instrument(page);const guest=await page.context().newPage();await instrument(guest);
 const aim=async(x,y)=>{const pos=await guest.evaluate(({x,y})=>{const g=window.__qa,r=g.canvas.getBoundingClientRect();return {x:r.x+(x-g.cam)*r.width/960,y:r.y+(y-g.camY)*r.height/540};},{x,y});await guest.mouse.move(pos.x,pos.y);};
 const click=async(ms=150)=>{await guest.mouse.down();await guest.waitForTimeout(ms);await guest.mouse.up();await guest.waitForTimeout(150);};
 for(const hero of ['tibo','peter','dimillian','pidalf','marcus']){
  await guest.goto('about:blank');await page.goto('http://127.0.0.1:5175/');await page.locator('[data-bro="'+hero+'"]').click();await page.locator('#coop-start').click();await page.waitForFunction(()=>window.__qa.coop.invite);const invite=await page.evaluate(()=>window.__qa.coop.invite);
  await guest.goto(invite);await guest.locator('[data-bro="'+hero+'"]').click();await guest.locator('#coop-start').click();await guest.waitForFunction(()=>window.__qa.coop.running||window.__qa.state==='paused');if(!await guest.evaluate(()=>window.__qa.coop.running))throw Error('Connection failed '+hero+' '+errors.join('\n'));
  await page.evaluate(()=>{const g=window.__qa;g.enemies=[];g.barrels=[];g.alarms=[];g.world.blocks.fill(null);for(let i=0;i<204;i++)g.world.set(i,43,3);for(const a of g.peers){a.invuln=100;a.player.x=a.id==='p0'?90:180;a.player.y=828;}g.encounters.pending=[];g.encounters.supplies=[];});await guest.waitForTimeout(250);await guest.locator('#game').focus();await aim(430,838);
  const modes=hero==='marcus'?4:3;const samples=[];
  for(let mode=0;mode<modes;mode++){
   await guest.keyboard.press('Digit'+(mode+1));await guest.waitForTimeout(180);await click(hero==='dimillian'&&mode===1?1250:hero==='marcus'&&mode===2?850:220);
   samples.push(await page.evaluate(()=>{const a=window.__qa.peers.find(a=>a.id==='p1');return {thinking:a.thinking,shots:a.shotCount,usage:a.usage,form:a.dimillianKit.form,waves:a.pidalfKit.waves.length,marcus:a.marcusKit.snapshot()};}));
  }
  await guest.keyboard.press('Digit1');await guest.keyboard.press('KeyE');await guest.keyboard.down('KeyQ');await guest.waitForTimeout(180);
  const ability=await page.evaluate(()=>{const a=window.__qa.peers.find(a=>a.id==='p1');return {double:!!a.otherTibo.active,pets:a.peterKit.pets.length,shield:!!a.defense.active||!!a.dimillianKit.shield,ward:a.pidalfKit.ward,flip:a.marcusKit.flipCooldown};});await guest.keyboard.up('KeyQ');await guest.keyboard.up('KeyE');await guest.keyboard.press('KeyF');await guest.waitForTimeout(350);
  const final=await page.evaluate(()=>{const g=window.__qa,a=g.peers.find(a=>a.id==='p1');return {snapshot:g.snapshot().coop,reset:a.resetCount,molt:a.peterKit.molt,special:a.dimillianKit.special,batch:a.marcusKit.batch,bullets:g.bullets.filter(b=>b.owner==='p1').length};});
  if(hero==='tibo'&&(!ability.double||!ability.shield||final.reset!==1))throw Error('Tibo guest abilities failed');
  if(hero==='peter'&&(!ability.pets||!ability.shield||final.molt<=0))throw Error('Peter guest abilities failed');
  if(hero==='dimillian'&&samples[2].form!==2)throw Error('Guest forms failed');
  if(hero==='pidalf'&&ability.ward<=0)throw Error('Guest ward failed');
  if(hero==='marcus'&&(!ability.flip||final.batch<=0))throw Error('Marcus guest abilities failed');
  await guest.screenshot({path:'output/playwright/coop-'+hero+'.png'});results.push({hero,samples:samples.map(s=>({thinking:s.thinking,shots:s.shots,usage:s.usage,form:s.form,waves:s.waves})),ability,final});
  await page.evaluate(()=>window.__qa.coop.close());await guest.waitForFunction(()=>!window.__qa.coop.running);if(!await guest.locator('.result-title').count())throw Error('No host departure screen');
 }
 await guest.close();await page.unroute('**/src/main.ts*');await page.reload();if(errors.length)throw Error(errors.join('\n'));return {results,errors};
}
