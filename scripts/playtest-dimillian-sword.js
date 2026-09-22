async(page)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/src/main.ts*',async route=>{const r=await route.fetch();await route.fulfill({response:r,body:(await r.text())+'\nwindow.__qa=game;'});});await page.reload();
 try{
 const result=await page.evaluate(()=>{
  const g=window.__qa;cancelAnimationFrame(g.frame);const assert=(v,m)=>{if(!v)throw Error(m);};
  const clean=()=>{g.selectCharacter('dimillian');g.start();g.finishIntro();g.effects=false;g.pointer.active=false;g.face=1;g.aimAngle=0;g.player.x=200;g.player.y=828;g.enemies=[];g.barrels=[];g.bullets=[];g.boss.active=false;g.world.blocks.fill(null);for(let x=0;x<204;x++)g.world.set(x,43,3);};
  const tick=t=>{for(let i=0;i<Math.ceil(t*240);i++)g.dimillianKit.updateSwing(1/240);};
  const shot=(x=242,y=844,vx=-600,vy=0)=>({x,y,vx,vy,hostile:true,life:2,power:1,pierce:0,boost:false,hit:new Set()});
  clean();g.world.set(12,41,2);g.world.set(12,42,2);const e=g.spawnEnemy(263,830,'gunner');e.hp=30;g.enemies.push(e);g.dimillianKit.melee();tick(.31);
  assert(g.world.get(12,42)?.hp===2,'Wall should take one 2-damage hit per slash');assert(e.hp===30,'Sword hits enemy behind intact wall');assert(g.dimillianKit.comboHits===0,'Wall incorrectly confirms combo');
  g.dimillianKit.melee();tick(.31);assert(!g.world.get(12,42),'Second slash should break cover');
  clean();g.world.set(12,42,3);g.dimillianKit.melee();tick(.31);assert(g.world.get(12,42)?.hp===999,'Reinforced geometry destroyed');
  clean();g.world.set(10,43,1);g.dimillianKit.melee();tick(.31);assert(g.world.get(10,43)?.hp===2,'Horizontal slash digs player floor');g.aimAngle=Math.PI/2;g.dimillianKit.melee();tick(.31);assert(!g.world.get(10,43),'Deliberate downward slash cannot dig');
  const reflected=[];
  for(const face of [1,-1]){
   clean();g.face=face;g.aimAngle=face===1?0:Math.PI;g.dimillianKit.melee();const k=g.dimillianKit;
   assert(!k.deflectSwing(shot(210+face*32,844,-face*600)),'Windup reflects bullets');tick(.139);
   const b=shot(210+face*32,844,-face*600);g.bullets.push(b);g.updateBullets(.008);
   assert(!b.hostile&&b.vx*face>590&&b.life>0,'Active slash did not reflect incoming shot');
   assert(!k.deflectSwing(shot(210-face*32,844,face*600)),'Slash reflects an unseen rear shot');assert(!k.deflectSwing(shot(210+face*80,844,-face*600)),'Parry extends beyond blade');
   const target=g.spawnEnemy(210+face*90-10,830,'gunner');target.hp=10;g.enemies.push(target);g.updateBullets(.13);assert(target.hp===8,'Reflected shot does not damage bot');
   tick(.08);assert(!k.deflectSwing(shot(210+face*32,844,-face*600)),'Recovery reflects bullets');reflected.push({face,targetHP:target.hp});
  }
  clean();g.world.set(11,42,3);g.dimillianKit.melee();tick(.139);assert(!g.dimillianKit.deflectSwing(shot()),'Can reflect through a wall');
  clean();const swept=shot();g.bullets.push(swept);g.dimillianKit.melee();tick(.145);assert(!swept.hostile,'Moving blade fails to intercept bullet already in range');
  clean();g.player.x=215;g.cam=0;g.camY=440;g.invuln=0;g.hud();g.render();return {terrain:'two-hit cover, one hit per tile, occlusion, reinforced walls, intentional downward digging',reflection:reflected,timing:'active blade only; windup/recovery/rear/out-of-range/cover rejected; moving blade catches bullets'};
 });
 await page.evaluate(async()=>{
  const {dimillian,swordPose}=await import('/src/dimillian-art.ts');
  const canvas=document.createElement('canvas');canvas.id='sword-poses';canvas.width=960;canvas.height=510;canvas.style.cssText='position:fixed;inset:0;z-index:9999;width:960px;height:510px;background:#171923;image-rendering:pixelated';document.body.append(canvas);const c=canvas.getContext('2d');
  c.fillStyle='#171923';c.fillRect(0,0,960,510);c.font='16px monospace';c.fillStyle='#ebdfff';c.fillText('DUELIST / WINDUP → CUT → FOLLOW-THROUGH → RECOVERY',24,25);
  for(let step=0;step<3;step++){
   const windup=step===2?.14:step===1?.065:.08,active=step===2?.18:step===1?.12:.11,duration=windup+active+(step===2?.22:.11),direction=step===1?1:-1;
   const start=-direction*(step===2?1.65:1.35),end=direction*(step===2?1.45:1.1);
   for(let col=0;col<4;col++){
    const age=[windup*.9,windup+active*.52,windup+active+.01,duration-.012][col],t=Math.max(0,Math.min(1,(age-windup)/active)),angle=start+(end-start)*t*t*(3-2*t);
    const pose={age,windup,active,duration,step};dimillian(c,100+col*230,64+step*145,1,0,false,0,0,1,0,false,false,3,angle,step===2?33:29,pose);
    c.fillStyle='#a498b6';c.font='12px monospace';c.fillText(`${step+1}.${col+1}`,35+col*230,185+step*145);
   }
  }
 });
 await page.locator('#sword-poses').screenshot({path:'output/playwright/dimillian-sword-poses-v24.png'});
 if(errors.length)throw Error(errors.join('\n'));return {result,errors};
 }finally{await page.unroute('**/src/main.ts*');await page.reload();}
}
