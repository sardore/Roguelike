# F-10 별칭 2개 제거: 설계 요약 (구현 전, 사용자 확인용)

`npm run check`의 `alias` 지표 2건: `MANRU_LOAD_CORE = loadGameV0Legacy`(save.js), `typedKeyMeta96 = keyMeta96`(spine.js). 둘 다 "나중에 바꿔치기되는 값에 처음 값을 별칭으로 넣어 둔 것"이다. 아래는 코드를 읽고 실제 실행(`__MANRU_LIFECYCLE__.audit()`)으로 확인한 내용이며, 이 설계대로 고치기 전에 확인을 받는다.

## 1. 로드 단계(stage) 등록의 실제 의미
- `__MANRU_LIFECYCLE__.registerNew/registerLoad(id, spec)`는 새 런/불러오기 때 돌 단계 목록에 추가한다.
- `resetLoad(id, core, validate, parse)`는 **불러오기 코어를 바꾸고 불러오기 단계 목록을 비운다**(`length=0`). 호출은 두 번이다: spine.js의 `resetLoad('legacy-v3', legacyLoadCore)`(줄 4012)와 `resetLoad('runtime70', loadGameCore, validateSaveState, parseEnvelope)`(줄 7136). 둘째가 첫째를 덮어쓰고 목록을 한 번 더 비운다.
- 실제 실행 결과: 불러오기 코어는 `runtime70`, 불러오기 단계 15개(`resume70 … artifact46`). **코드에는 불러오기 단계 등록이 20개 있는데 6개는 비워져 실행되지 않는다**: `camera49`, `aim52`, `knowledge56`, `monster-config61`, `food57`, `potions41`(마지막 둘은 새 런 단계로는 등록·실행됨). 즉 이 6개의 `registerLoad` 호출은 지금도 죽은 코드다.
- 별칭 `MANRU_LOAD_CORE = loadGameV0Legacy`(처음 값)와 `legacyLoadCore`(`legacy-v3`)는 둘 다 첫 불러오기 전에 `loadGameCore`로 바뀌므로 도달할 수 없다.

## 2. 제안 (F-10a: MANRU_LOAD_CORE)
1. 불러오기 코어는 `loadGameCore` 하나로 못 박는다: `RunLifecycle.runLoad`와 `snapshotLoad`가 `loadGameCore`를 직접 쓴다(`let MANRU_LOAD_CORE`, `MANRU_LOAD_CORE_ID`, `resetLoad` 삭제). 감사 출력(`audit().loadCore`)의 값 `'runtime70'`은 같은 문자열 상수로 유지해 테스트·감사 값이 바뀌지 않게 한다.
2. `RuntimeState.lifecycle.validate/parse`는 `resetLoad`가 대입하던 `validateSaveState`/`parseEnvelope`를 상태 초기화 지점에서 처음부터 그 값으로 둔다.
3. 도달 불가한 `loadGameV0Legacy`, `legacyLoadCore`와 첫 번째 `resetLoad` 호출을 삭제한다.
4. 비워지던 6개의 죽은 `registerLoad`(위 목록)는 **삭제**한다. 비우기를 없애면 이것들이 갑자기 실행되기 때문에, 동작 보존을 위해 호출 자체를 지운다(실행되던 적이 없으므로 동작은 같다). 새 런 단계(`registerNew`)로 등록된 `food57`, `potions41`은 그대로다.
5. 확인할 점(질문): 이 6개가 의도적으로 꺼진 것인지, 불러오기 때 실행되어야 하는데 누락된 버그인지는 기획 판단이다(예: `monster-config61`은 불러오기 후 몬스터 설정을 다시 맞추는 단계였을 가능성). 구조 정리에서는 **삭제(현재 동작 유지)**를 제안하고, 되살릴지는 FINDINGS에 기록해 따로 결정한다.
6. 검증: `audit()`의 단계 목록·코어 id가 변경 전과 완전히 같고, 저장 불러오기·V40 세이브 시나리오(`saveload`, `saves`)와 전체 테스트가 같아야 한다.

## 3. 제안 (F-10b: typedKeyMeta96)
- `keyMeta96`(열쇠 종류 기본 표)을 `typedKeyMeta96`에 담고, 줄 11772의 `__MANRU_TYPED_KEYS__.setMetaProvider(keyMeta1006)`가 이를 `keyMeta1006`으로 바꾼다. 불러오기·게임 중에는 항상 `keyMeta1006`이 쓰인다.
- 제안: `setMetaProvider`와 `typedKeyMeta96`을 삭제하고 `TYPED_KEYS.meta(id)`·열쇠 줍기·잠금 문 처리·요약이 `keyMeta1006`을 직접 호출한다. `keyMeta96`은 `render.js`(열쇠 타일 그리기)와 `ui.js`(열쇠 패널의 대체값)가 **직접** 쓰므로 그대로 둔다(두 함수의 반환값이 달라서 합치면 외형이 바뀔 수 있음).
- 부수 정리: 위 이름들의 버전 접미사는 같은 단계에서 역할명으로 바꾼다(`keyMeta1006`→`lockedKeyMeta` 등; NAMING.md에 근거 기록).
- 검증: 열쇠가 있는 층(6층, 전설 던전)의 화면·상태 시나리오가 변경 전과 같아야 한다.

## 4. 진행 방식
사용자 확인 전에는 코드를 바꾸지 않는다. 확인되면 도메인 이동과 별개의 커밋 하나로 처리하고(`alias` 2 → 0, 죽은 등록 6개 삭제 포함), 위 검증을 모두 통과해야 푸시한다.
