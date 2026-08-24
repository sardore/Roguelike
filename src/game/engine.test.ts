import { describe, expect, it } from 'vitest';
import { Game } from './engine';

describe('city observations',()=>{
  it('records a room observation only on first entry',()=>{
    const game=new Game('room-observation');
    for(const [dx,dy] of [[1,0],[1,0],[1,0],[1,0],[0,-1],[0,-1],[0,-1],[0,-1]] as const)game.move(dx,dy);
    const first=game.state.messages.filter(m=>m.text.includes('copper coil')).length;
    expect(first).toBe(1);
    game.move(0,1);game.move(0,-1);
    const second=game.state.messages.filter(m=>m.text.includes('copper coil')).length;
    expect(second).toBe(1);
    expect(game.state.enteredRooms).toContain('distillery');
  });
});
