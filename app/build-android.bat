@echo off
rem 만루 APK 빌드 (Windows). 필요: Node.js 20 이상, Android Studio(SDK 포함)
cd /d "%~dp0"
call npm install || goto err
if not exist android (call npx cap add android || goto err)
call npx cap sync android || goto err
cd android
call gradlew.bat assembleDebug || goto err
echo.
echo 완료: android\app\build\outputs\apk\debug\app-debug.apk
pause
exit /b 0
:err
echo 빌드 실패. README_APP_KO.txt 의 "문제 해결"을 확인하자.
pause
exit /b 1
