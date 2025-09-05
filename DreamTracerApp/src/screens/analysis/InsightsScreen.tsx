/**
 * 인사이트 화면
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAnalysisStore } from '../../stores/analysisStore';
import { EMOTION_LABELS, DREAM_TYPE_LABELS } from '../../types/dream';

const InsightsScreen: React.FC = () => {
  const {
    dailyInsights,
    dreamPatterns,
    dreamNetwork,
    isLoading,
    error,
    getDailyInsights,
    getDreamPatterns,
    getDreamNetwork,
    clearError,
  } = useAnalysisStore();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'insights' | 'patterns' | 'network'>('insights');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        getDailyInsights(),
        getDreamPatterns(30),
        getDreamNetwork(),
      ]);
    } catch (error) {
      console.error('Initial data load failed:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadInitialData();
    } finally {
      setRefreshing(false);
    }
  };

  const renderInsightsTab = () => {
    if (isLoading && !dailyInsights) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e94560" />
          <Text style={styles.loadingText}>인사이트를 생성하고 있습니다...</Text>
        </View>
      );
    }

    if (!dailyInsights) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataTitle}>인사이트가 없습니다</Text>
          <Text style={styles.noDataText}>
            더 많은 꿈을 기록하면 개인화된 인사이트를 받을 수 있습니다.
          </Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>💡 오늘의 인사이트</Text>
          <Text style={styles.insightText}>{dailyInsights.insight}</Text>
        </View>

        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>🔍 발견된 패턴</Text>
          <Text style={styles.insightText}>{dailyInsights.pattern}</Text>
        </View>

        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>💭 추천사항</Text>
          <Text style={styles.insightText}>{dailyInsights.recommendation}</Text>
        </View>
      </ScrollView>
    );
  };

  const renderPatternsTab = () => {
    if (isLoading && !dreamPatterns) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e94560" />
          <Text style={styles.loadingText}>패턴을 분석하고 있습니다...</Text>
        </View>
      );
    }

    if (!dreamPatterns) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataTitle}>패턴 데이터가 없습니다</Text>
          <Text style={styles.noDataText}>
            더 많은 꿈을 기록하면 패턴 분석을 받을 수 있습니다.
          </Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.patternCard}>
          <Text style={styles.patternTitle}>📊 분석 기간</Text>
          <Text style={styles.patternValue}>
            {dreamPatterns.analysis_period} ({dreamPatterns.total_dreams}개 꿈)
          </Text>
        </View>

        {/* 감정 패턴 */}
        {dreamPatterns.patterns.emotions.length > 0 && (
          <View style={styles.patternCard}>
            <Text style={styles.patternTitle}>😊 주요 감정</Text>
            {dreamPatterns.patterns.emotions.map((emotion, index) => (
              <View key={index} style={styles.patternItem}>
                <Text style={styles.patternLabel}>
                  {EMOTION_LABELS[emotion.emotion as keyof typeof EMOTION_LABELS] || emotion.emotion}
                </Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${(emotion.count / dreamPatterns.patterns.emotions[0].count) * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.patternCount}>{emotion.count}회</Text>
              </View>
            ))}
          </View>
        )}

        {/* 상징 패턴 */}
        {dreamPatterns.patterns.symbols.length > 0 && (
          <View style={styles.patternCard}>
            <Text style={styles.patternTitle}>🔮 주요 상징</Text>
            {dreamPatterns.patterns.symbols.map((symbol, index) => (
              <View key={index} style={styles.patternItem}>
                <Text style={styles.patternLabel}>{symbol.symbol}</Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${(symbol.count / dreamPatterns.patterns.symbols[0].count) * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.patternCount}>{symbol.count}회</Text>
              </View>
            ))}
          </View>
        )}

        {/* 꿈 타입 패턴 */}
        {dreamPatterns.patterns.dream_types.length > 0 && (
          <View style={styles.patternCard}>
            <Text style={styles.patternTitle}>🌙 꿈 타입</Text>
            {dreamPatterns.patterns.dream_types.map((type, index) => (
              <View key={index} style={styles.patternItem}>
                <Text style={styles.patternLabel}>
                  {DREAM_TYPE_LABELS[type.type] || type.type}
                </Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${(type.count / dreamPatterns.patterns.dream_types[0].count) * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.patternCount}>{type.count}회</Text>
              </View>
            ))}
          </View>
        )}

        {/* 평균 명료도 */}
        <View style={styles.patternCard}>
          <Text style={styles.patternTitle}>✨ 평균 명료도</Text>
          <Text style={styles.patternValue}>
            {dreamPatterns.patterns.average_lucidity.toFixed(1)} / 5.0
          </Text>
        </View>
      </ScrollView>
    );
  };

  const renderNetworkTab = () => {
    if (isLoading && !dreamNetwork) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e94560" />
          <Text style={styles.loadingText}>네트워크를 분석하고 있습니다...</Text>
        </View>
      );
    }

    if (!dreamNetwork || dreamNetwork.network.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataTitle}>네트워크 데이터가 없습니다</Text>
          <Text style={styles.noDataText}>
            최소 2개의 꿈이 있어야 네트워크 분석이 가능합니다.
          </Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.networkCard}>
          <Text style={styles.networkTitle}>🕸️ 꿈 네트워크</Text>
          <Text style={styles.networkDescription}>
            유사한 꿈들 간의 연결을 보여줍니다. ({dreamNetwork.total_connections}개 연결)
          </Text>
        </View>

        {dreamNetwork.network.map((connection, index) => (
          <View key={index} style={styles.connectionCard}>
            <View style={styles.connectionHeader}>
              <Text style={styles.connectionSimilarity}>
                유사도: {(connection.similarity * 100).toFixed(1)}%
              </Text>
            </View>
            
            <View style={styles.connectionDreams}>
              <View style={styles.connectionDream}>
                <Text style={styles.connectionDreamTitle}>
                  {connection.dream1.title || '제목 없음'}
                </Text>
                <Text style={styles.connectionDreamDate}>
                  {new Date(connection.dream1.date).toLocaleDateString()}
                </Text>
              </View>
              
              <Text style={styles.connectionArrow}>↔</Text>
              
              <View style={styles.connectionDream}>
                <Text style={styles.connectionDreamTitle}>
                  {connection.dream2.title || '제목 없음'}
                </Text>
                <Text style={styles.connectionDreamDate}>
                  {new Date(connection.dream2.date).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'insights':
        return renderInsightsTab();
      case 'patterns':
        return renderPatternsTab();
      case 'network':
        return renderNetworkTab();
      default:
        return renderInsightsTab();
    }
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>인사이트</Text>
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={onRefresh}
          disabled={refreshing}
        >
          <Text style={styles.refreshButtonText}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* 탭 네비게이션 */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'insights' && styles.activeTabButton]}
          onPress={() => setActiveTab('insights')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'insights' && styles.activeTabButtonText]}>
            💡 인사이트
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'patterns' && styles.activeTabButton]}
          onPress={() => setActiveTab('patterns')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'patterns' && styles.activeTabButtonText]}>
            📊 패턴
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'network' && styles.activeTabButton]}
          onPress={() => setActiveTab('network')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'network' && styles.activeTabButtonText]}>
            🕸️ 네트워크
          </Text>
        </TouchableOpacity>
      </View>

      {/* 탭 내용 */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderTabContent()}
      </ScrollView>

      {/* 에러 메시지 */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={clearError}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d44',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 8,
  },
  refreshButtonText: {
    color: '#e94560',
    fontSize: 20,
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#2d2d44',
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: '#e94560',
  },
  tabButtonText: {
    color: '#888888',
    fontSize: 14,
    fontWeight: 'bold',
  },
  activeTabButtonText: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noDataTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  noDataText: {
    color: '#888888',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  insightCard: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  insightTitle: {
    color: '#e94560',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  insightText: {
    color: '#cccccc',
    fontSize: 14,
    lineHeight: 20,
  },
  patternCard: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  patternTitle: {
    color: '#e94560',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  patternValue: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  patternItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  patternLabel: {
    color: '#ffffff',
    fontSize: 14,
    width: 80,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#3d3d5c',
    borderRadius: 4,
    marginHorizontal: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#e94560',
    borderRadius: 4,
  },
  patternCount: {
    color: '#888888',
    fontSize: 12,
    width: 40,
    textAlign: 'right',
  },
  networkCard: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  networkTitle: {
    color: '#e94560',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  networkDescription: {
    color: '#cccccc',
    fontSize: 14,
    lineHeight: 20,
  },
  connectionCard: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  connectionHeader: {
    marginBottom: 12,
  },
  connectionSimilarity: {
    color: '#4ecdc4',
    fontSize: 14,
    fontWeight: 'bold',
  },
  connectionDreams: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionDream: {
    flex: 1,
  },
  connectionDreamTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  connectionDreamDate: {
    color: '#888888',
    fontSize: 12,
  },
  connectionArrow: {
    color: '#e94560',
    fontSize: 20,
    marginHorizontal: 16,
  },
  errorContainer: {
    backgroundColor: '#ff6b6b',
    padding: 16,
    margin: 20,
    borderRadius: 12,
  },
  errorText: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: '#ff6b6b',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default InsightsScreen;
