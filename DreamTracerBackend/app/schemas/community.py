"""
커뮤니티 관련 Pydantic 스키마
"""
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime

class CommunityPostCreate(BaseModel):
    """커뮤니티 포스트 생성 스키마"""
    content: str = Field(..., min_length=10, max_length=2000, description="포스트 내용")
    tags: Optional[List[str]] = Field(default=[], max_items=10, description="태그 목록")
    is_anonymous: bool = Field(default=True, description="익명 여부")
    dream_id: Optional[str] = Field(None, description="연관된 꿈 ID")
    
    @validator('tags')
    def validate_tags(cls, v):
        if v and len(v) > 10:
            raise ValueError('태그는 최대 10개까지 선택할 수 있습니다')
        return v
    
    @validator('content')
    def validate_content(cls, v):
        if len(v.strip()) < 10:
            raise ValueError('포스트 내용은 최소 10자 이상이어야 합니다')
        return v.strip()

class CommunityPostUpdate(BaseModel):
    """커뮤니티 포스트 수정 스키마"""
    content: Optional[str] = Field(None, min_length=10, max_length=2000)
    tags: Optional[List[str]] = Field(None, max_items=10)
    is_anonymous: Optional[bool] = None
    
    @validator('content')
    def validate_content(cls, v):
        if v is not None and len(v.strip()) < 10:
            raise ValueError('포스트 내용은 최소 10자 이상이어야 합니다')
        return v.strip() if v else v

class CommunityPostResponse(BaseModel):
    """커뮤니티 포스트 응답 스키마"""
    id: str
    user_id: str
    dream_id: Optional[str] = None
    content: str
    tags: List[str] = []
    is_anonymous: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class CommunityPostListResponse(BaseModel):
    """커뮤니티 포스트 목록 응답 스키마"""
    posts: List[Dict[str, Any]]
    total_count: int
    page: int
    page_size: int
    has_next: bool
    has_previous: bool

class CommunitySearchResponse(BaseModel):
    """커뮤니티 검색 응답 스키마"""
    posts: List[Dict[str, Any]]
    total_count: int
    page: int
    page_size: int
    has_next: bool
    has_previous: bool
    query: str

class PopularTagsResponse(BaseModel):
    """인기 태그 응답 스키마"""
    tags: List[Dict[str, Any]]
