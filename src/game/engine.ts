import { hash } from './rng';
import { createLateWorld } from './lateStages';
import { applySpecialFeatures } from './specials';
import { applyStageDetails } from './stageDetails';
import { applyExpansionContent, handleExpansionInteract, runExpansionTick } from './expansion';
import { applyDistrictSetpiece } from './setpieces';
import { createWorld } from './world';
import { interactAt, move, useItem, wait } from './systems';
import type { GameState, Point } from './types';

export type RunKit='apothecary'|'surveyor'|'breaker';

const OBSERVATIONS:Record<string,string>={
  herbalist:'Most herb bundles have gone brittle. One is still green.',distillery:'The burners are cold. One copper coil is not.','north-alley':'A narrow strip through the grit has been swept clean.',glassworks:'The furnace is dark. The broken glass is warm.',courtyard:'The dry fountain basin smells faintly of cloves.','service-passage':'The pipes here knock once, then stay quiet.',underworks:'Condensation runs uphill along one pipe.','sealed-shop':'The boards over the inner passage were nailed from this side.',
  'tincture-bazaar':'Most stalls are shuttered. One set of scales is still balanced.','spice-arcade':'Powdered spice lies in footprints that stop at a blank wall.','dye-vats':'The dye has separated into colors that do not mix.','counting-house':'Someone crossed out every total but left the dates.','black-market':'The locked cages are empty. The price tags are not.',cistern:'Ripples reach the wall before anything touches the water.','market-passages':'The ceiling pipes are labeled in a handwriting too recent for the rust.',wayhouse:'Three bedrolls. Four cups.','old-exchange':'A brass gate has been polished from the inside.',
  'crucible-ward':'The stone is warm enough to soften wax.','furnace-court':'The furnaces breathe at different speeds.','assay-lab':'Every sample is labeled UNKNOWN in the same hand.','kiln-hall':'Ash keeps collecting in a room with no draft.','old-mint':'Blank coins fill the trays. One has your profile scratched into it.','ash-gallery':'Footprints vanish where the soot is thickest.','cooling-vault':'The brine is colder near the empty hooks.','master-lab':'The instruments have been cleaned more recently than the floor.','final-vault':'The last ward has already been broken from the far side.',
  'vitreous-catacombs':'The glass masonry has mortar lines. Someone meant this place to last.','mirror-ossuary':'None of the mirrors reflect the same number of shelves.','crystal-vault':'The crystal has been cut around older cracks instead of through them.','preservation-hall':'Every sealed vessel is numbered. Number one is missing.','drain-chapel':'The drain channels meet where an altar would normally stand.','specimen-crypt':'The cages have nameplates, not specimen numbers.','sealed-archive':'The paper here is dry despite water running behind the walls.','catacomb-passages':'The same boot print appears on both sides of a locked door.',
  'grand-alembic':'The entire floor vibrates at the tempo of slow breathing.','reaction-gallery':'The gauge needles move before the pipes knock.','furnace-nave':'The furnaces are warm in the shape of recently removed tools.','catalyst-library':'Blank reagent labels have been filed alphabetically.','cooling-core':'The cold pipes sweat upward.','master-vault':'The vault inventory lists one more container than the room holds.','central-lab':'Every chair faces the door.','condenser-hall':'Condensate runs against the slope of the floor.','final-sanctum':'The final mechanism is already unlocked from the other side.'
};

const DESCENT:Record<number,string>={2:'You descend into the Tincture Bazaar. The air becomes wetter.',3:'You descend again. Somewhere below, a furnace door closes by itself.',4:'The stair enters glasswork that predates the street above.',5:'Below the catacombs, the whole city narrows into one working machine.'};
const DEEPER:Record<number,string>={1:'The second street lies below the first, built from older stone.',2:'The lower market is still stocked. Nothing here is for sale.',3:'The lower works throb with a furnace rhythm you can feel through your boots.',4:'The deeper catacomb walls contain shapes that were never meant to be windows.',5:'The second core level is hotter, quieter, and very close to the central mechanism.'};

function rawWorld(seed:number,stage:number){return stage<=3?createWorld(seed,stage):createLateWorld(seed,stage)}
function decorate(state:GameState){applyStageDetails(state);applySpecialFeatures(state);applyExpansionContent(state);applyDistrictSetpiece(state)}
function floorSeed(root:number,stage:number,floor:number){return hash(`${root}:${stage}:${floor}`)}
function makeWorld(root:number,stage:number,floor:number){const state=rawWorld(floorSeed(root,stage,floor),stage);state.floorInDistrict=floor;decorate(state);return state}
function districtBossAlive(s:GameState){return s.enemies.some(e=>e.id.startsWith('district-boss-'))}
function applyKit(s:GameState,kit:RunKit){
  s.player.statuses=[];s.player.guard=0;
  if(kit==='apothecary'){s.player.maxHp=22;s.player.hp=22;s.player.inventory=['red-phial','blue-tonic','neutralizer'];}
  else if(kit==='surveyor'){s.player.maxHp=20;s.player.hp=20;s.player.guard=1;s.player.inventory=['chalk','smoke-ampoule','frost-salts'];}
  else{s.player.maxHp=26;s.player.hp=26;s.player.guard=2;s.player.inventory=['salt-bomb','solvent','copper-key'];}
  s.messages=[{text:kit==='apothecary'?'You enter carrying a field apothecary kit.':kit==='surveyor'?'You enter with survey chalk, cold salts, and one smoke ampoule.':'You enter dressed to break locks, glass, and anything standing behind them.',tone:'good'}];
}

export class Game{
  state:GameState;listeners=new Set<()=>void>();private rootSeed:number;
  constructor(seed='apothecaries-row'){this.rootSeed=hash(seed);this.state=makeWorld(this.rootSeed,1,1)}
  sub(fn:()=>void){this.listeners.add(fn);return()=>this.listeners.delete(fn)}emit(){for(const fn of this.listeners)fn()}
  private observe(beforeX:number,beforeY:number){if(this.state.player.x===beforeX&&this.state.player.y===beforeY)return;const tile=this.state.tiles[this.state.player.y*this.state.width+this.state.player.x],room=tile?.room;if(room&&!this.state.enteredRooms.includes(room)){this.state.enteredRooms.push(room);const text=OBSERVATIONS[room];if(text){this.state.messages.push({text,tone:'odd'});if(this.state.messages.length>9)this.state.messages.shift()}}}
  private carry(old:GameState,next:GameState){next.player.hp=old.player.hp;next.player.maxHp=old.player.maxHp;next.player.guard=old.player.guard;next.player.inventory=[...old.player.inventory];next.player.statuses=old.player.statuses.filter(st=>st.id!=='marked'&&st.id!=='sluggish').map(st=>({...st,turns:Math.min(st.turns,4)}));next.turn=old.turn;}
  private enforceBossGate(){if(!this.state.over||!this.state.won||(this.state.floorInDistrict??1)!==2||!districtBossAlive(this.state))return;this.state.over=false;this.state.won=false;this.state.messages.push({text:'The brass stair is pressure-locked. The district master is still alive.',tone:'bad'});if(this.state.messages.length>9)this.state.messages.shift()}
  private descendIfNeeded(){
    if(!this.state.won||!this.state.over)return;
    const old=this.state,stage=old.districtStage,floor=old.floorInDistrict??1;
    if(stage===5&&floor===2)return;
    const nextStage=floor===1?stage:stage+1,nextFloor=floor===1?2:1,next=makeWorld(this.rootSeed,nextStage,nextFloor);
    this.carry(old,next);
    next.messages=[{text:nextFloor===2?(DEEPER[nextStage]??'The district continues below.'):(DESCENT[nextStage]??'The stair continues downward.'),tone:'odd'}];
    this.state=next;
  }
  move(dx:number,dy:number){const x=this.state.player.x,y=this.state.player.y;move(this.state,dx,dy);runExpansionTick(this.state);this.observe(x,y);this.enforceBossGate();this.descendIfNeeded();this.emit()}
  wait(){wait(this.state);runExpansionTick(this.state);this.emit()}
  use(index:number,target?:Point){useItem(this.state,index,target);runExpansionTick(this.state);this.emit()}
  interact(target:Point){if(!handleExpansionInteract(this.state,target))interactAt(this.state,target);runExpansionTick(this.state);this.emit()}
  start(kit:RunKit,seed=`run-${Date.now()}`){this.rootSeed=hash(seed);this.state=makeWorld(this.rootSeed,1,1);applyKit(this.state,kit);this.emit()}
  restart(seed=`run-${Date.now()}`){this.rootSeed=hash(seed);this.state=makeWorld(this.rootSeed,1,1);this.emit()}
}
