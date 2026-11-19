// Run after npm run build:qa. 원소 저항 3단계(DCSS식): 장비 합산·3단계 면역·몬스터 resist·기존 가드 호환.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = 'globalThis.resTest={state:()=>state,level:entityElementResist,mult:entityElementMultiplier57,guard:entityElementGuard57};';
const runtime = assembleGame(path.join(repo, 'src')).text.replace(QA_MARKER,
  fs.readFileSync(path.join(repo, 'src/qa/qa.js'), 'utf8') + '\n' + bridge);
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
await ctx.route('**/scripts/10-runtime.js', r => r.fulfill({ contentType: 'text/javascript', body: runtime }));
const s = await openSession(browser, path.join(repo, 'dist-qa'), { context: ctx, seed: 5 });
await startRun(s, 'swordsman'); await dismissModals(s); await s.tick(500);
const out = await s.page.evaluate(() => {
  const st = resTest.state(), p = st.player, r = {};
  p.armor = { resist: { fire: 1 } }; p.cloak = {}; p.relic = {}; p.trinket = {};
  r.fire1 = [resTest.level(p, 'fire'), resTest.mult(p, 'fire')];
  p.cloak = { resist: { fire: 1 } }; r.fire2 = [resTest.level(p, 'fire'), resTest.mult(p, 'fire')];
  p.relic = { resist: { fire: 2 } }; r.fireCap = [resTest.level(p, 'fire'), resTest.guard(p, 'fire')];
  r.otherElem = resTest.level(p, 'ice');
  p.armor = { elementGuard74: 'ice' }; p.cloak = {}; p.relic = {};
  r.oldGuard = [resTest.level(p, 'ice'), resTest.guard(p, 'ice')];
  const m = { name: '시험체', x: p.x + 2, y: p.y, hp: 50, maxHp: 50, kind: 'human', resist: { shock: 2 } };
  r.mon = [resTest.level(m, 'shock'), resTest.mult(m, 'shock')];
  return r;
});
console.log('resist', JSON.stringify(out));
assert.deepEqual(out.fire1, [1, 0.55]);
assert.deepEqual(out.fire2, [2, 0.3]);
assert.deepEqual(out.fireCap, [3, true]);
assert.equal(out.otherElem, 0);
assert.deepEqual(out.oldGuard, [3, true]);
assert.deepEqual(out.mon, [2, 0.3]);
console.log('resist-levels: ok');
await browser.close(); process.exit(0);
