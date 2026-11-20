// Run after npm run build:qa. 저항은 4단계: 피해 30·50·75·100% 감소(4단계는 면역). 화염 저항은 한 단계만 있어도 연소를 막고,
// 전격 저항은 기절이 걸릴 때 그 저항 퍼센트의 확률로 1턴을 줄인다.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = 'globalThis.rz={state:()=>state,mult:resistMultiplier,imm:RESIST_IMMUNE57,mon:n=>scaledMonster(MONSTERS.find(m=>m.name===n),5),resist:entityElementResist,burn:combustionContact105,stunMon:setMonsterStatus,setStatus:setPlayerStatus,trim:shockStunTrim,mmult:entityElementMultiplier57};';
const runtime = assembleGame(path.join(repo, 'src')).text.replace(QA_MARKER, fs.readFileSync(path.join(repo, 'src/qa/qa.js'), 'utf8') + '\n' + bridge);
const browser = await launch();
const ctx = await browser.newContext();
await ctx.route('**/scripts/10-runtime.js', r => r.fulfill({ contentType: 'text/javascript', body: runtime }));
const s = await openSession(browser, path.join(repo, 'dist-qa'), { context: ctx, seed: 9 });
const errors = []; s.page.on('pageerror', e => errors.push(e.message));
await startRun(s, 'swordsman'); await dismissModals(s);
const out = await s.page.evaluate(() => {
  const st = rz.state(), p = st.player, r = {}, real = globalThis.__MANRU_RANDOM57__;
  r.mult = [0, 1, 2, 3, 4].map(l => rz.mult(l)); r.weak = rz.mult(-1); r.imm = rz.imm;
  // combustion: no resist burns, any fire resist does not
  r.burn = [0, 1, 2, 3, 4].map(l => { const m = rz.mon('객잔 쥐'); m.resist = l ? { fire: l } : {}; m.hp = m.maxHp = 500; delete m.combustion105; rz.burn(m, 'fire', { sourceFaction: 'player' }); return !!m.combustion105 });
  // the player's stun: trim chance equals the damage cut
  const stunned = (lvl, roll) => { p.armor = { name: 't', resist: lvl ? { shock: lvl } : {} }; st.status.stun = 0; globalThis.__MANRU_RANDOM57__ = () => roll; rz.setStatus('stun', 3); return st.status.stun };
  r.playerStun = { none: stunned(0, 0), low: stunned(1, .29), lowMiss: stunned(1, .31), mid: stunned(2, .49), midMiss: stunned(2, .51), high: stunned(3, .74), highMiss: stunned(3, .76), imm: stunned(4, .99) };
  // one turn stun at 100%: gone altogether
  r.lastTurn = (() => { p.armor = { name: 't', resist: { shock: 4 } }; st.status.stun = 0; globalThis.__MANRU_RANDOM57__ = () => 0; rz.setStatus('stun', 1); return st.status.stun })();
  // a monster's stun
  const monStun = (lvl, roll) => { const m = rz.mon('객잔 쥐'); m.resist = lvl ? { shock: lvl } : {}; m.stunned = 0; globalThis.__MANRU_RANDOM57__ = () => roll; rz.stunMon(m, 'stunned', 2); return m.stunned };
  r.monStun = { none: monStun(0, 0), trimmed: monStun(2, .49), kept: monStun(2, .51) };
  globalThis.__MANRU_RANDOM57__ = real; p.armor = null;
  return r;
});
console.log('resist-tiers', JSON.stringify(out));
assert.deepEqual(out.mult.map(v => Math.round(v * 100)), [100, 70, 50, 25, 0], '피해 30·50·75·100% 감소');
assert.equal(out.imm, 4); assert.equal(out.weak, 1.4);
assert.deepEqual(out.burn, [true, false, false, false, false], '화염 저항은 하나만 있어도 연소 무효');
assert.deepEqual(out.playerStun, { none: 3, low: 2, lowMiss: 3, mid: 2, midMiss: 3, high: 2, highMiss: 3, imm: 2 }, '전격 저항 퍼센트만큼의 확률로 기절 1턴 감소');
assert.equal(out.lastTurn, 0, '마지막 1턴은 줄면 기절이 사라진다');
assert.deepEqual(out.monStun, { none: 2, trimmed: 1, kept: 2 });
assert.deepEqual(errors, []);
console.log('resist-tiers: ok');
await browser.close(); process.exit(0);
