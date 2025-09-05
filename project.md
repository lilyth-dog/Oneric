## **꿈결(DreamTracer) v1.0 제품 요구 명세서 (PRD)**

  * **문서 버전:** 1.0
  * **작성일:** 2025년 9월 5일
  * **작성자:** Gemini (Project Lead)
  * **프로젝트 상태:** 기획 완료 / v1.0 개발 착수 단계
  * **핵심 이해관계자:** 제품 책임자(PO), 리드 엔지니어(프론트엔드, 백엔드), QA 리드

-----

### **1.0 문서 개요 (Overview)**

#### **1.1. 문서 목적**

본 문서는 '꿈결(DreamTracer)' 서비스의 v1.0 개발 및 런칭을 위한 공식 기술 명세서이다. 기획, 개발(프론트엔드, 백엔드, AI), QA 등 모든 유관 부서가 프로젝트에 대한 통일된 이해를 바탕으로 업무를 수행하는 것을 목표로 한다. 본 문서는 서비스의 비전부터 개별 기능의 상세 명세, 비기능적 요구사항까지 모든 내용을 포함하는 **단일 진실 공급원(Single Source of Truth)** 역할을 한다.

#### **1.2. 프로젝트 비전 및 미션**

  * **Vision:** 꿈을 통한 자기 성찰을 정신 건강과 자기 발견의 보편적 도구로 만드는 것.
  * **Mission:** 심리학적 통찰과 직관적 기술을 결합하여, 사용자가 자신의 꿈을 안전하게 기록하고, 과학적으로 분석하며, 그 의미를 통해 삶의 지혜를 얻을 수 있는 가장 신뢰도 높은 디지털 안식처를 제공한다.

#### **1.3. 문제 정의 및 해결 방안**

  * **문제 (Problem):** 많은 사람들이 의미심장한 꿈을 꾸지만, 그 내용을 쉽게 잊어버리거나 그 의미를 체계적으로 이해할 방법을 알지 못한다. 꿈은 단편적인 기억으로 흩어지고, 그 안에 담긴 무의식의 메시지는 해석되지 못한 채 사라진다.
  * **해결 방안 (Solution):** '꿈결'은 사용자가 잠에서 깬 직후에도 쉽고 빠르게 꿈을 기록(텍스트/음성)하고, AI 기반 심층 분석을 통해 꿈의 상징과 감정 패턴을 이해하도록 돕는다. 이를 통해 사용자는 자신의 내면을 깊이 탐색하고 삶에 대한 통찰을 얻는 경험을 할 수 있다.

#### **1.4. 대상 사용자 (Target Persona)**

  * **Primary:** 20대 후반 \~ 30대 여성. 자기 성장, 심리학, 명상, 일기 쓰기 등에 관심이 많으며, 자신의 내면을 깊이 있게 탐구하고자 하는 욕구가 있다. 기술 사용에 익숙하며, 미학적으로 만족스럽고 직관적인 사용자 경험을 중시한다.
  * **Secondary:** 창의적인 영감을 얻고자 하는 아티스트/작가. 심리 상담의 보조 도구로 활용하고자 하는 심리 상담사 및 내담자.

#### **1.5. 핵심 성공 지표 (Key Success Metrics for v1.0)**

  * **제품:**
      * Day-1 / Day-7 / Day-30 리텐션 (Retention)
      * 주간 꿈 기록률 (Weekly Dream Entry Rate)
      * DAU 대비 AI 분석 요청 비율
  * **기술:**
      * API P95 응답 시간 \< 300ms
      * 앱 크래시 프리 유저(Crash-Free Users) \> 99.5%
      * 서비스 가용성 \> 99.8%

### **2.0 전체 시스템 아키텍처 (Overall System Architecture)**

#### **2.1. 아키텍처 다이어그램**

(이전 논의에서 확정된 Python/FastAPI 기반 아키텍처 다이어그램)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         꿈결(DreamTracer) - 통합 시스템 아키텍처              │
└─────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────┐                ┌───────────────────────────┐
│     Mobile Client      │                │     Infrastructure (GCP/AWS) │
│    (React Native)      │                 └───────────────────────────┘
└────────────┬───────────┘                             │
             │ REST API (HTTPS/TLS 1.3)                    │
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

#### **2.2. 기술 스택 (Tech Stack)**

  * **Frontend:** React Native, TypeScript, Zustand, TanStack Query, Axios
  * **Backend:** Python, FastAPI, Pydantic, SQLAlchemy, Alembic, Celery
  * **Database:** PostgreSQL (Cloud SQL or AWS RDS)
  * **AI Engine:** Google Gemini API
  * **Infrastructure:** GCP/AWS, Docker, Terraform
  * **Authentication:** Firebase Authentication (JWT 기반)
  * **CI/CD & Monitoring:** GitHub Actions, Sentry, Prometheus, Grafana

### **3.0 기능 명세 (Functional Specifications)**

#### **F-AUTH: 사용자 인증 및 온보딩**

  * **개요:** 사용자가 서비스를 안전하게 시작하고 핵심 가치를 인지하는 과정.
  * **사용자 스토리:**
      * "신규 사용자로서, 나는 최소한의 정보로 빠르게 가입하여 서비스를 시작하고 싶다."
      * "신규 사용자로서, 나는 앱을 어떻게 사용해야 하는지 명확하고 간결한 안내를 받고 싶다."
  * **기능 요구사항 (FR):**
      * `FR-AUTH-1`: Google, Apple 소셜 로그인을 지원해야 한다. (OAuth 2.0)
      * `FR-AUTH-2`: 이메일/비밀번호를 통한 자체 회원가입을 지원해야 한다. 비밀번호는 최소 8자, 영문/숫자/특수문자 조합이어야 한다.
      * `FR-AUTH-3`: 가입 완료 후, 4단계의 스킵 가능한 온보딩 스크린을 제공해야 한다.
      * `FR-AUTH-4`: 온보딩 마지막 단계에서 아침 알림(Push Notification) 수신 여부 및 시간을 설정할 수 있는 옵션을 제공해야 한다.
  * **데이터 흐름:**
    1.  사용자가 소셜 로그인 선택 -\> Firebase SDK가 인증 토큰 반환.
    2.  클라이언트는 Firebase 토큰을 백엔드 API (`POST /api/auth/social-login`)로 전송.
    3.  백엔드는 토큰을 검증하고, 해당 유저가 DB에 없으면 신규 생성.
    4.  백엔드는 서비스 자체 JWT(Access/Refresh Token)를 발급하여 클라이언트에 반환.
    5.  클라이언트는 JWT를 안전한 저장소(Secure Storage)에 보관.
  * **API 연동:**
      * `POST /api/auth/social-login`
      * `POST /api/auth/register` (이메일 가입)
      * `POST /api/auth/login` (이메일 로그인)
      * `POST /api/auth/refresh` (토큰 갱신)
      * `PUT /api/users/me/settings`
  * **예외 처리:**
      * `E-AUTH-1`: 네트워크 연결 실패 시, 재시도 옵션 제공.
      * `E-AUTH-2`: 소셜 로그인 취소/실패 시, 사용자에게 명확한 피드백 제공.
      * `E-AUTH-3`: 이메일 중복 시, "이미 가입된 이메일입니다." 메시지 표시.

#### **F-JOURNAL: 꿈 기록**

  * **개요:** 꿈의 내용을 다양한 형태로 기록하고 저장하는 핵심 기능.
  * **사용자 스토리:**
      * "사용자로서, 나는 잠에서 막 깼을 때도 쉽게 꿈 내용을 텍스트와 음성으로 기록하고 싶다."
      * "사용자로서, 나는 꿈에서 느낀 감정과 기억나는 상징을 직관적으로 태그하고 싶다."
  * **기능 요구사항 (FR):**
      * `FR-JRNL-1`: 꿈의 제목(최대 100자)과 본문(최대 10,000자)을 텍스트로 입력할 수 있다.
      * `FR-JRNL-2`: 최대 5분 길이의 음성을 녹음하여 첨부할 수 있다. 녹음 파일은 M4A 형식, 128kbps 비트레이트로 인코딩되어 서버에 저장된다.
      * `FR-JRNL-3`: 시스템은 8개의 기본 감정(기쁨, 슬픔, 불안, 평온, 혼란, 분노, 설렘, 공포)을 제공하며, 사용자는 다중 선택할 수 있다.
      * `FR-JRNL-4`: 사용자는 자유롭게 텍스트로 상징 태그를 입력할 수 있으며(태그당 최대 20자, 최대 10개), 입력 시 기존에 사용했던 태그를 자동완성으로 추천해야 한다.
      * `FR-JRNL-5`: 사용자는 1\~5단계의 슬라이더를 통해 꿈의 선명도를 기록할 수 있다.
      * `FR-JRNL-6`: 꿈 기록 날짜는 기본적으로 오늘 날짜로 설정되지만, 사용자가 변경할 수 있어야 한다.
      * `FR-JRNL-7`: 본문, 음성 중 하나 이상이 입력되면 '저장' 버튼이 활성화되어야 한다.
  * **데이터 흐름:**
    1.  사용자가 '저장' 버튼 클릭.
    2.  클라이언트는 `multipart/form-data` 형식으로 텍스트 데이터(제목, 본문 등)와 오디오 파일을 `POST /api/dreams` API로 전송.
    3.  백엔드는 요청을 수신하고 유효성 검사 수행.
    4.  오디오 파일은 Object Storage(GCS/S3)에 업로드하고, 경로를 DB에 저장.
    5.  꿈 관련 메타데이터는 `dreams` 및 관련 테이블에 저장. `analysis_status`는 'pending'으로 초기화.
    6.  AI 분석을 위한 Task를 `dream_id`와 함께 Message Broker에 발행(publish).
    7.  백엔드는 클라이언트에 `202 Accepted` 응답과 함께 생성된 `dream_id`를 반환.
  * **API 연동:**
      * `POST /api/dreams`
      * `PUT /api/dreams/{id}`
      * `GET /api/tags/autocomplete?q={query}`
  * **예외 처리:**
      * `E-JRNL-1`: 저장 시도 시 본문과 음성 모두 비어있으면, "꿈의 내용을 입력하거나 녹음해주세요." 메시지 표시.
      * `E-JRNL-2`: 녹음 중 네트워크 연결이 끊어지면, 임시 저장 후 연결 시 재전송을 시도하는 로직 필요.
      * `E-JRNL-3`: 파일 업로드 실패 시, 서버는 5xx 에러를 반환하고 클라이언트는 재시도 옵션을 제공.

#### **F-INSIGHT: AI 꿈 분석 및 통찰**

  * **개요:** 저장된 꿈 기록을 AI가 분석하여 심리학적 통찰을 제공하는 기능.
  * **사용자 스토리:**
      * "사용자로서, 나는 내가 기록한 꿈이 어떤 의미를 가지는지 심리학에 기반한 해석을 보고 싶다."
      * "사용자로서, 나는 내 꿈에 반복적으로 나타나는 패턴을 시각적으로 확인하고 싶다."
  * **기능 요구사항 (FR):**
      * `FR-INSI-1`: 꿈 저장 완료 후, 백그라운드에서 AI 분석이 진행되어야 한다. 분석 완료 시 사용자에게 푸시 알림을 보낸다.
      * `FR-INSI-2`: 분석 리포트는 '한 줄 요약', '핵심 키워드', '감정 흐름 분석', '핵심 상징 해석', '현실과의 연결고리(성찰 질문)'의 5개 섹션으로 구성된다.
      * `FR-INSI-3`: '패턴 대시보드'에서는 월별 '감정 달력', '상징 구름', '감정-상징 관계도'를 시각화하여 제공해야 한다.
      * `FR-INSI-4`: '상징 구름'에서 특정 상징을 클릭하면, 해당 상징이 포함된 꿈 목록 페이지로 이동해야 한다.
  * **데이터 흐름 (AI Worker):**
    1.  Celery Worker가 Message Broker로부터 분석 Task(w/ `dream_id`)를 수신(consume).
    2.  Worker는 `dreams` 테이블의 `analysis_status`를 'processing'으로 업데이트.
    3.  Worker는 `dream_id`로 원본 꿈 데이터(텍스트, 태그, 감정 등)를 DB에서 조회.
    4.  정제된 프롬프트를 구성하여 Google Gemini API로 분석 요청.
    5.  Gemini API로부터 받은 분석 결과를 파싱하고 5개 섹션에 맞게 구조화.
    6.  구조화된 결과를 `dream_analyses` 테이블에 저장.
    7.  `dreams` 테이블의 `analysis_status`를 'completed'로 업데이트.
    8.  FCM 등을 통해 사용자에게 분석 완료 푸시 알림 발송.
  * **API 연동:**
      * `GET /api/dreams/{id}/analysis`
      * `GET /api/patterns/emotions?period=monthly&date=2025-09`
      * `GET /api/patterns/symbols?period=monthly&date=2025-09`
  * **예외 처리:**
      * `E-INSI-1`: AI API 호출 실패 시, 지수 백오프(exponential backoff)를 적용하여 최대 3회 재시도.
      * `E-INSI-2`: 최종 분석 실패 시, `dreams` 테이블의 `analysis_status`를 'failed'로 업데이트하고 사용자에게 "분석 중 오류가 발생했습니다." 메시지 표시.

#### **F-EXPAND: 성찰과 확장**

  * **개요:** 통찰을 넘어 사용자의 능동적 참여를 통해 자기 이해를 심화시키는 확장 기능.
  * **사용자 스토리:**
      * "사용자로서, 나는 나와 비슷한 꿈을 꾼 다른 사람들의 이야기가 궁금하지만, 내 프라이버시는 완벽히 보호받고 싶다." (꿈의 바다)
  * **기능 요구사항 (FR):**
      * `FR-EXPD-1` (꿈의 바다):
          * 꿈 기록 시, 내용을 '꿈의 바다'에 익명으로 공유할 수 있는 옵션을 제공.
          * 공유된 내용은 작성자 정보 없이 텍스트와 관련 상징 태그만 표시.
          * 댓글, 좋아요 등 일체의 소셜 상호작용 기능은 제공하지 않음.
          * 개인정보(이름, 전화번호 등) 및 비속어 필터링 시스템이 적용되어야 함.
      * `FR-EXPD-2` (성찰 질문):
          * AI 분석 결과에 따라, 개인화된 성찰 질문이 매일 1개씩 홈 화면에 카드 형태로 제공.
          * 사용자는 질문에 대한 답변을 기록할 수 있으며, 이는 원본 꿈 기록과 연결되어 저장됨.
  * **API 연동:**
      * `GET /api/shared-dreams`
      * `POST /api/reflections`
  * **예외 처리:**
      * `E-EXPD-1`: 공유 콘텐츠에 필터링 시스템이 탐지한 민감 정보가 포함된 경우, 공유를 막고 사용자에게 알림.

-----

#### **F-DEJAVU: 데자뷰 분석**

  * **개요:** 새로운 꿈 기록이 기존의 어떤 꿈들과 주제적, 감정적, 상징적으로 유사한지를 AI가 자동으로 분석하여 연결고리를 찾아주는 기능. 사용자가 인지하지 못했던 잠재의식 속 반복 패턴을 발견하도록 돕는다.
  * **사용자 스토리:**
      * "사용자로서, 나는 새로 꾼 꿈이 과거의 어떤 꿈과 기묘하게 닮았는지 자동으로 알려주었으면 좋겠다. 이를 통해 내 무의식이 반복적으로 보내는 신호를 파악하고 싶다."
  * **기능 요구사항 (FR):**
      * `FR-DV-1`: 신규 꿈에 대한 1차 AI 분석(`F-INSIGHT`)이 완료된 후, 비동기적으로 데자뷰 분석이 실행되어야 한다.
      * `FR-DV-2`: 시스템은 신규 꿈과 가장 연관성이 높은 과거의 꿈을 최대 3개까지 식별해야 한다.
      * `FR-DV-3`: 분석 결과에는 각 데자뷰 꿈과의 '유사도 점수'(Deja Vu Score)와 함께, 두 꿈을 연결하는 \*\*핵심 요소(상징, 감정, 키워드)\*\*가 명시되어야 한다.
      * `FR-DV-4`: 사용자의 꿈 데이터가 10개 미만일 경우, "의미있는 연결고리를 찾기 위해 꿈 기록이 더 필요해요."와 같은 안내 메시지를 표시한다.
  * **UI/UX 상호작용:**
      * 분석 리포트(`DreamDetailScreen`) 내에 '데자뷰 분석' 섹션이 추가된다.
      * 분석이 진행 중일 때는 "과거의 꿈들과 연결고리를 찾는 중..." 상태를 표시한다.
      * 완료되면, 연결된 과거 꿈의 카드(제목, 날짜, 유사도 점수)가 표시되며, 터치 시 해당 꿈의 상세 페이지로 이동할 수 있다. 카드에는 연결고리가 된 상징/감정 태그가 시각적으로 강조된다.

-----

### **데자뷰 분석 시스템 기술 설계**

이 시스템의 핵심은 \*\*'꿈의 네트워크(Dream Network)'\*\*라는 이종 그래프(Heterogeneous Graph)를 구축하고, 이 그래프 상에서 정보가 어떻게 확산되는지를 시뮬레이션하여 꿈 간의 숨겨진 연관성을 찾는 것입니다.

#### **Phase 1: 데이터 준비 - 모든 꿈 요소의 Semantic 화**

단순 텍스트 매칭의 한계를 극복하기 위해, 모든 꿈의 구성 요소를 의미론적 벡터(Semantic Vector Embedding)로 변환합니다.

1.  **임베딩 모델 선택:** 한국어 자연어 처리에 특화된 `Sentence-BERT(SBERT)` 계열 모델(e.g., `ko-sbert-nli`)을 사용합니다. 이 모델은 문장의 '의미'를 벡터 공간에 표현하는 데 탁월합니다.
2.  **벡터화 대상:**
      * **꿈 본문 (Dream Body):** 꿈의 전체 텍스트를 임베딩하여 `dream_vector` 생성.
      * **핵심 상징/키워드:** 1차 분석에서 추출된 모든 상징과 키워드(e.g., '물', '쫓기다')를 각각 임베딩하여 `symbol_vector`, `keyword_vector` 생성.
3.  **저장:** 생성된 모든 벡터는 PostgreSQL의 `pgvector` 확장 기능을 사용하거나 별도의 Vector DB(e.g., Pinecone, Weaviate)에 저장하여 효율적인 유사도 검색이 가능하게 합니다.

#### **Phase 2: 꿈의 네트워크 (Dream Network) 구축**

사용자의 모든 꿈 데이터를 노드(Node)와 엣지(Edge)로 구성된 그래프로 모델링합니다. 이 작업은 주기적으로 또는 신규 꿈이 추가될 때마다 업데이트되는 배치(Batch) 작업으로 수행됩니다.

1.  **노드 (Nodes) 정의:**

      * **Dream 노드:** 개별 꿈 하나하나. (속성: `dream_id`, `dream_vector`)
      * **Element 노드:** 꿈을 구성하는 요소들.
          * **Symbol 노드:** '물', '숲', '열쇠' 등.
          * **Emotion 노드:** '불안', '기쁨' 등.
          * **Keyword 노드:** '성장', '압박감' 등 AI가 추출한 키워드.

2.  **엣지 (Edges) 정의 및 가중치 부여:**

      * **`DREAM-CONTAINS-ELEMENT` 엣지:** 특정 꿈이 특정 요소를 포함할 때 연결. (e.g., `꿈 A` -\> `상징:물`). 가중치는 1.0.
      * **`ELEMENT-SIMILAR_TO-ELEMENT` 엣지:** 요소 간의 의미론적 유사도를 기반으로 연결.
          * 두 요소 벡터 간의 \*\*코사인 유사도(Cosine Similarity)\*\*를 계산.
          * 유사도가 임계값(e.g., 0.75) 이상일 경우에만 엣지를 생성. (e.g., `상징:바다` \<-\> `상징:강`)
          * **가중치:** 코사인 유사도 점수 자체를 가중치로 사용.
          * **이 엣지가 '꿈의 네트워크'를 단순한 포함 관계 이상으로 만드는 핵심입니다.**

#### **Phase 3: 디퓨전 매트릭스 및 정보 확산 (Diffusion)**

그래프 위에서 특정 꿈의 영향력(정보)이 어떻게 퍼져나가는지를 계산합니다. 'Random Walk with Restart (RWR)' 알고리즘을 활용하는 것이 효과적입니다.

1.  **인접 행렬 (Adjacency Matrix) `A` 생성:** 구축된 '꿈의 네트워크'를 수학적으로 표현합니다. 노드가 수만 개 이상이 될 수 있으므로 반드시 \*\*희소 행렬(Sparse Matrix)\*\*로 구현해야 합니다.
2.  **전이 행렬 (Transition Matrix) `T` 계산:** 인접 행렬 `A`의 각 행을 정규화하여, 한 노드에서 다른 노드로 이동할 확률을 나타내는 행렬 `T`를 만듭니다. `T = D⁻¹A` (`D`는 각 노드의 차수(degree)를 대각 원소로 갖는 대각 행렬).
3.  **정보 확산 시뮬레이션 (Random Walk with Restart):**
      * **시작:** 새로 분석할 꿈(`D_new`)에 모든 영향력(1.0)을 집중시킨 초기 확률 벡터 `p_0`를 생성합니다.
      * **확산:** 다음 공식을 반복적으로 계산하여 `p` 벡터가 수렴할 때까지 진행합니다.
        $$p_{k+1} = (1 - \alpha) \cdot T^T \cdot p_k + \alpha \cdot p_0$$
          * `p_k`: k번째 스텝에서의 각 노드의 영향력 분포 벡터.
          * `T^T`: 전이 행렬의 전치 행렬.
          * `α (alpha)`: **재시작 확률 (Restart Probability)**. 매 스텝마다 초기 노드(`D_new`)로 되돌아올 확률. (e.g., 0.15). 이 값이 클수록 `D_new`와 직접적으로 연결된 노드에 더 높은 점수를 줍니다.
      * **결과:** 최종적으로 수렴된 벡터 `p_final`의 각 원소 값은, `D_new`에서 시작한 정보 확산 과정에서 각 노드가 얼마나 많은 영향력을 받았는지를 나타내는 \*\*'근접도 점수(Proximity Score)'\*\*가 됩니다.

#### **Phase 4: 데자뷰 꿈 식별 및 인사이트 생성**

1.  **데자뷰 꿈 순위 결정:**
      * `p_final` 벡터에서 **'Dream 노드'에 해당하는 점수**들만 추출합니다.
      * `D_new` 자신을 제외하고, 점수가 높은 순서대로 상위 1\~3개의 꿈을 '데자뷰 꿈'으로 선정합니다. 이 점수가 'Deja Vu Score'가 됩니다.
2.  **연결고리 추적:**
      * `D_new`와 선정된 데자뷰 꿈(`D_dejavu`) 사이에서, **가장 높은 영향력을 받은 'Element 노드'들**을 찾습니다. 이 노드들이 두 꿈을 잇는 가장 강력한 연결고리입니다.
      * 예를 들어, '불안'이라는 Emotion 노드와 '쫓기다'라는 Keyword 노드가 `p_final`에서 높은 점수를 받았다면, 이들이 두 꿈의 공통된 주제임을 의미합니다.

#### **API 명세 변경 제안**

기존 `GET /api/dreams/{id}/analysis` 응답에 `deja_vu_analysis` 필드를 추가합니다.

```json
{
  "id": "dream-uuid-123",
  "summary_text": "...",
  // ... 기존 분석 결과 ...
  "deja_vu_analysis": {
    "status": "completed", // "processing", "not_enough_data", "failed"
    "similar_dreams": [
      {
        "dream_id": "dream-uuid-abc",
        "title": "3개월 전 꾸었던 어두운 숲 속의 꿈",
        "dream_date": "2025-06-15",
        "score": 0.82,
        "connecting_elements": [
          {"type": "symbol", "value": "숲"},
          {"type": "emotion", "value": "불안"},
          {"type": "keyword", "value": "길을 잃다"}
        ]
      }
    ]
  }
}
```

### **4.0 데이터 모델 (PostgreSQL Schema)**

(이전 논의에서 확정된 PostgreSQL DDL)

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
COMMENT ON TABLE users IS '사용자 계정 정보';

-- dreams: 꿈 기록 원본
CREATE TABLE dreams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dream_date DATE NOT NULL,
    title VARCHAR(100),
    body_text TEXT,
    audio_file_path VARCHAR(512),
    lucidity_level SMALLINT CHECK (lucidity_level BETWEEN 1 AND 5),
    analysis_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
    is_shared BOOLEAN NOT NULL DEFAULT false, -- 꿈의 바다 공유 여부
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON dreams(user_id, dream_date DESC);
COMMENT ON COLUMN dreams.analysis_status IS 'AI 분석 상태';

-- ... (tags, emotions, dream_tags, dream_emotions, dream_analyses 등 이전 스키마 포함) ...

-- reflections: 성찰 질문 답변
CREATE TABLE reflections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dream_id UUID REFERENCES dreams(id) ON DELETE SET NULL, -- 원본 꿈이 삭제되도 답변은 남을 수 있음
    question_text TEXT NOT NULL,
    answer_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### **5.0 비기능 요구사항 (Non-Functional Requirements)**

  * **5.1. 성능 (Performance):**
      * `P-1`: 앱 최초 로딩 시간은 3초 이내 (캐시된 데이터 기준).
      * `P-2`: 화면 전환 및 스크롤 애니메이션은 60fps 유지.
      * `P-3`: 모든 Read API의 P95 응답 시간은 300ms 이내. Write API는 500ms 이내.
      * `P-4`: AI 분석 시간은 평균 90초 이내를 목표로 함.
  * **5.2. 보안 (Security):**
      * `S-1`: 모든 클라이언트-서버 통신은 TLS 1.3으로 암호화.
      * `S-2`: 사용자 비밀번호는 Argon2 해시 알고리즘을 사용하여 저장.
      * `S-3`: 모든 사용자 데이터(DB, Object Storage)는 저장 시 AES-256으로 암호화.
      * `S-4`: API는 WAF(웹 방화벽)를 통해 보호되며, SQL Injection, XSS 등 OWASP Top 10 취약점에 대응해야 함.
      * `S-5`: 모든 외부 라이브러리는 정기적으로 보안 취약점 스캔을 수행해야 함 (Snyk, Trivy).
  * **5.3. 안정성 및 가용성 (Reliability & Availability):**
      * `R-1`: 서비스 가용성은 99.8%를 목표로 함.
      * `R-2`: 모든 API 요청에 대한 오류 처리가 명확해야 하며, 사용자에게는 이해하기 쉬운 오류 메시지를 반환해야 함.
      * `R-3`: 데이터베이스는 매일 1회 이상 자동 백업되어야 하며, 백업 데이터는 최소 14일간 보관하고 Point-in-Time-Recovery가 가능해야 함.
  * **5.4. 데이터 관리 (Data Management):**
      * `D-1`: 사용자는 설정 메뉴를 통해 자신의 모든 꿈 기록을 JSON 형식으로 내보낼 수 있어야 한다.
      * `D-2`: 사용자 계정 탈퇴 시, 모든 관련 데이터는 30일의 유예 기간 후 영구적으로 파기되어야 한다.

### **6.0 출시 계획 (Launch Plan)**

  * **v1.0 (MVP) Scope:**
      * **포함:** F-AUTH, F-JOURNAL, F-INSIGHT, F-EXPAND(꿈의 바다, 성찰 질문)의 모든 기능.
      * **제외:** 고급 패턴 분석(상관관계 분석 등), 꿈 검색, 심리 상담사 연계, 웨어러블 연동.
  * **출시 전 필수 요건:**
      * 비기능 요구사항 `S-1` \~ `S-5` 충족.
      * `P-1` \~ `P-3` 성능 목표 달성.
      * Sentry를 통한 에러 모니터링 및 GA를 통한 핵심 지표 추적 시스템 구축.
      * 서비스 이용약관 및 개인정보처리방침 구비 및 가입 시 동의 절차 구현.