/**
 * 꿈 분석 결과 화면
 * AI 기반 꿈 분석 및 시각화 표시
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigationStore } from '../../stores/navigationStore';
import dreamAnalysisService, { DreamAnalysisRequest, DreamAnalysisResponse } from '../../services/dreamAnalysisService';
import aiService, { AIModel } from '../../services/aiService';
import { 
  EmotionalTitleStyle, 
  EmotionalSubtitleStyle, 
  ButtonFontStyle, 
  BodyFontStyle, 
  SmallFontStyle,
  PersonalGreetingStyle,
  AnalysisReportTitleStyle
} from '../../styles/fonts';

interface DreamAnalysisScreenProps {
  dreamId: string;
  dreamText: string;
  dreamTitle?: string;
  emotionTags?: string[];
  lucidityLevel?: number;
  sleepQuality?: number;
}

const DreamAnalysisScreen: React.FC<DreamAnalysisScreenProps> = ({
  dreamId,
  dreamText,
  dreamTitle,
  emotionTags,
  lucidityLevel,
  sleepQuality
}) => {
  const { goBack } = useNavigationStore();
  
  const [analysisResult, setAnalysisResult] = useState<DreamAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel>(AIModel.LLAMA_3_8B);
  const [availableModels, setAvailableModels] = useState<any[]>([]);

  useEffect(() => {
    loadAvailableModels();
    performAnalysis();
  }, []);

  const loadAvailableModels = async () => {
    try {
      const models = aiService.getAvailableModels();
      setAvailableModels(models);
    } catch (error) {
      console.error('모델 목록 로드 실패:', error);
    }
  };

  const performAnalysis = async () => {
    try {
      setIsLoading(true);
      
      const request: DreamAnalysisRequest = {
        dreamId,
        dreamText,
        dreamTitle,
        emotionTags,
        lucidityLevel,
        sleepQuality
      };

      const result = await dreamAnalysisService.analyzeDream(request);
      setAnalysisResult(result);
    } catch (error) {
      Alert.alert('오류', error instanceof Error ? error.message : '분석에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await performAnalysis();
    setIsRefreshing(false);
  };

  const handleModelChange = async (model: AIModel) => {
    try {
      const success = await aiService.switchModel(model);
      if (success) {
        setSelectedModel(model);
        await performAnalysis();
      } else {
        Alert.alert('오류', '모델 변경에 실패했습니다.');
      }
    } catch (error) {
      Alert.alert('오류', '모델 변경 중 오류가 발생했습니다.');
    }
  };

  const handleShareAnalysis = () => {
    if (analysisResult) {
      // 분석 결과 공유 로직
      Alert.alert('공유', '분석 결과를 공유합니다.');
    }
  };

  const handleSaveAnalysis = () => {
    if (analysisResult) {
      // 분석 결과 저장 로직
      Alert.alert('저장', '분석 결과를 저장했습니다.');
    }
  };

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#FFDDA8" />
      <Text style={styles.loadingText}>AI가 꿈을 분석하고 있습니다...</Text>
      <Text style={styles.loadingSubtext}>잠시만 기다려주세요</Text>
    </View>
  );

  const renderAnalysisResult = () => {
    if (!analysisResult) return null;

    const { analysis, visualization, insights, recommendations } = analysisResult;

    return (
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>꿈 분석 결과</Text>
          <Text style={styles.subtitle}>{dreamTitle || '제목 없음'}</Text>
        </View>

        {/* AI 모델 선택 */}
        <View style={styles.modelSection}>
          <Text style={styles.sectionTitle}>AI 모델</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modelScrollView}>
            {availableModels.map((model) => (
              <TouchableOpacity
                key={model.model}
                style={[
                  styles.modelButton,
                  selectedModel === model.model && styles.modelButtonActive
                ]}
                onPress={() => handleModelChange(model.model)}
                disabled={!model.isAvailable}
              >
                <Text style={[
                  styles.modelButtonText,
                  selectedModel === model.model && styles.modelButtonTextActive,
                  !model.isAvailable && styles.modelButtonDisabled
                ]}>
                  {model.name}
                </Text>
                <Text style={styles.modelDescription}>{model.description}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 시각화 */}
        {visualization && (
          <View style={styles.visualizationSection}>
            <Text style={styles.sectionTitle}>꿈 시각화</Text>
            <View style={styles.visualizationContainer}>
              <Image source={{ uri: visualization.imageUrl }} style={styles.visualizationImage} />
              <Text style={styles.visualizationDescription}>{visualization.description}</Text>
            </View>
          </View>
        )}

        {/* 요약 */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>꿈 요약</Text>
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>{analysis.summary}</Text>
          </View>
        </View>

        {/* 키워드 */}
        <View style={styles.keywordsSection}>
          <Text style={styles.sectionTitle}>주요 키워드</Text>
          <View style={styles.keywordsContainer}>
            {analysis.keywords.map((keyword, index) => (
              <View key={index} style={styles.keywordTag}>
                <Text style={styles.keywordText}>{keyword}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 감정 톤 */}
        <View style={styles.emotionSection}>
          <Text style={styles.sectionTitle}>감정 톤</Text>
          <View style={styles.emotionContainer}>
            <Text style={styles.emotionText}>{analysis.emotionalTone}</Text>
          </View>
        </View>

        {/* 상징 분석 */}
        <View style={styles.symbolsSection}>
          <Text style={styles.sectionTitle}>상징 분석</Text>
          {analysis.symbols.map((symbol, index) => (
            <View key={index} style={styles.symbolItem}>
              <View style={styles.symbolHeader}>
                <Text style={styles.symbolName}>{symbol.symbol}</Text>
                <Text style={styles.symbolConfidence}>
                  {(symbol.confidence * 100).toFixed(0)}%
                </Text>
              </View>
              <Text style={styles.symbolMeaning}>{symbol.meaning}</Text>
            </View>
          ))}
        </View>

        {/* 테마 */}
        <View style={styles.themesSection}>
          <Text style={styles.sectionTitle}>주요 테마</Text>
          <View style={styles.themesContainer}>
            {analysis.themes.map((theme, index) => (
              <View key={index} style={styles.themeTag}>
                <Text style={styles.themeText}>{theme}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 인사이트 */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>AI 인사이트</Text>
          {insights.map((insight, index) => (
            <View key={index} style={styles.insightItem}>
              <Text style={styles.insightText}>• {insight}</Text>
            </View>
          ))}
        </View>

        {/* 반성 질문 */}
        <View style={styles.questionsSection}>
          <Text style={styles.sectionTitle}>반성 질문</Text>
          {analysis.reflectiveQuestions.map((question, index) => (
            <View key={index} style={styles.questionItem}>
              <Text style={styles.questionText}>{question}</Text>
            </View>
          ))}
        </View>

        {/* 추천사항 */}
        <View style={styles.recommendationsSection}>
          <Text style={styles.sectionTitle}>추천사항</Text>
          {recommendations.map((recommendation, index) => (
            <View key={index} style={styles.recommendationItem}>
              <Text style={styles.recommendationText}>• {recommendation}</Text>
            </View>
          ))}
        </View>

        {/* 통계 */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>꿈 통계</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>명료도</Text>
              <Text style={styles.statValue}>{(analysis.lucidityScore * 100).toFixed(0)}%</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>감정 강도</Text>
              <Text style={styles.statValue}>{(analysis.emotionalIntensity * 100).toFixed(0)}%</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>꿈 타입</Text>
              <Text style={styles.statValue}>{analysis.dreamType}</Text>
            </View>
          </View>
        </View>

        {/* 액션 버튼 */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.shareButton} onPress={handleShareAnalysis}>
            <Text style={styles.shareButtonText}>📤 공유하기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveAnalysis}>
            <Text style={styles.saveButtonText}>💾 저장하기</Text>
          </TouchableOpacity>
        </View>

        {/* 하단 여백 */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {isLoading ? renderLoadingState() : renderAnalysisResult()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#191D2E', // Night Sky Blue
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    ...PersonalGreetingStyle,
    color: '#FFDDA8',
    textAlign: 'center',
    marginTop: 16,
  },
  loadingSubtext: {
    ...SmallFontStyle,
    color: '#8F8C9B',
    textAlign: 'center',
    marginTop: 8,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  title: {
    ...AnalysisReportTitleStyle,
    color: '#FFDDA8',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    ...EmotionalSubtitleStyle,
    color: '#8F8C9B',
    textAlign: 'center',
  },
  modelSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...EmotionalSubtitleStyle,
    color: '#FFDDA8',
    marginBottom: 16,
  },
  modelScrollView: {
    flexDirection: 'row',
  },
  modelButton: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#3d3d5c',
    minWidth: 120,
  },
  modelButtonActive: {
    backgroundColor: '#4A4063',
    borderColor: '#FFDDA8',
  },
  modelButtonText: {
    ...ButtonFontStyle,
    color: '#EAE8F0',
    fontSize: 14,
    marginBottom: 4,
  },
  modelButtonTextActive: {
    color: '#FFDDA8',
  },
  modelButtonDisabled: {
    color: '#595566',
  },
  modelDescription: {
    ...SmallFontStyle,
    color: '#8F8C9B',
    fontSize: 10,
  },
  visualizationSection: {
    marginBottom: 24,
  },
  visualizationContainer: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3d3d5c',
  },
  visualizationImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  visualizationDescription: {
    ...BodyFontStyle,
    color: '#EAE8F0',
    textAlign: 'center',
  },
  summarySection: {
    marginBottom: 24,
  },
  summaryContainer: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3d3d5c',
  },
  summaryText: {
    ...BodyFontStyle,
    color: '#EAE8F0',
    lineHeight: 24,
  },
  keywordsSection: {
    marginBottom: 24,
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  keywordTag: {
    backgroundColor: '#4A4063',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  keywordText: {
    ...SmallFontStyle,
    color: '#FFDDA8',
  },
  emotionSection: {
    marginBottom: 24,
  },
  emotionContainer: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3d3d5c',
  },
  emotionText: {
    ...BodyFontStyle,
    color: '#EAE8F0',
    textAlign: 'center',
  },
  symbolsSection: {
    marginBottom: 24,
  },
  symbolItem: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3d3d5c',
  },
  symbolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  symbolName: {
    ...BodyFontStyle,
    color: '#FFDDA8',
    fontWeight: '600',
  },
  symbolConfidence: {
    ...SmallFontStyle,
    color: '#8F8C9B',
  },
  symbolMeaning: {
    ...BodyFontStyle,
    color: '#EAE8F0',
    lineHeight: 20,
  },
  themesSection: {
    marginBottom: 24,
  },
  themesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  themeTag: {
    backgroundColor: '#e94560',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  themeText: {
    ...SmallFontStyle,
    color: '#ffffff',
  },
  insightsSection: {
    marginBottom: 24,
  },
  insightItem: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3d3d5c',
  },
  insightText: {
    ...BodyFontStyle,
    color: '#EAE8F0',
    lineHeight: 20,
  },
  questionsSection: {
    marginBottom: 24,
  },
  questionItem: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3d3d5c',
  },
  questionText: {
    ...BodyFontStyle,
    color: '#EAE8F0',
    lineHeight: 20,
  },
  recommendationsSection: {
    marginBottom: 24,
  },
  recommendationItem: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3d3d5c',
  },
  recommendationText: {
    ...BodyFontStyle,
    color: '#EAE8F0',
    lineHeight: 20,
  },
  statsSection: {
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3d3d5c',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    ...SmallFontStyle,
    color: '#8F8C9B',
    marginBottom: 4,
  },
  statValue: {
    ...BodyFontStyle,
    color: '#FFDDA8',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#4A4063',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#595566',
  },
  shareButtonText: {
    ...ButtonFontStyle,
    color: '#FFDDA8',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#FFDDA8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFDDA8',
  },
  saveButtonText: {
    ...ButtonFontStyle,
    color: '#191D2E',
  },
  bottomSpacer: {
    height: 40,
  },
});

export default DreamAnalysisScreen;