// Run after npm run build:qa. 망령전에서 한쪽의 동기화 처리가 계속 실패해도 차례가 멈추지 않는다.
// 옛 코드는 상대 시계를 동기화 맨 끝에서 갱신해서, 그 앞 단계가 계속 실패하면 한쪽이 낡은 시계로 "상대 차례"만 기다리고 다른 쪽도 그 쪽을 기다려
// 둘 다 "상대 차례 0초"에서 영원히 멈췄다. 시계를 먼저 갱신하고, 소식이 끊기면 상대가 시간 초과로 넘긴 것으로 보고 진행한다.
import assert from 'node:assert/strict';
import net from 'node:net';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { launch, openSession } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.join(repo, 'dist-qa');
const browser = await launch();
const port = await new Promise((resolve) => { const srv = net.createServer(); srv.listen(0, '127.0.0.1', () => { const p = srv.address().port; srv.close(() => resolve(p)); }); });
const relay = spawn(process.execPath, [path.join(repo, 'tests', 'tools', 'cp32-relay.cjs')], { env: { ...process.env, CP32_RELAY_HOST: '127.0.0.1', CP32_RELAY_PORT: String(port) }, stdio: 'ignore' });
const results = {};
try {
  for (let i = 0; i < 50; i++) { try { if ((await fetch(`http://127.0.0.1:${port}/health`)).ok) break; } catch { /* not up yet */ } await new Promise((r) => setTimeout(r, 100)); }
  const init = `(()=>{const d=Object.getOwnPropertyDescriptor(HTMLMetaElement.prototype,'content');Object.defineProperty(HTMLMetaElement.prototype,'content',{...d,get(){return this.name==='manru-relay'?'ws://127.0.0.1:${port}/online':d.get.call(this)}})})()`;
  // each case breaks one side's way of taking in what the other side sends; the fight must go on (many acts, nobody left waiting for ever)
  const cases = {
    stepFails: () => { const D = __MANRU_QA_DUEL__.api, o = D.syncProxies.bind(D); let n = 0; D.syncProxies = (list) => { if (++n > 6) throw new Error('a step of the sync fails'); return o(list); }; },
    syncBroken: () => { __MANRU_QA_DUEL__.api.applySync = () => { throw new Error('the sync handler is broken on this side'); }; }
  };
  for (const [name, breakIt] of Object.entries(cases)) {
    const a = await openSession(browser, root, { seed: 9101, init }), b = await openSession(browser, root, { seed: 9102, init });
    for (const s of [a, b]) await s.page.evaluate(() => document.getElementById('nickAsk')?.remove());
    const both = async (ms = 250) => { await Promise.all([a.tick(ms), b.tick(ms)]); await new Promise((r) => setTimeout(r, 40)); };
    const fight = (s) => s.page.evaluate(() => __MANRU_QA_DUEL__.fight());
    const info = (s) => s.page.evaluate(() => { const D = __MANRU_QA_DUEL__.api; return { turn: D.turn, my: D.myTurn(), role: D.role, ended: !!__MANRU_QA_UI__.state().duel?.finished || __MANRU_QA_UI__.state().dead }; });
    await a.page.evaluate(() => __MANRU_QA_DUEL__.api.find(true, __MANRU_QA_DUEL__.ghostOf('swordsman', 2)));
    await b.page.evaluate(() => __MANRU_QA_DUEL__.api.find(true, __MANRU_QA_DUEL__.ghostOf('archer', 2)));
    let up = false;
    for (let i = 0; i < 120 && !up; i++) { await both(); const [x, y] = [await fight(a), await fight(b)]; up = !!(x.duel && y.duel && x.others.find((m) => m[0] === '상대 망령') && y.others.find((m) => m[0] === '상대 망령')); }
    assert.ok(up, `${name}: no fight`);
    await b.page.evaluate(breakIt); // the guest page cannot take in the host's sync (the host's own is fine)
    let acts = 0, stalled = null;
    for (let round = 0; round < 40 && !stalled; round++) {
      const [ia, ib] = [await info(a), await info(b)];
      if (ia.ended || ib.ended) break;
      let actor = ia.my ? a : ib.my ? b : null;
      for (let k = 0; !actor && k < 90; k++) { await both(500); const [ja, jb] = [await info(a), await info(b)]; actor = ja.my ? a : jb.my ? b : null; } // up to 45 seconds
      if (!actor) { stalled = { a: ia, b: ib }; break; }
      await actor.page.keyboard.press(['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'][round % 4]); acts++; await both(300);
    }
    results[name] = { acts, stalled };
    assert.equal(stalled, null, `${name}: both sides wait for the other for ever ${JSON.stringify(stalled)}`);
    assert.ok(acts >= 10, `${name}: the fight did not go on (${acts} acts)`);
    await a.close(); await b.close();
  }
} finally { relay.kill(); }
await browser.close();
console.log(JSON.stringify(results));
console.log('duel-stall: ok');
process.exit(0);
