# 만루 V40 구조 통합 — 조사 결과와 계획 (초안, 확인 대기)

기준: `MANRU_V40_BUNDLE_20261010.zip` (`APP/www` 분리 소스. 단일 HTML과 게임 코드가 바이트 단위로 같음을 확인함)
측정: acorn AST 분석(`scripts/10-runtime.js`) + CSS grep. 아래 수치는 모두 실측이며 지시서의 추정치와 다를 수 있다.

## 1. 먼저 확인이 필요한 것 (막힘)

| # | 항목 | 내용 |
|---|---|---|
| A | `AGENTS.md`, `build_standalone.py`, 소스 zip 없음 | 번들에는 `APP/`과 HTML만 있다. 지시서는 "AGENTS.md를 읽고 모든 규칙을 따른다"고 했고, 특히 회귀 항목(벌집나무·벌떼·목매·비무장 종 픽셀·디버그 전장·소환·저장 복원)은 그 파일에만 있다. `MANRU_V40_SEAWEED_COOKING_SOURCE_20261007.zip`을 올려주면 그걸 기준으로 삼는다. 없으면 AGENTS.md 없이 진행하되 회귀 항목은 4절에서 빠진다. |
| B | 저장소 위치 | 이 저장소(`sardore/Roguelike`)는 다른 게임("Tower of the First King")이 들어 있다. 만루를 어디에 둘지 정해야 한다: (1) 저장소 루트를 만루로 교체, (2) `manru/` 하위 폴더, (3) 새 저장소. 지시서의 `/src /tools /tests /docs /app` 구성은 (1)이나 (3)에 맞다. |
| C | 브랜치 | 현재 작업 브랜치는 `claude/app-version-html-comparison-nej3iw`. 여기에 계속 커밋해도 되는지. |

## 2. 현재 상태 (실측)

`scripts/10-runtime.js` 26,956줄 · 3.8MB. **전체가 하나의 IIFE** 안에 있고 최상위 문 1,538개가 한 클로저의 `let/const` 상태를 공유한다.

| 항목 | 지시서 추정 | 실측 |
|---|---|---|
| `/* ===== … ===== */` 패치 구획 | ~75 | 69 (런타임) |
| 최상위 함수 선언 | - | 1,115 (이 중 버전 접미사 이름 846) |
| 함수 재대입(래핑 포함) | ~77 | **159** (이름 기준 약 60종; `window.__MANRU_*__` 디버그·QA 브리지 포함) |
| 함수를 `old/base/prev` 변수에 잡아두는 별칭 | - | 74 |
| 빈 `catch` | ~72 | 73 |
| JS의 `<style>` 주입 | - | 35 (`createElement('style')`) |
| `setTimeout`/`requestAnimationFrame` 호출 | - | 61 (전부가 사후 보정은 아님. 분류 필요) |
| `!important` | 2,188 | 런타임 JS 문자열 1,754 + CSS 434 = 2,188 (일치) |
| 동일 본문 중복 | 13쌍 | 최상위 선언 기준 1쌍(`v8WallNeighbor`/`v10IsWall`). 지시서의 13쌍은 중첩 함수·화살표 함수라 최상위 AST 비교에서 안 잡힘. 검사기 7번에서 중첩까지 포함해 다시 센다 |
| `#startGate` / `#card` | 40 / 77 | CSS 12/56곳 + JS 문자열 41/39곳 |

가장 깊은 래핑 체인(재대입 횟수): `drawFloorTexture` 14, `drawWallTexture` 13, `drawSpecialTerrain` 10, `regionColors` 5, `drawWallOverhangPass` 5, `cancelAutoWalk` 4, `runAutoPath` 4, `drawInteractiveTerrain` 4, `itemTypeLabel` 4, `itemGlyph` 4, `terrainName` 4, `showInspect` 3.
그 밖에 `buildInnNormal` 등 건물 생성 5종이 2겹, `tileBlocks`/`tileBlocksSight`/`blinkHardBlock` 2겹, `addLog`·`toast`·`updateAttackButton`·`inventoryDetailHtml`·`drawMap` 등.

지시서에 나온 중복 이름의 정의 위치(전부 정의 1개 확인): `consumeRef`(7366) / `consumeItem56`(9174) / `consumeRef74`(12818), `inside59`(9813) / `inside88`(14131) / `in46`(22947), `roomDist71`(12435) / `roomDist93`(14545), `shuffle56`(9010) / `shuffle982`(16954), `classGear1004`(18920) / `classGear1011`(20687), `setScreen1002`(18336), `scaledMonster`(3200), `getStats`(3231), `damageFormula`(3599).
`dropRandomItem`은 `function`/`const`로는 정의가 안 잡힌다(30곳 사용). 정의 형태를 조사 단계에서 따로 확인한다.

타이틀: `index.html`의 `.titleWorld`(moon/farRoof/tower/lantern/mist) CSS 아트가 살아 있고, 디버그 버튼은 `#debugBattleBtn57`이다(`onclick=openDebugBattle57`, 런타임 26172행).
`UPGRADE47`은 8307행(정의)과 8331행(`applyStrategy47`의 4·9·14·19·24층 배치)에서 확인했다.

## 3. 구조적 제약과 선택 (지시서와 충돌할 수 있는 부분)

1. **단일 클로저 상태 공유.** 도메인별 파일 분리는 ES 모듈로 해야 하는데, 모듈에서 import한 `let` 바인딩은 다른 모듈에서 재대입할 수 없다. 현재 코드가 여러 곳에서 `state`, `map` 같은 변수를 재대입한다면 공유 상태 객체로 바꿔야 하고, 이건 호출처가 수천 곳이 될 수 있다.
   → 제안: 먼저 **분리 없이 한 파일 안에서** 통합(2-1)을 끝내고, 그 뒤에 파일 분할을 별도 단계로 한다. 분할 방식은 esbuild 번들(IIFE)로, 상태는 `core/state.js`의 단일 객체로 둔다. 분할 단계의 위험은 그때 다시 재본다.
2. **래핑 제거 = 최종 동작 계산.** 14겹 `drawFloorTexture`처럼 각 층이 앞 층 결과 위에 그리는 경우, "원본에 합친다"는 14개 분기를 하나의 함수 본문으로 합치는 일이다. 픽셀 동일성을 4절 스크린샷 비교로만 확인할 수 있고, 시드·타이밍에 따라 결과가 달라지는 렌더링은 비교가 어렵다.
3. **동작 보존의 한계.** 래퍼는 호출 순서·부작용 순서를 보존해야 한다. 합칠 때 순서가 바뀌면 시드 재생 해시가 달라지므로 해시가 변하면 즉시 되돌리고 원인을 찾는다.
4. **디버그·QA 브리지.** `window.__MANRU_*__` 재대입 중 상당수는 테스트 브리지(`__MANRU_V1004__` 등)다. 출시 빌드에서 `__MANRU_QA__`가 없어야 한다는 4절 조건과 함께, 어떤 브리지가 게임 동작이고 어떤 것이 QA 전용인지 분류가 필요하다.
5. **규모.** 한 세션에서 끝낼 수 있는 분량이 아니다. 영역 하나를 커밋 하나로 하고, 매 커밋마다 4절 검증을 돌리는 방식이면 여러 세션에 걸친다. 아래 순서로 나누고 단계마다 확인받는 것을 제안한다.

## 4. 영역별 최종 소유자 (제안)

| 영역 | 소유자(남길 정의) | 통합 대상 |
|---|---|---|
| 지형 렌더링 | `drawFloorTexture`, `drawWallTexture`, `drawSpecialTerrain`, `drawInteractiveTerrain`, `drawWallOverhangPass`, `regionColors` | 14·13·10·4·5·5겹 체인 |
| 자동 이동 | `cancelAutoWalk`, `runAutoPath`, `autoExplore`, `walkPath` | 4겹 + `walkPath1020`/`pureWalkPath1023` |
| 아이템 표시 | `itemGlyph`, `itemTypeLabel`, `inventoryDetailHtml` | 4·4·2겹 |
| 인스펙트·로그 | `showInspect`, `closeInspect`, `addLog`, `toast` | 3·1·2·1겹 |
| 이동·시야 판정 | `tileBlocks`, `tileBlocksSight`, `blinkHardBlock`, `terrainName` | 2·2·2·4겹 |
| 건물 생성 | `build*Normal` 5종, 특수 지형 `build*` | 2겹 |
| 아이템 생성 | `dropRandomItem`, `pickByTier`, `ordinaryGearPool105` | 조사 후 확정 |
| 스탯·피해 | `getStats`, `equipmentContributions105`, `damageFormula`, `resolveElementDamage57` | 조사 후 확정 |
| 몬스터 생성 | `scaledMonster` (+`spawnNamed`, `spawnLayoutExtras`) | 조사 후 확정 |
| 화면 상태 | `setScreen`(접미사 제거) | `setScreen1002` + 호출 7곳 |
| 세이브·생명주기 | 정규 NEW/LOAD 파이프라인(5486행) | 조사 후 확정 |
| 공통 유틸 | `util`: 좌표 키, 경계, 거리, 클램프, 셔플, 이름 조회 | `inside*`, `roomDist*`, `shuffle*` 등 |
| 죽은 코드 | `UPGRADE47` 일체 | 4·9·14·19·24층 배치 호출 포함. 부작용 제거는 FINDINGS에 기록 |

"조사 후 확정"은 이 단계에서 정의 위치와 체인을 아직 완전히 추적하지 않은 영역이다. 확정 전에는 목록을 만들어 보여주겠다.

## 5. 진행 순서

1. (지금) 이 계획 확인. 1절 A·B·C 답변.
2. 검사기(`tools/check-structure.mjs`)와 기준선: 현재 수치를 `structure-baseline.json`으로 고정. 시드 재생·세이브·스크린샷·PWA 기준선은 `tests/baseline/`에 V40으로 만든다.
3. 영역별 통합 (커밋 1개 = 영역 1개). 위 표 순서대로, 렌더링부터.
4. 타이틀 정리(2-2), 빌드 통합(2-3).
5. 파일 분할(제약 1 참고, 별도 승인).
6. 마무리: 래칫 비교표, `FINDINGS.md`, README.

## 6. 지금 하지 않은 것

코드는 한 줄도 고치지 않았다. 검사기·테스트·기준선도 아직 없다. 이 문서의 수치는 분석 스크립트로 읽기 전용 측정한 값이다.
