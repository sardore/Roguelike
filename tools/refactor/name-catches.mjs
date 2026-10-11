#!/usr/bin/env node
// Refactor tool: replace every empty `catch` with a call to ignoreError(reason, error) using a
// reason table (docs/CATCH_AUDIT.md was produced from it). Entries marked "삭제" remove the whole
// try statement (dead overwritten code), "제거" drop only the try/catch around a statement that
// cannot throw.
//   node tools/refactor/name-catches.mjs <file> <map.json> <prefix> [--dry]
import fs from 'node:fs';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';

const [file, mapFile, prefix] = process.argv.slice(2);
const dry = process.argv.includes('--dry');
const map = JSON.parse(fs.readFileSync(mapFile, 'utf8'));
let src = fs.readFileSync(file, 'utf8');
const ast = acorn.parse(src, { ecmaVersion: 'latest', locations: true });
const edits = [], seen = new Set();
const reasonText = (s) => JSON.stringify(s).slice(1, -1).replace(/'/g, "\\'");
walk.simple(ast, {
  TryStatement(n) {
    const h = n.handler;
    if (!h || h.body.body.length) return;
    const key = `${prefix}:${h.loc.start.line}`, row = map[key];
    if (!row) throw new Error(`no entry for ${key}`);
    seen.add(key);
    const [kind, reason] = row;
    if (kind === '삭제') edits.push({ start: n.start, end: n.end, text: '' });
    else if (kind === '제거') {
      if (n.finalizer) throw new Error(`${key}: has finally`);
      edits.push({ start: n.start, end: n.end, text: src.slice(n.block.start + 1, n.block.end - 1).trim() });
    } else edits.push({ start: h.start, end: h.end, text: `catch(error){ignoreError('${reasonText(reason)}',error)}` });
  },
});
for (const key of Object.keys(map)) if (key.startsWith(prefix + ':') && !seen.has(key)) throw new Error(`map entry without catch: ${key}`);
edits.sort((a, b) => b.start - a.start);
for (const e of edits) src = src.slice(0, e.start) + (e.text === '' ? '\u0001' : e.text) + src.slice(e.end);
src = src.split('\n').filter((l) => !(l.includes('\u0001') && /^[\s\u0001;]*$/.test(l))).join('\n').replaceAll('\u0001', '');
acorn.parse(src, { ecmaVersion: 'latest' });
if (!dry) fs.writeFileSync(file, src);
console.log(`${file}: ${edits.length} catch(es) handled`);
