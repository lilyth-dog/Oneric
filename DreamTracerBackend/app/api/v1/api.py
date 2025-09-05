"""
API v1 라우터
"""
from fastapi import APIRouter
from app.api.v1.endpoints import auth, dreams, users, analysis, visualization, community, subscription

api_router = APIRouter()

# 엔드포인트 등록
api_router.include_router(auth.router, prefix="/auth", tags=["인증"])
api_router.include_router(users.router, prefix="/users", tags=["사용자"])
api_router.include_router(dreams.router, prefix="/dreams", tags=["꿈"])
api_router.include_router(analysis.router, prefix="", tags=["분석"])
api_router.include_router(visualization.router, prefix="", tags=["시각화"])
api_router.include_router(community.router, prefix="", tags=["커뮤니티"])
api_router.include_router(subscription.router, prefix="", tags=["구독"])
