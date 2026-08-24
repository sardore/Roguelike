import type { GameAction, GameState } from '../core/types';

export interface FxSnapshot{hp:number;mana:number;level:number;monsters:number;x:number;y:number;message:string;}
export function captureFx(state:GameState):FxSnapshot{return{hp:state.player.hp,mana:state.player.mana,level:state.player.level,monsters:state.monsters.length,x:state.player.x,y:state.player.y,message:state.messages.at(-1)??''};}

function pulse(root:HTMLElement,className:string,duration=360):void{root.classList.remove(className);void root.offsetWidth;root.classList.add(className);setTimeout(()=>root.classList.remove(className),duration);}
function burst(root:HTMLElement,kind:'blood'|'magic'|'gold'|'void'):void{
  const layer=document.createElement('div');layer.className=`fx-burst fx-${kind}`;
  const glyphs=kind==='blood'?['·','×','•','*']:kind==='magic'?['✦','·','*','+']:kind==='gold'?['✧','•','+','*']:['◇','·','×','¤'];
  for(let i=0;i<12;i+=1){const bit=document.createElement('i');bit.textContent=glyphs[i%glyphs.length]!;bit.style.setProperty('--fx-x',`${Math.cos(i/12*Math.PI*2)*(28+(i%3)*9)}px`);bit.style.setProperty('--fx-y',`${Math.sin(i/12*Math.PI*2)*(24+(i%4)*7)}px`);bit.style.setProperty('--fx-delay',`${(i%4)*18}ms`);layer.appendChild(bit);}
  root.appendChild(layer);setTimeout(()=>layer.remove(),700);
}
function floatText(root:HTMLElement,text:string,kind:'hurt'|'mana'|'level'|'kill'):void{const element=document.createElement('div');element.className=`fx-float fx-${kind}`;element.textContent=text;root.appendChild(element);setTimeout(()=>element.remove(),950);}

export function playActionFx(shell:HTMLElement,action:GameAction,before:FxSnapshot,after:GameState):void{
  const map=shell.querySelector<HTMLElement>('.map-wrap');if(!map)return;
  if(after.player.hp<before.hp){pulse(map,'fx-hit',420);burst(map,'blood');floatText(map,`-${before.hp-after.player.hp} HP`,'hurt');}
  if(after.player.mana<before.mana||action.type==='cast-spell'){pulse(map,'fx-cast',520);burst(map,after.messages.at(-1)?.toLowerCase().includes('void')?'void':'magic');}
  if(after.monsters.length<before.monsters){pulse(map,'fx-kill',360);burst(map,'gold');floatText(map,'KILL','kill');}
  if(after.player.level>before.level){pulse(shell,'fx-levelup',900);burst(map,'gold');floatText(map,`LEVEL ${after.player.level}`,'level');}
  if(Math.abs(after.player.x-before.x)+Math.abs(after.player.y-before.y)>2)pulse(map,'fx-warp',520);
}
