# 타이머 점검 (53개 → 점검 결과)

`setTimeout`·`setInterval`·`requestAnimationFrame`·`queueMicrotask` 호출 53곳을 읽고 분류했다. 아직 코드는 바꾸지 않았다(분류만).

## A. 정당한 타이머 (유지) — 36곳
| 종류 | 예 |
|---|---|
| 연출 후 정리 (토스트·떠다니는 글자·보스 예고 숨김·스토리 속삭임·소문 알림) | `floatText`, `toast`, `showBossIntro`, `storyWhisper992`, `rumorNotice1030` |
| 입력 시간 (길게 누르기, 홀드 반복, 포인터 홀드) | `attachLongPress`, `rebindControls81`, `makeInput81`, `bindSkillButton991`, 디버그 전장 포인터 |
| 프레임 루프 | `visualLoop` rAF 2곳, `placeInput81` rAF, 층 생성 `generateNext57` rAF |
| 자동 이동·재개 박자 | 자동 이동 타이머, `resume71`/`scheduleResumeAuto`, `resumeAutoMaybe` |
| 팁 큐 | `pumpTip70` 4곳, `suspendTip60`, 첫 팁 |
| 디버그 전장 자동 재생 | `debugBattlePlay57` |
| 파일 내보내기 정리 | `URL.revokeObjectURL` 지연 |
| 종료 | `quitGame1003` |

## B. 사후 보정이라 없애야 하는 것 — 12곳 (규칙 위반 후보)
"실행 뒤 `setTimeout`·`queueMicrotask`·`requestAnimationFrame`으로 DOM이나 상태를 다시 고치기"에 해당한다. 원본 생성 지점에서 처음부터 올바른 값을 만들도록 고쳐야 한다. 실행 순서가 바뀌므로 화면 비교 테스트를 만든 뒤(4단계) 진행한다.

| 줄 | 하는 일 | 고칠 곳 |
|---|---|---|
| 5421 | 투척 이름 텍스트를 0ms 뒤 덮어씀 | `useInventoryItem`이 처음부터 올바른 이름을 쓰게 |
| 5714 | 80ms 뒤 `syncGameViewport` | 레이아웃 확정 시점에 한 번 |
| 7473 | 0ms 뒤 인벤토리 닫기 | 호출 흐름에서 직접 |
| 8197, 8200 | 식별 뒤 0ms로 인벤토리 다시 그리기 | 식별 함수 끝에서 직접 |
| 10815 | 20ms 뒤 `refreshSfx70` | 초기화 순서 |
| 12789, 14718 | 마이크로태스크로 패드 "대기" 글자를 덮어씀 | 패드 HTML/생성 함수가 처음부터 "대기"를 쓰게 |
| 12847 | 마이크로태스크로 직업 초상 갱신 | 직업 그리드 생성 지점 |
| 14740, 15240, 15244 | 마이크로태스크·rAF·90ms로 `fixGlyphs984` | 글리프를 처음부터 올바르게 |
| 16660 | 마이크로태스크로 `normalizeAllItems1006` | 아이템 생성/로드 경로에서 직접 |

## C. 판단이 필요한 것 — 5곳
- 10840: 0.5초 뒤 카메라 안내 팁(연출).
- 14768: 줌 값 저장 디바운스.
- 15472: 스킬 버튼 바인딩을 마이크로태스크로 미룸(DOM이 만들어지기 전일 수 있음).
- 1011: 보스 소개를 850ms 뒤 표시(연출, 층 전환과 맞춰야 함).
- 1581: Q 길게 누르기(A와 같은 입력 타이머인데 세대 확인 포함).


## 처리 결과 (2026-10-11, 타이머 53 → 41)
B군 12곳 중 10곳의 원인을 고쳤다. 고친 방식과 확인:
| 옛 위치 | 원인 | 고친 곳 |
|---|---|---|
| 투척 이름 0ms 덮어쓰기 | 타깃 배너를 만드는 `beginTarget`이 진짜 이름을 먼저 씀 | `beginTarget`이 처음부터 공개 이름을 쓴다(미식별 던지는 약병). 수정 전 20ms 동안 진짜 이름이 보이던 것이 사라짐(의도한 개선) |
| 인벤토리 닫기 0ms | 이벤트 핸들러 안에서 닫기를 미룸 | 핸들러가 `blockTap` 뒤 직접 닫는다(같은 결과, 테스트 `uiactions.*.inv.closed`) |
| 효과음 버튼 20ms | 키 이벤트는 동기로 처리되는데 문구를 20ms 뒤 갱신 | 클릭 직후 `refreshSfx()` 호출. 수정 전 첫 클릭 직후 문구가 이전 값이었던 것이 사라짐(의도한 개선) |
| 식별 뒤 0ms 재그리기 2곳 | 열린 인벤토리를 다시 그릴 신호가 없었음 | `inventoryDirty` 표시를 두고 프레임 갱신(`updateAll(true)`)이 다시 그린다 (`renderInventory`가 표시를 지움) |
| 패드 "대기"·상호작용 버튼 마이크로태스크 2곳 | 정적 마크업이 최종 값이 아니었음 | `index.html`이 처음부터 최종 값(aria-label, `disabled`, `·`)을 가진다. `.actions [data-act=rest]`를 지우던 문장은 대상이 없는 죽은 코드였음 |
| 직업 초상 갱신 마이크로태스크 | `.vfClassPortrait`가 없는 격자를 갱신(항상 아무 일도 하지 않음) | 문장과 죽은 함수(`refreshClassPortraits`, `classPortraitCanvas`, QA의 `refreshPortraits`) 삭제 |
| `fixGlyphs` 호출 4곳(마이크로태스크·rAF·90ms) | 정적 속성(글리프·aria-label)을 나중에 덮어씀 | 생성 지점이 최종 값을 가진다(`mobileAutoBtn` '行'/'이동 / 자동 탐사', 설정 버튼 aria-label '설정', 휴식 aria-label). `fixGlyphs` 삭제 |
| `normalizeAllItems` 마이크로태스크 | 로드 시 `state`가 비어 있어 항상 즉시 반환(죽은 호출) | 삭제(새 런·불러오기 단계가 이미 호출) |
| orientationchange 80ms | 렌더 루프가 이미 `innerWidth/innerHeight` 변화마다 뷰포트를 맞춤 | 리스너 삭제(`input.listeners.*`에서 이 한 줄이 빠짐: 의도한 변경). 회전 시나리오에서 캔버스 크기가 수정 전과 같음 |

남은 2곳: 불러오기/새 런 직후 90ms 줌 복원(`camera-save984`). 줌 한계가 화면이 보이고 레이아웃이 잡힌 뒤에 계산되므로 화면 전환 구조를 바꾸지 않고는 없앨 수 없다. 사용자 판단 대기(C군).

## 예외 기록 (사용자 결정, 2026-10-11)
`camera-save984` 새 런·불러오기 단계의 90ms 줌 복원 타이머 2곳은 이번에 두고 예외로 기록한다. 이유는 코드 주석에 적었다(줌 한계가 화면 전환 뒤의 레이아웃에 의존). 부팅 도메인(화면 전환과 시작 코드) 이동 때 다시 푼다.
