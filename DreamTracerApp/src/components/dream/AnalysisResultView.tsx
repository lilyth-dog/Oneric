import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { DreamAnalysisResponse } from '../../services/dreamAnalysisService';
import { AIModel } from '../../services/aiService';
import { 
  EmotionalTitleStyle, 
  EmotionalSubtitleStyle, 
  ButtonFontStyle, 
  BodyFontStyle, 
  SmallFontStyle,
  AnalysisReportTitleStyle
} from '../../styles/fonts';
import GlassView from '../common/GlassView';

interface AnalysisResultViewProps {
  analysisResult: DreamAnalysisResponse;
  dreamTitle?: string; // dreamTitle is used in the header
  selectedModel: AIModel;
  availableModels: any[];
  onModelChange: (model: AIModel) => void;
  onShare: () => void;
  onSave: () => void;
}

export const AnalysisResultView: React.FC<AnalysisResultViewProps> = ({
  analysisResult,
  dreamTitle,
  selectedModel,
  availableModels,
  onModelChange,
  onShare,
  onSave,
}) => {
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
              onPress={() => onModelChange(model.model)}
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
          <GlassView style={styles.visualizationContainer}>
            <Image source={{ uri: visualization.imageUrl }} style={styles.visualizationImage} />
            <Text style={styles.visualizationDescription}>{visualization.description}</Text>
          </GlassView>
        </View>
      )}

      {/* 요약 */}
      <View style={styles.summarySection}>
        <Text style={styles.sectionTitle}>꿈 요약</Text>
        <GlassView style={styles.summaryContainer}>
          <Text style={styles.summaryText}>{analysis.summary}</Text>
        </GlassView>
      </View>

      {/* 키워드 */}
      <View style={styles.keywordsSection}>
        <Text style={styles.sectionTitle}>주요 키워드</Text>
        <GlassView style={styles.keywordsContainer}>
          {analysis.keywords.map((keyword, index) => (
            <View key={index} style={styles.keywordTag}>
              <Text style={styles.keywordText}>{keyword}</Text>
            </View>
          ))}
        </GlassView>
      </View>

      {/* 감정 톤 */}
      <View style={styles.emotionSection}>
        <Text style={styles.sectionTitle}>감정 톤</Text>
        <GlassView style={styles.emotionContainer}>
          <Text style={styles.emotionText}>{analysis.emotionalTone}</Text>
        </GlassView>
      </View>

      {/* 상징 분석 */}
      <View style={styles.symbolsSection}>
        <Text style={styles.sectionTitle}>상징 분석</Text>
        {analysis.symbols.map((symbol, index) => (
          <GlassView key={index} style={styles.symbolItem}>
            <View style={styles.symbolHeader}>
              <Text style={styles.symbolName}>{symbol.symbol}</Text>
              <Text style={styles.symbolConfidence}>
                {(symbol.confidence * 100).toFixed(0)}%
              </Text>
            </View>
            <Text style={styles.symbolMeaning}>{symbol.meaning}</Text>
          </GlassView>
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
          <GlassView key={index} style={styles.insightItem}>
            <Text style={styles.insightText}>• {insight}</Text>
          </GlassView>
        ))}
      </View>

      {/* 반성 질문 */}
      <View style={styles.questionsSection}>
        <Text style={styles.sectionTitle}>반성 질문</Text>
        {analysis.reflectiveQuestions.map((question, index) => (
          <GlassView key={index} style={styles.questionItem}>
            <Text style={styles.questionText}>{question}</Text>
          </GlassView>
        ))}
      </View>

      {/* 추천사항 */}
      <View style={styles.recommendationsSection}>
        <Text style={styles.sectionTitle}>추천사항</Text>
        {recommendations.map((recommendation, index) => (
          <GlassView key={index} style={styles.recommendationItem}>
            <Text style={styles.recommendationText}>• {recommendation}</Text>
          </GlassView>
        ))}
      </View>

      {/* 통계 */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>꿈 통계</Text>
        <GlassView style={styles.statsContainer}>
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
        </GlassView>
      </View>

      {/* 액션 버튼 */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.shareButton} onPress={onShare}>
          <Text style={styles.shareButtonText}>📤 공유하기</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={onSave}>
          <Text style={styles.saveButtonText}>💾 저장하기</Text>
        </TouchableOpacity>
      </View>

      {/* 하단 여백 */}
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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
    padding: 16,
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
    padding: 20,
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
    padding: 16,
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
    padding: 16,
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
    padding: 16,
    marginBottom: 12,
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
    padding: 16,
    marginBottom: 12,
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
    padding: 16,
    marginBottom: 12,
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
    padding: 16,
    marginBottom: 12,
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
    padding: 20,
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
