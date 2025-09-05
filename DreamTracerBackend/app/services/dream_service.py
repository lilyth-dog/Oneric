"""
꿈 서비스
"""
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_
from app.models.dream import Dream
from app.models.dream_analysis import DreamAnalysis
from app.schemas.dream import (
    DreamCreate, DreamUpdate, DreamResponse, DreamAnalysis as DreamAnalysisSchema,
    DreamListResponse, DreamStats, AudioUploadResponse
)
from typing import List, Optional, Dict, Any
from datetime import datetime, date, timedelta
import logging
import os
import uuid

logger = logging.getLogger(__name__)

class DreamService:
    def __init__(self):
        pass

    async def create_dream(self, user_id: str, dream_data: DreamCreate, db: Session) -> DreamResponse:
        """새 꿈 기록 생성"""
        try:
            # 감정 태그를 문자열 리스트로 변환
            emotion_tags = [tag.value if hasattr(tag, 'value') else str(tag) for tag in dream_data.emotion_tags] if dream_data.emotion_tags else []
            
            db_dream = Dream(
                user_id=user_id,
                dream_date=dream_data.dream_date,
                title=dream_data.title,
                body_text=dream_data.body_text,
                audio_file_path=dream_data.audio_file_path,
                lucidity_level=dream_data.lucidity_level,
                emotion_tags=emotion_tags,
                is_shared=dream_data.is_shared,
                dream_type=dream_data.dream_type,
                sleep_quality=dream_data.sleep_quality,
                dream_duration=dream_data.dream_duration,
                location=dream_data.location,
                characters=dream_data.characters or [],
                symbols=dream_data.symbols or []
            )
            
            db.add(db_dream)
            db.commit()
            db.refresh(db_dream)
            
            logger.info(f"새 꿈 기록 생성: {db_dream.id}")
            return DreamResponse.from_orm(db_dream)
            
        except Exception as e:
            db.rollback()
            logger.error(f"꿈 기록 생성 실패: {str(e)}")
            raise

    async def get_user_dreams(
        self, 
        user_id: str, 
        skip: int = 0, 
        limit: int = 20, 
        db: Session = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        dream_type: Optional[str] = None,
        emotion_filter: Optional[List[str]] = None
    ) -> DreamListResponse:
        """사용자의 꿈 목록 조회 (필터링 및 페이지네이션)"""
        try:
            query = db.query(Dream).filter(Dream.user_id == user_id)
            
            # 날짜 필터
            if start_date:
                query = query.filter(Dream.dream_date >= start_date)
            if end_date:
                query = query.filter(Dream.dream_date <= end_date)
            
            # 꿈 타입 필터
            if dream_type:
                query = query.filter(Dream.dream_type == dream_type)
            
            # 감정 필터 (JSON 배열에서 검색)
            if emotion_filter:
                for emotion in emotion_filter:
                    query = query.filter(Dream.emotion_tags.contains([emotion]))
            
            # 총 개수 조회
            total_count = query.count()
            
            # 정렬 및 페이지네이션
            dreams = query.order_by(desc(Dream.dream_date)).offset(skip).limit(limit).all()
            
            # 페이지네이션 정보 계산
            has_next = skip + limit < total_count
            has_previous = skip > 0
            page = (skip // limit) + 1
            
            return DreamListResponse(
                dreams=[DreamResponse.from_orm(dream) for dream in dreams],
                total_count=total_count,
                page=page,
                page_size=limit,
                has_next=has_next,
                has_previous=has_previous
            )
            
        except Exception as e:
            logger.error(f"꿈 목록 조회 실패: {str(e)}")
            raise

    async def get_dream(self, dream_id: str, user_id: str, db: Session) -> DreamResponse:
        """특정 꿈 상세 조회"""
        try:
            dream = db.query(Dream).filter(
                Dream.id == dream_id,
                Dream.user_id == user_id
            ).first()
            
            if not dream:
                raise ValueError("꿈을 찾을 수 없습니다")
            
            return DreamResponse.from_orm(dream)
            
        except Exception as e:
            logger.error(f"꿈 조회 실패: {str(e)}")
            raise

    async def update_dream(self, dream_id: str, user_id: str, dream_update: DreamUpdate, db: Session) -> DreamResponse:
        """꿈 기록 수정"""
        try:
            dream = db.query(Dream).filter(
                Dream.id == dream_id,
                Dream.user_id == user_id
            ).first()
            
            if not dream:
                raise ValueError("꿈을 찾을 수 없습니다")
            
            # 업데이트할 필드만 수정
            if dream_update.title is not None:
                dream.title = dream_update.title
            
            if dream_update.body_text is not None:
                dream.body_text = dream_update.body_text
            
            if dream_update.audio_file_path is not None:
                dream.audio_file_path = dream_update.audio_file_path
            
            if dream_update.lucidity_level is not None:
                dream.lucidity_level = dream_update.lucidity_level
            
            if dream_update.emotion_tags is not None:
                emotion_tags = [tag.value if hasattr(tag, 'value') else str(tag) for tag in dream_update.emotion_tags]
                dream.emotion_tags = emotion_tags
            
            if dream_update.is_shared is not None:
                dream.is_shared = dream_update.is_shared
            
            if dream_update.dream_type is not None:
                dream.dream_type = dream_update.dream_type
            
            if dream_update.sleep_quality is not None:
                dream.sleep_quality = dream_update.sleep_quality
            
            if dream_update.dream_duration is not None:
                dream.dream_duration = dream_update.dream_duration
            
            if dream_update.location is not None:
                dream.location = dream_update.location
            
            if dream_update.characters is not None:
                dream.characters = dream_update.characters
            
            if dream_update.symbols is not None:
                dream.symbols = dream_update.symbols
            
            db.commit()
            db.refresh(dream)
            
            logger.info(f"꿈 기록 수정: {dream_id}")
            return DreamResponse.from_orm(dream)
            
        except Exception as e:
            db.rollback()
            logger.error(f"꿈 기록 수정 실패: {str(e)}")
            raise

    async def delete_dream(self, dream_id: str, user_id: str, db: Session) -> bool:
        """꿈 기록 삭제"""
        try:
            dream = db.query(Dream).filter(
                Dream.id == dream_id,
                Dream.user_id == user_id
            ).first()
            
            if not dream:
                raise ValueError("꿈을 찾을 수 없습니다")
            
            db.delete(dream)
            db.commit()
            
            logger.info(f"꿈 기록 삭제: {dream_id}")
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"꿈 기록 삭제 실패: {str(e)}")
            raise

    async def analyze_dream(self, dream_id: str, user_id: str, db: Session) -> DreamAnalysisSchema:
        """꿈 AI 분석 요청"""
        try:
            dream = db.query(Dream).filter(
                Dream.id == dream_id,
                Dream.user_id == user_id
            ).first()
            
            if not dream:
                raise ValueError("꿈을 찾을 수 없습니다")
            
            # 분석 상태 업데이트
            dream.analysis_status = 'processing'
            db.commit()
            
            # Celery 작업 큐에 AI 분석 작업 추가
            from app.workers.ai_tasks import analyze_dream_task
            task = analyze_dream_task.delay(dream_id)
            
            # 임시 분석 결과 반환 (실제 분석은 백그라운드에서 진행)
            analysis = DreamAnalysisSchema(
                id="temp-analysis-id",
                dream_id=dream_id,
                summary_text="분석 중입니다...",
                keywords=["분석중"],
                emotional_flow_text="감정 분석 중입니다...",
                symbol_analysis={"status": "processing", "task_id": task.id},
                reflective_question="분석이 완료되면 질문이 제공됩니다.",
                deja_vu_analysis={"status": "processing"},
                created_at=datetime.utcnow()
            )
            
            logger.info(f"꿈 분석 요청: {dream_id}, 태스크 ID: {task.id}")
            return analysis
            
        except Exception as e:
            logger.error(f"꿈 분석 요청 실패: {str(e)}")
            raise

    async def get_dream_stats(self, user_id: str, db: Session) -> DreamStats:
        """사용자의 꿈 통계 조회"""
        try:
            # 기본 통계
            total_dreams = db.query(Dream).filter(Dream.user_id == user_id).count()
            
            # 이번 달 꿈 개수
            today = date.today()
            month_start = today.replace(day=1)
            dreams_this_month = db.query(Dream).filter(
                and_(Dream.user_id == user_id, Dream.dream_date >= month_start)
            ).count()
            
            # 이번 주 꿈 개수
            week_start = today - timedelta(days=today.weekday())
            dreams_this_week = db.query(Dream).filter(
                and_(Dream.user_id == user_id, Dream.dream_date >= week_start)
            ).count()
            
            # 평균 명료도
            avg_lucidity_result = db.query(func.avg(Dream.lucidity_level)).filter(
                and_(Dream.user_id == user_id, Dream.lucidity_level.isnot(None))
            ).scalar()
            average_lucidity = float(avg_lucidity_result) if avg_lucidity_result else None
            
            # 평균 수면 품질
            avg_sleep_quality_result = db.query(func.avg(Dream.sleep_quality)).filter(
                and_(Dream.user_id == user_id, Dream.sleep_quality.isnot(None))
            ).scalar()
            sleep_quality_average = float(avg_sleep_quality_result) if avg_sleep_quality_result else None
            
            # 가장 많이 나타나는 감정 (JSON 배열에서 추출)
            # TODO: PostgreSQL JSON 함수를 사용하여 감정 태그 통계 계산
            most_common_emotions = []
            
            # 가장 많이 나타나는 상징
            # TODO: 상징 통계 계산
            most_common_symbols = []
            
            # 꿈 타입 분포
            dream_types_result = db.query(
                Dream.dream_type, func.count(Dream.id)
            ).filter(
                and_(Dream.user_id == user_id, Dream.dream_type.isnot(None))
            ).group_by(Dream.dream_type).all()
            
            dream_types_distribution = {dream_type: count for dream_type, count in dream_types_result}
            
            return DreamStats(
                total_dreams=total_dreams,
                dreams_this_month=dreams_this_month,
                dreams_this_week=dreams_this_week,
                average_lucidity=average_lucidity,
                most_common_emotions=most_common_emotions,
                most_common_symbols=most_common_symbols,
                dream_types_distribution=dream_types_distribution,
                sleep_quality_average=sleep_quality_average
            )
            
        except Exception as e:
            logger.error(f"꿈 통계 조회 실패: {str(e)}")
            raise

    async def upload_audio(self, user_id: str, audio_file, db: Session) -> AudioUploadResponse:
        """오디오 파일 업로드"""
        try:
            # 파일 정보 추출
            file_size = len(audio_file)
            file_extension = audio_file.filename.split('.')[-1] if audio_file.filename else 'wav'
            
            # 고유한 파일명 생성
            file_id = str(uuid.uuid4())
            filename = f"{user_id}/{file_id}.{file_extension}"
            
            # TODO: 실제 클라우드 스토리지 업로드 구현
            # 예: AWS S3, Google Cloud Storage 등
            audio_file_path = f"audio/{filename}"
            
            # 임시로 로컬 저장 (개발 환경)
            upload_dir = "uploads/audio"
            os.makedirs(upload_dir, exist_ok=True)
            
            with open(f"{upload_dir}/{filename}", "wb") as buffer:
                content = await audio_file.read()
                buffer.write(content)
            
            # TODO: 오디오 파일 길이 추출 (ffmpeg 등 사용)
            duration = None
            
            return AudioUploadResponse(
                audio_file_path=audio_file_path,
                file_size=file_size,
                duration=duration,
                upload_url=None  # 클라우드 스토리지 URL
            )
            
        except Exception as e:
            logger.error(f"오디오 업로드 실패: {str(e)}")
            raise

    async def search_dreams(
        self, 
        user_id: str, 
        query: str, 
        db: Session,
        skip: int = 0,
        limit: int = 20
    ) -> DreamListResponse:
        """꿈 내용 검색"""
        try:
            # 제목과 내용에서 검색
            search_query = f"%{query}%"
            dreams_query = db.query(Dream).filter(
                and_(
                    Dream.user_id == user_id,
                    (Dream.title.ilike(search_query) | Dream.body_text.ilike(search_query))
                )
            )
            
            total_count = dreams_query.count()
            dreams = dreams_query.order_by(desc(Dream.dream_date)).offset(skip).limit(limit).all()
            
            has_next = skip + limit < total_count
            has_previous = skip > 0
            page = (skip // limit) + 1
            
            return DreamListResponse(
                dreams=[DreamResponse.from_orm(dream) for dream in dreams],
                total_count=total_count,
                page=page,
                page_size=limit,
                has_next=has_next,
                has_previous=has_previous
            )
            
        except Exception as e:
            logger.error(f"꿈 검색 실패: {str(e)}")
            raise
