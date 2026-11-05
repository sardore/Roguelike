/* The ghost duel (docs/GHOST_BATTLE.md), first part: finding an opponent and passing payloads over the shared cp32 relay, mode MANRU_DUEL.
   The relay only matches two players and carries what they send; the game itself (arena, rules) is built on top of `send` and `inbox`.
   The socket is the one Spectate owns (one connection per page): Spectate hands every packet that is not about spectating to `receive` here. */
const Duel={
 MODE:'MANRU_DUEL',TURN_MS:20000,SEND_GAP_MS:120,
 stage:'idle',queueEntryId:'',matchId:'',token:'',role:'',remote:'',sent:0,inbox:[],note:'',play:false,environment:0,mineFloor:1,mineGhostId:'',locked:false,stakes:false,helloBody:null,pending:null,settling:null,shown:0,turn:'host',turnEnds:0,turnSeen:0,theirs:null,mineBody:'',outcome:'',reported:false,applying:false,arena:-1,seq:0,lastSig:'',lastSend:0,keysBound:false,
 // idle -> connecting -> queued -> offered -> matched (the relay committed the session) -> idle again on leave or when the relay drops it
 setStage(stage,note=''){this.stage=stage;this.note=note;PlayStats.logAdd({a:'DUEL',stage,note,role:this.role,match:this.matchId});this.renderPicker()},
 find(play=false,body='',floor=1,ghostId=''){
  if(this.stage!=='idle')return false;this.play=play;this.mineBody=body;this.mineFloor=floor;this.mineGhostId=ghostId;this.locked=!play;this.stakes=false;this.helloBody=null;this.theirs=null;
  this.queueEntryId='q-'+Math.random().toString(36).slice(2,12)+Date.now().toString(36);this.inbox=[];this.sent=0;
  this.setStage('connecting','서버에 연결하는 중…');
  if(!Spectate.ws&&!Spectate.open('duel')){this.setStage('idle','연결을 열 수 없다');return false}
  if(Spectate.ready)this.onReady();
  return true;
 },
 onReady(){
  if(this.stage!=='connecting')return;
  this.setStage('queued','상대를 찾는 중…');
  Spectate.send({type:'match.enqueue',mode:this.MODE,queueEntryId:this.queueEntryId});
 },
 // Every packet of the relay that belongs to a match.
 receive(packet){
  switch(packet.type){
   case 'match.offer':
    if(packet.mode!==this.MODE||this.stage!=='queued')return;
    this.matchId=packet.matchId;this.role=packet.role;this.remote=packet.remotePlayerId;this.setStage('offered','상대를 찾았다');
    Spectate.send({type:'match.ready',matchId:packet.matchId,queueEntryId:this.queueEntryId});return;
   case 'session.commit':
    if(packet.mode!==this.MODE||packet.matchId!==this.matchId)return;
    this.token=packet.sessionToken;this.role=packet.role;this.remote=packet.remotePlayerId;this.setStage('matched','대전이 시작된다');
    if(this.play)this.lockMine();return;
   case 'relay.message':
    if(packet.sessionToken!==this.token)return;
    if(this.fightMessage(packet.payload))return;
    this.inbox.push({from:packet.fromRole,payload:packet.payload,seq:packet.relaySequence});return;
   case 'session.ended':case 'session.closed':case 'session.expired':
    if(this.stage==='matched'){this.forfeited();this.leave('상대와의 연결이 끝났다')}return;
   default:return;
  }
 },
 // Hand a payload to the other player.
 send(payload){
  if(this.stage!=='matched')return false;
  return Spectate.send({type:'relay.message',sessionToken:this.token,clientMessageId:'d'+(++this.sent),payload});
 },
 // Take what has arrived since the last call.
 take(){const list=this.inbox;this.inbox=[];return list},
 // Both ghosts go into the duel on the server before anything is played (the server lets a ghost be in one duel at a time). A server that does not know the
 // stakes yet makes this a practice duel; a ghost that is busy, or a server that cannot be reached, stops it here.
 async lockMine(){
  const match=this.matchId;let refused='';
  this.stakes=false;
  if(PlayStats.endpoint()&&this.mineGhostId){
   let reply=null;
   try{reply=await PlayStats.ghostLock(this.mineGhostId,match)}catch(error){ignoreError('duel lock not sent',error)}
   if(this.matchId!==match||this.stage!=='matched')return;
   if(!reply)refused='서버에 연결하지 못해 망령을 걸 수 없다.';
   else if(reply.ok){this.stakes=true;lsSet(PlayStats.STAKES_KEY,'1')}
   else if(['busy','none','duel','auth'].includes(reply.error))refused=reply.error==='busy'?'이 망령은 다른 대전에 묶여 있다.':'이 망령을 걸 수 없다.';
  }
  if(refused){this.leave(refused);return}
  this.locked=true;
  if(this.role==='guest')this.send({kind:'hello',body:this.mineBody});
  else if(this.helloBody!==null)this.startFight(Math.floor(Math.random()*DUEL_ARENAS.length),this.helloBody);
 },
 leave(note=''){
  if(this.stakes&&this.locked&&!this.fighting&&this.mineGhostId)PlayStats.ghostRelease(this.mineGhostId,this.matchId).catch(error=>ignoreError('duel release not sent',error));
  if(this.stage==='matched')Spectate.send({type:'session.leave',sessionToken:this.token});
  else if(this.stage==='queued'||this.stage==='offered')Spectate.send({type:'match.cancel',matchId:this.matchId});
  this.token='';this.matchId='';this.role='';this.remote='';this.fighting=false;this.setStage('idle',note);
 },

 // ---- the way in: the title button ---------------------------------------------------------------------------------------------
 // A panel with the player's own ghosts (the ones still standing); choosing one fetches its saved character, looks for an opponent and, when both have one,
 // the fight begins on its own. The panel shows what the search is doing and can cancel it.
 openPicker(){
  if(document.getElementById('duelScene'))return false;
  const scene=Spectate.el('div'),panel=Spectate.el('div','spectatePanel'),head=Spectate.el('header'),close=Spectate.el('button',null,'×'),note=Spectate.el('p','spectateHint',''),list=Spectate.el('div','duelGhosts');
  scene.id='duelScene';scene.setAttribute('role','dialog');scene.setAttribute('aria-label','망령전');note.id='duelNote';list.id='duelGhosts';
  close.type='button';close.id='duelClose';close.setAttribute('aria-label','닫기');close.onclick=()=>this.closePicker();
  head.append(Spectate.el('h2',null,'망령전'),close);panel.append(head,note,list);scene.append(panel);document.body.append(scene);
  this.ghosts=null;this.pickNote='';this.loadMine();return true;
 },
 closePicker(){
  if(this.stage==='queued'||this.stage==='offered'||this.stage==='connecting')this.leave('취소했다');
  this.pending=null;document.getElementById('duelScene')?.remove();
 },
 async loadMine(){
  const url=PlayStats.endpoint();
  if(!url){this.pickNote='수집 서버가 연결되어 있지 않다.';this.renderPicker();return}
  this.pickNote='내 망령을 불러오는 중…';this.renderPicker();
  try{
   const data=await PlayStats.fetchView(url,'ghosts&'+PlayStats.ownerQuery());
   this.ghosts=Array.isArray(data?.list)?data.list.filter(g=>g.status==='alive'):null;
   this.pickNote=this.ghosts?(this.ghosts.length?'출전할 망령을 고른다. 지면 가진 것을 모두 잃고, 이기면 상대의 것을 모두 가져간다.':'출전할 망령이 없다. 깊이 순위권에 든 채 죽으면 망령이 남는다.'):'망령을 불러오지 못했다.';
  }catch(error){ignoreError('duel ghosts load failed',error);this.ghosts=null;this.pickNote='망령을 불러오지 못했다.'}
  this.renderPicker();
 },
 async choose(row){
  if(this.stage!=='idle')return;
  const url=PlayStats.endpoint();
  this.pickNote='망령을 깨우는 중…';this.renderPicker();
  try{
   const data=await PlayStats.fetchView(url,'ghost&'+PlayStats.ownerQuery()+'&id='+encodeURIComponent(row.id));
   if(!data?.body){this.pickNote='이 망령의 본문을 받지 못했다.';this.renderPicker();return}
   this.pending={row,body:data.body};this.pickNote='';this.renderPicker();
  }catch(error){ignoreError('duel ghost fetch failed',error);this.pickNote='이 망령의 본문을 받지 못했다.';this.renderPicker()}
 },
 // What the ghost carries and wears: it is all at stake, so the player sees it and confirms before the search begins.
 stakeText(body){
  let ghost;try{ghost=JSON.parse(body)}catch(error){ignoreError('duel ghost body unreadable',error);ghost={}}
  const worn=['weapon','armor','cloak','relic','trinket'].filter(slot=>ghost[slot]).length,bag=Array.isArray(ghost.inventory)?ghost.inventory.length:0;
  return `소지품 ${bag}개와 장비 ${worn}개를 건다. 지면 이 망령과 가진 것이 모두 사라진다. 이기면 상대 망령이 가진 것을 모두 얻는다.`;
 },
 renderPicker(){
  const scene=document.getElementById('duelScene');
  if(!scene)return;
  if(this.stage==='matched'){scene.remove();return}
  const note=document.getElementById('duelNote'),list=document.getElementById('duelGhosts'),busy=this.stage!=='idle';
  note.textContent=busy?this.note:this.pickNote;
  list.replaceChildren();
  if(this.pending&&!busy){
   note.textContent=this.stakeText(this.pending.body);
   const go=Spectate.el('button','duelGhost','건다'),back=Spectate.el('button',null,'돌아가기');go.type=back.type='button';go.id='duelConfirm';back.id='duelBack';
   go.onclick=()=>{const {row,body}=this.pending;this.pending=null;this.find(true,body,row.floor,row.id)};back.onclick=()=>{this.pending=null;this.renderPicker()};
   list.append(go,back);return;
  }
  if(busy){const cancel=Spectate.el('button',null,'그만두기');cancel.type='button';cancel.onclick=()=>this.leave('취소했다');list.append(cancel);return}
  for(const row of this.ghosts||[]){
   const button=Spectate.el('button','duelGhost');button.type='button';button.dataset.ghost=row.id;
   button.append(Spectate.el('b',null,`${row.floor}층 · Lv ${row.level}`),Spectate.el('span',null,row.cause));button.onclick=()=>this.choose(row);list.append(button);
  }
 },
 // ---- winnings: what a won duel took from the other ghost waits on the server until the next new run, and goes into that run's start chest ----
 async claimWinnings(){
  if(!PlayStats.endpoint()||!lsGet(PlayStats.STAKES_KEY)||!state||state.duel||runIsEphemeral()||state.debugMapGeneration57)return;
  let reply=null;
  try{reply=await PlayStats.lootClaim()}catch(error){ignoreError('duel winnings not claimed',error)}
  if(reply?.ok&&Array.isArray(reply.items)&&reply.items.length)this.deliver(reply.items);
 },
 // Into the start chest if it is still shut; if the player has opened it already (or there is none), straight into the bag.
 deliver(items){
  const chest=state?.tutorialChest;
  if(chest&&!chest.opened){chest.loot=[...(chest.loot||[]),...items];addLog('망령전의 전리품이 시작 상자에 들어 있다.');return}
  for(const item of items)addInventoryItem(item);
  addLog('망령전의 전리품을 받았다.');
 },
 // ---- the fight: each side plays its own real game ---------------------------------------------------------------------------
 // Both players run the real game on their own page (the arena of duelarenas.js as a run, their own ghost as the player: real inventory, skills, screen). The
 // other player is a stand-in creature (`duelOpponent`, with the stats of the other's ghost) that stands where the other player stands. Four things cross:
 // `sync` (where the sender stands, its health, whose turn it is), `hit` (damage the sender dealt to the stand-in: the receiver takes it as its own player),
 // `result` (who won) and the setup (`hello`, `start`). Self-effects (potions, equipment, buffs) need no message; effects that put something on the map (fields,
 // terrain) do not cross yet. One side acts at a time, twenty seconds each, the host first; nothing is calculated by the relay.
 begin(arena,theirsBody){
  if(this.stage!=='matched'||!DUEL_ARENAS[arena]||this.fighting)return false;
  this.fighting=true;this.arena=arena;this.lastSig='';this.reported=false;this.outcome='';
  this.theirs=theirsBody?JSON.parse(theirsBody):null;
  newGame(CLASSES[0],{arena,role:this.role,ghost:this.mineBody?JSON.parse(this.mineBody):null,opponent:this.theirs,baseFloor:this.mineFloor});
  this.giveTurn('host');
  return true;
 },
 // Host: choose the arena, begin, and tell the guest (with the host's ghost, so that the guest can stand its stand-in up).
 startFight(arena,guestBody=''){
  if(this.role!=='host'||!this.begin(arena,guestBody))return false;
  this.send({kind:'start',arena,body:this.mineBody});
  return true;
 },
 // What the fight itself passes over the relay; true when the payload was one of its own.
 fightMessage(payload){
  if(!payload||typeof payload!=='object')return false;
  switch(payload.kind){
   case 'hello':if(this.role!=='host')return false;if(this.locked)this.startFight(Math.floor(Math.random()*DUEL_ARENAS.length),String(payload.body||''));else this.helloBody=String(payload.body||'');return true;
   case 'start':if(this.role==='guest')this.begin(payload.arena,String(payload.body||''));return this.role==='guest';
   case 'sync':this.applySync(payload);return true;
   case 'hit':this.applyHit(payload);return true;
   case 'status':this.applyStatus(payload);return true;
   case 'field':this.applyField(payload);return true;
   case 'terrain':this.applyTerrain(payload);return true;
   case 'tile':this.applyTile(payload);return true;
   case 'jar':this.applyJar(payload);return true;
   case 'item':this.applyItem(payload);return true;
   case 'result':this.applyResult(payload);return true;
   default:return false;
  }
 },
 opponent(){return state?.duel?state.monsters.find(m=>m.duelOpponent):null},
 other(){return this.role==='host'?'guest':'host'},
 // The stand-in follows the other player.
 applySync(sync){
  const stand=this.opponent();
  if(!stand||this.reported)return;
  if(Number.isFinite(sync.x)&&Number.isFinite(sync.y)&&(stand.x!==sync.x||stand.y!==sync.y)){stand.x=sync.x;stand.y=sync.y;OccupancyService.move(stand,sync.x,sync.y)}
  if(Number.isFinite(sync.hp))stand.hp=Math.max(0,sync.hp);
  if(Number.isFinite(sync.maxHp))stand.maxHp=sync.maxHp;
  if(sync.facing)stand.facing=sync.facing;
  if(sync.turn===this.role&&this.turn!==this.role)this.giveTurn(this.role);
  VisibilityService.compute();updateAll();
 },
 // Damage the other player dealt to its stand-in on its page: here it is taken by the real player.
 applyHit(hit){
  const stand=this.opponent();
  // Only what the other side does in its own turn counts: a hit that arrives while it is this side's turn was not dealt by the rules.
  if(!stand||state.dead||this.reported||!(hit.amount>0)||this.turn!==this.other())return;
  this.applying=true;
  try{damageEntity(state.player,Math.round(hit.amount),stand,hit.element||null)}finally{this.applying=false}
  updateAll();
 },
 // Sent from damageEntity when the stand-in is hurt by this player.
 sendHit(amount,element){if(!this.applying&&!this.environment&&!state._turnPipelineActive57)this.send({kind:'hit',amount,element:element||null})},
 // What this player puts on the map in its own action (a field, a stretch of terrain) is put on the other player's map by the same game functions, with the
 // stand-in as the source; what the map then does to whoever stands there (and what a burning or poisoned stand-in takes at the end of a turn) is the map's own work on each side: damage dealt inside the turn engine or by a field's contact is not sent as a hit. Reactions inside the
 // turn engine run on both sides by themselves and are not sent.
 mirrored(){return this.stage==='matched'&&state?.duel&&!this.applying&&!this.environment&&!state._turnPipelineActive57},
 // True while the other player is the one acting: what it sends is replayed here only then, and only through `replay`, which keeps the replay itself from being sent back.
 theirTurn(){return !!this.opponent()&&!state.dead&&!this.reported&&this.turn===this.other()},
 replay(work){
  if(!this.theirTurn())return;
  this.applying=true;
  try{work()}finally{this.applying=false}
  updateAll();
 },
 sendField(kind,x,y,ttl,cells,metadata){
  if(!this.mirrored())return;
  const {owner,credit,sourceFaction,friendlyFire,...rest}=metadata||{};
  this.send({kind:'field',field:kind,x,y,ttl,cells:cells||null,metadata:rest});
 },
 sendTerrain(x,y,tile,ttl,kind,opts){
  if(!this.mirrored())return;
  this.send({kind:'terrain',x,y,tile,ttl,terrain:kind,opts:{allowedOld:opts?.allowedOld,source:opts?.source,overlapSolid:opts?.overlapSolid}});
 },
 applyField(field){
  const stand=this.opponent();
  if(!stand||!field.field)return;
  this.replay(()=>addField(field.field,field.x,field.y,field.ttl,field.cells,{...(field.metadata||{}),...effectSource57(stand)}));
 },
 applyTerrain(terrain){
  this.replay(()=>RuntimeTerrainOwner.temporary(terrain.x,terrain.y,terrain.tile,terrain.ttl,terrain.terrain,terrain.opts||{}));
 },
 // A tile the player's action changed for good (a broken piece of furniture, a burnt door…), a jar that broke, an item dropped or picked up: each is done here by the
 // same function that did it there.
 sendTile(x,y,tile,opts){
  if(this.mirrored())this.send({kind:'tile',x,y,tile,opts:{source:opts?.source,overlapSolid:opts?.overlapSolid}});
 },
 applyTile(tile){this.replay(()=>RuntimeTerrainOwner.mutate(tile.x,tile.y,tile.tile,tile.opts||{}))},
 sendJar(x,y,opts){
  if(this.mirrored())this.send({kind:'jar',x,y,opts:{forced:!!opts?.forced,from:opts?.from||null}});
 },
 applyJar(jar){this.replay(()=>state.map[jar.y]?.[jar.x]===TT.JAR?destroyJar57(jar.x,jar.y,jar.opts||{}):shatterJar(jar.x,jar.y,jar.opts||{}))},
 sendItem(act,item,x,y){
  if(this.mirrored())this.send({kind:'item',act,item:act==='drop'?item:{name:item.name},x,y});
 },
 applyItem(m){
  this.replay(()=>{
   if(m.act==='drop'&&m.item&&Number.isFinite(m.x)&&Number.isFinite(m.y))PlacementService.placeItem(clone(m.item),{x:m.x,y:m.y});
   else if(m.act==='take'){const at=state.items.find(i=>i.x===m.x&&i.y===m.y&&i.name===m.item?.name);if(at)OccupancyService.removeItem(at)}
  });
 },
 // A status the other player put on its stand-in (poison, stun…): the real player takes it here, with its own resistance.
 sendStatus(effect,turns,chance){if(!this.applying)this.send({kind:'status',effect,turns,chance})},
 applyStatus(status){
  if(!state?.duel||state.dead||this.reported||!status.effect||!(status.turns>0)||this.turn!==this.other())return;
  this.applying=true;
  try{applyHostileStatus(status.effect,status.turns,status.chance??1,{})}finally{this.applying=false}
  updateAll();
 },
 // The fight is over for this side. With the ghost at stake, the server is told how it ended (and asked again until the other side has said its part too).
 conclude(outcome){
  this.reported=true;this.outcome=outcome;
  if(this.stakes&&this.mineGhostId)this.settling={won:outcome==='win',match:this.matchId,ghost:this.mineGhostId,next:0,until:Date.now()+13*60*1000,busy:false};
 },
 async pollSettle(now){
  const job=this.settling;
  if(!job||job.busy||now<job.next)return;
  if(Date.now()>job.until){this.settling=null;return}
  job.busy=true;
  try{
   const reply=await PlayStats.ghostSettle(job.ghost,job.match,job.won);
   if(reply?.ok&&reply.state&&reply.state!=='pending'){
    this.settling=null;
    const text={won:'판돈 정산: 상대 망령의 것을 모두 얻었다. 새 판을 시작하면 시작 상자에 들어 있다.',lost:'판돈 정산: 이 망령은 사라졌다. 가진 것도 모두 잃었다.',void:'판돈 정산: 양쪽의 말이 같아 무효가 되었다. 아무도 잃지 않았다.'}[reply.state];
    if(text){addLog(text);toast(text)}
  }
  }catch(error){ignoreError('duel settle not sent',error)}
  job.busy=false;job.next=now+4000;
 },
 applyResult(result){
  if(!state?.duel||this.reported)return;
  if(result.winner===this.role){
   this.conclude('win');
   const stand=this.opponent();
   if(stand){stand.hp=0;killMonster(stand)}
  }else{this.conclude('lose');if(!state.dead)die('상대 망령')}
 },
 // This side won by its own hand (the stand-in fell on this page): tell the other.
 reportWin(){
  if(this.stage!=='matched'||this.reported)return;
  this.conclude('win');
  this.send({kind:'result',winner:this.role});
 },
 // The other side is gone in the middle of a fight (the relay ended the session): the one that stays wins. A session the relay has ended cannot be taken up
 // again, so nothing waits for a return.
 forfeited(){
  if(!state?.duel||state.duel.won||state.dead||this.reported)return;
  const stand=this.opponent();
  this.conclude('win');
  if(stand){addLog('상대 망령이 자리를 떠났다.');stand.hp=0;killMonster(stand)}
 },
 // ---- turns: one side acts at a time, twenty seconds each ---------------------------------------------------------------------
 // The host acts first. A side's turn ends when it has acted (the game's turn counter moved) or when TURN_MS has passed (the turn is then spent waiting);
 // the next side is told in `sync`. The turn and its end are kept in `state.duel` for the top bar.
 myTurn(){return !state?.duel||this.stage!=='matched'||this.turn===this.role},
 giveTurn(side){
  this.turn=side;this.turnEnds=Date.now()+this.TURN_MS;this.turnSeen=state.turn;
  if(state?.duel){state.duel.turn=side;state.duel.turnEnds=this.turnEnds}
  this.lastSig='';
 },
 tickTurn(){
  if(!state?.duel||state.duel.finished||state.dead||this.turn!==this.role)return;
  if(state.turn!==this.turnSeen){this.giveTurn(this.other());return}
  if(Date.now()<this.turnEnds)return;
  addLog('시간이 다 되어 이번 차례를 넘겼다.');
  globalThis.__MANRU_TURN_ENGINE__.advance({handled:true,committed:true,timeCost:1,reason:'duel-timeout'});
  this.giveTurn(this.other());
 },
 // Every frame, on both sides.
 pump(now){
  this.pollSettle(now);
  if(this.stage!=='matched'||!state?.duel)return;
  const p=state.player;
  if(state.dead&&!this.reported){this.conclude('lose');this.send({kind:'result',winner:this.other()});return}
  if(this.reported)return;
  this.tickTurn();
  const second=Math.ceil((this.turnEnds-Date.now())/1000);
  if(second!==this.shown){this.shown=second;updatePanels()}
  const sig=[this.turn,second,p.x,p.y,p.hp,p.maxHp,state.turn].join(':');
  if(sig===this.lastSig||now-this.lastSend<this.SEND_GAP_MS)return;
  this.lastSig=sig;this.lastSend=now;
  this.send({kind:'sync',x:p.x,y:p.y,hp:p.hp,maxHp:p.maxHp,facing:p.facing,turn:this.turn,ends:this.turnEnds});
 },
};
