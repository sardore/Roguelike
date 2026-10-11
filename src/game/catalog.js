const MONSTERS=[
 {name:'갱도 투석꾼',min:99,max:99,nativeBranch105:{id:'mine',level:1},hp:17,atk:6,def:1,eva:3,xp:9,color:'#89908b',shape:'human',kind:'human',ranged:true,range:5,concept57:'무너진 갱도에 남아 돌을 움켜쥔 광부.'},
 {name:'흑산 설귀',min:99,max:99,nativeBranch105:{id:'black',level:2},hp:140,atk:14,def:4,eva:2,xp:150,color:'#b9dce5',shape:'ghost',kind:'spirit',boss:true,bossPattern:'blackFrost105',branchBoss105:true,fixedStats57:true,balanceRevision105:4,concept57:'흑산채 정상성을 지키는 얼어붙은 영물이다.'},
 {name:'고목 목매',min:99,max:99,nativeBranch105:{id:'stockade',level:1},hp:34,atk:6,def:3,eva:0,xp:10,color:'#95886f',shape:'tree',kind:'plant',fixed:true,treeMimic105:true,concept57:'메마른 고목인 척 숨어 있는 정괴다.'},
 {name:'벌집나무',min:99,max:99,nativeBranch105:{id:'stockade',level:1},hp:22,atk:7,def:1,eva:0,xp:9,color:'#ab8853',shape:'tree',kind:'plant',fixed:true,reach:3,hiveTree105:true,concept57:'벌집을 품은 오래된 나무.'},
 {name:'벌떼',min:1,max:25,hp:5,atk:3,def:0,eva:10,xp:0,color:'#d6b45f',shape:'swarm',kind:'beast',fast:true,flying:true,summonOnly57:true,beeSwarm105:true,concept57:'벌집나무가 피해를 받을 때 불러낸 벌 무리.'},
  // 1구역 청풍루 · PDF 앞쪽 초안 순서
  {min:1,max:5,name:'객잔 쥐',hp:7,atk:3,def:0,eva:7,xp:3,color:'#807261',shape:'beast',kind:'beast',fast:true,concept57:'작은 몸으로 빠르게 달려들어 발목을 무는 객잔 쥐다.'},
  {min:1,max:5,name:'취객',hp:14,atk:5,def:1,eva:2,xp:5,color:'#8b6451',shape:'human',kind:'human',drunk57:true,concept57:'몽둥이나 빈 술병을 휘두르는 취객이다.'},
  {min:1,max:5,name:'시종',hp:8,atk:4,def:0,eva:5,xp:5,color:'#a58b70',shape:'human',kind:'human',ranged:true,range:5,dishThrow57:true,concept57:'쟁반과 그릇을 던지며 멀리서 방해하는 시종이다.'},
  {min:2,max:5,name:'객잔 경비병',guardPost57:true,hp:23,atk:6,def:4,eva:1,xp:9,color:'#8c704f',shape:'guard',kind:'human',reach:2,guardChance57:.26,concept57:'갑옷과 창으로 길목을 지키는 경비병이다.'},
  {min:2,max:5,name:'떠돌이 도둑',hp:12,atk:6,def:1,eva:9,xp:8,color:'#514940',shape:'human',kind:'human',ambush:true,thiefRetreat57:true,concept57:'어둠에 숨어 있다가 기습하고 곧바로 거리를 벌리는 도둑이다.'},
  {min:3,max:5,name:'거대 거미',hp:22,atk:5,def:3,eva:2,xp:9,color:'#77636a',shape:'beast',kind:'beast',footprint:'x3',web:true,concept57:'객잔 천장에 숨어 살던 거미다.'},

  // 2구역 수묵원 · PDF 앞쪽 초안 순서
  {min:6,max:10,name:'정원사 망령',hp:20,atk:6,def:2,eva:3,xp:8,color:'#72816f',shape:'human',kind:'undead',ambush:true,grassHide57:true,reach:2,concept57:'낫과 전지가위를 움켜쥔 망령이다.'},
  {min:6,max:10,name:'독꽃',hp:14,atk:5,def:1,eva:0,xp:7,color:'#7c8f58',shape:'mage',kind:'plant',fixed:true,ranged:true,range:3,poison:true,concept57:'수묵원의 그늘에서 자라는 독을 품은 꽃이다.'},
  {min:6,max:10,name:'검은 뱀',hp:15,atk:6,def:1,eva:7,xp:8,color:'#3f4b43',shape:'beast',kind:'beast',fast:true,poison:true,concept57:'빠르게 달라붙어 독니를 박는 검은 뱀이다.'},
  {min:6,max:10,name:'먹물 정령',hp:17,atk:5,def:2,eva:4,xp:8,color:'#46515a',shape:'void',kind:'spirit',split:true,concept57:'살아 움직이는 먹이 사람의 윤곽을 이룬 정령이다.'},
  {min:7,max:10,name:'수목 궁수',hp:16,atk:7,def:1,eva:4,xp:9,color:'#6f805e',shape:'human',kind:'spirit',ranged:true,range:7,concept57:'트인 정원에서 나무 화살로 먼 곳의 침입자를 노린다.'},
  {min:7,max:10,name:'정원 바위괴물',hp:42,atk:8,def:9,eva:0,xp:13,color:'#74796d',shape:'brute',kind:'construct',heavyHit57:true,knockback:true,concept57:'느리지만 단단한 바위괴물이다.'},
  {min:6,max:10,name:'식인 물고기',hp:13,atk:10,def:0,eva:5,xp:7,color:'#688b91',shape:'beast',kind:'beast',aquatic:true,fixed:true,waterOnly57:true,fishDrop:true,concept57:'물을 벗어나지 못하는 식인 물고기다.'},

  // 3구역 유혹의 내실: 비단/거울/환각 중심.
  {min:11,max:15,name:'윈도',concept57:"문틈과 거울 뒤에 사람의 윤곽만 남기는 환영이다.",hp:17,atk:8,def:1,eva:5,xp:7,color:'#6f5e72',shape:'human',kind:'spirit',ambush:true},
  {min:11,max:15,name:'비단 술래',concept57:"늘어진 비단을 끌며 내실을 떠도는 술래다.",silkTrapCount57:1,hp:18,atk:6,def:2,eva:4,xp:8,color:'#b17892',shape:'human',kind:'spirit',ranged:true,range:5,web:true},
  {min:11,max:15,name:'환각의 향로',concept57:"불씨가 꺼지지 않는 향로 안에서 달큰한 연기가 샌다.",hp:21,atk:5,def:3,eva:0,xp:8,color:'#786377',shape:'mage',kind:'construct',fixed:true,gasStatus57:'drunk'},
  {min:12,max:15,name:'향기요정',hp:16,atk:5,def:1,eva:7,xp:8,color:'#a989b5',shape:'angel',kind:'spirit',waterTrail:true,roleDesc61:'지나간 바닥을 잠시 물길로 바꿔 퇴로와 동선을 꼬이게 만든다.',concept57:'향기를 흩뿌리며 떠다니는 작은 요정이다.'},
  {min:12,max:15,name:'분홍거미',concept57:"비단빛 배를 끌고 좁은 내실을 비집는 거대한 거미다.",silkTrapCount57:2,hp:36,atk:7,def:6,eva:2,xp:12,color:'#a26784',shape:'beast',kind:'beast',footprint:'x3',web:true,wallBreak:true},
  {min:13,max:15,name:'구미호',hp:29,atk:8,def:3,eva:7,xp:14,color:'#d2a0a0',shape:'vampire',kind:'spirit',ranged:true,range:6,gaze:true,summoner:true,summonName57:'윈도',gumihoSkirm57:true,roleDesc61:'6칸 안에서 직선 시야를 계속 허용하면 시선이 점점 강해져 다섯 번째에 폭발하며 2턴 기절을 건다.',concept57:'시선을 붙들어 몸을 굳히는 요호다.'},
  {min:24,max:24,name:'구미묘',hp:72,atk:16,def:6,eva:9,xp:48,color:'#f2c75a',shape:'vampire',kind:'spirit',summonOnly57:true,miniBoss:true,reach:2,exitPressureSpeed57:{min:.5,max:1.5},gumiBehaviorVersion57:4,corpseRelocateSpan57:21,corpseRelocateMinRadius57:6,floor24Chaser57:true,persistentChase57:true,dormant57:true,revivalLives57:9,reviveWeakTurns57:2,reviveWeakAtkMul57:.65,reviveWeakDefMul57:.75,reviveWeakEvaDelta57:-2,reviveFullAtkMul57:1.35,reviveFullDefMul57:1.20,reviveFullEvaDelta57:2,deathCountsAsLosBreak57:true,gumiScaleVersion57:3,warningAura57:20,exitPressureSense57:{start:.38,exact:.76,maxError:6,interval:2},losLostSummon57:{names:['금령','보주의 파수꾼'],normalCooldown:7,fullCooldown:4},roleDesc61:'현관이 열릴 때는 평소의 절반 속도로 움직이지만 출구에 가까워질수록 빨라져 마침내 1.5배 속도로 덮친다. 쓰러지면 시체가 먼 곳으로 옮겨져 아홉 번까지 다시 일어난다. 쓰러뜨리는 순간에도 원혼들이 몰려올 수 있다.',concept57:'황금빛 구미호의 형상을 한 괴물이다.'},

  // 4구역 지하 장고 + 16층 성채.
  {min:16,max:20,name:'지네',concept57:"장고의 틈새를 채운 마디들이 일제히 꿈틀거린다.",hp:26,atk:8,def:2,eva:5,xp:8,color:'#785b45',shape:'beast',kind:'beast',poison:true,ambush:true},
  {min:16,max:20,name:'강시',concept57:"굳은 관절을 억지로 움직이는 시체다.",hp:38,atk:10,def:5,eva:2,xp:12,color:'#6d7770',shape:'undead',kind:'undead',hook:true},
  {min:16,max:20,name:'식귀',concept57:"먹어도 채워지지 않는 배를 움켜쥔 망자다.",hp:34,atk:9,def:3,eva:4,xp:10,color:'#89695c',shape:'human',kind:'undead',hungerDrain:8},
  {min:17,max:20,name:'산성 슬라임',concept57:"탁한 산액이 덩어리져 장고 바닥을 기어간다.",split:'acid',hp:32,atk:9,def:2,eva:1,xp:10,color:'#7f9d60',shape:'void',kind:'slime',armorPierce:true},
  {min:16,max:20,name:'굶주린 창고 쥐',concept57:"말라붙은 곡식 자루 사이에서 사람 냄새를 익힌 쥐다.",infectionHitsRequired57:2,hp:22,atk:7,def:1,eva:7,xp:7,color:'#705c51',shape:'beast',kind:'beast',fast:true},
  {min:18,max:20,name:'악어',concept57:"물속에 긴 몸을 감추고 턱만 내미는 포식자다.",hp:48,atk:11,def:5,eva:1,xp:13,color:'#596f55',shape:'beast',kind:'beast',footprint:'vertical3',aquatic:true,poison:true,heavyHit57:true},
  {min:20,max:20,name:'수비병',concept57:"장고 안쪽의 사선을 지키는 무장 수비대다.",guardPost57:true,hp:42,atk:10,def:7,eva:2,xp:12,color:'#8c704f',shape:'guard',kind:'human',ranged:true,range:6},
  {min:20,max:20,name:'강철이',concept57:"두꺼운 철갑으로 길목을 틀어막는 거구다.",guardPost57:true,hp:52,atk:12,def:6,eva:2,xp:15,color:'#64666a',shape:'brute',kind:'construct',charge:true},
  {min:20,max:20,name:'살라맨더',concept57:"용암의 열기를 두른 불도마뱀이다.",guardPost57:true,hp:38,atk:12,def:4,eva:4,xp:14,color:'#c16f4f',shape:'beast',kind:'beast',ranged:true,range:5,lava:true},
  {min:16,max:16,name:'화염 가고일',concept57:"성채에 붙박인 석상이 화구처럼 입을 벌린다.",hp:33,atk:9,def:5,eva:0,xp:10,color:'#8f6754',shape:'armor',kind:'construct',fixed:true,ranged:true,range:7,fireTrail:true},
  {min:16,max:16,name:'녹아내린 슬라임',concept57:"껍질을 잃은 용광로처럼 끓어오르는 점액 덩어리다.",hp:31,atk:10,def:2,eva:1,xp:10,color:'#ad5e39',shape:'void',kind:'slime',lava:true,gasStatus57:'poison',lavaTrail57:true},
  {min:16,max:16,name:'경비 인형 - 보병',concept57:"명령을 잊지 않은 인형이 긴 창을 들고 선다.",guardPost57:true,hp:38,atk:9,def:6,eva:1,xp:11,color:'#7e776a',shape:'guard',kind:'construct',reach:2},
  {min:16,max:16,name:'해자 잠복꾼',concept57:"뜨거운 해자 곁에 몸을 낮춘 갈고리 사냥꾼이다.",guardPost57:true,hp:36,atk:10,def:3,eva:2,xp:12,color:'#8f4e36',shape:'beast',kind:'beast',lava:true,hook:true},
  {min:16,max:16,name:'경비 인형 - 포병',concept57:"무거운 포신을 돌리며 성채의 통로를 겨누는 인형이다.",guardPost57:true,hp:32,atk:10,def:5,eva:0,xp:12,color:'#706a61',shape:'armor',kind:'construct',ranged:true,range:8,artillery:true},
  {min:16,max:16,name:'성채 비행 감시자',concept57:"성벽 위를 맴도는 가벼운 감시 인형이다.",hp:22,atk:6,def:1,eva:8,xp:8,color:'#9b7958',shape:'angel',kind:'construct',support:true,flying:true},

  // 5구역 만루의 심장: 기획안의 비현실적 영물/신전 수호자 중심.
  {min:21,max:25,name:'공허 가오리',concept57:"바닥 없는 공간을 물처럼 가르는 영물이다.",hp:40,atk:13,def:3,eva:8,xp:14,color:'#695d79',shape:'angel',kind:'spirit',flying:true,fast:true,knockback:true},
  {min:21,max:25,name:'만루의 수호상',concept57:"수없이 드나든 발자국을 내려다보던 돌 수호상이다.",guardPost57:true,hp:70,atk:14,def:10,eva:0,xp:18,color:'#aa9569',shape:'brute',kind:'construct',armorPierce:false,heavyHit57:true},
  {min:21,max:25,name:'천수 아수라',concept57:"겹겹의 팔이 서로 다른 박자로 움직이는 전투의 영체다.",hp:58,atk:14,def:6,eva:5,xp:18,color:'#8f7ab0',shape:'angel',kind:'spirit',multiAttack:true,asura47:true,asuraRadius47:3,asuraDuration47:5,asuraCooldown47:6,asuraRange47:9,enrage:true},
  {min:22,max:25,name:'신전 사제 망령',concept57:"주인을 잃은 신전에서도 의식을 멈추지 않는 사제다.",hp:40,atk:12,def:4,eva:5,xp:16,color:'#8c7895',shape:'mage',kind:'undead',ranged:true,range:8,sealSkill:true},
  {min:22,max:25,name:'차원 포식자',concept57:"공간의 어두운 틈에서 몸을 드러내는 포식자다.",hp:50,atk:16,def:5,eva:6,xp:18,color:'#6a445f',shape:'void',kind:'spirit',ambush:true,focusDrain:3},
  {min:23,max:25,name:'보주의 파수꾼',concept57:"황금빛 무장을 두른 만루보주의 최후 전열이다.",guardPost57:true,hp:76,atk:16,def:8,eva:3,xp:22,color:'#b19055',shape:'knight',kind:'spirit',knockback:true,enrage:true},
  {min:21,max:25,name:'금령',hp:32,atk:10,def:4,eva:3,xp:12,color:'#c6a85f',shape:'spirit',kind:'spirit',ranged:true,range:4,artillery:true,artilleryRange61:4,hungerDrain:8,flying:true,summonOnly57:true,concept57:'황금 제단의 기운이 뭉친 영체다.',roleDesc61:'4칸 안에서 3×3 폭발탄을 예고한다. 폭발이나 직접 공격에 맞으면 허기가 8 감소한다.'},
  {min:23,max:24,name:'여의 수룡',concept57:"수은호 아래 거대한 몸을 감춘 수룡이다.",hp:96,atk:17,def:7,eva:3,xp:32,color:'#8e9fa0',shape:'void',kind:'beast',footprint:'dragon',aquatic:true,mercuryAdapted57:true,reach:3,summoner:true,summonName57:'금령',miniBoss:true},
  {min:23,max:23,name:'수은 물고기',hp:22,atk:9,def:1,eva:6,xp:9,color:'#8fa09f',shape:'beast',kind:'beast',aquatic:true,mercuryAdapted57:true,fixed:true,concept57:'수은 연못에서 살아남은 식인 물고기다.'}
];
const SPECIAL_MONSTER_CONCEPTS57=Object.freeze({
  "작은 먹물": "찢어진 먹물 정령에게서 떨어져 나온 작은 얼룩이다.",
  "소형 산성 슬라임": "큰 산성 덩어리가 터지며 남긴 잔해다.",
  "종이 호랑이": "화공의 붓끝에서 뛰쳐나온 종이 맹수다.",
  "흑색 재봉 천면경": "침모의 검은 천면경이다.",
  "재봉 천면경": "침모가 실을 걸어 둔 얇은 거울이다.",
  "실종된 선행 조사관": "먼저 만루에 들어갔던 조사관이 낡은 제복 차림으로 길을 막는다.",
  "만루보주 · 본모습": "빌려 쓴 얼굴 아래에서 만루의 주인이 모습을 드러냈다."
});
const WEAPONS=[
  // 1티어 · 청풍루
  {type:'weapon',name:'조잡한 단검',tier:1,rarity:'common',atk:0,speed:2.2,range:1,kind:'blade',ability:'절개',desc:'이가 다 빠진 낡은 단도입니다. 커튼과 풀숲을 베는 데 힘이 들지 않습니다.'},
  {type:'weapon',name:'나무 몽둥이',tier:1,rarity:'common',atk:1,speed:1.0,range:2,kind:'blunt',armorPierce:true,ability:'방어무시',desc:'거칠게 깎은 단단한 참나무 몽둥이입니다.'},
  {type:'weapon',name:'무딘 소검',tier:1,rarity:'common',atk:1,speed:1.4,range:2,kind:'blade',ability:'없음',desc:'가장 평범한 형태의 호신용 칼입니다.'},
  {type:'weapon',name:'대나무창',balance52:true,tier:1,rarity:'common',atk:0,speed:0.62,range:3,kind:'spear',knockback:1,ability:'밀치기',desc:'끝을 뾰족하게 깎은 긴 대나무입니다.'},
  {type:'weapon',name:'사냥용 목궁',balance52:true,tier:1,rarity:'common',atk:0,speed:0.48,range:6,kind:'bow',ranged:true,ability:'원거리',desc:'산짐승을 잡을 때 쓰던 낡은 활입니다.'},
  {type:'weapon',name:'낡은 장도리',tier:1,rarity:'common',atk:2,speed:.5,range:1,kind:'blunt',armorPierce:true,breakPower:2,ability:'방어무시 · 파괴',desc:'무언가를 부수거나 고칠 때 쓰던 연장입니다.'},
  // 2티어 · 수묵원
  {type:'weapon',name:'수련용 환도',tier:2,rarity:'rare',atk:2,speed:1.8,range:2,kind:'blade',focusChain:true,ability:'집중',desc:'무관 지망생들이 기본기를 익힐 때 쓰는 검입니다.'},
  {type:'weapon',name:'강철 보검',tier:2,rarity:'rare',atk:4,speed:1.1,range:2,kind:'blade',ability:'없음',desc:'잘 연마되어 푸른 빛이 도는 강철 검입니다.'},
  {type:'weapon',name:'철두창',balance52:true,tier:2,rarity:'rare',atk:2,speed:0.55,range:4,kind:'spear',knockback:1,ability:'밀치기',desc:'창날이 무거워 찌르는 힘이 강력한 창입니다.'},
  {type:'weapon',name:'낫',tier:2,rarity:'rare',atk:3,speed:1.3,range:2,kind:'blade',wide:true,ability:'광역타격',desc:'수풀을 베기 위해 고안된 날카로운 곡선형 칼입니다.'},
  {type:'weapon',name:'손도끼',tier:2,rarity:'rare',atk:5,speed:.6,range:1,kind:'blunt',armorPierce:true,breakPower:2,ability:'방어무시 · 쇄도',desc:'나무 문을 부수기에 아주 적합한 묵직한 도끼입니다.'},
  {type:'weapon',name:'병사용 반궁',balance52:true,tier:2,rarity:'rare',atk:2,speed:0.54,range:7,kind:'bow',ranged:true,ability:'원거리',desc:'군에서 정식으로 보급하는 표준형 활입니다.'},
  // 3티어 · 유혹의 내실
  {type:'weapon',name:'쌍날 단도',tier:3,rarity:'relic',atk:4,speed:2.5,range:1,kind:'blade',chain:.12,ability:'연격',desc:'양손에 쥐고 춤추듯 휘두를 수 있는 짧은 칼쌍입니다.'},
  {type:'weapon',name:'암살용 비수',tier:3,rarity:'relic',atk:5,speed:1.4,range:2,kind:'blade',crit:.10,ability:'치명 +10%',desc:'그림자 속에서 급소를 노리기 위해 제작된 비수입니다.'},
  {type:'weapon',name:'편곤',tier:3,rarity:'relic',atk:6,speed:.8,range:2,kind:'blunt',armorPierce:true,cornerHit:true,ability:'방어무시 · 곡격',desc:'장애물 뒤에 숨은 적의 머리를 타격할 수 있는 기묘한 무기입니다.'},
  {type:'weapon',name:'삼각창',balance52:true,tier:3,rarity:'relic',atk:4,speed:0.61,range:4,kind:'spear',bleed:.25,ability:'파고들기',desc:'세 갈래 날이 살점을 파고들어 떼어내기 힘들게 만듭니다.'},
  {type:'weapon',name:'강화 각궁',balance52:true,tier:3,rarity:'relic',atk:4,speed:0.4,range:8,kind:'bow',ranged:true,knockback:1,ability:'밀치기',desc:'짐승의 힘줄을 겹겹이 발라 탄성이 극대화된 각궁입니다.'},
  {type:'weapon',name:'무쇠 메',tier:3,rarity:'relic',heavyStrikeBalance105:3,atk:15,speed:.3,range:2,kind:'blunt',armorPierce:true,stun:.16,ability:'방어무시 · 균열',desc:'무거운 쇳덩이를 자루 끝에 매단 투박한 파괴 병기입니다.'},
  // 4티어 · 지하 장고
  {type:'weapon',name:'연철 권갑',tier:4,rarity:'sealed',atk:3,speed:1.6,range:1,kind:'brawl',brawlWeapon:true,lowUpgrade42:true,ability:'연타 · 격투 연계',desc:'손등과 팔뚝을 연철 판으로 감싼 권갑이다. 맨손 격투의 이점을 그대로 얻지만, 강화부적 세 장을 써야 공격력이 1 오른다.'},
  {type:'weapon',name:'육각 철봉',tier:4,rarity:'sealed',atk:7,speed:1.2,range:2,kind:'blunt',armorPierce:true,stun:.12,ability:'방어무시 · 진동',desc:'속이 꽉 찬 육각 쇳덩이 봉으로, 뼈를 부수기에 알맞습니다.'},
  {type:'weapon',name:'장갑 도끼',tier:4,rarity:'sealed',atk:8,speed:.9,range:2,kind:'blunt',armorPierce:true,shred:true,ability:'방어무시 · 파갑',desc:'방패나 두꺼운 갑옷을 찢어버리기 위해 설계된 전투 도끼입니다.'},
  {type:'weapon',name:'협도',tier:4,rarity:'sealed',atk:7,speed:.8,range:3,kind:'blade',wide:true,ability:'휩쓸기',desc:'긴 자루와 넓은 칼날로 다수의 적을 한 번에 베어 넘깁니다.'},
  {type:'weapon',name:'철참도',tier:4,rarity:'sealed',atk:10,speed:.9,range:2,kind:'blade',ability:'없음',desc:'말에 탄 적도 단칼에 베어버릴 만큼 무겁고 예리한 대도입니다.'},
  {type:'weapon',name:'정량궁',balance52:true,tier:4,rarity:'sealed',atk:6,speed:0.32,range:9,kind:'bow',ranged:true,knockback:1,ability:'밀치기 · 충격',desc:'시위를 당기는 것조차 고역인 공성용에 가까운 대형 활입니다.'},
  {type:'weapon',name:'대형 오해머',tier:4,rarity:'sealed',heavyStrikeBalance105:3,atk:19,speed:.2,range:2,kind:'blunt',armorPierce:true,knockback:2,stun:.2,ability:'방어무시 · 압쇄',desc:'성문을 부술 때 사용하는 거대한 쇳덩이 망치입니다.'},
  // 5티어 · 만루의 심장
  {type:'weapon',name:'별운검',tier:5,rarity:'sealed',atk:9,speed:1.8,range:2,kind:'blade',crit:.14,ability:'치명 +14%',desc:'구름 문양이 새겨진 왕실의 검으로, 바람보다 빠르게 적을 벱니다.'},
  {type:'weapon',name:'태도',tier:5,rarity:'sealed',atk:12,speed:.9,range:3,kind:'blade',edgeBonus:true,ability:'밀치기 · 일섬',desc:'극도로 길게 단련된 날은 적이 닿기도 전에 생명을 끊습니다.'},
  {type:'weapon',name:'당파',balance52:true,tier:5,rarity:'sealed',atk:8,speed:0.53,range:5,kind:'spear',knockback:1,parry:.18,ability:'방어 · 얽기',desc:'공격을 막아내고 동시에 찌를 수 있는 완벽한 방어용 창입니다.'},
  {type:'weapon',name:'금강령 퇴',tier:5,rarity:'sealed',atk:11,speed:.8,range:2,kind:'blunt',armorPierce:true,stun:.22,holy:2,ability:'방어무시 · 정화',desc:'법구의 형상을 한 둔기로, 타격 시 사악한 기운을 쫓아냅니다.'},
  {type:'weapon',name:'단단한 철궁',balance52:true,tier:5,rarity:'sealed',atk:7,speed:0.4,range:10,kind:'bow',ranged:true,tracking:true,ability:'추적',desc:'현대 기술로도 재현하기 힘든 장력과 정교함을 가진 활입니다.'},
  {type:'weapon',name:'대장간 망치',tier:5,rarity:'sealed',heavyStrikeBalance105:2,atk:21,speed:.2,range:2,kind:'blunt',armorPierce:true,knockback:2,execute:.20,ability:'방어무시 · 종결',desc:'만루를 지은 장인의 혼이 깃든, 세상의 모든 것을 부술 수 있는 망치입니다.'}
];
const ARMORS=[
  {type:'armor',name:'경량복',tier:1,rarity:'common',def:1,eva:1,desc:'정부 요원들이 평시 활동을 위해 입는 가볍고 활동성 좋은 제식 복장.'},
  {type:'armor',name:'강화 가죽 갑옷',tier:2,rarity:'rare',def:3,eva:0,desc:'경량복 위에 질긴 가죽판을 덧대어 실전 대응력을 높였습니다.'},
  {type:'armor',name:'철제 흉갑',tier:3,rarity:'relic',def:5,eva:-1,desc:'주요 장기를 보호하기 위해 정교하게 제련된 철판을 부착했습니다.'},
  {type:'armor',name:'관원용 두정갑',tier:4,rarity:'sealed',def:9,eva:-2,desc:'정부 고위직에게 지급되는 제식 갑옷이다. 옷 안에 촘촘한 철갑을 숨겼으며, 방어력이 높아 강화부적을 쓰면 더 단단해진다.'},
  {type:'armor',name:'총사령관 황금갑',tier:5,rarity:'sealed',def:12,eva:-2,will:1,desc:'정부 최고위 무관에게만 하사되는 황금 비늘 갑옷이다. 본래 방어력이 가장 높아 강화부적의 효과도 크다.'}
];
const CLOAKS=[
  {type:'cloak',name:'질긴 가죽망토',tier:1,rarity:'common',staggerResist:.12,desc:'짐승의 가죽을 대충 잘라 만든 망토. 피격 후 경직을 조금 줄입니다.'},
  {type:'cloak',name:'바람막이망토',tier:1,rarity:'common',focusRegen:1.08,desc:'얇은 천으로 된 망토. 숨을 고를 때 기 회복이 약간 빨라집니다.'},
  {type:'cloak',name:'여행자망토',tier:1,rarity:'common',eatSpeed:1.10,desc:'주머니가 많이 달려 있어 음식을 조금 더 빠르게 꺼내 먹습니다.'},
  {type:'cloak',name:'두꺼운 면망토',tier:1,rarity:'common',hazardResist:.10,desc:'솜을 얇게 넣어 지형 피해를 조금 줄입니다.'},
  {type:'cloak',name:'암영망토',tier:3,rarity:'relic',senseReduce:1,desc:'어둠 속에서 몸을 숨기기 좋게 제작되어 적의 인식 거리를 줄입니다.'},
  {type:'cloak',name:'축지망토',tier:3,rarity:'relic',moveSpeed:1.15,desc:'깃털처럼 가벼워 발걸음을 빠르게 만듭니다.'},
  {type:'cloak',name:'자력망토',tier:3,rarity:'relic',magnet:2,desc:'주변의 전리품을 몸 쪽으로 끌어당기는 기묘한 외투입니다.'},
  {type:'cloak',name:'무술망토',tier:4,rarity:'sealed',focusRegen:2,desc:'무술의 흐름을 돕는 문양이 새겨져 기 회복 주기가 크게 빨라집니다.'},
  {type:'cloak',name:'보호망토',tier:4,rarity:'sealed',def:3,desc:'겉감 사이에 얇은 사슬이 박혀 있어 방어력이 크게 오릅니다.'},
  {type:'cloak',name:'반사망토',tier:4,rarity:'sealed',reflect:.25,desc:'거울처럼 매끄러운 비단이 원거리 공격을 일정 확률로 되돌립니다.'},
  {type:'cloak',name:'용암망토',tier:5,rarity:'sealed',lavaWalk:true,desc:'화신석 실로 짠 도포. 용암을 밟고 지나갈 수 있습니다.'},
  {type:'cloak',name:'면역망토',tier:5,rarity:'sealed',statusImmune:true,desc:'신성한 비단이 독·출혈·혼란과 같은 상태이상을 막아냅니다.'}
];
const RELICS=[
  {type:'relic',name:'장독 속 무언가',rarity:'relic',def:1,vision:-1,jarOnly57:true,jarOnMartial57:true,desc:'장독 바닥에서 건져 올린 오래된 반지. DEF +1, VIS -1. 무술을 사용할 때마다 주변의 안전하고 넓은 빈 바닥에 장독 하나를 설치한다. 놓을 자리가 없으면 설치하지 않는다.'},
  {type:'relic',name:'붉은 등롱 심지',rarity:'relic',vision:1,focus:2,desc:'시야 +1, 기력 +2'},
  {type:'relic',name:'먹빛 벼루 조각',rarity:'relic',will:2,focus:2,desc:'WILL +2, 기력 +2. 적의 확률형 상태이상에 더 잘 저항합니다.'},
  {type:'relic',name:'깨진 천면경',rarity:'relic',eva:3,desc:'EVA +3'},
  {type:'relic',name:'장고의 쇠갈고리',rarity:'relic',atk:2,desc:'ATK +2'},
  {type:'relic',name:'용의 여의주 파편',rarity:'sealed',atk:2,def:2,focus:3,desc:'ATK/DEF +2, 기력 +3'}
];
const TRINKETS=[
  {type:'trinket',name:'방 번호패',rarity:'common',vision:1,desc:'길을 기억하기 쉬워진다. VIS +1'},
  {type:'trinket',name:'비단 매듭',rarity:'rare',eva:2,desc:'EVA +2'},
  {type:'trinket',name:'금박 부적',rarity:'relic',will:2,desc:'WILL +2. 적의 확률형 상태이상에 더 잘 저항합니다.'}
];
const CONSUMABLES=[
  // PDF 기본 음식 8종
  {name:'주먹밥',type:'food',foodKind:'riceball',rarity:'common',hunger:22,eatCost57:.5,stackMax:4,minFloor:1,desc:'찬밥을 뭉쳐 소금으로 간을 한 간단한 요기 거리입니다. 전투 중에도 빠르게 먹을 수 있습니다.'},
  {name:'말린 육포',type:'food',foodKind:'jerky',rarity:'common',hunger:34,eatCost57:1,stackMax:6,minFloor:1,desc:'질긴 고기를 얇게 썰어 말렸습니다. 부피가 작아 여러 개를 겹쳐 들 수 있습니다.'},
  {name:'신선한 생선 살',type:'food',foodKind:'raw_fish',rarity:'common',hunger:20,eatCost57:.75,raw:true,naturalOnly57:true,stackMax:3,minFloor:6,desc:'수묵원의 식인 물고기에게서 얻은 싱싱한 살점입니다. 날로 먹으면 낮은 확률로 배탈이 납니다.'},
  {name:'엽전 엿',type:'food',foodKind:'coin_candy',rarity:'rare',hunger:7,eatCost57:.5,focusPercent57:.60,stackMax:99,minFloor:1,desc:'달콤한 조청을 굳혀 만든 간식입니다. 허기는 거의 채우지 못하지만 최대 기력의 60%를 빠르게 회복합니다. 상점 교환과 조리에도 쓰입니다.'},
  {name:'신선로',type:'food',foodKind:'royal_hotpot',rarity:'relic',hungerFull57:true,eatCost57:1,regenTurns:12,stackMax:1,minFloor:16,desc:'각종 귀한 재료를 넣고 끓인 화려한 요리입니다. 허기를 완전히 채우고 12턴 동안 체력이 재생됩니다.'},
  {name:'식어버린 국밥',type:'food',foodKind:'cold_soup',rarity:'common',hunger:55,eatCost57:2,slowEat:true,stackMax:2,minFloor:1,desc:'기름이 둥둥 뜬 차가운 국밥이다. 허기를 많이 채워주지만 먹는 데 2턴이 걸린다.'},
  {name:'독버섯 꼬치',type:'food',foodKind:'poison_skewer',rarity:'rare',hunger:28,eatCost57:1,poisonSelf:true,throwableFood57:true,throwRange57:4,stackMax:2,minFloor:6,desc:'색깔이 화려한 버섯을 구워 만들었습니다. 먹으면 중독되지만 요괴에게 던져 독을 먹일 수 있습니다.'},
  {name:'신선도',type:'food',foodKind:'peach',rarity:'relic',hunger:42,eatCost57:.75,cleanse:true,stackMax:2,minFloor:21,desc:'만루의 심장에서 자란 영험한 복숭아입니다. 허기를 채우고 모든 해로운 상태를 정화합니다.'},

  // 현장 조리 및 PDF 비방 레시피 결과물
  {name:'구운 생선 살',type:'food',foodKind:'grilled_fish',rarity:'rare',hunger:30,eatCost57:.75,craftedOnly57:true,stackMax:3,desc:'불에 알맞게 익혀 잡내를 없앴습니다. 날생선보다 허기 회복량이 1.5배 높고 배탈 위험이 없습니다.'},
  {name:'전력 주먹밥',type:'food',foodKind:'power_riceball',rarity:'rare',hunger:42,eatCost57:.75,craftedOnly57:true,foodHasteTurns57:6,stackMax:3,desc:'엿을 섞어 뭉친 주먹밥이다. 6턴 동안 공격에 드는 시간이 10% 줄어든다.'},
  {name:'매콤한 육포',type:'food',foodKind:'spicy_jerky',rarity:'rare',hunger:40,eatCost57:1,craftedOnly57:true,warmTurns57:12,fireCoatTurns57:12,stackMax:3,desc:'화염 기름에 살짝 구운 육포입니다. 12턴 동안 추위에 면역이며 공격 시 낮은 확률로 불을 붙입니다.'},
  {name:'한방 생선찜',type:'food',foodKind:'medicinal_fish',rarity:'relic',hunger:46,eatCost57:1,craftedOnly57:true,poisonResistTurns57:12,stackMax:2,desc:'독버섯의 독기를 약재로 중화해 쪄낸 생선입니다. 중독을 해제하고 12턴 동안 새 중독을 막습니다.'},
  {name:'원력 숭늉',type:'food',foodKind:'talisman_sungnyung',rarity:'rare',hunger:18,eatCost57:.75,craftedOnly57:true,focusPercent57:.30,stackMax:3,desc:'식은 국밥에 깨끗한 물을 부어 끓였습니다. 허기를 조금 채우고 최대 기력의 30%를 회복합니다.'},
  {name:'보신 전골',type:'food',foodKind:'vital_hotpot',rarity:'relic',hungerFull57:true,eatCost57:1.25,craftedOnly57:true,vitalityTurns57:100,stackMax:2,desc:'육지와 바다의 재료를 푹 고았습니다. 허기를 완전히 채우고 100턴 동안 최대 HP가 10 증가합니다.'},
  {name:'얼음 복숭아',type:'food',foodKind:'ice_peach',rarity:'sealed',hunger:42,eatCost57:.75,craftedOnly57:true,freeStaminaTurns57:6,stackMax:2,desc:'차가운 기운이 속까지 밴 복숭아다. 6턴 동안 이동과 공격에 드는 시간이 절반으로 줄어든다.'},
  {name:'창해말이',type:'food',foodKind:'palace_roll',rarity:'rare',hunger:14,eatCost57:.5,regenTurns:4,craftedOnly57:true,recipeResult57:true,cookingOnly57:true,branchExclusive105:true,stackMax:99,ability:'허기 +14 · 재생 4턴',desc:'약초실의 해초에 밥과 구운 생선, 매콤한 육포를 말아 한입 크기로 썬 용궁 요리. 솥·화로에서 한 번에 10개 만든다. 하나마다 허기 14를 채우고 4턴 동안 체력이 재생된다. 최대 99개까지 겹쳐 담는다.'},
  {name:'검게 탄 숯',type:'food',foodKind:'charcoal',rarity:'common',hunger:0,eatCost57:.75,craftedOnly57:true,charcoalDamage57:5,stackMax:4,desc:'목재·식물이 타거나 조리에 실패해 남은 숯. 주변 불길로는 점화되지 않는다. 직접 불속성이 닿으면 2턴간 불씨를 옮기다 소모된다. 물로 끄거나 주워 보관할 수 있다. 먹으면 몸만 상한다.'},

  // PDF 레시피에서 요구하지만 획득법이 비어 있어 지형 맥락에 맞춰 배치한 재료
  {name:'깨끗한 물',type:'ingredient',foodKind:'clean_water',rarity:'common',ingredientOnly57:true,stackMax:4,throwable:true,throwRange:4,throwElement105:'water',color:'#75bad9',useCost:1,ability:'4칸 투척 · 3×3 물기운 · 조리 재료',desc:'숭늉과 전골을 끓이는 맑은 물입니다. 4칸 안에 던지면 주변 3×3의 불길과 불씨를 끄고 기름을 씻어냅니다. 종이다리는 젖어 무너집니다. 직접 피해는 없습니다.'},
  {name:'해초',type:'ingredient',foodKind:'seaweed',rarity:'rare',ingredientOnly57:true,naturalOnly57:true,branchExclusive105:true,stackMax:99,ability:'용궁 약초실 전용 조리 재료',desc:'용궁의 해초 약초 조제실에서만 채취하는 깨끗한 해초. 솥에서 소회복 비약과 섞으면 중회복 비약이 된다. 솥·화로에서 주먹밥, 구운 생선 살, 매콤한 육포와 함께 창해말이 10개를 만든다.'},
  {name:'빙결액',type:'ingredient',foodKind:'ice_essence',rarity:'rare',ingredientOnly57:true,minFloor:6,stackMax:3,throwable:true,throwRange:4,throwElement105:'ice',color:'#b0e8ef',useCost:1,ability:'4칸 투척 · 3×3 냉기 · 물 동결 5턴 · 조리 재료',desc:'얼음 복숭아를 만드는 냉기가 응축된 액체입니다. 4칸 안에 던지면 주변 3×3의 물을 5턴 동안 얼리고 몸에 붙은 불을 끕니다. 마른 바닥은 얼리지 않으며 직접 피해는 없습니다.'}
];
const STATUS_META57={
 illness:{harmful:true,glyph57:["0110110","1111111","1110111","1101011","0110110","0011100","0001000"],color57:'#b96bc9',monsterField57:'illness105',monsterDamage57:44,cleanseable:true,lethal:true,label:'중병',screen:{color:'#b96bc9',priority:90,strength:.30,motif:'veins'}},
 poison:{harmful:true,glyph57:["0111110","1111111","1101011","1101011","0111110","0010100","0111110"],color57:'#80b75b',monsterField57:'poisoned57',legacyMonsterFields57:['poisoned55','poison74'],cleanseable:true,label:'중독',screen:{color:'#80b75b',priority:40,strength:.24,motif:'mist'}},bleed:{harmful:true,glyph57:["0001000","0011100","0011100","0111110","1111111","1111011","0111110"],color57:'#bf4354',monsterField57:'bleeding55',cleanseable:true,label:'출혈',screen:{color:'#bf4354',priority:60,strength:.28,motif:'veins'}},blind:{harmful:true,glyph57:["1000000","0111110","1010101","1001001","1010101","0111110","0000001"],color57:'#aaa0c5',monsterField57:'blinded55',legacyMonsterField57:'blinded74',visionScale57:.55,visionFloor57:3,nightmareVisionFloor57:1,missPenalty57:.24,cleanseable:true,label:'실명',screen:{color:'#171020',priority:80,strength:.48,motif:'mist'}},weaken:{harmful:true,glyph57:["0011100","0011100","0011100","1111111","0111110","0011100","0001000"],color57:'#a58a69',monsterField57:'weakened',cleanseable:true,label:'쇠약',screen:{color:'#a58a69',priority:20,strength:.18,motif:'mist'}},stun:{harmful:true,glyph57:["0001001","0001000","0011100","1111111","0011100","0001000","1001000"],color57:'#f0ca78',monsterField57:'stunned',cleanseable:true,control:true,label:'기절',screen:{color:'#f0ca78',priority:100,strength:.32,motif:'rays'}},upset:{harmful:true,glyph57:["0011000","0011000","0011110","0110011","1100011","1000110","0111100"],color57:'#d4a065',monsterField57:'upset',cleanseable:true,label:'배탈'},drunk:{harmful:true,glyph57:["0011100","0001000","0011100","0100010","0111110","1111111","0111110"],color57:'#b487d6',monsterField57:'drunk',cleanseable:true,label:'취함',screen:{color:'#b487d6',priority:30,strength:.24,motif:'rings'}},skillSeal:{harmful:true,glyph57:["0111110","1100011","1010101","1001001","1010101","1100011","0111110"],color57:'#86bad1',monsterField57:'skillSeal105',cleanseable:true,control:true,label:'기봉인',screen:{color:'#86bad1',priority:70,strength:.30,motif:'seal'}},
 haste:{buff:true},evade:{buff:true},ward:{buff:true},stealth:{buff:true},regen:{buff:true},swift:{buff:true},fortify:{buff:true},willBoost:{buff:true}
};
