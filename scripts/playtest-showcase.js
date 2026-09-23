async(page)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/src/main.ts*',async route=>{const r=await route.fetch();await route.fulfill({response:r,body:(await r.text())+'\nwindow.__qa=game;'});});
 await page.setViewportSize({width:1440,height:900});await page.reload();
 await page.waitForFunction(()=>window.__qa?.rosterPreview);
 const assert=(ok,message)=>{if(!ok)throw Error(message);};
 assert(await page.locator('#showcase-payoff, #showcase-action').count()===0,'Reel should have no commentary overlay');
 const demos=[];
 try {
 for(const bro of ['tibo','peter','dimillian','pidalf','marcus']){
  await page.locator(`[data-bro="${bro}"]`).click();
  const count=await page.locator('[data-clip]').count();
  for(let phase=0;phase<count;phase++){
   await page.locator(`[data-clip="${phase}"]`).click();
   const data=await page.evaluate(()=>{const g=window.__qa,p=g.rosterPreview;p.paused=true;p.status();p.reset();if(p.time!==0||p.scene.otherTibo.active)throw Error("Reel skipped its opening");
    const seen={keys:[],reset:false,refilled:false,double:false,leap:false,catch:false,tokens:0,blocks:0,pets:0,molt:false,shield:false,paired:false,sheep:false,meteor:false,special:false,bombs:false,held:false,compacted:false,repel:false,batch:false,flip:false,invader:false,lcd:false,pac:false};
    const keys=new Set();
    for(let i=0;i<1030&&!p.finished;i++){
     p.step(1/120);const s=p.scene;for(const k of s.keys)keys.add(k);if(s.pointer.down)keys.add('MOUSE');
     seen.reset||=!!s.resetProp;seen.refilled||=s.refillFeedback>0;seen.double||=!!s.otherTibo.active;seen.leap||=s.otherTibo.active?.phase==='leap';seen.catch||=s.otherTibo.catchFeedback>0;seen.tokens=Math.max(seen.tokens,s.otherTibo.rewardTotal);seen.blocks=Math.max(seen.blocks,s.defense.blocks);seen.pets=Math.max(seen.pets,s.peterKit.pets.length);seen.molt||=s.peterKit.molt>0;seen.shield||=!!s.dimillianKit.shield||!!s.defense.active;seen.paired||=!!s.dimillianKit.paired;seen.sheep||=s.enemies.some(e=>e.sheep>0);seen.meteor||=!!s.dimillianKit.meteor;seen.special||=s.dimillianKit.special>0;seen.bombs||=s.dimillianKit.bombs.length>0;seen.held||=s.pidalfKit.held.length>0;seen.compacted||=s.pidalfKit.props.length>0;seen.repel||=s.pidalfKit.ward>0;seen.batch||=s.marcusKit.batch>0;seen.flip||=s.marcusKit.flip>0;seen.invader||=!!s.marcusKit.invader.craft;seen.lcd||=!!s.marcusKit.lcd.flight;seen.pac||=!!s.marcusKit.pacman.active;
    }
    seen.keys=[...keys];p.draw();return {bro:safeBro(g),clip:p.clip.id,endedAt:p.time,finished:p.finished,result:p.result,proof:p.proof,mode:p.scene.thinking,kills:p.scene.kills,damage:p.scene.enemies.reduce((n,e)=>n+e.max-e.hp,0),seen,owner:{state:g.state,kills:g.kills,shots:g.shotCount,elapsed:g.elapsed},muted:p.scene.audio.muted,audioContext:!!p.scene.audio.ctx};
    function safeBro(g){return g.character;}
   });
   assert(data.finished,'Reel did not advance');
   assert(data.result,`${bro}/${data.clip} did not deliver its tactical payoff`);
   const expected={boots:['keys'],levitate:['keys'],grapple:['keys'],reset:['reset','refilled'],double:['double','leap','catch','tokens'],absorb:['blocks'],pincher:['pets'],skipper:['pets'],crusher:['pets'],prism:['shield','blocks'],molt:['molt'],duelist:['special'],remote:['shield','paired'],mage:['meteor'],sheep:['sheep','shield'],pilot:['bombs','shield'],rocket:['special'],force:['held','compacted'],compact:['compacted'],repel:['repel'],lcd:['lcd'],invader:['invader'],pacman:['pac'],batch:['batch','flip']};
   for(const event of expected[data.clip]||[])assert(data.seen[event],`${bro}/${data.clip} did not demonstrate ${event}`);
   if(['prism','molt'].includes(data.clip))assert(data.seen.pets===0&&!data.seen.keys.includes('KeyE'),'Special preview threw a pet');
   assert(data.owner.state==='title'&&data.owner.kills===0&&data.owner.shots===0&&data.owner.elapsed===0,'Reel changed the real mission');
   assert(data.muted&&!data.audioContext,'Reel created audio');
   demos.push(data);
  }
 }
 await page.locator('[data-bro="tibo"]').click();await page.locator('[data-clip="2"]').click();
 await page.evaluate(()=>{const p=window.__qa.rosterPreview;p.reset();for(let i=0;i<55;i++)p.step(1/120);p.draw();});
 await page.screenshot({path:'output/playwright/showcase-double-inputs.png'});
 const layouts=[];
 for(const size of [{width:1440,height:900},{width:1280,height:720},{width:900,height:650},{width:390,height:844}]){
  await page.setViewportSize(size);await page.locator('[data-bro="dimillian"]').click();await page.locator('[data-clip="1"]').click();
  const result=await page.evaluate(()=>{const p=window.__qa.rosterPreview;p.paused=true;p.reset();for(let i=0;i<420;i++)p.step(1/120);p.draw();const r=document.querySelector('.roster-screen'),canvas=document.querySelector('#showcase-game'),inputs=document.querySelector('.showcase-inputs');return {overflow:r.scrollWidth>r.clientWidth+1,clipsClipped:[...document.querySelectorAll('[data-clip]')].some(b=>b.scrollWidth>b.clientWidth+1),preview:canvas.clientHeight,inputs:inputs.clientHeight,keys:[...document.querySelectorAll('[data-demo-key][data-held=true]')].map(e=>e.dataset.demoKey)};});
  assert(!result.overflow&&!result.clipsClipped&&result.preview>=150,'Clipped roster '+JSON.stringify({size,result}));
  assert(!result.keys.includes('Q')&&result.keys.includes('MOUSE'),'Toggle bunker should show firing without a held Q');layouts.push({size,result});
  await page.screenshot({path:`output/playwright/reel-layout-${size.width}.png`,fullPage:true});
 }
 await page.setViewportSize({width:1280,height:720});
 const pausedTime=await page.locator('.bro-showcase').getAttribute('data-preview-time');await page.waitForTimeout(150);assert(pausedTime===await page.locator('.bro-showcase').getAttribute('data-preview-time'),'Pause changed reel');
 await page.locator('#preview-toggle').click();await page.waitForFunction(old=>document.querySelector('.bro-showcase').dataset.previewTime!==old,pausedTime);
 await page.evaluate(()=>{window.__qa.rosterPreview.time=window.__qa.rosterPreview.duration-.02;});await page.waitForFunction(()=>document.querySelector('.bro-showcase').dataset.previewPhase==='2');
 await page.evaluate(()=>{window.__oldPreview=window.__qa.rosterPreview;});await page.locator('#start').click();assert(await page.evaluate(()=>window.__oldPreview.dead&&!window.__qa.rosterPreview),'Reel survived deployment');
 await page.locator('.skip-intro').click();await page.keyboard.press('Escape');await page.locator('#switch-bro').click();assert(await page.evaluate(()=>window.__qa.rosterPreview!==window.__oldPreview&&!window.__qa.rosterPreview.dead),'Reel did not reopen');
 await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await page.waitForFunction(()=>window.__qa?.rosterPreview);assert(await page.evaluate(()=>window.__qa.rosterPreview.paused&&window.__qa.rosterPreview.time===0),'Reduced motion must pause at the start');
 assert(!errors.length,errors.join('\n'));return {demos:demos.map(d=>({bro:d.bro,clip:d.clip,endedAt:d.endedAt,keys:d.seen.keys})),layouts,errors};
 }finally{await page.emulateMedia({reducedMotion:'no-preference'});await page.unroute('**/src/main.ts*');await page.reload();}
}
