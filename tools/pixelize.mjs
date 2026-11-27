// Turns a picture (PNG) into a game sprite: crop to the figure, shrink to the sprite frame, quantize to a small palette, add the one-pixel ink outline,
// and print a `{w,h,palette,rows}` literal that render.js draws with drawPixelRows (see PIXEL_ACTORS105).
//   node tools/pixelize.mjs input.png [--w 32] [--h 36] [--colors 14] [--name 상여 귀신] [--out sprite.txt] [--preview preview.png]
// A transparent background is used as it is; an opaque picture has its background removed by the colour of its corners.
import fs from 'node:fs';
import { PNG } from 'pngjs';

const args = process.argv.slice(2);
const input = args.find(a => !a.startsWith('--') && args[args.indexOf(a) - 1]?.startsWith('--') !== true);
const opt = (name, fallback) => { const i = args.indexOf('--' + name); return i >= 0 ? args[i + 1] : fallback; };
if (!input) { console.error('usage: node tools/pixelize.mjs input.png [--w 32] [--h 36] [--colors 14] [--name NAME] [--out file] [--preview file]'); process.exit(1); }
const W = +opt('w', 32), H = +opt('h', 36), COLORS = Math.min(36, +opt('colors', 14)), NAME = opt('name', '');
const OUTLINE = [18, 15, 18];

const png = PNG.sync.read(fs.readFileSync(input));
const { width: iw, height: ih, data } = png;
const px = (x, y) => { const i = (y * iw + x) * 4; return [data[i], data[i + 1], data[i + 2], data[i + 3]]; };

// 1. alpha mask: use the picture's alpha when it has any, otherwise treat pixels close to the corner colour as background
const hasAlpha = (() => { for (let i = 3; i < data.length; i += 4) if (data[i] < 250) return true; return false; })();
const mask = new Uint8Array(iw * ih);
if (hasAlpha) { for (let y = 0; y < ih; y++) for (let x = 0; x < iw; x++) mask[y * iw + x] = px(x, y)[3] > 127 ? 1 : 0; }
else {
  const corners = [px(0, 0), px(iw - 1, 0), px(0, ih - 1), px(iw - 1, ih - 1)];
  const bg = [0, 1, 2].map(c => corners.reduce((a, p) => a + p[c], 0) / 4);
  for (let y = 0; y < ih; y++) for (let x = 0; x < iw; x++) { const p = px(x, y); mask[y * iw + x] = Math.hypot(p[0] - bg[0], p[1] - bg[1], p[2] - bg[2]) > 40 ? 1 : 0; }
}

// 2. crop to the figure
let x0 = iw, y0 = ih, x1 = 0, y1 = 0;
for (let y = 0; y < ih; y++) for (let x = 0; x < iw; x++) if (mask[y * iw + x]) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
if (x1 <= x0) { console.error('no figure found'); process.exit(1); }
const cw = x1 - x0 + 1, ch = y1 - y0 + 1;

// 3. shrink with a box filter into the frame minus a one-pixel margin for the outline, feet on the bottom row
const innerW = W - 2, innerH = H - 3, scale = Math.min(innerW / cw, innerH / ch);
const tw = Math.max(1, Math.round(cw * scale)), th = Math.max(1, Math.round(ch * scale)), ox = Math.floor((W - tw) / 2), oy = H - 2 - th;
const cells = Array.from({ length: W * H }, () => null);
for (let ty = 0; ty < th; ty++) for (let tx = 0; tx < tw; tx++) {
  const sx0 = x0 + tx / scale, sx1 = x0 + (tx + 1) / scale, sy0 = y0 + ty / scale, sy1 = y0 + (ty + 1) / scale;
  let n = 0, solid = 0, r = 0, g = 0, b = 0;
  for (let sy = Math.floor(sy0); sy < Math.ceil(sy1); sy++) for (let sx = Math.floor(sx0); sx < Math.ceil(sx1); sx++) {
    if (sx < 0 || sy < 0 || sx >= iw || sy >= ih) continue; n++;
    if (!mask[sy * iw + sx]) continue; const p = px(sx, sy); solid++; r += p[0]; g += p[1]; b += p[2];
  }
  if (n && solid / n >= .5) cells[(oy + ty) * W + ox + tx] = [r / solid, g / solid, b / solid];
}

// 4. quantize to a small palette (k-means, seeded from the most common colours)
const pts = cells.filter(Boolean);
const bins = new Map(); for (const p of pts) { const k = p.map(v => Math.round(v / 16)).join(','); bins.set(k, (bins.get(k) || 0) + 1); }
let centers = [...bins.entries()].sort((a, b) => b[1] - a[1]).slice(0, COLORS).map(([k]) => k.split(',').map(v => +v * 16));
while (centers.length < Math.min(COLORS, 2)) centers.push([128, 128, 128]);
for (let it = 0; it < 10; it++) {
  const sum = centers.map(() => [0, 0, 0, 0]);
  for (const p of pts) { let best = 0, bd = 1e9; centers.forEach((c, i) => { const d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2; if (d < bd) { bd = d; best = i; } }); const s = sum[best]; s[0] += p[0]; s[1] += p[1]; s[2] += p[2]; s[3]++; }
  centers = centers.map((c, i) => sum[i][3] ? [sum[i][0] / sum[i][3], sum[i][1] / sum[i][3], sum[i][2] / sum[i][3]] : c);
}
const hex = c => '#' + c.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const palette = centers.map(hex);
const idx = new Array(W * H).fill(-1);
cells.forEach((p, i) => { if (!p) return; let best = 0, bd = 1e9; centers.forEach((c, j) => { const d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2; if (d < bd) { bd = d; best = j; } }); idx[i] = best; });

// 5. ink outline around the silhouette (the same colour the bestiary uses)
const inkIndex = palette.length; palette.push(hex(OUTLINE));
const solidAt = (x, y) => x >= 0 && y >= 0 && x < W && y < H && idx[y * W + x] >= 0 && idx[y * W + x] !== inkIndex;
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  if (idx[y * W + x] >= 0) continue;
  if (solidAt(x - 1, y) || solidAt(x + 1, y) || solidAt(x, y - 1) || solidAt(x, y + 1)) idx[y * W + x] = inkIndex;
}

const rows = []; for (let y = 0; y < H; y++) { let row = ''; for (let x = 0; x < W; x++) { const v = idx[y * W + x]; row += v < 0 ? '.' : v.toString(36); } rows.push(row); }
const literal = `${NAME ? JSON.stringify(NAME) + ':' : ''}{w:${W},h:${H},palette:${JSON.stringify(palette)},rows:${JSON.stringify(rows)}}`;
const out = opt('out', '');
if (out) fs.writeFileSync(out, literal + '\n'); else console.log(literal);

const preview = opt('preview', '');
if (preview) {
  const k = 12, big = new PNG({ width: W * k, height: H * k });
  for (let y = 0; y < H * k; y++) for (let x = 0; x < W * k; x++) {
    const v = idx[Math.floor(y / k) * W + Math.floor(x / k)], o = (y * W * k + x) * 4, c = v < 0 ? [43, 58, 54] : palette[v].slice(1).match(/../g).map(h => parseInt(h, 16));
    big.data[o] = c[0]; big.data[o + 1] = c[1]; big.data[o + 2] = c[2]; big.data[o + 3] = 255;
  }
  fs.writeFileSync(preview, PNG.sync.write(big));
}
console.error(`${W}x${H}, ${palette.length - 1} colours + outline`);
