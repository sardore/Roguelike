# 분할 진행 기록

푸시할 때마다 `node tools/progress.mjs` 출력으로 갱신한다. 줄 수는 `src/game/*.js` 파일의 줄 수, 잔여는 `spine.js`의 최상위 선언 수와 느슨한 최상위 문장(호출·등록·대입) 수다. `spineLines`·`spineDeclarations`·`spineLooseStatements`·`suffixFunction`은 `npm run check`가 기준선(`tools/structure-baseline.json`)과 비교해 늘면 실패한다.

진행률 추정 = spine.js 밖에 있는 줄 / `src/game` 전체 줄. spine.js가 0줄(또는 부팅 코드만)이 되면 끝이다. 추정 방식이나 값이 예상과 다르게 바뀌면 이유를 적는다.

## 기록

| 커밋 | 내용 | spine.js 줄 | 잔여 선언 / 느슨한 문장 | suffixFunction | spine 밖 | 추정 변화 이유 |
|---|---|---:|---:|---:|---:|---|
| afterNewRun | 새 게임 단계 등록(registerNew) → `beforeNewRun`/`afterNewRun` | 11246 | 1289 / 584 | 770 | 55.7% | 첫 기록. |

## 현재 파일별 줄 수

| file | lines |
|---|---:|
| kernel.js | 16 |
| catalog.js | 173 |
| save.js | 461 |
| items.js | 497 |
| combat.js | 472 |
| monsters.js | 1346 |
| render.js | 3966 |
| mapgen.js | 2489 |
| special.js | 1660 |
| branches.js | 2000 |
| spine.js | 11246 |
| input.js | 148 |
| story.js | 208 |
| ui.js | 717 |
| start.js | 9 |
| (total) | 25408 |
