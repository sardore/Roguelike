// Drives an instrumented copy (tools/refactor/chain-probe.mjs) through the behaviour flows
// and prints, per rebinding chain, how often each layer ran and whether any layer ran
// before the chain's final assignment.
//   node tests/chain-probe-run.mjs <instrumented dir>
import fs from 'node:fs';
import path from 'node:path';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';
import { CLASSES } from './scenarios.mjs';

const root = path.resolve(process.argv[2]);
const chains = JSON.parse(fs.readFileSync(path.join(root, 'chains.json'), 'utf8'));
const hit = {}, early = {};
const collect = async (s) => {
  const r = await s.page.evaluate(() => ({ hit: globalThis.__chainHit, early: globalThis.__chainEarly }));
  for (const [k, v] of Object.entries(r.hit || {})) hit[k] = (hit[k] || 0) + v;
  for (const [k, v] of Object.entries(r.early || {})) early[k] = (early[k] || 0) + v;
};
const KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'g', 'x', 'q', 'e', 'f', 'c', 'i', 'Escape', 'r'];
const browser = await launch();
try {
  for (const [i, cls] of CLASSES.entries()) {
    for (const mobile of [false, true]) {
      const s = await openSession(browser, root, { seed: 300 + i, ...(mobile ? { viewport: { width: 390, height: 844 }, mobile: true } : {}) });
      await startRun(s, cls);
      let a = 17 + i;
      for (let n = 0; n < 60; n++) {
        a = (Math.imul(a, 1664525) + 1013904223) >>> 0;
        await s.page.keyboard.press(KEYS[a % KEYS.length]);
        await s.tick(200);
      }
      await dismissModals(s, 2);
      if (!mobile && i === 0) for (let f = 1; f <= 25; f++) { await s.page.evaluate((x) => window.__MANRU_RELEASE__.regen(x), f); await s.tick(200); }
      await collect(s);
      await s.close();
    }
  }
  for (const name of ['progress', 'branch', 'legend']) {
    const fx = JSON.parse(fs.readFileSync(path.join('tests', 'baseline', 'saves', name + '.json'), 'utf8'));
    const s = await openSession(browser, root, { seed: 9, storage: fx.storage });
    await s.page.click('#continueBtn');
    await s.tick(3000);
    await dismissModals(s);
    for (const k of ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'x']) { await s.page.keyboard.press(k); await s.tick(400); }
    await collect(s);
    await s.close();
  }
  const s = await openSession(browser, root, { seed: 10 });
  await s.page.click('#debugBattleBtn57');
  await s.tick(800);
  for (const m of ['벌집나무', '고목 목매', '벌떼', '천수 아수라']) {
    await s.page.evaluate((name) => { const e = document.getElementById('battleSearch57'); e.value = name; e.dispatchEvent(new Event('input', { bubbles: true })); }, m);
    await s.tick(100);
    await s.page.click('#battleAddA57');
    await s.tick(200);
  }
  for (let r = 0; r < 8; r++) { await s.page.click('#battleStep57'); await s.tick(300); }
  await collect(s);
  await s.close();
} finally {
  await browser.close();
}
const rows = chains.map((c) => {
  const name = c.id.split('@')[0];
  const layers = c.layers.map((l) => `${l}:${hit[`${name}@${l}`] || 0}${early[`${name}@${l}`] ? `(early ${early[`${name}@${l}`]})` : ''}`);
  return `${c.id.padEnd(30)} ${layers.join('  ')}`;
});
console.log(rows.join('\n'));
fs.writeFileSync(path.join(root, 'probe-result.json'), JSON.stringify({ hit, early }, null, 1));
