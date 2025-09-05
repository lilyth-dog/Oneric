"""
커뮤니티 관련 API 엔드포인트
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.schemas.community import (
    CommunityPostCreate, CommunityPostResponse, CommunityPostUpdate,
    CommunityPostListResponse, CommunitySearchResponse, PopularTagsResponse
)
from app.services.community_service import community_service
from app.core.security import get_current_user
from app.core.database import get_db
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/community/posts", response_model=CommunityPostResponse)
async def create_community_post(
    post_data: CommunityPostCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """커뮤니티 포스트 생성"""
    try:
        post = await community_service.create_post(
            str(current_user.id), 
            post_data, 
            db
        )
        return post
    except Exception as e:
        logger.error(f"커뮤니티 포스트 생성 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/community/posts", response_model=CommunityPostListResponse)
async def get_community_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    tags: Optional[List[str]] = Query(None),
    user_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """커뮤니티 포스트 목록 조회"""
    try:
        result = await community_service.get_posts(
            skip=skip,
            limit=limit,
            db=db,
            tags_filter=tags,
            user_id=user_id
        )
        return CommunityPostListResponse(**result)
    except Exception as e:
        logger.error(f"커뮤니티 포스트 목록 조회 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/community/posts/{post_id}", response_model=CommunityPostResponse)
async def get_community_post(
    post_id: str,
    db: Session = Depends(get_db)
):
    """특정 커뮤니티 포스트 조회"""
    try:
        post = await community_service.get_post(post_id, db)
        if not post:
            raise HTTPException(status_code=404, detail="포스트를 찾을 수 없습니다")
        return post
    except Exception as e:
        logger.error(f"커뮤니티 포스트 조회 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/community/posts/{post_id}", response_model=CommunityPostResponse)
async def update_community_post(
    post_id: str,
    post_update: CommunityPostUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """커뮤니티 포스트 수정"""
    try:
        post = await community_service.update_post(
            post_id,
            str(current_user.id),
            post_update,
            db
        )
        return post
    except Exception as e:
        logger.error(f"커뮤니티 포스트 수정 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/community/posts/{post_id}")
async def delete_community_post(
    post_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """커뮤니티 포스트 삭제"""
    try:
        await community_service.delete_post(
            post_id,
            str(current_user.id),
            db
        )
        return {"message": "포스트가 삭제되었습니다"}
    except Exception as e:
        logger.error(f"커뮤니티 포스트 삭제 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/community/tags/popular", response_model=PopularTagsResponse)
async def get_popular_tags(
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """인기 태그 조회"""
    try:
        tags = await community_service.get_popular_tags(db, limit)
        return PopularTagsResponse(tags=tags)
    except Exception as e:
        logger.error(f"인기 태그 조회 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/community/search", response_model=CommunitySearchResponse)
async def search_community_posts(
    q: str = Query(..., min_length=1, description="검색어"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """커뮤니티 포스트 검색"""
    try:
        result = await community_service.search_posts(
            q,
            db,
            skip=skip,
            limit=limit
        )
        return CommunitySearchResponse(**result)
    except Exception as e:
        logger.error(f"커뮤니티 포스트 검색 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/community/posts/user/{user_id}")
async def get_user_posts(
    user_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """특정 사용자의 포스트 조회"""
    try:
        result = await community_service.get_posts(
            skip=skip,
            limit=limit,
            db=db,
            user_id=user_id
        )
        return CommunityPostListResponse(**result)
    except Exception as e:
        logger.error(f"사용자 포스트 조회 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
