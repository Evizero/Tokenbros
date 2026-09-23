async(page)=>{
 await page.goto('http://127.0.0.1:5175/');
 const results=await page.evaluate(async()=>{
  const {PlayerRuntime}=await import('/src/player-runtime.ts');
  const variants=[['tibo',0,'TIBO'],['peter',0,'PETER'],['dimillian',0,'DUELIST'],['pidalf',0,'PIDALF'],['marcus',0,'MARCUS'],['theo',0,'THEO'],['dimillian',1,'MAGE'],['dimillian',2,'PILOT']];
  const sheet=document.createElement('canvas');sheet.id='head-aim-sheet';sheet.width=1600;sheet.height=670;sheet.style='position:fixed;inset:0;z-index:999999';document.body.append(sheet);
  const c=sheet.getContext('2d');c.fillStyle='#202a33';c.fillRect(0,0,1600,670);c.imageSmoothingEnabled=false;c.fillStyle='#e7ece7';c.font='bold 20px monospace';c.fillText('HEAD AIM / SAME SCALE · UP / LEVEL / DOWN',22,30);
  const results=[];
  for(const [i,[id,form,label]] of variants.entries()){
   c.font='14px monospace';c.fillStyle='#e7ece7';c.fillText(label,i*200+65,65);
   const signatures=[];
   for(const face of [1,-1])for(const [row,aim] of [-Math.PI/2,0,Math.PI/2].entries()){
    const source=document.createElement('canvas');source.width=160;source.height=140;const ctx=source.getContext('2d');const g=new PlayerRuntime(source);
    g.character=id;g.thinking=form;if(id==='dimillian')g.dimillianKit.changeForm(form);g.state='playing';g.face=face;g.aim=aim;g.aimAngle=Math.atan2(Math.sin(aim),Math.cos(aim)*face);g.invuln=0;g.time=0;g.effects=false;g.audio.muted=true;Object.assign(g.player,{x:70,y:70,vx:0,vy:0,grounded:true});
    g.drawActor();const m=ctx.getTransform();if(m.a!==1||m.d!==1||m.e!==0||m.f!==0)throw Error(id+' leaked drawing transform');
    const pixels=ctx.getImageData(0,0,160,140).data;let hash=0;for(let n=0;n<pixels.length;n++)hash=(hash*31+pixels[n])|0;signatures.push(hash);
    if(face===1){c.save();c.beginPath();c.rect(i*200,80+row*190,200,186);c.clip();c.drawImage(source,i*200+100-80*3,225+row*190-102*3,480,420);c.restore();c.strokeStyle='#536470';c.beginPath();c.moveTo(i*200+20,227+row*190);c.lineTo(i*200+180,227+row*190);c.stroke();}
   }
   if(new Set(signatures).size!==6)throw Error(label+' failed to face and aim differently');results.push({character:id,form,poses:6});
  }return results;
 });await page.locator('#head-aim-sheet').screenshot({path:'output/playwright/head-aim-sheet.png'});await page.reload();return results;
}
