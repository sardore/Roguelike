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
  ,{name:"회랑",ground:"STONE_PATH",
   spawns:{"host": [2, 8], "guest": [18, 8]},door:[10, 0],
   rows:[
    "##########D##########",
    "#ssssss#sssss#ssssss#",
    "#ssssss#sssss#ssssss#",
    "#ssssss#sssss#ssssss#",
    "#ssssss#sssss#ssssss#",
    "#ss#####sssss#####ss#",
    "#sssssssssssssssssss#",
    "#ccccccss###sscccccc#",
    "#cAccccss###ssccccBc#",
    "#ccccccss###sscccccc#",
    "#sssssssssssssssssss#",
    "#ss#####sssss#####ss#",
    "#ssssss#sssss#ssssss#",
    "#ssssss#sssss#ssssss#",
    "#ssssss#sssss#ssssss#",
    "#ssssss#sssss#ssssss#",
    "#####################"
   ]}
  ,{name:"격실",ground:"STONE_PATH",
   spawns:{"host": [2, 8], "guest": [18, 8]},door:[10, 0],
   rows:[
    "##########D##########",
    "#sssssss#sss#sssssss#",
    "#sssssss#sss#sssssss#",
    "#sssssss#s#s#sssssss#",
    "#sssssssssssssssssss#",
    "####s####sss####s####",
    "#sssssssssssssssssss#",
    "#ccccccssssssscccccc#",
    "#cAccccsssssssccccBc#",
    "#ccccccssssssscccccc#",
    "#sssssssssssssssssss#",
    "####s####sss####s####",
    "#sssssssssssssssssss#",
    "#sssssss#s#s#sssssss#",
    "#sssssss#sss#sssssss#",
    "#sssssss#sss#sssssss#",
    "#####################"
   ]}
  ,{name:"기둥숲",ground:"STONE_PATH",
   spawns:{"host": [2, 8], "guest": [18, 8]},door:[10, 0],
   rows:[
    "##########D##########",
    "#sssssssssssssssssss#",
    "#sssssss#sss#sssssss#",
    "#sss##sssssssss##sss#",
    "#sss##s#sssss#s##sss#",
    "#sssssssss#sssssssss#",
    "#sssssss#sss#sssssss#",
    "#ccccccssssssscccccc#",
    "#cAccccss###ssccccBc#",
    "#ccccccssssssscccccc#",
    "#sssssss#sss#sssssss#",
    "#sssssssss#sssssssss#",
    "#sss##s#sssss#s##sss#",
    "#sss##sssssssss##sss#",
    "#sssssss#sss#sssssss#",
    "#sssssssssssssssssss#",
    "#####################"
   ]}
  ,{name:"미궁 회랑",ground:"STONE_PATH",
   spawns:{"host": [2, 8], "guest": [18, 8]},door:[10, 0],
   rows:[
    "##########D##########",
    "#sssssssssssssssssss#",
    "#sssssssssssssssssss#",
    "#sssssssssssssssssss#",
    "#sssssssssssssssssss#",
    "#sss####ss#ss####sss#",
    "#ssssss#sssss#ssssss#",
    "#cccsss#sssss#sssccc#",
    "#cAc####ss#ss####cBc#",
    "#ccc#sssss#sssss#ccc#",
    "#sss#sssss#sssss#sss#",
    "#sss#ss#######ss#sss#",
    "#sssssssssssssssssss#",
    "#sssssssssssssssssss#",
    "#sssssssssssssssssss#",
    "#sssssssssssssssssss#",
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
  Object.assign(state,{specialFloor:true,layoutName:arena.name,duel:{arena:duel.arena,role:duel.role||'host',name:arena.name,door,won:false,baseFloor:Math.max(1,Math.floor(Number(duel.baseFloor)||1)),opponentFloor:Math.max(0,Math.floor(Number(duel.opponentFloor)||0)),opponent:{x:theirs[0],y:theirs[1]}},stairs:{...door},fixedStart:{x:mine[0],y:mine[1]},fixedExit:{...door}});
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
  // the blink is there from the start of a duel, two cells at least, whether or not the gatekeeper of 청풍루 fell in that run (a ghost that learned more keeps it)
  player.blinkLevel=Math.max(2,Math.floor(Number(player.blinkLevel))||0);
  initializeMartial(state);normalizeClassState58(player,0);
  // everything is known in a duel: every potion and talisman has its name, every piece of gear (worn or in the bag) its curse and its enchantment
  const K=globalThis.__MANRU_CONSUMABLE56_ACTIONS__.initializeKnowledge();
  for(const potion of window.MANRU_POTIONS||[])K.potionKnown[potion.potionKind]=true;
  for(const talisman of window.MANRU_TALISMANS||[])K.talismanKnown[talisman.talismanKind]=true;
  for(const item of player.inventory||[])if(item&&typeof item==='object')item.identified=true;
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
  // how it is drawn: as the player of that class, with what that ghost wore (kept apart from the stand-in's own fields, which the combat rules read)
  if(ghost)mon.duelLook={classId:ghost.classId,weapon:ghost.weapon||null,armor:ghost.armor||null,cloak:ghost.cloak||null,relic:ghost.relic||null,trinket:ghost.trinket||null,classState:ghost.classState||{}};
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
// The potions and talismans (not the upgrade talisman) in the bag, counted by the piece.
function duelItemCount(){return(state?.player?.inventory||[]).reduce((n,i)=>n+(['potion','talisman'].includes(i.type)&&i.talismanKind!=='upgrade'?itemQuantity(i):0),0)}
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
  addLog('상대 망령이 쓰러졌다. 위쪽 문이 열렸다.'); // the strip over the arena says what to do next
  VisibilityService.compute();Duel.reportWin();
}
// ---- score: a ghost has a current score (S) and a death score (D); it dies only when a lost duel takes S down to D or below -------------------------------
// Both numbers live on the owner's device (no server field). D follows the best S ever reached, and rises faster the higher that is. Duels move S by a small
// Elo-like step: beating a stronger ghost gives more, losing to a weaker one costs more. Both sides compute the same numbers from what they exchange.
const DUEL_SCORE={STEP:4,SPAN:10,GAIN:.7};
function duelDeathOf(peak){peak=Math.max(1,Math.floor(Number(peak)||1));return Math.max(1,Math.min(peak-1,Math.floor(peak*peak/50+peak/6)))}
function duelScoreStart(floor){const s=Math.max(3,Math.floor(Number(floor)||1)+2);return{s,peak:s,d:duelDeathOf(s)}}
function duelScoreClean(raw,floor){
  const base=duelScoreStart(floor);if(!raw||typeof raw!=='object')return base;
  const s=Math.floor(Number(raw.s)),peak=Math.floor(Number(raw.peak));
  if(!(s>0)||!(peak>=s))return base;
  return{s,peak,d:duelDeathOf(peak)};
}
function duelExpected(mine,theirs){return 1/(1+Math.pow(10,((Number(theirs)||0)-(Number(mine)||0))/DUEL_SCORE.SPAN))}
// A win pays less than the same stake costs, and a loss is never smaller than the winner's gain + 1: the two sides' changes always add up below zero, more so
// the higher the loser's score (the loss grows with it).
function duelScoreWin(mine,theirs){return Math.max(1,Math.round(DUEL_SCORE.STEP*DUEL_SCORE.GAIN*(1-duelExpected(mine,theirs))))}
function duelScoreLoss(mine,theirs){return Math.max(duelScoreWin(theirs,mine)+1,Math.round(DUEL_SCORE.STEP*duelExpected(mine,theirs)*(1.25+Math.min(Number(mine)||0,40)/30)))}
// Would losing against `foe` end this ghost?
// How near a ghost is to its death score, 0 (far) to 1 (one ordinary loss from it): measured in losses, since that is how it is lost.
function duelDanger(score){const loss=duelScoreLoss(score.s,score.s),gap=score.s-score.d;return Math.round(Math.max(0,Math.min(1,1-(gap-loss)/(loss*2)))*100)/100}
function duelDiesOnLoss(me,foe){return me.s-duelScoreLoss(me.s,foe.s)<=me.d}
function duelScoreAfter(me,foe,won){
  const s=Math.max(0,won?me.s+duelScoreWin(me.s,foe.s):me.s-duelScoreLoss(me.s,foe.s)),peak=Math.max(me.peak||me.s,s);
  return{s,peak,d:duelDeathOf(peak)};
}
// ---- time presses: the clock (action time spent, both sides' as far as known) brings a poison cloud in from the edge of the arena, and shortens the turns ---------------
const DUEL_CLOUD={START:24,STEP:8,TURN_MS:20000,MIN_MS:6000};
function duelClock(){return Math.max(state?.duel?.clock||0,Duel.theirClock||0)}
// How many steps the mist has come in (0: not yet). It is the boss arena's mist (tickBossArenaMist, bossArenaMist, drawn with the boss's): the stand-in is its owner, and the radius shrinks.
function duelCloudRing(){const c=duelClock();return c<DUEL_CLOUD.START?0:1+Math.floor((c-DUEL_CLOUD.START)/DUEL_CLOUD.STEP)}
// A turn is twenty seconds at first, a second less for every four of the clock, six at least.
function duelTurnMs(){return Math.max(DUEL_CLOUD.MIN_MS,DUEL_CLOUD.TURN_MS-1000*Math.floor(duelClock()/4))}
// Going through the open door ends the round.
function finishDuelRound(){
  const d=state.duel;
  if(!d.won){toast('상대 망령을 쓰러뜨려야 문이 열린다.');return false}
  if(d.finished)return false;
  d.finished=true;
  addLog('망령전 승리');if(Duel.outcome==='win')Duel.endCard();
  return true;
}
