import { hash } from './rng';
import { createLateWorld } from './lateStages';
import { applySpecialFeatures } from './specials';
import { applyStageDetails } from './stageDetails';
import { applyExpansionContent, handleExpansionInteract, runExpansionTick } from './expansion';
import { applyDistrictSetpiece } from './setpieces';
import { createWorld } from './world';
import { interactAt, move, useItem, wait } from './systems';
import type { GameState, Point } from './types';

const OBSERVATIONS:Record<string,string>={
  herbalist:'Most herb bundles have gone brittle. One is still green.',distillery:'The burners are cold. One copper coil is not.','north-alley':'A narrow strip through the grit has been swept clean.',glassworks:'The furnace is dark. The broken glass is warm.',courtyard:'The dry fountain basin smells faintly of cloves.','service-passage':'The pipes here knock once, then stay quiet.',underworks:'Condensation runs uphill along one pipe.','sealed-shop':'The boards over the inner passage were nailed from this side.',
  'tincture-bazaar':'Most stalls are shuttered. One set of scales is still balanced.','spice-arcade':'Powdered spice lies in footprints that stop at a blank wall.','dye-vats':'The dye has separated into colors that do not mix.','counting-house':'Someone crossed out every total but left the dates.','black-market':'The locked cages are empty. The price tags are not.',cistern:'Ripples reach the wall before anything touches the water.','market-passages':'The ceiling pipes are labeled in a handwriting too recent for the rust.',wayhouse:'Three bedrolls. Four cups.','old-exchange':'A brass gate has been polished from the inside.',
  'crucible-ward':'The stone is warm enough to soften wax.','furnace-court':'The furnaces breathe at different speeds.','assay-lab':'Every sample is labeled UNKNOWN in the same hand.','kiln-hall':'Ash keeps collecting in a room with no draft.','old-mint':'Blank coins fill the trays. One has your profile scratched into it.','ash-gallery':'Footprints vanish where the soot is thickest.','cooling-vault':'The brine is colder near the empty hooks.','master-lab':'The instruments have been cleaned more recently than the floor.','final-vault':'The last ward has already been broken from the far side.',
  'vitreous-catacombs':'The glass masonry has mortar lines. Someone meant this place to last.','mirror-ossuary':'None of the mirrors reflect the same number of shelves.','crystal-vault':'The crystal has been cut around older cracks instead of through them.','preservation-hall':'Every sealed vessel is numbered. Number one is missing.','drain-chapel':'The drain channels meet where an altar would normally stand.','specimen-crypt':'The cages have nameplates, not specimen numbers.','sealed-archive':'The paper here is dry despite water running behind the walls.','catacomb-passages':'The same boot print appears on both sides of a locked door.',
  'grand-alembic':'The entire floor vibrates at the tempo of slow breathing.','reaction-gallery':'The gauge needles move before the pipes knock.','furnace-nave':'The furnaces are warm in the shape of recently removed tools.','catalyst-library':'Blank reagent labels have been filed alphabetically.','cooling-core':'The cold pipes sweat upward.','master-vault':'The vault inventory lists one more container than the room holds.','central-lab':'Every chair faces the door.','condenser-hall':'Condensate runs against the slope of the floor.','final-sanctum':'The final mechanism is already unlocked from the other side.'
};

function makeWorld(seed:number,stage:number){return stage<=3?createWorld(seed,stage):createLateWorld(seed,stage)}
function decorate(state:GameState){applyStageDetails(state);applySpecialFeatures(state);applyExpansionContent(state);applyDistrictSetpiece(state)}
const DESCENT:Record<number,string>={2:'You descend into the Tincture Bazaar. The air becomes wetter.',3:'You descend again. Somewhere below, a furnace door closes by itself.',4:'The stair enters glasswork that predates the street above.',5:'Below the catacombs, the whole city narrows into one working machine.'};

export class Game{
  state:GameState;listeners=new Set<()=>void>();private rootSeed:number;
  constructor(seed='apothecaries-row'){this.rootSeed=hash(seed);this.state=makeWorld(this.rootSeed,1);decorate(this.state)}
  sub(fn:()=>void){this.listeners.add(fn);return()=>this.listeners.delete(fn)}emit(){for(const fn of this.listeners)fn()}
  private observe(beforeX:number,beforeY:number){if(this.state.player.x===beforeX&&this.state.player.y===beforeY)return;const tile=this.state.tiles[this.state.player.y*this.state.width+this.state.player.x],room=tile?.room;if(room&&!this.state.enteredRooms.includes(room)){this.state.enteredRooms.push(room);const text=OBSERVATIONS[room];if(text){this.state.messages.push({text,tone:'odd'});if(this.state.messages.length>9)this.state.messages.shift()}}}
  private descendIfNeeded(){if(!this.state.won||!this.state.over||this.state.districtStage>=5)return;const old=this.state,nextStage=old.districtStage+1,next=makeWorld(this.rootSeed,nextStage);decorate(next);next.player.hp=old.player.hp;next.player.maxHp=old.player.maxHp;next.player.inventory=[...old.player.inventory];next.player.statuses=old.player.statuses.filter(st=>st.id!=='marked'&&st.id!=='sluggish').map(st=>({...st,turns:Math.min(st.turns,4)}));next.turn=old.turn;next.messages=[{text:DESCENT[nextStage]??'The stair continues downward.',tone:'odd'}];this.state=next}
  move(dx:number,dy:number){const x=this.state.player.x,y=this.state.player.y;move(this.state,dx,dy);runExpansionTick(this.state);this.observe(x,y);this.descendIfNeeded();this.emit()}
  wait(){wait(this.state);runExpansionTick(this.state);this.emit()}
  use(index:number,target?:Point){useItem(this.state,index,target);runExpansionTick(this.state);this.emit()}
  interact(target:Point){if(!handleExpansionInteract(this.state,target))interactAt(this.state,target);runExpansionTick(this.state);this.emit()}
  restart(seed=`run-${Date.now()}`){this.rootSeed=hash(seed);this.state=makeWorld(this.rootSeed,1);decorate(this.state);this.emit()}
}
