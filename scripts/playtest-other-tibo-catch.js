async(page)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/src/main.ts*',async route=>{const r=await route.fetch();await route.fulfill({response:r,body:(await r.text())+'\nwindow.__qa=game;'});});await page.reload();
 try{
 const result=await page.evaluate(()=>{
 const g=window.__qa;cancelAnimationFrame(g.frame);const assert=(v,m)=>{if(!v)throw Error(m);};
 function clean(){g.selectCharacter('tibo');g.start();g.finishIntro();g.effects=false;g.invuln=0;g.pointer.active=false;g.face=1;g.aimAngle=0;g.player.x=100;g.player.y=828;g.enemies=[];g.barrels=[];g.rescues=[];g.relays=[];g.alarms=[];g.bullets=[];g.world.blocks.fill(null);for(let x=0;x<204;x++)g.world.set(x,43,3);g.aimPoint=()=>({x:320,y:844});g.boss.active=false;}
 function tick(t){for(let i=0;i<Math.ceil(t*120);i++){g.time+=1/120;g.otherTibo.update(1/120);}}
 function enemy(){const e=g.spawnEnemy(285,830,'shield');e.cool=99;e.hp=10;g.enemies.push(e);return e;}
 clean();g.otherTibo.activate();tick(.1);assert(g.otherTibo.active&&g.otherTibo.cooldown>4,'Spawn instantly caught');tick(.5);const b=g.otherTibo.active;assert(b.catchable&&b.phase==='guard','Double not catchable after landing');g.player.x=b.x;g.player.y=b.y;tick(.01);assert(!g.otherTibo.active&&g.otherTibo.cooldown===0&&g.otherTibo.catchFeedback>0,'Touch failed catch/recharge');assert(g.otherTibo.activate(),'Immediate rethrow failed');tick(.02);assert(g.otherTibo.active&&g.otherTibo.cooldown>0,'Rethrown double auto-caught');
 clean();g.otherTibo.activate();tick(1.9);assert(!g.otherTibo.active&&g.otherTibo.cooldown>2,'Expiry improperly refunded E');
 clean();g.otherTibo.activate();tick(.5);const wall=g.otherTibo.active;wall.x=300;wall.y=824;g.player.x=278;g.player.y=828;for(let y=40;y<43;y++)g.world.set(14,y,3);tick(.01);assert(g.otherTibo.active,'Catch through solid wall');
 clean();g.usage=300;const e=enemy();g.otherTibo.activate();tick(.4);assert(e.hp===7&&g.otherTibo.flights.length===6&&g.usage===300,'Impact must spawn flight before credit');const start=g.otherTibo.flights[0].x;tick(.15);assert(g.otherTibo.flights[0].x<start,'Tokens not traveling to player');g.player.x=170;tick(.6);assert(g.usage===360&&g.otherTibo.flights.length===0&&g.otherTibo.rewardTotal===60,'Reward failed moving-player homing/exact accounting');tick(.2);assert(g.usage===360,'Reward repeated');
 clean();g.usage=985;enemy();g.otherTibo.activate();tick(1.1);assert(g.usage===1000&&g.otherTibo.rewardTotal===15,'Reward overflowed cap');
 clean();g.usage=400;g.otherTibo.activate();tick(1.2);assert(g.usage===400&&!g.otherTibo.flights.length,'Miss grants tokens');
 clean();g.usage=200;enemy();g.otherTibo.activate();tick(.4);g.die();g.update(.5);assert(g.usage===200,'Dead player received reward');g.respawn();assert(!g.otherTibo.flights.length&&g.otherTibo.catchFeedback===0,'Respawn retains reward/catch state');
 clean();g.usage=200;enemy();g.otherTibo.activate();tick(.4);g.pause();const age=g.otherTibo.flights[0].age;g.update(.5);assert(g.otherTibo.flights[0].age===age,'Pause advances token flights');g.resume();
 // Screenshot fixture on the original map, catch during incoming token stream.
 g.start();g.finishIntro();g.effects=false;g.invuln=0;g.player.x=200;g.player.y=828;g.enemies=[];g.barrels=[];g.cam=0;g.camY=440;g.usage=400;const robot=g.spawnEnemy(335,830,'shield');robot.hp=10;g.enemies.push(robot);g.aimPoint=()=>({x:350,y:844});g.otherTibo.activate();tick(.35);const buddy=g.otherTibo.active;assert(buddy.thrown,'Screenshot needs thrown enemy');g.player.x=buddy.x-22;g.player.y=buddy.y;tick(.075);document.querySelector('.toast').innerHTML='';g.hud();g.render();
 return {catch:'touch, immediate rethrow, spawn immunity, wall exclusion, no expiry refund',tokens:'6 homing sparks, 60 total on arrival, moving target, cap, no miss/repeat reward',lifecycle:'death/respawn and pause'};
 });await page.screenshot({path:'output/playwright/other-tibo-catch-v21.png'});if(errors.length)throw Error(errors.join('\n'));return {result,errors};
 }finally{await page.unroute('**/src/main.ts*');await page.reload();}
}
