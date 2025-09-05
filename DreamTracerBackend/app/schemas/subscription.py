"""
구독 관련 Pydantic 스키마
"""
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List
from datetime import datetime

class SubscriptionPlan(BaseModel):
    """구독 플랜 스키마"""
    name: str
    price: int
    currency: str
    ai_analysis_limit: int
    features: List[str]

class SubscriptionStatus(BaseModel):
    """구독 상태 스키마"""
    user_id: str
    current_plan: str
    plan_details: Dict[str, Any]
    is_active: bool
    expires_at: Optional[str] = None
    usage: Dict[str, Any]
    can_upgrade: bool
    can_downgrade: bool

class SubscriptionPlansResponse(BaseModel):
    """구독 플랜 목록 응답 스키마"""
    plans: Dict[str, SubscriptionPlan]
    current_time: str

class UpgradeSubscriptionRequest(BaseModel):
    """구독 업그레이드 요청 스키마"""
    plan: str = Field(..., description="구독 플랜")
    payment_method: str = Field(..., description="결제 방법")

class UpgradeSubscriptionResponse(BaseModel):
    """구독 업그레이드 응답 스키마"""
    success: bool
    message: str
    subscription: SubscriptionStatus
    payment_id: Optional[str] = None

class CancelSubscriptionResponse(BaseModel):
    """구독 취소 응답 스키마"""
    success: bool
    message: str
    expires_at: Optional[str] = None

class AIUsageCheckResponse(BaseModel):
    """AI 사용량 확인 응답 스키마"""
    can_analyze: bool
    remaining: int
    limit: int
    reset_date: Optional[str] = None
    usage: Dict[str, Any]
