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

## 현재 파일별 줄 수

| file | lines |
|---|---:|
| kernel.js | 16 |
| catalog.js | 173 |
| save.js | 534 |
| items.js | 718 |
| combat.js | 617 |
| monsters.js | 1346 |
| render.js | 3966 |
| mapgen.js | 2489 |
| special.js | 1660 |
| branches.js | 2084 |
| spine.js | 10855 |
| input.js | 148 |
| story.js | 208 |
| ui.js | 717 |
| start.js | 9 |
| (total) | 25540 |
