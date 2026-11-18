// Run after npm run build:qa. 흑산채 2층에는 파편 망령 대신 피뢰 갑병만 배치된다.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = 'globalThis.blackTest={state:()=>state,go:branchTransition,migrate:branchMigrateMonsters,scaled:scaledMonster};';
const runtime = assembleGame(path.join(repo, 'src')).text.replace(QA_MARKER,
  fs.readFileSync(path.join(repo, 'src/qa/qa.js'), 'utf8') + '\n' + bridge);
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
await ctx.route('**/scripts/10-runtime.js', r => r.fulfill({ contentType: 'text/javascript', body: runtime }));
const s = await openSession(browser, path.join(repo, 'dist-qa'), { context: ctx, seed: 217 });
await startRun(s, 'swordsman'); await dismissModals(s); await s.tick(1000);
const fresh = await s.page.evaluate(() => {
  blackTest.go({ id: 'qa-black', to: 'black:2', arrival: 'up' });
  const st = blackTest.state(), names = st.monsters.map(m => m.name);
  return { id: st.branchContext105?.id, level: st.branchContext105?.level, wraiths: names.filter(n => n === '파편 망령').length, plates: names.filter(n => n === '피뢰 갑병').length };
});
assert.equal(fresh.id, 'black'); assert.equal(fresh.level, 2);
assert.equal(fresh.wraiths, 0, '흑산채에 파편 망령이 남아 있다');
assert.ok(fresh.plates > 0, '피뢰 갑병이 배치되지 않았다');
const migrated = await s.page.evaluate(() => {
  const st = blackTest.state(), src = st.monsters.find(m => m.name === '피뢰 갑병');
  const old = { name: '파편 망령', x: src.x, y: src.y, hp: 5, maxHp: 10, legendMob47: true, legendDungeon47: 'mirror_blade', spawnProvenance57: 'subbranch-authored' };
  const page = { branchContext105: { id: 'black', level: 2 }, monsters: [old], map: st.map };
  blackTest.migrate(page, st.branchWorld105);
  const m = page.monsters[0];
  return { name: m.name, hp: m.hp, maxHp: m.maxHp, rod: !!m.lightningRod61, x: m.x === src.x };
});
assert.equal(migrated.name, '피뢰 갑병'); assert.ok(migrated.rod); assert.ok(migrated.x);
assert.ok(migrated.hp >= 1 && migrated.hp <= migrated.maxHp && migrated.hp < migrated.maxHp, JSON.stringify(migrated));
console.log('black lightning plate ok', JSON.stringify({ fresh, migrated }));
await browser.close(); process.exit(0);
