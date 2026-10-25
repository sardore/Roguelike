# P4~P8 설계안: spine.js에 남은 부팅 문장 정리 (구현 전, 승인 대기)

작성 2026-10-19, 병합된 main(`6361948`, P3 포함) 기준. 코드는 바꾸지 않았다. 숫자는 `tools/game.mjs assemble`한 작업 파일을 AST로 센 것이다. "측정 필요"는 아직 재지 않았다.

## 1. 지금 남은 것

| 구분 | 개수 | 비고 |
|---|---:|---|
| 최상위 선언 | 131 | 함수 54, 함수가 아닌 선언(`const`/`let`/`class`) 77 |
| 느슨한 문장 | 485 | 712줄. 선언이 아닌 문장: 대입, 호출, `if`, 리스너 등록 |
| spine.js 줄 수 | 5,629 | 전체 26,282줄의 21% |

P3로 풀린 선언 22개는 별도 이동 체인(브랜치 `claude/boot-p5-p8`, "P5: move … freed by P3 into …" 커밋들)이 도메인으로 옮기고 있다. 그 뒤 남는 선언은 109개다.

### 1.1 느슨한 문장 485개의 종류 (줄 수 순)
| 종류 | 문장 | 줄 | 예 |
|---|---:|---:|---|
| 객체 속성 대입 `obj.x=` | 109 | 123 | `VIS.hoverPath=null`, `V85.x=...`, `RuntimeState.x=...`, `document.title=...` |
| 전역 공개 `window.X=` / `globalThis.X=` | 66 | 110 | `globalThis.__MANRU_GEN_RNG57__=Object.freeze({...})` |
| 메서드 호출 (등록 호출 포함) | 66 | 75 | `PresentationState.register(...)` 외 |
| DOM 조립 `if(...){ createElement … }` | 25 | 72 | 모바일 자동 버튼 등 |
| 변수 초기화 대입 | 7 | 68 | `updateMobileHud=function updateMobileHudCanonical55(){…}` 등: 값 없이 선언한 `let`의 단 한 번의 대입 (8절) |
| `addEventListener` | 34 | 43 | `window.addEventListener('blur', …)` |
| `registerGenerationStage` | 31 | 31 | 도메인 내부 등록 API |
| `registerPlayerAttackStageR` / `registerMonsterAttackStageR25` / `registerMinimapHook` / `setGenerationBase` 등 | 약 20 | 약 40 | 도메인 내부 등록 API |
| `ActionDispatcher.register` | 29 | (위 메서드 호출에 포함) | 도메인 내부 등록 API |
| `globalThis.__MANRU_TURN_PIPELINE__.register` | 12 | 19 | |
| `try` / `for…of` / 기타 | 약 40 | 약 60 | 햅틱 설정 읽기, 이벤트 종류 반복 등 |

## 2. 왜 `move-to`로는 더 못 옮기나
`move-to`는 **선언**만 옮기고, 로드 중 읽는 값의 순서를 지킨다. 남은 것은 세 가지 이유로 막혀 있다.
1. **DOM을 만드는 선언 7개**(P5): `const panel=document.createElement(...)`처럼 앞선 문장이 `document`를 바꾼 뒤에 만들어져야 한다. 같은 `document.body`에 붙는 순서가 DOM 순서(테스트가 745개 요소의 순서를 본다)를 정한다.
2. **전역을 읽는 초기화식 5개**(P6), **순서가 걸린 5개**(P7), **채워지는 객체 3개**(P8): 값을 만드는 문장(공개 문장, 채우기 문장)이 spine.js의 특정 자리에 있고, 선언이 그 문장 뒤에 와야 한다.
3. **느슨한 문장 자체**는 선언이 아니라서 `move-to`의 대상이 아니다. 문장을 도메인으로 옮기면 실행 시점이 바뀐다.

## 3. 접근: 같은 순서를 유지하는 부팅 함수
원칙: **실행 순서를 바꾸지 않는다.** spine.js의 문장들을 순서대로 읽어, 같은 도메인에 속하는 연속된 문장 묶음을 그 도메인 파일의 이름 있는 초기화 함수로 옮기고, spine.js(결국 `boot.js`)에는 그 함수들을 **원래 순서대로 호출하는 목록**만 남긴다. 호출 순서 = 옛 문장 순서이므로 이벤트 리스너 등록 순서 지문(`input.listeners.*`), DOM 순서, `values`가 그대로 지킨다.

측정(합성 분석, 구현 전): 각 문장을 가장 많이 참조하는 도메인으로 분류하고, 함수가 아닌 선언(77개)에서 끊으면 **연속 묶음 250개**가 나온다(ui 35, render 44, items 20, save 26, mapgen 27, combat 13, monsters 11, branches 5, input 7, 기타 소수, 도메인 불명 52). 이대로 250개 함수를 만들면 호출 목록이 250줄이 되어 "한 곳에서 부팅 순서를 읽는다"는 이점이 줄어든다. 그래서 단계를 둔다.

### 3.1 단계 A — 규칙적인 패턴을 표/선언으로 (P3와 같은 방법, 약 150개 문장)
- **등록 호출 105개**(`registerGenerationStage` 31, `ActionDispatcher.register` 29, `TURN_PIPELINE.register` 12, 공격 단계 11, `patchDef` 10, 미니맵 3, 기타): P3에서 만든 방식(표 선언의 배열 리터럴 + 이름 있는 함수)으로 바꾼다. **이번 P3 승인 범위에서는 제외했던 것**이므로 포함 여부를 정해야 한다(§7-1).
- **객체 속성 대입 109개**: 같은 객체의 선언 리터럴에 접어 넣을 수 있는 것(`VIS.x=null` 등, 앞뒤에서 그 객체를 읽지 않는 것)은 선언으로 옮긴다. 접을 수 없는 것(`document.*`, 읽기 사이에 낀 것)은 남긴다. **측정 필요**: 문장마다 "선언과 대입 사이에 그 객체를 읽는 문장이 있는지"를 AST로 센다(P3-0과 같은 종류의 측정).
- **전역 공개 66개**(`globalThis.__MANRU_*__=`): `docs/BRIDGES.md`의 다리 목록과 같은 것이다. 값을 만드는 도메인의 정의 바로 옆으로 옮긴다. P6의 5개(`POTION_LIST`, `V56`, `BASE_KIND74`, `legacyPotionIcon`/`legacyPotionDraw`)가 여기서 풀린다: 그 선언들은 `window.MANRU_POTIONS`(spine.js:1470), `window.MANRU_TALISMANS`(1931), `window.__MANRU_CLEAN_INSPECT53`(1842), `globalThis.__MANRU_POTION_ART_56__`(1972)가 공개된 **뒤**여야 하므로 "공개 문장 + 읽는 선언"을 한 묶음으로 같은 파일의 같은 순서로 옮긴다.

### 3.2 단계 B — 남은 부팅 문장을 도메인별 초기화 함수로 (P4 본체, P5)
- DOM 조립(25 `if` + 부착 문장), 리스너 등록 34, 햅틱 읽기 등은 도메인 파일의 초기화 함수(`buildPanels`, `bindWindowListeners` 등)로 만들고 boot.js가 **원래 위치에서** 호출한다. P5의 7개 요소(`feelEl`, `panel`, `coach`, `modal`, `skillQuick`, `classDetail1001`/`classStart1001`, `hud`)는 "만들기 + 붙이기"가 한 함수가 되고, 호출 위치가 옛 문장 위치와 같아 DOM 순서가 유지된다. 요소를 가리키는 변수(`panel` 등)는 초기화 함수가 채우는 `let` 선언이 된다.
- P7의 `RuntimeState`(231줄, `INPUT`을 로드 시 읽음), `Auto81`, `strictKeyFloors1004`, `POTION_BY_KIND`는 순서가 선언 위치를 고정한다. 읽는 값(`INPUT`, `LOCK_SPECIAL`, `POTION_LIST`)이 먼저 옮겨지면 `move-to`가 받아 준다. 그래서 순서는 P6 → P7이다.
- P8의 `V964`, `V981`, `BRANCH_INTERACTIVE_OVERLAYS105`는 객체를 채우는 문장(`V85.*`, `V980.*`, `TT.LEGEND_*`)이 앞에 있어서 막혀 있다. 채우는 문장을 객체 선언 쪽으로 접으면(단계 A의 속성 대입 접기) 풀린다.

### 3.3 마무리
선언과 느슨한 문장이 모두 도메인으로 간 뒤에는 spine.js에 호출 목록만 남는다. 이름을 `boot.js`로 바꾼다(`manifest.json`). 이 개명은 마지막 커밋 하나로, 내용 변경 없이.

## 4. 순서 제안
1. (진행 중) P3로 풀린 선언 22개를 도메인별로 이동 — 8커밋.
2. P4-0: 측정과 테스트 보강(코드 이동 없음): 객체 속성 대입의 접기 가능 여부, 전역 공개 문장의 읽는 쪽, DOM 조립 문장의 앞뒤 읽기. **리스너 등록 순서 지문과 DOM 순서 비교가 이미 있어** 새 테스트는 최소로 한다(등록 호출 표 순서 해시 — P3의 `stages`를 일반화).
3. 단계 A: 전역 공개 + P6 → P7 → P8(작은 것부터), 속성 대입 접기, 등록 호출 표(승인 시).
4. 단계 B: 부팅 함수 + P5.
5. 개명(`boot.js`).
각 커밋은 P3와 같은 게이트(check, test 전체, 값 비교, 해당하면 stages/consumers)를 통과해야 푸시하고, differ가 생기면 멈춰서 보고한다.

## 5. 위험
1. **실행 순서**: 문장 하나를 함수로 감싸 호출하면 그 안의 `const`/`let`/`function`의 범위가 바뀐다. 문장이 만드는 지역 이름을 다른 문장이 쓰면 깨진다. 구현 시 도구가 "묶음 안에서 만든 이름이 묶음 밖에서 쓰이는지"를 검사해야 한다(`move-to`가 이미 쓰는 분석을 재사용).
2. **DOM 순서·리스너 순서**: 같은 위치에서 호출해야 한다. 기존 지문(`input.listeners`, 745개 요소 순서, `uiactions`, `screens`)이 지킨다.
3. **함수가 아닌 선언 77개가 묶음을 쪼갠다**: 77개 모두 도메인으로 갈 수 있는 것은 아니다(P5~P8 20개 + `TYPED_KEYS96` 1개 외에는 이번 측정에서 읽는 순서가 막은 것이 없다). 호출 목록이 길어지면 읽기 부담이 늘어난다.
4. **동작 변화 금지**: 구조 정리 커밋에서 발견한 버그나 기획 의문은 고치지 않고 `docs/FINDINGS.md`에 적는다.

## 6. 롤백
커밋 하나가 묶음 하나다. 문제가 생기면 그 커밋만 `git revert`한다. 시작 전에 이전 단계의 main을 태그 대신 브랜치 `boot-base`로 남긴다(태그 푸시는 이 환경에서 막혀 있다).

## 7. 결정이 필요한 것
1. 도메인 안에 이미 있는 등록 API(생성 단계 31, 디스패처 29, 턴 파이프라인 12, 공격 단계 11, `patchDef` 10, 기타)도 P3처럼 표로 합칠지. 제안: 합친다. 그러면 느슨한 문장이 약 100개 줄고, 남는 부팅 문장이 훨씬 읽기 쉽다. 반대로 범위를 줄이려면 P4~P8만 하고 이 표는 나중에 한다.
2. 부팅 함수 방식(§3)을 승인하는지, 아니면 spine.js를 지금 구조 그대로 `boot.js`로 개명하고 문장 485개는 "순서가 곧 동작인 부팅 문장"으로 문서화하는 데서 멈출지. 제안: 단계 A까지는 진행하고, 단계 B는 단계 A 결과(남는 문장 수)를 보고 다시 정한다.
3. P5(DOM 요소 7개): 요소 변수를 `let` + 초기화 함수로 바꾸는 방식을 승인하는지.

## 8. 확인한 의문 (문제 아님, 기록)
느슨한 문장 중 "변수 재대입" 7문장(`updateMobileHud=function …`, `updatePanels=…`, `inventoryFiltered=…`, `visualLoop=…`, `buildNormal=…` 등)은 덮어쓰기가 아니라 **앞서 값 없이 선언한 `let`의 단 한 번의 초기화**다. 5개 변수를 확인했다: 선언 1개, 대입 1개씩(`let updateMobileHud;` → 줄 1769에서 한 번 대입). 정의된 값을 감싸거나 바꾸는 것이 아니므로 `rebind` 지표 대상도 AGENTS.md의 덧씌우기 금지 대상도 아니다. 다만 이 5개는 "선언 위치와 값을 주는 위치가 떨어져 있다"는 점에서 단계 B의 초기화 함수 후보다. 나머지 2문장은 같은 모양이다(전부 확인하지는 않았다).

## 9. P5 DOM 변수: 두 방식 비교 (2026-10-19) — 방식 A로 구현함(2026-10-23, 사용자 승인), 결과는 맨 아래
대상: `feelEl`, `panel`, `coach`, `modal`, `skillQuick`, `classDetail1001`+`classStart1001`(한 선언), `hud`. 모두 `const x=document.createElement(...)`로 만들어진 직후 같은 자리에서 `.id=`, `.innerHTML=`, `setAttribute`, `appendChild`, `.onclick=` 문장이 설정·부착한다.

| 변수 | 함수 안에서 읽는 곳 | 로드 시 읽는 문장 | 사용 파일 |
|---|---:|---:|---|
| feelEl | 3 | 2 | ui, spine |
| panel | 3 | 5 | ui, spine |
| coach | 13 | 7 | ui, spine, save |
| modal | 9 | 5 | ui, spine |
| skillQuick | 6 | 2 | ui, spine |
| classDetail1001 / classStart1001 | 4 / 1 | 0 / 1 | ui, spine |
| hud | 5 | 3 | ui, spine |
| 합계 | 44 | 25 | |

`load-reads`(7개 부팅 상황): TDZ 0. 로드 시 읽는 문장은 전부 위 설정·부착 문장이다.

| 항목 | A: `let` + 초기화 함수 | B: 초기화 함수가 요소를 돌려줌(`const` 유지) |
|---|---|---|
| spine 선언 | −7 | 0 |
| spine 느슨한 문장 | −18 (설정 25 → 호출 7) | −25 |
| 읽는 곳 44개 | 그대로 | 그대로 |
| 실패 모드 | 초기화 전 읽기가 TDZ 오류 대신 `undefined`(현재 경로는 TDZ 0이라 동일) | `const` TDZ 보호 유지 |
| 재대입 | 가능(`let`) | 불가 |
| 부팅 함수화와의 관계 | spine에서 선언이 빠져 `boot.js`로 바꿀 수 있음 | spine에 `const` 7개가 남음 |
제안: spine을 비우는 것이 목표면 A. 단 TDZ 보호가 사라지므로 초기화 직후 각 변수가 `undefined`가 아님을 확인하는 테스트를 같이 넣는다. 승인 전에는 구현하지 않는다.

### P5 결과 (2026-10-23, 방식 A, 브랜치 `claude/p5-dom-vars`)
요소별 한 커밋(7개), 게이트(`npm run check`, `npm test` 전체 4벌, 옛/새 빌드의 로드 직후 값 비교 differ 0)를 통과한 뒤 푸시했다.

| 변수 | 초기화 함수(ui.js 끝, `let`과 함께) | spine에 남은 것 |
|---|---|---|
| feelEl | `createFeelingElement` (문장 3개) | 호출 1 |
| panel | `createReleasePanel` (문장 4개) | 호출 1 + `addEventListener` 2개(자리 유지) |
| coach | `createCoachDialog` (문장 8개) | 호출 1 |
| modal | `createChoiceModal` (문장 6개) | 호출 1 |
| skillQuick | `createSkillQuickPanel` (문장 3개) | 호출 1 |
| classDetail1001, classStart1001 | `bindClassPickerElements` (조회 2개 + `classStart1001.onclick`) | 호출 1 |
| hud | `createWardHud` (문장 4개) | 호출 1 |

- 지표: spine 선언 81 → 74, 느슨한 문장 312 → 296, spine 5,092 → 5,077줄. 비교표의 −18보다 2 적다: `panel`의 `addEventListener` 2개는 입력 시나리오의 리스너 등록 순서 지문 때문에 원래 자리에 두었다.
- `classDetail1001`/`classStart1001`은 만드는 것이 아니라 index.html의 요소를 id로 찾는 것이라 조회만 호출로 바꾸면 선언이 느슨한 문장으로 바뀌어 `spineLooseStatements`가 늘어(게이트가 막음) `classStart1001.onclick`(두 문장 아래, 사이에는 상관없는 `classGrid` 리스너뿐)을 함수로 가져갔다. onclick은 속성 대입이라 리스너 지문에 들어가지 않고, 핸들러는 클릭될 때만 평가된다.
- 상실한 TDZ 보호의 대체: `domvars` 시나리오(`tests/scenarios.mjs`, `__MANRU_QA_DOMVARS__`)가 4개 부팅 상황(빈 저장소, `?debug=1`, 모바일, 분기 세이브)에서 8개 변수가 각자의 요소를 담고 연결되어 있으며 부모가 같음을 본다. 기준선은 변환 전 코드에서 만들었고 변환 뒤에도 그대로다.
- `values` 기준선은 바뀌지 않았다(`const`→`let`이어도 로드 직후 값이 같다).

