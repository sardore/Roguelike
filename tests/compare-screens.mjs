// Compare two screen captures (tests/run.mjs --only screens --label X):
//   computed-style dumps must match exactly; screenshots may differ only by sub-threshold noise.
//   node tests/compare-screens.mjs <labelA> <labelB>
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const [a, b] = process.argv.slice(2).map((l) => path.join(here, 'artifacts', l));
const out = path.join(here, 'artifacts', 'screen-diff');
fs.mkdirSync(out, { recursive: true });
// Per-channel difference treated as noise. The game canvas read back from the page is nearly
// exact, so it gets a strict limit; composited screenshots and the animated arena get more.
const noiseFor = (name) => (name.endsWith('.canvas.png') && !name.includes('battle') ? 2 : 24);
// Share of pixels allowed above the noise level. Floor 25's void sparkle particles vary
// between identical runs by ~0.5%, so the per-floor canvases get a slightly wider margin.
const limitFor = (name) => (name.startsWith('screens.render.') ? 0.006 : 0.002);
let failed = 0;
// Only groups present in the second capture are compared (a capture may cover just
// `screens` or just `render`).
const groupOf = (n) => n.split('.').slice(0, 2).join('.');
const groupsB = new Set(fs.readdirSync(b).filter((f) => f.startsWith('screens.')).map(groupOf));
for (const name of fs.readdirSync(a).filter((f) => f.startsWith('screens.') && groupsB.has(groupOf(f))).sort()) {
  const fa = path.join(a, name), fb = path.join(b, name);
  if (!fs.existsSync(fb)) { console.log(`MISSING ${name}`); failed++; continue; }
  if (name.endsWith('.png')) {
    const pa = PNG.sync.read(fs.readFileSync(fa)), pb = PNG.sync.read(fs.readFileSync(fb));
    if (pa.width !== pb.width || pa.height !== pb.height) { console.log(`SIZE ${name}`); failed++; continue; }
    const diff = new PNG({ width: pa.width, height: pa.height });
    let n = 0;
    for (let i = 0; i < pa.data.length; i += 4) {
      const d = Math.max(Math.abs(pa.data[i] - pb.data[i]), Math.abs(pa.data[i + 1] - pb.data[i + 1]), Math.abs(pa.data[i + 2] - pb.data[i + 2]));
      const bad = d > noiseFor(name);
      if (bad) n++;
      diff.data[i] = bad ? 255 : pa.data[i] / 4;
      diff.data[i + 1] = bad ? 0 : pa.data[i + 1] / 4;
      diff.data[i + 2] = bad ? 0 : pa.data[i + 2] / 4;
      diff.data[i + 3] = 255;
    }
    const share = n / (pa.width * pa.height);
    if (share > limitFor(name)) {
      failed++;
      fs.writeFileSync(path.join(out, name), PNG.sync.write(diff));
      console.log(`PIXELS ${name}: ${(share * 100).toFixed(3)}% (diff image in ${out})`);
    }
  } else if (fs.readFileSync(fa, 'utf8') !== fs.readFileSync(fb, 'utf8')) {
    failed++;
    const la = fs.readFileSync(fa, 'utf8').split('\n'), lb = fs.readFileSync(fb, 'utf8').split('\n');
    const first = la.findIndex((l, i) => l !== lb[i]);
    console.log(`STYLE ${name}: first difference at element ${first}\n  - ${la[first]?.slice(0, 300)}\n  + ${lb[first]?.slice(0, 300)}`);
  }
}
console.log(failed ? `${failed} screen differences` : 'screens match');
process.exit(failed ? 1 : 0);
