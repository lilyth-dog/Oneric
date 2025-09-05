"""
AI 분석 서비스 - 현대적 다학제적 꿈 분석 시스템 통합
"""
import google.generativeai as genai
from sentence_transformers import SentenceTransformer
import networkx as nx
import numpy as np
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.dream import Dream
from app.models.dream_analysis import DreamAnalysis
from app.core.config import settings
from app.services.modern_dream_analysis import ModernDreamAnalysisSystem
import logging
import json
import uuid

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        # Google Gemini API 설정
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-pro')
        
        # 한국어 문장 임베딩 모델 로드
        self.embedding_model = SentenceTransformer('jhgan/ko-sbert-nli')
        
        # 꿈 네트워크 그래프
        self.dream_network = nx.Graph()
        
        # 현대적 다학제적 분석 시스템
        self.modern_analysis_system = ModernDreamAnalysisSystem()
        
    async def analyze_dream(self, dream: Dream, db: Session) -> DreamAnalysis:
        """
        꿈 AI 분석 수행
        """
        try:
            # 1. 기본 분석 (요약, 키워드, 감정 흐름)
            basic_analysis = await self._analyze_basic_content(dream)
            
            # 2. 상징 분석
            symbol_analysis = await self._analyze_symbols(dream)
            
            # 3. 데자뷰 분석 (유사한 꿈 찾기)
            deja_vu_analysis = await self._analyze_deja_vu(dream, db)
            
            # 4. 반성적 질문 생성
            reflective_question = await self._generate_reflective_question(dream, basic_analysis)
            
            # 분석 결과를 데이터베이스에 저장
            analysis = DreamAnalysis(
                dream_id=dream.id,
                summary_text=basic_analysis.get('summary'),
                keywords=basic_analysis.get('keywords', []),
                emotional_flow_text=basic_analysis.get('emotional_flow'),
                symbol_analysis=symbol_analysis,
                reflective_question=reflective_question,
                deja_vu_analysis=deja_vu_analysis
            )
            
            db.add(analysis)
            db.commit()
            db.refresh(analysis)
            
            # 꿈 분석 상태 업데이트
            dream.analysis_status = 'completed'
            db.commit()
            
            logger.info(f"꿈 분석 완료: {dream.id}")
            return analysis
            
        except Exception as e:
            logger.error(f"꿈 분석 실패: {dream.id}, 오류: {str(e)}")
            # 분석 상태를 실패로 업데이트
            dream.analysis_status = 'failed'
            db.commit()
            raise e
    
    async def _analyze_basic_content(self, dream: Dream) -> Dict[str, Any]:
        """
        기본 꿈 내용 분석 (요약, 키워드, 감정 흐름)
        """
        try:
            # 꿈 내용을 프롬프트로 구성
            dream_content = f"""
            꿈 제목: {dream.title or '제목 없음'}
            꿈 내용: {dream.body_text or '내용 없음'}
            꿈 타입: {dream.dream_type or '일반'}
            명료도: {dream.lucidity_level or 3}/5
            감정 태그: {', '.join(dream.emotion_tags) if dream.emotion_tags else '없음'}
            등장 인물: {', '.join(dream.characters) if dream.characters else '없음'}
            상징: {', '.join(dream.symbols) if dream.symbols else '없음'}
            장소: {dream.location or '불명'}
            """
            
            # Gemini API로 분석 요청
            prompt = f"""
            다음 꿈을 분석해주세요. 한국어로 답변해주세요.

            {dream_content}

            다음 형식으로 분석 결과를 제공해주세요:

            1. 요약 (2-3문장으로 꿈의 핵심 내용 요약)
            2. 키워드 (꿈에서 중요한 키워드 5-10개)
            3. 감정 흐름 (꿈에서 느낀 감정의 변화와 흐름)

            JSON 형식으로 답변해주세요:
            {{
                "summary": "꿈의 요약",
                "keywords": ["키워드1", "키워드2", "키워드3"],
                "emotional_flow": "감정 흐름 설명"
            }}
            """
            
            response = self.model.generate_content(prompt)
            result_text = response.text
            
            # JSON 파싱 시도
            try:
                # JSON 부분만 추출
                json_start = result_text.find('{')
                json_end = result_text.rfind('}') + 1
                if json_start != -1 and json_end != -1:
                    json_text = result_text[json_start:json_end]
                    result = json.loads(json_text)
                else:
                    # JSON 파싱 실패 시 기본값 반환
                    result = {
                        "summary": "꿈 분석이 완료되었습니다.",
                        "keywords": ["꿈", "분석"],
                        "emotional_flow": "감정 분석이 완료되었습니다."
                    }
            except json.JSONDecodeError:
                # JSON 파싱 실패 시 기본값 반환
                result = {
                    "summary": "꿈 분석이 완료되었습니다.",
                    "keywords": ["꿈", "분석"],
                    "emotional_flow": "감정 분석이 완료되었습니다."
                }
            
            return result
            
        except Exception as e:
            logger.error(f"기본 내용 분석 실패: {str(e)}")
            return {
                "summary": "꿈 분석 중 오류가 발생했습니다.",
                "keywords": ["오류"],
                "emotional_flow": "감정 분석을 완료할 수 없습니다."
            }
    
    async def _analyze_symbols(self, dream: Dream) -> Dict[str, Any]:
        """
        꿈의 상징 분석
        """
        try:
            if not dream.symbols:
                return {"symbols": [], "interpretations": []}
            
            symbols_text = ', '.join(dream.symbols)
            
            prompt = f"""
            다음 꿈의 상징들을 분석해주세요. 한국어로 답변해주세요.

            꿈의 상징들: {symbols_text}
            꿈의 전체 맥락: {dream.body_text or '내용 없음'}

            각 상징에 대한 해석을 제공해주세요. JSON 형식으로 답변해주세요:
            {{
                "symbols": [
                    {{
                        "symbol": "상징명",
                        "interpretation": "상징 해석",
                        "significance": "꿈에서의 의미"
                    }}
                ]
            }}
            """
            
            response = self.model.generate_content(prompt)
            result_text = response.text
            
            try:
                json_start = result_text.find('{')
                json_end = result_text.rfind('}') + 1
                if json_start != -1 and json_end != -1:
                    json_text = result_text[json_start:json_end]
                    result = json.loads(json_text)
                else:
                    result = {"symbols": [], "interpretations": []}
            except json.JSONDecodeError:
                result = {"symbols": [], "interpretations": []}
            
            return result
            
        except Exception as e:
            logger.error(f"상징 분석 실패: {str(e)}")
            return {"symbols": [], "interpretations": []}
    
    async def _analyze_deja_vu(self, dream: Dream, db: Session) -> Dict[str, Any]:
        """
        데자뷰 분석 (유사한 꿈 찾기)
        """
        try:
            # 현재 꿈의 임베딩 생성
            dream_text = f"{dream.title or ''} {dream.body_text or ''}"
            if not dream_text.strip():
                return {"related_dreams": [], "similarity_scores": []}
            
            current_embedding = self.embedding_model.encode([dream_text])
            
            # 사용자의 다른 꿈들 조회
            user_dreams = db.query(Dream).filter(
                Dream.user_id == dream.user_id,
                Dream.id != dream.id,
                Dream.body_text.isnot(None)
            ).limit(50).all()
            
            if not user_dreams:
                return {"related_dreams": [], "similarity_scores": []}
            
            # 유사도 계산
            similarities = []
            for other_dream in user_dreams:
                other_text = f"{other_dream.title or ''} {other_dream.body_text or ''}"
                other_embedding = self.embedding_model.encode([other_text])
                
                # 코사인 유사도 계산
                similarity = np.dot(current_embedding[0], other_embedding[0]) / (
                    np.linalg.norm(current_embedding[0]) * np.linalg.norm(other_embedding[0])
                )
                
                if similarity > 0.3:  # 임계값 이상인 경우만 포함
                    similarities.append({
                        "dream_id": str(other_dream.id),
                        "similarity_score": float(similarity),
                        "dream_date": other_dream.dream_date.isoformat(),
                        "title": other_dream.title
                    })
            
            # 유사도 순으로 정렬
            similarities.sort(key=lambda x: x["similarity_score"], reverse=True)
            
            return {
                "related_dreams": similarities[:5],  # 상위 5개만 반환
                "total_compared": len(user_dreams)
            }
            
        except Exception as e:
            logger.error(f"데자뷰 분석 실패: {str(e)}")
            return {"related_dreams": [], "similarity_scores": []}
    
    async def _generate_reflective_question(self, dream: Dream, basic_analysis: Dict[str, Any]) -> str:
        """
        반성적 질문 생성
        """
        try:
            dream_content = f"""
            꿈 내용: {dream.body_text or '내용 없음'}
            감정: {', '.join(dream.emotion_tags) if dream.emotion_tags else '없음'}
            분석 요약: {basic_analysis.get('summary', '')}
            """
            
            prompt = f"""
            다음 꿈을 바탕으로 사용자가 자신을 성찰할 수 있는 질문을 하나 생성해주세요.
            한국어로 답변해주세요.

            {dream_content}

            질문은 다음 조건을 만족해야 합니다:
            1. 개인적이고 깊이 있는 성찰을 유도
            2. 꿈의 내용과 연결된 의미 있는 질문
            3. 한 문장으로 간결하게 표현
            4. "~에 대해 어떻게 생각하시나요?" 같은 형식

            질문만 답변해주세요.
            """
            
            response = self.model.generate_content(prompt)
            question = response.text.strip()
            
            # 질문이 너무 길면 자르기
            if len(question) > 200:
                question = question[:200] + "..."
            
            return question
            
        except Exception as e:
            logger.error(f"반성적 질문 생성 실패: {str(e)}")
            return "이 꿈이 당신에게 어떤 의미를 주나요?"
    
    async def generate_daily_insight(self, user_id: str, db: Session) -> Dict[str, Any]:
        """
        일일 인사이트 생성
        """
        try:
            # 최근 7일간의 꿈들 조회
            from datetime import datetime, timedelta
            week_ago = datetime.now() - timedelta(days=7)
            
            recent_dreams = db.query(Dream).filter(
                Dream.user_id == user_id,
                Dream.dream_date >= week_ago.date(),
                Dream.body_text.isnot(None)
            ).all()
            
            if not recent_dreams:
                return {
                    "insight": "최근 기록된 꿈이 없습니다. 꿈을 기록해보세요!",
                    "pattern": "데이터 부족",
                    "recommendation": "꿈을 꾸면 바로 기록해보세요."
                }
            
            # 꿈 데이터 분석
            dream_texts = [f"{dream.title or ''} {dream.body_text or ''}" for dream in recent_dreams]
            all_emotions = []
            all_symbols = []
            
            for dream in recent_dreams:
                if dream.emotion_tags:
                    all_emotions.extend(dream.emotion_tags)
                if dream.symbols:
                    all_symbols.extend(dream.symbols)
            
            # 가장 많이 나타나는 감정과 상징
            from collections import Counter
            common_emotions = Counter(all_emotions).most_common(3)
            common_symbols = Counter(all_symbols).most_common(3)
            
            # 인사이트 생성
            dreams_summary = f"""
            최근 7일간 {len(recent_dreams)}개의 꿈을 기록하셨습니다.
            주요 감정: {', '.join([emotion for emotion, _ in common_emotions]) if common_emotions else '없음'}
            주요 상징: {', '.join([symbol for symbol, _ in common_symbols]) if common_symbols else '없음'}
            """
            
            prompt = f"""
            다음 사용자의 최근 꿈 데이터를 바탕으로 개인화된 인사이트를 생성해주세요.
            한국어로 답변해주세요.

            {dreams_summary}

            다음 형식으로 답변해주세요:
            {{
                "insight": "꿈 패턴에 대한 인사이트 (2-3문장)",
                "pattern": "발견된 패턴",
                "recommendation": "개선을 위한 추천사항"
            }}
            """
            
            response = self.model.generate_content(prompt)
            result_text = response.text
            
            try:
                json_start = result_text.find('{')
                json_end = result_text.rfind('}') + 1
                if json_start != -1 and json_end != -1:
                    json_text = result_text[json_start:json_end]
                    result = json.loads(json_text)
                else:
                    result = {
                        "insight": "꿈을 꾸고 기록하는 습관이 좋습니다!",
                        "pattern": "꿈 기록 습관",
                        "recommendation": "계속해서 꿈을 기록해보세요."
                    }
            except json.JSONDecodeError:
                result = {
                    "insight": "꿈을 꾸고 기록하는 습관이 좋습니다!",
                    "pattern": "꿈 기록 습관",
                    "recommendation": "계속해서 꿈을 기록해보세요."
                }
            
            return result
            
        except Exception as e:
            logger.error(f"일일 인사이트 생성 실패: {str(e)}")
            return {
                "insight": "꿈 분석 중 오류가 발생했습니다.",
                "pattern": "오류",
                "recommendation": "잠시 후 다시 시도해주세요."
            }
    
    async def modern_dream_analysis(self, dream: Dream, db: Session) -> Dict[str, Any]:
        """
        현대적 다학제적 꿈 분석 수행
        """
        try:
            logger.info(f"현대적 꿈 분석 시작: {dream.id}")
            
            # 사용자 프로필 구성
            user_profile = await self._build_user_profile(dream.user_id, db)
            
            # 꿈 텍스트 준비
            dream_text = f"{dream.title or ''} {dream.body_text or ''}"
            
            # 현대적 분석 시스템으로 분석
            analysis_result = self.modern_analysis_system.analyze_dream(dream_text, user_profile)
            
            # 분석 결과를 데이터베이스에 저장
            analysis = DreamAnalysis(
                dream_id=dream.id,
                summary_text=analysis_result['comprehensive_insights'][0] if analysis_result['comprehensive_insights'] else "현대적 분석이 완료되었습니다.",
                keywords=analysis_result['analyses'].get('cognitive', {}).get('cognitive_functions', []),
                emotional_flow_text=analysis_result['analyses'].get('emotional', {}).get('insights', ['감정 분석이 완료되었습니다.'])[0],
                symbol_analysis=analysis_result['analyses'].get('symbolic', {}),
                reflective_question=analysis_result['recommendations'][0] if analysis_result['recommendations'] else "이 꿈이 당신에게 어떤 의미를 주나요?",
                deja_vu_analysis=analysis_result['analyses'].get('pattern', {}),
                created_at=datetime.utcnow()
            )
            
            db.add(analysis)
            db.commit()
            db.refresh(analysis)
            
            # 꿈 분석 상태 업데이트
            dream.analysis_status = 'completed'
            db.commit()
            
            logger.info(f"현대적 꿈 분석 완료: {dream.id}")
            
            return {
                'analysis_id': str(analysis.id),
                'modern_analysis': analysis_result,
                'status': 'completed'
            }
            
        except Exception as e:
            logger.error(f"현대적 꿈 분석 실패: {dream.id}, 오류: {str(e)}")
            # 분석 상태를 실패로 업데이트
            dream.analysis_status = 'failed'
            db.commit()
            raise e
    
    async def _build_user_profile(self, user_id: str, db: Session) -> Dict[str, Any]:
        """
        사용자 프로필 구성
        """
        try:
            # 사용자의 꿈 히스토리 가져오기
            user_dreams = db.query(Dream).filter(
                Dream.user_id == user_id,
                Dream.body_text.isnot(None)
            ).order_by(Dream.dream_date.desc()).limit(50).all()
            
            # 꿈 히스토리를 딕셔너리 형태로 변환
            dream_history = []
            for dream in user_dreams:
                dream_history.append({
                    'id': str(dream.id),
                    'title': dream.title,
                    'body_text': dream.body_text,
                    'emotion_tags': dream.emotion_tags or [],
                    'symbols': dream.symbols or [],
                    'lucidity_level': dream.lucidity_level,
                    'dream_date': dream.dream_date.isoformat() if dream.dream_date else None
                })
            
            # 사용자 프로필 구성
            user_profile = {
                'user_id': user_id,
                'cultural_background': 'korean',  # 기본값, 나중에 사용자 설정에서 가져올 수 있음
                'dream_history': dream_history,
                'preferences': {
                    'preferred_analysis_type': 'balanced'  # 기본값
                }
            }
            
            return user_profile
            
        except Exception as e:
            logger.error(f"사용자 프로필 구성 실패: {str(e)}")
            return {
                'user_id': user_id,
                'cultural_background': 'korean',
                'dream_history': [],
                'preferences': {'preferred_analysis_type': 'balanced'}
            }
    
    async def get_modern_analysis_by_dream_id(self, dream_id: str, user_id: str, db: Session) -> Dict[str, Any]:
        """특정 꿈의 현대적 분석 결과를 조회"""
        try:
            dream = db.query(Dream).filter(Dream.id == dream_id, Dream.user_id == user_id).first()
            if not dream:
                raise ValueError("꿈을 찾을 수 없습니다.")
            
            analysis = db.query(DreamAnalysis).filter(DreamAnalysis.dream_id == dream_id).first()
            if not analysis:
                raise ValueError("해당 꿈에 대한 분석 결과를 찾을 수 없습니다.")
            
            # 사용자 프로필 구성
            user_profile = await self._build_user_profile(user_id, db)
            
            # 꿈 텍스트로 현대적 분석 재실행 (캐시된 결과가 있다면 사용)
            dream_text = f"{dream.title or ''} {dream.body_text or ''}"
            modern_analysis = self.modern_analysis_system.analyze_dream(dream_text, user_profile)
            
            return {
                'dream_id': dream_id,
                'analysis_id': str(analysis.id),
                'modern_analysis': modern_analysis,
                'created_at': analysis.created_at
            }
            
        except Exception as e:
            logger.error(f"현대적 분석 결과 조회 실패: {str(e)}")
            raise e

# 전역 AI 서비스 인스턴스
ai_service = AIService()
