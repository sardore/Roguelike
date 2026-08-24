import { describe, expect, it } from 'vitest';
import { Game } from './engine';
import { createLateWorld } from './lateStages';
import { hash } from './rng';
import { interactAt } from './systems';
import { createWorld } from './world';

function exitStep(g:Game){const s=g.state,i=s.tiles.findIndex(t=>t.kind==='stairs'),x=i%s.width,y=Math.floor(i/s.width),dirs=[[1,0],[-1,0],[0,1],[0,-1]] as const;const p=dirs.map(([dx,dy])=>({x:x-dx,y:y-dy,dx,dy})).find(q=>{const t=s.tiles[q.y*s.width+q.x];return !!t&&t.kind!=='wall'&&!t.blocks});expect(p).toBeTruthy();s.enemies=[];s.player.x=p!.x;s.player.y=p!.y;g.move(p!.dx,p!.dy)}

describe('multi-district run volume',()=>{
  it('builds distinct terrain and structures in later districts',()=>{
    const bazaar=createWorld(hash('bazaar'),2),crucible=createWorld(hash('crucible'),3),catacombs=createLateWorld(hash('catacombs'),4),alembic=createLateWorld(hash('alembic'),5);
    const bKinds=new Set(bazaar.tiles.map(t=>t.kind)),cKinds=new Set(crucible.tiles.map(t=>t.kind)),dKinds=new Set(catacombs.tiles.map(t=>t.kind)),eKinds=new Set(alembic.tiles.map(t=>t.kind));
    for(const kind of ['brine','miasma','crystal'])expect(bKinds.has(kind as never)).toBe(true);
    for(const kind of ['embers','brine','crystal','miasma'])expect(cKinds.has(kind as never)).toBe(true);
    for(const kind of ['crystal','miasma','brine','glass','rune'])expect(dKinds.has(kind as never)).toBe(true);
    for(const kind of ['embers','brine','steam','acid','crystal','oil'])expect(eKinds.has(kind as never)).toBe(true);
    expect(bazaar.tiles.some(t=>t.fixture==='transmuter')).toBe(true);expect(crucible.tiles.some(t=>t.fixture==='crucible')).toBe(true);expect(catacombs.tiles.some(t=>t.fixture==='silver-mirror')).toBe(true);expect(alembic.tiles.some(t=>t.fixture==='reagent-pump')).toBe(true);
  });
  it('transmutes a basic reagent into a rarer tactical item',()=>{const s=createWorld(hash('transmuter'),2),i=s.tiles.findIndex(t=>t.fixture==='transmuter'),x=i%s.width,y=Math.floor(i/s.width);s.player.x=x-1;s.player.y=y;s.player.inventory=['salt-bomb'];interactAt(s,{x,y});expect(s.player.inventory).toContain('frost-salts');expect(s.player.inventory).not.toContain('salt-bomb')});
  it('descends through five districts while preserving carried loot',()=>{const g=new Game('five-districts');g.state.player.inventory.push('amber-elixir');for(const next of[2,3,4,5]){exitStep(g);expect(g.state.districtStage).toBe(next);expect(g.state.player.inventory).toContain('amber-elixir');expect(g.state.over).toBe(false)}exitStep(g);expect(g.state.over).toBe(true);expect(g.state.won).toBe(true)});
});
