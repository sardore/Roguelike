// Run after npm run build:qa. 흑성채에 본관 몹을 층별로 둔다: 2층 흉조 까마귀, 2~3층 피뢰 갑병, 4층 보주의 파수꾼. 그 밖의 층에는 나오지 않는다.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = `globalThis.cg={state:()=>state,build:buildBranch};`;
const runtime = assembleGame(path.join(repo, 'src')).text.replace(QA_MARKER, fs.readFileSync(path.join(repo, 'src/qa/qa.js'), 'utf8') + '\n' + bridge);
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
await ctx.route('**/scripts/10-runtime.js', r => r.fulfill({ contentType: 'text/javascript', body: runtime }));
const s = await openSession(browser, path.join(repo, 'dist-qa'), { context: ctx, seed: 9 });
const errors = []; s.page.on('pageerror', e => errors.push(e.message));
await startRun(s, 'swordsman'); await dismissModals(s); await s.tick(300);
const out = await s.page.evaluate(() => {
  const r = {};
  for (let round = 0; round < 3; round++) for (const level of [1, 2, 3, 4]) {
    const st0 = cg.state(); st0.branchWorld105 = { version: 1, pages: {} }; st0.runId984 = 'g-' + round;
    let ok = true; try { cg.build('citadel', level) } catch (e) { ok = false; (globalThis.__cgErr ||= []).push(level + ':' + e.message) }
    const names = {}, towers = cg.state().branchTerrain105?.citadel105?.towers || []; for (const m of cg.state().monsters) { names[m.name] = (names[m.name] || 0) + 1; const c = towers.find(t => t.id === m.citadelFormation105?.tower)?.concept105; if (['흉조 까마귀', '피뢰 갑병', '보주의 파수꾼'].includes(m.name)) (r.where ||= {})[m.name + ':' + c] = 1 }
    const o = r[level] ||= { ok: true, crow: 0, rod: 0, keeper: 0 };
    o.ok = o.ok && ok; o.crow += names['흉조 까마귀'] || 0; o.rod += names['피뢰 갑병'] || 0; o.keeper += names['보주의 파수꾼'] || 0;
  }
  r.err = globalThis.__cgErr || [];
  return r;
});
console.log(JSON.stringify(out));
for (const level of [1, 2, 3, 4]) assert.ok(out[level].ok, level + '층 생성 실패');
assert.ok(out[2].crow > 0, '2층에 흉조 까마귀가 없다'); assert.equal(out[1].crow + out[3].crow + out[4].crow, 0, '까마귀가 다른 층에 나왔다');
assert.ok(out[2].rod > 0 && out[3].rod > 0, '2~3층에 피뢰 갑병이 없다'); assert.equal(out[1].rod + out[4].rod, 0, '피뢰 갑병이 다른 층에 나왔다');
assert.ok(out[4].keeper > 0, '4층에 보주의 파수꾼이 없다'); assert.equal(out[1].keeper + out[2].keeper + out[3].keeper, 0, '파수꾼이 다른 층에 나왔다');
const ok = { '흉조 까마귀': ['ossuary', 'tomb', 'chapel', 'observatory'], '피뢰 갑병': ['forge', 'siege', 'armory', 'command'], '보주의 파수꾼': ['treasury', 'central', 'command', 'fortress'] };
for (const key of Object.keys(out.where || {})) { const [n, c] = key.split(':'); assert.ok(ok[n].includes(c), n + '이 ' + c + ' 탑에 있다'); }
assert.deepEqual(errors, []);
await browser.close();
console.log('citadel-guests: ok');
process.exit(0);
