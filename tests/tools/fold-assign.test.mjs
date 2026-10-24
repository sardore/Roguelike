// tools/refactor/fold-assign.mjs on a small work file: a member assignment becomes part of the literal that defines the object;
// each refusal writes nothing.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const node = process.execPath;
const tool = path.resolve('tools/refactor/fold-assign.mjs');

function work(body, items) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fold-assign-'));
  const w = path.join(dir, 'work.js'), s = path.join(dir, 'spec.json');
  fs.writeFileSync(w, '(()=>{\n"use strict";\n' + body + '\n})();\n'); fs.writeFileSync(s, JSON.stringify({ items }));
  return { run: () => { const p = spawnSync(node, [tool, w, s], { encoding: 'utf8' }); return { code: p.status, out: p.stdout + p.stderr, after: fs.readFileSync(w, 'utf8') }; }, before: fs.readFileSync(w, 'utf8') };
}

test('replaces an existing property, appends a new one, and handles a nested path', () => {
  const k = work("const A={x:null,n:{desc:'old',cost:1}};\nA.x=force=>force;\nA.n.desc='new';\nA.y=function named(){return 1};", [{ path: 'A.x' }, { path: 'A.n.desc' }, { path: 'A.y' }]);
  const r = k.run();
  assert.equal(r.code, 0, r.out);
  assert.match(r.after, /const A=\{x:force=>force,n:\{desc:'new',cost:1\},y:function named\(\)\{return 1\}\};/);
  assert.doesNotMatch(r.after, /\nA\./);
});

test('freeze: the Object.freeze statement goes and the literal is wrapped', () => {
  const r = work('const A={a(){return 1}};\nA.b=function(){return 2};Object.freeze(A);', [{ path: 'A.b', freeze: true }]).run();
  assert.equal(r.code, 0, r.out);
  assert.match(r.after, /const A=Object\.freeze\(\{a\(\)\{return 1\},b:function\(\)\{return 2\}\}\);/);
  assert.doesNotMatch(r.after, /Object\.freeze\(A\)/);
});

test('refuses a second write, an eager value, a missing literal, and a freeze that is not there; nothing is written', () => {
  let k = work('const A={};\nA.x=()=>1;\nA.x=()=>2;', [{ path: 'A.x' }]); let r = k.run();
  assert.equal(r.code, 1); assert.match(r.out, /2 writes/); assert.equal(r.after, k.before);
  k = work('const A={};\nconst B=1;\nA.x=B;', [{ path: 'A.x' }]); r = k.run();
  assert.equal(r.code, 1); assert.match(r.out, /only literals and function expressions/);
  k = work('const A=make();\nA.x=()=>1;', [{ path: 'A.x' }]); r = k.run();
  assert.equal(r.code, 1); assert.match(r.out, /not a top-level const initialised with an object literal/);
  k = work('const A={};\nA.x=()=>1;\nlog();', [{ path: 'A.x', freeze: true }]); r = k.run();
  assert.equal(r.code, 1); assert.match(r.out, /not Object\.freeze\(A\)/); assert.equal(r.after, k.before);
  k = work('const A={n:{}};\nA.n.x=()=>1;\nA.n={};', [{ path: 'A.n.x' }]); r = k.run();
  assert.equal(r.code, 1);
});
