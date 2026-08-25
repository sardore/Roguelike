import type { GameState, Tile } from './types';

function at(s:GameState,x:number,y:number){return s.tiles[y*s.width+x]}
function fixture(s:GameState,x:number,y:number,name:Tile['fixture'],blocks=false,state=0){const t=at(s,x,y);if(!t||t.kind==='wall'||t.fixture)return;t.fixture=name;t.blocks=blocks;t.state=state}
function terrain(s:GameState,x:number,y:number,kind:Tile['kind'],variant=1){const t=at(s,x,y);if(!t||t.kind==='wall'||t.fixture)return;t.kind=kind;t.variant=variant}

export function applyStageDetails(s:GameState){
  if(s.districtStage===1){
    fixture(s,19,14,'awning',false);fixture(s,20,17,'lamp',false);fixture(s,21,16,'stall',true,1);fixture(s,27,17,'stall',true,2);fixture(s,29,14,'sign',false);fixture(s,31,17,'cart',true);fixture(s,18,16,'barrel',true);fixture(s,33,15,'lamp',false);
    fixture(s,20,14,'shelf',true);fixture(s,23,14,'pipe',false);fixture(s,26,14,'still',true);fixture(s,22,17,'crate',true);fixture(s,25,17,'grate',false);fixture(s,28,17,'barrel',true);
    terrain(s,22,14,'glass',1);terrain(s,28,15,'oil',2);terrain(s,30,16,'sludge',1);terrain(s,17,17,'water',1);terrain(s,26,17,'water',1);
    const rat=s.enemies.find(e=>e.id==='rat-a');if(rat){rat.x=29;rat.y=16}
    const tonic=s.items.find(i=>i.id==='tonic-a');if(tonic){tonic.x=19;tonic.y=15}
  }
  if(s.districtStage===2){
    fixture(s,19,16,'lamp',false);fixture(s,22,17,'cart',true);fixture(s,28,15,'stall',true,3);fixture(s,32,17,'bell',true,0);fixture(s,35,15,'awning',false);
    fixture(s,21,15,'pipe',false);fixture(s,23,14,'shelf',true);fixture(s,25,17,'grate',false);fixture(s,27,17,'barrel',true);fixture(s,30,14,'sign',false);
    terrain(s,20,15,'miasma',2);terrain(s,30,17,'brine',1);terrain(s,34,16,'crystal',2);terrain(s,26,14,'brine',1);
  }
  if(s.districtStage===3){
    fixture(s,19,15,'lamp',false);fixture(s,21,17,'furnace',true,0);fixture(s,29,17,'crucible',true,0);fixture(s,33,15,'silver-mirror',true,0);fixture(s,35,17,'lamp',false);
    fixture(s,23,14,'pipe',false);fixture(s,26,14,'retort',true,0);fixture(s,25,17,'grate',false);fixture(s,27,17,'crate',true);
    terrain(s,20,16,'embers',3);terrain(s,30,15,'crystal',2);terrain(s,34,16,'rune',2);terrain(s,23,17,'embers',2);
  }
  if(s.districtStage===4){
    fixture(s,21,15,'silver-mirror',true,0);fixture(s,22,17,'pipe',false);fixture(s,24,17,'grate',false);fixture(s,29,17,'lamp',false);fixture(s,30,15,'cage',true,0);
    terrain(s,21,16,'glass',2);terrain(s,28,15,'crystal',2);terrain(s,29,16,'glass',1);
  }
  if(s.districtStage===5){
    fixture(s,21,15,'pipe',false);fixture(s,23,17,'grate',false);fixture(s,27,15,'retort',true,0);fixture(s,29,17,'lamp',false);fixture(s,31,15,'archive-desk',true,0);
    terrain(s,21,16,'embers',3);terrain(s,29,16,'oil',2);terrain(s,30,17,'crystal',2);
  }
}
