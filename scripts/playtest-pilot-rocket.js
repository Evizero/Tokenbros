async(page)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/src/main.ts*',async route=>{const r=await route.fetch();await route.fulfill({response:r,body:(await r.text())+'\nwindow.__qa=game;'});});await page.reload();await page.waitForFunction(()=>window.__qa?.rosterPreview);
 try{
 const result=await page.evaluate(()=>{
  const g=window.__qa;cancelAnimationFrame(g.frame);g.rosterPreview.paused=true;const assert=(v,m)=>{if(!v)throw Error(m);};let k;
  const setup=()=>{g.selectCharacter('dimillian');g.start();g.finishIntro();g.audio.muted=true;g.effects=false;g.keys.clear();g.pointer.down=false;g.world.blocks.fill(null);Object.assign(g.player,{x:200,y:640,vx:0,vy:0,grounded:false});g.enemies=[];g.barrels=[];g.relays=[];g.rescues=[];g.alarms=[];g.bullets=[];g.boss.active=false;g.setThinking(2);k=g.dimillianKit;g.aimPoint=()=>({x:470,y:660});g.updateAim=()=>{const t=g.aimPoint();g.aimAngle=Math.atan2(t.y-g.player.y-20,t.x-g.player.x-10);g.face=Math.cos(g.aimAngle)>=0?1:-1;g.aim=Math.atan2(Math.sin(g.aimAngle),Math.cos(g.aimAngle)*g.face);};g.updateAim();};
  const tick=t=>{for(let i=0;i<Math.ceil(t*120);i++)k.update(1/120);};
  const bot=(x,y=640)=>{const e=g.spawnEnemy(x,y,'shield');e.hp=e.max=14;g.enemies.push(e);return e;};
  setup();const a=bot(450),b=bot(490),friend=bot(510);friend.hacked=99;assert(k.ultimate()&&k.rocket&&g.player.vx<0,'Launch or recoil missing');assert(!k.ultimate(),'Rocket ignores cooldown');tick(.5);assert(a.dead&&b.dead&&friend.hp===14&&!k.rocket,'Blast failed or friendly fire');
  setup();for(let y=0;y<50;y++)g.world.set(17,y,3);const behind=bot(440);k.ultimate();tick(.5);assert(!k.rocket&&behind.hp===14,'Rocket tunneled through reinforced wall');
  setup();g.world.set(17,33,1);k.ultimate();tick(.5);assert(!g.world.get(17,33),'Blast did not break destructible terrain');
  setup();k.ultimate();k.cannon();assert(g.fireTimer===.13&&g.bullets[0].power===1.5,'Overdrive still boosts cannons');g.pause();const life=k.rocket.life;g.update(.2);assert(k.rocket.life===life,'Paused rocket advances');g.resume();g.die();assert(!k.rocket&&!k.rocketKick,'Dead player retains rocket');
  const fly=(dir,key)=>{g.keys.clear();if(key)g.keys.add(key);for(let i=0;i<60;i++)k.fly(1/120,dir);};
  setup();fly(1);const forward=g.player.vx;assert(forward>390&&forward<620&&k.thrusters.forward>.7&&k.thrusters.reverse<.01,'Main engines not driving forward');
  fly(-1);const reverse=-g.player.vx;assert(reverse===205&&k.thrusters.reverse>.6,'Reverse engine missing');
  fly(0,'KeyW');assert(g.player.vy===-245&&k.thrusters.up>.8,'Belly jets not driving ascent');
  fly(0,'KeyS');assert(g.player.vy===245&&k.thrusters.down>.7,'Roof jets not driving descent');
  fly(0);assert(g.player.vx===0&&g.player.vy===0,'Ship drifts after stopping');
  g.face=-1;fly(-1);assert(g.player.vx<-390&&g.player.vx>-620&&k.thrusters.forward>.7,'Facing left reverses main thruster incorrectly');
  setup();g.keys.add('KeyW');for(let i=0;i<24;i++)k.fly(1/120,1);k.ultimate();tick(.16);g.invuln=0;g.cam=80;g.camY=340;g.modeFeedback=0;k.messageLife=0;k.transform=0;g.hud();document.querySelector('.toast').innerHTML='';g.render();
  return {checks:'rocket recoil, cooldown, explosive area damage, friendly immunity, swept terrain hit, destructible cover, unboosted cannon, pause/death, directional speeds and matching jets',speeds:{forward,reverse,vertical:245}};
 });
 await page.screenshot({path:'output/playwright/pilot-rocket-thrusters.png'});
 if(errors.length)throw Error(errors.join('\n'));return result;
 }finally{await page.unroute('**/src/main.ts*');await page.reload();}
}
