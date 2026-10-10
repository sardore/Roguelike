# 만루 (MANRU)

> 잠들지 않는 천 개의 방. 무당·책별 동시 소환이 있는 모바일 우선 로그라이크.

## 구성

| 경로 | 내용 |
|---|---|
| `src/` | **원본.** `index.html`, `scripts/`, `styles/`, `assets/`. 직접 고치는 곳은 여기뿐이다. |
| `tools/` | 빌드(`build.mjs`), 구조 검사기(`check-structure.mjs`), 리팩터 도구(`refactor/`) |
| `tests/` | 동작 보존 기준선과 브라우저 재생 테스트 |
| `docs/` | `ARCHITECTURE.md`(소유자 지도·지표), `FINDINGS.md`(정리 중 발견한 버그·기획 의문), `REFACTOR_PLAN.md`, `history/`(V14~V40 검증 기록) |
| `app/` | PWA 파일과 Capacitor(안드로이드) 설정 |
| `tower/` | 이 저장소에 원래 있던 다른 게임(Tower of the First King) |
| `AGENTS.md` | 개발 지침과 구조 규칙 (**작업 전에 읽는다**) |

## 명령

```
npm install          # 의존성 설치 + pre-commit 훅 연결
npm run build        # dist/MANRU.html (단일 HTML) + dist/app/ (PWA·Capacitor)
npm run check        # 구조 검사 (재대입·CSS 주입·중복 등이 늘면 실패)
npm test             # V40 기준선과 동작 비교 (Chromium 필요)
```

- `dist/MANRU.html`은 더블클릭으로 실행된다. 외부 요청이 없다.
- PWA: `dist/app/www`를 https 호스팅에 올리고 "홈 화면에 추가". 오프라인에서도 열린다.
- 안드로이드 APK: `dist/app/`에서 `build-android.sh`(또는 `.bat`). Node 20+와 Android Studio가 필요하다. 이 환경에서는 SDK가 없어 실행해 보지 못했다.
- 디버그 전장 버튼은 개발 버전이라 타이틀에 항상 보인다.
- 세이브는 실행 방식(HTML 파일 / PWA 주소 / APK)마다 따로 저장된다. 옮기려면 게임 안의 세이브 내보내기/가져오기를 쓴다.

## 규칙 요약

동작을 바꿀 때는 그 동작의 **원본 정의를 직접 고친다.** 함수 재대입, 원본을 감싸는 래퍼, 사후 보정, JS가 만드는 `<style>`, 같은 선택자의 덮어쓰기는 금지이고 검사기가 막는다. 자세한 내용은 `AGENTS.md`.
