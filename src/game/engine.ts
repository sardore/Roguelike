import { hash } from './rng';
import { createWorld } from './world';
import { move, useItem, wait } from './systems';
import type { GameState, Point } from './types';
export class Game {
  state:GameState; listeners=new Set<()=>void>();
  constructor(seed='apothecaries-row'){this.state=createWorld(hash(seed));}
  sub(fn:()=>void){this.listeners.add(fn);return()=>this.listeners.delete(fn);}
  emit(){for(const fn of this.listeners)fn();}
  move(dx:number,dy:number){move(this.state,dx,dy);this.emit();}
  wait(){wait(this.state);this.emit();}
  use(index:number,dir?:Point){useItem(this.state,index,dir);this.emit();}
  restart(seed=`run-${Date.now()}`){this.state=createWorld(hash(seed));this.emit();}
}
