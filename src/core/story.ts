import type { GameState, StoryEvent, ThemeDefinition } from './types';
const MILESTONES=[
{depth:20,id:'roots-end',title:'The First Foundation',body:'The old foundations end here. Below them, the architecture was built for a different age.'},
{depth:40,id:'second-bell',title:'A Bell Beneath Stone',body:'A bell rings once from far below. Nothing in this depth should be large enough to make that sound.'},
{depth:60,id:'ash-line',title:'The Ash Line',body:'Soot lies in a perfect horizontal seam across the world. Everything below it survived a fire that had nowhere to burn.'},
{depth:80,id:'sky-underneath',title:'A Sky Underneath',body:'For one impossible instant, a star field is visible through a crack in the floor.'},
{depth:100,id:'crown-fall',title:'The Fallen Crown',body:'Royal marks begin appearing on doors that predate the kingdom by centuries.'},
{depth:120,id:'last-foundation',title:'The Last Foundation',body:'The world has run out of foundations. Something is holding the remaining depth in place.'}];
export function themeDiscoveryEvent(state:GameState,theme:ThemeDefinition):StoryEvent|null{if(theme.id==='abyss'){if(state.seenStoryEvents.includes('enter-abyss'))return null;return{id:'enter-abyss',title:'THE ABYSS',body:'The side of the world has stopped pretending to be a place. The route back is no longer guaranteed.',severity:'major'};}if(state.discoveredThemes.includes(theme.id))return null;return{id:`theme:${theme.id}`,title:theme.name.toUpperCase(),body:theme.ambience,severity:'major'};}
export function milestoneEvent(state:GameState):StoryEvent|null{const m=MILESTONES.find((entry)=>state.coord.depth>=entry.depth&&!state.seenStoryEvents.includes(entry.id));return m?{id:m.id,title:m.title,body:m.body,severity:'major'}:null;}
