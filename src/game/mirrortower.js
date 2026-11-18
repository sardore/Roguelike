/* 천면경탑: a three-floor mirror-symmetric tower (sub-dungeon of main floor 14).
   Walls use the main dungeon's negative-space renderer; moving mirror platforms (rafts) carry the player across mirror pools.
   Floor 1: vertical ferries whose next position is reflected on the water. Floor 2: four lanes of opposed ferries.
   Floor 3: a ferry hall and the Mirror Keeper's arena. The Keeper drops the legendary 천면경 검. */
const MIRROR_WALL_PALETTE=Object.freeze({wall:'#7a8388',cap:'#b4c1c7',beam:'#535e65',dark:'#30343a',grain:'#4a5354'});
const MIRROR_KEEPER=Object.freeze({name:'거울지기',concept57:'천 개의 거울 속에서 손님의 얼굴을 가장 먼저 훔쳐 가던 파경대의 문지기.',hp:150,atk:13,def:6,eva:6,xp:0,boss:true,kind:'spirit',shape:'human',color:'#b4c1c7',bossPattern:'mirrorKeeper105',mirrorKeeper105:true,summonsVanish:true,legendDungeon47:'mirror_blade',legendMob47:true});
const MIRROR_PROPS=Object.freeze({
 pillar:['은사 기둥','가는 은실을 감아 올린 석주. 표면에 비친 방 안이 조금씩 어긋나 있다.'],
 stand:['파경 경대','타원 거울을 세운 낮은 경대. 거울 속의 방은 실제보다 한 걸음 앞서 움직이는 듯하다.'],
 divan:['낡은 좌상','손님을 기다리게 하던 낮은 좌상. 천은 바랬지만 은실 수가 남아 있다.'],
 brazier:['은 화로','차가운 은빛 불꽃이 타는 화로. 불꽃은 거울에 비치는 쪽으로만 따뜻하게 보인다.'],
 urn:['반영 항아리','목이 긴 항아리. 입구가 거울처럼 매끈해 위를 들여다보면 누군가 마주 본다.']
});
function mirrorRaftNext(){
 const cache=MIRROR_NEXT;if(cache.rafts===state.rafts&&cache.turn===state.floorTurn)return cache.map;
 const map=new Map();for(const r of state.rafts||[]){if(!r.mirrorRaft105)continue;const horizontal=r.axis==='x',pos=horizontal?r.x:r.y,next=pos+r.dir;if(next<r.min||next>r.max)continue;map.set(horizontal?k(next,r.y):k(r.x,next),r.dir)}
 cache.rafts=state.rafts;cache.turn=state.floorTurn;cache.map=map;return map;
}
const MIRROR_NEXT={rafts:null,turn:-1,map:null};
function mirrorTerrainInfo(t,x,y){
 const tower=state?.branchTerrain105?.mirrorTower105;if(!tower)return null;
 const prop=tower.props[k(x,y)];if(prop&&MIRROR_PROPS[prop])return{name:MIRROR_PROPS[prop][0],desc:MIRROR_PROPS[prop][1],hint:''};
 if(t===TT.RAFT)return{name:'거울 발판',desc:'은빛 발판이 정해진 길을 따라 한 칸씩 오간다. 위에 서 있으면 함께 실려 간다.',hint:'발판이 다음에 놓일 칸은 물 위에 희미한 은빛 테두리로 비친다.'};
 if(t===TT.WATER)return{name:'경면 못',desc:'물이라기보다 검은 거울에 가깝다. 빠지면 익사한다. 발판이 지나가는 칸만 밟고 건너야 한다.',hint:'발판의 다음 위치가 수면에 비친다.'};
 return null;
}
function mirrorPaletteFloor(x,y,style){
 const h=hash2(x,y,31337);
 if(style==='mosaic')return{base:h>.5?'#3a434b':'#3d4750',alt:'#6d6a63'};
 if(style==='inlay')return{base:h>.5?'#3c454d':'#3f4851',alt:'#a9a092'};
 if(style==='shard')return{base:h>.5?'#384149':'#3b444c',alt:'#b4c1c7'};
 return{base:h>.5?'#39424a':'#3d464e',alt:'#4a545c'};
}
function drawMirrorFloor(px,py,x,y){
 const style=state.branchTerrain105.surfaces[k(x,y)]||'stone',P=mirrorPaletteFloor(x,y,style),h=hash2(x,y,271);
 X.fillStyle=P.base;X.fillRect(px,py,32,32);
 X.fillStyle='rgba(0,0,0,.18)';X.fillRect(px,py+31,32,1);X.fillRect(px+31,py,1,32);X.fillStyle='rgba(180,200,215,.05)';X.fillRect(px,py,32,1);X.fillRect(px,py,1,32);
 if(style==='mosaic'){X.fillStyle=P.alt;X.beginPath();X.moveTo(px+16,py+3);X.lineTo(px+29,py+16);X.lineTo(px+16,py+29);X.lineTo(px+3,py+16);X.closePath();X.fill();X.fillStyle=P.base;X.beginPath();X.moveTo(px+16,py+9);X.lineTo(px+23,py+16);X.lineTo(px+16,py+23);X.lineTo(px+9,py+16);X.closePath();X.fill();X.fillStyle='rgba(239,241,220,.18)';X.fillRect(px+15,py+9,2,2)}
 else if(style==='inlay'){X.strokeStyle='rgba(169,160,146,.55)';X.lineWidth=1;X.strokeRect(px+3.5,py+3.5,25,25);X.fillStyle='rgba(180,193,199,.18)';X.fillRect(px+15,py+7,2,18);X.fillRect(px+7,py+15,18,2)}
 else if(style==='shard'){X.fillStyle='rgba(180,193,199,.32)';X.beginPath();X.moveTo(px+6+h*6,py+8);X.lineTo(px+15,py+4+h*4);X.lineTo(px+13,py+14);X.closePath();X.fill();X.beginPath();X.moveTo(px+20,py+20);X.lineTo(px+28,py+18+h*5);X.lineTo(px+23,py+28);X.closePath();X.fill();X.fillStyle='rgba(239,241,220,.35)';X.fillRect(px+13,py+9,1,1);X.fillRect(px+24,py+22,1,1)}
 else if(h>.82){X.fillStyle='rgba(180,193,199,.07)';X.fillRect(px+4,py+10+(h*8|0),24,1)}
 // A faint balustrade where a bank meets a mirror pool.
 const water=(dx,dy)=>state.map[y+dy]?.[x+dx]===TT.WATER||state.map[y+dy]?.[x+dx]===TT.RAFT;
 if(water(0,-1)){X.fillStyle='#8a949a';X.fillRect(px,py,32,2);X.fillStyle='#b4c1c7';for(let i=2;i<32;i+=10)X.fillRect(px+i,py,3,5)}
 if(water(0,1)){X.fillStyle='#8a949a';X.fillRect(px,py+30,32,2);X.fillStyle='#b4c1c7';for(let i=2;i<32;i+=10)X.fillRect(px+i,py+27,3,5)}
}
function drawMirrorPool(px,py,x,y,now){
 const edge=(dx,dy)=>{const t=state.map[y+dy]?.[x+dx];return t!==TT.WATER&&t!==TT.RAFT};
 const g=X.createLinearGradient(px,py,px,py+32);g.addColorStop(0,'#1b2a33');g.addColorStop(1,'#0f1a21');X.fillStyle=g;X.fillRect(px,py,32,32);
 const shift=((now||0)/55+x*9+y*5)%32;X.fillStyle='rgba(180,200,215,.10)';X.fillRect(px+2,py+((shift)|0)%30,28,1);X.fillStyle='rgba(180,200,215,.06)';X.fillRect(px+5,py+((shift+13)|0)%30,22,1);
 X.fillStyle='rgba(239,241,220,.13)';X.beginPath();X.moveTo(px+4,py+30);X.lineTo(px+14,py+2);X.lineTo(px+19,py+2);X.lineTo(px+9,py+30);X.closePath();X.fill();
 X.fillStyle='rgba(180,193,199,.45)';if(edge(0,-1))X.fillRect(px,py,32,1);if(edge(0,1))X.fillRect(px,py+31,32,1);if(edge(-1,0))X.fillRect(px,py,1,32);if(edge(1,0))X.fillRect(px+31,py,1,32);
 const ghost=mirrorRaftNext().get(k(x,y));
 if(ghost&&state.visible.has(k(x,y))){const a=.5+.25*Math.sin((now||0)/260);X.strokeStyle=`rgba(239,241,220,${a})`;X.lineWidth=2;X.strokeRect(px+6,py+6,20,20);X.fillStyle=`rgba(180,200,215,${a*.3})`;X.fillRect(px+7,py+7,18,18)}
}
function drawMirrorRaft(px,py,x,y,now){
 drawMirrorPool(px,py,x,y,now);
 X.fillStyle='rgba(0,0,0,.45)';X.fillRect(px+4,py+7,26,24);
 X.fillStyle='#56636b';X.fillRect(px+3,py+4,26,24);X.fillStyle='#8f9ea6';X.fillRect(px+4,py+5,24,22);X.fillStyle='#b4c1c7';X.fillRect(px+4,py+5,24,2);
 X.fillStyle='#6b7981';X.fillRect(px+7,py+9,18,16);X.fillStyle='#c9d6db';X.beginPath();X.arc(px+16,py+17,5,0,Math.PI*2);X.fill();X.fillStyle='#56636b';X.beginPath();X.arc(px+16,py+17,2.4,0,Math.PI*2);X.fill();
 X.fillStyle='#eff1dc';for(const[a,b]of[[6,7],[24,7],[6,24],[24,24]])X.fillRect(px+a,py+b,2,2);
}
function drawMirrorProp(kind,px,py,now){
 X.fillStyle='rgba(0,0,0,.35)';X.beginPath();X.ellipse(px+16,py+28,12,4,0,0,Math.PI*2);X.fill();
 if(kind==='pillar'){X.fillStyle='#4a545c';X.fillRect(px+8,py+4,16,24);X.fillStyle='#7a8388';X.fillRect(px+10,py+4,12,24);X.fillStyle='#b4c1c7';X.fillRect(px+10,py+4,3,24);X.fillStyle='#a9a092';X.fillRect(px+6,py+2,20,4);X.fillRect(px+6,py+26,20,4);X.fillStyle='rgba(239,241,220,.5)';for(let i=0;i<4;i++)X.fillRect(px+13+i*2,py+8+i*4,1,5)}
 else if(kind==='stand'){X.fillStyle='#6a5f4f';X.fillRect(px+6,py+22,20,6);X.fillStyle='#a9a092';X.beginPath();X.ellipse(px+16,py+13,10,12,0,0,Math.PI*2);X.fill();const g=X.createLinearGradient(px+8,py+3,px+24,py+23);g.addColorStop(0,'#9ab3c0');g.addColorStop(1,'#2d3f4a');X.fillStyle=g;X.beginPath();X.ellipse(px+16,py+13,8,10,0,0,Math.PI*2);X.fill();X.strokeStyle='rgba(239,241,220,.6)';X.beginPath();X.moveTo(px+11,py+8);X.lineTo(px+15,py+4);X.stroke()}
 else if(kind==='divan'){X.fillStyle='#43374a';X.fillRect(px+3,py+14,26,12);X.fillStyle='#6a5a78';X.fillRect(px+3,py+14,26,6);X.fillStyle='#a9a092';X.fillRect(px+3,py+10,5,16);X.fillRect(px+24,py+10,5,16);X.fillStyle='#b4c1c7';X.fillRect(px+9,py+16,14,1)}
 else if(kind==='brazier'){X.fillStyle='#56636b';X.fillRect(px+13,py+16,6,12);X.fillStyle='#8f9ea6';X.fillRect(px+8,py+12,16,6);const f=Math.sin((now||0)/130+px)*1.5;X.fillStyle='rgba(180,200,215,.85)';X.beginPath();X.moveTo(px+10,py+12);X.lineTo(px+16+f,py+1);X.lineTo(px+22,py+12);X.closePath();X.fill();X.fillStyle='#eff1dc';X.beginPath();X.moveTo(px+13,py+12);X.lineTo(px+16+f,py+6);X.lineTo(px+19,py+12);X.closePath();X.fill()}
 else{X.fillStyle='#4a424c';X.beginPath();X.ellipse(px+16,py+19,9,10,0,0,Math.PI*2);X.fill();X.fillStyle='#6b6272';X.fillRect(px+13,py+6,6,8);X.fillStyle='#b4c1c7';X.beginPath();X.ellipse(px+16,py+7,5,2,0,0,Math.PI*2);X.fill();X.fillStyle='rgba(239,241,220,.35)';X.fillRect(px+10,py+15,2,8)}
}
function drawMirrorOrnament(kind,px,py,now){
 if(kind==='mirror'){X.fillStyle='#a9a092';X.fillRect(px+4,py+4,24,25);X.fillStyle='#6a5f4f';X.fillRect(px+6,py+6,20,21);const g=X.createLinearGradient(px+6,py+6,px+26,py+27);g.addColorStop(0,'#a9c0cc');g.addColorStop(.55,'#4a6676');g.addColorStop(1,'#1f2e38');X.fillStyle=g;X.fillRect(px+7,py+7,18,19);X.fillStyle='rgba(239,241,220,.32)';X.beginPath();X.moveTo(px+9,py+25);X.lineTo(px+17,py+7);X.lineTo(px+20,py+7);X.lineTo(px+12,py+25);X.closePath();X.fill();X.strokeStyle='rgba(239,241,220,.5)';X.beginPath();X.moveTo(px+20,py+10);X.lineTo(px+17,py+16);X.lineTo(px+21,py+20);X.stroke()}
 else{X.fillStyle='#1d2328';X.fillRect(px+9,py+7,14,20);const g=X.createRadialGradient(px+16,py+16,1,px+16,py+16,12);g.addColorStop(0,'rgba(207,173,138,.55)');g.addColorStop(1,'rgba(207,173,138,0)');X.fillStyle=g;X.fillRect(px+6,py+4,20,24);X.fillStyle='#cfad8a';X.fillRect(px+14,py+12,4,7);X.fillStyle='#eff1dc';X.fillRect(px+15,py+13,2,3)}
}
function drawMirrorCell(t,px,py,x,y,now){
 const tower=state.branchTerrain105.mirrorTower105;if(!tower)return false;
 if(t===TT.WALL){
  drawMainWall(px,py,x,y,MIRROR_WALL_PALETTE);
  const orn=tower.ornaments[k(x,y)];
  if(orn&&wallFaceOpen(x,y,0,1)){X.save();drawMirrorOrnament(orn,px,py,now);X.restore()}
  return true;
 }
 if(t===TT.WATER){drawMirrorPool(px,py,x,y,now);return true}
 if(t===TT.RAFT){drawMirrorRaft(px,py,x,y,now);return true}
 const prop=tower.props[k(x,y)];
 if(prop&&t===TT.STONE_PILLAR){drawMirrorFloor(px,py,x,y);drawMirrorProp(prop,px,py,now);return true}
 return false;
}
function drawMirrorAtmosphere(now){
 X.save();X.setTransform(VIEW.dpr,0,0,VIEW.dpr,0,0);
 const v=X.createRadialGradient(VIEW.w*.5,VIEW.h*.45,VIEW.h*.25,VIEW.w*.5,VIEW.h*.5,VIEW.h*.85);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(8,14,22,.55)');X.fillStyle=v;X.fillRect(0,0,VIEW.w,VIEW.h);
 X.globalCompositeOperation='screen';
 const sweep=((now||0)/48)%(VIEW.w+VIEW.h);for(let i=0;i<3;i++){const x0=(sweep+i*VIEW.w*.37)%(VIEW.w+VIEW.h)-VIEW.h;X.fillStyle='rgba(180,200,215,.035)';X.beginPath();X.moveTo(x0,0);X.lineTo(x0+60,0);X.lineTo(x0+60-VIEW.h*.6,VIEW.h);X.lineTo(x0-VIEW.h*.6,VIEW.h);X.closePath();X.fill()}
 for(let i=0;i<22;i++){const px=hash2(i,3,77)*VIEW.w+Math.sin((now||0)/900+i)*14,py=(hash2(i,9,79)*VIEW.h-(now||0)*.012*(1+i%3)+VIEW.h*2)%VIEW.h,a=.10+.10*Math.sin((now||0)/500+i*1.7);X.fillStyle=`rgba(239,241,220,${Math.max(0,a)})`;X.fillRect(px,py,2,2)}
 X.restore();
}
function mirrorLayoutRooms(level){
 // Rooms are described once for the west half and mirrored about x=40 unless marked centre.
 const centre=(x,y,w,h,kind,style)=>({x,y,w,h,kind,style,centre:true}),side=(x,y,w,h,kind,style)=>({x,y,w,h,kind,style});
 if(level===1)return[centre(32,50,17,9,'oct','mosaic'),centre(28,31,25,13,'oct','inlay'),centre(30,11,21,10,'rect','inlay'),centre(32,3,17,7,'rect','mosaic'),side(6,44,15,13,'rect','stone'),side(4,26,19,15,'rect','mosaic'),side(6,10,15,11,'rect','shard')];
 if(level===2)return[centre(32,50,17,9,'oct','mosaic'),centre(14,22,53,23,'rect','stone'),centre(28,4,25,13,'oct','inlay'),side(3,38,9,11,'rect','shard'),side(3,13,9,11,'rect','mosaic')];
 return[centre(32,50,17,9,'oct','mosaic'),centre(28,33,25,11,'oct','inlay'),centre(24,22,33,11,'rect','stone'),centre(20,3,41,17,'oct','stone'),side(6,38,15,12,'rect','shard')];
}
function buildMirrorTower(level){
 const ter=state.branchTerrain105,m=state.map,def=BRANCH_DEFS105.mirror,MX=x=>80-x;
 state.keyPlan96=null;state.floor2Choice63=null;state.generationInProgress57=true;state.rafts=[];
 const tower=ter.mirrorTower105={level,height:level+1,ornaments:{},props:{}};ter.layoutVersion=2;
 const put=(x,y,s='stone')=>{if(x<1||y<1||x>=COLS-1||y>=ROWS-1)throw Error('Mirror tower bounds');setTerrainTile58(m,x,y,TT.FLOOR);ter.surfaces[k(x,y)]=s};
 const rect=(x,y,w,h,s)=>{for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)put(xx,yy,s)};
 const room=r=>{const cut=r.kind==='oct'?Math.max(2,Math.floor(Math.min(r.w,r.h)/3)):0;for(let yy=0;yy<r.h;yy++)for(let xx=0;xx<r.w;xx++){const dx=Math.min(xx,r.w-1-xx),dy=Math.min(yy,r.h-1-yy);if(dx+dy<cut)continue;put(r.x+xx,r.y+yy,r.style)}const q={x:r.x,y:r.y,w:r.w,h:r.h,cx:r.x+(r.w>>1),cy:r.y+(r.h>>1),kind:r.kind};state.rooms.push(q);return q};
 const hall=(ax,ay,bx,by,s='stone')=>{let x=ax,y=ay;const wide=(px,py,h)=>{for(let j=-1;j<=1;j++)if(h)put(px,py+j,s);else put(px+j,py,s)};wide(x,y,true);while(x!==bx){x+=Math.sign(bx-x);wide(x,y,true)}while(y!==by){y+=Math.sign(by-y);wide(x,y,false)}};
 const hallM=(ax,ay,bx,by)=>{hall(ax,ay,bx,by);hall(MX(ax),ay,MX(bx),by)};
 const rooms=[];for(const r of mirrorLayoutRooms(level)){rooms.push(room(r));if(!r.centre)rooms.push(room({...r,x:MX(r.x+r.w-1)}))}
 const tracks=new Set(),water=(x,y)=>{setTerrainTile58(m,x,y,TT.WATER);ter.surfaces[k(x,y)]='pool';tracks.add(k(x,y))};
 const ferry=(x,y,min,max,dir,axis)=>{const start=dir>0?min:max;const rx=axis==='x'?start:x,ry=axis==='x'?y:start;setTerrainTile58(m,rx,ry,TT.RAFT);state.rafts.push({x:rx,y:ry,min,max,dir,axis,mirrorRaft105:true})};
 let up,down=null,bossAt=null;
 if(level===1){
  hall(40,49,40,44);hall(40,11,40,9);
  // central ferry: water x39..41, y26..30; side ferries between the wings.
  hall(40,31,40,21);for(let y=26;y<=30;y++)for(let x=39;x<=41;x++)water(x,y);ferry(40,26,26,30,1,'y');
  hallM(31,54,21,54);hallM(13,43,13,41);hallM(23,37,27,37);hallM(13,25,13,21);for(let y=22;y<=24;y++)for(const cx of [13,MX(13)])for(let x=cx-1;x<=cx+1;x++)water(x,y);ferry(13,22,22,24,1,'y');ferry(MX(13),22,22,24,-1,'y');
  hallM(21,15,29,15);hallM(13,10,13,6);hall(13,6,31,6);hall(MX(13),6,MX(31),6);
  up={x:40,y:55};down={x:40,y:6};
 }else if(level===2){
  hall(40,49,40,45);hall(40,21,40,17);
  // four lanes of opposed ferries across the grand hall.
  const lanes=[39,35,31,27],segs=[[14,23],[24,33],[34,43],[44,53],[54,66]];
  for(let li=0;li<lanes.length;li++){const y=lanes[li];for(let x=14;x<=66;x++)water(x,y);for(let si=0;si<segs.length;si++){const[min,max]=segs[si],dir=(li%2?-1:1)*(si%2?-1:1);ferry(0,y,min,max,dir,'x')}}
  hallM(13,42,12,42);hallM(13,24,12,24);
  for(let x=14;x<=66;x++){for(const y of [22,23,24,25,26,40,41,42,43,44])ter.surfaces[k(x,y)]=(x>=32&&x<=48)||y===22||y===44?'inlay':'mosaic';for(const y of [37,33,29])ter.surfaces[k(x,y)]='inlay'}
  up={x:40,y:55};down={x:40,y:10};
 }else{
  hall(40,49,40,44);hallM(27,37,21,37);hall(40,32,40,32);
  // the ferry hall: five vertical ferries over a mirror band; a corridor leads on to the arena.
  for(let y=26;y<=28;y++)for(let x=24;x<=56;x++)water(x,y);
  [28,34,40,46,52].forEach((x,i)=>ferry(x,26,26,28,i%2?-1:1,'y'));
  hall(40,21,40,20);
  up={x:40,y:55};bossAt={x:40,y:10};
 }
 // wall mirrors and lantern niches along the north faces of every room.
 for(let y=1;y<ROWS-1;y++)for(let x=2;x<COLS-2;x++){if(m[y][x]!==TT.WALL||(m[y+1]?.[x]??TT.WALL)===TT.WALL||m[y][x-1]!==TT.WALL||m[y][x+1]!==TT.WALL)continue;if(x%8===0)tower.ornaments[k(x,y)]='mirror';else if(x%4===0)tower.ornaments[k(x,y)]='niche'}
 // furniture: symmetric pairs inside rooms, never within two cells of an edge so corridors and lanes stay open.
 const propAt=(x,y,kind)=>{const t=m[y]?.[x];if(t!==TT.FLOOR||ter.surfaces[k(x,y)]==='pool')return;if(DIRS8.some(([dx,dy])=>m[y+dy]?.[x+dx]!==TT.FLOOR))return;setTerrainTile58(m,x,y,TT.STONE_PILLAR);tower.props[k(x,y)]=kind};
 const propM=(x,y,kind)=>{propAt(x,y,kind);propAt(MX(x),y,kind)};
 for(const r of rooms){
  if(r.w<9||r.h<7)continue;const x0=r.x+2,x1=r.x+r.w-3,y0=r.y+2,y1=r.y+r.h-3;
  const interior=level===2&&r.w>40?[]:[[x0,y0,'pillar'],[x1,y0,'pillar'],[x0,y1,'brazier'],[x1,y1,'brazier']];
  for(const[x,y,kind]of interior)propAt(x,y,kind);
  if(r.w>=15&&r.h>=9){propAt(r.cx-3,y0,'stand');propAt(r.cx+3,y0,'stand');propAt(r.cx,y1,'divan')}
  if(r.w<15&&r.h>=7){propAt(x0+1,r.cy,'urn');propAt(x1-1,r.cy,'urn')}
 }
 if(level===2){for(const x of [20,26,34,46,54,60]){propAt(x,24,'pillar');propAt(x,42,'pillar');for(const y of [37,33,29])propAt(x,y,(x+y)%3?'pillar':'stand')}for(const y of [37,33,29]){propAt(17,y,'brazier');propAt(63,y,'brazier')}for(const x of [30,50]){propAt(x,23,'divan');propAt(x,43,'divan')}}
 if(level===3){
  // the arena: a mosaic ring, an inlaid dais and a ring of mirrors around the Keeper.
  const ax=40,ay=11;for(let y=3;y<=19;y++)for(let x=20;x<=60;x++){if(m[y][x]!==TT.FLOOR)continue;const d=Math.hypot((x-ax)/1.25,y-ay);ter.surfaces[k(x,y)]=d<=3.6?'inlay':d<=7.2&&d>=6?'mosaic':d<=5.2?'stone':'stone'}
  for(let i=0;i<10;i++){const a=i/10*Math.PI*2,x=Math.round(ax+Math.cos(a)*11),y=Math.round(ay+Math.sin(a)*6.2);propAt(x,y,i%2?'pillar':'stand')}
  for(const[x,y]of[[30,6],[50,6],[30,16],[50,16]])propAt(x,y,'brazier');
 }
 // portals
 const portal=(pid,p,to,arrival,label)=>{setTerrainTile58(m,p.x,p.y,TT.PORTAL);state.branchPortals105.push({id:pid,kind:'branch',...p,to,arrival,label})};
 portal('up',up,level===1?`main:${def.parent}`:`mirror:${level-1}`,level===1?'mirror':'down',level===1?`만루 ${def.parent}층으로`:`${def.name} ${level-1}층으로`);
 if(down)portal('down',down,`mirror:${level+1}`,'up',`${def.name} ${level+1}층`);
 Object.assign(state.player,up);state.fixedStart={...up};state.fixedExit=down||bossAt;state.stairs={...state.fixedExit};
 // reachability counting each ferry track as walkable (a ferry always comes back).
 const passable=(x,y)=>{const t=m[y]?.[x];return t!=null&&(tracks.has(k(x,y))||(!tileBlocks(t)&&![TT.WATER,TT.VOID,TT.LAVA,TT.MERCURY].includes(t)))};
 const reach=new Set([k(up.x,up.y)]),queue=[up];for(let i=0;i<queue.length;i++){const p=queue[i];for(const[dx,dy]of DIRS4){const x=p.x+dx,y=p.y+dy,kk=k(x,y);if(reach.has(kk)||!passable(x,y))continue;reach.add(kk);queue.push({x,y})}}
 for(const r of rooms)if(!reach.has(k(r.cx,r.cy))&&!tileBlocks(m[r.cy][r.cx]))throw Error('Mirror tower room disconnected '+r.cx+','+r.cy);
 for(const p of state.branchPortals105)if(!reach.has(k(p.x,p.y)))throw Error('Mirror tower portal unreachable');
 if(bossAt&&!reach.has(k(bossAt.x,bossAt.y)))throw Error('Mirror tower arena unreachable');
 // population
 const spawn=(name,p)=>{const mon=spawnNamed(name,p,{placementMode:'exact',provenance:'subbranch-random-v3',legendDungeon47:'mirror_blade'});if(!mon)throw Error('Mirror tower spawn rejected '+name);mon.branch105='mirror';return mon};
 const freeCells=r=>{const cells=[];for(let y=r.y+1;y<r.y+r.h-1;y++)for(let x=r.x+1;x<r.x+r.w-1;x++)if(m[y][x]===TT.FLOOR&&reach.has(k(x,y))&&Math.hypot(x-up.x,y-up.y)>6&&(!down||Math.hypot(x-down.x,y-down.y)>3)&&(!bossAt||Math.hypot(x-bossAt.x,y-bossAt.y)>5))cells.push({x,y});return cells};
 const pool=['파편 망령','거울 시녀','반영 검객'];
 rooms.forEach((r,i)=>{if(r.w<9)return;const cells=freeCells(r),per=r.w>40?6:r.w>=25?3:2;for(let n=0;n<per&&cells.length;n++)spawn(pool[(i+n)%pool.length],cells.splice(rand(0,cells.length-1),1)[0])});
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
