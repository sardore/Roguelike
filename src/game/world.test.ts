import { describe, expect, it } from 'vitest';
import { hash } from './rng';
import { createWorld } from './world';

function reachableCount(){
  const s=createWorld(hash('test-city'));
  const seen=new Set<string>();
  const q:Array<[number,number]>=[[s.player.x,s.player.y]];
  while(q.length){
    const [x,y]=q.shift()!;const key=`${x},${y}`;if(seen.has(key))continue;seen.add(key);
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]] as const){
      const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=s.width||ny>=s.height)continue;
      const t=s.tiles[ny*s.width+nx];if(!t||t.kind==='wall'||t.blocks)continue;
      const nk=`${nx},${ny}`;if(!seen.has(nk))q.push([nx,ny]);
    }
  }
  return {s,seen};
}

describe('Apothecaries Row',()=>{
  it('keeps the entire playable slice connected',()=>{
    const {s,seen}=reachableCount();
    const stairs=s.tiles.findIndex(t=>t.kind==='stairs');
    expect(stairs).toBeGreaterThanOrEqual(0);
    expect(seen.has(`${stairs%s.width},${Math.floor(stairs/s.width)}`)).toBe(true);
    for(const e of s.enemies)expect(seen.has(`${e.x},${e.y}`)).toBe(true);
  });

  it('uses environmental dressing as topology, not paint only',()=>{
    const s=createWorld(hash('fixtures'));
    const kinds=new Set(s.tiles.map(t=>t.fixture).filter(Boolean));
    expect(kinds.size).toBeGreaterThanOrEqual(12);
    expect(kinds.has('still')).toBe(true);
    expect(kinds.has('counter')).toBe(true);
    expect(kinds.has('fountain')).toBe(true);
    expect(kinds.has('awning')).toBe(true);
  });

  it('does not reveal the whole map from the starting tile',()=>{
    const s=createWorld(hash('fog'));
    const visible=s.tiles.filter(t=>t.visible).length;
    const discovered=s.tiles.filter(t=>t.discovered).length;
    expect(visible).toBe(discovered);
    expect(visible).toBeGreaterThan(20);
    expect(visible).toBeLessThan(s.tiles.length/3);
  });

  it('places actors on walkable cells',()=>{
    const s=createWorld(hash('actors'));
    const actorTiles=[[s.player.x,s.player.y],...s.enemies.map(e=>[e.x,e.y])] as Array<[number,number]>;
    for(const [x,y] of actorTiles){const t=s.tiles[y*s.width+x];expect(t?.kind).not.toBe('wall');expect(t?.blocks).not.toBe(true);}
  });
});
