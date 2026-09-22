export type ShieldPlane={x:number;y:number;angle:number;half:number};
// Swept intersection: only incoming shots crossing the front of this finite shield.
export function shieldCrossing(from:{x:number;y:number},to:{x:number;y:number},shield:ShieldPlane){
 const nx=Math.cos(shield.angle),ny=Math.sin(shield.angle);
 const a=(from.x-shield.x)*nx+(from.y-shield.y)*ny,b=(to.x-shield.x)*nx+(to.y-shield.y)*ny;
 if(a<0||b>0||a-b<=1e-8)return null;
 const t=a/(a-b),x=from.x+(to.x-from.x)*t,y=from.y+(to.y-from.y)*t;
 return Math.abs(-(x-shield.x)*ny+(y-shield.y)*nx)<=shield.half?{x,y}:null;
}
export function reflect(vx:number,vy:number,angle:number){const nx=Math.cos(angle),ny=Math.sin(angle),dot=vx*nx+vy*ny;return {vx:vx-2*dot*nx,vy:vy-2*dot*ny};}
