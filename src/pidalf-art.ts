import { rect,text } from './art';
export const PI_COLOR='#efc47f';
// The hand, shoulders, feet and cloak share one pose curve: anticipation,
// fast contact and a slower recovery, rather than an isolated weapon swing.
export function pidalf(c:CanvasRenderingContext2D,x:number,y:number,face:number,time:number,moving:boolean,angle:number,slap=0,holding=false,casting=0,scale=1,power=0,ward=0){
 c.save();c.translate(Math.round(x+10),Math.round(y+17));c.scale(face*scale,scale);
 const charge=ward>0?Math.min(1,ward/.35):0,slam=ward>.35?Math.sin(Math.min(1,(ward-.35)/.3)*Math.PI):0;
 const squeeze=casting>0?Math.min(1,casting):0,recovery=casting>1?Math.max(0,1-(casting-1)/.3):0;
 const drawBack=casting>0&&casting<=1?Math.sin(squeeze*Math.PI/2):0,crunch=casting>1?recovery:0;
 const fist=casting>1?recovery:Math.max(0,Math.min(1,(squeeze-.22)/.58));
 const step=moving?Math.sin(time*15)*3:0,hit=slap>0?(slap<.27?-Math.sin(slap/.27*Math.PI/2):Math.sin(Math.min(1,(slap-.27)/.73)*Math.PI)*1.4):0;
 rect(c,-8,10,6,7+step,'#242830');rect(c,3,10,6,7-step,'#242830');rect(c,-10,16+step,9,3,'#171c24');rect(c,3,16-step,10,3,'#171c24');
 c.save();c.translate(hit*3+slam*3-drawBack*3+crunch*3,-Math.abs(hit)+slam*2+drawBack*2-crunch);c.rotate(hit*.12-charge*.08+slam*.2-drawBack*.15+crunch*.13);
 const lift=ward>0?(ward<.35?Math.sin(ward/.35*Math.PI/2)*24:ward<.44?24*(1-(ward-.35)/.09):-4*Math.max(0,1-(ward-.44)/.56)):0;
 // Draw the reaching arm on the far side, before the cloak and chest.
 const drawArm=()=>{
 const aim=Math.max(-1.15,Math.min(1.15,angle));
 const sweep=slap<.27?-slap/.27*.95:slap<.5?-.95+(slap-.27)/.23*1.35:.4-(slap-.5)/.5*.15;
 const a=holding||casting>0?aim:slap>0?Math.max(-1.3,Math.min(1.1,aim+sweep)):aim*.3+.8;
 c.save();c.translate(6,-4);if(ward>0){const hx=-16+charge*12,hy=4-lift;c.rotate(Math.atan2(hy,hx));const reach=Math.hypot(hx,hy);rect(c,0,-3,reach,6,'#90968f');rect(c,reach-2,-4,6,7,'#e1ba98');c.restore();return;}c.rotate(a-drawBack*.18+crunch*.12);
 const reach=holding||casting?15-drawBack*4+crunch*2:11,hand=reach+1;
 rect(c,-2,-4,7,8,'#959a93');rect(c,0,-3,reach,6,'#777c79');rect(c,reach-2,-3,6,6,'#e1ba98');
 if(holding||casting){
  // Open fingers curl into a tight fist in sync with the distant metal press.
  const spread=1-fist;rect(c,hand+2,-3-spread*3,3,6+spread*5,'#e9c3a0');rect(c,hand-1,-4-spread*3,3,3,'#e9c3a0');
  if(fist>.5){rect(c,hand+2,-2,3,1,'#c08e6c');rect(c,hand+2,1,3,1,'#c08e6c');}
  c.save();c.globalAlpha=.16+fist*.24;rect(c,hand+1,-6,7,12,PI_COLOR);c.globalAlpha=.55;
  for(let i=0;i<3;i++){const phase=(time*1.4+i/3)%1,r=8-phase*(casting?5:2);rect(c,hand+4+Math.cos(i*2.1+time)*r,Math.sin(i*2.1+time)*r,1.5,1.5,'#ffe9ba');}c.restore();
 }c.restore();
 };
 if(ward<=0)drawArm();
 const tail=Math.sin(time*6)*2+hit*7+slam*12+drawBack*5-crunch*7;
 c.fillStyle='#303740';c.beginPath();c.moveTo(-9,-10);c.lineTo(-17-tail,16);c.lineTo(-1,12);c.lineTo(13,15);c.lineTo(10,-10);c.fill();
 rect(c,-9,-7,18,19,'#555b61');rect(c,-9,-5,8,20,'#353e48');rect(c,-7,-7,3,18,'#49535c');rect(c,1,-6,8,18,'#969b91');rect(c,2,-3,5,13,'#a5a698');rect(c,8,-5,2,16,'#737c78');rect(c,-7,6,15,3,'#282c33');rect(c,0,6,3,3,PI_COLOR);
 // Tied-back hair and short beard leave the round glasses legible.
 rect(c,-9,-23,17,8,'#514f4d');rect(c,-11,-19,6,10,'#8b8880');rect(c,-13,-15,5,6,'#5f605e');rect(c,-7,-21,15,15,'#d5ad8b');rect(c,-8,-23,15,5,'#666762');rect(c,-6,-24,10,2,'#aba79b');rect(c,-6,-9,12,5,'#777873');rect(c,-3,-8,6,2,'#bcb3a0');rect(c,7,-13,2,3,'#dfb997');rect(c,0,-9,5,1,'#e8d4b8');rect(c,-8,-15,3,5,'#ba9479');
 c.strokeStyle='#222a32';c.lineWidth=1.5;for(const xx of [-3,5]){c.beginPath();c.arc(xx,-15,3.3,0,Math.PI*2);c.stroke();}rect(c,-8,-17,2,1,'#252a30');rect(c,0,-16,2,1,'#252a30');rect(c,-2,-15,1,1,'#343a3b');rect(c,6,-15,1,1,'#343a3b');

 c.save();c.translate(ward>0?charge*12:0,-lift);c.rotate(ward>0?-.16*(1-slam):0);
 // Staff rises with both hands, then drives into the ground ahead of his stance.
 rect(c,-13,-9,3,33,'#372f2a');rect(c,-12,-9,1,29,'#a19173');rect(c,-17,-18,11,3,ward>0?'#fff0c5':PI_COLOR);rect(c,-15,-16,2,7+power*2,PI_COLOR);rect(c,-9,-16,2,7+power*2,PI_COLOR);rect(c,-14,0,5,5,'#cda383');
 if(ward>0){rect(c,-19,-20,15,1,'#ffe4a4');rect(c,-16,-23,2,4,'#fff0c5');}c.restore();

 if(ward>0)drawArm();
 c.restore();c.restore();
}
export function pidalfPortrait(c:CanvasRenderingContext2D){c.clearRect(0,0,64,64);rect(c,0,0,64,64,'#302e2a');pidalf(c,13,23,1,0,false,0,0,false,0,1.7);text(c,'π',53,18,PI_COLOR,15,'center');}
