/**
 * 온보딩 메인 화면
 */
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import OnboardingStep1 from './OnboardingStep1';
import OnboardingStep2 from './OnboardingStep2';
import OnboardingStep3 from './OnboardingStep3';
import OnboardingStep4 from './OnboardingStep4';
import { OnboardingData } from '../../types/auth';
import authService from '../../services/authService';

const OnboardingScreen: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>({});
  const navigation = useNavigation();

  const handleStep1Next = (data: any) => {
    setOnboardingData(prev => ({ ...prev, step1: data }));
    setCurrentStep(2);
  };

  const handleStep2Next = (data: any) => {
    setOnboardingData(prev => ({ ...prev, step2: data }));
    setCurrentStep(3);
  };

  const handleStep2Back = () => {
    setCurrentStep(1);
  };

  const handleStep3Next = (data: any) => {
    setOnboardingData(prev => ({ ...prev, step3: data }));
    setCurrentStep(4);
  };

  const handleStep3Back = () => {
    setCurrentStep(2);
  };

  const handleStep4Complete = async (data: any) => {
    try {
      const completeData: OnboardingData = {
        ...onboardingData,
        step4: data,
      } as OnboardingData;

      await authService.completeOnboarding(completeData);
      
      Alert.alert(
        '환영합니다!',
        '온보딩이 완료되었습니다. 꿈결과 함께 꿈의 여행을 시작해보세요!',
        [
          {
            text: '시작하기',
            onPress: () => navigation.navigate('Main' as never),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        '오류',
        '온보딩 완료 중 오류가 발생했습니다. 다시 시도해주세요.',
        [
          {
            text: '확인',
            onPress: () => setCurrentStep(4),
          },
        ]
      );
    }
  };

  const handleStep4Back = () => {
    setCurrentStep(3);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <OnboardingStep1 onNext={handleStep1Next} />;
      case 2:
        return (
          <OnboardingStep2
            onNext={handleStep2Next}
            onBack={handleStep2Back}
          />
        );
      case 3:
        return (
          <OnboardingStep3
            onNext={handleStep3Next}
            onBack={handleStep3Back}
          />
        );
      case 4:
        return (
          <OnboardingStep4
            onComplete={handleStep4Complete}
            onBack={handleStep4Back}
          />
        );
      default:
        return <OnboardingStep1 onNext={handleStep1Next} />;
    }
  };

  return (
    <View style={styles.container}>
      {renderCurrentStep()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
});

export default OnboardingScreen;
