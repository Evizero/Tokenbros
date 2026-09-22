async(page)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/src/main.ts*',async route=>{const r=await route.fetch();await route.fulfill({response:r,body:(await r.text())+'\nwindow.__qa=game;'});});await page.setViewportSize({width:1280,height:720});await page.reload();
 try{
 const result=await page.evaluate(()=>{
 const g=window.__qa;cancelAnimationFrame(g.frame);const assert=(v,m)=>{if(!v)throw Error(m);};
 const clean=(bro)=>{g.selectCharacter(bro);g.start();g.finishIntro();g.audio.setMuted(true);g.effects=false;g.enemies=[];g.barrels=[];g.rescues=[];g.relays=[];g.alarms=[];g.boss.active=false;g.pointer.active=false;g.player.x=210;g.player.y=828;g.cam=0;g.camY=440;};
 const event=()=>g.barks.active?.event;const ready=()=>{g.barks.reset();};
 const spawns=[];for(const bro of ['tibo','peter','dimillian']){clean(bro);assert(event()==='spawn','Missing spawn '+bro);spawns.push(g.barks.active.line);const first=g.barks.active.line;clean(bro);assert(g.barks.active.line!==first,'Spawn repeats immediately');}
 clean('tibo');ready();g.performReset(350,830);assert(event()==='reset','Physical reset does not trigger line');const line=g.barks.active.line;for(let i=0;i<30;i++)g.barks.request('reset');assert(g.barks.active.line===line&&!g.barks.pending,'Routine spam queues/replaces dialogue');g.barks.update(8);assert(!g.barks.request('reset'),'Per-event cooldown ignored');g.barks.update(18);assert(g.barks.request('reset')&&g.barks.active.line!==line,'Variant rotation/cooldown failed');
 g.die();assert(event()==='death','Death does not interrupt ability');g.respawn();assert(event()==='death'&&g.barks.pending?.event==='respawn','Respawn clips death line');g.barks.update(4);assert(event()==='respawn','Respawn not shown after death');
 const life=g.barks.active.life;g.pause();g.update(.5);assert(g.barks.active.life===life,'Pause consumes dialogue');g.resume();g.update(.1);assert(g.barks.active.life<life,'Dialogue not resumed');
 clean('tibo');ready();g.usage=0;g.shoot();assert(event()==='empty','Dry fire does not trigger line');ready();g.otherTibo.activate();assert(event()==='double','Double line missing');ready();g.otherTibo.collect(g.otherTibo.active);assert(event()==='catch','Catch line missing');
 clean('peter');ready();g.peterKit.throw();assert(event()==='summon','Pet line missing');ready();g.peterKit.transform();assert(event()==='molt','Molt line missing');ready();g.defense.activate();assert(event()==='prism','Prism line missing');
 clean('dimillian');for(const [form,name] of ['duelistSpecial','mageSpecial','pilotSpecial'].entries()){g.dimillianKit.special=0;g.dimillianKit.fCooldown=0;g.setThinking(form);ready();g.dimillianKit.ultimate();assert(event()===name,'Form special line mismatch '+name);}
 clean('dimillian');g.setThinking(1);ready();const e=g.spawnEnemy(300,830,'gunner');g.enemies.push(e);g.aimPoint=()=>({x:310,y:844});g.dimillianKit.secondary();assert(event()==='sheep','Polymorph line missing');
 clean('tibo');ready();for(let i=0;i<3;i++){const e=g.spawnEnemy(350+i*30,830,'gunner');g.enemies.push(e);g.kill(e);}assert(event()==='multikill','Triple kill reaction missing');ready();g.health=2;g.invuln=0;g.damage();assert(event()==='lowHealth','Low-health reaction missing');
 clean('peter');ready();g.player.x=1020;g.player.y=730;g.update(1/120);assert(event()==='tower','Tower entrance missing');g.barks.update(30);g.update(1/120);assert(!g.barks.active,'Tower repeats on revisit');ready();g.player.x=3340;g.player.y=828;g.updateBoss(1/120);assert(event()==='boss','Boss arrival missing');
 ready();g.relays=[{x:300,y:828,done:false,supplied:true}];g.openUplinks(300,828);assert(event()==='uplink','Uplink line missing');ready();g.rescues=[{x:g.player.x,y:g.player.y,done:false}];g.update(1/120);assert(event()==='rescue','Rescue line missing');g.win();assert(event()==='victory'&&document.querySelector('.ending-quip').textContent.includes(g.barks.active.line),'Victory quote absent from result overlay');
 clean('dimillian');g.pause();document.querySelector('#switch-bro').click();assert(!g.barks.active&&!document.querySelector('#hero-caption').textContent,'Roster retains dialogue');const p=g.rosterPreview;p.scene.barks.request('spawn');for(let i=0;i<240;i++)p.step(1/120);assert(!p.scene.barks.active&&!document.querySelector('#hero-caption').textContent,'Preview emits hero dialogue');
 return {spawns,timing:'global gap, per-event cooldown, variants, death priority, deferred respawn, pause',events:'spawn, death, respawn, reset, empty, double, catch, summon, molt, prism, three form specials, sheep, multikill, low health, tower, boss, uplink, rescue, victory',preview:'no bubble or accessible-caption leakage'};
 });
 for(const bro of ['tibo','peter','dimillian']){
 await page.evaluate(bro=>{const g=window.__qa;g.selectCharacter(bro);g.start();g.finishIntro();g.audio.setMuted(true);g.effects=false;g.enemies=[];g.barrels=[];g.player.x=240;g.player.y=828;g.cam=0;g.camY=440;g.invuln=0;g.barks.update(.2);document.querySelector('.toast').innerHTML='';g.hud();g.render();},bro);
 await page.screenshot({path:`output/playwright/hero-bubble-${bro}-v27.png`});}
 if(errors.length)throw Error(errors.join('\n'));return {result,errors};
 }finally{await page.unroute('**/src/main.ts*');await page.reload();}
}
