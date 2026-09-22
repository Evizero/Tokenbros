async(page)=>{
 const errors=[],failed=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&r.url().includes('/Tokenbros/'))failed.push({url:r.url(),status:r.status()});});
 await page.setViewportSize({width:1440,height:960});await page.goto('https://evizero.github.io/Tokenbros/');
 await page.waitForSelector('.bro-card');await page.waitForFunction(()=>[...document.querySelectorAll('.bro-art img')].every(i=>i.complete&&i.naturalWidth>0));
 const portraits=await page.locator('.bro-art img').evaluateAll(images=>images.map(i=>({url:i.currentSrc,loaded:i.naturalWidth>0})));
 const heroes=[];
 for(const bro of ['tibo','peter','dimillian','pidalf','marcus']){
  await page.locator(`[data-bro="${bro}"]`).click();await page.locator('#start').click();
  await page.waitForFunction(()=>{const i=document.querySelector('.reveal-portrait');return i?.complete&&i.naturalWidth>0;});await page.locator('.skip-intro').click();
  await page.waitForFunction(()=>!document.querySelector('.hud').hidden);heroes.push(await page.locator('.hud .name').innerText());
  if(bro==='marcus'){await page.keyboard.press('Digit4');await page.waitForFunction(()=>document.querySelector('#thinking-level').textContent==='PAC-MAN');await page.screenshot({path:'output/playwright/pages-game.png'});}
  await page.keyboard.press('Escape');await page.locator('#switch-bro').click();
 }
 if(errors.length||failed.length)throw Error(JSON.stringify({errors,failed}));return {url:page.url(),heroes,portraits,errors,failed};
}
