// Title load recording: CDP screencast from navigation until the title settles.
// Every frame must be either the blank background (nothing revealed yet) or the final
// title (allowing the lantern flicker / glow pulse animation). Anything else is a flash
// of an intermediate title.
//   node tests/title-frames.mjs [src dir | --target single] [--save <dir>]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import { launch } from './harness.mjs';
import { serve } from './server.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const saveDir = args.includes('--save') ? args[args.indexOf('--save') + 1] : null;
const single = args.includes('--target') && args[args.indexOf('--target') + 1] === 'single';
const dir = single ? path.join(here, '..', 'dist') : path.resolve(args.find((a) => !a.startsWith('--') && a !== saveDir) || path.join(here, '..', 'src'));
const entry = single ? 'MANRU.html' : '';

// 40x25 grey thumbnail
function thumb(buf) {
  const png = PNG.sync.read(buf);
  const W = 40, H = 25, out = new Float64Array(W * H), cnt = new Float64Array(W * H);
  for (let y = 0; y < png.height; y++) for (let x = 0; x < png.width; x++) {
    const i = (y * png.width + x) * 4, k = Math.floor(y * H / png.height) * W + Math.floor(x * W / png.width);
    out[k] += (png.data[i] + png.data[i + 1] + png.data[i + 2]) / 3;
    cnt[k]++;
  }
  for (let k = 0; k < out.length; k++) out[k] /= cnt[k] || 1;
  return out;
}
const diff = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]); return s / a.length; };
const spread = (a) => { let lo = 255, hi = 0; for (const v of a) { lo = Math.min(lo, v); hi = Math.max(hi, v); } return hi - lo; };

const browser = await launch();
let failed = 0;
try {
  for (const [form, viewport, mobile] of [['pc', { width: 1280, height: 800 }, false], ['mobile', { width: 390, height: 844 }, true]]) {
    const server = await serve(dir);
    const ctx = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    const frames = [];
    cdp.on('Page.screencastFrame', async (f) => {
      frames.push({ t: f.metadata.timestamp, data: Buffer.from(f.data, 'base64') });
      await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
    });
    await page.goto('about:blank');
    await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1 });
    await page.goto(server.url + entry);
    await page.waitForTimeout(4000);
    await cdp.send('Page.stopScreencast');
    const final = thumb(await page.screenshot());
    const t0 = frames[0]?.t || 0;
    const rows = frames.map((f, i) => {
      const th = thumb(f.data);
      const kind = spread(th) < 12 ? 'blank' : diff(th, final) < 6 ? 'final' : 'OTHER';
      if (saveDir) { fs.mkdirSync(saveDir, { recursive: true }); fs.writeFileSync(path.join(saveDir, `${form}-${String(i).padStart(3, '0')}-${kind}.png`), f.data); }
      return { at: Math.round((f.t - t0) * 1000), kind, d: +diff(th, final).toFixed(1) };
    });
    const firstVisible = rows.find((r) => r.kind !== 'blank');
    const other = rows.filter((r) => r.kind === 'OTHER');
    console.log(`${form}: ${rows.length} frames, first non-blank at ${firstVisible?.at ?? '-'} ms (${firstVisible?.kind ?? '-'}), intermediate frames: ${other.length}${other.length ? ' ' + JSON.stringify(other.slice(0, 6)) : ''}`);
    if (other.length || !firstVisible) failed++;
    await ctx.close();
    await server.close();
  }
} finally {
  await browser.close();
}
process.exit(failed ? 1 : 0);
