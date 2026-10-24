bindCanvasAndKeyListeners();

try{HAPTIC57.enabled=localStorage.getItem('manruHaptics57')!=='0'}catch(error){ignoreError('haptics preference unreadable',error)}



ClientEnvironment.initialize();
bindFullscreenAndResizeListeners();

// Canonical runtime entrypoints populated once by their owning implementation blocks.
/* updateAll is declared by the render coordinator below. */
let runtimeLoopStarted57=0;

function runtimeReady57(){return typeof updateMobileHud==='function'&&typeof visualLoop==='function'}
function startRuntimeLoop57(){if(runtimeLoopStarted57)return true;if(!runtimeReady57())throw new ReferenceError('canonical runtime entrypoints are not initialized');runtimeLoopStarted57=1;requestAnimationFrame(visualLoop);return true}
Object.defineProperty(globalThis,'__MANRU_RUNTIME_START57__',{value:Object.freeze({ready:runtimeReady57,start:startRuntimeLoop57,started:()=>runtimeLoopStarted57===1}),writable:false,configurable:false});
bindKeydownRouter();

bindMobileTopButtons();
renderMobileDrawer();
clearPathPreview();
bindCanvasHover();
createMobileAutoButton();


startVisualAssetLoads();

// Class portraits use the same in-game sprites.
document.querySelectorAll('#classGrid .classBtn').forEach((b,i)=>{const cid=CLASSES[i]?.id||'wanderer',m=VF_ASSETS.creature_meta[`player:${cid}:down`];if(!m)return;const p=document.createElement('span');p.className='vfClassPortrait';const ix=m.base%VF_ASSETS.creature_cols,iy=Math.floor(m.base/VF_ASSETS.creature_cols);p.style.backgroundPosition=`${-ix*32}px ${-iy*32}px`;b.appendChild(p)});

if(state){vfBuildDecor();updateAll()}
createAutoStateBadge();

if(location.hash.includes('debug')){window.__MANRU_DEBUG__={
  get:()=>state,elementDamage61:(entity,elem,amount)=>resolveElementDamage57(entity,elem,amount,{ground:false}),tutorial60:()=>tutorialEntryAudit(),presentation58:()=>({busy:actionPresentationBusy58(),kind:ACTION_PRESENTATION58.kind,frame:(()=>{const f=actionFrame();return f?{source:f.source,target:f.target,t:f.t,hit:f.a.hit,weapon:f.a.weapon}:null})(),remaining:Math.max(0,ACTION_PRESENTATION58.until-performance.now())}),
  floor:(n)=>{if(!state)return false;state.floor=clamp(+n||1,1,25);NormalFloorGenerator.generate();resetVisualState();resetTurnState();startFloorTransition();updateAll();return true},
  inventory:()=>{if(!state)return false;state.player.inventory=[];for(const w of WEAPONS.slice(0,8)){const it=clone(w);it.type='weapon';addInventoryItem(it)}for(const a of ARMORS.slice(1,4)){const it=clone(a);it.type='armor';addInventoryItem(it)}for(const c of CLOAKS.slice(0,4)){const it=clone(c);it.type='cloak';addInventoryItem(it)}for(const f of CONSUMABLES.slice(0,4))addInventoryItem(clone(f));openInventory();return true},
  close:()=>{closeInventory();closeMartial();closeHelp();return true},
  settle:()=>{FX.transition=null;bossIntroTimer&&clearTimeout(bossIntroTimer);document.getElementById('bossIntro')?.classList.remove('show');drawMap();return true}
}}

createZoomHud();

  document.querySelectorAll('#classGrid .classBtn').forEach((b,i)=>{
    const cls=CLASSES[i];if(!cls)return;const fake={shape:'player'},old=b.querySelector('.vfClassPortrait');if(old)old.remove();const img=document.createElement('img');img.className='vfClassPortrait';const backup=state;try{if(!state)state={player:{classId:cls.id,weapon:null,armor:ARMORS[0],cloak:null}};else{state.player.classId=cls.id}img.src=hiCreature(fake,0,'down',true).toDataURL('image/png')}catch(error){ignoreError('class portrait preview is optional decoration',error)}finally{state=backup}b.appendChild(img);
  });
rebindInspectClose();
initInspectOverlay();
createCombatHud();

  const hk={attack:'SPC',pickup:'G',open:'E',skill:'Q',inv:'I',rest:'R',summon0:'V',summon1:'T'},rn={attack:'칼',pickup:'줍',open:'점멸',skill:'무',inv:'행',rest:'숨',summon0:'',summon1:''};function adorn(){document.querySelectorAll('#mobileControls .quickbar button').forEach(b=>{if(b.dataset.mf36)return;b.dataset.mf36='1';const a=b.dataset.act||'';b.insertAdjacentHTML('beforeend',`<span class="mfKey">${hk[a]||''}</span><span class="mfRune">${rn[a]??'◆'}</span>`)})}adorn();

createHitFeed();

  for(const p of POTIONS)if(!CONSUMABLES.some(x=>x.name===p.name))CONSUMABLES.push(p);
createPotionTargetHud();
  
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



  // test helper exists only with #debug and lets us inspect special-room art without changing normal play.
  if(location.hash.includes('debug')&&window.__MANRU_DEBUG__){
    window.__MANRU_DEBUG__.teleportFeature=(i=0)=>{const f=state?.featureRooms?.[i];if(!f)return null;state.player.x=f.x+Math.floor(f.w/2);state.player.y=f.y+Math.floor(f.h/2);resetVisualState();VisibilityService.compute();updateAll();return f.name};
  }

RuntimeState.ui.inventory=UX;

  replaceViewerQuickButton('inv',()=>toggleInventory());
  replaceViewerQuickButton('skill',()=>useClassSkill());
bindModalSwipeClose();

  RuntimeState.turn=TURN_AUDIT5;

  document.body.classList.toggle('ux-modal-open',uiBlocking());

  P47.renderDpr=baseDpr();

  syncCanvasWrapViewport();

const mapOpen49=()=>!!interactionActive8('mobileMapModal');

  /* complete legacy interaction handlers that were referenced but never defined */
startTitleCanvas();
bindTitleButtons();

  syncGameViewport();

bindTextSelectionGuards();

  try{const s=localStorage.getItem('manruSfx54');if(s==='0')V54.sfx=false}catch(error){console.warn('[manru] sound setting not read',error)}
createHoldHint();
  const rule=document.createElement('div');
createBossRuleBanner();

  document.addEventListener('pointerdown',()=>ac54(),{once:true,capture:true,passive:true});

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
  
  globalThis.__MANRU_CONSUMABLE56_ACTIONS__=Object.freeze({initializeKnowledge:ensureKnowledge56,knownPotion:isPotionKnownByPlayer,knownTalisman:knownTalisman56,publicName:publicName56,target:()=>!!V56.target,castTarget:(x,y)=>castTalisman56(x,y),cancelTarget:()=>{cancelTalismanTarget(true);return true},useTalisman:item=>{if(!item||item.type!=='talisman')return false;if(item.targeted){beginTalismanTarget(item);return true}return !!useInstantTalisman56(item)}});

  if(state){ensureKnowledge56();decorateAllItems56()}

RuntimeState.ui.food=V57;

// 새 명칭이 기존 고해상도 아틀라스를 재사용하도록 시각 별칭을 지정한다.
if(typeof VF_ASSETS==='object'&&VF_ASSETS.creature_meta){const a=VF_ASSETS.creature_meta,m={'취객':'윈도','시종':'윈도','객잔 경비병':'수비병','떠돌이 도둑':'윈도','정원사 망령':'강시','독꽃':'가시 덩굴','검은 뱀':'그림자 살모사','먹물 정령':'먹물 개구리','수목 궁수':'수비병','정원 바위괴물':'돌 거북','식인 물고기':'피라냐','수은 물고기':'피라냐'};for(const [n,o] of Object.entries(m))if(!a[n]&&a[o])a[n]=a[o]}
createFoodTargetPanel();
createCookingPanel();

// 획득 구조: 주방, 샘, 피라냐, 복숭아나무 + 설계 공백을 메운 빙결액 배치
window.MANRU_FOOD57.rumorHint=()=>{ensureFoodState();const unknown=FOOD_RECIPES.filter(v=>!state.cookbook57[v.id]);if(unknown.length&&globalThis.__MANRU_RANDOM57__()<.40){const rec=choice(unknown);state.cookbook57[rec.id]=true;addLog(`찢어진 조리서 · ${rec.name}: ${rec.ingredients.join(' + ')}.`);return rec.id}return null};

if(state)ensureFoodState();
createPadToggle();


  syncGameViewport();

const V59={lastMode:null, doorLog:[], modeLog:[]};







  const BREAK61=new Set([TT.TABLE,TT.SCREEN,TT.HEDGE,TT.BAMBOO,TT.FAKE_DOOR,TT.SECRET_DOOR,TT.LOCKED_GATE,TT.PEACH_TREE,TT.HIDDEN_BRIDGE,TT.HIDDEN_WALL]);

  createFeelingElement();
createTacticalBelt();

  RC.storagePersistent=(()=>{const k='__manru_probe70';try{localStorage.setItem(k,'1');localStorage.removeItem(k);return true}catch(_){return false}})();
  try{RC.uiVolume=Math.max(0,Math.min(1,+(lsGet('manruUiVolume70')??.35)))}catch(error){ignoreError('ui volume unreadable',error)}

  applyTextScale(lsGet('manruUiTextScale70')??1);

  createReleasePanel();
  createCoachDialog();
createReleaseControls();
decorateGhostPadButtons();



bindReleaseDiagnosticButtons();
bindReleaseSettingsControls();
  bindSaveStringPanel();

  refreshSlots();refreshSfx();refreshStorageStatus();

  window.__MANRU_RELEASE__={
    openPanel:openReleasePanel,closePanel:closeReleasePanel,markAction:()=>{RC.lastActionAt=performance.now();return RC.lastActionAt},tip:tip70,floorTutorial:showFloorTips,closeTip:closeCurrentTip,suspendTip:suspendTips,entryTutorial:advanceEntryTutorial,closePanel:closeReleasePanel
  };
bindResumeListeners();

  function public74(item){if(!item)return'';if(item.branchExclusive105||item.fusion74)return item.name;return window.__MANRU_TALISMAN_PUBLIC__?.name?.(item)||item.name}
createFusionPanel();
setupInfusionPanels();

  globalThis.__MANRU_TALISMAN74_ACTIONS__=Object.freeze({woodEffect:woodEffect105,shopCandidates:(baseKind=null)=>FUSION_RECIPES.filter(r=>r.a!=='upgrade'&&r.b!=='upgrade'&&(!baseKind||r.a===baseKind||r.b===baseKind)).map(recipeItem),known:known74,publicName:public74,target:()=>!!V74.target,castTarget:(x,y)=>castFusion(x,y),cancelTarget:()=>{cancelTalismanTargeting(true);return true},closePanels:()=>{closeFusion();closeGear();return true},dispatch:item=>{if(!item||item.type!=='talisman')return{handled:false,result:false};ensure74();if(item.talismanKind==='reinforce105'){openGear(item);return{handled:true,result:true}}if(item.fusion74){if(item.fusionMode74==='gear'){openGear(item);return{handled:true,result:true}}if(item.fusionMode74==='target'){startTarget74(item);return{handled:true,result:true}}return{handled:true,result:!!useFusionInstant(item)}}if(ELEMENT_KIND74[item.talismanKind])return{handled:true,result:!!rawElement74(item)};if(item.talismanKind==='upgrade'){if(playerClassRules58().upgradeTalismanMode==='bodyBoost'&&!state.player.inventory.some(i=>i.summonItem105==='book'))return{handled:true,result:useBodyPower74(item)};identifyKind('upgrade','강화 효과 관찰');openGear(item);return{handled:true,result:true}}return{handled:false,result:false}},ensure:ensure74});

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

  // Remove any dedicated identify-talisman toolbar artifact. Generic targeted-talisman cancel UI remains for mobile usability.
  const killIdentifyBar88=()=>{for(const q of ['#identifyToolbar','#identifyToolbar56','.identifyToolbar','.identifyTalismanToolbar','[data-identify-toolbar]'])document.querySelectorAll(q).forEach(e=>e.remove());const h=document.getElementById('talismanTarget56'),title=document.getElementById('talismanTargetTitle');if(h&&title&&/감정부적/.test(title.textContent||''))h.classList.remove('show')};
  killIdentifyBar88();new MutationObserver(killIdentifyBar88).observe(document.body,{subtree:true,childList:true,characterData:true});



  titlePolish();

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





  // Remove the old parallel upgrade economy from future loot tables.

  try{localStorage.removeItem('manruZoomActual48')}catch(error){ignoreError('old zoom setting could not be removed',error)}

try{localStorage.removeItem('manruCameraMode984')}catch(error){console.warn('[manru] camera setting not cleared',error)}

  globalThis.__MANRU_CAMERA_STATE12__=CameraState;
  
  bindZoom();
bindWheelRouter();


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

  if(state){applyCursesToAllGear();ensureHolyDrop();syncCurseClocks991()}
  
  // Prevent explicit unequip/drop of a manifested cursed slot from the modern inventory renderer.
  document.addEventListener('click',e=>{const b=e.target?.closest?.('[data-uxunequip],[data-uxdrop-equip]');if(!b||!state)return;const slot=b.dataset.uxunequip||b.dataset.uxdropEquip,it=state.player?.[slot];if(it?.curseActive991){e.preventDefault();e.stopImmediatePropagation();toast(`${it.name}의 저주가 장비를 붙잡고 있다. 성부로 정화해야 한다.`)}},true);

  createSkillQuickPanel();

  bindSkillButton();queueMicrotask(bindSkillButton);

  storyEnsureUI();
  Object.assign(globalThis,{storyCollectNote992:storyCollectNote,storyDrawWorld992:storyDrawWorld,storyFriendBossPattern992:storyFriendBossPattern,storyBreakFriendMask992:storyBreakFriendMask,storyShowEndingChoice992:storyShowEndingChoice,storyAfterFloorGenerated992:storyAfterFloorGenerated,storyInitNewRun992:storyInitNewRun,storyTick992:storyTick});
  window.__MANRU_STORY992__={resume:()=>{const st=storyEnsureState();if(st?.dispatchPending60)return storyOpenNote('dispatch');return false},close:storyCloseModal,closeScene:storyCloseScene,selectEnding:storySelectEnding,continueScene:storyContinueScene,project:projectStoryUI,open:storyOpenNote,ending:storyResolveEnding};

  // Final requested starting loadout. Inspector deliberately has no starting weapon.

  bindClassPickerElements();

  classGrid.addEventListener('keydown',e=>{
    if(!pickWrap.classList.contains('show')||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
    e.preventDefault();const index=CLASSES.findIndex(c=>c.id===selectedClass1001),next=e.key==='Home'?0:e.key==='End'?CLASSES.length-1:(index+(e.key==='ArrowRight'?1:-1)+CLASSES.length)%CLASSES.length;
    selectClass(CLASSES[next].id);classGrid.children[next].focus();
  });
  renderClassGrid();
bindContextMenuRouter();

RuntimeState.ui.screen=SCREEN1002;


  bootScreen1002();

    sanitizeTransient1003();
    if(state){resetVisualState();try{updateAll()}catch(error){ignoreError('ui refresh after restore',error)}}

    ensureQuit();

    // Any stale renderer timestamp loaded during the earlier v10.0.2 boot is neutralized now.
    sanitizeTransient1003();
resetToTitleScreen();

/* HUD: the remaining ward time must be impossible to miss. */
createWardHud();

/* matching pickup/open messages + ledger colors/names */
globalThis.__MANRU_TYPED_KEYS__?.setMetaProvider?.(keyMeta1006);

const RUMOR_SPACE_VERSION1030='r58.1-rumor-spaces';

globalThis.__MANRU_RUMOR_SPACES1030__=Object.freeze({version:RUMOR_SPACE_VERSION1030,types:RUMOR_SPACE_TYPES.map(t=>({id:t.id,name:t.name,preview:!!t.preview,risk:t.risk})),generate:generateRumorSpaces,revealNext:rumorRevealNext,reveal:r=>revealRumorSpace(r),openEntranceAt:rumorOpenEntranceAt,drawEntranceOverlay:rumorDrawEntranceOverlay,isSealedInterior:(x,y)=>!!rumorSpaceByInterior(x,y),mutationLocked:rumorSpaceMutationLocked,audit:rumorAudit,qaGenerate:rumorQAGenerate});

if(typeof globalThis.__MANRU_GENERATE_CORE983__!=='function')throw new Error('Manru canonical generator core missing');

Object.defineProperty(globalThis,'__MANRU_ACTOR_ART__',{value:ACTOR_ART,writable:false,configurable:false,enumerable:true});

renderClassGrid();

globalThis.__MANRU_ICON_HTML_IMPL_R7__=iconHtml;
window.__MANRU_ITEM_ART_R7__={dataItem:data,weaponAsset,pictureAsset:summonPictureAsset,iconHtml,clear:()=>{CACHE.clear();DATA.clear();WEAPON_ASSETS.clear();PICTURE_ASSETS.clear();return true}};












for(const [id,t] of Object.entries(LEGEND_TILES49))for(const [n,v] of Object.entries({PAVING:t.base,INLAY:t.base+1,PLATES:t.base+2,COURT:t.base+3,ASHLAR:t.base+4,BUTTRESS:t.base+5,ROCK:t.base+6,BRIDGE:t.bridge,STRUCTURE:t.solid}))TT['LEGEND_'+id.toUpperCase()+'_'+n]=v;



















MONSTERS.push(PALACE_LOTUS105,PALACE_GARDENER105);
loadPalaceActorImages();

function initSummon105(){summonUpdateButtons();}

initSummon105();
initDebugBattle57();

