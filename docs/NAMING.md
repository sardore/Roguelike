# 이름 정리 기록 (모듈 분할 중)

도메인을 옮길 때 이름에 붙은 버전 접미사(`…57`, `…70`, `…1004`)를 도구(`tools/refactor/rename-batch.mjs`)로 기계적으로 뗐다.
**기계 규칙**: 접미사 숫자만 제거. **사람이 정한 이름**(규칙으로 안 되는 경우): 표에서 `수동`으로 표시.
전체 old→new 목록은 `docs/NAMING.tsv`.

## save.js
- 기계(접미사 제거) 34개, 수동 4개: `MEM70→memoryStorage`(localStorage 불가 시 메모리 대체 저장소), `envelope70→buildSaveEnvelope`, `export70→exportSaveFile`, `V1004→SAVE_RELEASE_TAG`(`'v10.0.6'` 문자열; 역할은 이름에서 추정한 것이라 확인 필요), `legacyLoadCoreV3→legacyLoadCore`(`V3`은 버전이 아니라 이름의 일부일 수 있어 역할명으로).
- `WORLD_TARGET57`과 `TRANSACTION6`은 같은 문장에서 `targetFollowupSuppressUntil57`, `TERMINAL_INTENT71`도 선언해서 함께 이동했다(몬스터 쪽 상태일 가능성; monster 도메인 단계에서 재배치 검토).
- 함수 안쪽 이름(`SAVE1004`, `purgeLegacy1004` 등)은 이번 도구 범위(최상위 선언) 밖이라 그대로다.
