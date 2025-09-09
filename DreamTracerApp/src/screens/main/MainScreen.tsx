/**
 * 메인 화면 - 꿈결 앱의 홈 화면
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDreamStore } from '../../stores/dreamStore';
import { useAuthStore } from '../../stores/authStore';
import { Dream } from '../../types/dream';

const MainScreen: React.FC = () => {
  const navigation = useNavigation();
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
      '로그아웃',
      '정말 로그아웃하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: () => {
            logout();
            (navigation as any).navigate('Login');
          },
        },
      ]
    );
  };

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>빠른 작업</Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => (navigation as any).navigate('CreateDream')}
        >
          <Text style={styles.quickActionIcon}>✨</Text>
          <Text style={styles.quickActionText}>꿈 기록</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => (navigation as any).navigate('Insights')}
        >
          <Text style={styles.quickActionIcon}>📊</Text>
          <Text style={styles.quickActionText}>인사이트</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => (navigation as any).navigate('VisualizationGallery')}
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
        <TouchableOpacity onPress={() => (navigation as any).navigate('CreateDream')}>
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
            onPress={() => (navigation as any).navigate('CreateDream')}
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
              onPress={() => (navigation as any).navigate('DreamAnalysis', { dreamId: dream.id })}
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
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* 헤더 */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>안녕하세요! 👋</Text>
          <Text style={styles.userName}>{user?.email || '사용자'}님</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => Alert.alert('프로필', '프로필 기능은 준비 중입니다.')}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
    color: '#495057',
  },
  userName: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 20,
  },
  quickActionsContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 15,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
  },
  statsContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginTop: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
  },
  recentDreamsContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAllText: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#495057',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 20,
  },
  createFirstDreamButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstDreamButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  dreamCard: {
    width: 200,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  dreamTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  dreamDate: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 8,
  },
  dreamPreview: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 20,
  },
});

export default MainScreen;
