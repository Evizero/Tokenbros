async (page) => {
  await page.reload();await page.keyboard.press('Enter');await page.keyboard.press('Enter');await page.keyboard.press('Digit3');
  const box=await page.locator('#game').boundingBox();
  const state=()=>page.evaluate(()=>window.tokenbros.snapshot());
  const aim=async()=>{const s=await state(),p=s.player;const target=s.enemyStates.filter(e=>Math.abs(e.x-p.x)<570&&Math.abs(e.y-p.y)<300).sort((a,b)=>(Math.abs(a.x-p.x)+Math.abs(a.y-p.y)*1.2)-(Math.abs(b.x-p.x)+Math.abs(b.y-p.y)*1.2))[0];if(s.usage<8&&s.charges>0&&s.boost<=0&&!s.resetAnimation)await page.keyboard.press('KeyF');if(s.usage<8&&s.boost<=0&&!s.resetAnimation)await page.mouse.up();else if(!s.firing&&(s.usage>45||s.boost>0))await page.mouse.down();const x=target?target.x+10:p.x+350,y=target?target.y+15:p.y+17;await page.mouse.move(box.x+Math.max(4,Math.min(956,x-s.cam))*box.width/960,box.y+Math.max(4,Math.min(536,y-s.camY))*box.height/540);if(target&&Math.hypot(target.x-p.x,target.y-p.y)<125&&s.hotfixCooldown<=0)await page.keyboard.press('KeyE');return s;};
  const wait=async(ms)=>{for(let t=0;t<ms;t+=80){await aim();await page.waitForTimeout(Math.min(80,ms-t));}};
  const move=async(x)=>{let s=await state();const k=x>s.player.x?'ArrowRight':'ArrowLeft';await page.keyboard.down(k);for(let i=0;i<120;i++){await aim();await page.waitForTimeout(16);s=await state();if(Math.abs(s.player.x-x)<20||(k==='ArrowRight'?s.player.x>x:s.player.x<x))break;if(s.state==='dead')throw Error('Route died before checkpoint: '+JSON.stringify(s));}await page.keyboard.up(k);await wait(100);return state();};
  const jump=async(x)=>{await page.keyboard.down('Space');await move(x);await wait(330);await page.keyboard.up('Space');await wait(180);};
  const climb=async(x)=>{await move(x);await page.keyboard.down('ArrowUp');await wait(900);await page.keyboard.up('ArrowUp');await wait(100);};
  await aim();await page.mouse.down();
  for(const x of [260,430,600,770,880,1030]){await jump(x);if(x===600)await page.keyboard.press('KeyF');}
  await page.keyboard.press('KeyF');for(const x of [1120,1140,1180,1320,1460,1580])await climb(x);
  await move(1630);while((await state()).boost>0)await wait(150);await page.keyboard.press('KeyF');await wait(900);const tower=await state();if(!tower.relays[0].done){await page.mouse.up();await page.keyboard.press('Escape');throw Error('Tower not unlocked: '+JSON.stringify(tower));}
  await move(1710);await page.keyboard.down('ArrowUp');await wait(700);await page.keyboard.up('ArrowUp');await wait(1700);
  await move(2550);await wait(600);await climb(2560);await climb(2640);await move(2820);await climb(2860);await move(2910);while((await state()).boost>0)await wait(150);await page.keyboard.press('KeyF');await wait(900);const court=await state();if(!court.relays[1].done)throw Error('Court not unlocked');
  await page.screenshot({path:'output/playwright/mouse-combat-v3.png'});await move(3330);
  for(let i=0;i<100;i++){
    const s=await state();if(s.state==='won')break;if(s.state==='dead'){await page.waitForTimeout(500);continue;}
    await page.mouse.move(box.x+(s.boss.dead?900:Math.max(30,Math.min(930,3650-s.cam)))*box.width/960,box.y+(816-s.camY)*box.height/540);await page.mouse.down();
    if(s.player.x<3470||s.boss.dead)await page.keyboard.down('ArrowRight');else await page.keyboard.up('ArrowRight');
    if(s.boss.phase===2&&s.charges>0&&s.boost<=0)await page.keyboard.press('KeyF');
    if(s.boss.phase===1&&i%3===0)await page.keyboard.down('Space');else if(i%3===2)await page.keyboard.up('Space');await page.waitForTimeout(250);
  }
  await page.mouse.up();await page.keyboard.up('Space');await page.keyboard.up('ArrowRight');const end=await state();await page.screenshot({path:'output/playwright/mouse-completion-v3.png'});if(end.state!=='won')throw Error('Route failed to finish: '+JSON.stringify(end));return {tower:tower.relays,court:court.relays,end};
}
