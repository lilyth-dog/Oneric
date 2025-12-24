import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  // Dimensions,
} from 'react-native';
import { useNavigationStore } from '../../stores/navigationStore';
import { useAuthStore } from '../../stores/authStore';
import MascotAvatar from '../../components/mascot/MascotAvatar';
import MascotBubble from '../../components/mascot/MascotBubble';
import { hapticService } from '../../services/hapticService';
import { 
  EmotionalTitleStyle, 
  EmotionalSubtitleStyle, 
  BodyFontStyle, 
  SmallFontStyle 
} from '../../styles/fonts';

  // const { width, height } = Dimensions.get('window');

const onboardingSteps = [
  {
    id: 1,
    title: '꿈을 기록하세요',
    subtitle: '텍스트와 음성으로 꿈을 자유롭게 기록할 수 있습니다',
    icon: '📝',
    description: '잠에서 깬 직후에도 쉽고 빠르게 꿈의 내용을 저장하세요.',
    lunaMessage: '안녕! 나는 당신의 꿈 가이드 루나예요. ✨\n잊어버리기 전에 어젯밤 꿈을 저에게 들려주세요!',
    lunaMood: 'happy' as const,
  },
  {
    id: 2,
    title: 'AI가 분석해드립니다',
    subtitle: '심리학적 통찰과 개인화된 해석을 제공합니다',
    icon: '🧠',
    description: 'Google Gemini AI가 꿈의 상징과 감정 패턴을 분석하여 의미를 찾아드립니다.',
    lunaMessage: '당신의 무의식 속에 숨겨진 의미를 제가 분석해 드릴게요. 🔮\n어떤 감정이 느껴졌는지 궁금해요!',
    lunaMood: 'calm' as const,
  },
  {
    id: 3,
    title: '꿈을 시각화하세요',
    subtitle: '10가지 아트 스타일로 꿈을 예술 작품으로 변환',
    icon: '🎨',
    description: '몽환적인 수채화부터 초현실주의 유화까지, 꿈을 아름다운 이미지로 만나보세요.',
    lunaMessage: '꿈속 풍경을 그림으로 그려볼까요? 🎨\n당신만의 특별한 예술 작품이 탄생할 거예요!',
    lunaMood: 'happy' as const,
  },
  {
    id: 4,
    title: '안전한 커뮤니티',
    subtitle: '익명으로 꿈을 공유하고 집단 지성의 해몽을 경험하세요',
    icon: '🌟',
    description: '개인정보는 완벽히 보호되며, 따뜻한 공감과 통찰을 나눌 수 있습니다.',
    lunaMessage: '다른 사람들과 꿈을 나누면 새로운 통찰을 얻을 수 있어요. 🌍\n걱정 마세요, 당신의 프라이버시는 소중하니까요!',
    lunaMood: 'calm' as const,
  },
];

const OnboardingScreen: React.FC = () => {
  const { navigate } = useNavigationStore();
  const { setOnboardingCompleted } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);

  // Animation Refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    runStepAnimation();
  }, [currentStep]);

  const runStepAnimation = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(20);
    scaleAnim.setValue(0.9);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
    
    hapticService.trigger('light');
  };

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // 온보딩 완료
      hapticService.trigger('medium');
      setOnboardingCompleted(true);
      navigate('Login'); // Go to Login first after onboarding
    }
  };

  const handleSkip = () => {
    hapticService.trigger('light');
    setOnboardingCompleted(true);
    navigate('Login');
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <View style={styles.container}>
      {/* Background Decorative Elements */}
      <View style={styles.bgDecorCircle1} />
      <View style={styles.bgDecorCircle2} />

      <Animated.View style={[
        styles.content,
        { 
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ]
        }
      ]}>
        {/* Mascot Guide Section */}
        <View style={styles.mascotContainer}>
          <TouchableOpacity 
            activeOpacity={0.9}
            onPress={() => hapticService.trigger('medium')}
            style={styles.mascotTouchable}
          >
            <MascotAvatar size={140} mood={currentStepData.lunaMood} />
          </TouchableOpacity>
          <View style={styles.mascotBubbleWrapper}>
            <MascotBubble text={currentStepData.lunaMessage} mood={currentStepData.lunaMood} />
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoContainer}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>STEP {currentStep + 1}</Text>
          </View>
          <Text style={styles.title}>{currentStepData.title}</Text>
          <Text style={styles.subtitle}>{currentStepData.subtitle}</Text>
          <Text style={styles.description}>{currentStepData.description}</Text>
        </View>
      </Animated.View>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        <View style={styles.progressContainer}>
          {onboardingSteps.map((_, index) => (
            <TouchableOpacity 
              key={index} 
              onPress={() => {
                hapticService.trigger('light');
                setCurrentStep(index);
              }}
              style={styles.progressDotTouchable}
            >
              <View
                style={[
                  styles.progressDot,
                  index === currentStep && styles.progressDotActive,
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

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
              {currentStep === onboardingSteps.length - 1 ? '꿈 기록하기' : '다음'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#191D2E', // Night Sky Blue
  },
  bgDecorCircle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(167, 139, 250, 0.05)',
  },
  bgDecorCircle2: {
    position: 'absolute',
    bottom: 100,
    left: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255, 221, 168, 0.03)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  mascotContainer: {
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
  },
  mascotTouchable: {
    marginBottom: 20,
    zIndex: 2,
  },
  mascotBubbleWrapper: {
    width: '100%',
    paddingHorizontal: 10,
  },
  infoContainer: {
    alignItems: 'center',
    width: '100%',
  },
  stepBadge: {
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.3)',
  },
  stepBadgeText: {
    ...SmallFontStyle,
    color: '#A78BFA',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  title: {
    ...EmotionalTitleStyle,
    fontSize: 28,
    color: '#FFDDA8', // Starlight Gold
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    ...EmotionalSubtitleStyle,
    fontSize: 18,
    color: '#EAE8F0', // Warm Grey 100
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 26,
  },
  description: {
    ...BodyFontStyle,
    fontSize: 15,
    color: '#8F8C9B', // Warm Grey 400
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  footer: {
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  progressDotTouchable: {
    padding: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#595566', // Warm Grey 600
  },
  progressDotActive: {
    backgroundColor: '#FFDDA8', // Starlight Gold
    width: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  skipButtonText: {
    ...BodyFontStyle,
    color: '#8F8C9B', // Warm Grey 400
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: '#FFDDA8', // Starlight Gold
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    shadowColor: '#FFDDA8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButtonText: {
    ...BodyFontStyle,
    color: '#191D2E', // Night Sky Blue
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OnboardingScreen;