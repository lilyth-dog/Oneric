/**
 * 로그인 화면
 * 디자인 가이드에 따른 "고요한 탐험" 컨셉 구현
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigationStore } from '../../stores/navigationStore';
import { useAuthStore } from '../../stores/authStore';
import socialAuthService from '../../services/socialAuthService';
import AnimatedBackground from '../../components/AnimatedBackground';
import GoogleIcon from '../../components/GoogleIcon';
import NaverIcon from '../../components/NaverIcon';
import KakaoIcon from '../../components/KakaoIcon';
import { 
  Fonts, 
  FontSizes, 
  FontWeights, 
  DreamyLogoStyle, 
  ElegantTitleStyle, 
  DreamySubtitleStyle,
  EnglishDreamyStyle 
} from '../../styles/fonts';

const LoginScreen: React.FC = () => {
  const { navigate } = useNavigationStore();
  const { login, isLoading } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('입력 오류', '이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      await login(email.trim(), password);
      navigate('Home');
    } catch (error) {
      Alert.alert('로그인 실패', '이메일 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  const handleRegister = () => {
    navigate('Register');
  };

  const handleSocialLogin = (provider: 'google' | 'naver' | 'kakao') => {
    socialAuthService.handleSocialLogin(provider);
  };

  const handleTermsOfService = () => {
    navigate('TermsOfService');
  };

  const handlePrivacyPolicy = () => {
    navigate('PrivacyPolicy');
  };

  return (
    <AnimatedBackground>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.logo, DreamyLogoStyle]}>꿈결</Text>
          <Text style={[styles.subtitle, DreamySubtitleStyle]}>꿈을 통한 자기 성찰의 여정</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, DreamySubtitleStyle]}>이메일</Text>
            <TextInput
              style={[styles.input, EnglishDreamyStyle]}
              value={email}
              onChangeText={setEmail}
              placeholder="이메일을 입력하세요"
              placeholderTextColor="#8F8C9B"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, DreamySubtitleStyle]}>비밀번호</Text>
            <TextInput
              style={[styles.input, EnglishDreamyStyle]}
              value={password}
              onChangeText={setPassword}
              placeholder="비밀번호를 입력하세요"
              placeholderTextColor="#8F8C9B"
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <Text style={[styles.loginButtonText, ElegantTitleStyle]}>로그인 중...</Text>
                  <View style={styles.loadingDots}>
                    <Text style={styles.loadingDot}>.</Text>
                    <Text style={styles.loadingDot}>.</Text>
                    <Text style={styles.loadingDot}>.</Text>
                  </View>
                </View>
              ) : (
                <Text style={[styles.loginButtonText, ElegantTitleStyle]}>로그인</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
            >
              <Text style={styles.registerButtonText}>회원가입</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 소셜 로그인 */}
        <View style={styles.socialLoginContainer}>
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>소셜 로그인</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialButtons}>
            <TouchableOpacity
              style={[styles.socialButton, styles.googleButton]}
              onPress={() => handleSocialLogin('google')}
            >
              <GoogleIcon size={20} />
              <Text style={styles.googleButtonText}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, styles.naverButton]}
              onPress={() => handleSocialLogin('naver')}
            >
              <NaverIcon size={20} />
              <Text style={styles.naverButtonText}>Naver</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, styles.kakaoButton]}
              onPress={() => handleSocialLogin('kakao')}
            >
              <KakaoIcon size={20} />
              <Text style={styles.kakaoButtonText}>Kakao</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.legalLinks}>
            <TouchableOpacity onPress={handleTermsOfService} style={styles.legalLink}>
              <Text style={styles.linkText}>서비스 이용약관</Text>
            </TouchableOpacity>
            <Text style={styles.footerText}> • </Text>
            <TouchableOpacity onPress={handlePrivacyPolicy} style={styles.legalLink}>
              <Text style={styles.linkText}>개인정보처리방침</Text>
            </TouchableOpacity>
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AnimatedBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    ...DreamyLogoStyle,
    color: '#FFDDA8', // Starlight Gold
    marginBottom: 16,
    textShadowColor: 'rgba(255, 221, 168, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    ...DreamySubtitleStyle,
    color: '#8F8C9B', // Warm Grey 400
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    ...DreamySubtitleStyle,
    color: '#FFDDA8', // Starlight Gold
    marginBottom: 8,
    fontSize: FontSizes.sm,
  },
  input: {
    backgroundColor: '#4A4063', // Dawn Purple
    borderRadius: 12,
    padding: 16,
    ...BodyFontStyle,
    color: '#EAE8F0', // Warm Grey 100
    borderWidth: 1,
    borderColor: '#595566', // Warm Grey 600
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  loginButton: {
    backgroundColor: '#FFDDA8', // Starlight Gold
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    shadowColor: '#FFDDA8',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: '#595566', // Warm Grey 600
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    ...BodyFontStyle,
    color: '#191D2E', // Night Sky Blue
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#595566', // Warm Grey 600
  },
  dividerText: {
    ...SmallFontStyle,
    color: '#8F8C9B', // Warm Grey 400
    marginHorizontal: 16,
  },
  registerButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A4063', // Dawn Purple
    flex: 1,
  },
  registerButtonText: {
    ...BodyFontStyle,
    color: '#FFDDA8', // Starlight Gold
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    ...SmallFontStyle,
    color: '#8F8C9B', // Warm Grey 400
    textAlign: 'center',
    lineHeight: 18,
  },
  linkText: {
    ...SmallFontStyle,
    color: '#FFDDA8', // Starlight Gold
    textDecorationLine: 'underline',
    fontWeight: FontWeights.medium,
  },
  socialLoginContainer: {
    marginTop: 8,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  // Google 버튼
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DADCE0',
  },
  googleButtonText: {
    ...SmallFontStyle,
    color: '#3C4043',
    fontWeight: FontWeights.semibold,
    marginLeft: 8,
  },
  // Naver 버튼
  naverButton: {
    backgroundColor: '#03C75A',
    borderWidth: 1,
    borderColor: '#03C75A',
  },
  naverButtonText: {
    ...SmallFontStyle,
    color: '#FFFFFF',
    fontWeight: FontWeights.semibold,
    marginLeft: 8,
  },
  // Kakao 버튼
  kakaoButton: {
    backgroundColor: '#FEE500',
    borderWidth: 1,
    borderColor: '#FEE500',
  },
  kakaoButtonText: {
    ...SmallFontStyle,
    color: '#000000',
    fontWeight: FontWeights.semibold,
    marginLeft: 8,
  },
  legalLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  legalLink: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 221, 168, 0.1)', // Starlight Gold with opacity
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  loadingDot: {
    color: '#FFDDA8',
    fontSize: 20,
    marginHorizontal: 2,
  },
});

export default LoginScreen;