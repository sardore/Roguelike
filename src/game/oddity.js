/* ===== 괴변 (怪變): the martial art of the summoner that takes the place of 격투 =====
   The summoner's eyes wake the furniture and structures round her: she names an enemy, and a piece of the place is pulled out of its floor,
   hangs in the air, shakes with the pull and is flung at the enemy; nothing is done to the enemy, and no enemy moves, until the piece lands. What it is made of decides what it does: wood is a plain blow that
   knocks back; stone strikes hard and stuns; a lantern bursts into a fire-damage explosion that leaves a burning floor; a tree is the heaviest
   blow and throws the enemy back. The rank (1-5, the fifth reached by the breakthrough) widens the reach of the pull and opens the next
   material: wood, stone, lantern, tree. At the fifth rank two pieces fly. The turn of the player is not committed until the last piece has landed. The forms are three different ways of fighting, none is the upper
   hand of the others: 인력 (one heavy blow, far), 선풍 (a sweeping blow that also hits the neighbours of the target, short) and 난무 (two pieces, each at its own enemy, weaker blows). */
const ODDITY_RULES=Object.freeze({
  // before the hit: the piece rises (lift), shakes and glows (charge), flies (flight). The blow, and the turn of the enemies, follow when it lands.
  timing:Object.freeze({lift:260,charge:180,flight:380,second:170,after:520}),
  materials:Object.freeze([
    {id:'wood',need:1,name:'목재',rank:1,power:1,color:'#d1a45e',tiles:['TABLE','BENCH','CRATE','RACK','SCREEN','LOW_FENCE','BED','BOOK_STACK','FLOWERBED','RUMOR_BED','RUMOR_MED_CABINET','RUMOR_WEAPON_RACK']},
    {id:'stone',need:2,name:'석재',rank:3,power:1.5,color:'#a7b3bb',tiles:['STATUE','STONE_PILLAR','ROCK','BASIN','CRYSTAL','JAR','INCENSE_STAND']},
    {id:'lantern',need:3,name:'등불',rank:2,power:1.1,color:'#ffb347',tiles:['LANTERN_POST','BRAZIER','GOLD_LAMP']},
    {id:'tree',need:4,name:'나무',rank:4,power:1.8,color:'#79b863',tiles:['GARDEN_TREE','PEACH_TREE']}
  ]),
  cost:4
});
const ODDITY_FX=[],ODDITY_QUEUE=[];
function oddityDescription(lv,n,form){
  const reach=oddityPullRange(Math.max(1,lv),form),mats=ODDITY_RULES.materials.filter(m=>m.need<=Math.max(1,n)).map(m=>m.name).join('·');
  const how=form==='scatter'?'둘로 나누어 두 적에게 던진다.':form==='whirl'?'휘돌려 곁의 적까지 친다.':form==='pull'?'한 점에 몰아 크게 내리친다.':'끌어온 것을 내던진다.';
  return `주변의 가구와 구조물을 끌어당겨 지정한 적에게 부딪힌다. ${how} ${reach}칸 안의 ${mats}.${n>=5?' 5단: 두 개.':''}`;
}
function oddityPullRange(lv,form){return 2+Math.max(1,lv)-(form==='whirl'?1:0)}
function oddityMaterialOf(tile,lv){
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
    const mat=oddityMaterialOf(state.map[y][x],lv);if(!mat||!state.visible.has(k(x,y))||protectedProp105(x,y)||(x===target.x&&y===target.y))continue;
    out.push({x,y,tile:state.map[y][x],mat,dist:Math.max(Math.abs(x-actor.x),Math.abs(y-actor.y)),near:Math.max(Math.abs(x-target.x),Math.abs(y-target.y))});
  }
  return out.sort((a,b)=>b.mat.rank-a.mat.rank||a.near-b.near||a.y-b.y||a.x-b.x);
}
function oddityChoose(actor,cell,lv,form){
  if(!cell)return null;const target=oddityTargets(actor,lv,form).find(m=>m.x===cell.x&&m.y===cell.y);if(!target)return null;
  const objects=oddityObjects(actor,lv,form,target);if(!objects.length)return null;
  if(form==='scatter'){
    const second=oddityTargets(actor,lv,form).filter(m=>m!==target&&Math.max(Math.abs(m.x-target.x),Math.abs(m.y-target.y))<=3).sort((a,b)=>Math.max(Math.abs(a.x-target.x),Math.abs(a.y-target.y))-Math.max(Math.abs(b.x-target.x),Math.abs(b.y-target.y)))[0];
    return{target,targets:second&&objects.length>1?[target,second]:[target],objects:objects.slice(0,second&&objects.length>1?2:1)};
  }
  return{target,targets:[target],objects:objects.slice(0,lv>=5?2:1)};
}
function oddityDamage(actor,lv,form,mat,index){
  const stats=combatEntityStats(actor);
  return Math.max(1,Math.round((3+3*lv+(stats.atk||0)*.5)*mat.power*(form==='whirl'?.7:1)*(form==='scatter'?.75:index?.7:1)));
}
// takes the piece out of the floor without a sound: what it leaves behind is the floor under it
function oddityDetach(x,y){
  const base=furnitureFloor57(x,y),r=RuntimeTerrainOwner.mutate(x,y,base,{source:'oddity'});if(!r.ok)return false;
  releaseTerrainUnderlay58(x,y,base);const key=k(x,y);
  if(state.branchTerrain105?.props)delete state.branchTerrain105.props[key];
  state.decor=(state.decor||[]).filter(d=>!(d.x===x&&d.y===y));touchElementTerrain105(x,y);return true;
}
function oddityPushSource(obj,mon){return{x:mon.x-Math.sign(mon.x-obj.x),y:mon.y-Math.sign(mon.y-obj.y)}}
function oddityHit(actor,mon,obj,lv,form,index){
  const dmg=oddityDamage(actor,lv,form,obj.mat,index),id=obj.mat.id;
  if(id==='lantern'){
    resolveElementDamage57(mon,'fire',dmg,{ground:false,source:'괴변 · 등불의 폭발',color:'#ffb347',size:15});
    addElemField74('fire',mon.x,mon.y,3,2+lv);
  }else{
    damageEntity(mon,dmg,actor);
    if(mon.hp>0&&(id==='wood'||id==='tree'))resolveForcedMovement57(mon,oddityPushSource(obj,mon),id==='tree'&&lv>=4?2:1,{mode:'push',hostile:true,creditPlayer:true,reportCollision:true});
    if(mon.hp>0&&(id==='stone'||id==='tree')&&mon.hp>0)applyMartialControl1005(mon,id==='stone'&&lv>=4?2:1);
  }
  if(form==='whirl')for(const o of state.monsters)if(o!==mon&&o.hp>0&&isHostileTarget57(o)&&Math.max(Math.abs(o.x-mon.x),Math.abs(o.y-mon.y))<=1){damageEntity(o,Math.max(1,Math.round(dmg*.5)),actor);martialCheckDeath(o,actor)}
  martialCheckDeath(mon,actor);
}
// the pieces in the air, by the chosen enemy: oddityPlan answers with them while the art is under way (their tiles are already gone from the floor)
let ODDITY_FLIGHT=null;
function oddityPlan(actor,cell,lv,form){
  if(ODDITY_FLIGHT&&ODDITY_FLIGHT.run===state&&cell&&ODDITY_FLIGHT.target.x===cell.x&&ODDITY_FLIGHT.target.y===cell.y)return ODDITY_FLIGHT;
  return oddityChoose(actor,cell,lv,form);
}
// the whole art: validation happens before the focus is spent (see executeMartialActor); this lifts the pieces out of the floor and starts the
// picture; the blows are written to the state when each piece lands (oddityDue), and the turn is committed when the last has landed
function oddityBegin(actor,lv,form,cell){
  const plan=oddityChoose(actor,cell,lv,form);if(!plan)return false;
  const t=ODDITY_RULES.timing,now=performance.now(),mon=plan.target;let last=now;
  const pieces=plan.objects.map((obj,i)=>{
    const aim=plan.targets[i]||mon,start=now+i*t.second,hitAt=start+t.lift+t.charge+t.flight;
    ODDITY_FX.push({run:state,map:state.map,start,hitAt,from:{x:obj.x,y:obj.y},caster:{x:actor.x,y:actor.y},to:{x:aim.x,y:aim.y},mat:obj.mat.id,color:obj.mat.color,tile:obj.tile,sprite:oddityPieceSprite(obj.tile,obj.x,obj.y),seed:(obj.x*31+obj.y*17+i*7)>>>0,hit:false});
    oddityDetach(obj.x,obj.y);last=hitAt;return{obj,hitAt,index:i,aim};
  });
  ODDITY_FLIGHT={run:state,target:mon,targets:plan.targets,objects:plan.objects};
  pieces.forEach((pc,i)=>ODDITY_QUEUE.push({run:state,hitAt:pc.hitAt,actor,mon:pc.aim,obj:pc.obj,lv,form,index:pc.index,last:i===pieces.length-1,cell:{x:pc.aim.x,y:pc.aim.y}}));
  Object.assign(ACTION_PRESENTATION58,{run:state,start:now,until:last+200,inputUntil:last,rate:1,kind:'oddity',source:{x:actor.x,y:actor.y},target:{x:mon.x,y:mon.y},entity:mon,pending:true,weapon:'brawl',hit:false,crit:false,strong:false});
  addLog(`${actor.name}: ${plan.objects.map(o=>o.mat.name).join('·')}이(가) 허공으로 떠올라 ${plan.targets.map(m=>m.name).join('·')}에게 날아든다.`);
  floatText(actor.x,actor.y,martialPresentation('brawl',MARTIAL_INFO.brawl,actor).name,'#c9a7ff',14);
  return true;
}
// called every frame: a piece that has landed does its blow; the last one ends the turn of the player, and the enemies answer
function oddityDue(){
  if(!ODDITY_QUEUE.length)return;const now=performance.now();
  while(ODDITY_QUEUE.length&&(ODDITY_QUEUE[0].run!==state||now>=ODDITY_QUEUE[0].hitAt)){
    const q=ODDITY_QUEUE.shift();if(q.run!==state){ODDITY_FLIGHT=null;continue}
    try{
      if(q.mon.hp>0)oddityHit(q.actor,q.mon,q.obj,q.lv,q.form,q.index);
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
function oddityPieceSprite(tile,x,y){
  const c=document.createElement('canvas');c.width=c.height=96;const q=c.getContext('2d');q.scale(3,3);
  try{
    if(tile===TT.CRATE){drawCrateX(q,0,0)}
    else if(tile===TT.GARDEN_TREE||tile===TT.PEACH_TREE||tile===TT.FLOWERBED){drawBotanical(q,tile,0,0,x,y,regionIndex())}
    else if(!drawSharedProp(q,tile,0,0,regionIndex(),0,performance.now(),true)){q.fillStyle='#8a7a5a';q.fillRect(6,8,20,20)}
  }catch(error){ignoreError('oddity sprite',error);q.fillStyle='#8a7a5a';q.fillRect(6,8,20,20)}
  return c;
}
function oddityRand(seed,n){let h=(seed^(n*2654435761))>>>0;h=Math.imul(h^(h>>>15),2246822519)>>>0;h=Math.imul(h^(h>>>13),3266489917)>>>0;return((h^(h>>>16))>>>0)/4294967296}
const oddityEase=t=>t*t*(3-2*t);
function oddityHitFx(ev){
  const cx=ev.to.x,cy=ev.to.y;ev.hit=true;
  FX.shakePower=Math.max(FX.shakePower,ev.mat==='stone'||ev.mat==='tree'?8:5);FX.shakeUntil=performance.now()+(ev.mat==='tree'?320:220);flash(ev.mat==='lantern'?'#ffd9a0':'#ffffff',ev.mat==='lantern'?160:70);
  if(ev.mat==='stone')elementBreakFx105(cx,cy,'earth');else if(ev.mat==='wood')burst(cx,cy,'#a78357',12,.7);else if(ev.mat==='tree')burst(cx,cy,'#6aa65a',16,.8);else burst(cx,cy,'#ffb347',20,1);
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
    if(el<flyEnd){
      // where the piece is, how high, how it turns
      let px=a.x,py=a.y,lift=0,rot=0,glow=0,u=0;
      if(el<liftEnd){const t=oddityEase(el/liftEnd);lift=t*.55*z;glow=t*.6;rot=Math.sin(el*.045)*.12*t;px+=Math.sin(el*.09)*1.6*sc*t}
      else if(el<chargeEnd){const t=(el-liftEnd)/T.charge;lift=.55*z+Math.sin(t*Math.PI*2)*.05*z;glow=.6+t*.4;rot=.1+t*.9;px+=Math.sin(el*.12)*2.2*sc}
      else{u=oddityEase((el-chargeEnd)/T.flight);const arc=Math.sin(Math.PI*u)*(.9+.14*Math.hypot(b.x-a.x,b.y-a.y)/z)*z;px=a.x+(b.x-a.x)*u;py=a.y+(b.y-a.y)*u;lift=.55*z*(1-u)+arc;rot=1+u*(ev.mat==='tree'?7:11);glow=1}
      // the pull: wavering strands of light from the hands of the caster to the piece, and a ring that closes on it
      if(el<chargeEnd){const k2=Math.min(1,el/liftEnd);X.save();X.globalAlpha=.55*k2;X.strokeStyle='#cdb0ff';X.lineWidth=2*sc;for(let s=0;s<3;s++){X.beginPath();X.moveTo(c.x,c.y-.2*z);const mx=(c.x+a.x)/2+Math.sin(el*.012+s*2.1)*.35*z,my=(c.y+a.y)/2-.4*z+Math.cos(el*.01+s)*.2*z;X.quadraticCurveTo(mx,my,a.x,a.y-lift)}X.stroke();
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
      for(let s=0;s<14;s++){const r=oddityRand(ev.seed,40+s),ang=r*Math.PI*2,sp=(.6+oddityRand(ev.seed,80+s)*1.4)*z,d=sp*Math.min(1,t*1.6),grav=t*t*.9*z,x=b.x+Math.cos(ang)*d,y=b.y+Math.sin(ang)*d*.6-(1-t)*.3*z*oddityRand(ev.seed,120+s)+grav;
        X.globalAlpha=Math.max(0,1-t*1.1);X.translate(x,y);X.rotate(ang+t*8*(r-.5));
        if(ev.mat==='wood'){X.fillStyle=s%2?'#a98150':'#7d5a34';X.fillRect(-4*sc,-1.2*sc,8*sc,2.4*sc)}
        else if(ev.mat==='stone'){X.fillStyle=s%3?'#8d989f':'#c7cfd3';X.fillRect(-2.6*sc,-2.6*sc,5.2*sc,4*sc)}
        else if(ev.mat==='tree'){X.fillStyle=s%2?'#5e9a4d':'#8cc473';X.beginPath();X.ellipse(0,0,3.6*sc,1.8*sc,0,0,Math.PI*2);X.fill();X.fillStyle='#6b4a2a';X.fillRect(-4*sc,-.8*sc,3*sc,1.6*sc)}
        else{X.fillStyle=s%2?'#ffb347':'#ff6a2a';X.fillRect(-1.6*sc,-1.6*sc,3.2*sc,3.2*sc)}
        X.setTransform(VIEW.dpr,0,0,VIEW.dpr,0,0)}
      X.globalAlpha=(1-t)*.5;X.fillStyle=ev.mat==='stone'?'#b9b4a6':ev.mat==='tree'?'#7aa46a':ev.mat==='wood'?'#b79a70':'#5b4636';
      for(let s=0;s<5;s++){const r=oddityRand(ev.seed,200+s);X.beginPath();X.arc(b.x+(r-.5)*z*.9,b.y-t*z*.7*(.5+r),z*(.18+t*.3),0,Math.PI*2);X.fill()}
      if(ev.mat==='lantern'){const fr=z*(.3+oddityEase(Math.min(1,t*1.8))*1.25),g=X.createRadialGradient(b.x,b.y,0,b.x,b.y,fr);g.addColorStop(0,`rgba(255,246,200,${.95*(1-t)})`);g.addColorStop(.35,`rgba(255,170,60,${.85*(1-t)})`);g.addColorStop(1,'rgba(200,50,10,0)');X.globalAlpha=1;X.fillStyle=g;X.beginPath();X.arc(b.x,b.y,fr,0,Math.PI*2);X.fill();
        X.globalAlpha=1-t;X.fillStyle='#ffcf7a';for(let s=0;s<10;s++){const r=oddityRand(ev.seed,300+s);X.fillRect(b.x+Math.cos(r*6.28)*fr*(.6+r*.6),b.y+Math.sin(r*6.28)*fr*.8-t*z*(.4+r),2*sc,2*sc)}}
      X.restore()}
  }
  X.restore();
}
