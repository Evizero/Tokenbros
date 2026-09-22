import { World, type Body } from './world.ts';
export type ResetButton=Body&{landed:boolean;age:number;slam:number;struck:boolean};
export function throwButton(x:number,y:number,angle:number):ResetButton{
  return {x:x-16,y:y-10,w:32,h:10,vx:Math.cos(angle)*265,vy:Math.sin(angle)*230-175,grounded:false,landed:false,age:0,slam:0,struck:false};
}
export function stepButton(b:ResetButton,dt:number,world:World){
  b.age+=dt;
  // Support may disappear while the hand is winding up.
  if(b.landed&&!b.struck&&!world.overlaps(b.x,b.y+1,b.w,b.h)){b.landed=false;b.slam=0;}
  if(b.landed){b.slam+=dt;return;}
  const steps=Math.max(1,Math.ceil(dt/.008));
  for(let i=0;i<steps;i++){
    const tick=dt/steps;b.vy=Math.min(720,b.vy+780*tick);const vx=b.vx;
    if(world.move(b,tick))b.vx=-vx*.25;
    if(b.grounded){b.landed=true;b.vx=0;b.slam=0;break;}
  }
}
