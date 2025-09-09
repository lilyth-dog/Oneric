/**
 * 회원가입 화면
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
  FontSizes,
  FontWeights,
  DreamyLogoStyle, 
  DreamySubtitleStyle,
  SubtitleFontStyle,
  BodyFontStyle,
  SmallFontStyle
} from '../../styles/fonts';

const RegisterScreen: React.FC = () => {
  const { navigate, goBack } = useNavigationStore();
  const { register, isLoading } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');

  const validateForm = () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim() || !name.trim()) {
      Alert.alert('입력 오류', '모든 필드를 입력해주세요.');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('비밀번호 오류', '비밀번호가 일치하지 않습니다.');
      return false;
    }

    if (password.length < 8) {
      Alert.alert('비밀번호 오류', '비밀번호는 최소 8자 이상이어야 합니다.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('이메일 오류', '올바른 이메일 형식을 입력해주세요.');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      await register({
        email: email.trim(),
        password,
        name: name.trim(),
      });
      navigate('Home');
    } catch (error) {
      Alert.alert('회원가입 실패', '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  // const handleLogin = () => {
  //   navigate('Login');
  // };

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
          <Text style={styles.logo}>꿈결</Text>
          <Text style={styles.subtitle}>새로운 탐험의 시작</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>이름</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="이름을 입력하세요"
              placeholderTextColor="#8F8C9B"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>이메일</Text>
            <TextInput
              style={styles.input}
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
            <Text style={styles.inputLabel}>비밀번호</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="비밀번호를 입력하세요 (최소 8자)"
              placeholderTextColor="#8F8C9B"
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>비밀번호 확인</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="비밀번호를 다시 입력하세요"
              placeholderTextColor="#8F8C9B"
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.registerButton, isLoading && styles.disabledButton]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text style={styles.registerButtonText}>
                {isLoading ? '가입 중...' : '회원가입'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={goBack}
            >
              <Text style={styles.backButtonText}>로그인</Text>
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
    marginBottom: 40,
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
    marginBottom: 20,
  },
  inputLabel: {
    ...SubtitleFontStyle,
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
  registerButton: {
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
  registerButtonText: {
    ...BodyFontStyle,
    color: '#191D2E', // Night Sky Blue
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
  },
  backButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A4063', // Dawn Purple
    flex: 1,
  },
  backButtonText: {
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#3A3F5C', // Warm Grey 600
  },
  dividerText: {
    ...SmallFontStyle,
    color: '#8F8C9B', // Warm Grey 400
    marginHorizontal: 16,
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
});

export default RegisterScreen;