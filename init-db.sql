-- 꿈결 데이터베이스 초기화 스크립트

-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 데이터베이스 생성 확인
SELECT 'Database initialized successfully' as status;
