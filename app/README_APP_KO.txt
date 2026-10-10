만루 V40 앱 패키지 (2026-10-10 조립)
================================================

기준: MANRU_V40_SEAWEED_COOKING_SOURCE_20261007.zip 의 분리 소스
게임 코드(scripts/ styles/ assets/)는 원본과 바이트 단위 동일.
index.html 에는 앱 설치용 태그 9줄과 서비스 워커 등록 1줄만 추가됨.

구성
- www/                    설치형 웹앱(PWA) 본체
  - manifest.webmanifest  앱 이름·아이콘·전체화면 설정
  - sw.js                 오프라인 캐시 (파일 18개)
  - pwa-register.js       서비스 워커 등록 (앱(Capacitor) 안에서는 자동으로 꺼짐)
  - icons/                192 / 512 / 512 마스크형 아이콘
- package.json, capacitor.config.json   안드로이드 APK 빌드용 (Capacitor 7)
- build-android.bat / build-android.sh   APK 빌드 스크립트
- assemble_app.py          다음 버전 소스로 다시 조립하는 스크립트


1. 폰에 바로 설치 (PWA) — 가장 간단
------------------------------------------------
1) www 폴더 안의 내용을 https 웹 호스팅에 그대로 올린다.
   예) GitHub Pages, Netlify, Cloudflare Pages (모두 무료)
   * 반드시 https 주소여야 설치·오프라인이 동작한다. 파일로 직접 열면(file://) 안 된다.
2) 폰 브라우저로 그 주소를 연다.
   - 안드로이드 크롬: 메뉴 → "앱 설치" 또는 "홈 화면에 추가"
   - 아이폰 사파리: 공유 → "홈 화면에 추가"
3) 홈 화면 아이콘으로 실행하면 주소창 없이 전체화면으로 뜨고, 한 번 연 뒤에는 인터넷 없이도 실행된다.

업데이트: 새 버전 www 를 같은 주소에 덮어쓰면, 다음 실행 때 새 파일을 받고 그다음 실행부터 적용된다.


2. 안드로이드 APK 만들기 (Capacitor)
------------------------------------------------
필요: Node.js 20 이상, Android Studio (안드로이드 SDK와 JDK 포함)
1) 이 폴더(MANRU_V40_APP)에서
   - Windows: build-android.bat 더블클릭
   - macOS/Linux: ./build-android.sh
2) 완료되면 android/app/build/outputs/apk/debug/app-debug.apk 가 생긴다.
3) 폰으로 옮겨 설치 ("출처를 알 수 없는 앱" 허용 필요).

Android Studio 화면에서 직접 하고 싶으면:
  npm install → npx cap add android → npx cap open android → Build > Build APK(s)

* 이 APK 빌드는 작업 환경에 안드로이드 SDK가 없어 미리 실행해 보지 못했다.
  설정 파일은 Capacitor 7 기준 표준 구성이다.
* 플레이스토어 배포용은 디버그 APK가 아니라 서명된 릴리스 빌드(AAB)가 필요하다.


3. 다음 버전 조립
------------------------------------------------
  python3 assemble_app.py <새 소스.zip> <출력폴더>
  python3 assemble_app.py <새 소스.zip> <출력폴더> --fix-title-flicker
    → 타이틀 깜빡임 수정: 런타임 뒤에 연결된 CSS 4개(20/30/40/50)를 <head>로 올린다.
       기본값은 원본 순서 유지(미적용).
필요: Python 3, Pillow (아이콘 생성용)


4. 알아둘 점
------------------------------------------------
- 세이브는 "주소(출처)"마다 따로 저장된다.
  단일 HTML 파일, PWA 주소, APK 앱은 서로 세이브를 공유하지 않는다.
  옮기려면 게임 안의 세이브 내보내기/가져오기를 쓴다.
- 앱 안에서 게임의 전체화면 요청이 브라우저와 다르게 동작할 수 있다. 첫 실행 때 확인 필요.
- 안드로이드 뒤로 가기 버튼은 기본적으로 앱을 닫는다. 게임은 자동 저장을 쓰므로 진행은 보존된다.


검증 (2026-10-10, 헤드리스 크롬, 모바일 390×844)
------------------------------------------------
- manifest 인식, 설치 가능성 오류 0건
- 서비스 워커 활성 및 페이지 제어, 캐시 18개 파일
- 오프라인 상태에서 다시 열기: 타이틀 정상 표시, 페이지 오류 0건
- 오프라인 상태에서 신분 선택 → 입장: 1층 진입, HP 34/34 정상
- scripts/ styles/ assets/ 원본과 동일, index.html 은 추가 줄 외 동일
