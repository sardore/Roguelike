// Run after npm run build:qa. 23층 수몰 회색 도성: 여덟 구역이 고리 하나로 이어진다(감사: 수문 n개를 돌리면 n+1번째 수문까지만 닿는다).
// 네 수문을 돌리면 가동교가 내려오고 수로가 마르며 둑길 문이 열린다. 수룡의 체력이 절반 아래로 떨어지면 열쇠가 떨어지고, 계단까지 걸어갈 수 있다.
// 특수 건물(창고·사당·관아·망루·폐허)에는 지정한 몬스터가 들어 있다.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = `globalThis.dc={state:()=>state,TT,val:()=>validateDrownedCity(),api:()=>globalThis.__MANRU_SPECIAL_FLOORS60__,
 go:f=>{while(state.floor<f){resetFloorScopedState57();state.floor++;NormalFloorGenerator.generate()}},
 reload:()=>{SaveService.commit('probe');const ok=RunLifecycle.continueRun();return{ok:!!ok,floor:state.floor,city:!!state.floor23?.city,on:cityOn(),audit:validateDrownedCity().ok}}};`;
const runtime = assembleGame(path.join(repo, 'src')).text.replace(QA_MARKER, fs.readFileSync(path.join(repo, 'src/qa/qa.js'), 'utf8') + '\n' + bridge);
const browser = await launch();
const results = [];
for (const seed of [5, 11, 23, 42]) {
  const ctx = await browser.newContext();
  await ctx.route('**/scripts/10-runtime.js', r => r.fulfill({ contentType: 'text/javascript', body: runtime }));
  const s = await openSession(browser, path.join(repo, 'dist-qa'), { context: ctx, seed });
  const errors = []; s.page.on('pageerror', e => errors.push(e.message));
  await startRun(s, 'swordsman'); await dismissModals(s); await s.tick(200);
  const r = await s.page.evaluate(seed => {
    dc.state().runId984 = 'drowned-city-' + seed;  // the harness pins the run id; floors are generated from it
    const t0 = performance.now(); dc.go(23); const ms = performance.now() - t0;
    const saved = dc.reload();
    const st = dc.state(), q = st.floor23, T = dc.TT, city = q.city, z = (x, y) => city.zone[y][x];
    const out = { saved, ms: Math.round(ms), hash: dc.api().qa.hash(), layout: st.layoutName, before: dc.val() };
    const kinds = new Set(city.buildings.map(b => b.kind));
    out.plan = { buildings: city.buildings.length, kinds: kinds.size, special: ['warehouse', 'sluice', 'marketHall', 'shrine', 'office', 'tower', 'palace', 'bridgehouse'].every(k => kinds.has(k)),
      covered: city.bridges.filter(b => b.kind === 'covered').length, draws: city.bridges.filter(b => b.kind === 'draw').length,
      encounters: city.encounters.length, spawned: city.encounters.filter(e => st.monsters.some(m => m.name === e.name && Math.max(Math.abs(m.x - e.x), Math.abs(m.y - e.y)) <= (e.r || 2) + 1)).length,
      drawUp: city.bridges.filter(b => b.kind === 'draw').every(b => b.cells.every(c => st.map[c.y][c.x] === T.DRAWBRIDGE_UP)) };
    // turn the four sluices
    for (const id of q.switchIds) dc.api().activateSwitch(st.switches.find(v => v.id === id));
    out.after = { centerUnlocked: q.centerUnlocked, controls: q.controls.every(c => c.activated),
      drawDown: city.bridges.filter(b => b.kind === 'draw').every(b => b.cells.every(c => st.map[c.y][c.x] === T.DRAWBRIDGE_DOWN)),
      drained: q.controls.flatMap(c => c.changes).filter(ch => ch.before === T.WATER).every(ch => st.map[ch.y][ch.x] === T.STONE_PATH && z(ch.x, ch.y) === 'w'),
      gateOpen: q.gateCells.every(c => st.map[c.y][c.x] === T.DRAWBRIDGE_DOWN) };
    const reach = dc.api().flood(st.player);
    out.after.stairsReach = reach.has(st.stairs.x + ',' + st.stairs.y);
    // the dragon's half-health event drops the key on the palace island
    const dragon = st.monsters.find(m => m.name === '여의 수룡');
    out.dragon = !!dragon && z(dragon.x, dragon.y) === 'm';
    if (dragon) dc.api().onMonsterHpThreshold(dragon, dragon.hpThreshold57);
    const key = st.items.find(i => i.type === 'progress_key23');
    out.key = !!key && reach.has(key.x + ',' + key.y);
    return out;
  }, seed);
  r.seed = seed; r.errors = errors; results.push(r);
  await ctx.close();
}
console.log(JSON.stringify(results.map(r => ({ seed: r.seed, hash: r.hash, plan: r.plan }))));
assert.ok(new Set(results.map(r => r.hash)).size >= 3, '시드마다 다른 도성');
for (const r of results) {
  assert.deepEqual(r.saved, { ok: true, floor: 23, city: true, on: true, audit: true }, `seed ${r.seed} save/load`);
  assert.equal(r.before.ok, true, `seed ${r.seed}: ${JSON.stringify(r.before)}`);
  assert.ok(r.plan.buildings >= 50 && r.plan.special && r.plan.covered === 4 && r.plan.draws === 3 && r.plan.drawUp && r.plan.spawned >= r.plan.encounters - 1, `seed ${r.seed} plan ${JSON.stringify(r.plan)}`);
  assert.equal(r.before.linear, true, `seed ${r.seed} 고리길`);
  assert.deepEqual(r.after, { centerUnlocked: true, controls: true, drawDown: true, drained: true, gateOpen: true, stairsReach: true }, `seed ${r.seed}`);
  assert.ok(r.dragon && r.key, `seed ${r.seed} dragon ${r.dragon} key ${r.key}`);
  assert.deepEqual(r.errors, []);
}
await browser.close();
console.log('drowned-city: ok');
process.exit(0);
