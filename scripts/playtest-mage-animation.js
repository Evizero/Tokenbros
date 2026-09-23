async page=>{
 await page.goto('http://localhost:5175/');
 const result=await page.evaluate(async()=>{
 const {dimillian,mageStaffTip,magePose}=await import('/src/dimillian-art.ts');
 const canvas=document.createElement('canvas');canvas.width=1120;canvas.height=320;canvas.style.cssText='position:fixed;inset:0;z-index:99999;width:1120px;height:320px;background:#202331';canvas.id='animation-qa';document.body.append(canvas);const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;c.fillStyle='#202331';c.fillRect(0,0,1120,320);
 const stages=[['REST',0,0,{}],['GATHER',.35,0,{}],['FULL CHARGE',1,0,{}],['TAP CAST',0,.18,{strength:0}],['FULL CAST',0,.3,{strength:1}],['PORTAL READY',0,0,{teleport:1}],['EMERGE',0,0,{arrival:.15}]];
 stages.forEach(([label,charge,attack,motion],i)=>{c.fillStyle='#ddc5ff';c.font='12px monospace';c.fillText(label,i*160+10,22);dimillian(c,i*160+40,150,1,2,false,1,0,attack,charge,false,false,3,undefined,29,undefined,motion);});
 let checked=0;const off=document.createElement('canvas'),ctx=off.getContext('2d'),originalArc=ctx.arc;
 for(const face of [-1,1])for(const angle of [-1,0,1])for(const [_,charge,attack,motion] of stages){let gem;
  ctx.arc=function(x,y,...args){if(!gem){const t=this.getTransform();gem={x:t.a*x+t.c*y+t.e,y:t.b*x+t.d*y+t.f};}return originalArc.call(this,x,y,...args);};
  dimillian(ctx,100,100,face,2,false,1,angle,attack,charge,false,false,1,undefined,29,undefined,motion);
  const tip=mageStaffTip(100,100,face,angle,charge,attack,motion);if(Math.hypot(gem.x-tip.x,gem.y-tip.y)>.001)throw Error('Animated staff origin diverges');checked++;
 }
 const idle=magePose(0),tap=magePose(0,0,.18),charge=magePose(0,1);if(tap.lunge<=idle.lunge+1||tap.lunge>3||charge.lean>=0)throw Error('Missing cast/brace body motion');return {staffAlignmentPoses:checked};
 });await page.locator('#animation-qa').screenshot({path:'output/playwright/mage-animation-poses.png'});await page.reload();return result;
}
