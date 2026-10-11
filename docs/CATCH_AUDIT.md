# 빈 catch 감사 (61개 → 0개)

`ignoreError(reason, error)`(`src/scripts/00-boot-isolation.js`)는 기대된 무해한 실패를 한 곳으로 모은 공용 헬퍼다. 이유마다 처음 한 번만 `console.debug`로 남기고 게임 동작은 바꾸지 않는다. 위치 번호는 이 정리 직전의 줄 번호다.

## 검증
- 61개 모두 계측본(각 catch가 실행되면 콘솔에 기록)으로 확인했다. 새 게임 7직업 × PC/모바일 80입력, 1~25층 재생성 600회(시드 24개 × 25층), V40 세이브 4종 이어하기, 디버그 전장에서 **한 번도 실행되지 않았다.**
- 따라서 교체해도 해당 경로의 동작은 같다. 이후 실패하면 헬퍼가 콘솔에 이유를 남긴다.

## 분류 요약
- 저장소: 12개 — 저장소 접근 불가를 무시
- 선택 기능: 9개 — 선택 기능/API 부재를 무시
- 오디오: 3개 — 오디오 재생 불가를 무시
- 캐시 정리: 4개 — 캐시 정리 호출 실패를 무시
- 렌더 복구: 8개 — 렌더 복구 중 개별 호출 실패를 무시
- UI 갱신: 6개 — UI 갱신 호출 실패를 무시
- 제거: 2개 — 던질 수 없는 문장이라 try/catch 제거
- 생성 보호: 9개 — 생성 중 보조 단계 실패를 무시
- 부팅: 3개 — 부팅 초기화 호출 실패를 무시
- 오류 은폐 가능: 2개 — 오류가 숨을 수 있는 곳
- 삭제: 3개 — 덮어써지는 죽은 코드라 삭제

## 표
| 위치 | 분류 | 이유 | 처리 |
|---|---|---|---|
| 00-boot-isolation.js:20 | 저장소 | boot recovery: storage unavailable, keep the primary save | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:3733 | 저장소 | haptics preference unreadable | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:6909 | 선택 기능 | class portrait preview is optional decoration | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:6993 | 선택 기능 | a long-press cancel callback threw | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:7924 | 선택 기능 | getSelection unavailable | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:7943 | 오디오 | tone cue could not play | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:7944 | 오디오 | noise cue could not play | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:8001 | 저장소 | hold-hint flag unreadable | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:8468 | 저장소 | pad visibility unreadable | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:8469 | 저장소 | pad visibility could not be saved | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:10485 | 저장소 | ui volume unreadable | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:10523 | 오디오 | ui sound could not play | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:10664 | 저장소 | tip reset could not clear keys | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:10817 | 저장소 | ui volume could not be saved | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:10834 | 선택 기능 | saved camera mode could not be applied | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:10861 | 캐시 정리 | actor cache clear | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:10862 | 캐시 정리 | actor art clear | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:10863 | 캐시 정리 | item art clear | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:10864 | 캐시 정리 | hi-res cache clear | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:10881 | 렌더 복구 | canvas state reset | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:10882 | 렌더 복구 | viewport sync | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:10883 | 렌더 복구 | clear frame | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:10885 | 렌더 복구 | camera resume | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:10886 | 렌더 복구 | visibility recompute | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:10887 | 렌더 복구 | panel refresh | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:10891 | 렌더 복구 | attack button refresh | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:11412 | 저장소 | pad default could not be saved | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:11415 | UI 갱신 | mobile hud refresh before a run exists | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:11519 | UI 갱신 | auto-walk chip update | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:11525 | 제거 | autoWalkToken++ cannot throw | try/catch 제거 |
| 10-runtime.js:11878 | 선택 기능 | pointer capture refused (pointer already released) | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:11915 | 선택 기능 | pointer capture refused (pointer already released) | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:12200 | 생성 보호 | side-room reward could not be placed; generation continues without it | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:13137 | 생성 보호 | exit vestibule repair failed; the lock audit that follows reports the result | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:13139 | 생성 보호 | visibility recompute after the repair attempt | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:13824 | 생성 보호 | connectivity repair failed; validation that follows decides | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:14235 | 생성 보호 | integrity repair failed; the next validation catches it | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:14568 | 생성 보호 | integrity repair failed; the next validation catches it | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:14703 | UI 갱신 | ui refresh in the load hook (branch or legend floor) | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:14709 | UI 갱신 | ui refresh in the load hook | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:14730 | 저장소 | old zoom setting could not be removed | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:15338 | 선택 기능 | item icon renderer unavailable | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:15471 | 선택 기능 | pointer capture refused (pointer already released) | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:15571 | UI 갱신 | boss intro could not be shown; the story continues | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:15821 | 렌더 복구 | effects reset | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:15825 | UI 갱신 | ui refresh after restore | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:15854 | 저장소 | explicit-quit flag could not be stored | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:15855 | 선택 기능 | window.close refused by the browser | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:15893 | 저장소 | legacy save cleanup could not scan storage | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:16042 | 부팅 | cancel auto-walk before the first run | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:16043 | 부팅 | monster visual cache clear | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:16044 | 부팅 | effects reset | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:16064 | 오류 은폐 가능 | reach audit failed; treated as no unreachable items | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:16071 | 오류 은폐 가능 | reach audit failed; treated as no unreachable items | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:16589 | 제거 | defBy cannot miss: the item is defined two lines above | try/catch 제거 |
| 10-runtime.js:16666 | 삭제 | version stamp overwritten by the final stamp | 블록 삭제 |
| 10-runtime.js:17562 | 생성 보호 | reachability helper failed; the generic walk below is used | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:18458 | 생성 보호 | special-floor decor rebuild failed; decor stays as generated | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:18479 | 생성 보호 | special-floor decor rebuild failed; decor stays as generated | `ignoreError(이유, error)`로 교체 |
| 10-runtime.js:18493 | 삭제 | version stamp overwritten by the final stamp | 블록 삭제 |
| 10-runtime.js:19400 | 삭제 | version stamp overwritten by the final stamp | 블록 삭제 |

## 판단이 필요한 것 (FINDINGS.md F-12~F-13)
- **오류 은폐 가능 2곳**(16064, 16071): 도달성 감사가 던지면 "도달 불가 아이템 없음"으로 취급한다. 지금은 던지지 않는다. 실패 시 통과로 처리하는 것이 맞는지는 기획 판단이다. 동작을 바꾸지 않고 기록만 한다.
- 버전 표기(`RELEASE.build`, `document.title`)가 로드 중 여러 번 덮어써진다. 마지막 값만 의미가 있다. 빈 catch가 있던 3곳만 지웠고 나머지 덮어쓰기는 아직 남아 있다.
