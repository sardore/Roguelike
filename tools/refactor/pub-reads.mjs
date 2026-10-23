#!/usr/bin/env node
// Measurement tool: for each global the game publishes (`globalThis.NAME = …` / `window.NAME = …`), the reads that
// happen while the closure is still loading, split into reads BEFORE the global is published (they see `undefined`
// today and take whatever fallback the reader has) and reads after. A publish statement can only move earlier if no
// read happens before it: the reads in that window would start to see the value.
//   node tools/refactor/pub-reads.mjs <names.txt> --out <result.json>          (build the QA build first)
// Boots the QA build in every situation load-reads.mjs uses (empty storage, ?debug=1, mobile, each V40 save).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { instrumentRuntime } from '../lib/load-probe.mjs';
import { launch, openSession } from '../../tests/harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const opt = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : null);
const namesFile = args.find((a, i) => !a.startsWith('--') && !['--out', '--root'].includes(args[i - 1]));
const outFile = opt('--out');
if (!namesFile || !outFile) { console.error('usage: node tools/refactor/pub-reads.mjs <names.txt> --out <result.json> [--root <dist-qa>]'); process.exit(2); }
const names = [...new Set(fs.readFileSync(namesFile, 'utf8').split('\n').map((l) => l.replace(/#.*/, '').trim()).filter(Boolean))];

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'manru-pub-'));
try {
  const build = path.join(tmp, 'build');
  fs.cpSync(path.resolve(repo, opt('--root') || 'dist-qa'), build, { recursive: true });
  const rt = path.join(build, 'scripts', '10-runtime.js');
  const inst = instrumentRuntime(fs.readFileSync(rt, 'utf8'), { probe: new Set(), snapshot: null });
  // accessors on globalThis, installed right after the load-probe prelude (the first two lines of the instrumented text)
  const snippet = `(()=>{const names=${JSON.stringify(names)};const L=globalThis.__PUB_LOG__={};for(const n of names){let v,written=false;const log=L[n]={before:0,after:0,writes:0,site:null,pre:Object.prototype.hasOwnProperty.call(globalThis,n)};Object.defineProperty(globalThis,n,{configurable:true,enumerable:true,get(){if(globalThis.__MANRU_LOADING__===true){if(written)log.after++;else{log.before++;log.site||=String(new Error().stack).split('\\n').slice(2,6).map(s=>s.trim()).join(' < ')}}return v},set(x){written=true;log.writes++;v=x}})}})();\n`;
  const nl2 = inst.text.indexOf('\n', inst.text.indexOf('\n', inst.text.indexOf('globalThis.__MANRU_LOAD_PROBE__')) + 1);
  fs.writeFileSync(rt, inst.text.slice(0, nl2 + 1) + snippet + inst.text.slice(nl2 + 1));
  const savesDir = path.join(repo, 'tests', 'baseline', 'saves');
  const situations = [['empty storage', {}], ['?debug=1', { query: 'debug=1' }], ['mobile 390x844', { viewport: { width: 390, height: 844 }, mobile: true }]];
  for (const f of fs.readdirSync(savesDir).filter((f) => f.endsWith('.json')).sort()) situations.push([`save ${f}`, { storage: JSON.parse(fs.readFileSync(path.join(savesDir, f), 'utf8')).storage }]);
  const browser = await launch();
  const total = {};
  let failed = false;
  try {
    for (const [label, o] of situations) {
      const s = await openSession(browser, build, { seed: 1, ...o });
      const r = await s.page.evaluate(() => ({ loading: globalThis.__MANRU_LOADING__, log: globalThis.__PUB_LOG__ }));
      if (r.loading !== false || s.errors.length) { console.error(`${label}: load problem ${JSON.stringify(s.errors).slice(0, 200)}`); failed = true; }
      for (const [n, l] of Object.entries(r.log || {})) {
        const t = (total[n] ||= { before: 0, after: 0, writes: 0, site: null, pre: false });
        t.before += l.before; t.after += l.after; t.writes = Math.max(t.writes, l.writes); t.site ||= l.site; t.pre ||= l.pre;
      }
      await s.close();
    }
  } finally { await browser.close(); }
  if (failed) process.exit(1);
  for (const n of names) if (!total[n]) { console.error(`${n}: no record`); process.exit(1); }
  fs.writeFileSync(path.resolve(outFile), JSON.stringify(total, null, 1) + '\n');
  console.log(`${names.length} globals, ${situations.length} boots: ${names.filter((n) => total[n].before).length} read before they are published`);
} finally { fs.rmSync(tmp, { recursive: true, force: true }); }
