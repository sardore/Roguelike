# 이름 정리 기록 (모듈 분할 중)

도메인을 옮길 때 이름에 붙은 버전 접미사(`…57`, `…70`, `…1004`)를 도구(`tools/refactor/rename-batch.mjs`)로 기계적으로 뗐다.
**기계 규칙**: 접미사 숫자만 제거. **사람이 정한 이름**(규칙으로 안 되는 경우): 표에서 `수동`으로 표시.
전체 old→new 목록은 `docs/NAMING.tsv`.

## save.js
- 기계(접미사 제거) 34개, 수동 4개: `MEM70→memoryStorage`(localStorage 불가 시 메모리 대체 저장소), `envelope70→buildSaveEnvelope`, `export70→exportSaveFile`, `V1004→SAVE_RELEASE_TAG`(`'v10.0.6'` 문자열; 역할은 이름에서 추정한 것이라 확인 필요), `legacyLoadCoreV3→legacyLoadCore`(`V3`은 버전이 아니라 이름의 일부일 수 있어 역할명으로).
- `WORLD_TARGET57`과 `TRANSACTION6`은 같은 문장에서 `targetFollowupSuppressUntil57`, `TERMINAL_INTENT71`도 선언해서 함께 이동했다(몬스터 쪽 상태일 가능성; monster 도메인 단계에서 재배치 검토).
- 함수 안쪽 이름(`SAVE1004`, `purgeLegacy1004` 등)은 이번 도구 범위(최상위 선언) 밖이라 그대로다.

## items.js
- 접미사 제거(기계) 97개, 수동 이름 24개. 수동 이름은 접미사를 떼면 이미 다른 곳(속성명·지역변수)에서 쓰는 이름과 겹쳐서 역할명을 붙인 것이다. 정의 한 줄만 보고 정한 이름이라 의미가 어긋났을 수 있다(확인 필요): `identifyOne991→useIdentifyScrollOn`, `cursePower991→curseMultiplier`, `potionKnown57→isPotionKindVisible`, `prepareGearCurse`(markGear991), `foodTargetPanel`/`cookingPanel`(DOM 요소라 UI 성격).
- 옮기지 않은 것: `POTION_LIST`, `POTION_BY_KIND`(로드 시 `window.MANRU_POTIONS`를 읽는다. 그 값을 만드는 느슨한 문장 뒤에 있어야 한다), `allPrototypes`(QA 전용 함수).

## combat.js
- 접미사 제거(기계) 89개, 수동 5개(`martialForm1005→martialFormOf`, `openMartialManual1005→showMartialManual`, `hurt61→monsterAttacksTarget`, `critBonus47→cursedBladeCritBonus`, `defBonus47→earthGauntletDefBonus`). 한 줄 정의만 보고 정한 이름이라 확인 필요.
- 이번에 옮기지 않은 것: 부적(TALISMAN*) 묶음 — 아이템과 전투 양쪽 성격이라 도메인 결정 후 옮긴다. `martialLanding`처럼 이름은 무술이지만 이동 쪽 성격인 것은 같이 옮겼다.

## monsters.js
- 접미사 제거(기계) 160개, 수동 13개. 수동 이름은 한 줄 정의만 보고 정한 것이라 확인 필요: `setIntent54→setBossIntent`, `executeIntent54→executeBossIntent`, `charge54→bossCharge`, `setIntent61→setMonsterIntent`, `executeIntent61→executeMonsterIntent`, `ROLE61→MONSTER_ROLE_TABLE`, `BOSS60→BOSS_FLOORS`, `AIM52→AIM_STATE` 등.
- 이름 키워드로 잡혔지만 다른 도메인이라 옮기지 않은 것: `silk970`(방 장식), `monsterInfo986`(정보창), QA 전용 `asura*61`, `bossGateOpen1020`, `selectBowTarget52`, `monsterName1011`.

## render.js
- 접미사 제거(기계) 178개, 수동 23개(스프라이트 상수·캐시·플레이어/액터 그리기 함수 등, 한 줄 정의만 보고 정한 이름이라 확인 필요). `Camera81→CameraController`, `Zoom81→ZoomController`, `PERF49→RENDER_PERF_STATE`, `PERF58→FRAME_PERF_STATE`, `syncGameViewport47→syncCanvasWrapViewport` 등.
- 패널을 그리는 `render*`(상점·인벤토리·도움말·조합·분류 화면 등)는 ui 도메인으로 남겼다. 방 장식 `paintLoop972/980`, `LEGEND_TILES49`(LEGENDS47을 로드 시 읽음), `Cam96`, `legacyPotionIcon/Draw`는 옮기지 않았다.
- `savedMode`/`savedZoom`은 `cameraData12`가 로드 시 읽어서 같이 옮겼다.

### render.js 수동 이름 23개 검증 (사용처를 직접 읽은 근거)
| 새 이름 | 옛 이름 | 근거(사용처) | 판정 |
|---|---|---|---|
| `syncCanvasWrapViewport` | `syncGameViewport47` | 정의 render.js: `#canvasWrap`의 padding을 뺀 크기·`P47.renderDpr`로 `VIEW.w/h`·캔버스 크기를 맞춘다. 디버그 전장이면 `syncGameViewport`로 넘긴다. 호출 spine.js 1곳(부팅 직후 동기화) | 맞음 |
| `RENDER_PERF_STATE` | `PERF49` | 정의: `dirty/panelDirty/miniDirty/lastFrame/emaCost…`. 이동 후 이벤트(`registerMovePost`)가 `.dirty=true`, 미니맵 갱신이 `.miniDirty/.lastMini` 사용 (23회) | 맞음 |
| `FRAME_PERF_STATE` | `PERF58` | 정의 `{last,lastMini,lastHud,lastViewport,dirty,avg,lastCost,frames}`. 프레임 루프 끝에서 `.last/.lastCost/.frames++/.avg` 갱신 (9회) | 맞음 |
| `drawDoorAt` | `drawDoor60` | 타일 좌표(x,y)로 위·아래 벽 여부를 계산해 `drawDoor`를 호출. 호출처 2곳 모두 문/열린 문 그리기 | 맞음 |
| `CameraController` | `Camera81` | 정의: `__MANRU_CAMERA_STATE12__`로 위임하는 얇은 객체(state/set/beginInspect/panScreen/endPan/cancelInertia/resume/center). 사용처 spine.js 세 곳이 `resume`, `cancelInertia` 호출 | 맞음(이미 있던 위임 객체; 새로 만든 것 아님) |
| `ZoomController` | `Zoom81` | 정의 "actual zoom controller", 핀치 처리에서 `.value()`로 현재 배율을 읽음 (5회) | 맞음 |
| `PLAYER_SPRITE_W/H` | `PW1004/PH1004` | 플레이어 스프라이트 캔버스 `clearRect(0,0,W,H)`에만 사용(32×36) | 맞음 |
| `PLAYER_RARITY_HI` | `rarityHi1004` | 플레이어의 망토·갑옷·유물 윤곽색 `PLAYER_RARITY_HI[item.rarity]` 3곳 | 맞음 |
| `ACTOR_RARITY_HI` | `rarityHi1012` | 액터(플레이어/동료) 갑옷·망토·유물 색, 5곳 | 맞음 |
| `drawPlayerCloak/Relic/Trinket` | `drawCloak/Relic/Trinket1004` | 정의는 `(q,p)`로 플레이어 장비를 그림. 호출은 `playerSprite`의 한 곳(갑옷 상세→유물→장신구→손에 든 무기 순) | 맞음 |
| `HERO_SPRITE_W/H/CACHE` | `SW/SH/SPR1011` | `HERO_SPRITE_CACHE`는 영웅 스프라이트 캐시(spine.js의 `__MANRU_ACTOR_CACHE1011__.clear`에서도 비움). `W/H`는 **QA 파일만** 읽는다(qa.js:340) | 맞음 |
| `ACTOR_OUTLINE`, `ACTOR_INK` | `OUT1012`, `INK1012` | 몬스터·동료 스프라이트의 외곽선색(12회)과 먹색(4회) | 맞음 |
| `ACTOR_CACHE` | `CACHE1012` | `monsterCanvas`가 키(`종:무기:프레임…`)로 조회·저장(17회) | 맞음 |
| `ACTOR_SPEC` | `SPEC1012` | `ACTOR_SPEC[m.name]`/`[m.spriteSpecies]`로 종별 그림 규격 조회(6회) | 맞음 |
| `drawLegendMotif` | `motif49` | 전설 던전 월드(`drawLegendWorld`) 그리기에서 `(q,T,x,y,kind,size)`로 문양을 그림, 9회 | 맞음 |
| `ACTOR_CELL_W/H` | `CW/CH1012` | **사용처가 한 곳도 없어서 삭제**(선언만 있었음). 같은 32×36 크기가 `PLAYER_SPRITE_*`, `HERO_SPRITE_*`와 세 벌로 존재(FINDINGS F-17) | 삭제 |

## input.js
- 접미사 제거(기계) 9개, 수동 0개. 옮긴 것은 이벤트 처리 함수·키 표·길게 누르기/스와이프 도우미 12개다. 리스너를 등록하는 느슨한 문장은 `spine.js`에 남아 있어 등록 순서는 그대로이고, `input.listeners.*` 지문과 입력 재생 37개 검사로 확인했다.
- 옮기지 못한 입력 코드(`InputRouter`, `ClientEnvironment`, `Runtime81`, `DesktopClient`, `CONFIG81`)는 스파인의 느슨한 문장이 로드 시점에 읽어서 `docs/SPINE_RESIDUE.md`에 이유와 함께 적었다. 이름도 아직 바꾸지 않았다(옮길 때 `POINTER_CONFIG`, `PointerRuntime`으로 바꿀 계획: `CONFIG81`은 드래그 임계값·길게 누르기 지연·반복 간격만 담고, `Runtime81`은 `pointers/gesture/held/repeatTick/qa` 상태를 담는다는 사용처 확인에 근거).

## story.js
- 접미사 제거(기계) 50개, 수동 4개. 수동 이름의 근거(사용처 확인): `floorTutorial66→showFloorTips`(매 행동 뒤 호출되어 5·6·11층에서 팁을 띄움), `entryTutorial60→advanceEntryTutorial`(`tutorialEntry60` 상태가 진행 중일 때 안내를 띄움), `storyDoc992→findStoryDoc`(`STORY_DOCS[id]||null`, 5곳), `esc992→escapeHtmlText`(HTML 이스케이프, 16곳).
- 옮기지 않은 것: `coach`, `STORY_VERSION992`(스파인의 느슨한 문장이 로드 시 읽음; `docs/SPINE_RESIDUE.md`), 이름이 비슷해도 다른 도메인인 `autoExplore`, `fullscreenPending65`, `pendingInspect984`, 분기 진입 대기(`branchEntrancePending105`, `retryPendingBranchEntrance105`), `installPendingCustomLocks1020`, `terrainHasPendingRecovery57`.

## ui.js
- 접미사 제거(기계) 92개, 수동 13개. 수동 이름의 근거(정의와 사용처를 읽은 것): `finishViewer45→finishModalOpening`(`UX.modalOpening=false`와 `ux-modal-open` 클래스 토글), `glyph62→beltItemGlyph`(벨트 그리기 `renderBelt`에서만 사용: 부적 봉인·약/병·식·물 글자), `closePanel70→closeReleasePanel`(`RC.panelOpen`, 클래스 `rc70-open`; 짝이 `openReleasePanel`), `closeTip70→closeCurrentTip`·`suspendTip60→suspendTips`(팁 큐 `pumpTip70` 계열), `refreshContinue70→refreshContinueStatus`(`RunLifecycle.refreshContinue()` 호출 뒤 저장소 영구 여부 문구를 덧붙임), `cancelTarget74→cancelTalismanTargeting`(토스트 '부적 사용을 취소했다.'), `blocked81→isGameplayInputBlocked`(`!gameplayInputAllowed57()`), `stopHeld81→stopHeldInput`, `classPortrait95→classPortraitCanvas`(64px 캔버스를 그림), `classPortrait1001→classArtSpanHtml`(스프라이트 시트를 CSS 변수로 자르는 `<span>` HTML을 돌려줌), `closeSkillQuick991→closeSkillQuickPanel`, `pictureAsset105→summonPictureAsset`(소환 '그림' 아이템 그림 캔버스).
- 옮기지 않은 것: 디버그 전장(`debugBattle*`, 별도 기능이라 나중에 한 파일로), 자동 이동 `Auto81`(이동 도메인), 이름이 한두 글자인 최상위 상수(`m`, `hc`, `hk`, `ph`, `mb`, `dg`, `cv`, `hold`, `rule`, `panel`, `modal`, `ghost`, `corners`, `feed`, `adorn`, `pad58`, `active70`, `R61` 등: 역할명을 붙이는 별도 단계), 로드 시 읽히는 것(`CLASS1001_META`, `CLASS1001_STATS`, `CLASS1001_STAT_PATHS`, `displayName991`, `targeting81`, `viewerOpen`, `MobileClient`, `OrientationGate`, `ClientEnvironment`; 이유는 `docs/SPINE_RESIDUE.md`).

## 불러오기 단계 → 함수 (afterLoad 통합, save.js)
등록 순서(= 실행 순서)대로: `resume70`→`resetTipsAfterLoad`, `talisman74`→`refreshTalismansAfterLoad`, `runtime81`→`centerCameraAfterLoad`, `quality94`→`restoreWallAndBiasFields`, `locks96`→`restoreKeyPlan`, `quality-current983`→`restoreCoreLootAudit`, `camera-save984`(pre)→`readLoadRequest`, `camera-save984`(post)→`restoreCameraAfterLoad`, `curse-clock991`→`syncCurseClockAfterLoad`, `screen1002`→`showGameScreenAfterLoad`, `permadeath1003`→`sanitizeAfterLoad`, `strict-lock1004`→`auditStrictLocksAfterLoad`, `hazard1005`→`resolveHazardsAfterLoad`, `normalize1006`→(함수 없이 `normalizeAllItems()` 직접 호출), `architecture1020`→`restoreArchitectureAfterLoad`, `artifact46`→`migrateArtifactReturnAfterLoad`. 이름은 각 본문이 하는 일을 읽고 붙였다(수동).

## mapgen.js
- 층 생성 기반(`ReachabilityService`, `RngService`, `NormalFloorGenerator`, `GenerationValidator`, `NormalGenerationStages`)과 방·복도·금고·지형 칠하기, 특수층 보조 함수 289개. 파일은 `spine.js`보다 **앞**에 로드된다(스파인의 등록 문장이 이 서비스들을 로드 시점에 읽기 때문).
- 접미사 제거(기계) 177개, 수동 50개(+`immutable980`), 이름 바꾸기 거부 2개(`stairMarkerState1029`, `finalExitReach1029`: 같은 이름의 바인딩이 둘이라 도구가 거부, 이름 그대로).
- 수동 이름의 근거(정의·호출처를 읽은 것): 층 번호별 특수 지형 빌더 `buildGreatHall60`→`buildFloor2GreatHall`, `buildRoomMaze60`→`buildFloor13RoomMaze`, `buildFortress60`→`buildFloor16Fortress`, `buildVoidSea60`→`buildFloor21VoidSea`(`builders={2:buildGreatHall60, 13:…, 16:…, 21:…}` 표; 일반 층용 `buildGreatHall` 등과 이름이 겹쳐 층 번호를 이름에 넣음). 방 테마 장식기 `banquet970`…`sanctum970`→`decorate*Room`(`markWalls`로 벽을 표시하고 `pair`로 가구 쌍을 놓음). 격자 도우미 `fill60/box60/blob60/line60/bridge60`→`fillMap/addBoxRoom/carveBlob/carveLine/carveBridge`. 버전 쌍(`vestibule94`/`vestibule980`, `semiOpen94`/`semiOpen980`, `paintLoop972`/`paintLoop980`)은 하는 일이 달라 서로 다른 이름을 붙였다. 나머지는 `docs/NAMING.tsv`의 `manual` 행. 한 줄 정의 수준의 근거라 어긋났을 수 있다.
- 옮기지 못한 것(`docs/SPINE_RESIDUE.md`): `PlacementService`, `OccupancyService`, `BLOCK85`, `ConnectedDecor81`(로드 시점에 `TT.*` 값을 집합으로 담는데 `TT.*`를 채우는 스파인의 문장이 더 뒤에 있음), `floorSet980`, `immutable980`(같은 이유). 이름이 일반적이거나 다른 도메인이라 뺀 것: `TALISMANS`·`talismanPick56`(아이템), 스폰 규칙(`SPAWN_RULES`, `spawnFloorPopulation` 등: 몬스터), `trapEvent`·`vaultEvent`, `shuffle`·`contains` 등.

## special.js
- 특수 층·특수 공간 161개: 수문장 방·수은 호수·복숭아 정원 빌더, 상점 지도(`ShopMapBuilder`), 열쇠/잠금 계획(`install*Locks`, `KEY_TYPES`), 20층 건축(`build*_1020`과 `arch*` 도우미), 서고(`applyLibrary`), 식당(`restaurant*`), 소문 공간(`rumor*`), 층 분위기(`FLOOR_FEELINGS`). `mapgen.js` 뒤, `spine.js` 앞에 로드된다.
- 접미사 제거(기계) 약 137개, 수동 18개, 이름 바꾸기 거부 3개(`visualFree1022`, `rumorSpaceKey1030`, `roomHas1022`: 같은 이름의 바인딩이 둘).
- 수동 이름의 근거(정의·호출처를 읽은 것): 20층 건축 도우미 `set1020/line1020/rect1020/box1020/door1020/window1020/tag1020/decor1020/movePlayer1020/ring1023`→`arch*`(모두 `build*_1020`이 부르는 한 글자·두 글자 조작: 타일 설정(`inside1020` 확인 후 `state.map` 변경), 선·사각형·상자 채우기, 문·창, 경로 태그, 장식, 플레이어 이동, 고리). `region1020`→`regionOfFloor`(층에서 0~4 구역 번호 계산), `FEEL62`→`FLOOR_FEELINGS`(층 분위기 표), `strictLockAudit96`→`auditKeyPlanLocks`, 24층 저택 도우미 `doorway24/partition24/windows24`→`carveDoorway/addPartitionWall/addWindowsAlongSide`. 한 줄 정의 수준의 근거라 어긋났을 수 있다.

## branches.js
- 분기 던전(궁전 `palace*`, 요새 `citadel*`, 광산 `mine*`, 도장 `dojo*`, 산 `mountain*`, 운하, 전설 던전 `legend*`)과 분기 저장 압축·복원 `branch*Pack/Unpack/Migrate` 203개. `special.js` 뒤, `spine.js` 앞에 로드된다.
- 접미사 제거(기계) 202개, 수동 1개: `LAYOUT47`→`LEGEND_DUNGEON_LAYOUTS`(전설 무기 id별 방 배치 표; `LAYOUT47[a.id]`로 조회). 이름 바꾸기 거부는 없음(도구가 한 건도 거부하지 않음).
- 옮기지 못한 것(`docs/SPINE_RESIDUE.md`): 상수 `BRANCH_DEFS105`, `BRANCH_RUN_FIELDS105`, `BRANCH_INTERACTIVE_OVERLAYS105`, `BRANCH_DISTRICT_LOOKUP105`, `PALACE_*`(KING/GARDENER/KING_IMAGE/GARDENER_IMAGE/LOTUS/TIDE/COLORS/INNER_COLORS/SWEEP_RULES), `CITADEL_*`(MOVED/COMBAT_OFFSET/ENEMIES), `DOJO_BLINK105`, `DOJO_STYLE_WEIGHTS105`, `MINE_ITEMS105`, `MOUNTAIN_REWARDS105`, `LEGEND_SKILLS986`, `LEGENDS47`·`LEGEND_TILES49`·`LEGEND_THEMES47`·`DEF47`(전설 무기 표). 이유는 대부분 같다: 이 값을 읽는 함수가 렌더·저장 이동 경로(`updateAll`, `drawMinimap`, `migrateGameState` 등)를 거쳐 스파인의 로드 문장에서 호출될 수 있어, 새 파일이 늦게 초기화되면 로드 시점에 읽힌다(`move-to`의 추이적 호출 검사). 호출을 통해 도달 가능하다는 보수적 판정이라, 실제로 로드 중 도달하는지는 확인하지 않았다.
- 이름이 분기 던전이 아닌 것으로 뺀 것: `elementAffectsMaterial105`, `destroyElementStructure105`, `thawWater105`, `setTerrainSurface65`, `compactHudName58`, `hudLocation58`, `WorldTransition57`, `carryRunState57` 등 지형·HUD 공용 코드.
