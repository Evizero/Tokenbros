import type { Game } from './game';
import { Showcase } from './showcase';

type Bro=Game['character'];
const roster:{id:Bro;name:string;role:string;color:string;style:string;description:string;kit:string[]}[]=[
 {id:'tibo',name:'TIBO',role:'THE RESET GUY',color:'#d5ff60',style:'GUNNER',description:'Burn your tokens. Throw your double. Smash RESET.',kit:['Other Tibo','Token shield','Hard reset']},
 {id:'peter',name:'PETER',role:'THE CLAWFATHER',color:'#ff805f',style:'BEASTMASTER',description:'Rally the claws. Hunt as a pack. Unleash the beast.',kit:['Throw claw','Prism shield','Molt']},
 {id:'dimillian',name:'DIMILLIAN',role:'THE HOT RELOADER',color:'#c39aff',style:'SHAPESHIFTER',description:'Baguette duelist. Fireball mage. Miniature starfighter.',kit:['Pair / sheep / bomb','Form shield','Form ultimate']},
 {id:'pidalf',name:'PIDALF',role:'THE SLOP SLAYER',color:'#efc47f',style:'FORCE / COMPACTION',description:'Dismiss the slop. Compress the bots. Throw what remains.',kit:['Hold / throw','Repel', 'Compact']},
 {id:'marcus',name:'MARCUS',role:'THE AUGMENTOR',color:'#70e1ef',style:'ARCADE TRICKSHOTS',description:'Launch. Reposition. Recall. Load an arcade. Chain your bites.',kit:['Recall cartridges','Flip dodge','Pac-Man chain']},
];

export function showRoster(g:Game){
 g.barks.clear();g.rosterPreview?.destroy();g.rosterPreview=null;
 g.marcusKit.clear();g.pidalfKit.clear();g.defense.release();g.dimillianKit.clear();g.audio.silenceRobots();g.state='title';g.keys.clear();g.pointer.down=false;g.pendingShot=0;
 const stage=g.canvas.parentElement!,overlay=document.querySelector<HTMLElement>('#overlay')!;
 stage.classList.add('roster-open');document.querySelector('.hud')!.setAttribute('hidden','');document.querySelector('.touch')!.classList.remove('active');document.querySelector('.toast')!.innerHTML='';
 overlay.className='overlay roster-screen';overlay.removeAttribute('hidden');
 overlay.innerHTML=`<div class="roster-heading"><div><div class="roster-kicker">OPERATION HARD RESET</div><h1>TOKEN<span>BROS</span></h1></div><div class="roster-prompt"><h2>CHOOSE YOUR BRO</h2><span>05 READY / 01 INCOMING</span></div></div>
 <div class="roster-body"><div class="roster-grid" role="group" aria-label="Choose your character">${roster.map((b,i)=>`<button class="bro-card" data-bro="${b.id}" style="--bro-color:${b.color};--slot:${i}" aria-pressed="${g.character===b.id}" aria-label="${b.name}, ${b.role}, ${b.style}"><span class="bro-number">0${i+1}</span><span class="bro-selected" aria-hidden="true">SELECTED <b>✦</b></span><span class="bro-art"><img src="${import.meta.env.BASE_URL}assets/${b.id}-intro-v${b.id==='pidalf'?2:1}.png" alt="" draggable="false"></span><span class="bro-caption"><span class="bro-role">${b.role}</span><strong>${b.name}</strong><span class="bro-style">${b.style}</span></span></button>`).join('')}${[6].map(i=>`<button class="bro-card bro-locked" disabled aria-label="Operative ${i}, coming soon"><span class="bro-number">0${i}</span><span class="unknown-bro" aria-hidden="true">?</span><span class="bro-caption"><span class="bro-role">SIGNAL UNKNOWN</span><strong>CLASSIFIED</strong><span class="bro-style">COMING SOON</span></span></button>`).join('')}</div>
 <section class="bro-showcase" aria-label="Selected character gameplay"><div class="showcase-heading"><div><span id="showcase-role"></span><h2 id="showcase-name"></h2></div><span class="showcase-tag">COMBAT REEL</span></div><div class="showcase-viewport"><canvas id="showcase-game" width="960" height="540" role="img" aria-label="Gameplay preview of the selected character"></canvas><div class="showcase-corner"><span>ABILITY SHOWCASE</span><button id="preview-toggle" type="button" aria-label="Pause gameplay preview">Ⅱ PAUSE</button></div><div class="showcase-progress"></div></div><div id="showcase-clips" role="group" aria-label="Preview abilities"></div><p id="showcase-caption"></p></section></div>
 <div class="roster-deploy"><div class="roster-detail" aria-live="polite" aria-atomic="true"><p id="bro-description"></p><div id="bro-kit"></div></div><button class="primary" id="start">DEPLOY <span class="arrow">↗</span></button></div><div class="roster-bottom"><span>SELECT YOUR BRO · DEPLOY INTO THE REFINERY</span><span>FIELD TEST 034</span></div>`;
 const buttons=[...overlay.querySelectorAll<HTMLButtonElement>('[data-bro]')];
 const showcase=new Showcase(overlay.querySelector<HTMLCanvasElement>('#showcase-game')!,overlay.querySelector<HTMLElement>('.bro-showcase')!,g);g.rosterPreview=showcase;
 const select=(id:Bro)=>{
  g.selectCharacter(id);g.hud();if(showcase.scene.character!==id)showcase.select(id);const bro=roster.find(b=>b.id===id)!;
  buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.bro===id)));
  overlay.querySelector('#showcase-name')!.textContent=bro.name;overlay.querySelector('#showcase-role')!.textContent=bro.role;
  overlay.querySelector('#showcase-game')!.setAttribute('aria-label',`${bro.name} gameplay ability preview`);
  overlay.querySelector('#bro-description')!.textContent=bro.description;
  overlay.querySelector('#bro-kit')!.innerHTML=bro.kit.map((ability,i)=>ability?`<span><kbd>${['E','Q','F'][i]}</kbd>${ability}</span>`:'').join('');
  overlay.querySelector('#start')!.innerHTML=`DEPLOY ${bro.name} <span class="arrow" aria-hidden="true">↗</span>`;
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
