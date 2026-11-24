// Run after npm run build:qa. 보주의 파수꾼과 금령은 피해의 4분의 3이 성광이라 성광 저항 Ⅳ이면 대부분 막히고, 만루의 수호상은 수비병처럼 문·계단을 잠근다.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = `globalThis.gh={state:()=>state,MONSTERS,TT,scaled:scaledMonster,hit:(m,ctx)=>monsterAttacksTarget(m,0,ctx),add:m=>OccupancyService.addMonster(m)};`;
const runtime = assembleGame(path.join(repo, 'src')).text.replace(QA_MARKER, fs.readFileSync(path.join(repo, 'src/qa/qa.js'), 'utf8') + '\n' + bridge);
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
await ctx.route('**/scripts/10-runtime.js', r => r.fulfill({ contentType: 'text/javascript', body: runtime }));
const s = await openSession(browser, path.join(repo, 'dist-qa'), { context: ctx, seed: 5 });
const errors = []; s.page.on('pageerror', e => errors.push(e.message));
await startRun(s, 'swordsman'); await dismissModals(s); await s.tick(500);
const out = await s.page.evaluate(() => {
  const T = gh, st = T.state(), p = st.player, r = {};
  globalThis.__MANRU_RANDOM57__ = () => .5;
  st.tutorialEntry60 = { completed: true }; st.monsters = []; st.items = []; st.playerAgencyTurns57 = 10; st.floor = 24;
  for (let x = p.x - 2; x <= p.x + 9; x++) for (let dy = -3; dy <= 3; dy++) st.map[p.y + dy][x] = T.TT.FLOOR;
  for (const [name, delivery] of [['보주의 파수꾼', 'melee'], ['금령', 'ranged']]) {
    const def = T.MONSTERS.find(m => m.name === name);
    const run = lvl => { p.baseMaxHpPermanent = 400; p.hp = p.maxHp = 400; p.armor = { name: 't', resist: lvl ? { holy: lvl } : {} }; let total = 0;
      for (let i = 0; i < 6; i++) { const m = T.scaled(JSON.parse(JSON.stringify(def)), 24); Object.assign(m, { x: p.x + (delivery === 'ranged' ? 3 : 1), y: p.y, hp: 999, maxHp: 999, alerted: true }); st.monsters = []; T.add(m); const b = p.hp; T.hit(m, { target: p, delivery }); total += b - p.hp; p.hp = p.maxHp = 400 } return total };
    r[name] = { element: def.attackElement105, share: def.attackElementShare105, plain: run(0), r4: run(4) };
  }
  const guard = T.scaled(JSON.parse(JSON.stringify(T.MONSTERS.find(m => m.name === '만루의 수호상'))), 24);
  r.statue = { seal: guard.passageSeal, species: guard.passageSeal?.species === guard.name };
  return r;
});
console.log(JSON.stringify(out));
for (const n of ['보주의 파수꾼', '금령']) { const o = out[n]; assert.equal(o.element, 'holy', n); assert.equal(o.share, .75, n); assert.ok(o.plain > 0 && o.r4 < o.plain * .6, n + ' 성광 저항이 듣지 않는다 ' + JSON.stringify(o)); }
assert.ok(out.statue.seal && out.statue.species, '수호상에 문 잠그기가 없다');
assert.deepEqual(errors, []);
await browser.close();
console.log('golden-holy: ok');
process.exit(0);
