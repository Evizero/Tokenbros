async(page)=>{
 await page.goto('http://127.0.0.1:5175/');
 const result=await page.evaluate(async()=>{
  const {PlayerRuntime}=await import('/src/player-runtime.ts');
  const names=[['tibo','TIBO'],['peter','PETER'],['dimillian','DIMILLIAN'],['pidalf','PIDALF'],['marcus','MARCUS'],['theo','THEO']];
  const sheet=document.createElement('canvas');sheet.id='character-lineup';sheet.width=1680;sheet.height=530;
  sheet.style='position:fixed;inset:0;z-index:999999;width:1680px;height:530px';document.body.append(sheet);
  const c=sheet.getContext('2d');c.fillStyle='#202a33';c.fillRect(0,0,1680,530);c.imageSmoothingEnabled=false;
  c.fillStyle='#eef2ef';c.font='bold 22px monospace';c.fillText('TOKENBROS / IDLE SPRITE LINEUP',28,36);
  c.fillStyle='#a6b9c8';c.font='14px monospace';c.fillText('Actual in-game sprites · one shared ground baseline · identical 4× nearest-neighbor scale',28,63);
  const actors=[];
  for(const [i,[id,name]] of names.entries()){
   const source=document.createElement('canvas');source.width=160;source.height=120;const g=new PlayerRuntime(source);
   g.character=id;g.state='playing';g.thinking=0;g.face=1;g.aim=0;g.aimAngle=0;g.time=0;g.invuln=0;g.effects=false;g.audio.muted=true;
   Object.assign(g.player,{x:70,y:70,vx:0,vy:0,grounded:true});g.drawActor();
   const sx=i*280+140,baseline=355;
   c.save();c.beginPath();c.rect(i*280,90,280,300);c.clip();c.drawImage(source,sx-80*4,baseline-102*4,640,480);c.restore();
   c.strokeStyle='#75828b';c.lineWidth=1;c.beginPath();c.moveTo(i*280+18,baseline+.5);c.lineTo(i*280+262,baseline+.5);c.stroke();
   c.fillStyle=id==='theo'?'#78d9ff':'#ecede5';c.font='bold 18px monospace';c.textAlign='center';c.fillText(name,sx,395);
   c.fillStyle='#98aab9';c.font='12px monospace';c.fillText(id==='dimillian'?'DUELIST':id==='theo'?'BOARD IN HAND':'DEFAULT LOADOUT',sx,417);
   c.drawImage(source,sx-80,440-70,160,120);actors.push(id);
  }
  c.textAlign='left';c.fillStyle='#a6b9c8';c.font='12px monospace';c.fillText('Native-size sprites below each label. No individual resizing or height normalization.',28,509);
  return {actors,scale:4,baseline:355};
 });
 await page.locator('#character-lineup').screenshot({path:'output/playwright/character-idle-lineup.png'});await page.reload();return result;
}
