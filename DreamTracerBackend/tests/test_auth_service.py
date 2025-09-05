"""
인증 서비스 테스트
"""
import pytest
from unittest.mock import Mock, patch
from app.services.auth_service import AuthService
from app.schemas.auth import UserCreate, OnboardingComplete
from app.models.user import User

class TestAuthService:
    def setup_method(self):
        self.auth_service = AuthService()
        self.mock_db = Mock()

    @pytest.mark.asyncio
    async def test_create_user_success(self):
        """사용자 생성 성공 테스트"""
        user_data = UserCreate(
            email="test@example.com",
            auth_provider="firebase"
        )
        
        # Mock 사용자 객체
        mock_user = User(
            id="test-id",
            email="test@example.com",
            auth_provider="firebase",
            subscription_plan="free"
        )
        
        # Mock 데이터베이스 쿼리
        self.mock_db.query.return_value.filter.return_value.first.return_value = None
        self.mock_db.add.return_value = None
        self.mock_db.commit.return_value = None
        self.mock_db.refresh.return_value = None
        
        with patch('app.services.auth_service.User', return_value=mock_user):
            result = await self.auth_service.create_user(user_data, self.mock_db)
            
            assert result.email == "test@example.com"
            assert result.auth_provider == "firebase"
            self.mock_db.add.assert_called_once()
            self.mock_db.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_create_user_duplicate_email(self):
        """중복 이메일 사용자 생성 실패 테스트"""
        user_data = UserCreate(
            email="test@example.com",
            auth_provider="firebase"
        )
        
        # Mock 기존 사용자 존재
        existing_user = User(id="existing-id", email="test@example.com")
        self.mock_db.query.return_value.filter.return_value.first.return_value = existing_user
        
        with pytest.raises(ValueError, match="이미 존재하는 이메일입니다"):
            await self.auth_service.create_user(user_data, self.mock_db)

    @pytest.mark.asyncio
    async def test_authenticate_user_success(self):
        """사용자 인증 성공 테스트"""
        email = "test@example.com"
        password = "password123"
        
        # Mock 사용자 객체
        mock_user = User(
            id="test-id",
            email="test@example.com",
            auth_provider="firebase",
            subscription_plan="free"
        )
        
        self.mock_db.query.return_value.filter.return_value.first.return_value = mock_user
        
        with patch('app.services.auth_service.create_access_token', return_value="mock-token"):
            result = await self.auth_service.authenticate_user(email, password, self.mock_db)
            
            assert result.access_token == "mock-token"
            assert result.token_type == "bearer"
            assert result.user == mock_user

    @pytest.mark.asyncio
    async def test_authenticate_user_not_found(self):
        """존재하지 않는 사용자 인증 실패 테스트"""
        email = "nonexistent@example.com"
        password = "password123"
        
        self.mock_db.query.return_value.filter.return_value.first.return_value = None
        
        with pytest.raises(ValueError, match="사용자를 찾을 수 없습니다"):
            await self.auth_service.authenticate_user(email, password, self.mock_db)

    @pytest.mark.asyncio
    async def test_complete_onboarding_success(self):
        """온보딩 완료 성공 테스트"""
        user_id = "test-user-id"
        onboarding_data = OnboardingComplete(
            step1={
                "display_name": "테스트 사용자",
                "birth_year": 1990,
                "gender": "male"
            },
            step2={
                "interests": ["dream_analysis", "lucidity"]
            },
            step3={
                "notification_enabled": True,
                "dream_reminder_time": "22:00",
                "weekly_insight_enabled": True
            },
            step4={
                "primary_goal": "understand_dreams",
                "dream_frequency": "daily"
            }
        )
        
        # Mock 사용자 객체
        mock_user = User(
            id=user_id,
            email="test@example.com",
            auth_provider="firebase"
        )
        
        self.mock_db.query.return_value.filter.return_value.first.return_value = mock_user
        self.mock_db.commit.return_value = None
        self.mock_db.refresh.return_value = None
        
        result = await self.auth_service.complete_onboarding(user_id, onboarding_data, self.mock_db)
        
        assert result.id == user_id
        self.mock_db.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_complete_onboarding_user_not_found(self):
        """존재하지 않는 사용자 온보딩 완료 실패 테스트"""
        user_id = "nonexistent-user-id"
        onboarding_data = OnboardingComplete(
            step1={"display_name": "테스트", "birth_year": 1990, "gender": "male"},
            step2={"interests": ["dream_analysis"]},
            step3={"notification_enabled": True, "weekly_insight_enabled": True},
            step4={"primary_goal": "understand_dreams", "dream_frequency": "daily"}
        )
        
        self.mock_db.query.return_value.filter.return_value.first.return_value = None
        
        with pytest.raises(ValueError, match="사용자를 찾을 수 없습니다"):
            await self.auth_service.complete_onboarding(user_id, onboarding_data, self.mock_db)
