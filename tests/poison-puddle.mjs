// Run after npm run build:qa. 맹독 물약: 떫은 산열매 + 소회복 비약. 던진 자리 3×3에 독웅덩이(장독을 깨면 고이는 웅덩이와 같은 공용 웅덩이)가 고인다.
// 웅덩이에 닿은 화살(깔려 있던 것, 나중에 떨어진 것 모두)은 독화살이 되고, 독화살은 맞힌 적을 중독시키지만 명중률이 낮다.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = `globalThis.pp={
 pos:()=>({x:state.player.x,y:state.player.y}),
 open:()=>{const p=state.player;for(let yy=Math.max(2,p.y-4);yy<=Math.min(ROWS-3,p.y+4);yy++)for(let xx=Math.max(2,p.x-2);xx<=Math.min(COLS-3,p.x+8);xx++){setTerrainTile58(state.map,xx,yy,TT.FLOOR);state.seen.add(xx+","+yy)}state.items=[];state.monsters=[];VisibilityService.compute()},
 recipe:()=>matchRecipe([{item:{...MOUNTAIN_BERRY}},{item:{...POTIONS.find(p=>p.potionKind==='heal_small'),type:'potion'}}])?.name||null,
 arrow:(kind,n,x,y)=>{const a=clone(globalThis.MANRU_AMMO.find(v=>v.ammoKind===kind));a.count=n;a.x=x;a.y=y;state.items.push(a)},
 throwFlask:(dx)=>{const p=state.player,flask={...CONSUMABLES.find(i=>i.name==='맹독 물약'),count:1};p.inventory.push(flask);consumeFood(flask,p.inventory.indexOf(flask));const ok=throwFood(p.x+dx,p.y);return{ok,left:p.inventory.filter(i=>i.name==='맹독 물약').length}},
 puddle:()=>{const r=terrainReactions105(),s=Object.values(r.spills||{});return{cells:s.length,kinds:[...new Set(s.map(v=>v.kind))],ttl:s[0]?.ttl}},
 ammo:()=>state.items.filter(i=>i.type==='ammo').map(i=>i.name+':'+i.count).sort(),
 tick:(n)=>{for(let i=0;i<n;i++){state.turn++;tickTerrainReactions105()}},
 standing:()=>{const p=state.player,m=scaledMonster(MONSTERS.find(d=>d.name==='취객')||MONSTERS[0]);m.x=p.x+3;m.y=p.y;m.hp=m.maxHp=999;state.monsters.push(m);environmentStanding105(m);return m.poisoned57||0},
 shoot:(kind)=>{const p=state.player;p.weapon=clone(WEAPONS.find(w=>w.name==='사냥용 목궁'));const a=clone(globalThis.MANRU_AMMO.find(x=>x.ammoKind===kind));a.count=400;p.inventory=p.inventory.filter(i=>i.type!=='ammo');p.inventory.push(a);p.loadedAmmoKind=kind;state.monsters=[];
  const m=scaledMonster(MONSTERS.find(d=>d.name==='취객')||MONSTERS[0]);m.x=p.x+3;m.y=p.y;m.hp=m.maxHp=99999;m.def=0;m.eva=0;state.monsters.push(m);VisibilityService.compute();
  let hits=0,poisoned=0;for(let i=0;i<400;i++){m.hp=m.maxHp;m.poisoned57=0;state._activeAmmo967=a;if(attackPlayerCore54R(m,0,{})!==false){hits++;if(m.poisoned57>0)poisoned++}}return{hits,poisoned}}
};`;
const runtime = assembleGame(path.join(repo, 'src')).text.replace(QA_MARKER, fs.readFileSync(path.join(repo, 'src/qa/qa.js'), 'utf8') + '\n' + bridge);
const browser = await launch();
const ctx = await browser.newContext();
await ctx.route('**/scripts/10-runtime.js', r => r.fulfill({ contentType: 'text/javascript', body: runtime }));
const s = await openSession(browser, path.join(repo, 'dist-qa'), { context: ctx, seed: 5 });
const errors = []; s.page.on('pageerror', e => errors.push(e.message));
await startRun(s, 'archer'); await dismissModals(s);
const ev = (f, ...a) => s.page.evaluate(f, ...a);

assert.equal(await ev(() => pp.recipe()), '맹독 물약');
await ev(() => pp.open());
// an arrow lying where the puddle will form, one at its edge, one far away
const here = await ev(() => { const p = pp.pos(); return { x: p.x + 3, y: p.y }; });
await ev(([x, y]) => { pp.arrow('wood_arrow', 7, x, y); pp.arrow('iron_arrow', 3, x + 1, y + 1); pp.arrow('wood_arrow', 2, x + 6, y + 3); }, [here.x, here.y]);
const thrown = await ev(() => pp.throwFlask(3));
assert.deepEqual(thrown, { ok: true, left: 0 }, '맹독 물약을 던지면 한 병이 쓰인다');
const puddle = await ev(() => pp.puddle());
assert.deepEqual(puddle, { cells: 9, kinds: ['poison'], ttl: 10 }, '3×3 독웅덩이가 10턴 고인다');
assert.deepEqual(await ev(() => pp.ammo()), ['독화살:3', '독화살:7', '목제 화살:2'], '웅덩이 위 화살은 독화살이 되고 먼 화살은 그대로');
// an arrow that lands in the puddle later
await ev(([x, y]) => pp.arrow('wood_arrow', 4, x - 1, y), [here.x, here.y]);
await ev(() => pp.tick(1));
assert.ok((await ev(() => pp.ammo())).includes('독화살:4'), '나중에 떨어진 화살도 독화살이 된다');
assert.equal(await ev(() => pp.standing()) > 0, true, '웅덩이를 밟은 적은 중독된다');
await ev(() => pp.tick(11));
assert.equal((await ev(() => pp.puddle())).cells, 0, '웅덩이는 마른다');
// poison arrows poison on hit and miss more often
await ev(() => pp.open());
const wood = await ev(() => pp.shoot('wood_arrow')), poison = await ev(() => pp.shoot('poison_arrow'));
assert.equal(wood.poisoned, 0);
assert.equal(poison.poisoned, poison.hits, '독화살은 맞히면 항상 중독시킨다');
assert.ok(poison.hits < wood.hits - 20, `독화살은 명중률이 낮다 (${poison.hits} < ${wood.hits})`);
assert.deepEqual(errors, []);
console.log('poison-puddle', JSON.stringify({ puddle, wood, poison }));
console.log('poison-puddle: ok');
await browser.close(); process.exit(0);
