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
| `ASURA_HAZ` | monsters | T(F-23): `TT.CRUMBLE` 할당 뒤 | `TT` 할당을 kernel로 모은 뒤(F-24 결정 필요) |
| `CITADEL_PROP_TILES` | render | T(F-23): `Object.assign(TT,{STONE_PILLAR…})` 뒤 | 같은 조건 |

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
| 보류: 사용처가 layout 후보 | 22 | 사용처가 layout 후보(방·통로·층 모양 생성 코드)다. layout 도메인을 만들면 같이 간다. | `put`, `clear`, `hline`, `vline`, `tag`, `put43`, `clear43`, `h43`, `v43`, `v44`, `imp78`, `doorPoint88`, `add89`, `corridor89`, `purposeTile90`, `reset91`, `canPlace93`, `addCompact93`, `pathPoints93`, `GRASS_PAL1020`, `CARPET1020`, `F22_BUDGET43` |
| (c) QA가 가장 많이 쓰지만 게임도 씀 | 17 | qa.js로 옮기면 출시 빌드가 QA 파일을 읽게 된다(qaLeak). 게임 쪽 사용처의 도메인이 정해지면 다시 본다. | `autoWalkTimer`, `autoWalkToken`, `MANRU_PICKUP_PIPELINE_R25`, `safeBlink56`, `castTalisman56`, `revealHidden60`, `uiInputBlocked`, `audit70`, `bench70`, `V85`, `naturalInterval94`, `decalInfo986`, `WARD_DROWN`, `WARD_VOID`, `defBy`, `LegendaryDungeonBuilder`, `mapSignature46` |
| (c) 공용 | 15 | 세 개 이상의 도메인 파일이 쓴다(QA 제외). 한 도메인에 붙이면 나머지가 그 도메인을 부르게 된다. kernel(상태·상수·공용 도우미)로 옮길 후보: `state`, `clamp`, `addLog`, `runState57`. | `state`, `burst`, `clamp`, `runState57`, `gameplayInputAllowed57`, `closeGameplayInteractionState57`, `cancelAutoWalk`, `addLog`, `withJosa57`, `tileBlocksSight`, `monCovers`, `combatLineCheckR8`, `safeLootGround42`, `showInspect`, `hz` |
| 결정 필요: QA 전용 | 15 | QA 코드(src/qa/qa.js)만 쓴다. (a)를 따르면 qa.js로 가고 출시 빌드에서 빠진다(출시 동작은 같다). move-to는 지금 qa.js로 옮기지 않는다. | `ASURA_HAZ`, `INTERACT61`, `STRUCT70`, `FUNCTION90`, `Cam96`, `STORY_VERSION992`, `V1003`, `ACTIVE1003`, `DEATH1003`, `PW1003,PH1003,PLAYER1003_CACHE`, `V`, `ROUTE_BUILD`, `rarity1011`, `BUILD`, `STATIC_EXTRA_R7` |
| (a) 대상이지만 로드 순서로 고정 | 9 | 가장 많이 쓰는 도메인은 있지만 move-to가 실제 순서 제약(T: TT 채우기 뒤, L: 로드 중 읽힘)으로 거부했다. 위 선언 표의 이유와 같다. | `identifyStartingItems58`, `featureAt56`, `nearTypes56`, `BASE_KIND74`, `CITADEL_PROP_TILES`, `WALLLIKE88`, `V964`, `EMPTY_ACTOR1001`, `BRANCH_INTERACTIVE_OVERLAYS105` |
| 보류: 사용처가 world 후보 | 6 | 사용처가 world 후보(지형 상태·점유·위험 지형)다. world 도메인을 만들면 같이 간다. | `pushableAt105`, `FLYING_BLOCKING_TILES57`, `AQUATIC_STAND_TILES57`, `PLAYER_ENTRY_PICKUP_FIRST57`, `dangerousLootTerrain42`, `pickup` |
| 보류: 사용처가 로드 순서로 남은 branches 선언 | 6 | 사용처가 spine에 남은 branches 소속 선언이다. | `owns47`, `mobDefs47`, `handlePortalAt46`, `healFire47`, `claimAudit46`, `claimReward46` |
| 보류: 사용처가 turn | 2 | 사용처가 턴·입력 진행 코드(spine)다. | `AUTO_MOVE_RATE70`, `targeting81` |
| 보류: 사용처가 로드 순서로 남은 ui 선언 | 2 | 사용처가 spine에 남은 ui 소속 선언이다. | `clearTalismanInput57`, `cipherResult` |
| 보류: 사용처가 로드 순서로 남은 items 선언 | 1 | 사용처가 spine에 남은 items 소속 선언이다. | `typedKeyMeta96` |

## 느슨한 문장 (이유 P)
현재 spine.js에 느슨한 문장(등록·호출·대입) 584개가 남아 있다(선언 1289개). 두 수와 spine.js 줄 수는 `npm run check`의 `spineLooseStatements`·`spineDeclarations`·`spineLines`로 세며 늘면 실패한다. 매 푸시의 값은 `docs/PROGRESS.md`에 적는다. 이 문장들은 도메인 이동에서 옮기지 않는다. 마지막 단계에서 매니페스트의 `afterClosure`(부팅)와 `boot.js`로 같은 순서를 유지한 채 묶는다.
