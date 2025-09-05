"""
꿈 모델
"""
from sqlalchemy import Column, String, Text, Date, SmallInteger, Boolean, ForeignKey, DateTime, Integer, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base

class Dream(Base):
    __tablename__ = "dreams"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    dream_date = Column(Date, nullable=False)
    title = Column(String(100), nullable=True)
    body_text = Column(Text, nullable=True)
    audio_file_path = Column(String(512), nullable=True)
    lucidity_level = Column(SmallInteger, nullable=True)  # 1-5 범위
    emotion_tags = Column(JSON, nullable=True)  # 감정 태그 배열
    analysis_status = Column(String(20), nullable=False, default='pending')  # 'pending', 'processing', 'completed', 'failed'
    is_shared = Column(Boolean, nullable=False, default=False)
    dream_type = Column(String(50), nullable=True)  # "lucid", "nightmare", "normal", "recurring"
    sleep_quality = Column(SmallInteger, nullable=True)  # 1-5 수면 품질
    dream_duration = Column(Integer, nullable=True)  # 꿈 지속 시간 (분)
    location = Column(String(100), nullable=True)  # 꿈의 장소
    characters = Column(JSON, nullable=True)  # 꿈에 등장한 인물들
    symbols = Column(JSON, nullable=True)  # 꿈의 상징들
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # 관계 설정
    user = relationship("User", back_populates="dreams")
    analysis = relationship("DreamAnalysis", back_populates="dream", uselist=False)
    visualizations = relationship("DreamVisualization", back_populates="dream")
    
    def __repr__(self):
        return f"<Dream(id={self.id}, user_id={self.user_id}, date={self.dream_date})>"
