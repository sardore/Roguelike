// Run after npm run build:qa. 흑성채 가구는 그림이 아니라 역할을 가진 타일 위에 선다: 침대·선반은 막히고, 솥은 조리가 되고, 항아리는 깨진다.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = `globalThis.cf={state:()=>state,TT,go:l=>{state.branchWorld105={version:1,pages:{}};state.branchContext105={id:'citadel',level:l};buildBranch('citadel',l)},pass:(x,y)=>ReachabilityService.playerPassable(x,y),stand:(m)=>PlacementService.monsterCanStand(m,m.x,m.y)};`;
const runtime = assembleGame(path.join(repo, 'src')).text.replace(QA_MARKER, fs.readFileSync(path.join(repo, 'src/qa/qa.js'), 'utf8') + '\n' + bridge);
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
await ctx.route('**/scripts/10-runtime.js', r => r.fulfill({ contentType: 'text/javascript', body: runtime }));
const s = await openSession(browser, path.join(repo, 'dist-qa'), { context: ctx, seed: 9 });
const errors = []; s.page.on('pageerror', e => errors.push(e.message));
await startRun(s, 'swordsman'); await dismissModals(s); await s.tick(300);
const out = await s.page.evaluate(() => {
  const r = {};
  for (const lv of [1, 2, 3, 4]) {
    cf.go(lv);
    const st = cf.state(), T = cf.TT, props = st.branchTerrain105.props, rows = Object.entries(props);
    const at = (name) => rows.filter(([, p]) => p === name).map(([key]) => { const [x, y] = key.split(',').map(Number); return { x, y, t: st.map[y][x] }; });
    const solid = st.branchTerrain105.citadel105.solidFurnishings105;
    const beds = at('bed').concat(at('white-bed')), shelves = at('shelf'), stoves = at('stove'), urns = at('urns');
    r[lv] = {
      solid, total: rows.length,
      bedsBlocked: beds.every(q => q.t === T.STONE_PATH || !cf.pass(q.x, q.y)),
      shelvesBlocked: shelves.every(q => q.t === T.STONE_PATH || !cf.pass(q.x, q.y)),
      bedConverted: beds.filter(q => q.t !== T.STONE_PATH).length,
      stoveCook: stoves.filter(q => q.t !== T.STONE_PATH).every(q => q.t === T.COOKPOT),
      urnJar: urns.filter(q => q.t !== T.STONE_PATH).every(q => q.t === T.JAR),
      anvilsKept: at('anvil').every(q => q.t === T.STONE_PATH),
      buried: st.monsters.filter(m => { const p = props[m.x + ',' + m.y]; return p && st.map[m.y][m.x] !== T.STONE_PATH && !m.flying; }).length,
    };
  }
  return r;
});
console.log(JSON.stringify(out));
for (const lv of [1, 2, 3, 4]) {
  const o = out[lv];
  assert.ok(o.solid > o.total * .5, `${lv}층 가구 대부분이 막히지 않는다 ${o.solid}/${o.total}`);
  assert.ok(o.bedsBlocked && o.shelvesBlocked, `${lv}층 침대·선반을 통과한다`);
  assert.ok(o.stoveCook && o.urnJar && o.anvilsKept, `${lv}층 가구 역할 타일이 어긋난다`);
  assert.equal(o.buried, 0, `${lv}층 몬스터가 가구 속에 갇혔다`);
}
assert.deepEqual(errors, []);
await browser.close();
console.log('citadel-furniture: ok');
process.exit(0);
