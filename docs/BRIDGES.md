# 공개 전역(브리지) 판정표

`node tools/refactor/bridge-report.mjs --md`가 만든다. 멤버가 게임 코드·별칭을 통해 읽히는지, 테스트가 읽는지로 가른다.

- **게임**: 런타임 안 어디선가 읽는다 (감사 함수가 생성 검증에 쓰이는 경우 포함).
- **테스트**: 테스트만 읽는다.
- **미사용**: 코드도 테스트도 읽지 않는다. 콘솔에서 손으로 부르는 용도일 수 있다.

## __MANRU_RANDOM57__ — 게임 사용 (줄 1036)

## __MANRU_RELEASE__ — 게임 사용 (줄 11011)
- 게임: build(24), closePanel(1), markAction(1), tip(2), floorTutorial(1), closeTip(1), suspendTip(2), entryTutorial(2), audit(2), save(2), load(1), invalid(1), autosave(1)
- 테스트: snapshot, regen
- 미사용: bench, slotLoad, diagonal, pacing, stress, resetTips, openPanel, storage, screen, hit, camera

## __MANRU_TURN_ENGINE__ — 게임 사용 (줄 7608)

## __MANRU_LIFECYCLE__ — 게임 사용 (줄 5668)

## __MANRU_RUNTIME81__ — 게임 사용 (줄 12234)
- 게임: state(7), Automation81(3), Camera81(5), Zoom81(1), ConnectedDecor81(1), Integrity81(19), inspect(1), stopHeld(3)
- 미사용: config

## __MANRU_CAMERA_STATE12__ — 게임 사용 (줄 15122)

## __MANRU_HAZARD_CORE__ — 게임 사용 (줄 16772)
- 게임: armFragile(4), collapseAt(2), kind(18), adapted(5), resolve(2), standing(2), revalidateAt(1), revalidateAll(2)
- 미사용: safeLand, nearestLand, audit

## __MANRU_CAMERA_PROJECTION12__ — 게임 사용 (줄 15122)

## __MANRU_ITEM_IDENTITY991__ — 게임 사용 (줄 15710)

## __MANRU_LEGEND47__ — 게임 사용 (줄 20782)

## __MANRU_UX45_ACTIONS__ — 게임 사용 (줄 7615)

## __MANRU_SAVE_SERVICE__ — 게임 사용 (줄 16346)

## __MANRU_TURN_PIPELINE__ — 게임 사용 (줄 7609)
- 게임: active(1), stages(1), core(1), register(12), abort(1)

## __MANRU_ARCH1020__ — 게임 사용 (줄 18998)
- 게임: finalizeGeneration(1), ensureExitMarker(1), floor20Audit(2), floor6AuditR8(1), buildingAudit1026(1), crowdingAudit1027(1), theme2Audit1027(1), decorParity(1), componentAuditR41(2), roomAudit1024(2), fovAuditR8(1), routeMetrics(1)
- 미사용: build, assets, audit, buildingAudit, crowdAudit, floor22PopulationR43, theme2Audit, decorAudit, library, actorGallery, samples, teleport, entities, keyPlan, special, apply, regen, mapData, openBoss, debug22

## __MANRU_TYPED_KEYS__ — 게임 사용 (줄 13240)
- 게임: setMetaProvider(1), meta(1), hydrate(6), restoreSurfaces(2), pickupAt(2), tryOpenAt(2), summary(1)
- 미사용: keyAt, doorAt, snapshot

## __MANRU_V981_TEST__ — 게임 사용 (줄 14882)
- 게임: audit(4), reachCells(4), blinkChoiceReach21(3), repair21(2), raft(2)
- 미사용: version, regen, reach, portal, items, overview, raftSim, portalStep

## __MANRU_ACTOR_ART__ — 게임 사용 (줄 19908)

## __MANRU_SFX54__ — 게임 사용 (줄 8022,8085)

## __MANRU_CONSUMABLE56_ACTIONS__ — 게임 사용 (줄 8376)

## __MANRU_TALISMAN74_ACTIONS__ — 게임 사용 (줄 11589)

## __MANRU_DRAW_HOOKS_R19__ — 게임 사용 (줄 8783)
- 게임: world(3), post(7)

## __MANRU_RUMOR_SPACES1030__ — 게임 사용 (줄 18969)

## __MANRU_V49_TEST__ — 게임 사용 (줄 7857)
- 게임: paintTitleLights(1), camera(3), setMode(1), center(2), player(1)
- 미사용: scene, pan, perf, bench, classScroll, findMove, move, interactionAudit

## __MANRU_ITEM_ART_R7__ — 게임 사용 (줄 20336)
- 게임: dataItem(1), weaponAsset(2), pictureAsset(1), sprite(3), iconHtml(1), clear(1)
- 미사용: build, canvasItem, canvas, worldDraw, audit

## __MANRU_SPECIAL_FLOORS60__ — 게임 사용 (줄 10225)

## __MANRU_STORY992__ — 게임 사용 (줄 15943)
- 게임: resume(1), close(1), closeScene(1), selectEnding(1), continueScene(1), project(1), open(2), ending(1)
- 미사용: version, docs, state, archive, collect, tick, prime, breakMask

## __MANRU_TERRAIN_R41__ — 게임 사용 (줄 16948,18311)

## __MANRU_V1004__ — 게임 사용 (줄 16636)
- 게임: canvas(1), repairItems(3), clearArt(1), lockAudit(1), repairLocks(1), keyGatePolicy(1)
- 미사용: version, actorBox, player, gearKey, saveAudit, forceSave, clearCurrent

## __MANRU_V1005_TEST__ — 게임 사용 (줄 16893)
- 게임: hazard(4), keyPlan(1), regen(1), remodel(1), updateWardHud(1), initHazards(1)
- 미사용: version, stats, input, setHp, clearMonsters, tileAt, map, dims, metric, setStun, noAgency, landAt, rest, preKeyPlan, postRouteLock, advance, forceRelic, setPlayer, locate, pathTo, strictDoors

## __MANRU_LEGEND_TERRAIN47__ — 게임 사용 (줄 20662)
- 게임: drawCell(3), miniColor(2), theme(2), clear(1)

## __MANRU_V96_TEST__ — 게임 사용 (줄 13441)
- 게임: lockAudit(15), ensureStrict(6), keyFloors(8), lockSurfaceAudit(2)
- 미사용: version, audit, regen, strictLockAudit, sampleStrict, typeIsolationAudit, panBench, interactionAudit, sampleLockSurface, sampleLockSurfaceFloor, stateCollections, edgeCameraAudit, textureStable

## __MANRU_SAVE1004__ — 게임 사용 (줄 16376)

## __MANRU_V1004_ITEMFIX__ — 게임 사용 (줄 17049)
- 게임: normalize(1), pruneDoors(6)
- 미사용: build, keyMeta, audited, give, equip, keyView

## __MANRU_WORLD_HITTEST12__ — 게임 사용 (줄 15122)

## __MANRU_AI61__ — 게임 사용 (줄 10426)
- 게임: configure(3), special(1), artillery(1), intent(1)

## __MANRU_INSPECT984__ — 게임 사용 (줄 15489)

## __MANRU_RUN_SEED984 — 게임 사용 (줄 5626,15563,15567)

## __MANRU_TALISMAN_PUBLIC__ — 게임 사용 (줄 8227)
- 게임: known(1), name(2), seal(3), app(3)
- 미사용: generic, identifyTheme

## __MANRU_V1002__ — 게임 사용 (줄 16131)
- 게임: screen(3), setScreen(2)
- 미사용: sprite, actorBox, boot

## __MANRU_AMMO_ATTACK__ — 게임 사용 (줄 13707)
- 게임: consume(1), prepare(1), finish(1)

## __MANRU_ASURA61__ — 게임 사용 (줄 10452)
- 게임: blocksDirect(4)
- 미사용: find, access, state, forceDomain, probe

## __MANRU_CLEAN_INSPECT53 — 게임 사용 (줄 7991)
- 게임: item(3)
- 미사용: stats

## __MANRU_GEN_RNG57__ — 게임 사용 (줄 1035)

## __MANRU_MARTIAL_FX965__ — 게임 사용 (줄 13511)

## __MANRU_POTION41_ACTIONS__ — 게임 사용 (줄 7134)

## __MANRU_SKILL991_INPUT__ — 게임 사용 (줄 15796)

## __MANRU_V1001__ — 게임 사용 (줄 16100)
- 게임: renderClasses(3), paintLighting(1)
- 미사용: startSprite, portrait

## __MANRU_V980_TEST__ — 게임 사용 (줄 14550)
- 게임: version(1), overview(2)
- 미사용: regen, audit, lockValid, repairLocks, errors

## __MANRU_GENERATE_CORE983__ — 게임 사용 (줄 15009)

## __MANRU_RUNTIME_START57__ — 게임 사용 (줄 6425)

## __MANRU_V60_TEST__ — 게임 사용 (줄 10259)
- 게임: stats(1), audit(2)
- 미사용: floor, reveal, revealHidden, validate

## __MANRU_V984_SET_ZOOM__ — 게임 사용 (줄 15123)

## __manruZoomActive — 게임 사용 (줄 6706)

## __MANRU_ARTIFACT46__ — 게임 사용 (줄 20782)

## __MANRU_BOSS54__ — 게임 사용 (줄 8111)
- 게임: draw(2)
- 미사용: marks, hydrate, core

## __MANRU_DEBUG__ — 게임 사용 (줄 6692)
- 게임: teleportFeature(1)
- 테스트: get, floor
- 미사용: elementDamage61, tutorial60, presentation58, inventory, close, settle

## __MANRU_GEN991__ — 게임 사용 (줄 15743)
- 게임: applyCurses(1), ensureHoly(1)

## __MANRU_POTION_ART_56__ — 게임 사용 (줄 8286)
- 게임: iconHtml(1), worldDraw(1)

## __MANRU_RENDER47__ — 게임 사용 (줄 7627)

## __MANRU_RESCUE_RELICS1005__ — 게임 사용 (줄 16666)
- 미사용: drown, void

## __MANRU_RESUME_R6__ — 게임 사용 (줄 11109)
- 게임: schedule(2)
- 미사용: force, snapshot, version

## __MANRU_TERRAIN_CODEX986__ — 게임 사용 (줄 15527)
- 게임: openItem(2)
- 미사용: entries, missing, decorEntries, decorMissing, infoAt, inspectItem, probeUnidentified, inspectTerrain, sampleDecor, inspectSampleDecor, sampleMonster, inspectSampleMonster

## __MANRU_V52_TEST__ — 게임 사용 (줄 7942)
- 게임: aim(1), selectTerrain(1)
- 미사용: selectAt, selectJar, fire, inspectAt, screenOf, targetHp, setupBowTarget

## __MANRU_V95_TEST__ — 게임 사용 (줄 13010,13061)
- 게임: audit(1)
- 미사용: deathPreview, endingPreview, keyAudit, refreshPortraits

## __manruZoomSuppressUntil — 게임 사용 (줄 6707,6709,15078)

## __MANRU_ACTOR_CACHE1011__ — 게임 사용 (줄 18201)
- 게임: clear(1)
- 미사용: size

## __MANRU_BELT62__ — 게임 사용 (줄 10598)

## __MANRU_CAMERA984__ — 게임 사용 (줄 15124)

## __MANRU_CLEAR_HI_CACHE__ — 게임 사용 (줄 6730)

## __MANRU_CONTEXT_DOOR_HANDLER_R25__ — 게임 사용 (줄 13491)

## __MANRU_DEATH_FX54__ — 게임 사용 (줄 8021)

## __MANRU_DRAW_BASE58__ — 게임 사용 (줄 8782)

## __MANRU_DRAW_ITEM_IMPL_R7__ — 게임 사용 (줄 20331)

## __MANRU_F23_REVEAL_FORCE60 — 게임 사용 (줄 )

## __MANRU_GENERATION_R18__ — 게임 사용 (줄 19146)
- 게임: generate(1)
- 미사용: core, active, pipeline, stages, seed, signature

## __MANRU_HIDDEN60_ACTIONS__ — 게임 사용 (줄 9152)

## __MANRU_ICON_HTML_IMPL_R7__ — 게임 사용 (줄 20330)

## __MANRU_KEY_GUARD_R48__ — 게임 사용 (줄 20780)
- 게임: audit(1)
- 미사용: repair, stress, legendStress

## __MANRU_LIBRARY1022_ACTIONS__ — 게임 사용 (줄 18084)

## __MANRU_PAUSE_RENDER61 — 게임 사용 (줄 10771,10774)

## __MANRU_ROOM_GEOMETRY105__ — 게임 사용 (줄 12818)

## __MANRU_TRANSIENT47__ — 게임 사용 (줄 7626)

## __MANRU_V56_TEST__ — 게임 사용 (줄 8377)
- 게임: target(1)
- 미사용: start, grantPotion, grantTalisman, identify, knowledge, names, identifyTalisman, useTrue, cast, openBag, closeBag, setHP, player, castAtPlayer, setTab, seenCount, status, findSafe, spawnDummy, monsters, regen, grantLegacyScroll, saveLoad, serializeRoundTrip, roomRewards

## __MANRU_V94_TEST__ — 게임 사용 (줄 13009)
- 미사용: version, audit, regen, keyState, spriteState

## __MANRU_ACTION_DISPATCHER__ — 전체 미사용 (줄 1735)

## __MANRU_ATTACK_PIPELINE_R25__ — 전체 미사용 (줄 3818)

## __MANRU_BOSS_REWARD55__ — 전체 미사용 (줄 3879)
- 미사용: stages, last, qaKill

## __MANRU_CLIENT_ENVIRONMENT__ — 전체 미사용 (줄 5602)

## __MANRU_COMBATANTS57__ — 전체 미사용 (줄 3819)

## __MANRU_DEBUG_BATTLE57__ — 테스트 전용 (줄 24357)

## __MANRU_DESKTOP_CLIENT__ — 전체 미사용 (줄 5602)

## __MANRU_DRAW_R19__ — 전체 미사용 (줄 16857)
- 미사용: draw, active, hooks

## __MANRU_GAME_STATE__ — 전체 미사용 (줄 5601)

## __MANRU_IDENTIFY991__ — 전체 미사용 (줄 15651)
- 미사용: one, all, unknown

## __MANRU_INIT_COMPLETE__ — 전체 미사용 (줄 24368)

## __MANRU_INPUT_DEBUG__ — 전체 미사용 (줄 7058)
- 미사용: inspectOpen, blocked, show, close, block, activeLongPresses

## __MANRU_INPUT_ROUTER__ — 전체 미사용 (줄 1825)

## __MANRU_INTERACT61__ — 전체 미사용 (줄 10438)

## __MANRU_INVENTORY_RENDER_R34__ — 전체 미사용 (줄 5445)
- 미사용: stages

## __MANRU_LAST_LIFECYCLE__ — 전체 미사용 (줄 5632)
- 미사용: kind, core, entered, aborted, abortStage

## __MANRU_MOBILE_CLIENT__ — 전체 미사용 (줄 5602)

## __MANRU_MOVE_HOOKS__ — 전체 미사용 (줄 1046)

## __MANRU_ORIENTATION_GATE__ — 전체 미사용 (줄 5602)

## __MANRU_PICKUP_PIPELINE_R25__ — 전체 미사용 (줄 5155)

## __MANRU_PLAYER_MATH55__ — 전체 미사용 (줄 1425)
- 미사용: stats, attack, move

## __MANRU_PRESENTATION_STATE12__ — 전체 미사용 (줄 15122)

## __MANRU_RESTAURANT42__ — 전체 미사용 (줄 18066)
- 미사용: eligible, target, variants, apply, restore, repairRewards, audit, diagnose, focus, forceVariant, remove

## __MANRU_RUNTIME_STATE__ — 전체 미사용 (줄 5601)

## __MANRU_TALISMAN_ART_56__ — 전체 미사용 (줄 8287)
- 미사용: iconHtml, worldDraw

## __MANRU_TURN_PIPELINE_FINAL__ — 전체 미사용 (줄 17042)
- 미사용: active, stages, core

## __MANRU_USE_HOLY991__ — 전체 미사용 (줄 15690)

## __MANRU_V1003__ — 전체 미사용 (줄 16200)
- 미사용: version, player, actorBox, item, itemKinds, sanitize, transient, forceBadTransient, permadeathAudit

