/* 천면경탑: a three-floor mirror-symmetric tower (sub-dungeon of main floor 14).
   Floors, wall faces, monuments, columns, shrines and decor reuse the legend dungeon art (legendTexture, objectArt,
   drawLegendDecorCell) under three per-floor palettes (LEGEND_THEMES47.mirror_tower_1..3). Walls follow the main
   dungeon's negative-space renderer with the exposed vertical edge rule; stacked wall blocks and stepped daises give the
   tower its height (visual only). Moving mirror platforms (rafts) carry the player across mirror pools.
   Floor 1: vertical ferries whose next position is reflected on the water. Floor 2: four lanes of opposed ferries.
   Floor 3: a ferry hall and the Mirror Keeper's arena. The Keeper drops the legendary 천면경 검. */
const MIRROR_KEEPER=Object.freeze({name:'거울지기',concept57:'천 개의 거울 속에서 손님의 얼굴을 가장 먼저 훔쳐 가던 파경대의 문지기.',hp:150,atk:13,def:6,eva:6,xp:0,boss:true,kind:'spirit',shape:'human',color:'#b4c1c7',bossPattern:'mirrorKeeper105',mirrorKeeper105:true,summonsVanish:true,legendDungeon47:'mirror_blade',legendMob47:true});
const MIRROR_NEXT={rafts:null,turn:-1,map:null};
function mirrorThemeId(){return 'mirror_tower_'+(state?.branchContext105?.level||1)}
function mirrorTheme(){return LEGEND_THEMES47[mirrorThemeId()]}
function mirrorRaftNext(){
 const cache=MIRROR_NEXT;if(cache.rafts===state.rafts&&cache.turn===state.floorTurn)return cache.map;
 const map=new Map();for(const r of state.rafts||[]){if(!r.mirrorRaft105)continue;const horizontal=r.axis==='x',pos=horizontal?r.x:r.y,next=pos+r.dir;if(next<r.min||next>r.max)continue;map.set(horizontal?k(next,r.y):k(r.x,next),r.dir)}
 cache.rafts=state.rafts;cache.turn=state.floorTurn;cache.map=map;return map;
}
function mirrorTerrainInfo(t,x,y){
 const tower=state?.branchTerrain105?.mirrorTower105;if(!tower)return null;
 const d=tower.decor[k(x,y)];if(d?.object49)return{name:d.label,desc:'천면경탑의 거울 장식이다. 표면에 비친 방이 실제보다 한 걸음 앞서 움직이는 듯하다.',hint:''};
 if(t===TT.RAFT)return{name:'거울 발판',desc:'은빛 발판이 정해진 길을 따라 한 칸씩 오간다. 위에 서 있으면 함께 실려 간다.',hint:'발판이 다음에 놓일 칸은 물 위에 희미한 테두리로 비친다.'};
 if(t===TT.WATER)return{name:'경면 못',desc:'물이라기보다 거울에 가깝다. 빠지면 익사한다. 발판이 지나가는 칸만 밟고 건너야 한다.',hint:'발판의 다음 위치가 수면에 비친다.'};
 return null;
}
function mirrorHeight(x,y){return state.branchTerrain105.heights?.[y]?.[x]??0}
function mirrorFloorVariant(x,y){const s=state.branchTerrain105.surfaces[k(x,y)];return s&&s[0]==='f'?+s[1]:0}
function drawMirrorFloor(px,py,x,y){
 const T=mirrorTheme(),id=mirrorThemeId(),tower=state.branchTerrain105.mirrorTower105,h=hash49(x,y);
 X.drawImage(legendTexture(id,mirrorFloorVariant(x,y),h%4),px,py);
 if(state.map[y-1]?.[x]===TT.WALL){const g=X.createLinearGradient(0,py,0,py+10);g.addColorStop(0,'rgba(0,0,0,.42)');g.addColorStop(1,'rgba(0,0,0,0)');X.fillStyle=g;X.fillRect(px,py,32,10)}
 if(state.map[y]?.[x-1]===TT.WALL){X.fillStyle='rgba(0,0,0,.18)';X.fillRect(px,py,3,32)}
 // balustrade posts where a bank meets a mirror pool
 const water=(dx,dy)=>{const t=state.map[y+dy]?.[x+dx];return t===TT.WATER||t===TT.RAFT};
 if(water(0,-1)){X.fillStyle=shade49(T.trim,-40);X.fillRect(px,py,32,2);X.fillStyle=T.trim;for(let i=2;i<32;i+=10)X.fillRect(px+i,py,3,5)}
 if(water(0,1)){X.fillStyle=shade49(T.trim,-40);X.fillRect(px,py+30,32,2);X.fillStyle=T.trim;for(let i=2;i<32;i+=10)X.fillRect(px+i,py+27,3,5)}
 // stepped dais: south riser, or stairs where the plan places them
 const here=mirrorHeight(x,y),south=mirrorHeight(x,y+1);
 if(here>south&&state.map[y+1]?.[x]!==TT.WALL){
  const rise=Math.min(20,(here-south)*14),stair=tower.stairs[k(x,y)];
  const face=X.createLinearGradient(0,py+32-rise,0,py+32);face.addColorStop(0,shade49(T.wall2,-6));face.addColorStop(1,shade49(T.wall,-14));X.fillStyle=face;X.fillRect(px,py+32-rise,32,rise);
  X.fillStyle=T.trim;X.fillRect(px,py+32-rise,32,2);
  if(stair){for(let i=0;i<4;i++){X.fillStyle=i%2?shade49(T.floor2,-30):T.floor2;X.fillRect(px+2,py+32-rise+i*Math.ceil(rise/4),28,Math.ceil(rise/4)-1)}X.fillStyle='rgba(0,0,0,.25)';X.fillRect(px,py+32-rise,2,rise);X.fillRect(px+30,py+32-rise,2,rise)}
  else{X.fillStyle='rgba(0,0,0,.3)';for(let i=4;i<32;i+=8)X.fillRect(px+i,py+34-rise,1,rise-3)}
 }
 if(here<south){const g=X.createLinearGradient(0,py+22,0,py+32);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.18)');X.fillStyle=g;X.fillRect(px,py+22,32,10)}
 const d=tower.decor[k(x,y)];if(d)drawLegendDecorCell(d,px,py,T);
}
function drawMirrorPool(px,py,x,y,now){
 const T=mirrorTheme(),edge=(dx,dy)=>{const t=state.map[y+dy]?.[x+dx];return t!==TT.WATER&&t!==TT.RAFT};
 const g=X.createLinearGradient(px,py,px,py+32);g.addColorStop(0,shade49(T.accent,-118));g.addColorStop(1,shade49(T.accent,-150));X.fillStyle=g;X.fillRect(px,py,32,32);
 const shift=((now||0)/55+x*9+y*5)%32;X.fillStyle=shade49(T.accent,-70)+'88';X.fillRect(px+2,py+((shift)|0)%30,28,1);X.fillRect(px+5,py+((shift+13)|0)%30,22,1);
 X.fillStyle=T.glow+'22';X.beginPath();X.moveTo(px+4,py+30);X.lineTo(px+14,py+2);X.lineTo(px+19,py+2);X.lineTo(px+9,py+30);X.closePath();X.fill();
 X.fillStyle=T.accent+'88';if(edge(0,-1))X.fillRect(px,py,32,1);if(edge(0,1))X.fillRect(px,py+31,32,1);if(edge(-1,0))X.fillRect(px,py,1,32);if(edge(1,0))X.fillRect(px+31,py,1,32);
 const ghost=mirrorRaftNext().get(k(x,y));
 if(ghost&&state.visible.has(k(x,y))){const a=.55+.25*Math.sin((now||0)/260);X.strokeStyle=T.glow;X.globalAlpha=a;X.lineWidth=2;X.strokeRect(px+6,py+6,20,20);X.fillStyle=T.accent;X.globalAlpha=a*.25;X.fillRect(px+7,py+7,18,18);X.globalAlpha=1}
}
function drawMirrorRaft(px,py,x,y,now){
 const T=mirrorTheme();drawMirrorPool(px,py,x,y,now);
 X.fillStyle='rgba(0,0,0,.45)';X.fillRect(px+4,py+7,26,24);
 X.fillStyle=shade49(T.trim,-70);X.fillRect(px+3,py+4,26,24);X.fillStyle=T.floor2;X.fillRect(px+4,py+5,24,22);X.fillStyle=T.trim;X.fillRect(px+4,py+5,24,2);
 X.fillStyle=shade49(T.floor2,-28);X.fillRect(px+7,py+9,18,16);X.fillStyle=T.glow;X.beginPath();X.arc(px+16,py+17,5,0,Math.PI*2);X.fill();X.fillStyle=T.accent;X.beginPath();X.arc(px+16,py+17,2.4,0,Math.PI*2);X.fill();
 X.fillStyle=T.trim;for(const[a,b]of[[6,7],[24,7],[6,24],[24,24]])X.fillRect(px+a,py+b,2,2);
}
function mirrorStackDepth(x,y){
 for(let j=1;j<=6;j++){const t=state.map[y+j]?.[x];if(t==null)return 0;if(t!==TT.WALL)return state.seen.has(k(x,y+j))?j-1:0}
 return 0;
}
function drawMirrorWall(px,py,x,y){
 const T=mirrorTheme(),id=mirrorThemeId(),tower=state.branchTerrain105.mirrorTower105,H=tower.height,h=hash49(x,y);
 const front=wallFaceOpen(x,y,0,1),broad=state.map[y]?.[x-1]===TT.WALL&&state.map[y]?.[x+1]===TT.WALL,depth=front||!broad?0:mirrorStackDepth(x,y);
 if(front){
  X.drawImage(legendTexture(id,4+(h%2),h%4),px,py);
  const g=X.createLinearGradient(0,py,0,py+32);g.addColorStop(0,'rgba(0,0,0,.30)');g.addColorStop(1,'rgba(0,0,0,0)');X.fillStyle=g;X.fillRect(px,py,32,32);
  X.fillStyle=T.trim;X.fillRect(px,py,32,2);X.fillStyle='rgba(0,0,0,.35)';X.fillRect(px,py+30,32,2);
  carryWallEdges(px,py,x,y);
  const d=tower.decor[k(x,y)];if(d)drawLegendDecorCell(d,px,py,T);
  return;
 }
 if(depth>0&&depth<H){
  // wall blocks stacked above the room's back wall: same grain, darker with height, capped by a cornice
  X.drawImage(legendTexture(id,4+((h+depth)%2),(h>>2)%4),px,py);
  X.fillStyle=`rgba(4,8,14,${.16+depth*.12})`;X.fillRect(px,py,32,32);
  X.fillStyle=shade49(T.trim,-30)+'cc';X.fillRect(px,py+31,32,1);
  if(depth===H-1){X.fillStyle=T.trim;X.fillRect(px,py,32,3);X.fillStyle=shade49(T.trim,-60);X.fillRect(px,py+3,32,2)}
  else if(x%4===0){X.fillStyle='#0a1016';X.beginPath();X.roundRect(px+10,py+6,12,22,[6,6,0,0]);X.fill();X.fillStyle=T.accent+'66';X.fillRect(px+13,py+10,6,16)}
  const stacked=dx=>state.map[y]?.[x+dx]===TT.WALL&&mirrorStackDepth(x+dx,y)>0;
  X.fillStyle=T.trim;if(!stacked(-1))X.fillRect(px,py,2,32);if(!stacked(1))X.fillRect(px+30,py,2,32);
  return;
 }
 drawMainWall(px,py,x,y,{wall:T.wall2,cap:T.trim,beam:T.wall,dark:shade49(T.wall,-16),grain:T.wall});
}
function drawMirrorCell(t,px,py,x,y,now){
 const tower=state.branchTerrain105.mirrorTower105;if(!tower)return false;
 if(t===TT.WALL){drawMirrorWall(px,py,x,y);return true}
 if(t===TT.WATER){drawMirrorPool(px,py,x,y,now);return true}
 if(t===TT.RAFT){drawMirrorRaft(px,py,x,y,now);return true}
 if(tower.decor[k(x,y)]?.object49){drawMirrorFloor(px,py,x,y);return true}
 return false;
}
function drawMirrorAtmosphere(now){
 const T=mirrorTheme();X.save();X.setTransform(VIEW.dpr,0,0,VIEW.dpr,0,0);
 const v=X.createRadialGradient(VIEW.w*.5,VIEW.h*.45,VIEW.h*.28,VIEW.w*.5,VIEW.h*.5,VIEW.h*.9);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(6,8,16,.5)');X.fillStyle=v;X.fillRect(0,0,VIEW.w,VIEW.h);
 X.globalCompositeOperation='screen';
 const g=X.createLinearGradient(0,0,0,VIEW.h);g.addColorStop(0,T.accent+'22');g.addColorStop(.6,'rgba(0,0,0,0)');g.addColorStop(1,T.warm+'14');X.fillStyle=g;X.fillRect(0,0,VIEW.w,VIEW.h);
 const sweep=((now||0)/48)%(VIEW.w+VIEW.h);for(let i=0;i<3;i++){const x0=(sweep+i*VIEW.w*.37)%(VIEW.w+VIEW.h)-VIEW.h;X.fillStyle=T.glow+'0a';X.beginPath();X.moveTo(x0,0);X.lineTo(x0+70,0);X.lineTo(x0+70-VIEW.h*.6,VIEW.h);X.lineTo(x0-VIEW.h*.6,VIEW.h);X.closePath();X.fill()}
 for(let i=0;i<26;i++){const px=hash2(i,3,77)*VIEW.w+Math.sin((now||0)/900+i)*14,py=(hash2(i,9,79)*VIEW.h-(now||0)*.012*(1+i%3)+VIEW.h*2)%VIEW.h,a=.12+.12*Math.sin((now||0)/500+i*1.7);X.fillStyle=(i%3?T.glow:T.accent)+Math.round(Math.max(0,a)*255).toString(16).padStart(2,'0');X.fillRect(px,py,2,2)}
 X.restore();
}
function mirrorLayoutRooms(level){
 // Rooms are described once for the west half and mirrored about x=40 unless marked centre.
 const centre=(x,y,w,h,kind,hall)=>({x,y,w,h,kind,hall,centre:true}),side=(x,y,w,h,kind,hall)=>({x,y,w,h,kind,hall});
 if(level===1)return[centre(32,50,17,9,'oct'),centre(28,31,25,13,'oct',true),centre(30,11,21,10,'rect',true),centre(32,3,17,7,'rect'),side(6,44,15,13,'rect'),side(4,26,19,15,'rect'),side(6,10,15,11,'rect')];
 if(level===2)return[centre(32,50,17,9,'oct'),centre(14,22,53,23,'rect',true),centre(28,4,25,13,'oct',true),side(3,38,9,11,'rect'),side(3,13,9,11,'rect')];
 return[centre(32,50,17,9,'oct'),centre(28,33,25,11,'oct',true),centre(24,22,33,11,'rect',true),centre(20,3,41,17,'oct',true),side(6,38,15,12,'rect')];
}
function buildMirrorTower(level){
 const ter=state.branchTerrain105,m=state.map,def=BRANCH_DEFS105.mirror,MX=x=>80-x,themeId='mirror_tower_'+level,T=LEGEND_THEMES47[themeId];
 state.keyPlan96=null;state.floor2Choice63=null;state.generationInProgress57=true;state.rafts=[];
 const tower=ter.mirrorTower105={level,height:level===3?5:4,decor:{},lights:[],stairs:{}};ter.layoutVersion=3;
 const put=(x,y,v=0)=>{if(x<1||y<1||x>=COLS-1||y>=ROWS-1)throw Error('Mirror tower bounds');setTerrainTile58(m,x,y,TT.FLOOR);ter.surfaces[k(x,y)]='f'+v};
 const room=r=>{const cut=r.kind==='oct'?Math.max(2,Math.floor(Math.min(r.w,r.h)/3)):0;for(let yy=0;yy<r.h;yy++)for(let xx=0;xx<r.w;xx++){const dx=Math.min(xx,r.w-1-xx),dy=Math.min(yy,r.h-1-yy);if(dx+dy<cut)continue;put(r.x+xx,r.y+yy,r.hall?2:0)}const q={x:r.x,y:r.y,w:r.w,h:r.h,cx:r.x+(r.w>>1),cy:r.y+(r.h>>1),kind:r.kind,hall:!!r.hall,centre:!!r.centre};state.rooms.push(q);return q};
 const hall=(ax,ay,bx,by,v=2)=>{let x=ax,y=ay;const wide=(px,py,h)=>{for(let j=-1;j<=1;j++)if(h)put(px,py+j,v);else put(px+j,py,v)};wide(x,y,true);while(x!==bx){x+=Math.sign(bx-x);wide(x,y,true)}while(y!==by){y+=Math.sign(by-y);wide(x,y,false)}};
 const hallM=(ax,ay,bx,by)=>{hall(ax,ay,bx,by);hall(MX(ax),ay,MX(bx),by)};
 const rooms=[];for(const r of mirrorLayoutRooms(level)){rooms.push(room(r));if(!r.centre)rooms.push(room({...r,x:MX(r.x+r.w-1)}))}
 const tracks=new Set(),water=(x,y)=>{setTerrainTile58(m,x,y,TT.WATER);ter.surfaces[k(x,y)]='pool';tracks.add(k(x,y))};
 const ferry=(x,y,min,max,dir,axis)=>{const start=dir>0?min:max;const rx=axis==='x'?start:x,ry=axis==='x'?y:start;setTerrainTile58(m,rx,ry,TT.RAFT);state.rafts.push({x:rx,y:ry,min,max,dir,axis,mirrorRaft105:true})};
 let up,down=null,bossAt=null;
 if(level===1){
  hall(40,49,40,44);hall(40,11,40,9);
  hall(40,31,40,21);for(let y=26;y<=30;y++)for(let x=39;x<=41;x++)water(x,y);ferry(40,26,26,30,1,'y');
  hallM(31,54,21,54);hallM(13,43,13,41);hallM(23,37,27,37);hallM(13,25,13,21);for(let y=22;y<=24;y++)for(const cx of [13,MX(13)])for(let x=cx-1;x<=cx+1;x++)water(x,y);ferry(13,22,22,24,1,'y');ferry(MX(13),22,22,24,-1,'y');
  hallM(21,15,29,15);hallM(13,10,13,6);hall(13,6,31,6);hall(MX(13),6,MX(31),6);
  up={x:40,y:55};down={x:40,y:6};
 }else if(level===2){
  hall(40,49,40,45);hall(40,21,40,17);
  const lanes=[39,35,31,27],segs=[[14,23],[24,33],[34,43],[44,53],[54,66]];
  for(let li=0;li<lanes.length;li++){const y=lanes[li];for(let x=14;x<=66;x++)water(x,y);for(let si=0;si<segs.length;si++){const[min,max]=segs[si],dir=(li%2?-1:1)*(si%2?-1:1);ferry(0,y,min,max,dir,'x')}}
  hallM(13,42,12,42);hallM(13,24,12,24);
  up={x:40,y:55};down={x:40,y:10};
 }else{
  hall(40,49,40,44);hallM(27,37,21,37);hall(40,32,40,32);
  for(let y=26;y<=28;y++)for(let x=24;x<=56;x++)water(x,y);
  [28,34,40,46,52].forEach((x,i)=>ferry(x,26,26,28,i%2?-1:1,'y'));
  hall(40,21,40,20);
  up={x:40,y:55};bossAt={x:40,y:11};
 }
 // inner partitions turn the big side chambers into four linked cells.
 for(const r of rooms){if(r.hall||r.w<15||r.h<13)continue;for(let y=r.y+1;y<r.y+r.h-1;y++)if(Math.abs(y-r.cy)>1)setTerrainTile58(m,r.cx,y,TT.WALL);for(let x=r.x+1;x<r.x+r.w-1;x++)if(Math.abs(x-r.cx)>2)setTerrainTile58(m,x,r.cy,TT.WALL)}
 // heights: stepped daises
 const heights=ter.heights,raise=(x0,y0,x1,y1,hh)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)if(m[y]?.[x]===TT.FLOOR)heights[y][x]=Math.max(heights[y][x],hh)};
 const steps=(x0,x1,y)=>{for(let x=x0;x<=x1;x++)tower.stairs[k(x,y)]=true};
 if(level===1){raise(34,34,46,40,1);steps(39,41,40);raise(33,4,47,6,1);steps(39,41,6)}
 else if(level===2){raise(30,4,50,8,1);steps(39,41,8);raise(35,4,45,6,2);steps(39,41,6)}
 else{
  const ax=40,ay=11;for(let y=3;y<=19;y++)for(let x=20;x<=60;x++){if(m[y][x]!==TT.FLOOR)continue;const d=Math.hypot((x-ax)/1.25,y-ay);heights[y][x]=d<=3.8?2:d<=7.6?1:0}
  for(let y=3;y<=19;y++)for(let x=20;x<=60;x++)if(heights[y][x]>(heights[y+1]?.[x]??0)&&Math.abs(x-ax)<=1)tower.stairs[k(x,y)]=true;
 }
 // decor and objects (legend art)
 const decor=(x,y,kind,label,extra={})=>{tower.decor[k(x,y)]={x,y,kind,label,...extra}};
 const free=(x,y)=>m[y]?.[x]===TT.FLOOR&&!tower.decor[k(x,y)]?.object49&&ter.surfaces[k(x,y)]!=='pool'&&!tracks.has(k(x,y));
 const object=(x,y,w,h,kind,label)=>{
  for(let yy=y-1;yy<=y+h;yy++)for(let xx=x-1;xx<=x+w;xx++)if(!free(xx,yy)||DIRS4.some(([dx,dy])=>m[yy+dy]?.[xx+dx]===TT.WATER))return false;
  const o={x,y,w,h,kind,label,solid:true,theme:themeId};
  for(let dy=0;dy<h;dy++)for(let dx=0;dx<w;dx++){setTerrainTile58(m,x+dx,y+dy,TT.STONE_PILLAR);decor(x+dx,y+dy,kind,label,{object49:o,dx,dy,w,h})}
  return true;
 };
 const lamp=(x,y,color)=>{if(!free(x,y))return;decor(x,y,'light','전용 조명');tower.lights.push({x,y,color:color||T.warm,r:3.4,power:.24})};
 const pick=(arr,i)=>arr[Math.abs(i)%arr.length];
 for(const r of rooms){
  const big=r.w>=21&&r.h>=11;
  // floor variety: inlaid centre, weathered edges, glass shards
  for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++){if(m[y][x]!==TT.FLOOR||ter.surfaces[k(x,y)]==='pool')continue;const h=hash49(x,y),edge=x<r.x+2||y<r.y+2||x>r.x+r.w-3||y>r.y+r.h-3;
   if(!edge&&r.hall&&Math.abs(x-r.cx)<=Math.max(2,r.w>>3))ter.surfaces[k(x,y)]='f1';else if(edge)ter.surfaces[k(x,y)]=h%5===0?'f3':'f0';
   if(h%67===0&&ter.surfaces[k(x,y)]!=="f1")decor(x,y,'floor'+(h>>5)%4,pick(T.floordecor,h>>3))}
  if(r.hall&&r.w>=15)for(let y=r.y+3;y<r.y+r.h-3;y+=4)for(let x=r.x+3;x<r.x+r.w-3;x+=5)if(free(x,y)&&!tower.decor[k(x,y)]&&hash49(x,y)%3===0)decor(x,y,'mosaic','비대칭 모자이크');
  // wall mirrors and lamps along the north face
  for(let x=r.x+1;x<r.x+r.w-1;x++){const wy=r.y-1;if(m[wy]?.[x]===TT.WALL&&m[wy][x-1]===TT.WALL&&m[wy][x+1]===TT.WALL){if(x%3===0)decor(x,wy,'wall'+((x+r.x)%4),pick(T.walls,x+r.x));if(x%6===2)lamp(x,r.y,T.warm)}}
  if(r.w>=9){lamp(r.x+1,r.y+r.h-2,T.light);lamp(r.x+r.w-2,r.y+r.h-2,T.light)}
  // furniture bays: columns, monuments, shrines and worksets
  if(big){
   for(let x=r.x+3;x<r.x+r.w-3;x+=4){if(Math.abs(x-r.cx)<=2)continue;object(x,r.y+1,1,2,'column','측랑 열주');object(x,r.y+r.h-3,1,2,'column','측랑 열주')}
   if(r.w>=25&&r.h>=11){const my=r.cy-1;object(r.x+4,my,3,3,'monumentA',T.landmarks[0]);object(r.x+r.w-7,my,3,3,'monumentB',T.landmarks[1])}
   else{object(r.x+3,r.cy-1,2,2,'shrine',pick(T.props,r.x));object(r.x+r.w-5,r.cy-1,2,2,'workset',pick(T.props,r.x+1))}
  }else if(r.w>=9&&!r.centre){
   const bays=[[r.x+2,r.y+2,'shrine'],[r.x+r.w-4,r.y+2,'workset'],[r.x+2,r.y+r.h-4,'workset'],[r.x+r.w-4,r.y+r.h-4,'shrine']];
   bays.forEach(([x,y,kind],i)=>object(x,y,2,2,kind,pick(T.props,i+r.x)));
   if(r.w>=15)for(const y of [r.y+3,r.y+r.h-5])object(r.cx-1,y,1,2,'column','측랑 열주');
  }
 }
 if(level===2){
  for(let x=14;x<=66;x++){for(const y of [22,23,24,25,26,40,41,42,43,44])ter.surfaces[k(x,y)]=(x>=32&&x<=48)?'f1':(y===22||y===44?'f2':'f0');for(const y of [37,33,29])if(ter.surfaces[k(x,y)]!=='pool')ter.surfaces[k(x,y)]='f2'}
  for(const x of [18,22,26,30,50,54,58,62]){for(const y of [37,33,29])if(hash49(x,y)%2)object(x,y,1,2,'column','반영 난간 기둥');object(x,23,1,2,'column','반영 난간 기둥');object(x,41,1,2,'column','반영 난간 기둥')}
  object(30,24,3,3,'monumentA',T.landmarks[0]);object(48,24,3,3,'monumentB',T.landmarks[1]);object(30,40,3,3,'monumentB',T.landmarks[1]);object(48,40,3,3,'monumentA',T.landmarks[0]);
  for(let x=16;x<=64;x+=6)for(const y of [38,34,30])lamp(x,y,T.light);
 }
 if(level===3){
  const ax=40,ay=11;
  for(let y=3;y<=19;y++)for(let x=20;x<=60;x++){if(m[y][x]!==TT.FLOOR)continue;const d=Math.hypot((x-ax)/1.25,y-ay);ter.surfaces[k(x,y)]=d<=3.8?'f1':d<=7.6&&d>=6.4?'f2':d<=7.6?'f0':'f3'}
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2+Math.PI/8,x=Math.round(ax+Math.cos(a)*14),y=Math.round(ay+Math.sin(a)*7);object(x,y,1,2,'column','파경대 열주')}
  object(ax-13,ay-1,3,3,'monumentA',T.landmarks[0]);object(ax+11,ay-1,3,3,'monumentB',T.landmarks[1]);
  for(const[x,y]of[[26,6],[54,6],[26,16],[54,16],[40,4]])lamp(x,y,T.accent);
  for(const x of [26,30,50,54])object(x,23,1,2,'column','반영 난간 기둥');
 }
 // portals
 const portal=(pid,p,to,arrival,label)=>{setTerrainTile58(m,p.x,p.y,TT.PORTAL);state.branchPortals105.push({id:pid,kind:'branch',...p,to,arrival,label})};
 portal('up',up,level===1?`main:${def.parent}`:`mirror:${level-1}`,level===1?'mirror':'down',level===1?`만루 ${def.parent}층으로`:`${def.name} ${level-1}층으로`);
 if(down)portal('down',down,`mirror:${level+1}`,'up',`${def.name} ${level+1}층`);
 Object.assign(state.player,up);state.fixedStart={...up};state.fixedExit=down||bossAt;state.stairs={...state.fixedExit};
 // reachability counting each ferry track as walkable (a ferry always comes back).
 const passable=(x,y)=>{const t=m[y]?.[x];return t!=null&&(tracks.has(k(x,y))||(!tileBlocks(t)&&![TT.WATER,TT.VOID,TT.LAVA,TT.MERCURY].includes(t)))};
 const reach=new Set([k(up.x,up.y)]),queue=[up];for(let i=0;i<queue.length;i++){const p=queue[i];for(const[dx,dy]of DIRS4){const x=p.x+dx,y=p.y+dy,kk=k(x,y);if(reach.has(kk)||!passable(x,y))continue;reach.add(kk);queue.push({x,y})}}
 for(const r of rooms)if(!reach.has(k(r.cx,r.cy))&&!tileBlocks(m[r.cy][r.cx])&&!tower.decor[k(r.cx,r.cy)]?.object49)throw Error('Mirror tower room disconnected '+r.cx+','+r.cy);
 for(const p of state.branchPortals105)if(!reach.has(k(p.x,p.y)))throw Error('Mirror tower portal unreachable');
 if(bossAt&&!reach.has(k(bossAt.x,bossAt.y)))throw Error('Mirror tower arena unreachable');
 // population
 const spawn=(name,p)=>{const mon=spawnNamed(name,p,{placementMode:'exact',provenance:'subbranch-random-v3',legendDungeon47:'mirror_blade'});if(!mon)throw Error('Mirror tower spawn rejected '+name);mon.branch105='mirror';return mon};
 const freeCells=r=>{const cells=[];for(let y=r.y+1;y<r.y+r.h-1;y++)for(let x=r.x+1;x<r.x+r.w-1;x++)if(m[y][x]===TT.FLOOR&&reach.has(k(x,y))&&Math.hypot(x-up.x,y-up.y)>6&&(!down||Math.hypot(x-down.x,y-down.y)>3)&&(!bossAt||Math.hypot(x-bossAt.x,y-bossAt.y)>6))cells.push({x,y});return cells};
 const pool=['파편 망령','거울 시녀','반영 검객'];
 rooms.forEach((r,i)=>{if(r.w<9)return;const cells=freeCells(r),per=r.w>40?7:r.w>=25?4:r.w>=15?3:2;for(let n=0;n<per&&cells.length;n++)spawn(pool[(i+n)%pool.length],cells.splice(rand(0,cells.length-1),1)[0])});
 if(level===3){const boss=scaledMonster(MIRROR_KEEPER,branchCombatFloor());Object.assign(boss,{x:bossAt.x,y:bossAt.y,guardHome57:{...bossAt},alerted:false});OccupancyService.addMonster(boss)}
 const food=naturalFoodPick();for(const r of rooms.filter(r=>r.w>=15)){const cells=freeCells(r);if(cells.length)PlacementService.placeItem({...clone(food),count:1},cells[rand(0,cells.length-1)],{requireReachable:false})}
 for(const r of rooms.filter(r=>r.w>=9&&r.w<15)){const cells=freeCells(r);if(cells.length)dropFloorLoot(cells[rand(0,cells.length-1)])}
}
function mirrorTowerTick(){
 if(state?.branchContext105?.id!=='mirror')return;
 const boss=(state.monsters||[]).find(mon=>mon.mirrorKeeper105&&mon.hp>0);if(!boss)return;
 const ratio=boss.hp/Math.max(1,boss.maxHp),phase=ratio<=.34?2:ratio<=.67?1:0;
 while((boss.mirrorPhase105||0)<phase){
  boss.mirrorPhase105=(boss.mirrorPhase105||0)+1;let born=0;
  for(let i=0;i<2;i++){
   const child=scaledMonster(MIRROR_DUELIST,branchCombatFloor());child.hp=child.maxHp=Math.max(8,Math.round(child.maxHp*.6));
   const q=PlacementService.findMonster(child,{placementMode:'local',origin:boss,radius:5});if(!q)continue;
   Object.assign(child,{x:q.x,y:q.y,bossOwnerId57:combatantId(boss),spawnProvenance57:'summon',branch105:'mirror'});inheritCombatFaction57(child,boss);if(OccupancyService.addMonster(child))born++;
  }
  if(born)addLog(`거울지기의 거울상 ${born}이 거울 속에서 걸어 나왔다.`);
 }
}
function mirrorKeeperDefeated(mon,reward){
 if(!mon.mirrorKeeper105||!reward?.kills||state.branchContext105?.id!=='mirror')return;
 const legend=globalThis.__MANRU_LEGEND47__.defs().find(w=>w.id==='mirror_blade');if(!legend||state.player.weapon?.artifactId46==='mirror_blade')return;
 PlacementService.placeItem({...clone(legend),type:'weapon',artifactId46:'mirror_blade',legendaryWeapon47:true,artifactWeapon46:true,identified:true,count:1},{x:mon.x,y:mon.y});
 addLog('거울지기가 깨어지며 바닥에 천면경 검이 떨어졌다.');
}
