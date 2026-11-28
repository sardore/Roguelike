// Run after npm run build:qa. 흑성채에 본관 몹을 층별·탑 콘셉트별로 둔다.
// 흉조 까마귀(2층), 피뢰 갑병(2~3층), 보주의 파수꾼(4층)에 더해 4테마(16~20층) 몹이 수비대·묘역·취사·저장 탑에 선다.
// 각 몹은 정해진 층과 탑 콘셉트에만 나오고, 수비병은 숙영성·철문루·북문성 같은 수비 탑에 실제로 선다.
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
  const r = { ok: {}, count: {}, where: {}, err: [] };
  for (let round = 0; round < 4; round++) for (const level of [1, 2, 3, 4]) {
    const st0 = cg.state(); st0.branchWorld105 = { version: 1, pages: {} }; st0.runId984 = 'g-' + round;
    try { cg.build('citadel', level); r.ok[level] = r.ok[level] !== false } catch (e) { r.ok[level] = false; r.err.push(level + ':' + e.message); continue }
    const towers = cg.state().branchTerrain105?.citadel105?.towers || [];
    for (const m of cg.state().monsters) {
      const name = m.name.replace(' · 문지기', ''), c = towers.find(t => t.id === m.citadelFormation105?.tower)?.concept105;
      (r.count[name] ||= {})[level] = (r.count[name][level] || 0) + 1;
      if (c) r.where[name + ':' + c] = (r.where[name + ':' + c] || 0) + 1;
    }
  }
  return r;
});
console.log(JSON.stringify({ ok: out.ok, err: out.err }));
for (const level of [1, 2, 3, 4]) assert.ok(out.ok[level], level + '층 생성 실패 ' + out.err.join(' | '));
// name -> [levels, tower concepts]
const guests = {
  '흉조 까마귀': [[2], ['ossuary', 'tomb', 'chapel', 'observatory']],
  '피뢰 갑병': [[2, 3], ['forge', 'siege', 'armory', 'command']],
  '보주의 파수꾼': [[4], ['treasury', 'central', 'command', 'fortress']],
  '수비병': [[1, 2, 3, 4], ['barracks', 'gatehouse', 'watch', 'fortress', 'command', 'armory']],
  '경비 인형 - 보병': [[1, 2, 3], ['barracks', 'gatehouse', 'watch', 'fortress', 'siege', 'treasury']],
  '경비 인형 - 포병': [[2, 3, 4], ['watch', 'siege', 'fortress', 'gatehouse', 'armory', 'treasury']],
  '강철이': [[3, 4], ['armory', 'siege', 'gatehouse', 'fortress', 'command']],
  '성채 비행 감시자': [[1, 2, 3], ['watch', 'observatory', 'bell', 'gatehouse', 'fortress', 'archive', 'treasury']],
  '강시': [[1, 2, 3], ['ossuary', 'tomb', 'chapel', 'central']],
  '식귀': [[1, 2, 3], ['kitchen', 'store', 'infirmary', 'ossuary']],
  '굶주린 창고 쥐': [[1, 2], ['store', 'kitchen', 'cistern', 'barracks']],
  '산성 슬라임': [[2, 3], ['cistern', 'store', 'infirmary', 'forge']],
  '껍질슬라임': [[2, 3, 4], ['cistern', 'store', 'treasury']],
  '녹아내린 슬라임': [[2, 3], ['forge', 'siege', 'kitchen']],
  '살라맨더': [[3, 4], ['forge', 'kitchen', 'siege', 'armory']]
};
for (const [name, [levels, concepts]] of Object.entries(guests)) {
  for (const [level, n] of Object.entries(out.count[name] || {})) assert.ok(levels.includes(Number(level)) || n === 0, `${name}이 ${level}층에 나왔다`);
}
// 본관 몹의 원래 약속: 까마귀는 2층에만, 피뢰 갑병은 2~3층에만, 파수꾼은 4층에만.
const total = name => Object.values(out.count[name] || {}).reduce((a, b) => a + b, 0);
assert.ok(total('흉조 까마귀') > 0 && total('피뢰 갑병') > 0 && total('보주의 파수꾼') > 0, '기존 본관 몹이 사라졌다');
// 새로 들인 4테마 몹은 주요 종이 실제로 나와야 한다(희귀한 껍질·녹아내린 슬라임·살라맨더는 있으면 규칙만 본다).
for (const name of ['수비병', '경비 인형 - 보병', '경비 인형 - 포병', '성채 비행 감시자', '강시', '식귀']) assert.ok(total(name) > 0, `${name}이 흑성채에 없다`);
for (const key of Object.keys(out.where)) { const [n, c] = key.split(':'); if (guests[n]) assert.ok(guests[n][1].includes(c), `${n}이 ${c} 탑에 있다`); }
// 수비 탑에는 수비병이 선다.
for (const c of ['barracks', 'gatehouse', 'fortress']) assert.ok(out.where['수비병:' + c] > 0, `${c} 탑에 수비병이 없다`);
assert.deepEqual(errors, []);
await browser.close();
console.log('citadel-guests: ok');
process.exit(0);
