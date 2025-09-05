"""
사용자 서비스
"""
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserUpdate, UserProfile
import logging

logger = logging.getLogger(__name__)

class UserService:
    def __init__(self):
        pass

    async def get_user(self, user_id: str, db: Session) -> UserProfile:
        """사용자 정보 조회"""
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                raise ValueError("사용자를 찾을 수 없습니다")
            
            return UserProfile.from_orm(user)
            
        except Exception as e:
            logger.error(f"사용자 조회 실패: {str(e)}")
            raise

    async def update_user(self, user_id: str, user_update: UserUpdate, db: Session) -> UserProfile:
        """사용자 정보 수정"""
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                raise ValueError("사용자를 찾을 수 없습니다")
            
            # 업데이트할 필드만 수정
            if user_update.display_name is not None:
                user.display_name = user_update.display_name
            
            if user_update.notification_settings is not None:
                user.notification_settings = user_update.notification_settings
            
            db.commit()
            db.refresh(user)
            
            logger.info(f"사용자 정보 수정: {user_id}")
            return UserProfile.from_orm(user)
            
        except Exception as e:
            db.rollback()
            logger.error(f"사용자 정보 수정 실패: {str(e)}")
            raise

    async def delete_user(self, user_id: str, db: Session) -> bool:
        """사용자 계정 삭제"""
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                raise ValueError("사용자를 찾을 수 없습니다")
            
            db.delete(user)
            db.commit()
            
            logger.info(f"사용자 계정 삭제: {user_id}")
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"사용자 계정 삭제 실패: {str(e)}")
            raise
