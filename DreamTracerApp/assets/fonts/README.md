# 꿈결 앱 폰트 시스템

이 폴더에는 꿈결 앱의 "고요한 탐험" 컨셉에 맞는 폰트들이 포함되어 있습니다.

## 폰트 구성

### 1. 기본 UI 폰트 (80% 사용)
- **Pretendard**: 안정적이고 가독성 뛰어난 기본 폰트
- **출처**: Pretendard Project
- **라이선스**: SIL Open Font License 1.1
- **다운로드**: https://github.com/orioncactus/pretendard

### 2. 감성적 요소 폰트 (15% 사용)
- **Paper Log**: 몽환적이고 서정적인 감성 폰트
- **출처**: 이주임 X 김도균
- **라이선스**: 상업적 이용 가능
- **다운로드**: https://noonnu.cc/font_page/475

### 3. 개인적 터치 폰트 (5% 사용)
- **양진체**: 따뜻하고 친근한 손글씨 느낌
- **출처**: 김양진
- **라이선스**: 상업적 이용 가능
- **다운로드**: https://noonnu.cc/font_page/401

### 4. 보조 폰트들 (특별한 상황에서만 사용)
- **Noto Sans KR**: 통계/데이터용
- **온글잎 박다현체**: 로고/특별한 포인트용
- **핑크퐁 아기상어 서체**: 귀여운 알림용
- **나눔고딕**: 친숙한 안내용

## 폰트 파일 구조

```
assets/fonts/
├── Pretendard/
│   ├── Pretendard-Regular.ttf
│   ├── Pretendard-Medium.ttf
│   ├── Pretendard-Bold.ttf
│   ├── Pretendard-Light.ttf
│   ├── Pretendard-Thin.ttf
│   └── Pretendard-ExtraBold.ttf
├── PaperLog/
│   ├── PaperLog-Regular.ttf
│   ├── PaperLog-Medium.ttf
│   ├── PaperLog-Bold.ttf
│   └── PaperLog-Light.ttf
├── Yangjin/
│   ├── Yangjin-Regular.ttf
│   └── Yangjin-Bold.ttf
└── Secondary/
    ├── NotoSansKR-Regular.ttf
    ├── Ongeulip-Bakdahyun-Regular.ttf
    ├── Pinkfong-BabyShark-Regular.ttf
    └── NanumGothic-Regular.ttf
```

## React Native 적용 방법

1. 폰트 파일을 해당 폴더에 추가
2. `react-native.config.js`에서 폰트 경로 설정
3. `src/styles/fonts.ts`에서 폰트 스타일 사용

```javascript
// 예시
import { EmotionalTitleStyle, PersonalGreetingStyle } from '../styles/fonts';

const styles = StyleSheet.create({
  title: EmotionalTitleStyle,
  greeting: PersonalGreetingStyle,
});
```

## 폰트 사용 가이드라인

### 기본 원칙
- **프리텐다드**: 모든 기본 UI 요소 (버튼, 입력 필드, 메뉴 등)
- **페이퍼로지**: 감성적 제목, 특별한 메시지, 명상적 텍스트
- **양진체**: 사용자 이름, 개인적 축하 메시지, 따뜻한 인사

### 사용 비율
- 프리텐다드: 80% (안정성)
- 페이퍼로지: 15% (감성)
- 양진체: 5% (개인적 터치)

### 주의사항
- 폰트 변경이 사용자에게 부담스럽지 않게 자연스럽게 적용
- 같은 상황에서는 항상 같은 폰트 사용으로 일관성 유지
- 폰트 로딩 실패 시 System 폰트로 대체