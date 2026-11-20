// Run after npm run build:qa. 중독 피해는 목령(초목)속성 피해다: 초목 저항이 있으면 줄고, 취약하면 늘고, 면역이면 0이다.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = 'globalThis.pz={state:()=>state,tick:poisonTickDamage,base:combatDebuffDamage,mon:name=>scaledMonster(MONSTERS.find(m=>m.name===name),5)};';
const runtime = assembleGame(path.join(repo, 'src')).text.replace(QA_MARKER, fs.readFileSync(path.join(repo, 'src/qa/qa.js'), 'utf8') + '\n' + bridge);
const browser = await launch();
const ctx = await browser.newContext();
await ctx.route('**/scripts/10-runtime.js', r => r.fulfill({ contentType: 'text/javascript', body: runtime }));
const s = await openSession(browser, path.join(repo, 'dist-qa'), { context: ctx, seed: 9 });
const errors = []; s.page.on('pageerror', e => errors.push(e.message));
await startRun(s, 'swordsman'); await dismissModals(s);
const out = await s.page.evaluate(() => {
  const st = pz.state(), p = st.player, r = {}; p.hp = p.maxHp = 400;
  const hurt = () => { const before = p.hp; pz.tick(p); const d = before - p.hp; p.hp = before; return d };
  p.resist = {}; r.none = hurt(); r.base = pz.base(p, 'poison');
  p.resist = { grass: 1 }; r.res1 = hurt();
  p.resist = { grass: 2 }; r.res2 = hurt();
  p.resist = { grass: 3 }; r.imm = hurt();
  p.resist = {}; const keep = p.trinket; p.trinket = { name: 'w', resist: { grass: -1 } }; r.weak = hurt(); p.trinket = keep;
  r.lastElement = p.lastDamageElement105;
  return r;
});
console.log('poison-element', JSON.stringify(out));
assert.ok(out.none >= 1 && out.none <= out.base + 1);
assert.ok(out.res1 < out.none || out.none <= 1, 'Ⅰ은 줄인다');
assert.ok(out.res2 <= out.res1);
assert.equal(out.imm, 0, 'Ⅲ은 면역');
assert.ok(out.weak > out.none, '취약하면 늘어난다');
assert.equal(out.lastElement, 'grass', '목령속성 피해로 기록된다');
assert.deepEqual(errors, []);
console.log('poison-element: ok');
await browser.close(); process.exit(0);
