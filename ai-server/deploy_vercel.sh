#!/bin/bash

echo "🚀 Vercel 배포 시작..."

# 1. Vercel CLI 설치 확인
if ! command -v vercel &> /dev/null; then
    echo "📦 Vercel CLI 설치 중..."
    npm install -g vercel
fi

# 2. Vercel 로그인 확인
if ! vercel whoami &> /dev/null; then
    echo "🔐 Vercel 로그인이 필요합니다."
    echo "브라우저에서 로그인하세요..."
    vercel login
fi

# 3. 프로젝트 배포
echo "🚀 프로젝트 배포 중..."
vercel --prod

echo "✅ 배포 완료!"
echo "🌐 서버 주소가 표시됩니다."
echo "📊 상태 확인: vercel ls"
echo "📝 로그 확인: vercel logs"