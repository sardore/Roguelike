/* r46: reusable world-cell target owner. 21F blink is the first consumer; future skills can supply
   their own candidate cells and completion callback without adding another input firewall. */
let WORLD_TARGET=null,targetFollowupSuppressUntil=0;
function worldTargetSnapshot(){if(!WORLD_TARGET)return null;return{kind:WORLD_TARGET.kind,title:WORLD_TARGET.title,text:WORLD_TARGET.text,range:WORLD_TARGET.range,cells:WORLD_TARGET.cells.map(v=>({x:v.x,y:v.y,dx:v.dx,dy:v.dy,dist:v.dist}))}}
function migrateRetiredItems(run){if(!run?.player)return{inventory:0,ground:0,pending:0};const qty=i=>Math.max(1,Number.isSafeInteger(i?.count)?i.count:1),inv=run.player.inventory||[],ground=run.items||[],pending=run.pendingGroundItems57||[];let inventory=0,world=0,queued=0;run.player.inventory=inv.filter(i=>{if(!retiredPainterItem57(i))return true;inventory+=qty(i);return false});run.items=ground.filter(i=>{if(!retiredPainterItem57(i))return true;world+=qty(i);return false});run.pendingGroundItems57=pending.filter(q=>{if(!retiredPainterItem57(q?.item))return true;queued+=qty(q.item);return false});for(const slot of ['weapon','armor','cloak','relic','trinket'])if(retiredPainterItem57(run.player[slot])){inventory+=qty(run.player[slot]);run.player[slot]=null}RuntimeState.persistence.retiredItemMigration57={version:1,inventory,ground:world,pending:queued,total:inventory+world+queued};return RuntimeState.persistence.retiredItemMigration57}
function captureGenerationSnapshot(){return{state:structuredClone(state),cols:COLS,rows:ROWS}}
function restoreGenerationSnapshot(snap){if(!snap?.state)return false;state=structuredClone(snap.state);COLS=snap.cols;ROWS=snap.rows;return true}
let saveGame;
/* ===== NEW/LOAD LIFECYCLE =====
   One public entrypoint per kind (RunLifecycle.runNew / runLoad). Each runs its before-step, the core once, then its
   after-step: beforeNewRun/afterNewRun and beforeLoad/afterLoad below list the steps in the order they run.
   A before-step may reject the run by returning {stage, value} (readLoadRequest does, through manruLifecycleAbort). */
const MANRU_LIFECYCLE_ABORT=Symbol('MANRU_LIFECYCLE_ABORT');
function manruLifecycleAbort(value){return{tag:MANRU_LIFECYCLE_ABORT,value}}
/* Phase 7: the live `state` object remains the one gameplay authority. Persistence is an
   explicit allowlisted projection; process-only identities live under RuntimeState. */
const GAMESTATE_FIELDS=Object.freeze('terrainReactions105,branchWorld105,branchContext105,branchTerrain105,branchPortals105,pendingMartialManualChoice,martialManualDrops,martialEcho,martialDamageSequence,martialProgression1005,naturalPopulation57,recentPlayerCells57,noiseSequence57,lastDamageAgencyTurn57,passiveRecoveryUnlocked57,floor2Choice63,makgeolliRecoveryTurns57,silkTraps57,earlyHallVariant58,tutorialEntryAudit60,specialProgressionValidation57,tutorialEntry60,tutorialSeen59,earlyRecoveryProgress58,floor23,floor24,earlyProgression58,__arch89,__arch90,__arch91,__arch93,_lastPlayerPos60,alert,ammoGeneration972,ammoSpawn967,archDecor1020,archDecor1023,architecture1020,architectureConnections51,artifactClaimed46,artifactDungeon46,artifactExit46,artifactHistory46,artifactPortal46,artifactReturn46,artifactReward46,bookWallMap1022,bookWalls1022,bossDefeated,bossDrop55,bossExitGate1020,bossPos60,bossZones54,branchLeaves92,branchRooms92,buildingPartition1026,choiceSideRooms95,choiceVariant60,cipher,coherentDecorCount94,connectedDecor81,cookbook57,coreLoot982,coreLootAudit982,corridorCells59,crumbleBase60,curseClocks991,dead,decals,decor,decorCanonical1029,decorRouteRepair1029,deepKey24_1020,discoveredPortals981,doorCleanup86,doorCount59,drunkBornTurn57,elementFields74,elementWard74,emergencyPath981,enemyDensity964,enemyEnergy,f20BossLock1020,f20Chambers1020,f20Content1020,f20Furnaces1020,f20KeyDepth1020,f20MazeZones1020,f20RewardSpots1020,f20WoodWings1020,f22HolyCells1023,f22Population43,f6Elite1023,f6LibraryGateR8,f6LibraryKeyR8,f6LibraryPrizeR8,f6Prize1023,featureRooms,finalConnectivity51,fixedExit,fixedStart,floor,floor21BlinkAuditR43,floor21FinalBlinkChoiceAuditR46,floor22RouteR44,floor23MercuryRepair1029,floor6GrandLibraryR8,floor6WaterBalanceR8,floor8GardenCourts1028,floorColorRollback971,floorFeeling62,floorKeys,floorKeysRequired,floorPattern1022,floorSeed60,floorStyle980,floorTrait47,floorTurn,focalRooms89,formalSymmetry1029,functional89,gazeBursts57,generatedBuild,generationBaseAttemptsR18,generationFinalKeyAttemptsR48,generationFinalKeyFailureR48,generationPipelineR18,generationProfile93,generationRejected51,generationRepair,generationRngAuditR59,generationSeedR59,goldIndoor1020,grandDecor90,grandRoom89,grassTone1020,grassTufts1020,guaranteedRelic1005,guardRooms59,harvested,hazard1005,hiddenBase60,hiddenGroups60,hiddenLookup60,hiddenReplacement60,holy991,intentBudget61,ironGate18_1020,itemBiasMoved94,itemBiasZones94,itemReach981,items,jarGasFields57,keyIntegrity48,keyPlan96,keyTrial94,knowledge56,landmarkCells71,landmarks,landmarks71,lastCombat57,lastCombat991,lastCombatReason57,lastKitchenFloor58,lastTrait47,lateItemRepair1004,layoutMode59,layoutMode85,layoutName,legacyUpgradeMigrated982,legendBuildings49,legendDecor47,legendDecorGrid47,legendFireFields47,legendIntegrity49,legendLandmark47,legendLights49,legendObjects49,legendPalette47,legendPaths49,legendPattern47,legendRegion49,legendSanctums47,legendSeed49,legendSkyAxes47,legendTerrain47,legendTheme47,libraryDesks52,libraryScrolls1022,libraryZones1022,log,lootHistory47,mainPathRooms92,mainRooms90,makgeolliHealHundredths57,map,midGate22_1020,midKey22_1020,miniVault62,minorPurpose90,noiseHistory01,monsterCrowding1027,monsterDenseRooms,monsters,neutralInteractables58,nextAllyId53,nextCombatantId54,orphanDoorsPruned1006,outdoorGate24_1020,outerWall94,peachBudget52,peachGeneration53,pendingGroundItems57,player,playerAgencyTurns57,portalEdges981,portalLinks981,portalMonsterLoad981,portalRooms981,portals981,postRouteLockAudit1005,preRouteKeyPlan1005,purposeCount90,purposeGuards90,purposeRooms90,qualityAudit981,qualityBaseAttempts980,qualityLockConservative980,qualityLockFallback980,qualityModules980,qualityRejected980,qualityVersion980,qualityVersion981,raftAudit981,raftFallback981,raftMain981,rafts,regionComplex71,repair60,repairedEntities71,repairedMonsters70,requiresBlink,restaurantRooms42,riverGenerationAttempts982,riverRule982,roomGraph92,roomGraph93,roomHints56,roomSplits89,roomTemplate92,roomTemplate93,rooms,routeDesign1005,routeKeyShrine1005,routeMetric1005,routeTags,rugPattern1022,rumorSpaceAudit1030,rumorSpaceClues1030,rumorSpaces1030,runEndEffects57,runId,runId984,runState57,saveSchema1004,saveSeq1004,saveVersion1004,saveWrittenAt1004,secretTreasure,seen,shopIntermission,skillHoldHint991,specialDecor1024,specialFloor,specialPlaces52,specialRevision60,stairMarkerAudit1029,stairs,status,story992,storyMap992,storyMode992,strategy85,strictLockAudit1004,subthemeFloors972,subthemeWalls970,switches,tempFields,tempTerrain74,terrainAttachment58,terrainMutationSeq57,terrainMutationVersion57,terrainUnderlay58,terrainUnderlayVersion58,theme2RoomIdentity1027,theme2Symmetry1027,themeDecorGroups1022,themeMotifCount1022,themeZones970,themedRooms87,turn,uniqueKilled,vaults,victory,visionPenalty,wallDecorSanitize1029,wallStyle980,windowRemoved88,windows86'.split(','));
const GAMESTATE_RUNTIME_FIELDS=Object.freeze('_movementDiscovery105,retiredItemMigration57,terrainRecovery58,legendLightingDirty49,_activeAmmo967,_worldTransition57,_forcedAdjacentTargetR8,_manualRangedTargetR8,_manualTerrainTargetR8,_spawnV60,_turnAgencyCounted57,_turnAgencyWillCount57,_turnPipelineActive57,attackUntil,blinkArmed61,blinkSpent52,cameraInspecting,evadeUntil,fullDetail78,generationInProgress57,integrity81,playerAttackOutcome57,playerAttackTarget,playerAttackUntil,playerHitUntil'.split(','));
function projectGameState(source=state){
  if(!source||typeof source!=='object'||Array.isArray(source))return null;
  if(source.debugBattle57)throw new Error('Debug battle state cannot be saved');
  const selected={};for(const key of GAMESTATE_FIELDS)if(Object.hasOwn(source,key))selected[key]=source[key];
  if(source.branchContext105&&source.branchTerrain105?.staticPacked105){
    const terrain=source.branchTerrain105;
    selected.branchTerrain105={...terrain,heights:undefined,surfaces:undefined,ramps:undefined,packed105:terrain.staticPacked105};
  }
  const plain=structuredClone(selected);
  plain.player=plain.player&&typeof plain.player==='object'?plain.player:null;
  plain.monsters=Array.isArray(plain.monsters)?plain.monsters:[];
  plain.seen=source.seen instanceof Set?[...source.seen]:(Array.isArray(source.seen)?[...source.seen]:[]);
  plain.grassTufts1020=source.grassTufts1020 instanceof Set?[...source.grassTufts1020]:(Array.isArray(source.grassTufts1020)?[...source.grassTufts1020]:[]);
  plain.saveVersion1004='v10.0.6';plain.saveSchema1004=1;
  plain.saveWrittenAt1004=Number(source.saveWrittenAt1004)||Date.now();plain.saveSeq1004=Number(source.saveSeq1004)||1;
  if(plain.player){delete plain.player.nextAttackAt;delete plain.player.busyUntil}
  for(const m of plain.monsters){delete m.hitUntil;delete m.evadeUntil;delete m.attackUntil;delete m.attackTarget;delete m.hitDir}
  branchPackWorld(plain);return plain;
}
function migrateGameState(candidate){
  if(!candidate||typeof candidate!=='object'||Array.isArray(candidate))throw Error('GameState object required');
  const schema=candidate.saveSchema1004==null?0:Number(candidate.saveSchema1004);if(!Number.isInteger(schema)||schema<0||schema>1)throw Error('Unsupported GameState schema');
  const migrated=projectGameState(candidate);if(!migrated)throw Error('GameState migration failed');branchPruneWorld(migrated);branchUnpackWorld(migrated);initializeMartial(migrated);return migrated;
}
const GameState=Object.freeze({
  initialize(source){
    source.branchWorld105=source.branchWorld105||{version:1,canalRevision105:1,pages:{}};source.branchContext105=source.branchContext105||null;source.branchPortals105=source.branchPortals105||[];
    // Complete gameplay defaults before any generation, rules or first paint.
    source.terrainReactions105=source.terrainReactions105||newTerrainReactions105();
    source.jarGasFields57=Array.isArray(source.jarGasFields57)?source.jarGasFields57:[];
    source.passiveRecoveryUnlocked57=source.passiveRecoveryUnlocked57??(source.floor>=11);
    source.lastDamageAgencyTurn57=Number.isFinite(source.lastDamageAgencyTurn57)?source.lastDamageAgencyTurn57:(source.playerAgencyTurns57||0);
    source.recentPlayerCells57=Array.isArray(source.recentPlayerCells57)?source.recentPlayerCells57:[];
    source.naturalPopulation57=source.naturalPopulation57||{initial:(source.monsters||[]).filter(isNaturalMonster).length,generation:0,nextAgency:null};
    noiseBudget=null;delete source.noiseHistory01;
    if(source.noiseHistory01){const h=source.noiseHistory01;h.multiplier=clamp(Number(h.multiplier)||1,1,3);h.pending=!!h.pending;h.lastNoiseTurn=Number.isFinite(h.lastNoiseTurn)?h.lastNoiseTurn:source.turn||0}
    const profile=source.generationProfile93??source.roomGraph93?.profile??null;
    source.generationProfile93=['braid','offset-halls','cluster-loop'].includes(profile)?profile:null;
    source.tempFields=Array.isArray(source.tempFields)?source.tempFields:[];
    for(const key of ['legendDecor47','legendTerrain47','neutralInteractables58','pendingGroundItems57'])source[key]=Array.isArray(source[key])?source[key]:[];
    source.shopIntermission=source.shopIntermission||null;
    source.terrainUnderlayVersion58=2;
    source.status=source.status||{};
    for(const key of ['swift','fortify','willBoost','foodHaste57','warm57','fireCoat57','poisonResist57','vitality57','freeStamina57'])if(!Number.isFinite(source.status[key]))source.status[key]=0;
    source.cookbook57=source.cookbook57||{grilled_fish:true};
    const knowledge=source.knowledge56=source.knowledge56||{};
    for(const key of ['potionMap','potionKnown','potionSeen','roomHints','clueSeen','talismanMap','talismanKnown','talismanSeen'])knowledge[key]=knowledge[key]||{};
    knowledge.talismanHistory=knowledge.talismanHistory||[];knowledge.talismanKnown.identify=true;
    source.player.foodVital57=Number(source.player.foodVital57)||0;initializeMartial(source);
    const h=source.hazard1005=source.hazard1005||{armed:{},collapsed:{},drownUntil:0,voidUntil:0,lastWarn:{}};
    h.armed=h.armed||{};h.collapsed=h.collapsed||{};h.lastWarn=h.lastWarn||{};
    return source;
  },
  project:projectGameState,migrate:migrateGameState,
  snapshot:()=>({owner:'GameState',schema:1,fields:[...GAMESTATE_FIELDS],runtimeFields:[...GAMESTATE_RUNTIME_FIELDS],derivedFields:['visible']})
});
/* ===== NEW-RUN PIPELINE: what a new run does around newGameCoreLifecycle, in order =====
   They replace the new-run stage registry (registerNew): the order below is the order the 14 registered stages ran in. */
function prepareNewRunSeed(ctx){const runSeed=(crypto?.randomUUID?.()||String(Date.now())+'-'+globalThis.__MANRU_RANDOM57__().toString(36).slice(2));window.__MANRU_RUN_SEED984=runSeed;ctx.data.camera984={desiredZoom:1,runSeed}}
function logAutoWalkHelp(){addLog('좌클릭/탭: 자동 이동 · X/이동: 자동 탐사. 적이 보이거나 피격되면 즉시 멈춘다.')}
function buildFloorDecorForNewRun(){if(state){vfBuildDecor();addLog('지역별 타일·벽 장식·몬스터 스프라이트가 활성화되었다.');updateAll()}}
function logMapArtNotice(){addLog('48px 세밀 스프라이트 · 가변 지도 크기 · 전술 금고방이 활성화되었다.');updateAll()}
function initPotionStateForNewRun(){pstate();addLog('비약·연막병·화유병이 활성화됐다.');updateAll()}
function markRedrawForNewRun(){RENDER_PERF_STATE.dirty=RENDER_PERF_STATE.panelDirty=RENDER_PERF_STATE.miniDirty=true}
function initKnowledgeForNewRun(){ensureKnowledge56();decorateAllItems56();logWithCategory('약병과 부적은 외형만으로 정체를 알 수 없다. 직업 시작품은 모두 식별되어 있으며, 새로 발견한 미감정품은 사용하거나 감정부적으로 확인한다.');updateAll()}
function initFoodForNewRun(){ensureFoodState();addLog('화로나 솥에서 재료를 조합해 비방을 발견할 수 있다.');updateAll()}
function resetTipsForNewRun(){closeCurrentTip(true);RC.tutorialQueue=[];RC.tutorialShowing=false;clearTimeout(coachTimer);coach.style.removeProperty('display');RC.lastActionAt=performance.now();if(!state?.tutorialEntry60)tip70('start','탭/클릭한 칸까지 이동한다. 방향키와 WASD로도 이동할 수 있다.','한 번 행동하면 적도 움직인다.')}
function initTalismansForNewRun(){ensure74();V74.first=null;V74.gearScroll=null;V74.target=null;setInteraction8('fusion74',false);setInteraction8('gear74',false);addLog(playerClassRules58().talismanFusion?'부적 개편: 6원소 생부적은 강하지만 역류한다. 감정된 기본 부적끼리는 합성으로 합성할 수 있다.':'천하장사는 부적을 합성할 수 없다. 강화부적은 육체에 괴력을 일으킨다.');updateAll()}
function centerCameraForNewRun(){CameraController.center();ConnectedDecor81.build();queuePlace81()}
function setupCameraForNewRun(ctx){const q=ctx.data.camera984||{};if(state){state.runId984=q.runSeed;cameraData.lastPlayerX=state.player.x;cameraData.lastPlayerY=state.player.y;CameraState.setMode('follow',false);CameraState.centerOnPlayer();/* TIMER EXCEPTION (docs/TIMER_AUDIT.md, to be resolved with the boot domain): the zoom limits depend on the game screen's laid-out size, which exists only after the screen switch that follows this stage; 90 ms waits for that layout. */setTimeout(()=>{CameraState.setZoom(q.desiredZoom??1,false)},90)}}
function initCursesForNewRun(){for(const slot of GEAR_SLOT_TYPES)if(state.player?.[slot]){state.player[slot].identified=true;state.player[slot].curseImmune991=true;delete state.player[slot].curse991}state.lastCombat57=state.turn;state.lastCombat991=state.turn;state.curseClocks991={};addLog('미감정 장비에는 저주가 숨어 있을 수 있다. 감정부적은 짧게 눌러 미감정품 하나를 골라 완전 감정한다.');addLog('기술 버튼: 짧게 누르면 지금 쓸 수 있는 기술 · 길게 누르면 강화 선택.');updateAll()}
function beforeNewRun(ctx){prepareNewRunSeed(ctx);return null}
function afterNewRun(ctx){
  logAutoWalkHelp();
  buildFloorDecorForNewRun();
  logMapArtNotice();
  initPotionStateForNewRun();
  markRedrawForNewRun();
  initKnowledgeForNewRun();
  initFoodForNewRun();
  resetTipsForNewRun();
  initTalismansForNewRun();
  centerCameraForNewRun();
  setupCameraForNewRun(ctx);
  initCursesForNewRun();
  showGameScreenIfPlaying();
  normalizeAllItems();
}
/* ===== LOAD PIPELINE: what a load does around loadGameCore, in order =====
   beforeLoad runs before the core and may reject the load; afterLoad runs after it. They replace the stage
   registry (registerLoad/resetLoad): the order below is the order the 15 registered stages ran in. */
function readLoadRequest(ctx,request){let raw=request?.raw||null,requested=request?.state||null;if(!raw&&!requested)try{raw=globalThis.__MANRU_SAVE1004__?.raw?.()}catch(error){console.warn('[manru] active run save unreadable',error)}if(!raw&&!requested){toast('v10.0.4에서 이어갈 탐사 기록이 없다.');return globalThis.__MANRU_LIFECYCLE__.abort(false)}const desiredZoom=request?.settings?.camera??cameraData.zoom,meta=requested||(()=>{try{const q=JSON.parse(raw);return q?.format==='MANRU_SAVE'&&q.state?q.state:q}catch(_){return null}})();window.__MANRU_RUN_SEED984=meta?.runId984||window.__MANRU_RUN_SEED984||'legacy';ctx.data.camera984={desiredZoom}}
function resetTipsAfterLoad(){closeCurrentTip(true);RC.tutorialQueue=[];RC.tutorialShowing=false;clearTimeout(coachTimer);coach.style.removeProperty('display');RC.lastActionAt=performance.now();showFloorTips();if(trainingActive()){if(!state.story992?.dispatchPending60)advanceEntryTutorial();return}setTimeout(()=>tip70('resume','자동 추적 카메라가 플레이어를 따라간다. ◎로 언제든 중심 복귀 가능.','추적=고정 추적 · 완만=데드존 · 자유=자유 시점'),500)}
function refreshTalismansAfterLoad(){if(state){ensure74(true);updateAll()}}
function centerCameraAfterLoad(){if(state?.artifactDungeon46){CameraController.center();return}if(state){CameraController.center()}}
function restoreWallAndBiasFields(){if(state){state.outerWall94=state.outerWall94||{};state.itemBiasZones94=state.itemBiasZones94||[];VisibilityService.compute();updateAll()}}
function restoreKeyPlan(){if(state){state.keyPlan96=state.keyPlan96||null;globalThis.__MANRU_TYPED_KEYS__?.hydrate?.();VisibilityService.compute();updateAll()}}
function restoreCoreLootAudit(){
    if(state?.shopIntermission?.active)return;
    if(state?.artifactDungeon46||state?.branchContext105){try{updateAll()}catch(error){ignoreError('ui refresh in the load hook (branch or legend floor)',error)};return}
    if(state){
      core982();migrateLegacyInventory();
      if(!state.coreLootAudit982){const S=schedule982();state.coreLootAudit982={floor:state.floor,chapter:chapter982()+1,upgrades:[...S.upgrades],heals:[...S.heals],groundUpgrades:(state.items||[]).filter(i=>i.talismanKind==='upgrade').length,groundHealing:(state.items||[]).filter(i=>i.type==='potion'&&['heal_small','heal_medium'].includes(i.potionKind)).length}}
      if(state.floor!==11){state.riverRule982=null;state.riverGenerationAttempts982=0;}
      if(state.floor===11&&state.raftAudit981&&!state.riverRule982)state.riverRule982={mustCross:true,pureWalk:!!state.raftAudit981.pureWalk,pureRaft:!!state.raftAudit981.pureRaft,blinkFallback:!!state.raftAudit981.exitBlinkFallback,ok:!state.raftAudit981.pureWalk&&!!state.raftAudit981.pureRaft&&!!state.raftAudit981.exitBlinkFallback};
      try{updateAll()}catch(error){ignoreError('ui refresh in the load hook',error)}
    }
  }
function restoreCameraAfterLoad(ctx,r){if(!r&&r!==undefined){return r}if(state?.dead){state=null;toast('사망한 탐사 기록은 되살릴 수 없다.');return false}const q=ctx.data.camera984||{};if(state){cameraData.lastPlayerX=state.player.x;cameraData.lastPlayerY=state.player.y;CameraState.setMode('follow',false);CameraState.centerOnPlayer();/* TIMER EXCEPTION (docs/TIMER_AUDIT.md, to be resolved with the boot domain): same wait for the laid-out game screen as in the new-run stage above. */setTimeout(()=>{CameraState.setZoom(q.desiredZoom??cameraData.zoom,false)},90)}return r}
function syncCurseClockAfterLoad(){if(state){state.lastCombat57=state.lastCombat57??state.lastCombat991??state.turn;syncCurseClocks991()}}
function showGameScreenIfPlaying(){if(state&&!state.dead&&!state.victory)setScreen('game')}
function sanitizeAfterLoad(ctx,r){sanitizeTransient1003();if(state){resetVisualState();updateAll()}return r}
function auditStrictLocksAfterLoad(){if(state&&!state.artifactDungeon46&&!state.branchContext105&&strictKeyFloors1004.has(state.floor))state.strictLockAudit1004=lockAudit96()||null}
function resolveHazardsAfterLoad(){if(state){hz();resolveAllStandingHazards1005('load');updateWardHud();VisibilityService.compute();updateAll()}}
function restoreArchitectureAfterLoad(){if(state?.shopIntermission?.active)return;if(state?.artifactDungeon46||state?.branchContext105){VisibilityService.compute();updateAll();return}if(state){/* Restore finalized architecture; migrate only the obsolete R66 foyer court. */migrateFloor2Layout67();retireLegacyVisualDecor64();restoreLibraryVisual1022();state.restaurantRooms42=Array.isArray(state.restaurantRooms42)?state.restaurantRooms42:[];state.archDecor1020=state.archDecor1020&&typeof state.archDecor1020==='object'?state.archDecor1020:{};state.archDecor1023=state.archDecor1023&&typeof state.archDecor1023==='object'?state.archDecor1023:{};globalThis.__MANRU_TYPED_KEYS__?.hydrate?.();VisibilityService.compute();updateAll()}}
function migrateArtifactReturnAfterLoad(){if(state&&!state.generatedBuild)state.generatedBuild=state.generationPipelineR18?.version||'legacy-unknown';if(state?.artifactReturn46){const {artifactReturn46:r}=state;if(r.schema46===2&&r.outer){r.outer={...r.outer,seen:Array.isArray(r.outer.seen)?r.outer.seen:[],visible:Array.isArray(r.outer.visible)?r.outer.visible:[],grassTufts1020:Array.isArray(r.outer.grassTufts1020)?r.outer.grassTufts1020:[]}}else{if(!r.generatedBuild)r.generatedBuild='legacy-unknown';const seen=Array.isArray(r.seen)?r.seen:[],visible=Array.isArray(r.visible)?r.visible:[];Object.assign(r,{seen,visible})}}for(const mon of state.monsters||[])if(/^(?:화산|월화) 궁수(?: · 문지기)?$/.test(mon.name)){mon.name=mon.name.replace('화산 궁수','월화 궁수');mon.monsterSpecies105=monsterSpeciesName(mon.name);mon.color='#b54222';mon.projectileImpact57={element:'fire',radius:2,turns:3};delete mon.legendSkill47;}state.legendFireFields47=Array.isArray(state.legendFireFields47)?state.legendFireFields47:[];state.legendTerrain47=Array.isArray(state.legendTerrain47)?state.legendTerrain47:[];for(const t of state.legendTerrain47){if(t?.ttl>0&&state.map?.[t.y]?.[t.x]===t.tile){setTerrainTile58(state.map,t.x,t.y,t.old);RuntimeTerrainOwner.temporary(t.x,t.y,t.tile,t.ttl,'legend-lava',{allowedOld:[t.old],source:'legend-legacy47'})}}state.legendTerrain47=[];state.legendDecor47=Array.isArray(state.legendDecor47)?state.legendDecor47:[];claimAudit46();syncEquip47()}
function beforeLoad(ctx){
  const out=readLoadRequest(ctx,...ctx.args);
  return out?.tag===MANRU_LIFECYCLE_ABORT?{stage:'camera-save',value:out.value}:null;
}
function afterLoad(ctx){
  resetTipsAfterLoad();
  refreshTalismansAfterLoad();
  centerCameraAfterLoad();
  restoreWallAndBiasFields();
  restoreKeyPlan();
  restoreCoreLootAudit();
  const camera=restoreCameraAfterLoad(ctx,ctx.result);if(camera!==undefined)ctx.result=camera;
  syncCurseClockAfterLoad();
  showGameScreenIfPlaying();
  const clean=sanitizeAfterLoad(ctx,ctx.result);if(clean!==undefined)ctx.result=clean;
  auditStrictLocksAfterLoad();
  resolveHazardsAfterLoad();
  normalizeAllItems();
  restoreArchitectureAfterLoad();
  migrateArtifactReturnAfterLoad();
}
const RunLifecycle={
  run(core,steps,args,kind){
    if(RuntimeState.lifecycle.depth)throw Error('Nested run replacement is not permitted');
    const save=globalThis.__MANRU_SAVE_SERVICE__,isNew=kind==='new';
    const prior={state,cols:COLS,rows:ROWS,seed:window.__MANRU_RUN_SEED984,phase:RuntimeState.lifecycle.phase,screen:currentScreen()};
    const ctx={kind,args:[...args],data:Object.create(null),result:undefined,aborted:false,abortStage:null};
    RuntimeState.lifecycle.depth++;RuntimeState.lifecycle.generation++;RuntimeState.lifecycle.phase=isNew?'creating':'loading';save.clearPending();
    setGenerationPresentation8(false);closeGameplayInteractionState57();RuntimeState.prepareRun();
    try{
      if(!isNew){
        let request=ctx.args[0];
        if(!request?.state&&!request?.raw){RuntimeState.lifecycle.phase='recovering';const recovery=save.recover();if(!recovery.ok||!recovery.candidate)throw Error('No eligible saved run');request={raw:recovery.candidate.raw};ctx.args[0]=request;RuntimeState.lifecycle.phase='loading'}
        if(request?.state){request={...request,state:GameState.migrate(request.state)};ctx.args[0]=request}
        const meta=request?.state||RuntimeState.lifecycle.parse(request.raw).state;if(!RunLifecycle.accepts(meta))throw Error('Ineligible saved run');
      }
      const rejected=steps.before(ctx);if(rejected){ctx.aborted=true;ctx.abortStage=rejected.stage;ctx.result=rejected.value}
      if(ctx.aborted)throw Error('Lifecycle rejected at '+ctx.abortStage);
      ctx.result=core(...ctx.args);if(ctx.result===false)throw Error('Load initialization rejected');
      steps.after(ctx);
      if(ctx.result===false||!state||state.dead||state.victory)throw Error('Candidate is not a playable run');RuntimeState.lifecycle.validate(state);
      const persistence=save.commit(kind);if(!persistence.ok)throw Error('Run persistence failed: '+persistence.failure);
      RuntimeState.lifecycle.phase='playing';RuntimeState.lifecycle.last={ok:true,kind,persistence};globalThis.__MANRU_STORY992__?.resume?.();return ctx.result;
    }catch(e){
      ctx.aborted=true;state=prior.state;COLS=prior.cols;ROWS=prior.rows;window.__MANRU_RUN_SEED984=prior.seed;RuntimeState.lifecycle.phase=prior.phase;RuntimeState.lifecycle.generation++;
      resetVisualState();resetTurnState();if(state){VisibilityService.compute();updateAll()}setScreen(prior.screen||'title');
      document.body.classList.toggle('run-active',!!state&&!state.dead&&!state.victory);
      RuntimeState.lifecycle.last={ok:false,kind,failure:String(e)};toast('탐사 기록을 적용하지 못했다. 이전 기록을 유지한다.');if(isNew)throw e;return false;
    }finally{
      RuntimeState.lifecycle.depth--;save.clearPending();RunLifecycle.refreshContinue();
    }
  },
  abort:manruLifecycleAbort,
  runNew:(...args)=>RunLifecycle.run(newGameCoreLifecycle,{before:beforeNewRun,after:afterNewRun},args,'new'),
  runLoad:(...args)=>RunLifecycle.run(loadGameCore,{before:beforeLoad,after:afterLoad},args,'load'),
  busy(){return RuntimeState.lifecycle.depth>0},
  generation(){return RuntimeState.lifecycle.generation},
  isCurrent(generation){return generation===RuntimeState.lifecycle.generation},
  accepts(meta){
    try{if(!meta||(meta.saveVersion1004!=null&&!['v10.0.4','v10.0.5','v10.0.6'].includes(meta.saveVersion1004))||(meta.saveSchema1004!=null&&meta.saveSchema1004!==1)||meta.dead||meta.victory)return false;
      const migrated=GameState.migrate(meta);RuntimeState.lifecycle.validate(migrated);const save=globalThis.__MANRU_SAVE_SERVICE__,rid=migrated.runId984;
      return !rid||(!save.deadRuns().has(rid)&&save.death()?.runId!==rid&&!(state?.runId984===rid&&(state.dead||state.victory)));
    }catch(error){console.warn('[manru] saved run cannot be continued',error);return false}
  },
  refreshContinue(){
    const b=document.getElementById('continueBtn');if(!b)return;
    const recovery=globalThis.__MANRU_SAVE_SERVICE__?.recover(),yes=!!recovery?.ok&&!!recovery.candidate;
    b.classList.toggle('noSave',!yes);b.onclick=RunLifecycle.continueRun;
  },
  continueRun(){requestGameFullscreen65();const recovery=globalThis.__MANRU_SAVE_SERVICE__?.recover();if(!recovery?.ok||!recovery.candidate){toast('v10.0.4에서 이어갈 탐사 기록이 없다.');return false}return RunLifecycle.runLoad({raw:recovery.candidate.raw})},
  terminate(next){
    if(!state||!['death','victory'].includes(next)||runState57()!=='playing')return false;
    if(next==='victory'&&state.player.hp<=0){die('동시 효과');return false}
    state.runState57=next;state.dead=next==='death';state.victory=next==='victory';RuntimeState.lifecycle.phase=next==='death'?'dead':'terminal';RuntimeState.lifecycle.generation++;
    runEndEffects(next);
    if(!RunLifecycle.busy()){const persistence=globalThis.__MANRU_SAVE_SERVICE__.terminal(next);RuntimeState.lifecycle.last={ok:persistence.ok,kind:next,persistence};if(persistence.ok&&next==='death')RuntimeState.lifecycle.phase='tombstoned';if(!persistence.ok)toast('종료 기록 저장에 실패했다.');RunLifecycle.refreshContinue()}
    return true;
  },
  snapshot(){return structuredClone({phase:RuntimeState.lifecycle.phase,generation:RuntimeState.lifecycle.generation,last:RuntimeState.lifecycle.last})}
};
function newGame(...args){requestGameFullscreen65();return RunLifecycle.runNew(...args)}
function loadGame(...args){requestGameFullscreen65();return RunLifecycle.runLoad(...args)}
  /* ----------------------- robust load for dynamic map sizes ----------------------- */
  const memoryStorage=Object.create(null);
  function lsGet(k){try{return localStorage.getItem(k)}catch(_){return Object.prototype.hasOwnProperty.call(memoryStorage,k)?memoryStorage[k]:null}}
  function lsSet(k,v){try{localStorage.setItem(k,String(v));return true}catch(_){memoryStorage[k]=String(v);return false}}
  function lsRemove(k){try{localStorage.removeItem(k)}catch(_){delete memoryStorage[k]}}
  /* ---------- save envelope / backup / import-export ---------- */
  const SAVE_VER=70;
  const slotKey=n=>`manruRC70_slot_${n}`;
  function buildSaveEnvelope(reason='manual'){
    const st=GameState.project(state);if(!st)return null;
    return{format:'MANRU_SAVE',version:SAVE_VER,build:RC.build,savedAt:new Date().toISOString(),reason,state:st,settings:{camera:globalThis.__MANRU_CAMERA_STATE12__.snapshot()?.mode||'follow',uiVolume:RC.uiVolume,sfx:lsGet('manruSfx54')!=='0'}};
  }
  function rawEnvelope(reason='manual'){const e=buildSaveEnvelope(reason);return e?JSON.stringify(e):null}
  function validateSaveState(st){
    if(!st||typeof st!=='object'||Array.isArray(st))throw new Error('세이브 상태 객체가 없다.');
    if(!Number.isInteger(st.floor)||st.floor<1||st.floor>25)throw new Error('층 정보가 올바르지 않다.');
    if(!Number.isFinite(st.turn)||st.turn<0)throw new Error('턴 정보가 올바르지 않다.');
    if(!Array.isArray(st.map)||st.map.length<3||st.map.length>256)throw new Error('맵 높이가 올바르지 않다.');
    const width=Array.isArray(st.map[0])?st.map[0].length:0;
    if(width<3||width>256||st.map.some(row=>!Array.isArray(row)||row.length!==width||row.some(tile=>!Number.isInteger(tile))))throw new Error('맵 타일 배열이 올바르지 않다.');
    const point=(q,name)=>{if(!q||!Number.isInteger(q.x)||!Number.isInteger(q.y)||q.x<0||q.y<0||q.x>=width||q.y>=st.map.length)throw new Error(`${name} 좌표가 올바르지 않다.`)};
    if(!st.player||typeof st.player!=='object')throw new Error('플레이어 정보가 없다.');point(st.player,'플레이어');
    if(!Array.isArray(st.player.inventory))throw new Error('인벤토리 정보가 올바르지 않다.');
    point(st.stairs,'계단');
    for(const [name,list] of [['몬스터',st.monsters],['아이템',st.items]]){if(!Array.isArray(list))throw new Error(`${name} 목록이 올바르지 않다.`);if(list.length>4096)throw new Error(`${name} 목록이 비정상적으로 크다.`);for(const q of list)point(q,name)}
    if(!(Array.isArray(st.seen)||st.seen instanceof Set))throw new Error('시야 기록이 올바르지 않다.');
    if(st.visible!=null&&!(Array.isArray(st.visible)||st.visible instanceof Set))throw new Error('현재 시야가 올바르지 않다.');
    return st;
  }
  function parseEnvelope(raw){
    if(typeof raw!=='string'||!raw.length||raw.length>16*1024*1024)throw new Error('세이브 파일 크기가 올바르지 않다.');
    const p=JSON.parse(raw);
    if(p?.format==='MANRU_SAVE'&&p.state){if(Number.isFinite(p.version)&&p.version>SAVE_VER)throw new Error('더 새로운 형식의 세이브다.');const migrated=GameState.migrate(p.state);validateSaveState(migrated);return{...p,state:migrated}}
    if(p?.player&&p?.map){const migrated=GameState.migrate(p);validateSaveState(migrated);return{format:'MANRU_SAVE',version:0,build:'legacy',savedAt:null,reason:'legacy',state:migrated,settings:{}}}
    throw new Error('만루 세이브 형식이 아니다.');
  }
    function saveSlot(n){const result=globalThis.__MANRU_SAVE_SERVICE__.commit('manual');toast(result.ok?'기록 저장 완료.':'기록 저장에 실패했다.');RunLifecycle.refreshContinue();return result}
  function loadRaw(raw,label='세이브'){
    if(!raw){toast(label+'가 없다.');return false}
    const ok=loadGame({raw,label,source:'slot70'});if(ok){RC.lastActionAt=performance.now();closeReleasePanel();toast(label+' 불러오기 완료.')}return ok;
  }
  function loadSlot(n){return loadRaw(lsGet(slotKey(n)),`슬롯 ${n}`)}
      function slotMeta(n){
    try{const raw=lsGet(slotKey(n));if(!raw)return null;const e=parseEnvelope(raw),s=e.state;return{floor:s.floor,turn:s.turn,level:s.player?.level||1,at:e.savedAt}}catch(_){return{broken:true}}
  }
  function refreshSlots(){
    const host=document.getElementById('rcSlots70');if(!host)return;
    host.innerHTML=[1,2,3].map(n=>{const m=slotMeta(n);const txt=!m?'비어 있음':m.broken?'손상됨':`${m.floor}층 · TURN ${m.turn} · LV ${m.level}<br>${m.at?new Date(m.at).toLocaleString():'구버전'}`;return`<div class="rc70Save"><div><b>슬롯 ${n}</b><small>${txt}</small></div><div class="actions"><button data-rcsave="${n}">저장</button><button data-rcload="${n}" ${!m||m.broken?'disabled':''}>불러오기</button></div></div>`}).join('');
    host.querySelectorAll('[data-rcsave]').forEach(b=>b.onclick=()=>saveSlot(+b.dataset.rcsave));
    host.querySelectorAll('[data-rcload]').forEach(b=>b.onclick=()=>loadSlot(+b.dataset.rcload));
  }
  function exportSaveFile(){
    if(!state){toast('내보낼 진행이 없다.');return}
    const raw=rawEnvelope('export'),blob=new Blob([raw],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`manru-save-F${state.floor}-T${state.turn}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),800);toast('세이브 파일 생성.');
  }
  async function importFile(file){
    if(!file)return;try{const raw=await file.text();parseEnvelope(raw);if(!loadRaw(raw,'가져온 세이브'))throw new Error('가져온 세이브를 적용하지 못했다.');refreshSlots()}catch(e){document.getElementById('rcDiag70').textContent=`가져오기 실패: ${e.message}`;toast('올바른 세이브 파일이 아니다.')}
  }
// v10.0.4 canonical loader owns continue/load; legacy snapshot fallback removed.
  function loadGameCore(request=null){
    let raw=request?.raw||null;
    if(!request?.state&&!raw)try{raw=globalThis.__MANRU_SAVE1004__?.raw?.()}catch(error){console.warn('[manru] active run save unreadable',error)}
    if(!request?.state&&!raw){toast('v10.0.4에서 이어갈 탐사 기록이 없다.');return false}
    try{
      const env=request?.state?{state:request.state,settings:request.settings||{}}:parseEnvelope(raw),st=env.state;
      if(st?.saveVersion1004&&!['v10.0.4','v10.0.5','v10.0.6'].includes(st.saveVersion1004))throw new Error('다른 빌드의 세이브다.');
      restoreState(st);
      // the aim target is runtime-only state of the previous run (a monster object or a jar cell): it must not outlive a load
      AIM_STATE.target=null;AIM_STATE.jar=null;if(state)state._manualTerrainTargetR8=null;
      if(env.settings?.camera)try{globalThis.__MANRU_CAMERA_STATE12__.setMode(env.settings.camera)}catch(error){ignoreError('saved camera mode could not be applied',error)}
      if(Number.isFinite(env.settings?.uiVolume)){RC.uiVolume=env.settings.uiVolume;lsSet('manruUiVolume70',String(RC.uiVolume))}
      RC.lastActionAt=performance.now();if(!request?.label)toast('불러오기 완료.');return true
    }catch(e){toast('저장 데이터를 복구하지 못했다.');return false}
  }
  function migrateLegacyInventory(){
    if(!state?.player||state.legacyUpgradeMigrated982)return 0;let n=0;const up=upgradeProto();if(!up)return 0;
    const kept=[];for(const i of state.player.inventory||[]){if(isLegacyUpgrade(i)){n+=i.count||1}else kept.push(i)}state.player.inventory=kept;
    n+=Math.max(0,state.player.upgradeMarks||0);state.player.upgradeMarks=0;state.legacyUpgradeMigrated982=true;
    if(n){const item=clone(up);item.count=n;addInventoryItem(item);addLog(`구형 개량 자원 ${n}개를 강화부적으로 전환했다.`)}
    return n;
  }
  /* ===== MANRU v10.0.4: Nevanda-informed compact heroes r2 / equipment layers / isolated saves ===== */
  const SAVE_RELEASE_TAG='v10.0.6';
    const SAVE1004='manru1004_active_run';
    const SHADOW='manru1004_active_run_shadow';
    const DEADRUNS='manru1004_dead_runs';
    const LEGACY_RUN='manru984_active_run';
    const BOOT_RECOVERY='manru1004_boot_recovery_raw';
    /* ---------- save namespace: never auto-open a previous-build run ---------- */
    function purgeLegacy1004(){
      try{
        const drop=[];
        for(let i=0;i<localStorage.length;i++){
          const key=localStorage.key(i);if(!key)continue;
          if(key===LEGACY_RUN||key===LEGACY_DEATH1004||/^manruV\d+Save$/i.test(key)||/^manruRC70_(?:slot|backup|autosave)/i.test(key))drop.push(key);
        }
        for(const key of drop)localStorage.removeItem(key);
      }catch(error){ignoreError('legacy save cleanup could not scan storage',error)}
    }
    // r57: legacy autosave writers and registrations are deleted at their canonical sources.
    function candidate1004(raw,source='unknown'){
      if(!raw)return null;
      try{
        const q=JSON.parse(raw),meta=q?.format==='MANRU_SAVE'&&q.state?q.state:q;
        if((q?.format==='MANRU_SAVE'&&q.version>70)||!RunLifecycle.accepts(meta))return null;
        return{raw,meta,source,written:Number(meta.saveWrittenAt1004)||Date.parse(q?.savedAt||'')||0,seq:Number(meta.saveSeq1004)||0,turn:Number(meta.turn)||0};
      }catch(_){return null}
    }
    function newer1004(a,b){
      if(!a)return b;if(!b)return a;
      if(a.written!==b.written)return a.written>b.written?a:b;
      if(a.seq!==b.seq)return a.seq>b.seq?a:b;
      if(a.turn!==b.turn)return a.turn>b.turn?a:b;
      if(a.source==='primary')return a;if(b.source==='primary')return b;
      return a;
    }

    const SaveService=Object.freeze({
      commit:writeRun,
      recover(){
        const transaction=SaveService.recoverTransaction();if(!transaction.ok)return{...transaction,candidate:null};
        try{
          const primary=candidate1004(localStorage.getItem(SAVE1004),'primary'),shadow=candidate1004(localStorage.getItem(SHADOW),'shadow'),recovered=primary||shadow?null:candidate1004(sessionStorage.getItem(BOOT_RECOVERY),'recovery');
          const best=newer1004(newer1004(primary,shadow),recovered);if(!best)return{ok:true,candidate:null};
          // Both alternating slots are already durable. Reading the newer slot must
          // not duplicate two large floor snapshots into a third transaction journal.
          if(best.source==='recovery'){
            localStorage.setItem(SAVE1004,best.raw);if(localStorage.getItem(SAVE1004)!==best.raw)throw Error('recovery read-back mismatch');
            sessionStorage.removeItem(BOOT_RECOVERY);
          }
          return{ok:true,candidate:best};
        }catch(e){return{ok:false,failure:'recovery',message:String(e),candidate:null}}
      },
      serialize:GameState.project,
      deadRuns:deadRuns1004,death:deathMeta1004,purgeLegacy:purgeLegacy1004,
      record(result){const audit=RuntimeState.persistence;audit.last=result;audit.history.push(result);if(audit.history.length>100)audit.history.shift();return result},
      settle(record){
        const errors=[];
        for(const [key,value] of record.complete||record.before){try{if(localStorage.getItem(key)!==value){if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,value)}if(localStorage.getItem(key)!==value)throw Error('rollback verification');}catch(e){errors.push({key,message:String(e)})}}
        if(!errors.length)try{localStorage.removeItem(TRANSACTION);if(localStorage.getItem(TRANSACTION)!==null)throw Error('journal removal')}catch(e){errors.push({key:TRANSACTION,message:String(e)})}
        return{ok:!errors.length,errors};
      },
      recoverTransaction(){
        try{
          // Replay the local journal first, then the independent terminal intent. A death must
          // win over an interrupted earlier save, including failure to prepare its journal.
          for(const storageKey of [TRANSACTION,TERMINAL_INTENT]){
          let store=localStorage,raw;
          if(storageKey===TERMINAL_INTENT){try{store=sessionStorage;raw=store.getItem(storageKey)}catch(_){continue}}
          else raw=store.getItem(storageKey);
          if(!raw)continue;
          const record=JSON.parse(raw),allowed=[SAVE1004,SHADOW,DEATH1004,DEADRUNS];
          if(record.version!==1||!Array.isArray(record.before)||record.before.length>4||record.before.some(row=>!Array.isArray(row)||!allowed.includes(row[0])||(row[1]!==null&&typeof row[1]!=='string')))throw Error('invalid transaction journal');
          if(record.complete&&(!Array.isArray(record.complete)||record.complete.length>4||record.complete.some(row=>!Array.isArray(row)||!allowed.includes(row[0])||(row[1]!==null&&typeof row[1]!=='string'))))throw Error('invalid terminal journal');
          if(storageKey===TERMINAL_INTENT&&!record.complete)throw Error('missing terminal intent');
          const rollback=SaveService.settle(record);if(!rollback.ok)return{ok:false,failure:'recovery',rollback};
          if(record.complete)sessionStorage.removeItem(BOOT_RECOVERY);
          if(storageKey===TERMINAL_INTENT){store.removeItem(storageKey);if(store.getItem(storageKey)!==null)throw Error('terminal intent removal')}
          }
          return{ok:true};
        }catch(e){return{ok:false,failure:'recovery',message:String(e)}}
      },
      transact(entries,reason,completeOnRecovery=false){
        const result={ok:false,committed:false,source:'active-run',reason,primaryWritten:false,shadowWritten:false,failure:null};
        const recovery=SaveService.recoverTransaction();if(!recovery.ok)return SaveService.record({...result,...recovery});
        let record,prepared=false,phase='journal';
        try{
          record={version:1,before:entries.map(([key])=>[key,localStorage.getItem(key)])};if(completeOnRecovery)record.complete=entries;
          const journal=JSON.stringify(record);
          if(completeOnRecovery)try{sessionStorage.setItem(TERMINAL_INTENT,journal);if(sessionStorage.getItem(TERMINAL_INTENT)!==journal)throw Error('terminal intent verification')}catch(e){result.backupFailure=String(e)}
          localStorage.setItem(TRANSACTION,journal);prepared=true;
          if(localStorage.getItem(TRANSACTION)!==journal)throw Error('journal verification');
          for(const [key,value] of entries){
            phase=key===SHADOW?'shadow':key===SAVE1004?'primary':'terminal';
            if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,value);
            if(key===SHADOW)result.shadowWritten=true;if(key===SAVE1004)result.primaryWritten=true;
            phase='verification';if(localStorage.getItem(key)!==value)throw Error('save read-back mismatch');
          }
          phase='commit';localStorage.removeItem(TRANSACTION);if(localStorage.getItem(TRANSACTION)!==null)throw Error('commit marker removal');
          if(completeOnRecovery)try{sessionStorage.removeItem(TERMINAL_INTENT)}catch(e){result.backupCleanupFailure=String(e)}
          result.ok=true;result.committed=true;return SaveService.record(result);
        }catch(e){result.failure=phase;result.message=String(e);if(prepared){if(record.complete)result.recoveryPending=true;else result.rollback=SaveService.settle(record);}return SaveService.record(result)}
      },
      request(reason='action'){
        if(state?.debugBattle57)return{ok:true,committed:false,source:'debug-battle'};
        RuntimeState.persistence.pending=true;
        if(ACTION_AUDIT5.stack.length||state?._turnPipelineActive57||globalThis.__MANRU_LIFECYCLE__?.busy?.())return{ok:true,committed:false,deferred:true};
        return SaveService.flush(reason);
      },
      flush(reason='action',action=null,noTimeCommit=true){
        if(state?.debugBattle57)return{ok:true,committed:false,source:'debug-battle'};
        if(ACTION_AUDIT5.stack.length||globalThis.__MANRU_LIFECYCLE__?.busy?.())return{ok:true,committed:false,deferred:true};
        const requested=RuntimeState.persistence.pending||(action?.committed&&(action.advancesWorld||noTimeCommit));RuntimeState.persistence.pending=false;
        if(action?.persistence)return action.persistence;
        if(!requested||!state||state.dead||state.victory)return{ok:true,committed:false,source:'no-action'};
        const result=SaveService.commit(reason);if(!result.ok)toast('기록 저장에 실패했다.');return result;
      },
      clearPending(){RuntimeState.persistence.pending=false},
      terminal(kind){
        if(state?.debugBattle57)return{ok:true,committed:false,source:'debug-battle'};
        RuntimeState.persistence.pending=false;const entries=[];
        if(kind==='death'){
          const rid=state?.runId984||null,ids=[...deadRuns1004()].filter(x=>x!==rid);if(rid)ids.push(rid);
          entries.push([DEATH1004,JSON.stringify({at:Date.now(),runId:rid,floor:state?.floor||0,turn:state?.turn||0,version:SAVE_RELEASE_TAG})],[DEADRUNS,JSON.stringify(ids.slice(-64))]);
        }
        entries.push([SHADOW,null],[SAVE1004,null]);const result=SaveService.transact(entries,kind,true);
        if(result.ok){sessionStorage.removeItem(BOOT_RECOVERY);purgeLegacy1004()}return result;
      },
      snapshot(){return structuredClone(RuntimeState.persistence)}
    });
    function writeRun(reason='explicit'){
      if(state?.debugBattle57)return{ok:true,committed:false,source:'debug-battle'};
      if(!state||state.dead||state.victory)return SaveService.record({ok:false,committed:false,failure:'inactive',source:'active-run',reason});
      let plain,raw,result;
      try{plain=GameState.project(state);plain.saveWrittenAt1004=Date.now();plain.saveSeq1004=(Number(state.saveSeq1004)||0)+1;raw=JSON.stringify(plain)}
      catch(e){result=SaveService.record({ok:false,committed:false,failure:'serialization',source:'active-run',reason,message:String(e)})}
      if(!result){
        // The two save slots alternate. A completed write leaves the previous
        // turn untouched in the other slot, so a failed write still has a
        // recoverable run without copying both saves into a journal each turn.
        const key=plain.saveSeq1004%2?SAVE1004:SHADOW;
        try{
          localStorage.setItem(key,raw);
          if(localStorage.getItem(key)!==raw)throw Error('save read-back mismatch');
          result=SaveService.record({ok:true,committed:true,source:'active-run',reason,primaryWritten:key===SAVE1004,shadowWritten:key===SHADOW,failure:null});
        }catch(e){
          result=SaveService.record({ok:false,committed:false,source:'active-run',reason,primaryWritten:false,shadowWritten:false,failure:'write',message:String(e)});
        }
      }
      if(result.ok){state.saveVersion1004=SAVE_RELEASE_TAG;state.saveSchema1004=1;state.saveWrittenAt1004=plain.saveWrittenAt1004;state.saveSeq1004=plain.saveSeq1004;purgeLegacy1004()}
      const frame=ACTION_AUDIT5.stack[0];if(frame)frame.result.persistence=result;return result;
    }
    function deadRuns1004(){try{const a=JSON.parse(localStorage.getItem(DEADRUNS)||'[]');return new Set(Array.isArray(a)?a.filter(Boolean).slice(-64):[])}catch(_){return new Set()}}
    function currentRaw(){return SaveService.recover().candidate?.raw||null}
function normalizeSavedItem(it){
  if(!it)return it;const d=defBy(it.name);if(!d)return it;
  const old52={'대나무창':0,'철두창':3,'삼각창':5,'당파':10,'사냥용 목궁':0,'병사용 반궁':3,'강화 각궁':6,'정량궁':8,'단단한 철궁':10};if(Object.prototype.hasOwnProperty.call(old52,it.name)&&!it.balance52){it.atk=(it.atk||0)+(d.atk-old52[it.name]);it.balance52=true;}
  // only sync audited mechanics/text; preserve upgrades, curses, coordinates and instance state
  for(const k of ['speed','range','focusChain','edgeBonus','chain','knockback','parry','tracking','staggerResist','focusRegen','eatSpeed','trapGuard','ability','desc']){
    if(Object.prototype.hasOwnProperty.call(d,k))it[k]=d[k];else if(['focusChain','edgeBonus','chain','parry','tracking','staggerResist','focusRegen','eatSpeed','trapGuard'].includes(k))delete it[k];
  }
  if(it.type==='ingredient'&&d.throwElement105)for(const key of ['throwable','throwRange','throwElement105','color','useCost'])it[key]=d[key];
  if(it.type==='armor')syncArmorDefense(it);if(it.name==='두꺼운 면망토')delete it.hazardResist;
  return it;
}
function worldTargetActive57(){return !!WORLD_TARGET}
// Phase 5: one invocation registry; entries reference their existing implementation.
const ACTION_ROUTES5=new Map(),ACTION_AUDIT5={serial:0,roots:0,stack:[],history:[]};
function retiredPainterItem57(item){return !!item&&String(item.name||'').replace(/\s+/g,'')==='화공노인의수목화'}
function requestGameFullscreen65(){
 fullscreenWanted66=true;
 if(document.fullscreenElement){fullscreenResume66=false;return false}
 fullscreenResume66=true;
 if(document.hidden||fullscreenPending65||!document.documentElement.requestFullscreen||navigator.userActivation?.isActive===false)return false;
 fullscreenPending65=true;
 document.documentElement.requestFullscreen({navigationUI:'hide'}).then(()=>{fullscreenResume66=false}).catch(()=>{fullscreenResume66=true}).finally(()=>{fullscreenPending65=false});return true;
}
function runEndEffects(kind){if(!state||state.runEndEffects57||runState57()!==kind)return false;state.runEndEffects57=true;closeGameplayInteractionState57();for(const effect of RUN_END_EFFECTS)effect(kind);return true}
  function qaRestore60(){if(!qaSnapshot60)return false;restoreGenerationSnapshot(qaSnapshot60);resetVisualState();resetTurnState();FX.transition=null;VisibilityService.compute();updateAll();return true}
  /* ---------- contextual tutorial ---------- */
  function tipLedger66(){
    let ledger;try{ledger=JSON.parse(lsGet('manruTutorialAccount66'))}catch(error){console.warn('[manru] tutorial ledger unreadable',error)}
    if(!ledger||ledger.version!==1){ledger={version:1,seen:{...(state?.tutorialSeen59||{})}};lsSet('manruTutorialAccount66',JSON.stringify(ledger))}
    return ledger;
  }
  function resetTips70(){
    try{lsKeys70().filter(k=>k.startsWith('manruTip70:')).forEach(k=>lsRemove(k))}catch(error){ignoreError('tip reset could not clear keys',error)}
    closeCurrentTip(true);lsSet('manruTutorialAccount66',JSON.stringify({version:1,seen:{}}));if(state)state.tutorialSeen59={};RC.tutorialQueue=[];closeReleasePanel();tip70('start','탭/클릭한 칸까지 자동 이동한다. 모바일과 PC 모두 8방향 이동을 지원한다.','모바일 길게 누르기 / PC 우클릭 = 조사 · Q 짧게 = 무술 · Q 길게 = 강화');showFloorTips();
  }
  function ensure74(restoring=false){
    if(!state)return;const K=K74();state.tempTerrain74=Array.isArray(state.tempTerrain74)?state.tempTerrain74:[];state.elementFields74=Array.isArray(state.elementFields74)?state.elementFields74:[];state.elementWard74=state.elementWard74||null;
    if(!restoring)for(const m of state.monsters||[]){m.burn74=m.burn74||0;m.poison74=m.poison74||0}
    for(const it of [...(state.items||[]),...(state.player?.inventory||[])])if(it?.fusion74){if(it.talismanKind==='f_holy_upgrade'){it.element74='holy';it.fusionMode74='gear';it.fusionEffect74=null;it.targeted=false;it.ability='무기 언데드 추가피해 +5 / 방어구 언데드 피해 15% 감소';it.desc='성광을 장비에 각인한다. 무기는 기존 금강령 퇴와 같은 성속성 추가피해 계통을 사용하고, 방어구는 언데드에게 받는 직접 피해를 소폭 줄인다.'}K.talismanKnown[it.talismanKind]=true;}
  }
  function core982(){
    if(!state)return null;
    const C=state.coreLoot982||(state.coreLoot982={version:V982.version,chapters:{},spawned:{upgrade:{},heal:{}}});
    C.version=V982.version;C.chapters=C.chapters||{};C.spawned=C.spawned||{upgrade:{},heal:{}};C.spawned.upgrade=C.spawned.upgrade||{};C.spawned.heal=C.spawned.heal||{};
    return C;
  }
  function chapter982(f=state?.floor||1){return Math.max(0,Math.min(4,Math.floor((f-1)/5)))}
  function schedule982(ch=chapter982()){
    const C=core982();if(!C)return null;const key=String(ch);if(C.chapters[key])return C.chapters[key];
    const start=ch*5+1,floors=[start,start+1,start+2,start+3],roll=shuffle([...floors]);
    const upgrades=roll.slice(0,V982.upgradesPerChapter).sort((a,b)=>a-b),omitted=floors.find(f=>!upgrades.includes(f));
    const second=upgrades[Math.floor(globalThis.__MANRU_RANDOM57__()*upgrades.length)];
    const heals=[omitted,second].sort((a,b)=>a-b);
    return C.chapters[key]={upgrades,heals};
  }
    const DEATH1004='manru1004_last_death';
// Isolated observer arena. All damage, movement, faction and scaling rules stay in the combat core.
function debugBattleMap57(fresh=false){
 const b=DEBUG_BATTLE57,mode=document.getElementById('battleMap57').value,floor=clamp(Math.floor(+document.getElementById('battleMapFloor57').value||9),1,25),key=mode+':'+floor;
 if(fresh||!b.mapTemplate||b.mapKey!==key){
  if(mode==='current'&&b.previous.state?.map?.length){state=structuredClone(b.previous.state);COLS=state.map[0].length;ROWS=state.map.length;}
  else{state=createRunState57(CLASSES[0]);state.debugMapGeneration57=true;state.runId984='debug-'+Date.now()+'-'+(++b.mapSerial||1);state.branchWorld105={version:1,pages:{}};GameState.initialize(state);
   if(mode.startsWith('palace'))buildBranch('palace',mode==='palace2'?2:1);
   else{state.floor=mode==='normal'?9:floor;NormalFloorGenerator.generate();}
  }
  // Keep architecture, props, layers, lights and tide data; empty only encounter contents.
  state.monsters=[];state.items=[];state.pendingGroundItems57=[];state.neutralInteractables58=[];state.shopIntermission=null;state.log=[];delete state.debugMapGeneration57;
  for(const name of ['tempFields','tempTerrain74','elementFields74','legendFireFields47','legendSkyAxes47','artifactFields46','gazeBursts57','jarGasFields57'])state[name]=[];
  state.player=structuredClone(createRunState57(CLASSES[0]).player);state.dead=false;state.victory=false;state.runState57='playing';state.turn=state.floorTurn=0;state.status=structuredClone(createRunState57(CLASSES[0]).status);
  b.mapTemplate=structuredClone(state);b.mapKey=key;b.spawnAnchors=null;b.roomKey=null;
 }
 state=structuredClone(b.mapTemplate);COLS=state.map[0].length;ROWS=state.map.length;GameState.initialize(state);
 state.debugBattle57=true;state.debugBattleIgnoreTerrain57=document.getElementById('battleTerrain57').checked;state.debugBattlePlantMove57=document.getElementById('battlePlantMove57').checked;
 state.player.x=state.player.y=-1000;state.player.name='관전자';
 // Pick one real room for initial encounters so teams share a connected combat space.
 const probe={kind:'human',hp:1,footprint:'one'},rooms=state.rooms.map((r,i)=>({r,i,cells:[]}));
 for(const entry of rooms){const r=entry.r;for(let y=Math.max(1,r.y);y<Math.min(ROWS-1,r.y+r.h);y++)for(let x=Math.max(1,r.x);x<Math.min(COLS-1,r.x+r.w);x++)if(PlacementService.monsterCanStand(probe,x,y))entry.cells.push({x,y});}
 b.rooms=rooms.filter(e=>e.cells.length>=12).sort((a,c)=>c.cells.length-a.cells.length);
 const select=document.getElementById('battleRoom57');select.replaceChildren();if(b.roomKey===-1){const custom=document.createElement('option');custom.value='-1';custom.textContent='직접 지정한 출발점';select.append(custom);}for(const e of b.rooms){const option=document.createElement('option');option.value=e.i;option.textContent=e.r.name||`구역 ${e.i+1} · ${e.r.w}×${e.r.h}`;select.append(option)}
 const chosen=b.roomKey===-1?null:b.rooms.find(e=>e.i===b.roomKey)||b.rooms[0];if(chosen){b.roomKey=chosen.i;select.value=String(chosen.i);if(!b.spawnAnchors){const r=chosen.r,vertical=r.h>r.w,cx=r.cx??r.x+r.w/2,cy=r.cy??r.y+r.h/2,span=Math.max(2,Math.min(7,(vertical?r.h:r.w)/3));b.spawnAnchors={A:{x:cx-(vertical?0:span),y:cy-(vertical?span:0)},B:{x:cx+(vertical?0:span),y:cy+(vertical?span:0)}};}}
 b.spawnAnchors??={A:{x:COLS/2-5,y:ROWS/2},B:{x:COLS/2+5,y:ROWS/2}};
 document.getElementById('battleMapName57').textContent=state.layoutName+' · '+COLS+'×'+ROWS;
 document.getElementById('battleMapFloor57').disabled=mode!=='main';document.getElementById('battleRoom57').disabled=!b.rooms.length;
}
function resetTurnState(){if(!state)return;/* fractional enemy-energy debt is intentionally preserved; zeroing it would let stair/reset actions erase scheduler cost */state.enemyEnergy=state.enemyEnergy||0}
const ActionDispatcher=Object.freeze({
  register(type,implementation){if(ACTION_ROUTES5.has(type))throw new Error('duplicate action route: '+type);ACTION_ROUTES5.set(type,implementation)},
  denied(reason){const frame=ACTION_AUDIT5.stack[ACTION_AUDIT5.stack.length-1];if(frame)frame.denial=reason},
  commitNoTime(){const frame=ACTION_AUDIT5.stack[ACTION_AUDIT5.stack.length-1];if(frame)frame.committed=true},
  observeTurn(result){const frame=ACTION_AUDIT5.stack[ACTION_AUDIT5.stack.length-1];if(frame)frame.turns.push(result)},
  dispatch(command){
    const type=command?.type,route=ACTION_ROUTES5.get(type),special=['TARGET_MOVE','TARGET_CONFIRM','TARGET_CANCEL','QUICK_SLOT'].includes(type);
    if(!route&&!special)return{handled:false,attempted:false,committed:false,successful:false,status:'ignored',reason:'unknown-command',timeCost:0,advancesWorld:false,value:undefined};
    const entry=state,parent=ACTION_AUDIT5.stack[ACTION_AUDIT5.stack.length-1],before={turn:entry?.turn||0,floorTurn:entry?.floorTurn||0,agency:entry?.playerAgencyTurns57||0,run:entry?.runId984,floor:entry?.floor,dead:!!entry?.dead,panels:activeGameplayPanels57().map(panel=>panel.id)};
    const result={id:++ACTION_AUDIT5.serial,parentId:parent?.result.id||null,command:type,source:command.source||'internal',handled:true,attempted:true,committed:false,successful:false,status:'attempted',reason:type,timeCost:0,advancesWorld:false,playerDied:false,lifecycleAborted:false,pending:false,turns:[],children:[],value:undefined};
    const frame={result,turns:result.turns,denial:null};if(!parent)ACTION_AUDIT5.roots++;ACTION_AUDIT5.stack.push(frame);
    let completed=false;
    try{
      let args=command.args;
      if(!args){
        if(type==='MOVE')args=[command.dx,command.dy];
        else if(type==='MARTIAL')args=[command.id];
        else if(type==='ITEM_USE'||type==='ITEM_DROP')args=[command.index];
        else if(type==='CLOSE_DOOR')args=[command.quiet??false];
        else args=[];
      }
      if(route)result.value=route(...args);
      else if(type==='TARGET_CANCEL')result.value=dismissGameplayInput57();
      else if(type==='TARGET_MOVE')result.value=worldTargetDirection57(command.dx,command.dy);
      else if(type==='QUICK_SLOT')result.value=globalThis.__MANRU_BELT62__?.use?.(command.slot);
      else if(type==='TARGET_CONFIRM'){
        const q=command.cell,potion=globalThis.__MANRU_POTION41_ACTIONS__,fusion=globalThis.__MANRU_TALISMAN74_ACTIONS__,talisman=globalThis.__MANRU_CONSUMABLE56_ACTIONS__;
        if(!q){result.attempted=false;result.reason='missing-cell'}
        else if(worldTargetActive57())result.value=finishWorldTarget(q,command.source||'pointer');
        else if(potion?.target?.())result.value=!!potion.throwAt?.(q.x,q.y);
        else if(fusion?.target?.())result.value=!!fusion.castTarget?.(q.x,q.y);
        else if(talisman?.target?.())result.value=!!talisman.castTarget?.(q.x,q.y);
        else if(typeof V57!=='undefined'&&V57.foodTarget)result.value=!!throwFood(q.x,q.y);
        else{result.attempted=false;result.reason='no-target'}
      }
      completed=true;return result;
    }finally{
      result.logicalTurns=(state?.turn||0)-before.turn;result.floorTurnDelta=(state?.floorTurn||0)-before.floorTurn;result.enemyRounds=result.turns.reduce((sum,turn)=>sum+turn.enemyRounds,0);result.agencyTurns=(state?.playerAgencyTurns57||0)-before.agency;
      result.timeCost=result.turns.reduce((sum,turn)=>sum+turn.timeCost,0);
      result.advancesWorld=result.logicalTurns>0;result.playerDied=!before.dead&&!!state?.dead;
      result.lifecycleAborted=!completed||!state||state.runId984!==before.run;
      result.pending=!!result.value&&!result.advancesWorld&&((['BLINK','ITEM_USE','QUICK_SLOT'].includes(type)&&activeGameplayPanels57().some(panel=>!before.panels.includes(panel.id)))||(type==='DESCEND'&&before.floor===21&&state?.floor===21));
      result.committed=!result.pending&&(frame.committed===true||result.advancesWorld||result.value===true||result.children.some(child=>child.committed));
      if(type==='TARGET_CANCEL')result.committed=false;
      result.successful=result.committed&&!frame.denial&&!result.playerDied&&!result.lifecycleAborted;
      result.status=result.lifecycleAborted?'aborted':result.playerDied?'dead':frame.denial==='stun'?'denied':frame.denial?'blocked':result.pending?'pending':type==='TARGET_CANCEL'?'cancelled':result.committed?'committed':!result.attempted?'no-action':result.handled?'failed':'ignored';
      if(frame.denial)result.reason=frame.denial;
      if(completed&&!parent&&ACTION_PRESENTATION58.pending&&ACTION_PRESENTATION58.run===state){const a=ACTION_PRESENTATION58,now=performance.now();a.pending=false;a.start=now;a.until=now+(a.kind==='attack'?260:240)/(a.rate||1);a.inputUntil=now+85/(a.rate||1);}
      ACTION_AUDIT5.stack.pop();if(parent){parent.result.children.push(result);parent.turns.push(...result.turns);if(frame.denial)parent.denial=frame.denial}
      else{if(completed)result.persistence=globalThis.__MANRU_SAVE_SERVICE__?.flush?.(type,result,!activeGameplayPanels57().some(panel=>!before.panels.includes(panel.id)));else globalThis.__MANRU_SAVE_SERVICE__?.clearPending?.();ACTION_AUDIT5.history.push(result);if(ACTION_AUDIT5.history.length>100)ACTION_AUDIT5.history.shift()}
    }
  },
  handleEvent(e){const type=e.currentTarget?.id==='cookDo57'?'COOK':e.currentTarget?.id==='cipherSubmit'?'CIPHER_SUBMIT':null;if(type)return ActionDispatcher.dispatch({type,source:'modal-control'}).value},
  snapshot(){return{roots:ACTION_AUDIT5.roots,invocations:ACTION_AUDIT5.serial,activeDepth:ACTION_AUDIT5.stack.length,routes:[...ACTION_ROUTES5.keys()],history:structuredClone(ACTION_AUDIT5.history)}},
  resetAudit(){if(ACTION_AUDIT5.stack.length)throw new Error('Cannot reset an active action');ACTION_AUDIT5.serial=0;ACTION_AUDIT5.roots=0;ACTION_AUDIT5.history=[];return this.snapshot()}
});
function createRunState57(cls){return {floor:1,turn:0,lastDamageAgencyTurn57:0,passiveRecoveryUnlocked57:false,playerAgencyTurns57:0,floorTurn:0,alert:0,map:[],rooms:[],items:[],monsters:[],decals:[],switches:[],rafts:[],routeTags:[],stairs:{x:0,y:0},seen:new Set(),visible:new Set(),uniqueKilled:{},log:[],dead:false,victory:false,runState57:'playing',bossDefeated:false,layoutName:'',specialFloor:false,visionPenalty:0,fixedStart:null,fixedExit:null,floorKeys:0,floorKeysRequired:0,cipher:null,harvested:{},enemyEnergy:0,makgeolliHealHundredths57:0,status:{haste:0,weaken:0,evade:0,markCrit:0,poison:0,bleed:0,ward:0,stun:0,stealth:0,regen:0,upset:0,drunk:0,blind:0,skillSeal:0},player:{classId:cls.id,name:cls.name,gender:cls.gender||'male',color:cls.color,x:2,y:2,level:1,xp:0,nextXp:xpRequirementForLevel57(2),baseMaxHpPermanent:cls.hp,temporaryMaxHpBonus:0,martialRules1005:1,maxHp:cls.hp,hp:cls.hp,maxFocus:cls.focus,focus:cls.focus,baseAtk:cls.atk,bloodAltarGains105:0,baseDef:cls.def,baseEva:cls.eva,baseWill:cls.will,baseVision:cls.vision,weapon:null,armor:{...ARMORS[0],type:'armor'},cloak:null,relic:null,trinket:null,inventory:[],kills:0,hunger:100,skillPoints:1,blinkLevel:0,facing:{x:0,y:1},martial:{strong:0,roar:0,ghost:0,brawl:0,constitution:0},strongReady:0,nextAttackAt:0,busyUntil:0}}}
// Fullscreen belongs to entering/resuming the game, with no floating HUD control.
let fullscreenPending65=false,fullscreenWanted66=false,fullscreenResume66=false;
  function pstate(){if(!state)return;state.tempFields=Array.isArray(state.tempFields)?state.tempFields:[];state.status=state.status||{};for(const q of['swift','fortify','willBoost'])if(!Number.isFinite(state.status[q]))state.status[q]=0}
  /* ---------- deterministic F23/F24 runtime QA hooks ---------- */
  let qaSnapshot60=null;
  function lsKeys70(){try{return Object.keys(localStorage)}catch(_){return Object.keys(memoryStorage)}}
  const V982={
    version:'v9.8.3-direct-stats-clean-pipeline',
    upgradesPerChapter:3,
    healsPerChapter:2
  };
  // Basic controls are documented at the point they matter, without blocking gameplay.
  function currentScreen(){return SCREEN1002.mode}
    function deathMeta1004(){try{return JSON.parse(localStorage.getItem(DEATH1004)||localStorage.getItem(LEGACY_DEATH1004)||'null')}catch(_){return null}}
const InputRouter=Object.freeze({
  handleEvent(e){return ClientEnvironment.routeEvent(e)},
  owner(){
    if(RuntimeState.ui.generationPending)return{kind:'blocking',panels:['mapGenerationNotice57']};
    if(OrientationGate.active()&&runState57()==='playing')return{kind:'orientation',panels:activeGameplayPanels57().map(panel=>panel.id)};
    const current=gameplayInputOwner57();return{kind:current.kind,panels:current.panels.map(panel=>panel.id)};
  },
  result(command,status,owner,consumed=false){
    const type=command.type,entry={serial:++INPUT_ROUTER57_AUDIT.serial,command:type,source:command.source||'unknown',status,owner,consumed:!!consumed};
    INPUT_ROUTER57_AUDIT.attempts[type]=(INPUT_ROUTER57_AUDIT.attempts[type]||0)+1;INPUT_ROUTER57_AUDIT[status]++;
    if(status==='handled')INPUT_ROUTER57_AUDIT.handledCommands[type]=(INPUT_ROUTER57_AUDIT.handledCommands[type]||0)+1;
    INPUT_ROUTER57_AUDIT.history.push(entry);if(INPUT_ROUTER57_AUDIT.history.length>200)INPUT_ROUTER57_AUDIT.history.shift();return entry;
  },
  dispatch(command){
    if(!command||!INPUT_COMMANDS57.includes(command.type))return this.result({type:command?.type||'UNKNOWN',source:command?.source},'ignored','none');
    const type=command.type,owner=this.owner(),kind=owner.kind,panels=owner.panels;
    // Closing an active dialog belongs to the UI, before world-input gates.
    if(type==='TARGET_CANCEL'||type==='MODAL_CANCEL'){
      const dialog=gameplayInputOwner57();
      if(!['targeting','modal'].includes(dialog.kind))return this.result(command,'ignored',kind);
      return this.result(command,'handled',dialog.kind,type==='TARGET_CANCEL'?ActionDispatcher.dispatch(command).value:!!dismissGameplayInput57());
    }
    if(state?.debugBattle57)return this.result(command,'blocked','debug-battle');
    if(OrientationGate.blocks(command))return this.result(command,'blocked','orientation');
    if(type==='STORY_OPEN_NOTE')return this.result(command,kind==='modal'&&panels.includes('storyModal992')&&globalThis.__MANRU_STORY992__?.open?.(command.id)?'handled':'blocked',kind);
    if(type==='STORY_CONTINUE')return this.result(command,kind==='modal'&&panels.includes('storyScene992')&&globalThis.__MANRU_STORY992__?.continueScene?.()?'handled':'blocked',kind);
    if(type==='STORY_SELECT_ENDING')return this.result(command,runState57()==='victory'&&globalThis.__MANRU_STORY992__?.selectEnding?.(command.choice)?'handled':'blocked',kind);
    if(type==='STORY_CONFIRM_ENDING'){if(runState57()!=='victory'||!RuntimeState.ui.storyChoice)return this.result(command,'blocked',kind);globalThis.__MANRU_STORY992__.ending(RuntimeState.ui.storyChoice);return this.result(command,'handled',kind)}
    if(type==='CIPHER_DIGIT'||type==='CIPHER_CLEAR')return this.result(command,kind==='modal'&&panels.includes('cipherPanel')&&editCipherGuess8(type==='CIPHER_CLEAR'?null:command.digit)?'handled':'blocked',kind);
    if(type==='LOAD'&&kind==='terminal')return this.result(command,'handled',kind,!!loadGame());
    if(type==='TOGGLE_SFX'){const value=globalThis.__MANRU_SFX54__?.toggle?.();return this.result(command,value===undefined?'ignored':'handled',kind,value!==undefined)}
    if(type==='TARGET_MOVE'){
      if(kind!=='targeting')return this.result(command,'blocked',kind);
      if(!worldTargetActive57())return this.result(command,'blocked',kind);
      return this.result(command,'handled',kind,!!ActionDispatcher.dispatch(command).value);
    }
    if(type==='TARGET_CONFIRM'){
      if(kind!=='targeting'||!command.cell)return this.result(command,'blocked',kind);
      const action=ActionDispatcher.dispatch(command);return this.result(command,action.attempted?'handled':'ignored',kind,action.value);
    }
    if(kind==='terminal'||kind==='blocking'||kind==='orientation'||kind==='targeting')return this.result(command,'blocked',kind);
    if(kind==='modal'){
      const selfInventory=type==='TOGGLE_INVENTORY'&&panels.length===1&&panels[0]==='inventory';
      const selfHelp=type==='TOGGLE_HELP'&&panels.length===1&&panels[0]==='helpPanel'&&command.key==='?';
      const selfRelease=type==='TOGGLE_RELEASE'&&panels.length===1&&panels[0]==='rc70';
      const drawerSave=type==='SAVE'&&panels.length===1&&panels[0]==='mobileDrawer';
      if(!selfInventory&&!selfHelp&&!selfRelease&&!drawerSave)return this.result(command,'blocked',kind);
    }
    let consumed=false,status='handled';
    if(type==='MOVE'){cancelAutoWalk();consumed=!!ActionDispatcher.dispatch({type:'MOVE',args:[command.dx,command.dy]}).value}
    else if(type==='ATTACK'){cancelAutoWalk();consumed=!!ActionDispatcher.dispatch({type:'ATTACK',args:[]}).value}
    else if(type==='REST'){cancelAutoWalk();consumed=!!ActionDispatcher.dispatch({type:'REST',args:[]}).value}
    else if(type==='PICKUP')consumed=!!ActionDispatcher.dispatch({type:'PICKUP',args:[]}).value
    else if(type==='CONTEXT_ACTION'){cancelAutoWalk();consumed=!!ActionDispatcher.dispatch({type:'CONTEXT_ACTION',args:[]}).value}
    else if(type==='DESCEND')consumed=!!ActionDispatcher.dispatch({type:'DESCEND',args:[]}).value
    else if(type==='BLINK'){cancelAutoWalk();consumed=!!ActionDispatcher.dispatch({type:'BLINK',args:[]}).value}
    else if(type==='QUICK_MARTIAL'){consumed=!!globalThis.__MANRU_SKILL991_INPUT__?.activateIndex(command.index)}
    else if(type==='CLASS_SKILL'){cancelAutoWalk();consumed=!!useClassSkill()}
    else if(type==='OPEN_MARTIAL')consumed=!!openMartial()
    else if(type==='TOGGLE_SKILL_QUICK')consumed=!!globalThis.__MANRU_SKILL991_INPUT__?.toggle?.()
    else if(type==='OPEN_SUMMON105'){const book=summonShortcutBooks()[command.slot||0];if(book)consumed=!!summonOpen(book.summonBookId105)}
    else if(type==='TOGGLE_INVENTORY')consumed=!!toggleInventory()
    else if(type==='TOGGLE_HELP')consumed=!!toggleHelp()
    else if(type==='OPEN_MOBILE_DRAWER')consumed=!!openMobileDrawer(command.tab||'status')
    else if(type==='OPEN_MAP')consumed=!!openMapModal()
    else if(type==='AUTO_EXPLORE')consumed=!!autoExplore()
    else if(type==='WORLD_SELECT')consumed=!!globalThis.__MANRU_RUNTIME81__?.Automation81?.go?.(command.cell)
    else if(type==='WORLD_INSPECT')consumed=!!globalThis.__MANRU_RUNTIME81__?.inspect?.(command.cell)
    else if(type==='CAMERA_PAN'){const camera=globalThis.__MANRU_RUNTIME81__?.Camera81;consumed=!!(command.phase==='end'?camera?.endPan?.():camera?.panScreen?.(command.dx,command.dy))}
    else if(type==='CAMERA_ZOOM'){
      if(Number.isFinite(command.scale))consumed=!!globalThis.__MANRU_CAMERA984__?.zoomByScale?.(command.scale,command.anchor||null);
      else if(Number.isFinite(command.value))consumed=!!globalThis.__MANRU_V984_SET_ZOOM__?.(command.value,command.anchor||null);
      else if(command.reset)consumed=!!globalThis.__MANRU_V984_SET_ZOOM__?.(1,null);
      else consumed=!!globalThis.__MANRU_RUNTIME81__?.Zoom81?.step?.(command.delta);
    }
    else if(type==='CAMERA_CENTER')consumed=!!globalThis.__MANRU_RUNTIME81__?.Camera81?.center?.()
    else if(type==='CLOSE_DOOR')consumed=!!ActionDispatcher.dispatch(command).value
    else if(type==='QUICK_SLOT')consumed=!!ActionDispatcher.dispatch(command).value
    else if(type==='TOGGLE_RELEASE'){const api=globalThis.__MANRU_RELEASE__;consumed=panels.includes('rc70')?!!api?.closePanel?.():!!api?.openPanel?.()}
    else if(type==='SAVE'){saveGame();consumed=true}
    else if(type==='LOAD')consumed=!!loadGame()
    else status='ignored';
    return this.result(command,status,kind,consumed);
  },
  noteListener(id){INPUT_ROUTER57_AUDIT.listeners.add(id)},
  resetAudit(){INPUT_ROUTER57_AUDIT.serial=0;INPUT_ROUTER57_AUDIT.handled=0;INPUT_ROUTER57_AUDIT.blocked=0;INPUT_ROUTER57_AUDIT.ignored=0;INPUT_ROUTER57_AUDIT.handledCommands={};INPUT_ROUTER57_AUDIT.attempts={};INPUT_ROUTER57_AUDIT.history=[];return this.snapshot()},
  snapshot(){const owner=this.owner();return{priority:[...INPUT_PRIORITY57],commands:[...INPUT_COMMANDS57],owner:owner.kind,panels:[...owner.panels],handled:INPUT_ROUTER57_AUDIT.handled,blocked:INPUT_ROUTER57_AUDIT.blocked,ignored:INPUT_ROUTER57_AUDIT.ignored,handledCommands:{...INPUT_ROUTER57_AUDIT.handledCommands},attempts:{...INPUT_ROUTER57_AUDIT.attempts},history:INPUT_ROUTER57_AUDIT.history.map(row=>({...row})),listenerCount:INPUT_ROUTER57_AUDIT.listeners.size,listeners:[...INPUT_ROUTER57_AUDIT.listeners].sort()}}
});
  function qaMark60(){qaSnapshot60=captureGenerationSnapshot();return{floor:state.floor,hash:qaHash60()}}
  /* v10.0.2: one canonical screen state, instead of leaving the class picker alive behind display:none. */
  const SCREEN1002={mode:'title',booted:false};
    const LEGACY_DEATH1004='manru984_last_death';
function worldTargetDirection57(dx,dy){
  const t=WORLD_TARGET;if(!t)return false;dx=Math.sign(dx);dy=Math.sign(dy);if(!dx&&!dy)return false;
  const pool=t.cells.filter(v=>Math.sign(v.dx??(v.x-state.player.x))===dx&&Math.sign(v.dy??(v.y-state.player.y))===dy);if(!pool.length){toast('그 방향에는 점멸할 칸이 없다.');return true}
  pool.sort((a,b)=>(b.dist??entityDistance57(b,state.player))-(a.dist??entityDistance57(a,state.player)));return finishWorldTarget(pool[0],'direction');
}
const INPUT_PRIORITY57=Object.freeze(['fatal/blocking','modal/dialogue','targeting','special interaction','gameplay HUD','canvas/world','gameplay keyboard','passive shortcut']);
function newGameCoreLifecycle(cls){state=createRunState57(cls);citadelEnsurePlan();GameState.initialize(state);globalThis.__MANRU_CONSUMABLE56_ACTIONS__.initializeKnowledge();normalizeClassState58(state.player,0);const sw=WEAPONS.find(w=>w.name===cls.startWeapon);if(sw)state.player.weapon={...clone(sw),type:'weapon',identified:true,curseImmune991:true};for(const [name,count] of (cls.startItems||[])){const src=itemPrototype(name);if(!src)continue;const it=clone(src);it.count=count||1;if(['weapon','armor','cloak','relic','trinket'].includes(it.type)){it.identified=true;it.curseImmune991=true}addInventoryItem(it)}identifyStartingItems58();state.player.armor.identified=true;state.player.armor.curseImmune991=true;clearHeldInput53();globalThis.storyInitNewRun992?.();NormalFloorGenerator.generate();resetVisualState();resetTurnState();startFloorTransition();addLog('정부 특별조사 임무: 허가도면과 현장 객실 수가 일치하지 않는 대규모 무허가 증축 의심 건을 확인한다.');addLog('선행 파견된 고위 조사관이 연락 두절됐다. 현장 조사와 생존 여부 확인을 병행한다.');addLog('특수층은 방 자체가 기믹이다. 지형을 읽고 무술과 장비를 써라.');addLog('턴제 규칙: 당신이 행동할 때만 만루도 움직인다.');projectRunningScreen();updateAll()}
function useClassSkill(){return globalThis.__MANRU_SKILL991_INPUT__?.toggle()}
function autoExplore(resume=false){return Auto81.explore(resume)}
function restoreLibraryVisual1022(){state.bookWalls1022=Array.isArray(state.bookWalls1022)?state.bookWalls1022:[];state.libraryZones1022=Array.isArray(state.libraryZones1022)?state.libraryZones1022:[];state.libraryScrolls1022=Array.isArray(state.libraryScrolls1022)?state.libraryScrolls1022:[]}
function migrateFloor2Layout67(){
 const layout=state.floor===2&&state.floor2Choice63;if(!layout||layout.version>=3)return;
 const court=layout.court,cx=Math.floor(COLS/2);
 if(court){for(let y=court.y;y<court.y+court.h;y++)for(let x=court.x;x<court.x+court.w;x++){
  setTerrainTile58(state.map,x,y,y<=47&&Math.abs(x-cx)<=1?TT.CARPET:TT.FLOOR);
  const kk=K1020(x,y);for(const field of ['subthemeWalls970','archDecor1020','archDecor1023','outerWall94'])if(state[field])delete state[field][kk];
 }delete layout.court}
 for(let x=19;x<=28;x++)setTerrainTile58(state.map,x,43,TT.FLOOR);
 for(let x=54;x<=57;x++)setTerrainTile58(state.map,x,43,TT.FLOOR);
 const g=state.specialPlaces52;for(const z of g?.zones||[])if(z.y===40&&z.w===11&&z.h===8)encloseEntryDocumentRoom(g,z);
 finishEntryDocumentDoors67();layout.version=3;
}
function retireLegacyVisualDecor64(){
 if(!state)return;state.decor=(state.decor||[]).filter(d=>!RETIRED_DECOR64.has(d.kind));
 for(const name of ['archDecor1020','archDecor1023']){const src=state[name]||{};state[name]=Object.fromEntries(Object.entries(src).filter(([,kind])=>kind==='goldSeal'||kind==='holyIcon1023'))}
 state.decorCanonical1029=null;
}
function identifyStartingItems58(){
  const p=state.player,K=state.knowledge56=state.knowledge56||{};
  K.potionKnown=K.potionKnown||{};K.talismanKnown=K.talismanKnown||{};
  for(const it of [...p.inventory,p.weapon,p.armor,p.cloak,p.relic,p.trinket]){
    if(!it)continue;it.identified=true;
    if(it.type==='potion'&&it.potionKind)K.potionKnown[it.potionKind]=true;
    if(it.type==='talisman'&&it.talismanKind)K.talismanKnown[it.talismanKind]=true;
  }
}
function dismissGameplayInput57(all=false){
  const panels=activeGameplayPanels57();if(!panels.length)return false;
  for(const panel of all?panels:[panels[panels.length-1]])panel.close?.(true);clearHeldInput53();return true
}
const INPUT_COMMANDS57=Object.freeze(['MOVE','ATTACK','REST','PICKUP','CONTEXT_ACTION','DESCEND','BLINK','CLASS_SKILL','OPEN_MARTIAL','TOGGLE_SKILL_QUICK','QUICK_MARTIAL','OPEN_SUMMON105','TOGGLE_INVENTORY','TOGGLE_HELP','OPEN_MOBILE_DRAWER','OPEN_MAP','AUTO_EXPLORE','TARGET_MOVE','TARGET_CONFIRM','TARGET_CANCEL','MODAL_CANCEL','WORLD_SELECT','WORLD_INSPECT','CAMERA_PAN','CAMERA_ZOOM','CAMERA_CENTER','CLOSE_DOOR','QUICK_SLOT','TOGGLE_RELEASE','TOGGLE_SFX','STORY_OPEN_NOTE','STORY_SELECT_ENDING','STORY_CONFIRM_ENDING','STORY_CONTINUE','CIPHER_DIGIT','CIPHER_CLEAR','SAVE','LOAD']);
const INPUT_ROUTER57_AUDIT={serial:0,handled:0,blocked:0,ignored:0,handledCommands:{},attempts:{},history:[],listeners:new Set()};
function activeGameplayPanels57(){return gameplayPanels57().filter(panel=>interactionActive8(panel.id))}
function gameplayInputOwner57(){
  if(runState57()!=='playing')return{kind:'terminal',panels:[]};const panels=activeGameplayPanels57();
  if(panels.length)return{kind:panels.some(p=>p.kind!=='targeting')?'modal':'targeting',panels};
  return{kind:'none',panels:[]}
}
function gameplayInputAllowed57(opts={}){
  if(state?.debugBattle57)return false;
  if(RuntimeState.ui.generationPending)return false;
  if(OrientationGate.active()&&runState57()==='playing')return false;
  const owner=gameplayInputOwner57();if(owner.kind==='terminal')return false;if(owner.kind==='none')return true;
  const allowed=new Set(opts.uiOwner?[opts.uiOwner]:[]);if(opts.allowInventory)allowed.add('inventory');if(opts.allowMartial)allowed.add('martialPanel');if(opts.allowCipher)allowed.add('cipherPanel');
  return owner.panels.every(p=>allowed.has(p.id))
}
const RUN_END_EFFECTS=[markDeathSeal,showEndingScreen];
