import { rect } from './art';
export const DIM_COLORS=['#e3b77d','#cc9fff','#99e5ed'];
export const DIM_FORMS=['DUELIST','MAGE','PILOT'];
// All three prefabs keep the same recognizable pilot: tied hair, beard, glasses.
function head(c:CanvasRenderingContext2D,y=0){
 rect(c,-7,y+1,14,12,'#d6a681');rect(c,-8,y-2,15,5,'#74604e');rect(c,-11,y,5,6,'#685143');rect(c,-14,y+3,5,4,'#7c6450');
 rect(c,-7,y+9,14,6,'#806147');rect(c,2,y+10,5,2,'#eed4b2');rect(c,6,y+6,4,3,'#e6b992');
 rect(c,-6,y+4,6,5,'#31303b');rect(c,2,y+4,6,5,'#31303b');rect(c,0,y+5,2,1,'#c6bacd');rect(c,-5,y+5,4,2,'#b7d6d4');rect(c,3,y+5,4,2,'#c6dfde');rect(c,9,y+9,3,2,'#454054');
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
export function dimillian(c:CanvasRenderingContext2D,x:number,y:number,face:number,time:number,moving:boolean,kind:number,angle:number,attack=0,charge=0,thrust=false,overdrive=false,scale=1,batAngle?:number,batLength=29,swing?:SwordPose){
 c.save();c.translate(Math.round(x+10*scale),Math.round(y));c.scale(face*scale,scale);
 const step=moving?Math.sin(time*22)*3:0;
 if(kind===2){
  c.save();c.translate(0,21);c.rotate(moving?Math.sin(time*7)*.045:Math.sin(time*2)*.025);
  const flame=(thrust?20:8)+(overdrive?12:0)+Math.sin(time*45)*3;
  for(const yy of [-4,8]){rect(c,-25-flame,yy,flame,5,'#7c79df');rect(c,-23-flame*.6,yy+1,flame*.6,3,'#b6f6ff');}
  c.fillStyle='#433653';c.beginPath();c.moveTo(-23,-15);c.lineTo(22,0);c.lineTo(-25,20);c.lineTo(-13,2);c.closePath();c.fill();
  c.fillStyle='#d6c6a7';c.beginPath();c.moveTo(-20,-7);c.lineTo(29,0);c.lineTo(16,8);c.lineTo(-23,10);c.closePath();c.fill();
  rect(c,-16,-7,25,5,'#f6e4c1');rect(c,-20,8,31,3,'#9485a2');rect(c,-6,-8,14,8,'#28737b');rect(c,-4,-8,9,2,'#9ed8d8');rect(c,-25,1,6,8,'#595264');
  if(overdrive){rect(c,-20,-15,26,4,'#b3a1d8');rect(c,-20,16,26,4,'#b3a1d8');}
  c.restore();rect(c,-7,9,13,12,'#80719c');head(c,-5);
  c.save();c.translate(5,21);c.rotate(angle);for(const yy of [-7,6]){rect(c,1,yy,19,4,'#ddd1b9');rect(c,13,yy,8,2,'#8bacc2');if(attack>0)rect(c,22,yy-2,8+attack*25,6,'#b5f7ff');}c.restore();
 }else{
  const pose=swordPose(kind===0?swing:undefined);
  if(kind===0&&swing){
   // Bent rear knee and planted leading boot make the weight transfer visible.
   rect(c,-7-pose.stride*.5,24+pose.crouch,7,5,'#39424e');rect(c,-8-pose.stride,27,5,5,'#39424e');rect(c,-10-pose.stride,30,10,3,'#c8c9ce');
   rect(c,2+pose.lunge*.5,24+pose.crouch,6+pose.stride*.5,5,'#4c5061');rect(c,5+pose.stride,27,5,5,'#4c5061');rect(c,4+pose.stride,30,11,3,'#b4b6c2');
  }else{rect(c,-6,24,5,7+step,'#39424e');rect(c,3,24,5,7-step,'#4c5061');rect(c,-8,30+step,9,3,'#c8c9ce');rect(c,2,30-step,9,3,'#b4b6c2');}
  c.save();c.translate(pose.lunge,24+pose.crouch);c.rotate(pose.lean);c.translate(0,-24);
  if(kind===1){
   c.fillStyle='#59416f';c.beginPath();c.moveTo(-9,12);c.lineTo(7,12);c.lineTo(13,29);c.lineTo(-13,29+step*.3);c.closePath();c.fill();
   rect(c,-8,12,17,12,'#877198');rect(c,-9,24,20,3,'#c5a979');rect(c,-2,13,3,12,'#decea6');rect(c,-10,11,5,10,'#b49b79');
  }else{rect(c,-8,12,17,14,'#68547f');rect(c,-8,12,6,9,'#887199');rect(c,-1,14,6,2,'#bda4d1');}
  c.save();c.translate(-pose.twist*.35,-Math.abs(pose.twist)*.3);head(c);c.restore();
  c.save();c.translate(-pose.twist,pose.twist*.5);rect(c,-12,17,5,9,'#d8ad87');rect(c,-15,15,6,9,'#242638');rect(c,-14,16,4,6,'#b8a0ee');c.restore();
  let bladeAngle=batAngle??-1.05;
  if(kind===0&&swing){
   const ease=(t:number)=>t*t*(3-2*t);
   if(swing.age<swing.windup){const t=ease(swing.age/swing.windup);bladeAngle=-1.05+(bladeAngle+1.05)*t;}
   else if(swing.age>swing.windup+swing.active){const t=ease(Math.min(1,(swing.age-swing.windup-swing.active)/(swing.duration-swing.windup-swing.active)));const delta=Math.atan2(Math.sin(-1.05-bladeAngle),Math.cos(-1.05-bladeAngle));bladeAngle+=delta*t;}
  }
  c.save();c.translate(7,18);c.rotate(kind===0?bladeAngle-pose.lean:angle);rect(c,-2,-2,10,5,'#d8ad87');
  if(kind===0){rect(c,6,-3,8,6,'#d8ad87');baguette(c,batLength,batLength>90?13:7);}
  else{rect(c,7,-20,4,40,'#b18e60');rect(c,5,-22,8,6,'#e4d09a');rect(c,6,-25,6,5,'#bdeef8');
   const r=4+charge*12+Math.sin(time*24)*charge;c.fillStyle='#f07835';c.beginPath();c.arc(24,-8,r,0,Math.PI*2);c.fill();c.fillStyle='#ffe4a0';c.beginPath();c.arc(23,-9,r*.5,0,Math.PI*2);c.fill();c.strokeStyle=charge>=.99?'#fff7c8':'#ffb45c';c.lineWidth=1;c.beginPath();c.ellipse(24,-8,r+6,r*.5,time*3,0,Math.PI*2);c.stroke();for(let i=0;i<4;i++){const a=time*(3+i*.2)+i*1.57;rect(c,24+Math.cos(a)*(r+4),-8+Math.sin(a)*(r+4),2+charge*2,2+charge*3,i%2?'#ffb358':'#ffe4a0');}
  }c.restore();c.restore();
 }
 c.restore();
}
export function dimillianPortrait(c:CanvasRenderingContext2D,kind:number){c.clearRect(0,0,64,64);rect(c,0,0,64,64,'#32273f');dimillian(c,12,7,1,0,false,kind,0,0,0,false,false,2);}
export function dimillianIntro(){return `${import.meta.env.BASE_URL}assets/dimillian-intro-v1.png`; }

export function sheep(c:CanvasRenderingContext2D,x:number,y:number,time:number,face:number){
 c.save();c.translate(Math.round(x+10),Math.round(y+16));c.scale(face,1);const step=Math.sin(time*10)*2;
 rect(c,-8,7,3,7+step,'#55505f');rect(c,4,7,3,7-step,'#55505f');rect(c,-12,-4,24,13,'#c9c5c8');rect(c,-14,-1,27,7,'#ece8e4');rect(c,-10,-7,18,13,'#f8f1df');rect(c,-5,-9,9,3,'#e9dffa');rect(c,7,-5,9,11,'#66616e');rect(c,9,-3,2,2,'#fff3d3');rect(c,8,-8,7,3,'#9690a0');rect(c,-17,-3,4,4,'#eee5d9');c.restore();
}

export function dimillianSeated(c:CanvasRenderingContext2D,x:number,y:number,face:number,time:number){
 c.save();c.translate(x+10,y);c.scale(face,1);rect(c,-9,13,18,12,'#735986');rect(c,-8,24,18,5,'#494257');rect(c,5,27,8,4,'#c8bed1');head(c);rect(c,-12,17,9,4,'#d6a681');rect(c,-15,12,6,9,'#202131');rect(c,-14,13,4,6,'#c4a1ef');rect(c,7,19,8,4,'#d6a681');c.restore();
}
