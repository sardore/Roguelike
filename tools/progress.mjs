#!/usr/bin/env node
// Prints the split progress figures that docs/PROGRESS.md records at every push:
// line count per src/game file, what is left in boot.js (lines, top-level declarations, loose statements)
// and the suffixFunction count from tools/check-structure.mjs.
//   node tools/progress.mjs            markdown rows
//   node tools/progress.mjs --json
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'src', 'game');
const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
const lineCount = (t) => t.split('\n').length - (t.endsWith('\n') ? 1 : 0);
const files = [...manifest.closure, ...manifest.afterClosure].map((f) => ({ file: f, lines: lineCount(fs.readFileSync(path.join(dir, f), 'utf8')) }));
const out = execFileSync('node', [path.join(root, 'tools', 'check-structure.mjs')], { encoding: 'utf8' });
const metric = (m) => Number(new RegExp(`\\b${m}\\s+(\\d+)`).exec(out)?.[1]);
const total = files.reduce((a, f) => a + f.lines, 0);
const spineLines = metric('spineLines');
const result = {
  files, total, spineLines,
  spineDeclarations: metric('spineDeclarations'), spineLooseStatements: metric('spineLooseStatements'),
  suffixFunction: metric('suffixFunction'),
  splitPercent: Math.round((1 - spineLines / total) * 1000) / 10,
};
if (process.argv.includes('--json')) console.log(JSON.stringify(result, null, 1));
else {
  console.log('| file | lines |\n|---|---:|');
  for (const f of files) console.log(`| ${f.file} | ${f.lines} |`);
  console.log(`| (total) | ${total} |\n`);
  console.log(`boot.js ${spineLines} lines · residue ${result.spineDeclarations} declarations / ${result.spineLooseStatements} loose statements · suffixFunction ${result.suffixFunction} · outside spine ${result.splitPercent}%`);
}
