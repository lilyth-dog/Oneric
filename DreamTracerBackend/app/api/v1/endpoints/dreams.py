"""
꿈 관련 API 엔드포인트
"""
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.schemas.dream import (
    DreamCreate, DreamResponse, DreamUpdate, DreamAnalysis,
    DreamListResponse, DreamStats, AudioUploadResponse
)
from app.services.dream_service import DreamService
from app.core.security import get_current_user
from app.core.database import get_db

router = APIRouter()

@router.post("/", response_model=DreamResponse)
async def create_dream(
    dream_data: DreamCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """새로운 꿈 기록 생성"""
    dream_service = DreamService()
    try:
        dream = await dream_service.create_dream(current_user.id, dream_data, db)
        return dream
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=DreamListResponse)
async def get_dreams(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    dream_type: Optional[str] = Query(None),
    emotion_filter: Optional[List[str]] = Query(None),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """사용자의 꿈 목록 조회 (필터링 및 페이지네이션)"""
    dream_service = DreamService()
    try:
        dreams = await dream_service.get_user_dreams(
            current_user.id, 
            skip=skip, 
            limit=limit, 
            db=db,
            start_date=start_date,
            end_date=end_date,
            dream_type=dream_type,
            emotion_filter=emotion_filter
        )
        return dreams
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{dream_id}", response_model=DreamResponse)
async def get_dream(
    dream_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """특정 꿈 상세 조회"""
    dream_service = DreamService()
    try:
        dream = await dream_service.get_dream(dream_id, current_user.id, db)
        return dream
    except Exception as e:
        raise HTTPException(status_code=404, detail="꿈을 찾을 수 없습니다")

@router.put("/{dream_id}", response_model=DreamResponse)
async def update_dream(
    dream_id: str,
    dream_update: DreamUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """꿈 기록 수정"""
    dream_service = DreamService()
    try:
        dream = await dream_service.update_dream(dream_id, current_user.id, dream_update, db)
        return dream
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{dream_id}")
async def delete_dream(
    dream_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """꿈 기록 삭제"""
    dream_service = DreamService()
    try:
        await dream_service.delete_dream(dream_id, current_user.id, db)
        return {"message": "꿈 기록이 삭제되었습니다"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{dream_id}/analyze", response_model=DreamAnalysis)
async def analyze_dream(
    dream_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """꿈 AI 분석 요청"""
    dream_service = DreamService()
    try:
        analysis = await dream_service.analyze_dream(dream_id, current_user.id, db)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/stats/overview", response_model=DreamStats)
async def get_dream_stats(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """사용자의 꿈 통계 조회"""
    dream_service = DreamService()
    try:
        stats = await dream_service.get_dream_stats(current_user.id, db)
        return stats
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/upload-audio", response_model=AudioUploadResponse)
async def upload_audio(
    audio_file: UploadFile = File(...),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """오디오 파일 업로드"""
    dream_service = DreamService()
    try:
        # 파일 타입 검증
        if not audio_file.content_type or not audio_file.content_type.startswith('audio/'):
            raise HTTPException(status_code=400, detail="오디오 파일만 업로드 가능합니다")
        
        result = await dream_service.upload_audio(current_user.id, audio_file, db)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/search", response_model=DreamListResponse)
async def search_dreams(
    q: str = Query(..., min_length=1, description="검색어"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """꿈 내용 검색"""
    dream_service = DreamService()
    try:
        results = await dream_service.search_dreams(
            current_user.id, q, db, skip=skip, limit=limit
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
