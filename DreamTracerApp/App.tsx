/**
 * 꿈결 - 꿈 기록 및 분석 앱
 * @format
 */

import React, { useEffect } from 'react';
import { StatusBar, useColorScheme, LogBox, SafeAreaView, BackHandler } from 'react-native';
import { useNavigationStore } from './src/stores/navigationStore';
import { useAuthStore } from './src/stores/authStore';
import HomeScreen from './src/screens/main/HomeScreen';
import CreateDreamScreen from './src/screens/dream/CreateDreamScreen';
import DreamAnalysisScreen from './src/screens/analysis/DreamAnalysisScreen';
import InsightsScreen from './src/screens/analysis/InsightsScreen';
import VisualizationGalleryScreen from './src/screens/visualization/VisualizationGalleryScreen';
import DreamHistoryScreen from './src/screens/dream/DreamHistoryScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import OnboardingScreen from './src/screens/onboarding/OnboardingScreen';
import SplashScreen from './src/screens/onboarding/SplashScreen'; // Imported
import ScreenTransition from './src/components/common/ScreenTransition'; // Imported
import TermsOfServiceScreen from './src/screens/legal/TermsOfServiceScreen';
import PrivacyPolicyScreen from './src/screens/legal/PrivacyPolicyScreen';
import CommunityFeedScreen from './src/screens/community/CommunityFeedScreen';
import ProfileScreen from './src/screens/settings/ProfileScreen';
import AIConnectionTestScreen from './src/screens/settings/AIConnectionTestScreen';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const { currentScreen, params, goBack, screenHistory } = useNavigationStore();
  const { user, isAuthenticated } = useAuthStore();
  const [isSplashVisible, setIsSplashVisible] = React.useState(true); // Splash State

  // 개발 모드 경고 메시지 숨기기
  LogBox.ignoreAllLogs(true);

  // 하드웨어 뒤로가기 버튼 핸들러
  useEffect(() => {
    const backAction = () => {
      // 히스토리가 1개보다 많으면 뒤로가기 수행
      if (screenHistory.length > 1) {
        goBack();
        return true; // 이벤트 처리됨 (앱 종료 방지)
      }
      // 히스토리가 1개(홈 등)이면 기본 동작 (앱 종료 or 백그라운드)
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [screenHistory, goBack]);

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
      case 'DreamHistory':
        return <DreamHistoryScreen />;
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
      case 'CommunityFeed':
        return <CommunityFeedScreen />;
      case 'Profile':
        return <ProfileScreen />;
      case 'Settings': // Map Settings to AI Test temporarily
        return <AIConnectionTestScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDarkMode ? '#191D2E' : '#EAE8F0' }}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#191D2E' : '#EAE8F0'}
      />
      {isSplashVisible ? (
        <SplashScreen onFinish={() => setIsSplashVisible(false)} />
      ) : (
        <ScreenTransition key={currentScreen}>
          {renderScreen()}
        </ScreenTransition>
      )}
    </SafeAreaView>
  );
}

export default App;