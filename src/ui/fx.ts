import type { GameAction, GameState, Point } from '../core/types';

interface FxMonster extends Point{id:string;hp:number;}
export interface FxSnapshot{hp:number;mana:number;level:number;x:number;y:number;message:string;monsters:FxMonster[];}
export function captureFx(state:GameState):FxSnapshot{return{hp:state.player.hp,mana:state.player.mana,level:state.player.level,x:state.player.x,y:state.player.y,message:state.messages.at(-1)??'',monsters:state.monsters.map((monster)=>({id:monster.id,x:monster.x,y:monster.y,hp:monster.hp}))};}

interface ScreenPoint{x:number;y:number;}
function pulse(root:HTMLElement,className:string,duration=360):void{root.classList.remove(className);void root.offsetWidth;root.classList.add(className);setTimeout(()=>root.classList.remove(className),duration);}
function screenPoint(map:HTMLElement,world:Point):ScreenPoint{
  const canvas=map.querySelector<HTMLCanvasElement>('#game-canvas');
  if(!canvas)return{x:map.clientWidth/2,y:map.clientHeight/2};
  const cell=Number(canvas.dataset.fxCell),viewX=Number(canvas.dataset.fxViewX),viewY=Number(canvas.dataset.fxViewY),offsetX=Number(canvas.dataset.fxOffsetX),offsetY=Number(canvas.dataset.fxOffsetY);
  if(!Number.isFinite(cell)||cell<=0)return{x:map.clientWidth/2,y:map.clientHeight/2};
  return{x:offsetX+(world.x-viewX+.5)*cell,y:offsetY+(world.y-viewY+.5)*cell};
}
function setFlashOrigin(root:HTMLElement,point:ScreenPoint):void{root.style.setProperty('--fx-origin-x',`${point.x}px`);root.style.setProperty('--fx-origin-y',`${point.y}px`);}
function burst(root:HTMLElement,kind:'blood'|'magic'|'gold'|'void',point:ScreenPoint,count=12):void{
  const layer=document.createElement('div');layer.className=`fx-burst fx-${kind}`;layer.style.left=`${point.x}px`;layer.style.top=`${point.y}px`;
  const glyphs=kind==='blood'?['·','×','•','*']:kind==='magic'?['✦','·','*','+']:kind==='gold'?['✧','•','+','*']:['◇','·','×','¤'];
  for(let i=0;i<count;i+=1){const bit=document.createElement('i');bit.textContent=glyphs[i%glyphs.length]!;bit.style.setProperty('--fx-x',`${Math.cos(i/count*Math.PI*2)*(24+(i%4)*8)}px`);bit.style.setProperty('--fx-y',`${Math.sin(i/count*Math.PI*2)*(20+(i%5)*7)}px`);bit.style.setProperty('--fx-delay',`${(i%4)*18}ms`);layer.appendChild(bit);}
  root.appendChild(layer);setTimeout(()=>layer.remove(),700);
}
function floatText(root:HTMLElement,text:string,kind:'hurt'|'mana'|'level'|'kill',point:ScreenPoint):void{const element=document.createElement('div');element.className=`fx-float fx-${kind}`;element.textContent=text;element.style.left=`${point.x}px`;element.style.top=`${point.y}px`;root.appendChild(element);setTimeout(()=>element.remove(),950);}

export function playActionFx(shell:HTMLElement,action:GameAction,before:FxSnapshot,after:GameState):void{
  const map=shell.querySelector<HTMLElement>('.map-wrap');if(!map)return;
  const playerPoint=screenPoint(map,after.player),beforeById=new Map(before.monsters.map((monster)=>[monster.id,monster]));
  const killed=before.monsters.filter((monster)=>!after.monsters.some((entry)=>entry.id===monster.id));
  const wounded=after.monsters.filter((monster)=>{const old=beforeById.get(monster.id);return Boolean(old&&monster.hp<old.hp);});
  const primaryTarget=wounded[0]??killed[0];const actionPoint=primaryTarget?screenPoint(map,primaryTarget):playerPoint;setFlashOrigin(map,actionPoint);
  if(after.player.hp<before.hp){pulse(map,'fx-hit',420);burst(map,'blood',playerPoint,14);floatText(map,`-${before.hp-after.player.hp} HP`,'hurt',playerPoint);}
  for(const monster of wounded.slice(0,3)){const old=beforeById.get(monster.id)!;const point=screenPoint(map,monster);burst(map,'blood',point,8);floatText(map,`-${old.hp-monster.hp}`,'hurt',point);}
  if(after.player.mana<before.mana||action.type==='cast-spell'){pulse(map,'fx-cast',520);burst(map,after.messages.at(-1)?.toLowerCase().includes('void')?'void':'magic',actionPoint,16);}
  if(killed.length){pulse(map,'fx-kill',360);for(const monster of killed.slice(0,4)){const point=screenPoint(map,monster);burst(map,'gold',point,14);floatText(map,'KILL','kill',point);}}
  if(after.player.level>before.level){pulse(shell,'fx-levelup',900);burst(map,'gold',playerPoint,20);floatText(map,`LEVEL ${after.player.level}`,'level',playerPoint);}
  if(Math.abs(after.player.x-before.x)+Math.abs(after.player.y-before.y)>2){setFlashOrigin(map,playerPoint);pulse(map,'fx-warp',520);burst(map,'void',playerPoint,16);}
}
