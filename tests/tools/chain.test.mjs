// Failure paths of the refactor driver tools (tools/chain.mjs, tools/gate.mjs runSteps, tools/lib/proc.mjs,
// tools/lib/snapdiff.mjs). They exist because two exit-status bugs in untracked driver scripts let a failed step
// look like a finished one. Run: npm run test:tools
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { run } from '../../tools/lib/proc.mjs';
import { compareSnapshots } from '../../tools/lib/snapdiff.mjs';
import { runChain, validateJob } from '../../tools/chain.mjs';
import { runSteps } from '../../tools/gate.mjs';

const node = process.execPath;
const sh = (cwd, ...a) => execFileSync('git', a, { cwd, encoding: 'utf8' }).trim();

// a work repository on branch "work" with a bare remote
function sandbox() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'chain-test-'));
  const remote = path.join(root, 'remote.git'), work = path.join(root, 'work');
  fs.mkdirSync(remote);
  sh(remote, 'init', '-q', '--bare', '-b', 'main');
  fs.mkdirSync(path.join(work, 'src'), { recursive: true });
  sh(work, 'init', '-q', '-b', 'main');
  sh(work, 'config', 'user.email', 't@example.com');
  sh(work, 'config', 'user.name', 't');
  sh(work, 'config', 'commit.gpgsign', 'false');
  fs.writeFileSync(path.join(work, 'src', 'a.txt'), 'start\n');
  sh(work, 'add', '-A');
  sh(work, 'commit', '-q', '-m', 'init');
  sh(work, 'remote', 'add', 'origin', remote);
  sh(work, 'push', '-q', '-u', 'origin', 'main');
  sh(work, 'checkout', '-q', '-b', 'work');
  return { root, remote, work, head: () => sh(work, 'rev-parse', 'HEAD'), remoteHead: () => { try { return sh(remote, 'rev-parse', 'refs/heads/work'); } catch { return null; } } };
}
const append = (text) => [node, '-e', `require('fs').appendFileSync('src/a.txt', ${JSON.stringify(text)})`];
const exit = (code) => [node, '-e', `process.exit(${code})`];
// the chain appends --label/--summary to the gate command: "--" keeps node from reading them as its own options
const gateExit = (code) => [...exit(code), '--'];
const job = (steps, extra = {}) => ({ branch: 'work', gate: gateExit(0), baseline: exit(0), trailers: ['Claude-Session: test'], steps, ...extra });
const step = (id, apply, extra = {}) => ({ id, apply, subject: `step ${id}`, body: `body of ${id}`, ...extra });
const quiet = { log: () => {}, retries: 2, backoffMs: 1 };

test('proc.run: exit status, signal, missing command and bad argv are exceptions', () => {
  run(exit(0));
  assert.throws(() => run(exit(3)), /exited with status 3/);
  assert.throws(() => run([node, '-e', "process.kill(process.pid, 'SIGKILL')"]), /killed by SIGKILL/);
  assert.throws(() => run(['definitely-not-a-command-xyz']), /could not run/);
  assert.throws(() => run('node -e 0'), TypeError);
  assert.throws(() => run([]), TypeError);
  assert.throws(() => run([node, '-e', "console.error('boom'); process.exit(2)"], { capture: true }), /boom/);
});

test('chain: a passing step is committed with subject, body, trailers and pushed', () => {
  const s = sandbox();
  runChain(job([step('a', [append('one\n')])]), { cwd: s.work, ...quiet });
  assert.equal(s.remoteHead(), s.head());
  const msg = sh(s.work, 'log', '-1', '--format=%B');
  assert.match(msg, /^step a\n\nbody of a/);
  assert.match(msg, /Claude-Session: test/);
  assert.equal(fs.readFileSync(path.join(s.work, 'src', 'a.txt'), 'utf8'), 'start\none\n');
});

test('chain: a failing apply command stops the step; nothing is committed or pushed', () => {
  const s = sandbox(), before = s.head();
  assert.throws(() => runChain(job([step('a', [append('x\n'), exit(3)])]), { cwd: s.work, ...quiet }), (e) => e.step === 'a' && /status 3/.test(e.message));
  assert.equal(s.head(), before);
  assert.equal(s.remoteHead(), null);
});

test('chain: a failing gate stops the step; nothing is committed or pushed', () => {
  const s = sandbox(), before = s.head();
  assert.throws(() => runChain(job([step('a', [append('x\n')])], { gate: gateExit(1) }), { cwd: s.work, ...quiet }), (e) => e.step === 'a' && /status 1/.test(e.message));
  assert.equal(s.head(), before);
  assert.equal(s.remoteHead(), null);
});

test('chain: a failing baseline update or a missing command stops the step', () => {
  const s = sandbox(), before = s.head();
  assert.throws(() => runChain(job([step('a', [append('x\n')])], { baseline: exit(2) }), { cwd: s.work, ...quiet }), /status 2/);
  sh(s.work, 'checkout', '-q', '--', 'src'); // the failed step leaves its changes in the working tree
  assert.throws(() => runChain(job([step('b', [['definitely-not-a-command-xyz']])]), { cwd: s.work, ...quiet }), /could not run/);
  assert.equal(s.head(), before);
});

test('chain: the first failing step stops the chain; earlier steps stay committed and pushed, later ones never run', () => {
  const s = sandbox();
  const j = job([step('a', [append('1\n')]), step('b', [exit(4)]), step('c', [append('3\n')])]);
  assert.throws(() => runChain(j, { cwd: s.work, ...quiet }), (e) => e.step === 'b');
  assert.equal(sh(s.work, 'log', '--format=%s', 'main..work'), 'step a');
  assert.equal(s.remoteHead(), s.head());
  assert.ok(!fs.readFileSync(path.join(s.work, 'src', 'a.txt'), 'utf8').includes('3'));
});

test('chain: --from resumes at the named step', () => {
  const s = sandbox();
  const j = job([step('a', [append('1\n')]), step('b', [append('2\n')])]);
  runChain(j, { cwd: s.work, from: 'b', ...quiet });
  assert.equal(sh(s.work, 'log', '--format=%s', 'main..work'), 'step b');
  assert.throws(() => runChain(j, { cwd: s.work, from: 'zzz', ...quiet }), /no such step/);
});

test('chain: a dirty working tree or the wrong branch is refused before anything runs', () => {
  const s = sandbox();
  fs.appendFileSync(path.join(s.work, 'src', 'a.txt'), 'dirty\n');
  assert.throws(() => runChain(job([step('a', [append('x\n')])]), { cwd: s.work, ...quiet }), /uncommitted changes/);
  sh(s.work, 'checkout', '-q', '--', 'src');
  assert.throws(() => runChain(job([step('a', [append('x\n')])], { branch: 'other' }), { cwd: s.work, ...quiet }), /checked out/);
});

test('chain: a push that fails after its retries stops the chain with the commit still local', () => {
  const s = sandbox();
  fs.rmSync(s.remote, { recursive: true, force: true });
  assert.throws(() => runChain(job([step('a', [append('x\n')]), step('b', [append('y\n')])]), { cwd: s.work, ...quiet }), (e) => e.step === 'a' && /could not be pushed after 2 tries/.test(e.message));
  assert.equal(sh(s.work, 'log', '--format=%s', 'main..work'), 'step a');
});

test('chain: a job without steps, subjects, ids or apply commands is rejected', () => {
  assert.throws(() => validateJob({ branch: 'x', steps: [] }), /non-empty/);
  assert.throws(() => validateJob({ branch: 'x', steps: [{ id: 'a', apply: [exit(0)] }] }), /no subject/);
  assert.throws(() => validateJob({ branch: 'x', steps: [{ id: 'a', subject: 's', apply: [] }] }), /no apply/);
  assert.throws(() => validateJob({ branch: 'x', steps: [step('a', [exit(0)]), step('a', [exit(0)])] }), /unique/);
  assert.throws(() => validateJob({ steps: [step('a', [exit(0)])] }), /branch/);
});

test('gate.runSteps: a failing step stops the loop; later steps do not run', () => {
  const ran = [];
  const mark = (n, code) => ({ name: n, argv: [node, '-e', `require('fs').appendFileSync(${JSON.stringify(path.join(os.tmpdir(), 'gate-ran-' + process.pid))}, ${JSON.stringify(n)}); process.exit(${code})`] });
  const f = path.join(os.tmpdir(), 'gate-ran-' + process.pid);
  fs.rmSync(f, { force: true });
  assert.throws(() => runSteps([mark('one', 0), mark('two', 5), mark('three', 0)], { log: (m) => ran.push(m) }), /status 5/);
  assert.equal(fs.readFileSync(f, 'utf8'), 'onetwo');
  fs.rmSync(f, { force: true });
});

test('snapdiff: differing, missing and mapped names; function names are ignored', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'snap-test-'));
  const w = (n, o) => { const f = path.join(dir, n); fs.writeFileSync(f, JSON.stringify(o)); return f; };
  const a = w('a', { boot: { X: [1, 2], F: '<fn old>', R: { k: 1 } } });
  const same = w('b', { boot: { X: [1, 2], F: '<fn renamed>', Y: { k: 1 } } });
  assert.deepEqual(compareSnapshots(a, same, { R: 'Y' }), { compared: 3, differing: [] });
  const changed = w('c', { boot: { X: [1, 3], F: '<fn old>' } });
  const r = compareSnapshots(a, changed);
  assert.equal(r.differing.length, 2);
  assert.match(r.differing.join('\n'), /X differs/);
  assert.match(r.differing.join('\n'), /R is missing/);
});

test('snapdiff: a member removed on purpose is taken out of the old value; a removal that did not happen is reported', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'snap-test-'));
  const w = (n, o) => { const f = path.join(dir, n); fs.writeFileSync(f, JSON.stringify(o)); return f; };
  const old = w('a', { boot: { Engine: { register: '<fn register>', stages: [1] } } });
  const now = w('b', { boot: { Engine: { stages: [1] } } });
  assert.deepEqual(compareSnapshots(old, now, {}, { Engine: ['register'] }).differing, []);
  assert.match(compareSnapshots(old, now).differing.join('\n'), /Engine differs/);
  const changed = w('c', { boot: { Engine: { stages: [1, 2] } } });
  assert.match(compareSnapshots(old, changed, {}, { Engine: ['register'] }).differing.join('\n'), /Engine differs/);
  assert.match(compareSnapshots(now, now, {}, { Engine: ['register'] }).differing.join('\n'), /Engine\.register is not a member/);
});
