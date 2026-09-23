import { rect,withHeadTilt } from './art';
import type { TheoKit } from './theo';
export const THEO_COLOR='#78d9ff';
const ink='#101923',skin='#e5b19a';
export function deck(c:CanvasRenderingContext2D,x:number,y:number,angle=0,scale=1){
 c.save();c.translate(Math.round(x),Math.round(y));c.rotate(angle);c.scale(scale,scale);
 rect(c,-18,-3,36,5,ink);rect(c,-16,-3,32,3,'#50bddd');rect(c,-19,-5,5,4,ink);rect(c,14,-5,5,4,ink);rect(c,-18,-5,4,2,'#d5f3f3');rect(c,14,-5,4,2,'#d5f3f3');
 rect(c,-9,-3,9,2,'#f5f2dc');rect(c,3,-2,8,2,'#243675');
 for(const dx of [-11,11]){rect(c,dx-3,2,6,2,'#84949b');rect(c,dx-2,3,4,4,ink);rect(c,dx-1,3,3,3,'#e2d4b6');}c.restore();
}
// Broad underside, with trucks visible: this is the deck turned to catch shots.
export function shieldDeck(c:CanvasRenderingContext2D,x:number,y:number,angle=0,scale=1){
 c.save();c.translate(x,y);c.rotate(angle);c.scale(scale,scale);
 c.fillStyle=ink;c.beginPath();c.roundRect(-23,-7,46,14,6);c.fill();
 c.fillStyle='#c5ece9';c.beginPath();c.roundRect(-21,-5,42,10,5);c.fill();
 c.fillStyle='#34afd3';c.beginPath();c.moveTo(-18,-5);c.lineTo(0,-5);c.lineTo(-8,5);c.lineTo(-20,5);c.fill();
 c.fillStyle='#354d89';c.beginPath();c.moveTo(3,-5);c.lineTo(16,-5);c.lineTo(3,5);c.lineTo(-6,5);c.fill();
 for(const xx of [-13,13]){rect(c,xx-2,-5,4,10,'#71898f');rect(c,xx-3,-8,6,3,'#e6d6b5');rect(c,xx-3,5,6,3,'#e6d6b5');}c.restore();
}
function limb(c:CanvasRenderingContext2D,points:number[][],color:string,width:number){
 // Stamp on the native pixel grid, matching the roster's square color blocks.
 for(let i=1;i<points.length;i++){
  const [ax,ay]=points[i-1],[bx,by]=points[i],steps=Math.max(1,Math.ceil(Math.max(Math.abs(bx-ax),Math.abs(by-ay))));
  for(let j=0;j<=steps;j++){const u=j/steps;rect(c,Math.round(ax+(bx-ax)*u-width/2),Math.round(ay+(by-ay)*u-width/2),width,width,color);}
 }
}
function head(c:CanvasRenderingContext2D,x:number,y:number,gaze=0){
 // Same head scale and block shading as the other bros; fringe and earring
 // carry the likeness rather than extra portrait-sized facial detail.
 x=Math.round(x);y=Math.round(y);
 rect(c,x-5,y-5,12,11,'#d5a18a');rect(c,x-6,y-2,3,5,'#ae7d69');
 rect(c,x-3,y-4,9,7,'#e9b99d');rect(c,x+5,y-1,4,3,'#efc4a6');
 rect(c,x+1,y+4,6,2,'#bc8673');rect(c,x+3,y-2+gaze,2,2,'#25313b');
 rect(c,x+1,y+3,5,1,'#946457');
 rect(c,x-6,y-8,14,4,'#29262d');rect(c,x-3,y-10,8,3,'#393137');
 rect(c,x-7,y-5,4,5,'#30282e');rect(c,x-3,y-5,4,3,'#29262d');
 rect(c,x+1,y-5,3,5,'#20232a');rect(c,x+5,y-6,3,3,'#30282e');
 rect(c,x-3,y-8,7,1,'#514047');rect(c,x-6,y+2,2,3,'#d2e1e4');
}
export function theo(c:CanvasRenderingContext2D,x:number,y:number,face:number,time:number,k:TheoKit){
 const p=k.g.player,riding=k.riding,ground=p.grounded,moving=Math.abs(p.vx)>35;
 const progress=k.attack>0?1-k.attack/k.attackDuration:0;
 const attack=k.attack>0?Math.sin(Math.min(1,progress*1.8)*Math.PI):0;
 const blend=k.attached?k.mountBlend:0,hop=Math.sin(blend*Math.PI)*5;
 const boxing=!k.attached&&k.punchLife>0,boxingAttack=boxing&&k.attackKind===3&&k.attack>0;
 const cross=boxingAttack&&k.punchStep===1,hook=boxingAttack&&k.punchStep===2;
 const toss=k.shieldPose>0?Math.pow(k.shieldPose/.42,.7):0;
 const heavy=k.strikePower,drive=attack*(1+heavy*.45);

 const push=riding&&ground&&moving&&Math.abs(p.vx)<425?Math.max(0,Math.sin(time*10)):0;
 const crouch=(riding?push*1.5+k.rush*2:boxing?1+attack*(hook?-3:1):-drive*2)-hop+toss*2;
 const lean=riding?Math.sign(p.vx||k.rideFace)*Math.min(5,Math.abs(p.vx)/90):face*(drive*(cross?8:5)+toss*8);
 const run=!riding&&moving&&ground&&k.attack<=0?Math.sin(time*15)*5:0;
 const airborne=!ground;
 c.save();c.translate(Math.round(x+10),Math.round(y+31));c.scale(riding?k.rideFace:face,1);
 const tilt=lean*(riding?k.rideFace:face),hipX=-tilt*.2,hipY=-12+crouch,shoulderX=tilt,shoulderY=-25+crouch;
 if(riding){
  if(k.rush>.08){
   c.save();c.globalAlpha=k.rush*.75;c.strokeStyle='#c5f5ff';c.lineWidth=1.5+k.rushFlash*3;
   c.beginPath();c.moveTo(16,-48);c.quadraticCurveTo(42,-25,19,-3);c.stroke();
   c.globalAlpha=k.rush*.18;c.lineWidth=5;c.strokeStyle=THEO_COLOR;c.stroke();
   for(let i=0;i<4;i++){const u=(time*(2+i*.2)+i*.27)%1;c.globalAlpha=(1-u)*k.rush*.45;rect(c,-20-u*43,-9-i*10,8+u*14,1,'#d0f5ff');}
   c.restore();
  }
 }
 const flip=k.flip>0?Math.sin(k.flip/.52*Math.PI):0;
 // Exactly two articulated legs. Kicking changes the leading leg's pose;
 // it never paints a third leg over the walking cycle.
 let backX=-(5+blend*5)-run-(boxing?3:0)-toss*5,backY=-blend*8-flip*12+push*8;
 let frontX=(6+blend*4)+run+push*7+drive*3+toss*6,frontY=-blend*8-(airborne?5:0);
 const kicking=k.kickPose>0?Math.sin(k.kickPose/.4*Math.PI):0;
 if(kicking){frontX=14+kicking*21;frontY=-8-kicking*13;}
 if(k.flip>0){frontX=12+flip*5;frontY=-2;}
 limb(c,[[hipX-2,hipY],[backX-1,(hipY+backY)/2],[backX,backY]],'#293746',5);
 limb(c,[[hipX+3,hipY],[frontX*.55,(hipY+frontY)/2],[frontX,frontY]],'#435363',5);
 const shoe=(xx:number,yy:number,front:boolean)=>{rect(c,xx-3,yy-2,8,4,front?'#dce5dc':'#aebfc6');rect(c,xx-3,yy+1,8,1,'#f0f3e6');};
 shoe(backX,backY,false);shoe(frontX,frontY,true);
 // Boxing arms are drawn after the torso: the rear shoulder rotates forward
 // on the cross instead of disappearing behind the chest and lead guard.
 if(!boxing&&toss>0){
  const a=Math.atan2(Math.sin(k.shieldAim),Math.cos(k.shieldAim)*face),hx=9+Math.cos(a)*toss*20,hy=shoulderY+9+Math.sin(a)*toss*20;
  limb(c,[[shoulderX-6,shoulderY+4],[hx-9,hy+6],[hx-3,hy]],'#bb8a72',4);
 }else if(!boxing&&!(k.attached&&k.attack>0&&!riding))limb(c,[[shoulderX-6,shoulderY+4],[-10-drive*4,shoulderY+11],[-8-drive*6,shoulderY+15-push*5]],'#bb8a72',4);
 // Loose black tee: broad short sleeves, collar, folds, blue rim and hem.
 rect(c,shoulderX-8,shoulderY,17,13,'#202b34');rect(c,hipX-7,hipY-2,15,3,'#27333e');
 rect(c,shoulderX-9,shoulderY+1,cross?8:6,7,cross?'#60717a':'#46525a');rect(c,shoulderX-5,shoulderY+1,11,2,'#536069');
 rect(c,shoulderX+5,shoulderY+4,5,6,'#17232d');rect(c,shoulderX-1,shoulderY+3,3,8,'#34434d');
 rect(c,shoulderX-2,shoulderY-1,6,2,'#ba8b76');
 // Tiny cyan tee print echoes the deck without turning his clothes neon.
 rect(c,shoulderX+1,shoulderY+6,4,1,'#77b2ca');rect(c,shoulderX+3,shoulderY+7,2,2,'#58819c');
 c.save();c.translate(Math.round(shoulderX+1),Math.round(shoulderY-5-attack-toss*2));c.scale(riding?face*k.rideFace:1,1);withHeadTilt(c,0,5,k.g.aim,(gaze)=>head(c,0,0,gaze));c.restore();
 let handX=riding?13:10,handY=shoulderY+(riding?11:14),deckAngle=-.95;
 const localAim=Math.atan2(Math.sin(k.attackAngle),Math.cos(k.attackAngle)*face);
 if(k.attack>0&&k.attackKind!==3){
  const swing=Math.min(1,progress/.42),recover=Math.max(0,(progress-.55)/.45);
  deckAngle=k.attackKind===2?localAim+1.5-swing*2.9:localAim-1.8+swing*3.15;handX=7+Math.sin(swing*Math.PI*.8)*19;handY=shoulderY+7+Math.sin(deckAngle)*10;
  handX+=(12-handX)*recover;handY+=(shoulderY+14-handY)*recover;deckAngle+=(-.95-deckAngle)*recover;
 }
 if(k.catchPose>0&&k.attack<=0){handX=17;handY=shoulderY-4+Math.sin(k.catchPose*12)*4;}
 if(boxing){
  handX=shoulderX+(cross?7:12);handY=shoulderY+(cross?-1:5);
  if(boxingAttack&&!cross){handX+=attack*(hook?12:15);handY+=hook?Math.sin(progress*Math.PI*2)*9-attack*8:-attack*3;}
 }
 if(toss>0){const a=Math.atan2(Math.sin(k.shieldAim),Math.cos(k.shieldAim)*face);handX=11+Math.cos(a)*toss*23;handY=shoulderY+8+Math.sin(a)*toss*23;}
 if(k.throwPose>0){const reach=Math.sin(k.throwPose/.32*Math.PI);handX=14+reach*14;handY=shoulderY+15-reach*8;}
 if(blend>0&&blend<1){handX+=(7-handX)*Math.sin(blend*Math.PI);handY+=(0-handY)*Math.sin(blend*Math.PI)*.55;}
 const nearArm=()=>{limb(c,[[shoulderX+7,shoulderY+7],[boxing?(cross?shoulderX+16:handX-8):handX*.7,boxing?handY+7:shoulderY+12],[handX,handY]],skin,4);rect(c,handX-2,handY-2,boxing?5:4,boxing?5:4,'#f1c4aa');};
 if(boxing){
  const reach=cross?attack:0,fx=shoulderX-4+reach*25,fy=shoulderY+5+reach*2;
  const rearArm=()=>{
   limb(c,[[shoulderX-7,shoulderY+5],[shoulderX-11+reach*20,shoulderY+13-reach*5],[fx,fy]],'#c69378',4);
   rect(c,fx-2,fy-3,6,6,'#dfaf92');rect(c,fx-1,fy-3,4,1,'#f1c4aa');
  };
  if(cross){nearArm();rearArm();}else{rearArm();nearArm();}
 }else nearArm();
 if(k.attached){
  const hx=handX+Math.cos(deckAngle)*10,hy=handY+Math.sin(deckAngle)*10;
  // One board moves from hand to wheels as his feet hop onto it.
  deck(c,hx*(1-blend),hy*(1-blend)-4*blend,deckAngle*(1-blend),.95+.05*blend);
  if(k.attack>0&&!riding)limb(c,[[shoulderX-5,shoulderY+6],[handX-8,handY+6],[handX-3,handY+2]],'#c79c88',4);
 }
 if(boxingAttack&&attack>.5){
  c.save();c.globalAlpha=(attack-.5)*.6;c.strokeStyle='#e9d9bd';c.lineWidth=1;
  const xx=cross?shoulderX-4+attack*25:handX,yy=cross?shoulderY+5+attack*2:handY;
  c.beginPath();c.moveTo(xx-9,yy+(hook?8:2));c.lineTo(xx-3,yy+1);c.stroke();c.restore();
 }
 if(attack>.5&&k.attached){c.globalAlpha=(attack-.5)*.45;c.strokeStyle='#d7f8ff';c.lineWidth=4;c.beginPath();c.arc(8,-25,38+heavy*7,localAim-1.5,localAim+1.1);c.stroke();}
 c.restore();
}
export function theoPortrait(c:CanvasRenderingContext2D){
 c.clearRect(0,0,c.canvas.width,c.canvas.height);rect(c,0,0,64,64,'#213441');
 c.save();c.translate(30,34);c.scale(2.5,2.5);rect(c,-10,7,21,13,'#283442');rect(c,-9,8,5,12,'#435362');head(c,0,-2);c.restore();
}
