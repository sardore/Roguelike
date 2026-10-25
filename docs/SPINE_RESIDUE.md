# spine.js에 남긴 선언 목록 (초기화 순서 때문에 옮기지 못한 것)
> 개명: `src/game/spine.js`는 `src/game/boot.js`가 되었다. 아래 기록과 `npm run check`의 지표 이름(`spineLines` 등)은 그대로 둔다.

## 남은 일 한 장 요약 (2026-10-25, 병합 후 계획을 정하기 위한 표)

수치는 `npm run check`(구조 기준선)와 `--report <지표>`의 값이다. "위험"은 이 세션의 판단이며 측정값이 아니다. 어느 항목도 이번 PR 묶음에 들어 있지 않다.

| 항목 | 지금 | 하는 일 | 위험 | 막아 주는 것 / 못 막는 것 |
|---|---|---|---|---|
| boot.js의 남은 문장·선언 | 397줄, 선언 13, 느슨한 문장 135 (인자 없는 호출 76, 인자 있는 호출 4, 공개 11, `try` 7, `if` 11, 멤버 대입 8, 메서드 호출 13, 리스너 3, `for…of` 1, 그 밖 1) | 하나씩 `load-reads --sites`·`pub-reads`로 로드 중 읽는 곳을 재고, 읽는 곳이 없거나 정의 뒤라면 옮기거나 리터럴에 합친다. 읽는 곳이 있으면 이유를 적고 남긴다 | 중간. 로드 순서가 어긋나면 `undefined`/TDZ가 로드 중 조용히 생길 수 있다 | `values`(로드 직후 전체 값)·`registries`·`domvars`·화면 비교가 잡는다. 로드 중 한 번 쓰이고 사라지는 값은 못 잡는다 |
| 접미사 이름(숫자로 끝나는 함수 이름) | 743 (mapgen 119, render 107, monsters 103, items 80, branches 61, layout 52, special 51, combat 46, elements 39, save 31, ui 29, world 19, 나머지 7) | 파일 단위로 이름만 바꾼다(`rename-batch`·`NAMING.tsv` 기록). 세이브 키·전역 공개 이름·문자열로 찾는 이름은 건드리지 않는다 | 낮음~중간. 이름이 문자열로 쓰이는 곳(`window[…]`, QA, 세이브 키)을 놓치면 로드나 이어하기가 깨진다 | `values` 개명 매핑(`accept-values --renamed`)·`savestring`·`saves`·전체 시나리오. 지표는 숫자로 끝나는 함수 이름을 모두 세므로, 버전 표기가 아닌 이름이 섞여 있는지는 개명 전에 목록(`--report suffixFunction`)에서 확인해야 한다 |
| CSS `!important` | 2,180 (15-interface.css 1,745, 00-base.css 218, 20-runtime-ui.css 117, 40-story.css 59, 30-v991-patches.css 21, 50-text-scale.css 18) + 스크립트 문자열 2(items.js, layout.js) | 선택자 특이도와 겹침을 풀어 `!important` 없이 같은 결과가 나오게 한다 | 높음. 캐스케이드 순서·특이도가 바뀌면 모양이 바뀐다 | 화면 비교 11개 화면 × PC·모바일과 계산된 스타일 해시. 모달·전투·분기 지도 같은 상태는 일부만 덮는다 → 폰 확인 필요 |
| CSS 중복 선택자 | 276 묶음 (00-base.css와 15-interface.css에 대부분) | 같은 선택자를 한 곳에 합친다(앞의 것을 덮는 규칙은 순서를 유지해 병합) | 높음. 위와 같은 이유 | 위와 같음 |
| 타이머 | 40 (`TIMER_AUDIT.md`: 점검에서 연출 후 정리·입력 시간·프레임 루프 등은 정당하다고 분류) | 정당한 것은 유지, 나머지는 소유자의 이벤트로 | 중간. 시점이 바뀌면 입력·연출이 달라진다 | 입력 시나리오·화면 비교. 실제 기기 타이밍은 못 잡는다 |
| `Object.defineProperty` 6, 별칭 1(`typedKeyMeta96`), `MutationObserver` 1(`killIdentifyBar88`) | 8곳 | 각각 소유자에서 정의 | 낮음~중간 | 해당 시나리오와 화면 비교 |
| 열린 점검 사항 | F-25(`replaceViewerQuickButton`), F-26(`TYPED_KEYS96`) | `docs/FINDINGS.md` 참고 | 낮음 | |
| CI 러너 | `ci.yml`이 `ubuntu-24.04`에 고정됨(PR #31) | Playwright를 올려 `ubuntu-latest`에서도 설치되게 하고 고정을 푼다 | 낮음. 테스트 도구 변경이라 스크린샷 기준(글꼴 고정 파일 `tests/fonts`)이 달라지지 않는지 확인해야 한다 | CI 자체 |

순서 제안(병합 후 정한다): ① 접미사 이름 — 동작 변경이 없고 파일 단위로 나뉘어 한 번에 검증 가능 ② boot.js 남은 항목 측정 ③ 타이머·`defineProperty` 등 작은 것 ④ CSS는 마지막, 폰 확인을 단계마다 끼워서.

모듈 분할의 목표는 `src/game/spine.js`를 없애거나 부팅 코드만 남기는 것이다. 한 선언을 다른 파일로 옮길 수 없는 이유는 세 가지뿐이며, 이 문서가 그 목록이다. 도메인을 옮길 때마다 이 목록을 갱신한다(`tools/refactor/move-to.mjs`가 거부한 이유를 그대로 적는다).

| 이유 | 설명 |
|---|---|
| L: 로드 시 읽힘 | 남은(옮기지 않은) 문장이 함수 밖에서 이 값을 읽는다. 새 파일이 그 문장보다 뒤에 로드되면 `Cannot access … before initialization`이 난다. |
| W: window 의존 | 초기화식이 로드 시 `window.*`/`globalThis.*`를 읽는다. 그 값을 만드는 느슨한 문장 뒤에 있어야 한다. |
| T: 객체 채우기 | 초기화식이 어떤 객체의 멤버(`TT.X`)를 로드 시점에 읽어 값으로 담는데, 그 멤버를 채우는 문장이 이동 위치와 원래 위치 사이에 있다. 옮기면 `undefined`를 담는다(층 24가 달라져서 발견). `move-to`가 거부한다(즉시 실행 함수 안도 로드 시점으로 본다). |
| Q: QA 전용 | `src/qa/qa.js`에 선언된 것은 게임 파일로 옮기지 않는다. |
| P: 느슨한 문장 | 호출·등록 문장은 실행 순서가 곧 동작이라 옮기지 않는다(이벤트 리스너 등록 순서는 `input.listeners.*` 지문 테스트가 지킨다). |

### 계측으로 푼 보수적 판단
`move-to`의 호출 경로 검사는 정적이라 함수 이름이 언급되기만 해도 로드 중 호출로 본다. `tools/refactor/load-reads.mjs`는 실제로 로드 중 읽히는지를 잰다(spine.js의 값 바인딩 362개, 7가지 부팅 상황). 결과: 221개는 로드 중 한 번도 읽히지 않고, 140개는 선언이 실행된 뒤에만 읽히고, 선언 전 읽기(TDZ)는 `BRANCH_DEFS105` 하나(F-21, 수정되어 branches.js로 옮김; 고친 뒤 재계측 0)다. `move-to --measured <결과>`는 이 결과로 그 정적 검사 하나만 면제한다(앞으로 옮길 때는 TDZ 0, 뒤로 옮길 때는 로드 중 읽기 0인 이름). 옮긴 뒤에는 `--snapshot`으로 옛 빌드와 새 빌드의 로드 끝 값을 비교한다.

## 선언 (이유 L / W)
| 이름 | 원래 도메인 | 이유 | 해소 방법 |
|---|---|---|---|
| `POTION_LIST`, `POTION_BY_KIND` | items | W (`window.MANRU_POTIONS`) | `MANRU_POTIONS`를 만드는 문장을 소유자에게 옮긴 뒤 이동 |
| `Cam96` | render | L/W | 확인 필요 |
| `InputRouter`, `ClientEnvironment`, `Runtime81`, `DesktopClient`, `CONFIG81` | input | L (스파인의 느슨한 문장이 로드 시 읽음: 줄 8123, 10573, 15089, 24626, 24747 부근) | 해당 문장(등록·부팅)과 함께 input/boot로 옮기거나, 읽는 문장을 읽는 시점이 늦은 형태로 바꾼다(동작을 바꾸지 않는 범위에서) |
| `coach`, `STORY_VERSION992` | story | L (스파인의 느슨한 문장이 로드 시 읽음: 줄 14125, 24899 부근) | 읽는 문장과 함께 이동 |
| `CLASS1001_META`, `CLASS1001_STATS`, `CLASS1001_STAT_PATHS`, `displayName991`, `targeting81`, `viewerOpen` | ui | L (함수 `selectClass1001` 등을 통해 로드 시 호출됨: 이동 도구의 추이적 검사) | 호출하는 로드 문장과 함께 이동 |
| `MobileClient`, `OrientationGate`, `ClientEnvironment` | ui | L | 같은 부팅 묶음으로 이동 |
| `debugBattle*`, `Auto81`, 한두 글자 최상위 상수 | ui | (순서 문제가 아니라 도메인/이름 미정) | 디버그 전장 파일, 이동 도메인, 역할명 단계 |
| `PlacementService`, `OccupancyService`, `BLOCK85` | mapgen | L (함수 `aquaticStranded`가 렌더 경로를 통해 스파인의 로드 문장에서 호출되고 이 값을 읽음) | 호출하는 로드 문장과 함께 이동 |
| `ConnectedDecor81`, `floorSet980`, `immutable980` | mapgen | T (초기화식이 `TT.*`/`window.*` 값을 로드 시점에 집합·객체로 담는데, 그 값을 채우는 스파인의 문장(줄 12495 부근 `TT.*=`)이 더 뒤) | `TT`를 채우는 문장을 kernel로 옮긴 뒤 이동 |
| `BRANCH_INTERACTIVE_OVERLAYS105` | branches | T (`TT.*`를 로드 시점에 담는데 채우는 문장이 더 뒤) | `TT`를 채우는 문장을 kernel로 옮긴 뒤 |
| `RECIPE` | items | 채우기 순서(F-23): `addFusionRecipe(...)` 호출들 뒤에서 만들어져야 한다 | 호출 묶음을 items로 옮길 때 같이 |

## rest 처리 결과 (2026-10-11)

규칙: rest의 모든 선언은 (a) 가장 많이 쓰는 도메인에 붙이거나, (b) 안 쓰면 삭제하거나, (c) 정말 공용이면 이유를 적어 남긴다. util/misc 같은 서랍 도메인은 만들지 않는다.

- 처음 rest: 1,539줄(550문장, 2026-10-11 오전 rest-plan 기준).
- (b) 삭제: 23개(쓰는 곳 없음, `ab34520`).
- (a) 이동: 사용처 과반이 한 도메인인 선언 89개(`290b5e0`~`2c252c6`), 최다 사용처가 기존 도메인인 혼합 선언 6개. 앞선 고정 문장 이동(1~3차)으로 rest였던 선언 상당수가 도메인으로 갔다.
- 남은 rest: 186문장, 395줄. 아래 표가 전부다.

| 묶음 | 문장 수 | 이유 | 선언 |
|---|---:|---|---|
| (c) 부팅 문장 전용 | 61 | 사용처가 spine.js의 느슨한 문장(등록·로드 중 호출)뿐이다. 등록 API(`register*`)와 그 표가 대부분이다. 느슨한 문장을 순서대로 부팅 파일로 옮길 때 같이 옮긴다. | `registerMovePreR8`, `registerMovePostR8`, `registerPlayerStatStage55`, `registerAttackCostStage55`, `registerMoveCostStage55`, `setGenerationBase`, `registerBossRewardStage55`, `registerPickupStageR25`, `DESCEND_EFFECTS53`, `descend`, `rest`, `RUN_END_EFFECTS53`, `registerPanelHook54`, `updateMobileHud`, `startRuntimeLoop57`, `m`, `VF_IMG`, `inspectOpen`, `oldClose`, `wrap`, `combatHud`, `adorn`, `feed`, `throwAt`, `tuneButtons`, `fixEntities`, `beginViewer45`, `tabCount`, `restoreInventoryScroll45`, `swipeModalCancel45`, `mapOpen49`, `editable53`, `V54`, `hold`, `rule`, `qtyKind56`, `pad58`, `inferCorridors59`, `doorAudit59`, `onMonsterHpThreshold60`, `spawnRanges61`, `asuraDomainDist61`, `releaseStamp`, `mb`, `releaseGearButton`, `dg`, `corners`, `ghost`, `textScaleControl`, `public74`, `gearInfusionPanel`, `Automation81`, `killIdentifyBar88`, `plannedSet980`, `upMeta`, `panelHead`, `wanderer1001`, `patchDef`, `RUMOR_SPACE_VERSION1030`, `resetPortal46`, `initSummon105` |
| 보류: 사용처가 rest | 30 | 사용처가 아직 spine.js의 다른 rest 선언이다. 사용처가 도메인으로 가면 (a)로 따라간다. | `PLAYER_STAT_STAGES55`, `ATTACK_COST_STAGES55`, `MOVE_COST_STAGES55`, `SIGHT_BLOCKING_TILES57`, `dungeonVisionScale50`, `runDescendEffects53`, `PANEL_HOOKS54`, `visualLoop`, `runtimeLoopStarted57`, `runtimeReady57`, `hk,rn`, `pcolor`, `interior`, `inside43`, `safePut44`, `effectLog56`, `V59`, `BREAK61`, `SIGHT85`, `clear88`, `segment93`, `DECAL986`, `ARTIFACT_PLAYER_SCOPE46`, `ARTIFACT_RUN_SCOPE46`, `snapshotSerializable46`, `artifactCarry46`, `snapshot46`, `rng49`, `DUNGEON_MOBS47`, `fireAbsorb47` |
| (a) 처리됨: layout.js | 22 | 사용처가 layout 후보(방·통로·층 모양 생성 코드)다. layout 도메인을 만들면 같이 간다. | `put`, `clear`, `hline`, `vline`, `tag`, `put43`, `clear43`, `h43`, `v43`, `v44`, `imp78`, `doorPoint88`, `add89`, `corridor89`, `purposeTile90`, `reset91`, `canPlace93`, `addCompact93`, `pathPoints93`, `GRASS_PAL1020`, `CARPET1020`, `F22_BUDGET43` |
| (c) QA가 가장 많이 쓰지만 게임도 씀 | 17 | qa.js로 옮기면 출시 빌드가 QA 파일을 읽게 된다(qaLeak). 게임 쪽 사용처의 도메인이 정해지면 다시 본다. | `autoWalkTimer`, `autoWalkToken`, `MANRU_PICKUP_PIPELINE_R25`, `safeBlink56`, `castTalisman56`, `revealHidden60`, `uiInputBlocked`, `audit70`, `bench70`, `V85`, `naturalInterval94`, `decalInfo986`, `WARD_DROWN`, `WARD_VOID`, `defBy`, `LegendaryDungeonBuilder`, `mapSignature46` |
| (c) 공용 | 15 | 세 개 이상의 도메인 파일이 쓴다(QA 제외). 한 도메인에 붙이면 나머지가 그 도메인을 부르게 된다. kernel(상태·상수·공용 도우미)로 옮길 후보: `state`, `clamp`, `addLog`, `runState57`. | `state`, `burst`, `clamp`, `runState57`, `gameplayInputAllowed57`, `closeGameplayInteractionState57`, `cancelAutoWalk`, `addLog`, `withJosa57`, `tileBlocksSight`, `monCovers`, `combatLineCheckR8`, `safeLootGround42`, `showInspect`, `hz` |
| (a) 처리됨: QA 전용 | 15 | QA 코드만 쓰므로 `src/qa/qa.js` 맨 앞으로 옮겼다(사용자 결정, 2026-10-11). 출시 빌드 3종에는 더 이상 들어가지 않는다. | `ASURA_HAZ`, `INTERACT61`, `STRUCT70`, `FUNCTION90`, `Cam96`, `STORY_VERSION992`, `V1003`, `ACTIVE1003`, `DEATH1003`, `PW1003,PH1003,PLAYER1003_CACHE`, `V`, `ROUTE_BUILD`, `rarity1011`, `BUILD`, `STATIC_EXTRA_R7` |
| (a) 대상이지만 로드 순서로 고정 | 9 | 가장 많이 쓰는 도메인은 있지만 move-to가 실제 순서 제약(T: TT 채우기 뒤, L: 로드 중 읽힘)으로 거부했다. 위 선언 표의 이유와 같다. | `identifyStartingItems58`, `featureAt56`, `nearTypes56`, `BASE_KIND74`, `CITADEL_PROP_TILES`, `WALLLIKE88`, `V964`, `EMPTY_ACTOR1001`, `BRANCH_INTERACTIVE_OVERLAYS105` |
| (a) 처리됨: world.js | 6 | 사용처가 world 후보(지형 상태·점유·위험 지형)다. world 도메인을 만들면 같이 간다. | `pushableAt105`, `FLYING_BLOCKING_TILES57`, `AQUATIC_STAND_TILES57`, `PLAYER_ENTRY_PICKUP_FIRST57`, `dangerousLootTerrain42`, `pickup` |
| 보류: 사용처가 로드 순서로 남은 branches 선언 | 6 | 사용처가 spine에 남은 branches 소속 선언이다. | `owns47`, `mobDefs47`, `handlePortalAt46`, `healFire47`, `claimAudit46`, `claimReward46` |
| 보류: 사용처가 turn | 2 | 사용처가 턴·입력 진행 코드(spine)다. | `AUTO_MOVE_RATE70`, `targeting81` |
| 보류: 사용처가 로드 순서로 남은 ui 선언 | 2 | 사용처가 spine에 남은 ui 소속 선언이다. | `clearTalismanInput57`, `cipherResult` |
| 보류: 사용처가 로드 순서로 남은 items 선언 | 1 | 사용처가 spine에 남은 items 소속 선언이다. | `typedKeyMeta96` |

## 남은 선언 219개 해소 계획 (2026-10-12, 우선순위순)
`manifest`에서 input·story·ui가 spine.js 앞으로 온 뒤 모든 선언을 다시 분석했다(각 선언의 사용처를 파일별로 세고, 가장 많이 쓰는 도메인으로 `move-to --dry`를 돌려 거부 이유를 모았다). spine.js를 `boot.js`로 바꾸는 시점은 선언이 모두 빠진 뒤이며, 그때 남는 것은 부팅 문장 573개뿐이다.

| 순위 | 묶음 | 선언 수 | 상태 | 해소 방법 |
|---|---|---:|---|---|
| P1 | 사용처의 과반이 한 도메인인 잎 선언 | 51 → 처리됨 50 (남은 1: `RECIPE`) | 완료(2026-10-12, 브랜치 `claude/boot-p1-leaf-declarations`, 도메인별 13커밋). 남은 선언 219 → 169 | 도메인별 커밋으로 규칙 (a) 이동. `values`·`features`가 지킨다. 예외: `RECIPE`는 `addFusionRecipe(...)` 호출들 뒤에 있어야 한다 — `move-to`는 함수 호출 안의 `push`로 채워지는 객체를 못 본다(F-23과 같은 구멍). 호출들을 items.js로 옮기는 P3과 함께 옮긴다 |
| P2 | 3개 이상 도메인이 나눠 쓰는 공용 선언 | 23 → 처리됨 23 | 완료(2026-10-12, 같은 브랜치, 도메인별 11커밋). 남은 선언 169 → 146 | 아래 "P2 위치 규칙과 결정" 참조 |
| P3 | 등록 API와 단계 표: `register*` 9개와 그 표 | 30 → 처리됨 | 완료(2026-10-12, 브랜치 `claude/p3-stage-tables`, 표별 커밋). `RECIPE`도 함께 해소 | 설계·측정·결과는 `docs/P3_DESIGN.md`. 등록 문장을 표 선언의 배열 리터럴로, 단계 본문은 소유 도메인의 이름 있는 함수 선언으로. 순서·id·본문 해시는 `stages`가, 소비 경로는 `consumers`·`features.stages`가 지킨다 |
| P4 | 부팅 문장만 쓰는 나머지(패널·버튼 연결용 지역 변수, 루프 시작 상태, 전설 던전 `*46`/`*47` 묶음 등) | 95 | 사용처가 spine의 느슨한 문장(패널·버튼 연결, 루프 시작) | 느슨한 문장 573개를 실행 순서 그대로 부팅 구획으로 묶을 때 같이 간다. 구획 경계는 `docs/F10_DESIGN.md` 방식(문장 순서 = 동작)으로 정하고 `input.listeners` 지문과 `screens`가 지킨다 |
| P5 | 로드 시 DOM을 만드는 요소 7개 | 7 | 완료(2026-10-23, 방식 A, 브랜치 `claude/p5-dom-vars`; 결과는 `docs/P4_DESIGN.md` 9절) | `feelEl`·`panel`·`coach`·`modal`·`skillQuick`·`classDetail1001`/`classStart1001`·`hud`: 요소 생성과 `appendChild` 문장이 한 묶음이다. 그 묶음(생성+부착)을 ui.js의 한 초기화 함수 `buildPanels`로 만들어 부팅 구획에서 같은 순서로 부른다. DOM 순서(745개)·`uiactions`·`screens`로 검증 |
| P6 | 로드 시 `window.*`/`globalThis.*`를 읽는 초기화식 5개 | 5 | 완료(2026-10-19, 아래 "P6~P8 결과") | `V56`·`POTION_LIST`(`window.MANRU_POTIONS`를 만드는 문장 뒤여야 한다)·`BASE_KIND74`·`legacyPotionIcon`/`legacyPotionDraw`. 값을 만드는 문장을 소유 도메인으로 옮기고 그 뒤에 선언한다 |
| P7 | 로드 순서가 서로 걸린 5개 | 5(231줄) | 완료(2026-10-19, 아래 "P6~P8 결과") | `RuntimeState`(231줄; `INPUT`을 로드 시 읽음 — input.js가 앞이므로 `INPUT` 이동 뒤 가능), `Auto81`, `selectedClass1001`(`CLASSES` 뒤), `POTION_BY_KIND`(`POTION_LIST` 뒤), `strictKeyFloors1004`(special.js의 `LOCK_SPECIAL`을 `strictLockFloors()`로 읽음 — save.js가 아니라 special.js 뒤여야 한다) |
| P8 | 채워지는 객체를 담는 3개 | 3 | 완료(2026-10-19, 아래 "P6~P8 결과") | `V964`, `V981`(`V980.*`), `BRANCH_INTERACTIVE_OVERLAYS105`(`TT['LEGEND_…']`가 branches 표에서 계산됨): 채우기 문장을 소유 도메인으로 옮기거나 값을 읽는 쪽을 함수 안으로 |
| P9 | 전역으로 공개되어 쓰이는 1개 | 1 | `TYPED_KEYS96`는 미사용처럼 보이지만 `globalThis.__MANRU_TYPED_KEYS__`로 공개되어 ui·special·spine이 읽는다 | 유지. 공개 전역을 직접 호출로 바꾸는 별도 정리 때 |

합계 51+23+30+95+7+5+5+3+1 = 219. 실행 순서 제안: P1 → P2 → P5~P8(각각 작음) → P3·P4(부팅 구획과 함께, 사용자 결정 후). 각 단계는 한 커밋이고, 커밋 전 `values`·`features`·`npm test` 전체를 통과시킨다.

## P2 위치 규칙과 결정 (2026-10-12)
서랍을 만들지 않는다. 공용 선언의 위치는 두 가지 검사로 정한다.

1. **사용 폭**: 8개 이상의 도메인이 참조하고 최다 도메인 점유율이 과반 미만이면 kernel 후보다. 아니면 최다 사용 도메인에 붙이고, 동률이면 주제·같은 계열이 있는 도메인으로 정한다.
2. **의존 방향**: kernel 후보는 kernel 선언만 참조해야 한다. 위쪽 도메인의 선언을 참조하면(예: items.js, render.js) kernel에 두면 아래가 위를 의존하게 되므로, 그 선언이 의존하는 도메인에 둔다.

점유율만으로는 판단하지 않는다(사용자 확인: 사용 폭만 보고 addLog·burst를 kernel로 보내자는 제안은 의존 방향 검사로 기각).

| 선언 | 사용 | 위치 | 이유 |
|---|---|---|---|
| state, clamp | 14 / 8 도메인, 최다 25% / 40% | kernel | 두 검사 통과, 의존 없음 |
| runState57 | 8 도메인, ui 33% | kernel | 두 검사 통과, `state`만 참조 |
| addLog | 12 도메인, monsters 24% | items | 폭은 통과하나 포션 이름 가림(`isPotionKnownByPlayer`, `identifyPotion`, `logWithCategory`, `sanitize56`, `POTION_LIST`)이 items.js를 가리킴 |
| burst | 11 도메인, monsters 29% | render | 폭은 통과하나 `FX`(render.js)를 가리킴 |
| hz | 5 도메인(8 미만), monsters 3 / branches 3 동률 | world | 주제: 재해 상태 접근자 |
| cancelAutoWalk | 9 도메인, ui 10 | ui | 최다 사용. `Auto81`이 spine.js에 남아 있으므로 P7에서 다시 본다 |
| 나머지 14개 | 3~8 도메인 | 최다 사용 도메인, 동률은 계열 | 커밋마다 근거 수치 기록 |

결합 후보(지금은 고치지 않는다): `addLog`가 items의 포션 이름 가림 처리를 직접 참조한다. 나중에 로그 출력과 이름 가림을 분리하는 것을 검토한다.

## P3 이후 (2026-10-19)
P3로 등록 문장과 단계 표가 사라지자 `move-to`가 받아 주는 선언이 22개 생겼다. 도메인별 8커밋으로 옮겼다(save 3, branches 2, combat 2, mapgen 3, ui 5, input 1, items 4, monsters 2). 근거는 각 커밋 메시지(사용 도메인 수). 남은 선언은 109개, 느슨한 문장은 485개다. 나머지(P4~P8)의 측정과 방식 제안은 `docs/P4_DESIGN.md`(승인 대기).

## P6~P8 결과 (2026-10-19)
브랜치 `claude/boot-p5-p8`. 도구가 거부하던 이유를 하나씩 풀고(`tests/tools/move-to.test.mjs`에 시험 추가) 같은 게이트(`npm run check`·`npm test` 전체·옛 빌드와 새 빌드의 로드 직후 값 비교, differ 0)로 `tools/chain.mjs`가 커밋·푸시했다.

| 거부 이유 | 풀이 | 옮긴 선언 |
|---|---|---|
| 초기화식이 `window.X`/`globalThis.X`를 로드 중 읽음 | 공개하는 문장이 새 위치보다 앞에 있고, 함수 안에서 공개하지 않고, 새 위치와 옛 위치 사이에서 X의 멤버를 바꾸지 않으면 허용(`defineProperty`·`Object.assign` 호출은 이름을 읽을 수 있을 때만 비교, 못 읽으면 거부) | `POTION_LIST`·`BASE_KIND74`(items), `V56`(ui), `legacyPotionIcon`·`legacyPotionDraw`(render) |
| 함수를 값으로 저장만 하는데 호출로 셈 | 배열 원소·속성 값·초기화식 전체로 저장하는 함수는 호출이 아니다 | `DESCEND_EFFECTS`(mapgen) |
| 채워지는 객체의 다른 멤버를 쓰는 문장 때문에 거부 | 읽는 멤버와 쓰는 멤버가 다르면(`TT['LEGEND_'+…]` 대 `TT.DOOR` 등) 허용. 같은 멤버·접두어가 겹치는 계산 키·접두어 없는 계산 키는 거부 | `BRANCH_INTERACTIVE_OVERLAYS105`(render) |
| 읽는 값이 새 위치보다 뒤 | 읽는 값의 선언이 있는 파일로 목적지를 바꿈(`move-to`가 거부한 save.js 대신) | `strictKeyFloors1004`(special), `AUTO_MOVE_RATE70`·`Auto81`·`RuntimeState`(input), `POTION_BY_KIND`(items) |
| 정의 뒤에 버전 이름을 덮어쓰는 문장 | V85(9번)·V980(1번)에 spine.js가 나중에 쓰던 버전 이름을 정의 안에 최종값으로 넣고 `V964`·`V981`에는 복사하던 시점의 값을 문자열로 넣었다. 문장 10개 삭제. `V85.version`(qa.js)과 `V980.version`(mapgen.js 함수)을 읽는 쪽은 같은 값을 본다. | `V964`(monsters), `V981`(mapgen) |
| 그 밖에 신규로 옮겨진 것 | P3로 사용처가 정리된 뒤 `move-to`가 받아 준 것 | `resetFloorScopedState57`·`runDescendEffects`(mapgen), `throwAt`·`beginViewer45`·`decorInfo986`·`decalInfo986`·`DECAL986`(ui), `onMonsterHpThreshold60`(branches), `uiInputBlocked`(items), `DUNGEON_MOBS47`(monsters), `autoWalkTimer`·`autoWalkToken`(input) |

남은 spine.js 선언 83개: P5의 DOM 요소 7개(사용자 승인 대기), 나머지는 부팅 루프·패널 연결·`TYPED_KEYS96` 등 spine에서만 쓰이는 것이다. `TYPED_KEYS96`: 상수 이름은 읽는 곳이 없지만 `const X=globalThis.Y={…}`에서 이름만 떼면 선언이 느슨한 문장이 되어 `spineLooseStatements`가 늘어 게이트가 막는다(시도해서 확인). 이 문장을 special.js로 옮기려면 `typedKeyMeta96`(let)을 함께 옮겨야 하므로 P9에서 같이 본다.

## P3b 도메인 안 등록 API → 표 (2026-10-19)
브랜치 `claude/boot-p5-p8`. 사용자 결정: 도메인 안 등록 API도 표로 합친다, 생성 단계는 맨 마지막, 그 전에 같은 시드로 여러 층의 지문(`genprint`)과 등록 표 지문(`registries`)을 먼저 둔다. P3와 같은 게이트(`npm run check`, `npm test` 전체 4벌, 옛/새 빌드 로드 직후 값 비교)로 표 하나씩 커밋했다. 도구: `tools/refactor/registry-table.mjs`(등록 호출 → 선언 안의 항목, 인라인 함수는 이름 붙은 선언으로, 시험 7개), `fold-patches.mjs`(시험 2개), `accept-values.mjs`(`values` 기준선을 바꿔야 할 때 옛/새 전체 스냅샷을 비교해 허용한 차이 외에는 거부).

| 표 | 호출 수 | 결과 | 비고 |
|---|---:|---|---|
| `PRESENTATION_UPDATES` | 3 | `new Map([...])` | `PresentationState.register` 삭제. 이름 `martialPresentation`이 이미 있어 `martialPulseUpdate`로 명명 |
| `MINIMAP_PIPELINE.hooks` | 3 | 배열 | `registerMinimapHook` 삭제 |
| 플레이어 공격 단계 | 8 | `playerStages:[...]` | `registerPlayerAttackStageR` 삭제 |
| 몬스터 공격 단계 | 3 | `monsterStages:[...]` | `registerMonsterAttackStageR25` 삭제 |
| 공격 기본 | 2+1 | `playerBase`·`monsterBase` | 플레이어 기본은 두 번 설정되어(`initial`→`combat54`) 앞의 것이 읽히기 전에 덮였다. 마지막 것만 남기고 `attackPlayerInitialCoreR` 삭제 |
| `TurnEngine.stages` | 15 | 배열 | `TurnEngine.register`와 `__MANRU_TURN_PIPELINE__.register` 삭제(공개 객체는 `{abort}`만 남음). 단계 함수 20개 명명, `runtime70`의 pre는 본문이 같은 기존 `markActionTime`을 가리킴(`sameBody` 방지) |
| `ACTION_ROUTES` | 29 | `new Map([...])` | `ActionDispatcher.register` 삭제. 처리기는 모두 이미 이름이 있었다 |
| `patchDef` | 10+1 delete | 정의 안에 합침 | `수련용 환도`·`태도`·`당파`·`단단한 철궁`·`낡은 장도리`·`손도끼`·`질긴 가죽망토`·`바람막이망토`·`여행자망토`·`두꺼운 면망토`. 기존 속성은 제자리, 새 속성은 호출 순서로 끝에 붙여 JSON 키 순서 유지. `delete defBy('두꺼운 면망토').hazardResist`는 속성 삭제. `patchDef` 삭제 |
| 생성 파이프라인 | 31+2 | `pre`·`post`·`base`·`density` | 단계 함수 28개 명명. 기본(`base`)은 두 번 설정되어(`base-original`→`base-vaults38`) 마지막 것만 남기고 `generateFloorOriginal` 삭제. `GENERATION_PIPELINE.density=…` 대입은 리터럴의 `density`로 합치고, 그것이 함수인지 확인하던 `throw`는 지움 |

공통 근거: 각 컨테이너를 로드 중에 읽는 곳을 `load-reads.mjs --sites`로 7개 부팅 상황에서 쟀다. 등록 함수(와 qa.js의 공개 문장)만 읽고, 마지막 등록 전에 소비하는 곳은 없다. 그러므로 컨테이너 선언 자리에서 표를 만들어도 달라지는 읽기가 없다. 등록 함수가 하던 중복 id 검사(`throw`)는 없어졌고, id가 겹치지 않음은 `registries` 시나리오가 확인한다(런타임 동작은 같다). 개명(`ACTION_ROUTES5`→`ACTION_ROUTES`, `MANRU_ATTACK_PIPELINE_R`→`ATTACK_PIPELINE`, `MANRU_GENERATION_PIPELINE`→`GENERATION_PIPELINE`, `runAttackStagesR`→`runAttackStages`)은 별도 커밋이다. 기준선 변화: `values.empty`·`values.branch`가 `register` 멤버 삭제(3커밋)와 개명(1커밋)으로 바뀌었고, 전체 1224개 값 스냅샷 비교에서 다른 차이는 없었다.

남은 것: `replaceViewerQuickButton('inv'|'skill')`는 등록 API가 아니라 DOM 버튼을 복제해 옛 리스너를 떼는 부팅 코드라 표가 아니다(F-25). 부팅 함수화(P4 B 단계)·P5(DOM 변수)는 아직 승인 전이다.

## 느슨한 문장 (이유 P)
(기록 시점 584개, 선언 1289개 → 2026-10 현재 135개, 선언 13개, 397줄. 파일 이름은 `boot.js`.) 두 수와 spine.js 줄 수는 `npm run check`의 `spineLooseStatements`·`spineDeclarations`·`spineLines`로 세며 늘면 실패한다. 매 푸시의 값은 `docs/PROGRESS.md`에 적는다. 이 문장들은 도메인 이동에서 옮기지 않는다. 마지막 단계에서 매니페스트의 `afterClosure`(부팅)와 `boot.js`로 같은 순서를 유지한 채 묶는다.

## 부팅 함수화 (P4 B) 결과
브랜치 `claude/boot-functions`. 연속된 느슨한 문장 묶음은 `tools/refactor/boot-fn.mjs`로 소유 도메인의 이름 있는 함수가 되고 호출만 제자리에 남았다. 한 번만 대입되는 `let` 6개는 함수 선언이 되었고(`let-to-function`), 그리기 훅 7개 등록은 훅 목록을 만드는 리터럴 항목이 되었다. `MINIMAP_PIPELINE.before`·`MARTIAL_INFO.*.desc`·`GenerationValidator.legendary`(과 `Object.freeze`)는 `tools/refactor/fold-assign.mjs`로 정의 리터럴에 합쳤고, `__MANRU_TERRAIN_R41__`는 두 const 대신 render.js의 리터럴 하나가 되었다. 이동이 남긴 빈 줄과, 없는 코드를 설명하던 최상위 주석 187개는 삭제했다.

이 단계 직후의 남은 것(155개 느슨한 문장, 선언 53개)은 아래 종류였다(현재 수치와 이후 이동은 아래 "이어서 줄인 것"과 위의 한 장 요약). 이번 단계에서는 옮기지 않았다(측정한 것은 공개 17개의 먼저 읽기뿐이고, 나머지는 하나씩 따져 보지 않았다).
- 인자 없는 함수 호출 76개: 부팅 호출 목록 그 자체.
- 공개(`window/globalThis.X=`) 17개: 먼저 읽는 곳이 있어 자리를 바꿀 수 없는 것이 대부분(`pub-reads`로 확인).
- 데이터 패치(남은 것): `CONSUMABLES.push` 두 반복(`POTIONS`·`TALISMANS`가 `CONSUMABLES`보다 뒤에 정의됨), `MONSTERS.push(PALACE_*)`, `RuntimeState.*` 대입(값이 spine의 const라 정의 쪽에서 먼저 만들 수 없다). 합친 것은 `SPAWN_RULES`·`SPECIAL_BASE_COUNTS`·활 `ammoFamily`·화살 크기/설명·감찰관 시작 장비·강화부적·`floorSet980/plannedSet980`.
- `if(typeof window.X!=='function')window.X=function…` 4개는 처리했다: 가드가 항상 참이었고 다른 정의가 없어 `spawnMonster`(monsters.js)·`rumorEvent`·`mirrorEvent`(branches.js)는 함수 선언이 되었고, 읽는 곳이 없던 `modalBlocking49`는 삭제했다.
- try/if 문(저장소 읽기 `HAPTIC57`·`manruSfx54`, 옛 키 `removeItem`), `new MutationObserver(killIdentifyBar88)`.
- 선언: 부팅 루프 상태, 패널·버튼 연결 지역 변수, 전설 던전 `*46`/`*47` 묶음(`API47` 등) 등.
`spine.js` → `boot.js` 개명은 남은 것이 호출 목록이 된 뒤에 한다(관련 도구·테스트·문서의 경로가 많아 별도 커밋).

### 이어서 줄인 것 (같은 브랜치)
- 전역 공개 4개(`__manruZoomActive`·`__manruZoomSuppressUntil`·`__MANRU_DRAW_HOOKS_R19__` → render.js, `__MANRU_HIDDEN60_ACTIONS__` → branches.js): `pub-reads`로 먼저 읽는 곳이 0임을 재고 `move-stmt`로 옮겼다. 나머지 공개 중 `__MANRU_RUNTIME81__`는 `Runtime81`/`Automation81` 선언 위치에, `__MANRU_RUMOR_SPACES1030__`는 호출(`.map`)에, 나머지는 로드 중 먼저 읽는 곳(1~168회)에 걸려 남겼다.
- 선언 33개: 한 도메인 파일(과 qa.js)만 쓰던 함수·상수를 `move-to`로 그 파일로(save 3, layout 3, mapgen 1, monsters 2, render 1, branches 1, combat 1, ui 2+5, input 1, items 2, special 1), 전설 던전 API 묶음 15개를 branches.js로(그 공개 두 개도 같이). `CONSUMABLES`에 포션·부적을 합치는 반복 2개는 읽는 곳이 `itemPrototype`뿐이고 그 호출이 두 위치보다 뒤라 items.js(`MANRU_POTIONS` 공개 바로 뒤)로 옮겼다.
- 남긴 것과 이유(측정한 것만): `RuntimeState.input.device`는 로드 중 `active()`가 읽어(14회) 리터럴에 합치면 그 읽기의 값이 달라져 남겼다. `RuntimeState.ui/turn` 대입 4개는 읽는 줄을 하나씩 확인하지 않아 남겼다. `mapOpen49`는 `move-to`가 호출 경로(`updateMobileHud`)로 자리가 고정된다고 거절했고, `V59`도 같은 이유, `BREAK61`·`V85`는 남은 문장이 로드 시 읽는다고 거절했다. `MONSTERS.push(PALACE_*)`는 로드 중 읽는 곳(`MONSTERS`, 7회) 앞뒤를 확인하지 못해 남겼다.
