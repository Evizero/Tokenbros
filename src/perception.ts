export type Awareness = {
  state:'patrol'|'investigate'|'search'|'combat';
  suspicion:number;targetX:number;targetY:number;memory:number;search:number;seenAgo:number;
};
export const awareness=(x:number,y:number):Awareness=>({state:'patrol',suspicion:0,targetX:x,targetY:y,memory:0,search:0,seenAgo:99});
export const angleDelta=(a:number,b:number)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
export function turnToward(angle:number,target:number,speed:number,dt:number){return angle+Math.max(-speed*dt,Math.min(speed*dt,angleDelta(angle,target)));}
export function inView(x:number,y:number,angle:number,range:number,halfAngle:number,tx:number,ty:number){
  const dx=tx-x,dy=ty-y;return dx*dx+dy*dy<=range*range&&Math.abs(angleDelta(angle,Math.atan2(dy,dx)))<=halfAngle;
}
export function hears(x:number,y:number,nx:number,ny:number,radius:number,occluded:boolean,coverFactor=.55){return Math.hypot(nx-x,ny-y)<=radius*(occluded?coverFactor:1);}
export function hear(a:Awareness,x:number,y:number,memory=4){
  // Fresh visual confirmation takes priority over unrelated noise.
  if(a.state==='combat'&&a.seenAgo<.8)return;
  a.targetX=x;a.targetY=y;a.memory=memory;a.suspicion=Math.max(.3,a.suspicion);a.state='investigate';a.search=0;
}
export function perceive(a:Awareness,visible:boolean,x:number,y:number,dt:number){
  a.seenAgo+=dt;
  if(visible){
    a.seenAgo=0;a.targetX=x;a.targetY=y;a.memory=4;a.search=0;
    a.suspicion=Math.min(1,a.suspicion+dt/0.32);
    a.state=a.suspicion>=1?'combat':'investigate';
  }else{
    a.memory=Math.max(0,a.memory-dt);a.suspicion=Math.max(0,a.suspicion-dt*.35);
    if(a.state==='combat'){a.state='investigate';a.suspicion=Math.max(.55,a.suspicion);}
    if(a.state==='investigate'&&a.memory<=0){a.state='search';a.search=2;}
    if(a.state==='search'){a.search-=dt;if(a.search<=0){a.state='patrol';a.suspicion=0;}}
  }
}
export function reached(a:Awareness){if(a.state==='investigate'){a.state='search';a.search=2.3;}}
