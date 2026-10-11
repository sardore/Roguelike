MANRU V18 — 용왕 픽셀 스프라이트
기준본: 2026-10-06 08:15(KST) V17_SWEEP360 + V17_SOURCE. 작업 시 전체 최근 수정 목록에서 더 최신 코드 파일은 확인되지 않음.
첨부한 청동 뿔 비취 용왕을 imagegen으로 픽셀 격자 정리 후 80×88 PNG로 정규화. 원본 포즈·주요 장식 유지, 단일 정지 프레임.
actorSpriteCanvas105 / actorSpriteRect105 / monsterCanvas1012 / renderSprite1012 / drawPalaceActor105 원본 직접 수정.
용왕 내부 캔버스 96×96, 해상도 배율 2, 몸체 원본 80×88 픽셀 손실 없이 복사. 표시 크기와 발 위치는 기존 논리 좌표로 유지. 최근접 보간.
index.html: 분리 소스 실행본. python3 build_standalone.py: 단일 HTML 생성. scripts/styles/assets 동봉. APK 설치 파일은 아님.
V17 용미 쓸기·상태이상·방어 2회·보상·단층 수로의 원본 처리 유지.
최신 검증 파일: qa/palace-v18-*-results.json. V17 문서와 결과는 과거 기록.
QA: 저장 복원, 정상 용궁 렌더, 실제 전장 전투, 실제 소환 및 관련 없는 종 픽셀 비교, 단일 HTML 무계측 실행.
