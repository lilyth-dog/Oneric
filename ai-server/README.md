# 꿈결 AI API 서버 (무료 버전)

OpenRouter의 무료 모델들을 사용한 꿈 분석 서비스입니다.

## 🚀 빠른 시작

### 1. OpenRouter API 키 발급
1. [OpenRouter](https://openrouter.ai/) 가입
2. API 키 생성
3. 무료 크레딧 확인

### 2. 환경 설정
```bash
# 환경 변수 파일 복사
cp env.example .env

# .env 파일 편집
OPENROUTER_API_KEY=your_api_key_here
```

### 3. 로컬 실행
```bash
# 의존성 설치
pip install -r requirements.txt

# 서버 실행
python main.py
```

### 4. Docker 실행
```bash
# Docker Compose로 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f api
```

## 📊 사용 가능한 무료 모델

### 대화형 LLM
- **microsoft/DialoGPT-small**: 완전 무료
- **microsoft/DialoGPT-medium**: 완전 무료
- **facebook/blenderbot-400M-distill**: 완전 무료

### 이미지 생성
- **stabilityai/stable-diffusion-xl-base-1.0**: 무료 티어

## 🔧 API 사용법

### 꿈 분석
```bash
curl -X POST "http://localhost:8000/api/v1/dreams/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "dream_text": "어젯밤에 하늘을 날아다니는 꿈을 꿨어요",
    "model": "dialogpt-small"
  }'
```

### 꿈 시각화
```bash
curl -X POST "http://localhost:8000/api/v1/dreams/visualize" \
  -H "Content-Type: application/json" \
  -d '{
    "dream_text": "하늘을 날아다니는 꿈",
    "style": "dreamy_artistic"
  }'
```

## 💰 비용 정보

### OpenRouter 무료 티어
- **월 30,000 토큰** 무료
- **무료 모델들** 무제한 사용
- **이미지 생성** 무료 티어

### 예상 비용 (월 1,000명 사용자 기준)
- **무료 모델 사용**: $0
- **유료 모델 사용**: $5-10
- **서버 비용**: $5-10 (VPS)

## 🚀 배포 옵션

### 1. VPS 서버 (추천)
- **Hetzner**: €4.15/월 (2GB RAM)
- **DigitalOcean**: $6/월 (1GB RAM)
- **Linode**: $5/월 (1GB RAM)

### 2. 클라우드 서비스
- **Railway**: $5/월
- **Render**: $7/월
- **Fly.io**: $5/월

### 3. 무료 호스팅
- **Heroku**: 무료 (제한적)
- **Vercel**: 무료 (제한적)
- **Netlify**: 무료 (제한적)

## 📈 모니터링

### 서버 상태 확인
```bash
curl http://localhost:8000/health
```

### 사용 가능한 모델 확인
```bash
curl http://localhost:8000/api/v1/models
```

## 🔒 보안

- API 키는 환경 변수로 관리
- CORS 설정으로 도메인 제한
- 요청 제한 및 캐싱 적용

## 📝 로그

```bash
# 실시간 로그 확인
docker-compose logs -f api

# 특정 시간대 로그
docker-compose logs --since="2024-01-01T00:00:00" api
```

## 🛠️ 문제 해결

### API 키 오류
```bash
# 환경 변수 확인
echo $OPENROUTER_API_KEY

# .env 파일 확인
cat .env
```

### 모델 로드 실패
```bash
# 모델 목록 확인
curl http://localhost:8000/api/v1/models

# 서버 재시작
docker-compose restart api
```

## 📞 지원

- **이슈 리포트**: GitHub Issues
- **문서**: [OpenRouter Docs](https://openrouter.ai/docs)
- **커뮤니티**: Discord

## 📄 라이선스

MIT License
