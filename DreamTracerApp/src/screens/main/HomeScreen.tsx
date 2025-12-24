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
import { 
  PersonalGreetingStyle, 
  SpecialMessageStyle, 
  EmotionalTitleStyle, 
  ButtonFontStyle, 
  StatisticsStyle,
  BodyFontStyle,
  SmallFontStyle
} from '../../styles/fonts';
import { EmotionHeatmap, WeeklyDreamChart } from '../../components/charts';
import GlassView from '../../components/common/GlassView';
import MascotBubble from '../../components/mascot/MascotBubble';
import SkeletonLoader from '../../components/common/SkeletonLoader';

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const { navigate } = useNavigationStore();
  const { dreams, recentDreams, getDreams, isLoading } = useDreamStore();
  const { user, logout } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  
  // Mascot State
  const [mascotMessage, setMascotMessage] = useState('');
  const [mascotMood, setMascotMood] = useState<'happy' | 'calm' | 'concerned'>('calm');

  // Initial Greeting Effect
  useEffect(() => {
    const hour = new Date().getHours();
    const isMorning = hour < 12;
    setMascotMessage(isMorning 
      ? "좋은 아침이에요! 어젯밤 꿈은 기억나시나요? 🌤️" 
      : "오늘 하루도 고생하셨어요. 자기 전 꿈 기록, 잊지 마세요! 🌙");
    setMascotMood(isMorning ? 'happy' : 'calm');
  }, []);

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

  const renderQuickActions = () => (
    <GlassView style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>빠른 작업</Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={[styles.quickActionButton, styles.primaryAction]}
          onPress={() => navigate('CreateDream')}
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
          onPress={() => navigate('CommunityFeed')}
        >
          <Text style={styles.quickActionIcon}>🌍</Text>
          <Text style={styles.quickActionText}>커뮤니티</Text>
        </TouchableOpacity>
      </View>
    </GlassView>
  );

  const renderLoadingState = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <SkeletonLoader width={100} height={20} style={{ marginBottom: 8 }} />
          <SkeletonLoader width={180} height={32} />
        </View>
        <SkeletonLoader width={40} height={40} borderRadius={20} />
      </View>

      <View style={styles.content}>
        {/* Quick Actions Skeleton */}
        <View style={styles.quickActionsContainer}>
          <SkeletonLoader width={80} height={20} style={{ marginBottom: 16 }} />
          <View style={styles.quickActionsGrid}>
            {[1, 2, 3, 4].map(i => (
              <SkeletonLoader key={i} width={(width - 48 - 36) / 4} height={80} borderRadius={16} />
            ))}
          </View>
        </View>

        {/* Stats Skeleton */}
        <GlassView style={styles.statsContainer}>
          <SkeletonLoader width={60} height={20} style={{ marginBottom: 16 }} />
          <View style={styles.statsGrid}>
            {[1, 2, 3].map(i => (
              <View key={i} style={styles.statItem}>
                <SkeletonLoader width={30} height={24} style={{ marginBottom: 4 }} />
                <SkeletonLoader width={40} height={14} />
              </View>
            ))}
          </View>
        </GlassView>

        {/* Chart Skeleton */}
        <GlassView style={styles.chartSection}>
          <SkeletonLoader width={120} height={24} style={{ marginBottom: 16 }} />
          <SkeletonLoader width="100%" height={140} />
        </GlassView>
      </View>
    </View>
  );

  if (isLoading && !refreshing && dreams.length === 0) {
    return renderLoadingState();
  }

  const renderRecentDreams = () => (
    <GlassView style={styles.recentDreamsContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>최근 꿈</Text>
        <TouchableOpacity onPress={() => navigate('DreamHistory')}>
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
    </GlassView>
  );

  const renderStats = () => (
    <GlassView style={styles.statsContainer}>
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
    </GlassView>
  );

  // 주간 차트 데이터 계산
  const getWeeklyChartData = () => {
    const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
    const today = new Date();
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayDreams = dreams.filter(d => {
        const dreamDate = new Date(d.created_at).toISOString().split('T')[0];
        return dreamDate === dateStr;
      });
      
      data.push({
        day: DAYS[date.getDay()],
        count: dayDreams.length,
        lucid: dayDreams.some(d => (d.lucidity_level || 0) >= 4),
      });
    }
    
    return data;
  };

  // 감정 히트맵 데이터 계산
  const getEmotionData = () => {
    const emotionMap: { [key: string]: { icon: string; count: number; color: string } } = {
      '평온': { icon: '😌', count: 0, color: '#4ECDC4' },
      '불안': { icon: '😰', count: 0, color: '#FF6B6B' },
      '행복': { icon: '😊', count: 0, color: '#FFD93D' },
      '영감': { icon: '✨', count: 0, color: '#A78BFA' },
      '슬픔': { icon: '😢', count: 0, color: '#60A5FA' },
      '흥분': { icon: '🤩', count: 0, color: '#F472B6' },
    };
    
    // 실제 구현에서는 dreams의 emotion 필드를 분석
    // 임시로 랜덤 데이터 생성 (실제 데이터 연동 시 수정)
    dreams.forEach(dream => {
      const emotions = Object.keys(emotionMap);
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      if (emotionMap[randomEmotion]) {
        emotionMap[randomEmotion].count++;
      }
    });
    
    const total = dreams.length || 1;
    return Object.entries(emotionMap).map(([emotion, data]) => ({
      emotion,
      icon: data.icon,
      percentage: Math.round((data.count / total) * 100),
      color: data.color,
    }));

  };

  // Interaction Handlers
  const handleDayPress = (day: any) => {
    if (day.count > 0) {
      setMascotMessage(`${day.day}요일엔 ${day.count}개의 꿈을 꾸셨네요.${day.lucid ? ' 자각몽도 있었어요! ✨' : ''}`);
      setMascotMood(day.lucid ? 'happy' : 'calm');
    } else {
      setMascotMessage(`${day.day}요일은 기록된 꿈이 없네요. 푹 주무셨나요? 😴`);
      setMascotMood('calm');
    }
  };

  const handleEmotionPress = (emotion: any) => {
    setMascotMessage(`최근 꿈에서 '${emotion.emotion}' 감정을 ${emotion.percentage}%만큼 느끼셨군요.`);
    setMascotMood(emotion.percentage > 30 ? 'concerned' : 'calm');
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* 헤더 */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}, {user?.email?.split('@')[0] || '사용자'}님</Text>
          <MascotBubble 
            text={mascotMessage} 
            mood={mascotMood}
          />
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigate('Profile')}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 빠른 작업 */}
      {renderQuickActions()}

      {/* 통계 */}
      {renderStats()}

      {/* 주간 꿈 차트 */}
      <GlassView style={styles.chartSection}>
        <WeeklyDreamChart 
          data={getWeeklyChartData()} 
          onDayPress={handleDayPress}
        />
      </GlassView>

      {/* 감정 히트맵 */}
      <GlassView style={styles.chartSection}>
        <EmotionHeatmap 
          emotions={getEmotionData()} 
          onEmotionPress={handleEmotionPress}
        />
      </GlassView>

      {/* 최근 꿈 */}
      {renderRecentDreams()}

      {/* 하단 여백 */}
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#191D2E', // Night Sky Blue
  },
  header: {
    padding: 24,
    backgroundColor: '#191D2E',
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
    // GlassView handles background/padding
    marginHorizontal: 16,
    marginTop: 16,
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
    // GlassView handles background/padding
    marginHorizontal: 16,
    marginTop: 16,
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
    // GlassView handles background/padding
    marginHorizontal: 16,
    marginTop: 16,
  },
  content: {
    paddingBottom: 40,
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2d2d44',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3d3d5c',
  },
  profileIcon: {
    fontSize: 20,
  },
  chartSection: {
    marginHorizontal: 16,
  },
});

export default HomeScreen;
