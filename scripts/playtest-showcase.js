async(page)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/src/main.ts*',async route=>{const r=await route.fetch();await route.fulfill({response:r,body:(await r.text())+'\nwindow.__qa=game;'});});await page.setViewportSize({width:1440,height:900});await page.reload();
 try{
 await page.waitForFunction(()=>window.__qa?.rosterPreview&&[...document.querySelectorAll('.bro-art img')].every(i=>i.complete&&i.naturalWidth>0));
 const assert=(v,m)=>{if(!v)throw Error(m);};assert(await page.locator('.bro-card').count()===6,'Expected six slots');assert(await page.locator('.bro-card:disabled').count()===1,'Expected one unavailable placeholder');
 const demos=[];
 for(const bro of ['tibo','peter','dimillian','pidalf','marcus']){
  await page.locator(`[data-bro="${bro}"]`).click();
  for(let phase=0;phase<(bro==='marcus'?4:3);phase++){
   await page.locator(`[data-clip="${phase}"]`).click();
   const data=await page.evaluate(()=>{const g=window.__qa,p=g.rosterPreview;p.paused=true;p.status();const seen={pets:0,forms:[],reset:false,double:false,fireball:false,swing:false,airborne:false,bombs:false};for(let i=0;i<360;i++){p.step(1/120);const s=p.scene;seen.pets=Math.max(seen.pets,s.peterKit.pets.length);seen.reset||=!!s.resetProp;seen.double||=!!s.otherTibo.active;seen.fireball||=s.bullets.some(b=>b.fireball!==undefined);seen.swing||=!!s.dimillianKit.swing;seen.airborne||=s.player.y<780;seen.bombs||=s.dimillianKit.bombs.length>0;seen.forms=[s.dimillianKit.form];}p.draw();return {bro:p.scene.character,phase:p.phase,kills:p.scene.kills,shots:p.scene.shotCount,damage:p.scene.enemies.reduce((n,e)=>n+e.max-e.hp,0),seen,owner:{state:g.state,kills:g.kills,shots:g.shotCount,elapsed:g.elapsed},muted:p.scene.audio.muted,audioContext:!!p.scene.audio.ctx};});
   assert(data.damage>0,`Demo has no combat outcome ${JSON.stringify(data)}`);assert(data.owner.state==='title'&&data.owner.kills===0&&data.owner.shots===0&&data.owner.elapsed===0,'Preview changed mission');assert(data.muted&&!data.audioContext,'Preview created audio');demos.push(data);
   if(bro==='dimillian'&&phase===1){await page.evaluate(()=>document.getAnimations().forEach(a=>a.finish()));await page.screenshot({path:'output/playwright/roster-showcase-desktop-v26.png'});}
  }
 }
 await page.locator('[data-clip="1"]').click();await page.evaluate(()=>{const p=window.__qa.rosterPreview;for(let i=0;i<125;i++)p.step(1/120);p.draw();});await page.screenshot({path:'output/playwright/roster-showcase-action-v26.png'});
 const pausedTime=await page.locator('.bro-showcase').getAttribute('data-preview-time');await page.waitForTimeout(100);assert(pausedTime===await page.locator('.bro-showcase').getAttribute('data-preview-time'),'Pause not stable');
 await page.locator('#preview-toggle').click();await page.waitForFunction(old=>document.querySelector('.bro-showcase').dataset.previewTime!==old,pausedTime);
 await page.evaluate(()=>{window.__qa.rosterPreview.time=4.19;});await page.waitForFunction(()=>document.querySelector('.bro-showcase').dataset.previewPhase==='2');await page.locator('#preview-toggle').click();
 await page.locator('[data-clip="2"]').click();await page.evaluate(()=>{const p=window.__qa.rosterPreview;for(let i=0;i<140;i++)p.step(1/120);p.draw();});await page.screenshot({path:'output/playwright/roster-showcase-flight-v26.png'});
 const layouts=[];
 for(const size of [{width:1280,height:720},{width:800,height:700},{width:390,height:844}]){await page.setViewportSize(size);await page.evaluate(()=>window.__qa.rosterPreview.draw());const layout=await page.evaluate(()=>{const r=document.querySelector('.roster-screen');return {overflow:r.scrollWidth>r.clientWidth+1,slots:[...document.querySelectorAll('.bro-card')].map(e=>({w:e.clientWidth,h:e.clientHeight})),preview:document.querySelector('#showcase-game').clientHeight,deploy:document.querySelector('#start').getBoundingClientRect().bottom<=r.getBoundingClientRect().bottom+1};});assert(!layout.overflow&&layout.deploy&&layout.preview>=150,'Layout failure '+JSON.stringify({size,layout}));layouts.push({size,layout});await page.screenshot({path:`output/playwright/roster-showcase-${size.width}-v26.png`,fullPage:true});}
 await page.setViewportSize({width:1280,height:720});await page.evaluate(()=>{window.__oldPreview=window.__qa.rosterPreview;});await page.locator('#start').click();assert(await page.evaluate(()=>window.__oldPreview.dead&&window.__qa.rosterPreview===null),'Preview not disposed on deploy');await page.locator('.skip-intro').click();await page.keyboard.press('Escape');await page.locator('#switch-bro').click();assert(await page.evaluate(()=>window.__qa.rosterPreview!==window.__oldPreview&&!window.__qa.rosterPreview.dead),'Cannot reopen showcase');
 await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await page.waitForFunction(()=>window.__qa?.rosterPreview);assert(await page.evaluate(()=>window.__qa.rosterPreview.paused),'Reduced motion should start paused');await page.emulateMedia({reducedMotion:'no-preference'});
 if(errors.length)throw Error(errors.join('\n'));return {demos,layouts,errors};
 }finally{await page.unroute('**/src/main.ts*');await page.reload();}
}
