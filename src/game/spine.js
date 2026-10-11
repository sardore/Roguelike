



































const SPECIAL_BASE_COUNTS={2:6,4:5,6:6,8:8,11:7,13:8,16:0,18:8,21:7,22:8,23:7,24:4};


// Menu light radius and energy share one phase; reduced motion freezes the phase.
// Held equipment and item icons share the authored weapon pixels. Poses transform the asset about its actual grip.
function heldWeaponKey1001(item){const art=globalThis.__MANRU_ITEM_ART_R7__;return item?.name?(art?art.weaponAsset(item).key:'weapon-art-pending'):'unarmed'}





const CLASSES=[
  {id:'wanderer',name:'감찰관',color:'#d4c2a2',desc:'정부 특임 감찰관. 장비와 무술 선택에 따라 어느 길로든 성장할 수 있다.',hp:34,focus:9,atk:5,def:1,eva:4,will:4,vision:7,skillName:'무술',skillDesc:'장비와 무술을 조합해 자유롭게 성장한다.',skillCost:0,startWeapon:'조잡한 단검',startItems:[['감정부적',1],['주먹밥',1]],startLabel:'경량복 · 조잡한 단검 · 감정부적 · 주먹밥'},
  {id:'escort',name:'금위 표사',color:'#b78c65',desc:'정부 호위 임무 출신. 체급이 높고 초반 장비가 나빠도 버틴다.',hp:40,focus:7,atk:5,def:2,eva:2,will:4,vision:7,skillName:'무술',skillDesc:'튼튼한 체격으로 버티며 적의 빈틈을 노린다.',skillCost:0,startWeapon:'나무 몽둥이',startItems:[['말린 육포',2]],startLabel:'경량복 · 나무 몽둥이 · 말린 육포×2'},
  {id:'swordsman',name:'척후 검객',color:'#96a9b0',desc:'정부 척후대 출신. 공격·회피가 높고 무기 효율이 좋다.',hp:31,focus:10,atk:6,def:1,eva:5,will:3,vision:8,skillName:'무술',skillDesc:'빠른 발과 날카로운 검으로 전장을 누빈다.',skillCost:0,startWeapon:'무딘 소검',startItems:[['엽전 엿',1],['주먹밥',1]],startLabel:'경량복 · 무딘 소검 · 엽전 엿 · 주먹밥'},
  {id:'archer',name:'척후 궁사',color:'#a6b18b',rules:{roar:'aim'},desc:'정부 척후대의 궁사. 사격을 준비해 갑옷과 회피의 빈틈을 꿰뚫는다.',hp:30,focus:10,atk:6,def:1,eva:5,will:3,vision:8,skillName:'명중',skillDesc:'제자리에 서 있으면 조준이 쌓인다. 이동하거나 공격하면 한 단계 줄고, 피해를 받거나 해로운 상태에 걸리면 풀린다.',skillCost:3,startWeapon:'사냥용 목궁',startItems:[['목제 화살',36],['감정부적',1],['주먹밥',1]],startLabel:'경량복 · 사냥용 목궁 · 목제 화살×36 · 감정부적 · 주먹밥'},
  {id:'infiltrator',name:'잠행객',color:'#8fa1b5',rules:{roar:'smoke'},desc:'연막으로 시선을 가리고 좁은 틈으로 잠입하는 조사원.',hp:30,focus:11,atk:5,def:1,eva:7,will:4,vision:8,skillName:'연막',skillDesc:'기 4 · 목표 지점에 피해를 주고 5턴 동안 사선을 가리는 연막을 펼친다.',skillCost:4,startWeapon:'조잡한 단검',startItems:[['연막병',1],['경신약',1],['주먹밥',1]],startLabel:'경량복 · 조잡한 단검 · 연막병 · 경신약 · 주먹밥'},
  {id:'strongman',name:'천하장사',color:'#c49a58',rules:{talismanFusion:false,upgradeTalismanMode:'bodyBoost'},desc:'정면에서 버티며 싸우는 장사다. 부적 합성 불가. 강화부적으로 괴력·재생을 얻고, 끝나면 같은 시간 탈진한다.',hp:50,focus:8,atk:7,def:3,eva:1,will:5,vision:7,skillName:'무술',skillDesc:'괴력 20~45턴 · 매턴 HP 2% 회복',skillCost:0,startWeapon:'나무 몽둥이',startItems:[['강화부적',1],['말린 육포',2]],startLabel:'경량복 · 나무 몽둥이 · 강화부적×1 · 말린 육포×2'},
  {id:'summoner',name:'무당',gender:'female',color:'#c48da4',desc:'그림에 담긴 영을 부르는 무당. 무술에는 재능이 없지만 스스로의 체력을 바쳐 원하는 영을 부를 수 있다.',hp:34,focus:4,atk:5,def:1,eva:4,will:4,vision:7,skillName:'무술',skillDesc:'그림과 속성부적으로 영을 부른다. 술서 강화는 소모 HP와 기운 회복 시간을 줄인다.',skillCost:0,startWeapon:'조잡한 단검',startItems:[['만령 소환술서',1],['주먹밥',1]],startLabel:'경량복 · 조잡한 단검 · 만령 소환술서 · 주먹밥'}
];



function bodyPowerDuration58(p=state?.player){return 20+Math.max(0,Math.min(5,Math.floor(Number(p?.martial?.constitution)||0)))*5}
function bodyPowerExhaustion58(p=state?.player){return bodyPowerDuration58(p)}
function normalizeClassState58(p,agency=0){
  if(p.classId==='summoner'){p.name='무당';p.gender='female';p.color=CLASSES.find(c=>c.id==='summoner').color;}
  p.bloodAltarGains105=Number.isFinite(p.bloodAltarGains105)?Math.max(0,Math.floor(p.bloodAltarGains105)):0;
  const old=p.classState||{},valid=playerClassRules58(p).upgradeTalismanMode==='bodyBoost';
  const previousTotal=valid?Math.max(0,Math.min(45,Math.floor(Number(old.powerTotal)||0))):0;
  const previousRemaining=Math.max(0,Math.min(previousTotal,Math.floor(Number(old.powerTurns)||0)));
  const exhaustion=previousTotal?Math.max(0,Math.min(16,Math.floor(Number(old.powerExhaustion??old.powerTotal)||0))):0;
  // Upgrade active older saves once, preserving elapsed proportion; exhaustion now equals the full power duration.
  const migrate=previousRemaining>0&&(Number(old.powerRulesVersion)||0)<2;
  const total=migrate?Math.round(exhaustion*2.5):previousTotal;
  const remaining=migrate?Math.min(total,Math.ceil(previousRemaining*total/previousTotal)):previousRemaining;
  p.classState={aimPower:playerClassRules58(p).roar==='aim'&&Number(old.aimPower)>4?Math.min(aimMaximum(p),Math.floor(Number(old.aimPower))):0,aimBornAgency:Number.isFinite(old.aimBornAgency)?old.aimBornAgency:agency,aimMoveAgency:Number.isFinite(old.aimMoveAgency)?old.aimMoveAgency:-1,aimAttackAgency:Number.isFinite(old.aimAttackAgency)?old.aimAttackAgency:-1,powerTurns:remaining,powerTotal:total,powerExhaustion:total,powerRulesVersion:3,powerHealHundredths:valid?Math.max(0,Math.min(99,Math.floor(Number(old.powerHealHundredths)||0))):0,powerBornAgencyTurn:Number.isFinite(old.powerBornAgencyTurn)?old.powerBornAgencyTurn:agency,powerLastAgencyTurn:Number.isFinite(old.powerLastAgencyTurn)?old.powerLastAgencyTurn:agency};
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
function classItemDescription58(item,p=state?.player){return item?.talismanKind==='upgrade'&&playerClassRules58(p).upgradeTalismanMode==='bodyBoost'?`괴력 ${bodyPowerDuration58(p)}턴: ATK +2 · DEF +7 · 매턴 HP 2% 회복. 종료 후 같은 시간 실명·배탈. 장비 강화·중첩 불가.`:null}
























































let state = null;
let inventoryOpen = false;

let helpOpen = false;

let cipherOpen = false;
let mobileTab = "status";
let touchStart = null;


let autoWalkTimer = null;
let autoWalkToken = 0;

let inventoryTab = 'all';
let inventorySelection = -1;
const INPUT={held:new Set(),nextMoveAt:0};

function clearHeldInput53(){globalThis.__MANRU_CAMERA_STATE12__?.cancelInertia?.();if(typeof RuntimeState!=='undefined'&&RuntimeState.input?.qHold61){clearTimeout(RuntimeState.input.qHold61.timer);RuntimeState.input.qHold61=null;}INPUT.held.clear();INPUT.nextMoveAt=0;globalThis.__MANRU_RUNTIME81__?.stopHeld?.()}

function actionTargetOpen56(){return interactionActive8('potionTargetHud')||interactionActive8('talismanTarget56')||interactionActive8('foodTarget57')||worldTargetActive57()}



function endTargetInput57(ms=320){targetFollowupSuppressUntil=Math.max(targetFollowupSuppressUntil,performance.now()+Math.max(0,ms));clearHeldInput53();touchStart=null;return targetFollowupSuppressUntil}








function worldTargetDirection57(dx,dy){
  const t=WORLD_TARGET;if(!t)return false;dx=Math.sign(dx);dy=Math.sign(dy);if(!dx&&!dy)return false;
  const pool=t.cells.filter(v=>Math.sign(v.dx??(v.x-state.player.x))===dx&&Math.sign(v.dy??(v.y-state.player.y))===dy);if(!pool.length){toast('그 방향에는 점멸할 칸이 없다.');return true}
  pool.sort((a,b)=>(b.dist??entityDistance57(b,state.player))-(a.dist??entityDistance57(a,state.player)));return finishWorldTarget(pool[0],'direction');
}




window.addEventListener('blur',clearHeldInput53);
document.addEventListener('visibilitychange',()=>{if(document.hidden)clearHeldInput53()});





PresentationState.register('effects',now=>{
  FX.rings=FX.rings.filter(r=>now-r.start<r.life);FX.doors=FX.doors.filter(d=>now-d.start<d.life);FX.slashes=FX.slashes.filter(s=>now-s.start<s.life);FX.projectiles=FX.projectiles.filter(p=>now-p.start<p.life);FX.particles=FX.particles.filter(p=>now-p.start<p.life);FX.floats=FX.floats.filter(f=>now-f.start<f.life);
  for(const p of FX.particles){p.x+=p.vx;p.y+=p.vy;p.vx*=.96;p.vy*=.96;p.vy+=.015}
  if(FX.transition&&now-FX.transition.start>=FX.transition.life)FX.transition=null;
  if(FX.particles.length>40)FX.particles.splice(0,FX.particles.length-40);if(FX.floats.length>12){const labels=FX.floats.filter(f=>!f.damage57).slice(-12);FX.floats=FX.floats.filter(f=>f.damage57||labels.includes(f))}
});




PresentationState.register('monster-motion',now=>{if(!state)return;for(const m of state.monsters||[]){let v=MON_VIS.get(m);if(!v){v={x:m.x,y:m.y,last:now};MON_VIS.set(m,v);continue}if(v.forced105){const f=forcedMotionSample(v.forced105,now);if(f){v.x=f.x;v.y=f.y;v.last=now;if(!f.done)continue}v.forced105=null}const dt=Math.min(.05,Math.max(.001,(now-v.last)/1000)),a=1-Math.exp(-dt*18*automationPresentationRate70());v.last=now;v.x+=(m.x-v.x)*a;v.y+=(m.y-v.y)*a}});







function displayText53(value){return String(value).replace(/-?\d+\.\d{3,}(?:e[+-]?\d+)?/gi,n=>displayNumber53(n))}

function burst(x,y,color="#ffffff",count=9,power=1){
  const now=performance.now();
  for(let i=0;i<count;i++){
    const a=globalThis.__MANRU_RANDOM57__()*Math.PI*2, sp=(0.45+globalThis.__MANRU_RANDOM57__()*1.4)*power;
    FX.particles.push({
      x:x*TILE+TILE/2,y:y*TILE+TILE/2,
      vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,
      color,start:now,life:260+globalThis.__MANRU_RANDOM57__()*420,size:1+globalThis.__MANRU_RANDOM57__()*2.4
    });
  }
}





function armoryEvent(x,y){
  setTerrainTile58(state.map,x,y,TT.FLOOR);
  addLog("잠긴 무기고를 발견했다.");
  dropRandomItem({x,y}, true);
  if(globalThis.__MANRU_RANDOM57__()<0.55) dropRandomItem({x,y}, true);
  burst(x,y,"#d4b46b",16,1);
}



function adjacentSilkTrap57(){
 if(!state?.player)return null;const p=state.player;
 return selectFacingAdjacentTarget57(DIRS8.map(([dx,dy])=>({x:p.x+dx,y:p.y+dy})).filter(q=>canDisarmSilkTrap57(q.x,q.y)));
}

function cacheEvent(x,y){
  setTerrainTile58(state.map,x,y,TT.FLOOR);
  dropRandomItem({x,y}, true);
  if(globalThis.__MANRU_RANDOM57__()<0.5) dropRandomItem({x,y}, false);
  burst(x,y,"#b9d3a2",14,.8);
  addLog("숨겨진 보급함 발견.");
}




function drinkFromFountain(x,y){
  setTerrainTile58(state.map,x,y,TT.FLOOR);
  state.player.hp = Math.min(state.player.maxHp, state.player.hp + 10);
  state.player.focus = Math.min(getStats().maxFocus, state.player.focus + 4);
  cleanseStatuses();
  burst(x,y,"#8bd0f3",16,.9);
  addLog("정화의 샘. HP/FOCUS 회복, 상태이상 정화.");
  giveItem(foodDef('깨끗한 물'),x,y);
  addLog('정화의 샘에서 깨끗한 물을 한 병 길었다.');
}


function vaultEvent(x,y){
  setTerrainTile58(state.map,x,y,TT.FLOOR);
  dropRandomItem({x,y}, true);
  if(globalThis.__MANRU_RANDOM57__()<0.78) dropRandomItem({x,y}, true);
  if(globalThis.__MANRU_RANDOM57__()<0.35) spawnMonster(PlacementService.randomFloor(1), false);
  burst(x,y,"#e0be6b",18,1);
  addLog("객주 금고 개방. 전리품 획득.");
}








function startFloorTransition(){
  const side=!!state?.artifactDungeon46;
  FX.transition={
    start:performance.now(),
    life:1450,
    floor:state.floor,
    side,
    region:side?(state.artifactDungeon46?.name||state.layoutName||''):regionFor(state.floor)[2],
    layout:''
  };
  const boss=state.monsters?.find(m=>m.boss&&m.hp>0);if(boss)setTimeout(()=>showBossIntro(boss),850);
}




function clamp(v,a,b){ return Math.max(a, Math.min(b,v)); }


globalThis.__MANRU_GEN_RNG57__=Object.freeze({begin:RngService.begin,end:RngService.end,random:RngService.random,state:RngService.state});
globalThis.__MANRU_RANDOM57__=()=>RngService.random();



function inventoryCapacity(){return 25+(state?.player?.trinket?.branchEffect105==='capacity'?5:0)}

function resetTurnState(){if(!state)return;/* fractional enemy-energy debt is intentionally preserved; zeroing it would let stair/reset actions erase scheduler cost */state.enemyEnergy=state.enemyEnergy||0}

const MOVE_HOOKS_R8={pre:[],post:[]};
function registerMovePreR8(fn){MOVE_HOOKS_R8.pre.push(fn);return fn}
function registerMovePostR8(fn){MOVE_HOOKS_R8.post.push(fn);return fn}









const PLAYER_STAT_STAGES55=[];
registerPlayerStatStage55('class-body-power58',s=>{if(bodyPowerActive()){s.atk+=2;s.def+=7}return s});
const ATTACK_COST_STAGES55=[];
const MOVE_COST_STAGES55=[];
function registerPlayerStatStage55(id,run){if(PLAYER_STAT_STAGES55.some(v=>v.id===id))throw new Error('duplicate stat stage '+id);PLAYER_STAT_STAGES55.push({id,run})}
function registerAttackCostStage55(id,run){if(ATTACK_COST_STAGES55.some(v=>v.id===id))throw new Error('duplicate attack cost stage '+id);ATTACK_COST_STAGES55.push({id,run})}
function registerMoveCostStage55(id,run){if(MOVE_COST_STAGES55.some(v=>v.id===id))throw new Error('duplicate move cost stage '+id);MOVE_COST_STAGES55.push({id,run})}



function moveTurnCost(destination=null){let cost=clamp(1/(playerCloak().moveSpeed||1),.72,1.15);for(const stage of MOVE_COST_STAGES55)cost=stage.run(cost);if(silkThreadAt54(state.player.x,state.player.y))cost+=.5;const cursed=globalThis.__MANRU_ITEM_IDENTITY991__?.cursePower?.('binding')||0;return clamp(applyPlayerDebuffActionCost('move',cost),.25,cursed>0?6:2.4)*(terrainBaseTile58(destination?.x??state.player.x,destination?.y??state.player.y)===TT.SHALLOW_WATER?1.5:1)}
function runState57(){if(!state)return'inactive';return state.runState57||(state.dead?'death':state.victory?'victory':'playing')}
function normalizeRunState57(){if(!state)return;if(!state.generationInProgress57&&!state.terrainReactions105?.wallMaterials105)produceWallMaterials105();const next=state.runState57||(state.dead?'death':state.victory?'victory':'playing');state.runState57=next;state.dead=next==='death';state.victory=next==='victory';if(state.player?.summoning105)summonState()}

const AUTO_MOVE_RATE70=1.5;



function actionPresentationBusy58(){return ACTION_PRESENTATION58.run===state&&performance.now()<ACTION_PRESENTATION58.until}




function gameplayPanels57(){return[
  {id:'coach70',css:'show',close:()=>globalThis.__MANRU_RELEASE__?.closeTip?.()},
  {id:'shop58',css:'open',close:closeShop58},
  {id:'inventory',active:inventoryOpen,close:closeInventory},
  {id:'martialPanel',active:martialOpen,close:closeMartial},
  {id:'helpPanel',active:helpOpen,close:closeHelp},
  {id:'cipherPanel',active:cipherOpen,close:closeCipher},
  {id:'mobileDrawer',body:'mobile-drawer-open',close:closeMobileDrawer},
  {id:'mobileMapModal',css:'open',close:closeMapModal},
  {id:'mobileInspect',css:'open',close:closeInspect},
  {id:'cook57',css:'show',close:closeCooking},
  {id:'fusion74',css:'open',close:globalThis.__MANRU_TALISMAN74_ACTIONS__?.closePanels},
  {id:'gear74',css:'open',close:globalThis.__MANRU_TALISMAN74_ACTIONS__?.closePanels},
  {id:'choice991',css:'open',close:globalThis.__MANRU_ITEM_IDENTITY991__?.closeChoice},
  {id:'storyModal992',css:'open',close:globalThis.__MANRU_STORY992__?.close},
  {id:'storyScene992',css:'open',close:globalThis.__MANRU_STORY992__?.closeScene},
  {id:'rc70',body:'rc70-open',close:globalThis.__MANRU_RELEASE__?.closePanel},
  {id:'potionTargetHud',css:'show',kind:'targeting',close:globalThis.__MANRU_POTION41_ACTIONS__?.cancelTarget},
  {id:'talismanTarget56',css:'show',kind:'targeting',close:clearTalismanInput57},
  {id:'foodTarget57',css:'show',kind:'targeting',close:cancelFoodTarget},
  {id:'anvilPanel105',kind:'modal',close:closeAnvil},
  {id:'summonPanel105',kind:'modal',close:closeSummonPanel},
  {id:'worldTarget57',css:'show',kind:'targeting',close:cancelWorldTarget}
]}
function clearTalismanInput57(){globalThis.__MANRU_CONSUMABLE56_ACTIONS__?.cancelTarget?.();globalThis.__MANRU_TALISMAN74_ACTIONS__?.cancelTarget?.()}
function interactionActive8(id){
  if(id==='inventory')return inventoryOpen;if(id==='martialPanel')return martialOpen;if(id==='helpPanel')return helpOpen;if(id==='cipherPanel')return cipherOpen;
  if(id==='cook57')return !!RuntimeState.ui.food?.cookOpen;
  if(id==='worldTarget57')return worldTargetActive57();
  if(id==='potionTargetHud')return !!globalThis.__MANRU_POTION41_ACTIONS__?.target?.();
  if(id==='talismanTarget56')return !!(globalThis.__MANRU_CONSUMABLE56_ACTIONS__?.target?.()||globalThis.__MANRU_TALISMAN74_ACTIONS__?.target?.());
  if(id==='foodTarget57')return !!RuntimeState.ui.food?.foodTarget;
  if(id==='rc70')return !!RuntimeState.ui.release?.panelOpen;
  return RuntimeState.ui.sessions.has(id);
}
function setInteraction8(id,active){if(active)RuntimeState.ui.sessions.add(id);else RuntimeState.ui.sessions.delete(id);projectInteractionUI()}

function setGenerationPresentation8(active){RuntimeState.ui.generationPending=active;projectInteractionUI()}
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
function gameplayUiOpen57(){return !state?.debugBattle57&&runState57()==='playing'}
function dismissGameplayInput57(all=false){
  const panels=activeGameplayPanels57();if(!panels.length)return false;
  for(const panel of all?panels:[panels[panels.length-1]])panel.close?.(true);clearHeldInput53();return true
}
function closeGameplayInteractionState57(opts={}){cancelAutoWalk();for(const panel of activeGameplayPanels57())panel.close?.(opts.preserveProgress&&panel.id==='storyModal992'?{preserveProgress:true}:true);globalThis.__MANRU_ITEM_IDENTITY991__?.closeSkillQuick?.();clearHeldInput53();projectInteractionUI();return true}
const INPUT_PRIORITY57=Object.freeze(['fatal/blocking','modal/dialogue','targeting','special interaction','gameplay HUD','canvas/world','gameplay keyboard','passive shortcut']);
const INPUT_COMMANDS57=Object.freeze(['MOVE','ATTACK','REST','PICKUP','CONTEXT_ACTION','DESCEND','BLINK','CLASS_SKILL','OPEN_MARTIAL','TOGGLE_SKILL_QUICK','QUICK_MARTIAL','OPEN_SUMMON105','TOGGLE_INVENTORY','TOGGLE_HELP','OPEN_MOBILE_DRAWER','OPEN_MAP','AUTO_EXPLORE','TARGET_MOVE','TARGET_CONFIRM','TARGET_CANCEL','MODAL_CANCEL','WORLD_SELECT','WORLD_INSPECT','CAMERA_PAN','CAMERA_ZOOM','CAMERA_CENTER','CLOSE_DOOR','QUICK_SLOT','TOGGLE_RELEASE','TOGGLE_SFX','STORY_OPEN_NOTE','STORY_SELECT_ENDING','STORY_CONFIRM_ENDING','STORY_CONTINUE','CIPHER_DIGIT','CIPHER_CLEAR','SAVE','LOAD']);
const INPUT_ROUTER57_AUDIT={serial:0,handled:0,blocked:0,ignored:0,handledCommands:{},attempts:{},history:[],listeners:new Set()};


function clientCommand9(client,command){
  const audit=RuntimeState.client[client.kind];
  if(!client.active()){audit.inactiveAttempts++;return{command:command?.type||'UNKNOWN',source:command?.source||'unknown',status:'ignored',owner:'inactive-client',consumed:false}}
  if(OrientationGate.blocks(command)){audit.gated++;return InputRouter.dispatch(command)}
  audit.emissions++;return InputRouter.dispatch(command)
}


const DesktopClient=Object.freeze({
  kind:'desktop',
  active(){return RuntimeState.client.type==='desktop'},
  emit(command){return clientCommand9(this,command)},
  handleEvent(e){
    if(!this.active()){RuntimeState.client.desktop.inactivePhysical++;return}
    RuntimeState.client.desktop.physical++;
    if(e.type==='keydown'||e.type==='keyup'){clientKeyboardEvent(this,e);return}
    if(e.type==='contextmenu'){
      e.preventDefault();if(!state)return;e.stopPropagation();e.stopImmediatePropagation();this.emit({type:'WORLD_INSPECT',cell:globalThis.__MANRU_WORLD_HITTEST12__.cellAtClient(e.clientX,e.clientY),source:'contextmenu'});return;
    }
    if(e.type==='wheel'){
      const path=e.composedPath(),surface=RuntimeState.input.device?.input;if(!state||state.debugBattle57||!path.includes(C)&&!path.includes(surface))return;
      const r=C.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)return;
      const unit=e.deltaMode===1?16:e.deltaMode===2?VIEW.h:1,dy=Math.max(-180,Math.min(180,(e.deltaY||0)*unit)),result=this.emit({type:'CAMERA_ZOOM',scale:Math.exp(-dy*.00165),anchor:{clientX:e.clientX,clientY:e.clientY},source:'wheel'});
      if(result.status==='handled'){e.preventDefault();e.stopImmediatePropagation()}return;
    }
    if(e.currentTarget===C)clientTargetEvent(this,e)
  },
  cancelPhysical(){clearHeldInput53()},
  snapshot(){return{kind:this.kind,active:this.active(),...RuntimeState.client.desktop}}
});
const MobileClient=Object.freeze({
  kind:'mobile',
  active(){return RuntimeState.client.type==='mobile'},
  emit(command){return clientCommand9(this,command)},
  handleEvent(e){
    if(!this.active()){RuntimeState.client.mobile.inactivePhysical++;return}
    RuntimeState.client.mobile.physical++;
    if(e.type==='keydown'||e.type==='keyup'){clientKeyboardEvent(this,e);return}
    if(e.currentTarget===C)clientTargetEvent(this,e)
  },
  cancelPhysical(){
    clearHeldInput53();const device=RuntimeState.input.device;if(!device)return;
    globalThis.__MANRU_CAMERA_STATE12__?.cancelInertia?.();
    for(const pointer of device.pointers?.values?.()||[]){clearTimeout(pointer.holdShow);clearTimeout(pointer.holdFire);if(device.input?.hasPointerCapture?.(pointer.id))device.input.releasePointerCapture(pointer.id)}
    for(const [button,contact]of device.actionPointers?.entries?.()||[]){contact.down=null;contact.ready=false;button.classList.remove('rt81-pressed')}
    device.pointers?.clear?.();device.hold?.classList.remove('show');device.gesture=null;device.mousePan=null;globalThis.__MANRU_RUNTIME81__?.stopHeld?.();
  },
  snapshot(){return{kind:this.kind,active:this.active(),...RuntimeState.client.mobile}}
});
const OrientationGate=Object.freeze({
  active(){return false},
  blocks(command){return this.active()&&runState57()==='playing'&&CLIENT_GAMEPLAY_COMMANDS.has(command?.type)},
  project(){
    const active=this.active()&&runState57()==='playing',overlay=document.getElementById('orientationGate9');
    document.body.classList.toggle('orientation-gate9',active);if(overlay){overlay.hidden=!active;overlay.setAttribute('aria-hidden',String(!active))}return active;
  },
  snapshot(){return{owner:'OrientationGate',active:this.active(),blocking:this.active()&&runState57()==='playing',orientation:RuntimeState.client.orientation,client:RuntimeState.client.type}}
});
const ClientEnvironment=Object.freeze({
  capture(){
    const touch=Number(navigator.maxTouchPoints||0)>0||'ontouchstart'in window,coarse=!!window.matchMedia?.('(pointer: coarse)')?.matches,narrow=!!window.matchMedia?.('(max-width: 1080px)')?.matches;
    return{touch,coarse,narrow,width:innerWidth,height:innerHeight,orientation:innerHeight>innerWidth?'portrait':'landscape'};
  },
  initialize(){
    if(RuntimeState.client.initialized)return this.snapshot();const environment=this.capture();
    RuntimeState.client.initialized=true;RuntimeState.client.environment=environment;RuntimeState.client.type=environment.touch&&(environment.coarse||environment.narrow)?'mobile':'desktop';RuntimeState.client.selection={touch:environment.touch,coarse:environment.coarse,narrow:environment.narrow};RuntimeState.client.orientation=environment.orientation;
    this.project();return this.snapshot();
  },
  handleEvent(){this.refresh('environment-change')},
  refresh(reason='refresh'){
    const environment=this.capture(),before=RuntimeState.client.orientation;RuntimeState.client.environment=environment;RuntimeState.client.orientation=environment.orientation;RuntimeState.client.refreshes++;RuntimeState.client.lastReason=reason;
    if(before!==environment.orientation){RuntimeState.client.transitions++;if(environment.orientation==='portrait')MobileClient.cancelPhysical()}
    this.project();return this.snapshot();
  },
  project(){
    const type=RuntimeState.client.type;document.body.dataset.manruClient=type||'';document.body.classList.toggle('client-desktop9',type==='desktop');document.body.classList.toggle('client-mobile9',type==='mobile');document.body.classList.toggle('client-portrait9',type==='mobile'&&RuntimeState.client.orientation==='portrait');OrientationGate.project();
  },
  activeClient(){return RuntimeState.client.type==='mobile'?MobileClient:DesktopClient},
  emit(command){return this.activeClient().emit(command)},
  routeEvent(e){return this.activeClient().handleEvent(e)},
  snapshot(){return{owner:'ClientEnvironment',type:RuntimeState.client.type,orientation:RuntimeState.client.orientation,orientationGate:OrientationGate.active(),selection:{...RuntimeState.client.selection},environment:{...RuntimeState.client.environment},refreshes:RuntimeState.client.refreshes,transitions:RuntimeState.client.transitions,owners:{desktop:DesktopClient.active()?1:0,mobile:MobileClient.active()?1:0},inactiveEmissions:{desktop:0,mobile:0},desktop:DesktopClient.snapshot(),mobile:MobileClient.snapshot()}}
});


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
C.addEventListener('pointerdown',InputRouter,{capture:true,passive:false});InputRouter.noteListener('canvas-target:pointerdown');
C.addEventListener('pointerup',InputRouter,{capture:true,passive:false});InputRouter.noteListener('canvas-target:pointerup');
C.addEventListener('click',InputRouter,{capture:true,passive:false});InputRouter.noteListener('canvas-target:click');
document.addEventListener('keyup',InputRouter);InputRouter.noteListener('document:keyup');









const OccupancyService=(()=>{
 let shared=null,sharedState=null,sharedMap=null,indexed=new WeakMap(),rebuilds=0,queries=0,linearFallbacks=0;
 const category=new WeakMap();
 const cells=(entity,x=entity?.x,y=entity?.y)=>entityFootprintCells57(entity,x,y);
 function ensureWorld(){if(shared&&(sharedState!==state||sharedMap!==state?.map))endShared()}
 function put(entity,kind){ensureWorld();if(!shared||!entity)return;category.set(entity,kind);const keys=cells(entity).map(q=>k(q.x,q.y));indexed.set(entity,keys);for(const key of keys){const set=shared.get(key)||new Set();set.add(entity);shared.set(key,set)}}
 function release(entity){ensureWorld();if(!shared||!entity)return;for(const key of indexed.get(entity)||[]){const set=shared.get(key);if(!set)continue;set.delete(entity);if(!set.size)shared.delete(key)}indexed.delete(entity)}
 function beginShared(){shared=new Map();sharedState=state;sharedMap=state?.map;indexed=new WeakMap();rebuilds++;if(state?.player)put(state.player,'player');for(const m of state?.monsters||[])if(m.hp>0)put(m,'monster');for(const n of state?.neutralInteractables58||[])put(n,'neutral');for(const item of state?.items||[])put(item,'item');return shared}
 function endShared(){shared=null;sharedState=null;sharedMap=null;indexed=new WeakMap()}
 function entriesAt(x,y){ensureWorld();queries++;return shared?.get(k(x,y))||null}
 function isOccupied(x,y,ignore=null){const entries=entriesAt(x,y);if(shared){for(const entity of entries||[]){const kind=category.get(entity);if(entity!==ignore&&(kind==='monster'||kind==='neutral'))return true}return false}linearFallbacks++;return !!neutralInteractableAt58(x,y)||state.monsters.some(m=>m!==ignore&&m.hp>0&&monCovers(m,x,y))}
 function blocksEntityCell(x,y,ignored){const entries=entriesAt(x,y);if(shared){for(const entity of entries||[]){const kind=category.get(entity);if(!ignored.has(entity)&&(kind==='player'||kind==='monster'||kind==='neutral'))return true}return false}linearFallbacks++;for(const n of state.neutralInteractables58||[])if(n.x===x&&n.y===y)return true;for(const other of [state.player,...state.monsters])if(other&&!ignored.has(other)&&other.hp>0&&entityFootprintCells57(other).some(q=>q.x===x&&q.y===y))return true;return false}
 function occupants(cells0){ensureWorld();const keys=new Set(cells0.map(q=>k(q.x,q.y))),out=[];if(shared){const found=new Set();for(const key of keys)for(const entity of shared.get(key)||[]){const kind=category.get(entity);if((kind==='player'||kind==='monster'||kind==='item')&&!found.has(entity)){found.add(entity);out.push(entity)}}return out}linearFallbacks++;for(const entity of [state.player,...state.monsters,...state.items])if(entity&&(entity.hp==null||entity.hp>0)&&entityFootprintCells57(entity).some(q=>keys.has(k(q.x,q.y))))out.push(entity);return out}
 function removeItem(item){release(item);const i=state.items.indexOf(item);if(i<0)return false;state.items.splice(i,1);return true}
 function addMonster(mon){if(mon.summonOwner105&&!summonCanAdmit(mon))return 0;if(mon.faction57&&!['player','hostile','neutral'].includes(mon.faction57))throw new Error('Unknown combat faction: '+mon.faction57);mon.faction57=entityFaction(mon);mon.friendly47=mon.faction57==='player';if(state.debugBattle57){mon.debugSide57=mon.faction57==='player'?'A':'B';mon.debugId57??=++DEBUG_BATTLE57.serial;mon.rewardPolicy57={xp:false,kills:false,drops:false}}const length=state.monsters.push(mon);put(mon,'monster');return length}
 function removeMonster(mon){release(mon);const found=state.monsters.includes(mon);state.monsters=state.monsters.filter(item=>item!==mon);return found}
 function move(entity,x,y){const ox=entity?.x,oy=entity?.y;if(!entity||!Number.isFinite(x)||!Number.isFinite(y))return false;const kind=category.get(entity)||(entity===state.player?'player':state.items?.includes(entity)?'item':state.neutralInteractables58?.includes(entity)?'neutral':'monster');release(entity);entity.x=x;entity.y=y;put(entity,kind);if((ox!==x||oy!==y)&&(kind==='player'||kind==='monster'))entityTerrainEntry105(entity,x,y,ox,oy);return true}
 function metrics(){ensureWorld();return{shared:!!shared,rebuilds,queries,linearFallbacks,cells:shared?.size||0}}
 return Object.freeze({beginShared,endShared,isOccupied,blocksEntityCell,occupants,addMonster,removeMonster,removeItem,move,metrics});
})();
const PlacementService=Object.freeze({
moveItem(item,x,y){if(!state?.items?.includes(item))return false;OccupancyService.move(item,x,y);return true},
placeItem(item,origin={x:item?.x,y:item?.y},opts={}){
  if(!state||!item)return false;
  const branch=state.floor===2&&state.floor2Choice63;
  if(branch&&state.generationInProgress57){const prior=opts.restrict,route=branch.branches?.find(r=>r.id===item.floor2Bonus66);opts={...opts,restrict:p=>(!prior||prior(p))&&(route?route.cells.includes(k(p.x,p.y)):branch.commonZones.some(r=>p.x>=r.x&&p.x<r.x+r.w&&p.y>=r.y&&p.y<r.y+r.h))}}
  const existing=state.items.includes(item),point=PlacementService.findItemCell(origin,{...opts,allowPlayer:opts.allowPlayer!==false,allowItems:true,preferEmpty:opts.preferEmpty??(!existing&&!state.generationInProgress57&&opts.requireReachable!==false),requireReachable:!state.generationInProgress57&&opts.requireReachable!==false});
  if(existing)return point?PlacementService.moveItem(item,point.x,point.y):false;
  if(point){const moved=transferItemQuantity(item,null,state.items,itemQuantity(item),{position:point});if(!moved.remaining){if(state.pendingGroundItems57)state.pendingGroundItems57=state.pendingGroundItems57.filter(q=>q.item!==item);return true}}
  state.pendingGroundItems57=state.pendingGroundItems57||[];
  if(!state.pendingGroundItems57.some(q=>q.item===item))state.pendingGroundItems57.push({item,origin:{...origin}});
  return false
},
validateItems(opts={}){let moved=0,bad=0;for(const it of state.items||[]){const x=it.x,y=it.y;if(!PlacementService.placeItem(it,{x,y},opts))bad++;else if(it.x!==x||it.y!==y)moved++}return{moved,bad}},
flushPendingItems(){
  if(!state?.pendingGroundItems57?.length){PlacementService.reconcileBossDrop();return}const pending=state.pendingGroundItems57,reachable=ReachabilityService.lootCells();state.pendingGroundItems57=[];for(const q of pending)PlacementService.placeItem(q.item,q.origin,{reachable});PlacementService.reconcileBossDrop()
},
terrainStandable(entity,tile){
  if(tile==null)return false;if(tile===TT.PALACE_ROCK)return false;if(state?.debugBattle57&&state.debugBattleIgnoreTerrain57&&terrainSurface58(tile))return true;if(tile===TT.RAFT)return true;
  const hazardKind=globalThis.__MANRU_HAZARD_CORE__?.kind?.(tile);if(hazardKind)return !!globalThis.__MANRU_HAZARD_CORE__?.adapted?.(entity,hazardKind);
  if(tile>=500&&tile<660&&tileBlocks(tile))return false;
  return entity?.flying?!FLYING_BLOCKING_TILES57.has(tile):entity?.aquatic&&!entity.amphibious57?AQUATIC_STAND_TILES57.has(tile):entity?.lava?(tile===TT.LAVA||!tileBlocks(tile)):!tileBlocks(tile)
},
canPlaceEntity(entity,x,y,opts={}){
  const ignored=opts.ignore||new Set([entity]);for(const cell of entityFootprintCells57(entity,x,y)){if(entity?.territory105&&!state.debugBattle57){const b=entity.territory105;if(cell.x<b.x||cell.y<b.y||cell.x>=b.x+b.w||cell.y>=b.y+b.h)return false;}
    if(cell.x<1||cell.y<1||cell.x>=COLS-1||cell.y>=ROWS-1)return false;if(entity!==state.player&&inTutorialEntry(cell.x,cell.y))return false;
    const tile=opts.tiles?.get(k(cell.x,cell.y))??state.map[cell.y][cell.x];if(!PlacementService.terrainStandable(entity,tile))return false;
    if(OccupancyService.blocksEntityCell(cell.x,cell.y,ignored))return false;
  }return true
},
findMonster(mon,opts={}){
  const mode=opts.placementMode||'floor',origin=opts.origin||state.player,radius=opts.radius??2,cells=[],reachable=opts.reachable?ReachabilityService.distances(origin):null;
  if(mode==='exact')return state.map?.[origin.y]?.[origin.x]!==TT.STAIR&&(!opts.restrict||opts.restrict(origin))&&PlacementService.canPlaceEntity(mon,origin.x,origin.y)?{x:origin.x,y:origin.y}:null;
  for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++){const d=Math.max(Math.abs(x-origin.x),Math.abs(y-origin.y));if(mode==='local'&&d>radius)continue;if(state.map[y][x]===TT.STAIR)continue;if(opts.restrict&&!opts.restrict({x,y}))continue;if(reachable&&!reachable.has(k(x,y)))continue;if(opts.safe!==false&&!PlacementService.canPlaceEntity(mon,x,y))continue;cells.push({x,y,d})}
  const preferred=mon?.grassHide57?cells.filter(c=>monsterAmbushCanHide(mon,c.x,c.y)):cells,pool=preferred.length?preferred:cells;if(mode==='local')pool.sort((a,b)=>a.d-b.d);return pool.length?(mode==='local'?pool[0]:choice(pool)):null
},
monsterCanStand(mon,x,y,spawnCtx57=null,opts={}){
  if(state.generationInProgress57&&state.floor===2&&state.floor2Choice63?.safeCells.includes(k(x,y)))return false;
  if(entityFootprintCells57(mon,x,y).some(p=>inTutorialEntry(p.x,p.y)))return false;
  if(mon?.waterOnly57){if(x<1||y<1||x>=COLS-1||y>=ROWS-1||state.map[y][x]!==TT.WATER||OccupancyService.isOccupied(x,y,mon)||(x===state.player.x&&y===state.player.y))return false;return true}
  if(!spawnCtx57)return PlacementService.canPlaceEntity(mon,x,y,opts);
  for(const q of entityFootprintCells57(mon,x,y))if(q.x<1||q.y<1||q.x>=COLS-1||q.y>=ROWS-1||!PlacementService.terrainStandable(mon,state.map[q.y][q.x])||spawnCtx57.occupied.has(q.y*COLS+q.x)||(q.x===state.player.x&&q.y===state.player.y))return false;return true
},
randomFloor(minRoomIndex=0,opts={}){const start=Math.max(0,Math.floor(Number(minRoomIndex)||0)),rooms=start>0?(state.rooms||[]).slice(start).filter(r=>r&&Number.isFinite(r.x)&&Number.isFinite(r.y)&&r.w>0&&r.h>0):[],insideAllowed=(x,y)=>!rooms.length||rooms.some(r=>x>=r.x&&y>=r.y&&x<r.x+r.w&&y<r.y+r.h),spots=[];for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++)if(insideAllowed(x,y)&&ReachabilityService.terrainPassable(x,y)&&state.map[y][x]!==TT.STAIR&&!OccupancyService.isOccupied(x,y)&&!(x===state.player.x&&y===state.player.y))spots.push({x,y});if(spots.length)return choice(spots);if(start>0&&rooms.length){for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++)if(ReachabilityService.terrainPassable(x,y)&&state.map[y][x]!==TT.STAIR&&!OccupancyService.isOccupied(x,y)&&!(x===state.player.x&&y===state.player.y))spots.push({x,y})}return spots.length?choice(spots):{x:state.player.x,y:state.player.y}},
randomMonsterCell(mon){const spots=[];for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++)if(PlacementService.monsterCanStand(mon,x,y)&&state.map[y][x]!==TT.STAIR)spots.push({x,y});return spots.length?choice(spots):null},
registerGenerationMonster(ctx,mon){
  if(!ctx||!mon||mon.hp<=0)return;
  for(const[ox,oy]of footprintOffsets(mon)){
    const x=mon.x+ox,y=mon.y+oy;if(x>=0&&y>=0&&x<COLS&&y<ROWS)ctx.occupied.add(y*COLS+x)
  }
  const x0=Math.max(1,mon.x-8),x1=Math.min(COLS-2,mon.x+8),y0=Math.max(1,mon.y-8),y1=Math.min(ROWS-2,mon.y+8);
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
    const d=Math.max(Math.abs(mon.x-x),Math.abs(mon.y-y)),idx=y*COLS+x;
    if(d<=4)ctx.local[idx]++;if(d<=8)ctx.wide[idx]++
  }
},
generationContext(dist,safe,groupSize=1){
  const size=COLS*ROWS,ctx={groupSize,occupied:new Set(),local:new Uint16Array(size),wide:new Uint16Array(size),candidates:[]},roomMeta=new Array(size);
  for(const r of state.rooms||[]){
    const key=`${r.x},${r.y},${r.w},${r.h}`,area=r.w*r.h,cap=(state.floor===20&&state.specialFloor)?12:(area>320?Math.max(2,Math.min(5,Math.floor(area/260))):(state.specialFloor?2:1));
    const y0=Math.max(1,r.y),y1=Math.min(ROWS-1,r.y+r.h),x0=Math.max(1,r.x),x1=Math.min(COLS-1,r.x+r.w);
    for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const idx=y*COLS+x;if(roomMeta[idx]===undefined)roomMeta[idx]={key,cap}}
  }
  for(const m of state.monsters||[])PlacementService.registerGenerationMonster(ctx,m);
  for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++){
    if(state.map[y][x]===TT.STAIR||state.visible.has(k(x,y)))continue;
    const d=dist.get(k(x,y));if(Number.isFinite(d)&&d<safe)continue;
    const meta=roomMeta[y*COLS+x];ctx.candidates.push({x,y,key:meta?.key||null,cap:meta?.cap??Infinity})
  }
  return ctx
},
reconcileBossDrop(){
  if(!state?.bossDrop55||state.bossDrop55.granted)return state?.bossDrop55||null;
  const requested=Math.max(0,Math.floor(Number(state.bossDrop55.requested)||0));if(!requested)return state.bossDrop55;
  const world=(state.items||[]).filter(i=>i?.bossDrop55).reduce((n,i)=>n+itemQuantity(i),0),pending=(state.pendingGroundItems57||[]).filter(q=>q?.item?.bossDrop55).reduce((n,q)=>n+itemQuantity(q.item),0);
  state.bossDrop55.count=world;state.bossDrop55.pendingCount=pending;state.bossDrop55.pending=pending>0;
  if(world===requested&&pending===0){const expanded=[],seen=new Set();for(const item of state.items||[]){if(!item?.bossDrop55)continue;for(let n=0;n<itemQuantity(item);n++){const key=k(item.x,item.y),stacked=seen.has(key);seen.add(key);expanded.push({name:item.name,type:item.type,potionKind:item.potionKind||null,talismanKind:item.talismanKind||null,x:item.x,y:item.y,stacked})}}state.bossDrop55.granted=true;state.bossDrop55.pending=false;state.bossDrop55.pendingCount=0;state.bossDrop55.healCount=expanded.filter(v=>['heal_small','heal_medium','heal_large'].includes(v.potionKind)).length;state.bossDrop55.stackedFallbacks=expanded.filter(v=>v.stacked).length;state.bossDrop55.items=expanded;addLog(`보스 전리품 ${world}개를 주변 바닥에 놓았다.`)}
  return state.bossDrop55
},
findItemCell(origin,opt={}){
  if(!state?.player||!origin)return null;
  const reachable=opt.reachable||(opt.requireReachable===false?null:ReachabilityService.lootCells()),sx=Math.max(1,Math.min(COLS-2,Number.isFinite(origin.x)?Math.floor(origin.x):state.player.x)),sy=Math.max(1,Math.min(ROWS-2,Number.isFinite(origin.y)?Math.floor(origin.y):state.player.y));
  const itemCells=new Set((state.items||[]).map(it=>k(it.x,it.y))),occupiedCells=new Set();
  for(const mon of state.monsters||[])if(mon.hp>0)for(const [ox,oy]of footprintOffsets(mon))occupiedCells.add(k(mon.x+ox,mon.y+oy));
  function legal(x,y,allowItems){return (!Number.isFinite(opt.radius)||Math.max(Math.abs(x-sx),Math.abs(y-sy))<=Math.max(0,opt.radius))&&safeLootGround42(x,y)&&(!opt.restrict||opt.restrict({x,y}))&&(!reachable||reachable.has(k(x,y)))&&(opt.allowPlayer||x!==state.player.x||y!==state.player.y)&&(state.stairs?.x!==x||state.stairs?.y!==y)&&!occupiedCells.has(k(x,y))&&(allowItems||!itemCells.has(k(x,y)))}
  // Runtime drops use the player's reachable safe ground, not a land path starting
  // at the corpse: fish, flying enemies and hazard deaths can originate off land.
  // Stable distance ordering also serves boss reservations and stacked fallback.
  if(reachable){
    let best=null,bestRank=Infinity,bestDistance=Infinity,bestManhattan=Infinity;
    for(const key of reachable){const [x,y]=key.split(',').map(Number);if(!legal(x,y,!!opt.allowItems))continue;const rank=opt.preferEmpty&&itemCells.has(key)?1:0,distance=Math.max(Math.abs(x-sx),Math.abs(y-sy)),manhattan=Math.abs(x-sx)+Math.abs(y-sy);
      if(rank<bestRank||rank===bestRank&&(distance<bestDistance||distance===bestDistance&&(manhattan<bestManhattan||manhattan===bestManhattan&&(!best||y<best.y||y===best.y&&x<best.x)))){best={x,y};bestRank=rank;bestDistance=distance;bestManhattan=manhattan}
    }return best;
  }
  // Generation and legacy ground normalization retain local, non-hazard transit.
  function transit(x,y){if(x<1||y<1||x>=COLS-1||y>=ROWS-1)return false;const t=state.map?.[y]?.[x];return t===TT.DOOR||t===TT.OPEN_DOOR||safeLootGround42(x,y)}
  if(legal(sx,sy,!!opt.allowItems))return{x:sx,y:sy};
  return ReachabilityService.localPlacement({sx,sy,opt,transit,legal})
}
});




















function fieldProvenance57(field){if(field.sourceFaction)return field;return{...field,...effectSource57(null,{sourceFaction:field.owner57||'player',owner:field.owner57||'player',credit:field.owner57==='hostile'?null:'player'})}}


function produceWallMaterials105(world=state,reset=false){
 if(!world?.map?.length)return;
 const r=world.terrainReactions105||(world.terrainReactions105=newTerrainReactions105());
 if(reset||!r.wallMaterials105)r.wallMaterials105={version:1,cells:{}};
 const cells=r.wallMaterials105.cells,w=world.map[0].length,h=world.map.length;
 // Freeze the original timber face and stone backing. Burning a face must never
 // reclassify newly exposed backing as timber, including after a save/branch visit.
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  if(!authoredWoodWall(x,y,world)||Object.hasOwn(cells,k(x,y)))continue;
  const exposed=DIRS8.some(([dx,dy])=>world.map[y+dy]?.[x+dx]!=null&&world.map[y+dy][x+dx]!==TT.WALL);
  cells[k(x,y)]=x>0&&y>0&&x<w-1&&y<h-1&&exposed&&!protectedProp105(x,y,world)?'wood':'stone';
 }
}
















// Environmental reactions share contact, occupancy and temporary-field owners.
function protectedProp105(x,y,world=state){
 return world.terrainAttachment58?.[k(x,y)]==='secret-wall'||world.map[y]?.[x]===TT.SECRET_DOOR||world.map[y]?.[x]===TT.LOCKED_GATE||world.branchPortals105?.some(q=>q.x===x&&q.y===y)||world.keyPlan96?.groups?.some(g=>(g.doors||[]).some(q=>q.x===x&&q.y===y))||(world===state&&globalThis.__MANRU_RUMOR_SPACES1030__?.mutationLocked?.(x,y));
}



function environmentStanding105(entity){
 if(!entity||entity.hp<=0)return;
 const r=terrainReactions105(),cells=entityFootprintCells57(entity);
 for(const q of cells){const t=state.map[q.y]?.[q.x],spill=r.spills?.[k(q.x,q.y)];
  if(isWaterTile105(t)||(!entity.flying&&spill?.kind==='water')){combustionContact105(entity,'water');continue;}
  if(!entity.flying){
   const fields=[...(state.tempFields||[]).filter(f=>f.kind==='fire').map(f=>({...f,cells:tempFieldCells57(f),damage:3})),...(state.elementFields74||[]).filter(f=>f.kind==='fire').map(f=>({...f,cells:f.cells??elementCells105(f.x,f.y,1)})),...(state.legendFireFields47||[]).map(f=>({...f,cells:f.cells??[{x:f.x,y:f.y}],damage:3}))].filter(f=>f.ttl>0&&f.cells.some(c=>c.x===q.x&&c.y===q.y));
   const field=fields.sort((a,b)=>(b.damage||3)-(a.damage||3))[0],burn=r.burning[k(q.x,q.y)];
   if(field||burn)combustionContact105(entity,'fire',field?fieldProvenance57(field):burn.source||{},{floorDamage:field?Math.max(3,field.damage||3):0});
  }
  if(!entity.flying&&spill&&spill.lastHit?.[entity===state.player?'player':entity.id57||entity.name+':'+entity.x+','+entity.y]!==state.turn){
   const id=entity===state.player?'player':entity.id57||entity.name+':'+entity.x+','+entity.y;spill.lastHit||={};spill.lastHit[id]=state.turn;
   if(spill.kind==='poison')applyCombatStatus(entity,'poison',3);
   if(spill.kind==='wine')applyCombatStatus(entity,'drunk',2);
  }
 }
}
function entityTerrainEntry105(entity,x,y,ox,oy){
 if(state?.generationInProgress57||!entity||entity.hp<=0)return;
 mineEntityEntry(entity,x,y);if(entity.hp<=0)return;
 if(entity!==state.player&&!entity.flying){
  const previous=new Set(entityFootprintCells57({...entity,x:ox,y:oy}).map(q=>k(q.x,q.y)));
  for(const q of entityFootprintCells57(entity))if(!previous.has(k(q.x,q.y))){const t=state.map[q.y]?.[q.x];if(t===TT.TRAP)trapEvent(q.x,q.y,entity);else if(t===TT.SNARE)snareEvent(q.x,q.y,false,entity);else if(t===TT.CRUMBLE)globalThis.__MANRU_HAZARD_CORE__?.armFragile(q.x,q.y,t,{cause:'monster-step',entity});if(entity.hp<=0)break}
  const current=new Set(entityFootprintCells57(entity).map(q=>k(q.x,q.y)));for(const q of entityFootprintCells57(entity,ox,oy))if(!current.has(k(q.x,q.y))&&state.map[q.y]?.[q.x]===TT.CRUMBLE)globalThis.__MANRU_HAZARD_CORE__?.collapseAt(q.x,q.y,'crumble');
 }
 environmentStanding105(entity);if(entity!==state.player&&entity.hp>0)resolveSilkCrossing54({x:ox,y:oy},'walk',entity);
}









function pushableAt105(x,y){if(protectedProp105(x,y))return null;const cart=state.branchTerrain105?.mine105?.carts?.find(c=>c.alive&&c.x===x&&c.y===y);return cart?{x,y,cart}:state.map[y]?.[x]===TT.CRATE?{x,y,tile:TT.CRATE}:null}
function adjacentPushable105(){const p=state?.player;if(!p)return null;const f=p.facing||{x:0,y:1};return Math.abs(f.x)+Math.abs(f.y)===1?pushableAt105(p.x+f.x,p.y+f.y):null}
function pushStructure105(obj,actor=state.player){
 if(!obj||Math.abs(obj.x-actor.x)+Math.abs(obj.y-actor.y)!==1)return false;const dx=obj.x-actor.x,dy=obj.y-actor.y,x=obj.x+dx,y=obj.y+dy,t=state.map[y]?.[x];
 // Do not seal exits, doors, one-cell junctions, items or living occupants.
 if(!(terrainSurface58(t)||t===TT.TRAP||t===TT.SNARE)||t===TT.ICE||protectedProp105(x,y)||state.stairs?.x===x&&state.stairs?.y===y||runtimeTerrainOccupants57(x,y).length||state.items.some(i=>i.x===x&&i.y===y)||pushableAt105(x,y))return false;
 const current=pushableAt105(obj.x,obj.y);if(!current||!!current.cart!==!!obj.cart||obj.cart&&current.cart!==obj.cart)return false;
 const oldBase=furnitureFloor57(obj.x,obj.y),mine=state.branchTerrain105?.mine105;
 if(ShopMapBuilder.groundAt(x,y)||!obj.cart&&(mine?.buttons||[]).some(b=>b.x===x&&b.y===y))return false;
 const risingGates=new Set((mine?.walls||[]).filter(w=>w.open&&!w.persistent105).flatMap(w=>w.cells.map(q=>k(q.x,q.y))));
 const unstable=new Set((mine?.walls||[]).flatMap(w=>w.cells.map(q=>k(q.x,q.y))).filter(key=>!risingGates.has(key)));
 const unsafe=t=>t===undefined||tileBlocks(t)||[TT.ICE,TT.PAPER_BRIDGE,TT.CRUMBLE,TT.RAFT,TT.DRAWBRIDGE_DOWN,TT.DRAWBRIDGE_UP,TT.WATER,TT.LAVA,TT.MERCURY,TT.VOID].includes(t);
 for(const r of state.tempTerrain74||[])if(unsafe(r.old)||unsafe(r.tile))unstable.add(k(r.x,r.y));
 // Objects must not outlive unstable floor support. An open timed grate crushes its obstruction on ascent.
 if(unstable.has(k(obj.x,obj.y))||unstable.has(k(x,y)))return false;
 const carts=new Set((mine?.carts||[]).filter(c=>c.alive&&c!==obj.cart).map(c=>k(c.x,c.y)));
 const pass=(xx,yy,after)=>{
  if(xx<1||yy<1||xx>=COLS-1||yy>=ROWS-1||unstable.has(k(xx,yy))||carts.has(k(xx,yy)))return false;
  if(after&&xx===x&&yy===y||!after&&xx===obj.x&&yy===obj.y)return false;
  return !unsafe(after&&xx===obj.x&&yy===obj.y?oldBase:state.map[yy]?.[xx]);
 };
 const flood=after=>{const seen=new Set([k(actor.x,actor.y)]),queue=[{x:actor.x,y:actor.y}];for(let i=0;i<queue.length;i++)for(const[dx,dy]of DIRS4){const xx=queue[i].x+dx,yy=queue[i].y+dy,key=k(xx,yy);if(!seen.has(key)&&pass(xx,yy,after)){seen.add(key);queue.push({x:xx,y:yy})}}return seen};
 // Timed rising gates own obstruction destruction; a push here cannot seal a route permanently.
 if(!risingGates.has(k(x,y))){
 const before=flood(false),after=flood(true);
 // Keep every previously accessible permanent square; also keep all sides of
 // the landing square connected, including the newly vacated crate square.
 for(const key of before)if(key!==k(x,y)&&!after.has(key))return false;
 for(const[dx,dy]of DIRS4)if(pass(x+dx,y+dy,true)&&!after.has(k(x+dx,y+dy)))return false;
 const access=(set,xx,yy)=>set.has(k(xx,yy))||DIRS4.some(([dx,dy])=>set.has(k(xx+dx,yy+dy)));
 // Gates/fixtures can be blocking tiles: preserving floor connectivity alone
 // does not preserve their only interaction square.
 for(let yy=1;yy<ROWS-1;yy++)for(let xx=1;xx<COLS-1;xx++){
  if(xx===obj.x&&yy===obj.y||xx===x&&yy===y)continue;
  const tile=state.map[yy][xx];if(tile===TT.WALL||terrainSurface58(tile)||[TT.WATER,TT.LAVA,TT.MERCURY,TT.VOID].includes(tile))continue;
  if(access(before,xx,yy)&&!access(after,xx,yy))return false;
 }
 }
 if([TT.TRAP,TT.SNARE].includes(t))triggerPressureTile(x,y,null,'structure');
 if(obj.cart){beginStructureMotion105(obj.cart,obj.cart,obj,x,y);obj.cart.x=x;obj.cart.y=y;}else{
  const carriedBurn=terrainReactions105().burning[k(obj.x,obj.y)];const r=RuntimeTerrainOwner.mutate(obj.x,obj.y,oldBase,{source:'crate-push'});if(!r.ok)return false;releaseTerrainUnderlay58(obj.x,obj.y,oldBase);RuntimeTerrainOwner.mutate(x,y,TT.CRATE,{source:'crate-push'});
  const reactions=terrainReactions105(),burn=carriedBurn;if(burn){delete reactions.burning[k(obj.x,obj.y)];reactions.burning[k(x,y)]={...burn,x,y}}if(state.branchTerrain105?.props){const prop=state.branchTerrain105.props[k(obj.x,obj.y)];delete state.branchTerrain105.props[k(obj.x,obj.y)];if(prop)state.branchTerrain105.props[k(x,y)]=prop}touchElementTerrain105(obj.x,obj.y);touchElementTerrain105(x,y);beginStructureMotion105(k(obj.x,obj.y),k(x,y),obj,x,y);
 }
 if(![TT.TRAP,TT.SNARE].includes(t))triggerPressureTile(x,y,null,'structure');alertNearby(x,y,4,'impact');VisibilityService.compute();return true;
}





















function movePlatform57(platform,dx,dy){
  if(!state||!platform||(!dx&&!dy))return{ok:false,reason:'inactive'};
  const oldCells=entityFootprintCells57(platform),newCells=entityFootprintCells57(platform,platform.x+dx,platform.y+dy),oldKeys=new Set(oldCells.map(q=>k(q.x,q.y))),newKeys=new Set(newCells.map(q=>k(q.x,q.y)));
  const riders=OccupancyService.occupants(oldCells),riderSet=new Set(riders),tiles=new Map();
  for(const q of oldCells){if(state.map[q.y]?.[q.x]!==TT.RAFT)return{ok:false,reason:'missing-platform'};tiles.set(k(q.x,q.y),TT.WATER)}
  for(const q of newCells){const tile=state.map[q.y]?.[q.x];if(q.x<1||q.y<1||q.x>=COLS-1||q.y>=ROWS-1||(!oldKeys.has(k(q.x,q.y))&&tile!==TT.WATER))return{ok:false,reason:'destination-terrain'};tiles.set(k(q.x,q.y),TT.RAFT)}
  for(const entity of OccupancyService.occupants(newCells))if(!riderSet.has(entity))return{ok:false,reason:'destination-occupied'};
  for(const entity of riders){
    if(state.items.includes(entity)){for(const q of entityFootprintCells57(entity,entity.x+dx,entity.y+dy)){const tile=tiles.get(k(q.x,q.y))??state.map[q.y]?.[q.x];if(tile==null||dangerousLootTerrain42(tile)||tileBlocks(tile))return{ok:false,reason:'item-destination'}}}
    else if(!PlacementService.canPlaceEntity(entity,entity.x+dx,entity.y+dy,{ignore:riderSet,tiles}))return{ok:false,reason:'rider-destination'};
  }
  // Geometry and every rider are validated before the first write. No callbacks run mid-transfer.
  state.terrainMutationVersion57=state.terrainMutationVersion57||{};
  for(const [key,tile]of tiles){const [x,y]=key.split(',').map(Number);setTerrainTile58(state.map,x,y,tile);state.terrainMutationSeq57=(state.terrainMutationSeq57||0)+1;state.terrainMutationVersion57[key]=state.terrainMutationSeq57}
  platform.x+=dx;platform.y+=dy;
  for(const entity of riders){if(state.items.includes(entity))PlacementService.moveItem(entity,entity.x+dx,entity.y+dy);else OccupancyService.move(entity,entity.x+dx,entity.y+dy)}
  for(const entity of riders)if(!state.items.includes(entity))globalThis.__MANRU_HAZARD_CORE__?.standing?.(entity,'platform');
  if(riderSet.has(state.player)){resolvePlayerLanding57(state.player.x,state.player.y,{cause:'platform',hazard:false,resetVisual:true});addLog(state.branchContext105?.id==='palace'?'뗏목이 용궁 수원 사이로 미끄러진다.':'뗏목이 향수강을 따라 미끄러진다.')}
  return{ok:true,riders:riders.length,oldCells,newCells}
}


function resolveOccupancyInteraction57(actor,target){
  if(!occupancySwapAllowed57(actor,target))return false;
  const ax=actor.x,ay=actor.y,tx=target.x,ty=target.y;
  OccupancyService.move(target,ax,ay);resolvePlayerLanding57(tx,ty,{cause:'ally-swap'});globalThis.__MANRU_HAZARD_CORE__?.standing?.(target,'ally-swap');return true
}








function combatStatusIconHtml57(row){
 if(!row.glyph)return '';let path='';for(let y=0;y<row.glyph.length;y++)for(let x=0;x<row.glyph[y].length;x++)if(row.glyph[y][x]==='1')path+=`M${x} ${y}h1v1h-1z`;
 return `<svg class="combatStatusIcon57" data-status-icon="${row.key}" aria-hidden="true" viewBox="0 0 7 7" shape-rendering="crispEdges"><path fill="currentColor" d="${path}"/></svg>`;
}









/* R58 canonical semantic policies: one owner for tool-breakable furniture and one turn-owned jar gas field. */
const TOOL_BREAKABLE_KEYS57=Object.freeze(['TABLE','SCREEN','JAR','CRATE','BENCH','RACK','LOW_FENCE','FLOWERBED']);

const TERRAIN_SURFACE_KEYS58=Object.freeze(['SHALLOW_WATER','PALACE_LOW','PALACE_MID','PALACE_UPPER','PALACE_HIGH','ICE','FLOOR','GRASS','LIGHT_GRASS','WOOD_FLOOR','MOON_STONE','DARK_WOOD','GILDED_FLOOR','STONE_PATH','CARPET']);
const TERRAIN_OVERLAY_KEYS58=Object.freeze(['PALACE_WALL_LAMP','TABLE','SCREEN','JAR','CRATE','BENCH','RACK','LOW_FENCE','FLOWERBED','STONE_PILLAR','LANTERN_POST','WALL_BANNER','WINDOW','ROCK','STATUE','PAPER_CRANE','LOTUS_FLOWER','INCENSE_STAND','IRON_HOOK','GOLD_LAMP','PETAL_MAT','GARDEN_TREE','PEACH_TREE','RUMOR_BED','RUMOR_MED_CABINET','RUMOR_GAS_PIPE','RUMOR_FLOOD_GRATE','RUMOR_ARCHIVE_PILE','RUMOR_WEAPON_RACK','RUMOR_SILK_DIVAN','RUMOR_RITUAL_OBELISK','RUMOR_CHARRED_COUNTER','RUMOR_INVESTIGATION_BOARD','RUMOR_SMUGGLER_BUNDLE','RUMOR_GREENHOUSE_FRAME','BED','BOOK_STACK']);
const TERRAIN_WALL_OVERLAY_KEYS58=Object.freeze(['WALL_BANNER','WINDOW','PALACE_WALL_LAMP']);
let TERRAIN_LAYER_CACHE58=null;
function terrainLayerCatalog58(){
  if(TERRAIN_LAYER_CACHE58)return TERRAIN_LAYER_CACHE58;
  const values=keys=>new Set(keys.map(name=>TT[name]).filter(Number.isFinite));
  TERRAIN_LAYER_CACHE58={surfaces:values(TERRAIN_SURFACE_KEYS58),overlays:values(TERRAIN_OVERLAY_KEYS58),wallOverlays:values(TERRAIN_WALL_OVERLAY_KEYS58)};return TERRAIN_LAYER_CACHE58
}
// Tile writes own the exact substrate at placement time, including writes on a map
// being assembled before it is installed in state. No generation snapshots infer it.
const TERRAIN_MAP_LAYERS58=new WeakMap();
function terrainMapLayers58(map){
  if(map===state?.map){
    if(!state.terrainUnderlay58||typeof state.terrainUnderlay58!=='object')state.terrainUnderlay58={};
    if(!state.terrainAttachment58||typeof state.terrainAttachment58!=='object')state.terrainAttachment58={};
    const pending=TERRAIN_MAP_LAYERS58.get(map);
    if(pending&&pending.underlay===state.terrainUnderlay58&&pending.attachment===state.terrainAttachment58)return pending;
    if(pending?.pending){state.terrainUnderlay58=pending.underlay;state.terrainAttachment58=pending.attachment}
    const layers={underlay:state.terrainUnderlay58,attachment:state.terrainAttachment58};TERRAIN_MAP_LAYERS58.set(map,layers);return layers;
  }
  let layers=TERRAIN_MAP_LAYERS58.get(map);if(!layers){layers={underlay:{},attachment:{},pending:true};TERRAIN_MAP_LAYERS58.set(map,layers)}return layers;
}

function terrainCellPlacement58(map,x,y){const layers=terrainMapLayers58(map),key=k(x,y);return{base:layers.underlay[key]??map[y][x],attachment:layers.attachment[key]}}
function terrainSurface58(tile){return terrainLayerCatalog58().surfaces.has(tile)||(Number.isInteger(tile)&&tile>=500&&tile<660&&[0,1,2,3,7].includes((tile-500)%16))}
function setTerrainTile58(map,x,y,tile,placement={}){
  const old=map[y][x];if(map===state?.map&&[TT.DOOR,TT.OPEN_DOOR].includes(old)&&[TT.DOOR,TT.OPEN_DOOR].includes(tile)&&state.terrainReactions105?.burning?.[k(x,y)])state.terrainReactions105.burning[k(x,y)].tile=tile;if(map===state?.map&&state.generationInProgress57&&inTutorialEntry(x,y))return old;if(!Number.isInteger(tile))throw new Error('invalid terrain tile');
  const cat=terrainLayerCatalog58(),layers=terrainMapLayers58(map),key=k(x,y);
  if(cat.overlays.has(tile)){
    const base=placement.base??(cat.overlays.has(old)?layers.underlay[key]:old);
    if(tile===TT.WALL_BANNER&&base!==TT.WALL)return old;
    const attachment=tile===TT.WALL_BANNER?'wall':placement.attachment||(cat.wallOverlays.has(tile)&&base===TT.WALL?'wall':'standing');
    if(attachment==='wall'&&!cat.wallOverlays.has(tile))throw new Error('invalid wall attachment');
    if(attachment==='secret-wall'&&![TT.SCREEN,TT.RACK,TT.WINDOW].includes(tile))throw new Error('invalid concealed entrance');
    if(attachment==='wall'||attachment==='secret-wall'){
      if(base!==TT.WALL)throw new Error('wall attachment requires wall');
    }else if(!terrainSurface58(base)&&!(placement.fluidSurface&&base===TT.WATER)){
      // A floor prop cannot implicitly excavate a wall/hazard. Its producer must
      // first carve an explicit surface. Rejected decorations leave topology intact.
      return old;
    }
    layers.underlay[key]=base;layers.attachment[key]=attachment;
  }else{delete layers.underlay[key];delete layers.attachment[key]}
  if(map===state?.map&&old!==tile&&state.terrainReactions105){const r=state.terrainReactions105,key=k(x,y);if(!([TT.DOOR,TT.OPEN_DOOR].includes(old)&&[TT.DOOR,TT.OPEN_DOOR].includes(tile)))delete r.burning[key];if(!lightAt(x,y)&&!elementMaterial105(tile,'light'))delete r.unlit[key];if(r.char)delete r.char[key];r.revision=(r.revision||0)+1}map[y][x]=tile;if(old!==tile)TERRAIN_RENDER_REV.set(map,(TERRAIN_RENDER_REV.get(map)||0)+1);branchInvalidateTerrain(map,x,y);if(map===state?.map&&!state.generationInProgress57&&old===TT.DOOR&&tile===TT.OPEN_DOOR)branchWarningDoor(x,y);if(map===state?.map&&noiseBudget)noiseBudget.fields.clear();return tile;
}
// Surface changes use the same terrain owner as prop placement, including authored-area protection.
function setTerrainSurface65(map,x,y,surface){
 if(!terrainSurface58(surface)&&surface!==TT.WATER)throw new Error('invalid terrain surface');
 const top=map[y][x],layers=terrainMapLayers58(map),key=k(x,y);
 return setTerrainTile58(map,x,y,terrainLayerCatalog58().overlays.has(top)?top:surface,{base:surface,attachment:layers.attachment[key],fluidSurface:surface===TT.WATER});
}
function terrainUnderlayState58(){return state?.map?terrainMapLayers58(state.map).underlay:null}
function terrainUnderlayAt58(x,y){const v=terrainUnderlayState58()?.[k(x,y)];return Number.isInteger(v)?v:null}
function inferTerrainUnderlay58(x,y,tile=state?.map?.[y]?.[x]){
  // Recovery only: old saves never recorded the intermediate floor exactly.
  const rumor=(state?.rumorSpaces1030||[]).find(r=>r.rect&&x>=r.rect.x1&&x<=r.rect.x2&&y>=r.rect.y1&&y<=r.rect.y2);
  if(rumor&&terrainSurface58(rumor.floorTile))return rumor.floorTile;
  if(tile===TT.PEACH_TREE)return TT.GRASS;
  const counts=new Map();for(const[dx,dy]of DIRS8){const t=state?.map?.[y+dy]?.[x+dx];if(terrainSurface58(t))counts.set(t,(counts.get(t)||0)+1)}
  let best=TT.FLOOR,n=-1;for(const[t,c]of counts)if(c>n){best=t;n=c}return best;
}
function rememberTerrainUnderlay58(x,y,base){
  if(!state||!terrainSurface58(base))return false;const layers=terrainMapLayers58(state.map);layers.underlay[k(x,y)]=base;layers.attachment[k(x,y)]='standing';return true;
}
function releaseTerrainUnderlay58(x,y,fallback=TT.FLOOR){
  const layers=terrainMapLayers58(state.map),key=k(x,y),exact=layers.underlay[key];
  const base=terrainSurface58(exact)?exact:terrainSurface58(fallback)?fallback:inferTerrainUnderlay58(x,y);
  delete layers.underlay[key];delete layers.attachment[key];return base;
}




function isToolBreakableTerrain57(tile){return TOOL_BREAKABLE_KEYS57.some(name=>Number.isFinite(TT[name])&&tile===TT[name])}
function furnitureFloor57(x,y){return terrainUnderlayAt58(x,y)??inferTerrainUnderlay58(x,y)}

function jarGasState57(){return state?state.jarGasFields57:[]}





function jarGasConcentrationMap57(status='poison',target=null){
  const out=new Map();for(const f of jarGasState57())if((f.status57||'poison')===status&&(!target||!f.sourceFaction||effectCanAffect57(f,target)))for(const c of f.cells||[])if(c.c>0){const kk=jarGasCellKey57(c.x,c.y),v=out.get(kk)||0;if(c.c>v)out.set(kk,c.c)}return out
}


















function canMoveGroundItem57(it,x,y){
  if(!state||!it||x<0||y<0||x>=COLS||y>=ROWS)return false;
  const t=state.map?.[y]?.[x];
  if(tileBlocks(t)||dangerousLootTerrain42(t)||t===TT.DOOR||t===TT.STAIR||t===TT.KEY_TILE||t===TT.PORTAL)return false;
  if((state.monsters||[]).some(m=>m.hp>0&&monCovers(m,x,y)))return false;
  if((state.items||[]).some(other=>other!==it&&other.x===x&&other.y===y))return false;
  return true;
}
function moveGroundItemStep57(it,toward){
  if(!state||!it||!toward)return false;
  const before=Math.abs(toward.x-it.x)+Math.abs(toward.y-it.y),candidates=[];
  for(const[dx,dy]of DIRS4){const x=it.x+dx,y=it.y+dy,d=Math.abs(toward.x-x)+Math.abs(toward.y-y);if(d>=before||!canMoveGroundItem57(it,x,y))continue;candidates.push({x,y,d,axis:Math.abs(toward.x-it.x)>=Math.abs(toward.y-it.y)?(dx?0:1):(dy?0:1)})}
  candidates.sort((a,b)=>a.d-b.d||a.axis-b.axis||a.y-b.y||a.x-b.x);const q=candidates[0];if(!q)return false;return PlacementService.moveItem(it,q.x,q.y);
}


function cancelAutoWalk(){return Auto81.stop('manual',true)}








function compactHudName58(value,max=10){const raw=String(value||'').trim();if(!raw)return'';if([...raw].length<=max)return raw;const parts=raw.split(/[·/()]/).map(v=>v.trim()).filter(Boolean),fit=parts.findLast?.(v=>[...v].length<=max)||parts.find(v=>[...v].length<=max);return fit||[...raw].slice(0,max).join('')}

function hudLocation58(){
 if(!state)return{kind:'none',floor:'--',tag:'',desktop:'',full:''};
 const branch=state.branchContext105;if(branch){const portal=state.branchPortals105?.find(p=>p.x===state.player.x&&p.y===state.player.y);const d=BRANCH_DEFS105[branch.id],room=branch.id==='citadel'?state.branchTerrain105?.citadel105?.rooms?.find(r=>state.player.x>=r.x&&state.player.x<r.x+r.w&&state.player.y>=r.y&&state.player.y<r.y+r.h):null;return{kind:'branch',challenge:branch.id==='citadel'&&state.branchWorld105?.citadel105?.trial105?.status==='active'?`미궁 ${Math.max(0,state.branchWorld105.citadel105.trial105.deadline-state.turn)}턴 · 걸쇠 ${state.branchWorld105.citadel105.trial105.seals.length}/3`:'',floor:branch.level+'/'+(branch.legacyCount105||d.count),tag:d.name,desktop:d.name+' '+branch.level+'층 / '+(branch.legacyCount105||d.count),full:(portal?portal.label:room?d.name+' '+branch.level+'층 · '+room.name:state.layoutName)+(branch.id==='citadel'&&state.branchWorld105?.citadel105?.trial105?.status==='active'?` · 미궁 ${Math.max(0,state.branchWorld105.citadel105.trial105.deadline-state.turn)}턴 · 걸쇠 ${state.branchWorld105.citadel105.trial105.seals.length}/3`:'')}}
 const shop=state.shopIntermission;if(shop?.active){const tag=SHOP_RULES58[shop.theme].room;return{kind:'shop',floor:'상점',tag,desktop:`상점 · ${tag}`,full:tag}}
 const artifact=state.artifactDungeon46;if(artifact){const full=artifact.name||state.layoutName||'전설 던전',tag=artifact.hudName||compactHudName58(full);return{kind:'artifact',floor:'전설',tag,desktop:`전설 · ${tag}`,full}}
 return{kind:'normal',floor:String(state.floor).padStart(2,'0'),tag:'',desktop:`제 ${String(state.floor).padStart(2,'0')}층 / 25`,full:state.layoutName||regionFor(state.floor)[2]};
}



function addLog(msg){const raw=String(msg??'');if(state){for(const p of POTION_LIST)if(raw.startsWith(p.name+':')&&effectLog56(raw)&&!isPotionKnownByPlayer(p))identifyPotion(p.potionKind,'사용 효과 관찰')}return logWithCategory(sanitize56(raw))}


function withJosa57(value,pair='이/가'){
  const word=String(value??''),parts=String(pair).split('/'),withBatchim=parts[0]||'',withoutBatchim=parts[1]??withBatchim,last=word.at(-1)||'',code=last.charCodeAt(0);
  if(code>=0xAC00&&code<=0xD7A3)return word+(((code-0xAC00)%28)?withBatchim:withoutBatchim);
  return word+withoutBatchim;
}



































function makeBoss(def,pos){return{x:pos.x,y:pos.y,name:def.name,hp:def.hp,maxHp:def.hp,atk:def.atk,def:def.def,eva:def.eva,xp:def.xp,color:def.color,shape:def.shape,kind:def.kind,boss:true,bossPattern:def.bossPattern,ranged:def.ranged||false,range:def.range||6,weakened:0}}




function createRunState57(cls){return {floor:1,turn:0,lastDamageAgencyTurn57:0,passiveRecoveryUnlocked57:false,playerAgencyTurns57:0,floorTurn:0,alert:0,map:[],rooms:[],items:[],monsters:[],decals:[],switches:[],rafts:[],routeTags:[],stairs:{x:0,y:0},seen:new Set(),visible:new Set(),uniqueKilled:{},log:[],dead:false,victory:false,runState57:'playing',bossDefeated:false,layoutName:'',specialFloor:false,visionPenalty:0,fixedStart:null,fixedExit:null,floorKeys:0,floorKeysRequired:0,cipher:null,harvested:{},enemyEnergy:0,makgeolliHealHundredths57:0,status:{haste:0,weaken:0,evade:0,markCrit:0,poison:0,bleed:0,ward:0,stun:0,stealth:0,regen:0,upset:0,drunk:0,blind:0,skillSeal:0},player:{classId:cls.id,name:cls.name,gender:cls.gender||'male',color:cls.color,x:2,y:2,level:1,xp:0,nextXp:xpRequirementForLevel57(2),baseMaxHpPermanent:cls.hp,temporaryMaxHpBonus:0,martialRules1005:1,maxHp:cls.hp,hp:cls.hp,maxFocus:cls.focus,focus:cls.focus,baseAtk:cls.atk,bloodAltarGains105:0,baseDef:cls.def,baseEva:cls.eva,baseWill:cls.will,baseVision:cls.vision,weapon:null,armor:{...ARMORS[0],type:'armor'},cloak:null,relic:null,trinket:null,inventory:[],kills:0,hunger:100,skillPoints:1,blinkLevel:0,facing:{x:0,y:1},martial:{strong:0,roar:0,ghost:0,brawl:0,constitution:0},strongReady:0,nextAttackAt:0,busyUntil:0}}}
function newGameCoreLifecycle(cls){state=createRunState57(cls);citadelEnsurePlan();GameState.initialize(state);globalThis.__MANRU_CONSUMABLE56_ACTIONS__.initializeKnowledge();normalizeClassState58(state.player,0);const sw=WEAPONS.find(w=>w.name===cls.startWeapon);if(sw)state.player.weapon={...clone(sw),type:'weapon',identified:true,curseImmune991:true};for(const [name,count] of (cls.startItems||[])){const src=itemPrototype(name);if(!src)continue;const it=clone(src);it.count=count||1;if(['weapon','armor','cloak','relic','trinket'].includes(it.type)){it.identified=true;it.curseImmune991=true}addInventoryItem(it)}identifyStartingItems58();state.player.armor.identified=true;state.player.armor.curseImmune991=true;clearHeldInput53();globalThis.storyInitNewRun992?.();NormalFloorGenerator.generate();resetVisualState();resetTurnState();startFloorTransition();addLog('정부 특별조사 임무: 허가도면과 현장 객실 수가 일치하지 않는 대규모 무허가 증축 의심 건을 확인한다.');addLog('선행 파견된 고위 조사관이 연락 두절됐다. 현장 조사와 생존 여부 확인을 병행한다.');addLog('특수층은 방 자체가 기믹이다. 지형을 읽고 무술과 장비를 써라.');addLog('턴제 규칙: 당신이 행동할 때만 만루도 움직인다.');projectRunningScreen();updateAll()}


const BLOCKING_TILES57=new Set([TT.WALL,TT.WATER,TT.LAVA,TT.VOID,TT.MERCURY,TT.DRAWBRIDGE_UP,TT.BAMBOO,TT.TABLE,TT.SCREEN,TT.HEDGE,TT.FAKE_DOOR,TT.LOCKED_GATE,TT.SECRET_DOOR,TT.PEACH_TREE]);
const SIGHT_BLOCKING_TILES57=new Set([TT.WALL,TT.DOOR,TT.BAMBOO,TT.SCREEN,TT.HEDGE,TT.FAKE_DOOR,TT.LOCKED_GATE,TT.SECRET_DOOR]);
const FLYING_BLOCKING_TILES57=new Set([TT.WALL,TT.LOCKED_GATE,TT.SECRET_DOOR]);
const AQUATIC_STAND_TILES57=new Set([TT.SHALLOW_WATER,TT.ICE,TT.PAPER_BRIDGE,TT.DRAWBRIDGE_DOWN,TT.RAFT]);



function tileBlocksSight(t){if(SIGHT85.has(t)||t===TT.HIDDEN_WALL)return true;if(t===TT.PALACE_ROCK||t===TT.PALACE_WALL_LAMP)return true;if(t>=500&&t<660)return t!==undefined&&[4,5,6,8].includes((t-500)%16);return SIGHT_BLOCKING_TILES57.has(t)}


function monCovers(mon,x,y){return footprintOffsets(mon).some(([ox,oy])=>mon.x+ox===x&&mon.y+oy===y)}
function entityFootprintCells57(entity,x=entity?.x,y=entity?.y){if(!entity||!Number.isFinite(x)||!Number.isFinite(y))return[];const offsets=entity===state?.player?FOOTPRINT_OFFSETS57.one:footprintOffsets(entity);return offsets.map(([ox,oy])=>({x:x+ox,y:y+oy}))}





const VisibilityService=Object.freeze({
isVisible(x,y){return state.visible.has(k(x,y))},
isSeen(x,y){return state.seen.has(k(x,y))},
lineClear(x0,y0,x1,y1){return combatLineCheckR8(x0,y0,x1,y1,{units:false}).ok},
reset(){if(!state)return false;state.visible=new Set();state.seen=new Set();return true},
rememberKey(key){if(!state||mineHidden(...key.split(',').map(Number)))return false;state.seen.add(key);return true},
remember(x,y){return VisibilityService.rememberKey(k(x,y))},
addVisibleKey(key){if(!state)return false;state.visible.add(key);return true},
revealAll(){if(!state)return false;state.seen=new Set();state.visible=new Set();for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){state.seen.add(k(x,y));state.visible.add(k(x,y))}return true},
compute(){
  if(state?.debugBattle57)return VisibilityService.revealAll();
  state.visible=new Set();
  const p=state.player,nightmare=globalThis.__MANRU_ITEM_IDENTITY991__?.cursePower?.('nightmare')||0,vision=Math.max(nightmare>0?1:3,getStats().vision-(state.visionPenalty||0));
  const inVision=(x,y)=>Math.hypot(x-p.x,y-p.y)<=vision+.35;
  for(let y=Math.max(0,p.y-vision);y<=Math.min(ROWS-1,p.y+vision);y++)for(let x=Math.max(0,p.x-vision);x<=Math.min(COLS-1,p.x+vision);x++){
    if(inVision(x,y)&&VisibilityService.lineClear(p.x,p.y,x,y)){VisibilityService.addVisibleKey(k(x,y));if(!state.generationInProgress57)VisibilityService.rememberKey(k(x,y))}
  }
  // Boundary walls belong to the currently visible room/corridor even when the ray terminates on the adjacent floor.
  // Reveal only the first opaque skin next to an actually visible non-opaque cell; never leak rooms behind walls.
  const edge=[];
  for(let y=Math.max(0,p.y-vision-1);y<=Math.min(ROWS-1,p.y+vision+1);y++)for(let x=Math.max(0,p.x-vision-1);x<=Math.min(COLS-1,p.x+vision+1);x++){
    if(!inVision(x,y)||!tileBlocksSight(state.map[y]?.[x])||state.visible.has(k(x,y)))continue;
    if(DIRS8.some(([dx,dy])=>{const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=COLS||ny>=ROWS)return false;return state.visible.has(k(nx,ny))&&!tileBlocksSight(state.map[ny][nx])}))edge.push([x,y]);
  }
  for(const[x,y]of edge){VisibilityService.addVisibleKey(k(x,y));if(!state.generationInProgress57)VisibilityService.rememberKey(k(x,y))}
  mineVisibility();
  recordPlayerSight105();
}
});

// Movement, sight and combat all permit corner diagonals. The shared symmetric LOS
// still blocks walls crossed between cells, including knight-move offsets.













function adjacentBranchPortal105(){
  if(!state?.player)return null;const p=state.player,near=(state.branchPortals105||[]).filter(q=>Math.max(Math.abs(q.x-p.x),Math.abs(q.y-p.y))<=1&&state.map[q.y]?.[q.x]===TT.PORTAL);
  return near.find(q=>q.x===p.x&&q.y===p.y)||near.find(q=>q.x===p.x+(p.facing?.x||0)&&q.y===p.y+(p.facing?.y||0))||near[0]||null;
}

ActionDispatcher.register('CONTEXT_ACTION',contextAction);



function setGenerationBase(id,fn){if(typeof fn!=='function')throw new TypeError('generation base must be a function');MANRU_GENERATION_PIPELINE.base={id,fn};return fn}



setGenerationBase('base-original',generateFloorOriginal);


function tierForFloor(floor=state.floor){if(floor>=24)return globalThis.__MANRU_RANDOM57__()<.42?5:4;if(floor>=21)return globalThis.__MANRU_RANDOM57__()<.38?4:3;if(floor>=16)return globalThis.__MANRU_RANDOM57__()<.40?4:3;if(floor>=11)return globalThis.__MANRU_RANDOM57__()<.55?3:2;if(floor>=6)return globalThis.__MANRU_RANDOM57__()<.48?2:1;return 1}




function dropRandomItem(pos,special=false){if(state?.branchContext105?.id==='granary'){const roll=globalThis.__MANRU_RANDOM57__();let item;if(roll<.30)item=naturalFoodPick();else if(roll<.78)item=clone(choice((window.MANRU_POTIONS||[]).filter(p=>(p.minFloor||1)<=state.floor&&!p.craftedOnly57)));else if(roll<.90)item=makeAmmo(weightedAmmo(),false);if(item){PlacementService.placeItem(item,pos);return item}}if(state&&pos){const chance=special ? .20 : .13;if(globalThis.__MANRU_RANDOM57__()<chance){const item=makeAmmo(weightedAmmo(),false);item.x=pos.x;item.y=pos.y;PlacementService.placeItem(item);return item}}return dropLootWithNaturalFood(pos,special)}

function dropLootWithTalismans(pos,special=false){if(mountainOutdoor(pos)){if(globalThis.__MANRU_RANDOM57__()<.10){const item=clone(MOUNTAIN_BERRY);PlacementService.placeItem(item,pos);return item}return null}if(state&&globalThis.__MANRU_RANDOM57__()<(special?.34:.20)){const t=talismanPick56();if(t){PlacementService.placeItem({...t,x:pos.x,y:pos.y,count:1});return}}const n=state?.items?.length||0,r=dropFloorLoot(pos,special);for(const i of(state?.items||[]).slice(n))decoratePotion56(i,i.x,i.y);return r}

function hungerMods(){return{atk:0,eva:0}}

function brawlUpgradeEffect42(it){return isBrawlWeapon(it)?Math.floor((it.upgrade||0)/3):(it?.upgrade||0)}




function armorUpgradeGain42(base,level=0){const u=Math.max(0,Math.floor(+level||0));let gain=0;for(let n=1;n<=u;n++)gain+=armorUpgradeStepGain42(base,n);return gain}




function dungeonVisionScale50(){return ({curse_blade:.65,curse_spear:.75,mirror_blade:.85})[state?.artifactDungeon46?.id]||1}










function cipherResult(secret,guess){return guess.map((v,i)=>v===secret[i]?'O':secret.includes(v)?'P':'X')}

function editCipherGuess8(digit){if(runState57()!=='playing'||!cipherOpen||!state?.cipher)return false;const c=state.cipher;if(digit===null)c.guess=[];else{if(!Number.isInteger(digit)||digit<1||digit>5||c.guess.length>=5)return false;c.guess.push(digit)}renderCipherPanel();return true}

function submitCipher(){const act=playerAction57('cipher',{allowCipher:true,stunMessage:'몸이 굳어 암호 장치를 조작하지 못했다.'});if(!act.ok)return !!act.consumed;const c=state.cipher;if(!c||c.guess.length!==5){toast('다섯 자리를 모두 입력해야 한다.');return false}const result=cipherResult(c.secret,c.guess);c.history.push({guess:[...c.guess],result});const solved=result.every(v=>v==='O');c.guess=[];if(solved){c.solved=true;const sw=state.switches.find(v=>v.kind==='cipher');if(sw){sw.used=true;for(const t of sw.targets)if(state.map[t.y][t.x]===TT.DRAWBRIDGE_UP)setTerrainTile58(state.map,t.x,t.y,TT.DRAWBRIDGE_DOWN)}addLog('O O O O O — 자물쇠가 풀렸다. 도개교가 내려온다.');impact(sw?.x??15,sw?.y??Math.floor(ROWS/2),'#e0b266',5);closeCipher()}else{addLog(`암호 실패: ${result.join(' ')}. 성채가 침입자를 감지했다.`);if(globalThis.__MANRU_RANDOM57__()<.40)spawnNamed(globalThis.__MANRU_RANDOM57__()<.5?'경비 인형 - 보병':'성채 비행 감시자',null,{provenance:'repeatable-reinforcement'});renderCipherPanel()}commitPlayerAction57(act,1);return true}
ActionDispatcher.register('CIPHER_SUBMIT',submitCipher);
function triggerSwitch(x,y){
  const sw=state.switches?.find(v=>v.x===x&&v.y===y);if(!sw)return false;
  if(sw.kind==='cipher'){openCipher();return true}
  if(sw.kind==='f23-center'||sw.kind==='f23-reveal'||sw.kind==='branch-reveal'){const r=globalThis.__MANRU_SPECIAL_FLOORS60__?.activateSwitch?.(sw);if(r?.handled)return true}
  if(sw.used)return false;sw.used=true;for(const t of sw.targets||[])if(state.map[t.y][t.x]===TT.DRAWBRIDGE_UP)setTerrainTile58(state.map,t.x,t.y,TT.DRAWBRIDGE_DOWN);addLog('도개교가 거친 소리를 내며 내려왔다.');impact(x,y,'#d6a85f',3);return true
}

function routeTagAt(x,y){return(state.routeTags||[]).find(v=>v.x===x&&v.y===y)}
function legacyKeyLabel(){return state?.floor===6?'봉인 고문서고 열쇠':state?.floor===18?'철판창고 열쇠':'구역 열쇠'}

function bumpBlockedTile(x,y,actionCtx=null){if(x<0||y<0||x>=COLS||y>=ROWS)return false;const act=actionCtx||playerAction57('interact',{stunMessage:'몸이 굳어 상호작용하지 못했다.'});if(!act.ok)return !!act.consumed;const t=state.map[y][x];if(t===TT.JAR){state._manualTerrainTargetR8={type:'jar',x,y};return ActionDispatcher.dispatch({type:'ATTACK',args:[]}).value}const branch=state.branchPortals105?.find(p=>p.x===x&&p.y===y);if(branch){toast('문 옆에서 상호작용 버튼(F)으로 출입할 수 있다.');return false}if(t===TT.BED&&branchBedData()){const bed=dojoAdjacentBed();if(bed?.x===x&&bed?.y===y)return dojoUseBed(bed,act);return true;}const rumorEntrance=globalThis.__MANRU_RUMOR_SPACES1030__?.openEntranceAt?.(x,y,t,act);if(rumorEntrance?.handled)return rumorEntrance.result;const silent=[TT.STONE_PILLAR,TT.LANTERN_POST,TT.WALL_BANNER,TT.CRATE,TT.BENCH,TT.FLOWERBED,TT.ROCK,TT.STATUE,TT.RACK,TT.LOW_FENCE,TT.WINDOW];if(silent.includes(t))return true;if(t===TT.HIDDEN_BRIDGE||t===TT.HIDDEN_WALL){if(globalThis.__MANRU_HIDDEN60_ACTIONS__?.revealAt?.(x,y)){commitPlayerAction57(act,1);return true}}const noisy=[TT.TABLE,TT.SCREEN,TT.HEDGE,TT.BAMBOO,TT.FAKE_DOOR,TT.SECRET_DOOR].includes(t);if(noisy)alertNearby(x,y,7);if(t===TT.HEDGE){setTerrainTile58(state.map,x,y,state.floor===24?TT.LIGHT_GRASS:TT.GRASS);burst(x,y,'#8ab36b',10,.55);addLog('울타리를 베어 통로를 냈다. 주변 적이 소리를 들었다.');commitPlayerAction57(act,1);return true}if(t===TT.BAMBOO){setTerrainTile58(state.map,x,y,TT.FLOOR);burst(x,y,'#7caf60',10,.55);addLog('대나무를 베어 샛길을 냈다. 주변 적이 소리를 들었다.');commitPlayerAction57(act,1);return true}if(t===TT.LOCKED_GATE&&state?.keyPlan96&&globalThis.__MANRU_TYPED_KEYS__?.tryOpenAt){const rr=globalThis.__MANRU_TYPED_KEYS__.tryOpenAt(x,y);if(rr?.handled)return true}if(t===TT.TABLE||t===TT.SCREEN){setTerrainTile58(state.map,x,y,releaseTerrainUnderlay58(x,y,furnitureFloor57(x,y)));impact(x,y,t===TT.SCREEN?'#c76858':'#9a704b',3);burst(x,y,'#b48b65',12,.9);addLog(t===TT.SCREEN?'비단 병풍을 베어 통로를 냈다.':'탁자를 부숴 길을 냈다.');if(t===TT.TABLE&&globalThis.__MANRU_RANDOM57__()<.12)dropRandomItem({x,y},false);commitPlayerAction57(act,1);return true}if(t===TT.FAKE_DOOR){setTerrainTile58(state.map,x,y,TT.WALL);doorFX(x,y);addLog('문을 밀었지만 뒤에는 차가운 벽뿐이다. 가짜 문이었다.');commitPlayerAction57(act,1);return true}if(t===TT.SECRET_DOOR){setTerrainTile58(state.map,x,y,TT.OPEN_DOOR);doorFX(x,y);burst(x,y,'#d8bd77',12,.7);addLog('벽 문양이 갈라지며 숨은 문이 열렸다.');commitPlayerAction57(act,1);return true}if(t===TT.LOCKED_GATE){if((state.floorKeys||0)>=(state.floorKeysRequired||0)){setTerrainTile58(state.map,x,y,TT.OPEN_DOOR);doorFX(x,y);addLog(state.floor===6?'봉인 고문서고 열쇠로 문을 열었다.':'모은 열쇠로 봉쇄문을 열었다.');commitPlayerAction57(act,1)}else toast(`열쇠 ${state.floorKeys||0}/${state.floorKeysRequired||0}. 창고를 더 뒤져야 한다.`);return true}if(t===TT.PEACH_TREE){setTerrainTile58(state.map,x,y,releaseTerrainUnderlay58(x,y,TT.GRASS));burst(x,y,'#e1a9a3',13,.7);giveFood('신선도',x,y);addLog('복숭아나무에서 신선도 한 알을 땄다.');commitPlayerAction57(act,1);return true}return false}
ActionDispatcher.register('STRUCTURE_INTERACT',bumpBlockedTile);
function portalLandingValid57(link,x,y){
  if(!state||!link||x<0||y<0||x>=COLS||y>=ROWS)return false;
  const room=state.portalRooms981?.[link.destRoom]||state.rooms?.[link.destRoom];
  if(room&&(x<room.x||y<room.y||x>=room.x+room.w||y>=room.y+room.h))return false;
  const t=state.map?.[y]?.[x];
  if(t===TT.PORTAL||dangerousLootTerrain42(t)||!playerTransferLandingSafe57(x,y))return false;
  return true;
}
function resolvePortalLanding57(link){
  if(!state||!link)return null;const preferred=link.destLand;
  if(preferred&&portalLandingValid57(link,preferred.x,preferred.y))return{x:preferred.x,y:preferred.y,preferred:true};
  const room=state.portalRooms981?.[link.destRoom]||state.rooms?.[link.destRoom];if(!room)return null;
  const source=(room.cells981?.length?room.cells981:null)||Array.from({length:Math.max(0,room.h-2)},(_,iy)=>Array.from({length:Math.max(0,room.w-2)},(_,ix)=>({x:room.x+1+ix,y:room.y+1+iy}))).flat();
  const px=preferred?.x??link.destPortal?.x??room.cx??room.x,py=preferred?.y??link.destPortal?.y??room.cy??room.y;
  return source.filter(q=>portalLandingValid57(link,q.x,q.y)).sort((a,b)=>Math.abs(a.x-px)+Math.abs(a.y-py)-Math.abs(b.x-px)-Math.abs(b.y-py)||Math.abs(a.x-(link.destPortal?.x??px))+Math.abs(a.y-(link.destPortal?.y??py))-Math.abs(b.x-(link.destPortal?.x??px))-Math.abs(b.y-(link.destPortal?.y??py))||a.y-b.y||a.x-b.x)[0]||null;
}

function bumpTileAction(x,y,opts={}){
  const tile=state?.map?.[y]?.[x],cause=opts.cause||'walk',active=opts.activeInteraction??cause==='walk';
  if(tile===TT.PORTAL&&!state.branchPortals105?.some(p=>p.x===x&&p.y===y))clearHeldInput53?.();
  // Canonical typed-key service owns all typed-key pickup. The service is installed by the lock system later in the same script; lookup happens at interaction time.
  if(tile===TT.KEY_TILE&&state?.keyPlan96&&globalThis.__MANRU_TYPED_KEYS__?.pickupAt){
    const rr=globalThis.__MANRU_TYPED_KEYS__.pickupAt(x,y);if(rr?.handled)return true;
  }
  // Fragile terrain and step-triggered hazards react to any physical landing cause.
  if(tile===TT.PAPER_BRIDGE||tile===TT.CRUMBLE)return globalThis.__MANRU_HAZARD_CORE__.armFragile(x,y,tile,{cause,activeInteraction:active});
  // Artifact sub-dungeon portals own their coordinates before the folded-room portal network.
  if(tile===TT.PORTAL&&WorldTransition57.portal(x,y,active,cause))return true;
  // Folded-room portal interaction. Its destination is a new landing with an explicit portal cause.
  if(tile===TT.PORTAL&&!state.branchPortals105?.some(p=>p.x===x&&p.y===y)){
    const portalKey=k(x,y),link=state.portalLinks981?.[portalKey];
    if(link){cancelAutoWalk?.();const landing=resolvePortalLanding57(link);if(!landing){addLog('접힌 문의 반대편 착지 공간이 막혀 이동하지 못했다.');toast('포탈 반대편에 안전한 착지점이 없다.');return true}burst(x,y,'#bf8fe8',14,.8);resolvePlayerLanding57(landing.x,landing.y,{cause:'portal',hazard:false});burst(state.player.x,state.player.y,'#8fd8e6',16,.9);VisibilityService.compute();addLog('접힌 문이 열리며 전혀 다른 내실로 이동했다.');state.discoveredPortals981=state.discoveredPortals981||{};const destPortalKey=k(link.destPortal.x,link.destPortal.y);state.discoveredPortals981[portalKey]=destPortalKey;return true;}
  }
  // Stations and deliberate containers remain walk-only interactions. Forced/teleport landing never opens a UI or loots a station for the player.
  if(active&&tile===TT.BRAZIER){openCooking('brazier');return true;}
  if(active&&tile===TT.COOKPOT){openCooking('pot');return true;}
  if(tile===TT.RUMOR){const record=state.branchTerrain105?.citadel105?.features105?.find(f=>f.x===x&&f.y===y&&f.theme==='archive');if(record&&state.branchContext105?.id==='citadel'){const district=CITADEL_TOWERS[record.tower105].district105,release=CITADEL_RELEASES.find(r=>CITADEL_TOWERS[r.tower].district105===district&&r.key!=='central-shortcut');addLog(release?`성채 기록: ${CITADEL_TOWERS[release.tower].name} ${release.level}층에서 ${release.targetLevel}층 ${release.label}의 걸쇠를 풀 수 있다.`:'성채 기록: 동쪽 상층 연결교를 따라 중앙탑 4층에 진입한 뒤 최하층으로 내려가라.');addLog('미궁 기록: 세 걸쇠의 순서는 자유다. 두 등불은 불로 켜고, 동쪽 바위는 옆 피난길에서 돌을 던져 풀어라. 내측 철창은 빠르지만 5턴 뒤 닫힌다.');}else rumorEvent();setTerrainTile58(state.map,x,y,TT.FLOOR);return true;}
  if(tile===TT.TRAP){trapEvent(x,y);return true;}
  if(active&&citadelAnvilAt(x,y))return anvilOpen({x,y});
  if(active&&tile===TT.ARMORY){armoryEvent(x,y);return true;}
  if(active&&tile===TT.FOUNTAIN){fountainEvent(x,y);return true;}
  if(tile===TT.MIRROR){mirrorEvent(x,y);return true;}
  if(active&&tile===TT.ALTAR){if(state.branchContext105?.id==='citadel'&&state.branchContext105.level===1){const d=state.branchTerrain105?.citadel105;if(x===d?.reward?.x&&y===d?.reward?.y)return citadelReward();if(x===d?.trial105?.start.x&&y===d?.trial105?.start.y){if(cause==='interact')return citadelTrialBegin();if(cause==='walk')toast('미궁 입구. 보급을 챙긴 뒤 상호작용으로 시험을 시작한다.');return false;}}altarEvent(x,y);return true;}
  if(active&&tile===TT.VAULT){vaultEvent(x,y);return true;}
  if(tile===TT.SNARE){snareEvent(x,y);return true;}
  if(active&&tile===TT.CACHE){cacheEvent(x,y);return true;}
  if(tile===TT.GOLD){applyHostileStatus('stun',1,1,{stagger:true,log:'황금 잔광이 발을 묶었다.'});return true;}
  if(active&&tile===TT.SWITCH){triggerSwitch(x,y);return true;}
  if(tile===TT.KEY_TILE){state.floorKeys=(state.floorKeys||0)+1;setTerrainTile58(state.map,x,y,TT.FLOOR);burst(x,y,'#d8bd79',10,.7);addLog(`${legacyKeyLabel()} ${state.floorKeys}/${state.floorKeysRequired}.`);return true;}
  if(tile===TT.STAMINA_PAD){state.player.focus=getStats().maxFocus;addLog('섬의 발판에서 기력이 완전히 회복됐다.');return true;}
  if(tile===TT.PAVILION){state.player.focus=Math.min(getStats().maxFocus,state.player.focus+1);return true;}
  return false;
}
const PLAYER_ENTRY_PICKUP_FIRST57=new Set([TT.BRAZIER,TT.COOKPOT,TT.ARMORY,TT.FOUNTAIN,TT.ALTAR,TT.VAULT,TT.CACHE,TT.JAR,TT.SWITCH].filter(v=>Number.isFinite(v)));
const PLAYER_TRANSFER_UNSAFE57=new Set([TT.DOOR,TT.TRAP,TT.SNARE,TT.LAVA,TT.WATER,TT.VOID,TT.MERCURY].filter(v=>Number.isFinite(v)));




function playerTransferPolicy57(cause){
  if(cause==='talisman-blink'||cause==='fusion-blink')return{seen:true,safe:true,authorized:true,excludeOrigin:true};
  if(cause==='holy-blink'||cause==='mirror-teleport'||cause==='boss-teleport')return{seen:false,safe:true,authorized:true,excludeOrigin:true};
  return null;
}


function markCombatBlink57(entity){if(entity&&state)entity.combatBlinkTurn57=state.turn;}

function resolvePlayerLanding57(x,y,opts={}){
  if(!state?.player||x<0||y<0||x>=COLS||y>=ROWS)return{ok:false,moved:false,reason:'bounds'};
  if(neutralInteractableAt58(x,y))return{ok:false,moved:false,reason:'neutral-occupant'};
  const p=state.player,origin=opts.origin||{x:p.x,y:p.y},cause=opts.cause||'walk',policy=playerTransferPolicy57(cause);
  if(policy){const validation=validatePlayerTransfer57(x,y,{cause,policy});if(!validation.ok)return{ok:false,moved:false,reason:validation.reason,cause,x:p.x,y:p.y}}
  const discovery=opts.discovery105||captureMovementDiscovery105();
  const tile=state.map?.[y]?.[x],haz=globalThis.__MANRU_HAZARD_CORE__,kind=opts.hazard===false?null:haz?.kind?.(tile);
  let hazardResult=null;
  if(kind)hazardResult=haz.resolve(p,tile,x,y,origin,{consumeTurn:false,forced:cause==='forced-push'||cause==='forced-pull',landingCause57:cause});
  else{OccupancyService.move(p,x,y)}
  if(['blink','talisman-blink','fusion-blink','holy-blink'].includes(cause)&&(p.x!==origin.x||p.y!==origin.y))markCombatBlink57(p);
  if(p.classState?.aimPower>0&&(p.x!==origin.x||p.y!==origin.y)){
    const agency=(state.playerAgencyTurns57||0)+(state._turnPipelineActive57?Number(!!state._turnAgencyWillCount57&&!state._turnAgencyCounted57):1);
    if(p.classState.aimMoveAgency!==agency){p.classState.aimMoveAgency=agency;setAimPower(p.classState.aimPower-1)}
  }
  finishMovementDiscovery105(discovery,!state._turnPipelineActive57&&['walk','blink','ally-swap','talisman-blink','fusion-blink','holy-blink','portal'].includes(cause));
  martialLanding(origin);applyJarGasEffects57();if(state.floor>=11&&(p.x!==origin.x||p.y!==origin.y)){state.recentPlayerCells57=(state.recentPlayerCells57||[]).filter(c=>(state.playerAgencyTurns57||0)-c.agency<26);state.recentPlayerCells57.push({x:p.x,y:p.y,agency:state.playerAgencyTurns57||0});if(state.recentPlayerCells57.length>64)state.recentPlayerCells57.shift()}
  if(kind){resolveSilkCrossing54(origin,cause);return{ok:!!hazardResult,moved:p.x!==origin.x||p.y!==origin.y,cause,hazard:kind,result:hazardResult,x:p.x,y:p.y}}
  if(opts.resetVisual)resetVisualState();
  if(state.shopIntermission?.active){const stock=ShopMapBuilder.groundAt(x,y);if(stock)openShop(stock);return{ok:true,moved:p.x!==origin.x||p.y!==origin.y,cause,entry:!!stock,x,y}}
  const activeInteraction=opts.activeInteraction??cause==='walk';
  if(activeInteraction&&PLAYER_ENTRY_PICKUP_FIRST57.has(tile)){
    let guard=0;while(guard++<12&&(state.items||[]).some(it=>it.x===x&&it.y===y)){
      const before=state.items.length;if(!pickup()||state.items.length>=before)break;
    }
  }
  resolveSilkCrossing54(origin,cause);
  const entry=opts.entry===false?false:bumpTileAction(x,y,{cause,activeInteraction});return{ok:true,moved:p.x!==origin.x||p.y!==origin.y,cause,entry,x:p.x,y:p.y}
}

const RUNTIME_ENTRY_REACTIVE57=new Set([TT.PAPER_BRIDGE,TT.CRUMBLE,TT.PORTAL,TT.RUMOR,TT.TRAP,TT.MIRROR,TT.SNARE,TT.GOLD,TT.KEY_TILE,TT.STAMINA_PAD,TT.FLOOR,TT.PAVILION].filter(v=>Number.isFinite(v)));


function terrainHasPendingRecovery57(x,y){
  // Authored future drainage preserves submerged loot in place. Terminal floods
  // have no such recovery path and must retain loot on reachable ground.
  const safe=t=>Number.isFinite(t)&&!dangerousLootTerrain42(t)&&!tileBlocks(t)&&![TT.STAIR,TT.KEY_TILE,TT.PORTAL,TT.DOOR].includes(t);
  const pending=(state.floor23?.controls||[]).filter(c=>!c.activated&&!(state.switches||[]).find(sw=>sw.id===c.switchId)?.used);
  if(pending.some(c=>(c.changes||[]).some(q=>q.x===x&&q.y===y&&safe(q.after))))return ReachabilityService.lootCells({futureOnly:true}).has(k(x,y));
  const reveal=state.floor23?.reveal;if(reveal&&!reveal.used&&(reveal.cells||[]).some(q=>q.x===x&&q.y===y&&safe(q.t)))return ReachabilityService.lootCells({futureOnly:true,includeReveal:true}).has(k(x,y));
  return false;
}









function playerAction57(kind,opts={}){
  if(runState57()!=='playing'){ActionDispatcher.denied('inactive');return{ok:false,kind,reason:'inactive'}};
  if(!gameplayInputAllowed57(opts)){ActionDispatcher.denied('blocked');return{ok:false,kind,reason:'blocked'}};
  if(ACTION_PRESENTATION58.run===state&&performance.now()<ACTION_PRESENTATION58.inputUntil){ActionDispatcher.denied('presenting');return{ok:false,kind,reason:'presenting'}}
  if(dojoSleeping()){ActionDispatcher.denied('asleep');return{ok:false,kind,reason:'asleep'};}
  if(state.shopIntermission?.active)return{ok:true,kind,committed:false};
  if((state.status?.stun||0)>0){ActionDispatcher.denied('stun');state.status.stun--;if(opts.closeMartial)closeMartial();if(opts.closeInventory)closeInventory();addLog(opts.stunMessage||'몸이 굳어 행동하지 못했다.');globalThis.__MANRU_TURN_ENGINE__.advance({handled:true,committed:true,timeCost:1,reason:"playerAction57",...{playerAgency:false,reason:'stun-skip'}}).value;return{ok:false,kind,reason:'stun',consumed:true,stunned:true}}
  if(opts.skill&&(state.status?.skillSeal||0)>0){ActionDispatcher.denied('skillSeal');toast('기력이 봉인되어 이 행동을 할 수 없다.');return{ok:false,kind,reason:'skillSeal'}}
  return{ok:true,kind,committed:false}
}
function commitPlayerAction57(ctx,cost=1){if(!ctx?.ok||ctx.committed)return false;ctx.committed=true;if(['attack','martial','item'].includes(ctx.kind)&&!actionPresentationBusy58())presentPlayerAction58(ctx.kind,state.playerAttackTarget);globalThis.__MANRU_TURN_ENGINE__.advance({handled:true,committed:true,timeCost:cost,reason:"commitPlayerAction57"}).value;return true}







function forcedMovementResisted57(entity,opts={}){if(!state||!entity||opts.hostile===false)return false;if(entity.armor?.elementGuard74==='earth'){floatText(entity.x,entity.y,'버팀','#d7b77f',9);return true}const cloak=entity===state.player?playerCloak():(entity.cloak||{}),r=clamp(Number(cloak.staggerResist)||0,0,.95);if(r>0&&globalThis.__MANRU_RANDOM57__()<r){floatText(entity.x,entity.y,'경직 저항','#b9d7cd',9);addLog(`${cloak.name||entity.name}: 강제이동을 버텼다.`);return true}return false}
function resolveForcedMovement57(entity,source,steps=1,opts={}){
  if(!state||!entity||!source||steps<=0)return{moved:0,resisted:false};
  if(forcedMovementResisted57(entity,opts))return{moved:0,resisted:true};
  if(entity!==state.player&&!MON_VIS.has(entity))MON_VIS.set(entity,{x:entity.x,y:entity.y,last:performance.now()});
  let moved=0,interrupted=false,collision=null,broken=0,slid=false;let limit=steps;const player=entity===state.player,haz=globalThis.__MANRU_HAZARD_CORE__,visualSteps=[];
  const rememberVisualStep=q=>{if(entity.x!==q.x||entity.y!==q.y)return;const prev=visualSteps[visualSteps.length-1];if(!prev||prev.x!==q.x||prev.y!==q.y)visualSteps.push({x:q.x,y:q.y})};
  for(let i=0;i<limit;i++){
    if(!slid&&!entity.flying&&state.map[entity.y]?.[entity.x]===TT.ICE){slid=true;limit++;floatText(entity.x,entity.y,'미끄러짐','#88bdce',9)}
    const dx=Math.sign(opts.mode==='pull'?source.x-entity.x:entity.x-source.x),dy=Math.sign(opts.mode==='pull'?source.y-entity.y:entity.y-source.y);if(!dx&&!dy)break;
    let candidates;
    if(opts.orthogonal&&dx&&dy){const ax=Math.abs(source.x-entity.x),ay=Math.abs(source.y-entity.y);candidates=ax>=ay?[{x:entity.x+dx,y:entity.y},{x:entity.x,y:entity.y+dy}]:[{x:entity.x,y:entity.y+dy},{x:entity.x+dx,y:entity.y}]}
    else candidates=[{x:entity.x+dx,y:entity.y+dy}];
    let advanced=false;
    for(const q of candidates){
      if(q.x<0||q.y<0||q.x>=COLS||q.y>=ROWS)continue;
      let t=state.map?.[q.y]?.[q.x];const before={x:entity.x,y:entity.y};
      if(opts.mode!=='pull'&&!broken&&[TT.TABLE,TT.SCREEN,TT.BENCH,TT.CRATE,TT.BAMBOO,TT.LOW_FENCE].includes(t)&&!protectedProp105(q.x,q.y)&&!runtimeTerrainOccupants57(q.x,q.y).length){
       const base=furnitureFloor57(q.x,q.y),rr=RuntimeTerrainOwner.mutate(q.x,q.y,base,{source:'forced-furniture-collision'});if(rr.ok){releaseTerrainUnderlay58(q.x,q.y,base);delete terrainReactions105().burning[k(q.x,q.y)];if(state.branchTerrain105?.props)delete state.branchTerrain105.props[k(q.x,q.y)];touchElementTerrain105(q.x,q.y);elementBreakFx105(q.x,q.y,'wood');burst(q.x,q.y,'#b88a53',12,.7);alertNearby(q.x,q.y,6);broken++;if(player)applyHostileStatus('stun',1,1,{stagger:true});else setMonsterStatus(entity,'stunned',(entity.stunned||0)+1);t=base}
      }
      const kind=haz?.kind?.(t);
      if(player){
        if(OccupancyService.isOccupied(q.x,q.y))continue;
        if(kind||ReachabilityService.playerPassable(q.x,q.y)){
          const out=resolvePlayerLanding57(q.x,q.y,{cause:opts.mode==='pull'?'forced-pull':'forced-push',origin:before});
          if(out.ok){
            if(entity.x!==before.x||entity.y!==before.y){moved++;rememberVisualStep(q)}
            // Rescue, a ward activation, or a portal ends this displacement impulse.
            interrupted=!!(out.hazard&&out.result!=='adapted')||entity!==state.player||entity.x!==q.x||entity.y!==q.y;
            advanced=true;break;
          }
        }
      }else{
        if(kind&&!OccupancyService.isOccupied(q.x,q.y,entity)&&(q.x!==state.player.x||q.y!==state.player.y)){
          const out=haz.resolve?.(entity,t,q.x,q.y,before,{consumeTurn:false,forced:true,creditPlayer:opts.creditPlayer!==false});
          if(out){if(entity.x!==before.x||entity.y!==before.y){moved++;rememberVisualStep(q)}interrupted=out!=='adapted';advanced=true;break}
        }
        if(PlacementService.monsterCanStand(entity,q.x,q.y)){OccupancyService.move(entity,q.x,q.y);moved++;rememberVisualStep(q);advanced=true;break}
      }
    }
    if(advanced&&!slid&&!entity.flying&&state.map[entity.y]?.[entity.x]===TT.ICE){slid=true;limit++;floatText(entity.x,entity.y,'미끄러짐','#88bdce',9)}
    if(!advanced){const q=candidates[0],t=state.map?.[q.y]?.[q.x];if(t==null||runtimeTerrainSolid57(t))collision=q}
    if(!advanced||interrupted||entity.hp<=0||state.dead)break;
  }
  if(moved&&visualSteps.length)beginForcedMotion(entity,visualSteps);
  if(moved&&opts.log)addLog(opts.log);return{moved,resisted:false,collision,broken,slid}
}
function resetFloorScopedState57(){if(!state)return;state.terrainReactions105=newTerrainReactions105();state.martialEcho=null;state.player.smokeInside1005=false;state.recentPlayerCells57=[];state.naturalPopulation57=null;state.noiseSequence57=null;noiseBudget=null;state.silkTraps57={};delete state.tutorialEntry60;delete state.floor23;delete state.floor24;for(const key of ['tempFields','tempTerrain74','elementFields74','legendFireFields47','legendTerrain47','legendSkyAxes47','artifactFields46','gazeBursts57','jarGasFields57'])if(Array.isArray(state[key]))state[key]=[];state._manualRangedTargetR8=null;state._manualTerrainTargetR8=null;state._lastPlayerPos60=null;state.crumbleBase60={};if(state.hazard1005){const drown=state.hazard1005?.drownUntil||0,voidWard=state.hazard1005?.voidUntil||0;state.hazard1005={armed:{},collapsed:{},lastWarn:{},drownUntil:drown,voidUntil:voidWard}}}
function movePlayer(dx,dy){
 if(state?.shopIntermission?.active){
  if(!gameplayInputAllowed57())return false;const p=state.player,x=p.x+dx,y=p.y+dy,npc=neutralInteractableAt58(x,y);if(npc)return interactNeutral58(npc);
  if(!ReachabilityService.playerStepAllowed(p,x,y)||OccupancyService.isOccupied(x,y))return false;
  p.facing={x:dx,y:dy};if(state.map[y][x]===TT.DOOR){setTerrainTile58(state.map,x,y,TT.OPEN_DOOR);doorFX(x,y)}
  const landing=resolvePlayerLanding57(x,y,{cause:'walk'});if(!landing.ok)return false;
  VisibilityService.compute();updateAll();globalThis.__MANRU_SAVE_SERVICE__?.request?.();return true;
 }

  const p0=state?.player,ctx={dx,dy,beforeX:p0?.x,beforeY:p0?.y,targetX:(p0?.x??0)+dx,targetY:(p0?.y??0)+dy,targetTile:state?.map?.[(p0?.y??0)+dy]?.[(p0?.x??0)+dx],result:undefined};
  for(let i=MOVE_HOOKS_R8.pre.length-1;i>=0;i--)if(MOVE_HOOKS_R8.pre[i](ctx)===false)return false;
  try{
    const act=playerAction57('move',{stunMessage:'몸이 굳어 한 턴을 잃었다.'});if(!act.ok)return act.consumed||false;
    const p=state.player,intended={x:dx,y:dy},ix=p.x+dx,iy=p.y+dy,intendedMon=ix>=0&&iy>=0&&ix<COLS&&iy<ROWS?findMonsterAt(ix,iy):null;
    p.facing={...intended};if(intendedMon&&isHostileTarget57(intendedMon)){state._forcedAdjacentTargetR8=intendedMon;ctx.result=ActionDispatcher.dispatch({type:'ATTACK',args:[]}).value;return ctx.result}
    if((state.status?.drunk||0)>0){const drunk=drunkMovementOutcome57();if(drunk==='stumble'){floatText(p.x,p.y,'휘청','#d7c39e',10);addLog('취기가 발을 묶어 제자리에서 휘청거렸다.');commitPlayerAction57(act,moveTurnCost());ctx.result=true;return true}if(drunk==='misstep'){const choices=[];for(const[ddx,ddy]of DIRS8){const x=p.x+ddx,y=p.y+ddy;if(x<0||y<0||x>=COLS||y>=ROWS||findMonsterAt(x,y))continue;const tile=state.map?.[y]?.[x],hazard=globalThis.__MANRU_HAZARD_CORE__?.kind?.(tile);if(ReachabilityService.playerStepAllowed(p,x,y,{allowHazardEntry:!!hazard}))choices.push({dx:ddx,dy:ddy})}if(!choices.length){floatText(p.x,p.y,'휘청','#d7c39e',10);addLog('취기가 발을 꼬았지만 비틀어 갈 곳이 없었다.');commitPlayerAction57(act,moveTurnCost());ctx.result=true;return true}const q=choice(choices);dx=q.dx;dy=q.dy;ctx.dx=dx;ctx.dy=dy;ctx.targetX=p.x+dx;ctx.targetY=p.y+dy;ctx.targetTile=state.map?.[ctx.targetY]?.[ctx.targetX];floatText(p.x,p.y,'비틀','#d7c39e',10);addLog('취기에 방향 감각이 흐려져 발걸음이 빗나갔다.')}}
    p.facing={x:dx,y:dy};const nx=p.x+dx,ny=p.y+dy;if(nx<0||ny<0||nx>=COLS||ny>=ROWS){ActionDispatcher.dispatch({type:'STRUCTURE_INTERACT',args:[nx,ny,act]}).value;return}
    const mon=findMonsterAt(nx,ny);if(mon){if(!isHostileTarget57(mon)){ctx.result=resolveOccupancyInteraction57(p,mon);if(ctx.result)commitPlayerAction57(act,moveTurnCost());return ctx.result}state._forcedAdjacentTargetR8=mon;ctx.result=ActionDispatcher.dispatch({type:'ATTACK',args:[]}).value;return ctx.result}
    const t=state.map[ny][nx];if(t===TT.JAR){state._manualTerrainTargetR8={type:'jar',x:nx,y:ny};ctx.result=ActionDispatcher.dispatch({type:'ATTACK',args:[]}).value;return ctx.result}const haz=globalThis.__MANRU_HAZARD_CORE__,kind=haz?.kind?.(t);
    if(!ReachabilityService.playerStepAllowed(p,nx,ny,{allowHazardEntry:!!kind})){ActionDispatcher.dispatch({type:'STRUCTURE_INTERACT',args:[nx,ny,act]}).value;return}
    const discovery105=captureMovementDiscovery105();
    if(t===TT.DOOR){setTerrainTile58(state.map,nx,ny,TT.OPEN_DOOR);branchWarningDoor(nx,ny);doorFX(nx,ny);addLog('문을 밀어 열었다.')}
    const landing=resolvePlayerLanding57(nx,ny,{cause:'walk',discovery105});if(!landing.ok){ctx.result=false;return false}if(state.dead){ctx.result=true;return true}if(WorldTransition57.commit(act,moveTurnCost())){ctx.result=true;return true}if(state.map[ny][nx]===TT.STAIR)toast('다음 층으로 이어지는 문이다.');commitPlayerAction57(act,moveTurnCost());ctx.result=true;return true
  }finally{
    ctx.afterX=state?.player?.x;ctx.afterY=state?.player?.y;ctx.moved=!!state&&(ctx.afterX!==ctx.beforeX||ctx.afterY!==ctx.beforeY);
    for(const fn of MOVE_HOOKS_R8.post)try{fn(ctx)}catch(e){console.error('move post hook',e)}
  }
}
ActionDispatcher.register('MOVE',movePlayer);




ActionDispatcher.register('BLINK',useBlink);





function combatFieldBlocksSight57(x,y){return !!state?.tempFields?.some(f=>['smoke','steam'].includes(f.kind)&&f.ttl>0&&(f.cells?f.cells.some(c=>c.x===x&&c.y===y):Math.abs(x-f.x)<=1&&Math.abs(y-f.y)<=1))}
function combatLineCheckR8(x0,y0,x1,y1,opts={}){
  const maxRange=Number.isFinite(opts.range)?opts.range:Infinity,dist=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));if(dist>maxRange)return{ok:false,reason:`사거리 밖 · ${dist}/${maxRange}칸`,dist};
  const cells=combatLineCellsR8(x0,y0,x1,y1);
  for(let i=0;i<cells.length;i++){const c=cells[i],last=i===cells.length-1;
    if(combatFieldBlocksSight57(c.x,c.y))return{ok:false,reason:'연막이나 증기가 사선을 끊는다.',dist};if(!last&&tileBlocksSight(state.map[c.y]?.[c.x]))return{ok:false,reason:'벽이나 지형이 사선을 막는다.',dist};if(!last&&opts.units!==false){const block=findMonsterAt(c.x,c.y);if(block&&block.hp>0&&!block.hidden&&block!==opts.ignore&&block!==opts.attacker)return{ok:false,reason:`${block.name}이 사선을 가로막는다.`,dist,blocker:block}}}
  return{ok:true,dist,range:maxRange}
}







function attackTerrainTargetR8(target){
 const p=state.player,w=p.weapon||{},ranged=!!(w.ranged||w.kind==='bow'),check=combatTerrainTargetCheckR8(target);if(!check.ok)return false;
 const strong=!ranged&&p.strongReady>0;if(strong)p.strongReady=0;const jar=state.map[target.y]?.[target.x]===TT.JAR;if(jar&&!destroyJar57(target.x,target.y,{forced:true,source:ranged?'ranged':'melee'}).ok)return false;
 if(ranged)projectileFX(p.x,p.y,target.x,target.y);else slashFX(p.x,p.y,target.x,target.y,'#e7c8a2');globalThis.__MANRU_SFX54__?.play?.('hit');target.hp=0;setPlayerAttackOutcome('hit',target,{damage:1});ACTION_PRESENTATION58.strong=strong;return true;
}







ActionDispatcher.register('ATTACK',basicAttack);







const HAPTIC57={enabled:true};

try{HAPTIC57.enabled=localStorage.getItem('manruHaptics57')!=='0'}catch(error){ignoreError('haptics preference unreadable',error)}













function resolveMonsterAttackCount57(mon){return mon?.multiAttack?(mon.enrage&&mon.hp<=mon.maxHp*.5?3:2):1}


setPlayerAttackBaseR('initial',attackPlayerInitialCoreR);

function rollHostileStatus(baseChance){return globalThis.__MANRU_RANDOM57__()<hostileStatusChance(baseChance)}





function combatGuardBlocks57(attacker,target){
 if(!target?.guardChance57||target.hp<=0||globalThis.__MANRU_RANDOM57__()>=target.guardChance57)return false;
 target.alerted=true;floatText(target.x,target.y,'방어','#d3c08e',10);impact(target.x,target.y,'#c9ad73',2);addLog(`${target.name}이 창대로 정면 공격을 막았다.`);return true;
}

setMonsterAttackBaseR('initial',attackMonsterInitialCoreR);

function registerBossRewardStage55(id,phase,run){const list=BOSS_REWARD_STAGES[phase];if(!list)throw new Error('invalid boss reward phase '+phase);if(list.some(v=>v.id===id))throw new Error('duplicate boss reward stage '+id);list.push({id,run})}
function weightedBossUtility55(entries){
  const pool=entries.filter(e=>e?.item&&Number(e.weight)>0);if(!pool.length)return null;
  const total=pool.reduce((n,e)=>n+e.weight,0);let r=globalThis.__MANRU_RANDOM57__()*total;
  for(const e of pool){r-=e.weight;if(r<=0)return e}return pool.at(-1)
}

function queueBossDropTransaction55(plan,origin,floor){
  const queued=plan.map(def=>({item:{...clone(def),count:1,bossDrop55:true},origin:{...origin}}));state.pendingGroundItems57=state.pendingGroundItems57||[];state.pendingGroundItems57.push(...queued);
  state.bossDrop55={granted:false,pending:true,pendingCount:queued.length,floor,requested:plan.length,count:0,healCount:plan.filter(v=>['heal_small','heal_medium','heal_large'].includes(v.potionKind)).length,stackedFallbacks:0,names:plan.map(v=>v.name),items:plan.map(v=>({name:v.name,type:v.type,potionKind:v.potionKind||null,talismanKind:v.talismanKind||null,x:null,y:null,stacked:false}))};
  addLog(`보스 전리품 ${queued.length}개를 안전 배치 대기열에 보존했다. 배치 가능한 정상 바닥이 생기면 같은 요청을 이어서 완료한다.`);return false
}


function dangerousLootTerrain42(t){
  if(t==null)return true;
  const haz=globalThis.__MANRU_HAZARD_CORE__,kind=haz?.kind?.(t);
  if(kind)return true;
  return [TT.WATER,TT.LAVA,TT.VOID,TT.MERCURY,TT.DRAWBRIDGE_UP,TT.TRAP,TT.SNARE,TT.CRUMBLE].filter(v=>v!=null).includes(t);
}



function safeLootGround42(x,y){
  if(state?.generationInProgress57&&inTutorialEntry(x,y))return false;
  if(!state||x<0||y<0||x>=COLS||y>=ROWS)return false;
  const t=state.map[y]?.[x];return !dangerousLootTerrain42(t)&&!tileBlocks(t)&&t!==TT.STAIR&&t!==TT.KEY_TILE&&t!==TT.PORTAL&&t!==TT.DOOR;
}













function applyRecoveryPotion57(actor,item){
 const rules={heal_small:{minimum:10,fraction:.32},heal_medium:{minimum:18,fraction:.60}},rule=item?.type==='potion'?rules[item.potionKind]:null;if(!actor||actor.hp<=0||!rule)return false;
 const used=splitItemQuantity(item,1,actor.inventory);if(!used)return false;
 const before=actor.hp;actor.hp=Math.min(actor.maxHp,actor.hp+Math.max(rule.minimum,Math.ceil(actor.maxHp*rule.fraction)));
 const cleansed=item.potionKind==='heal_medium'&&combatStatusTurns(actor,'bleed')>0&&globalThis.__MANRU_RANDOM57__()<.5;
 if(cleansed){if(actor===state.player)state.status.bleed=0;else setMonsterStatus(actor,STATUS_META57.bleed.monsterField57,0);}
 addLog(`${actor===state.player?'':actor.name+' · '}${item.name}: HP +${displayNumber53(Math.round(actor.hp-before))}${cleansed?' · 출혈 제거':''}.`);
 if(actor.equipmentActor105)updateEquipmentPhase105(actor);return true;
}






function xpRequirementForLevel57(targetLevel){const lv=Math.max(2,Math.min(BALANCE.maxLevel,Math.floor(Number(targetLevel)||2)));if(lv===2)return 32;if(lv<=13)return 24+lv*8;return Math.round(128*Math.pow(1.5,lv-13))}
function normalizePlayerProgression57(p){if(!p)return;p.level=Math.max(1,Math.min(BALANCE.maxLevel,Math.floor(Number(p.level)||1)));p.xp=Math.max(0,Math.floor(Number(p.xp)||0));p.nextXp=p.level<BALANCE.maxLevel?xpRequirementForLevel57(p.level+1):xpRequirementForLevel57(BALANCE.maxLevel);p.skillPoints=Math.max(0,Math.floor(Number(p.skillPoints)||0))}










function recordPlayerSight105(){
 if(!state?.player||state.generationInProgress57)return;
 for(const mon of state.monsters||[])if(!mon.seenByPlayer105&&isThreatVisibleToPlayer(mon))mon.seenByPlayer105=true;
}




function movementDiscoveryEvades105(mon,ctx){
 const grace=state?._movementDiscovery105;
 return !!(grace&&grace.map===state.map&&grace.monsters.has(mon)&&['melee','ranged'].includes(ctx.delivery));
}

function playAmbushReveal57(mon,reason='proximity'){if(!mon)return;const grass=!!mon.grassHide57,color=grass?'#9fc77a':(mon.color||'#c6ad88'),terrainLost=reason==='terrain';if(!terrainLost)vfVibrate(HAPTIC_PATTERN57.ambush);burst(mon.x,mon.y,color,grass?28:22,grass?1.15:.95);impact(mon.x,mon.y,color,grass?6:5);floatText(mon.x,mon.y,terrainLost?'은신 해제':grass?'풀숲 기습!':'기습!',color,grass?13:12);mon.hitUntil=Math.max(mon.hitUntil||0,performance.now()+220);if(terrainLost)addLog(`${mon.name}의 은신처가 사라져 모습을 드러냈다.`);else addLog(`${mon.name}이 숨어 있던 곳에서 튀어나왔다.`)}



















function releaseKeeperExit54(mon){
 const phase=mon.keeperLava54?.phases.filter(p=>p.resolved).at(-1);if(!phase||!state.stairs)return;
 const owned=new Set(keeperLavaCells(mon,phase).map(c=>k(c.x,c.y))),tileAt=(x,y,project=false)=>{
  const tile=state.map[y]?.[x];if(project&&tile===TT.LAVA&&owned.has(k(x,y)))return TT.STONE_PATH;
  if(globalThis.__MANRU_HAZARD_CORE__?.kind?.(tile)||[TT.WATER,TT.MERCURY,TT.VOID,TT.LAVA].includes(tile))return TT.WALL;
  if(state.bossExitGate1020?.x===x&&state.bossExitGate1020?.y===y)return TT.OPEN_DOOR;
  return tile;
 };
 const search=project=>ReachabilityService.playerSearch(state.player,{ignoreOccupants:true,goal:state.stairs,tileAt:(x,y)=>tileAt(x,y,project)});
 if(ReachabilityService.playerPath(search(false),state.stairs))return;
 const path=ReachabilityService.playerPath(search(true),state.stairs);if(!path)return;
 const cooling=[{x:state.player.x,y:state.player.y},...path].filter(c=>state.map[c.y]?.[c.x]===TT.LAVA&&owned.has(k(c.x,c.y)));
 layKeeperBridge54(mon,cooling,[],3);OccupancyService.endShared();
 if(cooling.length){floatText(mon.x,mon.y,'퇴로 개방','#d5c29d',14);addLog('간수가 쓰러지자 출구로 이어지는 용암이 굳어 석교가 됐다. 나머지 용암은 남아 있다.');}
}














function silkThreadAt54(x,y){
 return !!state?.monsters?.some(mon=>mon.hp>0&&mon.bossPattern==='needle'&&entitiesHostile57(mon,state.player)&&mon.silk54?.links.some(l=>l.cells.some(c=>c.x===x&&c.y===y)));
}



















































































const MANRU_PICKUP_PIPELINE_R25={stages:[],handlers:[]};
function registerPickupStageR25(id,hooks){if(MANRU_PICKUP_PIPELINE_R25.stages.some(x=>x.id===id))throw new Error('duplicate pickup stage: '+id);MANRU_PICKUP_PIPELINE_R25.stages.push({id,pre:hooks?.pre,post:hooks?.post});return hooks}

function pickupBaseR25(){
  const item=state.items.find(it=>it.x===state.player.x&&it.y===state.player.y);if(!item){toast('발밑에 아이템이 없다.');return false}
  if(item.type==='progress_key23'){state.items.splice(state.items.indexOf(item),1);if(state.floor23)state.floor23.keyAcquired=true;addLog('수은 심부 열쇠를 획득했다. 이제 계단의 봉인이 풀린다.');burst(state.player.x,state.player.y,'#d8f2ef',15,.8);updateAll();return true}
  if(item.type==='story_note'){state.items.splice(state.items.indexOf(item),1);globalThis.storyCollectNote992?.(item.storyId);return true}
  const result=transferItemQuantity(item,state.items,state.player.inventory,itemQuantity(item),{capacity:inventoryCapacity()});
  if(result.moved){if(item.ammoKind&&!state.player.loadedAmmoKind)state.player.loadedAmmoKind=item.ammoKind;addLog(`${item.name} ×${result.moved} 획득.`);burst(state.player.x,state.player.y,rarityColor(item.rarity),10,.75)}else toast('인벤토리가 가득 찼다.');renderInventory();updateAll();return result.moved>0
}
function pickup(...args){
  const action=playerAction57('pickup');if(!action.ok)return !!action.consumed;
  const ctx={args,ground:state?.items?.find(i=>i.x===state?.player?.x&&i.y===state?.player?.y)||null};
  for(let i=MANRU_PICKUP_PIPELINE_R25.handlers.length-1;i>=0;i--){const out=MANRU_PICKUP_PIPELINE_R25.handlers[i].fn(ctx);if(out?.handled)return out.result}
  for(let i=MANRU_PICKUP_PIPELINE_R25.stages.length-1;i>=0;i--)MANRU_PICKUP_PIPELINE_R25.stages[i].pre?.(ctx);
  const r=pickupBaseR25(...args);ctx.result=r;
  for(const st of MANRU_PICKUP_PIPELINE_R25.stages)st.post?.(ctx);
  return r;
}
ActionDispatcher.register('PICKUP',pickup);







const DESCEND_EFFECTS53=[];
function runDescendEffects53(fromFloor){if(!state||state.floor===fromFloor)return;for(const effect of DESCEND_EFFECTS53)effect({fromFloor,toFloor:state.floor})}

function sellShop58(item){
 const shop=state?.shopIntermission,inv=state?.player?.inventory,index=inv?.indexOf(item),value=ShopMapBuilder.saleValue(item);
 if(!shop?.active||!adjacentMerchant58()||shop.purchaseId||gameplayInputOwner57().panels.some(p=>p.id!=='shop58'))return{ok:false,reason:'inactive'};
 if(index<0||!value)return{ok:false,reason:'ineligible'};
 const staged=structuredClone(inv);if(!consumeItemQuantity(staged[index],1,staged))return{ok:false,reason:'quantity'};
 const candy={...CONSUMABLES.find(i=>i.foodKind==='coin_candy'),count:value},transfer=transferItemQuantity(candy,null,staged,value,{capacity:inventoryCapacity()});
 if(transfer.remaining){toast('엽전 엿을 받을 공간이 없다.');return{ok:false,reason:'capacity'}}
 state.player.inventory=staged;
 if(!globalThis.__MANRU_SAVE1004__?.write?.().ok){state.player.inventory=inv;toast('저장하지 못해 판매를 취소했다.');return{ok:false,reason:'save'}}
 renderShop();updateAll();return{ok:true,value};
}
function shopPrice58(item){return({common:1,rare:2,relic:3,sealed:5})[item.rarity]||1}

function shopCandidates58(afterFloor,theme){
 const pools=[[WEAPONS,'weapon'],[ARMORS,'armor'],[CLOAKS,'cloak'],[RELICS,'relic'],[TRINKETS,'trinket'],[window.MANRU_POTIONS||[],'potion'],[window.MANRU_TALISMANS||[],'talisman'],[CONSUMABLES,'food']],out=[],seen=new Set();
 for(const[pool,type]of pools)for(const p of pool){if(type==='food'&&(p.type!=='food'||!p.craftedOnly57))continue;const item={...p,type},id=type+':'+item.name;if(seen.has(id)||!shopEligible58(item,afterFloor,theme))continue;seen.add(id);out.push(item)}return out;
}


function neutralInteractableAt58(x,y){return(state?.neutralInteractables58||[]).find(n=>n.x===x&&n.y===y)||null}
function adjacentMerchant58(){return(state?.neutralInteractables58||[]).find(n=>n.kind==='merchant'&&entityDistance57(n,state.player)<=1)||null}
function interactNeutral58(n){if(!n||n.kind!=='merchant'||!state?.shopIntermission?.active||!gameplayInputAllowed57()||entityDistance57(n,state.player)>1)return false;cancelAutoWalk();clearHeldInput53();openShop();return true}
function shopCurrency58(inventory=state?.player?.inventory||[]){return inventory.filter(i=>i.foodKind==='coin_candy').reduce((n,i)=>n+itemQuantity(i),0)}
function purchaseShop58(id){
 const shop=state?.shopIntermission;if(!shop?.active||gameplayInputOwner57().panels.some(p=>p.id!=='shop58'))return{ok:false,reason:'inactive'};
 const stock=shop.stock.find(s=>s.id===id);if(!stock)return{ok:false,reason:'missing'};if(stock.soldOut)return{ok:false,reason:'soldOut'};
 if(state.player.x!==stock.x||state.player.y!==stock.y||shop.purchaseId!==id)return{ok:false,reason:'position'};
 const price=shopPrice58(stock.item);if(stock.price!==price)return{ok:false,reason:'price'};
 const inv=state.player.inventory;if(shopCurrency58(inv)<price){toast('엽전 엿이 부족하다.');return{ok:false,reason:'funds'}}
 // Preflight uses the canonical transfer contract on a detached candidate inventory.
 // Currency slots are not assumed to disappear: a full bag fails without any debit.
 const staged=structuredClone(inv),item=structuredClone(stock.item),r=transferItemQuantity(item,null,staged,itemQuantity(item),{capacity:inventoryCapacity()});
 if(r.remaining){toast('행낭에 상품을 넣을 공간이 없다.');return{ok:false,reason:'capacity'}}
 let left=price;for(const candy of [...staged]){if(candy.foodKind!=='coin_candy')continue;const n=Math.min(left,itemQuantity(candy));if(n&&!consumeItemQuantity(candy,n,staged))throw new Error('shop quantity contract');left-=n;if(!left)break}if(left)throw new Error('shop debit contract');
 // Publish inventory and stock together; no turn, drop, or gameplay callback occurs between them.
 state.player.inventory=staged;stock.soldOut=true;
 if(!globalThis.__MANRU_SAVE1004__?.write?.().ok){state.player.inventory=inv;stock.soldOut=false;toast('저장하지 못해 교환을 취소했다.');return{ok:false,reason:'save'}}
 closeShop58();updateAll();return{ok:true,price};
}
ActionDispatcher.register('SHOP_BUY',purchaseShop58);ActionDispatcher.register('SHOP_SELL',sellShop58);





function closeShop58(){setInteraction8('shop58',false);if(state?.shopIntermission)state.shopIntermission.purchaseId=null;clearHeldInput53();globalThis.__MANRU_UX45_ACTIONS__?.finishClose?.()}



function descend(){
  cancelAutoWalk();
  if(state?.branchContext105){toast('분기에서는 문 옆에서 상호작용 버튼(F)으로 출입한다.');return false}
  const act=playerAction57('descend',{stunMessage:'몸이 굳어 층을 내려가지 못했다.'});
  if(!act.ok)return !!act.consumed;
  if(state.player.x!==state.stairs.x||state.player.y!==state.stairs.y){toast('다음 층으로 이어지는 문 위에서 사용해야 한다.');return false}
  if(!state.shopIntermission?.active&&[5,10,15,20].includes(state.floor)&&!state.bossDefeated){toast('구역 보스를 쓰러뜨려야 길이 열린다.');return false}
  if(state.floor===23&&!state.floor23?.keyAcquired){toast('수은 심부 열쇠가 있어야 다음 층으로 내려갈 수 있다.');return false}
  if(state.floor>=25){toast('더 안쪽은 만루보주의 방뿐이다.');return false}
  if(!state.shopIntermission?.active&&[5,10,15,20].includes(state.floor))return ShopMapBuilder.enter();
  const lifecycleGeneration6=RunLifecycle.generation(),fromFloor=state.floor,leavingShop57=!!state.shopIntermission?.active,descentSnapshot57=captureGenerationSnapshot();
  const generateNext57=()=>{
    if(!RunLifecycle.isCurrent(lifecycleGeneration6))return false;
    try{
      const followers=summonFollowers();if(state.shopIntermission?.active)ShopMapBuilder.restore();resetFloorScopedState57();state.floor++;state.player.hp=Math.min(state.player.maxHp,state.player.hp+Math.ceil(state.player.maxHp*.12));state.player.focus=Math.min(getStats().maxFocus,state.player.focus+2);NormalFloorGenerator.generate();summonPlaceFollowers105(followers);branchPruneWorld(state);
    }catch(e){
      restoreGenerationSnapshot(descentSnapshot57);resetVisualState();resetTurnState();VisibilityService.compute();setGenerationPresentation8(false);updateAll();console.error('descend generation rejected',e);toast('다음 층의 구조가 불안정해 이동하지 못했다.');return false
    }
    try{
      resetVisualState();resetTurnState();startFloorTransition();addLog(`제 ${state.floor}층으로 들어섰다.`);runDescendEffects53(fromFloor);
      if(leavingShop57){
        // Present the new map before releasing the shop-exit input lock.
        syncGameViewport();globalThis.__MANRU_CAMERA_STATE12__?.resume?.(true);updateAll(true);
      }else updateAll();
      globalThis.__MANRU_SAVE_SERVICE__?.request?.();return true;
    }finally{setGenerationPresentation8(false)}
  };
  if(leavingShop57||fromFloor===21){
    cancelAutoWalk();clearHeldInput53();setGenerationPresentation8(true);
    requestAnimationFrame(()=>requestAnimationFrame(generateNext57));
    return true
  }
  return generateNext57()
}
ActionDispatcher.register('DESCEND',descend);
function rest(){const act=playerAction57('rest',{stunMessage:'몸이 굳어 쉬지 못했다.'});if(!act.ok)return !!act.consumed;cancelAutoWalk();commitPlayerAction57(act,1);return true}
ActionDispatcher.register('REST',rest);


ActionDispatcher.register('UPGRADE_MARTIAL',upgradeMartial);
ActionDispatcher.register('MARTIAL_MANUAL_CHOICE',chooseMartialManual);


ActionDispatcher.register('MARTIAL',activateMartial);



function useClassSkill(){return globalThis.__MANRU_SKILL991_INPUT__?.toggle()}








ActionDispatcher.register('ITEM_USE',useInventoryItem);

ActionDispatcher.register('ITEM_DROP',dropInventoryItem);
let inventoryFiltered;


const INVENTORY_RENDER_R34={core:null,pre:[],post:[]};
function registerInventoryRenderR34(id,phase,fn){if(typeof fn!=='function')throw new TypeError('inventory render stage must be a function');if(phase==='core'){INVENTORY_RENDER_R34.core={id,fn};return fn}const list=phase==='pre'?INVENTORY_RENDER_R34.pre:phase==='post'?INVENTORY_RENDER_R34.post:null;if(!list)throw new Error(`unknown inventory render phase: ${phase}`);const at=list.findIndex(v=>v.id===id);const rec={id,fn};if(at>=0)list[at]=rec;else list.push(rec);return fn}
function renderInventory(...args){inventoryDirty=false;for(const s of INVENTORY_RENDER_R34.pre)s.fn(...args);const core=INVENTORY_RENDER_R34.core?.fn||renderInventoryFallbackR;const result=core(...args);for(const s of INVENTORY_RENDER_R34.post)s.fn(...args);return result}




function toggleInventory(){
  if(!state) return;
  if(inventoryOpen) closeInventory(); else openInventory();
}




function toggleHelp(){
  if(!state) return;
  if(helpOpen) closeHelp(); else openHelp();
}















const RuntimeState={
  ui:{sessions:new Set(),generationPending:false,release:null,food:null,inventory:null,screen:null,storyChoice:null,storyNote:null,storyScene:null,deathCause:null},
  interactionActive:interactionActive8,projectUI(){projectInteractionUI();globalThis.__MANRU_STORY992__?.project?.();if(inventoryOpen)renderInventory();if(interactionActive8('shop58'))renderShop();if(runState57()==='death')presentDeath(RuntimeState.ui.deathCause)},
  input:{qHold61:null,classic:INPUT,router:INPUT_ROUTER57_AUDIT,device:null},action:ACTION_AUDIT5,turn:null,
  client:{initialized:false,type:null,orientation:null,orientationGate:false,selection:null,environment:null,refreshes:0,transitions:0,lastReason:'boot',desktop:{emissions:0,inactiveAttempts:0,inactivePhysical:0,physical:0,gated:0},mobile:{emissions:0,inactiveAttempts:0,inactivePhysical:0,physical:0,gated:0}},
  lifecycle:{phase:'no-run',generation:0,depth:0,last:null,validate:validateSaveState,parse:parseEnvelope},
  persistence:{pending:false,last:null,history:[]},
  prepareRun(){
    RuntimeState.persistence.retiredItemMigration57=null;RuntimeState.persistence.terrainRecovery58=null;
    RuntimeState.ui.sessions.clear();RuntimeState.ui.generationPending=false;RuntimeState.ui.storyChoice=null;RuntimeState.ui.storyNote=null;RuntimeState.ui.storyScene=null;RuntimeState.ui.deathCause=null;projectInteractionUI();
    clearHeldInput53();const device=RuntimeState.input.device;
    if(device){for(const pointer of device.pointers?.values?.()||[]){clearTimeout(pointer.holdShow);clearTimeout(pointer.holdFire)}device.pointers?.clear?.();device.gesture=null;device.mousePan=null;device.suppressClickUntil=0;device.cameraInspecting=false;}
    globalThis.__MANRU_RUNTIME81__?.stopHeld?.();globalThis.__MANRU_RUNTIME81__?.Camera81?.resume?.(false);document.body.classList.remove('camera-inspect81');return true;
  },
  snapshot(){const d=RuntimeState.input.device;return structuredClone({owner:'RuntimeState',schema:1,input:{held:[...INPUT.held],nextMoveAt:INPUT.nextMoveAt,device:d?{repeatDelay:d.repeatDelay,repeatTick:d.repeatTick,pointers:d.pointers?.size||0,gesture:d.gesture,mousePan:d.mousePan,cameraInspecting:d.cameraInspecting}:null},client:ClientEnvironment.snapshot(),lifecycle:{phase:RuntimeState.lifecycle.phase,generation:RuntimeState.lifecycle.generation,depth:RuntimeState.lifecycle.depth,last:RuntimeState.lifecycle.last},persistence:RuntimeState.persistence,action:{serial:ACTION_AUDIT5.serial,roots:ACTION_AUDIT5.roots,activeDepth:ACTION_AUDIT5.stack.length},turn:RuntimeState.turn?{serial:RuntimeState.turn.serial,history:RuntimeState.turn.history}:null})}
};
ClientEnvironment.initialize();

globalThis.__MANRU_LIFECYCLE__=RunLifecycle;

// Fullscreen belongs to entering/resuming the game, with no floating HUD control.
let fullscreenPending65=false,fullscreenWanted66=false,fullscreenResume66=false;

document.addEventListener('fullscreenchange',()=>{if(document.fullscreenElement)fullscreenResume66=false;else if(fullscreenWanted66)fullscreenResume66=true;window.dispatchEvent(new window.Event('resize'))});
// Re-enter from a genuine user gesture when the browser revokes fullscreen on app switching.
for(const type of ['pointerdown','touchend','keydown'])document.addEventListener(type,e=>{if(e.isTrusted&&fullscreenResume66&&document.body.dataset.manruScreen==='game')requestGameFullscreen65()},{capture:true,passive:true});



const RUN_END_EFFECTS53=[];










const PANEL_HOOKS54=[];
function registerPanelHook54(id,run){if(PANEL_HOOKS54.some(h=>h.id===id))throw new Error('duplicate panel hook '+id);PANEL_HOOKS54.push({id,run})}






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


function openMobileDrawer(tab=null){
  if(!gameplayUiOpen57())return false;globalThis.__MANRU_UX45_ACTIONS__?.beginViewer?.();
  if(tab) mobileTab = tab;
  setInteraction8('mobileDrawer',true);
  setMobileTab(mobileTab);
globalThis.__MANRU_UX45_ACTIONS__?.finishViewer?.();
}





function showInspect(title,html){
    const titleKey=String(title??''),item=itemFromTitle986(titleKey);if(item){openItemInspect986(item,null);return}
    const hiddenActual=[...(state?.player?.inventory||[]),...(state?.items||[])].find(i=>i&&i.name===titleKey&&unidentifiedItem(i));if(hiddenActual){openItemInspect986(hiddenActual,null);return}
    const mon=state?.monsters?.find(v=>v.name===title&&v.hp>0);if(mon){if(!isEntityObservableToPlayer57(mon)){directOpenInspect('확인 불가',simpleHtml986({desc:'현재 시야에 없는 존재의 실시간 정보는 확인할 수 없다.',hint:''}),null);return}const info=monsterInfo986(mon);directOpenInspect(info.name,simpleHtml986(info),null);return}
    const txt=dedupeProse986(textOnly(html).replace(/만루 기록/g,'').replace(/거리\s*\d+칸/g,'').replace(/좌표\s*\d+\s*,\s*\d+/g,'').replace(/\s+/g,' ').trim());
    directOpenInspect(title,simpleHtml986({desc:txt||'확인할 수 있는 정보가 없다.',hint:''}),null);
  }













document.addEventListener('keydown',InputRouter,true);InputRouter.noteListener('document:keydown');


/* ===== MANRU v0.8 WORLD ART OVERRIDES ===== */


// Richer floor material: deterministic wear, seams and region-specific micro props.

// Wall faces now read as connected architectural masses rather than isolated boxes.



// Stronger but localized emissive lighting.



// R7 refactor: removed obsolete v7 item wrapper; later canonical renderer supersedes it.

const classGrid = document.getElementById("classGrid");
const startGate=document.getElementById('startGate'),pickWrap=document.getElementById('classPickWrap'),enterBtn=document.getElementById('enterBtn'),continueBtn=document.getElementById('continueBtn'),classBackBtn=document.getElementById('classBackBtn');
RunLifecycle.refreshContinue();
bindMobileTopButtons();
renderMobileDrawer();


/* ===== MANRU v1.0 VERIFIED VISUAL + AUTOWALK PASS ===== */
VIS.hoverPath=null;VIS.autoPath=null;VIS.tapTrack=null;



/* r53: removed overwritten camera implementation. */



// Continuous auto-tiled wall masses: fewer "boxed tiles", stronger architecture.




// Local light islands inspired by high-contrast pixel dungeons: readable near the player, deep elsewhere.



// Architectural front faces, wall scrolls, and subdued non-interactive room dressing.




function autoExplore(resume=false){return Auto81.explore(resume)}







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

  registerMovePreR8(()=>!window.__manruZoomActive);
  C.addEventListener('click',e=>{if(performance.now()<window.__manruZoomSuppressUntil){e.preventDefault();e.stopImmediatePropagation()}}, {capture:true});
  
  /* r53: removed overwritten camera implementation. */
  
  updateZoomHud();



  window.__MANRU_CLEAR_HI_CACHE__=()=>{
    for(const m of [...Object.values(HI_CACHE),SHARED_PROP_ART,LAVA_ART_CACHE,FIRE_ART_CACHE,KEEPER_BRIDGE_ART])m.clear();
  };






  const pick=(arr,h,shift=0)=>arr[((h>>>shift)%arr.length+arr.length)%arr.length];






  /* ----------------------- 48x48 terrain sprites ----------------------- */
  
  function terrainKey(tile,region,variant,frame,extra=''){return `${tile}:${region}:${variant}:${frame}:${extra}`}











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

  




/* ===== MANRU v3.3 INPUT / MODAL CLEANUP =====
   Fixes Android ghost-click reopen, stacked long-press handlers, and game-input leakage while inspect is open.
*/
const U={blockUntil:0,longPresses:new Set(),inspectOpenedAt:0};
  const inputNow=()=>performance.now();
  const inspectWrap=()=>document.getElementById('mobileInspect');
  const inspectOpen=()=>!!interactionActive8('mobileInspect');
  const block=(ms=360)=>{U.blockUntil=Math.max(U.blockUntil,inputNow()+ms);touchStart=null;if(typeof VIS==='object')VIS.tapTrack=null};
  const blocked=()=>inputNow()<U.blockUntil;
  const cancelLongPresses=()=>{for(const c of [...U.longPresses]){try{c()}catch(error){ignoreError('a long-press cancel callback threw',error)}}U.longPresses.clear()};






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


  registerPanelHook54('combat-hud36',updateCH);

  /* ---------- action button motif ---------- */
  const hk={attack:'SPC',pickup:'G',open:'E',skill:'Q',inv:'I',rest:'R',summon0:'V',summon1:'T'},rn={attack:'칼',pickup:'줍',open:'점멸',skill:'무',inv:'행',rest:'숨',summon0:'',summon1:''};function adorn(){document.querySelectorAll('#mobileControls .quickbar button').forEach(b=>{if(b.dataset.mf36)return;b.dataset.mf36='1';const a=b.dataset.act||'';b.insertAdjacentHTML('beforeend',`<span class="mfKey">${hk[a]||''}</span><span class="mfRune">${rn[a]??'◆'}</span>`)})}adorn();

  /* ---------- inventory ---------- */
  
  
  
  
  // r34: superseded inventory renderer removed; canonical renderer is registered below.

  /* ---------- rich log ---------- */
  const meta=[];function cls(msg){if(/치명타|종결/.test(msg))return['crit','✦'];if(/→|격파|돌진|칼날|피했다|회피|끌어당/.test(msg))return['combat','칼'];if(/획득|전리품|금고|보급함|열쇠/.test(msg))return['loot','가방'];if(/중독|출혈|회복|FOCUS|HP|허기|보호막|LEVEL/.test(msg))return['status','기'];return['system','기록']};;// r54: dead pre-v49 panel wrapper removed.

  /* ---------- combat FX ---------- */
  const feed=document.createElement('div');feed.id='mfHitFeed';document.getElementById('canvasWrap')?.appendChild(feed);/* r25: obsolete pre-v5.4 attack forwarding wrapper removed; v5.4 is the registered combat core. */

  /* ---------- material separation ---------- */




/* ===== MANRU v3.7/3.8 SMART INTERACTION + FEATURE ROOMS + POTIONS ===== */






  function kitchen(r){for(let y=r.y+1;y<=r.y+r.h-2;y+=2){placeFeatureTile(r.x+1,y,TT.JAR);placeFeatureTile(r.x+r.w-2,y,TT.TABLE)}placeFeatureTile(r.cx,r.cy,TT.COOKPOT);placeFeatureTile(r.cx-2,r.cy,TT.TABLE);placeFeatureTile(r.cx+2,r.cy,TT.TABLE);sigil(r.x+1,r.cy,'주방')}

  function armoryRoom(r){placeFeatureTile(r.cx,r.cy,TT.ARMORY);for(let x=r.x+1;x<=r.x+r.w-2;x+=2)placeFeatureTile(x,r.y+1,TT.TABLE);for(let x=r.x+2;x<=r.x+r.w-3;x+=3)placeFeatureTile(x,r.y+r.h-2,TT.CACHE);sigil(r.x+1,r.y+1,'무기고')}




  registerGenerationStage('feature-rooms41','post',()=>{applyFeatureRooms();VisibilityService.compute();vfBuildDecor()});


  for(const p of POTIONS)if(!CONSUMABLES.some(x=>x.name===p.name))CONSUMABLES.push(p);window.MANRU_POTIONS=POTIONS;
  function pstate(){if(!state)return;state.tempFields=Array.isArray(state.tempFields)?state.tempFields:[];state.status=state.status||{};for(const q of['swift','fortify','willBoost'])if(!Number.isFinite(state.status[q]))state.status[q]=0}
  function pcolor(i){return i?.color||'#b65b4c'}
  const ph=document.createElement('div');ph.id='potionTargetHud';ph.innerHTML='<div><b id="potionTargetName">약병 투척</b><span id="potionTargetDesc">사거리 4칸 · 목표 칸을 터치/클릭</span></div><button id="potionTargetCancel">취소</button>';document.body.appendChild(ph);let potionTarget=null;
ph.querySelector('#potionTargetCancel').onclick=e=>{e.preventDefault();e.stopPropagation();InputRouter.dispatch({type:'TARGET_CANCEL',source:'target-hud'})};
  registerPlayerStatStage55('potions41',s=>{if(state?.status?.swift>0)s.eva+=10;if(state?.status?.fortify>0)s.def+=3;if(state?.status?.willBoost>0)s.will+=2;return s});registerAttackCostStage55('potions41',(c,item)=>state?.status?.swift>0?clamp(c*.8,.45,1.8):c);registerMoveCostStage55('potions41',c=>state?.status?.swift>0?clamp(c*.8,.55,1.15):c);
  /* r58 debuff overhaul: potion buffs are read by the canonical statusSummary; no status wrapper here. */
  

  function drink(item){const p=state.player;pstate();const recovery=['heal_small','heal_medium'].includes(item.potionKind);if(recovery){if(!applyRecoveryPotion57(p,item))return false;}else switch(item.potionKind){case'makgeolli':{const turns=Math.max(1,Math.floor(item.drunkTurns57||8));state.status.drunk=Math.max(state.status.drunk||0,turns+1);state.makgeolliRecoveryTurns57=state.status.drunk;state.drunkBornTurn57=state.turn+1;state.makgeolliHealHundredths57=0;addLog(`${item.name}: 취함 ${turns}턴 · 매턴 지속 회복. 취기는 중첩되지 않고 남은 시간을 ${turns}턴까지 새로 고친다.`);break}case'focus':{const b=p.focus;p.focus=Math.min(getStats().maxFocus,p.focus+20);state.status.willBoost=Math.max(state.status.willBoost,6);addLog(`${item.name}: 기력 +${p.focus-b} · WILL 강화.`);break}case'cleanse':{const b=p.hp,h=Math.max(4,Math.ceil(p.maxHp*.12));p.hp=Math.min(p.maxHp,p.hp+h);state.status.illness=0;state.status.poison=0;state.status.bleed=0;state.status.weaken=0;state.status.upset=0;addLog(`${item.name}: 독·출혈·약화·배탈 해제 · HP +${displayNumber53(Math.round(p.hp-b))}.`);break}case'swift':state.status.swift=Math.max(state.status.swift,7);addLog(`${item.name}: 6턴 신속.`);break;case'fortify':state.status.fortify=Math.max(state.status.fortify,9);addLog(`${item.name}: 8턴 DEF 강화.`);break;default:return false}burst(p.x,p.y,pcolor(item),12,.75);if(!recovery)consumeRef(item);closeInventory();globalThis.__MANRU_TURN_ENGINE__.advance({handled:true,committed:true,timeCost:item.useCost||.8,reason:"drink"}).value;return true}
  function throwAt(tx,ty){const act=playerAction57('target',{uiOwner:'potionTargetHud'});if(!act.ok)return false;if(!potionTarget||!state)return false;const item=potionTarget.item,r=potionTarget.range||4,p=state.player;if(!state.player.inventory.includes(item)){cancelTarget(true);return false}if(tx<0||ty<0||tx>=COLS||ty>=ROWS||entityDistance57({x:tx,y:ty},p)>r){toast(`사거리 ${r}칸 밖이다.`);return false}if(!state.seen.has(k(tx,ty))){toast('보지 못한 곳이다.');return false}if(!lineClear(p.x,p.y,tx,ty)){toast('던질 경로가 막혔다.');return false}if(state.floor>=11)alertNearby(tx,ty,item.throwElement105?4:item.potionKind==='smoke'?6:8,item.throwElement105||item.potionKind==='smoke'?'projectile':'explosion');projectileFX(p.x,p.y,tx,ty,pcolor(item));burst(tx,ty,pcolor(item),18,1);if(item.throwElement105==='water'||item.throwElement105==='ice'){emitElementContact105(item.throwElement105,elementCells105(tx,ty,1),effectSource57(p));addLog(`${item.name}: 주변 3×3에 ${item.throwElement105==='water'?'물기운':'냉기'}가 퍼졌다.`)}else if(item.potionKind==='smoke'){addField('smoke',tx,ty,6);addLog(`${item.name}: 3×3 연막 5턴.`)}else{const m=findMonsterAt(tx,ty),observed=isEntityObservableToPlayer57(m),direct=isThreatVisibleToPlayer(m)?m:null;if(observed&&m&&!isHostileTarget57(m)){toast('아군에게 공격용 약병을 던질 수 없다.');return false}if(direct){markCombatActivity57('potion-throw');if(globalThis.__MANRU_ASURA61__?.blocksDirect?.(direct,p)){floatText(tx,ty,'영역 밖 무효','#d7b16e',10);addLog(`${direct.name}의 아수라장이 투척 직격을 지웠다.`)}else{const dealt=damageEntity(direct,6,state.player,'fire');if(dealt>0){dojoRememberHit(direct,'area');floatText(tx,ty,'-'+dealt,'#ff9d5c',14,'fire');}if(direct.hp<=0)killMonster(direct)}}addField('fire',tx,ty,5);addLog(`${item.name}: 3×3 화염 4턴.`)}consumeRef(item);cancelTarget(true);globalThis.__MANRU_TURN_ENGINE__.advance({handled:true,committed:true,timeCost:item.useCost||1,reason:"throwAt"}).value;return true}
  // r30: potion dispatch is integrated in canonical useInventoryItem.
   // r34: obsolete potion-tab render wrapper removed.
  /* R7 refactor: obsolete early potion visual wrapper removed. */
  
function rewardRooms(){for(const fr of state?.featureRooms||[]){if(fr.name==='연금술방'){addP(fr,['소회복 비약','중회복 비약','청심탕','해독산']);addP(fr,['경신약','강골주','연막병','화유병','청심탕'])}else if(fr.name==='사당')addP(fr,['청심탕','해독산','강골주']);else if(fr.name==='무기고'&&globalThis.__MANRU_RANDOM57__()<.82)addP(fr,['연막병','화유병','강골주']);else if(fr.name==='감방'&&globalThis.__MANRU_RANDOM57__()<.68)addP(fr,['중회복 비약','강골주','연막병']);else if(fr.name==='주방'&&globalThis.__MANRU_RANDOM57__()<.42)addP(fr,['소회복 비약','해독산'])}}
  registerGenerationStage('potions41','post',()=>{pstate();state.tempFields=[];rewardRooms()});  
  globalThis.__MANRU_POTION41_ACTIONS__=Object.freeze({drink,beginTarget,cancelTarget,throwAt,target:()=>potionTarget?{item:potionTarget.item,range:potionTarget.range}:null});
  
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





  
  const interior=(r,x,y)=>x>=r.x+2&&y>=r.y+2&&x<=r.x+r.w-3&&y<=r.y+r.h-3;
  const put=(r,x,y,t)=>{if(!interior(r,x,y))return false;if((x===state.player.x&&y===state.player.y)||(x===state.stairs.x&&y===state.stairs.y))return false;setTerrainTile58(state.map,x,y,t);return true};
  const clear=(r)=>{for(let y=r.y+2;y<=r.y+r.h-3;y++)for(let x=r.x+2;x<=r.x+r.w-3;x++)put(r,x,y,TT.FLOOR)};
  const hline=(r,y,x0,x1,t)=>{for(let x=x0;x<=x1;x++)put(r,x,y,t)};
  const vline=(r,x,y0,y1,t)=>{for(let y=y0;y<=y1;y++)put(r,x,y,t)};
  const tag=(x,y,label)=>{state.routeTags=state.routeTags||[];state.routeTags.push({x,y,label})};

  function sculptFeature(r){
    if(r.w<9||r.h<8)return;
    const cx=r.x+Math.floor(r.w/2),cy=r.y+Math.floor(r.h/2);clear(r);
    if(r.name==='연금술방'){
      for(let y=r.y+2;y<=cy-2;y++){put(r,cx-4,y,TT.WALL);put(r,cx+4,y,TT.WALL)}
      put(r,cx-4,cy-2,TT.DOOR);put(r,cx+4,cy-2,TT.DOOR);hline(r,cy-2,cx-3,cx+3,TT.TABLE);put(r,cx,cy-2,TT.COOKPOT);
      for(const [x,y] of [[cx-3,cy+1],[cx+3,cy+1],[cx-2,r.y+3],[cx+2,r.y+3]])put(r,x,y,TT.JAR);
      put(r,cx,cy+2,TT.FLOOR);put(r,cx-2,cy+2,TT.BRAZIER);put(r,cx+2,cy+2,TT.CACHE);tag(cx,cy+2,'연금술방');
    }else if(r.name==='주방'){
      hline(r,r.y+2,r.x+2,r.x+r.w-3,TT.TABLE);vline(r,r.x+2,r.y+3,r.y+r.h-4,TT.TABLE);vline(r,r.x+r.w-3,r.y+3,r.y+r.h-4,TT.TABLE);
      put(r,cx,r.y+2,TT.COOKPOT);put(r,cx-2,cy,TT.JAR);put(r,cx+2,cy,TT.JAR);put(r,cx,cy,TT.FLOOR);tag(cx,cy,'주방');
    }else if(r.name==='사당'){
      for(let y=cy-2;y<=cy+2;y++)for(let x=cx-2;x<=cx+2;x++)if(x===cx||y===cy)put(r,x,y,TT.GOLD);
      hline(r,r.y+2,cx-3,cx+3,TT.SCREEN);put(r,cx,r.y+2,TT.FLOOR);put(r,cx,cy,TT.ALTAR);for(const [x,y] of [[cx-2,cy-2],[cx+2,cy-2],[cx-2,cy+2],[cx+2,cy+2]])put(r,x,y,TT.BRAZIER);put(r,cx,cy+3,TT.FLOOR);tag(cx,cy+3,'사당');
    }else if(r.name==='무기고'){
      for(let y=r.y+2;y<=r.y+r.h-3;y++){if(y===cy)continue;put(r,cx-3,y,TT.SCREEN);put(r,cx+3,y,TT.SCREEN)}put(r,cx-3,cy,TT.DOOR);put(r,cx+3,cy,TT.DOOR);
      vline(r,cx-1,r.y+3,r.y+r.h-4,TT.TABLE);vline(r,cx+1,r.y+3,r.y+r.h-4,TT.TABLE);put(r,cx,cy,TT.ARMORY);put(r,cx-4,cy,TT.CACHE);put(r,cx+4,cy,TT.CACHE);put(r,cx,r.y+r.h-3,TT.FLOOR);tag(cx,r.y+r.h-3,'무기고');
    }else if(r.name==='서고'){
      let flip=false;for(let y=r.y+3;y<=r.y+r.h-4;y+=2){for(let x=r.x+2;x<=r.x+r.w-3;x++){const gap=flip?r.x+3:r.x+r.w-4;if(Math.abs(x-gap)<=1)continue;put(r,x,y,TT.SCREEN)}flip=!flip}put(r,cx,cy,TT.RUMOR);put(r,cx-2,cy,TT.TABLE);put(r,cx+2,cy,TT.MIRROR);put(r,r.x+2,r.y+2,TT.FLOOR);tag(r.x+2,r.y+2,'서고');
    }else if(r.name==='감방'){
      const lx=cx-2,rx=cx+2;vline(r,lx,r.y+2,r.y+r.h-3,TT.WALL);vline(r,rx,r.y+2,r.y+r.h-3,TT.WALL);for(const yy of [cy-2,cy+2]){put(r,lx,yy,TT.DOOR);put(r,rx,yy,TT.DOOR)}put(r,cx,cy,TT.FLOOR);put(r,cx-4,cy-2,TT.SNARE);put(r,cx+4,cy+2,TT.JAR);put(r,cx-4,cy+2,TT.CACHE);tag(cx,cy,'감방');
    }
  }
  function reshapeRooms(){
    if(!state||state.specialFloor)return;
    const protectedRooms=new Set((state.featureRooms||[]).map(f=>`${f.x},${f.y},${f.w},${f.h}`));
    for(const r of state.rooms||[]){
      if(r.w<8||r.h<7||protectedRooms.has(`${r.x},${r.y},${r.w},${r.h}`))continue;
      if(state.player.x>=r.x&&state.player.x<r.x+r.w&&state.player.y>=r.y&&state.player.y<r.y+r.h)continue;
      if(state.stairs.x>=r.x&&state.stairs.x<r.x+r.w&&state.stairs.y>=r.y&&state.stairs.y<r.y+r.h)continue;
      const mode=Math.floor(hash2(r.x,r.y,7100+state.floor*31)*5);
      if(mode===0){for(const [x,y] of [[r.x+1,r.y+1],[r.x+2,r.y+1],[r.x+1,r.y+2],[r.x+r.w-2,r.y+1],[r.x+r.w-3,r.y+1],[r.x+r.w-2,r.y+2]])setTerrainTile58(state.map,x,y,TT.WALL)}
      else if(mode===1&&r.w>=10){for(let y=r.y+2;y<r.y+r.h-2;y++){if(Math.abs(y-r.cy)<=1)continue;setTerrainTile58(state.map,r.cx-3,y,TT.WALL);setTerrainTile58(state.map,r.cx+3,y,TT.WALL)}}
      else if(mode===2&&r.h>=9){for(let x=r.x+2;x<r.x+r.w-2;x++){if(Math.abs(x-r.cx)<=2)continue;if((x-r.x)%2===0)setTerrainTile58(state.map,x,r.y+2,TT.WALL)}}
    }
  }
  function fixEntities(){for(const it of state.items||[])if(tileBlocks(state.map[it.y]?.[it.x])){const p=PlacementService.randomFloor(0);it.x=p.x;it.y=p.y}for(const m of state.monsters||[])if(m.hp>0&&!PlacementService.monsterCanStand(m,m.x,m.y)){const p=PlacementService.randomMonsterCell(m)||PlacementService.randomFloor(0);m.x=p.x;m.y=p.y}}

  registerGenerationStage('room-sculpt42','post',()=>{reshapeRooms();for(const fr of state.featureRooms||[])sculptFeature(fr);fixEntities();ensureNormalConnectivity();VisibilityService.compute();vfBuildDecor()});






/* ===== MANRU v4.3 VISUAL-COMPARE REFINEMENT ===== */
const inside43=(r,x,y)=>x>=r.x+1&&y>=r.y+1&&x<=r.x+r.w-2&&y<=r.y+r.h-2;
  const put43=(r,x,y,t)=>{if(!inside43(r,x,y))return false;if((x===state.player.x&&y===state.player.y)||(x===state.stairs.x&&y===state.stairs.y))return false;setTerrainTile58(state.map,x,y,t);return true};
  const clear43=r=>{for(let y=r.y+1;y<=r.y+r.h-2;y++)for(let x=r.x+1;x<=r.x+r.w-2;x++)put43(r,x,y,TT.FLOOR)};
  const h43=(r,y,a,b,t)=>{for(let x=a;x<=b;x++)put43(r,x,y,t)};
  const v43=(r,x,a,b,t)=>{for(let y=a;y<=b;y++)put43(r,x,y,t)};

  function sculptSmallFeature43(r){
    if(r.w<7||r.h<7)return;
    const cx=r.x+Math.floor(r.w/2),cy=r.y+Math.floor(r.h/2),left=r.x+2,right=r.x+r.w-3,top=r.y+2,bottom=r.y+r.h-3;
    clear43(r);
    if(r.name==='연금술방'){
      // central mixing bar, reagent alcoves and ritual ring
      h43(r,cy-1,left,right,TT.TABLE);put43(r,cx,cy-1,TT.COOKPOT);
      if(r.w>=8){v43(r,left,top,cy-2,TT.WALL);v43(r,right,top,cy-2,TT.WALL);put43(r,left,cy-2,TT.DOOR);put43(r,right,cy-2,TT.DOOR)}
      put43(r,left,cy+1,TT.JAR);put43(r,right,cy+1,TT.JAR);put43(r,cx-1,bottom,TT.BRAZIER);put43(r,cx+1,bottom,TT.CACHE);put43(r,cx,cy+1,TT.FLOOR);
    }else if(r.name==='주방'){
      h43(r,top,left,right,TT.TABLE);v43(r,left,top+1,bottom,TT.TABLE);v43(r,right,top+1,bottom,TT.TABLE);put43(r,cx,top,TT.COOKPOT);put43(r,cx-1,cy,TT.JAR);put43(r,cx+1,cy,TT.JAR);put43(r,cx,bottom,TT.FLOOR);
    }else if(r.name==='사당'){
      for(let y=cy-2;y<=cy+2;y++)for(let x=cx-2;x<=cx+2;x++)if(inside43(r,x,y)&&(x===cx||y===cy))put43(r,x,y,TT.GOLD);
      h43(r,top,Math.max(left,cx-2),Math.min(right,cx+2),TT.SCREEN);put43(r,cx,top,TT.FLOOR);put43(r,cx,cy,TT.ALTAR);for(const [x,y] of [[cx-1,cy-1],[cx+1,cy-1],[cx-1,cy+1],[cx+1,cy+1]])put43(r,x,y,TT.BRAZIER);put43(r,cx,bottom,TT.FLOOR);
    }else if(r.name==='무기고'){
      v43(r,left,top,bottom,TT.SCREEN);v43(r,right,top,bottom,TT.SCREEN);put43(r,left,cy,TT.DOOR);put43(r,right,cy,TT.DOOR);if(cx-1>left)v43(r,cx-1,top+1,bottom-1,TT.TABLE);if(cx+1<right)v43(r,cx+1,top+1,bottom-1,TT.TABLE);put43(r,cx,cy,TT.ARMORY);put43(r,cx,bottom,TT.FLOOR);
    }else if(r.name==='서고'){
      let flip=0;for(let y=top;y<=bottom;y+=2){const gap=flip?left:right;for(let x=left;x<=right;x++)if(Math.abs(x-gap)>1)put43(r,x,y,TT.SCREEN);flip^=1}put43(r,cx,cy,TT.RUMOR);put43(r,cx-1,cy,TT.TABLE);put43(r,cx+1,cy,TT.MIRROR);put43(r,left,top,TT.FLOOR);
    }else if(r.name==='감방'){
      const lx=Math.max(left,cx-2),rx=Math.min(right,cx+2);v43(r,lx,top,bottom,TT.WALL);v43(r,rx,top,bottom,TT.WALL);for(const yy of [cy-1,cy+1]){put43(r,lx,yy,TT.DOOR);put43(r,rx,yy,TT.DOOR)}put43(r,cx,cy,TT.FLOOR);if(left<lx)put43(r,left,cy-1,TT.SNARE);if(right>rx)put43(r,right,cy+1,TT.JAR);
    }
  }

  function repair43(){
    for(const it of state.items||[])if(tileBlocks(state.map[it.y]?.[it.x])){const p=PlacementService.randomFloor(0);it.x=p.x;it.y=p.y}
    for(const mon of state.monsters||[])if(mon.hp>0&&!PlacementService.monsterCanStand(mon,mon.x,mon.y)){const p=PlacementService.randomMonsterCell(mon)||PlacementService.randomFloor(0);mon.x=p.x;mon.y=p.y}
    ensureNormalConnectivity();VisibilityService.compute();vfBuildDecor();
  }
  registerGenerationStage('organic-nooks43','post',()=>{organicNooks43();for(const fr of state.featureRooms||[])sculptSmallFeature43(fr);repair43()});


  // test helper exists only with #debug and lets us inspect special-room art without changing normal play.
  if(location.hash.includes('debug')&&window.__MANRU_DEBUG__){
    window.__MANRU_DEBUG__.teleportFeature=(i=0)=>{const f=state?.featureRooms?.[i];if(!f)return null;state.player.x=f.x+Math.floor(f.w/2);state.player.y=f.y+Math.floor(f.h/2);resetVisualState();VisibilityService.compute();updateAll();return f.name};
  }


/* ===== MANRU v4.4 stronger 2.5D architecture + room structure pass ===== */
const inRoom44=(r,x,y)=>x>=r.x+1&&y>=r.y+1&&x<=r.x+r.w-2&&y<=r.y+r.h-2;
  const safePut44=(r,x,y,t)=>{if(!inRoom44(r,x,y))return false;if((x===state.player.x&&y===state.player.y)||(x===state.stairs.x&&y===state.stairs.y))return false;setTerrainTile58(state.map,x,y,t);return true};
  
  const v44=(r,x,a,b,t)=>{for(let y=a;y<=b;y++)safePut44(r,x,y,t)};

  function structuralOrdinaryRooms44(){
    if(!state||state.specialFloor)return;
    const featureKeys=new Set((state.featureRooms||[]).map(r=>`${r.x},${r.y},${r.w},${r.h}`));
    for(const r of state.rooms||[]){
      if(r.w<7||r.h<7||featureKeys.has(`${r.x},${r.y},${r.w},${r.h}`)) continue;
      if((state.player.x>=r.x&&state.player.x<r.x+r.w&&state.player.y>=r.y&&state.player.y<r.y+r.h)||(state.stairs.x>=r.x&&state.stairs.x<r.x+r.w&&state.stairs.y>=r.y&&state.stairs.y<r.y+r.h)) continue;
      const cx=r.x+Math.floor(r.w/2), cy=r.y+Math.floor(r.h/2);
      const mode=Math.floor(hash2(r.x*3,r.y*5,9900+state.floor*17)*6);
      if(mode===0){ // four corner buttresses -> hall feel
        for(const [x,y] of [[r.x+1,r.y+1],[r.x+r.w-2,r.y+1],[r.x+1,r.y+r.h-2],[r.x+r.w-2,r.y+r.h-2]]) setTerrainTile58(state.map,x,y,TT.WALL);
        if(r.w>=10){setTerrainTile58(state.map,r.x+2,cy,TT.WALL);setTerrainTile58(state.map,r.x+r.w-3,cy,TT.WALL);}
      }else if(mode===1 && r.w>=9){ // side alcove pair
        const y1=r.y+2,y2=r.y+r.h-3;
        for(let x=r.x+2;x<=r.x+r.w-3;x++) if(Math.abs(x-cx)>1){setTerrainTile58(state.map,x,y1,TT.WALL); if(r.h>=9) setTerrainTile58(state.map,x,y2,TT.WALL);}
        setTerrainTile58(state.map,cx,y1,TT.DOOR); if(r.h>=9) setTerrainTile58(state.map,cx,y2,TT.DOOR);
      }else if(mode===2 && r.h>=9){ // split room with crossing doorway
        v44(r,cx,r.y+2,r.y+r.h-3,TT.WALL); setTerrainTile58(state.map,cx,cy,TT.DOOR);
        if(r.w>=10){setTerrainTile58(state.map,cx-2,cy-2,TT.WALL);setTerrainTile58(state.map,cx+2,cy+2,TT.WALL);}
      }else if(mode===3 && r.w>=10 && r.h>=8){ // shallow stage or dais
        const y=r.y+2; for(let x=r.x+2;x<=r.x+r.w-3;x++) if(Math.abs(x-cx)>2) setTerrainTile58(state.map,x,y,TT.WALL); 
        if(r.h>=9){ setTerrainTile58(state.map,cx-1,y+1,TT.GOLD); setTerrainTile58(state.map,cx,y+1,TT.GOLD); setTerrainTile58(state.map,cx+1,y+1,TT.GOLD); }
      }else if(mode===4 && r.w>=9){ // twin aisle pillars
        for(let y=r.y+2;y<=r.y+r.h-3;y+=2){ setTerrainTile58(state.map,cx-2,y,TT.WALL); setTerrainTile58(state.map,cx+2,y,TT.WALL); }
      }else if(mode===5 && r.w>=9 && r.h>=8){ // skewed nook / service corridor
        for(let y=r.y+2;y<=r.y+r.h-4;y++) setTerrainTile58(state.map,r.x+2,y,TT.WALL);
        setTerrainTile58(state.map,r.x+2,cy,TT.DOOR); if(r.w>=11) for(let x=cx+1;x<=r.x+r.w-3;x++) setTerrainTile58(state.map,x,r.y+2,TT.WALL);
      }
    }
  }

  function repair44(){
    for(const it of state.items||[]) if(tileBlocks(state.map[it.y]?.[it.x])){ const p=PlacementService.randomFloor(0); it.x=p.x; it.y=p.y; }
    for(const mon of state.monsters||[]) if(mon.hp>0 && !PlacementService.monsterCanStand(mon,mon.x,mon.y)){ const p=PlacementService.randomMonsterCell(mon)||PlacementService.randomFloor(0); mon.x=p.x; mon.y=p.y; }
    ensureNormalConnectivity(); VisibilityService.compute(); vfBuildDecor();
  }

  registerGenerationStage('room-structure44','post',()=>{structuralOrdinaryRooms44();repair44()});

/* ===== MANRU v4.5 MOBILE UX / INPUT / PERFORMANCE OVERHAUL ===== */
const UX={
    paused:null,autoMeta:null,modalOpening:false,modalDirty:false,
    closeBlockUntil:0,invEquipSlot:null,lastMiniAt:0,lastMiniTurn:-1,
    invScrollByTab:Object.create(null)
  };RuntimeState.ui.inventory=UX;
  const now=()=>performance.now();



  const uiBlocking=()=>activeGameplayPanels57().length>0;
  const viewerOpen=()=>!!(inventoryOpen||helpOpen||martialOpen||isDrawerOpen()||isInspectOpen()||isMapOpen());
  const blockTap=(ms=180)=>UX.closeBlockUntil=Math.max(UX.closeBlockUntil,now()+ms);
  






  function beginViewer45(){UX.modalOpening=true;pauseAutoForUI();UX.invEquipSlot=null}




  replaceViewerQuickButton('inv',()=>toggleInventory());
  replaceViewerQuickButton('skill',()=>useClassSkill());

  // mark real inventory / martial actions so closing the UI does not unexpectedly resume movement.
  // r30: modal-dirty item-use bookkeeping is integrated in canonical useInventoryItem.
  // r57: inventory/martial dirty state is set by the canonical action bodies.

  function uxType(item){return item?.mineItem105==='stone'?'투척 도구':item?.type==='potion'?'비약 / 약병':itemTypeLabel(item?.type||'')}
  function uxStats(item){
    const a=[];if(!item)return a;
    if(item.atk)a.push(`ATK +${displayNumber53(item.atk)}`);if(item.def)a.push(`DEF ${item.def>0?'+':''}${displayDef42(item.def)}`);if(item.eva)a.push(`EVA ${item.eva>0?'+':''}${item.eva}`);if(item.will)a.push(`WILL +${item.will}`);if(item.vision)a.push(`VIS ${item.vision>0?'+':''}${item.vision}`);if(item.speed)a.push(`속도 ${item.speed}×`);if(item.range)a.push(`사거리 ${item.range}`);if(item.hunger)a.push(`허기력 +${item.hunger}`);if(item.heal)a.push(`HP +${item.heal}`);if(item.focusGain)a.push(`기력 +${item.focusGain}`);return a;
  }
  function uxIcon(item,cls=''){try{return vfIconHtml(item,cls)}catch(_){return `<span>${itemGlyph(item)}</span>`}}
  function equipData(){const p=state.player;return[['weapon','무기',p.weapon,'검'],['armor','갑옷',p.armor,'갑'],['cloak','망토',p.cloak,'망'],['relic','유물',p.relic,'유'],['trinket','장신구',p.trinket,'장']]}
  function tabCount(kind){
    const inv=state.player.inventory;if(kind==='all')return inv.length;if(kind==='gear')return inv.filter(i=>['weapon','armor','cloak'].includes(i.type)).length;if(kind==='food')return inv.filter(i=>i.type==='food').length;if(kind==='treasure')return inv.filter(i=>['relic','trinket'].includes(i.type)).length;if(kind==='potion')return inv.filter(i=>i.type==='potion').length;return 0;
  }



  function restoreInventoryScroll45(grid,tab=inventoryTab){
    if(!grid)return;
    const top=Math.max(0,UX.invScrollByTab[tab]||0);
    grid.scrollTop=top;
    grid.addEventListener('scroll',()=>{UX.invScrollByTab[tab]=Math.max(0,grid.scrollTop||0)},{passive:true});
  }

  // replace the accumulated inventory implementations with one thumb-friendly renderer.
  registerInventoryRenderR34('ux45-core','core',function inventoryCoreUX45(){
    if(!inventoryOpen||!state)return;
    const box=document.getElementById('inventory'),p=state.player;if(!box)return;
    let filtered=inventoryFiltered();
    if(!UX.invEquipSlot && filtered.length && !filtered.some(v=>v.idx===inventorySelection)){inventorySelection=filtered[0].idx}
    if(!filtered.length && !UX.invEquipSlot)inventorySelection=-1;
    const selected=UX.invEquipSlot?p[UX.invEquipSlot]:(inventorySelection>=0?p.inventory[inventorySelection]:null);
    const tabs=[['all','전체'],['gear','장비'],['food','음식'],['treasure','유물'],['potion','비약']];
    const equips=equipData().map(([slot,label,item,rune])=>`<button class="uxEq ${item?'':'empty'} ${UX.invEquipSlot===slot?'selected':''}" data-uxeq="${slot}">${item?uxIcon(item,'uxEqIcon'):''}<span class="ek">${label}</span><span class="en">${item?item.name:'비어 있음'}</span><span class="er">${rune}</span></button>`).join('');
    const cells=filtered.length?filtered.map(({item,idx})=>`<button class="uxSlot ${!UX.invEquipSlot&&idx===inventorySelection?'selected':''}" data-invslot="${idx}" data-rarity="${item.rarity||'common'}"><span class="tier">${item.tier?`T${item.tier}`:''}</span><span class="rar"></span>${uxIcon(item,'uxSlotIcon')}<span class="nm">${item.name}</span>${(item.count||1)>1?`<span class="count">×${item.count}</span>`:''}</button>`).join(''):`<div class="uxEmpty"><b>${p.inventory.length?'이 분류는 비어 있음':'행낭이 비어 있음'}</b><p>${p.inventory.length?'다른 분류를 보거나 전체 목록으로 돌아가면 된다.':'바닥의 물품은 줍 버튼이나 아이템 칸 터치로 바로 주울 수 있다.'}</p>${p.inventory.length&&inventoryTab!=='all'?'<button id="uxShowAll">전체 보기</button>':''}</div>`;
    box.innerHTML=`<div class="uxInv"><span class="uiCorners63" aria-hidden="true"></span><div class="uxInvHead"><div class="uxTitle"><h2>행낭</h2><small>한 번 눌러 선택 · 아래 큰 버튼으로 사용/장착</small></div><div class="uxInvMeta"><span><b>${p.inventory.length}</b> / ${inventoryCapacity()}</span><span class="turn">TURN ${state.turn}</span></div><button class="uxClose" id="invCloseBtn" aria-label="닫기">×</button></div><div class="uxEquipRail">${equips}</div><div class="uxTabs">${tabs.map(([id,lab])=>`<button class="${inventoryTab===id?'active':''}" data-invtab="${id}">${lab}<span>${tabCount(id)}</span></button>`).join('')}</div><div class="uxInvMain"><div class="uxGrid" id="uxGrid">${cells}</div>${selected?detailHTML(selected,inventorySelection,UX.invEquipSlot):''}</div></div>`;
    restoreInventoryScroll45(box.querySelector('#uxGrid'));
    const closeBtn=box.querySelector('#invCloseBtn');if(closeBtn){const finishClose=e=>{e?.preventDefault?.();e?.stopPropagation?.();e?.stopImmediatePropagation?.();blockTap(260);if(inventoryOpen)closeInventory()};closeBtn.ontouchend=finishClose;closeBtn.onpointerup=finishClose;closeBtn.onclick=finishClose;}
    box.querySelector('#uxShowAll')?.addEventListener('click',()=>{rememberInventoryScroll();inventoryTab='all';UX.invEquipSlot=null;const a=inventoryFiltered();inventorySelection=a.length?a[0].idx:-1;renderInventory()});
    box.querySelectorAll('[data-invtab]').forEach(b=>b.addEventListener('click',()=>{rememberInventoryScroll();inventoryTab=b.dataset.invtab;UX.invEquipSlot=null;const f=inventoryFiltered();inventorySelection=f.length?f[0].idx:-1;renderInventory()}));
    box.querySelectorAll('[data-invslot]').forEach(b=>b.addEventListener('click',()=>{rememberInventoryScroll();UX.invEquipSlot=null;inventorySelection=+b.dataset.invslot;renderInventory()}));
    box.querySelectorAll('[data-uxeq]').forEach(b=>b.addEventListener('click',()=>{const slot=b.dataset.uxeq;if(!p[slot])return;rememberInventoryScroll();UX.invEquipSlot=slot;inventorySelection=-1;renderInventory()}));
    box.querySelectorAll('[data-bookmaterial105]').forEach(b=>b.addEventListener('click',()=>{summonState();const book=p.inventory[+b.dataset.bookindex105];if(book?.summonItem105==='book')summonOpenMaterials(book.summonBookId105,b.dataset.bookmaterial105);}));
    box.querySelectorAll('[data-invuse]').forEach(b=>b.addEventListener('click',()=>ActionDispatcher.dispatch({type:'ITEM_USE',args:[+b.dataset.invuse]}).value));
    box.querySelectorAll('[data-invdrop]').forEach(b=>b.addEventListener('click',()=>ActionDispatcher.dispatch({type:'ITEM_DROP',args:[+b.dataset.invdrop]}).value));
    box.querySelectorAll('[data-invinspect]').forEach(b=>b.addEventListener('click',()=>{const it=p.inventory[+b.dataset.invinspect];if(it)showInspect(it.name,`${itemSummary(it)}<br><span style="color:#a79374">${it.desc||''}</span>`)}));
    box.querySelectorAll('[data-uxinspectequip]').forEach(b=>b.addEventListener('click',()=>{const it=p[b.dataset.uxinspectequip];if(it)showInspect(it.name,`${itemSummary(it)}<br><span style="color:#a79374">${it.desc||''}</span>`)}));
    box.querySelectorAll('[data-uxunequip]').forEach(b=>b.addEventListener('click',()=>{return ActionDispatcher.dispatch({type:'UNEQUIP',args:[p,b.dataset.uxunequip],source:'inventory'}).value}));
    box.querySelectorAll('[data-uxdrop-equip]').forEach(b=>b.addEventListener('click',()=>{return ActionDispatcher.dispatch({type:'DROP_EQUIPPED',args:[p,b.dataset.uxdropEquip],source:'inventory'}).value}));
  });

  function unequipAction5(p,slot){const act=playerAction57('unequip',{allowInventory:true,closeInventory:true,stunMessage:'몸이 굳어 장비를 해제하지 못했다.'});if(!act.ok)return;const it=p[slot];if(!it)return;if(p.inventory.length>=inventoryCapacity()&&it.branchEffect105!=='capacity'){toast('행낭이 가득 찼다.');return}UX.modalDirty=true;UX.paused=null;p[slot]=null;branchInventoryOverflow();addInventoryItem(it);globalThis.__MANRU_LEGEND47__?.syncEquip?.();addLog(`${it.name} 해제.`);UX.invEquipSlot=null;inventorySelection=p.inventory.length-1;renderInventory();commitPlayerAction57(act,1)}
  ActionDispatcher.register('UNEQUIP',unequipAction5);
  function dropEquippedAction5(p,slot){const act=playerAction57('dropEquipped',{allowInventory:true,closeInventory:true,stunMessage:'몸이 굳어 장비를 내려놓지 못했다.'});if(!act.ok)return;const it=p[slot];if(!it)return;UX.modalDirty=true;UX.paused=null;p[slot]=null;branchInventoryOverflow();PlacementService.placeItem({...it,x:p.x,y:p.y});globalThis.__MANRU_LEGEND47__?.syncEquip?.();addLog(`${it.name}을 바닥에 놓았다.`);UX.invEquipSlot=null;renderInventory();commitPlayerAction57(act,1)}
  ActionDispatcher.register('DROP_EQUIPPED',dropEquippedAction5);
  // don't rebuild a full-screen bag DOM when the bag is closed (pickup used to do this every time).
  registerPickupStageR25('closed-bag-dom45',{post:()=>{if(!inventoryOpen){const box=document.getElementById('inventory');if(box)box.innerHTML=''}}});

  // relaxed auto-move: explicit destination doesn't abort just because an already-known enemy or incidental item exists.
  


  // mobile drawer/map/inspect should block world controls but not eat their own buttons.
  registerMovePreR8(()=>!(uiBlocking()&&!UX.modalOpening));
  /* r8: attack input blocking is handled in attackInputBlockedR8; no basicAttack wrapper. */



  const swipeModalCancel45=()=>InputRouter.dispatch({type:'MODAL_CANCEL',source:'modal-swipe'});
  swipeClose(document.getElementById('inventory'),swipeModalCancel45);
  swipeClose(document.getElementById('mobileDrawer'),swipeModalCancel45);
  swipeClose(document.getElementById('mobileInspect'),swipeModalCancel45);
  swipeClose(document.getElementById('mobileMapModal'),swipeModalCancel45);

  // performance: stop rebuilding closed drawer, throttle minimap, and avoid rendering the hidden world behind full-screen panels.
  // r53: drawer visibility guard is canonical in renderMobileDrawer.
  // r54: superseded minimap throttle removed; the canonical function owns throttling.
  

  // remove the v3.8 double-update-per-turn path: integrate field/status tick into one endTurn render.
  function endTurnCore45(cost=1,turnOpts=null,turnResult){
    if(!state||state.dead||state.victory)return;
    const c=cost,playerAgency=turnOpts?.playerAgency!==false;
    state.playerAgencyTurns57=Number.isFinite(state.playerAgencyTurns57)?state.playerAgencyTurns57:0;
    if(playerAgency){state.playerAgencyTurns57++;if(state.status.illness>0&&--state.status.illness===0){addLog('중병의 유예가 끝났다.');die('중병');turnResult.aborted=true;turnResult.abortStage='illness';return}}
    state._turnAgencyCounted57=playerAgency;
    state.turn++;palaceAdvance(c);summonCleanup();summonUpdateButtons();turnResult.timeCost=c;turnResult.stageOrder.push('core:logical-turn');
    turnResult.stageOrder.push('core:regen');dojoBedTick();if(state.status.regen>0){state.player.hp=Math.min(state.player.maxHp,state.player.hp+1);state.status.regen--}
    turnResult.stageOrder.push('core:status');applyStatusTick();if(state.dead){turnResult.aborted=true;turnResult.abortStage='core:status';return}turnResult.stageOrder.push('core:hunger');hungerTick();if(state.dead){turnResult.aborted=true;turnResult.abortStage='core:hunger';return}
    tickBossArenaMist(playerAgency);if(state.dead){turnResult.aborted=true;return}
    turnResult.stageOrder.push('core:durations');for(const q of ['haste','weaken','evade','markCrit','poison','bleed','ward','upset','drunk','blind','skillSeal'])if(state.status[q]>0)state.status[q]--;
    turnResult.stageOrder.push('core:loot');pullNearbyLoot();turnResult.stageOrder.push('core:summon-escort');summonEscortTurn();turnResult.stageOrder.push('core:energy');turnResult.energyAdded=c;state.enemyEnergy=(state.enemyEnergy||0)+c;let acted=0;
    while(state.enemyEnergy>=1&&acted<3&&!state.dead&&!state.victory){state.enemyEnergy-=1;state.floorTurn++;turnResult.enemyRounds++;turnResult.stageOrder.push('core:rafts');updateRafts();turnResult.stageOrder.push('core:monsters');monsterTurn();if(!state.dead&&!state.victory){turnResult.stageOrder.push('core:allies');alliesTurn()}acted++}
    turnResult.stageOrder.push('core:stealth');if(playerAgency&&state.status.stealth>0&&(state.player.stealthBornAgency1005??-1)<state.playerAgencyTurns57)state.status.stealth--;
    turnResult.stageOrder.push('core:focus');recoverActorFocus105(state.player,state.turn);
    // potion fields / temporary potion buffs
    turnResult.stageOrder.push('core:fields');state.tempFields=Array.isArray(state.tempFields)?state.tempFields:[];state.status=state.status||{};
    if(!tickCombatFields57()){turnResult.aborted=true;turnResult.abortStage='core:fields';return}
    turnResult.stageOrder.push('core:potion-buffs');for(const q of ['swift','fortify','willBoost'])if(state.status[q]>0)state.status[q]--;
    turnResult.stageOrder.push('core:field-expiry');expireCombatFields();
    if(playerAgency&&state.player.classState?.aimPower>0){const cs=state.player.classState,agency=state.playerAgencyTurns57;if(agency>cs.aimBornAgency&&agency!==cs.aimMoveAgency&&agency!==cs.aimAttackAgency)setAimPower(cs.aimPower+1)}
    turnResult.stageOrder.push('core:body-power');if(playerAgency&&bodyPowerActive()){
      const cs=state.player.classState,agency=state.playerAgencyTurns57;
      if(agency>cs.powerBornAgencyTurn&&agency>cs.powerLastAgencyTurn){
        cs.powerLastAgencyTurn=agency;
        if(!state.dead)bodyPowerHeal(state.player);
        cs.powerTurns--;
        if(cs.powerTurns===0){
          const duration=cs.powerExhaustion??cs.powerTotal;cs.powerTotal=0;cs.powerExhaustion=0;
          applyHostileStatus('blind',duration,1);applyHostileStatus('upset',duration,1);
          burst(state.player.x,state.player.y,'#b89870',12,.5);floatText(state.player.x,state.player.y,'탈진','#d7ab85',15);
          addLog('괴력이 가셨다. 무리한 팽창의 반동으로 시야와 속이 무너진다.');
        }
      }
    }
    turnResult.stageOrder.push('core:mine');mineTick();if(state.floorTurn%8===0)retryPendingBranchEntrance105();
    turnResult.stageOrder.push('core:fov-render-request');VisibilityService.compute();updateAll();
  }
  const MANRU_TURN_ABORT=Symbol('MANRU_TURN_ABORT');


  RuntimeState.turn=TURN_AUDIT5;
  globalThis.__MANRU_TURN_ENGINE__=TurnEngine;
  globalThis.__MANRU_TURN_PIPELINE__={register:TurnEngine.register,abort:MANRU_TURN_ABORT};
  TurnEngine.register('monster-durations57',{post:()=>tickMonsterDurations()});
  TurnEngine.register('temporary-terrain57',{post:()=>RuntimeTerrainOwner.tick()});
  TurnEngine.register('jar-gas57',{post:()=>{tickJarGasFields();tickTerrainReactions105()}});

  document.body.classList.toggle('ux-modal-open',uiBlocking());
  globalThis.__MANRU_UX45_ACTIONS__=Object.freeze({beginViewer:beginViewer45,finishViewer:finishModalOpening,finishClose:finishViewerClose,markDirty:()=>{UX.modalDirty=true;UX.paused=null;return true},openInventory:()=>{openInventory();return true},closeInventory:()=>{closeInventory();return true}});




  P47.renderDpr=baseDpr();

  
  

  globalThis.__MANRU_TRANSIENT47__=Object.freeze({trim:trimTransient});
  globalThis.__MANRU_RENDER47__=Object.freeze({invalidate:()=>{P47.force=true;P47.cullKey='';return true}});
  
  
  // r54: superseded minimap throttle removed.
  // r54: dead pre-v49 panel trim wrapper removed.
  /* removed overwritten updateAll */
  /* removed overwritten visualLoop */



  /* ---------- item ecology + long-term upgrade choice ---------- */
  const role47=i=>{if(!i)return'other';if(['weapon','armor','cloak'].includes(i.type))return'gear';if(['relic','trinket'].includes(i.type))return'relic';if(i.type==='upgrade'||i.type==='martial_manual')return'strategy';if(i.type==='food')return'recovery';if(i.type==='potion')return ['heal_small','heal_medium','makgeolli','focus','cleanse'].includes(i.potionKind)?'recovery':'strategy';return'other'};
  



  ActionDispatcher.register('UPGRADE_GEAR',upgradeGearAction5);

  registerInventoryRenderR34('r47-tab-normalize','pre',()=>{if(inventoryTab==='food')inventoryTab='recovery';if(inventoryTab==='potion')inventoryTab='strategy';if(inventoryTab==='treasure')inventoryTab='relic'});registerInventoryRenderR34('r47-decorate','post',()=>decorateInventory());
  // r30: upgrade-mark dispatch is integrated in canonical useInventoryItem.

  function deckPick47(pool,key){if(!pool.length)return null;state.lootHistory47=state.lootHistory47||{};const h=state.lootHistory47[key]||[];let a=pool.filter(i=>!h.includes(i.name));if(!a.length)a=pool;const p=clone(foodOccurrencePick(a));h.push(p.name);while(h.length>Math.min(4,Math.max(2,pool.length-1)))h.shift();state.lootHistory47[key]=h;return p}

  function relics47(){const f={'붉은 등롱 심지':1,'먹빛 벼루 조각':6,'깨진 천면경':11,'장고의 쇠갈고리':16,'용의 여의주 파편':99,'방 번호패':1,'비단 매듭':6,'금박 부적':16};return[...RELICS.map(x=>({...x,type:'relic'})),...TRINKETS.map(x=>({...x,type:'trinket'}))].filter(x=>!x.jarOnly57&&state.floor>=(f[x.name]||1))}


  

  registerGenerationStage('strategy47','post',()=>applyStrategy());
  // r54: dead pre-v49 floor trait wrapper removed.


  /* ---------- v4.8 loot ecology: guaranteed core resources without item spam ---------- */
  function floorHasRole48(role){return(state.items||[]).some(i=>role47(i)===role)}
  function guaranteedResource48(){
    if(!state||state.specialFloor)return;
    // One recovery checkpoint per chapter. Like SPD's limited drops, this prevents pure RNG starvation.
    if([3,8,13,18,23].includes(state.floor)&&!floorHasRole48('recovery')){const p=deckPick47(ordinaryPotionPool(false),'limitedRecovery48');if(p)place47(p)}
    // Gameplay items are persistent state; rendering owns any visual culling.
  }
  registerGenerationStage('resource48','post',()=>{guaranteedResource48();P47.cullKey='';P47.decorKey='';P47.force=true});



  registerInventoryRenderR34('r48-clean-taxonomy','post',()=>cleanInventory());

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


  const titleMotion49=matchMedia('(prefers-reduced-motion:reduce)');





  drawTitleCanvas();
  addEventListener('resize',()=>{const c=document.getElementById('titleCanvas49');if(c&&c.dataset.mobile!==(innerWidth<700?'1':'0'))drawTitleCanvas()},{passive:true});



  enterBtn.onclick=showClassPick;classBackBtn.onclick=showStartGate;

  /* ---------- camera: default auto-follow, temporary look-pan, explicit free mode ---------- */

  registerMovePostR8(ctx=>{if(ctx.moved)RENDER_PERF_STATE.dirty=true});




  
  
  
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

  

  
  const modal52=()=>!gameplayInputAllowed57();
  const bow52=()=>state?.player?.weapon?.kind==='bow';
  
  






  





  
  

  registerGenerationStage('aim-reset52','pre',()=>{AIM_STATE.target=null;AIM_STATE.jar=null;state._manualTerrainTargetR8=null});
  registerMovePostR8(()=>{if((AIM_STATE.target||AIM_STATE.jar)&&!isAimTargetValid()){AIM_STATE.target=null;AIM_STATE.jar=null;state._manualTerrainTargetR8=null}});



/* ===== MANRU v5.1 MOBILE PERFORMANCE HOTFIX ===== */




  const uniq53=a=>[...new Set(a.map(v=>String(v??'').trim()).filter(Boolean))];
  function stats53(item){
    if(!item)return[];const a=[];
    if(item.atk)a.push(`ATK +${displayNumber53(item.atk)}`);
    if(item.def)a.push(`DEF ${item.def>=0?'+':''}${displayDef42(item.def)}`);
    if(item.eva)a.push(`EVA ${item.eva>=0?'+':''}${item.eva}`);
    if(item.will)a.push(`WILL +${item.will}`);
    if(item.vision)a.push(`VIS ${item.vision>0?'+':''}${item.vision}`);
    if(item.focus)a.push(`FOCUS +${displayNumber53(item.focus)}`);
    if(item.speed)a.push(`공격 ${item.speed}× · ${attackTurnCost(item).toFixed(1)}턴`);
    if(item.range)a.push(`사거리 ${item.range}`);
    if(isBrawlWeapon(item)){a.push(`강화 +${item.upgrade||0} · 실제 강화 ATK +${brawlUpgradeEffect42(item)}`);a.push('강화 효율 매우 낮음')}
    if(item.heal)a.push(`HP +${item.heal}`);
    if(item.focusGain)a.push(`FOCUS +${item.focusGain}`);
    if(item.hunger)a.push(`허기력 +${item.hunger}`);
    if((item.count||1)>1)a.push(`수량 ×${item.count||1}`);
    if(item.curse)a.push(`저주 · ${item.curse}`);
    return uniq53(a);
  }


  // 요약은 수치만. 설명/능력을 섞지 않는다.
  window.__MANRU_CLEAN_INSPECT53={item:itemHtml};

  const editable53=t=>!!t?.closest?.('input,textarea,[contenteditable="true"]');
  for(const type of ['selectstart','dragstart','copy','cut']){
    document.addEventListener(type,e=>{if(editable53(e.target))return;if(e.target?.closest?.('#app,#overlay,#game,canvas')){e.preventDefault();e.stopImmediatePropagation?.()}},{capture:true,passive:false});
  }
  document.addEventListener('contextmenu',e=>{if(editable53(e.target)||e.target?.closest?.('#game,#runtimeInput81'))return;if(e.target?.closest?.('#app,#overlay')){e.preventDefault();e.stopImmediatePropagation?.()}},{capture:true,passive:false});
  document.addEventListener('pointerdown',e=>{if(editable53(e.target))return;if(e.target?.closest?.('#game,canvas,img')){try{window.getSelection?.()?.removeAllRanges?.()}catch(error){ignoreError('getSelection unavailable',error)}}},{capture:true,passive:true});

  // 마지막 행낭 정보 버튼도 같은 formatter 사용.
  registerInventoryRenderR34('r53-inspect-bindings','post',()=>{
    const box=document.getElementById('inventory');if(!box||!state)return;
    box.querySelectorAll('[data-invinspect]').forEach(b=>{const n=b.cloneNode(true);b.replaceWith(n);n.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const it=state.player.inventory[+n.dataset.invinspect];if(it)showInspect(it.name,itemHtml(it))})});
    box.querySelectorAll('[data-uxinspectequip]').forEach(b=>{const n=b.cloneNode(true);b.replaceWith(n);n.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const it=state.player[n.dataset.uxinspectequip];if(it)showInspect(it.name,itemHtml(it))})});
  });


/* ===== MANRU v5.4 COMBAT / BOSS / DISCOVERY / UX CONSOLIDATION ===== */
const V54={marks:[],death:[],hold:null,holdRAF:0,audio:null,sfx:true,lastFoot:0};
  try{const s=localStorage.getItem('manruSfx54');if(s==='0')V54.sfx=false}catch(error){console.warn('[manru] sound setting not read',error)}

  const hold=document.createElement('div');hold.id='hold54';document.body.appendChild(hold);
  const rule=document.createElement('div');rule.id='bossRule54';document.getElementById('canvasWrap')?.appendChild(rule);

  /* ---------- lightweight procedural SFX ---------- */
  function ac54(){if(!V54.sfx)return null;try{if(!V54.audio){const A=window.AudioContext||window.webkitAudioContext;if(!A)return null;V54.audio=new A()}if(V54.audio.state==='suspended')V54.audio.resume?.();return V54.audio}catch(_){return null}}
  function tone54(freq=220,dur=.055,type='square',gain=.035,slide=0){const a=ac54();if(!a)return;try{const o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(freq,a.currentTime);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,freq+slide),a.currentTime+dur);g.gain.setValueAtTime(gain,a.currentTime);g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+dur);o.onended=()=>{o.disconnect();g.disconnect()};o.connect(g).connect(a.destination);o.start();o.stop(a.currentTime+dur+.01)}catch(error){ignoreError('tone cue could not play',error)}}
  function noise54(dur=.045,gain=.025){const a=ac54();if(!a)return;try{const n=Math.max(1,Math.floor(a.sampleRate*dur)),b=a.createBuffer(1,n,a.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(globalThis.__MANRU_RANDOM57__()*2-1)*(1-i/n);const s=a.createBufferSource(),g=a.createGain();s.buffer=b;g.gain.value=gain;s.onended=()=>{s.disconnect();g.disconnect();s.buffer=null};s.connect(g).connect(a.destination);s.start()}catch(error){ignoreError('noise cue could not play',error)}}

  document.addEventListener('pointerdown',()=>ac54(),{once:true,capture:true,passive:true});
  globalThis.__MANRU_DEATH_FX54__=Object.freeze({record:mon=>{if(!mon)return false;V54.death.push({x:mon.x,y:mon.y,color:mon.color||'#aaa',shape:mon.shape,start:performance.now(),life:520,boss:!!mon.boss});if(V54.death.length>16)V54.death.splice(0,V54.death.length-16);sfx54('death');return true}});
  globalThis.__MANRU_SFX54__=Object.freeze({play:sfx54});


  setPlayerAttackBaseR('combat54',attackPlayerCore54R);
  /* r15: boss knockback cap is handled by canonical knockMonster. */

  /* ---------- boss telegraph / phase system ---------- */
  
  
  
  
  
  
  
  
  
  
  
  
  
  

  

  registerBossRewardStage55('boss54','pre',mon=>{if(mon?.boss&&mon.xp){state.player.xp+=mon.xp;addLog(`보스 경험치 +${mon.xp}`);checkLevel()}if(mon?.bossPattern==='master')state.visionPenalty=0});

  /* ---------- death residue, directional damage feedback, boss mark renderer ---------- */
  
  

  /* ---------- terrain footsteps ---------- */
  registerMovePostR8(ctx=>{if(state&&ctx.moved){const terrain=state.map[state.player.y]?.[state.player.x],now=performance.now();if(now-V54.lastFoot>55){V54.lastFoot=now;sfx54([TT.WATER,TT.RAFT].includes(terrain)?'stepWater':regionIndex()===3?'stepMetal':regionIndex()===0?'stepWood':'stepStone')}if(ctx.targetTile===TT.DOOR)sfx54('door')}});
  registerPickupStageR25('pickup-feedback54',{pre:ctx=>{ctx.invBefore54=state?.player?.inventory?.length||0},post:ctx=>{const after=state?.player?.inventory?.length||0;if(after>(ctx.invBefore54||0)){sfx54('pickup');try{if(!localStorage.getItem('manruHoldHint54')){localStorage.setItem('manruHoldHint54','1');toast('팁 · 맵의 칸을 길게 누르면 적·아이템·지형을 조사한다.')}}catch(error){ignoreError('hold-hint flag unreadable',error)}}}});
  DESCEND_EFFECTS53.push(()=>sfx54('stairs'));

  /* ---------- feature room visual signatures ---------- */
  

  /* ---------- save/load/init compatibility ---------- */
  registerGenerationStage('boss-zones54-pre','pre',()=>{V54.marks=[];rule.classList.remove('show')});registerGenerationStage('boss-zones54-post','post',()=>{state.bossZones54=[];for(const m of state.monsters||[])normalizeBoss(m)});

  // InputRouter owns the physical shortcut; this API remains the existing sound-setting owner.
  globalThis.__MANRU_SFX54__=Object.freeze({play:sfx54,toggle(){V54.sfx=!V54.sfx;try{localStorage.setItem('manruSfx54',V54.sfx?'1':'0')}catch(error){console.warn('[manru] sound setting not stored',error)}toast(`효과음 ${V54.sfx?'켜짐':'꺼짐'}`);return V54.sfx},enabled(){return V54.sfx}});


  globalThis.__MANRU_BOSS54__={draw:drawBossIntent};

/* ===== MANRU v5.6 TALISMANS + CONTEXTUAL UNKNOWN POTIONS ===== */
const V56={target:null,lastRoomKey:'',baseCleanItem:window.__MANRU_CLEAN_INSPECT53?.item||null};
  const POTION_LIST=Array.isArray(window.MANRU_POTIONS)?window.MANRU_POTIONS:[];
  const POTION_BY_KIND=new Map(POTION_LIST.map(p=>[p.potionKind,p]));
  const RECOVERY_KINDS=new Set(['heal_small','heal_medium','makgeolli','focus','cleanse']);



  const ROOM_CONTEXT={
    '연금술방':{text:'조제대에 금창약·해독재·청심초가 함께 놓여 있다.',kinds:['heal_small','heal_medium','makgeolli','cleanse','focus']},
    '주방':{text:'식재료 옆에 소독재와 보양 약재가 놓여 있다.',kinds:['heal_small','makgeolli','cleanse','focus']},
    '사당':{text:'향로 재와 정화수 흔적이 남아 있다.',kinds:['cleanse','focus','fortify']},
    '무기고':{text:'수지·화약·근육을 굳히는 약재가 함께 보관돼 있다.',kinds:['fortify','smoke','fire']},
    '서고':{text:'약성 기록에는 정신·기동 계열의 표식이 반복된다.',kinds:['focus','swift','cleanse']},
    '감방':{text:'탈옥 도구 곁에 연막·경신·응급 약재가 숨겨져 있다.',kinds:['smoke','swift','heal_medium','makgeolli']}
  };

  const TALISMANS=[
    {name:'감정부적',type:'talisman',talismanKind:'identify',seal:'鑑',tier:1,rarity:'common',stackMax:3,minFloor:1,weight74:.95,ability:'미감정 아이템 1개 완전 감정',desc:'미감정 물건 하나를 직접 골라 정체와 숨은 성질까지 밝혀낸다.'},
    {name:'성부',type:'talisman',talismanKind:'holy',seal:'聖',tier:2,rarity:'rare',stackMax:3,minFloor:2,weight74:.42,ability:'저주 1개 정화 / 저주가 없으면 성광',desc:'탁한 기운을 끊어 장비의 저주를 지운다. 정화할 저주가 없으면 주변의 원혼과 언데드를 태우고 몸의 해로운 기운 하나를 씻는다.'},
    {name:'화염부적',type:'talisman',talismanKind:'elem_fire',element74:'fire',seal:'火',tier:1,rarity:'common',stackMax:3,minFloor:1,weight74:1.35,ability:'주변 화염 폭주 · 역류 위험',desc:'제어하지 않고 펼치면 불길이 주변으로 터진다. 화염 저항이 없으면 독자도 열기를 뒤집어쓴다.'},
    {name:'수류부적',type:'talisman',talismanKind:'elem_water',element74:'water',seal:'水',tier:1,rarity:'common',stackMax:3,minFloor:1,weight74:1.30,ability:'주변 수압 방출 · 역류 위험',desc:'거친 물기운이 사방으로 터져 적을 밀고 불길을 끈다. 수류 저항이 없으면 독자도 균형을 잃는다.'},
    {name:'대지부적',type:'talisman',talismanKind:'elem_earth',element74:'earth',seal:'土',tier:2,rarity:'common',stackMax:3,minFloor:2,weight74:1.20,ability:'낙석·암벽 폭주 · 역류 위험',desc:'대지가 솟아 주변을 바위로 가른다. 대지 저항이 없으면 충격과 낙석을 그대로 받는다.'},
    {name:'빙결부적',type:'talisman',talismanKind:'elem_ice',element74:'ice',seal:'冰',tier:2,rarity:'rare',stackMax:3,minFloor:3,weight74:1.10,ability:'주변 급랭·빙결 · 역류 위험',desc:'주변 열을 빼앗아 적을 굳힌다. 냉기 저항이 없으면 독자의 관절도 함께 얼어붙는다.'},
    {name:'뇌전부적',type:'talisman',talismanKind:'elem_shock',element74:'shock',seal:'雷',tier:2,rarity:'rare',stackMax:3,minFloor:4,weight74:1.05,ability:'주변 연쇄 뇌격 · 역류 위험',desc:'전류가 가까운 생체와 금속을 따라 튄다. 뇌전 저항이 없으면 독자도 감전된다.'},
    {name:'목령부적',type:'talisman',talismanKind:'elem_grass',element74:'grass',seal:'木',tier:2,rarity:'rare',stackMax:3,minFloor:5,weight74:1.05,ability:'뿌리·독분 폭주 · 역류 위험',desc:'식물의 생기가 폭주해 뿌리와 독분을 뿜는다. 목령 저항이 없으면 독자도 포자에 잠식된다.'},
    {name:'강화부적',type:'talisman',talismanKind:'upgrade',seal:'強',tier:1,rarity:'rare',stackMax:15,minFloor:1,weight74:.58,ability:'무기 강화 +1 · 방어구 점감 강화',desc:'장비 하나를 한 단계 개량한다. 방어구는 첫 강화가 원본 DEF에 따라 약 1.8~2.0 오르고, 강화 횟수가 늘수록 매회 상승량이 완만하게 감소한다. 실제 계산은 소수 DEF를 유지하지만 화면에는 반올림한 정수 DEF만 표시한다. 강화 횟수 제한은 없지만 이미 소비한 강화는 되돌릴 수 없다.'},
    {name:'폭발부적',type:'talisman',talismanKind:'blast',seal:'爆',tier:2,rarity:'rare',stackMax:2,minFloor:3,weight74:1.70,targeted:true,targetRange:5,ability:'목표 3×3 고위력 폭발·밀치기',desc:'선택한 지점의 진형을 터뜨려 층이 깊어질수록 강해지는 피해를 주고 바깥으로 밀어낸다.'},
    {name:'등명부',type:'talisman',talismanKind:'mapping',seal:'明',tier:2,rarity:'rare',stackMax:2,minFloor:3,weight74:.62,ability:'층 지도와 숨은 문 탐지',desc:'불빛이 벽의 틈을 훑어 현재 층의 구조와 숨은 문을 드러낸다.'},
    {name:'호신부',type:'talisman',talismanKind:'ward',seal:'護',tier:2,rarity:'rare',stackMax:3,minFloor:4,weight74:.68,ability:'보호막 10턴',desc:'몸 둘레에 얇은 금빛 장막을 두른다. 보호막 동안 DEF가 오른다.'},
    {name:'축지부',type:'talisman',talismanKind:'blink',seal:'縮',tier:3,rarity:'rare',stackMax:2,minFloor:7,weight74:1.55,targeted:true,targetRange:8,ability:'본 안전 칸으로 순간이동',desc:'이미 확인한 안전한 칸 하나를 찍어 그곳으로 몸을 접어 이동한다.'},
    {name:'봉박부',type:'talisman',talismanKind:'bind',seal:'封',tier:4,rarity:'relic',stackMax:2,minFloor:11,weight74:1.45,targeted:true,targetRange:6,ability:'목표 3×3 적 4턴 봉인',desc:'선택한 지점의 일반 적을 종이 사슬로 4턴 봉인한다. 보스는 제어 내성이 열려 있을 때 1턴만 경직된다.'}
  ];
  const TALISMAN_BY_KIND=new Map(TALISMANS.map(t=>[t.talismanKind,t]));
  const TALISMAN_APPEARANCES=[
    {id:'redthread',name:'붉은 실매듭 부적',paper:'#d9bd82',paper2:'#af8952',ink:'#8d2c28',seal:'甲'},
    {id:'jadepaper',name:'옥빛 종이 부적',paper:'#b6c79a',paper2:'#81956f',ink:'#315f50',seal:'乙'},
    {id:'inkwash',name:'먹선 번진 부적',paper:'#c8bda2',paper2:'#948873',ink:'#34353c',seal:'丙'},
    {id:'violet',name:'자줏빛 주사 부적',paper:'#c6a4b9',paper2:'#936e88',ink:'#71345f',seal:'丁'},
    {id:'goldedge',name:'금테 누런 부적',paper:'#d8c36f',paper2:'#a48a43',ink:'#6b4326',seal:'戊'},
    {id:'ashgray',name:'잿빛 삼베 부적',paper:'#aaa493',paper2:'#777263',ink:'#4b4542',seal:'己'},
    {id:'cobalt',name:'남청색 비단 부적',paper:'#8fa9bd',paper2:'#617b91',ink:'#334f70',seal:'庚'},
    {id:'blueglass',name:'청유리빛 부적',paper:'#a6c4c7',paper2:'#6f9da0',ink:'#2f6165',seal:'辛'},
    {id:'frostwhite',name:'서리 묻은 백지 부적',paper:'#d9d8cf',paper2:'#a8afb0',ink:'#526b75',seal:'壬'},
    {id:'moss',name:'이끼 물든 부적',paper:'#a9b786',paper2:'#73815c',ink:'#3e5631',seal:'癸'},
    {id:'ochre',name:'황토 얼룩 부적',paper:'#c6a66f',paper2:'#8f7249',ink:'#654228',seal:'子'},
    {id:'cinnabar',name:'주사 점박이 부적',paper:'#d1b091',paper2:'#a6795f',ink:'#9b3b30',seal:'丑'},
    {id:'roughpaper',name:'거친 닥종이 부적',paper:'#c2b89f',paper2:'#8e826d',ink:'#4d453a',seal:'寅'},
    {id:'waxpaper',name:'밀랍 먹인 부적',paper:'#c1ad83',paper2:'#8f7656',ink:'#554533',seal:'卯'},
    {id:'palepaper',name:'빛바랜 삼지 부적',paper:'#c8c0aa',paper2:'#958d79',ink:'#575149',seal:'辰'}
  ];
  const TALISMAN_APP_BY_ID=new Map(TALISMAN_APPEARANCES.map(a=>[a.id,a]));
  window.MANRU_TALISMANS=TALISMANS;
  for(const t of TALISMANS)if(!CONSUMABLES.some(i=>i.name===t.name))CONSUMABLES.push(t);



  function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(globalThis.__MANRU_RANDOM57__()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}




  const GENERIC_TALISMAN56=Object.freeze({id:'unknown',name:'미확인 부적',paper:'#d8c79b',paper2:'#b49b6d',ink:'#8a2f28',seal:'?'});
  const IDENTIFY_TALISMAN_THEME56=Object.freeze({id:'identify',name:'감정부적',paper:'#dfc78e',paper2:'#b8955b',ink:'#9d3126',seal:'鑑'});
  
  function knownTalisman56(item){if(item?.mineItem105==='mystery')return true;return item?.type==='talisman'&&(item.branchExclusive105||item.fusion74||item.talismanKind==='identify'||!!state?.knowledge56?.talismanKnown?.[item.talismanKind])}
  function talismanApp56(item){
    if(!item||item.type!=='talisman')return GENERIC_TALISMAN56;
    if(item.mineItem105==='mystery')return {...TALISMAN_APPEARANCES[0],seal:'玄'};
    if(item.fusion74)return {id:'fusion',name:item.name,paper:'#d8bf83',paper2:'#a8844f',ink:'#8b2d28',seal:item.seal||'合'};
    if(item.talismanKind==='identify')return IDENTIFY_TALISMAN_THEME56;
    const K=state?.knowledge56,id=item.appearance56||K?.talismanMap?.[item.talismanKind];
    // The shuffled appearance itself is the texture. Identification changes knowledge/text only.
    // Unidentified talismans keep the same body/frame and only differ by their run-stable rune/color theme.
    return TALISMAN_APP_BY_ID.get(id)||TALISMAN_APPEARANCES[0];
  }
  function publicTalismanName56(item){return knownTalisman56(item)?item.name:GENERIC_TALISMAN56.name}

  function publicName56(item){if(!item)return'';if(item.type==='potion'&&!isPotionKnownByPlayer(item))return app56(item).name;if(item.type==='talisman')return publicTalismanName56(item);return item.name}
  
  window.__MANRU_TALISMAN_PUBLIC__={known:knownTalisman56,name:publicTalismanName56,seal:publicTalismanSeal56,app:talismanApp56};
  function featureAt56(x,y){return(state?.featureRooms||[]).find(r=>x>=r.x&&y>=r.y&&x<r.x+r.w&&y<r.y+r.h)||null}
  function nearTypes56(x,y,r=2){const s=new Set();for(let yy=Math.max(0,y-r);yy<=Math.min(ROWS-1,y+r);yy++)for(let xx=Math.max(0,x-r);xx<=Math.min(COLS-1,x+r);xx++)s.add(state.map[yy]?.[xx]);return s}
  function contextAt56(x,y,kind){
    const fr=featureAt56(x,y);if(fr&&ROOM_CONTEXT[fr.name]){const c=ROOM_CONTEXT[fr.name],match=c.kinds.includes(kind);return{label:fr.name,text:match?c.text:'이 방의 주된 약성과 다른 물건이다. 다른 곳에서 반입된 듯하다.',kinds:match?[...c.kinds]:[],strength:match?2:0}}
    const n=nearTypes56(x,y,2),tests=[
      {has:[TT.LAVA,TT.BRAZIER],label:'열기 주변',text:'불과 수지 흔적이 있어 열기·강화 계열일 가능성이 있다.',kinds:['fire','fortify','smoke']},
      {has:[TT.WATER,TT.FOUNTAIN,TT.MERCURY],label:'물가 주변',text:'정화수와 냉기가 가까워 정신·정화 계열일 가능성이 있다.',kinds:['cleanse','focus','heal_small']},
      {has:[TT.TRAP,TT.SNARE],label:'함정 주변',text:'회피 경로에 놓인 약병이라 기동·연막 계열일 가능성이 있다.',kinds:['swift','smoke','heal_medium']},
      {has:[TT.ALTAR,TT.GOLD],label:'제단 주변',text:'향과 금분 흔적이 있어 정화·보호 계열일 가능성이 있다.',kinds:['cleanse','focus','fortify']},
      {has:[TT.ARMORY],label:'병기 보관구',text:'병기 옆에 놓여 전투·연막 계열일 가능성이 있다.',kinds:['fortify','smoke','fire']}
    ];
    for(const t of tests)if(t.has.some(v=>n.has(v))){const match=t.kinds.includes(kind);return{label:t.label,text:match?t.text:'주변 구조와 약성이 어긋난다. 위치 단서의 신뢰도가 낮다.',kinds:match?[...t.kinds]:[],strength:match?1:0}}
    return{label:'출처 불명',text:'발견 위치만으로는 약성을 좁히기 어렵다.',kinds:[],strength:0};
  }

  function migrateScroll56(item){
    if(!item||item.type!=='scroll')return item;const n=String(item.name||''),kind=n.includes('감정')||n.includes('식별')?'identify':n.includes('지도')?'mapping':n.includes('이동')||n.includes('귀환')?'blink':n.includes('분노')||n.includes('응징')||n.includes('파쇄')?'blast':n.includes('수면')||n.includes('공포')?'bind':'ward',t=TALISMAN_BY_KIND.get(kind)||TALISMANS[0],keep={x:item.x,y:item.y,count:item.count||1};Object.keys(item).forEach(k=>delete item[k]);Object.assign(item,clone(t),keep);return item
  }
  function decorateAllItems56(){if(!state)return;for(const i of state.items||[]){migrateScroll56(i);decoratePotion56(i,i.x,i.y);if(i.type==='talisman')talismanApp56(i)}for(const i of state.player?.inventory||[]){migrateScroll56(i);decoratePotion56(i);if(i.type==='talisman')talismanApp56(i)} }



  function talismanHTML56(item){
    if(!knownTalisman56(item)){const a=talismanApp56(item);return `<div class="v56TalismanInfo v56TalismanUnknown"><b>성질을 알 수 없는 부적</b><p>${esc56(a.name)}. 주사와 종이의 결만으로는 어떤 술법인지 판별할 수 없다.</p><span>펼치기 1.0턴 · 사용하거나 감정부적로 식별</span></div>`}
    const classDesc=classItemDescription58(item);
    return `<div class="v56TalismanInfo"><b>${esc56(classDesc?'괴력 · ATK +2 · DEF +7 · 매턴 HP 2% 회복':item.ability||'일회용 술법')}</b><p>${esc56(classDesc||item.desc||'')}</p><span>펼치기 1.0턴${item.targeted?` · 목표 사거리 ${item.targetRange||5}`:''}</span></div>`
  }


  function identifyTalisman56(kind,reason='효과를 직접 확인했다'){
    const K=ensureKnowledge56();if(!kind||kind==='identify'||K.talismanKnown[kind])return false;const t=TALISMAN_BY_KIND.get(kind);if(!t)return false;const a=TALISMAN_APP_BY_ID.get(K.talismanMap[kind])||TALISMAN_APPEARANCES[0];K.talismanKnown[kind]=true;logWithCategory(`부적 식별 · ${a.name} = ${t.name} (${reason}).`);burst(state.player.x,state.player.y,a.ink||'#d6b071',13,.55);if(inventoryOpen)inventoryDirty=true;updateAll();return true
  }
  function sanitize56(text){let s=String(text??'');if(!state)return s;const K=state.knowledge56;for(const p of POTION_LIST)if(!K.potionKnown[p.potionKind])s=s.split(p.name).join(app56(p).name);for(const t of TALISMANS)if(t.talismanKind!=='identify'&&!K.talismanKnown[t.talismanKind])s=s.split(t.name).join(talismanApp56(t).name);return s}
  function effectLog56(text){return/(HP \+|기 \+|WILL 강화|신속|DEF 강화|연막|화염|독·출혈|약화 해제)/.test(String(text))}
  if(window.__MANRU_CLEAN_INSPECT53)window.__MANRU_CLEAN_INSPECT53.item=inspectHTML56;

  const targetHud=document.createElement('div');targetHud.id='talismanTarget56';targetHud.innerHTML='<div><b id="talismanTargetTitle">부적 목표</b><span id="talismanTargetText">목표 칸을 터치/클릭</span></div><button id="talismanCancel56">취소</button>';document.body.appendChild(targetHud);



  globalThis.__MANRU_POTION_ART_56__={iconHtml:potionIconHtml56R,worldDraw:drawPotionWorld56R};

  function role56(item){if(!item)return'other';if(item.mineItem105==='stone')return'strategy';if(['weapon','armor','cloak'].includes(item.type))return'gear';if(['relic','trinket'].includes(item.type))return'relic';if(item.type==='food')return'recovery';if(item.type==='upgrade'||item.type==='talisman')return'strategy';if(item.type==='potion')return isPotionKnownByPlayer(item)?(RECOVERY_KINDS.has(item.potionKind)?'recovery':'strategy'):'strategy';return'other'}
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


  function inventoryFilteredFor56(tab){const old=inventoryTab;inventoryTab=tab;const r=inventoryFiltered();inventoryTab=old;return r}
  registerInventoryRenderR34('r56-identification','post',()=>patchInventory56());


  function qtyKind56(kind){return(state?.player?.inventory||[]).filter(i=>i.type==='potion'&&i.potionKind===kind).reduce((s,i)=>s+(i.count||1),0)}
  registerPickupStageR25('potion-observe56',{pre:ctx=>{const item=ctx.ground;if(item?.type==='potion')decoratePotion56(item,item.x,item.y);ctx.potionBefore56=item?.type==='potion'?qtyKind56(item.potionKind):0},post:ctx=>{const item=ctx.ground,after=item?.type==='potion'?qtyKind56(item.potionKind):0;if(item?.type==='potion'&&after>(ctx.potionBefore56||0))observePotion(item)}});











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
  function currentTalismanTarget(){return V56.target?{kind:V56.target.kind,range:V56.target.range}:null}

  if(state){ensureKnowledge56();decorateAllItems56()}


RuntimeState.ui.food=V57;


const COOKING_INGREDIENT_LIMIT57=Math.max(...FOOD_RECIPES.map(r=>r.ingredients.length));
window.MANRU_FOOD57={recipes:FOOD_RECIPES};








// PDF 포만감 규칙: 허기 0에서만 공격력 20% 감소. 기존 단계별 ATK/EVA 패널티는 제거.

registerPlayerStatStage55('food57',s=>{if(state?.player?.hunger<=0)s.atk=Math.max(1,Math.round(s.atk*.8*10)/10);return s});
registerAttackCostStage55('food57',(c,item)=>{if(state?.status?.foodHaste57>0)c*=.90;if(state?.status?.freeStamina57>0)c*=.50;return clamp(c,.25,2.2)});
registerMoveCostStage55('food57',c=>{if(state?.status?.freeStamina57>0)c*=.50;return clamp(c,.25,1.8)});
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


function ingredientKey57(item){if(item?.type==='potion'){const proto=(globalThis.MANRU_POTIONS||[]).find(p=>p.potionKind===item.potionKind);return item.potionKind==='fire'?'화유병':proto?.name||item.name||'';}return item?.name||''}








ActionDispatcher.register('COOK',cookSelected);
cookingPanel.querySelector('#cookClose57').onclick=e=>{e.preventDefault();e.stopPropagation();closeCooking()};cookingPanel.querySelector('#cookClear57').onclick=()=>{V57.selected.clear();renderCooking()};cookingPanel.querySelector('#cookDo57').onclick=ActionDispatcher.handleEvent;

// 조리 중 월드 입력 차단 및 솥/화로 상호작용

registerMovePreR8(()=>!V57.cookOpen);/* r8: basicAttack reads ux-modal-open directly. */


// 획득 구조: 주방, 샘, 피라냐, 복숭아나무 + 설계 공백을 메운 빙결액 배치
window.MANRU_FOOD57.rumorHint=()=>{ensureFoodState();const unknown=FOOD_RECIPES.filter(v=>!state.cookbook57[v.id]);if(unknown.length&&globalThis.__MANRU_RANDOM57__()<.40){const rec=choice(unknown);state.cookbook57[rec.id]=true;addLog(`찢어진 조리서 · ${rec.name}: ${rec.ingredients.join(' + ')}.`);return rec.id}return null};
function roomFreeFood57(fr){const a=[];for(let y=fr.y+1;y<fr.y+fr.h-1;y++)for(let x=fr.x+1;x<fr.x+fr.w-1;x++)if(ReachabilityService.playerPassable(x,y)&&state.map[y][x]!==TT.STAIR&&!OccupancyService.isOccupied(x,y)&&!state.items.some(i=>i.x===x&&i.y===y))a.push({x,y});return a.length?choice(a):PlacementService.randomFloor(0)}
function placeFood57(name,fr=null){const d=foodDef(name);if(!d)return;const p=fr?roomFreeFood57(fr):PlacementService.randomFloor(0);PlacementService.placeItem({...clone(d),x:p.x,y:p.y,count:1})}
const GUARANTEED_FOOD_PER_NONBOSS_FLOOR57=1;
const EXTRA_FOOD_CHANCE_NONBOSS57=.20;

registerGenerationStage('food57','post',()=>{ensureFoodState();foodFloorRewards57()});



// 인벤토리 분류와 버튼 문구

registerInventoryRenderR34('r57-food-actions','post',()=>{const selected=inventorySelection>=0?state.player.inventory[inventorySelection]:null,btn=document.querySelector('#inventory [data-invuse]');if(btn&&(selected?.mineItem105==='stone'||selected?.throwable)){btn.textContent='투척';btn.disabled=false}else if(btn&&selected?.type==='ingredient'){btn.textContent='조리 전용';btn.disabled=true}else if(btn&&selected?.throwableFood57)btn.textContent='투척'});



if(state)ensureFoodState();

/* ===== MANRU v5.8: PERFORMANCE / DENSITY / KOREAN UI HOTFIX ===== */

  // ---- mobile pad toggle
  let pad58=document.getElementById('padToggle58');
  if(!pad58){pad58=document.createElement('button');pad58.id='padToggle58';pad58.type='button';pad58.textContent='십';document.body.appendChild(pad58)}
  try{if(localStorage.getItem('manruPad58')==='0')document.body.classList.add('pad58-hidden')}catch(error){ignoreError('pad visibility unreadable',error)}
  pad58.onclick=e=>{e.preventDefault();e.stopPropagation();document.body.classList.toggle('pad58-hidden');try{localStorage.setItem('manruPad58',document.body.classList.contains('pad58-hidden')?'0':'1')}catch(error){ignoreError('pad visibility could not be saved',error)}};



  // ---- kitchen should be uncommon, not every other floor
  function clearKitchen58(fr){
    const repl=['서고','사당','무기고','감방'][Math.floor(globalThis.__MANRU_RANDOM57__()*4)];
    const x0=fr.x+1,y0=fr.y+1,x1=fr.x+fr.w-2,y1=fr.y+fr.h-2,cx=fr.x+Math.floor(fr.w/2),cy=fr.y+Math.floor(fr.h/2);
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
      const t=state.map[y]?.[x];
      if([TT.TABLE,TT.JAR,TT.COOKPOT,TT.FLOOR,TT.SCREEN,TT.SNARE,TT.ALTAR,TT.ARMORY,TT.BRAZIER].includes(t))setTerrainTile58(state.map,x,y,TT.FLOOR);
    }
    state.routeTags=(state.routeTags||[]).filter(t=>!(t.x>=fr.x&&t.x<fr.x+fr.w&&t.y>=fr.y&&t.y<fr.y+fr.h&&t.label==='주방'));
    fr.name=repl;
    if(repl==='서고'){
      for(let y=y0+1;y<=y1-1;y+=2)for(let x=x0+1;x<=x1-1;x++)if(x!==((y&2)?x1-1:x0+1))setTerrainTile58(state.map,x,y,TT.SCREEN);
      setTerrainTile58(state.map,cx,cy,TT.RUMOR);
    }else if(repl==='사당'){
      setTerrainTile58(state.map,cx,cy,TT.ALTAR);
      for(const [dx,dy] of [[-2,-2],[2,-2],[-2,2],[2,2]])if(state.map[cy+dy]?.[cx+dx]===TT.FLOOR)setTerrainTile58(state.map,cx+dx,cy+dy,TT.BRAZIER);
    }else if(repl==='무기고'){
      setTerrainTile58(state.map,cx,cy,TT.ARMORY);
      for(let y=y0+1;y<=y1-1;y+=2){if(state.map[y]?.[x0+1]===TT.FLOOR)setTerrainTile58(state.map,x0+1,y,TT.TABLE);if(state.map[y]?.[x1-1]===TT.FLOOR)setTerrainTile58(state.map,x1-1,y,TT.TABLE)}
    }else{
      const lx=Math.max(x0+1,cx-2),rx=Math.min(x1-1,cx+2);
      for(let y=y0+1;y<=y1-1;y++){if(y!==cy){setTerrainTile58(state.map,lx,y,TT.SCREEN);setTerrainTile58(state.map,rx,y,TT.SCREEN)}}
      setTerrainTile58(state.map,lx,cy,TT.DOOR);setTerrainTile58(state.map,rx,cy,TT.DOOR);
    }
  }
  function normalizeKitchens58(){
    if(!state?.featureRooms?.length)return;
    for(const fr of state.featureRooms){
      if(fr.name!=='주방')continue;
      const consecutive=(state.lastKitchenFloor58||0)===state.floor-1;
      const allow=!consecutive&&globalThis.__MANRU_RANDOM57__()<.18;
      if(allow)state.lastKitchenFloor58=state.floor;
      else clearKitchen58(fr);
    }
  }

  registerGenerationStage('canon58','post',()=>{normalizeKitchens58();ensureCanonExtras58();ensureNormalConnectivity();VisibilityService.compute();vfBuildDecor()});


  function bounds58(cam,pad=2){
    const x0=Math.max(0,Math.floor((-cam.x/cam.zoom)/TILE)-pad),y0=Math.max(0,Math.floor((-cam.y/cam.zoom)/TILE)-pad);
    const x1=Math.min(COLS-1,Math.ceil(((VIEW.w-cam.x)/cam.zoom)/TILE)+pad),y1=Math.min(ROWS-1,Math.ceil(((VIEW.h-cam.y)/cam.zoom)/TILE)+pad);
    return{x0,y0,x1,y1};
  }

  





  globalThis.__MANRU_DRAW_BASE58__=drawFast;
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
  registerMovePostR8(ctx=>{if(ctx.targetTile===TT.DOOR&&state?.map?.[ctx.targetY]?.[ctx.targetX]===TT.OPEN_DOOR)alertNearby(ctx.targetX,ctx.targetY,4)});

  /* ---------- risk/reward pockets behind doors, DCSS-style minivault idea ---------- */
  function safeRoom59(r){
    const basic=!(state.player.x>=r.x&&state.player.x<r.x+r.w&&state.player.y>=r.y&&state.player.y<r.y+r.h) &&
           !(state.stairs.x>=r.x&&state.stairs.x<r.x+r.w&&state.stairs.y>=r.y&&state.stairs.y<r.y+r.h);
    if(!basic)return false;
    return !(state.featureRooms||[]).some(f=>!(r.x+r.w<=f.x||f.x+f.w<=r.x||r.y+r.h<=f.y||f.y+f.h<=r.y));
  }
  function stampMiniVault59(r,seed){
    const cx=r.cx,cy=r.cy,mode=seed%4;
    const put=(x,y,t)=>{if(x<=r.x||y<=r.y||x>=r.x+r.w-1||y>=r.y+r.h-1)return;if((x===state.player.x&&y===state.player.y)||(x===state.stairs.x&&y===state.stairs.y))return;setTerrainTile58(state.map,x,y,t)};
    if(mode===0){
      // cross-pillar treasure: four hard corners around a readable center
      for(const [dx,dy] of [[-2,-2],[2,-2],[-2,2],[2,2]])put(cx+dx,cy+dy,TT.WALL);
      put(cx,cy,TT.CACHE);put(cx-2,cy,TT.TRAP);put(cx+2,cy,TT.TRAP);
    }else if(mode===1){
      // trap gallery: a visible lane with reward past it
      for(let x=Math.max(r.x+2,cx-3);x<=Math.min(r.x+r.w-3,cx+3);x++)if(x!==cx)put(x,cy,((x-cx)&1)?TT.TRAP:TT.FLOOR);
      put(cx,cy,TT.FLOOR);put(Math.min(r.x+r.w-2,cx+3),Math.min(r.y+r.h-2,cy+2),TT.CACHE);
    }else if(mode===2){
      // screened cells: two pockets and a narrow central line
      if(r.w>=8){for(let y=r.y+2;y<=r.y+r.h-3;y++){if(y!==cy){put(cx-2,y,TT.SCREEN);put(cx+2,y,TT.SCREEN)}}put(cx-2,cy,TT.DOOR);put(cx+2,cy,TT.DOOR)}
      put(cx,cy,TT.RUMOR);
    }else{
      // shrine pocket: obvious sanctuary shape but guarded approach
      put(cx,cy,TT.ALTAR);for(const [dx,dy] of [[-2,0],[2,0],[0,-2],[0,2]])put(cx+dx,cy+dy,TT.BRAZIER);
      put(cx-1,cy+2,TT.TRAP);put(cx+1,cy+2,TT.CACHE);
    }
  }
  function guardedRooms59(){
    if(state.specialFloor||!state.rooms?.length)return;
    const rooms=state.rooms.filter(r=>safeRoom59(r)&&r.w>=7&&r.h>=6);
    if(!rooms.length)return;
    state.guardRooms59=[];
    const count=Math.min(state.floor>=11?2:1,rooms.length);
    for(let i=0;i<count;i++){
      const r=rooms.splice(rand(0,rooms.length-1),1)[0];if(!r)break;
      const vaultMode=Math.floor(hash2(r.x,r.y,5900+state.floor*31)*4)%4;
      stampMiniVault59(r,vaultMode);
      state.guardRooms59.push({x:r.x,y:r.y,w:r.w,h:r.h,name:['십자 보관실','함정 화랑','병풍 감실','소형 사당'][vaultMode]});
      const movable=state.monsters.filter(m=>!m.boss&&!m.fixed&&!m.aquatic);
      for(let n=0;n<Math.min(2,movable.length);n++){
        const mon=movable[(i*2+n)%movable.length],q=randomInside59(r);
        if(mon&&q&&!OccupancyService.isOccupied(q.x,q.y,mon)){mon.x=q.x;mon.y=q.y}
      }
    }
    ensureNormalConnectivity();
  }

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


  registerMinimapHook('doors59',({sx,sy})=>{
    if(!state)return;for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++)if(state.seen.has(k(x,y))&&[TT.DOOR,TT.OPEN_DOOR].includes(state.map[y][x])){MX.fillStyle=state.map[y][x]===TT.DOOR?'#d09a58':'#7d6040';MX.fillRect(x*sx,y*sy,Math.max(2,sx),Math.max(2,sy))}
  });


  /* ---------- wall-embedded door art: front vs sideways like SPD raised/sideways doors ---------- */

  /* ---------- cheap extra wall depth / corner readability ---------- */


  TT.HIDDEN_BRIDGE=40;
  TT.HIDDEN_WALL=41;
  TT.CRUMBLE=42;
  TT.LIGHT_GRASS=43;TERRAIN_LAYER_CACHE58=null;



  const SIZE60={
    2:[87,57],4:[85,55],5:[73,51],6:[89,59],8:[87,57],10:[75,53],11:[93,63],13:[89,59],15:[75,53],
    16:[95,63],18:[93,61],20:[111,85],21:[99,67],22:[95,65],23:[95,65],24:[95,63],25:[89,59]
  };



  /* ---------- hidden route terrain ---------- */



  function revealHidden60(x,y){
    const id=state.hiddenLookup60?.[k(x,y)],g=state.hiddenGroups60?.[id];if(!g)return false;
    for(const kk of g.keys){const [xx,yy]=kk.split(',').map(Number),r=state.hiddenReplacement60[kk]??g.replacement;setTerrainTile58(state.map,xx,yy,r);delete state.hiddenLookup60[kk]}
    addLog(`${g.label}이 모습을 드러냈다.`);toast(g.label);burst(x,y,'#8ee7e3',18,.75);VisibilityService.compute();vfBuildDecor();return true;
  }
  globalThis.__MANRU_HIDDEN60_ACTIONS__=Object.freeze({revealAt:revealHidden60});
















































  
  


















  /* ---------- exact-floor visual language ---------- */







  

  function repairRequired60(){
    const start={x:state.player.x,y:state.player.y},goal={x:state.stairs.x,y:state.stairs.y},id=(x,y)=>y*COLS+x,xy=i=>({x:i%COLS,y:Math.floor(i/COLS)});
    const walkable=t=>!tileBlocksByTerrain(t);
    if(ReachabilityService.requiredExitReach({start,goal,walkable}))return 0;
    const N=COLS*ROWS,dist=Array(N).fill(Infinity),prev=Array(N).fill(-1),done=Array(N).fill(false),sid=id(start.x,start.y),gid=id(goal.x,goal.y);dist[sid]=0;
    const cost=t=>walkable(t)?1:t===TT.DOOR?1:[TT.SHALLOW_WATER,TT.WATER,TT.MERCURY].includes(t)?3:[TT.TABLE,TT.SCREEN,TT.HEDGE,TT.BAMBOO].includes(t)?5:(t===TT.WALL?7:40);
    for(let step=0;step<N;step++){let u=-1,best=Infinity;for(let i=0;i<N;i++)if(!done[i]&&dist[i]<best){best=dist[i];u=i}if(u<0||u===gid)break;done[u]=true;const p=xy(u);for(const[dx,dy]of DIRS4){const x=p.x+dx,y=p.y+dy;if(x<=0||y<=0||x>=COLS-1||y>=ROWS-1)continue;const v=id(x,y),nd=dist[u]+cost(state.map[y][x]);if(nd<dist[v]){dist[v]=nd;prev[v]=u}}}
    if(!isFinite(dist[gid]))return 0;const path=[];for(let at=gid;at!==sid&&at>=0;at=prev[at])path.push(xy(at));let repairs=0;
    for(const p of path){const t=state.map[p.y][p.x];if(walkable(t))continue;if(t===TT.WATER)setTerrainTile58(state.map,p.x,p.y,TT.PAPER_BRIDGE);else if(t===TT.MERCURY)setTerrainTile58(state.map,p.x,p.y,TT.DRAWBRIDGE_DOWN);else if(t===TT.WALL)setTerrainTile58(state.map,p.x,p.y,TT.DOOR);else setTerrainTile58(state.map,p.x,p.y,TT.FLOOR);repairs++}
    state.repair60=(state.repair60||0)+repairs;return repairs;
  }

  function relocatePool60(){
    const cap=Math.max(0,(COLS-2)*(ROWS-2)),cells=new Int32Array(cap);let n=0;
    for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++)cells[n++]=y*COLS+x;
    return{cells,count:n};
  }
  function relocate60(monsters,items){
    const pool=relocatePool60(),size=COLS*ROWS,occupied60=new Uint8Array(size),itemUsed60=new Uint8Array(size),live=[],reachable60=state.floor===24?reach24State60({entranceOpen:true,allowBlink:false,ignoreOccupants:true}).cells:null;
    const markMon=m=>{for(const[ox,oy]of footprintOffsets(m)){const x=m.x+ox,y=m.y+oy;if(x>=0&&y>=0&&x<COLS&&y<ROWS)occupied60[y*COLS+x]=1}};
    const canMon=(m,x,y)=>{for(const[ox,oy]of footprintOffsets(m)){const xx=x+ox,yy=y+oy;if(xx<1||yy<1||xx>=COLS-1||yy>=ROWS-1||occupied60[yy*COLS+xx]||(xx===state.player.x&&yy===state.player.y)||(reachable60&&!reachable60.has(k(xx,yy)))||!PlacementService.terrainStandable(m,state.map[yy][xx]))return false}return state.map[y][x]!==TT.STAIR};
    state.monsters=[];
    for(let mi=0;mi<monsters.length;mi++){
      const m=monsters[mi];m.x=-99;m.y=-99;
      if(m.boss&&state.bossPos60){m.x=state.bossPos60.x;m.y=state.bossPos60.y;if(canMon(m,m.x,m.y)){live.push(m);markMon(m)}continue}
      if(!pool.count)continue;const start=Math.floor(globalThis.__MANRU_RANDOM57__()*pool.count)%pool.count;let found=-1;
      for(let step=0;step<pool.count;step++){const idx=pool.cells[(start+step)%pool.count],x=idx%COLS,y=(idx/COLS)|0;if(canMon(m,x,y)){found=idx;break}}
      if(found>=0){m.x=found%COLS;m.y=(found/COLS)|0;live.push(m);markMon(m)}
    }
    state.monsters=live;
    state.items=[];
    for(let ii=0;ii<items.length;ii++){
      const it=items[ii];if(!pool.count){it.x=state.player.x;it.y=state.player.y;PlacementService.placeItem(it);continue}
      const start=Math.floor(globalThis.__MANRU_RANDOM57__()*pool.count)%pool.count;let found=-1;
      for(let step=0;step<pool.count;step++){const idx=pool.cells[(start+step)%pool.count],x=idx%COLS,y=(idx/COLS)|0,t=state.map[y][x];if(itemUsed60[idx]||occupied60[idx]||t===TT.STAIR||(x===state.player.x&&y===state.player.y)||(reachable60&&!reachable60.has(k(x,y)))||!ReachabilityService.playerTerrainPassable(x,y)||globalThis.__MANRU_HAZARD_CORE__?.kind?.(t))continue;found=idx;break}
      if(found<0)found=state.player.y*COLS+state.player.x;it.x=found%COLS;it.y=(found/COLS)|0;itemUsed60[found]=1;PlacementService.placeItem(it)
    }
  }




  function markOuterWall94(r){state.outerWall94=state.outerWall94||{};for(let x=r.x;x<r.x+r.w;x++){if(in60(x,r.y-1))state.outerWall94[k(x,r.y-1)]=1;if(in60(x,r.y+r.h))state.outerWall94[k(x,r.y+r.h)]=1}for(let y=r.y;y<r.y+r.h;y++){if(in60(r.x-1,y))state.outerWall94[k(r.x-1,y)]=1;if(in60(r.x+r.w,y))state.outerWall94[k(r.x+r.w,y)]=1}}


  function syncFloor23Gate60(){const q=state.floor23;if(state.floor!==23||!q)return false;for(const c of q.gateCells||[])setTerrainTile58(state.map,c.x,c.y,q.centerUnlocked?TT.DRAWBRIDGE_DOWN:TT.WALL);return true}
  function materializeFloor23Reveal60(sw){
    const branch=sw?.kind==='branch-reveal',q=state.floor23,r=branch?state.branchTerrain105?.reveals?.find(v=>v.switchId===sw.id):q?.reveal;if((!branch&&state.floor!==23)||!r||sw?.id!==r.switchId)return{handled:false};if(r.materialized||sw.used||sw.disabled)return{handled:true,changed:false,materialized:!!r.materialized};
    if(branch&&(r.cells||[]).some(c=>branchLeafAt(c.x,c.y)&&state.map[c.y]?.[c.x]===TT.PAPER_BRIDGE)){toast('잎사귀가 걸려 수문이 작동하지 않는다. 모든 잎을 없애야 한다.');return{handled:true,changed:false,reason:'leaves-block'}}
    const occupiedBefore=(r.cells||[]).filter(c=>runtimeTerrainOccupants57(c.x,c.y).length);if(occupiedBefore.length){toast('침수 구역에 누군가 있다. 뭍으로 물러나야 한다.');return{handled:true,changed:false,reason:'reveal-occupied',occupied:occupiedBefore.length}}
    if(branch&&(r.cells||[]).some(c=>tileBlocks(c.t)&&state.items.some(i=>i.x===c.x&&i.y===c.y))){toast('올라올 구조물 위에 물품이 걸려 있다.');return{handled:true,changed:false,reason:'reveal-item-occupied'}}
    for(const c of r.cells||[]){if(Number.isInteger(c.underlay)){const base=RuntimeTerrainOwner.mutate(c.x,c.y,c.underlay,{source:'f23-reveal-drain-base'});if(!base.ok)throw new Error(`F23 reveal base restore failed ${c.x},${c.y}:${base.reason}`)}const rr=RuntimeTerrainOwner.mutate(c.x,c.y,c.t,{source:'f23-reveal-drain'});if(!rr.ok||state.map[c.y]?.[c.x]!==c.t)throw new Error(`F23 reveal restore failed ${c.x},${c.y}:${rr.reason||'tile-rejected'}`)}
    const legal=(r.cells||[]).filter(c=>!tileBlocks(state.map[c.y]?.[c.x])&&![TT.MERCURY,TT.WATER,TT.LAVA,TT.VOID,TT.STAIR,TT.DOOR,TT.OPEN_DOOR].includes(state.map[c.y]?.[c.x])).sort((a,b)=>(Math.abs(b.x-sw.x)+Math.abs(b.y-sw.y))-(Math.abs(a.x-sw.x)+Math.abs(a.y-sw.y))),spawned=[];
    for(let i=0;i<(r.monsterNames||[]).length;i++){const name=r.monsterNames[i];let mon=null;for(const c of legal){if(spawned.some(v=>v.x===c.x&&v.y===c.y))continue;mon=spawnNamed(name,{x:c.x,y:c.y},{placementMode:'exact',provenance:'f23-reveal'});if(mon)break}if(mon)spawned.push({name:mon.name,x:mon.x,y:mon.y})}
    produceWallMaterials105();r.materialized=true;r.used=true;r.spawnBatches=(r.spawnBatches||0)+1;r.spawnedIds=spawned.map(v=>`${v.name}@${v.x},${v.y}`);sw.used=true;sw.disabled=true;impact(sw.x,sw.y,'#bde8e6',5);for(const c of (r.cells||[]).filter((_,i)=>i%Math.max(1,Math.floor((r.cells||[]).length/10))===0).slice(0,10))impact(c.x,c.y,'#d7f4f2',2);if(branch)branchRevealReward(r);addLog(branch?'수위가 낮아지며 물 아래의 석조 구조물이 솟아올랐다.':`제 ${r.districtId}구역의 수은 수위가 내려가며 잠겨 있던 건물군이 드러났다.`);toast('침수 구역 배수 완료');VisibilityService.compute();updateAll();return{handled:true,changed:true,materialized:true,spawned}
  }

  function floodSpecial60(start,opts={}){const q=[{x:start.x,y:start.y,d:0}],seen=new Map([[k(start.x,start.y),0]]),gate23=new Set((state.floor23?.gateCells||[]).map(c=>k(c.x,c.y))),gate24=new Set((state.floor24?.entranceGateCells||[]).map(c=>k(c.x,c.y)));for(let i=0;i<q.length;i++){const a=q[i];for(const[dx,dy]of DIRS4){const x=a.x+dx,y=a.y+dy,kk=k(x,y);if(x<1||y<1||x>=COLS-1||y>=ROWS-1||seen.has(kk))continue;let t=state.map[y][x];if(t===TT.DOOR)t=TT.OPEN_DOOR;if(gate23.has(kk)){if(opts.centerOpen===true)t=TT.DRAWBRIDGE_DOWN;else if(opts.centerOpen===false)t=TT.WALL}if(gate24.has(kk)){if(opts.entranceOpen===true)t=TT.OPEN_DOOR;else if(opts.entranceOpen===false)t=TT.LOCKED_GATE}if(tileBlocks(t)||[TT.MERCURY,TT.WATER,TT.LAVA,TT.VOID].includes(t))continue;seen.set(kk,a.d+1);q.push({x,y,d:a.d+1})}}return seen}
  function validate23Progress60(){
    const q=state.floor23;if(state.floor!==23||!q)return{ok:false,reason:'missing-floor23-state'};const closed=floodSpecial60(state.player,{centerOpen:false}),opened=floodSpecial60(state.player,{centerOpen:true}),has=p=>closed.has(k(p.x,p.y)),hasOpen=p=>opened.has(k(p.x,p.y));const controls=q.controls||[],switches=(q.switchIds||[]).map(id=>state.switches?.find(v=>v.id===id)),switchReach=switches.every((sw,i)=>controls[i]?.activated||(sw&&state.map[sw.y]?.[sw.x]===TT.SWITCH&&has(sw))),routeDistances=(q.routeCheckpoints||[]).map(p=>closed.get(k(p.x,p.y))??Infinity),snailOrder=routeDistances.every((d,i)=>Number.isFinite(d)&&(i===0||d>routeDistances[i-1]));const centerClosed=!has(q.centerEntry)&&!has(q.bossSpawn)&&!has(state.stairs),centerOpen=hasOpen(q.centerEntry)&&hasOpen(state.stairs),safeDrop=[...opened.keys()].some(kk=>{const[x,y]=kk.split(',').map(Number),t=state.map[y]?.[x];return x>=q.centerBounds.x&&x<q.centerBounds.x+q.centerBounds.w&&y>=q.centerBounds.y&&y<q.centerBounds.y+q.centerBounds.h&&!tileBlocks(t)&&![TT.MERCURY,TT.VOID,TT.WATER,TT.LAVA,TT.TRAP,TT.SNARE].includes(t)}),dragon=(state.monsters||[]).find(m=>m.name==='여의 수룡'&&m.hpThreshold57?.event==='f23-progress-key'),dragonCombatAccess=!!dragon&&[...opened.keys()].some(kk=>{const[x,y]=kk.split(',').map(Number);return Math.max(Math.abs(x-dragon.x),Math.abs(y-dragon.y))<=Math.max(1,dragon.reach||1)}),dragonReady=!!dragon&&dragon.x>=q.centerBounds.x&&dragon.x<q.centerBounds.x+q.centerBounds.w&&dragon.y>=q.centerBounds.y&&dragon.y<q.centerBounds.y+q.centerBounds.h&&dragonCombatAccess,exitClear=!(state.monsters||[]).some(m=>m.hp>0&&m.x===state.stairs.x&&m.y===state.stairs.y);
    const buildings=(state.featureRooms||[]).filter(r=>r.kind60==='f23-building'),shapes=new Set(buildings.map(r=>r.shape23).filter(Boolean)),materials=new Set(buildings.map(r=>r.material23).filter(Boolean)),mercuryCells=state.map.flat().filter(t=>t===TT.MERCURY).length,mercuryRatio=mercuryCells/(COLS*ROWS);let innerGround=0,innerMercury=0;for(const r of q.innerDistrictBounds||[])for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++){const t=state.map[y]?.[x];if(t===TT.MERCURY){innerMercury++;innerGround++}else if(!tileBlocks(t)&&![TT.DOOR,TT.OPEN_DOOR,TT.SWITCH].includes(t))innerGround++}const innerMercuryRatio=innerMercury/Math.max(1,innerGround);
    const mercurySeen=new Set(),components=[];for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++){const kk=k(x,y);if(state.map[y][x]!==TT.MERCURY||mercurySeen.has(kk))continue;const qq=[{x,y}];mercurySeen.add(kk);let n=0;for(let i=0;i<qq.length;i++){const a=qq[i];n++;for(const[dx,dy]of DIRS4){const xx=a.x+dx,yy=a.y+dy,k2=k(xx,yy);if(state.map[yy]?.[xx]===TT.MERCURY&&!mercurySeen.has(k2)){mercurySeen.add(k2);qq.push({x:xx,y:yy})}}}components.push(n)}components.sort((a,b)=>b-a);const mercuryConnected=(components[0]||0)>=90;
    const districtFloodRatios=(q.districts||[]).map(d=>{let mercury=0,dryWalkable=0;for(let y=d.y;y<d.y+d.h;y++)for(let x=d.x;x<d.x+d.w;x++){const t=state.map[y]?.[x];if(t===TT.MERCURY)mercury++;else if(!tileBlocks(t))dryWalkable++}return{id:d.id,seep:d.seep,ratio:mercury/Math.max(1,mercury+dryWalkable)}}),highSeep=districtFloodRatios.filter(d=>d.seep>=4),highSeepAverage=highSeep.reduce((n,d)=>n+d.ratio,0)/Math.max(1,highSeep.length),highSeepPeak=Math.max(0,...highSeep.map(d=>d.ratio));
    const hydraulicComponents23=(cells)=>{const src=new Set(cells.map(c=>k(c.x,c.y))),seen=new Set(),sizes=[];for(const kk of src){if(seen.has(kk))continue;const [sx,sy]=kk.split(',').map(Number),qq=[{x:sx,y:sy}];seen.add(kk);let n=0;for(let i=0;i<qq.length;i++){const a=qq[i];n++;for(const[dx,dy]of DIRS4){const k2=k(a.x+dx,a.y+dy);if(src.has(k2)&&!seen.has(k2)){seen.add(k2);qq.push({x:a.x+dx,y:a.y+dy})}}}sizes.push(n)}return sizes.sort((a,b)=>b-a)};
    const controlStats=controls.map(c=>{const cs=c.changes||[],drainCells=cs.filter(ch=>ch.before===TT.MERCURY&&ch.after!==TT.MERCURY),floodCells=cs.filter(ch=>ch.before!==TT.MERCURY&&ch.after===TT.MERCURY),bridge=cs.filter(ch=>ch.after===TT.DRAWBRIDGE_DOWN).length,drainComponents=hydraulicComponents23(drainCells),floodComponents=hydraulicComponents23(floodCells);return{id:c.switchId,type:c.type,total:cs.length,drain:drainCells.length,flood:floodCells.length,bridge,largestDrain:drainComponents[0]||0,largestFlood:floodComponents[0]||0}}),controlQuality=controls.length===4&&controlStats.every(c=>c.total>=30&&c.drain>=18&&c.flood>=8&&c.bridge>=6&&c.largestDrain>=12&&c.largestFlood>=6);
    const transitBuildings=q.transitBuildings||[],mustCross=transitBuildings.length>=7&&transitBuildings.every(tr=>{const blocked=new Set((tr.chokes||[]).map(c=>k(c.x,c.y))),qq=[{x:state.player.x,y:state.player.y}],seen=new Set([k(state.player.x,state.player.y)]);for(let i=0;i<qq.length;i++){const a=qq[i];for(const[dx,dy]of DIRS4){const x=a.x+dx,y=a.y+dy,kk=k(x,y);if(x<1||y<1||x>=COLS-1||y>=ROWS-1||seen.has(kk)||blocked.has(kk))continue;let t=state.map[y]?.[x];if(t===TT.DOOR)t=TT.OPEN_DOOR;if(tileBlocks(t))continue;seen.add(kk);qq.push({x,y})}}return !seen.has(k(tr.after.x,tr.after.y))});
    const qualityCurrent=buildings.length>=24&&shapes.size>=5&&materials.size>=4&&mercuryRatio>=.14&&mercuryRatio<=.34&&innerMercuryRatio>=.20&&highSeepAverage>=.38&&highSeepPeak>=.52&&mercuryConnected&&controlQuality&&mustCross;const pristineHydraulics=controls.every(c=>!c.activated)&&!q.centerUnlocked;if(!q.qualityBaseline60&&pristineHydraulics)q.qualityBaseline60={ok:qualityCurrent,buildings:buildings.length,shapeTypes:shapes.size,materialTypes:materials.size,mercuryRatio,innerMercuryRatio,highSeepAverage,highSeepPeak,mercuryConnected,controlQuality,mustCross};const qualityBaseline=q.qualityBaseline60||null,quality=qualityBaseline?!!qualityBaseline.ok:qualityCurrent;
    const reveal=q.reveal,revealSwitch=reveal?state.switches?.find(v=>v.id===reveal.switchId):null,revealKeys=new Set((reveal?.cells||[]).map(c=>k(c.x,c.y))),controlKeys=new Set((q.controls||[]).flatMap(c=>(c.changes||[]).map(ch=>k(ch.x,ch.y)))),routeKeys=new Set([...(q.routeCheckpoints||[]),...(q.gateCells||[]),q.centerEntry,q.bossSpawn,state.stairs].filter(Boolean).map(c=>k(c.x,c.y))),revealSwitchReach=!!revealSwitch&&revealSwitch.kind==='f23-reveal'&&has(revealSwitch),revealInitiallySubmerged=!!reveal?.initiallySubmerged&&(reveal.materialized||(reveal.cells||[]).every(c=>state.map[c.y]?.[c.x]===TT.MERCURY)),revealNoPrematureMonsters=!!reveal&&(reveal.materialized||(state.monsters||[]).every(m=>m.hp<=0||!revealKeys.has(k(m.x,m.y)))),revealOptional=!!reveal&&!q.switchIds.includes(reveal.switchId)&&switchReach&&centerOpen,revealNoControlOverlap=!!reveal&&[...revealKeys].every(kk=>!controlKeys.has(kk)&&!routeKeys.has(kk)),revealMaterializationMismatches=!!reveal&&reveal.materialized?(reveal.cells||[]).filter(c=>state.map[c.y]?.[c.x]!==c.t).map(c=>({x:c.x,y:c.y,expected:c.t,actual:state.map[c.y]?.[c.x]})):[],revealMaterialized=!!reveal&&(!reveal.materialized||revealMaterializationMismatches.length===0),revealSpawned=(state.monsters||[]).filter(m=>m.hp>0&&m.spawnProvenance57==='f23-reveal'),revealMonsterSpawnValid=!!reveal&&(!reveal.materialized||(reveal.spawnBatches===1&&revealSpawned.length>0&&revealSpawned.length<=(reveal.monsterNames||[]).length&&revealSpawned.every(m=>revealKeys.has(k(m.x,m.y))))),revealOneShot=!!reveal&&(reveal.spawnBatches||0)<=1&&(!reveal.materialized||!!revealSwitch?.disabled),revealSaveStateValid=!!reveal&&!!revealSwitch&&reveal.used===reveal.materialized&&revealSwitch.used===reveal.materialized&&(!reveal.materialized||revealSwitch.disabled===true),revealValid=revealSwitchReach&&revealInitiallySubmerged&&revealNoPrematureMonsters&&revealOptional&&revealNoControlOverlap&&revealMaterialized&&revealMonsterSpawnValid&&revealOneShot&&revealSaveStateValid;
    return{floor:23,switchReach,snailOrder,routeDistances,centerClosed,centerOpen,safeDrop,dragonReady,dragonCombatAccess,exitClear,gateCells:q.gateCells?.length||0,buildings:buildings.length,shapeTypes:[...shapes],materialTypes:[...materials],mercuryCells,mercuryRatio:+mercuryRatio.toFixed(3),innerMercuryRatio:+innerMercuryRatio.toFixed(3),districtFloodRatios:districtFloodRatios.map(d=>({id:d.id,seep:d.seep,ratio:+d.ratio.toFixed(3)})),highSeepAverage:+highSeepAverage.toFixed(3),highSeepPeak:+highSeepPeak.toFixed(3),mercuryComponents:components.slice(0,6),mandatoryTransitBuildings:transitBuildings.length,mustCross,controlStats,controlQuality,qualityCurrent,qualityBaseline,quality,revealDistrictId:reveal?.districtId??null,revealSwitchReach,revealInitiallySubmerged,revealNoPrematureMonsters,revealOptional,revealNoControlOverlap,revealMaterializationMismatches:revealMaterializationMismatches.slice(0,24),revealMaterialized,revealMonsterSpawnValid,revealOneShot,revealSaveStateValid,revealValid,ok:switchReach&&snailOrder&&centerClosed&&centerOpen&&safeDrop&&dragonReady&&exitClear&&(q.gateCells?.length===3)&&quality&&revealValid}
  }
  function reach24State60(opts={}){
    const q=state.floor24;if(state.floor!==24||!q)return{cells:new Set(),dist:new Map(),stateCount:0};const gateSet=new Set((q.entranceGateCells||[]).map(c=>k(c.x,c.y))),tileAt=(x,y)=>{let t=state.map[y]?.[x];if(gateSet.has(k(x,y))){if(opts.entranceOpen===true)t=TT.OPEN_DOOR;else if(opts.entranceOpen===false)t=TT.LOCKED_GATE}return t},occupiedKeys=new Set();if(opts.ignoreOccupants===false)for(const m of state.monsters||[])if(m.hp>0)for(const[ox,oy]of footprintOffsets(m))occupiedKeys.add(k(m.x+ox,m.y+oy));
    const start=opts.start||state.player,cells=new Set([k(start.x,start.y)]),dist=new Map([[k(start.x,start.y),0]]),queue=[{x:start.x,y:start.y}],allowBlink=opts.allowBlink!==false,range=Math.max(1,Math.min(4,Math.floor(opts.blinkRange??4))),stand=(x,y)=>x>=0&&y>=0&&x<COLS&&y<ROWS&&ReachabilityService.playerTerrainPassable(x,y,{tileAt})&&(opts.ignoreOccupants!==false||!occupiedKeys.has(k(x,y)));
    for(let i=0;i<queue.length;i++){const a=queue[i],nd=(dist.get(k(a.x,a.y))||0)+1;for(const[dx,dy]of DIRS8){const x=a.x+dx,y=a.y+dy,kk=k(x,y);if(!cells.has(kk)&&stand(x,y)){cells.add(kk);dist.set(kk,nd);queue.push({x,y})}}if(!allowBlink)continue;for(const[dx,dy]of DIRS8)for(let d=1;d<=range;d++){const x=a.x+dx*d,y=a.y+dy*d;if(x<0||y<0||x>=COLS||y>=ROWS)break;const t=tileAt(x,y);if(blinkHardBlock(t))break;const hazard=globalThis.__MANRU_HAZARD_CORE__?.kind?.(t)||[TT.VOID,TT.WATER,TT.LAVA,TT.MERCURY].includes(t);if(hazard)continue;const kk=k(x,y);if(!cells.has(kk)&&stand(x,y)){cells.add(kk);dist.set(kk,nd);queue.push({x,y})}if(t===TT.PORTAL)break}}
    return{cells,dist,stateCount:cells.size,tileAt,range}
  }
  function validate24Progress60(){
    const q=state.floor24;if(state.floor!==24||!q)return{ok:false,reason:'missing-floor24-state'};const closedWalk=reach24State60({entranceOpen:false,allowBlink:false,ignoreOccupants:true}),closedBlink=reach24State60({entranceOpen:false,allowBlink:true,blinkRange:4,ignoreOccupants:true}),closedExact=reach24State60({entranceOpen:false,allowBlink:true,blinkRange:4,ignoreOccupants:false}),openedWalk=reach24State60({entranceOpen:true,allowBlink:false,ignoreOccupants:true}),openedBlink=reach24State60({entranceOpen:true,allowBlink:true,blinkRange:4,ignoreOccupants:true}),opened=floodSpecial60(state.player,{entranceOpen:true}),key=q.entranceKey,gateSet=new Set((q.entranceGateCells||[]).map(c=>k(c.x,c.y))),b=q.building;let perimeterLeaks=[];for(let x=b.x;x<b.x+b.w;x++)for(const y of [b.y,b.y+b.h-1])if(!gateSet.has(k(x,y))&&!tileBlocks(state.map[y][x]))perimeterLeaks.push({x,y});for(let y=b.y+1;y<b.y+b.h-1;y++)for(const x of [b.x,b.x+b.w-1])if(!gateSet.has(k(x,y))&&!tileBlocks(state.map[y][x]))perimeterLeaks.push({x,y});
    const plan=state.keyPlan96,brass=plan?.groups?.find(g=>g.keyId==='brass'),doors=brass?.doors||[],doorCoords=new Set(doors.map(d=>k(d.x,d.y))),planMatches=plan?.kind==='f24-grand-entrance'&&(plan?.groups?.filter(g=>g.keyId==='brass').length===1)&&doors.length===3&&(q.entranceGateCells||[]).every(c=>doorCoords.has(k(c.x,c.y)))&&(plan?.keys||[]).filter(v=>v.keyId==='brass'&&v.active!==false).length===1&&(plan?.keys||[]).some(v=>v.keyId==='brass'&&v.x===key.x&&v.y===key.y),gumi=(state.monsters||[]).find(m=>m.floor24Chaser57),gumiDef=MONSTERS.find(d=>d.name==='구미묘'),gumiExpected=gumiDef?scaledMonster(gumiDef):null,keyReach=closedWalk.cells.has(k(key.x,key.y)),keyTile=state.map[key.y]?.[key.x]===TT.KEY_TILE,insideKeys=[...closedBlink.cells].filter(kk=>{const[x,y]=kk.split(',').map(Number);return x>b.x&&x<b.x+b.w-1&&y>b.y&&y<b.y+b.h-1}),blinkBypassBeforeKey=insideKeys.length>0||closedBlink.cells.has(k(state.stairs.x,state.stairs.y)),blinkBypassBeforeGate=blinkBypassBeforeKey,sealed=!closedBlink.cells.has(k(q.interiorAnchor.x,q.interiorAnchor.y))&&!closedBlink.cells.has(k(state.stairs.x,state.stairs.y)),walkReachAfterGate=openedWalk.cells.has(k(q.interiorAnchor.x,q.interiorAnchor.y))&&openedWalk.cells.has(k(state.stairs.x,state.stairs.y))&&(q.majorAnchors||[]).every(p=>openedWalk.cells.has(k(p.x,p.y))),progressionReachAfterGate=openedBlink.cells.has(k(q.interiorAnchor.x,q.interiorAnchor.y))&&openedBlink.cells.has(k(state.stairs.x,state.stairs.y))&&(q.majorAnchors||[]).every(p=>openedBlink.cells.has(k(p.x,p.y))),openReach=progressionReachAfterGate,majorReach=(q.majorAnchors||[]).every(p=>openedWalk.cells.has(k(p.x,p.y))),interiorArea=Math.max(1,(b.w-2)*(b.h-2)),interiorWalkable=(()=>{let n=0;for(let y=b.y+1;y<b.y+b.h-1;y++)for(let x=b.x+1;x<b.x+b.w-1;x++)if(!tileBlocks(state.map[y][x]))n++;return n})(),interiorOpenRatio=interiorWalkable/interiorArea,gumiTraitConfig=!!gumi&&!!gumiExpected&&gumi.miniBoss===true&&gumi.fixedStats57!==true&&gumi.slow!==true&&!gumi.actionLag57&&gumi.exitPressureSpeed57?.min===.5&&gumi.exitPressureSpeed57?.max===1.5&&gumi.gumiBehaviorVersion57===4&&gumi.corpseRelocateSpan57===21&&gumi.corpseRelocateMinRadius57===6&&gumi.floor24Chaser57===true&&gumi.persistentChase57===true&&gumi.revivalLives57===9&&gumi.reviveWeakTurns57===2&&Math.abs((gumi.reviveWeakAtkMul57??0)-.65)<1e-9&&Math.abs((gumi.reviveWeakDefMul57??0)-.75)<1e-9&&gumi.reviveWeakEvaDelta57===-2&&Math.abs((gumi.reviveFullAtkMul57??0)-1.35)<1e-9&&Math.abs((gumi.reviveFullDefMul57??0)-1.20)<1e-9&&gumi.reviveFullEvaDelta57===2&&gumi.deathCountsAsLosBreak57===true&&gumi.gumiScaleVersion57===3&&gumi.maxHp===gumiExpected.maxHp&&gumi.baseAtk57===gumiExpected.atk&&gumi.baseDef57===gumiExpected.def&&gumi.baseEva57===gumiExpected.eva&&gumi.warningAura57===20&&Math.abs((gumi.exitPressureSense57?.start??0)-.38)<1e-9&&Math.abs((gumi.exitPressureSense57?.exact??0)-.76)<1e-9&&(gumi.exitPressureSense57?.maxError===6)&&(gumi.exitPressureSense57?.interval===2)&&Array.isArray(gumi.losLostSummon57?.names)&&gumi.losLostSummon57.names.length===2&&gumi.losLostSummon57.normalCooldown===7&&gumi.losLostSummon57.fullCooldown===4,gumiRuntimeStateValid=!!gumi&&Number.isFinite(gumi.livesRemaining57)&&gumi.livesRemaining57>=1&&gumi.livesRemaining57<=9&&['normal','corpse','reviving','full'].includes(gumi.revivePhase57||'normal'),gumiValid=!!gumi&&gumiTraitConfig&&gumiRuntimeStateValid&&gumi.x>=b.x&&gumi.x<b.x+b.w&&gumi.y>=b.y&&gumi.y<b.y+b.h&&PlacementService.terrainStandable(gumi,state.map[gumi.y][gumi.x]),gateClear=(q.entranceGateCells||[]).every(c=>!(state.monsters||[]).some(m=>m.hp>0&&m.x===c.x&&m.y===c.y)),exitClear=!(state.monsters||[]).some(m=>m.hp>0&&m.x===state.stairs.x&&m.y===state.stairs.y);
    const zoneTypes=new Set((state.featureRooms||[]).filter(r=>r.estate24).map(r=>r.kind60)),windows=(q.windowCells||[]).filter(c=>state.map[c.y]?.[c.x]===TT.WINDOW).length,decor=(q.decorCells||[]).filter(c=>state.map[c.y]?.[c.x]===c.t).length,decorAudit=q.decorAudit||{attempted:0,placed:0,failed:[{}],byRoom:{}},decorPlanComplete=decorAudit.attempted>0&&decorAudit.placed===decorAudit.attempted&&(decorAudit.failed||[]).length===0&&Object.keys(decorAudit.byRoom||{}).length>=15&&Object.values(decorAudit.byRoom||{}).every(v=>v.attempted>0&&v.placed===v.attempted&&!(v.failed||[]).length),graph=q.connectionGraph||{nodes:[],edges:[]},loopRank=Math.max(0,(graph.edges?.length||0)-(graph.nodes?.length||0)+1),gateCenter=q.entranceGateCells?.[1]||q.entranceGateCells?.[0],routeStart=gateCenter?{x:gateCenter.x,y:gateCenter.y-1}:null;
    const pathMetrics=(()=>{if(!routeStart)return{distance:Infinity,bends:0};const start=routeStart,goal=state.stairs,qq=[start],prev=new Map(),seen=new Set([k(start.x,start.y)]);let found=false;for(let i=0;i<qq.length&&!found;i++){const a=qq[i];for(const[dx,dy]of DIRS4){const x=a.x+dx,y=a.y+dy,kk=k(x,y);if(x<1||y<1||x>=COLS-1||y>=ROWS-1||seen.has(kk))continue;let t=state.map[y][x];if(gateSet.has(kk))t=TT.OPEN_DOOR;if(tileBlocks(t)||[TT.WATER,TT.MERCURY,TT.VOID,TT.LAVA].includes(t))continue;seen.add(kk);prev.set(kk,{x:a.x,y:a.y});qq.push({x,y});if(x===goal.x&&y===goal.y){found=true;break}}}if(!found)return{distance:Infinity,bends:0};const pts=[{x:goal.x,y:goal.y}];let cur={x:goal.x,y:goal.y};while(!(cur.x===start.x&&cur.y===start.y)){const p=prev.get(k(cur.x,cur.y));if(!p)break;pts.push(p);cur=p}pts.reverse();let bends=0,last=null;for(let i=1;i<pts.length;i++){const dir=[Math.sign(pts[i].x-pts[i-1].x),Math.sign(pts[i].y-pts[i-1].y)].join(',');if(last&&dir!==last)bends++;last=dir}return{distance:pts.length-1,bends}})();
    const routeDistance=pathMetrics.distance,direct=routeStart?Math.abs(routeStart.x-state.stairs.x)+Math.abs(routeStart.y-state.stairs.y):1,routeDetour=routeDistance/Math.max(1,direct);
    const estateRooms=(state.featureRooms||[]).filter(r=>r.estate24&&!r.featureSegment24),cx=b.x+b.w/2,symmetricPairs=estateRooms.filter((r,i)=>estateRooms.some((s,j)=>j>i&&r.kind60===s.kind60&&Math.abs((r.cx??(r.x+r.w/2))+(s.cx??(s.x+s.w/2))-2*cx)<2&&Math.abs(r.y-s.y)<2&&Math.abs(r.w-s.w)<2&&Math.abs(r.h-s.h)<2)).length,asymmetricLayout=symmetricPairs<=1;
    const protectedSet=new Set((q.reinforcementProtectedCells||[]).map(c=>k(c.x,c.y))),reinforcementProtectedCellsValid=protectedSet.size>0&&(q.entranceGateCells||[]).every(c=>protectedSet.has(k(c.x,c.y)))&&protectedSet.has(k(state.stairs.x,state.stairs.y))&&protectedSet.size<Math.max(80,interiorWalkable*.35)&&q.reinforcementProtectionAudit?.gateProtected===true&&q.reinforcementProtectionAudit?.stairsProtected===true,occupantConditionValid=[...closedExact.cells].every(kk=>closedBlink.cells.has(kk));
    const openTile24=(x,y)=>{let t=state.map[y]?.[x];if(t===TT.DOOR||gateSet.has(k(x,y)))t=TT.OPEN_DOOR;return x>0&&y>0&&x<COLS-1&&y<ROWS-1&&!tileBlocks(t)&&![TT.WATER,TT.MERCURY,TT.VOID,TT.LAVA].includes(t)},detachedPassable=[];for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++)if(openTile24(x,y)&&!openedWalk.cells.has(k(x,y)))detachedPassable.push({x,y,t:state.map[y][x]});const isolatedPassableCount=detachedPassable.length;
    const reachableItems=(state.items||[]).filter(i=>Number.isFinite(i.x)&&Number.isFinite(i.y)),badItems=reachableItems.filter(i=>!openedWalk.cells.has(k(i.x,i.y))).map(i=>({name:i.name,x:i.x,y:i.y})),badMonsters=(state.monsters||[]).filter(m=>m.hp>0&&!openedWalk.cells.has(k(m.x,m.y))).map(m=>({name:m.name,x:m.x,y:m.y})),spawnReachable=badItems.length===0&&badMonsters.length===0;
    const expectedEaves=new Set((q.northEavesCells||[]).map(c=>k(c.x,c.y))),featureEaves=new Set();for(const f of (state.featureRooms||[]).filter(r=>r.featureSegment24&&r.kind60==='north-eaves'))for(let y=f.y;y<f.y+f.h;y++)for(let x=f.x;x<f.x+f.w;x++)if(state.zoneByCell?.[k(x,y)]==='north-eaves'||q.zoneByCell?.[k(x,y)]==='north-eaves'||state.floor24?.zoneByCell?.[k(x,y)]==='north-eaves')featureEaves.add(k(x,y));const featureMaskMatches=expectedEaves.size>0&&featureEaves.size===expectedEaves.size&&[...expectedEaves].every(kk=>featureEaves.has(kk));
    const gardenDetailCount=(q.gardenDetailCells||[]).filter(c=>state.map[c.y]?.[c.x]===c.t).length,gardenDetailed=gardenDetailCount>=18;
    const estateQuality=majorReach&&interiorOpenRatio>=.22&&interiorOpenRatio<=.46&&zoneTypes.size>=9&&windows>=28&&decor>=30&&decorPlanComplete&&loopRank>=7&&routeDistance>=150&&routeDetour>=1.8&&pathMetrics.bends>=14&&asymmetricLayout&&isolatedPassableCount===0&&spawnReachable&&featureMaskMatches&&gardenDetailed;
    return{floor:24,keyReach,keyTile,sealed,blinkBypassBeforeKey,blinkBypassBeforeGate,walkReachAfterGate,progressionReachAfterGate,openReach,majorReach,closedBlinkStateCount:closedBlink.stateCount,closedExactStateCount:closedExact.stateCount,occupantConditionValid,interiorWalkable,interiorOpenRatio:+interiorOpenRatio.toFixed(3),zoneTypes:[...zoneTypes],windows,decor,decorAttempted:decorAudit.attempted,decorPlaced:decorAudit.placed,decorFailures:(decorAudit.failed||[]).length,decorPlanComplete,loopRank,routeDistance,direct,routeDetour:+routeDetour.toFixed(2),pathBends:pathMetrics.bends,symmetricPairs,asymmetricLayout,isolatedPassableCount,detachedPassable:detachedPassable.slice(0,24),badItems,badMonsters,spawnReachable,featureMaskMatches,northEavesMaskCells:expectedEaves.size,northEavesFeatureCells:featureEaves.size,gardenDetailCount,gardenDetailed,estateQuality,perimeterLeaks,uniqueEntrance:perimeterLeaks.length===0&&q.entranceGateCells?.length===3,planMatches,gumiTraitConfig,gumiRuntimeStateValid,gumiValid,gateClear,exitClear,reinforcementProtectedCount:protectedSet.size,reinforcementProtectedCellsValid,reinforcementCap:q.reinforcementCap57??null,ok:keyReach&&keyTile&&sealed&&!blinkBypassBeforeKey&&!blinkBypassBeforeGate&&walkReachAfterGate&&progressionReachAfterGate&&estateQuality&&perimeterLeaks.length===0&&q.entranceGateCells?.length===3&&planMatches&&gumiValid&&gateClear&&exitClear&&reinforcementProtectedCellsValid&&occupantConditionValid}

  }

  function onMonsterHpThreshold60(mon,threshold){if(state.floor!==23||threshold?.event!=='f23-progress-key'||!state.floor23)return false;const q=state.floor23;if(q.thresholdTriggered)return false;q.thresholdTriggered=true;const p=safeProgressDrop23(mon);if(!p)throw new Error('F23 progress key has no reachable safe drop');const item={name:'수은 심부 열쇠',type:'progress_key23',rarity:'rare',identified:true,count:1,stackable:false,x:p.x,y:p.y,color:'#d8f2ef'};PlacementService.placeItem(item,p);addLog('여의 수룡의 힘이 절반 아래로 꺾이자 수은 심부 열쇠가 튕겨 나왔다.');burst(p.x,p.y,'#d8f2ef',22,1);return true}
  function onTypedGateOpened60(plan,keyId){if(state.floor!==24||keyId!=='brass'||plan?.kind!=='f24-grand-entrance'||!state.floor24)return false;state.floor24.chaseStarted=true;const g=(state.monsters||[]).find(m=>m.floor24Chaser57);if(g){g.dormant57=false;g.alerted=true;g.exitPressureSpeedBudget57=0;g.searchTurns=Math.max(g.searchTurns||0,18);g.lastSeenPosition={x:state.player.x,y:state.player.y,bornTurn:state.floorTurn||0}}addLog('대형 현관이 열리자 건물 깊숙한 곳에서 구미묘의 울음이 울렸다.');return true}
  function validateSpecial60(){return state.floor===23?validate23Progress60():state.floor===24?validate24Progress60():{ok:true,floor:state.floor}}

  /* ---------- deterministic F23/F24 runtime QA hooks ---------- */
  let qaSnapshot60=null;

  function qaMark60(){qaSnapshot60=captureGenerationSnapshot();return{floor:state.floor,hash:qaHash60()}}




  function qaThreshold23_60(){
    if(state.floor!==23)return{ok:false,reason:'not-f23'};const dragon=(state.monsters||[]).find(m=>m.name==='여의 수룡'&&m.hp>0);if(!dragon)return{ok:false,reason:'missing-dragon'};
    const before=dragon.hp,amount=Math.max(1,Math.floor(dragon.maxHp*.51)+1);damageEntity(dragon,amount,state.player);const item=(state.items||[]).find(i=>i.type==='progress_key23');
    return{ok:!!state.floor23?.thresholdTriggered&&!!item,before,after:dragon.hp,maxHp:dragon.maxHp,item:item?{x:item.x,y:item.y,name:item.name}:null,thresholdTriggered:!!state.floor23?.thresholdTriggered};
  }
  function qaPickupProgressKey23_60(){
    if(state.floor!==23)return{ok:false,reason:'not-f23'};const item=(state.items||[]).find(i=>i.type==='progress_key23');if(!item)return{ok:false,reason:'missing-progress-key'};
    state.player.x=item.x;state.player.y=item.y;OccupancyService.move(state.player,state.player.x,state.player.y);const picked=pickupBaseR25();return{ok:!!picked&&!!state.floor23?.keyAcquired,picked:!!picked,keyAcquired:!!state.floor23?.keyAcquired};
  }
  function qaDescend60(){
    if(!state?.stairs)return{ok:false,reason:'no-stairs'};const from=state.floor,beforeOwner=gameplayInputOwner57().kind;closeGameplayInteractionState57();const pre={run:runState57(),input:gameplayInputAllowed57(),stun:state.status?.stun||0,dead:!!state.dead,victory:!!state.victory,beforeOwner,owner:gameplayInputOwner57().kind};state.player.x=state.stairs.x;state.player.y=state.stairs.y;OccupancyService.move(state.player,state.player.x,state.player.y);const result=descend();return{ok:!!result&&state.floor===from+1,result:!!result,from,to:state.floor,pre};
  }


  function qaClearHostiles60(){const n=(state.monsters||[]).filter(m=>m.hp>0).length;state.monsters=[];return n}



  function qaF24Summons60(n=12){
    if(state.floor!==24)return{ok:false,reason:'not-f24'};const q=state.floor24,protectedSet=new Set((q.reinforcementProtectedCells||[]).map(c=>k(c.x,c.y))),source=(state.monsters||[]).find(v=>v.floor24Chaser57)||null,names=source?.losLostSummon57?.names||['처녀귀신','굶주린 쥐'],events=[];for(let i=0;i<Math.max(1,Math.min(40,+n||12));i++){const name=names[i%names.length],m=spawnPressureReinforcement57(source,name);events.push(m?{x:m.x,y:m.y,name:m.name,protected:protectedSet.has(k(m.x,m.y))}:null)}
    const active=(state.monsters||[]).filter(m=>m.hp>0&&m.spawnProvenance57==='los-lost-summon'),bad=active.filter(m=>protectedSet.has(k(m.x,m.y)));return{ok:active.length<=(q.reinforcementCap57||3)&&bad.length===0,attempts:events.length,events,active:active.map(m=>({x:m.x,y:m.y,name:m.name})),cap:q.reinforcementCap57||3,bad};
  }

  function qaF24ItemReach60(){if(state.floor!==24)return{ok:false,reason:'not-f24'};const reach=reach24State60({entranceOpen:true,allowBlink:false,ignoreOccupants:true}),items=(state.items||[]).filter(i=>Number.isFinite(i.x)&&Number.isFinite(i.y)),unreachable=items.filter(i=>!reach.cells.has(k(i.x,i.y))).map(i=>({name:i.name,x:i.x,y:i.y,type:i.type}));return{ok:unreachable.length===0,total:items.length,unreachable,walkCells:reach.cells.size}}
  function qaF24VisualTargets60(){
    if(state.floor!==24)return null;
    const roomKind=name=>{const r=(state.featureRooms||[]).find(v=>v.estate24&&v.kind60===name);return r?{x:r.cx??r.x+Math.floor(r.w/2),y:r.cy??r.y+Math.floor(r.h/2),kind:name,name:r.name}:null},
      roomNamed=text=>{const r=(state.featureRooms||[]).find(v=>v.estate24&&String(v.name||'').includes(text));return r?{x:r.cx??r.x+Math.floor(r.w/2),y:r.cy??r.y+Math.floor(r.h/2),kind:r.kind60,name:r.name}:null};
    const hall=roomKind('great-hall');
    return{greatHall:hall,banquet:hall,library:roomKind('library'),bedroom:roomKind('inner-wing'),study:roomKind('sarangchae'),tea:roomKind('tea-room'),service:roomKind('haengrang'),courtyard:roomNamed('비정형 중정')||roomKind('courtyard'),northGallery:roomNamed('북측 분절 창호 추격회랑')||roomKind('north-eaves'),exit:{x:state.stairs.x,y:state.stairs.y,kind:'exit'}}
  }

  function qaCleanHud60(on=true){
    document.documentElement.classList.toggle('qa-clean-capture60',!!on);return document.documentElement.classList.contains('qa-clean-capture60')
  }

  globalThis.__MANRU_SPECIAL_FLOORS60__=Object.freeze({activateSwitch:activateFloor23Switch60,sync23:syncFloor23Gate60,onMonsterHpThreshold:onMonsterHpThreshold60,onTypedGateOpened:onTypedGateOpened60,validate:validateSpecial60,flood:floodSpecial60,reach24:reach24State60,validate23:validate23Progress60,validate24:validate24Progress60,qa:qa60});



  registerGenerationStage('special60-pre','pre',()=>{state.featureRooms=[];state.landmarks=[];state.guardRooms59=[];state.hiddenGroups60={};state.hiddenLookup60={};state.hiddenBase60={};state.hiddenReplacement60={};state.crumbleBase60={}});
  registerGenerationStage('special60-post','post',()=>{const f=state.floor;if(SPECIAL60.has(f)||BOSS_FLOORS.has(f))rebuildSpecial60(f)});
  // r53: removed generation-on-load stage special60; saved geometry is authoritative.



  /* ---------- test/screenshot hooks ---------- */

/* r53: removed the overwritten v6.0 overview camera. */
/* ===== MANRU v6.1: ENEMY DENSITY / TACTICAL ROLES / SMART STRUCTURE INPUT ===== */
const spawnRanges61=[[1,1,9,9],[2,5,8,11],[6,10,10,13],[11,15,11,14],[16,20,13,16],[21,24,14,18]];
  for(const r of SPAWN_RULES){const q=spawnRanges61.find(v=>r.from===v[0]&&r.to===v[1]);if(q)r.count=[q[2],q[3]]}
  Object.assign(SPECIAL_BASE_COUNTS,{2:10,4:11,6:12,8:12,11:13,13:14,16:13,18:14,20:9,21:13,22:15,23:14,24:12});
  const TARGET61={2:13,4:16,6:25,8:24,11:26,13:29,16:32,18:32,21:28,22:43,23:12,24:9};
  const PACKS61={
    2:[['객잔 경비병','시종'],['취객','객잔 쥐','객잔 쥐'],['떠돌이 도둑','시종'],['거대 거미','객잔 쥐']],
    4:[['객잔 경비병','시종'],['취객','취객','객잔 쥐'],['떠돌이 도둑','거대 거미']],
    6:[['정원 바위괴물','수목 궁수'],['독꽃','검은 뱀'],['정원사 망령','먹물 정령'],['식인 물고기','식인 물고기']],
    8:[['독꽃','검은 뱀'],['정원사 망령','수목 궁수'],['먹물 정령','검은 뱀'],['정원 바위괴물','독꽃']],
    11:[['비단 술래','윈도'],['향기요정','비단 술래'],['분홍거미','윈도']],
    13:[['비단 술래','윈도','윈도'],['환각의 향로','향기요정'],['분홍거미','비단 술래']],
    16:[['경비 인형 - 보병','경비 인형 - 포병'],['성채 비행 감시자','경비 인형 - 보병'],['화염 가고일','경비 인형 - 보병'],['해자 잠복꾼','녹아내린 슬라임']],
    18:[['강시','식귀'],['산성 슬라임','굶주린 창고 쥐'],['경비 인형 - 보병','강시'],['식귀','식귀','굶주린 창고 쥐']],
    21:[['공허 가오리','차원 포식자'],['천수 아수라','신전 사제 망령'],['만루의 수호상','신전 사제 망령']],
    22:[['만루의 수호상','신전 사제 망령'],['천수 아수라','신전 사제 망령'],['차원 포식자','공허 가오리'],['공허 가오리','공허 가오리','천수 아수라']],
    23:[['천수 아수라','공허 가오리','공허 가오리'],['신전 사제 망령','차원 포식자','천수 아수라'],['만루의 수호상','천수 아수라'],['공허 가오리','천수 아수라','신전 사제 망령','공허 가오리']],
    24:[['보주의 파수꾼','신전 사제 망령','천수 아수라'],['차원 포식자','공허 가오리','공허 가오리'],['천수 아수라','신전 사제 망령','차원 포식자'],['보주의 파수꾼','천수 아수라','신전 사제 망령','공허 가오리']]
  };



















  function asuraDomainDist61(a,b){return Math.hypot((a?.x??0)-(b?.x??0),(a?.y??0)-(b?.y??0))}
  



  // Shell / formation defense is owned by combatDefenseBonus57 in both native attack bases.
  registerPlayerAttackStageR('asura-domain61',(next,m,b=0,...rest)=>{configureMonsterTraits(m);if(m?.role61==='asura'&&(m.asuraZone61||0)>0&&asuraDomainDist61(state.player,m)>(m.asuraRadius61||m.asuraRadius47||3)+.28){setPlayerAttackOutcome('blocked',m,{reason:'asura-domain'});m.alerted=true;floatText(m.x,m.y,'영역 밖 공격 무효','#d7b16e',9);addLog(`${m.name}의 아수라장이 영역 밖에서 시작된 직접 공격을 지웠다.`);return false}return next(m,b,...rest)});
  globalThis.__MANRU_AI61__={configure:configureMonsterTraits,special:specialTurn,artillery:artilleryTurn,intent:executeMonsterIntent};


  /* ---------- structure interaction: click/tap paths next to a blocked target, then opens or destroys it ---------- */
  const BREAK61=new Set([TT.TABLE,TT.SCREEN,TT.HEDGE,TT.BAMBOO,TT.FAKE_DOOR,TT.SECRET_DOOR,TT.LOCKED_GATE,TT.PEACH_TREE,TT.HIDDEN_BRIDGE,TT.HIDDEN_WALL]);
  const INTERACT61=new Set([TT.DOOR,...BREAK61]);
  // r57: structure noise / hedge / bamboo behavior is integrated into canonical bumpBlockedTile.
  function uiInputBlocked(){return !gameplayInputAllowed57()||!!window.__manruZoomActive}



  globalThis.__MANRU_DRAW_HOOKS_R19__?.world.push({id:'role61',draw:drawRoleOverlay});
  window.__MANRU_ASURA61__={
    blocksDirect:(m,origin=state?.player)=>!!(m&&origin&&m.role61==='asura'&&(m.asuraZone61||0)>0&&asuraDomainDist61(origin,m)>(m.asuraRadius61||m.asuraRadius47||3)+.28)
  };
  /* v9.8.6 inspect cleanup: removed legacy tactical-role prose-append wrapper. */
  registerPanelHook54('roles61',()=>{if(state){const near=state.monsters.filter(m=>m.role61&&isThreatVisibleToPlayer(m)).sort((a,b)=>entityDistance57(a,state.player)-entityDistance57(b,state.player))[0],el=document.getElementById('monsterInfo');if(near&&el&&!el.innerHTML.includes('role61'))el.innerHTML+=`<div class="role61" style="margin-top:5px;color:#d5b57d"><b>${ROLE_RUNE[near.role61]||'적'} ${near.role61}</b> · ${near.roleDesc61}</div>`}});

  function trimDecor61(){if(!state?.decor||state.decor.length<=120)return;const src=state.decor,keep=[],step=src.length/120;for(let i=0;i<120;i++)keep.push(src[Math.floor(i*step)]);state.decor=keep}
  registerGenerationStage('population61','post',()=>{if(!state)return;const hasBoss=state.monsters.some(m=>m.boss);if(!hasBoss)populate61();if(!hasBoss||state.floor===20){for(const m of state.monsters)configureMonsterTraits(m);VisibilityService.compute();vfBuildDecor();trimDecor61()}});


/* r53: camera984 owns camera snapshots; removed the dead camera61 cache/reset wrapper. */
/* v6.1 final render coordinator: one camera snapshot and one world renderer per update */
  const R61={last:0,lastMini:0,lastHud:0,dirty:true};

  

/* removed overwritten visualLoop */




  const feelEl=document.createElement('div');feelEl.id='floorFeeling62';document.getElementById('canvasWrap')?.appendChild(feelEl);
belt.id='tacticalBelt62';document.getElementById('canvasWrap')?.appendChild(belt);








  function roomFree62(r,x,y){return x>r.x&&y>r.y&&x<r.x+r.w-1&&y<r.y+r.h-1&&state.map[y]?.[x]===TT.FLOOR&&(x!==state.player.x||y!==state.player.y)&&(x!==state.stairs.x||y!==state.stairs.y)}
  function overlapRoom62(a,b){return !(a.x+a.w<=b.x||b.x+b.w<=a.x||a.y+a.h<=b.y||b.y+b.h<=a.y)}
  function chooseVaultRoom62(){const features=state.featureRooms||[],a=(state.rooms||[]).filter(r=>r.w>=7&&r.h>=6&&!(state.player.x>=r.x&&state.player.x<r.x+r.w&&state.player.y>=r.y&&state.player.y<r.y+r.h)&&!(state.stairs.x>=r.x&&state.stairs.x<r.x+r.w&&state.stairs.y>=r.y&&state.stairs.y<r.y+r.h)&&!features.some(f=>overlapRoom62(r,f)));return a.length?choice(a):null}

  function existingEnemies62(r){const pad=1;return state.monsters.filter(m=>!m.boss&&!m.fixed&&!m.aquatic&&!m.ranged&&m.hp>0&&m.x>=r.x-pad&&m.x<r.x+r.w+pad&&m.y>=r.y-pad&&m.y<r.y+r.h+pad)}


  function itemCellInRoom62(r){const a=[];for(let y=r.y+1;y<r.y+r.h-1;y++)for(let x=r.x+1;x<r.x+r.w-1;x++)if(state.map[y]?.[x]===TT.FLOOR&&!OccupancyService.isOccupied(x,y)&&!state.items.some(i=>i.x===x&&i.y===y)&&(x!==state.player.x||y!==state.player.y))a.push({x,y});return a.length?choice(a):null}




  registerGenerationStage('feeling62','post',()=>{if(state&&!state.monsters.some(m=>m.boss)){applyFeeling();applyMiniVault62();VisibilityService.compute();vfBuildDecor()}});



  function strategyItem62(i){if(!i)return false;if(i.type==='talisman')return true;if(i.type==='potion')return !['heal_small','heal_medium','makgeolli','focus'].includes(i.potionKind);if(i.type==='food')return ['전력 주먹밥','매콤한 육포','한방 생선찜','보신 전골','얼음 복숭아'].includes(i.name);return false}


  function beltItemKey62(item){return JSON.stringify([item.type,item.talismanKind||item.potionKind||item.name])}



  globalThis.__MANRU_BELT62__=Object.freeze({use(slot){if(uiInputBlocked())return false;const a=beltItems(),v=a[Number(slot)-1];return v?!!ActionDispatcher.dispatch({type:'ITEM_USE',args:[v.idx]}).value:false},items(){return beltItems().map(v=>({key:v.key,idx:v.idx}))}});

  registerPanelHook54('feeling62',()=>{updateFeelingUI();renderBelt();const d=document.getElementById('depthLore'),f=feeling62();if(d&&f&&!d.textContent.includes(`· ${f.name}`))d.textContent+=` · ${f.name}`});


  globalThis.__MANRU_DRAW_HOOKS_R19__?.post.push({id:'feeling62',draw:drawFeelingOverlay});

/* ===== MANRU v7.0 RELEASE CANDIDATE CORE ===== */
const RC={
    build:'r57 INPUT LOCK / HONEST CHAIN / SAVE VALIDATION',
    panelOpen:false,
    lastActionAt:0,
    lastDraw:0,
    lastMini:0,
    lastHud:0,
    lastViewport:0,
    vw:0,vh:0,
    saveBusy:false,
    autosaveTimer:0,
    lastAutosaveAt:0,
    tutorialQueue:[],
    tutorialShowing:false,
    uiAudio:null,
    uiGain:null,
    uiVolume:.35,
    textScale:1,
    perf:{frames:0,lastCost:0,ema:0}
  };




  function lsKeys70(){try{return Object.keys(localStorage)}catch(_){return Object.keys(memoryStorage)}}
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

  /* ---------- tiny UI sound ---------- */
  function uiTone70(freq=360,dur=.028){
    if(RC.uiVolume<=0)return;
    try{
      const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
      if(!RC.uiAudio)RC.uiAudio=new AC();
      if(RC.uiAudio.state==='suspended')RC.uiAudio.resume();
      const o=RC.uiAudio.createOscillator(),g=RC.uiAudio.createGain();o.type='square';o.frequency.value=freq;g.gain.value=.018*RC.uiVolume;
      g.gain.exponentialRampToValueAtTime(.0001,RC.uiAudio.currentTime+dur);o.connect(g).connect(RC.uiAudio.destination);o.start();o.stop(RC.uiAudio.currentTime+dur+.01);
    }catch(error){ignoreError('ui sound could not play',error)}
  }
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
  const STRUCT70=new Set([TT.DOOR,TT.TABLE,TT.SCREEN,TT.HEDGE,TT.BAMBOO,TT.FAKE_DOOR,TT.SECRET_DOOR,TT.LOCKED_GATE,TT.PEACH_TREE,TT.HIDDEN_BRIDGE,TT.HIDDEN_WALL]);

  function seenTip70(id){return !!tipLedger66().seen[id]}







  


  registerPickupStageR25('coach70',{post:ctx=>{
    const ground=ctx.ground;
    if(ground){
      if(ground.type==='potion')tip70('potion','약병은 런마다 색과 정체가 바뀐다. 발견 장소와 냄새·색 단서로 후보를 좁히고, 마시거나 감정부적으로 식별한다.','미확인 약병은 역할 탭도 숨겨진다.');
      else if(ground.type==='talisman')tip70('talisman','부적은 주문서와 폭탄 역할을 겸한다. 위기 탈출·봉쇄·지도·광역 공격에 아끼지 말고 써라.','전술벨트에서 빠르게 사용 가능');
      else if(ground.type==='food')tip70('food','음식은 허기 관리뿐 아니라 보스 전 도핑과 조리 재료다. 화로나 솥에서 비방 조합을 실험할 수 있다.','국밥처럼 먹는 턴이 긴 음식은 안전한 곳에서 사용');
      else if(ground.type==='weapon'&&ground.range>=7)tip70('bow','활은 적을 한 번 눌러 조준하고 다시 누르거나 공격을 눌러 발사한다. 사선과 장애물을 확인하라.','적을 길게 누르면 사격 가능 여부도 표시');
    }
  }});
  registerMovePreR8(ctx=>{RC.lastActionAt=performance.now();if(ctx.targetTile===TT.DOOR&&!trainingActive())tip70('door','닫힌 문은 시야를 끊는다. 열기 전에 회복·연막·퇴로를 준비하면 문 뒤 교전을 유리하게 시작할 수 있다.','문 여는 소리는 가까운 적을 경계시킨다.');return true});
  // r30: runtime item coaching/activity bookkeeping is integrated in canonical useInventoryItem.





  /* ---------- resource pacing / consumable strategy ---------- */

  function recovery70(i){return i&&(i.type==='food'||(i.type==='potion'&&['heal_small','heal_medium','makgeolli','focus','cleanse'].includes(i.potionKind)))}
  function tactical70(i){return i&&(i.type==='talisman'||(i.type==='potion'&&!['heal_small','heal_medium','makgeolli','focus'].includes(i.potionKind))||(i.type==='food'&&['전력 주먹밥','매콤한 육포','한방 생선찜','보신 전골','얼음 복숭아'].includes(i.name)))}
  function placeItem70(proto){
    if(!proto)return false;const p=PlacementService.randomFloor(0);if(!p)return false;const i=clone(proto);Object.assign(i,{x:p.x,y:p.y,count:i.count||1});PlacementService.placeItem(i);return true
  }
  function recoveryPool70(){
    const food=CONSUMABLES.filter(i=>i.type==='food'&&!['relic','sealed'].includes(i.rarity)&&!i.recipeResult57);
    const pots=(window.MANRU_POTIONS||[]).filter(i=>['heal_small','heal_medium','makgeolli','focus','cleanse'].includes(i.potionKind)&&(state.floor>=(i.minFloor||1)));
    return [...food,...pots];
  }
  function tacticalPool70(){
    const pots=(window.MANRU_POTIONS||[]).filter(i=>!['heal_small','heal_medium','makgeolli','focus'].includes(i.potionKind)&&(state.floor>=(i.minFloor||1)));
    const tal=(window.MANRU_TALISMANS||[]).filter(i=>state.floor>=(i.minFloor||1));
    return [...pots,...tal];
  }
  function pacing70(){
    if(!state)return;
    if(state.monsters.some(m=>m.boss)){state.floorFeeling62=null;state.miniVault62=null;return;}
    const ground=state.items||[],inv=state.player.inventory||[],all=[...ground,...inv];
    const preBoss=[4,9,14,19,24].includes(state.floor);
    if(!all.some(recovery70))placeItem70(foodOccurrencePick(recoveryPool70()));
    const dangerSpecial=[16,18,21,22,23].includes(state.floor);
    if((preBoss||dangerSpecial||state.floorFeeling62?.id==='traps'||state.floorFeeling62?.id==='war')&&!all.some(tactical70))placeItem70(choice(tacticalPool70()));
    // Ground clutter cap: preserve upgrades, relics, talismans and tactical items first.
    if(state.items.length>14){
      state.items=state.items.map((i,n)=>({i,n,s:(i.type==='upgrade'?100:0)+(['relic','sealed'].includes(i.rarity)?80:0)+(i.type==='talisman'?60:0)+(tactical70(i)?45:0)+(recovery70(i)?35:0)+(i.tier||0)*3}))
        .sort((a,b)=>b.s-a.s||a.n-b.n).slice(0,14).map(v=>v.i);
    }
  }
  function repairMonsters70(){
    if(!state?.monsters?.length)return 0;let moved=0;
    for(let pass=0;pass<2;pass++){
      for(const m of state.monsters){
        if(m.hp<=0||m.boss)continue;
        if(PlacementService.monsterCanStand(m,m.x,m.y))continue;
        const p=PlacementService.randomMonsterCell(m);
        if(p){m.x=p.x;m.y=p.y;moved++}
      }
    }
    return moved;
  }
  registerGenerationStage('pacing70','post',()=>{pacing70();state.repairedMonsters70=repairMonsters70();VisibilityService.compute()});

  /* ---------- autosave hooks (idle, not every turn) ---------- */
  DESCEND_EFFECTS53.push(()=>{RC.lastActionAt=performance.now()});
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


    
  refreshSlots();refreshSfx();refreshContinueStatus();

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
  window.__MANRU_RESUME_R6__={schedule:scheduleResume71};

/* ===== MANRU v7.1: REGIONAL COMPLEXITY / LANDMARK OVERHAUL ===== */
const NORMAL71=new Set([1,3,7,9,12,14,17,19]);
  
  const PALETTE71=[
    {floor:'#4a211a',floorAlt:'#5a291f',wall:'#7d382c',wallDark:'#2b0f0d',accent:'#e99150',light:'#ffd18c',fog:'#0b0403'},
    {floor:'#283029',floorAlt:'#313a31',wall:'#4d5348',wallDark:'#252a23',accent:'#93896a',light:'#cec6a6',fog:'#0b0f0c'},
    {floor:'#321c33',floorAlt:'#412443',wall:'#70486d',wallDark:'#211223',accent:'#d783b8',light:'#f5c4df',fog:'#0b050d'},
    {floor:'#343a3e',floorAlt:'#40484d',wall:'#6a7279',wallDark:'#171b1e',accent:'#c07b50',light:'#d8c8b0',fog:'#080a0b'},
    {floor:'#17192e',floorAlt:'#202442',wall:'#565b82',wallDark:'#090b19',accent:'#d9b84f',light:'#f7e39a',fog:'#03040a'}
  ];







  function chooseRoom71(minW=8,minH=7,used=new Set()){
    const pool=(state.rooms||[]).filter(r=>r.w>=minW&&r.h>=minH&&!roomHasEndpoint(r)&&!used.has(`${r.x},${r.y}`));
    if(!pool.length)return null;
    pool.sort((a,b)=>b.w*b.h-a.w*a.h);
    const rr=pool[Math.min(pool.length-1,rand(0,Math.min(4,pool.length-1)))];
    used.add(`${rr.x},${rr.y}`);return rr;
  }




















  




  function repairEntities71(){
    if(!state?.monsters)return 0;let moved=0;
    for(const m of state.monsters){
      if(m.hp<=0||m.boss)continue;
      if(PlacementService.monsterCanStand(m,m.x,m.y))continue;
      let q=PlacementService.randomMonsterCell(m);
      if(!q&&m.aquatic){
        // Rare fallback: preserve an aquatic enemy by creating a small water trough in a safe large room.
        const rs=[...(state.rooms||[])].filter(r=>r.w>=7&&r.h>=5&&!roomHasEndpoint(r));
        for(const r of rs){
          const x=r.cx,y=r.cy;if([[-0,-1],[0,0],[0,1]].every(([dx,dy])=>canEdit(x+dx,y+dy,[TT.FLOOR,TT.GRASS]))){
            for(const dy of [-1,0,1])setTerrainTile58(state.map,x,y+dy,TT.WATER);
            if(PlacementService.monsterCanStand(m,x,y)){q={x,y};break}
          }
        }
      }
      if(q){m.x=q.x;m.y=q.y;moved++}
    }
    state.repairedEntities71=moved;return moved;
  }

  registerGenerationStage('region71-pre','pre',()=>{state.landmarks71=[];state.landmarkCells71={};state.regionComplex71=null});
  registerGenerationStage('region71-post','post',()=>{enhanceNormal71();enhanceSpecial71();ensureNormalConnectivity();repairEntities71();VisibilityService.compute();vfBuildDecor();;});

/* ===== MANRU v7.3: WALL APPROACH / 8-WAY AUTOPATH / DELAYED HOLD RING ===== */





  const BASE_KIND74=new Map((window.MANRU_TALISMANS||[]).map(t=>[t.talismanKind,t]));


  const key74=(a,b)=>[a,b].sort().join('+');

  // 원소 + 강화 : +1을 같이 주지 않는다. 일반 강화 대신 속성 각인을 선택하는 거래다.
  addFusionRecipe('elem_fire','upgrade',{kind:'f_fire_upgrade',name:'화강부적',seal:'炎',element:'fire',mode:'gear',ability:'무기 화염각인 / 방어구 화염면역',desc:'무기는 추가 화염 피해와 연소를 얻고, 방어구는 화염 역류를 막는다.'});
  addFusionRecipe('elem_shock','upgrade',{kind:'f_shock_upgrade',name:'뇌강부적',seal:'淨',element:'shock',mode:'gear',ability:'무기 공속 +10% / 방어구 이동비용 -8%',desc:'전류를 장비의 움직임에 맞춰 흘린다.'});
  addFusionRecipe('elem_water','upgrade',{kind:'f_water_upgrade',name:'수강부적',seal:'流',element:'water',mode:'gear',ability:'무기 방어 약화 / 방어구 독·출혈 세척',desc:'수기를 장비에 순환시켜 적의 자세를 무너뜨리거나 상처를 씻는다.'});
  addFusionRecipe('elem_ice','upgrade',{kind:'f_ice_upgrade',name:'빙강부적',seal:'凍',element:'ice',mode:'gear',ability:'무기 냉각 경직 / 방어구 EVA +1',desc:'차가운 기운을 장비에 고정한다.'});
  addFusionRecipe('elem_grass','upgrade',{kind:'f_grass_upgrade',name:'목강부적',seal:'芽',element:'grass',mode:'gear',ability:'무기 독분 각인 / 방어구 독 면역',desc:'살아 있는 기운을 장비 표면에 뿌리내린다.'});
  addFusionRecipe('elem_earth','upgrade',{kind:'f_earth_upgrade',name:'지강부적',seal:'岩',element:'earth',mode:'gear',ability:'무기 중량타 / 방어구 DEF +1·밀치기 면역',desc:'장비의 무게와 지지력을 대지에 맞춘다.'});

  // 원소 + 폭발 : 생원소의 자기역류를 없애고 목표 지점에 집중한다.
  addFusionRecipe('elem_fire','blast',{kind:'f_fire_blast',name:'화폭부적',seal:'炎',element:'fire',mode:'target',effect:'bomb_fire',range:5,ability:'3×3 층 비례 화염폭발 + 화염지대',desc:'원소 역류 없이 목표 지점에 층이 깊어질수록 강해지는 화염을 집중한다.'});
  addFusionRecipe('elem_shock','blast',{kind:'f_shock_blast',name:'뇌폭부적',seal:'電',element:'shock',mode:'target',effect:'bomb_shock',range:6,ability:'층 비례 연쇄 뇌격 · 물/금속 특효',desc:'목표 주변의 생체와 금속을 층이 깊어질수록 강해지는 전류가 연쇄적으로 잇는다.'});
  addFusionRecipe('elem_water','blast',{kind:'f_water_blast',name:'조수 폭쇄부적',seal:'潮',element:'water',mode:'target',effect:'bomb_water',range:5,ability:'층 비례 수압 폭발 · 강한 밀치기 · 소화',desc:'강한 층 비례 수압 피해와 밀치기로 진형을 붕괴시키는 수압 폭탄이다.'});
  addFusionRecipe('elem_ice','blast',{kind:'f_ice_blast',name:'빙폭부적',seal:'雪',element:'ice',mode:'target',effect:'bomb_ice',range:5,ability:'층 비례 빙결폭발 · 비보스 경직',desc:'강해지는 급랭 피해와 경직으로 각개격파 시간을 번다.'});
  addFusionRecipe('elem_grass','blast',{kind:'f_grass_blast',name:'목폭부적',seal:'荊',element:'grass',mode:'target',effect:'bomb_grass',range:5,ability:'층 비례 독분폭발 · 뿌리 구속',desc:'강한 직접 피해와 독·구속을 함께 퍼뜨린다.'});
  addFusionRecipe('elem_earth','blast',{kind:'f_earth_blast',name:'지폭부적',seal:'震',element:'earth',mode:'target',effect:'bomb_earth',range:5,ability:'층 비례 고충격 폭발 · 밀치기/경직',desc:'층이 깊어질수록 강해지는 충격파로 지상 적의 진형을 무너뜨린다.'});

  // 일부 원소 + 기능 조합
  addFusionRecipe('elem_fire','ward',{kind:'f_fire_ward',name:'화막부적',seal:'熾',element:'fire',mode:'instant',effect:'fireward',ability:'7턴 보호막 + 일시 화염저항',desc:'몸을 화염 장막으로 감싸고 주변에 불길을 남긴다.'});
  addFusionRecipe('elem_shock','blink',{kind:'f_shock_blink',name:'뇌섬부적',seal:'閃',element:'shock',mode:'target',effect:'shockblink',range:7,ability:'순간이동 + 출발/도착 뇌격',desc:'축지의 양끝에 짧은 뇌격을 남긴다.'});
  addFusionRecipe('elem_water','ward',{kind:'f_water_ward',name:'정수부적',seal:'淨',element:'water',mode:'instant',effect:'pureward',ability:'상태이상 정화 + 8턴 보호막',desc:'상처를 씻고 보호막을 만든다.'});
  addFusionRecipe('elem_ice','bind',{kind:'f_ice_bind',name:'빙쇄부적',seal:'鎖',element:'ice',mode:'target',effect:'icebind',range:6,ability:'3×3 강빙결',desc:'봉박의 사슬을 냉기로 굳혀 더 오래 붙잡는다.'});
  addFusionRecipe('elem_grass','mapping',{kind:'f_grass_map',name:'생맥부적',seal:'脈',element:'grass',mode:'instant',effect:'lifemap',ability:'전체 지도 + HP 8 회복',desc:'건물의 틈과 살아 있는 기운을 함께 읽는다.'});
  addFusionRecipe('elem_earth','ward',{kind:'f_earth_ward',name:'석갑부적',seal:'壁',element:'earth',mode:'instant',effect:'stoneward',ability:'8턴 보호막 + 일시 대지저항',desc:'몸을 암반 같은 기운으로 감싼다.'});

  // 일부 원소 + 원소
  addFusionRecipe('elem_fire','elem_water',{kind:'f_steam',name:'증기부적',seal:'霧',mode:'target',effect:'steam',range:5,ability:'3×3 증기 2턴 · 사선 차단',desc:'상극의 두 기운을 증기로 바꿔 사선을 끊는다.'});
  addFusionRecipe('elem_water','elem_ice',{kind:'f_frostfield',name:'설빙부적',seal:'霜',mode:'target',effect:'frostfield',range:5,ability:'3×3 강빙결장',desc:'수기를 얼려 강한 제압장으로 만든다.'});
  addFusionRecipe('elem_water','elem_grass',{kind:'f_regrowth',name:'생장부적',seal:'生',mode:'instant',effect:'regrowth',ability:'재생 7턴 + 인접 적 뿌리구속',desc:'수기와 목기를 생장으로 바꾼다.'});
  addFusionRecipe('elem_fire','elem_earth',{kind:'f_lava',name:'용암부적',seal:'熔',mode:'target',effect:'lava',range:5,ability:'화염 충격 + 임시 용암',desc:'대지를 녹여 좁은 길을 5턴 동안 용암으로 만든다. 보스가 밟고 있는 칸에는 용암이 생기지 않는다.'});
  addFusionRecipe('elem_grass','elem_earth',{kind:'f_bulwark',name:'목석부적',seal:'壘',mode:'instant',effect:'bulwark',ability:'임시 암벽 + 6턴 보호막',desc:'뿌리가 바위를 끌어올려 즉석 엄폐물을 만든다.'});
  addFusionRecipe('elem_shock','elem_water',{kind:'f_thunderpool',name:'폭뢰부적',seal:'轟',mode:'target',effect:'thunderpool',range:6,ability:'수기 전도 연쇄뇌격',desc:'물기운을 전도체로 삼아 뇌격을 넓게 퍼뜨린다.'});

  // 일부 기능 + 기능
  addFusionRecipe('blast','bind',{kind:'f_bindblast',name:'봉폭부적',seal:'禁',mode:'target',effect:'bindblast',range:5,ability:'층 비례 폭발 + 일반 적 3턴 봉인',desc:'폭발 뒤 종이 사슬이 퍼져 살아남은 일반 적을 3턴 봉인한다. 보스는 제어 내성이 열려 있을 때 1턴만 경직된다.'});
  addFusionRecipe('identify','mapping',{kind:'f_heaveneye',name:'천안부적',seal:'眼',mode:'instant',effect:'heaveneye',ability:'전체 지도 + 미확인 2종 감정',desc:'지도와 감정을 한 장으로 묶은 탐색용 고급 부적이다.'});
  addFusionRecipe('identify','upgrade',{kind:'f_identify_upgrade',name:'감강부적',seal:'鑑',mode:'instant',effect:'identify_all991',ability:'인벤토리의 모든 미감정 아이템 완전 감정',desc:'감정의 결을 강화해 행낭 안의 미감정 물건을 한꺼번에 밝힌다.'});
  addFusionRecipe('ward','blink',{kind:'f_guardblink',name:'호축부적',seal:'遁',mode:'target',effect:'guardblink',range:6,ability:'안전 순간이동 + 6턴 보호막',desc:'도망과 방어를 한 번에 해결하는 비상탈출 부적이다.'});

  // 성부는 생원소와 기능부적 양쪽 합성계에 정식 참여한다. 미감정 상태에서는 아래 진짜 인장/색을 노출하지 않는다.
  addFusionRecipe('holy','elem_fire',{kind:'f_holy_fire',name:'성화부적',seal:'輝',mode:'instant',effect:'holy_elem_fire991',ability:'성광 정화 + 화염 가호',desc:'성광과 화기를 겹쳐 저주와 탁기를 태우고 짧은 화염 가호를 남긴다.'});
  addFusionRecipe('holy','elem_shock',{kind:'f_holy_shock',name:'성뢰부적',seal:'閃',mode:'instant',effect:'holy_elem_shock991',ability:'성광 정화 + 뇌전 가호',desc:'성광을 전류에 실어 주변의 사기를 태우고 뇌전 역류를 잠시 막는다.'});
  addFusionRecipe('holy','elem_water',{kind:'f_holy_water',name:'성수부적',seal:'淨',mode:'instant',effect:'holy_elem_water991',ability:'강한 정화 + 수류 가호',desc:'깨끗한 수기와 성광으로 몸의 탁기를 씻고 잠시 수류의 역류를 막는다.'});
  addFusionRecipe('holy','elem_ice',{kind:'f_holy_ice',name:'성빙부적',seal:'雪',mode:'instant',effect:'holy_elem_ice991',ability:'성광 정화 + 빙결 가호',desc:'차갑게 가라앉힌 성광이 사기를 얼려 부수고 냉기의 역류를 막는다.'});
  addFusionRecipe('holy','elem_grass',{kind:'f_holy_grass',name:'성목부적',seal:'生',mode:'instant',effect:'holy_elem_grass991',ability:'성광 정화 + 목령 가호',desc:'살아 있는 기운에 성광을 섞어 탁기를 밀어내고 독분의 역류를 막는다.'});
  addFusionRecipe('holy','elem_earth',{kind:'f_holy_earth',name:'성토부적',seal:'震',mode:'instant',effect:'holy_elem_earth991',ability:'성광 정화 + 대지 가호',desc:'성광을 대지에 내려앉혀 사기를 누르고 충격의 역류를 막는다.'});
  addFusionRecipe('holy','identify',{kind:'f_holy_identify',name:'성감부적',seal:'明',mode:'instant',effect:'holy_identify991',ability:'모든 미감정 장비 감정 + 저주 드러냄',desc:'성광으로 장비의 숨은 결을 드러내 저주까지 함께 판별한다.'});
  addFusionRecipe('holy','upgrade',{kind:'f_holy_upgrade',name:'성강부적',seal:'鍊',element:'holy',mode:'gear',ability:'무기 언데드 추가피해 +5 / 방어구 언데드 피해 15% 감소',desc:'성광을 장비에 각인한다. 무기는 기존 금강령 퇴와 같은 성속성 추가피해 계통을 사용하고, 방어구는 언데드에게 받는 직접 피해를 소폭 줄인다.'});
  addFusionRecipe('holy','blast',{kind:'f_holy_blast',name:'성폭부적',seal:'光',mode:'instant',effect:'holy_blast991',ability:'주변 성광 폭발 · 원혼/언데드 특효',desc:'성광을 폭발시켜 가까운 사악한 존재를 강하게 태운다.'});
  addFusionRecipe('holy','mapping',{kind:'f_holy_mapping',name:'성안부적',seal:'眼',mode:'instant',effect:'holy_mapping991',ability:'전체 지도 + 숨은 문 + 해로운 상태 정화',desc:'성광이 벽과 몸의 탁한 결을 함께 훑는다.'});
  addFusionRecipe('holy','ward',{kind:'f_holy_ward',name:'성호부적',seal:'護',mode:'instant',effect:'holy_ward991',ability:'강한 상태 정화 + 보호막',desc:'성광을 장막으로 둘러 몸의 해로운 기운을 씻고 공격을 막는다.'});
  addFusionRecipe('holy','blink',{kind:'f_holy_blink',name:'성축부적',seal:'縮',mode:'instant',effect:'holy_blink991',ability:'바라보는 방향 안전 점멸 + 정화',desc:'성광이 안전한 발판을 짚어 몸을 앞으로 접어 옮긴다.'});
  addFusionRecipe('holy','bind',{kind:'f_holy_bind',name:'성봉부적',seal:'封',mode:'instant',effect:'holy_bind991',ability:'주변 구속 · 원혼/언데드 강구속',desc:'종이 사슬에 성광을 흘려 가까운 사기를 강하게 붙잡는다.'});



  const esc74=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const APP_IDS74=['redthread','jadepaper','inkwash','violet','goldedge','ashgray','cobalt','blueglass','frostwhite','moss','ochre','cinnabar','roughpaper','waxpaper','palepaper'];
  const randOrder74=a=>[...a].sort(()=>globalThis.__MANRU_RANDOM57__()-.5);



  function known74(item){if(!item||item.type!=='talisman')return false;if(item.branchExclusive105||item.fusion74||item.talismanKind==='identify')return true;return !!(state?.knowledge56?.talismanKnown?.[item.talismanKind])}
  function public74(item){if(!item)return'';if(item.branchExclusive105||item.fusion74)return item.name;return window.__MANRU_TALISMAN_PUBLIC__?.name?.(item)||item.name}
  
  function app74(item){return window.__MANRU_TALISMAN_PUBLIC__?.app?.(item)||{name:'미확인 부적',ink:'#9b7448'}}





  











fusion.id='fusion74';fusion.innerHTML='<div class="f74sheet"><span class="uiCorners63" aria-hidden="true"></span><div class="f74head"><div><b>부적 합성</b><small>감정된 기본 부적 2장을 태워 제어된 고급 부적으로 만든다.</small></div><button class="uxClose" data-f74close aria-label="닫기">×</button></div><div id="fusion74body"></div></div>';document.body.appendChild(fusion);
  const gearInfusionPanel=document.createElement('div');gearInfusionPanel.id='gear74';gearInfusionPanel.innerHTML='<div class="f74sheet"><span class="uiCorners63" aria-hidden="true"></span><div class="f74head"><div><b id="gear74title">장비 선택</b><small id="gear74sub">적용할 장비를 고른다.</small></div><button class="uxClose" data-g74close aria-label="닫기">×</button></div><div id="gear74body"></div></div>';document.body.appendChild(gearInfusionPanel);
  fusion.querySelector('[data-f74close]').onclick=()=>closeFusion();gearInfusionPanel.querySelector('[data-g74close]').onclick=()=>closeGear();
  function basicTalismans74(){return state.player.inventory.map((item,idx)=>({item,idx})).filter(v=>v.item.type==='talisman'&&!v.item.branchExclusive105&&!v.item.fusion74&&known74(v.item))}
  function compatible74(a,b){return RECIPE.get(key74(a.talismanKind,b.talismanKind))||null}


  function renderFusion74(){
    const host=document.getElementById('fusion74body'),items=basicTalismans74();if(items.length<2){host.innerHTML='<div class="f74none">합성하려면 감정된 기본 부적이 2장 이상 필요하다.</div>';return}
    if(!V74.first){host.innerHTML='<div class="f74hint">첫 번째 부적을 고른다. 미감정부적은 합성 목록에 표시되지 않는다.</div><div class="f74grid">'+items.map(v=>`<button class="f74card" data-f74first="${v.idx}"><span class="sig">${esc74(v.item.seal||'부')}</span><span><b>${esc74(v.item.name)}${(v.item.count||1)>1?` ×${v.item.count}`:''}</b><small>${esc74(v.item.ability||'')}</small></span></button>`).join('')+'</div>';host.querySelectorAll('[data-f74first]').forEach(b=>b.onclick=()=>{V74.first=state.player.inventory[+b.dataset.f74first];renderFusion74()});return}
    const first=V74.first,cands=items.filter(v=>v.item!==first).map(v=>({...v,r:compatible74(first,v.item)})).filter(v=>v.r);host.innerHTML=`<div class="f74hint f74picked"><span><b>${esc74(first.name)}</b>를 첫 재료로 선택했다. 만들 수 있는 부적을 골라라.</span><button data-f74reset>첫 재료 변경</button></div><div class="f74grid">${cands.length?cands.map(v=>`<button class="f74card compat" data-f74second="${v.idx}"><span class="sig">${esc74(v.r.seal)}</span><span><b>${esc74(v.r.name)}</b><small>${esc74(first.name)} + ${esc74(v.item.name)}<br>${esc74(v.r.ability)}</small></span></button>`).join(''):'<div class="f74none">지금 만들 수 있는 조합이 없다.<br><small>첫 재료를 바꿔 다른 조합을 확인할 수 있다.</small></div>'}<div class="f74result"><b>합성 규칙</b><br>결과를 누르면 합성 · 1턴 소모 · 재료 각 1장 · 강화 + 원소 → 속성 각인</div></div>`;host.querySelector('[data-f74reset]')?.addEventListener('click',()=>{V74.first=null;renderFusion74()});host.querySelectorAll('[data-f74second]').forEach(b=>b.onclick=()=>ActionDispatcher.dispatch({type:'FUSE',args:[first,state.player.inventory[+b.dataset.f74second]]}).value)
  }

ActionDispatcher.register('FUSE',fuse74);






ActionDispatcher.register('GEAR_APPLY',applyGear);

  function useBodyPower74(item){
    if(bodyPowerActive()){toast('이미 괴력이 폭발하고 있다.');return false}
    if(!state?.player?.inventory.includes(item)||item.talismanKind!=='upgrade'||playerClassRules58().upgradeTalismanMode!=='bodyBoost')return false;
    const p=state.player,d=bodyPowerDuration58(p),born=(state.playerAgencyTurns57||0)+1;
    p.classState={powerTurns:d,powerTotal:d,powerHealHundredths:p.classState?.powerHealHundredths||0,powerRulesVersion:3,powerExhaustion:bodyPowerExhaustion58(p),powerBornAgencyTurn:born,powerLastAgencyTurn:born};
    identifyKind('upgrade','괴력 발현');consumeRef(item);closeGear();closeInventory();cancelAutoWalk();
    burst(p.x,p.y,'#dfad51',30,1);impact(p.x,p.y,'#e9bd65',6);floatText(p.x,p.y,`괴력 ${d}턴`,'#ffdc8a',17);vfVibrate([60,30,100]);
    globalThis.__MANRU_SFX54__?.play('bodyPower58');
    addLog(`괴력 발동 · ${d}턴 동안 ATK +2 · DEF +7 · 매턴 최대 HP 2% 회복. 종료 후 ${p.classState.powerExhaustion}턴 실명·배탈.`);
    globalThis.__MANRU_TURN_ENGINE__.advance({handled:true,committed:true,timeCost:1,reason:"useBodyPower74"}).value;return true;
  }
  /* fused effects */
  const targetHud74=()=>document.getElementById('talismanTarget56');

  function startTarget74(item){if(!gameplayUiOpen57())return false;cancelAutoWalk();clearHeldInput53();V74.target={item,range:item.targetRange||5,effect:item.fusionEffect74};closeInventory();const h=targetHud74();h?.classList.add('show');syncWorldTargetInput();const a=document.getElementById('talismanTargetTitle'),b=document.getElementById('talismanTargetText');if(a)a.textContent=`${item.name} · ${item.seal}`;if(b)b.textContent=`목표 지정 · 사거리 ${V74.target.range}`;drawMap(true)}






  /* equipment effects */
  registerPlayerStatStage55('elements74',s=>{const a=state?.player?.armor;if(a?.elementGuard74==='ice')s.eva+=1;if(a?.elementGuard74==='earth')s.def+=1;return s});
  registerAttackCostStage55('elements74',(c,item)=>{if(item?.elementBrand74==='shock')c*=.90;return clamp(c,.25,2.2)});
  registerMoveCostStage55('elements74',c=>{if(state?.player?.armor?.elementGuard74==='shock')c*=.92;return clamp(c,.50,1.15)});
  /* r15: earth stagger guard is handled by canonical applyKnockback. */
  registerPlayerAttackStageR('element-brand74',(next,mon,b=0,...rest)=>{const before=mon?.hp??0,contact=mon?entityFootprintCells57(mon):[],r=next(mon,b,...rest);if(mon&&mon.hp<before)applyWeaponBrandHit(state.player,mon,before-mon.hp,contact);return r});

  globalThis.__MANRU_TURN_PIPELINE__.register('elements74',{pre:()=>ensure74(),post:()=>{if(!state||state.dead||state.victory)return;if(state.player.armor?.elementGuard74==='grass')state.status.poison=0;if(state.player.armor?.elementGuard74==='water'&&state.turn%2===0){state.status.poison=Math.max(0,(state.status.poison||0)-1);state.status.bleed=Math.max(0,(state.status.bleed||0)-1)}tickElementFields57();if(state.elementWard74){state.elementWard74.ttl--;if(state.elementWard74.ttl<=0)state.elementWard74=null}VisibilityService.compute();updateAll()}});
  // Blindness duration belongs to tickMonsterCombatStatuses57 for both game and arena.

  /* inventory dispatch + visible marks */
  registerInventoryRenderR34('r74-talisman-fusion','post',()=>{const box=document.getElementById('inventory');if(!box)return;const head=box.querySelector('.uxInvMeta,.mfInvMeta,.invMeta');if(head&&(basicTalismans74().length>=2||!playerClassRules58().talismanFusion)&&!head.querySelector('.f74FuseBtn')){const b=document.createElement('button');b.className='f74FuseBtn';b.textContent=playerClassRules58().talismanFusion?'부적 합성':'합성 불가';b.disabled=!playerClassRules58().talismanFusion;b.title=b.disabled?'천하장사는 부적을 합성할 수 없다.':'';b.onclick=e=>{e.preventDefault();e.stopPropagation();openFusion()};head.appendChild(b)}const selected=inventorySelection>=0?state.player.inventory[inventorySelection]:null;if(selected?.type==='talisman'&&known74(selected)&&!selected.fusion74){const detail=box.querySelector('.uxActions,.mfActions,.invActions');if(detail&&basicTalismans74().length>=2&&!detail.querySelector('[data-fuse-selected74]')){const b=document.createElement('button');b.dataset.fuseSelected74='1';b.textContent=playerClassRules58().talismanFusion?'이 부적으로 합성':'천하장사는 부적을 합성할 수 없다.';b.disabled=!playerClassRules58().talismanFusion;b.onclick=e=>{e.preventDefault();e.stopPropagation();openFusion(selected)};detail.appendChild(b)}}box.querySelectorAll('[data-invslot]').forEach(el=>{const it=state.player.inventory[+el.dataset.invslot];if(it?.fusion74&&!el.querySelector('.f74badge'))el.insertAdjacentHTML('beforeend','<span class="f74badge">합</span>')})});
  // r30: v7.4 talisman-family dispatch is integrated in canonical useInventoryItem.
  targetHud74()?.querySelector('#talismanCancel56')?.addEventListener('click',e=>{if(!V74.target)return;e.preventDefault();e.stopImmediatePropagation();InputRouter.dispatch({type:'TARGET_CANCEL',source:'target-hud'})},{capture:true});

  globalThis.__MANRU_DRAW_HOOKS_R19__?.post.push({id:'element74',draw:drawElementOverlay});

  registerGenerationStage('talisman74','post',()=>{ensure74();state.tempTerrain74=[];state.elementFields74=[]});
    
  globalThis.__MANRU_TALISMAN74_ACTIONS__=Object.freeze({woodEffect:woodEffect105,shopCandidates:(baseKind=null)=>RECIPES.filter(r=>r.a!=='upgrade'&&r.b!=='upgrade'&&(!baseKind||r.a===baseKind||r.b===baseKind)).map(recipeItem),known:known74,publicName:public74,target:()=>!!V74.target,castTarget:(x,y)=>castFusion(x,y),cancelTarget:()=>{cancelTalismanTargeting(true);return true},closePanels:()=>{closeFusion();closeGear();return true},dispatch:item=>{if(!item||item.type!=='talisman')return{handled:false,result:false};ensure74();if(item.talismanKind==='reinforce105'){openGear(item);return{handled:true,result:true}}if(item.fusion74){if(item.fusionMode74==='gear'){openGear(item);return{handled:true,result:true}}if(item.fusionMode74==='target'){startTarget74(item);return{handled:true,result:true}}return{handled:true,result:!!useFusionInstant(item)}}if(ELEMENT_KIND74[item.talismanKind])return{handled:true,result:!!rawElement74(item)};if(item.talismanKind==='upgrade'){if(playerClassRules58().upgradeTalismanMode==='bodyBoost'&&!state.player.inventory.some(i=>i.summonItem105==='book'))return{handled:true,result:useBodyPower74(item)};identifyKind('upgrade','강화 효과 관찰');openGear(item);return{handled:true,result:true}}return{handled:false,result:false}},ensure:ensure74});


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


/* ===== MANRU v7.8: FULL-MAP DENSITY / LANDMARK POLISH ===== */
function imp78(x,y){if(!state)return true;if(x<=1||y<=1||x>=COLS-2||y>=ROWS-2)return true;if(state.player?.x===x&&state.player?.y===y)return true;if(state.stairs?.x===x&&state.stairs?.y===y)return true;if((state.items||[]).some(i=>i.x===x&&i.y===y))return true;if((state.monsters||[]).some(m=>m.hp>0&&typeof monCovers==='function'&&monCovers(m,x,y)))return true;return false}
  function safeFloor78(x,y){return x>1&&y>1&&x<COLS-2&&y<ROWS-2&&!imp78(x,y)&&[TT.FLOOR,TT.GRASS,TT.LIGHT_GRASS].includes(state.map[y]?.[x])}
  



  registerGenerationStage('polish78','post',()=>{polish78();VisibilityService.compute()});


/* ===== MANRU v8.1: ALWAYS-ON AUTOWALK / FOLLOW-PEEK CAMERA / CONNECTED DECOR =====
   Input, automation, camera and viewport UI have one explicit owner.
   Map taps always mean destination movement. Auto-pickup is a fixed policy.
*/
const CONFIG81=Object.freeze({
    version:'v8.1-structured-runtime',
    autoMove:true,
    autoPickup:true,
    dragThreshold:11,
    holdPreviewMs:330,
    holdInspectMs:660,
    repeatDelayMs:360,
    repeatEveryMs:125
  });

  const Runtime81={
    input:null,
    hold:null,
    pointers:new Map(),
    actionPointers:new Map(),
    gesture:null,
    held:null,
    repeatDelay:0,
    repeatTick:0,
    mousePan:null,
    suppressClickUntil:0,
    cameraInspecting:false,
    qa:{mapTaps:0,autoMoves:0,autoPickups:0,holds:0,drags:0,pinches:0,manualMoves:0}
  };
  RuntimeState.input.device=Runtime81;

  
  
  const targeting81=()=>actionTargetOpen56();

  const canAct81=()=>gameplayInputAllowed57();
  





  /* ---------------- always-on automation: independent path runner ---------------- */
  const Auto81={
    serial:0,
    timer:0,
    active:false,
    exploreMode:false,
    target:null,
    path:[],
    lastStop:'idle',
    intervalMs:82/AUTO_MOVE_RATE70,

    valid(q){return !!q&&Number.isFinite(q.x)&&Number.isFinite(q.y)&&q.x>=0&&q.y>=0&&q.x<COLS&&q.y<ROWS},
    visibleEnemies(){return new Set((state?.monsters||[]).filter(isThreatVisibleToPlayer))},
    alertedEnemies(){return new Set((state?.monsters||[]).filter(m=>m.alerted&&isThreatVisibleToPlayer(m)))},
    setChip(text){try{v10AutoChip(text||null)}catch(error){ignoreError('auto-walk chip update',error)}},
    syncPreview(path=this.path){VIS.autoPath=(path||[]).map(p=>({x:p.x,y:p.y}))},
    clearTimer(){if(this.timer){clearTimeout(this.timer);this.timer=0}if(autoWalkTimer){clearTimeout(autoWalkTimer);autoWalkTimer=null}},
    stop(reason='manual',clearExplore=true){
      this.serial++;this.clearTimer();this.active=false;this.path=[];this.target=null;this.lastStop=reason;
      if(clearExplore)this.exploreMode=false;
      autoWalkToken++
      VIS.autoPath=null;VIS.exploring=!!this.exploreMode;this.setChip(null);
      const legacyChip=document.getElementById('vfAutoState');if(legacyChip){legacyChip.classList.remove('show');legacyChip.textContent=''}
      return true;
    },
    schedule(fn,ms=this.intervalMs){
      this.clearTimer();
      const id=setTimeout(()=>{if(this.timer===id)this.timer=0;if(autoWalkTimer===id)autoWalkTimer=null;fn()},ms);
      this.timer=id;autoWalkTimer=id;return id;
    },
    targetAt(tx,ty){
      if(neutralInteractableAt58(tx,ty))return{type:'merchant',x:tx,y:ty};
      if(ShopMapBuilder.groundAt(tx,ty))return{type:'shop-stock',x:tx,y:ty};
      const mon=findMonsterAt(tx,ty);
      if(mon&&!isHostileTarget57(mon)&&occupancySwapAllowed57(state.player,mon))return{type:'tile',x:tx,y:ty};
      if(isThreatVisibleToPlayer(mon)||summonActive(mon)&&state.visible.has(k(tx,ty)))return{type:'monster',x:tx,y:ty,mon};
      if(state.map[ty]?.[tx]===TT.JAR)return{type:'blocked',x:tx,y:ty,tile:TT.JAR};
      const item=(state.items||[]).find(it=>it.x===tx&&it.y===ty);
      if(item)return{type:'item',x:tx,y:ty,item};
      if(state.branchPortals105?.some(p=>p.x===tx&&p.y===ty))return{type:'branch',x:tx,y:ty};
      if(state.stairs&&state.stairs.x===tx&&state.stairs.y===ty)return{type:'stairs',x:tx,y:ty};
      if(ReachabilityService.playerPassable(tx,ty)&&!OccupancyService.isOccupied(tx,ty))return{type:'tile',x:tx,y:ty};
      return{type:'blocked',x:tx,y:ty,tile:state.map[ty]?.[tx]};
    },
    targetPos(t){
      if(!t)return null;
      if(t.type==='monster'){
        const m=t.mon;
        if(!m||m.hp<=0||!(state.monsters||[]).includes(m))return null;
        if(Number.isFinite(t.x)&&Number.isFinite(t.y)&&monCovers(m,t.x,t.y))return{x:t.x,y:t.y};const c=entityClosestCellTo57(m,state.player);return c?{x:c.x,y:c.y}:{x:m.x,y:m.y};
      }
      if(t.type==='stairs')return state.stairs?{x:state.stairs.x,y:state.stairs.y}:null;
      if(t.type==='item'){
        const it=(state.items||[]).includes(t.item)?t.item:(state.items||[]).find(i=>i.x===t.x&&i.y===t.y);
        return it?{x:it.x,y:it.y}:{x:t.x,y:t.y};
      }
      return{x:t.x,y:t.y};
    },
    adjacentPath(pos){
      const search=ReachabilityService.playerSearch(state.player,{seenOnly:true,ignoreOccupants:false});let best=null;
      for(const[dx,dy]of DIRS8){
        const x=pos.x+dx,y=pos.y+dy;
        if(x<=0||y<=0||x>=COLS-1||y>=ROWS-1||!state.seen.has(k(x,y))||!ReachabilityService.playerPassable(x,y)||OccupancyService.isOccupied(x,y))continue;
        const path=ReachabilityService.playerPath(search,{x,y});
        if(path&&(!best||path.length<best.length))best=path;
      }
      return best;
    },
    computePath(t){
      const pos=this.targetPos(t);if(!pos)return null;
      const p=state.player;
      if(t.type==='monster'){if(entityDistance57(t.mon,p)<=1)return[];return this.adjacentPath(pos)}
      if(t.type==='merchant'){if(entityDistance57(pos,p)<=1)return[];return this.adjacentPath(pos)}
      if(t.type==='blocked'){if(entityDistance57(pos,p)<=1)return[];return this.adjacentPath(pos)}
      if(p.x===pos.x&&p.y===pos.y)return[];
      return ReachabilityService.pathTo(pos.x,pos.y);
    },
    pickupAll(){
      if(!state||isGameplayInputBlocked())return 0;
      let count=0,guard=0;
      while(guard++<12){
        const before=state.items.length;
        if(!state.items.some(it=>it.x===state.player.x&&it.y===state.player.y))break;
        ActionDispatcher.dispatch({type:'PICKUP',args:[]}).value;
        if(state.items.length>=before)break;
        count+=before-state.items.length;
      }
      if(count){Runtime81.qa.autoPickups+=count;return count}
      return 0;
    },
    act(t){
      if(!t||!state)return false;
      const pos=this.targetPos(t),p=state.player;if(!pos)return false;
      if(t.type==='merchant'){if(entityDistance57(pos,p)>1)return false;this.stop('merchant',true);return interactNeutral58(neutralInteractableAt58(pos.x,pos.y))}
      if(t.type==='shop-stock'){
        if(p.x!==pos.x||p.y!==pos.y)return false;
        this.stop('shop-stock',true);const stock=ShopMapBuilder.groundAt(pos.x,pos.y);if(stock)openShop(stock);return true;
      }
      if(t.type==='monster'){
        if(entityDistance57(t.mon,p)>1)return false;
        const dx=Math.sign(pos.x-p.x),dy=Math.sign(pos.y-p.y);
        this.stop('target-monster',true);ActionDispatcher.dispatch({type:'MOVE',args:[dx,dy]}).value;return true;
      }
      if(t.type==='item'){
        if(p.x!==pos.x||p.y!==pos.y)return false;
        this.stop('target-item',true);this.pickupAll();return true;
      }
      if(t.type==='stairs'){
        if(p.x!==pos.x||p.y!==pos.y)return false;
        this.stop('target-stairs',true);ActionDispatcher.dispatch({type:'DESCEND',args:[]}).value;return true;
      }
      if(t.type==='branch'){
        if(p.x!==pos.x||p.y!==pos.y)return false;
        this.stop('target-branch',true);this.pickupAll();return true;
      }
      if(t.type==='blocked'){
        if(entityDistance57(pos,p)>1)return false;
        this.stop('target-structure',true);
        const now=state.map[pos.y]?.[pos.x];
        if(ReachabilityService.playerPassable(pos.x,pos.y)&&!OccupancyService.isOccupied(pos.x,pos.y))ActionDispatcher.dispatch({type:'MOVE',args:[Math.sign(pos.x-p.x),Math.sign(pos.y-p.y)]}).value;
        else if(!ActionDispatcher.dispatch({type:'STRUCTURE_INTERACT',args:[pos.x,pos.y]}).value)toast(`${terrainName(now)} 바로 앞이다.`);
        return true;
      }
      if(t.type==='tile'&&p.x===pos.x&&p.y===pos.y){
        this.stop('destination',true);this.pickupAll();return true;
      }
      return false;
    },
    threatBefore(){return{hp:state.player.hp,visible:this.visibleEnemies(),alerted:this.alertedEnemies()}},
    shouldStopForThreat(before,target){
      if(state.player.hp<before.hp)return'hit';
      const after=this.visibleEnemies(),afterAlert=this.alertedEnemies(),targetMon=target?.type==='monster'?target.mon:null;
      for(const m of after)if(!before.visible.has(m)&&m!==targetMon)return'new-enemy';
      for(const m of afterAlert)if(!before.alerted.has(m)&&m!==targetMon)return'alerted-enemy';
      if([...after].some(m=>m!==targetMon&&entityDistance57(m,state.player)<=1))return'adjacent-enemy';
      return'';
    },
    startPath(path,meta={}){
      if(!state||state.dead||state.victory||isGameplayInputBlocked()||targeting81())return false;
      this.stop('replace',false);
      this.active=true;this.exploreMode=!!meta.explore;VIS.exploring=this.exploreMode;
      this.target=meta.target||null;this.path=(path||[]).map(p=>({x:p.x,y:p.y}));
      const token=++this.serial;
      let plannedTarget=this.targetPos(this.target);
      this.syncPreview();
      const label=this.exploreMode?'자동 탐사':this.target?.type==='stairs'?'계단으로 이동':this.target?.type==='item'?'아이템으로 이동':this.target?.type==='monster'?'적에게 접근':'자동 이동';
      this.setChip(label);
      const tick=()=>{
        if(token!==this.serial||!this.active)return;
        if(!state||state.dead||state.victory||isGameplayInputBlocked()||targeting81()){this.stop('blocked-ui',true);return}
        const presentationWait=ACTION_PRESENTATION58.run===state?ACTION_PRESENTATION58.inputUntil-performance.now():0;
        if(presentationWait>0){this.schedule(tick,Math.ceil(presentationWait));return}
        if(this.target&&this.act(this.target))return;
        const pos=this.targetPos(this.target),head=this.path[0],player=state.player;
        const targetMoved=!!this.target&&(!pos||!plannedTarget||pos.x!==plannedTarget.x||pos.y!==plannedTarget.y);
        const blockedNext=!!head&&!ReachabilityService.playerStepAllowed(player,head.x,head.y,{seenOnly:true,ignoreOccupants:false,allowAllySwap:true});
        if(targetMoved||blockedNext||this.target&&!this.path.length){
          if(!this.target){this.active=false;this.path=[];this.syncPreview();this.schedule(()=>this.explore(true),76/AUTO_MOVE_RATE70);return}
          const fresh=this.computePath(this.target);
          if(!fresh){this.stop('unreachable',true);toast('본 길 안에서 닿을 수 없는 곳이다.');return}
          this.path=fresh;plannedTarget=pos;this.syncPreview();
        }
        if(!this.path.length){
          if(this.target&&this.act(this.target))return;
          if(this.exploreMode){this.active=false;this.path=[];this.syncPreview();this.schedule(()=>this.explore(true),76/AUTO_MOVE_RATE70);return}
          this.stop('arrived',true);return;
        }
        const next=this.path[0],p0={x:state.player.x,y:state.player.y,turn:state.turn},before=this.threatBefore();
        const dx=Math.sign(next.x-p0.x),dy=Math.sign(next.y-p0.y);
        if(!dx&&!dy){this.path.shift();this.schedule(tick,30);return}
        ActionDispatcher.dispatch({type:'MOVE',args:[dx,dy]}).value;
        if(token!==this.serial||!this.active)return;
        const moved=state.player.x!==p0.x||state.player.y!==p0.y,turnChanged=state.turn!==p0.turn;
        const danger=this.shouldStopForThreat(before,this.target);
        if(danger){this.stop(danger,true);return}
        this.pickupAll();
        if(this.target&&this.act(this.target))return;
        if(!moved&&!turnChanged){this.stop('stalled',true);return}
        // Consume only a reached cell: opening a door or a consumed failed move
        // must retain the next step. Replan after displacement on the next tick.
        if(state.player.x===next.x&&state.player.y===next.y)this.path.shift();
        this.syncPreview();this.schedule(tick,this.intervalMs);
      };
      this.schedule(tick,0);return true;
    },
    go(tx,ty){
      const q=typeof tx==='object'?tx:{x:tx,y:ty};
      if(!this.valid(q)||!canAct81())return false;
      if(!state.seen.has(k(q.x,q.y))){toast('아직 본 적 없는 칸이다.');return false}
      Runtime81.qa.mapTaps++;CameraController.resume(false);if((q.x!==state.player.x||q.y!==state.player.y)&&elementalWorldTarget105(q.x,q.y)&&combatTerrainTargetCheckR8({type:'terrain',...q}).ok){this.stop('furniture-aim',true);return !!selectJarTarget(q.x,q.y,true)}
      const t=this.targetAt(q.x,q.y);
      if(q.x===state.player.x&&q.y===state.player.y){
        this.stop('same-tile',true);
        if(t.type==='branch')toast('상호작용 버튼(F)으로 출입할 수 있다.');else if(t.type==='item')this.pickupAll();else if(t.type==='stairs')ActionDispatcher.dispatch({type:'DESCEND',args:[]}).value;else if(adjacentBranchPortal105())toast('상호작용 버튼(F)으로 출입할 수 있다.');else ActionDispatcher.dispatch({type:'CONTEXT_ACTION',args:[]}).value;
        return true;
      }
      const path=this.computePath(t);
      if(!path){toast('본 길 안에서 닿을 수 없는 곳이다.');return false}
      Runtime81.qa.autoMoves++;return this.startPath(path,{explore:false,target:t});
    },
    chooseFrontier(){return ReachabilityService.frontierPath(.35,DIRS8)},
    explore(resume=false){
      if(!canAct81())return false;
      if(!resume){this.stop('explore-start',false);this.exploreMode=true;VIS.exploring=true;addLog('자동 탐사: 미탐사 구역을 찾아간다. 적이나 피격에서 멈춘다.')}
      else{this.exploreMode=true;VIS.exploring=true}
      const visible=this.visibleEnemies();
      if([...visible].some(m=>m.alerted||entityDistance57(m,state.player)<=1)){this.stop('explore-danger',true);return false}
      const path=this.chooseFrontier();
      if(!path){this.stop('explore-complete',true);toast('탐사할 새 길이 없다.');return false}
      return this.startPath(path,{explore:true,target:null});
    },
    state(){return{active:this.active,exploring:this.exploreMode,target:this.target?{type:this.target.type,...this.targetPos(this.target)}:null,path:this.path.length,lastStop:this.lastStop}}
  };



  const Automation81={
    valid:q=>Auto81.valid(q),
    go:q=>Auto81.go(q),
    explore:()=>Auto81.explore(false),
    pickup:()=>Auto81.pickupAll(),
    state:()=>Auto81.state(),
    presentationRate:()=>Auto81.active?AUTO_MOVE_RATE70:1
  };

  /* Auto-pickup is permanent. A movement also exits temporary camera inspection. */
  registerMovePreR8(ctx=>{ctx.automationSerial81=Auto81.serial;if(Runtime81.cameraInspecting)CameraController.resume(false);return true});
  registerMovePostR8(ctx=>{if(ctx.moved){Runtime81.qa.manualMoves++;if(ctx.automationSerial81===Auto81.serial)Auto81.pickupAll()}});



  /* ---------------- multi-tile connected decorative layer ---------------- */
  const ConnectedDecor81=(function(){
    const PREFIX='c81:';
    const FLOORISH=new Set([TT.FLOOR,TT.GRASS,TT.LIGHT_GRASS,TT.GOLD,TT.FLOOR]);
    const TREEISH=new Set([TT.PEACH_TREE,TT.HEDGE,TT.BAMBOO]);
    let seq=0,building=false;
    const palettes=[
      {a:'#6f2e25',b:'#b65e3d',line:'#e0a360'},
      {a:'#214f3d',b:'#4f8a59',line:'#96c978'},
      {a:'#603257',b:'#aa5f8e',line:'#df9fc4'},
      {a:'#374047',b:'#6a7377',line:'#bb8b61'},
      {a:'#66501d',b:'#b89635',line:'#efd36d'}
    ];
    function kk(x,y){return x+','+y}
    function important(x,y){
      if(x<=1||y<=1||x>=COLS-2||y>=ROWS-2)return true;
      if(state.player?.x===x&&state.player?.y===y)return true;
      if(state.stairs?.x===x&&state.stairs?.y===y)return true;
      if((state.items||[]).some(i=>i.x===x&&i.y===y))return true;
      if((state.monsters||[]).some(m=>m.hp>0&&monCovers(m,x,y)))return true;
      return false;
    }
    function free(x,y){return x>1&&y>1&&x<COLS-2&&y<ROWS-2&&!important(x,y)&&FLOORISH.has(state.map[y]?.[x])}
    function hash(x,y,s=0){return hash2(x,y,8100+state.floor*97+s)}
    function unique(cells){const out=[],seen=new Set();for(const c of cells){if(!c||!free(c.x,c.y))continue;const q=kk(c.x,c.y);if(seen.has(q))continue;seen.add(q);out.push(c)}return out}
    function addGroup(kind,cells,layer='ground',alpha=.72){
      cells=unique(cells);if(cells.length<2)return 0;
      const id='g'+(++seq),set=new Set(cells.map(c=>kk(c.x,c.y))),region=regionIndex();
      for(const c of cells){let mask=0;if(set.has(kk(c.x,c.y-1)))mask|=1;if(set.has(kk(c.x+1,c.y)))mask|=2;if(set.has(kk(c.x,c.y+1)))mask|=4;if(set.has(kk(c.x-1,c.y)))mask|=8;state.decor.push({x:c.x,y:c.y,kind:PREFIX+kind,layer,alpha,region,connected81:true,group81:id,mask81:mask,seed81:Math.floor(hash(c.x,c.y,31)*9999)})}
      return cells.length;
    }
    function addCanopyGroup(cells){
      cells=[...new Map(cells.filter(c=>c&&c.x>0&&c.y>0&&c.x<COLS-1&&c.y<ROWS-1).map(c=>[kk(c.x,c.y),c])).values()];
      if(cells.length<2)return 0;
      const id='g'+(++seq),set=new Set(cells.map(c=>kk(c.x,c.y))),region=regionIndex();
      for(const c of cells){let mask=0;if(set.has(kk(c.x,c.y-1)))mask|=1;if(set.has(kk(c.x+1,c.y)))mask|=2;if(set.has(kk(c.x,c.y+1)))mask|=4;if(set.has(kk(c.x-1,c.y)))mask|=8;state.decor.push({x:c.x,y:c.y,kind:PREFIX+'canopy',layer:'object',alpha:.88,region,connected81:true,group81:id,mask81:mask,seed81:Math.floor(hash(c.x,c.y,37)*9999)})}
      return cells.length;
    }
    function lineCells(r,horizontal,len=6,width=2){
      const cells=[],cx=Math.round(r.cx),cy=Math.round(r.cy),half=Math.floor(len/2);
      for(let a=-half;a<=half;a++)for(let b=0;b<width;b++)cells.push(horizontal?{x:cx+a,y:cy+b-Math.floor(width/2)}:{x:cx+b-Math.floor(width/2),y:cy+a});
      return cells;
    }
    function walkCells(r,count=9,seed=0){
      let x=Math.round(r.cx),y=Math.round(r.cy),out=[{x,y}],last=-1;
      for(let i=1;i<count;i++){
        const dirs=[[1,0],[0,1],[-1,0],[0,-1]],start=Math.floor(hash(x+i,y-i,seed+i)*4);let moved=false;
        for(let j=0;j<4;j++){const d=(start+j)%4;if((d+2)%4===last&&j<3)continue;const nx=x+dirs[d][0],ny=y+dirs[d][1];if(nx<=r.x+1||ny<=r.y+1||nx>=r.x+r.w-2||ny>=r.y+r.h-2||!free(nx,ny))continue;x=nx;y=ny;last=d;out.push({x,y});moved=true;break}
        if(!moved)break;
      }
      return out;
    }
    function lCells(r){
      const out=[],cx=Math.round(r.cx),cy=Math.round(r.cy),rx=Math.min(4,Math.max(2,Math.floor(r.w/3))),ry=Math.min(4,Math.max(2,Math.floor(r.h/3)));
      for(let x=cx-rx;x<=cx+rx;x++)out.push({x,y:cy});for(let y=cy;y<=cy+ry;y++)out.push({x:cx+rx,y});return out;
    }
    
    function build(){
      if(!state||building)return;building=true;
      try{
        state.decor=(state.decor||[]).filter(d=>!d.connected81);seq=0;
        let cells=0,groups=0;const rooms=[...(state.rooms||[])].filter(r=>r.w>=6&&r.h>=6).sort((a,b)=>(b.w*b.h)-(a.w*a.h));
        const maxGroups=state.specialFloor?6:Math.min(6,Math.max(3,Math.floor(rooms.length/3)+2));
        for(let i=0;i<Math.min(maxGroups,rooms.length);i++){
          const r=rooms[(i*3+state.floor)%rooms.length],z=regionIndex(),horizontal=r.w>=r.h;let kind,shape,layer='ground',alpha=.7;
          if(z===0){kind='runner';shape=lineCells(r,horizontal,Math.min(8,(horizontal?r.w:r.h)-3),Math.min(2,(horizontal?r.h:r.w)-3));alpha=.58}
          else if(z===1){kind='roots';shape=walkCells(r,10,101+i);alpha=.56}
          else if(z===2){kind='silk';shape=lineCells(r,!horizontal,Math.min(7,(!horizontal?r.w:r.h)-3),2);alpha=.54}
          else if(z===3){kind='chain';shape=lCells(r);alpha=.55}
          else{kind='vein';shape=walkCells(r,11,301+i);alpha=.64}
          const n=addGroup(kind,shape,layer,alpha);if(n){cells+=n;groups++}
          if(cells>58)break;
        }
        if(regionIndex()===1){
          for(const comp of ReachabilityService.forestComponents({kk,TREEISH},Math.max(0,64-cells)).slice(0,4)){const n=addCanopyGroup(comp);if(n){cells+=n;groups++}}
        }
        // Every floor gets at least one genuinely connected formation. Random room geometry
        // can occasionally reject all planned shapes, so fall back to a local organic chain.
        if(!groups){
          let fallback=null;
          outer:for(let y=2;y<ROWS-2;y++)for(let x=2;x<COLS-2;x++){
            if(!free(x,y))continue;
            const options=[[1,0],[0,1],[-1,0],[0,-1]].map(([dx,dy])=>({x:x+dx,y:y+dy})).filter(q=>free(q.x,q.y));
            if(!options.length)continue;
            const n=options[Math.floor(hash(x,y,909)*options.length)],shape=[{x,y},n];
            const bend=[[-(n.y-y),n.x-x],[n.y-y,-(n.x-x)]].map(([dx,dy])=>({x:n.x+dx,y:n.y+dy})).find(q=>free(q.x,q.y));
            if(bend)shape.push(bend);fallback=shape;break outer;
          }
          if(fallback){const kinds=['runner','roots','silk','chain','vein'],n=addGroup(kinds[regionIndex()]||'runner',fallback,'ground',.62);if(n){cells+=n;groups++}}
          if(!groups){const comp=ReachabilityService.forestComponents({kk,TREEISH},12).find(c=>c.length>=2);if(comp){const n=addCanopyGroup(comp);if(n){cells+=n;groups++}}}
        }
        state.connectedDecor81={groups,cells,maxGroup:Math.max(0,...Object.values((state.decor||[]).filter(d=>d.connected81).reduce((a,d)=>(a[d.group81]=(a[d.group81]||0)+1,a),{}))),total:state.decor.length};
      }finally{building=false}
    }
    function draw(e,fogHandled58=false){
      if(!e?.connected81)return false;
      if(!state.seen.has(kk(e.x,e.y)))return true;
      const vis=state.visible.has(kk(e.x,e.y)),p=palettes[e.region??regionIndex()]||palettes[0],px=e.x*TILE,py=e.y*TILE,m=e.mask81||0,a=(fogHandled58||vis?1:.46)*(e.alpha??1),kind=String(e.kind).slice(PREFIX.length);
      X.save();X.globalAlpha*=a;X.lineCap='round';X.lineJoin='round';
      const ext={l:(m&8)?0:5,r:(m&2)?32:27,t:(m&1)?0:5,b:(m&4)?32:27};
      if(kind==='runner'||kind==='silk'){
        X.fillStyle=kind==='runner'?p.a:p.b;X.fillRect(px+ext.l,py+ext.t,ext.r-ext.l,ext.b-ext.t);
        X.strokeStyle=p.line;X.lineWidth=1;
        if(!(m&1)){X.beginPath();X.moveTo(px+ext.l,py+ext.t+.5);X.lineTo(px+ext.r,py+ext.t+.5);X.stroke()}
        if(!(m&4)){X.beginPath();X.moveTo(px+ext.l,py+ext.b-.5);X.lineTo(px+ext.r,py+ext.b-.5);X.stroke()}
        if(!(m&8)){X.beginPath();X.moveTo(px+ext.l+.5,py+ext.t);X.lineTo(px+ext.l+.5,py+ext.b);X.stroke()}
        if(!(m&2)){X.beginPath();X.moveTo(px+ext.r-.5,py+ext.t);X.lineTo(px+ext.r-.5,py+ext.b);X.stroke()}
        X.globalAlpha*=.38;X.fillStyle=p.line;if(kind==='runner'){X.fillRect(px+9,py+14,14,3);X.fillRect(px+14,py+9,3,14)}else{for(let q=7;q<28;q+=7)X.fillRect(px+q,py+6,1,20)}
      }else if(kind==='roots'||kind==='vein'||kind==='chain'){
        const cx=px+16,cy=py+16,targets=[];if(m&1)targets.push([px+16,py]);if(m&2)targets.push([px+32,py+16]);if(m&4)targets.push([px+16,py+32]);if(m&8)targets.push([px,py+16]);
        X.strokeStyle=kind==='roots'?'#665139':kind==='chain'?'#7e8588':p.line;X.lineWidth=kind==='chain'?3:kind==='roots'?4:2;
        X.beginPath();for(const[tX,tY]of targets){X.moveTo(cx,cy);X.quadraticCurveTo(cx+((e.seed81%7)-3),cy+(((e.seed81>>3)%7)-3),tX,tY)}X.stroke();
        X.fillStyle=kind==='roots'?'#8a7048':kind==='chain'?'#b5a07c':p.line;X.beginPath();X.arc(cx,cy,kind==='chain'?3:2.5,0,Math.PI*2);X.fill();
        if(kind==='chain'){X.strokeStyle='#d1b889';X.lineWidth=1;for(let q=5;q<28;q+=8){X.beginPath();X.arc(px+q,py+16,2.5,0,Math.PI*2);X.stroke()}}
      }else if(kind==='canopy'){
        const tile=state.map[e.y]?.[e.x];
        if(tile===TT.PEACH_TREE||tile===TT.BAMBOO){X.fillStyle='#5a3c27';X.fillRect(px+14,py+15,4,17);X.fillStyle='#8b6740';X.fillRect(px+15,py+15,1,16)}
        X.fillStyle='#214b34';X.fillRect(px+ext.l,py+ext.t,ext.r-ext.l,Math.max(12,ext.b-ext.t-7));
        const blobs=[[7,11,8],[15,7,9],[24,12,8],[12,18,7],[22,19,7]];for(const[bX,bY,r]of blobs){X.fillStyle=((bX+bY+e.seed81)&1)?'#356b45':'#2a5b3b';X.beginPath();X.arc(px+bX+((e.seed81%3)-1),py+bY,r,0,Math.PI*2);X.fill()}
        X.globalAlpha*=.55;X.fillStyle='#78a45b';for(let q=0;q<4;q++)X.fillRect(px+5+((e.seed81+q*7)%22),py+5+((e.seed81+q*11)%14),2,3);
      }
      X.restore();return true;
    }
    return{build,draw,stats:()=>state?.connectedDecor81||{groups:0,cells:0,maxGroup:0,total:state?.decor?.length||0}};
  })();


  





  function queuePlace81(){requestAnimationFrame(placeInput)}








  /* Reapply after start/load without adding switches or changing user policy. */
  registerGenerationStage('runtime81','post',()=>{Integrity81.repair();ConnectedDecor81.build();queuePlace81()});
    
  addEventListener('pointerup',stopHeldInput,{passive:true});addEventListener('pointercancel',stopHeldInput,{passive:true});addEventListener('blur',stopHeldInput,{passive:true});document.addEventListener('visibilitychange',()=>{if(document.hidden)stopHeldInput()},{passive:true});

  cleanViewportUI();makeInput();rebindControls();ConnectedDecor81.build();CameraController.resume(false);

  
  
  
  
  
  
  

  window.__MANRU_RUNTIME81__={state:Runtime81,Automation81,Camera81:CameraController,Zoom81:ZoomController,ConnectedDecor81,Integrity81,inspect:inspectTile81,stopHeld:stopHeldInput};



  const V85={version:'v8.7-nethack-dense-modules',recent:[],samples:[]};

  // New architectural vocabulary. These are real map tiles, not random object sprites.
  Object.assign(TT,{
    STONE_PILLAR:44,LANTERN_POST:45,WALL_BANNER:46,CRATE:47,BENCH:48,FLOWERBED:49,ROCK:50,STATUE:51,RACK:52,LOW_FENCE:53,CARPET:54,STONE_PATH:55,WINDOW:56,
    WOOD_FLOOR:57,MOON_STONE:58,DARK_WOOD:59,GILDED_FLOOR:60,PAPER_CRANE:61,LOTUS_FLOWER:62,INCENSE_STAND:63,IRON_HOOK:64,GOLD_LAMP:65,PETAL_MAT:66,GARDEN_TREE:67,
    RUMOR_BED:69,RUMOR_MED_CABINET:70,RUMOR_GAS_PIPE:71,RUMOR_FLOOD_GRATE:72,RUMOR_ARCHIVE_PILE:73,RUMOR_WEAPON_RACK:74,RUMOR_SILK_DIVAN:75,RUMOR_RITUAL_OBELISK:76,RUMOR_CHARRED_COUNTER:77,RUMOR_INVESTIGATION_BOARD:78,RUMOR_SMUGGLER_BUNDLE:79,RUMOR_GREENHOUSE_FRAME:80,BED:81,BOOK_STACK:82
  });
  TERRAIN_LAYER_CACHE58=null;
  const BLOCK85=new Set([TT.STONE_PILLAR,TT.LANTERN_POST,TT.WALL_BANNER,TT.CRATE,TT.BENCH,TT.FLOWERBED,TT.ROCK,TT.STATUE,TT.RACK,TT.LOW_FENCE,TT.WINDOW,TT.GARDEN_TREE,TT.RUMOR_BED,TT.RUMOR_MED_CABINET,TT.RUMOR_GAS_PIPE,TT.RUMOR_ARCHIVE_PILE,TT.RUMOR_WEAPON_RACK,TT.RUMOR_SILK_DIVAN,TT.RUMOR_RITUAL_OBELISK,TT.RUMOR_CHARRED_COUNTER,TT.RUMOR_INVESTIGATION_BOARD,TT.RUMOR_SMUGGLER_BUNDLE,TT.RUMOR_GREENHOUSE_FRAME,TT.BED,TT.BOOK_STACK]);
  const SIGHT85=new Set([TT.STONE_PILLAR,TT.WALL_BANNER,TT.STATUE,TT.GARDEN_TREE,TT.RUMOR_INVESTIGATION_BOARD,TT.RUMOR_GREENHOUSE_FRAME]);


  // Perfume River walls are stone mountain / gorge walls, not purple room walls.



  
  
  
  
  
  
  
  
  
  
  

  
  
  
  

  
  
  
  
  
  

  
  
  
  
  
  
  
  
  /* ===== v8.7: NetHack-5.0-inspired themed geometry modules =====
     Geometry and regional furnishing are deliberately separated: room shape first,
     then a region-specific fill. No U-shaped fake rooms; each module is a real
     room/corridor topology with controlled local alternatives. */
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  



  function normalizeDoors86(){
    if(!state||state.specialFloor)return 0;let removed=0;
    const pass=(x,y)=>in85(x,y)&&!tileBlocks(state.map[y][x]);
    for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++)if(state.map[y][x]===TT.DOOR){
      const l=pass(x-1,y),r=pass(x+1,y),u=pass(x,y-1),d=pass(x,y+1),n=(l?1:0)+(r?1:0)+(u?1:0)+(d?1:0),valid=(l&&r&&!u&&!d)||(u&&d&&!l&&!r);
      if(!valid){setTerrainTile58(state.map,x,y,TT.FLOOR);removed++;}
    }
    state.doorCleanup86=removed;return removed;
  }







  function strategicPlacement85(path){
    if(!NORMAL85.has(state.floor)||!path?.length)return;
    const pathSet=new Set(path.map(p=>key85(p.x,p.y))),distPath=r=>{let best=1e9;for(const p of path){const d=Math.abs(p.x-r.cx)+Math.abs(p.y-r.cy);if(d<best)best=d}return best};
    const sideRooms=(state.rooms||[]).filter(r=>r.w>=5&&r.h>=5&&!pathSet.has(key85(r.cx,r.cy))).sort((a,b)=>distPath(b)-distPath(a));
    const rewardRoom=sideRooms.find(r=>distPath(r)>=4);
    if(rewardRoom&&ReachabilityService.playerPassable(rewardRoom.cx,rewardRoom.cy)&&!(state.items||[]).some(i=>Math.abs(i.x-rewardRoom.cx)+Math.abs(i.y-rewardRoom.cy)<3)){
      try{dropRandomItem({x:rewardRoom.cx,y:rewardRoom.cy},true);state.featureRooms=state.featureRooms||[];state.featureRooms.push({name:'측면 보급실',x:rewardRoom.x,y:rewardRoom.y,w:rewardRoom.w,h:rewardRoom.h,kind85:'reward'})}catch(error){ignoreError('side-room reward could not be placed; generation continues without it',error)}
    }
    const movable=(state.monsters||[]).filter(m=>!m.boss&&!m.fixed&&!m.aquatic&&!m.flying);
    const moveNear=(mon,anchor)=>{if(!mon||!anchor)return false;for(let r=0;r<=4;r++)for(let y=anchor.y-r;y<=anchor.y+r;y++)for(let x=anchor.x-r;x<=anchor.x+r;x++){if(!in85(x,y)||Math.max(Math.abs(x-anchor.x),Math.abs(y-anchor.y))!==r)continue;if(PlacementService.monsterCanStand(mon,x,y)){mon.x=x;mon.y=y;mon.alerted=false;return true}}return false};
    if(rewardRoom&&movable[0])moveNear(movable[0],{x:rewardRoom.cx,y:rewardRoom.cy});
    const doors=[];for(let y=2;y<ROWS-2;y++)for(let x=2;x<COLS-2;x++)if(state.map[y][x]===TT.DOOR&&pathSet.has(key85(x,y)))doors.push({x,y});
    if(doors.length&&movable[1])moveNear(movable[1],doors[Math.floor(doors.length*.55)]);
    if(sideRooms[1]&&movable[2])moveNear(movable[2],{x:sideRooms[1].cx,y:sideRooms[1].cy});
    state.strategy85={mainPath:path.length,sideRooms:sideRooms.length,rewardRoom:rewardRoom?{x:rewardRoom.cx,y:rewardRoom.cy}:null,guardedDoors:doors.length};
  }
  
  registerMinimapHook('architecture85',({sx,sy})=>{if(state)for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(state.seen.has(k(x,y))){if(state.map[y][x]===TT.WINDOW){MX.fillStyle='#83a2a7';MX.fillRect(x*sx,y*sy,Math.max(1,Math.ceil(sx)),Math.max(1,Math.ceil(sy)))}else if(state.map[y][x]===TT.GARDEN_TREE){MX.fillStyle='#456b45';MX.fillRect(x*sx,y*sy,Math.max(1,Math.ceil(sx)),Math.max(1,Math.ceil(sy)))}}});
  registerGenerationStage('architecture85','post',finishArchitecture90);
  // r53: removed generation-on-load stage architecture85; saved geometry is authoritative.


  
  


  /* ===== MANRU v8.8: v8.0 STRUCTURE REBASE + DISCIPLINED THEME DECOR ===== */
  V85.version='v8.8-v80-structure-theme-decor';
  
  const WALLLIKE88=new Set([TT.WALL,TT.WINDOW]);
  const DECOR88=new Set([TT.STONE_PILLAR,TT.LANTERN_POST,TT.WALL_BANNER,TT.CRATE,TT.BENCH,TT.FLOWERBED,TT.ROCK,TT.STATUE,TT.RACK,TT.LOW_FENCE,TT.CARPET,TT.STONE_PATH]);
  function clear88(m){for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)setTerrainTile58(m,x,y,TT.WALL);state.rooms=[]}

  function room88(m,x,y,w,h,shape='rect'){
    x=Math.max(1,Math.min(COLS-w-2,x));y=Math.max(1,Math.min(ROWS-h-2,y));
    const r=roomRect(x,y,w,h);r.shape88=shape;state.rooms.push(r);const x0=x+1,y0=y+1,x1=x+w-2,y1=y+h-2;
    if(shape==='serpentine'||shape==='rturn'){
      const ys=[y0,y0+1,r.cy-1,r.cy,y1-1,y1];for(const yy of ys)for(let xx=x0;xx<=x1;xx++)setTerrainTile58(m,xx,yy,TT.FLOOR);
      for(let yy=y0;yy<=r.cy;yy++)for(let xx=x1-1;xx<=x1;xx++)setTerrainTile58(m,xx,yy,TT.FLOOR);
      for(let yy=r.cy;yy<=y1;yy++)for(let xx=x0;xx<=x0+1;xx++)setTerrainTile58(m,xx,yy,TT.FLOOR);
      if(shape==='rturn')for(let yy=y0;yy<=r.cy;yy++)for(let xx=x0;xx<=x0+1;xx++)setTerrainTile58(m,xx,yy,TT.FLOOR);
    }else if(shape==='cross'){
      const armX=Math.max(2,Math.floor((w-2)/3)),armY=Math.max(2,Math.floor((h-2)/3));
      for(let yy=y0;yy<=y1;yy++)for(let xx=x0;xx<=x1;xx++)if(Math.abs(xx-r.cx)<=Math.floor(armX/2)||Math.abs(yy-r.cy)<=Math.floor(armY/2))setTerrainTile58(m,xx,yy,TT.FLOOR);
    }else{
      for(let yy=y0;yy<=y1;yy++)for(let xx=x0;xx<=x1;xx++)setTerrainTile58(m,xx,yy,TT.FLOOR);
      if(shape==='chamfer'&&w>=7&&h>=7)for(const [xx,yy] of [[x0,y0],[x1,y0],[x0,y1],[x1,y1]])setTerrainTile58(m,xx,yy,TT.WALL);
      else if(shape==='pillars'&&w>=9&&h>=8)for(const [xx,yy] of [[x0+1,y0+1],[x1-1,y0+1],[x0+1,y1-1],[x1-1,y1-1]])setTerrainTile58(m,xx,yy,TT.STONE_PILLAR);
    }
    setTerrainTile58(m,r.cx,r.cy,TT.FLOOR);return r;
  }


  function doorPoint88(r,target){if(['serpentine','rturn'].includes(r.shape88)){const south=(target.cy??target.y)>r.cy,y=south?r.y+r.h-1:r.y,x=r.cx;return{x,y,ox:x,oy:y+(south?1:-1)}}const dx=target.x-r.cx,dy=target.y-r.cy;if(Math.abs(dx)>=Math.abs(dy)){const east=dx>=0,x=east?r.x+r.w-1:r.x,y=Math.max(r.y+2,Math.min(r.y+r.h-3,target.y));return{x,y,ox:x+(east?1:-1),oy:y}}const south=dy>=0,y=south?r.y+r.h-1:r.y,x=Math.max(r.x+2,Math.min(r.x+r.w-3,target.x));return{x,y,ox:x,oy:y+(south?1:-1)}}

  function manhattan88(m,a,b,style='L'){
    let x=a.x,y=a.y,guard=0;corridorCell(m,x,y);if(style==='diag'){stairPath88(m,a,b);return}
    const hf=style==='H'||(style==='L'&&globalThis.__MANRU_RANDOM57__()<.5);
    if(style==='Z'){
      if(globalThis.__MANRU_RANDOM57__()<.5){const mx=Math.round((a.x+b.x)/2);while(x!==mx&&guard++<500){x+=Math.sign(mx-x);corridorCell(m,x,y)}while(y!==b.y&&guard++<500){y+=Math.sign(b.y-y);corridorCell(m,x,y)}while(x!==b.x&&guard++<500){x+=Math.sign(b.x-x);corridorCell(m,x,y)}}
      else{const my=Math.round((a.y+b.y)/2);while(y!==my&&guard++<500){y+=Math.sign(my-y);corridorCell(m,x,y)}while(x!==b.x&&guard++<500){x+=Math.sign(b.x-x);corridorCell(m,x,y)}while(y!==b.y&&guard++<500){y+=Math.sign(b.y-y);corridorCell(m,x,y)}}return;
    }
    if(hf){while(x!==b.x&&guard++<500){x+=Math.sign(b.x-x);corridorCell(m,x,y)}while(y!==b.y&&guard++<500){y+=Math.sign(b.y-y);corridorCell(m,x,y)}}else{while(y!==b.y&&guard++<500){y+=Math.sign(b.y-y);corridorCell(m,x,y)}while(x!==b.x&&guard++<500){x+=Math.sign(b.x-x);corridorCell(m,x,y)}}
  }
  function connect88(m,a,b,style='L'){const da=doorPoint88(a,b),db=doorPoint88(b,a);setTerrainTile58(m,da.x,da.y,TT.DOOR);setTerrainTile58(m,db.x,db.y,TT.DOOR);carveInterior(m,da.ox,da.oy);carveInterior(m,db.ox,db.oy);manhattan88(m,{x:da.ox,y:da.oy},{x:db.ox,y:db.oy},style)}
  
  

  
  
  
  
  
  
  
  

  function floorOnly88(x,y){return in85(x,y)&&[TT.FLOOR,TT.GRASS,TT.LIGHT_GRASS,TT.STONE_PATH,TT.CARPET].includes(state.map[y][x])&&!OccupancyService.isOccupied(x,y)&&!(state.player.x===x&&state.player.y===y)&&!(state.stairs.x===x&&state.stairs.y===y)}

  

  function open88(x,y){return in85(x,y)&&!tileBlocks(state.map[y][x])}
  function validWindow88(x,y){
    if(!in85(x,y)||state.map[y][x]!==TT.WALL)return false;const z=regionIndex();if(z!==0&&z!==2)return false;
    const wl=(xx,yy)=>in85(xx,yy)&&WALLLIKE88.has(state.map[yy][xx]);
    const horizontal=wl(x-1,y)&&wl(x+1,y)&&open88(x,y-1)&&open88(x,y+1)&&(wl(x-2,y)||wl(x+2,y));
    const vertical=wl(x,y-1)&&wl(x,y+1)&&open88(x-1,y)&&open88(x+1,y)&&(wl(x,y-2)||wl(x,y+2));
    if(horizontal===vertical)return false;
    if(DIRS8.some(([dx,dy])=>state.map[y+dy]?.[x+dx]===TT.DOOR))return false;
    return true;
  }




  // No random sprite confetti on normal floors. Theme identity is expressed by deliberate map tiles above.

;

  // Decorative blockers behave like walls: no unsolicited "X 바로 앞이다" messages.
  // r57: silent physical decor blocking is integrated into canonical bumpBlockedTile.


  // Remove any dedicated identify-talisman toolbar artifact. Generic targeted-talisman cancel UI remains for mobile usability.
  const killIdentifyBar88=()=>{for(const q of ['#identifyToolbar','#identifyToolbar56','.identifyToolbar','.identifyTalismanToolbar','[data-identify-toolbar]'])document.querySelectorAll(q).forEach(e=>e.remove());const h=document.getElementById('talismanTarget56'),title=document.getElementById('talismanTargetTitle');if(h&&title&&/감정부적/.test(title.textContent||''))h.classList.remove('show')};
  killIdentifyBar88();new MutationObserver(killIdentifyBar88).observe(document.body,{subtree:true,childList:true,characterData:true});

  // r53: removed generation-on-load stage windows88; saved geometry is authoritative.

  
  


  /* ===== MANRU v8.9: CLEAN ARCHITECTURE + SPARSE FOCAL DECOR ===== */
  V85.version='v8.9-clean-architecture-sparse-focal-decor';
  

  
  function add89(m,x,y,w,h,kind='room',shape='rect'){
    const r=room88(m,x,y,w,h,shape);r.kind89=kind;return r;
  }
  
  function corridor89(m,a,b,style='L'){connect88(m,a,b,style)}

  function splitRoom89(m,r,axis='v',doors=1){
    if(!r||r.w<9||r.h<8)return false;
    if(axis==='v'){
      const x=r.cx;for(let y=r.y+1;y<r.y+r.h-1;y++)if(m[y][x]===TT.FLOOR)setTerrainTile58(m,x,y,TT.WALL);
      const ys=doors>1?[r.cy-2,r.cy+2]:[r.cy];for(const y of ys)if(y>r.y&&y<r.y+r.h-1)setTerrainTile58(m,x,y,TT.DOOR);
    }else{
      const y=r.cy;for(let x=r.x+1;x<r.x+r.w-1;x++)if(m[y][x]===TT.FLOOR)setTerrainTile58(m,x,y,TT.WALL);
      const xs=doors>1?[r.cx-2,r.cx+2]:[r.cx];for(const x of xs)if(x>r.x&&x<r.x+r.w-1)setTerrainTile58(m,x,y,TT.DOOR);
    }
    return true;
  }
  

  // A clean horizontal gallery with rooms attached to it. Side rooms never create map-wide bypasses.
  

  // Three courts in sequence. Only the center court is intentionally spacious.
  

  // Sequential zig-zag blocks. One path, short local choices only.
  

  // Twin galleries permit a local alternate path but both tracks rejoin often, preventing a giant exterior bypass.
  

  // A compact 2x3 cloister: clean geometry, only one controlled loop around a center block.
  

  
  

  

  // Theme identity now comes primarily from structure and a handful of focal props, not room-by-room prop spam.
  

  function sparsePair89(r,t,side='top'){
    if(!r)return 0;let pts=[];
    if(side==='top')pts=[[r.x+2,r.y+2],[r.x+r.w-3,r.y+2]];
    else if(side==='bottom')pts=[[r.x+2,r.y+r.h-3],[r.x+r.w-3,r.y+r.h-3]];
    else pts=[[r.x+2,r.cy],[r.x+r.w-3,r.cy]];
    let n=0;for(const [x,y] of pts)if(floorOnly88(x,y)){setTerrainTile58(state.map,x,y,t);n++}return n;
  }

  // Windows remain themes 1 and 3 only, and are substantially rarer.


  
  function relocateEntities89(savedMonsters,savedItems){
    state.monsters=[];
    for(const mon of savedMonsters||[]){
      if(mon.boss)continue;const pos=PlacementService.randomMonsterCell(mon);if(pos){mon.x=pos.x;mon.y=pos.y;mon.alerted=false;OccupancyService.addMonster(mon)}
    }
    const used=new Set();state.items=[];
    const candidates=[];for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++)if(ReachabilityService.playerPassable(x,y)&&state.map[y][x]!==TT.STAIR&&!(x===state.player.x&&y===state.player.y)&&!OccupancyService.isOccupied(x,y))candidates.push({x,y});
    for(const it of savedItems||[]){if(!candidates.length)break;let idx=Math.floor(globalThis.__MANRU_RANDOM57__()*candidates.length),pos=candidates.splice(idx,1)[0];it.x=pos.x;it.y=pos.y;PlacementService.placeItem(it);used.add(pos.x+','+pos.y)}
  }
  
  ;

  
  
  


  /* ===== MANRU v9.0: DENSE PURPOSEFUL ROOMS / NO WASTED WINGS ===== */
  V85.version='v9.0-dense-purposeful-rooms';
  
  const FUNCTION90=new Set([TT.RUMOR,TT.BRAZIER,TT.TRAP,TT.ARMORY,TT.FOUNTAIN,TT.MIRROR,TT.ALTAR,TT.VAULT,TT.SNARE,TT.CACHE,TT.COOKPOT,TT.JAR,TT.GOLD]);

  
  
  
  
  

  
  
  
  
  
  

  function roomFreeCells90(r){const a=[];for(let y=r.y+1;y<r.y+r.h-1;y++)for(let x=r.x+1;x<r.x+r.w-1;x++)if(floorOnly88(x,y))a.push({x,y});return a}

  function purposeTile90(type,z){
    if(type==='supply')return TT.CACHE;if(type==='armory')return TT.ARMORY;if(type==='shrine')return z===4?TT.ALTAR:TT.BRAZIER;if(type==='kitchen')return TT.COOKPOT;if(type==='archive')return z===2?TT.MIRROR:TT.RUMOR;if(type==='medic')return TT.FOUNTAIN;return TT.CACHE;
  }
  function purposeRooms90(z){
    const leaves=[...(state.branchLeaves92||[])],fallback=[...(state.branchRooms92||[])].sort((a,b)=>(b.branchDepth92||0)-(a.branchDepth92||0));const src=leaves.length?leaves:fallback;state.purposeRooms90=[];
    const used=new Set(),wanted=Math.min(6,src.length);for(let i=0;i<wanted;i++){const r=src[i],rk=`${r.x},${r.y}`;if(used.has(rk))continue;used.add(rk);const type=['supply','armory','medic','archive','shrine','trapcache'][(state.floor+z+i*2)%6],cells=roomFreeCells90(r);if(!cells.length)continue;const center=cells.reduce((b,p)=>Math.abs(p.x-r.cx)+Math.abs(p.y-r.cy)<Math.abs(b.x-r.cx)+Math.abs(b.y-r.cy)?p:b,cells[0]),t=purposeTile90(type,z);setTerrainTile58(state.map,center.x,center.y,t);
      if(['supply','armory','archive','trapcache'].includes(type))addItem(r,type!=='supply');if(type==='trapcache'){const q=cells.find(p=>Math.abs(p.x-center.x)+Math.abs(p.y-center.y)>=2);if(q)setTerrainTile58(state.map,q.x,q.y,z===2?TT.SNARE:TT.TRAP)}
      const rr={...r,purpose90:type};state.purposeRooms90.push(rr);feature89(({supply:'보급실',armory:'무기고',medic:'회복실',archive:'기록실',shrine:'제단실',trapcache:'위험 보관실'})[type],r,'purpose');
    }
    state.purposeCount90=state.purposeRooms90.length;
  }
  function fillUnused90(){state.minorPurpose90=0;return 0}
  function guardPurposes90(){
    const mons=(state.monsters||[]).filter(m=>!m.boss&&!m.fixed&&!m.aquatic&&!m.flying);let mi=0,guards=0;
    for(const r of state.purposeRooms90||[]){if(mi>=mons.length)break;if(['medic','kitchen'].includes(r.purpose90))continue;const mon=mons[mi++];let placed=false;for(let rad=0;rad<=3&&!placed;rad++)for(let y=r.cy-rad;y<=r.cy+rad&&!placed;y++)for(let x=r.cx-rad;x<=r.cx+rad;x++){if(PlacementService.monsterCanStand(mon,x,y)){mon.x=x;mon.y=y;mon.alerted=false;guards++;placed=true;break}}}
    state.purposeGuards90=guards;
  }
  function smallTheme90(z){
    const g=state.grandRoom89;if(!g)return;let n=0;
    // only the grand room gets sparse, symmetric decoration; purpose rooms rely on functional identity.
    if(z===0){n+=sparsePair89(g,TT.LANTERN_POST,'top');if(g.w>=10)n+=sparsePair89(g,TT.BENCH,'bottom')}
    else if(z===1){n+=sparsePair89(g,TT.FLOWERBED,'top');if(floorOnly88(g.cx,g.cy))setTerrainTile58(state.map,g.cx,g.cy,TT.ROCK)}
    else if(z===2){n+=sparsePair89(g,TT.WALL_BANNER,'top');if(floorOnly88(g.cx,g.cy))setTerrainTile58(state.map,g.cx,g.cy,TT.STATUE)}
    else if(z===3){n+=sparsePair89(g,TT.RACK,'bottom');if(floorOnly88(g.cx,g.cy))setTerrainTile58(state.map,g.cx,g.cy,TT.CRATE)}
    else{n+=sparsePair89(g,TT.STONE_PILLAR,'top');if(floorOnly88(g.cx,g.cy))setTerrainTile58(state.map,g.cx,g.cy,TT.STATUE)}
    state.decor=[];state.grandDecor90=n;
  }

  

;

  
  
  

  /* ===== MANRU v9.1: V7-STYLE ORGANIC ROOMS / DENSE F2 / READABLE FLOOR / FAST PAN ===== */
  V85.version='v9.1-v7rooms-readable-fastpan';
  
  function reset91(m){clear88(m);state.rooms=[];state.featureRooms=[];state.routeTags=[];state.grandRoom89=null;state.focalRooms89=[];state.purposeRooms90=[];state.mainRooms90=[];}
  
  function roomOverlap91(x,y,w,h,pad=2){return (state.rooms||[]).some(r=>x<r.x+r.w+pad&&x+w+pad>r.x&&y<r.y+r.h+pad&&y+h+pad>r.y)}
  function organic91(m,z){
    reset91(m);const target=rand(12,16),cx=Math.floor(COLS/2),cy=Math.floor(ROWS/2);let tries=0;
    // One larger anchor room near, but not exactly at, the center. It is the only deliberately grand volume.
    const gw=Math.min(13,Math.max(10,Math.floor(COLS*.22))),gh=Math.min(10,Math.max(8,Math.floor(ROWS*.22))),gx=clamp(cx-Math.floor(gw/2)+rand(-3,3),2,COLS-gw-3),gy=clamp(cy-Math.floor(gh/2)+rand(-2,2),2,ROWS-gh-3);
    const grand=add89(m,gx,gy,gw,gh,'grand',globalThis.__MANRU_RANDOM57__()<.45?'chamfer':'rect');grand.grand90=true;state.mainRooms90.push(grand);
    while(state.rooms.length<target&&tries++<950){
      const w=rand(6,11),h=rand(5,9),x=rand(2,Math.max(2,COLS-w-3)),y=rand(2,Math.max(2,ROWS-h-3));
      if(roomOverlap91(x,y,w,h,2))continue;
      const roll=globalThis.__MANRU_RANDOM57__(),shape=roll<.14?'chamfer':roll<.21&&w>=9&&h>=7?'cross':'rect',r=add89(m,x,y,w,h,'room',shape);state.mainRooms90.push(r);
    }
    // If random packing under-fills, add compact rooms in the remaining walls.
    for(let t=0;state.rooms.length<10&&t<500;t++){
      const w=6,h=5,x=rand(2,COLS-w-3),y=rand(2,ROWS-h-3);if(roomOverlap91(x,y,w,h,1))continue;const r=add89(m,x,y,w,h,'room','rect');state.mainRooms90.push(r);
    }
    const rooms=[...state.rooms];
    // V7-like nearest-neighbour tree: every room joins its nearest already-connected room.
    const connected=[grand],left=rooms.filter(r=>r!==grand);
    while(left.length){let best=null,bd=1e9,bi=-1,ba=null;for(let i=0;i<left.length;i++)for(const a of connected){const d=Math.abs(left[i].cx-a.cx)+Math.abs(left[i].cy-a.cy);if(d<bd){bd=d;best=left[i];bi=i;ba=a}}if(!best)break;corridor89(m,ba,best,globalThis.__MANRU_RANDOM57__()<.28?'Z':globalThis.__MANRU_RANDOM57__()<.12?'diag':'L');connected.push(best);left.splice(bi,1)}
    // Only local crosslinks: short alternative routes, never one giant outside bypass.
    const pairs=[];for(let i=0;i<rooms.length;i++)for(let j=i+1;j<rooms.length;j++){const a=rooms[i],b=rooms[j],d=Math.abs(a.cx-b.cx)+Math.abs(a.cy-b.cy);if(d>=8&&d<=Math.max(15,Math.floor((COLS+ROWS)*.18)))pairs.push({a,b,d})}
    pairs.sort((a,b)=>a.d-b.d);let links=0;for(const q of pairs){if(links>=rand(2,3))break;if(globalThis.__MANRU_RANDOM57__()<.42)continue;corridor89(m,q.a,q.b,links%2?'Z':'L');links++}
    // Split only several large non-grand rooms; the wall plan does the work instead of decorative clutter.
    const split=[...rooms].filter(r=>r!==grand&&r.w>=9&&r.h>=7).sort((a,b)=>b.w*b.h-a.w*a.h).slice(0,rand(2,4));split.forEach((r,i)=>splitRoom89(m,r,i%2?'h':'v',1));
    // One or two compact annexes in wall pockets, echoing the v7 side-room feel.
    let annex=0;for(let t=0;t<360&&annex<2;t++){
      const w=rand(6,8),h=rand(5,7),x=rand(2,COLS-w-3),y=rand(2,ROWS-h-3);if(roomOverlap91(x,y,w,h,2))continue;
      const r=add89(m,x,y,w,h,'annex','rect');state.mainRooms90.push(r);let near=null,bd=1e9;for(const a of state.rooms){if(a===r)continue;const d=Math.abs(a.cx-r.cx)+Math.abs(a.cy-r.cy);if(d<bd){bd=d;near=a}}if(near)corridor89(m,near,r,globalThis.__MANRU_RANDOM57__()<.5?'Z':'L');annex++;
    }
    state.grandRoom89=grand;const sorted=[...state.rooms].filter(r=>r!==grand).sort((a,b)=>Math.abs(a.cx-grand.cx)+Math.abs(a.cy-grand.cy)-(Math.abs(b.cx-grand.cx)+Math.abs(b.cy-grand.cy)));state.focalRooms89=[sorted[Math.floor(sorted.length*.33)],sorted[Math.floor(sorted.length*.72)]].filter(Boolean);
    feature89('중앙 대실',grand,'grand');state.layoutMode85='v7-organic';state.layoutName='불규칙 객실군 · 근거리 연결 회랑 / 국소 순환 / 부속실';
  }
  



  // Camera panning: coalesce pointermove events to one camera mutation per animation frame.
  
  
  // Expensive atmosphere/light passes are skipped only while the user is actively dragging the camera; full quality returns immediately on release.
  
  
  
  
  

  ;
  

  /* ===== MANRU v9.3: ASYMMETRIC CLUSTERS / VARIABLE-WIDTH HALLS / SHORT PURPOSEFUL BRANCHES ===== */
  V85.version='v9.3-asymmetric-clusters-variable-halls';


  function reset93(m){delete state.tutorialEntry60;clear88(m);state.rooms=[];state.featureRooms=[];state.routeTags=[];state.grandRoom89=null;state.focalRooms89=[];state.purposeRooms90=[];state.mainRooms90=[];state.branchRooms92=[];state.branchLeaves92=[];state.mainPathRooms92=[];state.roomGraph92=null;state.roomTemplate92=null;state.roomGraph93=null;state.roomTemplate93=null;}
  function canPlace93(x,y,w,h,pad=1){return x>=2&&y>=(state.floor===1?17:2)&&x+w<COLS-2&&y+h<ROWS-2&&!roomOverlap91(x,y,w,h,pad)}
  function addCompact93(m,x,y,w,h,kind='room',shape='rect',role='room'){const r=add89(m,x,y,w,h,kind,shape);r.node93=state.rooms.length-1;r.role93=role;state.mainRooms90.push(r);return r}

  function shortestNodes93(adj,s,t){const q=[s],prev=Array(adj.length).fill(-2);prev[s]=-1;for(let i=0;i<q.length;i++){const u=q[i];if(u===t)break;for(const v of adj[u])if(prev[v]===-2){prev[v]=u;q.push(v)}}if(prev[t]===-2)return[];const out=[];for(let u=t;u!==-1;u=prev[u])out.push(u);return out.reverse()}
  function farNode93(adj,s){const q=[s],d=Array(adj.length).fill(-1);d[s]=0;for(let i=0;i<q.length;i++){const u=q[i];for(const v of adj[u])if(d[v]<0){d[v]=d[u]+1;q.push(v)}}let b=s;for(let i=0;i<d.length;i++)if(d[i]>d[b])b=i;return{node:b,dist:d[b],d}}
  function diameter93(adj){const a=farNode93(adj,0).node,b=farNode93(adj,a).node;return{a,b,path:shortestNodes93(adj,a,b)}}
  function graphDistance93(adj,a,b){const p=shortestNodes93(adj,a,b);return p.length?p.length-1:99}




  function segment93(out,x,y,tx,ty){while(x!==tx||y!==ty){const px=x,py=y;if(x!==tx)x+=Math.sign(tx-x);else y+=Math.sign(ty-y);out.push({x,y,dir:x!==px?'h':'v'})}return{x,y}}
  function pathPoints93(a,b,style='L'){let x=a.x,y=a.y;const out=[];if(style==='Z'){if(globalThis.__MANRU_RANDOM57__()<.5){const mx=Math.round((a.x+b.x)/2);({x,y}=segment93(out,x,y,mx,y));({x,y}=segment93(out,x,y,x,b.y));({x,y}=segment93(out,x,y,b.x,b.y));}else{const my=Math.round((a.y+b.y)/2);({x,y}=segment93(out,x,y,x,my));({x,y}=segment93(out,x,y,b.x,y));({x,y}=segment93(out,x,y,b.x,b.y));}}else if(style==='diag'){while(x!==b.x||y!==b.y){const px=x,py=y;if(x!==b.x&&y!==b.y){if(globalThis.__MANRU_RANDOM57__()<.5)x+=Math.sign(b.x-x);else y+=Math.sign(b.y-y)}else if(x!==b.x)x+=Math.sign(b.x-x);else y+=Math.sign(b.y-y);out.push({x,y,dir:x!==px?'h':'v'})}}else if(style==='H'||(style==='L'&&globalThis.__MANRU_RANDOM57__()<.5)){({x,y}=segment93(out,x,y,b.x,y));({x,y}=segment93(out,x,y,b.x,b.y));}else{({x,y}=segment93(out,x,y,x,b.y));({x,y}=segment93(out,x,y,b.x,b.y));}return out}

  function connectVar93(m,a,b,style='L',width=1,options=null){if(options)return connectProfileRooms105(m,a,b,width,options);const da=doorPoint88(a,b),db=doorPoint88(b,a);setTerrainTile58(m,da.x,da.y,TT.DOOR);setTerrainTile58(m,db.x,db.y,TT.DOOR);corridorCell(m,da.ox,da.oy);corridorCell(m,db.ox,db.oy);const pts=pathPoints93({x:da.ox,y:da.oy},{x:db.ox,y:db.oy},style);let lastDir=null;for(const p of pts){if(lastDir&&p.dir!==lastDir&&width>1)carveSquare(m,p.x,p.y,1,!!options);if(options){for(let o=0;o<width;o++)corridorCell(m,p.x+(p.dir==='v'?o:0),p.y+(p.dir==='h'?o:0),true);}else carveBand(m,p.x,p.y,p.dir,width);lastDir=p.dir}if(width>1){carveSquare(m,da.ox,da.oy,1,!!options);carveSquare(m,db.ox,db.oy,1,!!options)}return options?pts:null}

// Profiles parameterize the canonical room/edge producer. Room shells are immutable
// routing obstacles: widening can never cut a jamb or create a freestanding door.
function placeProfileRooms105(m,p){
 const out=[],{columns,rows,cellW,cellH,x0,y0}=p;
 const landmarkRows=p.id==='canal'?[1,2]:[2,4],catalog=Object.keys(INDOOR_LANDMARKS[p.id]).filter(kind=>p.id!=='granary'||p.level>=2||kind!=='rats'),chosen=[];
 p.landmarkSlots={};for(const row of landmarkRows){const options=catalog.filter(v=>!chosen.includes(v)),kind=choice(options);chosen.push(kind);p.landmarkSlots[row*columns+rand(0,columns-1)]=kind;}
 p.rowOffsets=[];let cursor=y0;for(let j=0;j<rows;j++){p.rowOffsets.push(cursor);cursor+=cellH+(p.id==='granary'&&landmarkRows.includes(j)?10:0);}p.routeMaxY=cursor-1;
 p.dangerIndices=p.id==='granary'&&p.level===2?choice([[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]]).map((c,i)=>(1+i*2)*3+c):[];
 for(let j=0;j<rows;j++)for(let i=0;i<columns;i++){
  const landmark=p.landmarkSlots[out.length],district=landmark?INDOOR_LANDMARKS[p.id][landmark].palette:(i+Math.floor(j/2)+p.variant)%4, special=p.id==='canal'&&district===1;
  const shape=special?(j%2?'rturn':'serpentine'):district===2?'chamfer':'rect';
  const w=landmark?(p.id==='canal'?19:18):special?15:p.id==='granary'&&district===1?rand(11,14):rand(...p.roomW),h=landmark?(p.id==='canal'?16:19):special?13:p.id==='granary'&&district===1?6:rand(...p.roomH);
  const x=x0+i*cellW+rand(0,Math.max(0,cellW-w-4)),y=p.rowOffsets[j]+rand(0,Math.max(0,cellH+(landmark&&p.id==='granary'?10:0)-h-4));
  const r=addCompact93(m,x,y,w,h,'room',landmark?'rect':shape,landmark?'hall':special?'hall':'room');r.district105=district;r.index105=out.length;r.ports105=[];if(landmark){r.landmark105=landmark;buildIndoorLandmark105(m,r,p.id);}out.push(r);
 }
 p.rooms=out;return out;
}
function connectProfileRooms105(m,a,b,width,p){
 const rooms=p.rooms,kk=(x,y)=>x+','+y;
 const protectedCell=(x,y)=>rooms.some(r=>x>=r.x-1&&x<=r.x+r.w&&y>=r.y-1&&y<=r.y+r.h);
 const ports=(r,target)=>{
  const list=[];
  for(const [dx,dy]of [[0,-1],[0,1],[-1,0],[1,0]])for(let off=2;off<(dx?r.h:r.w)-2;off++){
   const x=dx?(dx<0?r.x:r.x+r.w-1):r.x+off,y=dy?(dy<0?r.y:r.y+r.h-1):r.y+off;
   if(m[y-dy]?.[x-dx]!==TT.FLOOR)continue;
   if(m[y+dx]?.[x-dy]!==TT.WALL||m[y-dx]?.[x+dy]!==TT.WALL)continue;
   if(r.ports105.some(q=>Math.max(Math.abs(q.x-x),Math.abs(q.y-y))<3&&!(q.x===x&&q.y===y)))continue;
   list.push({x,y,dx,dy,ox:x+dx*2,oy:y+dy*2,score:Math.abs(x+dx*3-target.cx)+Math.abs(y+dy*3-target.cy)});
  }
  return list.sort((a,b)=>a.score-b.score);
 };
 const aa=ports(a,b),bb=ports(b,a);let result;
 for(const pa of aa.slice(0,8)){for(const pb of bb.slice(0,8)){
  const from=kk(pa.ox,pa.oy),to=kk(pb.ox,pb.oy),queue=[{x:pa.ox,y:pa.oy}],prev=new Map([[from,null]]);let end=null;
  for(let i=0;i<queue.length;i++){const q=queue[i],key=kk(q.x,q.y);if(key===to){end=q;break}
   const dirs=[[0,-1],[1,0],[0,1],[-1,0]].sort((u,v)=>Math.abs(q.x+u[0]-pb.ox)+Math.abs(q.y+u[1]-pb.oy)-Math.abs(q.x+v[0]-pb.ox)-Math.abs(q.y+v[1]-pb.oy));
   for(const[dx,dy]of dirs){const x=q.x+dx,y=q.y+dy,key=kk(x,y);if(x<2||y<2||x>p.x0+p.columns*p.cellW-1||y>p.routeMaxY||protectedCell(x,y)||prev.has(key))continue;prev.set(key,q);queue.push({x,y})}
  }
  if(end){const route=[];for(let q=end;q;q=prev.get(kk(q.x,q.y)))route.push(q);route.reverse();result={pa,pb,route};break}
 }if(result)break}
 if(!result)throw Error('Profile corridor cannot connect '+a.index105+' / '+b.index105);
 const{pa,pb,route}=result;
 for(let i=0;i<route.length;i++){
  const q=route[i],next=route[Math.min(i+1,route.length-1)],before=route[Math.max(0,i-1)];q.dir=(next.x!==q.x||before.x!==q.x)?'h':'v';
  for(let o=0;o<width;o++){const x=q.x+(q.dir==='v'?o:0),y=q.y+(q.dir==='h'?o:0);if(!protectedCell(x,y))setTerrainTile58(m,x,y,TT.FLOOR)}
 }
 for(const[r,d]of[[a,pa],[b,pb]]){setTerrainTile58(m,d.x+d.dx,d.y+d.dy,TT.FLOOR);setTerrainTile58(m,d.x,d.y,TT.DOOR);if(!r.ports105.some(q=>q.x===d.x&&q.y===d.y))r.ports105.push({...d});}
 return route;
}

globalThis.__MANRU_ROOM_GEOMETRY105__=Object.freeze({generate:graphOrganic93});

  function placeRooms93(m,z,profile=null){
    if(profile)return placeProfileRooms105(m,profile);
    const rooms=[],target=state.floor===1?rand(10,13):rand(15,20),cx=Math.floor(COLS/2),cy=Math.floor(ROWS/2);let tries=0;
    if(state.floor===1||globalThis.__MANRU_RANDOM57__()<.34){const gw=rand(11,15),gh=rand(7,10),gx=clamp(cx-Math.floor(gw/2)+rand(-6,6),2,COLS-gw-3),gy=clamp(cy-Math.floor(gh/2)+rand(-5,5),state.floor===1?17:2,ROWS-gh-3);if(canPlace93(gx,gy,gw,gh,2)){const g=addCompact93(m,gx,gy,gw,gh,'grand',globalThis.__MANRU_RANDOM57__()<.35?'chamfer':'pillars','hall');g.grand90=true;state.grandRoom89=g;if(state.floor===1){g.name='등불 대청';for(let yy=g.y+1;yy<g.y+g.h-1;yy++)for(let xx=g.x+1;xx<g.x+g.w-1;xx++)if(m[yy][xx]===TT.FLOOR)setTerrainTile58(m,xx,yy,Math.abs(xx-g.cx)<=1?TT.CARPET:(yy===g.y+1||yy===g.y+g.h-2)?TT.STONE_PATH:TT.WOOD_FLOOR);for(const xx of [g.x+2,g.x+g.w-3])for(const yy of [g.y+2,g.y+g.h-3])if(terrainSurface58(m[yy][xx]))setTerrainTile58(m,xx,yy,TT.LANTERN_POST)}rooms.push(g)}}
    if(globalThis.__MANRU_RANDOM57__()<.48){const wide=globalThis.__MANRU_RANDOM57__()<.58,w=wide?rand(11,15):rand(5,7),h=wide?rand(4,6):rand(9,12),x=clamp(cx-Math.floor(w/2)+rand(-9,9),2,COLS-w-3),y=clamp(cy-Math.floor(h/2)+rand(-8,8),2,ROWS-h-3);if(canPlace93(x,y,w,h,1))rooms.push(addCompact93(m,x,y,w,h,'hall',globalThis.__MANRU_RANDOM57__()<.28?'chamfer':'rect','hall'))}
    while(rooms.length<target&&tries++<1600){
      let w,h,shape='rect',role='room';const roll=globalThis.__MANRU_RANDOM57__();
      if(roll<.14){w=rand(11,15);h=rand(4,6);role='hall';shape=globalThis.__MANRU_RANDOM57__()<.25?'chamfer':'rect';}
      else if(roll<.22){w=rand(5,7);h=rand(9,12);role='hall';shape='rect';}
      else{w=rand(6,11);h=rand(5,9);shape=roll<.34?'chamfer':roll<.41&&w>=9&&h>=7?'cross':roll<.48&&w>=9&&h>=8?'pillars':'rect'}
      let x,y;
      if(rooms.length<3||globalThis.__MANRU_RANDOM57__()<.22){x=rand(2,Math.max(2,COLS-w-3));y=rand(2,Math.max(2,ROWS-h-3));}
      else{const seed=choice(rooms),rx=seed.cx+rand(-13,13)-Math.floor(w/2),ry=seed.cy+rand(-10,10)-Math.floor(h/2);x=clamp(rx,2,COLS-w-3);y=clamp(ry,2,ROWS-h-3)}
      if(!canPlace93(x,y,w,h,role==='hall'?1:1))continue;
      if(rooms.length>=4){let near=1e9;for(const r of rooms)near=Math.min(near,Math.abs((x+Math.floor(w/2))-r.cx)+Math.abs((y+Math.floor(h/2))-r.cy));if(near>(role==='hall'?20:18)+(z>=3?2:0))continue}
      rooms.push(addCompact93(m,x,y,w,h,role==='hall'?'hall':'room',shape,role));
    }
    for(let t=0;rooms.length<(state.floor===1?10:13)&&t<1350;t++){const w=globalThis.__MANRU_RANDOM57__()<.3?rand(9,13):6,h=globalThis.__MANRU_RANDOM57__()<.3?rand(4,6):5,x=rand(2,COLS-w-3),y=rand(2,ROWS-h-3);if(!canPlace93(x,y,w,h,1))continue;rooms.push(addCompact93(m,x,y,w,h,'room','rect',w>=9||h>=8?'hall':'room'))}
    return rooms;
  }


  
  function softenRooms93(m,rooms,edges){
    const deg=Array(rooms.length).fill(0);for(const e of edges){deg[e.a]++;deg[e.b]++;}
    rooms.forEach((r,i)=>{if(deg[i]>=3&&r.w>=7&&r.h>=6){for(let yy=r.cy-1;yy<=r.cy+1;yy++)for(let xx=r.cx-1;xx<=r.cx+1;xx++)if(insideMapInterior(xx,yy)&&m[yy][xx]!==TT.WALL)setTerrainTile58(m,xx,yy,TT.FLOOR)}
      if(globalThis.__MANRU_RANDOM57__()<.24&&r.w>=8&&r.h>=7){const side=rand(0,3);if(side===0&&r.y>2)for(let yy=r.y-2;yy<r.y;yy++)for(let xx=r.cx-1;xx<=r.cx+1;xx++)if(m[yy][xx]===TT.WALL)setTerrainTile58(m,xx,yy,TT.FLOOR);else if(side===1&&r.y+r.h<ROWS-2)for(let yy=r.y+r.h;yy<=r.y+r.h+1;yy++)for(let xx=r.cx-1;xx<=r.cx+1;xx++)if(m[yy][xx]===TT.WALL)setTerrainTile58(m,xx,yy,TT.FLOOR);else if(side===2&&r.x>2)for(let xx=r.x-2;xx<r.x;xx++)for(let yy=r.cy-1;yy<=r.cy+1;yy++)if(m[yy][xx]===TT.WALL)setTerrainTile58(m,xx,yy,TT.FLOOR);else if(side===3&&r.x+r.w<COLS-2)for(let xx=r.x+r.w;xx<=r.x+r.w+1;xx++)for(let yy=r.cy-1;yy<=r.cy+1;yy++)if(m[yy][xx]===TT.WALL)setTerrainTile58(m,xx,yy,TT.FLOOR);}
    })
  }



  buildNormal=function(m,z){state.fixedStart=null;state.fixedExit=null;state.routeTags=[];state.featureRooms=[];state.layoutMode85=null;state.themedRooms87=[];state.__arch93=++V93.serial;graphOrganic93(m,z);state.layoutName=['청풍루','수묵원','유혹의 내실','지하 장고','만루의 심장'][z]+' · '+state.layoutName;};










  

  /* ===== MANRU v9.4: KEY TRIALS / PURPOSEFUL LOOT / NATURAL RECOVERY / VISUAL STABILITY ===== */
  V85.version='v9.5-expanded-complex-architecture';
  





  // Restore visually stable rendering during camera pan. RAF-coalesced camera movement stays, but map textures no longer switch quality modes.
  
  

  // Natural recovery replaces explicit Rest. Hunger controls the very slow recovery interval; combat/status suppresses it.
  function naturalInterval94(){const h=state?.player?.hunger??0;return h>=90?16:h>=65?22:h>=40?30:h>=20?42:Infinity}
  function safeForNatural94(){if(!state||state.status.poison>0||state.status.bleed>0)return false;return !state.monsters.some(m=>isThreatVisibleToPlayer(m)&&entityDistance57(m,state.player)<=4)}
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
  V85.version='v9.6.3-follow-camera-toolbar-fix';






  function keyPos96(x,y){return state?.keyPlan96?.keys?.find(k=>k.x===x&&k.y===y&&k.active!==false)||null}

  

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

  // F2 carpet is a narrow ceremonial runner; the stage uses a bordered platform instead of a giant rug block.
  function refineF2Floor96(){if(state.floor!==2)return;const cx=Math.floor(COLS/2);for(let y=3;y<=9;y++)for(let x=cx-10;x<=cx+10;x++)if(state.map[y]?.[x]===TT.CARPET)setTerrainTile58(state.map,x,y,TT.FLOOR);for(let y=4;y<=8;y++)for(let x=cx-4;x<=cx+4;x++)if(in85(x,y)&&state.map[y][x]===TT.FLOOR)setTerrainTile58(state.map,x,y,TT.CARPET);for(let y=10;y<ROWS-5;y++){for(let x=cx-1;x<=cx+1;x++)if(in85(x,y)&&[TT.FLOOR,TT.CARPET].includes(state.map[y][x]))setTerrainTile58(state.map,x,y,TT.CARPET)}}

  // Special maps that were visually too open receive structural partitions, not prop scatter.
  function densifySpecial96(){
    if(!state.specialFloor||[23,24].includes(state.floor))return;const m=state.map,cx=Math.floor(COLS/2),cy=Math.floor(ROWS/2);
    if(state.floor===16){
      // Outer approach gets two compact guard compounds so the field reads as a fortress approach, not a huge lawn.
      const fieldEnd=Math.floor(COLS*.27),specs=[[5,8,9,8],[Math.max(14,fieldEnd-11),ROWS-17,9,8]];for(const [x0,y0,w,h] of specs){if(x0+w>=fieldEnd)continue;for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++)if(in85(x,y))setTerrainTile58(m,x,y,(x===x0||x===x0+w-1||y===y0||y===y0+h-1)?TT.WALL:TT.GRASS);const dx=x0+Math.floor(w/2);setTerrainTile58(m,dx,y0+h-1,TT.DOOR);if(in85(dx,y0+2))setTerrainTile58(m,dx,y0+2,TT.CACHE);state.rooms.push({x:x0,y:y0,w,h,cx:x0+Math.floor(w/2),cy:y0+Math.floor(h/2)})}
      // Staggered outer defensive walls create multiple approach lanes instead of one huge open field.
      for(const x of [Math.floor(fieldEnd*.42),Math.floor(fieldEnd*.70)]){for(let y=5;y<ROWS-6;y++){if(y%13>=4&&y%13<=7)continue;if(in85(x,y)&&m[y][x]===TT.GRASS)setTerrainTile58(m,x,y,TT.WALL)}for(const y of [13,26,39,52])if(in85(x,y)&&m[y][x]===TT.WALL)setTerrainTile58(m,x,y,TT.DOOR)}
      state.featureRooms.push({name:'외곽 경비초소',x:3,y:5,w:fieldEnd-5,h:ROWS-10});
    }
    if(state.floor===18){
      // The post-warehouse zone becomes three linked chambers rather than one empty rectangle.
      const gateX=COLS-13,rightL=gateX+1;for(const y of [cy-10,cy+10]){for(let x=rightL;x<COLS-2;x++)if(m[y][x]!==TT.STAIR)setTerrainTile58(m,x,y,TT.WALL);const dx=COLS-8;setTerrainTile58(m,dx,y,TT.DOOR)}for(const x of [rightL+4,rightL+9]){if(x>=COLS-3)continue;for(let y=4;y<ROWS-5;y++){if(Math.abs(y-cy)<3||y%12<3)continue;if(m[y][x]===TT.FLOOR)setTerrainTile58(m,x,y,TT.WALL)}for(const y of [cy-15,cy,cy+15])if(in85(x,y)&&m[y][x]===TT.WALL)setTerrainTile58(m,x,y,TT.DOOR)}state.featureRooms.push({name:'후면 삼연 창고',x:rightL,y:2,w:COLS-rightL-2,h:ROWS-4});
    }
    if(state.floor===22){
      // Split the nave into central aisle + side ambulatories with repeated arches.
      const nave=(state.rooms||[]).filter(r=>r.x<=cx&&cx<r.x+r.w&&r.y<=cy&&cy<r.y+r.h).sort((a,b)=>a.w*a.h-b.w*b.h)[0];if(nave){for(const x of [cx-4,cx+4])for(let y=nave.y+2;y<nave.y+nave.h-2;y++){if((y-nave.y)%8<3){if(m[y][x]===TT.WALL)setTerrainTile58(m,x,y,TT.FLOOR);continue}if(m[y][x]===TT.FLOOR||m[y][x]===TT.FLOOR)setTerrainTile58(m,x,y,TT.WALL)}for(let y=nave.y+6;y<nave.y+nave.h-5;y+=8){for(const x of [cx-4,cx+4]){setTerrainTile58(m,x,y,TT.DOOR);if(in85(x,y-1))setTerrainTile58(m,x,y-1,TT.FLOOR);if(in85(x,y+1))setTerrainTile58(m,x,y+1,TT.FLOOR)}}state.featureRooms.push({name:'삼랑 신전 회랑',x:nave.x,y:nave.y,w:nave.w,h:nave.h})}
      // Two additional side partitions articulate the wider transept.
      for(const x of [Math.floor(COLS*.30),Math.floor(COLS*.70)]){for(let y=8;y<ROWS-9;y++){if(Math.abs(y-cy)<4)continue;if(m[y][x]===TT.FLOOR)setTerrainTile58(m,x,y,TT.WALL)}for(const y of [cy-10,cy+10])if(in85(x,y)){setTerrainTile58(m,x,y,TT.DOOR);if(in85(x-1,y))setTerrainTile58(m,x-1,y,TT.FLOOR);if(in85(x+1,y))setTerrainTile58(m,x+1,y,TT.FLOOR)}}
    }
  }

  // Camera81 delegates to CameraState12; the visual loop consumes its dirty flag once per frame.
  const Cam96=window.__MANRU_RUNTIME81__?.Camera81;

  // v9.1 used a cheaper alternate wall/light renderer while inspecting. That caused the texture
  // to visibly change during a pan. Restore the same render pipeline for follow and inspect modes.
  
  
  
  

  registerGenerationStage('locks96','post',()=>{clearLegacyTrial();refineF2Floor96();densifySpecial96();installLockPlan();if(window.__MANRU_RUNTIME81__?.Integrity81)window.__MANRU_RUNTIME81__.Integrity81.repair();VisibilityService.compute()});
  
  function lockAudit96(){return auditKeyPlanLocks(state.keyPlan96)}
  function lockPlanProgressed96(plan=state.keyPlan96){
    if(!plan)return false;
    if((plan.keys||[]).some(q=>q.active===false))return true;
    if((plan.doors||[]).some(d=>d.open===true||state.map?.[d.y]?.[d.x]!==TT.LOCKED_GATE))return true;
    return Object.values(plan.ring||{}).some(v=>(+v||0)>0);
  }
  function stripLockPlan96(plan=state.keyPlan96){
    if(!plan)return;
    for(const d of plan.doors||[])if(state.map?.[d.y]?.[d.x]===TT.LOCKED_GATE)setTerrainTile58(state.map,d.x,d.y,TT.DOOR);
    for(const q of plan.keys||[])if(state.map?.[q.y]?.[q.x]===TT.KEY_TILE)setTerrainTile58(state.map,q.x,q.y,TT.FLOOR);
    state.keyPlan96=null;
  }








  function updateDesktopSide962(){if(innerWidth<=1080||!state)return;buildDesktopSide();updateRadar();updateKeys()}
  buildDesktopSide();
  registerPanelHook54('desktop962',updateDesktopSide962);
  addEventListener('resize',()=>{if(innerWidth>1080){buildDesktopSide();updateDesktopSide962()}},{passive:true});


  function strictLockFloors(){return [...new Set([...LOCK_SPECIAL.keys(),...LOCK_NORMAL.keys()])]}
  


  /* ===== MANRU v9.6.4: DOOR CLOSING + 1.30x ENEMY POPULATION ===== */
  V85.version='v9.6.4-close-door-enemy-130';
  const V964={version:V85.version,density:1.30};


  // Bridge the last pre-ammo generator into the newer release closure without another wrapper.
  MANRU_GENERATION_PIPELINE.density=addDensityMonsters964;

  function openDoorCandidates964(){
    if(!state?.player)return[];const p=state.player,fdx=p.facing?.x||0,fdy=p.facing?.y||0;
    const dirs=[[fdx,fdy],[1,0],[-1,0],[0,1],[0,-1]],seen=new Set(),out=[];
    for(const [dx,dy] of dirs){if(!dx&&!dy)continue;const x=p.x+dx,y=p.y+dy,key=`${x},${y}`;if(seen.has(key))continue;seen.add(key);if(x<=0||y<=0||x>=COLS-1||y>=ROWS-1||state.map[y][x]!==TT.OPEN_DOOR)continue;out.push({x,y,dirMatch:dx===fdx&&dy===fdy})}
    return out.sort((a,b)=>(b.dirMatch?1:0)-(a.dirMatch?1:0));
  }

  function closeAdjacentDoor964(quiet=false){
    const act=playerAction57('closeDoor',{stunMessage:'몸이 굳어 문을 닫지 못했다.'});if(!act.ok)return !!act.consumed;const cands=openDoorCandidates964();if(!cands.length){if(!quiet)toast('닫을 열린 문이 없다.');return false}
    const d=cands[0],why=doorCloseBlock964(d.x,d.y);if(why){if(!quiet)toast(why);return false}
    cancelAutoWalk();setTerrainTile58(state.map,d.x,d.y,TT.DOOR);doorFX(d.x,d.y);addLog('문을 닫았다.');VisibilityService.compute();commitPlayerAction57(act,1);return true;
  }
ActionDispatcher.register('CLOSE_DOOR',closeAdjacentDoor964);
  window.closeAdjacentDoor=closeAdjacentDoor964;

  globalThis.__MANRU_CONTEXT_DOOR_HANDLER_R25__=()=>ActionDispatcher.dispatch({type:'CLOSE_DOOR',args:[true]}).value;

  registerPanelHook54('door964',refreshDoorContext);

  

  /* ===== MANRU v9.6.5: MARTIAL STEALTH + PRESENTATION FX ===== */
  V85.version='v9.6.5-martial-stealth-fx';
  MARTIAL_INFO.ghost.desc='형체와 기척을 흐려 비보스 적의 추적을 끊는다. 공격하면 즉시 해제.';
  MARTIAL_INFO.strong.desc='기를 응축해 다음 유효 근접 공격을 크게 강화. 준비 중 황금 기운이 유지된다.';
  MARTIAL_INFO.roar.desc='충격파로 주변 적에게 피해와 경직. 레벨 1/2/3/4의 반경은 각각 1/2/3/4칸. 벽 너머에는 닿지 않는다.';




  globalThis.__MANRU_MARTIAL_FX965__=Object.freeze({pulse:martialPulse,used:martialUsedFx});

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
  PresentationState.register('martial965',now=>{if(FX965.pulse&&now>=FX965.pulse.until)FX965.pulse=null});

  globalThis.__MANRU_DRAW_HOOKS_R19__?.post.push({id:'martial965',draw:drawMartialOverlay});

  


  window.MANRU_AMMO=AMMO_TYPES;
  for(const w of WEAPONS)if(w.kind==='bow')w.ammoFamily='arrow';









  
  
  
  
  
  


  




  

  
  
























  // v9.7 generation/load wrappers were folded into the current release pipeline.
  // v9.8.3 load quality pass is registered in the canonical lifecycle below.
  
  // r30: ammunition selection is integrated in canonical useInventoryItem.
  registerInventoryRenderR34('r967-ammo','post',()=>{const box=document.getElementById('inventory');if(box&&state){box.querySelectorAll('[data-invuse]').forEach(b=>{const it=state.player.inventory[+b.dataset.invuse];if(it?.type==='ammo')b.textContent=it.ammoKind===state.player.loadedAmmoKind?'장전됨':'장전'});box.querySelectorAll('[data-invslot]').forEach(b=>{const it=state.player.inventory[+b.dataset.invslot];if(it?.type==='ammo'){if(it.ammoKind===state.player.loadedAmmoKind)b.classList.add('ammo967-loaded');const role=b.querySelector('.uxRole47');if(role)role.textContent='탄약'}})}});
  /* R7 refactor: ammo inventory/world visuals now use the canonical exact-item renderer. */
  registerPlayerAttackStageR('ammo967',(next,mon,bonus=0,...args)=>{const a=state?._activeAmmo967,d=ammoDef(a?.ammoKind);if(!d)return next(mon,bonus,...args);const oldDef=mon.def;if(d.pierce)mon.def=Math.max(0,(mon.def||0)-d.pierce);try{return next(mon,bonus+(d.atkBonus||0),...args)}finally{mon.def=oldDef}});
  globalThis.__MANRU_AMMO_ATTACK__={consume:consumeAmmo,prepare(){if(!isBow967())return{ok:true,active:false};const a=selectedAmmo();if(!a){toast('화살이 없다. 탄약을 찾아야 한다.');addLog('활시위를 당겼지만 장전할 화살이 없다.');return{ok:false,active:true}}return{ok:true,active:true,ammo:a,before:state.turn,stunned:(state.status.stun||0)>0}},finish(ctx){if(ctx?.active&&!ctx.consumed&&ctx.ammo&&state.turn>ctx.before&&!ctx.stunned)consumeAmmo(ctx.ammo)}};

  

  































  








  const floorSet980=new Set([TT.FLOOR,TT.GRASS,TT.LIGHT_GRASS,TT.CARPET,TT.STONE_PATH,TT.WOOD_FLOOR,TT.MOON_STONE,TT.DARK_WOOD,TT.GILDED_FLOOR,TT.PAPER_BRIDGE,TT.GOLD]);
  const plannedSet980=new Set([TT.FLOOR,TT.GRASS,TT.LIGHT_GRASS,TT.CARPET,TT.STONE_PATH,TT.WOOD_FLOOR,TT.MOON_STONE,TT.DARK_WOOD,TT.GILDED_FLOOR,TT.PAPER_BRIDGE,TT.DRAWBRIDGE_DOWN,TT.RAFT,TT.STAIR,TT.DOOR,TT.OPEN_DOOR,TT.LOCKED_GATE,TT.KEY_TILE,TT.PAVILION,TT.FLOOR,TT.GOLD]);
  const IMMUTABLE_TILES=new Set([TT.STAIR,TT.LOCKED_GATE,TT.KEY_TILE,TT.SECRET_DOOR,TT.HIDDEN_BRIDGE,TT.HIDDEN_WALL,TT.CRUMBLE]);














  





  


















































  // v9.8.0 generation/load orchestration is executed by the single current pipeline below.

  /* ---------- visual quality: zone-aware floors, wall caps, and connected props ---------- */



  /* ---------- full-map renderer for screenshot QA ---------- */


  /* ===== MANRU v9.8.1: FIXED MAP DENSITY / RAFT SAFETY / PORTAL LABYRINTH / REACHABILITY ===== */
  V980.version='v9.8.1-fixed-map-portal-reachability';
  Object.assign(TT,{PORTAL:68});TERRAIN_LAYER_CACHE58=null;
  floorSet980.add(TT.PORTAL);plannedSet980.add(TT.PORTAL);
  const V981={version:V980.version,errors:[],repairs:[],portalBuilds:0};









  
  function floor21Stand981(x,y,opt={}){
    if(!in980(x,y))return false;const t=tileReveal981(x,y,opt);
    // 21F generation must never pass merely because the current run happens to carry a temporary hazard ward.
    if([TT.VOID,TT.WATER,TT.LAVA,TT.MERCURY].includes(t))return false;
    return ReachabilityService.playerTerrainPassable(x,y,{...opt,tileAt:(x,y)=>tileReveal981(x,y,opt)});
  }
  /* 21F canonical movement audit: the player chooses any legal landing 1..range tiles away on one of 8 rays.
     Direction input resolves to the farthest candidate, while pointer/touch may choose any nearer candidate. */
  

  

















































  // v9.8.1 generation/load orchestration is executed by the single current pipeline below.

  registerMinimapHook('portals981',({sx,sy})=>{if(state?.portalLinks981){MX.fillStyle='#c58be9';for(const id of Object.keys(state.portalLinks981)){const[x,y]=id.split(',').map(Number);if(state.seen.has(key980(x,y)))MX.fillRect(x*sx,y*sy,Math.max(2,sx),Math.max(2,sy))}}});






function repairFloor21Blink(){return ensureFloor21Blink(4)}

  /* v9.8.3 direct monster stats / core loot / clean current-generation pipeline */
if(typeof MANRU_GENERATION_PIPELINE.density!=='function')throw new Error('MANRU pipeline density stage missing');
  const V982={
    version:'v9.8.3-direct-stats-clean-pipeline',
    upgradesPerChapter:3,
    healsPerChapter:2
  };





  function healProto982(f=state?.floor||1){const P=window.MANRU_POTIONS||[];const kind=f>=6?'heal_medium':'heal_small';return P.find(i=>i.potionKind===kind)||P.find(i=>i.potionKind==='heal_small')||null}









  // Remove the old parallel upgrade economy from future loot tables.
  const upMeta=upgradeProto();if(upMeta){upMeta.minFloor=1;upMeta.stackMax=15;upMeta.desc='장비 하나의 기본 성능을 한 단계 개량한다. 강화 횟수 제한은 없지만 이미 소비한 강화는 다른 장비로 되돌릴 수 없다.'}

  // Random upgrade rolls are normalized after floor generation: all incidental upgrade items are
  // converted before the chapter-scheduled upgrade is inserted. Regions 2-4 are balanced by the
  // MONSTERS table itself; no hidden post-spawn HP/ATK multiplier is applied.




  
  
  globalThis.__MANRU_GENERATE_CORE983__=NormalGenerationStages.riverAndCore;

  

  
  
  
  // v9.8.8: explicit inspect/search action removed; long-press detail viewer remains.




/* v9.8.4 cohesive runtime: intentionally inside the main game closure */

  try{localStorage.removeItem('manruZoomActual48')}catch(error){ignoreError('old zoom setting could not be removed',error)}




try{localStorage.removeItem('manruCameraMode984')}catch(error){console.warn('[manru] camera setting not cleared',error)};








  globalThis.__MANRU_CAMERA_STATE12__=CameraState;globalThis.__MANRU_CAMERA_PROJECTION12__=CameraProjection;globalThis.__MANRU_WORLD_HITTEST12__=WorldHitTest12;
  window.__MANRU_V984_SET_ZOOM__=(v,anchor=null)=>CameraState.setZoom(v,false,anchor);
  globalThis.__MANRU_CAMERA984__=Object.freeze({zoomByScale(scale,anchor=null){return CameraState.setZoom(cameraData.zoom*scale,false,anchor)}});
  


  bindZoom();

  /* Desktop zoom owns wheel/trackpad input at window capture, before legacy handlers can quantize it. */
  window.addEventListener('wheel',InputRouter,{capture:true,passive:false});InputRouter.noteListener('window:wheel');

  /* ---------- Shattered-style inspect: one description source, top window, complete terrain codex ---------- */
  let pendingInspect984=null;
  const TERRAIN986=new Map([
    [TT.PALACE_ROCK,{...palaceInspect(TT.PALACE_ROCK),inspectPriority57:'terrain'}],
    [TT.WALL,{desc:'두꺼운 내벽. 층을 거듭 증축하면서 오래된 벽 위에 새 벽을 덧댄 흔적이 남아 있다.'}],
    [TT.FLOOR,{desc:'수많은 발자국에 닳은 객주 바닥. 얼룩과 긁힌 자국이 지나간 사람들의 흔적을 남긴다.'}],
    [TT.STAIR,{desc:'더 깊은 층으로 내려가는 계단. 아래에서 올라오는 공기는 층이 바뀔 때마다 냄새부터 달라진다.',hint:'계단 위에서 내려가면 다음 층으로 진행한다.'}],
    [TT.DOOR,{desc:'두 공간을 가르는 무거운 문. 닫힌 문 너머의 시야와 동선을 끊는다.',hint:'가까이 다가가 열 수 있으며, 문 여는 소리는 주변의 주의를 끌 수 있다.'}],
    [TT.OPEN_DOOR,{desc:'열린 문. 오래된 경첩이 버티고 있지만 다시 닫힐 여지는 남아 있다.'}],
    [TT.RUMOR,{desc:'손때 묻은 종이와 낙서가 모인 기록판. 사실과 헛소문이 뒤섞여 있지만 만루를 먼저 지난 이들의 흔적이다.',hint:'조사하면 이 층이나 주변 구조에 관한 단서를 얻을 수 있다.'}],
    [TT.BRAZIER,{desc:'기름과 숯을 태우던 화로. 꺼진 뒤에도 금속에는 열과 그을음이 배어 있다.',hint:'불과 관련된 효과나 위험의 단서가 될 수 있다.'}],
    [TT.TRAP,{desc:'바닥 무늬 사이에 숨겨진 작동 장치. 밟는 순간에야 제대로 된 구조를 드러낸다.',hint:'밟으면 함정이 작동한다.'}],
    [TT.ARMORY,{desc:'병장기를 보관하던 자리. 벽과 바닥에는 날붙이를 걸어 두었던 홈이 남아 있다.',hint:'전투용 물품과 관련된 장소다.'}],
    [TT.WATER,{desc:'만루 안쪽을 흐르는 차가운 물. 바깥 수로와 이어진다는 말은 있지만 정확한 물길을 아는 사람은 없다.'}],
    [TT.FOUNTAIN,{desc:'오래된 정화수 샘. 맑은 물이 고여 있는데도 바닥에는 먼지가 거의 내려앉지 않는다.',hint:'접촉하면 몸을 추스르거나 상태를 정리하는 데 도움이 된다.'}],
    [TT.MIRROR,{desc:'사람의 얼굴보다 방 안의 빈 공간을 더 또렷하게 비추는 거울. 시선을 오래 두면 반사가 한 박자 늦는다.',hint:'거울과 관련된 기믹은 보이는 모습만 믿지 않는 편이 좋다.'}],
    [TT.ALTAR,{desc:'짙은 향과 오래된 핏자국이 남은 제단. 누가 무엇을 바쳤는지는 기록에서 지워져 있다.',hint:'공격·의지 상승 확률은 1 / (1 + 지금까지 제단에서 힘을 얻은 횟수). 실패하면 피를 바치거나 요괴가 나타난다.'}],
    [TT.VAULT,{desc:'두꺼운 장석과 자물쇠로 막은 금고. 귀중품을 지키려 만든 흔적이 지나치게 많다.',hint:'열 수 있다면 일반적인 방보다 좋은 보상을 기대할 수 있다.'}],
    [TT.SNARE,{desc:'바닥에 눌러 새긴 구속진. 선을 밟으면 기운이 엉켜 움직임을 방해하도록 짜여 있다.',hint:'발을 들이면 이동을 방해하는 효과가 생길 수 있다.'}],
    [TT.CACHE,{desc:'급히 숨겨 둔 보급함. 규격이 제각각이라 정식 창고 물건이라기보다 생존자들의 비축품에 가깝다.',hint:'조사하면 보급품을 얻을 수 있다.'}],
    [TT.COOKPOT,{desc:'그을음이 겹겹이 밴 큰 솥. 한때는 손님 수십 명의 식사를 동시에 끓였던 물건이다.',hint:'재료가 있다면 음식을 다루는 데 사용할 수 있다.'}],
    [TT.PAPER_BRIDGE,{desc:'물과 공허 위에 임시로 얹은 좁은 다리. 재료는 약해 보여도 발을 디딜 부분만큼은 치밀하게 겹쳐 놓았다.'}],
    [TT.JAR,{desc:'향신료와 장류를 저장하던 큰 장독. 봉인을 뜯은 흔적과 다시 덮은 흔적이 여러 겹 남아 있다.',hint:'깨뜨리거나 조사했을 때 안의 내용물이 드러날 수 있다.'}],
    [TT.LAVA,{desc:'성채 아래에서 끓는 용암. 돌벽을 오래 달군 탓에 가까이 가기만 해도 공기가 메마르다.',hint:'직접 밟는 것은 치명적이다. 안전한 구조물이나 다른 이동 수단을 찾아야 한다.'}],
    [TT.DRAWBRIDGE_DOWN,{desc:'무거운 사슬로 내린 도개교. 해자와 단절된 공간을 잇기 위한 성채의 통로다.'}],
    [TT.VOID,{desc:'바닥도 벽도 없는 검은 틈. 빛을 비추면 가장자리만 보이고 깊이는 끝내 드러나지 않는다.',hint:'걸어서 건널 수 없다. 점멸이나 연결 구조가 필요하다.'}],
    [TT.GOLD,{desc:'바닥 틈에서 새어 나오는 금빛 잔광. 금속 그 자체보다 오래된 술식의 잔재에 가깝다.'}],
    [TT.MERCURY,{desc:'거울처럼 빛나는 수은 웅덩이. 표면은 잔잔하지만 주변 공기에는 차갑고 금속성인 냄새가 맴돈다.',hint:'빠지면 가까운 뭍을 붙잡아도 HP 1만 남는다. 붙잡을 곳이 없으면 빠져나올 수 없다.'}],
    [TT.SWITCH,{desc:'벽과 바닥의 다른 장치에 이어진 기계식 조작부. 닳은 부분을 보면 여러 번 사용된 흔적이 있다.',hint:'작동시키면 연결된 구조물의 상태가 바뀔 수 있다.'}],
    [TT.DRAWBRIDGE_UP,{desc:'위로 들려 올라간 도개교. 반대편은 보이지만 현재 상태로는 통로 역할을 하지 못한다.',hint:'연결된 장치를 찾아 내려야 건널 수 있다.'}],
    [TT.BAMBOO,{desc:'빛을 삼키듯 빽빽하게 자란 대나무. 바람이 없는데도 잎끼리 스치는 소리가 끊이지 않는다.',hint:'길을 막고 있다면 베어 통로를 낼 수 있지만 소리가 날 수 있다.'}],
    [TT.TABLE,{desc:'손님을 받던 연회상. 표면에는 술잔 자국과 칼자국, 급하게 밀어낸 그릇의 흔적이 겹쳐 있다.',hint:'길을 막고 있다면 치우거나 부술 수 있다.'}],
    [TT.SCREEN,{desc:'방 안의 시선을 끊는 비단 병풍. 천은 낡았지만 안쪽 그림만 이상하리만큼 선명하다.',hint:'부수거나 치우면 뒤쪽 공간이 드러날 수 있다.'}],
    [TT.GRASS,{desc:'실내라고 믿기 어려울 만큼 짙게 자란 풀. 수묵원에서는 벽보다 이 풀이 공간의 경계를 더 흐리게 만든다.'}],
    [TT.HEDGE,{desc:'사람 키 가까이 자란 생울타리. 가지를 얽어 일부러 길을 막은 흔적이 있다.',hint:'베어 통로를 만들 수 있지만 주변 적이 소리를 들을 수 있다.'}],
    [TT.RAFT,{desc:'강을 건너기 위해 묶어 만든 나무 뗏목. 물살에 맞춰 움직이도록 밑바닥의 결속이 독특하게 짜여 있다.',hint:'향수강에서는 강을 실제로 건너는 주 이동 수단이다.'}],
    [TT.FAKE_DOOR,{desc:'문처럼 꾸민 가짜 출입구. 손잡이와 경첩은 있지만 벽 뒤로 이어지는 공간은 없다.',hint:'진짜 문과 같은 방식으로 믿고 움직이면 시간을 낭비할 수 있다.'}],
    [TT.LOCKED_GATE,{desc:'두꺼운 철판과 잠금쇠로 닫힌 격벽. 힘으로 밀기보다 정해진 해제 절차를 요구하는 구조다.',hint:'해당 층의 열쇠나 장치를 찾아야 열린다.'}],
    [TT.KEY_TILE,{desc:'창고와 격벽의 잠금장치에 맞는 작은 열쇠. 관리자가 구역별로 나눠 보관했던 물건이다.',hint:'해당 층의 잠긴 구조를 여는 데 사용된다.'}],
    [TT.STAMINA_PAD,{desc:'바닥에 새긴 기 회복진. 선을 따라 미세한 열이 돌며 잠시 호흡을 고르게 만든다.',hint:'발판 위에서는 점멸에 필요한 기를 회복하는 데 도움이 된다.'}],
    [TT.PEACH_TREE,{desc:'지하 깊은 곳에서도 꽃과 열매를 맺는 복숭아나무. 뿌리가 어느 흙에 닿아 있는지는 알 수 없다.',hint:'길을 막은 나무는 베어낼 수 있다.'}],
    [TT.SECRET_DOOR,{desc:'벽과 거의 같은 재료로 숨긴 비밀문. 틈과 먼지의 방향을 자세히 보면 일반 벽과 조금 다르다.',hint:'조사하거나 가까이 다가가면 숨은 통로를 찾을 수 있다.'}],
    [TT.PAVILION,{desc:'물과 정원 사이에 세운 작은 정자. 휴식용 건축물인데도 깊은 층의 것들은 마치 누군가를 기다리는 자리처럼 배치돼 있다.'}],
    [TT.HIDDEN_BRIDGE,{desc:'주변 바닥과 물결이 아주 미세하게 어긋나는 지점. 무언가가 아래에 숨겨져 있는 듯하다.',hint:'세심하게 조사하면 숨은 통로의 정체가 드러날 수 있다.'}],
    [TT.HIDDEN_WALL,{desc:'주변 벽과 결이 조금 다른 구조물. 먼지와 균열이 한쪽으로만 끊겨 있다.',hint:'숨은 문이나 샛길일 가능성이 있다.'}],
    [TT.CRUMBLE,{desc:'금이 간 불안정한 발판. 무게를 받은 뒤에도 그대로 버틴다는 보장은 없다.',hint:'한 번 지나간 뒤 무너질 수 있으므로 퇴로를 생각해야 한다.'}],
    [TT.LIGHT_GRASS,{desc:'유난히 밝은 연두빛 풀. 만루의 조명보다 스스로 가진 빛에 가까운 색을 띤다.'}],
    [TT.STONE_PILLAR,{desc:'천장과 회랑을 받치는 석주. 표면의 마모가 심해 오래전부터 길의 경계와 엄폐물 역할을 해 왔다.'}],
    [TT.LANTERN_POST,{desc:'객주식 등롱을 매단 기둥. 기름은 거의 남지 않았는데도 심지 주변에는 최근의 그을음이 보인다.'}],
    [TT.WALL_BANNER,{desc:'벽을 길게 덮은 장식 깃발. 층마다 문양과 천의 색이 달라 한때 구역을 구분하는 표식으로 쓰였음을 알 수 있다.'}],
    [TT.CRATE,{desc:'운반용 목상자. 못을 여러 번 뽑고 다시 박은 흔적이 있어 같은 상자가 오랫동안 재사용된 듯하다.'}],
    [TT.BENCH,{desc:'긴 목제 의자. 손님과 일꾼이 잠깐 쉬던 자리지만 지금은 먼지와 긁힌 자국만 남았다.'}],
    [TT.FLOWERBED,{desc:'정원 안쪽의 작은 화단. 계절도 햇빛도 없는 곳에서 꽃의 종류만 계속 바뀌어 왔다.'}],
    [TT.ROCK,{desc:'수묵원의 흐름을 잡기 위해 놓은 정원석. 자연석처럼 보이지만 바닥 깊숙이 고정되어 있다.'}],
    [TT.STATUE,{desc:'이름이 지워진 인물을 새긴 석상. 얼굴 부분만 유독 많이 닳아 누군가 반복해서 손을 댄 듯하다.'}],
    [TT.RACK,{desc:'도구와 병기를 걸어 두는 진열 선반. 빈 칸의 모양으로 무엇이 사라졌는지만 짐작할 수 있다.'}],
    [TT.LOW_FENCE,{desc:'구역을 느슨하게 나누는 낮은 목책. 침입을 막기보다는 사람의 동선을 유도하기 위한 구조다.'}],
    [TT.CARPET,{desc:'회랑을 따라 깔린 두꺼운 융단. 발소리를 죽이고 바닥의 오래된 균열을 감춘다.'}],
    [TT.STONE_PATH,{desc:'정원과 강가에 이어진 석판길. 반복된 물기와 발자국 때문에 돌의 가장자리만 둥글게 닳았다.'}],
    [TT.WINDOW,{desc:'얇은 창호와 격자로 만든 창문. 바깥을 향해야 할 구조인데 대부분 다른 방이나 어둠만 비춘다. 몸은 지나가지 못하지만, 시야와 일부 사격물은 창 틈 사이로 오갈 수 있다.'}],
    [TT.WOOD_FLOOR,{desc:'밝은 황목으로 짠 마루. 습한 구역에서도 썩지 않아 수상 건물과 찻집에 주로 쓰였다.'}],
    [TT.MOON_STONE,{desc:'달빛 같은 회색빛을 띠는 석판. 차가운 표면이 주변의 소리와 열을 조금씩 삼키는 듯하다.'}],
    [TT.DARK_WOOD,{desc:'검게 기름먹인 목재 바닥. 무대와 창고처럼 발소리를 감춰야 하는 곳에 주로 깔려 있다.'}],
    [TT.GILDED_FLOOR,{desc:'금선을 박아 문양을 만든 바닥. 실제 금보다 의식용 경계선을 강조하기 위한 장식에 가깝다.'}],
    [TT.PAPER_CRANE,{desc:'색종이를 정교하게 접어 만든 종이학. 습한 공기 속에서도 접힌 선이 흐트러지지 않는다.'}],
    [TT.LOTUS_FLOWER,{desc:'얕은 물과 정원 가장자리에 피어난 연꽃. 뿌리가 닿을 흙이 없는 자리에서도 멀쩡히 자란다.'}],
    [TT.INCENSE_STAND,{desc:'향을 여러 자루 피우는 낮은 향대. 남은 재의 향이 층마다 조금씩 다른 냄새를 품고 있다.'}],
    [TT.IRON_HOOK,{desc:'천장과 벽에 박은 두꺼운 철제 걸이. 짐을 달기엔 지나치게 튼튼하고, 표면에는 오래된 마찰 자국이 남아 있다.'}],
    [TT.GOLD_LAMP,{desc:'금빛 갓을 씌운 등불. 불꽃이 작아도 주변의 금선과 수은 표면에 빛이 멀리 번진다.'}],
    [TT.PETAL_MAT,{desc:'말린 꽃잎을 엮어 만든 깔개. 밟으면 바스러질 것 같지만 새 꽃잎이 계속 섞여 들어간다.'}],
    [TT.GARDEN_TREE,{desc:'수목원 안에 뿌리내린 큰 나무. 가지가 천장을 피해 휘어진 모양으로 보아 오랫동안 이곳에서 자랐다.'}],
    [TT.RUMOR_BED,{desc:'숨은 치료실과 숙영실에 남겨진 낡은 침상. 얇은 매트와 목제 틀에는 오래 누워 있던 사람의 자국과 급하게 비운 흔적이 함께 남아 있다.',hint:'통로를 막는 고정 가구다. 침상 자체에서 보상이 나오지는 않는다.'}],
    [TT.RUMOR_MED_CABINET,{desc:'약병과 붕대, 치료 도구를 분류하던 약품 찬장. 비어 있는 칸과 남은 얼룩으로 보아 필요한 약부터 누군가 가져간 듯하다.',hint:'치료실의 용도를 보여 주는 전용 장식이다.'}],
    [TT.RUMOR_GAS_PIPE,{desc:'독가스 밀폐실 벽을 따라 이어진 굵은 가스관. 밸브는 봉인되어 있지만 이음새 주변에는 녹색 변색과 부식 흔적이 남아 있다.',hint:'독가스 방의 위험을 예고하는 구조물이다. 주변 가스 필드를 주의해야 한다.'}],
    [TT.RUMOR_FLOOD_GRATE,{desc:'침수 저장고의 물을 빼기 위해 만든 낮은 배수격자. 녹과 이끼가 끼어 있어 제 기능을 잃은 지 오래다.',hint:'통행은 가능하지만 침수 구역의 물길과 경계를 읽는 표식으로 쓰인다.'}],
    [TT.RUMOR_ARCHIVE_PILE,{desc:'무너진 서가에서 쏟아진 장부와 기록철 더미. 종이는 눅눅하게 들러붙었고 일부 페이지는 의도적으로 찢겨 있다.',hint:'서고의 붕괴 흔적을 보여 주는 전용 장애물이다.'}],
    [TT.RUMOR_WEAPON_RACK,{desc:'경비대가 창과 칼을 세워 두던 무기걸이. 비어 있는 홈의 수가 많아 이 방이 실제 보급 거점으로 쓰였음을 보여 준다.',hint:'경비·보급 계열 숨은방의 전용 장식이다.'}],
    [TT.RUMOR_SILK_DIVAN,{desc:'비단 내실에서 손님이나 관리자가 기대어 앉던 낮은 좌상. 천은 화려하지만 손잡이와 모서리만 유난히 닳아 있다.',hint:'비단 계열 숨은방의 분위기를 구분하는 고정 가구다.'}],
    [TT.RUMOR_RITUAL_OBELISK,{desc:'금빛 제례실에 세운 좁고 높은 석주. 면마다 서로 다른 봉인 문양이 새겨져 있고 바닥의 금선이 이 석주를 중심으로 갈라진다.',hint:'제례·심장부 계열 숨은방의 전용 구조물이다.'}],
    [TT.RUMOR_CHARRED_COUNTER,{desc:'폐주방에 남은 조리대. 칼자국보다 불에 갈라진 자국이 더 많고, 한쪽은 화재 당시의 열로 검게 휘어 있다.',hint:'불타버린 주방의 전용 장애물이다.'}],
    [TT.RUMOR_INVESTIGATION_BOARD,{desc:'조사관들이 허가도면과 현장 구조를 대조하던 대형 도면판. 붉은 실과 표시가 여러 숨은 구획을 가리키지만 일부 표식은 뜯겨 나갔다.',hint:'조사관 임시본부의 세계관 단서이자 시야를 일부 가리는 고정 장식이다.'}],
    [TT.RUMOR_SMUGGLER_BUNDLE,{desc:'밀수품을 천과 끈으로 급하게 묶어 둔 포대. 식량과 잡화 냄새가 섞여 나며 겉면에는 정식 창고 표식이 없다.',hint:'밀수 은닉처의 전용 장애물이다.'}],
    [TT.RUMOR_GREENHOUSE_FRAME,{desc:'유리온실을 떠받치던 금속·목재 골조. 유리는 대부분 사라졌지만 프레임에는 습기와 덩굴이 깊게 들러붙어 있다.',hint:'온실의 높이와 구획을 드러내는 전용 구조물이며 시야를 일부 가린다.'}],
    [TT.PORTAL,{desc:'공간을 접어 다른 방과 맞붙이는 무명 포탈. 표면에는 목적지를 나타내는 글자나 문양이 없다.',hint:'들어가기 전에는 어느 방으로 이어질지 지형만으로 확정하기 어렵다.'}]
  ]);
  const DECOR986=new Map([
    ['trim',{name:'바닥 테두리',desc:'방과 회랑의 경계를 따라 이어지는 낮은 마감재. 같은 건물 안에서도 구획마다 재료와 문양이 조금씩 달라진다.'}],
    ['scroll',{name:'벽걸이 두루마리',desc:'벽에 걸린 오래된 두루마리. 글씨는 습기와 그을음에 번졌지만 방의 용도와 주인의 격식을 짐작하게 한다.'}],
    ['vines',{name:'벽덩굴',desc:'갈라진 벽 틈을 타고 자란 덩굴. 햇빛이 닿지 않는데도 끝이 늘 밝은 쪽을 향해 뻗는다.'}],
    ['roots',{name:'드러난 뿌리',desc:'바닥과 벽을 밀어 올리며 자란 굵은 뿌리. 수목원의 나무들이 보이는 것보다 훨씬 넓게 서로 얽혀 있음을 보여 준다.'}],
    ['silk',{name:'비단 장막',desc:'빛을 받으면 결이 달라 보이는 얇은 비단. 시선을 끌어 방의 깊이와 출입구를 교묘하게 감춘다.'}],
    ['chains',{name:'매달린 쇠사슬',desc:'천장과 기둥 사이에 걸린 무거운 쇠사슬. 운반용인지 구속용인지 알 수 없을 만큼 여러 높이에 고리가 달려 있다.'}],
    ['relief',{name:'벽면 부조',desc:'벽을 얕게 파내 만든 부조. 가까이 보면 인물과 짐승의 형상이 여러 차례 덧깎여 서로 다른 시대의 흔적이 겹쳐 있다.'}],
    ['rug',{name:'긴 깔개',desc:'사람이 걷는 축을 따라 깔린 두꺼운 직물. 닳은 부분이 자연스럽게 방의 주 통행로를 드러낸다.'}],
    ['papers',{name:'흩어진 문서',desc:'찢긴 장부와 메모 조각. 글자는 대부분 이어지지 않지만 같은 인장과 날짜가 반복해서 나타난다.'}],
    ['rubble',{name:'무너진 잔해',desc:'벽돌과 나무 조각이 섞인 작은 잔해. 오래된 붕괴 흔적 위에 비교적 새 파편이 다시 얹혀 있다.'}],
    ['bones',{name:'마른 뼛조각',desc:'오래전에 남겨진 마른 뼈. 일부는 가지런히 모여 있고 일부는 끌려간 듯 흩어져 있다.'}],
    ['c81:runner',{name:'이어진 회랑 깔개',desc:'여러 칸을 하나의 길처럼 묶는 긴 깔개. 장식이라기보다 사람의 동선을 눈에 보이게 만드는 건축 요소다.'}],
    ['c81:roots',{name:'이어진 뿌리망',desc:'여러 바닥 칸을 가로질러 이어지는 뿌리. 한 줄을 따라가면 같은 수목 군락의 다른 줄기와 다시 만난다.'}],
    ['c81:silk',{name:'이어진 비단길',desc:'바닥을 가로질러 연속으로 펼쳐진 비단 띠. 내실의 방들을 하나의 의식 동선처럼 이어 놓았다.'}],
    ['c81:chain',{name:'연결 쇠사슬',desc:'바닥과 기둥 사이를 연속으로 잇는 굵은 쇠사슬. 장고의 구획을 임시로 묶거나 물건을 고정하는 데 쓰였던 듯하다.'}],
    ['c81:vein',{name:'빛나는 맥',desc:'바닥 아래에서 이어지는 희미한 광맥 같은 선. 만루 심부의 재료가 한 덩어리처럼 연결되어 있음을 암시한다.'}],
    ['c81:canopy',{name:'이어진 수관',desc:'여러 나무의 가지와 잎이 한 덩어리처럼 포개진 수관. 아래에서는 서로 다른 줄기의 경계를 구분하기 어렵다.'}]
  ]);
  const DECAL986=new Map([
    ['bones',{name:'남은 뼈',desc:'전투가 끝난 뒤 남은 뼈와 파편. 오래 머물면 다른 먼지와 뒤섞여 만루의 일부처럼 보이기 시작한다.'}],
    ['corpse',{name:'쓰러진 흔적',desc:'조금 전까지 움직이던 존재가 남긴 흔적. 만루에서는 이런 흔적조차 오래 보존되지 않는다.'}]
  ]);
  const KNOWN_DECOR986=['trim','scroll','vines','roots','silk','chains','relief','rug','papers','rubble','bones','c81:runner','c81:roots','c81:silk','c81:chain','c81:vein','c81:canopy'];


  function esc984(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function dedupeProse986(v,existing=''){
    const raw=String(v??'').replace(/\s+/g,' ').trim();if(!raw)return'';
    const parts=raw.match(/[^.!?。！？]+[.!?。！？]?/g)||[raw],seen=new Set((String(existing).replace(/\s+/g,' ').trim().match(/[^.!?。！？]+[.!?。！？]?/g)||[]).map(part=>part.trim().replace(/[.!?。！？]+$/,'').trim())),out=[];
    for(let part of parts){part=part.trim();if(!part)continue;const key=part.replace(/[.!?。！？]+$/,'').replace(/\s+/g,' ').trim();if(!key||seen.has(key))continue;seen.add(key);out.push(part)}
    return out.join(' ').replace(/\s+/g,' ').trim();
  }
  const DECOR_INSPECT_SURFACES986=new Set([TT.FLOOR,TT.GRASS,TT.GOLD,TT.FLOOR,TT.CARPET,TT.STONE_PATH,TT.WOOD_FLOOR,TT.MOON_STONE,TT.DARK_WOOD,TT.GILDED_FLOOR,TT.LIGHT_GRASS].filter(Number.isFinite));
  function validWallDecor986(d){return !!(d&&d.layer==='wall'&&state?.map?.[d.y]?.[d.x]===TT.WALL&&state?.map?.[d.y+1]?.[d.x]!==TT.WALL)}
  function decorAt986(x,y){
    if(!state||x<0||y<0||x>=COLS||y>=ROWS||!DECOR_INSPECT_SURFACES986.has(state.map?.[y]?.[x]))return null;
    const exact=(state.decor||[]).filter(d=>d.layer!=='wall'&&d.x===x&&d.y===y),projected=(state.decor||[]).filter(d=>validWallDecor986(d)&&d.x===x&&d.y+1===y),list=[...exact,...projected];if(!list.length)return null;
    const score=d=>d.layer==='object'?40:d.layer==='wall'?30:d.connected81?24:(d.kind==='trim'?5:18);
    return list.sort((a,b)=>score(b)-score(a))[0]||null;
  }
  function decorInfo986(d){const info=DECOR986.get(String(d?.kind||''))||{name:'이름 없는 장식',desc:'만루의 방을 채우는 작은 장식물. 기능보다 그 공간을 사용했던 사람들의 취향과 습관을 남긴다.'};return{name:info.name,desc:info.desc,hint:info.hint||''}}
  function decalInfo986(x,y){const d=[...(state?.decals||[])].reverse().find(v=>v.x===x&&v.y===y);if(!d)return null;const info=DECAL986.get(d.type)||null;return info?{name:info.name,desc:info.desc,hint:''}:null}


  function terrainInfo986(t,x,y){
    const definition=TERRAIN986.get(t);if(definition?.inspectPriority57==='terrain')return{name:terrainName(t),...definition};
    const world=terrainReactions105(),steam=state.tempFields?.find(f=>f.kind==='steam'&&f.x===x&&f.y===y&&f.ttl>0),spill=world.spills?.[k(x,y)],clue=world.clues?.[k(x,y)];
    if(steam)return{name:'증기',desc:`${steam.ttl}턴 동안 시야와 사선을 가린다.`,hint:'통행 가능. 피해·중독·경직이 없으며 소리는 통과한다.'};
    if(clue)return{name:terrainName(t)+' · 틈새 흔적',desc:clue.elem==='water'?'물이 벽 틈으로 스며들어 문처럼 생긴 윤곽을 남겼다.':'벽 틈으로 연기가 새어 나온다.',hint:'이 근처의 벽을 조사하거나 상호작용해 보자.'};
    if(spill)return{name:({water:'얕은 물자국',oil:'기름 웅덩이',poison:'독액',wine:'쏟아진 술'})[spill.kind],desc:`남은 ${spill.ttl}턴. `+({water:'몸의 불을 끈다.',oil:'불에 닿으면 화염이 생기며 개체의 연소가 5턴으로 늘어난다.',poison:'밟으면 중독된다.',wine:'밟으면 취기·약화, 불에 닿으면 점화된다.'})[spill.kind],hint:'물속성으로 기름·독·술을 씻어낼 수 있다.'};
    if([TT.DOOR,TT.OPEN_DOOR].includes(t)&&!protectedProp105(x,y)&&!world.burning[k(x,y)])return{name:terrainName(t),desc:'일반 목제문. 불에 닿으면 3턴간 타고 무너지며 검게 탄 숯을 남긴다.',hint:'문을 열거나 닫아도 연소는 이어진다. 물로 끌 수 있다.'};
    if(t===TT.JAR){const contents=jarContents105(x,y);return{name:'장독',desc:({water:'물',oil:'기름',poison:'독액',wine:'술'})[contents]+'이 담겨 있다. '+(contents==='poison'?'깨지면 독가스가 점차 퍼진 뒤 옅어진다.':'깨지면 주변 바닥에 5턴간 쏟아진다.'),hint:'일반 공격·사격·강제 파괴로 깨진다. 공격 한 번으로 깨며 그 칸으로 이동하지 않는다.'};}
    if(t===TT.MIRROR)return{name:'천면경',desc:'차가운 유리면이 광선과 시선 공격을 발원자에게 되돌린다.',hint:'공격 경로 위의 거울만 반사한다. 화살·투척물·폭발은 반사하지 않는다.'};
    if(t===TT.PAPER_BRIDGE&&!world.burning[k(x,y)])return{name:'종이다리',desc:'플레이어가 밟거나 물속성이 닿으면 붕괴를 예고한다. 몬스터의 보행만으로는 무너지지 않는다.',hint:'불이 붙으면 3턴간 화염 접촉 지대가 되고, 다 타면 물로 무너진다.'};
    if(t===TT.CRATE&&!world.burning[k(x,y)])return{name:'목상자',desc:'불에 타고, 강하게 밀린 개체와 충돌하면 부서진다.',hint:'바로 앞에서 바라보고 상호작용(F)하면 1칸 민다. 통로를 봉쇄하는 밀기는 불가.'};

    if(t===TT.ICE){const left=state.tempTerrain74?.find(q=>q.x===x&&q.y===y&&q.kind==='frozen-water105')?.ttl;return{name:'얼어붙은 물',desc:`냉기에 얼어 잠시 건널 수 있다. ${left??'?'}턴 뒤 물로 돌아간다.`,hint:'냉기를 다시 가하면 5턴으로 연장된다. 불·대지에 닿으면 즉시 깨진다. 강제이동은 1칸 더 미끄러진다. 해빙 시 물의 위험 판정이 적용된다.'};}
    const burn=state.terrainReactions105?.burning?.[k(x,y)];if(burn&&t===TT.PAPER_BRIDGE)return{name:'종이다리 · 연소 중',desc:`${Math.max(0,3-burn.age)}턴 뒤 타서 무너진다.`,hint:'진입하거나 머무는 개체에게 불이 붙는다. 물로 소화해도 젖은 다리의 붕괴 예고는 남는다.'};if(burn)return{name:terrainName(t)+' · 연소 중',desc:`목재가 타고 있다. ${Math.max(0,3-burn.age)}턴 뒤 검은 숯으로 무너진다.`,hint:'상하좌우의 가연물로 매 턴 번진다. 물속성으로 끌 수 있다.'};if(terrainUnlit105(x,y)&&lightAt(x,y))return{name:terrainName(t)+' · 꺼짐',desc:'물기운에 불씨가 꺼졌다.',hint:'불속성으로 다시 지필 수 있다. 꺼진 조리기구는 사용할 수 없다.'};
    if(state.branchTerrain105?.mountainVersion105){const s=state.branchTerrain105.surfaces[k(x,y)],prop=state.branchTerrain105.props[k(x,y)];if(s==='cliff')return{name:'등고선 절벽벽',desc:'산비탈의 단차가 드러난 암벽. 실제 벽으로 이동과 시야를 막는다.',hint:'열린 산길로 돌아가야 한다. 검은 낭떠러지와는 다르다.'};if(prop==='deadTree')return mountainDeadTreeInfo();}
    const mineInfo=mineInspect(t,x,y);if(mineInfo)return mineInfo;
    const branchInfo=branchTerrainInfo(t,x,y);if(branchInfo)return branchInfo;
    const bp=state.branchPortals105?.find(p=>p.x===x&&p.y===y);if(bp)return branchPortalInfo(bp);
    if(state.branchContext105&&state.branchTerrain105?.surfaces[k(x,y)]==='stairs')return{name:'산채 돌계단',desc:'절벽벽의 열린 틈을 잇는 산길. 나무와 절벽벽 사이를 따라 오른다.',hint:'실제 절벽벽과 나무가 이동·시야를 막는다.'};
    if(t===TT.ALTAR){const gains=Math.max(0,Math.floor(Number(state.player.bloodAltarGains105)||0));return{name:'혈흔 제단',desc:TERRAIN986.get(t).desc,hint:`지금까지 힘을 얻은 횟수 ${gains}회 · 다음 공격·의지 상승 확률 ${Number((50/(1+gains)).toFixed(1))}%. 실패하면 피를 바치거나 요괴가 나타난다.`};}
    const base=TERRAIN986.get(t)||{desc:'만루를 이루는 이름 없는 구조물. 오래된 생활 흔적과 뒤늦게 덧붙은 증축의 흔적이 함께 남아 있다.'};
    const style=state?.floorStyle980?.[k(x,y)]||state?.subthemeFloors972?.[k(x,y)]||state?.wallStyle980?.[k(x,y)]||state?.subthemeWalls970?.[k(x,y)];
    const room=(state?.featureRooms||[]).find(r=>x>=r.x&&y>=r.y&&x<r.x+r.w&&y<r.y+r.h);
    const tag=routeTagAt(x,y),extra=STYLE_LORE[style]||'';
    let desc=base.desc;
    if(extra&&!desc.includes(extra))desc+=` ${extra}`;
    else if(room?.name&&!/바닥|벽|문/.test(terrainName(t)))desc+=` ${room.name}에 놓인 구조물이다.`;
    const name=t===TT.PORTAL?(state?.portalLinks981?.[k(x,y)]?'접힌 문':state?.artifactPortal46?.x===x&&state?.artifactPortal46?.y===y?'전설무기 던전 입구':state?.artifactExit46?.x===x&&state?.artifactExit46?.y===y?'전설무기 던전 귀환문':terrainName(t)):terrainName(t);
    const legendHint=legendTerrainHint(t,x,y);
    const materialHint=elementMaterial105(t,'wood',x,y)?'불속성이 닿으면 3턴간 타며 인접 가연물로 번진다. 물속성으로 끌 수 있다.':elementMaterial105(t,'stone')?'땅속성이 닿으면 돌가루와 파편을 튀기며 부서진다.':lightAt(x,y)?'물속성으로 끄고 불속성으로 다시 지필 수 있다.':'';return{name,desc,hint:[legendHint||base.hint||'',materialHint].filter(Boolean).join(' ')};
  }


  function monsterInfo986(mon){
    if(mon?.treeMimic105&&mon.mimicDormant105!==false)return mountainDeadTreeInfo();
    const desc=monsterConcept(mon);
    const hints=[],stats=[`HP ${displayHealth(mon.hp)}/${displayHealth(mon.maxHp)}`,`ATK ${displayNumber53(mon.atk)}`,`DEF ${displayNumber53(mon.def)}`,`EVA ${displayNumber53(mon.eva||0)}`],meta=[];
    if(mon.combustion105){hints.push(`연소 기본 피해 ${COMBUSTION_RULES105.damage}, 불바닥 위에서는 기본 피해 3. 식물은 화염에 더 약하다. 물·냉기로 꺼지며 주변을 자동 점화하지 않는다.`)}
    if(mon.sleeping105){hints.push(mon.doorSleep105?'봉인된 쥐굴의 잠. 이 방의 경고문을 열기 전에는 접근·소음으로 깨어나지 않는다. 문이 열리면 같은 방의 쥐들이 함께 깨어난다.':'잠든 동안 행동하지 않는다. 은신하지 않은 채 1칸 이내로 접근하거나, 전해지는 소음을 듣거나, 피해를 받으면 깨어난다.');}
    if(mon.ranged)stats.push(`사거리 ${displayNumber53(mon.range||6)}`);else if((mon.reach||1)>1)stats.push(`공격거리 ${displayNumber53(mon.reach)}`);
    if(mon.boss)meta.push('보스');else if(mon.legendElite47||mon.miniBoss)meta.push('정예');else meta.push(isPlayerAlly57(mon)?'아군 개체':'적대 개체');
    if(mon.kind)meta.push(({human:'인간',beast:'야수',spirit:'영체',undead:'망자',plant:'식물',construct:'구조체',slime:'점액'})[mon.kind]||mon.kind);
    if(mon.flying)meta.push('비행');if(mon.aquatic)meta.push('수생');if(monsterMovementLocked57(mon))meta.push('고정');
    if(aquaticStranded(mon)){meta.push('뭍에 남음');hints.push('물이 빠진 자리에서 몸을 뒤틀며 펄떡인다. 다시 물이 차면 헤엄치는 모습을 되찾는다.')}
    if(mon.legendElite47)meta.push('문지기 강화');
    if(mon.palaceLotus105)hints.push(palaceWet(mon)?'개화 · 완전 견인 사용 가능':'닫힌 꽃봉오리 · 견인 불가');if(mon.equipmentActor105)hints.push('무기: '+(mon.weapon?.name||'없음'));if(mon.martialActor105){stats.push(`기 ${Math.floor(mon.focus)}/${mon.maxFocus}`);hints.push(dojoInspect(mon,{battle:!!state.debugBattle57}));}return{name:mon.name,meta,stats,statuses:combatStatusRows(mon),desc,skills:monsterSkills(mon),martialCards:mon.martialActor105?Object.keys(MARTIAL_INFO).filter(id=>mon.martial[id]>0).map(id=>({id,actor:mon})):null,blink:mon.martialActor105&&mon.dojoRank105>=3,hint:[...new Set(hints)].join(' ')};
  }








  window.__MANRU_INSPECT984__=function(q){
    if(!q||!state)return;const x=q.x,y=q.y;if(x<0||y<0||x>=COLS||y>=ROWS)return;
    const target={x,y};
    if(!state.seen.has(k(x,y))){directOpenInspect('미탐사 구역',simpleHtml986({desc:'등불과 시야가 닿지 않은 공간. 직접 확인하기 전에는 안쪽의 구조나 존재를 알 수 없다.',hint:''}),target);return}
    const tile=state.map[y][x];if(TERRAIN986.get(tile)?.inspectPriority57==='terrain'){const info=terrainInfo986(tile,x,y);directOpenInspect(info.name,simpleHtml986(info),target);return}
    const palaceWarning=palaceWarningInfo(x,y);if(palaceWarning){directOpenInspect(palaceWarning.name,simpleHtml986(palaceWarning),target);return}
    const martialInfo=state.visible.has(k(x,y))?martialWorldInfo(x,y):null;if(martialInfo){directOpenInspect(martialInfo.name,simpleHtml986(martialInfo),target);return}
    const mon=findMonsterAt(x,y),it=(state.items||[]).find(v=>v.x===x&&v.y===y),t=state.map[y][x];
    if(mon?.treeMimic105&&mon.mimicDormant105!==false){const info=mountainDeadTreeInfo();directOpenInspect(info.name,simpleHtml986(info),target);return}
    if(isEntityObservableToPlayer57(mon)){const info=monsterInfo986(mon);directOpenInspect(info.name,simpleHtml986(info),target);return}
    const stock=ShopMapBuilder.groundAt(x,y);if(stock){const info=itemInfo(stock.item);info.meta=[...(info.meta||[]),`진열품 · 엽전 엿 ${stock.price}개`];info.hint=[info.hint,'이 칸으로 이동하면 구매창이 열린다. 창을 닫았다면 이 칸에서 상호작용을 누른다. 구매 확정 전에는 차감되지 않는다.'].filter(Boolean).join(' ');directOpenInspect(info.name,simpleHtml986(info),target,stock.item);return}
    const merchant=neutralInteractableAt58(x,y);if(merchant){directOpenInspect(merchant.name,simpleHtml986({desc:'엽전 엿으로 물품을 교환하는 상인.',hint:'인접해서 상호작용하면 행낭의 물건을 팔 수 있다. 구매는 바닥의 진열품 칸으로 이동한다.'}),target);return}
    if(it){openItemInspect986(it,target);return}
    const decor=decorAt986(x,y);if(decor){const info=decorInfo986(decor);directOpenInspect(info.name,simpleHtml986(info),target);return}
    const decal=decalInfo986(x,y);if(decal){directOpenInspect(decal.name,simpleHtml986(decal),target);return}
    const info=terrainInfo986(t,x,y);directOpenInspect(info.name,simpleHtml986(info),target);
  };


  /* Final inspect owner. It bypasses the historical append-wrappers that duplicated monster/item prose. */
  window.__MANRU_TERRAIN_CODEX986__={
    openItem:openItemInspect986
  };

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
  RUN_END_EFFECTS53.push(kind=>{if(kind==='death'){const seal=document.querySelector('.deathSeal94');if(seal)seal.textContent='亡'}});


  RunLifecycle.refreshContinue();
  const panelHead=document.querySelector('#releasePanel70 .rc70Head b');if(panelHead)panelHead.textContent='만루 · 설정';
  for(const id of ['rcLoadAuto70','rcExport70','rcImport70']){const b=document.getElementById(id);if(b){b.disabled=true;b.onclick=e=>{e?.preventDefault?.();toast('퍼마데스 런에서는 과거 세이브를 불러올 수 없다.')}}}
  document.querySelectorAll('[data-rcsave],[data-rcload]').forEach(b=>{b.disabled=true;b.onclick=e=>{e?.preventDefault?.();toast('슬롯 저장/불러오기는 퍼마데스에서 사용하지 않는다.')}});



















  function curseClocks991(actor=state?.player){if(!state||!actor)return{};const owner=actor===state.player?state:actor;owner.curseClocks991=owner.curseClocks991&&typeof owner.curseClocks991==='object'?owner.curseClocks991:{};return owner.curseClocks991}













  

  // Item choice modal shared by identify, holy purification and holy-upgrade.
  const modal=document.createElement('div');modal.id='choice991';modal.innerHTML='<div class="choice991Card"><span class="uiCorners63" aria-hidden="true"></span><div class="choice991Head"><div><b id="choice991Title"></b><small id="choice991Sub"></small></div><button class="uxClose" id="choice991Close" aria-label="닫기">×</button></div><div id="choice991List"></div></div>';document.body.appendChild(modal);
  let choiceCancel991=null;
  function closeChoice991(){setInteraction8('choice991',false);choiceCancel991=null}
  modal.querySelector('#choice991Close').onclick=()=>InputRouter.dispatch({type:'MODAL_CANCEL',source:'choice-close'});
  modal.addEventListener('pointerdown',e=>{if(e.target===modal)InputRouter.dispatch({type:'MODAL_CANCEL',source:'choice-backdrop'})});




  ActionDispatcher.register('IDENTIFY_CHOICE',identifyChoiceAction5);

  ActionDispatcher.register('PURIFY_CHOICE',purifyChoiceAction5);








  function revealMap(){let secrets=0;for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){VisibilityService.rememberKey(k(x,y));if(state.map[y][x]===TT.SECRET_DOOR)secrets++}VisibilityService.compute();return secrets}


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
  




  globalThis.__MANRU_GEN991__={applyCurses:applyCursesToAllGear,ensureHoly:ensureHolyDrop};

  // Existing generated floor may have been built before the new wrapper was installed.
  if(state){applyCursesToAllGear();ensureHolyDrop();syncCurseClocks991()}
  
  // Curse effects preserve the base item stats. Equal active curse ids across equipped slots
  // share one geometric strength: 1 stack=1x, 2=2x, 3=4x, 4=8x, 5=16x.
  registerPlayerAttackStageR('curse991',(next,mon,...rest)=>{const r=next(mon,...rest),power=curseMultiplier('thirst'),outcome=state?.playerAttackOutcome57;if(power>0&&outcome?.kind==='miss'){const loss=Math.min(state.player.focus,Math.max(1,Math.round(power)));state.player.focus=Math.max(0,state.player.focus-loss);floatText(state.player.x,state.player.y,`기 -${loss}`,'#b98b79',10);addLog(`갈증의 저주가 빗나간 기운을 빨아들였다. 기력 -${loss}.`)}return r});
  registerMonsterAttackStageR25('curse991',(next,mon,...rest)=>{const r=next(mon,...rest),power=curseMultiplier('thirst',mon);if(power>0&&r?.evaded&&Number.isFinite(mon.focus)){const loss=Math.min(mon.focus,Math.max(1,Math.round(power)));mon.focus-=loss;floatText(mon.x,mon.y,`기 -${loss}`,'#b98b79',10)}return r});
  registerMoveCostStage55('curse991',c=>{const power=curseMultiplier('binding');if(power>0)c*=1+.12*power;return c});
  registerAttackCostStage55('curse991',c=>{const power=curseMultiplier('clumsy');if(power>0)c*=1+.08*power;return c});

  registerPlayerStatStage55('curse991',s=>applyCurseStats(s));



  globalThis.__MANRU_TURN_PIPELINE__.register('curse-story991',{pre:ctx=>{ctx.curse991={turn:state?.turn||0}},post:ctx=>{if(!state||state.dead||state.victory)return;if(tickActorCurses(state.player))updateAll();globalThis.storyTick992?.()}});

  // Equip reveals the item and activates its curse. A manifested curse binds that slot until purified.
  // r30: v9.9.1 identity/holy/curse equipment dispatch is integrated in canonical useInventoryItem.

  // Prevent explicit unequip/drop of a manifested cursed slot from the modern inventory renderer.
  document.addEventListener('click',e=>{const b=e.target?.closest?.('[data-uxunequip],[data-uxdrop-equip]');if(!b||!state)return;const slot=b.dataset.uxunequip||b.dataset.uxdropEquip,it=state.player?.[slot];if(it?.curseActive991){e.preventDefault();e.stopImmediatePropagation();toast(`${it.name}의 저주가 장비를 붙잡고 있다. 성부로 정화해야 한다.`)}},true);



  registerInventoryRenderR34('r991-gear-identity','post',()=>{if(!state||!inventoryOpen)return;const box=document.getElementById('inventory');if(!box)return;
    box.querySelectorAll('[data-invslot]').forEach(el=>{const it=state.player.inventory[+el.dataset.invslot];const knownCurse=!!(it?.identified===true&&it?.curse991);el.classList.toggle('knownCurse991',knownCurse);if(knownCurse){el.style.setProperty('border-color','#d44738','important');el.style.setProperty('background','linear-gradient(180deg,#35100d,#140706)','important');el.style.setProperty('box-shadow','inset 0 0 0 1px #6f1d18,0 0 13px rgba(224,55,42,.44)','important')}else{el.style.removeProperty('border-color');el.style.removeProperty('background');el.style.removeProperty('box-shadow')}const nm=el.querySelector('.nm,.invSlotName');if(nm&&isGearItem(it))nm.textContent=it.name});
    box.querySelectorAll('[data-uxeq],[data-eqslot]').forEach(el=>{const slot=el.dataset.uxeq||el.dataset.eqslot,it=state.player[slot],known=!!(it?.identified===true&&it?.curse991);el.classList.toggle('knownCurse991',known);if(known){el.style.setProperty('border-color','#d44738','important');el.style.setProperty('background','linear-gradient(180deg,#35100d,#140706)','important');el.style.setProperty('box-shadow','inset 0 0 0 1px #6f1d18,0 0 13px rgba(224,55,42,.44)','important')}else{el.style.removeProperty('border-color');el.style.removeProperty('background');el.style.removeProperty('box-shadow')}});
    const selected=inventorySelection>=0?state.player.inventory[inventorySelection]:null,d=box.querySelector('.uxDetail,.invDetail');
    if(isUnknownGear(selected)&&d){const h=d.querySelector('h3');if(h)h.textContent=selected.name;const sub=d.querySelector('.uxDetailHead small,.typeLine');if(sub)sub.textContent=`${publicGearType(selected.type)} · 종류 확인 · 세부 미감정`;const stats=d.querySelector('.uxStats,.invStats');if(stats)stats.innerHTML=publicGearStats(selected).map(x=>`<span class="invStatChip">${x}</span>`).join('');const desc=d.querySelector('.uxDesc,.desc');if(desc)desc.textContent='종류와 기본 외형은 확인됐다. 강화 수치, 저주 여부와 숨은 마법 옵션은 감정 전까지 드러나지 않는다.'}
    else if(selected?.identified===true&&selected?.curse991&&d){const stats=d.querySelector('.uxStats,.invStats');if(stats&&!stats.querySelector('.curse991Chip')){const c=curseDefOf(selected),stacks=selected.curseActive991?curseStackCount(selected.curse991):0,power=stacks?curseMultiplier(selected.curse991):1,sp=document.createElement('span');sp.className='uxStat curse991Chip';sp.textContent=`저주 · ${c?.name||'불명'}${stacks>1?` · 중첩 ${stacks} / ×${power}`:''}`;stats.appendChild(sp)}}});

  // ----- Skill UX: tap = usable actives, hold = upgrade panel -----
  const skillQuick=document.createElement('div');skillQuick.id='skillQuick991';document.body.appendChild(skillQuick);
  let quickOpen991=false;




  
  


  // r57: canonical activateMartial closes the quick-skill panel through __MANRU_ITEM_IDENTITY991__.

  globalThis.__MANRU_SKILL991_INPUT__=Object.freeze({toggle:toggleSkillQuick,isOpen:()=>quickOpen991,activateIndex(i){if(!quickOpen991)return false;const row=availableSkills991()[i];if(!row)return false;closeSkillQuickPanel();return ActionDispatcher.dispatch({type:'MARTIAL',args:[row[0]]}).value}});

  bindSkillButton();queueMicrotask(bindSkillButton);

  // CSS: deliberately >1px borders and distinct visual identity per technique.

  // Keep debug hooks explicit for regression tests.
  


/* ===== MANRU v9.9.2 STORY SYSTEM — integrated into core scope ===== */
const STORY_VERSION992='v9.9.3-story-system';
















































  storyEnsureUI();
  Object.assign(globalThis,{storyCollectNote992:storyCollectNote,storyDrawWorld992:storyDrawWorld,storyFriendBossPattern992:storyFriendBossPattern,storyBreakFriendMask992:storyBreakFriendMask,storyShowEndingChoice992:storyShowEndingChoice,storyAfterFloorGenerated992:storyAfterFloorGenerated,storyInitNewRun992:storyInitNewRun,storyTick992:storyTick});
  window.__MANRU_STORY992__={resume:()=>{const st=storyEnsureState();if(st?.dispatchPending60)return storyOpenNote('dispatch');return false},close:storyCloseModal,closeScene:storyCloseScene,selectEnding:storySelectEnding,continueScene:storyContinueScene,project:projectStoryUI,open:storyOpenNote,ending:storyResolveEnding};


  /* ===== v10.0.1: class selection / player sprite / desktop right-click inspect ===== */
  const CLASS1001_META={
    wanderer:{seal:'感',role:'특임 감찰관 · 균형형',tag:'감찰'},
    escort:{seal:'護',role:'금위 표사 · 생존형',tag:'호위'},
    swordsman:{seal:'劍',role:'척후 검객 · 기동형',tag:'척후'},
    archer:{seal:'弓',role:'척후 궁사 · 정밀 사격',tag:'궁사'},
    infiltrator:{seal:'霧',role:'잠행객 · 연막 잠입',tag:'잠행'},
    strongman:{seal:'力',role:'천하장사 · 초심자 생존형',tag:'장사'},
    summoner:{seal:'巫',role:'소환형',tag:'소환'}
  };

  // Final requested starting loadout. Inspector deliberately has no starting weapon.
  const wanderer1001=CLASSES.find(c=>c.id==='wanderer');
  if(wanderer1001){
    wanderer1001.startWeapon='';
    wanderer1001.startItems=[['감정부적',2],['주먹밥',1]];
    wanderer1001.startLabel='경량복 · 감정부적×2 · 주먹밥';
    wanderer1001.desc='정부 특임 감찰관. 시작 무기는 없지만 감정부적이 하나 더 있어 미감정 장비 대응이 빠르다.';
  }



  
  
  const EMPTY_ACTOR1001='data:image/gif;base64,R0lGODlhAQABAAAAACw=';





  let selectedClass1001=CLASSES[0].id;
  const classDetail1001=document.getElementById('classDetail1001'),classStart1001=document.getElementById('classStartBtn1001');
  const CLASS1001_STATS=[['hp','생명'],['focus','기'],['atk','공격'],['def','방어'],['eva','회피'],['will','의지'],['vision','시야']];
  const CLASS1001_STAT_PATHS=Object.freeze({
    hp:'M12 20 3.5 11.5C-1 6 6 1 12 7c6-6 13-1 8.5 4.5Z',
    focus:'M12 2c1 5 6 7 6 12a6 6 0 0 1-12 0c0-3 2-5 4-7v6c3-2 3-6 2-11Z',
    atk:'M9 12 18 3h3v3l-9 9ZM6 10l8 8M10 14l-5 5M3.5 17.5l3 3M12 12l6-6',
    def:'M12 2 21 6v6c0 5-5 9-9 10-4-1-9-5-9-10V6ZM12 6v11M7 10h10',
    eva:'M8 3c2 0 3 2 3 4v7l7 3c2 1 2 4 0 4H6l-1-6 1-8c0-2 0-4 2-4ZM2 8h2M1 12h3M2 16h2',
    will:'M7 3h10v18H7ZM10 7h4M12 5v6M10 14l2-2 2 2-2 4Z',
    vision:'M2 12c5-9 15-9 20 0-5 9-15 9-20 0ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'
  });

  const classMotion1001=matchMedia('(prefers-reduced-motion:reduce)');
  let classLight1001=null;







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


  /* v10.0.2: one canonical screen state, instead of leaving the class picker alive behind display:none. */
  const SCREEN1002={mode:'title',booted:false};RuntimeState.ui.screen=SCREEN1002;


      RUN_END_EFFECTS53.push(()=>setScreen('ending'));

  function bootScreen1002(){
    if(SCREEN1002.booted)return;SCREEN1002.booted=true;
    if(state&&!state.dead&&!state.victory){setScreen('game');return}
    // r57: legacy active-run restore is intentionally absent; only save1004 may resume a run after full initialization.
    setScreen(state&&(state.dead||state.victory)?'ending':'title');
  }
  bootScreen1002();

  // Basic controls are documented at the point they matter, without blocking gameplay.
  function currentScreen(){return SCREEN1002.mode}



  /* ===== MANRU v10.0.3: tall player / real quit / hardened permadeath / canonical food+talisman art ===== */
  const V1003='v10.0.3';
    const ACTIVE1003='manru984_active_run';
    const DEATH1003='manru984_last_death';


    sanitizeTransient1003();
    if(state){resetVisualState();try{updateAll()}catch(error){ignoreError('ui refresh after restore',error)}}

    /* ---------- player sprite: 36x52 exact-pixel world render, feet anchored to tile bottom ---------- */
    const PW1003=36,PH1003=52,PLAYER1003_CACHE=new Map();

    
    

    /* ---------- legacy v10.0.3 item-art owner retired ---------- */
    // Duplicate food/start-card sprite generation remains removed; start cards consume canonical real item art.



    /* Starting-item cards are not mutated here. The class renderer consumes canonical real item art directly. */


    

    ensureQuit();

    /* ---------- permadeath hardening: reject a resurrected snapshot while its death tombstone remains ---------- */
    
        globalThis.__MANRU_TURN_PIPELINE__.register('permadeath-clean1003',{post:()=>{/* Persistence cleanup belongs to SaveService commit. */}});

    // Any stale renderer timestamp loaded during the earlier v10.0.2 boot is neutralized now.
    sanitizeTransient1003();










    const LEGACY_DEATH1004='manru984_last_death';





    


    globalThis.__MANRU_SAVE_SERVICE__=SaveService;


    function deathMeta1004(){try{return JSON.parse(localStorage.getItem(DEATH1004)||localStorage.getItem(LEGACY_DEATH1004)||'null')}catch(_){return null}}

    
    

    
    globalThis.__MANRU_SAVE1004__=Object.freeze({raw:currentRaw,meta:()=>{const c=SaveService.recover().candidate;return c?{floor:c.meta.floor,turn:c.meta.turn,runId:c.meta.runId984,written:c.written,seq:c.seq,source:c.source}:null},write:writeRun,valid:()=>!!SaveService.recover().candidate});

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


    function hash1004(s=''){let h=2166136261;for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}


    function gearKey1004(p){return ['weapon','armor','cloak','relic','trinket'].map(k=>{const i=p?.[k];return `${k}:${i?.name||''}:${i?.tier||0}:${i?.rarity||''}:${k==='weapon'?heldWeaponKey1001(i):''}`}).join('|')}
    














    function classGear(cls){return{weapon:cls?.startWeapon?{...(WEAPONS.find(w=>w.name===cls.startWeapon)||{}),name:cls.startWeapon}:null,armor:{...(ARMORS?.[0]||{}),name:ARMORS?.[0]?.name||'경량복',tier:1,rarity:'common'},cloak:null,relic:null,trinket:null}}

    
    

    /* ---------- class screen uses the exact same compact sprite source ---------- */
    // r40: retired the old class-grid mutation owner. The final actor service now consumes this exact v10.0.4 start-sprite source directly, so reopening the class picker cannot silently swap portraits behind the canonical renderer.





  /* v10.0.4 strict typed-key final pass: later architecture layers are not allowed to reopen a bypass. */
  const strictKeyFloors1004=new Set(strictLockFloors()||[]);
  // r18: strict typed-key retries run inside the canonical generation pipeline so failed attempts
  // do not also consume holy/story/item side effects through nested generation wrappers.
  
/* ===== MANRU v10.0.4 ROUTE/Hazard REWORK (rolled back from v10.0.5 map branch) ===== */
const V='10.0.4-route-hazard-r1';
const WARD_DROWN={name:'용왕의 숨비늘',type:'relic',rarity:'relic',def:2,will:2,focus:2,drownWard1005:true,identified:true,ability:'익사 대체 · 10턴 수중 생존',desc:'DEF +2 · WILL +2 · FOCUS +2. 익사할 상황에서 자동으로 부서져 죽음을 막고 10턴 동안 익사를 막는다. 단, 바로 붙잡을 뭍이 있으면 유물보다 뭍을 먼저 붙잡는다.'};
const WARD_VOID={name:'공허닻 파편',type:'relic',rarity:'sealed',def:2,eva:2,will:2,voidWard1005:true,identified:true,ability:'공허 추락 대체 · 10턴 공허 생존',desc:'DEF +2 · EVA +2 · WILL +2. 공허로 추락할 때 자동으로 소모되어 죽음을 막고 10턴 동안 공허에 발을 디딜 수 있게 한다.'};

function hz(){return state?state.hazard1005:null}

function hazardTile(t){return t===TT.WATER?'water':t===TT.VOID?'void':t===TT.LAVA?'lava':t===TT.MERCURY?'mercury':null}



function nearestLandFor1005(e,x,y,prefer=null){
  const a=[];for(const[dx,dy]of DIRS4){const q={x:x+dx,y:y+dy};if(safeLandFor1005(e,q.x,q.y))a.push(q)}
  if(prefer){const p=a.find(q=>q.x===prefer.x&&q.y===prefer.y);if(p)return p}
  return a[0]||null
}

function consumeWard(kind){const p=state.player,r=p.relic;if(!r)return false;const ok=kind==='drown'?r.drownWard1005:r.voidWard1005;if(!ok)return false;const nm=r.name;p.relic=null;addLog(`${nm}이 치명적인 ${kind==='drown'?'익사':'공허 추락'}를 대신 받아냈다.`);wardPulse(kind,10);return true}








/* r15: voluntary movement, forced movement and knockback call this shared hazard core directly from their canonical base functions. */
window.__MANRU_HAZARD_CORE__={
  armFragile,collapseAt:collapseFragileAt105,kind:hazardTile,adapted:entityAdapted,resolve:resolveEntityHazard1005,standing:resolveStandingHazard1005,revalidateAt:revalidateHazardAt1005,revalidateAll:resolveAllStandingHazards1005
};

/* crumble + paper bridge: warn first; paper collapses on the next consumed action, crumble after leaving; rebuild exactly 10 turns later. */
function collapseFragileAt105(x,y,kind='paper'){
 const tile=kind==='paper'?TT.PAPER_BRIDGE:TT.CRUMBLE;if(state.map[y]?.[x]!==tile)return false;
 const base=kind==='paper'?TT.WATER:(state.crumbleBase60?.[k(x,y)]??TT.VOID),result=RuntimeTerrainOwner.mutate(x,y,base,{source:kind+'-element-collapse'});if(!result.ok)return false;
 const h=hz();delete h.armed[k(x,y)];if(!branchLeafAt(x,y))h.collapsed[k(x,y)]={x,y,restoreTile:tile,baseTile:base,restoreTurn:state.turn+10,kind,mutationVersion57:result.version57};burst(x,y,'#86cbd1',15,.75);return true;
}



function collapseCrumbleLeft1005(){const h=hz(),cur=state.player,prev=state._lastPlayerPos60;if(prev&&(prev.x!==cur.x||prev.y!==cur.y)&&state.map?.[prev.y]?.[prev.x]===TT.CRUMBLE){const kk=k(prev.x,prev.y),base=state.crumbleBase60?.[kk]??TT.VOID,rr=RuntimeTerrainOwner.mutate(prev.x,prev.y,base,{source:'crumble-collapse1005'});if(rr.ok){h.collapsed[kk]={x:prev.x,y:prev.y,restoreTile:TT.CRUMBLE,baseTile:base,restoreTurn:(state.turn||0)+11,kind:'crumble',mutationVersion57:rr.version57};delete h.armed[kk];burst(prev.x,prev.y,'#8870a8',10,.55);addLog('불안정한 발판이 아래로 무너졌다. 10턴 뒤 구조가 되돌아온다.')}}state._lastPlayerPos60={x:cur.x,y:cur.y}}



globalThis.__MANRU_TURN_PIPELINE__.register('hazard1005',{pre:ctx=>{if(!state)return;resolveAllStandingHazards1005('turn-start');if(state.dead)return globalThis.__MANRU_TURN_PIPELINE__.abort;ctx.hazard1005={beforeD:remain('drown'),beforeV:remain('void')};collapseCrumbleLeft1005()},post:ctx=>{if(!state)return;const h=ctx.hazard1005||{};collapsePaperAfterAction1005();restoreFragiles();wardCountdownLog(h.beforeD??0,h.beforeV??0);wardExpiry1005(h.beforeD??0,h.beforeV??0);updateWardHud()}});

/* HUD: the remaining ward time must be impossible to miss. */
const hud=document.createElement('div');hud.id='hazardWard1005';hud.innerHTML='<span data-w="drown"></span><span data-w="void"></span>';document.body.appendChild(hud);



globalThis.__MANRU_DRAW_HOOKS_R19__?.post.push({id:'hazard1005',draw:drawHazardOverlay});




/* ---------- route-first fixed-map surgery: long real path, not random wall/door clutter ---------- */













function missionTarget(){if(state.floor===20)return state.monsters?.find(m=>m.boss)||state.stairs;if(state.floor===16)return state.switches?.find(s=>s.kind==='cipher')||state.stairs;if(state.floor===24){const q=state.keyPlan96?.keys?.find(k=>k.active!==false)||state.keyPlan96?.keys?.[0];if(q)return{x:q.x,y:q.y,name:'first-key'}}return state.stairs}






// r18: hazard/route post-generation stages are invoked explicitly by the canonical pipeline.

/* Friend/false-friend sprite: same 32x36 scale as the current player, but sharper and more threatening. */


/* descriptive UI for new rules */



/* MANRU v10.0.4 rollback continuation — key clarity + item-effect audit/fix */
const ROUTE_BUILD='10.0.4-route-hazard-r2-key-itemfix';



const keyPos1006=(x,y)=>state?.keyPlan96?.keys?.find(q=>q.x===x&&q.y===y&&q.active!==false)||null;
const doorPos1006=(x,y)=>state?.keyPlan96?.doors?.find(q=>q.x===x&&q.y===y&&q.open!==true)||null;


const TERRAIN_R41_1006=globalThis.__MANRU_TERRAIN_R41__=globalThis.__MANRU_TERRAIN_R41__||{};TERRAIN_R41_1006.specialBefore=drawKeyTile;TERRAIN_R41_1006.specialKeyAfter=drawKeyGateOverlay;


/* matching pickup/open messages + ledger colors/names */
globalThis.__MANRU_TYPED_KEYS__?.setMetaProvider?.(keyMeta1006);
/* r45: key panel reads __MANRU_TYPED_KEYS__.meta() directly; removed the v10.0.6 naming wrapper. */

/* ---------- item audit: definitions that previously had no mechanical reader ---------- */
function defBy(name){return WEAPONS.find(x=>x.name===name)||ARMORS.find(x=>x.name===name)||CLOAKS.find(x=>x.name===name)||RELICS.find(x=>x.name===name)||TRINKETS.find(x=>x.name===name)||null}
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

/* ===== MANRU v10.0.4 ORIGINAL-MAP APPEND ARCHITECTURE / FINAL ENTITY PLACEMENT ===== */
const BUILD1020='10.0.4-exit-invariant-boss-direct-drop-r5';
const K1020=(x,y)=>`${x},${y}`;







function safeFloorTile1020(t){return !tileBlocks(t)&&!HAZ1020().has(t)&&t!==TT.STAIR&&t!==TT.PORTAL&&t!==TT.SWITCH&&t!==TT.RAFT&&t!==TT.KEY_TILE}










function snapshotEntities1020(){return{items:(state.items||[]).map(v=>v),monsters:(state.monsters||[]).map(v=>v)}}
function clearEntities1020(){state.items=[];state.monsters=[]}




































function restoreFloor20BossKeys1020(){
  if(state.floor!==20||!state.f20BossLock1020)return null;
  const p=installFloor20BossKeys();globalThis.__MANRU_TYPED_KEYS__?.restoreSurfaces?.();return p
}









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






function strictKeys1020(){
  if(!strictLockFloors().includes(state.floor))return null;
  if(state.floor===24)return lockAudit96()||null;
  let a=ensureStrictLocks96({force:true});for(let i=0;i<11&&!a?.ok;i++)a=ensureStrictLocks96({force:true});
  if(!a?.ok){const groups=(state.floor===2||state.floor===14||state.floor===19)?2:1;a=installNestedFallback(groups)}
  return a||null
}


/* Natural grass: no neon tile noise. Small old LIGHT_GRASS patches become decorative tufts; actual lawns become one GRASS material with a blurred tile-by-tile tone field. */
const GRASS_PAL1020=[['#384631','#45543a','#566646'],['#2d4a34','#3a5b3e','#4f6f4c'],['#3b4736','#4a5740','#5d6a4d'],['#33463a','#405749','#53695a'],['#38472f','#47593a','#5b7049']];


function normalizeGrass1020(){
  state.grassTufts1020=new Set();state.grassTone1020={};
  const light=[];for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++)if(state.map[y][x]===TT.LIGHT_GRASS)light.push({x,y});
  const lightSet=new Set(light.map(p=>K1020(p.x,p.y))),seenLight=new Set();
  for(const p of light){const kk=K1020(p.x,p.y);if(seenLight.has(kk))continue;const q=[p],comp=[];seenLight.add(kk);for(let i=0;i<q.length;i++){const a=q[i];comp.push(a);for(const[dx,dy]of DIRS4){const nk=K1020(a.x+dx,a.y+dy);if(lightSet.has(nk)&&!seenLight.has(nk)){seenLight.add(nk);q.push({x:a.x+dx,y:a.y+dy})}}}
    if(comp.length<=10){for(const a of comp){let base=TT.FLOOR,best=0;const c=new Map();for(const[dx,dy]of DIRS8){const tt=state.map[a.y+dy]?.[a.x+dx];if(tt!=null&&tt!==TT.LIGHT_GRASS&&tt!==TT.GRASS&&!tileBlocks(tt)&&!HAZ1020().has(tt)&&![TT.KEY_TILE,TT.STAIR,TT.PORTAL,TT.SWITCH,TT.RAFT,TT.LOCKED_GATE].filter(v=>v!=null).includes(tt))c.set(tt,(c.get(tt)||0)+1)}for(const[tt,n]of c)if(n>best){base=tt;best=n}setTerrainTile58(state.map,a.x,a.y,base);state.grassTufts1020.add(K1020(a.x,a.y))}}
    else for(const a of comp)setTerrainTile58(state.map,a.x,a.y,TT.GRASS);
  }
  // Each connected lawn gets ONE smooth directional colour field. No per-tile random noise.
  const grassSet=new Set();for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++)if(state.map[y][x]===TT.GRASS)grassSet.add(K1020(x,y));
  const seen=new Set(),fields={};let ci=0;
  for(const kk0 of grassSet){if(seen.has(kk0))continue;const [sx,sy]=kk0.split(',').map(Number),q=[{x:sx,y:sy}],comp=[];seen.add(kk0);for(let i=0;i<q.length;i++){const a=q[i];comp.push(a);for(const[dx,dy]of DIRS4){const nk=K1020(a.x+dx,a.y+dy);if(grassSet.has(nk)&&!seen.has(nk)){seen.add(nk);q.push({x:a.x+dx,y:a.y+dy})}}}
    const dirs=[[1,0],[0,1],[.7071,.7071],[.7071,-.7071]],pick=((state.floor||1)*17+sx*7+sy*13+ci*5)&3,[vx,vy]=dirs[pick],ux=-vy,uy=vx;let mn=1e9,mx=-1e9;for(const a of comp){const pr=a.x*vx+a.y*vy;mn=Math.min(mn,pr);mx=Math.max(mx,pr)}const span=Math.max(5,mx-mn),phase=((sx*11+sy*5+(state.floor||1)*19)%31)/31*Math.PI*2;
    for(const a of comp){const pr=a.x*vx+a.y*vy,ort=a.x*ux+a.y*uy,t=(pr-mn)/span;fields[K1020(a.x,a.y)]=clamp1020(.18+.64*t+.035*Math.sin(ort/13+phase)+.018*Math.sin(pr/23+phase*.5),.12,.88)}ci++;
  }
  // two local smoothing passes keep adjacent tiles gradual while retaining the large directional change.
  let vals=fields;for(let pass=0;pass<2;pass++){const nv={...vals};for(const kk of Object.keys(vals)){const [x,y]=kk.split(',').map(Number);let s=vals[kk]*4,n=4;for(const[dx,dy]of DIRS4){const v=vals[K1020(x+dx,y+dy)];if(v!=null){s+=v;n++}}nv[kk]=s/n}vals=nv}
  state.grassTone1020=vals;
}

/* 5 theme carpet/floor variants + wider water/land and floor/floor blending. Pure rendering; no collision change. */
const CARPET1020=[['#63271d','#d19a58','#3b130e'],['#394d34','#9b8c54','#1e2d22'],['#59264d','#d08ead','#2d1328'],['#3c3734','#9b6849','#201c1a'],['#322b21','#d0ae52','#15120c']];
/* r5: floor edge blending is terrain-only; never paint gradients across doors or decoration cells. */
const GRAD_TERRAIN1025=new Set([TT.FLOOR,TT.GRASS,TT.CARPET,TT.STONE_PATH,TT.WOOD_FLOOR,TT.MOON_STONE,TT.DARK_WOOD,TT.GILDED_FLOOR,TT.GOLD].filter(v=>v!=null));


function floorOverlay1020(px,py,x,y,colors,vis){if(!state||!inside1020(x,y))return;const t=terrainBaseTile58(x,y),z=regionOfFloor();X.save();
  if(z===4&&t===TT.FLOOR&&!state.artifactDungeon46){const h=hash1022(`${x>>1}:${y>>1}:slate51`);X.fillStyle=['#343a40','#383e43','#30383e','#3b4145'][h%4];X.fillRect(px,py,32,32);X.fillStyle='#252c31';if(x%2===0)X.fillRect(px,py,1,32);if(y%2===0)X.fillRect(px,py,32,1);X.fillStyle='#515956';if(y%2===0)X.fillRect(px+2,py+2,28,1);if(x%2===0)X.fillRect(px+2,py+3,1,26);X.fillStyle='rgba(174,166,134,.16)';for(let i=0;i<3;i++)X.fillRect(px+4+(h>>i*3)%23,py+5+(h>>i*4)%22,2+(i%2),1);if(h%9===0){X.strokeStyle='#272f34';X.lineWidth=1;X.beginPath();X.moveTo(px+20,py+3);X.lineTo(px+17,py+12);X.lineTo(px+21,py+18);X.stroke()}}
  // Theme 3–5 authored surface materials; render-only, deterministic, save-compatible.
  if(z>=2&&!state.artifactDungeon46&&[TT.FLOOR,TT.WOOD_FLOOR,TT.DARK_WOOD,TT.STONE_PATH,TT.MOON_STONE].includes(t)){
    const h=hash1022(`${state.floor}:${x}:${y}:material`),moon=t===TT.MOON_STONE||/moon|mirror|gallery/.test(state.floorStyle980?.[K1020(x,y)]||'');
    if(z===2&&!moon){
      X.fillStyle=['#422d3c','#48303f','#3d2938','#4b3342'][h%4];X.fillRect(px,py,32,32);
      for(let row=0;row<4;row++){const yy=py+row*8;X.fillStyle='#241b25';X.fillRect(px,yy+7,32,1);X.fillStyle='rgba(206,150,159,.16)';X.fillRect(px+1,yy+1,30,1);const seam=((x+row+y)%3)*10+3;X.fillStyle='#2f202d';X.fillRect(px+seam,yy+2,1,5);X.fillStyle='rgba(170,104,128,.16)';X.fillRect(px+3+(h>>row*3)%9,yy+4,12,1)}
      if((x+y)%4===0){X.strokeStyle='#97756e';X.globalAlpha=.38;X.beginPath();X.moveTo(px+8,py+16);X.quadraticCurveTo(px+16,py+5,px+24,py+16);X.quadraticCurveTo(px+16,py+27,px+8,py+16);X.stroke();X.globalAlpha=1;}
    }else if(z===3){
      const wood=t===TT.WOOD_FLOOR||t===TT.DARK_WOOD||/storage/.test(state.floorStyle980?.[K1020(x,y)]||'');
      X.fillStyle=wood?['#46382d','#503d2e','#40352c'][h%3]:['#424b4c','#485151','#3a4447'][h%3];X.fillRect(px,py,32,32);
      X.fillStyle=wood?'#756047':'#687271';X.fillRect(px+1,py+1,30,1);X.fillRect(px+1,py+2,1,28);X.fillStyle='#232c2d';X.fillRect(px,py+30,32,2);X.fillRect(px+30,py,2,32);
      if(wood){for(let yy=8;yy<32;yy+=8){X.fillStyle='#2c2521';X.fillRect(px,py+yy,32,1);X.fillStyle='rgba(167,131,83,.2)';X.fillRect(px+4,py+yy+3,19,1)}}
      if((x%3===0&&wood)||(!wood&&y%4===0)){X.fillStyle='#242e31';X.fillRect(px,py+12,32,5);X.fillStyle='#737672';X.fillRect(px,py+12,32,1);for(const dx of [4,26]){X.fillStyle='#a89470';X.fillRect(px+dx,py+14,2,1)}}
      if(h%5===0){X.strokeStyle='rgba(22,30,31,.55)';X.beginPath();X.moveTo(px+22,py+3);X.lineTo(px+18,py+10);X.lineTo(px+22,py+17);X.lineTo(px+19,py+24);X.stroke()}
    }else{
      const garden=state.floor===24,stone=moon||state.floor===23;
      X.fillStyle=garden?['#3d4d43','#455347','#394b43'][h%3]:stone?['#45545e','#4c5b64','#3f4f5a'][h%3]:['#2e3949','#354052','#303d4c'][h%3];X.fillRect(px,py,32,32);
      X.fillStyle=garden?'#697561':stone?'#75858a':'#586879';X.fillRect(px+2,py+2,28,1);X.fillRect(px+2,py+3,1,26);X.fillStyle='#202a34';X.fillRect(px,py+30,32,2);X.fillRect(px+30,py,2,32);
      X.strokeStyle=garden?'rgba(185,176,127,.24)':'rgba(188,161,93,.38)';X.lineWidth=1;
      if((x+y)%3===0){X.beginPath();X.moveTo(px+7,py+13);X.lineTo(px+7,py+7);X.lineTo(px+13,py+7);X.moveTo(px+19,py+25);X.lineTo(px+25,py+25);X.lineTo(px+25,py+19);X.stroke()}
      if(h%7===0){X.strokeStyle='rgba(150,173,182,.2)';X.beginPath();X.moveTo(px+4,py+23);X.lineTo(px+13,py+19);X.lineTo(px+19,py+20);X.lineTo(px+28,py+13);X.stroke()}
    }
    // Contact shading follows actual walls, without changing vision or terrain.
    X.fillStyle='rgba(8,10,16,.24)';if(state.map[y-1]?.[x]===TT.WALL)X.fillRect(px,py,32,4);if(state.map[y]?.[x-1]===TT.WALL)X.fillRect(px,py,3,32);
  }
  if(t===TT.GRASS){const q=state.grassTone1020?.[K1020(x,y)]??.5,p=GRASS_PAL1020[z],c=q<.5?mix1020(p[0],p[1],q*2):mix1020(p[1],p[2],(q-.5)*2);X.globalAlpha=.58;X.fillStyle=c;X.fillRect(px,py,32,32);X.globalAlpha=1;if(state.grassTufts1020?.has(K1020(x,y))){X.strokeStyle='#68805a';X.lineWidth=1.6;for(const ox of [12,16,20]){X.beginPath();X.moveTo(px+ox,py+25);X.lineTo(px+ox+(ox===16?0:ox<16?-3:3),py+15);X.stroke()}}}
  if(t===TT.CARPET){const [b,l,d]=CARPET1020[z];X.globalAlpha=.72;X.fillStyle=b;X.fillRect(px+1,py+1,30,30);X.strokeStyle=l;X.lineWidth=1;X.strokeRect(px+4.5,py+4.5,23,23);if(z===2||z===4){X.beginPath();X.moveTo(px+16,py+7);X.lineTo(px+25,py+16);X.lineTo(px+16,py+25);X.lineTo(px+7,py+16);X.closePath();X.stroke()}else{for(let i=7;i<27;i+=6){X.beginPath();X.moveTo(px+5,py+i);X.lineTo(px+27,py+i);X.stroke()}}X.fillStyle=d;X.fillRect(px+6,py+6,2,2);X.fillRect(px+24,py+24,2,2)}
  if(t===TT.GILDED_FLOOR&&(state.floor===22||state.floor===23||state.floor===24)){X.fillStyle='rgba(210,174,70,.13)';X.fillRect(px,py,32,32);X.strokeStyle='rgba(239,205,102,.34)';X.strokeRect(px+4.5,py+4.5,23,23);X.beginPath();X.moveTo(px+16,py+5);X.lineTo(px+27,py+16);X.lineTo(px+16,py+27);X.lineTo(px+5,py+16);X.closePath();X.stroke()}
  floorSurfaceBlend1025(px,py,x,y);
  const ad=state.archDecor1020?.[K1020(x,y)];if(ad){X.globalAlpha=.8;if(ad==='goldSeal'){X.strokeStyle='rgba(225,190,83,.58)';X.lineWidth=1;X.strokeRect(px+10.5,py+10.5,11,11);X.beginPath();X.moveTo(px+16,py+8);X.lineTo(px+24,py+16);X.lineTo(px+16,py+24);X.lineTo(px+8,py+16);X.closePath();X.stroke()}X.globalAlpha=1}
  X.restore();}





/* ===== SAFE ASSET PASS: grouped theme decor / tiny bookshelf libraries / render-only room motifs ===== */
const BUILD1022='10.0.4-theme-library-safe-r1';


function basicFloor1022(t){return [TT.FLOOR,TT.GRASS,TT.STONE_PATH,TT.WOOD_FLOOR,TT.DARK_WOOD,TT.CARPET,TT.GILDED_FLOOR,TT.MOON_STONE,TT.GOLD].filter(v=>v!=null).includes(t)}

















const RESTAURANT_MONSTERS42=new Set(['취객','시종','객잔 쥐','객잔 경비병']);

























function styleRestaurantFinal42(fr){
  state.subthemeWalls970=state.subthemeWalls970||{};state.subthemeFloors972=state.subthemeFloors972||{};const style=fr.theme42===3?'r4_storage':'r1_service';
  for(let y=fr.y;y<fr.y+fr.h;y++)for(let x=fr.x;x<fr.x+fr.w;x++){const edge=x===fr.x||y===fr.y||x===fr.x+fr.w-1||y===fr.y+fr.h-1;if(edge&&state.map[y][x]===TT.WALL)state.subthemeWalls970[K1020(x,y)]=style;else if(!edge)state.subthemeFloors972[K1020(x,y)]=style}
}





function relocateRestaurantMonster42(m,fr){const reach=reachableSet1020({unlock:true,openBoss:true});let best=null,bd=1e9;for(const kk of reach){const[x,y]=kk.split(',').map(Number);if(restaurantInside(fr,x,y,0)||!candidateFinal1020(x,y,m))continue;const d=Math.abs(x-m.x)+Math.abs(y-m.y);if(d<bd){bd=d;best={x,y}}}if(best){m.x=best.x;m.y=best.y;return true}return false}
function sanitizeRestaurantMonsters42(){for(const fr of state.restaurantRooms42||[])for(const m of state.monsters||[])if(m.hp>0&&restaurantInside(fr,m.x,m.y,0)&&!m.restaurant42)relocateRestaurantMonster42(m,fr)}
function removeRestaurant42(){
  const fr=state?.restaurantRooms42?.[0];if(!fr)return false;
  restoreRestaurantSnapshot42(fr.snapshot42);
  state.items=(state.items||[]).filter(i=>!i.restaurantReward42||i.restaurantId42!==fr.restaurantId42);state.monsters=(state.monsters||[]).filter(m=>!m.restaurant42);state.featureRooms=(state.featureRooms||[]).filter(f=>!f.restaurant42);state.restaurantRooms42=[];return true;
}

function restoreRestaurantSnapshot42(snap){
  state.subthemeWalls970=state.subthemeWalls970||{};state.subthemeFloors972=state.subthemeFloors972||{};
  for(const q of snap||[]){const kk=K1020(q.x,q.y);setTerrainTile58(state.map,q.x,q.y,q.t,q);if(q.wallHad)state.subthemeWalls970[kk]=q.wall;else delete state.subthemeWalls970[kk];if(q.floorHad)state.subthemeFloors972[kk]=q.floor;else delete state.subthemeFloors972[kk]}
}

function repairRestaurantRewards42(){for(const fr of state?.restaurantRooms42||[])for(const it of state.items||[])if(it.restaurantReward42&&it.restaurantId42===fr.restaurantId42)PlacementService.placeItem(it,{x:it.x,y:it.y},{restrict:p=>restaurantInside(fr,p.x,p.y,1),reachable:finalReachSet1029()})}

function restoreLibraryVisual1022(){state.bookWalls1022=Array.isArray(state.bookWalls1022)?state.bookWalls1022:[];state.libraryZones1022=Array.isArray(state.libraryZones1022)?state.libraryZones1022:[];state.libraryScrolls1022=Array.isArray(state.libraryScrolls1022)?state.libraryScrolls1022:[]}

/* R7 refactor: library scroll visuals are part of canonical exact-item art. */
function consumeLibraryScroll1022(index,item){if(!item?.libraryScroll1022)return false;const kind=item.libraryKind1022;if(kind==='mapping'){let secret=0;for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){VisibilityService.rememberKey(K1020(x,y));if(state.map[y][x]===TT.SECRET_DOOR)secret++}VisibilityService.compute();addLog(`도서관 지도첩: 전체 지도와 숨은 문 ${secret}개를 확인했다.`);toast('층 전체 구조가 드러났다.')}else if(kind==='identify'){const pool=(state.player.inventory||[]).filter(v=>{if(v===item)return false;if(['weapon','armor','cloak','relic','trinket'].includes(v.type))return v.identified!==true;if(v.type==='potion')return !!v.potionKind&&!state.knowledge56?.potionKnown?.[v.potionKind];if(v.type==='talisman')return !!v.talismanKind&&!state.knowledge56?.talismanKnown?.[v.talismanKind];return false}).slice(0,3);state.knowledge56=state.knowledge56||{};state.knowledge56.potionKnown=state.knowledge56.potionKnown||{};state.knowledge56.talismanKnown=state.knowledge56.talismanKnown||{};for(const it of pool){if(it.type==='potion')state.knowledge56.potionKnown[it.potionKind]=true;else if(it.type==='talisman')state.knowledge56.talismanKnown[it.talismanKind]=true;else it.identified=true}addLog(`도서관 감식록: 미감정 물품 ${pool.length}개 감정.`);toast(`감정 ${pool.length}개`)}else{cleanseStatuses();state.status.ward=Math.max(state.status.ward||0,11);addLog('도서관 수호장: 해로운 상태 정화 · 수호막 10턴.');toast('수호막 10턴')}consumeItemQuantity(item);renderInventory?.();updateAll();globalThis.__MANRU_TURN_ENGINE__.advance({handled:true,committed:true,timeCost:1,reason:"consumeLibraryScroll1022"}).value;return true}
// r30: library scroll dispatch is integrated in canonical useInventoryItem.
globalThis.__MANRU_LIBRARY1022_ACTIONS__=Object.freeze({consume:consumeLibraryScroll1022});


const rarity1011={common:'#b8aa8e',uncommon:'#9ac09a',rare:'#8ebed2',epic:'#ba91ce',legendary:'#e0bb61',sealed:'#f0cb65',relic:'#d8bfe3'};







/* r36: v10.1.1 portrait mutation observer retired. R10 canonical actor service owns both start-card and world pixels. */
window.__MANRU_ACTOR_CACHE1011__={clear:()=>{HERO_SPRITE_CACHE.clear();return true}};










function postEntitySanity1020(){
  for(let pass=0;pass<4;pass++){
    const reach=finalReachSet1029(),safeReach=p=>reach.has(K1020(p.x,p.y));let changed=0;
    for(const m of state.monsters||[]){const aquatic=!!(m.aquatic||m.waterOnly57);if(!PlacementService.monsterCanStand(m,m.x,m.y)||(!aquatic&&!safeReach(m))){const ox=m.x,oy=m.y;m.x=-99;m.y=-99;const q=ReachabilityService.monsterStandCell({finalReachSet1029,clamp1020,K1020,candidateFinal1020,inside1020},ox,oy,m,!aquatic,reach);m.x=q.x;m.y=q.y;changed++}}
    if(!changed)break;
  }
  PlacementService.validateItems({reachable:finalReachSet1029()});
}








function specialEntityPass1023(){
  if(state.floor===6&&state.f6Elite1023&&state.f6Prize1023){
    if(!(state.monsters||[]).some(m=>m.elite1023)){const d=MONSTERS.find(m=>m.name==='정원 바위괴물')||MONSTERS.find(m=>m.max>=6&&m.min<=6);if(d){const m=scaledMonster(d);m.name=(d.name||'수문장')+' · 수상가옥 수문장';m.maxHp=Math.ceil((m.maxHp||m.hp)*1.45);m.hp=m.maxHp;m.atk=Math.ceil(m.atk*1.28);m.def=Math.ceil(m.def*1.2);m.x=state.f6Elite1023.x;m.y=state.f6Elite1023.y;m.elite1023=true;OccupancyService.addMonster(m)}}
    if(!(state.items||[]).some(i=>i.f6Prize1023)){const pool=WEAPONS.filter(w=>w.tier===2);const src=pool[hash1022(floorSeedKey('f6prize'))%Math.max(1,pool.length)]||WEAPONS.find(w=>w.tier===2);if(src){const it={...structuredClone(src),type:'weapon',upgrade:0,identified:true,rarity:src.rarity||'rare',x:state.f6Prize1023.x,y:state.f6Prize1023.y,f6Prize1023:true,desc:(src.desc||'')+' 수상 관리가옥의 봉인함에서 나온 정상품.'};applyWeaponUpgrade(it);PlacementService.placeItem(it)}}
  }
  if(state.floor===22&&Array.isArray(state.f22HolyCells1023)){const holy=(window.MANRU_TALISMANS||[]).find(t=>t.talismanKind==='holy');if(holy)for(const [i,p] of state.f22HolyCells1023.entries())if(!(state.items||[]).some(it=>it.f22Holy1023===i)){PlacementService.placeItem({...structuredClone(holy),count:1,x:p.x,y:p.y,f22Holy1023:i})}}
}




const TERRAIN_R41_ARCH=globalThis.__MANRU_TERRAIN_R41__=globalThis.__MANRU_TERRAIN_R41__||{};
TERRAIN_R41_ARCH.floor=(px,py,x,y,colors,vis)=>{floorOverlay1020(px,py,x,y,colors,vis);floorThemeOverlay1022(px,py,x,y,colors,vis);drawSpecialMaterial(px,py,x,y,false)};
TERRAIN_R41_ARCH.surfaceBlend=floorSurfaceBlend1025;
TERRAIN_R41_ARCH.libraryDesk52=drawLibraryDesk;
TERRAIN_R41_ARCH.wall=(px,py,x,y,colors)=>wallLibraryOverlay1022(px,py,x,y,colors);
TERRAIN_R41_ARCH.specialAfter=(tile,px,py,x,y,now,r)=>{specialBlendOverlay1020(tile,px,py,x,y,now,r)};



function finishEntryDocumentDoors67(){
 if(state.floor!==2)return;
 const g=state.specialPlaces52;
 for(const z of g?.zones||[]){const e=z.enclosure67;if(!e)continue;e.entries=[];
  for(const [x,y]of [[e.x0,e.y0],[e.x1,e.y0],[e.x0,e.y1],[e.x1,e.y1]]){const occupied=(state.player.x===x&&state.player.y===y)||(state.items||[]).some(it=>it.x===x&&it.y===y)||(state.monsters||[]).some(m=>monCovers(m,x,y));if(occupied){setTerrainTile58(state.map,x,y,TT.OPEN_DOOR);e.entries.push({x,y})}else{setTerrainTile58(state.map,x,y,TT.WALL);g.walls[K1020(x,y)]={zone:z.index,u:x-z.x,v:y-z.y}}}
  const sides=[Array.from({length:e.x1-e.x0-1},(_,i)=>({x:e.x0+1+i,y:e.y0})),Array.from({length:e.x1-e.x0-1},(_,i)=>({x:e.x0+1+i,y:e.y1})),Array.from({length:e.y1-e.y0-1},(_,i)=>({x:e.x0,y:e.y0+1+i})),Array.from({length:e.y1-e.y0-1},(_,i)=>({x:e.x1,y:e.y0+1+i}))];
  const opening=q=>basicFloor1022(state.map[q.y]?.[q.x])||[TT.DOOR,TT.OPEN_DOOR].includes(state.map[q.y]?.[q.x]);
  for(const side of sides){let group=[];const finish=()=>{if(!group.length)return;const chosen=group.find(q=>q.x===e.entry.x&&q.y===e.entry.y)||group[Math.floor(group.length/2)];
   for(const q of group){const occupied=(state.player.x===q.x&&state.player.y===q.y)||(state.items||[]).some(it=>it.x===q.x&&it.y===q.y)||(state.monsters||[]).some(m=>monCovers(m,q.x,q.y)),kk=K1020(q.x,q.y);
    if(q===chosen||occupied){setTerrainTile58(state.map,q.x,q.y,occupied?TT.OPEN_DOOR:TT.DOOR);e.entries.push(q);delete g.walls[kk]}
    else{setTerrainTile58(state.map,q.x,q.y,TT.WALL);g.walls[kk]={zone:z.index,u:q.x-z.x,v:q.y-z.y}}
   }group=[]};for(const q of side){if(opening(q))group.push(q);else finish()}finish()}
 }
}
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















function rebalanceFloor6WaterR8(targetRatio=.36){
  if(state.floor!==6)return null;const interior=(COLS-2)*(ROWS-2),nearPavilion=(x,y)=>{for(let yy=Math.max(1,y-2);yy<=Math.min(ROWS-2,y+2);yy++)for(let xx=Math.max(1,x-2);xx<=Math.min(COLS-2,x+2);xx++)if(state.map[yy]?.[xx]===TT.PAVILION||state.map[yy]?.[xx]===TT.RAFT)return true;return false};
  const count=()=>{let n=0;for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++)if(state.map[y][x]===TT.WATER)n++;return n};let before=count(),goal=Math.floor(interior*targetRatio),water=before,passes=0;
  while(water>goal&&passes++<8){const c=[];for(let y=2;y<ROWS-2;y++)for(let x=2;x<COLS-2;x++){if(state.map[y][x]!==TT.WATER||nearPavilion(x,y))continue;let n4=0,n8=0;for(const[dx,dy]of DIRS8){const t=state.map[y+dy]?.[x+dx];if(t!==TT.WATER&&!tileBlocks(t)&&!HAZ1020().has(t)){n8++;if(!dx||!dy)n4++}}if(!n4)continue;const h=hash1022(floorSeedKey(`f6-shore:${x},${y}:${passes}`));c.push({x,y,score:n4*12+n8*2+(h%1000)/1000,h})}c.sort((a,b)=>b.score-a.score);const take=Math.min(water-goal,Math.max(90,Math.floor(c.length*.55)));if(!take)break;for(let i=0;i<take;i++){const q=c[i];if(!q)break;setTerrainTile58(state.map,q.x,q.y,(q.h%7===0)?TT.GRASS:(q.h%5===0?TT.STONE_PATH:TT.LIGHT_GRASS));}water=count()}
  state.floor6WaterBalanceR8={before,after:water,goal,ratio:water/interior,passes};return state.floor6WaterBalanceR8
}




function roomProbe1026(r){
  if(!r)return null;
  const edgeRatio=(outside=false)=>{let edge=0,blocked=0;const y0=outside?r.y-1:r.y,y1=outside?r.y+r.h:r.y+r.h-1,x0=outside?r.x-1:r.x,x1=outside?r.x+r.w:r.x+r.w-1;
    for(let x=r.x;x<r.x+r.w;x++)for(const y of [y0,y1]){if(!inside1020(x,y))continue;edge++;const t=state.map[y]?.[x];if(tileBlocks(t)||t===TT.WINDOW||doorTileSet().has(t))blocked++}
    for(let y=r.y;y<r.y+r.h;y++)for(const x of [x0,x1]){if(!inside1020(x,y))continue;edge++;const t=state.map[y]?.[x];if(tileBlocks(t)||t===TT.WINDOW||doorTileSet().has(t))blocked++}
    return edge?blocked/edge:0};
  let inner=0,open=0,blocked=0,special=0,indoorMat=0;const x0=r.w>=5?r.x+1:r.x,x1=r.w>=5?r.x+r.w-1:r.x+r.w,y0=r.h>=5?r.y+1:r.y,y1=r.h>=5?r.y+r.h-1:r.y+r.h;
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const t=state.map[y]?.[x];inner++;if(basicFloor1022(t)||t===TT.FLOOR||t===TT.WOOD_FLOOR||t===TT.GILDED_FLOOR||t===TT.CARPET||t===TT.STONE_PATH||t===TT.MOON_STONE||t===TT.DARK_WOOD)open++;else if(tileBlocks(t))blocked++;else special++;if([TT.WOOD_FLOOR,TT.DARK_WOOD,TT.CARPET,TT.GILDED_FLOOR,TT.MOON_STONE].includes(t))indoorMat++}
  return{area:r.w*r.h,inner,currentEdge:edgeRatio(false),outerEdge:edgeRatio(true),enclosure:Math.max(edgeRatio(false),edgeRatio(true)),openRatio:inner?open/inner:0,wallRatio:inner?blocked/inner:0,specialRatio:inner?special/inner:0,indoorRatio:inner?indoorMat/inner:0};
}

function enclosedRoomScore1026(r){
  if(!r||r.w<8||r.h<6||r.w>38||r.h>28||roomTouchesProtected(r))return null;
  const q=roomProbe1026(r);if(!q||q.area<48||q.area>520)return null;
  // Only open interior plates are candidates. Existing furniture/partitions win over this pass.
  if(q.openRatio<.61||q.wallRatio>.105||q.specialRatio>.25)return null;
  const named=!!(r.name||r.label||r.append1020),indoorName=/객실|서고|보존|창고|장고|가옥|오두막|본관|내실|실내|연회|공방|병기|숙소|회랑실/.test(r.name||r.label||''),enclosed=q.enclosure>=.24||q.indoorRatio>=.36||indoorName||(named&&q.enclosure>=.16);
  return enclosed?q:null;
}




/* R39 THEME-2 GARDEN COURTS — floor 8 keeps its authored house but the surrounding field is divided into optional courtyards/alleys instead of one giant lawn. */
function shapeFloor8Garden1028(){
  if(state.floor!==8)return null;
  const snap=cloneTerrainMap58(state.map),path=walkPath(),route=new Set(path.map(p=>K1020(p.x,p.y))),madeCells=new Set();
  const houses=(state.rooms||[]).filter(r=>/오두막|장옥|가옥|찻집|공방/.test(r.name||r.label||''));
  const insideHouse=(x,y)=>houses.some(r=>x>=r.x-1&&x<r.x+r.w+1&&y>=r.y-1&&y<r.y+r.h+1);
  const floorish=t=>[TT.GRASS,TT.LIGHT_GRASS,TT.FLOOR,TT.STONE_PATH].includes(t);
  const putPath=(x,y)=>{if(!inside1020(x,y)||insideHouse(x,y)||!floorish(state.map[y]?.[x]))return false;setTerrainTile58(state.map,x,y,TT.STONE_PATH);madeCells.add(K1020(x,y));return true};
  const joinRoute=(x,y)=>{let best=null,bd=1e9;for(const kk of route){const [rx,ry]=kk.split(',').map(Number),d=Math.abs(rx-x)+Math.abs(ry-y);if(d<bd){bd=d;best={x:rx,y:ry}}}if(!best)return;let cx=x,cy=y;while(cx!==best.x){putPath(cx,cy);cx+=Math.sign(best.x-cx)}while(cy!==best.y){putPath(cx,cy);cy+=Math.sign(best.y-cy)}putPath(best.x,best.y)};
  let made=0;const centers=[];
  const carve=(fx,fy,w,h,tag)=>{const cx=clamp1020(Math.round(COLS*fx),7,COLS-8),cy=clamp1020(Math.round(ROWS*fy),6,ROWS-7),x=cx-Math.floor(w/2),y=cy-Math.floor(h/2);let eligible=0,bad=0;
    for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++){if(!inside1020(xx,yy)||insideHouse(xx,yy))bad++;else if(floorish(state.map[yy]?.[xx]))eligible++;else bad++}
    if(eligible<Math.floor(w*h*.58)||bad>Math.floor(w*h*.42))return false;
    const gates=new Set([K1020(cx,y),K1020(cx,y+h-1),K1020(x,cy),K1020(x+w-1,cy)]);
    for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++){if(!floorish(state.map[yy]?.[xx]))continue;const kk=K1020(xx,yy),edge=xx===x||xx===x+w-1||yy===y||yy===y+h-1;
      if(route.has(kk)){putPath(xx,yy);gates.add(kk);continue}
      if(edge&&!gates.has(kk))setTerrainTile58(state.map,xx,yy,TT.HEDGE);
      else if(!edge){if(xx===cx||yy===cy)putPath(xx,yy);else setTerrainTile58(state.map,xx,yy,hash1022(floorSeedKey(`r41-f8:${tag}:${xx},${yy}`))%7===0?TT.LIGHT_GRASS:TT.GRASS)}
    }
    for(const [xx,yy] of [[x+2,y+2],[x+w-3,y+2],[x+2,y+h-3],[x+w-3,y+h-3]])if(floorish(state.map[yy]?.[xx])&&!route.has(K1020(xx,yy))){setTerrainTile58(state.map,xx,yy,TT.BAMBOO)}
    joinRoute(cx,cy);state.featureRooms=state.featureRooms||[];state.featureRooms.push({name:`대나무 중정 ${made+1}`,x,y,w,h,cx,cy});centers.push({x:cx,y:cy});made++;return true
  };
  const specs=[[.18,.27,15,11],[.44,.22,13,9],[.72,.28,15,11],[.22,.68,15,11],[.53,.72,13,9],[.78,.66,15,11]];
  for(let i=0;i<specs.length;i++)carve(...specs[i],`main${i}`);
  // A random generator occasionally leaves only one or two sufficiently clean large courts.  Fill the same planned
  // garden anchors with smaller courts rather than accepting a giant undivided lawn.  This still uses existing
  // walkable garden cells and never cuts authored houses or the critical route.
  if(made<3){const fallback=[[.30,.43,11,7],[.61,.45,11,7],[.38,.78,11,7],[.72,.76,11,7]];for(let i=0;i<fallback.length&&made<3;i++)carve(...fallback[i],`small${i}`)}
  // Tie nearby court axes together with narrow stone alleys where the intervening cells are already garden floor.
  centers.sort((a,b)=>a.x-b.x||a.y-b.y);for(let i=1;i<centers.length;i++){const a=centers[i-1],b=centers[i],mx=Math.round((a.x+b.x)/2);for(let x=Math.min(a.x,mx);x<=Math.max(a.x,mx);x++)putPath(x,a.y);for(let y=Math.min(a.y,b.y);y<=Math.max(a.y,b.y);y++)putPath(mx,y);for(let x=Math.min(mx,b.x);x<=Math.max(mx,b.x);x++)putPath(x,b.y)}
  if(!reach1020(state.stairs,{unlock:true,openBoss:true})){state.map=snap;made=0;madeCells.clear()}
  state.floor8GardenCourts1028={courts:made,houses:houses.length,pathCells:madeCells.size,routeProtected:path.length};return state.floor8GardenCourts1028;
}

/* R37 THEME-2 DESIGN — quiet ink/wood/stone materials, with deliberate indoor/outdoor room identities. */
function refineTheme2Rooms1027(){
  state.theme2RoomIdentity1027=null;if(![7,9].includes(state.floor))return null;const rooms=[...(state.rooms||[])].filter(r=>r&&r.w>=6&&r.h>=5).sort((a,b)=>b.w*b.h-a.w*a.h),out={floor:state.floor,indoor:0,garden:0,rooms:[]};
  const floorish=t=>[TT.FLOOR,TT.GRASS,TT.LIGHT_GRASS,TT.STONE_PATH,TT.WOOD_FLOOR,TT.DARK_WOOD].includes(t),meta=[];
  for(const r of rooms){const q=roomProbe1026(r),nm=r.name||r.label||'',seed=hash1022(floorSeedKey(`t2room:${state.floor}:${r.x},${r.y}`)),namedIndoor=/객실|서고|가옥|오두막|실내|본관|장옥|연회|공방/.test(nm),enclosure=q?.enclosure||0;meta.push({r,seed,enclosure,namedIndoor,indoor:namedIndoor||enclosure>=.34||(enclosure>=.23&&seed%100<36)})}
  // At least a quarter of anonymous rooms become gardens when the generator otherwise reads as one giant brown interior.
  const anon=meta.filter(v=>!v.namedIndoor).sort((a,b)=>a.enclosure-b.enclosure||a.seed-b.seed),wantGarden=Math.min(anon.length,Math.max(meta.length>=4?1:0,Math.round(meta.length*.28)));for(let i=0;i<wantGarden;i++)anon[i].indoor=false;
  for(const v of meta){const {r,seed,indoor}=v;for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++){const t=state.map[y]?.[x];if(!floorish(t))continue;if(indoor){const border=x===r.x+1||x===r.x+r.w-2||y===r.y+1||y===r.y+r.h-2;setTerrainTile58(state.map,x,y,border&&r.w>=9&&r.h>=7?TT.DARK_WOOD:TT.WOOD_FLOOR)}else{const cross=x===r.cx||y===r.cy;setTerrainTile58(state.map,x,y,cross?TT.STONE_PATH:((x+y+seed)%6===0?TT.LIGHT_GRASS:TT.GRASS))}}if(indoor)out.indoor++;else out.garden++;out.rooms.push({x:r.x,y:r.y,w:r.w,h:r.h,indoor,enclosure:v.enclosure})}
  state.theme2RoomIdentity1027=out;return out;
}



/* Existing 9.9.4 visual props are the only visual-only versions used for legacy furnishings. */



/* R39 ENCOUNTER DISTRIBUTION

/* R39 ENCOUNTER DISTRIBUTION — small contextual packs are allowed; ordinary generation cannot collapse into a mob ball. */

function sameRoom1027(a,b){return a&&b&&a.x===b.x&&a.y===b.y&&a.w===b.w&&a.h===b.h}
function denseRoom1027(r){return !!r&&(state.monsterDenseRooms||[]).some(d=>sameRoom1027(r,d)||(r.cx>=d.x&&r.cx<d.x+d.w&&r.cy>=d.y&&r.cy<d.y+d.h))}

function latePackCaps1027(){const f=state?.floor||1;if(f>=24)return{normal:4,dense:5,context:6,local:4,denseLocal:5,contextLocal:6,wide:7,denseWide:8,contextWide:9};if(f===23)return{normal:3,dense:4,context:5,local:3,denseLocal:4,contextLocal:5,wide:6,denseWide:7,contextWide:8};if(f===22)return{normal:3,dense:4,context:5,local:3,denseLocal:4,contextLocal:4,wide:5,denseWide:6,contextWide:7};if(f===21)return{normal:2,dense:3,context:4,local:2,denseLocal:3,contextLocal:4,wide:4,denseWide:5,contextWide:6};return{normal:2,dense:3,context:4,local:2,denseLocal:3,contextLocal:4,wide:4,denseWide:5,contextWide:6}}

function fixedEncounterMonster1027(m){return !!(m?.boss||m?.elite1023||m?.storyPhase992||m?.name==='여의 수룡'||m?.fixedEncounter1027)}






const RETIRED_DECOR64=new Set(["lantern","banner","statue","cabinet","shelf","jars","planter","basin","cushion","screen","crate","rack","weaponrack","altar","brazier","incense","tea","bench","pillar","lampstand"]);
function retireLegacyVisualDecor64(){
 if(!state)return;state.decor=(state.decor||[]).filter(d=>!RETIRED_DECOR64.has(d.kind));
 for(const name of ['archDecor1020','archDecor1023']){const src=state[name]||{};state[name]=Object.fromEntries(Object.entries(src).filter(([,kind])=>kind==='goldSeal'||kind==='holyIcon1023'))}
 state.decorCanonical1029=null;
}
function sanitizeWallDecor1029(){
  if(!state?.decor)return{removed:0};const before=state.decor.length;state.decor=state.decor.filter(d=>d.layer!=='wall'||(state.map?.[d.y]?.[d.x]===TT.WALL&&state.map?.[d.y+1]?.[d.x]!==TT.WALL));const out={removed:before-state.decor.length};state.wallDecorSanitize1029=out;return out;
}
const PHYSICAL_DECOR_BLOCKERS1029=new Set([TT.STONE_PILLAR,TT.LANTERN_POST,TT.WALL_BANNER,TT.CRATE,TT.BENCH,TT.FLOWERBED,TT.ROCK,TT.STATUE,TT.RACK,TT.LOW_FENCE,TT.WINDOW,TT.GARDEN_TREE,TT.SCREEN,TT.INCENSE_STAND].filter(v=>v!=null));

function repairBlockingPhysicalDecor1029(){
  if(!state||[11,13,21].includes(state.floor)){state.decorRouteRepair1029={removed:0,mechanicFloor:[11,13,21].includes(state.floor)};return state.decorRouteRepair1029}
  if(finalExitReach1029()){state.decorRouteRepair1029={removed:0,alreadyReachable:true};return state.decorRouteRepair1029}
  const path=ReachabilityService.physicalDecorRoute({K1020,inside1020,PHYSICAL_DECOR_BLOCKERS1029,HAZ1020});if(!path){state.decorRouteRepair1029={removed:0,noDecorOnlyPath:true};return state.decorRouteRepair1029}
  const removed=[];for(const p of path){const t=state.map[p.y][p.x];if(!PHYSICAL_DECOR_BLOCKERS1029.has(t))continue;const counts=new Map();for(const[dx,dy]of DIRS8){const n=state.map[p.y+dy]?.[p.x+dx];if(n!=null&&!tileBlocks(n)&&!HAZ1020().has(n))counts.set(n,(counts.get(n)||0)+1)}let base=terrainUnderlayAt58(p.x,p.y);if(!terrainSurface58(base)){let best=-1;base=TT.FLOOR;for(const[t0,n]of counts)if(n>best){base=t0;best=n}}setTerrainTile58(state.map,p.x,p.y,base);removed.push({x:p.x,y:p.y,t})}
  state.decorRouteRepair1029={removed:removed.length,cells:removed,restored:finalExitReach1029()};return state.decorRouteRepair1029;
}

function connectArchitectureRooms51(){
  if(state.floor===18&&state.ironGate18_1020){const g=state.ironGate18_1020;setTerrainTile58(state.map,g.x,g.y,TT.LOCKED_GATE)}
  const carved=[];const protectedGate=(x,y)=>[state.bossExitGate1020,state.ironGate18_1020,state.outdoorGate24_1020,state.midGate22_1020].some(p=>p&&p.x===x&&p.y===y);
  for(let attempt=0;attempt<160;attempt++){
    const reach=finalReachSet1029(),targets=[];for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++)if(!tileBlocks(state.map[y][x])&&!HAZ1020().has(state.map[y][x])&&!reach.has(K1020(x,y)))targets.push({x,y});
    if(!targets.length)break;
    // Multi-source shortest wall crossing: never bridge hazards or overwrite a gate/key/reward.
    const q=[],prev=new Map(),seen=new Set();for(const p of targets){const k=K1020(p.x,p.y);q.push(p);seen.add(k)}let end=null;
    for(let i=0;i<q.length&&!end;i++){const p=q[i];for(const[dx,dy]of DIRS4){const x=p.x+dx,y=p.y+dy,k=K1020(x,y);if(!inside1020(x,y)||seen.has(k)||protectedGate(x,y))continue;const t=state.map[y][x];const water=t===TT.WATER||(state.floor===25&&t===TT.VOID),span=water?(p.waterSpan||0)+1:0;if((HAZ1020().has(t)&&!water)||span>(state.floor===11?2:6)||t===TT.LOCKED_GATE||t===TT.DRAWBRIDGE_UP)continue;if(tileBlocks(t)&&!water&&t!==TT.WALL&&t!==TT.BAMBOO&&t!==TT.HEDGE&&!PHYSICAL_DECOR_BLOCKERS1029.has(t))continue;seen.add(k);prev.set(k,K1020(p.x,p.y));if(reach.has(k)){end=k;break}q.push({x,y,waterSpan:span})}}
    if(!end)break;let k=prev.get(end);while(k){const[x,y]=k.split(',').map(Number),t=state.map[y][x];if(tileBlocks(t)||t===TT.WATER||t===TT.VOID){setTerrainTile58(state.map,x,y,t===TT.WATER?TT.WOOD_FLOOR:t===TT.VOID?TT.MOON_STONE:TT.FLOOR);carved.push({x,y,old:t});delete state.bookWallMap1022?.[k];delete state.archDecor1023?.[k]}k=prev.get(k)}
  }
  state.architectureConnections51={carved:carved.length,cells:carved};return state.architectureConnections51;
}

function placeFloor6LibraryRewardR8(){
  if(state.floor!==6||!state.f6LibraryPrizeR8)return false;const up=(window.MANRU_TALISMANS||[]).find(i=>i.talismanKind==='upgrade');if(!up)return false;
  let q=ReachabilityService.finalPlacementCell({clamp1020,K1020,candidateFinal1020,inside1020},state.f6LibraryPrizeR8.x,state.f6LibraryPrizeR8.y,null,p=>state.libraryZones1022?.some(z=>z.name==='봉인 고문서고'&&p.x>=z.x&&p.y>=z.y&&p.x<z.x+z.w&&p.y<z.y+z.h));
  if(!q||occupiedFinal(q.x,q.y))q=ReachabilityService.finalPlacementCell({clamp1020,K1020,candidateFinal1020,inside1020},state.f6LibraryPrizeR8.x,state.f6LibraryPrizeR8.y);if(!q)return false;
  PlacementService.placeItem({...clone(up),x:q.x,y:q.y,count:1,r8LibraryPrize:true});state.f6LibraryPrizeR8={...q};return true
}
function repairFloor23MercuryConnectivity1029(){
  if(!state||state.floor!==23)return{ok:true,bridges:0,components:0};
  const safe=(x,y)=>inside1020(x,y)&&!tileBlocks(state.map[y][x])&&!HAZ1020().has(state.map[y][x])&&!globalThis.__MANRU_RUMOR_SPACES1030__?.isSealedInterior?.(x,y),protectedCell=(x,y)=>state.stairs&&(x===state.stairs.x&&y===state.stairs.y)||(state.player&&x===state.player.x&&y===state.player.y)||[TT.CACHE,TT.ARMORY,TT.VAULT,TT.ALTAR,TT.FOUNTAIN,TT.RUMOR,TT.PAVILION].includes(state.map[y]?.[x]);
  let bridges=0,components=0;
  for(let pass=0;pass<32;pass++){
    const reach=finalReachSet1029(),unseen=new Set();for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++)if(safe(x,y)&&!reach.has(K1020(x,y)))unseen.add(K1020(x,y));
    if(!unseen.size)break;
    const first=unseen.values().next().value,[sx,sy]=first.split(',').map(Number),comp=[],cq=[{x:sx,y:sy}];unseen.delete(first);for(let i=0;i<cq.length;i++){const p=cq[i];comp.push(p);for(const[dx,dy]of DIRS4){const x=p.x+dx,y=p.y+dy,kk=K1020(x,y);if(unseen.has(kk)){unseen.delete(kk);cq.push({x,y})}}}components++;
    const q=[],prev=new Int32Array(COLS*ROWS);prev.fill(-2);for(const p of comp){const idx=p.y*COLS+p.x;prev[idx]=-1;q.push(p)}let end=-1;
    for(let i=0;i<q.length&&end<0;i++){const p=q[i],pidx=p.y*COLS+p.x;for(const[dx,dy]of DIRS4){const x=p.x+dx,y=p.y+dy;if(!inside1020(x,y))continue;const idx=y*COLS+x;if(prev[idx]!==-2)continue;const t=state.map[y][x],allowed=t===TT.MERCURY||t===TT.DRAWBRIDGE_DOWN||safe(x,y);if(!allowed||protectedCell(x,y)&&!reach.has(K1020(x,y)))continue;prev[idx]=pidx;if(reach.has(K1020(x,y))){end=idx;break}q.push({x,y})}}
    if(end<0)break;
    let at=end;while(at>=0){const x=at%COLS,y=(at/COLS)|0,t=state.map[y][x];if(t===TT.MERCURY){setTerrainTile58(state.map,x,y,TT.DRAWBRIDGE_DOWN);bridges++}at=prev[at]}
  }
  const audit=finalReachSet1029(),remaining=[];for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++)if(safe(x,y)&&!audit.has(K1020(x,y)))remaining.push({x,y});state.floor23MercuryRepair1029={ok:remaining.length===0,bridges,components,remaining:remaining.length};return state.floor23MercuryRepair1029;
}




/* ===== MANRU r43: floor 22 encounter budgeting on the FINAL expanded geometry ===== */
const F22_BUDGET43={lower:16,central:11,upper:16};
function floor22Zone43(y){const mid=Math.floor((ROWS-1)/2);if(y<mid-14)return'upper';if(y>mid+14)return'lower';return'central'}
function floor22CellOk43(m,x,y,zone){
  if(!inside1020(x,y)||floor22Zone43(y)!==zone)return false;
  if(Math.abs(x-state.player.x)+Math.abs(y-state.player.y)<10)return false;
  if(Math.abs(x-state.stairs.x)+Math.abs(y-state.stairs.y)<5)return false;
  const t=state.map[y]?.[x];if(!safeFloorTile1020(t)||HAZ1020().has(t)||t===TT.WATER||t===TT.MERCURY||t===TT.LAVA||t===TT.VOID)return false;
  return PlacementService.monsterCanStand(m,x,y);
}
function floor22Density43(x,y,r=4){let n=0;for(const m of state.monsters||[])if(m.hp>0&&Math.max(Math.abs(m.x-x),Math.abs(m.y-y))<=r)n++;return n}
function spreadFloor22R43(){
  if(!state||state.floor!==22)return null;
  const living=(state.monsters||[]).filter(m=>m.hp>0&&!m.boss),target=43;
  // population61 owns the count. This pass only makes the final expanded floor obey the structural encounter budget.
  if(living.length!==target){state.f22Population43={ok:false,count:living.length,reason:'population-count-before-zoning'};return state.f22Population43}
  const original=state.monsters,placed=[];state.monsters=[];
  const quotas=[['lower',F22_BUDGET43.lower],['central',F22_BUDGET43.central],['upper',F22_BUDGET43.upper]];
  const cells={lower:[],central:[],upper:[]};
  const reach=reachableSet1020({unlock:true,openBoss:true});
  for(const kk of reach){const[x,y]=kk.split(',').map(Number),z=floor22Zone43(y);if(z&&safeFloorTile1020(state.map[y]?.[x])&&!HAZ1020().has(state.map[y]?.[x])&&Math.abs(x-state.player.x)+Math.abs(y-state.player.y)>=10&&Math.abs(x-state.stairs.x)+Math.abs(y-state.stairs.y)>=5)cells[z].push({x,y})}
  const score=(p,zone,idx)=>{const midx=Math.floor(COLS/2),midy=Math.floor((ROWS-1)/2);return ((Math.abs(p.x-midx)*7+Math.abs(p.y-midy)*3+idx*17+(zone==='central'?11:zone==='upper'?23:37))%101)};
  for(const z of Object.keys(cells))cells[z].sort((a,b)=>score(a,z,0)-score(b,z,0)||a.y-b.y||a.x-b.x);
  let mi=0;const anchors=[];
  const placePack=(zone,mobs,packIndex)=>{
    const cands=cells[zone].filter(p=>anchors.every(a=>a.zone!==zone||Math.abs(a.x-p.x)+Math.abs(a.y-p.y)>=9));
    cands.sort((a,b)=>score(a,zone,packIndex)-score(b,zone,packIndex));
    for(const a of cands){
      const temp=[];let good=true;
      for(const m of mobs){
        const near=[];for(let r=0;r<=3;r++)for(let oy=-r;oy<=r;oy++)for(let ox=-r;ox<=r;ox++){if(Math.max(Math.abs(ox),Math.abs(oy))!==r)continue;const x=a.x+ox,y=a.y+oy;if(floor22CellOk43(m,x,y,zone)&&floor22Density43(x,y,3)<4)near.push({x,y})}
        if(!near.length){good=false;break}near.sort((u,v)=>Math.abs(u.x-a.x)+Math.abs(u.y-a.y)-Math.abs(v.x-a.x)-Math.abs(v.y-a.y));const p=near[0];Object.assign(m,p,{alerted:false});OccupancyService.addMonster(m);temp.push(m)
      }
      if(good){anchors.push({x:a.x,y:a.y,zone});placed.push(...temp);return true}
      for(const m of temp){const ix=state.monsters.indexOf(m);if(ix>=0)state.monsters.splice(ix,1)}
    }
    return false
  };
  for(const[zone,q]of quotas){let left=q,packIndex=0;while(left>0){const n=Math.min(3,left),mobs=living.slice(mi,mi+n);if(!placePack(zone,mobs,packIndex++)){
        for(const m of mobs){let p=null;for(const c of cells[zone])if(floor22CellOk43(m,c.x,c.y,zone)&&floor22Density43(c.x,c.y,3)<4){p=c;break}if(!p)break;Object.assign(m,p,{alerted:false});OccupancyService.addMonster(m);placed.push(m)}
      }mi+=n;left-=n}}
  if(placed.length!==target){state.monsters=original;state.f22Population43={ok:false,count:placed.length,reason:'zoning-placement-failed'};return state.f22Population43}
  const counts={lower:0,central:0,upper:0};let maxLocal=0,unreachable=0,badTerrain=0;
  const finalReach=reachableSet1020({unlock:true,openBoss:true});
  for(const m of state.monsters){counts[floor22Zone43(m.y)]++;maxLocal=Math.max(maxLocal,floor22Density43(m.x,m.y,3));if(!finalReach.has(K1020(m.x,m.y)))unreachable++;if(!PlacementService.monsterCanStand(m,m.x,m.y))badTerrain++}
  state.f22Population43={ok:state.monsters.length===target&&counts.lower===F22_BUDGET43.lower&&counts.central===F22_BUDGET43.central&&counts.upper===F22_BUDGET43.upper&&maxLocal<=4&&!unreachable&&!badTerrain,count:state.monsters.length,counts,maxLocal,unreachable,badTerrain,anchors:anchors.map(a=>({...a}))};return state.f22Population43
}
/* ===== MANRU r58.1 RUMOR-REVEALED HIDDEN SPACES / CANONICAL MAP EXTENSION ===== */
const RUMOR_SPACE_VERSION1030='r58.1-rumor-spaces';












































globalThis.__MANRU_RUMOR_SPACES1030__=Object.freeze({version:RUMOR_SPACE_VERSION1030,types:RUMOR_SPACE_TYPES.map(t=>({id:t.id,name:t.name,preview:!!t.preview,risk:t.risk})),generate:generateRumorSpaces,revealNext:rumorRevealNext,reveal:r=>revealRumorSpace(r),openEntranceAt:rumorOpenEntranceAt,drawEntranceOverlay:rumorDrawEntranceOverlay,isSealedInterior:(x,y)=>!!rumorSpaceByInterior(x,y),mutationLocked:rumorSpaceMutationLocked,audit:rumorAudit,qaGenerate:rumorQAGenerate});


// r18: architecture finalization is the final explicit stage of the canonical generation pipeline.











/* ===== MANRU v10.0.4 r18: SINGLE CANONICAL FLOOR GENERATION PIPELINE · EXIT MARKER INVARIANT / DIRECT BOSS DROPS ===== */
if(typeof globalThis.__MANRU_GENERATE_CORE983__!=='function')throw new Error('Manru canonical generator core missing');
































const px1012=(q,x,y,c)=>{q.fillStyle=c;q.fillRect(x,y,1,1)};





















function playerKey1012(id,p,dir,attack){const g=x=>x?`${x.name||''}:${x.tier||0}:${x.rarity||''}:${x.upgrade||0}`:'-';return`${id}|${dir}|${attack?1:0}|${heldWeaponKey1001(p?.weapon)}|${g(p?.weapon)}|${g(p?.armor)}|${g(p?.cloak)}|${g(p?.relic)}|${g(p?.trinket)}`}





Object.defineProperty(globalThis,'__MANRU_ACTOR_ART__',{value:ACTOR_ART,writable:false,configurable:false,enumerable:true});
function dir1012(m,player=false){if(player){const f=state?.player?.facing||{x:0,y:1};return Math.abs(f.x)>Math.abs(f.y)?(f.x<0?'left':'right'):(f.y<0?'up':'down')}const t=m?.attackTarget,dx=t?Math.sign(t.x-m.x):0,dy=t?Math.sign(t.y-m.y):0;return Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down')}



renderClassGrid();




/* R7 procedural item sprite generator removed: TRUE-HD atlas and authored consumable visuals are canonical. */

/* ===== R7 CANONICAL ITEM ART (outer game scope) ===== */
const BUILD='10.0.6-r7-authored-branch-items';

const legacyPotionIcon=globalThis.__MANRU_POTION_ART_56__?.iconHtml||null;
const legacyPotionDraw=globalThis.__MANRU_POTION_ART_56__?.worldDraw||null;













const STATIC_EXTRA_R7=[{"name":"개량 인장","type":"upgrade","tier":1,"rarity":"relic","seal":"改","ability":"장비 개량 1회","desc":"무기·갑옷·망토 하나에 영구 개량을 새긴다."},{"name":"도서관 지도첩","type":"scroll","rarity":"rare","libraryScroll1022":true,"libraryKind1022":"mapping"},{"name":"도서관 감식록","type":"scroll","rarity":"rare","libraryScroll1022":true,"libraryKind1022":"identify"},{"name":"도서관 수호장","type":"scroll","rarity":"relic","libraryScroll1022":true,"libraryKind1022":"ward"},{"name":"화강부적","type":"talisman","talismanKind":"f_fire_upgrade","fusion74":true,"element74":"fire","seal":"炎","tier":3,"rarity":"sealed","targeted":false,"targetRange":5,"fusionMode74":"gear","fusionEffect74":null,"ability":"무기 화염각인 / 방어구 화염면역","desc":"무기는 추가 화염 피해와 연소를 얻고, 방어구는 화염 역류를 막는다."},{"name":"뇌강부적","type":"talisman","talismanKind":"f_shock_upgrade","fusion74":true,"element74":"shock","seal":"淨","tier":3,"rarity":"sealed","targeted":false,"targetRange":5,"fusionMode74":"gear","fusionEffect74":null,"ability":"무기 공속 +10% / 방어구 이동비용 -8%","desc":"전류를 장비의 움직임에 맞춰 흘린다."},{"name":"수강부적","type":"talisman","talismanKind":"f_water_upgrade","fusion74":true,"element74":"water","seal":"流","tier":3,"rarity":"sealed","targeted":false,"targetRange":5,"fusionMode74":"gear","fusionEffect74":null,"ability":"무기 방어 약화 / 방어구 독·출혈 세척","desc":"수기를 장비에 순환시켜 적의 자세를 무너뜨리거나 상처를 씻는다."},{"name":"빙강부적","type":"talisman","talismanKind":"f_ice_upgrade","fusion74":true,"element74":"ice","seal":"凍","tier":3,"rarity":"sealed","targeted":false,"targetRange":5,"fusionMode74":"gear","fusionEffect74":null,"ability":"무기 냉각 경직 / 방어구 EVA +1","desc":"차가운 기운을 장비에 고정한다."},{"name":"목강부적","type":"talisman","talismanKind":"f_grass_upgrade","fusion74":true,"element74":"grass","seal":"芽","tier":3,"rarity":"sealed","targeted":false,"targetRange":5,"fusionMode74":"gear","fusionEffect74":null,"ability":"무기 독분 각인 / 방어구 독 면역","desc":"살아 있는 기운을 장비 표면에 뿌리내린다."},{"name":"지강부적","type":"talisman","talismanKind":"f_earth_upgrade","fusion74":true,"element74":"earth","seal":"岩","tier":3,"rarity":"sealed","targeted":false,"targetRange":5,"fusionMode74":"gear","fusionEffect74":null,"ability":"무기 중량타 / 방어구 DEF +1·밀치기 면역","desc":"장비의 무게와 지지력을 대지에 맞춘다."},{"name":"화폭부적","type":"talisman","talismanKind":"f_fire_blast","fusion74":true,"element74":"fire","seal":"炎","tier":3,"rarity":"rare","targeted":true,"targetRange":5,"fusionMode74":"target","fusionEffect74":"bomb_fire","ability":"3×3 층 비례 화염폭발 + 화염지대","desc":"원소 역류 없이 목표 지점에 화염을 집중한다."},{"name":"뇌폭부적","type":"talisman","talismanKind":"f_shock_blast","fusion74":true,"element74":"shock","seal":"電","tier":3,"rarity":"rare","targeted":true,"targetRange":6,"fusionMode74":"target","fusionEffect74":"bomb_shock","ability":"층 비례 연쇄 뇌격 · 물/금속 특효","desc":"목표 주변의 생체와 금속을 전류가 연쇄적으로 잇는다."},{"name":"조수 폭쇄부적","type":"talisman","talismanKind":"f_water_blast","fusion74":true,"element74":"water","seal":"潮","tier":3,"rarity":"rare","targeted":true,"targetRange":5,"fusionMode74":"target","fusionEffect74":"bomb_water","ability":"층 비례 수압 폭발 · 강한 밀치기 · 소화","desc":"강한 수압 피해와 진형 붕괴를 함께 노리는 수압 폭탄이다."},{"name":"빙폭부적","type":"talisman","talismanKind":"f_ice_blast","fusion74":true,"element74":"ice","seal":"雪","tier":3,"rarity":"rare","targeted":true,"targetRange":5,"fusionMode74":"target","fusionEffect74":"bomb_ice","ability":"층 비례 빙결폭발 · 비보스 경직","desc":"급랭으로 각개격파 시간을 번다."},{"name":"목폭부적","type":"talisman","talismanKind":"f_grass_blast","fusion74":true,"element74":"grass","seal":"荊","tier":3,"rarity":"rare","targeted":true,"targetRange":5,"fusionMode74":"target","fusionEffect74":"bomb_grass","ability":"층 비례 독분폭발 · 뿌리 구속","desc":"강한 직접 피해와 독·구속을 함께 퍼뜨린다."},{"name":"지폭부적","type":"talisman","talismanKind":"f_earth_blast","fusion74":true,"element74":"earth","seal":"震","tier":3,"rarity":"rare","targeted":true,"targetRange":5,"fusionMode74":"target","fusionEffect74":"bomb_earth","ability":"층 비례 고충격 폭발 · 밀치기/경직","desc":"지상 적의 진형을 무너뜨리는 충격파를 만든다."},{"name":"화막부적","type":"talisman","talismanKind":"f_fire_ward","fusion74":true,"element74":"fire","seal":"熾","tier":3,"rarity":"rare","targeted":false,"targetRange":5,"fusionMode74":"instant","fusionEffect74":"fireward","ability":"7턴 보호막 + 일시 화염저항","desc":"몸을 화염 장막으로 감싸고 주변에 불길을 남긴다."},{"name":"뇌섬부적","type":"talisman","talismanKind":"f_shock_blink","fusion74":true,"element74":"shock","seal":"閃","tier":3,"rarity":"rare","targeted":true,"targetRange":7,"fusionMode74":"target","fusionEffect74":"shockblink","ability":"순간이동 + 출발/도착 뇌격","desc":"축지의 양끝에 짧은 뇌격을 남긴다."},{"name":"정수부적","type":"talisman","talismanKind":"f_water_ward","fusion74":true,"element74":"water","seal":"淨","tier":3,"rarity":"rare","targeted":false,"targetRange":5,"fusionMode74":"instant","fusionEffect74":"pureward","ability":"상태이상 정화 + 8턴 보호막","desc":"상처를 씻고 보호막을 만든다."},{"name":"빙쇄부적","type":"talisman","talismanKind":"f_ice_bind","fusion74":true,"element74":"ice","seal":"鎖","tier":3,"rarity":"rare","targeted":true,"targetRange":6,"fusionMode74":"target","fusionEffect74":"icebind","ability":"3×3 강빙결","desc":"봉박의 사슬을 냉기로 굳혀 더 오래 붙잡는다."},{"name":"생맥부적","type":"talisman","talismanKind":"f_grass_map","fusion74":true,"element74":"grass","seal":"脈","tier":3,"rarity":"rare","targeted":false,"targetRange":5,"fusionMode74":"instant","fusionEffect74":"lifemap","ability":"전체 지도 + HP 8 회복","desc":"건물의 틈과 살아 있는 기운을 함께 읽는다."},{"name":"석갑부적","type":"talisman","talismanKind":"f_earth_ward","fusion74":true,"element74":"earth","seal":"壁","tier":3,"rarity":"rare","targeted":false,"targetRange":5,"fusionMode74":"instant","fusionEffect74":"stoneward","ability":"8턴 보호막 + 일시 대지저항","desc":"몸을 암반 같은 기운으로 감싼다."},{"name":"증기부적","type":"talisman","talismanKind":"f_steam","fusion74":true,"element74":null,"seal":"霧","tier":3,"rarity":"rare","targeted":true,"targetRange":5,"fusionMode74":"target","fusionEffect74":"steam","ability":"3×3 증기 2턴 · 사선 차단","desc":"상극의 두 기운을 증기로 바꿔 사선을 끊는다."},{"name":"설빙부적","type":"talisman","talismanKind":"f_frostfield","fusion74":true,"element74":null,"seal":"霜","tier":3,"rarity":"rare","targeted":true,"targetRange":5,"fusionMode74":"target","fusionEffect74":"frostfield","ability":"3×3 강빙결장","desc":"수기를 얼려 강한 제압장으로 만든다."},{"name":"생장부적","type":"talisman","talismanKind":"f_regrowth","fusion74":true,"element74":null,"seal":"生","tier":3,"rarity":"rare","targeted":false,"targetRange":5,"fusionMode74":"instant","fusionEffect74":"regrowth","ability":"재생 7턴 + 인접 적 뿌리구속","desc":"수기와 목기를 생장으로 바꾼다."},{"name":"용암부적","type":"talisman","talismanKind":"f_lava","fusion74":true,"element74":null,"seal":"熔","tier":3,"rarity":"rare","targeted":true,"targetRange":5,"fusionMode74":"target","fusionEffect74":"lava","ability":"화염 충격 + 임시 용암","desc":"대지를 녹여 좁은 길을 위험지대로 만든다."},{"name":"목석부적","type":"talisman","talismanKind":"f_bulwark","fusion74":true,"element74":null,"seal":"壘","tier":3,"rarity":"rare","targeted":false,"targetRange":5,"fusionMode74":"instant","fusionEffect74":"bulwark","ability":"임시 암벽 + 6턴 보호막","desc":"뿌리가 바위를 끌어올려 즉석 엄폐물을 만든다."},{"name":"폭뢰부적","type":"talisman","talismanKind":"f_thunderpool","fusion74":true,"element74":null,"seal":"轟","tier":3,"rarity":"rare","targeted":true,"targetRange":6,"fusionMode74":"target","fusionEffect74":"thunderpool","ability":"수기 전도 연쇄뇌격","desc":"물기운을 전도체로 삼아 뇌격을 넓게 퍼뜨린다."},{"name":"봉폭부적","type":"talisman","talismanKind":"f_bindblast","fusion74":true,"element74":null,"seal":"禁","tier":3,"rarity":"rare","targeted":true,"targetRange":5,"fusionMode74":"target","fusionEffect74":"bindblast","ability":"층 비례 폭발 + 일반 적 3턴 봉인","desc":"폭발 뒤 종이 사슬이 퍼져 살아남은 일반 적을 3턴 봉인한다. 보스는 제어 내성이 열려 있을 때 1턴만 경직된다."},{"name":"천안부적","type":"talisman","talismanKind":"f_heaveneye","fusion74":true,"element74":null,"seal":"眼","tier":3,"rarity":"rare","targeted":false,"targetRange":5,"fusionMode74":"instant","fusionEffect74":"heaveneye","ability":"전체 지도 + 미확인 2종 감정","desc":"지도와 감정을 한 장으로 묶은 탐색용 고급 부적이다."},{"name":"감강부적","type":"talisman","talismanKind":"f_identify_upgrade","fusion74":true,"element74":null,"seal":"鑑","tier":3,"rarity":"sealed","targeted":false,"targetRange":5,"fusionMode74":"instant","fusionEffect74":"identify_all991","ability":"인벤토리의 모든 미감정 아이템 완전 감정","desc":"감정의 결을 강화해 행낭 안의 미감정 물건을 한꺼번에 밝힌다."},{"name":"호축부적","type":"talisman","talismanKind":"f_guardblink","fusion74":true,"element74":null,"seal":"遁","tier":3,"rarity":"rare","targeted":true,"targetRange":6,"fusionMode74":"target","fusionEffect74":"guardblink","ability":"안전 순간이동 + 6턴 보호막","desc":"도망과 방어를 한 번에 해결하는 비상탈출 부적이다."},{"name":"성화부적","type":"talisman","talismanKind":"f_holy_fire","fusion74":true,"element74":null,"seal":"輝","tier":3,"rarity":"rare","targeted":false,"targetRange":5,"fusionMode74":"instant","fusionEffect74":"holy_elem_fire991","ability":"성광 정화 + 화염 가호","desc":"성광과 화기를 겹쳐 저주와 탁기를 태우고 짧은 화염 가호를 남긴다."},{"name":"성뢰부적","type":"talisman","talismanKind":"f_holy_shock","fusion74":true,"element74":null,"seal":"閃","tier":3,"rarity":"rare","targeted":false,"targetRange":5,"fusionMode74":"instant","fusionEffect74":"holy_elem_shock991","ability":"성광 정화 + 뇌전 가호","desc":"성광을 전류에 실어 주변의 사기를 태우고 뇌전 역류를 잠시 막는다."},{"name":"성수부적","type":"talisman","talismanKind":"f_holy_water","fusion74":true,"element74":null,"seal":"淨","tier":3,"rarity":"rare","targeted":false,"targetRange":5,"fusionMode74":"instant","fusionEffect74":"holy_elem_water991","ability":"강한 정화 + 수류 가호","desc":"깨끗한 수기와 성광으로 몸의 탁기를 씻고 잠시 수류의 역류를 막는다."},{"name":"성빙부적","type":"talisman","talismanKind":"f_holy_ice","fusion74":true,"element74":null,"seal":"雪","tier":3,"rarity":"rare","targeted":false,"targetRange":5,"fusionMode74":"instant","fusionEffect74":"holy_elem_ice991","ability":"성광 정화 + 빙결 가호","desc":"차갑게 가라앉힌 성광이 사기를 얼려 부수고 냉기의 역류를 막는다."},{"name":"성목부적","type":"talisman","talismanKind":"f_holy_grass","fusion74":true,"element74":null,"seal":"生","tier":3,"rarity":"rare","targeted":false,"targetRange":5,"fusionMode74":"instant","fusionEffect74":"holy_elem_grass991","ability":"성광 정화 + 목령 가호","desc":"살아 있는 기운에 성광을 섞어 탁기를 밀어내고 독분의 역류를 막는다."},{"name":"성토부적","type":"talisman","talismanKind":"f_holy_earth","fusion74":true,"element74":null,"seal":"震","tier":3,"rarity":"rare","targeted":false,"targetRange":5,"fusionMode74":"instant","fusionEffect74":"holy_elem_earth991","ability":"성광 정화 + 대지 가호","desc":"성광을 대지에 내려앉혀 사기를 누르고 충격의 역류를 막는다."},{"name":"성감부적","type":"talisman","talismanKind":"f_holy_identify","fusion74":true,"element74":null,"seal":"明","tier":3,"rarity":"rare","targeted":false,"targetRange":5,"fusionMode74":"instant","fusionEffect74":"holy_identify991","ability":"모든 미감정 장비 감정 + 저주 드러냄","desc":"성광으로 장비의 숨은 결을 드러내 저주까지 함께 판별한다."},{"name":"성강부적","type":"talisman","talismanKind":"f_holy_upgrade","fusion74":true,"element74":"holy","seal":"鍊","tier":3,"rarity":"sealed","targeted":false,"targetRange":5,"fusionMode74":"gear","fusionEffect74":null,"ability":"무기 언데드 추가피해 +5 / 방어구 언데드 피해 15% 감소","desc":"성광을 장비에 각인한다. 무기는 기존 금강령 퇴와 같은 성속성 추가피해 계통을 사용하고, 방어구는 언데드에게 받는 직접 피해를 소폭 줄인다."},{"name":"성폭부적","type":"talisman","talismanKind":"f_holy_blast","fusion74":true,"element74":null,"seal":"光","tier":3,"rarity":"rare","targeted":false,"targetRange":5,"fusionMode74":"instant","fusionEffect74":"holy_blast991","ability":"주변 성광 폭발 · 원혼/언데드 특효","desc":"성광을 폭발시켜 가까운 사악한 존재를 강하게 태운다."},{"name":"성안부적","type":"talisman","talismanKind":"f_holy_mapping","fusion74":true,"element74":null,"seal":"眼","tier":3,"rarity":"rare","targeted":false,"targetRange":5,"fusionMode74":"instant","fusionEffect74":"holy_mapping991","ability":"전체 지도 + 숨은 문 + 해로운 상태 정화","desc":"성광이 벽과 몸의 탁한 결을 함께 훑는다."},{"name":"성호부적","type":"talisman","talismanKind":"f_holy_ward","fusion74":true,"element74":null,"seal":"護","tier":3,"rarity":"rare","targeted":false,"targetRange":5,"fusionMode74":"instant","fusionEffect74":"holy_ward991","ability":"강한 상태 정화 + 보호막","desc":"성광을 장막으로 둘러 몸의 해로운 기운을 씻고 공격을 막는다."},{"name":"성축부적","type":"talisman","talismanKind":"f_holy_blink","fusion74":true,"element74":null,"seal":"縮","tier":3,"rarity":"rare","targeted":false,"targetRange":5,"fusionMode74":"instant","fusionEffect74":"holy_blink991","ability":"바라보는 방향 안전 점멸 + 정화","desc":"성광이 안전한 발판을 짚어 몸을 앞으로 접어 옮긴다."},{"name":"성봉부적","type":"talisman","talismanKind":"f_holy_bind","fusion74":true,"element74":null,"seal":"封","tier":3,"rarity":"rare","targeted":false,"targetRange":5,"fusionMode74":"instant","fusionEffect74":"holy_bind991","ability":"주변 구속 · 원혼/언데드 강구속","desc":"종이 사슬에 성광을 흘려 가까운 사기를 강하게 붙잡는다."}];









const ARMOR_STYLE={'경량복':'light','강화 가죽 갑옷':'leather','철제 흉갑':'breast','관원용 두정갑':'dujeong','총사령관 황금갑':'gold'};

const CLOAK_EMBLEM={'질긴 가죽망토':'stitch','바람막이망토':'wind','여행자망토':'pocket','두꺼운 면망토':'quilt','암영망토':'eye','축지망토':'dash','자력망토':'magnet','무술망토':'knot','보호망토':'shield','반사망토':'mirror','용암망토':'flame','면역망토':'seal'};

















globalThis.__MANRU_ICON_HTML_IMPL_R7__=iconHtml;
globalThis.__MANRU_DRAW_ITEM_IMPL_R7__=worldDraw;
window.__MANRU_ITEM_ART_R7__={dataItem:data,weaponAsset,pictureAsset:summonPictureAsset,iconHtml,clear:()=>{CACHE.clear();DATA.clear();WEAPON_ASSETS.clear();PICTURE_ASSETS.clear();return true}};

/* r29: lexical-scope QA bridge. This exposes tests only; gameplay paths remain canonical. */






const ARTIFACT_PLAYER_SCOPE46=Object.freeze(['player','status','turn','enemyEnergy','dead','victory','runState57','runEndEffects57']);
const ARTIFACT_RUN_SCOPE46=Object.freeze(['pendingMartialManualChoice','martialManualDrops','martialDamageSequence','martialProgression1005','artifactClaimed46','artifactHistory46','knowledge56','lootHistory47','uniqueKilled','harvested','holy991','story992','runId984','saveVersion1004']);


function possesses47(id){const p=state?.player;if(!p)return false;return p.weapon?.artifactId46===id||(p.inventory||[]).some(i=>i.artifactId46===id)}
function claimed47(id){return(state?.artifactClaimed46||[]).includes(id)||(state?.artifactHistory46||[]).some(h=>h.id===id&&['claimed','cleared','completed'].includes(h.status))}
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
let rng49=RngService.nativeRuntime();



function room47(m,q,index){let[x,y,w,h,kind]=q;const t=LEGEND_TILES49[state.legendTheme47];
 // Variation is bounded within each authored footprint, never within a locked shell.
 if(w>=12&&h>=10){const j=Math.floor(rng49()*2);x+=j;w-=j;if(rng49()<.5)h--}
 const r={x,y,w,h,cx:x+Math.floor(w/2),cy:y+Math.floor(h/2),kind,index,ports:[]};
 for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++){const edge=xx===x||yy===y||xx===x+w-1||yy===y+h-1;setTerrainTile58(m,xx,yy,edge?t.walls[(Math.floor(xx/3)+Math.floor(yy/4))%3]:t.base+(kind==='court'?3:((index%3))));state.legendRegion49[yy*COLS+xx]=index;}
 return r;
}
function hall47(m,a,b,unused,w=2){
 const t=LEGEND_TILES49[state.legendTheme47],ports=r=>[{x:r.cx,y:r.y,dx:0,dy:-1},{x:r.cx,y:r.y+r.h-1,dx:0,dy:1},{x:r.x,y:r.cy,dx:-1,dy:0},{x:r.x+r.w-1,y:r.cy,dx:1,dy:0}];
 const choices=[];for(const u of ports(a))for(const v of ports(b))choices.push({u,v,d:Math.abs(u.x-v.x)+Math.abs(u.y-v.y)});choices.sort((u,v)=>u.d-v.d);
 const allowed=(x,y)=>x>1&&y>1&&x<COLS-2&&y<ROWS-2&&state.legendRegion49[y*COLS+x]<0;
 let route=null,pa,pb;
 for(const c of choices){const sx=c.u.x+c.u.dx,sy=c.u.y+c.u.dy,tx=c.v.x+c.v.dx,ty=c.v.y+c.v.dy;if(!allowed(sx,sy)||!allowed(tx,ty))continue;
  const q=[{x:sx,y:sy}],prev=new Int32Array(COLS*ROWS);prev.fill(-2);prev[sy*COLS+sx]=-1;let found=false;
  for(let i=0;i<q.length;i++){const p=q[i];if(p.x===tx&&p.y===ty){found=true;break}const dirs=[...DIRS4].sort((u,v)=>(Math.abs(p.x+u[0]-tx)+Math.abs(p.y+u[1]-ty))-(Math.abs(p.x+v[0]-tx)+Math.abs(p.y+v[1]-ty)));for(const[dx,dy]of dirs){const x=p.x+dx,y=p.y+dy,n=y*COLS+x;if(!allowed(x,y)||prev[n]!==-2)continue;prev[n]=p.y*COLS+p.x;q.push({x,y})}}
  if(!found)continue;route=[];let n=ty*COLS+tx;while(n>=0){route.push({x:n%COLS,y:Math.floor(n/COLS)});n=prev[n]}route.reverse();pa=c.u;pb=c.v;break;
 }
 if(!route)throw new Error('corridor routing '+a.index+' → '+b.index);
 const pathTile=(x,y)=>{const old=m[y][x];return old===TT.WATER||old===TT.LAVA||old===TT.VOID?t.bridge:t.base+3};
 for(let i=0;i<route.length;i++){const p=route[i];setTerrainTile58(m,p.x,p.y,pathTile(p.x,p.y));if(i<2||i>route.length-3)continue;const before=route[i-1],dx=p.y!==before.y?1:0,dy=dx?0:1;for(let d=1;d<w;d++){const side=d===1?1:-1,x=p.x+dx*side,y=p.y+dy*side;if(!allowed(x,y))continue;const nearRoom=DIRS4.some(([ox,oy])=>state.legendRegion49[(y+oy)*COLS+x+ox]>=0);if(!nearRoom)setTerrainTile58(m,x,y,pathTile(x,y))}}
 for(const [r,p] of [[a,pa],[b,pb]]){setTerrainTile58(m,p.x,p.y,TT.DOOR);if(!r.ports.some(z=>z.x===p.x&&z.y===p.y))r.ports.push({...p});}
 state.legendPaths49.push({from:a.index,to:b.index,width:w,cells:route});
}
function addDecor47(x,y,kind,label,opts={}){if(!insideMapInterior(x,y))return;const d={x,y,kind,label,...opts};state.legendDecor47.push(d);state.legendDecorGrid47[key46(x,y)]=d;return d}

function markRooms47(rs){state.legendPattern47={};for(const r of rs)for(let y=r.y+1;y<r.y+r.h-1;y++)for(let x=r.x+1;x<r.x+r.w-1;x++)state.legendPattern47[key46(x,y)]=r.index%4}

function stamp49(x,y,w,h,kind,label,solid=true){const t=LEGEND_TILES49[state.legendTheme47],object={x,y,w,h,kind,label,solid,theme:state.legendTheme47};state.legendObjects49.push(object);for(let dy=0;dy<h;dy++)for(let dx=0;dx<w;dx++){if(!insideMapInterior(x+dx,y+dy))continue;if(solid)setTerrainTile58(state.map,x+dx,y+dy,t.solid);addDecor47(x+dx,y+dy,kind,label,{object49:object,dx,dy,w,h})}return object}
function architecture47(a,rs){const t=LEGEND_TILES49[a.id],spec=LEGEND_DUNGEON_LAYOUTS[a.id];
 for(const r of rs){const{ x,y,w,h,cx,cy,index:i,kind}=r;
  // Keep a two-cell perimeter aisle and all thresholds; fixtures occupy planned bays.
  const bayW=Math.max(1,Math.min(3,w-6)),bayH=Math.max(1,Math.min(3,h-6));
  if(kind==='grand'){
   const left=x+3,right=x+w-6,top=y+3;stamp49(left,top,3,3,'monumentA',LEGEND_THEMES47[a.id].landmarks[0]);stamp49(right,top,3,3,'monumentB',LEGEND_THEMES47[a.id].landmarks[1]);
   if(h>=14){for(const xx of [x+3,x+w-4])for(let yy=y+8;yy<y+h-3;yy+=4)stamp49(xx,yy,1,2,'column','대성소 기둥');}
   state.legendLandmark47={x:cx,y:cy,r:3,style:LEGEND_THEMES47[a.id].style,id:a.id};
   for(let yy=cy;yy<Math.min(y+h-2,cy+4);yy++)for(let xx=cx-2;xx<=cx+2;xx++)if(!tileBlocks(state.map[yy][xx])){setTerrainTile58(state.map,xx,yy,t.base+1);addDecor47(xx,yy,'mosaic','성소 모자이크',{dx:xx-cx+2,dy:yy-cy,w:5,h:4})}
  }else if(kind==='court'&&w>=11&&h>=8){
   // Outdoor cloister around an actual roofless building with two offset entries.
   const bx=x+3,by=y+3,bw=Math.min(7,w-6),bh=Math.min(6,h-4);
   if(bw>=5&&bh>=4){for(let yy=by;yy<by+bh;yy++)for(let xx=bx;xx<bx+bw;xx++)setTerrainTile58(state.map,xx,yy,(xx===bx||xx===bx+bw-1||yy===by||yy===by+bh-1)?t.walls[1]:t.base+2);
    setTerrainTile58(state.map,bx,by+1,TT.DOOR);setTerrainTile58(state.map,bx+bw-1,by+bh-2,TT.DOOR);state.legendBuildings49.push({x:bx,y:by,w:bw,h:bh});addDecor47(bx+2,by,'lintel','정자 지붕받침');}
  }else if(kind!=='entry'&&kind!=='vault'&&w>=10&&h>=9){stamp49(x+3,y+3,bayW,i%2?Math.min(2,bayH):bayH,i%2?'workset':'shrine',LEGEND_THEMES47[a.id].props[i%4]);}
  if(kind==='grand'&&h>=13){
   // Offset screens split the ceremonial floor into connected aisles and chambers.
   const wallY=y+Math.floor(h*.52);
   if(a.id==='water_crossbow'){
    for(let yy=y+2;yy<y+h-2;yy++)for(const xx of[cx-3,cx-2])if(!state.legendDecorGrid47[key46(xx,yy)]?.object49)setTerrainTile58(state.map,xx,yy,TT.WATER);
    for(const yy of[cy,y+h-3])for(const xx of[cx-3,cx-2])setTerrainTile58(state.map,xx,yy,t.bridge);
    for(let xx=x+2;xx<x+w-2;xx++)if(xx<cx-5||xx>cx+3)setTerrainTile58(state.map,xx,wallY,t.walls[1]);
    setTerrainTile58(state.map,x+4,wallY,TT.DOOR);setTerrainTile58(state.map,x+w-5,wallY,TT.DOOR);
   }else if(a.id==='curse_blade'||a.id==='ward_hammer'){
    for(let xx=x+2;xx<x+w-2;xx++)setTerrainTile58(state.map,xx,wallY,t.walls[1]);
    for(const xx of[x+4,cx+2,x+w-5])setTerrainTile58(state.map,xx,wallY,TT.DOOR);
    for(let yy=wallY+1;yy<y+h-2;yy++)setTerrainTile58(state.map,cx-3,yy,t.walls[0]);setTerrainTile58(state.map,cx-3,y+h-3,TT.DOOR);
   }else if(a.id==='mirror_blade'){
    for(let yy=y+7;yy<y+h-2;yy++)for(const xx of[cx-5,cx+5])setTerrainTile58(state.map,xx,yy,t.walls[1]);
    setTerrainTile58(state.map,cx-5,y+h-3,TT.DOOR);setTerrainTile58(state.map,cx+5,y+8,TT.DOOR);
   }else if(a.id==='chain_sickle'){
    for(let xx=x+2;xx<x+w-2;xx+=5){for(let yy=y+8;yy<y+h-1;yy++)setTerrainTile58(state.map,xx,yy,t.walls[1]);setTerrainTile58(state.map,xx,y+h-3,TT.DOOR);}
   }else if(a.id==='ember_axe'){
    for(let yy=y+8;yy<y+h-3;yy++)for(const xx of[cx-4,cx+4])setTerrainTile58(state.map,xx,yy,TT.LAVA);
    for(const xx of[cx-4,cx+4])setTerrainTile58(state.map,xx,cy+1,t.bridge);
    for(let xx=x+2;xx<cx-5;xx++)setTerrainTile58(state.map,xx,wallY,t.walls[0]);
   }else{
    for(let xx=x+2;xx<x+w-2;xx++)if(Math.abs(xx-cx)>2)setTerrainTile58(state.map,xx,wallY,t.walls[1]);
    setTerrainTile58(state.map,x+4,wallY,TT.DOOR);setTerrainTile58(state.map,x+w-5,wallY,TT.DOOR);
   }
  }
  // Carved side chambers, colonnades and service galleries preserve the perimeter route.
  if(kind==='grand'){
   const splitXs=a.id==='curse_spear'?[x+8,x+w-9]:a.id==='ward_hammer'?[x+9,x+w-10]:[];
   for(const xx of splitXs){for(let yy=y+1;yy<y+h-1;yy++)if(!state.legendDecorGrid47[key46(xx,yy)]?.object49)setTerrainTile58(state.map,xx,yy,t.walls[1]);for(const yy of[y+2,y+h-3])setTerrainTile58(state.map,xx,yy,TT.DOOR);}
   for(let xx=x+7;xx<x+w-6;xx+=5)for(const yy of[y+2,y+h-3])if(Math.abs(xx-cx)>2&&!DIRS8.some(([dx,dy])=>state.map[yy+dy]?.[xx+dx]===TT.DOOR)&&!state.legendDecorGrid47[key46(xx,yy)]&&state.map[yy][xx]>=t.base&&state.map[yy][xx]<t.base+4)stamp49(xx,yy,1,1,'column','측랑 열주');
  }
  if(kind==='court'&&w>=19){
   const bx=x+w-7,by=y+2,bw=5,bh=Math.min(h-4,6);
   if(bh>=4){for(let yy=by;yy<by+bh;yy++)for(let xx=bx;xx<bx+bw;xx++)setTerrainTile58(state.map,xx,yy,(xx===bx||xx===bx+bw-1||yy===by||yy===by+bh-1)?t.walls[0]:t.base);setTerrainTile58(state.map,bx,by+1,TT.DOOR);setTerrainTile58(state.map,bx+bw-1,by+bh-2,TT.DOOR);state.legendBuildings49.push({x:bx,y:by,w:bw,h:bh});}
  }
  if(kind==='work'&&w>=12&&h>=10){
   const yy=y+h-4;for(let xx=x+2;xx<x+w-6;xx++)if(!state.legendDecorGrid47[key46(xx,yy)]?.object49)setTerrainTile58(state.map,xx,yy,t.walls[1]);setTerrainTile58(state.map,x+3,yy,TT.DOOR);
   if(a.id==='chain_sickle'||a.id==='curse_spear')for(let xx=x+5;xx<x+w-6;xx+=4)stamp49(xx,y+2,2,2,'shrine',LEGEND_THEMES47[a.id].props[2]);
  }
  // Architectural floor bands distinguish circulation from occupied bays in the same room.
  for(let yy=y+1;yy<y+h-1;yy++)for(let xx=x+1;xx<x+w-1;xx++){
   const tile=state.map[yy][xx];if(tile<t.base||tile>t.base+3)continue;
   const perimeter=xx===x+1||xx===x+w-2||yy===y+1||yy===y+h-2;
   const aisle=Math.abs(xx-cx)<=1;
   if(perimeter)setTerrainTile58(state.map,xx,yy,t.base+2);
   else if(aisle&&kind!=='court')setTerrainTile58(state.map,xx,yy,t.base+1);
   else if(kind==='grand'&&yy>cy+1&&xx>cx+2)setTerrainTile58(state.map,xx,yy,t.base);
  }
  if(kind==='tower'){
   // Chamfered tower corners and an interior ring aisle, unlike rectangular workshops.
   for(const[dx,dy]of[[1,1],[-1,1],[1,-1],[-1,-1]]){const xx=dx>0?x+1:x+w-2,yy=dy>0?y+1:y+h-2;setTerrainTile58(state.map,xx,yy,t.walls[2]);}
   if(w>=12&&h>=11){stamp49(cx-1,cy-1,2,2,'shrine','절연 탑심');}
  }
  // Distinct narrow antechambers divide long halls without making an empty cross.
  if((kind==='hall'||kind==='work')&&w>=14&&h>=9){const xx=x+w-5;for(let yy=y+1;yy<y+h-1;yy++)setTerrainTile58(state.map,xx,yy,t.walls[0]);setTerrainTile58(state.map,xx,y+h-3,TT.DOOR);}
  for(let xx=x+2;xx<x+w-2;xx+=3){if(tileBlocks(state.map[y][xx]))addDecor47(xx,y,'wall'+((xx+i)%4),LEGEND_THEMES47[a.id].walls[(xx+i)%4]);}
  for(let yy=y+2;yy<y+h-2;yy+=3){if(tileBlocks(state.map[yy][x]))addDecor47(x,yy,'wall'+((yy+i)%4),LEGEND_THEMES47[a.id].walls[(yy+i)%4]);}
  for(let yy=y+1;yy<y+h-1;yy++)for(let xx=x+1;xx<x+w-1;xx++){if(tileBlocks(state.map[yy][xx])||state.map[yy][xx]===TT.DOOR)continue;const h0=(xx*17+yy*23+i*7)%29;if(h0<4)addDecor47(xx,yy,'floor'+h0,LEGEND_THEMES47[a.id].floordecor[h0]);}
  for(const[xx,yy]of[[x+1,y+1],[x+w-2,y+h-2]]){addDecor47(xx,yy,'light','전용 조명');state.legendLights49.push({x:xx,y:yy,color:i%2?LEGEND_THEMES47[a.id].light:LEGEND_THEMES47[a.id].warm,r:3.2,power:.28});}
 }
 // Water is physically connected outside the masonry buildings; other hazards occupy courtyards, never necessary routes.
 if(a.id==='water_crossbow')for(const r of rs.filter(r=>r.kind==='court')){for(let yy=r.y+1;yy<r.y+r.h-1;yy++)if(yy!==r.cy)setTerrainTile58(state.map,r.x+1,yy,TT.WATER);for(const p of r.ports){setTerrainTile58(state.map,p.x-p.dx,p.y-p.dy,t.bridge)}addDecor47(r.x+1,r.y+1,'waterfall','삼단 낙수 수문');state.legendLights49.push({x:r.x+1,y:r.y+2,color:'#72b8af',r:4,power:.22})}
 for(const p of state.legendPaths49){for(let i=3;i<p.cells.length-3;i+=7){const q=p.cells[i];addDecor47(q.x,q.y,'route','회랑 인레이');}}
 for(const i of spec.bonus){const r=rs[i],x=r.x+2,y=r.y+r.h-2;PlacementService.placeItem({...clone(CONSUMABLES.find(v=>v.type==='potion')||CONSUMABLES[0]),x,y,count:1});}
}

GenerationValidator.legendary=function legendaryCandidate10(){const progression=keyProgressAudit48(false),all=ReachabilityService.keyWalk(new Set(['iron','jade'])),islands=[],badItems=[],badRooms=[];let walkable=0,ordinaryDoors=0;const forbidden=new Set([TT.FLOOR,TT.DARK_WOOD,TT.MOON_STONE,TT.GILDED_FLOOR,TT.BRAZIER,TT.CRATE,TT.JAR,TT.CACHE,TT.STONE_PILLAR,TT.PAPER_BRIDGE]);let reused=0;
 for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){const t=state.map[y][x];if(forbidden.has(t))reused++;if(t===TT.DOOR)ordinaryDoors++;if(!tileBlocks(t)||t===TT.LOCKED_GATE){walkable++;if(!all.seen.has(key46(x,y)))islands.push({x,y,t})}}
 for(const it of state.items)if(!all.seen.has(key46(it.x,it.y)))badItems.push({name:it.name,x:it.x,y:it.y});
 for(const r of state.rooms){let n=0;for(let y=r.y+1;y<r.y+r.h-1;y++)for(let x=r.x+1;x<r.x+r.w-1;x++)if(all.seen.has(key46(x,y)))n++;if(!n)badRooms.push(r.index)}
 return{ok:progression.ok&&!islands.length&&!badItems.length&&!badRooms.length&&!reused,seed:state.legendSeed49,progression,walkable,islands:islands.slice(0,20),islandCells:islands.length,badItems,badRooms,ordinaryDoors,reused,rooms:state.rooms.length,buildings:state.legendBuildings49.length,landmarks:state.legendObjects49.filter(x=>x.kind.startsWith('monument')).length,water:state.map.flat().filter(t=>t===TT.WATER).length,bridges:state.map.flat().filter(t=>t===LEGEND_TILES49[state.legendTheme47].bridge).length};
};Object.freeze(GenerationValidator);

















globalThis.__MANRU_LEGEND_TERRAIN47__={drawCell:drawLegendCell,miniColor:legendMiniColor,theme:id=>LEGEND_THEMES47[id]||null,clear:()=>ART_CACHE.clear()};

const DUNGEON_MOBS47={
 ember_axe:[['용철 화로지기',34,9,5,2,'#a65d42','guard','construct',{concept57:"식지 않는 화로를 지키는 철갑 문지기다.",role61:'shell',legendSkill47:'forgeBurst'}],['불씨 식귀',24,10,2,5,'#b9694e','human','undead',{concept57:"재 속에서 타다 남은 굶주림이 일어섰다.",fast:true,fireTrail:true}],['제련 도깨비',38,11,4,2,'#8d654b','brute','spirit',{concept57:"광석 대신 침입자를 두드리려는 제련장의 도깨비다.",wallBreak:true,knockback:true}]],
 water_crossbow:[['침수 쇠뇌수',25,9,2,5,'#5e8ca1','human','spirit',{concept57:"물이 찬 사격장을 떠나지 않는 쇠뇌수의 영이다.",ranged:true,range:8,role61:'skirmisher',legendSkill47:'waterBurst'}],['수압 악어',39,11,5,1,'#52756c','beast','beast',{concept57:"수압에 짓눌린 수조에서 단단하게 자란 악어다.",aquatic:true,reach:2,heavyHit57:true,knockback:true}],['물살 시종',23,9,1,7,'#72a7b0','human','spirit',{concept57:"물길 사이를 분주하게 오가는 시종의 영이다.",fast:true,legendSkill47:'waterBurst'}]],
 thunder_spear:[['뇌우 사수',28,10,2,5,'#668fa6','human','spirit',{concept57:"천둥이 머무는 사격장의 영체다.",ranged:true,range:8,legendSkill47:'thunderPulse'}],['피뢰 갑병',38,10,7,1,'#75818a','guard','construct',{concept57:"벼락 자국이 남은 철갑 병사다.",role61:'formation'}],['전도 정령',24,9,2,7,'#76bfd1','void','spirit',{concept57:"공기 속 전하가 한데 엉긴 정령이다.",fast:true,legendSkill47:'thunderPulse'}]],
 curse_blade:[['주박 검객',38,12,4,5,'#86566e','human','undead',{concept57:"저주에 묶인 칼을 끝내 놓지 못한 검객이다.",fast:true,legendSkill47:'curseMark'}],['사당 주술시종',34,10,4,3,'#9a5d78','mage','spirit',{concept57:"사당의 금기를 돌보는 시종이다.",ranged:true,range:7,role61:'controller'}],['혈인 원혼',30,12,2,7,'#74465f','void','spirit',{concept57:"핏빛 인장에 들러붙은 원혼이다.",ambush:true,multiAttack:true}]],
 earth_gauntlet:[['석분 권사',42,12,5,4,'#9b875d','human','construct',{concept57:"돌가루로 빚은 주먹이 멈추지 않는 권사다.",multiAttack:true,legendSkill47:'earthQuake'}],['붕락 갑병',51,13,8,1,'#817b68','brute','construct',{concept57:"무너진 성벽 같은 갑주를 걸친 병사다.",wallBreak:true,knockback:true,role61:'shell'}],['토맥 괴수',56,14,7,1,'#786c55','brute','beast',{concept57:"땅속의 맥을 따라 웅크리고 있던 거수다.",heavyHit57:true,legendSkill47:'earthQuake'}]],
 mirror_blade:[['반영 검객',38,13,4,7,'#879aa8','human','spirit',{concept57:"칼날보다 반사된 모습이 먼저 움직이는 검객이다.",fast:true,legendSkill47:'mirrorStep'}],['거울 시녀',33,11,3,5,'#b29aaf','mage','spirit',{concept57:"거울궁에 비친 손님을 오래 바라보는 시녀다.",ranged:true,range:7,gaze:true}],['파편 망령',31,12,3,6,'#91a6b0','angel','undead',{concept57:"깨진 거울의 날카로운 조각들이 망자의 윤곽을 이룬다.",ranged:true,range:7,multiAttack:true}]],
 curse_spear:[['부패 창병',49,14,6,3,'#725c69','guard','undead',{concept57:"썩은 갑옷 아래 창을 놓지 않은 병사다.",reach:3,role61:'formation'}],['묘문 사제',43,13,4,5,'#84687e','mage','undead',{concept57:"묘문에서 혼백을 거두는 사제다.",ranged:true,range:8,summoner:true,summonName57:'금령',legendSkill47:'graveDrain'}],['혼백 사냥꾼',39,15,3,7,'#5e526b','human','spirit',{concept57:"희미한 발소리로 사냥감을 따라붙는 영체다.",fast:true,ambush:true,focusDrain:2}]],
 lava_bow:[['월화 궁수',44,15,4,4,'#b54222','human','construct',{concept57:"붉은 두건과 주황빛 월화를 두른 수목 궁수의 이형이다.",ranged:true,range:9,lava:true,projectileImpact57:{element:'fire',radius:2,turns:3}}],['재의 감시자',37,13,2,8,'#8c756b','angel','spirit',{concept57:"재가 흩날리는 상공을 떠도는 감시령이다.",flying:true,ranged:true,range:8,role61:'alarm'}],['용암 살라맨더',54,16,5,4,'#c05d39','beast','beast',{concept57:"불길을 뒤집어쓴 날랜 살라맨더다.",lava:true,fast:true,fireTrail:true}]],
 chain_sickle:[['쇠사슬 간수',55,15,7,2,'#81705e','guard','human',{concept57:"쇠사슬 감옥의 길목을 지키는 간수다.",hook:true,role61:'formation'}],['족쇄 인형',58,14,9,1,'#706b64','armor','construct',{concept57:"족쇄와 철판을 겹겹이 두른 감옥의 인형이다.",role61:'shell'}],['갈고리 죄수',42,16,3,6,'#75564e','human','undead',{concept57:"죽어서도 갈고리를 놓지 못한 죄수다.",fast:true,hook:true,legendSkill47:'chainRush'}]],
 ward_hammer:[['파성 갑병',62,16,9,2,'#9a835d','guard','construct',{concept57:"성문을 허물 만큼 무거운 무장을 갖춘 병사다.",role61:'formation'}],['성벽 포수',49,16,6,2,'#7c7263','armor','construct',{concept57:"성벽과 한몸처럼 버티는 포격 인형이다.",ranged:true,range:9,role61:'artillery'}],['금단 수호상',74,17,11,0,'#b19a64','brute','construct',{concept57:"금지된 성소의 입구를 지키는 거대한 상이다.",heavyHit57:true,role61:'shell',legendSkill47:'wardPulse'}]]
};

function mobDefs47(id){return(DUNGEON_MOBS47[id]||[]).map(([name,hp,atk,def,eva,color,shape,kind,extra])=>({name,hp,atk,def,eva,xp:Math.max(9,Math.round(hp*.34)),color,shape,kind,...extra,legendMob47:true,legendDungeon47:id}))}





function handlePortalAt46(x,y){if(!WorldTransition57.allowed())return false;if(state.artifactDungeon46&&state.artifactExit46?.x===x&&state.artifactExit46?.y===y){cancelAutoWalk?.();burst(x,y,'#f0cc84',18,.9);return LegendaryDungeonBuilder.restore()}if(state.artifactPortal46?.x===x&&state.artifactPortal46?.y===y){cancelAutoWalk?.();burst(x,y,'#f0cc84',18,.9);return LegendaryDungeonBuilder.enter(state.artifactPortal46.id)}return false}

function resetPortal46(){if(state&&!state.artifactDungeon46)state.artifactPortal46=null}

registerGenerationStage('artifact-reset46','pre',resetPortal46);registerGenerationStage('artifact-portal46','post',maybePortal46);

function cursedEquipped47(){const p=state?.player;if(!p)return 0;return['armor','cloak','relic','trinket'].reduce((n,k0)=>n+((p[k0]?.curse991||p[k0]?.curseActive991)?1:0),0)}
function atkBonus47(){return equipped47('curse_blade')?cursedEquipped47()*3:0}


function syncEquip47(){const p=state?.player;if(!p)return;for(const it of [p.weapon,...(p.inventory||[]),...(state.items||[])]){if(!it?.legendaryWeapon47)continue;const d=adef46(it.artifactId46);if(d)for(const key of ['atk','speed','range','desc','armorPierce']){if(Object.prototype.hasOwnProperty.call(d,key))it[key]=d[key];else if(key==='armorPierce')delete it[key]}}const on=equipped47('curse_blade'),changed=on!==!!p.legendCurseActive47;p.legendCurseActive47=on;recomputeMaxHp(p);if(changed&&on)floatText(p.x,p.y,'최대 HP -30%','#b95c7c',10);if(!on){delete p.legendCurseBaseMax47;delete p.legendCurseCut47}if(!equipped47('earth_gauntlet'))p.legendEarthStacks47=0}
function guard47(elem){return elem==='fire'&&possesses47('ember_axe')}
function fireAbsorb47(){return possesses47('ember_axe')&&state?.player?.armor?.elementGuard74==='fire'}
function healFire47(n=1){n=Math.max(0,Math.round(Number(n)||0));if(!state||!fireAbsorb47())return 0;const p=state.player,b=p.hp;p.hp=Math.min(p.maxHp,p.hp+n);const g=p.hp-b;if(g>0)floatText(p.x,p.y,`화염흡수 +${g}`,'#ffb365',9);return g}
function fireField47(x,y,ttl=4,source=state.player){emitElementContact105('fire',elementCells105(x,y),effectSource57(source));state.legendFireFields47=state.legendFireFields47||[];if(!insideMapInterior(x,y)||tileBlocks(state.map[y][x]))return false;const provenance=effectSource57(source),q=state.legendFireFields47.find(f=>f.x===x&&f.y===y&&fieldProvenance57(f).sourceFaction===provenance.sourceFaction);if(q)q.ttl=Math.max(q.ttl,ttl);else state.legendFireFields47.push({x,y,ttl,born:state.turn,...provenance});return true}



function tempLava47(cx,cy){emitElementContact105('fire',elementCells105(cx,cy,1),effectSource57(state.player));for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const x=cx+dx,y=cy+dy;if(!insideMapInterior(x,y))continue;const old=state.map[y]?.[x];if(!(old>=500&&old<660&&(old-500)%16<4)&&![TT.FLOOR,TT.GRASS,TT.OPEN_DOOR,TT.WOOD_FLOOR,TT.MOON_STONE,TT.DARK_WOOD,TT.GILDED_FLOOR].includes(old))continue;if(state.artifactExit46?.x===x&&state.artifactExit46?.y===y)continue;RuntimeTerrainOwner.temporary(x,y,TT.LAVA,5,'legend-lava',{allowedOld:[old],source:'lava-bow47'})}burst(cx,cy,'#f06f33',30,1.2)}
function resurrect47(mon,pos){if(!mon||mon.kind==='undead'||mon.boss||mon.miniBoss||globalThis.__MANRU_RANDOM57__()>=.62)return false;const ally={name:`타락한 ${mon.name}`,x:pos.x,y:pos.y,hp:Math.max(5,Math.round((mon.maxHp||20)*.65)),maxHp:Math.max(5,Math.round((mon.maxHp||20)*.65)),atk:Math.max(2,Math.round((mon.atk||6)*.25)),def:Math.max(0,Math.round((mon.def||0)*.80)),eva:Math.max(0,Math.round((mon.eva||0)*.55)),xp:0,color:'#76517c',shape:mon.shape||'undead',kind:'undead',faction57:'player',friendly47:true,spawnProvenance57:'resurrection',legendAlly47:true,allyId53:`ally-${state.turn}-${state.nextAllyId53=(state.nextAllyId53||0)+1}`,allyBornTurn47:state.turn,allyExpireTurn47:state.turn+24,ttl47:24,alerted:true,weakened:0};if(!OccupancyService.isOccupied(pos.x,pos.y)&&!tileBlocks(state.map[pos.y]?.[pos.x]))OccupancyService.addMonster(ally);else{const q=DIRS8.map(([dx,dy])=>({x:pos.x+dx,y:pos.y+dy})).find(q=>PlacementService.monsterCanStand(ally,q.x,q.y));if(q){ally.x=q.x;ally.y=q.y;OccupancyService.addMonster(ally)}else return false}burst(ally.x,ally.y,'#8f62a0',18,.8);addLog(`${mon.name}의 잔해가 타락한 언데드로 일어났다. 공격력은 원본의 일부뿐이다.`);return true}
registerPlayerAttackStageR('legendary47',(next,mon,bonus=0,...rest)=>{const w=state?.player?.weapon,id=w?.artifactId46;if(!w?.legendaryWeapon47)return next(mon,bonus,...rest);const hp0=mon?.hp??0,pos=mon?{x:mon.x,y:mon.y}:null,dist=mon?entityDistance57(mon,state.player):0,r=next(mon,bonus,...rest),hit=!!mon&&mon.hp<hp0;if(!hit)return r;const contact=weaponElement105(w);if(contact&&pos)emitElementContact105(contact,[pos],effectSource57(state.player),{baseDamage:Math.max(1,hp0-mon.hp),directTarget:mon});const dealt=Math.max(0,hp0-Math.max(0,mon.hp));if(id==='ember_axe'){state.player.legendEmberStacks47=Math.min(10,(state.player.legendEmberStacks47||0)+1);floatText(state.player.x,state.player.y,`낙화 ${state.player.legendEmberStacks47}/10`,'#e99a5e',8);if(state.player.legendEmberStacks47>=10){state.player.legendEmberStacks47=0;skyAxe47()}}else if(id==='thunder_spear')chain47(mon,2,2);else if(id==='earth_gauntlet'){state.player.legendEarthStacks47=Math.min(8,(state.player.legendEarthStacks47||0)+1);state.player.legendEarthHitTurn47=state.turn+1;floatText(state.player.x,state.player.y,`지맥 ${state.player.legendEarthStacks47}/8`,'#d5b773',8)}else if(id==='mirror_blade'){const o=(state.monsters||[]).filter(m=>m!==mon&&isHostileTarget57(m)&&entityDistance57(m,mon)<=3).sort((a,b)=>entityDistance57(a,mon)-entityDistance57(b,mon))[0];if(o){const d=damageEntity(o,Math.max(2,Math.floor(dealt*.35)),state.player);projectileFX(mon.x,mon.y,o.x,o.y,'#d3c4ef');if(d>0)floatText(o.x,o.y,`반영 -${d}`,'#dccbf5',10);if(o.hp<=0)killMonster(o)}}else if(id==='chain_sickle'&&mon.hp>0&&dist>=2)pull47(mon);else if(id==='ward_hammer'){state.player.legendWardHits47=(state.player.legendWardHits47||0)+1;if(state.player.legendWardHits47>=3){state.player.legendWardHits47=0;state.status.ward=Math.max(state.status.ward||0,4);floatText(state.player.x,state.player.y,'진문 수호 3턴','#e9d79a',10)}}if(mon.hp<=0&&pos){if(id==='curse_spear')resurrect47(mon,pos);else if(id==='lava_bow')tempLava47(pos.x,pos.y)}return r});

globalThis.__MANRU_TURN_PIPELINE__.register('legendary47',{pre:()=>{syncEquip47()},post:()=>{if(!state)return;syncEquip47();const p=state.player;if(equipped47('earth_gauntlet')&&(p.legendEarthStacks47||0)>0&&p.legendEarthHitTurn47!==state.turn)p.legendEarthStacks47=Math.max(0,p.legendEarthStacks47-1);tickLegendFields();state.legendSkyAxes47=(state.legendSkyAxes47||[]).filter(a=>performance.now()-a.t<a.ttl)}});




globalThis.__MANRU_DRAW_HOOKS_R19__?.world.push({id:'legendary47',draw:drawLegendWorld});

function claimAudit46(){const ids=new Set();for(const it of[state?.player?.weapon,...(state?.player?.inventory||[])])if(it?.artifactId46)ids.add(it.artifactId46);if(state&&ids.has('water_crossbow')){state.artifactHistory46||=[];if(!state.artifactHistory46.some(h=>h.id==='water_crossbow'&&h.status==='claimed'))state.artifactHistory46.push({id:'water_crossbow',status:'claimed',floor:9,source:[state.player.weapon,...state.player.inventory].some(i=>i?.artifactId46==='water_crossbow'&&i.palaceReward105)?'palace':'legacy',turn:state.turn});}if(state)state.artifactClaimed46=[...new Set([...(state.artifactClaimed46||[]),...ids])];const plan=state?.branchWorld105?.citadel105?.relicPlan105;if(plan&&ids.has(plan.realId))plan.claimed=true;}
globalThis.__MANRU_TURN_PIPELINE__.register('artifact-claim46',{post:claimAudit46});
function mapSignature46(){if(!state?.map)return null;let h=2166136261>>>0,counts={};for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){const v=state.map[y]?.[x]??-1;counts[v]=(counts[v]||0)+1;h^=((v+257)*131+x*17+y*31)>>>0;h=Math.imul(h,16777619)>>>0}return{hash:h>>>0,counts}}




function claimReward46(){const r=state?.artifactReward46;if(!r)return false;state.player.x=r.x;state.player.y=r.y;resetVisualState();VisibilityService.compute();pickupBaseR25();claimAudit46();return{owned:[state.player.weapon,...state.player.inventory].filter(Boolean).filter(i=>i.legendaryWeapon47).map(i=>i.name),left:(state.items||[]).filter(i=>i.legendaryWeapon47).length}}




const API47={gatekeeper:applyLegendGatekeeper47,mobCatalog:()=>Object.keys(DUNGEON_MOBS47).flatMap(mobDefs47),version:'R49',enemyDefinitions:id=>mobDefs47(id).map(d=>({...d})),build:(id,seed,quiet=true)=>LegendaryDungeonBuilder.build(adef46(id),{seed,quiet}),integrity:()=>GenerationValidator.legendary(),assets:()=>legendAssetAudit(),defs:()=>LEGENDS47.map(a=>({...a})),debugKeys:()=>{const zs=state?.legendSanctums47||[];return{dungeon:state?.artifactDungeon46?.id||null,player:state?.player?{x:state.player.x,y:state.player.y}:null,sanctums:structuredClone(zs),plan:structuredClone(state?.keyPlan96||null),reward:state?.artifactReward46?{...state.artifactReward46}:null,mapAround:zs.map(z=>{const rows=[];for(let yy=z.cy-z.r-1;yy<=z.cy+z.r+1;yy++){const row=[];for(let xx=z.cx-z.r-1;xx<=z.cx+z.r+1;xx++)row.push(state.map?.[yy]?.[xx]??null);rows.push(row)}return{keyId:z.keyId,cx:z.cx,cy:z.cy,r:z.r,gate:z.gate,rows}})}},handlePortalAt:handlePortalAt46,enter:LegendaryDungeonBuilder.enter,restore:LegendaryDungeonBuilder.restore,forcePortal:forcePortal47,forceDungeon:(id=LEGENDS47[0].id)=>LegendaryDungeonBuilder.enter(id),reveal:()=>{if(!state?.artifactDungeon46)return false;state.seen=new Set();state.visible=new Set();for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){VisibilityService.rememberKey(k(x,y));VisibilityService.addVisibleKey(k(x,y))}updateAll();return true},keyAudit:()=>keyProgressAudit48(false),audit:()=>({floor:state?.floor,inDungeon:!!state?.artifactDungeon46,dungeon:state?.artifactDungeon46||null,portal:state?.artifactPortal46||null,exit:state?.artifactExit46||null,reward:state?.items?.filter(i=>i.legendaryWeapon47).map(i=>({name:i.name,x:i.x,y:i.y}))||[],owned:[state?.player?.weapon,...(state?.player?.inventory||[])].filter(Boolean).filter(i=>i.legendaryWeapon47).map(i=>i.name),reach:reachAudit46(),map:mapSignature46(),dims:[COLS,ROWS],monsters:state?.monsters?.filter(m=>!m.friendly47).length||0,legendMobs:state?.monsters?.filter(m=>m.legendMob47).map(m=>m.name)||[],decor:state?.legendDecor47?.length||0}),recordAcquisition:claimAudit46,claimReward:claimReward46,walkPortal:walkPortal46,walkReturn:walkReturn46,give:(id)=>{const a=adef46(id);if(!a||!state)return false;addInventoryItem({...clone(a),count:1});claimAudit46();return true},upgradeProbe:(id)=>{const a=clone(adef46(id)||LEGENDS47[0]);const before={atk:a.atk,upgrade:a.upgrade||0};const r=applyWeaponUpgrade(a);return{before,after:{atk:a.atk,upgrade:a.upgrade||0},result:r}},effectProbe:effectProbe47,regen:f=>{state.floor=clamp(+f||6,1,25);NormalFloorGenerator.generate();resetVisualState();VisibilityService.compute();updateAll();return{floor:state.floor,portal:state.artifactPortal46||null}},atkBonus:atkBonus47,critBonus:cursedBladeCritBonus,defBonus:earthGauntletDefBonus,syncEquip:syncEquip47,guard:guard47,fireAbsorb:fireAbsorb47,healFire:healFire47,allyTurn:alliesTurn,enemySpecial:enemySpecial47,owns:owns47,possesses:possesses47,claimed:claimed47,cursedEquipped:cursedEquipped47};
globalThis.__MANRU_LEGEND47__=API47;globalThis.__MANRU_ARTIFACT46__=API47;













/* 10.0.5 subbranches: canonical map producer, persistent world pages, terrain consumer. */


















































// Equipment phases belong to the combat actor, and use the same item art/time/damage owners as martial actors.
function updateEquipmentPhase105(mon){
 const phases=mon.weaponPhases105;if(!phases||mon.hp<=0)return;const ratio=mon.hp/mon.maxHp;let phase=phases[0];for(const p of phases)if(ratio<=p.ratio)phase=p;
 const def=phase.artifact?globalThis.__MANRU_LEGEND47__.defs().find(w=>w.id===phase.artifact):WEAPONS.find(w=>w.name===phase.weapon);if(!def)throw Error('Missing actor equipment');
 const owned=mon.inventory?.find(i=>i.type==='weapon'&&(phase.artifact?i.artifactId46===phase.artifact:i.name===phase.weapon)),previous=mon.weapon;
 if(owned)mon.weapon=owned;
 else if(mon.weapon?.name!==def.name){mon.weapon={...clone(def),type:'weapon'};if(phase.artifact)Object.assign(mon.weapon,{artifactId46:phase.artifact,legendaryWeapon47:true,artifactWeapon46:true});if(phase.elementBrand74)mon.weapon.elementBrand74=phase.elementBrand74;}
 if(previous&&previous.name!==mon.weapon.name)addLog(`${mon.name}이 ${def.name}로 무기를 바꿨다.`);
 syncEquipmentActor105(mon);
}














MONSTERS.push(PALACE_LOTUS105,PALACE_GARDENER105);







function polyPlanter105(q,c,ps){q.fillStyle=c;q.beginPath();ps.forEach(([x,y],i)=>i?q.lineTo(x,y):q.moveTo(x,y));q.closePath();q.fill();}





PALACE_KING_IMAGE105.onload=()=>{globalThis.__MANRU_ACTOR_ART__?.clear?.();if(state?.player)updateAll(false);};PALACE_KING_IMAGE105.src='data:image/png;base64,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';
PALACE_GARDENER_IMAGE105.onload=()=>{globalThis.__MANRU_ACTOR_ART__?.clear?.();if(state?.player)updateAll(false);};PALACE_GARDENER_IMAGE105.src='data:image/png;base64,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';




const BRANCH_INTERACTIVE_OVERLAYS105=new Set([TT.DOOR,TT.OPEN_DOOR,TT.LOCKED_GATE,TT.SWITCH,TT.KEY_TILE,TT.RUMOR,TT.BRAZIER,TT.TRAP,TT.ARMORY,TT.FOUNTAIN,TT.MIRROR,TT.ALTAR,TT.VAULT,TT.SNARE,TT.CACHE,TT.COOKPOT]);












function buildIndoorLandmark105(map,r,id){
 const w=r.w,h=r.h,cx=r.cx-r.x,cy=r.cy-r.y,kind=r.landmark105,flip=rand(0,1);r.landmarkFlip105=flip;
 const coord=(x,y)=>({x:r.x+(flip?w-1-x:x),y:r.y+y});
 const raw=(x,y,t)=>{const q=coord(x,y);setTerrainTile58(map,q.x,q.y,t);return q};
 // A dry perimeter and central crossing keep every potential graph port connected.
 const put=(x,y,t)=>{if(x<=1||y<=1||x>=w-2||y>=h-2||x===(flip?w-1-cx:cx)||y===cy)return;return raw(x,y,t)};
 const fill=(x,y,ww,hh,t)=>{for(let dy=0;dy<hh;dy++)for(let dx=0;dx<ww;dx++)put(x+dx,y+dy,t)};
 if(id==='canal'){
  if(kind==='split'){
   for(const y of [3,6,h-5]){for(let dy=0;dy<2;dy++)for(let x=2;x<w-2;x++)if(x!==4&&x!==w-5)put(x,y+dy,TT.WATER);}for(const x of [6,w-7]){put(x,5,TT.WALL);put(x,h-3,TT.RUMOR_GAS_PIPE);}
   for(const x of [4,w-5])for(const y of [4,h-4])put(x,y,TT.STONE_PILLAR);
   for(const [x,y]of[[2,5],[w-3,h-4]])put(x,y,TT.RUMOR_FLOOD_GRATE);
  }else if(kind==='settling'){
   fill(2,3,6,3,TT.WATER);fill(w-8,3,6,6,TT.WATER);fill(3,h-6,5,4,TT.WATER);fill(w-7,h-5,4,2,TT.WATER);
   for(const [x,y]of[[2,7],[w-3,10],[10,h-3]])put(x,y,TT.RUMOR_FLOOD_GRATE);
   for(const [x,y]of[[6,7],[w-6,h-4]])put(x,y,TT.STONE_PILLAR);
  }else if(kind==='drowned'){
   const cells=[];for(let y=3;y<=6;y++)for(let x=3;x<=7;x++){const q=raw(x,y,TT.WATER),t=x===5&&y!==5?TT.WALL:x===7&&y===3?TT.CRATE:TT.FLOOR;cells.push({...q,t,...(t===TT.CRATE?{underlay:TT.FLOOR}:{})});}
   r.landmarkReveal105={cells,switch:coord(3,2)};
   for(const x of [w-6,w-4]){fill(x,3,1,3,TT.WALL);put(x,h-4,TT.RUMOR_GAS_PIPE);}put(4,h-4,TT.RACK);
  }else if(kind==='moss'){
   for(let y=3;y<h-3;y++){put(3+(y>cy?1:0),y,TT.WATER);put(w-4-(y<cy?1:0),y,TT.WATER);}
   for(const [gx,gy]of[[5,3],[w-8,3],[5,h-6],[w-8,h-6]]){fill(gx,gy,3,3,TT.LIGHT_GRASS);for(const [dx,dy]of[[0,0],[2,2]])put(gx+dx,gy+dy,TT.HEDGE);put(gx+1,gy+1,TT.GARDEN_TREE);}
   for(const y of [3,h-5]){fill(2,y,2,2,TT.WATER);fill(w-4,y,2,2,TT.WATER);}

   put(2,h-4,TT.BENCH);put(w-3,3,TT.STONE_PILLAR);
  }else if(kind==='pump'){
   for(const x of [4,7,w-8,w-5])for(let y=3;y<h-3;y++)if(y!==(x===7?4:h-5))put(x,y,TT.WALL);
   for(let y=2;y<h-2;y++)put(cx+2,y,TT.WATER);
   for(const [x,y]of[[3,4],[6,h-4],[w-4,5]])put(x,y,TT.RUMOR_GAS_PIPE);
  }
 }else{
  if(kind==='stacks'){
   for(const x of [4,7,w-8,w-5])for(let y=3;y<h-3;y++)if(y!==(x===7?5:h-5))put(x,y,TT.WALL);
   for(const [x,y]of[[3,4],[6,h-4],[w-4,4],[w-4,h-4]])put(x,y,TT.RUMOR_SMUGGLER_BUNDLE);
   put(6,3,TT.CRATE);put(w-4,7,TT.CRATE);
  }else if(kind==='kitchen'){
   for(const [bx,by]of[[3,3],[w-7,4],[3,h-7],[w-7,h-6]]){for(let dx=0;dx<4;dx++)put(bx+dx,by,TT.WALL);for(let dy=1;dy<=2;dy++){put(bx,by+dy,TT.RUMOR_CHARRED_COUNTER);put(bx+3,by+dy,TT.RUMOR_CHARRED_COUNTER);}put(bx+1,by+1,TT.COOKPOT);}
   for(const x of [4,w-5])put(x,cy+1,TT.BENCH);
   for(const [x,y]of[[3,3],[w-4,6],[3,h-4]])put(x,y,TT.COOKPOT);
   put(w-4,h-4,TT.CRATE);put(6,h-4,TT.JAR);
  }else if(kind==='cold'){
   for(const x of [2,w-5])for(let y=3;y<h-3;y++)if(y!==5&&y!==h-6)for(let dx=0;dx<2;dx++)put(x+dx,y,TT.WATER);for(const y of [3,h-4])for(let x=5;x<w-5;x++)put(x,y,TT.WATER);
   for(const y of [4,7,h-5])for(const x of [6,w-7])put(x,y,TT.JAR);
   for(const [x,y]of[[7,5],[w-8,h-5],[6,h-4]])put(x,y,TT.STONE_PILLAR);
  }else if(kind==='tally'){
   for(const y of [5,h-6])for(let x=3;x<w-3;x++)if(x!==4&&x!==w-5)put(x,y,TT.WALL);
   for(const [bx,by]of[[3,3],[w-7,3],[3,h-4],[w-7,h-4]]){put(bx,by,TT.RUMOR_ARCHIVE_PILE);put(bx+1,by,TT.RUMOR_ARCHIVE_PILE);put(bx+2,by,TT.RACK);}
   for(const [x,y]of[[4,7],[w-5,7],[4,h-8],[w-5,h-8]])put(x,y,TT.RUMOR_CHARRED_COUNTER);
   put(w-4,3,TT.RUMOR_INVESTIGATION_BOARD);put(3,h-4,TT.RACK);put(w-4,7,TT.CRATE);
  }else if(kind==='rats'){
   const bx=w-8,by=3;for(let y=by;y<by+5;y++)for(let x=bx;x<bx+5;x++)raw(x,y,(x===bx||x===bx+4||y===by||y===by+4)?TT.WALL:TT.FLOOR);
   const qa=coord(bx,by),qb=coord(bx+4,by+4);r.landmarkRatBounds105={x:Math.min(qa.x,qb.x),y:by+r.y,w:5,h:5};r.landmarkRatDoor105=raw(bx+2,by+4,TT.DOOR);r.landmarkRatCells105=[coord(bx+1,by+2),coord(bx+3,by+2)];r.landmarkRatReward105=coord(bx+2,by+1);
   for(const y of [h-6,h-4])for(const x of [3,6,w-5])put(x,y,x===6?TT.WALL:TT.RUMOR_SMUGGLER_BUNDLE);
   for(let y=3;y<cy-1;y++)put(4,y,TT.CRATE);
  }
 }
 // The room centre is the existing generator's navigation anchor.
 setTerrainTile58(map,r.cx,r.cy,TT.FLOOR);
}























































































































































function equipmentOpeningBonus105(actor,target){const w=actor?.weapon||{};return (w.edgeBonus&&target?.maxHp>0&&target.hp/target.maxHp>=.75?4:0)+(w.breakPower&&target?.kind==='construct'?Math.max(1,w.breakPower):0)}
















function debugBattleCatalog57(){
 const list=monsterSpeciesCatalog();
 list.push({def:storyInvestigatorDefinition(),group:'보스'},{def:PALACE_KING105,group:'보스'});
 const martial=(rank,style,final=false,pursuer=false)=>{const spec={rank,style,final,pursuer,level:final||pursuer?2:1},def=dojoCreateMartialist(rank,-1,style*10+rank,final,style,{level:spec.level,pursuer});if(!final)def.name=DOJO_STYLE_WEIGHTS105[style].name.split(' · ')[0]+' '+def.name;list.push({def,group:'무도가',dojo:spec});};
 for(let style=0;style<DOJO_STYLE_WEIGHTS105.length;style++){for(let rank=1;rank<=4;rank++)martial(rank,style);martial(4,style,false,true);}martial(4,5,true);
 const seen=new Set();return list.filter(e=>{if(seen.has(e.def.name))return false;seen.add(e.def.name);return true}).sort((a,b)=>a.def.name.localeCompare(b.def.name,'ko'));
}
function debugBattleMonster57(entry,floor,gatekeeper=false,preview=false){
 let mon;if(entry.dojo){const d=entry.dojo;mon=preview?clone(entry.def):dojoCreateMartialist(d.rank,-1,DEBUG_BATTLE57.serial+1,d.final,d.style,{level:d.level,pursuer:d.pursuer});mon.name=entry.def.name;}else mon=scaledMonster(clone(entry.def),floor,{inventory:!preview});
 if(mon.equipmentActor105)updateEquipmentPhase105(mon);if(gatekeeper)globalThis.__MANRU_LEGEND47__.gatekeeper(mon,floor);return mon;
}
































































let ANVIL_SESSION105=null;








ActionDispatcher.register('ANVIL_FUSE105',anvilFuse);








































function summonPlaceFollowers105(list){for(const mon of list){if(!summonActive(mon))continue;const q=PlacementService.findMonster(mon,{placementMode:'local',origin:state.player,radius:5});if(!q)throw Error('추종 소환체 착지 공간 부족');Object.assign(mon,q);const delta=state.floorTurn-(mon.summonTravelFloorTurn105??state.floorTurn);for(const key of ['nextSummonTurn57','nextAction54','nextShot54','corpseUntilFloorTurn57','reviveFullTurn57'])if(Number.isFinite(mon[key]))mon[key]+=delta;delete mon.summonTravelFloorTurn105;delete mon.allyLastActionRound57;delete mon.allyTargetId54;delete mon.allyLastSeenPosition54;delete mon.allySearchUntilTurn54;delete mon.intent54;delete mon.intent61;if(!OccupancyService.addMonster(mon))throw Error('추종 소환체 계약 불일치');}}




ActionDispatcher.register('SUMMON_CAST105',summonCast);
ActionDispatcher.register('SUMMON_PICTURE105',summonInstallPicture);
ActionDispatcher.register('SUMMON_TALISMAN105',summonBindTalisman);











function initSummon105(){summonUpdateButtons();}

initSummon105();
initDebugBattle57();
globalThis.__MANRU_DEBUG_BATTLE57__=Object.freeze({snapshot:()=>DEBUG_BATTLE57.open?{round:DEBUG_BATTLE57.round,watching:!!DEBUG_BATTLE57.watching,subject:DEBUG_BATTLE57.subjectId,playing:DEBUG_BATTLE57.playing,winner:DEBUG_BATTLE57.winner,catalog:DEBUG_BATTLE57.catalog.map(e=>({name:e.def.name,group:e.group})),units:state.monsters.map(m=>({id:m.debugId57,name:m.name,side:m.debugSide57,x:m.x,y:m.y,hp:m.hp,maxHp:m.maxHp,atk:m.atk,def:m.def,faction:entityFaction(m),cells:entityFootprintCells57(m),revive:m.revivePhase57})),debug:state.debugBattle57,map:{width:COLS,height:ROWS,rooms:state.rooms.length,tiles:[...new Set(state.map.flat())]},patterns:state.monsters.filter(m=>m.boss).map(m=>({id:combatantId(m),name:m.name,faction:entityFaction(m),intent:m.intent54?.type,core:m.coreStage54,links:m.silk54?.links.length})),owners:state.monsters.filter(m=>m.bossOwnerId57).map(m=>({name:m.name,owner:m.bossOwnerId57,faction:entityFaction(m),fixture:m.combatFixture54}))}:null});


