// Title load recording: CDP screencast from navigation until the title settles.
// Every frame must be either the blank background (nothing revealed yet) or the final
// title (allowing the lantern flicker / glow pulse animation). Anything else is a flash
// of an intermediate title. The continue button is checked on its own as well: its class may change only before the
// first visible frame (while the scripts run), and its region must look the same in every visible frame. --storage <fixture.json> boots with a save (tests/baseline/saves/*.json).
//   node tests/title-frames.mjs [src dir | --target single] [--save <dir>] [--storage <fixture.json>]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import { launch } from './harness.mjs';
import { serve } from './server.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const saveDir = args.includes('--save') ? args[args.indexOf('--save') + 1] : null;
const storageFile = args.includes('--storage') ? args[args.indexOf('--storage') + 1] : null;
const storage = storageFile ? JSON.parse(fs.readFileSync(storageFile, 'utf8')).storage : null;
const single = args.includes('--target') && args[args.indexOf('--target') + 1] === 'single';
const dir = single ? path.join(here, '..', 'dist') : path.resolve(args.find((a) => !a.startsWith('--') && a !== saveDir && a !== storageFile) || path.join(here, '..', 'src'));
const entry = single ? 'MANRU.html' : '';

// 40x25 grey thumbnail (of a region {x,y,w,h} in CSS pixels, when given)
function thumb(buf, box = null) {
  const png = PNG.sync.read(buf);
  const W = 40, H = 25, out = new Float64Array(W * H), cnt = new Float64Array(W * H);
  const bx = box ? Math.max(0, Math.floor(box.x)) : 0, by = box ? Math.max(0, Math.floor(box.y)) : 0;
  const bw = box ? Math.min(png.width - bx, Math.ceil(box.w)) : png.width, bh = box ? Math.min(png.height - by, Math.ceil(box.h)) : png.height;
  for (let y = by; y < by + bh; y++) for (let x = bx; x < bx + bw; x++) {
    const i = (y * png.width + x) * 4, k = Math.floor((y - by) * H / bh) * W + Math.floor((x - bx) * W / bw);
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
    // continue button class history, from the moment the element is parsed
    await page.addInitScript(() => {
      const probe = (window.__TITLE_FRAMES_CONTINUE__ = { initial: null, changes: [] });
      new MutationObserver((list) => {
        for (const m of list) {
          if (m.type === 'childList') for (const n of m.addedNodes) { const b = n.id === 'continueBtn' ? n : n.querySelector?.('#continueBtn'); if (b && probe.initial === null) probe.initial = b.className; }
          if (m.type === 'attributes' && m.target.id === 'continueBtn') probe.changes.push({ from: m.oldValue, at: Date.now() });
        }
      }).observe(document, { subtree: true, childList: true, attributes: true, attributeOldValue: true, attributeFilter: ['class'] });
    });
    if (storage) await page.addInitScript((entries) => {
      try { if (location.protocol === 'about:' || sessionStorage.getItem('__title_frames_seeded')) return; sessionStorage.setItem('__title_frames_seeded', '1'); localStorage.clear(); for (const [k, v] of entries) localStorage.setItem(k, v); } catch (_) {}
    }, storage);
    await page.goto('about:blank');
    await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1 });
    await page.goto(server.url + entry);
    await page.waitForTimeout(4000);
    await cdp.send('Page.stopScreencast');
    const finalShot = await page.screenshot();
    const final = thumb(finalShot);
    const btn = await page.evaluate(() => { const b = document.getElementById('continueBtn'), r = b?.getBoundingClientRect(); return { probe: window.__TITLE_FRAMES_CONTINUE__, cls: b?.className, box: r && r.width ? { x: r.x, y: r.y, w: r.width, h: r.height } : null }; });
    const finalBtn = btn.box ? thumb(finalShot, btn.box) : null;
    const t0 = frames[0]?.t || 0;
    const rows = frames.map((f, i) => {
      const th = thumb(f.data);
      const kind = spread(th) < 12 ? 'blank' : diff(th, final) < 6 ? 'final' : 'OTHER';
      if (saveDir) { fs.mkdirSync(saveDir, { recursive: true }); fs.writeFileSync(path.join(saveDir, `${form}-${String(i).padStart(3, '0')}-${kind}.png`), f.data); }
      return { at: Math.round((f.t - t0) * 1000), kind, d: +diff(th, final).toFixed(1) };
    });
    // the button region in every visible frame (the screencast frames have the page's size at DPR 1)
    const btnFrames = finalBtn ? frames.map((f) => ({ f, th: thumb(f.data) })).filter((x) => spread(x.th) >= 12).map((x) => +diff(thumb(x.f.data, btn.box), finalBtn).toFixed(1)) : [];
    const btnOther = btnFrames.filter((d) => d >= 6).length;
    // a class change is only allowed before the first visible frame (while the scripts run, nothing is painted)
    const firstShown = frames.find((f) => spread(thumb(f.data)) >= 12);
    const changes = btn.probe?.changes || [];
    const late = firstShown ? changes.filter((c) => c.at >= firstShown.t * 1000) : changes;
    console.log(`${form}: continue button class at parse ${JSON.stringify(btn.probe?.initial)}, changes before the first visible frame ${changes.length - late.length} (${changes.map((c) => JSON.stringify(c.from)).join(', ') || '-'}), after it ${late.length} -> final ${JSON.stringify(btn.cls)}; button region differs from the final title in ${btnOther} of ${btnFrames.length} visible frames${btn.box ? '' : ' (button not visible)'}`);
    if (late.length || btnOther) failed++;
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
