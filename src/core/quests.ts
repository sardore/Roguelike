import type { GameState, QuestKind, QuestState } from './types';
import { hashString32 } from './rng';

function nextId(state:GameState,siteId:string,kind:QuestKind):string{return `q-${hashString32(`${state.runSeed}:${siteId}:${kind}:${state.coord.depth}`).toString(36)}`;}

export function createContract(state:GameState,siteId:string,kind:QuestKind):QuestState|null{
  if(state.quests.some((quest)=>quest.status==='active'&&quest.kind===kind))return null;
  const depth=state.coord.depth;
  if(kind==='hunt')return{id:nextId(state,siteId,kind),kind,status:'active',progress:0,goal:5+Math.floor(depth/35),rewardGold:18+Math.floor(depth/5),sourceSiteId:siteId};
  if(kind==='delve')return{id:nextId(state,siteId,kind),kind,status:'active',progress:0,goal:3,rewardGold:24+Math.floor(depth/4),sourceSiteId:siteId,startDepth:depth};
  return{id:nextId(state,siteId,kind),kind,status:'active',progress:0,goal:1,rewardGold:36+Math.floor(depth/3),sourceSiteId:siteId};
}

function updateStatus(quest:QuestState):void{if(quest.status==='active'&&quest.progress>=quest.goal)quest.status='complete';}
export function recordMonsterKill(state:GameState,isUnique:boolean):void{
  for(const quest of state.quests){
    if(quest.status!=='active')continue;
    if(quest.kind==='hunt')quest.progress+=1;
    else if(quest.kind==='unique'&&isUnique)quest.progress+=1;
    updateStatus(quest);
  }
}
export function recordDescent(state:GameState):void{
  for(const quest of state.quests){if(quest.status==='active'&&quest.kind==='delve'){quest.progress+=1;updateStatus(quest);}}
}
export function claimContract(state:GameState,questId:string):QuestState|null{
  const quest=state.quests.find((entry)=>entry.id===questId&&entry.status==='complete');if(!quest)return null;quest.status='claimed';return quest;
}
export function questLabel(quest:QuestState,locale:'en'|'ko'):string{
  const title=quest.kind==='hunt'?(locale==='ko'?'사냥 계약':'Hunt contract'):quest.kind==='delve'?(locale==='ko'?'심층 탐사':'Deep-delving contract'):(locale==='ko'?'고유종 토벌':'Named foe contract');
  return `${title} ${quest.progress}/${quest.goal}`;
}
