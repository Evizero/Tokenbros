async(page)=>{
 for(const extra of page.context().pages())if(extra!==page)await extra.close();
 const base='https://evizero.github.io/Tokenbros/',errors=[];
 const watch=p=>p.on('pageerror',e=>errors.push(e.message));watch(page);
 await page.setViewportSize({width:1280,height:720});await page.goto(base);
 await page.locator('[data-bro="tibo"]').click();await page.locator('#coop-start').click();
 await page.waitForFunction(()=>window.tokenbros.snapshot().coop.invite);
 const invite=await page.evaluate(()=>window.tokenbros.snapshot().coop.invite);
 await page.locator('#open-options').click();await page.locator('#effects').click();await page.locator('#fullscreen').click();await page.waitForFunction(()=>document.fullscreenElement);await page.locator('#fullscreen').click();await page.waitForFunction(()=>!document.fullscreenElement);await page.keyboard.press('Escape');
 const guest=await page.context().newPage();watch(guest);await guest.setViewportSize({width:1280,height:720});await guest.goto(invite);
 await guest.locator('[data-bro="peter"]').click();await guest.locator('#coop-start').click();
 await guest.waitForFunction(()=>window.tokenbros.snapshot().coop.running,{timeout:30000});
 await page.waitForFunction(()=>window.tokenbros.snapshot().coop.running);
 await guest.locator('#game').focus();const before=await guest.evaluate(()=>window.tokenbros.snapshot().player.x);
 await guest.keyboard.down('KeyD');await guest.waitForTimeout(600);await guest.keyboard.up('KeyD');await guest.keyboard.press('KeyE');await guest.waitForTimeout(500);
 const hostState=await page.evaluate(()=>window.tokenbros.snapshot()),guestState=await guest.evaluate(()=>window.tokenbros.snapshot());
 if(guestState.player.x<=before+20)throw Error('Guest movement failed');
 if(!guestState.peter.pets.length)throw Error('Guest pet deployment failed');
 if(hostState.coop.players.length!==2||guestState.coop.players.length!==2)throw Error('Player count');
 if(hostState.character!=='tibo'||guestState.character!=='peter')throw Error('Independent character/HUD');
 await guest.screenshot({path:'output/playwright/pages-coop-guest.png',animations:'disabled'});
 await page.screenshot({path:'output/playwright/pages-coop-host.png',animations:'disabled'});
 await guest.keyboard.press('Escape');await guest.locator('#open-options').click();await guest.keyboard.press('Escape');await guest.locator('#leave-coop').click();
 await page.waitForFunction(()=>!window.tokenbros.snapshot().coop.running);
 const departure=await page.locator('.result-stats').innerText();await guest.close();
 if(errors.length)throw Error(errors.join('\n'));
 return {url:base,host:hostState.coop,guest:guestState.coop,before,after:guestState.player.x,pets:guestState.peter.pets.length,departure,errors};
}
