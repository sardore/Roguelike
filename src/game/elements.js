/* Element reactions: element damage and guards, element fields, material/terrain reactions (freeze, thaw, steam,
   ignition, combustion, shock), element contact and its effects. The set and its dependencies: docs/ELEMENTS.md. */
function terrainReactions105(){
 const r=state.terrainReactions105||(state.terrainReactions105=newTerrainReactions105());r.burning||={};r.unlit||={};
 // Migrate old decorative/ember records exactly once into the ordinary item container.
 if(r.char){state.items||=[];for(const c of Object.values(r.char)){if(!Number.isInteger(c.x)||!Number.isInteger(c.y)||state.map?.[c.y]?.[c.x]==null||c.remaining===0)continue;
  const item={...clone(foodDef('검게 탄 숯')),x:c.x,y:c.y,count:1};
  if(c.remaining>0){item.charcoalBurn105={remaining:Math.min(2,c.remaining),lit:!!c.lit,born:c.born??state.turn,source:c.source||{sourceFaction:'neutral',credit:null}};if(!c.lit)coolCharcoal105(item)}state.items.push(item);
 }delete r.char;r.version=2}return r;
}
function elementCells105(x,y,radius=0,cells=null){
 const result=[],seen=new Set(),candidates=cells??Array.from({length:radius*2+1},(_,i)=>Array.from({length:radius*2+1},(_,j)=>({x:x+j-radius,y:y+i-radius}))).flat();
 for(const q of candidates){if(!Number.isInteger(q.x)||!Number.isInteger(q.y)||q.x<0||q.y<0||q.x>=COLS||q.y>=ROWS)continue;const key=k(q.x,q.y);if(seen.has(key))continue;if(!cells&&(q.x!==x||q.y!==y)&&!lineClear(x,y,q.x,q.y))continue;seen.add(key);result.push({x:q.x,y:q.y})}return result;
}
function coolCharcoal105(item){
 const remaining=item.charcoalBurn105?.remaining??2;
 if(remaining>=2)delete item.charcoalBurn105;else item.charcoalBurn105={remaining,lit:false};
}
function dropBurntCharcoal105(x,y){
 // Spent material is a collectible item, never a fresh autonomous fire source.
 const item={...clone(foodDef('검게 탄 숯')),x,y,count:1};state.items.push(item);return item;
}
  function addElemField74(kind,x,y,ttl,damage=3){const cells=elementCells105(x,y,1);emitElementContact105(kind,cells,effectSource57(state.player));state.elementFields74=state.elementFields74.filter(f=>!(f.kind===kind&&f.x===x&&f.y===y));state.elementFields74.push({kind,x,y,ttl,damage:Math.max(1,Math.round(damage)),cells,bornTurn:state.turn+1,...effectSource57(state.player)})}
function elementMaterial105(t,kind,x,y){
 if(kind==='wood'&&t===TT.WOOD_FLOOR&&state.branchContext105?.id==='palace'&&state.branchTerrain105?.palace105?.materials?.[k(x,y)]===t)return true;
 if(t===TT.WALL&&kind==='structural-stone')return true;
 if(t===TT.WALL)return kind==='wood'&&Number.isInteger(x)&&Number.isInteger(y)&&wallMaterial105(x,y)==='wood';
 return t!=null&&ELEMENT_MATERIALS105[kind]?.some(name=>TT[name]===t);
}
function weaponElement105(w=state?.player?.weapon){return w?.elementBrand74||({ember_axe:'fire',lava_bow:'fire',water_crossbow:'water',thunder_spear:'shock',earth_gauntlet:'earth'}[w?.artifactId46])||null}
function summonTalismanElement105(item){return item?.type==='talisman'&&globalThis.__MANRU_TALISMAN_PUBLIC__?.known(item)&&itemQuantity(item)>0&&SUMMON_RACES[item.element74]?item.element74:null;}
function wallMaterial105(x,y,world=state){
 return authoredWoodWall(x,y,world)&&world.terrainReactions105?.wallMaterials105?.cells?.[k(x,y)]==='wood'&&!protectedProp105(x,y,world)?'wood':'stone';
}
function isWaterTile105(tile){return tile===TT.WATER||tile===TT.SHALLOW_WATER;}
function elementalStructureAt105(x,y){
 const object=mineState()?.carts.find(c=>c.alive&&c.x===x&&c.y===y&&c.material105);
 return object?{type:'mine-structure',object,material:object.material105}:null;
}
function destroyElementStructure105(target,elem){
 return !!(target?.object?.alive&&elementAffectsMaterial105(elem,target.material)&&destroyMineStructure(target.object,elem));
}
// Element contacts belong to world geometry, not to the identity of the attacker.
// Producers supply a frozen footprint; consumers decide by material/state only.
const ELEMENT_MATERIALS105=Object.freeze({
 wood:'DOOR OPEN_DOOR PAPER_BRIDGE TABLE BENCH CRATE RACK LOW_FENCE SCREEN BED RUMOR_BED BOOK_STACK RUMOR_ARCHIVE_PILE RUMOR_SILK_DIVAN RUMOR_INVESTIGATION_BOARD RUMOR_SMUGGLER_BUNDLE RUMOR_WEAPON_RACK RUMOR_CHARRED_COUNTER RUMOR_MED_CABINET GARDEN_TREE PEACH_TREE BAMBOO HEDGE'.split(' '),
 stone:'STONE_PILLAR STATUE ROCK JAR RUMOR_RITUAL_OBELISK'.split(' '),
 'structural-stone':['WALL'],
 metal:['LOCKED_GATE'],
 light:'LANTERN_POST GOLD_LAMP BRAZIER COOKPOT INCENSE_STAND'.split(' ')
});
function elementAffectsMaterial105(elem,material){return elem==='earth'&&material==='stone'||elem==='fire'&&material==='wood';}
function newTerrainReactions105(){return{version:2,burning:{},unlit:{},revision:0,lastTick:null}}
function touchElementTerrain105(x,y){const r=terrainReactions105();r.revision=(r.revision||0)+1;branchInvalidateTerrain(state.map,x,y)}
function elementBreakFx105(x,y,kind){
 if(!state.visible?.has(k(x,y)))return;
 (FX.terrainReactions105||=([])).push({x,y,kind,map:state.map,start:performance.now(),life:kind==='earth'?850:1100});if(FX.terrainReactions105.length>96)FX.terrainReactions105.splice(0,FX.terrainReactions105.length-96);
 burst(x,y,kind==='earth'?'#a67847':'#342820',kind==='earth'?20:12,kind==='earth'?1.05:.6);
}
function igniteCharcoal105(item,source={}){
 if(!state.items.includes(item)||item.charcoalBurn105?.lit)return false;
 const remaining=item.charcoalBurn105?.remaining??2;if(remaining<=0)return false;
 // One piece burns; the rest remain normal, collectible charcoal of the same type.
 if(itemQuantity(item)>1){const piece=structuredClone(item);piece.count=1;item.count--;item=piece;state.items.push(item)}
 item.charcoalBurn105={born:state.turn,remaining,lit:true,source:{sourceFaction:source.sourceFaction||'neutral',credit:source.credit||null}};return true;
}
function destroyElementProp105(x,y,elem){
 const t=state.map[y]?.[x];if(protectedProp105(x,y)||!elementMaterial105(t,elem==='fire'?'wood':'stone',x,y))return false;
 if(t===TT.PAPER_BRIDGE){const ok=globalThis.__MANRU_HAZARD_CORE__?.collapseAt(x,y,'paper');if(ok){delete terrainReactions105().burning[k(x,y)];touchElementTerrain105(x,y)}return !!ok}
 if(t===TT.DOOR||t===TT.OPEN_DOOR)branchWarningDoor(x,y);
 if(state.terrainAttachment58?.[k(x,y)]==='secret-wall'){
  if(!globalThis.__MANRU_RUMOR_SPACES1030__?.openEntranceAt?.(x,y,t,null)?.result)return false;
 }else if(t===TT.JAR){if(!destroyJar57(x,y,{forced:true,source:elem}).ok)return false}
 else{const palace=state.branchContext105?.id==='palace'?state.branchTerrain105?.palace105:null;if(palace?.materials?.[k(x,y)]===t)delete palace.materials[k(x,y)];const base=t===TT.WALL?TT.FLOOR:palace?.floors?.[k(x,y)]!=null?palaceWaterTile(x,y):furnitureFloor57(x,y),r=RuntimeTerrainOwner.mutate(x,y,base,{source:'element-contact:'+elem});if(!r.ok)return false;releaseTerrainUnderlay58(x,y,base)}
 const key=k(x,y),r=terrainReactions105();delete r.burning[key];if(state.branchTerrain105?.props)delete state.branchTerrain105.props[key];if(state.branchTerrain105?.palace105?.props)delete state.branchTerrain105.palace105.props[key];state.decor=(state.decor||[]).filter(d=>!(d.x===x&&d.y===y&&d.connected81&&String(d.kind).endsWith('canopy')));if(elem==='fire')dropBurntCharcoal105(x,y);touchElementTerrain105(x,y);elementBreakFx105(x,y,elem);alertNearby(x,y,elem==='earth'?8:4);return true;
}
const COMBUSTION_RULES105=Object.freeze({damage:3});
function combustionContact105(entity,elem,source={}, {floorDamage=0}={}){
 if(!entity||entity.hp<=0)return false;
 if(elem==='water'||elem==='ice'){const hot=!!entity.combustion105||!!entity.plantBurn105||entity.burn74>0;delete entity.combustion105;delete entity.plantBurn105;entity.burn74=0;return hot}
 if(elem!=='fire'||entityElementGuard57(entity,'fire')||entity.lava||entity.fireTrail)return false;
 const old=entity.combustion105,oil=entityFootprintCells57(entity).some(q=>terrainReactions105().spills?.[k(q.x,q.y)]?.kind==='oil');
 entity.combustion105={remaining:Math.max(old?.remaining||0,oil?5:3),born:old?.born??state.turn,refreshed:state.turn,lastTick:old?.lastTick??null,floorDamage105:Math.max(floorDamage,old?.floorDamageTurn105===state.turn?old.floorDamage105||0:0),floorDamageTurn105:state.turn,source:source.sourceFaction?{sourceFaction:source.sourceFaction,credit:source.credit||null}:(old?.source||{sourceFaction:'neutral',credit:null})};entity.burn74=0;delete entity.plantBurn105;return !old;
}
function steamCell105(x,y){
 const old=state.tempFields.find(f=>f.kind==='steam'&&f.x===x&&f.y===y);
 if(old){old.ttl=Math.max(old.ttl,2);old.bornTurn=state.turn;return}
 state.tempFields.push({kind:'steam',x,y,cells:[{x,y}],ttl:2,bornTurn:state.turn,sourceFaction:'neutral'});
}
function conductShock105(cells,base,source={},excluded=null){
 const queue=[],distance=new Map();for(const q of cells)if([TT.SHALLOW_WATER,TT.WATER,TT.MERCURY].includes(state.map[q.y]?.[q.x])){queue.push({...q,d:0});distance.set(k(q.x,q.y),0)}
 for(let i=0;i<queue.length;i++){const q=queue[i];if(q.d>=3)continue;for(const[dx,dy]of DIRS4){const x=q.x+dx,y=q.y+dy,key=k(x,y);if(distance.has(key)||![TT.SHALLOW_WATER,TT.WATER,TT.MERCURY].includes(state.map[y]?.[x]))continue;distance.set(key,q.d+1);queue.push({x,y,d:q.d+1})}}
 const direct=new Set(cells.map(q=>k(q.x,q.y))),targets=[state.player,...state.monsters].filter(e=>e&&e.hp>0&&e!==excluded&&!e.flying&&entityFootprintCells57(e).some(q=>distance.has(k(q.x,q.y)))&&!entityFootprintCells57(e).some(q=>direct.has(k(q.x,q.y)))).sort((a,b)=>Math.min(...entityFootprintCells57(a).map(q=>distance.get(k(q.x,q.y))??99))-Math.min(...entityFootprintCells57(b).map(q=>distance.get(k(q.x,q.y))??99))).slice(0,3);
 let damaged=0;for(const e of targets){const q=entityFootprintCells57(e).find(q=>distance.has(k(q.x,q.y))),ratio=state.map[q.y][q.x]===TT.MERCURY?.5:.35;const result=resolveElementDamage57(e,'shock',Math.max(1,Math.round(base*ratio)),{contactHandled105:true,effect:{...source,friendlyFire:true},source:'액체 전도',conduction105:true,color:'#d9b95c'});if(result.damage>0)damaged++;elementAttackFx105('shock',[q],cells[0]);}return damaged;
}
function revealEnvironmentalClue105(x,y,elem){
 const t=state.map[y]?.[x];if(t!==TT.SECRET_DOOR&&state.terrainAttachment58?.[k(x,y)]!=='secret-wall')return;
 const r=terrainReactions105();r.clues||={};r.clues[k(x,y)]={x,y,elem};if(state.visible.has(k(x,y)))addLog(elem==='water'?'벽 틈으로 물이 스며들며 가느다란 문 윤곽을 남겼다.':'벽 틈에서 연기와 바람이 새어 나온다.');
}
const ELEMENT_FX_COLORS105={fire:'#f18a32',water:'#42bfdb',ice:'#83d7eb',shock:'#edc451',earth:'#bb824c',grass:'#8abc4b',holy:'#e6bd68'};
function elementAttackFx105(elem,cells,origin=null){
 if(!ELEMENT_FX_COLORS105[elem]||!state)return;const visible=elementCells105(0,0,0,cells).filter(q=>state.visible.has(k(q.x,q.y)));if(!visible.length)return;
 const events=FX.elementAttacks105||(FX.elementAttacks105=[]);events.push({elem,cells:visible.slice(0,81),origin:origin?{x:origin.x,y:origin.y}:visible[0],start:performance.now(),life:880,map:state.map});if(events.length>24)events.splice(0,events.length-24);
}
function freezeWater105(x,y){
 const prior=state.tempTerrain74?.find(t=>t.x===x&&t.y===y),waterTimer=prior?.tile===TT.WATER?prior:null;
 if(waterTimer)state.tempTerrain74=state.tempTerrain74.filter(t=>t!==waterTimer);
 if(!RuntimeTerrainOwner.temporary(x,y,TT.ICE,5,'frozen-water105',{allowedOld:[TT.SHALLOW_WATER,TT.WATER,TT.ICE],source:'ice-contact'})){if(waterTimer)state.tempTerrain74.push(waterTimer);return false}
 const record=state.tempTerrain74.find(t=>t.x===x&&t.y===y);record.bornTurn105=state.turn;if(waterTimer)record.waterRestore105=waterTimer;return true;
}
function thawWater105(x,y){
 const record=state.tempTerrain74?.find(t=>t.x===x&&t.y===y&&t.kind==='frozen-water105');
 if(!record||state.map[y]?.[x]!==TT.ICE)return false;
 const result=RuntimeTerrainOwner.mutate(x,y,record.old,{source:'ice-thaw'});if(!result.ok)return false;
 state.tempTerrain74=state.tempTerrain74.filter(t=>t!==record);if(record.waterRestore105)state.tempTerrain74.push({...record.waterRestore105,version57:result.version57});return true;
}
function emitElementContact105(elem,cells,source={},contact={}){
 if(!state?.map||!['fire','water','earth','ice','shock','grass','holy'].includes(elem))return 0;
 const footprint=elementCells105(0,0,0,cells),r=terrainReactions105(),keys=new Set(footprint.map(q=>k(q.x,q.y)));let changed=0,melted=0;
 // Water trims actual fire footprints, including fields whose origin lies outside the water.
 if(elem==='fire')for(const item of state.items||[])if(item.name==='신선한 생선 살'&&keys.has(k(item.x,item.y))){const {x,y}=item,count=item.count||1;delete item.raw;delete item.naturalOnly57;Object.assign(item,clone(foodDef('구운 생선 살')),{x,y,count});if(state.visible?.has(k(x,y)))addLog('불기운이 닿은 생선 살이 노릇하게 익었다.')}
 const steamCells=[];if(elem==='water')for(const name of ['tempFields','elementFields74','legendFireFields47']){
  state[name]=(state[name]||[]).filter(f=>{if(name!=='legendFireFields47'&&f.kind!=='fire')return true;
   const before=f.cells??elementCells105(f.x,f.y,name==='legendFireFields47'?0:1);for(const q of before)if(keys.has(k(q.x,q.y)))steamCells.push(q);f.cells=before.filter(q=>!keys.has(k(q.x,q.y)));return f.cells.length>0;
  });
 }
 for(const q of steamCells)steamCell105(q.x,q.y);
 for(const {x,y} of footprint){const key=k(x,y),t=state.map[y]?.[x];
  if(elem==='ice'&&(isWaterTile105(t)||t===TT.ICE)&&freezeWater105(x,y)){changed++;if(t===TT.WATER&&state.visible?.has(key))burst(x,y,'#75c8dc',8,.4)}
  if((elem==='fire'||elem==='earth')&&t===TT.ICE&&thawWater105(x,y)){changed++;melted++;if(state.visible?.has(key))burst(x,y,'#599ba7',8,.4)}
  if(elem==='earth'&&t===TT.ICE){elementBreakFx105(x,y,'earth');alertNearby(x,y,3)}
  if(elem==='fire'||elem==='water')revealEnvironmentalClue105(x,y,elem);
  if(elem==='water'&&t===TT.PAPER_BRIDGE)globalThis.__MANRU_HAZARD_CORE__?.armFragile(x,y,t,{cause:'water-contact'});
  const spill=r.spills?.[key];if(elem==='water'&&spill&&spill.kind!=='water')delete r.spills[key];
  if(elem==='fire'&&spill&&['oil','wine'].includes(spill.kind)){delete r.spills[key];addField('fire',x,y,4,[{x,y}],{...source,friendlyFire:true})}
  const coals=(state.items||[]).filter(i=>i.x===x&&i.y===y&&(i.foodKind==='charcoal'||i.name==='검게 탄 숯'));
  if(elem==='fire'&&!contact.propagation&&!coals.some(i=>i.charcoalBurn105?.lit)){const item=coals.find(i=>(i.charcoalBurn105?.remaining??2)>0);if(item&&igniteCharcoal105(item,source))changed++}
  if(elem==='water')for(const item of coals)if(item.charcoalBurn105?.lit){coolCharcoal105(item);changed++;if(state.visible?.has(key))burst(x,y,'#7caaa6',8,.45)}
  if(elem==='fire'&&elementMaterial105(t,'wood',x,y)&&!protectedProp105(x,y)&&!r.burning[key]){r.burning[key]={x,y,tile:t,age:0,born:state.turn,source:{sourceFaction:source.sourceFaction||'neutral',credit:source.credit||null}};touchElementTerrain105(x,y);changed++}
  if(elem==='water'&&r.burning[key]){steamCell105(x,y);delete r.burning[key];touchElementTerrain105(x,y);if(state.visible?.has(key))burst(x,y,'#7caaa6',8,.45);changed++}
  if(elem==='earth'&&elementMaterial105(t,'stone')&&destroyElementProp105(x,y,elem))changed++;
  const structure=elementalStructureAt105(x,y);
  if(structure&&elem==='earth'&&destroyElementStructure105(structure,elem))changed++;
  if(structure&&elem==='fire'&&elementAffectsMaterial105(elem,structure.material)&&!structure.object.burning105){structure.object.burning105={age:0,born:state.turn,source:{sourceFaction:source.sourceFaction||'neutral',credit:source.credit||null}};changed++;}
  if(structure&&['water','ice'].includes(elem)&&structure.object.burning105){delete structure.object.burning105;steamCell105(x,y);changed++;}

  if((elem==='fire'||elem==='water')&&lightAt(x,y)){
   const lit=elem==='fire',mine=(state.branchTerrain105?.mine105?.lanterns||[]).find(l=>l.x===x&&l.y===y),was=mine?!!mine.lit:!r.unlit[key];
   if(lit)delete r.unlit[key];else r.unlit[key]=true;if(mine){mine.lit=lit;mine.lastElement105=elem;mine.lightChangedAt105=state.turn;}
   if(was!==lit){changed++;touchElementTerrain105(x,y);if(state.visible?.has(key))burst(x,y,lit?'#ef923d':'#6eaaa8',10,.55)}
  }
 }
 for(const entity of [state.player,...state.monsters])if(entity?.hp>0&&!(contact.ground&&entity.flying)&&entityFootprintCells57(entity).some(q=>keys.has(k(q.x,q.y)))){if(combustionContact105(entity,elem,source))changed++}
 if(elem==='shock'&&!contact.noConduct)conductShock105(footprint,contact.baseDamage||source.baseDamage105||4,source,contact.directTarget);
 if(changed){VisibilityService.compute();if(footprint.some(q=>state.visible?.has(k(q.x,q.y))))addLog(elem==='ice'?'냉기가 닿은 물이 얼어붙었다.':melted?'열기에 얼음이 녹아 물로 돌아갔다.':elem==='earth'?'대지의 충격에 석재물이 갈색 돌가루와 파편으로 부서졌다.':elem==='water'?'물기운이 닿은 불길과 불씨가 꺼졌다.':'불씨가 가연물에 옮겨붙었다.')}return changed;
}
function tickTerrainReactions105(){
 if(!state?.map)return;const r=terrainReactions105();if(r.lastTick===state.turn)return;r.lastTick=state.turn;
 const embers=(state.items||[]).filter(i=>i.charcoalBurn105?.lit&&state.turn>i.charcoalBurn105.born);
 // Snapshot first: a newly ignited neighbour cannot spread again in this turn.
 const hot=[];for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(state.map[y][x]===TT.LAVA){hot.push({x,y});for(const[dx,dy]of DIRS4)if(elementMaterial105(state.map[y+dy]?.[x+dx],'wood',x+dx,y+dy))hot.push({x:x+dx,y:y+dy})}if(hot.length)emitElementContact105('fire',hot,{}, {propagation:true});
 for(const e of [state.player,...state.monsters]){if(e.plantBurn105||e.burn74>0){const old=e.plantBurn105;combustionContact105(e,'fire',old?.source||{});if(e.combustion105)e.combustion105.born=state.turn}environmentStanding105(e)}
 const active=Object.values(r.burning);for(const f of active){const key=k(f.x,f.y);if(state.map[f.y]?.[f.x]!==f.tile){delete r.burning[key];touchElementTerrain105(f.x,f.y);continue}if(state.turn<=f.born)continue;
  f.age++;
  const adjacent=DIRS4.map(([dx,dy])=>({x:f.x+dx,y:f.y+dy}));
  emitElementContact105('fire',[{x:f.x,y:f.y},...adjacent],f.source,{propagation:true});
  if(f.age>=3)destroyElementProp105(f.x,f.y,'fire');
 }
 for(const item of embers){const burn=item.charcoalBurn105;if(!state.items.includes(item)||!burn?.lit||state.turn<=burn.born)continue;
  emitElementContact105('fire',[{x:item.x,y:item.y},...DIRS4.map(([dx,dy])=>({x:item.x+dx,y:item.y+dy}))],burn.source,{propagation:true});
  if(--burn.remaining<=0)consumeItemQuantity(item,1,state.items);
 }
 for(const e of [state.player,...state.monsters]){const b=e.combustion105;if(e.hp<=0||!b||state.turn<=b.born||b.lastTick===state.turn)continue;b.lastTick=state.turn;
  const floorDamage=b.floorDamageTurn105===state.turn?b.floorDamage105||0:0;resolveElementDamage57(e,'fire',floorDamage||COMBUSTION_RULES105.damage,{contactHandled105:true,effect:{...b.source,friendlyFire:true},source:floorDamage?'불바닥':'연소',color:'#ee812b'});if(b.refreshed!==state.turn&&--b.remaining<=0)delete e.combustion105;
 }
 for(const[key,spill]of Object.entries(r.spills||{}))if(state.turn>spill.born&&--spill.ttl<=0)delete r.spills[key];
}
function elementalWorldTarget105(x,y){const t=state?.map?.[y]?.[x],elem=weaponElement105(),structure=elementalStructureAt105(x,y);return !!(elem&&structure&&elementAffectsMaterial105(elem,structure.material))|| t===TT.JAR||(elem==='shock'&&[TT.SHALLOW_WATER,TT.WATER,TT.MERCURY].includes(t))||(elem==='ice'&&(isWaterTile105(t)||t===TT.ICE))||(elem==='fire'&&t===TT.ICE)||!!(elem&&(elementMaterial105(t,'wood',x,y)||elementMaterial105(t,'stone')||lightAt(x,y)||terrainReactions105().burning[k(x,y)]||(['fire','water'].includes(elem)&&((state.items||[]).some(i=>i.x===x&&i.y===y&&(i.foodKind==='charcoal'||i.name==='검게 탄 숯'))))))}
function applyElementField57(field,elem,damage,opts={}){
  const cells=field.cells??elementCells105(field.x,field.y,opts.radius??1);field.cells=cells;emitElementContact105(elem,cells,fieldProvenance57(field),{propagation:true,ground:true});
  if(elem==='fire'){
   const targets=[state.player,...state.monsters].filter(e=>e.hp>0&&!e.flying&&entityFootprintCells57(e).some(q=>cells.some(c=>c.x===q.x&&c.y===q.y)));
   for(const target of targets)combustionContact105(target,'fire',fieldProvenance57(field),{floorDamage:Math.max(3,damage)});return targets.length;
  }
  const effect=fieldProvenance57(field);let hits=0;
  for(const target of [state.player,...state.monsters]){if(runState57()!=='playing')break;if(!effectCanAffect57(effect,target)||!entityFootprintCells57(target).some(q=>cells.some(c=>c.x===q.x&&c.y===q.y)))continue;
    const base=target===state.player?(opts.playerDamage??damage):damage;
    const result=resolveElementDamage57(target,elem,base,{...opts,effect,ground:true,contactHandled105:true});if(result.damage)hits++;
  }return hits
}
function entityElementGuard57(entity,elem){
  if(!entity)return false;
  if(entity!==state?.player)return entity.armor?.elementGuard74===elem||(elem==='fire'&&entity.weapon?.artifactId46==='ember_axe');
  return (elem==='ice'&&(state?.status?.warm57||0)>0)||state?.player?.armor?.elementGuard74===elem||(state?.elementWard74?.element===elem&&state.elementWard74.ttl>0)||!!globalThis.__MANRU_LEGEND47__?.guard?.(elem);
}
function entityElementMultiplier57(entity,elem){
  if(!entity||entity===state?.player)return entityElementGuard57(entity,elem)?0:1;
  const tile=state?.map?.[entity.y]?.[entity.x];let m=1;
  if(elem==='fire'){if(entity.lava||entity.fireTrail||/화염|살라맨더|녹아/.test(entity.name||''))m*=.25;if(entity.kind==='plant')m*=1.35}
  else if(elem==='shock'){if(entity.aquatic||[TT.SHALLOW_WATER,TT.WATER,TT.MERCURY].includes(tile))m*=1.50;if(entity.kind==='construct')m*=1.25}
  else if(elem==='water'){if(entity.aquatic)m*=.35;if(entity.lava||entity.fireTrail)m*=1.45}
  else if(elem==='ice'){if(entity.aquatic)m*=1.35;if(entity.lava||entity.fireTrail)m*=1.25}
  else if(elem==='grass'){if(entity.kind==='plant')m*=.25;if(entity.kind==='undead')m*=1.30}
  else if(elem==='earth'){if(entity.flying)m*=.25;if(entity.kind==='construct')m*=.60}
  if(entity.boss)m*=.62;return m;
}
function resolveElementDamage57(entity,elem,base,opts={}){
  if(state&&entity&&!opts.contactHandled105)elementAttackFx105(elem,entityFootprintCells57(entity));
  if(state&&entity&&!opts.contactHandled105)emitElementContact105(elem,entityFootprintCells57(entity),opts.effect||{},{baseDamage:base,directTarget:entity});
  if(!state||!entity||entity.hp<=0||!Number.isFinite(base)||base<=0)return{damage:0,guarded:false,adapted:false};
  if(opts.effect&&!effectCanAffect57(opts.effect,entity))return{damage:0,guarded:false,adapted:false};
  if(opts.ground&&entity.flying)return{damage:0,guarded:false,adapted:true};
  if(entityElementGuard57(entity,elem)){
    if(elem==='fire'&&opts.absorb!==false&&globalThis.__MANRU_LEGEND47__?.fireAbsorb?.())globalThis.__MANRU_LEGEND47__?.healFire?.(1);
    floatText(entity.x,entity.y,'저항',opts.color||'#e5c080',10);return{damage:0,guarded:true,adapted:true};
  }
  const mult=opts.conduction105?1:entity===state.player?(elem==='shock'&&[TT.SHALLOW_WATER,TT.WATER,TT.MERCURY].includes(state.map[entity.y]?.[entity.x])?1.5:1):entityElementMultiplier57(entity,elem),damage=damageEntity(entity,opts.damageParts105?.length?opts.damageParts105.reduce((n,part)=>n+Math.max(1,Math.round(part*mult)),0):Math.max(1,Math.round(base*mult)), opts.effect||(entity===state.player?null:state.player),elem);markCombatActivity57(entity===state.player?'hostile-element':'player-element');entity.hitUntil=performance.now()+120;
  if(damage>0&&entity.martialActor105){dojoRememberHit(entity,['ice','earth'].includes(elem)?'control':elem==='fire'||opts.ground?'area':'ranged');}
  if(damage>0)floatText(entity.x,entity.y,`-${damage}`,opts.color||'#ff9b55',opts.size||11,elem);if(damage>0&&opts.impact!==false)impact(entity.x,entity.y,opts.color||'#f0823c',3);
  if(damage>0&&opts.logDamage57!==false){const source=opts.source||({fire:'화염',water:'수류',earth:'대지',ice:'빙결',shock:'전격',grass:'초목',holy:'성광'}[elem]||elem)+' 피해',target=(state.debugBattle57&&entity.debugId57!=null?entity.debugSide57+entity.debugId57+' ':'')+(entity===state.player?'플레이어':entity.name);addLog(`${source} → ${target}: ${damage}`);}
  if(entity.hp<=0){if(entity===state.player)die(opts.source||`${elem} 피해`);else killMonster(entity)}
  return{damage,guarded:false,adapted:mult<1,multiplier:mult};
}
function tickElementFields57(){
 for(const f of state.elementFields74||[]){if(state.turn>f.bornTurn&&f.ttl>0&&f.kind==='fire'){applyElementField57(f,'fire',f.damage??3,{source:'원소 화염지대',color:'#ff9862',size:10});if(runState57()!=='playing')return;f.ttl--}}state.elementFields74=(state.elementFields74||[]).filter(f=>f.ttl>0);
}
  const ELEMENT_KIND74={elem_fire:'fire',elem_shock:'shock',elem_water:'water',elem_ice:'ice',elem_grass:'grass',elem_earth:'earth'};
  function baseElem74(item){return item?.element74||ELEMENT_KIND74[item?.talismanKind]||null}
  function guard74(elem){return entityElementGuard57(state?.player,elem)}
  function hurtSelf74(elem,dmg,status){
    dmg=Math.max(0,Math.round(Number(dmg)||0));
    if(guard74(elem)){floatText(state.player.x,state.player.y,'저항',E74[elem].soft,10);return 0}
    dmg=damageEntity(state.player,dmg);if(dmg>0)floatText(state.player.x,state.player.y,'-'+dmg,E74[elem].soft,13,elem);impact(state.player.x,state.player.y,E74[elem].color,4);
    if(status==='stun')applyHostileStatus('stun',1,1,{stagger:true,element:elem});if(status==='weaken')applyHostileStatus('weaken',2,1,{stagger:true,element:elem});if(status==='poison')applyHostileStatus('poison',3,1,{element:elem});
    if(state.player.hp<=0)die(`${E74[elem].name}부적 역류`);return dmg
  }
  function extinguish74(x,y,r=2){return emitElementContact105('water',elementCells105(x,y,r),effectSource57(state.player))}
  function rawElement74(item){
    if(!item)return false;ensure74();const elem=baseElem74(item),p=state.player;if(!elem)return false;cancelAutoWalk();closeInventory();identifyKind(item.talismanKind,'생원소 폭주 관찰');const depthStep=Math.floor((state.floor-1)/5),targets=near74(p.x,p.y,elem==='fire'?1:2);const contactCells=elementCells105(p.x,p.y,elem==='fire'?1:2);emitElementContact105(elem,contactCells,effectSource57(p),{baseDamage:20+depthStep*5});elementAttackFx105(elem,contactCells,p);
    if(elem==='fire'){for(const m of targets)hurtMon74(m,'fire',29+depthStep*6,true);addElemField74('fire',p.x,p.y,4,4);hurtSelf74('fire',5);addLog(`화염부적 폭주: ${targets.length}체를 태우고 불길이 번졌다.`)}
    else if(elem==='shock'){targets.sort((a,b)=>entityDistance57(a,p)-entityDistance57(b,p));for(const m of targets.slice(0,5))hurtMon74(m,'shock',28+depthStep*6,true);hurtSelf74('shock',4,'stun');addLog(`뇌전부적 폭주: 전류가 ${Math.min(5,targets.length)}체를 연쇄 타격했다.`)}
    else if(elem==='water'){for(const m of targets){hurtMon74(m,'water',24+depthStep*5,true);if(m.hp>0)push74(m,p.x,p.y,1)}extinguish74(p.x,p.y,2);hurtSelf74('water',3,'weaken');addLog(`수류부적 폭주: ${targets.length}체를 밀어내고 주변 불길을 껐다.`)}
    else if(elem==='ice'){for(const m of targets){hurtMon74(m,'ice',23+depthStep*5,true);if(m.hp>0){if(m.boss){if((m.controlCd54||0)<=0){setMonsterStatus(m,'stunned',1);m.controlCd54=4;m.controlCdTurn54=state.turn}}else setMonsterStatus(m,'stunned',Math.max(m.stunned||0,1))}}hurtSelf74('ice',3,'stun');addLog('빙결부적 폭주: 주변이 급랭했다.')}
    else if(elem==='grass'){woodEffect105(22+depthStep*5,false);hurtSelf74('grass',2,'poison');addLog('목령부적 폭주: 뿌리와 독분이 주변을 덮었다.')}
    else if(elem==='earth'){for(const m of targets){hurtMon74(m,'earth',26+depthStep*6,true);if(m.hp>0)push74(m,p.x,p.y,1)}let made=0;for(const[dx,dy]of randOrder74(DIRS4))if(made<2&&tempTile74(p.x+dx*2,p.y+dy*2,TT.WALL,5,'earthwall'))made++;hurtSelf74('earth',4,'stun');addLog('대지부적 폭주: 낙석과 암벽이 솟았다.')}
    burst(p.x,p.y,E74[elem].color,28,1);consumeRef(item);globalThis.__MANRU_TURN_ENGINE__.advance({handled:true,committed:true,timeCost:1,reason:'reference-effect'});return true
  }
function fieldProvenance57(field){if(field.sourceFaction)return field;return{...field,...effectSource57(null,{sourceFaction:field.owner57||'player',owner:field.owner57||'player',credit:field.owner57==='hostile'?null:'player'})}}
