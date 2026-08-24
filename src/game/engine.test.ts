import { describe, expect, it } from 'vitest';
import { Game } from './engine';

function stepOntoExit(g:Game){const s=g.state,si=s.tiles.findIndex(t=>t.kind==='stairs');expect(si).toBeGreaterThanOrEqual(0);const sx=si%s.width,sy=Math.floor(si/s.width),dirs=[[1,0],[-1,0],[0,1],[0,-1]] as const;const from=dirs.map(([dx,dy])=>({x:sx-dx,y:sy-dy,dx,dy})).find(p=>{const t=s.tiles[p.y*s.width+p.x];return !!t&&t.kind!=='wall'&&!t.blocks});expect(from).toBeTruthy();s.enemies=[];s.player.x=from!.x;s.player.y=from!.y;g.move(from!.dx,from!.dy)}

describe('room observations',()=>{
  it('records a room observation only on first entry',()=>{const g=new Game('observe');const s=g.state,before=s.messages.length;s.player.x=24;s.player.y=11;g.move(0,-1);const after=s.messages.length;g.move(0,1);g.move(0,-1);expect(after).toBeGreaterThanOrEqual(before);expect(s.enteredRooms.filter(r=>r==='distillery').length).toBeLessThanOrEqual(1)});
});

describe('full run progression',()=>{
  it('descends through five distinct districts while carrying run state',()=>{const g=new Game('five-floor-run');g.state.player.hp=17;g.state.player.inventory=['chalk'];for(const expected of[2,3,4,5]){stepOntoExit(g);expect(g.state.districtStage).toBe(expected);expect(g.state.player.hp).toBe(17);expect(g.state.player.inventory).toEqual(['chalk']);expect(g.state.over).toBe(false);expect(g.state.won).toBe(false)}stepOntoExit(g);expect(g.state.districtStage).toBe(5);expect(g.state.over).toBe(true);expect(g.state.won).toBe(true)});
});
