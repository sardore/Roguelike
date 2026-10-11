import { describe, expect, it } from 'vitest';
import { createRun, useItem, useSkill, waitTurn } from './tower';

function reachableStair(s:ReturnType<typeof createRun>){
  const start=s.hero.y*s.w+s.hero.x,seen=new Uint8Array(s.w*s.h),q=[start];seen[start]=1;
  for(let h=0;h<q.length;h++){
    const i=q[h]!,x=i%s.w,y=Math.floor(i/s.w);
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]] as const){
      const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=s.w||ny>=s.h)continue;const ni=ny*s.w+nx,t=s.tiles[ni];
      if(seen[ni]||!t||['wall','void','chasm','books','pillar'].includes(t.kind))continue;seen[ni]=1;q.push(ni);
    }
  }
  const stairs=s.tiles.findIndex(t=>t.kind==='stairs');return stairs>=0&&!!seen[stairs];
}

describe('Tower of the First King',()=>{
  it('creates connected playable first floors with enemies, loot, and a stair',()=>{
    for(const seed of ['king-a','king-b','king-c','king-d']){
      const s=createRun(seed,'vanguard');
      expect(s.floor).toBe(1);expect(s.enemies.length).toBeGreaterThanOrEqual(5);expect(s.drops.length).toBeGreaterThanOrEqual(2);expect(reachableStair(s)).toBe(true);
      expect(s.tiles[s.hero.y*s.w+s.hero.x]?.visible).toBe(true);
    }
  });

  it('gives the three classes distinct starting profiles and skills',()=>{
    const v=createRun('class','vanguard'),r=createRun('class','ranger'),a=createRun('class','arcanist');
    expect(v.hero.maxHp).toBeGreaterThan(r.hero.maxHp);expect(r.hero.maxHp).toBeGreaterThan(a.hero.maxHp);expect(a.hero.power).toBeGreaterThan(v.hero.power);expect(r.hero.bag).toContain('bomb');expect(v.hero.skillCooldown).toBe(0);
  });

  it('spends items, advances turns, and exposes a tactical skill action',()=>{
    const s=createRun('items','vanguard');const before=s.turn,beforeBag=s.hero.bag.length;s.hero.hp=10;useItem(s,0);expect(s.hero.hp).toBeGreaterThan(10);expect(s.hero.bag.length).toBe(beforeBag-1);expect(s.turn).toBe(before+1);const t=s.turn;waitTurn(s);expect(s.turn).toBe(t+1);
    const e=s.enemies[0]!;e.x=s.hero.x+1;e.y=s.hero.y;e.hp=20;e.maxHp=20;const skillTurn=s.turn;expect(useSkill(s,e.x,e.y)).toBe(true);expect(s.turn).toBe(skillTurn+1);expect(s.hero.skillCooldown).toBeGreaterThan(0);
  });
});
