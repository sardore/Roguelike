// Run after npm run build:qa. 만루보주: 섬광탄(3줄 설치 후 차례 폭발, 3단계 속성), 구조 재편(벽·지형 생성), 약해진 소환.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = `globalThis.mb={
 arena:()=>{state.debugBattle57=true;state.monsters=[];state.tempFields=[];state.tempTerrain74=[];state.items=[];for(let y=4;y<27;y++)for(let x=4;x<40;x++)setTerrainTile58(state.map,x,y,TT.FLOOR);state.player.hp=state.player.maxHp=900000;state.status={}},
 boss:(x,y,stage)=>{const m={...clone(BOSSES[25]),boss:true,x,y,alerted:true,hp:240,maxHp:240,coreStage54:stage};OccupancyService.addMonster(m);return m},
 flash:(stage)=>{mb.arena();const m=mb.boss(21,15,stage);OccupancyService.move(state.player,14,15);
  const dirOk={0:(dx,dy)=>dx&&dy&&Math.abs(dx)===Math.abs(dy),1:(dx,dy)=>!dx||!dy,2:(dx,dy)=>!dx||!dy||Math.abs(dx)===Math.abs(dy)}[stage];
  const plan=planFlashSequence(m,state.player);if(!plan)return{noPlan:true};
  const out={waves:plan.waves.length,perWave:plan.waves.map(w=>w.bombs.length),left:plan.left,element:plan.phase.element};
  out.shape=plan.waves.every(w=>w.cells.every(c=>w.bombs.some(b=>{const dx=c.x-b.x,dy=c.y-b.y;return (!dx&&!dy)||(Math.max(Math.abs(dx),Math.abs(dy))<=8&&dirOk(dx,dy))})));
  out.stayCovered=plan.waves.some(w=>w.cells.some(c=>c.x===14&&c.y===15));
  const first=plan.waves[0];setBossIntent(m,'flashblast',first.cells,'t',{waves:plan.waves,step:0,element:plan.phase.element,color:plan.phase.color,rgb:plan.phase.rgb,stage});
  const log=[];const max=state.player.maxHp;let execs=0,lost=0;
  while(m.intent54&&execs<8){state.turn+=1;const before=state.player.hp;executeBossIntent(m);execs++;const dmg=before-state.player.hp;lost+=dmg;log.push([execs,dmg,!!m.intent54,m.intent54?m.intent54.cells.length:0]);state.player.hp=max}
  out.execs=execs;out.lost=lost;out.cleared=!m.intent54;out.log=log;out.status={poison:state.status.poison||0,weaken:state.status.weaken||0,skillSeal:state.status.skillSeal||0,bleed:state.status.bleed||0,blind:state.status.blind||0};return out},
 // 사념체가 살아 있는 동안에는 섬광탄을 쓰지 않는다.
 core:()=>{mb.arena();const m=mb.boss(21,15,1);OccupancyService.move(state.player,14,15);const core={name:'핵',hp:10,maxHp:10,atk:0,def:0,x:30,y:15,combatFixture54:'core',coreStage54:1,fixed:true,statusImmune:true};adoptBossChild57(core,m);OccupancyService.addMonster(core);
  state.floorTurn=100;m.nextFlash54=0;m.nextWeave54=9999;m.nextShot54=9999;m.nextAction54=0;handleBossPattern(m,7,state.player);return{used:m.intent54?.type||null}},
 wall:()=>{mb.arena();const m=mb.boss(21,15,0);OccupancyService.move(state.player,14,15);for(let y=10;y<=20;y++)setTerrainTile58(state.map,16,y,TT.WALL);
  const plan=planFlashSequence(m,state.player);if(!plan)return{blocked:true};
  const ok=plan.waves.every(w=>w.cells.every(c=>!(c.x>16&&c.x<24&&w.bombs.every(b=>b.x<16&&b.y===c.y&&Math.abs(c.x-b.x)>2))));return{blocked:ok}},
 weave:()=>{mb.arena();const m=mb.boss(21,15,0);OccupancyService.move(state.player,14,15);const plan=planWallWeave(m,state.player);const out={planned:!!plan,n:plan?.cells.length||0};
  setBossIntent(m,'wallweave',plan.cells,'t',{tiles:plan.tiles});state.turn+=1;executeBossIntent(m);
  out.walls=plan.cells.filter(c=>state.map[c.y][c.x]!==TT.FLOOR).length;out.temp=(state.tempTerrain74||[]).filter(t=>t.kind==='bossWeave').length;
  out.reachable=!masterWallBlocked(m,state.player,[]);out.ttl=(state.tempTerrain74||[]).find(t=>t.kind==='bossWeave')?.ttl;return out},
 rules:()=>BOSS_ARENA_RULES.master.cores.map(c=>[c.interval,c.batch,c.cap])};`;
const runtime = assembleGame(path.join(repo, 'src')).text.replace(QA_MARKER, fs.readFileSync(path.join(repo, 'src/qa/qa.js'), 'utf8') + '\n' + bridge);
const browser = await launch();
try {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.route('**/scripts/10-runtime.js', r => r.fulfill({ contentType: 'text/javascript', body: runtime }));
  const s = await openSession(browser, path.join(repo, 'dist-qa'), { context: ctx, seed: 9 });
  const errors = []; s.page.on('pageerror', e => errors.push(e.message));
  await startRun(s, 'swordsman'); await dismissModals(s); await s.tick(300);
  const out = await s.page.evaluate(() => { const o = { rules: mb.rules() }; for (const [n, f] of [['f0', () => mb.flash(0)], ['f1', () => mb.flash(1)], ['f2', () => mb.flash(2)], ['core', () => mb.core()], ['wall', () => mb.wall()], ['weave', () => mb.weave()]]) { try { o[n] = f(); } catch (e) { o[n] = { error: String(e && e.stack || e).slice(0, 500) }; } } return o; });
  console.log(JSON.stringify(out));
  assert.deepEqual(out.rules, [[4, 2, 4], [5, 1, 3]], '소환 증원이 약해지지 않았다');
  const expect = [['f0', 'grass', 5, { poison: 1 }], ['f1', 'earth', 5, { weaken: 1, skillSeal: 1 }], ['f2', 'ice', 4, { bleed: 1, skillSeal: 1, blind: 1 }]];
  for (const [key, element, per, statuses] of expect) {
    const f = out[key]; assert.ok(!f.error && !f.noPlan, `${key} ${JSON.stringify(f)}`);
    assert.equal(f.element, element, `${key} 속성`);
    assert.equal(f.waves, 3, `${key} 줄 수`);
    assert.ok(f.perWave.every(n => n === per), `${key} 줄당 폭탄 수 ${f.perWave}`);
    assert.ok(f.shape, `${key} 폭발 방향이 단계 규칙을 벗어났다`);
    assert.ok(f.stayCovered, `${key} 가만히 서 있어도 안 맞는다`);
    assert.ok(f.left > 0 && f.left <= 110, `${key} 피할 길이 없거나 너무 느슨하다 ${f.left}`);
    assert.equal(f.execs, 5, `${key} 설치 2번 + 폭발 3번이어야 한다 ${f.execs}`);
    assert.ok(f.cleared, `${key} 끝난 뒤에도 예고가 남았다`);
    assert.deepEqual(f.log.map(l => l[2]), [true, true, true, true, false], `${key} 진행 ${JSON.stringify(f.log)}`);
    assert.ok(f.log[0][1] === 0 && f.log[1][1] === 0, `${key} 설치 중에 피해가 들어갔다`);
    assert.ok(f.log.slice(2).some(l => l[1] > 0), `${key} 폭발이 피해를 주지 못했다`);
    for (const st of Object.keys(statuses)) assert.ok(f.status[st] > 0, `${key} 상태 ${st} ${JSON.stringify(f.status)}`);
  }
  assert.ok(out.f2.lost > out.f0.lost, `피해가 단계마다 커져야 한다 ${out.f0.lost}/${out.f1.lost}/${out.f2.lost}`);
  assert.ok(out.core.used !== 'flashblast', '사념체 중에 섬광탄을 썼다');
  assert.ok(out.wall.blocked !== false, '벽 너머로 빛이 샜다');
  const w = out.weave; assert.ok(!w.error, JSON.stringify(w));
  assert.ok(w.planned && w.n > 0 && w.walls > 0 && w.temp > 0, '벽·지형이 세워지지 않았다');
  assert.ok(w.reachable, '구조 재편이 길을 완전히 막았다');
  assert.equal(errors.length, 0, errors.join('|'));
  console.log('master-skills: ok');
} finally { await browser.close(); }
