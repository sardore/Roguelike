#!/usr/bin/env node
// One build for both deliverables, from the single source tree in src/.
//
//   dist/MANRU.html   single file: every script and stylesheet inlined, no external requests
//   dist/app/         Capacitor project (package.json, capacitor.config.json, android build
//                     scripts) whose www/ is the installable PWA (manifest, service worker, icons)
//
// Replaces the former build_standalone.py and assemble_app.py.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(repo, 'src');
const appShell = path.join(repo, 'app');
const dist = path.join(repo, 'dist');
const GAME_DIRS = ['scripts', 'styles', 'assets'];

function fail(message) {
  console.error('build failed: ' + message);
  process.exit(1);
}

const read = (p) => fs.readFileSync(p, 'utf8');
const html = read(path.join(src, 'index.html'));

// ---------------------------------------------------------------- single HTML
function inline(page) {
  let out = page.replace(/<script([^>]*\bsrc=["'](scripts\/[^"']+)["'][^>]*)>\s*<\/script>/g, (_m, attrs, file) => {
    const text = read(path.join(src, file)).replaceAll('</script', '<\\/script');
    return '<script' + attrs.replace(/\s+src=["'][^"']+["']/, '') + '>' + text + '</script>';
  });
  out = out.replace(/<link\s+[^>]*href=["'](styles\/[^"']+)["'][^>]*>/g, (_m, file) => '<style>' + read(path.join(src, file)) + '</style>');
  if (/(?:src|href)=["'](?:scripts|styles)\//.test(out)) fail('an external script or stylesheet reference survived inlining');
  if (out.includes('__MANRU_QA__')) fail('the QA bridge must not ship in the release build');
  return out;
}

// ---------------------------------------------------------------- app (PWA + Capacitor)
const HEAD_TAGS = `<link rel="manifest" href="manifest.webmanifest">
<meta name="theme-color" content="#120a06">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="만루">
<link rel="icon" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/icon-192.png">
`;

const SW_TEMPLATE = `// 만루 오프라인 캐시 (자동 생성 — tools/build.mjs)
const CACHE='manru-__HASH__';
const FILES=__FILES__;
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('manru-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);if(url.origin!==location.origin)return;
  if(req.mode==='navigate'){e.respondWith(caches.match('./index.html').then(r=>r||fetch(req)));return}
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(r=>r||fetch(req)));
});
`;

function appIndex(page) {
  if (page.includes('manifest.webmanifest')) fail('src/index.html must not carry app tags; the build adds them');
  const m = page.match(/<meta name="viewport"[^>]*>\s*/);
  if (!m) fail('viewport meta tag not found');
  if (!page.includes('</body>')) fail('</body> not found');
  const at = m.index + m[0].length;
  return (page.slice(0, at) + HEAD_TAGS + page.slice(at)).replace('</body>', '<script src="pwa-register.js"></script>\n</body>');
}

function listFiles(dir, base = dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? listFiles(p, base) : [path.relative(base, p).split(path.sep).join('/')];
  });
}

function buildApp(out) {
  const www = path.join(out, 'www');
  fs.mkdirSync(www, { recursive: true });
  for (const d of GAME_DIRS) if (fs.existsSync(path.join(src, d))) fs.cpSync(path.join(src, d), path.join(www, d), { recursive: true });
  fs.writeFileSync(path.join(www, 'index.html'), appIndex(html));
  fs.cpSync(path.join(appShell, 'pwa'), www, { recursive: true });
  const files = listFiles(www).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  const h = crypto.createHash('sha256');
  for (const f of files) {
    h.update(f);
    h.update(fs.readFileSync(path.join(www, f)));
  }
  const cache = ['./', ...files.map((f) => './' + f)];
  fs.writeFileSync(path.join(www, 'sw.js'), SW_TEMPLATE.replace('__HASH__', h.digest('hex').slice(0, 12)).replace('__FILES__', JSON.stringify(cache).replaceAll('","', '", "')));
  for (const f of ['package.json', 'capacitor.config.json', 'build-android.sh', 'build-android.bat', 'README_APP_KO.txt']) {
    fs.copyFileSync(path.join(appShell, f), path.join(out, f));
  }
  fs.chmodSync(path.join(out, 'build-android.sh'), 0o755);
  return files.length + 1;
}

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
const single = inline(html);
fs.writeFileSync(path.join(dist, 'MANRU.html'), single);
const count = buildApp(path.join(dist, 'app'));
console.log(`dist/MANRU.html ${single.length} bytes · dist/app/www ${count} files`);
