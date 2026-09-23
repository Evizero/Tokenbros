import { rect,withHeadTilt,crouchLegs } from './art';
export const MARCUS_COLOR='#70e1ef';
export const AUGMENT_NAMES=['ROTATE','LCD','ZOOM','PAC-MAN'];
export const AUGMENT_COLORS=['#70e1ef','#adceff','#ffe0a1','#ffe16a'];
export function cartridgeArt(c:CanvasRenderingContext2D,x:number,y:number,mode:number,angle:number,r=7,echo=false){
 c.save();c.translate(x,y);c.rotate(angle);c.globalAlpha*=echo?.6:1;
 // Classic grey handheld cartridge: stepped shoulder, grip ribs, label and contacts.
 c.scale(r/7,r/7);
 c.fillStyle='#26333e';c.beginPath();c.moveTo(-7,-9);c.lineTo(4,-9);c.lineTo(8,-5);c.lineTo(8,9);c.lineTo(-8,9);c.lineTo(-8,-7);c.closePath();c.fill();
 c.fillStyle='#babdb5';c.beginPath();c.moveTo(-6,-8);c.lineTo(3,-8);c.lineTo(7,-4);c.lineTo(7,8);c.lineTo(-7,8);c.lineTo(-7,-6);c.closePath();c.fill();
 rect(c,-5,-7,7,1,'#e8e5d2');rect(c,-5,-5,10,1,'#737e7b');rect(c,-5,-3,10,1,'#737e7b');
 rect(c,-5,-1,10,7,'#314651');rect(c,-4,0,8,5,AUGMENT_COLORS[mode]);
 // Tiny printed pixel alien gives the sticker a game cover, rather than a plain stripe.
 rect(c,-2,1,4,2,'#263942');rect(c,-3,2,6,1,'#263942');rect(c,-2,4,1,1,'#263942');rect(c,1,4,1,1,'#263942');
 rect(c,-3,7,6,2,'#526260');for(let i=-2;i<=2;i+=2)rect(c,i,7,1,1,'#e5c577');c.restore();
}
export function marcus(c:CanvasRenderingContext2D,x:number,y:number,face:number,time:number,moving:boolean,aim:number,mode:number,launch=0,catching=0,flip=0,scale=1,charge=0,duck=false){
 c.save();c.translate(Math.round(x+10*scale),Math.round(y+17*scale));c.scale(face*scale,scale);
 const wind=charge>0?charge:launch>0&&launch<.1?launch/.1:0,recoil=launch>=.1?Math.max(0,1-(launch-.1)/.24):0;
 if(flip>0){c.rotate((1-flip/.3)*Math.PI*2);c.scale(1,.85);}else c.rotate(-wind*.28+recoil*.12-catching*.25);
 const step=moving?Math.sin(time*23)*3:0;
 if(duck){c.save();c.translate(0,-17);crouchLegs(c,time,moving,'#3d4550','#56606a','#6f5740');c.restore();}
 else {rect(c,-7,5,6,8+step,'#3d4550');rect(c,2,5,6,8-step,'#56606a');rect(c,-9,12+step,10,3,'#473d35');rect(c,1,12-step,11,3,'#6f5740');}
 if(duck)c.translate(0,-7);
 rect(c,-8,-7,17,17,'#263843');rect(c,-7,-7,5,14,'#415563');rect(c,0,-6,6,13,'#e8d9b6');rect(c,6,-7,4,16,'#192b35');
 rect(c,-8,-4,17,2,'#ae8356');rect(c,-10,3,8,8,'#93633d');rect(c,-10,3,8,2,'#d4a774');rect(c,-9,4,2,4,MARCUS_COLOR);
 withHeadTilt(c,0,-6,aim,(gaze)=>{
 if(duck)c.translate(0,8);
 // Tousled dark hair and exposed, lightly stubbled face.
 rect(c,-6,-18,13,12,'#d7ac8d');rect(c,-7,-17,3,7,'#b88971');rect(c,6,-13,4,3,'#e7ba94');
 rect(c,-7,-20,14,4,'#403d37');rect(c,-5,-23,7,4,'#565047');rect(c,1,-22,6,3,'#373b37');rect(c,-7,-17,3,4,'#51483d');rect(c,-3,-17,7,1,'#8a7660');
 rect(c,3,-14+gaze,2,2,'#23343a');rect(c,-3,-9,10,3,'#97785e');rect(c,2,-9,5,1,'#ead4b5');
 });
 c.save();c.translate(5,-2);c.rotate(charge>0&&mode===2?aim*(1-charge)-charge*1.15:aim);const reach=15+recoil*3-catching*4+(mode===2?charge*18:0);
 rect(c,0,-1,reach,4,'#c69a78');rect(c,0,-2,6,5,'#435969');
 const fork=mode===2?11+charge*7:mode===1?8:6;
 rect(c,reach,-fork,3,fork*2+6,'#aa7849');rect(c,reach-3,-fork-2,7,4,AUGMENT_COLORS[mode]);rect(c,reach-3,fork-2,7,4,AUGMENT_COLORS[mode]);
 const pull=-4-wind*9+recoil*13;c.strokeStyle='#efca78';c.lineWidth=1;c.beginPath();c.moveTo(reach,-fork);c.lineTo(pull,1);c.lineTo(reach,fork);c.stroke();
 rect(c,pull-4,0,6,4,'#e4b48b');rect(c,-6,2,Math.max(3,pull+8),3,'#b78c6e');
 if((launch<.1||catching>0)&&(charge===0||mode===1)){if(mode===3)pacmanArt(c,pull,-1,5,0,.35+Math.sin(time*10)*.15);else if(mode===2)invaderArt(c,pull,-1,time,.55);else if(mode===1){rect(c,pull-5,-6,10,12,'#c5d3b3');lcdFigure(c,pull,0,1,Math.floor(charge*2),0,.28+charge*.12);}else cartridgeArt(c,pull,-1,mode,time*2,4.5);}
 c.restore();c.restore();
}
export function marcusPortrait(c:CanvasRenderingContext2D,mode=0){c.clearRect(0,0,64,64);rect(c,0,0,64,64,'#18303c');marcus(c,12,10,1,0,false,0,mode,0,0,0,2);}

// Two-frame, eleven-pixel arcade alien silhouette, scaled in whole visible blocks.
export function invaderArt(c:CanvasRenderingContext2D,x:number,y:number,time:number,size:number,shake=0,returning=false){
 const frame=Math.floor(time*7)%2,rows=['00100000100','00010001000','00111111100','01101110110','11111111111','10111111101',frame?'10100000101':'00100000100',frame?'00011011000':'01000000010'];
 c.save();c.translate(Math.round(x+shake),Math.round(y));c.scale(size,size);
 for(let j=0;j<rows.length;j++)for(let i=0;i<11;i++)if(rows[j][i]==='1'){rect(c,i-5.5+.35,j-4+.5,1,1,'#153547');rect(c,i-5.5,j-4,1,1,returning?'#dcfaff':j<3?'#d5fbff':j<5?'#70e1ef':'#38aabe');}
 rect(c,-2.5,-1,1,1,'#152b3c');rect(c,1.5,-1,1,1,'#152b3c');c.restore();
}

// Fixed ink silhouettes emulate printed LCD segments, not interpolated sprites.
const lcdStamps=new Map<string,HTMLCanvasElement>();
function lcdStamp(pose:number,ink:string){
 const key=pose+ink,known=lcdStamps.get(key);if(known)return known;
 const canvas=document.createElement('canvas');canvas.width=76;canvas.height=76;const c=canvas.getContext('2d')!;c.translate(38,38);c.fillStyle=ink;c.strokeStyle=ink;c.lineCap='round';c.lineJoin='round';
 const oval=(x:number,y:number,rx:number,ry:number,a=0)=>{c.beginPath();c.ellipse(x,y,rx,ry,a,0,Math.PI*2);c.fill();};
 const limb=(points:number[][],width=4)=>{c.lineWidth=width;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();};
 // A single flat shape: round head, projecting nose, tiny torso, mittens and big shoes.
 oval(-2,-10,8.5,9);oval(6,-8,5,3.4,-.25);oval(-3,3,5,8,-.25);
 if(pose===0){
  limb([[-4,8],[-9,13],[-5,17]],4.5);oval(-3,17,7,3);limb([[0,9],[7,12],[6,18]],4.5);oval(10,18,7.5,3);
  limb([[-1,-1],[7,3],[12,-3]],4);oval(13,-4,4,5,-.3);limb([[-6,0],[-12,4],[-16,-1]],3.5);oval(-17,-2,3.5,4);
 }else if(pose===1){
  limb([[-5,8],[-11,10],[-8,15]],4.5);oval(-5,15,7,3,-.2);limb([[0,8],[6,6],[10,12]],4.5);oval(11,13,6,3,.2);
  limb([[0,-1],[7,-4],[11,0]],4);oval(12,0,4,4.5);limb([[-7,-1],[-12,-4]],3.5);oval(-14,-4,3.5,4);
 }else if(pose===2){
  limb([[-5,8],[-12,11],[-17,5]],5);oval(-19,4,4,7,-.5);limb([[0,7],[12,7],[16,2]],5);oval(18,2,5,10,-.18);
  limb([[0,-1],[8,-4],[12,-1]],4);oval(13,0,4,5);limb([[-7,0],[-13,-3]],3.5);oval(-14,-3,3.5,4);
 }else{
  limb([[-5,8],[-10,14],[-12,18]],5);oval(-9,18,8,3);limb([[0,8],[7,13],[11,18]],5);oval(15,18,8,3);
  limb([[0,-1],[9,-1],[15,-8]],4);oval(15,-8,4,4);limb([[15,-8],[24,-19]],3);
  c.save();c.translate(25,-20);c.rotate(.55);c.fillRect(-9,-6,18,12);c.restore();
  limb([[-7,0],[-12,5]],3.5);oval(-13,6,3.5,4);
 }
 lcdStamps.set(key,canvas);return canvas;
}
export function lcdFigure(c:CanvasRenderingContext2D,x:number,y:number,face:number,pose:number,angle=0,scale=1,ink='#17252a'){
 c.save();c.translate(Math.round(x),Math.round(y));c.scale(face*scale,scale);if(pose===2||angle)c.rotate(Math.atan2(Math.sin(angle),Math.cos(angle)*face));
 // Outline the combined silhouette, never each limb: the figure reads as one LCD segment.
 const edge=lcdStamp(pose,'#c4d0b4');for(const [dx,dy] of [[-.7,0],[.7,0],[0,-.7],[0,.7]])c.drawImage(edge,-38+dx,-38+dy);
 c.drawImage(lcdStamp(pose,ink),-38,-38);c.restore();
}

export function pacmanArt(c:CanvasRenderingContext2D,x:number,y:number,r:number,angle=0,mouth=.45){
 c.save();c.translate(x,y);c.rotate(angle);c.fillStyle='#ffe16a';c.strokeStyle='#604e26';c.lineWidth=1.5;c.beginPath();c.moveTo(0,0);c.arc(0,0,r,mouth,Math.PI*2-mouth);c.closePath();c.fill();c.stroke();
 c.fillStyle='#fff6aa';c.beginPath();c.arc(-r*.15,-r*.35,r*.28,Math.PI,Math.PI*1.7);c.lineWidth=2;c.strokeStyle='#fff6aa';c.stroke();c.fillStyle='#272d32';c.beginPath();c.arc(r*.15,-r*.52,Math.max(1,r*.12),0,Math.PI*2);c.fill();c.restore();
}
