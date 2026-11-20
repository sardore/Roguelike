// Run after npm run build:qa. 유물·장신구 접사 엔진, 랜다트 생성, 특수효과 훅, 아이콘 시트.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = 'globalThis.charmTest={mhit:(m,ctx)=>monsterAttacksTarget(m,0,ctx),TT,capacity:inventoryCapacity,grade:CHARM_SHAPE_GRADE,strike:charmStrike,onStatus:charmOnStatus,gasFirst:charmGasFirstTurn,save:charmSaveConsumable,baneEffect:runBaneEffect,baneHurt:baneOnHurt,baneKill:baneOnKill,banes:CHARM_BANES,spawn:spawnMonster,quirks:CHARM_QUIRKS,curses:CURSE_CATALOG,cstat:charmStats,cmove:charmMoveCost,cpost:charmPostTurn,stack:curseStackCount,state:()=>state,make:makeRandart,sprite,lines:charmTraitLines,level:entityElementResist,mult:entityElementMultiplier57,stats:getStats,kill:charmOnKill,hurt:charmOnHurt,post:charmPostTurn,RELICS,TRINKETS,shapes:CHARM_SHAPES_BY_SLOT,mats:CHARM_MATERIALS,guard:charmStatusGuard,drop:dropFloorLoot,detail:inventoryDetailHtml,advance:()=>TurnEngine.advance({handled:true,committed:true,timeCost:1,reason:"t"}),moveCost:()=>MOVE_COST_STAGES.reduce((c,s)=>s.run(c)??c,1)};';
const runtime = assembleGame(path.join(repo, 'src')).text.replace(QA_MARKER,
  fs.readFileSync(path.join(repo, 'src/qa/qa.js'), 'utf8') + '\n' + bridge);
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
await ctx.route('**/scripts/10-runtime.js', r => r.fulfill({ contentType: 'text/javascript', body: runtime }));
const s = await openSession(browser, path.join(repo, 'dist-qa'), { context: ctx, seed: 5 });
await startRun(s, 'swordsman'); await dismissModals(s); await s.tick(500);
const out = await s.page.evaluate(() => {
  const T = charmTest, st = T.state(), p = st.player, r = {};
  // 1. generation invariants
  const names = new Set(), bad = [];
  for (let i = 0; i < 400; i++) {
    const slot = i % 2 ? 'relic' : 'trinket', tier = 1 + (i % 5), it = T.make(slot, tier);
    names.add(it.name);
    const res = Object.entries(it.resist || {});
    const pos = res.filter(([, v]) => v > 0), neg = res.filter(([, v]) => v < 0);
    if (pos.some(([, v]) => v > 3) || res.some(([, v]) => v < -1) || neg.length > 2 || (tier < 3 && pos.some(([, v]) => v > 2))) bad.push(['resist', it.name, JSON.stringify(it.resist)]);
    if (!it.art || !T.shapes[slot].includes(it.art.shape) || !T.mats[it.art.mat]) bad.push(['art', it.name]);
    if (T.lines(it).length < 1 && !['atk', 'def', 'eva', 'will', 'vision'].some(k => it[k] > 0)) bad.push(['lines', it.name]);
  }
  r.bad = bad.slice(0, 5); r.uniqueNames = names.size;
  // budgets are not always spread: lopsided pieces and weaknesses show up now and then, and a weakness pays for more elsewhere
  const shape = { high: 0, weak: 0, none: 0, wide: 0, bigStat: 0, weakBigStat: 0, allEffects: 0, sumWeak: 0, nWeak: 0, sumPlain: 0, nPlain: 0 };
  for (let i = 0; i < 3000; i++) {
    const tier = 1 + (i % 5), it = T.make(i % 2 ? 'relic' : 'trinket', tier), v = Object.values(it.resist || {});
    const stats = ['atk', 'def', 'eva', 'will', 'vision'].map(k => it[k] || 0), big = Math.max(...stats) >= tier + 2, weak = v.some(x => x < 0);
    const value = v.filter(x => x > 0).reduce((a, b) => a + b, 0) + stats.filter(x => x > 0).reduce((a, b) => a + b, 0);
    if (v.some(x => x >= 2)) shape.high++; if (weak) shape.weak++; if (!v.some(x => x > 0)) shape.none++; if (v.filter(x => x > 0).length >= 4) shape.wide++;
    if (big) shape.bigStat++; if (big && weak) shape.weakBigStat++; if (!stats.some(x => x > 0) && !v.some(x => x > 0)) shape.allEffects++;
    if (weak && !it.curse991) { shape.sumWeak += value; shape.nWeak++ } else if (!it.curse991 && !stats.some(x => x < 0)) { shape.sumPlain += value; shape.nPlain++ }
  }
  r.shape = shape;
  // 2. fixed catalog
  r.fixed = [T.RELICS.length, T.TRINKETS.length];
  // 3. hooks
  p.relic = { name: 't1', killHeal: 2, killFocus: 1, thorns: 3, lowHpAtk: 3, critAdd: .05, regenEvery: 2, statusGuard: 1, moveMul: .9, resist: { fire: -1 } };
  p.trinket = { name: 't2', lowHpDef: 2, regenEvery: 4, resist: { fire: 1 } };
  p.maxHp = 50; p.hp = 50; const hi = T.stats();
  p.hp = 15; const lo = T.stats();
  r.lowHp = [lo.atk - hi.atk, lo.def - hi.def, +(lo.critBonus - hi.critBonus).toFixed(2)];
  r.fireLevel = T.level(p, 'fire'); r.fireMult = T.mult(p, 'fire');
  p.relic.resist = { fire: -1 }; p.trinket.resist = {}; r.weak = [T.level(p, 'fire'), T.mult(p, 'fire')];
  p.hp = 10; st.turn = 4; T.post(); r.regen = p.hp;
  p.focus = 0; const m = { hp: 5, x: p.x + 1, y: p.y, lastDamageOpponent57: 'player' };
  p.hp = 10; T.kill(m); r.kill = [p.hp, p.focus];
  r.guard = Array.from({ length: 40 }, () => T.guard()).filter(Boolean).length;
  r.move = +T.moveCost().toFixed(2);
  return r;
});
console.log('charms', JSON.stringify(out));
assert.deepEqual(out.bad, []);
assert.ok(out.uniqueNames >= 40, 'name variety ' + out.uniqueNames);
console.log('shape', JSON.stringify(out.shape));
for (const k of ['high', 'weak', 'none', 'bigStat']) assert.ok(out.shape[k] > 60 && out.shape[k] < 1500, 'sometimes ' + k + ': ' + out.shape[k]);
assert.ok(out.shape.wide > 15 && out.shape.wide < 400, 'wide wards are rare but happen: ' + out.shape.wide);
assert.ok(out.shape.weakBigStat > 10, 'a weakness traded for one big stat happens: ' + out.shape.weakBigStat);
assert.ok(out.shape.allEffects > 5, 'some pieces are all effects: ' + out.shape.allEffects);
assert.ok(out.shape.sumWeak / out.shape.nWeak > out.shape.sumPlain / out.shape.nPlain, 'a weakness buys more elsewhere');
assert.deepEqual(out.fixed.map(n => n >= 14), [true, true]);
assert.deepEqual(out.lowHp, [3, 2, 0]);
assert.deepEqual([out.fireLevel, out.fireMult], [0, 1]);
assert.deepEqual(out.weak, [-1, 1.4]);
assert.equal(out.regen, 11);
assert.deepEqual(out.kill, [12, 1]);
assert.ok(out.guard >= 15 && out.guard <= 39, 'status guard ~75%: ' + out.guard);
assert.ok(out.move <= 0.9);
// smoke: floor loot rolls, details, turn pipeline with a randart equipped
const smoke = await s.page.evaluate(() => {
  const T = charmTest, st = T.state(), p = st.player; st.tutorialEntry60 = { completed: true };
  const before = st.items.length; for (let i = 0; i < 120; i++) T.drop({ x: p.x + 1 + (i % 5), y: p.y + 1 + (i % 4) });
  const gear = st.items.filter(i => ['relic', 'trinket'].includes(i.type)), arts = gear.filter(i => i.randart);
  const sample = arts[0] || T.make('relic', 3);
  // not every randart rolls a resist; take one that did so the detail check has something to show
  do p.relic = T.make('relic', 4); while (!Object.values(p.relic.resist || {}).some(v => v > 0)); p.trinket = T.make('trinket', 4);
  const html = T.detail(p.relic, 0); st.monsters = []; T.advance(); T.advance();
  return { placed: st.items.length - before, gear: gear.length, arts: arts.length, hasRes: /저항/.test(html), name: p.relic.name };
});
console.log('smoke', JSON.stringify(smoke));
assert.ok(smoke.gear > 0 && smoke.arts > 0, 'randarts drop');
assert.ok(smoke.hasRes, 'detail shows resist chips');

// quirks and curses: direct hook checks, then generation weights
const fx = await s.page.evaluate(() => {
  const T = charmTest, st = T.state(), p = st.player, r = {};
  st.tutorialEntry60 = { completed: true }; st.monsters = [];
  p.maxHp = 60; p.hp = 60; p.hunger = 100; p.relic = null; p.trinket = { name: 'q', quirk: 'echo' };
  const mk = (x, y) => { let m = T.spawn({ x, y }, false, {}); for (let n = 0; n < 40 && !m; n++) m = T.spawn(null, false, {}); Object.assign(m, { x, y, hp: 400, maxHp: 400, def: 0 }); return m };
  // 메아리: the same target builds, a new one resets
  const a = mk(p.x + 2, p.y), b = mk(p.x - 2, p.y), h0 = a.hp;
  T.strike(a, p, 5); T.strike(a, p, 5); T.strike(a, p, 5); r.echo = h0 - a.hp; T.strike(b, p, 5); r.echoReset = p.charmEcho;
  // 그림자 걸음: charge after five moves, next hit doubles
  p.trinket = { name: 'q', quirk: 'shadowStep' }; p.charmLast = { x: p.x, y: p.y }; p.charmStreak = 0;
  for (let i = 0; i < 5; i++) { p.x += 1; T.cpost() } r.shadowReady = !!p.charmShadowReady;
  const h1 = a.hp; T.strike(a, p, 9); r.shadowHit = h1 - a.hp; r.shadowSpent = !p.charmShadowReady;
  // 허기 전환
  p.trinket = { name: 'q', quirk: 'hungerSwap' }; const base = T.cstat({ atk: 0, def: 0, eva: 0, will: 0, vision: 5, maxFocus: 10 }).atk;
  p.hunger = 20; r.hungerAtk = T.cstat({ atk: 0, def: 0, eva: 0, will: 0, vision: 5, maxFocus: 10 }).atk - base; p.hunger = 100;
  // 유령 걸음: after a hit the move cost drops
  p.trinket = { name: 'q', quirk: 'ghostStep' }; st.turn = 50; r.ghostBefore = T.cmove(1); T.hurt(a, 3); r.ghostAfter = +T.cmove(1).toFixed(2);
  // 공기정화: first exposure ignored, the second turn is not
  p.trinket = { name: 'q', quirk: 'airPurify' }; p.charmGasTurn = undefined; st.turn = 60; const g1 = T.gasFirst(true); st.turn = 61; const g2 = T.gasFirst(true); st.turn = 80; const g3 = T.gasFirst(true);
  r.gas = [g1, g2, g3];
  // 쌍둥이: spares a potion when the roll is low
  p.trinket = { name: 'q', quirk: 'twins' }; const pot = { name: '소회복 비약', type: 'potion', count: 1 }; p.inventory.push(pot);
  const rnd = globalThis.__MANRU_RANDOM57__; globalThis.__MANRU_RANDOM57__ = () => 0.01; r.twins = T.save(pot, 1, p.inventory); globalThis.__MANRU_RANDOM57__ = rnd;
  p.inventory.splice(p.inventory.indexOf(pot), 1);
  // 역류: a status on the wearer is passed to the nearest foe in sight
  p.trinket = { name: 'q', quirk: 'backlash' }; st.visible.add(a.x + ',' + a.y); a.x = p.x + 2; a.y = p.y; st.visible.add(a.x + ',' + a.y);
  globalThis.__MANRU_RANDOM57__ = () => 0.01; T.onStatus('poison', 3); globalThis.__MANRU_RANDOM57__ = rnd; r.backlash = (a.poison || a.status?.poison || a.statusTurns?.poison || 0) >= 0;
  return r;
});
console.log('quirks', JSON.stringify(fx));
assert.ok(fx.echo >= 3 && fx.echo <= 10, 'echo stacks ' + fx.echo); assert.equal(fx.echoReset, 0);
assert.equal(fx.shadowReady, true); assert.ok(fx.shadowHit >= 9, 'shadow double ' + fx.shadowHit); assert.equal(fx.shadowSpent, true);
assert.ok(fx.hungerAtk >= 2 && fx.hungerAtk <= 3, 'hunger swap ' + fx.hungerAtk);
assert.ok(fx.ghostAfter <= .71 && fx.ghostBefore === 1, 'ghost step ' + fx.ghostBefore + '/' + fx.ghostAfter);
assert.deepEqual(fx.gas, [true, false, true]); assert.equal(fx.twins, true);

// 요행: a blow about to land sometimes makes the wearer step back; out of reach it misses, never onto a dangerous cell
const lucky = await s.page.evaluate(() => {
  const T = charmTest, st = T.state(), p = st.player, r = {}, real = globalThis.__MANRU_RANDOM57__;
  const floor = st.map[p.y][p.x], lava = T.TT.LAVA;
  const reset = () => { st.monsters = []; p.hp = p.maxHp = 200; p.trinket = { name: 'l', quirk: 'luckyMend' }; for (let dy = -2; dy <= 2; dy++) for (let dx = -6; dx <= 6; dx++) if (st.map[p.y + dy]?.[p.x + dx] != null) st.map[p.y + dy][p.x + dx] = floor; };
  const hit = (m, ctx) => { globalThis.__MANRU_RANDOM57__ = () => (new Error().stack || '').includes('charmLuckyStep') ? .01 : .99; try { return T.mhit(m, ctx) } finally { globalThis.__MANRU_RANDOM57__ = real } };
  const foe = (x, y, extra = {}) => { const m = T.spawn({ x, y }, false, {}); Object.assign(m, { x, y, hp: 99, maxHp: 99, atk: 20, alerted: true, ranged: false, reach: 1 }, extra); return m };
  // melee from the east: steps west and the blow misses
  reset(); let x0 = p.x, m = foe(p.x + 1, p.y), res = hit(m, { target: p, delivery: 'melee' });
  r.meleeMoved = x0 - p.x; r.meleeMissed = !!res.evaded && p.hp === 200;
  // every way back is lava: no step, the blow lands
  reset(); x0 = p.x; for (const [dx, dy] of [[-1, 0], [-1, -1], [-1, 1]]) st.map[p.y + dy][p.x + dx] = lava; m = foe(p.x + 1, p.y); hit(m, { target: p, delivery: 'melee' });
  r.lavaStayed = p.x === x0; r.lavaHurt = p.hp < 200;
  // a shot down a straight line still reaches after the step
  reset(); m = foe(p.x + 4, p.y, { ranged: true, range: 7 }); x0 = p.x; hit(m, { target: p, delivery: 'ranged', projectile: true, range: 7 });
  r.rangedMoved = x0 - p.x; r.rangedHurt = p.hp < 200;
  p.trinket = null; st.monsters = []; return r;
});
console.log('lucky', JSON.stringify(lucky));
assert.equal(lucky.meleeMoved, 1); assert.equal(lucky.meleeMissed, true, 'out of melee reach after the step');
assert.equal(lucky.lavaStayed, true, 'never steps onto lava'); assert.equal(lucky.lavaHurt, true);
assert.equal(lucky.rangedMoved, 1); assert.equal(lucky.rangedHurt, true, 'a straight shot still lands');

const cur = await s.page.evaluate(() => {
  const T = charmTest, st = T.state(), p = st.player, r = {};
  st.monsters = []; p.maxHp = 80; p.hp = 80; p.trinket = null; p.relic = null;
  const c = id => T.banes[id], run = (e, id) => T.baneEffect(e, p, 1, c(id)), ids = ['roar', 'summon', 'selfblast', 'wander', 'glutton', 'mirror_image', 'scream'];
  r.catalog = ids.map(id => !!c(id)); r.notCurses = ids.every(id => !T.curses.some(x => x.id === id));
  r.glutton250 = c('glutton').period;
  r.roar = run('roar', 'roar');
  r.summon = run('summon', 'summon'); r.summoned = st.monsters.filter(m => m.curseSummon991).length; r.summon2 = run('summon', 'summon');
  for (const m of st.monsters) { m.hp = m.maxHp = 500; m.x = p.x + 1; m.y = p.y }
  const mh = st.monsters.map(m => m.hp); r.blast = run('selfblast', 'selfblast'); r.blastHurt = st.monsters.some((m, i) => m.hp < mh[i]); r.blastAlive = p.hp >= 1 && p.hp < 80;
  p.hp = 2; run('selfblast', 'selfblast'); r.blastNoKill = p.hp >= 1; p.hp = 80;
  const food = { name: '주먹밥', type: 'food', count: 1 }; p.inventory.push(food); const n0 = p.inventory.length; run('eatfood', 'glutton'); r.ate = n0 - p.inventory.length;
  const hp0 = p.hp; p.inventory = p.inventory.filter(i => i.type !== 'food'); run('eatfood', 'glutton'); r.bite = hp0 - p.hp;
  // banes work while a relic or trinket carrying them is worn
  p.trinket = { name: 'b1', bane: 'scream' }; p.hp = 20; st.turn = 200; p.curseScreamCd = 0;
  T.baneHurt(null, 5); r.screamCd = p.curseScreamCd > 200;
  p.trinket = { name: 'b2', bane: 'mirror_image' }; st.map[p.y][p.x + 2] = st.map[p.y][p.x]; st.monsters = st.monsters.filter(m => !(m.x === p.x + 2 && m.y === p.y)); const dead = { name: '시험체', x: p.x + 2, y: p.y, maxHp: 30 };
  const before = st.monsters.length; T.baneKill(dead); r.mirror = st.monsters.length - before; r.mirrorTagged = st.monsters.some(m => m.curseMirror991);
  // a worn bane fires on its own clock and stops when the piece comes off
  st.monsters = []; p.trinket = { name: 'b3', bane: 'roar' }; p.baneClock = {}; const t0 = st.turn; let fired = 0;
  for (let i = 0; i < 30; i++) { st.turn = t0 + i; const before = p.baneClock.roar; T.post(); if (before != null && p.baneClock.roar !== before) fired++ }
  r.roarFired = fired; p.trinket = null; T.post(); r.clockCleared = p.baneClock.roar == null;
  p.trinket = null; return r;
});
console.log('curses', JSON.stringify(cur));
assert.deepEqual(cur.catalog, [true, true, true, true, true, true, true]); assert.equal(cur.notCurses, true, 'banes are not curses'); assert.equal(cur.roarFired, 2, 'roar every 14 turns while worn'); assert.equal(cur.clockCleared, true); assert.equal(cur.glutton250, 250);
assert.equal(cur.roar, true); assert.equal(cur.summon, true); assert.equal(cur.summoned, 1); assert.equal(cur.summon2, false);
assert.equal(cur.blastHurt, true); assert.equal(cur.blastAlive, true); assert.equal(cur.blastNoKill, true);
assert.equal(cur.ate, 1); assert.equal(cur.bite, 3); assert.equal(cur.screamCd, true); assert.equal(cur.mirror, 1); assert.equal(cur.mirrorTagged, true);

const dist = await s.page.evaluate(() => {
  const T = charmTest, tally = {}, old = ['chainBurst', 'luckyMend', 'lastStand', 'feast', 'frostWard'];
  let n = 0, quirky = 0, cursed = 0, baned = 0, oldQ = 0, bad = [];
  for (let i = 0; i < 3000; i++) {
    const it = T.make(i % 2 ? 'relic' : 'trinket', 2 + (i % 4));
    n++; if (it.quirk) { quirky++; tally[it.quirk] = (tally[it.quirk] || 0) + 1; if (old.includes(it.quirk)) oldQ++ }
    if (it.bane) { baned++; if (T.curses.some(x => x.id === it.bane)) bad.push('bane is a curse') }
    if (it.curse991) { cursed++; if (it.curseImmune991) bad.push('immune+curse'); if (T.banes[it.curse991]) bad.push('bane rolled as curse') }
    else if (!it.curseImmune991) bad.push('plain not immune');
    const sp = ['bagSlots', 'regenEvery', 'killHeal', 'killFocus', 'thorns', 'lowHpAtk', 'lowHpDef', 'critAdd', 'moveMul', 'atkCostMul', 'statusGuard', 'strike'].filter(k => it[k]).length;
    if (sp > 4) bad.push('too many specials ' + sp);
  }
  return { n, quirky, cursed, baned, oldShare: +(oldQ / Math.max(1, quirky)).toFixed(2), tally, bad: bad.slice(0, 3) };
});
console.log('dist', JSON.stringify(dist));
assert.deepEqual(dist.bad, []);
assert.ok(dist.cursed > dist.n * .02 && dist.cursed < dist.n * .12, 'cursed share ' + dist.cursed);
assert.ok(dist.baned > dist.n * .04 && dist.baned < dist.n * .2, 'bane share ' + dist.baned);
assert.ok(dist.oldShare > .45 && dist.oldShare < .85, 'old quirks stay the common ones ' + dist.oldShare);
for (const q of ['echo', 'shadowStep', 'backlash', 'treasureSense', 'fullMoon', 'hungerSwap', 'fireKnot', 'twins', 'ghostStep', 'airPurify', 'frostStep']) assert.ok((dist.tally[q] || 0) > 0, 'quirk appears: ' + q);

// better gear tends to better designs; fixed items are the minority of relic/trinket loot
const grades = await s.page.evaluate(() => {
  const T = charmTest, G = T.grade, out = { low: { simple: 0, fine: 0, grand: 0 }, high: { simple: 0, fine: 0, grand: 0 } };
  for (let i = 0; i < 3000; i++) {
    const it = T.make(i % 2 ? 'relic' : 'trinket', 1 + (i % 5)), score = Object.keys(it.resist || {}).length + ['bagSlots', 'regenEvery', 'killHeal', 'killFocus', 'thorns', 'lowHpAtk', 'lowHpDef', 'critAdd', 'moveMul', 'atkCostMul', 'statusGuard', 'strike'].filter(k => it[k]).length + (it.quirk ? 2 : 0);
    out[score >= 5 ? 'high' : 'low'][G[it.art.shape]]++;
  }
  return out;
});
console.log('grades', JSON.stringify(grades));
const share = (o, k) => o[k] / Math.max(1, o.simple + o.fine + o.grand);
assert.ok(share(grades.high, 'grand') > share(grades.low, 'grand') * 2, 'high-score gear gets grand designs more often');
assert.ok(share(grades.high, 'simple') < share(grades.low, 'simple'), 'high-score gear is less often plain');

// fixed pieces each have a drawing of their own that no randart can produce; bag slots are an option on both kinds
const own = await s.page.evaluate(() => {
  const T = charmTest, st = T.state(), p = st.player, r = { fxOnRandart: 0, shapes: [], bagOnRandart: 0, bagFixed: [] };
  for (let i = 0; i < 3000; i++) { const it = T.make(i % 2 ? 'relic' : 'trinket', 1 + (i % 5), { premium: i % 7 === 0 }); if (it.art.shape.startsWith('fx_')) r.fxOnRandart++; if (it.bagSlots) r.bagOnRandart++ }
  const all = [...T.RELICS, ...T.TRINKETS].filter(x => x.art); r.fixed = all.length; r.shapes = all.filter(x => x.art.shape.startsWith('fx_')).map(x => x.art.shape);
  r.distinct = new Set(r.shapes).size; r.bagFixed = all.filter(x => x.bagSlots).map(x => x.name + ':' + x.bagSlots);
  p.relic = null; p.trinket = null; const base = T.capacity(); p.trinket = { name: 'q', bagSlots: 2 }; p.relic = { name: 'r', bagSlots: 3 }; r.cap = T.capacity() - base;
  p.relic = null; p.trinket = null; return r;
});
console.log('own', JSON.stringify(own));
assert.equal(own.fxOnRandart, 0); assert.equal(own.shapes.length, own.fixed, 'every fixed piece has its own design'); assert.equal(own.distinct, own.fixed, 'no two fixed pieces share a design');
assert.ok(own.bagOnRandart > 0 && own.bagOnRandart < 600, 'bag slots roll on randarts sometimes: ' + own.bagOnRandart); assert.ok(own.bagFixed.length >= 3); assert.equal(own.cap, 5);

// premium pieces carry the rarer new effects far more often than ordinary randarts do
const prem = await s.page.evaluate(() => {
  const T = charmTest, old = ['chainBurst', 'luckyMend', 'lastStand', 'feast', 'frostWard']; let n = 0, fresh = 0;
  for (let i = 0; i < 2000; i++) { const it = T.make(i % 2 ? 'relic' : 'trinket', 5, { premium: true }); n++; if (!old.includes(it.quirk)) fresh++ }
  return { n, share: +(fresh / n).toFixed(2) };
});
console.log('premium', JSON.stringify(prem));
assert.ok(prem.share > .8, 'premium favours the new effects: ' + prem.share);
// 4. icon contact sheet: every shape × several materials, plus fixed items
await s.page.evaluate(() => {
  const T = charmTest, host = document.createElement('div');
  host.id = 'charmSheet'; host.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#241d19;padding:8px;display:flex;flex-wrap:wrap;gap:2px;overflow:auto';
  const add = (it, label) => { const wrap = document.createElement('div'); wrap.style.cssText = 'width:96px;text-align:center;font:10px sans-serif;color:#e6d9bd'; const c = document.createElement('canvas'); const src = T.sprite(it); c.width = 96; c.height = 96; const q = c.getContext('2d'); q.imageSmoothingEnabled = false; q.drawImage(src, 0, 0, 96, 96); wrap.append(c, label); host.append(wrap); };
  const mats = Object.keys(T.mats), gems = ['fire', 'water', 'ice', 'shock', 'earth', 'grass', 'holy', 'ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'pearl', 'onyx', 'turquoise'], cords = ['crimson', 'indigo', 'saffron', 'forest', 'violet', 'teal', 'ivory', 'black'];
  let n = 0; for (const slot of ['relic', 'trinket']) for (const shape of T.shapes[slot]) for (let k = 0; k < 6; k++, n++) add({ type: slot, name: 'sheet-' + n, rarity: 'relic', art: { shape, mat: mats[(n * 5 + k * 3) % mats.length], gem: gems[(n * 7) % gems.length], cord: cords[(n * 3) % cords.length], glyph: k % 2 ? '火' : '' } }, shape + '/' + mats[(n * 5 + k * 3) % mats.length]);
  for (let i = 0; i < 6; i++) { const it = T.make(i % 2 ? 'relic' : 'trinket', 5, { premium: true }); add(it, it.name); }
  for (const it of [...T.RELICS, ...T.TRINKETS].filter(x => x.art)) add(it, it.name);
  document.body.append(host);
});
await s.page.screenshot({ path: path.join(process.env.CHARM_SHOT_DIR || '/tmp', 'charm-sheet.png') });
await s.page.evaluate(() => { const T = charmTest, host = document.getElementById('charmSheet'); host.innerHTML = ''; for (const it of [...T.RELICS, ...T.TRINKETS].filter(x => x.art)) { const wrap = document.createElement('div'); wrap.style.cssText = 'width:96px;text-align:center;font:10px sans-serif;color:#e6d9bd'; const c = document.createElement('canvas'); c.width = 96; c.height = 96; const q = c.getContext('2d'); q.imageSmoothingEnabled = false; q.drawImage(T.sprite(it), 0, 0, 96, 96); wrap.append(c, it.name); host.append(wrap) } });
await s.page.screenshot({ path: path.join(process.env.CHARM_SHOT_DIR || '/tmp', 'charm-fixed.png') });
console.log('charms: ok');
await browser.close(); process.exit(0);
