/**
 * 꿈 분석 서비스
 * AI 기반 꿈 분석 및 인사이트 제공
 */
import aiService, { DreamAnalysisResult, DreamVisualizationResult, AIModel } from './aiService';
import hybridDataManager from './hybridDataManager';

// 꿈 분석 요청 타입
export interface DreamAnalysisRequest {
  dreamId: string;
  dreamText: string;
  dreamTitle?: string;
  emotionTags?: string[];
  lucidityLevel?: number;
  sleepQuality?: number;
  additionalContext?: any;
}

// 꿈 분석 응답 타입
export interface DreamAnalysisResponse {
  analysis: DreamAnalysisResult;
  visualization?: DreamVisualizationResult;
  insights: string[];
  recommendations: string[];
  timestamp: string;
}

// 꿈 패턴 분석 타입
export interface DreamPatternAnalysis {
  recurringThemes: string[];
  emotionalPatterns: Array<{
    emotion: string;
    frequency: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }>;
  lucidityTrend: {
    average: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    recentScores: number[];
  };
  sleepQualityTrend: {
    average: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    recentScores: number[];
  };
  dreamTypes: Array<{
    type: string;
    frequency: number;
    percentage: number;
  }>;
  symbols: Array<{
    symbol: string;
    frequency: number;
    meanings: string[];
  }>;
}

class DreamAnalysisService {
  private analysisCache: Map<string, DreamAnalysisResponse> = new Map();
  private patternCache: DreamPatternAnalysis | null = null;
  private lastPatternUpdate: number = 0;

  constructor() {
    console.log('DreamAnalysisService: 초기화 완료');
  }

  /**
   * 꿈 분석 실행
   */
  async analyzeDream(request: DreamAnalysisRequest): Promise<DreamAnalysisResponse> {
    try {
      console.log('DreamAnalysisService: 꿈 분석 시작 -', request.dreamId);

      // 캐시 확인
      const cached = this.analysisCache.get(request.dreamId);
      if (cached) {
        console.log('DreamAnalysisService: 캐시된 분석 결과 사용');
        return cached;
      }

      // AI 서비스 상태 확인
      const aiState = aiService.getState();
      if (!aiState.isConnected) {
        throw new Error('AI 서비스에 연결할 수 없습니다. 네트워크를 확인해주세요.');
      }

      // 분석 컨텍스트 구성
      const analysisContext = {
        title: request.dreamTitle,
        emotionTags: request.emotionTags,
        lucidityLevel: request.lucidityLevel,
        sleepQuality: request.sleepQuality,
        timestamp: new Date().toISOString(),
        ...request.additionalContext
      };

      // AI 분석 실행
      const analysis = await aiService.analyzeDream(request.dreamText, analysisContext);

      // 시각화 생성 (선택사항)
      let visualization: DreamVisualizationResult | undefined;
      try {
        visualization = await aiService.generateVisualization(request.dreamText, analysis);
      } catch (error) {
        console.warn('DreamAnalysisService: 시각화 생성 실패:', error);
      }

      // 인사이트 생성
      const insights = this.generateInsights(analysis, analysisContext);

      // 추천사항 생성
      const recommendations = this.generateRecommendations(analysis, analysisContext);

      // 응답 구성
      const response: DreamAnalysisResponse = {
        analysis,
        visualization,
        insights,
        recommendations,
        timestamp: new Date().toISOString()
      };

      // 캐시 저장
      this.analysisCache.set(request.dreamId, response);

      // 서버에 분석 결과 저장
      try {
        await hybridDataManager.saveAnalysisResult(request.dreamId, analysis);
      } catch (error) {
        console.warn('DreamAnalysisService: 서버 저장 실패:', error);
      }

      console.log('DreamAnalysisService: 꿈 분석 완료');
      return response;
    } catch (error) {
      console.error('DreamAnalysisService: 꿈 분석 실패:', error);
      throw error;
    }
  }

  /**
   * 꿈 패턴 분석
   */
  async analyzeDreamPatterns(): Promise<DreamPatternAnalysis> {
    try {
      console.log('DreamAnalysisService: 꿈 패턴 분석 시작');

      // 캐시 확인 (24시간 유효)
      const now = Date.now();
      if (this.patternCache && (now - this.lastPatternUpdate) < 24 * 60 * 60 * 1000) {
        console.log('DreamAnalysisService: 캐시된 패턴 분석 사용');
        return this.patternCache;
      }

      // 모든 꿈 데이터 조회
      const dreams = await hybridDataManager.getDreams();
      
      if (dreams.length === 0) {
        throw new Error('분석할 꿈 데이터가 없습니다.');
      }

      // 패턴 분석 실행
      const patternAnalysis = this.calculatePatterns(dreams);

      // 캐시 저장
      this.patternCache = patternAnalysis;
      this.lastPatternUpdate = now;

      console.log('DreamAnalysisService: 꿈 패턴 분석 완료');
      return patternAnalysis;
    } catch (error) {
      console.error('DreamAnalysisService: 패턴 분석 실패:', error);
      throw error;
    }
  }

  /**
   * 꿈 비교 분석
   */
  async compareDreams(dreamIds: string[]): Promise<{
    similarities: string[];
    differences: string[];
    commonThemes: string[];
    uniqueElements: Array<{
      dreamId: string;
      elements: string[];
    }>;
  }> {
    try {
      console.log('DreamAnalysisService: 꿈 비교 분석 시작');

      if (dreamIds.length < 2) {
        throw new Error('비교할 꿈이 2개 이상 필요합니다.');
      }

      // 꿈 데이터 조회
      const dreams = await Promise.all(
        dreamIds.map(id => hybridDataManager.getDream(id))
      );

      const validDreams = dreams.filter(dream => dream !== null);
      if (validDreams.length < 2) {
        throw new Error('유효한 꿈 데이터가 부족합니다.');
      }

      // 비교 분석 실행
      const comparison = this.calculateComparison(validDreams);

      console.log('DreamAnalysisService: 꿈 비교 분석 완료');
      return comparison;
    } catch (error) {
      console.error('DreamAnalysisService: 비교 분석 실패:', error);
      throw error;
    }
  }

  /**
   * 꿈 예측 분석
   */
  async predictDreamTrends(): Promise<{
    predictedThemes: string[];
    predictedEmotions: string[];
    predictedLucidity: number;
    confidence: number;
    recommendations: string[];
  }> {
    try {
      console.log('DreamAnalysisService: 꿈 예측 분석 시작');

      // 패턴 분석 기반으로 예측
      const patterns = await this.analyzeDreamPatterns();
      
      // 예측 로직 실행
      const prediction = this.calculatePredictions(patterns);

      console.log('DreamAnalysisService: 꿈 예측 분석 완료');
      return prediction;
    } catch (error) {
      console.error('DreamAnalysisService: 예측 분석 실패:', error);
      throw error;
    }
  }

  /**
   * 인사이트 생성
   */
  private generateInsights(analysis: DreamAnalysisResult, context: any): string[] {
    const insights: string[] = [];

    // 감정 기반 인사이트
    if (analysis.emotionalTone.includes('긍정적')) {
      insights.push('현재 삶에서 긍정적인 에너지가 흐르고 있습니다.');
    } else if (analysis.emotionalTone.includes('부정적')) {
      insights.push('현재 스트레스나 걱정이 꿈에 반영되고 있습니다.');
    }

    // 상징 기반 인사이트
    analysis.symbols.forEach(symbol => {
      if (symbol.confidence > 0.8) {
        insights.push(`${symbol.symbol}은(는) ${symbol.meaning}을 의미할 수 있습니다.`);
      }
    });

    // 명료도 기반 인사이트
    if (analysis.lucidityScore > 0.7) {
      insights.push('자각몽 능력이 향상되고 있습니다.');
    }

    // 수면 품질 기반 인사이트
    if (context.sleepQuality && context.sleepQuality < 3) {
      insights.push('수면 품질 개선이 필요해 보입니다.');
    }

    return insights;
  }

  /**
   * 추천사항 생성
   */
  private generateRecommendations(analysis: DreamAnalysisResult, context: any): string[] {
    const recommendations: string[] = [];

    // 감정 기반 추천
    if (analysis.emotionalTone.includes('스트레스')) {
      recommendations.push('명상이나 요가를 통해 스트레스를 해소해보세요.');
    }

    // 수면 품질 기반 추천
    if (context.sleepQuality && context.sleepQuality < 3) {
      recommendations.push('규칙적인 수면 패턴을 유지해보세요.');
    }

    // 명료도 기반 추천
    if (analysis.lucidityScore < 0.3) {
      recommendations.push('자각몽 연습을 통해 꿈의 명료도를 높여보세요.');
    }

    // 테마 기반 추천
    if (analysis.themes.includes('성장')) {
      recommendations.push('새로운 도전이나 학습에 도전해보세요.');
    }

    return recommendations;
  }

  /**
   * 패턴 계산
   */
  private calculatePatterns(dreams: any[]): DreamPatternAnalysis {
    // 재발 테마 분석
    const themeCounts = new Map<string, number>();
    const emotionCounts = new Map<string, number>();
    const symbolCounts = new Map<string, number>();
    const lucidityScores: number[] = [];
    const sleepQualityScores: number[] = [];
    const dreamTypeCounts = new Map<string, number>();

    dreams.forEach(dream => {
      // 테마 카운트
      if (dream.emotionTags) {
        dream.emotionTags.forEach((tag: string) => {
          emotionCounts.set(tag, (emotionCounts.get(tag) || 0) + 1);
        });
      }

      // 명료도 점수
      if (dream.lucidityLevel) {
        lucidityScores.push(dream.lucidityLevel);
      }

      // 수면 품질 점수
      if (dream.sleepQuality) {
        sleepQualityScores.push(dream.sleepQuality);
      }

      // 꿈 타입 카운트
      if (dream.dreamType) {
        dreamTypeCounts.set(dream.dreamType, (dreamTypeCounts.get(dream.dreamType) || 0) + 1);
      }
    });

    // 재발 테마 계산
    const recurringThemes = Array.from(themeCounts.entries())
      .filter(([_, count]) => count > 1)
      .map(([theme, count]) => theme);

    // 감정 패턴 계산
    const emotionalPatterns = Array.from(emotionCounts.entries())
      .map(([emotion, frequency]) => ({
        emotion,
        frequency,
        trend: 'stable' as const // 실제로는 시간에 따른 트렌드 계산 필요
      }));

    // 명료도 트렌드 계산
    const lucidityTrend = {
      average: lucidityScores.length > 0 ? lucidityScores.reduce((a, b) => a + b, 0) / lucidityScores.length : 0,
      trend: 'stable' as const, // 실제로는 시간에 따른 트렌드 계산 필요
      recentScores: lucidityScores.slice(-10)
    };

    // 수면 품질 트렌드 계산
    const sleepQualityTrend = {
      average: sleepQualityScores.length > 0 ? sleepQualityScores.reduce((a, b) => a + b, 0) / sleepQualityScores.length : 0,
      trend: 'stable' as const, // 실제로는 시간에 따른 트렌드 계산 필요
      recentScores: sleepQualityScores.slice(-10)
    };

    // 꿈 타입 분석
    const dreamTypes = Array.from(dreamTypeCounts.entries())
      .map(([type, frequency]) => ({
        type,
        frequency,
        percentage: (frequency / dreams.length) * 100
      }));

    // 상징 분석
    const symbols = Array.from(symbolCounts.entries())
      .map(([symbol, frequency]) => ({
        symbol,
        frequency,
        meanings: [`${symbol}의 의미`] // 실제로는 AI 분석 결과에서 가져와야 함
      }));

    return {
      recurringThemes,
      emotionalPatterns,
      lucidityTrend,
      sleepQualityTrend,
      dreamTypes,
      symbols
    };
  }

  /**
   * 비교 계산
   */
  private calculateComparison(dreams: any[]): any {
    // 간단한 비교 로직 (실제로는 더 복잡한 분석 필요)
    const similarities: string[] = [];
    const differences: string[] = [];
    const commonThemes: string[] = [];
    const uniqueElements: Array<{ dreamId: string; elements: string[] }> = [];

    // 공통 감정 태그 찾기
    const allEmotions = dreams.flatMap(dream => dream.emotionTags || []);
    const emotionCounts = new Map<string, number>();
    
    allEmotions.forEach(emotion => {
      emotionCounts.set(emotion, (emotionCounts.get(emotion) || 0) + 1);
    });

    // 공통 테마 찾기
    Array.from(emotionCounts.entries())
      .filter(([_, count]) => count > 1)
      .forEach(([emotion, _]) => {
        commonThemes.push(emotion);
      });

    return {
      similarities,
      differences,
      commonThemes,
      uniqueElements
    };
  }

  /**
   * 예측 계산
   */
  private calculatePredictions(patterns: DreamPatternAnalysis): any {
    // 간단한 예측 로직 (실제로는 머신러닝 모델 사용)
    const predictedThemes = patterns.recurringThemes.slice(0, 3);
    const predictedEmotions = patterns.emotionalPatterns
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 3)
      .map(p => p.emotion);
    const predictedLucidity = patterns.lucidityTrend.average;
    const confidence = 0.7; // 실제로는 통계적 신뢰도 계산
    const recommendations = ['규칙적인 수면 패턴 유지', '꿈 일기 작성 지속'];

    return {
      predictedThemes,
      predictedEmotions,
      predictedLucidity,
      confidence,
      recommendations
    };
  }

  /**
   * 캐시 초기화
   */
  clearCache(): void {
    this.analysisCache.clear();
    this.patternCache = null;
    this.lastPatternUpdate = 0;
    console.log('DreamAnalysisService: 캐시 초기화 완료');
  }

  /**
   * 캐시 상태 조회
   */
  getCacheStatus(): {
    analysisCacheSize: number;
    hasPatternCache: boolean;
    lastPatternUpdate: number;
  } {
    return {
      analysisCacheSize: this.analysisCache.size,
      hasPatternCache: this.patternCache !== null,
      lastPatternUpdate: this.lastPatternUpdate
    };
  }
}

export default new DreamAnalysisService();
