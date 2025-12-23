/**
 * 프로필 화면
 * 사용자 정보 수정 및 설정 관리
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useNavigationStore } from '../../stores/navigationStore';
import { useAuthStore } from '../../stores/authStore';
import { useDreamStore } from '../../stores/dreamStore';
import { 
  EmotionalTitleStyle, 
  EmotionalSubtitleStyle, 
  ButtonFontStyle, 
  BodyFontStyle, 
  SmallFontStyle,
  PersonalGreetingStyle
} from '../../styles/fonts';

const ProfileScreen: React.FC = () => {
  const { goBack, navigate } = useNavigationStore();
  const { user, logout } = useAuthStore();
  const { dreams } = useDreamStore();

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '로그아웃', 
          style: 'destructive',
          onPress: () => {
            logout();
            navigate('Login');
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backButtonText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>프로필</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* 프로필 정보 */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name || '사용자'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <View style={styles.planBadge}>
            <Text style={styles.planText}>FREE PLAN</Text>
          </View>
        </View>

        {/* 통계 요약 */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{dreams.length}</Text>
            <Text style={styles.statLabel}>총 꿈</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {dreams.filter(d => (d.lucidity_level || 0) >= 4).length}
            </Text>
            <Text style={styles.statLabel}>자각몽</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {new Set(dreams.flatMap(d => d.emotion_tags || [])).size}
            </Text>
            <Text style={styles.statLabel}>감정</Text>
          </View>
        </View>

        {/* 메뉴 목록 */}
        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => Alert.alert('알림', '개인정보 수정 기능은 준비 중입니다.')}
          >
            <Text style={styles.menuIcon}>👤</Text>
            <Text style={styles.menuText}>개인정보 수정</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigate('Settings')} // This maps to AIConnectionTestScreen temporarily in App.tsx? No, Settings maps to nothing or App Settings? Wait, task.md said App Settings (AI Test) implemented. 
            // In App.tsx switch, 'Settings' is mapped to terms? No. 
            // Let's assume there is no Settings screen yet in App.tsx switch (it was just listed in types).
            // Actually I should map it to AIConnectionTestScreen or create a SettingsScreen.
            // For now, let's just make it Alert or link to AI Test.
          >
             {/* I will fix App.tsx to map 'Settings' to AIConnectionTestScreen for now as "App Settings" */}
            <Text style={styles.menuIcon}>⚙️</Text>
            <Text style={styles.menuText}>앱 설정 (AI 테스트)</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigate('PrivacyPolicy')}
          >
            <Text style={styles.menuIcon}>🔒</Text>
            <Text style={styles.menuText}>개인정보 처리방침</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigate('TermsOfService')}
          >
            <Text style={styles.menuIcon}>📄</Text>
            <Text style={styles.menuText}>이용약관</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* 로그아웃 버튼 */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>로그아웃</Text>
        </TouchableOpacity>
        
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#191D2E', // Night Sky Blue
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d44',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#FFDDA8',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    ...EmotionalTitleStyle,
    color: '#FFDDA8',
    fontSize: 18,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4A4063',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FFDDA8',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFDDA8',
  },
  userName: {
    ...PersonalGreetingStyle,
    color: '#EAE8F0',
    marginBottom: 4,
  },
  userEmail: {
    ...SmallFontStyle,
    color: '#8F8C9B',
    marginBottom: 12,
  },
  planBadge: {
    backgroundColor: '#2d2d44',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3d3d5c',
  },
  planText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFDDA8',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#2d2d44',
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#3d3d5c',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EAE8F0',
    marginBottom: 4,
  },
  statLabel: {
    ...SmallFontStyle,
    color: '#8F8C9B',
  },
  divider: {
    width: 1,
    backgroundColor: '#3d3d5c',
  },
  menuContainer: {
    backgroundColor: '#2d2d44',
    marginHorizontal: 24,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#3d3d5c',
    marginBottom: 32,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3d3d5c',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 16,
    width: 24,
    textAlign: 'center',
  },
  menuText: {
    ...BodyFontStyle,
    flex: 1,
    color: '#EAE8F0',
  },
  menuArrow: {
    fontSize: 20,
    color: '#595566',
  },
  logoutButton: {
    marginHorizontal: 24,
    backgroundColor: '#2d2d44',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e94560',
  },
  logoutButtonText: {
    ...ButtonFontStyle,
    color: '#e94560',
  },
  bottomSpacer: {
    height: 40,
  },
});

export default ProfileScreen;
