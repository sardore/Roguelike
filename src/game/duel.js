/* The ghost duel (docs/GHOST_BATTLE.md), first part: finding an opponent and passing payloads over the shared cp32 relay, mode MANRU_DUEL.
   The relay only matches two players and carries what they send; the game itself (arena, rules) is built on top of `send` and `inbox`.
   The socket is the one Spectate owns (one connection per page): Spectate hands every packet that is not about spectating to `receive` here. */
const Duel={
 MODE:'MANRU_DUEL',TURN_MS:20000,SEND_GAP_MS:120,
 stage:'idle',queueEntryId:'',matchId:'',token:'',role:'',remote:'',sent:0,inbox:[],note:'',play:false,acting:'host',guest:null,guestStatus:null,shown:0,turn:'host',turnEnds:0,turnSeen:0,mine:'',theirs:null,mineBody:'',outcome:'',reported:false,arena:-1,seq:0,lastSig:'',lastSend:0,keysBound:false,
 // idle -> connecting -> queued -> offered -> matched (the relay committed the session) -> idle again on leave or when the relay drops it
 setStage(stage,note=''){this.stage=stage;this.note=note;PlayStats.logAdd({a:'DUEL',stage,note,role:this.role,match:this.matchId});this.renderPicker()},
 find(play=false,body=''){
  if(this.stage!=='idle')return false;this.play=play;this.mineBody=body;this.theirs=null;
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
    if(this.play&&this.role==='guest')this.send({kind:'hello',body:this.mineBody});return;
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
 leave(note=''){
  if(this.stage==='matched')Spectate.send({type:'session.leave',sessionToken:this.token});
  else if(this.stage==='queued'||this.stage==='offered')Spectate.send({type:'match.cancel',matchId:this.matchId});
  document.getElementById('duelPack')?.remove();
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
  document.getElementById('duelScene')?.remove();
 },
 async loadMine(){
  const url=PlayStats.endpoint();
  if(!url){this.pickNote='수집 서버가 연결되어 있지 않다.';this.renderPicker();return}
  this.pickNote='내 망령을 불러오는 중…';this.renderPicker();
  try{
   const data=await PlayStats.fetchView(url,'ghosts&owner='+PlayStats.deviceTag());
   this.ghosts=Array.isArray(data?.list)?data.list.filter(g=>g.status!=='taken'):null;
   this.pickNote=this.ghosts?(this.ghosts.length?'출전할 망령을 고른다. 지면 가진 것을 모두 잃고, 이기면 상대의 것을 모두 가져간다.':'출전할 망령이 없다. 깊이 순위권에 든 채 죽으면 망령이 남는다.'):'망령을 불러오지 못했다.';
  }catch(error){ignoreError('duel ghosts load failed',error);this.ghosts=null;this.pickNote='망령을 불러오지 못했다.'}
  this.renderPicker();
 },
 async choose(row){
  if(this.stage!=='idle')return;
  const url=PlayStats.endpoint();
  this.pickNote='망령을 깨우는 중…';this.renderPicker();
  try{
   const data=await PlayStats.fetchView(url,'ghost&owner='+PlayStats.deviceTag()+'&id='+encodeURIComponent(row.id));
   if(!data?.body){this.pickNote='이 망령의 본문을 받지 못했다.';this.renderPicker();return}
   this.find(true,data.body);
  }catch(error){ignoreError('duel ghost fetch failed',error);this.pickNote='이 망령의 본문을 받지 못했다.';this.renderPicker()}
 },
 renderPicker(){
  const scene=document.getElementById('duelScene');
  if(!scene)return;
  if(this.stage==='matched'){scene.remove();return}
  const note=document.getElementById('duelNote'),list=document.getElementById('duelGhosts'),busy=this.stage!=='idle';
  note.textContent=busy?this.note:this.pickNote;
  list.replaceChildren();
  if(busy){const cancel=Spectate.el('button',null,'그만두기');cancel.type='button';cancel.onclick=()=>this.leave('취소했다');list.append(cancel);return}
  for(const row of this.ghosts||[]){
   const button=Spectate.el('button','duelGhost');button.type='button';button.dataset.ghost=row.id;
   button.append(Spectate.el('b',null,`${row.floor}층 · Lv ${row.level}`),Spectate.el('span',null,row.cause));button.onclick=()=>this.choose(row);list.append(button);
  }
 },
 // ---- the fight on a real map ------------------------------------------------------------------------------------------
 // The host owns the game: its own run is the arena (newGame with {arena,role}), the other player's ghost stands in it as `duelOpponent`
 // (duelarenas.js) and moves only by what arrives here. The guest owns no game: its screen is the host's state seen from the guest's
 // cell (`frameForGuest`), drawn by the spectator view of Spectate, and what it sends is a step (`input`). Frames and steps are payloads
 // of the relay, so nothing of the rules runs on the server.
 startFight(arena,guestBody=''){
  if(this.role!=='host'||this.stage!=='matched'||!DUEL_ARENAS[arena]||this.fighting)return false;this.fighting=true;
  this.arena=arena;this.seq=0;this.lastSig='';this.reported=false;this.outcome='';
  this.theirs=guestBody?JSON.parse(guestBody):null;this.guest=null;
  this.turn='host';
  newGame(CLASSES[0],{arena,role:'host',ghost:this.mineBody?JSON.parse(this.mineBody):null,opponent:this.theirs});
  this.guest=this.makeGuest(this.theirs);
  this.giveTurn('host');
  this.send({kind:'start',arena});return true;
 },
 // What the fight itself passes over the relay; true when the payload was one of its own.
 fightMessage(payload){
  if(!payload||typeof payload!=='object')return false;
  if(payload.kind==='hello'&&this.role==='host'){this.startFight(Math.floor(Math.random()*DUEL_ARENAS.length),String(payload.body||''));return true}
  if(payload.kind==='start'&&this.role==='guest'){this.enterGuest(payload.arena);return true}
  if(payload.kind==='frame'&&this.role==='guest'){Spectate.applyFrame({kind:'snapshot',seq:payload.seq,frame:payload.frame});this.renderPack();return true}
  if(payload.kind==='input'&&this.role==='host'){this.applyInput(payload);return true}
  if(payload.kind==='use'&&this.role==='host'){this.useAsGuest(Number(payload.index));return true}
  if(payload.kind==='result'&&this.role==='guest'){this.outcome=payload.winner==='guest'?'win':'lose';Spectate.viewerNotice(this.outcome==='win'?'승리했다.':'패배했다.');return true}
  return false;
 },
 enterGuest(arena){
  this.arena=arena;this.seq=0;
  Spectate.watching={matchId:'duel'};Spectate.view=null;Spectate.floorKey='';
  if(!this.keysBound){this.keysBound=true;addEventListener('keydown',event=>this.guestKey(event),true)}
 },
 // The guest's keys: a step (arrow keys, WASD) or nothing. Bound before the spectator view binds its own, which swallows every key.
 guestKey(event){
  if(this.role!=='guest'||this.stage!=='matched'||!state?.spectator)return;
  const dir={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],w:[0,-1],s:[0,1],a:[-1,0],d:[1,0]}[event.key];
  if(!dir)return;
  event.preventDefault();event.stopImmediatePropagation();
  this.send({kind:'input',dx:dir[0],dy:dir[1]});
 },
 // Host: one step of the other player's ghost. Walking into the host player is an attack, as for any creature.
 applyInput(input){
  const opponent=state?.duel&&state.monsters.find(m=>m.duelOpponent);
  if(!opponent||opponent.hp<=0||state.dead||this.turn!=='guest')return;
  const dx=Math.sign(Number(input.dx)||0),dy=Math.sign(Number(input.dy)||0);
  if(!dx&&!dy)return;
  opponent.facing={x:dx,y:dy};
  const x=opponent.x+dx,y=opponent.y+dy,player=state.player;
  if(player.x===x&&player.y===y)attackMonster(opponent,0,{target:player});
  else if(PlacementService.canPlaceEntity(opponent,x,y))moveMonsterStep(opponent,x,y);
  VisibilityService.compute();updateAll();
  this.giveTurn('host');
 },
 // The other side is gone in the middle of a fight (the relay ended the session): the one that stays wins. The host brings the other ghost down, which opens
 // its door as any win does; the guest is told. There is no waiting for a return, since a session the relay has ended cannot be taken up again.
 forfeited(){
  if(this.role==='host'&&state?.duel&&!state.duel.won&&!state.dead){
   const opponent=state.monsters.find(m=>m.duelOpponent);
   if(opponent){addLog('상대 망령이 자리를 떠났다.');opponent.hp=0;killMonster(opponent);this.reported=true;this.outcome='win'}
  }else if(this.role==='guest'&&state?.spectator){Spectate.viewerNotice('상대와의 연결이 끊겼다.');this.outcome='win'}
 },
 // ---- the guest's own actions -------------------------------------------------------------------------------------------------
 // The game's rules read one player (`state.player`, `state.status`). To let the guest use what it carries, the host puts the guest's ghost in that place for
 // the length of one action and the host's player among the creatures as a stand-in (`duelProxy`, which takes no turn), runs the game's own code, and puts
 // everything back; the health either side lost or gained is carried over. `acting` says whose action it is (cooldowns are kept per side).
 makeGuest(ghost){
  if(!ghost)return null;
  const cls=CLASSES.find(c=>c.id===ghost.classId)||CLASSES[0],fresh=createRunState57(cls),saved=state.player;
  state.player=fresh.player;
  try{reviveGhost(fresh.player,JSON.parse(JSON.stringify(ghost)))}finally{state.player=saved}
  this.guestStatus=fresh.status;
  return fresh.player;
 },
 asGuest(action){
  const host=state.player,hostStatus=state.status,opponent=state.monsters.find(m=>m.duelOpponent),guest=this.guest;
  if(!opponent||!guest)return false;
  Object.assign(guest,{x:opponent.x,y:opponent.y,hp:opponent.hp,maxHp:opponent.maxHp,facing:opponent.facing||{x:-1,y:0}});
  const proxy={name:'상대 망령',shape:'human',kind:'human',duelProxy:true,x:host.x,y:host.y,hp:host.hp,maxHp:host.maxHp,atk:host.baseAtk,def:host.baseDef,eva:host.baseEva,color:host.color,rewardPolicy57:{xp:false,kills:false,drops:false}};
  state.player=guest;state.status=this.guestStatus;state.monsters=[...state.monsters.filter(m=>m!==opponent),proxy];this.acting='guest';
  try{return action()}
  finally{
   this.acting='host';
   state.player=host;state.status=hostStatus;state.monsters=[...state.monsters.filter(m=>m!==proxy),opponent];
   opponent.hp=Math.max(0,guest.hp);opponent.maxHp=guest.maxHp;host.hp=Math.min(host.maxHp,Math.max(0,proxy.hp));
   if(host.hp<=0&&!state.dead)die('상대 망령');
  }
 },
 // The guest uses a potion from its pack (index into its inventory).
 useAsGuest(index){
  const item=this.guest?.inventory?.[index];
  if(!item||item.type!=='potion'||item.throwable||this.turn!=='guest')return false;
  const used=this.asGuest(()=>useInventoryItem(index));
  if(used)this.giveTurn('host');
  return !!used;
 },
 // What the guest's screen lists as its pack: the potions it can drink.
 pack(){return (this.guest?.inventory||[]).map((item,i)=>({i,name:item.name,n:item.count||1,type:item.type,throwable:!!item.throwable})).filter(e=>e.type==='potion'&&!e.throwable)},
 // Guest screen: a bar with the potions it can drink (enabled on its own turn).
 renderPack(){
  let bar=document.getElementById('duelPack');
  if(this.role!=='guest'||!state?.spectator){bar?.remove();return}
  if(!bar){bar=Spectate.el('div');bar.id='duelPack';document.body.append(bar)}
  bar.replaceChildren();
  for(const entry of state.duel?.pack||[]){
   const button=Spectate.el('button',null,`${entry.name} ×${entry.n}`);button.type='button';button.dataset.pack=entry.i;button.disabled=state.duel.turn!=='guest';
   button.onclick=()=>this.send({kind:'use',index:entry.i});bar.append(button);
  }
  bar.hidden=!bar.children.length;
 },
 // ---- turns: one side acts at a time, twenty seconds each ---------------------------------------------------------------------
 // The host acts first. Its turn ends when its action was taken (the game's turn counter moved) or when TURN_MS has passed (then the turn is spent waiting);
 // the guest's turn ends with its step or when TURN_MS has passed. The turn and its end are kept in `state.duel` so that the guest's screen shows them.
 myTurn(){return !state?.duel||this.stage!=='matched'||this.acting==='guest'||this.turn===(this.role==='guest'?'guest':'host')},
 giveTurn(side){
  this.turn=side;this.turnEnds=Date.now()+this.TURN_MS;this.turnSeen=state.turn;
  if(state?.duel){state.duel.turn=side;state.duel.turnEnds=this.turnEnds}
  this.lastSig='';
 },
 // Host, every frame.
 tickTurn(){
  if(!state?.duel||state.duel.finished||state.dead)return;
  if(this.turn==='host'&&state.turn!==this.turnSeen){this.giveTurn('guest');return}
  if(Date.now()<this.turnEnds)return;
  if(this.turn==='host'){
   addLog('시간이 다 되어 이번 차례를 넘겼다.');
   globalThis.__MANRU_TURN_ENGINE__.advance({handled:true,committed:true,timeCost:1,reason:'duel-timeout'});
   this.giveTurn('guest');
  }else{this.giveTurn('host')}
 },
 // Host, every frame: when the fight changed, send the guest a whole frame (the arenas are small, so there are no deltas to get wrong).
 pump(now){
  if(this.role==='guest'&&this.stage==='matched'&&state?.spectator&&state.duel?.turnEnds){const second=Math.ceil((state.duel.turnEnds-Date.now())/1000);if(second!==this.shown){this.shown=second;updatePanels()}return}
  if(this.role!=='host'||this.stage!=='matched'||!state?.duel||this.reported)return;
  const opponent=state.monsters.find(m=>m.duelOpponent),p=state.player;
  // The fight is over when one of the two is down: say so once, and stop sending frames.
  if(state.dead||!opponent||opponent.hp<=0){this.reported=true;this.outcome=state.dead?'lose':'win';this.send({kind:'result',winner:state.dead?'guest':'host'});return}
  if(now-this.lastSend<this.SEND_GAP_MS)return;
  this.tickTurn();
  const sig=[state.turn,p.x,p.y,p.hp,opponent.x,opponent.y,opponent.hp,state.log[0],this.turn,Math.ceil((this.turnEnds-Date.now())/1000)].join(':');
  if(sig===this.lastSig)return;
  this.lastSig=sig;this.lastSend=now;
  this.send({kind:'frame',seq:++this.seq,frame:this.frameForGuest()});
 },
 // The host's state as the guest sees it: the guest's ghost is `player`, the host's player is a creature standing where it stands, and what is
 // visible is worked out from the guest's cell. The host's own player, creatures, seen and visible are put back afterwards.
 frameForGuest(){
  const keep={player:state.player,monsters:state.monsters,seen:state.seen,visible:state.visible,duel:state.duel},host=state.player,opponent=state.monsters.find(m=>m.duelOpponent);
  try{
   state.player={...(this.theirs||host),baseVision:host.baseVision,x:opponent.x,y:opponent.y,hp:Math.max(0,opponent.hp),maxHp:opponent.maxHp,facing:opponent.facing||{x:-1,y:0}};
   state.monsters=[...keep.monsters.filter(m=>m!==opponent),{name:'상대 망령',shape:'human',kind:'human',x:host.x,y:host.y,hp:host.hp,maxHp:host.maxHp,atk:host.baseAtk,def:host.baseDef,eva:host.baseEva,color:host.color,facing:host.facing}];
   state.duel={...state.duel,pack:this.pack()};
   state.seen=new Set();state.visible=new Set();
   VisibilityService.compute();
   for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)state.seen.add(k(x,y));
   return Spectate.diff(Spectate.project(),null);
  }finally{Object.assign(state,keep)}
 },
};
