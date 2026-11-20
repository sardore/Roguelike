// Run after npm run build:qa. 권갑: 연철 권갑과 지맥 대지수갑은 공격 비용이 낮고(공속 상향), 연철 권갑은 강화 2회마다 ATK +1.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = 'globalThis.gt={state:()=>state,weapons:WEAPONS,legends:()=>globalThis.__MANRU_LEGEND47__.defs(),cost:weaponActionCost,up:applyWeaponUpgrade,effect:brawlUpgradeEffect42,clone:x=>structuredClone(x)};';
const runtime = assembleGame(path.join(repo, 'src')).text.replace(QA_MARKER, fs.readFileSync(path.join(repo, 'src/qa/qa.js'), 'utf8') + '\n' + bridge);
const browser = await launch();
const ctx = await browser.newContext();
await ctx.route('**/scripts/10-runtime.js', r => r.fulfill({ contentType: 'text/javascript', body: runtime }));
const s = await openSession(browser, path.join(repo, 'dist-qa'), { context: ctx, seed: 9 });
const errors = []; s.page.on('pageerror', e => errors.push(e.message));
await startRun(s, 'swordsman'); await dismissModals(s);
const out = await s.page.evaluate(() => {
  const g = gt.clone(gt.weapons.find(w => w.name === '연철 권갑')), legend = gt.legends().find(d => d.id === 'earth_gauntlet'), r = {};
  r.speed = g.speed; r.cost = gt.cost(g); r.legendSpeed = legend.speed; r.legendCost = gt.cost(legend);
  r.cost16 = gt.cost({ speed: 1.6 }); r.legendOld = gt.cost({ speed: 1.35 });
  r.atk = [g.atk]; g.upgrade = 0;
  for (let i = 0; i < 6; i++) { gt.up(g); r.atk.push(g.atk) }
  r.effect = gt.effect(g);
  const sword = { type: 'weapon', name: 'x', atk: 5, upgrade: 0 }; gt.up(sword); r.normal = sword.atk;
  return r;
});
console.log('gauntlet', JSON.stringify(out));
assert.ok(out.cost < out.cost16 - .1, '연철 권갑이 예전보다 확실히 빠르다');
assert.ok(out.legendCost < out.legendOld - .15, '지맥 대지수갑이 예전보다 확실히 빠르다');
assert.deepEqual(out.atk, [3, 3, 4, 4, 5, 5, 6], '강화 2회마다 ATK +1');
assert.equal(out.effect, 3);
assert.equal(out.normal, 6, '일반 무기는 강화마다 ATK +1');
assert.deepEqual(errors, []);
console.log('gauntlet: ok');
await browser.close(); process.exit(0);
