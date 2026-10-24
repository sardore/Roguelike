// tools/refactor/let-to-function.mjs on a small work file: a let assigned a function once becomes a function declaration of a domain
// file; each refusal writes nothing.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const node = process.execPath;
const tool = path.resolve('tools/refactor/let-to-function.mjs');

function work(a, spine, items) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'let-fn-'));
  const text = '(()=>{\n"use strict";\n/*@@FILE a.js@@*/\n' + a + '\n/*@@FILE boot.js@@*/\n' + spine + '\n})();\n';
  const w = path.join(dir, 'work.js'), s = path.join(dir, 'spec.json');
  fs.writeFileSync(w, text); fs.writeFileSync(s, JSON.stringify({ items }));
  return { text, run: () => { const p = spawnSync(node, [tool, w, s], { encoding: 'utf8' }); return { code: p.status, out: p.stdout + p.stderr, after: fs.readFileSync(w, 'utf8') }; } };
}

test('a let assigned a function once becomes a function declaration; the let and the assignment go', () => {
  const k = work('let draw;\nconst LOG=[];\nfunction use(){return draw(2)}', 'draw=function drawIt(n,m=1){return n*m};\nLOG.push(use());', [{ name: 'draw', dest: 'a.js' }]);
  const r = k.run();
  assert.equal(r.code, 0, r.out);
  assert.match(r.after, /function draw\(n,m=1\)\{return n\*m\}/);
  assert.doesNotMatch(r.after, /let draw|draw=function/);
  assert.ok(r.after.indexOf('function draw(') < r.after.indexOf('/*@@FILE boot.js@@*/'), 'the function lives in the domain file');
});

test('refuses a second write, an initialiser, a non-function value, its own name, and a load-time read before the assignment', () => {
  const items = [{ name: 'f', dest: 'a.js' }];
  let r = work('let f;', 'f=function(){return 1};\nf=function(){return 2};', items).run();
  assert.equal(r.code, 1); assert.match(r.out, /2 writes/);
  r = work('let f=null;', 'f=function(){return 1};', items).run();
  assert.equal(r.code, 1); assert.match(r.out, /initialiser/);
  r = work('let f;', 'f=()=>1;', items).run();
  assert.equal(r.code, 1); assert.match(r.out, /not a plain function expression/);
  r = work('let f;', 'f=function again(n){return n?again(n-1):0};', items).run();
  assert.equal(r.code, 1); assert.match(r.out, /mentions its own name again/);
  const k = work('let f;\nconst seen=typeof f;', 'f=function(){return 1};', items);
  r = k.run();
  assert.equal(r.code, 1); assert.match(r.out, /read at load time before the assignment/); assert.equal(r.after, k.text);
});
