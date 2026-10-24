/* r59 canonical RNG: native randomness at runtime, floor-local deterministic stream during generation. */
const RngService=(()=>{
  let active=null;
  const hash=text=>{let h=2166136261>>>0;for(let i=0;i<String(text).length;i++){h^=String(text).charCodeAt(i);h=Math.imul(h,16777619)>>>0}h^=h>>>16;h=Math.imul(h,2246822507)>>>0;h^=h>>>13;return(h>>>0)||0x6d2b79f5};
  const next=()=>{let x=active.state>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;active.state=x>>>0;active.calls++;return(active.state>>>0)/4294967296};
  return Object.freeze({
    begin(seed){const text=String(seed);active={seed:text,state:hash(text),calls:0};return{text,state:active.state}},
    end(){const a=active?{seed:active.seed,calls:active.calls,state:active.state}:null;active=null;return a},
    random(){return active?next():RngService.runtime()},
    state(){return active?{seed:active.seed,calls:active.calls,state:active.state}:null},
    shop(seed){let a=2166136261;for(const c of String(seed))a=Math.imul(a^c.charCodeAt(0),16777619);return()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),a|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}},
legendary(seed){let a=seed>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}},
    nativeRuntime(){return Math.random},
    runtime(){return Math.random()}
  });
})();
// One movement contract: all eight adjacent destinations are legal, including corner diagonals.
// Audit assumptions (revealed/ unlocked terrain) are supplied as a tile resolver, never a new movement rule.
const ReachabilityService=Object.freeze({
architectureRouteMetrics({K1020,inside1020,pass1020}){if(!state)return null;const start={x:state.player.x,y:state.player.y},goal={x:state.stairs.x,y:state.stairs.y},q=[start],dist=new Map([[K1020(start.x,start.y),0]]);for(let i=0;i<q.length;i++){const a=q[i],d=dist.get(K1020(a.x,a.y));if(a.x===goal.x&&a.y===goal.y)return{floor:state.floor,path:d,manhattan:Math.abs(start.x-goal.x)+Math.abs(start.y-goal.y),ratio:d/Math.max(1,Math.abs(start.x-goal.x)+Math.abs(start.y-goal.y))};for(const[dx,dy]of DIRS4){const x=a.x+dx,y=a.y+dy,k0=K1020(x,y);if(!inside1020(x,y)||dist.has(k0)||!pass1020(state.map[y][x]))continue;dist.set(k0,d+1);q.push({x,y})}}return{floor:state.floor,path:null,manhattan:null,ratio:null}},

// UPDATE01 graph profiles: transient query data; no persistent topology cache.
soundCosts(source,budget){
 const costs=new Map(),buckets=Array.from({length:Math.floor(budget)+1},()=>[]),blocked=new Set();
 for(const f of state.tempFields||[])if(['smoke','steam'].includes(f.kind)&&f.ttl>0)for(const c of tempFieldCells57(f))blocked.add(k(c.x,c.y));
 const costAt=(x,y)=>{const t=state.map?.[y]?.[x];if(t==null||blocked.has(k(x,y)))return Infinity;if(t===TT.OPEN_DOOR)return 3;if(t===TT.DOOR||t===TT.LOCKED_GATE)return 6;if([TT.BAMBOO,TT.SCREEN,TT.HEDGE,TT.TABLE,TT.CRATE,TT.JAR].includes(t))return 4;if(tileBlocksSight(t)||tileBlocks(t))return Infinity;return 1};
 if(!Number.isFinite(costAt(source.x,source.y)))return costs;
 costs.set(k(source.x,source.y),0);buckets[0].push(source);
 for(let cost=0;cost<buckets.length;cost++)for(const a of buckets[cost]){
  if(costs.get(k(a.x,a.y))!==cost)continue;
  for(const[dx,dy]of DIRS4){const x=a.x+dx,y=a.y+dy,id=k(x,y),next=cost+costAt(x,y);if(next>budget||next>=(costs.get(id)??Infinity))continue;costs.set(id,next);buckets[next].push({x,y})}
 }return costs;
},
monsterRoutes(mon,{target=null,adjacent=false,origin=null,radius=Infinity,ignoreOccupants=false}={}){
 const ignore=ignoreOccupants?new Set([state.player,...state.monsters]):null;
 const first={x:mon.x,y:mon.y,cost:0,first:null},cells=new Map([[k(mon.x,mon.y),first]]),queue=[first];let goal=null;
 for(let i=0;i<queue.length;i++){const a=queue[i];if(target&&(adjacent?entityDistanceAt(mon,a.x,a.y,target)<=1:a.x===target.x&&a.y===target.y)){goal=a;break}
  for(const[dx,dy]of DIRS4){const x=a.x+dx,y=a.y+dy,id=k(x,y);if(cells.has(id)||(origin&&Math.max(Math.abs(x-origin.x),Math.abs(y-origin.y))>radius)||!PlacementService.monsterCanStand(mon,x,y,null,{ignore}))continue;const q={x,y,cost:a.cost+1,first:a.first||{x,y}};cells.set(id,q);queue.push(q)}
 }return{cells,goal};
},
retreatStep(mon,target){
 if(monsterMovementLocked57(mon))return null;const distance=entityDistance57(mon,target);let best=null,bestScore=-Infinity;
 for(const[dx,dy]of DIRS8){const x=mon.x+dx,y=mon.y+dy;if(!PlacementService.monsterCanStand(mon,x,y))continue;const d=entityDistanceAt(mon,x,y,target);if(d<=distance)continue;
  const options=DIRS8.reduce((n,[sx,sy])=>n+Number(PlacementService.monsterCanStand(mon,x+sx,y+sy)),0),shoot=entityCombatLineCheckR({...mon,x,y},target,{range:mon.range||6,units:false}).ok;
  const score=d*4+options*.3+(shoot?2:0);if(score>bestScore){bestScore=score;best={x,y}}
 }return best;
},
flankTarget(mon,target,reserved){
 const routes=ReachabilityService.monsterRoutes(mon).cells,facing=target.facing||{x:0,y:1};let best=null,bestScore=-Infinity;
 for(const[dx,dy]of DIRS8){const x=target.x+dx,y=target.y+dy,id=k(x,y),route=routes.get(id);if(!route||reserved.has(id)||!PlacementService.monsterCanStand(mon,x,y))continue;
  const front=dx*facing.x+dy*facing.y,score=(front<0?6:front===0?3:0)-route.cost;
  if(score>bestScore){bestScore=score;best={x,y,step:route.first,cost:route.cost}}
 }if(best)reserved.add(k(best.x,best.y));return best;
},
monsterApproach(mon,p,ox,oy){
 if(state.floor>=11)return ReachabilityService.monsterRoutes(mon,{target:p,adjacent:p===state.player||(state.monsters||[]).includes(p)}).goal?.first||null;
 const seen=new Set([k(ox,oy)]),q=[{x:ox,y:oy,first:null}],limit=256;
 let step=null;
 for(let i=0;i<q.length&&i<limit;i++){
  const a=q[i];if(a.first&&entityDistanceAt(mon,a.x,a.y,p)<=1){step=a.first;break}
  const dirs=[...DIRS4].sort((a0,b0)=>entityDistanceAt(mon,a.x+a0[0],a.y+a0[1],p)-entityDistanceAt(mon,a.x+b0[0],a.y+b0[1],p));
  for(const [dx,dy]of dirs){const x=a.x+dx,y=a.y+dy,id=k(x,y);if(seen.has(id)||!PlacementService.monsterCanStand(mon,x,y))continue;seen.add(id);q.push({x,y,first:a.first||{x,y}})}
 }
 if(!step){const opts=DIRS4.map(([dx,dy])=>({x:ox+dx,y:oy+dy})).filter(a=>PlacementService.monsterCanStand(mon,a.x,a.y)&&entityDistanceAt(mon,a.x,a.y,p)<entityDistance57(mon,p)).sort((a,b)=>entityDistanceAt(mon,a.x,a.y,p)-entityDistanceAt(mon,b.x,b.y,p));step=opts[0]}
return step;},

localPlacement({sx,sy,opt,transit,legal}){const q=[{x:sx,y:sy}],seen=new Set([k(sx,sy)]);
  for(let i=0;i<q.length;i++){const a=q[i];for(const[dx,dy]of DIRS8){const x=a.x+dx,y=a.y+dy,key=k(x,y);if(seen.has(key)||!transit(x,y))continue;seen.add(key);if(legal(x,y,!!opt.allowItems))return{x,y};q.push({x,y})}}return null},

requiredExitReach({start,goal,walkable}){const q=[start],seen=new Set([k(start.x,start.y)]);for(let i=0;i<q.length;i++){const p=q[i];if(p.x===goal.x&&p.y===goal.y)return true;for(const[dx,dy]of DIRS4){const x=p.x+dx,y=p.y+dy,kk=k(x,y);if(x<=0||y<=0||x>=COLS-1||y>=ROWS-1||seen.has(kk)||!walkable(state.map[y][x]))continue;seen.add(kk);q.push({x,y})}}return false},
specialFloorWalk({start,goal,can},mode={}){const q=[start],seen=new Set([k(start.x,start.y)]);for(let i=0;i<q.length;i++){const p=q[i];if(p.x===goal.x&&p.y===goal.y)return true;for(const[dx,dy]of DIRS4){const x=p.x+dx,y=p.y+dy,kk=k(x,y);if(seen.has(kk)||!can(x,y,mode))continue;seen.add(kk);q.push({x,y})}}return false},
specialFloorBlink({start,goal,tileAt,can},mode={}){const q=[start],seen=new Set([k(start.x,start.y)]),range=Math.max(2,state.player?.blinkLevel||4);for(let i=0;i<q.length;i++){const p=q[i];if(p.x===goal.x&&p.y===goal.y)return true;for(const[dx,dy]of DIRS4){for(let d=1;d<=range;d++){const x=p.x+dx*d,y=p.y+dy*d;if(x<0||y<0||x>=COLS||y>=ROWS)break;const t=tileAt(x,y,mode);if(blinkHardBlock(t))break;const kk=k(x,y);if(can(x,y,mode)&&!seen.has(kk)){seen.add(kk);q.push({x,y})}}}}return false},
trialGateWalk({start,gate,key85,in85},open){const q=[{x:start.x,y:start.y}],seen=new Set([key85(start.x,start.y)]);for(let i=0;i<q.length;i++){const p=q[i];for(const[dx,dy]of DIRS4){const x=p.x+dx,y=p.y+dy,kk=key85(x,y);if(!in85(x,y)||seen.has(kk))continue;if(x===gate.x&&y===gate.y){if(!open)continue}else if(tileBlocks(state.map[y][x]))continue;seen.add(kk);q.push({x,y})}}return seen},
bossRoomFarthest({cx,K1020,HAZ1020},r,entry){
      const q=[{x:entry.x+(entry.x<cx? -1:1),y:entry.y,d:0}],seen=new Set(),inside=(p)=>p.x>r.x&&p.x<r.x+r.w-1&&p.y>r.y&&p.y<r.y+r.h-1;let best=q[0];
      q[0].x=entry.x<cx?entry.x-1:entry.x+1;seen.add(K1020(q[0].x,q[0].y));
      for(let i=0;i<q.length;i++){const a=q[i];if(a.d>best.d)best=a;for(const[dx,dy]of DIRS4){const p={x:a.x+dx,y:a.y+dy,d:a.d+1},kk=K1020(p.x,p.y);if(!inside(p)||seen.has(kk)||tileBlocks(state.map[p.y][p.x])||HAZ1020().has(state.map[p.y][p.x]))continue;seen.add(kk);q.push(p)}}return{x:best.x,y:best.y,d:best.d}
    },

playerMobility(){
  const authorized=new Set();if(!state?.player)return authorized;
  const sx=state.player.x,sy=state.player.y;if(sx<0||sy<0||sx>=COLS||sy>=ROWS)return authorized;
  const queued=new Set([k(sx,sy)]),q=[{x:sx,y:sy}];authorized.add(k(sx,sy));
  for(let i=0;i<q.length;i++){
    const a=q[i],aTile=state.map?.[a.y]?.[a.x];
    if(i>0&&aTile===TT.PORTAL)continue;
    const add=(x,y)=>{if(x<0||y<0||x>=COLS||y>=ROWS)return;if(!playerMobilityStandable57(x,y))return;const id=k(x,y);authorized.add(id);if(!queued.has(id)){queued.add(id);q.push({x,y})}};
    for(const[dx,dy]of DIRS8)if(ReachabilityService.playerStepAllowed(a,a.x+dx,a.y+dy))add(a.x+dx,a.y+dy);
    const blink=Math.max(0,Math.floor(state.player.blinkLevel||0));
    if(blink>=2)for(const[dx,dy]of DIRS8){for(let d=1;d<=blink;d++){const x=a.x+dx*d,y=a.y+dy*d;if(x<0||y<0||x>=COLS||y>=ROWS)break;const t=state.map[y][x];if(blinkHardBlock(t))break;if(playerMobilityStandable57(x,y))add(x,y);if(t===TT.PORTAL)break}}
  }
  return authorized;

},
asuraApproachSectors({asuraSafeLand61,asuraSectorOpen61},m,r=m?.asuraRadius47||3){
    if(!m||!state?.player||!asuraSafeLand61(state.player.x,state.player.y))return [];
    const p=state.player,q=[[p.x,p.y]],seen=new Set([k(p.x,p.y)]);
    for(let i=0;i<q.length;i++){const[x,y]=q[i];for(const[dx,dy]of DIRS4){const nx=x+dx,ny=y+dy,kk=k(nx,ny);if(seen.has(kk)||!asuraSafeLand61(nx,ny)||(nx===m.x&&ny===m.y))continue;seen.add(kk);q.push([nx,ny])}}
    const out=[];for(const[dx,dy]of DIRS4)if(seen.has(k(m.x+dx*(r+2),m.y+dy*(r+2)))&&asuraSectorOpen61(m,r,dx,dy))out.push({dx,dy});return out
  
},
forestComponents({kk,TREEISH},budget=42){
      const seen=new Set(),groups=[];
      for(let y=1;y<ROWS-1&&budget>0;y++)for(let x=1;x<COLS-1&&budget>0;x++){
        const q=kk(x,y);if(seen.has(q)||!TREEISH.has(state.map[y][x]))continue;
        const queue=[{x,y}],comp=[];seen.add(q);
        for(let i=0;i<queue.length&&comp.length<24;i++){
          const p=queue[i];comp.push(p);
          for(const[dx,dy]of DIRS8){const nx=p.x+dx,ny=p.y+dy,nk=kk(nx,ny);if(nx<=0||ny<=0||nx>=COLS-1||ny>=ROWS-1||seen.has(nk)||!TREEISH.has(state.map[ny][nx]))continue;seen.add(nk);queue.push({x:nx,y:ny})}
        }
        if(comp.length>=2){groups.push(comp);budget-=comp.length}
      }
      return groups;
    
},
architectureMainPath({key85,in85},){
    const start=state.fixedStart||state.player,goal=state.fixedExit||state.stairs;if(!start||!goal)return[];const q=[{x:start.x,y:start.y}],prev=new Map([[key85(start.x,start.y),null]]);for(let i=0;i<q.length;i++){const p=q[i];if(p.x===goal.x&&p.y===goal.y)break;for(const[dx,dy]of DIRS4){const x=p.x+dx,y=p.y+dy,kk=key85(x,y);if(!in85(x,y)||prev.has(kk)||tileBlocks(state.map[y][x]))continue;prev.set(kk,p);q.push({x,y})}}if(!prev.has(key85(goal.x,goal.y)))return[];const out=[];let cur={x:goal.x,y:goal.y};while(cur){out.push(cur);cur=prev.get(key85(cur.x,cur.y))}return out.reverse()
},
architectureLinearity({key85,in85},){
    const path=ReachabilityService.architectureMainPath({key85,in85});if(!path.length)return{pathLength:0,pathShare:0,maxOffPath:0,avgOffPath:0,junctions:0};const ps=new Set(path.map(p=>key85(p.x,p.y))),q=[{x:path[0].x,y:path[0].y}],seen=new Set([key85(path[0].x,path[0].y)]),cells=[];let junctions=0;
    for(let i=0;i<q.length;i++){const p=q[i];cells.push(p);let n=0;for(const[dx,dy]of DIRS4){const x=p.x+dx,y=p.y+dy,kk=key85(x,y);if(!in85(x,y)||tileBlocks(state.map[y][x]))continue;n++;if(!seen.has(kk)){seen.add(kk);q.push({x,y})}}if(n>=3)junctions++}
    let total=0,max=0;for(const c of cells){let bd=1e9;for(const p of path){const d=Math.abs(c.x-p.x)+Math.abs(c.y-p.y);if(d<bd)bd=d;if(!bd)break}total+=bd;if(bd>max)max=bd}
    return{pathLength:path.length,pathShare:+(path.length/Math.max(1,cells.length)).toFixed(3),maxOffPath:max,avgOffPath:+(total/Math.max(1,cells.length)).toFixed(2),junctions};
  
},
roomBranches({graphAdj93},rooms,edges,mainPath){const adj=graphAdj93(rooms.length,edges),main=new Set(mainPath),q=mainPath.map(x=>({x,d:0,root:x})),seen=new Map(mainPath.map(x=>[x,{d:0,root:x}]));for(let i=0;i<q.length;i++){const u=q[i];for(const v of adj[u.x])if(!seen.has(v)){seen.set(v,{d:u.d+1,root:u.root});q.push({x:v,d:u.d+1,root:u.root})}}const off=[];for(let i=0;i<rooms.length;i++)if(!main.has(i))off.push({i,...seen.get(i),degree:adj[i].length});return{adj,off,leaves:off.filter(x=>x.degree===1)}
},
keyTrialCells({key85,in85},blockKey=null){const q=[{x:state.player.x,y:state.player.y,d:0}],seen=new Set([key85(state.player.x,state.player.y)]);for(let i=0;i<q.length;i++){const p=q[i];for(const[dx,dy]of DIRS4){const x=p.x+dx,y=p.y+dy,kk=key85(x,y);if(seen.has(kk)||kk===blockKey||!in85(x,y)||tileBlocks(state.map[y][x]))continue;seen.add(kk);q.push({x,y,d:p.d+1})}}return{q,seen}
},
keyDoorWalk({key85,in85,doorPos96},blockDoors=true,extraOpen=new Set()){
    const q=[{x:state.player.x,y:state.player.y,d:0}],seen=new Set([key85(state.player.x,state.player.y)]),blocked=new Set();
    if(blockDoors)for(const d of state.keyPlan96?.doors||[])if(!extraOpen.has(d.keyId))blocked.add(key85(d.x,d.y));
    for(let i=0;i<q.length;i++){const p=q[i];for(const[dx,dy]of DIRS4){const x=p.x+dx,y=p.y+dy,kk=key85(x,y);if(!in85(x,y)||seen.has(kk)||blocked.has(kk))continue;const t=state.map[y][x];if(tileBlocks(t)&&t!==TT.LOCKED_GATE)continue;if(t===TT.LOCKED_GATE&&!extraOpen.has(doorPos96(x,y)?.keyId))continue;seen.add(kk);q.push({x,y,d:p.d+1})}}
    return{q,seen};
  
},
gateCut({key85,in85},p,existingDoors=[]){
    const old=state.map[p.y][p.x];setTerrainTile58(state.map,p.x,p.y,TT.LOCKED_GATE);const q=[{x:state.player.x,y:state.player.y}],seen=new Set([key85(state.player.x,state.player.y)]),blocked=new Set(existingDoors.map(d=>key85(d.x,d.y)));blocked.add(key85(p.x,p.y));
    for(let i=0;i<q.length;i++){const a=q[i];for(const[dx,dy]of DIRS4){const x=a.x+dx,y=a.y+dy,kk=key85(x,y);if(!in85(x,y)||seen.has(kk)||blocked.has(kk)||tileBlocks(state.map[y][x]))continue;seen.add(kk);q.push({x,y})}}
    setTerrainTile58(state.map,p.x,p.y,old);return !seen.has(key85(state.stairs.x,state.stairs.y));
  
},
protectedPath({plannedPass971},){
    const s=state.player,e=state.stairs;if(!s||!e)return new Set();const q=[{x:s.x,y:s.y}],prev=new Map([[`${s.x},${s.y}`,null]]);
    for(let i=0;i<q.length;i++){const p=q[i];if(p.x===e.x&&p.y===e.y)break;for(const [dx,dy] of DIRS4){const x=p.x+dx,y=p.y+dy,k=`${x},${y}`;if(prev.has(k)||!plannedPass971(x,y))continue;prev.set(k,p);q.push({x,y})}}
    const out=new Set(),ek=`${e.x},${e.y}`;if(!prev.has(ek))return out;let p={x:e.x,y:e.y};while(p){out.add(`${p.x},${p.y}`);p=prev.get(`${p.x},${p.y}`)}return out;
  
},
plannedPath({key980,in980,planned980},){
    if(!state?.player||!state?.stairs)return[];
    const s={x:state.player.x,y:state.player.y},g={x:state.stairs.x,y:state.stairs.y};
    const q=[s],prev=new Map([[key980(s.x,s.y),null]]);
    for(let i=0;i<q.length;i++){
      const p=q[i];if(p.x===g.x&&p.y===g.y)break;
      for(const[dx,dy]of DIRS4){const x=p.x+dx,y=p.y+dy,k=key980(x,y);if(prev.has(k)||!in980(x,y)||!planned980(state.map[y][x]))continue;prev.set(k,p);q.push({x,y})}
    }
    if(!prev.has(key980(g.x,g.y)))return[];
    const out=[];let p=g;while(p){out.push(p);p=prev.get(key980(p.x,p.y))}return out.reverse();
  
},
mechanicalReach({expectedBlink981,key980,reachPass981,raftDockPairs981,tileReveal981,blinkBlock981,in980},opt={}){
    const start=opt.start||{x:state.player.x,y:state.player.y},range=opt.blinkRange??expectedBlink981(),unlock=opt.unlock!==false,withRafts=opt.rafts!==false,withPortals=opt.portals!==false;
    const seen=new Set(),q=[];if(reachPass981(start.x,start.y,{unlock,openBoss:opt.openBoss})){seen.add(key980(start.x,start.y));q.push(start)}
    const raftPairs=withRafts?raftDockPairs981({unlock,openBoss:opt.openBoss}):[];
    const raftLookup=new Map();for(const pair of raftPairs)for(const a of pair.A){const key=key980(a.x,a.y);if(!raftLookup.has(key))raftLookup.set(key,[]);raftLookup.get(key).push(...pair.B)}
    for(let i=0;i<q.length;i++){
      const p=q[i];
      for(const[dx,dy]of DIRS8){const x=p.x+dx,y=p.y+dy,k=key980(x,y);if(!seen.has(k)&&ReachabilityService.playerStepAllowed(p,x,y,{unlock,openBoss:opt.openBoss,tileAt:(x,y)=>tileReveal981(x,y,{unlock}),excludeRafts:false})){seen.add(k);q.push({x,y})}}
      if(range>0)for(const[dx,dy]of DIRS8){for(let d=1;d<=range;d++){const x=p.x+dx*d,y=p.y+dy*d;if(!in980(x,y))break;const raw=state.map[y][x],t=tileReveal981(x,y,{unlock,openBoss:opt.openBoss});if(blinkBlock981(raw,{unlock,openBoss:opt.openBoss}))break;const k=key980(x,y);if(!seen.has(k)&&reachPass981(x,y,{unlock,openBoss:opt.openBoss})){seen.add(k);q.push({x,y})}}}
      const jumps=raftLookup.get(key980(p.x,p.y));if(jumps)for(const d of jumps){const k=key980(d.x,d.y);if(!seen.has(k)){seen.add(k);q.push(d)}}
      if(withPortals&&state.portalLinks981?.[key980(p.x,p.y)]){
        const d=state.portalLinks981[key980(p.x,p.y)].destLand,k=key980(d.x,d.y);if(!seen.has(k)&&reachPass981(d.x,d.y,{unlock,openBoss:opt.openBoss})){seen.add(k);q.push({x:d.x,y:d.y})}
      }
    }
    return{cells:seen,exit:seen.has(key980(state.stairs.x,state.stairs.y)),count:seen.size,range};
  
},
mechanicalBlinkReach({expectedBlink981,key980,floor21Stand981,raftDockPairs981,tileReveal981,blinkBlock981,in980},opt={}){
    const start=opt.start||{x:state.player.x,y:state.player.y},range=opt.blinkRange??expectedBlink981(),unlock=opt.unlock!==false,withRafts=opt.rafts!==false,withPortals=opt.portals!==false;
    const cells=new Set(),q=[];const push=(x,y)=>{const kk=key980(x,y);if(cells.has(kk)||!floor21Stand981(x,y,{unlock,openBoss:opt.openBoss}))return false;cells.add(kk);q.push({x,y});return true};push(start.x,start.y);
    const raftPairs=withRafts?raftDockPairs981({unlock,openBoss:opt.openBoss}):[],raftLookup=new Map();for(const pair of raftPairs)for(const a of pair.A){const kk=key980(a.x,a.y);if(!raftLookup.has(kk))raftLookup.set(kk,[]);raftLookup.get(kk).push(...pair.B)}
    for(let i=0;i<q.length;i++){
      const p=q[i];for(const[dx,dy]of DIRS8){const x=p.x+dx,y=p.y+dy;if(floor21Stand981(x,y,{unlock,openBoss:opt.openBoss})&&ReachabilityService.playerStepAllowed(p,x,y,{unlock,openBoss:opt.openBoss,tileAt:(xx,yy)=>tileReveal981(xx,yy,{unlock,openBoss:opt.openBoss}),excludeRafts:false}))push(x,y)}
      if(range>0)for(const[dx,dy]of DIRS8)for(let d=1;d<=range;d++){const x=p.x+dx*d,y=p.y+dy*d;if(!in980(x,y))break;const raw=state.map[y][x];if(blinkBlock981(raw,{unlock,openBoss:opt.openBoss}))break;if(floor21Stand981(x,y,{unlock,openBoss:opt.openBoss}))push(x,y);if(raw===TT.PORTAL)break}
      const jumps=raftLookup.get(key980(p.x,p.y));if(jumps)for(const d of jumps)push(d.x,d.y);
      if(withPortals&&state.portalLinks981?.[key980(p.x,p.y)]){const d=state.portalLinks981[key980(p.x,p.y)].destLand;push(d.x,d.y)}
    }
    return{cells,exit:cells.has(key980(state.stairs.x,state.stairs.y)),count:cells.size,stateCount:cells.size,range,mode:'selectable-blink'};
  
},
hazardPathLength(target){if(!state||!target)return null;const q=[{x:state.player.x,y:state.player.y,d:0}],seen=new Set([k(state.player.x,state.player.y)]);for(let i=0;i<q.length;i++){const a=q[i];if(a.x===target.x&&a.y===target.y)return a.d;for(const[dx,dy]of DIRS4){const x=a.x+dx,y=a.y+dy,kk=k(x,y);if(x<1||y<1||x>=COLS-1||y>=ROWS-1||seen.has(kk)||!ReachabilityService.playerPassable(x,y))continue;seen.add(kk);q.push({x,y,d:a.d+1})}}return null
},
hazardSafeCell({safeLandFor1005},x,y,forMonster=null){const q=[{x,y}],seen=new Set([k(x,y)]);for(let i=0;i<q.length&&i<5000;i++){const a=q[i];if(a.x>1&&a.y>1&&a.x<COLS-2&&a.y<ROWS-2){const ok=forMonster?PlacementService.monsterCanStand(forMonster,a.x,a.y):safeLandFor1005(null,a.x,a.y);if(ok&&!state.items?.some(it=>it!==forMonster&&it.x===a.x&&it.y===a.y))return a}for(const[dx,dy]of DIRS4){const nx=a.x+dx,ny=a.y+dy,kk=k(nx,ny);if(nx<1||ny<1||nx>=COLS-1||ny>=ROWS-1||seen.has(kk))continue;seen.add(kk);q.push({x:nx,y:ny})}}return{x:state.player.x,y:state.player.y}
},
finalPlacementCell({clamp1020,K1020,candidateFinal1020,inside1020},x,y,mon=null,restrict=null){
  const q=[{x:clamp1020(Math.round(x),1,COLS-2),y:clamp1020(Math.round(y),1,ROWS-2)}],seen=new Set([K1020(q[0].x,q[0].y)]);
  for(let i=0;i<q.length&&i<14000;i++){const p=q[i];if((!restrict||restrict(p))&&candidateFinal1020(p.x,p.y,mon))return p;for(const[dx,dy]of DIRS4){const nx=p.x+dx,ny=p.y+dy,kk=K1020(nx,ny);if(!inside1020(nx,ny)||seen.has(kk))continue;seen.add(kk);q.push({x:nx,y:ny})}}
  return{x:state.player.x,y:state.player.y}

},
bossStageDistances({f20Gates,K1020,inside1020,HAZ1020},openedCount){
    const opened=new Set(f20Gates.slice(0,openedCount).map(q=>K1020(q.x,q.y))),closed=new Set(f20Gates.slice(openedCount).map(q=>K1020(q.x,q.y))),start={x:state.player.x,y:state.player.y};
    const q=[start],dist=new Map([[K1020(start.x,start.y),0]]);
    for(let i=0;i<q.length;i++){const a=q[i],ad=dist.get(K1020(a.x,a.y));for(const[dx,dy]of DIRS8){const x=a.x+dx,y=a.y+dy,kk=K1020(x,y);if(!inside1020(x,y)||dist.has(kk)||closed.has(kk))continue;const t=state.map[y][x];if(!opened.has(kk)&&(t===TT.LOCKED_GATE||tileBlocks(t)||HAZ1020().has(t)))continue;dist.set(kk,ad+1);q.push({x,y})}}return dist
  
},
libraryScrollCell({reachableSet1020,K1020,roomHas1022,visualFree1022,inside1020,HAZ1020},r,run){const reach=reachableSet1020({unlock:true,openBoss:true}),mid=run.cells[Math.floor(run.cells.length/2)],sx=mid.x+run.ix,sy=mid.y+run.iy,q=[[sx,sy]],seen=new Set([K1020(sx,sy)]);for(let i=0;i<q.length&&i<240;i++){const[x,y]=q[i];if(roomHas1022(r,x,y,1)&&visualFree1022(x,y)&&reach.has(K1020(x,y)))return{x,y};for(const[dx,dy]of DIRS4){const nx=x+dx,ny=y+dy,k=K1020(nx,ny);if(!inside1020(nx,ny)||seen.has(k)||!roomHas1022(r,nx,ny,1)||tileBlocks(state.map[ny][nx])||HAZ1020().has(state.map[ny][nx]))continue;seen.add(k);q.push([nx,ny])}}return null
},
monsterStandCell({finalReachSet1029,clamp1020,K1020,candidateFinal1020,inside1020},x,y,mon,requireReach=true,reachSet=null){
  const reach=requireReach?(reachSet||finalReachSet1029()):null,q=[{x:clamp1020(Math.round(x),1,COLS-2),y:clamp1020(Math.round(y),1,ROWS-2)}],seen=new Set([K1020(q[0].x,q[0].y)]);
  for(let i=0;i<q.length&&i<18000;i++){const p=q[i],kk=K1020(p.x,p.y);if((!reach||reach.has(kk))&&candidateFinal1020(p.x,p.y,mon))return p;for(const[dx,dy]of DIRS4){const nx=p.x+dx,ny=p.y+dy,nk=K1020(nx,ny);if(!inside1020(nx,ny)||seen.has(nk))continue;seen.add(nk);q.push({x:nx,y:ny})}}
  for(let yy=1;yy<ROWS-1;yy++)for(let xx=1;xx<COLS-1;xx++)if(candidateFinal1020(xx,yy,mon)&&(!reach||reach.has(K1020(xx,yy))))return{x:xx,y:yy};return{x:state.player.x,y:state.player.y};

},
bossStageReach({K1020,inside1020,HAZ1020},openIds=[]){
  if(state.floor!==20||!state.keyPlan96?.groups?.length)return{seen:new Set(),dist:new Map()};
  const open=new Set(openIds),gateAt=new Map((state.keyPlan96.doors||[]).map(d=>[K1020(d.x,d.y),d])),start={x:state.player.x,y:state.player.y},q=[start],seen=new Set([K1020(start.x,start.y)]),dist=new Map([[K1020(start.x,start.y),0]]);
  for(let i=0;i<q.length;i++){const a=q[i],ad=dist.get(K1020(a.x,a.y));for(const[dx,dy]of DIRS8){const x=a.x+dx,y=a.y+dy,kk=K1020(x,y);if(!inside1020(x,y)||seen.has(kk))continue;const gate=gateAt.get(kk),t=state.map[y][x];if(gate&&!open.has(gate.keyId))continue;if(!gate&&(t===TT.LOCKED_GATE||tileBlocks(t)||HAZ1020().has(t)))continue;seen.add(kk);dist.set(kk,ad+1);q.push({x,y})}}return{seen,dist}

},
bossProgressionActions({K1020,inside1020,HAZ1020},){
  if(state.floor!==20||!state.keyPlan96?.groups?.length)return null;
  const plan=state.keyPlan96,ids=plan.groups.map(g=>g.keyId),bit=new Map(ids.map((id,i)=>[id,1<<i])),keyAt=new Map((plan.keys||[]).map(q=>[K1020(q.x,q.y),bit.get(q.keyId)||0])),gateAt=new Map((plan.doors||[]).map(d=>[K1020(d.x,d.y),bit.get(d.keyId)||0])),goal=plan.finalTarget||state.stairs;
  const startBit=keyAt.get(K1020(state.player.x,state.player.y))||0,start={x:state.player.x,y:state.player.y,keys:startBit,open:0,d:0},q=[start],seen=new Set([`${start.x},${start.y},${start.keys},0`]);let expanded=0;
  const push=(v)=>{const id=`${v.x},${v.y},${v.keys},${v.open}`;if(seen.has(id))return;seen.add(id);q.push(v)};
  for(let i=0;i<q.length&&i<250000;i++){
    const a=q[i];expanded++;if(a.x===goal.x&&a.y===goal.y)return{actions:a.d,expanded,states:seen.size,goal:{...goal},keyTypes:ids,movement:'DIRS8-no-corner-block'};
    for(const[dx,dy]of DIRS8){
      const x=a.x+dx,y=a.y+dy;if(!inside1020(x,y))continue;const kk=K1020(x,y),gb=gateAt.get(kk)||0,t=state.map[y][x];
      if(gb){
        if(a.open&gb){const keys=a.keys|(keyAt.get(kk)||0);push({x,y,keys,open:a.open,d:a.d+1})}
        else if(a.keys&gb)push({x:a.x,y:a.y,keys:a.keys,open:a.open|gb,d:a.d+1});
        continue
      }
      if(t===TT.LOCKED_GATE||tileBlocks(t)||HAZ1020().has(t))continue;
      const keys=a.keys|(keyAt.get(kk)||0);push({x,y,keys,open:a.open,d:a.d+1});
    }
  }
  return{actions:null,expanded,states:seen.size,goal:{...goal},keyTypes:ids,movement:'DIRS8-no-corner-block'}

},
physicalDecorRoute({K1020,inside1020,PHYSICAL_DECOR_BLOCKERS1029,HAZ1020},){
  const start={x:state.player.x,y:state.player.y},goal=state.stairs,q=[start],prev=new Map(),seen=new Set([K1020(start.x,start.y)]),unlock=t=>t===TT.LOCKED_GATE?TT.OPEN_DOOR:t===TT.DRAWBRIDGE_UP?TT.DRAWBRIDGE_DOWN:t;
  for(let i=0;i<q.length;i++){const a=q[i];if(a.x===goal.x&&a.y===goal.y){const out=[];let k0=K1020(a.x,a.y);while(k0){const [x,y]=k0.split(',').map(Number);out.push({x,y});k0=prev.get(k0)||null}return out.reverse()}for(const[dx,dy]of DIRS4){const x=a.x+dx,y=a.y+dy,kk=K1020(x,y);if(!inside1020(x,y)||seen.has(kk))continue;let t=state.map[y][x];const boss=state.bossExitGate1020&&x===state.bossExitGate1020.x&&y===state.bossExitGate1020.y;t=boss?TT.OPEN_DOOR:unlock(t);if(tileBlocks(t)&&!PHYSICAL_DECOR_BLOCKERS1029.has(state.map[y][x]))continue;if(HAZ1020().has(t))continue;seen.add(kk);prev.set(kk,K1020(a.x,a.y));q.push({x,y})}}
  return null;

},
decorCanBlock({inside1020,HAZ1020,K1020},x,y){
  const pass=(a,b)=>inside1020(a,b)&&!HAZ1020().has(state.map[b][a])&&(!tileBlocks(state.map[b][a])||[TT.DOOR,TT.LOCKED_GATE].includes(state.map[b][a]));
  const ns=DIRS4.map(([dx,dy])=>({x:x+dx,y:y+dy})).filter(p=>pass(p.x,p.y));if(ns.length<2)return true;
  const targets=new Set(ns.slice(1).map(p=>K1020(p.x,p.y))),q=[ns[0]],seen=new Set([K1020(x,y),K1020(ns[0].x,ns[0].y)]);
  for(let i=0;i<q.length&&targets.size;i++){const p=q[i];for(const[dx,dy]of DIRS4){const a=p.x+dx,b=p.y+dy,k=K1020(a,b);if(seen.has(k)||!pass(a,b))continue;seen.add(k);targets.delete(k);q.push({x:a,y:b})}}return !targets.size;

},
finalComponents({finalReachSet1029,inside1020,HAZ1020,K1020,stairMarkerState1029,finalExitReach1029},checkEntities=false){
  /* 21F is intentionally split into blink islands. Its canonical connectivity is the selectable 8-ray blink graph (1..current range), not ordinary walk connectivity. Other floors keep the old audit unchanged. */
  const floor21=state.floor===21;
  const blink21=floor21?(blinkChoiceReach({unlock:true,openBoss:true,rafts:true,portals:true,blinkRange:4})||null):null;
  const blinkCells21=floor21?(reachableCells({unlock:true,openBoss:true,rafts:true,portals:true,blinkRange:4})||null):null;
  const reach=blinkCells21 instanceof Set?blinkCells21:finalReachSet1029(),bad=[],seen=new Set(),pass=(x,y)=>inside1020(x,y)&&!globalThis.__MANRU_RUMOR_SPACES1030__?.isSealedInterior?.(x,y)&&!tileBlocks(state.map[y][x])&&!HAZ1020().has(state.map[y][x])&&!(state.map[y][x]===TT.RAFT&&(state.rafts||[]).some(r=>r.x===x&&y>=r.min&&y<=r.max));
  for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++){const kk=K1020(x,y);if(!pass(x,y)||reach.has(kk)||seen.has(kk))continue;const q=[{x,y}],cells=[];seen.add(kk);for(let i=0;i<q.length;i++){const a=q[i];cells.push(a);for(const[dx,dy]of DIRS4){const nx=a.x+dx,ny=a.y+dy,nk=K1020(nx,ny);if(!pass(nx,ny)||reach.has(nk)||seen.has(nk))continue;seen.add(nk);q.push({x:nx,y:ny})}}if(cells.length)bad.push({size:cells.length,x:cells[0].x,y:cells[0].y})}
  const rewards=[],blockedRewards=[];for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++)if([TT.CACHE,TT.ARMORY,TT.VAULT].includes(state.map[y][x])){const v={x,y,tile:state.map[y][x],reachable:reach.has(K1020(x,y))};rewards.push(v);if(!v.reachable)blockedRewards.push(v)}
  const badItems=checkEntities?(state.items||[]).filter(it=>!reach.has(K1020(it.x,it.y))||tileBlocks(state.map[it.y]?.[it.x])||HAZ1020().has(state.map[it.y]?.[it.x])).map(it=>({name:it.name,x:it.x,y:it.y})):[];
  const badMonsters=checkEntities?(state.monsters||[]).filter(m=>!PlacementService.monsterCanStand(m,m.x,m.y)).map(m=>({name:m.name,x:m.x,y:m.y})):[];
  let library=null;if(checkEntities&&state.floor===6&&state.floor6GrandLibraryR8){const key=state.f6LibraryKeyR8,prize=(state.items||[]).find(it=>it.r8LibraryPrize),zone=(state.libraryZones1022||[]).find(z=>z.name==='봉인 고문서고'),before=reachableCells({unlock:false,diagonal:true,blinkRange:state.player.blinkLevel||0,rafts:true,portals:true});library={keyBefore:!!key&&!!before?.has(K1020(key.x,key.y)),rewardBefore:!!prize&&!!before?.has(K1020(prize.x,prize.y)),rewardAfter:!!prize&&reach.has(K1020(prize.x,prize.y)),inArchive:!!prize&&!!zone&&prize.x>=zone.x&&prize.x<zone.x+zone.w&&prize.y>=zone.y&&prize.y<zone.y+zone.h,guaranteed:prize?.talismanKind==='upgrade'};library.ok=library.keyBefore&&!library.rewardBefore&&library.rewardAfter&&library.inArchive&&library.guaranteed;}
  const exitMarker=stairMarkerState1029(),exitReach=floor21?!!blink21?.exit:finalExitReach1029(),componentsOk=!bad.length;
  bad.sort((a,b)=>b.size-a.size);return{ok:componentsOk&&!blockedRewards.length&&!badItems.length&&!badMonsters.length&&(!library||library.ok)&&exitMarker.ok&&exitReach,floor:state.floor,reachable:reach.size,components:bad,totalUnreachable:bad.reduce((a,b)=>a+b.size,0),rewards,blockedRewards,badItems,badMonsters,library,exitMarker,exitReach,mobility:floor21?'selectable-blink':'walk',blinkChoiceAudit:floor21?blink21:null}

},
rumorRoomReach({rumorSpaceKey1030},r){const start=r.innerEntry,inside=(x,y)=>x>=r.rect.x1&&x<=r.rect.x2&&y>=r.rect.y1&&y<=r.rect.y2;if(!start||!inside(start.x,start.y)||tileBlocks(state.map[start.y]?.[start.x])||globalThis.__MANRU_HAZARD_CORE__?.kind?.(state.map[start.y]?.[start.x]))return new Set();const q=[start],seen=new Set([rumorSpaceKey1030(start.x,start.y)]);for(let i=0;i<q.length;i++)for(const [dx,dy]of DIRS4){const x=q[i].x+dx,y=q[i].y+dy,kk=rumorSpaceKey1030(x,y);if(!inside(x,y)||seen.has(kk)||tileBlocks(state.map[y][x])||globalThis.__MANRU_HAZARD_CORE__?.kind?.(state.map[y][x]))continue;seen.add(kk);q.push({x,y})}return seen
},
keyWalk(unlocked=new Set(),start=state?.player){
 if(!state||!start)return{seen:new Set(),q:[]};const plan=state.keyPlan96||{doors:[]},doorMap=new Map((plan.doors||[]).map(d=>[k(d.x,d.y),d])),q=[{x:start.x,y:start.y,d:0}],seen=new Set([k(start.x,start.y)]);
 const can=(x,y)=>{if(x<0||y<0||x>=COLS||y>=ROWS)return false;const t=state.map[y][x];if(t===TT.LOCKED_GATE){const d=doorMap.get(k(x,y));return !!d&&(d.open===true||unlocked.has(d.keyId))}return !tileBlocks(t)};
 for(let i=0;i<q.length;i++){const a=q[i];for(const[dx,dy]of DIRS4){const x=a.x+dx,y=a.y+dy,kk=k(x,y);if(seen.has(kk)||!can(x,y))continue;seen.add(kk);q.push({x,y,d:a.d+1})}}
 return{seen,q};

},

traversalTile(x,y,opts={}){
  let t=opts.tileAt?opts.tileAt(x,y):state.map?.[y]?.[x];
  if(opts.openBoss&&state.bossExitGate1020?.x===x&&state.bossExitGate1020?.y===y)t=TT.FLOOR;
  if(opts.unlock&&t===TT.LOCKED_GATE)t=TT.OPEN_DOOR;
  if(opts.unlock&&t===TT.DRAWBRIDGE_UP)t=TT.DRAWBRIDGE_DOWN;
  return t;
},
playerTerrainPassable(x,y,opts={}){
  if(!state||x<0||y<0||x>=COLS||y>=ROWS)return false;
  const t=ReachabilityService.traversalTile(x,y,opts);if(t==null)return false;
  if(!citadelAccess(x,y))return false;
  if(opts.excludeRafts&&t===TT.RAFT)return false;
  const haz=globalThis.__MANRU_HAZARD_CORE__,kind=haz?.kind?.(t);
  if(kind)return !!opts.allowHazardEntry||!!haz?.adapted?.(state.player,kind);
  if(t===TT.LAVA&&playerCloak().lavaWalk)return true;
  return !tileBlocks(t);
},
playerStepAllowed(from,x,y,opts={}){
  if(!from||Math.max(Math.abs(x-from.x),Math.abs(y-from.y))!==1)return false;
  if(opts.seenOnly&&!state.seen.has(k(x,y)))return false;
  const occupant=opts.ignoreOccupants===false?findMonsterAt(x,y):null,swap=opts.allowAllySwap&&occupant&&occupant.x===x&&occupant.y===y&&entityFootprintCells57(occupant).length===1&&occupancySwapAllowed57(state.player,occupant,from);
  return ReachabilityService.playerTerrainPassable(x,y,opts)&&(opts.ignoreOccupants!==false||!OccupancyService.isOccupied(x,y)||swap);
},
playerSearch(start,opts={}){
  const cells=new Set(),prev=new Map(),dist=new Map(),q=[];
  if(!start||!ReachabilityService.playerTerrainPassable(start.x,start.y,opts))return{cells,prev,dist};
  const occupiedCells=new Set();
  if(opts.ignoreOccupants===false)for(const mon of state.monsters||[])if(mon.hp>0&&!(opts.allowAllySwap&&!factionsHostile57(entityFaction(state.player),entityFaction(mon))&&!(mon.fixed&&mon.kind==='plant')&&entityFootprintCells57(mon).length===1))for(const [ox,oy]of footprintOffsets(mon))occupiedCells.add(k(mon.x+ox,mon.y+oy));
  const stepOpts=opts.ignoreOccupants===false&&!opts.allowAllySwap?{...opts,ignoreOccupants:true}:opts;
  const first=k(start.x,start.y);cells.add(first);prev.set(first,null);dist.set(first,0);q.push({x:start.x,y:start.y});
  for(let i=0;i<q.length;i++){
    const p=q[i],pk=k(p.x,p.y);if(opts.goal&&p.x===opts.goal.x&&p.y===opts.goal.y)break;
    for(const[dx,dy]of DIRS8){const x=p.x+dx,y=p.y+dy,key=k(x,y);if(cells.has(key)||occupiedCells.has(key)||!ReachabilityService.playerStepAllowed(p,x,y,stepOpts))continue;cells.add(key);prev.set(key,pk);dist.set(key,dist.get(pk)+1);q.push({x,y})}
  }
  return{cells,prev,dist};
},
playerPath(search,goal){
  let key=k(goal.x,goal.y);if(!search.prev.has(key))return null;
  const path=[];while(search.prev.get(key)!=null){const[x,y]=key.split(',').map(Number);path.push({x,y});key=search.prev.get(key)}return path.reverse();
},
frontierPath(weight=.35,dirs=DIRS8){
  if(!state)return null;const search=ReachabilityService.playerSearch(state.player,{seenOnly:true,ignoreOccupants:false,allowAllySwap:true});let best=null,score=Infinity;
  // Preserve the former row/column tie order, with one BFS for all candidate frontiers.
  for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++){
    const d=search.dist.get(k(x,y));if(!d)continue;let unseen=0;for(const[dx,dy]of dirs)if(!state.seen.has(k(x+dx,y+dy)))unseen++;
    if(unseen&&d-unseen*weight<score){score=d-unseen*weight;best={x,y}}
  }
  return best?ReachabilityService.playerPath(search,best):null;
},
playerPassable(x,y){return ReachabilityService.playerTerrainPassable(x,y)},
pathTo(tx,ty){
  if(!state||!state.seen.has(k(tx,ty)))return null;
  return ReachabilityService.playerPath(ReachabilityService.playerSearch(state.player,{goal:{x:tx,y:ty},seenOnly:true,ignoreOccupants:false,allowAllySwap:true}),{x:tx,y:ty});
},
floodNormal(start){return ReachabilityService.playerSearch(start).cells},
terrainPassable(x,y){return x>=0&&y>=0&&x<COLS&&y<ROWS&&!tileBlocks(state.map[y][x])},
distances(start){
  const dist=new Map([[k(start.x,start.y),0]]),q=[{x:start.x,y:start.y}];
  for(let i=0;i<q.length;i++){
    const p=q[i],d=dist.get(k(p.x,p.y));
    for(const[dx,dy]of DIRS4){const x=p.x+dx,y=p.y+dy,kk=k(x,y);if(x<0||y<0||x>=COLS||y>=ROWS||dist.has(kk)||!ReachabilityService.terrainPassable(x,y))continue;dist.set(kk,d+1);q.push({x,y})}
  }
  return dist;
},
lootCells(opts={}){
  if(!state?.player)return new Set();
  const current=ReachabilityService.playerSearch(state.player,{ignoreOccupants:true}).cells;
  // A safe destination must remain connected after the remaining one-use sluices.
  // Evaluate their declared terrain through the same movement graph; never mutate
  // the live map to probe reachability.
  const pending=(state.floor23?.controls||[]).filter(c=>!c.activated),projected=new Map();
  for(const control of pending)for(const c of control.changes||[])projected.set(k(c.x,c.y),c.after);
  if(opts.includeReveal&&state.floor23?.reveal&&!state.floor23.reveal.used)for(const c of state.floor23.reveal.cells||[])projected.set(k(c.x,c.y),c.t);
  if(!projected.size)return current;
  const future=ReachabilityService.playerSearch(state.player,{ignoreOccupants:true,tileAt:(x,y)=>projected.get(k(x,y))??state.map?.[y]?.[x]}).cells;
  return opts.futureOnly?future:new Set([...current].filter(key=>future.has(key)));
},
visiblePath(tx,ty){
    if(!state||tx<0||ty<0||tx>=COLS||ty>=ROWS||!state.seen.has(k(tx,ty)))return null;
    const mon=findMonsterAt(tx,ty);
    if(isThreatVisibleToPlayer(mon)){
      if(entityDistance57(mon,state.player)<=1)return[{x:mon.x,y:mon.y}];
      let best=null;
      for(const[dx,dy]of DIRS8){
        const q={x:mon.x+dx,y:mon.y+dy};
        if(q.x<=0||q.y<=0||q.x>=COLS-1||q.y>=ROWS-1||!state.seen.has(k(q.x,q.y))||!ReachabilityService.playerPassable(q.x,q.y)||OccupancyService.isOccupied(q.x,q.y))continue;
        const p=ReachabilityService.pathTo(q.x,q.y);
        if(p&&(!best||p.length<best.length))best=p;
      }
      return best;
    }
    return ReachabilityService.pathTo(tx,ty);
}
});
function validateTerrainUnderlays(){
 if(!state?.map)return true;const layers=terrainMapLayers58(state.map),cat=terrainLayerCatalog58();
 for(let y=0;y<state.map.length;y++)for(let x=0;x<state.map[y].length;x++){const tile=state.map[y][x];if(!cat.overlays.has(tile))continue;const key=k(x,y),base=layers.underlay[key],mode=layers.attachment[key];if(mode==='standing'?terrainSurface58(base):mode==='wall'?cat.wallOverlays.has(tile)&&base===TT.WALL:mode==='secret-wall'&&base===TT.WALL)continue;throw new Error(`terrain substrate contract ${x},${y}:${tile}/${base}/${mode}`)}return true;
}
function makeEmptyMap(){return Array.from({length:ROWS},()=>Array(COLS).fill(TT.WALL))}
function carveRect(m,x,y,w,h,tile=TT.FLOOR){for(let yy=Math.max(0,y);yy<Math.min(ROWS,y+h);yy++)for(let xx=Math.max(0,x);xx<Math.min(COLS,x+w);xx++)setTerrainTile58(m,xx,yy,tile)}
function addRoom(m,x,y,w,h){carveRect(m,x,y,w,h);const r=roomRect(x,y,w,h);state.rooms.push(r);return r}
function setFixedEnds(start,exit){state.fixedStart={...start};state.fixedExit={...exit}}
function registerWholeRoom(x=1,y=1,w=COLS-2,h=ROWS-2){state.rooms.push(roomRect(x,y,w,h))}
function buildInnNormal(m){return buildNormal(m,0)}
function buildGreatHall(m){carveRect(m,1,1,COLS-2,ROWS-2,TT.FLOOR);registerWholeRoom();state.layoutName='거대 회관 · 백석연';setFixedEnds({x:3,y:ROWS-4},{x:COLS-4,y:3});
  const pods=[[7,4,8,6],[20,3,8,7],[34,4,8,6],[6,14,9,7],[20,13,9,8],[35,14,8,7],[9,24,9,6],[25,24,8,6],[38,24,7,6]];
  for(const [x,y,w,h] of pods){for(let xx=x;xx<x+w;xx++){setTerrainTile58(m,xx,y,TT.SCREEN);setTerrainTile58(m,xx,y+h-1,TT.SCREEN)}for(let yy=y;yy<y+h;yy++){setTerrainTile58(m,x,yy,TT.SCREEN);setTerrainTile58(m,x+w-1,yy,TT.SCREEN)}const side=globalThis.__MANRU_RANDOM57__()<.5?'top':'bottom',dx=x+rand(1,w-2),dy=side==='top'?y:y+h-1;setTerrainTile58(m,dx,dy,TT.FLOOR);setTerrainTile58(m,x+Math.floor(w/2),y+Math.floor(h/2),TT.TABLE)}
  for(const [x,y] of [[4,5],[COLS-5,5],[4,ROWS-6],[COLS-5,ROWS-6],[24,16],[13,10],[36,21]])setTerrainTile58(m,x,y,TT.BRAZIER);
  setTerrainTile58(m,11,16,TT.ARMORY);setTerrainTile58(m,37,16,TT.CACHE);setTerrainTile58(m,24,8,TT.RUMOR);setTerrainTile58(m,24,27,TT.VAULT);
}
function buildChoiceCorridor(m){state.layoutName='큰 복도 · 이중 삼갈래';const laneYs=[6,16,26];setFixedEnds({x:2,y:16},{x:46,y:16});registerWholeRoom();
  carveRect(m,1,12,6,9);carveRect(m,21,11,8,11);carveRect(m,43,12,5,9);
  for(const y of laneYs){carveRect(m,5,y,18,3);carveRect(m,27,y,18,3)}
  carveRect(m,5,5,3,23);carveRect(m,21,5,3,23);carveRect(m,27,5,3,23);carveRect(m,43,5,3,23);
  const tags=[{y:6,name:'안전 · 보급',tile:TT.CACHE},{y:16,name:'무 · 장비',tile:TT.ARMORY},{y:26,name:'위험 · 보물',tile:TT.VAULT}];state.routeTags=[];
  tags.forEach((r,i)=>{for(const x of [8,30])setTerrainTile58(m,x,r.y,TT.FLOOR);setTerrainTile58(m,18,r.y,i===0?TT.BRAZIER:r.tile);setTerrainTile58(m,40,r.y,r.tile);if(i===2){setTerrainTile58(m,14,r.y,TT.TRAP);setTerrainTile58(m,36,r.y,TT.TRAP)}});
}
function buildGardenNormal(m){return buildNormal(m,1)}
function bridgeBetween(m,a,b,tile=TT.PAPER_BRIDGE){let x=(a.cx??a.x),y=(a.cy??a.y),tx=(b.cx??b.x),ty=(b.cy??b.y);while(x!==tx){x+=Math.sign(tx-x);if(m[y][x]===TT.WATER)setTerrainTile58(m,x,y,tile)}while(y!==ty){y+=Math.sign(ty-y);if(m[y][x]===TT.WATER)setTerrainTile58(m,x,y,tile)}}
function buildPavilionCluster(m){
    for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++)setTerrainTile58(m,x,y,TT.WATER);state.layoutName='수중 정자 모임 · 칠정환';state.rooms=[];
    const specs=[[2,3,8,7],[Math.floor(COLS*.29),2,8,7],[COLS-10,4,8,7],[4,ROWS-10,9,8],[Math.floor(COLS*.44),Math.floor(ROWS*.42),9,8],[Math.floor(COLS*.70),ROWS-11,9,8],[COLS-11,Math.floor(ROWS*.47),9,8]];
    const islands=specs.map(v=>roomRect(...v));for(const r of islands){carveRect(m,r.x,r.y,r.w,r.h,TT.FLOOR);state.rooms.push(r);setTerrainTile58(m,r.cx,r.cy,TT.PAVILION)}
    const edges=[[0,1],[1,2],[0,3],[1,4],[2,6],[3,4],[4,5],[4,6],[5,6],[2,4],[0,4]];for(const [a,b] of edges)bridgeBetween(m,islands[a],islands[b]);
    setFixedEnds({x:islands[0].cx,y:islands[0].cy},{x:islands[5].cx,y:islands[5].cy});setTerrainTile58(m,islands[4].cx,islands[4].cy,TT.FOUNTAIN);setTerrainTile58(m,islands[1].cx,islands[1].cy,TT.CACHE);setTerrainTile58(m,islands[6].cx,islands[6].cy,TT.RUMOR);
  }
function carveMazeCell(m,cx,cy){carveRect(m,cx-1,cy-1,3,3,TT.FLOOR)}
function buildBambooMaze(m){for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++)setTerrainTile58(m,x,y,TT.BAMBOO);state.layoutName='대나무 미로 · 흑죽림';state.rooms=[roomRect(1,1,COLS-2,ROWS-2)];state.visionPenalty=3;
  const xs=[],ys=[];for(let x=3;x<=COLS-4;x+=5)xs.push(x);for(let y=3;y<=ROWS-4;y+=5)ys.push(y);const cells=[];for(let j=0;j<ys.length;j++)for(let i=0;i<xs.length;i++)cells.push({i,j,x:xs[i],y:ys[j]});
  const key=(i,j)=>i+','+j,seen=new Set(),stack=[cells[0]];seen.add('0,0');carveMazeCell(m,cells[0].x,cells[0].y);
  while(stack.length){const c=stack[stack.length-1],ns=[[1,0],[-1,0],[0,1],[0,-1]].map(([di,dj])=>({i:c.i+di,j:c.j+dj})).filter(q=>q.i>=0&&q.i<xs.length&&q.j>=0&&q.j<ys.length&&!seen.has(key(q.i,q.j)));if(!ns.length){stack.pop();continue}const n=choice(ns);seen.add(key(n.i,n.j));const nc=cells.find(v=>v.i===n.i&&v.j===n.j);carveMazeCell(m,nc.x,nc.y);paintLine(m,c.x,c.y,nc.x,nc.y,TT.FLOOR,3);stack.push(nc)}
  for(let n=0;n<7;n++){const a=choice(cells),b=choice(cells);if(Math.abs(a.i-b.i)+Math.abs(a.j-b.j)===1)paintLine(m,a.x,a.y,b.x,b.y,TT.FLOOR,3)}
  const last=cells[cells.length-1];setFixedEnds({x:cells[0].x,y:cells[0].y},{x:last.x,y:last.y});setTerrainTile58(m,last.x,last.y,TT.FLOOR);
}
function buildInnerNormal(m){return buildNormal(m,2)}
function buildPerfumeRiver(m){
    carveRect(m,1,1,COLS-2,ROWS-2,TT.FLOOR);state.rooms=[roomRect(1,1,COLS-2,ROWS-2)];state.layoutName='향수강(향수강) · 대하 유동 뗏목';setFixedEnds({x:3,y:ROWS-4},{x:COLS-4,y:3});state.rafts=[];
    let cy=Math.floor(ROWS/2);for(let x=1;x<COLS-1;x++){if(x%7===0)cy=clamp(cy+choice([-3,-2,-1,0,1,2,3]),10,ROWS-11);for(let y=cy-4;y<=cy+4;y++)setTerrainTile58(m,x,y,TT.WATER)}
    for(const ratio of [.18,.38,.60,.80]){const x=Math.floor(COLS*ratio),y=clamp(cy+choice([-3,-2,2,3]),6,ROWS-7);carveRect(m,x-3,y-3,7,7,TT.FLOOR);state.rooms.push(roomRect(x-3,y-3,7,7));setTerrainTile58(m,x,y,globalThis.__MANRU_RANDOM57__()<.5?TT.CACHE:TT.RUMOR)}
    for(const ratio of [.12,.30,.50,.70,.88]){const x=Math.floor(COLS*ratio);let top=ROWS,bottom=0;for(let y=1;y<ROWS-1;y++)if(m[y][x]===TT.WATER){top=Math.min(top,y);bottom=Math.max(bottom,y)}if(top<bottom){const y=Math.floor((top+bottom)/2);setTerrainTile58(m,x,y,TT.RAFT);state.rafts.push({x,y,min:top,max:bottom,dir:globalThis.__MANRU_RANDOM57__()<.5?1:-1})}}
  }
function buildRoomMaze(m){state.layoutName='방 미로 · 천문첩';state.rooms=[];const cols=8,rows=5,rw=4,rh=4,x0=1,y0=2,gx=2,gy=2;
  const grid=[];for(let j=0;j<rows;j++){grid[j]=[];for(let i=0;i<cols;i++){const x=x0+i*(rw+gx),y=y0+j*(rh+gy),r=addRoom(m,x,y,rw,rh);grid[j][i]=r}}
  const seen=new Set(['0,0']),stack=[[0,0]],edges=[];while(stack.length){const [i,j]=stack[stack.length-1],ns=[[1,0],[-1,0],[0,1],[0,-1]].map(([di,dj])=>[i+di,j+dj]).filter(([ni,nj])=>ni>=0&&ni<cols&&nj>=0&&nj<rows&&!seen.has(ni+','+nj));if(!ns.length){stack.pop();continue}const [ni,nj]=choice(ns);seen.add(ni+','+nj);edges.push([[i,j],[ni,nj]]);stack.push([ni,nj])}
  const connect=(a,b)=>{const [i,j]=a,[ni,nj]=b,r=grid[j][i];if(i!==ni){const x=i<ni?r.x+r.w:r.x-1,y=r.cy;setTerrainTile58(m,x,y,TT.DOOR)}else{const x=r.cx,y=j<nj?r.y+r.h:r.y-1;setTerrainTile58(m,x,y,TT.DOOR)}};edges.forEach(e=>connect(...e));
  for(let n=0;n<16;n++){const j=rand(0,rows-1),i=rand(0,cols-2),r=grid[j][i],x=r.x+r.w,y=r.cy;if(m[y][x]===TT.WALL)setTerrainTile58(m,x,y,globalThis.__MANRU_RANDOM57__()<.56?TT.FAKE_DOOR:TT.DOOR)}
  for(let n=0;n<12;n++){const j=rand(0,rows-2),i=rand(0,cols-1),r=grid[j][i],x=r.cx,y=r.y+r.h;if(m[y][x]===TT.WALL)setTerrainTile58(m,x,y,globalThis.__MANRU_RANDOM57__()<.56?TT.FAKE_DOOR:TT.DOOR)}
  state.monsterDenseRooms=[grid[0][6],grid[2][3],grid[3][5],grid[4][2]];setFixedEnds({x:grid[0][0].cx,y:grid[0][0].cy},{x:grid[4][7].cx,y:grid[4][7].cy});
}
function buildStorageNormal(m){return buildNormal(m,3)}
function buildFortress(m){state.layoutName='성채 · 초원미로 / 용암해자 / 내성';state.rooms=[roomRect(1,1,COLS-2,ROWS-2)];const bridgeY=Math.floor(ROWS/2),moatL=17,moatR=25,castleL=26;setFixedEnds({x:3,y:ROWS-4},{x:COLS-3,y:3});state.cipher={secret:[1,2,3,4,5].sort(()=>globalThis.__MANRU_RANDOM57__()-.5),guess:[],history:[],solved:false};
  carveRect(m,1,1,16,ROWS-2,TT.GRASS);for(let y=3;y<ROWS-3;y+=5)for(let x=3;x<16;x++)if((x+y)%8!==0)setTerrainTile58(m,x,y,TT.HEDGE);for(let x=5;x<16;x+=4)for(let y=2;y<ROWS-2;y++)if(y%6!==0)setTerrainTile58(m,x,y,TT.HEDGE);paintLine(m,3,ROWS-4,15,bridgeY,TT.GRASS,2);
  for(let y=1;y<ROWS-1;y++)for(let x=moatL;x<=moatR;x++)setTerrainTile58(m,x,y,TT.LAVA);for(let x=moatL;x<=moatR;x++)setTerrainTile58(m,x,bridgeY,TT.DRAWBRIDGE_UP);
  carveRect(m,castleL,1,COLS-castleL-1,ROWS-2,TT.FLOOR);
  for(const y of [7,13,19,25]){if(y>=ROWS-2)continue;for(let x=castleL+1;x<COLS-2;x++)setTerrainTile58(m,x,y,TT.WALL);for(const x of [castleL+4,castleL+11,COLS-4])if(x<COLS-1)setTerrainTile58(m,x,y,TT.DOOR)}
  for(let y=3;y<ROWS-2;y+=5)setTerrainTile58(m,castleL+1,y,TT.BRAZIER);
  setTerrainTile58(m,15,bridgeY,TT.SWITCH);state.switches.push({x:15,y:bridgeY,kind:'cipher',targets:Array.from({length:moatR-moatL+1},(_,i)=>({x:moatL+i,y:bridgeY})),used:false});setTerrainTile58(m,COLS-3,3,TT.FLOOR);
  setTerrainTile58(m,33,5,TT.ARMORY);setTerrainTile58(m,41,ROWS-6,TT.VAULT);setTerrainTile58(m,44,11,TT.RUMOR);setTerrainTile58(m,31,27,TT.CACHE);
}
function buildIronWarehouse(m){carveRect(m,1,1,COLS-2,ROWS-2,TT.FLOOR);state.rooms=[roomRect(1,1,COLS-2,ROWS-2)];state.layoutName='철판 창고 · 삼중 열쇠 봉쇄';setFixedEnds({x:2,y:ROWS-3},{x:COLS-3,y:4});state.floorKeys=0;state.floorKeysRequired=3;
  for(let x=6;x<=36;x+=6){for(let y=2;y<ROWS-2;y++)if(y%6!==0)setTerrainTile58(m,x,y,x%12===0?TT.WALL:TT.SCREEN)}for(let y=6;y<=26;y+=7){for(let x=2;x<41;x++)if(x%7!==0)setTerrainTile58(m,x,y,TT.TABLE)}
  const gateX=42;for(let y=1;y<ROWS-1;y++)setTerrainTile58(m,gateX,y,TT.WALL);setTerrainTile58(m,gateX,16,TT.LOCKED_GATE);carveRect(m,43,2,5,ROWS-5,TT.FLOOR);setTerrainTile58(m,COLS-3,4,TT.FLOOR);setTerrainTile58(m,COLS-3,8,TT.VAULT);
  for(const [x,y] of [[4,4],[24,28],[37,5]])setTerrainTile58(m,x,y,TT.KEY_TILE);setTerrainTile58(m,35,23,TT.ARMORY);setTerrainTile58(m,27,3,TT.CACHE);
}
function buildHeartNormal(m){return buildNormal(m,4)}
function buildVoidSea(m){
    for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++)setTerrainTile58(m,x,y,TT.VOID);state.rooms=[];state.layoutName='공허 유체의 바다 · 구섬연쇄';state.requiresBlink=true;
    const pts=[[2,ROWS-8],[10,ROWS-8],[10,ROWS-18],[19,ROWS-18],[28,ROWS-18],[28,8],[38,8],[47,15],[COLS-8,7]],rs=pts.map(([x,y])=>island(m,x,y));
    setFixedEnds({x:rs[0].cx,y:rs[0].cy},{x:rs[rs.length-1].cx,y:rs[rs.length-1].cy});setTerrainTile58(m,rs[0].cx,rs[0].cy,TT.FLOOR);setTerrainTile58(m,rs[rs.length-1].cx,rs[rs.length-1].cy,TT.FLOOR);for(let i=1;i<rs.length-1;i++)setTerrainTile58(m,rs[i].cx,rs[i].cy,TT.STAMINA_PAD);setTerrainTile58(m,rs[4].cx,rs[4].cy-2,TT.RUMOR);
  }
function buildGrandTemple(m){carveRect(m,3,3,COLS-6,ROWS-6,TT.FLOOR);state.rooms=[roomRect(3,3,COLS-6,ROWS-6)];state.layoutName='거대 신전 · 잠수 보물고';const cx=Math.floor(COLS/2),cy=Math.floor(ROWS/2);setFixedEnds({x:5,y:ROWS-5},{x:COLS-5,y:4});
  for(let x=5;x<COLS-5;x++)setTerrainTile58(m,x,cy,TT.WATER);for(let y=5;y<ROWS-5;y++)setTerrainTile58(m,cx,y,TT.WATER);for(const [x,y] of [[11,cy],[cx,8],[cx,24],[37,cy]])setTerrainTile58(m,x,y,TT.DRAWBRIDGE_DOWN);
  for(const [x,y] of [[9,7],[39,7],[9,25],[39,25]])setTerrainTile58(m,x,y,TT.GOLD);setTerrainTile58(m,cx,7,TT.ALTAR);setTerrainTile58(m,cx,25,TT.FOUNTAIN);
  const wallX=41;for(let y=19;y<ROWS-4;y++)setTerrainTile58(m,wallX,y,TT.WALL);setTerrainTile58(m,wallX,24,TT.SECRET_DOOR);carveRect(m,42,20,5,9,TT.FLOOR);setTerrainTile58(m,45,24,TT.VAULT);state.secretTreasure={x:45,y:24};
}
function buildRegionLayout(m){state.fixedStart=null;state.fixedExit=null;state.visionPenalty=0;state.specialFloor=false;state.rafts=[];state.routeTags=[];state.monsterDenseRooms=[];state.floorKeys=0;state.floorKeysRequired=0;state.cipher=null;state.requiresBlink=false;state.secretTreasure=null;
  const f=state.floor;if(f===2){state.specialFloor=true;buildGreatHall(m)}else if(f===4){state.specialFloor=true;buildChoiceCorridor(m)}else if(f===6){state.specialFloor=true;buildPavilionCluster(m)}else if(f===8){state.specialFloor=true;buildBambooMaze(m)}else if(f===11){state.specialFloor=true;buildPerfumeRiver(m)}else if(f===13){state.specialFloor=true;buildRoomMaze(m)}else if(f===16){state.specialFloor=true;buildFortress(m)}else if(f===18){state.specialFloor=true;buildIronWarehouse(m)}else if(f===21){state.specialFloor=true;buildVoidSea(m)}else if(f===22){state.specialFloor=true;buildGrandTemple(m)}else if(f===23){state.specialFloor=true;buildMercuryLake(m)}else if(f===24){state.specialFloor=true;buildPeachGarden(m)}else if(f<=5)buildInnNormal(m);else if(f<=10)buildGardenNormal(m);else if(f<=15)buildInnerNormal(m);else if(f<=20)buildStorageNormal(m);else buildHeartNormal(m)}
function chooseEnds(){if(state.fixedStart&&state.fixedExit){state.player.x=state.fixedStart.x;state.player.y=state.fixedStart.y;state.stairs={...state.fixedExit};setTerrainTile58(state.map,state.stairs.x,state.stairs.y,TT.STAIR);return}let best=[state.rooms[0],state.rooms[state.rooms.length-1]],bd=-1;for(const a of state.rooms)for(const b of state.rooms){const d=Math.abs(a.cx-b.cx)+Math.abs(a.cy-b.cy);if(d>bd){bd=d;best=[a,b]}}if(globalThis.__MANRU_RANDOM57__()<.5)best.reverse();state.player.x=best[0].cx;state.player.y=best[0].cy;state.stairs={x:best[1].cx,y:best[1].cy};setTerrainTile58(state.map,state.stairs.x,state.stairs.y,TT.STAIR)}
function placeSpecials(){const z=regionIndex();const specials=z===0?[TT.RUMOR,TT.BRAZIER,TT.CACHE,TT.ARMORY]:z===1?[TT.RUMOR,TT.FOUNTAIN,TT.COOKPOT]:z===2?[TT.MIRROR,TT.RUMOR,TT.ALTAR,TT.SNARE]:z===3?[TT.JAR,TT.COOKPOT,TT.CACHE,TT.ARMORY]:[TT.ALTAR,TT.VAULT,TT.GOLD,TT.FOUNTAIN];const count=state.specialFloor?rand(2,4):rand(7,12);for(let i=0;i<count;i++){const p=PlacementService.randomFloor(0);if(state.map[p.y][p.x]===TT.FLOOR)setTerrainTile58(state.map,p.x,p.y,choice(specials))}if(!state.requiresBlink)for(let i=0;i<rand(2,4);i++){const p=PlacementService.randomFloor(0,{avoidSafeChoice:true});if(state.map[p.y][p.x]===TT.FLOOR)setTerrainTile58(state.map,p.x,p.y,TT.TRAP)}}
function auditPathCost(t){
  if(t===TT.STAIR||!tileBlocks(t))return 1;
  if(t===TT.TABLE||t===TT.SCREEN||t===TT.HEDGE)return 2;
  if(t===TT.WATER)return 3;
  if(t===TT.BAMBOO)return 4;
  if(t===TT.WALL)return 6;
  return 8;
}
function ensureNormalConnectivity(){
  if(state.specialFloor||!state.stairs)return;
  let reach=ReachabilityService.floodNormal(state.player);
  if(reach.has(k(state.stairs.x,state.stairs.y)))return;
  // 드물게 물/대나무 장식이 복도를 끊었을 때, 최소 훼손 경로를 찾아 다리/샛길로 자연스럽게 수선한다.
  const N=COLS*ROWS,dist=Array(N).fill(Infinity),prev=Array(N).fill(-1),done=Array(N).fill(false);
  const id=(x,y)=>y*COLS+x,xy=i=>({x:i%COLS,y:Math.floor(i/COLS)}),start=id(state.player.x,state.player.y),goal=id(state.stairs.x,state.stairs.y);
  dist[start]=0;
  for(let step=0;step<N;step++){
    let u=-1,best=Infinity;for(let i=0;i<N;i++)if(!done[i]&&dist[i]<best){best=dist[i];u=i}if(u<0||u===goal)break;done[u]=true;
    const p=xy(u);for(const[dx,dy]of DIRS4){const x=p.x+dx,y=p.y+dy;if(x<=0||y<=0||x>=COLS-1||y>=ROWS-1)continue;const v=id(x,y),nd=dist[u]+auditPathCost(state.map[y][x]);if(nd<dist[v]){dist[v]=nd;prev[v]=u}}
  }
  if(!isFinite(dist[goal]))return;
  const path=[];for(let at=goal;at!==-1&&at!==start;at=prev[at])path.push(xy(at));
  let repairs=0;
  for(const p of path){const t=state.map[p.y][p.x];if(!tileBlocks(t))continue;
    if(t===TT.WATER)setTerrainTile58(state.map,p.x,p.y,TT.PAPER_BRIDGE);
    else if([TT.LAVA,TT.VOID,TT.MERCURY,TT.DRAWBRIDGE_UP].includes(t))setTerrainTile58(state.map,p.x,p.y,TT.DRAWBRIDGE_DOWN);
    else setTerrainTile58(state.map,p.x,p.y,TT.FLOOR);
    repairs++;
  }
  reach=ReachabilityService.floodNormal(state.player);state.generationRepair=repairs;
  if(repairs&&reach.has(k(state.stairs.x,state.stairs.y)))addLog(`오래된 샛길이 이어졌다. (${repairs}칸)`);
}
function peachTerrain(){
 if(!state||state.floor<6||state.floor>10||state.artifactDungeon46)return TT.PEACH_TREE;
 const budget=state.peachGeneration53||(state.peachGeneration53={limit:1+(globalThis.__MANRU_RANDOM57__()<.35?1:0),reserved:0});
 if(budget.reserved>=budget.limit)return TT.GARDEN_TREE;
 budget.reserved++;return TT.PEACH_TREE;
}
function runRegisteredGenerationPipeline(...args){
  const base=GENERATION_PIPELINE.base?.fn;if(typeof base!=='function')throw new Error('canonical generation base missing');
  // Wrapper nesting used to execute the most recently-added pre hook first, then
  // unwind post hooks oldest-to-newest. Preserve that order explicitly.
  for(let i=GENERATION_PIPELINE.pre.length-1;i>=0;i--){GENERATION_PIPELINE.pre[i].fn(...args);}
  const r=base(...args);
  for(const st of GENERATION_PIPELINE.post){st.fn(...args);}
  return r;
}
  /* ----------------------- dynamic map dimensions and DCSS-style vaults ----------------------- */
  function sizeForFloor(f){
    if([2,6,11,16,21,22,23,24].includes(f))return[77,51];
    if(f===20)return[111,85];
    if(f===25)return[79,53];
    if([4,8,13,18].includes(f))return[73,49];
    if([5,10,15].includes(f))return[71,47];
    if(f<=5)return[63,43];if(f<=10)return[67,45];if(f<=15)return[71,47];if(f<=20)return[73,49];return[75,51];
  }
  function setFloorSize(f){const [w,h]=sizeForFloor(f);COLS=w;ROWS=h;}
  function forceTile(x,y,t,allow=null){if(x<=0||y<=0||x>=COLS-1||y>=ROWS-1)return false;if((x===state.player.x&&y===state.player.y)||(x===state.stairs.x&&y===state.stairs.y))return false;if(allow&&!allow.includes(state.map[y][x]))return false;setTerrainTile58(state.map,x,y,t);return true}
  function vaultRect(r,pad=1){return{x:r.x+pad,y:r.y+pad,w:r.w-pad*2,h:r.h-pad*2,cx:r.cx,cy:r.cy}}
  function addVault(name,r){state.vaults=state.vaults||[];state.vaults.push({name,x:r.cx,y:r.cy,r})}
  function vaultShrine(r,z){const v=vaultRect(r,1);if(v.w<7||v.h<7)return;for(let x=v.x;x<v.x+v.w;x++){forceTile(x,v.y,z===4?TT.GOLD:TT.WATER);forceTile(x,v.y+v.h-1,z===4?TT.GOLD:TT.WATER)}for(let y=v.y;y<v.y+v.h;y++){forceTile(v.x,y,z===4?TT.GOLD:TT.WATER);forceTile(v.x+v.w-1,y,z===4?TT.GOLD:TT.WATER)}forceTile(v.cx,v.y,z===4?TT.DRAWBRIDGE_DOWN:TT.PAPER_BRIDGE);forceTile(v.cx,v.y+v.h-1,z===4?TT.DRAWBRIDGE_DOWN:TT.PAPER_BRIDGE);forceTile(v.cx,v.cy,TT.ALTAR);addVault('환형 제단',r)}
  function vaultTrapGallery(r,z){const v=vaultRect(r,1);if(v.w<8||v.h<6)return;for(let x=v.x+1;x<v.x+v.w-1;x++){if((x-v.x)%2===0){forceTile(x,v.cy-1,TT.TRAP);forceTile(x,v.cy+1,TT.SNARE)}}forceTile(v.cx,v.cy,z===0?TT.CACHE:z===3?TT.ARMORY:TT.VAULT);addVault('함정 회랑',r)}
  function vaultCells(r,z){const v=vaultRect(r,1);if(v.w<10||v.h<7)return;for(let x=v.x+3;x<v.x+v.w-2;x+=4){for(let y=v.y;y<v.y+v.h;y++)forceTile(x,y,TT.WALL,[TT.FLOOR,TT.GRASS,TT.GOLD]);forceTile(x,v.cy,TT.DOOR)}forceTile(v.x+1,v.y+1,TT.CACHE);forceTile(v.x+v.w-2,v.y+v.h-2,z===3?TT.ARMORY:TT.VAULT);addVault('격자 감실',r)}
  function vaultPool(r,z){const v=vaultRect(r,2);if(v.w<7||v.h<7)return;const t=z===4?TT.MERCURY:TT.WATER;for(let y=v.y;y<v.y+v.h;y++)for(let x=v.x;x<v.x+v.w;x++)forceTile(x,y,t,[TT.FLOOR,TT.GRASS,TT.GOLD]);for(let x=v.x;x<v.x+v.w;x++)forceTile(x,v.cy,z===4?TT.DRAWBRIDGE_DOWN:TT.PAPER_BRIDGE,[t]);forceTile(v.cx,v.cy,TT.PAVILION,[TT.PAPER_BRIDGE,TT.DRAWBRIDGE_DOWN]);addVault(z===4?'수은 감실':'침수 방',r)}
  function vaultPillars(r,z){const v=vaultRect(r,1);if(v.w<8||v.h<7)return;const pillar=z===0?TT.SCREEN:z===1?TT.BAMBOO:z===2?TT.MIRROR:z===3?TT.JAR:TT.GOLD;for(let y=v.y+1;y<v.y+v.h-1;y+=3)for(let x=v.x+1;x<v.x+v.w-1;x+=3)if(!(Math.abs(x-v.cx)<=1&&Math.abs(y-v.cy)<=1))forceTile(x,y,pillar);forceTile(v.cx,v.cy,z===1?TT.FOUNTAIN:z===4?TT.ALTAR:TT.CACHE);addVault('기둥 정원',r)}
  function vaultChasm(r,z){const v=vaultRect(r,1);if(v.w<9||v.h<7)return;const t=z===3?TT.LAVA:TT.VOID;for(let y=v.y+1;y<v.y+v.h-1;y++)for(let x=v.x+1;x<v.x+v.w-1;x++)if(Math.abs(y-v.cy)>1)forceTile(x,y,t,[TT.FLOOR,TT.GRASS,TT.GOLD]);for(let x=v.x;x<v.x+v.w;x++)forceTile(x,v.cy,TT.DRAWBRIDGE_DOWN,[TT.FLOOR,TT.GRASS,TT.GOLD,t]);forceTile(v.cx,v.cy,TT.VAULT,[TT.DRAWBRIDGE_DOWN]);addVault(z===3?'용암 절단실':'공허 다리',r)}
  function applyVaults(){
    state.vaults=[];if(state.specialFloor)return;const rooms=[...(state.rooms||[])].filter(r=>r.w>=8&&r.h>=7).sort((a,b)=>b.w*b.h-a.w*a.h);const z=regionIndex(),count=Math.min(2+(state.floor>=16?1:0),rooms.length);const fns=[vaultShrine,vaultTrapGallery,vaultCells,vaultPool,vaultPillars,vaultChasm];for(let i=0;i<count;i++){const r=rooms[i],fn=fns[(hiHash(`${state.floor}:${r.x}:${r.y}`)+i)%fns.length];fn(r,z)}if(state.vaults.length)state.layoutName+=` · ${state.vaults[0].name}`;
  }
  function addVaultRewards(){for(const v of state.vaults||[]){if(globalThis.__MANRU_RANDOM57__()<.72&&ReachabilityService.terrainPassable(v.x,v.y)&&!state.items.some(i=>i.x===v.x&&i.y===v.y))dropRandomItem({x:v.x,y:v.y},true)}}
  function generateFloorBaseVaults(){
    setFloorSize(state.floor);state.rooms=[];state.items=[];state.monsters=[];state.decals=[];state.switches=[];state.rafts=[];state.routeTags=[];state.floorTurn=0;state.alert=0;state.bossDefeated=false;state.fixedStart=null;state.fixedExit=null;state.visionPenalty=0;state.specialFloor=false;state.floorKeys=0;state.floorKeysRequired=0;state.cipher=null;state.generationRepair=0;state.vaults=[];state.seen=new Set();state.visible=new Set();
    const bossFloor=[5,10,15,20,25].includes(state.floor);
    if(bossFloor){
      generateBossFloor();
      // F20 is the one populated boss floor: preserve its authored boss arena, then continue through the
      // same canonical population and loose-loot owners used by ordinary floors. Other boss floors are unchanged.
      if(state.floor!==20){vfBuildDecor();return}
    }else{
      const m=makeEmptyMap();state.map=m;buildRegionLayout(m);chooseEnds();applyVaults();placeSpecials();ensureNormalConnectivity();
    }
    VisibilityService.compute();spawnFloorPopulation();spawnLayoutExtras();
    const looseCount=state.floor===24?5:rand(7,11);
    for(let i=0;i<looseCount;i++){
      const p=PlacementService.randomFloor(0),before=state.items.length;dropRandomItem(p,false);
      if(state.floor===20&&state.items.length>before)for(const it of state.items.slice(before)){it.f20LooseLoot1020=true;it.origin56=it.origin56||'floor20-normal-loot'}
    }
    addVaultRewards();
    if(state.secretTreasure){dropRandomItem(state.secretTreasure,true);dropRandomItem(state.secretTreasure,true)}
    VisibilityService.compute();addLog(`F${state.floor} · ${regionFor(state.floor)[2]}`);if(globalThis.__MANRU_RANDOM57__()<.72)addLog(choice(REGION_AMBIENCE[regionIndex()]));vfBuildDecor();
  }
  function isPlainFloorTile(x,y){const t=state.map?.[y]?.[x];return t===TT.FLOOR||t===TT.GRASS}
  function placeFeatureTile(x,y,t){if(!state||x<=0||y<=0||x>=COLS-1||y>=ROWS-1||(x===state.player.x&&y===state.player.y)||(x===state.stairs.x&&y===state.stairs.y)||!isPlainFloorTile(x,y))return false;setTerrainTile58(state.map,x,y,t);return true}
  function applyFeatureRooms(){if(!state||state.specialFloor)return;state.featureRooms=[];const pool=[['연금술방',alchemy],['주방',kitchen],['사당',shrine],['무기고',armoryRoom],['서고',study],['감방',cells]],c=(state.rooms||[]).filter(r=>r.w>=8&&r.h>=7&&!contains(r,state.player.x,state.player.y)&&!contains(r,state.stairs.x,state.stairs.y));if(!c.length)return;c.sort((a,b)=>b.w*b.h-a.w*a.h);const want=Math.min(state.floor>=11?2:1,c.length),used=new Set();for(let i=0;i<want;i++){const r=c[i];let j=Math.floor(hash2(r.x,r.y,state.floor+503)*pool.length)%pool.length,g=0;while(used.has(pool[j][0])&&g++<pool.length)j=(j+1)%pool.length;used.add(pool[j][0]);pool[j][1](r);state.featureRooms.push({name:pool[j][0],x:r.x,y:r.y,w:r.w,h:r.h})}if(state.featureRooms.length)addLog(`특수방 감지: ${state.featureRooms.map(v=>v.name).join(' / ')}`)}
  function applyStrategy(){state.player.upgradeMarks=state.player.upgradeMarks||0;state.floorTrait47=trait47();if(state.floorTrait47){const n=state.floorTrait47[0];if(n==='보급')place47(deckPick47(ordinaryPotionPool(false),'traitRecover'));else if(n==='경계'){place47(deckPick47(gear47(Math.min(5,tierForFloor()+1)),'traitGear'));const d=choice(floorEnemyDefinitions());if(d){const m=scaledMonster(d),p=PlacementService.randomMonsterCell(m);if(p){Object.assign(m,p);OccupancyService.addMonster(m)}}}else if(n==='불온'){for(let i=0;i<2;i++){const p=PlacementService.randomFloor(0,{avoidSafeChoice:true});if(state.map[p.y][p.x]===TT.FLOOR)setTerrainTile58(state.map,p.x,p.y,TT.TRAP)}place47(deckPick47(ordinaryPotionPool(true),'traitTactic'))}else if(n==='비밀'){const p=PlacementService.randomFloor(0);setTerrainTile58(state.map,p.x,p.y,TT.CACHE);const rr=relics47();if(rr.length&&globalThis.__MANRU_RANDOM57__()<.55)place47(choice(rr))}}VisibilityService.compute();vfBuildDecor();P47.force=true;P47.cullKey=''}
  function freeRoomCell(fr){const a=[];for(let y=fr.y+1;y<fr.y+fr.h-1;y++)for(let x=fr.x+1;x<fr.x+fr.w-1;x++)if(ReachabilityService.playerPassable(x,y)&&state.map[y][x]!==TT.STAIR&&!state.items.some(i=>i.x===x&&i.y===y)&&!OccupancyService.isOccupied(x,y)&&(x!==state.player.x||y!==state.player.y))a.push({x,y});return a.length?choice(a):null}
  function addRoomPotion(fr,kinds){const pool=kinds.map(k=>POTION_BY_KIND.get(k)).filter(Boolean).filter(p=>state.floor>=(p.minFloor||1)),p=freeRoomCell(fr);if(!pool.length||!p)return false;const item=clone(choice(pool));Object.assign(item,{x:p.x,y:p.y,count:1});decoratePotion56(item,p.x,p.y);PlacementService.placeItem(item);return true}
  function addRoomTalisman(fr){const p=freeRoomCell(fr),t=talismanPick56();if(!p||!t)return false;Object.assign(t,{x:p.x,y:p.y,count:1});PlacementService.placeItem(t);return true}
  function insideMapInterior(x,y){return x>0&&y>0&&x<COLS-1&&y<ROWS-1}
/* ===== MANRU v6.0: SPECIAL FLOOR / BOSS ARENA / PALETTE OVERHAUL ===== */
const HIDDEN_ROUTE_STATE={revision:3,hiddenSeq:0,lastFloor:0};
  function registerHidden(cells,type,replacement,label,baseTile){
    const id='h'+(++HIDDEN_ROUTE_STATE.hiddenSeq);const keys=[];
    for(const c of cells){
      if(c.x<=0||c.y<=0||c.x>=COLS-1||c.y>=ROWS-1)continue;
      if(state.map[c.y][c.x]!==baseTile)continue;
      const kk=k(c.x,c.y);setTerrainTile58(state.map,c.x,c.y,type);state.hiddenLookup60[kk]=id;state.hiddenBase60[kk]=baseTile;state.hiddenReplacement60[kk]=replacement;keys.push(kk)
    }
    if(keys.length)state.hiddenGroups60[id]={keys,label,replacement};return keys.length?id:null;
  }
  function fillMap(m,t){for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)setTerrainTile58(m,x,y,t)}
  function roomRect(x,y,w,h){return{x,y,w,h,cx:x+Math.floor(w/2),cy:y+Math.floor(h/2)}}
  function addBoxRoom(m,x,y,w,h,t=TT.FLOOR,register=true){
    x=Math.max(1,Math.min(COLS-w-1,x));y=Math.max(1,Math.min(ROWS-h-1,y));
    for(let yy=y+1;yy<y+h-1;yy++)for(let xx=x+1;xx<x+w-1;xx++)setTerrainTile58(m,xx,yy,t);
    const r=roomRect(x,y,w,h);if(register)state.rooms.push(r);return r;
  }
  function openRect(m,x,y,w,h,t=TT.FLOOR){for(let yy=Math.max(1,y);yy<Math.min(ROWS-1,y+h);yy++)for(let xx=Math.max(1,x);xx<Math.min(COLS-1,x+w);xx++)setTerrainTile58(m,xx,yy,t)}
  function walledBox(m,x,y,w,h,t=TT.FLOOR,register=true){
    x=Math.max(1,Math.min(COLS-w-1,x));y=Math.max(1,Math.min(ROWS-h-1,y));
    for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)setTerrainTile58(m,xx,yy,(xx===x||yy===y||xx===x+w-1||yy===y+h-1)?TT.WALL:t);
    const r=roomRect(x,y,w,h);if(register)state.rooms.push(r);return r;
  }
  function hiddenRouteCells(m,a,b,base){
    const out=[];let x=a.x,y=a.y,flip=true,guard=0;
    while((x!==b.x||y!==b.y)&&guard++<900){
      if(x!==b.x&&y!==b.y){if(flip)x+=Math.sign(b.x-x);else y+=Math.sign(b.y-y);flip=!flip}else if(x!==b.x)x+=Math.sign(b.x-x);else y+=Math.sign(b.y-y);
      if(in60(x,y)&&m[y][x]===base)out.push({x,y});
    }
    return out;
  }
  function phaseRoute(m,a,b,fragile=false){
    let x=a.x,y=a.y,step=0;const points=[];
    const walkTo=(tx,ty)=>{while(x!==tx||y!==ty){if(x!==tx)x+=Math.sign(tx-x);else y+=Math.sign(ty-y);step++;if(step%4===0||(x===tx&&y===ty)){if(in60(x,y)&&m[y][x]===TT.VOID){setTerrainTile58(m,x,y,TT.FLOOR);points.push({x,y});if(fragile&&points.length%2===1)markCrumble(x,y,TT.VOID)}}}};
    const turnPad=(cx,cy)=>{for(let oy=-1;oy<=1;oy++)for(let ox=-1;ox<=1;ox++){const xx=cx+ox,yy=cy+oy;if(!in60(xx,yy))continue;if(m[yy][xx]===TT.VOID||m[yy][xx]===TT.CRUMBLE){setTerrainTile58(m,xx,yy,TT.FLOOR);if(state.crumbleBase60)delete state.crumbleBase60[k(xx,yy)]}}};
    const horizontalFirst=globalThis.__MANRU_RANDOM57__()<.5;
    if(horizontalFirst){walkTo(b.x,a.y);if(a.x!==b.x&&a.y!==b.y)turnPad(b.x,a.y);walkTo(b.x,b.y)}
    else{walkTo(a.x,b.y);if(a.x!==b.x&&a.y!==b.y)turnPad(a.x,b.y);walkTo(b.x,b.y)}
    return points;
  }
  function carveBlob(m,cx,cy,rx,ry,t=TT.FLOOR,register=true){
    for(let y=Math.max(1,cy-ry-1);y<=Math.min(ROWS-2,cy+ry+1);y++)for(let x=Math.max(1,cx-rx-1);x<=Math.min(COLS-2,cx+rx+1);x++){
      const nx=(x-cx)/(rx+.25),ny=(y-cy)/(ry+.25),noise=(hash2(x,y,state.floor+600)-.5)*.25;if(nx*nx+ny*ny+noise<=1)setTerrainTile58(m,x,y,t);
    }
    setTerrainTile58(m,cx,cy,t);const r=roomRect(cx-rx-1,cy-ry-1,rx*2+3,ry*2+3);if(register)state.rooms.push(r);return r;
  }
  function carveLine(m,x0,y0,x1,y1,t=TT.FLOOR,w=1){
    let x=x0,y=y0,guard=0;while((x!==x1||y!==y1)&&guard++<900){for(let oy=-Math.floor(w/2);oy<=Math.floor(w/2);oy++)for(let ox=-Math.floor(w/2);ox<=Math.floor(w/2);ox++)if(in60(x+ox,y+oy))setTerrainTile58(m,x+ox,y+oy,t);if(x!==x1)x+=Math.sign(x1-x);else if(y!==y1)y+=Math.sign(y1-y)}
    for(let oy=-Math.floor(w/2);oy<=Math.floor(w/2);oy++)for(let ox=-Math.floor(w/2);ox<=Math.floor(w/2);ox++)if(in60(x+ox,y+oy))setTerrainTile58(m,x+ox,y+oy,t);
  }
  function stairLine(m,a,b,t=TT.FLOOR,w=1){
    let x=a.x,y=a.y,flip=true,guard=0;while((x!==b.x||y!==b.y)&&guard++<900){for(let oy=-Math.floor(w/2);oy<=Math.floor(w/2);oy++)for(let ox=-Math.floor(w/2);ox<=Math.floor(w/2);ox++)if(in60(x+ox,y+oy))setTerrainTile58(m,x+ox,y+oy,t);if(x!==b.x&&y!==b.y){if(flip)x+=Math.sign(b.x-x);else y+=Math.sign(b.y-y);flip=!flip}else if(x!==b.x)x+=Math.sign(b.x-x);else y+=Math.sign(b.y-y)}
  }
  function doorPoint(r,to){
    const dx=to.x-r.cx,dy=to.y-r.cy;if(Math.abs(dx)>=Math.abs(dy)){const east=dx>=0;return{x:east?r.x+r.w-1:r.x,y:clamp(to.y,r.y+2,r.y+r.h-3),ox:east?r.x+r.w:r.x-1,oy:clamp(to.y,r.y+2,r.y+r.h-3)}}
    const south=dy>=0;return{x:clamp(to.x,r.x+2,r.x+r.w-3),y:south?r.y+r.h-1:r.y,ox:clamp(to.x,r.x+2,r.x+r.w-3),oy:south?r.y+r.h:r.y-1};
  }
  function connectBox(m,a,b,mode='L'){
    const da=doorPoint(a,b),db=doorPoint(b,a);if(in60(da.x,da.y))setTerrainTile58(m,da.x,da.y,TT.DOOR);if(in60(db.x,db.y))setTerrainTile58(m,db.x,db.y,TT.DOOR);if(in60(da.ox,da.oy))setTerrainTile58(m,da.ox,da.oy,TT.FLOOR);if(in60(db.ox,db.oy))setTerrainTile58(m,db.ox,db.oy,TT.FLOOR);
    const A={x:da.ox,y:da.oy},B={x:db.ox,y:db.oy};if(mode==='diag')stairLine(m,A,B,TT.FLOOR,1);else if(mode==='Z'){const mid={x:Math.round((A.x+B.x)/2),y:A.y};carveLine(m,A.x,A.y,mid.x,mid.y);carveLine(m,mid.x,mid.y,mid.x,B.y);carveLine(m,mid.x,B.y,B.x,B.y)}else{if(globalThis.__MANRU_RANDOM57__()<.5){carveLine(m,A.x,A.y,B.x,A.y);carveLine(m,B.x,A.y,B.x,B.y)}else{carveLine(m,A.x,A.y,A.x,B.y);carveLine(m,A.x,B.y,B.x,B.y)}}
  }
  function carveBridge(m,a,b,t=TT.PAPER_BRIDGE,w=1){
    let x=a.x,y=a.y;const tx=b.x,ty=b.y,hor=Math.abs(tx-x)>=Math.abs(ty-y);const paint=()=>{for(let o=-Math.floor(w/2);o<=Math.floor(w/2);o++){const xx=hor?x:x+o,yy=hor?y+o:y;if(in60(xx,yy)&&[TT.WATER,TT.MERCURY,TT.VOID,TT.HIDDEN_BRIDGE].includes(m[yy][xx]))setTerrainTile58(m,xx,yy,t)}};
    while(x!==tx){x+=Math.sign(tx-x);paint()}while(y!==ty){y+=Math.sign(ty-y);paint()}
  }
  function markCrumble(x,y,base=TT.VOID){
    if(!in60(x,y))return;
    if(state.map[y][x]===base)setTerrainTile58(state.map,x,y,TT.FLOOR);
    if(state.map[y][x]===TT.FLOOR){setTerrainTile58(state.map,x,y,TT.CRUMBLE);state.crumbleBase60[k(x,y)]=base}
  }
  function setEnds(start,exit){state.fixedStart={...start};state.fixedExit={...exit};state.player.x=start.x;state.player.y=start.y;state.stairs={...exit};setTerrainTile58(state.map,exit.x,exit.y,TT.STAIR)}
  function addTag(x,y,label){return state.map[y]?.[x]===TT.FLOOR}
  /* ---------- 2F: grand hall with stage, side service corridors, secret cellar ---------- */
  function buildFloor2GreatHall(m){
    fillMap(m,TT.WALL);state.rooms=[];state.routeTags=[];
    const cx=Math.floor(COLS/2),v=state.floorSeed60%3;state.earlyHallVariant58=v;
    const room=(x,y,w,h,name)=>{openRect(m,x,y,w,h);const r=roomRect(x,y,w,h);state.rooms.push(r);return{...r,name}};
    const foyer=room(cx-16,38,33,ROWS-39,'대연회 진입 회랑'),hub1=room(cx-14,35,29,3,'첫 선택 전실'),hub2=room(cx-14,20,29,3,'합류 휴게 회랑'),end=room(cx-10,3,21,5,'공통 보상 회랑');
    carveLine(m,cx,37,cx,39,TT.FLOOR,3);
    const paths=[
      [[cx-5,33],[5,33],[5,29],[17,29],[17,31],[29,31],[29,27],[5,27],[5,23],[cx-5,23],[cx-5,22]],
      [[cx+5,33],[53+v,33],[53+v,29],[66,29],[66,24],[cx+5,24],[cx+5,22]],
      [[cx-5,18],[24-v,18],[24-v,14],[10,14],[10,9],[cx-5,9],[cx-5,7]],
      [[cx+5,18],[78,18],[78,14],[65,14],[65,16],[53,16],[53,12],[78,12],[78,8],[cx+5,8],[cx+5,7]]
    ];
    const routeCells=paths.map(()=>new Set()),safeCells=[];
    paths.forEach((ps,i)=>{const width=i===1||i===2?3:1;for(let j=1;j<ps.length;j++){
      const a=ps[j-1],b=ps[j];carveLine(m,...a,...b,i===0?TT.CARPET:i===1||i===2?TT.STONE_PATH:TT.FLOOR,width);
      for(let y=Math.min(a[1],b[1])-Math.floor(width/2);y<=Math.max(a[1],b[1])+Math.floor(width/2);y++)for(let x=Math.min(a[0],b[0])-Math.floor(width/2);x<=Math.max(a[0],b[0])+Math.floor(width/2);x++)routeCells[i].add(k(x,y));
    }});
    // Walled switchbacks feed separate guard pockets and reward rooms through narrow mouths.
    const chambers=[{x:1,y:24,w:3,h:3,route:0},{x:39,y:29,w:5,h:3,route:0},{x:80,y:14,w:4,h:3,route:3},{x:44,y:10,w:5,h:2,route:3}];
    for(const r of chambers){openRect(m,r.x,r.y,r.w,r.h);for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++)routeCells[r.route].add(k(x,y))}
    const spurs=[{route:0,points:[[5,25],[2,25]]},{route:0,points:[[29,27],[41,27],[41,30]]},{route:3,points:[[78,15],[82,15]]},{route:3,points:[[53,12],[48,12],[48,10]]}];
    for(const spur of spurs)for(let j=1;j<spur.points.length;j++){const a=spur.points[j-1],b=spur.points[j];carveLine(m,...a,...b,spur.route===0?TT.CARPET:TT.DARK_WOOD,1);for(let y=Math.min(a[1],b[1]);y<=Math.max(a[1],b[1]);y++)for(let x=Math.min(a[0],b[0]);x<=Math.max(a[0],b[0]);x++)routeCells[spur.route].add(k(x,y))}
    for(const [x,y]of [[4,25],[41,28],[79,15],[49,12]])setTerrainTile58(m,x,y,TT.DOOR);
    // Water remains alongside the walkways, with stone crossings at the intersections.
    const waterCells=[];
    for(const [x0,x1,y]of[[9,22,32],[45,65,26],[11,23,16],[49,66,7]])for(let x=x0;x<=x1;x++){
      if(m[y][x]===TT.WALL){setTerrainTile58(m,x,y,TT.WATER);waterCells.push({x,y})}
      else if(m[y][x]===TT.FLOOR)setTerrainTile58(m,x,y,TT.DRAWBRIDGE_DOWN);
    }
    for(const [x,y,t]of[[1,24,TT.ARMORY],[39,29,TT.CRATE],[43,29,TT.TABLE],[80,14,TT.INCENSE_STAND],[83,16,TT.RACK],[55,25,TT.LANTERN_POST],[62,28,TT.BENCH],[16,10,TT.LANTERN_POST],[22,17,TT.PAPER_CRANE],[10,33,TT.TRAP],[23,31,TT.TRAP],[71,18,TT.SNARE],[53,14,TT.TRAP]])if(m[y]?.[x]!==TT.WALL)setTerrainTile58(m,x,y,t);
    for(const i of [1,2])safeCells.push(...routeCells[i]);
    const rewardSpots={0:[{x:2,y:25},{x:41,y:31},{x:20,y:31}],3:[{x:82,y:15},{x:46,y:10},{x:57,y:16}]};
    const encounters={0:[{x:31,y:33,names:['취객','시종']},{x:9,y:29,names:['떠돌이 도둑']},{x:26,y:27,names:['취객','시종']},{x:41,y:30,names:['객잔 경비병']}],3:[{x:71,y:18,names:['떠돌이 도둑','객잔 쥐']},{x:58,y:16,names:['시종']},{x:46,y:10,names:['떠돌이 도둑']},{x:82,y:15,names:['시종']}]};
    const branches=routeCells.map((cells,i)=>({id:i,kind:['danger','safe','safe','unknown'][i],cells:[...cells],spine:paths[i].map(([x,y])=>({x,y})),reward:rewardSpots[i]?.[0]||null,rewardSpots:rewardSpots[i]||[],encounters:encounters[i]||[],bonusCount:i===0?6:i===3?5:0}));
    // Exit seals separate each route from its merge hall. Their keys exist only inside that route.
    for(const y of [22,7])for(let x=1;x<COLS-1;x++)setTerrainTile58(m,x,y,TT.WALL);
    const exitIds=['f2-danger-exit','f2-east-safe-exit','f2-west-safe-exit','f2-unknown-exit'];
    for(const branch of branches){const x=branch.id%2?cx+5:cx-5,y=branch.id<2?22:7;branch.exitSeal={keyId:exitIds[branch.id],key:{x,y:y+1},wall:{x,y}};setTerrainTile58(m,x,y,TT.LOCKED_GATE);setTerrainTile58(m,x,y+1,TT.KEY_TILE)}
    // Door throats are one tile wide. Window cells stay solid; only sight can cross them.
    for(const y of [34,19]){for(let x=1;x<COLS-1;x++)setTerrainTile58(m,x,y,TT.WALL);for(const x of[cx-5,cx+5])setTerrainTile58(m,x,y,TT.DOOR)}
    for(const [x,y]of[[cx-8,34],[cx+8,34],[cx-8,19]])setTerrainTile58(m,x,y,TT.WINDOW,{base:TT.WALL,attachment:'wall'});
    for(let y=39;y<=47;y++)for(let x=cx-1;x<=cx+1;x++)setTerrainTile58(m,x,y,TT.CARPET);
    for(const y of[40,44,47])for(const x of[cx-12,cx+12])setTerrainTile58(m,x,y,TT.STONE_PILLAR);
    for(const y of[39,43,47])for(const x of[cx-9,cx+9])setTerrainTile58(m,x,y,TT.LANTERN_POST);
    for(const y0 of[40,48])for(const side of[-1,1]){const x0=side<0?cx-14:cx+7;for(let y=y0;y<y0+6;y++)for(let x=x0;x<x0+8;x++)if(x===x0||x===x0+7||y===y0||y===y0+5)setTerrainTile58(m,x,y,TT.WALL);setTerrainTile58(m,side<0?x0+7:x0,y0+3,TT.DOOR);setTerrainTile58(m,x0+3,y0+2,TT.TABLE);setTerrainTile58(m,x0+3,y0+4,TT.BENCH);}
    setTerrainTile58(m,cx+9,32,TT.LANTERN_POST);
    for(const [x,y]of[[cx-9,2],[cx+9,2],[cx-14,37],[cx+14,37]])if(m[y][x]===TT.WALL)setTerrainTile58(m,x,y,TT.WALL_BANNER);
    const west=room(9,40,11,8,'공용 준비실'),east=room(57,40,11,8,'공용 식당');carveLine(m,19,43,28,43,TT.FLOOR,1);carveLine(m,54,43,57,43,TT.FLOOR,1);
    for(const [x,y,t]of[[12,42,TT.RACK],[16,45,TT.BENCH],[60,42,TT.COOKPOT],[64,45,TT.TABLE],[26,36,TT.LANTERN_POST],[50,21,TT.LANTERN_POST],[30,5,TT.LANTERN_POST],[46,5,TT.LANTERN_POST]])setTerrainTile58(m,x,y,t);
    state.floor2Choice63={version:5,branches,waterCells,safeCells,commonZones:[foyer,hub1,hub2,end,west,east],stages:[{keyId:'choice-copper',key:{x:cx,y:36},doors:[{x:cx-5,y:34,label:'위험한 복도',branch:0},{x:cx+5,y:34,label:'안전한 복도',branch:1}]},{keyId:'choice-silver',key:{x:cx,y:21},doors:[{x:cx-5,y:19,label:'안전한 복도',branch:2},{x:cx+5,y:19,label:'미지의 복도',branch:3}]}]};
    state.featureRooms=[foyer,hub1,hub2,end,west,east];
    state.routeTags=[{x:cx,y:36,label:'동제 갈림열쇠 · 두 문 중 한 문만'},{x:cx-5,y:35,label:'피 묻은 창호 · 위험한 복도'},{x:cx+5,y:35,label:'등불 켜진 창호 · 안전한 복도'},{x:cx,y:21,label:'은제 갈림열쇠 · 두 문 중 한 문만'},{x:cx+5,y:20,label:'창 없는 회랑 · 미지의 복도'}];
    state.layoutName='백석연 · 삼중 굽이와 매복 측실 / 두 번의 선택 · 공통 보급실';setEnds({x:cx,y:ROWS-4},{x:cx,y:5});
  }
  /* ---------- 4F: + / X / Y double-junction choice floor ---------- */
  function buildChoice(m){
    fillMap(m,TT.WALL);state.rooms=[];state.routeTags=[];const cx=Math.floor(COLS/2),cy=Math.floor(ROWS/2),variant=state.floorSeed60%3;state.choiceVariant60=variant;
    const start=addBoxRoom(m,1,cy-4,10,9),exit=addBoxRoom(m,COLS-11,cy-4,10,9),j1={x:17,y:cy},j2={x:COLS-18,y:cy};
    openRect(m,j1.x-2,j1.y-2,5,5);openRect(m,j2.x-2,j2.y-2,5,5);carveLine(m,start.x+start.w-2,cy,j1.x,cy,TT.FLOOR,3);carveLine(m,j2.x,cy,exit.x+1,cy,TT.FLOOR,3);
    const ys=[7,cy,ROWS-8];
    if(variant===0){
      for(const y of ys){carveLine(m,j1.x,y,j2.x,y,TT.FLOOR,3);carveLine(m,j1.x,cy,j1.x,y,TT.FLOOR,3);carveLine(m,j2.x,cy,j2.x,y,TT.FLOOR,3)}
      state.layoutName='큰 복도 · 이중 +자 선택로';
    }else if(variant===1){
      for(const y of ys){stairLine(m,{x:j1.x,y:cy},{x:cx,y},TT.FLOOR,3);stairLine(m,{x:cx,y},{x:j2.x,y:cy},TT.FLOOR,3)}
      state.layoutName='큰 복도 · 이중 X자 교차로';
    }else{
      for(const y of ys){stairLine(m,{x:j1.x,y:cy},{x:cx-2,y},TT.FLOOR,3);stairLine(m,{x:cx+2,y},{x:j2.x,y:cy},TT.FLOOR,3)}
      carveLine(m,cx-2,ys[0],cx+2,ys[0],TT.FLOOR,3);carveLine(m,cx-2,ys[1],cx+2,ys[1],TT.FLOOR,3);carveLine(m,cx-2,ys[2],cx+2,ys[2],TT.FLOOR,3);
      state.layoutName='큰 복도 · 이중 Y자 합류로';
    }
    const names=['안전 · 보급로','무 · 병기고','위험 · 보물로'],tiles=[TT.CACHE,TT.ARMORY,TT.VAULT];
    ys.forEach((y,i)=>{const r=addBoxRoom(m,cx-5,y-4,11,9);setTerrainTile58(m,r.cx,r.cy,tiles[i]);if(i===2){setTerrainTile58(m,r.cx-2,r.cy,TT.TRAP);setTerrainTile58(m,r.cx+2,r.cy,TT.TRAP)}addTag(j1.x+2,y,names[i]);addTag(j2.x-2,y,names[i])});
    // Six attached side chambers make each route a real wing rather than a bare lane.
    state.featureRooms=state.featureRooms||[];state.itemBiasZones94=state.itemBiasZones94||[];let sideMade=0;
    const sideXs=[Math.floor((j1.x+cx)/2),Math.floor((cx+j2.x)/2)];
    const wallRect=(x,y,w,h)=>{for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)if(!in60(xx,yy)||m[yy][xx]!==TT.WALL)return false;return true};
    ys.forEach((routeY,ri)=>sideXs.forEach((sx,si)=>{const below=ri===0||(ri===1&&si===0),w=9,h=7,rx=clamp(sx-Math.floor(w/2),2,COLS-w-2),ry=below?routeY+4:routeY-h-3;if(!wallRect(rx,ry,w,h))return;const r=walledBox(m,rx,ry,w,h,TT.FLOOR,true),dx=r.cx,dy=below?r.y:r.y+r.h-1,oy=below?dy-1:dy+1;setTerrainTile58(m,dx,dy,TT.DOOR);carveLine(m,dx,oy,dx,routeY,TT.FLOOR,1);const ft=(ri+si)%3===0?TT.CACHE:(ri+si)%3===1?TT.FOUNTAIN:TT.RUMOR;setTerrainTile58(m,r.cx,r.cy,ft);if(m[r.cy][r.x+2]===TT.FLOOR)setTerrainTile58(m,r.x+2,r.cy,TT.STONE_PILLAR);if(m[r.cy][r.x+r.w-3]===TT.FLOOR)setTerrainTile58(m,r.x+r.w-3,r.cy,TT.STONE_PILLAR);const fr={name:['보급 측실','휴식 감실','기록 측실'][(ri+si)%3],x:r.x,y:r.y,w:r.w,h:r.h};state.featureRooms.push(fr);state.itemBiasZones94.push(fr);sideMade++}));
    state.choiceSideRooms95=sideMade;state.layoutName+=' / 부속 측실군';
    const hidden=[];for(let y=ys[0]+3;y<=ys[2]-3;y++)hidden.push({x:cx,y});registerHidden(hidden,TT.HIDDEN_WALL,TT.FLOOR,'세 갈래를 잇는 종업원 비밀 통로',TT.WALL);
    setEnds({x:start.cx,y:start.cy},{x:exit.cx,y:exit.cy});
  }
  /* ---------- 6F: organic pavilion archipelago with loops and hidden reed bridge ---------- */
  function buildPavilion(m){
    fillMap(m,TT.WATER);state.rooms=[];state.routeTags=[];const cy=Math.floor(ROWS/2);
    const pts=[[6,ROWS-7,3,3],[17,ROWS-9,3,2],[30,ROWS-6,4,3],[44,ROWS-10,3,3],[COLS-7,ROWS-7,3,3],[9,cy,3,3],[23,cy+2,3,2],[35,cy,5,4],[49,cy-2,3,3],[COLS-8,cy+2,3,2],[8,7,3,3],[23,8,3,2],[39,7,3,3],[COLS-8,7,3,3]];
    const islands=pts.map(([x,y,rx,ry])=>carveBlob(m,x,y,rx,ry,TT.FLOOR));
    const edges=[[0,1],[1,2],[2,3],[3,4],[0,5],[1,6],[2,7],[3,8],[4,9],[5,6],[6,7],[7,8],[8,9],[5,10],[6,11],[7,12],[8,13],[10,11],[11,12],[12,13],[1,5],[3,9],[7,11]];
    for(const [a,b] of edges)carveBridge(m,{x:islands[a].cx,y:islands[a].cy},{x:islands[b].cx,y:islands[b].cy},TT.PAPER_BRIDGE,1);
    const roles=[[7,TT.PAVILION],[11,TT.FOUNTAIN],[2,TT.CACHE],[8,TT.RUMOR],[12,TT.ARMORY],[5,TT.BRAZIER],[9,TT.TRAP]];for(const [i,t] of roles)setTerrainTile58(m,islands[i].cx,islands[i].cy,t);
    const secret=carveBlob(m,3,14,2,2,TT.FLOOR);setTerrainTile58(m,secret.cx,secret.cy,TT.VAULT);const cells=hiddenRouteCells(m,{x:secret.cx,y:secret.cy},{x:islands[10].cx,y:islands[10].cy},TT.WATER);registerHidden(cells,TT.HIDDEN_BRIDGE,TT.PAPER_BRIDGE,'수초 밑 비밀 나무발판',TT.WATER);

    const nearBridge=(x,y)=>DIRS4.some(([dx,dy])=>[TT.PAPER_BRIDGE,TT.HIDDEN_BRIDGE].includes(m[y+dy]?.[x+dx]));
    const addCanopy=(isl,strong=false)=>{
      for(let y=isl.y;y<isl.y+isl.h;y++)for(let x=isl.x;x<isl.x+isl.w;x++){
        if(m[y]?.[x]!==TT.FLOOR)continue;
        if(nearBridge(x,y))continue;
        const waterAdj=DIRS4.reduce((n,[dx,dy])=>n+(m[y+dy]?.[x+dx]===TT.WATER?1:0),0);
        const d=Math.abs(x-isl.cx)+Math.abs(y-isl.cy);
        if(waterAdj>=1&&d>=2&&hash2(x,y,611)<(strong?.42:.26))setTerrainTile58(m,x,y,TT.HEDGE);
      }
      const picks=[[isl.cx-1,isl.cy-1],[isl.cx+1,isl.cy-1],[isl.cx-1,isl.cy+1],[isl.cx+1,isl.cy+1],[isl.cx,isl.cy-2],[isl.cx,isl.cy+2]];
      for(const [x,y] of picks)if(in60(x,y)&&m[y][x]===TT.FLOOR&&!nearBridge(x,y)&&hash2(x,y,613)<(strong?.95:.65))setTerrainTile58(m,x,y,peachTerrain());
    };
    islands.forEach((isl,i)=>addCanopy(isl,i===7||i===2||i===12));
    const hub=islands[7];
    for(let x=hub.x+1;x<hub.x+hub.w-1;x++){
      if(m[hub.y+1][x]===TT.FLOOR&&Math.abs(x-hub.cx)>1)setTerrainTile58(m,x,hub.y+1,TT.HEDGE);
      if(m[hub.y+hub.h-2][x]===TT.FLOOR&&Math.abs(x-hub.cx)>1)setTerrainTile58(m,x,hub.y+hub.h-2,TT.HEDGE);
    }
    for(let y=hub.y+1;y<hub.y+hub.h-1;y++){
      if(m[y][hub.x+1]===TT.FLOOR&&Math.abs(y-hub.cy)>1)setTerrainTile58(m,hub.x+1,y,TT.HEDGE);
      if(m[y][hub.x+hub.w-2]===TT.FLOOR&&Math.abs(y-hub.cy)>1)setTerrainTile58(m,hub.x+hub.w-2,y,TT.HEDGE);
    }
    for(const [x,y] of [[hub.cx-2,hub.cy-1],[hub.cx+2,hub.cy-1],[hub.cx-2,hub.cy+1],[hub.cx+2,hub.cy+1]])if(in60(x,y)&&m[y][x]===TT.FLOOR)setTerrainTile58(m,x,y,peachTerrain());
    for(const [x,y] of [[hub.cx,hub.y+1],[hub.cx,hub.y+hub.h-2],[hub.x+1,hub.cy],[hub.x+hub.w-2,hub.cy]])if(m[y][x]===TT.HEDGE)setTerrainTile58(m,x,y,TT.FLOOR);
    for(const [idx,dir] of [[2,-1],[3,1],[10,-1],[13,1]]){const isl=islands[idx];for(let x=isl.x+1;x<isl.x+isl.w-1;x++)if(m[isl.cy+dir]?.[x]===TT.FLOOR&&hash2(x,isl.cy,617)<.65)setTerrainTile58(m,x,isl.cy+dir,TT.HEDGE);}

    state.featureRooms=[{name:'중앙 수목원 대정자',x:islands[7].x,y:islands[7].y,w:islands[7].w,h:islands[7].h},{name:'갈대 속 보물섬',x:secret.x,y:secret.y,w:secret.w,h:secret.h},{name:'남단 목책 정원',x:islands[2].x,y:islands[2].y,w:islands[2].w,h:islands[2].h}];
    state.layoutName='수중 수목원 정자 군도 · 열네 정자 / 목책 정원 / 갈대 비밀섬';setEnds({x:islands[0].cx,y:islands[0].cy},{x:islands[13].cx,y:islands[13].cy});
  }
  /* ---------- 8F: broad bamboo maze with clearings and cuttable hidden passage ---------- */
  function buildBamboo(m){
    fillMap(m,TT.BAMBOO);state.rooms=[roomRect(1,1,COLS-2,ROWS-2)];state.visionPenalty=3;state.routeTags=[];
    const xs=[],ys=[];for(let x=4;x<COLS-4;x+=7)xs.push(x);for(let y=4;y<ROWS-4;y+=7)ys.push(y);const cells=[];for(let j=0;j<ys.length;j++)for(let i=0;i<xs.length;i++)cells.push({i,j,x:xs[i],y:ys[j]});
    const by=(i,j)=>cells.find(c=>c.i===i&&c.j===j),seen=new Set(['0,0']),stack=[by(0,0)];openRect(m,2,2,5,5,TT.FLOOR);
    while(stack.length){const c=stack[stack.length-1],ns=[[1,0],[-1,0],[0,1],[0,-1]].map(([di,dj])=>({i:c.i+di,j:c.j+dj})).filter(n=>n.i>=0&&n.i<xs.length&&n.j>=0&&n.j<ys.length&&!seen.has(n.i+','+n.j));if(!ns.length){stack.pop();continue}const n=choice(ns),d=by(n.i,n.j);seen.add(n.i+','+n.j);openRect(m,d.x-2,d.y-2,5,5,TT.FLOOR);carveLine(m,c.x,c.y,d.x,d.y,TT.FLOOR,3);stack.push(d)}
    for(let i=0;i<12;i++){const a=choice(cells),ns=cells.filter(b=>Math.abs(a.i-b.i)+Math.abs(a.j-b.j)===1);if(ns.length){const b=choice(ns);carveLine(m,a.x,a.y,b.x,b.y,TT.FLOOR,3)}}
    const clear=[cells[Math.floor(cells.length*.20)],cells[Math.floor(cells.length*.43)],cells[Math.floor(cells.length*.66)],cells[Math.floor(cells.length*.84)]];clear.forEach((c,i)=>{carveBlob(m,c.x,c.y,4,3,TT.FLOOR,false);setTerrainTile58(m,c.x,c.y,[TT.PAVILION,TT.CACHE,TT.BRAZIER,TT.ALTAR][i])});
    const a=clear[0],b=clear[2],hidden=[];let x=a.x,y=a.y;while(x!==b.x){x+=Math.sign(b.x-x);if(m[y][x]===TT.BAMBOO)hidden.push({x,y})}while(y!==b.y){y+=Math.sign(b.y-y);if(m[y][x]===TT.BAMBOO)hidden.push({x,y})}let bambooHidden=registerHidden(hidden,TT.HIDDEN_WALL,TT.FLOOR,'숲꾼이 감춰 둔 대나무 샛길',TT.BAMBOO);if(!bambooHidden){outer:for(let yy=2;yy<ROWS-2;yy++)for(let xx=2;xx<COLS-2;xx++)if(m[yy][xx]===TT.BAMBOO&&DIRS4.some(([dx,dy])=>m[yy+dy]?.[xx+dx]===TT.FLOOR)){bambooHidden=registerHidden([{x:xx,y:yy}],TT.HIDDEN_WALL,TT.FLOOR,'숲꾼이 감춰 둔 대나무 샛길',TT.BAMBOO);break outer}}
    for(let i=0;i<9;i++){const c=choice(cells);if(m[c.y][c.x]===TT.FLOOR&&globalThis.__MANRU_RANDOM57__()<.6)setTerrainTile58(m,c.x,c.y,TT.TRAP)}
    const last=cells[cells.length-1];state.layoutName='대나무 미로 · 넓은 죽림길 / 네 공터 / 비밀 벌목로';setEnds({x:cells[0].x,y:cells[0].y},{x:last.x,y:last.y});
  }
  /* ---------- 11F: meandering perfume river with three crossings, coves, secret sandbar ---------- */
  function buildRiver(m){
    fillMap(m,TT.WALL);state.rooms=[roomRect(1,1,COLS-2,ROWS-2)];state.rafts=[];state.routeTags=[];
    const center=[],base=Math.floor(ROWS/2);let cy=base;
    for(let x=2;x<COLS-2;x++){
      if(x%6===0)cy=clamp(cy+choice([-3,-2,-1,0,1,2,3]),10,ROWS-11);
      center[x]=cy;
      for(let y=cy-4;y<=cy+4;y++)setTerrainTile58(m,x,y,TT.WATER);
      if(in60(x,cy-5))setTerrainTile58(m,x,cy-5,TT.FLOOR);
      if(in60(x,cy+5))setTerrainTile58(m,x,cy+5,TT.FLOOR);
    }
    for(let x=Math.floor(COLS*.34);x<Math.floor(COLS*.66);x++){
      const y=center[x]+((x%8)<4?-7:7);
      for(let yy=y-2;yy<=y+2;yy++)if(in60(x,yy))setTerrainTile58(m,x,yy,TT.WATER);
      if(in60(x,y-3))setTerrainTile58(m,x,y-3,TT.FLOOR);
      if(in60(x,y+3))setTerrainTile58(m,x,y+3,TT.FLOOR);
    }

    const start=carveBlob(m,4,ROWS-4,4,4,TT.FLOOR),exit=carveBlob(m,COLS-5,4,4,4,TT.FLOOR);
    carveLine(m,start.cx,start.cy,10,center[10]+5,TT.FLOOR,2);
    carveLine(m,exit.cx,exit.cy,COLS-11,center[COLS-11]-5,TT.FLOOR,2);

    const islandSpecs=[
      {x:Math.floor(COLS*.20),y:base-1,rx:3,ry:3,t:TT.CACHE,side:'north'},
      {x:Math.floor(COLS*.42),y:base+3,rx:3,ry:3,t:TT.RUMOR,side:'south'},
      {x:Math.floor(COLS*.63),y:base-4,rx:3,ry:3,t:TT.CACHE,side:'north'},
      {x:Math.floor(COLS*.82),y:base+2,rx:4,ry:3,t:TT.FOUNTAIN,side:'south'}
    ];
    const landmarks=[];
    for(const spec of islandSpecs){
      const r=carveBlob(m,spec.x,spec.y,spec.rx,spec.ry,TT.FLOOR);setTerrainTile58(m,r.cx,r.cy,spec.t);landmarks.push(r);
      const bankY=spec.side==='north'?center[r.cx]-5:center[r.cx]+5;carveBridge(m,{x:r.cx,y:r.cy},{x:r.cx,y:bankY},TT.PAPER_BRIDGE,1);
      for(const [dx,dy] of [[-2,0],[2,0],[0,-2],[0,2]])if(in60(r.cx+dx,r.cy+dy)&&m[r.cy+dy][r.cx+dx]===TT.FLOOR&&hash2(r.cx+dx,r.cy+dy,1107)<.6)setTerrainTile58(m,r.cx+dx,r.cy+dy,TT.SCREEN);
    }

    const raftXs=[Math.floor(COLS*.29),Math.floor(COLS*.56),Math.floor(COLS*.87)];
    raftXs.forEach((x,i)=>{
      const top=center[x]-4,bottom=center[x]+4,y=center[x];
      setTerrainTile58(m,x,y,TT.RAFT);state.rafts.push({x,y,min:top,max:bottom,dir:i%2?1:-1});
      for(let dx=-2;dx<=2;dx++){
        if(in60(x+dx,top-1))setTerrainTile58(m,x+dx,top-1,TT.FLOOR);
        if(in60(x+dx,bottom+1))setTerrainTile58(m,x+dx,bottom+1,TT.FLOOR);
      }
      if(in60(x-2,top-1)&&m[top-1][x-2]===TT.FLOOR)setTerrainTile58(m,x-2,top-1,i===1?TT.BRAZIER:TT.FLOOR);
      if(in60(x+2,bottom+1)&&m[bottom+1][x+2]===TT.FLOOR&&i!==0)setTerrainTile58(m,x+2,bottom+1,TT.SCREEN);
    });

    const hx=Math.floor(COLS*.48),hc=[];for(let y=center[hx]-4;y<=center[hx]+4;y++)hc.push({x:hx,y});registerHidden(hc,TT.HIDDEN_BRIDGE,TT.PAPER_BRIDGE,'향수 아래 잠긴 돌다리',TT.WATER);
    const cove=addBoxRoom(m,COLS-14,ROWS-12,11,9);setTerrainTile58(m,cove.cx,cove.cy,TT.VAULT);registerHidden([{x:COLS-14,y:cove.cy}],TT.HIDDEN_WALL,TT.FLOOR,'향료상인의 숨은 보물굴',TT.WALL);
    for(let y=cove.y+1;y<cove.y+cove.h-1;y++)for(const x of [cove.x+2,cove.x+cove.w-3])if(m[y][x]===TT.FLOOR&&y%2===0)setTerrainTile58(m,x,y,TT.SCREEN);
    for(let x=cove.x+2;x<cove.x+cove.w-2;x+=3)if(m[cove.y+2][x]===TT.FLOOR)setTerrainTile58(m,x,cove.y+2,TT.JAR);

    state.featureRooms=[{name:'남안 시작섬',x:start.x,y:start.y,w:start.w,h:start.h},{name:'상류 도착섬',x:exit.x,y:exit.y,w:exit.w,h:exit.h},{name:'향료상인의 숨은 보물굴',x:cove.x,y:cove.y,w:cove.w,h:cove.h},{name:'중류 향섬',x:landmarks[1].x,y:landmarks[1].y,w:landmarks[1].w,h:landmarks[1].h}];
    state.layoutName='향수강 · 협곡 수로 / 뗏목 필수 도하 / 벽협 보물섬 / 숨은 향료굴';setEnds({x:start.cx,y:start.cy},{x:exit.cx,y:exit.cy});
  }
  /* ---------- 13F: irregular room maze with real doors, fake doors, loops, secret refuge ---------- */
  function buildFloor13RoomMaze(m){
    fillMap(m,TT.WALL);state.rooms=[];state.routeTags=[];const cols=5,rows=4,cw=Math.floor((COLS-4)/cols),ch=Math.floor((ROWS-4)/rows),grid=[];
    for(let gy=0;gy<rows;gy++){grid[gy]=[];for(let gx=0;gx<cols;gx++){const maxW=Math.max(7,cw-2),maxH=Math.max(6,ch-2),w=rand(6,maxW),h=rand(5,maxH),bx=2+gx*cw,by=2+gy*ch,x=bx+rand(0,Math.max(0,cw-w-1)),y=by+rand(0,Math.max(0,ch-h-1));grid[gy][gx]=addBoxRoom(m,x,y,w,h)}}
    const seen=new Set(['0,0']),stack=[[0,0]],edges=[];while(stack.length){const [x,y]=stack[stack.length-1],ns=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>[x+dx,y+dy]).filter(([nx,ny])=>nx>=0&&ny>=0&&nx<cols&&ny<rows&&!seen.has(nx+','+ny));if(!ns.length){stack.pop();continue}const n=choice(ns);seen.add(n[0]+','+n[1]);edges.push([[x,y],n]);stack.push(n)}
    edges.forEach(([[ax,ay],[bx,by]],i)=>connectBox(m,grid[ay][ax],grid[by][bx],i%3===0?'Z':i%3===1?'diag':'L'));
    for(let i=0;i<9;i++){const gx=rand(0,cols-1),gy=rand(0,rows-1),dirs=[[1,0],[0,1]],d=choice(dirs),nx=gx+d[0],ny=gy+d[1];if(nx<cols&&ny<rows)connectBox(m,grid[gy][gx],grid[ny][nx],globalThis.__MANRU_RANDOM57__()<.5?'L':'Z')}
    for(let i=0;i<24;i++){const r=choice(state.rooms),side=rand(0,3),p=side===0?{x:r.x+rand(2,r.w-3),y:r.y}:side===1?{x:r.x+r.w-1,y:r.y+rand(2,r.h-3)}:side===2?{x:r.x+rand(2,r.w-3),y:r.y+r.h-1}:{x:r.x,y:r.y+rand(2,r.h-3)};if(state.map[p.y][p.x]===TT.WALL)setTerrainTile58(state.map,p.x,p.y,globalThis.__MANRU_RANDOM57__()<.62?TT.FAKE_DOOR:TT.DOOR)}
    const secretHost=grid[1][2],partitionX=secretHost.x+2;for(let y=secretHost.y+1;y<secretHost.y+secretHost.h-1;y++)setTerrainTile58(m,partitionX,y,TT.WALL);registerHidden([{x:partitionX,y:secretHost.cy}],TT.HIDDEN_WALL,TT.OPEN_DOOR,'침모가 감춘 무음 대기실',TT.WALL);setTerrainTile58(m,secretHost.x+1,secretHost.cy,TT.CACHE);
    for(let i=0;i<18;i++){const r=choice(state.rooms),p={x:rand(r.x+1,r.x+r.w-2),y:rand(r.y+1,r.y+r.h-2)};if(state.map[p.y][p.x]===TT.FLOOR)setTerrainTile58(state.map,p.x,p.y,globalThis.__MANRU_RANDOM57__()<.62?TT.MIRROR:TT.SCREEN)}
    state.monsterDenseRooms=[grid[0][4],grid[1][2],grid[2][1],grid[3][3]];state.layoutName='방 미로 · 불규칙 객실 / 진짜 문 / 가짜 문 / 비밀 대기실';setEnds({x:grid[0][0].cx,y:grid[0][0].cy},{x:grid[3][4].cx,y:grid[3][4].cy});
  }
  /* ---------- 16F: three-stage fortress with optional hidden aqueduct/breach ---------- */
  function buildFloor16Fortress(m){
    fillMap(m,TT.WALL);state.rooms=[];state.routeTags=[];state.switches=[];state.cipher={secret:[1,2,3,4,5].sort(()=>globalThis.__MANRU_RANDOM57__()-.5),guess:[],history:[],solved:false};
    const cy=Math.floor(ROWS/2),fieldEnd=Math.floor(COLS*.27),moatL=fieldEnd+3,moatR=moatL+10,castleL=moatR+2,keepL=Math.floor(COLS*.72);
    // 외곽 초원과 돌길. 성채 자체는 회색 석재로 구성된다.
    openRect(m,1,1,fieldEnd,ROWS-2,TT.GRASS);state.rooms.push(roomRect(1,1,fieldEnd,ROWS-2));
    for(let y=3;y<ROWS-3;y++)for(let x=2;x<fieldEnd;x++)if(hash2(x,y,161)<.18&&m[y][x]===TT.GRASS)setTerrainTile58(m,x,y,TT.LIGHT_GRASS);
    for(let y=4;y<ROWS-4;y+=6)for(let x=4;x<fieldEnd-2;x++)if((x+y)%7!==0)setTerrainTile58(m,x,y,TT.HEDGE);
    for(let x=6;x<fieldEnd-2;x+=6)for(let y=3;y<ROWS-3;y++)if((x+y)%9!==0)setTerrainTile58(m,x,y,TT.HEDGE);
    carveLine(m,3,ROWS-5,fieldEnd+1,cy,TT.FLOOR,3);

    // 용암 해자와 3칸 폭 정문 도개교.
    for(let y=1;y<ROWS-1;y++)for(let x=moatL;x<=moatR;x++)setTerrainTile58(m,x,y,TT.LAVA);
    const bridgeTargets=[];for(let y=cy-1;y<=cy+1;y++)for(let x=moatL;x<=moatR;x++){setTerrainTile58(m,x,y,TT.DRAWBRIDGE_UP);bridgeTargets.push({x,y})}
    // 해자 앞뒤에 3칸 폭의 석조 교두보를 둬 정문과 실제로 이어지게 한다.
    for(let y=cy-1;y<=cy+1;y++){setTerrainTile58(m,fieldEnd+1,y,TT.FLOOR);setTerrainTile58(m,fieldEnd+2,y,TT.FLOOR);setTerrainTile58(m,moatR+1,y,TT.FLOOR)}

    // 돌 외성, 네 모서리 탑, 막사/병기고/중정/내성.
    const outer=walledBox(m,castleL,2,COLS-castleL-3,ROWS-4,TT.FLOOR);state.rooms.push(roomRect(castleL+1,3,COLS-castleL-5,ROWS-6));
    for(let y=cy-1;y<=cy+1;y++)setTerrainTile58(m,castleL,y,TT.DOOR);
    const towerSize=9,towers=[
      walledBox(m,castleL+2,4,towerSize,towerSize),walledBox(m,COLS-towerSize-5,4,towerSize,towerSize),
      walledBox(m,castleL+2,ROWS-towerSize-5,towerSize,towerSize),walledBox(m,COLS-towerSize-5,ROWS-towerSize-5,towerSize,towerSize)
    ];
    const barracksA=walledBox(m,castleL+13,5,12,11),barracksB=walledBox(m,castleL+13,ROWS-17,12,12);
    const armory=walledBox(m,keepL-14,5,12,12),cells=walledBox(m,keepL-14,ROWS-18,12,13);
    for(const r of [towers[0],towers[2],barracksA,barracksB])connectBox(m,r,{...outer,cx:castleL+9,cy:cy},'L');
    // 내성 벽과 중앙 홀.
    for(let y=3;y<ROWS-3;y++)setTerrainTile58(m,keepL,y,TT.WALL);for(const y of [9,cy,ROWS-10])setTerrainTile58(m,keepL,y,TT.DOOR);
    const keepHall=walledBox(m,keepL+3,cy-7,COLS-keepL-8,15),keepNorth=walledBox(m,keepL+3,5,COLS-keepL-8,12),keepSouth=walledBox(m,keepL+3,ROWS-18,COLS-keepL-8,13);
    connectBox(m,keepHall,keepNorth,'L');connectBox(m,keepHall,keepSouth,'L');
    for(let x=keepHall.x+3;x<keepHall.x+keepHall.w-3;x+=5){setTerrainTile58(m,x,keepHall.y+3,TT.WALL);setTerrainTile58(m,x,keepHall.y+keepHall.h-4,TT.WALL)}
    for(let x=castleL+3;x<keepL-2;x+=7){setTerrainTile58(m,x,cy-5,TT.WALL);setTerrainTile58(m,x,cy+5,TT.WALL)}
    for(const [x,y] of [[castleL+6,6],[COLS-8,6],[castleL+6,ROWS-7],[COLS-8,ROWS-7],[keepL-4,cy-5],[keepL-4,cy+5]])setTerrainTile58(m,x,y,TT.BRAZIER);
    for(let y=barracksA.y+2;y<barracksA.y+barracksA.h-2;y+=3)for(let x=barracksA.x+2;x<barracksA.x+barracksA.w-2;x+=3)setTerrainTile58(m,x,y,TT.TABLE);
    for(let y=cells.y+2;y<cells.y+cells.h-2;y+=3){setTerrainTile58(m,cells.x+2,y,TT.SCREEN);setTerrainTile58(m,cells.x+cells.w-3,y,TT.SCREEN)}
    setTerrainTile58(m,armory.cx,armory.cy,TT.ARMORY);setTerrainTile58(m,keepNorth.cx,keepNorth.cy,TT.VAULT);setTerrainTile58(m,keepSouth.cx,keepSouth.cy,TT.CACHE);setTerrainTile58(m,keepHall.cx,keepHall.cy,TT.ALTAR);

    setTerrainTile58(m,fieldEnd+1,cy,TT.SWITCH);state.switches.push({x:fieldEnd+1,y:cy,kind:'cipher',targets:bridgeTargets,used:false});
    const aqueduct=[];for(let x=moatL;x<=moatR;x++)aqueduct.push({x,y:7});registerHidden(aqueduct,TT.HIDDEN_BRIDGE,TT.DRAWBRIDGE_DOWN,'성벽 북쪽의 석조 배수로',TT.LAVA);
    registerHidden([{x:keepL,y:ROWS-13},{x:keepL,y:ROWS-12}],TT.HIDDEN_WALL,TT.FLOOR,'무너진 내성 측벽',TT.WALL);
    addTag(fieldEnd-1,cy,'정문 암호장치');addTag(fieldEnd-1,7,'북쪽 배수로 흔적');
    state.featureRooms=[{name:'외성 중정',x:castleL+1,y:3,w:keepL-castleL-1,h:ROWS-6},{name:'회색돌 내성',x:keepL+1,y:3,w:COLS-keepL-4,h:ROWS-6},{name:'성채 병기고',x:armory.x,y:armory.y,w:armory.w,h:armory.h}];
    state.layoutName='회색돌 성채 · 초원 외곽 / 용암 해자 / 외성 탑과 막사 / 삼중 내성';setEnds({x:3,y:ROWS-5},{x:COLS-7,y:6});
  }
  /* ---------- 18F: zoned warehouse with shelves, service shafts and final gate ---------- */
  function buildWarehouse(m){
    fillMap(m,TT.WALL);state.rooms=[];state.routeTags=[];state.floorKeys=0;state.floorKeysRequired=3;
    const cx=Math.floor(COLS/2),cy=Math.floor(ROWS/2),gateX=COLS-13;
    walledBox(m,1,1,COLS-2,ROWS-2,TT.FLOOR);
    // 여섯 개 적재동과 두 개 유지보수 통로.
    const xs=[3,Math.floor(COLS*.27),Math.floor(COLS*.51)],ys=[3,cy+2],zones=[];
    const zw=Math.floor((gateX-5)/3)-2,zh=cy-5;
    for(let gy=0;gy<2;gy++)for(let gx=0;gx<3;gx++)zones.push(walledBox(m,xs[gx],ys[gy],zw,zh,TT.FLOOR));
    for(let gx=0;gx<3;gx++)connectBox(m,zones[gx],zones[gx+3],'L');
    for(let gy=0;gy<2;gy++){connectBox(m,zones[gy*3],zones[gy*3+1],'Z');connectBox(m,zones[gy*3+1],zones[gy*3+2],'Z')}
    for(const [zi,r] of zones.entries()){
      const vertical=zi%2===0;
      if(vertical){for(let x=r.x+3;x<r.x+r.w-2;x+=4)for(let y=r.y+2;y<r.y+r.h-2;y++)if((y-r.y)%5!==0)setTerrainTile58(m,x,y,zi%3===0?TT.JAR:TT.TABLE)}
      else{for(let y=r.y+3;y<r.y+r.h-2;y+=4)for(let x=r.x+2;x<r.x+r.w-2;x++)if((x-r.x)%6!==0)setTerrainTile58(m,x,y,zi%3===1?TT.SCREEN:TT.TABLE)}
    }
    for(let y=1;y<ROWS-1;y++)setTerrainTile58(m,gateX,y,TT.WALL);setTerrainTile58(m,gateX,cy,TT.LOCKED_GATE);openRect(m,gateX+1,2,COLS-gateX-3,ROWS-4,TT.FLOOR);state.rooms.push(roomRect(gateX+1,2,COLS-gateX-3,ROWS-4));
    const keys=[{x:zones[0].cx,y:zones[0].cy},{x:zones[2].cx,y:zones[2].cy},{x:zones[4].cx,y:zones[4].cy}];for(const p of keys)setTerrainTile58(m,p.x,p.y,TT.KEY_TILE);
    setTerrainTile58(m,zones[1].cx,zones[1].cy,TT.CACHE);setTerrainTile58(m,zones[3].cx,zones[3].cy,TT.ARMORY);setTerrainTile58(m,COLS-7,cy-6,TT.VAULT);setTerrainTile58(m,COLS-7,cy+7,TT.RUMOR);
    const shaft=[];for(let x=4;x<gateX-2;x++)shaft.push({x,y:ROWS-2});registerHidden(shaft,TT.HIDDEN_WALL,TT.FLOOR,'철판 아래 유지보수 샤프트',TT.WALL);registerHidden([{x:gateX,y:ROWS-3}],TT.HIDDEN_WALL,TT.OPEN_DOOR,'격벽 후면 비상 점검구',TT.WALL);
    addTag(6,ROWS-4,'바닥 통풍구');state.featureRooms=zones.map((r,i)=>({name:`적재동 ${i+1}`,x:r.x,y:r.y,w:r.w,h:r.h}));
    state.layoutName='철판 창고 · 여섯 적재동 / 삼중 열쇠 / 격벽 / 바닥 샤프트';setEnds({x:3,y:ROWS-4},{x:COLS-5,y:cy});
  }
  /* ---------- 21F: many-island void sea, branching routes, hidden phase paths, collapsing edges ---------- */
  function buildFloor21VoidSea(m){
    fillMap(m,TT.VOID);state.rooms=[];state.routeTags=[];state.requiresBlink=true;
    const W=COLS,H=ROWS;
    const main=[[5,H-7],[15,H-9],[23,H-17],[33,H-14],[41,H-24],[51,H-21],[59,H-31],[69,H-27],[78,H-37],[W-7,7]];
    const upper=[[23,H-29],[31,H-36],[42,H-39],[52,H-43],[63,H-45],[73,H-48]];
    const lower=[[30,H-5],[42,H-7],[53,H-10],[64,H-12],[75,H-17],[W-8,H-25]];
    const side=[[6,H-20],[7,H-31],[13,H-39],[16,8],[27,7],[37,12],[48,7],[59,11],[70,6],[W-7,H-8],[W-14,H-5],[W-6,H-37],[11,H-5],[37,H-4]];
    const all=[...main,...upper,...lower,...side],seen=new Set(),islands=[];
    for(const [x,y] of all){const kk=x+','+y;if(seen.has(kk))continue;seen.add(kk);const major=main.some(p=>p[0]===x&&p[1]===y),r=carveBlob(m,x,y,major?3:2,major?3:2,TT.FLOOR);islands.push(r);if((x+y)%3!==0)setTerrainTile58(m,x,y,TT.STAMINA_PAD)}
    const link=(arr,frag=()=>false)=>{for(let i=0;i<arr.length-1;i++)phaseRoute(m,{x:arr[i][0],y:arr[i][1]},{x:arr[i+1][0],y:arr[i+1][1]},frag(i))};
    link(main,i=>i%3===1);phaseRoute(m,{x:main[2][0],y:main[2][1]},{x:upper[0][0],y:upper[0][1]},false);link(upper,i=>i%2===0);phaseRoute(m,{x:upper.at(-1)[0],y:upper.at(-1)[1]},{x:main[8][0],y:main[8][1]},true);
    phaseRoute(m,{x:main[3][0],y:main[3][1]},{x:lower[0][0],y:lower[0][1]},true);link(lower,i=>i%2===1);phaseRoute(m,{x:lower.at(-1)[0],y:lower.at(-1)[1]},{x:main[8][0],y:main[8][1]},false);
    for(let i=0;i<side.length;i++){const p=side[i],anchors=i%2?upper:lower,a=anchors[Math.min(anchors.length-1,i%anchors.length)];phaseRoute(m,{x:a[0],y:a[1]},{x:p[0],y:p[1]},i%3===0)}
    // 보상섬, 함정섬, 공허 관측소.
    for(const [x,y,t] of [[7,H-31,TT.VAULT],[16,8,TT.CACHE],[48,7,TT.ARMORY],[W-7,H-8,TT.VAULT],[37,H-4,TT.ALTAR],[W-6,H-37,TT.RUMOR]])setTerrainTile58(m,x,y,t);
    for(const [x,y] of [[27,H-7],[46,H-17],[66,H-22],[74,H-38],[36,H-40],[56,H-44],[20,H-14],[W-12,H-29]])markCrumble(x,y,TT.VOID);
    const hiddenA=[];for(let y=H-35;y<=H-31;y++)hiddenA.push({x:7,y});registerHidden(hiddenA,TT.HIDDEN_BRIDGE,TT.PAPER_BRIDGE,'서쪽 공허 아래 위상 계단',TT.VOID);
    const hiddenB=[];for(let x=W-20;x<=W-15;x++)hiddenB.push({x,y:H-7});registerHidden(hiddenB,TT.HIDDEN_BRIDGE,TT.PAPER_BRIDGE,'남동 보물섬의 보이지 않는 다리',TT.VOID);
    const hiddenC=[];for(let x=41;x<=46;x++)hiddenC.push({x,y:8});registerHidden(hiddenC,TT.HIDDEN_BRIDGE,TT.PAPER_BRIDGE,'북쪽 별빛 위상로',TT.VOID);
    const hiddenD=[];for(let y=H-27;y<=H-23;y++)hiddenD.push({x:W-7,y});registerHidden(hiddenD,TT.HIDDEN_BRIDGE,TT.PAPER_BRIDGE,'동쪽 공허 관측소 길',TT.VOID);
    setTerrainTile58(m,main[0][0],main[0][1],TT.FLOOR);setTerrainTile58(m,main.at(-1)[0],main.at(-1)[1],TT.FLOOR);addTag(main[3][0],main[3][1],'상층 지름길 / 하층 보상로');addTag(main[7][0],main[7][1],'북동 출구 / 동쪽 비밀섬');
    state.featureRooms=[{name:'상층 위상군도',x:18,y:5,w:58,h:22},{name:'하층 보상군도',x:24,y:H-23,w:W-28,h:21},{name:'서쪽 숨은 성소',x:2,y:H-35,w:12,h:12}];
    state.layoutName='공허 유체의 바다 · 마흔여섯 섬 / 상·중·하 삼중 경로 / 네 위상 비밀길';setEnds({x:main[0][0],y:main[0][1]},{x:main.at(-1)[0],y:main.at(-1)[1]});
  }
  /* ---------- 22F: layered temple with nave, cloisters, water cross and secret sanctum ---------- */
  function buildTemple(m){
    fillMap(m,TT.WALL);state.rooms=[];state.routeTags=[];const cx=Math.floor(COLS/2),cy=Math.floor(ROWS/2);
    const south=walledBox(m,cx-11,ROWS-13,23,10,TT.FLOOR),nave=walledBox(m,cx-7,12,15,ROWS-24,TT.FLOOR),north=walledBox(m,cx-12,3,25,12,TT.FLOOR);
    connectBox(m,south,nave,'L');connectBox(m,nave,north,'L');
    const left=[],right=[],ys=[5,cy-6,ROWS-16];
    for(const y of ys){left.push(walledBox(m,4,y,15,11,TT.FLOOR));right.push(walledBox(m,COLS-19,y,15,11,TT.FLOOR))}
    for(let i=0;i<3;i++){connectBox(m,left[i],nave,i===1?'Z':'L');connectBox(m,right[i],nave,i===1?'Z':'L');if(i<2){connectBox(m,left[i],left[i+1],'L');connectBox(m,right[i],right[i+1],'L')}}
    // 신랑의 기둥열과 좁은 통로.
    for(let y=nave.y+4;y<nave.y+nave.h-4;y+=5){setTerrainTile58(m,nave.x+3,y,TT.WALL);setTerrainTile58(m,nave.x+nave.w-4,y,TT.WALL)}
    for(const y of [cy-8,cy+8]){
      for(let x=left[1].x+2;x<right[1].x+right[1].w-2;x++)if(m[y][x]!==TT.WALL)setTerrainTile58(m,x,y,TT.WATER);
      for(const x of [left[1].cx,cx,right[1].cx])for(let o=-1;o<=1;o++)setTerrainTile58(m,x+o,y,TT.DRAWBRIDGE_DOWN);
    }
    for(let y=15;y<ROWS-14;y++){if(m[y][cx]===TT.FLOOR&&y%7!==0)setTerrainTile58(m,cx,y,TT.FLOOR)}
    setTerrainTile58(m,north.cx,north.cy,TT.ALTAR);setTerrainTile58(m,south.cx,south.cy,TT.FOUNTAIN);setTerrainTile58(m,nave.cx,nave.cy,TT.PAVILION);
    for(const r of [left[0],right[0]])setTerrainTile58(m,r.cx,r.cy,TT.GOLD);for(const r of [left[1],right[1]])setTerrainTile58(m,r.cx,r.cy,TT.RUMOR);for(const r of [left[2],right[2]])setTerrainTile58(m,r.cx,r.cy,TT.CACHE);
    const secret=walledBox(m,COLS-15,cy-5,11,11,TT.FLOOR);setTerrainTile58(m,secret.cx,secret.cy,TT.VAULT);registerHidden([{x:secret.x,y:secret.cy}],TT.HIDDEN_WALL,TT.OPEN_DOOR,'옥수로 뒤의 비밀 보물성소',TT.WALL);
    const submerged=[];for(let x=cx+9;x<COLS-20;x++)if(m[cy+8]?.[x]===TT.WATER)submerged.push({x,y:cy+8});registerHidden(submerged,TT.HIDDEN_BRIDGE,TT.DRAWBRIDGE_DOWN,'수면 아래 침수 회랑',TT.WATER);
    // 감실 내부 장식과 구조물을 늘린다.
    for(const r of [...left,...right]){for(let x=r.x+3;x<r.x+r.w-3;x+=4)setTerrainTile58(m,x,r.y+2,TT.SCREEN);for(const [dx,dy] of [[2,2],[r.w-3,2]])if(m[r.y+dy]?.[r.x+dx]===TT.FLOOR)setTerrainTile58(m,r.x+dx,r.y+dy,TT.BRAZIER)}
    state.featureRooms=[{name:'남문 외정',x:south.x,y:south.y,w:south.w,h:south.h},{name:'중앙 신랑',x:nave.x,y:nave.y,w:nave.w,h:nave.h},{name:'대제단 성소',x:north.x,y:north.y,w:north.w,h:north.h},{name:'잠긴 비밀 성소',x:secret.x,y:secret.y,w:secret.w,h:secret.h}];
    state.layoutName='거대 신전 · 남문 외정 / 기둥 신랑 / 육감실 / 이중 수로 / 비밀 성소';setEnds({x:south.cx,y:south.y+south.h-2},{x:north.cx,y:north.y+2});
  }
  function registerBuilding(r,name,shape,material){state.featureRooms.push({name,x:r.x,y:r.y,w:r.w,h:r.h,kind60:'f23-building',shape23:shape,material23:material});return r}
  function rectBuilding(m,styleMap,x,y,w,h,side,floor,name,material='stone'){
    if(w<5||h<5)return null;const r=walledBox(m,x,y,w,h,floor,true);markWallMaterial23(m,styleMap,r,material);let dx=r.cx,dy=r.y+r.h-1,ox=dx,oy=dy+1;
    if(side==='north'){dy=r.y;oy=dy-1}else if(side==='west'){dx=r.x;dy=r.cy;ox=dx-1;oy=dy}else if(side==='east'){dx=r.x+r.w-1;dy=r.cy;ox=dx+1;oy=dy}
    setTerrainTile58(m,dx,dy,TT.DOOR);if(in60(ox,oy)&&m[oy][ox]===TT.WALL)setTerrainTile58(m,ox,oy,TT.MOON_STONE);
    if(w>=7&&h>=6){const t=material==='depot'?TT.RACK:material==='timber'?TT.CRATE:material==='plaster'?TT.SCREEN:TT.CACHE,ix=clamp(r.cx+((x+y)&1?2:-2),r.x+1,r.x+r.w-2),iy=clamp(r.cy,r.y+1,r.y+r.h-2);if(!tileBlocks(m[iy][ix]))setTerrainTile58(m,ix,iy,t)}
    registerBuilding(r,name,'rect',material);return{...r,door:{x:dx,y:dy},approach:{x:ox,y:oy}}
  }
  function lBuilding(m,styleMap,x,y,w,h,side,floor,name,material='timber'){
    if(w<9||h<8)return rectBuilding(m,styleMap,x,y,w,h,side,floor,name,material);const bw=Math.max(5,Math.floor(w*.48)),bh=Math.max(5,Math.floor(h*.52)),a=walledBox(m,x,y,bw,h,floor,true),b=walledBox(m,x+bw-1,y+h-bh,w-bw+1,bh,floor,true);markWallMaterial23(m,styleMap,a,material);markWallMaterial23(m,styleMap,b,material);const dx=side==='west'?a.x:a.x+a.w-1,dy=a.cy,ox=dx+(side==='west'?-1:1),oy=dy;setTerrainTile58(m,dx,dy,TT.DOOR);if(in60(ox,oy)&&m[oy][ox]===TT.WALL)setTerrainTile58(m,ox,oy,TT.MOON_STONE);const r={x,y,w,h,cx:x+Math.floor(w/2),cy:y+Math.floor(h/2)};registerBuilding(r,name,'L',material);return{...r,door:{x:dx,y:dy},approach:{x:ox,y:oy}}
  }
  function uCompound(m,styleMap,x,y,w,h,opening,floor,name,material='plaster'){
    if(w<12||h<9)return rectBuilding(m,styleMap,x,y,w,h,opening,floor,name,material);const thick=5,parts=[];
    if(opening==='south'||opening==='north'){parts.push(walledBox(m,x,y,thick,h,floor,true),walledBox(m,x+w-thick,y,thick,h,floor,true),walledBox(m,x,y+(opening==='south'?0:h-thick),w,thick,floor,true))}
    else{parts.push(walledBox(m,x,y,w,thick,floor,true),walledBox(m,x,y+h-thick,w,thick,floor,true),walledBox(m,x+(opening==='east'?0:w-thick),y,thick,h,floor,true))}
    for(const p of parts)markWallMaterial23(m,styleMap,p,material);const r={x,y,w,h,cx:x+Math.floor(w/2),cy:y+Math.floor(h/2)};const dx=opening==='west'?x:opening==='east'?x+w-1:r.cx,dy=opening==='north'?y:opening==='south'?y+h-1:r.cy,ox=dx+(opening==='west'?-1:opening==='east'?1:0),oy=dy+(opening==='north'?-1:opening==='south'?1:0);setTerrainTile58(m,dx,dy,TT.DOOR);if(in60(ox,oy)&&m[oy][ox]===TT.WALL)setTerrainTile58(m,ox,oy,TT.MOON_STONE);registerBuilding(r,name,'U',material);return{...r,door:{x:dx,y:dy},approach:{x:ox,y:oy}}
  }
  function ruinBuilding(m,styleMap,x,y,w,h,side,name){const b=rectBuilding(m,styleMap,x,y,w,h,side,TT.FLOOR,name,'ruin');if(!b)return null;const cuts=[[b.x+2,b.y],[b.x+b.w-3,b.y+b.h-1],[b.x,b.cy-2]];for(const [xx,yy]of cuts)if(m[yy]?.[xx]===TT.WALL)setTerrainTile58(m,xx,yy,TT.MOON_STONE);for(const [xx,yy,t]of[[b.cx-2,b.cy,TT.ROCK],[b.cx+2,b.cy+1,TT.CRATE],[b.cx,b.cy-2,TT.BENCH]])if(in60(xx,yy)&&!tileBlocks(m[yy][xx]))setTerrainTile58(m,xx,yy,t);const f=state.featureRooms[state.featureRooms.length-1];if(f){f.shape23='ruin';f.material23='ruin'}return b}
  function clusterBuildings(m,styleMap,x,y,w,h,side,name,material='stone'){
    const gap=1,aW=Math.max(5,Math.floor((w-gap)/2)),bW=w-gap-aW,out=[];out.push(rectBuilding(m,styleMap,x,y,aW,Math.max(5,h-2),side,TT.FLOOR,`${name} 가`,material));out.push(rectBuilding(m,styleMap,x+aW+gap,y+2,bW,Math.max(5,h-2),side,TT.FLOOR,`${name} 나`,material==='stone'?'timber':material));return out.filter(Boolean)
  }
  function buildUrbanDistrict(m,d,styleMap){
    openRect(m,d.x,d.y,d.w,d.h,TT.MOON_STONE);const B=[],X=d.x,Y=d.y,W=d.w,H=d.h,cx=d.cx,cy=d.cy,add=v=>{if(Array.isArray(v))B.push(...v.filter(Boolean));else if(v)B.push(v)};
    const P={1:()=>{add(clusterBuildings(m,styleMap,X+1,Y+1,10,11,'east','초입 상점군','stone'));add(lBuilding(m,styleMap,X+13,Y+1,W-14,12,'west',TT.FLOOR,'초입 장방형 객사','timber'))},
      4:()=>{add(rectBuilding(m,styleMap,X+1,Y+1,8,H-2,'east',TT.DARK_WOOD,'장축 보급창','depot'));add(lBuilding(m,styleMap,X+11,Y+1,W-12,9,'west',TT.FLOOR,'수문 관리동','plaster'));add(rectBuilding(m,styleMap,X+12,Y+11,W-13,H-12,'west',TT.WOOD_FLOOR,'목조 공방','timber'))},
      7:()=>{add(uCompound(m,styleMap,X+1,Y+1,15,12,'east',TT.FLOOR,'범람 관리원','plaster'));add(clusterBuildings(m,styleMap,X+17,Y+2,W-18,15,'west','하층 가옥군','timber'));add(ruinBuilding(m,styleMap,X+3,Y+14,10,H-15,'east','침수 폐가'))},
      8:()=>{add(lBuilding(m,styleMap,X+1,Y+1,10,12,'east',TT.WOOD_FLOOR,'골목 장인동','timber'));add(rectBuilding(m,styleMap,X+12,Y+1,W-13,8,'west',TT.FLOOR,'회벽 관사','plaster'));add(rectBuilding(m,styleMap,X+10,Y+11,W-11,H-12,'west',TT.DARK_WOOD,'저지대 창고','depot'))},
      9:()=>{add(ruinBuilding(m,styleMap,X+1,Y+1,12,10,'east','붕괴 장옥'));add(rectBuilding(m,styleMap,X+15,Y+1,18,7,'south',TT.DARK_WOOD,'대형 물자창고','depot'));add(uCompound(m,styleMap,X+14,Y+10,17,9,'north',TT.FLOOR,'중앙 수문청','plaster'));add(clusterBuildings(m,styleMap,X+32,Y+2,W-33,H-3,'west','침수 상가군','timber'))},
      6:()=>{add(rectBuilding(m,styleMap,X+1,Y+1,8,H-2,'east',TT.DARK_WOOD,'수은 적재고','depot'));add(uCompound(m,styleMap,X+11,Y+1,W-12,11,'west',TT.FLOOR,'동측 관제원','plaster'));add(rectBuilding(m,styleMap,X+12,Y+13,W-13,H-14,'west',TT.WOOD_FLOOR,'목조 선착장 사무소','timber'))},
      3:()=>{add(uCompound(m,styleMap,X+1,Y+1,13,H-2,'east',TT.FLOOR,'회벽 행정청','plaster'));add(rectBuilding(m,styleMap,X+16,Y+1,W-17,7,'west',TT.GILDED_FLOOR,'세공 기록고','stone'));add(ruinBuilding(m,styleMap,X+15,Y+9,W-16,H-10,'west','침식된 관사'))},
      2:()=>{add(rectBuilding(m,styleMap,X+1,Y+1,12,7,'east',TT.WOOD_FLOOR,'북측 장방가옥','timber'));add(lBuilding(m,styleMap,X+15,Y+1,15,12,'west',TT.FLOOR,'최종 수문청','plaster'));add(ruinBuilding(m,styleMap,X+31,Y+2,W-32,H-3,'west','중앙 인접 폐가'))}}
    ;(P[d.id]||P[1])();
    // One broad arterial and several offset alleys; no district shares the same cross-shaped circulation.
    const horizY=clamp(cy+((d.id%3)-1)*2,Y+2,Y+H-3),vertX=clamp(cx+((d.id&1)?2:-2),X+2,X+W-3);carveLine(m,X+1,horizY,X+W-2,horizY,TT.STONE_PATH,1);carveLine(m,vertX,Y+1,vertX,Y+H-2,TT.MOON_STONE,1);
    const deadY=clamp(cy+(d.id%2?4:-4),Y+2,Y+H-3);carveLine(m,cx,deadY,clamp(cx+(d.id%2?6:-6),X+2,X+W-3),deadY,TT.MOON_STONE,1);
    for(const [ox,oy,t]of[[-3,0,TT.LANTERN_POST],[3,0,TT.LANTERN_POST],[0,3,TT.BENCH]]){const xx=clamp(cx+ox,X+1,X+W-2),yy=clamp(horizY+oy,Y+1,Y+H-2);if(!tileBlocks(m[yy][xx]))setTerrainTile58(m,xx,yy,t)}
    state.featureRooms.push({name:`수은도시 제 ${d.id}구역`,x:X,y:Y,w:W,h:H,kind60:'f23-district',seepStage23:d.seep});return B
  }
  function vaultEnemies(r,wanted){
    const cap=Math.max(1,Math.min(3,Math.floor(((r.w-2)*(r.h-2))/18))),need=Math.min(wanted,cap),out=existingEnemies62(r).slice(0,need),defs=floorEnemyDefinitions().filter(d=>!d.boss&&!d.miniBoss&&!d.fixed&&!d.aquatic&&!d.ranged);let guard=0;
    while(out.length<need&&defs.length&&guard++<24){const m=scaledMonster(choice(defs));m.miniVaultSpawn62=true;if(!moveEnemyTo(m,r,out.length))continue;OccupancyService.addMonster(m);out.push(m)}
    return out;
  }
  function isImportantCell(x,y){
    if(!state)return true;
    if(x<=1||y<=1||x>=COLS-2||y>=ROWS-2)return true;
    if(state.player?.x===x&&state.player?.y===y)return true;
    if(state.stairs?.x===x&&state.stairs?.y===y)return true;
    if((state.items||[]).some(i=>i.x===x&&i.y===y))return true;
    if((state.monsters||[]).some(m=>m.hp>0&&monCovers(m,x,y)))return true;
    return false;
  }
  function canEdit(x,y,allow=[TT.FLOOR,TT.GRASS]){
    return !isImportantCell(x,y)&&allow.includes(state.map[y]?.[x]);
  }
  function markCellType(x,y,type){
    if(x<0||y<0||x>=COLS||y>=ROWS)return;
    state.landmarkCells71=state.landmarkCells71||{};
    state.landmarkCells71[k(x,y)]=type;
  }
  function addLandmark(name,r,type){
    state.landmarks71=state.landmarks71||[];
    const v={name,type,x:r.cx,y:r.cy,r:{...r}};state.landmarks71.push(v);
    for(let y=Math.max(1,r.y+1);y<Math.min(ROWS-1,r.y+r.h-1);y++)
      for(let x=Math.max(1,r.x+1);x<Math.min(COLS-1,r.x+r.w-1);x++)markCellType(x,y,type);
    return v;
  }
  function roomDistance(a,b){return Math.abs(a.cx-b.cx)+Math.abs(a.cy-b.cy)}
  function roomHasEndpoint(r){
    const inside=p=>p&&p.x>=r.x&&p.x<r.x+r.w&&p.y>=r.y&&p.y<r.y+r.h;
    return inside(state.player)||inside(state.stairs);
  }
  function digTile(x,y){
    if(x<=0||y<=0||x>=COLS-1||y>=ROWS-1||isImportantCell(x,y))return;
    const t=state.map[y][x];
    if(t===TT.WATER)setTerrainTile58(state.map,x,y,TT.PAPER_BRIDGE);
    else if([TT.MERCURY,TT.VOID,TT.LAVA,TT.DRAWBRIDGE_UP].includes(t))setTerrainTile58(state.map,x,y,TT.DRAWBRIDGE_DOWN);
    else if([TT.WALL,TT.TABLE,TT.SCREEN,TT.HEDGE,TT.BAMBOO,TT.JAR,TT.FAKE_DOOR,TT.SECRET_DOOR].includes(t))setTerrainTile58(state.map,x,y,TT.FLOOR);
  }
  function carveCorridorBetween(a,b,width=1,zig=false){
    let x=a.x,y=a.y;
    const paint=()=>{for(let oy=0;oy<width;oy++)for(let ox=0;ox<width;ox++)digTile(x+ox,y+oy)};
    const walk=(tx,ty)=>{let guard=0;while((x!==tx||y!==ty)&&guard++<700){paint();if(x!==tx)x+=Math.sign(tx-x);else y+=Math.sign(ty-y)}paint()};
    if(zig){
      const mx=clamp(Math.round((a.x+b.x)/2)+rand(-3,3),2,COLS-3),my=clamp(Math.round((a.y+b.y)/2)+rand(-2,2),2,ROWS-3);
      walk(mx,a.y);walk(mx,my);walk(b.x,my);walk(b.x,b.y);
    }else if(globalThis.__MANRU_RANDOM57__()<.5){walk(b.x,a.y);walk(b.x,b.y)}
    else{walk(a.x,b.y);walk(b.x,b.y)}
  }
  function wallRatioInRect(x,y,w,h){
    let wall=0,total=0;
    for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++){
      if(xx<=0||yy<=0||xx>=COLS-1||yy>=ROWS-1)return 0;
      total++;if(state.map[yy][xx]===TT.WALL)wall++;
    }return wall/Math.max(1,total);
  }
  function carveAnnex(secret=false){
    const w=rand(7,10),h=rand(6,9);let pos=null;
    for(let t=0;t<380;t++){
      const x=rand(2,Math.max(2,COLS-w-3)),y=rand(2,Math.max(2,ROWS-h-3));
      if(wallRatioInRect(x,y,w,h)<.88)continue;
      const rr={x,y,w,h,cx:x+Math.floor(w/2),cy:y+Math.floor(h/2)};
      if(roomHasEndpoint(rr))continue;pos=rr;break;
    }
    if(!pos)return null;
    for(let yy=pos.y;yy<pos.y+pos.h;yy++)for(let xx=pos.x;xx<pos.x+pos.w;xx++){
      if(isImportantCell(xx,yy))continue;
      setTerrainTile58(state.map,xx,yy,(xx===pos.x||yy===pos.y||xx===pos.x+pos.w-1||yy===pos.y+pos.h-1)?TT.WALL:TT.FLOOR);
    }
    const old=[...(state.rooms||[])];state.rooms.push(pos);
    let near=null,bd=Infinity;for(const r of old){const d=roomDistance(pos,r);if(d<bd){bd=d;near=r}}
    if(near){
      const dx=Math.sign(near.cx-pos.cx),dy=Math.sign(near.cy-pos.cy);
      let start;
      if(Math.abs(near.cx-pos.cx)>=Math.abs(near.cy-pos.cy))start={x:dx>0?pos.x+pos.w-1:pos.x,y:pos.cy};
      else start={x:pos.cx,y:dy>0?pos.y+pos.h-1:pos.y};
      carveCorridorBetween(start,{x:near.cx,y:near.cy},1,secret);
      if(!isImportantCell(start.x,start.y))setTerrainTile58(state.map,start.x,start.y,secret?TT.SECRET_DOOR:TT.DOOR);
    }
    return pos;
  }
  function carveMicro(z){
    const sizes=[[6,5],[7,5],[6,6]],pick=sizes[rand(0,sizes.length-1)],w=pick[0],h=pick[1];let pos=null;
    for(let t=0;t<460;t++){
      const x=rand(2,Math.max(2,COLS-w-3)),y=rand(2,Math.max(2,ROWS-h-3));
      if(wallRatioInRect(x,y,w,h)<.91)continue;
      pos={x,y,w,h,cx:x+Math.floor(w/2),cy:y+Math.floor(h/2)};break;
    }
    if(!pos)return null;
    for(let yy=pos.y;yy<pos.y+pos.h;yy++)for(let xx=pos.x;xx<pos.x+pos.w;xx++){
      if(isImportantCell(xx,yy))continue;
      setTerrainTile58(state.map,xx,yy,(xx===pos.x||yy===pos.y||xx===pos.x+pos.w-1||yy===pos.y+pos.h-1)?TT.WALL:TT.FLOOR);
    }
    const rooms=[...(state.rooms||[])];state.rooms.push(pos);let near=rooms[0],bd=Infinity;
    for(const r of rooms){const d=roomDistance(pos,r);if(d<bd){bd=d;near=r}}
    if(near){
      const dx=Math.sign(near.cx-pos.cx),dy=Math.sign(near.cy-pos.cy);
      const door=Math.abs(near.cx-pos.cx)>Math.abs(near.cy-pos.cy)?{x:dx>0?pos.x+pos.w-1:pos.x,y:pos.cy}:{x:pos.cx,y:dy>0?pos.y+pos.h-1:pos.y};
      carveCorridorBetween(door,{x:near.cx,y:near.cy},1,true);if(!isImportantCell(door.x,door.y))setTerrainTile58(state.map,door.x,door.y,TT.DOOR);
    }
    const core=z===0?TT.RUMOR:z===1?TT.CACHE:z===2?TT.MIRROR:z===3?TT.JAR:TT.GOLD;
    if(canEdit(pos.cx,pos.cy,[TT.FLOOR]))setTerrainTile58(state.map,pos.cx,pos.cy,core);
    addLandmark('가지 감실',pos,'annex');return pos;
  }
  function carveInterior(m,x,y,t=TT.FLOOR){if(insideMapInterior(x,y))setTerrainTile58(m,x,y,t)}
  function borderRoom(x,y){for(const r of state.rooms||[]){if(x<r.x||x>=r.x+r.w||y<r.y||y>=r.y+r.h)continue;if(x===r.x||x===r.x+r.w-1||y===r.y||y===r.y+r.h-1)return r}return null}
  function corridorCell(m,x,y,open=false){if(!insideMapInterior(x,y))return;const br=borderRoom(x,y);if(br){if(m[y][x]===TT.WALL)setTerrainTile58(m,x,y,open?TT.FLOOR:TT.DOOR)}else if(m[y][x]===TT.WALL)setTerrainTile58(m,x,y,TT.FLOOR)}
  function hallOffsets(w){if(w<=1)return[0];if(w===2)return globalThis.__MANRU_RANDOM57__()<.5?[-1,0]:[0,1];return[-1,0,1]}
  function carveBand(m,x,y,dir,w){const ofs=hallOffsets(w);if(dir==='h'){for(const o of ofs)corridorCell(m,x,y+o)}else if(dir==='v'){for(const o of ofs)corridorCell(m,x+o,y)}else for(let yy=y-1;yy<=y+1;yy++)for(let xx=x-1;xx<=x+1;xx++)corridorCell(m,xx,yy)}
  function carveSquare(m,x,y,r=1,open=false){for(let yy=y-r;yy<=y+r;yy++)for(let xx=x-r;xx<=x+r;xx++)corridorCell(m,xx,yy,open)}
  /* v9.4 architecture modules: local side-bypass halls, vestibules, ring corridors, semi-open halls, outer narrow chains. */
  function roomBorderOpen(m,r,side){
    const pts=[];if(side==='top'){for(let x=r.x+2;x<r.x+r.w-2;x++)if(in85(x,r.y-1)&&!tileBlocks(m[r.y-1][x]))pts.push([x,r.y])}
    else if(side==='bottom'){for(let x=r.x+2;x<r.x+r.w-2;x++)if(in85(x,r.y+r.h)&&!tileBlocks(m[r.y+r.h][x]))pts.push([x,r.y+r.h-1])}
    else if(side==='left'){for(let y=r.y+2;y<r.y+r.h-2;y++)if(in85(r.x-1,y)&&!tileBlocks(m[y][r.x-1]))pts.push([r.x,y])}
    else{for(let y=r.y+2;y<r.y+r.h-2;y++)if(in85(r.x+r.w,y)&&!tileBlocks(m[y][r.x+r.w]))pts.push([r.x+r.w-1,y])}return pts;
  }
  function sideBypass(m,r){if(r.w<10||r.h<8)return false;const vertical=r.w>=r.h;if(vertical){const x0=r.cx-2,x1=r.cx+2;for(let y=r.y+2;y<r.y+r.h-2;y++){if(Math.abs(y-r.cy)<=1)continue;if(m[y][x0]===TT.FLOOR)setTerrainTile58(m,x0,y,TT.WALL);if(m[y][x1]===TT.FLOOR)setTerrainTile58(m,x1,y,TT.WALL)}for(const y of [r.y+2,r.y+r.h-3])for(let x=x0;x<=x1;x++)if(in85(x,y))setTerrainTile58(m,x,y,TT.FLOOR)}else{const y0=r.cy-2,y1=r.cy+2;for(let x=r.x+2;x<r.x+r.w-2;x++){if(Math.abs(x-r.cx)<=1)continue;if(m[y0][x]===TT.FLOOR)setTerrainTile58(m,x,y0,TT.WALL);if(m[y1][x]===TT.FLOOR)setTerrainTile58(m,x,y1,TT.WALL)}for(const x of [r.x+2,r.x+r.w-3])for(let y=y0;y<=y1;y++)if(in85(x,y))setTerrainTile58(m,x,y,TT.FLOOR)}feature89('측면 우회 회랑',r,'bypass');return true}
  function openRoomVestibule(m,r){if(r.w<9||r.h<8)return false;const side=choice(['top','bottom','left','right']),open=roomBorderOpen(m,r,side);let anchor=open.length?choice(open):null;if(!anchor)return false;if(side==='top'||side==='bottom'){const y=side==='top'?r.y+3:r.y+r.h-4;for(let x=r.x+1;x<r.x+r.w-1;x++)setTerrainTile58(m,x,y,TT.WALL);const doorX=clamp(anchor[0],r.x+2,r.x+r.w-3);setTerrainTile58(m,doorX,y,TT.DOOR)}else{const x=side==='left'?r.x+3:r.x+r.w-4;for(let y=r.y+1;y<r.y+r.h-1;y++)setTerrainTile58(m,x,y,TT.WALL);const doorY=clamp(anchor[1],r.y+2,r.y+r.h-3);setTerrainTile58(m,x,doorY,TT.DOOR)}feature89('문-전실-본실',r,'vestibule');return true}
  function ringRoom(m,r){if(r.w<11||r.h<9)return false;const ix=r.cx-2,iy=r.cy-1,iw=5,ih=3;for(let y=iy;y<iy+ih;y++)for(let x=ix;x<ix+iw;x++)setTerrainTile58(m,x,y,(x===ix||x===ix+iw-1||y===iy||y===iy+ih-1)?TT.WALL:TT.FLOOR);setTerrainTile58(m,r.cx,iy+ih-1,TT.DOOR);feature89('원형 복도와 내실',r,'ring');return true}
  function openRoomSides(m,r){if(r.w<9||r.h<7)return false;const sides=['top','bottom','left','right'].map(s=>[s,roomBorderOpen(m,r,s)]).filter(x=>x[1].length>=3);if(!sides.length)return false;const [side,pts]=choice(sides),mid=pts[Math.floor(pts.length/2)];if(side==='top'||side==='bottom'){for(let x=Math.max(r.x+2,mid[0]-1);x<=Math.min(r.x+r.w-3,mid[0]+1);x++)setTerrainTile58(m,x,mid[1],TT.FLOOR)}else{for(let y=Math.max(r.y+2,mid[1]-1);y<=Math.min(r.y+r.h-3,mid[1]+1);y++)setTerrainTile58(m,mid[0],y,TT.FLOOR)}feature89('반개방 홀',r,'semiopen');return true}
  function applyModules(m,rooms){
    const pool=[...rooms].filter(r=>r.w>=9&&r.h>=7&&!r.grand90).sort((a,b)=>b.w*b.h-a.w*a.h),used=new Set(),want=Math.min(pool.length,globalThis.__MANRU_RANDOM57__()<.14?3:globalThis.__MANRU_RANDOM57__()<.58?2:1);let made=0;
    const compatible=(fn,r)=>fn===ringRoom?r.w>=11&&r.h>=9:fn===sideBypass?r.w>=10&&r.h>=8:fn===openRoomVestibule?r.w>=9&&r.h>=8:r.w>=9&&r.h>=7;
    let order=NormalFloorGenerator.orderArchitectureCandidates([sideBypass,openRoomVestibule,openRoomSides,ringRoom]);if(globalThis.__MANRU_RANDOM57__()<.22&&pool.some(r=>compatible(ringRoom,r)))order=[ringRoom,...order.filter(f=>f!==ringRoom)];
    for(let pass=0;pass<2&&made<want;pass++)for(const fn of order){if(made>=want)break;const cand=pool.filter(r=>!used.has(r)&&compatible(fn,r));for(const r of NormalFloorGenerator.orderArchitectureCandidates(cand)){used.add(r);if(fn(m,r)){made++;break}}}
    return made
  }
  function isFreeGroundCell(x,y){
    if(!(x>0&&y>0&&x<COLS-1&&y<ROWS-1))return false;
    if(state.player.x===x&&state.player.y===y)return false;
    if(state.stairs?.x===x&&state.stairs?.y===y)return false;
    if((state.items||[]).some(i=>i.x===x&&i.y===y))return false;
    if((state.monsters||[]).some(m=>m.hp>0&&monCovers(m,x,y)))return false;
    return ![TT.DOOR,TT.OPEN_DOOR,TT.LOCKED_GATE,TT.KEY_TILE,TT.SECRET_DOOR,TT.STAIR].includes(state.map[y][x]);
  }
  function baseGround(t){return [TT.FLOOR,TT.GRASS,TT.LIGHT_GRASS,TT.CARPET,TT.STONE_PATH,TT.WOOD_FLOOR,TT.MOON_STONE,TT.DARK_WOOD,TT.GILDED_FLOOR].includes(t)}
  function placeTilePair(r,t,where='top'){
    const pts=where==='bottom'?[[r.x+2,r.y+r.h-3],[r.x+r.w-3,r.y+r.h-3]]:where==='mid'?[[r.cx-2,r.cy],[r.cx+2,r.cy]]:where==='sides'?[[r.x+2,r.cy],[r.x+r.w-3,r.cy]]:[[r.x+2,r.y+2],[r.x+r.w-3,r.y+2]];
    for(const [x,y] of pts)if(isFreeGroundCell(x,y)&&baseGround(state.map[y][x]))setTerrainTile58(state.map,x,y,t);
  }
  function markWalls(r,style){state.subthemeWalls970=state.subthemeWalls970||{};for(let x=r.x;x<r.x+r.w;x++){if(state.map[r.y]?.[x]===TT.WALL)state.subthemeWalls970[`${x},${r.y}`]=style;if(state.map[r.y+r.h-1]?.[x]===TT.WALL)state.subthemeWalls970[`${x},${r.y+r.h-1}`]=style}for(let y=r.y;y<r.y+r.h;y++){if(state.map[y]?.[r.x]===TT.WALL)state.subthemeWalls970[`${r.x},${y}`]=style;if(state.map[y]?.[r.x+r.w-1]===TT.WALL)state.subthemeWalls970[`${r.x+r.w-1},${y}`]=style}}
  function doorPaths(r,tile){const doors=[];for(let x=r.x;x<r.x+r.w;x++){for(const y of [r.y,r.y+r.h-1])if([TT.DOOR,TT.OPEN_DOOR,TT.LOCKED_GATE].includes(state.map[y]?.[x]))doors.push({x,y})}for(let y=r.y;y<r.y+r.h;y++){for(const x of [r.x,r.x+r.w-1])if([TT.DOOR,TT.OPEN_DOOR,TT.LOCKED_GATE].includes(state.map[y]?.[x]))doors.push({x,y})}for(const d of doors){let x=d.x,y=d.y;while(x!==r.cx||y!==r.cy){if(x<r.cx)x++;else if(x>r.cx)x--;else if(y<r.cy)y++;else if(y>r.cy)y--;if(x===d.x&&y===d.y)continue;if(isFreeGroundCell(x,y))setTerrainTile58(state.map,x,y,tile)}}}
  function addRoomStream(r,vertical=false){if(vertical){const x=r.cx+(hash2(r.cx,r.cy,9701)>.5?0:-1);for(let y=r.y+1;y<r.y+r.h-1;y++)if(isFreeGroundCell(x,y)&&baseGround(state.map[y][x]))setTerrainTile58(state.map,x,y,TT.WATER)}else{const y=r.cy+(hash2(r.cx,r.cy,9707)>.5?0:-1);for(let x=r.x+1;x<r.x+r.w-1;x++)if(isFreeGroundCell(x,y)&&baseGround(state.map[y][x]))setTerrainTile58(state.map,x,y,TT.WATER)}}
  function safeCarve(x,y,t=TT.FLOOR){
    if(!(x>0&&y>0&&x<COLS-1&&y<ROWS-1))return false;
    const old=state.map[y][x];
    if([TT.STAIR,TT.LOCKED_GATE,TT.KEY_TILE,TT.SECRET_DOOR].includes(old))return false;
    if(state.player.x===x&&state.player.y===y)return false;
    if((state.items||[]).some(i=>i.x===x&&i.y===y))return false;
    if((state.monsters||[]).some(m=>m.hp>0&&monCovers(m,x,y)))return false;
    setTerrainTile58(state.map,x,y,t);
    if(state.subthemeWalls970)delete state.subthemeWalls970[`${x},${y}`];
    return true;
  }
  function widePath(a,b,t=TT.FLOOR,width=2,pathSet=null){
    let x=a.x,y=a.y;const band=(x,y,axis)=>{const off=width>=3?[-1,0,1]:width===2?[0,1]:[0];for(const o of off){const xx=axis==='h'?x:x+o,yy=axis==='h'?y+o:y;if(safeCarve(xx,yy,t)&&pathSet)pathSet.add(`${xx},${yy}`)}};
    const horizFirst=hash2(a.x+b.x,a.y+b.y,97117)>.5;
    if(horizFirst){while(x!==b.x){x+=Math.sign(b.x-x);band(x,y,'h')}while(y!==b.y){y+=Math.sign(b.y-y);band(x,y,'v')}}
    else{while(y!==b.y){y+=Math.sign(b.y-y);band(x,y,'v')}while(x!==b.x){x+=Math.sign(b.x-x);band(x,y,'h')}}
  }
  function openFacingSide(r,center,t=TT.GRASS){
    const dx=center.x-r.cx,dy=center.y-r.cy,pts=[];
    if(Math.abs(dx)>=Math.abs(dy)){const x=dx>=0?r.x+r.w-1:r.x,ox=dx>=0?1:-1;for(let q=-1;q<=1;q++)pts.push([x,r.cy+q],[x+ox,r.cy+q])}
    else{const y=dy>=0?r.y+r.h-1:r.y,oy=dy>=0?1:-1;for(let q=-1;q<=1;q++)pts.push([r.cx+q,y],[r.cx+q,y+oy])}
    for(const [x,y] of pts)safeCarve(x,y,t);
  }
  function zoneCenter(rooms){return{x:Math.round(rooms.reduce((n,r)=>n+r.cx,0)/rooms.length),y:Math.round(rooms.reduce((n,r)=>n+r.cy,0)/rooms.length)}}
  function treeObstacles(rooms,center,pathSet,density=.13,peach=false){
    const placed=[];for(const r of rooms)for(let y=r.y+1;y<r.y+r.h-1;y++)for(let x=r.x+1;x<r.x+r.w-1;x++){
      const k=`${x},${y}`;if(pathSet.has(k)||!isFreeGroundCell(x,y)||![TT.FLOOR,TT.GRASS,TT.LIGHT_GRASS].includes(state.map[y][x]))continue;
      if(Math.abs(x-center.x)+Math.abs(y-center.y)<3)continue;const h=hash2(x,y,97131+state.floor*23);
      if(h<density){setTerrainTile58(state.map,x,y,peach&&h<density*.34?peachTerrain():h<density*.72?TT.GARDEN_TREE:(h<density*.87?TT.BAMBOO:TT.ROCK));placed.push({x,y})}
    }
    return placed;
  }
  function indoorGarden(r){
    markWalls(r,'r2_indoor');
    if(hash2(r.cx,r.cy,9711)>.48){addRoomStream(r,r.h>r.w);doorPaths(r,TT.FLOOR);for(let y=r.y+1;y<r.y+r.h-1;y++)for(let x=r.x+1;x<r.x+r.w-1;x++)if(state.map[y][x]===TT.WATER&&(x===r.cx||y===r.cy))setTerrainTile58(state.map,x,y,TT.PAPER_BRIDGE)}
    placeTilePair(r,TT.PAPER_CRANE,'top');placeTilePair(r,TT.FLOWERBED,'bottom');if(r.w>=9)placeTilePair(r,TT.BENCH,'sides');
    if(isFreeGroundCell(r.cx,r.cy)&&state.map[r.cy][r.cx]===TT.FLOOR)setTerrainTile58(state.map,r.cx,r.cy,TT.STONE_PATH);
  }
  function outdoorGarden(r){
    markWalls(r,'r2_outdoor');
    for(let y=r.y+1;y<r.y+r.h-1;y++)for(let x=r.x+1;x<r.x+r.w-1;x++)if(isFreeGroundCell(x,y)){const h=hash2(x,y,9721);setTerrainTile58(state.map,x,y,h>.78?TT.GRASS:TT.FLOOR)}
    placeTilePair(r,TT.FLOWERBED,'bottom');
  }
  function openOutdoorDistrict(rooms){
    if(!rooms.length)return;const c=zoneCenter(rooms),pathSet=new Set();
    for(const r of rooms){openFacingSide(r,c,TT.GRASS);widePath({x:r.cx,y:r.cy},c,TT.GRASS,2,pathSet)}
    for(let y=c.y-3;y<=c.y+3;y++)for(let x=c.x-4;x<=c.x+4;x++){const d=Math.abs(x-c.x)/4+Math.abs(y-c.y)/3;if(d<=1.2)safeCarve(x,y,hash2(x,y,97141)>.18?TT.GRASS:TT.FLOOR)}
    const pondY=c.y+(hash2(c.x,c.y,97143)>.5?3:-3);for(let y=pondY-1;y<=pondY+1;y++)for(let x=c.x-3;x<=c.x+3;x++){if(Math.abs(x-c.x)+Math.abs(y-pondY)<=4&&safeCarve(x,y,TT.WATER)){} }
    for(let x=c.x-3;x<=c.x+3;x++){if((x-c.x)%2===0&&state.map[pondY]?.[x]===TT.WATER)setTerrainTile58(state.map,x,pondY,TT.PAPER_BRIDGE)}
    if(safeCarve(c.x,c.y,TT.PAVILION))pathSet.add(`${c.x},${c.y}`);
    treeObstacles(rooms,c,pathSet,.16,false);
    for(const r of rooms){for(let y=r.y+1;y<r.y+r.h-1;y++)for(let x=r.x+1;x<r.x+r.w-1;x++)if(state.map[y][x]===TT.GRASS&&hash2(x,y,97151)>.90)setTerrainTile58(state.map,x,y,TT.LOTUS_FLOWER)}
  }
  function decorateBanquetRoom(r){markWalls(r,'r1_banquet');placeTilePair(r,TT.LANTERN_POST,'top');placeTilePair(r,TT.BENCH,'bottom');if(r.w>=9){for(let x=r.cx-1;x<=r.cx+1;x++)if(isFreeGroundCell(x,r.cy))setTerrainTile58(state.map,x,r.cy,TT.CARPET)}if(r.w>=11)placeTilePair(r,TT.WALL_BANNER,'sides')}
  function decorateServiceRoom(r){markWalls(r,'r1_service');placeTilePair(r,TT.CRATE,'top');placeTilePair(r,TT.RACK,'bottom');if(r.w>=9)placeTilePair(r,TT.BENCH,'sides')}
  function servicePartitions(rooms){for(let i=0;i<rooms.length;i+=2){const r=rooms[i];if(r.w<9||r.h<7)continue;const vertical=r.w>=r.h;if(vertical){const x=r.cx;for(let y=r.y+1;y<r.y+r.h-1;y++){if(Math.abs(y-r.cy)<=1)continue;if(isFreeGroundCell(x,y))setTerrainTile58(state.map,x,y,TT.WALL)}}else{const y=r.cy;for(let x=r.x+1;x<r.x+r.w-1;x++){if(Math.abs(x-r.cx)<=1)continue;if(isFreeGroundCell(x,y))setTerrainTile58(state.map,x,y,TT.WALL)}}}}
  function banquetLink(rooms){if(rooms.length<2)return;const c=zoneCenter(rooms);for(const r of rooms){openFacingSide(r,c,TT.FLOOR);if(Math.abs(r.cx-c.x)+Math.abs(r.cy-c.y)>7)widePath({x:r.cx,y:r.cy},c,TT.FLOOR,2)}}
  function decorateSilkRoom(r){markWalls(r,'r3_silk');placeTilePair(r,TT.MIRROR,'top');placeTilePair(r,TT.WALL_BANNER,'bottom');placeTilePair(r,TT.INCENSE_STAND,'mid');if(r.w>=10){const x=r.cx;for(let y=r.y+2;y<r.y+r.h-2;y++){if(Math.abs(y-r.cy)<=1)continue;if(isFreeGroundCell(x,y))setTerrainTile58(state.map,x,y,TT.SCREEN)}}}
  function decorateMoonRoom(r){markWalls(r,'r3_moon');placeTilePair(r,TT.STATUE,'top');placeTilePair(r,TT.MIRROR,'bottom');placeTilePair(r,TT.INCENSE_STAND,'sides')}
  function moonGallery(rooms){for(const r of rooms.slice(0,Math.min(3,rooms.length))){const sides=[['top',r.y-1],['bottom',r.y+r.h]];for(const [s,y] of sides){if(y<=1||y>=ROWS-2)continue;for(let x=r.x+2;x<r.x+r.w-2;x++)if(state.map[y]?.[x]===TT.WALL)safeCarve(x,y,TT.FLOOR);const wy=s==='top'?r.y:r.y+r.h-1;for(let x=r.x+3;x<r.x+r.w-3;x+=3)if(state.map[wy]?.[x]===TT.WALL)setTerrainTile58(state.map,x,wy,TT.WINDOW)}}}
  function decorateStorageRoom(r){markWalls(r,'r4_storage');placeTilePair(r,TT.RACK,'top');placeTilePair(r,TT.CRATE,'bottom');for(const [dx,dy] of [[-2,0],[0,0],[2,0]])if(isFreeGroundCell(r.cx+dx,r.cy))setTerrainTile58(state.map,r.cx+dx,r.cy,TT.JAR)}
  function storageAisles(rooms){for(const r of rooms){if(r.w<9||r.h<7)continue;for(let y=r.y+2;y<r.y+r.h-2;y+=3)for(let x=r.x+2;x<r.x+r.w-2;x++){if(Math.abs(x-r.cx)<=1)continue;if(isFreeGroundCell(x,y))setTerrainTile58(state.map,x,y,hash2(x,y,97171)>.50?TT.JAR:TT.RACK)}}}
  function decorateCellarRoom(r){markWalls(r,'r4_cellar');placeTilePair(r,TT.IRON_HOOK,'top');placeTilePair(r,TT.STONE_PILLAR,'bottom');if(isFreeGroundCell(r.cx,r.cy))setTerrainTile58(state.map,r.cx,r.cy,TT.JAR)}
  function cellarGrid(rooms){for(const r of rooms){if(r.w<9||r.h<7)continue;for(const [dx,dy] of [[-2,-2],[2,-2],[-2,2],[2,2]])if(isFreeGroundCell(r.cx+dx,r.cy+dy))setTerrainTile58(state.map,r.cx+dx,r.cy+dy,TT.STONE_PILLAR);if(r.w>=11){for(let y=r.y+1;y<r.y+r.h-1;y++){if(Math.abs(y-r.cy)<=1)continue;if(isFreeGroundCell(r.cx,y)&&hash2(r.cx,y,97181)>.35)setTerrainTile58(state.map,r.cx,y,TT.WALL)}}}}
  function decorateSanctumRoom(r){markWalls(r,'r5_sanctum');placeTilePair(r,TT.GOLD_LAMP,'top');placeTilePair(r,TT.STATUE,'bottom');if(isFreeGroundCell(r.cx,r.cy))setTerrainTile58(state.map,r.cx,r.cy,TT.GOLD);for(const [dx,dy] of [[-2,-1],[2,-1],[-2,1],[2,1]])if(isFreeGroundCell(r.cx+dx,r.cy+dy))setTerrainTile58(state.map,r.cx+dx,r.cy+dy,TT.STONE_PILLAR)}
  function spiritGarden(r){markWalls(r,'r5_garden');placeTilePair(r,TT.PETAL_MAT,'top');placeTilePair(r,TT.STONE_PILLAR,'bottom');for(const [dx,dy] of [[-2,-1],[2,-1],[-2,1],[2,1]])if(isFreeGroundCell(r.cx+dx,r.cy+dy))setTerrainTile58(state.map,r.cx+dx,r.cy+dy,peachTerrain())}
  function spiritOpen(rooms){if(!rooms.length)return;const c=zoneCenter(rooms),pathSet=new Set();for(const r of rooms){if(hash2(r.cx,r.cy,97191)>.35)openFacingSide(r,c,TT.FLOOR);widePath({x:r.cx,y:r.cy},c,TT.FLOOR,2,pathSet)}treeObstacles(rooms,c,pathSet,.09,true)}
  function zoneSplit(rooms){const axis=hash2(state.floor,rooms.length,9709)>.5?'x':'y',sorted=[...rooms].sort((a,b)=>(axis==='x'?a.cx-b.cx:a.cy-b.cy)),cut=Math.max(1,Math.min(sorted.length-1,Math.floor(sorted.length*(.45+hash2(state.floor,7,9713)*.1))));return{axis,a:sorted.slice(0,cut),b:sorted.slice(cut)}}
  function multitheme(){
    if(!state||state.specialFloor||!Array.isArray(state.rooms))return;state.subthemeWalls970={};rollbackFloorColors971();
    const z=regionIndex(),rooms=state.rooms.filter(r=>r&&r.w>=7&&r.h>=6);if(rooms.length<2)return;const split=zoneSplit(rooms),styles=[
      [decorateBanquetRoom,decorateServiceRoom,'연회동','객실·보급동'],[indoorGarden,outdoorGarden,'수목원 실내 누실','개방형 연못 외원'],[decorateSilkRoom,decorateMoonRoom,'비단 내실','월백 경대 회랑'],[decorateStorageRoom,decorateCellarRoom,'장독·선반 창고','석조 냉골'],[decorateSanctumRoom,spiritGarden,'황금 제의실','영목 석정원']][z];
    for(const r of split.a)styles[0](r);for(const r of split.b)styles[1](r);
    if(z===0){banquetLink(split.a);servicePartitions(split.b)}
    else if(z===1){openOutdoorDistrict(split.b)}
    else if(z===2){moonGallery(split.b)}
    else if(z===3){storageAisles(split.a);cellarGrid(split.b)}
    else{spiritOpen(split.b)}
    state.themeZones970={region:z,axis:split.axis,a:split.a.map(r=>[r.x,r.y,r.w,r.h]),b:split.b.map(r=>[r.x,r.y,r.w,r.h]),names:[styles[2],styles[3]],structural:true};
    state.featureRooms=state.featureRooms||[];for(const r of split.a.slice(0,2))state.featureRooms.push({name:styles[2],x:r.x,y:r.y,w:r.w,h:r.h,cx:r.cx,cy:r.cy});for(const r of split.b.slice(0,2))state.featureRooms.push({name:styles[3],x:r.x,y:r.y,w:r.w,h:r.h,cx:r.cx,cy:r.cy});
    const suffix=`${styles[2]} / ${styles[3]}`;if(!String(state.layoutName||'').includes(suffix))state.layoutName=(state.layoutName?state.layoutName+' · ':'')+suffix;
    window.__MANRU_RUNTIME81__?.Integrity81?.repair?.();
  }
  function decorBoost(){if(!state||state.specialFloor||!Array.isArray(state.rooms))return;const z=regionIndex();for(let i=0;i<state.rooms.length;i++){const r=state.rooms[i];if(!r||r.w<6||r.h<5)continue;const h=hash2(r.cx,r.cy,9740+i*11);if(h<.34)continue;if(z===0)placeTilePair(r,i%2?TT.LANTERN_POST:TT.BENCH,i%3?'top':'bottom');else if(z===1)placeTilePair(r,i%2?TT.PAPER_CRANE:TT.FLOWERBED,i%3?'top':'bottom');else if(z===2)placeTilePair(r,i%2?TT.INCENSE_STAND:TT.MIRROR,i%3?'top':'bottom');else if(z===3)placeTilePair(r,i%2?TT.IRON_HOOK:TT.JAR,i%3?'top':'bottom');else placeTilePair(r,i%2?TT.GOLD_LAMP:TT.PETAL_MAT,i%3?'top':'bottom')}}
/* v9.7.2 REFERENCE-DRIVEN TILE/STRUCTURE QUALITY PASS */
  function zoneRooms(zones){
    const out=[]; if(!state||!Array.isArray(state.rooms)||!Array.isArray(zones)) return out;
    for(const a of zones){
      const [x,y,w,h]=a||[];
      const r=state.rooms.find(rr=>rr&&rr.x===x&&rr.y===y&&rr.w===w&&rr.h===h);
      if(r) out.push(r);
    }
    return out;
  }
  function isGroundTile(t){ return [TT.FLOOR,TT.GRASS,TT.LIGHT_GRASS,TT.CARPET,TT.STONE_PATH,TT.WOOD_FLOOR,TT.MOON_STONE,TT.DARK_WOOD,TT.GILDED_FLOOR].includes(t); }
  function isQuietCell(x,y){
    return !(state.items||[]).some(i=>i.x===x&&i.y===y) && !(state.monsters||[]).some(m=>m.hp>0&&monCovers(m,x,y)) && !(state.player.x===x&&state.player.y===y) && !(state.stairs&&state.stairs.x===x&&state.stairs.y===y);
  }
  function tagFloor(x,y,style){
    state.subthemeFloors972=state.subthemeFloors972||{};
    state.subthemeFloors972[key972(x,y)] = style;
  }
  function fillRoomStyle(r,style,includeSpecial=false){
    for(let y=r.y+1;y<r.y+r.h-1;y++) for(let x=r.x+1;x<r.x+r.w-1;x++){
      const t=state.map[y][x];
      if(isGroundTile(t) || includeSpecial) tagFloor(x,y,style);
    }
  }
  function paintRoomLoopTile(r,tile){
    if(r.w<8||r.h<7) return;
    for(let x=r.x+2;x<r.x+r.w-2;x++){ safeSet972(x,r.y+2,tile); safeSet972(x,r.y+r.h-3,tile); }
    for(let y=r.y+2;y<r.y+r.h-2;y++){ safeSet972(r.x+2,y,tile); safeSet972(r.x+r.w-3,y,tile); }
  }
  function addCornerPool(r){
    if(r.w<8||r.h<7) return;
    const corner = Math.floor(hash2(r.cx,r.cy,97211)*4),
          ox = corner===0||corner===2 ? r.x+2 : r.x+r.w-4,
          oy = corner<2 ? r.y+2 : r.y+r.h-4;
    for(let y=oy;y<oy+2;y++) for(let x=ox;x<ox+2;x++) safeSet972(x,y,TT.WATER);
    if(safeSet972(ox+(corner===0||corner===2?2:-1), oy+(corner<2?1:0), TT.PAPER_BRIDGE)){}
  }
  function addPathDots(r,tile,style,freq=.18){
    for(let y=r.y+1;y<r.y+r.h-1;y++) for(let x=r.x+1;x<r.x+r.w-1;x++){
      if(!isGroundTile(state.map[y][x]) || !isQuietCell(x,y)) continue;
      if(hash2(x,y,97221+state.floor*7)<freq){ safeSet972(x,y,tile); tagFloor(x,y,style); }
    }
  }
  function scatterClustered(r,candidates,density=.08,edgeBias=true){
    for(let y=r.y+1;y<r.y+r.h-1;y++) for(let x=r.x+1;x<r.x+r.w-1;x++){
      if(!isGroundTile(state.map[y][x]) || !isQuietCell(x,y)) continue;
      const nearEdge=(x-r.x<3||r.x+r.w-1-x<3||y-r.y<3||r.y+r.h-1-y<3);
      if(edgeBias && !nearEdge && hash2(x,y,97231)<.72) continue;
      const h=hash2(x,y,97241+state.floor*17);
      if(h<density){ setTerrainTile58(state.map,x,y,candidates[Math.floor(hash2(x,y,97251)*candidates.length)%candidates.length]); }
    }
  }
  function styleIndoorGarden(r){
    fillRoomStyle(r,'r2_indoor',true);
    paintInterior(r,TT.WOOD_FLOOR,.92);
    paintBorder(r,TT.DARK_WOOD);
    paintCross(r,TT.WOOD_FLOOR,0);
    if(hash2(r.cx,r.cy,97261)>.55) addCornerPool(r);
    for(let y=r.y+1;y<r.y+r.h-1;y++) for(let x=r.x+1;x<r.x+r.w-1;x++) if(state.map[y][x]===TT.PAPER_BRIDGE || state.map[y][x]===TT.WATER) tagFloor(x,y,'r2_indoor_water');
  }
  function styleOutdoorGarden(r){
    fillRoomStyle(r,'r2_outdoor',true);
    for(let y=r.y+1;y<r.y+r.h-1;y++) for(let x=r.x+1;x<r.x+r.w-1;x++){
      if(!isGroundTile(state.map[y][x]) || !isQuietCell(x,y)) continue;
      const lane = Math.abs(y-r.cy)<=1 || Math.abs(x-r.cx)<=1;
      setTerrainTile58(state.map,x,y,lane && hash2(x,y,97271)>.35 ? TT.STONE_PATH : (hash2(x,y,97273)>.45 ? TT.GRASS : TT.LIGHT_GRASS));
      tagFloor(x,y, lane ? 'r2_outdoor_path' : 'r2_outdoor');
    }
    scatterClustered(r,[TT.GARDEN_TREE,TT.BAMBOO,TT.ROCK],.11,true);
    addPathDots(r,TT.LOTUS_FLOWER,'r2_outdoor',.06);
  }
  function styleSilk(r){
    fillRoomStyle(r,'r3_silk',true);
    paintInterior(r,TT.DARK_WOOD,.86);
    paintCross(r,TT.PETAL_MAT,0);
    if(r.w>=10&&r.h>=8){ for(let x=r.x+2;x<r.x+r.w-2;x++) safeSet972(x,r.cy-2,TT.PETAL_MAT); }
  }
  function styleMoon(r){
    fillRoomStyle(r,'r3_moon',true);
    paintInterior(r,TT.MOON_STONE,.88);
    paintRoomLoopTile(r,TT.MOON_STONE);
    if(r.w>=9&&r.h>=7) paintCross(r,TT.STONE_PATH,0);
  }
  function styleStorage(r){
    fillRoomStyle(r,'r4_storage',true);
    paintInterior(r,TT.DARK_WOOD,.70);
    paintBorder(r,TT.DARK_WOOD);
    addPathDots(r,TT.WOOD_FLOOR,'r4_storage',.12);
  }
  function styleCellar(r){
    fillRoomStyle(r,'r4_cellar',true);
    paintInterior(r,TT.MOON_STONE,.92);
    if(r.w>=10&&r.h>=8) paintRoomLoopTile(r,TT.STONE_PATH);
  }
  function styleSanctum(r){
    fillRoomStyle(r,'r5_sanctum',true);
    paintCross(r,TT.GILDED_FLOOR,0);
    if(r.w>=9&&r.h>=7){ for(let y=r.cy-1;y<=r.cy+1;y++) for(let x=r.cx-1;x<=r.cx+1;x++) safeSet972(x,y,TT.GILDED_FLOOR); }
  }
  function styleSpiritGarden(r){
    fillRoomStyle(r,'r5_garden',true);
    for(let y=r.y+1;y<r.y+r.h-1;y++) for(let x=r.x+1;x<r.x+r.w-1;x++){
      if(!isGroundTile(state.map[y][x]) || !isQuietCell(x,y)) continue;
      setTerrainTile58(state.map,x,y,hash2(x,y,97301)>.52?TT.GRASS:TT.LIGHT_GRASS);
      tagFloor(x,y,'r5_garden');
    }
    for(let x=r.x+1;x<r.x+r.w-1;x++) if(Math.abs(x-r.cx)<=1 || hash2(x,r.cy,97303)>.82){ safeSet972(x,r.cy,TT.STONE_PATH); tagFloor(x,r.cy,'r5_garden_path'); }
    scatterClustered(r,[TT.PEACH_TREE,TT.GARDEN_TREE,TT.ROCK],.10,true);
  }
  function qualityPass(){
    if(!state||state.specialFloor||!state.themeZones970) return;
    const z=regionIndex(), A=zoneRooms(state.themeZones970.a), B=zoneRooms(state.themeZones970.b);
    state.subthemeFloors972={};
    if(z===1){ A.forEach(styleIndoorGarden); B.forEach(styleOutdoorGarden); }
    else if(z===2){ A.forEach(styleSilk); B.forEach(styleMoon); }
    else if(z===3){ A.forEach(styleStorage); B.forEach(styleCellar); }
    else if(z===4){ A.forEach(styleSanctum); B.forEach(styleSpiritGarden); }
  }
  function applyRegionArchitecture(bowBefore=false){
    if(!state)return;
    state.themeZones970=null; state.subthemeWalls970={}; state.subthemeFloors972={};
    rollbackFloorColors971();
    multitheme();
    qualityPass();
    decorBoost();
    // Floor-start ammunition is a dedicated run/floor stream: equipment can neither increase nor decrease it.
    if(state.ammoGeneration972===state.floor)return;state.ammoGeneration972=state.floor;
    const rolls=[.72,.24];let made=0;
    for(let i=0;i<rolls.length;i++)if(ammoUnit(i)<rolls[i]&&controlledAmmo(i))made++;
    state.ammoSpawn967={bowBoost:false,bundles:made,rolls:[...rolls],equipmentIndependent:true};
    VisibilityService.compute();
  }
  function isFloorLike(t){return floorSet980.has(t)}
  function isReservedCell(x,y){
    if(!in980(x,y))return true;
    if(state.floor===11&&(state.rafts||[]).some(r=>x===r.x&&y>=r.min&&y<=r.max))return true;
    if(state.player&&state.player.x===x&&state.player.y===y)return true;
    if(state.stairs&&state.stairs.x===x&&state.stairs.y===y)return true;
    if((state.items||[]).some(i=>i.x===x&&i.y===y))return true;
    if((state.monsters||[]).some(m=>m.hp>0&&typeof monCovers==='function'&&monCovers(m,x,y)))return true;
    return false;
  }
  function safeGround(x,y,t,protectedSet=null){
    if(!in980(x,y)||isReservedCell(x,y))return false;
    const old=state.map[y][x];
    if(IMMUTABLE_TILES.has(old)||old===TT.DOOR||old===TT.OPEN_DOOR)return false;
    if(!isFloorLike(old)&&old!==TT.WATER&&old!==TT.MERCURY&&old!==TT.VOID&&old!==TT.WALL&&old!==TT.BAMBOO&&old!==TT.HEDGE)return false;
    if(protectedSet&&protectedSet.has(key980(x,y))&&tileBlocks(t))return false;
    setTerrainTile58(state.map,x,y,t);
    return true;
  }
  function safeBlock(x,y,t,protectedSet){
    if(!in980(x,y)||isReservedCell(x,y)||protectedSet?.has(key980(x,y)))return false;
    const old=state.map[y][x];
    if(IMMUTABLE_TILES.has(old)||old===TT.DOOR||old===TT.OPEN_DOOR||!isFloorLike(old))return false;
    setTerrainTile58(state.map,x,y,t);
    return true;
  }
  function markFloor(x,y,style){
    if(!in980(x,y))return;
    state.floorStyle980=state.floorStyle980||{};
    state.floorStyle980[key980(x,y)]=style;
  }
  function markWall(x,y,style){
    if(!in980(x,y)||state.map[y][x]!==TT.WALL)return;
    state.wallStyle980=state.wallStyle980||{};
    state.wallStyle980[key980(x,y)]=style;
  }
  function markRoom(r,style,wallStyle=style){
    if(!r)return;
    for(let y=Math.max(1,r.y);y<Math.min(ROWS-1,r.y+r.h);y++)for(let x=Math.max(1,r.x);x<Math.min(COLS-1,r.x+r.w);x++){
      if(state.map[y][x]===TT.WALL)markWall(x,y,wallStyle);
      else if(planned980(state.map[y][x]))markFloor(x,y,style);
    }
  }
  function addNamedFeature(name,r,kind='landmark'){
    if(!r)return;
    state.featureRooms=state.featureRooms||[];
    state.featureRooms.push({name,x:r.x,y:r.y,w:r.w,h:r.h,cx:r.cx??(r.x+Math.floor(r.w/2)),cy:r.cy??(r.y+Math.floor(r.h/2)),kind980:kind});
  }
  function roomContains(r,x,y){return r&&x>=r.x&&y>=r.y&&x<r.x+r.w&&y<r.y+r.h}
  function roomProtected(r){return roomContains(r,state.player.x,state.player.y)||roomContains(r,state.stairs.x,state.stairs.y)}
  function roomCenter(r){return{x:r.cx??r.x+Math.floor(r.w/2),y:r.cy??r.y+Math.floor(r.h/2)}}
  function protectedPathCells(radius=1){
    const set=new Set();for(const p of ReachabilityService.plannedPath({key980,in980,planned980}))for(let oy=-radius;oy<=radius;oy++)for(let ox=-radius;ox<=radius;ox++)if(in980(p.x+ox,p.y+oy))set.add(key980(p.x+ox,p.y+oy));return set;
  }
  function validateNormal(){return ReachabilityService.plannedPath({key980,in980,planned980}).length>0}
  function restoreFloorBackup(backup){
    state.map=cloneTerrainMap58(backup.map);
    state.rooms=backup.rooms.map(r=>({...r}));
    state.featureRooms=backup.features.map(r=>({...r}));
    state.floorStyle980={...backup.floorStyle};
    state.wallStyle980={...backup.wallStyle};
    if(backup.layoutName!=null)state.layoutName=backup.layoutName;
    for(let i=0;i<Math.min((state.items||[]).length,backup.itemPos.length);i++){state.items[i].x=backup.itemPos[i].x;state.items[i].y=backup.itemPos[i].y}
    for(let i=0;i<Math.min((state.monsters||[]).length,backup.monPos.length);i++){state.monsters[i].x=backup.monPos[i].x;state.monsters[i].y=backup.monPos[i].y}
  }
  function backupFloor(){return{
    map:cloneTerrainMap58(state.map),rooms:(state.rooms||[]).map(r=>({...r})),features:(state.featureRooms||[]).map(r=>({...r})),
    floorStyle:{...(state.floorStyle980||{})},wallStyle:{...(state.wallStyle980||{})},layoutName:state.layoutName,
    itemPos:(state.items||[]).map(i=>({x:i.x,y:i.y})),monPos:(state.monsters||[]).map(m=>({x:m.x,y:m.y}))
  }}
  function wallLine(r,horizontal,pos,gaps,protectedSet,style){
    if(horizontal){
      const y=pos;for(let x=r.x+1;x<r.x+r.w-1;x++){if(gaps.includes(x)){if(isFloorLike(state.map[y][x]))setTerrainTile58(state.map,x,y,TT.DOOR);continue}if(protectedSet.has(key980(x,y)))continue;safeBlock(x,y,TT.WALL,protectedSet);markWall(x,y,style)}
    }else{
      const x=pos;for(let y=r.y+1;y<r.y+r.h-1;y++){if(gaps.includes(y)){if(isFloorLike(state.map[y][x]))setTerrainTile58(state.map,x,y,TT.DOOR);continue}if(protectedSet.has(key980(x,y)))continue;safeBlock(x,y,TT.WALL,protectedSet);markWall(x,y,style)}
    }
  }
  function innerRoom(r,protectedSet,style,centerTile){
    if(!r||r.w<11||r.h<9||roomProtected(r))return false;
    const w=Math.min(7,r.w-4),h=Math.min(7,r.h-4),x=r.cx-Math.floor(w/2),y=r.cy-Math.floor(h/2);
    const border=[];for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)if(xx===x||yy===y||xx===x+w-1||yy===y+h-1)border.push({x:xx,y:yy});
    if(border.some(p=>protectedSet.has(key980(p.x,p.y))||isReservedCell(p.x,p.y)))return false;
    for(const p of border){setTerrainTile58(state.map,p.x,p.y,TT.WALL);markWall(p.x,p.y,style)}
    for(let yy=y+1;yy<y+h-1;yy++)for(let xx=x+1;xx<x+w-1;xx++){if(isFloorLike(state.map[yy][xx]))markFloor(xx,yy,style)}
    const horizontal=hash980(r.cx,r.cy,3)>.5;
    if(horizontal){setTerrainTile58(state.map,x,r.cy,TT.DOOR);setTerrainTile58(state.map,x+w-1,r.cy,TT.DOOR)}else{setTerrainTile58(state.map,r.cx,y,TT.DOOR);setTerrainTile58(state.map,r.cx,y+h-1,TT.DOOR)}
    if(centerTile&&safeGround(r.cx,r.cy,centerTile,protectedSet)){}
    addNamedFeature('방 속 내실', {x,y,w,h,cx:r.cx,cy:r.cy}, 'inner-room');V980.modules.push('room-in-room');return true;
  }
  function sideGallery(r,protectedSet,style,decorTile){
    if(!r||r.w<10||r.h<8||roomProtected(r))return false;
    const horizontal=r.w>=r.h,pos=horizontal?(hash980(r.cx,r.cy,7)>.5?r.y+2:r.y+r.h-3):(hash980(r.cx,r.cy,7)>.5?r.x+2:r.x+r.w-3);
    const gaps=horizontal?[r.cx-2,r.cx+2].filter(x=>x>r.x+1&&x<r.x+r.w-2):[r.cy-2,r.cy+2].filter(y=>y>r.y+1&&y<r.y+r.h-2);
    wallLine(r,horizontal,pos,gaps,protectedSet,style);
    for(const g of gaps)if(horizontal){setTerrainTile58(state.map,g,pos,TT.DOOR)}else setTerrainTile58(state.map,pos,g,TT.DOOR);
    if(decorTile){
      const pts=horizontal?[[r.x+2,pos+(pos<r.cy?-1:1)],[r.x+r.w-3,pos+(pos<r.cy?-1:1)]]:[[pos+(pos<r.cx?-1:1),r.y+2],[pos+(pos<r.cx?-1:1),r.y+r.h-3]];
      for(const[x,y]of pts)safeBlock(x,y,decorTile,protectedSet);
    }
    addNamedFeature('측면 우회 회랑',r,'side-gallery');V980.modules.push('side-gallery');return true;
  }
  function addCloister(r,protectedSet,style,blockTile){
    if(!r||r.w<11||r.h<9||roomProtected(r))return false;
    const rx=2,ry=2,cells=[];for(let y=r.cy-ry;y<=r.cy+ry;y++)for(let x=r.cx-rx;x<=r.cx+rx;x++)if(Math.abs(x-r.cx)<=rx&&Math.abs(y-r.cy)<=ry)cells.push({x,y});
    if(cells.some(p=>protectedSet.has(key980(p.x,p.y))||isReservedCell(p.x,p.y)))return false;
    for(const p of cells){safeBlock(p.x,p.y,blockTile,protectedSet);markFloor(p.x,p.y,style)}
    for(let y=r.cy-3;y<=r.cy+3;y++)for(let x=r.cx-3;x<=r.cx+3;x++)if(in980(x,y)&&isFloorLike(state.map[y][x]))markFloor(x,y,style);
    addNamedFeature('환형 회랑 중정',r,'cloister');V980.modules.push('cloister');return true;
  }
  function addVestibuleRoom(r,protectedSet,style){
    if(!r||r.w<9||r.h<7||roomProtected(r))return false;
    const horizontal=r.w>=r.h,pos=horizontal?r.y+2:r.x+2,gaps=horizontal?[r.cx]:[r.cy];
    wallLine(r,horizontal,pos,gaps,protectedSet,style);if(horizontal)setTerrainTile58(state.map,r.cx,pos,TT.DOOR);else setTerrainTile58(state.map,pos,r.cy,TT.DOOR);
    addNamedFeature('문·전실·본실',r,'vestibule');V980.modules.push('vestibule');return true;
  }
  function addSemiOpenRoom(r,protectedSet,style,columnTile){
    if(!r||r.w<10||r.h<7||roomProtected(r))return false;
    const horizontal=r.w>=r.h,side=hash980(r.cx,r.cy,13)>.5?1:-1;
    if(horizontal){const y=side>0?r.y+r.h-1:r.y;for(let x=r.cx-3;x<=r.cx+3;x++){if(!in980(x,y)||protectedSet.has(key980(x,y)))continue;if(Math.abs(x-r.cx)%3===0)setTerrainTile58(state.map,x,y,columnTile);else setTerrainTile58(state.map,x,y,TT.FLOOR);markFloor(x,y,style)}}
    else{const x=side>0?r.x+r.w-1:r.x;for(let y=r.cy-3;y<=r.cy+3;y++){if(!in980(x,y)||protectedSet.has(key980(x,y)))continue;if(Math.abs(y-r.cy)%3===0)setTerrainTile58(state.map,x,y,columnTile);else setTerrainTile58(state.map,x,y,TT.FLOOR);markFloor(x,y,style)}}
    addNamedFeature('반개방 홀',r,'semi-open');V980.modules.push('semi-open');return true;
  }
  function roomPathStyle(r,style,tile=TT.STONE_PATH){
    if(!r)return;const horiz=r.w>=r.h;for(let i=horiz?r.x+1:r.y+1;i<(horiz?r.x+r.w-1:r.y+r.h-1);i++){const x=horiz?i:r.cx,y=horiz?r.cy:i;if(in980(x,y)&&isFloorLike(state.map[y][x])){setTerrainTile58(state.map,x,y,tile);markFloor(x,y,style)}}
  }
  function normalQuality(){
    const f=state.floor;if(!V980.normalFloors.has(f)||state.specialFloor)return;
    const backup=backupFloor(),protectedSet=protectedPathCells(1),rooms=[...(state.rooms||[])].filter(r=>r.w>=8&&r.h>=7).sort((a,b)=>b.w*b.h-a.w*a.h);
    if(!rooms.length)return;
    const z=region980(),styles=[['r2_indoor','r2_outdoor'],['r2_indoor','r2_outdoor'],['r3_silk','r3_moon'],['r3_silk','r3_moon'],['r4_storage','r4_cellar'],['r4_storage','r4_cellar']][Math.max(0,[7,9,12,14,17,19].indexOf(f))]||['generic','generic'];
    // Locked normal floors keep the proven key/door graph intact. Only visual zoning is added here.
    if(state.keyPlan96){
      for(const r of rooms.slice(0,6))markRoom(r,styles[hash980(r.cx,r.cy,17)>.5?0:1]);
      state.qualityLockConservative980=true;
      V980.modules.push('lock-safe-visual-zoning');
      return;
    }
    const a=rooms.find(r=>!roomProtected(r)),b=rooms.find(r=>r!==a&&!roomProtected(r)),c=rooms.find(r=>r!==a&&r!==b&&!roomProtected(r));
    if(f===7){addSemiOpenRoom(a,protectedSet,styles[1],TT.GARDEN_TREE);addCloister(b,protectedSet,styles[0],TT.GARDEN_TREE);roomPathStyle(a,styles[1],TT.STONE_PATH)}
    else if(f===9){innerRoom(a,protectedSet,styles[0],TT.PAVILION);sideGallery(b,protectedSet,styles[1],TT.LOW_FENCE);if(c)roomPathStyle(c,styles[1],TT.PAPER_BRIDGE)}
    else if(f===12){innerRoom(a,protectedSet,styles[0],TT.MIRROR);sideGallery(b,protectedSet,styles[1],TT.STATUE);if(c)addVestibuleRoom(c,protectedSet,styles[0])}
    else if(f===14){addVestibuleRoom(a,protectedSet,styles[0]);addCloister(b,protectedSet,styles[1],TT.MIRROR);if(c)sideGallery(c,protectedSet,styles[0],TT.WALL_BANNER)}
    else if(f===17){sideGallery(a,protectedSet,styles[0],TT.RACK);innerRoom(b,protectedSet,styles[0],TT.CACHE);if(c)addVestibuleRoom(c,protectedSet,styles[1])}
    else if(f===19){addCloister(a,protectedSet,styles[1],TT.STONE_PILLAR);sideGallery(b,protectedSet,styles[0],TT.JAR);if(c)innerRoom(c,protectedSet,styles[1],TT.FOUNTAIN)}
    for(const r of rooms.slice(0,5))markRoom(r,styles[hash980(r.cx,r.cy,17)>.5?0:1]);
    // Connectivity repair runs before validation so local vault modules survive instead of being discarded wholesale.
    try{if(!state.keyPlan96&&typeof ensureNormalConnectivity==='function')ensureNormalConnectivity()}catch(error){ignoreError('connectivity repair failed; validation that follows decides',error)}
    const validStructure=validateNormal();
    if(!validStructure){
      restoreFloorBackup(backup);
      // Preserve non-blocking visual zoning even if a rare structural insertion is rejected.
      for(const r of rooms.slice(0,5))markRoom(r,styles[hash980(r.cx,r.cy,17)>.5?0:1]);
      state.qualityRejected980=(state.qualityRejected980||0)+1;
    }
  }
  function lineOwn(x0,y0,x1,y1,t=TT.FLOOR,w=1){
    let x=x0,y=y0,flip=hash980(x0+y0,x1+y1,997)>.5,guard=0;
    const stamp=(cx,cy)=>{const lo=-Math.floor((w-1)/2),hi=Math.floor(w/2);for(let oy=lo;oy<=hi;oy++)for(let ox=lo;ox<=hi;ox++)if(in980(cx+ox,cy+oy)&&!IMMUTABLE_TILES.has(state.map[cy+oy][cx+ox]))setTerrainTile58(state.map,cx+ox,cy+oy,t)};
    stamp(x,y);while((x!==x1||y!==y1)&&guard++<2000){if(x!==x1&&y!==y1){if(flip)x+=Math.sign(x1-x);else y+=Math.sign(y1-y);flip=!flip}else if(x!==x1)x+=Math.sign(x1-x);else y+=Math.sign(y1-y);stamp(x,y)}
  }
  function walledBoxOwn(x,y,w,h,t=TT.FLOOR){
    x=Math.max(1,Math.min(COLS-w-1,Math.floor(x)));y=Math.max(1,Math.min(ROWS-h-1,Math.floor(y)));
    for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++){if(!in980(xx,yy))continue;setTerrainTile58(state.map,xx,yy,(xx===x||yy===y||xx===x+w-1||yy===y+h-1)?TT.WALL:t)}
    const r={x,y,w,h,cx:x+Math.floor(w/2),cy:y+Math.floor(h/2)};state.rooms=state.rooms||[];state.rooms.push(r);return r;
  }
  function blobOwn(cx,cy,rx,ry,t=TT.FLOOR){
    for(let y=Math.max(1,cy-ry-1);y<=Math.min(ROWS-2,cy+ry+1);y++)for(let x=Math.max(1,cx-rx-1);x<=Math.min(COLS-2,cx+rx+1);x++){const nx=(x-cx)/(rx+.25),ny=(y-cy)/(ry+.25),n=(hash980(x,y,1001)-.5)*.22;if(nx*nx+ny*ny+n<=1&&!IMMUTABLE_TILES.has(state.map[y][x]))setTerrainTile58(state.map,x,y,t)}
    const r={x:cx-rx-1,y:cy-ry-1,w:rx*2+3,h:ry*2+3,cx,cy};state.rooms=state.rooms||[];state.rooms.push(r);return r;
  }
  function carveRectKeepingFixed(x,y,w,h,t=TT.FLOOR){for(let yy=Math.max(1,y);yy<Math.min(ROWS-1,y+h);yy++)for(let xx=Math.max(1,x);xx<Math.min(COLS-1,x+w);xx++)if(!IMMUTABLE_TILES.has(state.map[yy][xx]))setTerrainTile58(state.map,xx,yy,t)}
  function blockRect(x,y,w,h,t=TT.WALL,protectedSet=null){for(let yy=Math.max(1,y);yy<Math.min(ROWS-1,y+h);yy++)for(let xx=Math.max(1,x);xx<Math.min(COLS-1,x+w);xx++)safeBlock(xx,yy,t,protectedSet)}
  function addPond(cx,cy,rx,ry,bridge=true){for(let y=cy-ry;y<=cy+ry;y++)for(let x=cx-rx;x<=cx+rx;x++){const nx=(x-cx)/Math.max(1,rx),ny=(y-cy)/Math.max(1,ry);if(nx*nx+ny*ny<=1&&safeGround(x,y,TT.WATER))markFloor(x,y,'water')}
    if(bridge){for(let x=cx-rx;x<=cx+rx;x++)if(in980(x,cy)&&state.map[cy][x]===TT.WATER)setTerrainTile58(state.map,x,cy,TT.PAPER_BRIDGE);}
  }
  function decorateRoom(r,style,tiles,density=.08,edge=true){
    if(!r)return;markRoom(r,style);
    for(let y=r.y+1;y<r.y+r.h-1;y++)for(let x=r.x+1;x<r.x+r.w-1;x++){
      if(!isFloorLike(state.map[y][x])||isReservedCell(x,y))continue;
      const near=edge&&(x-r.x<3||r.x+r.w-1-x<3||y-r.y<3||r.y+r.h-1-y<3);if(edge&&!near)continue;
      if(hash980(x,y,23)<density){const t=tiles[Math.floor(hash980(x,y,29)*tiles.length)%tiles.length];if(tileBlocks(t))safeBlock(x,y,t,protectedPathCells(0));else safeGround(x,y,t)}
    }
  }
  function addBridge(a,b,t=TT.PAPER_BRIDGE,w=1){lineOwn(a.x,a.y,b.x,b.y,t,w)}
  function roomByCenter(x,y){let best=null,bd=1e9;for(const r of state.rooms||[]){const c=roomCenter(r),d=Math.abs(c.x-x)+Math.abs(c.y-y);if(d<bd){bd=d;best=r}}return best}
  function special6_(){
    const rooms=state.rooms||[],center=rooms.find(r=>r.cx===35&&r.cy===29)||rooms.sort((a,b)=>b.w*b.h-a.w*a.h)[0];
    if(center){for(let y=center.y+1;y<center.y+center.h-1;y++)for(let x=center.x+1;x<center.x+center.w-1;x++){if(isFloorLike(state.map[y][x])){setTerrainTile58(state.map,x,y,TT.WOOD_FLOOR);markFloor(x,y,'f6_indoor')}}addPond(center.cx,center.cy+1,2,1,true);decorateRoom(center,'f6_indoor',[TT.PAPER_CRANE,TT.BENCH,TT.FLOWERBED],.18,true);addNamedFeature('수중 수목원 본관',center,'special')}
    const top=rooms.filter(r=>r.cy<18&&r!==center),bottom=rooms.filter(r=>r.cy>38&&r!==center),mid=rooms.filter(r=>r.cy>=18&&r.cy<=38&&r!==center);
    for(const r of top){for(let y=r.y+1;y<r.y+r.h-1;y++)for(let x=r.x+1;x<r.x+r.w-1;x++)if(isFloorLike(state.map[y][x])){setTerrainTile58(state.map,x,y,hash980(x,y,31)>.45?TT.GRASS:TT.LIGHT_GRASS);markFloor(x,y,'f6_lotus')}decorateRoom(r,'f6_lotus',[TT.GARDEN_TREE,TT.BAMBOO,TT.LOTUS_FLOWER],.11,true)}
    for(const r of bottom)decorateRoom(r,'f6_boardwalk',[TT.LANTERN_POST,TT.LOW_FENCE,TT.FLOWERBED],.10,true);
    for(const r of mid)markRoom(r,'f6_watergarden');
    if(center&&top[1])addBridge(roomCenter(center),roomCenter(top[1]),TT.PAPER_BRIDGE,1);
    if(center&&bottom[1])addBridge(roomCenter(center),roomCenter(bottom[1]),TT.PAPER_BRIDGE,1);
    const extra1=blobOwn(61,12,4,3,TT.GRASS),extra2=blobOwn(61,45,4,3,TT.WOOD_FLOOR);addBridge(roomCenter(extra1),roomCenter(roomByCenter(49,27)),TT.PAPER_BRIDGE,1);addBridge(roomCenter(extra2),roomCenter(roomByCenter(71,42)),TT.PAPER_BRIDGE,1);
    decorateRoom(extra1,'f6_lotus',[TT.GARDEN_TREE,TT.LOTUS_FLOWER,TT.ROCK],.16,true);decorateRoom(extra2,'f6_boardwalk',[TT.PAPER_CRANE,TT.BENCH],.15,true);
    addNamedFeature('동쪽 연꽃섬',extra1,'special');addNamedFeature('남동 목교 누각',extra2,'special');
  }
  function clearing8_(cx,cy,rx,ry,style){
    for(let y=cy-ry;y<=cy+ry;y++)for(let x=cx-rx;x<=cx+rx;x++){const nx=(x-cx)/rx,ny=(y-cy)/ry;if(nx*nx+ny*ny<=1&&in980(x,y)){setTerrainTile58(state.map,x,y,hash980(x,y,39)>.55?TT.GRASS:TT.FLOOR);markFloor(x,y,style)}}
  }
  function special8_(){
    const p=protectedPathCells(1),cs=[
      [17,12,7,5,'f8_teahouse'],[66,12,8,6,'f8_rainpond'],[43,27,9,7,'f8_court'],
      [18,44,7,5,'f8_cutyard'],[67,44,8,6,'f8_shrine'],[43,47,6,4,'f8_paperwork']
    ];
    for(const c of cs)clearing8_(...c);
    // A two-tile processional route links the major glades; smaller maze branches remain intact.
    lineOwn(17,12,43,27,TT.FLOOR,2);lineOwn(43,27,66,12,TT.FLOOR,2);
    lineOwn(43,27,18,44,TT.FLOOR,2);lineOwn(43,27,67,44,TT.FLOOR,2);lineOwn(43,27,43,47,TT.FLOOR,2);
    // A shallow rain creek breaks the uniform bamboo field without sealing the mandatory path.
    const crossings=new Set([25,48,71]);
    for(let x=6;x<COLS-6;x++){
      const cy=Math.round(34+Math.sin(x/7.5)*3);
      for(let oy=-1;oy<=1;oy++) if(!p.has(key980(x,cy+oy))) safeGround(x,cy+oy,TT.WATER,p);
      if(crossings.has(x))for(let oy=-2;oy<=2;oy++)if(in980(x,cy+oy)&&state.map[cy+oy][x]===TT.WATER)setTerrainTile58(state.map,x,cy+oy,TT.PAPER_BRIDGE);
    }
    addPond(66,12,5,3,true);addPond(18,44,3,2,true);
    setTerrainTile58(state.map,43,27,TT.PAVILION);setTerrainTile58(state.map,17,12,TT.COOKPOT);setTerrainTile58(state.map,67,44,TT.ALTAR);setTerrainTile58(state.map,43,47,TT.RUMOR);
    // Clearings have different internal silhouettes instead of identical circles.
    for(const [cx,cy,rx,ry,style] of cs){
      const ring=Math.max(rx,ry)-1;
      for(let i=0;i<12;i++){
        const a=i*Math.PI/6,x=Math.round(cx+Math.cos(a)*Math.max(3,rx-1)),y=Math.round(cy+Math.sin(a)*Math.max(3,ry-1));
        if(!in980(x,y)||p.has(key980(x,y))||!isFloorLike(state.map[y][x]))continue;
        const t=style==='f8_paperwork'?(i%2?TT.PAPER_CRANE:TT.LOW_FENCE):(i%3===0?TT.GARDEN_TREE:i%3===1?TT.BAMBOO:TT.ROCK);
        safeBlock(x,y,t,p);
      }
      const r={x:cx-rx,y:cy-ry,w:rx*2+1,h:ry*2+1,cx,cy};markRoom(r,style,'f8_bamboo');
    }
    // Two compact side yards add optional navigation decisions and purpose.
    const west=walledBoxOwn(5,20,10,8,TT.WOOD_FLOOR),east=walledBoxOwn(COLS-15,24,10,8,TT.GRASS);
    setTerrainTile58(state.map,west.x+west.w-1,west.cy,TT.DOOR);lineOwn(west.x+west.w,west.cy,22,west.cy,TT.FLOOR,1);setTerrainTile58(state.map,west.cx,west.cy,TT.CACHE);
    setTerrainTile58(state.map,east.x,east.cy,TT.DOOR);lineOwn(east.x-1,east.cy,COLS-22,east.cy,TT.FLOOR,1);setTerrainTile58(state.map,east.cx,east.cy,TT.FOUNTAIN);
    markRoom(west,'f8_paperwork','f8_bamboo');markRoom(east,'f8_rainpond','f8_bamboo');
    addNamedFeature('죽림 찻집',{x:10,y:7,w:15,h:11,cx:17,cy:12},'special');
    addNamedFeature('비맞이 연못원',{x:58,y:6,w:17,h:13,cx:66,cy:12},'special');
    addNamedFeature('대나무 중심정',{x:34,y:20,w:19,h:15,cx:43,cy:27},'special');
    addNamedFeature('서쪽 종이공방',west,'special');addNamedFeature('동쪽 샘마당',east,'special');
    for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++)if(state.map[y][x]===TT.BAMBOO||state.map[y][x]===TT.HEDGE)markWall(x,y,'f8_bamboo');
    state.layoutName='대나무 미로 · 찻집과 비맞이 연못 / 굽은 우수로 / 종이공방 / 다섯 공터';
  }
  function special10_(){
    const c={x:Math.floor(COLS/2),y:Math.floor(ROWS/2)};for(const r of state.rooms||[])markRoom(r,r.cx===c.x&&r.cy===c.y?'f10_center':'f10_paper');
    // broaden side galleries and add an irregular outer paper circuit
    for(const p of [[c.x-17,c.y],[c.x+17,c.y],[c.x,c.y-14],[c.x,c.y+14]])for(let y=p[1]-3;y<=p[1]+3;y++)for(let x=p[0]-4;x<=p[0]+4;x++)if(in980(x,y)&&state.map[y][x]===TT.WATER)setTerrainTile58(state.map,x,y,TT.FLOOR);
    const ring=[[c.x-17,c.y],[c.x-12,c.y-12],[c.x,c.y-14],[c.x+12,c.y-12],[c.x+17,c.y],[c.x+12,c.y+12],[c.x,c.y+14],[c.x-12,c.y+12]];
    for(let i=0;i<ring.length;i++)addBridge({x:ring[i][0],y:ring[i][1]},{x:ring[(i+1)%ring.length][0],y:ring[(i+1)%ring.length][1]},TT.PAPER_BRIDGE,1);
    for(const [x,y] of ring){if(in980(x,y)&&state.map[y][x]===TT.WATER)setTerrainTile58(state.map,x,y,TT.FLOOR);if(in980(x,y))setTerrainTile58(state.map,x,y,hash980(x,y,41)>.5?TT.MIRROR:TT.PAPER_CRANE)}
    addPond(c.x,c.y,3,2,false);setTerrainTile58(state.map,c.x,c.y,TT.PAVILION);addNamedFeature('오방 화폭 내환', {x:c.x-20,y:c.y-17,w:41,h:35,cx:c.x,cy:c.y});
  }
  function special11_(){
    for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++){if(state.map[y][x]===TT.WALL)markWall(x,y,'f11_canyon');else if(planned980(state.map[y][x]))markFloor(x,y,'f11_river')}
    const docks=[{x:18,y:30},{x:39,y:34},{x:58,y:27},{x:76,y:33}];for(const d of docks){for(let yy=d.y-2;yy<=d.y+2;yy++)for(let xx=d.x-3;xx<=d.x+3;xx++)if(in980(xx,yy)&&state.map[yy][xx]===TT.FLOOR){setTerrainTile58(state.map,xx,yy,TT.STONE_PATH);markFloor(xx,yy,'f11_dock')}for(const [ox,oy] of [[-3,-2],[3,-2],[-3,2],[3,2]])if(in980(d.x+ox,d.y+oy)&&isFloorLike(state.map[d.y+oy][d.x+ox]))setTerrainTile58(state.map,d.x+ox,d.y+oy,hash980(d.x+ox,d.y+oy,43)>.5?TT.ROCK:TT.LANTERN_POST)}
    // Two compact perfume chambers carved into the canyon walls.
    for(const [x,y] of [[29,7],[65,49]]){const r=walledBoxOwn(x,y,10,8,TT.MOON_STONE);markRoom(r,'f11_cave','f11_canyon');setTerrainTile58(state.map,r.cx,r.cy,TT.RUMOR);const near=roomByCenter(x<46?39:58,y<30?34:27);if(near)lineOwn(r.cx,r.cy,near.cx,near.cy,TT.FLOOR,1);addNamedFeature('향료 압착굴',r,'special')}
  }
  function special13_(){
    const protectedSet=protectedPathCells(1),rooms=[...(state.rooms||[])].filter(r=>r.w>=9&&r.h>=7&&!roomProtected(r)).sort((a,b)=>b.w*b.h-a.w*a.h);
    if(rooms[0])innerRoom(rooms[0],protectedSet,'f13_inner',TT.MIRROR);if(rooms[1])sideGallery(rooms[1],protectedSet,'f13_gallery',TT.WALL_BANNER);if(rooms[2])addCloister(rooms[2],protectedSet,'f13_mirror',TT.MIRROR);if(rooms[3])addVestibuleRoom(rooms[3],protectedSet,'f13_ante');
    for(let i=0;i<Math.min(8,rooms.length);i++)markRoom(rooms[i],i%2?'f13_mirror':'f13_silk');
  }
  function special15_(){
    const p=protectedPathCells(1),cx=Math.floor(COLS/2);
    // stage and backstage
    blockRect(7,5,COLS-14,12,TT.WALL,p);carveRectKeepingFixed(10,7,COLS-20,7,TT.DARK_WOOD);for(let x=10;x<COLS-10;x++)markFloor(x,10,'f15_stage');
    for(const x of [cx-5,cx,cx+5]){setTerrainTile58(state.map,x,16,TT.DOOR);lineOwn(x,16,x,23,TT.CARPET,1)}
    // side audience boxes
    for(const x of [5,17,COLS-28,COLS-16])for(const y of [20,33]){const r=walledBoxOwn(x,y,11,10,TT.DARK_WOOD);markRoom(r,'f15_box','f15_wall');setTerrainTile58(state.map,r.cx,r.cy,TT.MIRROR);setTerrainTile58(state.map,r.cx,r.y+r.h-1,TT.DOOR);addNamedFeature('거울 객석',r,'special')}
    // orchestra pit and central runway
    for(let x=cx-8;x<=cx+8;x++)for(let y=25;y<=29;y++)if(!p.has(key980(x,y)))setTerrainTile58(state.map,x,y,TT.MOON_STONE);
    for(let y=17;y<ROWS-3;y++)for(let dx=-1;dx<=1;dx++){const x=cx+dx;if(in980(x,y)&&isFloorLike(state.map[y][x])){setTerrainTile58(state.map,x,y,TT.CARPET);markFloor(x,y,'f15_runway')}}
    for(let y=20;y<ROWS-6;y+=6)for(const x of [cx-14,cx+14])if(in980(x,y)&&isFloorLike(state.map[y][x]))setTerrainTile58(state.map,x,y,TT.INCENSE_STAND);
    addNamedFeature('비단 대무대',{x:7,y:5,w:COLS-14,h:12,cx,cy:11},'special');addNamedFeature('중앙 활주로',{x:cx-2,y:16,w:5,h:ROWS-19,cx,cy:Math.floor(ROWS/2)},'special');
  }
  function special16_(){
    const p=protectedPathCells(1),rooms=state.rooms||[];
    for(const r of rooms){if(r.cx<30)markRoom(r,'f16_outer','f16_stone');else if(r.cx>68)markRoom(r,'f16_keep','f16_stone');else markRoom(r,'f16_court','f16_stone')}
    const keep=rooms.find(r=>r.w>=18&&r.h>=14&&r.cx>70);if(keep){innerRoom(keep,p,'f16_keep',TT.ARMORY);addCloister(keep,p,'f16_keep',TT.STONE_PILLAR);addNamedFeature('회색돌 내성 본관',keep,'special')}
    for(const r of rooms.filter(r=>r.cx<30&&r.w>=8))decorateRoom(r,'f16_outer',[TT.GARDEN_TREE,TT.ROCK,TT.LANTERN_POST],.10,true);
    for(let y=6;y<ROWS-6;y+=8)for(const x of [42,89])if(in980(x,y)&&isFloorLike(state.map[y][x]))setTerrainTile58(state.map,x,y,TT.STONE_PILLAR);
  }
  function clearWarehouse(r,p){
    const clutter=new Set([TT.RACK,TT.JAR,TT.CRATE,TT.STONE_PILLAR,TT.IRON_HOOK,TT.TABLE,TT.SCREEN,TT.LOW_FENCE,TT.BENCH]);
    for(let y=r.y+1;y<r.y+r.h-1;y++)for(let x=r.x+1;x<r.x+r.w-1;x++){
      if(p.has(key980(x,y))||isReservedCell(x,y))continue;
      if(clutter.has(state.map[y][x]))setTerrainTile58(state.map,x,y,TT.FLOOR);
    }
  }
  function carveAisle(r,horizontal,pos,width=1,t=TT.STONE_PATH){
    const lo=-Math.floor((width-1)/2),hi=Math.floor(width/2);
    if(horizontal){for(let o=lo;o<=hi;o++)for(let x=r.x+1;x<r.x+r.w-1;x++)if(in980(x,pos+o)&&isFloorLike(state.map[pos+o][x]))setTerrainTile58(state.map,x,pos+o,t)}
    else{for(let o=lo;o<=hi;o++)for(let y=r.y+1;y<r.y+r.h-1;y++)if(in980(pos+o,y)&&isFloorLike(state.map[y][pos+o]))setTerrainTile58(state.map,pos+o,y,t)}
  }
  function warehousePattern(r,idx,p){
    if(!r||r.w<12||r.h<12)return;clearWarehouse(r,p);
    const styles=['f18_receiving','f18_cold','f18_jar','f18_loading','f18_quarantine','f18_workshop'],style=styles[idx%styles.length];markRoom(r,style,'f18_wall');
    if(idx===0){
      // Receiving arcade: U-shaped rack bays around a broad cross aisle.
      carveAisle(r,true,r.cy,3);carveAisle(r,false,r.cx,2);
      for(const x of [r.x+3,r.x+r.w-4])for(let y=r.y+3;y<r.y+r.h-3;y++)if(Math.abs(y-r.cy)>2)safeBlock(x,y,TT.RACK,p);
      for(const y of [r.y+3,r.y+r.h-4])for(let x=r.x+4;x<r.x+r.w-4;x++)if(Math.abs(x-r.cx)>2&&x%3!==0)safeBlock(x,y,TT.CRATE,p);
      for(const [dx,dy] of [[-5,-5],[5,-5],[-5,5],[5,5]])safeBlock(r.cx+dx,r.cy+dy,TT.LANTERN_POST,p);
      addNamedFeature('입고 대회랑',r,'special');
    }else if(idx===1){
      // Cold store: four actual chambers around a central thaw court.
      for(let y=r.y+1;y<r.y+r.h-1;y++)for(let x=r.x+1;x<r.x+r.w-1;x++)if(isFloorLike(state.map[y][x]))setTerrainTile58(state.map,x,y,TT.MOON_STONE);
      wallLine(r,true,r.cy,[r.cx-5,r.cx+5],p,'f18_wall');
      wallLine(r,false,r.cx,[r.cy-5,r.cy+5],p,'f18_wall');
      for(const [x,y] of [[r.cx-5,r.cy],[r.cx+5,r.cy],[r.cx,r.cy-5],[r.cx,r.cy+5]])if(in980(x,y))setTerrainTile58(state.map,x,y,TT.DOOR);
      for(let y=r.cy-2;y<=r.cy+2;y++)for(let x=r.cx-2;x<=r.cx+2;x++)if(in980(x,y)&&!isReservedCell(x,y))setTerrainTile58(state.map,x,y,TT.FLOOR);
      for(const [dx,dy] of [[-6,-6],[6,-6],[-6,6],[6,6]])safeBlock(r.cx+dx,r.cy+dy,TT.STONE_PILLAR,p);
      addNamedFeature('사분 냉장고',r,'special');
    }else if(idx===2){
      // Jar sorting hall: alternating short rows form a readable serpentine route.
      carveAisle(r,false,r.cx,2);carveAisle(r,true,r.cy,2);
      let flip=false;
      for(let y=r.y+3;y<r.y+r.h-3;y+=4){
        const xa=flip?r.x+3:r.cx+3,xb=flip?r.cx-3:r.x+r.w-4;
        for(let x=Math.min(xa,xb);x<=Math.max(xa,xb);x++)if(Math.abs(x-r.cx)>2&&x%3!==0)safeBlock(x,y,TT.JAR,p);
        flip=!flip;
      }
      for(const [dx,dy] of [[-5,-3],[5,-3],[-5,3],[5,3]])safeBlock(r.cx+dx,r.cy+dy,TT.RACK,p);
      addNamedFeature('장독 분류고',r,'special');
    }else if(idx===3){
      // Loading rail hall: parallel lanes, loading islands, and broad turning pockets.
      const lanes=[r.cy-5,r.cy,r.cy+5];for(const y of lanes)carveAisle(r,true,y,2);
      for(let x=r.x+5;x<r.x+r.w-5;x+=7){
        for(const y of [r.cy-2,r.cy+2])for(let yy=y-1;yy<=y+1;yy++)for(let xx=x-1;xx<=x+1;xx++)safeBlock(xx,yy,(xx+yy)%2?TT.CRATE:TT.RACK,p);
      }
      carveAisle(r,false,r.cx,3);
      addNamedFeature('삼선 하역장',r,'special');
    }else if(idx===4){
      // Quarantine wing: small lockable cells around a central inspection cross.
      carveAisle(r,true,r.cy,3);carveAisle(r,false,r.cx,3);
      const xs=[r.x+Math.floor(r.w*.33),r.x+Math.floor(r.w*.66)],ys=[r.y+Math.floor(r.h*.33),r.y+Math.floor(r.h*.66)];
      for(const x of xs)wallLine(r,false,x,[r.cy],p,'f18_wall');
      for(const y of ys)wallLine(r,true,y,[r.cx],p,'f18_wall');
      for(const x of xs)if(in980(x,r.cy))setTerrainTile58(state.map,x,r.cy,TT.DOOR);
      for(const y of ys)if(in980(r.cx,y))setTerrainTile58(state.map,r.cx,y,TT.DOOR);
      for(const [dx,dy] of [[-5,-5],[5,-5],[-5,5],[5,5]])safeBlock(r.cx+dx,r.cy+dy,hash980(dx,dy,313)>.5?TT.IRON_HOOK:TT.JAR,p);
      addNamedFeature('검역 칸막이동',r,'special');
    }else{
      // Repair workshop: a central machinery court with four irregular work bays.
      paintRoomLoopGround(r,TT.STONE_PATH);carveAisle(r,true,r.cy,2);carveAisle(r,false,r.cx,2);
      for(const [dx,dy] of [[-6,-5],[6,-5],[-6,5],[6,5]]){
        for(let yy=r.cy+dy-2;yy<=r.cy+dy+2;yy++)for(let xx=r.cx+dx-2;xx<=r.cx+dx+2;xx++){
          if(Math.abs(xx-(r.cx+dx))===2||Math.abs(yy-(r.cy+dy))===2)safeBlock(xx,yy,TT.RACK,p);
        }
        safeBlock(r.cx+dx,r.cy+dy,TT.STONE_PILLAR,p);
      }
      for(const [dx,dy] of [[-3,0],[3,0],[0,-3],[0,3]])safeBlock(r.cx+dx,r.cy+dy,TT.CRATE,p);
      addNamedFeature('수리 공방',r,'special');
    }
    for(let x=r.x+1;x<r.x+r.w-1;x++)if(isFloorLike(state.map[r.cy][x])){setTerrainTile58(state.map,x,r.cy,TT.STONE_PATH);markFloor(x,r.cy,style)}
  }
  function special18_(){
    const p=protectedPathCells(1),rooms=(state.rooms||[]).filter(r=>r.w>=20&&r.h>=20).slice().sort((a,b)=>a.cy-b.cy||a.cx-b.cx);
    rooms.forEach((r,i)=>warehousePattern(r,i,p));
    const rear=(state.rooms||[]).find(r=>r.cx>80&&r.w<20);
    if(rear){
      clearWarehouse(rear,p);markRoom(rear,'f18_cold','f18_wall');
      for(let y=rear.y+3;y<rear.y+rear.h-3;y+=7){wallLine(rear,true,y,[rear.cx],p,'f18_wall');if(in980(rear.cx,y))setTerrainTile58(state.map,rear.cx,y,TT.DOOR)}
      carveAisle(rear,false,rear.cx,2);for(let y=rear.y+4;y<rear.y+rear.h-4;y+=7)for(const x of [rear.x+2,rear.x+rear.w-3])safeBlock(x,y,TT.IRON_HOOK,p);
      addNamedFeature('후면 검역 창고',rear,'special');
    }
    state.layoutName='철판 창고 · 입고 회랑 / 사분 냉장고 / 장독 분류고 / 삼선 하역장 / 검역동 / 수리 공방 / 잠긴 문';
  }
  function special20_(){
    const p=protectedPathCells(1),cx=Math.floor(COLS/2),wallStyle='f20_wall';
    // Three sequential courts: inspection yard -> furnace floor -> warden hall.
    for(const y of [17,36]){
      for(let x=22;x<=54;x++){
        if([26,cx,50].some(g=>Math.abs(x-g)<=1)){if(in980(x,y)&&state.map[y][x]===TT.WALL)setTerrainTile58(state.map,x,y,TT.FLOOR);continue}
        safeBlock(x,y,TT.WALL,p);markWall(x,y,wallStyle);
      }
      for(const g of [26,cx,50])if(in980(g,y))setTerrainTile58(state.map,g,y,TT.DOOR);
    }
    // Long side galleries make meaningful flanking routes without letting the player skip the whole arena.
    for(const x of [22,54]){
      for(let y=4;y<49;y++){
        if([10,22,31,44].some(g=>Math.abs(y-g)<=1)){if(in980(x,y)&&state.map[y][x]===TT.WALL)setTerrainTile58(state.map,x,y,TT.FLOOR);continue}
        safeBlock(x,y,TT.WALL,p);markWall(x,y,wallStyle);
      }
      for(const g of [10,22,31,44])if(in980(x,g))setTerrainTile58(state.map,x,g,TT.DOOR);
    }
    // Broad central iron catwalk.
    for(let y=4;y<ROWS-4;y++)for(let dx=-2;dx<=2;dx++){
      const x=cx+dx;if(in980(x,y)&&isFloorLike(state.map[y][x])){setTerrainTile58(state.map,x,y,TT.STONE_PATH);markFloor(x,y,'f20_catwalk')}
    }
    // Side prison cells connect into the galleries, not directly into a featureless field.
    for(const side of [-1,1])for(let y=7;y<ROWS-12;y+=11){
      const x=side<0?5:COLS-16,r=walledBoxOwn(x,y,11,9,TT.DARK_WOOD);markRoom(r,'f20_cell',wallStyle);
      setTerrainTile58(state.map,side<0?r.x+r.w-1:r.x,r.cy,TT.DOOR);
      setTerrainTile58(state.map,r.cx,r.cy,((y/11)|0)%2?TT.JAR:TT.IRON_HOOK);
      for(const [dx,dy] of [[-2,-2],[2,-2],[-2,2],[2,2]])safeBlock(r.cx+dx,r.cy+dy,TT.RACK,p);
      addNamedFeature('쇄문 감방',r,'special');
    }
    // Four forge bays with doors, lava vats, and machinery islands.
    const forgeBay=(x,y,w,h,doorRight)=>{
      const r={x,y,w,h,cx:x+Math.floor(w/2),cy:y+Math.floor(h/2)};
      for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++){
        const border=xx===x||yy===y||xx===x+w-1||yy===y+h-1;
        if(border)safeBlock(xx,yy,TT.WALL,p);else if(in980(xx,yy)&&state.map[yy][xx]===TT.WALL)setTerrainTile58(state.map,xx,yy,TT.FLOOR);
      }
      const dx=doorRight?x+w-1:x;if(in980(dx,r.cy))setTerrainTile58(state.map,dx,r.cy,TT.DOOR);
      for(let yy=r.cy-1;yy<=r.cy+1;yy++)for(let xx=r.cx-2;xx<=r.cx+2;xx++)if(in980(xx,yy)&&!p.has(key980(xx,yy))&&!isReservedCell(xx,yy))setTerrainTile58(state.map,xx,yy,TT.LAVA);
      for(const [ox,oy] of [[-3,-2],[3,-2],[-3,2],[3,2]])safeBlock(r.cx+ox,r.cy+oy,TT.STONE_PILLAR,p);
      markRoom(r,'f20_forge',wallStyle);addNamedFeature('용광 압착실',r,'special');
    };
    forgeBay(25,20,11,9,true);forgeBay(41,20,11,9,false);forgeBay(25,27,11,8,true);forgeBay(41,27,11,8,false);
    // Entry inspection pockets and upper execution dais create different combat rhythms per court.
    for(const [x,y] of [[28,42],[48,42],[28,12],[48,12]]){
      for(let yy=y-2;yy<=y+2;yy++)for(let xx=x-3;xx<=x+3;xx++)if(in980(xx,yy)&&isFloorLike(state.map[yy][xx]))markFloor(xx,yy,y<20?'f20_warden':'f20_inspection');
      for(const [ox,oy] of [[-3,-2],[3,-2],[-3,2],[3,2]])safeBlock(x+ox,y+oy,y<20?TT.IRON_HOOK:TT.RACK,p);
    }
    // A low iron loop around the boss dais prevents the final court from being an empty rectangle.
    const bossY=7;for(let x=cx-8;x<=cx+8;x++){if(Math.abs(x-cx)<=2)continue;safeBlock(x,bossY+5,TT.LOW_FENCE,p)}
    for(const x of [cx-8,cx+8])for(let y=bossY+1;y<=bossY+5;y++)if(y!==bossY+3)safeBlock(x,y,TT.LOW_FENCE,p);
    for(const [x,y] of [[cx-11,12],[cx+11,12],[cx-11,42],[cx+11,42]])safeBlock(x,y,TT.LANTERN_POST,p);
    addNamedFeature('중앙 쇠사슬 형틀로',{x:22,y:3,w:33,h:47,cx,cy:26},'special');
    addNamedFeature('상층 간수 처형정',{x:23,y:3,w:31,h:14,cx,cy:9},'special');
    state.layoutName='장고 보스 · 삼중 봉쇄정 / 중앙 형틀로 / 양측 감방회랑 / 사대 용광 압착실';
  }
  function special21_(){
    const rooms=state.rooms||[];for(const r of rooms)markRoom(r,r.w>=9?'f21_hub':'f21_island');
    const hubs=rooms.filter(r=>r.w>=9).slice(0,10);for(let i=0;i<hubs.length;i+=3){const a=hubs[i],b=hubs[i+1];if(a&&b)addBridge(roomCenter(a),roomCenter(b),TT.PAPER_BRIDGE,1)}
    for(const r of hubs.slice(2,8)){for(let y=r.cy-1;y<=r.cy+1;y++)for(let x=r.cx-1;x<=r.cx+1;x++)if(in980(x,y)&&isFloorLike(state.map[y][x])){setTerrainTile58(state.map,x,y,TT.MOON_STONE);markFloor(x,y,'f21_observatory')}if(in980(r.cx,r.cy))setTerrainTile58(state.map,r.cx,r.cy,hash980(r.cx,r.cy,47)>.5?TT.STAMINA_PAD:TT.GOLD_LAMP);addNamedFeature('위상 관측섬',r,'special')}
    for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++)if(state.map[y][x]===TT.VOID)markFloor(x,y,'f21_void');
  }
  function special22_(){
    const p=protectedPathCells(1),rooms=state.rooms||[],nave=rooms.find(r=>r.w===15&&r.h>30),sanct=rooms.find(r=>r.w>=23&&r.cy<15);
    if(nave){markRoom(nave,'f22_nave','f22_wall');for(let y=nave.y+3;y<nave.y+nave.h-3;y+=5)for(const x of [nave.x+2,nave.x+nave.w-3])safeBlock(x,y,TT.STONE_PILLAR,p);for(let y=nave.y+1;y<nave.y+nave.h-1;y++)if(isFloorLike(state.map[y][nave.cx])){setTerrainTile58(state.map,nave.cx,y,TT.GILDED_FLOOR);markFloor(nave.cx,y,'f22_nave')}}
    const side=rooms.filter(r=>r.w>=14&&r.h>=10&&r!==nave&&r!==sanct);side.forEach((r,i)=>{markRoom(r,i%2?'f22_chapel':'f22_cloister','f22_wall');if(i%2===0){addPond(r.cx,r.cy,2,1,true);decorateRoom(r,'f22_cloister',[TT.INCENSE_STAND,TT.LOTUS_FLOWER,TT.STONE_PILLAR],.12,true)}else{innerRoom(r,p,'f22_chapel',i%3?TT.ALTAR:TT.MIRROR)}});
    if(sanct){markRoom(sanct,'f22_sanctum','f22_wall');paintRoomLoopGround(sanct,TT.GILDED_FLOOR);addNamedFeature('대제단 성소',sanct,'special')}
  }
  function paintRoomLoopGround(r,t){if(!r||r.w<8||r.h<7)return;for(let x=r.x+2;x<r.x+r.w-2;x++){safeGround(x,r.y+2,t);safeGround(x,r.y+r.h-3,t)}for(let y=r.y+2;y<r.y+r.h-2;y++){safeGround(r.x+2,y,t);safeGround(r.x+r.w-3,y,t)}}
  function special23_(){
    const rooms=state.rooms||[],center=rooms.sort((a,b)=>b.w*b.h-a.w*a.h)[0];for(const r of rooms)markRoom(r,r===center?'f23_core':'f23_island');
    if(center){paintRoomLoopGround(center,TT.MOON_STONE);setTerrainTile58(state.map,center.cx,center.cy,TT.PAVILION);decorateRoom(center,'f23_core',[TT.STONE_PILLAR,TT.GOLD_LAMP],.15,true)}
    for(const r of rooms.filter(r=>r.w>=7).slice(5,13)){for(let y=r.y+1;y<r.y+r.h-1;y++)for(let x=r.x+1;x<r.x+r.w-1;x++)if(isFloorLike(state.map[y][x])){setTerrainTile58(state.map,x,y,TT.MOON_STONE);markFloor(x,y,'f23_pump')}if(in980(r.cx,r.cy))setTerrainTile58(state.map,r.cx,r.cy,hash980(r.cx,r.cy,53)>.5?TT.SWITCH:TT.STONE_PILLAR);addNamedFeature('수은 펌프섬',r,'special')}
    const cardinal=rooms.filter(r=>r.w>=9).slice(1,5);for(let i=0;i<cardinal.length;i++)for(let j=i+1;j<cardinal.length;j++)if(Math.abs(i-j)===1)addBridge(roomCenter(cardinal[i]),roomCenter(cardinal[j]),TT.DRAWBRIDGE_DOWN,1);
  }
  function special24_(){
    const p=protectedPathCells(1),quads=(state.rooms||[]).filter(r=>r.w>=35&&r.h>=10),tea=(state.rooms||[]).find(r=>r.w===15&&r.h===13);
    quads.forEach((r,i)=>{markRoom(r,i%2?'f24_orchard':'f24_stream','f24_hedge');for(let y=r.cy-3;y<=r.cy+3;y++)for(let x=r.cx-5;x<=r.cx+5;x++){if(!in980(x,y)||p.has(key980(x,y)))continue;if(state.map[y][x]===TT.HEDGE||state.map[y][x]===TT.PEACH_TREE)setTerrainTile58(state.map,x,y,hash980(x,y,59)>.42?TT.GRASS:TT.LIGHT_GRASS)}addPond(r.cx,r.cy,3,2,true);for(const [dx,dy] of [[-5,-3],[5,-3],[-5,3],[5,3]])safeBlock(r.cx+dx,r.cy+dy,TT.PEACH_TREE,p);addNamedFeature(i%2?'복숭아 과수원':'곡수 정원',r,'special')});
    if(tea){for(let y=tea.y+1;y<tea.y+tea.h-1;y++)for(let x=tea.x+1;x<tea.x+tea.w-1;x++)if(isFloorLike(state.map[y][x])){setTerrainTile58(state.map,x,y,TT.WOOD_FLOOR);markFloor(x,y,'f24_tea')}decorateRoom(tea,'f24_tea',[TT.PAPER_CRANE,TT.BENCH,TT.GOLD_LAMP],.16,true)}
  }
  function special25_(){
    const c={x:Math.floor(COLS/2),y:24};
    const platform=(cx,cy,rx,ry,t,style)=>{
      for(let y=cy-ry;y<=cy+ry;y++)for(let x=cx-rx;x<=cx+rx;x++){
        if(!in980(x,y)||isReservedCell(x,y))continue;
        const nx=(x-cx)/Math.max(1,rx),ny=(y-cy)/Math.max(1,ry);
        if(nx*nx+ny*ny<=1.05&&state.map[y][x]===TT.VOID){setTerrainTile58(state.map,x,y,t);markFloor(x,y,style)}
      }
      return{x:cx-rx,y:cy-ry,w:rx*2+1,h:ry*2+1,cx,cy};
    };
    // Central core: a mercury outer ring with a gilded cross-shaped fighting dais.
    const core=platform(c.x,c.y,6,5,TT.MOON_STONE,'f25_core');
    for(let y=c.y-4;y<=c.y+4;y++)for(let x=c.x-5;x<=c.x+5;x++){
      if(!in980(x,y)||isReservedCell(x,y)||state.map[y][x]===TT.VOID)continue;
      const d=Math.max(Math.abs(x-c.x)/5,Math.abs(y-c.y)/4);
      setTerrainTile58(state.map,x,y,d>.72?TT.MERCURY:(Math.abs(x-c.x)<=1||Math.abs(y-c.y)<=1?TT.GILDED_FLOOR:TT.MOON_STONE));
      markFloor(x,y,'f25_core');
    }
    // Four large cardinal sanctuaries.
    const cardinal=[[c.x,c.y-16],[c.x+21,c.y],[c.x,c.y+20],[c.x-21,c.y]];
    const cardRooms=[];
    for(let i=0;i<cardinal.length;i++){
      const[x,y]=cardinal[i],r=platform(x,y,5,4,i===0?TT.GILDED_FLOOR:TT.MOON_STONE,i===0?'f25_sanctum':'f25_shrine');cardRooms.push(r);
      setTerrainTile58(state.map,x,y,i===0?TT.GOLD:TT.STAMINA_PAD);
      for(const [ox,oy] of [[-3,-2],[3,-2],[-3,2],[3,2]])if(in980(x+ox,y+oy)&&state.map[y+oy][x+ox]!==TT.VOID)setTerrainTile58(state.map,x+ox,y+oy,i%2?TT.GOLD_LAMP:TT.STONE_PILLAR);
      addNamedFeature(i===0?'황금 위상 성소':'오방 위상 성소',r,'special');
    }
    // Inner diagonal sanctuaries create a second loop around the boss rather than four empty spokes.
    const diagonals=[[c.x-12,c.y-9],[c.x+12,c.y-9],[c.x+12,c.y+9],[c.x-12,c.y+9]],diagRooms=[];
    for(let i=0;i<diagonals.length;i++){
      const[x,y]=diagonals[i],r=platform(x,y,4,3,TT.MOON_STONE,'f25_mirror');diagRooms.push(r);
      // Hollow two cells to create crescent-like combat cover.
      for(const [ox,oy] of i%2===0?[[1,-1],[2,0],[1,1]]:[[-1,-1],[-2,0],[-1,1]])if(in980(x+ox,y+oy)&&!isReservedCell(x+ox,y+oy))setTerrainTile58(state.map,x+ox,y+oy,TT.VOID);
      setTerrainTile58(state.map,x,y,i%2?TT.MIRROR:TT.ALTAR);
      for(const [ox,oy] of [[-3,-2],[3,2]])if(in980(x+ox,y+oy)&&state.map[y+oy][x+ox]!==TT.VOID)setTerrainTile58(state.map,x+ox,y+oy,TT.GOLD_LAMP);
      addNamedFeature('월광 초승 성소',r,'special');
    }
    // Connect the inner loop and all cardinal rooms. Multiple routes remain, but none is a trivial straight spoke only.
    for(let i=0;i<diagRooms.length;i++)addBridge(roomCenter(diagRooms[i]),roomCenter(diagRooms[(i+1)%diagRooms.length]),i%2?TT.PAPER_BRIDGE:TT.DRAWBRIDGE_DOWN,1);
    addBridge(roomCenter(cardRooms[0]),roomCenter(diagRooms[0]),TT.DRAWBRIDGE_DOWN,1);addBridge(roomCenter(cardRooms[0]),roomCenter(diagRooms[1]),TT.PAPER_BRIDGE,1);
    addBridge(roomCenter(cardRooms[1]),roomCenter(diagRooms[1]),TT.DRAWBRIDGE_DOWN,1);addBridge(roomCenter(cardRooms[1]),roomCenter(diagRooms[2]),TT.PAPER_BRIDGE,1);
    addBridge(roomCenter(cardRooms[2]),roomCenter(diagRooms[2]),TT.DRAWBRIDGE_DOWN,1);addBridge(roomCenter(cardRooms[2]),roomCenter(diagRooms[3]),TT.PAPER_BRIDGE,1);
    addBridge(roomCenter(cardRooms[3]),roomCenter(diagRooms[3]),TT.DRAWBRIDGE_DOWN,1);addBridge(roomCenter(cardRooms[3]),roomCenter(diagRooms[0]),TT.PAPER_BRIDGE,1);
    for(const r of diagRooms)addBridge(c,roomCenter(r),TT.DRAWBRIDGE_DOWN,1);
    // Eight outer relay islands form a broken octagonal circuit with a few unstable sections.
    const outer=[];
    for(let i=0;i<8;i++){
      const a=i*Math.PI/4,x=Math.round(c.x+Math.cos(a)*30),y=Math.round(c.y+Math.sin(a)*19),r=platform(x,y,3,2,TT.MOON_STONE,'f25_outer');outer.push(r);
      setTerrainTile58(state.map,x,y,i%3===0?TT.CACHE:i%3===1?TT.GOLD_LAMP:TT.MIRROR);
      addNamedFeature('외환 위상 중계섬',r,'special');
    }
    for(let i=0;i<outer.length;i++){
      const a=roomCenter(outer[i]),b=roomCenter(outer[(i+1)%outer.length]);
      if(i%3===0){
        let x=a.x,y=a.y,step=0,guard=0;
        while((x!==b.x||y!==b.y)&&guard++<300){if(x!==b.x)x+=Math.sign(b.x-x);else y+=Math.sign(b.y-y);if(in980(x,y)&&state.map[y][x]===TT.VOID){const t=step++%4===2?TT.CRUMBLE:TT.PAPER_BRIDGE;setTerrainTile58(state.map,x,y,t);if(t===TT.CRUMBLE){state.crumbleBase60=state.crumbleBase60||{};state.crumbleBase60[key980(x,y)]=TT.VOID}}}
      }else addBridge(a,b,TT.PAPER_BRIDGE,1);
    }
    // Outer relays also feed the cardinal sanctuaries, producing nested loops and flank options.
    for(let i=0;i<8;i++)addBridge(roomCenter(outer[i]),roomCenter(cardRooms[Math.floor((i+1)/2)%4]),i%2?TT.PAPER_BRIDGE:TT.DRAWBRIDGE_DOWN,1);
    const boss=(state.monsters||[]).find(m=>m.boss);if(boss){boss.x=c.x;boss.y=c.y;setTerrainTile58(state.map,c.x,c.y,TT.GOLD)}
    addNamedFeature('천실핵 이중 내환',core,'special');
    state.layoutName='만루보주 보스 · 천실핵 이중 내환 / 초승 성소 / 오방 위상실 / 붕괴 외환';
  }
  function specialQuality(){
    const f=state.floor;if(!V980.specialFloors.has(f)||!state.specialFloor)return;
    state.floorStyle980={};state.wallStyle980={};
    try{
      if(f===6)special6_();else if(f===8)special8_();else if(f===10)special10_();else if(f===11)special11_();else if(f===13)special13_();else if(f===15)special15_();else if(f===16)special16_();else if(f===18)special18_();else if(f===20)special20_();else if(f===21)special21_();else if(f===22)special22_();else if(f===23)special23_();else if(f===24)special24_();else if(f===25)special25_();
    }catch(e){V980.errors.push(`special-${f}:${e}`);console.warn('[v9.8 special]',f,e)}
  }
  function itemToFeature(){
    if(!state?.items?.length||!state?.featureRooms?.length)return;
    const useful=state.featureRooms.filter(r=>r&&/성소|창고|무기|보급|정자|찻집|내실|감방|관측|펌프|제단|과수원|무대|객석|누각|압착굴/.test(r.name||''));if(!useful.length)return;
    const occupiedItems=new Set(state.items.map(i=>key980(i.x,i.y)));
    for(let i=0;i<state.items.length;i++){
      if(i%3!==0)continue;const it=state.items[i],r=useful[i%useful.length];let best=null,bd=1e9;
      for(let y=r.y+1;y<r.y+r.h-1;y++)for(let x=r.x+1;x<r.x+r.w-1;x++){
        const kk=key980(x,y);if(occupiedItems.has(kk)||isReservedCell(x,y)||!ReachabilityService.playerPassable(x,y)||state.map[y][x]===TT.STAIR)continue;const d=Math.abs(x-r.cx)+Math.abs(y-r.cy);if(d<bd){bd=d;best={x,y}}
      }
      if(best){occupiedItems.delete(key980(it.x,it.y));it.x=best.x;it.y=best.y;occupiedItems.add(key980(it.x,it.y))}
    }
  }
  const REQUIRED_LOCKS=new Set([14,18,19,22,24]);
  function safeVisualAfterLockFallback(){
    const z=region980(),styles=z===1?['r2_indoor','r2_outdoor']:z===2?['r3_silk','r3_moon']:z===3?['r4_storage','r4_cellar']:['generic','generic'];
    const rooms=[...(state.rooms||[])].filter(r=>r&&r.w>=6&&r.h>=5).slice(0,8);
    for(const r of rooms)markRoom(r,styles[hash980(r.cx,r.cy,801)>.5?0:1]);
    V980.modules.push('lock-fallback-visual-only');
  }
  function qualityApply(renderPrep=true){if(state?.specialFloor&&[23,24].includes(state.floor)){state.qualityVersion980=V980.version;state.qualityModules980=[];if(renderPrep){VisibilityService.compute();vfBuildDecor()}return}
    if(!state||state.qualityVersion980===V980.version||state.floor<6)return;
    state.floorStyle980={};state.wallStyle980={};V980.modules=[];
    state.qualityLockFallback980=false;
    const lockBackup=state.keyPlan96?backupFloor():null;
    if(state.specialFloor)specialQuality();else normalQuality();
    itemToFeature();
    try{window.__MANRU_RUNTIME81__?.Integrity81?.repair?.()}catch(e){V980.errors.push(`repair:${e}`)}
    try{if(!state.specialFloor&&!state.keyPlan96&&typeof ensureNormalConnectivity==='function')ensureNormalConnectivity()}catch(e){V980.errors.push(`connect:${e}`)}
    try{window.__MANRU_RUNTIME81__?.Integrity81?.repair?.()}catch(error){ignoreError('integrity repair failed; the next validation catches it',error)}
    // Never rewrite/reinstall key plans after architecture work. If the exact original lock graph was disturbed,
    // restore its map and entity positions, then apply visual-only zoning.
    if(lockBackup&&!lockAuditOkay980()){
      restoreFloorBackup(lockBackup);
      V980.modules=[];
      state.qualityLockFallback980=true;
      safeVisualAfterLockFallback();
    }
    if(renderPrep)try{VisibilityService.compute();vfBuildDecor();}catch(e){V980.errors.push(`renderprep:${e}`)}
    state.qualityVersion980=V980.version;
    state.qualityModules980=[...V980.modules];
  }
  function reachableRoomCenters(reach){
    const out=[];for(const r of state.rooms||[]){const c=roomCenter(r);if(in980(c.x,c.y)&&reachPass981(c.x,c.y,{unlock:true}))out.push({room:r,reachable:reach.cells.has(key980(c.x,c.y))})}return out;
  }
  function relocateItems(){if(!state)return{moved:0,total:0,unreachable:0};const reach=state.floor===21?ReachabilityService.mechanicalBlinkReach({expectedBlink981,key980,floor21Stand981,raftDockPairs981,tileReveal981,blinkBlock981,in980},{unlock:true,rafts:true,portals:true,blinkRange:4}):ReachabilityService.mechanicalReach({expectedBlink981,key980,reachPass981,raftDockPairs981,tileReveal981,blinkBlock981,in980},{unlock:true,rafts:true,portals:true}),result=PlacementService.validateItems({reachable:reach.cells});state.itemReach981={moved:result.moved,total:state.items.length,unreachable:result.bad,range:reach.range,exit:reach.exit};return state.itemReach981}
  function relocateLandMonsters(reach){
    const occ=new Set((state.monsters||[]).map(m=>key980(m.x,m.y)));let moved=0;
    for(const m of state.monsters||[]){if(m.boss||m.aquatic||m.flying||reach.cells.has(key980(m.x,m.y)))continue;let best=null,bd=1e9;for(const k of reach.cells){const [x,y]=k.split(',').map(Number);if(occ.has(k)||!PlacementService.monsterCanStand(m,x,y))continue;const d=Math.abs(x-m.x)+Math.abs(y-m.y);if(d<bd){bd=d;best={x,y}}}if(best){occ.delete(key980(m.x,m.y));m.x=best.x;m.y=best.y;occ.add(key980(m.x,m.y));moved++}}
    return moved;
  }
  function waterSite(w,h,tile=TT.WATER,avoid=[]){
    let best=null,score=-1;for(let cy=2+Math.floor(h/2);cy<ROWS-2-Math.floor(h/2);cy+=2)for(let cx=2+Math.floor(w/2);cx<COLS-2-Math.floor(w/2);cx+=2){
      if(avoid.some(a=>Math.abs(a.x-cx)<(a.w+w)/2+3&&Math.abs(a.y-cy)<(a.h+h)/2+3))continue;
      let n=0;for(let y=cy-Math.floor(h/2);y<=cy+Math.floor(h/2);y++)for(let x=cx-Math.floor(w/2);x<=cx+Math.floor(w/2);x++)if(state.map[y]?.[x]===tile)n++;
      const d=Math.min(Math.hypot(cx-state.player.x,cy-state.player.y),Math.hypot(cx-state.stairs.x,cy-state.stairs.y));const s=n+d*.12;if(n>=w*h*.78&&s>score){score=s;best={x:cx,y:cy,w,h}}
    }return best;
  }
  function nearestExistingLand(cx,cy,exclude){let best=null,bd=1e9;for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++){if(exclude&&x>=exclude.x&&x<exclude.x+exclude.w&&y>=exclude.y&&y<exclude.y+exclude.h)continue;if(!reachPass981(x,y,{unlock:true})||state.map[y][x]===TT.PORTAL)continue;const d=Math.abs(x-cx)+Math.abs(y-cy);if(d<bd){bd=d;best={x,y}}}return best}
  function waterHut(site,kind=0){
    const w=site.w,h=site.h,x=site.x-Math.floor(w/2),y=site.y-Math.floor(h/2),r={x,y,w,h,cx:site.x,cy:site.y},target=nearestExistingLand(site.x,site.y,r);if(!target)return null;
    for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++){if(!in980(xx,yy))continue;const border=xx===x||yy===y||xx===x+w-1||yy===y+h-1;setTerrainTile58(state.map,xx,yy,border?TT.WALL:TT.WOOD_FLOOR);if(border)markWall(xx,yy,'f6_hut');else markFloor(xx,yy,'f6_hut')}
    const dx=target.x-site.x,dy=target.y-site.y;let door,out;if(Math.abs(dx)>=Math.abs(dy)){door={x:dx<0?x:x+w-1,y:site.y};out={x:door.x+(dx<0?-1:1),y:door.y}}else{door={x:site.x,y:dy<0?y:y+h-1};out={x:door.x,y:door.y+(dy<0?-1:1)}}setTerrainTile58(state.map,door.x,door.y,TT.DOOR);lineOwn(out.x,out.y,target.x,target.y,TT.PAPER_BRIDGE,1);
    if(kind===0){setTerrainTile58(state.map,site.x,site.y,TT.PAVILION);for(const [ox,oy]of[[-2,-1],[2,-1],[-2,1],[2,1]])safeBlock(site.x+ox,site.y+oy,TT.PAPER_CRANE,new Set())}
    else{for(let yy=site.y-1;yy<=site.y+1;yy++)for(let xx=site.x-2;xx<=site.x+2;xx++)if(in980(xx,yy)&&!isReservedCell(xx,yy))setTerrainTile58(state.map,xx,yy,TT.WATER);setTerrainTile58(state.map,site.x,site.y,TT.PAVILION);for(const [ox,oy]of[[-3,-2],[3,-2],[-3,2],[3,2]])safeBlock(site.x+ox,site.y+oy,TT.LOW_FENCE,new Set())}
    state.rooms.push(r);addNamedFeature(kind?'반잠수 연못정자':'수상 관리 오두막',r,'special');return r;
  }
  function submergedPlatform(site){
    const rx=4,ry=3,c={x:site.x,y:site.y},target=nearestExistingLand(c.x,c.y,{x:c.x-rx-1,y:c.y-ry-1,w:rx*2+3,h:ry*2+3});if(!target)return null;
    for(let y=c.y-ry;y<=c.y+ry;y++)for(let x=c.x-rx;x<=c.x+rx;x++){const d=Math.abs((x-c.x)/rx)+Math.abs((y-c.y)/ry);if(d<=1.15&&in980(x,y)){setTerrainTile58(state.map,x,y,d>.72?TT.PAPER_BRIDGE:TT.WOOD_FLOOR);markFloor(x,y,'f6_submerged')}}
    for(let y=c.y-1;y<=c.y+1;y++)for(let x=c.x-1;x<=c.x+1;x++)if(in980(x,y))setTerrainTile58(state.map,x,y,TT.WATER);setTerrainTile58(state.map,c.x,c.y,TT.PAVILION);lineOwn(c.x,c.y,target.x,target.y,TT.PAPER_BRIDGE,1);
    const r={x:c.x-rx,y:c.y-ry,w:rx*2+1,h:ry*2+1,cx:c.x,cy:c.y};state.rooms.push(r);addNamedFeature('반잠수 연잎 정자',r,'special');return r;
  }
  function augment6_(){
    const avoid=(state.featureRooms||[]).map(r=>({x:r.cx??r.x+r.w/2,y:r.cy??r.y+r.h/2,w:r.w,h:r.h})),made=[];
    for(let i=0;i<2;i++){const s=waterSite(i?11:9,i?9:7,TT.WATER,[...avoid,...made]);if(s){const r=waterHut(s,i);if(r)made.push({x:r.cx,y:r.cy,w:r.w,h:r.h})}}
    for(let i=0;i<2;i++){const s=waterSite(9,7,TT.WATER,[...avoid,...made]);if(s){const r=submergedPlatform(s);if(r)made.push({x:r.cx,y:r.cy,w:r.w,h:r.h})}}
    for(const a of made)for(let j=0;j<4;j++){const ang=j*Math.PI/2+hash980(a.x,a.y,j)*.45,x=Math.round(a.x+Math.cos(ang)*(a.w/2+3)),y=Math.round(a.y+Math.sin(ang)*(a.h/2+3));if(in980(x,y)&&state.map[y][x]===TT.WATER){setTerrainTile58(state.map,x,y,j%2?TT.LOTUS_FLOWER:TT.LIGHT_GRASS);markFloor(x,y,'f6_shoal')}}
    if(made.length){state.layoutName='수중 수목원 군도 · 관리 오두막 / 반잠수 연잎정자 / 열네 정자 / 목교 수로';V981.repairs.push(`f6-structures:${made.length}`)}
  }
  function ensureRaft(r){
    if(!r)return false;let min=r.min,max=r.max;if(!(Number.isFinite(min)&&Number.isFinite(max)&&min<max)){min=ROWS;max=0;for(let y=1;y<ROWS-1;y++)if(state.map[y][r.x]===TT.WATER||state.map[y][r.x]===TT.RAFT){min=Math.min(min,y);max=Math.max(max,y)}}if(!(min<max))return false;
    r.min=min;r.max=max;r.y=clamp(Number.isFinite(r.y)?r.y:Math.floor((min+max)/2),min,max);r.dir=r.dir===-1?-1:1;
    // This owner reserves the entire moving channel, not just the raft's current tile.
    for(let y=min;y<=max;y++)setTerrainTile58(state.map,r.x,y,TT.WATER);setTerrainTile58(state.map,r.x,r.y,TT.RAFT);
    for(const y of [min-1,max+1])for(let dx=-2;dx<=2;dx++)if(in980(r.x+dx,y)){setTerrainTile58(state.map,r.x+dx,y,TT.STONE_PATH);markFloor(r.x+dx,y,'f11_dock')}
    return true;
  }
  function blinkChain(r){
    let x=r.x+3;if(x>=COLS-2||![TT.WATER,TT.WALL].includes(state.map[Math.floor((r.min+r.max)/2)][x]))x=r.x-3;if(x<=1)return false;
    for(const y of [r.min-1,r.max+1])for(let dx=-1;dx<=1;dx++)if(in980(x+dx,y)){setTerrainTile58(state.map,x+dx,y,TT.STONE_PATH);markFloor(x+dx,y,'f11_blinkpost')}
    let y=r.min-1;while(y<r.max+1){y=Math.min(r.max+1,y+2);if(y<r.max+1&&in980(x,y)){setTerrainTile58(state.map,x,y,TT.STONE_PATH);markFloor(x,y,'f11_blinkpost')}}state.raftFallback981={x,range:2,from:r.min-1,to:r.max+1};addNamedFeature('비상 점멸 징검석',{x:x-1,y:r.min-1,w:3,h:r.max-r.min+3,cx:x,cy:Math.floor((r.min+r.max)/2)},'fallback');return true;
  }
  function tunnelToReach(start,reach){
    const q=[start],prev=new Map([[key980(start.x,start.y),null]]),cost=new Map([[key980(start.x,start.y),0]]);let goal=null;
    for(let qi=0;qi<q.length&&qi<12000;qi++){
      let bi=qi;for(let j=qi+1;j<q.length;j++)if((cost.get(key980(q[j].x,q[j].y))||1e9)<(cost.get(key980(q[bi].x,q[bi].y))||1e9))bi=j;[q[qi],q[bi]]=[q[bi],q[qi]];const p=q[qi],pk=key980(p.x,p.y);if(reach.cells.has(pk)&&pk!==key980(start.x,start.y)){goal=p;break}
      for(const[dx,dy]of DIRS4){const x=p.x+dx,y=p.y+dy;if(!in980(x,y))continue;const t=state.map[y][x],step=t===TT.WATER||t===TT.MERCURY||t===TT.VOID||t===TT.LAVA?60:t===TT.WALL?4:1,nc=(cost.get(pk)||0)+step,k=key980(x,y);if(nc<(cost.get(k)??1e9)){cost.set(k,nc);prev.set(k,p);q.push({x,y})}}
    }
    if(!goal)return false;const path=[];let p=goal;while(p){path.push(p);p=prev.get(key980(p.x,p.y))}path.reverse();if(path.filter(p=>[TT.WATER,TT.MERCURY,TT.VOID,TT.LAVA].includes(state.map[p.y][p.x])).length>2)return false;
    for(const p of path){if(state.map[p.y][p.x]===TT.WALL)setTerrainTile58(state.map,p.x,p.y,TT.FLOOR);else if(state.map[p.y][p.x]===TT.WATER)setTerrainTile58(state.map,p.x,p.y,TT.PAPER_BRIDGE)}return true;
  }
  function landTunnel(start,goal,bounds={}){
    const q=[start],prev=new Map([[key980(start.x,start.y),null]]),cost=new Map([[key980(start.x,start.y),0]]);let found=null;
    const allowed=(x,y)=>in980(x,y)&&(bounds.minY==null||y>=bounds.minY)&&(bounds.maxY==null||y<=bounds.maxY)&&(bounds.minX==null||x>=bounds.minX)&&(bounds.maxX==null||x<=bounds.maxX);
    for(let qi=0;qi<q.length&&qi<18000;qi++){
      let bi=qi;for(let j=qi+1;j<q.length;j++)if((cost.get(key980(q[j].x,q[j].y))??1e9)<(cost.get(key980(q[bi].x,q[bi].y))??1e9))bi=j;[q[qi],q[bi]]=[q[bi],q[qi]];const p=q[qi],pk=key980(p.x,p.y);if(p.x===goal.x&&p.y===goal.y){found=p;break}
      for(const[dx,dy]of DIRS4){const x=p.x+dx,y=p.y+dy;if(!allowed(x,y))continue;const t=state.map[y][x];if([TT.WATER,TT.MERCURY,TT.VOID,TT.LAVA].includes(t)||IMMUTABLE_TILES.has(t)&&t!==TT.HIDDEN_WALL)continue;const step=t===TT.WALL||t===TT.HIDDEN_WALL?5:1,nc=(cost.get(pk)||0)+step,k=key980(x,y);if(nc<(cost.get(k)??1e9)){cost.set(k,nc);prev.set(k,p);q.push({x,y})}}
    }
    if(!found)return false;const path=[];let p=found;while(p){path.push(p);p=prev.get(key980(p.x,p.y))}for(const c of path.reverse()){if(state.map[c.y][c.x]===TT.WALL||state.map[c.y][c.x]===TT.HIDDEN_WALL){setTerrainTile58(state.map,c.x,c.y,TT.STONE_PATH);markFloor(c.x,c.y,'f11_cliff_ledge')}}return true;
  }
  function connectRaftRoute(){
    if(!(state.rafts||[]).length)return false;const s={x:state.player.x,y:state.player.y},g={x:state.stairs.x,y:state.stairs.y},cands=[];
    for(const r of state.rafts){const top={x:r.x,y:r.min-1},bottom={x:r.x,y:r.max+1},mid=(r.min+r.max)/2;if(s.y<=mid&&g.y>=mid)cands.push({r,a:top,b:bottom,score:Math.abs(s.x-top.x)+Math.abs(s.y-top.y)+Math.abs(g.x-bottom.x)+Math.abs(g.y-bottom.y),ab:{maxY:r.min-1},bb:{minY:r.max+1}});if(s.y>=mid&&g.y<=mid)cands.push({r,a:bottom,b:top,score:Math.abs(s.x-bottom.x)+Math.abs(s.y-bottom.y)+Math.abs(g.x-top.x)+Math.abs(g.y-top.y),ab:{minY:r.max+1},bb:{maxY:r.min-1}})}
    cands.sort((a,b)=>a.score-b.score);for(const c of cands){const snap=cloneTerrainMap58(state.map);if(landTunnel(s,c.a,c.ab)&&landTunnel(g,c.b,c.bb)){state.raftMain981={x:c.r.x,startDock:c.a,exitDock:c.b};addNamedFeature('주요 뗏목 도하로',{x:c.r.x-2,y:c.r.min-1,w:5,h:c.r.max-c.r.min+3,cx:c.r.x,cy:Math.floor((c.r.min+c.r.max)/2)},'raft-main');return true}state.map=snap}return false;
  }
  function blinkRouteToReach(start,reach,range=2){
    const q=[start],prev=new Map([[key980(start.x,start.y),null]]),cost=new Map([[key980(start.x,start.y),0]]);let goal=null;
    for(let qi=0;qi<q.length&&qi<18000;qi++){
      let bi=qi;for(let j=qi+1;j<q.length;j++)if((cost.get(key980(q[j].x,q[j].y))??1e9)<(cost.get(key980(q[bi].x,q[bi].y))??1e9))bi=j;[q[qi],q[bi]]=[q[bi],q[qi]];
      const p=q[qi],pk=key980(p.x,p.y);if(reach.cells.has(pk)&&pk!==key980(start.x,start.y)){goal=p;break}
      for(const[dx,dy]of DIRS4){const x=p.x+dx,y=p.y+dy;if(!in980(x,y))continue;const t=state.map[y][x];if(IMMUTABLE_TILES.has(t)&&t!==TT.HIDDEN_BRIDGE&&t!==TT.HIDDEN_WALL)continue;const step=t===TT.WALL?7:t===TT.WATER?2:t===TT.MERCURY||t===TT.VOID||t===TT.LAVA?18:1,nc=(cost.get(pk)||0)+step,k=key980(x,y);if(nc<(cost.get(k)??1e9)){cost.set(k,nc);prev.set(k,p);q.push({x,y})}}
    }
    if(!goal)return false;const path=[];let p=goal;while(p){path.push(p);p=prev.get(key980(p.x,p.y))}path.reverse();
    let run=0,lastDir=null;for(let i=0;i<path.length;i++){const c=path[i],before=i?path[i-1]:c,after=i+1<path.length?path[i+1]:c,dir=`${Math.sign(after.x-before.x)},${Math.sign(after.y-before.y)}`,turn=i>0&&dir!==lastDir,t=state.map[c.y][c.x];
      if(t===TT.WALL||t===TT.HIDDEN_WALL){setTerrainTile58(state.map,c.x,c.y,TT.FLOOR);markFloor(c.x,c.y,'f11_emergency_tunnel');run=0}
      else if(t===TT.WATER){run++;if(turn||run>=range||i===path.length-1){setTerrainTile58(state.map,c.x,c.y,TT.STONE_PATH);markFloor(c.x,c.y,'f11_blinkpost');run=0}}
      else if(t===TT.MERCURY||t===TT.VOID||t===TT.LAVA){setTerrainTile58(state.map,c.x,c.y,TT.STONE_PATH);markFloor(c.x,c.y,'f11_blinkpost');run=0}
      else run=0;lastDir=dir;
    }
    addNamedFeature('강중 비상 점멸 표식',{x:Math.min(...path.map(p=>p.x)),y:Math.min(...path.map(p=>p.y)),w:Math.max(...path.map(p=>p.x))-Math.min(...path.map(p=>p.x))+1,h:Math.max(...path.map(p=>p.y))-Math.min(...path.map(p=>p.y))+1,cx:start.x,cy:start.y},'fallback');return true;
  }
  function playerWalkPath(){const q=ReachabilityService.playerSearch(state.player,{unlock:true,tileAt:(x,y)=>tileReveal981(x,y,{unlock:true})}),p=ReachabilityService.playerPath(q,state.stairs);return p?[{x:state.player.x,y:state.player.y},...p]:[]}
  function breakWalkRoutes(){
    let changed=0;for(let pass=0;pass<6;pass++){const path=playerWalkPath();if(!path.length)break;const candidates=[];for(let i=5;i<path.length-5;i++){const p=path[i],k=key980(p.x,p.y);if(isReservedCell(p.x,p.y)||IMMUTABLE_TILES.has(state.map[p.y][p.x])||state.map[p.y][p.x]===TT.RAFT)continue;const open=DIRS4.filter(([dx,dy])=>reachPass981(p.x+dx,p.y+dy,{unlock:true})).length,water=DIRS4.filter(([dx,dy])=>state.map[p.y+dy]?.[p.x+dx]===TT.WATER).length,main=state.raftMain981,md=main?Math.abs(p.x-main.x)+Math.min(Math.abs(p.y-main.startDock.y),Math.abs(p.y-main.exitDock.y)):99;candidates.push({p,i,score:water*10-open*2+Math.min(i,path.length-i)*.04+(md>5?3:0)})}candidates.sort((a,b)=>b.score-a.score);let kept=false;
      for(const c of candidates.slice(0,18)){const p=c.p,prev=path[c.i-1],next=path[c.i+1],horizontal=prev.x!==next.x,cells=[p];for(let o=-2;o<=2;o++){if(!o)continue;const x=p.x+(horizontal?0:o),y=p.y+(horizontal?o:0);if(in980(x,y)&&isFloorLike(state.map[y][x])&&!isReservedCell(x,y)&&!IMMUTABLE_TILES.has(state.map[y][x]))cells.push({x,y})}const snap=cells.map(v=>({x:v.x,y:v.y,t:state.map[v.y][v.x]}));for(const v of cells){setTerrainTile58(state.map,v.x,v.y,TT.WATER);markFloor(v.x,v.y,'f11_channel_cut')}const walk=ReachabilityService.mechanicalReach({expectedBlink981,key980,reachPass981,raftDockPairs981,tileReveal981,blinkBlock981,in980},{unlock:true,rafts:false,blinkRange:0}),raft=ReachabilityService.mechanicalReach({expectedBlink981,key980,reachPass981,raftDockPairs981,tileReveal981,blinkBlock981,in980},{unlock:true,rafts:true,blinkRange:0}),blink=ReachabilityService.mechanicalReach({expectedBlink981,key980,reachPass981,raftDockPairs981,tileReveal981,blinkBlock981,in980},{unlock:true,rafts:false,blinkRange:2});if(!walk.exit&&raft.exit&&blink.exit){changed++;kept=true;break}for(const v of snap)setTerrainTile58(state.map,v.x,v.y,v.t)}
      if(!kept)break;
    }return changed;
  }
  function guaranteedBlinkPath(range=2){
    const s={x:state.player.x,y:state.player.y},g={x:state.stairs.x,y:state.stairs.y};
    const make=(bend)=>{const path=[{...s}],pushLine=(tx,ty)=>{let p=path[path.length-1];while(p.x!==tx||p.y!==ty){let x=p.x,y=p.y;if(x!==tx)x+=Math.sign(tx-x);else y+=Math.sign(ty-y);p={x,y};path.push(p)}};pushLine(bend.x,bend.y);pushLine(g.x,g.y);return path};
    const score=path=>path.reduce((n,p)=>{const t=state.map[p.y]?.[p.x];return n+(IMMUTABLE_TILES.has(t)?200:t===TT.WALL?5:t===TT.WATER?2:t===TT.MERCURY||t===TT.VOID||t===TT.LAVA?12:0)},0);
    const candidates=[make({x:g.x,y:s.y}),make({x:s.x,y:g.y})].sort((a,b)=>score(a)-score(b)),path=candidates[0];let lastAnchor=0,lastDir=null;
    for(let i=1;i<path.length;i++){
      const p=path[i],prev=path[i-1],next=path[i+1]||p,dir=`${Math.sign(p.x-prev.x)},${Math.sign(p.y-prev.y)}`,nextDir=`${Math.sign(next.x-p.x)},${Math.sign(next.y-p.y)}`,turn=nextDir!==dir,t=state.map[p.y][p.x];
      if(p.x===g.x&&p.y===g.y){lastAnchor=i;lastDir=dir;continue}
      if(t===TT.WATER){if(i-lastAnchor>=range||turn){setTerrainTile58(state.map,p.x,p.y,TT.STONE_PATH);markFloor(p.x,p.y,'f11_blinkpost');lastAnchor=i}}
      else if(t===TT.MERCURY||t===TT.VOID||t===TT.LAVA){setTerrainTile58(state.map,p.x,p.y,TT.STONE_PATH);markFloor(p.x,p.y,'f11_blinkpost');lastAnchor=i}
      else if(t===TT.WALL||t===TT.HIDDEN_WALL||t===TT.HIDDEN_BRIDGE){setTerrainTile58(state.map,p.x,p.y,TT.STONE_PATH);markFloor(p.x,p.y,'f11_cliff_ledge');lastAnchor=i}
      else if(!tileBlocks(tileReveal981(p.x,p.y,{unlock:true}))){lastAnchor=i}
      if(turn&&state.map[p.y][p.x]===TT.WATER){setTerrainTile58(state.map,p.x,p.y,TT.STONE_PATH);markFloor(p.x,p.y,'f11_blinkpost');lastAnchor=i}
      lastDir=dir;
    }
    // A slim stone lip and lantern pair make the emergency route readable without turning it into a broad hallway.
    for(let i=5;i<path.length-5;i+=12){const p=path[i],prev=path[i-1],dx=p.x-prev.x,dy=p.y-prev.y,side={x:p.x+(dy?1:0),y:p.y+(dx?1:0)};if(in980(side.x,side.y)&&state.map[side.y][side.x]===TT.WALL){setTerrainTile58(state.map,side.x,side.y,TT.STONE_PILLAR);markFloor(side.x,side.y,'f11_cliff_marker')}}
    state.emergencyPath981=path;addNamedFeature('절벽 비상 점멸로',{x:Math.min(...path.map(p=>p.x)),y:Math.min(...path.map(p=>p.y)),w:Math.max(...path.map(p=>p.x))-Math.min(...path.map(p=>p.x))+1,h:Math.max(...path.map(p=>p.y))-Math.min(...path.map(p=>p.y))+1,cx:Math.floor((s.x+g.x)/2),cy:Math.floor((s.y+g.y)/2)},'fallback');return true;
  }
  function repair11_(){
    state.rafts=(state.rafts||[]).filter(ensureRaft);if(!state.rafts.length){for(let x=12;x<COLS-12;x+=12){let min=ROWS,max=0;for(let y=2;y<ROWS-2;y++)if(state.map[y][x]===TT.WATER){min=Math.min(min,y);max=Math.max(max,y)}if(min<max){const r={x,y:Math.floor((min+max)/2),min,max,dir:1};state.rafts.push(r);ensureRaft(r)}if(state.rafts.length>=2)break}}
    connectRaftRoute();
    if(state.rafts.length)blinkChain(state.rafts[state.rafts.length-1]);
    let reach=ReachabilityService.mechanicalReach({expectedBlink981,key980,reachPass981,raftDockPairs981,tileReveal981,blinkBlock981,in980},{unlock:true,rafts:true,portals:true,blinkRange:2});for(const e of reachableRoomCenters(reach))if(!e.reachable){const c=roomCenter(e.room);if(tunnelToReach(c,reach))reach=ReachabilityService.mechanicalReach({expectedBlink981,key980,reachPass981,raftDockPairs981,tileReveal981,blinkBlock981,in980},{unlock:true,rafts:true,portals:true,blinkRange:2})}
    let pureRaft=ReachabilityService.mechanicalReach({expectedBlink981,key980,reachPass981,raftDockPairs981,tileReveal981,blinkBlock981,in980},{unlock:true,rafts:true,portals:true,blinkRange:0}),blinkOnly=ReachabilityService.mechanicalReach({expectedBlink981,key980,reachPass981,raftDockPairs981,tileReveal981,blinkBlock981,in980},{unlock:true,rafts:false,portals:true,blinkRange:2});
    if(!blinkOnly.exit){guaranteedBlinkPath(2);blinkOnly=ReachabilityService.mechanicalReach({expectedBlink981,key980,reachPass981,raftDockPairs981,tileReveal981,blinkBlock981,in980},{unlock:true,rafts:false,portals:true,blinkRange:2});reach=ReachabilityService.mechanicalReach({expectedBlink981,key980,reachPass981,raftDockPairs981,tileReveal981,blinkBlock981,in980},{unlock:true,rafts:true,portals:true,blinkRange:2})}
    if(!pureRaft.exit&&!reach.exit&&blinkRouteToReach(state.stairs,reach,2))reach=ReachabilityService.mechanicalReach({expectedBlink981,key980,reachPass981,raftDockPairs981,tileReveal981,blinkBlock981,in980},{unlock:true,rafts:true,portals:true,blinkRange:2});
    if(!pureRaft.exit&&!reach.exit){guaranteedBlinkPath(2);reach=ReachabilityService.mechanicalReach({expectedBlink981,key980,reachPass981,raftDockPairs981,tileReveal981,blinkBlock981,in980},{unlock:true,rafts:true,portals:true,blinkRange:2})}
    for(const r of state.rafts)ensureRaft(r);
    pureRaft=ReachabilityService.mechanicalReach({expectedBlink981,key980,reachPass981,raftDockPairs981,tileReveal981,blinkBlock981,in980},{unlock:true,rafts:true,portals:true,blinkRange:0});if(pureRaft.exit&&ReachabilityService.mechanicalReach({expectedBlink981,key980,reachPass981,raftDockPairs981,tileReveal981,blinkBlock981,in980},{unlock:true,rafts:false,blinkRange:0}).exit)breakWalkRoutes();reach=ReachabilityService.mechanicalReach({expectedBlink981,key980,reachPass981,raftDockPairs981,tileReveal981,blinkBlock981,in980},{unlock:true,rafts:true,portals:true,blinkRange:2});
    if(!reach.exit){const c=roomCenter(roomByCenter(state.stairs.x,state.stairs.y)||{x:state.stairs.x-2,y:state.stairs.y-2,w:5,h:5,cx:state.stairs.x,cy:state.stairs.y});tunnelToReach(c,reach);reach=ReachabilityService.mechanicalReach({expectedBlink981,key980,reachPass981,raftDockPairs981,tileReveal981,blinkBlock981,in980},{unlock:true,rafts:true,portals:true,blinkRange:2})}
    for(const r of state.rafts)ensureRaft(r);
    const moved=relocateLandMonsters(ReachabilityService.mechanicalReach({expectedBlink981,key980,reachPass981,raftDockPairs981,tileReveal981,blinkBlock981,in980},{unlock:true,rafts:true,portals:true,blinkRange:2}));state.raftAudit981=raftAudit981();state.layoutName='향수강 · 회색돌 협곡 / 필수 도하 뗏목 / 강중 비상 점멸 표식 / 도달 가능한 향료굴';V981.repairs.push(`f11-room-repair:${moved}:exit${reach.exit?1:0}`);
  }
  function fillPortalRoom(r,shape,tile,style){
    for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++)if(in980(x,y))setTerrainTile58(state.map,x,y,TT.WALL);
    const cells=[];for(let y=r.y+1;y<r.y+r.h-1;y++)for(let x=r.x+1;x<r.x+r.w-1;x++){
      let open=true,dx=Math.min(x-r.x,r.x+r.w-1-x),dy=Math.min(y-r.y,r.y+r.h-1-y);
      if(shape==='chamfer'&&dx+dy<=2)open=false;
      else if(shape==='cross')open=Math.abs(x-r.cx)<=2||Math.abs(y-r.cy)<=2;
      else if(shape==='lshape')open=!(x>r.cx&&y<r.cy&&x-r.cx>1&&r.cy-y>1);
      else if(shape==='octagon'&&dx+dy<=2)open=false;
      if(open){setTerrainTile58(state.map,x,y,tile);cells.push({x,y});markFloor(x,y,style)}
    }
    if(shape==='ring')for(let y=r.cy-1;y<=r.cy+1;y++)for(let x=r.cx-1;x<=r.cx+1;x++)if(in980(x,y)){setTerrainTile58(state.map,x,y,TT.WALL);markWall(x,y,style)}
    if(shape==='split'){
      const vertical=r.w>=r.h;if(vertical){for(let y=r.y+2;y<r.y+r.h-2;y++)if(Math.abs(y-r.cy)>1&&state.map[y][r.cx]!==TT.WALL)setTerrainTile58(state.map,r.cx,y,TT.WALL)}else{for(let x=r.x+2;x<r.x+r.w-2;x++)if(Math.abs(x-r.cx)>1&&state.map[r.cy][x]!==TT.WALL)setTerrainTile58(state.map,x,r.cy,TT.WALL)}
    }
    for(let x=r.x;x<r.x+r.w;x++){markWall(x,r.y,style);markWall(x,r.y+r.h-1,style)}for(let y=r.y;y<r.y+r.h;y++){markWall(r.x,y,style);markWall(r.x+r.w-1,y,style)}r.cells981=cells.filter(p=>!tileBlocks(state.map[p.y][p.x]));return r;
  }
  function roomPortalCandidates(r){
    const arr=[];for(const p of r.cells981||[]){const d=Math.min(p.x-r.x,r.x+r.w-1-p.x,p.y-r.y,r.y+r.h-1-p.y);if(d>3)continue;const n=DIRS4.filter(([dx,dy])=>!tileBlocks(state.map[p.y+dy]?.[p.x+dx])).length;if(n>=2)arr.push(p)}arr.sort((a,b)=>hash980(a.x,a.y,9811)-hash980(b.x,b.y,9811));return arr;
  }
  function portalDecor(r,i){
    const motifs=[[TT.MIRROR,TT.INCENSE_STAND],[TT.WALL_BANNER,TT.PETAL_MAT],[TT.STATUE,TT.GOLD_LAMP],[TT.SCREEN,TT.MIRROR],[TT.PAPER_CRANE,TT.INCENSE_STAND],[TT.STONE_PILLAR,TT.PETAL_MAT]],motif=motifs[i%motifs.length];
    const pts=[[r.x+2,r.y+2],[r.x+r.w-3,r.y+2],[r.x+2,r.y+r.h-3],[r.x+r.w-3,r.y+r.h-3]];for(let j=0;j<pts.length;j++){const[x,y]=pts[j];if(in980(x,y)&&!tileBlocks(state.map[y][x])&&!isReservedCell(x,y))setTerrainTile58(state.map,x,y,motif[j%motif.length])}
    if(i%4===0&&in980(r.cx,r.cy)&&!tileBlocks(state.map[r.cy][r.cx]))setTerrainTile58(state.map,r.cx,r.cy,TT.PETAL_MAT);
  }
  function graphDiameter(n,edges){const adj=Array.from({length:n},()=>[]);for(const e of edges){adj[e.a].push(e.b);adj[e.b].push(e.a)}let best={a:0,b:n-1,d:-1};for(let s=0;s<n;s++){const q=[s],d=Array(n).fill(-1);d[s]=0;for(let i=0;i<q.length;i++)for(const v of adj[q[i]])if(d[v]<0){d[v]=d[q[i]]+1;q.push(v)}for(let t=0;t<n;t++)if(d[t]>best.d)best={a:s,b:t,d:d[t]}}return{...best,adj}}
  function nearestFreeInRoom(r,avoid=new Set()){let best=null,bd=1e9;for(const p of r.cells981||[]){const k=key980(p.x,p.y);if(avoid.has(k)||tileBlocks(state.map[p.y][p.x])||state.map[p.y][p.x]===TT.PORTAL)continue;const d=Math.abs(p.x-r.cx)+Math.abs(p.y-r.cy);if(d<bd){bd=d;best=p}}return best}
  function rebuild13_(){
    const oldItems=[...(state.items||[])],oldMonsters=[...(state.monsters||[])];for(const m of oldMonsters){m.x=-999;m.y=-999}
    for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)setTerrainTile58(state.map,x,y,TT.WALL);state.rooms=[];state.featureRooms=[];state.routeTags=[];state.decor=[];state.decals=[];state.portals981={};state.portalLinks981={};state.portalEdges981=[];state.portalRooms981=[];state.hiddenGroups60={};state.hiddenLookup60={};state.hiddenBase60={};state.hiddenReplacement60={};
    const cols=4,rows=4,cw=Math.floor((COLS-6)/cols),ch=Math.floor((ROWS-6)/rows),tiles=[TT.DARK_WOOD,TT.MOON_STONE,TT.CARPET,TT.WOOD_FLOOR,TT.GILDED_FLOOR,TT.FLOOR,TT.STONE_PATH,TT.PETAL_MAT],shapes=['rect','chamfer','ring','cross','split','lshape','octagon','rect'];
    for(let gy=0;gy<rows;gy++)for(let gx=0;gx<cols;gx++){const i=gy*cols+gx,maxW=Math.max(11,cw-3),maxH=Math.max(8,ch-2),w=clamp(11+Math.floor(hash980(gx,gy,9821)*Math.max(1,maxW-10)),10,maxW),h=clamp(8+Math.floor(hash980(gy,gx,9823)*Math.max(1,maxH-7)),7,maxH),bx=3+gx*cw,by=3+gy*ch,x=clamp(bx+Math.floor(hash980(gx,gy,9827)*Math.max(1,cw-w)),2,COLS-w-2),y=clamp(by+Math.floor(hash980(gy,gx,9829)*Math.max(1,ch-h)),2,ROWS-h-2),r={x,y,w,h,cx:x+Math.floor(w/2),cy:y+Math.floor(h/2),id981:i,style981:`f13_portal_${i%8}`};fillPortalRoom(r,shapes[i%shapes.length],tiles[i%tiles.length],r.style981);portalDecor(r,i);state.rooms.push(r);state.portalRooms981.push(r)}
    const n=state.rooms.length,order=Array.from({length:n},(_,i)=>i).sort((a,b)=>hash980(a,b,9831)-hash980(b,a,9831)),edges=[],deg=Array(n).fill(0),ek=new Set();const add=(a,b)=>{const k=a<b?`${a},${b}`:`${b},${a}`;if(a===b||ek.has(k)||deg[a]>=3||deg[b]>=3)return false;ek.add(k);edges.push({a,b,id:edges.length});deg[a]++;deg[b]++;return true};for(let i=0;i<n;i++)add(order[i],order[(i+1)%n]);
    const cand=[];for(let a=0;a<n;a++)for(let b=a+1;b<n;b++)if(!ek.has(`${a},${b}`))cand.push({a,b,s:hash980(a,b,9833)});cand.sort((a,b)=>a.s-b.s);for(const c of cand){if(edges.length>=n+5)break;add(c.a,c.b)}
    const diam=graphDiameter(n,edges),portalCells=state.rooms.map(roomPortalCandidates),used=new Set();
    for(const e of edges){const a=portalCells[e.a].find(p=>!used.has(key980(p.x,p.y))),b=portalCells[e.b].find(p=>!used.has(key980(p.x,p.y)));if(!a||!b)continue;used.add(key980(a.x,a.y));used.add(key980(b.x,b.y));setTerrainTile58(state.map,a.x,a.y,TT.PORTAL);setTerrainTile58(state.map,b.x,b.y,TT.PORTAL);const landA=DIRS4.map(([dx,dy])=>({x:a.x+dx,y:a.y+dy})).filter(p=>in980(p.x,p.y)&&!tileBlocks(state.map[p.y][p.x])&&state.map[p.y][p.x]!==TT.PORTAL).sort((p,q)=>Math.abs(p.x-state.rooms[e.a].cx)+Math.abs(p.y-state.rooms[e.a].cy)-Math.abs(q.x-state.rooms[e.a].cx)-Math.abs(q.y-state.rooms[e.a].cy))[0]||nearestFreeInRoom(state.rooms[e.a],used),landB=DIRS4.map(([dx,dy])=>({x:b.x+dx,y:b.y+dy})).filter(p=>in980(p.x,p.y)&&!tileBlocks(state.map[p.y][p.x])&&state.map[p.y][p.x]!==TT.PORTAL).sort((p,q)=>Math.abs(p.x-state.rooms[e.b].cx)+Math.abs(p.y-state.rooms[e.b].cy)-Math.abs(q.x-state.rooms[e.b].cx)-Math.abs(q.y-state.rooms[e.b].cy))[0]||nearestFreeInRoom(state.rooms[e.b],used);if(!landA||!landB)continue;state.portalLinks981[key980(a.x,a.y)]={edgeId:e.id,room:e.a,destRoom:e.b,destPortal:b,destLand:landB};state.portalLinks981[key980(b.x,b.y)]={edgeId:e.id,room:e.b,destRoom:e.a,destPortal:a,destLand:landA};state.portalEdges981.push({id:e.id,a:e.a,b:e.b,pa:a,pb:b})}
    const startRoom=state.rooms[diam.a],exitRoom=state.rooms[diam.b],avoid=new Set(Object.keys(state.portalLinks981));for(const v of Object.values(state.portalLinks981))avoid.add(key980(v.destLand.x,v.destLand.y));const start=nearestFreeInRoom(startRoom,avoid)||{x:startRoom.cx,y:startRoom.cy},exit=nearestFreeInRoom(exitRoom,new Set([...avoid,key980(start.x,start.y)]))||{x:exitRoom.cx,y:exitRoom.cy};state.player.x=start.x;state.player.y=start.y;state.fixedStart={...start};state.fixedExit={...exit};state.stairs={...exit};setTerrainTile58(state.map,exit.x,exit.y,TT.STAIR);avoid.add(key980(start.x,start.y));avoid.add(key980(exit.x,exit.y));
    state.items=oldItems;let ri=1;for(const it of state.items){let p=null;for(let tries=0;tries<n*2&&!p;tries++){const r=state.rooms[(ri++*5+tries*3)%n];if(r===startRoom)continue;p=nearestFreeInRoom(r,avoid)}if(!p)p=nearestFreeInRoom(exitRoom,avoid);if(p){it.x=p.x;it.y=p.y;avoid.add(key980(p.x,p.y))}}
    // Portal rooms have explicit occupancy caps. The old modulo walk could revisit a short room cycle and pile a whole floor's roster into one chamber.
    const denseIds981=new Set([2,6,10,14]),roomLoad981=Array(n).fill(0),placed981=[];let mi=0;
    for(const m of oldMonsters){let placed=false;const ids=Array.from({length:n},(_,i)=>i).filter(i=>state.rooms[i]!==startRoom).sort((a,b)=>{const ca=denseIds981.has(a)?3:2,cb=denseIds981.has(b)?3:2,ra=roomLoad981[a]/ca,rb=roomLoad981[b]/cb;return ra-rb||hash980(a,mi,9847)-hash980(b,mi,9847)});
      for(const rid of ids){const r=state.rooms[rid],cap=r===exitRoom?1:(denseIds981.has(rid)?3:2);if(roomLoad981[rid]>=cap)continue;const cells=[...(r.cells981||[])].sort((a,b)=>hash980(a.x,a.y,9841+mi)-hash980(b.x,b.y,9841+mi));for(const p of cells){const kk=key980(p.x,p.y);if(avoid.has(kk)||state.map[p.y][p.x]===TT.PORTAL)continue;if(PlacementService.monsterCanStand(m,p.x,p.y)){m.x=p.x;m.y=p.y;avoid.add(kk);roomLoad981[rid]++;placed981.push(m);placed=true;break}}if(placed)break}
      mi++;
    }
    state.monsters=placed981;state.portalMonsterLoad981=roomLoad981;
    state.featureRooms.push({name:'시작 객실',...startRoom},{name:'출구 객실',...exitRoom},{name:'월백 거울방',...state.rooms[5]},{name:'금선 내실',...state.rooms[10]});state.monsterDenseRooms=state.rooms.filter((_,i)=>denseIds981.has(i));state.layoutName='유혹의 내실 · 봉쇄된 열여섯 방 / 무명 포탈망 / 방마다 다른 바닥·형태·장식';state.seen=new Set();state.visible=new Set();V981.portalBuilds++;
  }
  function snapshotRoomCells(r){const out=[];for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++)if(in980(x,y))out.push({x,y,t:state.map[y][x],...terrainCellPlacement58(state.map,x,y)});return out}
  function restoreCells(cells){for(const p of cells)setTerrainTile58(state.map,p.x,p.y,p.t,p)}
  function addAudience(r,p){if(!r||r.w<14||r.h<10)return;const snap=snapshotRoomCells(r);for(let y=r.y+3;y<r.y+r.h-3;y+=3)for(let x=r.x+2;x<r.x+r.w-2;x++){if(Math.abs(x-r.cx)<=2||p.has(key980(x,y)))continue;safeBlock(x,y,TT.BENCH,p)}if(!ReachabilityService.mechanicalReach({expectedBlink981,key980,reachPass981,raftDockPairs981,tileReveal981,blinkBlock981,in980},{unlock:true,rafts:true,portals:true}).exit)restoreCells(snap);else addNamedFeature('층계 객석군',r,'density')}
  function addCourtyardPattern(r,p,z){if(!r||r.w<13||r.h<11)return;const snap=snapshotRoomCells(r),tile=z===1?TT.GARDEN_TREE:z===2?TT.STATUE:z===3?TT.RACK:TT.STONE_PILLAR;for(const [dx,dy]of[[-4,-3],[0,-3],[4,-3],[-4,3],[0,3],[4,3]])safeBlock(r.cx+dx,r.cy+dy,tile,p);paintRoomLoopGround(r,z===4?TT.GILDED_FLOOR:TT.STONE_PATH);if(!ReachabilityService.mechanicalReach({expectedBlink981,key980,reachPass981,raftDockPairs981,tileReveal981,blinkBlock981,in980},{unlock:true,rafts:true,portals:true}).exit)restoreCells(snap);else addNamedFeature('구획형 중정',r,'density')}
  function addLiquidIslets(liquid,count,floorTile,style){const made=[];for(let i=0;i<count;i++){const s=waterSite(7,5,liquid,made);if(!s)break;const target=nearestExistingLand(s.x,s.y,{x:s.x-3,y:s.y-2,w:7,h:5});if(!target)break;for(let y=s.y-2;y<=s.y+2;y++)for(let x=s.x-3;x<=s.x+3;x++){const d=Math.abs((x-s.x)/3)+Math.abs((y-s.y)/2);if(d<=1&&state.map[y][x]===liquid){setTerrainTile58(state.map,x,y,floorTile);markFloor(x,y,style)}}const range=expectedBlink981();if(range<=2)lineOwn(s.x,s.y,target.x,target.y,TT.PAPER_BRIDGE,1);else{let x=s.x,y=s.y;while(Math.abs(x-target.x)+Math.abs(y-target.y)>range){if(Math.abs(target.x-x)>Math.abs(target.y-y))x+=Math.sign(target.x-x)*Math.min(range,Math.abs(target.x-x));else y+=Math.sign(target.y-y)*Math.min(range,Math.abs(target.y-y));if(in980(x,y)&&state.map[y][x]===liquid)setTerrainTile58(state.map,x,y,floorTile)}}made.push({x:s.x,y:s.y,w:7,h:5});addNamedFeature('보조 지형섬',{x:s.x-3,y:s.y-2,w:7,h:5,cx:s.x,cy:s.y},'density')}return made.length}
  function openFloorSite(w,h,protectedSet,avoid=[]){
    let best=null,score=-1;for(let y=2;y<=ROWS-h-2;y+=2)for(let x=2;x<=COLS-w-2;x+=2){let good=0,bad=false;for(let yy=y;yy<y+h&&!bad;yy++)for(let xx=x;xx<x+w;xx++){const k=key980(xx,yy);if(protectedSet?.has(k)||isReservedCell(xx,yy)){bad=true;break}if(isFloorLike(state.map[yy][xx]))good++;else if(state.map[yy][xx]!==TT.WALL){bad=true;break}}if(bad||good<w*h*.72||avoid.some(a=>x<a.x+a.w+3&&x+w+3>a.x&&y<a.y+a.h+3&&y+h+3>a.y))continue;const d=Math.min(Math.hypot(x+w/2-state.player.x,y+h/2-state.player.y),Math.hypot(x+w/2-state.stairs.x,y+h/2-state.stairs.y)),s=good+d*.08;if(s>score){score=s;best={x,y,w,h,cx:x+Math.floor(w/2),cy:y+Math.floor(h/2)}}}return best;
  }
  function buildAnnexSite(site,style,floorTile,decorTiles,name,protectedSet){
    if(!site)return null;const snap=snapshotRoomCells(site),{x,y,w,h,cx,cy}=site;for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++){const border=xx===x||yy===y||xx===x+w-1||yy===y+h-1;if(border){if(!protectedSet?.has(key980(xx,yy))&&!isReservedCell(xx,yy)){setTerrainTile58(state.map,xx,yy,TT.WALL);markWall(xx,yy,style)}}else if(isFloorLike(state.map[yy][xx])){setTerrainTile58(state.map,xx,yy,floorTile);markFloor(xx,yy,style)}}
    const sides=[{x:cx,y},{x:cx,y:y+h-1},{x,y:cy},{x:x+w-1,y:cy}].sort((a,b)=>Math.abs(a.x-state.player.x)+Math.abs(a.y-state.player.y)-Math.abs(b.x-state.player.x)-Math.abs(b.y-state.player.y));const door=sides.find(p=>in980(p.x,p.y)&&!protectedSet?.has(key980(p.x,p.y)));if(door)setTerrainTile58(state.map,door.x,door.y,TT.DOOR);
    for(let i=0;i<decorTiles.length;i++){const t=decorTiles[i],pts=i%2?[[x+2,y+2],[x+w-3,y+2]]:[[x+2,y+h-3],[x+w-3,y+h-3]];for(const[px,py]of pts)safeBlock(px,py,t,protectedSet)}
    if(!ReachabilityService.mechanicalReach({expectedBlink981,key980,reachPass981,raftDockPairs981,tileReveal981,blinkBlock981,in980},{unlock:true,rafts:true,portals:true}).exit){restoreCells(snap);return null}state.rooms.push(site);addNamedFeature(name,site,'density');return site;
  }
  function addAnnexes(count,w,h,style,floorTile,decorTiles,name,protectedSet){const made=[];for(let i=0;i<count;i++){const s=openFloorSite(w,h,protectedSet,made);if(!s)break;const r=buildAnnexSite(s,style,floorTile,decorTiles,`${name} ${i+1}`,protectedSet);if(r)made.push(r)}return made.length}
  function densifyFixed(){
    const f=state.floor;if(!state.specialFloor||[6,11,13].includes(f))return;const p=protectedPathCells(1),large=[...(state.rooms||[])].filter(r=>r&&r.w*r.h>180&&!roomProtected(r)).sort((a,b)=>b.w*b.h-a.w*a.h);
    if(f===10)addLiquidIslets(TT.WATER,5,TT.WOOD_FLOOR,'f10_paperislet');
    else if(f===15){large.slice(0,4).forEach(r=>addAudience(r,p));addAnnexes(4,11,8,'f15_backstage',TT.DARK_WOOD,[TT.MIRROR,TT.WALL_BANNER],'배우 대기실',p)}
    else if(f===16){large.slice(0,4).forEach(r=>addCourtyardPattern(r,p,region980()));addAnnexes(3,11,8,'f16_barracks',TT.MOON_STONE,[TT.RACK,TT.STONE_PILLAR],'외성 막사',p)}
    else if(f===18){large.slice(0,4).forEach(r=>addCourtyardPattern(r,p,region980()));addAnnexes(3,10,8,'f18_sorting',TT.DARK_WOOD,[TT.RACK,TT.CRATE],'검수 작업실',p)}
    else if(f===20){large.slice(0,4).forEach(r=>addCourtyardPattern(r,p,region980()));addAnnexes(3,9,8,'f20_cells',TT.MOON_STONE,[TT.IRON_HOOK,TT.STONE_PILLAR],'형틀 준비실',p)}
    else if(f===21)addLiquidIslets(TT.VOID,7,TT.MOON_STONE,'f21_relay');
    else if(f===22){large.slice(0,4).forEach(r=>addCourtyardPattern(r,p,region980()));addAnnexes(5,9,8,'f22_chapel',TT.GILDED_FLOOR,[TT.STATUE,TT.GOLD_LAMP],'측면 예배실',p)}
    else if(f===23)addLiquidIslets(TT.MERCURY,6,TT.MOON_STONE,'f23_pump');
    else if(f===24){large.slice(0,3).forEach(r=>addCourtyardPattern(r,p,4));addAnnexes(2,10,8,'f24_teahut',TT.WOOD_FLOOR,[TT.PEACH_TREE,TT.PAPER_CRANE],'과수원 찻방',p)}
    else if(f===25)addLiquidIslets(TT.VOID,6,TT.MOON_STONE,'f25_relay');
  }
  /* r46: 21F route guarantee uses selectable 8-ray landings; turns no longer require facing pads. */
  function ensureFloor21Blink(range=4){
    if(state?.floor!==21)return{ok:true,changed:0,skipped:true};
    let reach=ReachabilityService.mechanicalBlinkReach({expectedBlink981,key980,floor21Stand981,raftDockPairs981,tileReveal981,blinkBlock981,in980},{unlock:true,rafts:true,portals:true,blinkRange:range});
    if(reach.exit){state.floor21BlinkAuditR43={ok:true,changed:0,range,preReach:true,selectable:true,stateCount:reach.stateCount};return state.floor21BlinkAuditR43}
    const start={x:state.player.x,y:state.player.y},goal={x:state.stairs.x,y:state.stairs.y};
    const make=(horizontalFirst)=>{const path=[{...start}],line=(tx,ty)=>{let p=path[path.length-1];while(p.x!==tx||p.y!==ty){p={x:p.x+(p.x!==tx?Math.sign(tx-p.x):0),y:p.y+(p.x===tx&&p.y!==ty?Math.sign(ty-p.y):0)};path.push(p)}};if(horizontalFirst){line(goal.x,start.y);line(goal.x,goal.y)}else{line(start.x,goal.y);line(goal.x,goal.y)}return path};
    const score=path=>path.reduce((n,p)=>{const t=state.map[p.y]?.[p.x];return n+(IMMUTABLE_TILES.has(t)&&blinkHardBlock(t)?500:blinkHardBlock(t)?16:t===TT.VOID?0:tileBlocks(tileReveal981(p.x,p.y,{unlock:true}))?8:0)},0);
    const candidates=[make(true),make(false)].sort((a,b)=>score(a)-score(b));
    for(const path of candidates){
      const changed=new Map();let lastAnchor=0,failed=false;
      const remember=(x,y)=>{const kk=key980(x,y);if(!changed.has(kk))changed.set(kk,{x,y,t:state.map[y][x],style:state.floorStyle980?.[kk]})};
      const setLanding=(p,i,why)=>{
        const t=state.map[p.y][p.x];if(IMMUTABLE_TILES.has(t)&&blinkHardBlock(t)){failed=true;return false}
        if(!(floor21Stand981(p.x,p.y,{unlock:true})&&!blinkHardBlock(t))){remember(p.x,p.y);setTerrainTile58(state.map,p.x,p.y,TT.MOON_STONE);if(state.crumbleBase60)delete state.crumbleBase60[key980(p.x,p.y)];markFloor(p.x,p.y,'f21_relay')}
        lastAnchor=i;return true;
      };
      for(let i=1;i<path.length&&!failed;i++){
        const p=path[i],prev=path[i-1],next=path[i+1]||p,dir=`${Math.sign(p.x-prev.x)},${Math.sign(p.y-prev.y)}`,nextDir=`${Math.sign(next.x-p.x)},${Math.sign(next.y-p.y)}`,turn=i<path.length-1&&dir!==nextDir,t=state.map[p.y]?.[p.x],revealed=tileReveal981(p.x,p.y,{unlock:true});
        if(turn){setLanding(p,i,'turn');continue}
        if(blinkHardBlock(t)){setLanding(p,i,'hard');continue}
        if(!tileBlocks(revealed)&&reachPass981(p.x,p.y,{unlock:true})){lastAnchor=i;continue}
        if(i-lastAnchor>=range||i===path.length-1)setLanding(p,i,'range');
      }
      if(!failed){reach=ReachabilityService.mechanicalBlinkReach({expectedBlink981,key980,floor21Stand981,raftDockPairs981,tileReveal981,blinkBlock981,in980},{unlock:true,rafts:true,portals:true,blinkRange:range});if(reach.exit){const cells=[...changed.values()];state.floor21BlinkAuditR43={ok:true,changed:cells.length,range,preReach:false,selectable:true,stateCount:reach.stateCount,cells:cells.map(v=>({x:v.x,y:v.y,from:v.t}))};return state.floor21BlinkAuditR43}}
      const cells=[...changed.values()];for(let i=cells.length-1;i>=0;i--){const q=cells[i],kk=key980(q.x,q.y);setTerrainTile58(state.map,q.x,q.y,q.t);if(state.floorStyle980){if(q.style==null)delete state.floorStyle980[kk];else state.floorStyle980[kk]=q.style}}
    }
    state.floor21BlinkAuditR43={ok:false,changed:0,range,preReach:false,selectable:true,stateCount:reach.stateCount};return state.floor21BlinkAuditR43;
  }
  function postApply(){if(state?.specialFloor&&[23,24].includes(state.floor)){const special=globalThis.__MANRU_SPECIAL_FLOORS60__,sv=special?.validate?.()||{ok:false,reason:'missing-special-validator'},current=special?.flood?.(state.player)||new Map(),currentStateReachExit=current.has(key980(state.stairs.x,state.stairs.y)),progressionReachExit=state.floor===23?!!(sv.centerOpen&&sv.dragonReady&&sv.safeDrop):!!sv.progressionReachAfterGate;state.qualityVersion981=V981.version;state.qualityAudit981={currentStateReachExit,progressionReachExit,specialProgression:!!sv.ok,specialValidation:sv};VisibilityService.compute();state.decor=[];vfBuildDecor();return}
    if(!state||state.qualityVersion981===V981.version)return;
    try{
      if(state.floor>=6){if(state.floor===13)rebuild13_();else{if(state.floor===6)augment6_();densifyFixed();if(state.floor===11)repair11_()}}
      if(state.floor===21)ensureFloor21Blink(4);
      try{window.__MANRU_RUNTIME81__?.Integrity81?.repair?.()}catch(error){ignoreError('integrity repair failed; the next validation catches it',error)}
      const reach=state.floor===21?ReachabilityService.mechanicalBlinkReach({expectedBlink981,key980,floor21Stand981,raftDockPairs981,tileReveal981,blinkBlock981,in980},{unlock:true,rafts:true,portals:true,blinkRange:4}):ReachabilityService.mechanicalReach({expectedBlink981,key980,reachPass981,raftDockPairs981,tileReveal981,blinkBlock981,in980},{unlock:true,rafts:true,portals:true});if(state.floor===11)relocateLandMonsters(reach);relocateItems();
      const exitAudit=state.floor===21?ReachabilityService.mechanicalBlinkReach({expectedBlink981,key980,floor21Stand981,raftDockPairs981,tileReveal981,blinkBlock981,in980},{unlock:true,rafts:true,portals:true,blinkRange:4}).exit:ReachabilityService.mechanicalReach({expectedBlink981,key980,reachPass981,raftDockPairs981,tileReveal981,blinkBlock981,in980},{unlock:true,rafts:true,portals:true}).exit;
      state.qualityVersion981=V981.version;state.qualityAudit981={reachExit:exitAudit,itemReach:state.itemReach981,raft:state.floor===11?raftAudit981():null,portal:state.floor===13?portalAudit981():null,floor21BlinkChoice:state.floor===21?state.floor21BlinkAuditR43:null};
      VisibilityService.compute();state.decor=[];vfBuildDecor();
    }catch(e){V981.errors.push(`f${state.floor}:${e}`);console.warn('[v9.8.1]',e)}
  }
function reachableCells(opt={}){return (state.floor===21?ReachabilityService.mechanicalBlinkReach({expectedBlink981,key980,floor21Stand981,raftDockPairs981,tileReveal981,blinkBlock981,in980},opt):ReachabilityService.mechanicalReach({expectedBlink981,key980,reachPass981,raftDockPairs981,tileReveal981,blinkBlock981,in980},opt)).cells}
  function safeAnchor(){
    const anchors=(state.items||[]).filter(i=>Number.isFinite(i.x)&&Number.isFinite(i.y));
    const tries=shuffle(anchors.map(i=>({x:i.x,y:i.y})));
    tries.push({x:state.player.x,y:state.player.y});
    for(const a of tries){
      const cells=shuffle([[0,0],[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]);
      for(const[dX,dY]of cells){const x=a.x+dX,y=a.y+dY,t=state.map?.[y]?.[x];if(x<0||y<0||x>=COLS||y>=ROWS)continue;if(!ReachabilityService.playerPassable(x,y)||OccupancyService.isOccupied(x,y)||state.items.some(i=>i.x===x&&i.y===y)||[TT.WATER,TT.LAVA,TT.VOID,TT.MERCURY,TT.TRAP,TT.SNARE].includes(t)||t===TT.STAIR)continue;return{x,y}}
    }
    return{x:state.player.x,y:state.player.y};
  }
  function placeCore(proto,tag){if(!proto)return false;const p=safeAnchor(),i=clone(proto);Object.assign(i,{x:p.x,y:p.y,count:1,coreDrop982:tag});PlacementService.placeItem(i);return true}
  function replaceForbiddenGround(){if(!state?.items)return 0;let n=0;const items=state.items;state.items=[];for(const item of items){let replacement=item;if(isUpgrade(item)){const generated=nonUpgradeTalisman982();if(generated){replacement={...generated,count:itemQuantity(item),origin56:item.origin56};n++}}PlacementService.placeItem(replacement,{x:item.x,y:item.y})}return n}
  function applyCoreFloor(){
    if(!state)return;const C=core982(),S=schedule982();if(!C||!S)return;
    replaceForbiddenGround();
    const f=state.floor;
    if(S.upgrades.includes(f)){placeCore(upgradeProto(),'chapter-upgrade');C.spawned.upgrade[f]=true}
    if(S.heals.includes(f)){placeCore(healProto982(f),'chapter-heal');C.spawned.heal[f]=true}
    state.coreLootAudit982={floor:f,chapter:chapter982()+1,upgrades:[...S.upgrades],heals:[...S.heals],groundUpgrades:(state.items||[]).filter(i=>i.talismanKind==='upgrade').length,groundHealing:(state.items||[]).filter(i=>i.type==='potion'&&['heal_small','heal_medium'].includes(i.potionKind)).length};
  }
  function riverOkay(a){return !!(a?.valid&&!a.pureWalk&&a.pureRaft&&a.exitWithRaft&&a.exitBlinkFallback)}
  const NormalGenerationStages=Object.freeze({
base(...args){
    const bowBefore=isBow967();
    const r=runRegisteredGenerationPipeline(...args);
    GENERATION_PIPELINE.density();
    applyRegionArchitecture(bowBefore);
    return r;
  },
quality(...args){
    let r=null,attempts=0;
    const limit=REQUIRED_LOCKS.has(state?.floor)?16:1;
    while(attempts<limit){
      if(state)state.qualityVersion980=null;
      r=NormalGenerationStages.base(...args);attempts++;
      if(!REQUIRED_LOCKS.has(state?.floor)||lockAuditOkay980()){
        qualityApply(false);
        if(!REQUIRED_LOCKS.has(state?.floor)||lockAuditOkay980())break;
      }
    }
    if(state)state.qualityBaseAttempts980=attempts;
    return r;
  },
riverAndCore(...args){
    let r=null,riverAttempts=0;
    do{
      r=NormalGenerationStages.quality(...args);
      if(state)state.qualityVersion981=null;
      postApply();
      if(!state||state.floor!==11)break;
      state.raftAudit981=raftAudit981();
      if(riverOkay(state.raftAudit981))break;
      riverAttempts++;
    }while(riverAttempts<24);
    if(state){
      if(state.floor!==11){state.riverRule982=null;state.riverGenerationAttempts982=0;}
      if(state.floor===11){
        if(!riverOkay(state.raftAudit981)){repair11_();if(raftAudit981().pureWalk)breakWalkRoutes();if(!raftAudit981().exitBlinkFallback)guaranteedBlinkPath(2);state.raftAudit981=raftAudit981()}
        state.riverGenerationAttempts982=riverAttempts+1;
      }
      migrateLegacyInventory();applyCoreFloor();
      if(state.floor===11&&state.raftAudit981){const a=state.raftAudit981;state.riverRule982={mustCross:true,pureWalk:!!a.pureWalk,pureRaft:!!a.pureRaft,blinkFallback:!!a.exitBlinkFallback,ok:riverOkay(a),attempts:state.riverGenerationAttempts982||1};}
    }
    return r;
  }
});
    /* ---------- final reachability repair for items added by later generation layers ----------
       v9.8.1 relocated items before later holy/story generators ran, so a guaranteed talisman or
       document could be added afterwards into a mechanically unreachable pocket.  Only items that
       the final mechanical audit marks unreachable are moved; intended locked/raft/portal rewards stay put. */
    function currentWalkCells(){return state?.player?ReachabilityService.playerSearch(state.player,{tileAt:(x,y)=>state.map[y]?.[x]===TT.STAIR?TT.WALL:state.map[y]?.[x]}).cells:new Set()}
    function repairLateItems(){
      if(!state?.items?.length){state.lateItemRepair1004={moved:0,bad:0,left:0};return state.lateItemRepair1004}
      // An audit that cannot run is a failed generation attempt, never a clean result: the error
      // reaches the 32-attempt loop in the floor pipeline, which regenerates the floor and finally throws.
      const unreachableItems=()=>{try{return mechanicalReachAudit()?.items?.unreachable||[]}catch(error){console.error('[manru] reach audit failed; the floor is regenerated',error);throw error}};
      const bad=unreachableItems();
      if(!bad.length){state.lateItemRepair1004={moved:0,bad:0,left:0};return state.lateItemRepair1004}
      const walk=currentWalkCells();let moved=0;
      for(const b of bad){
        const it=(state.items||[]).find(i=>i.x===b.x&&i.y===b.y&&i.name===b.name);if(!it)continue;
        const x=it.x,y=it.y;if(PlacementService.placeItem(it,{x,y},{reachable:walk})&&(it.x!==x||it.y!==y))moved++;
      }
      const left=unreachableItems();
      state.lateItemRepair1004={moved,bad:bad.length,left:left.length};return state.lateItemRepair1004
    }
function semanticDoors(){if(![6,8,11,16,20,24].includes(state.floor))return;const castleL=Math.floor(COLS*.40),keepL=Math.floor(COLS*.72);for(let y=2;y<ROWS-2;y++)for(let x=2;x<COLS-2;x++){if(state.map[y][x]!==TT.DOOR)continue;if([6,8,11,20,24].includes(state.floor)){setTerrainTile58(state.map,x,y,state.floor===24?TT.LIGHT_GRASS:TT.FLOOR);continue}const L=!tileBlocks(state.map[y][x-1]),R=!tileBlocks(state.map[y][x+1]),U=!tileBlocks(state.map[y-1][x]),D=!tileBlocks(state.map[y+1][x]),lr=L&&R&&!U&&!D,ud=U&&D&&!L&&!R;if(state.floor===16&&Math.abs(x-castleL)>1&&Math.abs(x-keepL)>1){setTerrainTile58(state.map,x,y,TT.FLOOR);continue}if(lr||ud)continue;setTerrainTile58(state.map,x,y,(L||R||U||D)?TT.FLOOR:TT.WALL)}}
function repairEntities(){for(const it of state.items||[]){if(!safeLandFor1005(null,it.x,it.y)){const q=ReachabilityService.hazardSafeCell({safeLandFor1005},it.x,it.y);it.x=q.x;it.y=q.y}}for(const m of state.monsters||[]){if(!PlacementService.monsterCanStand(m,m.x,m.y)){const ox=m.x,oy=m.y;m.x=-99;m.y=-99;const q=ReachabilityService.hazardSafeCell({safeLandFor1005},ox,oy,m);m.x=q.x;m.y=q.y}}}
function addRouteTag(x,y,label){state.routeTags=state.routeTags||[];if(!state.routeTags.some(t=>t.label===label))state.routeTags.push({x,y,label})}
function placeGuaranteedRelics(){
  if(state.floor===6&&!state.items.some(i=>i.rescueRelic1005==='drown')){const q=ReachabilityService.hazardSafeCell({safeLandFor1005},state.player.x+2,state.player.y);PlacementService.placeItem({...structuredClone(WARD_DROWN),x:q.x,y:q.y,rescueRelic1005:'drown'});addRouteTag(q.x,q.y,'수중 정자 구조함 · 익사 대비 유물');state.guaranteedRelic1005='drown'}
  if(state.floor===20&&!state.items.some(i=>i.rescueRelic1005==='void')){let q=ReachabilityService.hazardSafeCell({safeLandFor1005},55,25);PlacementService.placeItem({...structuredClone(WARD_VOID),x:q.x,y:q.y,rescueRelic1005:'void'});addRouteTag(q.x,q.y,'봉쇄 관측고 · 다음 구역 공허 대비 유물');state.guaranteedRelic1005='void'}
}
function remodel(){if(state?.specialFloor&&[23,24].includes(state.floor)){VisibilityService.compute();vfBuildDecor?.();state.routeMetric1005=routeMetric();return}if(!state)return;state.routeDesign1005=null;state.routeKeyShrine1005=null;semanticDoors();repairEntities();if(strictLockFloors().includes(state.floor))ensureStrictLocks96();semanticDoors();repairEntities();placeGuaranteedRelics();repairLateItems();window.__MANRU_RUNTIME81__?.Integrity81?.repair?.();VisibilityService.compute();vfBuildDecor?.();state.routeMetric1005=routeMetric();}
/* Remove visually meaningless plain doors globally. Locked gates are untouched.
   A real door must sit in a wall throat: passable on exactly one opposing axis,
   blocked on the perpendicular axis. This changes no key topology. */
function pruneOrphanDoors(){
  if(!state?.map)return 0;let n=0;
  for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++){
    if(state.map[y][x]!==TT.DOOR)continue;
    const L=!tileBlocks(state.map[y][x-1]),R=!tileBlocks(state.map[y][x+1]),U=!tileBlocks(state.map[y-1][x]),D=!tileBlocks(state.map[y+1][x]);
    const good=(L&&R&&!U&&!D)||(U&&D&&!L&&!R);if(good)continue;
    setTerrainTile58(state.map,x,y,(L||R||U||D)?TT.FLOOR:TT.WALL);n++;
  }
  if(n){state.orphanDoorsPruned1006=(state.orphanDoorsPruned1006||0)+n;VisibilityService.compute?.()}
  return n
}
const PROTECTED=()=>new Set([
 TT.STAIR,TT.PORTAL,TT.SWITCH,TT.RAFT,TT.DRAWBRIDGE_UP,TT.DRAWBRIDGE_DOWN,TT.KEY_TILE,TT.LOCKED_GATE,
 TT.WATER,TT.MERCURY,TT.LAVA,TT.VOID
].filter(v=>v!=null));
const doorTileSet=()=>new Set([TT.DOOR,TT.OPEN_DOOR,TT.LOCKED_GATE].filter(v=>v!=null));
function appendRoomOnce(r){state.rooms=state.rooms||[];if(!state.rooms.some(q=>q.append1020&&q.x===r.x&&q.y===r.y&&q.w===r.w&&q.h===r.h))state.rooms.push(r);return r}
function semanticDoorCleanup(){
  for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++)if(state.map[y][x]===TT.DOOR){
    const L=pass1020(state.map[y][x-1]),R=pass1020(state.map[y][x+1]),U=pass1020(state.map[y-1][x]),D=pass1020(state.map[y+1][x]);
    if(!((L&&R&&!U&&!D)||(U&&D&&!L&&!R)))setTerrainTile58(state.map,x,y,(L||R||U||D)?TT.FLOOR:TT.WALL);
  }
}
function floorSeedKey(tag=''){return `${state?.runId984||state?.runId||'run'}|${state?.floor||0}|${state?.layoutName||''}|${tag}`}
function stairMarkerState1029(){
  if(!state?.stairs||!inside1020(state.stairs.x,state.stairs.y))return{ok:false,reason:'invalid-stair-coordinate',stairs:state?.stairs||null,count:0};
  const{x,y}=state.stairs,cells=[];for(let yy=1;yy<ROWS-1;yy++)for(let xx=1;xx<COLS-1;xx++)if(state.map[yy][xx]===TT.STAIR)cells.push({x:xx,y:yy});
  const tile=state.map[y]?.[x],ok=tile===TT.STAIR&&cells.length===1&&cells[0].x===x&&cells[0].y===y;
  return{ok,x,y,tile,count:cells.length,cells}
}
function ensureFinalExitMarker(){
  if(!state?.stairs||!inside1020(state.stairs.x,state.stairs.y)){const out=stairMarkerState1029();if(state)state.stairMarkerAudit1029=out;return out}
  const{x,y}=state.stairs,before=state.map[y]?.[x],restored=before!==TT.STAIR;if(restored)setTerrainTile58(state.map,x,y,TT.STAIR);
  const out={...stairMarkerState1029(),before,after:state.map[y]?.[x],restored};state.stairMarkerAudit1029=out;return out
}
function finalExitReach1029(){const r=finalReachSet1029();return !!state?.stairs&&state.map?.[state.stairs.y]?.[state.stairs.x]===TT.STAIR&&r.has(K1020(state.stairs.x,state.stairs.y))}
function f20DiagonalLockAudit(){
  if(state.floor!==20||!state.keyPlan96?.groups?.length)return null;const plan=state.keyPlan96,ids=plan.groups.map(g=>g.keyId),keyFor=id=>(plan.keys||[]).find(q=>q.keyId===id&&q.active!==false)||(plan.keys||[]).find(q=>q.keyId===id),goal=plan.finalTarget||state.stairs,stages=[];
  for(let i=0;i<ids.length;i++){const before=ReachabilityService.bossStageReach({K1020,inside1020,HAZ1020},ids.slice(0,i)),after=ReachabilityService.bossStageReach({K1020,inside1020,HAZ1020},ids.slice(0,i+1)),key=keyFor(ids[i]),next=i===ids.length-1?goal:keyFor(ids[i+1]),future=ids.slice(i+1).filter(id=>{const q=keyFor(id);return q&&before.seen.has(K1020(q.x,q.y))}),deeper=ids.slice(i+2).filter(id=>{const q=keyFor(id);return q&&after.seen.has(K1020(q.x,q.y))});
    const keyReachable=!!key&&before.seen.has(K1020(key.x,key.y)),targetBefore=!!next&&before.seen.has(K1020(next.x,next.y)),targetAfter=!!next&&after.seen.has(K1020(next.x,next.y)),exitBefore=before.seen.has(K1020(goal.x,goal.y)),exitAfter=after.seen.has(K1020(goal.x,goal.y));let gained=0;for(const kk of after.seen)if(!before.seen.has(kk))gained++;
    stages.push({index:i,keyId:ids[i],keyReachable,keyDistance:key?before.dist.get(K1020(key.x,key.y))??null:null,target:i===ids.length-1?(plan.finalTargetLabel||'boss'):ids[i+1],targetBefore,targetAfter,futureKeysBefore:future,deeperKeysAfter:deeper,exitBefore,exitAfter,gainedCells:gained,ok:keyReachable&&!targetBefore&&targetAfter&&!future.length&&!deeper.length&&gained>0&&(i===ids.length-1?exitAfter:!exitAfter)})}
  const all=ReachabilityService.bossStageReach({K1020,inside1020,HAZ1020},ids),exitAfterAll=all.seen.has(K1020(goal.x,goal.y)),zero=ReachabilityService.bossStageReach({K1020,inside1020,HAZ1020},[]).seen.has(K1020(goal.x,goal.y));return{movement:'DIRS8-no-corner-block',stages,exitBeforeAny:zero,exitAfterAll,ok:!zero&&exitAfterAll&&stages.length===ids.length&&stages.every(s=>s.ok)}
}
function f20DeepKeyAudit(){
  if(state.floor!==20||!state.keyPlan96?.groups?.length)return null;const ids=state.keyPlan96.groups.map(g=>g.keyId),spec=state.f20BossLock1020?.keyDepth||state.f20KeyDepth1020||[],rows=[];
  for(let i=0;i<ids.length;i++){const id=ids[i],meta=spec.find(q=>q.keyId===id),key=(state.keyPlan96.keys||[]).find(q=>q.keyId===id&&q.active!==false);if(!meta||!key){rows.push({keyId:id,ok:false,reason:'missing-meta-or-key'});continue}const r=meta.zone,reach=ReachabilityService.bossStageReach({K1020,inside1020,HAZ1020},ids.slice(0,i)),cand=[];for(let y=r.y+1;y<r.y+r.h-1;y++)for(let x=r.x+1;x<r.x+r.w-1;x++){const d=reach.dist.get(K1020(x,y)),t=state.map[y]?.[x];if(d==null||![TT.FLOOR,TT.STONE_PATH,TT.WOOD_FLOOR,TT.GILDED_FLOOR,TT.CARPET,TT.GRASS,TT.LIGHT_GRASS,TT.KEY_TILE].filter(v=>v!=null).includes(t))continue;cand.push({x,y,d})}const max=cand.reduce((m,q)=>Math.max(m,q.d),-1),kd=reach.dist.get(K1020(key.x,key.y))??null;rows.push({keyId:id,x:key.x,y:key.y,distance:kd,maxDistance:max,candidates:cand.length,zone:{...r},deepest:kd!=null&&kd===max,reachable:kd!=null,ok:kd!=null&&kd===max})}
  return{movement:'DIRS8-no-corner-block',keys:rows,ok:rows.length===ids.length&&rows.every(q=>q.ok)}
}
function auditFloor20Content(){
  if(state.floor!==20)return null;
  const names=['수비병','강철이','살라맨더'],residents=(state.monsters||[]).filter(m=>m.hp>0&&!m.boss),counts=Object.fromEntries(names.map(n=>[n,residents.filter(m=>m.name===n).length]));
  const lock=lockAudit96()||null,surface=lockSurfaceAudit96()||null,diagonalLock=f20DiagonalLockAudit(),deepKeys=f20DeepKeyAudit(),progression=ReachabilityService.bossProgressionActions({K1020,inside1020,HAZ1020}),reachAll=reachableSet1020({unlock:true,openBoss:true,diagonal:true});
  const rewards=(state.f20RewardSpots1020||[]).map(q=>({...q,reachable:reachAll.has(K1020(q.x,q.y))})),loose=(state.items||[]).filter(i=>i.f20LooseLoot1020).map(i=>({name:i.name,x:i.x,y:i.y}));
  const contentAsFloor=new Set([TT.KEY_TILE,TT.CACHE,TT.ARMORY,TT.VAULT,TT.RACK,TT.CRATE,TT.JAR,TT.IRON_HOOK,TT.STONE_PILLAR,TT.LANTERN_POST,TT.LOW_FENCE,TT.BRAZIER,TT.COOKPOT,TT.ALTAR,TT.PAVILION].filter(v=>v!=null));
  const cls=t=>{if(contentAsFloor.has(t))return'floor';if(t===TT.LAVA)return'lava';if(t===TT.WALL)return'wall';if(t===TT.LOCKED_GATE||t===TT.DOOR||t===TT.OPEN_DOOR)return'gate';if(t===TT.DRAWBRIDGE_DOWN)return'bridge';if(t===TT.GILDED_FLOOR)return'gilded';if(!tileBlocks(t)&&!HAZ1020().has(t))return'floor';return`solid:${t}`};
  let symmetryMismatch=0,lavaMismatch=0,lava=0,wall=0,walk=0,wood=0;const mismatchSamples=[];
  for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++){const t=state.map[y][x];if(t===TT.LAVA)lava++;if(t===TT.WALL)wall++;if(t===TT.WOOD_FLOOR)wood++;if(!tileBlocks(t)&&!HAZ1020().has(t))walk++}
  for(let y=1;y<ROWS-1;y++)for(let x=1;x<Math.floor(COLS/2);x++){const mx=COLS-1-x,a=cls(state.map[y][x]),b=cls(state.map[y][mx]);if(a!==b){symmetryMismatch++;if(mismatchSamples.length<12)mismatchSamples.push({x,y,mx,a,b})}if((state.map[y][x]===TT.LAVA)!==(state.map[y][mx]===TT.LAVA))lavaMismatch++}
  const keys=(state.keyPlan96?.keys||[]).map(q=>({x:q.x,y:q.y,keyId:q.keyId,active:q.active!==false})),gates=(state.keyPlan96?.doors||[]).map(d=>({x:d.x,y:d.y,keyId:d.keyId,open:d.open===true}));
  const area=Math.max(1,(COLS-2)*(ROWS-2)),openRatio=walk/area,connections=state.architectureConnections51?.carved??null;
  const contracts={
    grandSize:COLS>=111&&ROWS>=85,
    population:residents.length===12&&names.every(n=>counts[n]>=1),
    rewards:rewards.length===3&&rewards.every(q=>q.reachable),
    loose:loose.length>=7&&loose.length<=11,
    tripleKeys:keys.length===3&&gates.length===3&&['iron','jade','brass'].every((id,i)=>keys[i]?.keyId===id&&gates[i]?.keyId===id),
    lock:lock?.ok===true,surface:surface?.ok===true,diagonalLock:diagonalLock?.ok===true,deepKeys:deepKeys?.ok===true,
    lava:lava>=360&&lavaMismatch===0,
    symmetry:symmetryMismatch===0,
    density:openRatio<=.38,
    wood:wood>=220&&(state.f20WoodWings1020||[]).length>=4,
    mazes:(state.f20MazeZones1020||[]).length===4&&(state.f20MazeZones1020||[]).every(z=>z?.far?.d>=18),
    progression:Number.isFinite(progression?.actions)&&progression.actions>=300,
    noConnectorBypass:connections===0
  };
  state.f20Content1020={size:[COLS,ROWS],monsters:residents.length,counts,rewards,loose,keys,gates,lock,surface,diagonalLock,deepKeys,progression,lava,wall,walk,wood,mazeZones:structuredClone(state.f20MazeZones1020||[]),woodWings:structuredClone(state.f20WoodWings1020||[]),keyDepthBuild:structuredClone(state.f20KeyDepth1020||[]),openRatio:+openRatio.toFixed(4),symmetryMismatch,lavaMismatch,mismatchSamples,connections,contracts,ok:Object.values(contracts).every(Boolean)};
  return state.f20Content1020;
}
function carvePartition(r,score){
  const snap=[];for(let y=r.y;y<r.y+r.h;y++)snap.push(state.map[y].slice(r.x,r.x+r.w));
  const beforeStair=reach1020(state.stairs,{unlock:true,openBoss:true}),formal=[4,6,7,9,12,14,15,17,19,20,22,24].includes(state.floor),shell=score.currentEdge>=.42;
  const floorAt=(x,y)=>{const t=state.map[y]?.[x];return basicFloor1022(t)||t===TT.FLOOR||t===TT.WOOD_FLOOR||t===TT.GILDED_FLOOR||t===TT.CARPET||t===TT.STONE_PATH||t===TT.MOON_STONE||t===TT.DARK_WOOD};
  const restore=()=>{for(let yy=0;yy<snap.length;yy++)for(let xx=0;xx<snap[yy].length;xx++)setTerrainTile58(state.map,r.x+xx,r.y+yy,snap[yy][xx])};
  const wallCell=(x,y)=>{const t=state.map[y]?.[x];if(!inside1020(x,y)||PROTECTED().has(t)||doorTileSet().has(t)||t===TT.WINDOW||!floorAt(x,y))return false;setTerrainTile58(state.map,x,y,TT.WALL);return true};
  const doorCell=(x,y)=>{if(!inside1020(x,y)||state.map[y]?.[x]!==TT.WALL)return false;setTerrainTile58(state.map,x,y,TT.DOOR);return true};
  const ix0=r.x+(shell?1:0),ix1=r.x+r.w-1-(shell?1:0),iy0=r.y+(shell?1:0),iy1=r.y+r.h-1-(shell?1:0),cross=score.area>=150&&r.w>=14&&r.h>=11;let doors=0;
  const pairedY=x=>{const d=Math.max(2,Math.min(3,Math.floor((iy1-iy0+1)/4)));for(const yy of formal?[r.cy-d,r.cy+d]:[iy0+Math.max(2,Math.floor((iy1-iy0)*.30)),iy0+Math.min(iy1-iy0-2,Math.floor((iy1-iy0)*.70))])doors+=doorCell(x,clamp1020(yy,iy0+1,iy1-1))?1:0};
  const pairedX=y=>{const d=Math.max(2,Math.min(3,Math.floor((ix1-ix0+1)/4)));for(const xx of formal?[r.cx-d,r.cx+d]:[ix0+Math.max(2,Math.floor((ix1-ix0)*.30)),ix0+Math.min(ix1-ix0-2,Math.floor((ix1-ix0)*.70))])doors+=doorCell(clamp1020(xx,ix0+1,ix1-1),y)?1:0};
  const bias=formal?0:((hash1022(floorSeedKey(`partition:${state.floor}:${r.x},${r.y}`))%3)-1),splitX=clamp1020(r.cx+bias,ix0+2,ix1-2),splitY=clamp1020(r.cy-bias,iy0+2,iy1-2);
  if(r.w>=r.h){const x=splitX;for(let y=iy0;y<=iy1;y++)wallCell(x,y);pairedY(x);if(cross){const y=splitY;for(let xx=ix0;xx<=ix1;xx++)wallCell(xx,y);pairedX(y)}}
  else{const y=splitY;for(let x=ix0;x<=ix1;x++)wallCell(x,y);pairedX(y);if(cross){const x=splitX;for(let yy=iy0;yy<=iy1;yy++)wallCell(x,yy);pairedY(x)}}
  semanticDoorCleanup();const reach=reachableSet1020({unlock:true,openBoss:true});let usable=0,reachable=0;for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++)if(floorAt(x,y)){usable++;if(reach.has(K1020(x,y)))reachable++}
  if((beforeStair&&!reach.has(K1020(state.stairs.x,state.stairs.y)))||!usable||reachable/usable<.90||doors<2){restore();return{ok:false,doors:0}}
  return{ok:true,doors};
}
function floor20ContentAudit(){return state?.floor===20?structuredClone(auditFloor20Content()||null):null}
function finalComponentAudit(){return ReachabilityService.finalComponents({finalReachSet1029,inside1020,HAZ1020,K1020,stairMarkerState1029,finalExitReach1029},true)}
function populateFloor2Branches(){
 const layout=state.floor===2&&state.floor2Choice63;if(!layout?.branches)return;
 const food=CONSUMABLES.find(i=>i.name==='말린 육포'),heal=window.MANRU_POTIONS?.find(i=>i.potionKind==='heal_small'),ammo=window.MANRU_AMMO?.find(i=>i.name==='목제 화살'),identify=window.MANRU_TALISMANS?.find(i=>i.talismanKind==='identify'),focus=window.MANRU_POTIONS?.find(i=>i.potionKind==='focus'),smoke=window.MANRU_POTIONS?.find(i=>i.potionKind==='smoke');
 const audit={packs:[],rewards:[],failures:[]},claimed=new Set();
 for(const branch of layout.branches){
   if(!branch.reward)continue;
   const prototypes=branch.kind==='danger'?[heal,food,ammo,identify,heal,focus]:[heal,food,ammo,identify,smoke],spots=branch.rewardSpots||[branch.reward],cells=new Set(branch.cells);
   for(let n=0;n<branch.bonusCount;n++){
     if(state.items.some(it=>it.floor2Bonus66===branch.id&&it.floor2BonusIndex66===n))continue;
     const proto=prototypes[n];if(!proto){audit.failures.push(`reward-prototype:${branch.id}:${n}`);continue}
     const origin=spots[n%spots.length],placed=PlacementService.placeItem({...clone(proto),count:proto===ammo?8:1,floor2Bonus66:branch.id,floor2BonusIndex66:n},origin,{preferEmpty:true,restrict:q=>cells.has(k(q.x,q.y))&&Math.abs(q.x-origin.x)+Math.abs(q.y-origin.y)<=4});
     if(!placed)audit.failures.push(`reward-placement:${branch.id}:${n}`);
   }
   for(const [index,pack]of (branch.encounters||[]).entries()){
     const nearby=m=>m.hp>0&&cells.has(k(m.x,m.y))&&Math.abs(m.x-pack.x)+Math.abs(m.y-pack.y)<=4;
     const members=state.monsters.filter(m=>!claimed.has(m)&&nearby(m)).slice(0,pack.names.length);members.forEach(m=>claimed.add(m));let added=0;
     const candidates=branch.cells.map(kk=>{const[x,y]=kk.split(',').map(Number);return{x,y,d:Math.abs(x-pack.x)+Math.abs(y-pack.y)}}).filter(q=>q.d<=4).sort((a,b)=>a.d-b.d||a.y-b.y||a.x-b.x);
     for(let n=members.length;n<pack.names.length;n++){
       const name=pack.names[n]==='객잔 경비병'&&globalThis.__MANRU_RANDOM57__()>=.8?'취객':pack.names[n];if(!MONSTERS.some(m=>m.name===name&&state.floor>=m.min&&state.floor<=m.max)){audit.failures.push(`enemy-prototype:${name}`);continue}
       let mon=null;for(const spacing of [2,1]){for(const q of candidates){if(state.monsters.some(m=>m.hp>0&&Math.max(Math.abs(m.x-q.x),Math.abs(m.y-q.y))<spacing))continue;mon=spawnNamed(name,q,{placementMode:'exact',provenance:'floor2-branch'});if(mon)break}if(mon)break}
       if(mon){members.push(mon);claimed.add(mon);added++}else audit.failures.push(`enemy-placement:${branch.id}:${index}:${name}`);
     }
     audit.packs.push({branch:branch.id,index,x:pack.x,y:pack.y,expected:pack.names.length,actual:members.length,added,names:members.map(m=>m.name)});
   }
   audit.rewards.push({branch:branch.id,expected:branch.bonusCount,actual:state.items.filter(it=>it.floor2Bonus66===branch.id).length});
 }
 layout.encounterAudit68=audit;
}
const GenerationValidator=Object.freeze({
 normal(strictFloor){
  const authored=[23,24].includes(state.floor);if(authored){const check=globalThis.__MANRU_SPECIAL_FLOORS60__?.validate?.();state.specialProgressionValidation57=check;if(!check?.ok)return{accepted:false,failure:{specialProgression:check},rejection:{specialProgression:true}}};
  if(state.floor===1){const tutorial=tutorialEntryAudit();state.tutorialEntryAudit60=tutorial;if(!tutorial.ok)return{accepted:false,failure:{tutorial},rejection:{tutorial:true}};const reach=ReachabilityService.playerSearch(state.player,{ignoreOccupants:true}).cells,encounters=state.monsters.filter(m=>m.hp>0&&monsterRewardPolicy(m).xp&&reach.has(k(m.x,m.y))),xp=encounters.reduce((n,m)=>n+(m.xp||0),0);state.earlyProgression58={xp,required:xpRequirementForLevel57(2),encounters:encounters.length,ok:xp>=xpRequirementForLevel57(2)};if(!state.earlyProgression58.ok)return{accepted:false,failure:{earlyProgression:state.earlyProgression58},rejection:{earlyProgression:true}}}

  if(state.floor===2&&state.floor2Choice63?.version>=4){const a=state.floor2Choice63.encounterAudit68;if(!a||a.failures.length||a.packs.some(p=>p.actual<p.expected)||a.rewards.some(r=>r.actual!==r.expected))return{accepted:false,failure:{floor2Encounters:a},rejection:{floor2Encounters:true}}}
  const connectivity=finalComponentAudit();state.finalConnectivity51=connectivity;
  if(!authored&&!connectivity.ok)return{accepted:false,failure:{connectivity},rejection:{islands:connectivity.totalUnreachable,rewards:connectivity.blockedRewards.length}};
  if(state.floor===20){const f20=floor20ContentAudit();if(!f20?.ok)return{accepted:false,failure:{floor20:f20},rejection:{floor20:true}}}
  if(!strictFloor)return{accepted:true};
  let finalLock=null,finalProgress=null,finalSurface=null;
  try{finalLock=lockAudit96()||null}catch(e){finalLock={ok:false,error:String(e)}}
  try{finalProgress=keyProgressAudit48(false)||null}catch(e){finalProgress={ok:false,error:String(e)}}
  try{finalSurface=lockSurfaceAudit96()||null}catch(e){finalSurface={ok:false,error:String(e)}}
  const accepted=!!finalLock?.ok&&(finalProgress?.ok!==false)&&(finalSurface?.ok!==false);
  return{accepted,finalLock,finalProgress,finalSurface,failure:{lock:finalLock,progress:finalProgress,surface:finalSurface},rejection:{keys:true}};
 },
legendary:function legendaryCandidate10(){const progression=keyProgressAudit48(false),all=ReachabilityService.keyWalk(new Set(['iron','jade'])),islands=[],badItems=[],badRooms=[];let walkable=0,ordinaryDoors=0;const forbidden=new Set([TT.FLOOR,TT.DARK_WOOD,TT.MOON_STONE,TT.GILDED_FLOOR,TT.BRAZIER,TT.CRATE,TT.JAR,TT.CACHE,TT.STONE_PILLAR,TT.PAPER_BRIDGE]);let reused=0;
 for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){const t=state.map[y][x];if(forbidden.has(t))reused++;if(t===TT.DOOR)ordinaryDoors++;if(!tileBlocks(t)||t===TT.LOCKED_GATE){walkable++;if(!all.seen.has(key46(x,y)))islands.push({x,y,t})}}
 for(const it of state.items)if(!all.seen.has(key46(it.x,it.y)))badItems.push({name:it.name,x:it.x,y:it.y});
 for(const r of state.rooms){let n=0;for(let y=r.y+1;y<r.y+r.h-1;y++)for(let x=r.x+1;x<r.x+r.w-1;x++)if(all.seen.has(key46(x,y)))n++;if(!n)badRooms.push(r.index)}
 return{ok:progression.ok&&!islands.length&&!badItems.length&&!badRooms.length&&!reused,seed:state.legendSeed49,progression,walkable,islands:islands.slice(0,20),islandCells:islands.length,badItems,badRooms,ordinaryDoors,reused,rooms:state.rooms.length,buildings:state.legendBuildings49.length,landmarks:state.legendObjects49.filter(x=>x.kind.startsWith('monument')).length,water:state.map.flat().filter(t=>t===TT.WATER).length,bridges:state.map.flat().filter(t=>t===LEGEND_TILES49[state.legendTheme47].bridge).length};
}
});
const NormalFloorGenerator=Object.freeze({
orderArchitectureCandidates(items){
  // The architecture pool has at most 20 rooms (or four module functions).
  // Preserve the characterized cold-engine comparison order explicitly:
  // binary insertion below 16, initial monotone run then insertion above it.
  // A random native sort comparator changed RNG consumption after JIT warmup.
  let start=1;
  if(items.length>=16){
    const descending=RngService.random()<.5;start=2;
    while(start<items.length){if((RngService.random()<.5)!==descending)break;start++}
    if(descending)for(let lo=0,hi=start-1;lo<hi;lo++,hi--){const value=items[lo];items[lo]=items[hi];items[hi]=value}
  }
  for(let i=start;i<items.length;i++){
    const value=items[i];let left=0,right=i;
    while(left<right){const mid=left+((right-left)>>1);if(RngService.random()<.5)right=mid;else left=mid+1}
    for(let j=i;j>left;j--)items[j]=items[j-1];items[left]=value;
  }
  return items;
},
seed(finalAttempt=1,baseAttempt=0){return `${state?.runId984||window.__MANRU_RUN_SEED984||state?.runId||'legacy'}|floor:${state?.floor||0}|final:${finalAttempt}|base:${baseAttempt}`},
acceptedBase(args,finalAttempt=1){
  const strict=!!(state&&strictLockFloors().includes(state.floor)&&ensureStrictLocks96),base=strict?captureGenerationSnapshot():null;
  let r=null,a=null,attempts=0;
  do{if(attempts>0&&base){const profile=state.generationProfile93;restoreGenerationSnapshot(base);state.generationProfile93=profile}attempts++;globalThis.__MANRU_GEN_RNG57__?.begin?.(NormalFloorGenerator.seed(finalAttempt,attempts));r=globalThis.__MANRU_GENERATE_CORE983__(...args);if(!strict)break;a=ensureStrictLocks96({force:true})}while(!a?.ok&&attempts<5);
  if(state){state.strictLockAudit1004=a;state.generationBaseAttemptsR18=attempts;state.generationSeedR59=NormalFloorGenerator.seed(finalAttempt,attempts)}return r
},
generate(...args){
  const strictFloor=!!(state&&strictLockFloors().includes(state.floor));
  const transaction57=captureGenerationSnapshot();
  state.branchContext105=null;state.branchTerrain105=null;state.branchPortals105=[];state.terrainReactions105=newTerrainReactions105();
  const maxFinalAttempts=32;let r=null,accepted=false,finalAttempt=0,finalLock=null,finalProgress=null,finalSurface=null,lastFailure=null;const rejected=[];
  while(finalAttempt<maxFinalAttempts&&!accepted){
    finalAttempt++;
    try{
    if(finalAttempt>1){const profile=state.generationProfile93;restoreGenerationSnapshot(transaction57);state.generationProfile93=profile}
    state.branchContext105=null;state.branchTerrain105=null;state.branchPortals105=[];state.terrainReactions105=newTerrainReactions105();
    state.generationInProgress57=true;state.terrainUnderlay58={};state.terrainAttachment58={};state.bossDrop55=null;globalThis.__MANRU_GEN_RNG57__?.begin?.(NormalFloorGenerator.seed(finalAttempt,0));delete state.ammoGeneration972;state.peachGeneration53={limit:1+(globalThis.__MANRU_RANDOM57__()<.35?1:0),reserved:0};
    r=NormalFloorGenerator.acceptedBase(args,finalAttempt);
    if(!state)throw new Error("generation state missing");

    // Geometry-producing passes must finish BEFORE the decisive key audit.
    
    hz();
    remodel();
    updateWardHud();
    pruneOrphanDoors();
    normalizeAllItems();
    applyArchitecture1020();
    window.__MANRU_GEN991__?.applyCurses?.();
    window.__MANRU_GEN991__?.ensureHoly?.();
    globalThis.storyAfterFloorGenerated992?.();
    repairLateItems();
    validateTerrainUnderlays();
    populateFloor2Branches();
    branchEntrance();

    const exitMarker=ensureFinalExitMarker()||{ok:false,reason:'missing-exit-marker-audit'};
    if(!exitMarker.ok){lastFailure={attempt:finalAttempt,exitMarker};rejected.push({attempt:finalAttempt,exitMarker:true});continue}
    PlacementService.flushPendingItems();
    const validation=GenerationValidator.normal(strictFloor);accepted=validation.accepted;
    if('finalLock' in validation){finalLock=validation.finalLock;finalProgress=validation.finalProgress;finalSurface=validation.finalSurface}
    if(!accepted){lastFailure={attempt:finalAttempt,...validation.failure};rejected.push({attempt:finalAttempt,...validation.rejection});continue}
    if(!strictFloor)break;
    }catch(e){accepted=false;lastFailure={attempt:finalAttempt,error:String(e)};rejected.push(lastFailure);}
  }
  if(!accepted){globalThis.__MANRU_GEN_RNG57__?.end?.();restoreGenerationSnapshot(transaction57);state.generationFinalKeyFailureR48=lastFailure;throw new Error(`final connectivity/key progression rejected ${maxFinalAttempts} generated maps on floor ${state.floor}`)}

  // No topology, key, reward or entity mutation is allowed beyond this point.
  if(strictFloor){
    state.strictLockAudit1004=finalLock||state.strictLockAudit1004;
    state.keyIntegrity48={...(finalProgress||{}),finalGeometry:true,regeneratedMaps:Math.max(0,finalAttempt-1),surfaceOk:finalSurface?.ok!==false};
  }
  // Only the accepted geometry and final spawn may enter exploration memory.
  produceWallMaterials105(state,true);state.seen=new Set();state.generationInProgress57=false;state.generationRngAuditR59=globalThis.__MANRU_GEN_RNG57__?.end?.()||null;VisibilityService.compute();state.generatedBuild='r57';state.generationFinalKeyFailureR48=null;state.generationRejected51=rejected;
  state.generationFinalKeyAttemptsR48=finalAttempt;state.naturalPopulation57={initial:state.monsters.filter(isNaturalMonster).length,generation:0,nextAgency:null};
  globalThis.__MANRU_RELEASE__?.floorTutorial?.();
  state.generationPipelineR18={version:'r57-transactional-state-audit',baseAttempts:state.generationBaseAttemptsR18||1,finalAttempts:finalAttempt,finalKeyOk:strictFloor?true:null,floor:state.floor};
  return r;
}
});
const REGION_AMBIENCE=[
  ['붉은 등롱이 바람도 없이 흔들린다.','빈 연회상 너머에서 잔 부딪히는 소리가 난다.'],
  ['빗소리가 지붕이 없는 정원에서 울린다.','젖은 먹 냄새와 대나무 냄새가 섞인다.'],
  ['거울 속 등불이 실제 등불보다 늦게 흔들린다.','비단 너머에서 누군가 걷는 소리가 겹친다.'],
  ['차가운 쇠 냄새 아래 오래된 향신료 냄새가 남아 있다.','장독 사이에서 쇠사슬이 아주 느리게 끌린다.'],
  ['황금 벽은 밝은데 방 안은 더 어둡다.','원혼이 벽의 문양을 따라 반대 방향으로 흐른다.']
];
function safeEchoCell1005(x,y){
 if(x<0||y<0||x>=COLS||y>=ROWS)return false;const t=state.map[y][x];
 const ordinary=[TT.FLOOR,TT.GRASS,TT.LIGHT_GRASS,TT.CARPET,TT.STONE_PATH,TT.WOOD_FLOOR,TT.MOON_STONE,TT.DARK_WOOD,TT.GILDED_FLOOR].filter(Number.isFinite);
 return ordinary.includes(t)&&ReachabilityService.playerPassable(x,y)&&!dangerousLootTerrain42(t)&&!OccupancyService.isOccupied(x,y)&&!(state.player.x===x&&state.player.y===y)&&!(state.items||[]).some(i=>i.x===x&&i.y===y)&&!(state.switches||[]).some(i=>i.x===x&&i.y===y)&&!(state.portals981||[]).some(i=>i.x===x&&i.y===y)&&!neutralInteractableAt58(x,y)&&!(state.stairs?.x===x&&state.stairs?.y===y);
}
function rand(a,b){ return Math.floor(globalThis.__MANRU_RANDOM57__()*(b-a+1))+a; }
function regionFor(floor){
  return REGIONS.find(r=>floor>=r[0] && floor<=r[1]) || REGIONS[0];
}
function island(m,x,y){carveRect(m,x,y,5,5,TT.FLOOR);const r=roomRect(x,y,5,5);state.rooms.push(r);setTerrainTile58(m,r.cx,r.cy,TT.STAMINA_PAD);return r}
function tileBlocks(t){if(BLOCK85.has(t)||t===TT.HIDDEN_BRIDGE||t===TT.HIDDEN_WALL)return true;return tileBlocksByTerrain(t)}
/* ===== Canonical floor-generation stage registry =====
   Legacy releases used nested `old=generateFloor; generateFloor=...` wrappers.  The
   current runtime keeps one base generator plus explicit pre/post stages instead. */
const GENERATION_PIPELINE={base:{id:'base-vaults38',fn:generateFloorBaseVaults},pre:[{id:'aim-reset52',fn:aimResetPreGeneration},{id:'boss-zones54-pre',fn:bossZonesPrePreGeneration},{id:'guard59-pre',fn:guardPrePreGeneration},{id:'special60-pre',fn:specialPrePreGeneration},{id:'region71-pre',fn:regionPrePreGeneration},{id:'quality94-pre',fn:qualityPrePreGeneration},{id:'artifact-reset46',fn:resetPortal46}],post:[{id:'feature-rooms41',fn:featureRoomsPostGeneration},{id:'potions41',fn:potionsPostGeneration},{id:'room-sculpt42',fn:roomSculptPostGeneration},{id:'organic-nooks43',fn:organicNooksPostGeneration},{id:'room-structure44',fn:roomStructurePostGeneration},{id:'strategy47',fn:strategyPostGeneration},{id:'resource48',fn:resourcePostGeneration},{id:'boss-zones54-post',fn:bossZonesPostPostGeneration},{id:'knowledge56',fn:knowledgePostGeneration},{id:'food57',fn:foodPostGeneration},{id:'canon58',fn:canonPostGeneration},{id:'guard59-post',fn:guardPostPostGeneration},{id:'special60-post',fn:specialPostPostGeneration},{id:'population61',fn:populationPostGeneration},{id:'feeling62',fn:feelingPostGeneration},{id:'pacing70',fn:pacingPostGeneration},{id:'region71-post',fn:regionPostPostGeneration},{id:'talisman74',fn:talismanPostGeneration},{id:'polish78',fn:polishPostGeneration},{id:'runtime81',fn:runtimePostGeneration},{id:'architecture85',fn:finishArchitecture90},{id:'quality94-post',fn:qualityPostPostGeneration},{id:'locks96',fn:locksPostGeneration},{id:'artifact-portal46',fn:maybePortal46}],density:addDensityMonsters964};
function playerMobilityStandable57(x,y){return !!state?.player&&ReachabilityService.playerTerrainPassable(x,y)}
function validatePlayerTransfer57(x,y,opts={}){
  if(!state?.player||x<0||y<0||x>=COLS||y>=ROWS)return{ok:false,reason:'bounds'};
  const cause=opts.cause||'teleport',policy=opts.policy||playerTransferPolicy57(cause)||{},p=state.player;
  if((opts.excludeOrigin??policy.excludeOrigin)&&x===p.x&&y===p.y)return{ok:false,reason:'origin'};
  if((opts.requireSeen??policy.seen)&&!state.seen?.has(k(x,y)))return{ok:false,reason:'unseen'};
  if((opts.requireSafe??policy.safe)&&!playerTransferLandingSafe57(x,y))return{ok:false,reason:'unsafe'};
  if(opts.requireAuthorized??policy.authorized){const authorized=opts.authorizedSet||ReachabilityService.playerMobility();if(!authorized.has(k(x,y)))return{ok:false,reason:'unauthorized'}}
  return{ok:true,reason:null};
}
function blinkHardBlock(t){if(BLOCK85.has(t)||t===TT.HIDDEN_BRIDGE||t===TT.HIDDEN_WALL)return true;if(t===TT.PALACE_ROCK||t===TT.PALACE_WALL_LAMP)return true;if(t>=500&&t<660)return [4,5,6,8].includes((t-500)%16);return[TT.WALL,TT.BAMBOO,TT.TABLE,TT.SCREEN,TT.HEDGE,TT.FAKE_DOOR,TT.LOCKED_GATE,TT.SECRET_DOOR,TT.PEACH_TREE,TT.DRAWBRIDGE_UP].includes(t)}
function blinkTargetCells57(origin=state?.player,range=state?.player?.blinkLevel||0,opts={}){
  if(!state||!origin||range<=0)return[];const out=[],hazards=new Set([TT.VOID,TT.WATER,TT.LAVA,TT.MERCURY].filter(Number.isFinite));
  for(const[dx,dy]of DIRS8)for(let dist=1;dist<=range;dist++){
    const x=origin.x+dx*dist,y=origin.y+dy*dist;if(x<0||y<0||x>=COLS||y>=ROWS)break;const t=state.map[y][x];if(blinkHardBlock(t))break;
    const standable=!hazards.has(t)&&ReachabilityService.playerPassable(x,y)&&(!opts.ignoreOccupants?!OccupancyService.isOccupied(x,y):true);if(standable)out.push({x,y,dx,dy,dist,tile:t});if(t===TT.PORTAL)break;
  }
  return out;
}
function selectCoreDestination54(owner=null,target=state.player){
 const p=target||owner,search=p===state.player?ReachabilityService.playerSearch(p,{ignoreOccupants:true,projectHazards:true,blinkBudget:Math.floor((p.focus||0)/2),blinkRange:state.status.skillSeal>0?0:p.blinkLevel||0}):null,candidates=[];
 for(const key of (p===state.player?search.cells:ReachabilityService.distances(p).keys())){
  const [x,y]=key.split(',').map(Number),distance=p===state.player?search.dist.get(key):Math.max(Math.abs(x-p.x),Math.abs(y-p.y));if(!distance||state.hazard1005?.armed?.[key]||!safeLootGround42(x,y)||OccupancyService.isOccupied(x,y)||state.items.some(i=>i.x===x&&i.y===y))continue;
  let space=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(safeLootGround42(x+dx,y+dy)&&![TT.DRAWBRIDGE_DOWN,TT.PAPER_BRIDGE,TT.RAFT,TT.CRUMBLE].includes(state.map[y+dy]?.[x+dx]))space++;
  if(space!==9)continue;
  let room=0;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)if(safeLootGround42(x+dx,y+dy))room++;
  candidates.push({x,y,distance,space:room});
 }
 candidates.sort((a,b)=>b.distance-a.distance||b.space-a.space||a.y-b.y||a.x-b.x);return candidates[0]||null;
}
  function contains(r,x,y){return x>=r.x&&y>=r.y&&x<r.x+r.w&&y<r.y+r.h}
  function alchemy(r){for(let x=r.x+1;x<=r.x+r.w-2;x+=2){placeFeatureTile(x,r.y+1,TT.TABLE);placeFeatureTile(x,r.y+r.h-2,TT.JAR)}placeFeatureTile(r.cx,r.cy,TT.COOKPOT);placeFeatureTile(r.cx-2,r.cy,TT.BRAZIER);placeFeatureTile(r.cx+2,r.cy,TT.CACHE);placeFeatureTile(r.cx,r.cy-2,TT.TABLE);placeFeatureTile(r.cx,r.cy+2,TT.TABLE);sigil(r.x+1,r.y+1,'연금술방')}
  function shrine(r){placeFeatureTile(r.cx,r.cy,TT.ALTAR);for(const[qx,qy]of[[r.x+1,r.y+1],[r.x+r.w-2,r.y+1],[r.x+1,r.y+r.h-2],[r.x+r.w-2,r.y+r.h-2]])placeFeatureTile(qx,qy,TT.BRAZIER);placeFeatureTile(r.cx-2,r.cy,TT.SCREEN);placeFeatureTile(r.cx+2,r.cy,TT.SCREEN);sigil(r.cx,r.y+1,'사당')}
  function study(r){for(let x=r.x+1;x<=r.x+r.w-2;x+=2)placeFeatureTile(x,r.y+1,TT.TABLE);for(let y=r.y+2;y<=r.y+r.h-2;y+=2)placeFeatureTile(r.x+1,y,TT.SCREEN);placeFeatureTile(r.cx,r.cy,TT.RUMOR);placeFeatureTile(r.cx+2,r.cy,TT.MIRROR);placeFeatureTile(r.cx-2,r.cy,TT.TABLE);sigil(r.x+1,r.y+1,'서고')}
  function cells(r){for(let y=r.y+1;y<=r.y+r.h-2;y++)if(y!==r.cy)placeFeatureTile(r.cx,y,TT.SCREEN);placeFeatureTile(r.cx-2,r.cy-1,TT.SNARE);placeFeatureTile(r.cx-2,r.cy+1,TT.SNARE);placeFeatureTile(r.cx+2,r.cy-1,TT.JAR);placeFeatureTile(r.cx+2,r.cy+1,TT.JAR);placeFeatureTile(r.cx,r.cy,TT.DOOR);sigil(r.x+1,r.y+1,'감방')}
  function place47(t){if(!t)return;const p=PlacementService.randomFloor(0);PlacementService.placeItem({...clone(t),x:p.x,y:p.y,count:1})}
  function contextualRewards56(){
    if(!state)return;for(const fr of state.featureRooms||[]){const cfg=ROOM_CONTEXT[fr.name],inside=i=>i.x>=fr.x&&i.y>=fr.y&&i.x<fr.x+fr.w&&i.y<fr.y+fr.h;if(fr.name==='연금술방'){let n=state.items.filter(i=>i.type==='potion'&&inside(i)).length;while(n<2&&state.items.length<13){if(!addRoomPotion(fr,cfg.kinds))break;n++}}else if(fr.name==='서고'){if(!state.items.some(i=>i.type==='talisman'&&inside(i))&&state.items.length<13)addRoomTalisman(fr)}else if(cfg&&globalThis.__MANRU_RANDOM57__()<.45&&state.items.length<13&&!state.items.some(i=>i.type==='potion'&&inside(i)))addRoomPotion(fr,cfg.kinds);if(['사당','무기고','감방'].includes(fr.name)&&globalThis.__MANRU_RANDOM57__()<.34&&state.items.length<13&&!state.items.some(i=>i.type==='talisman'&&inside(i)))addRoomTalisman(fr)}
    if([2,7,12,17,22].includes(state.floor)&&!state.items.some(i=>i.type==='talisman')&&state.items.length<13){const p=PlacementService.randomFloor(0),t=talismanPick56();if(t)PlacementService.placeItem({...t,x:p.x,y:p.y,count:1})}
  }
  /* ---------- 23F: mercury archipelago with ring bridges and submerged causeway ---------- */
  function markWallMaterial23(m,styleMap,r,style){
    if(!r)return;for(let x=r.x;x<r.x+r.w;x++)for(const y of [r.y,r.y+r.h-1])if(m[y]?.[x]===TT.WALL)styleMap[k(x,y)]=style;
    for(let y=r.y+1;y<r.y+r.h-1;y++)for(const x of [r.x,r.x+r.w-1])if(m[y]?.[x]===TT.WALL)styleMap[k(x,y)]=style;
  }
  function enrichSpecial94(f){
    state.outerWall94=state.outerWall94||{};state.itemBiasZones94=state.itemBiasZones94||[];
    if([4,13,16,18,22,24].includes(f)){
      const count=f>=16?4:3;
      for(let i=0;i<count;i++){
        const w=rand(7,9),h=rand(5,7),r=wallPocket94(w,h);if(!r)break;
        const nr=walledBox(state.map,r.x,r.y,r.w,r.h,TT.FLOOR),near=nearestOpen94(nr.cx,nr.cy,24);if(!near)continue;
        carveLine(state.map,nr.cx,nr.cy,near.x,near.y,TT.FLOOR,i===0&&globalThis.__MANRU_RANDOM57__()<.45?2:1);markOuterWall94(nr);state.rooms.push(roomRect(nr.x,nr.y,nr.w,nr.h));
        if(i===count-1||i===1){const t=[TT.CACHE,TT.RUMOR,TT.FOUNTAIN,TT.ARMORY][(f+i)%4];setTerrainTile58(state.map,nr.cx,nr.cy,t);state.itemBiasZones94.push({x:nr.x,y:nr.y,w:nr.w,h:nr.h,name:'외곽 별채'});}
        state.featureRooms.push({name:'외곽 좁은 별채',x:nr.x,y:nr.y,w:nr.w,h:nr.h,kind94:'outer'});
      }
    }
    if(f===6){
      const extras=[[Math.floor(COLS*.15),Math.floor(ROWS*.30)],[Math.floor(COLS*.83),Math.floor(ROWS*.32)],[Math.floor(COLS*.18),Math.floor(ROWS*.70)],[Math.floor(COLS*.80),Math.floor(ROWS*.72)]];
      for(let i=0;i<extras.length;i++){const [x,y]=extras[i];if(state.map[y]?.[x]!==TT.WATER)continue;const r=carveBlob(state.map,x,y,2+(i%2),2,TT.FLOOR);setTerrainTile58(state.map,r.cx,r.cy,i%2?TT.BRAZIER:TT.CACHE);state.featureRooms.push({name:'작은 수목섬',x:r.x,y:r.y,w:r.w,h:r.h});state.itemBiasZones94.push({x:r.x,y:r.y,w:r.w,h:r.h,name:'작은 수목섬'})}
    }
    if(f===11){
      // Carve several stone grottoes into the gorge walls, connected only to the nearest bank.
      for(const side of ['top','bottom'])for(let i=0;i<2;i++){
        const w=8,h=6,x=clamp(Math.floor(COLS*(.22+i*.42))-Math.floor(w/2),3,COLS-w-3),y=side==='top'?2:ROWS-h-2;let ok=true;for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)if(state.map[yy][xx]!==TT.WALL)ok=false;if(!ok)continue;
        const r=walledBox(state.map,x,y,w,h,TT.FLOOR),near=nearestOpen94(r.cx,r.cy,20);if(near)carveLine(state.map,r.cx,r.cy,near.x,near.y,TT.FLOOR,1);markOuterWall94(r);setTerrainTile58(state.map,r.cx,r.cy,i===1?TT.CACHE:TT.RUMOR);state.featureRooms.push({name:'회색돌 협곡굴',x:r.x,y:r.y,w:r.w,h:r.h});state.itemBiasZones94.push({x:r.x,y:r.y,w:r.w,h:r.h,name:'협곡굴'});
      }
    }
  }
  function qaWalkTo60(goal){
    if(!goal)return{ok:false,reason:'missing-goal'};let steps=0,blocked=null;
    while((state.player.x!==goal.x||state.player.y!==goal.y)&&steps<1200){
      const search=ReachabilityService.playerSearch(state.player,{ignoreOccupants:false,goal}),path=ReachabilityService.playerPath(search,goal);if(!path?.length){blocked={x:state.player.x,y:state.player.y,goal:{...goal}};break}
      const nx=path[0].x,ny=path[0].y,dx=nx-state.player.x,dy=ny-state.player.y,bx=state.player.x,by=state.player.y,res=ActionDispatcher.dispatch({type:'MOVE',args:[dx,dy]}).value;steps++;
      if(state.player.x===bx&&state.player.y===by){blocked={x:bx,y:by,next:{nx,ny},result:res};break}
    }
    return{ok:state.player.x===goal.x&&state.player.y===goal.y,steps,blocked,at:{x:state.player.x,y:state.player.y},goal:{...goal}};
  }
  function qaF24KeyGate60(){
    if(state.floor!==24)return{ok:false,reason:'not-f24'};closeGameplayInteractionState57();const q=state.floor24,key={...q.entranceKey},ringBefore=state.keyPlan96?.ring?.brass||0,walkKey=qaWalkTo60(key);
    if(!walkKey.ok)return{ok:false,stage:'walk-key',walkKey,ringBefore};const picked=state.map[key.y]?.[key.x]!==TT.KEY_TILE&&((state.keyPlan96?.ring?.brass||0)>ringBefore);
    const gate=(q.entranceGateCells||[])[1]||(q.entranceGateCells||[])[0],gateApproachReach=ReachabilityService.playerSearch(state.player,{ignoreOccupants:false}).cells,adj=[...DIRS8].map(([dx,dy])=>({x:gate.x-dx,y:gate.y-dy,dx,dy})).filter(a=>gateApproachReach.has(k(a.x,a.y))&&ReachabilityService.playerTerrainPassable(a.x,a.y)&&!(state.monsters||[]).some(m=>m.hp>0&&m.x===a.x&&m.y===a.y)).sort((a,b)=>Math.abs(a.x-state.player.x)+Math.abs(a.y-state.player.y)-Math.abs(b.x-state.player.x)-Math.abs(b.y-state.player.y))[0];
    if(!adj)return{ok:false,stage:'gate-adjacent',picked,gate};const walkGate=qaWalkTo60({x:adj.x,y:adj.y});if(!walkGate.ok)return{ok:false,stage:'walk-gate',picked,walkGate,gate};
    const beforeOpen=(q.entranceGateCells||[]).map(c=>state.map[c.y]?.[c.x]),bump=movePlayer(Math.sign(gate.x-state.player.x),Math.sign(gate.y-state.player.y)),afterOpen=(q.entranceGateCells||[]).map(c=>state.map[c.y]?.[c.x]),allOpen=afterOpen.every(t=>t===TT.OPEN_DOOR);
    return{ok:picked&&allOpen,picked,walkKey,walkGate,bump,beforeOpen,afterOpen,allOpen,ring:state.keyPlan96?.ring?.brass||0};
  }
  function qaView60(target,opts={}){
    if(!state)return false;closeGameplayInteractionState57();const savedMonsters=opts.cleanHostiles===true?state.monsters:null;if(savedMonsters)state.monsters=[];try{const p=target||state.player;if(p&&Number.isFinite(p.x)&&Number.isFinite(p.y)){
      let dest={x:p.x,y:p.y};if(!ReachabilityService.playerTerrainPassable(dest.x,dest.y)||OccupancyService.isOccupied(dest.x,dest.y)){let best=null;for(let r=1;r<=5&&!best;r++)for(let y=p.y-r;y<=p.y+r&&!best;y++)for(let x=p.x-r;x<=p.x+r;x++){if(Math.max(Math.abs(x-p.x),Math.abs(y-p.y))!==r||!ReachabilityService.playerTerrainPassable(x,y)||OccupancyService.isOccupied(x,y))continue;best={x,y};break}if(best)dest=best}
      state.player.x=dest.x;state.player.y=dest.y;OccupancyService.move(state.player,state.player.x,state.player.y)
    }
    resetVisualState();VisibilityService.compute();for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){VisibilityService.rememberKey(k(x,y));VisibilityService.addVisibleKey(k(x,y))}drawMap(true);return true}finally{if(savedMonsters)state.monsters=savedMonsters}
  }
  function rebuildSpecial60(f){
    const authored=[23,24].includes(f),savedMonsters=authored?[]:[...(state.monsters||[])],savedItems=[...(state.items||[])],boss=savedMonsters.find(m=>m.boss)||null;[COLS,ROWS]=SIZE60[f]||[COLS,ROWS];state.map=makeEmptyMap();state.rooms=[];state.decals=[];state.decor=[];state.rafts=[];state.routeTags=[];state.switches=[];state.vaults=[];state.featureRooms=[];state.guardRooms59=[];state.secretTreasure=null;state.specialFloor=true;state.fixedStart=null;state.fixedExit=null;state.visionPenalty=0;state.requiresBlink=false;initHidden60();state.floorSeed60=Math.floor(globalThis.__MANRU_RANDOM57__()*1000000);
    const builders={2:buildFloor2GreatHall,4:buildChoice,6:buildPavilion,8:buildBamboo,11:buildRiver,13:buildFloor13RoomMaze,16:buildFloor16Fortress,18:buildWarehouse,21:buildFloor21VoidSea,22:buildTemple,23:buildMercury,24:buildPeach};
    if(BOSS_FLOORS.has(f)){if(!boss)return;buildBossArena(f,state.map,boss)}else builders[f](state.map);
    if([4,6,8,13,22].includes(f))repairRequired60();
    if(!BOSS_FLOORS.has(f)&&![23,24].includes(f))enrichSpecial94(f);
    relocate60(savedMonsters,savedItems);if(authored)spawnAuthoredEncounters60();else{state._spawnV60=true;try{spawnLayoutExtras()}finally{state._spawnV60=false}}state._lastPlayerPos60={x:state.player.x,y:state.player.y};state.specialRevision60=4;state.seen=new Set();state.visible=new Set();VisibilityService.compute();vfBuildDecor();;
  }
  function addCrosslinks71(){
    const rooms=state.rooms||[];if(rooms.length<4)return 0;
    const pairs=[];for(let i=0;i<rooms.length;i++)for(let j=i+1;j<rooms.length;j++)pairs.push([roomDistance(rooms[i],rooms[j]),rooms[i],rooms[j]]);
    pairs.sort((a,b)=>b[0]-a[0]);let made=0,target=state.floor>=11?4:3;
    for(const [,a,b] of pairs){
      if(made>=target)break;
      if(roomHasEndpoint(a)&&roomHasEndpoint(b))continue;
      carveCorridorBetween({x:a.cx,y:a.cy},{x:b.cx,y:b.cy},made===0&&state.floor>=11?2:1,made%2===1);made++;
    }
    return made;
  }
  function styleInn71(r){
    addLandmark('등롱 연회축',r,'banquet');const cx=r.cx,cy=r.cy;
    for(let x=r.x+2;x<r.x+r.w-2;x++){if(Math.abs(x-cx)<=1||x%3===0)continue;if(canEdit(x,cy))setTerrainTile58(state.map,x,cy,TT.TABLE)}
    for(const [x,y] of [[r.x+2,r.y+2],[r.x+r.w-3,r.y+2],[r.x+2,r.y+r.h-3],[r.x+r.w-3,r.y+r.h-3]])if(canEdit(x,y))setTerrainTile58(state.map,x,y,TT.BRAZIER);
    for(let y=r.y+2;y<r.y+r.h-2;y+=3){if(canEdit(r.x+2,y))setTerrainTile58(state.map,r.x+2,y,TT.SCREEN);if(canEdit(r.x+r.w-3,y))setTerrainTile58(state.map,r.x+r.w-3,y,TT.SCREEN)}
  }
  function styleGarden71(r){
    addLandmark('비취 연못 중정',r,'pond');
    const rx=Math.max(2,Math.min(3,Math.floor((r.w-3)/2))),ry=Math.max(1,Math.min(2,Math.floor((r.h-3)/2)));
    for(let y=r.cy-ry;y<=r.cy+ry;y++)for(let x=r.cx-rx;x<=r.cx+rx;x++)if(canEdit(x,y)&&!(Math.abs(x-r.cx)===rx&&Math.abs(y-r.cy)===ry))setTerrainTile58(state.map,x,y,TT.WATER);
    for(let x=r.cx-rx;x<=r.cx+rx;x++)if(!isImportantCell(x,r.cy))setTerrainTile58(state.map,x,r.cy,TT.PAPER_BRIDGE);
    for(const [x,y] of [[r.x+2,r.y+2],[r.x+r.w-3,r.y+2],[r.x+2,r.y+r.h-3],[r.x+r.w-3,r.y+r.h-3]])if(canEdit(x,y))setTerrainTile58(state.map,x,y,globalThis.__MANRU_RANDOM57__()<.55?TT.BAMBOO:TT.HEDGE);
    if(canEdit(r.cx,r.y+2))setTerrainTile58(state.map,r.cx,r.y+2,TT.PAVILION);
  }
  function styleInner71(r){
    addLandmark('천면경 분기회랑',r,'mirror');
    for(let y=r.y+2;y<r.y+r.h-2;y+=2)for(const x of [r.x+2,r.x+r.w-3])if(canEdit(x,y))setTerrainTile58(state.map,x,y,TT.MIRROR);
    for(let x=r.x+2;x<r.x+r.w-2;x++){if(Math.abs(x-r.cx)<=1)continue;if(canEdit(x,r.cy))setTerrainTile58(state.map,x,r.cy,x%3===0?TT.SCREEN:TT.FLOOR)}
    for(const [dx,dy] of [[-2,-2],[2,-2],[-2,2],[2,2]])if(canEdit(r.cx+dx,r.cy+dy))setTerrainTile58(state.map,r.cx+dx,r.cy+dy,TT.SNARE);
    const side=globalThis.__MANRU_RANDOM57__()<.5?{x:r.x,y:r.cy}:{x:r.x+r.w-1,y:r.cy};
    if(state.map[side.y]?.[side.x]===TT.WALL&&!isImportantCell(side.x,side.y))setTerrainTile58(state.map,side.x,side.y,globalThis.__MANRU_RANDOM57__()<.55?TT.FAKE_DOOR:TT.SECRET_DOOR);
  }
  function styleStorage71(r){
    addLandmark('철제 적재 구획',r,'storage');
    for(let y=r.y+2;y<r.y+r.h-2;y+=2)for(let x=r.x+2;x<r.x+r.w-2;x+=3){
      if(Math.abs(x-r.cx)<=1&&Math.abs(y-r.cy)<=1)continue;
      if(canEdit(x,y))setTerrainTile58(state.map,x,y,(x+y)%2?TT.JAR:TT.TABLE);
    }
    for(let y=r.y+1;y<r.y+r.h-1;y++)if(y!==r.cy&&canEdit(r.cx,y))setTerrainTile58(state.map,r.cx,y,TT.FLOOR);
    for(const x of [r.cx-2,r.cx+2])if(canEdit(x,r.cy))setTerrainTile58(state.map,x,r.cy,TT.BRAZIER);
  }
  function styleHeart71(r){
    addLandmark('보주 의식 감실',r,'ritual');
    for(let y=r.cy-2;y<=r.cy+2;y++)for(let x=r.cx-3;x<=r.cx+3;x++)if((Math.abs(x-r.cx)===3||Math.abs(y-r.cy)===2)&&canEdit(x,y))setTerrainTile58(state.map,x,y,TT.GOLD);
    if(canEdit(r.cx,r.cy))setTerrainTile58(state.map,r.cx,r.cy,TT.ALTAR);
    for(const [dx,dy,t] of [[-2,0,TT.VOID],[2,0,TT.MERCURY],[0,-2,TT.VOID],[0,2,TT.MERCURY]])if(canEdit(r.cx+dx,r.cy+dy))setTerrainTile58(state.map,r.cx+dx,r.cy+dy,t);
    for(const [x,y] of [[r.cx-1,r.cy],[r.cx+1,r.cy],[r.cx,r.cy-1],[r.cx,r.cy+1]])if(!isImportantCell(x,y))setTerrainTile58(state.map,x,y,TT.DRAWBRIDGE_DOWN);
  }
  function styleAnnex71(r,z,secret){
    if(!r)return;addLandmark(secret?'숨은 부속실':'측면 부속실',r,secret?'secret':'annex');
    const core=z===0?TT.CACHE:z===1?TT.FOUNTAIN:z===2?TT.RUMOR:z===3?TT.ARMORY:TT.VAULT;
    if(canEdit(r.cx,r.cy,[TT.FLOOR]))setTerrainTile58(state.map,r.cx,r.cy,core);
    const obstacle=z===0?TT.SCREEN:z===1?TT.BAMBOO:z===2?TT.MIRROR:z===3?TT.JAR:TT.GOLD;
    for(const [dx,dy]of[[-2,-1],[2,-1],[-2,1],[2,1]])if(canEdit(r.cx+dx,r.cy+dy,[TT.FLOOR]))setTerrainTile58(state.map,r.cx+dx,r.cy+dy,obstacle);
  }
  function enhanceNormal71(){
    if(!NORMAL71.has(state.floor)||state.specialFloor||state.monsters?.some(m=>m.boss))return;
    state.landmarks71=[];state.landmarkCells71={};const z=regionIndex(),used=new Set();
    for(let n=0;n<2;n++){
      const r=chooseRoom71(8,n?6:7,used);if(!r)continue;
      if(z===0)styleInn71(r);else if(z===1)styleGarden71(r);else if(z===2)styleInner71(r);else if(z===3)styleStorage71(r);else styleHeart71(r);
    }
    const cross=addCrosslinks71(),annex=carveAnnex(false),micro=carveMicro(z),secret=(state.floor>=7&&globalThis.__MANRU_RANDOM57__()<.78)?carveAnnex(true):null;
    styleAnnex71(annex,z,false);styleAnnex71(secret,z,true);ensureNormalConnectivity();
    const lm=(state.landmarks71||[]).filter(v=>v.r),enemies=(state.monsters||[]).filter(m=>!m.boss&&!m.fixed&&!m.aquatic&&!m.flying);let moved=0;
    for(const l of lm.slice(0,3)){
      if(moved>=enemies.length)break;const m=enemies[moved],r=l.r;let q=null;
      for(let t=0;t<28;t++){const p={x:rand(r.x+1,r.x+r.w-2),y:rand(r.y+1,r.y+r.h-2)};if(PlacementService.monsterCanStand(m,p.x,p.y)){q=p;break}}
      if(q){m.x=q.x;m.y=q.y;moved++}
    }
    state.regionComplex71={crosslinks:cross,annexes:(annex?1:0)+(micro?1:0)+(secret?1:0),landmarks:state.landmarks71?.length||0};
    state.layoutName+=` · ${choice(['다층 동선','숨은 측랑','랜드마크군','복합 구획'])}`;
  }
  function enhanceSpecial71(){
    if(!state?.specialFloor||state.monsters?.some(m=>m.boss))return;
    const f=state.floor,rooms=[...(state.rooms||[])].filter(r=>r.w>=8&&r.h>=7&&!roomHasEndpoint(r));
    if(f===22){
      for(const r of rooms.slice(0,8)){
        addLandmark('금동 기둥 감실',r,'ritual');
        const pts=[[r.cx-2,r.cy-2],[r.cx+2,r.cy-2],[r.cx-2,r.cy+2],[r.cx+2,r.cy+2]];
        for(const [x,y] of pts)if(canEdit(x,y,[TT.FLOOR]))setTerrainTile58(state.map,x,y,TT.WALL);
        if(canEdit(r.cx,r.cy,[TT.FLOOR]))setTerrainTile58(state.map,r.cx,r.cy,globalThis.__MANRU_RANDOM57__()<.5?TT.ALTAR:TT.GOLD);
        for(const [x,y] of [[r.cx,r.y+2],[r.cx,r.y+r.h-3]])if(canEdit(x,y,[TT.FLOOR]))setTerrainTile58(state.map,x,y,TT.BRAZIER);
      }
    }else if(f===16){
      for(const r of rooms.slice(0,6)){
        for(const [x,y] of [[r.cx-2,r.cy],[r.cx+2,r.cy]])if(canEdit(x,y,[TT.FLOOR,TT.GRASS]))setTerrainTile58(state.map,x,y,TT.WALL);
        if(canEdit(r.cx,r.cy,[TT.FLOOR]))setTerrainTile58(state.map,r.cx,r.cy,TT.ARMORY);
      }
    }else if(f===18){
      for(const r of rooms.slice(0,6)){
        for(let y=r.y+2;y<r.y+r.h-2;y+=2)for(const x of [r.x+2,r.x+r.w-3])if(canEdit(x,y,[TT.FLOOR]))setTerrainTile58(state.map,x,y,TT.JAR);
      }
    }else if(f===2){
      for(const r of rooms.slice(0,5)){
        for(let x=r.x+2;x<r.x+r.w-2;x+=3)if(canEdit(x,r.cy,[TT.FLOOR]))setTerrainTile58(state.map,x,r.cy,TT.TABLE);
        if(canEdit(r.cx,r.y+2,[TT.FLOOR]))setTerrainTile58(state.map,r.cx,r.y+2,TT.BRAZIER);
      }
    }else if(f===6){
      for(const r of rooms.slice(0,8))if(canEdit(r.cx,r.cy,[TT.FLOOR]))setTerrainTile58(state.map,r.cx,r.cy,TT.PAVILION);
    }else if(f===11||f===13){
      for(const r of rooms.slice(0,7)){
        for(const [x,y] of [[r.x+2,r.cy],[r.x+r.w-3,r.cy]])if(canEdit(x,y,[TT.FLOOR]))setTerrainTile58(state.map,x,y,TT.SCREEN);
        if(canEdit(r.cx,r.cy,[TT.FLOOR]))setTerrainTile58(state.map,r.cx,r.cy,TT.MIRROR);
      }
    }else if(f===21||f===23){
      for(const r of rooms.slice(0,10)){
        if(canEdit(r.cx,r.cy,[TT.FLOOR]))setTerrainTile58(state.map,r.cx,r.cy,globalThis.__MANRU_RANDOM57__()<.6?TT.GOLD:TT.ALTAR);
      }
    }else if(f===24){
      for(const r of rooms.slice(0,8)){
        for(const [x,y] of [[r.x+2,r.y+2],[r.x+r.w-3,r.y+r.h-3]])if(canEdit(x,y,[TT.FLOOR,TT.GRASS,TT.LIGHT_GRASS]))setTerrainTile58(state.map,x,y,peachTerrain());
      }
    }
  }
  /* Final integrity pass: later visual/layout passes may occasionally invalidate a spawn tile. */
  const Integrity81={
    nearSpot(x,y,{forStairs=false}={}){
      for(let r=0;r<Math.max(COLS,ROWS);r++){
        const spots=[];
        for(let yy=Math.max(1,y-r);yy<=Math.min(ROWS-2,y+r);yy++)for(let xx=Math.max(1,x-r);xx<=Math.min(COLS-2,x+r);xx++){
          if(Math.abs(xx-x)+Math.abs(yy-y)>r||!ReachabilityService.playerPassable(xx,yy)||OccupancyService.isOccupied(xx,yy))continue;
          if(forStairs&&((xx===state.player.x&&yy===state.player.y)||(state.items||[]).some(i=>i.x===xx&&i.y===yy)))continue;
          if(state.map[yy][xx]===TT.STAIR&&!forStairs)continue;
          spots.push({x:xx,y:yy});
        }
        if(spots.length)return choice(spots);
      }
      return null;
    },
    itemSpot(used){
      const spots=[];
      for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++){
        const q=k(x,y);if(used.has(q)||!ReachabilityService.playerPassable(x,y)||OccupancyService.isOccupied(x,y)||state.map[y][x]===TT.STAIR||(x===state.player.x&&y===state.player.y))continue;
        spots.push({x,y});
      }
      return spots.length?choice(spots):null;
    },
    repair(){
      if(!state)return{player:0,stairs:0,monsters:0,items:0,removed:0};
      let player=0,stairs=0,monsters=0,items=0,removed=0;
      const p=state.player;
      if(p&&(p.x<1||p.y<1||p.x>=COLS-1||p.y>=ROWS-1||tileBlocks(state.map[p.y]?.[p.x]))){const q=this.nearSpot(Math.min(COLS-2,Math.max(1,p.x||1)),Math.min(ROWS-2,Math.max(1,p.y||1)));if(q){p.x=q.x;p.y=q.y;player=1}}
      const st=state.stairs;
      if(st&&(st.x<1||st.y<1||st.x>=COLS-1||st.y>=ROWS-1||tileBlocks(state.map[st.y]?.[st.x]))){
        const ox=st.x,oy=st.y,q=this.nearSpot(Math.min(COLS-2,Math.max(1,st.x||1)),Math.min(ROWS-2,Math.max(1,st.y||1)),{forStairs:true});
        if(q){if(oy>=0&&ox>=0&&oy<ROWS&&ox<COLS&&state.map[oy][ox]===TT.STAIR)setTerrainTile58(state.map,ox,oy,TT.FLOOR);state.stairs={x:q.x,y:q.y};setTerrainTile58(state.map,q.x,q.y,TT.STAIR);stairs=1}
      }
      const live=[];
      for(const m of state.monsters||[]){
        const invalid=m.x<1||m.y<1||m.x>=COLS-1||m.y>=ROWS-1||!PlacementService.monsterCanStand(m,m.x,m.y);
        if(invalid){const p=typeof PlacementService.randomMonsterCell==='function'?PlacementService.randomMonsterCell(m):null;if(p){m.x=p.x;m.y=p.y;monsters++}else{removed++;continue}}
        live.push(m);
      }
      state.monsters=live;
      const used=new Set();
      for(const it of state.items||[]){
        const q=k(it.x,it.y),invalid=it.x<1||it.y<1||it.x>=COLS-1||it.y>=ROWS-1||tileBlocks(state.map[it.y]?.[it.x])||used.has(q);
        if(invalid){const p=this.itemSpot(used);if(p){it.x=p.x;it.y=p.y;items++}}
        used.add(k(it.x,it.y));
      }
      state.integrity81={player,stairs,monsters,items,removed};
      state.repairedMonsters70=(state.repairedMonsters70||0)+monsters;
      return state.integrity81;
    }
  };
  function stairPath88(m,a,b){let x=a.x,y=a.y,guard=0,flip=globalThis.__MANRU_RANDOM57__()<.5;corridorCell(m,x,y);while((x!==b.x||y!==b.y)&&guard++<600){const cx=x!==b.x,cy=y!==b.y;if(cx&&cy){if(flip)x+=Math.sign(b.x-x);else y+=Math.sign(b.y-y);flip=!flip}else if(cx)x+=Math.sign(b.x-x);else y+=Math.sign(b.y-y);corridorCell(m,x,y)}}
  function feature89(name,r,kind='architecture'){
    state.featureRooms=state.featureRooms||[];state.featureRooms.push({name,x:r.x,y:r.y,w:r.w,h:r.h,kind89:kind});
  }
  function finishArchitecture90(){
    if(!state)return;if(state.specialFloor)return finishSpecialArchitecture88();if(!NORMAL85.has(state.floor))return;
    const savedMonsters=[...(state.monsters||[])],savedItems=[...(state.items||[])],z=regionIndex();
    state.map=makeEmptyMap();state.rooms=[];state.featureRooms=[];state.routeTags=[];state.vaults=[];state.landmarks71=[];state.landmarkCells71={};state.regionComplex71=null;state.guardRooms59=[];state.decor=[];state.fixedStart=null;state.fixedExit=null;
    buildNormal(state.map,z);chooseEnds();purposeRooms90(z);fillUnused90(z);ensureNormalConnectivity();normalizeDoors86();relocateEntities89(savedMonsters,savedItems);guardPurposes90();themeDecor88(z);autoWindows86();
    ensureNormalConnectivity();normalizeDoors86();sanitizeWindows88();if(window.__MANRU_RUNTIME81__?.Integrity81)window.__MANRU_RUNTIME81__.Integrity81.repair();VisibilityService.compute();vfBuildDecor();state.decor=[];harmonizeDecor86();
  }
  function graphOrganic93(m,z,options=null){
    reset93(m);const profile=options?.id||chooseProfile93(),rooms=placeRooms93(m,z,options);if(rooms.length<2){organic91(m,z);state.layoutMode85='v93-fallback';return}
    const edges=options?profileLinks105(m,rooms,options):mst93(m,rooms),treeAdj=graphAdj93(rooms.length,edges),diam=diameter93(treeAdj);if(!options)localLoops93(m,rooms,edges,profile);
    const mainPath=diam.path,mainSet=new Set(mainPath);let bi=ReachabilityService.roomBranches({graphAdj93},rooms,edges,mainPath);
    for(let guard=0;!options&&guard<3;guard++){const deep=[...bi.off].sort((a,b)=>b.d-a.d)[0];if(!deep||deep.d<=2)break;const adj=graphAdj93(rooms.length,edges),p=shortestNodes93(adj,deep.root,deep.i);if(p.length<4)break;const bridgeNode=p[p.length-2];if(!addEdge93(m,rooms,edges,deep.root,bridgeNode,globalThis.__MANRU_RANDOM57__()<.5?'L':'Z','branch-loop'))break;bi=ReachabilityService.roomBranches({graphAdj93},rooms,edges,mainPath)}
    if(!options)softenRooms93(m,rooms,edges);
    state.mainPathRooms92=mainPath.map(i=>rooms[i]);state.branchRooms92=bi.off.map(x=>({...rooms[x.i],branchDepth92:x.d,node92:x.i}));state.branchLeaves92=bi.leaves.map(x=>({...rooms[x.i],branchDepth92:x.d,node92:x.i}));
    state.roomGraph92={profile,edges:edges.map(e=>({...e})),mainPath:[...mainPath],branchDepths:bi.off.map(x=>x.d),loops:edges.filter(e=>e.kind==='loop').length};
    state.roomGraph93={profile,edges:edges.map(e=>({...e})),mainPath:[...mainPath],branchDepths:bi.off.map(x=>x.d),loops:edges.filter(e=>e.kind==='loop').length,wideHalls:edges.filter(e=>(e.width||1)>1).length};
    setFixedEnds({x:rooms[diam.a].cx,y:rooms[diam.a].cy},{x:rooms[diam.b].cx,y:rooms[diam.b].cy});
    if(options){state.layoutMode85='v93-'+options.id;return{rooms,edges,diam};}
    rareTemplate93(m,rooms);
    applyModules(m,rooms);outerChain94(m,z);if(state.floor===1)buildTutorialEntry(m,rooms);
    if(!state.grandRoom89){const large=[...rooms].sort((a,b)=>b.w*b.h-a.w*a.h)[0];if(large&&large.w*large.h>=84&&globalThis.__MANRU_RANDOM57__()<.38){large.grand90=true;state.grandRoom89=large}}
    if(state.grandRoom89)feature89('대실',state.grandRoom89,'grand');
    state.focalRooms89=state.branchLeaves92.slice(0,2);state.layoutMode85=`v93-${profile}`;state.layoutName=`비대칭 객실군 · ${profile==='braid'?'근거리 엮임':profile==='offset-halls'?'편심 회랑축':'군집 순환'} / 가변 회랑폭 · 짧은 곁가지`;
  }
  function zoneCells94(r){const out=[];if(!r)return out;for(let y=Math.max(1,r.y+1);y<Math.min(ROWS-1,r.y+r.h-1);y++)for(let x=Math.max(1,r.x+1);x<Math.min(COLS-1,r.x+r.w-1);x++)if(ReachabilityService.playerPassable(x,y)&&state.map[y][x]!==TT.STAIR&&!OccupancyService.isOccupied(x,y)&&(x!==state.player.x||y!==state.player.y))out.push({x,y});return out}
  // Complete lock-surface audit: every final KEY_TILE / LOCKED_GATE must be owned by the typed plan or the single legacy 6F archive lock.
  function lockSurfaceAudit96(){
    if(!state?.map)return null;
    const mapKeys=[],mapGates=[];for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++){const t=state.map[y][x];if(t===TT.KEY_TILE)mapKeys.push({x,y});else if(t===TT.LOCKED_GATE)mapGates.push({x,y})}
    const plan=state.keyPlan96,expected=expectedLockCount(),activePlanKeys=(plan?.keys||[]).filter(q=>q.active!==false),closedPlanDoors=(plan?.doors||[]).filter(d=>d.open!==true);
    const keySet=new Set(activePlanKeys.map(q=>key85(q.x,q.y))),gateSet=new Set(closedPlanDoors.map(d=>key85(d.x,d.y)));
    const legacyKeys=[],legacyGates=[];
    if(state.floor===6&&state.f6LibraryKeyR8&&state.map?.[state.f6LibraryKeyR8.y]?.[state.f6LibraryKeyR8.x]===TT.KEY_TILE)legacyKeys.push({...state.f6LibraryKeyR8});
    if(state.floor===6&&state.f6LibraryGateR8&&state.map?.[state.f6LibraryGateR8.y]?.[state.f6LibraryGateR8.x]===TT.LOCKED_GATE)legacyGates.push({...state.f6LibraryGateR8});
    const legacyKeySet=new Set(legacyKeys.map(q=>key85(q.x,q.y))),legacyGateSet=new Set(legacyGates.map(q=>key85(q.x,q.y)));
    const orphanKeys=mapKeys.filter(q=>!keySet.has(key85(q.x,q.y))&&!legacyKeySet.has(key85(q.x,q.y)));
    const orphanGates=mapGates.filter(q=>!gateSet.has(key85(q.x,q.y))&&!legacyGateSet.has(key85(q.x,q.y)));
    const missingPlanKeys=activePlanKeys.filter(q=>state.map?.[q.y]?.[q.x]!==TT.KEY_TILE);
    const missingPlanGates=closedPlanDoors.filter(d=>state.map?.[d.y]?.[d.x]!==TT.LOCKED_GATE);
    const legacyExpected=state.floor===6,legacyHave=state.floorKeys||0,legacyRequired=state.floorKeysRequired||0,legacyGateClosed=legacyGates.length>0;
    const legacyKeyShouldExist=legacyExpected&&legacyGateClosed&&legacyHave<Math.max(1,legacyRequired),legacyGateShouldExist=legacyExpected&&state.f6LibraryGateR8&&state.map?.[state.f6LibraryGateR8.y]?.[state.f6LibraryGateR8.x]===TT.LOCKED_GATE;
    const legacyOk=!legacyExpected||(legacyRequired>=1&&legacyKeys.length===(legacyKeyShouldExist?1:0)&&legacyGates.length===(legacyGateShouldExist?1:0)&&(!legacyGateClosed||legacyHave>=1||legacyKeys.length===1));
    const typedOk=!plan||(missingPlanKeys.length===0&&missingPlanGates.length===0),countMatch=expected?!!plan&&plan.groups?.length===expected&&plan.keys?.length===expected:!plan||!(plan.groups?.length);
    const ok=orphanKeys.length===0&&orphanGates.length===0&&typedOk&&legacyOk&&countMatch;
    return{floor:state.floor,expected,mapKeys:mapKeys.length,mapGates:mapGates.length,typed:!!plan,typedGroups:plan?.groups?.length||0,typedKeys:activePlanKeys.length,typedGates:closedPlanDoors.length,countMatch,legacyKeys:legacyKeys.length,legacyGates:legacyGates.length,orphanKeys,orphanGates,missingPlanKeys,missingPlanGates,legacyOk,typedOk,ok};
  }
  const isBow967=()=>state?.player?.weapon?.kind==='bow';
  function safeSet972(x,y,t){
    if(!(x>0&&y>0&&x<COLS-1&&y<ROWS-1)) return false;
    const old=state.map[y]?.[x];
    if([TT.STAIR,TT.LOCKED_GATE,TT.KEY_TILE,TT.SECRET_DOOR,TT.DOOR,TT.OPEN_DOOR].includes(old)) return false;
    if(!isGroundTile(old) || !isQuietCell(x,y)) return false;
    setTerrainTile58(state.map,x,y,t);
    return true;
  }
/* ===== MANRU v9.8.0: RESEARCHED REGION ARCHITECTURE / VAULT MODULES / FULL-MAP QA ===== */
const V980={
    version:'v9.8.1-fixed-map-portal-reachability',
    normalFloors:new Set([7,9,12,14,17,19]),
    specialFloors:new Set([6,8,10,11,13,15,16,18,20,21,22,23,24,25]),
    modules:[],
    errors:[]
  };
  const in980=(x,y)=>x>0&&y>0&&x<COLS-1&&y<ROWS-1;
  const key980=(x,y)=>`${x},${y}`;
  const region980=()=>Math.max(0,Math.min(4,regionIndex()));
  const hash980=(x,y,s=0)=>hash2(x,y,98000+s+(state?.floor||1)*131);
  function planned980(t){return plannedSet980.has(t)||!tileBlocks(t)}
  function lockAuditOkay980(){
    if(!REQUIRED_LOCKS.has(state?.floor))return true;
    const plan=state?.keyPlan96;if(!plan)return false;
    try{const a=lockAudit96();return a?!!a.ok:false}catch(_){return false}
  }
  function expectedBlink981(f=state?.floor||1){return f<=5?0:f<=15?2:f<=20?3:4}
  function tileReveal981(x,y,opt={}){
    let t=state.map[y]?.[x];
    if(t===TT.HIDDEN_BRIDGE)t=state.hiddenReplacement60?.[key980(x,y)]??TT.PAPER_BRIDGE;
    else if(t===TT.HIDDEN_WALL)t=state.hiddenReplacement60?.[key980(x,y)]??TT.FLOOR;
    if(opt.unlock&&t===TT.LOCKED_GATE)t=TT.OPEN_DOOR;
    if(opt.unlock&&t===TT.DRAWBRIDGE_UP)t=TT.DRAWBRIDGE_DOWN;
    return t;
  }
  function reachPass981(x,y,opt={}){return in980(x,y)&&ReachabilityService.playerTerrainPassable(x,y,{...opt,tileAt:(x,y)=>tileReveal981(x,y,opt)})}
  function blinkBlock981(t,opt={}){
    if(opt.unlock&&t===TT.LOCKED_GATE)return false;
    if(opt.unlock&&t===TT.DRAWBRIDGE_UP)return false;
    if(t===TT.HIDDEN_BRIDGE)return false;
    if(t===TT.HIDDEN_WALL)return false;
    return blinkHardBlock(t);
  }
  function raftDockPairs981(opt={}){
    const out=[];
    for(const r of state?.rafts||[]){
      if(!Number.isInteger(r.min)||!Number.isInteger(r.max)||r.min>=r.max||r.y<r.min||r.y>r.max)continue;
      let clear=true;for(let y=r.min;y<=r.max;y++)if(!in980(r.x,y)||![TT.WATER,TT.RAFT].includes(state.map[y][r.x])){clear=false;break}
      if(!clear)continue;
      const docks=new Map();for(let y=r.min;y<=r.max;y++)for(const[dx,dy]of DIRS8){
        const x=r.x+dx,yy=y+dy;if(x===r.x&&yy>=r.min&&yy<=r.max)continue;
        if(ReachabilityService.playerStepAllowed({x:r.x,y},x,yy,{...opt,tileAt:(x,y)=>tileReveal981(x,y,opt),excludeRafts:true}))docks.set(key980(x,yy),{x,y:yy});
      }
      const stops=[...docks.values()];if(stops.length)out.push({raft:r,A:[{x:r.x,y:r.y},...stops],B:stops});
    }
    return out;
  }
  function raftAudit981(){
    const tracks=new Set(raftDockPairs981({unlock:true}).map(p=>p.raft)),entries=[];for(const r of state?.rafts||[]){entries.push({track:tracks.has(r),x:r.x,min:r.min,max:r.max,y:r.y,current:state.map[r.y]?.[r.x]===TT.RAFT,top:reachPass981(r.x,r.min-1,{unlock:true}),bottom:reachPass981(r.x,r.max+1,{unlock:true})})}
    const walk=ReachabilityService.mechanicalReach({expectedBlink981,key980,reachPass981,raftDockPairs981,tileReveal981,blinkBlock981,in980},{unlock:true,rafts:false,blinkRange:0}),pureRaft=ReachabilityService.mechanicalReach({expectedBlink981,key980,reachPass981,raftDockPairs981,tileReveal981,blinkBlock981,in980},{unlock:true,rafts:true,blinkRange:0}),withRaft=ReachabilityService.mechanicalReach({expectedBlink981,key980,reachPass981,raftDockPairs981,tileReveal981,blinkBlock981,in980},{unlock:true,rafts:true,blinkRange:2}),without=ReachabilityService.mechanicalReach({expectedBlink981,key980,reachPass981,raftDockPairs981,tileReveal981,blinkBlock981,in980},{unlock:true,rafts:false,blinkRange:2});return{valid:entries.length>0&&entries.every(e=>e.track&&e.current&&e.top&&e.bottom&&e.min<e.max),entries,pureWalk:walk.exit,pureRaft:pureRaft.exit,exitWithRaft:withRaft.exit,exitBlinkFallback:without.exit,main:state.raftMain981||null,fallback:state.raftFallback981||null};
  }
  function portalAudit981(){
    if(state?.floor!==13)return null;const counts=Array(state.portalRooms981?.length||0).fill(0),monsterCounts=Array(state.portalRooms981?.length||0).fill(0),bad=[];for(const [k,v]of Object.entries(state.portalLinks981||{})){counts[v.room]=(counts[v.room]||0)+1;const reciprocal=state.portalLinks981[key980(v.destPortal.x,v.destPortal.y)];if(!reciprocal||reciprocal.destRoom!==v.room)bad.push(k)}for(const m of state.monsters||[]){if(m.hp<=0)continue;const rid=(state.portalRooms981||[]).findIndex(r=>m.x>=r.x&&m.x<r.x+r.w&&m.y>=r.y&&m.y<r.y+r.h);if(rid>=0)monsterCounts[rid]++}const reach=ReachabilityService.mechanicalReach({expectedBlink981,key980,reachPass981,raftDockPairs981,tileReveal981,blinkBlock981,in980},{unlock:true,rafts:true,portals:true,blinkRange:2}),allRooms=(state.portalRooms981||[]).every(r=>(r.cells981||[]).some(p=>reach.cells.has(key980(p.x,p.y))));return{rooms:counts.length,portals:Object.keys(state.portalLinks981||{}).length,counts,min:counts.length?Math.min(...counts):0,max:counts.length?Math.max(...counts):0,monsterCounts,maxMonsterRoom:monsterCounts.length?Math.max(...monsterCounts):0,overcrowded:monsterCounts.map((n,i)=>({room:i,count:n})).filter(x=>x.count>3),reciprocalBad:bad.length,allRooms,exit:reach.exit,itemsUnreachable:(state.items||[]).filter(i=>!reach.cells.has(key980(i.x,i.y))).length}}
  function itemReachAudit981(){const reach=state.floor===21?ReachabilityService.mechanicalBlinkReach({expectedBlink981,key980,floor21Stand981,raftDockPairs981,tileReveal981,blinkBlock981,in980},{unlock:true,rafts:true,portals:true,blinkRange:4}):ReachabilityService.mechanicalReach({expectedBlink981,key980,reachPass981,raftDockPairs981,tileReveal981,blinkBlock981,in980},{unlock:true,rafts:true,portals:true});return{floor:state.floor,range:reach.range,exit:reach.exit,total:(state.items||[]).length,unreachable:(state.items||[]).filter(i=>!reach.cells.has(key980(i.x,i.y))).map(i=>({name:i.name,x:i.x,y:i.y}))}}
  function mechanicalReachAudit(){const r=state.floor===21?ReachabilityService.mechanicalBlinkReach({expectedBlink981,key980,floor21Stand981,raftDockPairs981,tileReveal981,blinkBlock981,in980},{unlock:true,rafts:true,portals:true,blinkRange:4}):ReachabilityService.mechanicalReach({expectedBlink981,key980,reachPass981,raftDockPairs981,tileReveal981,blinkBlock981,in980},{unlock:true,rafts:true,portals:true});return{floor:state.floor,layout:state.layoutName,reach:r.exit,reachStates:r.stateCount||null,items:itemReachAudit981(),raft:state.floor===11?raftAudit981():null,portal:state.floor===13?portalAudit981():null,floor21BlinkChoice:state.floor===21?state.floor21BlinkAuditR43:null,generationAttempts:state.generationFinalKeyAttemptsR48||null,rejected:(state.generationRejected51||[]).length,repairs:[...V981.repairs],errors:[...V981.errors]}}
function blinkChoiceReach(opt={}){const r=ReachabilityService.mechanicalBlinkReach({expectedBlink981,key980,floor21Stand981,raftDockPairs981,tileReveal981,blinkBlock981,in980},{...opt,blinkRange:opt.blinkRange??4});return{exit:r.exit,count:r.count,stateCount:r.stateCount,range:r.range,mode:r.mode}}
function safeLandFor1005(e,x,y){
  if(x<1||y<1||x>=COLS-1||y>=ROWS-1)return false;
  const t=state.map[y][x];if(hazardTile(t)||t===TT.DRAWBRIDGE_UP||t===TT.CRUMBLE)return false;
  if(entityIsPlayer(e))return !tileBlocks(t)&&!OccupancyService.isOccupied(x,y);
  if(e?.footprint){
    if(!PlacementService.monsterCanStand(e,x,y))return false;
    for(const[ox,oy]of footprintOffsets(e)){const tt=state.map[y+oy]?.[x+ox];if(hazardTile(tt)||tt===TT.CRUMBLE)return false}
    return true
  }
  return !tileBlocks(t)&&!OccupancyService.isOccupied(x,y,e)&&(x!==state.player.x||y!==state.player.y)
}
function routeMetric(){const t=missionTarget(),len=ReachabilityService.hazardPathLength(t),man=t?Math.abs(t.x-state.player.x)+Math.abs(t.y-state.player.y):0;return{floor:state.floor,target:t?{x:t.x,y:t.y,name:t.name||'stairs'}:null,path:len,manhattan:man,ratio:len&&man?+(len/man).toFixed(2):null,design:state.routeDesign1005||null}}
function pass1020(t){return !tileBlocks(t)&&!HAZ1020().has(t)}
/* F08: append one actual house, not a highlighted answer path. One gate -> 2-wide hall -> many side rooms, each with exterior windows. */
function walkPath(){const p=ReachabilityService.playerPath(ReachabilityService.playerSearch(state.player),state.stairs);return p?[{x:state.player.x,y:state.player.y},...p]:[]}
function restoreEntities1020(saved){
  state.items=[];state.monsters=[];const reach=reachableSet1020({unlock:true,openBoss:true});
  const safeReach=p=>reach.has(K1020(p.x,p.y));
  // F22: deliberately distribute payload across both halves instead of leaving the new lower maze empty.
  const f22Cells=[];if(state.floor===22){for(const kk of reach){const [x,y]=kk.split(',').map(Number);if(y>3&&safeFloorTile1020(state.map[y][x]))f22Cells.push({x,y})}f22Cells.sort((a,b)=>a.y-b.y||a.x-b.x)}
  saved.items.forEach((it,i)=>{let target={x:it.x,y:it.y};if(state.floor===22&&f22Cells.length)target=f22Cells[Math.floor((i+1)*f22Cells.length/(saved.items.length+1))]||target;if(!candidateFinal1020(target.x,target.y,null)||!safeReach(target))target=ReachabilityService.finalPlacementCell({clamp1020,K1020,candidateFinal1020,inside1020},target.x,target.y,null,safeReach);it.x=target.x;it.y=target.y;PlacementService.placeItem(it)});
  saved.monsters.forEach((m,i)=>{let target={x:m.x,y:m.y};if(m.boss&&[5,15,20].includes(state.floor)){const cx=Math.floor(COLS/2),by=4,bh=12;target={x:cx,y:by+Math.floor(bh*.58)}}else if(state.floor===22&&f22Cells.length)target=f22Cells[Math.floor((i+.5)*f22Cells.length/Math.max(1,saved.monsters.length))]||target;if(!candidateFinal1020(target.x,target.y,m)||!safeReach(target))target=ReachabilityService.finalPlacementCell({clamp1020,K1020,candidateFinal1020,inside1020},target.x,target.y,m,safeReach);m.x=target.x;m.y=target.y;OccupancyService.addMonster(m)});
}
function finalReachSet1029(){
  const r=reachableCells({unlock:true,openBoss:true,rafts:true,portals:true,diagonal:true,blinkRange:Math.max(0,state.player?.blinkLevel||0)});
  return r instanceof Set?r:reachableSet1020({unlock:true,openBoss:true,diagonal:true});
}
function budgetPeaches52(){
 if(state.artifactDungeon46||state.floor<6||state.floor>10)return;
 const budget=state.peachGeneration53||(state.peachGeneration53={limit:1+(globalThis.__MANRU_RANDOM57__()<.35?1:0),reserved:0});
 let trees=0,items=0;for(const row of state.map)for(const t of row)if(t===TT.PEACH_TREE)trees++;
 for(const it of state.items||[])if(it.foodKind==='peach'||it.name==='신선도')items+=it.count||1;
 const before=trees+items;if(before>budget.limit)throw new Error('theme 2 peach producer exceeded shared generation budget');
 const reach=finalReachSet1029(),candidates=[];
 for(const id of reach){const [x,y]=id.split(',').map(Number),t=state.map[y]?.[x];if(!Number.isFinite(x)||!Number.isFinite(y)||tileBlocks(t)||HAZ1020().has(t)||[TT.KEY_TILE,TT.STAIR,TT.DOOR,TT.OPEN_DOOR,TT.CACHE,TT.ARMORY,TT.VAULT].includes(t)||state.items.some(i=>i.x===x&&i.y===y)||state.monsters.some(m=>monCovers(m,x,y))||entityDistance57({x,y},state.player)<3)continue;candidates.push({x,y,h:hash1022(floorSeedKey(`peach-resource53:${x},${y}`))})}
 candidates.sort((a,b)=>a.h-b.h);for(let i=before;i<budget.limit;i++){const q=candidates.pop();if(!q)throw new Error('no reachable peach resource placement');PlacementService.placeItem({...structuredClone(foodDef('신선도')),count:1,x:q.x,y:q.y,generatedPeach53:true})}
 state.peachBudget52={floor:state.floor,before,limit:budget.limit,after:budget.limit,trees,items:budget.limit-trees,sources:['shared budget tree generators','reachable resource allocation'],policy:'one guaranteed, 35% second, no post-generation deletion'};
}
function rescueOrdinaryExit1029(){
  if([11,13,21].includes(state.floor)||strictLockFloors().includes(state.floor)||state.keyPlan96?.groups?.length||finalExitReach1029())return finalExitReach1029();
  window.__MANRU_RUNTIME81__?.Integrity81?.repair?.();semanticDoorCleanup();pruneOrphanDoors();if(finalExitReach1029())return true;
  const reach=reachableSet1020({unlock:true,openBoss:true});let best=null,bd=1e9;for(const kk of reach){const[x,y]=kk.split(',').map(Number),d=Math.abs(x-state.stairs.x)+Math.abs(y-state.stairs.y);if(d<bd){bd=d;best={x,y}}}if(!best)return false;archLine(best.x,best.y,state.stairs.x,best.y,TT.FLOOR,1,true);archLine(state.stairs.x,best.y,state.stairs.x,state.stairs.y,TT.FLOOR,1,true);setTerrainTile58(state.map,state.stairs.x,state.stairs.y,TT.STAIR);semanticDoorCleanup();return finalExitReach1029()
}
function stabilizeFinalTopology1029(){
  semanticDoorCleanup();pruneOrphanDoors();
  /* Final topology is observational for typed-key floors. Do NOT move/rebuild keys here: the canonical outer generator rejects the whole map if this audit fails. */
  let lock=null;if(state.keyPlan96?.groups?.length)lock=lockAudit96()||null;
  const exit=rescueOrdinaryExit1029();semanticDoorCleanup();pruneOrphanDoors();return{exit,lock,components:ReachabilityService.finalComponents({finalReachSet1029,inside1020,HAZ1020,K1020,stairMarkerState1029,finalExitReach1029})}
}
function safe46(x,y){return insideMapInterior(x,y)&&ReachabilityService.playerPassable(x,y)&&!OccupancyService.isOccupied(x,y)&&state.map[y][x]!==TT.STAIR&&state.map[y][x]!==TT.PORTAL&&state.map[y][x]!==TT.KEY_TILE&&state.map[y][x]!==TT.LOCKED_GATE}
function portalCandidate46(){const dist=typeof ReachabilityService.distances==='function'?ReachabilityService.distances(state.player):null,c=[];for(let y=2;y<ROWS-2;y++)for(let x=2;x<COLS-2;x++){if(!safe46(x,y))continue;const d=dist?.get?.(key46(x,y));if(d==null||d<12)continue;if(Math.abs(x-state.stairs.x)+Math.abs(y-state.stairs.y)<6)continue;if((state.items||[]).some(i=>i.x===x&&i.y===y))continue;c.push({x,y,d})}c.sort((a,b)=>b.d-a.d);return c.slice(0,Math.max(1,Math.floor(c.length*.25)))}
function keyProgressInternal48(){
 const plan=state?.keyPlan96;if(!state||!plan)return{ok:true,reason:'no-plan',unlocked:new Set(),seen:new Set(),stages:[],badKeys:[],targetOk:true};
 const ids=[...new Set([...(plan.groups||[]).map(g=>g.keyId),...(plan.keys||[]).map(q=>q.keyId),...(plan.doors||[]).map(d=>d.keyId)].filter(Boolean))],unlocked=new Set(),stages=[];
 for(const id of ids){if((plan.ring?.[id]||0)>0||(plan.doors||[]).filter(d=>d.keyId===id).length>0&&(plan.doors||[]).filter(d=>d.keyId===id).every(d=>d.open===true||state.map?.[d.y]?.[d.x]===TT.OPEN_DOOR))unlocked.add(id)}
 let changed=true,walk=ReachabilityService.keyWalk(unlocked);while(changed){changed=false;for(const q of plan.keys||[]){if(q.active===false||unlocked.has(q.keyId))continue;if(walk.seen.has(key46(q.x,q.y))){unlocked.add(q.keyId);stages.push({keyId:q.keyId,x:q.x,y:q.y,cellsBefore:walk.seen.size});changed=true}}if(changed)walk=ReachabilityService.keyWalk(unlocked)}
 const badKeys=(plan.keys||[]).filter(q=>q.active!==false&&!unlocked.has(q.keyId)).map(q=>({keyId:q.keyId,x:q.x,y:q.y}));
 const target=state.artifactDungeon46?state.artifactReward46:state.stairs,targetOk=!target||walk.seen.has(key46(target.x,target.y)),exitOk=!state.artifactDungeon46||!state.artifactExit46||walk.seen.has(key46(state.artifactExit46.x,state.artifactExit46.y));
 let sequenceOk=true,sequence=null;if(plan.kind==='legendary-r48'){
   const iron=(plan.keys||[]).find(q=>q.keyId==='iron'&&q.active!==false),jade=(plan.keys||[]).find(q=>q.keyId==='jade'&&q.active!==false),s0=ReachabilityService.keyWalk(new Set()),s1=ReachabilityService.keyWalk(new Set(['iron'])),s2=ReachabilityService.keyWalk(new Set(['iron','jade']));
   sequence={ironInitially:!!iron&&s0.seen.has(key46(iron.x,iron.y)),jadeInitially:!!jade&&s0.seen.has(key46(jade.x,jade.y)),jadeAfterIron:!!jade&&s1.seen.has(key46(jade.x,jade.y)),rewardInitially:!!target&&s0.seen.has(key46(target.x,target.y)),rewardAfterIron:!!target&&s1.seen.has(key46(target.x,target.y)),rewardAfterJade:!!target&&s2.seen.has(key46(target.x,target.y))};
   sequenceOk=sequence.ironInitially&&!sequence.jadeInitially&&sequence.jadeAfterIron&&!sequence.rewardInitially&&!sequence.rewardAfterIron&&sequence.rewardAfterJade;
 }
 return{ok:badKeys.length===0&&targetOk&&exitOk&&sequenceOk,kind:plan.kind||'unknown',unlocked,seen:walk.seen,walk:walk.q,stages,badKeys,targetOk,exitOk,sequenceOk,sequence,ids};
}
function walkPortal46(id){if(!state||state.artifactDungeon46)return false;const p=globalThis.__MANRU_LEGEND47__?.forcePortal?.(id);if(!p)return false;const a=DIRS8.map(([dx,dy])=>({x:p.x-dx,y:p.y-dy,dx,dy})).find(q=>insideMapInterior(q.x,q.y)&&ReachabilityService.playerPassable(q.x,q.y)&&!OccupancyService.isOccupied(q.x,q.y));if(!a)return false;state.player.x=a.x;state.player.y=a.y;resetVisualState();VisibilityService.compute();ActionDispatcher.dispatch({type:'MOVE',args:[a.dx,a.dy]}).value;return{entered:!!state.artifactDungeon46,audit:reachAudit46()}}
function walkReturn46(){const p=state?.artifactExit46;if(!p)return false;const a=DIRS8.map(([dx,dy])=>({x:p.x-dx,y:p.y-dy,dx,dy})).find(q=>insideMapInterior(q.x,q.y)&&ReachabilityService.playerPassable(q.x,q.y)&&!OccupancyService.isOccupied(q.x,q.y));if(!a)return false;state.player.x=a.x;state.player.y=a.y;resetVisualState();VisibilityService.compute();ActionDispatcher.dispatch({type:'MOVE',args:[a.dx,a.dy]}).value;return{returned:!state.artifactDungeon46,floor:state.floor,dims:[COLS,ROWS]}}
const REGIONS=[
  [1,5,'청풍루','붉은 등불과 비단, 끝없이 이어지는 연회장과 객실.','#4d2924','#231814','#c77e53'],
  [6,10,'수묵원','객주 안인데 비가 내리는 수묵 정원. 물과 대나무 사이의 종이 다리를 건넌다.','#35423a','#17231d','#8aa58d'],
  [11,15,'유혹의 내실','자줏빛 비단과 거울이 방의 경계를 뒤틀어 놓는다.','#49334e','#211522','#bd7eac'],
  [16,20,'지하 장고','16층 성채의 용암 해자를 넘으면 장독과 철판 창고가 이어지고, 20층 형틀 심부로 내려간다.','#4b3a30','#211914','#a77755'],
  [21,25,'만루의 심장','황금 기와와 원혼, 수은 연못과 거대한 공동.','#5a4930','#211a12','#d1b25f']
];
function choice(arr){ return arr[Math.floor(globalThis.__MANRU_RANDOM57__()*arr.length)]; }
function spillJar105(x,y,kind){
 const r=terrainReactions105();r.spills||={};
 const cells=elementCells105(x,y,1).filter(q=>!tileBlocks(state.map[q.y]?.[q.x])&&!globalThis.__MANRU_HAZARD_CORE__?.kind(state.map[q.y]?.[q.x]));
 for(const q of cells)r.spills[k(q.x,q.y)]={...q,kind,ttl:5,born:state.turn};
 if(kind==='water')emitElementContact105('water',cells);for(const e of [state.player,...state.monsters])if(e.hp>0&&cells.some(q=>monCovers(e,q.x,q.y)))environmentStanding105(e);
 if(kind==='water')elementAttackFx105('water',cells,{x,y});return cells;
}
// Terrain table only: ignores decor blockers and hidden passages (map carving and spawn search use this).
function tileBlocksByTerrain(t){if(t===TT.PALACE_ROCK||t===TT.PALACE_WALL_LAMP)return true;if(t>=500&&t<660)return t!==undefined&&[4,5,6,8].includes((t-500)%16);return BLOCKING_TILES57.has(t)}
function playerTransferLandingSafe57(x,y){
  if(!state?.player||x<0||y<0||x>=COLS||y>=ROWS)return false;
  const t=state.map?.[y]?.[x];return ReachabilityService.playerPassable(x,y)&&!OccupancyService.isOccupied(x,y)&&!PLAYER_TRANSFER_UNSAFE57.has(t);
}
function randomPlayerTransferDestination57(cause,opts={}){
  if(!state?.player)return null;const authorized=ReachabilityService.playerMobility(),all=[],far=[],minDistance=Math.max(0,opts.minDistance??4);
  for(const id of authorized){const [xs,ys]=String(id).split(','),x=Number(xs),y=Number(ys);if(!Number.isFinite(x)||!Number.isFinite(y))continue;const v=validatePlayerTransfer57(x,y,{cause,authorizedSet:authorized});if(!v.ok)continue;const q={x,y};all.push(q);if(entityDistance57(q,state.player)>=minDistance)far.push(q)}
  const pool=far.length?far:all;return pool.length?choice(pool):null;
}
function executeBlinkTarget57(cell,ctx){
  if(!state||!cell||!ctx?.act?.ok)return false;const p=state.player,ox=p.x,oy=p.y,live=blinkTargetCells57(p,ctx.range).find(q=>q.x===cell.x&&q.y===cell.y);if(!live){toast('그 칸은 더 이상 점멸할 수 없다.');return false}
  if((p.focus||0)<2){toast('점멸에는 기력 2가 필요하다.');return false}
  try{p.focus-=2;state.blinkSpent52=(state.blinkSpent52||0)+2;burst(ox,oy,'#c9d4e5',10,.7);const landing=resolvePlayerLanding57(live.x,live.y,{cause:'blink'});if(!landing.ok){p.focus+=2;state.blinkSpent52=Math.max(0,(state.blinkSpent52||0)-2);toast('점멸할 수 없는 칸이다.');return false}burst(p.x,p.y,'#c9d4e5',12,.9);addLog(`점멸 ${live.dist}칸 · 기력 -2.`);if(!state.dead)commitPlayerAction57(ctx.act,.85);return true}finally{if(state&&(p.x!==ox||p.y!==oy))window.__MANRU_RUNTIME81__?.Automation81?.pickup?.()}
}
function useBlink(){
  if(typeof V57!=='undefined'&&V57.cookOpen)return false;const rt=window.__MANRU_RUNTIME81__;if(rt?.state?.cameraInspecting)rt.Camera81?.resume?.(false);const p=state?.player;if(!p)return false;
  const act=playerAction57('blink',{skill:true,stunMessage:'몸이 굳어 점멸하지 못했다.'});if(!act.ok)return !!act.consumed;
  if(p.blinkLevel<2){toast('청풍루 문지기를 쓰러뜨린 뒤 점멸을 얻는다.');return false}if((p.focus||0)<2){toast('점멸에는 기력 2가 필요하다.');addLog('점멸 실패: 기력이 2 미만이다.');return false}
  // 21F only: open a reusable world-cell target mode. No focus or turn is spent until a destination is confirmed.
  if(state.floor===21){const range=Math.max(1,Math.floor(p.blinkLevel||0)),cells=blinkTargetCells57(p,range);if(!cells.length){toast('점멸할 착지점이 없다.');return false}
    return beginWorldTarget({kind:'blink21',title:'점멸',text:`이동할 곳을 골라라 · 최대 ${range}칸 · 방향키는 해당 방향 최장거리`,range,cells,toast:'이동할 곳을 골라라.',meta:{act},onPick:(cell)=>executeBlinkTarget57(cell,{act,range})});
  }
  const f=p.facing||{x:0,y:-1},cells=blinkTargetCells57(p,p.blinkLevel),ray=cells.filter(q=>q.dx===Math.sign(f.x)&&q.dy===Math.sign(f.y)).sort((a,b)=>b.dist-a.dist),best=ray[0];if(!best){toast('점멸할 착지점이 없다.');return false}
  return executeBlinkTarget57(best,{act,range:p.blinkLevel});
}
function estateWallExposure24(x,y){
  const pass=(xx,yy)=>xx>=0&&yy>=0&&xx<COLS&&yy<ROWS&&!tileBlocks(state.map[yy][xx]);
  const n=pass(x,y-1),s=pass(x,y+1),w=pass(x-1,y),e=pass(x+1,y);
  if(n&&!s)return'n';if(s&&!n)return's';if(w&&!e)return'w';if(e&&!w)return'e';
  if(n||s)return n?'n':'s';if(w||e)return w?'w':'e';return null
}
  function sigil(x,y,label){return placeFeatureTile(x,y,TT.FLOOR)}
  function trait47(){if(state.specialFloor)return null;const a=[['보급','회복 자원이 풍부함'],['경계','적과 장비 보상이 증가'],['불온','함정과 전술 물품 증가'],['비밀','보급함과 유물 발견 가능']];let pool=a.filter(v=>v[0]!==state.lastTrait47);if(!pool.length)pool=a;const pick=choice(pool);state.lastTrait47=pick[0];return pick}
  function talismanPick56(){
    const K=ensureKnowledge56(),pool=TALISMANS.filter(t=>t.talismanKind!=='upgrade'&&state.floor>=(t.minFloor||1)),h=K.talismanHistory;
    let a=pool.filter(t=>!h.includes(t.talismanKind));if(!a.length)a=pool;
    let total=a.reduce((s,t)=>s+(t.weight74||1),0),r=globalThis.__MANRU_RANDOM57__()*total,pick=a[0];
    for(const t of a){r-=t.weight74||1;if(r<=0){pick=t;break}}
    const out=clone(pick);h.push(out.talismanKind);while(h.length>Math.min(5,Math.max(3,pool.length-1)))h.shift();return out
  }
  function randomInside59(r){
    const cells=[];
    for(let y=r.y+1;y<r.y+r.h-1;y++)for(let x=r.x+1;x<r.x+r.w-1;x++)if(state.map[y][x]===TT.FLOOR)cells.push({x,y});
    return cells.length?choice(cells):{x:r.cx,y:r.cy};
  }
  function initHidden60(){
    state.hiddenGroups60={};state.hiddenLookup60={};state.hiddenBase60={};state.hiddenReplacement60={};state.crumbleBase60={};state._lastPlayerPos60=null;HIDDEN_ROUTE_STATE.hiddenSeq=0;
  }
  /* v9.4: denser special-floor side architecture. These are local branches, never map-wide bypasses. */
  function wallPocket94(w=8,h=6){
    const candidates=[];for(let y=2;y<=ROWS-h-3;y++)for(let x=2;x<=COLS-w-3;x++){
      if(!(x<COLS*.24||x>COLS*.76||y<ROWS*.22||y>ROWS*.78))continue;let ok=true;
      for(let yy=y;yy<y+h&&ok;yy++)for(let xx=x;xx<x+w;xx++)if(state.map[yy][xx]!==TT.WALL){ok=false;break}
      if(ok)candidates.push({x,y,w,h,cx:x+Math.floor(w/2),cy:y+Math.floor(h/2)});
    }return candidates.length?choice(candidates):null;
  }
  function nearestOpen94(cx,cy,max=28){let best=null,bd=1e9;for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++){const t=state.map[y][x];if(tileBlocksByTerrain(t)||t===TT.STAIR)continue;const d=Math.abs(x-cx)+Math.abs(y-cy);if(d<bd&&d<=max){bd=d;best={x,y}}}return best}
  function safeProgressDrop23(mon){let p=PlacementService.findItemCell(mon,{radius:10});if(p)return p;const q=state.floor23,reach=floodSpecial60(state.player,{centerOpen:true}),cells=[];for(const kk of reach.keys()){const[x,y]=kk.split(',').map(Number),t=state.map[y]?.[x];if(x<q.centerBounds.x||x>=q.centerBounds.x+q.centerBounds.w||y<q.centerBounds.y||y>=q.centerBounds.y+q.centerBounds.h||tileBlocks(t)||[TT.MERCURY,TT.VOID,TT.WATER,TT.LAVA].includes(t)||(state.items||[]).some(i=>i.x===x&&i.y===y))continue;cells.push({x,y,d:Math.abs(x-mon.x)+Math.abs(y-mon.y)})}cells.sort((a,b)=>a.d-b.d);return cells[0]||null}
  function qaF24WalkExit60(){if(state.floor!==24)return{ok:false,reason:'not-f24'};const walk=qaWalkTo60(state.stairs);return{ok:walk.ok,walk,stairs:{...state.stairs}}}
  const qa60=Object.freeze({mark:qaMark60,restore:qaRestore60,summary:qaSummary60,hash:qaHash60,activate23:qaActivate23ById60,run23Order:qaRun23Order60,threshold23:qaThreshold23_60,pickupProgress23:qaPickupProgressKey23_60,descend:qaDescend60,revealSaveLoad:qaRevealSaveLoad60,hazard23:qaHazard23_60,clearHostiles:qaClearHostiles60,walkTo:qaWalkTo60,f24KeyGate:qaF24KeyGate60,f24WalkExit:qaF24WalkExit60,f24Summons:qaF24Summons60,f24GumiMechanics:qaF24GumiMechanics60,f24ItemReach:qaF24ItemReach60,f24VisualTargets:qaF24VisualTargets60,view:qaView60,cleanView:(target)=>qaView60(target,{cleanHostiles:true}),cleanHud:qaCleanHud60});
  /* ---------- diagnostics ---------- */
  function reachable70(){return !!state?.stairs&&ReachabilityService.playerSearch(state.player,{goal:state.stairs}).cells.has(k(state.stairs.x,state.stairs.y))}
  function safeBlink74(x,y){return validatePlayerTransfer57(x,y,{cause:'fusion-blink'}).ok}
  function preservePath78(){
    if(!state.specialFloor){ensureNormalConnectivity();}
  }
  const V93={serial:0,profiles:[],roomTemplates:[]};
  const PROFILE93=['braid','offset-halls','cluster-loop'];
  function graphAdj93(n,edges){const a=Array.from({length:n},()=>[]);for(const e of edges){a[e.a].push(e.b);a[e.b].push(e.a)}return a}
  function chooseProfile93(){let p=PROFILE93.filter(x=>x!==state.generationProfile93);if(!p.length)p=PROFILE93;const x=choice(p);state.generationProfile93=x;V93.profiles.push(x);if(V93.profiles.length>40)V93.profiles.shift();return x}
  function edgeWidth93(ra,rb,kind){const hall=(ra.role93==='hall'||rb.role93==='hall'),span=roomDistance(ra,rb),big=Math.max(ra.w*ra.h,rb.w*rb.h)>=88;if(hall&&big&&globalThis.__MANRU_RANDOM57__()<.12)return 3;if(hall&&globalThis.__MANRU_RANDOM57__()<.58)return 2;if(kind==='loop'&&globalThis.__MANRU_RANDOM57__()<.26)return 2;if(kind==='branch-loop'&&globalThis.__MANRU_RANDOM57__()<.24)return 2;if(span>=18&&globalThis.__MANRU_RANDOM57__()<.18)return 2;return 1}
  function addEdge93(m,rooms,edges,a,b,style='L',kind='tree',options=null){
    if(a===b||edges.some(e=>(e.a===a&&e.b===b)||(e.a===b&&e.b===a)))return false;
    const width=options?choice(options.widths):edgeWidth93(rooms[a],rooms[b],kind);const route=connectVar93(m,rooms[a],rooms[b],style,width,options);edges.push({a,b,kind,width,...(route?{route}: {})});return true;
  }
function profileLinks105(m,rooms,p){
 const edges=[],danger=new Set(p.dangerIndices),safe=rooms.map((_,i)=>i).filter(i=>!danger.has(i)),tree=new Set([0]);
 // Same minimum-distance spanning graph as mst93, with optional alarm rooms excluded
 // from the safe backbone. Extra safe links form loops through different rooms.
 while(tree.size<safe.length){let best,score=Infinity;for(const a of tree)for(const b of safe)if(!tree.has(b)){const d=roomDistance(rooms[a],rooms[b])+globalThis.__MANRU_RANDOM57__()*4;if(d<score){score=d;best={a,b}}}addEdge93(m,rooms,edges,best.a,best.b,'L','tree',p);tree.add(best.b)}
 for(let row=0;row<p.rows;row++)for(let col=0;col<p.columns;col++){const a=row*p.columns+col;for(const b of[col+1<p.columns?a+1:-1,row+1<p.rows?a+p.columns:-1])if(b>=0&&!danger.has(a)&&!danger.has(b)&&globalThis.__MANRU_RANDOM57__()<.6)addEdge93(m,rooms,edges,a,b,'L','loop',p)}
 for(const i of danger){addEdge93(m,rooms,edges,i-p.columns,i,'L','alarm',p);addEdge93(m,rooms,edges,i,i+p.columns,'L','alarm',p)}
 return edges;
}
  function mst93(m,rooms,options=null){
    const edges=[];if(rooms.length<2)return edges;const inTree=new Set([Math.floor(globalThis.__MANRU_RANDOM57__()*rooms.length)]);
    while(inTree.size<rooms.length){let best=null,bd=1e9;for(const a of inTree)for(let b=0;b<rooms.length;b++){if(inTree.has(b))continue;const d=roomDistance(rooms[a],rooms[b]);const hallBias=(rooms[a].role93==='hall'||rooms[b].role93==='hall')?-.8:0;const score=d+hallBias+globalThis.__MANRU_RANDOM57__()*1.5;if(score<bd){bd=score;best={a,b}}}if(!best)break;addEdge93(m,rooms,edges,best.a,best.b,globalThis.__MANRU_RANDOM57__()<.18?'Z':globalThis.__MANRU_RANDOM57__()<.08?'diag':'L','tree',options);inTree.add(best.b)}return edges;
  }
  function localLoops93(m,rooms,edges,profile){
    let adj=graphAdj93(rooms.length,edges),want=profile==='braid'?2:profile==='offset-halls'?1:rand(1,2),candidates=[];
    for(let a=0;a<rooms.length;a++)for(let b=a+1;b<rooms.length;b++){
      if(edges.some(e=>(e.a===a&&e.b===b)||(e.a===b&&e.b===a)))continue;const gd=graphDistance93(adj,a,b),sd=roomDistance(rooms[a],rooms[b]);if(gd>=2&&gd<=4&&sd>=6&&sd<=Math.max(19,Math.floor((COLS+ROWS)*.15)))candidates.push({a,b,gd,sd,score:sd+gd*1.8+(rooms[a].role93==='hall'||rooms[b].role93==='hall'?-2:0)+globalThis.__MANRU_RANDOM57__()*3});
    }
    candidates.sort((a,b)=>a.score-b.score);let used=[];
    for(const q of candidates){if(used.length>=want)break;if(addEdge93(m,rooms,edges,q.a,q.b,globalThis.__MANRU_RANDOM57__()<.36?'Z':'L','loop')){used.push(q);adj=graphAdj93(rooms.length,edges)}}
    return used;
  }
  function rareTemplate93(m,rooms){
    if(globalThis.__MANRU_RANDOM57__()>.16)return null;const candidates=rooms.filter(r=>r.w>=8&&r.h>=7&&!(state.fixedStart&&r.cx===state.fixedStart.x&&r.cy===state.fixedStart.y)&&!(state.fixedExit&&r.cx===state.fixedExit.x&&r.cy===state.fixedExit.y));if(!candidates.length)return null;const r=choice(candidates),kind=globalThis.__MANRU_RANDOM57__()<.6?'subroom':'divider';
    if(kind==='divider'){splitRoom89(m,r,globalThis.__MANRU_RANDOM57__()<.5?'v':'h',1);state.roomTemplate92='single-divider';state.roomTemplate93='single-divider';V93.roomTemplates.push('single-divider');return r}
    const w=4,h=3,x=r.cx-2,y=r.cy-1;if(x<=r.x||y<=r.y||x+w>=r.x+r.w-1||y+h>=r.y+r.h-1)return null;
    for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)if(xx===x||xx===x+w-1||yy===y||yy===y+h-1)setTerrainTile58(m,xx,yy,TT.WALL);else setTerrainTile58(m,xx,yy,TT.FLOOR);
    const side=rand(0,3);if(side===0)setTerrainTile58(m,r.cx,y,TT.DOOR);else if(side===1)setTerrainTile58(m,r.cx,y+h-1,TT.DOOR);else if(side===2)setTerrainTile58(m,x,r.cy,TT.DOOR);else setTerrainTile58(m,x+w-1,r.cy,TT.DOOR);
    state.roomTemplate92='room-in-room';state.roomTemplate93='room-in-room';V93.roomTemplates.push('room-in-room');return r;
  }
  function outerChain94(m,z){
    if(globalThis.__MANRU_RANDOM57__()>.24)return 0;state.outerWall94=state.outerWall94||{};state.itemBiasZones94=state.itemBiasZones94||[];const side=globalThis.__MANRU_RANDOM57__()<.5?'left':'right',n=rand(3,5),w=rand(6,8),h=rand(5,6),gap=2,x=side==='left'?2:COLS-w-2,total=n*h+(n-1)*gap;if(total>ROWS-6)return 0;let y=rand(2,ROWS-total-2),prev=null,first=null;
    const created=[];for(let i=0;i<n;i++){if(!canPlace93(x,y,w,h,0)){y+=h+gap;continue}const r=addCompact93(m,x,y,w,h,'outer','rect','outer');created.push(r);if(prev)connectVar93(m,prev,r,'L',1);prev=r;if(!first)first=r;for(let xx=r.x;xx<r.x+r.w;xx++){state.outerWall94[key85(xx,r.y-1)]=1;state.outerWall94[key85(xx,r.y+r.h)]=1}for(let yy=r.y;yy<r.y+r.h;yy++){state.outerWall94[key85(r.x-1,yy)]=1;state.outerWall94[key85(r.x+r.w,yy)]=1}y+=h+gap}
    if(!created.length)return 0;let near=null,bd=1e9;for(const r of state.rooms){if(created.includes(r))continue;const d=roomDistance(first,r);if(d<bd){bd=d;near=r}}if(near)connectVar93(m,first,near,'L',1);const last=created.at(-1);state.itemBiasZones94.push({x:last.x,y:last.y,w:last.w,h:last.h,name:'외곽 연속실'});feature89('외곽 좁은 연속실',last,'outer');return created.length
  }
  function nonUpgradeTalisman982(){const p=(window.MANRU_TALISMANS||[]).filter(i=>i.talismanKind!=='upgrade'&&(i.minFloor||1)<=state.floor);return p.length?clone(choice(p)):null}
function candidateFinal1020(x,y,mon=null){if(!inside1020(x,y)||occupiedFinal(x,y))return false;if(mon)return PlacementService.monsterCanStand(mon,x,y);return safeFloorTile1020(state.map[y][x])}
function finalEntitySweep1020(){
  const reach=finalReachSet1029();
  const keep=[];
  for(const m of state.monsters||[]){const aquatic=!!(m.aquatic||m.waterOnly57),valid=PlacementService.monsterCanStand(m,m.x,m.y)&&(aquatic||reach.has(K1020(m.x,m.y)));if(valid){keep.push(m);continue}
    const ox=m.x,oy=m.y;m.x=-999;m.y=-999;let best=null,bd=1e9;
    for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++){if(!PlacementService.monsterCanStand(m,x,y))continue;if(!aquatic&&!reach.has(K1020(x,y)))continue;const d=Math.abs(x-ox)+Math.abs(y-oy);if(d<bd){bd=d;best={x,y}}}
    if(best){m.x=best.x;m.y=best.y;keep.push(m)}
  }
  state.monsters=keep;PlacementService.validateItems({reachable:reach});
}
function subdivideOpenBuildings1026(){
  state.buildingPartition1026={floor:state.floor,candidates:0,partitioned:0,rolledBack:0,doors:0,rooms:[],probes:[]};
  // Mechanic-first floors and boss arenas keep their authored topology. Ordinary buildings on other floors are eligible.
  if([5,10,11,13,15,20,21,25].includes(state.floor))return state.buildingPartition1026;
  const seen=new Set(),done=[],rooms=(state.rooms||[]).filter(r=>r&&Number.isFinite(r.x)&&Number.isFinite(r.y)).sort((a,b)=>b.w*b.h-a.w*a.h),limit=[6,7,8,9,18,22,24].includes(state.floor)?8:6;
  const overlap=(a,b)=>{const x=Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x)),y=Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));return x*y/Math.max(1,Math.min(a.w*a.h,b.w*b.h))};
  for(const r of rooms){if(state.buildingPartition1026.partitioned>=limit)break;const key=[r.x,r.y,r.w,r.h].join(':');if(seen.has(key)||done.some(d=>overlap(r,d)>.58))continue;seen.add(key);const probe=roomProbe1026(r);if(probe&&r.w>=8&&r.h>=6&&r.w<=38&&r.h<=28)state.buildingPartition1026.probes.push({name:r.name||r.label||null,x:r.x,y:r.y,w:r.w,h:r.h,...probe});const score=enclosedRoomScore1026(r);if(!score)continue;state.buildingPartition1026.candidates++;const out=carvePartition(r,score);if(out.ok){state.buildingPartition1026.partitioned++;state.buildingPartition1026.doors+=out.doors;const row={name:r.name||r.label||null,x:r.x,y:r.y,w:r.w,h:r.h,doors:out.doors};state.buildingPartition1026.rooms.push(row);done.push(r)}else state.buildingPartition1026.rolledBack++}
  return state.buildingPartition1026;
}
function key46(x,y){return `${x},${y}`}
function maybePortal46(){if(!state||state.floor<6||state.floor>=25||state.artifactDungeon46||state.artifactPortal46||state.floor===13||[10,15,20,25].includes(state.floor)||state.monsters?.some(m=>m.boss))return;state.artifactHistory46=state.artifactHistory46||[];const pool=eligible46();if(!pool.length)return;const chance=state.floor>=21?.20:state.floor>=16?.18:state.floor>=11?.16:.14;if(globalThis.__MANRU_RANDOM57__()>=chance)return;const c=portalCandidate46();if(!c.length)return;const a=choice(pool),p=choice(c),oldTile=state.map[p.y][p.x];setTerrainTile58(state.map,p.x,p.y,TT.PORTAL);state.artifactPortal46={x:p.x,y:p.y,id:a.id,name:a.dungeon,oldTile};state.artifactHistory46.push({floor:state.floor,id:a.id,status:'spawned'});addLog('벽면에 전설무기의 봉인이 갈라지며 드문 금빛 포탈이 열렸다.')}
function keyProgressAudit48(store=true){const a=keyProgressInternal48(),out={ok:a.ok,kind:a.kind,unlocked:[...(a.unlocked||[])],reachable:a.seen?.size||0,stages:a.stages||[],badKeys:a.badKeys||[],targetOk:a.targetOk!==false,exitOk:a.exitOk!==false,sequenceOk:a.sequenceOk!==false,sequence:a.sequence||null,ids:a.ids||[]};if(store&&state)state.keyIntegrity48=out;return out}
function reachAudit46(){if(!state)return null;const a=keyProgressAudit48(false);return{cells:a.reachable,reward:a.targetOk,exit:a.exitOk,keys:a,rooms:state.rooms?.length||0,dims:[COLS,ROWS]}}
const BLOCKING_TILES57=new Set([TT.WALL,TT.WATER,TT.LAVA,TT.VOID,TT.MERCURY,TT.DRAWBRIDGE_UP,TT.BAMBOO,TT.TABLE,TT.SCREEN,TT.HEDGE,TT.FAKE_DOOR,TT.LOCKED_GATE,TT.SECRET_DOOR,TT.PEACH_TREE]);
const PLAYER_TRANSFER_UNSAFE57=new Set([TT.DOOR,TT.TRAP,TT.SNARE,TT.LAVA,TT.WATER,TT.VOID,TT.MERCURY].filter(v=>Number.isFinite(v)));
function playerTransferPolicy57(cause){
  if(cause==='talisman-blink'||cause==='fusion-blink')return{seen:true,safe:true,authorized:true,excludeOrigin:true};
  if(cause==='holy-blink'||cause==='mirror-teleport'||cause==='boss-teleport')return{seen:false,safe:true,authorized:true,excludeOrigin:true};
  return null;
}
function movePlayer(dx,dy){
 if(state?.shopIntermission?.active){
  if(!gameplayInputAllowed57())return false;const p=state.player,x=p.x+dx,y=p.y+dy,npc=neutralInteractableAt58(x,y);if(npc)return interactNeutral58(npc);
  if(!ReachabilityService.playerStepAllowed(p,x,y)||OccupancyService.isOccupied(x,y))return false;
  p.facing={x:dx,y:dy};if(state.map[y][x]===TT.DOOR){setTerrainTile58(state.map,x,y,TT.OPEN_DOOR);doorFX(x,y)}
  const landing=resolvePlayerLanding57(x,y,{cause:'walk'});if(!landing.ok)return false;
  VisibilityService.compute();updateAll();globalThis.__MANRU_SAVE_SERVICE__?.request?.();return true;
 }

  const p0=state?.player,ctx={dx,dy,beforeX:p0?.x,beforeY:p0?.y,targetX:(p0?.x??0)+dx,targetY:(p0?.y??0)+dy,targetTile:state?.map?.[(p0?.y??0)+dy]?.[(p0?.x??0)+dx],result:undefined};
  for(let i=MOVE_HOOKS.pre.length-1;i>=0;i--)if(MOVE_HOOKS.pre[i](ctx)===false)return false;
  try{
    const act=playerAction57('move',{stunMessage:'몸이 굳어 한 턴을 잃었다.'});if(!act.ok)return act.consumed||false;
    const p=state.player,intended={x:dx,y:dy},ix=p.x+dx,iy=p.y+dy,intendedMon=ix>=0&&iy>=0&&ix<COLS&&iy<ROWS?findMonsterAt(ix,iy):null;
    p.facing={...intended};if(intendedMon&&isHostileTarget57(intendedMon)){state._forcedAdjacentTargetR8=intendedMon;ctx.result=ActionDispatcher.dispatch({type:'ATTACK',args:[]}).value;return ctx.result}
    if((state.status?.drunk||0)>0){const drunk=drunkMovementOutcome57();if(drunk==='stumble'){floatText(p.x,p.y,'휘청','#d7c39e',10);addLog('취기가 발을 묶어 제자리에서 휘청거렸다.');commitPlayerAction57(act,moveTurnCost());ctx.result=true;return true}if(drunk==='misstep'){const choices=[];for(const[ddx,ddy]of DIRS8){const x=p.x+ddx,y=p.y+ddy;if(x<0||y<0||x>=COLS||y>=ROWS||findMonsterAt(x,y))continue;const tile=state.map?.[y]?.[x],hazard=globalThis.__MANRU_HAZARD_CORE__?.kind?.(tile);if(ReachabilityService.playerStepAllowed(p,x,y,{allowHazardEntry:!!hazard}))choices.push({dx:ddx,dy:ddy})}if(!choices.length){floatText(p.x,p.y,'휘청','#d7c39e',10);addLog('취기가 발을 꼬았지만 비틀어 갈 곳이 없었다.');commitPlayerAction57(act,moveTurnCost());ctx.result=true;return true}const q=choice(choices);dx=q.dx;dy=q.dy;ctx.dx=dx;ctx.dy=dy;ctx.targetX=p.x+dx;ctx.targetY=p.y+dy;ctx.targetTile=state.map?.[ctx.targetY]?.[ctx.targetX];floatText(p.x,p.y,'비틀','#d7c39e',10);addLog('취기에 방향 감각이 흐려져 발걸음이 빗나갔다.')}}
    p.facing={x:dx,y:dy};const nx=p.x+dx,ny=p.y+dy;if(nx<0||ny<0||nx>=COLS||ny>=ROWS){ActionDispatcher.dispatch({type:'STRUCTURE_INTERACT',args:[nx,ny,act]}).value;return}
    const mon=findMonsterAt(nx,ny);if(mon){if(!isHostileTarget57(mon)){ctx.result=resolveOccupancyInteraction57(p,mon);if(ctx.result)commitPlayerAction57(act,moveTurnCost());return ctx.result}state._forcedAdjacentTargetR8=mon;ctx.result=ActionDispatcher.dispatch({type:'ATTACK',args:[]}).value;return ctx.result}
    const t=state.map[ny][nx];if(t===TT.JAR){state._manualTerrainTargetR8={type:'jar',x:nx,y:ny};ctx.result=ActionDispatcher.dispatch({type:'ATTACK',args:[]}).value;return ctx.result}const haz=globalThis.__MANRU_HAZARD_CORE__,kind=haz?.kind?.(t);
    if(!ReachabilityService.playerStepAllowed(p,nx,ny,{allowHazardEntry:!!kind})){ActionDispatcher.dispatch({type:'STRUCTURE_INTERACT',args:[nx,ny,act]}).value;return}
    const discovery105=captureMovementDiscovery105();
    if(t===TT.DOOR){setTerrainTile58(state.map,nx,ny,TT.OPEN_DOOR);branchWarningDoor(nx,ny);doorFX(nx,ny);addLog('문을 밀어 열었다.')}
    const landing=resolvePlayerLanding57(nx,ny,{cause:'walk',discovery105});if(!landing.ok){ctx.result=false;return false}if(state.dead){ctx.result=true;return true}if(WorldTransition57.commit(act,moveTurnCost())){ctx.result=true;return true}if(state.map[ny][nx]===TT.STAIR)toast('다음 층으로 이어지는 문이다.');commitPlayerAction57(act,moveTurnCost());ctx.result=true;return true
  }finally{
    ctx.afterX=state?.player?.x;ctx.afterY=state?.player?.y;ctx.moved=!!state&&(ctx.afterX!==ctx.beforeX||ctx.afterY!==ctx.beforeY);
    for(const fn of MOVE_HOOKS.post)try{fn(ctx)}catch(e){console.error('move post hook',e)}
  }
}
  const SIZE60={
    2:[87,57],4:[85,55],5:[73,51],6:[89,59],8:[87,57],10:[75,53],11:[93,63],13:[89,59],15:[75,53],
    16:[95,63],18:[93,61],20:[111,85],21:[99,67],22:[95,65],23:[95,65],24:[95,63],25:[89,59]
  };
  function qaClearHostiles60(){const n=(state.monsters||[]).filter(m=>m.hp>0).length;state.monsters=[];return n}
  function qaF24VisualTargets60(){
    if(state.floor!==24)return null;
    const roomKind=name=>{const r=(state.featureRooms||[]).find(v=>v.estate24&&v.kind60===name);return r?{x:r.cx??r.x+Math.floor(r.w/2),y:r.cy??r.y+Math.floor(r.h/2),kind:name,name:r.name}:null},
      roomNamed=text=>{const r=(state.featureRooms||[]).find(v=>v.estate24&&String(v.name||'').includes(text));return r?{x:r.cx??r.x+Math.floor(r.w/2),y:r.cy??r.y+Math.floor(r.h/2),kind:r.kind60,name:r.name}:null};
    const hall=roomKind('great-hall');
    return{greatHall:hall,banquet:hall,library:roomKind('library'),bedroom:roomKind('inner-wing'),study:roomKind('sarangchae'),tea:roomKind('tea-room'),service:roomKind('haengrang'),courtyard:roomNamed('비정형 중정')||roomKind('courtyard'),northGallery:roomNamed('북측 분절 창호 추격회랑')||roomKind('north-eaves'),exit:{x:state.stairs.x,y:state.stairs.y,kind:'exit'}}
  }
  function qaCleanHud60(on=true){
    document.documentElement.classList.toggle('qa-clean-capture60',!!on);return document.documentElement.classList.contains('qa-clean-capture60')
  }
  function existingEnemies62(r){const pad=1;return state.monsters.filter(m=>!m.boss&&!m.fixed&&!m.aquatic&&!m.ranged&&m.hp>0&&m.x>=r.x-pad&&m.x<r.x+r.w+pad&&m.y>=r.y-pad&&m.y<r.y+r.h+pad)}
/* ===== MANRU v7.1: REGIONAL COMPLEXITY / LANDMARK OVERHAUL ===== */
const NORMAL71=new Set([1,3,7,9,12,14,17,19]);
  function fillUnused90(){state.minorPurpose90=0;return 0}
  function reset93(m){delete state.tutorialEntry60;clear88(m);state.rooms=[];state.featureRooms=[];state.routeTags=[];state.grandRoom89=null;state.focalRooms89=[];state.purposeRooms90=[];state.mainRooms90=[];state.branchRooms92=[];state.branchLeaves92=[];state.mainPathRooms92=[];state.roomGraph92=null;state.roomTemplate92=null;state.roomGraph93=null;state.roomTemplate93=null;}
  function diameter93(adj){const a=farNode93(adj,0).node,b=farNode93(adj,a).node;return{a,b,path:shortestNodes93(adj,a,b)}}
  function graphDistance93(adj,a,b){const p=shortestNodes93(adj,a,b);return p.length?p.length-1:99}
  function healProto982(f=state?.floor||1){const P=window.MANRU_POTIONS||[];const kind=f>=6?'heal_medium':'heal_small';return P.find(i=>i.potionKind===kind)||P.find(i=>i.potionKind==='heal_small')||null}
function interactNeutral58(n){if(!n||n.kind!=='merchant'||!state?.shopIntermission?.active||!gameplayInputAllowed57()||entityDistance57(n,state.player)>1)return false;cancelAutoWalk();clearHeldInput53();openShop();return true}
  function kitchen(r){for(let y=r.y+1;y<=r.y+r.h-2;y+=2){placeFeatureTile(r.x+1,y,TT.JAR);placeFeatureTile(r.x+r.w-2,y,TT.TABLE)}placeFeatureTile(r.cx,r.cy,TT.COOKPOT);placeFeatureTile(r.cx-2,r.cy,TT.TABLE);placeFeatureTile(r.cx+2,r.cy,TT.TABLE);sigil(r.x+1,r.cy,'주방')}
  function armoryRoom(r){placeFeatureTile(r.cx,r.cy,TT.ARMORY);for(let x=r.x+1;x<=r.x+r.w-2;x+=2)placeFeatureTile(x,r.y+1,TT.TABLE);for(let x=r.x+2;x<=r.x+r.w-3;x+=3)placeFeatureTile(x,r.y+r.h-2,TT.CACHE);sigil(r.x+1,r.y+1,'무기고')}
  function repairRequired60(){
    const start={x:state.player.x,y:state.player.y},goal={x:state.stairs.x,y:state.stairs.y},id=(x,y)=>y*COLS+x,xy=i=>({x:i%COLS,y:Math.floor(i/COLS)});
    const walkable=t=>!tileBlocksByTerrain(t);
    if(ReachabilityService.requiredExitReach({start,goal,walkable}))return 0;
    const N=COLS*ROWS,dist=Array(N).fill(Infinity),prev=Array(N).fill(-1),done=Array(N).fill(false),sid=id(start.x,start.y),gid=id(goal.x,goal.y);dist[sid]=0;
    const cost=t=>walkable(t)?1:t===TT.DOOR?1:[TT.SHALLOW_WATER,TT.WATER,TT.MERCURY].includes(t)?3:[TT.TABLE,TT.SCREEN,TT.HEDGE,TT.BAMBOO].includes(t)?5:(t===TT.WALL?7:40);
    for(let step=0;step<N;step++){let u=-1,best=Infinity;for(let i=0;i<N;i++)if(!done[i]&&dist[i]<best){best=dist[i];u=i}if(u<0||u===gid)break;done[u]=true;const p=xy(u);for(const[dx,dy]of DIRS4){const x=p.x+dx,y=p.y+dy;if(x<=0||y<=0||x>=COLS-1||y>=ROWS-1)continue;const v=id(x,y),nd=dist[u]+cost(state.map[y][x]);if(nd<dist[v]){dist[v]=nd;prev[v]=u}}}
    if(!isFinite(dist[gid]))return 0;const path=[];for(let at=gid;at!==sid&&at>=0;at=prev[at])path.push(xy(at));let repairs=0;
    for(const p of path){const t=state.map[p.y][p.x];if(walkable(t))continue;if(t===TT.WATER)setTerrainTile58(state.map,p.x,p.y,TT.PAPER_BRIDGE);else if(t===TT.MERCURY)setTerrainTile58(state.map,p.x,p.y,TT.DRAWBRIDGE_DOWN);else if(t===TT.WALL)setTerrainTile58(state.map,p.x,p.y,TT.DOOR);else setTerrainTile58(state.map,p.x,p.y,TT.FLOOR);repairs++}
    state.repair60=(state.repair60||0)+repairs;return repairs;
  }
  function relocate60(monsters,items){
    const pool=relocatePool60(),size=COLS*ROWS,occupied60=new Uint8Array(size),itemUsed60=new Uint8Array(size),live=[],reachable60=state.floor===24?reach24State60({entranceOpen:true,allowBlink:false,ignoreOccupants:true}).cells:null;
    const markMon=m=>{for(const[ox,oy]of footprintOffsets(m)){const x=m.x+ox,y=m.y+oy;if(x>=0&&y>=0&&x<COLS&&y<ROWS)occupied60[y*COLS+x]=1}};
    const canMon=(m,x,y)=>{for(const[ox,oy]of footprintOffsets(m)){const xx=x+ox,yy=y+oy;if(xx<1||yy<1||xx>=COLS-1||yy>=ROWS-1||occupied60[yy*COLS+xx]||(xx===state.player.x&&yy===state.player.y)||(reachable60&&!reachable60.has(k(xx,yy)))||!PlacementService.terrainStandable(m,state.map[yy][xx]))return false}return state.map[y][x]!==TT.STAIR};
    state.monsters=[];
    for(let mi=0;mi<monsters.length;mi++){
      const m=monsters[mi];m.x=-99;m.y=-99;
      if(m.boss&&state.bossPos60){m.x=state.bossPos60.x;m.y=state.bossPos60.y;if(canMon(m,m.x,m.y)){live.push(m);markMon(m)}continue}
      if(!pool.count)continue;const start=Math.floor(globalThis.__MANRU_RANDOM57__()*pool.count)%pool.count;let found=-1;
      for(let step=0;step<pool.count;step++){const idx=pool.cells[(start+step)%pool.count],x=idx%COLS,y=(idx/COLS)|0;if(canMon(m,x,y)){found=idx;break}}
      if(found>=0){m.x=found%COLS;m.y=(found/COLS)|0;live.push(m);markMon(m)}
    }
    state.monsters=live;
    state.items=[];
    for(let ii=0;ii<items.length;ii++){
      const it=items[ii];if(!pool.count){it.x=state.player.x;it.y=state.player.y;PlacementService.placeItem(it);continue}
      const start=Math.floor(globalThis.__MANRU_RANDOM57__()*pool.count)%pool.count;let found=-1;
      for(let step=0;step<pool.count;step++){const idx=pool.cells[(start+step)%pool.count],x=idx%COLS,y=(idx/COLS)|0,t=state.map[y][x];if(itemUsed60[idx]||occupied60[idx]||t===TT.STAIR||(x===state.player.x&&y===state.player.y)||(reachable60&&!reachable60.has(k(x,y)))||!ReachabilityService.playerTerrainPassable(x,y)||globalThis.__MANRU_HAZARD_CORE__?.kind?.(t))continue;found=idx;break}
      if(found<0)found=state.player.y*COLS+state.player.x;it.x=found%COLS;it.y=(found/COLS)|0;itemUsed60[found]=1;PlacementService.placeItem(it)
    }
  }
  function chooseRoom71(minW=8,minH=7,used=new Set()){
    const pool=(state.rooms||[]).filter(r=>r.w>=minW&&r.h>=minH&&!roomHasEndpoint(r)&&!used.has(`${r.x},${r.y}`));
    if(!pool.length)return null;
    pool.sort((a,b)=>b.w*b.h-a.w*a.h);
    const rr=pool[Math.min(pool.length-1,rand(0,Math.min(4,pool.length-1)))];
    used.add(`${rr.x},${rr.y}`);return rr;
  }
  function purposeRooms90(z){
    const leaves=[...(state.branchLeaves92||[])],fallback=[...(state.branchRooms92||[])].sort((a,b)=>(b.branchDepth92||0)-(a.branchDepth92||0));const src=leaves.length?leaves:fallback;state.purposeRooms90=[];
    const used=new Set(),wanted=Math.min(6,src.length);for(let i=0;i<wanted;i++){const r=src[i],rk=`${r.x},${r.y}`;if(used.has(rk))continue;used.add(rk);const type=['supply','armory','medic','archive','shrine','trapcache'][(state.floor+z+i*2)%6],cells=roomFreeCells90(r);if(!cells.length)continue;const center=cells.reduce((b,p)=>Math.abs(p.x-r.cx)+Math.abs(p.y-r.cy)<Math.abs(b.x-r.cx)+Math.abs(b.y-r.cy)?p:b,cells[0]),t=purposeTile90(type,z);setTerrainTile58(state.map,center.x,center.y,t);
      if(['supply','armory','archive','trapcache'].includes(type))addItem(r,type!=='supply');if(type==='trapcache'){const q=cells.find(p=>Math.abs(p.x-center.x)+Math.abs(p.y-center.y)>=2);if(q)setTerrainTile58(state.map,q.x,q.y,z===2?TT.SNARE:TT.TRAP)}
      const rr={...r,purpose90:type};state.purposeRooms90.push(rr);feature89(({supply:'보급실',armory:'무기고',medic:'회복실',archive:'기록실',shrine:'제단실',trapcache:'위험 보관실'})[type],r,'purpose');
    }
    state.purposeCount90=state.purposeRooms90.length;
  }
  function guardPurposes90(){
    const mons=(state.monsters||[]).filter(m=>!m.boss&&!m.fixed&&!m.aquatic&&!m.flying);let mi=0,guards=0;
    for(const r of state.purposeRooms90||[]){if(mi>=mons.length)break;if(['medic','kitchen'].includes(r.purpose90))continue;const mon=mons[mi++];let placed=false;for(let rad=0;rad<=3&&!placed;rad++)for(let y=r.cy-rad;y<=r.cy+rad&&!placed;y++)for(let x=r.cx-rad;x<=r.cx+rad;x++){if(PlacementService.monsterCanStand(mon,x,y)){mon.x=x;mon.y=y;mon.alerted=false;guards++;placed=true;break}}}
    state.purposeGuards90=guards;
  }
  function organic91(m,z){
    reset91(m);const target=rand(12,16),cx=Math.floor(COLS/2),cy=Math.floor(ROWS/2);let tries=0;
    // One larger anchor room near, but not exactly at, the center. It is the only deliberately grand volume.
    const gw=Math.min(13,Math.max(10,Math.floor(COLS*.22))),gh=Math.min(10,Math.max(8,Math.floor(ROWS*.22))),gx=clamp(cx-Math.floor(gw/2)+rand(-3,3),2,COLS-gw-3),gy=clamp(cy-Math.floor(gh/2)+rand(-2,2),2,ROWS-gh-3);
    const grand=add89(m,gx,gy,gw,gh,'grand',globalThis.__MANRU_RANDOM57__()<.45?'chamfer':'rect');grand.grand90=true;state.mainRooms90.push(grand);
    while(state.rooms.length<target&&tries++<950){
      const w=rand(6,11),h=rand(5,9),x=rand(2,Math.max(2,COLS-w-3)),y=rand(2,Math.max(2,ROWS-h-3));
      if(roomOverlap91(x,y,w,h,2))continue;
      const roll=globalThis.__MANRU_RANDOM57__(),shape=roll<.14?'chamfer':roll<.21&&w>=9&&h>=7?'cross':'rect',r=add89(m,x,y,w,h,'room',shape);state.mainRooms90.push(r);
    }
    // If random packing under-fills, add compact rooms in the remaining walls.
    for(let t=0;state.rooms.length<10&&t<500;t++){
      const w=6,h=5,x=rand(2,COLS-w-3),y=rand(2,ROWS-h-3);if(roomOverlap91(x,y,w,h,1))continue;const r=add89(m,x,y,w,h,'room','rect');state.mainRooms90.push(r);
    }
    const rooms=[...state.rooms];
    // V7-like nearest-neighbour tree: every room joins its nearest already-connected room.
    const connected=[grand],left=rooms.filter(r=>r!==grand);
    while(left.length){let best=null,bd=1e9,bi=-1,ba=null;for(let i=0;i<left.length;i++)for(const a of connected){const d=Math.abs(left[i].cx-a.cx)+Math.abs(left[i].cy-a.cy);if(d<bd){bd=d;best=left[i];bi=i;ba=a}}if(!best)break;corridor89(m,ba,best,globalThis.__MANRU_RANDOM57__()<.28?'Z':globalThis.__MANRU_RANDOM57__()<.12?'diag':'L');connected.push(best);left.splice(bi,1)}
    // Only local crosslinks: short alternative routes, never one giant outside bypass.
    const pairs=[];for(let i=0;i<rooms.length;i++)for(let j=i+1;j<rooms.length;j++){const a=rooms[i],b=rooms[j],d=Math.abs(a.cx-b.cx)+Math.abs(a.cy-b.cy);if(d>=8&&d<=Math.max(15,Math.floor((COLS+ROWS)*.18)))pairs.push({a,b,d})}
    pairs.sort((a,b)=>a.d-b.d);let links=0;for(const q of pairs){if(links>=rand(2,3))break;if(globalThis.__MANRU_RANDOM57__()<.42)continue;corridor89(m,q.a,q.b,links%2?'Z':'L');links++}
    // Split only several large non-grand rooms; the wall plan does the work instead of decorative clutter.
    const split=[...rooms].filter(r=>r!==grand&&r.w>=9&&r.h>=7).sort((a,b)=>b.w*b.h-a.w*a.h).slice(0,rand(2,4));split.forEach((r,i)=>splitRoom89(m,r,i%2?'h':'v',1));
    // One or two compact annexes in wall pockets, echoing the v7 side-room feel.
    let annex=0;for(let t=0;t<360&&annex<2;t++){
      const w=rand(6,8),h=rand(5,7),x=rand(2,COLS-w-3),y=rand(2,ROWS-h-3);if(roomOverlap91(x,y,w,h,2))continue;
      const r=add89(m,x,y,w,h,'annex','rect');state.mainRooms90.push(r);let near=null,bd=1e9;for(const a of state.rooms){if(a===r)continue;const d=Math.abs(a.cx-r.cx)+Math.abs(a.cy-r.cy);if(d<bd){bd=d;near=a}}if(near)corridor89(m,near,r,globalThis.__MANRU_RANDOM57__()<.5?'Z':'L');annex++;
    }
    state.grandRoom89=grand;const sorted=[...state.rooms].filter(r=>r!==grand).sort((a,b)=>Math.abs(a.cx-grand.cx)+Math.abs(a.cy-grand.cy)-(Math.abs(b.cx-grand.cx)+Math.abs(b.cy-grand.cy)));state.focalRooms89=[sorted[Math.floor(sorted.length*.33)],sorted[Math.floor(sorted.length*.72)]].filter(Boolean);
    feature89('중앙 대실',grand,'grand');state.layoutMode85='v7-organic';state.layoutName='불규칙 객실군 · 근거리 연결 회랑 / 국소 순환 / 부속실';
  }
  function connectVar93(m,a,b,style='L',width=1,options=null){if(options)return connectProfileRooms105(m,a,b,width,options);const da=doorPoint88(a,b),db=doorPoint88(b,a);setTerrainTile58(m,da.x,da.y,TT.DOOR);setTerrainTile58(m,db.x,db.y,TT.DOOR);corridorCell(m,da.ox,da.oy);corridorCell(m,db.ox,db.oy);const pts=pathPoints93({x:da.ox,y:da.oy},{x:db.ox,y:db.oy},style);let lastDir=null;for(const p of pts){if(lastDir&&p.dir!==lastDir&&width>1)carveSquare(m,p.x,p.y,1,!!options);if(options){for(let o=0;o<width;o++)corridorCell(m,p.x+(p.dir==='v'?o:0),p.y+(p.dir==='h'?o:0),true);}else carveBand(m,p.x,p.y,p.dir,width);lastDir=p.dir}if(width>1){carveSquare(m,da.ox,da.oy,1,!!options);carveSquare(m,db.ox,db.oy,1,!!options)}return options?pts:null}
  function placeRooms93(m,z,profile=null){
    if(profile)return placeProfileRooms105(m,profile);
    const rooms=[],target=state.floor===1?rand(10,13):rand(15,20),cx=Math.floor(COLS/2),cy=Math.floor(ROWS/2);let tries=0;
    if(state.floor===1||globalThis.__MANRU_RANDOM57__()<.34){const gw=rand(11,15),gh=rand(7,10),gx=clamp(cx-Math.floor(gw/2)+rand(-6,6),2,COLS-gw-3),gy=clamp(cy-Math.floor(gh/2)+rand(-5,5),state.floor===1?17:2,ROWS-gh-3);if(canPlace93(gx,gy,gw,gh,2)){const g=addCompact93(m,gx,gy,gw,gh,'grand',globalThis.__MANRU_RANDOM57__()<.35?'chamfer':'pillars','hall');g.grand90=true;state.grandRoom89=g;if(state.floor===1){g.name='등불 대청';for(let yy=g.y+1;yy<g.y+g.h-1;yy++)for(let xx=g.x+1;xx<g.x+g.w-1;xx++)if(m[yy][xx]===TT.FLOOR)setTerrainTile58(m,xx,yy,Math.abs(xx-g.cx)<=1?TT.CARPET:(yy===g.y+1||yy===g.y+g.h-2)?TT.STONE_PATH:TT.WOOD_FLOOR);for(const xx of [g.x+2,g.x+g.w-3])for(const yy of [g.y+2,g.y+g.h-3])if(terrainSurface58(m[yy][xx]))setTerrainTile58(m,xx,yy,TT.LANTERN_POST)}rooms.push(g)}}
    if(globalThis.__MANRU_RANDOM57__()<.48){const wide=globalThis.__MANRU_RANDOM57__()<.58,w=wide?rand(11,15):rand(5,7),h=wide?rand(4,6):rand(9,12),x=clamp(cx-Math.floor(w/2)+rand(-9,9),2,COLS-w-3),y=clamp(cy-Math.floor(h/2)+rand(-8,8),2,ROWS-h-3);if(canPlace93(x,y,w,h,1))rooms.push(addCompact93(m,x,y,w,h,'hall',globalThis.__MANRU_RANDOM57__()<.28?'chamfer':'rect','hall'))}
    while(rooms.length<target&&tries++<1600){
      let w,h,shape='rect',role='room';const roll=globalThis.__MANRU_RANDOM57__();
      if(roll<.14){w=rand(11,15);h=rand(4,6);role='hall';shape=globalThis.__MANRU_RANDOM57__()<.25?'chamfer':'rect';}
      else if(roll<.22){w=rand(5,7);h=rand(9,12);role='hall';shape='rect';}
      else{w=rand(6,11);h=rand(5,9);shape=roll<.34?'chamfer':roll<.41&&w>=9&&h>=7?'cross':roll<.48&&w>=9&&h>=8?'pillars':'rect'}
      let x,y;
      if(rooms.length<3||globalThis.__MANRU_RANDOM57__()<.22){x=rand(2,Math.max(2,COLS-w-3));y=rand(2,Math.max(2,ROWS-h-3));}
      else{const seed=choice(rooms),rx=seed.cx+rand(-13,13)-Math.floor(w/2),ry=seed.cy+rand(-10,10)-Math.floor(h/2);x=clamp(rx,2,COLS-w-3);y=clamp(ry,2,ROWS-h-3)}
      if(!canPlace93(x,y,w,h,role==='hall'?1:1))continue;
      if(rooms.length>=4){let near=1e9;for(const r of rooms)near=Math.min(near,Math.abs((x+Math.floor(w/2))-r.cx)+Math.abs((y+Math.floor(h/2))-r.cy));if(near>(role==='hall'?20:18)+(z>=3?2:0))continue}
      rooms.push(addCompact93(m,x,y,w,h,role==='hall'?'hall':'room',shape,role));
    }
    for(let t=0;rooms.length<(state.floor===1?10:13)&&t<1350;t++){const w=globalThis.__MANRU_RANDOM57__()<.3?rand(9,13):6,h=globalThis.__MANRU_RANDOM57__()<.3?rand(4,6):5,x=rand(2,COLS-w-3),y=rand(2,ROWS-h-3);if(!canPlace93(x,y,w,h,1))continue;rooms.push(addCompact93(m,x,y,w,h,'room','rect',w>=9||h>=8?'hall':'room'))}
    return rooms;
  }
  function softenRooms93(m,rooms,edges){
    const deg=Array(rooms.length).fill(0);for(const e of edges){deg[e.a]++;deg[e.b]++;}
    rooms.forEach((r,i)=>{if(deg[i]>=3&&r.w>=7&&r.h>=6){for(let yy=r.cy-1;yy<=r.cy+1;yy++)for(let xx=r.cx-1;xx<=r.cx+1;xx++)if(insideMapInterior(xx,yy)&&m[yy][xx]!==TT.WALL)setTerrainTile58(m,xx,yy,TT.FLOOR)}
      if(globalThis.__MANRU_RANDOM57__()<.24&&r.w>=8&&r.h>=7){const side=rand(0,3);if(side===0&&r.y>2)for(let yy=r.y-2;yy<r.y;yy++)for(let xx=r.cx-1;xx<=r.cx+1;xx++)if(m[yy][xx]===TT.WALL)setTerrainTile58(m,xx,yy,TT.FLOOR);else if(side===1&&r.y+r.h<ROWS-2)for(let yy=r.y+r.h;yy<=r.y+r.h+1;yy++)for(let xx=r.cx-1;xx<=r.cx+1;xx++)if(m[yy][xx]===TT.WALL)setTerrainTile58(m,xx,yy,TT.FLOOR);else if(side===2&&r.x>2)for(let xx=r.x-2;xx<r.x;xx++)for(let yy=r.cy-1;yy<=r.cy+1;yy++)if(m[yy][xx]===TT.WALL)setTerrainTile58(m,xx,yy,TT.FLOOR);else if(side===3&&r.x+r.w<COLS-2)for(let xx=r.x+r.w;xx<=r.x+r.w+1;xx++)for(let yy=r.cy-1;yy<=r.cy+1;yy++)if(m[yy][xx]===TT.WALL)setTerrainTile58(m,xx,yy,TT.FLOOR);}
    })
  }
  function strictLockFloors(){return [...new Set([...LOCK_SPECIAL.keys(),...LOCK_NORMAL.keys()])]}
  const floorSet980=new Set([TT.FLOOR,TT.GRASS,TT.LIGHT_GRASS,TT.CARPET,TT.STONE_PATH,TT.WOOD_FLOOR,TT.MOON_STONE,TT.DARK_WOOD,TT.GILDED_FLOOR,TT.PAPER_BRIDGE,TT.GOLD,TT.PORTAL]);
  function floor21Stand981(x,y,opt={}){
    if(!in980(x,y))return false;const t=tileReveal981(x,y,opt);
    // 21F generation must never pass merely because the current run happens to carry a temporary hazard ward.
    if([TT.VOID,TT.WATER,TT.LAVA,TT.MERCURY].includes(t))return false;
    return ReachabilityService.playerTerrainPassable(x,y,{...opt,tileAt:(x,y)=>tileReveal981(x,y,opt)});
  }
function enclosedRoomScore1026(r){
  if(!r||r.w<8||r.h<6||r.w>38||r.h>28||roomTouchesProtected(r))return null;
  const q=roomProbe1026(r);if(!q||q.area<48||q.area>520)return null;
  // Only open interior plates are candidates. Existing furniture/partitions win over this pass.
  if(q.openRatio<.61||q.wallRatio>.105||q.specialRatio>.25)return null;
  const named=!!(r.name||r.label||r.append1020),indoorName=/객실|서고|보존|창고|장고|가옥|오두막|본관|내실|실내|연회|공방|병기|숙소|회랑실/.test(r.name||r.label||''),enclosed=q.enclosure>=.24||q.indoorRatio>=.36||indoorName||(named&&q.enclosure>=.16);
  return enclosed?q:null;
}
const MOVE_HOOKS={pre:[blockWhileZooming,blockWhileModalOpen,blockWhileCooking,moveCoachTip,resumeCameraOnMove],post:[markMoveDirty,clearInvalidAim,footstepFeedback,alertOnDoorOpen,trackManualMoves]};
function resolveOccupancyInteraction57(actor,target){
  if(!occupancySwapAllowed57(actor,target))return false;
  const ax=actor.x,ay=actor.y,tx=target.x,ty=target.y;
  OccupancyService.move(target,ax,ay);resolvePlayerLanding57(tx,ty,{cause:'ally-swap'});globalThis.__MANRU_HAZARD_CORE__?.standing?.(target,'ally-swap');return true
}
  function qaPickupProgressKey23_60(){
    if(state.floor!==23)return{ok:false,reason:'not-f23'};const item=(state.items||[]).find(i=>i.type==='progress_key23');if(!item)return{ok:false,reason:'missing-progress-key'};
    state.player.x=item.x;state.player.y=item.y;OccupancyService.move(state.player,state.player.x,state.player.y);const picked=pickupBaseR25();return{ok:!!picked&&!!state.floor23?.keyAcquired,picked:!!picked,keyAcquired:!!state.floor23?.keyAcquired};
  }
  function qaDescend60(){
    if(!state?.stairs)return{ok:false,reason:'no-stairs'};const from=state.floor,beforeOwner=gameplayInputOwner57().kind;closeGameplayInteractionState57();const pre={run:runState57(),input:gameplayInputAllowed57(),stun:state.status?.stun||0,dead:!!state.dead,victory:!!state.victory,beforeOwner,owner:gameplayInputOwner57().kind};state.player.x=state.stairs.x;state.player.y=state.stairs.y;OccupancyService.move(state.player,state.player.x,state.player.y);const result=descend();return{ok:!!result&&state.floor===from+1,result:!!result,from,to:state.floor,pre};
  }
  const BLOCK85=new Set([TT.STONE_PILLAR,TT.LANTERN_POST,TT.WALL_BANNER,TT.CRATE,TT.BENCH,TT.FLOWERBED,TT.ROCK,TT.STATUE,TT.RACK,TT.LOW_FENCE,TT.WINDOW,TT.GARDEN_TREE,TT.RUMOR_BED,TT.RUMOR_MED_CABINET,TT.RUMOR_GAS_PIPE,TT.RUMOR_ARCHIVE_PILE,TT.RUMOR_WEAPON_RACK,TT.RUMOR_SILK_DIVAN,TT.RUMOR_RITUAL_OBELISK,TT.RUMOR_CHARRED_COUNTER,TT.RUMOR_INVESTIGATION_BOARD,TT.RUMOR_SMUGGLER_BUNDLE,TT.RUMOR_GREENHOUSE_FRAME,TT.BED,TT.BOOK_STACK]);
  function clear88(m){for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)setTerrainTile58(m,x,y,TT.WALL);state.rooms=[]}
  function relocateEntities89(savedMonsters,savedItems){
    state.monsters=[];
    for(const mon of savedMonsters||[]){
      if(mon.boss)continue;const pos=PlacementService.randomMonsterCell(mon);if(pos){mon.x=pos.x;mon.y=pos.y;mon.alerted=false;OccupancyService.addMonster(mon)}
    }
    const used=new Set();state.items=[];
    const candidates=[];for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++)if(ReachabilityService.playerPassable(x,y)&&state.map[y][x]!==TT.STAIR&&!(x===state.player.x&&y===state.player.y)&&!OccupancyService.isOccupied(x,y))candidates.push({x,y});
    for(const it of savedItems||[]){if(!candidates.length)break;let idx=Math.floor(globalThis.__MANRU_RANDOM57__()*candidates.length),pos=candidates.splice(idx,1)[0];it.x=pos.x;it.y=pos.y;PlacementService.placeItem(it);used.add(pos.x+','+pos.y)}
  }
  function shortestNodes93(adj,s,t){const q=[s],prev=Array(adj.length).fill(-2);prev[s]=-1;for(let i=0;i<q.length;i++){const u=q[i];if(u===t)break;for(const v of adj[u])if(prev[v]===-2){prev[v]=u;q.push(v)}}if(prev[t]===-2)return[];const out=[];for(let u=t;u!==-1;u=prev[u])out.push(u);return out.reverse()}
  function farNode93(adj,s){const q=[s],d=Array(adj.length).fill(-1);d[s]=0;for(let i=0;i<q.length;i++){const u=q[i];for(const v of adj[u])if(d[v]<0){d[v]=d[u]+1;q.push(v)}}let b=s;for(let i=0;i<d.length;i++)if(d[i]>d[b])b=i;return{node:b,dist:d[b],d}}
  const plannedSet980=new Set([TT.FLOOR,TT.GRASS,TT.LIGHT_GRASS,TT.CARPET,TT.STONE_PATH,TT.WOOD_FLOOR,TT.MOON_STONE,TT.DARK_WOOD,TT.GILDED_FLOOR,TT.PAPER_BRIDGE,TT.DRAWBRIDGE_DOWN,TT.RAFT,TT.STAIR,TT.DOOR,TT.OPEN_DOOR,TT.LOCKED_GATE,TT.KEY_TILE,TT.PAVILION,TT.FLOOR,TT.GOLD,TT.PORTAL]);
  const IMMUTABLE_TILES=new Set([TT.STAIR,TT.LOCKED_GATE,TT.KEY_TILE,TT.SECRET_DOOR,TT.HIDDEN_BRIDGE,TT.HIDDEN_WALL,TT.CRUMBLE]);
function closeGameplayInteractionState57(opts={}){cancelAutoWalk();for(const panel of activeGameplayPanels57())panel.close?.(opts.preserveProgress&&panel.id==='storyModal992'?{preserveProgress:true}:true);globalThis.__MANRU_ITEM_IDENTITY991__?.closeSkillQuick?.();clearHeldInput53();projectInteractionUI();return true}
function neutralInteractableAt58(x,y){return(state?.neutralInteractables58||[]).find(n=>n.x===x&&n.y===y)||null}
function descend(){
  cancelAutoWalk();
  if(state?.branchContext105){toast('분기에서는 문 옆에서 상호작용 버튼(F)으로 출입한다.');return false}
  const act=playerAction57('descend',{stunMessage:'몸이 굳어 층을 내려가지 못했다.'});
  if(!act.ok)return !!act.consumed;
  if(state.player.x!==state.stairs.x||state.player.y!==state.stairs.y){toast('다음 층으로 이어지는 문 위에서 사용해야 한다.');return false}
  if(!state.shopIntermission?.active&&[5,10,15,20].includes(state.floor)&&!state.bossDefeated){toast('구역 보스를 쓰러뜨려야 길이 열린다.');return false}
  if(state.floor===23&&!state.floor23?.keyAcquired){toast('수은 심부 열쇠가 있어야 다음 층으로 내려갈 수 있다.');return false}
  if(state.floor>=25){toast('더 안쪽은 만루보주의 방뿐이다.');return false}
  if(!state.shopIntermission?.active&&[5,10,15,20].includes(state.floor))return ShopMapBuilder.enter();
  const lifecycleGeneration6=RunLifecycle.generation(),fromFloor=state.floor,leavingShop57=!!state.shopIntermission?.active,descentSnapshot57=captureGenerationSnapshot();
  const generateNext57=()=>{
    if(!RunLifecycle.isCurrent(lifecycleGeneration6))return false;
    try{
      const followers=summonFollowers();if(state.shopIntermission?.active)ShopMapBuilder.restore();resetFloorScopedState57();state.floor++;state.player.hp=Math.min(state.player.maxHp,state.player.hp+Math.ceil(state.player.maxHp*.12));state.player.focus=Math.min(getStats().maxFocus,state.player.focus+2);NormalFloorGenerator.generate();summonPlaceFollowers105(followers);branchPruneWorld(state);
    }catch(e){
      restoreGenerationSnapshot(descentSnapshot57);resetVisualState();resetTurnState();VisibilityService.compute();setGenerationPresentation8(false);updateAll();console.error('descend generation rejected',e);toast('다음 층의 구조가 불안정해 이동하지 못했다.');return false
    }
    try{
      resetVisualState();resetTurnState();startFloorTransition();addLog(`제 ${state.floor}층으로 들어섰다.`);runDescendEffects(fromFloor);
      if(leavingShop57){
        // Present the new map before releasing the shop-exit input lock.
        syncGameViewport();globalThis.__MANRU_CAMERA_STATE12__?.resume?.(true);updateAll(true);
      }else updateAll();
      globalThis.__MANRU_SAVE_SERVICE__?.request?.();return true;
    }finally{setGenerationPresentation8(false)}
  };
  if(leavingShop57||fromFloor===21){
    cancelAutoWalk();clearHeldInput53();setGenerationPresentation8(true);
    requestAnimationFrame(()=>requestAnimationFrame(generateNext57));
    return true
  }
  return generateNext57()
}
/* ===== MANRU v10.0.4 ROUTE/Hazard REWORK (rolled back from v10.0.5 map branch) ===== */
const WARD_DROWN={name:'용왕의 숨비늘',type:'relic',rarity:'relic',def:2,will:2,focus:2,drownWard1005:true,identified:true,ability:'익사 대체 · 10턴 수중 생존',desc:'DEF +2 · WILL +2 · FOCUS +2. 익사할 상황에서 자동으로 부서져 죽음을 막고 10턴 동안 익사를 막는다. 단, 바로 붙잡을 뭍이 있으면 유물보다 뭍을 먼저 붙잡는다.'};
const WARD_VOID={name:'공허닻 파편',type:'relic',rarity:'sealed',def:2,eva:2,will:2,voidWard1005:true,identified:true,ability:'공허 추락 대체 · 10턴 공허 생존',desc:'DEF +2 · EVA +2 · WILL +2. 공허로 추락할 때 자동으로 소모되어 죽음을 막고 10턴 동안 공허에 발을 디딜 수 있게 한다.'};
globalThis.__MANRU_GEN_RNG57__=Object.freeze({begin:RngService.begin,end:RngService.end,random:RngService.random,state:RngService.state});
globalThis.__MANRU_RANDOM57__=()=>RngService.random();
globalThis.__MANRU_ROOM_GEOMETRY105__=Object.freeze({generate:graphOrganic93});
globalThis.__MANRU_GENERATE_CORE983__=NormalGenerationStages.riverAndCore;
function resetFloorScopedState57(){if(!state)return;state.terrainReactions105=newTerrainReactions105();state.martialEcho=null;state.player.smokeInside1005=false;state.recentPlayerCells57=[];state.naturalPopulation57=null;state.noiseSequence57=null;noiseBudget=null;state.silkTraps57={};delete state.tutorialEntry60;delete state.floor23;delete state.floor24;for(const key of ['tempFields','tempTerrain74','elementFields74','legendFireFields47','legendTerrain47','legendSkyAxes47','artifactFields46','gazeBursts57','jarGasFields57'])if(Array.isArray(state[key]))state[key]=[];state._manualRangedTargetR8=null;state._manualTerrainTargetR8=null;state._lastPlayerPos60=null;state.crumbleBase60={};if(state.hazard1005){const drown=state.hazard1005?.drownUntil||0,voidWard=state.hazard1005?.voidUntil||0;state.hazard1005={armed:{},collapsed:{},lastWarn:{},drownUntil:drown,voidUntil:voidWard}}}
function runDescendEffects(fromFloor){if(!state||state.floor===fromFloor)return;for(const effect of DESCEND_EFFECTS)effect({fromFloor,toFloor:state.floor})}
const DESCEND_EFFECTS=[stairsSound,markActionTime];
  const V981={version:'v9.8.1-fixed-map-portal-reachability',errors:[],repairs:[],portalBuilds:0};
function portalsDrawMinimap({sx,sy}){if(state?.portalLinks981){MX.fillStyle='#c58be9';for(const id of Object.keys(state.portalLinks981)){const[x,y]=id.split(',').map(Number);if(state.seen.has(key980(x,y)))MX.fillRect(x*sx,y*sy,Math.max(2,sx),Math.max(2,sy))}}}
function featureRoomsPostGeneration(){applyFeatureRooms();VisibilityService.compute();vfBuildDecor()}
function strategyPostGeneration(){return applyStrategy()}
function guardPrePreGeneration(){state.guardRooms59=[];state.layoutMode59=null}
function specialPrePreGeneration(){state.featureRooms=[];state.landmarks=[];state.guardRooms59=[];state.hiddenGroups60={};state.hiddenLookup60={};state.hiddenBase60={};state.hiddenReplacement60={};state.crumbleBase60={}}
function regionPrePreGeneration(){state.landmarks71=[];state.landmarkCells71={};state.regionComplex71=null}
function regionPostPostGeneration(){enhanceNormal71();enhanceSpecial71();ensureNormalConnectivity();repairEntities71();VisibilityService.compute();vfBuildDecor();;}
function runtimePostGeneration(){Integrity81.repair();ConnectedDecor81.build();queuePlace81()}
function qualityPrePreGeneration(){state.keyTrial94=null;state.outerWall94={};state.itemBiasZones94=[];state.itemBiasMoved94=0;state.coherentDecorCount94=0;state.choiceSideRooms95=0;state.roomGraph93=null;state.roomGraph92=null;state.roomTemplate93=null;state.roomTemplate92=null}
function buildNormal(m,z){state.fixedStart=null;state.fixedExit=null;state.routeTags=[];state.featureRooms=[];state.layoutMode85=null;state.themedRooms87=[];state.__arch93=++V93.serial;graphOrganic93(m,z);state.layoutName=['청풍루','수묵원','유혹의 내실','지하 장고','만루의 심장'][z]+' · '+state.layoutName;}
