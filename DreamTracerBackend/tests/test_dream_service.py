"""
꿈 서비스 테스트
"""
import pytest
from unittest.mock import Mock, patch
from datetime import date, datetime
from app.services.dream_service import DreamService
from app.schemas.dream import DreamCreate, DreamUpdate, EmotionType
from app.models.dream import Dream

class TestDreamService:
    def setup_method(self):
        self.dream_service = DreamService()
        self.mock_db = Mock()

    @pytest.mark.asyncio
    async def test_create_dream_success(self):
        """꿈 생성 성공 테스트"""
        dream_data = DreamCreate(
            dream_date=date(2024, 1, 15),
            title="테스트 꿈",
            body_text="이것은 테스트 꿈입니다.",
            lucidity_level=3,
            emotion_tags=[EmotionType.HAPPY, EmotionType.PEACEFUL],
            is_shared=False,
            dream_type="normal",
            sleep_quality=4,
            characters=["친구"],
            symbols=["바다"]
        )
        
        # Mock 꿈 객체
        mock_dream = Dream(
            id="dream-123",
            user_id="user-123",
            dream_date=date(2024, 1, 15),
            title="테스트 꿈",
            body_text="이것은 테스트 꿈입니다.",
            lucidity_level=3,
            emotion_tags=["happy", "peaceful"],
            analysis_status="pending",
            is_shared=False,
            dream_type="normal",
            sleep_quality=4,
            characters=["친구"],
            symbols=["바다"]
        )
        
        # Mock 데이터베이스 작업
        self.mock_db.add.return_value = None
        self.mock_db.commit.return_value = None
        self.mock_db.refresh.return_value = None
        
        with patch('app.services.dream_service.Dream', return_value=mock_dream):
            result = await self.dream_service.create_dream("user-123", dream_data, self.mock_db)
            
            assert result.title == "테스트 꿈"
            assert result.body_text == "이것은 테스트 꿈입니다."
            assert result.lucidity_level == 3
            assert result.emotion_tags == ["happy", "peaceful"]
            self.mock_db.add.assert_called_once()
            self.mock_db.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_user_dreams_with_filters(self):
        """사용자 꿈 목록 조회 (필터링) 테스트"""
        # Mock 꿈 객체들
        mock_dreams = [
            Dream(
                id="dream-1",
                user_id="user-123",
                dream_date=date(2024, 1, 15),
                title="꿈 1",
                body_text="첫 번째 꿈",
                emotion_tags=["happy"],
                analysis_status="completed",
                is_shared=False,
                characters=[],
                symbols=[]
            ),
            Dream(
                id="dream-2",
                user_id="user-123",
                dream_date=date(2024, 1, 14),
                title="꿈 2",
                body_text="두 번째 꿈",
                emotion_tags=["sad"],
                analysis_status="pending",
                is_shared=False,
                characters=[],
                symbols=[]
            )
        ]
        
        # Mock 쿼리 체인
        mock_query = Mock()
        mock_query.filter.return_value = mock_query
        mock_query.count.return_value = 2
        mock_query.order_by.return_value = mock_query
        mock_query.offset.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = mock_dreams
        
        self.mock_db.query.return_value = mock_query
        
        result = await self.dream_service.get_user_dreams(
            "user-123",
            skip=0,
            limit=20,
            db=self.mock_db,
            start_date=date(2024, 1, 1),
            end_date=date(2024, 1, 31),
            dream_type="normal",
            emotion_filter=["happy"]
        )
        
        assert len(result.dreams) == 2
        assert result.total_count == 2
        assert result.page == 1
        assert result.page_size == 20
        assert result.has_next == False
        assert result.has_previous == False

    @pytest.mark.asyncio
    async def test_update_dream_success(self):
        """꿈 수정 성공 테스트"""
        dream_id = "dream-123"
        user_id = "user-123"
        
        # Mock 기존 꿈 객체
        existing_dream = Dream(
            id=dream_id,
            user_id=user_id,
            dream_date=date(2024, 1, 15),
            title="기존 제목",
            body_text="기존 내용",
            lucidity_level=2,
            emotion_tags=["sad"],
            analysis_status="pending",
            is_shared=False,
            characters=[],
            symbols=[]
        )
        
        # Mock 쿼리
        mock_query = Mock()
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = existing_dream
        self.mock_db.query.return_value = mock_query
        
        # 수정 데이터
        dream_update = DreamUpdate(
            title="수정된 제목",
            body_text="수정된 내용",
            lucidity_level=4,
            emotion_tags=[EmotionType.HAPPY, EmotionType.PEACEFUL],
            sleep_quality=5
        )
        
        self.mock_db.commit.return_value = None
        self.mock_db.refresh.return_value = None
        
        result = await self.dream_service.update_dream(dream_id, user_id, dream_update, self.mock_db)
        
        assert result.title == "수정된 제목"
        assert result.body_text == "수정된 내용"
        assert result.lucidity_level == 4
        assert result.emotion_tags == ["happy", "peaceful"]
        assert result.sleep_quality == 5
        self.mock_db.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_delete_dream_success(self):
        """꿈 삭제 성공 테스트"""
        dream_id = "dream-123"
        user_id = "user-123"
        
        # Mock 기존 꿈 객체
        existing_dream = Dream(
            id=dream_id,
            user_id=user_id,
            dream_date=date(2024, 1, 15),
            title="삭제할 꿈",
            body_text="삭제될 내용",
            emotion_tags=[],
            analysis_status="pending",
            is_shared=False,
            characters=[],
            symbols=[]
        )
        
        # Mock 쿼리
        mock_query = Mock()
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = existing_dream
        self.mock_db.query.return_value = mock_query
        
        self.mock_db.delete.return_value = None
        self.mock_db.commit.return_value = None
        
        result = await self.dream_service.delete_dream(dream_id, user_id, self.mock_db)
        
        assert result == True
        self.mock_db.delete.assert_called_once_with(existing_dream)
        self.mock_db.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_dream_stats(self):
        """꿈 통계 조회 테스트"""
        # Mock 통계 쿼리들
        mock_query = Mock()
        mock_query.filter.return_value = mock_query
        mock_query.count.return_value = 10  # 총 꿈 개수
        mock_query.scalar.return_value = 3.5  # 평균 명료도
        
        # 꿈 타입 분포 쿼리
        mock_type_query = Mock()
        mock_type_query.filter.return_value = mock_type_query
        mock_type_query.group_by.return_value = mock_type_query
        mock_type_query.all.return_value = [("normal", 8), ("lucid", 2)]
        
        # 쿼리 설정
        def mock_query_side_effect(model):
            if model == Dream:
                return mock_query
            return mock_type_query
        
        self.mock_db.query.side_effect = mock_query_side_effect
        
        result = await self.dream_service.get_dream_stats("user-123", self.mock_db)
        
        assert result.total_dreams == 10
        assert result.dreams_this_month == 10  # Mock에서 같은 값 반환
        assert result.dreams_this_week == 10
        assert result.average_lucidity == 3.5
        assert result.dream_types_distribution == {"normal": 8, "lucid": 2}

    @pytest.mark.asyncio
    async def test_search_dreams(self):
        """꿈 검색 테스트"""
        # Mock 검색 결과
        mock_dreams = [
            Dream(
                id="dream-1",
                user_id="user-123",
                dream_date=date(2024, 1, 15),
                title="바다 꿈",
                body_text="바다에서 수영하는 꿈",
                emotion_tags=["happy"],
                analysis_status="completed",
                is_shared=False,
                characters=[],
                symbols=[]
            )
        ]
        
        # Mock 쿼리
        mock_query = Mock()
        mock_query.filter.return_value = mock_query
        mock_query.count.return_value = 1
        mock_query.order_by.return_value = mock_query
        mock_query.offset.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = mock_dreams
        
        self.mock_db.query.return_value = mock_query
        
        result = await self.dream_service.search_dreams("user-123", "바다", self.mock_db)
        
        assert len(result.dreams) == 1
        assert result.dreams[0].title == "바다 꿈"
        assert result.total_count == 1
