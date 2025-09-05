"""
인증 서비스
"""
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.auth import UserCreate, Token, OnboardingComplete
from app.core.security import create_access_token, verify_password, get_password_hash
from app.core.config import settings
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)

class AuthService:
    def __init__(self):
        pass

    async def create_user(self, user_data: UserCreate, db: Session) -> User:
        """새 사용자 생성"""
        try:
            # 이메일 중복 확인
            if user_data.email:
                existing_user = db.query(User).filter(User.email == user_data.email).first()
                if existing_user:
                    raise ValueError("이미 존재하는 이메일입니다")
            
            # 새 사용자 생성
            db_user = User(
                email=user_data.email,
                auth_provider=user_data.auth_provider,
                subscription_plan='free'
            )
            
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
            
            logger.info(f"새 사용자 생성: {db_user.id}")
            return db_user
            
        except Exception as e:
            db.rollback()
            logger.error(f"사용자 생성 실패: {str(e)}")
            raise

    async def authenticate_user(self, email: str, password: str, db: Session) -> Token:
        """사용자 인증"""
        try:
            user = db.query(User).filter(User.email == email).first()
            if not user:
                raise ValueError("사용자를 찾을 수 없습니다")
            
            # Firebase 인증의 경우 비밀번호 검증 생략
            if user.auth_provider == 'firebase':
                # Firebase 토큰 검증은 별도 엔드포인트에서 처리
                pass
            else:
                # 일반 이메일/비밀번호 인증
                if not verify_password(password, user.password_hash):
                    raise ValueError("잘못된 비밀번호입니다")
            
            # 액세스 토큰 생성
            access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(
                data={"sub": str(user.id)}, expires_delta=access_token_expires
            )
            
            return Token(
                access_token=access_token,
                token_type="bearer",
                expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
                user=user
            )
            
        except Exception as e:
            logger.error(f"사용자 인증 실패: {str(e)}")
            raise

    async def verify_firebase_token(self, firebase_token: str, db: Session) -> Token:
        """Firebase 토큰 검증"""
        try:
            # TODO: Firebase Admin SDK를 사용한 토큰 검증 구현
            # firebase_admin.auth.verify_id_token(firebase_token)
            
            # 임시 구현 - 실제로는 Firebase Admin SDK 사용
            # firebase_uid = decoded_token['uid']
            # email = decoded_token.get('email')
            
            # 사용자 조회 또는 생성
            # user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
            # if not user:
            #     user = await self.create_user_from_firebase(decoded_token, db)
            
            # 액세스 토큰 생성
            # access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
            # access_token = create_access_token(
            #     data={"sub": str(user.id)}, expires_delta=access_token_expires
            # )
            
            # return Token(
            #     access_token=access_token,
            #     token_type="bearer",
            #     expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            #     user=user
            # )
            
            # 임시 반환값
            raise NotImplementedError("Firebase 인증은 아직 구현되지 않았습니다")
            
        except Exception as e:
            logger.error(f"Firebase 토큰 검증 실패: {str(e)}")
            raise

    async def complete_onboarding(self, user_id: str, onboarding_data: OnboardingComplete, db: Session) -> User:
        """온보딩 완료 처리"""
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                raise ValueError("사용자를 찾을 수 없습니다")
            
            # 온보딩 데이터를 사용자 프로필에 저장
            # TODO: 온보딩 데이터를 별도 테이블에 저장하거나 사용자 테이블에 JSON 필드로 저장
            
            db.commit()
            db.refresh(user)
            
            logger.info(f"온보딩 완료: {user_id}")
            return user
            
        except Exception as e:
            db.rollback()
            logger.error(f"온보딩 완료 실패: {str(e)}")
            raise
