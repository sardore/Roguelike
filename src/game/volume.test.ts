import { describe, expect, it } from 'vitest';
import { Game } from './engine';
import { hash } from './rng';
import { interactAt } from './systems';
import { createWorld } from './world';

describe('multi-district run volume',()=>{
  it('builds distinct terrain and structures in later districts',()=>{
    const bazaar=createWorld(hash('bazaar'),2),crucible=createWorld(hash('crucible'),3);
    const bKinds=new Set(bazaar.tiles.map(t=>t.kind)),cKinds=new Set(crucible.tiles.map(t=>t.kind));
    for(const kind of ['brine','miasma','crystal'])expect(bKinds.has(kind as never)).toBe(true);
    for(const kind of ['embers','brine','crystal','miasma'])expect(cKinds.has(kind as never)).toBe(true);
    expect(bazaar.tiles.some(t=>t.fixture==='transmuter')).toBe(true);
    expect(crucible.tiles.some(t=>t.fixture==='crucible')).toBe(true);
  });
  it('transmutes a basic reagent into a rarer tactical item',()=>{
    const s=createWorld(hash('transmuter'),2);const i=s.tiles.findIndex(t=>t.fixture==='transmuter');const x=i%s.width,y=Math.floor(i/s.width);
    s.player.x=x-1;s.player.y=y;s.player.inventory=['salt-bomb'];interactAt(s,{x,y});expect(s.player.inventory).toContain('frost-salts');expect(s.player.inventory).not.toContain('salt-bomb');
  });
  it('descends through three districts while preserving carried loot',()=>{
    const g=new Game('three-districts');g.state.player.inventory.push('amber-elixir');
    for(const next of [2,3]){const i=g.state.tiles.findIndex(t=>t.kind==='stairs'),x=i%g.state.width,y=Math.floor(i/g.state.width);g.state.player.x=x-1;g.state.player.y=y;g.move(1,0);expect(g.state.districtStage).toBe(next);expect(g.state.player.inventory).toContain('amber-elixir');expect(g.state.over).toBe(false)}
    const i=g.state.tiles.findIndex(t=>t.kind==='stairs'),x=i%g.state.width,y=Math.floor(i/g.state.width);g.state.player.x=x-1;g.state.player.y=y;g.move(1,0);expect(g.state.over).toBe(true);expect(g.state.won).toBe(true);
  });
});
