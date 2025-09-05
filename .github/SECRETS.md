# GitHub Actions 시크릿 설정 가이드

이 문서는 GitHub Actions에서 사용할 시크릿들을 설정하는 방법을 설명합니다.

## 🔐 필요한 시크릿들

### Docker 관련
- `DOCKER_USERNAME`: Docker Hub 사용자명
- `DOCKER_PASSWORD`: Docker Hub 비밀번호 또는 액세스 토큰

### 클라우드 배포 관련
- `GCP_PROJECT_ID`: Google Cloud Platform 프로젝트 ID
- `GCP_SA_KEY`: GCP 서비스 계정 키 (JSON)
- `AWS_ACCESS_KEY_ID`: AWS 액세스 키 ID
- `AWS_SECRET_ACCESS_KEY`: AWS 시크릿 액세스 키

### 앱스토어 배포 관련
- `ANDROID_HOME`: Android SDK 홈 디렉토리
- `ANDROID_SDK_ROOT`: Android SDK 루트 디렉토리
- `GOOGLE_PLAY_SERVICE_ACCOUNT`: Google Play 서비스 계정 JSON
- `APPLE_APP_STORE_CONNECT_API_KEY`: Apple App Store Connect API 키

### 코드 품질 관련
- `CODECOV_TOKEN`: Codecov 토큰
- `SONAR_TOKEN`: SonarCloud 토큰

## 📝 시크릿 설정 방법

1. GitHub 저장소로 이동
2. Settings → Secrets and variables → Actions
3. "New repository secret" 클릭
4. Name과 Secret 값 입력
5. "Add secret" 클릭

## 🚀 환경별 설정

### Development
- 모든 시크릿을 개발 환경 값으로 설정

### Staging
- 프로덕션과 유사하지만 테스트용 값 사용

### Production
- 실제 프로덕션 환경 값 사용
- 보안이 강화된 값 사용

## ⚠️ 보안 주의사항

1. **절대 시크릿을 코드에 하드코딩하지 마세요**
2. **시크릿은 최소 권한 원칙을 따르세요**
3. **정기적으로 시크릿을 로테이션하세요**
4. **시크릿 접근 로그를 모니터링하세요**
5. **불필요한 시크릿은 즉시 삭제하세요**

## 🔄 시크릿 로테이션

### 정기적 로테이션 (권장)
- API 키: 90일마다
- 비밀번호: 180일마다
- 인증서: 만료 전 30일

### 로테이션 절차
1. 새 시크릿 생성
2. GitHub Actions에서 새 시크릿 설정
3. 기존 시크릿 비활성화
4. 테스트 후 기존 시크릿 삭제
