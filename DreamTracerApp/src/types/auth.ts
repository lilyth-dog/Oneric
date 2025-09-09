/**
 * 인증 관련 타입 정의
 */

export interface User {
  id: string;
  email?: string;
  name?: string;
  auth_provider: 'firebase' | 'google' | 'apple';
  subscription_plan: 'free' | 'plus';
  subscription_expires_at?: string;
  notification_settings?: Record<string, any>;
  hasCompletedOnboarding?: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email?: string;
  name?: string;
  auth_provider: 'firebase' | 'google' | 'apple';
  firebase_uid?: string;
  display_name?: string;
  photo_url?: string;
}

export interface OnboardingStep1 {
  display_name: string;
  birth_year: number;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
}

export interface OnboardingStep2 {
  interests: string[];
}

export interface OnboardingStep3 {
  notification_enabled: boolean;
  dream_reminder_time?: string;
  weekly_insight_enabled: boolean;
}

export interface OnboardingStep4 {
  primary_goal: string;
  dream_frequency: string;
}

export interface OnboardingData {
  step1: OnboardingStep1;
  step2: OnboardingStep2;
  step3: OnboardingStep3;
  step4: OnboardingStep4;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  token: string | null;
  onboardingCompleted: boolean;
}
