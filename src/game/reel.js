/* Video reel: one button starts a self-playing showcase of the game for screen recording.
   A director walks a fixed list of scenes (class + main floor or branch). Each scene is a fresh throw-away run set up for the picture:
   gear and level fit the depth, the player starts a few steps from a fight, and a small bot fights, uses martial skills and explores.
   The run is ephemeral (see runIsEphemeral): it never touches the player's save, death record or server stats. Leaving reloads the page.
   Everything is driven from the frame loop (Reel.tick); there are no timers of its own. */
const Reel={
 on:false,phase:'off',phaseAt:0,sceneIndex:0,scene:null,sceneStart:0,lastStep:0,lastCue:0,panelUntil:0,panelActAt:0,panelAct:null,shown:0,cueUntil:0,bannerUntil:0,stuck:0,lastCell:'',
 PANELS:[
  {at:.2,ms:2600,open:()=>toggleInventory(),actAt:1300,act:()=>{const i=state.player.inventory.findIndex(it=>it.type==='food'||it.type==='potion');if(i>=0)ActionDispatcher.dispatch({type:'ITEM_USE',args:[i]})}},
  {at:.55,ms:2600,open:()=>useClassSkill(),actAt:1500,act:()=>globalThis.__MANRU_SKILL991_INPUT__.activateIndex(0)}
 ],
 STEP_MS:230,FADE_MS:650,BANNER_MS:3200,CUE_GAP_MS:2600,CUE_MS:1500,NEAR_FIGHT:5,
 SCENES:[
  {title:'감찰관',sub:'제 1층 · 청풍루',cls:'wanderer',floor:1,secs:11},
  {title:'척후 검객',sub:'제 7층',cls:'swordsman',floor:7,secs:12},
  {title:'척후 궁사',sub:'제 12층',cls:'archer',floor:12,secs:12},
  {title:'천하장사',sub:'제 5층 · 구역 수문장',cls:'strongman',floor:5,secs:13,boss:true},
  {title:'잠행객',sub:'제 17층',cls:'infiltrator',floor:17,secs:12},
  {title:'금위 표사',sub:'제 10층 · 구역 수문장',cls:'escort',floor:10,secs:13,boss:true},
  {title:'무당',sub:'제 22층',cls:'summoner',floor:22,secs:12},
  {title:'광산',sub:'분기 · 갱도',cls:'swordsman',floor:8,branch:'mine:1',secs:11},
  {title:'궁궐',sub:'분기 · 궁궐',cls:'wanderer',floor:9,branch:'palace:1',secs:11},
  {title:'도장',sub:'분기 · 도장',cls:'strongman',floor:12,branch:'dojo:1',secs:11},
  {title:'수로',sub:'분기 · 수로',cls:'archer',floor:2,branch:'canal:1',secs:10},
  {title:'곡창',sub:'분기 · 곡창',cls:'escort',floor:3,branch:'granary:1',secs:10},
  {title:'목책',sub:'분기 · 목책',cls:'infiltrator',floor:7,branch:'stockade:1',secs:11},
  {title:'흑산채',sub:'분기 · 흑산채',cls:'swordsman',floor:7,branch:'black:1',secs:11},
  {title:'성채',sub:'분기 · 성채',cls:'strongman',floor:16,branch:'citadel:1',secs:12}
 ],
 el(id){return document.getElementById(id)},
 start(){
  if(this.on)return;
  this.on=true;this.sceneIndex=-1;this.phase='out';this.phaseAt=performance.now();
  document.body.classList.add('reel-mode');this.el('reelUi').hidden=false;this.el('reelFade').classList.add('black');
  addEventListener('keydown',this.onKey,true);
  this.next();
 },
 stop(){location.reload()},
 onKey:event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();Reel.stop()}},
 // ---- director ------------------------------------------------------------------------------------------------------
 next(){
  this.sceneIndex=(this.sceneIndex+1)%this.SCENES.length;this.scene=this.SCENES[this.sceneIndex];
  this.phase='out';this.phaseAt=performance.now();this.el('reelFade').classList.add('black');
 },
 tick(now){
  if(!this.on)return;
  const age=now-this.phaseAt;
  if(this.phase==='out'){if(age>=this.FADE_MS)this.setup(now)}
  else if(this.phase==='in'){if(age>=this.FADE_MS){this.phase='play';this.phaseAt=now}}
  else if(this.phase==='play'){
   if(now-this.sceneStart>=this.scene.secs*1000||runState57()!=='playing'){this.next();return}
   if(now>=this.cueUntil)this.el('reelCue').classList.remove('show');
   if(this.panelAct&&now>=this.panelActAt){const act=this.panelAct;this.panelAct=null;act()}
   if(this.panelUntil&&now>=this.panelUntil){this.panelUntil=0;this.panelAct=null;dismissGameplayInput57(true)}
   this.showPanel(now);
   if(now-this.lastStep>=this.STEP_MS){this.lastStep=now;this.step(now)}
  }
  if(now>this.bannerUntil)this.el('reelBanner').classList.remove('show');
 },
 setup(now){
  const scene=this.scene;
  try{
   newGame(CLASSES.find(c=>c.id===scene.cls));
   if(scene.branch){
    this.dress(scene.floor);
    const [id]=scene.branch.split(':');
    const def=BRANCH_DEFS105[id];if(def)state.floor=def.parent;
    if(!branchTransition({id:'reel',to:scene.branch,arrival:'up'}))throw Error('branch refused: '+scene.branch);
    FX.transition=null;/* the new run's own "제 01층" banner belongs to the main floor, not to the branch */
   }else{
    if(scene.floor>1){
     this.dress(scene.floor);resetFloorScopedState57();state.floor=scene.floor;NormalFloorGenerator.generate();branchPruneWorld(state);
     resetVisualState();resetTurnState();startFloorTransition();
    }else this.dress(1);
   }
   dismissGameplayInput57(true);
   this.placeNearFight();
   VisibilityService.compute();resetVisualState();updateAll(true);
  }catch(error){
   ignoreError('reel scene skipped',error);this.next();return;
  }
  this.stuck=0;this.lastCell='';this.shown=0;this.panelUntil=0;this.sceneStart=now;this.lastStep=now;
  const banner=this.el('reelBanner');this.el('reelTitle').textContent=scene.title;this.el('reelSub').textContent=scene.sub;
  banner.classList.remove('show');void banner.offsetWidth;banner.classList.add('show');this.bannerUntil=now+this.BANNER_MS;
  this.el('reelCue').classList.remove('show');
  this.phase='in';this.phaseAt=now;this.el('reelFade').classList.remove('black');
 },
 // Gear, level and martial arts fitting the depth: weapons and armour of the right tier for the class's own weapon family.
 dress(floor){
  const p=state.player,tier=Math.max(1,Math.min(6,Math.ceil(floor/4))),level=Math.max(1,Math.min(25,Math.round(floor*1.1)));
  const ranged=!!(p.weapon?.ranged||p.weapon?.kind==='bow'),fits=w=>ranged?(w.ranged||w.kind==='bow'):(!w.ranged&&w.kind!=='bow');
  const weapon=WEAPONS.filter(w=>w.tier<=tier&&fits(w)&&!w.cursed).sort((a,b)=>b.tier-a.tier||(b.atk||0)-(a.atk||0))[0];
  const armor=ARMORS.filter(a=>a.tier<=tier&&!a.cursed).sort((a,b)=>b.tier-a.tier||(b.def||0)-(a.def||0))[0];
  if(weapon&&(p.weapon?.tier||1)<weapon.tier)p.weapon={...structuredClone(weapon),type:'weapon',identified:true};
  if(armor&&(p.armor?.tier||1)<armor.tier)p.armor={...structuredClone(armor),type:'armor',identified:true};
  p.level=Math.max(p.level,level);p.baseMaxHpPermanent=Math.max(p.baseMaxHpPermanent,100+floor*25);recomputeMaxHp(p);
  const lv=Math.max(1,Math.min(4,Math.ceil(floor/6)));for(const id of ['strong','roar'])p.martial[id]=Math.max(p.martial[id]||0,lv);
  p.hp=p.maxHp;p.focus=getStats().maxFocus;
 },
 hostiles(){return state.monsters.filter(m=>m.hp>0&&!m.fixed&&isHostileTarget57(m)&&!m.summonOwner105)},
 // Start a few steps from the biggest fight so the scene has action from the first second (the boss on boss floors).
 placeNearFight(){
  const p=state.player,list=this.hostiles();if(!list.length)return;
  const boss=list.find(m=>m.boss),crowd=m=>list.filter(o=>entityDistance57(m,o)<=6).length;
  const goal=boss||list.slice().sort((a,b)=>crowd(b)-crowd(a))[0];
  if(!goal||entityDistance57(p,goal)<=this.NEAR_FIGHT+2)return;
  const search=ReachabilityService.playerSearch({x:goal.x,y:goal.y},{});
  let best=null;for(const [key,d] of search.dist){
   if(d<this.NEAR_FIGHT||d>this.NEAR_FIGHT+2)continue;const [x,y]=key.split(',').map(Number);
   if(OccupancyService.isOccupied(x,y))continue;best={x,y};break;
  }
  if(!best)return;
  p.x=best.x;p.y=best.y;
 },
 // ---- bot -----------------------------------------------------------------------------------------------------------
 // Now and then the picture shows the inventory (eating something) and the skill window (using a martial art), as a player would.
 showPanel(now){
  if(this.panelUntil)return;const frac=(now-this.sceneStart)/(this.scene.secs*1000);
  const i=this.PANELS.findIndex((panel,n)=>!(this.shown&1<<n)&&frac>=panel.at);if(i<0||dismissGameplayInput57(true))return;
  const panel=this.PANELS[i];this.shown|=1<<i;panel.open();this.panelUntil=now+panel.ms;this.panelAct=panel.act;this.panelActAt=now+panel.actAt;
 },
 step(now){
  if(this.panelUntil)return;
  if(dismissGameplayInput57(true))return;
  if(actionPresentationBusy58()||RunLifecycle.busy()||RuntimeState.ui.generationPending)return;
  const p=state.player,stats=getStats();
  // The health bar moves like a real run; the director only mends a hero who is about to fall.
  if(p.hp<p.maxHp*.3)p.hp=Math.round(p.maxHp*.6);
  if(p.focus<stats.maxFocus*.5)p.focus=Math.min(stats.maxFocus,p.focus+Math.ceil(stats.maxFocus*.5));
  const foes=this.hostiles().filter(m=>entityDistance57(p,m)<=22).sort((a,b)=>entityDistance57(p,a)-entityDistance57(p,b));
  const foe=foes[0],here=p.x+','+p.y;
  // Standing still while nothing is in reach means the bot is wedged: it takes a free step and tries again.
  this.stuck=here===this.lastCell&&!(foe&&entityDistance57(p,foe)<=1)?this.stuck+1:0;this.lastCell=here;
  if(this.stuck>=6){this.stuck=0;this.nudge();return}
  if(foe){
   const d=entityDistance57(p,foe),range=weaponRange(),ranged=!!(p.weapon?.ranged||p.weapon?.kind==='bow');
   this.skill(now,foe,foes);
   if(d<=1||(ranged&&d<=range&&d>1&&state.visible.has(k(foe.x,foe.y)))){
    const dx=Math.sign(foe.x-p.x),dy=Math.sign(foe.y-p.y);if(d<=1||dx||dy)p.facing={x:dx,y:dy};
    if(ActionDispatcher.dispatch({type:'ATTACK',args:[]}).successful)return;
   }
   if(this.stepToward(foe))return;
  }
  this.explore();
 },
 skill(now,foe,foes){
  if(now-this.lastCue<this.CUE_GAP_MS)return;
  const p=state.player,d=entityDistance57(p,foe),near=foes.filter(m=>entityDistance57(p,m)<=3).length;
  let id=null;
  if(near>=2&&d<=2&&p.martial.roar>0)id='roar';else if(d<=1&&!(p.strongReady>0)&&p.martial.strong>0)id='strong';
  if(!id||p.focus<MARTIAL_INFO[id].cost)return;
  if(!ActionDispatcher.dispatch({type:'MARTIAL',id}).successful)return;
  this.lastCue=now;this.cue(MARTIAL_INFO[id].name,now);
 },
 cue(text,now){
  const cue=this.el('reelCue');cue.textContent=text;cue.classList.remove('show');void cue.offsetWidth;cue.classList.add('show');this.cueUntil=now+this.CUE_MS;
 },
 stepToward(target){
  const p=state.player,search=ReachabilityService.playerSearch(p,{goal:{x:target.x,y:target.y}});
  return this.walk(ReachabilityService.playerPath(search,{x:target.x,y:target.y}));
 },
 explore(){
  const p=state.player;
  if(p.x===state.stairs.x&&p.y===state.stairs.y&&!state.branchContext105&&![5,10,15,20,23].includes(state.floor)){ActionDispatcher.dispatch({type:'DESCEND',args:[]});return}
  const path=ReachabilityService.frontierPath()||(state.stairs?ReachabilityService.pathTo(state.stairs.x,state.stairs.y):null);
  if(!this.walk(path))ActionDispatcher.dispatch({type:'REST',args:[]});
 },
 walk(path){
  if(!path?.length)return false;
  const p=state.player,next=path[0],dx=Math.sign(next.x-p.x),dy=Math.sign(next.y-p.y);
  if(!dx&&!dy)return false;
  return ActionDispatcher.dispatch({type:'MOVE',args:[dx,dy]}).successful||this.nudge();
 },
 // A blocked bot takes a random free step instead of pushing the same wall.
 nudge(){
  const p=state.player,order=DIRS8.slice().sort(()=>globalThis.__MANRU_RANDOM57__()-.5);
  for(const [dx,dy] of order)if(ActionDispatcher.dispatch({type:'MOVE',args:[dx,dy]}).successful)return true;
  return false;
 }
};
