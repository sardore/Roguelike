#!/usr/bin/env node
// Measurement tool (read-only for src/): which top-level bindings of the game closure are actually read while the
// closure is still loading, and which of those reads hit the temporal dead zone (a read before the declaration ran,
// which throws and is then caught somewhere, or fails the boot).
//   node tools/refactor/load-reads.mjs <names.txt> [--root dist-qa] [--out <dir>] [--snapshot <file.json>]
// It copies the built tree (default dist-qa/, build it first) to <out>, rewrites every read of the listed names in
// scripts/10-runtime.js into a probe, boots the copy in the situations that change what runs at load time
// (empty storage, each V40 save fixture, ?debug=1, mobile viewport) and prints, per name, the load-time reads seen
// (ok = read after its declaration ran, tdz = read before) with the first call site of each kind.
// A name with no load-time read can be declared anywhere earlier in the closure without changing behaviour.
// --snapshot also records the value of every listed name when the closure has finished loading (functions by name,
// DOM nodes by tag/id, cycles cut), per situation, into a JSON file: two builds' snapshots compared show whether a
// move changed what a declaration holds.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { instrumentRuntime } from '../lib/load-probe.mjs';
import { launch, openSession } from '../../tests/harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const namesFile = args.find((a, i) => !a.startsWith('--') && !['--root', '--out', '--snapshot'].includes(args[i - 1]));
const snapshotFile = opt('--snapshot', null);
const names = new Set(fs.readFileSync(namesFile, 'utf8').split('\n').map((l) => l.replace(/#.*/, '').trim()).filter(Boolean));
const root = path.resolve(repo, opt('--root', 'dist-qa'));
const out = path.resolve(repo, opt('--out', '.work/load-reads'));

fs.rmSync(out, { recursive: true, force: true });
fs.cpSync(root, out, { recursive: true });
const rtFile = path.join(out, 'scripts', '10-runtime.js');
const text = fs.readFileSync(rtFile, 'utf8');
const { text: instrumented, found, sites } = instrumentRuntime(text, { probe: names, snapshot: snapshotFile ? names : null });
for (const n of names) if (!found.has(n)) console.log(`warning: ${n} is not a top-level binding of the game closure`);
fs.writeFileSync(rtFile, instrumented);

const situations = [
  ['empty storage', {}],
  ['?debug=1', { query: 'debug=1' }],
  ['mobile 390x844', { viewport: { width: 390, height: 844 }, mobile: true }],
];
const savesDir = path.join(repo, 'tests', 'baseline', 'saves');
for (const f of fs.readdirSync(savesDir).filter((f) => f.endsWith('.json')).sort()) situations.push([`save ${f}`, { storage: JSON.parse(fs.readFileSync(path.join(savesDir, f), 'utf8')).storage }]);

const browser = await launch();
const total = {}, snapshots = {};
for (const [label, o] of situations) {
  const s = await openSession(browser, out, { seed: 1, ...o });
  const r = await s.page.evaluate(() => ({ loading: globalThis.__MANRU_LOADING__, hits: globalThis.__MANRU_LOAD_HITS__, snapshot: globalThis.__MANRU_SNAPSHOT__ }));
  if (snapshotFile) snapshots[label] = r.snapshot;
  if (r.loading !== false) console.log(`${label}: the closure did not finish loading (errors: ${JSON.stringify(s.errors)})`);
  if (s.errors.length) console.log(`${label}: page errors ${JSON.stringify(s.errors)}`);
  for (const [n, h] of Object.entries(r.hits || {})) {
    const t = (total[n] ||= { ok: 0, tdz: 0, okSite: null, tdzSite: null, situations: [] });
    t.ok += h.ok; t.tdz += h.tdz; t.okSite ||= h.okSite; t.tdzSite ||= h.tdzSite; t.situations.push(label);
  }
  await s.close();
}
await browser.close();
if (snapshotFile) fs.writeFileSync(path.resolve(snapshotFile), JSON.stringify(snapshots, null, 1));
console.log(`probed ${found.size} names, ${sites} read sites, ${situations.length} boots`);
for (const n of [...found].sort()) {
  const t = total[n];
  if (!t) console.log(`${n}\tnot read at load`);
  else console.log(`${n}\tok ${t.ok} tdz ${t.tdz}\t[${[...new Set(t.situations)].join(', ')}]${t.tdzSite ? `\n  tdz at ${t.tdzSite}` : ''}${t.okSite ? `\n  ok at ${t.okSite}` : ''}`);
}
