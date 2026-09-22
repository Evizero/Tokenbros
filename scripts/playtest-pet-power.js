async(page)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/src/main.ts*',async route=>{const r=await route.fetch();await route.fulfill({response:r,body:(await r.text())+'\nwindow.__qa=game;'});});await page.reload();
 const result=await page.evaluate(()=>{
 const g=window.__qa;cancelAnimationFrame(g.frame);const assert=(v,m)=>{if(!v)throw Error(m);};
 function clean(){g.selectCharacter('peter');g.start();g.finishIntro();g.effects=false;g.invuln=99;g.pointer.active=false;g.face=1;g.aimAngle=0;g.player.x=100;g.player.y=828;g.enemies=[];g.barrels=[];g.rescues=[];g.relays=[];g.alarms=[];g.bullets=[];g.world.blocks.fill(null);for(let x=0;x<204;x++)g.world.set(x,43,3);g.aimPoint=()=>({x:450,y:840});g.boss.active=false;}
 function pet(type,x,y){g.thinking=type;g.peterKit.throwCooldown=0;g.peterKit.throw();const p=g.peterKit.pets.at(-1);Object.assign(p,{x,y,age:1,state:'follow',cool:0,vx:0,vy:0});return p;}
 function enemy(x,y=830){const e=g.spawnEnemy(x,y,'shield');e.hp=30;g.enemies.push(e);g.aimPoint=()=>({x:e.x+10,y:e.y+15});return e;}
 function tick(t,full=false){for(let i=0;i<Math.ceil(t*120);i++){if(full)g.update(1/120);else{g.time+=1/120;g.peterKit.update(1/120);}}}
 const distances=[];for(let type=0;type<3;type++){clean();g.thinking=type;g.peterKit.throw();const p=g.peterKit.pets[0],start=p.x;tick(.5);distances.push(p.x-start);assert(p.state==='deploy'&&p.hp>0,'Long throw interrupted before landing');}assert(distances.every(d=>d>300&&Math.abs(d-distances[0])<1),'Blue/yellow launch does not match red');
 clean();let p=pet(1,250,805);let e=enemy(360,795);tick(1/120);assert(p.charge===.1&&!p.firstDash,'First blue dash should have short windup');tick(.07);assert(p.dash===0&&e.hp===30,'First dash lost all anticipation');tick(.04);assert(p.dash>0,'First blue dash too slow');while(p.dash>0)tick(1/120);assert(e.hp===26&&Math.abs(p.x-440)<1,'First dash lost fixed range or hit more than once');tick(1.51);assert(p.chargeDuration===.45&&p.charge>0,'Later dash should retain normal buildup');
 clean();p=pet(1,250,805);e=enemy(360,795);tick(.02);for(let y=38;y<43;y++)g.world.set(15,y,3);tick(.4);assert(p.x<=286&&e.hp===30,'Fast first dash passed through wall');
 clean();p=pet(2,250,850);e=enemy(400);g.peterKit.command();tick(.2);assert(p.x>=286,'Crusher still walks too slowly');
 clean();p=pet(2,250,850);e=enemy(280);g.peterKit.command();tick(.02);assert(p.slam>0&&e.hp===30,'Crusher needs visible windup before hit');tick(.15);assert(e.hp===24&&e.shield===0&&e.vx===430&&e.vy===-220&&e.flung>0&&p.bite>0,'Crusher hit lacks damage/armor break/knockback/animation');const x=e.x;tick(.1,true);assert(e.x>x+30,'Crusher knockback is damped away immediately');
 clean();p=pet(2,250,850);e=enemy(270);e.hp=4;g.peterKit.command();tick(.2);assert(e.dead&&g.debris.pieces.length>0,'Crusher cannot smash ordinary bot in one hit');
 clean();p=pet(2,250,850);e=enemy(425);for(let x=15;x<19;x++)for(let y=39;y<43;y++)g.world.set(x,y,2);g.peterKit.command();tick(4);assert(g.world.destroyed>=4&&e.hp<30,'Crusher digging regressed');
 clean();p=pet(2,260,850);e=enemy(300);g.peterKit.command();tick(.02);for(let y=39;y<43;y++)g.world.set(14,y,3);tick(.2);assert(e.hp===30,'Crusher slam damaged enemy through reinforced wall');
 // Mid-slam render with a surviving heavy enemy and a blue companion nearby.
 g.start();g.finishIntro();g.effects=false;g.invuln=0;g.player.x=200;g.player.y=828;g.cam=0;g.camY=440;g.enemies=[];g.barrels=[];g.pointer.active=false;g.aimAngle=0;p=pet(2,310,850);e=enemy(335);g.aimPoint=()=>({x:345,y:845});g.peterKit.command();tick(.17);pet(1,255,795);document.querySelector('.toast').innerHTML='';g.hud();g.render();
 return {distances,blue:'100ms first charge, 450ms later; 190px dash; wall-safe',yellow:'190px/s walk, 140ms windup, 6 damage, 430px/s launch, 800ms recovery; digs and respects reinforced cover'};
 });await page.screenshot({path:'output/playwright/crusher-slam-v17.png'});if(errors.length)throw Error(errors.join('\n'));await page.unroute('**/src/main.ts*');await page.reload();return {result,errors};
}
