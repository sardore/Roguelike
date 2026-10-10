#!/usr/bin/env bash
# 만루 APK 빌드 (macOS/Linux). 필요: Node.js 20 이상, Android Studio(SDK 포함)
set -e
cd "$(dirname "$0")"
npm install
[ -d android ] || npx cap add android
npx cap sync android
(cd android && ./gradlew assembleDebug)
echo "완료: android/app/build/outputs/apk/debug/app-debug.apk"
