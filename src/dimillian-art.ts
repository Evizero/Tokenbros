import { rect,text } from './art';
export const DIM_COLORS=['#e3b77d','#cc9fff','#99e5ed'];
export type MageMotion={strength?:number;teleport?:number;arrival?:number;departure?:number;stowed?:boolean;polymorph?:number};
export type ShipMotion={forward:number;reverse:number;up:number;down:number;kick:number;surge?:number;sonic?:boolean;flash?:number;flight?:number;heading?:number};
// One pose drives the sprite and the lightning origin, including the torso,
// hand and staff transforms. Casting never changes the physical hitbox.
export function magePose(angle:number,charge=0,attack=0,motion:MageMotion={}){
 const strength=motion.strength??0,release=attack>0?Math.min(1,attack/(.18+strength*.12)*1.7):0,blink=motion.teleport??0;
 const arrive=Math.max(0,Math.min(1,(motion.arrival??0)/.24)),depart=motion.departure??0;
 const spell=Math.min(1,(motion.polymorph??0)/.2),swish=Math.sin((1-(motion.polymorph??0)/.4)*Math.PI*2)*spell;
 const drive=release*(.22+strength*.78)+spell*.3,brace=Math.min(1,charge*3);
 return {lunge:drive*7-brace*3+arrive*6,crouch:brace*3-drive*2+blink*3+arrive*5,lean:drive*.32-brace*.17-blink*.2+arrive*.25,stride:brace*4+drive*6+blink*3,twist:drive*3,
 handX:7-brace*3+drive*8,handY:18-brace*7-drive*2-blink*4,staffAngle:angle-brace*.3+drive*.38-blink*.35+swish*.22,
 scaleX:Math.max(.08,1-arrive*.85-depart*.92),scaleY:1+arrive*.2+depart*.25,robe:drive*6-brace*2+blink*3+arrive*7,freeArm:brace*.8+drive*1.3+blink*1.5+spell*.7};
}
export function mageStaffTip(x:number,y:number,face:number,angle:number,charge=0,attack=0,motion:MageMotion={}){
 const p=magePose(angle,charge,attack,motion),a=p.staffAngle;
 const hx=p.handX+Math.cos(a)*9+Math.sin(a)*23,hy=p.handY+Math.sin(a)*9-Math.cos(a)*23-24;
 const px=p.lunge+Math.cos(p.lean)*hx-Math.sin(p.lean)*hy,py=24+p.crouch+Math.sin(p.lean)*hx+Math.cos(p.lean)*hy;
 return {x:x+10+face*px*p.scaleX,y:y+16+(py-16)*p.scaleY};
}
export const DIM_FORMS=['DUELIST','MAGE','PILOT'];
// All three prefabs keep the same recognizable pilot: tied hair, beard, glasses.
function head(c:CanvasRenderingContext2D,y=0){
 rect(c,-7,y+1,14,12,'#d6a681');rect(c,-8,y-2,15,5,'#74604e');rect(c,-11,y,5,6,'#685143');rect(c,-14,y+3,5,4,'#7c6450');
 rect(c,-7,y+9,14,6,'#806147');rect(c,2,y+10,5,2,'#eed4b2');rect(c,6,y+6,4,3,'#e6b992');
 rect(c,-6,y+4,6,5,'#31303b');rect(c,2,y+4,6,5,'#31303b');rect(c,0,y+5,2,1,'#c6bacd');rect(c,-5,y+5,4,2,'#b7d6d4');rect(c,3,y+5,4,2,'#c6dfde');rect(c,9,y+9,3,2,'#454054');
}
// The same black glass, pill camera and home indicator at hand and bunker scale.
export function iphone(c:CanvasRenderingContext2D,x:number,y:number,w=8,h=13){
 c.fillStyle='#b6afc0';c.beginPath();c.roundRect(x,y,w,h,Math.max(1,w*.15));c.fill();
 c.fillStyle='#131722';c.beginPath();c.roundRect(x+1,y+1,w-2,h-2,Math.max(1,w*.12));c.fill();
 rect(c,x+2,y+3,w-4,h-6,'#9474bb');rect(c,x+w*.35,y+1,w*.3,2,'#070911');rect(c,x+w*.3,y+h-3,w*.4,1,'#f0eaff');
}
export function iphoneBunker(c:CanvasRenderingContext2D,face:number,time:number,hp:number,connected:boolean,age:number,flash:number){
 const t=Math.min(1,age/.24),unfold=1-Math.pow(1-t,3);
 // The real hand-held phone is the seed: same position, size and orientation.
 // His outside sprite yields to the screen avatar as the glass expands.
 if(t<.8){c.save();c.globalAlpha=1-Math.max(0,(t-.2)/.6);const shrink=1-unfold*.16;c.translate(0,-unfold*12);c.scale(shrink,shrink);dimillian(c,-10,-16,face,time,false,0,0,0,0,false,false,1,undefined,29,undefined,{stowed:true});c.restore();}
 c.save();c.translate(-face*12*(1-unfold),3.5*(1-unfold)-32*unfold);c.scale(8/62+(1-8/62)*unfold,13/98+(1-13/98)*unfold);c.translate(0,32);
 const rounded=(x:number,y:number,w:number,h:number,r:number,color:string)=>{c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();};
 // Heavy titanium rails, side buttons and a dark inset glass panel.
 rounded(-33,-80,66,98,11,'#3d3c49');rounded(-31,-81,62,98,10,flash>0?'#f4e8ff':'#b9b3c5');rounded(-29,-79,58,94,9,'#555360');rounded(-27,-77,54,90,8,'#090d17');
 rect(c,-34,-60,2,8,'#ccc6d2');rect(c,-34,-47,2,14,'#ccc6d2');rect(c,32,-51,2,18,'#d8cfdf');
 c.save();c.beginPath();c.roundRect(-24,-74,48,84,6);c.clip();
 const glass=c.createLinearGradient(0,-74,0,10);glass.addColorStop(0,'#283058');glass.addColorStop(.6,'#58416e');glass.addColorStop(1,'#182035');c.fillStyle=glass;c.fillRect(-24,-74,48,84);
 // A tiny game world behind him makes him read as a sprite inside the phone.
 for(let i=0;i<5;i++){rect(c,-24+i*11,-20-i%3*8,8,29+i%3*8,'#343348');rect(c,-21+i*11,-16-i%3*8,2,3,'#786f96');}
 rect(c,-24,4,48,3,'#a9a0b8');rect(c,-24,7,48,5,'#393446');
 c.save();c.globalAlpha=Math.max(0,Math.min(1,(t-.25)/.5));c.translate(0,Math.sin(time*3)*.5);dimillian(c,-10,-25,face,time,false,0,-.7,0,0,false,false,1,undefined,29,undefined,{stowed:true});c.restore();
 c.globalAlpha=.12;for(let yy=-68;yy<8;yy+=3)rect(c,-24,yy,48,1,'#b5cfff');c.globalAlpha=1;
 c.fillStyle='#ffffff0a';c.beginPath();c.moveTo(-24,-74);c.lineTo(-10,-74);c.lineTo(24,1);c.lineTo(24,10);c.closePath();c.fill();c.restore();
 rounded(-10,-72,20,6,3,'#06080e');rect(c,5,-70,2,2,'#314568');
 // Battery charge doubles as the bunker health readout.
 rect(c,12,-62,8,4,'#9b91ad');rect(c,20,-61,1,2,'#b9aec9');rect(c,13,-61,6*hp/100,2,hp<25?'#ff887b':'#e1cef9');
 for(let i=0;i<3;i++)rect(c,-20+i*3,-58-i,2,2+i,connected?'#bdefff':'#766987');
 text(c,connected?'CONNECTED':'BUNKER',0,-43,connected?'#bdefff':'#d0b7e6',6,'center');
 rounded(-9,8,18,2,1,'#f0e9f6');rect(c,-24,17,48,3,'#5b5369');rect(c,-18,20,36,2,'#292936');
 if(flash>0){c.strokeStyle='#eedbff';c.lineWidth=2;c.beginPath();c.roundRect(-31,-81,62,98,10);c.stroke();}
 c.restore();
}
export function baguette(c:CanvasRenderingContext2D,length:number,width=6){
 rect(c,0,-width/2,length,width,'#a16d3d');rect(c,2,-width/2-1,length-5,width-1,'#ebbd77');rect(c,4,-width/2-1,length-9,2,'#ffe0a1');
 for(let x=7;x<length-3;x+=9){rect(c,x,-width/2,2,Math.max(2,width-2),'#ba864e');rect(c,x+2,-width/2,2,2,'#f9d79a');}
}
export type SwordPose={age:number;windup:number;active:number;duration:number;step:number};
// Plant the feet, pull back, drive the hips and shoulder, then recover. The
// upper body and phone follow through while the blade keeps its world angle.
export function swordPose(s?:SwordPose){
 if(!s)return {lunge:0,crouch:0,lean:0,stride:0,twist:0};
 const wind=Math.min(1,s.age/s.windup),t=Math.max(0,Math.min(1,(s.age-s.windup)/s.active)),hit=t*t*(3-2*t);
 const recover=Math.max(0,1-Math.max(0,s.age-s.windup-s.active)/(s.duration-s.windup-s.active));
 const heavy=s.step>=2,drive=(-wind*.6+hit*1.6)*recover;
 return {lunge:drive*(heavy?8:5),crouch:(wind*(heavy?4:2)-hit*(heavy?5:2))*recover,lean:drive*(heavy?.32:.23),stride:wind*(heavy?7:5)*recover,twist:Math.sin(t*Math.PI)*(s.step===1?-1:1)*3*recover};
}
export function dimillian(c:CanvasRenderingContext2D,x:number,y:number,face:number,time:number,moving:boolean,kind:number,angle:number,attack=0,charge=0,thrust=false,launch=false,scale=1,batAngle?:number,batLength=29,swing?:SwordPose,mageMotion:MageMotion={},shipMotion?:ShipMotion){
 const casting=magePose(angle,charge,attack,mageMotion);
 c.save();c.translate(Math.round(x+10*scale),Math.round(y));c.scale(face*scale,scale);
 if(kind===1){c.translate(0,16);c.scale(casting.scaleX,casting.scaleY);c.translate(0,-16);}
 const step=moving?Math.sin(time*22)*3:0;
 if(kind===2){
  const jets=shipMotion??{forward:thrust?.8:0,reverse:0,up:0,down:0,kick:launch?.2:0},kick=jets.kick/.28;
  const surge=jets.surge??0,flight=jets.flight??0,heading=jets.heading??0;
  c.translate(0,21);c.rotate(heading);c.translate(0,-21);
  c.translate(-Math.cos(angle)*kick*5,Math.sin(time*3)*(1.4-surge)-Math.sin(angle)*kick*4);
  if(surge>.2){c.save();c.strokeStyle='#b0e9ff';c.lineWidth=1;for(let i=0;i<5;i++){const phase=(time*(1.8+surge*3)+i*.21)%1;c.globalAlpha=(1-phase)*surge*.45;const xx=7-phase*95,yy=-7+i*11;c.beginPath();c.moveTo(xx,yy);c.lineTo(xx-8-surge*16,yy);c.stroke();}c.restore();}
  c.save();c.translate(0,21);c.rotate((jets.down-jets.up)*.07+(jets.reverse-jets.forward)*.035+Math.sin(time*2)*.018);
  const jet=(x:number,y:number,a:number,power:number,wide=3,reach=24)=>{if(power<.025)return;c.save();c.translate(x,y);c.rotate(a);const length=2+power*reach+Math.sin(time*48+x+y)*Math.min(2,reach/12);
   rect(c,-2,-wide-1,4,wide*2+2,'#69657c');c.fillStyle='#7477df';c.beginPath();c.moveTo(0,-wide);c.lineTo(length,0);c.lineTo(0,wide);c.fill();c.fillStyle='#b7f6ff';c.beginPath();c.moveTo(0,-wide*.55);c.lineTo(length*.7,0);c.lineTo(0,wide*.55);c.fill();rect(c,0,-1,3,2,'#efffff');c.restore();};
  for(const yy of [-4,8])jet(-25,yy,Math.PI,jets.forward,3);
  // Nose brakes blow forward; paired belly/roof jets explain vertical travel.
  for(const xx of [-15,13]){jet(xx,12,Math.PI/2,Math.max(jets.up,.3+Math.sin(time*6+xx)*.055),1.8,15);jet(xx,-10,-Math.PI/2,jets.down,1.8,15);}
  jet(22,4,0,jets.reverse,1.9,16);
  c.fillStyle='#433653';c.beginPath();c.moveTo(-23,-15+flight*6);c.lineTo(22+flight*7,0);c.lineTo(-25,20-flight*7);c.lineTo(-13,2);c.closePath();c.fill();
  c.fillStyle='#d6c6a7';c.beginPath();c.moveTo(-20,-7);c.lineTo(29,0);c.lineTo(16,8);c.lineTo(-23,10);c.closePath();c.fill();
  rect(c,-16,-7,25,5,'#f6e4c1');rect(c,-20,8,31,3,'#9485a2');rect(c,-6,-8,14,8,'#28737b');rect(c,-4,-8,9,2,'#9ed8d8');rect(c,-25,1,6,8,'#595264');
  rect(c,-12,13,20,5,'#6d5a83');rect(c,-9,14,15,2,'#c8b5da');
  c.restore();c.save();c.translate(flight*3,flight*11);c.scale(1,1-flight*.2);rect(c,-7,9,13,12,'#80719c');head(c,-5);c.restore();
  if(flight>0){c.save();c.globalAlpha=flight*.6;c.fillStyle='#9be5ec';c.beginPath();c.ellipse(0,12,13,10,0,Math.PI,Math.PI*2);c.fill();c.strokeStyle='#e9faff';c.lineWidth=1;c.stroke();c.restore();}
  c.save();c.translate(5,21);c.rotate(angle-heading);for(const yy of [-7,6]){rect(c,1,yy,19,4,'#ddd1b9');rect(c,13,yy,8,2,'#8bacc2');if(attack>0)rect(c,22,yy-2,8+attack*25,6,'#b5f7ff');}c.restore();
  if(jets.sonic){
   const flash=(jets.flash??0)/.32,pulse=Math.sin(time*24)*1.5;c.save();c.translate(0,21);
   c.fillStyle='#c8f6ff16';c.beginPath();c.moveTo(10,-29);c.quadraticCurveTo(51+pulse,0,10,29);c.lineTo(28,0);c.closePath();c.fill();
   for(let i=0;i<2;i++){c.globalAlpha=i?.24:.65+flash*.3;c.strokeStyle=i?'#a1caff':'#e6fcff';c.lineWidth=i?1:1.8+flash*2;c.beginPath();c.moveTo(8-i*7,-28-i*5);c.quadraticCurveTo(54+pulse-i*6,0,8-i*7,28+i*5);c.stroke();}
   if(flash>0){c.globalAlpha=flash*.5;c.strokeStyle='#f0ffff';c.lineWidth=2;c.beginPath();c.ellipse(27-(1-flash)*20,0,5+(1-flash)*13,22+(1-flash)*28,0,0,Math.PI*2);c.stroke();}c.restore();
  }
 }else{
  const pose=kind===1?casting:swordPose(kind===0?swing:undefined);
  if(kind===0&&swing||kind===1&&(charge>0||attack>0||mageMotion.teleport||mageMotion.arrival||mageMotion.polymorph)){
   // Bent rear knee and planted leading boot make the weight transfer visible.
   rect(c,-7-pose.stride*.5,24+pose.crouch,7,5,'#39424e');rect(c,-8-pose.stride,27,5,5,'#39424e');rect(c,-10-pose.stride,30,10,3,'#c8c9ce');
   rect(c,2+pose.lunge*.5,24+pose.crouch,6+pose.stride*.5,5,'#4c5061');rect(c,5+pose.stride,27,5,5,'#4c5061');rect(c,4+pose.stride,30,11,3,'#b4b6c2');
  }else{rect(c,-6,24,5,7+step,'#39424e');rect(c,3,24,5,7-step,'#4c5061');rect(c,-8,30+step,9,3,'#c8c9ce');rect(c,2,30-step,9,3,'#b4b6c2');}
  c.save();c.translate(pose.lunge,24+pose.crouch);c.rotate(pose.lean);c.translate(0,-24);
  if(kind===1){
   const sway=Math.round(Math.sin(time*(moving?15:3))*(moving?3:1)-casting.robe);
   c.fillStyle='#49315f';c.beginPath();c.moveTo(-9,11);c.lineTo(8,11);c.lineTo(13,31);c.lineTo(-14+sway,32);c.lineTo(-11,22);c.closePath();c.fill();
   c.fillStyle='#8060a3';c.beginPath();c.moveTo(-4,12);c.lineTo(6,12);c.lineTo(10,30);c.lineTo(-5+sway,30);c.closePath();c.fill();
   rect(c,-9,12,6,9,'#644780');rect(c,-3,15,3,15,'#ad8ac7');rect(c,-11+sway,29,23-sway,2,'#cfb47c');rect(c,-9,21,19,3,'#b69667');rect(c,0,21,4,4,'#eed3a0');rect(c,-9,25,2,4,'#382749');

  }else{rect(c,-8,12,17,14,'#68547f');rect(c,-8,12,6,9,'#887199');rect(c,-1,14,6,2,'#bda4d1');}
  c.save();c.translate(-pose.twist*.35,-Math.abs(pose.twist)*.3);head(c);
  if(kind===1){
   // A bent point, broad brim and gold band leave his glasses and beard exposed.
   const tip=Math.round(Math.sin(time*(moving?10:2))*(moving?2:.5)-casting.robe*.6);
   c.fillStyle='#49315f';c.beginPath();c.moveTo(-10,-2);c.lineTo(-5,-12);c.lineTo(2+tip,-24);c.lineTo(7+tip,-20);c.lineTo(4+tip,-18);c.lineTo(10,-2);c.closePath();c.fill();
   c.fillStyle='#9a75bd';c.beginPath();c.moveTo(-3,-6);c.lineTo(2+tip,-24);c.lineTo(4+tip,-19);c.lineTo(6,-5);c.closePath();c.fill();
   rect(c,-9,-5,18,3,'#c7a66f');rect(c,1,-5,4,3,'#f4d697');rect(c,-14,-2,29,3,'#5d3c7c');rect(c,-12,-2,25,1,'#c09cdb');
  }c.restore();
  if(kind===1){
   // The free hand gathers the charge, then opens toward the target on release.
   c.save();c.translate(-7,15);c.rotate(casting.freeArm);rect(c,-6,0,7,9,'#785294');rect(c,-6,7,5,6,'#d8ad87');rect(c,-8,10,2,4,'#efc6a0');c.restore();
  }else{c.save();c.translate(-pose.twist,pose.twist*.5);rect(c,-12,17,5,9,'#d8ad87');if(!mageMotion.stowed)iphone(c,-16,13,8,13);c.restore();}
  let bladeAngle=batAngle??-1.05;
  if(kind===0&&swing){
   const ease=(t:number)=>t*t*(3-2*t);
   if(swing.age<swing.windup){const t=ease(swing.age/swing.windup);bladeAngle=-1.05+(bladeAngle+1.05)*t;}
   else if(swing.age>swing.windup+swing.active){const t=ease(Math.min(1,(swing.age-swing.windup-swing.active)/(swing.duration-swing.windup-swing.active)));const delta=Math.atan2(Math.sin(-1.05-bladeAngle),Math.cos(-1.05-bladeAngle));bladeAngle+=delta*t;}
  }
  c.save();c.translate(kind===1?casting.handX:7,kind===1?casting.handY:18);c.rotate(kind===0?bladeAngle-pose.lean:casting.staffAngle);rect(c,-2,-2,10,5,'#d8ad87');
  if(kind===0){rect(c,6,-3,8,6,'#d8ad87');if(!mageMotion.stowed)baguette(c,batLength,batLength>90?13:7);}
  else{rect(c,7,-20,4,40,'#b18e60');rect(c,5,-22,8,6,'#e4d09a');rect(c,6,-25,6,5,'#bdeef8');
   const r=4+charge*6,pulse=1+Math.sin(time*41)*.15;
   c.save();c.translate(9,-23);c.globalAlpha=.16+charge*.2;c.fillStyle='#a778ff';c.beginPath();c.arc(0,0,r*1.9*pulse,0,Math.PI*2);c.fill();
   c.globalAlpha=1;c.fillStyle=attack>0?'#ffffff':'#d9f7ff';c.beginPath();c.arc(0,0,2+charge*2,0,Math.PI*2);c.fill();
   if(charge>0){for(let i=0;i<6;i++){const t=(time*(.75+charge)+i/6)%1,a=i*2.4+time,dist=(1-t)*(16+charge*14)+r;c.globalAlpha=t*charge;rect(c,Math.cos(a)*dist,Math.sin(a)*dist,2,2,'#d5c3ff');}c.globalAlpha=1;}
   if(charge>0||attack>0){c.strokeStyle='#c2b0ff';c.lineWidth=1;for(let i=0;i<3;i++){const a=i*Math.PI*2/3+Math.floor(time*18)*.7;c.beginPath();c.moveTo(Math.cos(a)*3,Math.sin(a)*3);c.lineTo(Math.cos(a+.35)*r,Math.sin(a+.35)*r);c.lineTo(Math.cos(a)*r*1.65,Math.sin(a)*r*1.65);c.stroke();}}
   c.restore();
  }c.restore();c.restore();
 }
 c.restore();
}
export function dimillianPortrait(c:CanvasRenderingContext2D,kind:number){c.clearRect(0,0,64,64);rect(c,0,0,64,64,'#32273f');dimillian(c,kind===1?21:12,kind===1?27:7,1,0,false,kind,0,0,0,false,false,kind===1?1.1:2);}
export function dimillianIntro(){return `${import.meta.env.BASE_URL}assets/dimillian-intro-v1.png`; }

export function sheep(c:CanvasRenderingContext2D,x:number,y:number,time:number,face:number){
 c.save();c.translate(Math.round(x+10),Math.round(y+16));c.scale(face,1);const step=Math.sin(time*10)*2;
 rect(c,-8,7,3,7+step,'#55505f');rect(c,4,7,3,7-step,'#55505f');rect(c,-12,-4,24,13,'#c9c5c8');rect(c,-14,-1,27,7,'#ece8e4');rect(c,-10,-7,18,13,'#f8f1df');rect(c,-5,-9,9,3,'#e9dffa');rect(c,7,-5,9,11,'#66616e');rect(c,9,-3,2,2,'#fff3d3');rect(c,8,-8,7,3,'#9690a0');rect(c,-17,-3,4,4,'#eee5d9');c.restore();
}

export function dimillianSeated(c:CanvasRenderingContext2D,x:number,y:number,face:number,time:number){
 c.save();c.translate(x+10,y);c.scale(face,1);rect(c,-9,13,18,12,'#735986');rect(c,-8,24,18,5,'#494257');rect(c,5,27,8,4,'#c8bed1');head(c);rect(c,-12,17,9,4,'#d6a681');rect(c,-15,12,6,9,'#202131');rect(c,-14,13,4,6,'#c4a1ef');rect(c,7,19,8,4,'#d6a681');c.restore();
}
