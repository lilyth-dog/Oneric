# 꿈결 서비스 기술 명세서

## 🏗️ 시스템 아키텍처

### 전체 아키텍처 다이어그램
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         꿈결(DreamTracer) - 통합 시스템 아키텍처              │
└─────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────┐               ┌───────────────────────────┐
│     Mobile Client      │               │     Infrastructure (GCP/AWS) │
│    (React Native)      │                └───────────────────────────┘
└────────────┬───────────┘                              │
             │ REST API (HTTPS/TLS 1.3)                 │
             ▼                                           │
┌────────────┴───────────┐              ┌───────────────┴───────────────┐
│   Load Balancer + WAF  │              │           Cloud Services      │
└────────────┬───────────┘              └───────────────────────────────┘
             │                                           │
             ▼                                   ┌────────┴────────┐   ┌──────────┐
┌────────────┴───────────┐              │  Object Storage │◀┤ LLM API  │
│   Python Backend API   │◀───────────▶│  (S3 / GCS)     │   │(Gemini)  │
│       (FastAPI)        │              └────────┬────────┘   └──────────┘
└────────────┬───────────┘                       │ (Audio Files)
             │                                   │
     ┌────────┼───────────────────────────────┐   │
     │(DB)    │(Task Queue)                   │   │
     ▼        ▼                               │   │
┌───┴────┐ ┌────────┴────────┐  ┌───────────┴──────────┐
│  PostgreSQL │ │  Message Broker │  │    AI Worker Process   │
│ (Cloud SQL) │ │ (RabbitMQ/Redis)│──▶│       (Celery)       │
└─────────┘ └─────────────────┘  └──────────────────────┘
```

## 📱 Frontend 기술 스택

### React Native 앱 구조
```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── common/         # 공통 컴포넌트
│   ├── forms/          # 폼 컴포넌트
│   └── charts/         # 차트 컴포넌트
├── screens/            # 화면 컴포넌트
│   ├── auth/           # 인증 관련 화면
│   ├── journal/        # 꿈 기록 화면
│   ├── insight/        # 분석 결과 화면
│   └── community/      # 커뮤니티 화면
├── navigation/         # 네비게이션 설정
├── stores/             # Zustand 상태 관리
├── services/           # API 서비스
├── utils/              # 유틸리티 함수
└── types/              # TypeScript 타입 정의
```

### 주요 라이브러리
- **React Native**: 0.72+
- **TypeScript**: 5.0+
- **React Navigation**: 6.x
- **Zustand**: 4.x
- **TanStack Query**: 5.x
- **Axios**: 1.x
- **React Native Audio**: 음성 녹음
- **React Native Vector Icons**: 아이콘
- **Lottie React Native**: 애니메이션
- **React Native Calendars**: 달력
- **React Native SVG Charts**: 차트

## 🖥️ Backend 기술 스택

### FastAPI 프로젝트 구조
```
app/
├── api/                # API 라우터
│   ├── v1/            # API v1 엔드포인트
│   │   ├── auth.py    # 인증 API
│   │   ├── dreams.py  # 꿈 관련 API
│   │   ├── analysis.py # 분석 API
│   │   └── community.py # 커뮤니티 API
│   └── deps.py        # 의존성 주입
├── core/              # 핵심 설정
│   ├── config.py      # 설정 관리
│   ├── security.py    # 보안 관련
│   └── database.py    # 데이터베이스 연결
├── models/            # SQLAlchemy 모델
├── schemas/           # Pydantic 스키마
├── services/          # 비즈니스 로직
├── workers/           # Celery 워커
└── utils/             # 유틸리티 함수
```

### 주요 라이브러리
- **FastAPI**: 0.104+
- **SQLAlchemy**: 2.0+
- **Alembic**: 1.12+
- **Celery**: 5.3+
- **Redis**: 5.0+
- **Pydantic**: 2.5+
- **Python-multipart**: 파일 업로드
- **Google Cloud Storage**: 파일 저장
- **Firebase Admin SDK**: 인증
- **Google Gemini API**: AI 분석

## 🗄️ 데이터베이스 스키마

### PostgreSQL 테이블 구조
```sql
-- 사용자 테이블
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    auth_provider VARCHAR(50) NOT NULL,
    subscription_plan VARCHAR(20) DEFAULT 'free',
    subscription_expires_at TIMESTAMPTZ,
    notification_settings JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 꿈 기록 테이블
CREATE TABLE dreams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dream_date DATE NOT NULL,
    title VARCHAR(100),
    body_text TEXT,
    audio_file_path VARCHAR(512),
    lucidity_level SMALLINT CHECK (lucidity_level BETWEEN 1 AND 5),
    analysis_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    is_shared BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI 분석 결과 테이블
CREATE TABLE dream_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dream_id UUID UNIQUE REFERENCES dreams(id) ON DELETE CASCADE,
    summary_text TEXT,
    keywords JSONB,
    emotional_flow_text TEXT,
    symbol_analysis JSONB,
    reflective_question TEXT,
    deja_vu_analysis JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 커뮤니티 게시물 테이블
CREATE TABLE community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dream_id UUID REFERENCES dreams(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    tags JSONB,
    is_anonymous BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 꿈 시각화 테이블
CREATE TABLE dream_visualizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dream_id UUID NOT NULL REFERENCES dreams(id) ON DELETE CASCADE,
    image_path VARCHAR(512) NOT NULL,
    art_style VARCHAR(50) NOT NULL,
    prompt_used TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## 🤖 AI 분석 시스템

### 데자뷰 분석 알고리즘
```python
# 꿈의 네트워크 구축
def build_dream_network(user_id: str) -> nx.Graph:
    """
    사용자의 모든 꿈을 노드로, 유사도를 엣지로 하는 그래프 구축
    """
    graph = nx.Graph()
    
    # 1. 모든 꿈을 노드로 추가
    dreams = get_user_dreams(user_id)
    for dream in dreams:
        graph.add_node(dream.id, type='dream', vector=dream.embedding)
    
    # 2. 상징/감정/키워드를 노드로 추가
    elements = get_dream_elements(user_id)
    for element in elements:
        graph.add_node(element.id, type=element.type, vector=element.embedding)
    
    # 3. 유사도 기반 엣지 생성
    for i, node1 in enumerate(graph.nodes()):
        for j, node2 in enumerate(graph.nodes()):
            if i < j:  # 중복 방지
                similarity = cosine_similarity(
                    graph.nodes[node1]['vector'],
                    graph.nodes[node2]['vector']
                )
                if similarity > 0.75:  # 임계값
                    graph.add_edge(node1, node2, weight=similarity)
    
    return graph

# Random Walk with Restart 알고리즘
def calculate_deja_vu_scores(new_dream_id: str, graph: nx.Graph) -> Dict[str, float]:
    """
    새로운 꿈과 기존 꿈들 간의 데자뷰 점수 계산
    """
    # 전이 행렬 계산
    transition_matrix = nx.adjacency_matrix(graph).todense()
    degree_matrix = np.diag(np.sum(transition_matrix, axis=1))
    transition_matrix = np.linalg.inv(degree_matrix) @ transition_matrix
    
    # 초기 확률 벡터 (새로운 꿈에 집중)
    initial_vector = np.zeros(graph.number_of_nodes())
    node_list = list(graph.nodes())
    new_dream_index = node_list.index(new_dream_id)
    initial_vector[new_dream_index] = 1.0
    
    # RWR 알고리즘 실행
    alpha = 0.15  # 재시작 확률
    current_vector = initial_vector.copy()
    
    for _ in range(100):  # 수렴까지 반복
        next_vector = (1 - alpha) * transition_matrix.T @ current_vector + alpha * initial_vector
        if np.allclose(current_vector, next_vector, atol=1e-6):
            break
        current_vector = next_vector
    
    # 데자뷰 점수 추출 (꿈 노드들만)
    deja_vu_scores = {}
    for i, node in enumerate(node_list):
        if graph.nodes[node]['type'] == 'dream' and node != new_dream_id:
            deja_vu_scores[node] = float(current_vector[i])
    
    return deja_vu_scores
```

## 🔒 보안 및 인증

### JWT 토큰 관리
```python
# 토큰 생성
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# 토큰 검증
def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

### 데이터 암호화
```python
# 민감한 데이터 암호화
from cryptography.fernet import Fernet

def encrypt_sensitive_data(data: str) -> str:
    key = Fernet.generate_key()
    f = Fernet(key)
    encrypted_data = f.encrypt(data.encode())
    return encrypted_data.decode()

def decrypt_sensitive_data(encrypted_data: str, key: bytes) -> str:
    f = Fernet(key)
    decrypted_data = f.decrypt(encrypted_data.encode())
    return decrypted_data.decode()
```

## 📊 모니터링 및 로깅

### 성능 모니터링
```python
# API 응답 시간 모니터링
import time
from functools import wraps

def monitor_performance(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        start_time = time.time()
        result = await func(*args, **kwargs)
        end_time = time.time()
        
        # Prometheus 메트릭 기록
        api_duration.labels(
            endpoint=func.__name__,
            method=request.method
        ).observe(end_time - start_time)
        
        return result
    return wrapper

# 에러 추적
import sentry_sdk

sentry_sdk.init(
    dsn="YOUR_SENTRY_DSN",
    traces_sample_rate=1.0,
    profiles_sample_rate=1.0,
)
```

## 🚀 배포 및 CI/CD

### Docker 설정
```dockerfile
# Backend Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### GitHub Actions 워크플로우
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Run tests
        run: pytest

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to GCP
        run: |
          gcloud run deploy dreamtracer-api \
            --source . \
            --platform managed \
            --region asia-northeast1 \
            --allow-unauthenticated
```
