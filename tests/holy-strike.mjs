// Run after npm run build:qa. 성광 추가피해: 금강령 퇴와 성강 각인은 대상이 언데드인지와 상관없이 타격마다 성광 피해를 조금 더하고,
// 대상의 성광 저항이 적용된다. 언데드는 성광에 취약하다(저항표).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = 'globalThis.hs={state:()=>state,base:holyStrikeBase,bonus:holyStrikeBonus,table:monsterElementTable,mon:n=>scaledMonster(MONSTERS.find(m=>m.name===n),5),weapons:WEAPONS};';
const runtime = assembleGame(path.join(repo, 'src')).text.replace(QA_MARKER, fs.readFileSync(path.join(repo, 'src/qa/qa.js'), 'utf8') + '\n' + bridge);
const browser = await launch();
const ctx = await browser.newContext();
await ctx.route('**/scripts/10-runtime.js', r => r.fulfill({ contentType: 'text/javascript', body: runtime }));
const s = await openSession(browser, path.join(repo, 'dist-qa'), { context: ctx, seed: 9 });
const errors = []; s.page.on('pageerror', e => errors.push(e.message));
await startRun(s, 'swordsman'); await dismissModals(s);
const out = await s.page.evaluate(() => {
  const r = {}, vajra = hs.weapons.find(w => w.name === '금강령 퇴'), club = hs.weapons.find(w => w.name === '나무 몽둥이');
  r.base = [hs.base(vajra), hs.base(club), hs.base({ elementBrand74: 'holy' }), hs.base({ ...vajra, elementBrand74: 'holy' })];
  const dmgOn = (name, base) => { const m = hs.mon(name); m.hp = m.maxHp = 999; const dealt = hs.bonus(m, base); return { dealt, hp: m.hp, table: hs.table(m).holy }; };
  r.undead = dmgOn('강시', 2); r.plain = dmgOn('독꽃', 2);
  r.none = hs.bonus(hs.mon('강시'), 0);
  return r;
});
console.log('holy-strike', JSON.stringify(out));
assert.deepEqual(out.base, [2, 0, 3, 5]);
assert.equal(out.undead.table, -1, '언데드는 성광에 취약하다');
assert.ok(out.plain.dealt >= 1 && out.undead.dealt > out.plain.dealt, '성광 추가피해는 누구에게나 들어가고, 언데드는 취약해서 더 받는다');
assert.equal(out.none, 0);
assert.deepEqual(errors, []);
console.log('holy-strike: ok');
await browser.close(); process.exit(0);
