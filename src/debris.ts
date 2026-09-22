import { World, type Body } from './world.ts';
export type Scrap = Body & {kind:'head'|'torso'|'limb'|'plate'|'casing';angle:number;spin:number;life:number;color:string;bounces:number};
export type Oil = {x:number;y:number;w:number;life:number};
const rand=(a:number,b:number)=>a+Math.random()*(b-a);
export class Debris {
  pieces:Scrap[]=[];oil:Oil[]=[];
  shatter(x:number,y:number,dx:number,dy:number,big=false){
    const parts:Scrap['kind'][]=['torso','head','limb','limb','limb','limb','plate'];
    for(const [i,kind] of parts.entries()){
      const w=kind==='torso'?15:kind==='head'?11:kind==='plate'?9:5,h=kind==='torso'?14:kind==='head'?10:kind==='plate'?5:10;
      this.pieces.push({x:x+rand(-7,7),y:y+(i===1?-8:rand(-3,12)),w,h,vx:dx+rand(-110,110),vy:Math.min(-90,dy)+rand(-200,30),grounded:false,kind,angle:rand(-.4,.4),spin:rand(-15,15),life:big?7:5,color:kind==='plate'?'#aec3a0':'#69877b',bounces:0});
    }
    this.oil.push({x:x-12,y:y+15,w:rand(18,34),life:12});this.trim();
  }
  armor(x:number,y:number,face:number){
    for(let i=0;i<3;i++)this.pieces.push({x:x+face*15,y:y+i*7,w:9,h:8,vx:face*rand(80,150),vy:rand(-150,-70),grounded:false,kind:'plate',angle:0,spin:rand(-15,15),life:4,color:'#8bc4d1',bounces:0});this.trim();
  }
  casing(x:number,y:number,face:number){
    this.pieces.push({x,y,w:3,h:2,vx:-face*rand(40,100),vy:rand(-130,-60),grounded:false,kind:'casing',angle:0,spin:rand(-20,20),life:2,color:'#d9bc79',bounces:0});this.trim();
  }
  trim(){if(this.pieces.length>180)this.pieces.splice(0,this.pieces.length-180);if(this.oil.length>45)this.oil.splice(0,this.oil.length-45);}
  update(dt:number,world:World){
    for(const p of this.pieces){
      p.life-=dt;p.vy=Math.min(700,p.vy+850*dt);const vx=p.vx,vy=p.vy;
      const wall=world.move(p,dt);
      if(wall){p.vx=-vx*.4;p.spin*=-.5;}
      if(p.grounded){
        if(vy>95&&p.bounces<3){p.vy=-vy*.34;p.vx*=.65;p.grounded=false;p.bounces++;}
        else{p.vx*=Math.max(0,1-dt*12);p.spin*=Math.max(0,1-dt*14);}
      }
      p.angle+=p.spin*dt;
    }
    for(const o of this.oil){o.life-=dt;if(!world.at(o.x+o.w/2,o.y+3)){o.y+=300*dt;if(world.at(o.x+o.w/2,o.y+3))o.y=Math.floor((o.y+3)/20)*20-3;}}
    this.pieces=this.pieces.filter(p=>p.life>0&&p.y<1100);this.oil=this.oil.filter(o=>o.life>0&&o.y<1100);
  }
  draw(c:CanvasRenderingContext2D,cam:number){
    for(const o of this.oil){c.globalAlpha=Math.min(.85,o.life);c.fillStyle='#101c27';c.fillRect(Math.round(o.x-cam),Math.round(o.y),o.w,3);c.fillStyle='#409084';c.fillRect(Math.round(o.x-cam+4),Math.round(o.y),o.w*.4,1);}
    for(const p of this.pieces){c.save();c.globalAlpha=Math.min(1,p.life);c.translate(Math.round(p.x-cam+p.w/2),Math.round(p.y+p.h/2));c.rotate(p.angle);c.fillStyle=p.color;c.fillRect(-p.w/2,-p.h/2,p.w,p.h);c.fillStyle='#283c3d';c.fillRect(-p.w/2+1,-p.h/2+2,p.w-2,2);
      if(p.kind==='head'){c.fillStyle='#ff9e66';c.fillRect(1,-2,3,2);}if(p.kind==='torso'){c.fillStyle='#d1db8b';c.fillRect(-2,-1,4,3);}c.restore();}
    c.globalAlpha=1;
  }
}
