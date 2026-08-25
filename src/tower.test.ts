import { describe, expect, it } from 'vitest';
import { createRun, useItem, waitTurn } from './tower';

function reachableStair(s:ReturnType<typeof createRun>){
  const start=s.hero.y*s.w+s.hero.x,seen=new Uint8Array(s.w*s.h),q=[start];seen[start]=1;
  for(let h=0;h<q.length;h++){
    const i=q[h]!,x=i%s.w,y=Math.floor(i/s.w);
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]] as const){
      const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=s.w||ny>=s.h)continue;const ni=ny*s.w+nx,t=s.tiles[ni];
      if(seen[ni]||!t||t.kind==='wall'||t.kind==='void')continue;seen[ni]=1;q.push(ni);
    }
  }
  const stairs=s.tiles.findIndex(t=>t.kind==='stairs');return stairs>=0&&!!seen[stairs];
}

describe('Tower of the First King foundation',()=>{
  it('creates a connected first floor with enemies, loot, and a stair',()=>{
    for(const seed of ['king-a','king-b','king-c','king-d']){
      const s=createRun(seed,'vanguard');
      expect(s.floor).toBe(1);expect(s.enemies.length).toBeGreaterThanOrEqual(6);expect(s.drops.length).toBeGreaterThanOrEqual(3);expect(reachableStair(s)).toBe(true);
      expect(s.tiles[s.hero.y*s.w+s.hero.x]?.visible).toBe(true);
    }
  });

  it('gives the three classes distinct starting profiles',()=>{
    const v=createRun('class','vanguard'),r=createRun('class','ranger'),a=createRun('class','arcanist');
    expect(v.hero.maxHp).toBeGreaterThan(r.hero.maxHp);expect(r.hero.maxHp).toBeGreaterThan(a.hero.maxHp);expect(a.hero.power).toBeGreaterThan(v.hero.power);expect(r.hero.bag).toContain('bomb');
  });

  it('spends items and advances turns',()=>{
    const s=createRun('items','vanguard');const before=s.turn;s.hero.hp=10;useItem(s,0);expect(s.hero.hp).toBeGreaterThan(10);expect(s.hero.bag.length).toBe(1);expect(s.turn).toBe(before+1);const t=s.turn;waitTurn(s);expect(s.turn).toBe(t+1);
  });
});
