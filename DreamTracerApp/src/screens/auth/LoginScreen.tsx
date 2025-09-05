/**
 * 로그인 화면
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
import { useAuthStore } from '../../stores/authStore';
import { useNavigation } from '@react-navigation/native';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuthStore();
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('오류', '이메일과 비밀번호를 입력해주세요.');
      return;
    }

    try {
      await login(email, password);
      // 로그인 성공 시 메인 화면으로 이동
      navigation.navigate('Main' as never);
    } catch (error) {
      Alert.alert('로그인 실패', error instanceof Error ? error.message : '로그인에 실패했습니다.');
    }
  };

  const handleGoogleLogin = () => {
    // TODO: Google 로그인 구현
    Alert.alert('알림', 'Google 로그인은 준비 중입니다.');
  };

  const handleAppleLogin = () => {
    // TODO: Apple 로그인 구현
    Alert.alert('알림', 'Apple 로그인은 준비 중입니다.');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>꿈결</Text>
          <Text style={styles.subtitle}>꿈을 기록하고 분석하세요</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>이메일</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="이메일을 입력하세요"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>비밀번호</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="비밀번호를 입력하세요"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? '로그인 중...' : '로그인'}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>또는</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin}>
            <Text style={styles.socialButtonText}>Google로 계속하기</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton} onPress={handleAppleLogin}>
            <Text style={styles.socialButtonText}>Apple로 계속하기</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>계정이 없으신가요?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register' as never)}>
            <Text style={styles.linkText}>회원가입</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#e94560',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#a8a8a8',
  },
  form: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#3d3d5c',
  },
  loginButton: {
    backgroundColor: '#e94560',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#6b6b6b',
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#3d3d5c',
  },
  dividerText: {
    color: '#a8a8a8',
    marginHorizontal: 16,
  },
  socialButton: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3d3d5c',
  },
  socialButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#a8a8a8',
    marginRight: 8,
  },
  linkText: {
    color: '#e94560',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
