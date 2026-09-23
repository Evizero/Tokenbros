async(page)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/src/main.ts*',async route=>{const r=await route.fetch();await route.fulfill({response:r,body:(await r.text())+'\nwindow.__qa=game;'});});await page.reload();await page.waitForFunction(()=>window.__qa?.rosterPreview);
 try{
 const result=await page.evaluate(()=>{
  const g=window.__qa;cancelAnimationFrame(g.frame);g.rosterPreview.paused=true;const assert=(v,m)=>{if(!v)throw Error(m);};
  let k;const setup=()=>{g.selectCharacter('dimillian');g.start();g.finishIntro();g.audio.muted=true;g.effects=false;g.keys.clear();g.pointer.down=false;g.world.blocks.fill(null);for(let x=0;x<100;x++)g.world.set(x,43,3);Object.assign(g.player,{x:175,y:828,vx:0,vy:0,grounded:true});g.enemies=[];g.barrels=[];g.relays=[];g.rescues=[];g.alarms=[];g.bullets=[];g.boss.active=false;g.encounters.update=()=>{};g.setThinking(1);k=g.dimillianKit;const e=g.spawnEnemy(440,830,'shield');e.cool=99;g.enemies.push(e);g.aimPoint=()=>({x:e.x+10,y:e.y+15});g.updateAim=()=>{g.aimAngle=Math.atan2(e.y+15-g.player.y-16,e.x+10-g.player.x-10);g.face=1;g.aim=g.aimAngle;};g.updateAim();return e;};
  const tick=t=>{for(let i=0;i<Math.ceil(t*120);i++)g.dimillianKit.update(1/120);};
  let e=setup();assert(k.secondary(),'Cast rejected');const tip=k.staffTip();assert(Math.hypot(k.polymorph.x-tip.x,k.polymorph.y-tip.y)<.001&&!e.sheep,'Spell did not originate at staff before transformation');tick(.12);assert(k.polymorph.trail.length>5&&!e.sheep&&k.polymorph.x>tip.x,'No visible travel');tick(.25);assert(e.sheep===6&&k.polymorph.impact&&e.wind===0,'Arrival failed');k.hit(e,1,0);assert(!e.sheep,'Damage no longer wakes sheep');
  e=setup();k.secondary();e.dead=true;tick(.1);assert(!k.polymorph,'Dead target still transformed');
  e=setup();k.secondary();e.hacked=1;tick(.1);assert(!k.polymorph,'Friendly target still transformed');
  e=setup();k.secondary();for(let y=0;y<43;y++)g.world.set(16,y,3);tick(.5);assert(!e.sheep&&!k.polymorph,'Spell went through newly introduced cover');
  e=setup();k.secondary();g.pause();const age=k.polymorph.age;g.update(.2);assert(k.polymorph.age===age,'Paused spell advances');g.resume();g.die();assert(!k.polymorph&&!k.sheepGesture,'Death leaves spell alive');
  e=setup();k.secondary();tick(.13);g.invuln=0;g.cam=0;g.camY=460;g.modeFeedback=0;k.messageLife=0;k.transform=0;g.hud();document.querySelector('.toast').innerHTML='';g.render();
  return {checks:'staff origin, flight delay, impact, wake on damage, dead/friendly cancellation, terrain interception, pause and death'};
 });
 await page.screenshot({path:'output/playwright/polymorph-flight.png'});
 await page.evaluate(()=>{const g=window.__qa;for(let i=0;i<27;i++)g.dimillianKit.update(1/120);g.render();});
 await page.screenshot({path:'output/playwright/polymorph-impact.png'});
 if(errors.length)throw Error(errors.join('\n'));return result;
 }finally{await page.unroute('**/src/main.ts*');await page.reload();}
}
