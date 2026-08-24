from pathlib import Path


def patch(path:str, old:str, new:str, label:str):
    p=Path(path); s=p.read_text()
    if old not in s:
        raise RuntimeError(f'missing anchor {label} in {path}')
    p.write_text(s.replace(old,new,1))

# Game integration: structural overlays are part of canonical floor creation, before sites/features/population.
patch('src/core/game.ts',
"import { applyThemedTerrain, terrainDefinition, terrainTile } from '../world/terrain-rules';",
"import { applyThemedTerrain, terrainDefinition, terrainTile } from '../world/terrain-rules';\nimport { applyMapStructures } from '../world/map-structures';",
'game structure import')
patch('src/core/game.ts',
"function settlementProtected(state: GameState, point: Point): boolean {\n  return state.sites.some((site) => site.settlementId && manhattan(site, point) <= 3);\n}",
"function settlementProtected(state: GameState, point: Point): boolean {\n  const ids=[...new Set(state.sites.flatMap((site)=>site.settlementId?[site.settlementId]:[]))];\n  for(const id of ids){const sites=state.sites.filter((site)=>site.settlementId===id);if(!sites.length)continue;const xs=sites.map((site)=>site.x),ys=sites.map((site)=>site.y);const minX=Math.min(...xs)-3,maxX=Math.max(...xs)+3,minY=Math.min(...ys)-3,maxY=Math.max(...ys)+3;if(point.x>=minX&&point.x<=maxX&&point.y>=minY&&point.y<=maxY)return true;}\n  return false;\n}",
'settlement protection bounds')
patch('src/core/game.ts',
"  state.floor = generateFloor(state.runSeed, state.coord, context);\n  state.player.x = state.floor.spawn.x;",
"  state.floor = generateFloor(state.runSeed, state.coord, context);\n  applyMapStructures(state.floor,context.primary,state.coord,new DeterministicRng(deriveSeed(state.runSeed,state.coord.depth,state.coord.lane,'structures')));\n  state.player.x = state.floor.spawn.x;",
'floor structure application')
patch('src/core/game.ts',
"  const coord: WorldCoord = { depth: 1, lane: 0 }, context = resolveThemeContext(coord), floor = generateFloor(runSeed, coord, context);\n  const origin=originById(originId);",
"  const coord: WorldCoord = { depth: 1, lane: 0 }, context = resolveThemeContext(coord), floor = generateFloor(runSeed, coord, context);\n  applyMapStructures(floor,context.primary,coord,new DeterministicRng(deriveSeed(runSeed,coord.depth,coord.lane,'structures')));\n  const origin=originById(originId);",
'new run structure application')

# Renderer: fix structural alpha expression introduced during direct terrain rendering update.
patch('src/ui/render.ts',
"    const baseAlpha=isVisible?(tile.kind==='wall'||tile.kind==='pillar'||tile.kind==='tree'?.09:.04)+(n*.02):.012;",
"    const baseAlpha=isVisible?((tile.kind==='wall'||tile.kind==='pillar'||tile.kind==='tree')?.09:.04)+(n*.02):.012;",
'render alpha conditional')

# Every theme gets a few low-weight structural motifs in addition to strong theme-specific motifs,
# so consecutive floors in one theme do not collapse to the same visual grammar.
patch('src/world/map-structures.ts',
"  add('ruined-court', 1.4);\n  if (tags.has('plant')) add('grove', 6);",
"  add('ruined-court', 1.4);\n  add('grove', 1.15);\n  add('shrine-yard', .65);\n  add('reed-basin', .35);\n  if (tags.has('plant')) add('grove', 6);",
'generic structure diversity')

# A one-axis street still gets a crossing alley, so stamping a town cannot sever a perpendicular dungeon corridor.
patch('src/world/settlement-layout.ts',
"    for(let x=center.x-halfLong;x<=center.x+halfLong;x+=1){set(floor,x,center.y,'floor');if(rng.chance(.25))set(floor,x,center.y+1,'grass');}\n    const slots=[-8,-4,0,4,8];",
"    for(let x=center.x-halfLong;x<=center.x+halfLong;x+=1){set(floor,x,center.y,'floor');if(rng.chance(.25))set(floor,x,center.y+1,'grass');}\n    for(let y=center.y-halfShort;y<=center.y+halfShort;y+=1)set(floor,center.x,y,'floor');\n    const slots=[-8,-4,0,4,8];",
'horizontal town crossing')
patch('src/world/settlement-layout.ts',
"    for(let y=center.y-halfLong;y<=center.y+halfLong;y+=1){set(floor,center.x,y,'floor');if(rng.chance(.25))set(floor,center.x+1,y,'grass');}\n    const slots=[-8,-4,0,4,8];",
"    for(let y=center.y-halfLong;y<=center.y+halfLong;y+=1){set(floor,center.x,y,'floor');if(rng.chance(.25))set(floor,center.x+1,y,'grass');}\n    for(let x=center.x-halfShort;x<=center.x+halfShort;x+=1)set(floor,x,center.y,'floor');\n    const slots=[-8,-4,0,4,8];",
'vertical town crossing')

# Regression coverage for the exact requested changes.
Path('tests/world-variation.test.ts').write_text(r'''import { describe, expect, it } from 'vitest';
import { DeterministicRng, deriveSeed } from '../src/core/rng';
import { generateFloor, tileAt } from '../src/world/generation';
import { resolveThemeContext } from '../src/world/themes';
import { applyMapStructures } from '../src/world/map-structures';
import { generateSites } from '../src/world/sites';
import type { FloorMap, Point } from '../src/core/types';

function reachable(map:FloorMap):Set<string>{
  const out=new Set<string>(),queue:Point[]=[map.spawn];
  while(queue.length){const p=queue.shift()!,key=`${p.x},${p.y}`;if(out.has(key)||!tileAt(map,p.x,p.y)?.walkable)continue;out.add(key);for(const d of [[1,0],[-1,0],[0,1],[0,-1]] as const)queue.push({x:p.x+d[0],y:p.y+d[1]});}
  return out;
}

describe('structural world variety',()=>{
  it('adds multiple visual terrain grammars inside one theme across runs',()=>{
    const coord={depth:41,lane:-2},context=resolveThemeContext(coord),seen=new Set<string>(),stamps=new Set<string>();
    for(let seed=1;seed<=14;seed+=1){const floor=generateFloor(seed,coord,context);for(const stamp of applyMapStructures(floor,context.primary,coord,new DeterministicRng(deriveSeed(seed,'structures'))))stamps.add(stamp.kind);for(const tile of floor.tiles)if(['tree','grass','reed','fungus','crystal','bones','pillar','door','ice','holy'].includes(tile.kind))seen.add(tile.kind);}
    expect(stamps.size).toBeGreaterThanOrEqual(3);expect(seen.size).toBeGreaterThanOrEqual(4);expect(seen.has('tree')).toBe(true);
  });

  it('builds a hub as separate rooms and streets, not stacked markers in one room',()=>{
    const coord={depth:36,lane:2},context=resolveThemeContext(coord),seed=9321,floor=generateFloor(seed,coord,context);
    applyMapStructures(floor,context.primary,coord,new DeterministicRng(deriveSeed(seed,'structures')));
    const sites=generateSites(floor,context.primary,coord,new DeterministicRng(deriveSeed(seed,'sites'))),town=sites.filter((site)=>site.settlementId);
    expect(town.length).toBeGreaterThanOrEqual(5);
    expect(floor.tiles.filter((tile)=>tile.kind==='door').length).toBeGreaterThanOrEqual(4);
    expect(floor.tiles.filter((tile)=>tile.kind==='wall').length).toBeGreaterThan(0);
    let maxDistance=0;for(const a of town)for(const b of town)maxDistance=Math.max(maxDistance,Math.abs(a.x-b.x)+Math.abs(a.y-b.y));
    expect(maxDistance).toBeGreaterThanOrEqual(8);
    const open=reachable(floor);for(const exit of floor.exits)expect(open.has(`${exit.x},${exit.y}`)).toBe(true);
    for(const site of town)expect(tileAt(floor,site.x,site.y)?.walkable).toBe(true);
  });
});
''')

p=Path('README.md');s=p.read_text();anchor='- systemic special terrain patches: ice, miasma, bramble, void rifts, oil, holy ground, water, lava, bridges, and rubble\n'
if anchor not in s: raise RuntimeError('missing README terrain anchor')
s=s.replace(anchor,anchor+'- persistent structural terrain composition inside themes: groves/trees, grass, reeds, fungal beds, crystal gardens, ossuary aisles, pillars, ruined courts, forge trenches, shrine yards, and void scars\n- settlement floors stamp real streets, plazas, doors, and separate shop/service rooms instead of clustering site markers in one chamber\n',1)
p.write_text(s)
print('variation integration applied')
