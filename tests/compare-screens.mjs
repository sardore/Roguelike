// Compare two screen captures (tests/run.mjs --only screens --label X):
//   computed-style dumps must match exactly; screenshots may differ only by sub-threshold noise.
//   node tests/compare-screens.mjs <labelA> <labelB>
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compareImages } from './lib-images.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const [a, b] = process.argv.slice(2).map((l) => path.join(here, 'artifacts', l));
const out = path.join(here, 'artifacts', 'screen-diff');
fs.mkdirSync(out, { recursive: true });
let failed = 0;
// Only groups present in the second capture are compared (a capture may cover just
// `screens` or just `render`).
const groupOf = (n) => n.split('.').slice(0, 2).join('.');
const groupsB = new Set(fs.readdirSync(b).filter((f) => f.startsWith('screens.')).map(groupOf));
for (const name of fs.readdirSync(a).filter((f) => f.startsWith('screens.') && groupsB.has(groupOf(f))).sort()) {
  const fa = path.join(a, name), fb = path.join(b, name);
  if (!fs.existsSync(fb)) { console.log(`MISSING ${name}`); failed++; continue; }
  if (name.endsWith('.png')) {
    const r = compareImages(name, fs.readFileSync(fa), fs.readFileSync(fb), out);
    if (!r.ok) { failed++; console.log(`PIXELS ${name}: ${r.reason}`); }
  } else if (fs.readFileSync(fa, 'utf8') !== fs.readFileSync(fb, 'utf8')) {
    failed++;
    const la = fs.readFileSync(fa, 'utf8').split('\n'), lb = fs.readFileSync(fb, 'utf8').split('\n');
    const first = la.findIndex((l, i) => l !== lb[i]);
    console.log(`STYLE ${name}: first difference at element ${first}\n  - ${la[first]?.slice(0, 300)}\n  + ${lb[first]?.slice(0, 300)}`);
  }
}
console.log(failed ? `${failed} screen differences` : 'screens match');
process.exit(failed ? 1 : 0);
