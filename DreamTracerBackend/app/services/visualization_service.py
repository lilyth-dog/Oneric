"""
꿈 시각화 서비스
"""
import google.generativeai as genai
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.dream import Dream
from app.models.dream_visualization import DreamVisualization
from app.core.config import settings
import logging
import json
import uuid
import os
from datetime import datetime

logger = logging.getLogger(__name__)

class VisualizationService:
    def __init__(self):
        # Google Gemini API 설정
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-pro')
        
        # 미술 스타일 정의
        self.art_styles = {
            'realistic': '사실적인 사진 같은 스타일',
            'impressionist': '인상주의 화풍',
            'surreal': '초현실주의 스타일',
            'watercolor': '수채화 스타일',
            'oil_painting': '유화 스타일',
            'digital_art': '디지털 아트 스타일',
            'anime': '애니메이션 스타일',
            'fantasy': '판타지 아트 스타일',
            'minimalist': '미니멀리스트 스타일',
            'abstract': '추상화 스타일'
        }
    
    async def generate_dream_visualization(
        self, 
        dream: Dream, 
        art_style: str = 'surreal',
        db: Session = None
    ) -> DreamVisualization:
        """
        꿈을 시각화로 변환
        """
        try:
            # 꿈 내용을 프롬프트로 변환
            prompt = await self._create_visualization_prompt(dream, art_style)
            
            # Gemini API로 이미지 생성 프롬프트 생성
            image_prompt = await self._generate_image_prompt(prompt, art_style)
            
            # 실제 이미지 생성은 외부 서비스 사용 (예: DALL-E, Midjourney API 등)
            # 여기서는 시뮬레이션된 이미지 경로 생성
            image_path = await self._generate_image(image_prompt, art_style)
            
            # 데이터베이스에 시각화 결과 저장
            visualization = DreamVisualization(
                dream_id=dream.id,
                image_path=image_path,
                art_style=art_style,
                prompt_used=image_prompt
            )
            
            if db:
                db.add(visualization)
                db.commit()
                db.refresh(visualization)
            
            logger.info(f"꿈 시각화 생성 완료: {dream.id}, 스타일: {art_style}")
            return visualization
            
        except Exception as e:
            logger.error(f"꿈 시각화 생성 실패: {dream.id}, 오류: {str(e)}")
            raise e
    
    async def _create_visualization_prompt(self, dream: Dream, art_style: str) -> str:
        """
        꿈 내용을 시각화 프롬프트로 변환
        """
        try:
            dream_content = f"""
            꿈 제목: {dream.title or '제목 없음'}
            꿈 내용: {dream.body_text or '내용 없음'}
            꿈 타입: {dream.dream_type or '일반'}
            감정: {', '.join(dream.emotion_tags) if dream.emotion_tags else '없음'}
            등장 인물: {', '.join(dream.characters) if dream.characters else '없음'}
            상징: {', '.join(dream.symbols) if dream.symbols else '없음'}
            장소: {dream.location or '불명'}
            """
            
            style_description = self.art_styles.get(art_style, '일반적인 스타일')
            
            prompt = f"""
            다음 꿈을 {style_description}로 시각화하기 위한 상세한 이미지 생성 프롬프트를 만들어주세요.

            {dream_content}

            다음 조건을 만족하는 프롬프트를 생성해주세요:
            1. 꿈의 핵심 요소들을 포함
            2. 감정과 분위기를 반영
            3. {style_description}의 특징을 살림
            4. 영어로 작성 (이미지 생성 AI용)
            5. 구체적이고 상세한 묘사
            6. 100단어 이내로 간결하게

            프롬프트만 답변해주세요.
            """
            
            response = self.model.generate_content(prompt)
            return response.text.strip()
            
        except Exception as e:
            logger.error(f"시각화 프롬프트 생성 실패: {str(e)}")
            return f"A dream scene with {art_style} style"
    
    async def _generate_image_prompt(self, base_prompt: str, art_style: str) -> str:
        """
        이미지 생성용 최종 프롬프트 생성
        """
        try:
            style_keywords = {
                'realistic': 'photorealistic, high detail, professional photography',
                'impressionist': 'impressionist painting style, soft brushstrokes, light and color',
                'surreal': 'surreal art, dreamlike, impossible elements, Salvador Dali style',
                'watercolor': 'watercolor painting, soft colors, flowing brushstrokes',
                'oil_painting': 'oil painting, rich colors, classical art style',
                'digital_art': 'digital art, modern illustration, clean lines',
                'anime': 'anime style, Japanese animation, vibrant colors',
                'fantasy': 'fantasy art, magical elements, epic composition',
                'minimalist': 'minimalist art, simple composition, clean design',
                'abstract': 'abstract art, non-representational, bold colors'
            }
            
            style_keyword = style_keywords.get(art_style, 'artistic style')
            
            final_prompt = f"{base_prompt}, {style_keyword}, high quality, detailed, beautiful composition"
            
            return final_prompt
            
        except Exception as e:
            logger.error(f"이미지 프롬프트 생성 실패: {str(e)}")
            return base_prompt
    
    async def _generate_image(self, prompt: str, art_style: str) -> str:
        """
        실제 이미지 생성 (시뮬레이션)
        """
        try:
            # 실제 구현에서는 DALL-E, Midjourney, Stable Diffusion 등의 API 사용
            # 여기서는 시뮬레이션된 이미지 경로 생성
            
            # 고유한 파일명 생성
            file_id = str(uuid.uuid4())
            filename = f"dream_visualization_{file_id}.jpg"
            
            # 이미지 저장 경로 (실제로는 클라우드 스토리지 사용)
            image_path = f"visualizations/{filename}"
            
            # TODO: 실제 이미지 생성 API 호출
            # 예: OpenAI DALL-E API
            # response = openai.Image.create(
            #     prompt=prompt,
            #     n=1,
            #     size="1024x1024"
            # )
            # image_url = response['data'][0]['url']
            
            # 시뮬레이션: 더미 이미지 생성
            await self._create_dummy_image(image_path, prompt, art_style)
            
            return image_path
            
        except Exception as e:
            logger.error(f"이미지 생성 실패: {str(e)}")
            raise e
    
    async def _create_dummy_image(self, image_path: str, prompt: str, art_style: str):
        """
        더미 이미지 생성 (개발용)
        """
        try:
            # 실제 구현에서는 이미지 생성 API 사용
            # 여기서는 메타데이터만 저장
            
            # 이미지 디렉토리 생성
            os.makedirs(os.path.dirname(image_path), exist_ok=True)
            
            # 더미 이미지 파일 생성 (실제로는 생성된 이미지 저장)
            with open(image_path, 'w') as f:
                f.write(f"# Dream Visualization\n")
                f.write(f"Prompt: {prompt}\n")
                f.write(f"Style: {art_style}\n")
                f.write(f"Generated: {datetime.now().isoformat()}\n")
            
            logger.info(f"더미 이미지 생성: {image_path}")
            
        except Exception as e:
            logger.error(f"더미 이미지 생성 실패: {str(e)}")
            raise e
    
    async def get_visualization_styles(self) -> Dict[str, str]:
        """
        사용 가능한 미술 스타일 목록 반환
        """
        return self.art_styles
    
    async def get_dream_visualizations(self, dream_id: str, db: Session) -> List[DreamVisualization]:
        """
        꿈의 모든 시각화 조회
        """
        try:
            visualizations = db.query(DreamVisualization).filter(
                DreamVisualization.dream_id == dream_id
            ).order_by(DreamVisualization.created_at.desc()).all()
            
            return visualizations
            
        except Exception as e:
            logger.error(f"꿈 시각화 조회 실패: {dream_id}, 오류: {str(e)}")
            raise e
    
    async def delete_visualization(self, visualization_id: str, db: Session) -> bool:
        """
        시각화 삭제
        """
        try:
            visualization = db.query(DreamVisualization).filter(
                DreamVisualization.id == visualization_id
            ).first()
            
            if not visualization:
                raise ValueError("시각화를 찾을 수 없습니다")
            
            # 이미지 파일 삭제
            if os.path.exists(visualization.image_path):
                os.remove(visualization.image_path)
            
            # 데이터베이스에서 삭제
            db.delete(visualization)
            db.commit()
            
            logger.info(f"시각화 삭제 완료: {visualization_id}")
            return True
            
        except Exception as e:
            logger.error(f"시각화 삭제 실패: {visualization_id}, 오류: {str(e)}")
            raise e

# 전역 시각화 서비스 인스턴스
visualization_service = VisualizationService()
