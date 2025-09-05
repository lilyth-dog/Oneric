"""
Celery 애플리케이션 설정
"""
from celery import Celery
from app.core.config import settings

# Celery 앱 생성
celery_app = Celery(
    "dreamtracer",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["app.workers.tasks"]
)

# Celery 설정
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Seoul",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30분
    task_soft_time_limit=25 * 60,  # 25분
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
)

# 주기적 작업 설정
celery_app.conf.beat_schedule = {
    "cleanup-old-dreams": {
        "task": "app.workers.tasks.cleanup_old_dreams",
        "schedule": 86400.0,  # 24시간마다 실행
    },
    "generate-daily-insights": {
        "task": "app.workers.tasks.generate_daily_insights",
        "schedule": 86400.0,  # 24시간마다 실행
    },
}
