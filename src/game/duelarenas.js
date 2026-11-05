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
  Object.assign(state,{specialFloor:true,layoutName:arena.name,duel:{arena:duel.arena,role:duel.role||'host',name:arena.name,door,won:false,baseFloor:Math.max(1,Math.floor(Number(duel.baseFloor)||1)),opponent:{x:theirs[0],y:theirs[1]}},stairs:{...door},fixedStart:{x:mine[0],y:mine[1]},fixedExit:{...door}});
  if(duel.ghost)reviveGhost(state.player,duel.ghost);
  state.player.baseVision=Math.max(width,height);state.player.x=mine[0];state.player.y=mine[1];
  placeDuelOpponent(theirs,duel.opponent);state.player.facing={x:duel.role==='guest'?-1:1,y:0};
  VisibilityService.compute();vfBuildDecor();
  for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)VisibilityService.rememberKey(k(x,y));
}

// A dead account stands up again: the saved character (PlayStats.ghostBody) is laid over the player of the new run, at full health and focus, fed, and with
// nothing of the place it died in (position, facing, pending actions).
function reviveGhost(player,ghost){
  for(const key of ['x','y','facing','busyUntil','nextAttackAt','strongReady'])delete ghost[key];
  Object.assign(player,ghost,{x:player.x,y:player.y,facing:player.facing,busyUntil:0,nextAttackAt:0,hunger:100});
  player.hp=player.maxHp;player.focus=player.maxFocus;
  initializeMartial(state);normalizeClassState58(player,0);
  for(const slot of GEAR_SLOT_TYPES)if(player[slot]){player[slot].identified=true;player[slot].curseImmune991=true}
}
// The other player's ghost, standing on the other start. With its saved character (`ghost`) it has that character's stats (worked out as the game works
// them out for a player) and weapon; without one, the stats of the player's own class, so that both sides fight on equal terms. It takes no turn of its
// own (`duelOpponent`: monsterTurn skips it; it moves only when the other player's input arrives) and gives no xp, kill or drop.
function placeDuelOpponent(at,ghost=null){
  const p=state.player,source=ghost||p,saved=state.player;
  let stats;
  if(ghost){state.player={...ghost,hp:ghost.maxHp};try{stats=getStats()}finally{state.player=saved}}
  const mon={name:'상대 망령',concept57:'다른 이의 죽은 계정이 망령이 되어 선 모습. 가진 것을 모두 걸고 이곳에 섰다.',shape:'human',kind:'human',duelOpponent:true,
    atk:stats?stats.atk:p.baseAtk,def:stats?stats.def:p.baseDef,eva:stats?stats.eva:p.baseEva,will:stats?stats.will:p.baseWill,baseAtk:source.baseAtk,baseDef:source.baseDef,baseEva:source.baseEva,baseWill:source.baseWill,
    maxHp:source.maxHp,hp:source.maxHp,maxFocus:source.maxFocus,focus:source.maxFocus,weapon:ghost?.weapon||null,
    martial:{strong:0,roar:0,ghost:0,brawl:0,constitution:0},martialForm:{},martialBreakthrough:{},classState:{},xp:0,color:source.color,weakened:0,alerted:true,
    spawnProvenance57:'duel',rewardPolicy57:{xp:false,kills:false,drops:false},x:at[0],y:at[1]};
  OccupancyService.addMonster(mon);return mon;
}

// ---- the rules of the duel (docs/GHOST_BATTLE.md) ----------------------------------------------------------------------------
// Both ghosts take element damage as a boss does (entityElementMultiplier57 has .62 for a boss; the same number here), potions and talismans share
// a cooldown of five turns and martial arts have their own, and the lava talisman is not laid under the other player (RuntimeTerrainOwner).
const DUEL_ELEMENT_RESIST=.62,DUEL_COOLDOWN_TURNS=5;
// True (with a message) while `kind` ('item' for potions and talismans, 'martial') is cooling down.
function duelCooling(kind){
  if(!state?.duel)return false;
  const until=state.duel.cooldown?.[kind]??0;
  if(state.turn>=until)return false;
  toast(`${kind==='martial'?'무술':'물약과 부적'}은 ${until-state.turn}턴 뒤에 쓸 수 있다.`);
  return true;
}
// Called when an action is committed: the cooldown of what was used starts.
function duelCooldownStart(kind){
  if(state?.duel&&kind)(state.duel.cooldown||={})[kind]=state.turn+DUEL_COOLDOWN_TURNS;
}
// The other ghost fell: the door in the top wall opens (it is a stair tile from now on).
function duelOpponentDown(){
  const d=state.duel;
  if(!d||d.won)return;
  d.won=true;
  setTerrainTile58(state.map,d.door.x,d.door.y,TT.STAIR);
  addLog('상대 망령이 쓰러졌다. 위쪽 문이 열렸다.');toast('상대 망령을 쓰러뜨렸다. 위쪽 문으로 나가면 한 판이 끝난다.');
  VisibilityService.compute();Duel.reportWin();
}
// Going through the open door ends the round: the score is the floor the ghost died on (`baseFloor`) plus one for this win.
function finishDuelRound(){
  const d=state.duel;
  if(!d.won){toast('상대 망령을 쓰러뜨려야 문이 열린다.');return false}
  if(d.finished)return false;
  d.finished=true;d.score=(d.baseFloor||1)+1;
  addLog(`망령전 승리 · ${d.score}점`);toast(`망령전 승리 · ${d.score}점`);
  return true;
}
