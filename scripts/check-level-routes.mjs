import {World,LADDERS,COLS,ROWS} from '../src/world.ts';
// Reachability with the actual movement integrator: walk, jump, fall, ladder.
// Clear breakables for the worst destruction case; never remove structural steel.
function check(demolished){
 const w=new World();for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(w.get(x,y)?.kind===2||demolished&&[1,5].includes(w.get(x,y)?.kind))w.damage(x*20+5,y*20+5,999);
 // Bedrock is the fallback after excavating the dirt surface.
 const goals=[{x:1650,y:286,gate:0},{x:2960,y:566,gate:1},{x:3490,y:828}];let start={x:90,y:828};const reports=[];
 for(const goal of goals){
  const nodes=new Map();for(let x=0;x<COLS;x++)for(let y=1;y<ROWS;y++)if(w.get(x,y)&&!w.overlaps(x*20,y*20-32,20,32))nodes.set(x+':'+y,{x:x*20,y:y*20-32});
  const key=b=>Math.round(b.x/20)+':'+Math.round((b.y+32)/20),edges=new Map();
  const nearest=b=>[...nodes.entries()].sort((a,c)=>Math.hypot(a[1].x-b.x,a[1].y-b.y)-Math.hypot(c[1].x-b.x,c[1].y-b.y))[0]?.[0];
  const visit=k=>{if(edges.has(k))return edges.get(k);const n=nodes.get(k),out=[];
   for(const dx of [-20,20]){const b={...n,x:n.x+dx};if(!w.overlaps(b.x,b.y,20,32)&&nodes.has(key(b)))out.push(key(b));}
   for(const vx of [-235,-120,0,120,235])for(const jump of [false,true]){if(!jump&&!vx)continue;const b={...n,w:20,h:32,vx,vy:jump?-520:0,grounded:false};
    for(let i=0;i<200;i++){b.vy=Math.min(660,b.vy+1400/120);w.move(b,1/120);if(i>12&&b.grounded){if(nodes.has(key(b)))out.push(key(b));break;}if(b.y>1000)break;}}
   for(const l of LADDERS)if(Math.abs(n.x+10-l.x)<22&&n.y+32>=l.top-2&&n.y+32<=l.bottom+5)for(const yy of [l.top,l.bottom]){const b={x:l.x-10,y:yy-32};if(nodes.has(key(b)))out.push(key(b));}
   edges.set(k,out);return out;
  };
  const queue=[nearest(start)],seen=new Set(queue);let reached;
  for(let head=0;head<queue.length;head++){const k=queue[head],n=nodes.get(k);if(Math.hypot(n.x-goal.x,n.y-goal.y)<100){reached=n;break;}for(const next of visit(k))if(!seen.has(next)){seen.add(next);queue.push(next);}}
  if(!reached)throw Error(`No ${demolished?'demolished':'normal'} route to ${JSON.stringify(goal)} after visiting ${seen.size} nodes`);
  reports.push({goal:goal.x,reachable:seen.size});start=reached;if(goal.gate!==undefined)w.openGate(goal.gate);
 }
 return reports;
}
console.log(JSON.stringify({normal:check(false),demolished:check(true)}));
