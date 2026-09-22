async(page)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:1280,height:800});await page.reload();
 const assert=(v,m)=>{if(!v)throw Error(m);};
 await page.waitForFunction(()=>[...document.querySelectorAll('.bro-art img')].length===4&&[...document.querySelectorAll('.bro-art img')].every(i=>i.complete&&i.naturalWidth>0));
 await page.evaluate(()=>document.getAnimations().forEach(a=>a.finish()));
 await page.screenshot({path:'output/playwright/roster-desktop-v25.png'});
 for(const bro of ['tibo','peter','dimillian','pidalf']){
  await page.locator(`[data-bro="${bro}"]`).click();assert((await page.locator('#start').innerText()).includes(bro.toUpperCase()),'Deploy label stale');
  assert(await page.locator('[data-bro][aria-pressed="true"]').count()===1,'Selection not exclusive');
  assert(await page.evaluate(()=>window.tokenbros.snapshot().state)==='title','Selecting a card deployed early');
  await page.locator('#start').click();await page.waitForSelector('.skip-intro');
  assert(await page.evaluate(()=>window.tokenbros.snapshot().character)===bro,'Wrong bro deployed');
  assert(!await page.locator('.stage').evaluate(e=>e.classList.contains('roster-open')),'Roster layout persists during play');
  await page.locator('.skip-intro').click();await page.keyboard.press('Escape');await page.locator('#switch-bro').click();
  assert(await page.locator(`[data-bro="${bro}"]`).getAttribute('aria-pressed')==='true','Returning loses selection');
  assert(await page.evaluate(()=>window.tokenbros.snapshot().state)==='title','Switch bro does not open roster');
 }
 await page.locator('[data-bro="pidalf"]').focus();await page.keyboard.press('ArrowRight');assert(await page.locator('[data-bro="tibo"]').getAttribute('aria-pressed')==='true','Keyboard wrapping failed');
 await page.keyboard.press('Space');assert(await page.evaluate(()=>window.tokenbros.snapshot().state)==='title','Space on card starts gameplay');
 await page.keyboard.press('End');assert(await page.locator('[data-bro="pidalf"]').getAttribute('aria-pressed')==='true','End selection failed');
 await page.locator('#start').focus();await page.keyboard.press('Enter');await page.waitForSelector('.skip-intro');await page.locator('.skip-intro').click();await page.keyboard.press('Escape');await page.locator('#switch-bro').click();
 const layouts=[];
 for(const size of [{width:800,height:700},{width:390,height:844},{width:1280,height:600}]){
  await page.setViewportSize(size);await page.evaluate(()=>document.getAnimations().forEach(a=>a.finish()));
  const data=await page.evaluate(()=>{const o=document.querySelector('.roster-screen'),r=o.getBoundingClientRect(),start=document.querySelector('#start').getBoundingClientRect();return {overflow:o.scrollWidth>o.clientWidth+1,clippedCards:[...document.querySelectorAll('.bro-card')].some(e=>{const b=e.getBoundingClientRect();return b.left<r.left||b.right>r.right+1}),startVisible:start.bottom<=r.bottom+1,images:[...document.querySelectorAll('.bro-art img')].every(i=>i.naturalWidth>0)};});
  assert(!data.overflow&&!data.clippedCards&&data.startVisible&&data.images,`Layout failure ${JSON.stringify({size,data})}`);layouts.push({size,...data});
  await page.screenshot({path:`output/playwright/roster-${size.width}-v25.png`});
 }
 await page.setViewportSize({width:1280,height:720});assert(errors.length===0,errors.join('\n'));return {choices:4,deploy:'all four portraits select + deploy + return through pause',keyboard:'arrows wrap, Space selects, End selects, Enter deploys',layouts,errors};
}
