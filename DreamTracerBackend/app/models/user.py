"""
사용자 모델
"""
from sqlalchemy import Column, String, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=True)
    auth_provider = Column(String(50), nullable=False)  # 'firebase', 'google', 'apple'
    subscription_plan = Column(String(20), default='free')  # 'free', 'plus'
    subscription_expires_at = Column(DateTime(timezone=True), nullable=True)
    notification_settings = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # 관계 설정
    dreams = relationship("Dream", back_populates="user")
    community_posts = relationship("CommunityPost", back_populates="user")
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, provider={self.auth_provider})>"
