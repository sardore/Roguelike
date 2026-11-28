/* ===== 가시숲 (thorn wood): a dense forest of thorn trees, cut by a web of trails, rotten cabins and clearings =====
   The forest is real trees, not a wall texture: every non-trail cell is TT.WALL (the forest floor), and a list of tree
   sprites (T.forest) is planted on those cells, low understory along the trails and tall trees behind them, exactly the way
   the 산채 2층 pines stand along its paths: the first two rows of forest beside a trail are tree tiles (movement blocked, sight
   passes between them) and each carries exactly one sprite; deeper forest is dense wall that stops the view. The look changes by zone (thorn / rot / fungus / web / blood): thornZoneAt.
   The way on is a long switchback of five bands joined at alternating ends, with a stream and plank bridges across it.
   Between the bands runs a tangle of narrow trails: connectors (most plugged by thorn bushes, green ones cut down with a few
   blows, red ones stab whoever comes near), side trails to clearings and cabins, loops, and cabins with a rear door and a back
   path. Floors 2 and 3 use the same generator for now. */
const THORN_W=121,THORN_H=129,THORN_SIZE=Object.freeze([THORN_W,THORN_H]);
const THORN_ROSTER=Object.freeze([['객잔 쥐',7],['독꽃',4],['독거미',4]]);
// 0 thorn, 1 rot, 2 fungus, 3 web, 4 blood: big soft regions; the start is always the thorn zone
function thornZoneAt(x,y,T){
 if(T.up&&Math.hypot(x-T.up.x,y-T.up.y)<26)return 0;
 const a=thornNoise(x,y,40,T.zoneSeed),b=thornNoise(x,y,54,T.zoneSeed+11);
 if(a<.30)return 1;if(a<.45&&b>.5)return 3;if(a>.76)return 4;if(b<.32)return 2;return 0;
}
function buildThornwood(level){
 const ter=state.branchTerrain105,m=state.map,def=BRANCH_DEFS105.thorn,W=COLS,H=ROWS;
 if(W!==THORN_W||H!==THORN_H)throw Error('Thornwood map size');
 state.keyPlan96=null;state.floor2Choice63=null;state.generationInProgress57=true;state.rafts=[];
 const rnd=()=>globalThis.__MANRU_RANDOM57__(),ri=(a,b)=>Math.floor(rnd()*(b-a+1))+a,pick=list=>list[ri(0,list.length-1)],clampi=(v,a,b)=>Math.max(a,Math.min(b,v));
 const T=ter.thorn105={version:2,zoneSeed:ri(1,9999),up:null,bushes:{},bridges:{},cabins:[],clearings:[],plugs:[],backPaths:[],forest:[],props:{},deco:{},lights:[],shortcuts:[]};
 // a tree, a bush or a piece of furniture is an overlay that needs ground under it, like the mountain builder does
 const put=(x,y,tile,s)=>{if(x<1||y<1||x>=W-1||y>=H-1)return false;if(terrainLayerCatalog58().overlays.has(tile)&&!terrainSurface58(terrainBaseTile58(x,y)))setTerrainTile58(m,x,y,TT.FLOOR);setTerrainTile58(m,x,y,tile);ter.surfaces[k(x,y)]=s;delete ter.props[k(x,y)];return true};
 const isWall=(x,y)=>m[y]?.[x]===TT.WALL;
 for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++)ter.surfaces[k(x,y)]='thicket';
 // ---- the stream: a winding two-cell channel from the north edge to the south edge
 const sx=Math.round(W*.56)+ri(-4,4),water=new Set(),streamX=y=>sx+Math.round(3*Math.sin(y*.09)+2*Math.sin(y*.23+1));
 for(let y=1;y<H-1;y++)for(let dx=0;dx<2;dx++){const x=streamX(y)+dx;put(x,y,TT.WATER,'stream');water.add(k(x,y))}
 const nearStream=(x,y)=>Math.abs(x-streamX(y))<=6;
 // ---- carving: discs of floor; where a trail crosses the stream the floor becomes a rotten plank bridge
 const route=new Set(),floor=new Set(),reserved=new Set();
 const disc=(cx,cy,r,s,core=false)=>{for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(dx*dx+dy*dy>r*r+r*.7)continue;const x=cx+dx,y=cy+dy;if(x<2||y<2||x>=W-2||y>=H-2)continue;const key=k(x,y);if(reserved.has(key))continue;const bridge=water.has(key);if(!put(x,y,TT.FLOOR,bridge?'rotPlank':s))continue;if(bridge)T.bridges[key]=true;floor.add(key);if(core&&dx*dx+dy*dy<=2)route.add(key)}};
 const line4=(a,b,r,s,core)=>{let x=a.x,y=a.y;disc(x,y,r,s,core);while(x!==b.x||y!==b.y){if(Math.abs(b.x-x)>=Math.abs(b.y-y)&&x!==b.x)x+=Math.sign(b.x-x);else if(y!==b.y)y+=Math.sign(b.y-y);else x+=Math.sign(b.x-x);disc(x,y,r,s,core)}};
 // a winding trail: samples along a->b pushed sideways by a sine and some noise, joined 4-connected so it can always be walked
 const trail=(a,b,o={})=>{const len=Math.max(1,Math.hypot(b.x-a.x,b.y-a.y)),n=Math.max(3,Math.round(len/4)),px=-(b.y-a.y)/len,py=(b.x-a.x)/len,ph=rnd()*6,amp=o.amp??3,kk=o.k??1.5,pts=[];
  for(let i=0;i<=n;i++){const t=i/n,env=Math.sin(t*Math.PI),off=(Math.sin(t*Math.PI*kk*2+ph)*amp+(rnd()-.5)*1.4)*env;pts.push({x:clampi(Math.round(a.x+(b.x-a.x)*t+px*off),3,W-4),y:clampi(Math.round(a.y+(b.y-a.y)*t+py*off),3,H-4)})}
  for(let i=1;i<pts.length;i++)line4(pts[i-1],pts[i],o.r??0,o.s??'thornTrail',o.core!==false);return pts};
 // ---- the maze: a randomized depth-first maze on a coarse grid (long winding corridors, many dead ends), then a few extra openings
 //      that make loops; the exit is the cell farthest from the entrance, so the way on is long and never a straight line
 const CS=16,cols=7,rows=7,gx=i=>10+i*CS,gy=j=>12+j*CS,cid=(i,j)=>j*cols+i,center=id=>({x:gx(id%cols),y:gy((id/cols)|0)});
 const tree=[],visited=new Set([cid(0,rows-1)]),stack=[[0,rows-1]],adj=Array.from({length:cols*rows},()=>[]),DIR4=[[1,0],[-1,0],[0,1],[0,-1]];
 while(stack.length){const[ci,cj]=stack[stack.length-1],nbs=DIR4.map(([dx,dy])=>[ci+dx,cj+dy]).filter(([a,b])=>a>=0&&b>=0&&a<cols&&b<rows&&!visited.has(cid(a,b)));
  if(!nbs.length){stack.pop();continue}const[a,b]=pick(nbs);visited.add(cid(a,b));tree.push([cid(ci,cj),cid(a,b)]);adj[cid(ci,cj)].push(cid(a,b));adj[cid(a,b)].push(cid(ci,cj));stack.push([a,b])}
 const inTree=new Set(tree.map(([a,b])=>a<b?a+'-'+b:b+'-'+a)),extras=[];
 for(let j=0;j<rows;j++)for(let i=0;i<cols;i++)for(const[dx,dy]of[[1,0],[0,1]]){const a=cid(i,j),bi=i+dx,bj=j+dy;if(bi>=cols||bj>=rows)continue;const b=cid(bi,bj),key=a<b?a+'-'+b:b+'-'+a;if(!inTree.has(key))extras.push([a,b])}
 for(let i=extras.length-1;i>0;i--){const j2=ri(0,i);[extras[i],extras[j2]]=[extras[j2],extras[i]]}
 const loops=extras.slice(0,Math.max(6,Math.round(extras.length*.3)));
 const startId=cid(0,rows-1),dist=new Map([[startId,0]]),bq=[startId];for(let q=0;q<bq.length;q++)for(const n of adj[bq[q]])if(!dist.has(n)){dist.set(n,dist.get(bq[q])+1);bq.push(n)}
 let exitId=startId,far=-1;for(const[id,d]of dist)if(d>far||d===far&&rnd()<.5){far=d;exitId=id}
 const up=center(startId),down=center(exitId);T.up={...up};
 // junction plazas, then the passages between cells (each one winding, some narrow and some wide)
 for(let id=0;id<cols*rows;id++){const c=center(id);disc(c.x,c.y,ri(1,2),rnd()<.3?'thornMoss':'thornTrail',true)}
 disc(up.x,up.y,2,'thornMoss',true);disc(down.x,down.y,2,'thornMoss',true);
 for(const[a,b]of tree)trail(center(a),center(b),{amp:2.4,k:1,r:ri(0,1)});
 const mainFloor=new Set(floor);
 const nearestFloor=(p,minD=0,avoid=null)=>{let best=null,bd=1e9;for(const key of floor){const[x,y]=key.split(',').map(Number),d=Math.hypot(x-p.x,y-p.y);if(d<minD||d>=bd)continue;if(avoid&&Math.hypot(x-avoid.x,y-avoid.y)<10)continue;if(reserved.has(key)||m[y][x]!==TT.FLOOR||T.bridges[key])continue;bd=d;best={x,y}}return best};
 // extra openings: loops, most of them plugged with thorn bushes (green ones are cut down, red ones stab)
 for(const[a,b]of loops){const pts=trail(center(a),center(b),{amp:2.4,k:1,r:0});if(rnd()<.35)continue;
  const mid=Math.floor(pts.length/2),red=rnd()<.42,cells=[];
  for(let q=mid-1;q<=mid+1;q++){const p=pts[clampi(q,0,pts.length-1)];if(m[p.y][p.x]===TT.FLOOR&&!T.bridges[k(p.x,p.y)]&&!cells.some(z=>z.x===p.x&&z.y===p.y))cells.push(p)}
  for(const p of cells){put(p.x,p.y,TT.HEDGE,'thornTrail');T.bushes[k(p.x,p.y)]=red?'red':'green';floor.delete(k(p.x,p.y))}
  if(cells.length){T.plugs.push({x:cells[0].x,y:cells[0].y,red});T.shortcuts.push({x:cells[0].x,y:cells[0].y,red})}}
 const loot=[],roomsOut=[],nodes=[];
 const freeBox=(x0,y0,w,h,mg=2)=>{for(let y=y0-mg;y<y0+h+mg;y++)for(let x=x0-mg;x<x0+w+mg;x++)if(x<3||y<3||x>=W-3||y>=H-3||!isWall(x,y)||reserved.has(k(x,y)))return false;return true};
 const buildCabin=(cx,cy)=>{
  const w=9,h=6,x0=cx-4,y0=cy-3;if(!freeBox(x0,y0,w,h,2))return false;
  const target=nearestFloor({x:cx,y:cy});if(!target)return false;const frontSouth=target.y>=cy;
  for(let yy=y0;yy<y0+h;yy++)for(let xx=x0;xx<x0+w;xx++){const edge=xx===x0||yy===y0||xx===x0+w-1||yy===y0+h-1;put(xx,yy,edge?TT.WALL:TT.FLOOR,edge?'rotWall':'rotPlank');reserved.add(k(xx,yy));if(!edge)floor.add(k(xx,yy))}
  const doorY=frontSouth?y0+h-1:y0,out=frontSouth?1:-1,doorX=cx;put(doorX,doorY,TT.DOOR,'rotPlank');
  for(let s=1;s<=2;s++)for(let dx=-1;dx<=1;dx++){put(doorX+dx,doorY+out*s,TT.FLOOR,'rotPlank');floor.add(k(doorX+dx,doorY+out*s))}
  trail({x:doorX,y:doorY+out*3},target,{amp:2,k:1,r:0});
  // the rear door and a back path: it leads on to another trail (a loop through the house) or ends in a small mossy nook
  const bx0=cx+ri(-2,2),by0=frontSouth?y0:y0+h-1,back=-out;put(bx0,by0,TT.DOOR,'rotPlank');
  const t2=nearestFloor({x:bx0,y:by0+back*4},6,target);
  if(t2&&Math.hypot(t2.x-bx0,t2.y-by0)<26){trail({x:bx0,y:by0+back},t2,{amp:2,k:1,r:0});T.backPaths.push({x:bx0,y:by0,loop:true})}
  else{trail({x:bx0,y:by0+back},{x:bx0+ri(-3,3),y:by0+back*5},{amp:1,k:1,r:0});disc(bx0,by0+back*6,1,'thornMoss',true);T.backPaths.push({x:bx0,y:by0,loop:false});loot.push({x:bx0,y:by0+back*6})}
  // a lean-to shed built onto one side
  const sd=rnd()<.5?-1:1,sw=5,sh=4,sx0=sd>0?x0+w-1:x0-sw+1,sy0=y0+1;
  if(freeBox(sd>0?x0+w:x0-sw+1,sy0,sw-1,sh,1)){for(let yy=sy0;yy<sy0+sh;yy++)for(let xx=sx0;xx<sx0+sw;xx++){const shared=sd>0?xx===x0+w-1:xx===x0;if(shared)continue;const edge=xx===sx0||xx===sx0+sw-1||yy===sy0||yy===sy0+sh-1;put(xx,yy,edge?TT.WALL:TT.FLOOR,edge?'rotWall':'rotPlank');reserved.add(k(xx,yy));if(!edge)floor.add(k(xx,yy))}
   put(sd>0?x0+w-1:x0,sy0+1,TT.FLOOR,'rotPlank');loot.push({x:sd>0?sx0+2:sx0+sw-3,y:sy0+1})}
  const room={x:x0,y:y0,w,h,cx,cy:y0+(h>>1)};state.rooms.push(room);T.cabins.push({...room,door:{x:doorX,y:doorY}});roomsOut.push(room);
  loot.push({x:room.cx-1,y:room.cy},{x:room.cx+2,y:room.cy+(rnd()<.5?-1:1)});return true};
 const buildClearing=(cx,cy)=>{if(!freeBox(cx-3,cy-3,7,7,2))return false;const target=nearestFloor({x:cx,y:cy});if(!target)return false;
  disc(cx,cy,3,'thornMoss',true);for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++)reserved.add(k(cx+dx,cy+dy));
  trail({x:cx,y:cy},target,{amp:3,k:1,r:ri(0,1)});T.clearings.push({x:cx,y:cy});state.rooms.push({x:cx-3,y:cy-3,w:7,h:7,cx,cy});loot.push({x:cx,y:cy});nodes.push({x:cx,y:cy});return true};
 // dead ends: a bigger mossy plaza with something to find at the end of the corridor
 for(let id=0;id<cols*rows;id++){if(id===startId||id===exitId||adj[id].length!==1)continue;const c=center(id);if(nearStream(c.x,c.y))continue;disc(c.x,c.y,2,'thornMoss',true);T.clearings.push({x:c.x,y:c.y,deadEnd:true});loot.push({x:c.x,y:c.y})}
 // cabins and clearings sit in the walls between corridors, each tied to the maze by a short winding side trail
 for(let j=0;j<rows-1;j++)for(let i=0;i<cols-1;i++){const x=gx(i)+CS/2+ri(-1,1),y=gy(j)+CS/2+ri(-1,1);if(nearStream(x,y))continue;const r=rnd();if(r<.16)buildCabin(x,y);else if(r<.5)buildClearing(x,y)}
 for(let tries=0;tries<60&&T.cabins.length<4;tries++){const i=ri(0,cols-2),j=ri(0,rows-2),x=gx(i)+CS/2,y=gy(j)+CS/2;if(!nearStream(x,y))buildCabin(x,y)}
 // loops between neighbouring clearings
 for(let i=0;i<nodes.length;i++)for(let j2=i+1;j2<nodes.length;j2++){const a=nodes[i],b=nodes[j2];if(Math.hypot(a.x-b.x,a.y-b.y)<24&&rnd()<.2)trail(a,b,{amp:3,k:1,r:0})}
 // ---- zone-aware dressing: thorn bushes along the trails (never on the lane that carries the way on), the red ones likelier in the blood zone
 const zoneAt=(x,y)=>thornZoneAt(x,y,T),near4=(x,y,t)=>DIRS4.some(([dx,dy])=>m[y+dy]?.[x+dx]===t);
 for(const key of floor){if(route.has(key))continue;const[x,y]=key.split(',').map(Number);if(m[y][x]!==TT.FLOOR||T.bridges[key]||!near4(x,y,TT.WALL)||ter.surfaces[key]==='rotPlank')continue;
  const z=zoneAt(x,y),r=rnd(),redP=z===4?.05:.014,greenP=.045;if(r<greenP){put(x,y,TT.HEDGE,ter.surfaces[key]);T.bushes[key]='green'}else if(r<greenP+redP){put(x,y,TT.HEDGE,ter.surfaces[key]);T.bushes[key]='red'}}
 // ---- furniture, lanterns and clutter: blocking pieces are TT.STONE_PILLAR cells named in T.props, soft clutter lives in T.deco
 const LAMPS={paper:{c:'#c9a0ff',r:4,p:.26},firefly:{c:'#9be07a',r:3.4,p:.22},skull:{c:'#ffb15a',r:3.6,p:.24},iron:{c:'#ff8a4a',r:4,p:.26}};
 const prop=(x,y,kind,lamp,force=false)=>{const key=k(x,y);if(m[y]?.[x]!==TT.FLOOR||T.bridges[key]||T.props[key]||T.bushes[key]||(!force&&route.has(key)))return false;put(x,y,TT.STONE_PILLAR,ter.surfaces[key]);T.props[key]=kind;if(lamp)T.lights.push({x,y,color:LAMPS[lamp].c,r:LAMPS[lamp].r,power:LAMPS[lamp].p});return true};
 const furniture=(x,y,tile,force=false)=>{const key=k(x,y);if(m[y]?.[x]!==TT.FLOOR||T.bridges[key]||T.props[key]||T.bushes[key]||(!force&&route.has(key)))return false;put(x,y,tile,ter.surfaces[key]);return true};
 const lampKind=()=>{const r=rnd();return r<.35?['lanternPaper','paper']:r<.60?['lanternFirefly','firefly']:r<.75?['lanternSkull','skull']:['lanternIron','iron']};
 const edge=[...floor].map(key=>{const[x,y]=key.split(',').map(Number);return{x,y}}).filter(p=>m[p.y][p.x]===TT.FLOOR&&!route.has(k(p.x,p.y))&&!T.bridges[k(p.x,p.y)]&&near4(p.x,p.y,TT.WALL)&&ter.surfaces[k(p.x,p.y)]!=='rotPlank');
 for(let i=edge.length-1;i>0;i--){const j=ri(0,i);[edge[i],edge[j]]=[edge[j],edge[i]]}
 const placed=[],spaced=(p,d)=>!placed.some(q=>Math.max(Math.abs(q.x-p.x),Math.abs(q.y-p.y))<d);
 const lampAt=(x,y,force)=>{const[kind,lamp]=lampKind();if(prop(x,y,kind,lamp,force)){placed.push({x,y,lamp:true});return true}return false};
 for(const q of [up,down])for(const d of[[2,-2],[2,2],[-2,-2],[-2,2],[3,-1],[3,1]]){if(lampAt(q.x+d[0],q.y+d[1],false))break}
 for(const c of T.cabins){const out=c.door.y>c.cy?1:-1;for(const sx of[-1,1])lampAt(c.door.x+sx,c.door.y+out,true)}
 for(const key of Object.keys(T.bridges)){const[x,y]=key.split(',').map(Number);if(rnd()<.35){const c=edge.find(e=>Math.abs(e.x-x)<=3&&Math.abs(e.y-y)<=4&&spaced(e,7));if(c)lampAt(c.x,c.y,false)}}
 let lamps=0;for(const p of edge){if(lamps>46)break;if(spaced(p,10)&&lampAt(p.x,p.y,false))lamps++}
 const CLUTTER={0:[['stump',4],['log',3],['signpost',2],['grave',3],['scarecrow',1],['cage',2]],1:[['stump',5],['log',5],['barrel',3],['cart',2],['grave',3],['cage',1]],2:[['stump',5],['log',3],['barrel',2]],3:[['cocoon',6],['hive',4],['stump',2],['cage',2],['grave',2]],4:[['grave',4],['cage',3],['scarecrow',2],['cocoon',2],['stump',2],['log',2]]};
 for(const p of edge){if(placed.length>120)break;if(m[p.y][p.x]!==TT.FLOOR||!spaced(p,4)||rnd()>.22)continue;const bag=(CLUTTER[zoneAt(p.x,p.y)]||CLUTTER[0]).flatMap(([n,w])=>Array(w).fill(n));if(prop(p.x,p.y,pick(bag)))placed.push(p)}
 for(const c of T.clearings){
  if(rnd()<.5)prop(c.x+2,c.y-2,'well',null);else T.deco[k(c.x-2,c.y+1)]='firepit';
  for(const d of[[-2,-2],[3,1],[-3,0],[2,2]])if(rnd()<.6)prop(c.x+d[0],c.y+d[1],rnd()<.7?'stump':'log',null);
 }
 for(const c of T.cabins){
  const out=c.door.y>c.cy?1:-1,rowNext=c.door.y-out,pieces=['bed','table','shelf','cauldron'].sort(()=>rnd()-.5),spots=[];
  for(let yy=c.y+1;yy<c.y+c.h-1;yy++)for(let xx=c.x+1;xx<c.x+c.w-1;xx++){if(Math.abs(xx-c.door.x)<=1&&(yy===rowNext||Math.abs(yy-c.door.y)<=2))continue;if(xx===c.door.x)continue;if(near4(xx,yy,TT.WALL))spots.push({x:xx,y:yy})}
  spots.sort(()=>rnd()-.5);for(const kind of pieces){const sp=spots.find(q=>placed.every(o=>Math.abs(o.x-q.x)+Math.abs(o.y-q.y)>1));if(!sp)break;const ok=kind==='shelf'?furniture(sp.x,sp.y,TT.RACK,true):prop(sp.x,sp.y,kind,null,true);if(ok){placed.push(sp);if(kind==='cauldron')T.lights.push({x:sp.x,y:sp.y,color:'#86e07a',r:3,power:.2})}}
 }
const DECO={0:[['flowers',5],['ferns',4],['mushrooms',2]],1:[['puddle',4],['mushrooms',3],['bones',2],['ferns',3]],2:[['mushrooms',9],['ferns',3]],3:[['web',6],['bones',3],['mushrooms',2]],4:[['bones',4],['flowers',3],['puddle',2],['web',1]]};
 // clutter comes in patches, not sprinkled on every cell: a patch noise decides where, a low base chance keeps a few strays
 for(const key of floor){const[x,y]=key.split(',').map(Number);if(m[y][x]!==TT.FLOOR||T.bridges[key]||T.deco[key]||ter.surfaces[key]==='rotPlank')continue;
  const patch=thornNoise(x*1.0,y*1.0,9,T.zoneSeed+5)>.74;if(rnd()>(patch?.3:.012))continue;
  const kind=pick((DECO[zoneAt(x,y)]||DECO[0]).flatMap(([n,w])=>Array(w).fill(n)));if(kind==='web'&&!near4(x,y,TT.WALL))continue;T.deco[key]=kind;if(kind==='mushrooms'&&T.lights.length<110&&rnd()<.3)T.lights.push({x,y,color:'#7fd6ff',r:2.6,power:.14})}
// ---- the forest: tall trees stand only where their crown (the rectangle above the trunk) covers nothing but forest, so a trail, a
 //      cabin or a lantern is never hidden; low undergrowth sprites hug the trails instead. Sizes, shapes and mirroring vary widely.
 const depth=new Int8Array(W*H).fill(-1),queue=[];
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const sf=ter.surfaces[k(x,y)];if(m[y][x]!==TT.WALL||sf==='rotWall'){depth[y*W+x]=0;queue.push(y*W+x)}}
 for(let i=0;i<queue.length;i++){const id=queue[i],x=id%W,y=(id/W)|0,d=depth[id];if(d>=8)continue;for(const[dx,dy]of DIRS4){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;const nid=ny*W+nx;if(depth[nid]===-1){depth[nid]=d+1;queue.push(nid)}}}
 const plain=(x,y)=>x>0&&y>0&&x<W-1&&y<H-1&&(m[y][x]===TT.WALL||m[y][x]===TT.GARDEN_TREE)&&ter.surfaces[k(x,y)]!=='rotWall';
 const TREE_BOX=[[1,1.2],[2,3],[2.75,4.1],[4,6]];
 const crownClear=(tx,ty,tw,ch)=>{for(let yy=Math.floor(ty-ch);yy<=Math.floor(ty-.15);yy++)for(let xx=Math.floor(tx-tw/2);xx<=Math.floor(tx+tw/2);xx++)if(!plain(xx,yy))return false;return true};
 const cellsOrder=[];for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++)if(m[y][x]===TT.WALL&&ter.surfaces[k(x,y)]!=='rotWall'&&depth[y*W+x]>=1&&depth[y*W+x]<=7)cellsOrder.push({x,y,d:depth[y*W+x]});
 for(let i=cellsOrder.length-1;i>0;i--){const j=ri(0,i);[cellsOrder[i],cellsOrder[j]]=[cellsOrder[j],cellsOrder[i]]}
 // the first four rows of forest beside every trail are real tree tiles (movement blocked, sight passes between them), like the pines
 // of 산채 2층; only the forest further in is dense wall that stops the view
 for(const c of cellsOrder)if(c.d<=4&&c.x>2&&c.y>2&&c.x<W-3&&c.y<H-3)put(c.x,c.y,TT.GARDEN_TREE,'thicket');
 const reg=tree=>T.forest.push(tree);
 const mk=(cx,cy,cls,v,sc,jit)=>({x:+(cx+.5+(rnd()-.5)*jit).toFixed(2),y:+(cy+.92+(rnd()-.5)*.12).toFixed(2),c:cls,t:zoneAt(cx,cy),v,s:+sc.toFixed(2),f:rnd()<.5?1:0});
 const open4=(x,y)=>!plain(x,y);
 for(const c of cellsOrder){if(m[c.y][c.x]!==TT.GARDEN_TREE)continue;
  // one sprite per tree tile: low things next to the trail, young and mid trees behind, tall trees deepest, and plenty of low things mixed in
  // everywhere so no row is the same tree repeated; a tree only grows where its crown falls on forest, never on a trail, cabin or lantern
  const low=()=>{if(rnd()<.16)reg(mk(c.x,c.y,0,ri(0,9),.85+rnd()*.35,.3))},tryTree=(cls,sc,jit)=>{const t=mk(c.x,c.y,cls,ri(0,7),sc,jit),[tw,th]=TREE_BOX[cls];if(!crownClear(t.x,t.y,tw*.9*t.s,th*.72*t.s))return false;reg(t);return true};
  const r=rnd();
  if(c.d===1){if(open4(c.x,c.y-1)||r>.35||!tryTree(1,.5+rnd()*.14,.3))low()}
  else if(c.d===2){if(r>.5||!tryTree(1,.75+rnd()*.3,.4))low()}
  else{if(r<.3?!tryTree(2,.8+rnd()*.25,.4):r<.6?!tryTree(1,.9+rnd()*.25,.4):true)low()}
 }
 T.forest.sort((a,b)=>a.y-b.y||a.x-b.x);
 // ---- portals and arrival
 const portal=(id,p,to,arrival,label)=>{setTerrainTile58(m,p.x,p.y,TT.PORTAL);ter.surfaces[k(p.x,p.y)]='thornMoss';state.branchPortals105.push({id,kind:'branch',...p,to,arrival,label})};
 portal('up',up,level===1?`main:${def.parent}`:`thorn:${level-1}`,level===1?'thorn':'down',level===1?`만루 ${def.parent}층으로`:`${def.name} ${level-1}층으로`);
 if(level<def.count)portal('down',down,`thorn:${level+1}`,'up',`${def.name} ${level+1}층`);
 Object.assign(state.player,up);state.fixedStart={...up};state.fixedExit={...down};state.stairs={...down};
 // ---- the way on must be walkable without cutting a single bush, and every cabin must be reachable
 const reach=ReachabilityService.playerSearch(up,{}).cells;
 if(!reach.has(k(down.x,down.y)))throw Error('Thornwood: the way on is cut');
 for(const r of roomsOut)if(!reach.has(k(r.cx,r.cy)))throw Error('Thornwood: a cabin is sealed');
 // ---- loot and the first floor's gentle population
 const portalNear=p=>Math.hypot(p.x-up.x,p.y-up.y)<8||Math.hypot(p.x-down.x,p.y-down.y)<5;
 for(const p of loot){if(!reach.has(k(p.x,p.y))||m[p.y][p.x]!==TT.FLOOR)continue;if(rnd()<.55)dropFloorLoot(p);else PlacementService.placeItem({...clone(naturalFoodPick()),count:ri(1,2)},p,{requireReachable:false})}
 const open=[...floor].map(key=>{const[x,y]=key.split(',').map(Number);return{x,y}}).filter(p=>m[p.y][p.x]===TT.FLOOR&&!T.bridges[k(p.x,p.y)]&&reach.has(k(p.x,p.y))&&!portalNear(p));
 const spawn=(name,p)=>{const mon=spawnNamed(name,p,{placementMode:'exact',provenance:'subbranch-random-v3'});if(mon)mon.branch105='thorn';return mon};
 for(const[name,count]of THORN_ROSTER)for(let n=0;n<count&&open.length;n++)spawn(name,open.splice(ri(0,open.length-1),1)[0]);
 state.generationInProgress57=false;
}
