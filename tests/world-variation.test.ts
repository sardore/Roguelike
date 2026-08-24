import { describe, expect, it } from 'vitest';
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
