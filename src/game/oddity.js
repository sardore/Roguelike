/* ===== 괴변 (怪變): the martial art of the summoner that takes the place of 격투 =====
   The summoner's eyes wake the furniture and structures round her: she names an enemy, and a piece of the place is pulled out of its floor,
   hangs in the air, shakes with the pull and is flung at the enemy; nothing is done to the enemy, and no enemy moves, until the piece lands. What it is made of decides what it does: wood is a plain blow that
   knocks back; stone strikes hard and stuns; a lantern bursts into a fire-damage explosion that leaves a burning floor; a tree is the heaviest
   blow and throws the enemy back. The rank (1-5, the fifth reached by the breakthrough) widens the reach of the pull and opens the next
   material: wood, stone, lantern, tree. The turn of the player is not committed until the last piece has landed. The forms: 염력 (the enemy is thrown to the place of the piece and breaks it) and 이변 (several pieces rise together and
   fly together, each weaker). At the fifth rank the piece bounces once to a second enemy, and the art costs more. Furniture that is none of the four
   materials is 'misc': a light blow that carries a status the other arts never use. */
const ODDITY_RULES=Object.freeze({
  // before the blow: the piece rises (lift), shakes and glows (charge), flies (flight). The blow, and the turn of the enemies, follow when it lands.
  timing:Object.freeze({lift:260,charge:180,flight:380,bounce:300,after:520}),
  materials:Object.freeze([
    {id:'wood',need:1,name:'목재',rank:1,power:1.1,color:'#d1a45e',tiles:['TABLE','BENCH','CRATE','RACK','SCREEN','LOW_FENCE','BED','BOOK_STACK','FLOWERBED','RUMOR_BED','RUMOR_MED_CABINET','RUMOR_WEAPON_RACK','SPIDER_LILY']},
    {id:'stone',need:2,name:'석재',rank:3,power:1.4,color:'#a7b3bb',tiles:['STATUE','STONE_PILLAR','ROCK','BASIN','CRYSTAL','JAR','UNDERWORLD_STELE','SOUL_CAIRN']},
    {id:'lantern',need:3,name:'등불',rank:2,power:1.1,color:'#ffb347',tiles:['LANTERN_POST','BRAZIER','GOLD_LAMP','SOUL_LAMP']},
    {id:'tree',need:4,name:'나무',rank:4,power:1.6,color:'#79b863',tiles:['GARDEN_TREE','PEACH_TREE']},
    // the furniture that is none of these: a light blow, and what it carries is a curse (a status the other arts never use)
    {id:'misc',need:4,name:'기타',rank:0,power:.8,color:'#c9a7ff',tiles:['INCENSE_STAND','IRON_HOOK','PAPER_CRANE','RUMOR_SILK_DIVAN','RUMOR_CHARRED_COUNTER','RUMOR_INVESTIGATION_BOARD','RUMOR_SMUGGLER_BUNDLE','RUMOR_GREENHOUSE_FRAME','RUMOR_ARCHIVE_PILE','RUMOR_RITUAL_OBELISK','RUMOR_GAS_PIPE','RUMOR_FLOOD_GRATE','UNDERWORLD_BELL']}
  ]),
  palaceTiles:Object.freeze({banquet:'TABLE',bench:'BENCH',dresser:'TABLE',bed:'BED',curtain:'SCREEN',weapon:'RACK',books:'BOOK_STACK',jar:'JAR',throne:'STATUE',rail:'LOW_FENCE',cups:'RACK',mirror:'STATUE',column:'STONE_PILLAR',dragon:'STATUE',basin:'BASIN',altar:'STATUE',engine:'STATUE',pipe:'STATUE',record:'STATUE',coral:'CRYSTAL','stone-lamp':'LANTERN_POST',planter:'GARDEN_TREE',incense:'INCENSE_STAND'}),
  curses:Object.freeze({INCENSE_STAND:['skillSeal','기봉인'],RUMOR_INVESTIGATION_BOARD:['skillSeal','기봉인'],RUMOR_RITUAL_OBELISK:['skillSeal','기봉인'],IRON_HOOK:['bleed','출혈'],PAPER_CRANE:['upset','동요'],RUMOR_SILK_DIVAN:['drunk','취기'],RUMOR_SMUGGLER_BUNDLE:['drunk','취기'],RUMOR_CHARRED_COUNTER:['blind','실명'],RUMOR_GREENHOUSE_FRAME:['poison','중독'],RUMOR_GAS_PIPE:['poison','중독'],RUMOR_ARCHIVE_PILE:['weaken','쇠약'],RUMOR_FLOOD_GRATE:['weaken','쇠약'],UNDERWORLD_BELL:['upset','동요']}),
  anomalyPieces:Object.freeze({1:2,2:2,3:3,4:3,5:4}),anomalyShare:.48,bounceShare:.75,bounceReach:3,
  // each way of the art has its own seal on the card (see styles: form-psychic, form-anomaly) and its own light in the picture
  seals:Object.freeze({psychic:'念',anomaly:'異'}),auras:Object.freeze({base:'#c9a7ff',psychic:'#6fe3d6',anomaly:'#ff8fc4'}),
  cost:4,costBreakthrough:5
});
const ODDITY_FX=[],ODDITY_QUEUE=[];
function oddityCost(lv){return lv>=5?ODDITY_RULES.costBreakthrough:ODDITY_RULES.cost}
function oddityDescription(lv,n,form){
  const reach=oddityPullRange(Math.max(1,lv),form),mats=ODDITY_RULES.materials.filter(m=>m.need<=Math.max(1,n)).map(m=>m.name).join('·');
  const how=form==='psychic'?'적을 가구 자리로 내던져 가구를 부순다.':form==='anomaly'?'여러 가구를 한꺼번에 띄워 동시에 날린다. 하나당 위력은 낮다.':'끌어온 것을 내던진다.';
  return `주변의 가구와 구조물을 끌어당긴다. ${how} ${reach}칸 안의 ${mats}.${n>=5?' 5단: 한 번 튕겨 두 번째 적도 친다.':''}`;
}
function oddityPullRange(lv){return 2+Math.max(1,lv)}
function oddityMaterialOf(tile,lv,x=null,y=null){
  const prop=state.branchTerrain105?.palace105?.props?.[k(x,y)];
  if(prop?.tile===tile){if(prop.style==='handle')return null;tile=TT[ODDITY_RULES.palaceTiles[prop.style]]??tile;}
  for(const m of ODDITY_RULES.materials){if(lv<m.need)continue;for(const name of m.tiles)if(Number.isFinite(TT[name])&&TT[name]===tile)return m}
  return null;
}
function oddityTargets(actor,lv,form){
  const reach=oddityPullRange(lv,form)+2;
  return (state.monsters||[]).filter(m=>m.hp>0&&isHostileTarget57(m)&&state.visible.has(k(m.x,m.y))&&Math.max(Math.abs(m.x-actor.x),Math.abs(m.y-actor.y))<=reach&&lineClear(actor.x,actor.y,m.x,m.y));
}
// the pieces that can be pulled for this enemy: unlocked material, within the pull of the caster, in sight, not a fixture the floor needs
function oddityObjects(actor,lv,form,target){
  const pull=oddityPullRange(lv,form),out=[];
  for(let y=Math.max(1,actor.y-pull);y<=Math.min(ROWS-2,actor.y+pull);y++)for(let x=Math.max(1,actor.x-pull);x<=Math.min(COLS-2,actor.x+pull);x++){
    const mat=oddityMaterialOf(state.map[y][x],lv,x,y);if(!mat||!state.visible.has(k(x,y))||protectedProp105(x,y)||(x===target.x&&y===target.y))continue;
    out.push({x,y,tile:state.map[y][x],prop:state.branchTerrain105?.palace105?.props?.[k(x,y)]?.tile===state.map[y][x]?clone(state.branchTerrain105.palace105.props[k(x,y)]):null,mat,dist:Math.max(Math.abs(x-actor.x),Math.abs(y-actor.y)),near:Math.max(Math.abs(x-target.x),Math.abs(y-target.y))});
  }
  return out.sort((a,b)=>b.mat.rank-a.mat.rank||a.near-b.near||a.y-b.y||a.x-b.x);
}
// the second enemy of the bounce (fifth rank): the nearest other enemy to where the first blow fell
function oddityBounceTarget(actor,lv,form,first,at){
  if(lv<5)return null;
  return oddityTargets(actor,lv,form).filter(m=>m!==first).map(m=>({m,d:Math.max(Math.abs(m.x-at.x),Math.abs(m.y-at.y))})).filter(o=>o.d<=ODDITY_RULES.bounceReach).sort((a,b)=>a.d-b.d)[0]?.m||null;
}
function oddityChoose(actor,cell,lv,form){
  if(!cell)return null;const target=oddityTargets(actor,lv,form).find(m=>m.x===cell.x&&m.y===cell.y);if(!target)return null;
  const objects=oddityObjects(actor,lv,form,target);if(!objects.length)return null;
  const take=form==='psychic'?1:form==='anomaly'?ODDITY_RULES.anomalyPieces[Math.min(5,Math.max(1,lv))]:1,picked=objects.slice(0,take);
  return{target,objects:picked,bounce:oddityBounceTarget(actor,lv,form,target,form==='psychic'?picked[0]:target)};
}
function oddityDamage(actor,lv,mat,form,leg){
  const stats=combatEntityStats(actor);
  return Math.max(1,Math.round((2+2*lv+(stats.atk||0)*.25)*mat.power*(form==='anomaly'?ODDITY_RULES.anomalyShare:1)*(leg?ODDITY_RULES.bounceShare:1)));
}
// takes the piece out of the floor without a sound: what it leaves behind is the floor under it
function oddityDetach(x,y){
  const palace=state.branchTerrain105?.palace105,key=k(x,y),prop=palace?.props?.[key],base=prop?.tile===state.map[y][x]&&palace.floors[key]!=null?palaceWaterTile(x,y):furnitureFloor57(x,y),r=RuntimeTerrainOwner.mutate(x,y,base,{source:'oddity'});if(!r.ok)return false;
  releaseTerrainUnderlay58(x,y,base);
  if(state.branchTerrain105?.props)delete state.branchTerrain105.props[key];
  if(palace?.props)delete palace.props[key];
  if(palace?.lights)palace.lights=palace.lights.filter(l=>l.x!==x||l.y!==y||l.wall);
  state.decor=(state.decor||[]).filter(d=>!(d.x===x&&d.y===y));touchElementTerrain105(x,y);return true;
}
function oddityPushSource(obj,mon){return{x:mon.x-Math.sign(mon.x-obj.x),y:mon.y-Math.sign(mon.y-obj.y)}}
// one blow of one piece on one enemy; leg 1 is the bounce. A thrown enemy (psychic) is not pushed: it already lies where the piece was.
function oddityHit(actor,mon,obj,lv,form,leg){
  const dmg=oddityDamage(actor,lv,obj.mat,form,leg),id=obj.mat.id;
  // An intact thrown jar already emits its impact noise when it shatters.
  const breaksJar=obj.tile===TT.JAR&&!leg;
  if(!breaksJar)alertNearby(mon.x,mon.y,id==='lantern'?8:id==='stone'||id==='tree'?7:6,id==='lantern'?'explosion':'impact',dmg);
  if(id==='lantern'){
    resolveElementDamage57(mon,'fire',dmg,{ground:false,source:'괴변 · 등불의 폭발',color:'#ffb347',size:15});
    addElemField74('fire',mon.x,mon.y,3,2+lv);
  }else{
    damageEntity(mon,dmg,actor);
    if(mon.hp>0&&form!=='psychic'&&(id==='wood'||id==='tree'))resolveForcedMovement57(mon,oddityPushSource(obj,mon),id==='tree'&&lv>=4?2:1,{mode:'push',hostile:true,creditPlayer:true,reportCollision:true});
    if(mon.hp>0&&(id==='stone'||id==='tree'))applyMartialControl1005(mon,id==='stone'&&lv>=4?3:2);
    if(mon.hp>0&&id==='misc'){const curse=ODDITY_RULES.curses[ODDITY_RULES.palaceTiles[obj.prop?.style]||Object.keys(TT).find(n=>TT[n]===obj.tile)];if(curse&&applyCombatStatus(mon,curse[0],3+(lv>=5?1:0),1,{source:actor}))floatText(mon.x,mon.y,curse[1],'#c9a7ff',11)}
  }
  // a jar that is thrown breaks where it lands: its contents spill, or its gas rises
  if(breaksJar)shatterJar(mon.x,mon.y,{forced:true,from:{x:obj.x,y:obj.y}});
  martialCheckDeath(mon,actor);
}
// The other player's art, as a picture: the pieces it lifted fly here at this player (the blows come as hits, the floor as terrain changes), on the same timing as there.
function oddityMirror(msg){
  if(!state?.duel)return;
  const t=ODDITY_RULES.timing,now=performance.now(),p=state.player,stand=Duel.opponent();
  for(const piece of Array.isArray(msg.pieces)?msg.pieces.slice(0,8):[]){
    const mat=ODDITY_RULES.materials.find(m=>m.id===piece.mat);if(!mat||!Number.isFinite(piece.x)||!Number.isFinite(piece.y))continue;
    ODDITY_FX.push({run:state,map:state.map,start:now,hitAt:now+t.lift+t.charge+t.flight,from:{x:piece.x,y:piece.y},caster:{x:stand?.x??p.x,y:stand?.y??p.y},to:{x:p.x,y:p.y},mat:mat.id,aura:ODDITY_RULES.auras[msg.form]||ODDITY_RULES.auras.base,color:mat.color,tile:piece.tile,sprite:oddityPieceSprite(piece.tile,piece.x,piece.y,piece.prop),seed:(piece.x*31+piece.y*17+Math.floor(now))>>>0,hit:false,bounceNext:false});
  }
}
// the pieces in the air, by the chosen enemy: oddityPlan answers with them while the art is under way (their tiles are already gone from the floor)
let ODDITY_FLIGHT=null;
function oddityPlan(actor,cell,lv,form){
  if(ODDITY_FLIGHT&&ODDITY_FLIGHT.run===state&&cell&&ODDITY_FLIGHT.target.x===cell.x&&ODDITY_FLIGHT.target.y===cell.y)return ODDITY_FLIGHT;
  return oddityChoose(actor,cell,lv,form);
}
function oddityFlightMs(from,to){return Math.max(110,Math.max(Math.abs(to.x-from.x),Math.abs(to.y-from.y))*96)}
// the whole art: validation happens before the focus is spent (see executeMartialActor); this starts the picture and queues the blows, which are
// written to the state when each piece lands (oddityDue); the turn is committed when the last has landed, and not before
function oddityBegin(actor,lv,form,cell){
  const plan=oddityChoose(actor,cell,lv,form);if(!plan)return false;
  const t=ODDITY_RULES.timing,now=performance.now(),mon=plan.target,entries=[];let last=now;
  const fx=(obj,from,to,start,extra)=>{const ev={run:state,map:state.map,start,hitAt:start+t.lift+t.charge+t.flight,from,caster:{x:actor.x,y:actor.y},to,mat:obj.mat.id,aura:ODDITY_RULES.auras[form]||ODDITY_RULES.auras.base,color:obj.mat.color,tile:obj.tile,sprite:oddityPieceSprite(obj.tile,obj.x,obj.y,obj.prop),seed:(obj.x*31+obj.y*17+start)>>>0,hit:false,...extra};ODDITY_FX.push(ev);return ev};
  if(form==='psychic'){
    // the enemy is lifted, and thrown to where the piece stands; the piece is broken by it when it lands
    const obj=plan.objects[0],fly=oddityFlightMs(mon,obj),launchAt=now+t.lift+t.charge,hitAt=launchAt+fly;
    const ev=fx(obj,{x:mon.x,y:mon.y},{x:obj.x,y:obj.y},now,{kind:'psychic',hitAt,launchAt,bounceNext:!!plan.bounce});
    entries.push({hitAt:launchAt,step:'launch',mon,obj},{hitAt,step:'land',mon,obj,ev});last=hitAt;
    if(plan.bounce){const hit2=hitAt+t.bounce;fx(obj,{x:obj.x,y:obj.y},{x:plan.bounce.x,y:plan.bounce.y},hitAt,{kind:'bounce',hitAt:hit2});entries.push({hitAt:hit2,step:'hit',mon:plan.bounce,obj,leg:1});last=hit2}
  }else{
    // all the pieces rise together from their own places and fly at the same moment
    if(mon.duelOpponent)Duel.sendOddity(plan.objects.map(o=>({x:o.x,y:o.y,tile:o.tile,mat:o.mat.id,prop:o.prop})),form);
    plan.objects.forEach(obj=>{fx(obj,{x:obj.x,y:obj.y},{x:mon.x,y:mon.y},now,{bounceNext:!!plan.bounce});oddityDetach(obj.x,obj.y);entries.push({hitAt:now+t.lift+t.charge+t.flight,step:'hit',mon,obj})});
    last=now+t.lift+t.charge+t.flight;
    if(plan.bounce){const hit2=last+t.bounce;plan.objects.forEach(obj=>{fx(obj,{x:mon.x,y:mon.y},{x:plan.bounce.x,y:plan.bounce.y},last,{kind:'bounce',hitAt:hit2});entries.push({hitAt:hit2,step:'hit',mon:plan.bounce,obj,leg:1})});last=hit2}
  }
  entries.forEach((e,i)=>ODDITY_QUEUE.push({run:state,actor,lv,form,last:i===entries.length-1,...e}));
  ODDITY_FLIGHT={run:state,target:mon,objects:plan.objects,bounce:plan.bounce};
  Object.assign(ACTION_PRESENTATION58,{run:state,start:now,until:last+200,inputUntil:last,rate:1,kind:'oddity',source:{x:actor.x,y:actor.y},target:{x:mon.x,y:mon.y},entity:mon,pending:true,weapon:'brawl',hit:false,crit:false,strong:false});
  addLog(form==='psychic'?`${actor.name}: ${mon.name}이(가) 허공으로 떠올라 ${plan.objects[0].mat.name}을(를) 향해 내던져진다.`:`${actor.name}: ${plan.objects.map(o=>o.mat.name).join('·')}이(가) 허공으로 떠올라 ${mon.name}에게 날아든다.`);
  floatText(actor.x,actor.y,martialPresentation('brawl',MARTIAL_INFO.brawl,actor).name,ODDITY_RULES.auras[form]||ODDITY_RULES.auras.base,14);
  return true;
}
// called every frame: each step that has come due is written to the state; the last one ends the turn of the player, and the enemies answer
function oddityDue(){
  if(!ODDITY_QUEUE.length)return;const now=performance.now();
  while(ODDITY_QUEUE.length&&(ODDITY_QUEUE[0].run!==state||now>=ODDITY_QUEUE[0].hitAt)){
    const q=ODDITY_QUEUE.shift();if(q.run!==state){ODDITY_FLIGHT=null;continue}
    try{
      if(q.step==='launch'){
        // the enemy leaves its place for the place of the piece, gliding like any forced movement
        if(q.mon.hp>0&&!OccupancyService.isOccupied(q.obj.x,q.obj.y,q.mon)){OccupancyService.move(q.mon,q.obj.x,q.obj.y);beginForcedMotion(q.mon,[{x:q.obj.x,y:q.obj.y}])}
      }else if(q.step==='land'){
        if(q.mon.x===q.obj.x&&q.mon.y===q.obj.y&&state.map[q.obj.y][q.obj.x]===q.obj.tile)oddityDetach(q.obj.x,q.obj.y);
        if(q.mon.hp>0)oddityHit(q.actor,q.mon,q.obj,q.lv,q.form,0);
      }else if(q.mon.hp>0)oddityHit(q.actor,q.mon,q.obj,q.lv,q.form,q.leg||0);
      if(q.last){
        ODDITY_FLIGHT=null;const act=playerAction57('martial',{skill:true,allowMartial:true,uiOwner:'worldTarget57'});
        if(act.ok){commitPlayerAction57(act,1);if(q.lv>=5)martialFx('transcend')}
      }
    }catch(error){ignoreError('oddity blow',error);if(q.last)ODDITY_FLIGHT=null}
  }
}
// the casting of the art: choose an enemy in sight, then the piece is chosen for it (the heaviest material the rank opens, nearest the enemy)
function castOddity(cell,inputSource='pointer',existingAction=null){
  const act=existingAction||playerAction57('martial',{uiOwner:'worldTarget57',skill:true});if(!act.ok)return false;
  const p=state.player,lv=p.martial.brawl,info=martialPresentation('brawl',MARTIAL_INFO.brawl,p);
  if(martialFamily('brawl',p)!=='oddity'||lv<1||p.focus<info.cost){toast('괴변을 펼칠 기력이 부족하거나 기술을 배우지 않았다.');return false}
  if(!oddityPlan(p,cell,lv,martialFormOf('brawl',p))){toast('끌어당길 가구나 구조물이 닿지 않는다.');return false}
  return executeMartialActor(p,'brawl',cell);
}
function oddityBeginTarget(info){
  const p=state.player,lv=p.martial.brawl,form=martialFormOf('brawl',p),cells=oddityTargets(p,lv,form).filter(m=>oddityPlan(p,m,lv,form)).map(m=>({x:m.x,y:m.y,dx:m.x-p.x,dy:m.y-p.y,dist:Math.max(Math.abs(m.x-p.x),Math.abs(m.y-p.y))}));
  if(!cells.length){toast('시야 안에 끌어당길 가구가 닿는 적이 없다.');return false}
  closeMartial();return beginWorldTarget({kind:'oddity',title:info.name,text:`끌어당기는 거리 ${oddityPullRange(lv,form)}칸 · 기 ${info.cost} · 적 선택`,range:oddityPullRange(lv,form)+2,cells,onPick:castOddity});
}
/* ---- the picture ---- */
// the piece as it stands on the floor, drawn once into a canvas of its own (the tile is gone from the map a moment later)
function oddityPieceSprite(tile,x,y,prop=null){
  const c=document.createElement('canvas');c.width=c.height=96;const q=c.getContext('2d');q.scale(3,3);
  try{
    const palaceProp=prop||state.branchTerrain105?.palace105?.props?.[k(x,y)];
    if(palaceProp?.tile===tile)drawPalaceProp(q,palaceProp);
    else if(tile===TT.CRATE){drawCrateX(q,0,0)}
    else if(tile===TT.GARDEN_TREE||tile===TT.PEACH_TREE||tile===TT.FLOWERBED){drawBotanical(q,tile,0,0,x,y,regionIndex())}
    else if(!drawSharedProp(q,tile,0,0,regionIndex(),0,performance.now(),true)&&!drawStructureSpecialTerrain(tile,0,0,x,y,performance.now(),q)){q.fillStyle='#8a7a5a';q.fillRect(6,8,20,20)}
  }catch(error){ignoreError('oddity sprite',error);q.fillStyle='#8a7a5a';q.fillRect(6,8,20,20)}
  return c;
}
function oddityRand(seed,n){let h=(seed^(n*2654435761))>>>0;h=Math.imul(h^(h>>>15),2246822519)>>>0;h=Math.imul(h^(h>>>13),3266489917)>>>0;return((h^(h>>>16))>>>0)/4294967296}
const oddityEase=t=>t*t*(3-2*t);
function oddityHitFx(ev){
  const cx=ev.to.x,cy=ev.to.y;ev.hit=true;
  FX.shakePower=Math.max(FX.shakePower,ev.mat==='stone'||ev.mat==='tree'?8:5);FX.shakeUntil=performance.now()+(ev.mat==='tree'?320:220);flash(ev.mat==='lantern'?'#ffd9a0':'#ffffff',ev.mat==='lantern'?160:70);
  if(ev.mat==='stone')elementBreakFx105(cx,cy,'earth');else if(ev.mat==='wood')burst(cx,cy,'#a78357',12,.7);else if(ev.mat==='tree')burst(cx,cy,'#6aa65a',16,.8);else if(ev.mat==='misc')burst(cx,cy,'#c9a7ff',14,.8);else burst(cx,cy,'#ffb347',20,1);
  FX.rings.push({x:cx*TILE+TILE/2,y:cy*TILE+TILE/2,color:ev.color,start:performance.now(),life:340,power:ev.mat==='stone'||ev.mat==='tree'?7:5});
  globalThis.__MANRU_SFX54__?.play?.(ev.mat==='lantern'?'crit':'hit');
}
function drawOddityFx(){
  oddityDue();
  if(!state||!ODDITY_FX.length)return;const now=performance.now(),T=ODDITY_RULES.timing;
  for(let i=ODDITY_FX.length-1;i>=0;i--){const ev=ODDITY_FX[i];if(ev.run!==state||now>ev.hitAt+T.after)ODDITY_FX.splice(i,1)}
  const cam=globalThis.__MANRU_CAMERA_PROJECTION12__.current(),z=TILE*cam.zoom,sc=z/TILE;
  X.save();X.setTransform(VIEW.dpr,0,0,VIEW.dpr,0,0);
  const S=(tx,ty)=>({x:cam.x+(tx+.5)*z,y:cam.y+(ty+.5)*z});
  for(const ev of ODDITY_FX){
    const el=now-ev.start;if(el<0)continue;
    const liftEnd=T.lift,chargeEnd=T.lift+T.charge,flyEnd=chargeEnd+T.flight,a=S(ev.from.x,ev.from.y),b=S(ev.to.x,ev.to.y),c=S(ev.caster.x,ev.caster.y);
    if(now>=ev.hitAt&&!ev.hit)oddityHitFx(ev);
    if(ev.kind==='bounce'){
      // the piece, still whole, glances off the first enemy to the second
      const u0=1-(ev.hitAt-now)/T.bounce;
      if(u0>=0&&u0<1){const u=oddityEase(u0),bx=a.x+(b.x-a.x)*u,by=a.y+(b.y-a.y)*u-Math.sin(Math.PI*u)*.7*z-.2*z;
        X.save();X.globalAlpha=.3;X.fillStyle='#000';X.beginPath();X.ellipse(a.x+(b.x-a.x)*u,a.y+(b.y-a.y)*u+z*.3,z*.3,z*.1,0,0,Math.PI*2);X.fill();X.restore();
        X.save();X.translate(bx,by);X.rotate(u*13);X.scale(sc,sc);X.shadowColor=ev.color;X.shadowBlur=16*sc;X.drawImage(ev.sprite,-16,-18,32,32);X.restore()}
    }else if(ev.kind==='psychic'){
      // the enemy is held (strands from the hands, a ring about it), the piece that will break it trembles, then the streak of the throw
      const k2=Math.min(1,el/liftEnd);
      if(now<ev.launchAt){
        X.save();X.globalAlpha=.55*k2;X.strokeStyle=ev.aura;X.lineWidth=2*sc;for(let s=0;s<3;s++){X.beginPath();X.moveTo(c.x,c.y-.2*z);X.quadraticCurveTo((c.x+a.x)/2+Math.sin(el*.012+s*2.1)*.35*z,(c.y+a.y)/2-.4*z+Math.cos(el*.01+s)*.2*z,a.x,a.y-.35*z*k2)}X.stroke();
        X.globalAlpha=.8*k2;X.strokeStyle=ev.aura;X.lineWidth=2.6*sc;X.beginPath();X.ellipse(a.x,a.y-.1*z*k2,z*(.7-.25*k2),z*(.28-.08*k2),0,0,Math.PI*2);X.stroke();
        X.globalAlpha=.7*k2;X.strokeStyle=ev.color;X.lineWidth=2.4*sc;X.beginPath();X.arc(b.x,b.y,z*(1.1-.5*k2)+Math.sin(el*.05)*2*sc,0,Math.PI*2);X.stroke();X.restore();
      }else if(now<ev.hitAt){
        const u=oddityEase((now-ev.launchAt)/(ev.hitAt-ev.launchAt));X.save();X.lineCap='round';
        for(let s=0;s<3;s++){X.globalAlpha=.5*(1-u)*(1-s*.25);X.strokeStyle=s?ev.aura:'#fff';X.lineWidth=(5-s*1.5)*sc;X.beginPath();X.moveTo(a.x,a.y-.2*z);X.lineTo(a.x+(b.x-a.x)*u,a.y+(b.y-a.y)*u-.2*z)}X.stroke();
        X.globalAlpha=.9;X.strokeStyle=ev.color;X.lineWidth=2.4*sc;X.beginPath();X.arc(b.x,b.y,z*(.9*(1-u)+.25),0,Math.PI*2);X.stroke();X.restore();
      }
    }else if(el<flyEnd){
      // where the piece is, how high, how it turns
      let px=a.x,py=a.y,lift=0,rot=0,glow=0,u=0;
      if(el<liftEnd){const t=oddityEase(el/liftEnd);lift=t*.55*z;glow=t*.6;rot=Math.sin(el*.045)*.12*t;px+=Math.sin(el*.09)*1.6*sc*t}
      else if(el<chargeEnd){const t=(el-liftEnd)/T.charge;lift=.55*z+Math.sin(t*Math.PI*2)*.05*z;glow=.6+t*.4;rot=.1+t*.9;px+=Math.sin(el*.12)*2.2*sc}
      else{u=oddityEase((el-chargeEnd)/T.flight);const arc=Math.sin(Math.PI*u)*(.9+.14*Math.hypot(b.x-a.x,b.y-a.y)/z)*z;px=a.x+(b.x-a.x)*u;py=a.y+(b.y-a.y)*u;lift=.55*z*(1-u)+arc;rot=1+u*(ev.mat==='tree'?7:11);glow=1}
      // the pull: wavering strands of light from the hands of the caster to the piece, and a ring that closes on it
      if(el<chargeEnd){const k2=Math.min(1,el/liftEnd);X.save();X.globalAlpha=.55*k2;X.strokeStyle=ev.aura;X.lineWidth=2*sc;for(let s=0;s<3;s++){X.beginPath();X.moveTo(c.x,c.y-.2*z);const mx=(c.x+a.x)/2+Math.sin(el*.012+s*2.1)*.35*z,my=(c.y+a.y)/2-.4*z+Math.cos(el*.01+s)*.2*z;X.quadraticCurveTo(mx,my,a.x,a.y-lift)}X.stroke();
        X.globalAlpha=.7*k2;X.strokeStyle=ev.color;X.lineWidth=2.4*sc;X.beginPath();X.arc(a.x,a.y,z*(1.2-.7*k2),0,Math.PI*2);X.stroke();X.restore();
        // floor chips and dust rising from the empty place
        X.save();for(let s=0;s<9;s++){const r=oddityRand(ev.seed,s),age=(el*.0011+r)%1;X.globalAlpha=(1-age)*.7*k2;X.fillStyle=s%3?ev.color:'#d9d2c0';X.fillRect(a.x+(r-.5)*z*.9,a.y+z*.25-age*z*.9,(1.5+r*2.5)*sc,(1.5+r*2.5)*sc)}X.restore()}
      // the shadow stays on the floor
      X.save();X.globalAlpha=.32;X.fillStyle='#000';const gx=el<chargeEnd?a.x:a.x+(b.x-a.x)*u,gy=el<chargeEnd?a.y:a.y+(b.y-a.y)*u;X.beginPath();X.ellipse(gx,gy+z*.3,z*(.36-Math.min(.16,lift/z*.12)),z*.11,0,0,Math.PI*2);X.fill();X.restore();
      // afterimages along the way, then the piece itself with its light
      const draw=(x,y,r,alpha,scale)=>{X.save();X.globalAlpha=alpha;X.translate(x,y);X.rotate(r);X.scale(scale*sc,scale*sc);if(glow>0){X.shadowColor=ev.color;X.shadowBlur=18*glow*sc}X.drawImage(ev.sprite,-16,-18,32,32);X.restore()};
      if(el>chargeEnd)for(let s=4;s>=1;s--){const tu=Math.max(0,u-s*.07),ease=tu,arc=Math.sin(Math.PI*tu)*(.9+.14*Math.hypot(b.x-a.x,b.y-a.y)/z)*z;draw(a.x+(b.x-a.x)*ease,a.y+(b.y-a.y)*ease-(.55*z*(1-tu)+arc),1+tu*(ev.mat==='tree'?7:11),.16*(1-s/5),1)}
      draw(px,py-lift,rot,1,1+.12*glow);
      if(ev.mat==='lantern'&&el>liftEnd){X.save();X.globalAlpha=.5*glow;const g=X.createRadialGradient(px,py-lift,0,px,py-lift,z*.9);g.addColorStop(0,'rgba(255,200,110,.9)');g.addColorStop(1,'rgba(255,120,40,0)');X.fillStyle=g;X.beginPath();X.arc(px,py-lift,z*.9,0,Math.PI*2);X.fill();X.restore()}
    }
    // the hit: shards of what it was made of, a cloud, and for the lantern a ball of fire
    const h=now-ev.hitAt;
    if(h>=0&&h<T.after){
      const t=h/T.after;X.save();
      for(let s=0;s<(ev.bounceNext?0:14);s++){const r=oddityRand(ev.seed,40+s),ang=r*Math.PI*2,sp=(.6+oddityRand(ev.seed,80+s)*1.4)*z,d=sp*Math.min(1,t*1.6),grav=t*t*.9*z,x=b.x+Math.cos(ang)*d,y=b.y+Math.sin(ang)*d*.6-(1-t)*.3*z*oddityRand(ev.seed,120+s)+grav;
        X.globalAlpha=Math.max(0,1-t*1.1);X.translate(x,y);X.rotate(ang+t*8*(r-.5));
        if(ev.mat==='wood'){X.fillStyle=s%2?'#a98150':'#7d5a34';X.fillRect(-4*sc,-1.2*sc,8*sc,2.4*sc)}
        else if(ev.mat==='stone'){X.fillStyle=s%3?'#8d989f':'#c7cfd3';X.fillRect(-2.6*sc,-2.6*sc,5.2*sc,4*sc)}
        else if(ev.mat==='tree'){X.fillStyle=s%2?'#5e9a4d':'#8cc473';X.beginPath();X.ellipse(0,0,3.6*sc,1.8*sc,0,0,Math.PI*2);X.fill();X.fillStyle='#6b4a2a';X.fillRect(-4*sc,-.8*sc,3*sc,1.6*sc)}
        else if(ev.mat==='misc'){X.fillStyle=s%2?'#e8dcc0':'#c9a7ff';X.fillRect(-2.4*sc,-1.4*sc,4.8*sc,2.8*sc)}
        else{X.fillStyle=s%2?'#ffb347':'#ff6a2a';X.fillRect(-1.6*sc,-1.6*sc,3.2*sc,3.2*sc)}
        X.setTransform(VIEW.dpr,0,0,VIEW.dpr,0,0)}
      X.globalAlpha=(1-t)*.5;X.fillStyle=ev.mat==='stone'?'#b9b4a6':ev.mat==='tree'?'#7aa46a':ev.mat==='wood'?'#b79a70':ev.mat==='misc'?'#9d86c9':'#5b4636';
      for(let s=0;s<5;s++){const r=oddityRand(ev.seed,200+s);X.beginPath();X.arc(b.x+(r-.5)*z*.9,b.y-t*z*.7*(.5+r),z*(.18+t*.3),0,Math.PI*2);X.fill()}
      if(ev.mat==='lantern'){const fr=z*(.3+oddityEase(Math.min(1,t*1.8))*1.25),g=X.createRadialGradient(b.x,b.y,0,b.x,b.y,fr);g.addColorStop(0,`rgba(255,246,200,${.95*(1-t)})`);g.addColorStop(.35,`rgba(255,170,60,${.85*(1-t)})`);g.addColorStop(1,'rgba(200,50,10,0)');X.globalAlpha=1;X.fillStyle=g;X.beginPath();X.arc(b.x,b.y,fr,0,Math.PI*2);X.fill();
        X.globalAlpha=1-t;X.fillStyle='#ffcf7a';for(let s=0;s<10;s++){const r=oddityRand(ev.seed,300+s);X.fillRect(b.x+Math.cos(r*6.28)*fr*(.6+r*.6),b.y+Math.sin(r*6.28)*fr*.8-t*z*(.4+r),2*sc,2*sc)}}
      X.restore()}
  }
  X.restore();
}
