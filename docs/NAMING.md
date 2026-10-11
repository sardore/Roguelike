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
