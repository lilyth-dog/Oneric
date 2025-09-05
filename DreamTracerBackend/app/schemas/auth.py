"""
인증 관련 Pydantic 스키마
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    """사용자 생성 스키마"""
    email: Optional[EmailStr] = None
    auth_provider: str  # 'firebase', 'google', 'apple'
    firebase_uid: Optional[str] = None
    display_name: Optional[str] = None
    photo_url: Optional[str] = None

class UserResponse(BaseModel):
    """사용자 응답 스키마"""
    id: str
    email: Optional[str] = None
    auth_provider: str
    subscription_plan: str
    subscription_expires_at: Optional[datetime] = None
    notification_settings: Optional[dict] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    """토큰 응답 스키마"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse

class FirebaseAuthRequest(BaseModel):
    """Firebase 인증 요청 스키마"""
    firebase_token: str

class OnboardingStep1(BaseModel):
    """온보딩 1단계: 기본 정보"""
    display_name: str
    birth_year: int
    gender: str  # 'male', 'female', 'other', 'prefer_not_to_say'

class OnboardingStep2(BaseModel):
    """온보딩 2단계: 관심사"""
    interests: list[str]  # ['dream_analysis', 'lucidity', 'nightmares', 'symbols']

class OnboardingStep3(BaseModel):
    """온보딩 3단계: 알림 설정"""
    notification_enabled: bool
    dream_reminder_time: Optional[str] = None  # "22:00"
    weekly_insight_enabled: bool = True

class OnboardingStep4(BaseModel):
    """온보딩 4단계: 목표 설정"""
    primary_goal: str  # 'understand_dreams', 'improve_sleep', 'lucid_dreaming', 'nightmare_help'
    dream_frequency: str  # 'daily', 'weekly', 'monthly', 'rarely'

class OnboardingComplete(BaseModel):
    """온보딩 완료 스키마"""
    step1: OnboardingStep1
    step2: OnboardingStep2
    step3: OnboardingStep3
    step4: OnboardingStep4
