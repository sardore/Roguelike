# 테스트용 글꼴

스크린샷·렌더 테스트가 어느 기계에서나 같은 글자를 그리도록 `NanumGothic-400.ttf`(SIL OFL 1.1, `@fontsource/nanum-gothic` 5.3.0의 한글·라틴 조각을 하나로 합친 것)를 묶어 둔다. `tests/harness.mjs`가 Chromium을 띄울 때 시스템 글꼴 대신 이 파일만 보이는 fontconfig를 `FONTCONFIG_FILE`로 넘기고, `serif`·`sans-serif`·`monospace`·`system-ui`를 모두 이 글꼴에 연결한다. 게임 코드와 무관하며 배포물에는 들어가지 않는다.
