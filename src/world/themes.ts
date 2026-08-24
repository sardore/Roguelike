import type { ThemeContext, ThemeDefinition, ThemeId, WorldCoord } from '../core/types';

export const ABYSS_THRESHOLD = 4;
export const STAGE_DEPTH = 20;

const theme = (id: string, name: string, stage: number, lane: ThemeDefinition['lane'], palette: ThemeDefinition['palette'], ambience: string, monsterTags: string[], archetypeIds: string[]): ThemeDefinition => ({ id, name, stage, lane, palette, ambience, monsterTags, archetypeIds });
const ROOMY = ['rooms-bent', 'bsp-tight', 'catacomb', 'maze-chambers', 'mine-tunnels', 'river-cut', 'ring-sanctum', 'fractured'];
const CAVEY = ['cavern-dense', 'mine-tunnels', 'fractured', 'river-cut', 'maze-chambers', 'rooms-bent', 'ring-sanctum', 'bsp-tight'];
const BUILT = ['bsp-tight', 'rooms-bent', 'catacomb', 'maze-chambers', 'ring-sanctum', 'fractured', 'river-cut', 'mine-tunnels'];

export const THEMES: ThemeDefinition[] = [
  theme('moss-cistern','Moss Cistern',0,'main',{wall:'#5d6f61',floor:'#889b84',accent:'#a9d18e',danger:'#d57b73',water:'#5f8c91'},'dripping stone and moss',['beast','ooze','vermin'],ROOMY),
  theme('drowned-aqueduct','Drowned Aqueduct',0,'left',{wall:'#475f68',floor:'#75909a',accent:'#8fc7ca',danger:'#d8846f',water:'#4da3b3'},'flooded masonry',['aquatic','ooze','undead'],['river-cut','rooms-bent','bsp-tight','catacomb','cavern-dense','maze-chambers','fractured','ring-sanctum']),
  theme('ember-mine','Ember Mine',0,'right',{wall:'#6d5849',floor:'#9a7b61',accent:'#e3a05f',danger:'#ff6f52',water:'#6c7f83'},'hot rails and coal dust',['construct','beast','fire'],CAVEY),
  theme('fungal-vault','Fungal Vault',1,'main',{wall:'#58624f',floor:'#7f8668',accent:'#c2b86a',danger:'#c86a76',water:'#658b7e'},'dense spores and wet roots',['fungal','vermin','beast'],CAVEY),
  theme('ossuary-terraces','Ossuary Terraces',1,'left',{wall:'#706c63',floor:'#aaa18d',accent:'#d7cab1',danger:'#b86d6d',water:'#6e8184'},'stacked crypts and bone dust',['undead','spirit','vermin'],BUILT),
  theme('ironwarren','Ironwarren',1,'right',{wall:'#555d62',floor:'#838b8f',accent:'#c29a66',danger:'#dd765d',water:'#60777e'},'rusted machinery and narrow works',['construct','humanoid','vermin'],['mine-tunnels','bsp-tight','rooms-bent','maze-chambers','fractured','catacomb','ring-sanctum','river-cut']),
  theme('crystal-hollows','Crystal Hollows',2,'main',{wall:'#55647d',floor:'#8293ad',accent:'#b7c9ff',danger:'#dc78a5',water:'#6b95b7'},'resonant crystal caverns',['crystal','beast','spirit'],CAVEY),
  theme('venom-fen','Venom Fen',2,'left',{wall:'#4f6350',floor:'#788b69',accent:'#a9c65e',danger:'#d86d78',water:'#68875f'},'poison reeds and sinking paths',['venom','plant','aquatic'],['river-cut','cavern-dense','fractured','mine-tunnels','rooms-bent','maze-chambers','catacomb','ring-sanctum']),
  theme('storm-archive','Storm Archive',2,'right',{wall:'#555e75',floor:'#818ca8',accent:'#d1d8ff',danger:'#ef9d57',water:'#648da0'},'charged halls and sealed stacks',['caster','construct','spirit'],BUILT),
  theme('ash-cathedral','Ash Cathedral',3,'main',{wall:'#69605c',floor:'#9c8d82',accent:'#d7c1a7',danger:'#e16d5d',water:'#687a7a'},'burnt chapels and choking ash',['fire','undead','humanoid'],BUILT),
  theme('flesh-cloister','Flesh Cloister',3,'left',{wall:'#704f56',floor:'#a66e75',accent:'#d99898',danger:'#ff6c79',water:'#805f6b'},'living passages and wet chambers',['flesh','vermin','aberrant'],['cavern-dense','fractured','rooms-bent','ring-sanctum','maze-chambers','river-cut','catacomb','mine-tunnels']),
  theme('clockwork-necropolis','Clockwork Necropolis',3,'right',{wall:'#5e5b52',floor:'#8e8979',accent:'#d1ad69',danger:'#df7352',water:'#65767a'},'gears turning under tombs',['construct','undead','caster'],BUILT),
  theme('frozen-observatory','Frozen Observatory',4,'main',{wall:'#596a78',floor:'#8aa0ad',accent:'#cce8f1',danger:'#c9788c',water:'#6ca2b6'},'iced lenses and star charts',['ice','spirit','construct'],BUILT),
  theme('sunken-palace','Sunken Palace',4,'left',{wall:'#4e6870',floor:'#76969b',accent:'#9fd0c6',danger:'#d57c66',water:'#4595a0'},'drowned courts and broken mosaics',['aquatic','undead','humanoid'],['river-cut','rooms-bent','bsp-tight','ring-sanctum','catacomb','cavern-dense','fractured','maze-chambers']),
  theme('void-garden','Void Garden',4,'right',{wall:'#514f6b',floor:'#777393',accent:'#b6a3de',danger:'#e1729d',water:'#5f718c'},'silent growth under impossible stars',['plant','aberrant','spirit'],CAVEY),
  theme('royal-chasm','Royal Chasm',5,'main',{wall:'#6a5e55',floor:'#9a897b',accent:'#e0c48b',danger:'#e76d5a',water:'#6a8084'},'collapsed royal depths',['humanoid','undead','aberrant'],['bsp-tight','fractured','ring-sanctum','rooms-bent','catacomb','mine-tunnels','maze-chambers','cavern-dense']),
  theme('dream-prison','Dream Prison',5,'left',{wall:'#58536c',floor:'#837b9b',accent:'#c3b1e8',danger:'#de76a1',water:'#687a9a'},'cells that rearrange when unseen',['spirit','caster','aberrant'],['maze-chambers','ring-sanctum','fractured','bsp-tight','rooms-bent','cavern-dense','catacomb','river-cut']),
  theme('star-forge','Star Forge',5,'right',{wall:'#635b50',floor:'#928675',accent:'#f0c46f',danger:'#ff725c',water:'#657982'},'white-hot machinery beneath the world',['construct','fire','caster'],['mine-tunnels','bsp-tight','fractured','rooms-bent','ring-sanctum','maze-chambers','catacomb','cavern-dense']),
];

export const ABYSS_THEME: ThemeDefinition = theme('abyss','The Abyss',99,'main',{wall:'#44414f',floor:'#6d6678',accent:'#b384d6',danger:'#f06492',water:'#53617e'},'geometry without a stable horizon',['aberrant','spirit','void'],['fractured','cavern-dense','maze-chambers','ring-sanctum','mine-tunnels','river-cut','catacomb','bsp-tight']);
export function stageForDepth(depth: number): number { return Math.max(0, Math.min(5, Math.floor((Math.max(1, depth)-1)/STAGE_DEPTH))); }
function getTheme(stage: number, lane: ThemeDefinition['lane']): ThemeDefinition { const found = THEMES.find((entry)=>entry.stage===stage&&entry.lane===lane); if(!found) throw new Error(`missing theme for stage=${stage} lane=${lane}`); return found; }
export function themeById(id: ThemeId): ThemeDefinition { if(id===ABYSS_THEME.id) return ABYSS_THEME; const found=THEMES.find((entry)=>entry.id===id); if(!found) throw new Error(`unknown theme: ${id}`); return found; }
export function resolveThemeContext(coord: WorldCoord): ThemeContext { if(Math.abs(coord.lane)>=ABYSS_THRESHOLD) return {primary:ABYSS_THEME,isAbyss:true}; const stage=stageForDepth(coord.depth); const main=getTheme(stage,'main'); if(coord.lane===0) return {primary:main,isAbyss:false}; const side=getTheme(stage,coord.lane<0?'left':'right'); const distance=Math.abs(coord.lane); if(distance===1) return {primary:main,blend:{target:side,weight:.48},isAbyss:false}; return {primary:side,blend:{target:main,weight:.14},isAbyss:false}; }
export function validateThemeCatalog(): string[] { const errors:string[]=[]; if(THEMES.length<15) errors.push(`expected >=15 themes, got ${THEMES.length}`); for(const entry of THEMES) if(entry.archetypeIds.length<8) errors.push(`${entry.id} has fewer than 8 floor archetypes`); for(let stage=0;stage<6;stage+=1) for(const lane of ['left','main','right'] as const) if(!THEMES.some((entry)=>entry.stage===stage&&entry.lane===lane)) errors.push(`missing stage ${stage} ${lane} theme`); return errors; }
