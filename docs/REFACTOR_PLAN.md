# 만루 V40 구조 통합 계획 (수행 완료 — 결과는 ARCHITECTURE.md)

> 이 문서는 시작 시점의 조사와 계획이다. 실제 결과와 최종 지표는 `docs/ARCHITECTURE.md`, 남은 판단 사항은 `docs/FINDINGS.md`에 있다.

기준: `MANRU_V40_SEAWEED_COOKING_SOURCE_20261007` (커밋 `2770b75`에 손대지 않고 들여옴).
진행 방식: 검사기·기준선을 먼저 만들고, 영역 하나를 커밋 하나로 통합한다. 커밋마다 `npm run check`와 `npm test`(V40 기준선과 해시 비교)를 통과해야 한다.

## 1. 실측 (V40, `npm run check -- --report <metric>`)

| 지표 | V40 | 비고 |
|---|---|---|
| 함수·전역 재대입 (`rebind`) | 145 | 식별자 재대입 136 + `window.*`/`globalThis.*` 재대입 9 |
| 원본을 잡아두는 별칭 (`alias`) | 79 | `const old=fn` 형태 |
| JS의 `<style>` 주입 (`styleInject`) | 35 | 34개 블록, 모두 `<head>` 끝에 추가 |
| 중복 선택자 (`duplicateSelector`) | 191 | JS 안 CSS 포함 |
| `!important` | 2,188 | |
| 버전 접미사 함수 선언 | 2,078 | 중첩 함수 포함 |
| 빈 `catch` | 74 | |
| `setTimeout`/`requestAnimationFrame`/`setInterval`/`queueMicrotask` | 68 | 사후 보정 여부는 개별 판정 |
| 본문이 같은 이름 다른 함수 (`sameBody`) | 18 | `inside59=inside88=in46`, `shuffle56=shuffle982` 등 |
| `Object.defineProperty` | 7 | |
| `MutationObserver` | 1 | |

## 2. 구조 진단

- `scripts/10-runtime.js`는 바깥 IIFE 하나에 최상위 문 1,538개가 있고, 그 안에 **패치 구획 IIFE 39개(약 16,000줄)** 가 따로 스코프를 갖는다.
- 뒤 구획의 헬퍼(`key972` 등)는 원본 정의가 있는 바깥 스코프에서 보이지 않는다. 그래서 지금까지는 원본을 고칠 수 없고 래핑(`const old=fn; fn=function(){old();…}`)만 가능했다. 원본 하나로 합치려면 **구획을 바깥 스코프로 펼치는 것이 선행 조건**이다.
- 펼칠 때 이름 충돌: CSS 주입 변수(`css`, `style`)와 `dot`, `stamp`, `gear` 몇 개뿐이다. 나머지 충돌(`P47`, `PERF49`, `biasItems94`, `normalizeDoors86`, `sanitizeWindows88`, `validLockPlan96`, `sanitize56`)은 **다른 구획에서 보이지 않는 이름을 부르는 죽은 호출**이다. 펼치면 이 호출이 갑자기 살아나 동작이 바뀌므로, 펼치기 전에 V40 동작(실행 안 됨) 그대로 정리하고 FINDINGS F-02~F-06에 남긴다.
- 래핑 체인 57개 중 상당수는 중간 층이 원본을 부르지 않는 **전면 교체**다. 예: `drawFloorTexture` 14층 중 앞 10층은 실행되지 않는다. 이런 층은 삭제하고, 살아 있는 층만 원본 정의 하나로 합친다.

## 3. 순서

1. 검사기·기준선·빌드·CI (이 커밋)
2. JS가 주입하던 CSS 34블록을 `styles/15-interface.css`로 옮긴다. 주입 순서 그대로 두어 캐스케이드가 같다. 모든 CSS를 `<head>`에서 런타임보다 먼저 로드한다(타이틀 깜빡임 원인 1·2·3 제거).
3. 죽은 교차 구획 호출 정리(F-02~F-06), 실행 1회 가드 정리.
4. 구획 39개 펼치기 (`tools/refactor/flatten-sections.mjs`, 스코프 인식 이름 변경).
5. 영역별 소유자 통합. 커밋 하나에 영역 하나.

   | 영역 | 소유자 | 대상 |
   |---|---|---|
   | 지형 렌더 | `drawFloorTexture`, `drawWallTexture`, `drawSpecialTerrain`, `drawInteractiveTerrain`, `drawWallOverhangPass`, `regionColors`, `vfDrawDecor`, `drawParallaxBackground`, `drawRegionalAtmosphere`, `vfWeather` | 14·13·10·4·5·5·2·1·1·1겹 |
   | 지형 판정 | `tileBlocks`, `tileBlocksSight`, `blinkHardBlock`, `terrainName` | 2·2·2·4겹 |
   | 층 생성 | `build*Normal` 5종, 특수층 `build*`, `cleanupMap85` 계열, `build6/11/15/16/22_1020` | |
   | 자동 이동 | `cancelAutoWalk`, `runAutoPath`, `autoExplore`, `walkPath` | |
   | 아이템 표시 | `itemGlyph`, `itemTypeLabel`, `inventoryDetailHtml` | |
   | 조사·로그 | `showInspect`, `closeInspect`, `attachLongPress`, `bindEquipInspect`, `addLog`, `toast` | |
   | 화면 | `syncGameViewport`, `drawMap`, `updateAttackButton`, `setScreen1002` → `setScreen` | |
   | 몬스터·이벤트 | `spawnNamed`, `spawnLayoutExtras`, `fountainEvent`, `consumeFood57` | |
   | 공통 유틸 | 좌표 키, 경계(`inside*`), 거리(`roomDist*`), 셔플(`shuffle*`), `consumeRef*` | |
   | 죽은 코드 | 개량 인장 `UPGRADE47` 일체 | 4·9·14·19·24층 배치가 사라짐 → FINDINGS(허용된 변경) |

6. 타이틀 정리: CSS 아트 타이틀 DOM·CSS 삭제, 선택자 통합, 디버그 전장 버튼은 `?debug=1`에서만, `drawTitleCanvas49` 회전·전체화면 재그리기.
7. 빈 `catch`를 저장·로드 경로부터 `console.warn`으로.
8. 파일 분할: 통합이 끝난 뒤 도메인별 파일로. (한 클로저를 공유하므로 빌드가 이어 붙인다.)
9. 마무리: 래칫 비교표, FINDINGS, README.

## 4. 동작 보존 검증 (`tests/`)

- 시계·`Math.random`·`crypto.randomUUID`·`performance.now`를 페이지 밖에서 고정한다. 게임 코드에 테스트 훅을 넣지 않는다.
- `newgame`(7개 신분), `walk`(4개 신분 × 240입력), `floors`(1~25층 재생성), `battle`(벌집나무·벌떼·목매 실제 배치·12라운드), `saveload`, `saves`(V40이 쓴 진행·사망·브랜치·전설 던전 세이브), `pwa`(앱 대상) — 결과 해시가 `tests/baseline/behaviour.json`과 같아야 한다. V40으로 두 번 돌려 결정성을 확인했다.
- `screens`(PC 1280×800·모바일 390×844: 타이틀, 신분 선택, 이야기, 1층, 소지품, 디버그 전장)는 계산된 스타일 전체가 같아야 하고 픽셀은 노이즈 수준까지만 허용한다. 글꼴·GPU 차이 때문에 로컬에서만 비교한다.
- 단일 HTML(`--target single`)과 앱(`--target app`)도 같은 기준선을 재현해야 한다.
