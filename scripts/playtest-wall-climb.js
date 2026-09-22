async(page)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/src/main.ts*',async route=>{const r=await route.fetch();await route.fulfill({response:r,body:(await r.text())+'\nwindow.__qa=game;'});});await page.reload();
 const result=await page.evaluate(()=>{
 const g=window.__qa;cancelAnimationFrame(g.frame);const assert=(v,m)=>{if(!v)throw Error(m);};
 function clean(character='tibo',side=1){g.selectCharacter(character);g.start();g.finishIntro();g.effects=false;g.invuln=99;g.pointer.active=false;g.enemies=[];g.barrels=[];g.rescues=[];g.relays=[];g.alarms=[];g.bullets=[];g.world.blocks.fill(null);for(let y=8;y<46;y++)g.world.set(15,y,3);for(let x=0;x<204;x++)g.world.set(x,46,3);Object.assign(g.player,{x:side===1?280:320,y:730,vx:0,vy:200,grounded:false});g.aimAngle=0;g.face=side;g.cam=0;g.camY=440;}
 function tick(t){let furthest=0;for(let i=0;i<Math.ceil(t*120);i++){g.update(1/120);furthest=Math.max(furthest,Math.abs(g.player.x-(g.lastWall===1?280:320)));}return furthest;}
 const climbs=[];
 for(const character of ['tibo','peter'])for(const side of [1,-1]){
  clean(character,side);const toward=side===1?'KeyD':'KeyA';g.press(toward);tick(.15);assert(g.wallGrip===side&&g.player.vy<=55,'No wall hold/controlled slide');const y=g.player.y;let maxGap=0;
  for(let i=0;i<3;i++){g.press('Space');maxGap=Math.max(maxGap,tick(.10));g.release('Space');maxGap=Math.max(maxGap,tick(.15));assert(g.wallGrip===side,'Failed to regain same wall');}
  assert(g.player.y<y-60&&maxGap<12,'Same-wall jumps push too far away or gain too little height');climbs.push({character,side,gain:Math.round(y-g.player.y),maxGap:Math.round(maxGap*10)/10});
  g.release(toward);tick(.4);assert(g.wallGrip===0&&g.player.vy>55,'Releasing wall failed to restore falling');
 }
 clean();g.press('KeyD');tick(.1);g.release('KeyD');g.press('KeyA');g.press('Space');tick(.12);assert(g.player.x<270,'Intentional jump away from wall lost lateral movement');g.release('Space');
 clean();g.press('KeyD');tick(.05);for(let y=8;y<46;y++)g.world.blocks[y*204+15]=null;tick(.04);g.press('Space');tick(1/120);assert(g.player.vy<-450,'Short wall grace failed');g.release('Space');tick(.15);g.press('Space');tick(1/120);assert(g.player.vy>-200,'Stale wall permits an air jump');
 clean();g.press('KeyD');tick(.1);g.respawn();assert(g.wallGrip===0&&g.wallGrace===0&&g.wallLock===0,'Respawn retained wall state');
 // Original tower wall, with mouse aim away from it: free hand still grips the wall.
 g.selectCharacter('tibo');g.start();g.finishIntro();g.effects=false;g.invuln=0;g.enemies=[];g.barrels=[];Object.assign(g.player,{x:1780,y:520,vx:0,vy:70,grounded:false});g.press('KeyD');tick(.15);g.face=-1;g.aim=0;g.cam=1470;g.camY=250;document.querySelector('.toast').innerHTML='';g.hud();g.render();
 return {climbs,checks:'both characters/both wall sides; release-to-fall; deliberate jump-away; grace without air-jump exploit; respawn clears grip'};
 });await page.screenshot({path:'output/playwright/wall-grip-v19.png'});if(errors.length)throw Error(errors.join('\n'));await page.unroute('**/src/main.ts*');await page.reload();return {result,errors};
}
