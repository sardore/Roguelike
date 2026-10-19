


















































































































































window.addEventListener('blur',clearHeldInput53);
document.addEventListener('visibilitychange',()=>{if(document.hidden)clearHeldInput53()});





















































































































C.addEventListener('pointerdown',InputRouter,{capture:true,passive:false});InputRouter.noteListener('canvas-target:pointerdown');
C.addEventListener('pointerup',InputRouter,{capture:true,passive:false});InputRouter.noteListener('canvas-target:pointerup');
C.addEventListener('click',InputRouter,{capture:true,passive:false});InputRouter.noteListener('canvas-target:click');
document.addEventListener('keyup',InputRouter);InputRouter.noteListener('document:keyup');

























































































































































































































































// Movement, sight and combat all permit corner diagonals. The shared symmetric LOS
// still blocks walls crossed between cells, including knight-move offsets.















ActionDispatcher.register('CONTEXT_ACTION',contextAction);



function setGenerationBase(id,fn){if(typeof fn!=='function')throw new TypeError('generation base must be a function');MANRU_GENERATION_PIPELINE.base={id,fn};return fn}



setGenerationBase('base-original',generateFloorOriginal);







































ActionDispatcher.register('CIPHER_SUBMIT',submitCipher);






ActionDispatcher.register('STRUCTURE_INTERACT',bumpBlockedTile);











































ActionDispatcher.register('MOVE',movePlayer);




ActionDispatcher.register('BLINK',useBlink);






















ActionDispatcher.register('ATTACK',basicAttack);









try{HAPTIC57.enabled=localStorage.getItem('manruHaptics57')!=='0'}catch(error){ignoreError('haptics preference unreadable',error)}
















setPlayerAttackBaseR('initial',attackPlayerInitialCoreR);









setMonsterAttackBaseR('initial',attackMonsterInitialCoreR);













































































































































































ActionDispatcher.register('PICKUP',pickup);





















ActionDispatcher.register('SHOP_BUY',purchaseShop58);ActionDispatcher.register('SHOP_SELL',sellShop58);










ActionDispatcher.register('DESCEND',descend);
function rest(){const act=playerAction57('rest',{stunMessage:'몸이 굳어 쉬지 못했다.'});if(!act.ok)return !!act.consumed;cancelAutoWalk();commitPlayerAction57(act,1);return true}
ActionDispatcher.register('REST',rest);


ActionDispatcher.register('UPGRADE_MARTIAL',upgradeMartial);
ActionDispatcher.register('MARTIAL_MANUAL_CHOICE',chooseMartialManual);


ActionDispatcher.register('MARTIAL',activateMartial);












ActionDispatcher.register('ITEM_USE',useInventoryItem);

ActionDispatcher.register('ITEM_DROP',dropInventoryItem);































ClientEnvironment.initialize();




document.addEventListener('fullscreenchange',()=>{if(document.fullscreenElement)fullscreenResume66=false;else if(fullscreenWanted66)fullscreenResume66=true;window.dispatchEvent(new window.Event('resize'))});
// Re-enter from a genuine user gesture when the browser revokes fullscreen on app switching.
for(const type of ['pointerdown','touchend','keydown'])document.addEventListener(type,e=>{if(e.isTrusted&&fullscreenResume66&&document.body.dataset.manruScreen==='game')requestGameFullscreen65()},{capture:true,passive:true});



















/* Phase 12: CameraProjection12 and WorldHitTest12 are installed before runtime input can fire. */
window.addEventListener('resize',syncViewportOnWindowResize,{passive:true});


































































// Canonical runtime entrypoints populated once by their owning implementation blocks.
/* updateAll is declared by the render coordinator below. */
let updateMobileHud;
let visualLoop;
let runtimeLoopStarted57=0;

function runtimeReady57(){return typeof updateMobileHud==='function'&&typeof visualLoop==='function'}
function startRuntimeLoop57(){if(runtimeLoopStarted57)return true;if(!runtimeReady57())throw new ReferenceError('canonical runtime entrypoints are not initialized');runtimeLoopStarted57=1;requestAnimationFrame(visualLoop);return true}
Object.defineProperty(globalThis,'__MANRU_RUNTIME_START57__',{value:Object.freeze({ready:runtimeReady57,start:startRuntimeLoop57,started:()=>runtimeLoopStarted57===1}),writable:false,configurable:false});






















document.addEventListener('keydown',InputRouter,true);InputRouter.noteListener('document:keydown');


/* ===== MANRU v0.8 WORLD ART OVERRIDES ===== */


// Richer floor material: deterministic wear, seams and region-specific micro props.

// Wall faces now read as connected architectural masses rather than isolated boxes.



// Stronger but localized emissive lighting.



// R7 refactor: removed obsolete v7 item wrapper; later canonical renderer supersedes it.



bindMobileTopButtons();
renderMobileDrawer();


/* ===== MANRU v1.0 VERIFIED VISUAL + AUTOWALK PASS ===== */
VIS.hoverPath=null;VIS.autoPath=null;VIS.tapTrack=null;



/* r53: removed overwritten camera implementation. */



// Continuous auto-tiled wall masses: fewer "boxed tiles", stronger architecture.




// Local light islands inspired by high-contrast pixel dungeons: readable near the player, deep elsewhere.



// Architectural front faces, wall scrolls, and subdued non-interactive room dressing.












C.addEventListener('mousemove',e=>{if(!state||isMobileViewport())return;const t=globalThis.__MANRU_WORLD_HITTEST12__.cellAtClient(e.clientX,e.clientY);VIS.hoverPath=t?ReachabilityService.visiblePath(t.x,t.y):null}, {passive:true});
C.addEventListener('mouseleave',()=>VIS.hoverPath=null,{passive:true});

const m=document.querySelector('#mobileHud .mButtons');if(m&&!document.getElementById('mobileAutoBtn')){const b=document.createElement('button');b.id='mobileAutoBtn';b.setAttribute('aria-label','이동 / 자동 탐사');b.textContent='行';b.onclick=()=>ClientEnvironment.emit({type:'AUTO_EXPLORE',source:'mobile-hud'});m.insertBefore(b,document.getElementById('mobilePanelBtn'))}


// r53: mobile help text is canonical in renderMobileDrawer.




const VF_IMG={creature:new Image(),tile:new Image(),decor:new Image(),item:new Image()};
VF_IMG.creature.src=VF_ASSETS.creature_uri;VF_IMG.tile.src=VF_ASSETS.tile_uri;VF_IMG.decor.src=VF_ASSETS.decor_uri;VF_IMG.item.src=VF_ASSETS.item_uri;








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

vfAuto.id='vfAutoState';document.getElementById('canvasWrap').appendChild(vfAuto);


if(location.hash.includes('debug')){window.__MANRU_DEBUG__={
  get:()=>state,elementDamage61:(entity,elem,amount)=>resolveElementDamage57(entity,elem,amount,{ground:false}),tutorial60:()=>tutorialEntryAudit(),presentation58:()=>({busy:actionPresentationBusy58(),kind:ACTION_PRESENTATION58.kind,frame:(()=>{const f=actionFrame();return f?{source:f.source,target:f.target,t:f.t,hit:f.a.hit,weapon:f.a.weapon}:null})(),remaining:Math.max(0,ACTION_PRESENTATION58.until-performance.now())}),
  floor:(n)=>{if(!state)return false;state.floor=clamp(+n||1,1,25);NormalFloorGenerator.generate();resetVisualState();resetTurnState();startFloorTransition();updateAll();return true},
  inventory:()=>{if(!state)return false;state.player.inventory=[];for(const w of WEAPONS.slice(0,8)){const it=clone(w);it.type='weapon';addInventoryItem(it)}for(const a of ARMORS.slice(1,4)){const it=clone(a);it.type='armor';addInventoryItem(it)}for(const c of CLOAKS.slice(0,4)){const it=clone(c);it.type='cloak';addInventoryItem(it)}for(const f of CONSUMABLES.slice(0,4))addInventoryItem(clone(f));openInventory();return true},
  close:()=>{closeInventory();closeMartial();closeHelp();return true},
  settle:()=>{FX.transition=null;bossIntroTimer&&clearTimeout(bossIntroTimer);document.getElementById('bossIntro')?.classList.remove('show');drawMap();return true}
}}



  window.__manruZoomActive=false;
  window.__manruZoomSuppressUntil=0;





zoomHud.id='zoomHud';zoomHud.innerHTML='<button type="button" id="zoomOutBtn">－</button><span class="zoomVal" id="zoomVal">100%</span><button type="button" id="zoomInBtn">＋</button>';document.getElementById('canvasWrap').appendChild(zoomHud);zoomHud.querySelector('#zoomOutBtn').onclick=()=>adjustZoom(-1);zoomHud.querySelector('#zoomInBtn').onclick=()=>adjustZoom(1);

  C.addEventListener('click',e=>{if(performance.now()<window.__manruZoomSuppressUntil){e.preventDefault();e.stopImmediatePropagation()}}, {capture:true});
  
  /* r53: removed overwritten camera implementation. */
  
  updateZoomHud();
















  /* ----------------------- 48x48 terrain sprites ----------------------- */
  












  /* ----------------------- apply 48x48 renderers ----------------------- */
  /* r26: obsolete v3 world-item public renderer assignment removed; R7 is canonical. */
  

  /* ----------------------- per-item inventory artwork ----------------------- */
  /* r26: obsolete v3 inventory-icon public renderer assignment removed; R7 is canonical. */
  document.querySelectorAll('#classGrid .classBtn').forEach((b,i)=>{
    const cls=CLASSES[i];if(!cls)return;const fake={shape:'player'},old=b.querySelector('.vfClassPortrait');if(old)old.remove();const img=document.createElement('img');img.className='vfClassPortrait';const backup=state;try{if(!state)state={player:{classId:cls.id,weapon:null,armor:ARMORS[0],cloak:null}};else{state.player.classId=cls.id}img.src=hiCreature(fake,0,'down',true).toDataURL('image/png')}catch(error){ignoreError('class portrait preview is optional decoration',error)}finally{state=backup}b.appendChild(img);
  });



  // adaptive versions of layouts that need to fill the larger maps














  setGenerationBase('base-vaults38',generateFloorBaseVaults);

  /* ----------------------- more decor kinds / context placement ----------------------- */
  
  


  


  
  // r34: superseded inventory renderer removed; canonical renderer is registered below.

  

















  // One long-press implementation only. Calling again on the same node replaces the previous binding.

  // Use native click activation for touch, mouse and keyboard. Keep the sheet
  // present through pointerup so a touch's click cannot hit the control behind it.
  // IMPORTANT: internal modal controls are NEVER blocked by the ghost-click firewall.
  const oldClose=document.getElementById('inspectClose');
  if(oldClose){
    const c=oldClose.cloneNode(true);oldClose.replaceWith(c);
    const doClose=(e)=>{if(!inspectOpen())return;e.preventDefault?.();e.stopPropagation?.();e.stopImmediatePropagation?.();InputRouter.dispatch({type:'MODAL_CANCEL',source:'inspect-close'})};
    c.addEventListener('click',doClose);
  }
  const wrap=inspectWrap();
  if(wrap){
    wrap.setAttribute('aria-hidden',wrap.classList.contains('open')?'false':'true');
    wrap.addEventListener('pointerdown',()=>{if(DEBUG_BATTLE57.open)DEBUG_BATTLE57.inspectRelease57=null;},{capture:true});
    const closeBackdrop=(e)=>{
      const release=DEBUG_BATTLE57.open&&DEBUG_BATTLE57.inspectRelease57;
      if(release&&inputNow()<release.until&&(e.pointerId===release.id||!e.pointerId&&Math.hypot(e.clientX-release.x,e.clientY-release.y)<12)){DEBUG_BATTLE57.inspectRelease57=null;e.preventDefault();e.stopImmediatePropagation();return;}
      if(e.target!==wrap||!inspectOpen())return;e.preventDefault?.();e.stopPropagation?.();InputRouter.dispatch({type:'MODAL_CANCEL',source:'inspect-backdrop'})
    };
    wrap.addEventListener('click',closeBackdrop,{capture:true});
  }
  // Inventory inspect actions use the clean, non-duplicated item formatter.
  // r34: obsolete inventory-inspect wrapper removed; r53 post-stage owns inspect rebinding.

  // If a stale timer/old sheet survived load, start from a clean state.
  cancelLongPresses();document.body.classList.remove('manru-inspect-open');if(wrap&&!wrap.classList.contains('open'))wrap.setAttribute('aria-hidden','true');


/* ===== MANRU v3.6 INTERNAL POLISH: zoom fix / combat HUD / inventory / log / materials ===== */
const combatHud=document.createElement('div');combatHud.id='mfCombatHud';combatHud.innerHTML='<div class="mfCH good" id="mfState"><span class="k">STATE</span><span class="v">탐색</span><span class="s">주변이 잠잠하다</span></div><div class="mfCH" id="mfThreat"><span class="k">THREAT</span><span class="v">적 0</span><span class="s">인접 0</span></div><div class="mfCH" id="mfGround"><span class="k">GROUND</span><span class="v">빈 바닥</span><span class="s">상호작용 없음</span></div><div class="mfCH" id="mfAction"><span class="k">ACTION</span><span class="v">이동</span><span class="s">공격 1.0턴</span></div>';document.getElementById('canvasWrap')?.appendChild(combatHud);



  /* ---------- action button motif ---------- */
  const hk={attack:'SPC',pickup:'G',open:'E',skill:'Q',inv:'I',rest:'R',summon0:'V',summon1:'T'},rn={attack:'칼',pickup:'줍',open:'점멸',skill:'무',inv:'행',rest:'숨',summon0:'',summon1:''};function adorn(){document.querySelectorAll('#mobileControls .quickbar button').forEach(b=>{if(b.dataset.mf36)return;b.dataset.mf36='1';const a=b.dataset.act||'';b.insertAdjacentHTML('beforeend',`<span class="mfKey">${hk[a]||''}</span><span class="mfRune">${rn[a]??'◆'}</span>`)})}adorn();

  /* ---------- inventory ---------- */
  
  
  
  
  // r34: superseded inventory renderer removed; canonical renderer is registered below.

;;// r54: dead pre-v49 panel wrapper removed.

  /* ---------- combat FX ---------- */
  const feed=document.createElement('div');feed.id='mfHitFeed';document.getElementById('canvasWrap')?.appendChild(feed);/* r25: obsolete pre-v5.4 attack forwarding wrapper removed; v5.4 is the registered combat core. */

  /* ---------- material separation ---------- */




/* ===== MANRU v3.7/3.8 SMART INTERACTION + FEATURE ROOMS + POTIONS ===== */













  registerGenerationStage('feature-rooms41','post',()=>{applyFeatureRooms();VisibilityService.compute();vfBuildDecor()});


  for(const p of POTIONS)if(!CONSUMABLES.some(x=>x.name===p.name))CONSUMABLES.push(p);


ph.id='potionTargetHud';ph.innerHTML='<div><b id="potionTargetName">약병 투척</b><span id="potionTargetDesc">사거리 4칸 · 목표 칸을 터치/클릭</span></div><button id="potionTargetCancel">취소</button>';document.body.appendChild(ph);
ph.querySelector('#potionTargetCancel').onclick=e=>{e.preventDefault();e.stopPropagation();InputRouter.dispatch({type:'TARGET_CANCEL',source:'target-hud'})};
  /* r58 debuff overhaul: potion buffs are read by the canonical statusSummary; no status wrapper here. */
  



  // r30: potion dispatch is integrated in canonical useInventoryItem.
   // r34: obsolete potion-tab render wrapper removed.
  /* R7 refactor: obsolete early potion visual wrapper removed. */
  

  registerGenerationStage('potions41','post',()=>{pstate();state.tempFields=[];rewardRooms()});  
  
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

  registerGenerationStage('room-sculpt42','post',()=>{reshapeRooms();for(const fr of state.featureRooms||[])sculptFeature(fr);fixEntities();ensureNormalConnectivity();VisibilityService.compute();vfBuildDecor()});















  registerGenerationStage('organic-nooks43','post',()=>{organicNooks43();for(const fr of state.featureRooms||[])sculptSmallFeature43(fr);repair43()});


  // test helper exists only with #debug and lets us inspect special-room art without changing normal play.
  if(location.hash.includes('debug')&&window.__MANRU_DEBUG__){
    window.__MANRU_DEBUG__.teleportFeature=(i=0)=>{const f=state?.featureRooms?.[i];if(!f)return null;state.player.x=f.x+Math.floor(f.w/2);state.player.y=f.y+Math.floor(f.h/2);resetVisualState();VisibilityService.compute();updateAll();return f.name};
  }




  






  registerGenerationStage('room-structure44','post',()=>{structuralOrdinaryRooms44();repair44()});

RuntimeState.ui.inventory=UX;







  











  replaceViewerQuickButton('inv',()=>toggleInventory());
  replaceViewerQuickButton('skill',()=>useClassSkill());

  // mark real inventory / martial actions so closing the UI does not unexpectedly resume movement.
  // r30: modal-dirty item-use bookkeeping is integrated in canonical useInventoryItem.
  // r57: inventory/martial dirty state is set by the canonical action bodies.











  // replace the accumulated inventory implementations with one thumb-friendly renderer.


  ActionDispatcher.register('UNEQUIP',unequipAction5);

  ActionDispatcher.register('DROP_EQUIPPED',dropEquippedAction5);
  // don't rebuild a full-screen bag DOM when the bag is closed (pickup used to do this every time).

  // relaxed auto-move: explicit destination doesn't abort just because an already-known enemy or incidental item exists.
  


  // mobile drawer/map/inspect should block world controls but not eat their own buttons.
  /* r8: attack input blocking is handled in attackInputBlockedR8; no basicAttack wrapper. */



  const swipeModalCancel45=()=>InputRouter.dispatch({type:'MODAL_CANCEL',source:'modal-swipe'});
  swipeClose(document.getElementById('inventory'),swipeModalCancel45);
  swipeClose(document.getElementById('mobileDrawer'),swipeModalCancel45);
  swipeClose(document.getElementById('mobileInspect'),swipeModalCancel45);
  swipeClose(document.getElementById('mobileMapModal'),swipeModalCancel45);

  // performance: stop rebuilding closed drawer, throttle minimap, and avoid rendering the hidden world behind full-screen panels.
  // r53: drawer visibility guard is canonical in renderMobileDrawer.
  // r54: superseded minimap throttle removed; the canonical function owns throttling.
  





  RuntimeState.turn=TURN_AUDIT5;
  TurnEngine.register('monster-durations57',{post:()=>tickMonsterDurations()});
  TurnEngine.register('temporary-terrain57',{post:()=>RuntimeTerrainOwner.tick()});
  TurnEngine.register('jar-gas57',{post:()=>{tickJarGasFields();tickTerrainReactions105()}});

  document.body.classList.toggle('ux-modal-open',uiBlocking());




  P47.renderDpr=baseDpr();

  
  

  
  
  // r54: superseded minimap throttle removed.
  // r54: dead pre-v49 panel trim wrapper removed.
  /* removed overwritten updateAll */
  /* removed overwritten visualLoop */




  



  ActionDispatcher.register('UPGRADE_GEAR',upgradeGearAction5);

  // r30: upgrade-mark dispatch is integrated in canonical useInventoryItem.






  

  registerGenerationStage('strategy47','post',()=>applyStrategy());
  // r54: dead pre-v49 floor trait wrapper removed.




  registerGenerationStage('resource48','post',()=>{guaranteedResource48();P47.cullKey='';P47.decorKey='';P47.force=true});




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


  /* ---------- title / hero select: full-screen art, real mobile scrolling ---------- */








  drawTitleCanvas();
  addEventListener('resize',()=>{const c=document.getElementById('titleCanvas49');if(c&&c.dataset.mobile!==(innerWidth<700?'1':'0'))drawTitleCanvas()},{passive:true});



  enterBtn.onclick=showClassPick;classBackBtn.onclick=showStartGate;

  /* ---------- camera: default auto-follow, temporary look-pan, explicit free mode ---------- */





  
  
  
  MINIMAP_PIPELINE.before=force=>{const now=performance.now();if(!state)return false;if(!force&&!RENDER_PERF_STATE.miniDirty&&!mapOpen49()&&now-RENDER_PERF_STATE.lastMini<320)return false;RENDER_PERF_STATE.lastMini=now;RENDER_PERF_STATE.miniDirty=false;return true};




  updateMobileHud=function updateMobileHudCanonical55(){
    if(!state)return;const p=state.player,st=getStats(),side=!!state.artifactDungeon46,location58=hudLocation58(),boss=state.monsters.find(m=>m.boss&&m.hp>0);setText('mFloor',location58.floor);setText('mHp',`${displayHealth(p.hp)}/${displayHealth(p.maxHp)}`);setText('mFocus',`${displayNumber53(p.focus)}/${displayNumber53(st.maxFocus)}`);setText('mHunger',Math.round(p.hunger));
    const hpBlock=document.querySelector('#mobileHud .hp');if(hpBlock)hpBlock.style.setProperty('--hp',(clamp(100*p.hp/p.maxHp,0,100)*.72)+'%');
    const tag=document.getElementById('terrainTag');if(tag){tag.textContent=location58.challenge||location58.tag;tag.style.opacity=location58.challenge||['artifact','shop'].includes(location58.kind)?'.92':'0';tag.classList.toggle('withBoss58',!!boss)}
    const stock=ShopMapBuilder.groundAt(p.x,p.y),bed=dojoAdjacentBed(),anvil=citadelAdjacentAnvil(),pushable=adjacentPushable105(),silk=adjacentSilkTrap57(),gate=palaceGateNearby(),branch=adjacentBranchPortal105(),onStairs=p.x===state.stairs.x&&p.y===state.stairs.y,hasItem=state.items.some(it=>it.x===p.x&&it.y===p.y),onAltar=state.map[p.y]?.[p.x]===TT.ALTAR,context=document.getElementById('contextActionLabel'),contextBtn=document.getElementById('contextActionBtn');if(context)context.textContent=stock?'구매':dojoSleeping()?'잠듦':bed?'취침':silk?'함정해제':gate?'수문':branch?'출입':onStairs?'내려감':hasItem?'줍기':anvil?'장비 합성':pushable?'밀기':'상호작용';if(contextBtn){const actionable=!!stock||!!bed||!!silk||!!gate||!!branch||onStairs||hasItem||!!anvil||!!pushable||onAltar;contextBtn.classList.toggle('available',actionable);contextBtn.disabled=!actionable;const b=contextBtn.querySelector('b');if(b)b.textContent=stock?'買':bed?'眠':silk?'解':gate?'閥':branch?'入':onStairs?'↓':hasItem?'줍':anvil?'合':pushable?'推':'·'}
    document.querySelector('#mobileControls [data-act="open"]')?.classList.toggle('available',(p.blinkLevel||0)>0);document.querySelector('#mobileControls [data-act="skill"]')?.classList.toggle('available',p.skillPoints>0||Object.values(p.martial||{}).some(v=>v>0));
    const bh=document.getElementById('bossHud');if(bh){bh.classList.toggle('show',!!boss);if(boss){setText('bossName',boss.name);setWidth('bossFill',clamp(100*boss.hp/boss.maxHp,0,100)+'%')}}
    if(mapOpen49())syncLargeMinimap();
    if(isMobileViewport()){const enemy=state.monsters.some(isThreatVisibleToPlayer),show=(act,on)=>document.querySelector(`#mobileControls [data-act="${act}"]`)?.classList.toggle('ux54-hidden',!on);show('attack',true);show('pickup',true);show('inv',true);show('rest',true);show('open',(p.blinkLevel||0)>0);show('skill',p.skillPoints>0||Object.values(p.martial||{}).some(v=>v>0));document.querySelector('#mobileHud .mobileFocusBlock')?.classList.toggle('ux54-show',enemy||p.focus<st.maxFocus)}
    document.querySelectorAll('#mobileControls .actions.quickbar [data-act]').forEach(b=>b.setAttribute('aria-hidden','false'));if(hpBlock){const pct=Math.max(0,Math.min(100,(p.hp/Math.max(1,p.maxHp))*100));hpBlock.style.setProperty('--hp75',pct+'%')}
  };
  updatePanels=function(){
    if(!state)return;const p=state.player,st=getStats(),region=regionFor(state.floor),side=!!state.artifactDungeon46,location58=hudLocation58();
    setText('floorTxt',location58.desktop);setText('regionTxt',location58.kind==='branch'?location58.tag:side?'전설 던전':location58.kind==='rumor'?`소문 공간 · ${String(state.floor).padStart(2,'0')}층`:region[2]);setText('depthLore',location58.kind==='branch'?location58.full:side?location58.full:location58.kind==='rumor'?location58.full:region[3]);setText('hpTxt',`${displayHealth(p.hp)} / ${displayHealth(p.maxHp)}`);setWidth('hpFill',(100*p.hp/p.maxHp)+'%');setText('manaTxt',`${displayNumber53(p.focus)} / ${st.maxFocus}`);setWidth('manaFill',(100*p.focus/st.maxFocus)+'%');setText('xpTxt',p.level>=BALANCE.maxLevel?`LV ${p.level} · MAX · 무술 ${p.skillPoints}`:`LV ${p.level} · ${p.xp}/${p.nextXp} · 무술 ${p.skillPoints}`);setWidth('xpFill',(p.level>=BALANCE.maxLevel?100:Math.min(100,100*p.xp/Math.max(1,p.nextXp)))+'%');
    setText('atkTxt',st.atk);setText('defTxt',displayDef42(st.def));setText('evaTxt',st.eva);setText('wilTxt',st.will);setText('visTxt',st.vision);setText('weaponTxt',p.weapon?p.weapon.name:'맨손');setText('armorTxt',p.armor?p.armor.name:'경량복');setText('cloakTxt',p.cloak?p.cloak.name:'없음');setText('relicTxt',p.relic?p.relic.name:'없음');setText('trinketTxt',p.trinket?p.trinket.name:'없음');
    setHTML('skillTxt',`<b>무술</b> · 포인트 ${p.skillPoints}<br>${MARTIAL_RULES.ids.map(id=>`${martialPresentation(id,MARTIAL_INFO[id],p).name} ${p.martial[id]}/${martialCap(id,p)}`).join(' · ')} · 점멸 ${p.blinkLevel||0}<br><span style="color:#8f795f">공격비용 ${attackTurnCost().toFixed(1)}턴 · 사거리 ${weaponRange()}</span>`);setText('alertTxt',Math.round(p.hunger)+'%');setWidth('alertFill',Math.min(100,p.hunger)+'%');
    const visibleMonsters=state.monsters.filter(isThreatVisibleToPlayer);let near=null,nearDistance=Infinity;for(const mon of visibleMonsters){const distance=entityDistance57(mon,p);if(distance<nearDistance){near=mon;nearDistance=distance}};setHTML('monsterInfo',near?`<b style="color:${near.color}">${near.name}</b><br>HP ${displayHealth(near.hp)}/${displayHealth(near.maxHp)} · ATK ${near.atk} · DEF ${near.def} · EVA ${near.eva}${near.boss?'<br>구역 보스':''}`:'주변 생체 반응 없음.');setText('statusLine',`TURN ${state.turn} · ${p.combustion105?`연소 ${p.combustion105.remaining}턴 · `:''}${statusSummary()} · 허기 ${Math.round(p.hunger)}${p.hunger<=0?' (ATK -20%)':''}`);updateDebuffHud();setText('turnTxt',`${location58.challenge?location58.challenge+' · ':''}TURN ${state.turn} · 적 행동 ${Math.floor(state.enemyEnergy||0)}/${((state.enemyEnergy||0)%1).toFixed(2)}`);
    const logs=state.log.slice(0,10),sig=logs.join('\u0001');if(sig!==RENDER_PERF_STATE.lastLog){RENDER_PERF_STATE.lastLog=sig;const log=document.getElementById('messageLog');if(log)log.innerHTML=logs.map(x=>'<div>'+x+'</div>').join('')}
    setText('miniMonsters','적 '+visibleMonsters.length);setText('miniItems','아이템 '+state.items.filter(i=>VisibilityService.isVisible(i.x,i.y)).length);setText('miniCells',`턴 ${state.turn} · 무술 ${p.skillPoints}`);setText('miniThreat','허기 '+Math.round(p.hunger)+'%');
    const eqSig=[p.weapon?.name,p.armor?.name,p.cloak?.name,p.relic?.name,p.trinket?.name].join('|');if(eqSig!==RENDER_PERF_STATE.lastEquip){RENDER_PERF_STATE.lastEquip=eqSig;bindEquipInspect()}
    updateMobileHud();updateAttackButton();if(drawerOpen())renderMobileDrawer();RENDER_PERF_STATE.panelDirty=false;RENDER_PERF_STATE.lastPanel=performance.now();runPanelHooks();
  };
  /* removed overwritten updateAll */
  /* removed overwritten visualLoop */

  
  syncGameViewport();



/* ===== v5.1b lightweight mobile wall-face pass ===== */



/* ===== MANRU v5.2 BOW TARGETING + WORLD LONG-PRESS INSPECT ===== */
if(typeof window.modalBlocking49!=='function')window.modalBlocking49=()=>!gameplayInputAllowed57();

  

  


  
  






  





  
  

  registerGenerationStage('aim-reset52','pre',()=>{AIM_STATE.target=null;AIM_STATE.jar=null;state._manualTerrainTargetR8=null});



/* ===== MANRU v5.1 MOBILE PERFORMANCE HOTFIX ===== */








  // 요약은 수치만. 설명/능력을 섞지 않는다.

  const editable53=t=>!!t?.closest?.('input,textarea,[contenteditable="true"]');
  for(const type of ['selectstart','dragstart','copy','cut']){
    document.addEventListener(type,e=>{if(editable53(e.target))return;if(e.target?.closest?.('#app,#overlay,#game,canvas')){e.preventDefault();e.stopImmediatePropagation?.()}},{capture:true,passive:false});
  }
  document.addEventListener('contextmenu',e=>{if(editable53(e.target)||e.target?.closest?.('#game,#runtimeInput81'))return;if(e.target?.closest?.('#app,#overlay')){e.preventDefault();e.stopImmediatePropagation?.()}},{capture:true,passive:false});
  document.addEventListener('pointerdown',e=>{if(editable53(e.target))return;if(e.target?.closest?.('#game,canvas,img')){try{window.getSelection?.()?.removeAllRanges?.()}catch(error){ignoreError('getSelection unavailable',error)}}},{capture:true,passive:true});

  // 마지막 행낭 정보 버튼도 같은 formatter 사용.



  try{const s=localStorage.getItem('manruSfx54');if(s==='0')V54.sfx=false}catch(error){console.warn('[manru] sound setting not read',error)}

  const hold=document.createElement('div');hold.id='hold54';document.body.appendChild(hold);
  const rule=document.createElement('div');rule.id='bossRule54';document.getElementById('canvasWrap')?.appendChild(rule);





  document.addEventListener('pointerdown',()=>ac54(),{once:true,capture:true,passive:true});


  setPlayerAttackBaseR('combat54',attackPlayerCore54R);
  /* r15: boss knockback cap is handled by canonical knockMonster. */

  /* ---------- boss telegraph / phase system ---------- */
  
  
  
  
  
  
  
  
  
  
  
  
  
  

  


  /* ---------- death residue, directional damage feedback, boss mark renderer ---------- */
  
  

  /* ---------- terrain footsteps ---------- */

  /* ---------- feature room visual signatures ---------- */
  

  /* ---------- save/load/init compatibility ---------- */
  registerGenerationStage('boss-zones54-pre','pre',()=>{V54.marks=[];rule.classList.remove('show')});registerGenerationStage('boss-zones54-post','post',()=>{state.bossZones54=[];for(const m of state.monsters||[])normalizeBoss(m)});

  // InputRouter owns the physical shortcut; this API remains the existing sound-setting owner.
















  for(const t of TALISMANS)if(!CONSUMABLES.some(i=>i.name===t.name))CONSUMABLES.push(t);










  





  















  if(window.__MANRU_CLEAN_INSPECT53)window.__MANRU_CLEAN_INSPECT53.item=inspectHTML56;

targetHud.id='talismanTarget56';targetHud.innerHTML='<div><b id="talismanTargetTitle">부적 목표</b><span id="talismanTargetText">목표 칸을 터치/클릭</span></div><button id="talismanCancel56">취소</button>';document.body.appendChild(targetHud);





  inventoryFiltered=function inventoryFilteredCanonical(){
    const all=state.player.inventory.map((item,idx)=>({item,idx}));
    const tab=inventoryTab,role=tab==='gear'?'gear':['recovery','food'].includes(tab)?'recovery':['strategy','potion'].includes(tab)?'strategy':['relic','treasure'].includes(tab)?'relic':null;
    const rows=role?all.filter(v=>role56(v.item)===role):all;
    const order={weapon:0,armor:1,cloak:2,upgrade:3,talisman:4,potion:5,food:6,relic:7,trinket:8};
    rows.sort((a,b)=>(order[a.item.type]??9)-(order[b.item.type]??9)||((b.item.tier||0)-(a.item.tier||0))||publicName56(a.item).localeCompare(publicName56(b.item),'ko'));
    // Keep the established order: ingredients follow recovery items; ammo follows strategy items.
    const extra=role==='recovery'?'ingredient':tab==='strategy'?'ammo':null;
    if(extra){const present=new Set(rows.map(v=>v.idx));for(const v of all)if(v.item.type===extra&&v.item.mineItem105!=='stone'&&!present.has(v.idx))rows.push(v)}
    if(tab==='strategy')rows.sort((a,b)=>(a.item.type==='ammo'?1:0)-(b.item.type==='ammo'?1:0)||a.item.name.localeCompare(b.item.name,'ko'));
    return rows;
  };

















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

  


  registerGenerationStage('knowledge56','post',()=>onFloorGenerated56());
  
  globalThis.__MANRU_CONSUMABLE56_ACTIONS__=Object.freeze({initializeKnowledge:ensureKnowledge56,knownPotion:isPotionKnownByPlayer,knownTalisman:knownTalisman56,publicName:publicName56,target:()=>!!V56.target,castTarget:(x,y)=>castTalisman56(x,y),cancelTarget:()=>{cancelTalismanTarget(true);return true},useTalisman:item=>{if(!item||item.type!=='talisman')return false;if(item.targeted){beginTalismanTarget(item);return true}return !!useInstantTalisman56(item)}});


  if(state){ensureKnowledge56();decorateAllItems56()}


RuntimeState.ui.food=V57;











// PDF 포만감 규칙: 허기 0에서만 공격력 20% 감소. 기존 단계별 ATK/EVA 패널티는 제거.

/* r58 debuff overhaul: food buffs are read by the canonical statusSummary; no status wrapper here. */



globalThis.__MANRU_TURN_PIPELINE__.register('food57',{pre:ctx=>{ctx.food57={turn:state?.turn??0,focus:state?.player?.focus??0}},post:ctx=>{const b=ctx.food57||{};if(state&&!state.dead&&state.turn!==b.turn&&state.turn%10===0&&state.player.hunger<=0){const raw=(playerCloak().focusRegen||1)>=2?2:1,gained=Math.max(0,state.player.focus-(b.focus??state.player.focus));state.player.focus=Math.max(0,state.player.focus-Math.min(gained,raw*.5));if(typeof updatePanels==='function')updatePanels()}}});




// 몬스터 초안 행동 보강
// Movement behavior is canonical in moveMonsterToward.


registerMonsterAttackStageR25('food-ai57',(next,mon,bonus=0,context={},...rest)=>{const ctx=monsterAttackContextR(context);ensureFoodState();if(mon?.drunk57||mon?.drunk>0){const drunk=drunkAttackOutcome();if(drunk==='whiff'){floatText(mon.x,mon.y,'비틀','#c4a87c',10);addLog(`${mon.name}이 비틀거리며 공격을 허공에 휘둘렀다.`);return monsterAttackResultR(mon,ctx,{hit:false,reason:'drunk-whiff'})}if(drunk==='heavy')bonus+=DRUNK_RULES.attackHeavyBonus}const r=next(mon,bonus,ctx,...rest);if(r?.hit&&mon?.thiefRetreat57&&!state.dead)retreatMonster(mon,ctx.target||state.player);return r});
registerPlayerAttackStageR('guard-fire57',(next,mon,...args)=>{const hp0=mon?.hp??0,r=next(mon,...args);ensureFoodState();if(mon&&mon.hp>0&&mon.hp<hp0&&state.status.fireCoat57>0&&globalThis.__MANRU_RANDOM57__()<.12){emitElementContact105('fire',entityFootprintCells57(mon),effectSource57(state.player));const dealt=damageEntity(mon,2,state.player,'fire');if(dealt>0)floatText(mon.x,mon.y,'화염 -'+dealt,'#ff9c55',11,'fire');if(mon.hp<=0)killMonster(mon)}return r});
/* v9.8.6 inspect cleanup: removed legacy concept57 prose-append wrapper. */

// 새 명칭이 기존 고해상도 아틀라스를 재사용하도록 시각 별칭을 지정한다.
if(typeof VF_ASSETS==='object'&&VF_ASSETS.creature_meta){const a=VF_ASSETS.creature_meta,m={'취객':'윈도','시종':'윈도','객잔 경비병':'수비병','떠돌이 도둑':'윈도','정원사 망령':'강시','독꽃':'가시 덩굴','검은 뱀':'그림자 살모사','먹물 정령':'먹물 개구리','수목 궁수':'수비병','정원 바위괴물':'돌 거북','식인 물고기':'피라냐','수은 물고기':'피라냐'};for(const [n,o] of Object.entries(m))if(!a[n]&&a[o])a[n]=a[o]}

foodTargetPanel.id='foodTarget57';foodTargetPanel.innerHTML='<div><b id="foodTargetName57">독버섯 꼬치 투척</b><small>사거리 4칸 · 먹일 요괴를 터치</small></div><button id="foodTargetCancel57">취소</button>';document.body.appendChild(foodTargetPanel);



foodTargetPanel.querySelector('#foodTargetCancel57').onclick=e=>{e.preventDefault();e.stopPropagation();InputRouter.dispatch({type:'TARGET_CANCEL',source:'target-hud'})};


cookingPanel.id='cook57';cookingPanel.innerHTML=`<div class="cookSheet57"><span class="uiCorners63" aria-hidden="true"></span><div class="cookHead57"><div><h2>비방 조리</h2><small id="cookStation57">솥에서 재료를 실험한다.</small></div><button class="uxClose" id="cookClose57" aria-label="닫기">×</button></div><div class="cookPreview57" id="cookPreview57">재료를 최대 ${COOKING_INGREDIENT_LIMIT57}종 고르시오.</div><div class="cookBody57"><div class="cookInv57" id="cookInv57"></div><section class="cookBook57"><h3>조리 도감</h3><div id="cookBookList57"></div></section></div><div class="cookFoot57"><button id="cookClear57">선택 해제</button><button class="primary" id="cookDo57">조리</button></div></div>`;document.body.appendChild(cookingPanel);











ActionDispatcher.register('COOK',cookSelected);
cookingPanel.querySelector('#cookClose57').onclick=e=>{e.preventDefault();e.stopPropagation();closeCooking()};cookingPanel.querySelector('#cookClear57').onclick=()=>{V57.selected.clear();renderCooking()};cookingPanel.querySelector('#cookDo57').onclick=ActionDispatcher.handleEvent;

// 조리 중 월드 입력 차단 및 솥/화로 상호작용

/* r8: basicAttack reads ux-modal-open directly. */


// 획득 구조: 주방, 샘, 피라냐, 복숭아나무 + 설계 공백을 메운 빙결액 배치
window.MANRU_FOOD57.rumorHint=()=>{ensureFoodState();const unknown=FOOD_RECIPES.filter(v=>!state.cookbook57[v.id]);if(unknown.length&&globalThis.__MANRU_RANDOM57__()<.40){const rec=choice(unknown);state.cookbook57[rec.id]=true;addLog(`찢어진 조리서 · ${rec.name}: ${rec.ingredients.join(' + ')}.`);return rec.id}return null};





registerGenerationStage('food57','post',()=>{ensureFoodState();foodFloorRewards57()});



// 인벤토리 분류와 버튼 문구




if(state)ensureFoodState();

/* ===== MANRU v5.8: PERFORMANCE / DENSITY / KOREAN UI HOTFIX ===== */

  // ---- mobile pad toggle
  let pad58=document.getElementById('padToggle58');
  if(!pad58){pad58=document.createElement('button');pad58.id='padToggle58';pad58.type='button';pad58.textContent='십';document.body.appendChild(pad58)}
  try{if(localStorage.getItem('manruPad58')==='0')document.body.classList.add('pad58-hidden')}catch(error){ignoreError('pad visibility unreadable',error)}
  pad58.onclick=e=>{e.preventDefault();e.stopPropagation();document.body.classList.toggle('pad58-hidden');try{localStorage.setItem('manruPad58',document.body.classList.contains('pad58-hidden')?'0':'1')}catch(error){ignoreError('pad visibility could not be saved',error)}};






  registerGenerationStage('canon58','post',()=>{normalizeKitchens58();ensureCanonExtras58();ensureNormalConnectivity();VisibilityService.compute();vfBuildDecor()});




  





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
  registerGenerationStage('guard59-pre','pre',()=>{state.guardRooms59=[];state.layoutMode59=null});
  registerGenerationStage('guard59-post','post',()=>{guardedRooms59();inferCorridors59();doorAudit59();VisibilityService.compute();vfBuildDecor()});




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







  


















































  registerGenerationStage('special60-pre','pre',()=>{state.featureRooms=[];state.landmarks=[];state.guardRooms59=[];state.hiddenGroups60={};state.hiddenLookup60={};state.hiddenBase60={};state.hiddenReplacement60={};state.crumbleBase60={}});
  registerGenerationStage('special60-post','post',()=>{const f=state.floor;if(SPECIAL60.has(f)||BOSS_FLOORS.has(f))rebuildSpecial60(f)});
  // r53: removed generation-on-load stage special60; saved geometry is authoritative.



  /* ---------- test/screenshot hooks ---------- */

/* r53: removed the overwritten v6.0 overview camera. */
/* ===== MANRU v6.1: ENEMY DENSITY / TACTICAL ROLES / SMART STRUCTURE INPUT ===== */
const spawnRanges61=[[1,1,9,9],[2,5,8,11],[6,10,10,13],[11,15,11,14],[16,20,13,16],[21,24,14,18]];
  for(const r of SPAWN_RULES){const q=spawnRanges61.find(v=>r.from===v[0]&&r.to===v[1]);if(q)r.count=[q[2],q[3]]}
  Object.assign(SPECIAL_BASE_COUNTS,{2:10,4:11,6:12,8:12,11:13,13:14,16:13,18:14,20:9,21:13,22:15,23:14,24:12});






















  



  // Shell / formation defense is owned by combatDefenseBonus57 in both native attack bases.
  registerPlayerAttackStageR('asura-domain61',(next,m,b=0,...rest)=>{configureMonsterTraits(m);if(m?.role61==='asura'&&(m.asuraZone61||0)>0&&asuraDomainDist61(state.player,m)>(m.asuraRadius61||m.asuraRadius47||3)+.28){setPlayerAttackOutcome('blocked',m,{reason:'asura-domain'});m.alerted=true;floatText(m.x,m.y,'영역 밖 공격 무효','#d7b16e',9);addLog(`${m.name}의 아수라장이 영역 밖에서 시작된 직접 공격을 지웠다.`);return false}return next(m,b,...rest)});


  /* ---------- structure interaction: click/tap paths next to a blocked target, then opens or destroys it ---------- */
  const BREAK61=new Set([TT.TABLE,TT.SCREEN,TT.HEDGE,TT.BAMBOO,TT.FAKE_DOOR,TT.SECRET_DOOR,TT.LOCKED_GATE,TT.PEACH_TREE,TT.HIDDEN_BRIDGE,TT.HIDDEN_WALL]);




  globalThis.__MANRU_DRAW_HOOKS_R19__?.world.push({id:'role61',draw:drawRoleOverlay});
  /* v9.8.6 inspect cleanup: removed legacy tactical-role prose-append wrapper. */


  registerGenerationStage('population61','post',()=>{if(!state)return;const hasBoss=state.monsters.some(m=>m.boss);if(!hasBoss)populate61();if(!hasBoss||state.floor===20){for(const m of state.monsters)configureMonsterTraits(m);VisibilityService.compute();vfBuildDecor();trimDecor61()}});




  

/* removed overwritten visualLoop */




  const feelEl=document.createElement('div');feelEl.id='floorFeeling62';document.getElementById('canvasWrap')?.appendChild(feelEl);
belt.id='tacticalBelt62';document.getElementById('canvasWrap')?.appendChild(belt);




















  registerGenerationStage('feeling62','post',()=>{if(state&&!state.monsters.some(m=>m.boss)){applyFeeling();applyMiniVault62();VisibilityService.compute();vfBuildDecor()}});













  globalThis.__MANRU_DRAW_HOOKS_R19__?.post.push({id:'feeling62',draw:drawFeelingOverlay});







  RC.storagePersistent=(()=>{const k='__manru_probe70';try{localStorage.setItem(k,'1');localStorage.removeItem(k);return true}catch(_){return false}})();
  try{RC.uiVolume=Math.max(0,Math.min(1,+(lsGet('manruUiVolume70')??.35)))}catch(error){ignoreError('ui volume unreadable',error)}


  applyTextScale(lsGet('manruUiTextScale70')??1);

  /* ---------- final release UI ---------- */

  const panel=document.createElement('div');panel.id='releasePanel70';panel.innerHTML=`
    <div class="rc70Sheet">
      <div class="rc70Head"><div><b>만루 · 출시 후보 관리</b><small>${RC.build} · 세이브 / 조작 / 진단 <span id="rcStorage70"></span></small></div><button class="uxClose" id="rcClose70" aria-label="닫기">×</button></div>
      <div class="rc70Body">
        <section class="rc70Section"><h3>세이브 슬롯</h3><div id="rcSlots70" class="rc70Grid"></div></section>
        <section class="rc70Section"><h3>백업 / 이동</h3><div class="rc70Row"><button id="rcExport70">세이브 내보내기</button><button id="rcImport70">세이브 가져오기</button><input id="rcImportFile70" type="file" accept=".json,application/json" hidden><button id="rcLoadAuto70">자동저장 불러오기</button></div></section>
        <section class="rc70Section"><h3>조작 · 사운드</h3><div class="rc70Row"><button id="rcSfx70">게임 효과음</button><button id="rcHaptic70" aria-pressed="true">진동 ON</button><label>UI 효과음 <input id="rcUiVol70" type="range" min="0" max="1" step=".05"></label><button id="rcTutorial70">튜토리얼 다시 보기</button><label for="rcTextScale70">글씨 크기</label><select id="rcTextScale70" aria-label="글씨 크기"><option value="1">기본 — 100%</option><option value="1.15">크게 — 115%</option><option value="1.3">더 크게 — 130%</option><option value="1.45">매우 크게 — 145%</option></select></div></section>
        <section class="rc70Section"><h3>출시 진단</h3><div class="rc70Row"><button id="rcQuickAudit70">현재 층 검사</button><button id="rcPerf70">렌더 20회 측정</button></div><div id="rcDiag70" class="rc70Diag">대기 중</div></section>
      </div>
    </div>`;
  document.body.appendChild(panel);
  const coach=document.createElement('div');coach.id='coach70';coach.setAttribute('role','dialog');coach.setAttribute('aria-modal','true');coach.setAttribute('aria-labelledby','coachTitle58');coach.setAttribute('aria-describedby','coachText58');document.body.appendChild(coach);coach.addEventListener('keydown',e=>{if(e.key==='Tab'){const buttons=[...coach.querySelectorAll('button')],i=buttons.indexOf(document.activeElement);e.preventDefault();buttons[(i+(e.shiftKey?-1:1)+buttons.length)%buttons.length]?.focus()}if(e.key==='Escape'){e.preventDefault();closeCurrentTip()}});
  const releaseStamp=document.createElement('div');releaseStamp.id='releaseStamp70';releaseStamp.textContent=RELEASE_INFO.stamp;document.getElementById('canvasWrap')?.appendChild(releaseStamp);
  const mb=document.querySelector('#mobileHud .mButtons');
  const releaseGearButton=document.createElement('button');releaseGearButton.id='releaseGear70';releaseGearButton.type='button';releaseGearButton.textContent='설정';releaseGearButton.setAttribute('aria-label','설정');mb?.appendChild(releaseGearButton);
  const dg=document.createElement('button');dg.id='releaseGearDesktop70';dg.type='button';dg.textContent='設';dg.setAttribute('aria-label','설정');document.body.appendChild(dg);


  panel.addEventListener('pointerup',e=>{if(e.target.closest('button'))uiTone70(410,.025)},{passive:true});




  





  









  /* ---------- release panel owner (physical routing is canonical in InputRouter) ---------- */
  RuntimeState.ui.release=RC;


  releaseGearButton.onclick=()=>InputRouter.dispatch({type:'TOGGLE_RELEASE',source:'release-hud'});dg.onclick=()=>InputRouter.dispatch({type:'TOGGLE_RELEASE',source:'release-hud'});document.getElementById('rcClose70').onclick=()=>InputRouter.dispatch({type:'MODAL_CANCEL',source:'release-panel'});
  panel.addEventListener('pointerdown',e=>{if(e.target===panel)InputRouter.dispatch({type:'MODAL_CANCEL',source:'release-backdrop'})},{passive:true});

  /* ---------- 8-way movement parity (mobile & PC) ---------- */
  const corners=[[-1,-1,'↖'],[1,-1,'↗'],[-1,1,'↙'],[1,1,'↘']];
  const ghost=[...document.querySelectorAll('#mobileControls .pad .ghost')];
  ghost.slice(0,4).forEach((b,i)=>{
    const [dx,dy,g]=corners[i];const n=b.cloneNode(false);n.className='';n.textContent=g;n.dataset.diag70=`${dx},${dy}`;b.replaceWith(n);
  });



  /* ---------- input camera = immutable last rendered CameraProjection12 snapshot ---------- */


  /* ---------- retained structure hit testing (Runtime81 automation owns selection) ---------- */









  


  // r30: runtime item coaching/activity bookkeeping is integrated in canonical useInventoryItem.





  /* ---------- resource pacing / consumable strategy ---------- */








  registerGenerationStage('pacing70','post',()=>{pacing70();state.repairedMonsters70=repairMonsters70();VisibilityService.compute()});

  /* ---------- autosave hooks (idle, not every turn) ---------- */
  globalThis.__MANRU_TURN_PIPELINE__.register('runtime70',{pre:()=>{RC.lastActionAt=performance.now()},post:()=>{if(state){coachContext();if(state.log?.length>48)state.log=state.log.slice(0,48);if(state.decals?.length>24)state.decals.splice(0,state.decals.length-24);if(state.tempFields?.length>24)state.tempFields.splice(0,state.tempFields.length-24)}}});

  /* ---------- boss visual signature: one cheap pass only ---------- */
  


  visualLoop=function(now=performance.now()){
    try{
    if(!state?.debugBattle57)advanceHeldInput(now);
    if(!document.hidden&&!window.__MANRU_PAUSE_RENDER61){
      const w=innerWidth,h=innerHeight;
      if(document.body.dataset.manruScreen==='title'){
        if(document.body.classList.contains('title-class-mode'))paintClassLighting(now);
        else paintTitleLights(now);
      }
      if(!state?.debugBattle57&&(w!==RC.vw||h!==RC.vh||now-RC.lastViewport>900)){RC.vw=w;RC.vh=h;RC.lastViewport=now;syncGameViewport()}
      if(state?.debugBattle57)debugBattleFrame57(now);
      if(state&&!state.debugBattle57){
        dojoSleepFrame(now);updateVisualMotion(now);
        const active=active70(),budget=active?(state.branchContext105?33:16):(now-hearthAnimationSeen105<400?(isMobileViewport()?90:66):(isMobileViewport()?230:130)),pending=renderUpdatePending;
        if(pending||cameraRenderPending||now-RC.lastDraw>=budget){
          const t=performance.now();if(pending)updateAll(true);else drawMap(false);const cost=performance.now()-t;RC.perf.lastCost=cost;RC.perf.frames++;RC.perf.ema+= (cost-RC.perf.ema)/Math.min(120,RC.perf.frames);RC.lastDraw=now;
        }
        if(mapModalOpen()&&now-RC.lastMini>180){drawMinimap(true);RC.lastMini=now}
        if(now-RC.lastHud>120){updateAttackButton();RC.lastHud=now}
      }
    }
    }catch(error){
      if(!RC.renderRecoveryAt||now-RC.renderRecoveryAt>1000){
        RC.renderRecoveryAt=now;console.error('[MANRU frame recovery]',error);
        globalThis.__MANRU_RESUME_R6__?.schedule?.('frame-error',0);
      }
    }finally{requestAnimationFrame(visualLoop)}
  };


  function audit70(){
    if(!state)return{ok:false,error:'게임 미시작'};
    const invalidMon=(state.monsters||[]).filter(m=>m.x<0||m.y<0||m.x>=COLS||m.y>=ROWS||!PlacementService.monsterCanStand(m,m.x,m.y));
    const invalidItems=(state.items||[]).filter(i=>i.x<0||i.y<0||i.x>=COLS||i.y>=ROWS);
    const doors=state.map.flat().filter(t=>t===TT.DOOR).length;
    const result={ok:!invalidMon.length&&!invalidItems.length,floor:state.floor,turn:state.turn,size:[COLS,ROWS],layout:state.layoutName,monsters:state.monsters.length,items:state.items.length,doors,reachable:state.specialFloor?'기믹층':reachable70(),invalidMonsters:invalidMon.length,invalidItems:invalidItems.length,renderEma:+RC.perf.ema.toFixed(2),repairedMonsters:state.repairedMonsters70||0};
    return result;
  }
  function bench70(n=20){const t=performance.now();for(let i=0;i<n;i++)drawMap(true);return+(performance.now()-t).toFixed(2)}
  document.getElementById('rcQuickAudit70').onclick=()=>{document.getElementById('rcDiag70').textContent=JSON.stringify(audit70(),null,2)};
  document.getElementById('rcPerf70').onclick=()=>{const total=bench70(20);document.getElementById('rcDiag70').textContent=`20회 강제 렌더 ${total}ms\n평균 ${(total/20).toFixed(2)}ms\nEMA ${RC.perf.ema.toFixed(2)}ms\nDPR ${VIEW.dpr}`};



  document.getElementById('rcSfx70').onclick=()=>{document.dispatchEvent(new KeyboardEvent('keydown',{key:'m',bubbles:true}));refreshSfx()};
  document.getElementById('rcHaptic70').onclick=()=>{const on=setVibrationEnabled(!vibrationEnabled());refreshSfx();if(on)vfVibrate(HAPTIC_PATTERN57.toggle);toast(`진동 ${on?'켜짐':'꺼짐'}.`)};
  document.getElementById('rcUiVol70').closest('.rc70Row').oninput=e=>{if(e.target.id==='rcTextScale70'){e.stopPropagation();applyTextScale(e.target.value,true);return}if(e.target.id==='rcUiVol70'){RC.uiVolume=+e.target.value;try{lsSet('manruUiVolume70',String(RC.uiVolume))}catch(error){ignoreError('ui volume could not be saved',error)}}};
  const textScaleControl=document.getElementById('rcTextScale70');textScaleControl.value=String(RC.textScale);
  document.getElementById('rcTutorial70').onclick=resetTips70;
  document.getElementById('rcExport70').onclick=exportSaveFile;
  document.getElementById('rcImport70').onclick=()=>document.getElementById('rcImportFile70').click();
  document.getElementById('rcImportFile70').onchange=e=>importFile(e.target.files?.[0]);
  document.getElementById('rcLoadAuto70').onclick=()=>loadRaw(lsGet(AUTO_KEY),'자동저장');


    
  refreshSlots();refreshSfx();refreshStorageStatus();

  window.__MANRU_RELEASE__={
    openPanel:openReleasePanel,closePanel:closeReleasePanel,markAction:()=>{RC.lastActionAt=performance.now();return RC.lastActionAt},tip:tip70,floorTutorial:showFloorTips,closeTip:closeCurrentTip,suspendTip:suspendTips,entryTutorial:advanceEntryTutorial,closePanel:closeReleasePanel
  };





  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){clearTimeout(resumeTimer71);if(fullscreenWanted66)fullscreenResume66=true;return}
    scheduleResume71('visible',35);
  },true);
  window.addEventListener('pageshow',()=>{
    scheduleResume71('pageshow',0);
  },{passive:true});
  window.addEventListener('focus',()=>scheduleResume71('focus',65),{passive:true});
  window.addEventListener('orientationchange',()=>scheduleResume71('orientation',100),{passive:true});
  document.addEventListener('fullscreenchange',()=>scheduleResume71('fullscreen',80),{passive:true});
  for(const canvas of [C,MC]){
    canvas?.addEventListener?.('contextlost',e=>{e.preventDefault();clearHeldInput53();cancelAutoWalk()});
    canvas?.addEventListener?.('contextrestored',()=>scheduleResume71('canvas-contextrestored',0),{passive:true});
  }


  





























  






  registerGenerationStage('region71-pre','pre',()=>{state.landmarks71=[];state.landmarkCells71={};state.regionComplex71=null});
  registerGenerationStage('region71-post','post',()=>{enhanceNormal71();enhanceSpecial71();ensureNormalConnectivity();repairEntities71();VisibilityService.compute();vfBuildDecor();;});

/* ===== MANRU v7.3: WALL APPROACH / 8-WAY AUTOPATH / DELAYED HOLD RING ===== */




















  function public74(item){if(!item)return'';if(item.branchExclusive105||item.fusion74)return item.name;return window.__MANRU_TALISMAN_PUBLIC__?.name?.(item)||item.name}
  






  











fusion.id='fusion74';fusion.innerHTML='<div class="f74sheet"><span class="uiCorners63" aria-hidden="true"></span><div class="f74head"><div><b>부적 합성</b><small>감정된 기본 부적 2장을 태워 제어된 고급 부적으로 만든다.</small></div><button class="uxClose" data-f74close aria-label="닫기">×</button></div><div id="fusion74body"></div></div>';document.body.appendChild(fusion);
  const gearInfusionPanel=document.createElement('div');gearInfusionPanel.id='gear74';gearInfusionPanel.innerHTML='<div class="f74sheet"><span class="uiCorners63" aria-hidden="true"></span><div class="f74head"><div><b id="gear74title">장비 선택</b><small id="gear74sub">적용할 장비를 고른다.</small></div><button class="uxClose" data-g74close aria-label="닫기">×</button></div><div id="gear74body"></div></div>';document.body.appendChild(gearInfusionPanel);
  fusion.querySelector('[data-f74close]').onclick=()=>closeFusion();gearInfusionPanel.querySelector('[data-g74close]').onclick=()=>closeGear();






ActionDispatcher.register('FUSE',fuse74);






ActionDispatcher.register('GEAR_APPLY',applyGear);











  /* equipment effects */
  /* r15: earth stagger guard is handled by canonical applyKnockback. */
  registerPlayerAttackStageR('element-brand74',(next,mon,b=0,...rest)=>{const before=mon?.hp??0,contact=mon?entityFootprintCells57(mon):[],r=next(mon,b,...rest);if(mon&&mon.hp<before)applyWeaponBrandHit(state.player,mon,before-mon.hp,contact);return r});

  globalThis.__MANRU_TURN_PIPELINE__.register('elements74',{pre:()=>ensure74(),post:()=>{if(!state||state.dead||state.victory)return;if(state.player.armor?.elementGuard74==='grass')state.status.poison=0;if(state.player.armor?.elementGuard74==='water'&&state.turn%2===0){state.status.poison=Math.max(0,(state.status.poison||0)-1);state.status.bleed=Math.max(0,(state.status.bleed||0)-1)}tickElementFields57();if(state.elementWard74){state.elementWard74.ttl--;if(state.elementWard74.ttl<=0)state.elementWard74=null}VisibilityService.compute();updateAll()}});
  // Blindness duration belongs to tickMonsterCombatStatuses57 for both game and arena.

  /* inventory dispatch + visible marks */
  // r30: v7.4 talisman-family dispatch is integrated in canonical useInventoryItem.
  targetHud74()?.querySelector('#talismanCancel56')?.addEventListener('click',e=>{if(!V74.target)return;e.preventDefault();e.stopImmediatePropagation();InputRouter.dispatch({type:'TARGET_CANCEL',source:'target-hud'})},{capture:true});

  globalThis.__MANRU_DRAW_HOOKS_R19__?.post.push({id:'element74',draw:drawElementOverlay});

  registerGenerationStage('talisman74','post',()=>{ensure74();state.tempTerrain74=[];state.elementFields74=[]});
    
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




  



  registerGenerationStage('polish78','post',()=>{polish78();VisibilityService.compute()});





  RuntimeState.input.device=Runtime81;

  
  



  









  const Automation81={
    valid:q=>Auto81.valid(q),
    go:q=>Auto81.go(q),
    explore:()=>Auto81.explore(false),
    pickup:()=>Auto81.pickupAll(),
    state:()=>Auto81.state(),
    presentationRate:()=>Auto81.active?AUTO_MOVE_RATE70:1
  };

  /* Auto-pickup is permanent. A movement also exits temporary camera inspection. */






  














  /* Reapply after start/load without adding switches or changing user policy. */
  registerGenerationStage('runtime81','post',()=>{Integrity81.repair();ConnectedDecor81.build();queuePlace81()});
    
  addEventListener('pointerup',stopHeldInput,{passive:true});addEventListener('pointercancel',stopHeldInput,{passive:true});addEventListener('blur',stopHeldInput,{passive:true});document.addEventListener('visibilitychange',()=>{if(document.hidden)stopHeldInput()},{passive:true});

  cleanViewportUI();makeInput();rebindControls();ConnectedDecor81.build();CameraController.resume(false);

  
  
  
  
  
  
  

  window.__MANRU_RUNTIME81__={state:Runtime81,Automation81,Camera81:CameraController,Zoom81:ZoomController,ConnectedDecor81,Integrity81,inspect:inspectTile81,stopHeld:stopHeldInput};



  const V85={version:'v9.6.5-martial-stealth-fx',recent:[],samples:[]};






  // Perfume River walls are stone mountain / gorge walls, not purple room walls.



  
  
  
  
  
  
  
  
  
  
  

  
  
  
  

  
  
  
  
  
  

  
  
  
  
  
  
  
  
  /* ===== v8.7: NetHack-5.0-inspired themed geometry modules =====
     Geometry and regional furnishing are deliberately separated: room shape first,
     then a region-specific fill. No U-shaped fake rooms; each module is a real
     room/corridor topology with controlled local alternatives. */
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  












  
  registerGenerationStage('architecture85','post',finishArchitecture90);
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


























  




  buildNormal=function(m,z){state.fixedStart=null;state.fixedExit=null;state.routeTags=[];state.featureRooms=[];state.layoutMode85=null;state.themedRooms87=[];state.__arch93=++V93.serial;graphOrganic93(m,z);state.layoutName=['청풍루','수묵원','유혹의 내실','지하 장고','만루의 심장'][z]+' · '+state.layoutName;};










  

  /* ===== MANRU v9.4: KEY TRIALS / PURPOSEFUL LOOT / NATURAL RECOVERY / VISUAL STABILITY ===== */
  





  // Restore visually stable rendering during camera pan. RAF-coalesced camera movement stays, but map textures no longer switch quality modes.
  
  

  // Natural recovery replaces explicit Rest. Hunger controls the very slow recovery interval; combat/status suppresses it.
  function naturalInterval94(){const h=state?.player?.hunger??0;return h>=90?16:h>=65?22:h>=40?30:h>=20?42:Infinity}

  globalThis.__MANRU_TURN_PIPELINE__.register('natural-heal94',{post:ctx=>{
    if(!ctx.playerAgency||!state||state.dead||state.victory)return;const p=state.player;
    if(p.hp>=p.maxHp){state.earlyRecoveryProgress58=0;return}
    const elapsed=(state.playerAgencyTurns57||0)-(state.lastDamageAgencyTurn57||0);let heal=0;
    if(state.passiveRecoveryUnlocked57){if(p.hunger>0&&elapsed>=6){const ratio=p.hp/p.maxHp,spacing=ratio<.5?1:ratio<.75?2:ratio<.9?3:4,start=elapsed>=24?24:elapsed>=16?16:elapsed>=11?11:6,interval=(elapsed>=16?1:elapsed>=11?2:3)*spacing;if((elapsed-start)%interval===0)heal=elapsed>=24?2:1}}
    else if(safeForNatural94()){const iv=naturalInterval94();if(Number.isFinite(iv)){state.earlyRecoveryProgress58=(Number(state.earlyRecoveryProgress58)||0)+(state.floor<=10?1.5:1)/iv;if(state.earlyRecoveryProgress58>=1-1e-9){heal=Math.floor(state.earlyRecoveryProgress58+1e-9);state.earlyRecoveryProgress58=Math.max(0,state.earlyRecoveryProgress58-heal)}}}
    if(heal){p.hp=Math.min(p.maxHp,p.hp+heal);updateAll()}
  }});

  // Center-pad wait behavior is implemented directly by the canonical rest() declaration.

  /* r25: context94 forwarding wrapper removed; base contextAction owns stairs/item semantics. */

  /* v9.8.6 inspect cleanup: removed no-op showInspect forwarding wrapper. */
  // Keep one ordinary wait action in the movement pad; remove the duplicate quick-button.

  // v10.0.4-r45: obsolete v9.4 keyTrial wrapper removed. All LOCKED_GATE interaction is owned by the canonical base handler + typed-key service.

  // More expressive 32px sprite finishing pass over the atlas sprites.
  


  titlePolish();

  // Higher quality death/victory cards.


  registerGenerationStage('quality94-pre','pre',()=>{state.keyTrial94=null;state.outerWall94={};state.itemBiasZones94=[];state.itemBiasMoved94=0;state.coherentDecorCount94=0;state.choiceSideRooms95=0;state.roomGraph93=null;state.roomGraph92=null;state.roomTemplate93=null;state.roomTemplate92=null});
  registerGenerationStage('quality94-post','post',()=>{state.itemBiasZones94=state.itemBiasZones94||[];if(!state.specialFloor){normalizeDoors86();sanitizeWindows88()}if(state.specialFloor)installKeyTrial();if(window.__MANRU_RUNTIME81__?.Integrity81)window.__MANRU_RUNTIME81__.Integrity81.repair();biasItems();coherentDecor94();if(!state.specialFloor){normalizeDoors86();sanitizeWindows88()}if(window.__MANRU_RUNTIME81__?.Integrity81)window.__MANRU_RUNTIME81__.Integrity81.repair();VisibilityService.compute()});
  

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

  // Cleaner, continuous carpet: a floor material, never a red wall-like rectangle.





  // Camera81 delegates to CameraState12; the visual loop consumes its dirty flag once per frame.

  // v9.1 used a cheaper alternate wall/light renderer while inspecting. That caused the texture
  // to visibly change during a pan. Restore the same render pipeline for follow and inspect modes.
  
  
  
  

  registerGenerationStage('locks96','post',()=>{clearLegacyTrial();refineF2Floor96();densifySpecial96();installLockPlan();if(window.__MANRU_RUNTIME81__?.Integrity81)window.__MANRU_RUNTIME81__.Integrity81.repair();VisibilityService.compute()});
  












  buildDesktopSide();
  addEventListener('resize',()=>{if(innerWidth>1080){buildDesktopSide();updateDesktopSide962()}},{passive:true});



  





  // Bridge the last pre-ammo generator into the newer release closure without another wrapper.
  MANRU_GENERATION_PIPELINE.density=addDensityMonsters964;



  function closeAdjacentDoor964(quiet=false){
    const act=playerAction57('closeDoor',{stunMessage:'몸이 굳어 문을 닫지 못했다.'});if(!act.ok)return !!act.consumed;const cands=openDoorCandidates964();if(!cands.length){if(!quiet)toast('닫을 열린 문이 없다.');return false}
    const d=cands[0],why=doorCloseBlock964(d.x,d.y);if(why){if(!quiet)toast(why);return false}
    cancelAutoWalk();setTerrainTile58(state.map,d.x,d.y,TT.DOOR);doorFX(d.x,d.y);addLog('문을 닫았다.');VisibilityService.compute();commitPlayerAction57(act,1);return true;
  }
ActionDispatcher.register('CLOSE_DOOR',closeAdjacentDoor964);



  

  /* ===== MANRU v9.6.5: MARTIAL STEALTH + PRESENTATION FX ===== */
  MARTIAL_INFO.ghost.desc='형체와 기척을 흐려 비보스 적의 추적을 끊는다. 공격하면 즉시 해제.';
  MARTIAL_INFO.strong.desc='기를 응축해 다음 유효 근접 공격을 크게 강화. 준비 중 황금 기운이 유지된다.';
  MARTIAL_INFO.roar.desc='충격파로 주변 적에게 피해와 경직. 레벨 1/2/3/4의 반경은 각각 1/2/3/4칸. 벽 너머에는 닿지 않는다.';





  registerPlayerAttackStageR('martial-impact965',(next,mon,...args)=>{
    const ready=state?.player?.strongReady||0,beforeHp=mon?.hp;
    const r=next(mon,...args);
    if(ready>0&&mon&&Number.isFinite(beforeHp)&&mon.hp<beforeHp&&(state?.player?.strongReady||0)===0){
      ACTION_PRESENTATION58.strong=true;floatText(mon.x,mon.y,martialPresentation('strong',MARTIAL_INFO.strong,state.player).name,'#ffe3a0',15);globalThis.__MANRU_SFX54__?.play?.('crit')
    }
    return r;
  });

  /* r8: stealth break is part of the central attack commit path. */

  // Fade every layer of the player sprite while ghost is active.
  
  

  // Cheap vector FX rendered after the world: no new textures or heavy sprite rebuilds.

  globalThis.__MANRU_DRAW_HOOKS_R19__?.post.push({id:'martial965',draw:drawMartialOverlay});

  


  for(const w of WEAPONS)if(w.kind==='bow')w.ammoFamily='arrow';









  
  
  
  
  
  


  




  

  
  
























  // v9.7 generation/load wrappers were folded into the current release pipeline.
  // v9.8.3 load quality pass is registered in the canonical lifecycle below.
  
  // r30: ammunition selection is integrated in canonical useInventoryItem.
  /* R7 refactor: ammo inventory/world visuals now use the canonical exact-item renderer. */
  registerPlayerAttackStageR('ammo967',(next,mon,bonus=0,...args)=>{const a=state?._activeAmmo967,d=ammoDef(a?.ammoKind);if(!d)return next(mon,bonus,...args);const oldDef=mon.def;if(d.pierce)mon.def=Math.max(0,(mon.def||0)-d.pierce);try{return next(mon,bonus+(d.atkBonus||0),...args)}finally{mon.def=oldDef}});

  

  































  

























  





  


















































  // v9.8.0 generation/load orchestration is executed by the single current pipeline below.

  /* ---------- visual quality: zone-aware floors, wall caps, and connected props ---------- */



  /* ---------- full-map renderer for screenshot QA ---------- */


  /* ===== MANRU v9.8.1: FIXED MAP DENSITY / RAFT SAFETY / PORTAL LABYRINTH / REACHABILITY ===== */
  floorSet980.add(TT.PORTAL);plannedSet980.add(TT.PORTAL);










  

  /* 21F canonical movement audit: the player chooses any legal landing 1..range tiles away on one of 8 rays.
     Direction input resolves to the farthest candidate, while pointer/touch may choose any nearer candidate. */
  

  

















































  // v9.8.1 generation/load orchestration is executed by the single current pipeline below.









  /* v9.8.3 direct monster stats / core loot / clean current-generation pipeline */
if(typeof MANRU_GENERATION_PIPELINE.density!=='function')throw new Error('MANRU pipeline density stage missing');
















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

  /* Desktop zoom owns wheel/trackpad input at window capture, before legacy handlers can quantize it. */
  window.addEventListener('wheel',InputRouter,{capture:true,passive:false});InputRouter.noteListener('window:wheel');






























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
  
  
  
    globalThis.__MANRU_TURN_PIPELINE__.register('camera-save984',{post:()=>{if(state&&!state.dead&&!state.victory){const px=state.player?.x,py=state.player?.y;if(cameraData.lastPlayerX!=null&&cameraData.lastPlayerY!=null&&(px!==cameraData.lastPlayerX||py!==cameraData.lastPlayerY)){cameraData.lastPlayerX=px;cameraData.lastPlayerY=py;CameraState.setMode('follow',false);const p=(()=>{const p=visualPlayerPosition();return{x:p.worldX,y:p.worldY}})();cameraData.tx=p.x;cameraData.ty=p.y}}}});
  // r53: obsolete v984 descent save wrapper retired; v1004 owns persistence.
    // r53: overwritten save implementation retired.


  const panelHead=document.querySelector('#releasePanel70 .rc70Head b');if(panelHead)panelHead.textContent='만루 · 설정';
  for(const id of ['rcLoadAuto70','rcExport70','rcImport70']){const b=document.getElementById(id);if(b){b.disabled=true;b.onclick=e=>{e?.preventDefault?.();toast('퍼마데스 런에서는 과거 세이브를 불러올 수 없다.')}}}
  document.querySelectorAll('[data-rcsave],[data-rcload]').forEach(b=>{b.disabled=true;b.onclick=e=>{e?.preventDefault?.();toast('슬롯 저장/불러오기는 퍼마데스에서 사용하지 않는다.')}});

































  

  // Item choice modal shared by identify, holy purification and holy-upgrade.
  const modal=document.createElement('div');modal.id='choice991';modal.innerHTML='<div class="choice991Card"><span class="uiCorners63" aria-hidden="true"></span><div class="choice991Head"><div><b id="choice991Title"></b><small id="choice991Sub"></small></div><button class="uxClose" id="choice991Close" aria-label="닫기">×</button></div><div id="choice991List"></div></div>';document.body.appendChild(modal);


  modal.querySelector('#choice991Close').onclick=()=>InputRouter.dispatch({type:'MODAL_CANCEL',source:'choice-close'});
  modal.addEventListener('pointerdown',e=>{if(e.target===modal)InputRouter.dispatch({type:'MODAL_CANCEL',source:'choice-backdrop'})});




  ActionDispatcher.register('IDENTIFY_CHOICE',identifyChoiceAction5);

  ActionDispatcher.register('PURIFY_CHOICE',purifyChoiceAction5);











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
  registerPlayerAttackStageR('curse991',(next,mon,...rest)=>{const r=next(mon,...rest),power=curseMultiplier('thirst'),outcome=state?.playerAttackOutcome57;if(power>0&&outcome?.kind==='miss'){const loss=Math.min(state.player.focus,Math.max(1,Math.round(power)));state.player.focus=Math.max(0,state.player.focus-loss);floatText(state.player.x,state.player.y,`기 -${loss}`,'#b98b79',10);addLog(`갈증의 저주가 빗나간 기운을 빨아들였다. 기력 -${loss}.`)}return r});
  registerMonsterAttackStageR25('curse991',(next,mon,...rest)=>{const r=next(mon,...rest),power=curseMultiplier('thirst',mon);if(power>0&&r?.evaded&&Number.isFinite(mon.focus)){const loss=Math.min(mon.focus,Math.max(1,Math.round(power)));mon.focus-=loss;floatText(mon.x,mon.y,`기 -${loss}`,'#b98b79',10)}return r});




  globalThis.__MANRU_TURN_PIPELINE__.register('curse-story991',{pre:ctx=>{ctx.curse991={turn:state?.turn||0}},post:ctx=>{if(!state||state.dead||state.victory)return;if(tickActorCurses(state.player))updateAll();globalThis.storyTick992?.()}});

  // Equip reveals the item and activates its curse. A manifested curse binds that slot until purified.
  // r30: v9.9.1 identity/holy/curse equipment dispatch is integrated in canonical useInventoryItem.

  // Prevent explicit unequip/drop of a manifested cursed slot from the modern inventory renderer.
  document.addEventListener('click',e=>{const b=e.target?.closest?.('[data-uxunequip],[data-uxdrop-equip]');if(!b||!state)return;const slot=b.dataset.uxunequip||b.dataset.uxdropEquip,it=state.player?.[slot];if(it?.curseActive991){e.preventDefault();e.stopImmediatePropagation();toast(`${it.name}의 저주가 장비를 붙잡고 있다. 성부로 정화해야 한다.`)}},true);




  // ----- Skill UX: tap = usable actives, hold = upgrade panel -----
  const skillQuick=document.createElement('div');skillQuick.id='skillQuick991';document.body.appendChild(skillQuick);





  
  


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



  
  







  const classDetail1001=document.getElementById('classDetail1001'),classStart1001=document.getElementById('classStartBtn1001');












  classGrid.addEventListener('keydown',e=>{
    if(!pickWrap.classList.contains('show')||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
    e.preventDefault();const index=CLASSES.findIndex(c=>c.id===selectedClass1001),next=e.key==='Home'?0:e.key==='End'?CLASSES.length-1:(index+(e.key==='ArrowRight'?1:-1)+CLASSES.length)%CLASSES.length;
    selectClass(CLASSES[next].id);classGrid.children[next].focus();
  });
  classStart1001.onclick=()=>{if(pickWrap.classList.contains('show')&&document.body.classList.contains('title-class-mode'))newGame(CLASSES.find(c=>c.id===selectedClass1001));};
  renderClassGrid();

  // Replace only the actual player actor. NPCs/monsters keep the existing renderer.
    
  

  // Desktop right click and mobile long press share WORLD_INSPECT through InputRouter.
  C.addEventListener('contextmenu',InputRouter,{capture:true,passive:false});InputRouter.noteListener('canvas:contextmenu');
  document.getElementById('runtimeInput81')?.addEventListener('contextmenu',InputRouter,{capture:true,passive:false});InputRouter.noteListener('world:contextmenu-inspect');


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
    
        globalThis.__MANRU_TURN_PIPELINE__.register('permadeath-clean1003',{post:()=>{/* Persistence cleanup belongs to SaveService commit. */}});

    // Any stale renderer timestamp loaded during the earlier v10.0.2 boot is neutralized now.
    sanitizeTransient1003();
















    






    
    

    

    // The earlier v10.0.2 boot code may already have restored manru984_active_run before this patch runs.
    // At document boot there has been no user input yet, so discard that transient in-memory restore and show title.
    state=null;
    try{cancelAutoWalk()}catch(error){ignoreError('cancel auto-walk before the first run',error)}
    try{MON_VIS?.clear?.()}catch(error){ignoreError('monster visual cache clear',error)}
    try{FX.shakeUntil=0;FX.shakePower=0}catch(error){ignoreError('effects reset',error)}
    document.body.classList.remove('run-active','end-screen95','title-class-mode');
    setScreen('title');
    // Both historical death keys and the dead-run ledger are inspected by the canonical eligibility rule.
    RunLifecycle.refreshContinue();

    saveGame=function(){
      const ok=writeRun().ok,c=ok?SaveService.recover().candidate:null;
      toast(ok&&c?`기록 저장 완료 · ${c.meta.floor}층 T${c.meta.turn}`:'기록 저장에 실패했다.');RunLifecycle.refreshContinue();return !!(ok&&c);
    };
    globalThis.__MANRU_TURN_PIPELINE__.register('autosave1004',{post:()=>{if(state&&!state.dead&&!state.victory)SaveService.request('turn')}});
    // Descent requests persistence after every existing descent effect completes.



    // r18: repairLateItems1004 is called explicitly by the canonical generation pipeline.
    // r53: removed generation-on-load stage repair-items1004; saved geometry is authoritative.






    
















    
    

    /* ---------- class screen uses the exact same compact sprite source ---------- */
    // r40: retired the old class-grid mutation owner. The final actor service now consumes this exact v10.0.4 start-sprite source directly, so reopening the class picker cannot silently swap portraits behind the canonical renderer.






  // r18: strict typed-key retries run inside the canonical generation pipeline so failed attempts
  // do not also consume holy/story/item side effects through nested generation wrappers.
  




















/* r15: voluntary movement, forced movement and knockback call this shared hazard core directly from their canonical base functions. */









globalThis.__MANRU_TURN_PIPELINE__.register('hazard1005',{pre:ctx=>{if(!state)return;resolveAllStandingHazards1005('turn-start');if(state.dead)return globalThis.__MANRU_TURN_PIPELINE__.abort;ctx.hazard1005={beforeD:remain('drown'),beforeV:remain('void')};collapseCrumbleLeft1005()},post:ctx=>{if(!state)return;const h=ctx.hazard1005||{};collapsePaperAfterAction1005();restoreFragiles();wardCountdownLog(h.beforeD??0,h.beforeV??0);wardExpiry1005(h.beforeD??0,h.beforeV??0);updateWardHud()}});

/* HUD: the remaining ward time must be impossible to miss. */
const hud=document.createElement('div');hud.id='hazardWard1005';hud.innerHTML='<span data-w="drown"></span><span data-w="void"></span>';document.body.appendChild(hud);



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


function patchDef(name,props){const d=defBy(name);if(d)Object.assign(d,props);return d}
patchDef('수련용 환도',{focusChain:true,ability:'집중 연계',desc:'연속으로 공격을 2회 적중시키면 기력 1을 되찾습니다. 빗나가면 연계가 끊깁니다.'});
patchDef('태도',{edgeBonus:true,knockback:1,ability:'밀치기 · 일섬',desc:'긴 날로 거리를 지배합니다. 체력이 75% 이상 남은 적에게 첫 일격 보너스 피해를 주고 한 칸 밀어냅니다.'});
patchDef('당파',{parry:.12,ability:'방어 · 얽기',desc:'근접 공격을 12% 확률로 흘려내고 공격자를 잠깐 경직시킵니다.'});
patchDef('단단한 철궁',{tracking:true,ability:'추적',desc:'조준 보정으로 원거리 공격 시 대상 EVA를 크게 무시합니다.'});
patchDef('낡은 장도리',{ability:'방어무시 · 파괴',desc:'가구·항아리 같은 장애물을 부수고 구조체 적에게 추가 피해를 줍니다. 문·벽·대나무·생울타리는 파괴할 수 없습니다.'});
patchDef('손도끼',{ability:'방어무시 · 파괴',desc:'가구·항아리 같은 장애물을 부수고 구조체 적에게 추가 피해를 줍니다. 문·벽·대나무·생울타리는 파괴할 수 없습니다.'});
patchDef('질긴 가죽망토',{staggerResist:.30,desc:'피격 시 30% 확률로 밀치기·속박·둔화를 버텨 자세가 흐트러지지 않습니다.'});
patchDef('바람막이망토',{focusRegen:1.35,desc:'기본 기력 자연회복에 약 35%의 추가 회복을 누적합니다.'});
patchDef('여행자망토',{eatSpeed:1.35,desc:'음식 사용 행동비용을 약 26% 줄여 전투 중 보급이 훨씬 안전해집니다.'});
patchDef('두꺼운 면망토',{trapGuard:.35,desc:'철침·독침 같은 일반 함정을 35% 확률로 완전히 받아내 무효화합니다. 물·용암·공허의 치명 판정은 막지 못합니다.'});
delete defBy('두꺼운 면망토').hazardResist




/* breakPower was also data-only: make it useful without allowing route/lock bypass. */
/* r8: breakPower is handled by the central basicAttack facing branch. */

/* weapon effects: focus chain, opening edge, tracking, construct-breaking bonus */
registerPlayerAttackStageR('weapon1006',(next,mon,bonusAtk=0,...rest)=>{
  const p=state?.player,w=p?.weapon||{},hp0=mon?.hp??0,eva0=mon?.eva,followup=rest.some(v=>v&&v.chainFollowup1006===true);
  let opening=false;
  if(mon&&w.edgeBonus&&mon.maxHp>0&&mon.hp/mon.maxHp>=.75)opening=true;bonusAtk+=equipmentOpeningBonus105(p,mon);
  if(mon&&w.tracking&&w.ranged&&Number.isFinite(eva0))mon.eva=Math.max(0,eva0-6);
  let r;try{r=next(mon,bonusAtk,...rest)}finally{if(mon&&w.tracking&&w.ranged&&Number.isFinite(eva0))mon.eva=eva0}
  const hit=r===true&&!!mon&&mon.hp<hp0;
  if(opening&&hit)addLog('태도 · 일섬: 빈틈을 선점해 추가 피해를 냈다.');
  equipmentFocusChain105(p,hit);
  if(hit&&mon.hp>0&&!followup&&Number(w.chain)>0&&globalThis.__MANRU_RANDOM57__()<w.chain){floatText(mon.x,mon.y,'연격','#e8c58d',11);addLog(`${w.name} · 연격!`);attackPlayer(mon,0,{chainFollowup1006:true})}
  return r;
});

/* parry + actual stagger resistance */
registerMonsterAttackStageR25('parry-stagger1006',(next,mon,bonus=0,context={},...rest)=>{
  const ctx=monsterAttackContextR(context),p=ctx.target||state?.player,w=p?.weapon||{};
  if(mon&&w.parry&&ctx.delivery==='melee'&&entityDistance57(mon,p)<=2&&globalThis.__MANRU_RANDOM57__()<w.parry){
    applyCombatStatus(mon,'stun',1,1,{stagger:true,source:p});floatText(p.x,p.y,'패리','#e9d59b',11);addLog(`${w.name}: ${mon.name}의 근접 공격을 흘려냈다.`);return monsterAttackResultR(mon,ctx,{hit:false,parried:true,interrupted:true,reason:'parried'});
  }
  return next(mon,bonus,ctx,...rest);
});

/* common cloak trap effect; fatal terrain deliberately untouched */
/* travel cloak eat speed */

/* fractional focus regen so 1.35 is no longer rounded to the same result as 1.00 */
globalThis.__MANRU_TURN_PIPELINE__.register('cloak-focus1006',{pre:ctx=>{ctx.turn1006=state?.turn??0},post:ctx=>{if(state&&!state.dead&&state.turn!==ctx.turn1006){const p=state.player,c=playerCloak?.()||{},fr=+c.focusRegen||1;if(fr>1&&fr<2){p.cloakFocusCarry1006=(p.cloakFocusCarry1006||0)+(fr-1)/10;while(p.cloakFocusCarry1006>=1){p.cloakFocusCarry1006-=1;const b=p.focus;p.focus=Math.min(getStats().maxFocus,p.focus+1);if(p.focus>b){floatText(p.x,p.y,'기 +1','#9fcdbf',9);addLog(`${c.name}: 바람을 타고 기력 +1.`)}}}}}});



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

registerGenerationStage('artifact-reset46','pre',resetPortal46);registerGenerationStage('artifact-portal46','post',maybePortal46);


function atkBonus47(){return equipped47('curse_blade')?cursedEquipped47()*3:0}




function fireAbsorb47(){return possesses47('ember_axe')&&state?.player?.armor?.elementGuard74==='fire'}
function healFire47(n=1){n=Math.max(0,Math.round(Number(n)||0));if(!state||!fireAbsorb47())return 0;const p=state.player,b=p.hp;p.hp=Math.min(p.maxHp,p.hp+n);const g=p.hp-b;if(g>0)floatText(p.x,p.y,`화염흡수 +${g}`,'#ffb365',9);return g}




function tempLava47(cx,cy){emitElementContact105('fire',elementCells105(cx,cy,1),effectSource57(state.player));for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const x=cx+dx,y=cy+dy;if(!insideMapInterior(x,y))continue;const old=state.map[y]?.[x];if(!(old>=500&&old<660&&(old-500)%16<4)&&![TT.FLOOR,TT.GRASS,TT.OPEN_DOOR,TT.WOOD_FLOOR,TT.MOON_STONE,TT.DARK_WOOD,TT.GILDED_FLOOR].includes(old))continue;if(state.artifactExit46?.x===x&&state.artifactExit46?.y===y)continue;RuntimeTerrainOwner.temporary(x,y,TT.LAVA,5,'legend-lava',{allowedOld:[old],source:'lava-bow47'})}burst(cx,cy,'#f06f33',30,1.2)}
function resurrect47(mon,pos){if(!mon||mon.kind==='undead'||mon.boss||mon.miniBoss||globalThis.__MANRU_RANDOM57__()>=.62)return false;const ally={name:`타락한 ${mon.name}`,x:pos.x,y:pos.y,hp:Math.max(5,Math.round((mon.maxHp||20)*.65)),maxHp:Math.max(5,Math.round((mon.maxHp||20)*.65)),atk:Math.max(2,Math.round((mon.atk||6)*.25)),def:Math.max(0,Math.round((mon.def||0)*.80)),eva:Math.max(0,Math.round((mon.eva||0)*.55)),xp:0,color:'#76517c',shape:mon.shape||'undead',kind:'undead',faction57:'player',friendly47:true,spawnProvenance57:'resurrection',legendAlly47:true,allyId53:`ally-${state.turn}-${state.nextAllyId53=(state.nextAllyId53||0)+1}`,allyBornTurn47:state.turn,allyExpireTurn47:state.turn+24,ttl47:24,alerted:true,weakened:0};if(!OccupancyService.isOccupied(pos.x,pos.y)&&!tileBlocks(state.map[pos.y]?.[pos.x]))OccupancyService.addMonster(ally);else{const q=DIRS8.map(([dx,dy])=>({x:pos.x+dx,y:pos.y+dy})).find(q=>PlacementService.monsterCanStand(ally,q.x,q.y));if(q){ally.x=q.x;ally.y=q.y;OccupancyService.addMonster(ally)}else return false}burst(ally.x,ally.y,'#8f62a0',18,.8);addLog(`${mon.name}의 잔해가 타락한 언데드로 일어났다. 공격력은 원본의 일부뿐이다.`);return true}
registerPlayerAttackStageR('legendary47',(next,mon,bonus=0,...rest)=>{const w=state?.player?.weapon,id=w?.artifactId46;if(!w?.legendaryWeapon47)return next(mon,bonus,...rest);const hp0=mon?.hp??0,pos=mon?{x:mon.x,y:mon.y}:null,dist=mon?entityDistance57(mon,state.player):0,r=next(mon,bonus,...rest),hit=!!mon&&mon.hp<hp0;if(!hit)return r;const contact=weaponElement105(w);if(contact&&pos)emitElementContact105(contact,[pos],effectSource57(state.player),{baseDamage:Math.max(1,hp0-mon.hp),directTarget:mon});const dealt=Math.max(0,hp0-Math.max(0,mon.hp));if(id==='ember_axe'){state.player.legendEmberStacks47=Math.min(10,(state.player.legendEmberStacks47||0)+1);floatText(state.player.x,state.player.y,`낙화 ${state.player.legendEmberStacks47}/10`,'#e99a5e',8);if(state.player.legendEmberStacks47>=10){state.player.legendEmberStacks47=0;skyAxe47()}}else if(id==='thunder_spear')chain47(mon,2,2);else if(id==='earth_gauntlet'){state.player.legendEarthStacks47=Math.min(8,(state.player.legendEarthStacks47||0)+1);state.player.legendEarthHitTurn47=state.turn+1;floatText(state.player.x,state.player.y,`지맥 ${state.player.legendEarthStacks47}/8`,'#d5b773',8)}else if(id==='mirror_blade'){const o=(state.monsters||[]).filter(m=>m!==mon&&isHostileTarget57(m)&&entityDistance57(m,mon)<=3).sort((a,b)=>entityDistance57(a,mon)-entityDistance57(b,mon))[0];if(o){const d=damageEntity(o,Math.max(2,Math.floor(dealt*.35)),state.player);projectileFX(mon.x,mon.y,o.x,o.y,'#d3c4ef');if(d>0)floatText(o.x,o.y,`반영 -${d}`,'#dccbf5',10);if(o.hp<=0)killMonster(o)}}else if(id==='chain_sickle'&&mon.hp>0&&dist>=2)pull47(mon);else if(id==='ward_hammer'){state.player.legendWardHits47=(state.player.legendWardHits47||0)+1;if(state.player.legendWardHits47>=3){state.player.legendWardHits47=0;state.status.ward=Math.max(state.status.ward||0,4);floatText(state.player.x,state.player.y,'진문 수호 3턴','#e9d79a',10)}}if(mon.hp<=0&&pos){if(id==='curse_spear')resurrect47(mon,pos);else if(id==='lava_bow')tempLava47(pos.x,pos.y)}return r});

globalThis.__MANRU_TURN_PIPELINE__.register('legendary47',{pre:()=>{syncEquip47()},post:()=>{if(!state)return;syncEquip47();const p=state.player;if(equipped47('earth_gauntlet')&&(p.legendEarthStacks47||0)>0&&p.legendEarthHitTurn47!==state.turn)p.legendEarthStacks47=Math.max(0,p.legendEarthStacks47-1);tickLegendFields();state.legendSkyAxes47=(state.legendSkyAxes47||[]).filter(a=>performance.now()-a.t<a.ttl)}});




globalThis.__MANRU_DRAW_HOOKS_R19__?.world.push({id:'legendary47',draw:drawLegendWorld});


globalThis.__MANRU_TURN_PIPELINE__.register('artifact-claim46',{post:claimAudit46});
function mapSignature46(){if(!state?.map)return null;let h=2166136261>>>0,counts={};for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){const v=state.map[y]?.[x]??-1;counts[v]=(counts[v]||0)+1;h^=((v+257)*131+x*17+y*31)>>>0;h=Math.imul(h,16777619)>>>0}return{hash:h>>>0,counts}}




function claimReward46(){const r=state?.artifactReward46;if(!r)return false;state.player.x=r.x;state.player.y=r.y;resetVisualState();VisibilityService.compute();pickupBaseR25();claimAudit46();return{owned:[state.player.weapon,...state.player.inventory].filter(Boolean).filter(i=>i.legendaryWeapon47).map(i=>i.name),left:(state.items||[]).filter(i=>i.legendaryWeapon47).length}}




const API47={gatekeeper:applyLegendGatekeeper47,mobCatalog:()=>Object.keys(DUNGEON_MOBS47).flatMap(mobDefs47),version:'R49',enemyDefinitions:id=>mobDefs47(id).map(d=>({...d})),build:(id,seed,quiet=true)=>LegendaryDungeonBuilder.build(adef46(id),{seed,quiet}),integrity:()=>GenerationValidator.legendary(),assets:()=>legendAssetAudit(),defs:()=>LEGENDS47.map(a=>({...a})),debugKeys:()=>{const zs=state?.legendSanctums47||[];return{dungeon:state?.artifactDungeon46?.id||null,player:state?.player?{x:state.player.x,y:state.player.y}:null,sanctums:structuredClone(zs),plan:structuredClone(state?.keyPlan96||null),reward:state?.artifactReward46?{...state.artifactReward46}:null,mapAround:zs.map(z=>{const rows=[];for(let yy=z.cy-z.r-1;yy<=z.cy+z.r+1;yy++){const row=[];for(let xx=z.cx-z.r-1;xx<=z.cx+z.r+1;xx++)row.push(state.map?.[yy]?.[xx]??null);rows.push(row)}return{keyId:z.keyId,cx:z.cx,cy:z.cy,r:z.r,gate:z.gate,rows}})}},handlePortalAt:handlePortalAt46,enter:LegendaryDungeonBuilder.enter,restore:LegendaryDungeonBuilder.restore,forcePortal:forcePortal47,forceDungeon:(id=LEGENDS47[0].id)=>LegendaryDungeonBuilder.enter(id),reveal:()=>{if(!state?.artifactDungeon46)return false;state.seen=new Set();state.visible=new Set();for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){VisibilityService.rememberKey(k(x,y));VisibilityService.addVisibleKey(k(x,y))}updateAll();return true},keyAudit:()=>keyProgressAudit48(false),audit:()=>({floor:state?.floor,inDungeon:!!state?.artifactDungeon46,dungeon:state?.artifactDungeon46||null,portal:state?.artifactPortal46||null,exit:state?.artifactExit46||null,reward:state?.items?.filter(i=>i.legendaryWeapon47).map(i=>({name:i.name,x:i.x,y:i.y}))||[],owned:[state?.player?.weapon,...(state?.player?.inventory||[])].filter(Boolean).filter(i=>i.legendaryWeapon47).map(i=>i.name),reach:reachAudit46(),map:mapSignature46(),dims:[COLS,ROWS],monsters:state?.monsters?.filter(m=>!m.friendly47).length||0,legendMobs:state?.monsters?.filter(m=>m.legendMob47).map(m=>m.name)||[],decor:state?.legendDecor47?.length||0}),recordAcquisition:claimAudit46,claimReward:claimReward46,walkPortal:walkPortal46,walkReturn:walkReturn46,give:(id)=>{const a=adef46(id);if(!a||!state)return false;addInventoryItem({...clone(a),count:1});claimAudit46();return true},upgradeProbe:(id)=>{const a=clone(adef46(id)||LEGENDS47[0]);const before={atk:a.atk,upgrade:a.upgrade||0};const r=applyWeaponUpgrade(a);return{before,after:{atk:a.atk,upgrade:a.upgrade||0},result:r}},effectProbe:effectProbe47,regen:f=>{state.floor=clamp(+f||6,1,25);NormalFloorGenerator.generate();resetVisualState();VisibilityService.compute();updateAll();return{floor:state.floor,portal:state.artifactPortal46||null}},atkBonus:atkBonus47,critBonus:cursedBladeCritBonus,defBonus:earthGauntletDefBonus,syncEquip:syncEquip47,guard:guard47,fireAbsorb:fireAbsorb47,healFire:healFire47,allyTurn:alliesTurn,enemySpecial:enemySpecial47,owns:owns47,possesses:possesses47,claimed:claimed47,cursedEquipped:cursedEquipped47};
globalThis.__MANRU_LEGEND47__=API47;globalThis.__MANRU_ARTIFACT46__=API47;













/* 10.0.5 subbranches: canonical map producer, persistent world pages, terrain consumer. */

































































MONSTERS.push(PALACE_LOTUS105,PALACE_GARDENER105);













PALACE_KING_IMAGE105.onload=()=>{globalThis.__MANRU_ACTOR_ART__?.clear?.();if(state?.player)updateAll(false);};PALACE_KING_IMAGE105.src='data:image/png;base64,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';
PALACE_GARDENER_IMAGE105.onload=()=>{globalThis.__MANRU_ACTOR_ART__?.clear?.();if(state?.player)updateAll(false);};PALACE_GARDENER_IMAGE105.src='data:image/png;base64,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';





































































































































































































































































ActionDispatcher.register('ANVIL_FUSE105',anvilFuse);













































ActionDispatcher.register('SUMMON_CAST105',summonCast);
ActionDispatcher.register('SUMMON_PICTURE105',summonInstallPicture);
ActionDispatcher.register('SUMMON_TALISMAN105',summonBindTalisman);











function initSummon105(){summonUpdateButtons();}

initSummon105();
initDebugBattle57();


