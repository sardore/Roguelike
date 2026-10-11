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
