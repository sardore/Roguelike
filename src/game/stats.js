/* Play statistics. Out: one anonymous record per death (the numbers on the death screen). In: the aggregate view behind a hidden title gesture (a big star drawn with the finger or mouse) and a password the server checks. */
const PlayStats={
 QUEUE_KEY:'manruStatsQueue',KEY_STORE:'manruStatsKey',QUEUE_MAX:20,TOP_CAUSES:12,
 // A star is one closed stroke: big enough, roughly square, at least 4 sharp corners and at least 4 self-crossings.
 STAR:{MIN_SIZE:.35,STEP:6,CLOSE:.4,FLATTEN:.08,SHARP_DEG:100,MIN_CORNERS:4,MIN_CROSSINGS:4,MAX_VERTICES:9},
 stroke:null,sending:false,tab:'stats',data:null,
 endpoint(){return document.querySelector('meta[name="manru-stats"]')?.content.trim()||''},
 queue(){try{const list=JSON.parse(lsGet(this.QUEUE_KEY)||'[]');return Array.isArray(list)?list:[]}catch(error){ignoreError('play stats queue unreadable',error);return[]}},
 saveQueue(list){lsSet(this.QUEUE_KEY,JSON.stringify(list.slice(-this.QUEUE_MAX)))},
 recordDeath(cause){
  if(!state||state.debugBattle57||state.debugMapGeneration57||!this.endpoint())return false;
  const record={v:1,id:String(state.runId984||''),floor:state.floor,cause:String(cause||'').slice(0,40),level:state.player.level,kills:state.player.kills,turns:state.turn};
  this.saveQueue([...this.queue().filter(q=>q.id!==record.id),record]);
  this.flush();return true;
 },
 // The server drops a repeated id, so a record whose reply never arrived is simply sent again.
 async flush(){
  const url=this.endpoint();if(!url||this.sending)return 0;
  this.sending=true;let sent=0;
  try{
   for(const record of this.queue()){
    const reply=await fetch(url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(record)});
    if(!reply.ok)break;
    this.saveQueue(this.queue().filter(q=>q.id!==record.id));sent++;
   }
  }catch(error){ignoreError('play stats send failed',error)}
  finally{this.sending=false}
  return sent;
 },
 titleShowing(){return document.body.dataset.manruScreen==='title'&&!document.body.classList.contains('title-class-mode')&&!document.getElementById('statsScene')&&!document.getElementById('statsGate')},
 strokeStart(x,y){this.stroke=this.titleShowing()?[{x,y}]:null},
 strokeMove(x,y){const s=this.stroke;if(!s)return;const q=s[s.length-1];if(Math.hypot(x-q.x,y-q.y)>=this.STAR.STEP)s.push({x,y})},
 strokeEnd(){const s=this.stroke;this.stroke=null;if(s&&this.isStar(s))this.ask()},
 strokeAbort(){this.stroke=null},
 // Ramer-Douglas-Peucker: the corners of a hand-drawn stroke.
 corners(points,epsilon){
  const a=points[0],b=points[points.length-1],length=Math.hypot(b.x-a.x,b.y-a.y);
  let far=-1,at=0;
  for(let i=1;i<points.length-1;i++){const p=points[i],d=length?Math.abs((b.x-a.x)*(a.y-p.y)-(a.x-p.x)*(b.y-a.y))/length:Math.hypot(p.x-a.x,p.y-a.y);if(d>far){far=d;at=i}}
  if(far<=epsilon)return[a,b];
  return[...this.corners(points.slice(0,at+1),epsilon).slice(0,-1),...this.corners(points.slice(at),epsilon)];
 },
 crosses(p1,p2,p3,p4){
  const side=(a,b,c)=>Math.sign((b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x));
  return side(p1,p2,p3)*side(p1,p2,p4)<0&&side(p3,p4,p1)*side(p3,p4,p2)<0;
 },
 isStar(points){
  const S=this.STAR,xs=points.map(p=>p.x),ys=points.map(p=>p.y),w=Math.max(...xs)-Math.min(...xs),h=Math.max(...ys)-Math.min(...ys),size=Math.max(w,h);
  if(points.length<8||Math.min(w,h)<S.MIN_SIZE*Math.min(innerWidth,innerHeight)||Math.min(w,h)<size*.6)return false;
  const first=points[0],last=points[points.length-1];
  if(Math.hypot(last.x-first.x,last.y-first.y)>S.CLOSE*size)return false;
  const path=this.corners(points,S.FLATTEN*size);
  if(path.length>S.MAX_VERTICES)return false;
  let sharp=0,crossings=0;
  for(let i=1;i<path.length-1;i++){
   const u={x:path[i].x-path[i-1].x,y:path[i].y-path[i-1].y},v={x:path[i+1].x-path[i].x,y:path[i+1].y-path[i].y};
   const turn=Math.acos(Math.max(-1,Math.min(1,(u.x*v.x+u.y*v.y)/((Math.hypot(u.x,u.y)*Math.hypot(v.x,v.y))||1))))*180/Math.PI;
   if(turn>=S.SHARP_DEG)sharp++;
  }
  for(let i=0;i<path.length-1;i++)for(let j=i+2;j<path.length-1;j++)if(this.crosses(path[i],path[i+1],path[j],path[j+1]))crossings++;
  return sharp>=S.MIN_CORNERS&&crossings>=S.MIN_CROSSINGS;
 },
 // Star drawn: with no server there is nothing to protect; otherwise the saved password opens it, or it is asked for once.
 ask(){
  if(!this.endpoint())return this.open('');
  const key=lsGet(this.KEY_STORE);
  return key?this.open(key):this.prompt('');
 },
 prompt(message){
  if(document.getElementById('statsGate'))return false;
  const gate=this.el('div'),form=this.el('form','statsGateForm'),input=this.el('input'),row=this.el('div','statsGateRow'),ok=this.el('button',null,'확인'),cancel=this.el('button',null,'취소'),note=this.el('p','statsGateNote',message);
  gate.id='statsGate';gate.setAttribute('role','dialog');gate.setAttribute('aria-label','비밀번호');
  input.type='password';input.id='statsGateInput';input.autocomplete='off';input.setAttribute('aria-label','비밀번호');input.placeholder='비밀번호';
  ok.type='submit';cancel.type='button';cancel.onclick=()=>gate.remove();
  form.onsubmit=event=>{event.preventDefault();this.open(input.value)};
  row.append(ok,cancel);form.append(this.el('h2',null,'기록실'),input,note,row);gate.append(form);document.body.append(gate);input.focus();return true;
 },
 open(key){
  if(document.getElementById('statsScene'))return false;
  document.getElementById('statsGate')?.remove();
  const scene=this.el('div'),panel=this.el('div','statsPanel'),head=this.el('header'),tabs=this.el('nav'),close=this.el('button',null,'×');
  scene.id='statsScene';scene.setAttribute('role','dialog');scene.setAttribute('aria-label','탐사 기록 통계');
  close.type='button';close.id='statsClose';close.setAttribute('aria-label','닫기');close.onclick=()=>this.close();
  for(const [tab,name] of [['stats','통계'],['rows','기록']]){const button=this.el('button',null,name);button.type='button';button.dataset.statsTab=tab;button.onclick=()=>{this.tab=tab;this.render()};tabs.append(button)}
  head.append(this.el('h2',null,'탐사 기록 통계'),tabs,close);
  const body=this.el('div');body.id='statsBody';panel.append(head,body);scene.append(panel);document.body.append(scene);
  this.data=null;this.render('loading');this.load(key);return true;
 },
 close(){document.getElementById('statsScene')?.remove()},
 async load(key){
  const url=this.endpoint();if(!url){this.render('unset');return}
  try{
   const reply=await fetch(url+(url.includes('?')?'&':'?')+'view=summary&key='+encodeURIComponent(key));
   if(!reply.ok)throw new Error('HTTP '+reply.status);
   const data=await reply.json();
   if(data.error==='key'||data.error==='locked'){lsRemove(this.KEY_STORE);this.close();this.prompt(data.error==='locked'?'잠시 후 다시 시도하라.':'비밀번호가 다르다.');return}
   lsSet(this.KEY_STORE,key);this.data=data;this.render();
  }catch(error){ignoreError('play stats load failed',error);this.render('error')}
 },
 el(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!=null)node.textContent=text;return node},
 render(status){
  const body=document.getElementById('statsBody');body.replaceChildren();
  for(const button of document.querySelectorAll('[data-stats-tab]'))button.classList.toggle('on',button.dataset.statsTab===this.tab);
  const notice={loading:'기록을 불러오는 중…',unset:'수집 서버가 연결되어 있지 않다.',error:'기록을 불러오지 못했다.'}[status];
  if(notice||!this.data){body.append(this.el('p','statsNote',notice||'기록이 없다.'));return}
  body.append(this.tab==='rows'?this.rowsView(this.data):this.summaryView(this.data));
 },
 summaryView(data){
  const box=this.el('div','statsSummary'),floors=Array.from({length:25},(_,i)=>+data.floors?.[i]||0),total=+data.total||floors.reduce((a,b)=>a+b,0);
  const tiles=this.el('div','statsTiles');
  for(const [value,label] of [[total,'기록된 사망'],[data.avg?.level??'-','평균 레벨'],[data.avg?.kills??'-','평균 처치'],[data.avg?.turns??'-','평균 턴']]){const tile=this.el('div','statsTile');tile.append(this.el('b',null,value),this.el('small',null,label));tiles.append(tile)}
  const hist=this.el('div','statsHist'),peak=Math.max(1,...floors);
  floors.forEach((count,i)=>{const col=this.el('div','statsCol'),bar=this.el('i');bar.style.height=Math.round(count/peak*100)+'%';bar.title=`${i+1}층 ${count}명`;col.append(this.el('span','statsCount',count||''),bar,this.el('small',null,(i+1)%5===0||i===0?i+1:''));hist.append(col)});
  const causes=this.el('div','statsCauses'),list=(data.causes||[]).slice(0,this.TOP_CAUSES),top=Math.max(1,...list.map(c=>+c[1]||0));
  for(const [name,count] of list){const row=this.el('div','statsCause'),bar=this.el('i');bar.style.width=Math.round(count/top*100)+'%';row.append(this.el('span','statsCauseName',name),bar,this.el('b',null,count));causes.append(row)}
  box.append(tiles,this.el('h3',null,'도달 층별 사망'),hist,this.el('h3',null,'사망 원인'),causes);return box;
 },
 rowsView(data){
  const table=this.el('table','statsRows'),head=table.createTHead().insertRow();
  for(const name of ['시각','층','원인','Lv','처치','턴'])head.append(this.el('th',null,name));
  const bodyRows=table.createTBody();
  for(const row of data.recent||[]){const tr=bodyRows.insertRow();for(const value of [String(row.t||'').slice(5,16).replace('T',' '),row.floor,row.cause,row.level,row.kills,row.turns])tr.insertCell().textContent=value}
  return table;
 }
};
