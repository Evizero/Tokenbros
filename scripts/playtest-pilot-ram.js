async(page)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/src/main.ts*',async route=>{const r=await route.fetch();await route.fulfill({response:r,body:(await r.text())+'\nwindow.__qa=game;'});});await page.reload();await page.waitForFunction(()=>window.__qa?.rosterPreview);
 try{
 const result=await page.evaluate(()=>{
  const g=window.__qa;cancelAnimationFrame(g.frame);g.rosterPreview.paused=true;const assert=(v,m)=>{if(!v)throw Error(m);};let k,target;
  const setup=()=>{g.selectCharacter('dimillian');g.start();g.finishIntro();g.audio.muted=true;g.effects=false;g.keys.clear();g.pointer.down=false;g.world.blocks.fill(null);Object.assign(g.player,{x:160,y:600,vx:0,vy:0,grounded:false});g.enemies=[];g.barrels=[];g.relays=[];g.rescues=[];g.alarms=[];g.bullets=[];g.boss.active=false;g.setThinking(2);k=g.dimillianKit;g.face=1;target={x:3500,y:620};g.aimPoint=()=>target;g.updateAim=()=>{g.aimAngle=Math.atan2(target.y-g.player.y-20,target.x-g.player.x-10);g.face=Math.cos(g.aimAngle)>=0?1:-1;g.aim=Math.atan2(Math.sin(g.aimAngle),Math.cos(g.aimAngle)*g.face);};};
  const fly=(t,dir=1)=>{for(let i=0;i<Math.ceil(t*120);i++){g.updateAim();k.fly(1/120,dir);if(k.form!==2)break;}};
  const bot=(type='gunner')=>{const e=g.spawnEnemy(g.player.x+40,g.player.y,type);e.hp=e.max=100;g.enemies.push(e);return e;};
  setup();fly(1/120);assert(g.player.vx>=270,'No immediate forward kick');const initial=g.player.vx;fly(.5);assert(g.player.vx>initial+140&&k.sonic&&!k.rocketFlight,'Missing gradual buildup / early pressure wave');
  k.cannon();assert(g.shotCount===0&&!k.ultimate()&&!k.secondary(),'Weapons usable during sonic ram');fly(.8);assert(k.rocketFlight&&g.player.vx>610,'Max speed did not become rocket flight');
  target={x:g.player.x+250,y:g.player.y-250};fly(.3);assert(g.player.vy<-300&&k.flightAngle<-.5&&k.flightBlend===1,'Rocket does not steer nose toward mouse');
  target={x:g.player.x-300,y:g.player.y};fly(.3);assert(k.rocketFlight&&g.face===-1,'Mouse-facing flip dropped held thrust key');
  fly(.5,0);assert(k.form===2&&!k.rocketFlight&&k.flightBlend===0&&Math.hypot(g.player.vx,g.player.vy)===0,'Release did not settle back to hover');g.fireTimer=0;k.cannon();assert(g.shotCount===1,'Weapons did not return after braking');
  setup();fly(1.4);let e=bot();fly(1/120);assert(e.hp<100&&k.form===2&&k.rocketFlight&&k.flightSpeed<530,'First light target should lose HP and momentum, not eject');const hp=e.hp;fly(1/120);assert(e.hp===hp,'Same bot damaged every frame');
  const heavy=bot('shield');fly(1/120);assert(k.form===0&&g.thinking===0&&g.modeFeedback===0&&heavy.hp<100&&k.ramExit&&g.player.vy<0,'Spent momentum did not explode/eject to duelist');assert(g.invuln>0,'Ejection lacks brief contact grace');g.setThinking(2);assert(k.form===2&&!k.sonic&&!k.rocketFlight&&k.forwardRun===0,'Cannot return to fresh ship');
  setup();fly(1.4);const friend=bot();friend.hacked=10;fly(1/120);assert(friend.hp===100&&k.form===2&&k.flightSpeed===620,'Friendly collision consumed momentum');
  setup();fly(1.4);const tileX=Math.floor((g.player.x+42)/20),tileY=Math.floor((g.player.y+20)/20);g.world.set(tileX,tileY,1);fly(1/120);assert(!g.world.get(tileX,tileY)&&k.flightSpeed<620,'Breakable cover did not spend momentum');
  setup();fly(1.4);const wall=Math.ceil((g.player.x+21)/20);for(let y=0;y<50;y++)g.world.set(wall,y,3);const hidden=bot();hidden.x=wall*20+45;fly(.15);assert(k.form===0&&g.player.x+g.player.w<=wall*20+.1&&hidden.hp===100,'Hard wall did not stop/eject or damage crossed cover '+JSON.stringify({form:k.form,x:g.player.x,wall:wall*20,hp:hidden.hp,sonic:k.sonic}));
  setup();fly(.2);e=bot();fly(1/120);assert(e.hp===100,'Low speed dealt ram damage');
  setup();fly(1.4);e=bot();k.fly(1/120,1,true);assert(e.hp===100,'Client prediction applied shared damage');
  setup();fly(1.4);g.setThinking(1);assert(!k.rocketFlight&&!k.sonic&&!k.forwardRun,'Form swap retains momentum mode');g.die();assert(!k.ramExit,'Death retains ejection');
  setup();fly(1.4);target={x:g.player.x+300,y:g.player.y-180};fly(.2);g.invuln=0;g.cam=g.player.x-310;g.camY=g.player.y-260;g.modeFeedback=0;k.messageLife=0;k.transform=0;g.hud();document.querySelector('.toast').innerHTML='';g.render();
  return {checks:'instant kick, progressive acceleration, sonic weapon lock, steerable max-speed flight, smooth brake/hover, momentum by target weight, one hit per pass, explosive duelist ejection, reusable ship, walls/friends/prediction/lifecycle'};
 });
 await page.screenshot({path:'output/playwright/pilot-sonic-flight.png'});
 await page.evaluate(()=>{const g=window.__qa,k=g.dimillianKit;g.effects=true;k.finishRam();g.invuln=0;g.freeze=0;g.update(.06);g.hud();g.render();});
 await page.screenshot({path:'output/playwright/pilot-ram-ejection.png'});
 if(errors.length)throw Error(errors.join('\n'));return result;
 }finally{await page.unroute('**/src/main.ts*');await page.reload();}
}
