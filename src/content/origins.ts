export interface OriginDefinition {
  id:string;
  name:string;
  nameKo:string;
  description:string;
  descriptionKo:string;
  hp:number;
  attack:number;
  defense:number;
  gold:number;
  ammo:number;
  inventory:string[];
  equippedWeapon?:string;
  equippedArmor?:string;
}

export const ORIGINS:OriginDefinition[]=[
  {
    id:'delver',name:'Delver',nameKo:'탐굴꾼',
    description:'Balanced kit, mapping tools, and enough supplies to improvise.',
    descriptionKo:'균형 잡힌 장비와 지도 도구, 임기응변용 보급품을 갖고 시작한다.',
    hp:34,attack:5,defense:1,gold:22,ammo:5,
    inventory:['rust-knife','patched-coat','hard-biscuit','field-bandage','chalk'],
    equippedWeapon:'rust-knife',equippedArmor:'patched-coat'
  },
  {
    id:'warden',name:'Spear Warden',nameKo:'창수호자',
    description:'Tough front-liner built around reach, armor, and deliberate positioning.',
    descriptionKo:'창의 사거리와 방어구, 자리잡기를 중심으로 버티는 전열형이다.',
    hp:40,attack:5,defense:2,gold:15,ammo:0,
    inventory:['cistern-spear','moss-mail','salt-meat','field-bandage','ward-salve'],
    equippedWeapon:'cistern-spear',equippedArmor:'moss-mail'
  },
  {
    id:'scout',name:'Gutter Scout',nameKo:'하층정찰병',
    description:'Fragile, mobile ranged start with ammunition and an emergency escape.',
    descriptionKo:'몸은 약하지만 원거리 무기, 탄약, 비상 탈출 수단을 갖는다.',
    hp:29,attack:4,defense:1,gold:18,ammo:15,
    inventory:['short-bow','rust-knife','traveler-ration','stone-pouch','smoke-pot'],
    equippedWeapon:'short-bow'
  },
  {
    id:'scavenger',name:'Ruin Scavenger',nameKo:'폐허수거꾼',
    description:'Rich utility start with extra gold, survival gear, and a heavy tool weapon.',
    descriptionKo:'골드와 생존 도구가 넉넉하고 무거운 공구형 무기로 시작한다.',
    hp:35,attack:5,defense:1,gold:34,ammo:8,
    inventory:['ember-pick','patched-coat','deep-delver-kit','emergency-ration','surveyor-map'],
    equippedWeapon:'ember-pick',equippedArmor:'patched-coat'
  },
  {
    id:'penitent',name:'Ash Penitent',nameKo:'재의참회자',
    description:'Low wealth, strong resolve: defensive rites, focus, and a sharper blade.',
    descriptionKo:'가난하지만 방어 의식과 집중 수단, 조금 더 강한 칼을 지닌다.',
    hp:32,attack:4,defense:2,gold:8,ammo:2,
    inventory:['bone-sabre','offering-cake','ward-salve','focus-incense','clean-water-flask'],
    equippedWeapon:'bone-sabre'
  }
];

export function originById(id:string):OriginDefinition{
  return ORIGINS.find((origin)=>origin.id===id)??ORIGINS[0]!;
}
