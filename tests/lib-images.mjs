// Image comparison shared by tests/run.mjs (committed baselines) and tests/compare-screens.mjs
// (two labelled runs). Screenshots may differ only by sub-threshold noise.
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

// Per-channel difference treated as noise. The game canvas read back from the page is nearly
// exact, so it gets a strict limit; composited screenshots and the animated arena get more.
export const noiseFor = (name) => (name.endsWith('.canvas.png') && !name.includes('battle') ? 2 : 24);
// Share of pixels allowed above the noise level. Floor 25's void sparkle particles vary
// between identical runs by ~0.5%, so the per-floor canvases get a slightly wider margin.
export const limitFor = (name) => (name.startsWith('screens.render.') ? 0.006 : 0.002);

// Returns {ok, reason?, share?}; writes a red-highlight diff image into diffDir when it fails on pixels.
export function compareImages(name, bufA, bufB, diffDir) {
  const pa = PNG.sync.read(bufA), pb = PNG.sync.read(bufB);
  if (pa.width !== pb.width || pa.height !== pb.height) return { ok: false, reason: `size ${pa.width}x${pa.height} vs ${pb.width}x${pb.height}` };
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
  if (share <= limitFor(name)) return { ok: true, share };
  if (diffDir) { fs.mkdirSync(diffDir, { recursive: true }); fs.writeFileSync(path.join(diffDir, name), PNG.sync.write(diff)); }
  return { ok: false, share, reason: `${(share * 100).toFixed(3)}% of pixels differ` };
}
