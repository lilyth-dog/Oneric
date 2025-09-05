"""
꿈 시각화 관련 API 엔드포인트
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.schemas.dream import DreamResponse
from app.services.dream_service import DreamService
from app.services.visualization_service import visualization_service
from app.core.security import get_current_user
from app.core.database import get_db
from app.models.dream_visualization import DreamVisualization
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/dreams/{dream_id}/visualize")
async def create_dream_visualization(
    dream_id: str,
    art_style: str = Query(..., description="미술 스타일"),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """꿈 시각화 생성"""
    try:
        # 꿈이 사용자의 것인지 확인
        dream_service = DreamService()
        dream = await dream_service.get_dream(dream_id, current_user.id, db)
        
        # 사용 가능한 스타일 확인
        available_styles = await visualization_service.get_visualization_styles()
        if art_style not in available_styles:
            raise HTTPException(
                status_code=400, 
                detail=f"지원하지 않는 스타일입니다. 사용 가능한 스타일: {list(available_styles.keys())}"
            )
        
        # 시각화 생성
        visualization = await visualization_service.generate_dream_visualization(
            dream, art_style, db
        )
        
        return {
            "message": "꿈 시각화가 생성되었습니다",
            "visualization": {
                "id": str(visualization.id),
                "dream_id": str(visualization.dream_id),
                "image_path": visualization.image_path,
                "art_style": visualization.art_style,
                "created_at": visualization.created_at.isoformat()
            }
        }
        
    except Exception as e:
        logger.error(f"꿈 시각화 생성 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/dreams/{dream_id}/visualizations")
async def get_dream_visualizations(
    dream_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """꿈의 모든 시각화 조회"""
    try:
        # 꿈이 사용자의 것인지 확인
        dream_service = DreamService()
        dream = await dream_service.get_dream(dream_id, current_user.id, db)
        
        # 시각화 목록 조회
        visualizations = await visualization_service.get_dream_visualizations(dream_id, db)
        
        return {
            "dream_id": dream_id,
            "visualizations": [
                {
                    "id": str(v.id),
                    "image_path": v.image_path,
                    "art_style": v.art_style,
                    "created_at": v.created_at.isoformat()
                }
                for v in visualizations
            ]
        }
        
    except Exception as e:
        logger.error(f"꿈 시각화 조회 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/visualization/styles")
async def get_visualization_styles():
    """사용 가능한 미술 스타일 목록 조회"""
    try:
        styles = await visualization_service.get_visualization_styles()
        return {
            "styles": [
                {"key": key, "name": name}
                for key, name in styles.items()
            ]
        }
    except Exception as e:
        logger.error(f"스타일 목록 조회 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/visualizations/{visualization_id}")
async def delete_visualization(
    visualization_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """시각화 삭제"""
    try:
        # 시각화가 사용자의 것인지 확인
        visualization = db.query(DreamVisualization).filter(
            DreamVisualization.id == visualization_id
        ).first()
        
        if not visualization:
            raise HTTPException(status_code=404, detail="시각화를 찾을 수 없습니다")
        
        # 꿈이 사용자의 것인지 확인
        dream_service = DreamService()
        dream = await dream_service.get_dream(str(visualization.dream_id), current_user.id, db)
        
        # 시각화 삭제
        await visualization_service.delete_visualization(visualization_id, db)
        
        return {"message": "시각화가 삭제되었습니다"}
        
    except Exception as e:
        logger.error(f"시각화 삭제 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/visualizations/gallery")
async def get_visualization_gallery(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100)
):
    """사용자의 시각화 갤러리 조회"""
    try:
        # 사용자의 모든 시각화 조회
        visualizations = db.query(DreamVisualization).join(
            DreamVisualization.dream
        ).filter(
            DreamVisualization.dream.has(user_id=current_user.id)
        ).order_by(
            DreamVisualization.created_at.desc()
        ).offset(skip).limit(limit).all()
        
        return {
            "visualizations": [
                {
                    "id": str(v.id),
                    "dream_id": str(v.dream_id),
                    "dream_title": v.dream.title if v.dream else "제목 없음",
                    "image_path": v.image_path,
                    "art_style": v.art_style,
                    "created_at": v.created_at.isoformat()
                }
                for v in visualizations
            ],
            "total_count": len(visualizations),
            "page": (skip // limit) + 1,
            "page_size": limit
        }
        
    except Exception as e:
        logger.error(f"시각화 갤러리 조회 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
