async (page) => {
  // Test-only instrumentation: no test controls are included in the shipped game.
  await page.route('**/src/main.ts*',async route=>{const r=await route.fetch();await route.fulfill({response:r,body:(await r.text())+'\nwindow.__combatQA=game;'});});
  await page.reload();await page.keyboard.press('Enter');await page.keyboard.press('Enter');
  const setup=async(type)=>page.evaluate(type=>{
    const g=window.__combatQA;g.state='playing';g.keys.clear();g.pointer.down=false;g.pendingShot=0;g.enemies=g.enemies.filter(e=>e.type===type).slice(0,1);const e=g.enemies[0];
    Object.assign(e,{x:310,y:830,home:310,homeY:650,hp:20,max:20,dead:false,face:-1,turn:10,cool:100,wind:0,stun:0,shield:6,shieldDown:0,voiceCool:0,hacked:0,alert:false,barkTime:0});
    Object.assign(g.player,{x:200,y:828,vx:0,vy:0});g.cam=0;g.camY=460;g.health=3;g.invuln=100;g.boost=0;g.resetProp=null;g.usage=100;g.fireTimer=0;g.lastCooldown=.095;g.bullets=[];g.barrels=[];g.voiceCooldown=0;g.hotfixCooldown=0;
    return e.type;
  },type);
  const aim=async()=>{const s=await page.evaluate(()=>{const g=window.__combatQA,e=g.enemies[0],b=g.canvas.getBoundingClientRect();return{x:b.left+(e.x+10-g.cam)*b.width/960,y:b.top+(e.y+15-g.camY)*b.height/540};});await page.mouse.move(s.x,s.y);};
  const enemy=()=>page.evaluate(()=>{const g=window.__combatQA,e=g.enemies[0];return {hp:e.hp,shield:e.shield,shieldDown:e.shieldDown,stun:e.stun,dead:e.dead,bark:g.lastBark,angle:g.aimAngle};});
  await setup('shield');await page.keyboard.press('Digit1');await aim();
  // The aim helper sets the cursor directly over the fixture, so use down/up for each tap.
  await aim();await page.mouse.down();await page.mouse.up();await page.waitForTimeout(230);const weak=await enemy();if(weak.hp!==20||weak.shield!==6)throw Error('Weak shot damaged shield');
  await page.keyboard.press('Digit2');await aim();await page.mouse.down();await page.mouse.up();await page.waitForTimeout(380);const pulse=await enemy();if(pulse.shield!==3)throw Error('Medium did not damage shield');
  await aim();await page.mouse.down();await page.mouse.up();await page.waitForTimeout(400);const broken=await enemy();if(broken.shield!==0)throw Error('Second pulse did not break shield');
  await setup('shield');await page.keyboard.press('Digit3');await aim();await page.mouse.down();await page.mouse.up();await page.waitForTimeout(230);const rail=await enemy();if(rail.hp!==12||rail.shield!==6)throw Error('High failed to penetrate intact shield');
  await setup('shield');await aim();await page.keyboard.press('KeyE');await page.waitForTimeout(80);const patch=await enemy();if(!(patch.shieldDown>2&&patch.stun>.8))throw Error('Hotfix failed to disable shield');
  await page.keyboard.press('Digit1');await aim();await page.mouse.down();await page.mouse.up();await page.waitForTimeout(200);if((await enemy()).hp!==19)throw Error('Low shot did not pass hotfixed shield');
  // New fixture after reloading restores the drone roster.
  await page.reload();await page.keyboard.press('Enter');await page.keyboard.press('Enter');await setup('drone');
  await page.evaluate(()=>{const e=window.__combatQA.enemies[0];e.x=260;e.y=650;e.home=260;e.hp=4;e.wind=100;});
  await page.keyboard.press('Digit3');await aim();await page.mouse.down();await page.mouse.up();await page.waitForTimeout(350);const drone=await enemy();if(!drone.dead||Math.abs(drone.angle)<.5)throw Error('Upward mouse shot failed against drone');
  await page.reload();await page.keyboard.press('Enter');await page.keyboard.press('Enter');await setup('shield');
  await page.evaluate(()=>{const g=window.__combatQA;g.health=1;g.invuln=0;g.damage();});await page.waitForTimeout(50);const laugh=await enemy();if(laugh.bark!=='laugh')throw Error('No defeat reaction');
  await page.screenshot({path:'output/playwright/enemy-reaction-v3.png'});await page.keyboard.press('Escape');
  await page.unroute('**/src/main.ts*');return {weak,pulse,broken,rail,patch,drone,laugh};
}
