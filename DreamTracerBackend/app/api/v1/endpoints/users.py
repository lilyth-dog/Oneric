"""
사용자 관련 API 엔드포인트
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.user import UserResponse, UserUpdate
from app.services.user_service import UserService
from app.core.security import get_current_user
from app.core.database import get_db

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """현재 사용자 정보 조회"""
    user_service = UserService()
    try:
        user = await user_service.get_user(current_user.id, db)
        return user
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_update: UserUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """현재 사용자 정보 수정"""
    user_service = UserService()
    try:
        updated_user = await user_service.update_user(current_user.id, user_update, db)
        return updated_user
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/me")
async def delete_current_user(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """현재 사용자 계정 삭제"""
    user_service = UserService()
    try:
        await user_service.delete_user(current_user.id, db)
        return {"message": "사용자 계정이 삭제되었습니다"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
