"""
전체 시스템 통합 테스트
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import app
from app.core.database import Base, get_db
from app.models.user import User
from app.models.dream import Dream
from app.models.dream_analysis import DreamAnalysis
from app.models.community import CommunityPost
from app.models.dream_visualization import DreamVisualization
import uuid
from datetime import date, datetime

# 테스트용 데이터베이스 설정
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_integration.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module")
def client():
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as c:
        yield c
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="module")
def test_user():
    return {
        "id": str(uuid.uuid4()),
        "email": "test@example.com",
        "auth_provider": "firebase"
    }

@pytest.fixture(scope="module")
def auth_headers(client, test_user):
    # 테스트용 사용자 생성
    response = client.post("/api/v1/auth/register", json={
        "email": test_user["email"],
        "password": "testpassword123",
        "auth_provider": "email"
    })
    
    # 로그인하여 토큰 획득
    response = client.post("/api/v1/auth/login", data={
        "username": test_user["email"],
        "password": "testpassword123"
    })
    
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

class TestDreamJournalIntegration:
    """꿈 기록 시스템 통합 테스트"""
    
    def test_create_and_retrieve_dream(self, client, auth_headers):
        """꿈 생성 및 조회 테스트"""
        # 꿈 생성
        dream_data = {
            "dream_date": "2024-01-15",
            "title": "테스트 꿈",
            "body_text": "이것은 통합 테스트용 꿈입니다.",
            "lucidity_level": 3,
            "emotion_tags": ["happy", "peaceful"],
            "is_shared": False,
            "dream_type": "normal",
            "sleep_quality": 4,
            "characters": ["친구"],
            "symbols": ["바다"],
            "location": "해변"
        }
        
        response = client.post("/api/v1/dreams/", json=dream_data, headers=auth_headers)
        assert response.status_code == 200
        dream = response.json()
        dream_id = dream["id"]
        
        # 꿈 조회
        response = client.get(f"/api/v1/dreams/{dream_id}", headers=auth_headers)
        assert response.status_code == 200
        retrieved_dream = response.json()
        assert retrieved_dream["title"] == "테스트 꿈"
        assert retrieved_dream["body_text"] == "이것은 통합 테스트용 꿈입니다."
    
    def test_dream_list_with_filters(self, client, auth_headers):
        """꿈 목록 조회 및 필터링 테스트"""
        # 꿈 목록 조회
        response = client.get("/api/v1/dreams/", headers=auth_headers)
        assert response.status_code == 200
        dreams = response.json()
        assert "dreams" in dreams
        assert "total_count" in dreams
        
        # 감정 필터링
        response = client.get("/api/v1/dreams/?emotion_filter=happy", headers=auth_headers)
        assert response.status_code == 200
    
    def test_dream_stats(self, client, auth_headers):
        """꿈 통계 조회 테스트"""
        response = client.get("/api/v1/dreams/stats/overview", headers=auth_headers)
        assert response.status_code == 200
        stats = response.json()
        assert "total_dreams" in stats
        assert "dreams_this_month" in stats

class TestAIAnalysisIntegration:
    """AI 분석 시스템 통합 테스트"""
    
    def test_dream_analysis_request(self, client, auth_headers):
        """꿈 분석 요청 테스트"""
        # 먼저 꿈 생성
        dream_data = {
            "dream_date": "2024-01-15",
            "body_text": "AI 분석 테스트용 꿈입니다.",
            "emotion_tags": ["happy"],
            "is_shared": False,
            "characters": [],
            "symbols": []
        }
        
        response = client.post("/api/v1/dreams/", json=dream_data, headers=auth_headers)
        dream_id = response.json()["id"]
        
        # 분석 요청
        response = client.post(f"/api/v1/dreams/{dream_id}/analyze", headers=auth_headers)
        assert response.status_code == 200
        analysis = response.json()
        assert "task_id" in analysis
    
    def test_daily_insights(self, client, auth_headers):
        """일일 인사이트 테스트"""
        response = client.get("/api/v1/analysis/insights/daily", headers=auth_headers)
        assert response.status_code == 200
        insights = response.json()
        assert "insight" in insights
    
    def test_dream_patterns(self, client, auth_headers):
        """꿈 패턴 분석 테스트"""
        response = client.get("/api/v1/analysis/patterns", headers=auth_headers)
        assert response.status_code == 200
        patterns = response.json()
        assert "patterns" in patterns

class TestVisualizationIntegration:
    """꿈 시각화 시스템 통합 테스트"""
    
    def test_visualization_styles(self, client):
        """시각화 스타일 목록 테스트"""
        response = client.get("/api/v1/visualization/styles")
        assert response.status_code == 200
        styles = response.json()
        assert "styles" in styles
        assert len(styles["styles"]) > 0
    
    def test_create_visualization(self, client, auth_headers):
        """꿈 시각화 생성 테스트"""
        # 먼저 꿈 생성
        dream_data = {
            "dream_date": "2024-01-15",
            "body_text": "시각화 테스트용 꿈입니다.",
            "emotion_tags": ["happy"],
            "is_shared": False,
            "characters": [],
            "symbols": []
        }
        
        response = client.post("/api/v1/dreams/", json=dream_data, headers=auth_headers)
        dream_id = response.json()["id"]
        
        # 시각화 생성
        response = client.post(
            f"/api/v1/dreams/{dream_id}/visualize?art_style=surreal",
            headers=auth_headers
        )
        assert response.status_code == 200
        visualization = response.json()
        assert "visualization" in visualization
    
    def test_visualization_gallery(self, client, auth_headers):
        """시각화 갤러리 테스트"""
        response = client.get("/api/v1/visualizations/gallery", headers=auth_headers)
        assert response.status_code == 200
        gallery = response.json()
        assert "visualizations" in gallery

class TestCommunityIntegration:
    """커뮤니티 시스템 통합 테스트"""
    
    def test_create_community_post(self, client, auth_headers):
        """커뮤니티 포스트 생성 테스트"""
        post_data = {
            "content": "이것은 커뮤니티 테스트 포스트입니다. 꿈에 대한 이야기를 나누어보세요.",
            "tags": ["테스트", "꿈"],
            "is_anonymous": True
        }
        
        response = client.post("/api/v1/community/posts", json=post_data, headers=auth_headers)
        assert response.status_code == 200
        post = response.json()
        assert post["content"] == post_data["content"]
    
    def test_community_posts_list(self, client):
        """커뮤니티 포스트 목록 테스트"""
        response = client.get("/api/v1/community/posts")
        assert response.status_code == 200
        posts = response.json()
        assert "posts" in posts
    
    def test_popular_tags(self, client):
        """인기 태그 테스트"""
        response = client.get("/api/v1/community/tags/popular")
        assert response.status_code == 200
        tags = response.json()
        assert "tags" in tags
    
    def test_community_search(self, client):
        """커뮤니티 검색 테스트"""
        response = client.get("/api/v1/community/search?q=꿈")
        assert response.status_code == 200
        results = response.json()
        assert "posts" in results
        assert "query" in results

class TestSubscriptionIntegration:
    """구독 시스템 통합 테스트"""
    
    def test_subscription_plans(self, client):
        """구독 플랜 목록 테스트"""
        response = client.get("/api/v1/subscription/plans")
        assert response.status_code == 200
        plans = response.json()
        assert "plans" in plans
        assert "free" in plans["plans"]
        assert "plus" in plans["plans"]
    
    def test_user_subscription_status(self, client, auth_headers):
        """사용자 구독 상태 테스트"""
        response = client.get("/api/v1/subscription/status", headers=auth_headers)
        assert response.status_code == 200
        subscription = response.json()
        assert "current_plan" in subscription
        assert "is_active" in subscription
    
    def test_ai_usage_check(self, client, auth_headers):
        """AI 사용량 확인 테스트"""
        response = client.get("/api/v1/subscription/ai-usage", headers=auth_headers)
        assert response.status_code == 200
        usage = response.json()
        assert "can_analyze" in usage
        assert "remaining" in usage
        assert "limit" in usage

class TestEndToEndWorkflow:
    """전체 워크플로우 테스트"""
    
    def test_complete_dream_workflow(self, client, auth_headers):
        """완전한 꿈 워크플로우 테스트"""
        # 1. 꿈 생성
        dream_data = {
            "dream_date": "2024-01-15",
            "title": "완전한 워크플로우 테스트 꿈",
            "body_text": "이것은 완전한 워크플로우를 테스트하는 꿈입니다. 바다에서 수영하고 친구들과 함께 놀았습니다.",
            "lucidity_level": 4,
            "emotion_tags": ["happy", "excited", "peaceful"],
            "is_shared": False,
            "dream_type": "normal",
            "sleep_quality": 5,
            "characters": ["친구1", "친구2"],
            "symbols": ["바다", "파도", "해변"],
            "location": "제주도 해변"
        }
        
        response = client.post("/api/v1/dreams/", json=dream_data, headers=auth_headers)
        assert response.status_code == 200
        dream = response.json()
        dream_id = dream["id"]
        
        # 2. 꿈 분석 요청
        response = client.post(f"/api/v1/dreams/{dream_id}/analyze", headers=auth_headers)
        assert response.status_code == 200
        
        # 3. 꿈 시각화 생성
        response = client.post(
            f"/api/v1/dreams/{dream_id}/visualize?art_style=surreal",
            headers=auth_headers
        )
        assert response.status_code == 200
        
        # 4. 커뮤니티에 공유
        post_data = {
            "content": "오늘 정말 좋은 꿈을 꾸었습니다. 바다에서 친구들과 함께 놀았는데 정말 행복했습니다.",
            "tags": ["바다", "친구", "행복"],
            "is_anonymous": True,
            "dream_id": dream_id
        }
        
        response = client.post("/api/v1/community/posts", json=post_data, headers=auth_headers)
        assert response.status_code == 200
        
        # 5. 꿈 통계 확인
        response = client.get("/api/v1/dreams/stats/overview", headers=auth_headers)
        assert response.status_code == 200
        stats = response.json()
        assert stats["total_dreams"] >= 1
        
        # 6. 구독 상태 확인
        response = client.get("/api/v1/subscription/status", headers=auth_headers)
        assert response.status_code == 200
        
        print("✅ 완전한 꿈 워크플로우 테스트 성공!")

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
