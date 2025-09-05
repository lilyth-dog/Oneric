"""
커뮤니티 모델
"""
from sqlalchemy import Column, Text, Boolean, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base

class CommunityPost(Base):
    __tablename__ = "community_posts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    dream_id = Column(UUID(as_uuid=True), ForeignKey("dreams.id", ondelete="SET NULL"), nullable=True)
    content = Column(Text, nullable=False)
    tags = Column(JSONB, nullable=True)  # 태그 배열
    is_anonymous = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # 관계 설정
    user = relationship("User")
    dream = relationship("Dream")
    
    def __repr__(self):
        return f"<CommunityPost(id={self.id}, user_id={self.user_id}, anonymous={self.is_anonymous})>"
