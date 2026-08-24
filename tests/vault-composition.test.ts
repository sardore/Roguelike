import { describe, expect, it } from 'vitest';
import { DeterministicRng, deriveSeed } from '../src/core/rng';
import { generateFloor, tileAt } from '../src/world/generation';
import { resolveThemeContext } from '../src/world/themes';
import { composeMap } from '../src/world/map-composition';
import { vaultCatalogSize } from '../src/world/vaults';
import type { FloorMap, Point } from '../src/core/types';

function reachable(map:FloorMap):Set<string>{
  const seen=new Set<string>(),queue:Point[]=[map.spawn];
  for(let i=0;i<queue.length;i+=1){const p=queue[i]!,key=`${p.x},${p.y}`;if(seen.has(key)||!tileAt(map,p.x,p.y)?.walkable)continue;seen.add(key);for(const d of [[1,0],[-1,0],[0,1],[0,-1]] as const){const n={x:p.x+d[0],y:p.y+d[1]};if(n.x>0&&n.y>0&&n.x<map.width-1&&n.y<map.height-1&&!seen.has(`${n.x},${n.y}`))queue.push(n);}}
  return seen;
}

describe('Crawl-like level composition',()=>{
  it('keeps a substantial randomized minivault catalog',()=>{expect(vaultCatalogSize()).toBeGreaterThanOrEqual(28);});

  it('mixes macro layouts with multiple vault families across same-theme floors',()=>{
    const coord={depth:47,lane:0},context=resolveThemeContext(coord),structures=new Set<string>(),families=new Set<string>();let floorsWithVaults=0;
    for(let seed=1;seed<=18;seed+=1){const floor=generateFloor(seed,coord,context),result=composeMap(floor,context.primary,coord,new DeterministicRng(deriveSeed(seed,'composition')));for(const stamp of result.structures)structures.add(stamp.kind);for(const vault of result.vaults)families.add(vault.family);if(result.vaults.length)floorsWithVaults+=1;const open=reachable(floor);for(const exit of floor.exits)expect(open.has(`${exit.x},${exit.y}`)).toBe(true);}
    expect(structures.size).toBeGreaterThanOrEqual(3);expect(families.size).toBeGreaterThanOrEqual(3);expect(floorsWithVaults).toBeGreaterThanOrEqual(12);
  });

  it('does not let composed structures overwrite the player arrival square',()=>{
    const coord={depth:22,lane:-2},context=resolveThemeContext(coord),floor=generateFloor(7441,coord,context);composeMap(floor,context.primary,coord,new DeterministicRng(deriveSeed(7441,'composition')));expect(tileAt(floor,floor.spawn.x,floor.spawn.y)?.walkable).toBe(true);
  });
});
