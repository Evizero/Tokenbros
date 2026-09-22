async (page) => {
  await page.route('**/src/main.ts*',async route=>{const r=await route.fetch();await route.fulfill({response:r,body:(await r.text())+'\nwindow.__resetQA=game;'});});
  await page.reload();await page.keyboard.press('Enter');await page.keyboard.press('Enter');
  const results=[];
  for(const i of [0,1]){
    await page.evaluate(i=>{const g=window.__resetQA,r=g.relays[i];g.enemies=[];g.barrels=[];g.bullets=[];g.player.x=r.x-60;g.player.y=r.y+2;g.player.vx=0;g.player.vy=0;g.cam=g.player.x-320;g.camY=Math.max(0,g.player.y-330);g.charges=1;g.boost=0;g.resetProp=null;g.invuln=100;},i);
    const b=await page.locator('#game').boundingBox();await page.mouse.move(b.x+b.width*.15,b.y+b.height*.5); // Aim away from the uplink; still within its advertised activation zone.
    await page.keyboard.press('KeyF');await page.waitForTimeout(200);const before=await page.evaluate(i=>window.__resetQA.relays[i].done,i);if(before)throw Error('Uplink opened before slam');
    await page.waitForTimeout(600);const after=await page.evaluate(i=>{const g=window.__resetQA;return{done:g.relays[i].done,gate:g.world.at(i===0?1805:3205,705),boost:g.boost};},i);if(!after.done||after.gate!==null||after.boost<=0)throw Error('Slam failed to open gate');results.push({before,after});
  }
  await page.evaluate(()=>{const g=window.__resetQA;g.boost=0;g.resetProp=null;g.charges=1;g.player.x=2900;g.player.y=568;});
  await page.keyboard.press('KeyF');await page.waitForTimeout(100);await page.evaluate(()=>window.__resetQA.die());await page.waitForTimeout(800);const cancelled=await page.evaluate(()=>({prop:window.__resetQA.resetProp,boost:window.__resetQA.boost}));if(cancelled.prop||cancelled.boost>0)throw Error('Death did not cancel pending reset');
  await page.unroute('**/src/main.ts*');await page.reload();return {results,cancelled};
}
