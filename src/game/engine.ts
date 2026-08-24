import { hash } from './rng';
import { createWorld } from './world';
import { move, useItem, wait } from './systems';
import type { GameState, Point } from './types';

const OBSERVATIONS:Record<string,string>={
  herbalist:'Most herb bundles have gone brittle. One is still green.',
  distillery:'The burners are cold. One copper coil is not.',
  'north-alley':'A narrow strip through the grit has been swept clean.',
  courtyard:'The dry fountain basin smells faintly of cloves.',
  'service-passage':'The pipes here knock once, then stay quiet.',
  'sealed-shop':'The boards over the inner passage were nailed from this side.'
};

export class Game {
  state:GameState; listeners=new Set<()=>void>();
  constructor(seed='apothecaries-row'){this.state=createWorld(hash(seed));}
  sub(fn:()=>void){this.listeners.add(fn);return()=>this.listeners.delete(fn);}
  emit(){for(const fn of this.listeners)fn();}
  move(dx:number,dy:number){
    const beforeX=this.state.player.x,beforeY=this.state.player.y;
    move(this.state,dx,dy);
    if(this.state.player.x!==beforeX||this.state.player.y!==beforeY){
      const tile=this.state.tiles[this.state.player.y*this.state.width+this.state.player.x];
      const room=tile?.room;
      if(room&&!this.state.enteredRooms.includes(room)){
        this.state.enteredRooms.push(room);
        const text=OBSERVATIONS[room];
        if(text){this.state.messages.push({text,tone:'odd'});if(this.state.messages.length>8)this.state.messages.shift();}
      }
    }
    this.emit();
  }
  wait(){wait(this.state);this.emit();}
  use(index:number,target?:Point){useItem(this.state,index,target);this.emit();}
  restart(seed=`run-${Date.now()}`){this.state=createWorld(hash(seed));this.emit();}
}
