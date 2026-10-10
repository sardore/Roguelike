// Behaviour-preservation runner.
//   node tests/run.mjs                 compare src/ against tests/baseline/behaviour.json
//   node tests/run.mjs --update        rewrite the baseline (only when a change is intended)
//   node tests/run.mjs --root <dir>    run against another source tree (e.g. a V40 checkout)
//   node tests/run.mjs --only a,b      run selected scenarios (--skip a,b to leave some out)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, sha } from './harness.mjs';
import { scenarios } from './scenarios.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const value = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : null);
// --target src (default) | single (dist/MANRU.html) | app (dist/app/www); the built targets
// must reproduce the same baseline as the source tree.
const target = value('--target') || 'src';
const dist = path.join(here, '..', 'dist');
const root = value('--root') ? path.resolve(value('--root'))
  : target === 'single' ? { dir: dist, entry: 'MANRU.html' }
  : target === 'app' ? path.join(dist, 'app', 'www')
  : path.join(here, '..', 'src');
const only = value('--only')?.split(',');
const skip = value('--skip')?.split(',') || [];
const baselineFile = path.join(here, 'baseline', 'behaviour.json');
const artifactDir = path.join(here, 'artifacts', value('--label') || 'current');

const browser = await launch();
const results = {};
try {
  for (const [name, run] of Object.entries(scenarios)) {
    if ((only && !only.includes(name)) || skip.includes(name)) continue;
    if (name === 'pwa' && target !== 'app') continue;
    const t = Date.now();
    const out = await run(browser, root);
    Object.assign(results, out);
    console.log(`${name}: ${Object.keys(out).length} checks in ${((Date.now() - t) / 1000).toFixed(1)}s`);
  }
} finally {
  await browser.close();
}

fs.mkdirSync(artifactDir, { recursive: true });
for (const [key, value] of Object.entries(results)) fs.writeFileSync(path.join(artifactDir, Buffer.isBuffer(value) ? key : key + '.txt'), value ?? 'null');
// Screens are machine-specific (fonts, GPU): they are compared by tests/compare-screens.mjs, not hashed.
const hashes = Object.fromEntries(Object.entries(results).filter(([k]) => !k.startsWith('screens.')).map(([k, v]) => [k, sha(v ?? 'null')]));

const errorKeys = Object.keys(results).filter((k) => k.endsWith('errors') && results[k] !== '[]');
for (const k of errorKeys) console.log(`page errors in ${k}: ${results[k]}`);

if (flag('--update')) {
  const old = fs.existsSync(baselineFile) ? JSON.parse(fs.readFileSync(baselineFile, 'utf8')) : {};
  fs.mkdirSync(path.dirname(baselineFile), { recursive: true });
  fs.writeFileSync(baselineFile, JSON.stringify({ ...old, ...hashes }, null, 1) + '\n');
  console.log(`baseline written: ${Object.keys(hashes).length} checks`);
  process.exit(0);
}

const baseline = JSON.parse(fs.readFileSync(baselineFile, 'utf8'));
const failed = Object.keys(hashes).filter((k) => baseline[k] !== hashes[k]);
const ran = new Set(Object.keys(scenarios).filter((n) => (!only || only.includes(n)) && !skip.includes(n) && (n !== 'pwa' || target === 'app')));
const missing = Object.keys(baseline).filter((k) => !(k in hashes) && ran.has(k.split('.')[0]));
if (failed.length || missing.length) {
  for (const k of failed) console.log(`CHANGED ${k}${baseline[k] ? '' : ' (not in baseline)'}`);
  for (const k of missing) console.log(`MISSING ${k}`);
  console.log(`artifacts: ${artifactDir}`);
  process.exit(1);
}
console.log(`behaviour unchanged: ${Object.keys(hashes).length} checks`);
