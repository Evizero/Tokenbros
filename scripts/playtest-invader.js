async(page)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/src/main.ts*',async route=>{const r=await route.fetch();await route.fulfill({response:r,body:(await r.text())+'\nwindow.__qa=game;'});});await page.setViewportSize({width:1440,height:960});await page.reload();
 try{
 const result=await page.evaluate(()=>{
  const g=window.__qa;cancelAnimationFrame(g.frame);g.audio.setMuted(true);g.selectCharacter('marcus');
  const assert=(v,m)=>{if(!v)throw Error(m);},results=[];
  const setup=()=>{g.start();g.finishIntro();g.audio.setMuted(true);g.effects=false;g.world.blocks.fill(null);for(let x=0;x<65;x++)g.world.set(x,43,3);g.enemies=[];g.barrels=[];g.alarms=[];g.relays=[];g.rescues=[];g.encounters.update=()=>{};g.player.x=150;g.player.y=828;g.cam=0;g.camY=440;g.invuln=100;g.setThinking(1);g.barks.clear();g.aimPoint=()=>({x:380,y:830});g.updateAim=()=>{g.aimAngle=-.15;g.aim=-.15;g.face=1;};return g.marcusKit;};
  const charge=(k,frames)=>{for(let i=0;i<frames;i++)k.fireInput(1/120,true);};
  const ticks=(k,n)=>{for(let i=0;i<n;i++){k.update(1/120);g.fireTimer-=1/120;}};
  for(const [frames,count] of [[1,1],[80,3],[170,6]]){const k=setup();charge(k,frames);assert(k.invader.amount===count,'charge tier');assert(k.stock===3,'charge reserves one slot');const size=.75+k.invader.charge*4.1;k.fireInput(1/120,false);assert(k.invader.craft?.total===count,'launch payload');ticks(k,900);assert(k.invader.dropped===count,`payload dropped ${count}: ${k.invader.dropped}`);assert(k.invader.detonated===count,'finite explosions');assert(k.invader.caught===1&&k.stock===4,'returns / catches / refunds');results.push({count,size,caught:k.invader.caught});}
  let k=setup();charge(k,170);k.fireInput(1/120,false);ticks(k,20);k.recall();ticks(k,800);assert(k.invader.dropped===0,'recall cancels remaining bombs');assert(k.stock===4,'recall refund');results.push('early recall cancels bombing');
  k=setup();charge(k,170);k.fireInput(1/120,false);g.setThinking(0);k.fire();ticks(k,15);assert(k.discs.length>0&&k.invader.craft,'discs while bomber deployed');g.setThinking(1);charge(k,170);assert(!k.invader.charging,'one bomber at a time');results.push('mode switching and single bomber');
  k=setup();for(let x=5;x<35;x++)g.world.set(x,39,3);charge(k,170);k.fireInput(1/120,false);ticks(k,900);assert(k.invader.dropped===0&&k.stock===4,'ceiling blocks bomber without stock lock');results.push('ceiling collision and bounded recovery');
  k=setup();charge(k,100);g.pause();assert(!k.invader.charging&&k.stock===4,'pause cancels charge');g.resume();k.fireInput(1/120,false);assert(!k.invader.craft,'resume does not launch');g.setThinking(0);g.setThinking(1);charge(k,100);g.setThinking(0);assert(!k.invader.charging&&k.stock===4,'scroll cancels charge');results.push('pause and mode cancellation');
  k=setup();charge(k,170);k.fireInput(1/120,false);ticks(k,120);g.die();assert(!k.invader.craft&&k.invader.bombs.length===0,'death cleanup');results.push('death cleanup');
  k=setup();k.ultimate();charge(k,170);k.fireInput(1/120,false);assert(k.invader.craft.total===8,'batch bounded extra payload');ticks(k,900);assert(k.invader.dropped===8&&k.stock===4,'batch finite payload');results.push('batch eight-bomb cap');
  k=setup();charge(k,100);g.press('KeyQ');assert(!k.invader.charging&&k.stock===4,'dodge cancels charge');results.push('dodge cancels charge');
  k=setup();charge(k,170);g.hud();g.modeFeedback=0;g.toastTimer=0;document.querySelector('.toast').innerHTML='';g.render();return results;
 });
 await page.screenshot({path:'output/playwright/marcus-invader-charge-v32.png'});
 await page.evaluate(()=>{const g=window.__qa,k=g.marcusKit;g.enemies=[g.spawnEnemy(350,830,'shield',-1),g.spawnEnemy(430,830,'gunner',-1),g.spawnEnemy(510,830,'gunner',-1)];k.fireInput(1/120,false);for(let i=0;i<155;i++){g.time+=1/120;k.update(1/120);}g.render();});
 await page.screenshot({path:'output/playwright/marcus-invader-pass-v32.png'});
 await page.evaluate(()=>{const g=window.__qa;for(let i=0;i<130;i++)g.update(1/120);g.cam=0;g.camY=440;g.render();});
 await page.screenshot({path:'output/playwright/marcus-invader-impact-v32.png'});
 await page.evaluate(()=>{const g=window.__qa;g.start();g.finishIntro();g.setThinking(1);g.audio.setMuted(true);g.invuln=100;const r=g.canvas.getBoundingClientRect();g.pointer.active=true;g.pointer.x=r.x+r.width*.32;g.pointer.y=r.y+r.height*.57;});
 await page.mouse.move(470,520);await page.mouse.down();
 await page.evaluate(()=>{const g=window.__qa;for(let i=0;i<170;i++)g.update(1/120);if(!g.marcusKit.invader.charging||g.marcusKit.invader.craft)throw Error('Hold must grow without auto-launch');});
 await page.mouse.up();await page.evaluate(()=>{const g=window.__qa;g.update(1/120);if(!g.marcusKit.invader.craft)throw Error('Release must launch bomber');g.setThinking(0);g.pointer.down=true;for(let i=0;i<65;i++)g.update(1/120);if(!g.marcusKit.discs.length)throw Error('Rotate remains available');g.pointer.down=false;});
 if(errors.length)throw Error(errors.join('\n'));return {result,errors};
 }finally{await page.unroute('**/src/main.ts*');await page.reload();}
}
