// tools/refactor/fold-patches.mjs on a small work file: patches go into the definitions with the key order Object.assign would
// have left, and each refusal writes nothing.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const node = process.execPath;
const tool = path.resolve('tools/refactor/fold-patches.mjs');
const spec = { callee: 'patchDef', lists: ['WEAPONS', 'CLOAKS'], key: 'name', deleteOf: 'defBy', removeFunctions: ['patchDef'] };

function work(body) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fold-patches-'));
  const text = '(()=>{\n"use strict";\n/*@@FILE a.js@@*/\n' + body + '\n})();\n';
  const w = path.join(dir, 'work.js'), s = path.join(dir, 'spec.json');
  fs.writeFileSync(w, text); fs.writeFileSync(s, JSON.stringify(spec));
  return { text, run: () => { const p = spawnSync(node, [tool, w, s], { encoding: 'utf8' }); return { code: p.status, out: p.stdout + p.stderr, after: fs.readFileSync(w, 'utf8') }; } };
}
const head = `const WEAPONS=[{name:'a',atk:1,desc:'old'},{name:'b',atk:2}];
const CLOAKS=[{name:'c',def:1,hazardResist:3,desc:'x'}];
function defBy(n){return WEAPONS.find(x=>x.name===n)||CLOAKS.find(x=>x.name===n)||null}
function patchDef(name,props){const d=defBy(name);if(d)Object.assign(d,props);return d}
`;

test('a patch replaces a property where it stands and appends new ones in call order; a delete removes the property', () => {
  const k = work(head + `patchDef('a',{desc:'new',ability:'x'});\npatchDef('a',{tracking:true});\npatchDef('c',{eat:1.35});\ndelete defBy('c').hazardResist\nconst after=1;`);
  const r = k.run();
  assert.equal(r.code, 0, r.out);
  assert.match(r.after, /\{name:'a',atk:1,desc:'new',ability:'x',tracking:true\}/);
  assert.match(r.after, /\{name:'c',def:1,desc:'x',eat:1\.35\}/);
  assert.doesNotMatch(r.after, /patchDef|hazardResist/);
  assert.match(r.after, /const after=1;/);
  // the folded literal gives the same objects, with the same key order, as patching at load time
  const run = (src) => new Function(`${src}; return JSON.stringify([WEAPONS,CLOAKS])`)();
  const patchedAtLoad = run(k.text.replace(/^\(\(\)=>\{|\}\)\(\);\s*$/g, '').replace(/\/\*@@FILE a\.js@@\*\//, ''));
  const folded = run(r.after.replace(/^\(\(\)=>\{|\}\)\(\);\s*$/g, '').replace(/\/\*@@FILE a\.js@@\*\//, ''));
  assert.equal(folded, patchedAtLoad);
});

test('refuses a definition that is missing, a spread in the literal, a patch that is not an object literal, and a use of the function elsewhere', () => {
  let k = work(head + `patchDef('zzz',{x:1});`);
  let r = k.run();
  assert.equal(r.code, 1); assert.match(r.out, /no definition called "zzz"/); assert.equal(r.after, k.text);
  k = work(head.replace("{name:'b',atk:2}", "{name:'b',...base}") + `const base={};\npatchDef('b',{x:1});`);
  r = k.run();
  assert.equal(r.code, 1); assert.match(r.out, /spread/); assert.equal(r.after, k.text);
  k = work(head + `const p={x:1};\npatchDef('a',p);`);
  r = k.run();
  assert.equal(r.code, 1); assert.match(r.out, /name literal and an object literal/);
  k = work(head + `patchDef('a',{x:1});\nfunction later(){return patchDef('b',{y:1})}`);
  r = k.run();
  assert.equal(r.code, 1); assert.match(r.out, /2 calls of patchDef in the program, 1 folded/); assert.equal(r.after, k.text);
});
