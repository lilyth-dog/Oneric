/**
 * 꿈 분석 화면
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAnalysisStore } from '../../stores/analysisStore';
import { useDreamStore } from '../../stores/dreamStore';
import { EMOTION_LABELS, DREAM_TYPE_LABELS } from '../../types/dream';

interface RouteParams {
  dreamId: string;
}

const DreamAnalysisScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { dreamId } = route.params as RouteParams;
  
  const { 
    currentAnalysis, 
    isLoading, 
    isAnalyzing, 
    error,
    getDreamAnalysis,
    requestDreamAnalysis,
    pollAnalysisStatus,
    setCurrentAnalysis,
    clearError
  } = useAnalysisStore();
  
  const { dreams } = useDreamStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [analysisTaskId, setAnalysisTaskId] = useState<string | null>(null);

  // 현재 꿈 정보 찾기
  const currentDream = dreams.find(dream => dream.id === dreamId);

  useEffect(() => {
    loadAnalysis();
  }, [dreamId]);

  const loadAnalysis = async () => {
    try {
      await getDreamAnalysis(dreamId);
    } catch (error) {
      // 분석 결과가 없으면 분석 요청
      if (error instanceof Error && error.message.includes('404')) {
        // 분석 결과가 없는 경우
      } else {
        Alert.alert('오류', '분석 결과를 불러오는데 실패했습니다.');
      }
    }
  };

  const handleRequestAnalysis = async () => {
    try {
      const taskId = await requestDreamAnalysis(dreamId);
      setAnalysisTaskId(taskId);
      
      // 실시간 상태 폴링 시작
      pollAnalysisStatus(
        taskId,
        (result) => {
          // 분석 완료 시 결과 다시 로드
          loadAnalysis();
          setAnalysisTaskId(null);
          Alert.alert('완료', '꿈 분석이 완료되었습니다!');
        },
        (error) => {
          setAnalysisTaskId(null);
          Alert.alert('오류', `분석에 실패했습니다: ${error}`);
        }
      );
    } catch (error) {
      Alert.alert('오류', '분석 요청에 실패했습니다.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadAnalysis();
    } finally {
      setRefreshing(false);
    }
  };

  const renderAnalysisContent = () => {
    if (isAnalyzing || analysisTaskId) {
      return (
        <View style={styles.analyzingContainer}>
          <ActivityIndicator size="large" color="#e94560" />
          <Text style={styles.analyzingText}>꿈을 분석하고 있습니다...</Text>
          <Text style={styles.analyzingSubText}>잠시만 기다려주세요</Text>
        </View>
      );
    }

    if (!currentAnalysis) {
      return (
        <View style={styles.noAnalysisContainer}>
          <Text style={styles.noAnalysisTitle}>분석 결과가 없습니다</Text>
          <Text style={styles.noAnalysisText}>
            이 꿈에 대한 AI 분석을 요청해보세요.
          </Text>
          <TouchableOpacity 
            style={styles.analyzeButton} 
            onPress={handleRequestAnalysis}
            disabled={isAnalyzing}
          >
            <Text style={styles.analyzeButtonText}>AI 분석 요청</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView style={styles.analysisContent}>
        {/* 요약 */}
        {currentAnalysis.summary_text && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 꿈 요약</Text>
            <Text style={styles.sectionContent}>{currentAnalysis.summary_text}</Text>
          </View>
        )}

        {/* 키워드 */}
        {currentAnalysis.keywords && currentAnalysis.keywords.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔑 주요 키워드</Text>
            <View style={styles.keywordContainer}>
              {currentAnalysis.keywords.map((keyword, index) => (
                <View key={index} style={styles.keywordTag}>
                  <Text style={styles.keywordText}>{keyword}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 감정 흐름 */}
        {currentAnalysis.emotional_flow_text && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💭 감정 흐름</Text>
            <Text style={styles.sectionContent}>{currentAnalysis.emotional_flow_text}</Text>
          </View>
        )}

        {/* 상징 분석 */}
        {currentAnalysis.symbol_analysis && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔮 상징 분석</Text>
            {currentAnalysis.symbol_analysis.symbols && 
             currentAnalysis.symbol_analysis.symbols.length > 0 ? (
              currentAnalysis.symbol_analysis.symbols.map((symbol: any, index: number) => (
                <View key={index} style={styles.symbolItem}>
                  <Text style={styles.symbolName}>{symbol.symbol}</Text>
                  <Text style={styles.symbolInterpretation}>{symbol.interpretation}</Text>
                  {symbol.significance && (
                    <Text style={styles.symbolSignificance}>
                      의미: {symbol.significance}
                    </Text>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>상징 분석 데이터가 없습니다.</Text>
            )}
          </View>
        )}

        {/* 데자뷰 분석 */}
        {currentAnalysis.deja_vu_analysis && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🌀 데자뷰 분석</Text>
            {currentAnalysis.deja_vu_analysis.related_dreams && 
             currentAnalysis.deja_vu_analysis.related_dreams.length > 0 ? (
              <>
                <Text style={styles.dejaVuDescription}>
                  이 꿈과 유사한 과거 꿈들을 찾았습니다:
                </Text>
                {currentAnalysis.deja_vu_analysis.related_dreams.map((related: any, index: number) => (
                  <View key={index} style={styles.relatedDreamItem}>
                    <Text style={styles.relatedDreamTitle}>
                      {related.title || '제목 없음'}
                    </Text>
                    <Text style={styles.relatedDreamDate}>
                      {new Date(related.dream_date).toLocaleDateString()}
                    </Text>
                    <Text style={styles.relatedDreamSimilarity}>
                      유사도: {(related.similarity_score * 100).toFixed(1)}%
                    </Text>
                  </View>
                ))}
              </>
            ) : (
              <Text style={styles.noDataText}>유사한 꿈을 찾지 못했습니다.</Text>
            )}
          </View>
        )}

        {/* 반성적 질문 */}
        {currentAnalysis.reflective_question && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🤔 성찰 질문</Text>
            <View style={styles.questionContainer}>
              <Text style={styles.questionText}>{currentAnalysis.reflective_question}</Text>
            </View>
          </View>
        )}

        {/* 분석 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ 분석 정보</Text>
          <Text style={styles.analysisInfo}>
            분석 완료: {new Date(currentAnalysis.created_at).toLocaleString()}
          </Text>
        </View>
      </ScrollView>
    );
  };

  if (isLoading && !currentAnalysis) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e94560" />
        <Text style={styles.loadingText}>분석 결과를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>꿈 분석</Text>
        <View style={styles.placeholder} />
      </View>

      {/* 꿈 정보 */}
      {currentDream && (
        <View style={styles.dreamInfo}>
          <Text style={styles.dreamTitle}>
            {currentDream.title || '제목 없음'}
          </Text>
          <Text style={styles.dreamDate}>
            {new Date(currentDream.dream_date).toLocaleDateString()}
          </Text>
          {currentDream.emotion_tags && currentDream.emotion_tags.length > 0 && (
            <View style={styles.emotionTags}>
              {currentDream.emotion_tags.map((emotion, index) => (
                <View key={index} style={styles.emotionTag}>
                  <Text style={styles.emotionTagText}>
                    {EMOTION_LABELS[emotion as keyof typeof EMOTION_LABELS] || emotion}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* 분석 내용 */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderAnalysisContent()}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 16,
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
    color: '#e94560',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  dreamInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d44',
  },
  dreamTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dreamDate: {
    color: '#888888',
    fontSize: 14,
    marginBottom: 12,
  },
  emotionTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emotionTag: {
    backgroundColor: '#e94560',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  emotionTagText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  analyzingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  analyzingText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  analyzingSubText: {
    color: '#888888',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  noAnalysisContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noAnalysisTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  noAnalysisText: {
    color: '#888888',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  analyzeButton: {
    backgroundColor: '#e94560',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  analyzeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  analysisContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sectionContent: {
    color: '#cccccc',
    fontSize: 16,
    lineHeight: 24,
  },
  keywordContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  keywordTag: {
    backgroundColor: '#2d2d44',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#3d3d5c',
  },
  keywordText: {
    color: '#ffffff',
    fontSize: 14,
  },
  symbolItem: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  symbolName: {
    color: '#e94560',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  symbolInterpretation: {
    color: '#cccccc',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  symbolSignificance: {
    color: '#888888',
    fontSize: 12,
    fontStyle: 'italic',
  },
  dejaVuDescription: {
    color: '#cccccc',
    fontSize: 14,
    marginBottom: 12,
  },
  relatedDreamItem: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  relatedDreamTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  relatedDreamDate: {
    color: '#888888',
    fontSize: 12,
    marginBottom: 4,
  },
  relatedDreamSimilarity: {
    color: '#4ecdc4',
    fontSize: 12,
    fontWeight: 'bold',
  },
  questionContainer: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#e94560',
  },
  questionText: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  analysisInfo: {
    color: '#888888',
    fontSize: 12,
  },
  noDataText: {
    color: '#888888',
    fontSize: 14,
    fontStyle: 'italic',
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

export default DreamAnalysisScreen;
