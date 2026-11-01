/* Live spectating over the shared cp32 relay (its generic `spectator.action` channel; no server change).
   Host: a player who allows it. Only what the host's own screen shows leaves the device: cells in `seen`, creatures in `visible`.
   Viewer: draws a read-only copy with the game's own renderer; scroll and zoom are the viewer's, nothing else is accepted.
   The relay never fans out, so the host sends every packet once per viewer and relays chat itself. */
const Spectate={
 RELAY:'cp32-online-relay-v1',TAG:'manru-spectate-r1',ANNOUNCE_MS:1500,HEARTBEAT_MS:10000,SEND_GAP_MS:140,IDLE_GAP_MS:600,RESYNC_TURNS:120,MAX_VIEWERS:8,
 CHAT_MAX:120,CHAT_GAP_MS:1000,CHAT_KEEP:200,
 // The keys drawMap reads (measured with a read-recording proxy); nothing else is ever sent.
 PLAIN:['floor','specialFloor','turn','dead','victory','floorFeeling62','branchContext105','artifactDungeon46','floorStyle980','status','legendTheme47','specialPlaces52','playerAttackUntil','playerHitUntil','martialEcho'],
 CELLS:['outerWall94','subthemeFloors972','subthemeWalls970','archDecor1020','floorPattern1022','rugPattern1022','terrainUnderlay58','terrainAttachment58'],
 ENTITIES:['monsters','items','decor','decals','neutralInteractables58','tempFields','elementFields74','tempTerrain74','branchPortals105','legendLights49','jarGasFields57','gazeBursts57','legendFireFields47','legendSkyAxes47'],
 PLAYER:['classId','name','x','y','hp','maxHp','level','hunger','color','facing','weapon','armor','cloak','relic','trinket','combustion105','martialActor105','guardReady1005','strongReady','classState'],
 net:'',netDetail:'',listedAt:0,retryAt:0,listOpen:false,waking:false,readyAt:0,netError:false,VIEWER_PING_MS:10000,VIEWER_TTL_MS:30000,lastWatch:0,REPLAY:true,REPLAY_KEEP:40,REPLAY_STEP_MS:520,recs:[],replaying:null,selfId:'',liveRun:null,
 ws:null,connecting:false,ready:false,role:null,playerId:'',lastBeat:0,lastAnnounce:0,lastSend:0,reconnectAt:0,
 hosting:false,viewers:new Map(),mirror:null,seq:0,sentTurns:0,lastSig:'',lastChat:new Map(),
 watching:null,lastSeq:-1,rooms:new Map(),view:null,chat:[],unread:0,bound:false,
 endpoint(){return document.querySelector('meta[name="manru-relay"]')?.content.trim()||''},
 httpBase(){return this.endpoint().replace(/^ws/,'http').replace(/\/[^/]*$/,'')},
 // ---- transport -------------------------------------------------------------------------------------------------------
 // What the connection is doing: shown to the person (list note, settings line) and kept in the debug log for reports.
 setNet(stage,detail){
  if(this.net===stage&&this.netDetail===detail)return;
  this.net=stage;this.netDetail=detail;
  PlayStats.logAdd({a:'SPECTATE',role:this.role,stage,detail,hosting:this.hosting,ready:this.ready,viewers:this.viewers.size,rooms:this.rooms.size});
  this.updateHostPanel();this.renderRooms();
 },
 open(role){
  const url=this.endpoint();if(!url||this.ws)return false;
  this.role=role;this.connecting=true;this.playerId=this.playerId||'manru-'+Math.random().toString(36).slice(2,12);
  this.setNet('connecting',role==='host'?'방송 서버에 연결하는 중…':'서버에 연결하는 중…');
  try{this.ws=new WebSocket(url)}catch(error){ignoreError('spectate socket refused',error);this.connecting=false;this.setNet('failed','연결을 열 수 없다: '+(error?.message||error));return false}
  const ws=this.ws;
  ws.onopen=()=>{this.setNet('hello','서버에 인사하는 중…');this.send({type:'relay.hello',sessionGeneration:0})};
  ws.onmessage=event=>{try{this.receive(JSON.parse(event.data))}catch(error){ignoreError('spectate packet unreadable',error)}};
  ws.onclose=event=>{if(this.ws===ws){const was=this.ready;this.ws=null;this.ready=false;this.connecting=false;this.listedAt=0;this.setNet('failed',(was?'연결이 끊겼다':'서버에 연결하지 못했다')+' (코드 '+(event?.code??'?')+(event?.reason?' · '+event.reason:'')+')');this.onClosed()}};
  ws.onerror=()=>{this.netError=true};
  return true;
 },
 send(packet){
  if(this.ws?.readyState!==1)return false;
  try{this.ws.send(JSON.stringify({protocol:this.RELAY,playerId:this.playerId,...packet}));return true}catch(error){ignoreError('spectate send failed',error);return false}
 },
 act(action,fields={}){return this.send({type:'spectator.action',action,...fields})},
 close(){const ws=this.ws;this.ws=null;this.ready=false;this.connecting=false;try{ws?.close()}catch(error){ignoreError('spectate close failed',error)}},
 onClosed(){
  this.retryAt=performance.now()+5000;
  if(this.hosting)this.reconnectAt=performance.now()+4000;
  else if(this.watching)this.viewerNotice('연결이 끊겼다. 방송이 끝났거나 네트워크가 불안정하다.');
 },
 // Wake the free relay instance before the first connection (it sleeps after 15 quiet minutes).
 async wake(){
  const base=this.httpBase();if(!base)return false;
  try{const reply=await fetch(base+'/health',{cache:'no-store',signal:typeof AbortSignal.timeout==='function'?AbortSignal.timeout(70000):undefined});this.setNet('woke','서버가 응답했다 (HTTP '+reply.status+')');return reply.ok}
  catch(error){ignoreError('relay wake failed',error);this.setNet('wakeFailed','서버가 응답하지 않는다: '+(/Abort|Timeout/.test(error?.name)?'시간 초과':(error?.message||error)));return false}
 },
 receive(packet){
  if(packet.type==='relay.ready'){this.selfId=packet.connectionId||'';this.ready=true;this.connecting=false;this.lastBeat=performance.now();this.setNet('ready',this.hosting?'서버에 연결됨':'서버에 연결됨');this.onReady();return}
  if(packet.type==='session.failed'){this.setNet('refused','서버가 거절했다: '+(packet.code||'')+' '+(packet.detail||''));return}
  if(packet.type!=='spectator.event')return;
  const data=packet.payload||{};
  if(data.tag&&data.tag!==this.TAG)return;
  if(this.hosting)this.hostEvent(packet.action,packet.fromId,data);
  else this.viewerEvent(packet.action,packet.fromId,packet.matchId,data);
 },
 onReady(){
  if(this.hosting){for(const v of this.viewers.values())v.needFull=true;this.listedAt=0;this.readyAt=performance.now();this.act('browse');this.announce(true);this.updateHostPanel()}
  else if(this.role==='viewer'){this.act('browse');if(this.watching)this.watchPing(performance.now(),true)}
 },
 // Called from the frame loop: heartbeat, announce, reconnect and the per-turn frame all hang on this one clock.
 // The relay does not tell the host when a viewer's socket dies, so viewers say they are still there.
 watchPing(now,force){
  if(!force&&now-this.lastWatch<this.VIEWER_PING_MS)return;
  this.lastWatch=now;this.act('watch',{matchId:this.watching.matchId,payload:{tag:this.TAG}});
 },
 tick(now){
  if(!this.hosting&&state&&!state.spectator&&!state.debugBattle57&&!this.listOpen&&!this.watching)this.startHosting();
  if(this.ws&&this.ready&&now-this.lastBeat>this.HEARTBEAT_MS){this.lastBeat=now;this.send({type:'heartbeat',at:Date.now()})}
  if(this.watching&&this.ready&&!this.replaying)this.watchPing(now);
  if(this.listOpen&&!this.watching&&!this.ws&&!this.connecting&&!this.waking&&now>=this.retryAt)this.startList();
  if(this.hosting&&this.ready&&!this.listedAt&&now-this.readyAt>8000&&this.net!=='unlisted')this.setNet('unlisted','서버에 연결되었지만 방송 목록에 오르지 않았다');
  if(this.hosting){
   for(const [id,v] of this.viewers)if(now-v.seenAt>this.VIEWER_TTL_MS){this.viewers.delete(id);this.lastChat.delete(id);this.updateHostPanel()}
   if(!this.ws&&!this.connecting&&now>=this.reconnectAt)this.open('host');
   if(this.ready&&now-this.lastAnnounce>this.ANNOUNCE_MS)this.announce(false);
  }
  if(!state?.spectator&&(this.hosting||this.REPLAY)&&now-this.lastSend>=(this.hosting&&this.ready&&this.viewers.size?this.SEND_GAP_MS:this.IDLE_GAP_MS))this.observe(now);
  if(this.hosting&&this.liveRun&&this.ready&&state?.runId984!==this.liveRun)this.endBroadcast();
 },
 // ---- host ------------------------------------------------------------------------------------------------------------
 // Broadcasting is always on while a run is played (there is no off switch); the viewer list and watching pause it.
 startHosting(){
  if(this.hosting||!this.endpoint())return;
  this.hosting=true;this.viewers.clear();this.mirror=null;this.lastChat.clear();this.reconnectAt=0;
  this.wake().then(()=>{if(this.hosting&&!this.ws)this.open('host')});
  this.updateHostPanel();
 },
 announce(force,ended=false){
  this.lastAnnounce=performance.now();
  if(!state||!state.player||state.spectator||state.debugBattle57||(!state.runId984&&!ended))return;
  this.act('announce',{matchId:String(state.runId984),payload:{protocol:this.TAG,tag:this.TAG,matchId:String(state.runId984),cls:state.player.classId,floor:state.floor,turn:state.turn,hp:state.player.hp,maxHp:state.player.maxHp,spectators:this.viewers.size,updatedAt:Date.now(),ended}});
 },
 hostEvent(action,fromId,data){
  if(action==='announce'){if(fromId===this.selfId||data.matchId===String(state?.runId984)){const first=!this.listedAt;this.listedAt=performance.now();if(first)this.setNet('listed','방송 목록에 올랐다')}return}
  if(!fromId)return;
  if(action==='watch'){
   if(this.viewers.size>=this.MAX_VIEWERS&&!this.viewers.has(fromId)){this.toViewer(fromId,'snapshot',{tag:this.TAG,kind:'full',refused:'가득 찼다'});return}
   const known=this.viewers.get(fromId);
   if(known){known.seenAt=performance.now();if(data.resync)known.needFull=true;return}
   this.viewers.set(fromId,{joinedAt:performance.now(),seenAt:performance.now(),needFull:true});this.sysChat('관전자가 들어왔다 ('+this.viewers.size+')');this.updateHostPanel();
  }else if(action==='leave'){this.viewers.delete(fromId);this.lastChat.delete(fromId);this.updateHostPanel()}
  else if(action==='chat'&&this.viewers.has(fromId)){this.viewers.get(fromId).seenAt=performance.now();this.hostChatIn(fromId,data)}
 },
 toViewer(id,action,payload){return this.act(action,{matchId:state?.runId984?String(state.runId984):undefined,targetId:id,payload})},
 // The one place a state becomes a packet. Cells the host has not seen never enter `snap`.
 project(){
  const st=state,seen=st.seen,vis=st.visible,out={set:{},cells:{},seen:null,map:null,player:{}};
  const inSeen=key=>seen.has(key);
  for(const key of this.PLAIN)if(st[key]!==undefined)out.set[key]=st[key];
  if(st.stairs&&inSeen(st.stairs.x+','+st.stairs.y))out.set.stairs=st.stairs;
  const cellMap=obj=>{const r={};if(obj)for(const key in obj)if(inSeen(key))r[key]=obj[key];return r};
  for(const key of this.CELLS)out.cells[key]=cellMap(st[key]);
  const tr=st.terrainReactions105;
  if(tr){for(const key of ['burning','char','spills','unlit'])if(tr[key]&&typeof tr[key]==='object'&&!Array.isArray(tr[key]))out.cells['terrainReactions105.'+key]=cellMap(tr[key]);out.set.terrainReactions105Meta={version:tr.version,revision:tr.revision}}
  const hz=st.hazard1005;if(hz)for(const key of ['armed','collapsed'])out.cells['hazard1005.'+key]=cellMap(hz[key]);
  const visible=e=>vis.has(e.x+','+e.y),remembered=e=>seen.has(e.x+','+e.y);
  for(const key of this.ENTITIES){
   const list=st[key];if(!Array.isArray(list)){out.set[key]=[];continue}
   const keep=key==='monsters'?visible:remembered;
   out.set[key]=list.filter(e=>e&&Number.isFinite(e.x)&&Number.isFinite(e.y)&&keep(e)&&!(key==='monsters'&&e.hp<=0));
  }
  out.set.bookWalls1022=(st.bookWalls1022||[]).filter(e=>e&&(Number.isFinite(e.x)?remembered(e):true));
  out.set.rumorSpaces1030=(st.rumorSpaces1030||[]).filter(r=>r?.entry&&remembered(r.entry));
  if(st.branchTerrain105)out.set.branchTerrain105=this.branchFilter(st.branchTerrain105,inSeen);
  const p=st.player;for(const key of this.PLAYER)if(p[key]!==undefined)out.player[key]=p[key];
  out.seen=[...seen];out.visible=[...vis];
  // the map: real tiles for seen cells, a coarse wall/floor class for the ring around them (the wall renderer asks neighbours), void elsewhere
  const rows=st.map.length,cols=st.map[0].length,wallish=t=>t===TT.WALL||t===TT.HIDDEN_WALL||t===TT.WINDOW,grid=Array.from({length:rows},()=>new Array(cols).fill(TT.VOID));
  for(const key of seen){
   const comma=key.indexOf(','),x=+key.slice(0,comma),y=+key.slice(comma+1);
   if(!(y>=0&&y<rows&&x>=0&&x<cols))continue;
   grid[y][x]=st.map[y][x];
  }
  for(const key of seen){
   const comma=key.indexOf(','),x=+key.slice(0,comma),y=+key.slice(comma+1);
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
    const xx=x+dx,yy=y+dy;
    if(yy<0||yy>=rows||xx<0||xx>=cols||seen.has(xx+','+yy)||grid[yy][xx]!==TT.VOID)continue;
    grid[yy][xx]=wallish(st.map[yy][xx])?TT.WALL:TT.FLOOR;
   }
  }
  out.map=grid;return out;
 },
 branchFilter(bt,inSeen){
  const walk=(v,depth)=>{
   if(Array.isArray(v))return v.length&&v.every(row=>Array.isArray(row))?undefined:v.filter(e=>!e||typeof e!=='object'||!Number.isFinite(e.x)||inSeen(e.x+','+e.y));
   if(!v||typeof v!=='object')return v;
   const keys=Object.keys(v);
   if(keys.length&&keys.every(k=>/^-?\d+,-?\d+$/.test(k))){const r={};for(const k of keys)if(inSeen(k))r[k]=v[k];return r}
   if(depth>2)return undefined;
   const r={};for(const k of keys){const c=walk(v[k],depth+1);if(c!==undefined)r[k]=c}return r;
  };
  const r=walk(bt,0)||{};
  if(Array.isArray(bt.heights)){const h=bt.heights.map((row,y)=>row.map((value,x)=>inSeen(x+','+y)?value:0));r.heights=h}
  return r;
 },
 // Diff the projection against what this viewer set already holds, as small as the change allows.
 diff(now,prev){
  const out={set:{},cells:{},map:[],seenAdd:[]};
  const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  for(const key in now.set)if(!prev||!same(now.set[key],prev.set[key]))out.set[key]=now.set[key];
  out.set.player=now.player;
  for(const key in now.cells){
   const a=now.cells[key],b=prev?.cells[key]||{},add={},del=[];
   for(const c in a)if(!(c in b)||!same(a[c],b[c]))add[c]=a[c];
   for(const c in b)if(!(c in a))del.push(c);
   if(Object.keys(add).length||del.length)out.cells[key]={a:add,d:del};
  }
  const pm=prev?.map;
  for(let y=0;y<now.map.length;y++)for(let x=0;x<now.map[y].length;x++)if(!pm||pm[y]?.[x]!==now.map[y][x])out.map.push([x,y,now.map[y][x]]);
  const ps=prev?new Set(prev.seen):null;for(const c of now.seen)if(!ps||!ps.has(c))out.seenAdd.push(c);
  out.visible=now.visible;out.full=!prev;out.dims=[now.map[0].length,now.map.length];
  return out;
 },
 // The one clock of the host side: when the screen changed, project it, record it for the replay ring and hand it to the viewers.
 observe(now){
  if(!state||!state.player||state.debugBattle57||!state.map||!state.seen||!state.runId984)return;
  const sig=state.turn+':'+state.player.x+','+state.player.y+':'+state.player.hp+':'+state.visible.size+':'+state.seen.size+':'+state.floor+':'+(state.monsters?.length||0)+':'+(state.dead?1:0);
  const waiting=this.ready&&[...this.viewers.values()].some(v=>v.needFull);
  if(sig===this.lastSig&&!waiting)return;
  this.lastSig=sig;this.lastSend=now;
  const snap=this.project(),first=!this.mirror||this.mirror.run!==state.runId984||this.mirror.floor!==state.floor;
  const delta=this.diff(snap,first?null:this.mirror.snap);
  this.record(snap,delta);
  if(this.hosting&&this.ready&&this.viewers.size){
   const resync=this.sentTurns++>=this.RESYNC_TURNS;if(resync)this.sentTurns=0;
   const full=first||resync?delta.full?delta:this.diff(snap,null):null;
   this.seq++;
   for(const [id,v] of this.viewers){
    const wantFull=v.needFull||first||resync;
    this.toViewer(id,'snapshot',{tag:this.TAG,kind:wantFull?'full':'delta',seq:this.seq,frame:wantFull?(full||this.diff(snap,null)):delta,turn:state.turn,floor:state.floor});
    v.needFull=false;
   }
  }
  this.liveRun=state.runId984;this.mirror={snap,floor:state.floor,run:state.runId984};
 },
 endBroadcast(){
  const run=this.liveRun;this.liveRun=null;
  for(const id of this.viewers.keys())this.toViewer(id,'snapshot',{tag:this.TAG,kind:'end'});
  this.act('announce',{matchId:String(run),payload:{protocol:this.TAG,tag:this.TAG,matchId:String(run),ended:true,updatedAt:Date.now()}});
  for(const v of this.viewers.values())v.needFull=true;
  this.lastSig='';this.mirror=null;
 },
 // The last screens of this run for the death replay: recorders that each start with a full frame and then collect the same deltas
 // the viewers get; the oldest holds between REPLAY_KEEP and 2*REPLAY_KEEP screens, so the memory stays bounded.
 record(snap,delta){
  const recs=this.recs;
  for(const r of recs)r.frames.push(delta);
  if(!recs.length||recs[recs.length-1].frames.length>=this.REPLAY_KEEP)recs.push({full:delta.full?delta:this.diff(snap,null),frames:[]});
  while(recs.length>1&&recs[0].frames.length>=2*this.REPLAY_KEEP)recs.shift();
 },
 // ---- chat ------------------------------------------------------------------------------------------------------------
 cleanChat(text){return String(text??'').replace(/[\u0000-\u001f\u007f-\u009f‪-‮⁦-⁩]/g,'').replace(/\s+/g,' ').trim().slice(0,this.CHAT_MAX)},
 hostChatIn(fromId,data){
  const text=this.cleanChat(data.text),now=performance.now();
  if(!text||now-(this.lastChat.get(fromId)||0)<this.CHAT_GAP_MS)return;
  this.lastChat.set(fromId,now);this.broadcastChat({from:'관전자'+this.viewerNo(fromId),text,own:fromId});
 },
 viewerNo(id){return [...this.viewers.keys()].indexOf(id)+1},
 broadcastChat(msg){
  const packet={tag:this.TAG,kind:'chat',id:Date.now()+':'+Math.random().toString(36).slice(2,6),from:msg.from,text:msg.text,own:msg.own||null};
  for(const id of this.viewers.keys())this.toViewer(id,'chat',packet);
  this.pushChat({...packet,mine:!msg.own});
 },
 sysChat(text){this.pushChat({id:'s'+Date.now(),from:'',text,sys:true})},
 pushChat(entry){this.chat.push(entry);if(this.chat.length>this.CHAT_KEEP)this.chat.splice(0,this.chat.length-this.CHAT_KEEP);this.renderChat(entry)},
 // The typed text of either side goes through here.
 submitChat(text){
  text=this.cleanChat(text);if(!text)return false;
  const now=performance.now();if(now-(this.lastTyped||0)<this.CHAT_GAP_MS)return false;this.lastTyped=now;
  if(this.hosting){this.broadcastChat({from:'탐사자',text});return true}
  return this.act('chat',{matchId:this.watching?.matchId,payload:{tag:this.TAG,text}});
 },
 // ---- viewer ----------------------------------------------------------------------------------------------------------
 viewerEvent(action,fromId,matchId,data){
  if(action==='announce'){
   if(data.protocol!==this.TAG||!matchId)return;
   if(data.ended){this.rooms.delete(matchId);if(this.watching?.matchId===matchId)this.viewerNotice('방송이 끝났다.')}
   else this.rooms.set(matchId,{...data,hostId:fromId,matchId,seenAt:performance.now()});
   this.renderRooms();return;
  }
  if(!this.watching||this.watching.matchId!==matchId&&matchId)return;
  if(action==='snapshot'){if(data.refused){this.viewerNotice('방송에 들어갈 수 없다: '+data.refused);return}this.applyFrame(data)}
  else if(action==='chat'&&data.kind==='chat')this.pushChat({id:data.id,from:data.from,text:data.text,mine:data.own&&data.own===this.selfId});
 },
 emptyView(){
  return{spectator:true,runId984:'spectate',floor:1,turn:0,map:[[0]],seen:new Set(),visible:new Set(),monsters:[],items:[],decor:[],decals:[],status:{},terrainReactions105:{version:1,burning:{},char:{},spills:{},unlit:{},clues:{}},hazard1005:{armed:{},collapsed:{},drownUntil:0,voidUntil:0,lastWarn:{}},
   player:{x:0,y:0,hp:1,maxHp:1,inventory:[],facing:{x:0,y:1}},branchPortals105:[],neutralInteractables58:[],tempFields:[],jarGasFields57:[],elementFields74:[],tempTerrain74:[],rumorSpaces1030:[],bookWalls1022:[],stairs:null,dead:false,victory:false,
   outerWall94:{},subthemeFloors972:{},subthemeWalls970:{},archDecor1020:{},floorPattern1022:{},rugPattern1022:{},terrainUnderlay58:{},terrainAttachment58:{},specialPlaces52:null,branchTerrain105:null,branchContext105:null};
 },
 // A frame folded into a view. Pure: used by the live viewer and the replay alike.
 merge(view,f){
  if(f.full||!view)view=this.emptyView();
  const v=view;
  for(const key in f.set){
   if(key==='player'){v.player={...v.player,...f.set.player,inventory:[]};continue}
   if(key==='terrainReactions105Meta'){Object.assign(v.terrainReactions105,f.set[key]);continue}
   v[key]=f.set[key];
  }
  for(const key in f.cells){
   const [top,sub]=key.split('.'),holder=v[top]=v[top]||{},target=sub?(holder[sub]=holder[sub]||{}):holder,c=f.cells[key];
   for(const k in c.a)target[k]=c.a[k];for(const k of c.d)delete target[k];
  }
  if(f.dims&&(f.full||v.map.length!==f.dims[1]||v.map[0].length!==f.dims[0])){v.map=Array.from({length:f.dims[1]},()=>new Array(f.dims[0]).fill(TT.VOID));v.seen=new Set()}
  for(const [x,y,t] of f.map)v.map[y][x]=t;
  for(const c of f.seenAdd)v.seen.add(c);
  v.visible=new Set(f.visible);
  return v;
 },
 applyFrame(data){
  if(data.kind==='end'){this.viewerNotice('방송이 끝났다.');return}
  const f=data.frame;if(!f)return;
  // A delta only fits the frame right before it. If the page was in the background or the socket dropped, frames were
  // missed: keep the screen as it is and ask the host for a full frame instead of painting deltas onto a stale map.
  if(!f.full&&(!this.view||data.seq!==this.lastSeq+1)){this.act('watch',{matchId:this.watching?.matchId,payload:{tag:this.TAG,resync:true}});return}
  this.lastSeq=data.seq;
  this.view=this.merge(f.full?null:this.view,f);
  this.present(this.view,f.full);
 },
 present(v,full){
  const key=v.floor+':'+v.map[0].length+'x'+v.map.length,first=!this.active()||this.floorKey!==key;
  state=v;ROWS=v.map.length;COLS=v.map[0].length;
  if(first){this.floorKey=key;this.enter(full)}
  this.viewerNotice('');this.headerRefresh();cameraRenderPending=true;renderUpdatePending=false;
 },
 active(){return !!state?.spectator},
 headerRefresh(){
  const el=document.getElementById('spectateBar');if(!el||!this.view)return;
  const v=this.view,p=v.player,r=this.replaying;
  el.querySelector('.spectateInfo').textContent=(r?`마지막 장면 ${r.index}/${r.frames.length}`:'관전 중')+` · ${v.floor}층 · ${v.turn}턴 · 체력 ${p.hp}/${p.maxHp}`+(v.dead?' · 사망':'');
 },
 viewerNotice(text){const el=document.getElementById('spectateNote');if(el){el.textContent=text;el.hidden=!text}},
 // The viewer's screen is the game screen with the player's controls hidden (see 70-spectate.css).
 enter(first){
  if(!document.getElementById('spectateBar'))this.buildScreen();
  BRANCH_TILE_CACHE.clear();
  document.body.classList.add('spectating');if(!this.replaying)setScreen('game');
  if(first||!this.camReady){this.camReady=true;CameraState.setMode('follow')}
  syncGameViewport();resetVisualState();
 },
 leaveView(){
  if(this.watching)this.act('leave',{matchId:this.watching.matchId,payload:{tag:this.TAG}});
  this.watching=null;this.view=null;this.floorKey='';this.chat.length=0;this.unread=0;document.getElementById('spectatePopups')?.remove();this.camReady=false;
  document.body.classList.remove('spectating');
  document.getElementById('spectateBar')?.remove();
  if(state?.spectator)state=null;
  this.close();setScreen('title');
 },
 // Called instead of the normal frame work while a viewer is watching: the host's state is never advanced here.
 frame(now){
  this.tick(now);
  if(!state?.spectator)return;
  if(this.replaying)this.replayStep(now);
  updateVisualMotion(now);
  if(cameraRenderPending||now-RC.lastDraw>=frameBudget(33))drawFrame(now,false);
 },
 // ---- death replay ----------------------------------------------------------------------------------------------------
 replayable(){return this.recs.length>0&&this.recs[0].frames.length>0},
 replayLast(){
  if(this.replaying||!this.replayable())return false;
  const rec=this.recs[0];
  this.replaying={real:state,rows:ROWS,cols:COLS,frames:[rec.full,...rec.frames],index:0,at:0,end:document.body.classList.contains('end-screen95'),screen:document.body.dataset.manruScreen};
  setScreen('game');document.getElementById('overlay').style.display='none';document.body.classList.remove('end-screen95');
  this.view=null;this.floorKey='';this.buildScreen();this.replayStep(performance.now(),true);return true;
 },
 replayStep(now,force){
  const r=this.replaying;if(!r||r.index>=r.frames.length)return;
  if(!force&&now-r.at<this.REPLAY_STEP_MS)return;
  r.at=now;const f=r.frames[r.index++];
  this.view=this.merge(f.full?null:this.view,f);this.present(this.view,f.full);
 },
 replayRestart(){const r=this.replaying;if(!r)return;r.index=0;r.at=0;this.view=null;this.floorKey='';this.replayStep(performance.now(),true)},
 replayClose(){
  const r=this.replaying;if(!r)return;this.replaying=null;
  document.body.classList.remove('spectating');document.getElementById('spectateBar')?.remove();document.getElementById('spectateNote')?.remove();
  state=r.real;ROWS=r.rows;COLS=r.cols;this.view=null;this.floorKey='';this.camReady=false;
  setScreen(r.screen||'ending');if(r.end)document.body.classList.add('end-screen95');
  document.getElementById('overlay').style.display='flex';
  BRANCH_TILE_CACHE.clear();syncGameViewport();resetVisualState();
 },
 // ---- screens ---------------------------------------------------------------------------------------------------------
 el(tag,className,text){const n=document.createElement(tag);if(className)n.className=className;if(text!=null)n.textContent=text;return n},
 openList(){
  if(document.getElementById('spectateScene'))return false;
  const scene=this.el('div'),panel=this.el('div','spectatePanel'),head=this.el('header'),close=this.el('button',null,'×'),list=this.el('div','spectateRooms'),note=this.el('p','spectateHint','');
  scene.id='spectateScene';scene.setAttribute('role','dialog');scene.setAttribute('aria-label','관전');list.id='spectateRooms';note.id='spectateListNote';
  close.type='button';close.id='spectateClose';close.setAttribute('aria-label','닫기');close.onclick=()=>this.closeList();
  head.append(this.el('h2',null,'관전'),close);panel.append(head,note,list);scene.append(panel);document.body.append(scene);
  this.rooms.clear();this.listOpen=true;this.retryAt=0;
  if(!this.endpoint()){this.renderRooms();return true}
  this.startList();return true;
 },
 // List mode: wake the server, connect as a viewer, ask for the live rooms; try again on its own when it fails.
 startList(){
  if(this.waking)return;
  this.role='viewer';this.hosting=false;this.waking=true;this.setNet('waking','서버를 깨우는 중… (처음에는 30~60초 걸릴 수 있다)');
  this.wake().then(()=>{this.waking=false;if(!this.listOpen)return;if(!this.ws)this.open('viewer');else this.act('browse')});
 },
 closeList(){this.listOpen=false;document.getElementById('spectateScene')?.remove();if(!this.watching)this.close()},
 renderRooms(){
  const list=document.getElementById('spectateRooms');if(!list)return;
  const now=performance.now();for(const [id,r] of this.rooms)if(now-r.seenAt>6500)this.rooms.delete(id);
  list.replaceChildren();
  const note=document.getElementById('spectateListNote');
  if(!this.rooms.size){
   if(note)note.textContent=!this.endpoint()?'관전 서버가 연결되어 있지 않다.':this.ready?'서버에 연결됨 · 지금 방송 중인 탐사가 없다. 다른 기기에서 설정의 "관전 허용"을 켜고 게임 화면을 띄워 두면 여기에 나타난다.':this.netDetail+(this.net==='failed'||this.net==='wakeFailed'||this.net==='refused'?' · 5초 뒤 다시 시도한다':'');
   return;
  }
  if(note)note.textContent='서버에 연결됨 · 들어갈 탐사를 고른다.';
  for(const r of [...this.rooms.values()].sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0))){
   const b=this.el('button','spectateRoom');b.type='button';
   const cls=(typeof CLASSES!=='undefined'&&CLASSES.find(c=>c.id===r.cls)?.name)||r.cls||'탐사자';
   b.append(this.el('b',null,`${cls} · ${r.floor}층`),this.el('span',null,`${r.turn}턴 · 체력 ${r.hp}/${r.maxHp} · 관전 ${r.spectators||0}`));
   b.onclick=()=>this.join(r);list.append(b);
  }
 },
 join(room){
  this.watching={matchId:room.matchId,hostId:room.hostId};this.chat.length=0;this.view=null;this.lastSeq=-1;
  this.closeList();this.buildScreen();this.viewerNotice('방송에 들어가는 중…');
  if(innerWidth>1080)this.toggleChat();
  this.act('watch',{matchId:room.matchId,payload:{tag:this.TAG}});
 },
 buildScreen(){
  if(document.getElementById('spectateBar'))return;
  const bar=this.el('div'),info=this.el('span','spectateInfo','관전 중'),note=this.el('div','spectateNote');
  bar.id='spectateBar';note.id='spectateNote';note.hidden=true;
  if(this.replaying){
   const again=this.el('button','spectateAgain','처음부터'),done=this.el('button','spectateExit','닫기');again.type='button';done.type='button';
   again.onclick=()=>this.replayRestart();done.onclick=()=>this.replayClose();bar.append(info,again,done);
  }else{
   const chatBtn=this.el('button','spectateChatBtn','채팅'),exit=this.el('button','spectateExit','나가기');chatBtn.type='button';exit.type='button';
   chatBtn.onclick=()=>this.toggleChat();exit.onclick=()=>this.leaveView();bar.append(info,chatBtn,exit);
  }
  document.body.append(bar,note);
  this.bindViewerInput();
 },
 // Scroll and zoom only. Everything else the page would do with a pointer or a key is swallowed while watching.
 bindViewerInput(){
  if(this.bound)return;this.bound=true;
  const wrap=document.getElementById('canvasWrap'),pts=new Map();let pinch=0;
  // Only the map itself is a spectator gesture surface; the windows and buttons that sit inside the wrap (inspect card, zoom, close buttons) keep working.
  const onMap=event=>event.target===wrap||event.target.tagName==='CANVAS';
  const block=event=>{if(!state?.spectator||!onMap(event))return;event.stopImmediatePropagation();event.preventDefault()};
  addEventListener('keydown',event=>{if(!state?.spectator)return;if(event.target.closest?.('#spectateChat')||event.key==='Escape')return;event.stopImmediatePropagation();event.preventDefault()},true);
  addEventListener('keyup',event=>{if(!state?.spectator)return;if(event.target.closest?.('#spectateChat'))return;event.stopImmediatePropagation()},true);
  addEventListener('contextmenu',block,true);
  wrap.addEventListener('pointerdown',event=>{if(!state?.spectator||!onMap(event))return;event.stopImmediatePropagation();pts.set(event.pointerId,{x:event.clientX,y:event.clientY});if(pts.size===2){const[a,b]=[...pts.values()];pinch=Math.hypot(a.x-b.x,a.y-b.y)}try{wrap.setPointerCapture(event.pointerId)}catch(error){ignoreError('pointer capture refused',error)}},true);
  wrap.addEventListener('pointermove',event=>{
   if(!state?.spectator||!pts.has(event.pointerId))return;event.stopImmediatePropagation();
   const prev=pts.get(event.pointerId),dx=event.clientX-prev.x,dy=event.clientY-prev.y;pts.set(event.pointerId,{x:event.clientX,y:event.clientY});
   if(pts.size===1){CameraState.beginInspect();CameraState.panScreen(dx,dy)}
   else if(pts.size===2){const[a,b]=[...pts.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(pinch>0)CameraState.setZoom(CameraState.scale()/(isMobileViewport()?1.24:1.44)*d/pinch,false,{clientX:(a.x+b.x)/2,clientY:(a.y+b.y)/2});pinch=d}
  },true);
  const up=event=>{if(!state?.spectator)return;event.stopImmediatePropagation();pts.delete(event.pointerId);pinch=0};
  wrap.addEventListener('pointerup',up,true);wrap.addEventListener('pointercancel',up,true);
  wrap.addEventListener('wheel',event=>{if(!state?.spectator||!onMap(event))return;event.stopImmediatePropagation();event.preventDefault();CameraState.setZoom(CameraState.scale()/(isMobileViewport()?1.24:1.44)*(event.deltaY<0?1.12:1/1.12),false,{clientX:event.clientX,clientY:event.clientY})},{capture:true,passive:false});
  wrap.addEventListener('click',block,true);wrap.addEventListener('dblclick',block,true);
 },
 // ---- chat window (a messenger: the box stays open and focused after sending, and rides above the keyboard) -------------
 toggleChat(){
  let box=document.getElementById('spectateChat');
  if(box){box.remove();return}
  box=this.el('div');box.id='spectateChat';this.unread=0;this.showUnread();document.getElementById('spectatePopups')?.remove();
  const log=this.el('div','spectateLog'),form=this.el('div','spectateForm'),input=this.el('textarea'),send=this.el('button',null,'보내기'),closeBtn=this.el('button','spectateChatClose','×');
  log.id='spectateLog';input.id='spectateInput';input.rows=1;input.maxLength=this.CHAT_MAX;input.placeholder='메시지';input.setAttribute('enterkeyhint','send');input.autocomplete='off';send.type='button';closeBtn.type='button';
  const go=()=>{if(this.submitChat(input.value)){input.value='';input.style.height=''}input.focus()};
  // keep the focus where it is: a pointer press on the button must not blur the textarea (that is what closes the keyboard)
  // A touch is answered on touchend (preventDefault there also stops the compatibility mouse events that move the focus); a mouse click on click.
  let touched=0;
  send.addEventListener('pointerdown',event=>event.preventDefault());send.addEventListener('mousedown',event=>event.preventDefault());
  send.addEventListener('touchend',event=>{event.preventDefault();touched=performance.now();go()},{passive:false});
  send.addEventListener('click',()=>{if(performance.now()-touched>600)go()});
  input.addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();go()}});
  closeBtn.onclick=()=>box.remove();
  form.append(input,send);box.append(closeBtn,log,form);document.body.append(box);
  for(const entry of this.chat)this.renderChat(entry,true);
  this.fitChat();input.focus();
 },
 // Follow the visual viewport so the box sits just above the on-screen keyboard.
 fitChat(){
  const box=document.getElementById('spectateChat');if(!box)return;
  const vv=window.visualViewport,set=()=>{const b=document.getElementById('spectateChat');if(!b||!vv)return;b.style.setProperty('--kb',Math.max(0,innerHeight-vv.height-vv.offsetTop)+'px')};
  if(vv&&!this.vvBound){this.vvBound=true;vv.addEventListener('resize',set);vv.addEventListener('scroll',set)}
  set();
 },
 // A message that arrives while the chat box is closed floats in at the top right for a moment (the way the online battle chat does) and counts as unread.
 chatPopup(entry){
  let stack=document.getElementById('spectatePopups');
  if(!stack){stack=this.el('div','spectatePopupStack');stack.id='spectatePopups';document.body.append(stack)}
  const node=this.el('div','spectatePopup');node.append(this.el('b',null,entry.from||''),this.el('span',null,entry.text));
  while(stack.children.length>=4)stack.firstChild.remove();
  node.addEventListener('animationend',()=>{node.remove();if(!stack.children.length)stack.remove()});
  stack.append(node);
 },
 showUnread(){
  const btn=document.querySelector('#spectateBar .spectateChatBtn');if(!btn)return;
  let badge=btn.querySelector('.spectateUnread');
  if(!this.unread){badge?.remove();return}
  if(!badge){badge=this.el('i','spectateUnread');btn.append(badge)}
  badge.textContent=this.unread>9?'9+':String(this.unread);
 },
 renderChat(entry,quiet){
  const log=document.getElementById('spectateLog');
  if(!log){
   if(entry.sys||entry.mine)return;
   if(this.hosting)addLog('[관전] '+entry.from+': '+entry.text);
   this.chatPopup(entry);this.unread++;this.showUnread();return;
  }
  const row=this.el('div','spectateMsg'+(entry.sys?' sys':entry.mine?' mine':'')),bubble=this.el('span','bubble',entry.text);
  if(!entry.sys&&!entry.mine)row.append(this.el('small',null,entry.from));
  row.append(bubble);log.append(row);
  while(log.children.length>this.CHAT_KEEP)log.firstChild.remove();
  log.scrollTop=log.scrollHeight;
 },
 // ---- host panel (settings) -------------------------------------------------------------------------------------------
 updateHostPanel(){
  const s=document.getElementById('rcSpectateInfo70');if(!s)return;
  s.textContent=!this.hosting?'서버 주소가 없어 방송하지 않는다.':this.listedAt?`방송 중 · 목록에 올랐다 · 관전자 ${this.viewers.size}명`:this.ready?`서버에 연결됨 · 목록에 오르는 중… (관전자 ${this.viewers.size}명)`:(this.netDetail||'서버에 연결하는 중…');
 }
};
