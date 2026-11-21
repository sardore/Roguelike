// Run after npm run build:qa. 봉박부와 합성부적은 봉인진을 깐다: 크기·지속·진 안 효과가 각기 다르고, 진 안의 일반 적은 경계를 넘지 못한다.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = `globalThis.sc={state:()=>state,add:addTalismanSealCircle,tick:tickTalismanSealCircles,rules:TALISMAN_SEAL_CIRCLES,blocks:combatFieldBlocks57,
 mon:(n,x,y)=>{const m=scaledMonster(n==='undead'?MONSTERS.find(d=>d.kind==='undead'&&!d.boss&&!d.miniBoss&&d.min<=20):MONSTERS.find(d=>d.name===n),5);m.x=x;m.y=y;m.hp=m.maxHp=400;OccupancyService.addMonster(m);return m},clear:()=>{state.tempFields=[];for(const m of [...state.monsters])OccupancyService.removeMonster(m)}};`;
const runtime = assembleGame(path.join(repo, 'src')).text.replace(QA_MARKER, fs.readFileSync(path.join(repo, 'src/qa/qa.js'), 'utf8') + '\n' + bridge);
const browser = await launch();
const ctx = await browser.newContext();
await ctx.route('**/scripts/10-runtime.js', r => r.fulfill({ contentType: 'text/javascript', body: runtime }));
const s = await openSession(browser, path.join(repo, 'dist-qa'), { context: ctx, seed: 9 });
const errors = []; s.page.on('pageerror', e => errors.push(e.message));
await startRun(s, 'swordsman'); await dismissModals(s);
const out = await s.page.evaluate(() => {
  const st = sc.state(), p = st.player, r = {};
  // an open 11x11 arena around the player
  const { x: cx, y: cy } = p;
  for (let y = cy - 6; y <= cy + 6; y++) for (let x = cx - 6; x <= cx + 6; x++) if (st.map[y]?.[x] != null) st.map[y][x] = st.TT?.FLOOR ?? 1;
  for (const kind of ['bind', 'icebind', 'bindblast', 'bindingward', 'holybind']) {
    sc.clear(); p.hp = p.maxHp = 100;
    const m = sc.mon('객잔 쥐', cx + 3, cy);
    const edge = sc.mon('객잔 쥐', cx + 3 + sc.rules[kind].radius, cy);
    const boss = sc.mon('객잔 쥐', cx + 3, cy + 1); boss.boss = true;
    const victims = sc.add(kind, cx + 3, cy, 0);
    const f = st.tempFields.find(f => f.kind === 'sealingWard' && f.talismanSeal74 === kind);
    const before = m.hp; st.turn += 1; p.hp = 50;
    sc.tick();
    r[kind] = { ttl: f.ttl, cells: f.cells.length, victims: victims.length, bossFree: !victims.includes(boss), edgeTrapped: victims.includes(edge),
      trapped: sc.blocks(cx + 3 + sc.rules[kind].radius + 1, cy, { actor: m }), loss: before - m.hp, healed: p.hp - 50, stunnedOrSealed: undefined };
  }
  // the ward heals the player standing inside; the holy circle burns the wicked
  sc.clear(); p.hp = 50; p.maxHp = 100; sc.add('bindingward', cx, cy, 0); st.turn += st.turn % 2 ? 1 : 2; sc.tick(); r.heal = p.hp - 50;
  sc.clear(); const u = sc.mon('undead', cx + 3, cy); const hp0 = u.hp; sc.add('holybind', cx + 3, cy, 0); st.turn += 1; sc.tick(); r.smite = hp0 - u.hp;
  return r;
});
const KINDS = ['bind', 'icebind', 'bindblast', 'bindingward', 'holybind'];
console.log(JSON.stringify(out));
assert.deepEqual(KINDS.map(k => out[k].ttl), [4, 6, 3, 14, 8], 'ttl');
assert.deepEqual(KINDS.map(k => out[k].cells), [9, 9, 9, 25, 25], 'size');
for (const o of KINDS.map(k => out[k])) { assert.ok(o.victims >= 1 && o.bossFree && o.trapped, '일반 적은 갇히고 보스는 제외'); }
assert.equal(out.bind.loss, 0); assert.ok(out.icebind.loss > 0 && out.bindblast.loss > 0, '진 안 피해'); assert.equal(out.bindingward.loss, 0);
assert.equal(out.heal, 1, '봉호진 안의 나는 회복'); assert.ok(out.smite > 0, '성봉진은 언데드를 태운다');
assert.deepEqual(errors, []);
await browser.close();
console.log('seal-circles: ok');
process.exit(0);
