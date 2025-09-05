"""
꿈 시각화 모델
"""
from sqlalchemy import Column, String, Text, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base

class DreamVisualization(Base):
    __tablename__ = "dream_visualizations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dream_id = Column(UUID(as_uuid=True), ForeignKey("dreams.id", ondelete="CASCADE"), nullable=False)
    image_path = Column(String(512), nullable=False)
    art_style = Column(String(50), nullable=False)  # 'realistic', 'surreal', 'watercolor', 'digital_art'
    prompt_used = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # 관계 설정
    dream = relationship("Dream", back_populates="visualizations")
    
    def __repr__(self):
        return f"<DreamVisualization(id={self.id}, dream_id={self.dream_id}, style={self.art_style})>"
