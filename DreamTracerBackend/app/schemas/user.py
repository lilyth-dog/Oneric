"""
사용자 관련 Pydantic 스키마
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserUpdate(BaseModel):
    """사용자 정보 수정 스키마"""
    display_name: Optional[str] = None
    notification_settings: Optional[dict] = None

class UserResponse(BaseModel):
    """사용자 응답 스키마"""
    id: str
    email: Optional[str] = None
    display_name: Optional[str] = None
    auth_provider: str
    subscription_plan: str
    subscription_expires_at: Optional[datetime] = None
    notification_settings: Optional[dict] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserProfile(BaseModel):
    """사용자 프로필 스키마"""
    id: str
    email: Optional[str] = None
    display_name: Optional[str] = None
    auth_provider: str
    subscription_plan: str
    subscription_expires_at: Optional[datetime] = None
    notification_settings: Optional[dict] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
