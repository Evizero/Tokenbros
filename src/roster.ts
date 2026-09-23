import type { Game } from './game';
import { Showcase } from './showcase';

type Bro=Game['character'];
const roster:{id:Bro;name:string;role:string;color:string;style:string}[]=[
 {id:'tibo',name:'TIBO',role:'THE RESET GUY',color:'#d5ff60',style:'GUNNER'},
 {id:'peter',name:'PETER',role:'THE CLAWFATHER',color:'#ff805f',style:'BEASTMASTER'},
 {id:'dimillian',name:'DIMILLIAN',role:'THE HOT RELOADER',color:'#c39aff',style:'SHAPESHIFTER'},
 {id:'pidalf',name:'PIDALF',role:'THE SLOP SLAYER',color:'#efc47f',style:'FORCE / COMPACTION'},
 {id:'marcus',name:'MARCUS',role:'THE AUGMENTOR',color:'#70e1ef',style:'ARCADE TRICKSHOTS'},
 {id:'theo',name:'THEO',role:'THE FREE RIDER',color:'#78d9ff',style:'SKATE / BRAWL'},
];

export function showRoster(g:Game){
 g.barks.clear();g.rosterPreview?.destroy();g.rosterPreview=null;
 g.vertical.clear();g.theoKit.clear();g.marcusKit.clear();g.pidalfKit.clear();g.defense.release();g.dimillianKit.clear();g.audio.silenceRobots();g.state='title';g.keys.clear();g.pointer.down=false;g.pendingShot=0;
 const stage=g.canvas.parentElement!,overlay=document.querySelector<HTMLElement>('#overlay')!;
 stage.classList.add('roster-open');document.querySelector('.hud')!.setAttribute('hidden','');document.querySelector('.touch')!.classList.remove('active');document.querySelector('.toast')!.innerHTML='';
 overlay.className='overlay roster-screen';overlay.removeAttribute('hidden');
 overlay.innerHTML=`<div class="roster-heading"><h1>TOKEN<span>BROS</span></h1><button class="roster-options" type="button">OPTIONS <span aria-hidden="true">☰</span></button></div>
 <div class="roster-body"><div class="roster-grid" role="group" aria-label="Choose your character">${roster.map((b,i)=>`<button class="bro-card" data-bro="${b.id}" style="--bro-color:${b.color};--slot:${i}" aria-pressed="${g.character===b.id}" aria-label="${b.name}, ${b.role}, ${b.style}"><span class="bro-number">0${i+1}</span><span class="bro-selected" aria-hidden="true">SELECTED <b>✦</b></span><span class="bro-art"><img src="${import.meta.env.BASE_URL}assets/${b.id}-intro-v${b.id==='pidalf'||b.id==='theo'?2:1}.png" alt="" draggable="false"></span><span class="bro-caption"><span class="bro-role">${b.role}</span><strong>${b.name}</strong><span class="bro-style">${b.style}</span></span></button>`).join('')}</div>
 <section class="bro-showcase" aria-label="Selected character gameplay"><div class="showcase-heading"><div><span id="showcase-role"></span><h2 id="showcase-name"></h2></div><span class="showcase-tag">COMBAT REEL</span></div><div class="showcase-viewport"><canvas id="showcase-game" width="960" height="540" role="img" aria-label="Gameplay preview of the selected character"></canvas><div class="showcase-corner"><span>ABILITY SHOWCASE</span><button id="preview-toggle" type="button" aria-label="Pause gameplay preview">Ⅱ PAUSE</button></div><div class="showcase-inputs" aria-label="Demonstrated controls"><div class="showcase-keys">${['MOVE','MOUSE','SCROLL','E','Q','F'].map(key=>`<span data-demo-key="${key}"><kbd>${key==='MOUSE'?'LMB':key}</kbd></span>`).join('')}</div></div><div class="showcase-progress"></div></div><div id="showcase-clips" role="group" aria-label="Preview abilities"></div><p id="showcase-caption"></p></section></div>
 <div class="roster-deploy"><button class="primary" id="start">DEPLOY <span class="arrow">↗</span></button></div>`;
 overlay.querySelector('.roster-options')!.addEventListener('click',()=>document.querySelector<HTMLButtonElement>('#open-options')!.click());
 const buttons=[...overlay.querySelectorAll<HTMLButtonElement>('[data-bro]')];
 const showcase=new Showcase(overlay.querySelector<HTMLCanvasElement>('#showcase-game')!,overlay.querySelector<HTMLElement>('.bro-showcase')!,g);g.rosterPreview=showcase;
 let lastSelection:Bro|undefined;
 const select=(id:Bro)=>{
  g.selectCharacter(id);g.hud();if(showcase.scene.character!==id)showcase.select(id);const bro=roster.find(b=>b.id===id)!;
  buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.bro===id)));
  overlay.querySelector('#showcase-name')!.textContent=bro.name;overlay.querySelector('#showcase-role')!.textContent=bro.role;
  overlay.querySelector('#showcase-game')!.setAttribute('aria-label',`${bro.name} gameplay ability preview`);
  overlay.querySelector('#start')!.innerHTML=`DEPLOY ${bro.name} <span class="arrow" aria-hidden="true">↗</span>`;
  const reel=overlay.querySelector<HTMLElement>('.bro-showcase')!;
  reel.style.setProperty('--acid',bro.color);
  if(lastSelection!==undefined&&lastSelection!==id&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
   const animate=(el:Element,frames:Keyframe[],duration:number)=>{
    el.getAnimations().forEach(a=>a.cancel());el.animate(frames,{duration,easing:'cubic-bezier(.16,1,.3,1)'});
   };
   animate(overlay.querySelector('#showcase-game')!,[{opacity:.5,transform:'scale(1.025)'},{opacity:1,transform:'scale(1)'}],340);
   animate(overlay.querySelector('.showcase-heading')!,[{opacity:.2,transform:'translateX(14px)'},{opacity:1,transform:'translateX(0)'}],320);
   animate(overlay.querySelector('#start')!,[{transform:'scale(.97)'},{transform:'scale(1.025)',offset:.5},{transform:'scale(1)'}],360);
   animate(buttons.find(b=>b.dataset.bro===id)!,[{transform:'translateY(0)'},{transform:'translateY(-4px)',offset:.45},{transform:'translateY(0)'}],300);
  }
  lastSelection=id;
 };
 for(const b of buttons)b.addEventListener('click',()=>select(b.dataset.bro as Bro));
 overlay.querySelector('#start')!.addEventListener('click',()=>g.start());
 // Keep menu controls away from the global gameplay key handler, including
 // native Space/Enter button activation and directional roster navigation.
 overlay.onkeydown=e=>{
  if(g.state!=='title')return;
  if((e.target===overlay||(e.target as HTMLElement).closest('.roster-grid'))&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.code)){
   e.preventDefault();e.stopPropagation();let i=buttons.findIndex(b=>b.dataset.bro===g.character);
   i=e.code==='Home'?0:e.code==='End'?buttons.length-1:(i+(['ArrowLeft','ArrowUp'].includes(e.code)?-1:1)+buttons.length)%buttons.length;
   select(buttons[i].dataset.bro as Bro);buttons[i].focus();
  }else if(e.code==='Enter'||e.code==='Space'){e.stopPropagation();if(e.target===overlay){e.preventDefault();if(!e.repeat)g.start();}}
 };
 g.coop.roster();
 select(g.character);overlay.tabIndex=-1;overlay.focus({preventScroll:true});
}
