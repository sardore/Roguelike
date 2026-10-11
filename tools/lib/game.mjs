// The game runtime is written as several domain files (src/game/*.js) and assembled into ONE closure:
//
//   (()=>{ "use strict";
//     <closure files, in manifest order>
//     /*@@QA-BRIDGES@@*/            (npm run build:qa replaces this with src/qa/qa.js)
//   })();
//   <files after the closure, in manifest order>
//
// The order lives in src/game/manifest.json and nowhere else. Because the result is a single closure, all
// domains share the same state exactly as before the split.
import fs from 'node:fs';
import path from 'node:path';

export const QA_MARKER = '/*@@QA-BRIDGES@@*/';
export const QA_FILE = 'qa/qa.js';
export const SENTINEL = (name) => `/*@@FILE ${name}@@*/`;
const HEAD = '(()=>{\n"use strict";\n';

export function readManifest(srcDir) {
  const manifest = JSON.parse(fs.readFileSync(path.join(srcDir, 'game', 'manifest.json'), 'utf8'));
  for (const key of ['closure', 'afterClosure']) if (!Array.isArray(manifest[key])) throw new Error(`manifest.json: "${key}" must be a list of files`);
  const seen = new Set();
  for (const f of [...manifest.closure, ...manifest.afterClosure]) {
    if (seen.has(f)) throw new Error(`manifest.json lists ${f} twice`);
    seen.add(f);
    if (!fs.existsSync(path.join(srcDir, 'game', f))) throw new Error(`manifest.json lists ${f}, which does not exist`);
  }
  const onDisk = fs.readdirSync(path.join(srcDir, 'game')).filter((f) => f.endsWith('.js'));
  for (const f of onDisk) if (!seen.has(f)) throw new Error(`src/game/${f} is not in manifest.json`);
  return manifest;
}

// Returns { text, parts } where parts[i] = { file, firstLine, lastLine } (1-based lines of the assembled text).
// With sentinels (work mode for the refactor tools) a `/*@@FILE name@@*/` line precedes every file, and src/qa/qa.js
// is included as the virtual file `qa/qa.js`, so a tool that renames something renames it there too.
export function assembleGame(srcDir, { qa = false, sentinels = false } = {}) {
  const manifest = readManifest(srcDir);
  const parts = [];
  let text = HEAD;
  const lineOf = () => text.split('\n').length;
  const add = (file, body) => {
    if (sentinels) text += SENTINEL(file) + '\n';
    const first = lineOf();
    text += body;
    parts.push({ file, firstLine: first, lastLine: lineOf() - 1 });
  };
  const gameFile = (f) => fs.readFileSync(path.join(srcDir, 'game', f), 'utf8');
  for (const f of manifest.closure) add(f, gameFile(f));
  const qaText = () => fs.readFileSync(path.join(srcDir, 'qa', 'qa.js'), 'utf8');
  if (sentinels) add(QA_FILE, qaText());
  else text += qa ? qaText() : '  ' + QA_MARKER + '\n';
  text += '})();\n';
  for (const f of manifest.afterClosure) add(f, gameFile(f));
  return { text, parts };
}

// Maps a line of the assembled text (no sentinels) to { file, line } inside src/game.
export function locate(parts, line) {
  for (const p of parts) if (line >= p.firstLine && line <= p.lastLine) return { file: `src/game/${p.file}`, line: line - p.firstLine + 1 };
  return { file: 'src/game (assembled)', line };
}

// Writes the files back from a text made with sentinels (after refactor tools edited it).
export function splitGame(srcDir, text) {
  const manifest = readManifest(srcDir);
  const re = /^\/\*@@FILE ([^@]+)@@\*\/\n/gm;
  const marks = [...text.matchAll(re)];
  if (!marks.length) throw new Error('no file sentinels found');
  const out = new Map();
  marks.forEach((m, i) => {
    const start = m.index + m[0].length;
    const end = i + 1 < marks.length ? marks[i + 1].index : text.length;
    let body = text.slice(start, end);
    if (m[1] === QA_FILE) {
      // the closure ends right after the QA text
      if (!body.endsWith('})();\n')) throw new Error('closing of the closure not found after qa/qa.js');
      body = body.slice(0, -'})();\n'.length);
    }
    out.set(m[1], body);
  });
  for (const f of [...manifest.closure, ...manifest.afterClosure, QA_FILE]) if (!out.has(f)) throw new Error(`sentinel for ${f} missing`);
  for (const [f, body] of out) fs.writeFileSync(f === QA_FILE ? path.join(srcDir, 'qa', 'qa.js') : path.join(srcDir, 'game', f), body);
  return [...out.keys()];
}
