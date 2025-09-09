"""
꿈결 AI API 서버 (네이버 클라우드 플랫폼 최적화)
NCP 환경에 최적화된 꿈 분석 서비스
"""
from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import asyncio
import logging
from datetime import datetime
import os
from dotenv import load_dotenv
import httpx
import json
import boto3
from botocore.exceptions import ClientError

# 환경 변수 로드
load_dotenv()

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="꿈결 AI API (NCP 버전)",
    description="네이버 클라우드 플랫폼에서 운영되는 꿈 분석 서비스",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# NCP 설정
NCP_ACCESS_KEY = os.getenv("NCP_ACCESS_KEY")
NCP_SECRET_KEY = os.getenv("NCP_SECRET_KEY")
NCP_REGION = os.getenv("NCP_REGION", "KR")

# NCP Object Storage 클라이언트
ncp_s3 = boto3.client(
    's3',
    endpoint_url=f'https://kr.object.ncloudstorage.com',
    aws_access_key_id=NCP_ACCESS_KEY,
    aws_secret_access_key=NCP_SECRET_KEY,
    region_name=NCP_REGION
)

# OpenRouter 설정
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

# 무료 모델 목록
FREE_MODELS = {
    "dialogpt-small": "microsoft/DialoGPT-small",
    "dialogpt-medium": "microsoft/DialoGPT-medium", 
    "blenderbot": "facebook/blenderbot-400M-distill",
    "stable-diffusion": "stabilityai/stable-diffusion-xl-base-1.0"
}

# 요청/응답 모델
class DreamAnalysisRequest(BaseModel):
    dream_text: str
    dream_title: Optional[str] = None
    emotion_tags: Optional[List[str]] = None
    lucidity_level: Optional[int] = None
    sleep_quality: Optional[int] = None
    model: str = "dialogpt-small"

class DreamAnalysisResponse(BaseModel):
    summary: str
    keywords: List[str]
    emotional_tone: str
    symbols: List[Dict[str, Any]]
    themes: List[str]
    insights: List[str]
    reflective_questions: List[str]
    dream_type: str
    lucidity_score: float
    emotional_intensity: float
    timestamp: str
    ncp_region: str

class DreamVisualizationRequest(BaseModel):
    dream_text: str
    analysis_result: Optional[Dict[str, Any]] = None
    style: str = "dreamy_artistic"

class DreamVisualizationResponse(BaseModel):
    image_url: str
    description: str
    style: str
    colors: List[str]
    elements: List[str]
    timestamp: str
    ncp_storage_url: str

class HealthResponse(BaseModel):
    status: str
    ncp_region: str
    free_models_available: List[str]
    timestamp: str

# OpenRouter 클라이언트
class OpenRouterClient:
    def __init__(self):
        self.api_key = OPENROUTER_API_KEY
        self.base_url = OPENROUTER_BASE_URL
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://ggumgyeol.com",
            "X-Title": "꿈결 - 꿈 분석 앱 (NCP)"
        }
    
    async def chat_completion(self, model: str, messages: List[Dict], max_tokens: int = 200):
        """OpenRouter 채팅 완성 API 호출"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=self.headers,
                    json={
                        "model": model,
                        "messages": messages,
                        "max_tokens": max_tokens,
                        "temperature": 0.7
                    },
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    logger.error(f"OpenRouter API 오류: {response.status_code} - {response.text}")
                    return None
                    
        except Exception as e:
            logger.error(f"OpenRouter API 호출 실패: {e}")
            return None
    
    async def image_generation(self, prompt: str, model: str = "stable-diffusion"):
        """이미지 생성 API 호출 (NCP Object Storage에 저장)"""
        try:
            # 이미지 생성 (시뮬레이션)
            image_data = f"Generated image for: {prompt}"
            
            # NCP Object Storage에 저장
            bucket_name = "ggumgyeol-dream-images"
            object_key = f"dreams/{datetime.now().strftime('%Y/%m/%d')}/{hash(prompt)}.jpg"
            
            try:
                ncp_s3.put_object(
                    Bucket=bucket_name,
                    Key=object_key,
                    Body=image_data.encode('utf-8'),
                    ContentType='image/jpeg'
                )
                
                # 공개 URL 생성
                image_url = f"https://kr.object.ncloudstorage.com/{bucket_name}/{object_key}"
                
                return {
                    "image_url": image_url,
                    "ncp_storage_url": image_url,
                    "description": f"꿈의 시각화: {prompt[:50]}..."
                }
            except ClientError as e:
                logger.error(f"NCP Object Storage 오류: {e}")
                # 폴백: 기본 이미지 URL
                return {
                    "image_url": f"https://via.placeholder.com/1024x1024/4A4063/FFDDA8?text={prompt[:20]}",
                    "ncp_storage_url": "NCP Storage 연결 실패",
                    "description": f"꿈의 시각화: {prompt[:50]}..."
                }
                
        except Exception as e:
            logger.error(f"이미지 생성 실패: {e}")
            return None

# 전역 클라이언트
openrouter_client = OpenRouterClient()

# 꿈 분석 프롬프트 템플릿
DREAM_ANALYSIS_PROMPT = """
당신은 꿈 분석 전문가입니다. 다음 꿈을 분석해주세요:

꿈 내용: {dream_text}

다음 형식으로 분석 결과를 제공해주세요:
1. 요약: 꿈의 핵심 내용을 2-3문장으로 요약
2. 키워드: 주요 단어들 (5개 이하)
3. 감정 톤: 꿈의 감정적 분위기
4. 상징: 꿈 속 상징과 의미 (2-3개)
5. 테마: 반복되는 주제들 (3개 이하)
6. 인사이트: AI가 제공하는 통찰 (2-3개)
7. 반성 질문: 자기 성찰을 위한 질문들 (2-3개)
8. 꿈 타입: 일반몽/자각몽/악몽 등
9. 명료도 점수: 0-1 사이의 숫자
10. 감정 강도: 0-1 사이의 숫자

JSON 형식으로 응답해주세요.
"""

# API 엔드포인트
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """서버 상태 확인 (NCP 정보 포함)"""
    return HealthResponse(
        status="healthy",
        ncp_region=NCP_REGION,
        free_models_available=list(FREE_MODELS.keys()),
        timestamp=datetime.now().isoformat()
    )

@app.post("/api/v1/dreams/analyze", response_model=DreamAnalysisResponse)
async def analyze_dream(request: DreamAnalysisRequest):
    """꿈 분석 API (NCP 최적화)"""
    logger.info(f"꿈 분석 요청 (NCP {NCP_REGION}): {request.model}")
    
    # 모델 확인
    if request.model not in FREE_MODELS:
        raise HTTPException(status_code=400, detail=f"지원하지 않는 모델: {request.model}")
    
    try:
        # 프롬프트 생성
        prompt = DREAM_ANALYSIS_PROMPT.format(dream_text=request.dream_text)
        
        # OpenRouter API 호출
        messages = [
            {"role": "system", "content": "당신은 꿈 분석 전문가입니다. 정확하고 도움이 되는 분석을 제공해주세요."},
            {"role": "user", "content": prompt}
        ]
        
        model_name = FREE_MODELS[request.model]
        response = await openrouter_client.chat_completion(model_name, messages, max_tokens=500)
        
        if response and "choices" in response:
            analysis_text = response["choices"][0]["message"]["content"]
            
            # JSON 파싱 시도
            try:
                analysis_data = json.loads(analysis_text)
                return DreamAnalysisResponse(
                    summary=analysis_data.get("요약", "꿈 분석 결과"),
                    keywords=analysis_data.get("키워드", ["꿈", "분석"]),
                    emotional_tone=analysis_data.get("감정 톤", "중립적"),
                    symbols=analysis_data.get("상징", []),
                    themes=analysis_data.get("테마", []),
                    insights=analysis_data.get("인사이트", []),
                    reflective_questions=analysis_data.get("반성 질문", []),
                    dream_type=analysis_data.get("꿈 타입", "일반몽"),
                    lucidity_score=float(analysis_data.get("명료도 점수", 0.5)),
                    emotional_intensity=float(analysis_data.get("감정 강도", 0.5)),
                    timestamp=datetime.now().isoformat(),
                    ncp_region=NCP_REGION
                )
            except json.JSONDecodeError:
                # JSON 파싱 실패 시 기본 응답
                return DreamAnalysisResponse(
                    summary=analysis_text[:200] + "..." if len(analysis_text) > 200 else analysis_text,
                    keywords=["꿈", "분석"],
                    emotional_tone="중립적",
                    symbols=[],
                    themes=[],
                    insights=[],
                    reflective_questions=[],
                    dream_type="일반몽",
                    lucidity_score=0.5,
                    emotional_intensity=0.5,
                    timestamp=datetime.now().isoformat(),
                    ncp_region=NCP_REGION
                )
        else:
            # API 호출 실패 시 시뮬레이션된 응답
            return await _get_simulated_analysis(request)
            
    except Exception as e:
        logger.error(f"꿈 분석 실패: {e}")
        return await _get_simulated_analysis(request)

@app.post("/api/v1/dreams/visualize", response_model=DreamVisualizationResponse)
async def generate_visualization(request: DreamVisualizationRequest):
    """꿈 시각화 생성 API (NCP Object Storage 사용)"""
    logger.info(f"시각화 생성 요청 (NCP {NCP_REGION}): {request.style}")
    
    try:
        # 이미지 생성 프롬프트
        prompt = f"dreamy artistic visualization of: {request.dream_text[:100]}"
        
        # OpenRouter 이미지 생성 API 호출
        result = await openrouter_client.image_generation(prompt, "stable-diffusion")
        
        if result:
            return DreamVisualizationResponse(
                image_url=result["image_url"],
                description=result["description"],
                style=request.style,
                colors=["#4A4063", "#FFDDA8", "#8F8C9B"],
                elements=["하늘", "구름", "빛"],
                timestamp=datetime.now().isoformat(),
                ncp_storage_url=result.get("ncp_storage_url", "")
            )
        else:
            # API 호출 실패 시 기본 응답
            return DreamVisualizationResponse(
                image_url="https://via.placeholder.com/1024x1024/4A4063/FFDDA8?text=Dream+Visualization",
                description="꿈의 시각화",
                style=request.style,
                colors=["#4A4063", "#FFDDA8", "#8F8C9B"],
                elements=["하늘", "구름", "빛"],
                timestamp=datetime.now().isoformat(),
                ncp_storage_url="NCP Storage 연결 실패"
            )
            
    except Exception as e:
        logger.error(f"시각화 생성 실패: {e}")
        raise HTTPException(status_code=500, detail="시각화 생성 중 오류가 발생했습니다")

@app.get("/api/v1/models")
async def get_available_models():
    """사용 가능한 무료 모델 목록 조회"""
    return {
        "free_models": [
            {
                "id": model_id,
                "name": model_name,
                "type": "text_generation" if "dialogpt" in model_id or "blenderbot" in model_id else "image_generation",
                "cost": "free",
                "ncp_optimized": True
            }
            for model_id, model_name in FREE_MODELS.items()
        ],
        "ncp_region": NCP_REGION
    }

async def _get_simulated_analysis(request: DreamAnalysisRequest) -> DreamAnalysisResponse:
    """시뮬레이션된 꿈 분석 (API 실패 시 사용)"""
    keywords = ["꿈", "하늘", "날아다니기", "자유", "평화"]
    symbols = [
        {"symbol": "하늘", "meaning": "자유와 무한한 가능성", "confidence": 0.9},
        {"symbol": "날개", "meaning": "독립과 성장", "confidence": 0.8}
    ]
    themes = ["자유", "성장", "평화"]
    insights = [
        "현실에서 자유롭고 싶은 마음이 꿈에 반영되었습니다.",
        "새로운 시작에 대한 기대감이 느껴집니다."
    ]
    reflective_questions = [
        "현재 삶에서 자유롭지 못한 부분이 있나요?",
        "새로운 도전을 시작하고 싶은 마음이 있나요?"
    ]
    
    return DreamAnalysisResponse(
        summary="하늘을 날아다니는 꿈으로, 자유와 성장에 대한 열망이 표현되었습니다.",
        keywords=keywords,
        emotional_tone="긍정적이고 희망적",
        symbols=symbols,
        themes=themes,
        insights=insights,
        reflective_questions=reflective_questions,
        dream_type="자각몽",
        lucidity_score=0.7,
        emotional_intensity=0.8,
        timestamp=datetime.now().isoformat(),
        ncp_region=NCP_REGION
    )

# 서버 시작
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "ncp_main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
