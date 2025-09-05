"""
메인 애플리케이션 테스트
"""
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root():
    """루트 엔드포인트 테스트"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "꿈결 API 서버가 실행 중입니다"}

def test_health_check():
    """헬스 체크 엔드포인트 테스트"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "service": "꿈결 API"}

def test_openapi_docs():
    """OpenAPI 문서 엔드포인트 테스트"""
    response = client.get("/api/v1/openapi.json")
    assert response.status_code == 200
    assert "openapi" in response.json()
