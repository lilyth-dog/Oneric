# 환경 변수 테스트용 파일
import os
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# API 키들 확인
print("=== API 키 확인 ===")
print(f"NCP Access Key: {os.getenv('NCP_ACCESS_KEY', 'NOT_SET')[:20]}...")
print(f"NCP Secret Key: {os.getenv('NCP_SECRET_KEY', 'NOT_SET')[:20]}...")
print(f"OpenRouter API: {os.getenv('OPENROUTER_API_KEY', 'NOT_SET')[:20]}...")

# 환경 변수 설정
os.environ['NCP_ACCESS_KEY'] = 'ncp_iam_BPAMKR38ZrL0CKCQXNYb'
os.environ['NCP_SECRET_KEY'] = 'ncp_iam_BPKMKRW9Ah5Bc0NED39egXshECkcOu7iAW'
os.environ['OPENROUTER_API_KEY'] = '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'

print("\n=== 설정된 API 키 ===")
print(f"NCP Access Key: {os.getenv('NCP_ACCESS_KEY')[:20]}...")
print(f"NCP Secret Key: {os.getenv('NCP_SECRET_KEY')[:20]}...")
print(f"OpenRouter API: {os.getenv('OPENROUTER_API_KEY')[:20]}...")

print("\n✅ 환경 변수 설정 완료!")
