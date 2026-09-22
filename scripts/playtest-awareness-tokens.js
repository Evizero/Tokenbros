async (page) => {
  await page.route('**/src/main.ts*',async route=>{const r=await route.fetch();await route.fulfill({response:r,body:(await r.text())+'\nwindow.__awarenessQA=game;'});});
  await page.reload();await page.locator('[data-bro=tibo]').click();await page.keyboard.press('Enter');await page.keyboard.press('Enter');
  const state=()=>page.evaluate(()=>window.tokenbros.snapshot());
  const setup=async()=>page.evaluate(()=>{
    const g=window.__awarenessQA;g.enemies=g.enemies.filter(e=>e.type==='gunner').slice(0,1);const e=g.enemies[0];
    Object.assign(e,{x:330,y:830,home:330,face:1,look:0,patrol:1,patrolWait:100,cool:100,wind:0,stun:0,dead:false,hacked:0});
    e.awareness={state:'patrol',suspicion:0,targetX:340,targetY:845,memory:0,search:0,seenAgo:99};
    Object.assign(g.player,{x:210,y:828,vx:0,vy:0});g.cam=0;g.camY=460;g.barrels=[];g.bullets=[];g.invuln=100;g.keys.clear();g.pointer.down=false;g.pendingShot=0;g.footstep=0;
  });
  await setup();await page.waitForTimeout(400);const behind=await state();if(behind.enemyStates[0].awareness.state!=='patrol')throw Error('Guard saw through its back');
  await page.keyboard.down('ShiftLeft');await page.keyboard.down('KeyD');await page.waitForTimeout(650);await page.keyboard.up('KeyD');await page.keyboard.up('ShiftLeft');await page.waitForTimeout(70);const sneak=await state();if(sneak.enemyStates[0].awareness.state!=='patrol')throw Error('Quiet approach alerted guard');
  await page.keyboard.down('KeyD');await page.waitForTimeout(110);await page.keyboard.up('KeyD');const heard=await state();if(heard.enemyStates[0].awareness.state==='patrol')throw Error('Close running was inaudible');
  await setup();await page.evaluate(()=>{const g=window.__awarenessQA,e=g.enemies[0];e.look=Math.PI;e.face=-1;e.patrol=-1;});
  await page.waitForTimeout(120);const glimpse=await state();if(glimpse.enemyStates[0].awareness.state==='combat')throw Error('No spotting grace');
  await page.waitForTimeout(350);const spotted=await state();if(spotted.enemyStates[0].awareness.state!=='combat')throw Error('Visible player not detected');
  await page.evaluate(()=>{const g=window.__awarenessQA;for(let y=36;y<=43;y++)g.world.set(13,y,3);g.player.x=180;});
  await page.waitForTimeout(180);const hidden=await state();if(hidden.enemyStates[0].awareness.state==='combat'||hidden.enemyStates[0].awareness.targetX===190)throw Error('Guard tracked through cover');
  await setup();await page.evaluate(()=>window.__awarenessQA.explode(620,830,80));await page.waitForTimeout(80);const blast=await state();if(blast.enemyStates[0].awareness.targetX!==620||blast.enemyStates[0].awareness.state==='combat')throw Error('Explosion did not create location investigation');
  await page.screenshot({path:'output/playwright/awareness-v6.png'});
  await page.evaluate(()=>{const g=window.__awarenessQA;g.enemies=[];g.bullets=[];g.boost=0;g.usage=1000;g.tokenTrail=1000;g.fireTimer=0;});
  const b=await page.locator('#game').boundingBox();await page.mouse.move(b.x+b.width*.75,b.y+b.height*.35);await page.keyboard.press('Digit1');await page.mouse.down();await page.mouse.up();await page.waitForTimeout(80);const low=await state();if(low.usage!==992)throw Error('Low shot cost wrong');
  await page.waitForTimeout(1400);if((await state()).usage!==992)throw Error('Tokens regenerated automatically');
  await page.keyboard.press('Digit3');await page.mouse.down();await page.mouse.up();await page.waitForTimeout(100);const high=await state();if(high.usage!==920)throw Error('High shot cost wrong');await page.screenshot({path:'output/playwright/tokens-v6.png'});
  await page.evaluate(()=>{const g=window.__awarenessQA;g.usage=0;g.fireTimer=0;});const count=(await state()).shots;await page.mouse.down();await page.waitForTimeout(400);await page.mouse.up();if((await state()).shots!==count)throw Error('Empty gun still fired');
  await page.keyboard.press('KeyF');await page.waitForTimeout(250);if((await state()).usage!==0)throw Error('Tokens returned before slam');await page.waitForTimeout(1000);const reset=await state();if(reset.usage!==1000)throw Error('Slam failed to refill tokens');
  await page.evaluate(()=>{const g=window.__awarenessQA;g.charges=0;g.resetRecovery=12;g.boost=0;g.usage=0;});
  await page.waitForTimeout(12200);const recovery=await state();if(recovery.charges!==1||recovery.usage!==0)throw Error('Reset recovery refilled tokens or failed to bank a charge');
  await page.unroute('**/src/main.ts*');await page.reload();return {behind:behind.enemyStates[0].awareness,sneak:sneak.enemyStates[0].awareness,heard:heard.enemyStates[0].awareness,glimpse:glimpse.enemyStates[0].awareness,spotted:spotted.enemyStates[0].awareness,hidden:hidden.enemyStates[0].awareness,blast:blast.enemyStates[0].awareness,tokens:{low:low.usage,high:high.usage,reset:reset.usage,recoveredCharges:recovery.charges}};
}
