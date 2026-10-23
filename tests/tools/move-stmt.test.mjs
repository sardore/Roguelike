// tools/refactor/move-stmt.mjs on a small work file: what it moves, and each reason it refuses (a refusal writes nothing and exits 1).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const node = process.execPath;
const tool = path.resolve('tools/refactor/move-stmt.mjs');

// files in manifest order a.js, b.js, spine.js (the manifest is given to the tool with --manifest)
function work(parts, { reads = {}, names }) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'move-stmt-'));
  const text = '(()=>{\n"use strict";\n' + Object.entries(parts).map(([f, t]) => `/*@@FILE ${f}@@*/\n${t}\n`).join('') + '})();\n';
  const w = path.join(dir, 'work.js'), n = path.join(dir, 'names.txt'), r = path.join(dir, 'reads.json'), m = path.join(dir, 'manifest.json');
  fs.writeFileSync(w, text); fs.writeFileSync(n, names.join('\n') + '\n'); fs.writeFileSync(r, JSON.stringify(reads)); fs.writeFileSync(m, JSON.stringify({ closure: Object.keys(parts), afterClosure: [] }));
  return { w, n, r, m, text, run: (target) => { const p = spawnSync(node, [tool, w, target, n, '--reads', r, '--manifest', m], { encoding: 'utf8' }); return { code: p.status, out: p.stdout, err: p.stderr, after: fs.readFileSync(w, 'utf8') }; } };
}
const ok = (name) => ({ [name]: { before: 0, after: 3, writes: 1 } });

test('moves a publish statement to the end of the target file, keeping the other statements', () => {
  const k = work({ 'a.js': 'const A=1;\nfunction f(){return A}', 'b.js': 'const B=2;', 'spine.js': 'const S=3;\nglobalThis.X=Object.freeze({f,get:()=>A});\nlet z=1;' }, { reads: ok('X'), names: ['X'] });
  const r = k.run('a.js');
  assert.equal(r.code, 0, r.err + r.out);
  assert.match(r.after, /function f\(\)\{return A\}\nglobalThis\.X=Object\.freeze\(\{f,get:\(\)=>A\}\);\n\/\*@@FILE b\.js@@\*\//);
  assert.doesNotMatch(r.after.split('/*@@FILE spine.js@@*/')[1], /globalThis\.X/);
  assert.match(r.after, /const S=3;\nlet z=1;/);
});

test('refuses a global that is read while loading before it is published', () => {
  const k = work({ 'a.js': 'const A=1;', 'spine.js': 'globalThis.X={a:A};' }, { reads: { X: { before: 2, after: 0, writes: 1 } }, names: ['X'] });
  const r = k.run('a.js');
  assert.equal(r.code, 1);
  assert.match(r.out, /read 2x while loading before it is published/);
  assert.equal(r.after, k.text);
});

test('refuses a value that uses a const of spine.js or of a file after the target when it runs, accepts a function and a use inside a function', () => {
  let k = work({ 'a.js': 'const A=1;', 'spine.js': 'const S=3;\nglobalThis.X={v:S};' }, { reads: ok('X'), names: ['X'] });
  let r = k.run('a.js');
  assert.equal(r.code, 1); assert.match(r.out, /S \(const\) is declared in spine\.js/); assert.equal(r.after, k.text);
  k = work({ 'a.js': 'const A=1;', 'b.js': 'const B=2;', 'spine.js': 'globalThis.X={v:B};' }, { reads: ok('X'), names: ['X'] });
  r = k.run('a.js');
  assert.equal(r.code, 1); assert.match(r.out, /B is declared in b\.js, after a\.js/);
  k = work({ 'a.js': 'const A=1;', 'spine.js': 'const S=3;\nfunction h(){return S}\nglobalThis.X={h,late:()=>S};' }, { reads: ok('X'), names: ['X'] });
  r = k.run('a.js');
  assert.equal(r.code, 0, r.out + r.err);
});

test('refuses a statement that makes a call, a let that is assigned elsewhere, and names that do not match one statement', () => {
  let k = work({ 'a.js': 'function make(){return 1}', 'spine.js': 'globalThis.X=make();' }, { reads: ok('X'), names: ['X'] });
  let r = k.run('a.js');
  assert.equal(r.code, 1); assert.match(r.out, /makes a call when it runs: make/);
  k = work({ 'a.js': 'let L=1;\nfunction set(){L=2}', 'spine.js': 'globalThis.X={v:L};' }, { reads: ok('X'), names: ['X'] });
  r = k.run('a.js');
  assert.equal(r.code, 1); assert.match(r.out, /L is a let that is assigned elsewhere/);
  k = work({ 'a.js': 'const A=1;', 'spine.js': 'globalThis.X=1;\nwindow.X=2;' }, { reads: ok('X'), names: ['X'] });
  r = k.run('a.js');
  assert.equal(r.code, 1); assert.match(r.out, /2 publish statements.*NAME#n/);
  k = work({ 'a.js': 'const A=1;', 'spine.js': 'globalThis.X=1;\nwindow.X=2;' }, { reads: ok('X'), names: ['X#2'] });
  r = k.run('a.js');
  assert.equal(r.code, 0, r.out + r.err); assert.match(r.after, /window\.X=2;\n\/\*@@FILE spine/);
  k = work({ 'a.js': 'const A=1;', 'spine.js': 'globalThis.X=1;' }, { reads: ok('Y'), names: ['Y'] });
  r = k.run('a.js');
  assert.equal(r.code, 1); assert.match(r.out, /0 publish statements/);
});

test('refuses a missing measurement, spine.js or an unknown file as the target, and one refusal stops every move', () => {
  let k = work({ 'a.js': 'const A=1;', 'spine.js': 'globalThis.X=1;' }, { reads: {}, names: ['X'] });
  assert.equal(k.run('a.js').code, 1);
  k = work({ 'a.js': 'const A=1;', 'spine.js': 'globalThis.X=1;' }, { reads: ok('X'), names: ['X'] });
  assert.equal(k.run('spine.js').code, 1);
  assert.equal(k.run('nope.js').code, 1);
  k = work({ 'a.js': 'const A=1;', 'spine.js': 'globalThis.X=1;\nglobalThis.Y=2;' }, { reads: { X: { before: 0 }, Y: { before: 1 } }, names: ['X', 'Y'] });
  const r = k.run('a.js');
  assert.equal(r.code, 1); assert.equal(r.after, k.text);
});
