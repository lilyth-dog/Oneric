"""
커뮤니티 서비스
"""
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_
from app.models.community import CommunityPost
from app.models.dream import Dream
from app.models.user import User
from app.schemas.community import CommunityPostCreate, CommunityPostResponse, CommunityPostUpdate
from typing import List, Optional, Dict, Any
import logging
import uuid

logger = logging.getLogger(__name__)

class CommunityService:
    def __init__(self):
        pass
    
    async def create_post(
        self, 
        user_id: str, 
        post_data: CommunityPostCreate, 
        db: Session
    ) -> CommunityPostResponse:
        """
        커뮤니티 포스트 생성
        """
        try:
            # 꿈이 사용자의 것인지 확인 (dream_id가 있는 경우)
            if post_data.dream_id:
                dream = db.query(Dream).filter(
                    and_(Dream.id == post_data.dream_id, Dream.user_id == user_id)
                ).first()
                if not dream:
                    raise ValueError("꿈을 찾을 수 없거나 권한이 없습니다")
            
            # 포스트 생성
            db_post = CommunityPost(
                user_id=user_id,
                dream_id=post_data.dream_id,
                content=post_data.content,
                tags=post_data.tags or [],
                is_anonymous=post_data.is_anonymous
            )
            
            db.add(db_post)
            db.commit()
            db.refresh(db_post)
            
            logger.info(f"커뮤니티 포스트 생성: {db_post.id}")
            return CommunityPostResponse.from_orm(db_post)
            
        except Exception as e:
            db.rollback()
            logger.error(f"커뮤니티 포스트 생성 실패: {str(e)}")
            raise e
    
    async def get_posts(
        self, 
        skip: int = 0, 
        limit: int = 20, 
        db: Session = None,
        tags_filter: Optional[List[str]] = None,
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        커뮤니티 포스트 목록 조회
        """
        try:
            query = db.query(CommunityPost)
            
            # 태그 필터
            if tags_filter:
                for tag in tags_filter:
                    query = query.filter(CommunityPost.tags.contains([tag]))
            
            # 사용자 필터 (특정 사용자의 포스트만)
            if user_id:
                query = query.filter(CommunityPost.user_id == user_id)
            
            # 총 개수 조회
            total_count = query.count()
            
            # 정렬 및 페이지네이션
            posts = query.order_by(desc(CommunityPost.created_at)).offset(skip).limit(limit).all()
            
            # 응답 데이터 구성
            posts_data = []
            for post in posts:
                post_data = {
                    "id": str(post.id),
                    "content": post.content,
                    "tags": post.tags or [],
                    "is_anonymous": post.is_anonymous,
                    "created_at": post.created_at.isoformat(),
                    "dream_id": str(post.dream_id) if post.dream_id else None,
                    "user": {
                        "id": str(post.user_id) if not post.is_anonymous else None,
                        "name": "익명" if post.is_anonymous else f"사용자{str(post.user_id)[:8]}"
                    }
                }
                posts_data.append(post_data)
            
            return {
                "posts": posts_data,
                "total_count": total_count,
                "page": (skip // limit) + 1,
                "page_size": limit,
                "has_next": skip + limit < total_count,
                "has_previous": skip > 0
            }
            
        except Exception as e:
            logger.error(f"커뮤니티 포스트 목록 조회 실패: {str(e)}")
            raise e
    
    async def get_post(self, post_id: str, db: Session) -> Optional[CommunityPostResponse]:
        """
        특정 커뮤니티 포스트 조회
        """
        try:
            post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
            
            if not post:
                return None
            
            return CommunityPostResponse.from_orm(post)
            
        except Exception as e:
            logger.error(f"커뮤니티 포스트 조회 실패: {str(e)}")
            raise e
    
    async def update_post(
        self, 
        post_id: str, 
        user_id: str, 
        post_update: CommunityPostUpdate, 
        db: Session
    ) -> CommunityPostResponse:
        """
        커뮤니티 포스트 수정
        """
        try:
            post = db.query(CommunityPost).filter(
                and_(CommunityPost.id == post_id, CommunityPost.user_id == user_id)
            ).first()
            
            if not post:
                raise ValueError("포스트를 찾을 수 없거나 권한이 없습니다")
            
            # 업데이트할 필드만 수정
            if post_update.content is not None:
                post.content = post_update.content
            
            if post_update.tags is not None:
                post.tags = post_update.tags
            
            if post_update.is_anonymous is not None:
                post.is_anonymous = post_update.is_anonymous
            
            db.commit()
            db.refresh(post)
            
            logger.info(f"커뮤니티 포스트 수정: {post_id}")
            return CommunityPostResponse.from_orm(post)
            
        except Exception as e:
            db.rollback()
            logger.error(f"커뮤니티 포스트 수정 실패: {str(e)}")
            raise e
    
    async def delete_post(self, post_id: str, user_id: str, db: Session) -> bool:
        """
        커뮤니티 포스트 삭제
        """
        try:
            post = db.query(CommunityPost).filter(
                and_(CommunityPost.id == post_id, CommunityPost.user_id == user_id)
            ).first()
            
            if not post:
                raise ValueError("포스트를 찾을 수 없거나 권한이 없습니다")
            
            db.delete(post)
            db.commit()
            
            logger.info(f"커뮤니티 포스트 삭제: {post_id}")
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"커뮤니티 포스트 삭제 실패: {str(e)}")
            raise e
    
    async def get_popular_tags(self, db: Session, limit: int = 20) -> List[Dict[str, Any]]:
        """
        인기 태그 조회
        """
        try:
            # 모든 포스트의 태그를 수집
            posts = db.query(CommunityPost).filter(CommunityPost.tags.isnot(None)).all()
            
            tag_counts = {}
            for post in posts:
                if post.tags:
                    for tag in post.tags:
                        tag_counts[tag] = tag_counts.get(tag, 0) + 1
            
            # 인기순으로 정렬
            popular_tags = sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)
            
            return [
                {"tag": tag, "count": count}
                for tag, count in popular_tags[:limit]
            ]
            
        except Exception as e:
            logger.error(f"인기 태그 조회 실패: {str(e)}")
            raise e
    
    async def search_posts(
        self, 
        query: str, 
        db: Session,
        skip: int = 0,
        limit: int = 20
    ) -> Dict[str, Any]:
        """
        커뮤니티 포스트 검색
        """
        try:
            # 내용에서 검색
            search_query = f"%{query}%"
            posts_query = db.query(CommunityPost).filter(
                CommunityPost.content.ilike(search_query)
            )
            
            total_count = posts_query.count()
            posts = posts_query.order_by(desc(CommunityPost.created_at)).offset(skip).limit(limit).all()
            
            # 응답 데이터 구성
            posts_data = []
            for post in posts:
                post_data = {
                    "id": str(post.id),
                    "content": post.content,
                    "tags": post.tags or [],
                    "is_anonymous": post.is_anonymous,
                    "created_at": post.created_at.isoformat(),
                    "dream_id": str(post.dream_id) if post.dream_id else None,
                    "user": {
                        "id": str(post.user_id) if not post.is_anonymous else None,
                        "name": "익명" if post.is_anonymous else f"사용자{str(post.user_id)[:8]}"
                    }
                }
                posts_data.append(post_data)
            
            return {
                "posts": posts_data,
                "total_count": total_count,
                "page": (skip // limit) + 1,
                "page_size": limit,
                "has_next": skip + limit < total_count,
                "has_previous": skip > 0,
                "query": query
            }
            
        except Exception as e:
            logger.error(f"커뮤니티 포스트 검색 실패: {str(e)}")
            raise e

# 전역 커뮤니티 서비스 인스턴스
community_service = CommunityService()
