// Run after npm run build:qa. 가시숲 2층: 시작 건물·전용 유물·큰 건물, 멀리 가면 몰래 중앙으로 되돌리는 재구성(보이는 구역은 그대로)
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = 'globalThis.th={state:()=>state,build:buildBranch,TT,recenter:thornRecenter,run:thornRun,zone:(x,y)=>thornZoneAt(x,y,state.branchTerrain105.thorn105),find:findMonsterAt,move:(x,y)=>OccupancyService.move(state.player,x,y),go:p=>branchTransition(p),potion:(it,x,y)=>thornPotionThrow(it,x,y),potDef:t=>MANRU_POTIONS.find(q=>q.thornPotion105===t),relicOf:t=>RELICS.find(r=>r.thornTheme105===t),vis:()=>VisibilityService.compute()};';
const runtime = assembleGame(path.join(repo, 'src')).text.replace(QA_MARKER, fs.readFileSync(path.join(repo, 'src/qa/qa.js'), 'utf8') + '\n' + bridge);
const browser = await launch();
try {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.route('**/scripts/10-runtime.js', r => r.fulfill({ contentType: 'text/javascript', body: runtime }));
  const s = await openSession(browser, path.join(repo, 'dist-qa'), { context: ctx, seed: 411 });
  const errors = []; s.page.on('pageerror', e => errors.push(e.message));
  await startRun(s, 'swordsman'); await dismissModals(s);
  const out = await s.page.evaluate(() => {
    const r = { fail: [], gens: 0 };
    const st = th.state(); st.tutorialEntry60 = { completed: true }; st.branchWorld105 = { version: 1, pages: {} }; st.runId984 = 'thorn';
    const sig = (S, cx, cy, R) => { const h = []; for (let y = cy - R; y <= cy + R; y++) for (let x = cx - R; x <= cx + R; x++) h.push(S.map[y][x]); return h };
    try {
      th.build('thorn', 2); r.gens++;
      let S = th.state(), T = S.branchTerrain105.thorn105;
      r.start = !!T.start; r.bigs = T.bigs.map(b => ({ id: b.id, theme: b.theme, grand: b.grand }));
      r.relic = S.items.filter(i => i.thornTheme105).length; r.portals = S.branchPortals105.map(p => p.id);
      r.zones = {}; for (let i = 0; i < T.zoneMap.length; i += 7) r.zones[T.zoneMap[i]] = (r.zones[T.zoneMap[i]] || 0) + 1;
      // walk away: pick a floor cell far from the middle, step there, rebuild; the 25x25 around the player must be the same afterwards
      for (let n = 0; n < 4; n++) {
        S = th.state(); const T0 = S.branchTerrain105.thorn105;
        let best = null; for (let y = 6; y < S.map.length - 6; y++) for (let x = 6; x < S.map[0].length - 6; x++) { if (S.map[y][x] !== th.TT.FLOOR) continue; const d = Math.max(Math.abs(x - 60), Math.abs(y - 64)); if (d >= 36 && d < 50 && (!best || (x * 7 + y * 13 + n) % 11 === 0)) best = { x, y } }
        if (!best) { r.fail.push('no far cell'); break }
        th.move(best.x, best.y); const before = sig(S, best.x, best.y, 10), seenBefore = new Set(S.seen);
        const ok = th.recenter(true); const S2 = th.state(); r.gens += ok ? 1 : 0;
        if (!ok) { r.fail.push('recenter refused ' + n); break }
        const after = sig(S2, 60, 64, 10);
        if (before.join() !== after.join()) { const d = []; for (let i = 0; i < before.length; i++) if (before[i] !== after[i]) d.push((i % 21 - 10) + ',' + (Math.floor(i / 21) - 10) + ':' + before[i] + '>' + after[i]); r.fail.push('patch changed ' + n + ' ' + d.length + ' ' + d.slice(0, 6).join(' ')) }
        if (S2.player.x !== 60 || S2.player.y !== 64) r.fail.push('player not centred ' + S2.player.x + ',' + S2.player.y);
        const T2 = S2.branchTerrain105.thorn105;
        for (const tr of T2.forest) if (S2.map[Math.floor(tr.y - .5)]?.[Math.floor(tr.x)] !== th.TT.GARDEN_TREE) { r.fail.push('tree off tile ' + n); break }
        r.last = { bigs: T2.bigs.length, monsters: S2.monsters.length, items: S2.items.length };
        th.vis();
      }
      // flipping direction swaps what a great hall gives
      const run = th.run(); run.dir = 'up'; r.flip = th.recenter(true); r.dirAfter = run.dir;
    } catch (e) { r.fail.push(String(e && e.stack || e).slice(0, 300)) }
    return r;
  });
  console.log(JSON.stringify(out));
  assert.equal(out.fail.length, 0, out.fail.join(' | '));
  assert.ok(out.start && out.relic === 1 && out.portals.includes('up') && out.bigs.length >= 1, '시작 건물·유물·큰 건물');

  const flow = await s.page.evaluate(async () => {
    const r = { fail: [] };
    try {
      th.build('thorn', 1); let S = th.state(); S.branchWorld105 = S.branchWorld105 || { version: 1, pages: {} };
      const down = S.branchPortals105.find(p => p.id === 'down'); r.floor1Down = !!down;
      // the exit of floor 1 lies in the blood zone
      r.exitZone = (() => { const T = S.branchTerrain105.thorn105; return th.zone(down.x, down.y) })();
      r.go1 = th.go(down); S = th.state(); r.lvl = S.branchContext105?.level; r.dir = th.run().dir;
      r.nearUp = Math.max(Math.abs(S.player.x - 60), Math.abs(S.player.y - 61)) <= 4;
      // wear the web mark, then rebuild until a web hall shows up; its stairs must lead down
      S.player.relic = { ...th.relicOf('web'), count: 1 }; let T = S.branchTerrain105.thorn105, tries = 0;
      while (!(th.state().branchPortals105.some(p => p.id === 'down')) && tries++ < 40) { th.recenter(true) }
      S = th.state(); r.tries = tries; const stairs = S.branchPortals105.find(p => p.id === 'down'); r.stairs = !!stairs;
      if (stairs) {
        th.move(stairs.x, stairs.y + 1); r.go3 = th.go(stairs); S = th.state(); r.lvl3 = S.branchContext105?.level;
        const up3 = S.branchPortals105.find(p => p.id === 'up'); r.back = th.go(up3); S = th.state(); r.lvl2 = S.branchContext105?.level; r.dirBack = th.run().dir;
        r.stairsGone = !S.branchPortals105.some(p => p.id === 'down');
        r.potions = S.items.filter(i => i.thornPotion105).map(i => i.thornPotion105 + ':' + i.count);
      }
      // applying a vial to the worn mark swaps its theme
      S = th.state(); S.player.relic = { ...th.relicOf('web'), count: 1 }; th.potion({ ...th.potDef('fungus'), count: 1 }, S.player.x, S.player.y); r.applied = S.player.relic.thornTheme105; r.runTheme = th.run().theme;
    } catch (e) { r.fail.push(String(e && e.stack || e).slice(0, 400)) }
    return r;
  });
  console.log(JSON.stringify(flow));
  assert.equal(flow.applied, 'fungus', '진액 바르기');
  assert.equal(flow.fail.length, 0, flow.fail.join('|'));
  assert.equal(flow.exitZone, 4, '1층 출구는 핏빛');
  assert.ok(flow.go1 && flow.lvl === 2 && flow.dir === 'down' && flow.nearUp, '1층→2층 이동');
  assert.ok(flow.stairs && flow.go3 && flow.lvl3 === 3 && flow.back && flow.lvl2 === 2 && flow.dirBack === 'up' && flow.stairsGone, '거미줄 건물 계단과 복귀');
  assert.ok(flow.potions.includes('fungus:2'), '올라오면 균사 진액 2개 ' + flow.potions);
  assert.equal(errors.length, 0, errors.join('|'));
  console.log('thornwood2: ok');
} finally { await browser.close(); }
