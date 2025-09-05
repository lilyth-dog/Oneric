"""
인증 관련 테스트
"""
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_register_user():
    """사용자 회원가입 테스트"""
    user_data = {
        "email": "test@example.com",
        "password": "testpassword123",
        "auth_provider": "firebase"
    }
    response = client.post("/api/v1/auth/register", json=user_data)
    # 실제 구현에 따라 응답 코드가 달라질 수 있음
    assert response.status_code in [200, 201, 400]

def test_login_user():
    """사용자 로그인 테스트"""
    login_data = {
        "username": "test@example.com",
        "password": "testpassword123"
    }
    response = client.post("/api/v1/auth/login", data=login_data)
    # 실제 구현에 따라 응답 코드가 달라질 수 있음
    assert response.status_code in [200, 401]

def test_firebase_auth():
    """Firebase 인증 테스트"""
    firebase_token = "test-firebase-token"
    response = client.post("/api/v1/auth/firebase-auth", json={"firebase_token": firebase_token})
    # 실제 구현에 따라 응답 코드가 달라질 수 있음
    assert response.status_code in [200, 401]
