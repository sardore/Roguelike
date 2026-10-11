/* r46: reusable world-cell target owner. 21F blink is the first consumer; future skills can supply
   their own candidate cells and completion callback without adding another input firewall. */
let WORLD_TARGET=null,targetFollowupSuppressUntil=0;
function worldTargetSnapshot(){if(!WORLD_TARGET)return null;return{kind:WORLD_TARGET.kind,title:WORLD_TARGET.title,text:WORLD_TARGET.text,range:WORLD_TARGET.range,cells:WORLD_TARGET.cells.map(v=>({x:v.x,y:v.y,dx:v.dx,dy:v.dy,dist:v.dist}))}}
function migrateRetiredItems(run){if(!run?.player)return{inventory:0,ground:0,pending:0};const qty=i=>Math.max(1,Number.isSafeInteger(i?.count)?i.count:1),inv=run.player.inventory||[],ground=run.items||[],pending=run.pendingGroundItems57||[];let inventory=0,world=0,queued=0;run.player.inventory=inv.filter(i=>{if(!retiredPainterItem57(i))return true;inventory+=qty(i);return false});run.items=ground.filter(i=>{if(!retiredPainterItem57(i))return true;world+=qty(i);return false});run.pendingGroundItems57=pending.filter(q=>{if(!retiredPainterItem57(q?.item))return true;queued+=qty(q.item);return false});for(const slot of ['weapon','armor','cloak','relic','trinket'])if(retiredPainterItem57(run.player[slot])){inventory+=qty(run.player[slot]);run.player[slot]=null}RuntimeState.persistence.retiredItemMigration57={version:1,inventory,ground:world,pending:queued,total:inventory+world+queued};return RuntimeState.persistence.retiredItemMigration57}
function captureGenerationSnapshot(){return{state:structuredClone(state),cols:COLS,rows:ROWS}}
function restoreGenerationSnapshot(snap){if(!snap?.state)return false;state=structuredClone(snap.state);COLS=snap.cols;ROWS=snap.rows;return true}
let saveGame;
function loadGameV0Legacy(){
  const raw = localStorage.getItem("manruV08Save") || localStorage.getItem("manruV07Save") || localStorage.getItem("manruV06Save") || localStorage.getItem("manruV04Save") || localStorage.getItem("manruV03Save");
  if(!raw){ toast("저장 데이터가 없다."); return; }
  state = JSON.parse(raw);
  normalizeClassState58(state.player,state.playerAgencyTurns57||0);normalizeHealthState58(state);
  state.decals = state.decals || [];
  state.switches = state.switches || [];
  state.rafts = state.rafts || [];
  state.routeTags = state.routeTags || [];
  state.floorKeys = state.floorKeys || 0;
  state.floorKeysRequired = state.floorKeysRequired || 0;
  state.visionPenalty = state.visionPenalty || 0;
  state.cipher = state.cipher || null;
  state.player.hunger = state.player.hunger ?? 100;
  state.player.skillPoints = state.player.skillPoints ?? 0;
  state.player.blinkLevel = state.player.blinkLevel ?? 0;
  state.player.martial = Object.assign({strong:0,roar:0,ghost:0,brawl:0,constitution:0},state.player.martial||{});
  state.status = Object.assign({haste:0,weaken:0,evade:0,markCrit:0,poison:0,bleed:0,ward:0,stun:0,stealth:0,regen:0,upset:0,blind:0,skillSeal:0}, state.status || {});state.player.cloak=state.player.cloak||null;state.player.nextAttackAt=0;state.player.busyUntil=0;state.enemyEnergy=state.enemyEnergy||0;
  state.seen = new Set(state.seen);
  state.visible = new Set(state.visible);
  document.body.classList.add('run-active');
  document.getElementById("overlay").style.display = "none";
  VisibilityService.compute();resetVisualState();resetTurnState();
  updateAll();
  toast("불러오기 완료.");
}
/* ===== CANONICAL NEW/LOAD LIFECYCLE PIPELINE =====
   Historical releases used nested `old=newGame/loadGame; fn=function(){old();...}` chains.
   Keep one stable public entrypoint and register explicit wrapper-equivalent stages instead.
   Registration order is historical inner -> outer order.  Pre hooks therefore run in reverse,
   then the core runs once, then post hooks unwind in forward order. */
const MANRU_NEW_LIFECYCLE_STAGES=[];
const MANRU_LOAD_LIFECYCLE_STAGES=[];
const MANRU_LIFECYCLE_ABORT=Symbol('MANRU_LIFECYCLE_ABORT');
let MANRU_LOAD_CORE=loadGameV0Legacy,MANRU_LOAD_CORE_ID='legacy-v0';
function manruLifecycleAbort(value){return{tag:MANRU_LIFECYCLE_ABORT,value}}
function manruRegisterLifecycle(list,id,spec={}){
  const old=list.findIndex(s=>s.id===id);const stage={id,pre:typeof spec.pre==='function'?spec.pre:null,post:typeof spec.post==='function'?spec.post:null};
  if(old>=0)list.splice(old,1,stage);else list.push(stage);return stage;
}
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
  branchPackWorld105(plain);return plain;
}
function migrateGameState(candidate){
  if(!candidate||typeof candidate!=='object'||Array.isArray(candidate))throw Error('GameState object required');
  const schema=candidate.saveSchema1004==null?0:Number(candidate.saveSchema1004);if(!Number.isInteger(schema)||schema<0||schema>1)throw Error('Unsupported GameState schema');
  const migrated=projectGameState(candidate);if(!migrated)throw Error('GameState migration failed');branchPruneWorld105(migrated);branchUnpackWorld105(migrated);initializeMartial(migrated);return migrated;
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
    source.naturalPopulation57=source.naturalPopulation57||{initial:(source.monsters||[]).filter(isNaturalMonster57).length,generation:0,nextAgency:null};
    noiseBudget57=null;delete source.noiseHistory01;
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
const RunLifecycle={
  run(core,stages,args,kind){
    if(RuntimeState.lifecycle.depth)throw Error('Nested run replacement is not permitted');
    const save=globalThis.__MANRU_SAVE_SERVICE__,isNew=kind==='new';
    const prior={state,cols:COLS,rows:ROWS,seed:window.__MANRU_RUN_SEED984,phase:RuntimeState.lifecycle.phase,screen:currentScreen()};
    const ctx={kind,args:[...args],data:Object.create(null),result:undefined,aborted:false,abortStage:null},entered=new Set();
    RuntimeState.lifecycle.depth++;RuntimeState.lifecycle.generation++;RuntimeState.lifecycle.phase=isNew?'creating':'loading';save.clearPending();
    setGenerationPresentation8(false);closeGameplayInteractionState57();RuntimeState.prepareRun();
    try{
      if(!isNew){
        let request=ctx.args[0];
        if(!request?.state&&!request?.raw){RuntimeState.lifecycle.phase='recovering';const recovery=save.recover();if(!recovery.ok||!recovery.candidate)throw Error('No eligible saved run');request={raw:recovery.candidate.raw};ctx.args[0]=request;RuntimeState.lifecycle.phase='loading'}
        if(request?.state){request={...request,state:GameState.migrate(request.state)};ctx.args[0]=request}
        const meta=request?.state||RuntimeState.lifecycle.parse(request.raw).state;if(!RunLifecycle.accepts(meta))throw Error('Ineligible saved run');
      }
      for(let i=stages.length-1;i>=0;i--){const st=stages[i];if(st.pre){const out=st.pre(ctx,...ctx.args);if(out?.tag===MANRU_LIFECYCLE_ABORT){ctx.aborted=true;ctx.abortStage=st.id;ctx.result=out.value;break}}entered.add(i)}
      if(ctx.aborted)throw Error('Lifecycle rejected at '+ctx.abortStage);
      ctx.result=core(...ctx.args);if(ctx.result===false)throw Error('Load initialization rejected');
      for(let i=0;i<stages.length;i++)if(entered.has(i)&&stages[i].post){const out=stages[i].post(ctx,ctx.result,...ctx.args);if(out!==undefined)ctx.result=out}
      if(ctx.result===false||!state||state.dead||state.victory)throw Error('Candidate is not a playable run');RuntimeState.lifecycle.validate(state);
      const persistence=save.commit(kind);if(!persistence.ok)throw Error('Run persistence failed: '+persistence.failure);
      RuntimeState.lifecycle.phase='playing';RuntimeState.lifecycle.last={ok:true,kind,persistence};globalThis.__MANRU_STORY992__?.resume?.();return ctx.result;
    }catch(e){
      ctx.aborted=true;state=prior.state;COLS=prior.cols;ROWS=prior.rows;window.__MANRU_RUN_SEED984=prior.seed;RuntimeState.lifecycle.phase=prior.phase;RuntimeState.lifecycle.generation++;
      resetVisualState();resetTurnState();if(state){VisibilityService.compute();updateAll()}setScreen1002(prior.screen||'title');
      document.body.classList.toggle('run-active',!!state&&!state.dead&&!state.victory);
      RuntimeState.lifecycle.last={ok:false,kind,failure:String(e)};toast('탐사 기록을 적용하지 못했다. 이전 기록을 유지한다.');if(isNew)throw e;return false;
    }finally{
      RuntimeState.lifecycle.depth--;save.clearPending();RunLifecycle.refreshContinue();
      globalThis.__MANRU_LAST_LIFECYCLE__={kind,core:isNew?'base-new':MANRU_LOAD_CORE_ID,entered:[...entered].sort((a,b)=>a-b).map(i=>stages[i].id),aborted:ctx.aborted,abortStage:ctx.abortStage};
    }
  },
  registerNew:(id,spec)=>manruRegisterLifecycle(MANRU_NEW_LIFECYCLE_STAGES,id,spec),
  registerLoad:(id,spec)=>manruRegisterLifecycle(MANRU_LOAD_LIFECYCLE_STAGES,id,spec),
  abort:manruLifecycleAbort,
  runNew:(...args)=>RunLifecycle.run(newGameCoreLifecycle,MANRU_NEW_LIFECYCLE_STAGES,args,'new'),
  runLoad:(...args)=>RunLifecycle.run(MANRU_LOAD_CORE,MANRU_LOAD_LIFECYCLE_STAGES,args,'load'),
  resetLoad(id,core,validate=null,parse=null){if(typeof core!=='function')throw new Error('load core required');MANRU_LOAD_CORE=core;MANRU_LOAD_CORE_ID=id;MANRU_LOAD_LIFECYCLE_STAGES.length=0;if(validate)RuntimeState.lifecycle.validate=validate;if(parse)RuntimeState.lifecycle.parse=parse;return id},
  snapshotLoad:()=>{const core=MANRU_LOAD_CORE,stages=[...MANRU_LOAD_LIFECYCLE_STAGES],id=MANRU_LOAD_CORE_ID;return(...args)=>RunLifecycle.run(core,stages,args,`load-snapshot:${id}`)},
  audit:()=>({newCore:'base-new',loadCore:MANRU_LOAD_CORE_ID,newStages:MANRU_NEW_LIFECYCLE_STAGES.map(s=>s.id),loadStages:MANRU_LOAD_LIFECYCLE_STAGES.map(s=>s.id)}),
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
    runEndEffects53(next);
    if(!RunLifecycle.busy()){const persistence=globalThis.__MANRU_SAVE_SERVICE__.terminal(next);RuntimeState.lifecycle.last={ok:persistence.ok,kind:next,persistence};if(persistence.ok&&next==='death')RuntimeState.lifecycle.phase='tombstoned';if(!persistence.ok)toast('종료 기록 저장에 실패했다.');RunLifecycle.refreshContinue()}
    return true;
  },
  snapshot(){return structuredClone({phase:RuntimeState.lifecycle.phase,generation:RuntimeState.lifecycle.generation,last:RuntimeState.lifecycle.last})}
};
function newGame(...args){requestGameFullscreen65();return RunLifecycle.runNew(...args)}
function loadGame(...args){requestGameFullscreen65();return RunLifecycle.runLoad(...args)}
  /* ----------------------- robust load for dynamic map sizes ----------------------- */
  function legacyLoadCore(){
    const raw=localStorage.getItem('manruV08Save')||localStorage.getItem('manruV07Save')||localStorage.getItem('manruV06Save')||localStorage.getItem('manruV04Save')||localStorage.getItem('manruV03Save');if(!raw){toast('저장 데이터가 없다.');return}
    state=JSON.parse(raw);state.generatedBuild=state.generatedBuild||state.generationPipelineR18?.version||'legacy-unknown';state.playerAgencyTurns57=Number.isFinite(state.playerAgencyTurns57)?state.playerAgencyTurns57:0;normalizeClassState58(state.player,state.playerAgencyTurns57);normalizeHealthState58(state);clearHeldInput53();ROWS=state.map?.length||sizeForFloor(state.floor)[1];COLS=state.map?.[0]?.length||sizeForFloor(state.floor)[0];state.decals=state.decals||[];state.decor=state.decor||[];state.vaults=state.vaults||[];state.switches=state.switches||[];state.rafts=state.rafts||[];state.routeTags=state.routeTags||[];state.floorKeys=state.floorKeys||0;state.floorKeysRequired=state.floorKeysRequired||0;state.visionPenalty=state.visionPenalty||0;state.cipher=state.cipher||null;state.player.hunger=state.player.hunger??100;state.player.skillPoints=state.player.skillPoints??0;state.player.blinkLevel=state.player.blinkLevel??0;state.player.martial=Object.assign({strong:0,roar:0,ghost:0,brawl:0,constitution:0},state.player.martial||{});state.status=Object.assign({haste:0,weaken:0,evade:0,markCrit:0,poison:0,bleed:0,ward:0,stun:0,stealth:0,regen:0,upset:0,blind:0,skillSeal:0},state.status||{});state.player.cloak=state.player.cloak||null;state.player.nextAttackAt=0;state.player.busyUntil=0;state.enemyEnergy=state.enemyEnergy||0;state.seen=new Set(state.seen||[]);state.visible=new Set(state.visible||[]);state.grassTufts1020=new Set(Array.isArray(state.grassTufts1020)?state.grassTufts1020:[]);document.body.classList.add('run-active');document.getElementById('overlay').style.display='none';VisibilityService.compute();resetVisualState();resetTurnState();vfBuildDecor();updateAll();toast('불러오기 완료.')
  }
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
    const ok=loadGame({raw,label,source:'slot70'});if(ok){RC.lastActionAt=performance.now();closePanel70();toast(label+' 불러오기 완료.')}return ok;
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
      restoreState70(st);
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
    const TRANSACTION='manru1004_transaction',TERMINAL_INTENT='manru1004_terminal_intent';
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
