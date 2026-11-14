import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const root = path.resolve(process.argv[2] || '.');
const source = path.join(root, 'src');
const qa = fs.readFileSync(path.join(source, 'qa/qa.js'), 'utf8');
const bridge = `globalThis.mapPerformance = {
  prepare() {
    regenerateFloor(7);
    state.seen = new Set(state.visible);
    state.monsters = []; state.items = [];
    const item = {...TALISMAN_BY_KIND.get('mapping'), count:1};
    state.player.inventory.unshift(item);
    return [state.seen.size, COLS * ROWS];
  },
  reveal() { return useInventoryItem(0); },
  draw() { drawMap(true); drawMinimap(true); },
  paint() { return {seen:state.seen.size, visible:state.visible.size, mini:MC.toDataURL()}; },
  editMap() {
    const x=state.player.x,y=state.player.y;
    setTerrainTile58(state.map,x+2,y,TT.WATER);
  },
  moveMarker() { state.player.x++; },
};`;
const runtime = assembleGame(source).text.replace(QA_MARKER, qa + '\n' + bridge);
const browser = await launch();
try {
  for (const [form, options] of [['mobile', {viewport:{width:390,height:844},isMobile:true,hasTouch:true}], ['pc', {viewport:{width:1280,height:800}}]]) {
    const ctx = await browser.newContext(options);
    await ctx.route('**/scripts/10-runtime.js', route => route.fulfill({contentType:'text/javascript',body:runtime}));
    const s = await openSession(browser,path.join(root,'dist-qa'),{context:ctx,seed:17});
    try {
      await startRun(s,'wanderer');
      await dismissModals(s);
      const result = await s.page.evaluate(() => {
        const api = window.mapPerformance;
        const [before,total] = api.prepare();
        const used = api.reveal();
        api.draw();
        const revealed = api.paint();
        const prototype = CanvasRenderingContext2D.prototype;
        const fill = prototype.fillRect;
        let rects = 0;
        prototype.fillRect = function (...args) { rects++; return fill.apply(this,args); };
        try {
          for (let frame=0; frame<100; frame++) api.draw();
          const rectsPerFrame = rects / 100;
          const repeat=api.paint();
          api.editMap();api.draw();
          const edited=api.paint();
          api.moveMarker();api.draw();
          const moved=api.paint();
          return {before,total,used,seen:revealed.seen,visible:revealed.visible,rects:rectsPerFrame,
            stable:repeat.mini===revealed.mini,updated:edited.mini!==revealed.mini,
            markerMoved:moved.mini!==edited.mini,minimap:revealed.mini};
        } finally {prototype.fillRect=fill;}
      });
      assert.equal(result.used,true);
      assert.ok(result.before < result.seen && result.visible < result.seen);
      assert.equal(result.seen,result.total);
      assert.ok(result.stable && result.updated && result.markerMoved);
      if (process.argv.length === 2) assert.ok(result.rects < result.total, 'paint still scales with the revealed floor');
      assert.deepEqual(s.errors,[]);
      const {minimap,...stats}=result;
      console.log(form,JSON.stringify({...stats,minimapHash:createHash('sha256').update(minimap).digest('hex').slice(0,12)}));
    } finally {
      await s.close();
      await ctx.close();
    }
  }
} finally {
  await browser.close();
}
