#!/usr/bin/env node
// Runs a series of structure-change steps one after the other; each step is a commit that passed the gates.
//   node tools/chain.mjs <job.json> [--from <id>] [--cwd <dir>]
// job.json:
//   { "branch": "claude/x", "remote": "origin", "trailers": ["Co-Authored-By: …"],
//     "gate": ["node", "tools/gate.mjs"],             optional; the names/map/summary options are added per step
//     "baseline": ["node", "tools/check-structure.mjs", "--update-baseline"],   optional
//     "steps": [ { "id": "mv-save", "apply": [["node", "tools/game.mjs", "assemble"], …],
//                  "names": ".work/mv-save.names", "map": { "OLD": "NEW" },
//                  "subject": "…", "body": "text of the commit message body", "paths": ["src", "docs", "tools", "tests"] } ] }
// A step: apply commands (each must exit 0) -> gate -> lower the structure baseline -> git add -> git commit -> git push.
// Nothing is run through a shell and no command's output is piped: any command that fails stops the chain with exit 1
// and the step's id; the working tree is left as it is (resume with --from <id> after fixing or resetting it). A push
// that fails after its retries stops the chain with the commit still local.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { run } from './lib/proc.mjs';

const node = process.execPath;
const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

export function validateJob(job) {
  if (!job || !Array.isArray(job.steps) || !job.steps.length) throw new Error('job: "steps" must be a non-empty list');
  const ids = new Set();
  for (const s of job.steps) {
    if (!s.id || ids.has(s.id)) throw new Error(`job: step ids must be unique and non-empty (${s.id})`);
    ids.add(s.id);
    if (!s.subject) throw new Error(`job: step ${s.id} has no subject`);
    if (!Array.isArray(s.apply) || !s.apply.length) throw new Error(`job: step ${s.id} has no apply commands`);
    for (const a of s.apply) if (!Array.isArray(a) || !a.length) throw new Error(`job: step ${s.id}: an apply command must be an argv list`);
  }
  if (!job.branch) throw new Error('job: "branch" is required (the branch the steps are pushed to)');
}

export function runChain(job, { cwd = process.cwd(), from = null, log = console.log, retries = 4, backoffMs = 2000 } = {}) {
  validateJob(job);
  const git = (...a) => run(['git', ...a], { cwd, capture: true }).stdout.trim();
  const here = git('rev-parse', '--abbrev-ref', 'HEAD');
  if (here !== job.branch) throw new Error(`the chain pushes to ${job.branch} but ${here} is checked out`);
  let steps = job.steps;
  if (from) {
    const at = steps.findIndex((s) => s.id === from);
    if (at < 0) throw new Error(`--from ${from}: no such step`);
    steps = steps.slice(at);
  }
  for (const s of steps) {
    // only the paths that exist: git refuses (status 128) a pathspec that matches nothing in `git add`
    const paths = (s.paths || ['src', 'docs', 'tools', 'tests']).filter((p) => fs.existsSync(path.join(cwd, p)));
    if (!paths.length) throw new Error(`none of the step's paths exist in ${cwd}`);
    try {
      const dirty = git('status', '--porcelain', '--', ...paths);
      if (dirty) throw new Error(`the working tree has uncommitted changes under ${paths.join(', ')} before the step:\n${dirty.split('\n').slice(0, 8).join('\n')}`);
      log(`step ${s.id}: apply`);
      for (const a of s.apply) run(a, { cwd });
      log(`step ${s.id}: gate`);
      const summaryFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'manru-chain-')), 'summary.json');
      const gate = [...(job.gate || [node, path.join(path.dirname(fileURLToPath(import.meta.url)), 'gate.mjs')]), '--label', s.id, '--summary', summaryFile];
      if (s.names) gate.push('--names', s.names);
      for (const [k, v] of Object.entries(s.map || {})) gate.push('--map', `${k}=${v}`);
      run(gate, { cwd });
      const summary = fs.existsSync(summaryFile) ? JSON.parse(fs.readFileSync(summaryFile, 'utf8')) : null;
      log(`step ${s.id}: lower baseline, commit, push`);
      run(job.baseline || [node, 'tools/check-structure.mjs', '--update-baseline'], { cwd });
      run(['git', 'add', '-A', '--', ...paths], { cwd });
      const lines = [s.subject, '', s.body || ''];
      if (summary) lines.push('', `Gates: ${summary.unchanged?.length ? `tests unchanged (${summary.unchanged.join('/')} checks)` : 'gate passed'}${summary.values ? `; load-end values of the listed names, old build vs new: ${summary.values.compared} compared, ${summary.values.differing} differ` : ''}.`);
      lines.push('', ...(job.trailers || []));
      const msg = path.join(path.dirname(summaryFile), 'message.txt');
      fs.writeFileSync(msg, lines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n');
      run(['git', 'commit', '-q', '-F', msg], { cwd });
      let pushed = false, lastError = null;
      for (let i = 1; i <= retries && !pushed; i++) {
        try { run(['git', 'push', '-q', '-u', job.remote || 'origin', job.branch], { cwd }); pushed = true; } catch (e) { lastError = e; if (i < retries) sleep(backoffMs * 2 ** (i - 1)); }
      }
      if (!pushed) throw new Error(`the commit is made but could not be pushed after ${retries} tries: ${lastError.message}`);
      log(`step ${s.id}: done (${git('rev-parse', '--short', 'HEAD')})`);
    } catch (e) {
      e.step = s.id;
      throw e;
    }
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const opt = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : null);
  try {
    const jobFile = args.find((a, i) => !a.startsWith('--') && !['--from', '--cwd'].includes(args[i - 1]));
    if (!jobFile) throw new Error('usage: node tools/chain.mjs <job.json> [--from <id>] [--cwd <dir>]');
    runChain(JSON.parse(fs.readFileSync(jobFile, 'utf8')), { cwd: path.resolve(opt('--cwd') || process.cwd()), from: opt('--from') });
    console.log('CHAIN-DONE');
  } catch (e) {
    console.error(`STOP${e.step ? ` ${e.step}` : ''}: ${e.message}`);
    process.exit(1);
  }
}
