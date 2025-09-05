import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import dreamService from '../../services/dreamService';

interface ModernAnalysisResult {
  analyses: {
    cognitive: {
      cognitive_functions: string[];
      processing_type: string;
      insights: string[];
      confidence: number;
    };
    emotional: {
      primary_emotions: string[];
      primary_emotion: string;
      emotional_tone: string;
      insights: string[];
      confidence: number;
    };
    pattern: {
      recurring_elements: any;
      change_patterns: any;
      insights: string[];
      confidence: number;
    };
    symbolic: {
      symbols_found: string[];
      symbol_interpretations: any;
      korean_symbols: any;
      insights: string[];
      confidence: number;
    };
  };
  confidence: {
    cognitive: number;
    emotional: number;
    pattern: number;
    symbolic: number;
  };
  comprehensive_insights: string[];
  recommendations: string[];
}

const ModernDreamAnalysisScreen: React.FC = () => {
  const route = useRoute();
  const { dreamId } = route.params as { dreamId: string };
  
  const [analysis, setAnalysis] = useState<ModernAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 애니메이션 값들
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  const loadModernAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await dreamService.getModernDreamAnalysis(dreamId);
      setAnalysis(result.modern_analysis);
    } catch (loadErr) {
      console.error('현대적 분석 로드 실패:', loadErr);
      setError('분석 결과를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [dreamId]);

  useEffect(() => {
    loadModernAnalysis();
  }, [loadModernAnalysis]);

  useEffect(() => {
    if (analysis) {
      // 분석 결과가 로드되면 애니메이션 시작
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [analysis, fadeAnim, slideAnim]);

  const requestNewAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await dreamService.requestModernDreamAnalysis(dreamId);
      setAnalysis(result.modern_analysis);
      Alert.alert('성공', '현대적 꿈 분석이 완료되었습니다!');
    } catch (requestErr) {
      console.error('현대적 분석 요청 실패:', requestErr);
      setError('분석 요청에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const renderAnalysisCard = (
    title: string,
    icon: string,
    analysisData: any,
    confidence: number
  ) => (
    <View style={styles.analysisCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardIcon}>{icon}</Text>
        <Text style={styles.cardTitle}>{title}</Text>
        <View style={styles.confidenceBadge}>
          <Text style={styles.confidenceText}>
            {Math.round(confidence * 100)}%
          </Text>
        </View>
      </View>
      
      {analysisData?.insights?.map((insight: string, index: number) => (
        <Text key={index} style={styles.insightText}>
          • {insight}
        </Text>
      ))}
      
      {analysisData?.cognitive_functions && (
        <View style={styles.functionsContainer}>
          <Text style={styles.functionsLabel}>인지 기능:</Text>
          <View style={styles.functionsList}>
            {analysisData.cognitive_functions.map((func: string, index: number) => (
              <View key={index} style={styles.functionTag}>
                <Text style={styles.functionText}>{func}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      
      {analysisData?.primary_emotions && (
        <View style={styles.emotionsContainer}>
          <Text style={styles.emotionsLabel}>주요 감정:</Text>
          <View style={styles.emotionsList}>
            {analysisData.primary_emotions.map((emotion: string, index: number) => (
              <View key={index} style={styles.emotionTag}>
                <Text style={styles.emotionText}>{emotion}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      
      {analysisData?.symbols_found && analysisData.symbols_found.length > 0 && (
        <View style={styles.symbolsContainer}>
          <Text style={styles.symbolsLabel}>발견된 상징:</Text>
          <View style={styles.symbolsList}>
            {analysisData.symbols_found.map((symbol: string, index: number) => (
              <View key={index} style={styles.symbolTag}>
                <Text style={styles.symbolText}>{symbol}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>현대적 꿈 분석 중...</Text>
        <Text style={styles.loadingSubtext}>
          다학제적 관점에서 꿈을 분석하고 있습니다
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={requestNewAnalysis}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>현대 꿈 과학 기반 분석</Text>
        <Text style={styles.subtitle}>
          다학제적 관점에서 꿈을 분석합니다
        </Text>
      </View>

      {analysis && (
        <Animated.View 
          style={[
            styles.analysisContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* 종합 인사이트 */}
          {analysis.comprehensive_insights && analysis.comprehensive_insights.length > 0 && (
            <View style={styles.comprehensiveCard}>
              <Text style={styles.comprehensiveTitle}>💡 종합 인사이트</Text>
              {analysis.comprehensive_insights.map((insight, index) => (
                <Text key={index} style={styles.comprehensiveText}>
                  • {insight}
                </Text>
              ))}
            </View>
          )}

          {/* 인지적 분석 */}
          {renderAnalysisCard(
            '인지적 측면',
            '🧠',
            analysis.analyses.cognitive,
            analysis.confidence.cognitive
          )}

          {/* 감정적 분석 */}
          {renderAnalysisCard(
            '감정적 측면',
            '💭',
            analysis.analyses.emotional,
            analysis.confidence.emotional
          )}

          {/* 패턴 분석 */}
          {analysis.analyses.pattern && 
           renderAnalysisCard(
             '패턴 분석',
             '📊',
             analysis.analyses.pattern,
             analysis.confidence.pattern
           )}

          {/* 상징적 분석 */}
          {renderAnalysisCard(
            '상징적 측면',
            '🔮',
            analysis.analyses.symbolic,
            analysis.confidence.symbolic
          )}

          {/* 개인화된 추천 */}
          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <View style={styles.recommendationsCard}>
              <Text style={styles.recommendationsTitle}>💡 개인화된 제안</Text>
              {analysis.recommendations.map((recommendation, index) => (
                <Text key={index} style={styles.recommendationText}>
                  • {recommendation}
                </Text>
              ))}
            </View>
          )}

          {/* 분석 신뢰도 정보 */}
          <View style={styles.confidenceInfo}>
            <Text style={styles.confidenceInfoTitle}>분석 신뢰도</Text>
            <Text style={styles.confidenceInfoText}>
              각 분석의 신뢰도는 데이터 품질과 분석 일관성을 기반으로 계산됩니다.
            </Text>
            <Text style={styles.confidenceInfoNote}>
              ※ 꿈 해석은 주관적이며, 여러 관점에서 이해하는 것이 중요합니다.
            </Text>
          </View>
        </Animated.View>
      )}

      {/* 새 분석 요청 버튼 */}
      <TouchableOpacity style={styles.newAnalysisButton} onPress={requestNewAnalysis}>
        <Text style={styles.newAnalysisButtonText}>새로운 분석 요청</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  analysisContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  comprehensiveCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
  },
  comprehensiveTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  comprehensiveText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  analysisCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  confidenceBadge: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366f1',
  },
  insightText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  functionsContainer: {
    marginTop: 12,
  },
  functionsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  functionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  functionTag: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#0ea5e9',
  },
  functionText: {
    fontSize: 12,
    color: '#0369a1',
    fontWeight: '500',
  },
  emotionsContainer: {
    marginTop: 12,
  },
  emotionsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  emotionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emotionTag: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  emotionText: {
    fontSize: 12,
    color: '#92400e',
    fontWeight: '500',
  },
  symbolsContainer: {
    marginTop: 12,
  },
  symbolsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  symbolsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  symbolTag: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  symbolText: {
    fontSize: 12,
    color: '#3730a3',
    fontWeight: '500',
  },
  recommendationsCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  recommendationText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  confidenceInfo: {
    backgroundColor: '#f8fafc',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
  },
  confidenceInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  confidenceInfoText: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
    marginBottom: 8,
  },
  confidenceInfoNote: {
    fontSize: 11,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  newAnalysisButton: {
    backgroundColor: '#6366f1',
    margin: 16,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  newAnalysisButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ModernDreamAnalysisScreen;
