async (page) => {
  await page.setViewportSize({width:1440,height:1000});await page.reload();await page.keyboard.press('Enter');await page.keyboard.press('Enter');
  const snap=()=>page.evaluate(()=>window.tokenbros.snapshot());const box=await page.locator('#game').boundingBox();
  await page.mouse.move(box.x+box.width*.8,box.y+box.height*.45);
  await page.mouse.click(box.x+box.width*.8,box.y+box.height*.45);await page.waitForTimeout(40);const tap=await snap();if(tap.shots!==1)throw Error('Quick click did not fire exactly once');
  await page.keyboard.down('KeyD');await page.waitForTimeout(650);await page.keyboard.up('KeyD');await page.waitForTimeout(120);
  const before=await snap();await page.keyboard.down('KeyA');await page.waitForTimeout(350);await page.keyboard.up('KeyA');const back=await snap();if(!(back.player.x<before.player.x&&back.face===1))throw Error('Backwards movement changed aim');
  await page.mouse.wheel(0,-120);await page.waitForTimeout(80);const low=await snap();if(Math.abs(low.thinkingPercent-20)>.1)throw Error('Scroll was not proportional');
  for(let i=0;i<5;i++){await page.mouse.wheel(0,-12);await page.waitForTimeout(16);}const tail=await snap();if(Math.abs(tail.thinkingPercent-30)>.1)throw Error('Inertia was ignored');
  await page.mouse.wheel(0,-120);await page.waitForTimeout(80);const medium=await snap();if(medium.thinking!=='MEDIUM'||Math.abs(medium.thinkingPercent-50)>.1)throw Error('Continuous scroll did not enter medium');
  await page.keyboard.press('Digit3');
  const n=(await snap()).shots;await page.mouse.down();await page.waitForTimeout(1050);await page.mouse.up();const hold=await snap();if(hold.shots-n!==2)throw Error('High cooldown did not limit held fire');
  await page.keyboard.press('Digit1');const switchMode=await snap();if(switchMode.fireCooldown<.3)throw Error('Switching mode bypassed cooldown');
  await page.keyboard.press('KeyF');await page.waitForTimeout(240);const toss=await snap();if(toss.boost>0||!toss.resetAnimation)throw Error('Reset activated before slap');
  await page.waitForTimeout(240);await page.screenshot({path:'output/playwright/reset-windup-v3.png'});await page.waitForTimeout(300);const slap=await snap();if(!(slap.boost>0&&slap.resetAnimation?.struck))throw Error('Slap did not activate reset');
  await page.keyboard.press('KeyE');const hotfix=await snap();if(hotfix.hotfixCooldown<=0)throw Error('E did not hotfix');
  await page.keyboard.press('Digit3');await page.screenshot({path:'output/playwright/controls-v3.png'});
  await page.mouse.down();await page.keyboard.press('Escape');await page.mouse.up();await page.keyboard.press('Escape');const stopped=await snap();if(stopped.firing)throw Error('Fire stuck after pause');
  await page.keyboard.press('Escape');return {tap:tap.shots,backwards:{before:before.player,after:back.player,face:back.face},medium:medium.thinking,heldShots:hold.shots-n,switchCooldown:switchMode.fireCooldown,reset:{toss:toss.resetAnimation,slap:slap.resetAnimation,boost:slap.boost},hotfix:hotfix.hotfixCooldown,stopped:!stopped.firing};
}
