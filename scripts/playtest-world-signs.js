async(page)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/src/main.ts*',async route=>{const r=await route.fetch();await route.fulfill({response:r,body:(await r.text())+'\nwindow.__qa=game;'});});await page.setViewportSize({width:1280,height:720});await page.reload();
 try{
 for(const scene of [{name:'opening',x:90,y:828,cam:0,camY:440},{name:'tower',x:1200,y:528,cam:940,camY:200},{name:'cable',x:1720,y:288,cam:1320,camY:0},{name:'second-feed',x:2850,y:568,cam:2530,camY:360}]){
 await page.evaluate(s=>{const g=window.__qa;cancelAnimationFrame(g.frame);g.start();g.finishIntro();g.effects=false;g.audio.setMuted(true);g.barks.clear();g.player.x=s.x;g.player.y=s.y;g.cam=s.cam;g.camY=s.camY;g.invuln=0;g.time=1;document.querySelector('.toast').innerHTML='';g.hud();g.render();},scene);await page.screenshot({path:`output/playwright/world-signs-${scene.name}-v28.png`});}
 if(errors.length)throw Error(errors.join('\n'));return {captures:4,errors};
 }finally{await page.unroute('**/src/main.ts*');await page.reload();}
}
