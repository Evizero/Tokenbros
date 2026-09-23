import { World, TILE, COLS, ROWS } from './world';
export const W=960,H=540;
export const palette={acid:'#d5ff60',ink:'#131619',orange:'#ffad48',red:'#fa6b4a'};
export function rect(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,color:string) {c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
// The neck stays planted while the face, hair and headwear turn together.
// Aim is already relative to the character's facing direction.
export function withHeadTilt(c:CanvasRenderingContext2D,x:number,y:number,aim:number,draw:(gaze:number)=>void){
  // Eyes cover small aim changes first; the neck only follows larger glances.
  const pitch=Math.sign(aim)*Math.min(Math.PI/7,Math.max(0,Math.abs(aim)-.22)*.34);
  const gaze=Math.max(-1,Math.min(1,(aim-pitch)/.4));
  c.save();c.translate(x,y);c.rotate(pitch);c.translate(-x,-y);draw(gaze);c.restore();
}
export function text(c:CanvasRenderingContext2D,s:string,x:number,y:number,color='#c9ced5',size=10,align:CanvasTextAlign='left') {c.fillStyle=color;c.font=`bold ${size}px monospace`;c.textAlign=align;c.fillText(s,Math.round(x),Math.round(y));c.textAlign='left';}
const hash=(x:number)=>{const a=Math.sin(x*127.1+311.7)*43758.5453;return a-Math.floor(a);};
function pine(c:CanvasRenderingContext2D,x:number,base:number,h:number,color:string) {
  rect(c,x-2,base-h,4,h,color);c.fillStyle=color;
  for(let i=0;i<5;i++){const y=base-h+i*h*.14,w=h*(.09+i*.032);c.beginPath();c.moveTo(Math.round(x),Math.round(y));c.lineTo(Math.round(x+w),Math.round(y+h*.36));c.lineTo(Math.round(x-w),Math.round(y+h*.36));c.fill();}
}
export function background(c:CanvasRenderingContext2D,cam:number,time:number) {
  const sky=c.createLinearGradient(0,0,0,430);sky.addColorStop(0,'#183b41');sky.addColorStop(.65,'#545e6d');sky.addColorStop(1,'#7a8491');c.fillStyle=sky;c.fillRect(0,0,W,H);
  rect(c,720-cam*.035,63,61,61,'#959fae');rect(c,716-cam*.035,78,70,31,'#959fae');
  for(let layer=0;layer<3;layer++){
    c.fillStyle=['#3f4752','#373e47','#2f353d'][layer];c.beginPath();c.moveTo(0,420);
    const off=cam*(.07+layer*.06);
    for(let x=-200;x<W+300;x+=80)c.lineTo(x-off%160,190+layer*48-hash(Math.floor(x/80)+layer*9)*95);
    c.lineTo(W+300,540);c.closePath();c.fill();
  }
  for(let i=-2;i<28;i++){const x=i*90-(cam*.24)%90;pine(c,x,430,90+hash(i+Math.floor(cam*.24/90))*160,'#2c323a');}
  // Distant computing infrastructure, cooling towers, moving vapor.
  for(let i=-1;i<9;i++){
    const x=i*230-(cam*.38)%230,h=90+hash(i+Math.floor(cam*.38/230))*130;
    rect(c,x,420-h,100,h,'#2f343c');rect(c,x-4,420-h,108,5,'#566170');
    for(let a=0;a<6;a++)for(let b=0;b<4;b++)rect(c,x+8+a*15,432-h+b*19,5,2,b===1?'#7b8696':'#434c58');
    rect(c,x+23,370-h,10,50,'#353b44');rect(c,x+67,354-h,13,68,'#353b44');
    c.globalAlpha=.12;for(let s=0;s<3;s++)rect(c,x+15+s*8+Math.sin(time*.5+i)*12,320-h-s*15,20+s*9,30,'#a7afbb');c.globalAlpha=1;
  }
  // Overhead wires emphasize depth without competing with combat.
  c.strokeStyle='#282d33';c.lineWidth=2;
  for(let i=0;i<12;i++){const x=i*340-cam*.7;rect(c,x,175,7,245,'#2c3138');rect(c,x-17,173,44,5,'#363d46');c.beginPath();c.moveTo(x,179);c.quadraticCurveTo(x+170,220,x+340,179);c.stroke();}
  for(let i=0;i<23;i++){const x=(i*83+time*(2+i%3)-cam*.12)%W,y=130+(i*47)%230;rect(c,x,y,2,2,'#959fad44');}
}
export function scenery(c:CanvasRenderingContext2D,cam:number,time:number,accent='#c5ccd5',showHints=true) {
  for(const [x,w,h] of [[380,330,142],[1020,360,180],[1730,310,146],[2540,470,176],[3360,460,190]]){
    const sx=x-cam;if(sx>W+100||sx+w<-100)continue;
    rect(c,sx,420-h,w,h,'#21252b');rect(c,sx,420-h,w,6,'#4e5763');rect(c,sx+5,426-h,w-10,5,'#2c3138');
    for(let i=0;i<w;i+=42){rect(c,sx+i,428-h,2,h-8,'#353b44');rect(c,sx+i+7,435-h,27,38,'#1b1f24');rect(c,sx+i+9,438-h,23,2,'#7683963b');}
    for(let i=0;i<3;i++){rect(c,sx+w-63,446-h+i*25,39,15,'#313740');for(let j=0;j<5;j++)rect(c,sx+w-59+j*7,450-h+i*25,3,3,(i+j)%3===0?'#8f9aa9':'#4f5967');}
    rect(c,sx+15,401,100,19,'#191c20');for(let i=0;i<10;i++)rect(c,sx+18+i*9,405,4,12,i%2?'#a8a369':'#323942');
    rect(c,sx+w-90,410,70,8,'#4b5461');
  }
  // Exposed pipes and ladders are decoration, not ambiguous platforms.
  for(const x of [430,1080,1830,2770]){const sx=x-cam;rect(c,sx,315,6,105,'#404852');rect(c,sx+20,315,4,105,'#404852');for(let y=322;y<420;y+=13)rect(c,sx,y,24,3,'#4d5663');}
  if(showHints)refinerySigns(c,cam,time);
  for(const x of [770,1530,2260,3080]){const sx=x-cam;rect(c,sx,361,40,59,'#2d323a');rect(c,sx+5,367,30,22,'#191c21');for(let i=0;i<4;i++)rect(c,sx+9+i*6,373,3,5,(Math.floor(time*3)+i)%4===0?accent:'#576170');rect(c,sx+4,398,32,3,'#4f5966');rect(c,sx+16,343,6,18,'#505a68');}
}
export function refinerySigns(c:CanvasRenderingContext2D,cam:number,time:number){
  // Tutorial copy belongs to refinery advertising and wayfinding hardware.
  // The supports are scenery, visibly behind the collision platforms.
  const signs:{x:number;y:number;foot:number;kind:'billboard'|'banner'|'plate';title:string;copy:string}[]=[
    {x:155,y:352,foot:420,kind:'billboard',title:'01 / LIVE FIRE',copy:'CLICK FIRE / SPACE JUMP'},
    {x:505,y:231,foot:278,kind:'billboard',title:'BREAK THE RULES',copy:'MARKED CRATES = BREAKABLE'},
    {x:1010,y:320,foot:420,kind:'banner',title:'UPLINK TOWER ↑',copy:'W / S TO CLIMB LADDERS'},
    {x:1110,y:100,foot:200,kind:'plate',title:'KEEP CLIMBING ↑',copy:'SHIELDS: FLANK OR RESET'},
    {x:1590,y:-192,foot:-120,kind:'billboard',title:'UPLINK 01',copy:'OVERRIDE THE TERMINAL'},
    {x:1730,y:-248,foot:-120,kind:'banner',title:'CABLE CROSSING →',copy:'JUMP + HOLD UP TO GRAB'},
    {x:2560,y:310,foot:420,kind:'plate',title:'SECOND FEED ↑',copy:'GRENADES GO OVER COVER'},
    {x:2790,y:85,foot:240,kind:'banner',title:'UPLINK 02',copy:'OVERRIDE THE TERMINAL'},
    {x:3460,y:194,foot:230,kind:'billboard',title:'RATE LIMITER',copy:'429 / TOO MANY REQUESTS'}
  ];
  for(const sign of signs)if(sign.x-cam>-220&&sign.x-cam<W)refinerySign(c,sign.x-cam,sign.y,sign.foot,sign.kind,sign.title,sign.copy,time);
}

// World-mounted, pixel-built signs: poles, brackets, bolts and fabric. The
// text remains readable, but no graphic uses a UI accent stripe or hover box.
function refinerySign(c:CanvasRenderingContext2D,x:number,y:number,foot:number,kind:'billboard'|'banner'|'plate',title:string,copy:string,time:number){
 const top=y-24,w=198,h=54;
 if(kind==='billboard'){
  for(const dx of [23,w-29]){rect(c,x+dx,top+h,7,foot-top-h,'#383f48');rect(c,x+dx+1,top+h,2,foot-top-h,'#717980');rect(c,x+dx-5,foot-3,17,3,'#555c63');}
  c.strokeStyle='#49525d';c.lineWidth=3;c.beginPath();c.moveTo(x+27,top+h+3);c.lineTo(x+w-27,foot-5);c.moveTo(x+w-26,top+h+3);c.lineTo(x+27,foot-5);c.stroke();
  rect(c,x-3,top-3,w+6,h+6,'#363d45');rect(c,x-3,top-3,w+6,3,'#a0a296');rect(c,x,top,w,h,'#5e6868');rect(c,x+4,top+4,w-8,h-8,'#48575b');
  rect(c,x+8,top+8,w-16,1,'#9baba166');rect(c,x+10,top+h-7,38,2,'#344347');rect(c,x+w-41,top+h-10,29,1,'#7c8e8a');
  for(const dx of [4,w-7])for(const dy of [4,h-7]){rect(c,x+dx,top+dy,3,3,'#c0beb0');rect(c,x+dx+1,top+dy+1,1,1,'#515961');}
  for(const dx of [35,w-47]){rect(c,x+dx,top-13,3,11,'#525b61');rect(c,x+dx-5,top-14,17,4,'#262d35');rect(c,x+dx-3,top-10,13,2,'#d7ca9c');}
  text(c,title,x+w/2,top+24,'#e5ddc1',11,'center');text(c,copy,x+w/2,top+41,'#c2c9bd',7,'center');
 }else if(kind==='banner'){
  rect(c,x-7,top-15,6,foot-top+15,'#343d47');rect(c,x-6,top-15,2,foot-top+15,'#7a858c');rect(c,x-12,foot-3,17,3,'#59626a');rect(c,x-9,top-17,w+21,5,'#64717a');
  for(const dx of [9,w-12]){rect(c,x+dx,top-12,2,16,'#bbb198');rect(c,x+dx-1,top-13,4,2,'#363f48');}
  const sway=Math.round(Math.sin(time*1.7+x*.02)*2);c.fillStyle='#716052';c.beginPath();c.moveTo(x,top);c.lineTo(x+w,top);c.lineTo(x+w+sway,top+h-2);c.lineTo(x+w-12+sway,top+h-5);c.lineTo(x+w-17+sway,top+h+2);c.lineTo(x+w-68+sway,top+h-1);c.lineTo(x+w-120+sway,top+h+2);c.lineTo(x+sway,top+h-3);c.closePath();c.fill();
  rect(c,x,top,w,3,'#a28b6c');rect(c,x+10,top+8,w-20,1,'#bbaa8655');rect(c,x+11,top+h-11,w-22,1,'#bbaa8666');
  for(const dx of [9,w-12]){rect(c,x+dx-1,top+3,4,4,'#302f31');rect(c,x+dx,top+3,2,2,'#bbaa83');}
  text(c,title,x+w/2,top+25,'#f1e4bf',11,'center');text(c,copy,x+w/2,top+40,'#d6c7a8',7,'center');
 }else{
  for(const dx of [16,w-20]){rect(c,x+dx,top-10,5,foot-top+10,'#39434c');rect(c,x+dx+1,top-10,1,foot-top+10,'#646e76');}
  rect(c,x-2,top+3,w+4,h-6,'#313942');rect(c,x+3,top,w-6,h,'#7d8276');rect(c,x+3,top+2,w-6,2,'#b4b29b');rect(c,x+6,top+6,w-12,h-12,'#747d73');
  for(const dx of [8,w-11])for(const dy of [8,h-11]){rect(c,x+dx,top+dy,3,3,'#303d41');rect(c,x+dx,top+dy,2,1,'#c4c0a5');}
  rect(c,x+19,top+h-8,23,2,'#57665e');rect(c,x+w-48,top+8,17,1,'#a8a892');
  text(c,title,x+w/2,top+25,'#182e33',11,'center');text(c,copy,x+w/2,top+41,'#223b3d',7,'center');
 }
}
export function terrain(c:CanvasRenderingContext2D,world:World,cam:number) {
  for(let x=Math.max(0,Math.floor(cam/TILE));x<Math.min(COLS,Math.ceil((cam+W)/TILE));x++)for(let y=0;y<ROWS;y++){
    const b=world.get(x,y);if(!b)continue;const sx=x*TILE-cam,sy=y*TILE;
    if(b.kind===1){
      rect(c,sx,sy,TILE,TILE,b.seed>.5?'#2a2f37':'#272c33');
      rect(c,sx+2+b.seed*9,sy+4+b.seed*6,4,3,'#3c444e');rect(c,sx+14,sy+14,3,2,'#1f2329');
      if(!world.get(x,y-1)){rect(c,sx,sy,TILE,3,'#6d7b8e');rect(c,sx+3,sy+3,8,3,'#4a535f');rect(c,sx+16,sy-3,2,4,'#717e91');}
      if(!world.get(x-1,y))rect(c,sx,sy,2,TILE,'#48515d');
    }else if(b.kind===2){
      rect(c,sx,sy,20,20,'#65594e');rect(c,sx+1,sy+1,18,2,'#b9a485');rect(c,sx+1,sy+3,2,15,'#8d7c65');rect(c,sx+17,sy+3,2,16,'#39332f');rect(c,sx+5,sy+6,10,8,'#484039');rect(c,sx+7,sy+8,6,2,'#d1b78b');
      if(b.hp<4){rect(c,sx+8,sy+2,2,7,'#20242a');rect(c,sx+10,sy+8,2,6,'#20242a');}
    }else if(b.kind===5){
      rect(c,sx,sy,20,20,'#4b4540');rect(c,sx,sy,20,3,'#b99b73');rect(c,sx+2,sy+5,16,3,'#776751');rect(c,sx+2,sy+12,16,3,'#665844');
      rect(c,sx+2,sy+1,3,2,'#e0c181');rect(c,sx+12,sy+1,3,2,'#e0c181');if(b.hp<3){rect(c,sx+10,sy+3,2,14,'#171c24');}
    }else if(b.kind===4){
      rect(c,sx,sy,20,20,'#292e31');rect(c,sx+3,sy,14,20,'#fa996533');rect(c,sx+6,sy+2,3,16,'#ffb97f');rect(c,sx+12,sy+2,2,16,'#ad684b');
    }else{
      rect(c,sx,sy,20,20,y>=47?'#1e2227':'#3a424c');rect(c,sx,sy,20,3,'#7d848e');rect(c,sx+2,sy+4,16,12,'#2b3038');rect(c,sx+3,sy+5,2,2,'#9aa4b1');rect(c,sx+15,sy+14,2,2,'#767d87');
      if(y<43){rect(c,sx+6,sy+4,3,12,'#6a7380');rect(c,sx+11,sy+4,3,12,'#464e59');}
    }
  }
}
export function tibo(c:CanvasRenderingContext2D,x:number,y:number,face:number,time:number,moving:boolean,boost:boolean,shoot:number,angle:number,scale=1,tier=0,dry=0,brawl=0) {
  c.save();c.translate(Math.round(x+10*scale),Math.round(y));c.scale(face*scale,scale);
  const step=moving?Math.sin(time*23)*3:0,bob=moving?Math.abs(step)*.35:Math.sin(time*3)*.35;
  rect(c,-8,31,19,3,'#061a1488');rect(c,-6,23,5,8+step,'#121d21');rect(c,3,23,5,8-step,'#243033');rect(c,-7,30+step,8,3,'#728379');rect(c,2,30-step,9,3,'#9ba699');
  rect(c,-8,12+bob,17,13,'#111c1f');rect(c,-9,11+bob,7,9,'#344147');rect(c,-6,12+bob,13,2,'#3f4a49');rect(c,-3,14+bob,2,9,'#52605b');rect(c,4,13+bob,1,7,'#a0aca1');
  rect(c,-12,14+bob,5,10,boost?'#c8f47b':'#576d43');rect(c,-12,15+bob,2,7,boost?'#efffb3':'#9db46c');
  withHeadTilt(c,0,12+bob,angle,(gaze)=>{
  rect(c,-5,2+bob,12,11,'#c99371');rect(c,-6,5+bob,3,5,'#ae795c');rect(c,3,9+bob,6,3,'#926e5a');rect(c,6,6+bob,3,3,'#ddb08b');rect(c,4,5+bob+gaze,2,2,'#182a24');
  rect(c,-6,bob,12,4,'#48372f');rect(c,-7,3+bob,4,5,'#5e4335');rect(c,-4,bob,7,2,'#78523b');
  if(boost){rect(c,-4,-2+bob,3,3,'#5d412e');rect(c,1,-1+bob,4,2,'#79543b');rect(c,3,9+bob,5,2,'#f1e5ca');}
  else {rect(c,-2,2+bob,4,4,'#684a39');rect(c,3,2+bob,2,4,'#644433');rect(c,-7,6+bob,3,5,'#4e3b31');rect(c,1,11+bob,6,1,'#745848');rect(c,3,4+bob,3,1,'#4b352c');}
  });
  if(brawl){
    c.save();c.translate(5,17+bob);c.rotate(brawl===1?-.3:brawl===2?-1:brawl===3?-.55:0);
    const reach=brawl===1||brawl===3?20:brawl===2?13:9;
    rect(c,-2,-3,reach,6,'#b9a184');rect(c,reach-3,-5,9,10,'#e6bd94');rect(c,reach-2,-5,7,2,'#fff0d1');
    rect(c,-10,1,8,5,'#c99c78');rect(c,-14,0,6,7,'#e6bd94');c.restore();c.restore();return;
  }
  c.save();c.translate(6,17+bob);c.rotate(angle+(dry>0?Math.sin(dry/.16*Math.PI)*.1:0));if(dry>0)c.translate(-Math.sin(dry/.16*Math.PI)*3,0);rect(c,-3,-1,8,4,'#bb9575');const kick=shoot>0?2:0;
  const color=['#d5ff60','#83dae9','#ffc183'][tier],tip=tier===2?41:tier===1?30:25;
  if(tier===0){
    rect(c,2-kick,-4,14,8,'#52635d');rect(c,6-kick,-3,10,3,color);rect(c,13-kick,3,5,7,'#293b3c');rect(c,14-kick,-2,11,4,'#26393b');rect(c,23-kick,-3,3,6,'#91a494');
  }else if(tier===1){
    rect(c,1-kick,-6,18,12,'#3a5969');rect(c,5-kick,-5,10,10,'#bbd6d6');rect(c,8-kick,-3,6,6,color);
    rect(c,17-kick,-6,14,3,'#82a9b8');rect(c,17-kick,3,14,3,'#82a9b8');rect(c,21-kick,-2,6,4,color);rect(c,3-kick,6,7,4,'#263c4b');
  }else{
    rect(c,-1-kick,-5,23,10,'#6b6260');rect(c,1-kick,-7,12,3,'#a59c8a');rect(c,6-kick,-2,13,3,color);
    rect(c,19-kick,-5,23,3,'#b7b6aa');rect(c,19-kick,3,23,3,'#b7b6aa');rect(c,20-kick,-1,20,2,color);rect(c,31-kick,-7,3,14,'#b6a282');rect(c,8-kick,4,6,7,'#403e3a');
  }
  if(dry>0){const drop=Math.sin(dry/.16*Math.PI)*5;rect(c,8,9+drop,5,7,'#a9a89d');rect(c,9,10+drop,3,5,'#29343c');rect(c,tip-1,-2,3,4,'#ffae79');}
  if(shoot>0){rect(c,tip+2,-4,7,8,'#ffe9a1');rect(c,tip+8,-2,tier===2?16:8,4,color);rect(c,tip+1,-8,3,16,color);}c.restore();c.restore();
}
// Free hand grips the physical wall independently of the weapon's aim direction.
export function wallGripPose(c:CanvasRenderingContext2D,x:number,y:number,side:number,time:number,sleeve:string){
  c.save();c.translate(Math.round(x+10),Math.round(y));c.scale(side,1);
  const grip=Math.floor(time*4)%2;
  rect(c,1,10,6,8,sleeve);rect(c,4,6,5,8,'#c99b79');rect(c,7,-1+grip,3,10,'#dfb18d');rect(c,7,-4+grip,5,5,'#efd1ab');rect(c,10,-3+grip,2,3,'#b98666');
  // Bent knee and planted toe, with the other leg hanging below.
  rect(c,2,22,8,5,'#263744');rect(c,7,24,4,5,'#344957');rect(c,7,27,6,3,'#bcc8b6');
  c.restore();
}
export function portrait(c:CanvasRenderingContext2D,boost:boolean,usage:number) {
  c.clearRect(0,0,64,64);rect(c,0,0,64,64,boost?'#a3c96a':'#223a30');
  for(let i=0;i<6;i++)rect(c,0,i*12,64,1,boost?'#b6d57d':'#2d4937');
  rect(c,10,45,44,19,'#172125');rect(c,16,41,32,12,'#263437');rect(c,20,46,24,8,'#0e1e22');rect(c,23,14,25,29,'#cd9978');rect(c,18,23,8,13,'#b57d60');rect(c,25,38,19,7,'#9d735e');rect(c,43,28,7,6,'#e2b18a');
  rect(c,19,10,29,9,'#523e31');rect(c,16,17,10,15,'#634532');rect(c,20,10,14,4,'#816044');rect(c,28,25,5,3,'#29382f');rect(c,41,24,4,3,'#29382f');
  if(boost){rect(c,24,6,7,7,'#6c4b34');rect(c,35,7,9,6,'#785438');rect(c,30,35,14,4,'#fff4d9');rect(c,31,39,11,2,'#936250');rect(c,53,9,2,10,'#efffbc');rect(c,49,13,10,2,'#efffbc');}
  else{rect(c,28,17,9,5,'#725139');rect(c,37,18,6,5,'#604333');rect(c,31,36,12,2,'#765545');if(usage<35){rect(c,28,29,7,2,'#a6765f');rect(c,40,28,6,2,'#a6765f');rect(c,45,40,2,5,'#82b8a9');}}
  rect(c,19,51,3,12,'#677970');rect(c,43,51,3,12,'#677970');
}
export function robot(c:CanvasRenderingContext2D,x:number,y:number,type:string,face:number,time:number,windup:number,hurt:number,shield=0,hacked=0) {
  if(type==='drone'){
    rect(c,x-7,y+8,36,5,'#445f5b');rect(c,x+1,y+3,20,14,'#719183');rect(c,x+5,y+7,12,5,windup>0?'#ffdf84':'#fa7a58');
    rect(c,x-12,y+1,17,2,'#b1cbb4');rect(c,x+19,y+1,17,2,'#b1cbb4');rect(c,x-7,y-3+Math.sin(time*40)*2,8,1,'#ddedd0');rect(c,x+24,y-3+Math.sin(time*40)*2,8,1,'#ddedd0');rect(c,x+8,y+17,6,5,'#405f52');return;
  }
  if(hurt>0){c.globalAlpha=.6;}
  c.save();c.translate(Math.round(x+10),Math.round(y));c.scale(face,1);
  const color=type==='runner'?'#a16843':'#687a66';
  rect(c,-8,24,6,5,'#293b33');rect(c,4,24,6,5,'#293b33');rect(c,-7,10,17,15,color);rect(c,-10,12,4,8,'#405348');rect(c,-6,0,15,11,'#80947b');rect(c,-5,3,13,5,'#172e28');rect(c,1,4,6,2,windup>0?'#fff9ae':'#ff8059');
  rect(c,-3,14,8,5,'#253e31');rect(c,-1,15,3,3,'#b0c97d');
  if(type==='runner'){rect(c,9,11,8,3,'#d4c194');rect(c,14,9,3,9,'#ff9c67');}
  else {rect(c,7,14,18,5,'#273d34');rect(c,20,13,3,7,windup>0?'#ffc96e':'#869783');}
  if(type==='shield'&&shield>0){rect(c,14,1,9,29,'#547f8c');rect(c,16,3,7,23,'#8bc4d1');rect(c,19,6,3,17,'#385864');}
  if(type==='grenadier'){rect(c,-12,5,7,20,'#a6814b');rect(c,9,10,8,8,'#d5ad60');rect(c,-10,2,4,5,'#e4c08a');}
  if(hacked>0){rect(c,-8,-5,18,2,'#d5ff60');}
  if(windup>0){rect(c,25,11,4,4,'#ffdf84');rect(c,28,12,5,2,'#fff4b2');}
  c.restore();c.globalAlpha=1;
}
