# spine.js에 남긴 선언 목록 (초기화 순서 때문에 옮기지 못한 것)

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
| P3 | 등록 API와 단계 표: `register*` 10개(`registerMovePreR8` … `registerPanelHook54`)와 그 표 20개(`*_STAGES55`, `V54`, `PANEL_HOOKS54`, `RUN_END_EFFECTS53`, `startFloorTransition` 등; 사용처가 도메인 1곳 + spine 선언·문장) | 30 | 사용처가 도메인 한 곳과 spine의 등록 문장뿐 | 불러오기·새 게임에서 한 방식으로: 등록 구조를 없애고 순서대로 적은 함수 하나로 합친다. 등록 순서 지문(`input.listeners.*` 포함)으로 검증. 사용자 결정 필요(F-10 설계와 같은 종류) |
| P4 | 부팅 문장만 쓰는 나머지(패널·버튼 연결용 지역 변수, 루프 시작 상태, 전설 던전 `*46`/`*47` 묶음 등) | 95 | 사용처가 spine의 느슨한 문장(패널·버튼 연결, 루프 시작) | 느슨한 문장 573개를 실행 순서 그대로 부팅 구획으로 묶을 때 같이 간다. 구획 경계는 `docs/F10_DESIGN.md` 방식(문장 순서 = 동작)으로 정하고 `input.listeners` 지문과 `screens`가 지킨다 |
| P5 | 로드 시 DOM을 만드는 요소 7개 | 7 | `move-to`가 거부(`document`를 읽고 앞 문장이 DOM을 바꿈) | `feelEl`·`panel`·`coach`·`modal`·`skillQuick`·`classDetail1001`/`classStart1001`·`hud`: 요소 생성과 `appendChild` 문장이 한 묶음이다. 그 묶음(생성+부착)을 ui.js의 한 초기화 함수 `buildPanels`로 만들어 부팅 구획에서 같은 순서로 부른다. DOM 순서(745개)·`uiactions`·`screens`로 검증 |
| P6 | 로드 시 `window.*`/`globalThis.*`를 읽는 초기화식 5개 | 5 | 거부 | `V56`·`POTION_LIST`(`window.MANRU_POTIONS`를 만드는 문장 뒤여야 한다)·`BASE_KIND74`·`legacyPotionIcon`/`legacyPotionDraw`. 값을 만드는 문장을 소유 도메인으로 옮기고 그 뒤에 선언한다 |
| P7 | 로드 순서가 서로 걸린 5개 | 5(231줄) | 거부 | `RuntimeState`(231줄; `INPUT`을 로드 시 읽음 — input.js가 앞이므로 `INPUT` 이동 뒤 가능), `Auto81`, `selectedClass1001`(`CLASSES` 뒤), `POTION_BY_KIND`(`POTION_LIST` 뒤), `strictKeyFloors1004`(special.js의 `LOCK_SPECIAL`을 `strictLockFloors()`로 읽음 — save.js가 아니라 special.js 뒤여야 한다) |
| P8 | 채워지는 객체를 담는 3개 | 3 | 거부 | `V964`, `V981`(`V980.*`), `BRANCH_INTERACTIVE_OVERLAYS105`(`TT['LEGEND_…']`가 branches 표에서 계산됨): 채우기 문장을 소유 도메인으로 옮기거나 값을 읽는 쪽을 함수 안으로 |
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

## 느슨한 문장 (이유 P)
현재 spine.js에 느슨한 문장(등록·호출·대입) 584개가 남아 있다(선언 1289개). 두 수와 spine.js 줄 수는 `npm run check`의 `spineLooseStatements`·`spineDeclarations`·`spineLines`로 세며 늘면 실패한다. 매 푸시의 값은 `docs/PROGRESS.md`에 적는다. 이 문장들은 도메인 이동에서 옮기지 않는다. 마지막 단계에서 매니페스트의 `afterClosure`(부팅)와 `boot.js`로 같은 순서를 유지한 채 묶는다.
