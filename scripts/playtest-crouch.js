async(page)=>{
 await page.goto('http://127.0.0.1:5175/');
 const result=await page.evaluate(async()=>{
  const {PlayerRuntime}=await import('/src/player-runtime.ts');
  const sheet=document.createElement('canvas');sheet.id='crouch-sheet';sheet.width=1440;sheet.height=280;sheet.style='position:fixed;inset:0;z-index:999999';document.body.append(sheet);
  const c=sheet.getContext('2d');c.fillStyle='#202a33';c.fillRect(0,0,1440,280);c.imageSmoothingEnabled=false;
  const results=[],assert=(v,m)=>{if(!v)throw Error(m);};
  const variants=[['tibo',0],['peter',0],['pidalf',0],['marcus',0],['theo',0],['dimillian',0],['dimillian',1],['dimillian',2]];
  for(const [i,[id,form]] of variants.entries()){
   const source=document.createElement('canvas');source.width=120;source.height=110;const g=new PlayerRuntime(source);g.character=id;if(id==='dimillian')g.dimillianKit.changeForm(form);g.state='playing';g.invuln=0;g.audio.muted=true;g.effects=false;g.enemies=[];g.barrels=[];g.world.blocks.fill(null);for(let x=0;x<30;x++)g.world.set(x,5,3);Object.assign(g.player,{x:40,y:68,w:20,h:32,vx:0,vy:0,grounded:true});
   g.keys.add('ControlLeft');g.updateStance();assert(g.crouched&&g.player.h===18&&g.player.y===82,id+' feet moved');
   g.keys.add('KeyD');for(let j=0;j<24;j++)g.movePlayer(1/120,false,false);assert(Math.abs(g.player.vx)<=90.01,id+' not slow');
   Object.assign(g.player,{x:40,y:82,vx:0,vy:0,grounded:true});g.keys.delete('KeyD');g.cam=0;g.time=0;g.drawActor();c.font='14px monospace';c.fillStyle='#eee';c.fillText(id.toUpperCase()+(id==='dimillian'?' '+form:''),i*180+10,25);c.drawImage(source,20,45,80,60,i*180,45,240,180);c.strokeStyle='#627280';c.beginPath();c.moveTo(i*180,210);c.lineTo(i*180+170,210);c.stroke();
   const shot=(y)=>({x:0,y,vx:600,vy:0,life:1,hostile:true,power:1,pierce:0,boost:false,hit:new Set()});
   g.health=3;g.bullets=[shot(75)];g.updateBullets(.12);assert(g.health===3,id+' high shot hit crouch');
   g.bullets=[shot(88)];g.updateBullets(.12);assert(g.health===2,id+' low shot should hit exposed crouch');
   g.invuln=0;g.health=3;g.world.set(1,4,3);g.bullets=[shot(88)];g.updateBullets(.12);assert(g.health===3,id+' single block did not protect');g.world.blocks[4*204+1]=null;
   g.world.set(2,3,3);g.keys.clear();g.updateStance();assert(g.crouched,id+' stood through ceiling');g.world.blocks.fill(null);g.updateStance();assert(!g.crouched&&g.player.y===68,id+' failed stand');
   g.keys.add('ShiftLeft');g.keys.add('KeyD');if(form!==2){for(let j=0;j<30;j++)g.movePlayer(1/120,false,false);assert(g.player.vx>150,id+' shift still slows');}
   results.push(id+' / '+form+': stance, slow movement, bullets, cover, ceiling, release');
  }
  return results;
 });await page.locator('#crouch-sheet').screenshot({path:'output/playwright/crouch-sheet.png'});await page.reload();return result;
}
