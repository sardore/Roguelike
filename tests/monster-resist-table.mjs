// Run after npm run build:qa. 몬스터 속성표: 종족·체질·비행·자기 공격 속성·보스·정의 저항으로 단계가 정해지고(−1 취약 … 3 면역),
// 피해 배율은 그 단계만 따른다. 설명창에는 빠름·역할군·속성표가 뜬다.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = 'globalThis.rtT={state:()=>state,TT,MONSTERS,scaled:scaledMonster,cfg:m=>configureMonsterTraits(m),table:m=>monsterElementTable(m),mult:(m,e)=>entityElementMultiplier57(m,e),info:m=>monsterInfo986(m),legend:id=>globalThis.__MANRU_LEGEND47__.enemyDefinitions(id)};';
const runtime = assembleGame(path.join(repo, 'src')).text.replace(QA_MARKER,
  fs.readFileSync(path.join(repo, 'src/qa/qa.js'), 'utf8') + '\n' + bridge);
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
await ctx.route('**/scripts/10-runtime.js', r => r.fulfill({ contentType: 'text/javascript', body: runtime }));
const s = await openSession(browser, path.join(repo, 'dist-qa'), { context: ctx, seed: 5 });
await startRun(s, 'swordsman'); await dismissModals(s); await s.tick(300);
const out = await s.page.evaluate(() => {
  const T = rtT, st = T.state(), p = st.player;
  const mk = (name, dungeon) => { const def = dungeon ? T.legend(dungeon).find(d => d.name === name) : T.MONSTERS.find(d => d.name === name); const m = T.scaled(JSON.parse(JSON.stringify(def)), 14); Object.assign(m, { x: p.x + 1, y: p.y }); T.cfg(m); return m; };
  const r = {};
  for (const [name, dungeon] of [['독꽃'], ['강시'], ['식인 물고기'], ['살라맨더'], ['수목 궁수'], ['파편 망령', 'mirror_blade'], ['객잔 쥐']]) {
    const m = mk(name, dungeon), info = T.info(m);
    r[name] = { table: T.table(m), fire: T.mult(m, 'fire'), holy: T.mult(m, 'holy'), meta: info.meta, role: info.role, elements: info.elements.length };
  }
  const boss = mk('객잔 쥐'); boss.boss = true; r.boss = T.table(boss);
  const king = mk('식인 물고기'); king.boss = true; r.aquaticBoss = T.table(king).water;
  const extra = mk('객잔 쥐'); extra.resist = { fire: 3 }; r.defined = T.table(extra);
  // a fish already weak to lightning does not also take the water-conduction bonus
  const fish = mk('식인 물고기'); st.map[fish.y][fish.x] = T.TT.WATER; r.fishShockInWater = T.mult(fish, 'shock');
  const rat = mk('객잔 쥐'); st.map[rat.y][rat.x] = T.TT.WATER; r.ratShockInWater = T.mult(rat, 'shock');
  return r;
});
const near = (a, b, msg) => assert.ok(Math.abs(a - b) < 1e-9, msg + ': ' + a + ' vs ' + b);
assert.equal(out['독꽃'].table.fire, -1); assert.equal(out['독꽃'].table.grass, 2); near(out['독꽃'].fire, 1.4, 'plant burns');
assert.equal(out['강시'].table.holy, -1); assert.equal(out['강시'].table.grass, -1); near(out['강시'].holy, 1.4, 'undead fears light');
assert.equal(out['식인 물고기'].table.water, 2); assert.equal(out['식인 물고기'].table.shock, -1); assert.equal(out['식인 물고기'].table.ice, -1);
assert.equal(out['살라맨더'].table.fire, 2); assert.equal(out['살라맨더'].table.water, -1); near(out['살라맨더'].fire, .30, 'fire body');
assert.equal(out['수목 궁수'].table.grass, 1, 'own attack element');
assert.equal(out['파편 망령'].table.ice, 1); assert.equal(out['파편 망령'].table.holy, -1);
assert.ok(Object.values(out.boss).every(v => v === 1), 'boss +1 everywhere');
assert.equal(out.defined.fire, 3, 'definition resist adds on top');
assert.equal(out.aquaticBoss, 2, 'traits alone never reach immunity');
near(out.fishShockInWater, 1.4, 'weakness and conduction do not stack'); near(out.ratShockInWater, 1.5, 'water conducts');
assert.ok(out['객잔 쥐'].meta.includes('빠름'), '객잔 쥐 shows 빠름');
assert.ok(out['독꽃'].role?.startsWith('독 포대'), '독꽃 shows its role');
assert.ok(Object.values(out).filter(v => v.elements).every(v => v.elements === 7), 'info has a 7-element table');
console.log('monster-resist-table: ok');
await browser.close(); process.exit(0);
