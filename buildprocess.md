
## **꿈결(DreamTracer) v1.0 통합 아키텍처 및 실행 계획서**

### **1.0 목표 및 원칙**

  * **목표:** '꿈결 서비스 개발 명세서 v1.0'을 기준으로 시스템 아키텍처를 확정하고, 모든 기능 구현을 위한 상세 기술 계획을 수립한다.
  * **핵심 원칙:**
      * **PRD Adherence:** 모든 기술 결정은 PRD의 요구사항을 최우선으로 만족시킨다.
      * **Scalability & Maintainability:** 서비스 성장에 유연하게 대응하고, 유지보수가 용이한 구조를 채택한다.
      * **Asynchronous Processing:** AI 분석 등 시간이 소요되는 작업은 비동기 처리를 통해 사용자 경험(UX) 저하를 방지한다.
      * **Robustness:** 상세한 오류 처리, 테스트 자동화, 모니터링을 통해 서비스 안정성을 확보한다.

### **2.0 최종 시스템 아키텍처 (PRD 기준 통합)**

PRD의 기술 스택을 기반으로 최종 아키텍처를 아래와 같이 확정합니다.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         꿈결(DreamTracer) - 통합 시스템 아키텍처              │
└─────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────┐                ┌───────────────────────────┐
│     Mobile Client      │                │     Infrastructure (GCP/AWS) │
│    (React Native)      │                 └───────────────────────────┘
└────────────┬───────────┘                             │
             │ REST API (HTTPS)                        │
             ▼                                         │
┌────────────┴───────────┐              ┌───────────────┴───────────────┐
│   Load Balancer + WAF  │              │           Cloud Services      │
└────────────┬───────────┘              └───────────────────────────────┘
             │                                         │
             ▼                                ┌────────┴────────┐   ┌──────────┐
┌────────────┴───────────┐              │  Object Storage │◀┤ LLM API  │
│   Python Backend API   │◀───────────▶│  (S3 / GCS)     │   │(Gemini)  │
│       (FastAPI)        │              └────────┬────────┘   └──────────┘
└────────────┬───────────┘                      │ (Audio Files)
             │                                    │
    ┌────────┼───────────────────────────────┐    │
    │(DB)    │(Task Queue)                   │    │
    ▼        ▼                               │    │
┌───┴────┐ ┌────────┴────────┐  ┌───────────┴──────────┐
│  PostgreSQL │ │  Message Broker │  │    AI Worker Process   │
│ (Cloud SQL) │ │ (RabbitMQ/Redis)│──▶│       (Celery)       │
└─────────┘ └─────────────────┘  └──────────────────────┘
```

### **3.0 기술 스택 및 라이브러리 (최종 확정)**

  * **Frontend:** React Native, TypeScript, Zustand (State Management), TanStack Query (Server State), Axios, React Navigation
  * **Backend:** Python, FastAPI, Pydantic, SQLAlchemy (ORM), Alembic (DB Migration), Celery (Task Queue), Uvicorn
  * **Database:** PostgreSQL (Cloud SQL or AWS RDS)
  * **AI Engine:** Google Gemini API (Fine-tuning 예정), Google Speech-to-Text
  * **Infrastructure:** GCP (Cloud Run, Cloud SQL, GCS) or AWS (ECS, RDS, S3), Docker, Terraform
  * **Authentication:** Firebase Authentication (JWT 기반)
  * **CI/CD:** GitHub Actions
  * **Monitoring:** Sentry (Error Tracking), Prometheus + Grafana (Metrics), CloudWatch/Cloud Logging

### **4.0 페이지/화면별 상세 실행 계획**

각 화면을 기준으로 컴포넌트, 상태, API 연동, 애니메이션 효과까지 상세하게 정의합니다.

#### **4.1 F-AUTH: 사용자 인증 및 온보딩**

  * **페이지 구성:**

    1.  **Splash Screen:** 앱 로고, 버전 정보. (애니메이션: Lottie로 부드러운 등장)
    2.  **Login Screen:** 소셜 로그인 버튼 (Google, Apple), 이메일 로그인/가입 이동 버튼.
    3.  **Onboarding Screens (4단계):** `ScrollView`와 `Paging`을 이용한 스와이프 인터페이스.
          * **컴포넌트:** `SlideIndicator` (점 4개), `Illustration`, `HeadlineText`, `BodyText`, `SkipButton`.
          * **효과:** 스와이프 시 다음 일러스트와 텍스트가 Parallax 효과로 나타남.
    4.  **Notification Setup Screen:** OS 네이티브 시간 설정 UI 호출, 알림 권한 요청.

  * **상태 관리 (Zustand):**

      * `authStore`: `isAuthenticated`, `user`, `jwtToken`, `isLoading`.

  * **API 연동:**

    1.  `POST /api/auth/social-login`: 소셜 로그인 후 받은 토큰으로 서버에 JWT 요청.
    2.  `POST /api/users/me/settings`: 알림 시간 설정 정보 서버에 저장.

#### **4.2 F-JOURNAL: 꿈 기록**

  * **페이지 구성:**

    1.  **Dream Journal Screen (`JournalWriteScreen`):**
          * **컴포넌트:**
              * `CustomHeader`: '취소', '저장' 버튼 포함. 저장 버튼은 `isSaveButtonActive` 상태에 따라 활성화/비활성화.
              * `TitleInput`: `TextInput` 컴포넌트, 최대 100자 제한.
              * `BodyInput`: `TextInput` (multiline), 최대 10,000자, 자동 높이 조절.
              * `EmotionPalette`: 8개 감정 `Pressable` 아이콘. 선택 시 `transform: scale(1.1)` 효과 및 색상 변경.
              * `TagInput`: 사용자가 태그 입력 시, 기존 태그 목록(`GET /api/tags`)을 기반으로 자동완성 드롭다운 표시.
              * `LuciditySlider`: 1-5단계 슬라이더 컴포넌트.
              * `VoiceRecorder`:
                  * 녹음 버튼: Lottie 애니메이션으로 녹음 중임을 표시 (파형 시각화).
                  * 상태: `idle`, `recording`, `recorded`.
                  * 녹음된 파일은 재생, 삭제 가능.
          * **효과:** 저장 버튼 클릭 시, 버튼에서 체크 아이콘으로 Morphing 애니메이션 후 "당신의 꿈 조각이 안전하게 보관되었습니다." 토스트 메시지 페이드 인/아웃.

  * **상태 관리 (Zustand):**

      * `journalStore`: `title`, `body`, `selectedEmotions`, `tags`, `lucidity`, `audioFilePath`, `isRecording`, `isSaveButtonActive`. (본문 또는 음성 녹음 시 `isSaveButtonActive`를 `true`로 변경)

  * **API 연동:**

    1.  `POST /api/dreams`: '저장' 버튼 클릭 시, `FormData`를 사용해 텍스트 데이터와 음성 파일(M4A)을 함께 전송.
    2.  **백엔드 로직:**
          * API는 요청을 즉시 수신하고 `{"status": "processing"}`과 함께 `dream_id`를 반환. (UX 응답성 확보)
          * 음성 파일은 GCS/S3에 업로드.
          * AI 분석 작업(`dream_id` 포함)을 Celery Task Queue에 등록.
          * 사용자에게는 즉시 꿈 목록 화면으로 이동시키고, 방금 작성한 꿈은 "분석 중..." 상태로 표시.

#### **4.3 F-INSIGHT: AI 꿈 분석 및 통찰**

  * **페이지 구성:**

    1.  **Dream Detail Screen (`AnalysisReportScreen`):**

          * **컴포넌트:**
              * `LoadingState`: "당신의 무의식을 탐험하는 중..." 텍스트와 함께 Lottie 애니메이션 표시.
              * `AccordionSection`: '한 줄 요약', '핵심 상징 해석' 등 5개 섹션. `LayoutAnimation`을 사용하여 부드럽게 열고 닫힘.
              * `KeywordChip`: `#성장`, `#불안` 등 클릭 가능한 키워드.
              * `DreamVisualizeButton`: '꿈 시각화' 버튼.
          * **효과:** 데이터 로딩 완료 후, 각 섹션이 순차적으로 Fade-in 되며 나타남.

    2.  **Pattern Dashboard Screen:**

          * **컴포넌트:**
              * `EmotionCalendar`: `react-native-calendars` 라이브러리 커스터마이징. 각 날짜의 배경색을 해당일의 주요 감정 색으로 채움.
              * `SymbolCloud`: `d3.js` 또는 순수 계산을 통해 태그 빈도에 따라 텍스트 크기와 색 농도를 다르게 표시. 태그 클릭 시 `onTagPress` 콜백 실행.
              * `EmotionSymbolChart`: `react-native-svg-charts`를 사용한 관계도 시각화.
          * **효과:** 차트 데이터 변경 시 부드러운 트랜지션 효과 적용.

  * **상태 관리 (Zustand & TanStack Query):**

      * `TanStack Query`: `GET /api/dreams/{id}/analysis` API를 주기적으로(`refetchInterval`) 호출하여 분석 완료 여부 확인. 캐싱을 통해 화면 재진입 시 빠른 로딩 지원.
      * `patternStore`: 대시보드의 기간(월별/주별) 상태 관리.

  * **API 연동 및 데이터 흐름:**

    1.  **AI 분석 완료:** Celery Worker가 Gemini API 호출, 결과 처리 후 `dream_analyses` 테이블에 결과 저장 및 `dreams` 테이블의 상태를 'completed'로 업데이트.
    2.  **푸시 알림:** 분석 완료 후, Firebase Cloud Messaging(FCM)을 통해 사용자에게 "꿈 분석이 완료되었어요\!" 알림 전송.
    3.  `GET /api/dreams/{id}/analysis`: 상세 리포트 데이터 요청.
    4.  `POST /api/visualize`: '꿈 시각화' 버튼 클릭 시, 꿈의 텍스트와 키워드를 전송하여 이미지 생성 요청. (이 역시 비동기 처리)
    5.  `GET /api/patterns?period=monthly&date=...`: 월별 패턴 데이터 요청.

### **5.0 데이터베이스 스키마 (PostgreSQL)**

Firestore 스키마를 관계형 모델로 변환하고, PRD 요구사항에 맞춰 정교화합니다.

```sql
-- users: 사용자 정보
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    auth_provider VARCHAR(50) NOT NULL,
    notification_settings JSONB, -- {"time": "08:00", "enabled": true}
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- dreams: 꿈 기록 원본
CREATE TABLE dreams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    dream_date DATE NOT NULL,
    title VARCHAR(100),
    body_text TEXT,
    audio_file_path VARCHAR(512),
    lucidity_level SMALLINT CHECK (lucidity_level BETWEEN 1 AND 5),
    analysis_status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON dreams(user_id, dream_date DESC);

-- tags, emotions: 태그 및 감정 (마스터 데이터)
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);
CREATE TABLE emotions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) UNIQUE NOT NULL
);

-- dream_tags, dream_emotions: 꿈과 태그/감정의 다대다 관계
CREATE TABLE dream_tags (
    dream_id UUID REFERENCES dreams(id) ON DELETE CASCADE,
    tag_id INT REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (dream_id, tag_id)
);
CREATE TABLE dream_emotions (
    dream_id UUID REFERENCES dreams(id) ON DELETE CASCADE,
    emotion_id INT REFERENCES emotions(id) ON DELETE CASCADE,
    PRIMARY KEY (dream_id, emotion_id)
);

-- dream_analyses: AI 분석 결과
CREATE TABLE dream_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dream_id UUID UNIQUE REFERENCES dreams(id) ON DELETE CASCADE,
    summary_text TEXT,
    keywords JSONB, -- ["성장", "불안"]
    emotional_flow_text TEXT,
    symbol_analysis JSONB, -- [{"symbol": "물", "meaning": "..."}, ...]
    reflective_question TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### **6.0 개발 및 배포 워크플로우 (CI/CD)**

1.  **브랜치 전략 (Git Flow):**

      * `main`: 프로덕션 배포 브랜치.
      * `develop`: 다음 릴리즈를 위한 통합 브랜치.
      * `feature/{feature-name}`: 기능 개발 브랜치.

2.  **GitHub Actions 파이프라인 (`.github/workflows/deploy.yml`):**

      * **Trigger:** `feature` 브랜치에서 `develop`으로 Pull Request 생성 시.
      * **Jobs:**
        1.  **Lint & Test:**
              * Frontend: `npm install`, `npx eslint .`, `npx jest`.
              * Backend: `pip install -r requirements.txt`, `pytest`.
        2.  **Build:**
              * Backend: `Dockerfile`을 사용하여 FastAPI 애플리케이션 Docker 이미지 빌드.
        3.  **Push:** 빌드된 이미지를 Google Artifact Registry / AWS ECR에 푸시.
      * **Merge & Deploy:**
          * PR이 `develop`에 머지되면, Staging 환경(GCP Cloud Run)에 자동 배포.
          * `develop`에서 `main`으로 PR 생성 및 머지 시, Production 환경에 수동 승인(Approval) 후 배포.
