// tools/refactor/move-to.mjs: a const that reads window.X while loading moves only to a place after every publisher of X.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const node = process.execPath;
const tool = path.resolve('tools/refactor/move-to.mjs');

function work(parts, names) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'move-to-'));
  const text = '(()=>{\n"use strict";\n' + Object.entries(parts).map(([f, t]) => `/*@@FILE ${f}@@*/\n${t}\n`).join('') + '})();\n';
  const w = path.join(dir, 'work.js'), n = path.join(dir, 'names.txt');
  fs.writeFileSync(w, text); fs.writeFileSync(n, names.join('\n') + '\n');
  return { text, run: (target) => { const p = spawnSync(node, [tool, w, target, n], { encoding: 'utf8', cwd: dir }); return { code: p.status, out: p.stdout + p.stderr, after: fs.readFileSync(w, 'utf8') }; } };
}

test('moves a const that reads window.X to the end of the file that publishes X', () => {
  const k = work({ 'a.js': 'const A=1;\nwindow.X=[A];', 'b.js': 'const B=2;', 'spine.js': 'const L=Array.isArray(window.X)?window.X:[];\nlet z=1;' }, ['L']);
  const r = k.run('a.js');
  assert.equal(r.code, 0, r.out);
  assert.match(r.after, /window\.X=\[A\];\nconst L=Array\.isArray\(window\.X\)\?window\.X:\[\];\n\/\*@@FILE b\.js@@\*\//);
});

test('refuses when X is published after the new place, inside a function, or by a statement that is not addressable by name', () => {
  let k = work({ 'a.js': 'const A=1;', 'b.js': 'window.X=[1];', 'spine.js': 'const L=window.X;' }, ['L']);
  let r = k.run('a.js');
  assert.equal(r.code, 1); assert.match(r.out, /published after the new place/); assert.equal(r.after, k.text);
  k = work({ 'a.js': 'function pub(){window.X=[1]}', 'spine.js': 'const L=window.X;' }, ['L']);
  r = k.run('a.js');
  assert.equal(r.code, 1); assert.match(r.out, /assigned inside a function/); assert.equal(r.after, k.text);
  k = work({ 'a.js': 'const A=1;', 'spine.js': 'const key="X";\nconst L=window[key];' }, ['L']);
  r = k.run('a.js');
  assert.equal(r.code, 1); assert.match(r.out, /other than as window\.NAME/); assert.equal(r.after, k.text);
});

test('refuses when a statement between the new and the old place changes members of X or Object.assign-es onto window', () => {
  let k = work({ 'a.js': 'window.X={item:1};', 'b.js': 'window.X.item=2;', 'spine.js': 'const L=window.X.item;' }, ['L']);
  let r = k.run('a.js');
  assert.equal(r.code, 1); assert.match(r.out, /assigned between the new and the old place/); assert.equal(r.after, k.text);
  k = work({ 'a.js': 'window.X={item:1};', 'b.js': 'Object.assign(window,{X:2});', 'spine.js': 'const L=window.X.item;' }, ['L']);
  r = k.run('a.js');
  assert.equal(r.code, 1); assert.match(r.out, /window\.X is published between/);
  k = work({ 'a.js': 'window.X={item:1};', 'b.js': 'Object.assign(window,make());', 'spine.js': 'const L=window.X.item;' }, ['L']);
  r = k.run('a.js');
  assert.equal(r.code, 1); assert.match(r.out, /publishes names the tool cannot read/); assert.equal(r.after, k.text);
});

test('accepts a global that nothing in the closure publishes, and a mutation that comes after the old place', () => {
  let k = work({ 'a.js': 'const A=1;', 'spine.js': 'const L=window.EXTERNAL||null;' }, ['L']);
  assert.equal(k.run('a.js').code, 0);
  k = work({ 'a.js': 'window.X={item:1};', 'b.js': 'Object.defineProperty(globalThis,"Y",{value:1});\nObject.assign(window,{Z:2});', 'spine.js': 'const L=window.X.item;' }, ['L']);
  assert.equal(k.run('a.js').code, 0);
  k = work({ 'a.js': 'window.X={item:1};', 'spine.js': 'const L=window.X.item;\nwindow.X.item=2;' }, ['L']);
  assert.equal(k.run('a.js').code, 0);
});
