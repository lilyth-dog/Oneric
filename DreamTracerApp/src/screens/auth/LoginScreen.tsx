/**
 * 로그인 화면
 * 디자인 가이드에 따른 "고요한 탐험" 컨셉 구현
 */
import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
  LayoutAnimation, // Added
  UIManager, // Added
  ActivityIndicator,
} from 'react-native';
import GlassView from '../../components/common/GlassView';
import { useNavigationStore } from '../../stores/navigationStore';
import { useAuthStore } from '../../stores/authStore';
import socialAuthService from '../../services/socialAuthService';
import AnimatedBackground from '../../components/AnimatedBackground';
import BrandLogo from '../../components/common/BrandLogo'; // Imported
import { hapticService } from '../../services/hapticService';
import { soundService } from '../../services/soundService'; // Imported
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
  EnglishDreamyStyle,
  BodyFontStyle,
  SmallFontStyle,
  SubtitleFontStyle
} from '../../styles/fonts';

const LoginScreen: React.FC = () => {
  const { navigate, reset } = useNavigationStore();
  const { login, isLoading } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // State for Progressive Login UI
  const [showEmailForm, setShowEmailForm] = useState(false);

  // Enable LayoutAnimation for Android
  useEffect(() => {
    if (Platform.OS === 'android') {
      if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
      }
    }
  }, []);

  const toggleEmailForm = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowEmailForm(!showEmailForm);
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('입력 오류', '이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      await login(email.trim(), password);
      // 로그인 성공 시 스택 초기화 및 홈으로 이동
      reset();
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

  // Logo shimmer animation
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [shimmerAnim]);

  const logoOpacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.8, 1, 0.8],
  });

  const logoScale = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.02, 1],
  });

  return (
    <AnimatedBackground>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Enhanced Header with Animation */}
        <View style={styles.header}>
          <Animated.View 
            style={{
              alignItems: 'center',
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
              marginBottom: 16,
            }}
          >
            <BrandLogo width={100} height={100} />
            <Text style={[styles.logo, DreamyLogoStyle, { fontSize: 40, marginTop: -10 }]}>
              꿈결
            </Text>
          </Animated.View>
          <Text style={[styles.subtitle, DreamySubtitleStyle]}>꿈을 통한 자기 성찰의 여정</Text>
          <Text style={styles.welcomeText}>무의식의 세계로 떠나는 여행</Text>
        </View>

        {/* Social Login Mode (Default) */}
        {!showEmailForm && (
          <View style={styles.socialModeContainer}>
            <View style={styles.socialLoginContainer}>
              <Text style={styles.socialUiLabel}>간편하게 시작하기</Text>
              <View style={styles.socialButtons}>
                <TouchableOpacity
                  style={[styles.socialButton, styles.kakaoButton]}
                  onPress={() => handleSocialLogin('kakao')}
                  activeOpacity={0.7} 
                  onPress={() => {
                    hapticService.trigger('light');
                    soundService.play('click');
                    handleSocialLogin('kakao');
                  }}
                  style={styles.socialIconButton}
                >
                  <KakaoIcon size={20} />
                </TouchableOpacity>

                <TouchableOpacity 
                  activeOpacity={0.7} 
                  onPress={() => {
                    hapticService.trigger('light');
                    soundService.play('click');
                    handleSocialLogin('naver');
                  }}
                  style={styles.socialIconButton}
                >
                  <NaverIcon size={20} />
                </TouchableOpacity>

                <TouchableOpacity 
                  activeOpacity={0.7} 
                  onPress={() => {
                    hapticService.trigger('light');
                    soundService.play('click');
                    handleSocialLogin('google');
                  }}
                  style={styles.socialIconButton}
                >
                  <GoogleIcon size={20} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.emailModeButton} onPress={toggleEmailForm}>
              <Text style={styles.emailModeButtonText}>또는 이메일로 로그인</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Email Form Mode */}
        {showEmailForm && (
          <GlassView style={styles.formContainer}>
            <View style={styles.formHeader}>
               <TouchableOpacity onPress={toggleEmailForm} style={styles.backButton}>
                 <Text style={styles.backButtonText}>← 뒤로</Text>
               </TouchableOpacity>
               <Text style={styles.formTitle}>이메일 로그인</Text>
               <View style={{width: 40}} /> 
            </View>

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

          {/* Login Actions */}
          <View style={styles.loginActions}>
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#191D2E" size="small" />
                  <Text style={styles.loginButtonText}> 로그인 중...</Text>
                </View>
              ) : (
                <Text style={styles.loginButtonText}>로그인</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => (navigate as any).navigate('Register')} // Changed to use navigate from useNavigationStore
            >
              <Text style={styles.registerButtonText}>회원가입</Text>
            </TouchableOpacity>
          </View>
          </GlassView>
        )}

        {/* Footer (Terms etc) - Only show in Social Mode to keep Form clean? Or always? Keep simple. */}
        {!showEmailForm && (
           <View style={styles.footer}>
             <View style={styles.legalLinks}>
              <TouchableOpacity style={styles.legalLink} onPress={handleTermsOfService}>
                <Text style={styles.linkText}>서비스 이용약관</Text>
              </TouchableOpacity>
              <Text style={styles.footerText}> • </Text>
              <TouchableOpacity style={styles.legalLink} onPress={handlePrivacyPolicy}>
                <Text style={styles.linkText}>개인정보처리방침</Text>
              </TouchableOpacity>
            </View>
           </View>
        )}
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
    marginBottom: 24, // Reduced from 48
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
    marginBottom: 16, // Reduced from 32
  },
  inputContainer: {
    marginBottom: 16, // Reduced from 24
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
    padding: 14, // Reduced from 16
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
    borderRadius: 8,
    paddingVertical: 12, // Reduced padding
    alignItems: 'center',
    flex: 2, // Take more space than register
    shadowColor: '#FFDDA8',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#595566', // Warm Grey 600
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    ...BodyFontStyle,
    color: '#191D2E', // Night Sky Blue
    fontSize: 14, // Reduced font size
    fontWeight: FontWeights.semibold,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16, // Reduced from 24
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
    borderRadius: 8,
    paddingVertical: 12, // Reduced padding
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A4063', // Dawn Purple
    flex: 1, // Smaller than login
  },
  registerButtonText: {
    ...BodyFontStyle,
    color: '#FFDDA8', // Starlight Gold
    fontSize: 14, // Reduced font size
    fontWeight: FontWeights.medium,
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
    justifyContent: 'center',
    gap: 20,
    marginTop: 12,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  socialUiLabel: {
     ...SmallFontStyle,
     color: '#8F8C9B',
     textAlign: 'center',
     marginBottom: 8,
     fontSize: 12,
  },
  // Google 버튼 (White Circle)
  googleButton: {
    backgroundColor: '#FFFFFF',
  },
  // Naver 버튼 (Green Circle)
  naverButton: {
    backgroundColor: '#03C75A',
  },
  // Kakao 버튼 (Yellow Circle)
  kakaoButton: {
    backgroundColor: '#FEE500',
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
  welcomeText: {
    ...SmallFontStyle,
    color: '#595566',
    marginTop: 8,
    fontSize: 12,
    letterSpacing: 1,
  },
  glassContainer: {
    // Replaced by reusable GlassView
  },
  // Progressive Login UI Styles
  socialModeContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  emailModeButton: {
    marginTop: 32,
    padding: 12,
  },
  emailModeButtonText: {
    ...SmallFontStyle,
    color: '#8F8C9B',
    textDecorationLine: 'underline',
  },
  formContainer: {
    width: '100%',
    padding: 20,
    marginTop: 20,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    ...SmallFontStyle,
    color: '#EAE8F0',
  },
  formTitle: {
    ...DreamySubtitleStyle,
    fontSize: 18,
    color: '#FFDDA8',
  },
  loginActions: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legalDivider: {
    ...SmallFontStyle,
    color: '#595566',
    marginHorizontal: 8,
  },
});

export default LoginScreen;