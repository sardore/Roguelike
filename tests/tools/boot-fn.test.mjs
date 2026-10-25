// tools/refactor/boot-fn.mjs on a small work file: a run of loose statements becomes a function of the domain file and the call
// stands where the statements stood (same order), function declarations inside the run stay, absorbed declarations become locals,
// and each refusal writes nothing.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const node = process.execPath;
const tool = path.resolve('tools/refactor/boot-fn.mjs');

function work(spine, groups, dest = 'a.js') {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'boot-fn-'));
  const text = '(()=>{\n"use strict";\n/*@@FILE a.js@@*/\nconst LOG=[];\n/*@@FILE boot.js@@*/\n' + spine + '\n})();\n';
  const w = path.join(dir, 'work.js'), s = path.join(dir, 'spec.json');
  fs.writeFileSync(w, text); fs.writeFileSync(s, JSON.stringify({ groups }));
  const run = () => { const p = spawnSync(node, [tool, w, s], { encoding: 'utf8' }); return { code: p.status, out: p.stdout + p.stderr, after: fs.readFileSync(w, 'utf8') }; };
  return { text, run, dest };
}
// what the closure logs when it runs (the work file defines LOG in a.js and returns it through globalThis)
const logOf = (src) => { const g = {}; new Function('g', src.replace(/\}\)\(\);\s*$/, 'g.LOG=LOG})();'))(g); return g.LOG; };

test('a run becomes a function of the domain file, called in place; the order of execution is unchanged', () => {
  const k = work("LOG.push(1);\nLOG.push(2);\nfunction later(){LOG.push('never')}\nLOG.push(3);\nLOG.push(4);", [{ name: 'pushTwoAndThree', dest: 'a.js', anchor: 'LOG.push(2)', count: 2 }]);
  const r = k.run();
  assert.equal(r.code, 0, r.out);
  assert.match(r.after, /function pushTwoAndThree\(\)\{\n  LOG\.push\(2\);\n  LOG\.push\(3\);\n\}/);
  assert.match(r.after, /pushTwoAndThree\(\);\s*function later\(\)\{LOG\.push\('never'\)\}/);
  assert.deepEqual(logOf(r.after), logOf(k.text));
  assert.ok(r.after.indexOf('function pushTwoAndThree') < r.after.indexOf('/*@@FILE boot.js@@*/'), 'the function lives in the domain file');
});

test('a declaration next to the run is absorbed as a local when nothing else reads it, and refused otherwise', () => {
  let k = work("const tmp=5;\nLOG.push(tmp);\nLOG.push(tmp+1);", [{ name: 'pushTmp', dest: 'a.js', anchor: 'LOG.push(tmp);', count: 2, absorb: ['tmp'] }]);
  let r = k.run();
  assert.equal(r.code, 0, r.out);
  assert.match(r.after, /function pushTmp\(\)\{\n  const tmp=5;\n  LOG\.push\(tmp\);\n  LOG\.push\(tmp\+1\);\n\}/);
  assert.deepEqual(logOf(r.after), logOf(k.text));
  k = work("const tmp=5;\nLOG.push(tmp);\nLOG.push(tmp+1);", [{ name: 'pushTmp', dest: 'a.js', anchor: 'LOG.push(tmp);', count: 1, absorb: ['tmp'] }]);
  r = k.run();
  assert.equal(r.code, 1); assert.match(r.out, /tmp is used outside the group/); assert.equal(r.after, k.text);
  k = work("LOG.push(1);\nconst mid=2;\nLOG.push(mid);", [{ name: 'pushAll', dest: 'a.js', anchor: 'LOG.push(1)', count: 2 }]);
  r = k.run();
  assert.equal(r.code, 1); assert.match(r.out, /not absorbed/); assert.equal(r.after, k.text);
});

test('refuses an ambiguous or missing anchor, a name that exists, and top-level return/this/var', () => {
  let k = work("LOG.push(1);\nLOG.push(1);", [{ name: 'f1', dest: 'a.js', anchor: 'LOG.push(1)', count: 1 }]);
  let r = k.run();
  assert.equal(r.code, 1); assert.match(r.out, /give "occurrence"/);
  k = work("LOG.push(1);\nLOG.push(1);", [{ name: 'f1', dest: 'a.js', anchor: 'LOG.push(1)', count: 1, occurrence: 1 }]);
  assert.equal(k.run().code, 0);
  k = work("LOG.push(1);", [{ name: 'f1', dest: 'a.js', anchor: 'nothing', count: 1 }]);
  r = k.run();
  assert.equal(r.code, 1); assert.match(r.out, /no loose statement/);
  k = work("LOG.push(1);", [{ name: 'LOG', dest: 'a.js', anchor: 'LOG.push(1)', count: 1 }]);
  r = k.run();
  assert.equal(r.code, 1); assert.match(r.out, /already used/);
  k = work("for(var i=0;i<1;i++)LOG.push(i);", [{ name: 'loopVar', dest: 'a.js', anchor: 'for(var i', count: 1 }]);
  r = k.run();
  assert.equal(r.code, 1); assert.match(r.out, /top-level var/); assert.equal(r.after, k.text);
  k = work("LOG.push(this);", [{ name: 'usesThis', dest: 'a.js', anchor: 'LOG.push(this)', count: 1 }]);
  r = k.run();
  assert.equal(r.code, 1); assert.match(r.out, /this at the top level/);
});
