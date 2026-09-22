async (page) => {
  await page.reload(); await page.keyboard.press('Enter'); await page.keyboard.press('Enter');
  const state=()=>page.evaluate(()=>window.tokenbros.snapshot());
  const move=async(x)=>{let s=await state();let k=x>s.player.x?'ArrowRight':'ArrowLeft';await page.keyboard.down(k);for(let i=0;i<150;i++){await page.waitForTimeout(16);s=await state();if(Math.abs(s.player.x-x)<6||(k==='ArrowRight'?s.player.x>x:s.player.x<x))break;}await page.keyboard.up(k);await page.waitForTimeout(100);return state();};
  const jump=async(x)=>{await page.keyboard.down('Space');const s=await move(x);await page.waitForTimeout(330);await page.keyboard.up('Space');await page.waitForTimeout(180);return state();};
  await page.keyboard.down('KeyJ');
  const log=[];
  for(const x of [260,430,600,770,880,1030]){log.push(await jump(x));if(x===600)await page.keyboard.press('KeyK');}
  const climb=async(x)=>{await move(x);await page.keyboard.down('ArrowUp');await page.waitForTimeout(850);await page.keyboard.up('ArrowUp');await page.waitForTimeout(120);log.push(await state());};
  await page.keyboard.press('KeyK');
  for(const x of [1120,1140,1180,1320,1460,1580])await climb(x);
  log.push(await move(1630));
  await page.keyboard.press('KeyK');log.push(await state());await page.screenshot({path:'output/playwright/tower-v2.png'});
  await move(1710);await page.keyboard.down('ArrowUp');await page.waitForTimeout(700);await page.screenshot({path:'output/playwright/cable-v2.png'});await page.keyboard.up('ArrowUp');await page.waitForTimeout(1700);log.push(await state());
  await move(2550);await page.waitForTimeout(600);await climb(2560);await climb(2640);await move(2820);await climb(2860);await move(2900);await page.keyboard.press('KeyK');log.push(await state());
  await page.screenshot({path:'output/playwright/court-v2.png'});await move(3330);log.push(await state());
  await page.keyboard.up('KeyJ');await page.keyboard.press('Escape');
  return log.map(s=>({state:s.state,player:s.player,health:s.health,kills:s.kills,deaths:s.deaths,relays:s.relays,zip:s.zip,boss:s.boss}));
}
