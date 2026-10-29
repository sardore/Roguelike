/* Live spectating over the shared cp32 relay (its generic `spectator.action` channel; no server change).
   Host: the game screen itself. A few times a second the host's own canvas is shrunk to a JPEG and sent to each viewer, so a viewer can
   only ever see what the host's screen shows (fog, hidden things and all) and no game state ever leaves the device.
   Viewer: shows the latest picture full screen; moving and zooming the picture is the viewer's, nothing reaches the game underneath.
   The relay never fans out, so the host sends every packet once per viewer and relays chat itself. */
const Spectate={
 RELAY:'cp32-online-relay-v1',TAG:'manru-spectate-r2',ANNOUNCE_MS:1500,HEARTBEAT_MS:10000,MAX_VIEWERS:5,
 CHAT_MAX:120,CHAT_GAP_MS:1000,CHAT_KEEP:200,
 FRAME_MS:500,IDLE_MS:1500,FRAME_SIDE:960,FRAME_QUALITY:.62,BACKLOG_BYTES:300000,MAX_FRAME_CHARS:700000,ZOOM_MAX:6,
 net:'',netDetail:'',listedAt:0,retryAt:0,listOpen:false,waking:false,readyAt:0,netError:false,VIEWER_PING_MS:10000,VIEWER_TTL_MS:30000,lastWatch:0,REPLAY:true,REPLAY_KEEP:60,REPLAY_STEP_MS:400,recs:[],replaying:null,selfId:'',liveRun:null,
 ws:null,connecting:false,ready:false,role:null,playerId:'',lastBeat:0,lastAnnounce:0,lastSend:0,reconnectAt:0,
 hosting:false,viewers:new Map(),seq:0,lastChat:new Map(),shot:null,
 watching:null,rooms:new Map(),last:null,pan:null,chat:[],unread:0,bound:false,
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
  if(this.hosting){this.lastSend=0;this.listedAt=0;this.readyAt=performance.now();this.act('browse');this.announce(true);this.updateHostPanel()}
  else if(this.role==='viewer'){this.act('browse');if(this.watching)this.watchPing(performance.now(),true)}
 },
 // Called from the frame loop: heartbeat, announce, reconnect and the per-turn frame all hang on this one clock.
 // The relay does not tell the host when a viewer's socket dies, so viewers say they are still there.
 watchPing(now,force){
  if(!force&&now-this.lastWatch<this.VIEWER_PING_MS)return;
  this.lastWatch=now;this.act('watch',{matchId:this.watching.matchId,payload:{tag:this.TAG}});
 },
 tick(now){
  if(!this.hosting&&state&&!state.debugBattle57&&!this.listOpen&&!this.watching)this.startHosting();
  if(this.ws&&this.ready&&now-this.lastBeat>this.HEARTBEAT_MS){this.lastBeat=now;this.send({type:'heartbeat',at:Date.now()})}
  if(this.replaying)this.replayStep(now);
  if(this.watching&&this.ready&&!this.replaying)this.watchPing(now);
  if(this.listOpen&&!this.watching&&!this.ws&&!this.connecting&&!this.waking&&now>=this.retryAt)this.startList();
  if(this.hosting&&this.ready&&!this.listedAt&&now-this.readyAt>8000&&this.net!=='unlisted')this.setNet('unlisted','서버에 연결되었지만 방송 목록에 오르지 않았다');
  if(this.hosting){
   for(const [id,v] of this.viewers)if(now-v.seenAt>this.VIEWER_TTL_MS){this.viewers.delete(id);this.lastChat.delete(id);this.updateHostPanel()}
   if(!this.ws&&!this.connecting&&now>=this.reconnectAt)this.open('host');
   if(this.ready&&now-this.lastAnnounce>this.ANNOUNCE_MS)this.announce(false);
  }
  if(!this.watching&&!this.replaying&&(this.hosting||this.REPLAY))this.observe(now);
  if(this.hosting&&this.liveRun&&this.ready&&state?.runId984!==this.liveRun)this.endBroadcast();
 },
 // ---- host ------------------------------------------------------------------------------------------------------------
 // Broadcasting is always on while a run is played (there is no off switch); the viewer list and watching pause it.
 startHosting(){
  if(this.hosting||!this.endpoint())return;
  this.hosting=true;this.viewers.clear();this.lastChat.clear();this.reconnectAt=0;
  this.wake().then(()=>{if(this.hosting&&!this.ws)this.open('host')});
  this.updateHostPanel();
 },
 announce(force,ended=false){
  this.lastAnnounce=performance.now();
  if(!state||!state.player||state.debugBattle57||(!state.runId984&&!ended))return;
  this.act('announce',{matchId:String(state.runId984),payload:{protocol:this.TAG,tag:this.TAG,matchId:String(state.runId984),cls:state.player.classId,floor:state.floor,turn:state.turn,hp:state.player.hp,maxHp:state.player.maxHp,spectators:this.viewers.size,updatedAt:Date.now(),ended}});
 },
 hostEvent(action,fromId,data){
  if(action==='announce'){if(fromId===this.selfId||data.matchId===String(state?.runId984)){const first=!this.listedAt;this.listedAt=performance.now();if(first)this.setNet('listed','방송 목록에 올랐다')}return}
  if(!fromId)return;
  if(action==='watch'){
   if(this.viewers.size>=this.MAX_VIEWERS&&!this.viewers.has(fromId)){this.toViewer(fromId,'snapshot',{tag:this.TAG,kind:'frame',refused:'가득 찼다'});return}
   const known=this.viewers.get(fromId);
   if(known){known.seenAt=performance.now();return}
   this.viewers.set(fromId,{joinedAt:performance.now(),seenAt:performance.now()});this.lastSend=0;this.sysChat('관전자가 들어왔다 ('+this.viewers.size+')');this.updateHostPanel();
  }else if(action==='leave'){this.viewers.delete(fromId);this.lastChat.delete(fromId);this.updateHostPanel()}
  else if(action==='chat'&&this.viewers.has(fromId)){this.viewers.get(fromId).seenAt=performance.now();this.hostChatIn(fromId,data)}
 },
 toViewer(id,action,payload){return this.act(action,{matchId:state?.runId984?String(state.runId984):undefined,targetId:id,payload})},
 // The host's own screen as one picture: the game canvas shrunk to FRAME_SIDE and encoded as a JPEG. Nothing but pixels leaves the device.
 capture(){
  const c=document.getElementById('game');if(!c||!c.width||!c.height||!state?.player)return null;
  const k=Math.min(1,this.FRAME_SIDE/Math.max(c.width,c.height)),w=Math.max(1,Math.round(c.width*k)),h=Math.max(1,Math.round(c.height*k));
  const o=this.shot||(this.shot=document.createElement('canvas'));o.width=w;o.height=h;
  const g=o.getContext('2d');g.fillStyle='#0b0704';g.fillRect(0,0,w,h);g.drawImage(c,0,0,w,h);
  let img;try{img=o.toDataURL('image/jpeg',this.FRAME_QUALITY)}catch(error){ignoreError('spectate frame encode failed',error);return null}
  const p=state.player;return{img,w,h,floor:state.floor,turn:state.turn,hp:p.hp,maxHp:p.maxHp,dead:!!state.dead};
 },
 // The one clock of the host side: take the screen, keep it for the death replay and hand it to every viewer (a viewer that is behind misses a frame, never queues them).
 observe(now,force){
  if(!state||!state.player||state.debugBattle57||!state.runId984||document.hidden)return;
  const watched=this.hosting&&this.ready&&this.viewers.size>0;
  if(!force&&now-this.lastSend<(watched?this.FRAME_MS:this.IDLE_MS))return;
  const frame=this.capture();if(!frame)return;
  this.lastSend=now;this.record(frame);this.liveRun=state.runId984;
  if(!watched||(this.ws?.bufferedAmount||0)>this.BACKLOG_BYTES)return;
  this.seq++;
  for(const id of this.viewers.keys())this.toViewer(id,'snapshot',{tag:this.TAG,kind:'frame',seq:this.seq,frame});
 },
 endBroadcast(){
  const run=this.liveRun;this.liveRun=null;
  for(const id of this.viewers.keys())this.toViewer(id,'snapshot',{tag:this.TAG,kind:'end'});
  this.act('announce',{matchId:String(run),payload:{protocol:this.TAG,tag:this.TAG,matchId:String(run),ended:true,updatedAt:Date.now()}});
  this.recs.length=0;
 },
 // The last screens of this run for the death replay; the oldest fall away so the memory stays bounded.
 record(frame){this.recs.push(frame);if(this.recs.length>this.REPLAY_KEEP)this.recs.shift()},
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
 // A picture from the host. Only a JPEG data URL of sane size is ever put on the screen.
 applyFrame(data){
  if(data.kind==='end'){this.viewerNotice('방송이 끝났다.');return}
  const f=data.frame;
  if(!f||typeof f.img!=='string'||f.img.length>this.MAX_FRAME_CHARS||!/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(f.img))return;
  this.show({img:f.img,w:Math.max(1,Math.min(4096,+f.w||1)),h:Math.max(1,Math.min(4096,+f.h||1)),floor:+f.floor||0,turn:+f.turn||0,hp:+f.hp||0,maxHp:+f.maxHp||0,dead:!!f.dead});
 },
 show(f){
  const pic=document.getElementById('spectatePic');if(!pic)return;
  const resized=!this.last||this.last.w!==f.w||this.last.h!==f.h;
  this.last=f;pic.src=f.img;pic.width=f.w;pic.height=f.h;
  if(resized)this.fitPicture();
  this.viewerNotice('');this.headerRefresh();
 },
 headerRefresh(){
  const el=document.getElementById('spectateBar'),v=this.last;if(!el||!v)return;
  const r=this.replaying;
  el.querySelector('.spectateInfo').textContent=(r?`마지막 장면 ${r.index}/${r.frames.length}`:'관전 중')+` · ${v.floor}층 · ${v.turn}턴 · 체력 ${v.hp}/${v.maxHp}`+(v.dead?' · 사망':'');
 },
 viewerNotice(text){const el=document.getElementById('spectateNote');if(el){el.textContent=text;el.hidden=!text}},
 // The picture sits in a box that fills the screen: `z` 1 is "fit the whole picture", up to ZOOM_MAX times that; x/y place its corner.
 fitPicture(){
  const box=document.getElementById('spectateView'),f=this.last;if(!box||!f)return;
  const vw=box.clientWidth,vh=box.clientHeight,base=Math.min(vw/f.w,vh/f.h);
  this.pan={base,z:1,x:(vw-f.w*base)/2,y:(vh-f.h*base)/2};this.placePicture();
 },
 placePicture(){
  const box=document.getElementById('spectateView'),pic=document.getElementById('spectatePic'),p=this.pan,f=this.last;if(!box||!pic||!p||!f)return;
  const vw=box.clientWidth,vh=box.clientHeight,sw=f.w*p.base*p.z,sh=f.h*p.base*p.z;
  p.x=sw<=vw?(vw-sw)/2:Math.min(0,Math.max(vw-sw,p.x));p.y=sh<=vh?(vh-sh)/2:Math.min(0,Math.max(vh-sh,p.y));
  pic.style.transform=`translate(${p.x}px,${p.y}px) scale(${p.base*p.z})`;
 },
 zoomAt(factor,cx,cy){
  const p=this.pan;if(!p)return;
  const z=Math.max(1,Math.min(this.ZOOM_MAX,p.z*factor)),k=z/p.z;
  p.x=cx-(cx-p.x)*k;p.y=cy-(cy-p.y)*k;p.z=z;this.placePicture();
 },
 leaveView(){
  if(this.watching)this.act('leave',{matchId:this.watching.matchId,payload:{tag:this.TAG}});
  this.watching=null;this.last=null;this.pan=null;this.chat.length=0;this.unread=0;document.getElementById('spectatePopups')?.remove();
  document.getElementById('spectateView')?.remove();document.getElementById('spectateBar')?.remove();document.getElementById('spectateNote')?.remove();document.getElementById('spectateChat')?.remove();
  this.close();
 },
 // ---- death replay ----------------------------------------------------------------------------------------------------
 replayable(){return this.recs.length>1},
 replayLast(){
  if(this.replaying||!this.replayable())return false;
  const overlay=document.getElementById('overlay');
  this.replaying={frames:[...this.recs],index:0,at:0,overlay:overlay?.style.display||''};
  if(overlay)overlay.style.display='none';
  this.last=null;this.buildScreen();this.replayStep(performance.now(),true);return true;
 },
 replayStep(now,force){
  const r=this.replaying;if(!r||r.index>=r.frames.length)return;
  if(!force&&now-r.at<this.REPLAY_STEP_MS)return;
  r.at=now;this.show(r.frames[r.index++]);
 },
 replayRestart(){const r=this.replaying;if(!r)return;r.index=0;r.at=0;this.replayStep(performance.now(),true)},
 replayClose(){
  const r=this.replaying;if(!r)return;this.replaying=null;
  document.getElementById('spectateView')?.remove();document.getElementById('spectateBar')?.remove();document.getElementById('spectateNote')?.remove();
  this.last=null;this.pan=null;
  const overlay=document.getElementById('overlay');if(overlay)overlay.style.display=r.overlay||'flex';
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
  this.watching={matchId:room.matchId,hostId:room.hostId};this.chat.length=0;this.last=null;
  this.closeList();this.buildScreen();this.viewerNotice('방송에 들어가는 중…');
  if(innerWidth>1080)this.toggleChat();
  this.act('watch',{matchId:room.matchId,payload:{tag:this.TAG}});
 },
 buildScreen(){
  if(document.getElementById('spectateBar'))return;
  const view=this.el('div'),pic=this.el('img'),bar=this.el('div'),info=this.el('span','spectateInfo','관전 중'),note=this.el('div','spectateNote');
  view.id='spectateView';pic.id='spectatePic';pic.alt='';pic.draggable=false;bar.id='spectateBar';note.id='spectateNote';note.hidden=true;
  view.append(pic);
  if(this.replaying){
   const again=this.el('button','spectateAgain','처음부터'),done=this.el('button','spectateExit','닫기');again.type='button';done.type='button';
   again.onclick=()=>this.replayRestart();done.onclick=()=>this.replayClose();bar.append(info,again,done);
  }else{
   const chatBtn=this.el('button','spectateChatBtn','채팅'),exit=this.el('button','spectateExit','나가기');chatBtn.type='button';exit.type='button';
   chatBtn.onclick=()=>this.toggleChat();exit.onclick=()=>this.leaveView();bar.append(info,chatBtn,exit);
  }
  const fit=this.el('button','spectateFit','맞춤');fit.type='button';fit.onclick=()=>this.fitPicture();bar.insertBefore(fit,bar.querySelector('button'));
  document.body.append(view,bar,note);
  this.bindViewerInput(view);
 },
 // Move and zoom the picture (drag, pinch, wheel, double tap = fit). The view owns every pointer on it, so nothing reaches the game underneath.
 bindViewerInput(view){
  const pts=new Map();let pinch=0,tapAt=0;
  const point=event=>{const r=view.getBoundingClientRect();return{x:event.clientX-r.left,y:event.clientY-r.top}};
  view.addEventListener('pointerdown',event=>{
   pts.set(event.pointerId,point(event));if(pts.size===2){const[a,b]=[...pts.values()];pinch=Math.hypot(a.x-b.x,a.y-b.y)}
   if(pts.size===1){const now=performance.now();if(now-tapAt<300)this.fitPicture();tapAt=now}
   try{view.setPointerCapture(event.pointerId)}catch(error){ignoreError('pointer capture refused',error)}
  });
  view.addEventListener('pointermove',event=>{
   if(!pts.has(event.pointerId)||!this.pan)return;
   const prev=pts.get(event.pointerId),now=point(event);pts.set(event.pointerId,now);
   if(pts.size===1){this.pan.x+=now.x-prev.x;this.pan.y+=now.y-prev.y;this.placePicture()}
   else if(pts.size===2){const[a,b]=[...pts.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(pinch>0)this.zoomAt(d/pinch,(a.x+b.x)/2,(a.y+b.y)/2);pinch=d}
  });
  const up=event=>{pts.delete(event.pointerId);pinch=0};
  view.addEventListener('pointerup',up);view.addEventListener('pointercancel',up);
  view.addEventListener('wheel',event=>{event.preventDefault();const p=point(event);this.zoomAt(event.deltaY<0?1.15:1/1.15,p.x,p.y)},{passive:false});
  view.addEventListener('contextmenu',event=>event.preventDefault());
  if(!this.bound){
   this.bound=true;
   // The game beneath never sees a key while watching (the chat box and the buttons keep theirs).
   addEventListener('keydown',event=>{if(!this.watching&&!this.replaying)return;if(event.target.closest?.('#spectateChat')||event.key==='Escape')return;event.stopImmediatePropagation();event.preventDefault()},true);
   addEventListener('keyup',event=>{if(!this.watching&&!this.replaying)return;if(event.target.closest?.('#spectateChat'))return;event.stopImmediatePropagation()},true);
   addEventListener('resize',()=>{if(this.pan?.z===1)this.fitPicture();else this.placePicture()});
  }
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
