/**
 * 홈 화면 - 꿈결 앱의 메인 대시보드
 * 디자인 가이드에 따른 "고요한 탐험" 컨셉 구현
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigationStore } from '../../stores/navigationStore';
import { useDreamStore } from '../../stores/dreamStore';
import { useAuthStore } from '../../stores/authStore';
import { Dream } from '../../types/dream';
import hapticService from '../../services/hapticService';
import DynamicBackground from '../../components/DynamicBackground';
import { 
  PersonalGreetingStyle, 
  SpecialMessageStyle, 
  EmotionalTitleStyle, 
  ButtonFontStyle, 
  StatisticsStyle,
  BodyFontStyle,
  SmallFontStyle
} from '../../styles/fonts';

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const { navigate } = useNavigationStore();
  const { dreams, recentDreams, getDreams } = useDreamStore();
  const { user, logout } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  const loadInitialData = useCallback(async () => {
    try {
      await getDreams();
    } catch (error) {
      console.error('Failed to load dreams:', error);
    }
  }, [getDreams]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadInitialData();
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      '탐험을 마치시겠어요?',
      '정말 로그아웃하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: () => {
            logout();
            navigate('Login');
          },
        },
      ]
    );
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return '좋은 아침이에요';
    } else if (hour < 18) {
      return '좋은 오후예요';
    } else {
      return '좋은 저녁이에요';
    }
  };

  const getPersonalizedMessage = () => {
    const hour = new Date().getHours();
    const userName = user?.email?.split('@')[0] || '사용자';
    
    if (hour < 12) {
      return `어젯밤의 꿈이 기억나시나요, ${userName}님?`;
    } else if (hour < 18) {
      return `오늘 하루는 어떠셨나요, ${userName}님?`;
    } else {
      return `잠들기 전, 마음을 차분히 정리해보세요, ${userName}님`;
    }
  };

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>빠른 작업</Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={[styles.quickActionButton, styles.primaryAction]}
          onPress={async () => {
            await hapticService.buttonPress();
            navigate('CreateDream');
          }}
        >
          <Text style={styles.quickActionIcon}>✨</Text>
          <Text style={styles.quickActionText}>꿈 기록</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigate('Insights')}
        >
          <Text style={styles.quickActionIcon}>📊</Text>
          <Text style={styles.quickActionText}>인사이트</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigate('VisualizationGallery')}
        >
          <Text style={styles.quickActionIcon}>🎨</Text>
          <Text style={styles.quickActionText}>시각화</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={handleLogout}
        >
          <Text style={styles.quickActionIcon}>🚪</Text>
          <Text style={styles.quickActionText}>로그아웃</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRecentDreams = () => (
    <View style={styles.recentDreamsContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>최근 꿈</Text>
        <TouchableOpacity onPress={() => navigate('CreateDream')}>
          <Text style={styles.seeAllText}>모두 보기</Text>
        </TouchableOpacity>
      </View>
      
      {recentDreams.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>🌙</Text>
          <Text style={styles.emptyStateText}>아직 기록된 꿈이 없습니다</Text>
          <Text style={styles.emptyStateSubtext}>첫 번째 꿈을 기록해보세요!</Text>
          <TouchableOpacity
            style={styles.createFirstDreamButton}
            onPress={() => navigate('CreateDream')}
          >
            <Text style={styles.createFirstDreamButtonText}>꿈 기록하기</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {recentDreams.slice(0, 5).map((dream: Dream) => (
            <TouchableOpacity
              key={dream.id}
              style={styles.dreamCard}
              onPress={() => navigate('DreamAnalysis', { dreamId: dream.id })}
            >
              <Text style={styles.dreamTitle} numberOfLines={2}>
                {dream.title || '제목 없음'}
              </Text>
              <Text style={styles.dreamDate}>
                {new Date(dream.created_at).toLocaleDateString('ko-KR')}
              </Text>
              <Text style={styles.dreamPreview} numberOfLines={3}>
                {dream.body_text || '내용 없음'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <Text style={styles.sectionTitle}>통계</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{dreams.length}</Text>
          <Text style={styles.statLabel}>총 꿈</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{recentDreams.length}</Text>
          <Text style={styles.statLabel}>이번 주</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {dreams.filter(d => (d.lucidity_level || 0) >= 4).length}
          </Text>
          <Text style={styles.statLabel}>자각몽</Text>
        </View>
      </View>
    </View>
  );

  return (
    <DynamicBackground>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
      {/* 헤더 */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.subGreeting}>{getPersonalizedMessage()}</Text>
        </View>
      </View>

      {/* 빠른 작업 */}
      {renderQuickActions()}

      {/* 통계 */}
      {renderStats()}

      {/* 최근 꿈 */}
      {renderRecentDreams()}

      {/* 하단 여백 */}
      <View style={styles.bottomSpacer} />
      </ScrollView>
    </DynamicBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // 동적 배경 사용
  },
  header: {
    padding: 24,
    backgroundColor: 'transparent',
  },
  greeting: {
    ...PersonalGreetingStyle,
    color: '#FFDDA8', // Starlight Gold
    marginBottom: 8,
  },
  subGreeting: {
    ...SpecialMessageStyle,
    color: '#8F8C9B', // Warm Grey 400
    lineHeight: 22,
  },
  quickActionsContainer: {
    padding: 24,
    backgroundColor: '#4A4063', // Dawn Purple
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
  },
  sectionTitle: {
    ...EmotionalTitleStyle,
    color: '#FFDDA8',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: (width - 80) / 2,
    backgroundColor: '#2d2d44',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3d3d5c',
  },
  primaryAction: {
    backgroundColor: '#FFDDA8',
    borderColor: '#FFDDA8',
  },
  quickActionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  quickActionText: {
    ...ButtonFontStyle,
    fontSize: 14,
    color: '#EAE8F0',
  },
  statsContainer: {
    padding: 24,
    backgroundColor: '#4A4063',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...StatisticsStyle,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFDDA8',
  },
  statLabel: {
    ...StatisticsStyle,
    color: '#8F8C9B',
    marginTop: 4,
  },
  recentDreamsContainer: {
    padding: 24,
    backgroundColor: '#4A4063',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    ...SmallFontStyle,
    color: '#FFDDA8',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateText: {
    ...BodyFontStyle,
    fontSize: 18,
    fontWeight: '500',
    color: '#EAE8F0',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    ...SmallFontStyle,
    color: '#8F8C9B',
    marginBottom: 24,
  },
  createFirstDreamButton: {
    backgroundColor: '#FFDDA8',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
  },
  createFirstDreamButtonText: {
    ...ButtonFontStyle,
    color: '#191D2E',
  },
  dreamCard: {
    width: 200,
    backgroundColor: '#2d2d44',
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#3d3d5c',
  },
  dreamTitle: {
    ...BodyFontStyle,
    fontWeight: '600',
    color: '#EAE8F0',
    marginBottom: 8,
  },
  dreamDate: {
    ...SmallFontStyle,
    fontSize: 12,
    color: '#8F8C9B',
    marginBottom: 8,
  },
  dreamPreview: {
    ...SmallFontStyle,
    color: '#8F8C9B',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default HomeScreen;
