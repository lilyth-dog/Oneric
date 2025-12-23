/**
 * 네비게이션 상태 관리 (Zustand)
 * React Navigation 대신 상태 기반 네비게이션 사용
 */
import { create } from 'zustand';

export type ScreenName =
  | 'Home'
  | 'CreateDream'
  | 'DreamAnalysis'
  | 'Insights'
  | 'VisualizationGallery'
  | 'CommunityFeed'
  | 'Profile'
  | 'Login'
  | 'Register'
  | 'Onboarding'
  | 'Settings'
  | 'TermsOfService'
  | 'PrivacyPolicy'
  | 'DreamHistory';

interface NavigationState {
  currentScreen: ScreenName;
  screenHistory: ScreenName[];
  params: Record<string, any>;

  // Actions
  navigate: (screen: ScreenName, params?: Record<string, any>) => void;
  goBack: () => void;
  reset: () => void;
  setParams: (params: Record<string, any>) => void;
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  currentScreen: 'Login',
  screenHistory: ['Login'],
  params: {},

  navigate: (screen: ScreenName, params = {}) => {
    const { screenHistory } = get();

    set({
      currentScreen: screen,
      screenHistory: [...screenHistory, screen],
      params,
    });
  },

  goBack: () => {
    const { screenHistory } = get();

    if (screenHistory.length > 1) {
      const newHistory = [...screenHistory];
      newHistory.pop(); // 현재 화면 제거
      const previousScreen = newHistory[newHistory.length - 1];

      set({
        currentScreen: previousScreen,
        screenHistory: newHistory,
        params: {},
      });
    }
  },

  reset: () => {
    set({
      currentScreen: 'Home',
      screenHistory: ['Home'],
      params: {},
    });
  },

  setParams: (params: Record<string, any>) => {
    set({ params });
  },
}));
