"""
구독 관련 API 엔드포인트
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.subscription import (
    SubscriptionPlansResponse, SubscriptionStatus, UpgradeSubscriptionRequest,
    UpgradeSubscriptionResponse, CancelSubscriptionResponse, AIUsageCheckResponse
)
from app.services.subscription_service import subscription_service
from app.core.security import get_current_user
from app.core.database import get_db
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/subscription/plans", response_model=SubscriptionPlansResponse)
async def get_subscription_plans():
    """구독 플랜 목록 조회"""
    try:
        plans = await subscription_service.get_subscription_plans()
        return SubscriptionPlansResponse(**plans)
    except Exception as e:
        logger.error(f"구독 플랜 조회 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/subscription/status", response_model=SubscriptionStatus)
async def get_user_subscription(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """사용자 구독 정보 조회"""
    try:
        subscription = await subscription_service.get_user_subscription(
            str(current_user.id), 
            db
        )
        return SubscriptionStatus(**subscription)
    except Exception as e:
        logger.error(f"사용자 구독 정보 조회 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/subscription/upgrade", response_model=UpgradeSubscriptionResponse)
async def upgrade_subscription(
    upgrade_request: UpgradeSubscriptionRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """구독 업그레이드"""
    try:
        result = await subscription_service.upgrade_subscription(
            str(current_user.id),
            upgrade_request.plan,
            upgrade_request.payment_method,
            db
        )
        return UpgradeSubscriptionResponse(**result)
    except Exception as e:
        logger.error(f"구독 업그레이드 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/subscription/cancel", response_model=CancelSubscriptionResponse)
async def cancel_subscription(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """구독 취소"""
    try:
        result = await subscription_service.cancel_subscription(
            str(current_user.id),
            db
        )
        return CancelSubscriptionResponse(**result)
    except Exception as e:
        logger.error(f"구독 취소 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/subscription/ai-usage", response_model=AIUsageCheckResponse)
async def check_ai_analysis_limit(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """AI 분석 사용량 확인"""
    try:
        usage = await subscription_service.check_ai_analysis_limit(
            str(current_user.id),
            db
        )
        return AIUsageCheckResponse(**usage)
    except Exception as e:
        logger.error(f"AI 사용량 확인 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
