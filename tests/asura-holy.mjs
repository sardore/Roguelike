// Run after npm run build:qa. 천수 아수라의 다완 투척은 성광 속성 ×1.5 피해이고, 성광 저항으로 줄거나 막힌다.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = 'globalThis.asuraTest={turn:(m,d,t)=>asuraTurn(m,d,t),add:m=>OccupancyService.addMonster(m),state:()=>state,TT,MONSTERS,scaled:scaledMonster,wait:()=>TurnEngine.advance({handled:true,committed:true,timeCost:1,reason:"t"}),log:()=>state.log?.slice?.(-6)};';
const runtime = assembleGame(path.join(repo, 'src')).text.replace(QA_MARKER,
  fs.readFileSync(path.join(repo, 'src/qa/qa.js'), 'utf8') + '\n' + bridge);
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
await ctx.route('**/scripts/10-runtime.js', r => r.fulfill({ contentType: 'text/javascript', body: runtime }));
const s = await openSession(browser, path.join(repo, 'dist-qa'), { context: ctx, seed: 5 });
await startRun(s, 'swordsman'); await dismissModals(s); await s.tick(500);
const out = await s.page.evaluate(() => {
  const T = asuraTest, st = T.state(), p = st.player, r = {};
  st.tutorialEntry60 = { completed: true }; st.monsters = []; st.items = []; st.playerAgencyTurns57 = 10; st.floor = 22;
  const y = p.y;
  for (let x = p.x - 2; x <= p.x + 14; x++) for (let dy = -3; dy <= 3; dy++) st.map[y + dy][x] = T.TT.FLOOR;
  const run = resist => {
    st.monsters = []; p.baseMaxHpPermanent = 400; p.hp = p.maxHp = 400; p.armor = { name: 't', resist: resist ? { holy: resist } : {} }; p.cloak = null; p.relic = null; p.trinket = null;
    const def = T.MONSTERS.find(m => m.name === '천수 아수라'), m = T.scaled(JSON.parse(JSON.stringify(def)), 22);
    Object.assign(m, { x: p.x + 7, y, hp: 1000, maxHp: 1000, alerted: true, asuraZone61: 3, asuraVolleyWarn61: 1, asuraVolleyTarget61: { x: p.x, y }, asuraDomainX61: m.x, asuraDomainY61: m.y });
    T.add(m); const before = p.hp; st.log = []; r['acted' + resist] = T.turn(m, 7, p); r['log' + resist] = st.log.slice(0, 4).map(l => l.text || l); return before - p.hp;
  };
  r.plain = run(0); r.resist1 = run(1); r.immune = run(3);
  return r;
});
console.log('asura-holy', JSON.stringify(out));
assert.ok(out.plain > 0, 'the volley hurt');
assert.ok(out.resist1 < out.plain, 'holy resistance I lowers it: ' + out.resist1 + ' < ' + out.plain);
assert.equal(out.immune, 0, 'holy resistance III blocks it');
console.log('asura-holy: ok');
await browser.close(); process.exit(0);
