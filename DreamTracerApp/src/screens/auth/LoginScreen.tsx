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
import GlassButton from '../../components/common/GlassButton';
import socialAuthService from '../../services/socialAuthService';
import BrandLogo from '../../components/common/BrandLogo';
import MascotAvatar from '../../components/mascot/MascotAvatar'; // Imported
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
  
  // Mascot floating animation
  const floatAnim = useRef(new Animated.Value(0)).current;
  
  // Glow pulse animation
  const glowAnim = useRef(new Animated.Value(0)).current;
  
  // Typing animation state
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const fullText = '반가워요! 저는 루나예요 ✨\n당신의 꿈 여행을 함께할게요';
  
  // Mascot touch state
  const [mascotScale] = useState(new Animated.Value(1));
  const [mascotMood, setMascotMood] = useState<'happy' | 'calm' | 'concerned'>('happy');
  
  useEffect(() => {
    // Logo shimmer
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
    
    // Mascot floating animation
    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    float.start();
    
    // Glow pulse animation
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: false,
        }),
      ])
    );
    glow.start();
    
    return () => {
      shimmer.stop();
      float.stop();
      glow.stop();
    };
  }, [shimmerAnim, floatAnim, glowAnim]);
  
  // Typing effect
  useEffect(() => {
    let currentIndex = 0;
    setDisplayedText('');
    setIsTypingComplete(false);
    
    const typingInterval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex + 1));
        currentIndex++;
        
        // Haptic feedback every 5th character
        if (currentIndex % 5 === 0) {
          hapticService.trigger('light');
        }
      } else {
        clearInterval(typingInterval);
        setIsTypingComplete(true);
      }
    }, 50);
    
    return () => clearInterval(typingInterval);
  }, []);
  
  // Mascot touch handler
  const handleMascotPress = () => {
    hapticService.trigger('medium');
    soundService.play('click');
    
    // Bounce animation
    Animated.sequence([
      Animated.timing(mascotScale, {
        toValue: 1.15,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(mascotScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Cycle through moods
    const moods: Array<'happy' | 'calm' | 'concerned'> = ['happy', 'calm', 'concerned'];
    const currentIndex = moods.indexOf(mascotMood);
    setMascotMood(moods[(currentIndex + 1) % moods.length]);
  };

  const logoOpacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.8, 1, 0.8],
  });

  const logoScale = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.02, 1],
  });
  
  const floatTranslate = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });
  
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Enhanced Header with Mascot Welcome */}
        <View style={styles.header}>
          {/* Luna Mascot Section - Top with Premium Animations */}
          <View style={styles.mascotSection}>
            {/* Glow Effect Background */}
            <Animated.View 
              style={[
                styles.mascotGlow,
                { opacity: glowOpacity }
              ]}
            />
            
            {/* Floating Mascot with Touch */}
            <TouchableOpacity 
              activeOpacity={0.9} 
              onPress={handleMascotPress}
              style={styles.mascotTouchable}
            >
              <Animated.View 
                style={{
                  transform: [
                    { translateY: floatTranslate },
                    { scale: mascotScale }
                  ],
                }}
              >
                <MascotAvatar size={110} mood={mascotMood} />
              </Animated.View>
            </TouchableOpacity>
            
            {/* Animated Speech Bubble with Typing Effect */}
            <Animated.View style={[
              styles.speechBubble,
              { opacity: shimmerAnim.interpolate({
                inputRange: [0, 0.3, 1],
                outputRange: [0.9, 1, 0.9],
              })}
            ]}>
              <View style={styles.speechBubbleArrow} />
              <Text style={styles.speechBubbleText}>
                {displayedText}
                {!isTypingComplete && <Text style={styles.typingCursor}>|</Text>}
              </Text>
            </Animated.View>
          </View>
          
          {/* Logo Section - Below Mascot */}
          <View style={styles.logoSection}>
            <View style={styles.logoRow}>
              <Animated.View 
                style={{
                  alignItems: 'center',
                  opacity: logoOpacity,
                  transform: [{ scale: logoScale }],
                }}
              >
                <BrandLogo width={60} height={60} />
              </Animated.View>
              <Text style={[styles.logo, DreamyLogoStyle]}>
                꿈결
              </Text>
            </View>
            <Text style={[styles.subtitle, DreamySubtitleStyle]}>어젯밤의 꿈을 들려주세요</Text>
          </View>
        </View>

        {/* Social Login Mode (Default) */}
        {!showEmailForm && (
          <View style={styles.socialModeContainer}>
            <View style={styles.socialLoginContainer}>
              <Text style={styles.socialUiLabel}>간편하게 시작하기</Text>
              <View style={styles.socialButtons}>
                <TouchableOpacity
                  style={[styles.socialButton, styles.kakaoButton]}
                  activeOpacity={0.7} 
                  onPress={() => {
                    hapticService.trigger('light');
                    soundService.play('click');
                    handleSocialLogin('kakao');
                  }}
                >
                  <KakaoIcon size={20} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.socialButton, styles.naverButton]}
                  activeOpacity={0.7} 
                  onPress={() => {
                    hapticService.trigger('light');
                    soundService.play('click');
                    handleSocialLogin('naver');
                  }}
                >
                  <NaverIcon size={20} />
                </TouchableOpacity>

                <TouchableOpacity 
                   style={[styles.socialButton, styles.googleButton]}
                   activeOpacity={0.7} 
                   onPress={() => {
                     hapticService.trigger('light');
                     soundService.play('click');
                     handleSocialLogin('google');
                   }}
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
            <GlassButton
              title="로그인"
              onPress={handleLogin}
              loading={isLoading}
              style={styles.loginButtonOverride}
            />
            
            <GlassButton
              title="회원가입"
              type="secondary"
              onPress={() => (navigate as any).navigate('Register')}
              style={styles.registerButtonOverride}
            />
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
    marginBottom: 16,
  },
  mascotSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  mascotGlow: {
    position: 'absolute',
    left: 10,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#A78BFA',
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  mascotTouchable: {
    zIndex: 2,
  },
  typingCursor: {
    color: '#A78BFA',
    fontWeight: 'bold',
  },
  loginButtonOverride: {
    marginBottom: 12,
  },
  registerButtonOverride: {
    marginTop: 0,
  },
  speechBubble: {
    backgroundColor: 'rgba(74, 64, 99, 0.9)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginLeft: 12,
    maxWidth: 200,
    borderWidth: 1,
    borderColor: 'rgba(255, 221, 168, 0.2)',
    position: 'relative',
  },
  speechBubbleArrow: {
    position: 'absolute',
    left: -8,
    top: 20,
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderRightWidth: 10,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: 'rgba(74, 64, 99, 0.9)',
  },
  speechBubbleText: {
    ...SmallFontStyle,
    color: '#EAE8F0',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'left',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 8,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  logo: {
    ...DreamyLogoStyle,
    color: '#FFDDA8', // Starlight Gold
    fontSize: 32,
    marginBottom: 0,
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