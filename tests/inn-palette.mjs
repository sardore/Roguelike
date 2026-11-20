// Run after npm run build:qa. 청풍루(1~5층) 층별 색: 본관 1~5층은 바닥·안개·불빛·분위기가 층마다 다르고,
// 6층 이후와 서브던전(수로·식량창고)은 예전 그대로이며, 데스크톱·모바일에서 그려도 오류가 없다.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = 'globalThis.innT={state:()=>state,colors:()=>regionColors(),inn:()=>innFloorArt(),art:()=>currentFloorArt(),atmos:()=>innAtmosphere(),def:INN_ATMOS_DEFAULT,region:FLOOR91,go:branchTransition};';
const runtime = assembleGame(path.join(repo, 'src')).text.replace(QA_MARKER,
  fs.readFileSync(path.join(repo, 'src/qa/qa.js'), 'utf8') + '\n' + bridge);
const browser = await launch();
const errors = [];
async function session(viewport, isMobile) {
  const ctx = await browser.newContext({ viewport, isMobile: !!isMobile, hasTouch: !!isMobile });
  await ctx.route('**/scripts/10-runtime.js', r => r.fulfill({ contentType: 'text/javascript', body: runtime }));
  const s = await openSession(browser, path.join(repo, 'dist-qa'), { context: ctx, seed: 5 });
  s.page.on('pageerror', e => errors.push(e.message));
  await startRun(s, 'swordsman'); await dismissModals(s); await s.tick(300);
  return s;
}
const s = await session({ width: 1280, height: 800 });
const out = await s.page.evaluate(() => {
  const T = innT, r = { floors: {}, later: {}, branch: {} };
  for (const f of [1, 2, 3, 4, 5]) {
    window.__MANRU_V60_TEST__.floor(f);
    const c = T.colors(), a = T.inn(), m = T.atmos();
    r.floors[f] = { floor: c.floor, alt: c.floorAlt, fog: c.fog, lamp: a?.lamp, art: !!a, atmos: m.rgb, own: m !== T.def, wallOk: /^#[0-9a-f]{6}$/i.test(c.wall) };
  }
  for (const f of [6, 7, 12]) {
    window.__MANRU_V60_TEST__.floor(f);
    const c = T.colors(), z = Math.floor((f - 1) / 5), p = T.region[z];
    r.later[f] = { same: c.floor === p.floor && c.floorAlt === p.alt && c.fog === p.fog, inn: T.inn(), atmosDefault: T.atmos() === T.def };
  }
  window.__MANRU_V60_TEST__.floor(2); T.go({ id: 'q1', to: 'canal:1', arrival: 'up' });
  { const c = T.colors(); r.branch.canal = { ctx: T.state().branchContext105?.id, inn: T.inn(), wall: T.art()?.wall, floorIsRegion: c.floor === T.region[0].floor }; }
  window.__MANRU_V60_TEST__.floor(3); T.go({ id: 'q2', to: 'granary:1', arrival: 'up' });
  { const c = T.colors(); r.branch.granary = { ctx: T.state().branchContext105?.id, inn: T.inn(), art: T.art(), floorIsRegion: c.floor === T.region[0].floor }; }
  return r;
});
console.log('inn-palette', JSON.stringify(out.floors), JSON.stringify(out.later), JSON.stringify(out.branch));
const f = out.floors;
for (const k of [1, 2, 3, 4, 5]) { assert.ok(f[k].art, 'floor ' + k + ' has its own entry'); assert.ok(f[k].own, 'floor ' + k + ' has its own atmosphere'); assert.ok(f[k].wallOk); }
for (const key of ['floor', 'fog', 'lamp', 'atmos']) assert.equal(new Set([1, 2, 3, 4, 5].map(k => f[k][key])).size, 5, 'every inn floor differs in ' + key);
for (const k of [6, 7, 12]) { assert.equal(out.later[k].same, true, 'floor ' + k + ' keeps its region palette'); assert.equal(out.later[k].inn, null); assert.equal(out.later[k].atmosDefault, true); }
assert.equal(out.branch.canal.ctx, 'canal'); assert.equal(out.branch.canal.inn, null); assert.equal(out.branch.canal.wall, '#8a382a', '수로 keeps the floor-2 wall tint it always had'); assert.equal(out.branch.canal.floorIsRegion, true);
assert.equal(out.branch.granary.ctx, 'granary'); assert.equal(out.branch.granary.inn, null); assert.ok(!out.branch.granary.art, '식량창고 is not tinted by floor 3'); assert.equal(out.branch.granary.floorIsRegion, true);

// drawing every inn floor on a desktop and a phone-sized viewport raises nothing
for (const [vp, mobile] of [[{ width: 1280, height: 800 }, false], [{ width: 390, height: 844 }, true]]) {
  const t = await session(vp, mobile);
  for (const fl of [1, 2, 3, 4, 5]) { await t.page.evaluate(n => window.__MANRU_V60_TEST__.floor(n), fl); await t.tick(500); await dismissModals(t); }
  await t.page.context().close();
}
assert.deepEqual(errors, [], 'no page errors while drawing');
console.log('inn-palette: ok');
await browser.close(); process.exit(0);
