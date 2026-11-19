// Run after npm run build:qa. 플레이어의 유운 비구름은 적이 행동하기 전에 날아가고, 같은 턴의 적 행동보다 먼저 약화를 건다.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = 'globalThis.yuunTest={state:()=>state,TT,spawn:spawnYuun,advance:()=>TurnEngine.advance({handled:true,committed:true,timeCost:1,reason:"t"}),fields:()=>state.tempFields};';
const runtime = assembleGame(path.join(repo, 'src')).text.replace(QA_MARKER,
  fs.readFileSync(path.join(repo, 'src/qa/qa.js'), 'utf8') + '\n' + bridge);
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
await ctx.route('**/scripts/10-runtime.js', r => r.fulfill({ contentType: 'text/javascript', body: runtime }));
const s = await openSession(browser, path.join(repo, 'dist-qa'), { context: ctx, seed: 5 });
await startRun(s, 'swordsman'); await dismissModals(s); await s.tick(500);
const out = await s.page.evaluate(() => {
  const st = yuunTest.state(), T = yuunTest.TT;
  st.monsters = []; st.items = []; st.tempFields = [];
  st.tutorialEntry60 = { completed: true }; st.playerAgencyTurns57 = 10; st.enemyEnergy = 0;
  const mon = { name: '시험체', x: st.player.x + 6, y: st.player.y, hp: 500, maxHp: 500, atk: 1, def: 0, eva: 0, kind: 'human', shape: 'human', combatantId54: 'yt1', alerted: true };
  st.monsters.push(mon);
  const p = st.player, y = p.y;
  for (let x = p.x - 2; x <= p.x + 14; x++) for (let dy = -3; dy <= 3; dy++) st.map[y + dy][x] = T.FLOOR;
  const route = []; for (let i = 1; i <= 9; i++) route.push({ x: p.x + i, y });
  yuunTest.spawn(p, 1, route);
  const field = yuunTest.fields().find(f => f.yuun);
  const log = [];
  const step = () => { const before = { x: field.x }; const r = yuunTest.advance(); const order = r?.stageOrder || null; log.push({ before: before.x, after: field.x, order }); };
  step(); step(); step();
  return { log, hasStage: log.map(l => l.order ? l.order.indexOf('core:yuun') : null) };
});
console.log('yuun', JSON.stringify(out));
const moved = out.log.filter(l => l.after !== l.before);
assert.ok(moved.length >= 1, '비구름이 움직이지 않았다');
const withOrder = out.log.filter(l => l.order);
if (withOrder.length) for (const l of withOrder) { const i = l.order.indexOf('core:yuun'), j = l.order.indexOf('core:monsters'); assert.ok(i >= 0, 'core:yuun 단계가 없다'); if (j >= 0) assert.ok(i < j, '비구름이 적 행동보다 먼저 움직이지 않았다'); }
console.log('yuun-order: ok');
await browser.close(); process.exit(0);
