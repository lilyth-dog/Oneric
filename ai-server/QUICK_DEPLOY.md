# 🚀 NCP 빠른 배포 가이드

## 📋 사전 준비사항

### 1. NCP 콘솔에서 확인할 것들
- [ ] 가상서버 생성 완료
- [ ] 공인 IP 할당
- [ ] ACG(방화벽) 설정 (22, 80, 443 포트 허용)
- [ ] API 키 발급 (Access Key, Secret Key)

### 2. 필요한 정보
- [ ] 서버 IP 주소
- [ ] NCP Access Key
- [ ] NCP Secret Key
- [ ] OpenRouter API Key

## 🔧 배포 단계

### 1단계: 서버 접속
```bash
# SSH로 서버 접속
ssh root@your_server_ip

# 또는 키 파일 사용
ssh -i your_key.pem root@your_server_ip
```

### 2단계: 코드 업로드
```bash
# Windows에서 (PowerShell)
scp -r ai-server/ root@your_server_ip:/opt/

# 또는 Git 사용
git clone https://github.com/your-repo/ggumgyeol.git
cd ggumgyeol/ai-server
```

### 3단계: 환경 변수 설정
```bash
# 서버에서 실행
cd /opt/ai-server

# 환경 변수 파일 생성
cp env.example .env

# 환경 변수 편집
nano .env
```

**`.env` 파일 내용:**
```bash
# NCP 설정
NCP_ACCESS_KEY=your_actual_access_key
NCP_SECRET_KEY=your_actual_secret_key
NCP_REGION=KR

# OpenRouter API 설정
OPENROUTER_API_KEY=your_actual_openrouter_key

# 서버 설정
HOST=0.0.0.0
PORT=8000
DEBUG=False

# 보안 설정
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# 로깅 설정
LOG_LEVEL=INFO
```

### 4단계: 배포 실행
```bash
# 배포 스크립트 실행 권한 부여
chmod +x deploy.sh

# 배포 실행
./deploy.sh
```

### 5단계: 서비스 확인
```bash
# 서비스 상태 확인
docker-compose -f ncp-deploy.yml ps

# 로그 확인
docker-compose -f ncp-deploy.yml logs -f api

# 헬스 체크
curl http://localhost:8000/health
```

## 🌐 외부 접속 설정

### 1. Load Balancer 설정 (NCP 콘솔)
1. **Load Balancer 생성**
2. **타겟 그룹 설정** (서버 IP:8000)
3. **리스너 설정** (HTTP:80, HTTPS:443)
4. **헬스 체크 설정** (/health)

### 2. 도메인 연결 (선택사항)
```bash
# 도메인 DNS 설정
# A 레코드: your-domain.com → Load Balancer IP
```

## 📊 모니터링

### 1. 실시간 모니터링
```bash
# 서버 리소스 확인
htop
df -h
free -h

# 서비스 로그 확인
docker-compose -f ncp-deploy.yml logs -f

# API 응답 확인
curl http://your_server_ip:8000/health
```

### 2. NCP 콘솔 모니터링
- **Server**: CPU, 메모리 사용률
- **Load Balancer**: 트래픽, 응답 시간
- **Object Storage**: 저장량, 전송량

## 🚨 문제 해결

### 1. 서버 연결 실패
```bash
# 방화벽 확인
ufw status

# 포트 확인
netstat -tlnp | grep :8000

# 서비스 재시작
docker-compose -f ncp-deploy.yml restart
```

### 2. API 응답 실패
```bash
# 로그 확인
docker-compose -f ncp-deploy.yml logs api

# 환경 변수 확인
docker-compose -f ncp-deploy.yml exec api env

# 컨테이너 재시작
docker-compose -f ncp-deploy.yml restart api
```

### 3. 성능 문제
```bash
# 리소스 사용률 확인
docker stats

# 로그 분석
tail -f /var/log/nginx/access.log
```

## 📱 앱에서 API 연결

### 1. API 엔드포인트 설정
```typescript
// DreamTracerApp/src/config/api.ts
export const API_CONFIG = {
  baseURL: 'http://your_server_ip:8000',
  // 또는 Load Balancer IP
  // baseURL: 'http://your_load_balancer_ip',
  timeout: 30000,
};
```

### 2. AI 서비스 연결
```typescript
// DreamTracerApp/src/services/aiService.ts
const response = await fetch(`${API_CONFIG.baseURL}/api/v1/dreams/analyze`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    dream_text: dreamText,
    model: 'dialogpt-small'
  })
});
```

## ✅ 배포 완료 체크리스트

- [ ] 서버 접속 성공
- [ ] 코드 업로드 완료
- [ ] 환경 변수 설정 완료
- [ ] Docker 서비스 실행 중
- [ ] API 헬스 체크 성공
- [ ] Load Balancer 설정 완료
- [ ] 앱에서 API 연결 성공
- [ ] 꿈 분석 테스트 성공

## 🎉 완료!

이제 **꿈결** 앱이 NCP에서 운영됩니다!

**서버 주소**: http://your_server_ip:8000
**헬스 체크**: http://your_server_ip:8000/health
**API 문서**: http://your_server_ip:8000/docs
