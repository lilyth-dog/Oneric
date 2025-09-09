#!/bin/bash

echo "🚀 Railway 무료 배포 시작..."

# 1. Railway CLI 설치 확인
if ! command -v railway &> /dev/null; then
    echo "📦 Railway CLI 설치 중..."
    npm install -g @railway/cli
fi

# 2. Railway 로그인 확인
if ! railway whoami &> /dev/null; then
    echo "🔐 Railway 로그인이 필요합니다."
    echo "브라우저에서 로그인하세요..."
    railway login
fi

# 3. 프로젝트 초기화
echo "🔧 프로젝트 초기화 중..."
railway init

# 4. 환경 변수 설정
echo "⚙️ 환경 변수 설정 중..."
railway variables set NCP_ACCESS_KEY=ncp_iam_BPAMKR38ZrL0CKCQXNYb
railway variables set NCP_SECRET_KEY=ncp_iam_BPKMKRW9Ah5Bc0NED39egXshECkcOu7iAW
railway variables set OPENROUTER_API_KEY=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
railway variables set HOST=0.0.0.0
railway variables set PORT=8000
railway variables set DEBUG=False

# 5. 프로젝트 배포
echo "🚀 프로젝트 배포 중..."
railway up

echo "✅ 배포 완료!"
echo "🌐 서버 주소가 표시됩니다."
echo "📊 상태 확인: railway status"
echo "📝 로그 확인: railway logs"
