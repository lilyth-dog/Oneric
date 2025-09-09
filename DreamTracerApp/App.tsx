/**
 * 꿈결 - 꿈 기록 및 분석 앱
 * @format
 */

import React from 'react';
import { StatusBar, useColorScheme, LogBox } from 'react-native';
import { useNavigationStore } from './src/stores/navigationStore';
import { useAuthStore } from './src/stores/authStore';
import HomeScreen from './src/screens/main/HomeScreen';
import CreateDreamScreen from './src/screens/dream/CreateDreamScreen';
import DreamAnalysisScreen from './src/screens/analysis/DreamAnalysisScreen';
import InsightsScreen from './src/screens/analysis/InsightsScreen';
import VisualizationGalleryScreen from './src/screens/visualization/VisualizationGalleryScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import OnboardingScreen from './src/screens/onboarding/OnboardingScreen';
import TermsOfServiceScreen from './src/screens/legal/TermsOfServiceScreen';
import PrivacyPolicyScreen from './src/screens/legal/PrivacyPolicyScreen';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const { currentScreen, params } = useNavigationStore();
  const { user, isAuthenticated } = useAuthStore();

  // 개발 모드 경고 메시지 숨기기
  LogBox.ignoreAllLogs(true);

  // 인증 상태에 따른 초기 화면 결정
  // const getInitialScreen = () => {
  //   if (!isAuthenticated) {
  //     return 'Login';
  //   }
  //   if (!user?.hasCompletedOnboarding) {
  //     return 'Onboarding';
  //   }
  //   return 'Home';
  // };

  const renderScreen = () => {
    // 인증되지 않은 경우 로그인 화면으로
    if (!isAuthenticated && currentScreen !== 'Login' && currentScreen !== 'Register') {
      return <LoginScreen />;
    }

    // 온보딩이 완료되지 않은 경우 온보딩 화면으로
    if (isAuthenticated && !user?.hasCompletedOnboarding && currentScreen !== 'Onboarding') {
      return <OnboardingScreen />;
    }

    switch (currentScreen) {
      case 'Home':
        return <HomeScreen />;
      case 'CreateDream':
        return <CreateDreamScreen />;
      case 'DreamAnalysis':
        return <DreamAnalysisScreen dreamId={params.dreamId} />;
      case 'Insights':
        return <InsightsScreen />;
      case 'VisualizationGallery':
        return <VisualizationGalleryScreen />;
      case 'Login':
        return <LoginScreen />;
      case 'Register':
        return <RegisterScreen />;
      case 'Onboarding':
        return <OnboardingScreen />;
      case 'TermsOfService':
        return <TermsOfServiceScreen />;
      case 'PrivacyPolicy':
        return <PrivacyPolicyScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#191D2E' : '#EAE8F0'}
      />
      {renderScreen()}
    </>
  );
}

export default App;