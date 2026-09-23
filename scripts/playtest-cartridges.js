async(page)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/src/main.ts*',async route=>{const r=await route.fetch();await route.fulfill({response:r,body:(await r.text())+'\nwindow.__qa=game;'});});await page.reload();await page.waitForFunction(()=>window.__qa?.rosterPreview);
 try{
 const result=await page.evaluate(()=>{
  const g=window.__qa;cancelAnimationFrame(g.frame);g.rosterPreview.paused=true;const assert=(v,m)=>{if(!v)throw Error(m);};let k;
  const setup=()=>{g.selectCharacter('marcus');g.start();g.finishIntro();g.audio.muted=true;g.effects=false;g.keys.clear();g.pointer.down=false;g.world.blocks.fill(null);Object.assign(g.player,{x:160,y:600,vx:0,vy:0,grounded:false});g.enemies=[];g.barrels=[];g.relays=[];g.rescues=[];g.alarms=[];g.bullets=[];g.boss.active=false;g.setThinking(0);k=g.marcusKit;g.aimPoint=()=>({x:1500,y:616});g.updateAim=()=>{g.face=1;g.aim=0;g.aimAngle=0;};};
  const tick=t=>{for(let i=0;i<Math.ceil(t*120);i++)k.update(1/120);};
  setup();for(let i=0;i<4;i++){k.fire();tick(.11);}assert(k.discs.length===4&&k.stock===0,'Four cartridges should fill capacity');k.fire();tick(.01);assert(k.discs.length===4,'Fifth cartridge overspends stock');tick(1);assert(k.discs.every(d=>!d.back&&d.x>800),'Cartridges did not travel further or returned too soon');k.recall();tick(2);assert(k.stock===4&&k.catches===4&&!k.discs.length,'Recall did not recover four cartridges');
  setup();k.fire();tick(4.9);assert(k.discs.length===1&&!k.discs[0].back&&k.discs[0].x>3000,'Full outbound range was cut short');tick(.3);assert(k.discs[0].back,'Missing bounded automatic recall');tick(5);assert(k.stock===4&&!k.discs.length,'Long-distance return ran out before catch');
  setup();for(let y=0;y<50;y++){g.world.set(5,y,3);g.world.set(11,y,3);}k.fire();tick(2);assert(k.bounceCount>8&&k.discs.length===1&&!k.discs[0].back,'Cartridge did not survive extra ricochets');tick(2);assert(k.catches===1&&k.stock===4,'Ricochet limit should return instead of destroy');
  setup();g.player.x=4000;k.fire();tick(.3);assert(k.discs.length===1&&k.discs[0].vx<0&&k.discs[0].bounces>0,'Map edge lost the cartridge');k.recall();tick(1);assert(k.stock===4&&k.catches===1,'Boundary ricochet could not be recalled');
  setup();const e=g.spawnEnemy(350,600,'gunner');e.hp=e.max=40;g.enemies=[e];k.fire();tick(1);assert(e.hp===36,'Outbound damage changed');k.recall();tick(1);assert(e.hp===32&&k.returnHits===1&&k.stock===4,'Recall no longer hits once on return');
  setup();k.ultimate();for(let i=0;i<4;i++){k.fire();tick(.11);}assert(k.discs.length===20&&k.stock===0,'Batch echoes should not cost extra stock');g.die();assert(!k.discs.length&&!k.pending&&k.stock===4,'Death left slots occupied');
  setup();for(let y=0;y<50;y++){g.world.set(5,y,3);g.world.set(25,y,3);}for(let i=0;i<4;i++){k.fire();tick(.11);}tick(.4);g.invuln=0;g.cam=0;g.camY=300;g.modeFeedback=0;g.hud();document.querySelector('.toast').innerHTML='';g.render();assert(document.querySelector('#usage').textContent==='0 / 4','HUD capacity incorrect');
  return {checks:'four-cartridge cap, farther five-second flight, 16-ricochet safety return, map-edge banking, recall catch/refill, unchanged outbound/return damage, batch cap and cleanup'};
 });
 await page.screenshot({path:'output/playwright/marcus-four-cartridges.png'});
 if(errors.length)throw Error(errors.join('\n'));return result;
 }finally{await page.unroute('**/src/main.ts*');await page.reload();}
}
