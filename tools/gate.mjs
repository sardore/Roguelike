#!/usr/bin/env node
// The gates a structure change must pass before it is committed, as one command with one exit status.
//   node tools/gate.mjs [--names <file>] [--map OLD=NEW ...] [--label <name>] [--summary <file.json>]
// 1. npm run check            no ratchet metric may grow
// 2. npm run build, build:dev the deliverables build
// 3. npm test                 QA build, every scenario against tests/baseline
//    tests/run.mjs --target src|single|app   the release builds
// 4. with --names: the values of those top-level names when the closure has finished loading, in the HEAD build and in
//    the working tree, in every boot situation (tools/refactor/load-reads.mjs); function names are not values.
// Exit 0 only if every step exited 0 (tools/lib/proc.mjs: no shell, no pipes). The summary file records what ran.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { run } from './lib/proc.mjs';
import { compareSnapshots } from './lib/snapdiff.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const node = process.execPath;

// the steps, as data, so a test can run the same loop over steps of its own
export function runSteps(steps, { cwd = repo, log = console.log } = {}) {
  const done = [];
  for (const s of steps) {
    log(`gate: ${s.name}`);
    const r = run(s.argv, { cwd, capture: !!s.capture });
    done.push({ name: s.name, ...(s.capture ? { stdout: r.stdout } : {}) });
  }
  return done;
}

export function gateSteps() {
  return [
    { name: 'check', argv: [node, 'tools/check-structure.mjs'] },
    { name: 'build', argv: [node, 'tools/build.mjs'] },
    { name: 'build:dev', argv: [node, 'tools/build.mjs', '--dev'] },
    { name: 'test (QA)', argv: [node, 'tools/build.mjs', '--qa'] },
    { name: 'test (QA scenarios)', argv: [node, 'tests/run.mjs'], capture: true },
    { name: 'test (release src)', argv: [node, 'tests/run.mjs', '--target', 'src'], capture: true },
    { name: 'test (release single)', argv: [node, 'tests/run.mjs', '--target', 'single'], capture: true },
    { name: 'test (release app)', argv: [node, 'tests/run.mjs', '--target', 'app'], capture: true },
  ];
}

// the HEAD tree built as a QA build in a temporary directory (git archive: nothing in this repository changes)
export function buildHead(tmp) {
  const tar = path.join(tmp, 'head.tar');
  run(['git', 'archive', '--format=tar', '-o', tar, 'HEAD'], { cwd: repo });
  const dir = path.join(tmp, 'head');
  fs.mkdirSync(dir);
  run(['tar', '-xf', tar, '-C', dir]);
  fs.symlinkSync(path.join(repo, 'node_modules'), path.join(dir, 'node_modules'));
  run([node, 'tools/build.mjs', '--qa'], { cwd: dir });
  return path.join(dir, 'dist-qa');
}

function main() {
  const args = process.argv.slice(2);
  const opt = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : null);
  const namesFile = opt('--names');
  const label = opt('--label') || 'gate';
  const summaryFile = opt('--summary');
  const map = Object.fromEntries(args.flatMap((a, i) => (args[i - 1] === '--map' ? [a.split('=')] : [])));
  const steps = gateSteps();
  const done = runSteps(steps);
  const unchanged = done.filter((d) => d.stdout).map((d) => /behaviour unchanged: (\d+) checks/.exec(d.stdout)?.[1]);
  if (unchanged.some((u) => !u)) throw new Error(`a test run did not report "behaviour unchanged": ${done.filter((d) => d.stdout && !/behaviour unchanged/.test(d.stdout)).map((d) => d.name).join(', ')}`);
  const summary = { label, unchanged: unchanged.map(Number), values: null };
  if (namesFile) {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'manru-gate-'));
    try {
      const oldRoot = buildHead(tmp);
      run([node, 'tools/build.mjs', '--qa'], { cwd: repo });
      const reads = path.join(repo, 'tools', 'refactor', 'load-reads.mjs');
      run([node, reads, namesFile, '--root', oldRoot, '--out', path.join(tmp, 'lr-old'), '--snapshot', path.join(tmp, 'old.json')], { cwd: repo, capture: true });
      run([node, reads, namesFile, '--out', path.join(tmp, 'lr-new'), '--snapshot', path.join(tmp, 'new.json')], { cwd: repo, capture: true });
      const cmp = compareSnapshots(path.join(tmp, 'old.json'), path.join(tmp, 'new.json'), map);
      summary.values = { compared: cmp.compared, differing: cmp.differing.length };
      if (cmp.differing.length) throw new Error(`load-end values differ:\n${cmp.differing.slice(0, 20).join('\n')}`);
    } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
  }
  if (summaryFile) fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 1) + '\n');
  console.log(`GATE-OK ${JSON.stringify(summary)}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (e) { console.error(`GATE-FAILED: ${e.message}`); process.exit(1); }
}
