"""
꿈 관련 Pydantic 스키마
"""
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum

class EmotionType(str, Enum):
    """감정 타입"""
    HAPPY = "happy"
    SAD = "sad"
    ANGRY = "angry"
    FEARFUL = "fearful"
    PEACEFUL = "peaceful"
    EXCITED = "excited"
    CONFUSED = "confused"
    NOSTALGIC = "nostalgic"
    LONELY = "lonely"
    LOVED = "loved"
    ANXIOUS = "anxious"
    CALM = "calm"

class DreamCreate(BaseModel):
    """꿈 생성 스키마"""
    dream_date: date
    title: Optional[str] = Field(None, max_length=100)
    body_text: Optional[str] = None
    audio_file_path: Optional[str] = None
    lucidity_level: Optional[int] = Field(None, ge=1, le=5)
    emotion_tags: Optional[List[EmotionType]] = []
    is_shared: bool = False
    dream_type: Optional[str] = Field(None, max_length=50)  # "lucid", "nightmare", "normal", "recurring"
    sleep_quality: Optional[int] = Field(None, ge=1, le=5)  # 1-5 수면 품질
    dream_duration: Optional[int] = None  # 꿈 지속 시간 (분)
    location: Optional[str] = Field(None, max_length=100)  # 꿈의 장소
    characters: Optional[List[str]] = []  # 꿈에 등장한 인물들
    symbols: Optional[List[str]] = []  # 꿈의 상징들

    @validator('emotion_tags')
    def validate_emotion_tags(cls, v):
        if v and len(v) > 5:
            raise ValueError('감정 태그는 최대 5개까지 선택할 수 있습니다')
        return v

    @validator('characters')
    def validate_characters(cls, v):
        if v and len(v) > 10:
            raise ValueError('인물은 최대 10명까지 기록할 수 있습니다')
        return v

    @validator('symbols')
    def validate_symbols(cls, v):
        if v and len(v) > 15:
            raise ValueError('상징은 최대 15개까지 기록할 수 있습니다')
        return v

class DreamUpdate(BaseModel):
    """꿈 수정 스키마"""
    title: Optional[str] = Field(None, max_length=100)
    body_text: Optional[str] = None
    audio_file_path: Optional[str] = None
    lucidity_level: Optional[int] = Field(None, ge=1, le=5)
    emotion_tags: Optional[List[EmotionType]] = None
    is_shared: Optional[bool] = None
    dream_type: Optional[str] = Field(None, max_length=50)
    sleep_quality: Optional[int] = Field(None, ge=1, le=5)
    dream_duration: Optional[int] = None
    location: Optional[str] = Field(None, max_length=100)
    characters: Optional[List[str]] = None
    symbols: Optional[List[str]] = None

class DreamResponse(BaseModel):
    """꿈 응답 스키마"""
    id: str
    user_id: str
    dream_date: date
    title: Optional[str] = None
    body_text: Optional[str] = None
    audio_file_path: Optional[str] = None
    lucidity_level: Optional[int] = None
    emotion_tags: Optional[List[str]] = []
    analysis_status: str
    is_shared: bool
    dream_type: Optional[str] = None
    sleep_quality: Optional[int] = None
    dream_duration: Optional[int] = None
    location: Optional[str] = None
    characters: Optional[List[str]] = []
    symbols: Optional[List[str]] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DreamAnalysis(BaseModel):
    """꿈 분석 결과 스키마"""
    id: str
    dream_id: str
    summary_text: Optional[str] = None
    keywords: Optional[List[str]] = None
    emotional_flow_text: Optional[str] = None
    symbol_analysis: Optional[Dict[str, Any]] = None
    reflective_question: Optional[str] = None
    deja_vu_analysis: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True

class DreamListResponse(BaseModel):
    """꿈 목록 응답 스키마"""
    dreams: List[DreamResponse]
    total_count: int
    page: int
    page_size: int
    has_next: bool
    has_previous: bool

class DreamStats(BaseModel):
    """꿈 통계 스키마"""
    total_dreams: int
    dreams_this_month: int
    dreams_this_week: int
    average_lucidity: Optional[float] = None
    most_common_emotions: List[Dict[str, Any]]
    most_common_symbols: List[Dict[str, Any]]
    dream_types_distribution: Dict[str, int]
    sleep_quality_average: Optional[float] = None

class AudioUploadResponse(BaseModel):
    """오디오 업로드 응답 스키마"""
    audio_file_path: str
    file_size: int
    duration: Optional[float] = None
    upload_url: Optional[str] = None  # 클라우드 스토리지 업로드 URL
