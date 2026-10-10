# 만루 구조 지도

원본은 `src/` 하나다. `dist/MANRU.html`(단일 HTML)과 `dist/app/`(PWA·Capacitor)은 `npm run build`의 산출물이다.

## 실행 순서와 파일

`src/index.html`이 아래 순서로 불러온다.

| 파일 | 역할 |
|---|---|
| `scripts/00-boot-isolation.js` | 부팅 직전 세이브 복구 후보를 정한다 (`manru1004_*` 키). |
| `styles/00-base.css` … `50-text-scale.css` | 모든 CSS. `15-interface.css`는 예전에 런타임이 `<style>`로 주입하던 블록이다. 전부 `<head>`에서 런타임보다 먼저 로드된다. |
| `scripts/10-runtime.js` | 게임 전체. 바깥 클로저 하나, 패치 구획 없음. |
| `scripts/99-maintenance.js` | 모바일 컨텍스트 메뉴 차단. |

`10-runtime.js`는 아직 한 파일이다. 같은 클로저의 `let` 상태(`state`, `COLS`, `ROWS` 등)를 공유하고 모듈 경계를 가로질러 재대입하기 때문에, 파일 분할은 상태를 공유 객체로 옮기는 별도 작업이다(아래 "다음 단계").

## 영역별 소유자

한 동작의 정의는 아래 함수 하나다. 래퍼·재대입은 없고, 이전에 겹겹이 쌓여 있던 층은 명명된 함수 호출로 풀어 두었다.

| 영역 | 소유자 | 안쪽 층 (바깥 → 안쪽 순서로 호출) |
|---|---|---|
| 바닥 그림 | `drawFloorTexture` | `drawFloorWithStyle` → `drawFloorWithSubtheme` → `drawRegionFloor` |
| 벽 그림 | `drawWallTexture` | `drawWallWithSubthemeOverlay` → `drawWallWithSubthemePalette` → `drawWallWithOuterPalette` → `drawFloor11AwareWall` → `drawTintedRegionWall` → `drawRegionWallWithEdges` → `drawRegionWall` |
| 특수 지형 그림 | `drawSpecialTerrain` | `drawCoreSpecialTerrain` … `drawPaperBridgeSpecialTerrain` (타일별 우선순위 그대로) |
| 상호작용 지형 | `drawInteractiveTerrain` | `drawFurnitureInteractiveTerrain` → `drawCoreInteractiveTerrain` (문은 `drawDoor60`) |
| 지역 색 | `regionColors` | `regionColorsWithFloor11` → … → `regionBasePalette` |
| 지도 그리기 | `drawMap` | R19 정규 렌더러 하나 |
| 지형 판정 | `tileBlocks`, `tileBlocksSight`, `blinkHardBlock`, `terrainName` | 장식 막힘·숨은 통로 → 원래 표 (`tileBlocksByTerrain`) |
| 층 생성 | `build*Normal`, `buildNormal85` 계열, `cleanupMap85`, `pruneDecor85`, `spawnLayoutExtras`, `spawnNamed` | 각 마지막 완전 교체본이 선언이다 |
| 자동 이동 | `cancelAutoWalk`, `runAutoPath`, `autoExplore` | |
| 조사·로그 | `showInspect`, `addLog`, `toast`, `closeInspect`, `attachLongPress` | `addLog` = 식별·마스킹 → `logWithCategory` → `writeLogLine` |
| 아이템 | `dropRandomItem` | 곡창 분기·탄약 → `dropLootWithNaturalFood` → `dropLootWithTalismans` → `dropFloorLoot` |
| 아이템 표시 | `itemGlyph`, `itemTypeLabel`, `itemSummary` | `itemSummary` = 탄약 → `describeItemWithBrands` → `describeIdentifiedItem` → `describeItemStats` |
| 화면 | `setScreen1002`(화면 상태 소유자), `syncGameViewport`, `syncViewportOnWindowResize`, `updateAttackButton` | |
| 세이브 | 정규 NEW/LOAD 파이프라인(`RunLifecycle`, `SaveService`) | 형식·키·`saveVersion1004` 불변 |
| 공통 유틸 | `shuffle`, `roomDistance`, `insideMapInterior`, `rect`, `poly`, `roomRect`, `freeRoomCell`, `consumeRef` | 같은 본문 중복을 하나로 합친 것 |

버전 접미사 이름(`…57`, `…105`)이 붙은 함수는 아직 많다(2,036개). 이름만의 문제라 동작은 같고, 래칫이 더 늘지 않게 막는다.

## 구조 검사 기준선 (V40 → 현재)

| 지표 | V40 | 현재 |
|---|---:|---:|
| 함수·전역 재대입 | 151 | **0** |
| 원본을 잡아두는 별칭 | 85 | 2 |
| JS의 `<style>` 주입 | 35 | **0** |
| 중복 선택자 | 277 | 276 |
| `!important` | 2,188 | 2,186 |
| 버전 접미사 함수 | 2,078 | 2,036 |
| 빈 `catch` | 74 | 63 |
| `setTimeout`/`requestAnimationFrame` 등 | 68 | 54 |
| 본문이 같은 함수 | 18 | 4 |
| `Object.defineProperty` | 7 | 6 |
| 런타임 줄 수 | 26,956 | 24,385 |

남은 별칭 2개는 공급자 교체 구조다(`MANRU_LOAD_CORE`, `typedKeyMeta96`). `!important`와 중복 선택자는 CSS 겹침을 풀어야 줄어드는 큰 작업이라 이번에는 늘지 않게만 고정했다.

## 검증 장치

- `npm run check`: 위 지표가 `tools/structure-baseline.json`보다 늘면 실패. pre-commit과 CI가 돌린다.
- `npm test`: 시계·난수·UUID·`performance.now`를 페이지 밖에서 고정한 재생. V40이 쓴 세이브 4종(진행·사망·브랜치·전설 던전), 7개 직업 새 게임, 입력 재생, 25개 층, 디버그 전장(벌집나무·벌떼·목매)을 `tests/baseline/behaviour.json`과 비교한다. `--target single`·`--target app`으로 빌드 산출물도 같은 기준선을 재현해야 한다.
- 로컬 전용: `node tests/run.mjs --only screens,render --label <이름>` 후 `node tests/compare-screens.mjs ref <이름>`(계산된 스타일 전부 + 픽셀), `node tests/title-frames.mjs`(로딩 중 타이틀 프레임 녹화).

## 다음 단계 (이번 작업에서 하지 않은 것)

- `10-runtime.js` 도메인별 파일 분할(`core/ world/ combat/ items/ monsters/ ui/ save/`). 상태 변수를 공유 객체로 옮겨야 한다.
- `!important`·중복 선택자 정리(CSS 캐스케이드 재작성).
- 출시 빌드에서 QA 브리지(`__MANRU_V…_TEST__` 등)를 빼는 문제: `docs/FINDINGS.md` F-09.
