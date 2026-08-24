import type { EffectSpec } from '../core/types';

export type SpellTarget = 'self' | 'enemy';
export interface SpellDefinition {
  id:string;
  name:string;
  nameKo:string;
  description:string;
  descriptionKo:string;
  glyph:string;
  color:string;
  mana:number;
  range:number;
  target:SpellTarget;
  effects:EffectSpec[];
}

const spell=(id:string,name:string,nameKo:string,description:string,descriptionKo:string,glyph:string,color:string,mana:number,range:number,target:SpellTarget,effects:EffectSpec[]):SpellDefinition=>({id,name,nameKo,description,descriptionKo,glyph,color,mana,range,target,effects});

export const SPELLS:SpellDefinition[]=[
  spell('ember-dart','Ember Dart','잿불 화살','A cheap focused bolt of fire.','낮은 비용의 집중 화염탄.','*','#e39a63',3,7,'enemy',[{op:'damage',amount:7,damageType:'fire'}]),
  spell('rime-lance','Rime Lance','서리 창','Cold damage that also chills the target.','냉기 피해와 함께 대상을 둔화한다.','|','#bfe5ef',4,8,'enemy',[{op:'damage',amount:7,damageType:'cold'},{op:'status',id:'chilled',duration:3,magnitude:1}]),
  spell('static-arc','Static Arc','정전기 호','A sharp shock that punishes aquatic creatures.','수생 생물에게 특히 위험한 전격.','~','#b9c8ef',4,7,'enemy',[{op:'damage',amount:8,damageType:'shock'}]),
  spell('venom-mote','Venom Mote','맹독 입자','Weak direct damage followed by poison pressure.','약한 직격 피해 뒤에 독 압박을 남긴다.','·','#a9c66f',4,7,'enemy',[{op:'damage',amount:4,damageType:'poison'},{op:'status',id:'poisoned',duration:5,magnitude:1}]),
  spell('force-pulse','Force Pulse','충격 파동','Blasts a foe backward and opens space.','적을 밀어내 공간을 만든다.','»','#d0d5df',5,6,'enemy',[{op:'damage',amount:5},{op:'push',distance:2}]),
  spell('blink','Blink','점멸','Fold a short distance through nearby space.','근거리 공간을 접어 순간이동한다.','@','#c1a0df',5,0,'self',[{op:'teleport',radius:6}]),
  spell('stone-ward','Stone Ward','석벽 수호','Briefly hardens your stance.','짧은 시간 방어 태세를 크게 강화한다.','[','#c2b29a',4,0,'self',[{op:'status',id:'guarding',duration:6,magnitude:2}]),
  spell('clear-sight','Clear Sight','명시','Reveals a broad section of the current floor.','현재 층의 넓은 범위를 드러낸다.','⌕','#d5d0b7',5,0,'self',[{op:'reveal',radius:16},{op:'status',id:'focused',duration:8,magnitude:1}]),
  spell('miasma-cloud','Miasma Cloud','독무 구름','Turns the target area into poisonous miasma.','대상 주변을 독성 미아즈마로 바꾼다.','☁','#9eb56b',6,7,'enemy',[{op:'spawn-terrain',tile:'miasma',radius:1,duration:6}]),
  spell('bramble-knot','Bramble Knot','가시매듭','Raises grasping brambles around a foe.','적 주변에 붙잡는 가시덤불을 자라게 한다.','#','#809d63',6,6,'enemy',[{op:'spawn-terrain',tile:'bramble',radius:1,duration:7},{op:'status',id:'pinned',duration:1,magnitude:1}]),
  spell('oil-sigil','Oil Sigil','기름 인장','Coats an area in volatile oil for later ignition.','영역을 인화성 기름으로 뒤덮는다.','≈','#8d7556',4,7,'enemy',[{op:'spawn-terrain',tile:'oil',radius:1,duration:8}]),
  spell('void-mark','Void Mark','공허 표식','Cuts with void energy and leaves unstable ground.','공허 피해를 주고 불안정한 지형을 남긴다.','◇','#bd8dda',8,8,'enemy',[{op:'damage',amount:10,damageType:'void'},{op:'spawn-terrain',tile:'void-rift',radius:1,duration:5}]),
  spell('sanctuary','Sanctuary','성역','Creates a brief consecrated refuge underfoot.','발밑에 짧은 시간 성역을 만든다.','_','#e1d8ae',7,0,'self',[{op:'spawn-terrain',tile:'holy',radius:1,duration:8},{op:'heal',amount:5}]),
  spell('ash-ring','Ash Ring','재의 고리','Surrounds the caster with burning ground.','시전자 주변에 불타는 지형을 만든다.','○','#d8895e',8,0,'self',[{op:'spawn-terrain',tile:'lava',radius:1,duration:4},{op:'status',id:'fire-ward',duration:6,magnitude:1}]),
  spell('recall-breath','Recall Breath','회상의 숨','Restores life and focus at a steep mana cost.','큰 마나를 써 생명과 집중을 회복한다.','+','#b7d8c4',9,0,'self',[{op:'heal',amount:14},{op:'status',id:'focused',duration:6,magnitude:1}]),
  spell('abyss-step','Abyss Step','심연 걸음','A dangerous long blink wrapped in lucid protection.','긴 점멸과 짧은 공허 방어를 함께 얻는다.','↯','#b590d2',10,0,'self',[{op:'teleport',radius:12},{op:'status',id:'lucid',duration:8,magnitude:1}]),
];

const byId=new Map(SPELLS.map((entry)=>[entry.id,entry]));
export function spellById(id:string):SpellDefinition{const found=byId.get(id);if(!found)throw new Error(`unknown spell: ${id}`);return found;}
export function spellName(spell:SpellDefinition,locale:'en'|'ko'):string{return locale==='ko'?spell.nameKo:spell.name;}
export function spellDescription(spell:SpellDefinition,locale:'en'|'ko'):string{return locale==='ko'?spell.descriptionKo:spell.description;}
