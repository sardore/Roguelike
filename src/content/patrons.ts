export interface PatronDefinition {
  id:string;
  name:string;
  nameKo:string;
  creed:string;
  creedKo:string;
  color:string;
  invokeCost:number;
  invoke:{heal?:number;mana?:number;nutrition?:number;statuses:Array<{id:string;duration:number;magnitude:number}>};
}

export const PATRONS:PatronDefinition[]=[
  {id:'lantern-below',name:'The Lantern Below',nameKo:'지하의 등불',creed:'Knowledge, routes, and surviving what should remain unseen.',creedKo:'길과 지식을 밝혀 보아서는 안 될 것을 견뎌낸다.',color:'#d8c47e',invokeCost:8,invoke:{mana:5,statuses:[{id:'focused',duration:18,magnitude:2}]}},
  {id:'iron-oath',name:'The Iron Oath',nameKo:'철의 맹세',creed:'Stand your ground, endure, and answer force with discipline.',creedKo:'물러서지 않고 견디며 힘에는 규율로 답한다.',color:'#aeb4bb',invokeCost:9,invoke:{heal:7,statuses:[{id:'guarding',duration:9,magnitude:2}]}},
  {id:'deep-tide',name:'The Deep Tide',nameKo:'깊은 조류',creed:'Yield, recover, and return with the pressure of buried water.',creedKo:'흐름에 몸을 맡기고 회복한 뒤 묻힌 물의 압력으로 돌아온다.',color:'#84bfc4',invokeCost:10,invoke:{heal:12,nutrition:180,statuses:[{id:'water-step',duration:16,magnitude:1}]}},
  {id:'nameless-edge',name:'The Nameless Edge',nameKo:'이름 없는 경계',creed:'Risk identity and certainty for impossible movement and power.',creedKo:'불가능한 이동과 힘을 위해 정체성과 확실성을 건다.',color:'#b28bd2',invokeCost:12,invoke:{mana:8,statuses:[{id:'lucid',duration:16,magnitude:1},{id:'hasted',duration:4,magnitude:1}]}},
];

const byId=new Map(PATRONS.map((entry)=>[entry.id,entry]));
export function patronById(id:string):PatronDefinition{const found=byId.get(id);if(!found)throw new Error(`unknown patron: ${id}`);return found;}
