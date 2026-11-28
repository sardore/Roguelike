// Run after npm run build:qa. 가시숲: 층마다 길이 끊기지 않게 생성되고, 나무는 나무 타일 위에만 서며,
// 어떤 나무 스프라이트도 자기 캔버스 가장자리에서 잘리지 않는다(테두리 픽셀이 모두 투명).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = 'globalThis.th={state:()=>state,build:buildBranch,TT,sprite:(t,c,v)=>thornTreeSprite(t,c,v)};';
const runtime = assembleGame(path.join(repo, 'src')).text.replace(QA_MARKER, fs.readFileSync(path.join(repo, 'src/qa/qa.js'), 'utf8') + '\n' + bridge);
const browser = await launch();
try {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.route('**/scripts/10-runtime.js', r => r.fulfill({ contentType: 'text/javascript', body: runtime }));
  const s = await openSession(browser, path.join(repo, 'dist-qa'), { context: ctx, seed: 217 });
  const errors = []; s.page.on('pageerror', e => errors.push(e.message));
  await startRun(s, 'swordsman'); await dismissModals(s);
  const out = await s.page.evaluate(() => {
    const r = { builds: 0, fail: [], clipped: [], offTile: 0 };
    // every sprite: the outermost ring of pixels must be empty, or something was cut by the canvas edge
    for (let t = 0; t < 5; t++) for (let c = 0; c < 3; c++) for (let v = 0; v < 10; v++) { // the classes the forest uses: undergrowth, mid and tall trees
      const cv = th.sprite(t, c, v), g = cv.getContext('2d'), d = g.getImageData(0, 0, cv.width, cv.height).data, W = cv.width, H = cv.height;
      // top, left and right edges (the bottom edge is the ground the tree stands on)
      let hit = 0; for (let x = 0; x < W; x++) if (d[x * 4 + 3] > 8) hit++;
      for (let y = 0; y < H; y++) { if (d[(y * W) * 4 + 3] > 8) hit++; if (d[(y * W + W - 1) * 4 + 3] > 8) hit++; }
      if (hit) r.clipped.push(`${t}/${c}/${v}:${hit}`);
    }
    const st = th.state(); st.tutorialEntry60 = { completed: true }; st.branchWorld105 = { version: 1, pages: {} }; st.runId984 = 'thorn';
    for (let n = 0; n < 9; n++) {
      try {
        th.build('thorn', 1 + (n % 3)); r.builds++;
        const S = th.state(), T = S.branchTerrain105.thorn105;
        for (const tr of T.forest) if (S.map[Math.floor(tr.y - .5)]?.[Math.floor(tr.x)] !== th.TT.GARDEN_TREE) r.offTile++;
        let tiles = 0; for (const row of S.map) for (const v of row) if (v === th.TT.GARDEN_TREE) tiles++; r.treeTiles = tiles;
        r.last = { cabins: T.cabins.length, clearings: T.clearings.length, plugs: T.plugs.length, trees: T.forest.length, bushes: Object.keys(T.bushes).length, bridges: Object.keys(T.bridges).length, lights: T.lights.length, backPaths: T.backPaths.length, mons: S.monsters.length };
      } catch (e) { r.fail.push(String(e && e.message || e).slice(0, 90)); }
    }
    return r;
  });
  console.log(JSON.stringify(out));
  assert.equal(out.fail.length, 0, `생성 실패 ${out.fail.join(' | ')}`);
  assert.equal(out.clipped.length, 0, `캔버스 가장자리에서 잘린 나무 스프라이트 ${out.clipped.slice(0, 12).join(' ')}`);
  assert.equal(out.offTile, 0, `나무 타일이 아닌 곳에 선 나무 ${out.offTile}`);
  const l = out.last;
  assert.ok(l.cabins >= 2 && l.clearings >= 4 && l.trees >= 800 && l.bushes >= 10 && l.bridges >= 4 && l.lights >= 10 && l.mons >= 8, `구성 부족 ${JSON.stringify(l)}`);
  assert.equal(errors.length, 0, errors.join('|'));
  console.log('thornwood: ok');
} finally { await browser.close(); }
