# 꿈결 (DreamTracer) - AI 기반 꿈 분석 플랫폼

## 📖 프로젝트 개요

꿈결은 AI 기술을 활용하여 사용자의 꿈을 분석하고 인사이트를 제공하는 모바일 애플리케이션입니다. 꿈을 기록하고, AI로 분석하며, 시각화하고, 커뮤니티에서 공유할 수 있는 종합적인 꿈 관리 플랫폼입니다.

## ✨ 주요 기능

### 🔐 F-AUTH: 인증 시스템
- Firebase Authentication 통합
- Google, Apple, Facebook 소셜 로그인
- 4단계 온보딩 프로세스
- JWT 기반 보안 인증

### 📝 F-JOURNAL: 꿈 기록
- 텍스트/음성 꿈 기록
- 12가지 감정 태그 시스템
- 명료도 슬라이더 (1-5단계)
- 상세 정보 기록 (장소, 인물, 상징)
- 꿈 타입 분류 (일반, 자각몽, 악몽, 반복)
- 수면 품질 평가

### 🧠 F-INSIGHT: AI 분석
- Google Gemini API 기반 꿈 분석
- 꿈 요약 및 키워드 추출
- 감정 흐름 분석
- 상징 해석
- 데자뷰 분석 (유사한 꿈 찾기)
- 개인화된 반성적 질문
- 꿈 패턴 분석
- 꿈 네트워크 분석

### 🎨 F-EXPAND: 꿈 확장
- 10가지 미술 스타일로 꿈 시각화
- 시각화 갤러리 및 관리
- 커뮤니티 "별무리 해몽"
- 익명 꿈 공유
- 태그 기반 분류 및 검색
- 인기 태그 시스템

### 💳 M-PLAN: 수익화 모델
- 무료 플랜: 월 5회 AI 분석
- 꿈결 플러스: 무제한 AI 분석 (5,900원/월)
- AI 분석 사용량 추적
- 구독 상태 관리

## 🏗️ 기술 스택

### Frontend
- **React Native 0.81.1** - 크로스 플랫폼 모바일 앱
- **TypeScript 5.0+** - 타입 안전성
- **Zustand** - 상태 관리
- **TanStack Query** - 서버 상태 관리
- **React Navigation 6.x** - 네비게이션
- **Lottie** - 애니메이션
- **React Native Audio Recorder Player** - 음성 녹음

### Backend
- **Python 3.11** - 백엔드 언어
- **FastAPI 0.116.1** - 웹 프레임워크
- **SQLAlchemy 2.0+** - ORM
- **PostgreSQL** - 데이터베이스
- **Redis** - 캐싱 및 메시지 브로커
- **Celery** - 비동기 작업 큐
- **Alembic** - 데이터베이스 마이그레이션

### AI/ML
- **Google Gemini API** - 꿈 분석
- **ko-sbert-nli** - 한국어 임베딩 모델
- **NetworkX** - 그래프 분석
- **NumPy/SciPy** - 수치 계산

### Infrastructure
- **Docker** - 컨테이너화
- **GitHub Actions** - CI/CD
- **GCP/AWS** - 클라우드 인프라
- **Sentry** - 에러 추적
- **Prometheus + Grafana** - 모니터링

## 🚀 설치 및 실행

### 사전 요구사항
- Node.js 18+
- Python 3.11+
- PostgreSQL 15+
- Redis 6.4+
- Docker (선택사항)

### 백엔드 설정

```bash
# 백엔드 디렉토리로 이동
cd DreamTracerBackend

# 가상환경 생성 및 활성화
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# 환경 변수 설정
cp env.example .env
# .env 파일을 편집하여 필요한 값들을 설정

# 데이터베이스 마이그레이션
alembic upgrade head

# 서버 실행
uvicorn app.main:app --reload
```

### 프론트엔드 설정

```bash
# 프론트엔드 디렉토리로 이동
cd DreamTracerApp

# 의존성 설치
npm install

# iOS 시뮬레이션 실행
npx react-native run-ios

# Android 에뮬레이터 실행
npx react-native run-android
```

### Docker를 사용한 실행

```bash
# 프로젝트 루트에서
docker-compose up -d
```

## 📁 프로젝트 구조

```
ggumgyeol/
├── DreamTracerBackend/          # 백엔드 API
│   ├── app/
│   │   ├── api/v1/endpoints/    # API 엔드포인트
│   │   ├── core/                # 핵심 설정
│   │   ├── models/              # 데이터베이스 모델
│   │   ├── schemas/             # Pydantic 스키마
│   │   ├── services/            # 비즈니스 로직
│   │   └── workers/             # Celery 작업
│   ├── alembic/                 # 데이터베이스 마이그레이션
│   └── tests/                   # 테스트
├── DreamTracerApp/              # React Native 앱
│   ├── src/
│   │   ├── components/          # 재사용 가능한 컴포넌트
│   │   ├── screens/             # 화면 컴포넌트
│   │   ├── navigation/          # 네비게이션 설정
│   │   ├── stores/              # Zustand 스토어
│   │   ├── services/            # API 서비스
│   │   ├── types/               # TypeScript 타입
│   │   └── utils/               # 유틸리티 함수
│   └── __tests__/               # 테스트
├── .github/workflows/           # CI/CD 파이프라인
└── docker-compose.yml           # Docker 설정
```

## 🧪 테스트

### 백엔드 테스트
```bash
cd DreamTracerBackend
pytest tests/ -v
```

### 프론트엔드 테스트
```bash
cd DreamTracerApp
npm test
```

### 통합 테스트
```bash
# 백엔드 통합 테스트
cd DreamTracerBackend
pytest tests/test_integration.py -v

# 프론트엔드 통합 테스트
cd DreamTracerApp
npm test -- --testPathPattern=integration
```

## 📊 API 문서

서버 실행 후 다음 URL에서 API 문서를 확인할 수 있습니다:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🔧 환경 변수

### 백엔드 (.env)
```env
# 데이터베이스
DATABASE_URL=postgresql://user:password@localhost:5432/dreamtracer
REDIS_URL=redis://localhost:6379/0

# 인증
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# AI 서비스
GEMINI_API_KEY=your-gemini-api-key

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:3000", "http://localhost:8081"]
```

## 🚀 배포

### 개발 환경
```bash
# Docker Compose 사용
docker-compose up -d
```

### 프로덕션 환경
1. GitHub Actions를 통한 자동 배포
2. GCP/AWS 클라우드 인프라 사용
3. PostgreSQL Cloud SQL/AWS RDS
4. Redis Cloud/AWS ElastiCache

## 📈 모니터링

- **Sentry**: 에러 추적 및 성능 모니터링
- **Prometheus + Grafana**: 메트릭 수집 및 시각화
- **CloudWatch/Cloud Logging**: 로그 관리

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.

---

**꿈결** - 당신의 꿈을 더 깊이 이해하는 AI 파트너 🌙✨