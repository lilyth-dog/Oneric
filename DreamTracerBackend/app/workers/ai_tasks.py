"""
AI 분석 Celery 태스크
"""
from celery import current_task
from app.workers.celery_app import celery_app
from app.services.ai_service import ai_service
from app.core.database import SessionLocal
from app.models.dream import Dream
from app.models.dream_analysis import DreamAnalysis
import logging

logger = logging.getLogger(__name__)

@celery_app.task(bind=True, acks_late=True)
def analyze_dream_task(self, dream_id: str):
    """
    비동기적으로 꿈을 분석하는 Celery 태스크
    """
    try:
        # 태스크 상태 업데이트
        current_task.update_state(
            state='PROGRESS',
            meta={'current': 0, 'total': 100, 'status': '분석 시작...'}
        )
        
        db = SessionLocal()
        try:
            # 꿈 조회
            dream = db.query(Dream).filter(Dream.id == dream_id).first()
            if not dream:
                raise ValueError(f"꿈을 찾을 수 없습니다: {dream_id}")
            
            # 분석 상태 업데이트
            current_task.update_state(
                state='PROGRESS',
                meta={'current': 20, 'total': 100, 'status': '기본 내용 분석 중...'}
            )
            
            # AI 분석 수행
            analysis = ai_service.analyze_dream(dream, db)
            
            # 완료 상태 업데이트
            current_task.update_state(
                state='SUCCESS',
                meta={'current': 100, 'total': 100, 'status': '분석 완료'}
            )
            
            logger.info(f"꿈 분석 태스크 완료: {dream_id}")
            return {
                'dream_id': dream_id,
                'analysis_id': str(analysis.id),
                'status': 'completed',
                'summary': analysis.summary_text
            }
            
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"꿈 분석 태스크 실패: {dream_id}, 오류: {str(e)}")
        
        # 실패 상태 업데이트
        current_task.update_state(
            state='FAILURE',
            meta={'current': 0, 'total': 100, 'status': f'분석 실패: {str(e)}'}
        )
        
        # 꿈 분석 상태를 실패로 업데이트
        db = SessionLocal()
        try:
            dream = db.query(Dream).filter(Dream.id == dream_id).first()
            if dream:
                dream.analysis_status = 'failed'
                db.commit()
        finally:
            db.close()
        
        raise e

@celery_app.task
def generate_daily_insights():
    """
    매일 사용자에게 개인화된 인사이트를 생성하는 Celery Beat 태스크
    """
    try:
        logger.info("일일 인사이트 생성 시작...")
        
        db = SessionLocal()
        try:
            # 모든 활성 사용자 조회
            from app.models.user import User
            users = db.query(User).all()
            
            insights_generated = 0
            for user in users:
                try:
                    # 사용자별 인사이트 생성
                    insight = ai_service.generate_daily_insight(str(user.id), db)
                    
                    # TODO: 인사이트를 사용자에게 푸시 알림으로 전송
                    # 또는 별도 테이블에 저장
                    
                    insights_generated += 1
                    logger.info(f"사용자 {user.id} 인사이트 생성 완료")
                    
                except Exception as e:
                    logger.error(f"사용자 {user.id} 인사이트 생성 실패: {str(e)}")
                    continue
            
            logger.info(f"일일 인사이트 생성 완료: {insights_generated}개")
            return {
                'status': 'success',
                'insights_generated': insights_generated,
                'total_users': len(users)
            }
            
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"일일 인사이트 생성 실패: {str(e)}")
        return {
            'status': 'error',
            'error': str(e)
        }

@celery_app.task
def cleanup_old_analyses():
    """
    오래된 분석 결과를 정리하는 태스크
    """
    try:
        logger.info("오래된 분석 결과 정리 시작...")
        
        db = SessionLocal()
        try:
            from datetime import datetime, timedelta
            
            # 30일 이상 된 분석 결과 조회
            cutoff_date = datetime.now() - timedelta(days=30)
            
            old_analyses = db.query(DreamAnalysis).filter(
                DreamAnalysis.created_at < cutoff_date
            ).all()
            
            deleted_count = 0
            for analysis in old_analyses:
                # 관련된 꿈이 삭제된 경우에만 분석 결과 삭제
                dream = db.query(Dream).filter(Dream.id == analysis.dream_id).first()
                if not dream:
                    db.delete(analysis)
                    deleted_count += 1
            
            db.commit()
            
            logger.info(f"오래된 분석 결과 정리 완료: {deleted_count}개 삭제")
            return {
                'status': 'success',
                'deleted_count': deleted_count
            }
            
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"오래된 분석 결과 정리 실패: {str(e)}")
        return {
            'status': 'error',
            'error': str(e)
        }

@celery_app.task
def update_dream_network():
    """
    꿈 네트워크 그래프를 업데이트하는 태스크
    """
    try:
        logger.info("꿈 네트워크 업데이트 시작...")
        
        db = SessionLocal()
        try:
            # 모든 꿈 조회
            dreams = db.query(Dream).filter(
                Dream.body_text.isnot(None),
                Dream.body_text != ''
            ).all()
            
            # 네트워크 그래프 초기화
            ai_service.dream_network.clear()
            
            # 꿈들을 노드로 추가
            for dream in dreams:
                ai_service.dream_network.add_node(
                    str(dream.id),
                    user_id=str(dream.user_id),
                    dream_date=dream.dream_date,
                    title=dream.title,
                    body_text=dream.body_text
                )
            
            # 유사한 꿈들 간의 엣지 추가
            dream_embeddings = {}
            for dream in dreams:
                dream_text = f"{dream.title or ''} {dream.body_text or ''}"
                if dream_text.strip():
                    embedding = ai_service.embedding_model.encode([dream_text])
                    dream_embeddings[str(dream.id)] = embedding[0]
            
            # 유사도 계산 및 엣지 추가
            dream_ids = list(dream_embeddings.keys())
            for i, dream_id1 in enumerate(dream_ids):
                for dream_id2 in dream_ids[i+1:]:
                    embedding1 = dream_embeddings[dream_id1]
                    embedding2 = dream_embeddings[dream_id2]
                    
                    # 코사인 유사도 계산
                    similarity = np.dot(embedding1, embedding2) / (
                        np.linalg.norm(embedding1) * np.linalg.norm(embedding2)
                    )
                    
                    # 임계값 이상인 경우 엣지 추가
                    if similarity > 0.5:
                        ai_service.dream_network.add_edge(
                            dream_id1, dream_id2, weight=similarity
                        )
            
            logger.info(f"꿈 네트워크 업데이트 완료: {len(dreams)}개 노드, {ai_service.dream_network.number_of_edges()}개 엣지")
            return {
                'status': 'success',
                'nodes': len(dreams),
                'edges': ai_service.dream_network.number_of_edges()
            }
            
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"꿈 네트워크 업데이트 실패: {str(e)}")
        return {
            'status': 'error',
            'error': str(e)
        }
