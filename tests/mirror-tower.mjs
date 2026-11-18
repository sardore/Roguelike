// Run after npm run build:qa. 천면경탑 3개 층이 생성되고 층끼리 이어지며 3층에 천면경 검이 놓인다.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = 'globalThis.mirrorTest={state:()=>state,go:branchTransition};';
const runtime = assembleGame(path.join(repo, 'src')).text.replace(QA_MARKER,
  fs.readFileSync(path.join(repo, 'src/qa/qa.js'), 'utf8') + '\n' + bridge);
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
await ctx.route('**/scripts/10-runtime.js', r => r.fulfill({ contentType: 'text/javascript', body: runtime }));
const s = await openSession(browser, path.join(repo, 'dist-qa'), { context: ctx, seed: 217 });
await startRun(s, 'swordsman'); await dismissModals(s); await s.tick(1000);
const floors = [];
for (const level of [1, 2, 3]) {
  const info = await s.page.evaluate(level => {
    const ok = mirrorTest.go({ id: 'qa-mirror', to: `mirror:${level}`, arrival: 'up' });
    const st = mirrorTest.state();
    return { ok, id: st.branchContext105?.id, level: st.branchContext105?.level, mobs: st.monsters.length,
      portals: st.branchPortals105.map(p => p.id + '>' + p.to),
      weapon: st.items.filter(i => i.artifactId46 === 'mirror_blade').length,
      title: st.layoutName };
  }, level);
  floors.push(info);
  assert.ok(info.ok !== false && info.id === 'mirror' && info.level === level, JSON.stringify(info));
  assert.ok(info.mobs > 0, '몬스터가 없다');
  assert.equal(info.weapon, level === 3 ? 1 : 0, '천면경 검은 3층에만 놓인다');
}
console.log('mirror tower ok', JSON.stringify(floors));
await browser.close(); process.exit(0);
