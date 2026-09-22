async(page)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/src/main.ts*',async route=>{const r=await route.fetch();await route.fulfill({response:r,body:(await r.text())+'\nwindow.__qa=game;'});});await page.setViewportSize({width:1440,height:960});await page.reload();
 try{
 const results=[];
 for(const hero of ['tibo','peter','dimillian','pidalf','marcus']){
 const result=await page.evaluate(hero=>{
  const g=window.__qa;cancelAnimationFrame(g.frame);g.selectCharacter(hero);g.start();g.finishIntro();g.audio.setMuted(true);g.effects=false;g.player.x=370;g.player.y=648;g.invuln=1000;g.barks.clear();g.pointer.active=false;g.setThinking(hero==='peter'?1:hero==='dimillian'?2:1.2);let target={x:650,y:700};g.aimPoint=()=>target;g.updateAim=()=>{const dx=target.x-g.player.x-10,dy=target.y-g.player.y-16;g.face=dx<0?-1:1;g.aimAngle=Math.atan2(dy,dx);g.aim=Math.atan2(dy,dx*g.face);};
  let maxParticles=0,maxBodies=0;
  for(let i=0;i<1800;i++){
   const live=g.enemies.filter(e=>!e.dead).sort((a,b)=>Math.hypot(a.x-g.player.x,a.y-g.player.y)-Math.hypot(b.x-g.player.x,b.y-g.player.y));
   if(live[0])target={x:live[0].x+10,y:live[0].y+15};
   g.keys.delete('KeyA');g.keys.delete('KeyD');g.keys.add(i%720<360?'KeyD':'KeyA');
   if(i%180===0)g.press('Space');if(i%180===40)g.release('Space');
   g.pointer.down=hero==='dimillian'?i%160<110:hero==='marcus'?i%200<85:true;
   if(i%360===180)g.press('KeyE');if(i%360===270)g.release('KeyE');
   if(i%600===240)g.press('KeyF');if(i%600===250)g.release('KeyF');
   if(i%480===120)g.press('KeyQ');if(i%480===190)g.release('KeyQ');
   g.update(1/120);maxParticles=Math.max(maxParticles,g.particles.length);maxBodies=Math.max(maxBodies,g.enemies.filter(e=>!e.dead&&Math.abs(e.x-g.player.x)<700).length);
   if(!Number.isFinite(g.player.x)||!Number.isFinite(g.player.y))throw Error('Invalid player state');
  }
  g.keys.clear();g.pointer.down=false;g.toastTimer=0;document.querySelector('.toast').innerHTML='';g.hud();g.render();if(!g.kills)throw Error(hero+' never engaged');return {hero,kills:g.kills,blocks:g.world.destroyed,maxParticles,maxBodies,waves:g.encounters.snapshot(),state:g.state};
 },hero);
 results.push(result);await page.screenshot({path:'output/playwright/level-combat-'+hero+'-v31.png'});
 }
 if(errors.length)throw Error(errors.join('\n'));return {results,errors};
 }finally{await page.unroute('**/src/main.ts*');await page.reload();}
}
