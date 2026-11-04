/* The arenas of the ghost duel (docs/GHOST_BATTLE.md). The place is the underworld (저승): dark indigo stone and carpet under blue soul-fire, with purple
   kept as the second colour (the palette `duel` of ART60 in render.js). Small (21 x 21 at most: the two players answer each other turn by turn and a big map
   drags), drawn by hand and mirror-symmetric left to right, so that neither side has the better ground: the east half is the west half turned round.
   Glyphs are those of GRAND_VAULT_SURFACE / GRAND_VAULT_PROP in terrain.js; the underworld furniture is U the soul lamp (혼등), N the stele of the register
   (명부비석), Y the spider lilies (피안화), O the cairn of the lost (넋돌탑), Q the bell (명종). Three marks are not tiles: 'A' where the host stands, 'B' where
   the guest stands (both are ground) and 'D' the door in the middle of the top wall, which stays shut until a fight is won (it is a wall until then).
   `spawns` and `door` give the same cells as [x, y]. Stele and screens block the sight, lilies and the rest block only the way; stepping stones ('=') and shallow
   water do not block. Every furniture glyph has its name and description in the tables of world.js and monsters.js (tests/tools/duel-arenas.test.mjs checks it). */
const DUEL_ARENAS=Object.freeze([
  {name:"황천 나루",ground:"STONE_PATH",
   spawns:{"host": [2, 8], "guest": [18, 8]},door:[10, 0],
   rows:[
    "##########D##########",
    "#UsssssssssssssssssU#",
    "#sYsssQsUsssUsQsssYs#",
    "#sYYssss:::::ssssYYs#",
    "#sssNsss:::::sssNsss#",
    "#sssssss:===:sssssss#",
    "#sssssss:::::sssssss#",
    "#ccccccc:::::ccccccc#",
    "#cAccccc==O==cccccBc#",
    "#ccccccc:::::ccccccc#",
    "#sssssss:::::sssssss#",
    "#sssssss:===:sssssss#",
    "#sssNsss:::::sssNsss#",
    "#sYYssss:::::ssssYYs#",
    "#sssssQsUsssUsQsssss#",
    "#UsssssssssssssssssU#",
    "#####################"
   ]},
  {name:"명부전",ground:"STONE_PATH",
   spawns:{"host": [2, 8], "guest": [18, 8]},door:[10, 0],
   rows:[
    "##########D##########",
    "#ssssssssscsssssssss#",
    "#sUsssUssscsssUsssUs#",
    "#ssssssssUcUssssssss#",
    "#YsNsNsNsscssNsNsNsY#",
    "#sYssssssscsssssssYs#",
    "#sssssossQcQssosssss#",
    "#ccccccccccccccccccc#",
    "#cAcccccccMcccccccBc#",
    "#cccccccccsccccccccc#",
    "#sssssossQsQssosssss#",
    "#sYsssssssssssssssYs#",
    "#YsNsNsNsssssNsNsNsY#",
    "#ssssssssUsUssssssss#",
    "#sUsssUsssssssUsssUs#",
    "#sssssssssssssssssss#",
    "#####################"
   ]},
  {name:"피안화 언덕",ground:"STONE_PATH",
   spawns:{"host": [2, 8], "guest": [18, 8]},door:[10, 0],
   rows:[
    "##########D##########",
    "#UsssssssssssssssssU#",
    "#sssssssYYsYYsssssss#",
    "#ssYNssUsssssUssNYss#",
    "#sssYYsssssssssYYsss#",
    "#ssssYYsssssssYYssss#",
    "#sssssYsssssssYsssss#",
    "#ccccccsIIIIIscccccc#",
    "#cAccccsIIOIIsccccBc#",
    "#ccccccsIIIIIscccccc#",
    "#sssssYsssssssYsssss#",
    "#ssssYYsssssssYYssss#",
    "#sssYYsssssssssYYsss#",
    "#ssYNssUsssssUssNYss#",
    "#sssssssYYsYYsssssss#",
    "#UsssssssssssssssssU#",
    "#####################"
   ]},
  {name:"넋돌탑 길",ground:"STONE_PATH",
   spawns:{"host": [2, 8], "guest": [18, 8]},door:[10, 0],
   rows:[
    "##########D##########",
    "#Usss#sssscssss#sssU#",
    "#sssN#sssUcUsss#Nsss#",
    "#ssOs#sOsscssOs#sOss#",
    "#ssss#sssscssss#ssss#",
    "#sOss#Ys#scs#sY#ssOs#",
    "#sssssss#scs#sssssss#",
    "#ccccscccccccccscccc#",
    "#cAccscccccccccsccBc#",
    "#ccccscccccccccscccc#",
    "#sssssss#scs#sssssss#",
    "#sOss#Ys#scs#sY#ssOs#",
    "#ssss#sssscssss#ssss#",
    "#ssOs#sOsscssOs#sOss#",
    "#sssN#sssUcUsss#Nsss#",
    "#Usss#sssscssss#sssU#",
    "#####################"
   ]},
  {name:"삼도천",ground:"STONE_PATH",
   spawns:{"host": [2, 9], "guest": [18, 9]},door:[10, 0],
   rows:[
    "##########D##########",
    "#UsssssssUsUsssssssU#",
    "#ssNssNsssssssNssNss#",
    "#sssssssssssssssssss#",
    "#::::=::::=::::=::::#",
    "#::::=::::=::::=::::#",
    "#sssssssssssssssssss#",
    "#sYssssUYsssYUssssYs#",
    "#ccccssssssssssscccc#",
    "#cAcc=:::=M=:::=ccBc#",
    "#ccccssssssssssscccc#",
    "#sYssssUYsssYUssssYs#",
    "#sssssssssssssssssss#",
    "#::::=::::=::::=::::#",
    "#::::=::::=::::=::::#",
    "#sssssssssssssssssss#",
    "#ssNssNsssssssNssNss#",
    "#UsssssssUsUsssssssU#",
    "#####################"
   ]},
  {name:"종각 마당",ground:"STONE_PATH",
   spawns:{"host": [2, 8], "guest": [18, 8]},door:[10, 0],
   rows:[
    "##########D##########",
    "#UsssssssssssssssssU#",
    "#sssssssssssssssssss#",
    "#sYsssssssPsssssssYs#",
    "#ssssQsssssssssQssss#",
    "#ssUsssssYsYsssssUss#",
    "#sssosPsQsssQsPsosss#",
    "#ccccccscccccscccccc#",
    "#cAccccscccccsccccBc#",
    "#ccccccscccccscccccc#",
    "#sssosPsQsssQsPsosss#",
    "#ssUsssssYsYsssssUss#",
    "#ssssQsssssssssQssss#",
    "#sYsssssssPsssssssYs#",
    "#sssssssssssssssssss#",
    "#UsssssssssssssssssU#",
    "#####################"
   ]},
  {name:"윤회 마당",ground:"STONE_PATH",
   spawns:{"host": [2, 9], "guest": [18, 9]},door:[10, 0],
   rows:[
    "##########D##########",
    "#UsssssssssssssssssU#",
    "#sssssssssssssssssss#",
    "#sUsssssssssssssssUs#",
    "#ssssss:::=:::ssssss#",
    "#ssss::sssssss::ssss#",
    "#sYss::sssssss::ssYs#",
    "#sss:ssYsssssYss:sss#",
    "#sss:sscccOcccss:sss#",
    "#UAs=sscccMcccss=sBU#",
    "#sss:sscccOcccss:sss#",
    "#sss:ssYsssssYss:sss#",
    "#sYss::sssssss::ssYs#",
    "#ssss::sssssss::ssss#",
    "#ssssss:::=:::ssssss#",
    "#sUsssssssssssssssUs#",
    "#sssssssssssssssssss#",
    "#UsssssssssssssssssU#",
    "#####################"
   ]},
  {name:"사당 계단",ground:"STONE_PATH",
   spawns:{"host": [2, 8], "guest": [18, 8]},door:[10, 0],
   rows:[
    "##########D##########",
    "#ssssssssscsssssssss#",
    "#UYsssYsYUcUYsYsssYU#",
    "#ssssssssscsssssssss#",
    "######s###c###s######",
    "#ssssssosscssossssss#",
    "#ssUsssosscssosssUss#",
    "#NsssNsosscssosNsssN#",
    "#cAccsssccMccsssccBc#",
    "#NsssNsosscssosNsssN#",
    "#ssUsssosscssosssUss#",
    "#ssssssosscssossssss#",
    "######s###c###s######",
    "#ssssssssscsssssssss#",
    "#UYsssYsYUcUYsYsssYU#",
    "#ssssssssscsssssssss#",
    "#####################"
   ]}
]);

/* The floor of a ghost duel: the drawing is the whole map (new-run core, `buildDuelArena({arena,role})`, instead of NormalFloorGenerator.generate).
   The marks are not tiles: A and B become ground, D (the door in the top wall) stays a wall until the fight is won. */
function buildDuelArena(duel){
  const arena=DUEL_ARENAS[duel.arena],width=arena.rows[0].length,height=arena.rows.length,ground=TT[arena.ground];
  [COLS,ROWS]=[width,height];
  state.map=makeEmptyMap();
  stampGrandGlyphs(arena.rows.map(row=>row.replace(/[ABD]/g,'.')),0,0,ground,ground);
  const door={x:arena.door[0],y:arena.door[1]},mine=arena.spawns[duel.role==='guest'?'guest':'host'],theirs=arena.spawns[duel.role==='guest'?'host':'guest'];
  setTerrainTile58(state.map,door.x,door.y,TT.WALL);
  state.rooms=[{x:1,y:1,w:width-2,h:height-2,cx:Math.floor(width/2),cy:Math.floor(height/2),name:arena.name}];
  Object.assign(state,{specialFloor:true,layoutName:arena.name,duel:{arena:duel.arena,role:duel.role||'host',name:arena.name,door,won:false,opponent:{x:theirs[0],y:theirs[1]}},stairs:{...door},fixedStart:{x:mine[0],y:mine[1]},fixedExit:{...door}});
  state.player.baseVision=Math.max(width,height);state.player.x=mine[0];state.player.y=mine[1];
  placeDuelOpponent(theirs);state.player.facing={x:duel.role==='guest'?-1:1,y:0};
  VisibilityService.compute();vfBuildDecor();
  for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)VisibilityService.rememberKey(k(x,y));
}

// The other player's ghost, standing on the other start. It has the stats of the player's own class (both sides fight on equal terms), takes no turn of its
// own (`duelOpponent`: monsterTurn skips it; it moves only when the other player's input arrives) and gives no xp, kill or drop.
function placeDuelOpponent(at){
  const p=state.player,mon={name:'상대 망령',concept57:'다른 이의 죽은 계정이 망령이 되어 선 모습. 가진 것을 모두 걸고 이곳에 섰다.',shape:'human',kind:'human',duelOpponent:true,
    atk:p.baseAtk,def:p.baseDef,eva:p.baseEva,will:p.baseWill,baseAtk:p.baseAtk,baseDef:p.baseDef,baseEva:p.baseEva,baseWill:p.baseWill,maxHp:p.maxHp,hp:p.maxHp,maxFocus:p.maxFocus,focus:p.maxFocus,
    martial:{strong:0,roar:0,ghost:0,brawl:0,constitution:0},martialForm:{},martialBreakthrough:{},classState:{},xp:0,color:p.color,weakened:0,alerted:true,
    spawnProvenance57:'duel',rewardPolicy57:{xp:false,kills:false,drops:false},x:at[0],y:at[1]};
  OccupancyService.addMonster(mon);return mon;
}
