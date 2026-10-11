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

## 현재 파일별 줄 수

| file | lines |
|---|---:|
| kernel.js | 16 |
| catalog.js | 173 |
| save.js | 698 |
| items.js | 947 |
| combat.js | 651 |
| monsters.js | 2206 |
| render.js | 4877 |
| mapgen.js | 3173 |
| special.js | 1889 |
| branches.js | 2377 |
| elements.js | 247 |
| spine.js | 7671 |
| input.js | 148 |
| story.js | 213 |
| ui.js | 717 |
| start.js | 6 |
| (total) | 26009 |
