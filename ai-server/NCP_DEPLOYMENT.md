# 네이버 클라우드 플랫폼(NCP) 배포 가이드

## 🚀 NCP 서비스 구성

### 1. 필요한 NCP 서비스
- **Server (가상서버)**: AI API 서버
- **Load Balancer**: 트래픽 분산
- **Object Storage**: 이미지 저장
- **Database**: 사용자 데이터
- **CDN**: 빠른 응답

### 2. 비용 구조 (월 기준)
| 서비스 | 사양 | 비용 |
|--------|------|------|
| **Server** | 2vCPU, 4GB RAM | 50,000원 |
| **Load Balancer** | 기본 | 10,000원 |
| **Object Storage** | 100GB | 5,000원 |
| **Database** | MySQL 5.7 | 20,000원 |
| **CDN** | 1TB 전송 | 15,000원 |
| **총 비용** | | **100,000원** |

## 🔧 배포 단계

### 1. NCP 콘솔 설정
```bash
# 1. NCP 콘솔 접속
https://console.ncloud.com/

# 2. 프로젝트 생성
# 3. 서비스 활성화
# 4. API 키 발급
```

### 2. 환경 변수 설정
```bash
# .env 파일 생성
NCP_ACCESS_KEY=your_ncp_access_key
NCP_SECRET_KEY=your_ncp_secret_key
NCP_REGION=KR
OPENROUTER_API_KEY=your_openrouter_api_key
```

### 3. 서버 생성
```bash
# 1. Server > 가상서버 생성
# 2. OS: Ubuntu 20.04 LTS
# 3. 사양: 2vCPU, 4GB RAM
# 4. 스토리지: 50GB SSD
# 5. 네트워크: 기본 VPC
```

### 4. Docker 설치
```bash
# 서버 접속 후
ssh root@your_server_ip

# Docker 설치
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Docker Compose 설치
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

### 5. 애플리케이션 배포
```bash
# 1. 코드 업로드
scp -r ai-server/ root@your_server_ip:/opt/

# 2. 서버 접속
ssh root@your_server_ip

# 3. 디렉토리 이동
cd /opt/ai-server

# 4. 환경 변수 설정
cp env.example .env
nano .env

# 5. Docker Compose 실행
docker-compose -f ncp-deploy.yml up -d
```

### 6. Load Balancer 설정
```bash
# 1. NCP 콘솔 > Load Balancer 생성
# 2. 타겟 그룹 설정
# 3. 헬스 체크 설정
# 4. 리스너 설정 (HTTP/HTTPS)
```

### 7. Object Storage 설정
```bash
# 1. NCP 콘솔 > Object Storage 생성
# 2. 버킷 생성: ggumgyeol-dream-images
# 3. 접근 권한 설정
# 4. CDN 연결
```

## 📊 모니터링

### 1. 서버 모니터링
```bash
# 실시간 로그 확인
docker-compose -f ncp-deploy.yml logs -f api

# 서버 상태 확인
curl http://your_server_ip:8000/health
```

### 2. NCP 콘솔 모니터링
- **Server**: CPU, 메모리 사용률
- **Load Balancer**: 트래픽, 응답 시간
- **Object Storage**: 저장량, 전송량
- **Database**: 연결 수, 쿼리 성능

## 🔒 보안 설정

### 1. 방화벽 설정
```bash
# NCP 콘솔 > ACG 설정
# 허용 포트: 22 (SSH), 80 (HTTP), 443 (HTTPS)
# 차단 포트: 8000 (직접 접근 차단)
```

### 2. SSL 인증서
```bash
# Let's Encrypt 인증서 발급
certbot --nginx -d your-domain.com

# 자동 갱신 설정
crontab -e
0 12 * * * /usr/bin/certbot renew --quiet
```

## 💰 비용 최적화

### 1. 서버 최적화
```bash
# 불필요한 서비스 제거
systemctl disable apache2
systemctl disable mysql

# 로그 로테이션 설정
logrotate /etc/logrotate.d/docker
```

### 2. 스토리지 최적화
```bash
# 이미지 압축
find /opt/ai-server/images -name "*.jpg" -exec jpegoptim --max=80 {} \;

# 로그 정리
find /var/log -name "*.log" -mtime +7 -delete
```

### 3. CDN 최적화
```bash
# 캐시 설정
# 정적 파일: 1년
# API 응답: 1시간
# 이미지: 1주일
```

## 🚨 문제 해결

### 1. 서버 연결 실패
```bash
# 방화벽 확인
ufw status

# 포트 확인
netstat -tlnp | grep :8000

# 서비스 상태 확인
docker-compose -f ncp-deploy.yml ps
```

### 2. Object Storage 오류
```bash
# 권한 확인
aws s3 ls s3://ggumgyeol-dream-images --endpoint-url=https://kr.object.ncloudstorage.com

# 연결 테스트
curl -I https://kr.object.ncloudstorage.com/ggumgyeol-dream-images/
```

### 3. 성능 문제
```bash
# 리소스 사용률 확인
htop
df -h
free -h

# 로그 분석
tail -f /var/log/nginx/access.log
```

## 📈 확장 계획

### 1. 수평 확장
```bash
# 추가 서버 생성
# Load Balancer에 추가
# 데이터베이스 클러스터링
```

### 2. 수직 확장
```bash
# 서버 사양 업그레이드
# 4vCPU, 8GB RAM
# 100GB SSD
```

### 3. 지역 확장
```bash
# 다른 지역에 서버 배포
# 글로벌 CDN 연결
# 데이터 동기화
```

## 📞 지원

- **NCP 고객센터**: 1588-3816
- **기술 문서**: https://guide.ncloud-docs.com/
- **커뮤니티**: https://www.ncloud.com/community/
