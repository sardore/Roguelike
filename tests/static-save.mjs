// Run after npm run build:qa. 큰 층(흑성채·용궁)의 생성 결과는 한 번만 직렬화해 매 저장에 이어 붙인다. 이 데이터가 도중에 바뀌지 않는지(감사 모드), 저장본이 전부 담기는지, 턴 저장이 묶여 쓰이는지 본다.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = `globalThis.ss={state:()=>state,go:(to)=>{state.branchWorld105={version:1,pages:{}};branchTransition({id:'qa',to,arrival:'up'})},wait:()=>TurnEngine.advance({handled:true,committed:true,timeCost:1,reason:'t'}),save:()=>SaveService.commit('manual'),flushIdle:()=>SaveService.flushIdle(),flushNow:()=>SaveService.flushDeferred('qa'),sent:()=>RuntimeState.persistence.pending};`;
const runtime = assembleGame(path.join(repo, 'src')).text.replace(QA_MARKER, fs.readFileSync(path.join(repo, 'src/qa/qa.js'), 'utf8') + '\n' + bridge);
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
await ctx.route('**/scripts/10-runtime.js', r => r.fulfill({ contentType: 'text/javascript', body: runtime }));
const s = await openSession(browser, path.join(repo, 'dist-qa'), { context: ctx, seed: 9 });
const errors = []; s.page.on('pageerror', e => errors.push(e.message));
await startRun(s, 'swordsman'); await dismissModals(s); await s.tick(300);
const out = await s.page.evaluate(() => {
  globalThis.__MANRU_STATIC_AUDIT__ = true;
  const r = {};
  for (const to of ['citadel:1', 'palace:1', 'palace:2']) {
    ss.go(to);
    const st = ss.state(); st.monsters.length = Math.min(st.monsters.length, 30);
    const first = ss.save();
    const slot = () => localStorage.getItem('manru1004_active_run') || localStorage.getItem('manru1004_shadow_run');
    for (let i = 0; i < 40; i++) ss.wait();
    const pending = ss.flushNow();
    const second = ss.save();
    const q = JSON.parse(localStorage.getItem(second.primaryWritten ? 'manru1004_active_run' : 'manru1004_shadow_run'));
    const body = q.state || q, T = body.branchTerrain105;
    const keys = T.citadel105 ? ['cellOwner105', 'relicCells105', 'towers'] : ['roomCells', 'facades', 'floors'];
    const sub = T.citadel105 || T.palace105;
    r[to] = { first: first.ok, second: second.ok, restored: keys.every(k => sub[k] && Object.keys(sub[k]).length > 0), pending: pending?.ok ?? null, turn: body.turn };
  }
  return r;
});
console.log(JSON.stringify(out));
for (const [to, o] of Object.entries(out)) {
  assert.ok(o.first && o.second, to + ' 저장 실패');
  assert.ok(o.restored, to + ' 저장본에 생성 데이터가 빠졌다');
}
assert.deepEqual(errors, []);
await browser.close();
console.log('static-save: ok');
process.exit(0);
