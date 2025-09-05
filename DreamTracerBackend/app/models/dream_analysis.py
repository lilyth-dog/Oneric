"""
꿈 분석 모델
"""
from sqlalchemy import Column, Text, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base

class DreamAnalysis(Base):
    __tablename__ = "dream_analyses"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dream_id = Column(UUID(as_uuid=True), ForeignKey("dreams.id", ondelete="CASCADE"), unique=True, nullable=False)
    summary_text = Column(Text, nullable=True)
    keywords = Column(JSONB, nullable=True)  # 키워드 배열
    emotional_flow_text = Column(Text, nullable=True)
    symbol_analysis = Column(JSONB, nullable=True)  # 상징 분석 결과
    reflective_question = Column(Text, nullable=True)
    deja_vu_analysis = Column(JSONB, nullable=True)  # 데자뷰 분석 결과
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # 관계 설정
    dream = relationship("Dream", back_populates="analysis")
    
    def __repr__(self):
        return f"<DreamAnalysis(id={self.id}, dream_id={self.dream_id})>"
