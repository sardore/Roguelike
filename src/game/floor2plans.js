/* Floor 2: the plans of its four candidate structures (see buildFloor2Maze in mapgen.js, which turns a plan into the map).
   Every plan has the same skeleton - a start hall at the bottom, a first hall with the first choice (a key opens one of two doors), the two
   regions of the first choice side by side, a middle hall with the second choice, the two regions of the second choice, the end hall with the
   stairs - and differs in what lies in the four regions: their paths, the rooms off the paths, the water, the furniture, who waits where, what lies
   where. A region is a path from its door to its gate; the way through is the whole path, the rooms off it are dead ends that hold guards and
   rewards. Through the windows of the walls between a hall and the paths the player sees along the first stretch of a path before choosing
   its door; the region that has no window is the unknown one.
   A plan: {name, tag, floors, widths, paths, chambers, doors, pools, ponds, stones, spurs, water, props, encounters, rewardSpots, bonus, windows, tags,
   chamberFloor, bell}. paths are lists of corners (axis-aligned runs) and end on the gate of the region; chambers are open rectangles
   {x,y,w,h,route}, doors single cells in the wall between a chamber and a path. Regions: 0 west and low (danger), 1 east and low (safe),
   2 west and high (safe), 3 east and high (unknown). */
const FLOOR2_LOOP=(nx,far,outRow,backRow,endRow)=>[[nx,outRow],[far,outRow],[far,backRow],[nx,backRow],[nx,endRow]];
// rooms along a path: for every [x,w] a chamber of height h at row y, with its door at row doorY above or below it
const FLOOR2_ROOMS=(route,y,h,doorY,specs)=>({chambers:specs.map(([x,w])=>({x,y,w,h,route})),doors:specs.map(([x,w])=>[x+Math.floor(w/2),doorY])});
const FLOOR2_PLANS=Object.freeze([
  // 0 village: alleys of stalls and houses; a bell in the middle hall lowers the bridges of a road up the middle and wakes the legion commander
  (cx)=>{
    const a=FLOOR2_ROOMS(0,30,2,32,[[7,7],[18,8],[30,6]]),b=FLOOR2_ROOMS(0,26,3,25,[[9,8],[24,9]]),c=FLOOR2_ROOMS(3,14,3,17,[[52,8],[64,7],[74,6]]),d=FLOOR2_ROOMS(3,11,2,10,[[56,8],[70,9]]);
    return{
      name:'저잣골목 마을 · 골목집과 노점, 가운데 길의 종',tag:'마을',
      floors:[TT.DARK_WOOD,TT.STONE_PATH,TT.STONE_PATH,TT.FLOOR],widths:[1,3,3,1],chamberFloor:TT.WOOD_FLOOR,laneDecor:[TT.LANTERN_POST,TT.FLOWERBED,TT.BENCH],
      paths:[FLOOR2_LOOP(cx-5,4,33,24,22),[[cx+5,33],[cx+5,32],[70,32],[70,25],[cx+5,25],[cx+5,22]],[[cx-5,18],[cx-5,17],[16,17],[16,10],[cx-5,10],[cx-5,7]],FLOOR2_LOOP(cx+5,82,18,9,7)],
      chambers:[...a.chambers,...b.chambers,{x:55,y:27,w:11,h:3,route:1},{x:22,y:12,w:11,h:3,route:2},...c.chambers,...d.chambers],
      doors:[...a.doors,...b.doors,...c.doors,...d.doors],pools:[],ponds:[{x:57,y:27,w:5,h:2}],stones:[],spurs:[],
      water:[],props:[
        [9,31,TT.TABLE],[19,31,TT.JAR],[24,31,TT.CRATE],[32,31,TT.RACK],[11,27,TT.BENCH],[26,27,TT.TABLE],[30,27,TT.JAR],
        [59,28,TT.FLOWERBED],[56,29,TT.LANTERN_POST],[64,29,TT.LANTERN_POST],[24,13,TT.BENCH],[27,13,TT.FLOWERBED],[30,13,TT.LANTERN_POST],
        [54,15,TT.TABLE],[66,15,TT.CRATE],[76,15,TT.JAR],[58,12,TT.RACK],[73,12,TT.TABLE],[38,31,TT.LANTERN_POST],[48,29,TT.LANTERN_POST],
        [10,33,TT.TRAP],[27,33,TT.TRAP],[60,18,TT.SNARE]],
      encounters:{0:[{x:30,y:33,names:['취객','시종']},{x:10,y:30,names:['떠돌이 도둑']},{x:28,y:27,names:['취객','시종']},{x:13,y:27,names:['객잔 경비병']}],
        3:[{x:62,y:18,names:['떠돌이 도둑','객잔 쥐']},{x:67,y:15,names:['시종']},{x:60,y:12,names:['떠돌이 도둑']},{x:74,y:12,names:['시종']}]},
      rewardSpots:{0:[{x:20,y:30},{x:32,y:31},{x:27,y:28}],1:[{x:58,y:29},{x:63,y:28}],2:[{x:26,y:13},{x:29,y:14}],3:[{x:77,y:15},{x:58,y:11},{x:70,y:12}]},
      bonus:[6,2,2,5],
      windows:[[cx-8,34],[cx-14,34],[cx+8,34],[cx+14,34],[cx-8,19],[cx-14,19]],
      tags:[[cx-5,35,'창으로 골목이 보인다 · 위험한 복도'],[cx+5,35,'등불 켜진 큰길 · 안전한 복도'],[cx+5,20,'창 없는 뒷길 · 미지의 복도']],
      bell:{x:cx+3,y:21,commander:[cx+10,21],route:[[30,36],[56,36],[34,21],[52,21]]}
    };
  },
  // 1 great well: pools with islands; the dangerous region is a reservoir whose islands are reached by stepping stones
  (cx)=>{
    const c=FLOOR2_ROOMS(2,12,2,11,[[20,4],[26,6]]);
    return{
      name:'거대 우물 · 수조 저장고와 징검돌 섬',tag:'우물',
      floors:[TT.STONE_PATH,TT.STONE_PATH,TT.STONE_PATH,TT.FLOOR],widths:[1,3,3,1],chamberFloor:TT.STONE_PATH,laneDecor:[TT.LANTERN_POST,TT.FLOWERBED],
      paths:[FLOOR2_LOOP(cx-5,4,33,24,22),[[cx+5,33],[cx+5,32],[70,32],[70,25],[cx+5,25],[cx+5,22]],[[cx-5,18],[cx-5,17],[14,17],[14,10],[cx-5,10],[cx-5,7]],
        [[cx+5,18],[82,18],[82,15],[50,15],[50,12],[82,12],[82,9],[cx+5,9],[cx+5,7]]],
      chambers:[{x:12,y:27,w:6,h:3,route:0},{x:26,y:27,w:7,h:3,route:0},{x:20,y:26,w:5,h:2,route:0},{x:58,y:27,w:4,h:2,route:1},...c.chambers,{x:83,y:16,w:2,h:2,route:3},{x:83,y:10,w:2,h:2,route:3}],
      doors:[],ponds:[],pools:[{x:6,y:25,w:31,h:8},{x:54,y:27,w:12,h:3},{x:20,y:12,w:12,h:3},{x:50,y:16,w:33,h:2},{x:50,y:13,w:33,h:2},{x:50,y:10,w:33,h:2}],
      stones:[[14,30,0],[14,31,0],[14,32,0],[29,30,0],[29,31,0],[29,32,0],[22,25,0],[66,16,3],[66,17,3],[70,10,3],[70,11,3]],spurs:[],
      water:[],props:[
        [14,28,TT.LANTERN_POST],[30,28,TT.STATUE],[21,27,TT.ROCK],[59,27,TT.LANTERN_POST],[60,28,TT.FLOWERBED],[22,13,TT.LANTERN_POST],[30,13,TT.FLOWERBED],
        [10,33,TT.TRAP],[60,18,TT.SNARE],[70,15,TT.TRAP],[56,12,TT.TRAP]],
      encounters:{0:[{x:30,y:33,names:['취객','시종']},{x:15,y:28,names:['객잔 경비병']},{x:29,y:28,names:['떠돌이 도둑']},{x:12,y:24,names:['취객','시종']}],
        3:[{x:70,y:18,names:['떠돌이 도둑','객잔 쥐']},{x:60,y:15,names:['시종']},{x:76,y:12,names:['떠돌이 도둑']},{x:64,y:9,names:['시종']}]},
      rewardSpots:{0:[{x:15,y:29},{x:30,y:29},{x:22,y:27}],1:[{x:59,y:28},{x:60,y:27}],2:[{x:21,y:12},{x:28,y:13}],3:[{x:84,y:16},{x:84,y:10},{x:76,y:15}]},
      bonus:[6,2,2,5],
      windows:[[cx-8,34],[cx-14,34],[cx+8,34],[cx+14,34],[cx-8,19],[cx-14,19]],
      tags:[[cx-5,35,'창 너머 수조와 섬이 보인다 · 위험한 복도'],[cx+5,35,'연못 정원 · 안전한 복도'],[cx+5,20,'창 없는 수로 · 미지의 복도']],
      bell:null
    };
  },
  // 2 garrison: barracks and guard posts with iron-bound doors across the paths
  (cx)=>{
    const a=FLOOR2_ROOMS(0,30,2,32,[[8,7],[19,6],[28,7]]),b=FLOOR2_ROOMS(0,26,3,25,[[10,8],[23,9]]),c=FLOOR2_ROOMS(3,14,3,17,[[52,8],[63,8],[74,7]]),d=FLOOR2_ROOMS(3,11,2,10,[[56,7],[68,8],[78,5]]);
    return{
      name:'경비 병영 · 초소 문이 가로막는 병사 길',tag:'병영',
      floors:[TT.DARK_WOOD,TT.STONE_PATH,TT.STONE_PATH,TT.DARK_WOOD],widths:[1,3,3,1],chamberFloor:TT.WOOD_FLOOR,laneDecor:[TT.RACK,TT.LANTERN_POST],
      paths:[FLOOR2_LOOP(cx-5,4,33,24,22),[[cx+5,33],[cx+5,32],[66,32],[66,25],[cx+5,25],[cx+5,22]],[[cx-5,18],[cx-5,17],[20,17],[20,10],[cx-5,10],[cx-5,7]],FLOOR2_LOOP(cx+5,82,18,9,7)],
      chambers:[...a.chambers,...b.chambers,{x:54,y:27,w:10,h:3,route:1},{x:26,y:12,w:8,h:3,route:2},...c.chambers,...d.chambers],
      doors:[...a.doors,...b.doors,...c.doors,...d.doors,[26,33],[14,33],[18,24],[66,18],[72,9]],pools:[],ponds:[{x:57,y:28,w:5,h:1}],stones:[],spurs:[],
      water:[],props:[
        [9,31,TT.BED],[10,31,TT.BED],[20,31,TT.RACK],[29,31,TT.BED],[30,31,TT.BED],[12,27,TT.RACK],[15,27,TT.RACK],[26,27,TT.TABLE],[29,27,TT.BENCH],
        [56,28,TT.RACK],[59,28,TT.RACK],[62,28,TT.LANTERN_POST],[28,13,TT.RACK],[31,13,TT.LANTERN_POST],[53,15,TT.BED],[64,15,TT.CRATE],[75,15,TT.RACK],
        [57,11,TT.BED],[69,11,TT.TABLE],[38,31,TT.LANTERN_POST],[48,29,TT.LANTERN_POST]],
      encounters:{0:[{x:32,y:33,names:['객잔 경비병','객잔 경비병']},{x:11,y:30,names:['객잔 경비병','시종']},{x:14,y:27,names:['객잔 경비병','객잔 경비병']},{x:28,y:24,names:['객잔 경비병','시종']},{x:8,y:24,names:['객잔 경비병']}],
        3:[{x:62,y:18,names:['떠돌이 도둑','객잔 경비병']},{x:66,y:15,names:['객잔 경비병']},{x:60,y:11,names:['객잔 경비병','시종']},{x:78,y:9,names:['떠돌이 도둑']}]},
      rewardSpots:{0:[{x:20,y:30},{x:30,y:31},{x:25,y:27}],1:[{x:57,y:28},{x:61,y:29}],2:[{x:29,y:13},{x:32,y:14}],3:[{x:76,y:15},{x:59,y:11},{x:80,y:10}]},
      bonus:[6,2,2,5],
      windows:[[cx-8,34],[cx-14,34],[cx+8,34],[cx+14,34],[cx-8,19],[cx-14,19]],
      tags:[[cx-5,35,'창 너머 병사들이 보인다 · 위험한 복도'],[cx+5,35,'군수 창고 길 · 안전한 복도'],[cx+5,20,'창 없는 초소 뒤 · 미지의 복도']],
      bell:null
    };
  },
  // 3 the old floor, as it was: three bends and ambush chambers, one narrow window for each choice but the unknown
  (cx,v)=>({
    name:'옛 2층 · 삼중 굽이와 매복 측실',tag:'옛 2층',
    floors:[TT.CARPET,TT.STONE_PATH,TT.STONE_PATH,TT.FLOOR],widths:[1,3,3,1],chamberFloor:TT.FLOOR,
    paths:[
      [[cx-5,33],[5,33],[5,29],[17,29],[17,31],[29,31],[29,27],[5,27],[5,23],[cx-5,23],[cx-5,22]],
      [[cx+5,33],[53+v,33],[53+v,29],[66,29],[66,24],[cx+5,24],[cx+5,22]],
      [[cx-5,18],[24-v,18],[24-v,14],[10,14],[10,9],[cx-5,9],[cx-5,7]],
      [[cx+5,18],[78,18],[78,14],[65,14],[65,16],[53,16],[53,12],[78,12],[78,8],[cx+5,8],[cx+5,7]]],
    chambers:[{x:1,y:24,w:3,h:3,route:0},{x:39,y:29,w:5,h:3,route:0},{x:80,y:14,w:4,h:3,route:3},{x:44,y:10,w:5,h:2,route:3}],
    spurs:[{route:0,points:[[5,25],[2,25]]},{route:0,points:[[29,27],[41,27],[41,30]]},{route:3,points:[[78,15],[82,15]]},{route:3,points:[[53,12],[48,12],[48,10]]}],
    doors:[[4,25],[41,28],[79,15],[49,12]],pools:[],ponds:[],stones:[],
    water:[[9,22,32],[45,65,26],[11,23,16],[49,66,7]],
    props:[[1,24,TT.ARMORY],[39,29,TT.CRATE],[43,29,TT.TABLE],[80,14,TT.INCENSE_STAND],[83,16,TT.RACK],[55,25,TT.LANTERN_POST],[62,28,TT.BENCH],[16,10,TT.LANTERN_POST],[22,17,TT.PAPER_CRANE],[10,33,TT.TRAP],[23,31,TT.TRAP],[71,18,TT.SNARE],[53,14,TT.TRAP]],
    encounters:{0:[{x:31,y:33,names:['취객','시종']},{x:9,y:29,names:['떠돌이 도둑']},{x:26,y:27,names:['취객','시종']},{x:41,y:30,names:['객잔 경비병']}],
      3:[{x:71,y:18,names:['떠돌이 도둑','객잔 쥐']},{x:58,y:16,names:['시종']},{x:46,y:10,names:['떠돌이 도둑']},{x:82,y:15,names:['시종']}]},
    rewardSpots:{0:[{x:2,y:25},{x:41,y:31},{x:20,y:31}],3:[{x:82,y:15},{x:46,y:10},{x:57,y:16}]},
    bonus:[6,0,0,5],
    windows:[[cx-8,34],[cx+8,34],[cx-8,19]],
    tags:[[cx-5,35,'피 묻은 창호 · 위험한 복도'],[cx+5,35,'등불 켜진 창호 · 안전한 복도'],[cx+5,20,'창 없는 회랑 · 미지의 복도']],
    bell:null
  })
]);
