@echo off
REM 개발 환경 설정 스크립트 (Windows)

echo 🚀 꿈결 앱 개발 환경 설정 중...

REM 1. 이전 프로세스 정리
echo 📱 이전 프로세스 정리 중...
adb shell am force-stop com.dreamtracerapp >nul 2>&1
taskkill /f /im node.exe >nul 2>&1

REM 2. 포트 확인 및 정리
echo 🔌 포트 8081 확인 중...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8081') do taskkill /f /pid %%a >nul 2>&1

REM 3. 캐시 정리
echo 🧹 캐시 정리 중...
call npm run clean:metro
call npm run clean:android

REM 4. ADB 연결 확인
echo 📱 ADB 연결 확인 중...
adb devices

REM 5. 포트 포워딩 설정
echo 🔗 포트 포워딩 설정 중...
adb reverse tcp:8081 tcp:8081

REM 6. Metro 번들러 시작
echo 🎯 Metro 번들러 시작 중...
start /b npm start

REM 7. 잠시 대기
timeout /t 5 /nobreak >nul

REM 8. 앱 빌드 및 실행
echo 📱 앱 빌드 및 실행 중...
call npm run android

echo ✅ 개발 환경 설정 완료!
echo 💡 Metro 번들러가 백그라운드에서 실행 중입니다.
echo 🔄 앱을 다시 시작하려면: npm run android
pause
