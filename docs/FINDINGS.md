# FINDINGS — 구조 정리 중 발견한 버그·기획 의문

구조 정리는 동작을 바꾸지 않는다. 아래 항목은 **고치지 않고 기록만** 했다. 예외로 고친 것은 "처리"에 적었다.
상태: `보존` = V40 동작을 그대로 유지, `수정` = 이번 작업에서 바뀜(사유 명시), `판단 필요` = 사용자 결정 대기.

| ID | 영역 | 내용 | 상태 |
|---|---|---|---|
| F-01 | 세이브·타이틀 | 브랜치(예: 2층 수로) 안에서 저장된 진행을 불러오면, 부팅 직후 `계속` 버튼이 비활성(`noSave`)으로 표시됐다. 원인: `RunLifecycle.refreshContinue()`가 부팅 중에만 불렸는데, 브랜치 세이브 검증이 읽는 `BRANCH_DEFS105`가 파일 뒤쪽 `const`라 그 시점에는 초기화 전이어서(`Cannot access … before initialization`) 검증이 거부했다. | **수정 → F-21로 대체**: 처음 수정은 부팅이 끝난 지점(`__MANRU_RUNTIME_START57__.start()` 뒤)에서 `계속` 버튼을 한 번 더 평가하는 것이었다(검증 로직은 그대로). 이것은 같은 판정의 두 번째 장치였다. F-21에서 원인(`BRANCH_DEFS105`가 판정보다 뒤에 선언됨)을 고치면서 이 재확인을 삭제했다. 지금은 로드 중 판정 하나가 결과를 정한다. |
| F-02 | 생성·부적 | 일반층 생성 경로(`10-runtime.js` V40 16046행)의 `try{biasItems94?.()}catch(_){}`는 다른 IIFE 구획 안의 지역 함수 `biasItems94`를 부른다. 그 이름이 보이지 않아 `ReferenceError`가 나고 빈 `catch`가 삼키므로, 이 경로의 아이템 편중 배치는 한 번도 실행되지 않았다. | **삭제 완료**: 닿지 않던 호출·분기를 지웠다(biasItems94 함수 자체는 다른 곳에서 쓰이므로 남는다). 동작 불변 확인: 삭제 직후 기준선 105개 항목이 V40과 동일했고, 층별 독립 생성(`floorsind`, 25개 층의 지도·아이템·몬스터·방)도 V40과 동일했다. |
| F-03 | 생성·문/창 | V40 16452행 `try{normalizeDoors86?.();sanitizeWindows88?.()}catch(_){ }`도 같은 이유로 실행되지 않는다. 문 정규화·창 정리가 이 시점에는 적용되지 않았다. | **삭제 완료**: 닿지 않던 호출·분기를 지웠다(normalizeDoors86·sanitizeWindows88 함수 자체는 다른 곳에서 쓰이므로 남는다). 동작 불변 확인: 삭제 직후 기준선 105개 항목이 V40과 동일했고, 층별 독립 생성(`floorsind`, 25개 층의 지도·아이템·몬스터·방)도 V40과 동일했다. |
| F-04 | 생성·잠금 | V40 16040행 `typeof validLockPlan96!=='function'||validLockPlan96()`는 함수가 보이지 않아 늘 `true`다. 이 경로에서는 잠금 계획 검증이 생략된다. | **삭제 완료**: 닿지 않던 호출·분기를 지웠다(validLockPlan96 함수 자체는 다른 곳에서 쓰이므로 남는다). 동작 불변 확인: 삭제 직후 기준선 105개 항목이 V40과 동일했고, 층별 독립 생성(`floorsind`, 25개 층의 지도·아이템·몬스터·방)도 V40과 동일했다. |
| F-05 | 감정·조사창 | V40 17625·17626행의 조사창은 `typeof sanitize56==='function'?sanitize56(text):text`로 미감정 물약·부적 이름을 가리려 하지만, `sanitize56`이 다른 구획의 지역 함수라 늘 원문을 쓴다. 미감정 아이템의 실제 이름이 조사창 본문·제목에 노출될 수 있다. | **삭제 완료**: 닿지 않던 호출·분기를 지웠다(sanitize56 함수 자체는 다른 곳에서 쓰이므로 남는다). 동작 불변 확인: 삭제 직후 기준선 105개 항목이 V40과 동일했고, 층별 독립 생성(`floorsind`, 25개 층의 지도·아이템·몬스터·방)도 V40과 동일했다. |
| F-06 | 복귀 렌더 | V40 12366·12367행(안드로이드 백그라운드 복귀 처리)의 `typeof P47!=='undefined'`, `typeof PERF49!=='undefined'`는 늘 거짓이다. 복귀 시 렌더 캐시 무효화가 일어나지 않는다. | **삭제 완료**: 닿지 않던 호출·분기를 지웠다(P47·PERF49 함수 자체는 다른 곳에서 쓰이므로 남는다). 동작 불변 확인: 삭제 직후 기준선 105개 항목이 V40과 동일했고, 층별 독립 생성(`floorsind`, 25개 층의 지도·아이템·몬스터·방)도 V40과 동일했다. |
| F-07 | 몬스터 그림 | 몬스터 스프라이트 분기(V40 20755행 `else if(/천수 아수라/.test(n))drawSpiritMonster1011(q,m,p,'angel')`)가 어디에도 정의되지 않은 `drawSpiritMonster1011`을 부른다. 이 분기를 타면 `ReferenceError`가 난다. | 보존 · 판단 필요 |
| F-08 | 화면 크기 | `window.addEventListener('resize',syncGameViewport)`가 초기화 시점의 **원래** `syncGameViewport`를 값으로 붙잡는다. 나중에 v4.9 구획이 `syncGameViewport`를 다시 정의해도 리스너는 바뀌지 않는다. 그래서 창 크기가 바뀔 때는 옛 동기화(DPR 최대 2, `ClientEnvironment.refresh('viewport')` 호출)가 돌고, 회전(`orientationchange`)·다른 호출에서는 새 동기화(모바일 DPR 1, 렌더 더티 플래그)가 돈다. 구조 정리에서는 옛 것을 `syncViewportOnWindowResize`라는 이름으로 남겨 두 동작을 그대로 보존했다. | 보존 · 판단 필요 |
| F-09 | QA 브리지 | 출시 코드에 QA·감사용 전역이 섞여 있었다. 이름이 아니라 "게임 코드가 읽는가"로 판정해(`docs/BRIDGES.md`) 게임이 읽는 멤버 약 40개는 직접 호출로 바꾸고, 나머지 QA 전용 코드(감사·샘플·스냅샷·진단 전역과 그것만 쓰는 함수)는 `src/qa/qa.js`로 옮겼다. 이 파일은 `npm run build:qa`(`dist-qa/`)에서만 런타임 클로저 끝의 표식 자리에 들어간다. 단일 HTML·앱에는 실리지 않는다. 디버그 전장 버튼과 `__MANRU_DEBUG__`·`__MANRU_DEBUG_BATTLE57__`은 개발 버전 기능이라 출시에도 남겼다. `qa.js`에는 지금 쓰이지 않는 옛 구현(예: `interact61`, 1011 스프라이트 갤러리)도 같이 들어갔다. 지울지는 별도 판단 사항이다. | 수정 |
| F-10 | 잠긴 문 열쇠 | 열쇠 정보 공급자 `typedKeyMeta96`는 처음에 `keyMeta96`이고, 초기화 중 `setMetaProvider(keyMeta1006)`로 바뀐다. 실제로는 늘 `keyMeta1006`이 쓰인다. 공급자 교체 구조라서 이번에는 그대로 두었다. | 보존 |
| F-11 | 개량 인장 | 개량 인장(`UPGRADE47`)은 강화부적으로 대체된 뒤에도 4·9·14·19·24층마다 1개씩 배치됐고, 배치 직후 다른 부적으로 바뀌어 의도하지 않은 부적이 추가로 깔렸다. 정의·배치·소모품 목록 등록을 삭제했다. 옛 세이브의 개량 인장·개량 표식을 강화부적으로 바꾸는 이주 코드와 그림은 세이브 호환을 위해 남겼다. 결과: 해당 층의 부적이 1개씩 줄어든다(사용자 허용 변경). | 수정 |
| F-12 | 도달성 감사 실패 처리 | 수리 루프의 도달성 감사(`mechanicalReachAudit`)가 예외를 던지면 "도달 불가 없음"으로 통과시키던 것을, **실패로 처리**하도록 고쳤다(사용자 결정). 오류를 `console.error`로 남기고 다시 던지면 층 생성 루프(최대 32회)가 그 층을 다시 만들고, 32회를 넘으면 "final connectivity/key progression rejected" 오류로 끝난다. 계측상 한 번도 던진 적이 없어 기존 경로의 동작은 같다(floors·floorsind 일치로 확인). | 수정 |
| F-13 | 버전 표기 덮어쓰기 | `RELEASE.build`, `document.title`, 하단 버전 표기가 로드 중 20여 번 덮어써지고 마지막 값(`10.0.6`, 창해 용궁)만 남는다. 빈 catch가 있던 3곳은 덮어써지는 죽은 코드라 삭제했고 나머지는 다음 정리에서 한 곳으로 모은다. | 부분 수정 |
| F-14 | F-09 회귀 (F1 설정 패널) | F-09 분리(`d9c3770`)가 `__MANRU_RELEASE__.openPanel`을 QA 쪽으로 잘못 옮겨, **출시 빌드에서 F1(설정 패널)이 열리지 않았다.** 입력 라우터가 `const api=globalThis.__MANRU_RELEASE__; api?.openPanel?.()`로 읽는데, 읽기 분석이 같은 이름 `api`를 쓰는 다른 별칭과 섞여 이 읽기를 놓쳤다. QA 빌드에서는 멤버가 있어서 기존 테스트가 통과했다. 수정: 함수와 멤버를 런타임으로 되돌리고(`openReleasePanel`), 재발 방지로 (1) 구조 검사에 `qaLeak` 지표(런타임이 QA 파일에만 있는 이름·멤버·브리지를 읽으면 실패, 별칭은 스코프 기준으로 해석)를 넣고, (2) `release` 시나리오가 F1·H 패널을 열고 닫는지 모든 출시 빌드에서 확인한다. `d9c3770`의 런타임은 새 시나리오에서 실패한다. | 수정 |

## F-15 의도(intent) 시스템이 두 벌 있다 (monsters.js)
`setIntent54`/`executeIntent54`(보스 장판 예고)와 `setIntent61`/`executeIntent61`(일반 몬스터 예고)이 비슷한 일을 하는 별개 구현이다. 구조 정리 중이라 합치지 않았다(동작 보존). 합칠 수 있는지, 일부러 둘로 나눈 것인지 기획 확인이 필요하다. 지금은 역할을 드러내는 이름(`setBossIntent`/`setMonsterIntent`)으로만 구분해 두었다.

## F-16 (해결) 동일 본문 지역 함수 3건: drawKit(q)로 통합 (render)
`r`/`rect`(`q.fillStyle=c;q.fillRect(...)`), `poly`/`polygon` 등은 각각 다른 그리기 함수 안에서 지역 `q`(캔버스 컨텍스트)를 닫아 쓰는 한 줄 도우미다. 본문은 같지만 서로 다른 `q`를 가리켜서 `merge-duplicates`가 거부한다. 합치려면 `q`를 인자로 받는 공용 함수로 만들고 호출처 수십 곳의 서명을 바꿔야 해서(래퍼를 새로 만들지 않는 원칙에 따라) 이번 이동에서는 하지 않았다. 필요하면 별도 작업으로 결정해 달라.

## F-17 스프라이트 크기 32×36 상수가 세 벌이다 (render)
`PLAYER_SPRITE_W/H`(플레이어), `HERO_SPRITE_W/H`(영웅, QA만 읽음), `ACTOR_CELL_W/H`(사용처 없음, 삭제함)가 모두 32×36이다. 같은 값을 따로 둔 이유는 확인되지 않는다. 합칠지(예: 한 상수) 기획·소유자 판단이 필요하다. 지금은 사용 중인 두 벌만 남겼다.

**처리(사용자 지시)**: render.js의 `drawKit(q)`가 `{r, poly}`(사각형·다각형 채우기)를 돌려준다. 같은 본문의 지역 도우미 31개(26개 선언문)를 `const {r,poly}=drawKit(q)` 형태로 바꿨고 호출처는 건드리지 않았다(`tools/refactor/draw-kit.mjs`; 컨텍스트가 대입되지 않는 const/param이고 도우미보다 먼저 선언된 경우만). sameBody 3 → 0.

## F-18 직업 초상화 함수가 두 벌이다 (ui)
`classPortrait95`(→`classPortraitCanvas`, 64px 캔버스에 직접 그림)와 `classPortrait1001`(→`classArtSpanHtml`, 스프라이트 시트를 잘라 쓰는 `<span>` HTML), `classPortraitHtml1001`이 함께 있다. 둘 다 호출처가 있어(`refreshClassPortraits95`와 직업 선택 화면) 지우지 않았다. 어느 쪽이 현재 화면에 쓰이는지, 한쪽이 폐기 후보인지 확인이 필요하다.

## F-19 불러오기 때 실행되지 않는 후처리 훅 6개의 실험 결과 (결정 필요)
초기화 때 `resetLoad`가 불러오기 단계 목록을 비워서, 코드에는 있지만 한 번도 실행되지 않는 `registerLoad` 6개가 있다(`docs/F10_DESIGN.md`). 이것들을 작업용 복사본에서 켜고(`resetLoad`의 목록 비우기만 제거) 켠 빌드와 현재 빌드의 불러오기 결과를 비교했다. 시나리오 `loadhooks`(`tests/scenarios.mjs`): 미감정 약병 3종·부적 3종과 바닥 약병을 가방에 넣고, 몬스터를 조준한 채 저장→불러오기, 그리고 훅이 만들어 주는 필드를 모두 지운 "stripped" 세이브, PC·모바일, 불러온 뒤 입력 60개를 더 재생. V40 세이브 4종은 기존 `saves` 시나리오로 비교했다. 현재 빌드는 두 번 돌려 결과가 같음(결정적)을 확인했다.

| 훅 | 켰을 때 달라진 것 | 판정 |
|---|---|---|
| `potions41` | 달라진 필드 없음 (`status.swift/fortify/willBoost`, `tempFields`를 지운 세이브도 결과 동일) | **삭제함** |
| `food57` | 달라진 필드 없음 (`cookbook57`, `status.*57`, `player.foodVital57`을 지운 세이브도 동일) | **삭제함** |
| `camera49` | 불러온 직후 `RENDER_PERF_STATE.dirty/panelDirty/miniDirty`가 false→true. 게임 상태·화면 문자열·60입력 뒤 상태는 같음 | 재그리기 표시만 다름. 삭제 vs 부활 결정 필요(화면은 `updateAll`과 렌더 루프가 어차피 그림) |
| `knowledge56` | 가방·바닥의 미감정 약병/부적에 `appearance56`(예: azure), `origin56`가 미리 붙고 `state.roomHints56={}`가 생김. V40 전설 던전 세이브의 바닥 약병 2개(items.0/1)에서도 같은 차이. **이름 가림은 켜든 끄든 같음**: 가방 이름 목록·`publicName`(회청색 약병, 미확인 부적…)·인벤토리 화면 텍스트·바닥 약병 이름 모두 동일 | 상태 필드만 다름(지연 장식과 같은 값으로 채움). 게임 동작은 같아 보임. 삭제 vs 부활 결정 필요 |
| `monster-config61` | 불러온 몬스터의 `guardHome57`이 채워짐(예: 객잔 쥐 {x:54,y:25,room}). 60입력 뒤에도 같은 차이. **새 층에서 막 생성된 몬스터는 `guardHome57`이 없다**(저장 전에도 undefined) | 켜면 불러온 경비 몬스터만 "집으로 복귀/순찰 범위" 규칙(`monsterPatrolAllows`, 줄 558 등)을 받게 되어 새 게임과 달라진다. 지금 동작(훅 없음)이 새 게임과 같다. **동작이 바뀌는 사안: 결정 필요(삭제 권장)** |
| `aim52` | 불러오기 전에 조준 중이던 대상(`AIM_STATE.target`)이 불러온 뒤에도 남음(현재). 켜면 불러오기 직전에 비워짐 | **실제 버그로 보임**: 다른 런/세이브의 몬스터 객체를 가리키는 조준 대상이 남는다. 안: 훅을 되살리지 않고 불러오기 본체(`loadGameCore`)에서 `AIM_STATE.target=null; AIM_STATE.jar=null; state._manualTerrainTargetR8=null`을 직접 한다. 동작 변화(버그 수정)이므로 결정 후 처리 |

질문: (1) `monster-config61`: 삭제(현재 동작 유지, 불러온 몬스터도 새 게임과 같게)로 갈까요? (2) `knowledge56`, `camera49`: 삭제로 갈까요? (3) `aim52`: 위 안(불러오기 본체에서 직접 초기화)을 동작 변경 커밋으로 진행할까요?

**결정(사용자, 2026-10-11)**: `monster-config61`, `knowledge56`, `camera49`의 불러오기 쪽 등록은 삭제한다(현재 동작 유지). 그 훅만 쓰던 `normalizeAsuraAttack`(참조 0)도 삭제했다. `aim52`는 훅을 되살리지 않고 불러오기 본체에서 직접 초기화하는 동작 변경 커밋으로 처리한다(아래 F-20).

## F-20 (버그 수정, 동작 변경) 불러온 뒤에도 이전 조준 대상이 남던 문제
증상: 몬스터나 병 투척 칸을 조준한 채 불러오기를 하면 `AIM_STATE.target`/`jar`(이전 런의 몬스터 객체 또는 칸)가 불러온 뒤에도 남았다. 원인: 조준을 비우던 `registerLoad('aim52')` 훅이 `resetLoad`가 단계 목록을 비워서 한 번도 실행되지 않았다(F-10, F-19). 수정(사용자 결정): 훅을 되살리지 않고 불러오기 본체 `loadGameCore`가 `restoreState(st)` 성공 직후 `AIM_STATE.target=null; AIM_STATE.jar=null; state._manualTerrainTargetR8=null`을 직접 한다. 확인: `loadhooks` 시나리오에 몬스터 조준과 투척 칸 조준(`aim`, `aimjar`) 불러오기를 넣었고, 수정 전 빌드와 수정 후 빌드를 같은 시나리오로 비교하면 달라지는 것은 이 두 키뿐이다(상태·가방·60입력 뒤 상태는 동일). 기준선 변경은 의도한 것이다(`loadhooks.*.aim`: 대상이 남음→null, `aimjar` 추가).

## F-21 (수정, 동작 변경) 분기 세이브가 있으면 부팅 중 이어하기 판정이 TDZ 오류로 실패했다
계측(`tools/refactor/load-reads.mjs`: spine.js의 const/let/class 362개의 모든 읽기를 탐침으로 바꾸고 빈 저장소, `?debug=1`, 모바일, V40 세이브 4종으로 부팅): 클로저 로드 중 선언 전에 읽히는(TDZ) 값은 `BRANCH_DEFS105` 하나뿐이었고, `branch.json` 세이브로 부팅할 때만 2회 일어났다. 경로: 로드 중 느슨한 문장의 `RunLifecycle.refreshContinue()` → `SaveService.recover()` → `candidate1004` → `RunLifecycle.accepts` → `GameState.migrate` → `branchPruneWorld` → `branchRetentionFloor` → `branchRootFloor`가 아직 선언되지 않은 `BRANCH_DEFS105`를 읽어 `ReferenceError`. `accepts`의 catch가 잡아 `console.warn('[manru] saved run cannot be continued')`를 남기고 판정은 false가 됐다.

**F-01과의 관계**: F-01의 증상(분기 세이브인데 부팅 직후 `계속`이 비활성)이 바로 이 TDZ 때문이었다. F-01은 원인을 그대로 두고 부팅 끝에 판정을 한 번 더 하는 장치를 붙여 결과만 맞췄다. 같은 판정이 두 곳에서 정해지는 구조라 F-21에서 원인을 고치고 그 장치를 지웠다.

**수정(사용자 결정 (1), 2026-10-11)**: `BRANCH_DEFS105`를 branches.js(spine.js보다 앞)로 옮겼다. start.js의 부팅 끝 재확인(`__MANRU_LIFECYCLE__.refreshContinue()`)을 같은 커밋에서 삭제했다. 결과: 로드 중 판정이 분기 세이브도 받아들이고 경고가 사라졌다. 부수 효과: 분기 세이브로 부팅하면 로드 중 판정이 이주(`migrate`)를 끝까지 실행하므로, 다른 세이브(진행·전설)처럼 로드 끝에 지형 레이어 캐시(`TERRAIN_LAYER_CACHE58`)가 이미 만들어져 있다(수정 전에는 null; `3bce75f`와 `224e0c0` 빌드의 로드 끝 값 비교로 확인). 고친 뒤 다시 계측하면 spine.js 값 283개 중 TDZ 읽기는 0이다(TDZ 뒤 건너뛰던 같은 경로의 읽기도 포함). 테스트: `saves` 시나리오가 부팅 중 `계속` 클래스 변화와 콘솔 경고를 기록하고(`saves.*.boot`), 거부 경고가 있으면 실패한다. 수정 전 빌드는 `the branch save was rejected during boot`로, 재확인만 지우고 상수를 안 옮긴 빌드는 `continue button for the branch save is disabled at boot`로 실패한다.

## F-22 (결정 필요) 세이브 서비스가 공개되기 전에 이어하기 판정이 세 번 불린다
F-21 테스트를 만들다 확인했다. 로드 중 `refreshContinue`는 네 번 불린다(spine.js의 느슨한 문장 두 곳과 설정 패널 초기화의 `refreshContinueStatus`, 그리고 세이브 서비스를 공개하는 구획 안의 호출). 앞의 세 번은 `globalThis.__MANRU_SAVE_SERVICE__`가 아직 공개되기 전이라 `recover()`가 `undefined`이고, 세이브 종류와 상관없이 `계속`에 `noSave`를 붙인다. 네 번째(세이브 서비스 공개 뒤)가 실제 판정이다. V40도 같다. 화면에는 부팅이 끝난 뒤의 결과만 보이므로 사용자에게 보이는 차이는 없다. 선택지: (1) 앞의 세 호출을 지운다(같은 판정의 무의미한 사전 호출), (2) 그대로 둔다. 그 세 호출은 `continueBtn.onclick`도 설정하지만 네 번째 호출이 같은 값으로 다시 설정한다.

## F-23 (회귀 수정) 이전 분할 커밋 3개가 V40 값 세 개를 바꿔 놓았다
모든 최상위 값의 로드 끝 값을 분할 전 빌드(`12a8032^`)와 비교해서 찾았다(`tools/refactor/load-reads.mjs --snapshot`, 이름은 `docs/NAMING.tsv`로 대응; 4,284개 비교). 셋 다 move-to에 "객체 채우기(T)" 검사가 생기기 전의 분할에서 생겼다. 선언이 자기가 담는 값을 채우는 문장보다 앞으로 옮겨진 경우다.
- `RECIPE`(부적 융합표, items 분할 `b87a1fd`): `RECIPES`를 채우는 `addFusionRecipe(...)` 호출들보다 먼저 만들어져 **빈 Map**이 됐다. 그 사이 빌드에서는 부적 융합 화면(`fuse74`, `compatible74`)이 맞는 짝을 하나도 찾지 못했다. 이 경우는 T 검사도 못 잡는다(채우기가 함수 호출 안의 `push`).
- `ASURA_HAZ`(monsters 분할 `c2a2e8e`): `TT.CRUMBLE=42` 할당보다 앞으로 가서 42 대신 `undefined`를 담았다. 이 값을 읽는 곳은 QA 코드(`qa.js`의 `asuraSafeLand61`)뿐이라 출시 게임 동작에는 영향이 없었다.
- `CITADEL_PROP_TILES`(render 분할 `75ce46e`): `Object.assign(TT,{STONE_PILLAR:44,…})`보다 앞으로 가서 소품 타일 ID 21개가 `undefined`였다. 흑성채 소품 그리기(`CITADEL_PROP_TILES[prop]`)가 그 소품들의 타일을 찾지 못했다.
수정: 세 선언을 각자 채우기 문장 바로 뒤(spine.js)로 되돌렸다. 되돌린 뒤 분할 전 빌드와 다른 값은 의도한 둘뿐이다(`RunLifecycle` 구조, F-21의 `TERRAIN_LAYER_CACHE58`). 재발 방지: `values` 시나리오가 빈 저장소와 분기 세이브로 부팅해 클로저의 모든 최상위 값(614개)을 로드 끝에 직렬화하고 기준선과 비교한다(`tools/lib/load-probe.mjs`). 수정 전 빌드에서는 위 세 값이 다르게 나온다.

## F-24 (결정 필요) V40부터 있던, 할당 전 타일 ID를 담는 집합 두 개
같은 계산(로드 중 `TT.X`를 읽는데 `X`가 더 뒤에서 할당됨)에서 V40 원래 순서에서도 그런 값이 둘 있다. 지금 동작은 V40과 같다.
- `TEMP_TERRAIN_IMMUTABLE57`: `TT.PORTAL`(68, 뒤의 `Object.assign(TT,{PORTAL:68})`에서 할당)을 담으려 했지만 `undefined`가 들어 있다. 임시 지형 변경에서 포탈이 보호되지 않는다.
- `RUNTIME_ENTRY_REACTIVE57`: `TT.CRUMBLE`과 `TT.PORTAL`이 아직 없어서 `filter(Number.isFinite)`로 빠진다. 진입 반응 지형에 무너지는 바닥과 포탈이 없다.
선택지: (1) 의도대로 고친다(할당을 kernel의 `TT` 정의로 옮기면 두 집합이 값을 담게 된다; 동작 변경 커밋), (2) 그대로 둔다.
