# 공개 전역(브리지) 판정표

`node tools/refactor/bridge-report.mjs --md`가 만든다.

- **게임**: 게임 코드가 읽는다. 릴리스에 남는다.
- **QA**: 아무도 읽지 않거나, 읽는 곳이 모두 다른 QA 멤버 안이다. 빌드 플래그 `--qa`로만 들어간다. `[테스트]`는 `tests/`가 쓴다.

판정은 이름이 아니라 읽는 곳으로 한다. 별칭(`const api = window.__X__`)을 통한 읽기도 센다. 이름만으로 본 읽기는 과대 계산되어 게임 쪽으로 기운다.

## __MANRU_RANDOM57__ — 게임 (줄 1036)

## __MANRU_RELEASE__ — 게임+QA 섞임 (줄 10847)
- 게임: closePanel(1), markAction(1), tip(2), floorTutorial(1), closeTip(1), suspendTip(2), entryTutorial(2)
- QA: build

## __MANRU_LIFECYCLE__ — 게임 (줄 5654)

## __MANRU_TURN_ENGINE__ — 게임 (줄 7592)

## __MANRU_RUNTIME81__ — 게임 (줄 12044)
- 게임: state(7), Automation81(3), Camera81(5), Zoom81(1), ConnectedDecor81(1), Integrity81(19), inspect(1), stopHeld(3)

## __MANRU_CAMERA_STATE12__ — 게임 (줄 14812)

## __MANRU_HAZARD_CORE__ — 게임 (줄 16416)
- 게임: armFragile(4), collapseAt(2), kind(18), adapted(5), resolve(2), standing(2), revalidateAt(1), revalidateAll(2)

## __MANRU_ITEM_IDENTITY991__ — 게임 (줄 15384)

## __MANRU_LEGEND47__ — 게임 (줄 20228)

## __MANRU_CAMERA_PROJECTION12__ — 게임 (줄 14812)

## __MANRU_UX45_ACTIONS__ — 게임 (줄 7599)

## __MANRU_SAVE_SERVICE__ — 게임 (줄 16007)

## __MANRU_ACTOR_ART__ — 게임 (줄 19388)

## __MANRU_SFX54__ — 게임 (줄 7948,8011)

## __MANRU_TURN_PIPELINE__ — 게임 (줄 7593)
- 게임: register(12), abort(1)

## __MANRU_TYPED_KEYS__ — 게임+QA 섞임 (줄 13031)
- 게임: setMetaProvider(1), meta(1), hydrate(4), restoreSurfaces(2), pickupAt(2), tryOpenAt(2), summary(1)
- QA: keyAt, doorAt, snapshot

## __MANRU_CONSUMABLE56_ACTIONS__ — 게임 (줄 8299)

## __MANRU_TALISMAN74_ACTIONS__ — 게임 (줄 11399)

## __MANRU_RUMOR_SPACES1030__ — 게임 (줄 18457)

## __MANRU_SPECIAL_FLOORS60__ — 게임 (줄 10121)

## __MANRU_STORY992__ — 게임 (줄 15617)
- 게임: resume(1), close(1), closeScene(1), selectEnding(1), continueScene(1), project(1), open(2), ending(1)

## __MANRU_TERRAIN_R41__ — 게임 (줄 16569,17799)

## __MANRU_DRAW_HOOKS_R19__ — 게임 (줄 8679)
- 게임: world(2), post(6)

## __MANRU_LEGEND_TERRAIN47__ — 게임 (줄 20126)
- 게임: drawCell(3), miniColor(2), theme(2), clear(1)

## __MANRU_SAVE1004__ — 게임 (줄 16037)

## __MANRU_AI61__ — 게임 (줄 10291)
- 게임: configure(3), special(1), artillery(1), intent(1)

## __MANRU_ITEM_ART_R7__ — 게임 (줄 19800)
- 게임: dataItem(1), weaponAsset(2), pictureAsset(1), iconHtml(1), clear(1)

## __MANRU_TALISMAN_PUBLIC__ — 게임 (줄 8153)
- 게임: known(1), name(2), seal(3), app(3)

## __MANRU_WORLD_HITTEST12__ — 게임 (줄 14812)

## __MANRU_RUN_SEED984 — 게임 (줄 5612,15239,15243)

## __MANRU_AMMO_ATTACK__ — 게임 (줄 13471)
- 게임: consume(1), prepare(1), finish(1)

## __MANRU_ASURA61__ — 게임 (줄 10312)
- 게임: blocksDirect(4)

## __MANRU_GEN_RNG57__ — 게임 (줄 1035)

## __MANRU_MARTIAL_FX965__ — 게임 (줄 13275)

## __MANRU_POTION41_ACTIONS__ — 게임 (줄 7118)

## __MANRU_SKILL991_INPUT__ — 게임 (줄 15470)

## __MANRU_CLEAN_INSPECT53 — 게임 (줄 7917)
- 게임: item(2)

## __MANRU_INSPECT984__ — 게임 (줄 15177)

## __MANRU_RUNTIME_START57__ — 게임 (줄 6411)

## __MANRU_V984_SET_ZOOM__ — 게임 (줄 14813)

## __manruZoomActive — 게임 (줄 6691)

## __MANRU_ARTIFACT46__ — 게임 (줄 20228)

## __MANRU_BOSS54__ — 게임 (줄 8037)
- 게임: draw(2)

## __MANRU_DEBUG__ — QA (줄 6677)
- QA: get[테스트], elementDamage61, tutorial60, presentation58, floor[테스트], inventory, close, settle, teleportFeature

## __MANRU_GEN991__ — 게임 (줄 15417)
- 게임: applyCurses(1), ensureHoly(1)

## __MANRU_GENERATE_CORE983__ — 게임 (줄 14699)

## __MANRU_POTION_ART_56__ — 게임 (줄 8210)
- 게임: iconHtml(1), worldDraw(1)

## __MANRU_RENDER47__ — 게임 (줄 7611)

## __MANRU_RESUME_R6__ — 게임 (줄 10919)
- 게임: schedule(2)

## __MANRU_TERRAIN_CODEX986__ — 게임 (줄 15215)
- 게임: openItem(2)

## __manruZoomSuppressUntil — 게임 (줄 6692,6694,14768)

## __MANRU_ACTOR_CACHE1011__ — 게임 (줄 17696)
- 게임: clear(1)

## __MANRU_BELT62__ — 게임 (줄 10439)

## __MANRU_CAMERA984__ — 게임 (줄 14814)

## __MANRU_CLEAR_HI_CACHE__ — 게임 (줄 6715)

## __MANRU_CONTEXT_DOOR_HANDLER_R25__ — 게임 (줄 13255)

## __MANRU_DEATH_FX54__ — 게임 (줄 7947)

## __MANRU_DRAW_BASE58__ — 게임 (줄 8678)

## __MANRU_DRAW_ITEM_IMPL_R7__ — 게임 (줄 19799)

## __MANRU_F23_REVEAL_FORCE60 — 게임 (줄 )

## __MANRU_HIDDEN60_ACTIONS__ — 게임 (줄 9048)

## __MANRU_ICON_HTML_IMPL_R7__ — 게임 (줄 19798)

## __MANRU_LIBRARY1022_ACTIONS__ — 게임 (줄 17682)

## __MANRU_PAUSE_RENDER61 — 게임 (줄 10612)

## __MANRU_ROOM_GEOMETRY105__ — 게임 (줄 12622)

## __MANRU_TRANSIENT47__ — 게임 (줄 7610)

## __MANRU_DEBUG_BATTLE57__ — QA (줄 23803)

## __MANRU_INIT_COMPLETE__ — 전체 미사용 (줄 23816)

## __MANRU_LAST_LIFECYCLE__ — QA (줄 5618)
- QA: kind, core, entered, aborted, abortStage

