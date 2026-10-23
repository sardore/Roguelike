# 분할 진행 기록

푸시할 때마다 `node tools/progress.mjs` 출력으로 갱신한다. 줄 수는 `src/game/*.js` 파일의 줄 수, 잔여는 `spine.js`의 최상위 선언 수와 느슨한 최상위 문장(호출·등록·대입) 수다. `spineLines`·`spineDeclarations`·`spineLooseStatements`·`suffixFunction`은 `npm run check`가 기준선(`tools/structure-baseline.json`)과 비교해 늘면 실패한다.

진행률 추정 = spine.js 밖에 있는 줄 / `src/game` 전체 줄. spine.js가 0줄(또는 부팅 코드만)이 되면 끝이다. 추정 방식이나 값이 예상과 다르게 바뀌면 이유를 적는다.

## 기록

| 커밋 | 내용 | spine.js 줄 | 잔여 선언 / 느슨한 문장 | suffixFunction | spine 밖 | 추정 변화 이유 |
|---|---|---:|---:|---:|---:|---|
| afterNewRun | 새 게임 단계 등록(registerNew) → `beforeNewRun`/`afterNewRun` | 11246 | 1289 / 584 | 770 | 55.7% | 첫 기록. |
| branch consts | 분기 상수 23개 → branches.js (로드 중 읽기 계측) | 11185 | 1266 / 584 | 770 | 56% | 계측으로 정적 검사의 과잉 판단을 풀어 늘었다. |
| pinned:save | save 소속 고정 문장 → save.js | 11126 | 1252 / 584 | 770 | 56.3% | 계측으로 정적 검사의 과잉 판단을 풀어 늘었다. |
| pinned:items | items 소속 고정 문장 → items.js | 10962 | 1195 / 584 | 770 | 57% | 계측으로 정적 검사의 과잉 판단을 풀어 늘었다. |
| pinned:combat | combat 소속 고정 문장 → combat.js | 10855 | 1157 / 584 | 770 | 57.5% | 계측으로 정적 검사의 과잉 판단을 풀어 늘었다. |
| pinned:monsters | monsters 소속 고정 문장 → monsters.js | 10322 | 1086 / 584 | 770 | 59.7% | 계측으로 정적 검사의 과잉 판단을 풀어 늘었다. |
| pinned:render | render 소속 고정 문장 → render.js | 10018 | 1002 / 584 | 770 | 61% | 계측으로 정적 검사의 과잉 판단을 풀어 늘었다. |
| pinned:mapgen | mapgen 소속 고정 문장 → mapgen.js | 9618 | 928 / 584 | 770 | 62.7% | 계측으로 정적 검사의 과잉 판단을 풀어 늘었다. |
| pinned:special | special 소속 고정 문장 → special.js | 9500 | 904 / 584 | 770 | 63.2% | 계측으로 정적 검사의 과잉 판단을 풀어 늘었다. |
| pinned:branches | branches 소속 고정 문장 → branches.js | 9414 | 880 / 584 | 770 | 63.5% | 계측으로 정적 검사의 과잉 판단을 풀어 늘었다. |
| pinned:story | story 소속 고정 문장 → story.js | 9411 | 879 / 584 | 770 | 63.5% | 계측으로 정적 검사의 과잉 판단을 풀어 늘었다. |

정정: `3d24e7f`(pinned:save) 커밋 메시지의 "이전에 move-to의 정적 호출 경로 검사가 거부한 것만 옮겼다"는 틀렸다. 옮긴 문장에는 이전 도메인 이동에서 아예 고르지 않았던 문장도 섞여 있다(선택 기준은 rest-plan의 참조 친화도 `pinned:save`). 이력은 고치지 않는다.
| F-21 | BRANCH_DEFS105 → branches.js, 부팅 끝 재확인 삭제(동작 변경) | 9401 | 878 / 584 | 770 | 63.6% | - |
| elements | 원소 반응 42문장 → elements.js (사용자 지정 도메인) | 9226 | 848 / 584 | 770 | 64.3% | - |
| unused | 안 쓰는 선언 23개 삭제 | 9011 | 825 / 584 | 755 | 64.9% | - |
| pinned:render (2차) | 앞선 이동 뒤 render.js 쪽 참조가 많아진 문장 → render.js | 8593 | 754 / 584 | 755 | 66.6% | 참조 친화도를 반복 적용(수렴까지 5회 시뮬레이션). |
| pinned:mapgen (2차) | 앞선 이동 뒤 mapgen.js 쪽 참조가 많아진 문장 → mapgen.js | 8482 | 713 / 584 | 755 | 67.1% | 참조 친화도를 반복 적용(수렴까지 5회 시뮬레이션). |
| pinned:monsters (2차) | 앞선 이동 뒤 monsters.js 쪽 참조가 많아진 문장 → monsters.js | 8328 | 676 / 584 | 755 | 67.7% | 참조 친화도를 반복 적용(수렴까지 5회 시뮬레이션). |
| pinned:special (2차) | 앞선 이동 뒤 special.js 쪽 참조가 많아진 문장 → special.js | 8273 | 660 / 584 | 755 | 67.9% | 참조 친화도를 반복 적용(수렴까지 5회 시뮬레이션). |
| pinned:combat (2차) | 앞선 이동 뒤 combat.js 쪽 참조가 많아진 문장 → combat.js | 8248 | 647 / 584 | 755 | 68.1% | 참조 친화도를 반복 적용(수렴까지 5회 시뮬레이션). |
| pinned:story (2차) | 앞선 이동 뒤 story.js 쪽 참조가 많아진 문장 → story.js | 8248 | 646 / 584 | 755 | 68.1% | 참조 친화도를 반복 적용(수렴까지 5회 시뮬레이션). |
| pinned:items (2차) | 앞선 이동 뒤 items.js 쪽 참조가 많아진 문장 → items.js | 8151 | 610 / 584 | 755 | 68.5% | 참조 친화도를 반복 적용(수렴까지 5회 시뮬레이션). |
| pinned:save (2차) | 앞선 이동 뒤 save.js 쪽 참조가 많아진 문장 → save.js | 8089 | 600 / 584 | 755 | 68.7% | 참조 친화도를 반복 적용(수렴까지 5회 시뮬레이션). |
| pinned:branches (2차) | 앞선 이동 뒤 branches.js 쪽 참조가 많아진 문장 → branches.js | 7970 | 572 / 584 | 755 | 69.2% | 참조 친화도를 반복 적용(수렴까지 5회 시뮬레이션). |
| pinned:items (3차) | 앞선 이동 뒤 items.js 쪽 참조가 많아진 문장 → items.js | 7915 | 553 / 584 | 755 | 69.5% | 참조 친화도를 반복 적용(수렴까지 5회 시뮬레이션). |
| pinned:save (3차) | 앞선 이동 뒤 save.js 쪽 참조가 많아진 문장 → save.js | 7827 | 549 / 584 | 755 | 69.8% | 참조 친화도를 반복 적용(수렴까지 5회 시뮬레이션). |
| pinned:monsters (3차) | 앞선 이동 뒤 monsters.js 쪽 참조가 많아진 문장 → monsters.js | 7804 | 544 / 584 | 755 | 69.9% | 참조 친화도를 반복 적용(수렴까지 5회 시뮬레이션). |
| pinned:branches (3차) | 앞선 이동 뒤 branches.js 쪽 참조가 많아진 문장 → branches.js | 7797 | 540 / 584 | 755 | 69.9% | 참조 친화도를 반복 적용(수렴까지 5회 시뮬레이션). |
| pinned:render (3차) | 앞선 이동 뒤 render.js 쪽 참조가 많아진 문장 → render.js | 7795 | 539 / 584 | 755 | 69.9% | 참조 친화도를 반복 적용(수렴까지 5회 시뮬레이션). |
| pinned:combat (3차) | 앞선 이동 뒤 combat.js 쪽 참조가 많아진 문장 → combat.js | 7795 | 538 / 584 | 755 | 69.9% | 참조 친화도를 반복 적용(수렴까지 5회 시뮬레이션). |
| F-23 | 분할 회귀 3건 되돌림(선언을 채우기 문장 뒤로) + values 시나리오 | 7801 | 541 / 584 | 755 | 69.9% | 되돌린 선언 3개와 주석 3줄로 spine.js가 6줄 늘었다. 3차 이동 커밋 6개는 기준선을 낮추지 않았고 이 커밋에서 한꺼번에 낮췄다. |
| rest→mapgen | rest 중 사용처 과반이 mapgen.js인 선언 → mapgen.js (규칙 a) | 7758 | 526 / 584 | 755 | 70.1% | - |
| rest→items | rest 중 사용처 과반이 items.js인 선언 → items.js (규칙 a) | 7735 | 510 / 584 | 755 | 70.2% | - |
| rest→monsters | rest 중 사용처 과반이 monsters.js인 선언 → monsters.js (규칙 a) | 7713 | 494 / 584 | 755 | 70.3% | - |
| rest→render | rest 중 사용처 과반이 render.js인 선언 → render.js (규칙 a) | 7694 | 479 / 584 | 755 | 70.4% | - |
| rest→special | rest 중 사용처 과반이 special.js인 선언 → special.js (규칙 a) | 7684 | 473 / 584 | 755 | 70.5% | - |
| rest→branches | rest 중 사용처 과반이 branches.js인 선언 → branches.js (규칙 a) | 7671 | 469 / 584 | 755 | 70.5% | - |
| rest→save | rest 중 사용처 과반이 save.js인 선언 → save.js (규칙 a) | 7667 | 463 / 584 | 755 | 70.5% | - |
| rest→combat | rest 중 사용처 과반이 combat.js인 선언 → combat.js (규칙 a) | 7664 | 458 / 584 | 755 | 70.5% | - |
| rest→ui | rest 중 사용처 과반이 ui.js인 선언 → ui.js (규칙 a) | 7658 | 453 / 584 | 755 | 70.6% | - |
| rest→input | rest 중 사용처 과반이 input.js인 선언 → input.js (규칙 a) | 7658 | 452 / 584 | 755 | 70.6% | - |
| rest→plurality | 혼합 rest 6개 → 최다 사용 도메인 | 7645 | 446 / 584 | 755 | 70.6% | - |
| F-22 | 로드 중 이른 이어하기 판정 3회 삭제(동작 변경) | 7643 | 446 / 582 | 755 | 70.6% | - |
| F-24 | TT 할당을 kernel로, 두 집합 수정·보완 비교 삭제(동작 변경) | 7629 | 446 / 573 | 755 | 70.7% | - |
| qa-only | QA만 쓰는 선언 15개 → qa.js | 7614 | 431 / 573 | 755 | 70.7% | - |
| world | world 도메인 생성(30문장) — elements 뒤, spine 앞 | 7171 | 401 / 573 | 755 | 72.5% | - |
| layout | layout 도메인 생성(70문장) — world 뒤, spine 앞 | 6503 | 331 / 573 | 755 | 75.1% | - |
| layout 후보→도메인 | layout 이름 후보 중 다른 도메인이 주로 쓰는 50개 → 그 도메인 (규칙 a) | 6196 | 283 / 573 | 755 | 76.3% | - |
| boot 1-2 | input/story/ui를 spine 앞으로, 고정 ui 54·input 10 → 제자리 | 5980 | 219 / 573 | 755 | 77.2% | - |
| P1→items | SPINE_RESIDUE P1: 사용처 과반이 items.js인 잎 선언 → items.js | 5980 | 215 / 573 | 755 | 77.2% | - |
| P1→save | SPINE_RESIDUE P1: 사용처 과반이 save.js인 잎 선언 → save.js | 5969 | 211 / 573 | 755 | 77.2% | - |
| P1→ui | SPINE_RESIDUE P1: 사용처 과반이 ui.js인 잎 선언 → ui.js | 5952 | 204 / 573 | 755 | 77.3% | - |
| P1→mapgen | SPINE_RESIDUE P1: 사용처 과반이 mapgen.js인 잎 선언 → mapgen.js | 5935 | 193 / 573 | 755 | 77.4% | - |
| P1→input | SPINE_RESIDUE P1: 사용처 과반이 input.js인 잎 선언 → input.js | 5930 | 192 / 573 | 755 | 77.4% | - |
| P1→elements | SPINE_RESIDUE P1: 사용처 과반이 elements.js인 잎 선언 → elements.js | 5930 | 191 / 573 | 755 | 77.4% | - |
| P1→world | SPINE_RESIDUE P1: 사용처 과반이 world.js인 잎 선언 → world.js | 5927 | 189 / 573 | 755 | 77.4% | - |
| P1→monsters | SPINE_RESIDUE P1: 사용처 과반이 monsters.js인 잎 선언 → monsters.js | 5880 | 185 / 573 | 755 | 77.6% | - |
| P1→branches | SPINE_RESIDUE P1: 사용처 과반이 branches.js인 잎 선언 → branches.js | 5873 | 184 / 573 | 755 | 77.6% | - |
| P1→layout | SPINE_RESIDUE P1: 사용처 과반이 layout.js인 잎 선언 → layout.js | 5872 | 179 / 573 | 755 | 77.6% | - |
| P1→combat | SPINE_RESIDUE P1: 사용처 과반이 combat.js인 잎 선언 → combat.js | 5871 | 178 / 573 | 755 | 77.6% | - |
| P1→render | SPINE_RESIDUE P1: 사용처 과반이 render.js인 잎 선언 → render.js | 5855 | 170 / 573 | 755 | 77.7% | - |
| P1→special | SPINE_RESIDUE P1: 사용처 과반이 special.js인 잎 선언 → special.js | 5855 | 169 / 573 | 755 | 77.7% | - |
| P2→kernel | SPINE_RESIDUE P2: 공용 선언 → kernel.js | 5855 | 167 / 573 | 755 | 77.7% | - |
| P2→branches | SPINE_RESIDUE P2: 공용 선언 → branches.js | 5845 | 164 / 573 | 755 | 77.8% | - |
| P2→items | SPINE_RESIDUE P2: 공용 선언 → items.js | 5836 | 162 / 573 | 755 | 77.8% | - |
| P2→mapgen | SPINE_RESIDUE P2: 공용 선언 → mapgen.js | 5836 | 160 / 573 | 755 | 77.8% | - |
| P2→world | SPINE_RESIDUE P2: 공용 선언 → world.js | 5820 | 158 / 573 | 755 | 77.9% | - |
| P2→monsters | SPINE_RESIDUE P2: 공용 선언 → monsters.js | 5820 | 156 / 573 | 755 | 77.9% | - |
| P2→save | SPINE_RESIDUE P2: 공용 선언 → save.js | 5809 | 153 / 573 | 755 | 77.9% | - |
| P2→special | SPINE_RESIDUE P2: 공용 선언 → special.js | 5809 | 152 / 573 | 755 | 77.9% | - |
| P2→ui | SPINE_RESIDUE P2: 공용 선언 → ui.js | 5791 | 148 / 573 | 755 | 78% | - |
| P2→kernel | SPINE_RESIDUE P2: 공용 선언 → kernel.js | 5791 | 147 / 573 | 755 | 78% | - |
| P2→render | SPINE_RESIDUE P2: 공용 선언 → render.js | 5781 | 146 / 573 | 755 | 78% | - |
| P3→recipe | P3-1: RECIPE becomes one literal (FUSION_RECIPES) next to the Map built from it | 5727 | 145 / 532 | 755 | 78.2% | - |
| P3→descend | P3: DESCEND_EFFECTS53 registrations become an array literal (2 stages, named functions) | 5725 | 145 / 530 | 755 | 78.2% | - |
| P3→runend | P3: RUN_END_EFFECTS53 registrations become an array literal (2 stages, named functions) | 5723 | 145 / 528 | 755 | 78.2% | - |
| P3→runend-move | P3: RUN_END_EFFECTS53 declaration moves to save.js (the previous commit said it did) | 5722 | 144 / 528 | 755 | 78.2% | - |
| P3→playerstats | P3: PLAYER_STAT_STAGES55 registrations become an array literal (5 stages, named functions) | 5716 | 142 / 523 | 754 | 78.3% | - |
| P3→attackcost | P3: ATTACK_COST_STAGES55 registrations become an array literal (4 stages, named functions) | 5711 | 140 / 519 | 753 | 78.3% | - |
| P3→movecost | P3: MOVE_COST_STAGES55 registrations become an array literal (4 stages, named functions) | 5705 | 138 / 515 | 752 | 78.3% | - |
| P3→panels | P3: PANEL_HOOKS54 registrations become an array literal (2 stages, named functions) | 5698 | 136 / 510 | 751 | 78.3% | - |
| P3→inventory | P3: INVENTORY_RENDER_R34 registrations become an array literal (10 stages, named functions) | 5655 | 135 / 500 | 750 | 78.5% | - |
| P3→boss | P3: BOSS_REWARD_STAGES registrations become an array literal (1 stages, named functions) | 5653 | 134 / 499 | 749 | 78.5% | - |
| P3→pickup | P3: MANRU_PICKUP_PIPELINE_R25 registrations become an array literal (6 stages, named functions) | 5640 | 133 / 495 | 748 | 78.5% | - |
| P3→movehooks | P3: MOVE_HOOKS_R8 registrations become an array literal (10 stages, named functions) | 5629 | 131 / 485 | 746 | 78.6% | - |
| P6~P8 | 전역 공개 47개 이동·2개 삭제, 선언 24개 이동(P6 5 + 신규 9 + P7 4 + P8 6), 버전 문자열 10문장 정의에 합침 | 5243 | 83 / 426 | 744 | 80.1% | - |
| P3b | 등록 API 표 10개(프레젠테이션·미니맵·공격 단계 3·턴·라우트·patchDef·생성) + 개명 | 5096 | 81 / 316 | 743 | 80.6% | - |
| P5 | DOM 요소 7개: `let` + 초기화 함수(ui.js), 호출만 spine에 | 5077 | 74 / 296 | 743 | 80.7% | - |
| P3 정리 | P3: 접미사 개명, 도구 삭제, 문서 | 5629 | 131 / 485 | 744 | 78.6% | - |
| P5→save | spine 선언 → save.js (P3로 풀린 것) | 5617 | 128 / 485 | 744 | 78.6% | - |
| P5→branches | spine 선언 → branches.js (P3로 풀린 것) | 5617 | 126 / 485 | 744 | 78.6% | - |
| P5→combat | spine 선언 → combat.js (P3로 풀린 것) | 5616 | 124 / 485 | 744 | 78.6% | - |
| P5→mapgen | spine 선언 → mapgen.js (P3로 풀린 것) | 5582 | 121 / 485 | 744 | 78.8% | - |
| P5→ui | spine 선언 → ui.js (P3로 풀린 것) | 5575 | 116 / 485 | 744 | 78.8% | - |
| P5→input | spine 선언 → input.js (P3로 풀린 것) | 5575 | 115 / 485 | 744 | 78.8% | - |
| P5→items | spine 선언 → items.js (P3로 풀린 것) | 5568 | 111 / 485 | 744 | 78.8% | - |
| P5→monsters | spine 선언 → monsters.js (P3로 풀린 것) | 5568 | 109 / 485 | 744 | 78.8% | - |
| P4 설계 | P3 이후 이동 22개 완료, P4~P8 설계안(docs/P4_DESIGN.md) | 5568 | 109 / 485 | 744 | 78.8% | - |

## 현재 파일별 줄 수

| file | lines |
|---|---:|
| kernel.js | 25 |
| catalog.js | 173 |
| save.js | 770 |
| items.js | 1057 |
| combat.js | 669 |
| monsters.js | 2284 |
| render.js | 4952 |
| mapgen.js | 3369 |
| special.js | 2038 |
| branches.js | 2406 |
| elements.js | 251 |
| world.js | 497 |
| layout.js | 746 |
| input.js | 259 |
| story.js | 223 |
| ui.js | 1010 |
| spine.js | 5568 |
| start.js | 6 |
| (total) | 26303 |
