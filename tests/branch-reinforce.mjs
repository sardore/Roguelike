// Run after npm run build:qa. 흑성채와 천면경탑도 자연 증원을 받는다: 몹이 줄어들면 시간이 지나 그 던전의 몹이 멀리서 다시 나타난다.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = `globalThis.br={state:()=>state,go:branchTransition,wait:()=>TurnEngine.advance({handled:true,committed:true,timeCost:1,reason:'t'}),natural:isNaturalMonster,
 remove:m=>OccupancyService.removeMonster(m),farthest:()=>{const walk=ReachabilityService.playerSearch(state.player,{ignoreOccupants:true});let best=null;for(const [key,d] of walk.dist)if(!best||d>best.d){const [x,y]=key.split(',').map(Number);best={x,y,d}}return best}};`;
const runtime = assembleGame(path.join(repo, 'src')).text.replace(QA_MARKER, fs.readFileSync(path.join(repo, 'src/qa/qa.js'), 'utf8') + '\n' + bridge);
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
await ctx.route('**/scripts/10-runtime.js', r => r.fulfill({ contentType: 'text/javascript', body: runtime }));
const s = await openSession(browser, path.join(repo, 'dist-qa'), { context: ctx, seed: 217 });
const errors = []; s.page.on('pageerror', e => errors.push(e.message));
await startRun(s, 'swordsman'); await dismissModals(s); await s.tick(1000);
const out = {};
for (const [id, to] of [['citadel', 'citadel:1'], ['mirror', 'mirror:1']]) {
  out[id] = await s.page.evaluate(([id, to]) => {
    const ok = br.go({ id: 'qa-' + id, to, arrival: 'up' });
    const st = br.state(); st.player.hp = st.player.maxHp = 9999;
    st.floor = Math.max(st.floor, 12);
    st.naturalPopulation57 = null;
    br.wait();
    const far = br.farthest(); st.player.x = far.x; st.player.y = far.y; st.player.hp = st.player.maxHp = 9999; st.visible.clear();
    const initial = st.naturalPopulation57?.initial || 0;
    // thin the population out, then let time pass
    const nat = st.monsters.filter(br.natural);
    for (const m of nat.slice(0, Math.ceil(nat.length * .8))) br.remove(m);
    const after = st.monsters.filter(br.natural).length;
    for (let i = 0; i < 400; i++) { br.wait(); if (st.dead) break }
    const re = st.monsters.filter(m => m.spawnProvenance57 === 'natural-reentry');
    return { ok, ctx: st.branchContext105?.id, initial, after, back: re.length, names: [...new Set(re.map(m => m.name))], branch: re.every(m => m.branch105 === id) };
  }, [id, to]);
}
console.log(JSON.stringify(out));
for (const id of ['citadel', 'mirror']) {
  const o = out[id];
  assert.equal(o.ctx, id, JSON.stringify(o));
  assert.ok(o.initial > 0, id + ' 증원 기준 인원이 없다 ' + JSON.stringify(o));
  assert.ok(o.back > 0, id + ' 증원이 오지 않았다 ' + JSON.stringify(o));
  assert.ok(o.branch, id + ' 증원이 그 던전 몹이 아니다');
}
assert.deepEqual(errors, []);
await browser.close();
console.log('branch-reinforce: ok');
process.exit(0);
