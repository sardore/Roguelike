# P3 설계안: 등록 API와 단계 표를 하나로 합치기 (구현 전, 승인 대기)

작성 2026-10-12. 코드는 바꾸지 않았다. 아래 숫자는 `src/game/*.js`를 grep으로 센 것이고, "측정 필요"로 표시한 것은 아직 재지 않았다.

## 1. 지금 구조

`spine.js`에는 단계 표 9개와 그 표에 항목을 넣는 `register*` 함수 9개가 있다. 표를 읽는 쪽은 도메인 파일에 있고, 넣는 쪽(등록 호출)은 spine.js의 부팅 구획 곳곳에 흩어져 있다.

| 표 | 선언 위치 | 등록 함수(spine) | 등록 호출 수 | 읽는 곳 |
|---|---|---|---:|---|
| `MOVE_HOOKS_R8` pre/post | mapgen.js | `registerMovePreR8`/`PostR8` | 6 + 6 | 이동 처리 |
| `PLAYER_STAT_STAGES55` | spine.js | `registerPlayerStatStage55` | 6 | `getStats`(combat) |
| `ATTACK_COST_STAGES55` | spine.js | `registerAttackCostStage55` | 5 | `attackTurnCost`(combat) |
| `MOVE_COST_STAGES55` | spine.js | `registerMoveCostStage55` | 5 | `moveTurnCost`(monsters) |
| `BOSS_REWARD_STAGES` pre/post | monsters.js | `registerBossRewardStage55` | 2 | 보스 보상 |
| `MANRU_PICKUP_PIPELINE_R25` | world.js | `registerPickupStageR25` | 5 | 줍기 |
| `INVENTORY_RENDER_R34` core/pre/post | items.js | `registerInventoryRenderR34` | 11 | 인벤토리 그리기 |
| `PANEL_HOOKS54` | spine.js | `registerPanelHook54` | 6 | `runPanelHooks`(ui) |
| `RUN_END_EFFECTS53`, `DESCEND_EFFECTS53` | save.js / spine.js | (직접 `push`) | 2 + (측정 필요) | 런 종료·하강 |

합계 등록 호출 약 54개(9개 함수 기준 표 위 숫자의 합) + 직접 `push`. 도메인 안에 이미 있는 `registerGenerationStage`(32), `registerPlayerAttackStageR`(9), `registerMonsterAttackStageR25`(4), `registerMinimapHook`(4)는 P3 범위에서 뺀다(등록 함수와 호출이 이미 같은 도메인 쪽에 있고 spine에 선언이 남지 않음). 범위를 넓힐지는 결정 사항이다(§7).

별개 문제: `RECIPE`(부적 융합표). `RECIPES`와 `addFusionRecipe`는 items.js, 호출 41개와 `RECIPE = new Map(RECIPES.map(...))`는 spine.js에 있다.

## 2. 무엇이 바뀌는가

### 2.1 단계 표 (9개)
각 표마다 소유 도메인에 **순서대로 적은 배열 하나**를 둔다. 등록 함수와 `register*` 호출 문장, 중복 id 검사용 코드는 지운다.

```js
// 예: combat.js
const PLAYER_STAT_STAGES = [
  { id: 'class-body-power58', run: classBodyPowerStats },
  { id: 'potions41',          run: potionStats },
  ...지금의 등록 순서 그대로
];
```

- 단계 본문은 이름 있는 함수가 된다(지금은 호출 인자로 들어간 익명 화살표). 이름은 `docs/NAMING.md`에 근거와 함께 기록한다.
- 배열의 순서 = 지금의 등록(= 실행) 순서. 순서는 spine.js의 호출 문장이 실행되는 순서이므로, 그 순서를 코드에서 뽑아 고정한다.
- 읽는 쪽(`getStats` 등)은 바뀌지 않는다.
- 효과: spine.js의 느슨한 문장 약 54개 + `push` 문장이 사라지고, 표 선언 5~7개(spine에 선언된 것)가 소유 도메인으로 간다. 각 표의 순서를 한 곳에서 읽을 수 있다.

### 2.2 RECIPE
- 41개 `addFusionRecipe(...)` 호출을 `const FUSION_RECIPES = [ {a,b,...}, ... ]` **배열 리터럴 하나**로 바꾼다(items.js, `RECIPES`가 있던 자리). 쌍 순서는 지금 호출 순서 그대로.
- 바로 아래에 `const RECIPE = new Map(FUSION_RECIPES.map(r => [key74(r.a, r.b), r]))`를 둔다. 채우는 문장과 만드는 문장이 한 선언이 되므로 "호출들 뒤에 만들어져야 한다"는 순서 제약이 없어진다. `move-to`가 초기화식을 읽을 수 있어 F-23의 사각(함수 호출 안의 `push`로 채워지는 객체)이 구조적으로 사라진다.
- `addFusionRecipe`, `RECIPES` 변수는 삭제한다. 사용처 `shopCandidates`는 `FUSION_RECIPES`를 읽는다.
- 사전 확인: 41쌍은 `key74`(정렬해 `+`로 합침)로 보면 중복이 없다(grep으로 확인). 그래서 `Map` 생성의 "뒤 것이 앞 것을 덮음"이 일어나지 않는다.

## 3. 위험

1. **순서 변경(가장 큰 위험).** 표 안의 순서가 바뀌면 결과가 바뀐다(특히 스탯·비용 단계는 곱셈·`clamp`가 섞여 순서에 민감하다). 배열을 손으로 옮기다 두 줄이 바뀌어도 값 스냅샷은 같을 수 있다.
2. **단계 본문이 지역 변수를 잡고 있음(측정 필요).** 일부 등록 호출은 들여쓴 블록 안에 있고, 같은 블록의 지역 변수를 쓰는 것으로 보인다. 그런 단계는 소유 도메인으로 끌어올리면 변수가 안 보인다. 이 경우 변수까지 함께 옮기거나(P4와 얽힘) 그 단계는 P4 뒤로 미룬다. 계획에서 **첫 작업으로 이 의존을 재서** 단계별로 "끌어올림 가능/불가"를 표로 만든다.
3. **익명 함수 구분 불가.** 지금 `values` 스냅샷은 함수를 이름으로만 적는다(익명은 `<fn ?>`). 표에 `{id, run}`처럼 id가 있으면 id 순서는 잡히지만, `MOVE_HOOKS_R8`처럼 **맨 함수만 있는 표**와 함수 본문 교체는 못 잡는다. 검증을 강화하지 않고 옮기면 사고가 난다(§5).
4. **중복·교체 의미 차이.** `registerInventoryRenderR34`는 같은 id를 다시 등록하면 **제자리 교체**하고, `core`는 단일 슬롯이다. 다른 등록 함수는 중복 id에서 예외를 던진다. 배열로 바꾸면 이 의미가 없어지므로, 실제로 같은 id가 두 번 등록되는지 측정하고(측정 필요) 있으면 마지막 것만 남기는 동작을 그대로 옮긴다.
5. **로드 중 호출.** 등록 호출 사이에 낀 다른 부팅 문장이 표를 읽으면(로드 중 `getStats` 호출 등) 배열 도입으로 읽는 시점의 내용이 달라질 수 있다. `load-reads`로 로드 중 읽힘을 재서 확인한다(측정 필요).
6. **저장·세이브.** 표는 런타임 전용이라 세이브 형식·키는 건드리지 않는다. 단, 단계가 `state` 필드를 쓰므로 단계 누락은 세이브 로드 후 값 차이로 나타난다 — `saves`·`saveload`가 본다.

## 4. 롤백
- 표 하나가 커밋 하나다. 문제가 생기면 그 커밋만 `git revert`한다(표끼리 독립이므로 다른 표에 영향 없음).
- 시작 전에 브랜치 `p3-base`를 현재 머리에 만들어 두어 전체 되돌림 기준으로 쓴다.
- 구조 지표는 한 방향(줄기만)이므로, revert 뒤에는 기준선을 올릴 수 없다. 그래서 커밋마다 기준선을 낮추지 않고 P3 끝에 한 번 낮춘다(P1·P2와 같은 방식). revert는 기준선 커밋 전이면 지표 영향이 없다.

## 5. 검증 — 이번 RECIPE 회귀를 어떻게 잡을 것인가

F-23의 원인: `RECIPE`가 채워지기 전에 만들어져 빈 `Map`이 됐고, 그 사이 빌드는 값 스냅샷이 없어 몰랐다. 지금은 `values`가 `RECIPE`를 담고 `features.fusion`이 41쌍 전부를 확인한다. P3에서 더 막는 것:

1. **P3-0 (테스트만, 코드 이동 전).** `values`·`features`에 아래를 더하고 기준선을 한 번 갱신한다(의도된 변경으로 커밋 메시지에 적음).
   - 단계 표마다 **순서가 있는 목록**을 스냅샷한다: 각 항목의 `id`, 그리고 함수는 **`toString()`의 해시**(익명 함수와 맨 함수 배열도 구분). `load-probe.mjs`의 직렬화에 함수 본문 해시를 더한다(`<fn name:hash>`).
   - `FUSION_RECIPES`의 길이·순서·`RECIPE` 키 목록(정렬 아님).
   - `features`: 표마다 "실제로 불리는 경로"를 하나씩 — 스탯(`getStats`) 값, 공격·이동 비용 값, 이동 훅이 이동을 막는 경우, 패널 훅이 실제 호출됨, 줍기 단계, 인벤토리 그리기 결과. 직업별 새 게임 후 같은 입력 재생에서 이 값들이 이전 빌드와 같아야 한다.
2. **각 커밋 전 비교.** 이전 커밋 빌드와 새 빌드의 로드 끝 스냅샷을 7개 부팅 상황(빈 저장소, `?debug=1`, 모바일, V40 세이브 4종)에서 비교한다. 지금과 같다(`values` + 임시 비교). 목표: differ 0. 함수 해시가 바뀌는 것은 단계 본문을 이름 있는 함수로 옮길 때뿐이고, 본문 **공백 제외 문자열**이 같음을 별도로 비교한다(F-10에서 쓴 방식).
3. **표 안 순서 검사 도구.** `tools/refactor/`에 `stage-order.mjs`를 두어 변경 전 spine.js의 `register*` 호출을 파일 순서로 뽑고, 변경 후 배열 순서와 일치하는지 대조한다. 손으로 옮긴 순서 오류를 막는다.
4. **RECIPE 한정.** 새 `FUSION_RECIPES`·`RECIPE`의 항목을 이전 빌드의 `RECIPES`·`RECIPE`와 JSON으로 완전 비교(순서 포함). `features.fusion`(41쌍 전부 제시됨)과 `shopCandidates` 결과 비교.
5. **이미 있는 안전망.** `npm run check`(재대입·래핑·중복 선언 증가 금지), `npm test` 전체(QA 254 + release 3), 입력·리스너 등록 순서 지문(`input`), 화면 비교(`screens`).

## 6. 진행 순서 제안 (승인 후)
1. P3-0: 측정(지역 변수 의존, 중복 id, 로드 중 읽힘, 순서 목록) + 테스트 강화. 코드 이동 없음. 결과를 이 문서에 기록하고 다시 보고한다. 끌어올릴 수 없는 단계가 많으면 범위를 줄인다.
2. P3-1: RECIPE(가장 작고 회귀 이력이 있다).
3. P3-2: `RUN_END_EFFECTS53`/`DESCEND_EFFECTS53`/`BOSS_REWARD_STAGES`(항목 수 적음).
4. P3-3~: 비용·스탯 단계 3개, 패널 훅, 줍기, 이동 훅, 인벤토리 그리기(항목 수와 본문 의존 큰 순).
5. 마지막에 기준선 하향과 `SPINE_RESIDUE` 갱신. 각 커밋은 check·test 전체·values 비교 통과 후 푸시.

## 7. 결정이 필요한 것
1. 도메인 안에 이미 있는 등록 함수(생성 단계 32, 플레이어 공격 9, 몬스터 공격 4, 미니맵 4)도 같은 방식으로 합칠지, 이번에는 spine 소유분(9개 표)만 할지. 제안: spine 소유분만.
2. 단계 본문이 블록 지역 변수를 잡고 있는 경우: 변수와 함께 옮길지, 그 단계는 P4(부팅 구획)로 미룰지. 제안: P3-0 측정 뒤 미룸 목록을 정하고 함께 보고.
3. 이름 규칙: 표 이름의 버전 접미사(`55`, `R34` 등)를 이번에 역할명으로 바꿀지. 제안: 표를 옮기는 커밋에서 같이 바꾸고 `NAMING.md`에 기록(AGENTS.md의 접미사 금지 방향과 일치).

## 8. 승인 조건 (사용자, 2026-10-12)
- 범위는 §1 표의 spine 소유분 9개 표만. 도메인 안의 등록 함수 4종(생성 단계, 플레이어 공격, 몬스터 공격, 미니맵)은 이번에 건드리지 않는다.
- 지역 변수를 잡은 단계는 P3-0 측정 뒤 미룸 목록을 만들어 코드 이동 전에 먼저 보고한다.
- 접미사 개명은 이동 커밋과 분리한 별도 커밋(rename-batch 사용). 이동 커밋에서는 단계 본문 해시가 완전히 같아야 한다.
- P3-0에 표마다 id 중복 금지 테스트를 추가한다(지금 `register*`의 중복 예외를 대체). 인벤토리 그리기의 같은 id 재등록 여부는 측정해 보고한다.
- 순서: PR #27(P1·P2)이 사용자 병합으로 main에 들어간 뒤, 병합된 main에서 새 브랜치를 따서 P3-0부터. P3-0 끝에 측정 결과(지역 변수 의존, 중복 id, 로드 중 읽힘)를 보고하고, 코드 이동은 P3-1 RECIPE부터 한 표씩. 각 커밋은 check, test 전체, values 비교 통과 후 푸시.

## 9. P3-0 결과 (2026-10-12, 코드 이동 없음)

### 9.1 추가한 것
- `tools/refactor/stage-report.mjs`: 9개 표(+ `RUN_END_EFFECTS53`, `DESCEND_EFFECTS53` 직접 `push`)의 쓰기 지점을 소스 순서대로 뽑고, 각 단계 함수가 둘러싼 함수/블록의 지역 변수를 잡는지, 중첩 위치, 같은 id 중복, 화살표 안의 `this`/`arguments` 사용을 센다. 잡는 변수 판정은 합성 입력으로 검증했다(블록 지역 변수, 함수 지역 변수는 잡히고 최상위 변수는 안 잡힘).
- QA 브리지 `__MANRU_QA_STAGES__`(`src/qa/qa.js`, 출시 빌드에는 들어가지 않음)와 시나리오 `stages`: 표마다 단계를 실행 순서대로 `phase, id, 함수 해시`로 기록한다. 해시는 매개변수와 본문(`stageBody`: 이름·공백·화살표/함수 선언 차이를 무시, `()=>X`와 `function f(){return X}`는 같음)에서 만든다. **표마다 id 중복 금지 검사**가 여기 있다(이전 `register*`의 중복 예외를 대체; 중복이면 시나리오가 실패).
- `features.stages`: 실제 소비 함수 경로. 15개 사전 설정(상태 효과, 배고픔, 원소 방어, 저주 4종 등)에서 `getStats`, `attackTurnCost`(일반/뇌속성), `moveTurnCost` 값을 기록한다. 패널 훅과 인벤토리 그리기는 그 뒤 페이지의 다이제스트가 반복해도 같은지 확인하고, 하강 효과는 예외 없이 도는지 확인한다.
- 기준선: 새 키 13개만 추가(`stages.*` 12개, `features.stages`). 기존 254개 키는 그대로. 전체 `npm test` QA 267개 통과.

### 9.2 한계 (모의 실험으로 확인)
- food57·elements74의 공격 비용 단계 순서를 바꾸면 `stages.attackCost`가 바뀐다. 이동 훅 두 개의 순서를 바꾸면 `stages.moveHooks`가 바뀐다. 두 경우 모두 `features.stages` 값은 안 바뀐다(해당 단계의 `clamp`가 이 사전 설정에서는 교환 가능). 즉 **순서 오류는 `stages.*`의 id·해시 순서가 잡고, `features.stages`는 소비 경로 전체(표가 비거나 값이 달라지는 경우)를 잡는 보조**다.
- 패널 훅·인벤토리 그리기·하강 효과의 경로 검사는 "반복 가능, 예외 없음" 수준이다(순서에 민감하지 않음). 보스 보상·줍기·이동 훅은 소비 경로 검사를 넣지 못했다(진행 중인 전투·줍기 상황이 필요). 이 표들은 `stages.*`의 순서·본문 해시와 기존 `walk`·`input`·`battle` 시나리오에 의존한다.

### 9.3 측정 결과
1. **지역 변수 의존: 없음.** 등록 47개(함수 9종 43개 + 직접 `push` 4개) 모두 클로저 최상위에 있고(들여쓰기는 `flatten-sections` 이전의 흔적일 뿐, 중첩 블록은 0), 단계 함수 47개 모두 둘러싼 함수/블록의 지역 변수를 잡지 않는다. 화살표 안의 `this`/`arguments` 사용도 0. **미룸 목록은 비어 있다.**
2. **id 중복: 없음.** 정적(리터럴 id)과 실행 시 목록 모두 중복이 없다. `registerInventoryRenderR34`의 같은 id 재등록 경로(제자리 교체)는 한 번도 일어나지 않고, `core`는 한 번만 등록된다(`ux45-core`). 따라서 배열로 바꿀 때 교체 의미를 옮길 필요가 없다. 인벤토리 표는 core 1 + pre 1 + post 8 = 10.
3. **로드 중 읽힘: 등록 자체뿐.** 10개 표 모두 로드 중 읽는 곳은 등록 호출(`register*`의 중복 검사 `some`, 직접 `push`)이며 tdz 0이다(`load-reads`, 7개 부팅 상황). 읽는 소비 함수(`getStats` 등)는 로드 중 불리지 않는다.
4. **표별 항목 수:** moveHooks 10(pre 5/post 5), playerStats 5, attackCost 4, moveCost 4, bossReward 1(pre), pickup 4, inventoryRender 10, panelHooks 5(그중 3개는 이미 최상위 함수 `updateCH`, `updateDesktopSide962`, `refreshDoorContext`), runEnd 2, descend 2.
5. **실행 순서 성질(옮길 때 지킬 것):** 이동 훅 `pre`는 **뒤에서 앞으로** 실행되고 첫 `false`에서 멈춘다. 줍기 `pre`도 뒤에서 앞으로, `post`는 앞에서 뒤로. 비용·스탯 단계는 등록 순서대로 앞의 결과를 받는다(곱하고 `clamp`). 배열로 바꿔도 읽는 쪽 코드는 그대로이므로 이 성질은 배열 순서만 지키면 유지된다.
6. `MANRU_PICKUP_PIPELINE_R25.handlers`는 이 9개 등록 함수가 채우는 목록이 아니고 P3 범위 밖이다(범위: 승인 조건 1).

### 9.4 단계 본문을 어디에 둘 것인가
배열은 표 소유 도메인에 두고, 단계 함수는 **함수 선언**으로 만든다(함수 선언은 클로저 시작 시점에 호이스팅되므로 배열 리터럴이 로드 중 읽어도 안전하다; `const` 화살표는 불가). 단계 함수의 위치는 다루는 기능의 도메인(food57 → items 등)이며, 이동 커밋에서는 먼저 spine.js의 같은 자리에 함수 선언으로 만들고 배열을 소유 도메인에 두는 두 단계로 나눌지 한 커밋에서 할지는 첫 표(P3-1 RECIPE 다음 P3-2)에서 정해 보고한다.

## 10. 진행 결과 (2026-10-12)
- 브랜치 `claude/p3-stage-tables`. P3-0(측정·테스트) → P3-1 RECIPE(`FUSION_RECIPES` 리터럴 + `RECIPE` Map) → 하강·런 종료·스탯·공격 비용·이동 비용·패널 훅·인벤토리 그리기·보스 보상·줍기·이동 훅 표 변환 → 접미사 개명(별도 커밋). 모든 표 변환은 `stages` 해시(순서·id·매개변수+본문)가 기준선 그대로인 채로 통과했다. 이동 훅·줍기·보스 보상은 변환 전에 `consumers` 시나리오(실제 이동·줍기·보스 처치)를 추가했고, 그 기준선이 변환 후에도 그대로다.
- 등록 함수 9종(`register*`)과 직접 `push` 문장이 모두 사라졌다. 새 단계 함수 46개(접미사 없는 이름)가 소유 도메인에 있다.
- spine.js: 5781 → 5629줄, 선언 146 → 131, 느슨한 문장 573 → 485. `suffixFunction` 755 → 744, `sameBody` 0.
- 정정: 런 종료 표 첫 커밋(`d438942`)의 메시지는 선언이 `save.js`로 옮겨졌다고 적었지만 `move-to`가 로드 순서 검사로 거절했고(표 초기식이 `ui.js`의 함수를 이름으로 언급) 스크립트가 실패를 삼켜서 옮겨지지 않았다. 별도 커밋(`2b88a1c`)이 선언을 옮겼다. 이후 표는 `stage-table` 도구가 직접 옮겼다(리터럴은 호이스팅되는 함수 선언만 가리키므로 위치가 무관).
- `PICKUP_PIPELINE.handlers`: `pickup()`(world.js)이 읽지만 어디서도 채우지 않는다. 읽는 곳이 있으므로 삭제하지 않았다(승인 조건). 결정 대기.
- 측정·변환 도구(`stage-report`, `stage-table`)는 등록 호출이 모두 없어져 쓸 곳이 없어 삭제했다.
