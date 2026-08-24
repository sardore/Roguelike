import { describe, expect, it } from 'vitest';
import { createNewGame, dispatchAction } from '../src/core/game';
import { tileAt } from '../src/world/generation';
import type { GameState, Point } from '../src/core/types';

const DIRS: Point[] = [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}];
function clear(state:GameState):void{state.monsters=[];state.items=[];state.player.statuses=[];}
function open(state:GameState,p:Point):boolean{return Boolean(tileAt(state.floor,p.x,p.y)?.walkable);}
function findLine(state:GameState,length:number,needsSideStep=false):{start:Point;dir:Point;side?:Point}{
  for(let y=2;y<state.floor.height-2;y+=1)for(let x=2;x<state.floor.width-2;x+=1){
    const start={x,y};if(!open(state,start))continue;
    for(const dir of DIRS){
      let ok=true;for(let step=1;step<=length;step+=1)if(!open(state,{x:x+dir.x*step,y:y+dir.y*step})){ok=false;break;}
      if(!ok)continue;
      if(!needsSideStep)return{start,dir};
      const sideCandidates=dir.x!==0?[{x,y:y+1},{x,y:y-1}]:[{x:x+1,y},{x:x-1,y}];
      const side=sideCandidates.find((point)=>open(state,point));if(side)return{start,dir,side};
    }
  }
  throw new Error('no tactical line found');
}

describe('low-UI tactical combat',()=>{
  it('turns wait into a one-turn brace against adjacent attacks',()=>{
    const {state}=createNewGame('guard-tactic');clear(state);
    const line=findLine(state,1);state.player.x=line.start.x;state.player.y=line.start.y;
    state.monsters=[{id:'rat',defId:'moss-cistern-moss-rat',hp:20,statuses:[],power:1,abilityCooldown:0,x:line.start.x+line.dir.x,y:line.start.y+line.dir.y}];
    const hp=state.player.hp;dispatchAction(state,{type:'wait'});
    expect(state.player.hp).toBe(hp-1);
    expect(state.messages.some((message)=>message.includes('brace'))).toBe(true);
  });

  it('telegraphs hostile caster abilities so moving off the marked tile dodges them',()=>{
    const {state}=createNewGame('telegraph-tactic');clear(state);
    const line=findLine(state,3,true);state.player.x=line.start.x;state.player.y=line.start.y;
    state.monsters=[{id:'caster',defId:'storm-archive-volt-scribe',hp:30,statuses:[],power:1,abilityCooldown:0,x:line.start.x+line.dir.x*3,y:line.start.y+line.dir.y*3}];
    const hp=state.player.hp;dispatchAction(state,{type:'wait'});
    expect(state.monsters[0]?.statuses.some((status)=>status.id==='charging')).toBe(true);
    const side=line.side!;dispatchAction(state,{type:'move',dx:side.x-state.player.x,dy:side.y-state.player.y});
    expect(state.player.hp).toBe(hp);
    expect(state.monsters[0]?.statuses.some((status)=>status.id==='charging')).toBe(false);
    expect(state.messages.some((message)=>message.includes('misses'))).toBe(true);
  });

  it('gives polearms actual reach without adding another combat button',()=>{
    const {state}=createNewGame('reach-tactic');clear(state);
    const line=findLine(state,2);state.player.x=line.start.x;state.player.y=line.start.y;
    state.player.inventory=[{id:'spear',defId:'cistern-spear'}];state.player.equippedWeaponId='spear';
    state.monsters=[{id:'target',defId:'moss-cistern-cistern-slime',hp:40,statuses:[],power:1,abilityCooldown:0,x:line.start.x+line.dir.x*2,y:line.start.y+line.dir.y*2}];
    const before={x:state.player.x,y:state.player.y};dispatchAction(state,{type:'move',dx:line.dir.x,dy:line.dir.y});
    expect({x:state.player.x,y:state.player.y}).toEqual(before);
    expect(state.monsters[0]?.hp).toBeLessThan(40);
    expect(state.messages.some((message)=>message.includes('reach'))).toBe(true);
  });
});
