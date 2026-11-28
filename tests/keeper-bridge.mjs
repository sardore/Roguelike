// Run after npm run build:qa. 장고의 간수 용암 범람이 종이다리를 바꾸면 그 칸의 부서짐 경고 기록도 사라진다.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = `globalThis.br={run:()=>{state.debugBattle57=false;state.monsters=[];state.tempTerrain74=[];state.rumorSpaces1030=[];for(let y=4;y<40;y++)for(let x=4;x<60;x++)setTerrainTile58(state.map,x,y,TT.FLOOR);
 const m={...clone(BOSSES[20]),boss:true,x:30,y:20,alerted:true};OccupancyService.addMonster(m);prepareBossArena(m);m.keeperLava54={phases:[],stage:0};OccupancyService.move(state.player,26,20);
 const cells=[[27,20],[28,20],[29,22],[25,20]];for(const[x,y]of cells)setTerrainTile58(state.map,x,y,TT.PAPER_BRIDGE);
 const h=hz();for(const[x,y]of cells.slice(0,3))globalThis.__MANRU_HAZARD_CORE__.armFragile(x,y,TT.PAPER_BRIDGE,{cause:'walk'});
  const out={armedBefore:Object.keys(h.armed).length};
 const phase={stage:1,width:5,origin:{x:30,y:20},target:null};floodKeeperArena54(m,phase);
 out.tiles=cells.map(([x,y])=>state.map[y][x]);out.armedAfter=Object.keys(hz().armed);out.collapsedAfter=Object.keys(hz().collapsed);
 state.playerAgencyTurns57=(state.playerAgencyTurns57||0)+3;hazardPostTurn({hazard1005:{}});out.armedAfterTurn=Object.keys(hz().armed);out.collapsedAfterTurn=Object.keys(hz().collapsed);return out}};`;
const runtime = assembleGame(path.join(repo, 'src')).text.replace(QA_MARKER, fs.readFileSync(path.join(repo, 'src/qa/qa.js'), 'utf8') + '\n' + bridge);
const browser = await launch();
try {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.route('**/scripts/10-runtime.js', r => r.fulfill({ contentType: 'text/javascript', body: runtime }));
  const s = await openSession(browser, path.join(repo, 'dist-qa'), { context: ctx, seed: 9 });
  await startRun(s, 'swordsman'); await dismissModals(s); await s.tick(300);
  const out = await s.page.evaluate(() => { try { return br.run() } catch (e) { return { error: String(e.stack).slice(0, 500) } } });
  console.log(JSON.stringify(out));
  assert.ok(!out.error, out.error);
  assert.equal(out.armedBefore, 3, '준비한 종이다리 경고가 없다');
  assert.deepEqual(out.armedAfter, [], `용암·석교로 바뀐 칸에 종이다리 부서짐 표시가 남았다 ${out.armedAfter}`);
  console.log('keeper-bridge: ok');
} finally { await browser.close(); }
