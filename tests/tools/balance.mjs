// Early-game balance bench: every class against the first-floors monsters, one duel at a time (see __MANRU_QA_BAL__ in src/qa/qa.js).
//   node tests/tools/balance.mjs [trials=12]        (needs the QA build: npm run build:qa)
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, openSession, startRun } from '../harness.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'dist-qa');
const trials = Number(process.argv[2] || 12);
const classes = ['wanderer', 'escort', 'swordsman', 'archer', 'infiltrator', 'strongman', 'summoner'];
const foes = [['객잔 쥐', 1], ['취객', 1], ['시종', 1], ['객잔 경비병', 2], ['떠돌이 도둑', 2], ['거대 거미', 3]];
const browser = await launch();
const rows = [];
try {
  for (const cls of classes) {
    const s = await openSession(browser, root, { seed: 4242 });
    await startRun(s, cls);
    for (const [foe, floor] of foes) {
      const res = [];
      for (let i = 0; i < trials; i++) { const r = await s.page.evaluate(([n, f]) => __MANRU_QA_BAL__.duel(n, f), [foe, floor]); if (r) res.push(r); }
      const n = res.length, won = res.filter((r) => r.won);
      const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN);
      const realMax = res[0]?.realMax;
      rows.push({ cls, foe, n, win: won.length / (n || 1), taken: mean(won.map((r) => r.taken)), realMax, deathRate: res.filter((r) => r.taken >= r.realMax).length / (n || 1), turns: mean(won.map((r) => r.turns)) });
    }
    await s.close();
  }
} finally { await browser.close(); }
const f = (v, d = 1) => (Number.isFinite(v) ? v.toFixed(d) : '-');
console.log('class        foe          n   win  takenHP/maxHP   diesRate  turns');
for (const r of rows) console.log(`${r.cls.padEnd(12)} ${r.foe.padEnd(10)} ${String(r.n).padStart(3)}  ${f(r.win * 100, 0).padStart(3)}%  ${f(r.taken).padStart(5)}/${String(r.realMax).padEnd(3)}      ${f(r.deathRate * 100, 0).padStart(3)}%    ${f(r.turns)}`);
