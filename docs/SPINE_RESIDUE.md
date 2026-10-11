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

## 느슨한 문장 (이유 P)
현재 spine.js에 느슨한 문장(등록·호출·대입) 584개가 남아 있다(선언 1289개). 두 수와 spine.js 줄 수는 `npm run check`의 `spineLooseStatements`·`spineDeclarations`·`spineLines`로 세며 늘면 실패한다. 매 푸시의 값은 `docs/PROGRESS.md`에 적는다. 이 문장들은 도메인 이동에서 옮기지 않는다. 마지막 단계에서 매니페스트의 `afterClosure`(부팅)와 `boot.js`로 같은 순서를 유지한 채 묶는다.
