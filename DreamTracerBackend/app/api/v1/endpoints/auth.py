"""
인증 관련 API 엔드포인트
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.schemas.auth import Token, UserCreate, UserResponse, FirebaseAuthRequest, OnboardingComplete
from app.services.auth_service import AuthService
from app.core.database import get_db
from app.core.security import get_current_user

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """사용자 회원가입"""
    auth_service = AuthService()
    try:
        user = await auth_service.create_user(user_data, db)
        return user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """사용자 로그인"""
    auth_service = AuthService()
    try:
        token = await auth_service.authenticate_user(form_data.username, form_data.password, db)
        return token
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="잘못된 사용자명 또는 비밀번호",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.post("/firebase-auth", response_model=Token)
async def firebase_auth(auth_request: FirebaseAuthRequest, db: Session = Depends(get_db)):
    """Firebase 인증"""
    auth_service = AuthService()
    try:
        token = await auth_service.verify_firebase_token(auth_request.firebase_token, db)
        return token
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Firebase 토큰 검증 실패"
        )

@router.post("/onboarding/complete")
async def complete_onboarding(
    onboarding_data: OnboardingComplete,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """온보딩 완료"""
    auth_service = AuthService()
    try:
        user = await auth_service.complete_onboarding(current_user.id, onboarding_data, db)
        return {"message": "온보딩이 완료되었습니다", "user": user}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
