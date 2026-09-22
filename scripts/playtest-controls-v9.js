async (page)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.reload();await page.locator('#start').click();await page.keyboard.press('Enter');
 const state=()=>page.evaluate(()=>window.tokenbros.snapshot());const check=(v,m)=>{if(!v)throw Error(m);};
 const b=await page.locator('#game').boundingBox();await page.mouse.move(b.x+b.width*.4,b.y+b.height*.7);
 await page.mouse.click(b.x+b.width*.4,b.y+b.height*.7);await page.waitForTimeout(100);let s=await state();check(s.peter.stock===6&&s.peter.pets.length===0&&s.peter.commandPoint,'Click did not command without throwing');
 await page.keyboard.press('KeyE');await page.waitForTimeout(100);s=await state();check(s.peter.stock===5&&s.peter.pets.length===1,'E does not throw exactly one claw');
 const throwCooldown=s.peter.throwCooldown;await page.mouse.click(b.x+b.width*.48,b.y+b.height*.7);await page.waitForTimeout(80);s=await state();check(s.peter.stock===5&&s.peter.throwCooldown<throwCooldown,'Click altered throw reserve/cooldown');
 await page.keyboard.down('KeyE');await page.waitForTimeout(800);await page.keyboard.up('KeyE');s=await state();check(s.peter.pets.length>1&&s.peter.pets.length<=4,'Held E failed or exceeded swarm cap');
 await page.keyboard.press('KeyF');await page.waitForTimeout(60);await page.mouse.click(b.x+b.width*.3,b.y+b.height*.7);await page.waitForTimeout(80);s=await state();check(s.peter.molt>0&&s.peter.stock===6,'Molt click did not punch without throwing');
 await page.waitForTimeout(400);await page.keyboard.press('KeyE');await page.waitForTimeout(60);s=await state();check(s.peter.stock===5,'E cannot throw during Molt');
 await page.keyboard.press('Digit2');await page.waitForTimeout(80);s=await state();check(s.peter.kind==='SKIPPER'&&s.modeBurst>0&&s.modeFeedback>1,'No category-change feedback');await page.screenshot({path:'output/playwright/peter-scroll-v9.png'});
 await page.waitForTimeout(1550);await page.mouse.wheel(0,-12);await page.waitForTimeout(60);s=await state();check(s.thinkingPercent>50&&s.thinkingPercent<55&&s.modeFeedback>1&&s.modeBurst===0,'Continuous scroll feedback or boundary logic wrong');
 await page.keyboard.press('Digit3');await page.waitForTimeout(50);await page.screenshot({path:'output/playwright/peter-crusher-v9.png'});
 await page.keyboard.press('Escape');await page.locator('#switch-bro').click();await page.keyboard.press('Enter');await page.mouse.move(b.x+b.width*.5,b.y+b.height*.6);await page.mouse.click(b.x+b.width*.5,b.y+b.height*.6);await page.waitForTimeout(90);s=await state();check(s.character==='tibo'&&s.usage===992,'Tibo primary regressed');
 await page.keyboard.press('Digit2');await page.waitForTimeout(80);s=await state();check(s.thinking==='MEDIUM'&&s.modeBurst>0,'Tibo category feedback missing');await page.screenshot({path:'output/playwright/tibo-scroll-v9.png'});
 await page.keyboard.press('Digit3');await page.waitForTimeout(50);await page.screenshot({path:'output/playwright/tibo-high-v9.png'});
 await page.waitForTimeout(1600);check((await state()).modeFeedback===0,'Feedback panel did not fade');
 check(errors.length===0,errors.join('\n'));return {controls:'click commands; E taps/holds throw; Molt click punches and E still throws; Tibo still fires',feedback:'continuous wheel, both category transitions, fades after use',errors};
}
