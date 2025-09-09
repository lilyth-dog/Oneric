/**
 * 인증 서비스
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthToken, LoginCredentials, RegisterData, OnboardingData } from '../types/auth';

// Android 에뮬레이터에서는 localhost 대신 10.0.2.2 사용
const API_BASE_URL = __DEV__ ? 'http://10.0.2.2:8000/api/v1' : 'http://localhost:8000/api/v1';

class AuthService {
  private token: string | null = null;

  /**
   * 사용자 등록
   */
  async register(userData: RegisterData): Promise<AuthToken> {
    try {
      // 로컬 개발용 - 실제 API 대신 시뮬레이션
      console.log('Registering user:', userData);
      
      // 시뮬레이션된 응답
      const mockResult: AuthToken = {
        access_token: 'mock_access_token_' + Date.now(),
        token_type: 'bearer',
        expires_in: 3600,
        user: {
          id: 'user_' + Date.now(),
          email: userData.email,
          name: userData.name,
          auth_provider: 'firebase',
          subscription_plan: 'free',
          hasCompletedOnboarding: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      };

      await this.setToken(mockResult.access_token);
      await this.setUserData(mockResult.user);
      
      return mockResult;
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
      // 로컬 개발용 - 실제 API 대신 시뮬레이션
      console.log('Logging in user:', credentials.email);
      
      // 간단한 검증 (실제로는 서버에서 처리)
      if (!credentials.email || !credentials.password) {
        throw new Error('이메일과 비밀번호를 입력해주세요.');
      }

      // 시뮬레이션된 응답
      const mockResult: AuthToken = {
        access_token: 'mock_access_token_' + Date.now(),
        token_type: 'bearer',
        expires_in: 3600,
        user: {
          id: 'user_' + Date.now(),
          email: credentials.email,
          name: credentials.email.split('@')[0],
          auth_provider: 'firebase',
          subscription_plan: 'free',
          hasCompletedOnboarding: true, // 로그인 시에는 온보딩 완료로 가정
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      };

      await this.setToken(mockResult.access_token);
      await this.setUserData(mockResult.user);
      
      return mockResult;
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
