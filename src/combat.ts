// Weapon tuning and input geometry shared by the game and deterministic checks.
export const THINKING = [
  {name:'LOW',shot:'TOKEN SMG',power:1,cooldown:.095,cost:8,pierce:0,color:'#d5ff60',hint:'RAPID FIRE · FLANK SHIELDS'},
  {name:'MEDIUM',shot:'REASONING PULSE',power:3,cooldown:.32,cost:28,pierce:1,color:'#83dae9',hint:'STAGGER · BREAK SHIELDS'},
  {name:'HIGH',shot:'DEEP THINK RAIL',power:8,cooldown:.85,cost:72,pierce:4,color:'#ffc183',hint:'PIERCE ARMOR · LONG RECOVERY'},
] as const;
export function canvasPoint(clientX:number,clientY:number,rect:{left:number;top:number;width:number;height:number},w=960,h=540){
  const scale=Math.min(rect.width/w,rect.height/h),left=rect.left+(rect.width-w*scale)/2,top=rect.top+(rect.height-h*scale)/2;
  return {x:(clientX-left)/scale,y:(clientY-top)/scale};
}
export function shieldHit(tier:number,boost:boolean,shield:number,vx:number,vy:number,face:number){
  const frontal=shield>0&&Math.sign(vx)===-face&&Math.abs(vy)<Math.abs(vx)*.8;
  return {blocked:frontal&&!boost&&tier<2,shield:frontal&&!boost&&tier===1?Math.max(0,shield-3):shield};
}
export function thinkingWeapon(value:number){
  const v=Math.max(0,Math.min(2,value)),tier=Math.min(2,Math.floor(v*1.5));
  const lo=Math.floor(v),hi=Math.min(2,lo+1),mix=v-lo,a=THINKING[lo],b=THINKING[hi];
  const lerp=(x:number,y:number)=>x+(y-x)*mix;
  const color='#'+[1,3,5].map(i=>Math.round(lerp(parseInt(a.color.slice(i,i+2),16),parseInt(b.color.slice(i,i+2),16))).toString(16).padStart(2,'0')).join('');
  return {...THINKING[tier],tier,power:lerp(a.power,b.power),cooldown:lerp(a.cooldown,b.cooldown),cost:lerp(a.cost,b.cost),color};
}
export function thinkingScroll(delta:number,mode:number){
  // Every wheel sample contributes, including gentle movement and inertial tails.
  return -delta*(mode===1?16:mode===2?540:1)/300;
}
