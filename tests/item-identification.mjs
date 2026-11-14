// npm run build:qa && node tests/item-identification.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = `globalThis.fusionTest={state:()=>state,recipes:FUSION_RECIPES,base:TALISMAN_BY_KIND,
  item:recipeItem,use:useInventoryItem,identify:identifyItem,unknown:isUnidentifiedItem,
  TT,occupancy:OccupancyService,fx:FX};`;
const runtime = assembleGame(path.join(repo, 'src')).text.replace(QA_MARKER,
  fs.readFileSync(path.join(repo, 'src/qa/qa.js'), 'utf8') + '\n' + bridge);
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
await ctx.route('**/scripts/10-runtime.js', r => r.fulfill({ contentType: 'text/javascript', body: runtime }));
const s = await openSession(browser, path.join(repo, 'dist-qa'), { context: ctx, seed: 306 });
const evaluate = (fn, arg) => s.page.evaluate(fn, arg);
async function setup(floor = 1) {
  await dismissModals(s); await s.tick(1000);
  await evaluate(floor => {
    const Q = fusionTest, st = Q.state(), p = st.player;
    st.floor = floor; st.branchContext105 = null; st.branchTerrain105 = null;
    st.status = {}; st.log = []; st.elementWard74 = null; st.tempFields = []; st.elementFields74 = [];
    st.tempTerrain74 = []; st.items = []; st.monsters = []; st.terrainReactions105 = null;
    st.terrainUnderlay58 = {}; st.terrainAttachment58 = {}; st.terrainMutationVersion57 = {};
    st.turn = 10; st.floorTurn = 10; st.enemyEnergy = 0; st.playerAgencyTurns57 = 10;
    st.dead = false; st.victory = false; st.tutorialEntry60 = { completed: true };
    p.x = 15; p.y = 15; p.hunger = 100; p.hp = p.maxHp; p.facing = { x: 0, y: -1 };
    p.inventory = []; p.weapon = p.armor = p.cloak = p.trinket = p.relic = null;
    st.visible = new Set(); st.seen = new Set();
    for (let y = 8; y <= 24; y++) for (let x = 8; x <= 24; x++) {
      st.map[y][x] = Q.TT.FLOOR; st.visible.add(`${x},${y}`); st.seen.add(`${x},${y}`);
    }
    Q.occupancy.endShared(); Q.fx.elementAttacks105 = [];
  }, floor);
}
try {
 await startRun(s,'wanderer');await setup();
 const result=await evaluate(()=>{
  const Q=fusionTest,st=Q.state(),p=st.player,K=st.knowledge56;
  const item=Q.item(Q.recipes.find(r=>r.kind==='f_heaveneye'));
  K.talismanKnown={identify:true};K.potionKnown={};
  const potion=window.MANRU_POTIONS.find(i=>i.potionKind);
  p.inventory=[item,{type:'talisman',talismanKind:'obsolete-kind'},{...Q.base.get('mapping'),count:2},{type:'potion',potionKind:'mine_fire105',mineItem105:'oil',identified:true},{...potion,count:1}];
  st.items=[{...Q.base.get('ward'),x:16,y:15,count:1}];
  Q.use(0);
  return {mapping:!!K.talismanKnown.mapping,potion:!!K.potionKnown[potion.potionKind],ground:!!K.talismanKnown.ward,logs:st.log.map(l=>l.text||l)};
 });
 assert.ok(result.mapping&&result.potion&&!result.ground);
 assert.ok(result.logs.some(log=>log.includes('감정 2종')));
 await setup();
 const library=await evaluate(()=>{
   const Q=fusionTest,st=Q.state();
   const potion=window.MANRU_POTIONS[0];
   const scroll={name:'도서관 감식록',type:'scroll',libraryScroll1022:true,libraryKind1022:'identify',count:1};
   const oil={type:'potion',potionKind:'mine_fire105',mineItem105:'oil',identified:true};
   const gear={type:'weapon',name:'손도끼',isIdentified:false,unidentified:true,curse991:'clumsy'};
   const ward={...Q.base.get('ward'),count:1};
   st.knowledge56.potionKnown={};st.knowledge56.talismanKnown={identify:true};
   st.player.inventory=[scroll,oil,{...potion},{...potion},gear,ward];
   Q.use(0);
   return {oilSkipped:!Q.unknown(oil)&&!Q.identify(oil),gear:gear.identified===true&&!('isIdentified' in gear)&&!('unidentified' in gear)&&!!gear.curse,ward:st.knowledge56.talismanKnown.ward,potion:st.knowledge56.potionKnown[potion.potionKind],log:st.log.some(l=>String(l.text||l).includes('물품 3개 감정'))};
 });
 for(const [check,passed] of Object.entries(library))assert.equal(passed,true,check);
 await setup();
 const holy=await evaluate(()=>{
   const Q=fusionTest,st=Q.state(),K=st.knowledge56;
   const scroll=Q.item(Q.recipes.find(r=>r.kind==='f_holy_identify'));
   const talisman={...Q.base.get('ward'),count:1};
   const gear={type:'cloak',name:'시험 망토',unidentified:true,curse991:'binding'};
   const equipped={type:'armor',name:'시험 장착 갑옷',identified:false};
   K.talismanKnown={identify:true};
   st.player.armor=equipped;
   st.player.inventory=[scroll,talisman,gear];
   Q.use(0);
   return !st.player.inventory.includes(scroll)&&gear.identified===true&&!!gear.curse
     &&!('unidentified' in gear)&&!K.talismanKnown.ward&&!equipped.identified;
 });
 assert.equal(holy,true);
 for(const [kind,expected] of [['f_insight_ward',3],['f_identify_upgrade',4]]) {
   await setup();
   const result=await evaluate(kind=>{
     const Q=fusionTest,st=Q.state(),K=st.knowledge56;
     const item=Q.item(Q.recipes.find(r=>r.kind===kind));
     const talismans=['ward','mapping','blink'].map(k=>({...Q.base.get(k),count:1}));
     const gear={type:'weapon',name:'손도끼',identified:false,curse991:'clumsy'};
     K.talismanKnown={identify:true};
     st.player.inventory=[item,...talismans,gear];Q.use(0);
     return talismans.filter(i=>K.talismanKnown[i.talismanKind]).length+Number(gear.identified);
   },kind);
   assert.equal(result,expected,kind);
 }
 await setup();
 const choice=await evaluate(()=>{
   const Q=fusionTest,st=Q.state();
   const item={...Q.base.get('identify'),count:1};
   const oil={type:'potion',potionKind:'mine_fire105',identified:true,mineItem105:'oil'};
   const gear={type:'weapon',name:'손도끼',identified:false,curse991:'clumsy'};
   st.player.inventory=[item,oil,gear];
   Q.use(0);
   const rows=document.querySelectorAll('#choice991List .choice991Row');
   rows[0]?.click();
   return {count:rows.length,known:!Q.unknown(gear),curse:!!gear.curse,consumed:!st.player.inventory.includes(item)};
 });
 assert.deepEqual(choice,{count:1,known:true,curse:true,consumed:true});
 assert.deepEqual(s.errors,[]);
} finally {await s.close();await ctx.close();await browser.close();}
