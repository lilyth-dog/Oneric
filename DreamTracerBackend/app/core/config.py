"""
꿈결 백엔드 설정
"""
from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import validator
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # API 설정
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "꿈결"
    
    # 데이터베이스 설정
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "password")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "dreamtracer")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    
    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    # Redis 설정
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # JWT 설정
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS 설정
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8081",  # React Native Metro
        "http://localhost:19006",  # Expo
    ]
    
    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    # Firebase 설정
    FIREBASE_PROJECT_ID: str = os.getenv("FIREBASE_PROJECT_ID", "")
    FIREBASE_PRIVATE_KEY: str = os.getenv("FIREBASE_PRIVATE_KEY", "")
    FIREBASE_CLIENT_EMAIL: str = os.getenv("FIREBASE_CLIENT_EMAIL", "")
    
    # Gemini API 설정
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Celery 설정
    CELERY_BROKER_URL: str = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
    CELERY_RESULT_BACKEND: str = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")
    
    class Config:
        case_sensitive = True

settings = Settings()
