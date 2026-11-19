// Run after npm run build:qa. 유물·장신구 접사 엔진, 랜다트 생성, 특수효과 훅, 아이콘 시트.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = 'globalThis.charmTest={state:()=>state,make:makeRandart,sprite,lines:charmTraitLines,level:entityElementResist,mult:entityElementMultiplier57,stats:getStats,kill:charmOnKill,hurt:charmOnHurt,post:charmPostTurn,RELICS,TRINKETS,shapes:CHARM_SHAPES_BY_SLOT,mats:CHARM_MATERIALS,guard:charmStatusGuard,drop:dropFloorLoot,detail:inventoryDetailHtml,advance:()=>TurnEngine.advance({handled:true,committed:true,timeCost:1,reason:"t"}),moveCost:()=>MOVE_COST_STAGES.reduce((c,s)=>s.run(c)??c,1)};';
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
    if (pos.length < 2 || pos.length > 3 || pos.some(([, v]) => v !== 1) || neg.length > 1) bad.push(['resist', it.name, JSON.stringify(it.resist)]);
    if (!it.art || !T.shapes[slot].includes(it.art.shape) || !T.mats[it.art.mat]) bad.push(['art', it.name]);
    if (T.lines(it).length < 2) bad.push(['lines', it.name]);
  }
  r.bad = bad.slice(0, 5); r.uniqueNames = names.size;
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
  r.guard = T.guard();
  r.move = +T.moveCost().toFixed(2);
  return r;
});
console.log('charms', JSON.stringify(out));
assert.deepEqual(out.bad, []);
assert.ok(out.uniqueNames >= 40, 'name variety ' + out.uniqueNames);
assert.deepEqual(out.fixed.map(n => n >= 14), [true, true]);
assert.deepEqual(out.lowHp, [3, 2, 0]);
assert.deepEqual([out.fireLevel, out.fireMult], [0, 1]);
assert.deepEqual(out.weak, [-1, 1.4]);
assert.equal(out.regen, 11);
assert.deepEqual(out.kill, [12, 1]);
assert.equal(out.guard, true);
assert.ok(out.move <= 0.9);
// smoke: floor loot rolls, details, turn pipeline with a randart equipped
const smoke = await s.page.evaluate(() => {
  const T = charmTest, st = T.state(), p = st.player; st.tutorialEntry60 = { completed: true };
  const before = st.items.length; for (let i = 0; i < 120; i++) T.drop({ x: p.x + 1 + (i % 5), y: p.y + 1 + (i % 4) });
  const gear = st.items.filter(i => ['relic', 'trinket'].includes(i.type)), arts = gear.filter(i => i.randart);
  const sample = arts[0] || T.make('relic', 3);
  p.relic = T.make('relic', 4); p.trinket = T.make('trinket', 4);
  const html = T.detail(p.relic, 0); st.monsters = []; T.advance(); T.advance();
  return { placed: st.items.length - before, gear: gear.length, arts: arts.length, hasRes: /저항/.test(html), name: p.relic.name };
});
console.log('smoke', JSON.stringify(smoke));
assert.ok(smoke.gear > 0 && smoke.arts > 0, 'randarts drop');
assert.ok(smoke.hasRes, 'detail shows resist chips');
// 4. icon contact sheet: every shape × several materials, plus fixed items
await s.page.evaluate(() => {
  const T = charmTest, host = document.createElement('div');
  host.id = 'charmSheet'; host.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#241d19;padding:8px;display:flex;flex-wrap:wrap;gap:2px;overflow:auto';
  const add = (it, label) => { const wrap = document.createElement('div'); wrap.style.cssText = 'width:96px;text-align:center;font:10px sans-serif;color:#e6d9bd'; const c = document.createElement('canvas'); const src = T.sprite(it); c.width = 96; c.height = 96; const q = c.getContext('2d'); q.imageSmoothingEnabled = false; q.drawImage(src, 0, 0, 96, 96); wrap.append(c, label); host.append(wrap); };
  for (const slot of ['relic', 'trinket']) for (const shape of T.shapes[slot]) for (const mat of ['jade', 'ruby', 'azure', 'gold']) add({ type: slot, name: 'sheet-' + shape + mat, rarity: 'relic', art: { shape, mat, gem: ['fire', 'water', 'ice', 'shock', 'earth', 'grass', 'holy'][(shape.length + mat.length) % 7], glyph: '火' } }, shape + '/' + mat);
  for (const it of [...T.RELICS, ...T.TRINKETS].filter(x => x.art)) add(it, it.name);
  document.body.append(host);
});
await s.page.screenshot({ path: path.join(process.env.CHARM_SHOT_DIR || '/tmp', 'charm-sheet.png') });
console.log('charms: ok');
await browser.close(); process.exit(0);
