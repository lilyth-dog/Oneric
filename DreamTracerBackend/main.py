"""
꿈결(DreamTracer) FastAPI 메인 애플리케이션
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router

app = FastAPI(
    title="꿈결 API",
    description="꿈 기록 및 분석 서비스 API",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API 라우터 등록
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {"message": "꿈결 API 서버가 실행 중입니다"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "꿈결 API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
