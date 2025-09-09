/**
 * 인사이트 화면
 * 디자인 가이드에 따른 "고요한 탐험" 컨셉 구현
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigationStore } from '../../stores/navigationStore';
import { useDreamStore } from '../../stores/dreamStore';

const InsightsScreen: React.FC = () => {
  const { goBack } = useNavigationStore();
  const { dreams, fetchDreamStats, isLoading } = useDreamStore();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    fetchDreamStats();
  }, [fetchDreamStats]);

  const renderStats = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFDDA8" />
          <Text style={styles.loadingText}>통계를 불러오고 있습니다...</Text>
        </View>
      );
    }

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{dreams.length}</Text>
          <Text style={styles.statLabel}>총 꿈 기록</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {dreams.filter(d => (d.lucidity_level || 0) >= 4).length}
          </Text>
          <Text style={styles.statLabel}>자각몽</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {dreams.filter(d => {
              const oneWeekAgo = new Date();
              oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
              return new Date(d.created_at) >= oneWeekAgo;
            }).length}
          </Text>
          <Text style={styles.statLabel}>이번 주</Text>
        </View>
      </View>
    );
  };

  const renderEmotionAnalysis = () => {
    const emotionCounts: { [key: string]: number } = {};
    
    dreams.forEach(dream => {
      if (dream.emotion_tags) {
        dream.emotion_tags.forEach(emotion => {
          emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
        });
      }
    });

    const sortedEmotions = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>주요 감정</Text>
        <View style={styles.emotionContainer}>
          {sortedEmotions.length > 0 ? (
            sortedEmotions.map(([emotion, count], _index) => (
              <View key={emotion} style={styles.emotionItem}>
                <Text style={styles.emotionName}>{emotion}</Text>
                <View style={styles.emotionBar}>
                  <View 
                    style={[
                      styles.emotionBarFill, 
                      { width: `${(count / Math.max(...sortedEmotions.map(([,c]) => c))) * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.emotionCount}>{count}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>아직 충분한 데이터가 없습니다.</Text>
          )}
        </View>
      </View>
    );
  };

  const renderSymbolAnalysis = () => {
    const symbolCounts: { [key: string]: number } = {};
    
    dreams.forEach(dream => {
      if (dream.symbols) {
        dream.symbols.forEach(symbol => {
          symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
        });
      }
    });

    const sortedSymbols = Object.entries(symbolCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8);

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>자주 나타나는 상징</Text>
        <View style={styles.symbolContainer}>
          {sortedSymbols.length > 0 ? (
            sortedSymbols.map(([symbol, count]) => (
              <View key={symbol} style={styles.symbolTag}>
                <Text style={styles.symbolText}>{symbol}</Text>
                <Text style={styles.symbolCount}>{count}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>아직 충분한 데이터가 없습니다.</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backButtonText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>인사이트</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* 기간 선택 */}
        <View style={styles.periodSelector}>
          {(['week', 'month', 'year'] as const).map(period => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.periodButtonTextActive
              ]}>
                {period === 'week' ? '주간' : period === 'month' ? '월간' : '연간'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 통계 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>기본 통계</Text>
          {renderStats()}
        </View>

        {/* 감정 분석 */}
        {renderEmotionAnalysis()}

        {/* 상징 분석 */}
        {renderSymbolAnalysis()}

        {/* 하단 여백 */}
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#4A4063', // Dawn Purple
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#FFDDA8', // Starlight Gold
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#FFDDA8', // Starlight Gold
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: '#8F8C9B', // Warm Grey 400
    fontSize: 16,
    marginTop: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#4A4063', // Dawn Purple
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: '#FFDDA8', // Starlight Gold
  },
  periodButtonText: {
    color: '#8F8C9B', // Warm Grey 400
    fontSize: 14,
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: '#191D2E', // Night Sky Blue
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFDDA8', // Starlight Gold
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#4A4063', // Dawn Purple
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFDDA8', // Starlight Gold
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#8F8C9B', // Warm Grey 400
    textAlign: 'center',
  },
  emotionContainer: {
    backgroundColor: '#4A4063', // Dawn Purple
    borderRadius: 16,
    padding: 20,
  },
  emotionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emotionName: {
    color: '#EAE8F0', // Warm Grey 100
    fontSize: 14,
    width: 60,
  },
  emotionBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#595566', // Warm Grey 600
    borderRadius: 4,
    marginHorizontal: 12,
  },
  emotionBarFill: {
    height: '100%',
    backgroundColor: '#FFDDA8', // Starlight Gold
    borderRadius: 4,
  },
  emotionCount: {
    color: '#FFDDA8', // Starlight Gold
    fontSize: 14,
    fontWeight: 'bold',
    width: 30,
    textAlign: 'right',
  },
  symbolContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  symbolTag: {
    backgroundColor: '#FFDDA8', // Starlight Gold
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  symbolText: {
    color: '#191D2E', // Night Sky Blue
    fontSize: 14,
    fontWeight: '500',
    marginRight: 6,
  },
  symbolCount: {
    color: '#191D2E', // Night Sky Blue
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#8F8C9B', // Warm Grey 400
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  bottomSpacer: {
    height: 40,
  },
});

export default InsightsScreen;