"""
구독 서비스
"""
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.subscription import SubscriptionPlan, SubscriptionStatus
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class SubscriptionService:
    def __init__(self):
        # 구독 플랜 정의
        self.plans = {
            'free': {
                'name': '무료',
                'price': 0,
                'currency': 'KRW',
                'ai_analysis_limit': 5,  # 월 5회
                'features': [
                    '기본 꿈 기록',
                    '월 5회 AI 분석',
                    '기본 통계',
                    '커뮤니티 참여'
                ]
            },
            'plus': {
                'name': '꿈결 플러스',
                'price': 5900,
                'currency': 'KRW',
                'ai_analysis_limit': -1,  # 무제한
                'features': [
                    '무제한 AI 분석',
                    '고급 통계 및 인사이트',
                    '꿈 시각화',
                    '데자뷰 분석',
                    '우선 고객 지원',
                    '모든 커뮤니티 기능'
                ]
            }
        }
    
    async def get_subscription_plans(self) -> Dict[str, Any]:
        """
        구독 플랜 목록 조회
        """
        return {
            "plans": self.plans,
            "current_time": datetime.now().isoformat()
        }
    
    async def get_user_subscription(self, user_id: str, db: Session) -> Dict[str, Any]:
        """
        사용자 구독 정보 조회
        """
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                raise ValueError("사용자를 찾을 수 없습니다")
            
            # 구독 상태 확인
            is_active = False
            if user.subscription_plan == 'plus' and user.subscription_expires_at:
                is_active = user.subscription_expires_at > datetime.now()
            
            # 현재 플랜 정보
            current_plan = self.plans.get(user.subscription_plan, self.plans['free'])
            
            # 사용량 계산 (AI 분석 횟수)
            usage = await self._calculate_ai_usage(user_id, db)
            
            return {
                "user_id": str(user.id),
                "current_plan": user.subscription_plan,
                "plan_details": current_plan,
                "is_active": is_active,
                "expires_at": user.subscription_expires_at.isoformat() if user.subscription_expires_at else None,
                "usage": usage,
                "can_upgrade": user.subscription_plan == 'free',
                "can_downgrade": user.subscription_plan == 'plus' and not is_active
            }
            
        except Exception as e:
            logger.error(f"사용자 구독 정보 조회 실패: {str(e)}")
            raise e
    
    async def upgrade_subscription(
        self, 
        user_id: str, 
        plan: str, 
        payment_method: str,
        db: Session
    ) -> Dict[str, Any]:
        """
        구독 업그레이드
        """
        try:
            if plan not in self.plans:
                raise ValueError("지원하지 않는 구독 플랜입니다")
            
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                raise ValueError("사용자를 찾을 수 없습니다")
            
            # 결제 처리 (실제 구현에서는 결제 서비스 연동)
            payment_result = await self._process_payment(
                user_id, 
                plan, 
                payment_method
            )
            
            if not payment_result['success']:
                raise ValueError(f"결제 실패: {payment_result['error']}")
            
            # 구독 정보 업데이트
            user.subscription_plan = plan
            if plan == 'plus':
                # 1개월 구독
                user.subscription_expires_at = datetime.now() + timedelta(days=30)
            else:
                user.subscription_expires_at = None
            
            db.commit()
            
            logger.info(f"구독 업그레이드 완료: {user_id}, 플랜: {plan}")
            
            return {
                "success": True,
                "message": "구독이 업그레이드되었습니다",
                "subscription": await self.get_user_subscription(user_id, db),
                "payment_id": payment_result.get('payment_id')
            }
            
        except Exception as e:
            db.rollback()
            logger.error(f"구독 업그레이드 실패: {str(e)}")
            raise e
    
    async def cancel_subscription(self, user_id: str, db: Session) -> Dict[str, Any]:
        """
        구독 취소
        """
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                raise ValueError("사용자를 찾을 수 없습니다")
            
            if user.subscription_plan == 'free':
                raise ValueError("무료 플랜은 취소할 수 없습니다")
            
            # 구독 취소 (다음 결제일까지만 유지)
            # 실제 구현에서는 결제 서비스의 취소 API 호출
            
            logger.info(f"구독 취소 요청: {user_id}")
            
            return {
                "success": True,
                "message": "구독이 취소되었습니다. 현재 구독은 만료일까지 유지됩니다.",
                "expires_at": user.subscription_expires_at.isoformat() if user.subscription_expires_at else None
            }
            
        except Exception as e:
            logger.error(f"구독 취소 실패: {str(e)}")
            raise e
    
    async def check_ai_analysis_limit(self, user_id: str, db: Session) -> Dict[str, Any]:
        """
        AI 분석 사용량 확인
        """
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                raise ValueError("사용자를 찾을 수 없습니다")
            
            current_plan = self.plans.get(user.subscription_plan, self.plans['free'])
            limit = current_plan['ai_analysis_limit']
            
            # 무제한 플랜인 경우
            if limit == -1:
                return {
                    "can_analyze": True,
                    "remaining": -1,
                    "limit": -1,
                    "reset_date": None
                }
            
            # 사용량 계산
            usage = await self._calculate_ai_usage(user_id, db)
            
            can_analyze = usage['monthly_count'] < limit
            remaining = max(0, limit - usage['monthly_count'])
            
            # 다음 리셋 날짜 (다음 달 1일)
            next_month = datetime.now().replace(day=1) + timedelta(days=32)
            reset_date = next_month.replace(day=1)
            
            return {
                "can_analyze": can_analyze,
                "remaining": remaining,
                "limit": limit,
                "reset_date": reset_date.isoformat(),
                "usage": usage
            }
            
        except Exception as e:
            logger.error(f"AI 분석 사용량 확인 실패: {str(e)}")
            raise e
    
    async def _calculate_ai_usage(self, user_id: str, db: Session) -> Dict[str, Any]:
        """
        AI 분석 사용량 계산
        """
        try:
            from app.models.dream import Dream
            from datetime import datetime, timedelta
            
            # 이번 달 시작일
            month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            
            # 이번 달 AI 분석 요청 수
            monthly_count = db.query(Dream).filter(
                Dream.user_id == user_id,
                Dream.analysis_status.in_(['completed', 'processing']),
                Dream.created_at >= month_start
            ).count()
            
            # 전체 AI 분석 요청 수
            total_count = db.query(Dream).filter(
                Dream.user_id == user_id,
                Dream.analysis_status.in_(['completed', 'processing'])
            ).count()
            
            return {
                "monthly_count": monthly_count,
                "total_count": total_count,
                "month_start": month_start.isoformat()
            }
            
        except Exception as e:
            logger.error(f"AI 사용량 계산 실패: {str(e)}")
            return {"monthly_count": 0, "total_count": 0, "month_start": None}
    
    async def _process_payment(
        self, 
        user_id: str, 
        plan: str, 
        payment_method: str
    ) -> Dict[str, Any]:
        """
        결제 처리 (시뮬레이션)
        """
        try:
            # 실제 구현에서는 RevenueCat, Stripe, IAP 등의 결제 서비스 연동
            # 여기서는 시뮬레이션된 결제 처리
            
            plan_details = self.plans.get(plan)
            if not plan_details:
                return {"success": False, "error": "지원하지 않는 플랜입니다"}
            
            # 결제 시뮬레이션
            import uuid
            payment_id = str(uuid.uuid4())
            
            # 결제 성공 시뮬레이션 (실제로는 결제 서비스 응답 확인)
            if payment_method in ['card', 'apple_pay', 'google_pay']:
                return {
                    "success": True,
                    "payment_id": payment_id,
                    "amount": plan_details['price'],
                    "currency": plan_details['currency']
                }
            else:
                return {"success": False, "error": "지원하지 않는 결제 방법입니다"}
                
        except Exception as e:
            logger.error(f"결제 처리 실패: {str(e)}")
            return {"success": False, "error": str(e)}

# 전역 구독 서비스 인스턴스
subscription_service = SubscriptionService()
