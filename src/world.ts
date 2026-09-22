export const TILE = 20;
export const COLS = 204;
export const ROWS = 50;
export const BASE = 440;
export const FLOOR = 860;
export const LADDERS=[
 {x:350,top:680,bottom:860},{x:570,top:600,bottom:740},{x:830,top:600,bottom:740},{x:970,top:780,bottom:940},
 {x:1130,top:720,bottom:800},{x:1150,top:640,bottom:720},{x:1190,top:560,bottom:640},{x:1330,top:480,bottom:560},{x:1470,top:400,bottom:480},{x:1590,top:320,bottom:400},
 {x:1070,top:500,bottom:640},{x:1410,top:640,bottom:780},{x:1510,top:480,bottom:640},{x:1710,top:320,bottom:480},
 {x:2070,top:800,bottom:920},{x:2210,top:740,bottom:860},{x:2370,top:600,bottom:740},{x:2510,top:540,bottom:680},
 {x:2570,top:760,bottom:860},{x:2650,top:680,bottom:760},{x:2870,top:600,bottom:680},{x:2790,top:480,bottom:680},{x:3030,top:400,bottom:600},{x:3120,top:740,bottom:860}
];
export const LEVEL_HEIGHT = ROWS * TILE;
export type Block = { kind: number; hp: number; seed: number };
export type Body = { x: number; y: number; w: number; h: number; vx: number; vy: number; grounded: boolean };
export class World {
  blocks: (Block | null)[] = Array(COLS * ROWS).fill(null);
  destroyed = 0;
  constructor() {
    for(let x=0;x<COLS;x++) {
      const pit=(x>=45&&x<=48)||(x>=93&&x<=103);
      if(!pit)for(let y=43;y<ROWS;y++)this.set(x,y,y>=47?3:1);
    }
    const platform=(x:number,y:number,w:number)=>{for(let a=x;a<x+w;a++)this.set(a,y,3);};
    const cover=(x:number,y:number,w:number,h:number)=>{for(let a=x;a<x+w;a++)for(let b=y;b<y+h;b++)this.set(a,b,2);};
    // Opening compound: learning space with breakable cover and flank routes.
    platform(19,40,4);platform(27,37,8);platform(36,40,5);
    cover(24,40,2,3);cover(34,39,2,4);
    // Uplink tower: climb left/right through a real 540px ascent.
    platform(50,40,7);platform(56,36,8);platform(51,32,9);
    platform(59,28,9);platform(66,24,9);platform(73,20,9);platform(79,16,11);
    cover(58,34,2,2);cover(62,26,2,2);cover(69,22,2,2);cover(83,14,2,2);
    // Tower gate opens when Tibo overloads the upper uplink.
    for(let y=14;y<47;y++){this.set(90,y,4);this.set(91,y,4);}
    // Cable landing, descending route, and the second vertical combat court.
    platform(113,30,9);platform(121,34,6);platform(126,38,7);
    platform(132,34,12);platform(143,30,9);platform(151,34,7);
    cover(115,28,2,2);cover(128,41,2,2);cover(138,32,2,2);cover(147,28,2,2);
    for(let y=25;y<47;y++){this.set(160,y,4);this.set(161,y,4);}
    for(let x=166;x<COLS;x++)this.set(x,43,3);
    cover(169,41,2,2);cover(188,41,2,2);
    // Layered encounter spaces. Steel routes survive; marked decking breaks.
    const deck=(x:number,y:number,w:number)=>{for(let a=x;a<x+w;a++)this.set(a,y,5);};
    platform(15,34,12);platform(28,30,16);deck(20,37,7);deck(35,37,8);
    cover(30,40,2,3);cover(39,32,2,2);cover(41,41,2,2);cover(25,32,1,2);
    platform(45,39,7);platform(45,47,5); // visible recovery shelf below the yard gap
    // Alternate tower flank with crossings back to the uplink route.
    platform(65,39,9);platform(69,32,8);platform(53,25,7);platform(79,24,8);
    deck(60,32,9);deck(67,28,6);deck(75,24,4);cover(70,36,2,3);cover(81,21,2,3);
    platform(94,46,11);platform(102,40,9);deck(94,40,8);
    // Cable landing offers a roof assault and a lower service route.
    platform(108,37,8);platform(122,27,7);deck(119,30,5);deck(117,37,8);
    cover(110,40,2,3);cover(122,32,1,2);cover(126,24,2,3);
    // A broad bowl: climb either edge, cross above, or blast through crates below.
    platform(137,39,8);platform(139,24,8);platform(149,20,7);platform(154,37,5);
    deck(133,34,7);deck(144,30,5);deck(147,24,7);deck(151,30,8);
    cover(134,40,3,3);cover(143,36,2,3);cover(150,27,2,3);cover(155,40,2,3);
    platform(147,30,3);platform(40,37,2); // reinforced uplink/field-kit anchors
    // Boss crossfire perches and clear space around the exposed core.
    platform(167,37,7);platform(186,37,7);deck(173,37,5);

  }
  openGate(index:number) {
    for(let y=0;y<ROWS;y++)for(const x of index===0?[90,91]:[160,161])this.blocks[y*COLS+x]=null;
  }

  set(x:number,y:number,kind:number) { this.blocks[y*COLS+x]={kind,hp:kind===3||kind===4?999:kind===2?4:kind===5?3:2,seed:((x*73+y*31)%97)/97}; }
  get(x:number,y:number):Block|null { return x<0||x>=COLS||y<0||y>=ROWS ? null : this.blocks[y*COLS+x]; }
  at(x:number,y:number) { return this.get(Math.floor(x/TILE),Math.floor(y/TILE)); }
  damage(x:number,y:number,amount:number):Block|null {
    const cx=Math.floor(x/TILE), cy=Math.floor(y/TILE), b=this.get(cx,cy);
    if(!b||b.kind===3||b.kind===4) return null;
    b.hp-=amount;
    if(b.hp<=0) { this.blocks[cy*COLS+cx]=null; this.destroyed++; return b; }
    return null;
  }
  overlaps(x:number,y:number,w:number,h:number) {
    for(let cy=Math.floor(y/TILE);cy<=Math.floor((y+h-.01)/TILE);cy++)
      for(let cx=Math.floor(x/TILE);cx<=Math.floor((x+w-.01)/TILE);cx++) if(this.get(cx,cy)) return true;
    return false;
  }
  move(b:Body,dt:number) {
    const steps=Math.max(1,Math.ceil(Math.max(Math.abs(b.vx*dt),Math.abs(b.vy*dt))/8));
    let wall=0; b.grounded=false;
    for(let i=0;i<steps;i++) {
      const dx=b.vx*dt/steps;
      b.x+=dx;
      if(this.overlaps(b.x,b.y,b.w,b.h)) {
        if(dx>0) { b.x=Math.floor((b.x+b.w-.01)/TILE)*TILE-b.w; wall=1; }
        else if(dx<0) { b.x=(Math.floor(b.x/TILE)+1)*TILE; wall=-1; }
        b.vx=0;
      }
      const dy=b.vy*dt/steps;
      b.y+=dy;
      if(this.overlaps(b.x,b.y,b.w,b.h)) {
        if(dy>0) { b.y=Math.floor((b.y+b.h-.01)/TILE)*TILE-b.h; b.grounded=true; }
        else if(dy<0) b.y=(Math.floor(b.y/TILE)+1)*TILE;
        b.vy=0;
      }
    }
    b.x=Math.max(0,Math.min(COLS*TILE-b.w,b.x));
    return wall;
  }
}
export const overlap=(a:{x:number;y:number;w:number;h:number},b:{x:number;y:number;w:number;h:number})=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
export const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
