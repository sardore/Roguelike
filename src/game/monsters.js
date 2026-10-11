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
 if(globalThis.__MANRU_RANDOM57__()>=.22)return null;const mon=scaledMonster(MONSTERS.find(m=>m.name==='지네'),branchCombatFloor105()),q=PlacementService.findMonster(mon,{placementMode:'local',origin:{x,y},radius:2,reachable:true,safe:true});if(!q)return null;Object.assign(mon,q);mon.alerted=true;mon.spawnProvenance57='jar-accident';if(!OccupancyService.addMonster(mon))return null;addLog('깨진 장독에서 지네가 튀어나왔다.');return mon;
}
function entityDistanceAt(entity,x,y,target){if(!entity||!target||![x,y,target.x,target.y].every(Number.isFinite))return Infinity;const a=entity===state?.player?FOOTPRINT_OFFSETS57.one:footprintOffsets(entity),b=target===state?.player?FOOTPRINT_OFFSETS57.one:footprintOffsets(target);let best=Infinity;for(const[ax,ay]of a)for(const[bx,by]of b)best=Math.min(best,Math.max(Math.abs(x+ax-target.x-bx),Math.abs(y+ay-target.y-by)));return best}
function ordinaryEnemyWeight(def){if(state.branchContext105||state.artifactDungeon46)return 1;return state.floor===1&&def.name==='시종'?.65:state.floor===2&&def.name==='객잔 경비병'?.8:1}
function ordinaryEnemyPick(defs){let roll=globalThis.__MANRU_RANDOM57__()*defs.reduce((n,d)=>n+ordinaryEnemyWeight(d),0);for(const d of defs){roll-=ordinaryEnemyWeight(d);if(roll<0)return d;}return defs.at(-1)}
function scaledMonster(def,combatFloor=branchCombatFloor105(),opts={}){
  // Fixed-stat species retain V18 stats, including summons; preview only skips loot creation.
  const within=(combatFloor-1)%5,depth=combatFloor>=6?Math.floor((combatFloor-6)/5)+1:0,scale=(1+within*.045)*(depth?1.25+depth*.075:1),atkScale=(1+within*.025)*(depth?1.15+depth*.05:1),defBonus=depth?Math.ceil(depth*.75):0,fixed=!!(def.fixedStats57||(def.boss&&(opts.debugBattle??state?.debugBattle57)));
  const mon={name:def.name,monsterSpecies105:monsterSpeciesName(def),hp:fixed?def.hp:Math.round(def.hp*scale),maxHp:fixed?def.hp:Math.round(def.hp*scale),atk:fixed?def.atk:Math.round(def.atk*atkScale),def:fixed?def.def:def.def+defBonus,eva:def.eva,xp:def.xp,color:def.color,shape:def.shape,kind:def.kind,ranged:def.ranged||false,range:def.range||6,reach:def.reach||1,weakened:0,alerted:false,hasSeenPlayer105:false,lostSight:0,...Object.fromEntries(Object.entries(def).filter(([k])=>!['min','max','hp','atk','def','eva','xp','color','shape','kind','name'].includes(k)))};
  mon.combatFloor105=combatFloor;mon.combatScalingRevision105=1;
  if(mon.equipmentActor105){mon.baseAtk=fixed?def.baseAtk:Math.round(def.baseAtk*atkScale);mon.baseDef=fixed?def.baseDef:def.baseDef+defBonus;}
  if(mon.bossPattern==='palaceKing105'&&opts.inventory!==false)palaceKingInventory105(mon);return globalThis.__MANRU_AI61__?.configure(mon)||mon;
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
 if(mon.martialActor105&&key==='stunned'&&value>0)dojoRememberHit105(mon,'control');mon[key]=value;return value;
}
function setMonsterWeakened(mon,turns){if(!mon||mon.statusImmune||mon.cloak?.statusImmune||turns<=0)return false;if(mon.martialActor105)dojoRememberHit105(mon,'control');mon.weakened=Math.max(mon.weakened||0,turns);mon.weakenedTurn57=state?.turn??0;return true}
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
function combatDepth(actor){return Math.max(1,Number(actor?.debugFloor57)||branchCombatFloor105()||state?.floor||1)}
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
 if(!player&&target.martialActor105&&ctx.projectile)dojoRememberHit105(target,'ranged');
 impact(target.x,target.y,'#d85f68',4);if(dmg>0&&!ctx.damageElement105)floatText(target.x,target.y,'-'+dmg,'#ff777f',13);addLog(`${state.debugBattle57&&mon.debugId57!=null?mon.debugSide57+mon.debugId57+' ':''}${mon.name} → ${state.debugBattle57&&target.debugId57!=null?target.debugSide57+target.debugId57+' ':''}${target.name}: ${dmg}`);
 if(dmg>0)applyMonsterAttackStatus57(mon,target,{damage:dmg,delivery:ctx.delivery});
 if(dmg>0&&combatDepth(mon)>=16&&mon.kind==='undead'&&['melee','ranged'].includes(ctx.delivery))globalThis.__MANRU_ITEM_IDENTITY991__?.hostileHit?.(target);
 if(player&&target.hp<=0)die(mon.name);
 return monsterAttackResultR(mon,ctx,{hit:true,damage:dmg,attackerAlive:mon.hp>0});
}
const BOSS_REWARD_STAGES={pre:[],post:[]};
function bossReward(mon){if(mon.bossPattern==='palaceKing105')return;if(mon.branchBoss105){if(state.branchTerrain105.frostReward105)return;for(const stage of BOSS_REWARD_STAGES.pre)stage.run(mon);return mountainBossReward105(mon);}if(state.floor===10&&mon.boss&&!state.passiveRecoveryUnlocked57){state.passiveRecoveryUnlocked57=true;state.lastDamageAgencyTurn57=state.playerAgencyTurns57||0;addLog('화공의 기운이 흩어진다. 숨을 고르면 상처가 빠르게 아물기 시작한다.')}
  for(const stage of BOSS_REWARD_STAGES.pre)stage.run(mon);
  state.bossDefeated=true;grantMartialManual(mon);addLog('구역 보스 격파.');
  if(state.floor===5){state.player.blinkLevel=2;addLog('점멸 습득: 2칸.')}if(state.floor===15){state.player.blinkLevel=3;addLog('점멸 강화: 3칸.')}if(state.floor===20){state.player.blinkLevel=4;addLog('점멸 강화: 4칸.')}
  dropBossConsumables55(mon);
  if(state.floor===25&&runState57()==='playing'){if(typeof globalThis.storyShowEndingChoice992==='function')globalThis.storyShowEndingChoice992();else showEnding()}
  for(const stage of BOSS_REWARD_STAGES.post)stage.run(mon)
}
function trainingActive(){return !!(state?.tutorialEntry60&&!state.tutorialEntry60.completed&&inTutorialEntry60(state.player.x,state.player.y))}
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
 const pressure=mineButton105(x,y);if(pressure&&!(mon?.prisoner105?.released&&pressure.prisonCell105===mon.prisoner105.cell))return false;
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
 if(palaceTideRisk105(mon,x,y,1))return false;
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
 if(I.type.startsWith('palace'))return palaceResolveIntent105(mon,I);
 if(I.type==='blackFrost105'){mountainFrostResolve105(mon,I);clearIntent(mon);return true}
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
 for(let cost=0;cost<=hearingCost;cost++)for(const m of contacts[cost]||[]){if(m.sleeping105&&m.doorSleep105)continue;if(modern&&m.guardHome57&&!monsterPatrolAllows(m,x,y,'patrol'))continue;if(!m.alerted){if(noiseBudget.newlyAlerted>=cap)continue;noiseBudget.newlyAlerted++;m.alerted=true}branchWake105(m,'소음');m.heardPosition={x,y,bornTurn:(state.floorTurn||0)+.5,intensity:Math.max(0,radius*sensitivity-cost/2)};m.searchTurns=Math.max(m.searchTurns||0,modern?Math.ceil(radius*2*sensitivity)+8:5);m.lostSight=0;count++}return count;
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
 if(isHostileTarget57(mon)&&playerConcealed58()&&!dojoMarkedPursuer105(mon)&&(!target||target===state.player))return false;
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
  for(const {x,y}of candidates.values()){if(x>0&&y>0&&x<COLS-1&&y<ROWS-1&&!OccupancyService.isOccupied(x,y)){const m=scaledMonster(clone(d),mon.debugFloor57||branchCombatFloor105());m.hp=Math.round(m.hp*.65);m.maxHp=m.hp;m.atk=Math.max(2,m.atk-2);m.x=x;m.y=y;m.spawnProvenance57='summon';adoptBossChild57(m,mon);if(resolved.fallback)m.summonFallback57=resolved.requested;if(PlacementService.monsterCanStand(m,x,y)&&OccupancyService.addMonster(m)){delete mon.lastSummonFailure57;playSummonArrival(mon,m);return m}}}
  mon.lastSummonFailure57={reason:'no-space',name,turn:state.floorTurn};return null
}
function handleBossPattern(mon,d,target=state.player){
    if(!combatTargetValid57(mon,target)&&!mon.intent54)return false;advanceBossClock54(mon);const p=target,turn=state.floorTurn;
    if(mon.bossPattern==='needle'&&!mon.arena54&&d>mon.range)return false;
    if(mon.storyPhase992!==1&&['needle','keeper','master'].includes(mon.bossPattern)){if(mon.bossPattern!=='master'&&!mon.arena54)prepareBossArena(mon);if(!mon.alerted&&!actorDetectedTarget57(mon,p,40))return true}
    if(mon.bound54){if(state.turn<mon.bound54.until)return true;mon.def=mon.bound54.def;delete mon.bound54;floatText(mon.x,mon.y,'철쇄 해방','#d6a97d',12)}
    if(mon.bossPattern==='needle'&&mon.needleGasShotReady54&&mon.intent54?.type==='sew')clearIntent(mon);
    if(mon.bossPattern==='palaceKing105')return palaceKingTurn105(mon,p);
    if(mon.intent54){if(state.turn<=(mon.intent54.armedPlayerTurn??state.turn))return true;return executeBossIntent(mon)}
    if(mon.skillSeal105>0)return false;
    if(p===state.player&&playerConcealed58())return mon.bossPattern==='blackFrost105';
    if(mon.bossPattern==='blackFrost105'){mountainFrostPattern105(mon,d,p);return true}
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
  if(schedule.act&&palaceTideResponse105(a)){finishAllyAction(a);continue;}
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
 if(combatTargetValid57(mon,player)&&(!playerConcealed58()||dojoMarkedPursuer105(mon))&&(dojoMarkedPursuer105(mon)||mon.persistentChase57&&(mon.hasSeenPlayer105||mon.alerted)))return player;
 const rules=visibilityStackRules(mon);if(!rules.length)return null;
 const previous=mon.specialOpponent105==='player'?player:mon.specialOpponent105?state.monsters.find(t=>t.combatantId54===mon.specialOpponent105):null,targets=[previous,...(detectPlayer?[player]:[])];
 for(const target of targets)if(target&&rules.some(rule=>visibilityStackTarget(mon,target,rule)))return target;
 return null;
}
function selectEnemyTarget(mon){
 const core=priorityCoreTarget(mon);if(core)return core;
 const p=state.player,validPlayer=combatTargetValid57(mon,p)&&(!playerConcealed58()||dojoMarkedPursuer105(mon)),detectPlayer=validPlayer&&playerDetectedBy(mon),revenge=retaliationTarget(mon),range=mon.ranged?(mon.range||6):(mon.reach||1);
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
 const b=prisoner.bounds,mine=mineState105(),walls=(mine?.walls||[]).filter(w=>w.prisonCell105===prisoner.cell),outside=()=>
  (mon.x<b.x||mon.y<b.y||mon.x>=b.x+b.w||mon.y>=b.y+b.h)&&!walls.some(w=>w.cells.some(c=>entityFootprintCells57(mon).some(q=>q.x===c.x&&q.y===c.y)));
 if(outside()){prisoner.pendingExit=false;return false;}
 const goals=walls.filter(w=>w.open).map(w=>mine.buttons.find(button=>button.prisonCell105===prisoner.cell&&button.prisonEntry105==='out'&&w.buttonIds.includes(button.id))).filter(Boolean).sort((a,c)=>entityDistance57(mon,a)-entityDistance57(mon,c));
 for(const goal of goals){const next=monsterPathStep(mon,goal,true);if(next&&moveMonsterStep(mon,next.x,next.y)){if(outside())prisoner.pendingExit=false;return true;}}
 return true;
}
function monsterTurn(){
  const phaseState=state,phaseMap=state.map,p=state.player;
  const combatFloor=branchCombatFloor105();state.intentBudget61=combatFloor>=21?4:combatFloor>=11?3:2;
  for(const m of state.monsters||[]){globalThis.__MANRU_AI61__?.configure(m)}
  OccupancyService.beginShared();
  try{
  dojoEscapeTick105();
  for(const mon of [...state.monsters]){
    if(state!==phaseState||state.map!==phaseMap)break;
    if(mon.revivalLives57&&(mon.revivePhase57==='corpse'||mon.revivePhase57==='reviving')){if(advanceMonsterRevival(mon))continue}
    if(mon.hp<=0||state.dead||!isHostileTarget57(mon)||mon.dormant57)continue;if(mon.martialActor105)tickMartialActor(mon);if(mon.combatFixture54){tickBossFixture(mon);continue}
    if(prisonContainedTurn(mon))continue;
    if(mountainMimicTurn105(mon))continue;
    const observedOpponent=selectEnemyTarget(mon),opponentDetected=observedOpponent&&actorDetectedTarget57(mon,observedOpponent,monsterSenseRadius(mon));let d=entityDistance57(mon,p);
    if(mon.sleeping105){if(mon.doorSleep105)continue;if(mon.hp<mon.maxHp||mon.alerted||(opponentDetected&&entityDistance57(mon,observedOpponent)<=1))branchWake105(mon,'접근');else continue;}
    if(playerConcealed58()&&(!observedOpponent||observedOpponent===p))clearPlayerTracking58(mon);
    if(dojoMarkedPursuer105(mon)){mon.alerted=true;mon.lastSeenPosition={...state.branchTerrain105.dojo.escape105.mark};mon.searchTurns=12;mon.lostSight=0;}
    if(mon.ambush&&mon.hidden===undefined)mon.hidden=monsterAmbushCanHide(mon);if(mon.hidden&&!monsterAmbushCanHide(mon)){mon.hidden=false;mon.alerted=true;playAmbushReveal57(mon,'terrain')}if(mon.stunned>0){mon.stunned--;continue}if(mon.hidden&&(!opponentDetected||entityDistance57(mon,observedOpponent)>3))continue;if(mon.hidden&&opponentDetected&&entityDistance57(mon,observedOpponent)<=3){mon.hidden=false;mon.alerted=true;playAmbushReveal57(mon,'proximity')}
    let sees=playerDetectedBy(mon);mon.gumihoRetreated57=0;
    if(!observedOpponent||observedOpponent===p)updateExitPressureTracking(mon,sees);
    if(sees){mon.hasSeenPlayer105=true;mon.alerted=true;mon.lastSeenPosition={x:p.x,y:p.y,bornTurn:state.floorTurn||0};mon.attackInvestigation57=null;mon.searchTurns=state.floor>=11?Math.max(mon.searchTurns||0,12):6;mon.lostSight=0}
    else if(mon.alerted){mon.searchTurns=Math.max(0,(mon.searchTurns??5)-1);mon.lostSight=(mon.lostSight||0)+1;if(mon.searchTurns===0&&!mon.boss&&!mon.persistentChase57){mon.alerted=false;mon.lastSeenPosition=null;mon.heardPosition=null;mon.attackInvestigation57=null}}
    if(!observedOpponent||observedOpponent===p)updateSummonerEngagement(mon,sees);
    const schedule57=monsterActionSchedule(mon);if(!schedule57.act)continue;if(palaceTideResponse105(mon))continue;if(prisonEscapeTurn(mon))continue;
    const target=selectEnemyTarget(mon);if(!target){mon.targetKind53=null;resolveMonsterTargetTurn57(mon,null,schedule57);continue}const playerTarget=target===p;mon.targetKind53=playerTarget?'player':(target?.retaliationMemory54?'memory':'monster');
    if(!playerTarget){resolveMonsterTargetTurn57(mon,target,schedule57);continue}
    if(mon.palaceLotus105){palaceLotusTurn105(mon,p);continue}if(mon.equipmentActor105)syncEquipmentActor105(mon);
    handleLosLostSummon(mon,sees,{target:p});
    if(!mon.martialActor105&&mon.weaponRecovery105>0&&!mon.intent54){mon.weaponRecovery105--;continue}
    if(mon.guardTerritory105&&!mon.alerted&&!sees){monsterIdleRecovery105(mon,null);continue;}
    if(mon.boss){if(handleBossPattern(mon,d))continue;d=entityDistance57(mon,p)}
    if(mon.martialActor105&&dojoMartialTurn105(mon,sees,d))continue;
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
  function normalizeAsuraAttack(m){if(!m||m.name!=='천수 아수라'||!state)return m;const d=MONSTERS.find(v=>v.name==='천수 아수라');if(!d)return m;const within=(state.floor-1)%5,depth=state.floor>=6?Math.floor((state.floor-6)/5)+1:0,cap=Math.round(d.atk*(1+within*.025)*(depth?1.15+depth*.05:1));if(Number.isFinite(m.atk)&&m.atk>cap)m.atk=cap;return m}
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
  const ASURA_HAZ=new Set([TT.WATER,TT.LAVA,TT.VOID,TT.MERCURY,TT.PAPER_BRIDGE,TT.CRUMBLE,TT.SNARE,TT.DRAWBRIDGE_DOWN,TT.DRAWBRIDGE_UP,TT.LOCKED_GATE]);
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
      add('frost','서리 폭쇄 · 빙창','霜','사거리 8칸 · 예고 1턴',`3×3 폭쇄와 직선 빙창을 번갈아 사용. 냉기 피해 ${mountainFrostDamage105(mon)}. 기본 공격은 하지 않는다.`);
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
  if(keep){const id=keep.summonContract105||`summon-${++q.serial}-${state.turn}`;Object.assign(keep,{summonContract105:id,summonPersistent105:true,summonExpire105:null});for(const key of ['allyExpireTurn47','ttl47','summonCost105','summonCommand105','summonTarget105','summonAnchor105'])delete keep[key];configureSummonBody105(keep);q.contracts[id]={persistent105:true,expires:null};if(books[0]&&!books[0].summonElement105&&SUMMON_RACES[keep.summonElement105])books[0].summonElement105=keep.summonElement105;for(const l of locations)if(l.pageKey&&l.world.monsters.includes(keep))state.branchWorld105.pages[l.pageKey]=branchEncodePage105(l.world);}
 }
 if(books.length)q.pictureCounterVersion105=1;
 const book=summonBook();
 // Preserve existing book contracts while normalizing old summon geometry once.
 if(!q.bookContractsVersion105){
  for(const l of summonContainers()){for(const mon of l.world.monsters||[])if(mon.summonOwner105==='player'){configureSummonBody105(mon);mon.summonBookId105=mon.summonBookId105||book?.summonBookId105||null;const contract=q.contracts[mon.summonContract105];if(contract)contract.bookId105=mon.summonBookId105;}if(l.pageKey)state.branchWorld105.pages[l.pageKey]=branchEncodePage105(l.world);}
  q.bookContractsVersion105=1;OccupancyService.endShared();
 }
 // Restore native plant bodies in contracts saved while plants were made mobile.
 if(q.plantBodyVersion105!==1){
  const definitions=summonDefinitions();
  for(const l of summonContainers()){let changed=false;for(const mon of l.world.monsters||[])if(mon.summonOwner105==='player'&&mon.kind==='plant'){
   const def=definitions.find(d=>d.name===monsterSpeciesName(mon));if(!def)continue;
   mon.fixed=!!def.fixed;if(def.immobile105)mon.immobile105=def.immobile105;else delete mon.immobile105;
   mon.summonForm105=mon.fixed?'fixed':'mobile';configureSummonBody105(mon);changed=true;
  }if(changed&&l.pageKey)state.branchWorld105.pages[l.pageKey]=branchEncodePage105(l.world);}
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
   if(location.pageKey===branchWorldKey105())continue;
   let changed=false;
   for(const mon of [...(location.world.monsters||[])]){
    if(!summonActive(mon)||!mon.summonParent105||mon.combatFixture54)continue;
    const id=mon.summonBookId105,count=retained.get(id)||0;
    if(count<summonChildLimit(id)){retained.set(id,count+1);continue;}
    if(location.current)removeAlly(mon);else location.world.monsters.splice(location.world.monsters.indexOf(mon),1);
    changed=true;
   }
   if(changed&&location.pageKey)state.branchWorld105.pages[location.pageKey]=branchEncodePage105(location.world);
  }
  q.descendantCap105=SUMMON_RULES.descendantCap;
 }
 return q;
}
function summonActive(mon){return !!mon&&mon.summonOwner105==='player'&&!mon.deathProcessed57&&(mon.hp>0||mon.revivePhase57==='corpse')&&(mon.summonPersistent105===true||Number.isFinite(mon.summonExpire105)&&mon.summonExpire105>state.turn);}
function summonContainers(){
 const locations=[{world:state,current:true},{world:state.artifactReturn46?.outer},{world:state.shopIntermission?.outer?.state}].filter(l=>l.world);
 for(const [pageKey,raw]of Object.entries(state.branchWorld105?.pages||{}))locations.push({world:branchDecodePage105(raw),pageKey});return locations;
}
function summonAll(){return summonContainers().filter(l=>!l.pageKey||l.pageKey!==branchWorldKey105()).flatMap(l=>l.world.monsters||[]).filter(summonActive);}
function summonRetire(keep=null,locations=summonContainers(),bookId=null){
 for(const l of locations){for(const mon of [...(l.world.monsters||[])])if(mon.summonOwner105==='player'&&mon!==keep&&(!bookId||mon.summonBookId105===bookId)){if(l.current)removeAlly(mon);else l.world.monsters.splice(l.world.monsters.indexOf(mon),1);}if(l.pageKey)state.branchWorld105.pages[l.pageKey]=branchEncodePage105(l.world);}
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
 for(let rank=1;rank<=4;rank++){const name=['','문하생','수련생','상급 무도가','사범급 무도가'][rank],stored=actors.find(e=>e.name===name&&e.actor.martialActor105&&e.actor.dojoRank105===rank),actor=stored?.actor||dojoCreateMartialist105(rank,-1,rank,false,5,{level:rank<=2?1:2});q.prototypes.push({name,actor:clone(actor)});}
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
function summonRecipes(level=summonState().level,floor=branchCombatFloor105(),book=summonBook()){
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
 const cells=[];for(const key of state.visible){const[x,y]=key.split(',').map(Number);if(entityDistance57({x,y},state.player)<=5&&citadelAccess105(x,y)&&![TT.PORTAL,TT.SWITCH,TT.STAIR,TT.VOID].includes(state.map[y]?.[x])&&recipes.some(r=>PlacementService.monsterCanStand(r.entry.preview,x,y,null,{ignore})))cells.push({x,y});}return cells;
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
 const recipe=summonRecipes(1,branchCombatFloor105(),book).find(r=>r.entry.name===name),cost=summonHpCost(null,book.upgrade);
 if(!recipe){toast('책에 끼운 그림과 부적의 종족을 확인하자.');return false;}
 if(state.turn<book.summonRecoveryUntil105){toast(`술서의 기운이 돌아오려면 ${book.summonRecoveryUntil105-state.turn}턴이 필요하다.`);return false;}
 if(state.player.hp<=cost){toast(`소환에는 HP ${cost}와 살아남을 체력이 필요하다.`);return false;}
 const replacing=new Set(state.monsters.filter(m=>m.summonOwner105==='player'&&m.summonBookId105===book.summonBookId105)),cells=summonCells([recipe],replacing).filter(p=>entityDistance57(p,state.player)<=2).sort((a,b)=>entityDistance57(a,state.player)-entityDistance57(b,state.player)),spot=cells.find(p=>PlacementService.monsterCanStand(recipe.entry.preview,p.x,p.y,null,{ignore:replacing}));
 if(!spot){toast('곁에 소환할 자리가 없다.');return false;}
 const act=playerAction57('summon',{uiOwner:'summonPanel105',skill:true,stunMessage:'몸이 굳어 소환하지 못했다.'});if(!act.ok)return false;
 const mon=summonNative(recipe.entry,recipe.floor),had=summonAll().some(m=>!m.summonParent105&&m.summonBookId105===book.summonBookId105);closeSummonPanel105();const snapshot=captureGenerationSnapshot();
 try{
  summonRetire(null,summonContainers(),book.summonBookId105);for(const [key,c]of Object.entries(q.contracts))if(c.bookId105===book.summonBookId105)delete q.contracts[key];const contract=`summon-${++q.serial}-${state.turn}`,id=`${contract}-0`;q.contracts[contract]={persistent105:true,expires:null,bookId105:book.summonBookId105};
  Object.assign(mon,spot,{faction57:'player',friendly47:true,allyId53:id,summonBookId105:book.summonBookId105,summonRoot105:id,summonContract105:contract,summonOwner105:'player',summonElement105:book.summonElement105,summonPersistent105:true,summonExpire105:null,summonPictureCount105:recipe.pictureCount105,summonCombatFloor105:recipe.floor,rewardPolicy57:{xp:false,drops:false,kills:false},spawnProvenance57:'player-summon',mimicDormant105:false,dormant57:false,alerted:true,hidden:false});delete mon.allyExpireTurn47;delete mon.ttl47;
  if(mon.martialActor105)mon.dojoActorId105=id;if(!OccupancyService.addMonster(mon))throw Error('소환체 배치 계약 불일치');
 }catch(error){restoreGenerationSnapshot(snapshot);console.error('summon placement rejected',error);toast('소환하지 못했다. 기존 소환체와 체력은 유지된다.');return false;}
 state.player.hp-=cost;q.activeBook105=book.summonBookId105;book.summonRecoveryUntil105=state.turn+summonRecovery105(book.upgrade);playSummonArrival(state.player,mon);addLog(`${had?'교체 소환':'소환'} · ${mon.name} 1마리 · HP ${cost} · ${recipe.floor}층 배율 · 기운 회복 ${summonRecovery105(book.upgrade)}턴`);closeSummonPanel105();commitPlayerAction57(act,1);updateAll();return true;
}
function summonInstallPicture(item,bookId){
 if(!state?.player||state.debugBattle57||!state.player.inventory.includes(item)||item.summonItem105!=='picture')return false;
 const q=summonState();normalizeSummonSpeciesItem105(item);const book=summonBook(bookId),entry=summonCatalog().find(e=>e.name===item.summonSpecies105);if(!book||!entry)return false;
 const before=book.summonPictures105[entry.name]?.count||0;if(!Number.isSafeInteger(before+1))return false;
 const act=playerAction57('item',{uiOwner:'summonPanel105',allowInventory:true});if(!act.ok)return false;if(!consumeItemQuantity(item,1))return false;
 book.summonPictures105[entry.name]={count:before+1,portrait:book.summonPictures105[entry.name]?.portrait||clone(item.summonPortrait105||entry.actor||entry.def)};q.activeBook105=book.summonBookId105;
 addLog(`${entry.name} 그림을 술서에 끼웠다 · ${before+1}장 · 추가 층배율 +${before}.`);closeSummonPanel105();closeInventory();commitPlayerAction57(act,1);updateAll();return true;
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
 q.activeBook105=book.summonBookId105;closeSummonPanel105();commitPlayerAction57(act,1);updateAll();return true;
}
function summonOpen(bookId=null,mode='summon',sourceItem=null){
 if(!gameplayUiOpen57())return false;const s=summonState(),book=summonBook(bookId);if(!book){toast('행낭에 소환술서가 없다.');return false;}if(mode==='summon'&&!SUMMON_RACES[book.summonElement105])return false;s.activeBook105=book.summonBookId105;
 const all=summonAll(),remaining=Math.max(0,book.summonRecoveryUntil105-state.turn),element=book.summonElement105,race=SUMMON_RACES[element],panel=summonPanel105(mode==='copy'?'그림에 기운을 더한다':'만령 소환술서'),body=panel.querySelector('.summonBody105');
 SUMMON_PANEL_SESSION105={run:state,bookId:book.summonBookId105,mode,sourceItem};panel.style.setProperty('--summon-ink105',SUMMON_COLORS[element]||'#9b8863');panel.querySelector('.summonEyebrow105').textContent=`萬靈 · ${race?race.name:'속성 미정'} · 강화 +${book.upgrade}`;
 const stats=document.createElement('div');stats.className='summonStats105';for(const [label,value]of [['소모 체력',`HP ${summonHpCost(null,book.upgrade)} / ${state.player.classId==='summoner'?'현재 '+state.player.hp:'최대 '+state.player.maxHp}`],['이 책의 영',all.find(m=>!m.summonParent105&&m.summonBookId105===book.summonBookId105)?.name||'없음'],['추가 소환',`${summonChildCount(book.summonBookId105,all)} / ${summonChildLimit(book.summonBookId105)}마리`],['이 술서의 기운',remaining?`${remaining}턴 남음`:'준비 완료']]){const d=document.createElement('div'),k=document.createElement('span'),v=document.createElement('b');k.textContent=label;v.textContent=value;v.className='summonReady105';d.append(k,v);stats.append(d);}body.append(stats);
 if(mode==='summon'){
  const actions=document.createElement('div');actions.className='summonActions105';for(const [label,action]of [['부적을 끼운다',()=>summonOpenMaterials(book.summonBookId105,'talisman')],['그림을 끼운다',()=>summonOpenMaterials(book.summonBookId105,'picture')]]){const b=document.createElement('button');b.textContent=label;b.onclick=action;actions.append(b);}body.append(actions);
 }
 const heading=document.createElement('p');heading.className='summonListTitle105';heading.textContent=mode==='copy'?'같은 속성의 끼운 그림 중 한 종류를 골라 한 장을 더한다.':race?`${race.name} · 끼운 그림에서 부를 영을 고른다.`:'부적을 끼워 소환할 종족을 정하자.';body.append(heading);
 const list=document.createElement('div');list.className='summonPictures105';body.append(list);
 const recipes=summonRecipes(1,branchCombatFloor105(),book);
 for(const r of recipes){
  const native=branchCombatFloor105(),disabled=mode==='copy'?!sourceItem||!state.player.inventory.includes(sourceItem)||summonTalismanElement105(sourceItem)!==element:!!remaining||state.player.hp<=summonHpCost(null,book.upgrade);
  const hint=mode==='copy'?`${r.pictureCount105}장 → ${r.pictureCount105+1}장 · 추가 층배율 +${r.pictureCount105}`:`그림 ${r.pictureCount105}장 · ${native} + ${r.pictureCount105-1} = ${r.floor}층 배율${remaining?' · 기운 회복 중':state.player.hp<=summonHpCost(null,book.upgrade)?' · 체력 부족':''}`;
  const b=summonChoice105(list,r.entry.name,hint,summonPictureItem(r.entry.name,r.entry.portrait105||r.entry.actor||r.entry.def,r.pictureCount105),()=>{if(SUMMON_PANEL_SESSION105?.run!==state)return;ActionDispatcher.dispatch({type:mode==='copy'?'SUMMON_TALISMAN105':'SUMMON_CAST105',args:mode==='copy'?[sourceItem,book.summonBookId105,r.entry.name]:[r.entry.name,book.summonBookId105]});},disabled);b.dataset.summonSpecies=r.entry.name;b.dataset.pictureCount=r.pictureCount105;b.dataset.pictureGrade=summonPictureGrade(r.pictureCount105);
 }
 if(!recipes.length){const empty=document.createElement('p');empty.className='summonEmpty105';empty.textContent=mode==='copy'?'이 종족의 끼운 그림이 없다. 부적은 소모되지 않는다.':race?'이 종족의 그림을 먼저 끼우자. 다른 종족의 그림도 책에 보관할 수 있다.':'그림은 부적의 속성과 관계없이 끼워 둘 수 있다.';list.append(empty);}
 const footer=document.createElement('footer');footer.className='summonFoot105';const note=document.createElement('p');note.textContent=mode==='copy'?'선택을 마치면 부적 1장만 소모한다. 취소하면 그대로 남는다.':`책마다 직접 소환 1마리 · 영의 추가 소환 최대 ${summonChildLimit(book.summonBookId105)}마리 · 지속시간 무제한 · 이 책으로 새 소환 성공 시 교체. 추가 그림은 다음 소환부터 적용. 같은 속성부적을 다시 끼우면 그림 복제. 기운 회복은 책마다 따로 기본 72턴. 강화 +${book.upgrade}: HP ${summonHpCost(null,book.upgrade)}, 기운 회복 ${summonRecovery105(book.upgrade)}턴.`;footer.append(note);body.append(footer);
 if(mode==='copy'){const back=document.createElement('button');back.textContent='취소 · 책으로';back.onclick=()=>summonOpen(book.summonBookId105);body.append(back);}return true;
}
function summonOpenMaterials(bookId,kind){
 if(!gameplayUiOpen57())return false;summonState();const book=summonBook(bookId);if(!book)return false;
 const panel=summonPanel105(kind==='picture'?'그림을 끼운다':'부적을 끼운다'),body=panel.querySelector('.summonBody105'),list=document.createElement('div');list.className='summonPictures105';body.append(list);SUMMON_PANEL_SESSION105={run:state,bookId,mode:kind};
 const items=state.player.inventory.filter(i=>kind==='picture'?i.summonItem105==='picture':!!summonTalismanElement105(i));
 for(const item of items){const element=summonTalismanElement105(item),same=element&&book.summonElement105===element;const b=summonChoice105(list,item.name,kind==='picture'?`보유 ${itemQuantity(item)}장 · 한 장을 끼운다`:`${SUMMON_RACES[element].name} · ${same?'끼운 그림 하나에 기운을 더한다':'책의 종족을 바꾼다'} · 1장 소모`,item,()=>{if(SUMMON_PANEL_SESSION105?.run!==state)return;ActionDispatcher.dispatch({type:kind==='picture'?'SUMMON_PICTURE105':'SUMMON_TALISMAN105',args:[item,bookId]});});b.dataset.summonMaterial=kind;b.dataset.summonMaterialName=item.name;}
 if(!items.length){const empty=document.createElement('p');empty.className='summonEmpty105';empty.textContent=kind==='picture'?`행낭에 그림이 없다. 술서를 지니고 같은 적을 기본 ${SUMMON_RULES.pictureKills}회, 테마 후반 일반 적은 ${SUMMON_RULES.latePictureKills}회 처치하자.`:'행낭에 끼울 속성부적이 없다.';list.append(empty);}const back=document.createElement('button');back.textContent='책으로 돌아간다';back.onclick=()=>summonOpen(bookId);body.append(back);return true;
}
function summonUse(item,idx){
 if(item.summonItem105==='book'){summonState();return summonOpen(item.summonBookId105);}
 if(item.summonItem105!=='picture')return false;summonState();const books=state.player.inventory.filter(i=>i.summonItem105==='book');if(!books.length){toast('그림을 끼울 소환술서가 없다.');return false;}
 if(books.length===1)return summonInstallPicture(item,books[0].summonBookId105);
 const panel=summonPanel105('그림을 끼울 술서를 고른다'),body=panel.querySelector('.summonBody105');for(const book of books)summonChoice105(body,`${book.name} +${book.upgrade}`,SUMMON_RACES[book.summonElement105]?.name||'속성 미정',book,()=>ActionDispatcher.dispatch({type:'SUMMON_PICTURE105',args:[item,book.summonBookId105]}));return true;
}
function summonShortcutBooks(){if(!state?.player)return [];summonState();return state.player.inventory.filter(i=>i.summonItem105==='book').sort((a,b)=>b.upgrade-a.upgrade||a.summonBookId105.localeCompare(b.summonBookId105,undefined,{numeric:true}));}
