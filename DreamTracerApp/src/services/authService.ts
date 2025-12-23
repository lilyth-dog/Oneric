/**
 * 인증 서비스
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthToken, LoginCredentials, RegisterData, OnboardingData } from '../types/auth';

import Config from '../config/config';

const { API_BASE_URL } = Config;

class AuthService {
  private token: string | null = null;

  /**
   * 사용자 등록
   */
  async register(userData: RegisterData): Promise<AuthToken> {
    try {

      // 백엔드가 "mock_token:{email}"을 받으면 자동으로 유저를 생성하거나 찾아서 토큰을 발급함
      const mockFirebaseToken = `mock_token:${userData.email}`;
      return await this.firebaseAuth(mockFirebaseToken);
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  /**
   * 사용자 로그인
   */
  async login(credentials: LoginCredentials): Promise<AuthToken> {
    try {


      if (!credentials.email) {
        throw new Error('이메일을 입력해주세요.');
      }

      // 백엔드 Mock Auth 사용
      const mockFirebaseToken = `mock_token:${credentials.email}`;
      return await this.firebaseAuth(mockFirebaseToken);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Firebase 인증
   */
  async firebaseAuth(firebaseToken: string): Promise<AuthToken> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/firebase-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firebase_token: firebaseToken }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Firebase 인증에 실패했습니다');
      }

      const result = await response.json();
      await this.setToken(result.access_token);
      return result;
    } catch (error) {
      console.error('Firebase auth error:', error);
      throw error;
    }
  }

  /**
   * 온보딩 완료
   */
  async completeOnboarding(onboardingData: OnboardingData): Promise<void> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('인증 토큰이 없습니다');
      }

      const response = await fetch(`${API_BASE_URL}/auth/onboarding/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(onboardingData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || '온보딩 완료에 실패했습니다');
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      throw error;
    }
  }

  /**
   * 로그아웃
   */
  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
      this.token = null;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * 토큰 저장
   */
  private async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('auth_token', token);
      this.token = token;
    } catch (error) {
      console.error('Set token error:', error);
      throw error;
    }
  }

  /**
   * 토큰 조회
   */
  async getToken(): Promise<string | null> {
    try {
      if (this.token) {
        return this.token;
      }
      const token = await AsyncStorage.getItem('auth_token');
      this.token = token;
      return token;
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  }

  /**
   * 사용자 데이터 저장
   */
  async setUserData(userData: any): Promise<void> {
    try {
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));
    } catch (error) {
      console.error('Set user data error:', error);
      throw error;
    }
  }

  /**
   * 사용자 데이터 조회
   */
  async getUserData(): Promise<any | null> {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Get user data error:', error);
      return null;
    }
  }

  /**
   * 인증 상태 확인
   */
  async checkAuthStatus(): Promise<boolean> {
    try {
      const token = await this.getToken();
      return !!token;
    } catch (error) {
      console.error('Check auth status error:', error);
      return false;
    }
  }
}

export default new AuthService();
