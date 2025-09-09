/**
 * 온보딩 화면
 * 디자인 가이드에 따른 "고요한 탐험" 컨셉 구현
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  // Dimensions,
} from 'react-native';
import { useNavigationStore } from '../../stores/navigationStore';
import { useAuthStore } from '../../stores/authStore';

  // const { width, height } = Dimensions.get('window');

const onboardingSteps = [
  {
    id: 1,
    title: '꿈을 기록하세요',
    subtitle: '텍스트와 음성으로 꿈을 자유롭게 기록할 수 있습니다',
    icon: '📝',
    description: '잠에서 깬 직후에도 쉽고 빠르게 꿈의 내용을 저장하세요.',
  },
  {
    id: 2,
    title: 'AI가 분석해드립니다',
    subtitle: '심리학적 통찰과 개인화된 해석을 제공합니다',
    icon: '🧠',
    description: 'Google Gemini AI가 꿈의 상징과 감정 패턴을 분석하여 의미를 찾아드립니다.',
  },
  {
    id: 3,
    title: '꿈을 시각화하세요',
    subtitle: '10가지 아트 스타일로 꿈을 예술 작품으로 변환',
    icon: '🎨',
    description: '몽환적인 수채화부터 초현실주의 유화까지, 꿈을 아름다운 이미지로 만나보세요.',
  },
  {
    id: 4,
    title: '안전한 커뮤니티',
    subtitle: '익명으로 꿈을 공유하고 집단 지성의 해몽을 경험하세요',
    icon: '🌟',
    description: '개인정보는 완벽히 보호되며, 따뜻한 공감과 통찰을 나눌 수 있습니다.',
  },
];

const OnboardingScreen: React.FC = () => {
  const { navigate } = useNavigationStore();
  const { setOnboardingCompleted } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // 온보딩 완료
      setOnboardingCompleted(true);
      navigate('Home');
    }
  };

  const handleSkip = () => {
    setOnboardingCompleted(true);
    navigate('Home');
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* 아이콘 */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{currentStepData.icon}</Text>
        </View>

        {/* 제목 */}
        <Text style={styles.title}>{currentStepData.title}</Text>
        
        {/* 부제목 */}
        <Text style={styles.subtitle}>{currentStepData.subtitle}</Text>
        
        {/* 설명 */}
        <Text style={styles.description}>{currentStepData.description}</Text>
      </View>

      {/* 진행 표시기 */}
      <View style={styles.progressContainer}>
        {onboardingSteps.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index === currentStep && styles.progressDotActive,
            ]}
          />
        ))}
      </View>

      {/* 버튼들 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
        >
          <Text style={styles.skipButtonText}>건너뛰기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === onboardingSteps.length - 1 ? '시작하기' : '다음'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#191D2E', // Night Sky Blue
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4A4063', // Dawn Purple
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#FFDDA8',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFDDA8', // Starlight Gold
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 20,
    color: '#EAE8F0', // Warm Grey 100
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 28,
  },
  description: {
    fontSize: 16,
    color: '#8F8C9B', // Warm Grey 400
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#595566', // Warm Grey 600
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: '#FFDDA8', // Starlight Gold
    width: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 40,
  },
  skipButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  skipButtonText: {
    color: '#8F8C9B', // Warm Grey 400
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: '#FFDDA8', // Starlight Gold
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    shadowColor: '#FFDDA8',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButtonText: {
    color: '#191D2E', // Night Sky Blue
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OnboardingScreen;