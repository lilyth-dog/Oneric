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
  EmotionalTitleStyle, 
  BodyFontStyle,
  SmallFontStyle
} from '../../styles/fonts';
import { EmotionHeatmap, WeeklyDreamChart } from '../../components/charts';
import GlassView from '../../components/common/GlassView';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import { MascotHeader } from '../../components/home/MascotHeader';
import { QuickActions } from '../../components/home/QuickActions';
import { StatsOverview } from '../../components/home/StatsOverview';
import { hapticService } from '../../services/hapticService';
import { soundService } from '../../services/soundService';
import { getWeeklyChartData, getEmotionData } from '../../utils/dreamDataUtils';
import Colors from '../../styles/colors';

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const { navigate } = useNavigationStore();
  const { dreams, recentDreams, getDreams, isLoading } = useDreamStore();
  const { user, logout } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  
  // Mascot State
  const [mascotMessage, setMascotMessage] = useState('오늘 밤에도 아름다운 꿈을 꿀 거예요! ✨');
  const [mascotMood, setMascotMood] = useState<'happy' | 'calm' | 'concerned'>('calm');

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
            hapticService.trigger('light');
            logout();
            navigate('Login');
          },
        },
      ]
    );
  };

  const handleMascotPress = () => {
    hapticService.trigger('success');
    soundService.play('success');
    const funMessages = [
      '오늘은 어떤 꿈을 꾸셨나요? 🌟',
      '루나가 응원하고 있어요! 💫',
      '꿈 기록, 잊지 않으셨죠? ✨',
      '좋은 하루 보내세요! 🌈',
    ];
    setMascotMessage(funMessages[Math.floor(Math.random() * funMessages.length)]);
    setMascotMood('happy');
    setTimeout(() => setMascotMood('calm'), 3000);
  };

  const handleDayPress = (day: any) => {
    hapticService.trigger('light');
    if (day.count > 0) {
      setMascotMessage(`${day.day}요일엔 ${day.count}개의 꿈을 꾸셨네요.`);
      setMascotMood('happy');
    }
  };

  const handleEmotionPress = (emotion: any) => {
    hapticService.trigger('light');
    setMascotMessage(`최근 꿈에서 '${emotion.name}' 감정을 자주 느끼셨네요!`);
    setMascotMood('calm');
  };

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

  const renderLoadingState = () => (
    <View style={styles.container}>
      <View style={styles.headerDummy}>
        <SkeletonLoader width={width - 40} height={150} borderRadius={20} />
      </View>
      <View style={styles.contentDummy}>
        <SkeletonLoader width={width - 40} height={100} borderRadius={20} style={{ marginBottom: 16 }} />
        <SkeletonLoader width={width - 40} height={200} borderRadius={20} />
      </View>
    </View>
  );

  if (isLoading && !refreshing && dreams.length === 0) {
    return renderLoadingState();
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
      }
    >
      <MascotHeader 
        nickname={user?.email?.split('@')[0] || '꿈 여행자'}
        message={mascotMessage}
        mood={mascotMood}
        onMascotPress={handleMascotPress}
        onProfilePress={() => {
          hapticService.trigger('light');
          navigate('Profile');
        }}
      />

      <QuickActions onAction={(target) => navigate(target as any)} />

      <StatsOverview dreams={dreams} recentDreamsCount={recentDreams.length} />

      {/* 주간 꿈 차트 */}
      <GlassView style={styles.chartSection}>
        <WeeklyDreamChart 
          data={getWeeklyChartData(dreams)} 
          onDayPress={handleDayPress}
        />
      </GlassView>

      {/* 감정 히트맵 */}
      <GlassView style={styles.chartSection}>
        <EmotionHeatmap 
          emotions={getEmotionData(dreams)} 
          onEmotionPress={handleEmotionPress}
        />
      </GlassView>

      {/* 최근 꿈 */}
      {renderRecentDreams()}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  headerDummy: {
    padding: 20,
    marginTop: 20,
  },
  contentDummy: {
    paddingHorizontal: 20,
  },
  chartSection: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
  },
  recentDreamsContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    ...EmotionalTitleStyle,
    color: Colors.primary,
    fontSize: 18,
  },
  seeAllText: {
    ...SmallFontStyle,
    color: Colors.primary,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyStateText: {
    ...BodyFontStyle,
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
  emptyStateSubtext: {
    ...SmallFontStyle,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  createFirstDreamButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  createFirstDreamButtonText: {
    color: Colors.textInverse,
    fontWeight: 'bold',
  },
  dreamCard: {
    width: 200,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dreamTitle: {
    ...BodyFontStyle,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
  dreamDate: {
    ...SmallFontStyle,
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  dreamPreview: {
    ...SmallFontStyle,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  bottomSpacer: {
    height: 80,
  },
});

export default HomeScreen;
