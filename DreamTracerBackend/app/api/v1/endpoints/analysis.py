"""
꿈 분석 관련 API 엔드포인트
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.schemas.dream import DreamAnalysis
from app.services.dream_service import DreamService
from app.core.security import get_current_user
from app.core.database import get_db
from app.workers.ai_tasks import analyze_dream_task
from celery.result import AsyncResult
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/dreams/{dream_id}/analysis", response_model=DreamAnalysis)
async def get_dream_analysis(
    dream_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """꿈 분석 결과 조회"""
    dream_service = DreamService()
    try:
        # 꿈이 사용자의 것인지 확인
        dream = await dream_service.get_dream(dream_id, current_user.id, db)
        
        # 분석 결과 조회
        from app.models.dream_analysis import DreamAnalysis as DreamAnalysisModel
        analysis = db.query(DreamAnalysisModel).filter(
            DreamAnalysisModel.dream_id == dream_id
        ).first()
        
        if not analysis:
            raise HTTPException(status_code=404, detail="분석 결과를 찾을 수 없습니다")
        
        return DreamAnalysis.from_orm(analysis)
        
    except Exception as e:
        logger.error(f"꿈 분석 조회 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/dreams/{dream_id}/analyze", response_model=dict)
async def request_dream_analysis(
    dream_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """꿈 AI 분석 요청"""
    dream_service = DreamService()
    try:
        # 꿈이 사용자의 것인지 확인
        dream = await dream_service.get_dream(dream_id, current_user.id, db)
        
        # 이미 분석 중이거나 완료된 경우 확인
        if dream.analysis_status == 'processing':
            raise HTTPException(status_code=400, detail="이미 분석 중입니다")
        
        if dream.analysis_status == 'completed':
            raise HTTPException(status_code=400, detail="이미 분석이 완료되었습니다")
        
        # Celery 태스크 시작
        task = analyze_dream_task.delay(dream_id)
        
        return {
            "message": "꿈 분석이 시작되었습니다",
            "task_id": task.id,
            "status": "processing"
        }
        
    except Exception as e:
        logger.error(f"꿈 분석 요청 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/analysis/task/{task_id}")
async def get_analysis_task_status(task_id: str):
    """분석 태스크 상태 조회"""
    try:
        task_result = AsyncResult(task_id)
        
        if task_result.state == 'PENDING':
            return {
                "task_id": task_id,
                "status": "pending",
                "message": "태스크가 대기 중입니다"
            }
        elif task_result.state == 'PROGRESS':
            return {
                "task_id": task_id,
                "status": "processing",
                "message": "분석 중입니다",
                "progress": task_result.info
            }
        elif task_result.state == 'SUCCESS':
            return {
                "task_id": task_id,
                "status": "completed",
                "message": "분석이 완료되었습니다",
                "result": task_result.result
            }
        elif task_result.state == 'FAILURE':
            return {
                "task_id": task_id,
                "status": "failed",
                "message": "분석에 실패했습니다",
                "error": str(task_result.info)
            }
        else:
            return {
                "task_id": task_id,
                "status": task_result.state,
                "message": "알 수 없는 상태입니다"
            }
            
    except Exception as e:
        logger.error(f"태스크 상태 조회 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/analysis/insights/daily")
async def get_daily_insights(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """일일 인사이트 조회"""
    try:
        from app.services.ai_service import ai_service
        
        # 사용자의 일일 인사이트 생성
        insight = await ai_service.generate_daily_insight(str(current_user.id), db)
        
        return {
            "insight": insight,
            "date": "today"
        }
        
    except Exception as e:
        logger.error(f"일일 인사이트 조회 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/analysis/patterns")
async def get_dream_patterns(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
    days: int = Query(30, ge=7, le=365, description="분석할 기간 (일)")
):
    """꿈 패턴 분석"""
    try:
        from datetime import datetime, timedelta
        from collections import Counter
        from app.models.dream import Dream
        
        # 지정된 기간의 꿈들 조회
        start_date = datetime.now() - timedelta(days=days)
        dreams = db.query(Dream).filter(
            Dream.user_id == current_user.id,
            Dream.dream_date >= start_date.date(),
            Dream.body_text.isnot(None)
        ).all()
        
        if not dreams:
            return {
                "patterns": [],
                "message": "분석할 꿈 데이터가 없습니다"
            }
        
        # 패턴 분석
        all_emotions = []
        all_symbols = []
        all_characters = []
        dream_types = []
        lucidity_levels = []
        
        for dream in dreams:
            if dream.emotion_tags:
                all_emotions.extend(dream.emotion_tags)
            if dream.symbols:
                all_symbols.extend(dream.symbols)
            if dream.characters:
                all_characters.extend(dream.characters)
            if dream.dream_type:
                dream_types.append(dream.dream_type)
            if dream.lucidity_level:
                lucidity_levels.append(dream.lucidity_level)
        
        # 가장 많이 나타나는 패턴들
        emotion_patterns = Counter(all_emotions).most_common(5)
        symbol_patterns = Counter(all_symbols).most_common(5)
        character_patterns = Counter(all_characters).most_common(5)
        type_patterns = Counter(dream_types).most_common()
        avg_lucidity = sum(lucidity_levels) / len(lucidity_levels) if lucidity_levels else 0
        
        return {
            "analysis_period": f"{days}일",
            "total_dreams": len(dreams),
            "patterns": {
                "emotions": [{"emotion": emotion, "count": count} for emotion, count in emotion_patterns],
                "symbols": [{"symbol": symbol, "count": count} for symbol, count in symbol_patterns],
                "characters": [{"character": character, "count": count} for character, count in character_patterns],
                "dream_types": [{"type": dream_type, "count": count} for dream_type, count in type_patterns],
                "average_lucidity": round(avg_lucidity, 2)
            }
        }
        
    except Exception as e:
        logger.error(f"꿈 패턴 분석 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/analysis/network")
async def get_dream_network(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """꿈 네트워크 분석"""
    try:
        from app.services.ai_service import ai_service
        
        # 사용자의 꿈들 조회
        from app.models.dream import Dream
        user_dreams = db.query(Dream).filter(
            Dream.user_id == current_user.id,
            Dream.body_text.isnot(None)
        ).all()
        
        if len(user_dreams) < 2:
            return {
                "network": [],
                "message": "네트워크 분석을 위해서는 최소 2개의 꿈이 필요합니다"
            }
        
        # 꿈 간 유사도 계산
        dream_embeddings = {}
        for dream in user_dreams:
            dream_text = f"{dream.title or ''} {dream.body_text or ''}"
            if dream_text.strip():
                embedding = ai_service.embedding_model.encode([dream_text])
                dream_embeddings[str(dream.id)] = embedding[0]
        
        # 유사한 꿈들 찾기
        network_connections = []
        dream_ids = list(dream_embeddings.keys())
        
        for i, dream_id1 in enumerate(dream_ids):
            for dream_id2 in dream_ids[i+1:]:
                embedding1 = dream_embeddings[dream_id1]
                embedding2 = dream_embeddings[dream_id2]
                
                # 코사인 유사도 계산
                import numpy as np
                similarity = np.dot(embedding1, embedding2) / (
                    np.linalg.norm(embedding1) * np.linalg.norm(embedding2)
                )
                
                if similarity > 0.3:  # 임계값 이상인 경우
                    # 꿈 정보 조회
                    dream1 = next(d for d in user_dreams if str(d.id) == dream_id1)
                    dream2 = next(d for d in user_dreams if str(d.id) == dream_id2)
                    
                    network_connections.append({
                        "dream1": {
                            "id": str(dream1.id),
                            "title": dream1.title,
                            "date": dream1.dream_date.isoformat()
                        },
                        "dream2": {
                            "id": str(dream2.id),
                            "title": dream2.title,
                            "date": dream2.dream_date.isoformat()
                        },
                        "similarity": round(float(similarity), 3)
                    })
        
        # 유사도 순으로 정렬
        network_connections.sort(key=lambda x: x["similarity"], reverse=True)
        
        return {
            "network": network_connections[:10],  # 상위 10개만 반환
            "total_connections": len(network_connections)
        }
        
    except Exception as e:
        logger.error(f"꿈 네트워크 분석 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/dreams/{dream_id}/modern-analyze")
async def request_modern_dream_analysis(
    dream_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """현대적 다학제적 꿈 분석 요청"""
    from app.services.ai_service import AIService
    from app.models.dream import Dream
    
    ai_service = AIService()
    try:
        # 꿈 조회
        dream = db.query(Dream).filter(
            Dream.id == dream_id,
            Dream.user_id == current_user.id
        ).first()
        
        if not dream:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="꿈을 찾을 수 없습니다")
        
        # 현대적 분석 수행
        analysis_result = await ai_service.modern_dream_analysis(dream, db)
        
        return {
            "message": "현대적 꿈 분석이 완료되었습니다",
            "analysis_id": analysis_result['analysis_id'],
            "modern_analysis": analysis_result['modern_analysis'],
            "status": analysis_result['status']
        }
        
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/dreams/{dream_id}/modern-analysis")
async def get_modern_dream_analysis_result(
    dream_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """현대적 꿈 분석 결과 조회"""
    from app.services.ai_service import AIService
    
    ai_service = AIService()
    try:
        analysis_result = await ai_service.get_modern_analysis_by_dream_id(dream_id, current_user.id, db)
        return analysis_result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
