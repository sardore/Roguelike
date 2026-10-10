# 공개 전역(브리지) 판정표

`node tools/refactor/bridge-report.mjs --md`가 만든다.

- **게임**: 게임 코드가 읽는다. 릴리스에 남는다.
- **QA**: 아무도 읽지 않거나, 읽는 곳이 모두 다른 QA 멤버 안이다. 빌드 플래그 `--qa`로만 들어간다. `[테스트]`는 `tests/`가 쓴다.

판정은 이름이 아니라 읽는 곳으로 한다. 별칭(`const api = window.__X__`)을 통한 읽기도 센다. 이름만으로 본 읽기는 과대 계산되어 게임 쪽으로 기운다.

## __MANRU_RANDOM57__ — 게임 (줄 1036)

## __MANRU_RELEASE__ — 게임+QA 섞임 (줄 11011)
- 게임: closePanel(1), markAction(1), tip(2), floorTutorial(1), closeTip(1), suspendTip(2), entryTutorial(2), audit(2), invalid(1)
- QA: build, bench, save[테스트], slotLoad, load[테스트], snapshot[테스트], diagonal, pacing, stress, resetTips, openPanel, regen[테스트], storage, screen, hit, camera, autosave

## __MANRU_TURN_ENGINE__ — 게임 (줄 7608)

## __MANRU_LIFECYCLE__ — 게임 (줄 5668)

## __MANRU_RUNTIME81__ — 게임+QA 섞임 (줄 12234)
- 게임: state(7), Automation81(3), Camera81(5), Zoom81(1), ConnectedDecor81(1), Integrity81(19), inspect(1), stopHeld(3)
- QA: config

## __MANRU_CAMERA_STATE12__ — 게임 (줄 15122)

## __MANRU_HAZARD_CORE__ — 게임+QA 섞임 (줄 16772)
- 게임: armFragile(4), collapseAt(2), kind(18), adapted(5), resolve(2), standing(2), revalidateAt(1), revalidateAll(2)
- QA: safeLand, nearestLand, audit

## __MANRU_CAMERA_PROJECTION12__ — 게임 (줄 15122)

## __MANRU_ITEM_IDENTITY991__ — 게임 (줄 15710)

## __MANRU_LEGEND47__ — 게임 (줄 20782)

## __MANRU_UX45_ACTIONS__ — 게임 (줄 7615)

## __MANRU_SAVE_SERVICE__ — 게임 (줄 16346)

## __MANRU_TURN_PIPELINE__ — 게임+QA 섞임 (줄 7609)
- 게임: register(12), abort(1)
- QA: active, stages, core

## __MANRU_ARCH1020__ — 게임+QA 섞임 (줄 18998)
- 게임: finalizeGeneration(1), ensureExitMarker(1), floor20Audit(2), componentAuditR41(2)
- QA: build, assets, audit, buildingAudit, crowdAudit, floor22PopulationR43, theme2Audit, decorAudit, library, actorGallery, samples, teleport, entities, keyPlan, special, apply, regen, mapData, openBoss, debug22, floor6AuditR8, buildingAudit1026, crowdingAudit1027, theme2Audit1027, decorParity, roomAudit1024, fovAuditR8, routeMetrics

## __MANRU_TYPED_KEYS__ — 게임+QA 섞임 (줄 13240)
- 게임: setMetaProvider(1), meta(1), hydrate(6), restoreSurfaces(2), pickupAt(2), tryOpenAt(2), summary(1)
- QA: keyAt, doorAt, snapshot

## __MANRU_V981_TEST__ — 게임+QA 섞임 (줄 14882)
- 게임: audit(4), reachCells(4), blinkChoiceReach21(3), repair21(2), raft(2)
- QA: version, regen, reach, portal, items, overview, raftSim, portalStep

## __MANRU_ACTOR_ART__ — 게임 (줄 19908)

## __MANRU_SFX54__ — 게임 (줄 8022,8085)

## __MANRU_CONSUMABLE56_ACTIONS__ — 게임 (줄 8376)

## __MANRU_TALISMAN74_ACTIONS__ — 게임 (줄 11589)

## __MANRU_DRAW_HOOKS_R19__ — 게임 (줄 8783)
- 게임: world(3), post(7)

## __MANRU_RUMOR_SPACES1030__ — 게임 (줄 18969)

## __MANRU_V49_TEST__ — 게임+QA 섞임 (줄 7857)
- 게임: paintTitleLights(1), camera(3), setMode(1), center(2)
- QA: scene, pan, perf, bench, classScroll, player, findMove, move, interactionAudit

## __MANRU_ITEM_ART_R7__ — 게임+QA 섞임 (줄 20336)
- 게임: dataItem(1), weaponAsset(2), pictureAsset(1), iconHtml(1), clear(1)
- QA: build, canvasItem, sprite, canvas, worldDraw, audit

## __MANRU_SPECIAL_FLOORS60__ — 게임 (줄 10225)

## __MANRU_STORY992__ — 게임+QA 섞임 (줄 15943)
- 게임: resume(1), close(1), closeScene(1), selectEnding(1), continueScene(1), project(1), open(2), ending(1)
- QA: version, docs, state, archive, collect, tick, prime, breakMask

## __MANRU_TERRAIN_R41__ — 게임 (줄 16948,18311)

## __MANRU_V1004__ — 게임+QA 섞임 (줄 16636)
- 게임: canvas(1), repairItems(3), clearArt(1)
- QA: version, actorBox, player, gearKey, saveAudit, forceSave, clearCurrent, lockAudit, repairLocks, keyGatePolicy

## __MANRU_V1005_TEST__ — 게임+QA 섞임 (줄 16893)
- 게임: regen(1), remodel(1), updateWardHud(1), initHazards(1)
- QA: version, stats, input, setHp, clearMonsters, tileAt, map, dims, metric, hazard, setStun, noAgency, landAt, rest, keyPlan, preKeyPlan, postRouteLock, advance, forceRelic, setPlayer, locate, pathTo, strictDoors

## __MANRU_LEGEND_TERRAIN47__ — 게임 (줄 20662)
- 게임: drawCell(3), miniColor(2), theme(2), clear(1)

## __MANRU_V96_TEST__ — 게임+QA 섞임 (줄 13441)
- 게임: lockAudit(15), ensureStrict(6), keyFloors(8), lockSurfaceAudit(2)
- QA: version, audit, regen, strictLockAudit, sampleStrict, typeIsolationAudit, panBench, interactionAudit, sampleLockSurface, sampleLockSurfaceFloor, stateCollections, edgeCameraAudit, textureStable

## __MANRU_SAVE1004__ — 게임 (줄 16376)

## __MANRU_V1004_ITEMFIX__ — 게임+QA 섞임 (줄 17049)
- 게임: normalize(1), pruneDoors(6)
- QA: build, keyMeta, audited, give, equip, keyView

## __MANRU_WORLD_HITTEST12__ — 게임 (줄 15122)

## __MANRU_AI61__ — 게임 (줄 10426)
- 게임: configure(3), special(1), artillery(1), intent(1)

## __MANRU_INSPECT984__ — 게임 (줄 15489)

## __MANRU_RUN_SEED984 — 게임 (줄 5626,15563,15567)

## __MANRU_TALISMAN_PUBLIC__ — 게임+QA 섞임 (줄 8227)
- 게임: known(1), name(2), seal(3), app(3)
- QA: generic, identifyTheme

## __MANRU_V1002__ — 게임+QA 섞임 (줄 16131)
- 게임: screen(3), setScreen(2)
- QA: sprite, actorBox, boot

## __MANRU_AMMO_ATTACK__ — 게임 (줄 13707)
- 게임: consume(1), prepare(1), finish(1)

## __MANRU_ASURA61__ — 게임+QA 섞임 (줄 10452)
- 게임: blocksDirect(4)
- QA: find, access, state, forceDomain, probe

## __MANRU_CLEAN_INSPECT53 — 게임+QA 섞임 (줄 7991)
- 게임: item(3)
- QA: stats

## __MANRU_GEN_RNG57__ — 게임 (줄 1035)

## __MANRU_MARTIAL_FX965__ — 게임 (줄 13511)

## __MANRU_POTION41_ACTIONS__ — 게임 (줄 7134)

## __MANRU_SKILL991_INPUT__ — 게임 (줄 15796)

## __MANRU_V1001__ — 게임+QA 섞임 (줄 16100)
- 게임: renderClasses(3), paintLighting(1)
- QA: startSprite, portrait

## __MANRU_V980_TEST__ — QA (줄 14550)
- QA: version, regen, audit, overview, lockValid, repairLocks, errors

## __MANRU_GENERATE_CORE983__ — 게임 (줄 15009)

## __MANRU_RUNTIME_START57__ — 게임 (줄 6425)

## __MANRU_V60_TEST__ — 게임+QA 섞임 (줄 10259)
- 게임: audit(2)
- QA: floor, stats, reveal, revealHidden, validate

## __MANRU_V984_SET_ZOOM__ — 게임 (줄 15123)

## __manruZoomActive — 게임 (줄 6706)

## __MANRU_ARTIFACT46__ — 게임 (줄 20782)

## __MANRU_BOSS54__ — 게임+QA 섞임 (줄 8111)
- 게임: draw(2)
- QA: marks, hydrate, core

## __MANRU_DEBUG__ — QA (줄 6692)
- QA: get[테스트], elementDamage61, tutorial60, presentation58, floor[테스트], inventory, close, settle, teleportFeature

## __MANRU_GEN991__ — 게임 (줄 15743)
- 게임: applyCurses(1), ensureHoly(1)

## __MANRU_POTION_ART_56__ — 게임 (줄 8286)
- 게임: iconHtml(1), worldDraw(1)

## __MANRU_RENDER47__ — 게임 (줄 7627)

## __MANRU_RESCUE_RELICS1005__ — QA (줄 16666)
- QA: drown, void

## __MANRU_RESUME_R6__ — 게임+QA 섞임 (줄 11109)
- 게임: schedule(2)
- QA: force, snapshot, version

## __MANRU_TERRAIN_CODEX986__ — 게임+QA 섞임 (줄 15527)
- 게임: openItem(2)
- QA: entries, missing, decorEntries, decorMissing, infoAt, inspectItem, probeUnidentified, inspectTerrain, sampleDecor, inspectSampleDecor, sampleMonster, inspectSampleMonster

## __MANRU_V52_TEST__ — 게임+QA 섞임 (줄 7942)
- 게임: aim(1), selectTerrain(1)
- QA: selectAt, selectJar, fire, inspectAt, screenOf, targetHp, setupBowTarget

## __MANRU_V95_TEST__ — 게임+QA 섞임 (줄 13010,13061)
- 게임: audit(1)
- QA: deathPreview, endingPreview, keyAudit, refreshPortraits

## __manruZoomSuppressUntil — 게임 (줄 6707,6709,15078)

## __MANRU_ACTOR_CACHE1011__ — 게임+QA 섞임 (줄 18201)
- 게임: clear(1)
- QA: size

## __MANRU_BELT62__ — 게임 (줄 10598)

## __MANRU_CAMERA984__ — 게임 (줄 15124)

## __MANRU_CLEAR_HI_CACHE__ — 게임 (줄 6730)

## __MANRU_CONTEXT_DOOR_HANDLER_R25__ — 게임 (줄 13491)

## __MANRU_DEATH_FX54__ — 게임 (줄 8021)

## __MANRU_DRAW_BASE58__ — 게임 (줄 8782)

## __MANRU_DRAW_ITEM_IMPL_R7__ — 게임 (줄 20331)

## __MANRU_F23_REVEAL_FORCE60 — 게임 (줄 )

## __MANRU_GENERATION_R18__ — QA (줄 19146)
- QA: generate, core, active, pipeline, stages, seed, signature

## __MANRU_HIDDEN60_ACTIONS__ — 게임 (줄 9152)

## __MANRU_ICON_HTML_IMPL_R7__ — 게임 (줄 20330)

## __MANRU_KEY_GUARD_R48__ — 게임+QA 섞임 (줄 20780)
- 게임: audit(1)
- QA: repair, stress, legendStress

## __MANRU_LIBRARY1022_ACTIONS__ — 게임 (줄 18084)

## __MANRU_PAUSE_RENDER61 — 게임 (줄 10771,10774)

## __MANRU_ROOM_GEOMETRY105__ — 게임 (줄 12818)

## __MANRU_TRANSIENT47__ — 게임 (줄 7626)

## __MANRU_V56_TEST__ — 게임+QA 섞임 (줄 8377)
- 게임: target(1)
- QA: start, grantPotion, grantTalisman, identify, knowledge, names, identifyTalisman, useTrue, cast, openBag, closeBag, setHP, player, castAtPlayer, setTab, seenCount, status, findSafe, spawnDummy, monsters, regen, grantLegacyScroll, saveLoad, serializeRoundTrip, roomRewards

## __MANRU_V94_TEST__ — QA (줄 13009)
- QA: version, audit, regen, keyState, spriteState

## __MANRU_ACTION_DISPATCHER__ — 전체 미사용 (줄 1735)

## __MANRU_ATTACK_PIPELINE_R25__ — 전체 미사용 (줄 3818)

## __MANRU_BOSS_REWARD55__ — QA (줄 3879)
- QA: stages, last, qaKill

## __MANRU_CLIENT_ENVIRONMENT__ — 전체 미사용 (줄 5602)

## __MANRU_COMBATANTS57__ — 전체 미사용 (줄 3819)

## __MANRU_DEBUG_BATTLE57__ — QA (줄 24357)

## __MANRU_DESKTOP_CLIENT__ — 전체 미사용 (줄 5602)

## __MANRU_DRAW_R19__ — QA (줄 16857)
- QA: draw, active, hooks

## __MANRU_GAME_STATE__ — 전체 미사용 (줄 5601)

## __MANRU_IDENTIFY991__ — QA (줄 15651)
- QA: one, all, unknown

## __MANRU_INIT_COMPLETE__ — 전체 미사용 (줄 24368)

## __MANRU_INPUT_DEBUG__ — QA (줄 7058)
- QA: inspectOpen, blocked, show, close, block, activeLongPresses

## __MANRU_INPUT_ROUTER__ — 전체 미사용 (줄 1825)

## __MANRU_INTERACT61__ — 전체 미사용 (줄 10438)

## __MANRU_INVENTORY_RENDER_R34__ — QA (줄 5445)
- QA: stages

## __MANRU_LAST_LIFECYCLE__ — QA (줄 5632)
- QA: kind, core, entered, aborted, abortStage

## __MANRU_MOBILE_CLIENT__ — 전체 미사용 (줄 5602)

## __MANRU_MOVE_HOOKS__ — 전체 미사용 (줄 1046)

## __MANRU_ORIENTATION_GATE__ — 전체 미사용 (줄 5602)

## __MANRU_PICKUP_PIPELINE_R25__ — 전체 미사용 (줄 5155)

## __MANRU_PLAYER_MATH55__ — QA (줄 1425)
- QA: stats, attack, move

## __MANRU_PRESENTATION_STATE12__ — 전체 미사용 (줄 15122)

## __MANRU_RESTAURANT42__ — QA (줄 18066)
- QA: eligible, target, variants, apply, restore, repairRewards, audit, diagnose, focus, forceVariant, remove

## __MANRU_RUNTIME_STATE__ — 전체 미사용 (줄 5601)

## __MANRU_TALISMAN_ART_56__ — QA (줄 8287)
- QA: iconHtml, worldDraw

## __MANRU_TURN_PIPELINE_FINAL__ — QA (줄 17042)
- QA: active, stages, core

## __MANRU_USE_HOLY991__ — 전체 미사용 (줄 15690)

## __MANRU_V1003__ — QA (줄 16200)
- QA: version, player, actorBox, item, itemKinds, sanitize, transient, forceBadTransient, permadeathAudit

