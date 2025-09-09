/**
 * 인증 상태 관리 (Zustand)
 */
import { create } from 'zustand';
import { AuthState, User, AuthToken } from '../types/auth';
import authService from '../services/authService';

interface AuthStore extends AuthState {
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  firebaseAuth: (firebaseToken: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  checkAuthState: () => Promise<void>;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setOnboardingCompleted: (completed: boolean) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set, _get) => ({
  // Initial state - 테스트를 위해 초기화
  isAuthenticated: false,
  isLoading: false,
  user: null,
  token: null,
  onboardingCompleted: false,

  // Actions
  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const result: AuthToken = await authService.login({ email, password });
      await authService.setUserData(result.user);
      
      set({
        isAuthenticated: true,
        user: result.user,
        token: result.access_token,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (userData: any) => {
    set({ isLoading: true });
    try {
      const result: AuthToken = await authService.register(userData);
      await authService.setUserData(result.user);
      
      set({
        isAuthenticated: true,
        user: result.user,
        token: result.access_token,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  firebaseAuth: async (firebaseToken: string) => {
    set({ isLoading: true });
    try {
      const result: AuthToken = await authService.firebaseAuth(firebaseToken);
      await authService.setUserData(result.user);
      
      set({
        isAuthenticated: true,
        user: result.user,
        token: result.access_token,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
      set({
        isAuthenticated: false,
        user: null,
        token: null,
        onboardingCompleted: false,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  checkAuthStatus: async () => {
    set({ isLoading: true });
    try {
      const isAuthenticated = await authService.checkAuthStatus();
      const userData = await authService.getUserData();
      const token = await authService.getToken();
      
      set({
        isAuthenticated,
        user: userData,
        token,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      console.error('Auth status check failed:', error);
    }
  },

  checkAuthState: async () => {
    set({ isLoading: true });
    try {
      const isAuthenticated = await authService.checkAuthStatus();
      const userData = await authService.getUserData();
      const token = await authService.getToken();
      
      set({
        isAuthenticated,
        user: userData,
        token,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      console.error('Auth state check failed:', error);
    }
  },

  setUser: (user: User | null) => {
    set({ user });
  },

  setToken: (token: string | null) => {
    set({ token });
  },

  setOnboardingCompleted: (completed: boolean) => {
    set({ onboardingCompleted: completed });
    // 사용자 객체도 업데이트
    const { user } = _get();
    if (user) {
      set({ user: { ...user, hasCompletedOnboarding: completed } });
    }
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));
