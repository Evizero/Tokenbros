async(page)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/src/main.ts*',async route=>{const r=await route.fetch();await route.fulfill({response:r,body:(await r.text())+'\nwindow.__qa=game;'});});await page.reload();
 const result=await page.evaluate(()=>{
 const g=window.__qa;cancelAnimationFrame(g.frame);const assert=(v,m)=>{if(!v)throw Error(m);};
 function clean(){g.selectCharacter('peter');g.start();g.finishIntro();g.effects=false;g.invuln=99;g.pointer.active=false;g.face=1;g.aimAngle=0;g.player.x=100;g.player.y=828;g.enemies=[];g.barrels=[];g.rescues=[];g.relays=[];g.alarms=[];g.bullets=[];g.world.blocks.fill(null);for(let x=0;x<204;x++)g.world.set(x,43,3);g.aimPoint=()=>({x:450,y:840});g.boss.active=false;}
 function pet(type,x,y){g.thinking=type;g.peterKit.throwCooldown=0;g.peterKit.throw();const p=g.peterKit.pets.at(-1);Object.assign(p,{x,y,age:1,state:'follow',cool:0,vx:0,vy:0});return p;}
 function enemy(x,y=830,type='gunner'){const e=g.spawnEnemy(x,y,type);e.hp=30;e.cool=0;e.patrolWait=99;g.enemies.push(e);return e;}
 function tick(t,full=false){for(let i=0;i<Math.ceil(t*120);i++){if(full)g.update(1/120);else{g.time+=1/120;g.peterKit.update(1/120);}}}
 clean();let p=pet(2,350,850),e=enemy(500);assert(g.enemyTarget(e)===p,'Enemy ignored visible crab while Peter out of range');e.look=0;assert(!g.enemyTarget(e),'Enemy saw crab behind its cone');e.look=Math.PI;g.world.set(21,42,3);assert(!g.enemyTarget(e),'Enemy saw crab through wall');g.world.set(21,41,3);g.world.blocks[42*204+21]=null;g.world.blocks[41*204+21]=null;p.state='return';assert(!g.enemyTarget(e),'Enemy targeted recall bubble');p.state='follow';p.hp=0;assert(!g.enemyTarget(e),'Enemy targeted dead crab');
 clean();p=pet(2,350,850);e=enemy(500);g.peterKit.update=()=>{};tick(3,true);assert(p.hp<8,'Enemy failed to aim and damage crab');assert(e.lockX===357&&e.lockY===855,'Enemy locked to Peter instead of crab');
 clean();p=pet(2,250,850);e=enemy(250,830,'runner');g.peterKit.update=()=>{};tick(.05,true);assert(p.hp===7,'Enemy contact failed to damage pet or applied every frame');
 clean();p=pet(2,250,850);g.explode(255,840,64,false);assert(p.hp===5,'Enemy grenade blast cannot damage crab');
 clean();g.thinking=0;g.peterKit.throw();p=g.peterKit.pets[0];const redStart=p.x;tick(.5);const redDistance=p.x-redStart;assert(redDistance>300&&p.state==='deploy','Red throw lost its long ballistic flight');
 clean();g.thinking=1;g.peterKit.throw();p=g.peterKit.pets[0];const blueStart=p.x;tick(.49);const blueDistance=p.x-blueStart;assert(Math.abs(redDistance-blueDistance)<7,'Blue throw no longer matches red launch speed');
 clean();g.thinking=0;e=enemy(410);g.peterKit.throw();p=g.peterKit.pets[0];tick(1.1);assert(p.hp<=0&&e.hp===25,'Smart grenade did not seek/detonate near distant enemy without order');
 clean();p=pet(2,250,850);e=enemy(425);for(let x=15;x<=18;x++)for(let y=39;y<43;y++)g.world.set(x,y,2);g.peterKit.command();assert(!g.peterKit.focus,'Cover fixture needs occluded target');tick(4);assert(g.world.destroyed>=4&&p.x>380&&e.hp<30,'Crusher failed to tunnel toward occluded enemy');assert(e.shield===0,'Crusher did not break enemy shield after reaching it');
 clean();p=pet(2,250,850);e=enemy(320);for(let y=35;y<43;y++)g.world.set(14,y,3);g.peterKit.command();tick(.5);assert(g.world.destroyed===0&&e.hp===30,'Crusher destroyed reinforced terrain or hit through it');
 clean();p=pet(2,250,805);e=enemy(247,875);for(let x=11;x<15;x++){g.world.blocks[43*204+x]=null;g.world.set(x,42,2);g.world.set(x,46,3);}g.aimPoint=()=>({x:257,y:890});g.peterKit.command();tick(2);assert(g.world.destroyed>0&&p.y>840,'Crusher cannot dig down toward target');
 clean();p=pet(2,450,810);g.boss.x=550;g.boss.y=784;assert(g.bossAim().x===457,'Boss ignores closer visible pet');
 return {enemyTargeting:'cone/cover/dead/recall filtering, locked pet shots, contact and grenade damage',redDistance,blueDistance,red:'long ballistic flight and autonomous quick detonation',crusher:'tunnels thick cover and downward, breaks enemy armor, respects reinforced terrain'};
 });if(errors.length)throw Error(errors.join('\n'));await page.unroute('**/src/main.ts*');await page.reload();return {result,errors};
}
