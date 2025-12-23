/**
 * 꿈결 앱 폰트 시스템
 * "고요한 탐험" 컨셉에 맞는 폰트 조합
 * 사용자 부담 최소화, 분위기 극대화
 */

export const Fonts = {
  // 기본 UI 폰트 - 안정적이고 가독성 뛰어남 (80% 사용)
  primary: {
    regular: 'Pretendard-Regular',
    medium: 'Pretendard-Medium',
    bold: 'Pretendard-Bold',
    light: 'Pretendard-Light',
    thin: 'Pretendard-Thin',
    extrabold: 'Pretendard-ExtraBold',
  },

  // 감성적 요소 폰트 - 몽환적이고 서정적 (15% 사용)
  emotional: {
    regular: 'Paperlogy-4Regular',
    medium: 'Paperlogy-5Medium',
    bold: 'Paperlogy-7Bold',
    light: 'Paperlogy-3Light',
    thin: 'Paperlogy-1Thin',
    semibold: 'Paperlogy-6SemiBold',
    extrabold: 'Paperlogy-8ExtraBold',
    black: 'Paperlogy-9Black',
  },

  // 개인적 터치 폰트 - 따뜻하고 친근한 손글씨 느낌 (5% 사용)
  personal: {
    regular: 'Yangjin-Regular',
    bold: 'Yangjin-Regular', // 양진체는 하나의 스타일만 있음
  },

  // 보조 폰트들 - 특별한 상황에서만 사용
  secondary: {
    // 통계/데이터용
    data: 'Pretendard-Regular',
    // 로고/특별한 포인트용
    logo: 'Pretendard-Bold',
    // 귀여운 알림용
    cute: 'Pretendard-Light',
    // 친숙한 안내용
    friendly: 'Pretendard-Regular',
  },

  // 기본 폰트 (폰트 로딩 실패시 대체)
  fallback: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    light: 'System',
  },
} as const;

// 폰트 크기 상수
export const FontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
} as const;

// 폰트 가중치 상수
export const FontWeights = {
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
} as const;

// ===== 기본 UI 스타일 (프리텐다드) =====
export const DefaultFontStyle = {
  fontFamily: Fonts.primary.regular,
  fontSize: FontSizes.base,
  fontWeight: FontWeights.regular,
};

export const BodyFontStyle = {
  fontFamily: Fonts.primary.regular,
  fontSize: FontSizes.base,
  fontWeight: FontWeights.regular,
  lineHeight: 24, // 150% of 16px
};

export const SmallFontStyle = {
  fontFamily: Fonts.primary.regular,
  fontSize: FontSizes.sm,
  fontWeight: FontWeights.regular,
  lineHeight: 20, // ~143% of 14px
};

export const ButtonFontStyle = {
  fontFamily: Fonts.primary.medium,
  fontSize: FontSizes.base,
  fontWeight: FontWeights.medium,
};

export const SubtitleFontStyle = {
  fontFamily: Fonts.primary.medium,
  fontSize: FontSizes.lg,
  fontWeight: FontWeights.medium,
}

// ===== 감성적 요소 스타일 (페이퍼로지) =====
export const EmotionalTitleStyle = {
  fontFamily: Fonts.emotional.bold,
  fontSize: FontSizes['2xl'],
  fontWeight: FontWeights.bold,
  letterSpacing: 0.5,
  lineHeight: 34, // ~140% of 24px
};

export const EmotionalSubtitleStyle = {
  fontFamily: Fonts.emotional.medium,
  fontSize: FontSizes.lg,
  fontWeight: FontWeights.medium,
  letterSpacing: 0.3,
  lineHeight: 27, // 150% of 18px
};

export const SpecialMessageStyle = {
  fontFamily: Fonts.emotional.regular,
  fontSize: FontSizes.base,
  fontWeight: FontWeights.regular,
  fontStyle: 'italic' as const,
  letterSpacing: 0.2,
  lineHeight: 24,
};

// Aliases for compatibility with Login/Register screens
export const DreamyLogoStyle = {
  fontFamily: Fonts.emotional.extrabold,
  fontSize: FontSizes['4xl'],
  fontWeight: FontWeights.extrabold,
  letterSpacing: 1.5,
};

export const ElegantTitleStyle = {
  ...EmotionalTitleStyle
};

export const DreamySubtitleStyle = {
  ...EmotionalSubtitleStyle
};

export const EnglishDreamyStyle = {
  fontFamily: Fonts.primary.regular,
  fontSize: FontSizes.base
}


// ===== 개인적 터치 스타일 (양진체) =====
export const PersonalGreetingStyle = {
  fontFamily: Fonts.personal.regular,
  fontSize: FontSizes.lg,
  fontWeight: FontWeights.regular,
  letterSpacing: 0.5,
};

export const PersonalCelebrationStyle = {
  fontFamily: Fonts.personal.bold,
  fontSize: FontSizes.base,
  fontWeight: FontWeights.bold,
  letterSpacing: 0.3,
};

// ===== 특별한 용도 스타일 =====
export const LogoStyle = {
  fontFamily: Fonts.secondary.logo,
  fontSize: FontSizes['4xl'],
  fontWeight: FontWeights.bold,
  letterSpacing: 2,
};

export const DataStyle = {
  fontFamily: Fonts.secondary.data,
  fontSize: FontSizes.sm,
  fontWeight: FontWeights.regular,
};

export const CuteNotificationStyle = {
  fontFamily: Fonts.secondary.cute,
  fontSize: FontSizes.sm,
  fontWeight: FontWeights.regular,
};

export const FriendlyGuideStyle = {
  fontFamily: Fonts.secondary.friendly,
  fontSize: FontSizes.sm,
  fontWeight: FontWeights.regular,
};

// ===== 상황별 조합 스타일 =====
export const DreamRecordTitleStyle = {
  fontFamily: Fonts.emotional.medium,
  fontSize: FontSizes.xl,
  fontWeight: FontWeights.medium,
  letterSpacing: 0.3,
};

export const AnalysisReportTitleStyle = {
  fontFamily: Fonts.emotional.bold,
  fontSize: FontSizes['2xl'],
  fontWeight: FontWeights.bold,
  letterSpacing: 0.5,
};

export const UserNameStyle = {
  fontFamily: Fonts.personal.regular,
  fontSize: FontSizes.base,
  fontWeight: FontWeights.regular,
  letterSpacing: 0.2,
};

export const StatisticsStyle = {
  fontFamily: Fonts.secondary.data,
  fontSize: FontSizes.sm,
  fontWeight: FontWeights.medium,
};
