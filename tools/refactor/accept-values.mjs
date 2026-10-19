#!/usr/bin/env node
// Refactor tool: the `values` baseline (every top-level const/let/class when the closure has finished loading) changes when
// a conversion removes a member from an object on purpose (a `register` method that became a table). This compares the whole
// load-end snapshot of HEAD with the working tree, allows exactly the listed removals, and only then rewrites the two `values.*`
// lines of tests/baseline/behaviour.json (node tests/run.mjs --only values --update). Any other difference stops it: exit 1.
//   node tools/refactor/accept-values.mjs [--removed Name:member[,member]]...      (run in the repository root)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { run } from '../lib/proc.mjs';
import { compareSnapshots } from '../lib/snapdiff.mjs';
import { instrumentRuntime } from '../lib/load-probe.mjs';
import { buildHead } from '../gate.mjs';
import { launch, openSession } from '../../tests/harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const node = process.execPath;
const args = process.argv.slice(2);
const removed = {};
for (const [i, a] of args.entries()) if (args[i - 1] === '--removed') { const [n, m] = a.split(':'); (removed[n] ||= []).push(...m.split(',')); }

async function snapshotOf(browser, root, tmp, label) {
  const copy = path.join(tmp, 'values-' + label);
  fs.cpSync(root, copy, { recursive: true });
  const rt = path.join(copy, 'scripts', '10-runtime.js');
  fs.writeFileSync(rt, instrumentRuntime(fs.readFileSync(rt, 'utf8'), { snapshot: 'all' }).text);
  const branch = JSON.parse(fs.readFileSync(path.join(repo, 'tests', 'baseline', 'saves', 'branch.json'), 'utf8'));
  const out = {};
  for (const [name, opts] of [['empty', {}], ['branch', { storage: branch.storage }]]) {
    const s = await openSession(browser, copy, { seed: 1, ...opts });
    out[name] = await s.page.evaluate(() => globalThis.__MANRU_SNAPSHOT__);
    await s.close();
    if (!out[name]) throw new Error(`${label}: the closure did not finish loading`);
  }
  return out;
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'manru-values-'));
let browser;
try {
  const oldRoot = buildHead(tmp);
  run([node, 'tools/build.mjs', '--qa'], { cwd: repo });
  browser = await launch();
  const a = await snapshotOf(browser, oldRoot, tmp, 'old'), b = await snapshotOf(browser, path.join(repo, 'dist-qa'), tmp, 'new');
  const fa = path.join(tmp, 'old.json'), fb = path.join(tmp, 'new.json');
  fs.writeFileSync(fa, JSON.stringify(a)); fs.writeFileSync(fb, JSON.stringify(b));
  const cmp = compareSnapshots(fa, fb, {}, removed);
  const extra = Object.keys(b).flatMap((situation) => Object.keys(b[situation]).filter((k) => !(k in a[situation])).map((k) => `${situation}: ${k} is new`));
  const problems = [...cmp.differing, ...extra];
  if (problems.length) { console.error(`ACCEPT-VALUES-REFUSED:\n${problems.slice(0, 20).join('\n')}`); process.exit(1); }
  console.log(`values: ${cmp.compared} bindings compared, equal except the removed members ${JSON.stringify(removed)}`);
} finally {
  await browser?.close();
  fs.rmSync(tmp, { recursive: true, force: true });
}
run([node, 'tests/run.mjs', '--only', 'values', '--update'], { cwd: repo });
console.log('ACCEPT-VALUES-OK');
