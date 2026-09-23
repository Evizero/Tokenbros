async(page)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/src/main.ts*',async route=>{const r=await route.fetch();await route.fulfill({response:r,body:(await r.text())+'\nwindow.__qa=game;'});});await page.reload();await page.waitForFunction(()=>window.__qa?.rosterPreview);
 try{
 const result=await page.evaluate(async()=>{
  const {mageStaffTip}=await import('/src/dimillian-art.ts');const g=window.__qa;cancelAnimationFrame(g.frame);g.rosterPreview.paused=true;
  const assert=(v,m)=>{if(!v)throw Error(m);};let target={x:340,y:845};
  const clean=()=>{g.selectCharacter('dimillian');g.start();g.finishIntro();g.effects=false;g.audio.muted=true;g.keys.clear();g.pointer.down=false;g.pendingShot=0;g.world.blocks.fill(null);for(let x=0;x<100;x++)g.world.set(x,43,3);Object.assign(g.player,{x:175,y:828,vx:0,vy:0,grounded:true});g.enemies=[];g.barrels=[];g.relays=[];g.rescues=[];g.alarms=[];g.bullets=[];g.grenades=[];g.boss.active=false;g.encounters.update=()=>{};g.setThinking(1);g.fireTimer=0;g.aimPoint=()=>target;g.updateAim=()=>{g.aimAngle=Math.atan2(target.y-g.player.y-16,target.x-g.player.x-10);g.face=Math.cos(g.aimAngle)>=0?1:-1;g.aim=Math.atan2(Math.sin(g.aimAngle),Math.cos(g.aimAngle)*g.face);};g.updateAim();};
  const bot=(x,y=830)=>{const e=g.spawnEnemy(x,y,'gunner');e.hp=e.max=100;e.cool=99;g.enemies.push(e);return e;};
  const hold=t=>{for(let i=0;i<Math.ceil(t*120);i++){g.dimillianKit.update(1/120);g.fireTimer=Math.max(0,g.fireTimer-1/120);g.dimillianKit.fireInput(1/120,true);}};
  const release=()=>g.dimillianKit.fireInput(1/120,false);
  clean();const front=bot(290),side=bot(360,775),third=bot(435),fourth=bot(500,780);target={x:600,y:845};g.updateAim();hold(1/120);
  assert(front.hp===100&&g.shotCount===0,'Press should begin charging, not fire');release();
  assert(front.hp<97.1&&front.hp>96&&side.hp===100&&g.shotCount===1&&g.bullets.length===0,'Tap release must hit immediately without chains/projectile');
  g.fireTimer=0;hold(.5);assert(g.shotCount===1,'Holding rapid fires');release();assert(side.hp<100&&third.hp===100,'Medium charge should add one chain target');
  g.fireTimer=0;hold(2);assert(g.dimillianKit.charge===1.15&&g.shotCount===2,'Fully charged hold should wait indefinitely for release');assert(g.dimillianKit.fullChargeFlash===0,'Full flash timer does not settle');
  const before=[front,side,third,fourth].map(e=>e.hp);release();assert([front,side,third,fourth].every((e,i)=>e.hp===before[i]-12)&&g.shotCount===3&&g.dimillianKit.charge===0,'Full release must hit four distinct targets once');
  release();assert(g.shotCount===3,'Release repeats discharge');g.dimillianKit.update(.4);assert(!g.dimillianKit.lightning.length,'Arc never fades');
  const origins=[];
  for(const aim of [{x:420,y:845},{x:40,y:845},{x:240,y:670}]){clean();target=aim;g.updateAim();hold(1/120);release();const tip=g.dimillianKit.staffTip(),arc=g.dimillianKit.lightning[0];assert(Math.hypot(tip.x-arc.x,tip.y-arc.y)<.001,'Bolt detached from staff gem');origins.push({face:g.face,origin:{x:arc.x,y:arc.y}});}
  clean();target={x:400,y:845};g.updateAim();const hidden=bot(350);for(let y=0;y<43;y++)g.world.set(14,y,3);hold(1/120);release();assert(hidden.hp===100&&g.dimillianKit.lightning[0].tx<284,'Lightning passed through cover');
  clean();target={x:305,y:845};g.updateAim();const primary=bot(295),covered=bot(395);for(let y=0;y<43;y++)g.world.set(18,y,3);g.dimillianKit.charge=1.15;hold(1/120);release();assert(primary.hp===88&&covered.hp===100,'Chain crossed a wall or struck twice');
  clean();target={x:370,y:844};g.updateAim();g.world.set(16,42,2);hold(1/120);release();assert(g.world.get(16,42)?.hp<1.1,'Tap should strongly chip cover');g.world.set(16,42,2);g.dimillianKit.charge=1.15;g.dimillianKit.cast();assert(!g.world.get(16,42),'Charged lightning should destroy cover');
  clean();target={x:330,y:844};g.updateAim();const damageBarrel={x:320,y:830,w:18,h:30,vx:0,vy:0,grounded:true,hp:20,dead:false,fuse:0};g.barrels.push(damageBarrel);g.dimillianKit.charge=1.15;g.dimillianKit.cast();assert(damageBarrel.hp===8,'Charged damage to barrels was not increased');
  clean();target={x:310,y:845};g.updateAim();bot(300);const friendly=bot(365);friendly.hacked=20;g.dimillianKit.charge=1.15;hold(1/120);release();assert(friendly.hp===100,'Chain targeted friendly remote bot');g.setThinking(2);assert(g.dimillianKit.charge===0&&!g.dimillianKit.lightning.length,'Form swap retains channel');
  clean();target={x:305,y:845};g.updateAim();bot(295);g.pointer.down=true;g.update(1/120);assert(g.shotCount===0,'Real game input fired before release');g.pointer.down=false;g.update(1/120);assert(g.shotCount===1,'Real tap did not discharge');g.fireTimer=0;g.pointer.down=true;g.update(.1);g.pause();assert(!g.dimillianKit.charge&&!g.dimillianKit.lightning.length,'Pause retains channel');g.resume();g.dimillianKit.charge=1.15;g.dimillianKit.cast();g.die();assert(!g.dimillianKit.charge&&!g.dimillianKit.lightning.length,'Death retains channel');
  clean();g.press('KeyQ');const k=g.dimillianKit;assert(k.bubbleRadius()===0,'Bubble spawned at full size');
  const barrel={x:200,y:829,w:18,h:30,vx:0,vy:0,grounded:true,hp:2,dead:false,fuse:0};g.barrels.push(barrel);const grenade={x:207,y:841,vx:-50,vy:0,life:3};g.grenades=[grenade];
  const pushed=bot(211),untouched=bot(285),ally=bot(202,800);ally.hacked=5;
  const shot=(x,y,vx=-600)=>({x,y,vx,vy:0,hostile:true,life:2,power:1,pierce:0,boost:false,hit:new Set()});
  const swept=shot(215,844);g.bullets.push(swept);k.update(.07);assert(k.bubbleRadius()>25&&k.bubbleRadius()<56,'Bubble does not expand');assert(pushed.vx>200&&untouched.vx===0&&ally.vx===0,'Growing bubble shove/friendly filtering');assert(!swept.hostile&&swept.vx>0&&swept.owner===g.id&&k.shieldHP===80,'Growing edge did not reflect swept shot');
  assert(barrel.mobile&&barrel.vx>0&&grenade.vx>0&&grenade.owner===g.id,'Bubble did not push barrel and grenade');
  const moving=shot(210,844),from={x:265,y:844};assert(k.intercept(moving,from)&&!moving.hostile&&moving.vx>0,'Timed incoming shot not reflected');
  k.update(.2);assert(k.bubbleRadius()===56,'Bubble did not reach existing radius');const absorbed=shot(220,844);assert(k.intercept(absorbed,{x:270,y:844})&&absorbed.life===0,'Settled bubble should absorb');
  g.release('KeyQ');k.update(.1);g.press('KeyQ');assert(k.bubbleRadius()===0&&k.shieldHP<100,'Partial shield reuse should regrow without free refill');
  clean();target={x:305,y:845};g.updateAim();bot(295);bot(370,775);bot(445);bot(515,785);g.dimillianKit.charge=1.15;g.dimillianKit.cast();g.cam=0;g.camY=440;g.modeFeedback=0;g.dimillianKit.transform=0;g.hud();g.render();
  return {origins,checks:'tap/release hitscan; medium/full chain targets; indefinite charged hold without rapid fire; staff origin left/right/up; terrain and chain cover; no friendly fire; form/pause/death cleanup; expanding shield shove/reflection/settled absorption/partial reuse'};
 });
 await page.screenshot({path:'output/playwright/dimillian-lightning.png'});
 await page.evaluate(()=>{const g=window.__qa;g.dimillianKit.lightning=[];g.dimillianKit.dischargeFlash=0;g.dimillianKit.charge=1.15;g.dimillianKit.fullChargeFlash=.15;g.render();});await page.screenshot({path:'output/playwright/dimillian-charge.png'});
 await page.evaluate(()=>{const g=window.__qa;g.dimillianKit.charge=0;g.press('KeyQ');g.dimillianKit.update(.065);g.render();});await page.screenshot({path:'output/playwright/dimillian-bubble-growing.png'});
 if(errors.length)throw Error(errors.join('\n'));return result;
 }finally{await page.unroute('**/src/main.ts*');await page.reload();}
}
