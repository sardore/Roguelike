// Run after npm run build:qa. 속성이 분명한 기술은 속성 피해다: 수압탄(수류)·청뢰 파동(전격)·지면 강타(대지)는 그 속성 저항 4단계(면역)에 막히고,
// 창해의 삼중 파도(수류)도 같다. 다른 속성의 면역은 막지 못한다.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = 'globalThis.mse={state:()=>state,MONSTERS,TT,scaled:scaledMonster,legend:id=>globalThis.__MANRU_LEGEND47__.enemyDefinitions(id),special:enemySpecial47,add:m=>OccupancyService.addMonster(m),wave:elementHazardHit,imm:RESIST_IMMUNE57};';
const runtime = assembleGame(path.join(repo, 'src')).text.replace(QA_MARKER, fs.readFileSync(path.join(repo, 'src/qa/qa.js'), 'utf8') + '\n' + bridge);
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
await ctx.route('**/scripts/10-runtime.js', r => r.fulfill({ contentType: 'text/javascript', body: runtime }));
const s = await openSession(browser, path.join(repo, 'dist-qa'), { context: ctx, seed: 5 });
const errors = []; s.page.on('pageerror', e => errors.push(e.message));
await startRun(s, 'swordsman'); await dismissModals(s); await s.tick(500);
const out = await s.page.evaluate(() => {
  const st = mse.state(), p = st.player, r = {}, real = globalThis.__MANRU_RANDOM57__;
  st.tutorialEntry60 = { completed: true }; st.monsters = []; st.items = []; st.playerAgencyTurns57 = 10; st.floor = 14;
  for (let x = p.x - 2; x <= p.x + 9; x++) for (let dy = -3; dy <= 3; dy++) st.map[p.y + dy][x] = mse.TT.FLOOR;
  globalThis.__MANRU_RANDOM57__ = () => .5;
  const dungeons = { waterBurst: 'water_crossbow', thunderPulse: 'thunder_spear', earthQuake: 'earth_gauntlet' }, elems = { waterBurst: 'water', thunderPulse: 'shock', earthQuake: 'earth' };
  for (const [skill, dungeon] of Object.entries(dungeons)) {
    const def = mse.legend(dungeon).find(d => d.legendSkill47 === skill), res = {};
    const fire = armor => {
      p.baseMaxHpPermanent = 400; p.hp = p.maxHp = 400; p.armor = armor; p.cloak = null; st.status = st.status || {};
      const m = mse.scaled(JSON.parse(JSON.stringify(def)), 14); Object.assign(m, { x: p.x + 1, y: p.y, hp: 999, maxHp: 999, alerted: true, legendMob47: true, legendSkill47: skill, stunned: 0, eva: 0 });
      st.monsters = []; mse.add(m); const phase = (m.x * 5 + m.y * 3) % 6;
      for (let t = 0; t < 12; t++) { st.floorTurn = t; if (t % (skill === 'thunderPulse' || skill === 'earthQuake' ? 4 : 5) === phase % (skill === 'thunderPulse' || skill === 'earthQuake' ? 4 : 5)) break }
      p.hp = p.maxHp = 400; m.stunned = 0; const used = mse.special(m, p); return { used, lost: 400 - p.hp };
    };
    res.plain = fire({ name: 't', resist: {} }); res.own = fire({ name: 't', resist: { [elems[skill]]: 4 } }); res.other = fire({ name: 't', resist: { holy: 4 } });
    r[skill] = res;
  }
  // the palace wave: a water hazard
  const dummy = { x: p.x, y: p.y }; p.hp = p.maxHp = 400; p.armor = { name: 't', resist: {} }; r.waveHit = mse.wave(p, 'water', 30, { sourceFaction: 'enemy' }, { delivery: 'hazard' });
  p.hp = p.maxHp = 400; p.armor = { name: 't', resist: { water: 4 } }; r.waveImmune = mse.wave(p, 'water', 30, { sourceFaction: 'enemy' }, { delivery: 'hazard' });
  p.hp = p.maxHp = 400; p.armor = { name: 't', resist: { water: 2 } }; r.waveHalf = mse.wave(p, 'water', 30, { sourceFaction: 'enemy' }, { delivery: 'hazard' });
  globalThis.__MANRU_RANDOM57__ = real; p.armor = null;
  return r;
});
console.log('monster-skill-element', JSON.stringify(out));
for (const skill of ['waterBurst', 'thunderPulse', 'earthQuake']) {
  const o = out[skill]; assert.ok(o.plain.used && o.plain.lost > 0, skill + ' fires and hurts');
  assert.equal(o.own.lost, 0, skill + ': 그 속성 면역(4단계)이면 막힌다');
  assert.ok(o.other.lost > 0, skill + ': 다른 속성 면역으로는 안 막힌다');
}
assert.equal(out.waveHit, 30); assert.equal(out.waveImmune, 0); assert.equal(out.waveHalf, 15);
assert.deepEqual(errors, []);
console.log('monster-skill-element: ok');
await browser.close(); process.exit(0);
