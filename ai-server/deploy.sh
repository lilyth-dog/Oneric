#!/bin/bash

# 꿈결 AI 서버 NCP 배포 스크립트

echo "🚀 꿈결 AI 서버 NCP 배포 시작..."

# 1. 환경 변수 확인
if [ ! -f ".env" ]; then
    echo "❌ .env 파일이 없습니다. env.example을 복사하여 설정하세요."
    echo "cp env.example .env"
    echo "nano .env"
    exit 1
fi

# 2. Docker 설치 확인
if ! command -v docker &> /dev/null; then
    echo "📦 Docker 설치 중..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

# 3. Docker Compose 설치 확인
if ! command -v docker-compose &> /dev/null; then
    echo "📦 Docker Compose 설치 중..."
    curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# 4. 기존 컨테이너 정리
echo "🧹 기존 컨테이너 정리 중..."
docker-compose -f ncp-deploy.yml down

# 5. 이미지 빌드
echo "🔨 Docker 이미지 빌드 중..."
docker-compose -f ncp-deploy.yml build

# 6. 서비스 시작
echo "🚀 서비스 시작 중..."
docker-compose -f ncp-deploy.yml up -d

# 7. 서비스 상태 확인
echo "📊 서비스 상태 확인 중..."
sleep 10
docker-compose -f ncp-deploy.yml ps

# 8. 헬스 체크
echo "🏥 헬스 체크 중..."
curl -f http://localhost:8000/health || echo "❌ 헬스 체크 실패"

echo "✅ 배포 완료!"
echo "🌐 서버 주소: http://your_server_ip:8000"
echo "📊 상태 확인: http://your_server_ip:8000/health"
echo "📝 로그 확인: docker-compose -f ncp-deploy.yml logs -f"
