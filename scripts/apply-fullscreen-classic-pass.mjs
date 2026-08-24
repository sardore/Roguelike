import fs from 'node:fs';

function patch(path,fn){const before=fs.readFileSync(path,'utf8');const after=fn(before);if(after===before)throw new Error(`no changes for ${path}`);fs.writeFileSync(path,after);}
function once(s,a,b,label){if(s.includes(b))return s;if(!s.includes(a))throw new Error(`missing anchor: ${label}`);return s.replace(a,b);}

patch('src/content/items.ts',(s)=>{
  s=once(s,"import { FOUNDATION_ITEMS } from './foundation-items';","import { FOUNDATION_ITEMS } from './foundation-items';\nimport { CLASSIC_ITEMS } from './classic-items';",'classic item import');
  s=once(s,'ITEMS.push(...EXTRA_ITEMS,...FOUNDATION_ITEMS);','ITEMS.push(...EXTRA_ITEMS,...FOUNDATION_ITEMS,...CLASSIC_ITEMS);','classic item append');
  return s;
});

patch('src/content/monsters.ts',(s)=>{
  s=once(s,"import { FOUNDATION_MONSTERS } from './foundation-monsters';","import { FOUNDATION_MONSTERS } from './foundation-monsters';\nimport { UNIQUE_MONSTERS } from './unique-monsters';",'unique monster import');
  s=once(s,'MONSTERS.push(...EXTRA_MONSTERS,...FOUNDATION_MONSTERS);','MONSTERS.push(...EXTRA_MONSTERS,...FOUNDATION_MONSTERS,...UNIQUE_MONSTERS);','unique monster append');
  const oldFn="export function monstersForTheme(theme:ThemeDefinition,depth:number):MonsterDefinition[]{const direct=MONSTERS.filter((m)=>m.tags.includes(`theme:${theme.id}`)&&m.minDepth<=depth+20);if(direct.length)return direct;return MONSTERS.filter((m)=>m.tags.some((tag)=>theme.monsterTags.includes(tag))&&m.minDepth<=depth+20);}";
  const newFn="export function monstersForTheme(theme:ThemeDefinition,depth:number):MonsterDefinition[]{const ordinary=(m:MonsterDefinition)=>!m.tags.includes('unique')&&m.minDepth<=depth+20;const direct=MONSTERS.filter((m)=>ordinary(m)&&m.tags.includes(`theme:${theme.id}`));if(direct.length)return direct;return MONSTERS.filter((m)=>ordinary(m)&&m.tags.some((tag)=>theme.monsterTags.includes(tag)));}\nexport function uniqueMonstersForTheme(theme:ThemeDefinition,depth:number):MonsterDefinition[]{return MONSTERS.filter((m)=>m.tags.includes('unique')&&m.tags.includes(`theme:${theme.id}`)&&m.minDepth<=depth+20);}";
  s=once(s,oldFn,newFn,'theme monster selectors');
  return s;
});

patch('src/core/game.ts',(s)=>{
  s=once(s,"import { MONSTERS, monsterById, monstersForTheme } from '../content/monsters';","import { MONSTERS, monsterById, monstersForTheme, uniqueMonstersForTheme } from '../content/monsters';\nimport { originById } from '../content/origins';",'game content imports');
  const oldPopulate=`  state.monsters = [];
  for (let i = 0; i < count; i += 1) {
    const def = chooseMonster(state, rng), point = points.pop();
    if (!point) break;
    const hpScale = 1 + Math.max(0, power - 1) * 0.14;
    state.monsters.push({ id: makeId('m', rng), defId: def.id, hp: Math.max(1, Math.round(def.maxHp * hpScale)), statuses: [], power, abilityCooldown: 0, ...point });
  }
  state.items = [];`;
  const newPopulate=`  state.monsters = [];
  for (let i = 0; i < count; i += 1) {
    const def = chooseMonster(state, rng), point = points.pop();
    if (!point) break;
    const hpScale = 1 + Math.max(0, power - 1) * 0.14;
    state.monsters.push({ id: makeId('m', rng), defId: def.id, hp: Math.max(1, Math.round(def.maxHp * hpScale)), statuses: [], power, abilityCooldown: 0, ...point });
  }
  const uniquePool=uniqueMonstersForTheme(resolveThemeContext(state.coord).primary,state.coord.depth);
  const uniqueFloor=state.coord.depth>=4&&(state.coord.depth%7===0||rng.chance(Math.min(.16,.055+state.coord.depth/1800)));
  if(uniqueFloor&&uniquePool.length&&points.length){
    const farIndex=points.findIndex((point)=>manhattan(point,state.player)>=11);
    const point=farIndex>=0?points.splice(farIndex,1)[0]:points.pop();
    if(point){const def=rng.pick(uniquePool),scale=1.12+Math.max(0,power-1)*.12;state.monsters.push({id:makeId('unique',rng),defId:def.id,hp:Math.round(def.maxHp*scale),statuses:[],power:power+.75,abilityCooldown:1,...point});pushMessage(state,`A named presence haunts this floor: ${def.name}.`);}
  }
  state.items = [];`;
  s=once(s,oldPopulate,newPopulate,'unique floor population');

  s=once(s,'export function createNewGame(seedText: string): { state: GameState; event: StoryEvent | null } {','export function createNewGame(seedText: string, originId = \'delver\'): { state: GameState; event: StoryEvent | null } {','origin signature');
  const stateAnchor="  const coord: WorldCoord = { depth: 1, lane: 0 }, context = resolveThemeContext(coord), floor = generateFloor(runSeed, coord, context);\n  const state: GameState = {";
  const stateWithOrigin="  const coord: WorldCoord = { depth: 1, lane: 0 }, context = resolveThemeContext(coord), floor = generateFloor(runSeed, coord, context);\n  const origin=originById(originId);\n  const startInventory=origin.inventory.map((defId,index)=>({id:`start-${origin.id}-${index}`,defId}));\n  const weaponEntry=startInventory.find((entry)=>entry.defId===origin.equippedWeapon);\n  const armorEntry=startInventory.find((entry)=>entry.defId===origin.equippedArmor);\n  const state: GameState = {";
  s=once(s,stateAnchor,stateWithOrigin,'origin setup');
  const oldPlayer="    player: { id: 'player', x: floor.spawn.x, y: floor.spawn.y, hp: 34, maxHp: 34, attack: 5, defense: 1, gold: 24, level: 1, xp: 0, xpToNext: xpThreshold(1), hunger: DEFAULT_MAX_HUNGER, maxHunger: DEFAULT_MAX_HUNGER, ammo: DEFAULT_AMMO, kills: 0, floorsVisited: 1, inventory: [{id:'start-sling',defId:'sling'},{id:'start-food',defId:'hard-biscuit'},{id:'start-bandage',defId:'field-bandage'}], statuses: [], equippedWeaponId: 'start-sling' },";
  const newPlayer="    player: { id: 'player', x: floor.spawn.x, y: floor.spawn.y, hp: origin.hp, maxHp: origin.hp, attack: origin.attack, defense: origin.defense, gold: origin.gold, level: 1, xp: 0, xpToNext: xpThreshold(1), hunger: DEFAULT_MAX_HUNGER, maxHunger: DEFAULT_MAX_HUNGER, ammo: origin.ammo ?? DEFAULT_AMMO, kills: 0, floorsVisited: 1, inventory: startInventory, statuses: [], ...(weaponEntry?{equippedWeaponId:weaponEntry.id}:{}), ...(armorEntry?{equippedArmorId:armorEntry.id}:{}) },";
  s=once(s,oldPlayer,newPlayer,'origin player state');
  s=once(s,"    messages: ['You descend beneath the cistern.'],","    messages: [`You descend beneath the cistern as a ${origin.name}.`],",'origin entrance');

  const oldKill=`  grantKillProgress(state,def,monster.power,(message)=>pushMessage(state,message));
  const coin = def.tags.includes('humanoid') ? 2 : def.tags.includes('construct') ? 1 : 0;
  if (coin) state.player.gold += coin;
  pushMessage(state, \`${'${def.name}'} dies.${'${coin ? ` You recover ${coin} gold.` : \'\'}'}\`);`;
  const newKill=`  grantKillProgress(state,def,monster.power,(message)=>pushMessage(state,message));
  const isUnique=def.tags.includes('unique');
  const coin = isUnique ? 14+Math.floor(state.coord.depth/8) : def.tags.includes('humanoid') ? 2 : def.tags.includes('construct') ? 1 : 0;
  if (coin) state.player.gold += coin;
  pushMessage(state, isUnique ? \`${'${def.name}'} falls. The dungeon goes briefly silent. You recover ${'${coin}'} gold.\` : \`${'${def.name}'} dies.${'${coin ? ` You recover ${coin} gold.` : \'\'}'}\`);`;
  s=once(s,oldKill,newKill,'unique kill reward');
  return s;
});

patch('src/main.ts',(s)=>{
  s=once(s,"import { hungerPercent, hungerStage, isRangedWeapon } from './core/foundations';","import { hungerPercent, hungerStage, isRangedWeapon } from './core/foundations';\nimport { ORIGINS } from './content/origins';",'origin ui import');
  s=once(s,"let openSheet: 'bag' | 'menu' | 'site' | null = null;","let openSheet: 'bag' | 'menu' | 'site' | null = null;\nlet selectedOrigin='delver';",'selected origin state');
  const seedMarkup="        <label class=\"seed-field\">${tr(locale,'seed')}<input id=\"seed\" autocomplete=\"off\" value=\"${Math.random().toString(36).slice(2, 10)}\" /></label>\n        <button class=\"primary-title-action\" id=\"new-run\">${tr(locale,'newRun')}</button>";
  const originMarkup="        <label class=\"seed-field\">${tr(locale,'seed')}<input id=\"seed\" autocomplete=\"off\" value=\"${Math.random().toString(36).slice(2, 10)}\" /></label>\n        <section class=\"origin-picker\"><div class=\"origin-heading\">${locale==='ko'?'출신':'Origin'}</div><div class=\"origin-grid\">${ORIGINS.map((origin)=>`<button class=\"origin-chip ${origin.id===selectedOrigin?'selected':''}\" data-origin=\"${origin.id}\"><strong>${locale==='ko'?origin.nameKo:origin.name}</strong></button>`).join('')}</div><p id=\"origin-description\" class=\"origin-description\"></p></section>\n        <button class=\"primary-title-action\" id=\"new-run\">${tr(locale,'newRun')}</button>";
  s=once(s,seedMarkup,originMarkup,'origin picker markup');
  s=once(s,"  document.querySelector<HTMLButtonElement>('#language-button')?.addEventListener('click',toggleLocale);","  document.querySelector<HTMLButtonElement>('#language-button')?.addEventListener('click',toggleLocale);\n  const describeOrigin=()=>{const origin=ORIGINS.find((entry)=>entry.id===selectedOrigin)??ORIGINS[0]!;const element=document.querySelector<HTMLElement>('#origin-description');if(element)element.textContent=locale==='ko'?origin.descriptionKo:origin.description;};\n  document.querySelectorAll<HTMLButtonElement>('[data-origin]').forEach((button)=>button.addEventListener('click',()=>{selectedOrigin=button.dataset.origin??'delver';document.querySelectorAll('[data-origin]').forEach((entry)=>entry.classList.toggle('selected',(entry as HTMLElement).dataset.origin===selectedOrigin));describeOrigin();}));\n  describeOrigin();",'origin picker handlers');
  s=once(s,'    const created = createNewGame(seed);','    const created = createNewGame(seed, selectedOrigin);','origin create game');
  return s;
});

patch('src/ui/render.ts',(s)=>{
  const oldInterface="interface Viewport { x:number; y:number; cols:number; rows:number; cell:number; }";
  const newInterface="interface Viewport { x:number; y:number; cols:number; rows:number; cell:number; width:number; height:number; offsetX:number; offsetY:number; }";
  s=once(s,oldInterface,newInterface,'viewport interface');
  const oldViewport=`function viewportFor(canvas:HTMLCanvasElement,state:GameState):Viewport{
  const width=Math.max(300,canvas.clientWidth||canvas.parentElement?.clientWidth||300);
  const height=Math.max(250,canvas.clientHeight||canvas.parentElement?.clientHeight||250);
  const targetCell=width<430?17:19;
  const cols=Math.min(state.floor.width,oddFloor(width/targetCell,17,31));
  const rows=Math.min(state.floor.height,oddFloor(height/targetCell,15,31));
  const x=clamp(state.player.x-Math.floor(cols/2),0,Math.max(0,state.floor.width-cols));
  const y=clamp(state.player.y-Math.floor(rows/2),0,Math.max(0,state.floor.height-rows));
  const cell=Math.max(15,Math.floor(Math.min(width/cols,height/rows)));
  return{x,y,cols,rows,cell};
}`;
  const newViewport=`function viewportFor(canvas:HTMLCanvasElement,state:GameState):Viewport{
  const parent=canvas.parentElement;
  const width=Math.max(320,parent?.clientWidth||canvas.clientWidth||320);
  const height=Math.max(280,parent?.clientHeight||canvas.clientHeight||280);
  const cell=width<430?20:22;
  const cols=Math.min(state.floor.width,Math.max(19,Math.ceil(width/cell)+1));
  const rows=Math.min(state.floor.height,Math.max(17,Math.ceil(height/cell)+1));
  const x=clamp(state.player.x-Math.floor(cols/2),0,Math.max(0,state.floor.width-cols));
  const y=clamp(state.player.y-Math.floor(rows/2),0,Math.max(0,state.floor.height-rows));
  const drawWidth=cols*cell,drawHeight=rows*cell;
  return{x,y,cols,rows,cell,width,height,offsetX:(width-drawWidth)/2,offsetY:(height-drawHeight)/2};
}`;
  s=once(s,oldViewport,newViewport,'fullscreen viewport');
  s=once(s,'  const cssWidth=view.cols*view.cell,cssHeight=view.rows*view.cell;\n  canvas.style.width=`${cssWidth}px`;canvas.style.height=`${cssHeight}px`;','  const cssWidth=view.width,cssHeight=view.height;\n  canvas.style.width=\'100%\';canvas.style.height=\'100%\';','canvas fill sizing');
  s=once(s,"  const screen=(x:number,y:number)=>({x:(x-view.x)*view.cell,y:(y-view.y)*view.cell});\n\n  for(let sy=0;sy<view.rows;sy+=1)","  const screen=(x:number,y:number)=>({x:(x-view.x)*view.cell,y:(y-view.y)*view.cell});\n  ctx.save();ctx.translate(view.offsetX,view.offsetY);\n\n  for(let sy=0;sy<view.rows;sy+=1)",'viewport translate');
  s=once(s,"  const player=screen(state.player.x,state.player.y);ctx.fillStyle=rgba(palette.accent,.14);ctx.beginPath();ctx.arc(player.x+view.cell/2,player.y+view.cell/2,view.cell*.52,0,Math.PI*2);ctx.fill();ctx.shadowColor='#ffffff';ctx.shadowBlur=7;ctx.fillStyle='#f5f5f1';ctx.fillText('@',player.x+view.cell/2,player.y+view.cell/2);ctx.shadowBlur=0;\n\n  const vignette=", "  const player=screen(state.player.x,state.player.y);ctx.fillStyle=rgba(palette.accent,.16);ctx.beginPath();ctx.arc(player.x+view.cell/2,player.y+view.cell/2,view.cell*.58,0,Math.PI*2);ctx.fill();ctx.shadowColor='#ffffff';ctx.shadowBlur=8;ctx.fillStyle='#f5f5f1';ctx.fillText('@',player.x+view.cell/2,player.y+view.cell/2);ctx.shadowBlur=0;\n  ctx.restore();\n\n  const vignette=",'restore translated canvas');
  return s;
});

patch('src/tactical.css',()=>`/* Full-bleed mobile dungeon surface. The map owns the screen; chrome stays compact. */
:root{--panel:#080c12;--panel2:#0c121a;--line:#202a36;--text:#e9ece8;--muted:#778392;--hp:#cf6269;--food:#c4a35d}
.game-shell{max-width:900px;background:radial-gradient(circle at 50% 18%,#101721 0,#070a0f 46%,#040609 100%);box-shadow:0 0 80px #000 inset}
.hud{height:58px;grid-template-columns:minmax(0,1fr) 132px 38px;gap:8px;padding:6px 8px;background:linear-gradient(180deg,#0c1118f5,#070b10f2);border-bottom:1px solid #1c2631;box-shadow:0 6px 18px #0006;z-index:2}
.place-block strong{font-size:13px;color:#f0f1ed;text-shadow:0 1px 8px #000}.place-block span{font-size:9px;color:#7f8b98;letter-spacing:.045em;text-transform:none}
.vitals-block{width:132px;display:grid;gap:3px}.vital-labels,.hunger-line{display:flex;justify-content:space-between;align-items:center;font:700 9px/1 ui-monospace,SFMono-Regular,Menlo,monospace;color:#cdd2d7}.vital-labels b{color:#d7c38d}.hunger-line{color:#a89366}.hunger-line small{font-size:8px;color:#8995a2}.hp-track,.hunger-track{height:5px;background:#202832;border-radius:6px;overflow:hidden;box-shadow:inset 0 1px 2px #000}.hp-track i,.hunger-track i{display:block;height:100%;border-radius:inherit;transition:width .12s linear}.hp-track i{background:linear-gradient(90deg,#a9434c,#df7778);box-shadow:0 0 8px #c5535b99}.hunger-track i{background:linear-gradient(90deg,#8f713e,#d4b367);box-shadow:0 0 7px #b28d4c77}.icon-button{width:36px;height:36px;border-color:#27313e;background:#0e141d;color:#b7c0ca}
.map-wrap{position:relative;min-height:0;display:block!important;overflow:hidden;background:#030508;border-bottom:1px solid #141d27}.map-wrap:after{content:"";position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 0 22px #0009,inset 0 0 2px #41536b22}.game-canvas,#game-canvas{display:block!important;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;object-fit:fill!important;filter:contrast(1.09) saturate(1.09)}
.message-strip{min-height:28px;padding:5px 10px;border-top:0;border-bottom:1px solid #1a232e;background:#070b10e8;color:#b7c0ca;font-size:11px;box-shadow:0 -5px 15px #0004}
.mobile-dock{min-height:126px;display:grid;grid-template-columns:54px minmax(114px,1fr) 136px;gap:6px;align-items:center;padding:6px 7px max(7px,env(safe-area-inset-bottom));border-top:1px solid #222d39;background:linear-gradient(180deg,#0c1219f4,#070b10fa);box-shadow:0 -10px 26px #0009;z-index:3}.utility-dock{align-self:stretch;display:flex;align-items:center}.bag-button{width:50px;height:56px;border:1px solid #293542;background:linear-gradient(180deg,#131b25,#0e141c);border-radius:12px;color:#c7ced5;box-shadow:0 4px 12px #0006,inset 0 1px #ffffff08}.bag-button .bag-glyph{font-size:19px}.bag-button b{background:#35404c;color:#f3f2eb}
.action-pad{justify-self:center;width:100%;max-width:150px;display:grid;grid-template-columns:repeat(2,minmax(50px,1fr));grid-template-rows:repeat(3,34px);gap:4px}.action-pad>button,.context-slot>.site-dock-button{min-width:0;height:34px;padding:1px 4px;display:grid;grid-template-columns:auto 1fr;place-items:center;gap:3px;border-radius:9px;border:1px solid #283543;background:linear-gradient(180deg,#151e28,#101720);box-shadow:0 3px 10px #0005,inset 0 1px #ffffff09;touch-action:manipulation}.action-pad strong{font:700 14px ui-monospace,monospace;color:#d8dee4}.action-pad small,.context-slot small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:8px;color:#9ca7b3}.action-pad .brace-action{border-color:#3a4050;background:linear-gradient(180deg,#181e29,#111620)}.action-pad button:disabled{opacity:.32;filter:saturate(.3)}.context-slot{width:100%;height:34px}.context-slot:empty{border:1px dashed #202a34;border-radius:9px;opacity:.26}.site-dock-button span{font-size:15px}
.controls{justify-self:end;display:grid;grid-template-columns:repeat(3,42px);grid-template-rows:repeat(3,34px);gap:3px}.controls>button{padding:0;border-radius:10px;border:1px solid #344354;background:linear-gradient(180deg,#1a2531,#111923);color:#e0e4e7;font-size:15px;font-weight:800;box-shadow:0 4px 11px #0006,inset 0 1px #ffffff0b;touch-action:manipulation}.controls>button:active,.action-pad>button:active{transform:translateY(1px) scale(.97);box-shadow:0 1px 4px #0008}.controls .dpad-core{display:grid;place-items:center;color:#465261;font-size:12px;pointer-events:none}
.origin-picker{margin:14px 0 4px;padding:10px;border:1px solid #252d38;border-radius:12px;background:#0b1017}.origin-heading{margin-bottom:7px;color:#818b98;font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.origin-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px}.origin-chip{min-width:0;height:38px;padding:3px;border-color:#28323e;background:#111720;color:#909aa6;font-size:9px;line-height:1.05}.origin-chip strong{display:block;overflow:hidden;text-overflow:ellipsis}.origin-chip.selected{border-color:#7c8998;background:#1a2330;color:#f0f1ec;box-shadow:0 0 0 1px #53617044 inset}.origin-description{min-height:30px;margin:8px 2px 0;color:#8f98a4;font-size:10px;line-height:1.4}
@media(min-width:700px){.mobile-dock{min-height:132px;grid-template-columns:60px minmax(140px,1fr) 150px;padding-left:10px;padding-right:10px}.action-pad{max-width:170px;grid-template-columns:repeat(2,80px);grid-template-rows:repeat(3,36px)}.action-pad>button,.context-slot>.site-dock-button{height:36px}.controls{grid-template-columns:repeat(3,47px);grid-template-rows:repeat(3,36px)}}
@media(max-width:360px){.mobile-dock{grid-template-columns:50px minmax(104px,1fr) 126px;gap:4px;padding-left:4px;padding-right:4px}.bag-button{width:47px}.controls{grid-template-columns:repeat(3,39px);grid-template-rows:repeat(3,32px);gap:3px}.action-pad{grid-template-rows:repeat(3,32px);gap:3px}.action-pad>button,.context-slot>.site-dock-button{height:32px}.action-pad small,.context-slot small{font-size:7px}.origin-grid{grid-template-columns:repeat(3,1fr)}}
@media(max-height:700px){.hud{height:52px}.mobile-dock{min-height:112px;padding-top:4px}.controls{grid-template-rows:repeat(3,30px)}.action-pad{grid-template-rows:repeat(3,30px)}.action-pad>button,.context-slot>.site-dock-button{height:30px}.message-strip{min-height:25px;padding-top:3px;padding-bottom:3px}}
`);

patch('README.md',(s)=>{
  s=s.replace('- 145+ monsters, with multiple tactical roles native to every normal theme','- 160+ monsters, including named unique encounters layered over each theme');
  s=s.replace('- 195+ items across weapons, armor, food, ammunition, consumables, tools, and relics','- 230+ items across weapons, armor, food, ammunition, consumables, tools, relics, and classic utility archetypes');
  s=s.replace('- hunger/nutrition with food scarcity, starvation, and action-based metabolism','- five starting origins with genuinely different opening kits and stat profiles\n- hunger/nutrition with food scarcity, starvation, and action-based metabolism');
  s=s.replace('- deterministic procedural floors with connectivity/open-area validation','- deterministic procedural floors with connectivity/open-area validation\n- named unique-monster floors with deterministic warning, telegraphed abilities, and enhanced rewards\n- full-bleed mobile viewport: the ASCII dungeon fills the available play surface instead of sitting in a small centered rectangle');
  return s;
});

patch('ARCHITECTURE.md',(s)=>{
  s=s.replace('- at least 145 monsters overall\n- at least 195 items overall','- at least 160 monsters overall, with named uniques excluded from ordinary ecology sampling\n- at least 230 items overall');
  s=s.replace('A numeric variant that only changes HP/damage without changing tactical role should not be used merely to satisfy these gates.','A numeric variant that only changes HP/damage without changing tactical role should not be used merely to satisfy these gates. Starting origins must be data packages over the same canonical player state, and named uniques must reuse ordinary AI/effect primitives rather than private boss executors.');
  return s;
});

fs.writeFileSync('tests/classic-depth.test.ts',`import { describe,expect,it } from 'vitest';
import { ITEMS } from '../src/content/items';
import { MONSTERS, monstersForTheme, uniqueMonstersForTheme } from '../src/content/monsters';
import { ORIGINS } from '../src/content/origins';
import { THEMES } from '../src/world/themes';
import { createNewGame } from '../src/core/game';

describe('classic depth expansion',()=>{
  it('raises the material content baseline',()=>{expect(ITEMS.length).toBeGreaterThanOrEqual(230);expect(MONSTERS.length).toBeGreaterThanOrEqual(160);expect(MONSTERS.filter((entry)=>entry.tags.includes('unique')).length).toBeGreaterThanOrEqual(19);});
  it('keeps named uniques out of ordinary ecology pools',()=>{for(const theme of THEMES){expect(monstersForTheme(theme,120).every((entry)=>!entry.tags.includes('unique'))).toBe(true);if(theme.id!=='abyss')expect(uniqueMonstersForTheme(theme,120).length).toBeGreaterThanOrEqual(1);}});
  it('offers distinct traditional starting origins through the same player state',()=>{expect(ORIGINS.length).toBeGreaterThanOrEqual(5);const scout=createNewGame('origin-a','scout').state;const warden=createNewGame('origin-b','warden').state;expect(scout.player.ammo).toBeGreaterThan(warden.player.ammo);expect(warden.player.maxHp).toBeGreaterThan(scout.player.maxHp);expect(scout.player.inventory.some((entry)=>entry.defId==='short-bow')).toBe(true);});
});
`);
