#!/bin/bash
# 개발 환경 설정 스크립트

echo "🚀 꿈결 앱 개발 환경 설정 중..."

# 1. 이전 프로세스 정리
echo "📱 이전 프로세스 정리 중..."
adb shell am force-stop com.dreamtracerapp 2>/dev/null || true
pkill -f "react-native start" 2>/dev/null || true
pkill -f "metro" 2>/dev/null || true

# 2. 포트 확인 및 정리
echo "🔌 포트 8081 확인 중..."
lsof -ti:8081 | xargs kill -9 2>/dev/null || true

# 3. 캐시 정리
echo "🧹 캐시 정리 중..."
npm run clean:metro
npm run clean:android

# 4. ADB 연결 확인
echo "📱 ADB 연결 확인 중..."
adb devices

# 5. 포트 포워딩 설정
echo "🔗 포트 포워딩 설정 중..."
adb reverse tcp:8081 tcp:8081

# 6. Metro 번들러 시작
echo "🎯 Metro 번들러 시작 중..."
npm start &

# 7. 잠시 대기
sleep 5

# 8. 앱 빌드 및 실행
echo "📱 앱 빌드 및 실행 중..."
npm run android

echo "✅ 개발 환경 설정 완료!"
echo "💡 Metro 번들러가 백그라운드에서 실행 중입니다."
echo "🔄 앱을 다시 시작하려면: npm run android"
