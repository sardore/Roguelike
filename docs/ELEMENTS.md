# elements 도메인 (원소 반응) — 이동 전 목록과 의존 수치

사용자 결정(2026-10-11): 원소 반응 코드는 "가장 많이 쓰는 도메인" 규칙을 적용하지 않고 `src/game/elements.js`로 모은다. 이 문서는 옮기기 전에 계산한 목록이다(F-21 수정 직후 트리 기준).

## 고른 방법
1. 이름으로 고른 시작 집합 38개: 원소·물 얼리기/녹이기·증기·점화·연소·감전·숯·재질(`Material105`)·지형 반응(`TerrainReaction`)·원소 필드(`ElementField`, `Elem74`)에 해당하는 최상위 선언. 그리기 함수(`draw*`)는 제외(render에 남음).
2. 전용 도우미 4개: 시작 집합 안에서만 쓰이는 선언(고정점 계산) — `revealEnvironmentalClue105`, `guard74`, `hurtSelf74`, `extinguish74`.

합계 42문장, 243줄. 현재 위치: spine.js 30, items 5, branches 3, combat 2, monsters 1, render 1.

## 의존 수치(참조 횟수)
- 들어오는 참조(집합 밖에서 이 집합을 쓰는 곳): spine 39, branches 27, monsters 25, items 18, combat 18, render 12, mapgen 2, save 1, special 1, ui 1, qa 1. 집합 내부 참조 90.
- 나가는 참조(이 집합이 쓰는 것): spine 232(대부분 `state`·`TT` 계열과 아직 spine에 있는 지형·로그 함수), branches 46, items 23, mapgen 19, monsters 11, render 10, combat 8, ui 5, save 1, kernel 54.
- 로드 시점: 값 4개(`ELEMENT_MATERIALS105`, `COMBUSTION_RULES105`, `ELEMENT_FX_COLORS105`, `ELEMENT_KIND74`)는 모두 로드 중 읽히지 않는다(load-reads 계측). 함수는 호이스팅되므로 순서 제약이 없다. 파일 위치: branches.js 뒤, spine.js 앞.

## 목록
| 이름 | 현재 위치 | 종류 | 줄 | 들어오는 참조(누가 쓰나) | 나가는 참조(무엇을 쓰나, kernel 제외) |
|---|---|---|---:|---|---|
| `terrainReactions105` | items | 함수 | 8 | elements 8, spine 6, render 1 | spine 6, elements 2, branches 1, items 1 |
| `elementCells105` | items | 함수 | 4 | elements 7, items 6, spine 5, monsters 3, combat 2, render 2, branches 1 | mapgen 3, branches 2 |
| `coolCharcoal105` | items | 함수 | 4 | items 2, elements 2 | - |
| `dropBurntCharcoal105` | items | 함수 | 4 | monsters 1, branches 1, elements 1 | branches 1, items 1, spine 1 |
| `addElemField74` | items | 함수 | 1 | items 2, elements 1 | spine 8, mapgen 3, elements 2 |
| `elementMaterial105` | combat | 함수 | 6 | elements 6, spine 3, render 2, combat 1 | spine 2, elements 2, branches 1 |
| `weaponElement105` | combat | 함수 | 1 | combat 3, elements 1, spine 1 | spine 1 |
| `summonTalismanElement105` | monsters | 함수 | 1 | monsters 4 | items 1, monsters 1 |
| `wallMaterial105` | render | 함수 | 3 | render 3, elements 1, branches 1 | spine 2, branches 2 |
| `isWaterTile105` | branches | 함수 | 1 | branches 7, render 3, elements 2, spine 1 | - |
| `elementalStructureAt105` | branches | 함수 | 4 | monsters 2, elements 2, branches 1 | branches 1 |
| `destroyElementStructure105` | branches | 함수 | 3 | branches 1, elements 1 | elements 1, branches 1 |
| `ELEMENT_MATERIALS105` | spine | 값 | 7 | elements 1 | - |
| `elementAffectsMaterial105` | spine | 함수 | 1 | elements 3 | - |
| `newTerrainReactions105` | spine | 함수 | 1 | spine 3, mapgen 2, save 1, elements 1, special 1, branches 1 | - |
| `touchElementTerrain105` | spine | 함수 | 1 | elements 6, spine 3 | elements 1, branches 1, spine 1 |
| `elementBreakFx105` | spine | 함수 | 5 | branches 3, elements 2, monsters 1, spine 1 | render 4, spine 3, branches 1 |
| `igniteCharcoal105` | spine | 함수 | 7 | elements 1 | spine 3, items 1 |
| `destroyElementProp105` | spine | 함수 | 10 | elements 2 | spine 13, branches 8, elements 7, monsters 3 |
| `COMBUSTION_RULES105` | spine | 값 | 1 | elements 1, spine 1 | - |
| `combustionContact105` | spine | 함수 | 7 | elements 3, spine 2, combat 1 | spine 5, elements 2, branches 1 |
| `steamCell105` | spine | 함수 | 5 | elements 3, items 1 | spine 4 |
| `conductShock105` | spine | 함수 | 6 | elements 1 | spine 10, branches 8, mapgen 4, elements 2 |
| `revealEnvironmentalClue105` (전용 도우미) | spine | 함수 | 4 | elements 1 | spine 4, branches 3, elements 1 |
| `ELEMENT_FX_COLORS105` | spine | 값 | 1 | monsters 1, render 1, elements 1, ui 1 | - |
| `elementAttackFx105` | spine | 함수 | 4 | items 3, branches 3, elements 3, monsters 2, combat 1, spine 1 | spine 3, mapgen 2, elements 2, render 2, branches 1 |
| `freezeWater105` | spine | 함수 | 6 | elements 1 | spine 6, monsters 1 |
| `thawWater105` | spine | 함수 | 6 | monsters 1, branches 1, elements 1 | spine 5, monsters 1 |
| `emitElementContact105` | spine | 함수 | 40 | elements 8, spine 6, combat 5, monsters 4, branches 4, items 3 | spine 29, elements 24, branches 9, mapgen 2, items 1, monsters 1, combat 1, render 1 |
| `tickTerrainReactions105` | spine | 함수 | 21 | monsters 1, spine 1 | spine 24, elements 10, branches 1, items 1 |
| `elementalWorldTarget105` | spine | 함수 | 1 | combat 2, spine 1, qa/qa 1 | elements 7, spine 2, render 1, branches 1 |
| `applyElementField57` | spine | 함수 | 12 | monsters 1, branches 1, elements 1 | spine 11, mapgen 5, elements 4, branches 1 |
| `entityElementGuard57` | spine | 함수 | 5 | elements 4, combat 2 | spine 5 |
| `entityElementMultiplier57` | spine | 함수 | 11 | elements 1 | spine 17, elements 1 |
| `resolveElementDamage57` | spine | 함수 | 17 | monsters 3, elements 3, branches 2, items 1, combat 1, spine 1 | spine 14, elements 4, branches 2, ui 2, combat 2, items 1, render 1, monsters 1 |
| `tickElementFields57` | spine | 함수 | 3 | monsters 1, spine 1 | spine 5, elements 1 |
| `ELEMENT_KIND74` | spine | 값 | 1 | elements 1, spine 1 | - |
| `baseElem74` | spine | 함수 | 1 | elements 1 | elements 1 |
| `guard74` (전용 도우미) | spine | 함수 | 1 | elements 1 | elements 1, spine 1 |
| `hurtSelf74` (전용 도우미) | spine | 함수 | 7 | elements 6 | spine 8, combat 5, items 4, ui 2, elements 1, render 1 |
| `extinguish74` (전용 도우미) | spine | 함수 | 1 | elements 1 | elements 2, spine 2 |
| `rawElement74` | spine | 함수 | 10 | spine 1 | spine 37, elements 12, items 12, monsters 3, save 1, ui 1 |

## 넣지 않은 이웃(원소를 부르는 다른 시스템)
이름이 원소가 아니고 자기 시스템이 따로 있는 것은 넣지 않았다. 필요하면 추가 지시로 옮긴다.
- 전투 필드: `addField`, `tempFieldCells57`, `expireCombatFields`, `tickCombatFields57`(branches), `combatFieldBlocksSight57`, `fieldProvenance57`
- 독병 가스: `spawnJarGasField57`, `tickJarGasFields`, `jarGas*`, `applyJarGasEffects57`
- 무공 연막: `castMartialSmoke`, `expireMartialSmoke`, `smoke*`
- 보스 용암: `keeperLavaCells`, `tickKeeperLava54`, `updateKeeperLavaOrigin54`
- 전설 무기 필드: `tickLegendFields`, `fireField47`, `fireAbsorb47`, `healFire47`, `tempLava47`
- 산채 서리: `mountainFrost*`(branches)
- 그리기: `drawElementAttacks`, `drawTerrainReactions`, `drawCombustion`, `drawPotSteam`, `drawElementOverlay`, `drawLavaTerrain`, `drawFireFloor`(render)
