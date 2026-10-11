    const TRANSACTION='manru1004_transaction',TERMINAL_INTENT='manru1004_terminal_intent';
function aimMaximum(p=state.player){return 6+(p.martial.roar||0)-(martialFormOf('roar',p)==='divine'?1:0)}
const BOSSES={
  5:{name:'광견 대장',concept57:"객잔의 끝을 막아선 사나운 거구다.",hp:96,atk:11,def:5,eva:2,xp:45,color:'#5f504a',shape:'brute',kind:'beast',bossPattern:'houndboss'},
  10:{name:'화공 노인',concept57:"붓을 놓지 못한 늙은 화공의 그림에는 아직 숨이 붙어 있다.",hp:124,atk:13,def:4,eva:4,xp:55,color:'#718175',shape:'mage',kind:'spirit',ranged:true,range:7,bossPattern:'painter'},
  15:{name:'환각의 침모',concept57:"손님들의 그림자까지 꿰매는 내실의 침모다.",hp:196,balanceVersion57:2,definitionHp57:196,definitionHpHistory57:[156,240],atk:4,def:5,eva:5,xp:70,color:'#a87391',shape:'mage',kind:'spirit',ranged:true,range:10,armorPierce:true,needleAttackVersion54:1,bossPattern:'needle'},
  20:{name:'장고의 간수',concept57:"형틀과 쇠사슬을 제 몸처럼 다루는 장고의 문지기다.",hp:196,atk:16,def:8,eva:3,xp:90,color:'#81665b',shape:'brute',kind:'construct',bossPattern:'keeper'},
  25:{name:'객주 주인: 만루보주',concept57:"끝없이 이어진 객실을 다스리는 만루의 주인이다.",hp:240,atk:15,def:9,eva:5,xp:0,color:'#d5b56b',shape:'zero',kind:'spirit',ranged:false,range:4,bossPattern:'master'}
};
function monsterConcept(mon){const name=monsterSpeciesName(mon);return SPECIAL_MONSTER_CONCEPTS57[mon.name]||MONSTERS.find(d=>d.name===name)?.concept57||[...Object.values(BOSSES),PALACE_KING105].find(d=>d.name===name)?.concept57||((mon.legendMob47||mon.legendDungeon47)?globalThis.__MANRU_ARTIFACT46__?.enemyDefinitions?.(mon.legendDungeon47)?.find(d=>d.name===name)?.concept57:null)||mon.concept57||`${mon.name}. 정체를 알 수 없는 존재다.`}
let bossIntroTimer = null;
function entityFaction(entity){if(!entity)return'neutral';if(entity===state?.player)return'player';return entity.faction57||(entity.friendly47?'player':entity.sourceFaction||'hostile')}
function entityConcealed(entity){return !!(entity&&(entity.hidden||(entity===state?.player?playerConcealed58():entity.martialStatus105?.stealth>0)))}
function reflectRay(origin,target,kind='beam',damage=0,elem='holy'){
 if(!['beam','gaze'].includes(kind))return false;
 for(const q of combatLineCellsR8(origin.x,origin.y,target.x,target.y)){
  if(state.map[q.y]?.[q.x]===TT.MIRROR){elementAttackFx105('holy',[q],origin);projectileFX(q.x,q.y,origin.x,origin.y,'#96d6dd');
   if(kind==='gaze')setMonsterStatus(origin,'stunned',Math.max(origin.stunned||0,2));else if(origin.hp>0)resolveElementDamage57(origin,elem,damage,{contactHandled105:true,effect:{sourceFaction:'neutral',friendlyFire:true},source:'천면경 반사',color:'#96d6dd'});
   if(state.visible.has(k(q.x,q.y)))addLog('천면경이 빛을 되돌려 보냈다.');return true}
  if(tileBlocksSight(state.map[q.y]?.[q.x])||combatFieldBlocksSight57(q.x,q.y))break;
 }return false;
}
function jarGasAirPassable(x,y){if(!state||x<=0||y<=0||x>=COLS-1||y>=ROWS-1)return false;const t=state.map?.[y]?.[x];return t===TT.OPEN_DOOR||(!tileBlocks(t)&&t!==TT.DOOR)}
function jarGasDiagonalPass(x,y,nx,ny){const dx=nx-x,dy=ny-y;if(!dx||!dy)return true;return jarGasAirPassable(x+dx,y)||jarGasAirPassable(x,y+dy)}
function monsterPoisonImmune(mon){return !!(mon&&(mon.kind==='construct'||mon.poisonImmune||mon.poisonImmune57||mon.statusImmune||mon.cloak?.statusImmune||mon.armor?.elementGuard74==='grass'))}
function tickJarGasFields(){
  if(!state)return;const fields=jarGasState57();for(const f of fields){if(f.duration57&&state.turn<=f.bornTurn57)continue;f.age=(f.age||0)+1;if(f.age<=f.maxRadius&&f.frontier?.length){const next=[];for(const c of f.frontier){for(const[dx,dy]of DIRS8){const nx=c.x+dx,ny=c.y+dy,nd=c.d+1;if(nd>f.maxRadius||!jarGasAirPassable(nx,ny)||!jarGasDiagonalPass(c.x,c.y,nx,ny))continue;if(f.cells.some(v=>v.x===nx&&v.y===ny))continue;const nc=nd<=2?2:1,n=jarGasAddCell57(f,nx,ny,nd,nc,f.age);next.push(n)}}f.frontier=next}
    if(f.age>=(f.linger57?Math.max(5,(f.duration57||9)-2):5)){for(const c of f.cells)if(f.age-c.bornAge>=4)c.c=Math.max(0,c.c-1);f.cells=f.cells.filter(c=>c.c>0);f.frontier=(f.frontier||[]).filter(c=>c.c>0)}
  }
  state.jarGasFields57=fields.filter(f=>(f.cells||[]).length&&f.age<(f.duration57||9));applyJarGasEffects57()
}
function forcedJarAccident(x,y){
 if(globalThis.__MANRU_RANDOM57__()>=.22)return null;const mon=scaledMonster(MONSTERS.find(m=>m.name==='지네'),branchCombatFloor()),q=PlacementService.findMonster(mon,{placementMode:'local',origin:{x,y},radius:2,reachable:true,safe:true});if(!q)return null;Object.assign(mon,q);mon.alerted=true;mon.spawnProvenance57='jar-accident';if(!OccupancyService.addMonster(mon))return null;addLog('깨진 장독에서 지네가 튀어나왔다.');return mon;
}
function entityDistanceAt(entity,x,y,target){if(!entity||!target||![x,y,target.x,target.y].every(Number.isFinite))return Infinity;const a=entity===state?.player?FOOTPRINT_OFFSETS57.one:footprintOffsets(entity),b=target===state?.player?FOOTPRINT_OFFSETS57.one:footprintOffsets(target);let best=Infinity;for(const[ax,ay]of a)for(const[bx,by]of b)best=Math.min(best,Math.max(Math.abs(x+ax-target.x-bx),Math.abs(y+ay-target.y-by)));return best}
function ordinaryEnemyWeight(def){if(state.branchContext105||state.artifactDungeon46)return 1;return state.floor===1&&def.name==='시종'?.65:state.floor===2&&def.name==='객잔 경비병'?.8:1}
function ordinaryEnemyPick(defs){let roll=globalThis.__MANRU_RANDOM57__()*defs.reduce((n,d)=>n+ordinaryEnemyWeight(d),0);for(const d of defs){roll-=ordinaryEnemyWeight(d);if(roll<0)return d;}return defs.at(-1)}
function scaledMonster(def,combatFloor=branchCombatFloor(),opts={}){
  // Fixed-stat species retain V18 stats, including summons; preview only skips loot creation.
  const within=(combatFloor-1)%5,depth=combatFloor>=6?Math.floor((combatFloor-6)/5)+1:0,scale=(1+within*.045)*(depth?1.25+depth*.075:1),atkScale=(1+within*.025)*(depth?1.15+depth*.05:1),defBonus=depth?Math.ceil(depth*.75):0,fixed=!!(def.fixedStats57||(def.boss&&(opts.debugBattle??state?.debugBattle57)));
  const mon={name:def.name,monsterSpecies105:monsterSpeciesName(def),hp:fixed?def.hp:Math.round(def.hp*scale),maxHp:fixed?def.hp:Math.round(def.hp*scale),atk:fixed?def.atk:Math.round(def.atk*atkScale),def:fixed?def.def:def.def+defBonus,eva:def.eva,xp:def.xp,color:def.color,shape:def.shape,kind:def.kind,ranged:def.ranged||false,range:def.range||6,reach:def.reach||1,weakened:0,alerted:false,hasSeenPlayer105:false,lostSight:0,...Object.fromEntries(Object.entries(def).filter(([k])=>!['min','max','hp','atk','def','eva','xp','color','shape','kind','name'].includes(k)))};
  mon.combatFloor105=combatFloor;mon.combatScalingRevision105=1;
  if(mon.equipmentActor105){mon.baseAtk=fixed?def.baseAtk:Math.round(def.baseAtk*atkScale);mon.baseDef=fixed?def.baseDef:def.baseDef+defBonus;}
  if(mon.bossPattern==='palaceKing105'&&opts.inventory!==false)palaceKingInventory(mon);return globalThis.__MANRU_AI61__?.configure(mon)||mon;
}
function pickByTier(arr,tier){const pool=arr.filter(x=>(x.tier||1)<=tier);return clone(choice(pool.length?pool:arr))}
function findMonsterAt(x,y){return state.monsters.find(m=>m.hp>0&&monCovers(m,x,y))||null}
function combatBlinkActive(entity){return !!entity&&Number.isFinite(entity.combatBlinkTurn57)&&state.turn>=entity.combatBlinkTurn57&&state.turn-entity.combatBlinkTurn57<=1;}
function aquaticStranded(mon){const tile=state?.map?.[mon?.y]?.[mon?.x];return !!(mon?.aquatic&&!mon.flying&&tile!=null&&!runtimeTerrainSolid57(tile)&&!globalThis.__MANRU_HAZARD_CORE__?.kind?.(tile)&&!PlacementService.terrainStandable(mon,tile))}
function setMonsterStatus(mon,key,value,source=null,opts={}){
 if(!mon||mon.statusImmune||mon.cloak?.statusImmune)return 0;if(!opts.resistanceHandled105&&mon.martialActor105&&key==='stunned'&&mon.cloak?.staggerResist&&globalThis.__MANRU_RANDOM57__()<mon.cloak.staggerResist)return 0;
 if(!opts.resistanceHandled105&&mon.martialActor105&&key==='stunned'&&value>0&&combatTargetValid57(source,mon)&&globalThis.__MANRU_RANDOM57__()>=hostileStatusChance(1,mon.will||0))return 0;
 if(key==='poisoned57')mon.poisonSource57=source&&value>0?effectSource57(source):null;
 if(key==='bleeding55')mon.bleedSource57=source&&value>0?effectSource57(source):null;
 if(key===STATUS_META57.illness.monsterField57)mon.illnessSource105=source&&value>0?effectSource57(source):null;
 if(mon.martialActor105&&key==='stunned'&&value>0)dojoRememberHit(mon,'control');mon[key]=value;return value;
}
function setMonsterWeakened(mon,turns){if(!mon||mon.statusImmune||mon.cloak?.statusImmune||turns<=0)return false;if(mon.martialActor105)dojoRememberHit(mon,'control');mon.weakened=Math.max(mon.weakened||0,turns);mon.weakenedTurn57=state?.turn??0;return true}
function setMonsterBuff(mon,amount,turns){if(!mon||turns<=0)return false;if((mon.buff||0)<(amount||0))mon.buff=amount||0;if((mon.buffTurns61||0)<turns)mon.buffTurns61=turns;mon.buffTurn57=state?.turn??0;return true}
function tickMonsterCombatStatuses(){
  for(const m of [...state.monsters]){for(const meta of Object.values(STATUS_META57))if(meta.legacyMonsterField57&&m[meta.legacyMonsterField57]!=null){m[meta.monsterField57]=Math.max(m[meta.monsterField57]||0,m[meta.legacyMonsterField57]||0);delete m[meta.legacyMonsterField57]}if(m.poison74>0){m.poisoned57=Math.max(m.poisoned57||0,m.poison74);m.poison74=0;}if(m.armor?.elementGuard74==='grass')m.poisoned57=m.poison74=0;if(m.armor?.elementGuard74==='water'&&state.turn%2===0){m.poisoned57=Math.max(0,(m.poisoned57||0)-1);m.bleeding55=Math.max(0,(m.bleeding55||0)-1)}if(m.illness105>0&&m.illnessBorn105!==state.turn&&--m.illness105===0){resolveCombatIllness(m);if(m.hp<=0)continue}if(m.poisoned55>0){m.poisoned57=Math.max(m.poisoned57||0,m.poisoned55);delete m.poisoned55}if(m.blinded55>0)m.blinded55--;if(m.bleeding55>0&&m.hp>0){m.bleeding55--;damageEntity(m,combatDebuffDamage(m,'bleed'),m.bleedSource57);if(m.hp<=0)killMonster(m)}}
  for(const m of [...state.monsters])if(m.hp>0&&(m.poisoned57||0)>0){const damage=damageEntity(m,combatDebuffDamage(m,'poison'),m.poisonSource57);m.poisoned57--;if(m.poisoned57<=0)m.poisonSource57=null;if(damage>0)floatText(m.x,m.y,`독 -${damage}`,'#94c779',10);if(m.hp<=0)killMonster(m)}
}
function tickMonsterDurations(){if(!state)return;for(const m of [...(state.monsters||[])]){tickKeeperLava54(m);globalThis.__MANRU_ITEM_IDENTITY991__?.tickCurses?.(m);if(m.upset>0)m.upset--;if(m.drunk>0)m.drunk--;if(m.skillSeal105>0)m.skillSeal105--;if((m.weakened||0)>0){if(!Number.isFinite(m.weakenedTurn57))m.weakenedTurn57=state.turn;else if(m.weakenedTurn57<state.turn){m.weakened=Math.max(0,m.weakened-1);m.weakenedTurn57=state.turn}}if((m.buffTurns61||0)>0){if(!Number.isFinite(m.buffTurn57))m.buffTurn57=state.turn;else if(m.buffTurn57<state.turn){m.buffTurns61=Math.max(0,m.buffTurns61-1);m.buffTurn57=state.turn;if(m.buffTurns61<=0)m.buff=0}}else if((m.buff||0)>0&&Number.isFinite(m.buffTurn57)&&m.buffTurn57<state.turn)m.buff=0}}
function monsterRewardPolicy(mon){if(state?.debugBattle57)return{xp:false,drops:false,kills:false};if(!mon||!factionsHostile57(entityFaction(state?.player),entityFaction(mon)))return{xp:false,drops:false,kills:false};const p=mon?.rewardPolicy57;if(p)return{xp:p.xp!==false,drops:p.drops!==false,kills:p.kills!==false};const deny=NON_REWARDING_SPAWN_PROVENANCE57.has(mon?.spawnProvenance57);return{xp:!deny,drops:!deny,kills:!deny}}
function knockMonster(mon,steps=1){if(!state||!mon||mon.hp<=0)return false;steps=mon.boss?Math.min(1,steps):steps;const f=state.player.facing||{x:0,y:-1},source={x:mon.x-f.x,y:mon.y-f.y};return resolveForcedMovement57(mon,source,steps,{mode:'push',hostile:true,creditPlayer:true}).moved>0}
function entityCombatLineCheckR(attacker,target,opts={}){
  const starts=entityFootprintCells57(attacker),ends=entityFootprintCells57(target),pairs=[];for(const a of starts)for(const b of ends)pairs.push({a,b,d:Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y))});pairs.sort((u,v)=>u.d-v.d);let best={ok:false,reason:'유효한 공격 사선이 없다.',dist:pairs[0]?.d??Infinity};
  for(const q of pairs){const r=combatLineCheckR8(q.a.x,q.a.y,q.b.x,q.b.y,{...opts,attacker,ignore:opts.ignore||target});if(r.ok)return{...r,fromX:q.a.x,fromY:q.a.y,toX:q.b.x,toY:q.b.y};if(r.dist<=best.dist)best={...r,fromX:q.a.x,fromY:q.a.y,toX:q.b.x,toY:q.b.y}}
  return best
}
function setMonsterAttackInvestigation(mon,source=state?.player){
  if(!state||!mon||mon.hp<=0||!source||![mon.x,mon.y,source.x,source.y].every(Number.isFinite))return false;
  const dx=source.x-mon.x,dy=source.y-mon.y;if(!dx&&!dy)return false;
  const distance=entityDistance57(mon,source);
  mon.alerted=true;
  // A hit reveals only the incoming line as an investigation waypoint; it does not count as visual contact.
  mon.attackInvestigation57={x:mon.x+Math.sign(dx)*Math.min(3,distance),y:mon.y+Math.sign(dy)*Math.min(3,distance),dx:Math.sign(dx),dy:Math.sign(dy),bornTurn:(state.floorTurn||0)+.5};
  mon.searchTurns=Math.max(mon.searchTurns||0,Math.min(18,Math.max(7,distance+5)));
  mon.lostSight=0;
  return true;
}
function monsterAttackLineR(mon,range,context={}){const target=context.target||state?.player;if(!combatTargetValid57(mon,target))return{ok:false,reason:'invalid-target'};const area=['area','hazard'].includes(context.delivery);if(target===state.player&&playerConcealed58()&&!context.fixedArea58&&!area)return{ok:false,reason:'concealed-target'};const origin=area&&Number.isInteger(context.origin57?.x)&&Number.isInteger(context.origin57?.y)?context.origin57:mon;return entityCombatLineCheckR(origin,target,{range,ignore:target,units:!area})}
function monsterIsEvil(mon){
  return ["undead","eldritch","mutant"].includes(mon.kind);
}
function setMonsterAttackBaseR(id,fn){if(typeof fn!=='function')throw new TypeError('monster attack base must be a function');MANRU_ATTACK_PIPELINE_R.monsterBase={id,fn};return fn}
function monsterAttackContextR(context={}){
  const src=context&&typeof context==='object'&&!Array.isArray(context)?context:{};
  const delivery=['melee','ranged','area','hazard'].includes(src.delivery)?src.delivery:'melee',projectile=src.projectile??delivery==='ranged',reflectable=src.reflectable??projectile;
  return{...src,delivery,projectile:!!projectile,reflectable:!!reflectable,range:Number.isFinite(src.range)?Math.max(0,src.range):10};
}
function monsterAttackResultR(mon,context={},patch={}){
  const ctx=monsterAttackContextR(context),attackerAlive=patch.attackerAlive??!!(mon&&(mon.hp??1)>0),blocked=!!patch.blocked,interrupted=!!patch.interrupted||!attackerAlive;
  const result={attempted:patch.attempted!==false,hit:!!patch.hit,damage:Math.max(0,Number(patch.damage)||0),reflected:!!patch.reflected,reflectedDamage:Math.max(0,Number(patch.reflectedDamage)||0),parried:!!patch.parried,evaded:!!patch.evaded,blocked,interrupted,attackerAlive,reason:patch.reason||null,delivery:ctx.delivery,projectile:ctx.projectile,reflectable:ctx.reflectable};
  result.continueBundle=attackerAlive&&!interrupted&&!blocked&&runState57()==='playing';return result;
}
function monsterAttackCanContinueR(result){return !!(result?.continueBundle&&result.attackerAlive&&!result.interrupted&&!result.blocked&&runState57()==='playing')}
function attackMonster(mon,bonus=0,context={}){const ctx=monsterAttackContextR(context),target=ctx.target||state?.player;ctx.target=target;if(!mon||!state||!combatTargetValid57(mon,target))return monsterAttackResultR(mon,ctx,{attempted:false,blocked:true,reason:'inactive'});const line=monsterAttackLineR(mon,ctx.range,ctx);if(!line.ok)return monsterAttackResultR(mon,ctx,{attempted:false,blocked:true,reason:line.reason||'line-blocked'});markCombatActivity57('monster-attack');const own=!RuntimeState.martialDamageBundle1005;if(own)RuntimeState.martialDamageBundle1005={id:++state.martialDamageSequence,revived:false,guardHit:false};try{const ready=ctx.delivery==='melee'?(mon.strongReady||0):0,stealth=mon.martialStatus105?.stealth>0;if(target===state.player)mon.hasSeenPlayer105=true;let result;if(target===state.player&&movementDiscoveryEvades105(mon,ctx)){mon.attackUntil=performance.now()+150;mon.attackTarget={x:state.player.x,y:state.player.y};floatText(state.player.x,state.player.y,'회피','#c7b58f',10);addLog(`${mon.name}의 첫 발견 공격을 피했다.`);result=monsterAttackResultR(mon,ctx,{hit:false,evaded:true,reason:'first-sight-movement'});}else result=runAttackStagesR('monster',[mon,bonus+equipmentOpeningBonus105(mon,target)+(ready?strongBonus(ready)-(martialFormOf('strong',mon)==='drive'?2:0):0),ctx]);if(result.hit&&result.damage>0)applyWeaponBrandHit(mon,target,result.damage,entityFootprintCells57(target),ctx);finishMartialStrike(mon,target,result,ready,stealth,ctx);if(target!==state.player&&target.hp<=0)killMonster(target);return result}finally{if(own){if(RuntimeState.martialDamageBundle1005.guardHit)consumeMartialGuard(state.player);for(const guarded of RuntimeState.martialDamageBundle1005.guardTargets105||[])consumeMartialGuard(guarded);RuntimeState.martialDamageBundle1005=null}}}
function combatDepth(actor){return Math.max(1,Number(actor?.debugFloor57)||branchCombatFloor()||state?.floor||1)}
function attackMonsterInitialCoreR(mon,bonus=0,context={}){
 const ctx=monsterAttackContextR(context),target=ctx.target||state.player,player=target===state.player;
 if(!combatTargetValid57(mon,target))return monsterAttackResultR(mon,ctx,{attempted:false,blocked:true,reason:'invalid-target'});
 mon.attackUntil=performance.now()+150;mon.attackTarget={x:target.x,y:target.y};const st=combatEntityStats(target),attackStats=combatEntityStats(mon),cloak=player?playerCloak():(target.cloak||{});
 if(globalThis.__MANRU_ASURA61__?.blocksDirect?.(target,mon))return monsterAttackResultR(mon,ctx,{blocked:true,reason:'asura-domain'});
 if(combatGuardBlocks57(mon,target))return monsterAttackResultR(mon,ctx,{blocked:true,reason:'guard'});
 if(ctx.reflectable&&cloak.reflect&&globalThis.__MANRU_RANDOM57__()<cloak.reflect){const reflectedBase=Math.max(2,Math.floor(mon.atk*(Number(ctx.atkScale)||1)*.65)),rd=ctx.damageElement105?resolveElementDamage57(mon,ctx.damageElement105,reflectedBase,{effect:effectSource57(target),source:'반사된 공격',ground:!!ctx.ground105,logDamage57:false}).damage:damageEntity(mon,reflectedBase,target);if(state.floor>=11)alertNearby(mon.x,mon.y,6,'projectile');projectileFX(target.x,target.y,mon.x,mon.y,'#d9c8a4');addLog(`${cloak.name||target.name}이 ${mon.name}의 공격을 되돌렸다.${rd>0?' -'+rd:''}`);const alive=mon.hp>0;if(!alive)killMonster(mon);return monsterAttackResultR(mon,ctx,{hit:false,reflected:true,reflectedDamage:rd,attackerAlive:alive,interrupted:!alive,reason:'reflected'})}
 if(globalThis.__MANRU_RANDOM57__()<entityAttackMissChance(mon,target,{base:.06,max:.52,evaIgnore:ctx.projectile&&mon.weapon?.tracking?6:0})){floatText(target.x,target.y,'회피','#c7b58f',10);return monsterAttackResultR(mon,ctx,{hit:false,evaded:true,reason:'evaded'})}
 const guard=target.guardReady1005||0;if(guard>0){if(player)RuntimeState.martialDamageBundle1005.guardHit=true;martialFx('guard',target)}
 const defenseBonus=player?guard:combatDefenseBonus(target),w=mon.weapon||{},holy=(w.holy||0)&&['spirit','undead'].includes(target.kind)?w.holy:0,holyBrand=w.elementBrand74==='holy'&&target.kind==='undead'?5:0,atk=(attackStats.atk||0)*Math.max(0,Number(ctx.atkScale)||1)+bonus+(mon.buff||0)+holy+holyBrand;
 let dmg=damageFormula(atk,st.def||0,globalThis.__MANRU_RANDOM57__()<(.05+(w.crit||0)),{defenseBonus,defenseScale:mon.armorPierce||w.armorPierce?.25:1});if(mon.kind==='undead'&&target.armor?.elementGuard74==='holy')dmg=Math.max(1,Math.round(dmg*.85));
 dmg=ctx.damageElement105?resolveElementDamage57(target,ctx.damageElement105,dmg,{effect:effectSource57(mon),ground:!!ctx.ground105,source:mon.name,color:ELEMENT_FX_COLORS105[ctx.damageElement105],impact:false,logDamage57:false}).damage:damageEntity(target,dmg,mon,null,{delivery:ctx.delivery});if(!player&&guard>0){const bundle=RuntimeState.martialDamageBundle1005;if(bundle)(bundle.guardTargets105||(bundle.guardTargets105=new Set())).add(target);else consumeMartialGuard(target);}
 if(state.floor>=11&&ctx.delivery!=='area'&&ctx.delivery!=='hazard')alertNearby(target.x,target.y,ctx.projectile?6:5,ctx.projectile?'projectile':'combat',dmg);
 if(player){state.playerHitUntil=performance.now()+130;vfVibrate(HAPTIC_PATTERN57.hurt)}else target.hitUntil=performance.now()+130;
 if(!player&&target.martialActor105&&ctx.projectile)dojoRememberHit(target,'ranged');
 impact(target.x,target.y,'#d85f68',4);if(dmg>0&&!ctx.damageElement105)floatText(target.x,target.y,'-'+dmg,'#ff777f',13);addLog(`${state.debugBattle57&&mon.debugId57!=null?mon.debugSide57+mon.debugId57+' ':''}${mon.name} → ${state.debugBattle57&&target.debugId57!=null?target.debugSide57+target.debugId57+' ':''}${target.name}: ${dmg}`);
 if(dmg>0)applyMonsterAttackStatus57(mon,target,{damage:dmg,delivery:ctx.delivery});
 if(dmg>0&&combatDepth(mon)>=16&&mon.kind==='undead'&&['melee','ranged'].includes(ctx.delivery))globalThis.__MANRU_ITEM_IDENTITY991__?.hostileHit?.(target);
 if(player&&target.hp<=0)die(mon.name);
 return monsterAttackResultR(mon,ctx,{hit:true,damage:dmg,attackerAlive:mon.hp>0});
}
const BOSS_REWARD_STAGES={pre:[],post:[]};
function bossReward(mon){if(mon.bossPattern==='palaceKing105')return;if(mon.branchBoss105){if(state.branchTerrain105.frostReward105)return;for(const stage of BOSS_REWARD_STAGES.pre)stage.run(mon);return mountainBossReward(mon);}if(state.floor===10&&mon.boss&&!state.passiveRecoveryUnlocked57){state.passiveRecoveryUnlocked57=true;state.lastDamageAgencyTurn57=state.playerAgencyTurns57||0;addLog('화공의 기운이 흩어진다. 숨을 고르면 상처가 빠르게 아물기 시작한다.')}
  for(const stage of BOSS_REWARD_STAGES.pre)stage.run(mon);
  state.bossDefeated=true;grantMartialManual(mon);addLog('구역 보스 격파.');
  if(state.floor===5){state.player.blinkLevel=2;addLog('점멸 습득: 2칸.')}if(state.floor===15){state.player.blinkLevel=3;addLog('점멸 강화: 3칸.')}if(state.floor===20){state.player.blinkLevel=4;addLog('점멸 강화: 4칸.')}
  dropBossConsumables55(mon);
  if(state.floor===25&&runState57()==='playing'){if(typeof globalThis.storyShowEndingChoice992==='function')globalThis.storyShowEndingChoice992();else showEnding()}
  for(const stage of BOSS_REWARD_STAGES.post)stage.run(mon)
}
function trainingActive(){return !!(state?.tutorialEntry60&&!state.tutorialEntry60.completed&&inTutorialEntry(state.player.x,state.player.y))}
function monsterExitPressureSpeed(mon,progress=floor24PressureProgress57()){
  const trait=mon?.exitPressureSpeed57;if(!trait)return 1;const min=Number.isFinite(trait.min)?trait.min:.5,max=Number.isFinite(trait.max)?trait.max:1.5;
  return clamp(min+(max-min)*clamp(progress,0,1),Math.min(min,max),Math.max(min,max))
}
function monsterActionSchedule(mon,opt={}){
  if(mon?.exitPressureSpeed57){
    const progress=Number.isFinite(opt.pressureProgress57)?clamp(opt.pressureProgress57,0,1):floor24PressureProgress57(),speed=monsterExitPressureSpeed(mon,progress);
    mon.exitPressureSpeedCurrent57=speed;mon.exitPressureSpeedBudget57=(Number.isFinite(mon.exitPressureSpeedBudget57)?mon.exitPressureSpeedBudget57:0)+speed;
    const steps=Math.min(2,Math.floor(mon.exitPressureSpeedBudget57+1e-9));if(steps<=0)return{act:false,steps:0,mode:'pressure-slow',speed,progress};
    mon.exitPressureSpeedBudget57=Math.max(0,mon.exitPressureSpeedBudget57-steps);return{act:true,steps,mode:speed>=1.5-1e-9?'fast':speed>1?'pressure-fast':speed<1?'pressure-slow':'normal',speed,progress}
  }
  const fast=!!mon.fast,lag=mon.actionLag57;
  if(fast&&lag)return{act:true,steps:1,mode:'cancelled'};
  if(fast)return{act:true,steps:state.floorTurn%2===0?2:1,mode:'fast'};
  if(!lag)return{act:true,steps:1,mode:'normal'};
  const period=Math.max(2,Math.floor(lag.period||6)),skip=Math.max(1,Math.min(period-1,Math.floor(lag.skipTurns||1)));
  mon.actionLagTick57=((mon.actionLagTick57||0)+1)%period;
  return{act:mon.actionLagTick57!==0&&mon.actionLagTick57<=period-skip,steps:1,mode:'action-lag'};
}
function applyMonsterRevivalStats(mon){
  if(!mon?.revivalLives57)return mon;
  if(!Number.isFinite(mon.baseAtk57))mon.baseAtk57=mon.atk;
  if(!Number.isFinite(mon.baseDef57))mon.baseDef57=mon.def;
  if(!Number.isFinite(mon.baseEva57))mon.baseEva57=mon.eva;
  const phase=mon.revivePhase57||'normal';
  if(phase==='reviving'){
    const atkMul=Number.isFinite(mon.reviveWeakAtkMul57)?mon.reviveWeakAtkMul57:.65,defMul=Number.isFinite(mon.reviveWeakDefMul57)?mon.reviveWeakDefMul57:.75,evaDelta=Number.isFinite(mon.reviveWeakEvaDelta57)?mon.reviveWeakEvaDelta57:-2;
    mon.atk=mon.reviveWeakAtk57??Math.max(1,Math.round(mon.baseAtk57*atkMul));mon.def=Math.max(0,Math.round(mon.baseDef57*defMul));mon.eva=mon.reviveWeakEva57??Math.max(0,mon.baseEva57+evaDelta)
  }else if(phase==='full'){
    const atkMul=Number.isFinite(mon.reviveFullAtkMul57)?mon.reviveFullAtkMul57:1.35,defMul=Number.isFinite(mon.reviveFullDefMul57)?mon.reviveFullDefMul57:1.20,evaDelta=Number.isFinite(mon.reviveFullEvaDelta57)?mon.reviveFullEvaDelta57:2;
    mon.atk=mon.reviveFullAtk57??Math.max(1,Math.round(mon.baseAtk57*atkMul));mon.def=Math.max(0,Math.round(mon.baseDef57*defMul));mon.eva=mon.reviveFullEva57??Math.max(0,mon.baseEva57+evaDelta)
  }else{mon.atk=mon.baseAtk57;mon.def=mon.baseDef57;mon.eva=mon.baseEva57}
  return mon;
}
function monsterCorpseRelocation(mon,origin=mon.lastCorpseOrigin57||{x:mon.x,y:mon.y}){
  const span=Math.max(3,Math.floor(mon?.corpseRelocateSpan57||21)),radius=Math.max(1,Math.floor((span-1)/2)),minRadius=Math.max(1,Math.floor(mon?.corpseRelocateMinRadius57||Math.ceil(radius*.6))),queue=[origin],seen=new Set([k(origin.x,origin.y)]),cells=[];
  const opponents=[state.player,...state.monsters].filter(t=>t!==mon&&t.hp>0&&factionsHostile57(entityFaction(mon),entityFaction(t)));
  const terrainOpen=(x,y)=>x>=1&&y>=1&&x<COLS-1&&y<ROWS-1&&PlacementService.terrainStandable(mon,state.map[y]?.[x]);
  for(let i=0;i<queue.length;i++){
    const p=queue[i];
    for(const[dx,dy]of DIRS4){const x=p.x+dx,y=p.y+dy,kk=k(x,y);if(seen.has(kk)||!terrainOpen(x,y))continue;seen.add(kk);queue.push({x,y});const d=Math.max(Math.abs(x-origin.x),Math.abs(y-origin.y));if(d>=minRadius&&(x!==state.player.x||y!==state.player.y)&&PlacementService.monsterCanStand(mon,x,y)&&opponents.every(t=>entityDistance57({...mon,x,y},t)>=minRadius))cells.push({x,y,d})}
  }
  if(!cells.length)return null;const local=cells.filter(p=>p.d<=radius),pool=local.length?local:cells;return pool[Math.floor(globalThis.__MANRU_RANDOM57__()*pool.length)]
}
function beginMonsterRevival(mon){
  if(!mon?.revivalLives57||!Number.isFinite(mon.livesRemaining57)||mon.livesRemaining57<=1)return false;
  const deathLosBreak=!!(mon.deathCountsAsLosBreak57&&!mon.dormant57),deathPos={x:mon.x,y:mon.y},opponents=[state.player,...state.monsters].filter(t=>t!==mon&&t.hp>0&&factionsHostile57(entityFaction(mon),entityFaction(t))),deathTarget=opponents.find(t=>(t===state.player?'player':t.combatantId54)===(mon.lastDamageOpponent57||mon.losOpponentId105))||opponents.sort((a,b)=>entityDistance57(mon,a)-entityDistance57(mon,b))[0]||null;
  mon.livesRemaining57--;mon.hp=0;mon.revivePhase57='corpse';mon.corpseUntilFloorTurn57=(state.floorTurn||0)+2;mon.reviveFullTurn57=null;mon.alerted=false;mon.lastSeenPosition=null;mon.heardPosition=null;mon.attackInvestigation57=null;mon.losLostSummonCooldown57=0;mon.exitPressureSpeedBudget57=0;mon.deathProcessed57=false;
  mon.lastCorpseOrigin57=deathPos;const corpsePos=monsterCorpseRelocation(mon,deathPos);if(corpsePos)OccupancyService.move(mon,corpsePos.x,corpsePos.y);mon.corpseRelocatePending57=!corpsePos;mon.lastCorpseRelocateDistance57=Math.max(Math.abs(mon.x-deathPos.x),Math.abs(mon.y-deathPos.y));
  if(deathLosBreak){mon._sawPlayer57=true;mon.deathLosBreakTurn57=state.floorTurn||0;mon.deathLosBreakSummoned57=handleLosLostSummon(mon,false,{forceLost:true,allowCorpse:true,reason:'death',target:deathTarget})}
  addLog(`${mon.name}가 쓰러졌다. ${corpsePos?'시체가 멀리 흩어지고':'시체가 안전한 부활 자리를 기다리며'} 황금빛 꼬리 하나가 아직 흔들린다. (${mon.livesRemaining57}목숨)`);burst(deathPos.x,deathPos.y,'#e6aa42',16,.9);burst(mon.x,mon.y,'#c58c34',10,.65);return true
}
function advanceMonsterRevival(mon){
  if(!mon?.revivalLives57)return false;const turn=state.floorTurn||0;
  if(mon.revivePhase57==='corpse'){
    if(turn<(mon.corpseUntilFloorTurn57??Infinity))return true;
    const safe=mon.lastCorpseRelocateDistance57>=(mon.corpseRelocateMinRadius57||6)&&PlacementService.monsterCanStand(mon,mon.x,mon.y)&&[state.player,...state.monsters].every(t=>t===mon||t.hp<=0||!factionsHostile57(entityFaction(mon),entityFaction(t))||entityDistance57(mon,t)>=(mon.corpseRelocateMinRadius57||6));
    if(!safe){const q=monsterCorpseRelocation(mon);if(!q){mon.corpseRelocatePending57=true;mon.corpseUntilFloorTurn57=turn+1;return true;}OccupancyService.move(mon,q.x,q.y);mon.lastCorpseRelocateDistance57=q.d;}mon.corpseRelocatePending57=false;
    mon.hp=mon.maxHp;OccupancyService.move(mon,mon.x,mon.y);mon.revivePhase57='reviving';mon.corpseUntilFloorTurn57=null;mon.reviveFullTurn57=turn+Math.max(1,mon.reviveWeakTurns57||2)+1;mon.deathProcessed57=false;applyMonsterRevivalStats(mon);burst(mon.x,mon.y,'#f1c94f',20,.85);addLog(`${mon.name}가 흩어진 시체 자리에서 아직 불완전한 모습으로 되살아났다.`);return true
  }
  if(mon.revivePhase57==='reviving'&&turn>=(mon.reviveFullTurn57??Infinity)){mon.revivePhase57='full';mon.reviveFullTurn57=null;applyMonsterRevivalStats(mon);mon.alerted=true;mon.searchTurns=Math.max(mon.searchTurns||0,18);burst(mon.x,mon.y,'#ef8a2f',24,1);addLog(`${mon.name}의 부활이 완성됐다. 황금빛 살기가 짙어진다.`);return false}
  return mon.revivePhase57==='reviving'
}
function updateExitPressureTracking(mon,sees){
  const trait=mon?.exitPressureSense57;if(!trait||sees||mon.dormant57||mon.revivePhase57==='corpse'||!state?.floor24?.chaseStarted)return false;const progress=floor24PressureProgress57();if(progress<(trait.start??.4))return false;
  const interval=progress>=(trait.exact??.78)?1:Math.max(1,trait.interval||2);if((state.floorTurn||0)%interval!==0)return false;const error=progress>=(trait.exact??.78)?0:Math.max(1,Math.round((trait.maxError||6)*(1-progress)));let tx=state.player.x,ty=state.player.y;
  if(error>0){const ox=Math.floor(globalThis.__MANRU_RANDOM57__()*(error*2+1))-error,oy=Math.floor(globalThis.__MANRU_RANDOM57__()*(error*2+1))-error;tx=clamp(state.player.x+ox,1,COLS-2);ty=clamp(state.player.y+oy,1,ROWS-2);if(tileBlocks(state.map[ty]?.[tx])){tx=state.player.x;ty=state.player.y}}
  mon.alerted=true;mon.attackInvestigation57={x:tx,y:ty,bornTurn:(state.floorTurn||0)+.75,intensity:8+progress*12,exitPressure57:true,exact57:error===0};mon.searchTurns=Math.max(mon.searchTurns||0,Math.round(10+progress*12));return true
}
function handleLosLostSummon(mon,sees,opt={}){
  const trait=mon?.losLostSummon57,forceLost=opt.forceLost===true,allowCorpse=opt.allowCorpse===true;if(!trait||(!allowCorpse&&(mon.revivePhase57==='corpse'||mon.revivePhase57==='reviving'))||mon.dormant57)return false;
  if(mon.losLostSummonCooldown57>0&&!forceLost)mon.losLostSummonCooldown57--;
  const target=opt.target||selectCombatOpponent(mon),targetId=target===state.player?'player':target?combatantId(target):mon.losOpponentId105;if(targetId!==mon.losOpponentId105){mon.losOpponentId105=targetId;mon._sawPlayer57=false;}const lost=forceLost||(mon._sawPlayer57===true&&!sees);mon._sawPlayer57=!!sees;if(!lost||mon.losLostSummonCooldown57>0)return false;
  const names=trait.names||[];if(!names.length)return false;const name=names[Math.floor(globalThis.__MANRU_RANDOM57__()*names.length)],child=spawnPressureReinforcement57(mon,name,target);if(!child)return false;
  mon.losLostSummonCooldown57=mon.revivePhase57==='full'?(trait.fullCooldown||5):(trait.normalCooldown||8);addLog(opt.reason==='death'?`${mon.name}를 쓰러뜨리자 끊어진 시야 너머에서 증원 기척이 번졌다.`:`${mon.name}의 시야를 끊자 멀리서 증원 기척이 번졌다.`);return true
}
// All invulnerability uses the same damage gate, including core, hazards and reflected hits.
function combatInvulnerability(entity){
 if(entity?.bossPattern==='master'&&entity.storyPhase992!==1&&activeCore(entity))return '천실핵의 사념이 공격을 삼켰다.';
 if(entity?.intent54?.data?.invulnerable57)return '용미 쓸기 중인 용왕은 무적이다.';
 return null;
}
function updateRafts(){if(!state?.rafts?.length)return;for(const raft of state.rafts){const ny=raft.y+raft.dir;if(ny<raft.min||ny>raft.max){raft.dir*=-1;continue}movePlatform57(raft,0,raft.dir)}}
function monsterSenseRadius(mon){
  let base=mon.boss?99:(mon.ranged||mon.support?7:mon.fast?6:5);
  return base
}
function playerDetectedBy(mon){
  if(!mon||!state?.player||playerConcealed58())return false;
  const d=entityDistance57(mon,state.player),sight=applyCombatDebuffStats57({vision:monsterSenseRadius(mon)},mon).vision,sense=Math.max(2,sight-(playerCloak().senseReduce||0)+(monsterSenseRadius(mon)<99?Math.round(2*(globalThis.__MANRU_ITEM_IDENTITY991__?.cursePower?.('clang')||0)):0));
  if(d<=1||(d<=sense&&entityCombatLineCheckR(mon,state.player,{range:sense,units:false}).ok))return true;
  const presence=globalThis.__MANRU_ITEM_IDENTITY991__?.cursePower?.('presence')||0;if(!presence)return false;
  const cursedSense=sense+Math.round(2*presence);return d<=cursedSense&&entityCombatLineCheckR(mon,state.player,{range:cursedSense,units:false}).ok
}
// Permanent per-monster encounter history; the movement grace itself is runtime-only.
function monsterHasSeenPlayer(mon){
 if(typeof mon.hasSeenPlayer105!=='boolean')mon.hasSeenPlayer105=!!(mon.alerted||mon.lastSeenPosition||mon.attackInvestigation57||mon.gazeCount||mon.sight||mon.summonActivated57);
 return mon.hasSeenPlayer105;
}
function monsterCanDiscoverPlayer(mon){
 if(!isHostileTarget57(mon)||mon.dormant57||mon.doorSleep105||mon.revivePhase57==='corpse'||mon.revivePhase57==='reviving')return false;
 if(mon.sleeping105&&!mon.alerted&&mon.hp>=mon.maxHp&&entityDistance57(mon,state.player)>1)return false;
 return playerDetectedBy(mon);
}
function monsterDiscoverySpent(mon){return monsterHasSeenPlayer(mon)||mon.seenByPlayer105===true}
function monsterAmbushCanHide(mon,x=mon?.x,y=mon?.y){if(!mon?.ambush||!state||!Number.isFinite(x)||!Number.isFinite(y))return false;if(!mon.grassHide57)return true;const t=state.map?.[y]?.[x];return t===TT.GRASS||t===TT.LIGHT_GRASS}
function setAimPower(power,source=null){
 const p=state?.player,cs=p?.classState;if(!cs||playerClassRules58(p).roar!=='aim')return 0;
 if(source==='attack')cs.aimAttackAgency=(state.playerAgencyTurns57||0)+(state._turnPipelineActive57?Number(!!state._turnAgencyWillCount57&&!state._turnAgencyCounted57):1);
 const before=cs.aimPower||0;cs.aimPower=power>4&&(martialFormOf('roar',p)==='focus'||!playerDebuffRows().length)?Math.min(aimMaximum(p),Math.floor(power)):0;
 if((before>0||power>4)&&!cs.aimPower){globalThis.__MANRU_MARTIAL_FX965__?.pulse?.('aimBreak',680);addLog(martialPresentation('roar',MARTIAL_INFO.roar,state.player).name+'의 축적이 흩어졌다.')}
 return cs.aimPower;
}
function isNaturalMonster(m){return !!(isHostileTarget57(m)&&!m.boss&&!m.friendly47&&!m.friendly&&!m.combatFixture54&&!m.npc&&!m.storyId&&!m.eventOnly&&!NON_REWARDING_SPAWN_PROVENANCE57.has(m.spawnProvenance57)&&!['boss-fixture','event','rumor-space'].includes(m.spawnProvenance57))}
function tickNaturalPopulation(){
 if(!state||state.branchContext105||state.floor<11||state.shopIntermission?.active||state.artifactDungeon46||state.monsters.some(m=>m.boss&&m.hp>0))return;
 const pop=state.naturalPopulation57;if(!pop||pop.initial<=0)return;const agency=state.playerAgencyTurns57||0,count=state.monsters.filter(isNaturalMonster).length;
 const deficit=Math.max(0,pop.initial-count-1);if(!deficit){pop.nextAgency=null;return}
 if(pop.nextAgency==null){pop.nextAgency=agency+rand(18,26);return}if(agency<pop.nextAgency)return;pop.nextAgency=agency+rand(18,26);
 const arrivals=Math.ceil(deficit*.10);
 const defs=floorEnemyDefinitions().filter(d=>!d.fixed&&!d.boss&&!d.miniBoss&&!d.guardPost57);if(!defs.length)return;
 const walk=ReachabilityService.playerSearch(state.player,{ignoreOccupants:true}),ctx=PlacementService.generationContext(walk.dist,20,4),home=roomAt(state.player.x,state.player.y),roomUse=new Map();
 ctx.candidates=ctx.candidates.filter(q=>walk.dist.has(k(q.x,q.y))&&walk.dist.get(k(q.x,q.y))>=20&&!state.visible.has(k(q.x,q.y))&&Math.max(Math.abs(q.x-state.player.x),Math.abs(q.y-state.player.y))>=16&&(!home||q.x<home.x-5||q.y<home.y-5||q.x>=home.x+home.w+5||q.y>=home.y+home.h+5)&&!(state.recentPlayerCells57||[]).some(c=>agency-c.agency<26&&Math.max(Math.abs(q.x-c.x),Math.abs(q.y-c.y))<6));
 const candidates=ctx.candidates,groupCenters=[];let groupCells=null;
 for(let i=0;i<arrivals;i++){
 if(i%4===0)groupCells=null;
 ctx.candidates=groupCells?candidates.filter(q=>groupCells.has(k(q.x,q.y))):candidates.filter(q=>groupCenters.every(c=>Math.max(Math.abs(q.x-c.x),Math.abs(q.y-c.y))>8));
 const m=scaledMonster(ordinaryEnemyPick(defs)),pos=initialSpawnPosition(m,walk.dist,20,roomUse,ctx);if(!pos)continue;
 m.x=pos.x;m.y=pos.y;m.spawnProvenance57='natural-reentry';m.respawnGeneration57=++pop.generation;m.xp=Math.floor(m.xp*Math.pow(.30,m.respawnGeneration57));m.rewardPolicy57={xp:true,drops:false,kills:true};m.alerted=false;m.lastSeenPosition=null;m.heardPosition=null;
 const rooms=(state.rooms||[]).filter(r=>r!==home&&Math.max(Math.abs(r.cx-pos.x),Math.abs(r.cy-pos.y))>=3&&walk.dist.has(k(r.cx,r.cy))&&walk.dist.get(k(r.cx,r.cy))<walk.dist.get(k(pos.x,pos.y))).sort((a,b)=>Math.abs(a.cx-pos.x)+Math.abs(a.cy-pos.y)-Math.abs(b.cx-pos.x)-Math.abs(b.cy-pos.y));
 if(rooms.length)m.migrationTarget57={x:rooms[0].cx,y:rooms[0].cy};OccupancyService.addMonster(m);PlacementService.registerGenerationMonster(ctx,m);
 if(!groupCells){
  groupCenters.push(pos);groupCells=new Set([k(pos.x,pos.y)]);const queue=[{x:pos.x,y:pos.y,depth:0}];
  for(let j=0;j<queue.length;j++){
   const cell=queue[j];if(cell.depth>=3)continue;
   for(const [dx,dy]of DIRS8){const x=cell.x+dx,y=cell.y+dy,key=k(x,y);if(groupCells.has(key)||!canMonsterStep(m,cell.x,cell.y,x,y))continue;groupCells.add(key);queue.push({x,y,depth:cell.depth+1})}
  }
 }
 }
}
function monsterInvestigationTarget(mon){
 let target=null;
 for(const candidate of [mon.attackInvestigation57,mon.lastSeenPosition,mon.heardPosition])if(candidate&&(!target||(candidate.bornTurn||0)>(target.bornTurn||0)))target=candidate;
 return target;
}
function canMonsterStep(mon,fromX,fromY,x,y,placement=null,opts={}){
 if(mon?.martialActor105&&(state.tempFields||[]).some(f=>f.martialSmoke&&f.smokeForm==='burst'&&f.owner===mon.dojoActorId105&&f.ttl>0&&tempFieldCells57(f).some(c=>c.x===x&&c.y===y)))return false;
 const pressure=mineButton(x,y);if(pressure&&!(mon?.prisoner105?.released&&pressure.prisonCell105===mon.prisoner105.cell))return false;
 if(!mon||monsterMovementLocked57(mon)||!monsterPatrolAllows(mon,x,y)||!PlacementService.monsterCanStand(mon,x,y,placement,{ignore:opts.movementIgnore}))return false;
 const dx=x-fromX,dy=y-fromY;if(Math.max(Math.abs(dx),Math.abs(dy))!==1)return false;
 return true;
}
// Cooperative movement opens a route by moving allies into legal neighbouring vacancies.
// Every committed step still uses ordinary terrain, footprint, occupancy and entry effects.
function yieldMonsterSpace(mon,x,y,opts,chain=new Set(),reserved=new Set()){
 if(chain.has(mon)||!canMonsterStep(mon,mon.x,mon.y,x,y,null,opts))return false;
 const cells=entityFootprintCells57(mon,x,y),blocked=OccupancyService.occupants(cells).filter(m=>m!==mon&&(m===state.player||state.monsters.includes(m)));
 if(blocked.some(m=>!opts.movementIgnore.has(m)||chain.has(m)))return false;
 const bounds=opts.yieldBounds||opts.movementBounds,nextChain=new Set([...chain,mon]),nextReserved=new Set([...reserved,...cells.map(c=>k(c.x,c.y))]);
 for(const other of blocked){
  if(!entityFootprintCells57(other).some(c=>cells.some(q=>q.x===c.x&&q.y===c.y)))continue;
  const candidates=DIRS8.map(([dx,dy])=>({x:other.x+dx,y:other.y+dy})).filter(q=>!entityFootprintCells57(other,q.x,q.y).some(c=>nextReserved.has(k(c.x,c.y)))&&(!bounds||entityDistanceAt(other,q.x,q.y,bounds.owner)<=bounds.radius)&&canMonsterStep(other,other.x,other.y,q.x,q.y,null,opts)).sort((a,b)=>Number(!PlacementService.monsterCanStand(other,a.x,a.y))-Number(!PlacementService.monsterCanStand(other,b.x,b.y))||entityDistanceAt(other,a.x,a.y,bounds?.owner||mon)-entityDistanceAt(other,b.x,b.y,bounds?.owner||mon));
  let moved=false;
  for(const q of candidates)if(yieldMonsterSpace(other,q.x,q.y,opts,nextChain,nextReserved)&&moveMonsterStep(other,q.x,q.y)){moved=true;break;}
  if(!moved)return false;
 }
 return canMonsterStep(mon,mon.x,mon.y,x,y);
}
function moveMonsterStep(mon,x,y,opts={}){
 if(!mon)return false;
 // Voluntary steps anticipate the next tide; forced displacement owns its own landing rules.
 if(palaceTideRisk(mon,x,y,1))return false;
 const bounds=opts.movementBounds||(mon.summonOwner105==='player'&&entityDistance57(mon,state.player)<=2?{owner:state.player,radius:2}:null);if(bounds&&entityDistanceAt(mon,x,y,bounds.owner)>bounds.radius)return false;
 if(!canMonsterStep(mon,mon.x,mon.y,x,y)&&!(opts.movementIgnore&&yieldMonsterSpace(mon,x,y,opts)))return false;
 const cost=(mon.upset>0?1.45:1)*(1+.12*(globalThis.__MANRU_ITEM_IDENTITY991__?.cursePower?.('binding',mon)||0));if(cost>1){mon.movementCostCarry105=(mon.movementCostCarry105||0)+cost-1;if(mon.movementCostCarry105>=1){mon.movementCostCarry105-=1;return false}}
 const ox=mon.x,oy=mon.y;
 OccupancyService.move(mon,x,y);mon.facing57={x:Math.sign(x-ox),y:Math.sign(y-oy)};
 if(mon.goldTrail&&state.map[oy][ox]===TT.FLOOR)RuntimeTerrainOwner.mutate(ox,oy,TT.GOLD,{source:'gold-trail'});
 if(mon.waterTrail&&terrainSurface58(state.map[oy][ox]))RuntimeTerrainOwner.temporary(ox,oy,TT.WATER,6,'water-trail',{allowedOld:[state.map[oy][ox]],source:'fragrance-fairy'});
 if(mon.lavaTrail57&&terrainSurface58(state.map[oy][ox]))RuntimeTerrainOwner.temporary(ox,oy,TT.LAVA,3,'lava-trail',{allowedOld:[state.map[oy][ox]],source:'molten-slime'});
 if(mon.hp>0&&state.map[y][x]===TT.DOOR){setTerrainTile58(state.map,x,y,TT.OPEN_DOOR);doorFX(x,y)}return true;
}
const BOSS_ARENA_RULES={containment:{patterns:['needle','keeper'],radius:15,damageFraction:.10,minDamage:5,poisonTurns:6},silk:{weaveCooldown:7,repairCooldown:4,mirrorCap:24,mirrorSpacing:3,lineCap:3,gasDuration:24,blackThreshold:.70,blackChance:.50,blackCap:4,waveIntervals:[8,6,4,2],waveBatch:2,mirrorSummonCap:6,bossSummonCap:12,roster:['비단 술래','비단 술래','비단 술래','비단 술래','비단 술래','비단 술래','비단 술래','윈도','향기요정','분홍거미']},keeper:{bindTurns:2,boundDef:2,chainCooldown:4,lavaThresholds:[.67,.33],lavaWarning:10,bridgeWidths:[5,7]},master:{maskAtk:14,shotCooldown:[5,4,3],shieldShotCooldown:6,thresholds:[.66,.33],range:4,shieldRange:3,sealAngle:90,cores:[{name:'제1사념 · 만루의 잔향',hp:45,def:3,interval:2,batch:3,cap:8,roster:['금령','금령','공허 가오리','공허 가오리','만루의 수호상']},{name:'제2사념 · 천실핵의 집념',hp:60,def:5,interval:3,batch:2,cap:6,roster:['신전 사제 망령','차원 포식자','보주의 파수꾼','천수 아수라']}]}};
const AIM_GLYPHS={
    '0':[31,17,17,17,17,17,31],'1':[4,12,4,4,4,4,4],
    '2':[31,1,1,31,16,16,31],'5':[31,16,16,31,1,1,31],
    '7':[31,1,2,4,4,4,4],'.':[0,0,0,0,0,0,4],
    '×':[0,17,10,4,10,17,0]
  };
function keeperLavaCells(mon,phase){
 const a=mon.arena54,r=BOSS_ARENA_RULES.containment.radius,half=(phase.width-1)/2,cells=[];if(!a)return cells;
 for(let y=Math.max(1,a.cy-r);y<=Math.min(ROWS-2,a.cy+r);y++)for(let x=Math.max(1,a.cx-r);x<=Math.min(COLS-2,a.cx+r);x++){
  const tile=state.map[y]?.[x];if(tile==null||[TT.STAIR,TT.PORTAL,TT.KEY_TILE,TT.RUMOR].includes(tile)||state.stairs?.x===x&&state.stairs?.y===y||globalThis.__MANRU_RUMOR_SPACES1030__?.mutationLocked?.(x,y))continue;
  const cross=c=>c&&(Math.abs(x-c.x)<=half||Math.abs(y-c.y)<=half),safe=cross(phase.origin)||phase.stage===1&&cross(phase.target);
  cells.push({x,y,safe:!!safe});
 }return cells;
}
function prepareBossArena(mon){
 if(mon.arena54)return;
 const cx=mon.x,cy=mon.y;mon.arena54={cx,cy};for(const fixture of state.monsters)if(fixture.combatFixture54==='silk'&&!fixture.bossOwnerId57&&entitiesAllied57(mon,fixture))adoptBossChild57(fixture,mon);
 if(mon.bossPattern==='needle'){
  mon.silk54={links:[],nextWeave:state.floorTurn+2,nextRepair:state.floorTurn+BOSS_ARENA_RULES.silk.repairCooldown};
  placeSilkMirrors54(mon);
 }else if(mon.bossPattern==='keeper'){
  const anchors=[];
  for(const [dx,dy]of[[-5,-3],[5,-3],[-5,3],[5,3]]){
   const probe={x:cx+dx,y:cy+dy,hp:1},q=PlacementService.findMonster(probe,{placementMode:'local',origin:probe,radius:3});
   if(q&&!anchors.some(a=>a.x===q.x&&a.y===q.y))anchors.push({x:q.x,y:q.y,broken:false});
  }
  mon.arena54.anchors=anchors;
 }
}
function needleGas(mon){return spawnJarGasField57(mon.x,mon.y,{status:MONSTERS.find(m=>m.name==='환각의 향로').gasStatus57,duration:BOSS_ARENA_RULES.silk.gasDuration,maxRadius:10,burstRadius:4,linger:true,source:mon});}
function needleEscape(mon,source){
 const thresholds=[.8,.6,.4,.2];mon.needleEscapeStage54??=0;
 while(mon.needleEscapeStage54<thresholds.length&&mon.hp<=mon.maxHp*thresholds[mon.needleEscapeStage54]){
  mon.needleEscapeStage54++;needleGas(mon);impact(mon.x,mon.y,'#d7a3e0',7);burst(mon.x,mon.y,'#b982c3',44,2);floatText(mon.x,mon.y,'환각 폭발','#ead1f0',16);
  const target=combatTargetValid57(mon,source)?source:selectCombatOpponent(mon),a=mon.arena54,origin=a?{x:a.cx,y:a.cy}:mon,candidates=[],routes=ReachabilityService.monsterRoutes(mon,{origin,radius:BOSS_ARENA_RULES.containment.radius,ignoreOccupants:true}).cells;
  for(const {x,y,cost}of routes.values()){
   const distance=entityDistance57(mon,{x,y});if(distance<5||distance>10||!terrainSurface58(state.map[y][x])||!PlacementService.monsterCanStand(mon,x,y)||target&&entityDistance57(target,{x,y})<5)continue;
   if(state.items.some(i=>i.x===x&&i.y===y)||[...(state.tempFields||[]),...(state.elementFields74||[]),...(state.legendFireFields47||[])].some(f=>tempFieldCells57(f).some(c=>c.x===x&&c.y===y)))continue;candidates.push({x,y,score:distance*2-Math.abs((target?entityDistance57(target,{x,y}):8)-8)-cost*.15});
  }
  const top=candidates.length?Math.max(...candidates.map(q=>q.score)):0,q=candidates.length?choice(candidates.filter(q=>q.score>=top-2)):null;if(!q){addLog('침모가 환각을 폭발시켰지만 결계 안의 퇴로가 막혔다.');break}
  const from={x:mon.x,y:mon.y};OccupancyService.move(mon,q.x,q.y);clearIntent(mon);projectileFX(from.x,from.y,q.x,q.y,'#b982c3');burst(q.x,q.y,'#b982c3',18,.8);addLog('침모가 환각을 폭발시키고 독안개 결계 안의 먼 곳으로 몸을 감췄다.');
 }
}
function setSilkMirrorColor(mirror,black){
 const name=black?'흑색 재봉 천면경':'재봉 천면경';mirror.name=name;mirror.concept57=SPECIAL_MONSTER_CONCEPTS57[name];mirror.color=black?'#706079':'#c87565';mirror.silkMirrorColor54=black?'black':'red';
 if(black){mirror.silkWave54={remaining:BOSS_ARENA_RULES.silk.waveIntervals[0],waves:0,lastTurn:state.floorTurn};floatText(mirror.x,mirror.y,'흑색 천면경','#c8b3d4',13);addLog('흑색 천면경이 솟아났다. 실이 연결되면 환영들을 부른다. 거울을 깨 소환수를 지워라.');}else delete mirror.silkWave54;
}
function createSilkMirror(mon,origin,{index=null,black=false,auxiliary=false,placementMode='exact',radius=0}={}){
 const silk=mon.silk54,live=state.monsters.filter(m=>m.combatFixture54==='silk'&&bossChildOf(m,mon));
 const id=index??Math.max(silk.nextMirrorId57||0,...live.map(m=>m.mirrorIndex54+1));
 const mirror={hp:1,maxHp:1,atk:0,def:0,eva:0,xp:0,shape:'silk_mirror',kind:'construct',fixed:true,combatFixture54:'silk',mirrorIndex54:id,auxiliaryMirror57:auxiliary,weakened:0,alerted:false,rewardPolicy57:{xp:false,drops:false,kills:false},spawnProvenance57:'boss-fixture'};
 adoptBossChild57(mirror,mon);const q=PlacementService.findMonster(mirror,{placementMode,origin,radius});if(!q)return null;
 mirror.x=q.x;mirror.y=q.y;if(!OccupancyService.addMonster(mirror))return null;
 setSilkMirrorColor(mirror,black);silk.nextMirrorId57=Math.max(silk.nextMirrorId57||0,id+1);playSummonArrival(mon,mirror);
 return mirror;
}
function releaseBossWave(predicate,color='#c8b4da'){
 const summons=new Set(state.monsters.filter(predicate)),owners=new Set([...summons].map(combatantId));
 // Legacy descendants may point at their immediate parent rather than the boss.
 let expanded=true;while(expanded){expanded=false;for(const child of state.monsters)if(!summons.has(child)&&owners.has(child.bossOwnerId57)){summons.add(child);owners.add(combatantId(child));expanded=true}}
 for(const child of summons){child.hp=0;child.deathProcessed57=true;clearIntent(child);burst(child.x,child.y,color,12,.65);OccupancyService.removeMonster(child)}
 return summons.size;
}
function tickBossFixture(fixture){if(fixture.combatFixture54==='core')summonCoreWave(fixture);else if(fixture.combatFixture54==='silk')summonSilkWave(fixture);}
function summonSilkWave(mirror){
 if(mirror.silkMirrorColor54!=='black'||!mirror.silkWave54||mirror.hp<=0)return;
 const clock=mirror.silkWave54,boss=bossOwner(mirror,'needle'),rule=BOSS_ARENA_RULES.silk;if(!boss||clock.lastTurn===state.floorTurn)return;clock.lastTurn=state.floorTurn;
 const connected=boss.silk54?.links.some(link=>(link.a===mirror.mirrorIndex54||link.b===mirror.mirrorIndex54)&&silkLinkEndpoints(boss,link));if(!connected)return;
 clock.remaining=Math.max(0,clock.remaining-1);if(clock.remaining>0)return;
 const target=selectCombatOpponent(boss);if(!target)return;
 const source=combatantId(mirror);let count=0;
 for(let n=0;n<rule.waveBatch;n++){
  const live=state.monsters.filter(m=>m.hp>0&&m.silkSourceMirror54&&bossChildOf(m,boss));if(live.length>=rule.bossSummonCap||live.filter(m=>m.silkSourceMirror54===source).length>=rule.mirrorSummonCap)break;
  if(spawnBossWave54(mirror,boss,choice(rule.roster),{target,markers:{silkSourceMirror54:source}}))count++;
 }
 if(count){clock.waves++;clock.remaining=rule.waveIntervals[Math.min(clock.waves,rule.waveIntervals.length-1)];addLog(`흑색 천면경에서 환영 ${count}마리가 쏟아졌다. 다음 소환까지 연결된 ${clock.remaining}턴.`);}
}
function severSilk(mirror){
 const released=releaseSilkSummons54(mirror);if(released)addLog(`흑색 천면경이 깨져 그 거울의 환영 ${released}마리가 사라졌다.`);
 const mon=bossOwner(mirror,'needle');if(!mon?.silk54)return;
 const severed=mon.silk54.links.filter(l=>l.a===mirror.mirrorIndex54||l.b===mirror.mirrorIndex54);
 mon.silk54.links=mon.silk54.links.filter(l=>l.a!==mirror.mirrorIndex54&&l.b!==mirror.mirrorIndex54);
 if(mon.intent54)clearIntent(mon);
 for(const l of severed)for(const c of l.cells)if((c.x+c.y)%2===0)burst(c.x,c.y,'#f1bad3',3,.35);
 burst(mirror.x,mirror.y,'#b8dae2',22,.9);floatText(mirror.x,mirror.y,'실 절단','#fbd9e8',13);
 mon.silk54.nextWeave=Math.max(mon.silk54.nextWeave,state.floorTurn+3);
 addLog('천면경이 깨지며 연결된 실이 풀렸다.');
}
function silkLinkEndpoints(owner,link){
 const mirrors=state.monsters.filter(m=>m.hp>0&&m.combatFixture54==='silk'&&bossChildOf(m,owner)),a=mirrors.find(m=>m.mirrorIndex54===link.a),b=mirrors.find(m=>m.mirrorIndex54===link.b);
 return a&&b?[a,b]:null;
}
function keeperChainCells(mon,target){
 const dx=target.x-mon.x,dy=target.y-mon.y,span=Math.max(Math.abs(dx),Math.abs(dy));if(!span)return[];
 const end={x:clamp(Math.round(mon.x+dx/span*8),1,COLS-2),y:clamp(Math.round(mon.y+dy/span*8),1,ROWS-2)},out=[];
 for(const c of combatLineCellsR8(mon.x,mon.y,end.x,end.y)){if(monCovers(mon,c.x,c.y))continue;if(tileBlocksSight(state.map[c.y]?.[c.x]))break;out.push(c)}return out;
}
function activeCore(owner=null){return state?.monsters?.find(m=>m.hp>0&&m.combatFixture54==='core'&&(!owner||bossChildOf(m,owner)))||null}
function beginCorePhase(mon,stage,destination){
 const rule=BOSS_ARENA_RULES.master.cores[stage-1],core={name:rule.name,hp:rule.hp,maxHp:rule.hp,atk:0,def:rule.def,eva:0,xp:0,x:destination.x,y:destination.y,color:stage===1?'#dfbb78':'#caa4e7',shape:'thought_core',kind:'construct',fixed:true,statusImmune:true,displacementImmune57:true,combatFixture54:'core',coreStage54:stage,nextWave54:state.floorTurn+1,waveIndex54:0,spawnProvenance57:'boss-add',rewardPolicy57:{xp:false,drops:false,kills:false}};
 mon.coreStage54=stage;clearIntent(mon);mon.nextAction54=state.floorTurn+2;mon.alerted=true;adoptBossChild57(core,mon);OccupancyService.addMonster(core);
 for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)state.seen.add(k(core.x+dx,core.y+dy));
 FX.flashUntil=performance.now()+360;FX.flashColor=core.color;playSummonArrival(mon,core);toast('천실핵의 사념이 만루보주를 감싼다\n사념체를 파괴하라');addLog(`${rule.name} 출현 · 사념체를 파괴하라.`);vfVibrate(HAPTIC_PATTERN57.boss);updateAll();
}
function summonCoreWave(core){
 const rule=BOSS_ARENA_RULES.master.cores[core.coreStage54-1],boss=bossOwner(core,'master');
 if(!boss||state.floorTurn<core.nextWave54)return;core.nextWave54=state.floorTurn+rule.interval;const target=selectCombatOpponent(boss);
 for(let n=0;n<rule.batch;n++){
  const live=state.monsters.filter(m=>m.coreWave54&&m.hp>0&&bossChildOf(m,boss));if(live.filter(m=>m.coreWave54===core.coreStage54).length>=rule.cap)break;
  const roster=rule.roster.filter(name=>!['천수 아수라','만루의 수호상'].includes(name)||!state.monsters.some(m=>m.hp>0&&m.name===name&&bossChildOf(m,boss)));
  if(!roster.length)break;const name=choice(roster),roll=core.waveIndex54++%10,region=roll===3||roll===8?'route':roll===6?'boss':'core';
  const origin=region==='core'?core:region==='boss'?boss:choice((state.rooms||[]).filter(r=>Math.max(Math.abs(r.cx-core.x),Math.abs(r.cy-core.y))>6).map(r=>({x:r.cx,y:r.cy})))||core;
  spawnBossWave54(core,boss,name,{origin,radius:region==='core'?5:4,target,markers:{coreWave54:core.coreStage54},restrict:q=>(!target||entityDistance57(q,target)>2)&&safeLootGround42(q.x,q.y)});
 }
}
function releaseCorePhase(core){
 const boss=bossOwner(core,'master');
 if(boss){setMonsterStatus(boss,'stunned',Math.max(boss.stunned||0,1));boss.nextAction54=state.floorTurn+2;clearIntent(boss);burst(boss.x,boss.y,'#fff0be',36,1.5);floatText(boss.x,boss.y,'사념 해제','#fff0be',15)}
 releaseBossWave(m=>m.coreWave54&&m.bossOwnerId57===core.bossOwnerId57);
 FX.flashUntil=performance.now()+320;FX.flashColor='#fff0cc';addLog('사념체 파괴! 만루보주의 무적이 풀렸다. 보주가 경직되고 사념체의 소환수들이 모두 사라진다.');toast(core.coreStage54===2?'마지막 사념이 끊겼다 · 만루보주를 끝내라':'사념이 끊겼다 · 만루보주를 공격하라');vfVibrate(HAPTIC_PATTERN57.bossKill);updateAll();
}
function tickBossArenaMist(includePlayer=true){
 const targets=[...(includePlayer&&!state.debugBattle57?[state.player]:[]),...state.monsters];
 for(const target of targets){if(target.hp<=0||target.combatFixture54)continue;const boss=state.monsters.find(m=>combatTargetValid57(m,target)&&bossArenaMist(m,target.x,target.y));if(!boss)continue;const rule=BOSS_ARENA_RULES.containment;damageCombatTarget(boss,target,Math.max(rule.minDamage,Math.ceil(target.maxHp*rule.damageFraction)),'외곽 독안개','#bad971');if(target.hp>0)combatStatus(boss,target,'poison',rule.poisonTurns);}
}
function bossArenaMist(mon,x,y){
 if(state?.debugBattle57)return false;
 const a=mon?.arena54;return !!(mon?.hp>0&&a?.mistActive57&&Math.max(Math.abs(x-a.cx),Math.abs(y-a.cy))>BOSS_ARENA_RULES.containment.radius);
}
function normalizeBoss(m,{loading=false}={}){if(!m?.boss)return;if(loading){const def=Object.values(BOSSES).find(d=>d.bossPattern===m.bossPattern&&d.balanceVersion57);if(def&&(m.balanceVersion57||0)<def.balanceVersion57){const oldMax=Math.max(1,m.maxHp||m.hp||def.definitionHpHistory57?.[m.balanceVersion57||0]||def.hp),ratio=clamp((m.hp??oldMax)/oldMax,0,1),base=m.definitionHp57||def.definitionHpHistory57?.[m.balanceVersion57||0]||def.hp;m.maxHp=Math.max(1,Math.round(oldMax*def.hp/base));m.hp=ratio>0?Math.max(1,Math.round(m.maxHp*ratio)):0;m.definitionHp57=def.hp;m.balanceVersion57=def.balanceVersion57;}}if(loading)for(const child of state.monsters||[]){const pattern=child.combatFixture54==='silk'?'needle':child.combatFixture54==='core'||child.coreWave54?'master':null;if(child.bossOwnerId57||!pattern||m.bossPattern!==pattern||!entitiesAllied57(child,m))continue;const nearest=state.monsters.filter(b=>b.bossPattern===pattern&&entitiesAllied57(child,b)).sort((a,b)=>entityDistance57(child,a)-entityDistance57(child,b))[0];if(nearest===m)adoptBossChild57(child,m);}m.controlCd54=Math.max(0,m.controlCd54||0);if(!Number.isFinite(m.controlCdTurn54)||loading)m.controlCdTurn54=state?.turn||0;if(loading&&['master','friendmask'].includes(m.bossPattern)){delete m.bossPhase54;delete m.arena54;}if(loading){const d=BOSSES[state?.floor];if(d&&m.bossPattern===d.bossPattern){const oldMax=Math.max(1,m.maxHp||m.hp||d.hp),ratio=clamp((m.hp??oldMax)/oldMax,0,1);if(oldMax<d.hp){m.maxHp=d.hp;m.hp=Math.max(1,Math.round(d.hp*ratio));m.atk=Math.max(m.atk||0,d.atk);m.def=Math.max(m.def||0,d.def);m.eva=Math.max(m.eva||0,d.eva)}}}if(loading&&!m.arena54&&['needle','keeper'].includes(m.bossPattern)){m.atk=m.storyPhase992===1?BOSS_ARENA_RULES.master.maskAtk:(BOSSES[state.floor]?.bossPattern===m.bossPattern?BOSSES[state.floor].atk:m.atk);clearIntent(m);prepareBossArena(m)}if(m.bossPattern==='friendmask'){m.flying=false;m.ranged=false;}if(m.bossPattern==='houndboss')m.wallBreak=true;if(m.bossPattern==='needle'){m.ranged=true;m.range=10;m.armorPierce=true;if(!m.needleAttackVersion54){m.atk=Math.max(1,Math.round((m.atk||13)*4/13));m.needleAttackVersion54=1;}if(loading&&!Number.isFinite(m.needleEscapeStage54))m.needleEscapeStage54=[.8,.6,.4,.2].filter(t=>m.hp<=m.maxHp*t).length;}if(m.bossPattern==='master'){if(loading&&m.intent54?.type==='corebolt'&&m.intent54.data?.shape57!=='sector')clearIntent(m);m.ranged=false;m.flying=m.storyPhase992!==1;m.range=4;if(!Number.isFinite(m.coreStage54)){m.coreStage54=loading?BOSS_ARENA_RULES.master.thresholds.filter(t=>m.hp<=Math.ceil(m.maxHp*t)).length:0;clearIntent(m)}}}
function setBossIntent(mon,type,cells,label,data={}){mon.intent54={type,cells:cells.filter(c=>cell54(c.x,c.y)),label,data,armedPlayerTurn:state.turn};const tileOnly=type.startsWith('palace'),rule=document.getElementById('bossRule54');if(!tileOnly){if(rule){rule.textContent=label;rule.style.top='';rule.classList.add('show')}addLog('⚠ '+label);}else if(rule&&state.branchContext105?.id==='palace')rule.classList.remove('show');globalThis.__MANRU_SFX54__?.play?.('warn');return true}
function clearIntent(mon){mon.intent54=null;document.getElementById('bossRule54')?.classList.remove('show')}
function priorityCoreTarget(actor){
 const core=(state?.monsters||[]).filter(t=>t.combatFixture54==='core'&&combatTargetValid57(actor,t)).sort((a,b)=>entityDistance57(actor,a)-entityDistance57(actor,b))[0];if(!core)return null;
 const range=actor.ranged?(actor.range||6):(actor.reach||1);
 if(actor===state.player||monsterAttackLineR(actor,range,{target:core}).ok||monsterMovementLocked57(actor)||monsterPathStep(actor,core))return core;
 // A blocked core route must not prevent combat with the bodies guarding it.
 // Re-evaluate each turn so an opened passage immediately restores core priority.
 const obstacles=state.monsters.filter(t=>!t.combatFixture54&&combatTargetValid57(actor,t)&&!entityConcealed(t)&&actorDetectedTarget57(actor,t,monsterSenseRadius(actor))&&!(t.bossPattern==='master'&&activeCore(t))).sort((a,b)=>entityDistance57(actor,a)-entityDistance57(actor,b));
 return obstacles.find(t=>monsterAttackLineR(actor,range,{target:t}).ok||monsterPathStep(actor,t))||core;
}
function selectCombatOpponent(actor){return priorityCoreTarget(actor)||[state.player,...state.monsters].filter(t=>combatTargetValid57(actor,t)&&!t.combatFixture54).sort((a,b)=>entityDistance57(actor,a)-entityDistance57(actor,b))[0]||null}
function bossChildOf(child,boss){return !!(child&&boss&&child.bossOwnerId57===combatantId(boss))}
function bossOwner(child,pattern=null){return state.monsters.find(m=>m.hp>0&&(!pattern||m.bossPattern===pattern)&&child.bossOwnerId57===combatantId(m))||null}
function bossAreaTargets(mon,cells){const keys=new Set(cells.map(c=>k(c.x,c.y)));return [state.player,...state.monsters].filter(t=>combatTargetValid57(mon,t)&&entityFootprintCells57(t).some(c=>keys.has(k(c.x,c.y))))}
function coreSealSector(mon,target,range){
 const origin=entityClosestCellTo57(mon,target)||{x:mon.x,y:mon.y},aim=entityClosestCellTo57(target,origin)||target,dx=aim.x-origin.x,dy=aim.y-origin.y,length=Math.hypot(dx,dy),halfAngle=BOSS_ARENA_RULES.master.sealAngle*Math.PI/360;
 if(!length)return{cells:[],origin57:origin,direction57:{x:0,y:1},range,halfAngle,shape57:'sector'};
 const direction57={x:dx/length,y:dy/length},cells=[],radius=range+.25,limit=Math.ceil(radius),edge=Math.cos(halfAngle);
 for(let y=Math.max(1,origin.y-limit);y<=Math.min(ROWS-2,origin.y+limit);y++)for(let x=Math.max(1,origin.x-limit);x<=Math.min(COLS-2,origin.x+limit);x++){
  const vx=x-origin.x,vy=y-origin.y,d=Math.hypot(vx,vy);if(!d||d>radius||monCovers(mon,x,y)||(vx*direction57.x+vy*direction57.y)/d<edge-1e-9||tileBlocksSight(state.map[y]?.[x]))continue;
  if(combatLineCheckR8(origin.x,origin.y,x,y,{range:limit,units:false}).ok)cells.push({x,y});
 }
 return{cells,origin57:{x:origin.x,y:origin.y},direction57,range,halfAngle,shape57:'sector'};
}
function lineToward(mon,target,steps=4){const out=[];let x=mon.x,y=mon.y;for(let i=0;i<steps;i++){const dx=Math.sign(target.x-x),dy=Math.sign(target.y-y);if(Math.abs(target.x-x)>=Math.abs(target.y-y))x+=dx;else y+=dy;if(!cell54(x,y))break;out.push({x,y})}return out}
function bossCharge(mon,target){if(!target)return;const aimed={...target};for(let i=0;i<4;i++){const dx=Math.sign(aimed.x-mon.x),dy=Math.sign(aimed.y-mon.y);let nx=mon.x,ny=mon.y;if(Math.abs(aimed.x-mon.x)>=Math.abs(aimed.y-mon.y))nx+=dx;else ny+=dy;const t=state.map[ny]?.[nx];if([TT.TABLE,TT.SCREEN,TT.JAR,TT.DOOR].includes(t)){setTerrainTile58(state.map,nx,ny,TT.FLOOR);burst(nx,ny,'#a66543',9,.65);globalThis.__MANRU_SFX54__?.play?.('door')}if(!PlacementService.monsterCanStand(mon,nx,ny))break;OccupancyService.move(mon,nx,ny)}for(const victim of [state.player,...state.monsters])if(combatTargetValid57(mon,victim)&&entityDistance57(mon,victim)<=1){attackMonster(mon,5,{target:victim,delivery:'melee',range:1,fixedArea58:true});break}}
function executeBossIntent(mon){
 const I=mon.intent54;if(!I)return false;
 if(I.type.startsWith('palace'))return palaceResolveIntent(mon,I);
 if(I.type==='blackFrost105'){mountainFrostResolve(mon,I);clearIntent(mon);return true}
 if(I.type==='charge'){bossCharge(mon,I.data.target||selectCombatOpponent(mon));clearIntent(mon);return true}
 if(I.type==='weave'){
  const live=new Set(state.monsters.filter(m=>m.hp>0&&m.combatFixture54==='silk'&&bossChildOf(m,mon)).map(m=>m.mirrorIndex54));mon.silk54.links=I.data.links.filter(l=>live.has(l.a)&&live.has(l.b));
  for(const l of mon.silk54.links)for(const c of l.cells)if((c.x+c.y)%3===0)burst(c.x,c.y,'#e6aaca',2,.3);
  clearIntent(mon);return true;
 }
 if(I.type==='ink')for(const c of I.cells.slice(0,3))if(state.map[c.y]?.[c.x]===TT.FLOOR)RuntimeTerrainOwner.mutate(c.x,c.y,TT.BAMBOO,{source:'boss-ink54'});
 let targets=bossAreaTargets(mon,I.cells);
 if(I.type==='corebolt'){
  const origin=I.data.origin57||mon;
  for(const c of I.cells)burst(c.x,c.y,'#eed080',2,.38);
  for(const target of targets)if(combatTargetValid57(mon,target))attackMonster(mon,I.data.bonus,{target,delivery:'area',projectile:false,reflectable:false,range:I.data.range,origin57:origin,fixedArea58:true});
  clearIntent(mon);return true;
 }
 if(I.type==='chain'){
  const origin=I.data.origin||mon,end=I.cells.at(-1)||mon,cells=keeperChainCells(origin,end),anchors=mon.arena54?.anchors||[];
  const anchorIndex=cells.findIndex(c=>anchors.some(a=>!a.broken&&a.x===c.x&&a.y===c.y));
  targets=targets.filter(t=>entityDistance57(mon,t)>=3&&entityDistance57(mon,t)<=8);
  const first=targets.map(t=>({target:t,index:cells.findIndex(c=>monCovers(t,c.x,c.y))})).filter(v=>v.index>=0).sort((a,b)=>a.index-b.index)[0];
  if(anchorIndex>=0&&(!first||anchorIndex<first.index)){
   const anchor=anchors.find(a=>!a.broken&&a.x===cells[anchorIndex].x&&a.y===cells[anchorIndex].y);playHookPullFx57(mon,anchor,'#e7c18b');mon.bound54={until:state.turn+BOSS_ARENA_RULES.keeper.bindTurns+1,def:mon.def,x:anchor.x,y:anchor.y};mon.def=BOSS_ARENA_RULES.keeper.boundDef;floatText(mon.x,mon.y,'철쇄 걸림 · DEF 2','#ffdc99',14);addLog(mon.name+'의 쇠사슬이 형틀에 걸렸다.');targets=[];
  }else targets=first?[first.target]:[];
 }
 for(const target of targets){
  if(!combatTargetValid57(mon,target))continue;
  const range=I.type==='blade'?2:10;
  if(!entityCombatLineCheckR(mon,target,{range,units:false}).ok)continue;
  if(I.type==='blade'){const result=attackMonster(mon,6,{target,delivery:'melee',range:2,fixedArea58:true});if(result.hit)combatStatus(mon,target,'bleed',4)}
  else if(I.type==='chain'){playHookPullFx57(mon,target);damageCombatTarget(mon,target,7,'쇠사슬 충격','#b4947c');if(target.hp>0){resolveForcedMovement57(target,mon,2,{mode:'pull',hostile:true,orthogonal:true,creditPlayer:entityFaction(mon)==='player'});combatStatus(mon,target,'weaken',2)}}
  else if(I.type==='maul'){damageCombatTarget(mon,target,9,'광견의 짓밟기','#c86d4f');combatStatus(mon,target,'weaken',2)}
  else if(I.type==='ink'||I.type==='inkbeam'){damageCombatTarget(mon,target,I.type==='ink'?9:11,I.type==='ink'?'먹선 폭발':'먹비 직선','#9bac91');combatStatus(mon,target,'blind',3)}
  else if(I.type==='sew'){damageCombatTarget(mon,target,3,'되감는 재봉','#e8a2c9');combatStatus(mon,target,'bleed',3)}
 }
 clearIntent(mon);return true;
}
function tickLegendFields(){
 for(const f of state.legendFireFields47||[]){if(state.turn>f.born&&f.ttl>0){applyElementField57(f,'fire',3,{radius:0,source:'화염지대',color:'#ff8c52',size:9});if(runState57()!=='playing')return;f.ttl--}}state.legendFireFields47=(state.legendFireFields47||[]).filter(f=>f.ttl>0);
}
let noiseBudget=null;
function alertNearby(x,y,radius=5,kind='impact',damage=0){
 if(!state||!Number.isInteger(x)||!Number.isInteger(y)||!Number.isFinite(radius)||radius<=0)return 0;
 const modern=state.floor>=11;
 if(!noiseBudget)noiseBudget={newlyAlerted:0,fields:new Map(),smoke:null,fieldList:null};
 if(noiseBudget.fieldList!==state.tempFields||!noiseBudget.smoke){
  noiseBudget.smoke=new Set();noiseBudget.fieldList=state.tempFields;noiseBudget.fields.clear();
  for(const f of state.tempFields||[])if(f.kind==='smoke'&&f.ttl>0)for(const c of tempFieldCells57(f))noiseBudget.smoke.add(k(c.x,c.y));
 }
 const smoke=noiseBudget.smoke;
 if(!modern&&!smoke.size&&state.branchContext105?.id!=='granary'){let count=0;for(const m of state.monsters)if(isHostileTarget57(m)&&entityDistance57(m,{x,y})<=radius){m.alerted=true;m.heardPosition={x,y};m.searchTurns=Math.max(m.searchTurns||0,5);m.lostSight=0;count++}return count}
 if(modern){
  radius+=Math.min(1.5,Math.floor(Math.max(0,Number(damage)||0)/10)*.25);
  const agency=(state.playerAgencyTurns57||0)+(state._turnPipelineActive57?Number(!!state._turnAgencyWillCount57&&!state._turnAgencyCounted57):1),previous=state.noiseSequence57;
  const overlaps=previous&&previous.multiplier>1&&Math.abs(x-previous.x)+Math.abs(y-previous.y)<=8;
  const repeats=previous&&Math.abs(x-previous.x)+Math.abs(y-previous.y)<=8&&(agency-previous.agency<=1||overlaps);
  const multiplier=repeats?Math.min(3,previous.multiplier*(1+radius/40)):1;
  state.noiseSequence57={agency,x,y,multiplier};
  radius*=2*multiplier;
 }
 radius=Math.ceil(radius);
 const cap=modern?(state.floor<16?4:5)+(kind==='roar'?1:0):Infinity,key=k(x,y);
 let field=noiseBudget.fields.get(key);
 if(!field){field={dist:new Map([[key,0]]),buckets:[[{x,y}]],nextCost:0};noiseBudget.fields.set(key,field)}
 const {dist,buckets}=field;
 for(let cost=field.nextCost;cost<=radius*2;cost++){
  for(const q of buckets[cost]||[]){
   if(dist.get(k(q.x,q.y))!==cost||smoke.has(k(q.x,q.y)))continue;
   for(const[dx,dy]of DIRS4){const nx=q.x+dx,ny=q.y+dy,t=state.map[ny]?.[nx];if(t==null||nx<1||ny<1||nx>=COLS-1||ny>=ROWS-1)continue;if(terrainBaseTile58(nx,ny)===TT.WALL)continue;
    const attenuation=smoke.has(k(nx,ny))?Infinity:t===TT.OPEN_DOOR?2:t===TT.DOOR?6:tileBlocks(t)?4:2,next=cost+attenuation;
    if(!Number.isFinite(next)||next>=(dist.get(k(nx,ny))??Infinity))continue;dist.set(k(nx,ny),next);(buckets[next]||(buckets[next]=[])).push({x:nx,y:ny});
   }
  }
  field.nextCost=cost+1;
 }
 let threat=0;
 if(modern)for(const m of state.monsters)if(isThreatVisibleToPlayer(m)){const d=entityDistance57(m,state.player);if(d<=8)threat+=Math.min(1,(10-d)/8)}
 const sensitivity=modern?Math.max(.3,1/(1+.04*threat+.2*Math.pow(Math.max(0,threat-1),2))):1,hearingCost=Math.floor(radius*2*sensitivity),contacts=[];
 for(const m of state.monsters){const cost=dist.get(k(m.x,m.y));if(isHostileTarget57(m)&&cost!==undefined&&cost<=hearingCost)(contacts[cost]||(contacts[cost]=[])).push(m)}
 let count=0;
 for(let cost=0;cost<=hearingCost;cost++)for(const m of contacts[cost]||[]){if(m.sleeping105&&m.doorSleep105)continue;if(modern&&m.guardHome57&&!monsterPatrolAllows(m,x,y,'patrol'))continue;if(!m.alerted){if(noiseBudget.newlyAlerted>=cap)continue;noiseBudget.newlyAlerted++;m.alerted=true}branchWake(m,'소음');m.heardPosition={x,y,bornTurn:(state.floorTurn||0)+.5,intensity:Math.max(0,radius*sensitivity-cost/2)};m.searchTurns=Math.max(m.searchTurns||0,modern?Math.ceil(radius*2*sensitivity)+8:5);m.lostSight=0;count++}return count;
}
function wanderMonster(mon,origin=null,movement={}){const bounds=movement.movementBounds;const opts=DIRS8.map(([dx,dy])=>({x:mon.x+dx,y:mon.y+dy})).filter(q=>(!bounds||entityDistanceAt(mon,q.x,q.y,bounds.owner)<=bounds.radius)&&(!origin||entityDistance57(q,origin)<=3)&&monsterPatrolAllows(mon,q.x,q.y,'patrol')&&canMonsterStep(mon,mon.x,mon.y,q.x,q.y));if(!opts.length)return false;const q=choice(opts);return moveMonsterStep(mon,q.x,q.y,movement)}
function monsterPatrolAllows(mon,x,y,mode='move'){
 const h=mon.guardHome57;if(!h||state?.debugBattle57)return true;
 if(mode==='move'){
  if((mon.searchTurns>0&&(mon.lastSeenPosition||mon.attackInvestigation57))||(mon.retaliationId53&&state.turn<=mon.retaliationUntilTurn54))return true;
  const outside=h.room?mon.x<h.room.x||mon.y<h.room.y||mon.x>=h.room.x+h.room.w||mon.y>=h.room.y+h.room.h:Math.max(Math.abs(mon.x-h.x),Math.abs(mon.y-h.y))>4;
  if(outside)return true;
 }
 return h.room?x>=h.room.x&&y>=h.room.y&&x<h.room.x+h.room.w&&y<h.room.y+h.room.h:Math.max(Math.abs(x-h.x),Math.abs(y-h.y))<=4;
}
// A* uses the same footprint, occupancy and movement checks as ordinary combat.
// Chebyshev distance is admissible for the game's eight-direction, unit-cost movement.
function monsterPathStep(mon,target,exact=false,placement=null,opts={}){
 const heap=[],cost=new Float64Array(COLS*ROWS);cost.fill(Infinity);let serial=0;
 const distance=opts.followDistance??1,bounds=opts.movementBounds;const heuristic=(x,y)=>exact?Math.max(Math.abs(x-target.x),Math.abs(y-target.y)):Math.max(0,entityDistanceAt(mon,x,y,target)-distance);
 const earlier=(a,b)=>a.score<b.score||(a.score===b.score&&(a.h<b.h||(a.h===b.h&&a.order<b.order)));
 const push=node=>{let i=heap.length;heap.push(node);while(i>0){const p=(i-1)>>1;if(!earlier(node,heap[p]))break;heap[i]=heap[p];i=p}heap[i]=node};
 const pop=()=>{const first=heap[0],last=heap.pop();if(heap.length){let i=0;while(i*2+1<heap.length){let child=i*2+1;if(child+1<heap.length&&earlier(heap[child+1],heap[child]))child++;if(!earlier(heap[child],last))break;heap[i]=heap[child];i=child}heap[i]=last}return first};
 const start={x:mon.x,y:mon.y,depth:0,first:null,h:heuristic(mon.x,mon.y),order:serial++};start.score=start.h;cost[start.y*COLS+start.x]=0;push(start);
 while(heap.length){
  const a=pop();if(a.depth!==cost[a.y*COLS+a.x])continue;
  if(a.first&&(exact?a.x===target.x&&a.y===target.y:entityDistanceAt(mon,a.x,a.y,target)<=distance)&&PlacementService.monsterCanStand(mon,a.x,a.y,placement,{ignore:opts.movementIgnore}))return a.first;
  for(const [dx,dy]of DIRS8){const x=a.x+dx,y=a.y+dy;if(x<0||y<0||x>=COLS||y>=ROWS)continue;const id=y*COLS+x,depth=a.depth+1;if(depth>=cost[id]||(bounds&&entityDistanceAt(mon,x,y,bounds.owner)>bounds.radius)||!canMonsterStep(mon,a.x,a.y,x,y,placement,opts))continue;
   cost[id]=depth;const h=heuristic(x,y);push({x,y,depth,first:a.first||{x,y},h,score:depth+h,order:serial++});
  }
 }
 return null;
}
function moveMonsterToward(mon,target=null,opts={}){
 if(isHostileTarget57(mon)&&playerConcealed58()&&!dojoMarkedPursuer(mon)&&(!target||target===state.player))return false;
 let p=target||monsterInvestigationTarget(mon)||mon.migrationTarget57||(mon.boss?state.player:null);if(!p)return false;if(mon.guardHome57&&!monsterPatrolAllows(mon,p.x,p.y))p=mon.guardHome57;
 if(mon.drunk57||mon.drunk>0){const drunk=drunkMovementOutcome57();if(drunk==='misstep')return wanderMonster(mon,null,opts);if(drunk==='stumble')return false;}
 const placement=null;
 const flank=combatDepth(mon)>=11&&mon.role61==='flanker'&&combatTargetValid57(mon,p)&&actorDetectedTarget57(mon,p),goals=new Map();
 if(flank){
  const facing=p.facing||p.facing57||{x:0,y:1},reserved=new Set();
  for(const other of state.monsters)if(other!==mon&&other.hp>0&&other.flankRound105===state.floorTurn&&other.flankOpponent105===(p===state.player?'player':combatantId(p))&&entitiesAllied57(mon,other)&&other.flankTarget57)reserved.add(k(other.flankTarget57.x,other.flankTarget57.y));
  for(const [dx,dy]of DIRS8){const x=p.x+dx,y=p.y+dy;if(!reserved.has(k(x,y))&&PlacementService.monsterCanStand(mon,x,y,placement))goals.set(k(x,y),dx*facing.x+dy*facing.y)}
 }
 const exact=!!mon.guardHome57&&p===mon.guardHome57,ox=mon.x,oy=mon.y,seen=new Set([k(ox,oy)]),q=[{x:ox,y:oy,first:null,depth:0}];
 const dirs=[...DIRS8].sort((a,b)=>entityDistanceAt(mon,ox+a[0],oy+a[1],p)-entityDistanceAt(mon,ox+b[0],oy+b[1],p));
 let step=null,goal=null,best=Infinity;
 if(!goals.size)step=monsterPathStep(mon,p,exact,placement,opts);
 else for(let i=0;i<q.length;i++){
  const a=q[i];if(goal&&a.depth*2-2>best)break;
  if(a.first){
   if(goals.size){const side=goals.get(k(a.x,a.y));if(side!==undefined&&a.depth*2+side<best){best=a.depth*2+side;step=a.first;goal=a}}
   else if(exact?a.x===p.x&&a.y===p.y:entityDistanceAt(mon,a.x,a.y,p)<=1){step=a.first;break}
  }
  for(const [dx,dy]of dirs){const x=a.x+dx,y=a.y+dy,id=k(x,y);if(seen.has(id)||!canMonsterStep(mon,a.x,a.y,x,y,placement))continue;seen.add(id);q.push({x,y,first:a.first||{x,y},depth:a.depth+1})}
 }
 if(goal){mon.flankTarget57={x:goal.x,y:goal.y};mon.flankRound105=state.floorTurn;mon.flankOpponent105=p===state.player?'player':combatantId(p)}
 if(!step&&!exact&&combatTargetValid57(mon,p)){
  // Plan toward a hostile-occupied passage, but commit only a legal empty step.
  // Once its defenders are visible, target selection can clear the obstruction.
  const blocked=new Set(state.monsters.filter(t=>t!==p&&!t.combatFixture54&&combatTargetValid57(mon,t)&&!combatInvulnerability(t)));blocked.add(mon);
  if(blocked.size>1)step=monsterPathStep(mon,p,false,placement,{...opts,movementIgnore:blocked});
 }
 if(step)return moveMonsterStep(mon,step.x,step.y,opts);
 if(mon.wallBreak){const dx=Math.sign(p.x-ox),dy=Math.sign(p.y-oy),tx=ox+(Math.abs(p.x-ox)>Math.abs(p.y-oy)?dx:0),ty=oy+(Math.abs(p.x-ox)>Math.abs(p.y-oy)?0:dy);if(state.map[ty]?.[tx]===TT.WALL){RuntimeTerrainOwner.mutate(tx,ty,TT.FLOOR,{source:'monster-wallbreak'});addLog(mon.name+'가 벽을 부쉈다.')}}return false;
}
function playSummonArrival(summoner,spawned){if(!spawned)return;vfVibrate(HAPTIC_PATTERN57.summon);const color=spawned.color||'#c6a3d9';if(summoner){burst(summoner.x,summoner.y,color,12,.55);projectileFX(summoner.x,summoner.y,spawned.x,spawned.y,color)}burst(spawned.x,spawned.y,color,30,1.2);impact(spawned.x,spawned.y,color,6);floatText(spawned.x,spawned.y,'소환',color,12);spawned.hitUntil=Math.max(spawned.hitUntil||0,performance.now()+260)}
function resolveSummonDefinition(name){
  if(typeof name!=='string'||!name)return null;
  const exact=MONSTERS.find(x=>x.name===name);if(exact)return{def:exact,requested:name,fallback:false};
  const fallback=typeof floorEnemyDefinitions==='function'?(floorEnemyDefinitions()[0]||null):null;
  return fallback?{def:fallback,requested:name,fallback:true}:null
}
function summonNear(mon,name){
  const resolved=resolveSummonDefinition(name),d=resolved?.def;if(!mon||!d){if(mon)mon.lastSummonFailure57={reason:'missing-definition',name,turn:state?.floorTurn??0};return null}
  const occupied=new Set(entityFootprintCells57(mon).map(c=>k(c.x,c.y))),candidates=new Map();for(const c of entityFootprintCells57(mon))for(const[dx,dy]of DIRS8){const x=c.x+dx,y=c.y+dy,key=k(x,y);if(!occupied.has(key))candidates.set(key,{x,y})}
  for(const {x,y}of candidates.values()){if(x>0&&y>0&&x<COLS-1&&y<ROWS-1&&!OccupancyService.isOccupied(x,y)){const m=scaledMonster(clone(d),mon.debugFloor57||branchCombatFloor());m.hp=Math.round(m.hp*.65);m.maxHp=m.hp;m.atk=Math.max(2,m.atk-2);m.x=x;m.y=y;m.spawnProvenance57='summon';adoptBossChild57(m,mon);if(resolved.fallback)m.summonFallback57=resolved.requested;if(PlacementService.monsterCanStand(m,x,y)&&OccupancyService.addMonster(m)){delete mon.lastSummonFailure57;playSummonArrival(mon,m);return m}}}
  mon.lastSummonFailure57={reason:'no-space',name,turn:state.floorTurn};return null
}
function handleBossPattern(mon,d,target=state.player){
    if(!combatTargetValid57(mon,target)&&!mon.intent54)return false;advanceBossClock54(mon);const p=target,turn=state.floorTurn;
    if(mon.bossPattern==='needle'&&!mon.arena54&&d>mon.range)return false;
    if(mon.storyPhase992!==1&&['needle','keeper','master'].includes(mon.bossPattern)){if(mon.bossPattern!=='master'&&!mon.arena54)prepareBossArena(mon);if(!mon.alerted&&!actorDetectedTarget57(mon,p,40))return true}
    if(mon.bound54){if(state.turn<mon.bound54.until)return true;mon.def=mon.bound54.def;delete mon.bound54;floatText(mon.x,mon.y,'철쇄 해방','#d6a97d',12)}
    if(mon.bossPattern==='needle'&&mon.needleGasShotReady54&&mon.intent54?.type==='sew')clearIntent(mon);
    if(mon.bossPattern==='palaceKing105')return palaceKingTurn(mon,p);
    if(mon.intent54){if(state.turn<=(mon.intent54.armedPlayerTurn??state.turn))return true;return executeBossIntent(mon)}
    if(mon.skillSeal105>0)return false;
    if(p===state.player&&playerConcealed58())return mon.bossPattern==='blackFrost105';
    if(mon.bossPattern==='blackFrost105'){mountainFrostPattern(mon,d,p);return true}
    if(mon?.storyPhase992===1&&typeof globalThis.storyFriendBossPattern992==='function')return globalThis.storyFriendBossPattern992(mon,d,p);
    if(mon.bossPattern==='houndboss'){
      if(turn%10===0&&state.monsters.filter(m=>!m.boss&&m.name==='객잔 쥐'&&m.hp>0&&bossChildOf(m,mon)).length<2&&summonNear(mon,'객잔 쥐')){addLog('광견 대장이 바닥을 긁자 쥐가 튀어나왔다.');return true}
      if(turn%7===0&&d<=6){const cells=[{x:p.x,y:p.y},...DIRS4.map(([dx,dy])=>({x:p.x+dx,y:p.y+dy}))];return setBossIntent(mon,'maul',cells,'광견 짓밟기 · 십자 범위에서 벗어나라')}
      if(turn%3===0&&d>=3&&d<=8&&lineClear(mon.x,mon.y,p.x,p.y)){const target={x:p.x,y:p.y};return setBossIntent(mon,'charge',lineToward(mon,target,5),'광폭 돌진 · 붉은 선을 비켜라',{target})}
    }
    if(mon.bossPattern==='painter'){
      if(turn%8===0&&state.monsters.filter(m=>m.name==='종이 호랑이'&&m.hp>0&&bossChildOf(m,mon)).length<2&&spawnPaperTiger(mon)){addLog('화공 노인이 종이 호랑이 하나를 그렸다.');return true}
      if(turn%7===0&&d<=8&&monsterAttackLineR(mon,8,{target:p}).ok){return setBossIntent(mon,'inkbeam',lineToward(mon,p,8),'먹비 직선 · 사선에서 벗어나라')}
      if(turn%4===0){const cells=[{x:p.x,y:p.y},...DIRS4.map(([dx,dy])=>({x:p.x+dx*2,y:p.y+dy*2}))];return setBossIntent(mon,'ink',cells,'묵죽 폭발 · 먹선 밖으로 이동')}
    }
    if(mon.bossPattern==='needle'){
      const silk=mon.silk54;
      if(turn>=silk.nextRepair){placeSilkMirrors54(mon,true,p);silk.nextRepair=turn+BOSS_ARENA_RULES.silk.repairCooldown}
      if(mon.needleGasShotReady54&&d<=mon.range&&monsterAttackLineR(mon,mon.range,{target:p,delivery:'ranged'}).ok){
       const shot=executeMonsterAttackBundle57(mon,p,{count:1,context:{delivery:'ranged',projectile:true,reflectable:true,range:mon.range,atkScale:3},projectileColor:'#b982c3',projectileVisual57:{kind:'gas',size:14,life:340},projectileImpact57:{gasStatus57:MONSTERS.find(m=>m.name==='환각의 향로').gasStatus57,turns:BOSS_ARENA_RULES.silk.gasDuration,radius:10,burstRadius:4,visualDelay57:340}});
       if(shot.results.some(r=>r.attempted&&!r.blocked)){delete mon.needleGasShotReady54;delete mon.threadTarget54;}return true;
      }
      if(mon.threadTarget54){const target=mon.threadTarget54;delete mon.threadTarget54;return setBossIntent(mon,'sew',combatLineCellsR8(mon.x,mon.y,target.x,target.y).filter(c=>!monCovers(mon,c.x,c.y)),'되감는 재봉 · 걸렸던 실 방향에서 벗어나라')}
      if(turn>=silk.nextWeave){const links=planSilkWeave54(mon);silk.nextWeave=turn+BOSS_ARENA_RULES.silk.weaveCooldown;if(links.length)return setBossIntent(mon,'weave',links.flatMap(l=>l.cells),'비단 결계 · 거울을 깨 통로를 열어라',{links})}
      if(d<=mon.range&&monsterAttackLineR(mon,mon.range,{target:p,delivery:'ranged'}).ok){projectileFX(mon.x,mon.y,p.x,p.y,'#e0bdce');attackMonster(mon,0,{target:p,delivery:'ranged',range:mon.range});return true;}
    }
    if(mon.bossPattern==='keeper'){
      tickKeeperLava54(mon,p);const anchors=mon.arena54.anchors;
      if(mon.hp<=mon.maxHp*.5&&anchors.filter(a=>!a.broken).length>2){for(const a of anchors.filter(v=>!v.broken).slice(0,2)){a.broken=true;burst(a.x,a.y,'#b48b70',22,.9)}addLog('간수가 형틀 두 개를 뜯어냈다. 남은 쇠고리로 쇠사슬을 유도하라.');return true}
      if(turn%BOSS_ARENA_RULES.keeper.chainCooldown===0&&d>=3&&d<=8&&monsterAttackLineR(mon,8,{target:p}).ok){const cells=keeperChainCells(mon,p);return setBossIntent(mon,'chain',cells,'강철 쇠사슬 · 등 뒤 형틀로 유도한 뒤 옆으로 피해라',{origin:{x:mon.x,y:mon.y}})}
      if(turn%3===0&&d<=2){const cells=DIRS8.map(([dx,dy])=>({x:mon.x+dx,y:mon.y+dy}));return setBossIntent(mon,'blade',cells,'형틀 칼날 · 간수에게서 떨어져라')}
    }
    if(mon.bossPattern==='master'){
      const core=activeCore(mon),ph=(mon.coreStage54||0)+1,range=core?BOSS_ARENA_RULES.master.shieldRange:BOSS_ARENA_RULES.master.range;
      if(turn<(mon.nextAction54||0))return true;
      mon.nextAction54=turn+(core?2:1);
      if(p===state.player&&playerConcealed58())return true;
      if(d<=1&&monsterAttackLineR(mon,1,{target:p}).ok){attackMonster(mon,core?-2:0,{target:p,delivery:'melee',range:1});return true}
      const seal=turn>=(mon.nextShot54||0)&&d<=range?coreSealSector(mon,p,range):null;
      if(seal?.cells.some(c=>monCovers(p,c.x,c.y))){
        mon.nextShot54=turn+(core?BOSS_ARENA_RULES.master.shieldShotCooldown:BOSS_ARENA_RULES.master.shotCooldown[ph-1]);
        const {cells,...sealData}=seal;return setBossIntent(mon,'corebolt',cells,'천실 인장 · 금빛 부채꼴에서 벗어나라',{...sealData,bonus:core?-2:0});
      }
      moveMonsterToward(mon,p);if(!core&&ph===3&&turn%4===0)moveMonsterToward(mon,p);return true;
    }


    return false;
  }
function combatantId(m){if(!m.combatantId54)m.combatantId54=`enemy-${state.floor}-${state.nextCombatantId54=(state.nextCombatantId54||0)+1}`;return m.combatantId54}
function removeAlly(a){OccupancyService.removeMonster(a);burst(a.x,a.y,'#785d86',10,.5);for(const m of state.monsters)if(m.retaliationId53===a.allyId53)clearRetaliation(m)}
function finishAllyAction(a){if(Number.isFinite(a.allyExpireTurn47)&&state.turn>=a.allyExpireTurn47)removeAlly(a)}
function alliesTurn(){
 if(!state)return;summonCleanup();summonEscortTurn();const friends=[...state.monsters].filter(m=>isPlayerAlly57(m)&&(m.hp>0||m.revivePhase57==='corpse'));
 for(const a of friends){
  if(a.allyLastActionRound57===state.floorTurn)continue;a.allyLastActionRound57=state.floorTurn;
  if(a.revivalLives57&&advanceMonsterRevival(a))continue;if(a.hp<=0){killMonster(a);continue}if(a.combatFixture54){tickBossFixture(a);continue}
  if(!a.allyId53)a.allyId53=`ally-${state.turn}-${state.nextAllyId53=(state.nextAllyId53||0)+1}`;
  if(a.legendAlly47&&!Number.isFinite(a.allyExpireTurn47))a.allyExpireTurn47=state.turn+Math.max(1,Number(a.ttl47)||24);
  if(Number.isFinite(a.allyExpireTurn47)){a.ttl47=Math.max(0,a.allyExpireTurn47-state.turn+1);if(state.turn>a.allyExpireTurn47){removeAlly(a);continue}}
  if(a.dormant57||a.sleeping105){finishAllyAction(a);continue}if(a.martialActor105)tickMartialActor(a);if(a.stunned>0){a.stunned--;finishAllyAction(a);continue}const schedule=monsterActionSchedule(a),escort=a.summonOwner105==='player';
  if(schedule.act&&palaceTideResponse(a)){finishAllyAction(a);continue;}
  const engaged=escort?summonCombatTarget(a):null;
  if(escort&&!engaged&&entityDistance57(a,state.player)>2){delete a.allyTargetId54;delete a.allyLastSeenPosition54;delete a.allySearchUntilTurn54;finishAllyAction(a);continue;}
  if(!schedule.act){finishAllyAction(a);continue}
  const seen=state.monsters.filter(m=>actorDetectedTarget57(a,m,12)&&(!escort||entityDistance57(m,state.player)<=SUMMON_RULES.acquireRadius)).sort((x,y)=>(entityDistance57(x,a)-(x.boss?2:0))-(entityDistance57(y,a)-(y.boss?2:0)));
  let t=(escort?seen.find(m=>m.combatFixture54==='core'):priorityCoreTarget(a))||engaged?.target||seen[0]||null,dest=null;
  if(t){a.alerted=true;a.lastSeenPosition={x:t.x,y:t.y};a.searchTurns=6;a.allyTargetId54=combatantId(t);a.allyLastSeenPosition54={x:t.x,y:t.y};a.allySearchUntilTurn54=state.turn+(escort?SUMMON_RULES.combatMemoryTurns:4);dest=t}
  else if(engaged)dest=engaged.destination;
  else if(!escort&&a.allyTargetId54&&state.turn<=(a.allySearchUntilTurn54??-1)){
    const remembered=state.monsters.find(m=>combatTargetValid57(a,m)&&combatantId(m)===a.allyTargetId54);
    if(remembered&&actorDetectedTarget57(a,remembered,12)){t=remembered;a.allyLastSeenPosition54={x:t.x,y:t.y};dest=t}else dest=a.allyLastSeenPosition54;
  }else{delete a.allyTargetId54;delete a.allyLastSeenPosition54;delete a.allySearchUntilTurn54}
  resolveMonsterTargetTurn57(a,t||dest||state.player,schedule,{followDistance:dest||t?1:2,movementBounds:escort?{owner:state.player,radius:dest||t?SUMMON_RULES.combatLeash:2}:null});
  finishAllyAction(a);
 }
}
function clearRetaliation(mon){delete mon.retaliationId53;delete mon.retaliationUntilTurn54;delete mon.retaliationLastPosition54;delete mon.retaliationTurns53}
function retaliationTarget(mon){
 if(!mon?.retaliationId53)return null;
 if(!Number.isFinite(mon.retaliationUntilTurn54)&&Number.isFinite(mon.retaliationTurns53))mon.retaliationUntilTurn54=state.turn+Math.max(0,mon.retaliationTurns53);
 if(!Number.isFinite(mon.retaliationUntilTurn54)||state.turn>mon.retaliationUntilTurn54){clearRetaliation(mon);return null}
 const ally=[state.player,...state.monsters].find(a=>combatTargetValid57(mon,a)&&(a===state.player?'player':a.allyId53||a.combatantId54)===mon.retaliationId53);
 if(!ally){clearRetaliation(mon);return null}
 const confirms=actorDetectedTarget57(mon,ally,Math.max(4,monsterSenseRadius(mon)+2));
 if(confirms)mon.retaliationLastPosition54={x:ally.x,y:ally.y};
 if(confirms)return ally;
 const q=mon.retaliationLastPosition54;return q?{x:q.x,y:q.y,retaliationMemory54:true,allyId53:ally.allyId53}:null;
}
const VISIBILITY_STACK_RULES=Object.freeze([
 Object.freeze({trait:'gaze',counter:'gazeCount',minRange:0,range:6,turns:5,mutual:true}),
 Object.freeze({trait:'hook',counter:'sight',minRange:3,range:7,turns:3})
]);
function visibilityStackRules(mon){
 const authored=Array.isArray(mon.visStack57)?mon.visStack57:mon.visStack57?[mon.visStack57]:[];
 return [...VISIBILITY_STACK_RULES.filter(r=>mon[r.trait]),...authored.filter(r=>r&&typeof r.counter==='string'&&Number.isFinite(r.range)&&r.range>0)];
}
function visibilityStackTarget(mon,target,rule,sees=actorDetectedTarget57(mon,target,Math.max(monsterSenseRadius(mon),rule.range))){
 const distance=entityDistance57(mon,target);
 return !!(combatTargetValid57(mon,target)&&sees&&distance>=(rule.minRange||0)&&distance<=rule.range&&(!rule.mutual||target!==state.player||isEntityObservableToPlayer57(mon))&&monsterAttackLineR(mon,rule.range,{target}).ok);
}
function continuousEnemyTarget(mon,player,detectPlayer){
 if(combatTargetValid57(mon,player)&&(!playerConcealed58()||dojoMarkedPursuer(mon))&&(dojoMarkedPursuer(mon)||mon.persistentChase57&&(mon.hasSeenPlayer105||mon.alerted)))return player;
 const rules=visibilityStackRules(mon);if(!rules.length)return null;
 const previous=mon.specialOpponent105==='player'?player:mon.specialOpponent105?state.monsters.find(t=>t.combatantId54===mon.specialOpponent105):null,targets=[previous,...(detectPlayer?[player]:[])];
 for(const target of targets)if(target&&rules.some(rule=>visibilityStackTarget(mon,target,rule)))return target;
 return null;
}
function selectEnemyTarget(mon){
 const core=priorityCoreTarget(mon);if(core)return core;
 const p=state.player,validPlayer=combatTargetValid57(mon,p)&&(!playerConcealed58()||dojoMarkedPursuer(mon)),detectPlayer=validPlayer&&playerDetectedBy(mon),revenge=retaliationTarget(mon),range=mon.ranged?(mon.range||6):(mon.reach||1);
 const others=state.monsters.filter(t=>actorDetectedTarget57(mon,t,Math.max(10,range)));
 const line=detectPlayer?entityCombatLineCheckR(mon,p,{range:Math.max(10,range),ignore:p}):null,blocker=line?.blocker;
 // A real hostile body in the way is an attack target; allied bodies never become enemies.
 if(blocker&&others.includes(blocker)&&monsterAttackLineR(mon,Math.max(range,mon.reach||1),{target:blocker}).ok)return blocker;
 // Target continuity follows mechanic traits, including newly authored visibility stacks.
 const continuous=continuousEnemyTarget(mon,p,detectPlayer);if(continuous)return continuous;
 const candidates=[...(detectPlayer?[p]:[]),...others],score=t=>{
  const d=entityDistance57(mon,t),melee=d<=(mon.reach||1)&&monsterAttackLineR(mon,mon.reach||1,{target:t}).ok,shot=mon.ranged&&monsterAttackLineR(mon,range,{target:t}).ok,id=t===p?'player':t.combatantId54;
  return d-(melee?3:shot?1:0)-(t===revenge?1:0)-(id&&id===mon.specialOpponent105? .35:0);
 };
 candidates.sort((a,b)=>score(a)-score(b));
 if(candidates.length)return candidates[0];
 return revenge||(validPlayer?p:null);
}
function gumihoRetreat(mon,sees,d,p=state.player){
 if(!mon?.gumihoSkirm57||mon.boss||!sees)return false;const limit=combatDepth(mon)>=11?3:2;if(d>limit)return false;const opts=DIRS8.map(([dx,dy])=>({x:mon.x+dx,y:mon.y+dy})).filter(q=>canMonsterStep(mon,mon.x,mon.y,q.x,q.y)).sort((a,b)=>entityDistance57(b,p)-entityDistance57(a,p));if(!opts.length||entityDistance57(opts[0],p)<=d)return false;if(!moveMonsterStep(mon,opts[0].x,opts[0].y))return false;mon.gumihoRetreated57=1;return true
}
function updateSummonerEngagement(mon,sees){
 if(!mon?.summoner)return false;if(sees){if(!mon.summonActivated57){mon.summonActivated57=true;mon.summonFirstSeenTurn57=state.floorTurn;mon.nextSummonTurn57=state.floorTurn+6}return true}
 const searching=!!(mon.summonActivated57&&mon.alerted&&(mon.searchTurns||0)>0&&mon.lastSeenPosition);if(searching)return true;mon.summonActivated57=false;delete mon.summonFirstSeenTurn57;delete mon.nextSummonTurn57;return false;
}
function tryMonsterSummon(mon){
 if(mon.summoner&&!(mon.skillSeal105>0)&&mon.summonActivated57&&mon.summonName57&&state.floorTurn>=(mon.nextSummonTurn57??Infinity)){const summoned=summonNear(mon,mon.summonName57);if(summoned){mon.nextSummonTurn57=state.floorTurn+6;addLog(`${withJosa57(mon.name,'이/가')} 보조 개체를 불렀다.`);return true}}
 return false;
}
function evaluateMonsterSpecials(mon,sees,d,target=state.player){
 const stackRules=visibilityStackRules(mon),targetId=target===state.player?'player':combatTargetValid57(mon,target)?combatantId(target):null;if(mon.specialOpponent105!==targetId){mon.specialOpponent105=targetId;for(const rule of stackRules)mon[rule.counter]=0;}
 if((sees||mon.alerted||mon.intent61||mon.asuraZone61||mon.asuraWarn61)&&!mon.boss){const resolvingCharge=mon.intent61?.type==='charge',used=globalThis.__MANRU_AI61__?.special(mon,d,target);if(used){if(mon.stunned>0&&!resolvingCharge)mon.stunned--;return true}if(mon.stunned>0){mon.stunned--;return true}}
 if(mon.support&&!(mon.skillSeal105>0)){const ally=state.monsters.filter(x=>x!==mon&&entitiesAllied57(mon,x)&&x.hp>0&&x.alerted&&entityDistance57(x,mon)<=4&&entityCombatLineCheckR(mon,x,{range:4,ignore:x,units:false}).ok).sort((a,b)=>b.atk-a.atk)[0];if(ally){setMonsterBuff(ally,2,3);projectileFX(mon.x,mon.y,ally.x,ally.y,'#d8bd62');return true}}
 let liveSees=sees,liveDistance=d;
 if(gumihoRetreat(mon,liveSees,liveDistance,target)){
  liveDistance=entityDistance57(mon,target);
  liveSees=actorDetectedTarget57(mon,target,monsterSenseRadius(mon));
 }
 const gazeRule=stackRules.find(r=>r.trait==='gaze'),hookRule=stackRules.find(r=>r.trait==='hook');
 const mutualGaze=!!(gazeRule&&visibilityStackTarget(mon,target,gazeRule,liveSees));if(mutualGaze){mon.gazeCount=Math.min(gazeRule.turns,(mon.gazeCount||0)+1);if(mon.gazeCount>=gazeRule.turns){if(!reflectRay(mon,target,'gaze')){triggerGazeBurst57(mon,target);applyCombatStatus(target,'stun',2,1);}mon.gazeCount=0}}else if(mon.gaze)mon.gazeCount=0;
 if(hookRule&&visibilityStackTarget(mon,target,hookRule,liveSees)){
  mon.sight=(mon.sight||0)+1;
  if(mon.name==='강시'&&state.branchContext105?.id==='mine'&&mon.sight===2&&target===state.player&&!isEntityObservableToPlayer57(mon)){
   cancelAutoWalk();clearHeldInput53();
   globalThis.__MANRU_RELEASE__.tip('mine_jiangshi','음산한 느낌이 온몸을 덮는다.','보이지 않는 강시가 갈고리를 준비하고 있다. 다음 행동 전에 퇴로와 시야를 살펴라.',{repeatable:true,title:'광산 · 음산한 기척'});addLog('음산한 느낌이 온몸을 덮는다.');
  }
  if(mon.sight>=hookRule.turns){playHookPullFx57(mon,target);resolveForcedMovement57(target,mon,2,{mode:'pull',hostile:true,creditPlayer:isPlayerAlly57(mon)});addLog(mon.name+'의 갈고리가 몸을 끌어당겼다.');attackMonster(mon,3,{target,delivery:'melee',range:10});mon.sight=0;return true}
 }else if(mon.hook)mon.sight=0;
 for(const rule of stackRules.filter(r=>r.effect==='summon')){if(mon.skillSeal105>0||!visibilityStackTarget(mon,target,rule,liveSees)){mon[rule.counter]=0;continue;}mon[rule.counter]=Math.min(rule.turns,(mon[rule.counter]||0)+1);if(mon[rule.counter]>=rule.turns&&state.monsters.filter(m=>m.hp>0&&bossChildOf(m,mon)&&monsterSpeciesName(m)===rule.species).length<(rule.cap||2)){if(summonNear(mon,rule.species)){mon[rule.counter]=0;return true;}}}
 if(tryMonsterSummon(mon))return true;
 return false;
}
function prisonContainedTurn(mon){
 const prisoner=mon.prisoner105;if(!prisoner||prisoner.released)return false;
 mon.alerted=false;mon.lastSeenPosition=null;mon.heardPosition=null;mon.attackInvestigation57=null;mon.searchTurns=0;
 const schedule=monsterActionSchedule(mon);if(mon.stunned>0)mon.stunned--;else if(schedule.act&&!mon.fixed&&state.floorTurn%2===0)wanderMonster(mon);
 return true;
}
function prisonEscapeTurn(mon){
 const prisoner=mon.prisoner105;if(!prisoner?.released||!prisoner.pendingExit)return false;
 const b=prisoner.bounds,mine=mineState(),walls=(mine?.walls||[]).filter(w=>w.prisonCell105===prisoner.cell),outside=()=>
  (mon.x<b.x||mon.y<b.y||mon.x>=b.x+b.w||mon.y>=b.y+b.h)&&!walls.some(w=>w.cells.some(c=>entityFootprintCells57(mon).some(q=>q.x===c.x&&q.y===c.y)));
 if(outside()){prisoner.pendingExit=false;return false;}
 const goals=walls.filter(w=>w.open).map(w=>mine.buttons.find(button=>button.prisonCell105===prisoner.cell&&button.prisonEntry105==='out'&&w.buttonIds.includes(button.id))).filter(Boolean).sort((a,c)=>entityDistance57(mon,a)-entityDistance57(mon,c));
 for(const goal of goals){const next=monsterPathStep(mon,goal,true);if(next&&moveMonsterStep(mon,next.x,next.y)){if(outside())prisoner.pendingExit=false;return true;}}
 return true;
}
function monsterTurn(){
  const phaseState=state,phaseMap=state.map,p=state.player;
  const combatFloor=branchCombatFloor();state.intentBudget61=combatFloor>=21?4:combatFloor>=11?3:2;
  for(const m of state.monsters||[]){globalThis.__MANRU_AI61__?.configure(m)}
  OccupancyService.beginShared();
  try{
  dojoEscapeTick();
  for(const mon of [...state.monsters]){
    if(state!==phaseState||state.map!==phaseMap)break;
    if(mon.revivalLives57&&(mon.revivePhase57==='corpse'||mon.revivePhase57==='reviving')){if(advanceMonsterRevival(mon))continue}
    if(mon.hp<=0||state.dead||!isHostileTarget57(mon)||mon.dormant57)continue;if(mon.martialActor105)tickMartialActor(mon);if(mon.combatFixture54){tickBossFixture(mon);continue}
    if(prisonContainedTurn(mon))continue;
    if(mountainMimicTurn(mon))continue;
    const observedOpponent=selectEnemyTarget(mon),opponentDetected=observedOpponent&&actorDetectedTarget57(mon,observedOpponent,monsterSenseRadius(mon));let d=entityDistance57(mon,p);
    if(mon.sleeping105){if(mon.doorSleep105)continue;if(mon.hp<mon.maxHp||mon.alerted||(opponentDetected&&entityDistance57(mon,observedOpponent)<=1))branchWake(mon,'접근');else continue;}
    if(playerConcealed58()&&(!observedOpponent||observedOpponent===p))clearPlayerTracking58(mon);
    if(dojoMarkedPursuer(mon)){mon.alerted=true;mon.lastSeenPosition={...state.branchTerrain105.dojo.escape105.mark};mon.searchTurns=12;mon.lostSight=0;}
    if(mon.ambush&&mon.hidden===undefined)mon.hidden=monsterAmbushCanHide(mon);if(mon.hidden&&!monsterAmbushCanHide(mon)){mon.hidden=false;mon.alerted=true;playAmbushReveal57(mon,'terrain')}if(mon.stunned>0){mon.stunned--;continue}if(mon.hidden&&(!opponentDetected||entityDistance57(mon,observedOpponent)>3))continue;if(mon.hidden&&opponentDetected&&entityDistance57(mon,observedOpponent)<=3){mon.hidden=false;mon.alerted=true;playAmbushReveal57(mon,'proximity')}
    let sees=playerDetectedBy(mon);mon.gumihoRetreated57=0;
    if(!observedOpponent||observedOpponent===p)updateExitPressureTracking(mon,sees);
    if(sees){mon.hasSeenPlayer105=true;mon.alerted=true;mon.lastSeenPosition={x:p.x,y:p.y,bornTurn:state.floorTurn||0};mon.attackInvestigation57=null;mon.searchTurns=state.floor>=11?Math.max(mon.searchTurns||0,12):6;mon.lostSight=0}
    else if(mon.alerted){mon.searchTurns=Math.max(0,(mon.searchTurns??5)-1);mon.lostSight=(mon.lostSight||0)+1;if(mon.searchTurns===0&&!mon.boss&&!mon.persistentChase57){mon.alerted=false;mon.lastSeenPosition=null;mon.heardPosition=null;mon.attackInvestigation57=null}}
    if(!observedOpponent||observedOpponent===p)updateSummonerEngagement(mon,sees);
    const schedule57=monsterActionSchedule(mon);if(!schedule57.act)continue;if(palaceTideResponse(mon))continue;if(prisonEscapeTurn(mon))continue;
    const target=selectEnemyTarget(mon);if(!target){mon.targetKind53=null;resolveMonsterTargetTurn57(mon,null,schedule57);continue}const playerTarget=target===p;mon.targetKind53=playerTarget?'player':(target?.retaliationMemory54?'memory':'monster');
    if(!playerTarget){resolveMonsterTargetTurn57(mon,target,schedule57);continue}
    if(mon.palaceLotus105){palaceLotusTurn(mon,p);continue}if(mon.equipmentActor105)syncEquipmentActor105(mon);
    handleLosLostSummon(mon,sees,{target:p});
    if(!mon.martialActor105&&mon.weaponRecovery105>0&&!mon.intent54){mon.weaponRecovery105--;continue}
    if(mon.guardTerritory105&&!mon.alerted&&!sees){monsterIdleRecovery105(mon,null);continue;}
    if(mon.boss){if(handleBossPattern(mon,d))continue;d=entityDistance57(mon,p)}
    if(mon.martialActor105&&dojoMartialTurn(mon,sees,d))continue;
    if(evaluateMonsterSpecials(mon,sees,d))continue;
    if(state!==phaseState||state.map!==phaseMap)break;
    d=entityDistance57(mon,p);sees=playerDetectedBy(mon);
    if(!mon.alerted&&mon.guardHome57&&!mon.fixed&&(mon.x!==mon.guardHome57.x||mon.y!==mon.guardHome57.y)){moveMonsterToward(mon,mon.guardHome57);continue}
    if(!sees&&!mon.boss&&mon.alerted){if(mon.gumihoRetreated57){mon.gumihoRetreated57=0;continue}const last=monsterInvestigationTarget(mon);if(last&&!mon.fixed){if(state.floor>=11){if(entityDistance57(mon,last)<=1)last.arrived=true;if(last.arrived){if(globalThis.__MANRU_RANDOM57__()<Math.min(.9,.2+(last.intensity??6)/40))wanderMonster(mon,last)}else moveMonsterToward(mon,last)}else if(entityDistance57(mon,last)<=1){if(state.floorTurn%2===0)wanderMonster(mon)}else moveMonsterToward(mon,last)}continue}
    if(!mon.alerted&&!mon.boss){if(state.floor>=11&&mon.migrationTarget57&&!mon.fixed){if(entityDistance57(mon,mon.migrationTarget57)>1)moveMonsterToward(mon,mon.migrationTarget57);else mon.migrationTarget57=null;continue}if(!mon.fixed&&state.floorTurn%2===0&&globalThis.__MANRU_RANDOM57__()<.16)wanderMonster(mon);continue}
    if(mon.gumihoRetreated57){mon.gumihoRetreated57=0;continue}
    const reach=mon.reach||1;if(d<=reach&&monsterAttackLineR(mon,reach).ok){executeMonsterAttackBundle57(mon,p,{context:{delivery:'melee',projectile:false,reflectable:false,range:reach}});continue}
    if(mon.ranged){const range=mon.range||6,shot=monsterAttackLineR(mon,range);if(shot.ok&&globalThis.__MANRU_RANDOM57__()<.62){executeMonsterAttackBundle57(mon,p,{firstBonus:mon.bossPattern==='master'?0:1,context:{delivery:'ranged',projectile:true,reflectable:true,range},projectileColor:mon.poison?'#83a96b':'#b39b79'});continue}}
    if(!mon.fixed)for(let i=0;i<schedule57.steps;i++)moveMonsterToward(mon,sees?p:null);
  }
  }finally{OccupancyService.endShared();phaseState.intentBudget61=null}
}
function monsterWarningAuraSample(mon,x,y){
  const radius=+mon?.warningAura57||0;if(radius<=0||mon.hp<=0||mon.revivePhase57==='corpse')return null;const d=Math.hypot(x-mon.x,y-mon.y);if(d>=radius)return{distance:d,alpha:0,color:[239,213,84]};const t=clamp(d/radius,0,1),near=[239,126,42],far=[239,213,84],color=near.map((v,i)=>Math.round(v+(far[i]-v)*t)),phase=mon.revivePhase57==='reviving'?.50:mon.revivePhase57==='full'?1:.80,alpha=(.055+.185*Math.pow(1-t,.62))*phase;return{distance:d,alpha,color}
}
  const AIM_STATE={target:null,jar:null,lastSelectAt:0};
  function jarCheck(j=AIM_STATE.jar){return j?combatTerrainTargetCheckR8({type:'jar',x:j.x,y:j.y},weaponRange()):{ok:false,reason:'공격할 가구가 없다.'}}
  function isAimTargetValid(){if(AIM_STATE.jar){const c=jarCheck(AIM_STATE.jar);if(c.ok)return true;AIM_STATE.jar=null;state._manualTerrainTargetR8=null}const m=AIM_STATE.target;if(!m||m.hp<=0||m.hidden){AIM_STATE.target=null;return false}const c=shotCheck52(m);if(!c.ok){AIM_STATE.target=null;return false}return true}
  function fireJarTarget(j){if(!state||!j||modal52())return false;const c=jarCheck(j);if(!c.ok){toast(c.reason);AIM_STATE.jar=null;state._manualTerrainTargetR8=null;return false}AIM_STATE.target=null;state._manualRangedTargetR8=null;state._manualTerrainTargetR8={type:'jar',x:j.x,y:j.y};AIM_STATE.jar={x:j.x,y:j.y};return ActionDispatcher.dispatch({type:'ATTACK',args:[]}).value}
  function selectJarTarget(x,y,fireIfSame=true){const j={x,y},c=jarCheck(j);if(!c.ok){toast(c.reason);return false}if(fireIfSame&&AIM_STATE.jar?.x===x&&AIM_STATE.jar?.y===y&&now52()-AIM_STATE.lastSelectAt<3500)return fireJarTarget(j);AIM_STATE.target=null;state._manualRangedTargetR8=null;AIM_STATE.jar=j;state._manualTerrainTargetR8={type:'jar',x,y};AIM_STATE.lastSelectAt=now52();toast(`${elementalStructureAt105(x,y)?.object.structureKind105==='boulder'?'굴림 바위':elementalStructureAt105(x,y)?.object.structureKind105==='mine-cart'?'광차':terrainName(state.map[y][x])} 조준 · 한 번 더 탭 또는 공격`);drawMap(true);updateAttackButton();return true}
  function currentAim(){return AIM_STATE.jar?{type:'jar',x:AIM_STATE.jar.x,y:AIM_STATE.jar.y,check:jarCheck(AIM_STATE.jar)}:AIM_STATE.target?{type:'monster',name:AIM_STATE.target.name,x:AIM_STATE.target.x,y:AIM_STATE.target.y,check:shotCheck52(AIM_STATE.target)}:null}
function retreatMonster(mon,target=state.player){const p=target,opts=DIRS4.map(([dx,dy])=>({x:mon.x+dx,y:mon.y+dy})).filter(q=>PlacementService.monsterCanStand(mon,q.x,q.y)).sort((a,b)=>entityDistance57(b,p)-entityDistance57(a,p));if(opts[0])OccupancyService.move(mon,opts[0].x,opts[0].y)}
  const BOSS_FLOORS=new Set([5,10,15,20,25]);
  const MONSTER_ROLE_TABLE={
    '시종':['skirmisher','투척 후 거리를 벌리는 유격수'],
    '수목 궁수':['skirmisher','가까이 붙으면 후퇴하는 장거리 저격수'],
    '신전 사제 망령':['controller','예고된 기 봉인 탄환으로 무술을 끊는 통제자'],
    '독꽃':['poison','독 안개 위치를 예고하고 다음 턴 폭발시키는 고정 포대'],
    '정원 바위괴물':['shell','주기적으로 껍질을 닫아 방어가 크게 상승하는 길막 탱커'],
    '만루의 수호상':['shell','주기적으로 석화 방어를 취하는 신전 수호벽'],
    '경비 인형 - 포병':['artillery','착탄 지점을 예고한 뒤 3×3 폭발을 일으키는 포병'],
    '화염 가고일':['fireArtillery','예고 지점에 불길을 남기는 성벽 포대'],
    '성채 비행 감시자':['alarm','주변 적을 깨우고 3턴 동안 공격을 강화하는 경보기'],
    '공허 가오리':['swoop','직선으로 급강하해 밀쳐내는 공허 유격수'],
    '차원 포식자':['blinkPunisher','점멸 착지점을 감지해 기력을 뜯어먹는 매복자'],
    '천수 아수라':['asura','여러 팔로 연타를 퍼붓고 아수라장을 펼쳐 영역 밖 직접 공격을 무효로 만든다'],
    '객잔 경비병':['formation','동료와 인접하면 정면 방어가 강해지는 창벽'],
    '경비 인형 - 보병':['formation','인접한 보병끼리 방어선이 단단해지는 성채 창벽'],
    '떠돌이 도둑':['ambush','선공 후 후퇴해 문과 시야를 다시 이용하는 약탈자'],
    '검은 뱀':['flanker','정면보다 측면의 빈칸으로 파고드는 고속 독 공격자'],
    '거대 거미':['webber','좁은 문목에서 이동을 봉쇄하는 거미줄 사냥꾼'],
    '비단 술래':['webber','한 턴 예고 후 표시된 3×3 범위를 공격하고 비단 함정 하나를 남긴다. 밟으면 현재 체력의 절반을 잃는다. 발견한 함정은 인접 상호작용으로 해제할 수 있다.'],
    '윈도':['ambush','거울과 문 뒤에서 모습을 감췄다가 선공하는 환영'],
    '향기요정':['skirmisher','지나간 칸을 잠시 물길로 바꿔 퇴로와 추격 동선을 꼬이게 만드는 교란형 요정'],
    '구미호':['gaze','직선 시야를 붙들며 3칸 안으로 다가오면 한 칸 물러선다. 후퇴한 턴에도 시선 누적과 윈도 소환은 계속되지만 일반 사격은 하지 않는다.'],
    '분홍거미':['webber','큰 몸으로 통로와 벽을 무너뜨린다. 한 턴 예고 후 표시된 3×3 범위를 공격하고 비단 함정을 최대 두 개 남긴다. 함정은 현재 체력의 절반을 깎으며 인접 상호작용으로 해제할 수 있다.'],
    '환각의 향로':['gas','한 턴 예고한 구역에 3턴간 취기 가스를 남긴다. 연기를 피해 이동해야 하며 회복 효과는 없다.'],
    '강시':['formation','다른 강시와 붙으면 단단해지는 느린 전열'],
    '식귀':['flanker','정면 전열 옆으로 파고들어 허기를 갉는 추격자'],
    '산성 슬라임':['poison','갑옷을 파고드는 산성 몸체. 죽으면 보상을 남기지 않는 소형 슬라임 둘로 한 번만 분열한다.'],
    '굶주린 창고 쥐':['flanker','서로 다른 측면을 노린다. 같은 쥐에게 두 번 피해를 받으면 27턴 뒤 치명적인 중병에 걸린다. 이후 적중은 유예를 6턴 줄이며, 해독산과 정화로 치료한다.'],
    '수비병':['formation','장고 통로에서 동료와 전열을 맞추는 원거리 수비대'],
    '강철이':['shell','수비 구역을 지키며 직선 돌진을 한 턴 예고한다. 돌진 경로에서 비키거나 견고한 벽으로 유도하면 한 턴 경직된다.'],
    '살라맨더':['fireArtillery','장고의 화기와 용암을 이용해 착탄 지점을 예고하는 화염 사수'],
    '녹아내린 슬라임':['gas','지나간 바닥을 3턴간 용암으로 바꾸고, 한 턴 예고 후 3턴간 남는 독가스를 퍼뜨린다.'],
    '해자 잠복꾼':['hook','해자 곁에서 갈고리로 위험지형 쪽으로 끌어당기는 수비자'],
    '보주의 파수꾼':['formation','신전 수호자와 전열을 만들고 밀치기에 버티는 정예'],
    '금령':['artillery','4칸 안에서 폭발탄 착탄을 예고하고, 공격에 맞은 대상의 허기까지 갉아먹는 황금 영체']
  };
  const ROLE_RUNE={gas:'연',hook:'갈',skirmisher:'활',controller:'봉',poison:'독',shell:'방패',artillery:'포',fireArtillery:'화',alarm:'경',swoop:'상',blinkPunisher:'식',asura:'수',formation:'진',ambush:'복',flanker:'사',webber:'망',gaze:'시'};
  function configureMonsterTraits(m){if(!m||m.boss)return m;const def=MONSTERS.find(d=>d.name===m.name);if(def)for(const field of ['visStack57','guardPost57','infectionHitsRequired57','silkTrapCount57','gasStatus57','lavaTrail57','split','slow','actionLag57','exitPressureSpeed57','gumiBehaviorVersion57','corpseRelocateSpan57','corpseRelocateMinRadius57','floor24Chaser57','persistentChase57','revivalLives57','reviveWeakTurns57','reviveWeakAtkMul57','reviveWeakDefMul57','reviveWeakEvaDelta57','reviveFullAtkMul57','reviveFullDefMul57','reviveFullEvaDelta57','deathCountsAsLosBreak57','warningAura57','exitPressureSense57','losLostSummon57'])if(def[field]!=null&&m[field]==null)m[field]=structuredClone(def[field]);if(m.gasStatus57)delete m.gas;if(m.floor24Chaser57&&def&&(m.gumiScaleVersion57||0)<3){const fresh=scaledMonster(def),wasCorpse=m.revivePhase57==='corpse'||m.hp<=0,ratio=(m.maxHp||0)>0?clamp((m.hp||0)/m.maxHp,0,1):1;delete m.fixedStats57;delete m.slow;delete m.reviveWeakAtk57;delete m.reviveWeakEva57;delete m.reviveFullAtk57;delete m.reviveFullEva57;m.maxHp=fresh.maxHp;m.hp=wasCorpse?0:Math.max(1,Math.round(fresh.maxHp*ratio));m.atk=fresh.atk;m.def=fresh.def;m.eva=fresh.eva;m.baseAtk57=fresh.atk;m.baseDef57=fresh.def;m.baseEva57=fresh.eva;m.miniBoss=true;m.reach=def.reach||1;delete m.actionLag57;delete m.actionLagTick57;delete m.fast;m.exitPressureSpeed57=structuredClone(def.exitPressureSpeed57);m.exitPressureSpeedBudget57=0;m.gumiBehaviorVersion57=def.gumiBehaviorVersion57||4;m.reviveWeakAtkMul57=def.reviveWeakAtkMul57;m.reviveWeakDefMul57=def.reviveWeakDefMul57;m.reviveWeakEvaDelta57=def.reviveWeakEvaDelta57;m.reviveFullAtkMul57=def.reviveFullAtkMul57;m.reviveFullDefMul57=def.reviveFullDefMul57;m.reviveFullEvaDelta57=def.reviveFullEvaDelta57;m.deathCountsAsLosBreak57=true;m.losLostSummon57=structuredClone(def.losLostSummon57);m.gumiScaleVersion57=3}if(m.floor24Chaser57&&def&&(m.gumiBehaviorVersion57||0)<4){delete m.actionLag57;delete m.actionLagTick57;delete m.fast;m.exitPressureSpeed57=structuredClone(def.exitPressureSpeed57||{min:.5,max:1.5});m.exitPressureSpeedBudget57=0;m.corpseRelocateSpan57=def.corpseRelocateSpan57||21;m.corpseRelocateMinRadius57=def.corpseRelocateMinRadius57||6;m.gumiBehaviorVersion57=4}if(m.revivalLives57){if(!Number.isFinite(m.livesRemaining57))m.livesRemaining57=m.revivalLives57;if(!m.revivePhase57)m.revivePhase57='normal';if(!Number.isFinite(m.baseAtk57))m.baseAtk57=Number.isFinite(m.atk)?m.atk:(def?.atk??1);if(!Number.isFinite(m.baseDef57))m.baseDef57=Number.isFinite(m.def)?m.def:(def?.def??0);if(!Number.isFinite(m.baseEva57))m.baseEva57=Number.isFinite(m.eva)?m.eva:(def?.eva??0);if(!Number.isFinite(m.losLostSummonCooldown57))m.losLostSummonCooldown57=0;applyMonsterRevivalStats(m)}const r=MONSTER_ROLE_TABLE[m.name];if(r){m.role61=r[0];m.roleDesc61=r[1]}if(m.role61==='shell'){if(!Number.isFinite(m.shell61))m.shell61=0;if(!Number.isFinite(m.shellCd61))m.shellCd61=0}if(m.name==='성채 비행 감시자')m.support=false;if(m.name==='해자 잠복꾼'){m.ambush=false;m.hidden=false}if(!m.summonOwner105&&!m.prisoner105?.released&&(m.guardPost57||m.rumorSpaceId1030||m.legendElite47||m.elite1023||m.miniVaultResident62)&&!m.guardHome57&&Number.isFinite(m.x)&&Number.isFinite(m.y)&&!state.generationInProgress57){let room=roomAt(m.x,m.y);const vault=state.miniVault62,rumor=(state.rumorSpaces1030||[]).find(q=>q.id===m.rumorSpaceId1030);if(m.miniVaultResident62&&vault&&m.x>=vault.x&&m.y>=vault.y&&m.x<vault.x+vault.w&&m.y<vault.y+vault.h)room=vault;if(rumor?.rect){const r=rumor.rect;room={x:r.x1,y:r.y1,w:r.x2-r.x1+1,h:r.y2-r.y1+1}}m.guardHome57={x:m.x,y:m.y,room:room?{x:room.x,y:room.y,w:room.w,h:room.h}:null}}return m}
  function intentCells(cx,cy,r=1){const out=[];for(let y=cy-r;y<=cy+r;y++)for(let x=cx-r;x<=cx+r;x++)if(x>0&&y>0&&x<COLS-1&&y<ROWS-1)out.push({x,y});return out}
  function intentLineCells(a,b,range=8){const out=[],dx=Math.sign(b.x-a.x),dy=Math.sign(b.y-a.y);let x=a.x,y=a.y;for(let i=0;i<range;i++){if(Math.abs(b.x-x)>=Math.abs(b.y-y))x+=Math.sign(b.x-x);else y+=Math.sign(b.y-y);if(x<=0||y<=0||x>=COLS-1||y>=ROWS-1)break;out.push({x,y});if(x===b.x&&y===b.y)break}return out}
  function setMonsterIntent(m,type,cells,label,data={}){if(Number.isFinite(state.intentBudget61)&&state.intentBudget61<=0&&!data.force61)return false;if(Number.isFinite(state.intentBudget61)&&!data.force61)state.intentBudget61--;m.intent61={type,cells,label,data,armedPlayerTurn:state.turn};floatText(m.x,m.y,'예고','#efb171',10);return true}
  function executeMonsterIntent(m){const I=m.intent61;if(!I)return false;if(state.turn<=(I.armedPlayerTurn??state.turn))return true;const targets=bossAreaTargets(m,I.cells),target=targets[0]||selectCombatOpponent(m),hit=targets.length>0;
    if(I.type==='blast'){alertNearby(I.data.x,I.data.y,9,'explosion');for(const target of bossAreaTargets(m,I.cells))monsterAttacksTarget(m,3,{target,delivery:'area',reflectable:false,range:10});impact(I.data.x,I.data.y,'#d7a36c',6);burst(I.data.x,I.data.y,'#d7a36c',20,.9)}
    else if(I.type==='fire'){alertNearby(I.data.x,I.data.y,8,'explosion');for(const target of bossAreaTargets(m,I.cells))monsterAttacksTarget(m,2,{target,delivery:'area',reflectable:false,range:10});addField('fire',I.data.x,I.data.y,4,I.cells||null,effectSource57(m));burst(I.data.x,I.data.y,'#f0823c',18,.9)}
    else if(I.type==='poison'){for(const target of targets){const r=monsterAttacksTarget(m,0,{target,delivery:'area',reflectable:false,range:10});if(r.hit)applyCombatStatus(target,'poison',5,1,{source:m})}for(const c of I.cells)if(state.map[c.y][c.x]===TT.FLOOR&&globalThis.__MANRU_RANDOM57__()<.20)RuntimeTerrainOwner.mutate(c.x,c.y,TT.SNARE,{source:'poison-intent61'})}
    else if(I.type==='seal'){for(const target of targets){const r=monsterAttacksTarget(m,1,{target,delivery:'area',reflectable:false,range:10});if(r.hit)applyCombatStatus(target,'skillSeal',combatDepth(m)>=21?4:3,1,{source:m})}}
    else if(I.type==='web'){
      // Resolve the same frozen 3x3 cells that the warning renderer displays, including the player's occupied cell.
      for(const target of targets){const r=monsterAttacksTarget(m,0,{target,delivery:'area',reflectable:false,range:10});if(r.hit)applyCombatStatus(target,'stun',1,1,{source:m,stagger:true})}
      if(I.data&&Number.isFinite(I.data.x)&&Number.isFinite(I.data.y))burst(I.data.x,I.data.y,'#e79db8',12,.7);
      const count=m.silkTrapCount57||0;if(count){let made=0;for(const c of I.cells){if(made>=count)break;if(!terrainSurface58(state.map[c.y]?.[c.x])||OccupancyService.isOccupied(c.x,c.y))continue;const base=state.map[c.y][c.x];if(RuntimeTerrainOwner.mutate(c.x,c.y,TT.SNARE,{source:'silk-trap'}).ok){state.silkTraps57=state.silkTraps57||{};state.silkTraps57[k(c.x,c.y)]={base,source:m.name};made++}}}
      else{for(const c of I.cells)if(state.map[c.y]?.[c.x]===TT.FLOOR&&globalThis.__MANRU_RANDOM57__()<.28)RuntimeTerrainOwner.mutate(c.x,c.y,TT.SNARE,{source:'web-intent61'})}
    }
    else if(I.type==='gas'){spawnJarGasField57(I.data.x,I.data.y,{status:m.gasStatus57,duration:3,cells:I.cells,source:m});burst(I.data.x,I.data.y,m.gasStatus57==='drunk'?'#b88bc2':'#83b36d',12,.7)}
    else if(I.type==='charge'){
      for(const c of I.cells){if(!monsterPatrolAllows(m,c.x,c.y)){setMonsterStatus(m,'stunned',1);break}const victim=[state.player,...state.monsters].find(t=>combatTargetValid57(m,t)&&monCovers(t,c.x,c.y));if(victim){const target=victim;const r=monsterAttacksTarget(m,3,{target,delivery:'melee',range:1,reflectable:false});if(r.hit&&!state.dead)resolveForcedMovement57(target,m,1,{hostile:true});break}const tile=state.map[c.y]?.[c.x];if(isToolBreakableTerrain57(tile))breakFurnitureTerrain57(c.x,c.y,m);if(!moveMonsterToward(m,c,c)){setMonsterStatus(m,'stunned',1);break}}alertNearby(m.x,m.y,7,'charge');
    }
    m.intent61=null;return true
  }
  function moveAway(m,target=state.player){if(state.floor>=11){const step=ReachabilityService.retreatStep(m,target);return !!step&&moveMonsterToward(m,step,step)}const p=target,opts=DIRS8.map(([dx,dy])=>({x:m.x+dx,y:m.y+dy})).filter(q=>PlacementService.monsterCanStand(m,q.x,q.y)).sort((a,b)=>entityDistance57(b,p)-entityDistance57(a,p));if(opts.length&&entityDistance57(opts[0],p)>entityDistance57(m,p)){OccupancyService.move(m,opts[0].x,opts[0].y);return true}return false}
  function asuraTurn(m,d,target=state.player){
    const radius=m.asuraRadius47||3,duration=m.asuraDuration47||5,maxRange=m.asuraRange47||9;
    if((m.asuraZone61||0)>0){
      const outside=asuraDomainDist61(target,m)>radius+.28;let acted=false;
      if(outside&&d<=maxRange&&monsterAttackLineR(m,maxRange,{target}).ok){
        if(m.asuraVolleyWarn61){
          m.asuraVolleyWarn61=0;projectileFX(m.x,m.y,target.x,target.y,'#d6b56b');
          addLog(`${m.name}의 여섯 팔이 법구와 창을 동시에 투척했다.`);const first=monsterAttacksTarget(m,4,{target,delivery:'ranged',projectile:true,reflectable:true,range:maxRange});if(monsterAttackCanContinueR(first)){projectileFX(m.x,m.y,target.x,target.y,'#a988df');monsterAttacksTarget(m,1,{target,delivery:'ranged',projectile:true,reflectable:true,range:maxRange})}acted=true;
        }else{
          m.asuraVolleyWarn61=1;m.asuraVolleyTarget61={x:target.x,y:target.y};floatText(target.x,target.y,'다완 투척 예고','#e9bd75',10);addLog(`${m.name}이 영역 밖의 침입자를 겨눈다. 다음 행동에 다완 투척이 쏟아진다.`);acted=true;
        }
      }else{m.asuraVolleyWarn61=0;m.asuraVolleyTarget61=null}
      m.asuraZone61--;
      if(m.asuraZone61<=0){m.asuraZone61=0;m.asuraCd61=m.asuraCooldown47||6;m.asuraVolleyWarn61=0;m.asuraVolleyTarget61=null;addLog(`${m.name}의 아수라장이 걷혔다.`)}
      if(acted){m.stunned=Math.max(m.stunned||0,1);return true}
      return false;
    }
    if(m.asuraWarn61){
      m.asuraWarn61=0;m.asuraZone61=duration;m.asuraRadius61=radius;m.asuraVolleyWarn61=0;m.asuraVolleyTarget61=null;burst(m.x,m.y,'#a77bd0',24,1.0);floatText(m.x,m.y,'아수라장','#e6c06e',11);addLog(`${m.name}이 반경 ${radius}칸의 아수라장을 전개했다. 영역 밖에서 시작된 직접 공격은 무효화된다.`);m.stunned=Math.max(m.stunned||0,1);return true
    }
    if((m.asuraCd61||0)>0){m.asuraCd61--;return false}
    m.asuraWarn61=1;m.stunned=Math.max(m.stunned||0,1);floatText(m.x,m.y,'영역 전개 예고','#dcb470',10);addLog(`${m.name}의 발밑에 거대한 원형 문양이 번진다. 다음 행동에 아수라장이 열린다.`);return true
  }
  function artilleryTurn(m,target){
    if(!['artillery','fireArtillery'].includes(m?.role61)||m.boss)return false;
    if(m.intent61&&['blast','fire'].includes(m.intent61.type))return executeMonsterIntent(m);
    if(!combatTargetValid57(m,target))return false;
    const range=m.artilleryRange61||9,period=combatDepth(m)>=16?5:6,phase=(m.x*3+m.y*5)%7;
    if(entityDistance57(m,target)<=range&&monsterAttackLineR(m,range,{target}).ok&&state.floorTurn%period===phase%period){const x=target.x,y=target.y;return setMonsterIntent(m,m.role61==='fireArtillery'?'fire':'blast',intentCells(x,y,1),m.role61==='fireArtillery'?'화염 착탄 예고':'포탄 착탄 예고',{x,y})}
    return false;
  }
  function specialTurn(m,ignoredDistance=null,target=state.player){const floor=combatDepth(m);if((target===state.player&&playerConcealed58())){if(m?.intent61)return executeMonsterIntent(m);if(m?.role61==='asura')return asuraTurn(m,entityDistance57(m,target));return false}if(globalThis.__MANRU_LEGEND47__?.enemySpecial?.(m,target))return true;if(!m?.role61||m.boss||!m.alerted||!combatTargetValid57(m,target))return false;if(m.intent61)return executeMonsterIntent(m);if(m.skillSeal105>0)return false;if(!actorDetectedTarget57(m,target,monsterSenseRadius(m)))return false;const d=entityDistance57(m,target),phase=(m.x*3+m.y*5)%7;
    if(m.role61==='asura'&&asuraTurn(m,d,target))return true;
    if(m.intent61)return executeMonsterIntent(m);
    
    if(m.charge&&d>=2&&d<=6&&(m.chargeNextAgency57||0)<=state.floorTurn){
      const dx=Math.sign(target.x-m.x),dy=Math.sign(target.y-m.y);if(m.x===target.x||m.y===target.y||Math.abs(target.x-m.x)===Math.abs(target.y-m.y)){const cells=[];for(let i=1;i<=5;i++){const x=m.x+dx*i,y=m.y+dy*i;if(x<1||y<1||x>=COLS-1||y>=ROWS-1)break;cells.push({x,y});if(terrainBaseTile58(x,y)===TT.WALL)break}if(setMonsterIntent(m,'charge',cells,'직선 돌진 예고')){m.chargeNextAgency57=state.floorTurn+5;return true}}
    }
    if(m.role61==='gas'&&d<=6&&(m.gasNextAgency57||0)<=state.floorTurn){const x=target.x,y=target.y;if(setMonsterIntent(m,'gas',intentCells(x,y,1),m.gasStatus57==='drunk'?'취기 가스 예고':'독가스 예고',{x,y})){m.gasNextAgency57=state.floorTurn+6;return true}}
    if(m.shell61>0)m.shell61--;if(m.shellCd61>0)m.shellCd61--;
    if(combatBlinkActive(target)&&m.role61==='blinkPunisher'&&d<=4&&monsterAttackLineR(m,4,{target}).ok){projectileFX(m.x,m.y,target.x,target.y,'#9566ac');const r=monsterAttacksTarget(m,2,{target,delivery:'ranged',projectile:true,reflectable:true,range:4});if(r.hit&&!state.dead){const drain=floor>=21?3:2;target.focus=Math.max(0,(target.focus||0)-drain);addLog(`${m.name}이 점멸 흔적을 물어뜯었다. 기 -${drain}.`)}setMonsterStatus(m,'stunned',1);return true}
    if(m.role61==='alarm'&&d<=8&&(m.alarmCd61||0)<=0){alertNearby(m.x,m.y,12);for(const a of state.monsters)if(a!==m&&entitiesAllied57(a,m)&&a.hp>0&&entityDistance57(a,m)<=8&&!a.boss)setMonsterBuff(a,floor>=16?3:2,floor>=16?4:3);m.alarmCd61=floor>=16?7:8;addLog(`비행 감시자가 경종을 울렸다. 주변 수비대가 ${floor>=16?4:3}턴간 강화된다.`);setMonsterStatus(m,'stunned',1);return true}else if(m.alarmCd61>0)m.alarmCd61--;
    if(artilleryTurn(m,target))return true;
    if(m.role61==='poison'&&d<=6&&monsterAttackLineR(m,6,{target}).ok&&state.floorTurn%(floor>=11?4:5)===phase%(floor>=11?4:5)){const x=target.x,y=target.y;return setMonsterIntent(m,'poison',intentCells(x,y,1),'독 안개 예고',{x,y})}
    if(m.role61==='controller'&&d<=9&&monsterAttackLineR(m,9,{target}).ok&&state.floorTurn%(floor>=21?5:6)===phase%(floor>=21?5:6)){return setMonsterIntent(m,'seal',intentLineCells(m,target,8),'기 봉인 사선',{x:target.x,y:target.y})}
    if(m.role61==='webber'&&floor>=11&&d<=6&&(m.webCd61||0)<=0&&monsterAttackLineR(m,6,{target}).ok){m.webCd61=5;return setMonsterIntent(m,'web',intentCells(target.x,target.y,1),'비단·거미줄 포획 예고',{x:target.x,y:target.y})}else if((m.webCd61||0)>0)m.webCd61--;
    if(m.role61==='shell'&&d<=4&&m.shellCd61<=0){m.shell61=floor>=16?3:2;m.shellCd61=floor>=16?6:7;floatText(m.x,m.y,'방어 자세','#d8d0b4',10);setMonsterStatus(m,'stunned',1);return true}
    if(m.role61==='skirmisher'&&d<=(floor>=11?3:2)&&moveAway(m,target)){setMonsterStatus(m,'stunned',1);return true}
    if(m.role61==='swoop'&&d>=3&&d<=8&&monsterAttackLineR(m,8,{target}).ok&&state.floorTurn%5===phase%5){for(let i=0;i<(floor>=21?3:2);i++)moveMonsterToward(m,target);if(entityDistance57(m,target)<=1){const r=monsterAttacksTarget(m,2,{target,delivery:'melee',reflectable:false,range:1});if(r.hit&&!state.dead)resolveForcedMovement57(target,m,1,{mode:'push',hostile:true})}setMonsterStatus(m,'stunned',1);return true}
    return false
  }
  function moveEnemyTo(m,r,off=0){if(!m)return false;const spots=[];for(let y=r.y+1;y<r.y+r.h-1;y++)for(let x=r.x+1;x<r.x+r.w-1;x++)if(PlacementService.monsterCanStand(m,x,y))spots.push({x,y});if(!spots.length)return false;const p=spots[(off*3+Math.floor(globalThis.__MANRU_RANDOM57__()*spots.length))%spots.length];m.miniVaultOrigin62=m.miniVaultOrigin62||{x:m.x,y:m.y};m.x=p.x;m.y=p.y;m.alerted=false;m.miniVaultResident62=true;return true}
  // Inspection reads the live actor's traits; it never configures or mutates combat.
  function monsterSkills(mon){
    const skills=[],floor=combatDepth(mon),add=(id,name,seal,meta,desc,style='roar',type='기술')=>skills.push({id,name,seal,meta,type,desc,style});
    if(mon.bossPattern==='palaceKing105'){
      add('cannon','수압포','水','직선 7칸 · 예고 2턴','수속성 공격력 ×1.6. 발사 후 1턴 회복. 예고 사선에서 벗어나거나 기둥 뒤로 피한다.');
      add('sweep','용미 쓸기','尾',`전방위 ${PALACE_SWEEP_RULES105.maxRadius}칸 · 재사용 ${PALACE_SWEEP_RULES105.cooldownTurns}/${PALACE_SWEEP_RULES105.highTideCooldownTurns}턴`,`적이 4칸 이내일 때 시작. 반경이 매 행동 1칸씩 커진 뒤 쓸기. 준비부터 종료까지 무적. 공격력 ×1.2, 1칸 밀침. 중병을 뺀 해로운 상태 ${PALACE_SWEEP_RULES105.statusTurns}턴. 재사용은 평소/최고 수위 기준.`);
      add('wave','창해의 삼중 파도','浪','세 겹 · 예고 2턴','벽에서 매턴 한 겹씩 전진. 물리 공격력 ×1.15, 최대 4칸 밀침. 높은 바닥도 맞는다. 석벽·기둥·가구가 파도를 막는다.');
      add('royal','왕의 밀물','潮','HP 50% 이하 · 한 번','3턴 예고 후 수위 +1(최대 3), 8턴 지속. 자연 조수는 계속 흐른다.','constitution','조건');
      add('stone','철창 해방','石','HP 50% 이하 · 돌 1개','연결된 스위치에 광산의 돌을 던져 간수 철창을 연다. 사용할 스위치가 있어야 한다.','strong','조건');
      add('weapon-phase','무기 교체','器','HP 50% 이하','수강 철두창에서 창해 수압연노로 교체. 회복으로 반피를 넘기면 다시 철두창을 든다.','brawl','조건');
      add('tide-armor','용궁의 비늘','鱗','썰물 때 방어 감소',`수위 0에서 기본 DEF −3. 그 외 수위에서는 기본 DEF를 유지한다.`,'constitution','지속');
    }else if(mon.palaceLotus105){
      add('roots','바위뿌리 융기','根','사거리 5칸 · 재사용 7턴','대상 주위 다이아몬드 8칸을 예고. 다음 행동에 바위벽과 기절 1턴, 그다음 행동에 각 벽의 3×3 대지 폭발. 폭발은 중첩된다.');
      add('lotus-pull','해련의 견인','引','사거리 6칸 · 재사용 6턴','물 위에서 개화해야 사용. 1턴 예고 후 대상을 꽃 앞으로 당겨 공격력 +3으로 공격. 벽·개체가 견인을 막는다.');
    }else if(mon.bossPattern==='blackFrost105'){
      add('frost','서리 폭쇄 · 빙창','霜','사거리 8칸 · 예고 1턴',`3×3 폭쇄와 직선 빙창을 번갈아 사용. 냉기 피해 ${mountainFrostDamage(mon)}. 기본 공격은 하지 않는다.`);
      add('frost-add','동토의 부름','召','HP 75%·50%·25%','각 문턱에서 벌집나무와 독꽃 소환. 살아 있는 증원 최대 4마리.','constitution','조건');
    }else if(mon.bossPattern==='houndboss'){
      add('charge','광폭 돌진','衝','3~8칸 · 예고 1턴 · 주기 3턴','목표를 향해 최대 4칸 전진하고 인접 대상을 공격력 +5로 공격.');
      add('maul','광견 짓밟기','踏','6칸 안 · 예고 1턴 · 주기 7턴','표시한 십자에 고정 피해 9, 쇠약 2턴.');
      add('rats','객잔 쥐 소환','召','주기 10턴 · 최대 2마리','주변 빈칸에 객잔 쥐를 부른다.');
    }else if(mon.bossPattern==='painter'){
      add('inkbeam','먹비 직선','墨','직선 8칸 · 예고 1턴 · 주기 7턴','예고 사선에 고정 피해 11, 실명 3턴.');
      add('ink','묵죽 폭발','竹','십자 5칸 · 예고 1턴 · 주기 4턴','고정 피해 9, 실명 3턴. 일부 바닥에 대나무가 생긴다.');
      add('tiger','종이 호랑이 소환','虎','주기 8턴 · 최대 2마리','주변 빈칸에 종이 호랑이를 그린다.');
    }else if(mon.bossPattern==='needle'){
      const r=BOSS_ARENA_RULES.silk;
      add('needle','재봉 바늘','針',`사거리 ${mon.range||10}칸 · 방어 관통`,'먼 대상에게 바늘을 쏜다.','brawl');
      add('weave','비단 결계','絲',`예고 1턴 · 재사용 ${r.weaveCooldown}턴`,'천면경 사이에 실을 잇는다. 매듭 거울을 깨면 연결된 실이 사라진다.');
      add('sew','되감는 재봉','縫','걸렸던 실 방향 · 예고 1턴','실에 걸린 방향을 다시 겨눠 고정 피해 3, 출혈 3턴.');
      add('gas-shot','환각 가스탄','煙','원거리 피격 후 · 취기 가스','바늘 공격력 ×3의 가스탄. 착탄점에 퍼지는 취기 가스가 남는다.');
      add('mirror','천면경 · 환영 소환','鏡',`거울 복구 ${r.repairCooldown}턴`,'실로 이어진 거울이 환영을 부른다. 상처가 깊어질수록 소환이 빨라진다. 거울을 깨면 그 거울의 환영도 사라진다.');
      add('escape','실타래 탈출','影','HP 80%·60%·40%·20%','체력 문턱마다 공격자를 피해 자리를 바꾼다.','ghost','조건');
    }else if(mon.bossPattern==='keeper'){
      const r=BOSS_ARENA_RULES.keeper;
      add('chain','강철 쇠사슬','鎖',`3~8칸 · 주기 ${r.chainCooldown}턴`,'1턴 예고 후 고정 피해 7, 2칸 견인, 쇠약 2턴. 형틀에 걸리면 간수는 2턴 묶이고 DEF 2.');
      add('blade','형틀 칼날','刃','인접 8칸 · 예고 1턴 · 주기 3턴','공격력 +6, 출혈 4턴. 간수에게서 떨어져 피한다.');
      add('anchor-break','형틀 파괴','破','HP 50% 이하','온전한 형틀이 3개 이상 남아 있으면 둘을 부순다.','strong','조건');
      add('lava','장고 붕괴','熔',`HP 67%·33% · 예고 ${r.lavaWarning}턴`,'독안개 안쪽이 용암으로 바뀐다. 첫 단계는 간수·공격 대상 중심 폭 5 십자, 마지막은 간수 중심 폭 7 십자만 남는다.','constitution','조건');
    }else if(mon.bossPattern==='master'){
      const r=BOSS_ARENA_RULES.master;
      add('seal','천실 인장','印',`${r.sealAngle}° 부채꼴 · 예고 1턴`,`범위 ${r.range}칸(핵 보호 중 ${r.shieldRange}칸). 범위 안의 대상에게 ATK로 물리 공격(핵 보호 중 ATK −2). 핵이 없으면 단계별 재사용 ${r.shotCooldown.join('/')}턴, 보호 중 ${r.shieldShotCooldown}턴.`);
      add('master-pursuit','만루의 추격','追','마지막 단계 · 주기 4턴','두 번째 핵이 사라진 뒤 4턴마다 이동을 한 번 더 한다.','ghost','조건');
      add('core','천실핵의 사념','核',`HP ${r.thresholds.map(n=>Math.round(n*100)+'%').join('·')}`,'체력 문턱마다 사념체를 세운다. 살아 있는 동안 보주는 무적. 사념체가 증원을 부르며, 파괴하면 그 단계의 증원도 사라진다.','constitution','조건');
    }else if(mon.bossPattern==='friendmask'||mon.storyPhase992===1){
      add('pistol','낡은 권총','銃','3~7칸 · 주기 4턴','공격력 +3의 원거리 공격. 벽과 몸으로 사선을 끊을 수 있다.');
      add('blockade','정부 봉쇄부적','封','주기 6턴','대상 주변 빈 바닥 최대 2칸에 덫을 놓아 퇴로를 묶는다.');
    }
    if(mon.idlePotionKind105){const item=mon.inventory?.find(i=>i.potionKind===mon.idlePotionKind105);add('potion','중회복 비약','藥',item?'HP 50% 이하 · 소지품 소모':'소지 비약 없음',`기술·공격할 일이 없을 때 마신다. HP +${Math.max(18,Math.ceil(mon.maxHp*.6))}(최대 HP까지), 출혈을 50% 확률로 제거. 마신 약은 드롭되지 않는다.`,'constitution','조건');}
    if(mon.wallBreak)add('wall-break','구조물 파괴','破','이동 경로','길을 막은 부술 수 있는 벽·가구를 무너뜨리며 접근한다.','strong','지속');
    if(mon.martialActor105)return skills;
    if(mon.bossPattern||mon.palaceLotus105)return skills;
    if(mon.combatFixture54==='silk'){
      add('silk-link','비단의 매듭','絲','거울 연결 중','거울을 깨면 연결된 실이 사라진다.','constitution','지속');
      if(mon.silkMirrorColor54==='black')add('mirror-summon','거울 속 환영','鏡','실로 연결되어 있을 때','환영들을 점점 빠르게 부른다. 이 거울을 깨면 여기서 나온 환영과 그 소환수도 사라진다.');
    }
    if(mon.combatFixture54==='core')add('core-shield','천실핵 보호','核','사념체가 살아 있는 동안','만루보주를 무적으로 만들고 증원을 부른다. 사념체를 파괴하면 보호가 끝난다.','constitution','지속');
    const legend=mon.legendMob47&&LEGEND_SKILLS986[mon.legendSkill47];if(legend)add('legend',...legend);
    for(const r of visibilityStackRules(mon)){
      if(r.trait==='gaze')add('gaze','응시 폭발','目',`${r.range}칸 · 연속 응시 ${r.turns}턴`,'시선을 계속 허용하면 응시 폭발과 기절 2턴. 시야를 끊으면 누적이 풀린다.');
      else if(r.trait==='hook')add('hook','갈고리 견인','引',`${r.minRange||0}~${r.range}칸 · 연속 시야 ${r.turns}턴`,'2칸 당긴 뒤 공격력 +3으로 공격. 벽 뒤로 피하면 준비가 풀린다.');
      else if(r.effect==='summon')add('stack-summon','해련 식재','蓮',`${r.range}칸 · 연속 시야 ${r.turns}턴`,`${r.species} 소환 · 살아 있는 소환수 최대 ${r.cap}마리. 시야를 끊으면 준비가 풀린다.`);
    }
    if(mon.summoner&&mon.summonName57)add('summon',mon.summonName57+' 소환','召','발견 후 6턴 · 재사용 6턴','한 번 발견한 뒤 전투·수색 중 보조 개체를 부른다.');
    if(mon.charge)add('charge','직선 돌진','衝','2~6칸 · 예고 1턴 · 재사용 5턴','직선으로 최대 5칸 전진, 공격력 +3과 밀침. 견고한 벽에 막히면 경직 1턴.');
    const role=mon.role61;
    if(role==='artillery'||role==='fireArtillery')add('artillery',role==='fireArtillery'?'화염 착탄':'폭발탄','砲',`${mon.artilleryRange61||9}칸 · 3×3 · 예고 1턴`,role==='fireArtillery'?'공격력 +2. 착탄 구역에 4턴 화염을 남긴다.':'착탄 구역에 공격력 +3의 폭발 공격.');
    if(role==='gas')add('gas',mon.gasStatus57==='drunk'?'취기 가스':'독가스','煙','6칸 · 예고 1턴 · 재사용 6턴','대상 주변 3×3에 3턴 동안 상태이상 가스를 남긴다.');
    if(role==='poison')add('poison-mist','독 안개','毒','6칸 · 3×3 · 예고 1턴','범위 공격에 적중하면 중독 5턴. 일부 바닥은 덫으로 변한다.');
    if(role==='controller')add('seal','기 봉인 사선','封','9칸 안 · 예고 1턴',`8칸 사선에 공격력 +1. 적중하면 기봉인 ${floor>=21?4:3}턴.`);
    if(role==='webber'&&floor>=11)add('web','비단·거미줄 포획','網','6칸 · 3×3 · 예고 1턴',`적중하면 기절 1턴.${mon.silkTrapCount57?` 비단 덫 최대 ${mon.silkTrapCount57}개: 현재 HP 절반 피해, 인접 상호작용으로 해제.`:' 일부 바닥에 덫이 남는다.'}`);
    if(role==='shell')add('shell','방어 자세','盾','4칸 안에서 사용',`DEF +${floor>=16?8:7}, ${floor>=16?3:2}턴.`,'strong');
    if(role==='blinkPunisher')add('blink-punish','점멸 흔적 포식','食','점멸 직후 · 사거리 4칸',`공격력 +2. 적중하면 기력 ${floor>=21?3:2} 감소.`);
    if(role==='alarm')add('alarm','경종','警',`주변 8칸 · 재사용 ${floor>=16?7:8}턴`,`아군을 깨우고 공격력 +${floor>=16?3:2}, ${floor>=16?4:3}턴 강화.`);
    if(role==='swoop')add('swoop','급강하','翔','3~8칸 · 직선 시야',`${floor>=21?3:2}칸 접근. 붙으면 공격력 +2와 1칸 밀침.`);
    if(role==='asura'){add('domain','아수라장','界',`반경 ${mon.asuraRadius47||3}칸 · 지속 ${mon.asuraDuration47||5}턴`,'1턴 예고 후 영역 밖에서 시작된 직접 공격을 무효화.');add('volley','다완 투척','腕',`영역 밖 · 사거리 ${mon.asuraRange47||9}칸`,'1턴 예고 후 공격력 +4, +1로 연속 투척.');}
    const onHit=[['poison','독','毒','중독 4턴 · 32%'],['bleed','출혈','血','출혈 4턴 · 34%'],['web','포획','網','기절 1턴 · 30%'],['heavyHit57','무거운 일격','重','쇠약 3턴 · 28%'],['blind','실명','暗','실명 4턴 · 45%'],['sealSkill','기 봉인','封','기봉인 5턴 · 42%']];
    for(const[key,name,seal,meta]of onHit)if(mon[key])add(key,name,seal,'공격 적중 시','기본 '+meta+' 확률. 의지·면역에 따라 감소.','brawl','지속');
    if(mon.focusDrain)add('focus-drain','기력 흡수','氣','공격 적중 시',`기력 ${mon.focusDrain} 감소.`,'constitution','지속');
    if(mon.hungerDrain)add('hunger-drain','허기 약탈','飢','공격 적중 시',`허기 ${mon.hungerDrain} 감소.`,'constitution','지속');
    if(mon.knockback)add('push','밀치기','推','공격 적중 시','대상을 1칸 밀친다.','brawl','지속');
    if(mon.infectionHitsRequired57)add('illness','중병 감염','病',`근접 피해 ${mon.infectionHitsRequired57}회`,'같은 쥐에게 누적 피해를 받으면 중병. 발병 유예 27턴, 재적중하면 유예 단축. 해독산·정화로 치료.','constitution','지속');
    if(mon.hiveTree105)add('bees','벌떼 분출','蜂',`피해를 받을 때 · 최대 ${mon.summonOwner105==='player'?Math.min(4,summonChildLimit(mon.summonBookId105)):4}마리`,'주변 빈칸에 벌떼를 한 마리씩 부른다. 마지막 일격에도 발동할 수 있다.','constitution','지속');
    if(mon.treeMimic105)add('disarm','무장 해제','奪','인접 공격','피해와 함께 무기를 쳐낸다. 무기는 행낭으로, 자리가 없으면 주변 바닥으로 돌아간다.','brawl');
    if(mon.split)add('split','사후 분열','分','사망 시 · 2마리',mon.split==='acid'?'작은 산성 슬라임으로 한 번만 분열한다.':'작은 먹물 둘로 분열한다.','constitution','지속');
    if(mon.exitPressureSpeed57){const r=mon.exitPressureSpeed57;add('exit-speed','출구 추격','追',`행동 속도 ${Math.round(r.min*100)}~${Math.round(r.max*100)}%`,'플레이어가 24층 출구에 가까워질수록 행동 속도가 올라간다.','ghost','지속');}
    if(mon.exitPressureSense57)add('exit-sense','탈출자 추적','察','본관 24층 · 현관 개방 후','출구로 다가가는 상대의 위치를 시야 밖에서도 추정한다. 출구에 아주 가까워지면 위치를 정확히 짚는다.','ghost','지속');
    if(mon.revivalLives57)add('revive','아홉 목숨','命',`남은 목숨 ${mon.livesRemaining57??mon.revivalLives57}`,'쓰러지면 시체가 먼 곳으로 옮겨져 다시 일어난다. 부활 직후 잠시 약해지고 완전히 깨어나면 강화된다.','constitution','지속');
    if(mon.losLostSummon57)add('lost-summon','시야 밖 증원','召',`시야 단절 · 재사용 ${mon.losLostSummon57.normalCooldown}/${mon.losLostSummon57.fullCooldown}턴`,`${mon.losLostSummon57.names.join('·')} 소환. 처치 순간에도 발동 가능. 정상/완전 부활 단계 기준.`,'constitution','지속');
    if(mon.waterTrail)add('water-trail','물길 흔적','水','이동 경로','지나간 바닥을 6턴 동안 물길로 바꾼다.','ghost','지속');
    if(mon.lavaTrail57)add('lava-trail','용암 흔적','熔','이동 경로 · 3턴','지나간 바닥을 용암으로 바꾼다.','ghost','지속');
    if(mon.fireTrail||mon.lava)add('fire-body','화염 체질','火','화염 저항 · 연소 면역','불 피해 ×0.25, 물 피해 ×1.45, 냉기 피해 ×1.25.','constitution','지속');
    if(mon.projectileImpact57){const p=mon.projectileImpact57;add('projectile-impact','착탄 화염','火',`${p.radius*2+1}×${p.radius*2+1} · ${p.turns}턴`,'화살 착탄점에 화염을 남긴다. 물로 끌 수 있다.','brawl','지속');}
    if(role==='formation')add('formation','전열 방어','陣','동료 인접 시',`같은 전열의 아군이 인접하면 DEF +${floor>=21?5:floor>=16?4:floor>=11?3:2}.`,'strong','지속');
    if(mon.armorPierce)add('pierce','방어 관통','穿','공격 효과','공격이 대상의 방어를 관통한다.','brawl','지속');
    if(mon.guardChance57)add('guard','정면 방어','防',`기본 방어 확률 ${Math.round(mon.guardChance57*100)}%`,'정면 공격을 막아낼 수 있다.','strong','지속');
    if(mon.multiAttack)add('multi','연속 공격','連','한 공격 행동','연속으로 공격한다. 첫 타 뒤의 공격은 약해질 수 있다.','brawl','지속');
    if(mon.enrage&&mon.multiAttack)add('enrage','격노','怒','HP 50% 이하','한 공격 행동의 타격 횟수가 2회에서 3회로 늘어난다.','strong','지속');
    return skills;
  }
function entityIsPlayer(e){return !!(state&&e===state.player)}
function entityAdapted(e,kind,x=e?.x,y=e?.y){
  if(entityIsPlayer(e)){
    if(kind==='water'&&remain('drown')>0)return true;
    if(kind==='void'&&remain('void')>0)return true;
    if(kind==='lava'&&playerCloak().lavaWalk)return true;
    return false
  }
  if(!e)return false;
  if(e.flying)return true;
  if(kind==='water'&&e.aquatic)return true;
  if(kind==='mercury'&&e.mercuryAdapted57)return true;
  if(kind==='lava'&&e.lava)return true;
  return false
}
function monsterHazardDeath(mon,kind){
  const visible=state?.visible?.has?.(k(mon.x,mon.y));
  if(visible)addLog(`${mon.name}이 ${kind==='water'?'깊은 물에 가라앉았다':kind==='void'?'공허 아래로 추락했다':kind==='mercury'?'수은 웅덩이에 잠겨 버렸다':'용암에 삼켜졌다'}.`);
  if(mon.hp>0){mon.hp=0;killMonster(mon)}
}
// Species are selected by the canonical kind field, never by appearance.
const SUMMON_RACES=Object.freeze({fire:{name:'야수',kinds:['beast'],dry:true},water:{name:'모든 수생 종족·슬라임',kinds:['slime'],aquatic:true},shock:{name:'구조체',kinds:['construct']},grass:{name:'식물',kinds:['plant']},earth:{name:'인간·무도가',kinds:['human']},ice:{name:'언데드',kinds:['undead']},holy:{name:'정령',kinds:['spirit']}});
const SUMMON_RULES=Object.freeze({upgradeDecay:.18,cooldownDecay:.18,maxHpDiscount:.4,cooldown:72,directSlots:1,descendantCap:3,pictureKills:8,latePictureKills:6,combatLeash:8,combatTargetLeash:10,acquireRadius:5,combatMemoryTurns:4});
const SUMMON_COLORS=Object.freeze({fire:'#c9654f',water:'#6da9cc',shock:'#b8a3d8',grass:'#78a879',earth:'#bf9867',ice:'#94c7d0',holy:'#ddc582'});
function summonHpMultiplier(upgrade=summonState().upgrade){const u=Math.max(0,Math.floor(Number(upgrade)||0));return 1-SUMMON_RULES.maxHpDiscount+SUMMON_RULES.maxHpDiscount/(1+SUMMON_RULES.upgradeDecay*u);}
function summonHpCost(entry=null,upgrade=summonState().upgrade){const p=state.player,mudang=p.classId==='summoner';return Math.max(1,Math.ceil((mudang?p.hp:p.maxHp)*.5*summonHpMultiplier(upgrade)*(mudang?.75:1)));}
function summonBookItem(){return{name:'만령 소환술서',type:'book',summonItem105:'book',summonRecoveryUntil105:0,tier:4,rarity:'rare',identified:true,curseImmune991:true,desc:'소환술서마다 보유한 동안 적 종류별 처치가 따로 쌓여 기본 8회, 테마 후반부터 등장하는 일반 적은 6회마다 해당 적의 그림이 떨어진다. 문지기는 그림 처치 횟수에 포함되지 않는다. 그림을 한 장 이상 끼우고 속성부적으로 종족을 정한 뒤 책에서 원하는 영을 고른다. 같은 그림의 첫 장은 현재 전투 층배율, 추가 한 장마다 +1층 배율을 받는다. 기본 소모 HP는 최대 HP의 절반을 기준으로 하며 무당은 현재 HP를 기준으로 한다. 기운 회복은 책마다 따로 72턴이며 책을 강화하면 두 비용이 점차 적게 감소한다. 책마다 한 마리씩 죽거나 교체할 때까지 함께하며 영이 다시 부른 개체는 책의 소환 한도에 포함되지 않는다. 같은 속성부적을 다시 끼우면 해당 종족의 끼운 그림 하나를 복제한다.'};}
function summonSealItem(){return clone((window.MANRU_TALISMANS||[]).find(i=>i.talismanKind==='upgrade'));}
function summonBook(id=null){const books=(state?.player?.inventory||[]).filter(i=>i.summonItem105==='book'),active=id??state?.player?.summoning105?.activeBook105;return active?books.find(b=>b.summonBookId105===active)||(!id?books[0]:null):books[0]||null;}
function summonState(){
 const q=state.player.summoning105||(state.player.summoning105={level:0,upgrade:0,serial:0,contracts:{},balanceVersion105:9,descendantCap105:SUMMON_RULES.descendantCap});
 q.serial=Math.max(0,Math.floor(Number(q.serial)||0));q.bookSerial105=Math.max(0,Math.floor(Number(q.bookSerial105)||0));q.contracts=q.contracts||{};q.killCounts105=q.killCounts105||{};
 const migrating=q.balanceVersion105!==9,books=state.player.inventory.filter(i=>i.summonItem105==='book');
 for(const book of books){
  if(!book.summonBookId105)book.summonBookId105=`book-${++q.bookSerial105}`;
  book.upgrade=Math.max(0,Math.floor(Number(book.upgrade)||0));
  if(migrating)book.upgrade=Math.max(book.upgrade,Math.floor(Number(q.upgrade)||0),![2,3,4,5,6,7,8].includes(q.balanceVersion105)?Math.max(0,(q.level||0)-1):0);
  book.summonPictures105=book.summonPictures105||{};
  if(!book.summonKillCounts105)book.summonKillCounts105=q.pictureCounterVersion105===1?{}:clone(q.killCounts105);
  for(const [name,n]of Object.entries(book.summonKillCounts105))if(!Number.isSafeInteger(n)||n<0)delete book.summonKillCounts105[name];
  if(!SUMMON_RACES[book.summonElement105])book.summonElement105=SUMMON_RACES[q.element]?q.element:null;
  book.desc=summonBookItem().desc;
 }
 if(migrating){
  const locations=summonContainers(),keep=locations.flatMap(l=>l.world.monsters||[]).find(m=>m.summonOwner105==='player'&&!m.summonParent105&&summonActive(m));
  q.balanceVersion105=9;delete q.cache;delete q.command;delete q.element;summonRetire(keep,locations);q.contracts={};
  if(keep){const id=keep.summonContract105||`summon-${++q.serial}-${state.turn}`;Object.assign(keep,{summonContract105:id,summonPersistent105:true,summonExpire105:null});for(const key of ['allyExpireTurn47','ttl47','summonCost105','summonCommand105','summonTarget105','summonAnchor105'])delete keep[key];configureSummonBody105(keep);q.contracts[id]={persistent105:true,expires:null};if(books[0]&&!books[0].summonElement105&&SUMMON_RACES[keep.summonElement105])books[0].summonElement105=keep.summonElement105;for(const l of locations)if(l.pageKey&&l.world.monsters.includes(keep))state.branchWorld105.pages[l.pageKey]=branchEncodePage(l.world);}
 }
 if(books.length)q.pictureCounterVersion105=1;
 const book=summonBook();
 // Preserve existing book contracts while normalizing old summon geometry once.
 if(!q.bookContractsVersion105){
  for(const l of summonContainers()){for(const mon of l.world.monsters||[])if(mon.summonOwner105==='player'){configureSummonBody105(mon);mon.summonBookId105=mon.summonBookId105||book?.summonBookId105||null;const contract=q.contracts[mon.summonContract105];if(contract)contract.bookId105=mon.summonBookId105;}if(l.pageKey)state.branchWorld105.pages[l.pageKey]=branchEncodePage(l.world);}
  q.bookContractsVersion105=1;OccupancyService.endShared();
 }
 // Restore native plant bodies in contracts saved while plants were made mobile.
 if(q.plantBodyVersion105!==1){
  const definitions=summonDefinitions();
  for(const l of summonContainers()){let changed=false;for(const mon of l.world.monsters||[])if(mon.summonOwner105==='player'&&mon.kind==='plant'){
   const def=definitions.find(d=>d.name===monsterSpeciesName(mon));if(!def)continue;
   mon.fixed=!!def.fixed;if(def.immobile105)mon.immobile105=def.immobile105;else delete mon.immobile105;
   mon.summonForm105=mon.fixed?'fixed':'mobile';configureSummonBody105(mon);changed=true;
  }if(changed&&l.pageKey)state.branchWorld105.pages[l.pageKey]=branchEncodePage(l.world);}
  delete q.mobilePlantsVersion105;q.plantBodyVersion105=1;OccupancyService.endShared();
 }
 // Old saves stored one player-wide deadline. Transfer it once to the active book.
 // If no book is held, retain the legacy deadline until a book can receive it.
 if(book&&Object.prototype.hasOwnProperty.call(q,'cooldownUntil')){
  if(book.summonRecoveryUntil105==null)book.summonRecoveryUntil105=q.cooldownUntil;
  delete q.cooldownUntil;
 }
 for(const held of books)held.summonRecoveryUntil105=Math.max(0,Math.floor(Number(held.summonRecoveryUntil105)||0));
 q.activeBook105=book?.summonBookId105||null;q.upgrade=book?.upgrade||0;q.level=book?1+q.upgrade:0;
 if(q.speciesVersion105!==1)summonMigrateSpecies105(q);else for(const held of books)normalizeSummonSpeciesItem105(held);
 // Migrate saved contracts once when the authored descendant limit changes.
 // Admission and travel then use the same limit; roots and their books remain intact.
 if(q.descendantCap105!==SUMMON_RULES.descendantCap){
  const retained=new Map();
  for(const location of summonContainers()){
   if(location.pageKey===branchWorldKey())continue;
   let changed=false;
   for(const mon of [...(location.world.monsters||[])]){
    if(!summonActive(mon)||!mon.summonParent105||mon.combatFixture54)continue;
    const id=mon.summonBookId105,count=retained.get(id)||0;
    if(count<summonChildLimit(id)){retained.set(id,count+1);continue;}
    if(location.current)removeAlly(mon);else location.world.monsters.splice(location.world.monsters.indexOf(mon),1);
    changed=true;
   }
   if(changed&&location.pageKey)state.branchWorld105.pages[location.pageKey]=branchEncodePage(location.world);
  }
  q.descendantCap105=SUMMON_RULES.descendantCap;
 }
 return q;
}
function summonActive(mon){return !!mon&&mon.summonOwner105==='player'&&!mon.deathProcessed57&&(mon.hp>0||mon.revivePhase57==='corpse')&&(mon.summonPersistent105===true||Number.isFinite(mon.summonExpire105)&&mon.summonExpire105>state.turn);}
function summonContainers(){
 const locations=[{world:state,current:true},{world:state.artifactReturn46?.outer},{world:state.shopIntermission?.outer?.state}].filter(l=>l.world);
 for(const [pageKey,raw]of Object.entries(state.branchWorld105?.pages||{}))locations.push({world:branchDecodePage(raw),pageKey});return locations;
}
function summonAll(){return summonContainers().filter(l=>!l.pageKey||l.pageKey!==branchWorldKey()).flatMap(l=>l.world.monsters||[]).filter(summonActive);}
function summonRetire(keep=null,locations=summonContainers(),bookId=null){
 for(const l of locations){for(const mon of [...(l.world.monsters||[])])if(mon.summonOwner105==='player'&&mon!==keep&&(!bookId||mon.summonBookId105===bookId)){if(l.current)removeAlly(mon);else l.world.monsters.splice(l.world.monsters.indexOf(mon),1);}if(l.pageKey)state.branchWorld105.pages[l.pageKey]=branchEncodePage(l.world);}
}
// Species identity survives encounter-only labels and stat enhancements.
// Prefix/suffix decoding exists only for saves made before identity was recorded.
function monsterSpeciesName(mon){
 if(typeof mon==='object'&&mon?.storyPhase992===2&&mon.bossPattern==='master')return BOSSES[25].name;
 const name=typeof mon==='string'?mon:mon?.monsterSpecies105||mon?.name||'';
 return String(name).replace(/^강화 /,'').replace(/(?: · 문지기)+$/,'');
}
function monsterSpeciesCatalog(){
 const list=[...MONSTERS.map(def=>({def,group:def.boss?'보스':'일반'})),...CITADEL_ENEMIES105.map(def=>({def,group:'별관'})),...Object.entries(BOSSES).map(([floor,def])=>({def:{...def,boss:true,min:Number(floor),max:25},group:'보스'})),...globalThis.__MANRU_LEGEND47__.mobCatalog().map(def=>({def,group:'별관'}))];
 const seen=new Set();return list.filter(({def})=>{if(seen.has(def.name))return false;seen.add(def.name);return true});
}
function summonDefinitions(){
 return monsterSpeciesCatalog().map(({def})=>def).filter(d=>!d.storyPhase992&&!d.combatFixture54);
}
function summonCatalog(){
 const q=summonState(),actors=(q.prototypes||[]).filter(e=>e.actor);
 q.prototypes=summonDefinitions().map(d=>({name:d.name,def:clone(d)}));
 for(let rank=1;rank<=4;rank++){const name=['','문하생','수련생','상급 무도가','사범급 무도가'][rank],stored=actors.find(e=>e.name===name&&e.actor.martialActor105&&e.actor.dojoRank105===rank),actor=stored?.actor||dojoCreateMartialist(rank,-1,rank,false,5,{level:rank<=2?1:2});q.prototypes.push({name,actor:clone(actor)});}
 return q.prototypes;
}
function summonMatches(def,element){const race=SUMMON_RACES[element];return !!race&&!!def&&(race.kinds.includes(def.kind)&&!(race.dry&&def.aquatic)||!!(race.aquatic&&def.aquatic));}
function summonNative(entry,floor){
 let mon;
 if(entry.actor){mon=clone(entry.actor);const stats=scaledMonster({name:mon.name,hp:mon.maxHp,atk:mon.baseAtk,def:mon.baseDef,eva:mon.baseEva,kind:mon.kind},floor);mon.hp=mon.maxHp=stats.maxHp;mon.baseAtk=stats.atk;mon.baseDef=stats.def;mon.baseEva=stats.eva;syncMartialActorStats(mon);for(const key of ['dojoSector105','dojoFinal105','combatantId54','allyId53'])delete mon[key];}
 else{const def=summonDefinitions().find(d=>d.name===monsterSpeciesName(entry.name));if(!def)throw Error('Unknown summon species '+entry.name);mon=scaledMonster(clone(def),floor,{scaling:'floor'});}
 if(mon.floor24Chaser57){mon.gumiScaleVersion57=3;mon.baseAtk57=mon.atk;mon.baseDef57=mon.def;mon.baseEva57=mon.eva;}
 globalThis.__MANRU_AI61__?.configure(mon);mon.guardHome57=null;configureSummonBody105(mon);return mon;
}
function summonRecipes(level=summonState().level,floor=branchCombatFloor(),book=summonBook()){
 if(!level||!book||!SUMMON_RACES[book.summonElement105])return [];
 return summonCatalog().filter(e=>Number.isSafeInteger(book.summonPictures105[e.name]?.count)&&book.summonPictures105[e.name].count>0&&summonMatches(e.def||e.actor,book.summonElement105)).map(base=>{
  const picture=book.summonPictures105[base.name],count=picture.count,effectiveFloor=floor+count-1,preview=summonNative(base,effectiveFloor);
  return{entry:{...base,preview,portrait105:picture.portrait},count:1,pictureCount105:count,level,floor:effectiveFloor,baseFloor105:floor};
 }).sort((a,b)=>a.entry.name.localeCompare(b.entry.name,'ko'));
}
function summonPictureGrade(count=1){return Math.max(0,Math.min(5,Math.floor(Number(count)||1)-1));}
function summonPictureItem(name,portrait=null,copies=1){name=monsterSpeciesName(name);portrait=summonDefinitions().find(d=>d.name===name)||portrait;return{summonSpeciesVersion105:1,name:`화공노인의 ${name} 그림`,type:'painting',summonItem105:'picture',summonSpecies105:name,summonPortrait105:portrait?clone(portrait):null,pictureCopies105:copies,tier:1,rarity:copies>=6?'sealed':copies>=5?'relic':copies>=3?'rare':copies>=2?'uncommon':'common',stackMax:99,count:1,identified:true,curseImmune991:true,desc:`화공노인이 그린 ${name}의 모습이다. 소환술서에 끼우면 이 영을 기억한다. 같은 그림은 한 칸에 모이며 첫 장 이후 한 장마다 소환 층배율이 +1층 오른다. 현재 부적의 종족과 일치해야 소환할 수 있다.`};}
function summonPictureKills(mon){
 const def=summonDefinitions().find(d=>d.name===monsterSpeciesName(mon))||mon?.def||mon;
 const min=def?.min,themeStart=Number.isInteger(min)?Math.floor((min-1)/5)*5+1:null;
 const late=Number.isInteger(min)&&min>=1&&min<=25&&min>=themeStart+2&&!def.boss&&!def.miniBoss&&!def.summonOnly57&&!def.martialActor105;
 return late?SUMMON_RULES.latePictureKills:SUMMON_RULES.pictureKills;
}
function summonRecordKill(mon,reward){
 if(!reward.kills||state.debugBattle57||mon.legendElite47||!summonBook()||mon.summonOwner105||mon.combatFixture54||mon.martialActor105||mon.dojoRank105||mon.shape==='martialist')return;
 const name=monsterSpeciesName(mon),entry=summonCatalog().find(e=>e.name===name);if(!entry)return;
 const required=summonPictureKills(entry.def||mon);let drawings=0;
 for(const book of state.player.inventory.filter(i=>i.summonItem105==='book')){const next=(book.summonKillCounts105[name]||0)+1;if(!Number.isSafeInteger(next))continue;book.summonKillCounts105[name]=next;if(next%required===0)drawings++;}
 if(!drawings)return;
 for(let n=0;n<drawings;n++)PlacementService.placeItem(summonPictureItem(name,entry.def||entry.actor),{x:mon.x,y:mon.y},{requireReachable:false});
 addLog(`${name} · 책별 ${required}회 격파 달성 · 화공노인의 그림 ${drawings}장이 떨어졌다.`);
}
function summonCells(recipes=summonRecipes(),ignore=new Set()){
 const cells=[];for(const key of state.visible){const[x,y]=key.split(',').map(Number);if(entityDistance57({x,y},state.player)<=5&&citadelAccess(x,y)&&![TT.PORTAL,TT.SWITCH,TT.STAIR,TT.VOID].includes(state.map[y]?.[x])&&recipes.some(r=>PlacementService.monsterCanStand(r.entry.preview,x,y,null,{ignore})))cells.push({x,y});}return cells;
}
function summonChildLimit(bookId){const book=summonBook(bookId);return book?Math.min(1+Math.max(0,Math.floor(Number(book.upgrade)||0)),SUMMON_RULES.descendantCap):0;}
function summonChildCount(bookId,all=summonAll(),ignore=null){return all.filter(m=>m!==ignore&&m.summonBookId105===bookId&&m.summonParent105&&!m.combatFixture54).length;}
function summonCanAdmit(mon){
 if(!mon?.summonOwner105)return true;if(mon.summonOwner105!=='player'||!summonActive(mon))return false;
 if(state.monsters.some(m=>m===mon||mon.allyId53&&m.allyId53===mon.allyId53))return false;
 const q=summonState(),contract=q.contracts?.[mon.summonContract105];if(!contract||!(contract.persistent105===true||Number.isFinite(contract.expires)&&contract.expires>state.turn))return false;
 const all=summonAll(),roots=all.filter(m=>!m.summonParent105);
 if(mon.summonParent105){
  const root=roots.find(m=>m.summonContract105===mon.summonContract105&&m.summonRoot105===mon.summonRoot105&&m.summonBookId105===mon.summonBookId105);
  if(!root||!summonBook(mon.summonBookId105))return false;
  return !!mon.combatFixture54||summonChildCount(mon.summonBookId105,all,mon)<summonChildLimit(mon.summonBookId105);
 }
 return !!summonBook(mon.summonBookId105)&&!roots.some(m=>m.summonBookId105===mon.summonBookId105);
}
function summonInherit(child,parent){if(!parent?.summonOwner105)return child;Object.assign(child,{faction57:entityFaction(parent),friendly47:isPlayerAlly57(parent),allyId53:`summon-child-${++state.player.summoning105.serial}-${state.turn}`,summonOwner105:parent.summonOwner105,summonBookId105:parent.summonBookId105,summonContract105:parent.summonContract105,summonParent105:parent.allyId53||combatantId(parent),summonRoot105:parent.summonRoot105||parent.allyId53,summonElement105:parent.summonElement105,summonPersistent105:parent.summonPersistent105,summonExpire105:parent.summonExpire105,rewardPolicy57:{xp:false,drops:false,kills:false},spawnProvenance57:'player-summon-child'});delete child.allyExpireTurn47;delete child.ttl47;configureSummonBody105(child);return child;}
function summonCleanup(){
 if(!state?.player?.summoning105)return;const q=summonState();for(const mon of [...state.monsters])if(mon.summonOwner105&&(!summonActive(mon)||mon.summonParent105&&!q.contracts[mon.summonContract105]))removeAlly(mon);
 for(const [id,contract]of Object.entries(q.contracts||{}))if(!contract.persistent105&&Number.isFinite(contract.expires)&&contract.expires<=state.turn)delete q.contracts[id];
}
function summonCombatTarget(mon){
 if(mon?.summonOwner105!=='player'||!mon.allyTargetId54||entityDistance57(mon,state.player)>SUMMON_RULES.combatLeash)return null;
 const target=state.monsters.find(t=>combatTargetValid57(mon,t)&&combatantId(t)===mon.allyTargetId54);
 if(!target||entityDistance57(target,state.player)>SUMMON_RULES.combatTargetLeash)return null;
 const detected=actorDetectedTarget57(mon,target,12);
 if(!detected&&state.turn>(mon.allySearchUntilTurn54??-1))return null;
 return{target:detected?target:null,destination:detected?target:mon.allyLastSeenPosition54};
}
function summonEscortTurn(){
 if(!state?.player?.summoning105||state.lastSummonEscortTurn105===state.turn)return;
 summonState();state.lastSummonEscortTurn105=state.turn;
 const followers=(state.monsters||[]).filter(m=>summonActive(m)&&m.hp>0&&!m.combatFixture54&&!(m.stunned>0)&&!m.sleeping105).sort((a,b)=>entityDistance57(a,state.player)-entityDistance57(b,state.player)),movementIgnore=new Set(followers);
 for(const mon of followers){
  if(summonCombatTarget(mon))continue;
  const radius=DIRS8.some(([dx,dy])=>PlacementService.monsterCanStand(mon,state.player.x+dx,state.player.y+dy))?1:2;
  for(let i=0;i<4&&entityDistance57(mon,state.player)>radius;i++)if(!moveMonsterToward(mon,state.player,{followDistance:radius,movementIgnore,yieldBounds:{owner:state.player,radius:2},movementBounds:entityDistance57(mon,state.player)<=2?{owner:state.player,radius:2}:null}))break;
 }
}
function summonFollowers(){const list=(state.monsters||[]).filter(summonActive);for(const mon of list)mon.summonTravelFloorTurn105=state.floorTurn;return list;}
function summonCast(name,bookId=null){
 if(!state?.player||state.debugBattle57)return false;const q=summonState(),book=summonBook(bookId);if(!book)return false;
 if(!SUMMON_RACES[book.summonElement105])return false;
 const recipe=summonRecipes(1,branchCombatFloor(),book).find(r=>r.entry.name===name),cost=summonHpCost(null,book.upgrade);
 if(!recipe){toast('책에 끼운 그림과 부적의 종족을 확인하자.');return false;}
 if(state.turn<book.summonRecoveryUntil105){toast(`술서의 기운이 돌아오려면 ${book.summonRecoveryUntil105-state.turn}턴이 필요하다.`);return false;}
 if(state.player.hp<=cost){toast(`소환에는 HP ${cost}와 살아남을 체력이 필요하다.`);return false;}
 const replacing=new Set(state.monsters.filter(m=>m.summonOwner105==='player'&&m.summonBookId105===book.summonBookId105)),cells=summonCells([recipe],replacing).filter(p=>entityDistance57(p,state.player)<=2).sort((a,b)=>entityDistance57(a,state.player)-entityDistance57(b,state.player)),spot=cells.find(p=>PlacementService.monsterCanStand(recipe.entry.preview,p.x,p.y,null,{ignore:replacing}));
 if(!spot){toast('곁에 소환할 자리가 없다.');return false;}
 const act=playerAction57('summon',{uiOwner:'summonPanel105',skill:true,stunMessage:'몸이 굳어 소환하지 못했다.'});if(!act.ok)return false;
 const mon=summonNative(recipe.entry,recipe.floor),had=summonAll().some(m=>!m.summonParent105&&m.summonBookId105===book.summonBookId105);closeSummonPanel();const snapshot=captureGenerationSnapshot();
 try{
  summonRetire(null,summonContainers(),book.summonBookId105);for(const [key,c]of Object.entries(q.contracts))if(c.bookId105===book.summonBookId105)delete q.contracts[key];const contract=`summon-${++q.serial}-${state.turn}`,id=`${contract}-0`;q.contracts[contract]={persistent105:true,expires:null,bookId105:book.summonBookId105};
  Object.assign(mon,spot,{faction57:'player',friendly47:true,allyId53:id,summonBookId105:book.summonBookId105,summonRoot105:id,summonContract105:contract,summonOwner105:'player',summonElement105:book.summonElement105,summonPersistent105:true,summonExpire105:null,summonPictureCount105:recipe.pictureCount105,summonCombatFloor105:recipe.floor,rewardPolicy57:{xp:false,drops:false,kills:false},spawnProvenance57:'player-summon',mimicDormant105:false,dormant57:false,alerted:true,hidden:false});delete mon.allyExpireTurn47;delete mon.ttl47;
  if(mon.martialActor105)mon.dojoActorId105=id;if(!OccupancyService.addMonster(mon))throw Error('소환체 배치 계약 불일치');
 }catch(error){restoreGenerationSnapshot(snapshot);console.error('summon placement rejected',error);toast('소환하지 못했다. 기존 소환체와 체력은 유지된다.');return false;}
 state.player.hp-=cost;q.activeBook105=book.summonBookId105;book.summonRecoveryUntil105=state.turn+summonRecovery105(book.upgrade);playSummonArrival(state.player,mon);addLog(`${had?'교체 소환':'소환'} · ${mon.name} 1마리 · HP ${cost} · ${recipe.floor}층 배율 · 기운 회복 ${summonRecovery105(book.upgrade)}턴`);closeSummonPanel();commitPlayerAction57(act,1);updateAll();return true;
}
function summonInstallPicture(item,bookId){
 if(!state?.player||state.debugBattle57||!state.player.inventory.includes(item)||item.summonItem105!=='picture')return false;
 const q=summonState();normalizeSummonSpeciesItem105(item);const book=summonBook(bookId),entry=summonCatalog().find(e=>e.name===item.summonSpecies105);if(!book||!entry)return false;
 const before=book.summonPictures105[entry.name]?.count||0;if(!Number.isSafeInteger(before+1))return false;
 const act=playerAction57('item',{uiOwner:'summonPanel105',allowInventory:true});if(!act.ok)return false;if(!consumeItemQuantity(item,1))return false;
 book.summonPictures105[entry.name]={count:before+1,portrait:book.summonPictures105[entry.name]?.portrait||clone(item.summonPortrait105||entry.actor||entry.def)};q.activeBook105=book.summonBookId105;
 addLog(`${entry.name} 그림을 술서에 끼웠다 · ${before+1}장 · 추가 층배율 +${before}.`);closeSummonPanel();closeInventory();commitPlayerAction57(act,1);updateAll();return true;
}
function summonBindTalisman(item,bookId,name=null){
 if(!state?.player||state.debugBattle57||!state.player.inventory.includes(item))return false;const q=summonState(),book=summonBook(bookId),element=summonTalismanElement105(item);if(!book||!element)return false;
 if(book.summonElement105===element){
  if(!name)return summonOpen(book.summonBookId105,'copy',item);
  const entry=summonCatalog().find(e=>e.name===name),picture=book.summonPictures105[name];if(!entry||!picture||!Number.isSafeInteger(picture.count)||picture.count<1||!Number.isSafeInteger(picture.count+1)||!summonMatches(entry.actor||entry.def,element))return false;
 }else if(name)return false;
 const act=playerAction57('item',{uiOwner:'summonPanel105'});if(!act.ok)return false;if(!consumeItemQuantity(item,1))return false;
 if(name){book.summonPictures105[name].count++;addLog(`${item.name}의 기운으로 ${name} 그림을 한 장 더 새겼다 · ${book.summonPictures105[name].count}장.`);}
 else{book.summonElement105=element;addLog(`${item.name}를 술서에 끼웠다 · ${SUMMON_RACES[element].name} 소환.`);}
 q.activeBook105=book.summonBookId105;closeSummonPanel();commitPlayerAction57(act,1);updateAll();return true;
}
function summonOpen(bookId=null,mode='summon',sourceItem=null){
 if(!gameplayUiOpen57())return false;const s=summonState(),book=summonBook(bookId);if(!book){toast('행낭에 소환술서가 없다.');return false;}if(mode==='summon'&&!SUMMON_RACES[book.summonElement105])return false;s.activeBook105=book.summonBookId105;
 const all=summonAll(),remaining=Math.max(0,book.summonRecoveryUntil105-state.turn),element=book.summonElement105,race=SUMMON_RACES[element],panel=summonPanel(mode==='copy'?'그림에 기운을 더한다':'만령 소환술서'),body=panel.querySelector('.summonBody105');
 SUMMON_PANEL_SESSION105={run:state,bookId:book.summonBookId105,mode,sourceItem};panel.style.setProperty('--summon-ink105',SUMMON_COLORS[element]||'#9b8863');panel.querySelector('.summonEyebrow105').textContent=`萬靈 · ${race?race.name:'속성 미정'} · 강화 +${book.upgrade}`;
 const stats=document.createElement('div');stats.className='summonStats105';for(const [label,value]of [['소모 체력',`HP ${summonHpCost(null,book.upgrade)} / ${state.player.classId==='summoner'?'현재 '+state.player.hp:'최대 '+state.player.maxHp}`],['이 책의 영',all.find(m=>!m.summonParent105&&m.summonBookId105===book.summonBookId105)?.name||'없음'],['추가 소환',`${summonChildCount(book.summonBookId105,all)} / ${summonChildLimit(book.summonBookId105)}마리`],['이 술서의 기운',remaining?`${remaining}턴 남음`:'준비 완료']]){const d=document.createElement('div'),k=document.createElement('span'),v=document.createElement('b');k.textContent=label;v.textContent=value;v.className='summonReady105';d.append(k,v);stats.append(d);}body.append(stats);
 if(mode==='summon'){
  const actions=document.createElement('div');actions.className='summonActions105';for(const [label,action]of [['부적을 끼운다',()=>summonOpenMaterials(book.summonBookId105,'talisman')],['그림을 끼운다',()=>summonOpenMaterials(book.summonBookId105,'picture')]]){const b=document.createElement('button');b.textContent=label;b.onclick=action;actions.append(b);}body.append(actions);
 }
 const heading=document.createElement('p');heading.className='summonListTitle105';heading.textContent=mode==='copy'?'같은 속성의 끼운 그림 중 한 종류를 골라 한 장을 더한다.':race?`${race.name} · 끼운 그림에서 부를 영을 고른다.`:'부적을 끼워 소환할 종족을 정하자.';body.append(heading);
 const list=document.createElement('div');list.className='summonPictures105';body.append(list);
 const recipes=summonRecipes(1,branchCombatFloor(),book);
 for(const r of recipes){
  const native=branchCombatFloor(),disabled=mode==='copy'?!sourceItem||!state.player.inventory.includes(sourceItem)||summonTalismanElement105(sourceItem)!==element:!!remaining||state.player.hp<=summonHpCost(null,book.upgrade);
  const hint=mode==='copy'?`${r.pictureCount105}장 → ${r.pictureCount105+1}장 · 추가 층배율 +${r.pictureCount105}`:`그림 ${r.pictureCount105}장 · ${native} + ${r.pictureCount105-1} = ${r.floor}층 배율${remaining?' · 기운 회복 중':state.player.hp<=summonHpCost(null,book.upgrade)?' · 체력 부족':''}`;
  const b=summonChoice(list,r.entry.name,hint,summonPictureItem(r.entry.name,r.entry.portrait105||r.entry.actor||r.entry.def,r.pictureCount105),()=>{if(SUMMON_PANEL_SESSION105?.run!==state)return;ActionDispatcher.dispatch({type:mode==='copy'?'SUMMON_TALISMAN105':'SUMMON_CAST105',args:mode==='copy'?[sourceItem,book.summonBookId105,r.entry.name]:[r.entry.name,book.summonBookId105]});},disabled);b.dataset.summonSpecies=r.entry.name;b.dataset.pictureCount=r.pictureCount105;b.dataset.pictureGrade=summonPictureGrade(r.pictureCount105);
 }
 if(!recipes.length){const empty=document.createElement('p');empty.className='summonEmpty105';empty.textContent=mode==='copy'?'이 종족의 끼운 그림이 없다. 부적은 소모되지 않는다.':race?'이 종족의 그림을 먼저 끼우자. 다른 종족의 그림도 책에 보관할 수 있다.':'그림은 부적의 속성과 관계없이 끼워 둘 수 있다.';list.append(empty);}
 const footer=document.createElement('footer');footer.className='summonFoot105';const note=document.createElement('p');note.textContent=mode==='copy'?'선택을 마치면 부적 1장만 소모한다. 취소하면 그대로 남는다.':`책마다 직접 소환 1마리 · 영의 추가 소환 최대 ${summonChildLimit(book.summonBookId105)}마리 · 지속시간 무제한 · 이 책으로 새 소환 성공 시 교체. 추가 그림은 다음 소환부터 적용. 같은 속성부적을 다시 끼우면 그림 복제. 기운 회복은 책마다 따로 기본 72턴. 강화 +${book.upgrade}: HP ${summonHpCost(null,book.upgrade)}, 기운 회복 ${summonRecovery105(book.upgrade)}턴.`;footer.append(note);body.append(footer);
 if(mode==='copy'){const back=document.createElement('button');back.textContent='취소 · 책으로';back.onclick=()=>summonOpen(book.summonBookId105);body.append(back);}return true;
}
function summonOpenMaterials(bookId,kind){
 if(!gameplayUiOpen57())return false;summonState();const book=summonBook(bookId);if(!book)return false;
 const panel=summonPanel(kind==='picture'?'그림을 끼운다':'부적을 끼운다'),body=panel.querySelector('.summonBody105'),list=document.createElement('div');list.className='summonPictures105';body.append(list);SUMMON_PANEL_SESSION105={run:state,bookId,mode:kind};
 const items=state.player.inventory.filter(i=>kind==='picture'?i.summonItem105==='picture':!!summonTalismanElement105(i));
 for(const item of items){const element=summonTalismanElement105(item),same=element&&book.summonElement105===element;const b=summonChoice(list,item.name,kind==='picture'?`보유 ${itemQuantity(item)}장 · 한 장을 끼운다`:`${SUMMON_RACES[element].name} · ${same?'끼운 그림 하나에 기운을 더한다':'책의 종족을 바꾼다'} · 1장 소모`,item,()=>{if(SUMMON_PANEL_SESSION105?.run!==state)return;ActionDispatcher.dispatch({type:kind==='picture'?'SUMMON_PICTURE105':'SUMMON_TALISMAN105',args:[item,bookId]});});b.dataset.summonMaterial=kind;b.dataset.summonMaterialName=item.name;}
 if(!items.length){const empty=document.createElement('p');empty.className='summonEmpty105';empty.textContent=kind==='picture'?`행낭에 그림이 없다. 술서를 지니고 같은 적을 기본 ${SUMMON_RULES.pictureKills}회, 테마 후반 일반 적은 ${SUMMON_RULES.latePictureKills}회 처치하자.`:'행낭에 끼울 속성부적이 없다.';list.append(empty);}const back=document.createElement('button');back.textContent='책으로 돌아간다';back.onclick=()=>summonOpen(bookId);body.append(back);return true;
}
function summonUse(item,idx){
 if(item.summonItem105==='book'){summonState();return summonOpen(item.summonBookId105);}
 if(item.summonItem105!=='picture')return false;summonState();const books=state.player.inventory.filter(i=>i.summonItem105==='book');if(!books.length){toast('그림을 끼울 소환술서가 없다.');return false;}
 if(books.length===1)return summonInstallPicture(item,books[0].summonBookId105);
 const panel=summonPanel('그림을 끼울 술서를 고른다'),body=panel.querySelector('.summonBody105');for(const book of books)summonChoice(body,`${book.name} +${book.upgrade}`,SUMMON_RACES[book.summonElement105]?.name||'속성 미정',book,()=>ActionDispatcher.dispatch({type:'SUMMON_PICTURE105',args:[item,book.summonBookId105]}));return true;
}
function summonShortcutBooks(){if(!state?.player)return [];summonState();return state.player.inventory.filter(i=>i.summonItem105==='book').sort((a,b)=>b.upgrade-a.upgrade||a.summonBookId105.localeCompare(b.summonBookId105,undefined,{numeric:true}));}
function canDisarmSilkTrap57(x,y){
 if(!state?.player||state.map[y]?.[x]!==TT.SNARE||!state.silkTraps57?.[k(x,y)]||!state.seen.has(k(x,y)))return false;
 const p=state.player;return Math.max(Math.abs(x-p.x),Math.abs(y-p.y))===1&&entityCombatLineCheckR(p,{x,y},{range:1,units:false}).ok;
}
 // save compatibility: old calls now reset the turn scheduler.
function playerCloak(){return state?.player?.cloak||{}}
function entitiesHostile57(actor,target){return !!(actor&&target&&actor!==target&&actor.hp>0&&target.hp>0&&factionsHostile57(entityFaction(actor),entityFaction(target)))}
function entitiesAllied57(actor,target){return !!(actor&&target&&entityFaction(actor)!=='neutral'&&entityFaction(actor)===entityFaction(target))}
function isPlayerAlly57(entity){return !!(entity&&entity!==state?.player&&entitiesAllied57(state?.player,entity))}
function combatTargetValid57(actor,target){return !!(entitiesHostile57(actor,target)&&(actor===state?.player||(state?.monsters||[]).includes(actor))&&(target===state?.player||(state?.monsters||[]).includes(target))&&!target.deathProcessed57&&target.revivePhase57!=='corpse')}
function setEntityFaction57(entity,faction){
 if(!entity||entity===state?.player||!['player','hostile','neutral'].includes(faction))return false;
 if(entityFaction(entity)===faction&&entity.faction57===faction)return true;
 entity.faction57=faction;entity.friendly47=faction==='player';if(state?.debugBattle57&&state.monsters.includes(entity))entity.debugSide57=faction==='player'?'A':'B';
 clearPlayerTracking58(entity);clearRetaliation(entity);delete entity.allyTargetId54;delete entity.allyLastSeenPosition54;delete entity.allySearchUntilTurn54;
 entity.intent61=null;entity.intent54=null;delete entity.asuraZone61;delete entity.asuraWarn61;entity.gazeCount=0;entity.sight=0;
 for(const child of state?.monsters||[])if(child!==entity&&entity.combatantId54&&child.bossOwnerId57===entity.combatantId54)setEntityFaction57(child,faction);
 for(const other of state?.monsters||[]){if(other===entity)continue;if(other.retaliationId53===(entity.allyId53||entity.combatantId54)&&!entitiesHostile57(other,entity))clearRetaliation(other);if(other.allyTargetId54===entity.combatantId54&&!entitiesHostile57(other,entity)){delete other.allyTargetId54;delete other.allyLastSeenPosition54;delete other.allySearchUntilTurn54}}
 return true;
}
function inheritCombatFaction57(child,parent){child.faction57=entityFaction(parent);child.friendly47=child.faction57==='player';if(parent?.summonOwner105)summonInherit(child,parent);if(parent?.coreWave54){child.coreWave54=parent.coreWave54;child.bossOwnerId57=parent.bossOwnerId57;child.rewardPolicy57={xp:false,drops:false,kills:false}}if(parent?.silkSourceMirror54){child.silkSourceMirror54=parent.silkSourceMirror54;child.bossOwnerId57=parent.bossOwnerId57;child.rewardPolicy57={xp:false,drops:false,kills:false}}return child}
function actorDetectedTarget57(actor,target,range=monsterSenseRadius(actor)){
 if(!combatTargetValid57(actor,target)||entityConcealed(target)||(target.treeMimic105&&target.mimicDormant105!==false))return false;
 if(target===state.player)return playerDetectedBy(actor);
 const curses=globalThis.__MANRU_ITEM_IDENTITY991__,sight=applyCombatDebuffStats57({vision:range},actor).vision,sense=Math.max(2,sight-(target.cloak?.senseReduce||0)+Math.round(2*((curses?.cursePower?.('clang',target)||0)+(curses?.cursePower?.('presence',target)||0))));return entityDistance57(actor,target)<=sense&&entityCombatLineCheckR(actor,target,{range:sense,ignore:target,units:false}).ok;
}
function factionsHostile57(a,b){return a!==b&&a!=='neutral'&&b!=='neutral'}
function occupancySwapAllowed57(actor,target,origin=actor){
  if(!actor||!target||target.hp<=0||factionsHostile57(entityFaction(actor),entityFaction(target))||(target.fixed&&target.kind==='plant'))return false;
  const ignored=new Set([actor,target]);if(origin!==actor)for(const e of runtimeTerrainOccupants57(origin.x,origin.y))if(e!==actor&&e.hp>0&&!factionsHostile57(entityFaction(actor),entityFaction(e))&&entityFootprintCells57(e).length===1&&!(e.fixed&&e.kind==='plant'))ignored.add(e);const ax=origin.x,ay=origin.y,tx=target.x,ty=target.y;
  if(!PlacementService.canPlaceEntity(actor,tx,ty,{ignore:ignored})||!PlacementService.canPlaceEntity(target,ax,ay,{ignore:ignored}))return false;
  const aCells=entityFootprintCells57(actor,tx,ty),bCells=entityFootprintCells57(target,ax,ay);if(aCells.some(a=>bCells.some(b=>a.x===b.x&&a.y===b.y)))return false;
  return true;
}
function spawnJarGasField57(x,y,opts={}){
  if(!state||x<=0||y<=0||x>=COLS-1||y>=ROWS-1)return null;const fields=jarGasState57();let f=fields.find(v=>v.x===x&&v.y===y&&(v.status57||'poison')===(opts.status||'poison'));
  const newField=!f,retain=!!(f?.linger57&&opts.linger&&!opts.cells),frontier=retain?[...(f.frontier||[])]:[];
  if(f){f.age=0;if(!retain){f.cells=[];f.frontier=[]}}else{f={id:`jar-${state.floor}-${state.turn}-${x}-${y}`,x,y,age:0,maxRadius:3,cells:[],frontier:[],forced:!!opts.forced};fields.push(f)}
  if(opts.source)Object.assign(f,effectSource57(opts.source));else{delete f.sourceFaction;delete f.sourceId57;}f.status57=opts.status||'poison';f.duration57=retain?Math.max(Number(f.duration57)||0,opts.duration||0):opts.duration||0;f.bornTurn57=state.turn;f.maxRadius=opts.cells?0:Math.max(retain?f.maxRadius:1,opts.maxRadius||3);f.linger57=!!opts.linger;f.burst57=!!opts.burstRadius||retain&&!!f.burst57;
  if(newField&&opts.visualDelay57)JAR_GAS_VISUAL_START57.set(f,performance.now()+opts.visualDelay57);
  for(const old of [...fields]){if(fields.length<=12)break;if(!old.burst57)fields.splice(fields.indexOf(old),1)}
  if(opts.cells){f.cells=[];f.frontier=[];f.maxRadius=0;for(const c of opts.cells)if(jarGasAirPassable(c.x,c.y))jarGasAddCell57(f,c.x,c.y,0,2,0);applyJarGasEffects57();return f}
  const center=jarGasAddCell57(f,x,y,0,3,0);f.frontier=retain?frontier:[center];const dirs=[...DIRS4],rot=Math.abs((x*7+y*11+(state.turn||0))%dirs.length);dirs.push(...dirs.splice(0,rot));let made=0;
  if(opts.burstRadius){const radius=Math.min(f.maxRadius,Math.max(1,Math.floor(opts.burstRadius))),seen=new Set([jarGasCellKey57(x,y)]),queue=[center];for(let i=0;i<queue.length;i++){const c=queue[i];if(c.d>=radius){if(!f.frontier.includes(c))f.frontier.push(c);continue}for(const[dx,dy]of DIRS8){const nx=c.x+dx,ny=c.y+dy,key=jarGasCellKey57(nx,ny);if(seen.has(key)||!jarGasAirPassable(nx,ny)||!jarGasDiagonalPass(c.x,c.y,nx,ny))continue;seen.add(key);queue.push(jarGasAddCell57(f,nx,ny,c.d+1,c.d<2?3:2,0));}}applyJarGasEffects57();return f}
  if(retain){applyJarGasEffects57();return f}
  for(const[dx,dy]of dirs){if(made>=2)break;const nx=x+dx,ny=y+dy;if(!jarGasAirPassable(nx,ny))continue;const c=jarGasAddCell57(f,nx,ny,1,2,0);f.frontier.push(c);made++}
  applyJarGasEffects57();return f
}
function destroyJar57(x,y,opts={}){
  if(!state||state.map?.[y]?.[x]!==TT.JAR)return{ok:false,reason:'not-jar'};const region=regionIndex(),base=releaseTerrainUnderlay58(x,y,furnitureFloor57(x,y));setTerrainTile58(state.map,x,y,base);burst(x,y,'#8b6a49',14,.78);
  const contents=jarContents105(x,y),cells=contents==='poison'?[]:spillJar105(x,y,contents);let gas=contents==='poison'?spawnJarGasField57(x,y,{forced:!!opts.forced}):null,accident=null;if(region===3&&opts.forced)accident=forcedJarAccident(x,y);const reward=jarReward57(x,y);const effects=FX.terrainReactions105||(FX.terrainReactions105=[]);effects.push({kind:'jar',contents,cells,x,y,map:state.map,start:performance.now(),life:1000});if(effects.length>24)effects.splice(0,effects.length-24);
  if(opts.forced){alertNearby(x,y,9);addLog(contents==='poison'?'장독을 강제로 깨뜨렸다. 큰 파열음과 함께 독가스가 확산되기 시작했다.':'장독을 강제로 깨뜨렸다. 파열음이 주변에 울렸다.')}VisibilityService.compute();return{ok:true,gas:!!gas,accident:!!accident,reward:reward?.name||null,base}
}
function terrainName(t){if(t===TT.WATER)return'깊은 물 · 인접 뭍 없으면 익사';if(t===TT.VOID)return'공허 · 추락 즉사';if(t===TT.LAVA)return'용암 · 즉사';if(t===TT.PAPER_BRIDGE)return'종이 다리 · 밟은 뒤 다음 실제 행동권 사용 후 붕괴 / 기절 턴 제외 / 10턴 복구';if(t===TT.CRUMBLE)return'불안정 발판 · 밟으면 붕괴 예고 / 10턴 복구';if(t===TT.PORTAL)return state?.artifactDungeon46?state.artifactDungeon46.name:'포탈';const decorName={
    [TT.STONE_PILLAR]:'석주',[TT.LANTERN_POST]:'등롱 기둥',[TT.WALL_BANNER]:'벽걸이 깃발',[TT.CRATE]:'목상자',[TT.BENCH]:'긴 의자',[TT.FLOWERBED]:'화단',[TT.ROCK]:'정원석',[TT.STATUE]:'석상',[TT.RACK]:'진열 선반',[TT.LOW_FENCE]:'낮은 목책',[TT.CARPET]:'융단',[TT.STONE_PATH]:'석판길',[TT.WINDOW]:'창호 창문',
    [TT.WOOD_FLOOR]:'황목 마루',[TT.MOON_STONE]:'월백 석판',[TT.DARK_WOOD]:'검목 마루',[TT.GILDED_FLOOR]:'금선 바닥',[TT.PAPER_CRANE]:'종이학 장식',[TT.LOTUS_FLOWER]:'연꽃 장식',[TT.INCENSE_STAND]:'향대',[TT.IRON_HOOK]:'철제 걸이',[TT.GOLD_LAMP]:'금등',[TT.PETAL_MAT]:'꽃잎 깔개',[TT.GARDEN_TREE]:'수목원 나무',
    [TT.BED]:'목제 침상',[TT.BOOK_STACK]:'서고 장부',[TT.RUMOR_BED]:'낡은 침상',[TT.RUMOR_MED_CABINET]:'약품 찬장',[TT.RUMOR_GAS_PIPE]:'봉인 가스관',[TT.RUMOR_FLOOD_GRATE]:'침수 배수격자',[TT.RUMOR_ARCHIVE_PILE]:'무너진 문서더미',[TT.RUMOR_WEAPON_RACK]:'경비 무기걸이',[TT.RUMOR_SILK_DIVAN]:'비단 좌상',[TT.RUMOR_RITUAL_OBELISK]:'제례 석주',[TT.RUMOR_CHARRED_COUNTER]:'그을린 조리대',[TT.RUMOR_INVESTIGATION_BOARD]:'조사 도면판',[TT.RUMOR_SMUGGLER_BUNDLE]:'밀수 포대',[TT.RUMOR_GREENHOUSE_FRAME]:'온실 골조'
  }[t];if(decorName)return decorName;if(t===TT.HIDDEN_BRIDGE)return'공간의 이음새';if(t===TT.HIDDEN_WALL)return'수상한 구조물';if(t===TT.LIGHT_GRASS)return'연두빛 초원';if(t===TT.ICE)return '얼어붙은 물';if(t>=500&&t<660)return ['전용 석판','전용 인레이','전용 재질판','실외 포장','전용 석벽','전용 기둥벽','암반 외벽','영구 다리','대형 구조물'][(t-500)%16]||'전용 건축물';return new Map([
  [TT.WALL,'벽'],[TT.PALACE_ROCK,'해련 바위벽'],[TT.FLOOR,'바닥'],[TT.STAIR,'다음 층'],[TT.DOOR,'닫힌 문'],[TT.OPEN_DOOR,'열린 문'],[TT.RUMOR,'소문 기록'],[TT.BRAZIER,'화로'],[TT.TRAP,'함정'],[TT.ARMORY,'무기고'],[TT.WATER,'물'],[TT.FOUNTAIN,'정화의 샘'],[TT.MIRROR,'천면경'],[TT.ALTAR,'혈흔 제단'],[TT.VAULT,'금고'],[TT.SNARE,'구속진'],[TT.CACHE,'보급함'],[TT.COOKPOT,'솥'],[TT.PAPER_BRIDGE,'종이 다리'],[TT.JAR,'장독'],[TT.LAVA,'용암'],[TT.DRAWBRIDGE_DOWN,'도개교'],[TT.DRAWBRIDGE_UP,'올라간 도개교'],[TT.VOID,'공허'],[TT.GOLD,'황금 잔광'],[TT.MERCURY,'수은'],[TT.SWITCH,'기계 장치'],[TT.BAMBOO,'대나무'],[TT.TABLE,'연회상'],[TT.SCREEN,'비단 병풍'],[TT.GRASS,'초원'],[TT.HEDGE,'울타리'],[TT.RAFT,'뗏목'],[TT.FAKE_DOOR,'문'],[TT.LOCKED_GATE,'잠긴 격벽'],[TT.KEY_TILE,'열쇠'],[TT.STAMINA_PAD,'기 회복 발판'],[TT.PEACH_TREE,'복숭아나무'],[TT.SECRET_DOOR,'수상한 벽'],[TT.PAVILION,'정자'],[TT.FLOOR,'행선 표식']
]).get(t)||'지형'}
function placeNamedMonster(name,pos=null,opts={}){const d=opts.legendDungeon47?globalThis.__MANRU_LEGEND47__.enemyDefinitions(opts.legendDungeon47).find(x=>x.name===name):MONSTERS.find(x=>x.name===name);if(!d)return null;const mon=scaledMonster(d,opts.combatFloor??branchCombatFloor()),point=PlacementService.findMonster(mon,{placementMode:pos?'exact':'floor',...opts,origin:opts.origin||pos||state.player});if(!point)return null;mon.x=point.x;mon.y=point.y;mon.spawnProvenance57=opts.provenance||'generation';OccupancyService.addMonster(mon);return mon}
const FOOTPRINT_OFFSETS57={
  one:[[0,0]],
  x3:[[-1,-1],[1,-1],[0,0],[-1,1],[1,1]],
  vertical3:[[0,-1],[0,0],[0,1]],
  hound:[[-1,-2],[1,-2],[0,-1],[0,0],[0,1],[-1,2],[1,2]],
  dragon:[[-1,-1],[0,-1],[1,-1],[0,0],[0,1],[-1,1],[1,1]]
};
function footprintOffsets(mon){return FOOTPRINT_OFFSETS57[mon?.footprint]||FOOTPRINT_OFFSETS57.one}
function roomAt(x,y){return state.rooms.find(r=>x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h)||null}
function initialSpawnPosition(mon,dist,safe,roomUse,spawnCtx57=null){
  const pool=[],candidates=spawnCtx57?.candidates;
  if(candidates){
    for(const c of candidates){
      const idx=c.y*COLS+c.x;if(spawnCtx57.local[idx]>=Math.max(2,spawnCtx57.groupSize||1)||spawnCtx57.wide[idx]>=Math.max(4,(spawnCtx57.groupSize||1)*2))continue;
      if(c.key&&(roomUse.get(c.key)||0)>=c.cap)continue;
      if(!PlacementService.monsterCanStand(mon,c.x,c.y,spawnCtx57))continue;
      pool.push(c)
    }
  }else{
    for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++){
      if(!PlacementService.monsterCanStand(mon,x,y)||state.map[y][x]===TT.STAIR)continue;
      if(state.visible.has(k(x,y)))continue;
      const d=dist.get(k(x,y));if(Number.isFinite(d)&&d<safe)continue;
      const r=roomAt(x,y),key=r?`${r.x},${r.y},${r.w},${r.h}`:null,area=r?r.w*r.h:0;
      const roomCap=!key?Infinity:((state.floor===20&&state.specialFloor)?12:(area>320?Math.max(2,Math.min(5,Math.floor(area/260))):(state.specialFloor?2:1)));
      if(key&&(roomUse.get(key)||0)>=roomCap)continue;
      let local=0,wide=0;for(const n of state.monsters||[]){if(!n||n.hp<=0)continue;const d0=Math.max(Math.abs(n.x-x),Math.abs(n.y-y));if(d0<=4)local++;if(d0<=8)wide++}
      if(local>=2||wide>=4)continue;
      pool.push({x,y,key})
    }
  }
  if(!pool.length)return null;
  const preferred=mon?.grassHide57?pool.filter(c=>monsterAmbushCanHide(mon,c.x,c.y)):pool,source=preferred.length?preferred:pool,pick=choice(source);if(pick.key)roomUse.set(pick.key,(roomUse.get(pick.key)||0)+1);return{x:pick.x,y:pick.y};
}
function floorEnemyDefinitions(){
  return MONSTERS.filter(d=>state.floor>=d.min&&state.floor<=d.max&&!d.miniBoss&&!d.summonOnly57&&!(state.floor===16&&['수비병','강철이','살라맨더'].includes(d.name)));
}
function spawnLayoutExtras(){
    if((SPECIAL60.has(state.floor)||BOSS_FLOORS.has(state.floor))&&!state._spawnV60)return;
    if(!SPECIAL60.has(state.floor)&&!BOSS_FLOORS.has(state.floor))return spawnNormalLayoutExtras();
    if(state.floor===8){spawnNear60('독꽃',Math.floor(COLS*.35),Math.floor(ROWS*.35));spawnNear60('검은 뱀',Math.floor(COLS*.62),Math.floor(ROWS*.55));spawnNear60('정원 바위괴물',Math.floor(COLS*.78),Math.floor(ROWS*.28))}
    else if(state.floor===11){spawnNear60('비단 술래',Math.floor(COLS*.25),Math.floor(ROWS*.60));spawnNear60('향기요정',Math.floor(COLS*.55),Math.floor(ROWS*.35));spawnNear60('윈도',Math.floor(COLS*.80),Math.floor(ROWS*.65))}
    else if(state.floor===13){for(const r of state.monsterDenseRooms||[]){const crowd=(state.monsters||[]).filter(m=>m.hp>0&&m.x>=r.x&&m.x<r.x+r.w&&m.y>=r.y&&m.y<r.y+r.h).length;if(crowd>=3)continue;const d=choice(floorEnemyDefinitions()),m=scaledMonster(d);if(PlacementService.monsterCanStand(m,r.cx,r.cy)){Object.assign(m,{x:r.cx,y:r.cy});OccupancyService.addMonster(m)}}}
    else if(state.floor===16){spawnNear60('성채 비행 감시자',9,7);spawnNear60('경비 인형 - 보병',42,11);spawnNear60('경비 인형 - 보병',58,31);spawnNear60('경비 인형 - 포병',COLS-8,15);spawnNear60('화염 가고일',COLS-10,6);spawnNear60('해자 잠복꾼',29,Math.floor(ROWS/2))}
    else if(state.floor===18){spawnNear60('강시',12,10);spawnNear60('식귀',Math.floor(COLS*.48),9);spawnNear60('산성 슬라임',Math.floor(COLS*.70),ROWS-10);spawnNear60('굶주린 창고 쥐',COLS-8,Math.floor(ROWS/2))}
    else if(state.floor===21){for(const [n,x,y] of [['공허 가오리',23,35],['공허 가오리',50,35],['차원 포식자',32,8],['신전 사제 망령',59,17],['천수 아수라',68,35]])spawnNear60(n,x,y,3)}
    else if(state.floor===22){spawnNear60('만루의 수호상',Math.floor(COLS/2),Math.floor(ROWS/2)-8);spawnNear60('신전 사제 망령',9,9);spawnNear60('신전 사제 망령',COLS-10,ROWS-10)}
    else if(state.floor===23){spawnNear60('여의 수룡',Math.floor(COLS/2),Math.floor(ROWS/2),6);spawnNear60('공허 가오리',Math.floor(COLS*.28),Math.floor(ROWS*.32));spawnNear60('천수 아수라',Math.floor(COLS*.72),Math.floor(ROWS*.65))}
    else if(state.floor===24){spawnNear60('보주의 파수꾼',Math.floor(COLS*.70),Math.floor(ROWS*.25));spawnNear60('차원 포식자',Math.floor(COLS*.22),Math.floor(ROWS*.70));spawnNear60('공허 가오리',Math.floor(COLS*.55),Math.floor(ROWS*.72))}
  }
function spawnNormalLayoutExtras(){
  // F2 encounter packs are placed on finalized branch geometry by populateFloor2Branches66.
  if(state.floor===4){spawnNamed('목재 좀벌레',{x:16,y:16});spawnNamed('그림자 살모사',{x:35,y:16});spawnNamed('취한 경비견',{x:39,y:26})}
  if(state.floor===6){for(let i=0;i<5;i++)spawnNamed('피라냐')}
  if(state.floor===13){for(const r of state.monsterDenseRooms||[]){const crowd=(state.monsters||[]).filter(m=>m.hp>0&&m.x>=r.x&&m.x<r.x+r.w&&m.y>=r.y&&m.y<r.y+r.h).length;if(crowd>=3)continue;const defs=MONSTERS.filter(d=>d.min<=13&&d.max>=13&&!d.miniBoss),mon=scaledMonster(choice(defs)),p={x:r.cx,y:r.cy};if(PlacementService.monsterCanStand(mon,p.x,p.y)){Object.assign(mon,p);OccupancyService.addMonster(mon)}}}
  if(state.floor===16){const y=Math.floor(ROWS/2);spawnNamed('성채 비행 감시자',{x:10,y:6});spawnNamed('경비 인형 - 보병',{x:31,y:26});spawnNamed('경비 인형 - 보병',{x:35,y:10});spawnNamed('경비 인형 - 포병',{x:43,y:21});spawnNamed('화염 가고일',{x:45,y:6});spawnNamed('해자 잠복꾼',{x:21,y:y-5});}
  if(state.floor===23){const d=MONSTERS.find(x=>x.name==='여의 수룡'),mon=scaledMonster(d);for(const p of [{x:24,y:9},{x:15,y:16},{x:33,y:21}])if(PlacementService.monsterCanStand(mon,p.x,p.y)){Object.assign(mon,p);OccupancyService.addMonster(mon);addLog('수은 아래에서 긴 목이 천천히 방향을 튼다.');break}}
}
const RuntimeTerrainOwner=Object.freeze({
mutate(x,y,tile,opts={}){
  if(!state||x<0||y<0||x>=COLS||y>=ROWS)return{ok:false,reason:'bounds'};
  if(globalThis.__MANRU_RUMOR_SPACES1030__?.mutationLocked?.(x,y))return{ok:false,reason:'sealed-rumor-space'};
  const old=state.map?.[y]?.[x],canonicalExit=state.stairs?.x===x&&state.stairs?.y===y;
  if((old===TT.STAIR||canonicalExit)&&tile!==TT.STAIR&&!opts.allowStairMutation57)return{ok:false,reason:'protected-stair',old,tile};
  if(old===tile&&!opts.touch)return{ok:true,changed:false,old,tile,version57:state.terrainMutationVersion57?.[k(x,y)]||0};
  const occupants=runtimeTerrainOccupants57(x,y);if(tile===TT.LAVA&&opts.source==='element74'&&occupants.some(e=>e.boss))return{ok:false,reason:'boss-occupied-lava',old,tile};if(occupants.length&&runtimeTerrainSolid57(tile)&&!opts.overlapSolid)return{ok:false,reason:'occupied-solid',old,tile,occupants:occupants.length};
  const written=setTerrainTile58(state.map,x,y,tile,opts.placement58||{});if(written!==tile)return{ok:false,reason:'rejected-placement',old,tile};
  state.terrainMutationSeq57=(state.terrainMutationSeq57||0)+1;state.terrainMutationVersion57=state.terrainMutationVersion57||{};const version57=state.terrainMutationSeq57;state.terrainMutationVersion57[k(x,y)]=version57;
  // Terrain owns ground-item safety too. Preserve quantities in the floor-local
  // pending queue when no reachable safe destination exists.
  const groundItems=state.items.filter(i=>i.x===x&&i.y===y);
  if(groundItems.length&&!safeLootGround42(x,y)&&!(tile===TT.MERCURY&&terrainHasPendingRecovery57(x,y)))for(const item of groundItems){
    if(!PlacementService.placeItem(item,{x,y})){OccupancyService.removeItem(item);PlacementService.placeItem(item,{x,y})}
  }
  const haz=globalThis.__MANRU_HAZARD_CORE__,kind=haz?.kind?.(tile);
  if(occupants.length&&kind&&!opts.deferHazard57)haz?.revalidateAt?.(x,y,opts.source||'runtime-terrain');
  else if(occupants.includes(state.player)&&(RUNTIME_ENTRY_REACTIVE57.has(tile)||tile===TT.PORTAL||tile===TT.CRUMBLE))bumpTileAction(x,y,{cause:'terrain-mutation',activeInteraction:false});
  return{ok:true,changed:true,old,tile,version57,occupants:occupants.length};
},
temporary(x,y,tile,ttl,kind='temporary',opts={}){
  if(!state||x<=0||y<=0||x>=COLS-1||y>=ROWS-1||!Number.isFinite(ttl)||ttl<=0)return false;
  state.tempTerrain74=Array.isArray(state.tempTerrain74)?state.tempTerrain74:[];const old=state.map[y]?.[x],allowed=opts.allowedOld;
  // PORTAL is registered after these base sets; read its live tile value here.
  if(TEMP_TERRAIN_IMMUTABLE57.has(old)||old===TT.PORTAL||(allowed&&!allowed.includes(old)))return false;
  const prior=state.tempTerrain74.find(t=>t.x===x&&t.y===y);
  if(prior){if(state.map[y][x]!==prior.tile||prior.tile!==tile)return false;prior.ttl=Math.max(prior.ttl,ttl);prior.kind=kind;return true}
  const placement58=terrainCellPlacement58(state.map,x,y),changed=RuntimeTerrainOwner.mutate(x,y,tile,{source:opts.source||kind,overlapSolid:!!opts.overlapSolid});if(!changed.ok)return false;
  state.tempTerrain74.push({x,y,old,tile,ttl,kind,source57:opts.source||kind,version57:changed.version57,restorePlacement58:placement58,overlapSolid57:!!opts.overlapSolid});return true
},
tick(){
  if(!state)return;state.tempTerrain74=Array.isArray(state.tempTerrain74)?state.tempTerrain74:[];state.terrainMutationVersion57=state.terrainMutationVersion57||{};
  for(const t of state.tempTerrain74){if(t.expiresTurn105!=null)t.ttl=Math.max(0,t.expiresTurn105-state.turn);else if(t.bornTurn105==null||state.turn>t.bornTurn105)t.ttl--;}
  const expired=state.tempTerrain74.filter(t=>t.ttl<=0&&state.map[t.y]?.[t.x]===t.tile&&(t.version57==null||state.terrainMutationVersion57[k(t.x,t.y)]===t.version57)),restored=new Set();
  for(const t of expired){const ok=t.kind==='frozen-water105'?thawWater105(t.x,t.y):RuntimeTerrainOwner.mutate(t.x,t.y,t.old,{source:`${t.source57||t.kind||'temporary'}-restore`,placement58:t.restorePlacement58?{...t.restorePlacement58,fluidSurface:t.restorePlacement58.base===TT.WATER}:undefined,overlapSolid:!!t.overlapSolid57}).ok;if(ok)restored.add(t);}
  const roots=expired.filter(t=>t.rootWall105&&restored.has(t));
  state.tempTerrain74=state.tempTerrain74.filter(t=>t.ttl>0||expired.includes(t)&&!restored.has(t));
  if(roots.length)palaceRootWallExplode(roots);
},
migrate(page){
  // Saved terrain owns legacy timer recovery; runtime never sweeps the map to patch walls.
  const records=page.tempTerrain74||[],palace=page.branchTerrain105?.palace105,cat=terrainLayerCatalog58();
  const substrate=(x,y)=>page.terrainUnderlay58?.[k(x,y)]??palace?.materials?.[k(x,y)]??(palace?.floors?.[k(x,y)]!=null?TT.PALACE_LOW+palace.floors[k(x,y)]:TT.FLOOR);
  for(const t of records)if(t.rootWall105){
    t.expiresTurn105??=(t.bornTurn105??page.turn??0)+1;t.overlapSolid57=true;t.rootWall105.stunTurns??=1;
    if(!t.restorePlacement58)t.restorePlacement58={base:cat.overlays.has(t.old)?substrate(t.x,t.y):t.old,attachment:cat.overlays.has(t.old)?'standing':undefined};
  }
  for(let y=0;y<(page.map?.length||0);y++)for(let x=0;x<page.map[y].length;x++){
    if(page.map[y][x]!==TT.PALACE_ROCK||records.some(t=>t.x===x&&t.y===y&&t.tile===TT.PALACE_ROCK))continue;
    const prop=palace?.props?.[k(x,y)],old=prop?.tile??substrate(x,y),base=substrate(x,y);
    page.map[y][x]=old;
    if(cat.overlays.has(old)){page.terrainUnderlay58||={};page.terrainAttachment58||={};page.terrainUnderlay58[k(x,y)]=base;page.terrainAttachment58[k(x,y)]='standing';}
  }
}
});
const NON_REWARDING_SPAWN_PROVENANCE57=new Set(['los-lost-summon','repeatable-reinforcement','summon','split','clone','boss-add','resurrection']);
function combatLineCellsR8(x0,y0,x1,y1){
  const out=[],dx=x1-x0,dy=y1-y0,nx=Math.abs(dx),ny=Math.abs(dy),sx=Math.sign(dx),sy=Math.sign(dy);let x=x0,y=y0,ix=0,iy=0,guard=0;
  // Symmetric supercover traversal: A→B and B→A cross the same grid cells.
  // This prevents knight-move offsets (2,1)/(1,2) from seeing through a wall in only one direction.
  while((ix<nx||iy<ny)&&guard++<512){const px=x,py=y,lhs=(1+2*ix)*ny,rhs=(1+2*iy)*nx;if(lhs===rhs){x+=sx;y+=sy;ix++;iy++;}else if(lhs<rhs){x+=sx;ix++;}else{y+=sy;iy++;}out.push({x,y,px,py})}return out
}
function playerConcealed58(){return (state?.status?.stealth||0)>0}
function clearPlayerTracking58(mon){if(!mon)return;mon.alerted=false;mon.lastSeenPosition=null;mon.heardPosition=null;mon.attackInvestigation57=null;mon.searchTurns=0;mon.lostSight=0;mon.gazeCount=0;mon.sight=0;for(const rule of visibilityStackRules(mon))mon[rule.counter]=0;if(mon.targetKind53==='player'){mon.attackTarget=null;mon.targetKind53=null}}
function floor24PressureProgress57(){const q=state?.floor24;if(!q||!state.stairs)return 0;const reach=globalThis.__MANRU_SPECIAL_FLOORS60__?.flood?.(state.player),pathD=reach?.get?.(k(state.stairs.x,state.stairs.y)),directD=Math.abs(state.player.x-state.stairs.x)+Math.abs(state.player.y-state.stairs.y),d=Number.isFinite(pathD)?pathD:directD,base=Math.max(1,q.entranceToExitDistance||90);return clamp(1-d/base,0,1)}
function spawnPressureReinforcement57(mon,name,target=null){
  const def=MONSTERS.find(d=>d.name===name);if(!def)return null;target=target||selectCombatOpponent(mon)||mon;const floor24=state?.floor24,cap=Math.max(2,Math.min(4,Math.floor(floor24?.reinforcementCap57??3))),active=(state.monsters||[]).filter(m=>m.hp>0&&m.spawnProvenance57==='los-lost-summon'&&(!mon.summonOwner105||m.summonContract105===mon.summonContract105)).length;if(active>=cap)return null;
  const child=scaledMonster(def),progress=floor24PressureProgress57(),minD=Math.max(2,Math.round(8-progress*5)),maxD=Math.max(minD+2,Math.round(13-progress*6)),cells=[],reachable=globalThis.__MANRU_SPECIAL_FLOORS60__?.flood?.(target)||null,protectedCells=new Set((floor24?.reinforcementProtectedCells||[]).map(c=>k(c.x,c.y)));
  for(let y=Math.max(1,target.y-maxD);y<=Math.min(ROWS-2,target.y+maxD);y++)for(let x=Math.max(1,target.x-maxD);x<=Math.min(COLS-2,target.x+maxD);x++){const d=Math.abs(x-target.x)+Math.abs(y-target.y),kk=k(x,y);if(d<minD||d>maxD||protectedCells.has(kk)||(reachable&&!reachable.has(kk))||!PlacementService.monsterCanStand(child,x,y))continue;cells.push({x,y,score:Math.abs(d-(minD+maxD)/2)+globalThis.__MANRU_RANDOM57__()*.8})}
  cells.sort((a,b)=>a.score-b.score);const p=cells[0];if(!p)return null;child.x=p.x;child.y=p.y;child.spawnProvenance57='los-lost-summon';inheritCombatFaction57(child,mon);if(!OccupancyService.addMonster(child))return null;return child
}
function killMonster(mon){
  if(!state||!mon)return false;if(!state.debugBattle57&&factionsHostile57(entityFaction(state.player),entityFaction(mon))&&mon.boss&&mon.storyPhase992===1&&state.floor===25&&typeof globalThis.storyBreakFriendMask992==='function')return globalThis.storyBreakFriendMask992(mon);if(!(state.monsters||[]).includes(mon)||mon.deathProcessed57)return false;if(mon.revivalLives57){if(mon.revivePhase57==='corpse')return true;if(beginMonsterRevival(mon))return true;}mon.deathProcessed57=true;vfVibrate(mon.boss?HAPTIC_PATTERN57.bossKill:HAPTIC_PATTERN57.kill);const charred=mon.kind==='plant'&&mon.lastDamageElement105==='fire';if(!charred)globalThis.__MANRU_DEATH_FX54__?.record?.(mon);else{if(!mon.summonOwner105)dropBurntCharcoal105(mon.x,mon.y);elementBreakFx105(mon.x,mon.y,'fire')}delete mon.plantBurn105;
  const reward=monsterRewardPolicy(mon);if(mon.boss){if(mon.bossPattern==='keeper'&&reward.kills&&!state.debugBattle57)releaseKeeperExit54(mon);for(const fixture of [...state.monsters])if(bossChildOf(fixture,mon)&&fixture.combatFixture54){OccupancyService.removeMonster(fixture)};releaseBossWave(child=>bossChildOf(child,mon)&&(child.coreWave54||child.silkSourceMirror54));delete mon.silk54;clearIntent(mon)}OccupancyService.removeMonster(mon);summonRecordKill(mon,reward);if(mon.summonOwner105==='player'&&!mon.summonParent105&&state.player.summoning105?.contracts){delete state.player.summoning105.contracts[mon.summonContract105];for(const child of [...state.monsters])if(child.summonContract105===mon.summonContract105)removeAlly(child);}if(mon.bossPattern==='palaceKing105')palaceKingDefeated(mon);if(mon.martialActor105&&reward.kills)dojoDefeated(mon);if(mon.combatFixture54==='silk')severSilk(mon);if(mon.combatFixture54==='core')releaseCorePhase(mon);if(reward.kills)state.player.kills++;if(reward.xp&&!mon.boss)state.player.xp+=mon.xp||0;
  if(!mon.combatFixture54&&!charred)state.decals.push({x:mon.x,y:mon.y,type:mon.kind==='undead'?'bones':'corpse',color:mon.color||'#d7dde6',t:performance.now()});
  if(mon.thornField&&state.map[mon.y]?.[mon.x]===TT.FLOOR)RuntimeTerrainOwner.mutate(mon.x,mon.y,TT.SNARE,{source:'thorn-field'});
  if(mon.split){for(let i=0;i<2;i++){const preferred={x:clamp(mon.x+(i?1:-1),1,COLS-2),y:mon.y},child={x:preferred.x,y:preferred.y,name:mon.split==='acid'?'소형 산성 슬라임':'작은 먹물',concept57:SPECIAL_MONSTER_CONCEPTS57[mon.split==='acid'?'소형 산성 슬라임':'작은 먹물'],hp:mon.split==='acid'?Math.max(1,Math.round(mon.maxHp*.30)):6,maxHp:mon.split==='acid'?Math.max(1,Math.round(mon.maxHp*.30)):6,atk:mon.split==='acid'?Math.max(1,Math.round(mon.atk*.60)):4,def:0,eva:5,xp:0,armorPierce:mon.split==='acid',color:mon.split==='acid'?mon.color:'#46515a',shape:'void',kind:mon.split==='acid'?'slime':'spirit',weakened:0,spawnProvenance57:'split'},p=PlacementService.findMonster(child,{placementMode:'local',origin:preferred,radius:1});if(p){child.x=p.x;child.y=p.y;inheritCombatFaction57(child,mon);OccupancyService.addMonster(child)}}}
  if(reward.drops&&Array.isArray(mon.inventory)){for(const item of mon.inventory.splice(0))PlacementService.placeItem(item,{x:mon.x,y:mon.y},{preferEmpty:false});mon.weapon=null;}
  if(reward.drops&&mon.fishDrop){const item=clone(CONSUMABLES.find(x=>x.name==='신선한 생선 살')),drop={x:mon.x,y:mon.y};PlacementService.placeItem(item,drop)}
  if(reward.drops&&mon.name==='여의 수룡'){const item=clone(RELICS.find(x=>x.name==='용의 여의주 파편'));item.type='relic';item.curseImmune991=true;item.identified=true;item.x=mon.x;item.y=mon.y;PlacementService.placeItem(item)}
  if(mon.boss&&reward.kills){bossReward(mon);if(state.victory)return true}else if(reward.drops&&globalThis.__MANRU_RANDOM57__()<BALANCE.baseDrop)dropRandomItem({x:mon.x,y:mon.y},false);
  if(!charred)burst(mon.x,mon.y,mon.color||'#d7dde6',18,1.2);addLog((state.debugBattle57&&mon.debugId57!=null?mon.debugSide57+mon.debugId57+' ':'')+mon.name+' 격파.');if(reward.xp)checkLevel();globalThis.__MANRU_TRANSIENT47__?.trim?.();return true
}
function observePlayerDiscovery105(){
 if(!state?.player)return;
 for(const mon of state.monsters||[])if(!monsterHasSeenPlayer(mon)&&monsterCanDiscoverPlayer(mon))mon.hasSeenPlayer105=true
}
function finishMovementDiscovery105(before,voluntary){
 if(!before||state!==before.run||state.map!==before.map)return;
 const moved=state.player.x!==before.x||state.player.y!==before.y;
 for(const mon of state.monsters||[]){
  if(monsterDiscoverySpent(mon)||!monsterCanDiscoverPlayer(mon))continue;
  mon.hasSeenPlayer105=true;
  if(!voluntary||!moved||!before.unseen.has(mon))continue;
  const reach=mon.reach||1,range=mon.ranged?(mon.range||6):reach;
  if(!monsterAttackLineR(mon,range).ok)continue;
  let grace=state._movementDiscovery105;
  if(!grace||grace.map!==state.map)grace=state._movementDiscovery105={map:state.map,monsters:new Set()};
  grace.monsters.add(mon);
 }
}
// The debug option changes voluntary movement only; species/body flags stay authored.
function monsterMovementLocked57(mon){return !!mon?.fixed&&!(state?.debugBattle57&&state.debugBattlePlantMove57&&mon.kind==='plant'&&!mon.combatFixture54);}
function layKeeperBridge54(mon,cells,centers,stage){
 const safe=new Set((state.decor||[]).filter(d=>d.kind==='keeperBridge54'&&d.owner54===combatantId(mon)).map(d=>k(d.x,d.y))),owner=combatantId(mon);
 for(const c of cells)if(RuntimeTerrainOwner.mutate(c.x,c.y,TT.STONE_PATH,{source:'keeper-bridge'}).ok){
  safe.add(k(c.x,c.y));state.decor.push({kind:'keeperBridge54',layer:'ground',x:c.x,y:c.y,chains54:centers.reduce((bits,a)=>bits|(c.y===a.y?1:0)|(c.x===a.x?2:0),0),owner54:owner,stage54:stage});
 }
 for(const d of state.decor)if(d.kind==='keeperBridge54'&&d.owner54===owner){
  d.edge54=DIRS4.reduce((bits,[dx,dy],i)=>bits|(!safe.has(k(d.x+dx,d.y+dy))?1<<i:0),0);
  d.corner54=[[-1,-1],[1,-1],[1,1],[-1,1]].reduce((bits,[dx,dy],i)=>bits|(!safe.has(k(d.x+dx,d.y+dy))?1<<i:0),0);
 }
}
function floodKeeperArena54(mon,phase){
 const cells=keeperLavaCells(mon,phase),affected=new Set(cells.map(c=>k(c.x,c.y)));
 state.decor=(state.decor||[]).filter(d=>!affected.has(k(d.x,d.y)));
 // Build all new safe ground before hazards revalidate occupants and ground items.
 layKeeperBridge54(mon,cells.filter(c=>c.safe),[phase.origin,...(phase.stage===1&&phase.target?[phase.target]:[])],phase.stage);
 for(const c of cells.filter(c=>!c.safe))RuntimeTerrainOwner.mutate(c.x,c.y,TT.LAVA,{source:'keeper-lava'});
 phase.resolved=true;mon.keeperLava54.stage=phase.stage;clearIntent(mon);OccupancyService.endShared();
 floatText(mon.x,mon.y,'용암 범람','#ffb366',15);addLog(`간수의 ${phase.stage}차 용암 범람! 이전 다리가 사라지고 폭 ${phase.width}의 새 석교만 남았다.`);globalThis.__MANRU_SFX54__?.play?.('boss');
}
function tickKeeperLava54(mon,target=null){
 if(mon?.bossPattern!=='keeper'||mon.hp<=0)return;prepareBossArena(mon);
 const rule=BOSS_ARENA_RULES.keeper,q=mon.keeperLava54||(mon.keeperLava54={phases:[],stage:0});
 for(const [i,ratio]of rule.lavaThresholds.entries())if(mon.hp<=mon.maxHp*ratio&&!q.phases.some(p=>p.stage===i+1)){
  const opponent=combatTargetValid57(mon,target)?target:selectCombatOpponent(mon),phase={stage:i+1,width:rule.bridgeWidths[i],due:state.floorTurn+rule.lavaWarning,targetId:opponent===state.player?'player':opponent?combatantId(opponent):null};updateKeeperLavaOrigin54(mon,phase,opponent);q.phases.push(phase);
  addLog(`⚠ 간수의 ${phase.stage}차 용암 예고 · ${rule.lavaWarning}턴 뒤 범람. ${phase.stage===1?'간수와 공격 대상':'간수'} 중심의 폭 ${phase.width} 십자 석교로 피하라.`);floatText(mon.x,mon.y,`${rule.lavaWarning}턴 뒤 용암`,'#ffcc80',14);globalThis.__MANRU_SFX54__?.play?.('warn');
 }
 for(const phase of q.phases)if(!phase.resolved){updateKeeperLavaOrigin54(mon,phase);if(state.floorTurn>=phase.due)floodKeeperArena54(mon,phase);}
}
function placeSilkMirrors54(mon,dynamic=false,target=selectCombatOpponent(mon)||mon){
 const rule=BOSS_ARENA_RULES.silk,created=[],probe={hp:1,kind:'construct',fixed:true,footprint:'one'},liveMirrors=()=>state.monsters.filter(m=>m.hp>0&&m.combatFixture54==='silk'&&bossChildOf(m,mon));
 let blackPending=dynamic&&mon.hp<=mon.maxHp*rule.blackThreshold&&liveMirrors().filter(m=>m.silkMirrorColor54==='black').length<rule.blackCap&&globalThis.__MANRU_RANDOM57__()<rule.blackChance;
 const promote=()=>{
  const live=liveMirrors(),red=live.filter(m=>m.silkMirrorColor54==='red'&&entityDistance57(m,target)<=6&&live.some(other=>other!==m&&silkConnectionCells54(m,other))).sort((a,b)=>entityDistance57(a,target)-entityDistance57(b,target)||a.mirrorIndex54-b.mirrorIndex54)[0];
  if(red){setSilkMirrorColor(red,true);playSummonArrival(mon,red);if(!created.includes(red)&&created.length<4)created.push(red);}return red;
 };
 if(!dynamic&&!mon.silk54.initialLayout54){
  const w=rand(6,7),h=rand(6,7),cx=mon.arena54.cx+rand(-1,1),cy=mon.arena54.cy+rand(-1,1);
  // Two offset enclosures leave actual walking space between mirror fixtures.
  mon.silk54.initialLayout54=[[-w,-h],[0,-h],[w,-h],[w,0],[w,h],[0,h],[-w,h],[-w,0],[-3,-3],[3,-3],[3,3],[-3,3]].map(([x,y])=>({x:cx+x,y:cy+y}));
 }
 const center=dynamic&&entityDistance57(mon,target)<=10?{x:Math.round((mon.x+target.x)/2),y:Math.round((mon.y+target.y)/2)}:target,w=dynamic?rand(4,7):0,h=dynamic?rand(4,7):0;
 const origins=dynamic?[{x:center.x-w,y:center.y-h},{x:center.x+w,y:center.y-h},{x:center.x+w,y:center.y+h},{x:center.x-w,y:center.y+h}]:mon.silk54.initialLayout54;
 for(const [index,origin]of origins.entries()){
  const live=liveMirrors();if(!dynamic&&live.some(m=>m.mirrorIndex54===index))continue;
  const previous=created.at(-1)||live.at(-1),candidates=[],radius=dynamic?8:2,scan=dynamic?center:origin,degrees=new Map(live.map(m=>[m.mirrorIndex54,0]));
  for(const link of planSilkWeave54(mon))for(const id of[link.a,link.b])degrees.set(id,degrees.get(id)+1);
  for(let y=Math.max(1,scan.y-radius);y<=Math.min(ROWS-2,scan.y+radius);y++)for(let x=Math.max(1,scan.x-radius);x<=Math.min(COLS-2,scan.x+radius);x++){
   const distance=entityDistance57(origin,{x,y}),sector=dynamic&&(x-center.x)*Math.sign(origin.x-center.x)>=2&&(y-center.y)*Math.sign(origin.y-center.y)>=2;if(dynamic&&!sector||bossArenaMist(mon,x,y)||!terrainSurface58(state.map[y][x])||!PlacementService.monsterCanStand(probe,x,y))continue;
   if(live.some(m=>Math.max(Math.abs(m.x-x),Math.abs(m.y-y))<rule.mirrorSpacing)||live.filter(m=>m.x===x).length>=rule.lineCap||live.filter(m=>m.y===y).length>=rule.lineCap)continue;
   const anchors=live.filter(m=>(m.x===x||m.y===y)&&silkConnectionCells54(m,{x,y})),horizontal=anchors.some(m=>m.y===y),vertical=anchors.some(m=>m.x===x);
   anchors.sort((a,b)=>(degrees.get(a.mirrorIndex54)||0)-(degrees.get(b.mirrorIndex54)||0)||entityDistance57(a,{x,y})-entityDistance57(b,{x,y})||a.mirrorIndex54-b.mirrorIndex54);
   const anchor=anchors.find(m=>m===previous)||anchors[0],isolated=anchors.filter(m=>!degrees.get(m.mirrorIndex54)).length,blackLinks=anchors.filter(m=>m.silkMirrorColor54==='black').length;
   const score=(blackPending&&entityDistance57({x,y},target)<=6?2400:0)+(anchor?400:0)+(horizontal&&vertical?500:0)+Math.min(isolated,2)*80+Math.min(blackLinks,2)*60+(dynamic?-distance*120:(distance===0?1600:0)-distance*200);candidates.push({x,y,anchor,score});
  }
  if(!candidates.length)continue;const top=Math.max(...candidates.map(q=>q.score)),q=choice(candidates.filter(q=>q.score===top));
  if(live.length>=rule.mirrorCap){const oldest=live.filter(m=>m.auxiliaryMirror57&&m.silkMirrorColor54!=='black'&&m!==q.anchor).sort((a,b)=>(degrees.get(a.mirrorIndex54)||0)-(degrees.get(b.mirrorIndex54)||0)||a.mirrorIndex54-b.mirrorIndex54)[0];if(!oldest)continue;OccupancyService.removeMonster(oldest);mon.silk54.links=mon.silk54.links.filter(l=>l.a!==oldest.mirrorIndex54&&l.b!==oldest.mirrorIndex54);}
  const black=blackPending&&entityDistance57(q,target)<=6,mirror=createSilkMirror(mon,q,{index:dynamic?null:index,black,auxiliary:dynamic});if(mirror){created.push(mirror);if(black)blackPending=false;}
 }
 if(blackPending)promote();
 return created;
}
function spawnBossWave54(fixture,boss,name,{origin=fixture,radius=3,target=selectCombatOpponent(boss),markers={},restrict=null}={}){
 const def=MONSTERS.find(m=>m.name===name);if(!def||!boss||boss.hp<=0)return null;
 const child=scaledMonster(def,boss.debugFloor57||branchCombatFloor());adoptBossChild57(child,boss);Object.assign(child,markers);
 child.spawnProvenance57=child.summonOwner105?'player-summon-child':'boss-add';child.rewardPolicy57={xp:false,drops:false,kills:false};
 child.hp=child.maxHp=Math.max(1,Math.round(child.maxHp*.65));child.atk=Math.max(2,Math.round(child.atk*.85));child.alerted=true;child.hidden=false;child.searchTurns=12;if(target)child.lastSeenPosition={x:target.x,y:target.y};
 const q=PlacementService.findMonster(child,{placementMode:'local',origin,radius,restrict});if(!q)return null;child.x=q.x;child.y=q.y;if(!OccupancyService.addMonster(child))return null;
 playSummonArrival(fixture,child);return child;
}
function releaseSilkSummons54(mirror){return mirror.combatantId54?releaseBossWave(child=>child.silkSourceMirror54===mirror.combatantId54,'#81718e'):0;}
function resolveSilkCrossing54(origin,cause='walk',entity=state.player){
 if(!entity||entity.hp<=0||entity.x===origin.x&&entity.y===origin.y)return;
 const blink=['blink','talisman-blink','fusion-blink','holy-blink'].includes(cause),path=blink?combatLineCellsR8(origin.x,origin.y,entity.x,entity.y):entityFootprintCells57(entity),keys=new Set(path.map(c=>k(c.x,c.y)));
 for(const boss of state.monsters.filter(m=>m.hp>0&&m.silk54&&combatTargetValid57(m,entity))){
  if(!boss.silk54.links.some(l=>l.cells.some(c=>keys.has(k(c.x,c.y)))))continue;
  const contact=k(entity.x,entity.y)+':'+state.turn;if(entity.silkContact54?.[combatantId(boss)]===contact)continue;(entity.silkContact54??={})[combatantId(boss)]=contact;
  damageCombatTarget(boss,entity,Math.max(1,Math.round(entity.maxHp*.0264)),'비단실','#e4a5c5');combatStatus(boss,entity,'bleed',3);boss.threadTarget54={x:entity.x,y:entity.y};if(entity.hp<=0)break;
 }
}
function planSilkWeave54(mon){
 const mirrors=state.monsters.filter(m=>m.hp>0&&m.combatFixture54==='silk'&&bossChildOf(m,mon)).sort((a,b)=>a.mirrorIndex54-b.mirrorIndex54),links=[],edges=[],chosen=new Set(),parent=new Map(mirrors.map(m=>[m.mirrorIndex54,m.mirrorIndex54]));
 const root=id=>{while(parent.get(id)!==id)id=parent.get(id);return id;};
 const add=edge=>{if(chosen.has(edge.key))return;chosen.add(edge.key);links.push({a:edge.a.mirrorIndex54,b:edge.b.mirrorIndex54,cells:edge.cells});parent.set(root(edge.a.mirrorIndex54),root(edge.b.mirrorIndex54));};
 for(let i=0;i<mirrors.length;i++)for(let j=i+1;j<mirrors.length;j++){
  const a=mirrors[i],b=mirrors[j],cells=silkConnectionCells54(a,b);if(cells)edges.push({a,b,cells,key:a.mirrorIndex54+':'+b.mirrorIndex54,axis:a.x===b.x||a.y===b.y,distance:entityDistance57(a,b)});
 }
 edges.sort((a,b)=>Number(b.axis)-Number(a.axis)||a.distance-b.distance||a.a.mirrorIndex54-b.a.mirrorIndex54||a.b.mirrorIndex54-b.b.mirrorIndex54);
 // The nearest visible mirror in each cardinal direction forms the local mesh.
 for(const mirror of mirrors){
  const directions=new Set();for(const edge of edges){if(!edge.axis||edge.a!==mirror&&edge.b!==mirror)continue;const other=edge.a===mirror?edge.b:edge.a,direction=other.x===mirror.x?(other.y<mirror.y?'up':'down'):(other.x<mirror.x?'left':'right');if(directions.has(direction))continue;directions.add(direction);add(edge);}
 }
 // Join separate meshes, including isolated red mirrors. Diagonals are used only
 // when no unobstructed horizontal or vertical bridge can join those components.
 for(const edge of edges)if(root(edge.a.mirrorIndex54)!==root(edge.b.mirrorIndex54))add(edge);
 return links;
}
function advanceBossClock54(m){normalizeBoss(m);if(m.controlCd54>0&&m.controlCdTurn54!==state.turn){m.controlCd54--;m.controlCdTurn54=state.turn}}
function cell54(x,y){return x>0&&y>0&&x<COLS-1&&y<ROWS-1&&state.map[y]?.[x]!==TT.WALL}
function adoptBossChild57(child,parent){inheritCombatFaction57(child,parent);child.bossOwnerId57=parent.coreWave54||parent.silkSourceMirror54?parent.bossOwnerId57:combatantId(parent);if(parent.debugFloor57)child.debugFloor57=parent.debugFloor57;if(state.debugBattle57){child.debugSide57=entityFaction(child)==='player'?'A':'B';child.rewardPolicy57={xp:false,kills:false,drops:false}}return child}
function playHookPullFx57(source,target,color='#9c887c'){if(!source||!target)return false;projectileFX(source.x,source.y,target.x,target.y,color);burst(source.x,source.y,color,8,.42);burst(target.x,target.y,color,12,.58);return true}
function spawnPaperTiger(mon){
  for(const[dx,dy]of DIRS8){const x=mon.x+dx,y=mon.y+dy;if(!ReachabilityService.terrainPassable(x,y)||OccupancyService.isOccupied(x,y)||(x===state.player.x&&y===state.player.y))continue;const tiger={x,y,name:'종이 호랑이',concept57:SPECIAL_MONSTER_CONCEPTS57['종이 호랑이'],hp:1,maxHp:1,atk:8,def:0,eva:3,xp:1,color:'#d8ccb2',shape:'beast',kind:'spirit',fast:true,weakened:0,spawnProvenance57:'summon'};adoptBossChild57(tiger,mon);if(!OccupancyService.addMonster(tiger))continue;playSummonArrival(mon,tiger);return true}return false;
}
function executeMonsterAttackBundle57(mon,target,opts={}){
 if(mon.weaponStrikeInterval105&&['melee','ranged'].includes(opts.context?.delivery||'melee')){if((mon.nextEquipmentStrike105||0)>state.floorTurn)return{planned:0,attempts:0,hits:0,interrupted:false,results:[]};mon.nextEquipmentStrike105=state.floorTurn+mon.weaponStrikeInterval105;}

 let count=Math.max(1,Math.floor(opts.count??resolveMonsterAttackCount57(mon)));const ctx=monsterAttackContextR({...opts.context,target}),results=[],firstBonus=Number(opts.firstBonus)||0,followupBonus=Number.isFinite(opts.followupBonus)?opts.followupBonus:(mon.martialActor105?0:-2);
 const parentBundle=RuntimeState.martialDamageBundle1005;RuntimeState.martialDamageBundle1005={id:++state.martialDamageSequence,revived:false,guardHit:false};
 try{for(let i=0;i<count&&target?.hp>0&&runState57()==='playing';i++){
  if(!combatTargetValid57(mon,target))break;const bonus=i===0?firstBonus:followupBonus;let line=null;
  if(ctx.projectile){line=monsterAttackLineR(mon,ctx.range,ctx);if(line.ok)projectileFX(line.fromX??mon.x,line.fromY??mon.y,line.toX??target.x,line.toY??target.y,opts.projectileColor||'#b39b79',opts.projectileVisual57||{})}
  const result=attackMonster(mon,bonus,ctx);if(ctx.projectile)resolveProjectileImpact57(mon,line,result,target,opts.projectileImpact57||mon.projectileImpact57);results.push(result);if(i===0&&count===1&&result.hit&&mon.weapon?.chain&&globalThis.__MANRU_RANDOM57__()<mon.weapon.chain){count++;floatText(mon.x,mon.y,'연격','#e8c58d',11);}if(!monsterAttackCanContinueR(result))break;
 }
 }finally{if(RuntimeState.martialDamageBundle1005.guardHit)consumeMartialGuard(state.player);for(const guarded of RuntimeState.martialDamageBundle1005.guardTargets105||[])consumeMartialGuard(guarded);RuntimeState.martialDamageBundle1005=parentBundle}
 return{planned:count,attempts:results.length,hits:results.filter(r=>r.hit).length,interrupted:!!results.at(-1)?.interrupted,results};
}
function resolveMonsterTargetTurn57(actor,target,schedule={act:true,steps:1},opts={}){
 if(!actor||actor.hp<=0||!schedule.act)return false;
 const range=actor.ranged?(actor.range||6):(actor.reach||1),hostile=combatTargetValid57(actor,target),live=hostile&&!entityConcealed(target);
 const sees=live&&actorDetectedTarget57(actor,target,monsterSenseRadius(actor));
 if(sees)actor.lastSeenPosition={x:target.x,y:target.y,bornTurn:state.floorTurn||0};
 // Locked warnings resolve on their original cells even after the target hides.
 if(actor.palaceLotus105){
  if(actor.intent54||live&&actorDetectedTarget57(actor,target,7)&&entityDistance57(actor,target)<=(palaceWet(actor)?6:5))return palaceLotusTurn(actor,target);
  if(actor.stunned>0){actor.stunned--;return true;}
  if(monsterMovementLocked57(actor))return true;
  const destination=hostile&&!live?actor.lastSeenPosition:target;let moved=false;
  for(let i=0;i<schedule.steps&&destination&&entityDistance57(actor,destination)>(opts.followDistance??1);i++)moved=moveMonsterToward(actor,destination,opts)||moved;
  return moved;
 }
 if(actor.equipmentActor105)syncEquipmentActor105(actor);
 if(actor.intent61&&globalThis.__MANRU_AI61__?.intent(actor))return true;
 if(actor.intent54&&handleBossPattern(actor,target?entityDistance57(actor,target):0,target||actor))return true;
 if(!target)return monsterIdleRecovery105(actor,null);
 if(!actor.martialActor105&&actor.weaponRecovery105>0){actor.weaponRecovery105--;return true;}
 if(actor.losLostSummon57)handleLosLostSummon(actor,sees,{target});
 if(live)actor.alerted=true;
 if(live&&mountainMimicTurn(actor,target))return true;
 if(live&&actor.martialActor105&&dojoMartialTurn(actor,sees,entityDistance57(actor,target),target))return true;
 if(live&&globalThis.__MANRU_LEGEND47__?.enemySpecial?.(actor,target))return true;
 if(live){if(actor.summoner)updateSummonerEngagement(actor,sees);if(evaluateMonsterSpecials(actor,sees,entityDistance57(actor,target),target))return true;}
 if(actor.boss&&live&&handleBossPattern(actor,entityDistance57(actor,target),target))return true;
 if(live&&globalThis.__MANRU_AI61__?.artillery(actor,target))return true;
 const reach=actor.reach||1;
 if(live&&entityDistance57(actor,target)<=reach&&monsterAttackLineR(actor,reach,{target}).ok){executeMonsterAttackBundle57(actor,target,{context:{delivery:'melee',projectile:false,reflectable:false,range:reach}});return true;}
 if(live&&actor.ranged&&monsterAttackLineR(actor,range,{target}).ok&&globalThis.__MANRU_RANDOM57__()<.62){executeMonsterAttackBundle57(actor,target,{firstBonus:actor.bossPattern==='master'?0:1,context:{delivery:'ranged',projectile:true,reflectable:true,range},projectileColor:actor.poison?'#83a96b':actor.color||'#b39b79'});return true;}
 if(actor.gumihoRetreated57){actor.gumihoRetreated57=0;return true;}
 if(monsterMovementLocked57(actor))return false;
 // A concealed hostile supplies no current position; search the last observation.
 const destination=hostile&&!live?actor.lastSeenPosition:target;let moved=false;
 for(let i=0;i<schedule.steps&&actor.hp>0&&destination&&entityDistance57(actor,destination)>(opts.followDistance??1);i++){if(!moveMonsterToward(actor,destination,opts))break;moved=true;}
 return moved;
}
  const TurnEngine=Object.freeze({
    stages:[],
    register(id,{pre=null,post=null}={}){if(TurnEngine.stages.some(s=>s.id===id))throw new Error('duplicate turn stage: '+id);TurnEngine.stages.push({id,pre,post})},
    advance(action={}){
      const cost=action.timeCost,turnOpts=action,entry=state,before={turn:state?.turn||0,floorTurn:state?.floorTurn||0,agency:state?.playerAgencyTurns57||0,energy:state?.enemyEnergy||0,run:state?.runId984,dead:!!state?.dead};
      const result={id:++TURN_AUDIT5.serial,reason:action.reason||'action',committed:action.committed===true,requestedCost:cost,timeCost:0,energyAdded:0,enemyRounds:0,logicalTurns:0,agencyTurns:0,advancesWorld:false,playerAgency:action.playerAgency!==false,playerDied:false,aborted:false,abortStage:null,stageOrder:[],value:undefined};
      const stages=TurnEngine.stages,ctx={cost,turnOpts,playerAgency:result.playerAgency};let minPost=0,runCore=true,r,completed=false;
      try{
        if(action.handled===false||!result.committed){result.reason='uncommitted';completed=true;return result}
        if(trainingActive()){result.stageOrder.push('tutorial:no-time');globalThis.__MANRU_RELEASE__?.entryTutorial?.();VisibilityService.compute();updateAll();globalThis.__MANRU_SAVE_SERVICE__?.request?.();result.value=true;completed=true;return result}
        if(state?.tutorialEntry60&&!state.tutorialEntry60.completed)state.tutorialEntry60.completed=true;
        if(state?.shopIntermission?.active){result.stageOrder.push('shop:no-time');VisibilityService.compute();updateAll();globalThis.__MANRU_SAVE_SERVICE__?.request?.();result.value=true;completed=true;return result}
        observePlayerDiscovery105();
        if(state){state._turnPipelineActive57=true;state._turnAgencyWillCount57=ctx.playerAgency;state._turnAgencyCounted57=false}
        for(let i=stages.length-1;i>=0;i--){const st=stages[i];if(typeof st.pre==='function'){result.stageOrder.push('pre:'+st.id);if(st.pre(ctx)===MANRU_TURN_ABORT){runCore=false;minPost=i+1;result.aborted=true;result.abortStage='pre:'+st.id;break}}}
        if(runCore){result.stageOrder.push('core');const normalized=(typeof cost==='number'&&isFinite(cost))?Math.max(.25,cost):1;r=endTurnCore45(normalized,turnOpts,result)}
        for(let i=minPost;i<stages.length;i++){const st=stages[i];if(typeof st.post==='function'){result.stageOrder.push('post:'+st.id);st.post(ctx,r)}}
        if(runCore&&ctx.playerAgency&&state&&!state.dead&&!state.victory){if(state.noiseSequence57&&state.noiseSequence57.agency<(state.playerAgencyTurns57||0))state.noiseSequence57.multiplier=Math.max(1,state.noiseSequence57.multiplier-.1);tickNaturalPopulation()}
        if(runCore&&state&&!state.dead&&!state.victory&&state.pendingGroundItems57?.length){result.stageOrder.push('pending-ground-items');PlacementService.flushPendingItems()}
        result.value=r;completed=true;return result;
      }finally{
        // Match the old pipeline's finally boundary; shops never set these flags.
        if(!['shop:no-time','tutorial:no-time'].includes(result.stageOrder[0])&&action.handled!==false&&result.committed){if(state){state._turnPipelineActive57=false;state._turnAgencyWillCount57=false;state._turnAgencyCounted57=false}result.stageOrder.push('clear-transients')}
        if(entry)delete entry._movementDiscovery105;if(state){delete state._movementDiscovery105;observePlayerDiscovery105()}
        noiseBudget=null;result.logicalTurns=(state?.turn||0)-before.turn;result.agencyTurns=(state?.playerAgencyTurns57||0)-before.agency;result.advancesWorld=result.logicalTurns>0;result.energyAfter=state?.enemyEnergy||0;
        result.playerDied=!before.dead&&!!state?.dead;result.stateReplaced=state!==entry;
        if(!completed){result.aborted=true;result.abortStage=result.stageOrder.at(-2)||result.stageOrder.at(-1)||'entry'}
        if(state?.runId984!==before.run){result.aborted=true;result.abortStage=result.abortStage||'run-changed'}
        TURN_AUDIT5.history.push(result);if(TURN_AUDIT5.history.length>100)TURN_AUDIT5.history.shift();ActionDispatcher.observeTurn(result);if(completed&&!ACTION_AUDIT5.stack.length)globalThis.__MANRU_SAVE_SERVICE__?.flush?.(result.reason);
      }
    },
    snapshot(){return{calls:TURN_AUDIT5.serial,core:'endTurnCore45',stages:TurnEngine.stages.map(stage=>stage.id),pre:TurnEngine.stages.filter(stage=>typeof stage.pre==='function').map(stage=>stage.id).reverse(),post:TurnEngine.stages.filter(stage=>typeof stage.post==='function').map(stage=>stage.id),history:structuredClone(TURN_AUDIT5.history)}},
    resetAudit(){TURN_AUDIT5.serial=0;TURN_AUDIT5.history=[];return this.snapshot()}
  });
  const now52=()=>performance.now();
  function shotCheck52(mon){return combatShotCheckR(mon)}
  function qaF24GumiMechanics60(){
    if(state.floor!==24)return{ok:false,reason:'not-f24'};const snap=captureGenerationSnapshot();let result=null;
    try{
      const q=state.floor24,g=(state.monsters||[]).find(m=>m.floor24Chaser57),def=MONSTERS.find(d=>d.name==='구미묘');if(!g||!def)return{ok:false,reason:'missing-gumimyo'};const expected=scaledMonster(def),weakExpected={atk:Math.max(1,Math.round(expected.atk*.65)),def:Math.max(0,Math.round(expected.def*.75)),eva:Math.max(0,expected.eva-2)},fullExpected={atk:Math.max(1,Math.round(expected.atk*1.35)),def:Math.max(0,Math.round(expected.def*1.20)),eva:expected.eva+2};
      const config={miniBoss:g.miniBoss===true,scaled:g.fixedStats57!==true&&g.gumiScaleVersion57===3&&g.maxHp===expected.maxHp&&g.baseAtk57===expected.atk&&g.baseDef57===expected.def&&g.baseEva57===expected.eva,slowSeparated:g.slow!==true&&!g.actionLag57,speedRamp:g.exitPressureSpeed57?.min===.5&&g.exitPressureSpeed57?.max===1.5&&g.gumiBehaviorVersion57===4,corpseRelocation:g.corpseRelocateSpan57===21&&g.corpseRelocateMinRadius57===6,lives:g.revivalLives57===9,phaseScaling:g.reviveWeakTurns57===2&&g.reviveWeakAtkMul57===.65&&g.reviveWeakDefMul57===.75&&g.reviveWeakEvaDelta57===-2&&g.reviveFullAtkMul57===1.35&&g.reviveFullDefMul57===1.20&&g.reviveFullEvaDelta57===2,deathLosBreak:g.deathCountsAsLosBreak57===true,aura:g.warningAura57===20,pressure:g.exitPressureSense57?.start===.38&&g.exitPressureSense57?.exact===.76&&g.exitPressureSense57?.maxError===6,summon:Array.isArray(g.losLostSummon57?.names)&&g.losLostSummon57.names.length===2&&g.losLostSummon57.normalCooldown===7&&g.losLostSummon57.fullCooldown===4};
      q.chaseStarted=false;g.dormant57=true;g.alerted=false;const activated=onTypedGateOpened60({kind:'f24-grand-entrance'},'brass')===true&&q.chaseStarted===true&&g.dormant57===false&&g.alerted===true;
      const inside=q.majorAnchors?.[5]||q.interiorAnchor;state.player.x=inside.x;state.player.y=inside.y;OccupancyService.move(state.player,state.player.x,state.player.y);state.monsters=(state.monsters||[]).filter(m=>m===g||m.spawnProvenance57!=='los-lost-summon');g.hp=g.maxHp;g.livesRemaining57=9;g.revivePhase57='normal';g.baseAtk57=expected.atk;g.baseDef57=expected.def;g.baseEva57=expected.eva;g.losLostSummonCooldown57=0;applyMonsterRevivalStats(g);state.floorTurn=120;const corpseOrigin={x:g.x,y:g.y},deathBefore=(state.monsters||[]).filter(m=>m.hp>0&&m.spawnProvenance57==='los-lost-summon').length,began=beginMonsterRevival(g),corpsePos={x:g.x,y:g.y},corpseCheb=Math.max(Math.abs(g.x-corpseOrigin.x),Math.abs(g.y-corpseOrigin.y)),deathAfter=(state.monsters||[]).filter(m=>m.hp>0&&m.spawnProvenance57==='los-lost-summon').length,deathSummon=began&&g.deathLosBreakTurn57===120&&g.deathLosBreakSummoned57===true&&deathAfter===deathBefore+1,corpse=began&&g.hp===0&&g.revivePhase57==='corpse'&&g.livesRemaining57===8&&g.corpseUntilFloorTurn57===122&&corpseCheb>=1&&corpseCheb<=10&&g.lastCorpseRelocateDistance57===corpseCheb;
      state.floorTurn=122;advanceMonsterRevival(g);const teleCheb=Math.max(Math.abs(g.x-corpseOrigin.x),Math.abs(g.y-corpseOrigin.y)),reviving=g.revivePhase57==='reviving'&&g.hp===g.maxHp&&g.x===corpsePos.x&&g.y===corpsePos.y&&teleCheb===corpseCheb&&g.atk===weakExpected.atk&&g.def===weakExpected.def&&g.eva===weakExpected.eva,fullTurn=g.reviveFullTurn57;state.floorTurn=fullTurn;advanceMonsterRevival(g);const full=g.revivePhase57==='full'&&g.atk===fullExpected.atk&&g.def===fullExpected.def&&g.eva===fullExpected.eva&&g.alerted===true;
      q.chaseStarted=true;g.dormant57=false;g.hp=g.maxHp;g.revivePhase57='full';state.player.x=state.stairs.x;state.player.y=state.stairs.y;OccupancyService.move(state.player,state.player.x,state.player.y);state.floorTurn=200;g.attackInvestigation57=null;const pressureTriggered=updateExitPressureTracking(g,false),pressure=pressureTriggered===true&&g.attackInvestigation57?.exitPressure57===true&&g.attackInvestigation57?.exact57===true&&g.attackInvestigation57.x===state.player.x&&g.attackInvestigation57.y===state.player.y;
      const protectedSet=new Set((q.reinforcementProtectedCells||[]).map(c=>k(c.x,c.y)));state.monsters=(state.monsters||[]).filter(m=>m===g||m.spawnProvenance57!=='los-lost-summon');state.player.x=inside.x;state.player.y=inside.y;OccupancyService.move(state.player,state.player.x,state.player.y);g._sawPlayer57=true;g.losLostSummonCooldown57=0;const summoned=handleLosLostSummon(g,false),reinforcements=(state.monsters||[]).filter(m=>m.hp>0&&m.spawnProvenance57==='los-lost-summon'),summon=summoned===true&&reinforcements.length===1&&reinforcements.length<=(q.reinforcementCap57||3)&&reinforcements.every(m=>!protectedSet.has(k(m.x,m.y)));
      g.fast=false;delete g.actionLag57;g.exitPressureSpeed57={min:.5,max:1.5};const speedMap=[0,.25,.5,.75,1].map(progress=>({progress,speed:monsterExitPressureSpeed(g,progress)})),cadenceAt=progress=>{g.exitPressureSpeedBudget57=0;const out=[];for(let i=0;i<4;i++){const q=monsterActionSchedule(g,{pressureProgress57:progress});out.push({act:q.act,steps:q.steps,speed:q.speed})}return out},slowCadence=cadenceAt(0),normalCadence=cadenceAt(.5),fastCadence=cadenceAt(1),speedRamp=speedMap.map(q=>q.speed).every((v,i)=>Math.abs(v-[.5,.75,1,1.25,1.5][i])<1e-9)&&slowCadence.map(q=>q.steps).join(',')==='0,1,0,1'&&normalCadence.every(q=>q.steps===1)&&fastCadence.map(q=>q.steps).join(',')==='1,2,1,2';
      const ok=Object.values(config).every(Boolean)&&activated&&corpse&&deathSummon&&reviving&&full&&pressure&&summon&&speedRamp;result={ok,config,scaledStats:{hp:g.maxHp,normal:{atk:expected.atk,def:expected.def,eva:expected.eva},weak:weakExpected,full:fullExpected},activated,revival:{corpse,deathSummon,reviving,full,corpseRelocateChebyshev:corpseCheb,reviveAtCorpse:true,teleportChebyshev:teleCheb,livesAfterDeath:8},pressure,summon,reinforcements:reinforcements.map(m=>({name:m.name,x:m.x,y:m.y,protected:protectedSet.has(k(m.x,m.y))})),speedRamp:{ok:speedRamp,map:speedMap,slowCadence,normalCadence,fastCadence}};return result
    }finally{restoreGenerationSnapshot(snap);resetVisualState();VisibilityService.compute()}
  }
  function spawnAt61(name,anchor=null){const d=MONSTERS.find(v=>v.name===name);if(!d)return null;const m=scaledMonster(d),cands=[],reachable61=state.floor===24?globalThis.__MANRU_SPECIAL_FLOORS60__?.reach24?.({entranceOpen:true,allowBlink:false,ignoreOccupants:true})?.cells:null;
    if(anchor){for(let r=0;r<=9;r++)for(let oy=-r;oy<=r;oy++)for(let ox=-r;ox<=r;ox++){const x=anchor.x+ox,y=anchor.y+oy;if(x>0&&y>0&&x<COLS-1&&y<ROWS-1&&(!reachable61||reachable61.has(k(x,y)))&&farEnough61(x,y)&&PlacementService.monsterCanStand(m,x,y))cands.push({x,y})} }
    if(!cands.length){for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++)if((!reachable61||reachable61.has(k(x,y)))&&farEnough61(x,y)&&PlacementService.monsterCanStand(m,x,y))cands.push({x,y})}
    if(!cands.length)return null;const preferred=m.grassHide57?cands.filter(q=>monsterAmbushCanHide(m,q.x,q.y)):cands,p=choice(preferred.length?preferred:cands);Object.assign(m,p,{alerted:false});OccupancyService.addMonster(m);return m}
  function applyMiniVault62(options={}){
    state.miniVault62=null;if(!options.force&&(isMajor()||globalThis.__MANRU_RANDOM57__()>.55))return;
    const r=options.room||chooseVaultRoom62();if(!r)return;const v=options.id?MV62.find(q=>q.id===options.id):choice(MV62);if(!v)return;const cx=r.cx,cy=r.cy,wanted={crossfire:3,snare:1,shrine:1,watch:2}[v.id]||0,en=vaultEnemies(r,wanted);state.miniVault62={...v,x:r.x,y:r.y,w:r.w,h:r.h,localEnemies:en.length,spawnedEnemies:en.filter(m=>m.miniVaultSpawn62).length};
    if(v.id==='barricade'){
      for(let x=r.x+2;x<r.x+r.w-2;x++)if(Math.abs(x-cx)>1)put62(r,x,cy,TT.TABLE);put62(r,cx,cy,TT.CACHE);rewardInRoom62(r,'strategy');
    }else if(v.id==='crossfire'){
      put62(r,cx-1,cy,TT.SCREEN);put62(r,cx+1,cy,TT.SCREEN);for(let i=0;i<en.length;i++)moveEnemyTo(en[i],r,i);rewardInRoom62(r,'strategy');
    }else if(v.id==='snare'){
      for(const [dx,dy] of [[-2,0],[2,0],[0,-2],[0,2]])put62(r,cx+dx,cy+dy,TT.SNARE);put62(r,cx,cy,TT.CACHE);if(en[0])moveEnemyTo(en[0],r,1);
    }else if(v.id==='shrine'){
      put62(r,cx,cy,TT.ALTAR);for(const [dx,dy] of [[-2,-2],[2,-2],[-2,2],[2,2]])put62(r,cx+dx,cy+dy,TT.BRAZIER);rewardInRoom62(r,'talisman');if(en[0])moveEnemyTo(en[0],r,0);
    }else if(v.id==='pantry'){
      for(let x=r.x+2;x<r.x+r.w-2;x+=2){put62(r,x,r.y+2,TT.JAR);put62(r,x,r.y+r.h-3,TT.TABLE)}put62(r,cx,cy,TT.COOKPOT);rewardInRoom62(r,'recovery');
    }else if(v.id==='watch'){
      for(let y=r.y+2;y<r.y+r.h-2;y+=2)put62(r,cx,y,TT.SCREEN);if(en[0])moveEnemyTo(en[0],r,0);if(en[1])moveEnemyTo(en[1],r,2);rewardInRoom62(r,'strategy');
    }
    return state.miniVault62;
  }
  function woodEffect105(damage,requireSight=true){const p=state.player,targets=near74(p.x,p.y,2).filter(m=>!requireSight||entityCombatLineCheckR(p,m,{range:2,units:false}).ok);for(const m of targets){hurtMon74(m,'grass',damage);if(m.hp>0){setMonsterStatus(m,'poison74',Math.max(m.poison74||0,3));if(!m.boss)setMonsterStatus(m,'stunned',Math.max(m.stunned||0,1))}burst(m.x,m.y,'#94ad6c',7,.4)}return targets.length}
  function inspectTile81(q){
    if(window.__MANRU_INSPECT984__)return window.__MANRU_INSPECT984__(q);
    if(!q||!state)return;
    if(!state.seen.has(k(q.x,q.y))){showInspect('미탐사 구역','아직 확인하지 못한 공간이다.');return}
    const mon=findMonsterAt(q.x,q.y),it=ShopMapBuilder.groundAt(q.x,q.y)?.item||state.items.find(v=>v.x===q.x&&v.y===q.y),t=state.map[q.y][q.x];
    if(isEntityObservableToPlayer57(mon)){showInspect(mon.name,monsterConcept(mon));return}
    if(it){showInspect(it.name,it.desc||'바닥에 놓인 물건이다.');return}
    const tag=routeTagAt(q.x,q.y);showInspect(terrainName(t),tag?.label?`${terrainName(t)}. ${tag.label}을 가리키는 표식이다.`:`${terrainName(t)}.`);
  }
  function addDensityMonsters964(){
    if(!state||state.dead||state.victory)return 0;
    if((state.monsters||[]).some(m=>m.boss))return 0; // authored boss composition stays intact
    const live=(state.monsters||[]).filter(m=>m.hp>0&&!m.boss);
    if(!live.length)return 0;
    // Floor 22 has its own authored final encounter budget (r43: 33). Do not apply the generic +30% pass on top of it.
    if(state.floor===22){state.enemyDensity964={base:live.length,extra:0,total:live.length,mult:1,reason:'floor22-final-budget-r43'};return 0}
    const density=state.floor<=2?1.20:V964.density;
    const extra=Math.max(0,Math.round(live.length*(density-1)));
    if(!extra)return 0;
    const defs=floorEnemyDefinitions();if(!defs.length)return 0;
    const rule=spawnRuleForFloor(),dist=ReachabilityService.distances(state.player),roomUse=new Map(),safe=Math.max(5,rule.safe||5),spawnCtx57=PlacementService.generationContext(dist,safe);
    let added=0,guard=0;
    while(added<extra&&guard++<extra*70+100){
      const mon=scaledMonster(ordinaryEnemyPick(defs));
      let p=initialSpawnPosition(mon,dist,safe,roomUse,spawnCtx57);
      if(!p)p=PlacementService.randomMonsterCell(mon);
      if(!p||state.visible?.has(k(p.x,p.y)))continue;
      Object.assign(mon,p,{alerted:false});OccupancyService.addMonster(mon);PlacementService.registerGenerationMonster(spawnCtx57,mon);added++;
    }
    state.enemyDensity964={base:live.length,extra:added,total:live.length+added,mult:+((live.length+added)/live.length).toFixed(2)};
    return added;
  }
  function doorCloseBlock964(x,y){if(findMonsterAt(x,y))return'적이 문틈을 막고 있다.';if((state.items||[]).some(i=>i.x===x&&i.y===y))return'물건이 문턱에 걸려 있다.';return''}
function entityHazardCell1005(e){
  if(!state||!e||e.hp<=0)return null;const cells=entityIsPlayer(e)?[[0,0]]:(typeof footprintOffsets==='function'?footprintOffsets(e):[[0,0]]);let adapted=null;
  for(const[ox,oy]of cells){const x=e.x+ox,y=e.y+oy,t=state.map?.[y]?.[x],kind=hazardTile(t);if(!kind)continue;const q={x,y,t,kind};if(!entityAdapted(e,kind,x,y))return q;if(!adapted)adapted=q}
  return adapted
}
function applyLegendGatekeeper47(mon,depth){
 mon.monsterSpecies105=monsterSpeciesName(mon);if(mon.legendElite47)return mon;const multiplier=depth>=16?1.60:depth>=11?1.52:1.45;
 mon.maxHp=mon.hp=Math.round(mon.hp*multiplier);if(mon.martialActor105){mon.baseAtk+=depth>=16?3:2;mon.baseDef+=2;syncMartialActorStats(mon);}else{mon.atk+=depth>=16?3:2;mon.def+=2;}mon.legendElite47=true;mon.name+=' · 문지기';return mon;
}
function spawnDungeon46(id,rs){
 const defs=mobDefs47(id);if(!defs.length)return;const f=state.floor,target=f>=21?22:f>=16?19:f>=11?16:13,roomCap=f>=16?4:3,usable=rs.slice(1),per=new Map();
 const place=(d,preferred=null,elite=false)=>{const m=scaledMonster(d),rooms=preferred?[preferred,...usable.filter(r=>r!==preferred)]:usable;for(const r of rooms){if(!r||(!elite&&(per.get(r)||0)>=roomCap))continue;const cand=[];for(let n=0;n<36;n++)cand.push({x:rand(r.x+1,r.x+r.w-2),y:rand(r.y+1,r.y+r.h-2)});for(let y=r.y+1;y<r.y+r.h-1;y++)for(let x=r.x+1;x<r.x+r.w-1;x++)cand.push({x,y});for(const q of cand){if(Math.abs(q.x-state.player.x)+Math.abs(q.y-state.player.y)<9)continue;if(state.artifactReward46?.x===q.x&&state.artifactReward46?.y===q.y)continue;if((state.legendSanctums47||[]).some(s=>Math.abs(q.x-s.cx)<s.r&&Math.abs(q.y-s.cy)<s.r))continue;if([TT.KEY_TILE,TT.LOCKED_GATE,TT.PORTAL].includes(state.map[q.y]?.[q.x]))continue;if(!PlacementService.monsterCanStand(m,q.x,q.y))continue;Object.assign(m,{x:q.x,y:q.y,alerted:!!elite,hidden:false});OccupancyService.addMonster(m);per.set(r,(per.get(r)||0)+1);return m}}return null};
 /* Every branch visibly establishes its three dedicated enemy archetypes before filling the encounter budget. */
 const dedicated=[];for(let i=0;i<defs.length;i++)dedicated.push(place(defs[i],usable[(i*2+1)%Math.max(1,usable.length)]));
 if(dedicated.some(m=>!m))throw new Error(`dedicated monster placement failed: ${id}`);
 let guard=0,di=0;while(state.monsters.filter(isHostileTarget57).length<target&&guard++<2200){const r=usable[guard%usable.length];if(!r)break;if((per.get(r)||0)>=roomCap)continue;place(defs[di++%defs.length],r)}
 const goal=rs[rs.length-1],eliteDef=defs[(id.length+f)%defs.length];if(eliteDef){const eDef={...eliteDef};const e=scaledMonster(eDef);applyLegendGatekeeper47(e,f);let placed=false;for(let rr=4;rr<=7&&!placed;rr++)for(const[dx,dy]of DIRS8){const x=goal.cx+dx*rr,y=goal.cy+dy*rr;if(Math.abs(x-state.player.x)+Math.abs(y-state.player.y)<9)continue;if(PlacementService.monsterCanStand(e,x,y)){Object.assign(e,{x,y,alerted:true,hidden:false});OccupancyService.addMonster(e);placed=true;break}}if(!placed){const q=place(eliteDef,goal,true);if(q){applyLegendGatekeeper47(q,f);q.alerted=true}}}
}
function pull47(mon){const dx=Math.sign(state.player.x-mon.x),dy=Math.sign(state.player.y-mon.y),x=mon.x+dx,y=mon.y+dy;if(resolveForcedMovement57(mon,state.player,1,{mode:'pull',hostile:true,creditPlayer:true}).moved){setMonsterWeakened(mon,2);floatText(mon.x,mon.y,'견인 · 방어저하','#d6bd9a',9)}}
function enemySpecial47(m,target=state.player){
 if((target===state.player&&playerConcealed58())||!m?.legendMob47||!m.alerted||!combatTargetValid57(m,target)||m.stunned>0||m.skillSeal105>0)return false;const d=entityDistance57(m,target),phase=(m.x*5+m.y*3)%6,skill=m.legendSkill47;
 if(skill==='forgeBurst'&&d<=6&&monsterAttackLineR(m,6,{target}).ok&&state.floorTurn%5===phase%5){for(const[dx,dy]of[[0,0],[1,0],[-1,0]])fireField47(target.x+dx,target.y+dy,3,m);addLog(`${m.name}이 발밑으로 화염 홈을 열었다.`);setMonsterStatus(m,'stunned',1);return true}
 if(skill==='waterBurst'&&d<=7&&monsterAttackLineR(m,7,{target}).ok&&state.floorTurn%5===phase%5){emitElementContact105('water',elementCells105(target.x,target.y),effectSource57(m));projectileFX(m.x,m.y,target.x,target.y,'#72d8ee');const r=attackMonster(m,1,{target,delivery:'ranged',projectile:true,reflectable:true,range:7});if(r.hit&&!state.dead)applyCombatStatus(target,'weaken',2,1,{stagger:true});setMonsterStatus(m,'stunned',1);return true}
 if(skill==='thunderPulse'&&d<=7&&monsterAttackLineR(m,7,{target}).ok&&state.floorTurn%4===phase%4){projectileFX(m.x,m.y,target.x,target.y,'#b5efff');const r=attackMonster(m,2,{target,delivery:'ranged',projectile:true,reflectable:true,range:7});if(r.hit&&!state.dead){emitElementContact105('shock',entityFootprintCells57(target),effectSource57(m),{baseDamage:r.damage||m.atk||2,directTarget:target});elementAttackFx105('shock',entityFootprintCells57(target),m);applyCombatStatus(target,'stun',1,.28,{stagger:true});}setMonsterStatus(m,'stunned',1);return true}
 if(skill==='curseMark'&&d<=5&&monsterAttackLineR(m,5,{target}).ok&&state.floorTurn%4===phase%4){const r=attackMonster(m,1,{target,delivery:'ranged',projectile:true,reflectable:true,range:5});if(r.hit&&!state.dead)applyCombatStatus(target,'skillSeal',2,1);setMonsterStatus(m,'stunned',1);return true}
 if(skill==='earthQuake'&&d<=2&&monsterAttackLineR(m,2,{target}).ok&&state.floorTurn%4===phase%4){emitElementContact105('earth',elementCells105(m.x,m.y,2),effectSource57(m));const r=attackMonster(m,2,{target,delivery:'area',projectile:false,reflectable:false,range:2});if(r.hit&&!state.dead)resolveForcedMovement57(target,m,1,{mode:'push',hostile:true});setMonsterStatus(m,'stunned',1);return true}
 if(skill==='mirrorStep'&&d<=5&&state.floorTurn%4===phase%4){const opts=DIRS8.map(([dx,dy])=>({x:target.x+dx*2,y:target.y+dy*2})).filter(q=>monsterPatrolAllows(m,q.x,q.y)&&PlacementService.monsterCanStand(m,q.x,q.y));if(opts.length){const q=choice(opts);OccupancyService.move(m,q.x,q.y);markCombatBlink57(m);burst(m.x,m.y,'#c5dce2',12,.5);setMonsterStatus(m,'stunned',1);return true}}
 if(skill==='graveDrain'&&d<=6&&monsterAttackLineR(m,6,{target}).ok&&state.floorTurn%5===phase%5){projectileFX(m.x,m.y,target.x,target.y,'#9e6e9d');const r=attackMonster(m,1,{target,delivery:'ranged',projectile:true,reflectable:true,range:6});if(r.hit&&!state.dead)target.focus=Math.max(0,(target.focus||0)-2);setMonsterStatus(m,'stunned',1);return true}
 if(skill==='lavaShot'&&d<=8&&monsterAttackLineR(m,8,{target}).ok&&state.floorTurn%5===phase%5){emitElementContact105('fire',elementCells105(target.x,target.y,1),effectSource57(m));for(const[dx,dy]of DIRS4.slice(0,2)){const x=target.x+dx,y=target.y+dy,old=state.map[y]?.[x];if((old>=500&&old<660&&(old-500)%16<4)||[TT.FLOOR,TT.GRASS,TT.WOOD_FLOOR,TT.MOON_STONE,TT.DARK_WOOD,TT.GILDED_FLOOR].includes(old))RuntimeTerrainOwner.temporary(x,y,TT.LAVA,3,'legend-lava',{allowedOld:[old],source:'legend-enemy-lava47'})}addLog(`${m.name}이 퇴로 옆에 용암탄을 꽂았다.`);setMonsterStatus(m,'stunned',1);return true}
 if(skill==='chainRush'&&d>=2&&d<=6&&monsterAttackLineR(m,6,{target}).ok&&state.floorTurn%4===phase%4){const r=attackMonster(m,1,{target,delivery:'melee',projectile:false,reflectable:false,range:6});if(r.hit&&!state.dead)resolveForcedMovement57(target,m,1,{mode:'push',hostile:true});setMonsterStatus(m,'stunned',1);return true}
 if(skill==='wardPulse'&&d<=5&&state.floorTurn%5===phase%5){setMonsterBuff(m,3,3);m.shell61=3;floatText(m.x,m.y,'금단 수호','#e2c779',9);setMonsterStatus(m,'stunned',1);return true}return false
}
function debugBattleRound57(){
 const b=DEBUG_BATTLE57;if(!b.open||b.winner)return;PresentationState.advance(performance.now());state.turn++;state.floorTurn++;b.round++;
 const actors=[...state.monsters]; // Alternate the initiative advantage each round.
 if(b.round%2===0)actors.reverse();OccupancyService.beginShared();
 try{
  for(const mon of actors){
   if(!state.monsters.includes(mon))continue;if(advanceMonsterRevival(mon)||mon.hp<=0)continue;if(mon.combatFixture54){tickBossFixture(mon);continue}
   if(mon.stunned>0){mon.stunned--;continue}if(mon.martialActor105)tickMartialActor(mon);
   const schedule=monsterActionSchedule(mon);if(!schedule.act)continue;
   const targets=state.monsters.filter(t=>combatTargetValid57(mon,t)).sort((a,c)=>entityDistance57(mon,a)-entityDistance57(mon,c));
   const target=priorityCoreTarget(mon)||targets.find(t=>actorDetectedTarget57(mon,t,80))||targets[0];if(!target){resolveMonsterTargetTurn57(mon,null,schedule);continue}

   resolveMonsterTargetTurn57(mon,target,schedule);
  }
  tickMonsterDurations();tickMonsterCombatStatuses();tickCombatFields57();expireCombatFields();tickElementFields57();tickLegendFields();RuntimeTerrainOwner.tick();tickJarGasFields();tickTerrainReactions105();updateRafts();palaceAdvance(1);
 }catch(error){debugBattlePause57();debugBattleMessage57('전투 오류: '+error.message);console.error(error);return}
 finally{OccupancyService.endShared()}
 const sides=['A','B'].map(side=>state.monsters.filter(m=>m.debugSide57===side&&!m.combatFixture54&&(m.hp>0||m.revivePhase57==='corpse')).length);
 if(!sides[0]||!sides[1]){b.winner=sides[0]?'A 진영 승리':sides[1]?'B 진영 승리':'무승부';debugBattlePause57();debugBattleMessage57(b.winner+' · 재대결로 같은 편성을 다시 배치할 수 있습니다.')}
 else if(b.round>=1500){b.winner='1500턴 제한';debugBattlePause57();debugBattleMessage57('1500턴 도달 · 교착 또는 장기전입니다. 편성을 바꿔 재대결하세요.')}
 else debugBattleMessage57(b.playing?'전투 진행 중':'일시정지 · 한 턴 진행 또는 계속 가능');
 debugBattleRender57();
}
function debugBattleBindViewport57(el){
 const b=DEBUG_BATTLE57,cam=globalThis.__MANRU_CAMERA_STATE12__,hit=e=>globalThis.__MANRU_WORLD_HITTEST12__.cellAtClient(e.clientX,e.clientY);
 el.addEventListener('pointerdown',e=>{if(!b.open||e.button>0)return;e.preventDefault();cam.cancelInertia();b.pointers??=new Map();const p={id:e.pointerId,x:e.clientX,y:e.clientY,lx:e.clientX,ly:e.clientY,cell:hit(e),moved:false,held:false};b.pointers.set(e.pointerId,p);el.setPointerCapture(e.pointerId);
  if(b.pointers.size===1)p.hold=setTimeout(()=>{if(!p.moved&&b.pointers.has(p.id)){p.held=true;b.inspectRelease57={id:p.id,x:p.x,y:p.y,until:Infinity};debugBattleInspect57(p.cell)}},660);
  else{for(const p of b.pointers.values()){clearTimeout(p.hold);p.moved=true;}const a=[...b.pointers.values()];b.gesture={distance:Math.hypot(a[0].lx-a[1].lx,a[0].ly-a[1].ly),zoom:cam.desiredZoom()};cam.beginInspect();}
 },{passive:false});
 el.addEventListener('pointermove',e=>{const p=b.pointers?.get(e.pointerId);if(!p)return;e.preventDefault();const dx=e.clientX-p.lx,dy=e.clientY-p.ly;p.lx=e.clientX;p.ly=e.clientY;
  if(b.gesture&&b.pointers.size>=2){const a=[...b.pointers.values()];debugBattleZoom57(b.gesture.zoom*Math.hypot(a[0].lx-a[1].lx,a[0].ly-a[1].ly)/Math.max(1,b.gesture.distance),{clientX:(a[0].lx+a[1].lx)/2,clientY:(a[0].ly+a[1].ly)/2});return;}
  if(!p.moved&&Math.hypot(e.clientX-p.x,e.clientY-p.y)>8){p.moved=true;clearTimeout(p.hold);cam.beginInspect();document.getElementById('battleFollow57').checked=false;cam.panScreen(e.clientX-p.x,e.clientY-p.y);}
  else if(p.moved)cam.panScreen(dx,dy);b.viewDirty=true;debugBattleRender57(false);
 },{passive:false});
 el.addEventListener('pointerup',e=>{const p=b.pointers?.get(e.pointerId);if(!p)return;e.preventDefault();clearTimeout(p.hold);b.pointers.delete(e.pointerId);if(p.held&&b.inspectRelease57)b.inspectRelease57.until=performance.now()+600;
  if(!p.moved&&!p.held){const cell=hit(e),mode=b.watching?'inspect':document.getElementById('battleTool57').value;if(mode==='A'||mode==='B'){if(cell&&PlacementService.monsterCanStand({kind:'human',hp:1},cell.x,cell.y)){b.spawnAnchors[mode]=cell;b.roomKey=-1;debugBattleCreateWorld57();debugBattleMessage57(mode+' 진영 출발점 변경');}else debugBattleMessage57('이동 가능한 바닥을 선택하세요.');}
   else if(mode==='follow'){const mon=cell&&findMonsterAt(cell.x,cell.y);if(mon){b.subjectId=mon.debugId57;cam.center();debugBattleRender57();}}
  }
  if(!b.pointers.size){b.gesture=null;cam.cancelInertia();}
 },{passive:false});
 for(const type of ['pointercancel','lostpointercapture'])el.addEventListener(type,e=>{const p=b.pointers?.get(e.pointerId);if(p){clearTimeout(p.hold);b.pointers.delete(e.pointerId);}if(!b.pointers?.size){b.gesture=null;cam.cancelInertia();}});
 el.addEventListener('contextmenu',e=>{e.preventDefault();});
 el.addEventListener('wheel',e=>{if(!b.open)return;e.preventDefault();debugBattleZoom57(cam.desiredZoom()*Math.exp(-e.deltaY*.0015),e);},{passive:false});
 if(typeof ResizeObserver==='function')new ResizeObserver(()=>{if(b.open){syncGameViewport();b.viewDirty=true;}}).observe(el);
}
let SUMMON_PANEL_SESSION105=null;
function summonRecovery105(upgrade=summonState().upgrade){return Math.max(1,Math.ceil(SUMMON_RULES.cooldown/(1+SUMMON_RULES.cooldownDecay*Math.max(0,Math.floor(Number(upgrade)||0)))));}
function configureSummonBody105(mon){mon.summonForm105=mon.summonForm105||(mon.boss||mon.miniBoss?'boss':mon.fixed?'fixed':'mobile');mon.fixed=!!(mon.combatFixture54||mon.immobile105||mon.kind==='plant'&&mon.fixed);if(mon.treeMimic105)mon.mimicDormant105=false;mon.footprint='one';if(mon.aquatic)mon.amphibious57=true;mon.waterOnly57=false;mon.guardHome57=null;return mon;}
function normalizeSummonSpeciesItem105(item,defs=summonDefinitions(),aliases=new Map()){
 if(!item?.summonItem105||item.summonSpeciesVersion105===1)return;
 const byName=new Map(defs.map(d=>[d.name,d])),resolve=old=>aliases.get(old)||monsterSpeciesName(old),sum=(a,b)=>Math.min(Number.MAX_SAFE_INTEGER,(Number.isSafeInteger(a)&&a>0?a:0)+(Number.isSafeInteger(b)&&b>0?b:0));
 if(item.summonItem105==='picture'){
  const original=resolve(item.summonSpecies105),name=byName.has(original)?original:monsterSpeciesName(item.summonPortrait105),def=byName.get(name);
  if(def){const fresh=summonPictureItem(name,def,item.pictureCopies105||1);Object.assign(item,{name:fresh.name,summonSpecies105:name,summonPortrait105:fresh.summonPortrait105,desc:fresh.desc});}
 }else if(item.summonItem105==='book'){
  const counts={},pictures={},localAliases=new Map(aliases);
  for(const [old,picture]of Object.entries(item.summonPictures105||{})){const name=monsterSpeciesName(picture?.portrait);if(!byName.has(resolve(old))&&byName.has(name))localAliases.set(old,name);}
  for(const [old,n]of Object.entries(item.summonKillCounts105||{})){const name=localAliases.get(old)||resolve(old);if(byName.has(name))counts[name]=sum(counts[name],n);}
  for(const [old,picture]of Object.entries(item.summonPictures105||{})){const name=localAliases.get(old)||resolve(old),def=byName.get(name);if(def&&Number.isSafeInteger(picture?.count)&&picture.count>0)pictures[name]={count:sum(pictures[name]?.count,picture.count),portrait:clone(def)};}
  item.summonKillCounts105=counts;item.summonPictures105=pictures;
 }
 item.summonSpeciesVersion105=1;
}
function summonMigrateSpecies105(q){
 const defs=summonDefinitions(),byName=new Map(defs.map(d=>[d.name,d])),polluted=new Set(),aliases=new Map();
 for(const entry of q.prototypes||[]){const name=monsterSpeciesName(entry.def||entry.actor||entry.name),def=byName.get(name);if(def){aliases.set(entry.name,name);if(entry.name!==name||['hp','atk','def'].some(k=>entry.def?.[k]!==def[k]))polluted.add(name);}}
 const counts={};for(const [old,n]of Object.entries(q.killCounts105||{})){const name=aliases.get(old)||monsterSpeciesName(old);if(byName.has(name)&&Number.isSafeInteger(n)&&n>=0)counts[name]=Math.min(Number.MAX_SAFE_INTEGER,(counts[name]||0)+n);}q.killCounts105=counts;
 // A catalog is a projection of authored definitions, never a slain runtime body.
 q.prototypes=(q.prototypes||[]).filter(e=>e.actor&&e.actor.martialActor105&&e.actor.dojoRank105>=1&&e.actor.dojoRank105<=4);
 const definitionKeys=new Set(defs.flatMap(d=>Object.keys(d)));for(const key of ['monsterSpecies105','maxHp','legendElite47','baseAtk57','baseDef57','baseEva57'])definitionKeys.add(key);
 const locations=summonContainers(),seenWorlds=new Set(),seenPages=new Set([state.branchWorld105]);
 for(let i=0;i<locations.length;i++){
  const location=locations[i],world=location.world;if(!world||seenWorlds.has(world))continue;seenWorlds.add(world);
  // Return snapshots may contain their own saved branch pages in older saves.
  for(const outer of [world.artifactReturn46?.outer||world.artifactReturn46,world.shopIntermission?.outer?.state])if(outer&&!seenWorlds.has(outer))locations.push({world:outer});
  if(world.branchWorld105&&!seenPages.has(world.branchWorld105)){seenPages.add(world.branchWorld105);for(const [pageKey,raw]of Object.entries(world.branchWorld105.pages||{}))locations.push({world:branchDecodePage(raw),pageKey,pageOwner:world.branchWorld105});}
  for(const item of [...(world.player?.inventory||[]),...(world.items||[]),...(world.pendingGroundItems57||[]).map(q=>q?.item),...(world.shopIntermission?.stock||[]).map(r=>r.item)])normalizeSummonSpeciesItem105(item,defs,aliases);
  for(const mon of world.monsters||[]){
   const name=monsterSpeciesName(mon),def=byName.get(name);
   if(mon.summonOwner105==='player'&&!mon.summonParent105&&def&&(mon.name!==name||mon.legendElite47||polluted.has(name))){
    const hp=mon.hp,maxHp=Math.max(1,mon.maxHp||mon.hp),floor=mon.summonCombatFloor105||(world.branchContext105?branchCombatFloor(world.branchContext105):world.floor||state.floor)+Math.max(0,(mon.summonPictureCount105||1)-1),fresh=summonNative({name,def},floor),runtime={...mon};
    for(const key of definitionKeys){delete runtime[key];delete mon[key];}
    Object.assign(mon,fresh,runtime,{name,monsterSpecies105:name,hp:hp<=0?hp:Math.max(1,Math.min(fresh.maxHp,Math.ceil(fresh.maxHp*hp/maxHp)))});
   }else if(def)mon.monsterSpecies105=name;
  }
  if(location.pageKey)(location.pageOwner||state.branchWorld105).pages[location.pageKey]=branchEncodePage(world);
 }
 q.speciesVersion105=1;OccupancyService.endShared();
}

const SPAWN_RULES=[
  {from:1,to:1,count:[5,5],safe:10},
  {from:2,to:5,count:[6,8],safe:10},
  {from:6,to:10,count:[7,9],safe:10},
  {from:11,to:15,count:[8,10],safe:9},
  {from:16,to:20,count:[9,11],safe:9},
  {from:21,to:24,count:[9,12],safe:8}
];
function effectSource57(source,opts={}){if(source?.sourceFaction&&source!==state?.player&&!(state?.monsters||[]).includes(source))return{sourceFaction:opts.sourceFaction||source.sourceFaction,owner:opts.owner??source.owner??null,credit:opts.credit??source.credit??null,friendlyFire:opts.friendlyFire??!!source.friendlyFire};const owner=opts.owner??source??null;return{sourceFaction:opts.sourceFaction||entityFaction(owner),owner:owner===state?.player?'player':(state?.monsters||[]).includes(owner)?combatantId(owner):owner?.id57??owner?.name??owner,credit:opts.credit??(entityFaction(owner)==='player'?'player':null),friendlyFire:!!opts.friendlyFire}}
const JAR_GAS_VISUAL_START57=new WeakMap();
function jarGasCellKey57(x,y){return `${x},${y}`}
function jarGasAddCell57(field,x,y,d,concentration,bornAge){
  const kk=jarGasCellKey57(x,y),old=field.cells.find(c=>c.x===x&&c.y===y);if(old){old.c=Math.max(old.c,concentration);old.bornAge=Math.min(old.bornAge,bornAge);return old}
  const cell={x,y,d,c:concentration,bornAge};field.cells.push(cell);return cell
}
function pullNearbyLoot(){const c=playerCloak(),r=c.magnet||0;if(!r||!state)return;for(const it of state.items){const d=entityDistance57(it,state.player);if(d>0&&d<=r)moveGroundItemStep57(it,state.player)}}
function spawnNamed(...a){return configureMonsterTraits(placeNamedMonster(...a))}
function entityDistance57(a,b){return entityDistanceAt(a,a?.x,a?.y,b)}
function spawnRuleForFloor(){return SPAWN_RULES.find(r=>state.floor>=r.from&&state.floor<=r.to)||SPAWN_RULES[SPAWN_RULES.length-1]}
function spawnFloorPopulation(){
  const rule=spawnRuleForFloor(),count=Math.ceil((SPECIAL_BASE_COUNTS[state.floor]??rand(rule.count[0],rule.count[1]))*(state.floor>=6?1.3:1));
  const defs=floorEnemyDefinitions();if(!defs.length||count<=0)return;
  // F20 keeps the ordinary 16–20F population budget, but its three floor-specific definitions must actually be represented.
  // They are seeded inside this canonical population owner; no second post-generation monster spawner is allowed.
  const forced=state.floor===1?['객잔 쥐','객잔 쥐','시종','취객','객잔 쥐','취객','시종','취객','객잔 쥐','취객'].map(name=>defs.find(d=>d.name===name)).filter(Boolean):state.floor===20?['수비병','강철이','살라맨더'].map(name=>defs.find(d=>d.name===name)).filter(Boolean):[];
  state.visible=new Set();state.seen=new Set();VisibilityService.compute();
  const dist=ReachabilityService.distances(state.player),roomUse=new Map(),spawnCtx57=PlacementService.generationContext(dist,rule.safe);
  let placed=0,guard=0;
  while(placed<count&&guard++<220){
    const def=forced[0]||ordinaryEnemyPick(defs),mon=scaledMonster(def),p=initialSpawnPosition(mon,dist,rule.safe,roomUse,spawnCtx57);if(!p)continue;
    Object.assign(mon,p);if(state.floor===20){mon.f20Resident1020=true;mon.spawnProvenance57='floor20-normal-population'}OccupancyService.addMonster(mon);PlacementService.registerGenerationMonster(spawnCtx57,mon);placed++;if(forced[0]===def)forced.shift();
  }
}
function isEntityObservableToPlayer57(entity){
  const revivalCorpse=entity?.revivePhase57==='corpse'&&entity?.revivalLives57;
  if(!state||!entity||entity.hidden||entity.martialStatus105?.stealth>0||(entity.hp<=0&&!revivalCorpse))return false;
  const offsets=typeof footprintOffsets==='function'?footprintOffsets(entity):[[0,0]];
  return offsets.some(([ox,oy])=>{const x=entity.x+ox,y=entity.y+oy;return x>=0&&y>=0&&x<COLS&&y<ROWS&&state.visible.has(k(x,y))});
}
function monsterIdleRecovery105(mon,target){
 if(!mon?.idlePotionKind105||mon.hp<=0||mon.hp>mon.maxHp*.5||mon.intent54||mon.stunned>0||mon.weaponRecovery105>0||mon.palaceRecoverUntil105>=state.floorTurn)return false;
 const reach=mon.ranged?(mon.range||6):(mon.reach||1);
 if(target&&combatTargetValid57(mon,target)&&actorDetectedTarget57(mon,target,monsterSenseRadius(mon))&&(mon.nextEquipmentStrike105||0)<=state.floorTurn&&monsterAttackLineR(mon,reach,{target}).ok)return false;
 const item=mon.inventory?.find(i=>i.type==='potion'&&i.potionKind===mon.idlePotionKind105&&itemQuantity(i)>0);if(!item)return false;
 if(!applyRecoveryPotion57(mon,item))return false;burst(mon.x,mon.y,item.color||'#b65b4c',12,.75);floatText(mon.x,mon.y,item.name,'#a1e4b4',11);return true;
}
function captureMovementDiscovery105(){
 recordPlayerSight105();observePlayerDiscovery105();
 return{run:state,map:state.map,x:state.player.x,y:state.player.y,unseen:new Set((state.monsters||[]).filter(mon=>!monsterDiscoverySpent(mon)))};
}
function updateKeeperLavaOrigin54(mon,phase,target=null){
 phase.origin={x:mon.x,y:mon.y};if(phase.stage!==1)return;
 const opponent=target||[state.player,...state.monsters].find(t=>t.hp>0&&(t===state.player?'player':t.combatantId54)===phase.targetId);
 if(combatTargetValid57(mon,opponent))phase.target={x:opponent.x,y:opponent.y};
}
function silkConnectionCells54(a,b){
 const ray=combatLineCellsR8(a.x,a.y,b.x,b.y);if(ray.some(c=>tileBlocksSight(state.map[c.y]?.[c.x])))return null;
 const cells=ray.filter(c=>!(c.x===a.x&&c.y===a.y||c.x===b.x&&c.y===b.y));return cells.length?cells:null;
}
  const TURN_AUDIT5={serial:0,history:[]};
  // ---- restore canonical special-floor enemy density lost by renamed monsters
  function ensureCanonExtras58(){
    if(!state||state.dead)return;
    if(state.floor===2){
      for(const n of ['시종','객잔 경비병','떠돌이 도둑']) spawnNamed(n);
    }else if(state.floor===4){
      for(const n of ['취객','떠돌이 도둑','거대 거미']) spawnNamed(n);
    }else if(state.floor===6){
      let fish=state.monsters.filter(m=>m.name==='식인 물고기').length,guard=0;
      while(fish<5&&guard++<12){if(spawnNamed('식인 물고기'))fish++;else break}
    }
  }
  const SPECIAL60=new Set([2,4,6,8,11,13,16,18,21,22,23,24]);
  /* ---------- custom population for rebuilt geometry ---------- */
  function spawnNear60(name,x,y,r=5){const d=MONSTERS.find(v=>v.name===name);if(!d)return null;const mon=scaledMonster(d),reach=state.floor===24?reach24State60({entranceOpen:true,allowBlink:false,ignoreOccupants:true}).cells:null;for(let rad=0;rad<=r;rad++)for(let oy=-rad;oy<=rad;oy++)for(let ox=-rad;ox<=rad;ox++){const xx=x+ox,yy=y+oy;if(xx<=0||yy<=0||xx>=COLS-1||yy>=ROWS-1||(reach&&!reach.has(k(xx,yy))))continue;if(PlacementService.monsterCanStand(mon,xx,yy)){Object.assign(mon,{x:xx,y:yy});OccupancyService.addMonster(mon);return mon}}return null}
function spawnAuthoredEncounters60(){
    if(state.floor===23){const q=state.floor23,dragon=spawnNear60('여의 수룡',q.bossSpawn.x,q.bossSpawn.y,4);if(!dragon)throw new Error('F23 dragon spawn failed');dragon.hpThreshold57={ratio:.5,event:'f23-progress-key'};dragon.guardPost57=true;dragon.guardHome57={x:q.bossSpawn.x,y:q.bossSpawn.y};for(const id of q.switchIds){const sw=state.switches.find(v=>v.id===id);if(!sw)throw new Error(`F23 missing switch ${id}`);const guard=spawnNear60('보주의 파수꾼',sw.x+2,sw.y,3);if(guard){guard.guardPost57=true;guard.guardHome57={x:guard.x,y:guard.y}}}return true}
    if(state.floor===24){const q=state.floor24,g=spawnNear60('구미묘',q.gumimyoSpawn.x,q.gumimyoSpawn.y,5);if(!g)throw new Error('F24 gumimyo spawn failed');g.livesRemaining57=g.revivalLives57;g.revivePhase57='normal';g.dormant57=true;g.baseAtk57=g.atk;g.baseDef57=g.def;g.baseEva57=g.eva;applyMonsterRevivalStats(g);const guard=spawnNear60('보주의 파수꾼',q.entranceKey.x+3,q.entranceKey.y,4);if(guard){guard.guardPost57=true;guard.guardHome57={x:guard.x,y:guard.y}}return true}
    return false;
  }
  function farEnough61(x,y){return Math.abs(x-state.player.x)+Math.abs(y-state.player.y)>=8&&!state.visible.has(k(x,y))}
  function encounterAnchors61(){const rs=(state.featureRooms?.length?state.featureRooms:state.rooms||[]).filter(r=>r&&r.w>=4&&r.h>=4).map(r=>({x:Math.floor(r.x+r.w/2),y:Math.floor(r.y+r.h/2)})).filter(p=>farEnough61(p.x,p.y));if(!rs.length)rs.push({x:COLS-5,y:5});return rs}
  function populate61(){const target=TARGET61[state.floor],hasBoss=state.monsters.some(m=>m.boss);if(!target||hasBoss)return;const packs=PACKS61[state.floor]||[],anchors=encounterAnchors61(),alive=()=>state.monsters.filter(m=>m.hp>0&&!m.boss).length;let guard=0,pi=0;
    while(alive()<target&&guard++<120){const defs=floorEnemyDefinitions(),pack=packs.length?packs[pi++%packs.length]:(defs.length?[choice(defs).name]:[]),anchor=anchors[pi%anchors.length];for(const name of pack){if(alive()>=target)break;spawnAt61(name,anchor)}}
  }
  /* small DCSS-style minivaults: reuse existing rooms instead of adding giant fixed maps */
  const MV62=[
    {id:'barricade',name:'봉쇄 보급실',hint:'문 하나와 파괴물 뒤에 전술 보급이 숨겨져 있다.'},
    {id:'crossfire',name:'교차 사격실',hudName:'십자 사격실',hint:'전열과 원거리 적이 서로 시야를 보완한다.'},
    {id:'snare',name:'포박 감실',hint:'좁은 출입구와 함정 때문에 진입 순서가 중요하다.'},
    {id:'shrine',name:'잔불 사당',hint:'사당 주변은 위험하지만 부적이나 비약을 노릴 만하다.'},
    {id:'pantry',name:'봉인 찬방',hint:'식량과 회복품이 있지만 출입구가 좁다.'},
    {id:'watch',name:'감시 객실',hint:'문을 열기 전 원거리 위협을 대비해야 한다.'}
  ];
  function put62(r,x,y,t){if(roomFree62(r,x,y)){setTerrainTile58(state.map,x,y,t);return true}return false}
  function rewardInRoom62(r,kind='strategy'){const p=itemCellInRoom62(r);if(!p)return false;let pool=[];if(kind==='talisman')pool=(window.MANRU_TALISMANS||[]).filter(x=>state.floor>=(x.minFloor||1));else if(kind==='recovery')pool=(window.MANRU_POTIONS||[]).filter(x=>['heal_small','heal_medium','makgeolli','focus','cleanse'].includes(x.potionKind)&&state.floor>=(x.minFloor||1));else pool=(window.MANRU_POTIONS||[]).filter(x=>!['heal_small','heal_medium','makgeolli','focus','cleanse'].includes(x.potionKind)&&state.floor>=(x.minFloor||1));if(!pool.length)return false;const i=clone(choice(pool));Object.assign(i,{x:p.x,y:p.y,count:1});PlacementService.placeItem(i);return true}
function remain(kind){const h=hz();if(!h)return 0;const u=kind==='drown'?h.drownUntil:h.voidUntil;return Math.max(0,(u||0)-(state.turn||0))}
function resolveEntityHazard1005(e,t,nx,ny,origin,opt={}){
  const kind=hazardTile(t);if(!kind||!e)return null;const player=entityIsPlayer(e),consumeTurn=opt.consumeTurn!==false,standing=opt.standing===true;
  if(entityAdapted(e,kind,nx,ny)){
    if(!standing){OccupancyService.move(e,nx,ny);if(player){resetVisualState?.();if(kind==='water'&&remain('drown')>0)addLog(`익사 면역 ${remain('drown')}턴 · 물 위를 버틴다.`);if(kind==='void'&&remain('void')>0)addLog(`공허 면역 ${remain('void')}턴 · 발밑의 공허를 견딘다.`);bumpTileAction(nx,ny,{cause:opt.landingCause57||'hazard'});if(consumeTurn)globalThis.__MANRU_TURN_ENGINE__.advance({handled:true,committed:true,timeCost:moveTurnCost(),reason:"resolveEntityHazard1005"}).value}}
    return'adapted'
  }
  if(!standing){OccupancyService.move(e,nx,ny);if(player)resetVisualState?.()}
  if(kind==='water'){
    const ax=standing?e.x:nx,ay=standing?e.y:ny,land=nearestLandFor1005(e,ax,ay,standing?null:origin);
    if(land){
      const before=Math.max(1,e.hp||1);e.hp=Math.max(1,Math.floor(before*.5));
      if(player){burst(nx,ny,'#79cbd2',24,1.1);floatText(nx,ny,`HP ${displayHealth(before)}→${displayHealth(e.hp)}`,'#9de1e5',11);addLog(standing?'발밑이 물로 변했지만 가까운 뭍을 붙잡았다. 체력이 절반으로 깎였다.':'물에 빠졌지만 바로 붙잡을 뭍이 있었다. 체력이 절반으로 깎이고 간신히 기어올랐다.')}
      else if(state?.visible?.has?.(k(nx,ny))){burst(nx,ny,'#79cbd2',16,.8);floatText(nx,ny,`HP ${displayHealth(before)}→${displayHealth(e.hp)}`,'#9de1e5',10);addLog(`${e.name}이 물에 빠졌다가 가까운 뭍을 붙잡았다. 체력이 절반으로 줄었다.`)}
      if(player){resolvePlayerLanding57(land.x,land.y,{cause:'water-rescue',hazard:false,resetVisual:true});if(consumeTurn&&!state.dead)globalThis.__MANRU_TURN_ENGINE__.advance({handled:true,committed:true,timeCost:1,reason:"resolveEntityHazard1005"}).value}else{OccupancyService.move(e,land.x,land.y)}
      return'rescued'
    }
    if(player&&consumeWard('drown')){if(consumeTurn)globalThis.__MANRU_TURN_ENGINE__.advance({handled:true,committed:true,timeCost:1,reason:"resolveEntityHazard1005"}).value;return'ward'}
    if(player){addLog('붙잡을 뭍이 없다. 물 아래로 가라앉는다.');die('익사')}else monsterHazardDeath(e,'water');
    return'dead'
  }
  if(kind==='mercury'){
    const ax=standing?e.x:nx,ay=standing?e.y:ny,land=nearestLandFor1005(e,ax,ay,standing?null:origin);
    if(land){
      const before=Math.max(1,e.hp||1);e.hp=1;
      if(player){burst(nx,ny,'#c0cdca',24,1.05);floatText(nx,ny,`HP ${before}->1`,'#d6e2dd',11);addLog(standing?'발밑이 수은으로 변했다. 가까운 뭍을 붙잡았지만 HP 1만 남았다.':'수은에 빠졌다가 겨우 뭍을 붙잡았다. HP 1만 남았다.')}
      else if(state?.visible?.has?.(k(nx,ny))){burst(nx,ny,'#c0cdca',16,.75);floatText(nx,ny,`HP ${before}->1`,'#d6e2dd',10);addLog(`${e.name}이 수은에서 빠져나왔지만 HP 1만 남았다.`)}
      if(player){resolvePlayerLanding57(land.x,land.y,{cause:'mercury-rescue',hazard:false,resetVisual:true});if(consumeTurn&&!state.dead)globalThis.__MANRU_TURN_ENGINE__.advance({handled:true,committed:true,timeCost:1,reason:"resolveEntityHazard1005"}).value}else{OccupancyService.move(e,land.x,land.y)}
      return'rescued'
    }
    if(player){addLog('수은이 몸을 붙잡아 끌어내렸다. 붙잡을 뭍이 없다.');die('수은 침식')}else monsterHazardDeath(e,'mercury');
    return'dead'
  }
  if(kind==='void'){
    if(player&&consumeWard('void')){if(consumeTurn)globalThis.__MANRU_TURN_ENGINE__.advance({handled:true,committed:true,timeCost:1,reason:"resolveEntityHazard1005"}).value;return'ward'}
    if(player){addLog('발밑의 공간이 사라졌다. 되돌아올 바닥이 없다.');die('공허 추락')}else monsterHazardDeath(e,'void');
    return'dead'
  }
  if(player){addLog('용암에 발을 디디는 순간 몸이 불길에 삼켜졌다.');die('용암')}else monsterHazardDeath(e,'lava');
  return'dead'
}
function resolveStandingHazard1005(e=state?.player,cause='standing'){
  if(!state||state.dead||state.victory||!e||e.hp<=0)return false;const q=entityHazardCell1005(e);if(!q)return false;return resolveEntityHazard1005(e,q.t,q.x,q.y,null,{consumeTurn:false,standing:true,landingCause57:cause})||false
}
function resolveAllStandingHazards1005(cause='standing'){
  if(!state||state.victory)return[];const out=[];if(state.player&&!state.dead)out.push({entity:'player',result:resolveStandingHazard1005(state.player,cause)});if(state.dead)return out;
  for(const m of [...(state.monsters||[])])if(m.hp>0)out.push({entity:m.name||'monster',friendly:isPlayerAlly57(m),result:resolveStandingHazard1005(m,cause)});return out
}
function revalidateHazardAt1005(x,y,cause='terrain-mutation'){
  if(!state)return[];const entities=[];if(state.player?.x===x&&state.player?.y===y)entities.push(state.player);for(const m of state.monsters||[])if(m.hp>0&&monCovers(m,x,y)&&!entities.includes(m))entities.push(m);
  return entities.map(e=>({entity:entityIsPlayer(e)?'player':e.name||'monster',friendly:isPlayerAlly57(e),result:resolveStandingHazard1005(e,cause)}))
}
function collapsePaperAfterAction1005(){
  const h=hz(),turn=state.turn||0,agency=Number.isFinite(state.playerAgencyTurns57)?state.playerAgencyTurns57:0;
  for(const [kk,a] of Object.entries(h.armed)){
    if(a.kind!=='paper')continue;
    if(state.map?.[a.y]?.[a.x]!==TT.PAPER_BRIDGE){delete h.armed[kk];continue}
    // Old saves used world-turn deadlines. Migrate them conservatively: never collapse until the player gets one fresh real action.
    if(!Number.isFinite(a.collapseAgency57)){a.armedAgency57=agency;a.collapseAgency57=agency+1;a.migratedAgency57=true}
    if(agency<a.collapseAgency57)continue;
    const rr=RuntimeTerrainOwner.mutate(a.x,a.y,TT.WATER,{source:'paper-collapse1005'});if(!rr.ok)continue;
    if(branchLeafAt(a.x,a.y)){delete h.armed[kk];burst(a.x,a.y,'#8ead72',10,.6);addLog('잎이 물속으로 가라앉았다. 다시 떠오르지 않는다.');continue}
    h.collapsed[kk]={x:a.x,y:a.y,restoreTile:TT.PAPER_BRIDGE,baseTile:TT.WATER,restoreTurn:turn+10,kind:'paper',mutationVersion57:rr.version57};
    delete h.armed[kk];burst(a.x,a.y,'#86cbd1',15,.75);addLog(`종이 다리가 물속으로 주저앉았다. 10턴 뒤 다시 이어진다.`)
  }
}
function restoreFragiles(){const h=hz();for(const[kk,c]of Object.entries(h.collapsed)){if((state.turn||0)<c.restoreTurn)continue;if(!state.map?.[c.y]){delete h.collapsed[kk];continue}const current=state.map[c.y][c.x],version=state.terrainMutationVersion57?.[kk];if(current!==c.baseTile||(c.mutationVersion57!=null&&version!==c.mutationVersion57)){delete h.collapsed[kk];continue}const rr=RuntimeTerrainOwner.mutate(c.x,c.y,c.restoreTile,{source:`${c.kind}-restore1005`});if(rr.ok){if(c.restoreTile===TT.CRUMBLE){state.crumbleBase60=state.crumbleBase60||{};state.crumbleBase60[kk]=c.baseTile}burst(c.x,c.y,c.kind==='paper'?'#e4d5ac':'#bfa0d2',14,.7);if(state.visible?.has(kk)){toast(c.kind==='paper'?'종이 다리 복구':'붕괴 발판 복구');addLog(c.kind==='paper'?'젖은 종이가 다시 겹쳐지며 다리가 이어졌다.':'무너졌던 발판이 기묘하게 원래 자리로 돌아왔다.')}}delete h.collapsed[kk]}}
function wardCountdownLog(beforeD,beforeV){for(const [kind,b] of [['drown',beforeD],['void',beforeV]]){const r=remain(kind);if(b>r&&[5,3,2,1,0].includes(r)){const nm=kind==='drown'?'익사 면역':'공허 면역';addLog(r?`${nm} ${r}턴 남음.`:`${nm}이 끝났다.`);if(r<=3)toast(r?`${nm} ${r}턴`:`${nm} 종료`)}}}
function wardExpiry1005(beforeD,beforeV){
  if(!state||state.dead)return;const d=remain('drown'),v=remain('void'),t=state.map?.[state.player.y]?.[state.player.x];
  if(beforeD>0&&d===0&&t===TT.WATER)resolveStandingHazard1005(state.player,'ward-expiry');
  if(!state.dead&&beforeV>0&&v===0&&t===TT.VOID)resolveStandingHazard1005(state.player,'ward-expiry');
}
function rebalanceMonsterCrowding1027(){
  if(!state)return null;
  const live=(state.monsters||[]).filter(m=>m.hp>0),size=COLS*ROWS,roomIndex=new Int32Array(size);roomIndex.fill(-1);const rooms=(state.rooms||[]),areas=rooms.map(r=>r.w*r.h);
  for(let ri=0;ri<rooms.length;ri++){const r=rooms[ri];for(let y=Math.max(1,r.y);y<Math.min(ROWS-1,r.y+r.h);y++)for(let x=Math.max(1,r.x);x<Math.min(COLS-1,r.x+r.w);x++){const idx=y*COLS+x,old=roomIndex[idx];if(old<0||areas[ri]<areas[old])roomIndex[idx]=ri}}
  const contextCell=new Uint8Array(size);for(const f of state.featureRooms||[])if(/보스|최종|봉인|심부|성소|수문장|제단|고문서고/.test(f.name||''))for(let y=Math.max(1,f.y);y<Math.min(ROWS-1,f.y+f.h);y++)for(let x=Math.max(1,f.x);x<Math.min(COLS-1,f.x+f.w);x++)contextCell[y*COLS+x]=1;
  const denseRoom=new Uint8Array(rooms.length);for(let ri=0;ri<rooms.length;ri++)if(denseRoom1027(rooms[ri]))denseRoom[ri]=1;
  const occ=new Uint8Array(size),local=new Uint16Array(size),wide=new Uint16Array(size),roomCount=new Uint16Array(rooms.length),placed=[],moved=[],preserved=[],caps=latePackCaps1027(),rule=spawnRuleForFloor?.()||{safe:6};
  const capsAt=(x,y)=>{const idx=y*COLS+x,ri=roomIndex[idx],context=!!contextCell[idx],dense=ri>=0&&!!denseRoom[ri],roomCap=ri<0||areas[ri]>320?Infinity:(context?caps.context:(dense?caps.dense:caps.normal));return{ri,roomCap,localCap:context?caps.contextLocal:(dense?caps.denseLocal:caps.local),wideCap:context?caps.contextWide:(dense?caps.denseWide:caps.wide)}};
  const canAt=(m,x,y)=>{if(state.map[y]?.[x]===TT.STAIR)return false;for(const[ox,oy]of footprintOffsets(m)){const xx=x+ox,yy=y+oy;if(xx<1||yy<1||xx>=COLS-1||yy>=ROWS-1||occ[yy*COLS+xx]||(xx===state.player.x&&yy===state.player.y)||!PlacementService.terrainStandable(m,state.map[yy][xx]))return false}return true};
  const add=(m)=>{placed.push(m);for(const[ox,oy]of footprintOffsets(m)){const x=m.x+ox,y=m.y+oy;if(x>=0&&y>=0&&x<COLS&&y<ROWS)occ[y*COLS+x]=1}const ri=roomIndex[m.y*COLS+m.x];if(ri>=0)roomCount[ri]++;for(let y=Math.max(1,m.y-8);y<=Math.min(ROWS-2,m.y+8);y++)for(let x=Math.max(1,m.x-8);x<=Math.min(COLS-2,m.x+8);x++){const d=Math.max(Math.abs(m.x-x),Math.abs(m.y-y)),idx=y*COLS+x;if(d<=4)local[idx]++;wide[idx]++}};
  const acceptable=(m,x,y)=>{if(!canAt(m,x,y))return false;const idx=y*COLS+x,c=capsAt(x,y),d=Math.abs(x-state.player.x)+Math.abs(y-state.player.y);if(d<Math.max(5,rule.safe||5)||state.visible?.has(K1020(x,y)))return false;return(c.ri<0||roomCount[c.ri]<c.roomCap)&&local[idx]<c.localCap&&wide[idx]<c.wideCap};
  const bestCell=(m)=>{let best=null,bestScore=Infinity,bestTie=Infinity;for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++){if(!acceptable(m,x,y))continue;const idx=y*COLS+x,c=capsAt(x,y),d=Math.abs(x-state.player.x)+Math.abs(y-state.player.y),score=local[idx]*120+wide[idx]*40+(c.ri>=0&&Number.isFinite(c.roomCap)?roomCount[c.ri]*24:0)+Math.abs(d-20)*.04,tie=(y*COLS+x);if(score<bestScore||(score===bestScore&&tie<bestTie)){bestScore=score;bestTie=tie;best={x,y}}}return best};
  for(const m of live){
    if(fixedEncounterMonster1027(m)&&canAt(m,m.x,m.y)){add(m);preserved.push(m.name);continue}
    const idx=(m.y>=0&&m.y<ROWS&&m.x>=0&&m.x<COLS)?m.y*COLS+m.x:-1,c=idx>=0?capsAt(m.x,m.y):null,ok=idx>=0&&canAt(m,m.x,m.y)&&(c.ri<0||roomCount[c.ri]<c.roomCap)&&local[idx]<c.localCap&&wide[idx]<c.wideCap;
    if(!ok){const p=bestCell(m);if(p){moved.push({name:m.name,from:[m.x,m.y],to:[p.x,p.y]});m.x=p.x;m.y=p.y}}
    if(canAt(m,m.x,m.y))add(m)
  }
  let maxLocal=0,maxWide=0,maxRoomCompact=0;for(const m of placed){const idx=m.y*COLS+m.x;maxLocal=Math.max(maxLocal,local[idx]);maxWide=Math.max(maxWide,wide[idx]);const ri=roomIndex[idx];if(ri>=0&&areas[ri]<=320)maxRoomCompact=Math.max(maxRoomCompact,roomCount[ri])}
  state.monsters=placed;state.monsterCrowding1027={floor:state.floor,total:placed.length,moved:moved.length,maxLocal,maxWide,maxRoomCompact,overlaps:0,preserved};return state.monsterCrowding1027;
}
function chain47(mon,dmg,max=2){dmg=Math.max(0,Math.round(Number(dmg)||0));const arr=(state.monsters||[]).filter(m=>m!==mon&&isHostileTarget57(m)&&entityDistance57(m,mon)<=2).sort((a,b)=>entityDistance57(a,mon)-entityDistance57(b,mon)).slice(0,max);for(const m of arr){const dealtDamage=damageEntity(m,dmg, state.player);projectileFX(mon.x,mon.y,m.x,m.y,'#8ddcff');if(dealtDamage>0)floatText(m.x,m.y,`청뢰 -${dealtDamage}`,'#9de4ff',10,'shock');if(m.hp<=0)killMonster(m)}}
function moveTurnCost(destination=null){let cost=clamp(1/(playerCloak().moveSpeed||1),.72,1.15);for(const stage of MOVE_COST_STAGES55)cost=stage.run(cost);if(silkThreadAt54(state.player.x,state.player.y))cost+=.5;const cursed=globalThis.__MANRU_ITEM_IDENTITY991__?.cursePower?.('binding')||0;return clamp(applyPlayerDebuffActionCost('move',cost),.25,cursed>0?6:2.4)*(terrainBaseTile58(destination?.x??state.player.x,destination?.y??state.player.y)===TT.SHALLOW_WATER?1.5:1)}
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
function hazardTile(t){return t===TT.WATER?'water':t===TT.VOID?'void':t===TT.LAVA?'lava':t===TT.MERCURY?'mercury':null}
function nearestLandFor1005(e,x,y,prefer=null){
  const a=[];for(const[dx,dy]of DIRS4){const q={x:x+dx,y:y+dy};if(safeLandFor1005(e,q.x,q.y))a.push(q)}
  if(prefer){const p=a.find(q=>q.x===prefer.x&&q.y===prefer.y);if(p)return p}
  return a[0]||null
}
function consumeWard(kind){const p=state.player,r=p.relic;if(!r)return false;const ok=kind==='drown'?r.drownWard1005:r.voidWard1005;if(!ok)return false;const nm=r.name;p.relic=null;addLog(`${nm}이 치명적인 ${kind==='drown'?'익사':'공허 추락'}를 대신 받아냈다.`);wardPulse(kind,10);return true}
const SPECIAL_BASE_COUNTS={2:6,4:5,6:6,8:8,11:7,13:8,16:0,18:8,21:7,22:8,23:7,24:4};
function moveGroundItemStep57(it,toward){
  if(!state||!it||!toward)return false;
  const before=Math.abs(toward.x-it.x)+Math.abs(toward.y-it.y),candidates=[];
  for(const[dx,dy]of DIRS4){const x=it.x+dx,y=it.y+dy,d=Math.abs(toward.x-x)+Math.abs(toward.y-y);if(d>=before||!canMoveGroundItem57(it,x,y))continue;candidates.push({x,y,d,axis:Math.abs(toward.x-it.x)>=Math.abs(toward.y-it.y)?(dx?0:1):(dy?0:1)})}
  candidates.sort((a,b)=>a.d-b.d||a.axis-b.axis||a.y-b.y||a.x-b.x);const q=candidates[0];if(!q)return false;return PlacementService.moveItem(it,q.x,q.y);
}
function markCombatBlink57(entity){if(entity&&state)entity.combatBlinkTurn57=state.turn;}
const RUNTIME_ENTRY_REACTIVE57=new Set([TT.PAPER_BRIDGE,TT.CRUMBLE,TT.PORTAL,TT.RUMOR,TT.TRAP,TT.MIRROR,TT.SNARE,TT.GOLD,TT.KEY_TILE,TT.STAMINA_PAD,TT.FLOOR,TT.PAVILION].filter(v=>Number.isFinite(v)));
function combatFieldBlocksSight57(x,y){return !!state?.tempFields?.some(f=>['smoke','steam'].includes(f.kind)&&f.ttl>0&&(f.cells?f.cells.some(c=>c.x===x&&c.y===y):Math.abs(x-f.x)<=1&&Math.abs(y-f.y)<=1))}
function resolveMonsterAttackCount57(mon){return mon?.multiAttack?(mon.enrage&&mon.hp<=mon.maxHp*.5?3:2):1}
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
  const MANRU_TURN_ABORT=Symbol('MANRU_TURN_ABORT');
  const modal52=()=>!gameplayInputAllowed57();
  function onTypedGateOpened60(plan,keyId){if(state.floor!==24||keyId!=='brass'||plan?.kind!=='f24-grand-entrance'||!state.floor24)return false;state.floor24.chaseStarted=true;const g=(state.monsters||[]).find(m=>m.floor24Chaser57);if(g){g.dormant57=false;g.alerted=true;g.exitPressureSpeedBudget57=0;g.searchTurns=Math.max(g.searchTurns||0,18);g.lastSeenPosition={x:state.player.x,y:state.player.y,bornTurn:state.floorTurn||0}}addLog('대형 현관이 열리자 건물 깊숙한 곳에서 구미묘의 울음이 울렸다.');return true}
  const TARGET61={2:13,4:16,6:25,8:24,11:26,13:29,16:32,18:32,21:28,22:43,23:12,24:9};
function latePackCaps1027(){const f=state?.floor||1;if(f>=24)return{normal:4,dense:5,context:6,local:4,denseLocal:5,contextLocal:6,wide:7,denseWide:8,contextWide:9};if(f===23)return{normal:3,dense:4,context:5,local:3,denseLocal:4,contextLocal:5,wide:6,denseWide:7,contextWide:8};if(f===22)return{normal:3,dense:4,context:5,local:3,denseLocal:4,contextLocal:4,wide:5,denseWide:6,contextWide:7};if(f===21)return{normal:2,dense:3,context:4,local:2,denseLocal:3,contextLocal:4,wide:4,denseWide:5,contextWide:6};return{normal:2,dense:3,context:4,local:2,denseLocal:3,contextLocal:4,wide:4,denseWide:5,contextWide:6}}
function fixedEncounterMonster1027(m){return !!(m?.boss||m?.elite1023||m?.storyPhase992||m?.name==='여의 수룡'||m?.fixedEncounter1027)}
function equipmentOpeningBonus105(actor,target){const w=actor?.weapon||{};return (w.edgeBonus&&target?.maxHp>0&&target.hp/target.maxHp>=.75?4:0)+(w.breakPower&&target?.kind==='construct'?Math.max(1,w.breakPower):0)}
function routeTagAt(x,y){return(state.routeTags||[]).find(v=>v.x===x&&v.y===y)}
