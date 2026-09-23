async(page)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/src/main.ts*',async route=>{const r=await route.fetch();await route.fulfill({response:r,body:(await r.text())+'\nwindow.__qa=game;'});});await page.reload();
 try{
 await page.waitForFunction(()=>document.querySelector('[data-bro=dimillian] img')?.naturalWidth>0);
 await page.screenshot({path:'output/playwright/dimillian-title-v22.png'});
 const options=await page.locator('[data-bro]').count();if(options!==3)throw Error('Need 3 roster choices');
 await page.getByRole('button',{name:'DEPLOY DIMILLIAN'}).click();
 await page.evaluate(()=>cancelAnimationFrame(window.__qa.frame));
 await page.waitForFunction(()=>document.querySelector('.reveal-portrait')?.naturalWidth>0);
 await page.evaluate(()=>document.getAnimations().forEach(a=>a.finish()));await page.screenshot({path:'output/playwright/dimillian-intro-v22.png'});
 await page.keyboard.press('Space');
 await page.evaluate(()=>{const g=window.__qa;g.effects=false;g.enemies=[];g.barrels=[];g.rescues=[];g.relays=[];g.alarms=[];g.boss.active=false;document.querySelector('.toast').innerHTML='';});
 const stage=await page.locator('#game').boundingBox();await page.mouse.move(stage.x+stage.width*.4,stage.y+stage.height*.6);
 await page.keyboard.press('2');await page.mouse.down();await page.evaluate(()=>{const g=window.__qa;for(let i=0;i<36;i++)g.update(1/120);if(g.dimillianKit.charge<.25)throw Error('Real pointer did not charge');});
 await page.mouse.up();await page.evaluate(()=>{const g=window.__qa;g.update(1/120);if(g.shotCount!==1||g.dimillianKit.charge!==0)throw Error('Lightning did not discharge once on release');});
 await page.mouse.wheel(0,-300);await page.waitForFunction(()=>window.tokenbros.snapshot().dimillian.form==='PILOT');
 await page.keyboard.down('Space');await page.keyboard.down('d');await page.evaluate(()=>{const g=window.__qa;for(let i=0;i<42;i++)g.update(1/120);if(g.player.y>=800||g.player.x<120)throw Error('Real movement/thrust failed');});await page.keyboard.up('Space');await page.keyboard.up('d');
 await page.keyboard.down('q');await page.evaluate(()=>{const g=window.__qa;if(!g.dimillianKit.shield)throw Error('Q did not hold');g.update(1/120);});await page.keyboard.up('q');await page.evaluate(()=>{if(window.__qa.dimillianKit.shield)throw Error('Q release did not drop shield');});
 await page.keyboard.press('f');await page.keyboard.press('1');await page.evaluate(()=>{const g=window.__qa;if(g.dimillianKit.form!==2||g.thinking!==2)throw Error('Real preset breaks F lock');});
 await page.keyboard.press('Escape');
 for(const bro of ['tibo','peter','dimillian']){await page.getByRole('button',{name:'SWITCH BRO',exact:true}).click();await page.locator(`[data-bro="${bro}"]`).click();await page.locator('#start').click();await page.evaluate(bro=>{if(window.__qa.character!==bro)throw Error('Roster selection failed');window.__qa.finishIntro();if(bro!=='dimillian')window.__qa.pause();},bro);}

 await page.setViewportSize({width:800,height:700});await page.evaluate(()=>{const g=window.__qa;g.finishIntro();g.hud();g.render();});await page.screenshot({path:'output/playwright/dimillian-mobile-width-v22.png'});
 await page.setViewportSize({width:1280,height:720});if(errors.length)throw Error(errors.join('\n'));return {options,inputs:'mouse charge/release, wheel, presets, WASD/thrust, held Q/release, F form lock, pause roster selection',errors};
 }finally{await page.unroute('**/src/main.ts*');await page.reload();}
}
