// Run after npm run build:qa. 적연협곡 네 층이 만들어지고 층끼리 이어지며, 4층 끝에 적연 지룡이 적연 용암궁을 들고 있다.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = `globalThis.cy={state:()=>state,go:branchTransition,TT,vis:()=>VisibilityService.compute(),upd:()=>updateAll()};`;
const runtime = assembleGame(path.join(repo, 'src')).text.replace(QA_MARKER, fs.readFileSync(path.join(repo, 'src/qa/qa.js'), 'utf8') + '\n' + bridge);
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 780 }, isMobile: true, hasTouch: true });
await ctx.route('**/scripts/10-runtime.js', r => r.fulfill({ contentType: 'text/javascript', body: runtime }));
const s = await openSession(browser, path.join(repo, 'dist-qa'), { context: ctx, seed: 7 });
const errors = []; s.page.on('pageerror', e => errors.push(e.message));
await startRun(s, 'swordsman'); await dismissModals(s); await s.tick(200);
const out = [];
for (let round = 0; round < 6; round++) {
  for (const level of [1, 2, 3, 4]) {
    const info = await s.page.evaluate(([level, round]) => {
      const st0 = cy.state(); st0.branchWorld105 = { version: 1, pages: {} }; st0.runId984 = 'canyon-' + round;
      const ok = cy.go({ id: 'qa-canyon', to: 'canyon:' + level, arrival: 'up' });
      const st = cy.state(), T = cy.TT;
      const names = {}; for (const m of st.monsters) names[m.name] = (names[m.name] || 0) + 1;
      const boss = st.monsters.find(m => m.canyonWyrm105);
      return { ok, level, id: st.branchContext105?.id, size: [st.map[0].length, st.map.length], portals: st.branchPortals105.map(p => p.id + '>' + p.to), mobs: st.monsters.length, names,
        rafts: st.rafts.length, voids: st.map.flat().filter(t => t === T.VOID).length, boss: boss ? { name: boss.name, weapon: (boss.inventory || []).some(i => i.artifactId46 === 'lava_bow') } : null };
    }, [level, round]);
    out.push(info);
  }
}
console.log(JSON.stringify(out.slice(0, 4)));
for (const o of out) {
  assert.equal(o.ok, true, JSON.stringify(o));
  assert.equal(o.id, 'canyon', JSON.stringify(o));
  assert.ok(o.mobs >= 15, '몹이 너무 적다 ' + JSON.stringify(o));
  assert.ok(!('월화 궁수' in o.names) || o.level >= 2, '월화 궁수는 2층부터 ' + JSON.stringify(o.names));
  if (o.level < 4) assert.ok(o.portals.some(p => p.startsWith('down>canyon:' + (o.level + 1))), JSON.stringify(o));
  else assert.ok(o.boss && o.boss.name === '적연 지룡' && o.boss.weapon, JSON.stringify(o));
  if (o.level === 3) assert.ok(o.rafts >= 1, '3층에 움직이는 발판이 없다');
  if (o.level < 4) assert.ok(o.voids > 500, '내려다보이는 협곡이 없다');
}
// screenshots of each floor at the arrival
for (const level of [1, 2, 3, 4]) {
  await s.page.evaluate(level => { const st0 = cy.state(); st0.branchWorld105 = { version: 1, pages: {} }; cy.go({ id: 'qa-canyon', to: 'canyon:' + level, arrival: 'up' }); cy.state().monsters.length; cy.vis(); cy.upd() }, level);
  await s.tick(700);
  if (process.env.CANYON_SHOTS) await s.page.screenshot({ path: path.join(process.env.CANYON_SHOTS, `canyon_${level}.png`) });
}
assert.deepEqual(errors, []);
await browser.close();
console.log('canyon: ok');
process.exit(0);
