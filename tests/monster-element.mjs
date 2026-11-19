// Run after npm run build:qa. 반영 검객은 성광, 수목 궁수는 초목 속성으로 공격하고, 천수 아수라의 다완 투척과 천면경 검의 반영검은 성광이다. 저항 Ⅲ이면 막힌다.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = 'globalThis.elemTest={state:()=>state,MONSTERS,TT,scaled:scaledMonster,hit:(m,ctx)=>monsterAttacksTarget(m,0,ctx),asura:(m,d,t)=>asuraTurn(m,d,t),legend:id=>globalThis.__MANRU_LEGEND47__.enemyDefinitions(id),strike:m=>attackPlayer(m),blade:()=>({...adef46("mirror_blade"),legendaryWeapon47:true,artifactId46:"mirror_blade",identified:true}),add:m=>OccupancyService.addMonster(m)};';
const runtime = assembleGame(path.join(repo, 'src')).text.replace(QA_MARKER,
  fs.readFileSync(path.join(repo, 'src/qa/qa.js'), 'utf8') + '\n' + bridge);
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
await ctx.route('**/scripts/10-runtime.js', r => r.fulfill({ contentType: 'text/javascript', body: runtime }));
const s = await openSession(browser, path.join(repo, 'dist-qa'), { context: ctx, seed: 5 });
await startRun(s, 'swordsman'); await dismissModals(s); await s.tick(500);
const out = await s.page.evaluate(() => {
  const T = elemTest, st = T.state(), p = st.player, r = {};
  st.tutorialEntry60 = { completed: true }; st.monsters = []; st.items = []; st.playerAgencyTurns57 = 10; st.floor = 14;
  for (let x = p.x - 2; x <= p.x + 9; x++) for (let dy = -3; dy <= 3; dy++) st.map[p.y + dy][x] = T.TT.FLOOR;
  const probe = (name, elem, delivery) => {
    const def = T.MONSTERS.find(m => m.name === name);
    const mk = () => { const m = T.scaled(JSON.parse(JSON.stringify(def)), 14); Object.assign(m, { x: p.x + (delivery === 'ranged' ? 5 : 1), y: p.y, hp: 999, maxHp: 999, alerted: true }); st.monsters = []; T.add(m); return m; };
    const run = lvl => {
      p.baseMaxHpPermanent = 400; p.hp = p.maxHp = 400; p.armor = { name: 't', resist: lvl ? { [elem]: lvl } : {} }; p.cloak = null; p.relic = null; p.trinket = null;
      let total = 0; for (let i = 0; i < 6; i++) { const m = mk(), b = p.hp; T.hit(m, { target: p, delivery }); total += b - p.hp; p.hp = p.maxHp = 400; } return total;
    };
    const def2 = T.MONSTERS.find(m => m.name === name);
    r[name] = { element: def2.attackElement105, plain: run(0), r1: run(1), r3: run(3) };
  };
  probe('반영 검객', 'holy', 'melee'); probe('수목 궁수', 'grass', 'ranged');
  // 파편 망령: 피해의 절반만 냉기라 저항 Ⅲ이어도 물리 절반은 남는다
  for (const [dungeon, name] of [['mirror_blade', '파편 망령'], ['curse_spear', '혼백 사냥꾼']]) { const def = T.legend(dungeon).find(d => d.name === name);
    const run = lvl => { p.baseMaxHpPermanent = 400; p.hp = p.maxHp = 400; p.armor = { name: 't', resist: lvl ? { ice: lvl } : {} };
      let total = 0; for (let i = 0; i < 8; i++) { const m = T.scaled(JSON.parse(JSON.stringify(def)), 14); Object.assign(m, { x: p.x + 1, y: p.y, hp: 999, maxHp: 999, alerted: true }); st.monsters = []; T.add(m); const b = p.hp; T.hit(m, { target: p, delivery: 'melee' }); total += b - p.hp; p.hp = p.maxHp = 400; } return total; };
    r[name] = { element: def.attackElement105, share: def.attackElementShare105, plain: run(0), r3: run(3) }; }
  // 천수 아수라: 영역 밖 대상에게 예고된 다완 투척 한 번
  const asura = lvl => {
    p.baseMaxHpPermanent = 400; p.hp = p.maxHp = 400; p.armor = { name: 't', resist: lvl ? { holy: lvl } : {} };
    const def = T.MONSTERS.find(m => m.name === '천수 아수라'), m = T.scaled(JSON.parse(JSON.stringify(def)), 14);
    Object.assign(m, { x: p.x + 7, y: p.y, hp: 999, maxHp: 999, alerted: true, asuraZone61: 3, asuraVolleyWarn61: 1, asuraVolleyTarget61: { x: p.x, y: p.y }, asuraDomainX61: p.x + 7, asuraDomainY61: p.y });
    st.monsters = []; T.add(m); let total = 0; for (let i = 0; i < 8; i++) { Object.assign(m, { asuraZone61: 3, asuraVolleyWarn61: 1, stunned: 0 }); p.hp = p.maxHp = 400; T.asura(m, 7, p); total += 400 - p.hp; } return total;
  };
  r['천수 아수라'] = { element: 'holy', plain: asura(0), r1: asura(1), r3: asura(3) };
  // 천면경 검: 첫 적을 베면 3칸 안의 두 번째 적에게 성광 반영
  const reflect = lvl => {
    p.weapon = T.blade(); p.armor = null; st.status = st.status || {};
    const def = T.MONSTERS.find(m => m.name === '수목 궁수');
    const a = T.scaled(JSON.parse(JSON.stringify(def)), 14), b = T.scaled(JSON.parse(JSON.stringify(def)), 14);
    Object.assign(a, { x: p.x + 1, y: p.y, hp: 999, maxHp: 999, eva: 0, alerted: true }); Object.assign(b, { x: p.x + 3, y: p.y, hp: 999, maxHp: 999, alerted: true, resist: lvl ? { holy: lvl } : {} });
    st.monsters = []; T.add(a); T.add(b); let total = 0; for (let i = 0; i < 6; i++) { a.hp = 999; const hb = b.hp; T.strike(a); total += hb - b.hp; } return total;
  };
  r['반영검'] = { element: 'holy', plain: reflect(0), r1: reflect(1), r3: reflect(3), log: st.log.slice(-3).map(l => l.text || l) };
  return r;
});
console.log('monster-element', JSON.stringify(out));
for (const [name, elem] of [['반영 검객', 'holy'], ['수목 궁수', 'grass'], ['천수 아수라', 'holy'], ['반영검', 'holy']]) {
  const o = out[name]; assert.equal(o.element, elem, name + ' element');
  assert.ok(o.plain > 0, name + ' hurts'); assert.ok(o.r1 < o.plain, name + ' resist I lowers: ' + o.r1 + ' < ' + o.plain); assert.equal(o.r3, 0, name + ' resist III blocks');
}
for (const name of ['파편 망령', '혼백 사냥꾼']) { const o = out[name];
  assert.equal(o.element, 'ice', name); assert.equal(o.share, .5, name);
  assert.ok(o.r3 > 0 && o.r3 < o.plain, name + ': 냉기 저항 Ⅲ은 절반만 막는다 ' + o.r3 + ' / ' + o.plain); }
console.log('monster-element: ok');
await browser.close(); process.exit(0);
