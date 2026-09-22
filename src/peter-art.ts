import { rect,text } from './art';
export const CLAW_COLORS=['#ff8457','#78dbea','#e5bd68'];
export function claw(c:CanvasRenderingContext2D,x:number,y:number,type:number,time:number,face=1,scale=1,strike=0,windup=0){
 c.save();c.translate(Math.round(x),Math.round(y));c.scale(face*scale,scale);if(type===2)c.scale(1+strike*.22-windup*.12,1-strike*.2+windup*.14);const color=CLAW_COLORS[type],step=Math.sin(time*22)*2;
 for(let i=0;i<3;i++){rect(c,-6+i*5,4+(i%2?step:-step),2,5,'#9f4c35');}
 rect(c,-8,-4,15,10,'#633c32');rect(c,-6,-5,12,8,color);rect(c,-8,-2,3,4,'#fbd19a');rect(c,-11,0,4,3,color);rect(c,-14,-2,4,5,color);
 for(const y of [-8,4]){
  c.save();c.translate(5,y);if(type===2)c.rotate((y<0?-1:1)*(windup*.65-strike*.55));
  rect(c,0,0,type===2?13:10,type===2?7:5,color);rect(c,6,-2,type===2?8:5,3,type===2?'#ffe9af':color);rect(c,8,4,type===2?7:4,3,color);rect(c,7,1,type===2?7:4,2,'#233a34');c.restore();
 }
 rect(c,2,-6,3,4,'#fff0bb');rect(c,4,-6,2,2,'#142824');
 if(type===1){rect(c,-5,-9+step,11,2,'#c8f9f1');rect(c,-2,-12+step,9,2,'#78dbea');}
 if(type===2){rect(c,-5,-7,10,3,'#f4d990');rect(c,-2,-8,3,3,'#566c62');}
 c.restore();
}
export function peter(c:CanvasRenderingContext2D,x:number,y:number,face:number,time:number,moving:boolean,molt:boolean,punch:number,angle:number,scale=1,kind=0){
 c.save();c.translate(Math.round(x+10*scale),Math.round(y));c.scale(face*scale,scale);const step=moving?Math.sin(time*23)*3:0;
 rect(c,-7,23,6,8+step,'#233544');rect(c,3,23,6,8-step,'#314651');rect(c,-8,30+step,9,3,'#d3d8c0');rect(c,2,30-step,10,3,'#b8c7bc');
 if(molt){rect(c,-13,12,28,13,'#c99271');rect(c,-14,10,11,11,'#e0ad88');rect(c,7,10,12,11,'#e0ad88');rect(c,-8,14,17,4,'#edbb95');rect(c,-1,13,2,12,'#976449');rect(c,-6,21,14,2,'#a77050');rect(c,-12,9,5,7,'#667e98');rect(c,11,9,4,6,'#667e98');}
 else{rect(c,-9,12,19,13,'#607e9d');rect(c,-10,12,7,9,'#8aa0b4');rect(c,-5,13,13,3,'#9baec0');rect(c,6,17,2,3,'#a67653');}
 rect(c,-5,1,13,11,'#d1a27e');rect(c,-7,4,3,6,'#b88866');rect(c,6,6,4,3,'#e6b48e');
 rect(c,-6,-2,13,4,'#433a34');rect(c,-4,-4,10,3,'#52443b');rect(c,-7,2,3,3,'#8c7965');rect(c,-3,9,10,4,'#675044');rect(c,2,9,5,1,'#ead5ae');
 rect(c,-4,4,13,1,'#19282b');rect(c,-4,4,5,4,'#263d42');rect(c,3,4,6,4,'#263d42');rect(c,-3,5,3,2,'#a8c9c3');rect(c,4,5,3,2,'#b7d1c8');
 c.save();c.translate(7,17);c.rotate(angle);rect(c,-3,-1,molt?14:9,molt?7:4,'#d5a27c');
 if(molt){const reach=punch>0?23:9;rect(c,reach,-5,12,12,'#e6b58d');rect(c,reach+2,-5,9,3,'#f2cea6');}
 else{const reach=punch>0?(kind===2?32:kind===0?24:12):15;rect(c,4,-1,reach-3,4,'#d5a27c');claw(c,reach,-3,kind,time+(punch>0?.15:0),1,(kind===2?.9:.7)+(punch>0&&kind!==1?.25:0),kind===2?punch/.17:0);if(kind===1&&punch>.05){rect(c,reach+11,-6,10,5,'#bdf6ff');rect(c,reach+18,-4,6,2,'#78dbea');}}c.restore();c.restore();
}
export function peterPortrait(c:CanvasRenderingContext2D,molt:boolean,kind=0){c.clearRect(0,0,64,64);rect(c,0,0,64,64,'#243c3d');peter(c,12,4,1,0,false,molt,0,0,2,kind);}
export function terminal(c:CanvasRenderingContext2D,x:number,y:number,label:string){const width=Math.max(61,Math.ceil((label.length+2)*4.3+10));rect(c,x,y,width,26,'#102b2bea');rect(c,x,y,width,3,'#83bfa1');text(c,'> '+label,x+4,y+14,'#a9e5b9',7);rect(c,x+4,y+19,width-25,2,'#53836c');rect(c,x+width-17,y+19,8,2,'#b5efa0');}
