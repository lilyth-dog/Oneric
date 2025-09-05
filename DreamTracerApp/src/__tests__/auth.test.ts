/**
 * 인증 시스템 테스트
 */
import authService from '../services/authService';
import { useAuthStore } from '../stores/authStore';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockResponse = {
        access_token: 'mock-token',
        token_type: 'bearer',
        expires_in: 1800,
        user: {
          id: '1',
          email: 'test@example.com',
          auth_provider: 'firebase',
          subscription_plan: 'free',
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })
      );
    });

    it('should throw error with invalid credentials', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ detail: 'Invalid credentials' }),
      });

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('register', () => {
    it('should register successfully with valid data', async () => {
      const mockResponse = {
        access_token: 'mock-token',
        token_type: 'bearer',
        expires_in: 1800,
        user: {
          id: '1',
          email: 'test@example.com',
          auth_provider: 'firebase',
          subscription_plan: 'free',
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await authService.register({
        email: 'test@example.com',
        auth_provider: 'firebase',
      });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/auth/register',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'test@example.com',
            auth_provider: 'firebase',
          }),
        })
      );
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const { removeItem } = require('@react-native-async-storage/async-storage');
      
      await authService.logout();
      
      expect(removeItem).toHaveBeenCalledWith('auth_token');
      expect(removeItem).toHaveBeenCalledWith('user_data');
    });
  });
});

describe('AuthStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have initial state', () => {
    const state = useAuthStore.getState();
    
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.user).toBe(null);
    expect(state.token).toBe(null);
    expect(state.onboardingCompleted).toBe(false);
  });

  it('should set loading state during login', async () => {
    const mockResponse = {
      access_token: 'mock-token',
      token_type: 'bearer',
      expires_in: 1800,
      user: {
        id: '1',
        email: 'test@example.com',
        auth_provider: 'firebase',
        subscription_plan: 'free',
      },
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const { login } = useAuthStore.getState();
    
    // 로그인 시작
    const loginPromise = login('test@example.com', 'password123');
    
    // 로딩 상태 확인
    expect(useAuthStore.getState().isLoading).toBe(true);
    
    // 로그인 완료 대기
    await loginPromise;
    
    // 최종 상태 확인
    const finalState = useAuthStore.getState();
    expect(finalState.isAuthenticated).toBe(true);
    expect(finalState.user).toEqual(mockResponse.user);
    expect(finalState.token).toBe(mockResponse.access_token);
    expect(finalState.isLoading).toBe(false);
  });
});
