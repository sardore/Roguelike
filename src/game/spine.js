bindCanvasAndKeyListeners();

























































































































































































































































// Movement, sight and combat all permit corner diagonals. The shared symmetric LOS
// still blocks walls crossed between cells, including knight-move offsets.
















































































































































try{HAPTIC57.enabled=localStorage.getItem('manruHaptics57')!=='0'}catch(error){ignoreError('haptics preference unreadable',error)}





































































































































































































































function rest(){const act=playerAction57('rest',{stunMessage:'몸이 굳어 쉬지 못했다.'});if(!act.ok)return !!act.consumed;cancelAutoWalk();commitPlayerAction57(act,1);return true}
















































ClientEnvironment.initialize();
bindFullscreenAndResizeListeners();


































































// Canonical runtime entrypoints populated once by their owning implementation blocks.
/* updateAll is declared by the render coordinator below. */
let runtimeLoopStarted57=0;

function runtimeReady57(){return typeof updateMobileHud==='function'&&typeof visualLoop==='function'}
function startRuntimeLoop57(){if(runtimeLoopStarted57)return true;if(!runtimeReady57())throw new ReferenceError('canonical runtime entrypoints are not initialized');runtimeLoopStarted57=1;requestAnimationFrame(visualLoop);return true}
Object.defineProperty(globalThis,'__MANRU_RUNTIME_START57__',{value:Object.freeze({ready:runtimeReady57,start:startRuntimeLoop57,started:()=>runtimeLoopStarted57===1}),writable:false,configurable:false});
bindKeydownRouter();


/* ===== MANRU v0.8 WORLD ART OVERRIDES ===== */


// Richer floor material: deterministic wear, seams and region-specific micro props.

// Wall faces now read as connected architectural masses rather than isolated boxes.



// Stronger but localized emissive lighting.



// R7 refactor: removed obsolete v7 item wrapper; later canonical renderer supersedes it.



bindMobileTopButtons();
renderMobileDrawer();
clearPathPreview();
bindCanvasHover();
createMobileAutoButton();


// r53: mobile help text is canonical in renderMobileDrawer.




const VF_IMG={creature:new Image(),tile:new Image(),decor:new Image(),item:new Image()};
startVisualAssetLoads();








// Camera allows atmospheric overscan at world edges instead of pinning the player to a corner.
/* r53: removed overwritten camera implementation. */


// Atlas-backed regional materials.










// Connected wall front faces plus wall-mounted décor.

// Unique atlas-backed creatures and equipment silhouettes.






// R7 refactor: removed obsolete vf item wrapper; later canonical renderer supersedes it.

// Regional light islands include mounted and floor decorations.



// Rich darkness/backdrop by region without leaking map information.

// Final render pipeline: materials -> ground decor -> walls -> y-sorted actors -> lighting -> atmosphere.


// Inventory uses actual pixel icons instead of character glyph placeholders.
  // r34: superseded inventory renderer removed; canonical renderer is registered below.

// Class portraits use the same in-game sprites.
document.querySelectorAll('#classGrid .classBtn').forEach((b,i)=>{const cid=CLASSES[i]?.id||'wanderer',m=VF_ASSETS.creature_meta[`player:${cid}:down`];if(!m)return;const p=document.createElement('span');p.className='vfClassPortrait';const ix=m.base%VF_ASSETS.creature_cols,iy=Math.floor(m.base/VF_ASSETS.creature_cols);p.style.backgroundPosition=`${-ix*32}px ${-iy*32}px`;b.appendChild(p)});

// Lifecycle: every generated floor receives the stable décor layer; old saves rebuild safely.
// generation décor is emitted by the canonical base/stages; no lifecycle wrapper.
// The later v3 robust loader owns legacy-load decor rebuild directly; this superseded wrapper is retired.
if(state){vfBuildDecor();updateAll()}
createAutoStateBadge();


if(location.hash.includes('debug')){window.__MANRU_DEBUG__={
  get:()=>state,elementDamage61:(entity,elem,amount)=>resolveElementDamage57(entity,elem,amount,{ground:false}),tutorial60:()=>tutorialEntryAudit(),presentation58:()=>({busy:actionPresentationBusy58(),kind:ACTION_PRESENTATION58.kind,frame:(()=>{const f=actionFrame();return f?{source:f.source,target:f.target,t:f.t,hit:f.a.hit,weapon:f.a.weapon}:null})(),remaining:Math.max(0,ACTION_PRESENTATION58.until-performance.now())}),
  floor:(n)=>{if(!state)return false;state.floor=clamp(+n||1,1,25);NormalFloorGenerator.generate();resetVisualState();resetTurnState();startFloorTransition();updateAll();return true},
  inventory:()=>{if(!state)return false;state.player.inventory=[];for(const w of WEAPONS.slice(0,8)){const it=clone(w);it.type='weapon';addInventoryItem(it)}for(const a of ARMORS.slice(1,4)){const it=clone(a);it.type='armor';addInventoryItem(it)}for(const c of CLOAKS.slice(0,4)){const it=clone(c);it.type='cloak';addInventoryItem(it)}for(const f of CONSUMABLES.slice(0,4))addInventoryItem(clone(f));openInventory();return true},
  close:()=>{closeInventory();closeMartial();closeHelp();return true},
  settle:()=>{FX.transition=null;bossIntroTimer&&clearTimeout(bossIntroTimer);document.getElementById('bossIntro')?.classList.remove('show');drawMap();return true}
}}



  window.__manruZoomActive=false;
  window.__manruZoomSuppressUntil=0;
createZoomHud();
















  /* ----------------------- 48x48 terrain sprites ----------------------- */
  












  /* ----------------------- apply 48x48 renderers ----------------------- */
  /* r26: obsolete v3 world-item public renderer assignment removed; R7 is canonical. */
  

  /* ----------------------- per-item inventory artwork ----------------------- */
  /* r26: obsolete v3 inventory-icon public renderer assignment removed; R7 is canonical. */
  document.querySelectorAll('#classGrid .classBtn').forEach((b,i)=>{
    const cls=CLASSES[i];if(!cls)return;const fake={shape:'player'},old=b.querySelector('.vfClassPortrait');if(old)old.remove();const img=document.createElement('img');img.className='vfClassPortrait';const backup=state;try{if(!state)state={player:{classId:cls.id,weapon:null,armor:ARMORS[0],cloak:null}};else{state.player.classId=cls.id}img.src=hiCreature(fake,0,'down',true).toDataURL('image/png')}catch(error){ignoreError('class portrait preview is optional decoration',error)}finally{state=backup}b.appendChild(img);
  });
rebindInspectClose();
initInspectOverlay();
createCombatHud();



  /* ---------- action button motif ---------- */
  const hk={attack:'SPC',pickup:'G',open:'E',skill:'Q',inv:'I',rest:'R',summon0:'V',summon1:'T'},rn={attack:'칼',pickup:'줍',open:'점멸',skill:'무',inv:'행',rest:'숨',summon0:'',summon1:''};function adorn(){document.querySelectorAll('#mobileControls .quickbar button').forEach(b=>{if(b.dataset.mf36)return;b.dataset.mf36='1';const a=b.dataset.act||'';b.insertAdjacentHTML('beforeend',`<span class="mfKey">${hk[a]||''}</span><span class="mfRune">${rn[a]??'◆'}</span>`)})}adorn();

  /* ---------- inventory ---------- */
  
  
  
  
  // r34: superseded inventory renderer removed; canonical renderer is registered below.

;;
createHitFeed();/* r25: obsolete pre-v5.4 attack forwarding wrapper removed; v5.4 is the registered combat core. */

  /* ---------- material separation ---------- */




/* ===== MANRU v3.7/3.8 SMART INTERACTION + FEATURE ROOMS + POTIONS ===== */















  for(const p of POTIONS)if(!CONSUMABLES.some(x=>x.name===p.name))CONSUMABLES.push(p);
createPotionTargetHud();
  /* r58 debuff overhaul: potion buffs are read by the canonical statusSummary; no status wrapper here. */
  



  // r30: potion dispatch is integrated in canonical useInventoryItem.
   // r34: obsolete potion-tab render wrapper removed.
  /* R7 refactor: obsolete early potion visual wrapper removed. */
  

  
  pstate();







  decorateTitle();
  decorateButtonGroups(document);






  function tuneButtons(root=document){
    root.querySelectorAll('.quickbar button').forEach(btn=>{
      if(btn.dataset.mfUi==='1') return;
      btn.dataset.mfUi='1';
      const act=btn.dataset.act||'';
      if(act==='attack') btn.title='적이 인접하면 공격';
      if(act==='pickup') btn.title='아이템 또는 상호작용';
      if(act==='open') btn.title='점멸 / 개방 기술';
      if(act==='skill') btn.title='무술 선택';
      if(act==='inv') btn.title='행낭 열기';
      if(act==='rest') btn.title='한 턴 대기';
    });
  }

  labelSections();
  tuneButtons(document);





  









  function fixEntities(){for(const it of state.items||[])if(tileBlocks(state.map[it.y]?.[it.x])){const p=PlacementService.randomFloor(0);it.x=p.x;it.y=p.y}for(const m of state.monsters||[])if(m.hp>0&&!PlacementService.monsterCanStand(m,m.x,m.y)){const p=PlacementService.randomMonsterCell(m)||PlacementService.randomFloor(0);m.x=p.x;m.y=p.y}}


















  // test helper exists only with #debug and lets us inspect special-room art without changing normal play.
  if(location.hash.includes('debug')&&window.__MANRU_DEBUG__){
    window.__MANRU_DEBUG__.teleportFeature=(i=0)=>{const f=state?.featureRooms?.[i];if(!f)return null;state.player.x=f.x+Math.floor(f.w/2);state.player.y=f.y+Math.floor(f.h/2);resetVisualState();VisibilityService.compute();updateAll();return f.name};
  }




  







RuntimeState.ui.inventory=UX;







  











  replaceViewerQuickButton('inv',()=>toggleInventory());
  replaceViewerQuickButton('skill',()=>useClassSkill());
bindModalSwipeClose();

  // performance: stop rebuilding closed drawer, throttle minimap, and avoid rendering the hidden world behind full-screen panels.
  // r53: drawer visibility guard is canonical in renderMobileDrawer.
  // r54: superseded minimap throttle removed; the canonical function owns throttling.
  





  RuntimeState.turn=TURN_AUDIT5;

  document.body.classList.toggle('ux-modal-open',uiBlocking());




  P47.renderDpr=baseDpr();

  
  

  
  
  // r54: superseded minimap throttle removed.
  // r54: dead pre-v49 panel trim wrapper removed.
  /* removed overwritten updateAll */
  /* removed overwritten visualLoop */




  




  // r30: upgrade-mark dispatch is integrated in canonical useInventoryItem.






  

  // r54: dead pre-v49 floor trait wrapper removed.








  /* ---------- v4.8 test hooks ---------- */
  
  
  

  syncCanvasWrapViewport();


/* ===== MANRU v4.9: performance core + automatic camera + title/hero-select overhaul ===== */
const mapOpen49=()=>!!interactionActive8('mobileMapModal');

  
  

  /* complete legacy interaction handlers that were referenced but never defined */
  if(typeof window.spawnMonster!=='function')window.spawnMonster=function(pos=null,elite=false,opts={}){
    if(!state)return null;const defs=(typeof floorEnemyDefinitions==='function'?floorEnemyDefinitions():MONSTERS.filter(d=>state.floor>=d.min&&state.floor<=d.max&&!d.miniBoss));if(!defs.length)return null;
    const mon=scaledMonster(choice(defs));if(elite){mon.hp=mon.maxHp=Math.round(mon.maxHp*1.35);mon.atk+=2;mon.def+=1;mon.name='강화 '+mon.name}
    const p=PlacementService.findMonster(mon,{placementMode:pos?'local':'floor',origin:pos||state.player,reachable:!!pos,...opts});if(!p)return null;mon.x=p.x;mon.y=p.y;mon.spawnProvenance57=opts.provenance||'random';OccupancyService.addMonster(mon);return mon;
  };
  if(typeof window.rumorEvent!=='function')window.rumorEvent=function(){
    if(!state)return;const p=state.player,revealed=globalThis.__MANRU_RUMOR_SPACES1030__?.revealNext?.()||null;
    if(!revealed){const r=globalThis.__MANRU_RANDOM57__();if(r<.38){p.focus=Math.min(getStats().maxFocus,p.focus+3);addLog('벽지 뒤 기록에서 객주의 동선을 읽었다. FOCUS +3.');}else if(r<.72){dropRandomItem({x:p.x,y:p.y},false);addLog('소문 속 은닉처를 찾아냈다.');}else{window.spawnMonster(null,false);addLog('소문을 읽는 동안 뒤에서 발소리가 멎었다.');}burst(p.x,p.y,'#c7a46d',10,.65)}
    globalThis.MANRU_FOOD57?.rumorHint?.();return revealed;
  };
  if(typeof window.mirrorEvent!=='function')window.mirrorEvent=function(x,y){
    if(!state)return;setTerrainTile58(state.map,x,y,TT.FLOOR);const r=globalThis.__MANRU_RANDOM57__();
    if(r<.45){state.status.evade=Math.max(state.status.evade,5);state.player.focus=Math.min(getStats().maxFocus,state.player.focus+2);addLog('거울 속 동작을 앞질렀다. 회피 상승.');}
    else if(r<.78){const q=randomPlayerTransferDestination57('mirror-teleport');if(q){resolvePlayerLanding57(q.x,q.y,{cause:'mirror-teleport',resetVisual:true});addLog('거울이 같은 진행 구역 안에서 위치를 뒤집었다.')}else addLog('거울이 갈 곳을 찾지 못해 위치는 그대로였다.');}
    else{window.spawnMonster(null,true);addLog('거울 속 형상이 현실로 빠져나왔다.');}
    burst(x,y,'#c58fbd',12,.75);
  };
startTitleCanvas();
bindTitleButtons();

  /* ---------- camera: default auto-follow, temporary look-pan, explicit free mode ---------- */





  
  
  
  MINIMAP_PIPELINE.before=force=>{const now=performance.now();if(!state)return false;if(!force&&!RENDER_PERF_STATE.miniDirty&&!mapOpen49()&&now-RENDER_PERF_STATE.lastMini<320)return false;RENDER_PERF_STATE.lastMini=now;RENDER_PERF_STATE.miniDirty=false;return true};




  /* removed overwritten updateAll */
  /* removed overwritten visualLoop */

  
  syncGameViewport();



/* ===== v5.1b lightweight mobile wall-face pass ===== */



/* ===== MANRU v5.2 BOW TARGETING + WORLD LONG-PRESS INSPECT ===== */
if(typeof window.modalBlocking49!=='function')window.modalBlocking49=()=>!gameplayInputAllowed57();
bindTextSelectionGuards();

  // 마지막 행낭 정보 버튼도 같은 formatter 사용.



  try{const s=localStorage.getItem('manruSfx54');if(s==='0')V54.sfx=false}catch(error){console.warn('[manru] sound setting not read',error)}
createHoldHint();
  const rule=document.createElement('div');
createBossRuleBanner();





  document.addEventListener('pointerdown',()=>ac54(),{once:true,capture:true,passive:true});


  /* r15: boss knockback cap is handled by canonical knockMonster. */

  /* ---------- boss telegraph / phase system ---------- */
  
  
  
  
  
  
  
  
  
  
  
  
  
  

  


  /* ---------- death residue, directional damage feedback, boss mark renderer ---------- */
  
  

  /* ---------- terrain footsteps ---------- */

  /* ---------- feature room visual signatures ---------- */
  

  /* ---------- save/load/init compatibility ---------- */

  // InputRouter owns the physical shortcut; this API remains the existing sound-setting owner.
















  for(const t of TALISMANS)if(!CONSUMABLES.some(i=>i.name===t.name))CONSUMABLES.push(t);










  





  















  if(window.__MANRU_CLEAN_INSPECT53)window.__MANRU_CLEAN_INSPECT53.item=inspectHTML56;
createTalismanTargetHud();






















  function safeBlink56(x,y){return validatePlayerTransfer57(x,y,{cause:'talisman-blink'}).ok}
  function castTalisman56(tx,ty){const action=playerAction57('modal-action',{uiOwner:'talismanTarget56'});if(!action.ok)return false;
    const a=V56.target;if(!a||!state)return false;const p=state.player,ox=p.x,oy=p.y;if(tx<0||ty<0||tx>=COLS||ty>=ROWS||entityDistance57({x:tx,y:ty},p)>a.range){toast(a.wasUnknown?'부적의 기운이 그곳까지 닿지 않는다.':`사거리 ${a.range}칸 밖이다.`);return false}if(!state.seen.has(k(tx,ty))){toast('아직 확인하지 못한 칸이다.');return false}
    if(a.kind==='blink'){if(!safeBlink56(tx,ty)){toast('현재 열린 진행 구역 안의 안전한 칸만 접을 수 있다.');return false}const landing=resolvePlayerLanding57(tx,ty,{cause:'talisman-blink',resetVisual:true});if(!landing.ok){toast('축지할 수 없는 칸이다.');return false}identifyTalisman56(a.kind,'사용 효과 관찰');projectileFX(ox,oy,tx,ty,'#d9be7b');burst(p.x,p.y,'#e2cb87',18,.72);addLog('축지부: 본 공간을 접어 이동했다.')}else{
      if(typeof lineClear==='function'&&!lineClear(p.x,p.y,tx,ty)){toast('부적의 기운이 벽에 막힌다.');return false}
      identifyTalisman56(a.kind,'사용 효과 관찰');
      const targets=[...state.monsters].filter(m=>isHostileTarget57(m)&&!m.hidden&&entityDistance57(m,{x:tx,y:ty})<=1);if(targets.length)markCombatActivity57(`talisman-${a.kind}`);
      if(a.kind==='blast'){const dmg=28+Math.floor((state.floor-1)/5)*6;for(const m of targets){const d=damageEntity(m,m.boss?Math.max(6,Math.floor(dmg*.80)):dmg);m.hitUntil=performance.now()+160;if(d>0)floatText(m.x,m.y,'-'+d,'#f0c37c',14);impact(m.x,m.y,'#e1b26d',5);if(m.hp<=0)killMonster(m);else{const dx=Math.sign(m.x-tx)||Math.sign(m.x-p.x),dy=Math.sign(m.y-ty)||Math.sign(m.y-p.y);if(dx||dy)resolveForcedMovement57(m,{x:m.x-dx,y:m.y-dy},1,{mode:'push',hostile:true,creditPlayer:true})}}addLog(`폭발부적: ${targets.length}체 파쇄.`);burst(tx,ty,'#e3ad5d',26,1.1)}
      else if(a.kind==='bind'){for(const m of targets){if(m.boss){m.controlCd54=Math.max(0,m.controlCd54||0);if(m.controlCd54<=0){m.stunned=Math.max(m.stunned||0,1);m.controlCd54=4;m.controlCdTurn54=state.turn}}else m.stunned=Math.max(m.stunned||0,4);floatText(m.x,m.y,m.boss?'봉박 1':'봉박 4','#d8c58a',10)}addLog(`봉박부: ${targets.length}체 봉인 · 일반 적 4턴.`);burst(tx,ty,'#c9b77a',20,.65)}
    }
    consumeRef(a.item);cancelTalismanTarget(true);globalThis.__MANRU_TURN_ENGINE__.advance({handled:true,committed:true,timeCost:1,reason:"castTalisman56"}).value;return true
  }
  targetHud.querySelector('#talismanCancel56').onclick=e=>{e.preventDefault();e.stopPropagation();InputRouter.dispatch({type:'TARGET_CANCEL',source:'target-hud'})};
  

  // r30: v5.6 talisman/potion dispatch is integrated in canonical useInventoryItem.

  


  
  globalThis.__MANRU_CONSUMABLE56_ACTIONS__=Object.freeze({initializeKnowledge:ensureKnowledge56,knownPotion:isPotionKnownByPlayer,knownTalisman:knownTalisman56,publicName:publicName56,target:()=>!!V56.target,castTarget:(x,y)=>castTalisman56(x,y),cancelTarget:()=>{cancelTalismanTarget(true);return true},useTalisman:item=>{if(!item||item.type!=='talisman')return false;if(item.targeted){beginTalismanTarget(item);return true}return !!useInstantTalisman56(item)}});


  if(state){ensureKnowledge56();decorateAllItems56()}


RuntimeState.ui.food=V57;











// PDF 포만감 규칙: 허기 0에서만 공격력 20% 감소. 기존 단계별 ATK/EVA 패널티는 제거.

/* r58 debuff overhaul: food buffs are read by the canonical statusSummary; no status wrapper here. */







// 몬스터 초안 행동 보강
// Movement behavior is canonical in moveMonsterToward.


/* v9.8.6 inspect cleanup: removed legacy concept57 prose-append wrapper. */

// 새 명칭이 기존 고해상도 아틀라스를 재사용하도록 시각 별칭을 지정한다.
if(typeof VF_ASSETS==='object'&&VF_ASSETS.creature_meta){const a=VF_ASSETS.creature_meta,m={'취객':'윈도','시종':'윈도','객잔 경비병':'수비병','떠돌이 도둑':'윈도','정원사 망령':'강시','독꽃':'가시 덩굴','검은 뱀':'그림자 살모사','먹물 정령':'먹물 개구리','수목 궁수':'수비병','정원 바위괴물':'돌 거북','식인 물고기':'피라냐','수은 물고기':'피라냐'};for(const [n,o] of Object.entries(m))if(!a[n]&&a[o])a[n]=a[o]}
createFoodTargetPanel();
createCookingPanel();

// 조리 중 월드 입력 차단 및 솥/화로 상호작용

/* r8: basicAttack reads ux-modal-open directly. */


// 획득 구조: 주방, 샘, 피라냐, 복숭아나무 + 설계 공백을 메운 빙결액 배치
window.MANRU_FOOD57.rumorHint=()=>{ensureFoodState();const unknown=FOOD_RECIPES.filter(v=>!state.cookbook57[v.id]);if(unknown.length&&globalThis.__MANRU_RANDOM57__()<.40){const rec=choice(unknown);state.cookbook57[rec.id]=true;addLog(`찢어진 조리서 · ${rec.name}: ${rec.ingredients.join(' + ')}.`);return rec.id}return null};








// 인벤토리 분류와 버튼 문구




if(state)ensureFoodState();
createPadToggle();










  





  globalThis.__MANRU_DRAW_HOOKS_R19__={world:[],post:[]};
  if(globalThis.__MANRU_BOSS54__?.draw)globalThis.__MANRU_DRAW_HOOKS_R19__.post.push({id:'boss-intent54',draw:globalThis.__MANRU_BOSS54__.draw});

  // r20: viewport sizing is canonical in syncGameViewport; no late wrapper here.

  /* removed overwritten updateAll */
  /* removed overwritten visualLoop */

  // ensure closed drawer doesn't rebuild every HUD update
  // r53: retired duplicate mobile drawer guard.

  
  syncGameViewport();

/* ===== MANRU v5.9: VAULT / DOOR / MULTI-LAYOUT OVERHAUL ===== */
const V59={lastMode:null, doorLog:[], modeLog:[]};






  /* ---------- doors become real information gates ---------- */
  // Closed-door sight blocking is owned by the canonical SIGHT_BLOCKING_TILES57 set.
  // Door opening is canonical in moveMonsterToward.





  function inferCorridors59(){
    state.corridorCells59={};if(state.specialFloor)return;
    for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++){
      const t=state.map[y][x];if(![TT.FLOOR,TT.OPEN_DOOR,TT.DOOR,TT.FLOOR].includes(t))continue;
      const inRoom=(state.rooms||[]).some(r=>x>r.x&&x<r.x+r.w-1&&y>r.y&&y<r.y+r.h-1);
      if(!inRoom)state.corridorCells59[k(x,y)]=1;
    }
  }
  function doorAudit59(){
    let doors=0,open=0;
    for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++){if(state.map[y][x]===TT.DOOR)doors++;else if(state.map[y][x]===TT.OPEN_DOOR)open++}
    state.doorCount59=doors;V59.doorLog.push({floor:state.floor,mode:state.layoutMode59,doors});
    if(V59.doorLog.length>30)V59.doorLog.shift();
  }




  /* ---------- wall-embedded door art: front vs sideways like SPD raised/sideways doors ---------- */

  /* ---------- cheap extra wall depth / corner readability ---------- */









  /* ---------- hidden route terrain ---------- */



  function revealHidden60(x,y){
    const id=state.hiddenLookup60?.[k(x,y)],g=state.hiddenGroups60?.[id];if(!g)return false;
    for(const kk of g.keys){const [xx,yy]=kk.split(',').map(Number),r=state.hiddenReplacement60[kk]??g.replacement;setTerrainTile58(state.map,xx,yy,r);delete state.hiddenLookup60[kk]}
    addLog(`${g.label}이 모습을 드러냈다.`);toast(g.label);burst(x,y,'#8ee7e3',18,.75);VisibilityService.compute();vfBuildDecor();return true;
  }
  globalThis.__MANRU_HIDDEN60_ACTIONS__=Object.freeze({revealAt:revealHidden60});
















































  
  


















  /* ---------- exact-floor visual language ---------- */







  


















































  // r53: removed generation-on-load stage special60; saved geometry is authoritative.



  /* ---------- test/screenshot hooks ---------- */

/* r53: removed the overwritten v6.0 overview camera. */
/* ===== MANRU v6.1: ENEMY DENSITY / TACTICAL ROLES / SMART STRUCTURE INPUT ===== */
const spawnRanges61=[[1,1,9,9],[2,5,8,11],[6,10,10,13],[11,15,11,14],[16,20,13,16],[21,24,14,18]];
  for(const r of SPAWN_RULES){const q=spawnRanges61.find(v=>r.from===v[0]&&r.to===v[1]);if(q)r.count=[q[2],q[3]]}
  Object.assign(SPECIAL_BASE_COUNTS,{2:10,4:11,6:12,8:12,11:13,13:14,16:13,18:14,20:9,21:13,22:15,23:14,24:12});






















  



  // Shell / formation defense is owned by combatDefenseBonus57 in both native attack bases.


  /* ---------- structure interaction: click/tap paths next to a blocked target, then opens or destroys it ---------- */
  const BREAK61=new Set([TT.TABLE,TT.SCREEN,TT.HEDGE,TT.BAMBOO,TT.FAKE_DOOR,TT.SECRET_DOOR,TT.LOCKED_GATE,TT.PEACH_TREE,TT.HIDDEN_BRIDGE,TT.HIDDEN_WALL]);




  globalThis.__MANRU_DRAW_HOOKS_R19__?.world.push({id:'role61',draw:drawRoleOverlay});
  /* v9.8.6 inspect cleanup: removed legacy tactical-role prose-append wrapper. */






  

/* removed overwritten visualLoop */




  createFeelingElement();
createTacticalBelt();

































  globalThis.__MANRU_DRAW_HOOKS_R19__?.post.push({id:'feeling62',draw:drawFeelingOverlay});







  RC.storagePersistent=(()=>{const k='__manru_probe70';try{localStorage.setItem(k,'1');localStorage.removeItem(k);return true}catch(_){return false}})();
  try{RC.uiVolume=Math.max(0,Math.min(1,+(lsGet('manruUiVolume70')??.35)))}catch(error){ignoreError('ui volume unreadable',error)}


  applyTextScale(lsGet('manruUiTextScale70')??1);

  /* ---------- final release UI ---------- */

  createReleasePanel();
  createCoachDialog();
createReleaseControls();
decorateGhostPadButtons();



  /* ---------- input camera = immutable last rendered CameraProjection12 snapshot ---------- */


  /* ---------- retained structure hit testing (Runtime81 automation owns selection) ---------- */









  


  // r30: runtime item coaching/activity bookkeeping is integrated in canonical useInventoryItem.





  /* ---------- resource pacing / consumable strategy ---------- */









  /* ---------- autosave hooks (idle, not every turn) ---------- */

  /* ---------- boss visual signature: one cheap pass only ---------- */
  




  function audit70(){
    if(!state)return{ok:false,error:'게임 미시작'};
    const invalidMon=(state.monsters||[]).filter(m=>m.x<0||m.y<0||m.x>=COLS||m.y>=ROWS||!PlacementService.monsterCanStand(m,m.x,m.y));
    const invalidItems=(state.items||[]).filter(i=>i.x<0||i.y<0||i.x>=COLS||i.y>=ROWS);
    const doors=state.map.flat().filter(t=>t===TT.DOOR).length;
    const result={ok:!invalidMon.length&&!invalidItems.length,floor:state.floor,turn:state.turn,size:[COLS,ROWS],layout:state.layoutName,monsters:state.monsters.length,items:state.items.length,doors,reachable:state.specialFloor?'기믹층':reachable70(),invalidMonsters:invalidMon.length,invalidItems:invalidItems.length,renderEma:+RC.perf.ema.toFixed(2),repairedMonsters:state.repairedMonsters70||0};
    return result;
  }
  function bench70(n=20){const t=performance.now();for(let i=0;i<n;i++)drawMap(true);return+(performance.now()-t).toFixed(2)}
bindReleaseDiagnosticButtons();
bindReleaseSettingsControls();
  bindSaveStringPanel();


    
  refreshSlots();refreshSfx();refreshStorageStatus();

  window.__MANRU_RELEASE__={
    openPanel:openReleasePanel,closePanel:closeReleasePanel,markAction:()=>{RC.lastActionAt=performance.now();return RC.lastActionAt},tip:tip70,floorTutorial:showFloorTips,closeTip:closeCurrentTip,suspendTip:suspendTips,entryTutorial:advanceEntryTutorial,closePanel:closeReleasePanel
  };
bindResumeListeners();


  





























  







/* ===== MANRU v7.3: WALL APPROACH / 8-WAY AUTOPATH / DELAYED HOLD RING ===== */




















  function public74(item){if(!item)return'';if(item.branchExclusive105||item.fusion74)return item.name;return window.__MANRU_TALISMAN_PUBLIC__?.name?.(item)||item.name}
createFusionPanel();
setupInfusionPanels();

  globalThis.__MANRU_DRAW_HOOKS_R19__?.post.push({id:'element74',draw:drawElementOverlay});

    
  globalThis.__MANRU_TALISMAN74_ACTIONS__=Object.freeze({woodEffect:woodEffect105,shopCandidates:(baseKind=null)=>FUSION_RECIPES.filter(r=>r.a!=='upgrade'&&r.b!=='upgrade'&&(!baseKind||r.a===baseKind||r.b===baseKind)).map(recipeItem),known:known74,publicName:public74,target:()=>!!V74.target,castTarget:(x,y)=>castFusion(x,y),cancelTarget:()=>{cancelTalismanTargeting(true);return true},closePanels:()=>{closeFusion();closeGear();return true},dispatch:item=>{if(!item||item.type!=='talisman')return{handled:false,result:false};ensure74();if(item.talismanKind==='reinforce105'){openGear(item);return{handled:true,result:true}}if(item.fusion74){if(item.fusionMode74==='gear'){openGear(item);return{handled:true,result:true}}if(item.fusionMode74==='target'){startTarget74(item);return{handled:true,result:true}}return{handled:true,result:!!useFusionInstant(item)}}if(ELEMENT_KIND74[item.talismanKind])return{handled:true,result:!!rawElement74(item)};if(item.talismanKind==='upgrade'){if(playerClassRules58().upgradeTalismanMode==='bodyBoost'&&!state.player.inventory.some(i=>i.summonItem105==='book'))return{handled:true,result:useBodyPower74(item)};identifyKind('upgrade','강화 효과 관찰');openGear(item);return{handled:true,result:true}}return{handled:false,result:false}},ensure:ensure74});


/* ===== MANRU v7.5: CLEAN SHATTERED-LIKE HUD / UNIFIED INPUT / FUSION QA ===== */
document.body.classList.add('mf75-clean');


  // First launch on touch screens follows Shattered-style tap movement: D-pad stays available behind a tiny toggle.
  try{
    if(matchMedia('(max-width:1080px)').matches && localStorage.getItem('manruPad58')===null){
      document.body.classList.add('pad58-hidden');
      localStorage.setItem('manruPad58','0');
    }
  }catch(error){ignoreError('pad default could not be saved',error)}


  try{updateMobileHud()}catch(error){ignoreError('mobile hud refresh before a run exists',error)}




  








  RuntimeState.input.device=Runtime81;

  
  



  









  const Automation81={
    valid:q=>Auto81.valid(q),
    go:q=>Auto81.go(q),
    explore:()=>Auto81.explore(false),
    pickup:()=>Auto81.pickupAll(),
    state:()=>Auto81.state(),
    presentationRate:()=>Auto81.active?AUTO_MOVE_RATE70:1
  };
bindHeldInputStop();

  cleanViewportUI();makeInput();rebindControls();ConnectedDecor81.build();CameraController.resume(false);

  
  
  
  
  
  
  

  window.__MANRU_RUNTIME81__={state:Runtime81,Automation81,Camera81:CameraController,Zoom81:ZoomController,ConnectedDecor81,Integrity81,inspect:inspectTile81,stopHeld:stopHeldInput};



  const V85={version:'v9.6.5-martial-stealth-fx',recent:[],samples:[]};






  // Perfume River walls are stone mountain / gorge walls, not purple room walls.



  
  
  
  
  
  
  
  
  
  
  

  
  
  
  

  
  
  
  
  
  

  
  
  
  
  
  
  
  
  /* ===== v8.7: NetHack-5.0-inspired themed geometry modules =====
     Geometry and regional furnishing are deliberately separated: room shape first,
     then a region-specific fill. No U-shaped fake rooms; each module is a real
     room/corridor topology with controlled local alternatives. */
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  












  
  // r53: removed generation-on-load stage architecture85; saved geometry is authoritative.


  
  


  /* ===== MANRU v8.8: v8.0 STRUCTURE REBASE + DISCIPLINED THEME DECOR ===== */
  











  
  

  
  
  
  
  
  
  
  



  







  // No random sprite confetti on normal floors. Theme identity is expressed by deliberate map tiles above.

;

  // Decorative blockers behave like walls: no unsolicited "X 바로 앞이다" messages.
  // r57: silent physical decor blocking is integrated into canonical bumpBlockedTile.


  // Remove any dedicated identify-talisman toolbar artifact. Generic targeted-talisman cancel UI remains for mobile usability.
  const killIdentifyBar88=()=>{for(const q of ['#identifyToolbar','#identifyToolbar56','.identifyToolbar','.identifyTalismanToolbar','[data-identify-toolbar]'])document.querySelectorAll(q).forEach(e=>e.remove());const h=document.getElementById('talismanTarget56'),title=document.getElementById('talismanTargetTitle');if(h&&title&&/감정부적/.test(title.textContent||''))h.classList.remove('show')};
  killIdentifyBar88();new MutationObserver(killIdentifyBar88).observe(document.body,{subtree:true,childList:true,characterData:true});

  // r53: removed generation-on-load stage windows88; saved geometry is authoritative.

  
  


  /* ===== MANRU v8.9: CLEAN ARCHITECTURE + SPARSE FOCAL DECOR ===== */
  

  

  



  

  // A clean horizontal gallery with rooms attached to it. Side rooms never create map-wide bypasses.
  

  // Three courts in sequence. Only the center court is intentionally spacious.
  

  // Sequential zig-zag blocks. One path, short local choices only.
  

  // Twin galleries permit a local alternate path but both tracks rejoin often, preventing a giant exterior bypass.
  

  // A compact 2x3 cloister: clean geometry, only one controlled loop around a center block.
  

  
  

  

  // Theme identity now comes primarily from structure and a handful of focal props, not room-by-room prop spam.
  



  // Windows remain themes 1 and 3 only, and are substantially rarer.


  

  
  ;

  
  
  


  /* ===== MANRU v9.0: DENSE PURPOSEFUL ROOMS / NO WASTED WINGS ===== */
  

  
  
  
  
  

  
  
  
  
  
  









  

;

  
  
  

  /* ===== MANRU v9.1: V7-STYLE ORGANIC ROOMS / DENSE F2 / READABLE FLOOR / FAST PAN ===== */
  

  


  



  // Camera panning: coalesce pointermove events to one camera mutation per animation frame.
  
  
  // Expensive atmosphere/light passes are skipped only while the user is actively dragging the camera; full quality returns immediately on release.
  
  
  
  
  

  ;
  

  /* ===== MANRU v9.3: ASYMMETRIC CLUSTERS / VARIABLE-WIDTH HALLS / SHORT PURPOSEFUL BRANCHES ===== */


























  














  

  /* ===== MANRU v9.4: KEY TRIALS / PURPOSEFUL LOOT / NATURAL RECOVERY / VISUAL STABILITY ===== */
  





  // Restore visually stable rendering during camera pan. RAF-coalesced camera movement stays, but map textures no longer switch quality modes.
  
  

  // Natural recovery replaces explicit Rest. Hunger controls the very slow recovery interval; combat/status suppresses it.
  function naturalInterval94(){const h=state?.player?.hunger??0;return h>=90?16:h>=65?22:h>=40?30:h>=20?42:Infinity}


  // Center-pad wait behavior is implemented directly by the canonical rest() declaration.

  /* r25: context94 forwarding wrapper removed; base contextAction owns stairs/item semantics. */

  /* v9.8.6 inspect cleanup: removed no-op showInspect forwarding wrapper. */
  // Keep one ordinary wait action in the movement pad; remove the duplicate quick-button.

  // v10.0.4-r45: obsolete v9.4 keyTrial wrapper removed. All LOCKED_GATE interaction is owned by the canonical base handler + typed-key service.

  // More expressive 32px sprite finishing pass over the atlas sprites.
  


  titlePolish();

  // Higher quality death/victory cards.


  

  // Progression is owned by the canonical checkLevel() above; no late reassignment.




  // Final 32px sprite pass: class weapons, silhouettes and enemy-family details remain visible at game scale.
  
  


  /* ===== MANRU v9.6: REAL LOCKED DOORS / STRUCTURAL SPECIAL FLOORS / PAN SNAPSHOT PERFORMANCE ===== */








  

  // Disable the old probabilistic stair-box trial. v9.6 installs deterministic door locks after generation.


  
  
  
  

  
  
  















  // Canonical typed-key interaction owner. Map generation, pickup, door opening, save/load and UI all read the same keyPlan96 ledger.
  let typedKeyMeta96=keyMeta96;
  const TYPED_KEYS96=globalThis.__MANRU_TYPED_KEYS__={
    setMetaProvider(fn){if(typeof fn==='function')typedKeyMeta96=fn;return true},
    meta(id){return typedKeyMeta96(id)},
    keyAt(x,y){return keyPos96(+x,+y)},
    doorAt(x,y){return doorPos96(+x,+y)},
    hydrate(){
      const plan=state?.keyPlan96;if(!plan)return null;plan.doors=Array.isArray(plan.doors)?plan.doors:[];plan.keys=Array.isArray(plan.keys)?plan.keys:[];plan.groups=Array.isArray(plan.groups)?plan.groups:[];plan.ring=plan.ring&&typeof plan.ring==='object'?plan.ring:{};
      const byCoord=new Map();for(const d of plan.doors){const kk=`${d.x},${d.y},${d.keyId}`,tile=state.map?.[d.y]?.[d.x];d.open=tile===TT.OPEN_DOOR?true:tile===TT.LOCKED_GATE?false:!!d.open;byCoord.set(kk,d)}
      for(const g of plan.groups){g.doors=(g.doors||[]).map(d=>{const kk=`${d.x},${d.y},${d.keyId||g.keyId}`,hit=byCoord.get(kk);if(hit)return hit;const tile=state.map?.[d.y]?.[d.x],q={...d,keyId:d.keyId||g.keyId,open:tile===TT.OPEN_DOOR?true:tile===TT.LOCKED_GATE?false:!!d.open};plan.doors.push(q);byCoord.set(kk,q);return q})}
      for(const q of plan.keys){const tile=state.map?.[q.y]?.[q.x];q.active=tile===TT.KEY_TILE?true:tile==null?!!q.active:false}for(const id of new Set(plan.groups.map(g=>g.keyId)))plan.ring[id]=Math.max(0,+plan.ring[id]||0);return plan;
    },
    restoreSurfaces(){
      const plan=state?.keyPlan96;if(!plan)return null;
      plan.doors=Array.isArray(plan.doors)?plan.doors:[];plan.keys=Array.isArray(plan.keys)?plan.keys:[];plan.groups=Array.isArray(plan.groups)?plan.groups:[];plan.ring=plan.ring&&typeof plan.ring==='object'?plan.ring:{};
      for(const q of plan.keys){if(!in85(q.x,q.y))continue;if(q.active===false){if(state.map[q.y][q.x]===TT.KEY_TILE)setTerrainTile58(state.map,q.x,q.y,q.floorTile49??TT.FLOOR)}else setTerrainTile58(state.map,q.x,q.y,TT.KEY_TILE)}
      for(const d of plan.doors){if(!in85(d.x,d.y))continue;setTerrainTile58(state.map,d.x,d.y,d.open===true?TT.OPEN_DOOR:TT.LOCKED_GATE)}
      for(const g of plan.groups)for(const d of g.doors||[]){const hit=plan.doors.find(q=>q.x===d.x&&q.y===d.y&&q.keyId===(d.keyId||g.keyId));if(hit)d.open=hit.open===true}
      return plan;
    },
    pickupAt(x,y){
      if(!state?.keyPlan96||state.map?.[y]?.[x]!==TT.KEY_TILE)return{handled:false};
      const q=keyPos96(x,y);if(!q)return{handled:false};const meta=typedKeyMeta96(q.keyId);
      state.keyPlan96.ring[q.keyId]=(state.keyPlan96.ring[q.keyId]||0)+1;q.active=false;setTerrainTile58(state.map,x,y,q.floorTile49??TT.FLOOR);
      burst(x,y,meta.color,16,.9);floatText(x,y,'열쇠 획득',meta.color,10);addLog(`${meta.name}를 주웠다.`);if(state.keyPlan96.groups.some(g=>g.keyId===q.keyId&&g.mode==='single-choice'))addLog('두 문 중 하나만 열 수 있다. 창 너머를 살펴보고 고르자.');
      return{handled:true,keyId:q.keyId,have:state.keyPlan96.ring[q.keyId]||0};
    },
    tryOpenAt(x,y){
      if(!state?.keyPlan96||state.map?.[y]?.[x]!==TT.LOCKED_GATE)return{handled:false};
      const d=doorPos96(x,y);if(!d)return{handled:false};const meta=typedKeyMeta96(d.keyId),have=state.keyPlan96.ring[d.keyId]||0;
      if(have<=0){toast(`${meta.name}가 필요하다.`);return{handled:true,opened:false,keyId:d.keyId,have:0}}
      const single=state.keyPlan96.groups.find(g=>g.keyId===d.keyId)?.mode==='single-choice';
      state.keyPlan96.ring[d.keyId]=have-1;for(const q of state.keyPlan96.doors||[])if(q.keyId===d.keyId&&(!single||(q.x===x&&q.y===y))){q.open=true;if(state.map[q.y]?.[q.x]===TT.LOCKED_GATE){setTerrainTile58(state.map,q.x,q.y,TT.OPEN_DOOR);doorFX(q.x,q.y)}}for(const g of state.keyPlan96.groups||[])if(g.keyId===d.keyId)for(const q of g.doors||[])if(!single||(q.x===x&&q.y===y))q.open=true;
      addLog(single?`${meta.name}가 부서지며 ${d.label}의 문 하나가 열렸다.`:`${meta.name}로 해당 봉쇄문을 열었다.`);globalThis.__MANRU_SPECIAL_FLOORS60__?.onTypedGateOpened?.(state.keyPlan96,d.keyId);globalThis.__MANRU_TURN_ENGINE__.advance({handled:true,committed:true,timeCost:1,reason:"diagnostic"}).value;return{handled:true,opened:true,keyId:d.keyId,have:state.keyPlan96.ring[d.keyId]||0};
    },
    summary(){const plan=state?.keyPlan96;if(!plan?.groups?.length)return{active:false,rows:[],totalHave:0,totalClosed:0};const ids=[...new Set(plan.groups.map(g=>g.keyId))],rows=ids.map(id=>{const meta=typedKeyMeta96(id),have=plan.ring?.[id]||0,doors=(plan.doors||[]).filter(d=>d.keyId===id),closed=doors.filter(d=>!d.open&&state.map?.[d.y]?.[d.x]===TT.LOCKED_GATE).length;return{id,name:meta.name,have,closed}});return{active:true,rows,totalHave:rows.reduce((n,r)=>n+r.have,0),totalClosed:rows.reduce((n,r)=>n+r.closed,0)}},
    snapshot(){return state?.keyPlan96?structuredClone(state.keyPlan96):null}
  };
startDesktopSide();



  





  // Bridge the last pre-ammo generator into the newer release closure without another wrapper.



  function closeAdjacentDoor964(quiet=false){
    const act=playerAction57('closeDoor',{stunMessage:'몸이 굳어 문을 닫지 못했다.'});if(!act.ok)return !!act.consumed;const cands=openDoorCandidates964();if(!cands.length){if(!quiet)toast('닫을 열린 문이 없다.');return false}
    const d=cands[0],why=doorCloseBlock964(d.x,d.y);if(why){if(!quiet)toast(why);return false}
    cancelAutoWalk();setTerrainTile58(state.map,d.x,d.y,TT.DOOR);doorFX(d.x,d.y);addLog('문을 닫았다.');VisibilityService.compute();commitPlayerAction57(act,1);return true;
  }



  

  /* ===== MANRU v9.6.5: MARTIAL STEALTH + PRESENTATION FX ===== */
  MARTIAL_INFO.ghost.desc='형체와 기척을 흐려 비보스 적의 추적을 끊는다. 공격하면 즉시 해제.';
  MARTIAL_INFO.strong.desc='기를 응축해 다음 유효 근접 공격을 크게 강화. 준비 중 황금 기운이 유지된다.';
  MARTIAL_INFO.roar.desc='충격파로 주변 적에게 피해와 경직. 레벨 1/2/3/4의 반경은 각각 1/2/3/4칸. 벽 너머에는 닿지 않는다.';






  /* r8: stealth break is part of the central attack commit path. */

  // Fade every layer of the player sprite while ghost is active.
  
  

  // Cheap vector FX rendered after the world: no new textures or heavy sprite rebuilds.

  globalThis.__MANRU_DRAW_HOOKS_R19__?.post.push({id:'martial965',draw:drawMartialOverlay});

  


  for(const w of WEAPONS)if(w.kind==='bow')w.ammoFamily='arrow';









  
  
  
  
  
  


  




  

  
  
























  // v9.7 generation/load wrappers were folded into the current release pipeline.
  // v9.8.3 load quality pass is registered in the canonical lifecycle below.
  
  // r30: ammunition selection is integrated in canonical useInventoryItem.
  /* R7 refactor: ammo inventory/world visuals now use the canonical exact-item renderer. */

  

  































  

























  





  


















































  // v9.8.0 generation/load orchestration is executed by the single current pipeline below.

  /* ---------- visual quality: zone-aware floors, wall caps, and connected props ---------- */



  /* ---------- full-map renderer for screenshot QA ---------- */


  /* ===== MANRU v9.8.1: FIXED MAP DENSITY / RAFT SAFETY / PORTAL LABYRINTH / REACHABILITY ===== */
  floorSet980.add(TT.PORTAL);plannedSet980.add(TT.PORTAL);










  

  /* 21F canonical movement audit: the player chooses any legal landing 1..range tiles away on one of 8 rays.
     Direction input resolves to the farthest candidate, while pointer/touch may choose any nearer candidate. */
  

  

















































  // v9.8.1 generation/load orchestration is executed by the single current pipeline below.









  /* v9.8.3 direct monster stats / core loot / clean current-generation pipeline */
















  // Remove the old parallel upgrade economy from future loot tables.
  const upMeta=upgradeProto();if(upMeta){upMeta.minFloor=1;upMeta.stackMax=15;upMeta.desc='장비 하나의 기본 성능을 한 단계 개량한다. 강화 횟수 제한은 없지만 이미 소비한 강화는 다른 장비로 되돌릴 수 없다.'}

  // Random upgrade rolls are normalized after floor generation: all incidental upgrade items are
  // converted before the chapter-scheduled upgrade is inserted. Regions 2-4 are balanced by the
  // MONSTERS table itself; no hidden post-spawn HP/ATK multiplier is applied.




  
  

  

  
  
  
  // v9.8.8: explicit inspect/search action removed; long-press detail viewer remains.




/* v9.8.4 cohesive runtime: intentionally inside the main game closure */

  try{localStorage.removeItem('manruZoomActual48')}catch(error){ignoreError('old zoom setting could not be removed',error)}




try{localStorage.removeItem('manruCameraMode984')}catch(error){console.warn('[manru] camera setting not cleared',error)};








  globalThis.__MANRU_CAMERA_STATE12__=CameraState;
  


  bindZoom();
bindWheelRouter();






























  /* Final inspect owner. It bypasses the historical append-wrappers that duplicated monster/item prose. */

  /* ---------- ammunition: half bundle size, no equipped-bow bias, clearer arrow silhouettes ---------- */
  if(Array.isArray(window.MANRU_AMMO)){
    const sizes={wood_arrow:[5,9],iron_arrow:[4,7],piercing_arrow:[3,5]},descs={
      wood_arrow:'가볍고 값싼 표준 화살. 바닥에서는 작은 화살 묶음으로 발견된다.',
      iron_arrow:'철제 화살촉을 단 보급용 화살. 목제 화살보다 묵직한 충격을 준다.',
      piercing_arrow:'가늘고 단단한 촉으로 갑옷 틈을 노리는 화살. 단단한 방어를 꿰뚫는 데 알맞다.'
    };
    for(const a of window.MANRU_AMMO){const q=sizes[a.ammoKind];if(q){a.spawnMin=q[0];a.spawnMax=q[1]}if(descs[a.ammoKind])a.desc=descs[a.ammoKind]}
  }
  /* R7 refactor: second ammo visual wrapper removed; projectile logic remains. */

  /* Make flying bow projectiles  /* Make flying bow projectiles read as arrows instead of glowing balls. */

  /* ---------- permadeath: one rolling autosave, no slots/backups/import rollback ---------- */
  
  
  
  // r53: obsolete v984 descent save wrapper retired; v1004 owns persistence.
    // r53: overwritten save implementation retired.


  const panelHead=document.querySelector('#releasePanel70 .rc70Head b');if(panelHead)panelHead.textContent='만루 · 설정';
  document.querySelectorAll('[data-rcsave],[data-rcload]').forEach(b=>{b.disabled=true;b.onclick=e=>{e?.preventDefault?.();toast('슬롯 저장/불러오기는 퍼마데스에서 사용하지 않는다.')}});

































  

  // Item choice modal shared by identify, holy purification and holy-upgrade.
  createChoiceModal();
















  // Explicit v9.9.1 item-identity service. Outer canonical item-use code may use only this boundary;
  // keeping the lexical helpers private prevents another silent scope break when item routing is refactored.
  globalThis.__MANRU_ITEM_IDENTITY991__=Object.freeze({hostileHit:undeadItemCurse,openMartialManual:openMartialManualChoice,closeChoice:closeChoice991,
    isGear:isGearItem,
    curseDef:curseDefOf,
    curseStacks:curseStackCount,
    cursePower:curseMultiplier,curseStats:applyCurseStats,tickCurses:tickActorCurses,
    curseClocks:()=>structuredClone(syncCurseClocks991()),
    activateCurse:activateItemCurse,
    markGear:prepareGearCurse,
    identifyGear:identifyGearItem,
    revealCurse:revealItemCurse,
    identifyOne:useIdentifyScrollOn,
    isUnknown:isUnidentifiedItem,
    useIdentify:useIdentifyItem,
    useHoly:useHolyItem,
    useHolyFusion:useHolyFusionItem,
    closeSkillQuick:closeSkillQuickPanel,
    closeChoice:closeChoice991,
    purifyGear:purifyGearItem
  });



  // r18: generation side effects are invoked by the single canonical generation pipeline below; no wrapper stacking here.
  





  // Existing generated floor may have been built before the new wrapper was installed.
  if(state){applyCursesToAllGear();ensureHolyDrop();syncCurseClocks991()}
  
  // Curse effects preserve the base item stats. Equal active curse ids across equipped slots
  // share one geometric strength: 1 stack=1x, 2=2x, 3=4x, 4=8x, 5=16x.





  // Equip reveals the item and activates its curse. A manifested curse binds that slot until purified.
  // r30: v9.9.1 identity/holy/curse equipment dispatch is integrated in canonical useInventoryItem.

  // Prevent explicit unequip/drop of a manifested cursed slot from the modern inventory renderer.
  document.addEventListener('click',e=>{const b=e.target?.closest?.('[data-uxunequip],[data-uxdrop-equip]');if(!b||!state)return;const slot=b.dataset.uxunequip||b.dataset.uxdropEquip,it=state.player?.[slot];if(it?.curseActive991){e.preventDefault();e.stopImmediatePropagation();toast(`${it.name}의 저주가 장비를 붙잡고 있다. 성부로 정화해야 한다.`)}},true);




  // ----- Skill UX: tap = usable actives, hold = upgrade panel -----
  createSkillQuickPanel();





  
  


  // r57: canonical activateMartial closes the quick-skill panel through __MANRU_ITEM_IDENTITY991__.


  bindSkillButton();queueMicrotask(bindSkillButton);

  // CSS: deliberately >1px borders and distinct visual identity per technique.

  // Keep debug hooks explicit for regression tests.
  


/* ===== MANRU v9.9.2 STORY SYSTEM — integrated into core scope ===== */
















































  storyEnsureUI();
  Object.assign(globalThis,{storyCollectNote992:storyCollectNote,storyDrawWorld992:storyDrawWorld,storyFriendBossPattern992:storyFriendBossPattern,storyBreakFriendMask992:storyBreakFriendMask,storyShowEndingChoice992:storyShowEndingChoice,storyAfterFloorGenerated992:storyAfterFloorGenerated,storyInitNewRun992:storyInitNewRun,storyTick992:storyTick});
  window.__MANRU_STORY992__={resume:()=>{const st=storyEnsureState();if(st?.dispatchPending60)return storyOpenNote('dispatch');return false},close:storyCloseModal,closeScene:storyCloseScene,selectEnding:storySelectEnding,continueScene:storyContinueScene,project:projectStoryUI,open:storyOpenNote,ending:storyResolveEnding};




  // Final requested starting loadout. Inspector deliberately has no starting weapon.
  const wanderer1001=CLASSES.find(c=>c.id==='wanderer');
  if(wanderer1001){
    wanderer1001.startWeapon='';
    wanderer1001.startItems=[['감정부적',2],['주먹밥',1]];
    wanderer1001.startLabel='경량복 · 감정부적×2 · 주먹밥';
    wanderer1001.desc='정부 특임 감찰관. 시작 무기는 없지만 감정부적이 하나 더 있어 미감정 장비 대응이 빠르다.';
  }



  
  







  bindClassPickerElements();












  classGrid.addEventListener('keydown',e=>{
    if(!pickWrap.classList.contains('show')||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
    e.preventDefault();const index=CLASSES.findIndex(c=>c.id===selectedClass1001),next=e.key==='Home'?0:e.key==='End'?CLASSES.length-1:(index+(e.key==='ArrowRight'?1:-1)+CLASSES.length)%CLASSES.length;
    selectClass(CLASSES[next].id);classGrid.children[next].focus();
  });
  renderClassGrid();
bindContextMenuRouter();


RuntimeState.ui.screen=SCREEN1002;



  function bootScreen1002(){
    if(SCREEN1002.booted)return;SCREEN1002.booted=true;
    if(state&&!state.dead&&!state.victory){setScreen('game');return}
    // r57: legacy active-run restore is intentionally absent; only save1004 may resume a run after full initialization.
    setScreen(state&&(state.dead||state.victory)?'ending':'title');
  }
  bootScreen1002();





  /* ===== MANRU v10.0.3: tall player / real quit / hardened permadeath / canonical food+talisman art ===== */


    sanitizeTransient1003();
    if(state){resetVisualState();try{updateAll()}catch(error){ignoreError('ui refresh after restore',error)}}

    /* ---------- player sprite: 36x52 exact-pixel world render, feet anchored to tile bottom ---------- */

    
    

    /* ---------- legacy v10.0.3 item-art owner retired ---------- */
    // Duplicate food/start-card sprite generation remains removed; start cards consume canonical real item art.



    /* Starting-item cards are not mutated here. The class renderer consumes canonical real item art directly. */


    

    ensureQuit();

    /* ---------- permadeath hardening: reject a resurrected snapshot while its death tombstone remains ---------- */
    

    // Any stale renderer timestamp loaded during the earlier v10.0.2 boot is neutralized now.
    sanitizeTransient1003();
resetToTitleScreen();

    // Descent requests persistence after every existing descent effect completes.



    // r18: repairLateItems1004 is called explicitly by the canonical generation pipeline.
    // r53: removed generation-on-load stage repair-items1004; saved geometry is authoritative.






    
















    
    

    /* ---------- class screen uses the exact same compact sprite source ---------- */
    // r40: retired the old class-grid mutation owner. The final actor service now consumes this exact v10.0.4 start-sprite source directly, so reopening the class picker cannot silently swap portraits behind the canonical renderer.






  // r18: strict typed-key retries run inside the canonical generation pipeline so failed attempts
  // do not also consume holy/story/item side effects through nested generation wrappers.
  




















/* r15: voluntary movement, forced movement and knockback call this shared hazard core directly from their canonical base functions. */










/* HUD: the remaining ward time must be impossible to miss. */
createWardHud();



globalThis.__MANRU_DRAW_HOOKS_R19__?.post.push({id:'hazard1005',draw:drawHazardOverlay});




/* ---------- route-first fixed-map surgery: long real path, not random wall/door clutter ---------- */




















// r18: hazard/route post-generation stages are invoked explicitly by the canonical pipeline.

/* Friend/false-friend sprite: same 32x36 scale as the current player, but sharper and more threatening. */


/* descriptive UI for new rules */



/* MANRU v10.0.4 rollback continuation — key clarity + item-effect audit/fix */







const TERRAIN_R41_1006=globalThis.__MANRU_TERRAIN_R41__=globalThis.__MANRU_TERRAIN_R41__||{};TERRAIN_R41_1006.specialBefore=drawKeyTile;TERRAIN_R41_1006.specialKeyAfter=drawKeyGateOverlay;


/* matching pickup/open messages + ledger colors/names */
globalThis.__MANRU_TYPED_KEYS__?.setMetaProvider?.(keyMeta1006);
/* r45: key panel reads __MANRU_TYPED_KEYS__.meta() directly; removed the v10.0.6 naming wrapper. */






/* breakPower was also data-only: make it useful without allowing route/lock bypass. */
/* r8: breakPower is handled by the central basicAttack facing branch. */

/* weapon effects: focus chain, opening edge, tracking, construct-breaking bonus */

/* parry + actual stagger resistance */

/* common cloak trap effect; fatal terrain deliberately untouched */
/* travel cloak eat speed */

/* fractional focus regen so 1.35 is no longer rounded to the same result as 1.00 */



/* keep old saves and newly generated instances in sync with audited definitions */
// r18: item normalization/door pruning are explicit canonical generation stages.




/* QA surface */





































































/* Selective architecture only. No global map replacement. */

/* ===== ARCHITECTURE REVISION 1023: requested density / organic route / canal sanctum ===== */




/* F06 r2 — veranda ring outside, tangled inner rooms, one guarded treasure chamber. */

/* F11 r2 — no bottom/side land bypass. River traversal only; existing raft/blink system is preserved. */

/* F15 r5 — compact organic mirror-maze: many small chambers, braided short loops, no broad dead halls. */

/* F16 r2 — actual layered castle wards. Outer fortifications and internal living quarters are both subdivided. */

/* F22 r3 — preserve the monumental central avenue itself. Dense lower canal cloister; avenue ends in a forced side/down/up palace pilgrimage. */


/* ===== MANRU v10.0.4 r4 — F15 organic weave / F22 preserved ceremonial spine / special-floor decor parity ===== */

/* F15 r8: varied mirrored salons around a braided circulation graph. Every chamber has >=2 useful links. */

/* F22 r8: narrow canal cloister -> PRESERVED ceremonial spine -> split/down/grand-palace pilgrimage -> side-entry stair sanctuary. */
























































































// r30: library scroll dispatch is integrated in canonical useInventoryItem.









/* r36: v10.1.1 portrait mutation observer retired. R10 canonical actor service owns both start-card and world pixels. */
























const TERRAIN_R41_ARCH=globalThis.__MANRU_TERRAIN_R41__=globalThis.__MANRU_TERRAIN_R41__||{};
TERRAIN_R41_ARCH.floor=(px,py,x,y,colors,vis)=>{floorOverlay1020(px,py,x,y,colors,vis);floorThemeOverlay1022(px,py,x,y,colors,vis);drawSpecialMaterial(px,py,x,y,false)};
TERRAIN_R41_ARCH.surfaceBlend=floorSurfaceBlend1025;
TERRAIN_R41_ARCH.libraryDesk52=drawLibraryDesk;
TERRAIN_R41_ARCH.wall=(px,py,x,y,colors)=>wallLibraryOverlay1022(px,py,x,y,colors);
TERRAIN_R41_ARCH.specialAfter=(tile,px,py,x,y,now,r)=>{specialBlendOverlay1020(tile,px,py,x,y,now,r)};






































/* Existing 9.9.4 visual props are the only visual-only versions used for legacy furnishings. */



/* R39 ENCOUNTER DISTRIBUTION

/* R39 ENCOUNTER DISTRIBUTION — small contextual packs are allowed; ordinary generation cannot collapse into a mob ball. */

































/* ===== MANRU r58.1 RUMOR-REVEALED HIDDEN SPACES / CANONICAL MAP EXTENSION ===== */
const RUMOR_SPACE_VERSION1030='r58.1-rumor-spaces';












































globalThis.__MANRU_RUMOR_SPACES1030__=Object.freeze({version:RUMOR_SPACE_VERSION1030,types:RUMOR_SPACE_TYPES.map(t=>({id:t.id,name:t.name,preview:!!t.preview,risk:t.risk})),generate:generateRumorSpaces,revealNext:rumorRevealNext,reveal:r=>revealRumorSpace(r),openEntranceAt:rumorOpenEntranceAt,drawEntranceOverlay:rumorDrawEntranceOverlay,isSealedInterior:(x,y)=>!!rumorSpaceByInterior(x,y),mutationLocked:rumorSpaceMutationLocked,audit:rumorAudit,qaGenerate:rumorQAGenerate});


// r18: architecture finalization is the final explicit stage of the canonical generation pipeline.











/* ===== MANRU v10.0.4 r18: SINGLE CANONICAL FLOOR GENERATION PIPELINE · EXIT MARKER INVARIANT / DIRECT BOSS DROPS ===== */
if(typeof globalThis.__MANRU_GENERATE_CORE983__!=='function')throw new Error('Manru canonical generator core missing');




























































Object.defineProperty(globalThis,'__MANRU_ACTOR_ART__',{value:ACTOR_ART,writable:false,configurable:false,enumerable:true});




renderClassGrid();




/* R7 procedural item sprite generator removed: TRUE-HD atlas and authored consumable visuals are canonical. */

/* ===== R7 CANONICAL ITEM ART (outer game scope) ===== */













































globalThis.__MANRU_ICON_HTML_IMPL_R7__=iconHtml;
window.__MANRU_ITEM_ART_R7__={dataItem:data,weaponAsset,pictureAsset:summonPictureAsset,iconHtml,clear:()=>{CACHE.clear();DATA.clear();WEAPON_ASSETS.clear();PICTURE_ASSETS.clear();return true}};

/* r29: lexical-scope QA bridge. This exposes tests only; gameplay paths remain canonical. */






const ARTIFACT_PLAYER_SCOPE46=Object.freeze(['player','status','turn','enemyEnergy','dead','victory','runState57','runEndEffects57']);
const ARTIFACT_RUN_SCOPE46=Object.freeze(['pendingMartialManualChoice','martialManualDrops','martialDamageSequence','martialProgression1005','artifactClaimed46','artifactHistory46','knowledge56','lootHistory47','uniqueKilled','harvested','holy991','story992','runId984','saveVersion1004']);




function owns47(id){return possesses47(id)}



function snapshotSerializable46(src){const o=structuredClone(src);delete o.artifactReturn46;return{...o,seen:src.seen instanceof Set?[...src.seen]:(Array.isArray(src.seen)?[...src.seen]:[]),visible:src.visible instanceof Set?[...src.visible]:(Array.isArray(src.visible)?[...src.visible]:[]),grassTufts1020:src.grassTufts1020 instanceof Set?[...src.grassTufts1020]:(Array.isArray(src.grassTufts1020)?[...src.grassTufts1020]:[])}}
function artifactCarry46(){const o=carryRunState57([...ARTIFACT_PLAYER_SCOPE46,...ARTIFACT_RUN_SCOPE46]);o.hazardPlayer1005={drownUntil:state.hazard1005?.drownUntil||0,voidUntil:state.hazard1005?.voidUntil||0};return o}
function normalizeSnapshotCollections46(o){return{...o,seen:o.seen instanceof Set?o.seen:new Set(Array.isArray(o.seen)?o.seen:[]),visible:o.visible instanceof Set?o.visible:new Set(Array.isArray(o.visible)?o.visible:[]),grassTufts1020:o.grassTufts1020 instanceof Set?o.grassTufts1020:new Set(Array.isArray(o.grassTufts1020)?o.grassTufts1020:[])}}
function snapshot46(){
 const outer=snapshotSerializable46(state),o={schema46:2,cols:COLS,rows:ROWS,outer};
 if(outer.map&&state.artifactPortal46){const p=state.artifactPortal46;if(outer.map[p.y]?.[p.x]===TT.PORTAL)outer.map[p.y][p.x]=Number.isFinite(p.oldTile)?p.oldTile:TT.FLOOR;outer.artifactPortal46=null}
 return o
}
const LegendaryDungeonBuilder=Object.freeze({
restore(){
 if(!WorldTransition57.allowed())return false;const {artifactReturn46:r}=state;if(!r)return false;const followers=summonFollowers();
 if(r.schema46===2&&r.outer){const carry=artifactCarry46(),pos={x:r.outer.player?.x??0,y:r.outer.player?.y??0};COLS=r.cols;ROWS=r.rows;const outer=normalizeSnapshotCollections46(structuredClone(r.outer));state=outer;for(const [k0,v] of Object.entries(carry))if(k0!=='hazardPlayer1005')state[k0]=v;if(carry.hazardPlayer1005){state.hazard1005=state.hazard1005||{armed:{},collapsed:{},lastWarn:{}};state.hazard1005.drownUntil=carry.hazardPlayer1005.drownUntil;state.hazard1005.voidUntil=carry.hazardPlayer1005.voidUntil}state.player.x=pos.x;state.player.y=pos.y}
 else{const keep=artifactCarry46(),pos=r.playerPos||{x:state.player.x,y:state.player.y};COLS=r.cols;ROWS=r.rows;state.pendingGroundItems57=[];for(const [k0,v] of Object.entries(r)){if(['cols','rows','playerPos','seen','visible','hazardFloor1005'].includes(k0))continue;state[k0]=structuredClone(v)}for(const [k0,v] of Object.entries(keep))if(k0!=='hazardPlayer1005')state[k0]=v;if(state.hazard1005&&r.hazardFloor1005){state.hazard1005.armed=structuredClone(r.hazardFloor1005.armed||{});state.hazard1005.collapsed=structuredClone(r.hazardFloor1005.collapsed||{});state.hazard1005.lastWarn=structuredClone(r.hazardFloor1005.lastWarn||{});state._lastPlayerPos60=structuredClone(r.hazardFloor1005.lastPlayerPos60||null)}state.seen=new Set(r.seen||[]);state.visible=new Set(r.visible||[]);state.grassTufts1020=state.grassTufts1020 instanceof Set?state.grassTufts1020:new Set(state.grassTufts1020||[]);if(keep.hazardPlayer1005&&state.hazard1005){state.hazard1005.drownUntil=keep.hazardPlayer1005.drownUntil;state.hazard1005.voidUntil=keep.hazardPlayer1005.voidUntil}state.player.x=pos.x;state.player.y=pos.y}
 summonCleanup();summonPlaceFollowers105(followers);if(mineState()?.palaceControls105)mineTick();delete state.artifactReturn46;delete state.artifactDungeon46;delete state.artifactExit46;delete state.artifactReward46;state.legendDecor47=[];delete state.legendPalette47;normalizeRunState57();normalizeItemContainers57();WorldTransition57.complete();syncEquip47();resetVisualState();VisibilityService.compute();vfBuildDecor?.();updateAll();addLog('전용 문이 닫히며 원래 만루의 층으로 돌아왔다.');return true
},
build(a,options={}){
 if(a?.id==='water_crossbow'){toast('창해 수압노궁은 본관 9층의 창해 용궁으로 통합됐다.');return false;}if(!a||!state)return false;const seed=Number.isFinite(options.seed)?options.seed>>>0:(globalThis.__MANRU_RANDOM57__()*4294967296)>>>0,spec=LEGEND_DUNGEON_LAYOUTS[a.id],t=LEGEND_TILES49[a.id];let accepted=false,last;
 const dungeonBase57=captureGenerationSnapshot();for(let attempt=0;attempt<16;attempt++){
 if(attempt>0)restoreGenerationSnapshot(dungeonBase57);state.generationInProgress57=true;rng49=RngService.legendary(seed+attempt*104729);COLS=93;ROWS=63;
 const background=['earth_gauntlet','chain_sickle','lava_bow','thunder_spear'].includes(a.id)?TT.VOID:t.walls[2];state.map=Array.from({length:ROWS},()=>Array(COLS).fill(background));
 state.player.smokeInside1005=false;Object.assign(state,{terrainReactions105:newTerrainReactions105(),martialEcho:null,pendingGroundItems57:[],rooms:[],items:[],monsters:[],decals:[],switches:[],rafts:[],routeTags:[],vaults:[],decor:[],legendDecor47:[],legendDecorGrid47:{},legendPattern47:{},legendObjects49:[],legendLights49:[],legendBuildings49:[],legendPaths49:[],legendRegion49:new Array(COLS*ROWS).fill(-1),terrainUnderlay58:{},terrainAttachment58:{},featureRooms:[],restaurantRooms42:[],specialFloor:true,floorTurn:0,layoutName:a.dungeon,seen:new Set(),visible:new Set(),floorKeys:0,floorKeysRequired:0,cipher:null,fixedStart:null,fixedExit:null,grassTufts1020:new Set(),keyPlan96:null,typedKeys96:null,hiddenGroups60:[],hiddenLookup60:{},hiddenBase60:{},hiddenReplacement60:{},portalLinks981:{},portalEdges981:{},portalRooms981:[],discoveredPortals981:{},requiresBlink:false,crumbleBase60:{},legendTerrain47:[],legendFireFields47:[],legendSkyAxes47:[],tempFields:[],tempTerrain74:[],elementFields74:[],artifactFields46:[],jarGasFields57:[],hazard1005:{armed:{},collapsed:{},lastWarn:{},drownUntil:state.hazard1005?.drownUntil||0,voidUntil:state.hazard1005?.voidUntil||0},legendTheme47:a.id,legendLandmark47:null,legendSeed49:seed,legendAttempt49:attempt+1,generatedBuild:'r58',artifactDungeon46:{id:a.id,name:a.dungeon,hudName:a.hudName,enteredFloor:state.floor,stage:a.stage}});
 try{
  if(a.id==='water_crossbow')for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++){
   const channel=Math.abs(x-(25+Math.round(Math.sin(y/7)*3)))<3||Math.abs(x-(69+Math.round(Math.sin(y/9)*3)))<3||Math.abs(y-(19+Math.round(Math.sin(x/10)*2)))<2||Math.abs(y-44)<2;
   const basin=((x-44)/13)**2+((y-20)/9)**2<1||((x-64)/13)**2+((y-45)/7)**2<1;
   if(channel||basin)setTerrainTile58(state.map,x,y,TT.WATER);
  }
  const rs=spec.rooms.map((q,i)=>room47(state.map,q,i));state.rooms=rs;
  for(let ei=0;ei<spec.edges.length;ei++){const[i,j]=spec.edges[ei];hall47(state.map,rs[i],rs[j],t.base,ei%5===0?3:ei%3===0?1:2)}
  // Exterior buttresses follow the true silhouette; they never fill a bounding rectangle.
  const skin=[];for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++)if(state.map[y][x]===background&&DIRS4.some(([dx,dy])=>{const v=state.map[y+dy][x+dx];return v>=500&&v<660&&(v-500)%16<4}))skin.push({x,y});
  for(const p of skin)setTerrainTile58(state.map,p.x,p.y,t.walls[2]);
  if(a.id==='ember_axe'||a.id==='lava_bow'){for(let y=2;y<ROWS-2;y++)for(let x=2;x<COLS-2;x++)if(state.map[y][x]===TT.VOID&&((a.id==='lava_bow'&&Math.hypot(x-45,y-28)<13)||(a.id==='ember_axe'&&Math.abs(x-44-Math.sin(y/8)*8)<2)))setTerrainTile58(state.map,x,y,TT.LAVA)}
  markRooms47(rs);architecture47(a,rs);
  const start=rs[0],goal=rs.at(-1);state.player.x=start.cx;state.player.y=start.cy;setTerrainTile58(state.map,start.cx,start.cy,t.base);state.artifactExit46={x:start.x+1,y:start.y+1};setTerrainTile58(state.map,state.artifactExit46.x,state.artifactExit46.y,TT.PORTAL);
  state.artifactReward46={x:goal.cx,y:goal.cy,id:a.id};setTerrainTile58(state.map,goal.cx,goal.cy,t.base+1);PlacementService.placeItem({...clone(a),x:goal.cx,y:goal.cy,count:1});state.stairs={x:0,y:0};installLegendKeys47(a,rs);
  last=GenerationValidator.legendary();if(!last.ok)continue;spawnDungeon46(a.id,rs);last=GenerationValidator.legendary();if(!last.ok)continue;state.legendIntegrity49={...last,attempt:attempt+1};accepted=true;break;
 }catch(e){last={error:String(e),attempt:attempt+1};}
 }
 rng49=RngService.nativeRuntime();if(!accepted){restoreGenerationSnapshot(dungeonBase57);throw new Error('r49 rejected all dungeon attempts '+a.id+' '+JSON.stringify(last))}
 state.seen=new Set();state.generationInProgress57=false;WorldTransition57.complete();VisibilityService.compute();resetVisualState();
 if(!options.quiet){startFloorTransition?.();addLog(`${a.dungeon}에 들어섰다.`);if(dungeonVisionScale50()<1)addLog(`이곳의 주박이 시야 반경을 ${Math.round((1-dungeonVisionScale50())*100)}% 제한한다.`);addLog(`철제 열쇠로 별전을 열고 청옥열쇠를 찾아 ${a.name}의 성소로 향하라.`);updateAll()}
 return state.legendIntegrity49;
},
enter(id){if(id==='water_crossbow'){toast('창해 수압연노는 본관 9층 창해 용궁에서 얻을 수 있다.');return false;}const a=adef46(id);citadelEnsurePlan();if(citadelReservedRelic(id)){toast('이번 전승은 본관 16층의 흑성채 성소에 깃들었다.');return false;}if(possesses47(id)||claimed47(id)){toast('이미 획득한 전승이다.');return false;}if(!WorldTransition57.allowed()||!a||state.artifactDungeon46)return false;const transition57=captureGenerationSnapshot(),followers=summonFollowers();for(const mon of followers)OccupancyService.removeMonster(mon);state.artifactReturn46=snapshot46();state.artifactPortal46=null;try{LegendaryDungeonBuilder.build(a);summonPlaceFollowers105(followers);return true}catch(e){restoreGenerationSnapshot(transition57);console.error('legend dungeon generation rejected',e);toast('전설무기 던전의 구조가 불안정해 포탈이 닫혔다.');return false}}
});

for(const [id,t] of Object.entries(LEGEND_TILES49))for(const [n,v] of Object.entries({PAVING:t.base,INLAY:t.base+1,PLATES:t.base+2,COURT:t.base+3,ASHLAR:t.base+4,BUTTRESS:t.base+5,ROCK:t.base+6,BRIDGE:t.bridge,STRUCTURE:t.solid}))TT['LEGEND_'+id.toUpperCase()+'_'+n]=v;













GenerationValidator.legendary=function legendaryCandidate10(){const progression=keyProgressAudit48(false),all=ReachabilityService.keyWalk(new Set(['iron','jade'])),islands=[],badItems=[],badRooms=[];let walkable=0,ordinaryDoors=0;const forbidden=new Set([TT.FLOOR,TT.DARK_WOOD,TT.MOON_STONE,TT.GILDED_FLOOR,TT.BRAZIER,TT.CRATE,TT.JAR,TT.CACHE,TT.STONE_PILLAR,TT.PAPER_BRIDGE]);let reused=0;
 for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){const t=state.map[y][x];if(forbidden.has(t))reused++;if(t===TT.DOOR)ordinaryDoors++;if(!tileBlocks(t)||t===TT.LOCKED_GATE){walkable++;if(!all.seen.has(key46(x,y)))islands.push({x,y,t})}}
 for(const it of state.items)if(!all.seen.has(key46(it.x,it.y)))badItems.push({name:it.name,x:it.x,y:it.y});
 for(const r of state.rooms){let n=0;for(let y=r.y+1;y<r.y+r.h-1;y++)for(let x=r.x+1;x<r.x+r.w-1;x++)if(all.seen.has(key46(x,y)))n++;if(!n)badRooms.push(r.index)}
 return{ok:progression.ok&&!islands.length&&!badItems.length&&!badRooms.length&&!reused,seed:state.legendSeed49,progression,walkable,islands:islands.slice(0,20),islandCells:islands.length,badItems,badRooms,ordinaryDoors,reused,rooms:state.rooms.length,buildings:state.legendBuildings49.length,landmarks:state.legendObjects49.filter(x=>x.kind.startsWith('monument')).length,water:state.map.flat().filter(t=>t===TT.WATER).length,bridges:state.map.flat().filter(t=>t===LEGEND_TILES49[state.legendTheme47].bridge).length};
};Object.freeze(GenerationValidator);


























function handlePortalAt46(x,y){if(!WorldTransition57.allowed())return false;if(state.artifactDungeon46&&state.artifactExit46?.x===x&&state.artifactExit46?.y===y){cancelAutoWalk?.();burst(x,y,'#f0cc84',18,.9);return LegendaryDungeonBuilder.restore()}if(state.artifactPortal46?.x===x&&state.artifactPortal46?.y===y){cancelAutoWalk?.();burst(x,y,'#f0cc84',18,.9);return LegendaryDungeonBuilder.enter(state.artifactPortal46.id)}return false}

function resetPortal46(){if(state&&!state.artifactDungeon46)state.artifactPortal46=null}



function atkBonus47(){return equipped47('curse_blade')?cursedEquipped47()*3:0}




function fireAbsorb47(){return possesses47('ember_axe')&&state?.player?.armor?.elementGuard74==='fire'}
function healFire47(n=1){n=Math.max(0,Math.round(Number(n)||0));if(!state||!fireAbsorb47())return 0;const p=state.player,b=p.hp;p.hp=Math.min(p.maxHp,p.hp+n);const g=p.hp-b;if(g>0)floatText(p.x,p.y,`화염흡수 +${g}`,'#ffb365',9);return g}




function tempLava47(cx,cy){emitElementContact105('fire',elementCells105(cx,cy,1),effectSource57(state.player));for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const x=cx+dx,y=cy+dy;if(!insideMapInterior(x,y))continue;const old=state.map[y]?.[x];if(!(old>=500&&old<660&&(old-500)%16<4)&&![TT.FLOOR,TT.GRASS,TT.OPEN_DOOR,TT.WOOD_FLOOR,TT.MOON_STONE,TT.DARK_WOOD,TT.GILDED_FLOOR].includes(old))continue;if(state.artifactExit46?.x===x&&state.artifactExit46?.y===y)continue;RuntimeTerrainOwner.temporary(x,y,TT.LAVA,5,'legend-lava',{allowedOld:[old],source:'lava-bow47'})}burst(cx,cy,'#f06f33',30,1.2)}
function resurrect47(mon,pos){if(!mon||mon.kind==='undead'||mon.boss||mon.miniBoss||globalThis.__MANRU_RANDOM57__()>=.62)return false;const ally={name:`타락한 ${mon.name}`,x:pos.x,y:pos.y,hp:Math.max(5,Math.round((mon.maxHp||20)*.65)),maxHp:Math.max(5,Math.round((mon.maxHp||20)*.65)),atk:Math.max(2,Math.round((mon.atk||6)*.25)),def:Math.max(0,Math.round((mon.def||0)*.80)),eva:Math.max(0,Math.round((mon.eva||0)*.55)),xp:0,color:'#76517c',shape:mon.shape||'undead',kind:'undead',faction57:'player',friendly47:true,spawnProvenance57:'resurrection',legendAlly47:true,allyId53:`ally-${state.turn}-${state.nextAllyId53=(state.nextAllyId53||0)+1}`,allyBornTurn47:state.turn,allyExpireTurn47:state.turn+24,ttl47:24,alerted:true,weakened:0};if(!OccupancyService.isOccupied(pos.x,pos.y)&&!tileBlocks(state.map[pos.y]?.[pos.x]))OccupancyService.addMonster(ally);else{const q=DIRS8.map(([dx,dy])=>({x:pos.x+dx,y:pos.y+dy})).find(q=>PlacementService.monsterCanStand(ally,q.x,q.y));if(q){ally.x=q.x;ally.y=q.y;OccupancyService.addMonster(ally)}else return false}burst(ally.x,ally.y,'#8f62a0',18,.8);addLog(`${mon.name}의 잔해가 타락한 언데드로 일어났다. 공격력은 원본의 일부뿐이다.`);return true}





globalThis.__MANRU_DRAW_HOOKS_R19__?.world.push({id:'legendary47',draw:drawLegendWorld});


function mapSignature46(){if(!state?.map)return null;let h=2166136261>>>0,counts={};for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){const v=state.map[y]?.[x]??-1;counts[v]=(counts[v]||0)+1;h^=((v+257)*131+x*17+y*31)>>>0;h=Math.imul(h,16777619)>>>0}return{hash:h>>>0,counts}}




function claimReward46(){const r=state?.artifactReward46;if(!r)return false;state.player.x=r.x;state.player.y=r.y;resetVisualState();VisibilityService.compute();pickupBaseR25();claimAudit46();return{owned:[state.player.weapon,...state.player.inventory].filter(Boolean).filter(i=>i.legendaryWeapon47).map(i=>i.name),left:(state.items||[]).filter(i=>i.legendaryWeapon47).length}}




const API47={gatekeeper:applyLegendGatekeeper47,mobCatalog:()=>Object.keys(DUNGEON_MOBS47).flatMap(mobDefs47),version:'R49',enemyDefinitions:id=>mobDefs47(id).map(d=>({...d})),build:(id,seed,quiet=true)=>LegendaryDungeonBuilder.build(adef46(id),{seed,quiet}),integrity:()=>GenerationValidator.legendary(),assets:()=>legendAssetAudit(),defs:()=>LEGENDS47.map(a=>({...a})),debugKeys:()=>{const zs=state?.legendSanctums47||[];return{dungeon:state?.artifactDungeon46?.id||null,player:state?.player?{x:state.player.x,y:state.player.y}:null,sanctums:structuredClone(zs),plan:structuredClone(state?.keyPlan96||null),reward:state?.artifactReward46?{...state.artifactReward46}:null,mapAround:zs.map(z=>{const rows=[];for(let yy=z.cy-z.r-1;yy<=z.cy+z.r+1;yy++){const row=[];for(let xx=z.cx-z.r-1;xx<=z.cx+z.r+1;xx++)row.push(state.map?.[yy]?.[xx]??null);rows.push(row)}return{keyId:z.keyId,cx:z.cx,cy:z.cy,r:z.r,gate:z.gate,rows}})}},handlePortalAt:handlePortalAt46,enter:LegendaryDungeonBuilder.enter,restore:LegendaryDungeonBuilder.restore,forcePortal:forcePortal47,forceDungeon:(id=LEGENDS47[0].id)=>LegendaryDungeonBuilder.enter(id),reveal:()=>{if(!state?.artifactDungeon46)return false;state.seen=new Set();state.visible=new Set();for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){VisibilityService.rememberKey(k(x,y));VisibilityService.addVisibleKey(k(x,y))}updateAll();return true},keyAudit:()=>keyProgressAudit48(false),audit:()=>({floor:state?.floor,inDungeon:!!state?.artifactDungeon46,dungeon:state?.artifactDungeon46||null,portal:state?.artifactPortal46||null,exit:state?.artifactExit46||null,reward:state?.items?.filter(i=>i.legendaryWeapon47).map(i=>({name:i.name,x:i.x,y:i.y}))||[],owned:[state?.player?.weapon,...(state?.player?.inventory||[])].filter(Boolean).filter(i=>i.legendaryWeapon47).map(i=>i.name),reach:reachAudit46(),map:mapSignature46(),dims:[COLS,ROWS],monsters:state?.monsters?.filter(m=>!m.friendly47).length||0,legendMobs:state?.monsters?.filter(m=>m.legendMob47).map(m=>m.name)||[],decor:state?.legendDecor47?.length||0}),recordAcquisition:claimAudit46,claimReward:claimReward46,walkPortal:walkPortal46,walkReturn:walkReturn46,give:(id)=>{const a=adef46(id);if(!a||!state)return false;addInventoryItem({...clone(a),count:1});claimAudit46();return true},upgradeProbe:(id)=>{const a=clone(adef46(id)||LEGENDS47[0]);const before={atk:a.atk,upgrade:a.upgrade||0};const r=applyWeaponUpgrade(a);return{before,after:{atk:a.atk,upgrade:a.upgrade||0},result:r}},effectProbe:effectProbe47,regen:f=>{state.floor=clamp(+f||6,1,25);NormalFloorGenerator.generate();resetVisualState();VisibilityService.compute();updateAll();return{floor:state.floor,portal:state.artifactPortal46||null}},atkBonus:atkBonus47,critBonus:cursedBladeCritBonus,defBonus:earthGauntletDefBonus,syncEquip:syncEquip47,guard:guard47,fireAbsorb:fireAbsorb47,healFire:healFire47,allyTurn:alliesTurn,enemySpecial:enemySpecial47,owns:owns47,possesses:possesses47,claimed:claimed47,cursedEquipped:cursedEquipped47};
globalThis.__MANRU_LEGEND47__=API47;globalThis.__MANRU_ARTIFACT46__=API47;













/* 10.0.5 subbranches: canonical map producer, persistent world pages, terrain consumer. */

































































MONSTERS.push(PALACE_LOTUS105,PALACE_GARDENER105);
loadPalaceActorImages();





























































































































































































































































































































function initSummon105(){summonUpdateButtons();}

initSummon105();
initDebugBattle57();


