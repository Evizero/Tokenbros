async(page)=>{
 await page.setViewportSize({width:1280,height:800});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/src/main.ts*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text())+'\nwindow.__qa=game;'});});
 await page.reload();await page.waitForFunction(()=>window.__qa?.controller);
 try {
 const result=await page.evaluate(async()=>{
  const g=window.__qa;cancelAnimationFrame(g.frame);
  const original=navigator.getGamepads.bind(navigator);
  let connected=true,now=performance.now(),buttons=[],axes=[0,0,0,0];
  Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>connected?[{connected:true,mapping:'standard',index:0,id:'QA standard pad',axes,buttons:Array.from({length:17},(_,i)=>({pressed:buttons.includes(i),value:buttons.includes(i)?1:0}))}]:[]});
  const checks=[];const check=(condition,label)=>{if(!condition)throw Error(label);checks.push(label);};
  const poll=(b=[],a=[0,0,0,0],frames=1,simulate=false)=>{buttons=b;axes=a;for(let i=0;i<frames;i++){now+=16.67;g.controller.poll(1/60,now);if(simulate&&g.state==='playing')g.update(1/60);}};
  const tap=(b)=>{poll([b]);poll();};
  poll();tap(0);check(g.controller.active,'controller wakes in roster');
  check(document.activeElement?.matches('.bro-card'),'roster focus');
  tap(15);check(g.character==='peter','d-pad selects next bro');
  tap(14);check(g.character==='tibo','d-pad selects previous bro');
  tap(3);check(document.querySelector('#options').open,'options opens from controller');
  tap(13);check(document.activeElement?.id!=='close-options','options can be navigated');poll([], [0,0,0,1],20);check(document.querySelector('#options').scrollTop>0,'right stick scrolls options help');poll();
  tap(1);check(!document.querySelector('#options').open,'B closes options');
  tap(9);check(g.state==='intro','Menu deploys selected character');
  poll([0]);check(g.state==='playing','A skips intro');
  poll([0]);poll([0]);check(!g.keys.has('Space'),'held confirm cannot jump after transition');poll();
  // Fresh air ability press is delivered once and stays held.
  poll([4]);check(g.keys.has('Space'),'LB holds jump');poll([0,4]);poll([0]);check(g.keys.has('Space'),'jump aliases do not release one another');poll();check(!g.keys.has('Space'),'jump release');
  poll([],[-1,0,1,0]);check(g.keys.has('KeyA')&&g.aimAngle===0,'move backward while aiming forward');
  const far=g.aimPoint().x-g.player.x;poll([],[-1,0,.4,0]);check(g.aimPoint().x-g.player.x<far,'stick pressure controls target reach');
  const before=g.shotCount;poll([7],[0,0,1,0],12,true);poll();check(g.shotCount>before,'RT fires actual shots');
  poll([6]);check(g.keys.has('KeyQ')&&!!g.defense.active,'LT holds defense');poll();check(!g.keys.has('KeyQ'),'LT releases defense');
  tap(15);check(g.thinking===1,'D-pad switches category');poll([15],[0,0,0,0],6);check(g.thinking>1,'holding D-pad adjusts continuously');poll();
  g.player.x=90;g.player.y=828;g.player.vy=0;g.player.grounded=true;g.jumpBuffer=0;poll([1],[0,0,0,0],4,true);check(g.crouched,'B crouches');poll([],undefined,4,true);check(!g.crouched,'releasing B stands up');
  tap(9);check(g.state==='paused','Menu pauses');
  check([...document.querySelectorAll('.pause-actions button')].map(e=>e.id).join(',')==='panel-action,restart,panel-options,main-menu','pause order preserved');
  tap(13);check(document.activeElement.id==='restart','pause navigation');tap(13);tap(0);check(document.querySelector('#options').open,'pause Options confirms');tap(1);tap(9);check(g.state==='playing','Menu resumes');
  poll([7,5],[1,0,1,0]);connected=false;poll();check(g.state==='paused'&&!g.pointer.down&&!g.keys.size,'disconnect pauses and releases held input');
  connected=true;poll();tap(9);check(g.state==='playing','reconnect resumes');poll([],[-1,0,0,-1]);
  window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyD',bubbles:true}));check(!g.controller.active&&!g.controllerAim&&g.keys.has('KeyD'),'keyboard takes over');window.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyD',bubbles:true}));
  poll([], [1,0,1,0]);check(g.controller.active,'stick reclaims control');
  window.dispatchEvent(new Event('blur'));check(!g.pointer.down&&!g.keys.size,'blur releases controls');
  // Neutral input after focus returns re-arms the controller.
  Object.defineProperty(document,'hasFocus',{configurable:true,value:()=>true});poll();tap(9);
  for(const character of ['peter','dimillian','pidalf','marcus','theo']){
   g.selectCharacter(character);g.start();g.finishIntro();poll();g.enemies=[];
   poll([], [0,0,1,0]);poll([5]);check(g.keys.has('KeyE'),character+' secondary press');poll();check(!g.keys.has('KeyE'),character+' secondary release');
   poll([6]);check(g.keys.has('KeyQ'),character+' defense press');poll();
   if(character==='dimillian'){
    g.setThinking(1);poll([7],[0,0,1,0],40,true);check(g.dimillianKit.charge>0,'mage charges while RT held');poll([], [0,0,1,0],2,true);check(!g.pointer.down,'mage releases charged attack');
   }
  }
  g.selectCharacter('pidalf');g.start();g.finishIntro();poll();g.enemies=[];g.barrels=[];g.relays=[];g.world.blocks.fill(null);g.invuln=999;g.effects=false;
  const e=g.spawnEnemy(g.player.x+360,g.bodyY-14,'gunner');e.cool=99;g.enemies.push(e);
  poll([5],[0,0,1,0]);check(g.pidalfKit.grabbing,'RB actually grabs aimed bot');
  poll([5,7],[0,0,1,0],3,true);check(!!g.pidalfKit.crush,'RB plus RT compacts held bot');poll([],undefined,2,true);
  g.selectCharacter('tibo');g.start();g.finishIntro();poll();g.player.grounded=false;g.player.y=700;
  poll([4],[0,0,1,0],3,true);check(g.vertical.active&&g.usage<1000,'LB activates token rocket boots in air');poll();
  g.selectCharacter('tibo');g.start();g.finishIntro();poll();tap(9);g.controller.hints();
  return checks;
 });
 await page.screenshot({path:'output/playwright/controller-pause.png'});
 if(errors.length)throw Error(errors.join('\n'));return {checks:result.length,passed:result,errors};
 }finally{await page.unroute('**/src/main.ts*');await page.reload();}
}
