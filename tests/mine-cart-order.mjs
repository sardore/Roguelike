// Run after npm run build:qa. 버튼을 밟으면 동차·바위가 먼저 굴러가고 벽은 그 다음에 열린다: 이 버튼이 여는 벽 뒤에 있던 동차는
// 벽에 막혀 멈추고(부서지고), 벽이 열린 뒤 어둠 속에서 날아와 맞는 일이 없다. 벽이 없으면 예전처럼 굴러온다.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = 'globalThis.mc={state:()=>state,TT,build:buildBranch,press:minePress,mine:mineState,view:resetVisualState,setTile:setTerrainTile58,clock:mineClock};';
const runtime = assembleGame(path.join(repo, 'src')).text.replace(QA_MARKER, fs.readFileSync(path.join(repo, 'src/qa/qa.js'), 'utf8') + '\n' + bridge);
const browser = await launch();
const ctx = await browser.newContext();
await ctx.route('**/scripts/10-runtime.js', r => r.fulfill({ contentType: 'text/javascript', body: runtime }));
const s = await openSession(browser, path.join(repo, 'dist-qa'), { context: ctx, seed: 217 });
const errors = []; s.page.on('pageerror', e => errors.push(e.message));
await startRun(s, 'swordsman'); await dismissModals(s);
const out = await s.page.evaluate(() => {
  const r = {}, st = mc.state(); st.tutorialEntry60 = { completed: true }; st.branchWorld105 = { version: 1, pages: {} }; st.runId984 = 'cart-order'; mc.build('mine', 1);
  const cur = mc.state(), m = mc.mine(), bx = 20, by = 30;
  const lane = () => { for (let y = 2; y < 50; y++) mc.setTile(cur.map, bx, y, mc.TT.FLOOR); cur.monsters = []; cur.player.hp = cur.player.maxHp = 200; Object.assign(cur.player, { x: bx, y: by - 3 }); m.sources = []; m.walls = []; m.buttons = [{ id: 'qa', x: bx, y: by }]; };
  // a cart sealed behind a wall that this button opens
  lane(); mc.setTile(cur.map, bx, by + 4, mc.TT.WALL);
  m.walls = [{ id: 'qa-wall', buttonId: 'qa', cells: [{ x: bx, y: by + 4 }], open: false, until: 0 }]; m.carts = [{ id: 'qa:0', home: 'qa', x: bx, y: by + 9, alive: true }];
  mc.press(bx, by, 'player');
  r.sealedHp = cur.player.hp; r.sealedWallOpen = cur.map[by + 4][bx] !== mc.TT.WALL; r.sealedCartAlive = m.carts.some(c => c.alive);
  // the same cart with no wall in the way still rolls (and hits a player standing in its path)
  lane(); m.carts = [{ id: 'qa:1', home: 'qa', x: bx, y: by + 9, alive: true }];
  mc.press(bx, by, 'player');
  r.openHp = cur.player.hp;
  // a cart standing inside a wall cell does not roll out of it
  lane(); mc.setTile(cur.map, bx, by + 4, mc.TT.WALL); m.carts = [{ id: 'qa:2', home: 'qa', x: bx, y: by + 4, alive: true }];
  mc.press(bx, by, 'player');
  r.embeddedHp = cur.player.hp;
  return r;
});
console.log('mine-cart-order', JSON.stringify(out));
assert.equal(out.sealedHp, 200, '벽 뒤에 있던 동차는 벽이 열려도 날아오지 않는다');
assert.ok(out.sealedWallOpen, '벽은 열린다');
assert.ok(out.openHp < 200, '막는 것이 없으면 굴러와 맞는다');
assert.equal(out.embeddedHp, 200, '벽 칸 안의 동차는 굴러나오지 않는다');
assert.deepEqual(errors, []);
console.log('mine-cart-order: ok');
await browser.close(); process.exit(0);
