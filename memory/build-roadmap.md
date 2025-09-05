# 꿈결 서비스 구축 로드맵

## 🚀 Phase 1: MVP 개발 (v1.0) - 8-12주

### Week 1-2: 프로젝트 설정 및 인프라
- [ ] React Native 프로젝트 초기화
- [ ] FastAPI 백엔드 프로젝트 설정
- [ ] PostgreSQL 데이터베이스 스키마 구현
- [ ] Docker 컨테이너 설정
- [ ] CI/CD 파이프라인 구축 (GitHub Actions)

### Week 3-4: F-AUTH (사용자 인증)
- [ ] Firebase Authentication 연동
- [ ] 소셜 로그인 (Google, Apple) 구현
- [ ] 온보딩 4단계 화면 개발
- [ ] 알림 설정 기능
- [ ] JWT 토큰 관리 시스템

### Week 5-6: F-JOURNAL (꿈 기록)
- [ ] 꿈 기록 화면 UI/UX 구현
- [ ] 텍스트 입력 및 음성 녹음 기능
- [ ] 감정 태그 시스템
- [ ] 상징 태그 자동완성
- [ ] 선명도 슬라이더
- [ ] 파일 업로드 (음성) 시스템

### Week 7-8: F-INSIGHT (AI 분석)
- [ ] Gemini API 연동
- [ ] AI 분석 워커 (Celery) 구현
- [ ] 분석 결과 5개 섹션 구조화
- [ ] 패턴 대시보드 (감정 달력, 상징 구름)
- [ ] 푸시 알림 시스템

### Week 9-10: F-EXPAND (성찰과 확장)
- [ ] 꿈의 바다 (익명 공유) 기능
- [ ] 성찰 질문 시스템
- [ ] 콘텐츠 필터링 시스템
- [ ] 공유 콘텐츠 관리

### Week 11-12: 통합 및 테스트
- [ ] 전체 시스템 통합 테스트
- [ ] 성능 최적화
- [ ] 보안 검토
- [ ] 사용자 테스트 및 피드백 반영

## 🎨 Phase 2: 고도화 (v1.1) - 6-8주

### Week 13-14: F-DEJAVU (데자뷰 분석)
- [ ] 꿈의 네트워크 알고리즘 구현
- [ ] Semantic Vector Embedding 시스템
- [ ] Random Walk with Restart 알고리즘
- [ ] 데자뷰 점수 계산 시스템

### Week 15-16: F-COMM (커뮤니티)
- [ ] 커뮤니티 게시물 시스템
- [ ] 해몽 남기기 기능
- [ ] 공감 시스템
- [ ] 사용자 보호 기능 (신고, 차단)

### Week 17-18: F-VISUAL (꿈 시각화)
- [ ] 생성형 AI 이미지 생성
- [ ] 아트 스타일 선택 기능
- [ ] 꿈 갤러리 시스템
- [ ] 이미지 공유 템플릿

### Week 19-20: M-PLAN (수익화)
- [ ] 구독 모델 구현
- [ ] 인앱 결제 시스템 (RevenueCat)
- [ ] 사용량 추적 시스템
- [ ] 업그레이드 유도 UI

## 📈 Phase 3: 확장 (v2.0) - 8-10주

### Week 21-24: 고급 분석
- [ ] 꿈-현실 연결고리 분석
- [ ] 고급 패턴 분석
- [ ] 상관관계 분석
- [ ] 예측 모델링

### Week 25-28: 플랫폼 확장
- [ ] 웹 버전 개발
- [ ] API 공개
- [ ] 심리 상담사 연계
- [ ] 웨어러블 연동

### Week 29-30: 글로벌화
- [ ] 다국어 지원
- [ ] 지역별 맞춤화
- [ ] 글로벌 결제 시스템
- [ ] 현지화

## 🛠️ 기술 스택 상세

### Frontend
- **React Native**: 크로스 플랫폼 모바일 앱
- **TypeScript**: 타입 안전성
- **Zustand**: 상태 관리
- **TanStack Query**: 서버 상태 관리
- **React Navigation**: 네비게이션
- **Lottie**: 애니메이션

### Backend
- **FastAPI**: 고성능 Python 웹 프레임워크
- **PostgreSQL**: 관계형 데이터베이스
- **Celery**: 비동기 작업 큐
- **Redis**: 캐싱 및 메시지 브로커
- **SQLAlchemy**: ORM
- **Alembic**: 데이터베이스 마이그레이션

### AI & ML
- **Google Gemini API**: 꿈 분석
- **ko-sbert-nli**: 한국어 임베딩
- **NetworkX**: 그래프 분석
- **NumPy/SciPy**: 수치 계산

### Infrastructure
- **Docker**: 컨테이너화
- **GCP/AWS**: 클라우드 인프라
- **GitHub Actions**: CI/CD
- **Sentry**: 에러 모니터링
- **Prometheus + Grafana**: 메트릭 모니터링

## 📊 성공 지표

### v1.0 목표
- D7 리텐션: 40%
- 주간 꿈 기록률: 60%
- AI 분석 요청 비율: 80%
- 앱 크래시 프리 유저: >99.5%

### v1.1 목표
- 무료-유료 전환율: 15%
- 월간 반복 매출(MRR): 1억원
- 고객 이탈률: <5%
- 커뮤니티 게시물 생성률: 30%


