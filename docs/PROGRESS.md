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

## 현재 파일별 줄 수

| file | lines |
|---|---:|
| kernel.js | 16 |
| catalog.js | 173 |
| save.js | 534 |
| items.js | 718 |
| combat.js | 617 |
| monsters.js | 1950 |
| render.js | 4354 |
| mapgen.js | 2963 |
| special.js | 1802 |
| branches.js | 2194 |
| spine.js | 9414 |
| input.js | 148 |
| story.js | 208 |
| ui.js | 717 |
| start.js | 9 |
| (total) | 25817 |
