/**
 * AI 연결 테스트 서비스
 * AI 모델 연결 상태 및 성능 테스트
 */
import aiService, { AIModel } from './aiService';
import dreamAnalysisService from './dreamAnalysisService';

// 연결 테스트 결과 타입
export interface ConnectionTestResult {
  model: AIModel;
  isConnected: boolean;
  responseTime: number;
  error?: string;
  timestamp: string;
}

// 성능 테스트 결과 타입
export interface PerformanceTestResult {
  model: AIModel;
  averageResponseTime: number;
  successRate: number;
  totalTests: number;
  successfulTests: number;
  failedTests: number;
  errors: string[];
  timestamp: string;
}

// 종합 테스트 결과 타입
export interface ComprehensiveTestResult {
  connectionTests: ConnectionTestResult[];
  performanceTests: PerformanceTestResult[];
  recommendedModel: AIModel;
  overallStatus: 'excellent' | 'good' | 'fair' | 'poor';
  summary: string;
  timestamp: string;
}

class AIConnectionTestService {
  private testResults: Map<AIModel, ConnectionTestResult[]> = new Map();
  private performanceResults: Map<AIModel, PerformanceTestResult> = new Map();

  constructor() {
    console.log('AIConnectionTestService: 초기화 완료');
  }

  /**
   * 모든 AI 모델 연결 테스트
   */
  async testAllConnections(): Promise<ConnectionTestResult[]> {
    try {
      console.log('AIConnectionTestService: 전체 연결 테스트 시작');

      const availableModels = aiService.getAvailableModels();
      const testPromises = availableModels
        .filter(model => model.isAvailable)
        .map(model => this.testConnection(model.model));

      const results = await Promise.all(testPromises);
      
      // 결과 저장
      results.forEach(result => {
        if (!this.testResults.has(result.model)) {
          this.testResults.set(result.model, []);
        }
        this.testResults.get(result.model)!.push(result);
      });

      console.log('AIConnectionTestService: 전체 연결 테스트 완료');
      return results;
    } catch (error) {
      console.error('AIConnectionTestService: 연결 테스트 실패:', error);
      throw error;
    }
  }

  /**
   * 특정 모델 연결 테스트
   */
  async testConnection(model: AIModel): Promise<ConnectionTestResult> {
    try {
      console.log('AIConnectionTestService: 연결 테스트 시작 -', model);

      const startTime = Date.now();
      
      // 모델 변경
      const switchSuccess = await aiService.switchModel(model);
      if (!switchSuccess) {
        return {
          model,
          isConnected: false,
          responseTime: 0,
          error: '모델 변경 실패',
          timestamp: new Date().toISOString()
        };
      }

      // 연결 상태 확인
      const isConnected = await aiService.checkConnection();
      const responseTime = Date.now() - startTime;

      const result: ConnectionTestResult = {
        model,
        isConnected,
        responseTime,
        timestamp: new Date().toISOString()
      };

      if (!isConnected) {
        result.error = 'AI 서버 연결 실패';
      }

      console.log('AIConnectionTestService: 연결 테스트 완료 -', model, isConnected ? '성공' : '실패');
      return result;
    } catch (error) {
      console.error('AIConnectionTestService: 연결 테스트 실패 -', model, error);
      return {
        model,
        isConnected: false,
        responseTime: 0,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 성능 테스트 실행
   */
  async runPerformanceTest(model: AIModel, testCount: number = 5): Promise<PerformanceTestResult> {
    try {
      console.log('AIConnectionTestService: 성능 테스트 시작 -', model, testCount + '회');

      const testDreamText = "어젯밤에 정말 이상한 꿈을 꿨어요. 하늘을 날아다니는 꿈이었는데, 새처럼 자유롭게 날 수 있었어요. 바람이 얼굴을 스치고 지나가는 느낌이 정말 좋았어요.";
      
      const testResults: Array<{ success: boolean; responseTime: number; error?: string }> = [];
      
      for (let i = 0; i < testCount; i++) {
        try {
          const startTime = Date.now();
          
          // 간단한 분석 요청
          const analysisRequest = {
            dreamId: `test_${i}`,
            dreamText: testDreamText,
            dreamTitle: '테스트 꿈'
          };

          await dreamAnalysisService.analyzeDream(analysisRequest);
          
          const responseTime = Date.now() - startTime;
          testResults.push({ success: true, responseTime });
          
          console.log(`AIConnectionTestService: 테스트 ${i + 1}/${testCount} 완료 - ${responseTime}ms`);
        } catch (error) {
          const responseTime = Date.now() - Date.now();
          testResults.push({ 
            success: false, 
            responseTime: 0, 
            error: error instanceof Error ? error.message : '알 수 없는 오류' 
          });
          console.error(`AIConnectionTestService: 테스트 ${i + 1}/${testCount} 실패:`, error);
        }
      }

      // 결과 계산
      const successfulTests = testResults.filter(r => r.success).length;
      const failedTests = testResults.filter(r => !r.success).length;
      const successfulResponseTimes = testResults.filter(r => r.success).map(r => r.responseTime);
      const averageResponseTime = successfulResponseTimes.length > 0 
        ? successfulResponseTimes.reduce((a, b) => a + b, 0) / successfulResponseTimes.length 
        : 0;
      const successRate = (successfulTests / testCount) * 100;
      const errors = testResults.filter(r => !r.success).map(r => r.error || '알 수 없는 오류');

      const result: PerformanceTestResult = {
        model,
        averageResponseTime,
        successRate,
        totalTests: testCount,
        successfulTests,
        failedTests,
        errors,
        timestamp: new Date().toISOString()
      };

      // 결과 저장
      this.performanceResults.set(model, result);

      console.log('AIConnectionTestService: 성능 테스트 완료 -', model, `성공률: ${successRate.toFixed(1)}%`);
      return result;
    } catch (error) {
      console.error('AIConnectionTestService: 성능 테스트 실패 -', model, error);
      throw error;
    }
  }

  /**
   * 종합 테스트 실행
   */
  async runComprehensiveTest(): Promise<ComprehensiveTestResult> {
    try {
      console.log('AIConnectionTestService: 종합 테스트 시작');

      // 연결 테스트 실행
      const connectionTests = await this.testAllConnections();
      
      // 성능 테스트 실행 (연결된 모델들만)
      const connectedModels = connectionTests.filter(test => test.isConnected).map(test => test.model);
      const performanceTests: PerformanceTestResult[] = [];
      
      for (const model of connectedModels) {
        try {
          const performanceTest = await this.runPerformanceTest(model, 3); // 3회 테스트
          performanceTests.push(performanceTest);
        } catch (error) {
          console.error('AIConnectionTestService: 성능 테스트 실패 -', model, error);
        }
      }

      // 추천 모델 결정
      const recommendedModel = this.determineRecommendedModel(connectionTests, performanceTests);
      
      // 전체 상태 평가
      const overallStatus = this.evaluateOverallStatus(connectionTests, performanceTests);
      
      // 요약 생성
      const summary = this.generateSummary(connectionTests, performanceTests, recommendedModel, overallStatus);

      const result: ComprehensiveTestResult = {
        connectionTests,
        performanceTests,
        recommendedModel,
        overallStatus,
        summary,
        timestamp: new Date().toISOString()
      };

      console.log('AIConnectionTestService: 종합 테스트 완료');
      return result;
    } catch (error) {
      console.error('AIConnectionTestService: 종합 테스트 실패:', error);
      throw error;
    }
  }

  /**
   * 추천 모델 결정
   */
  private determineRecommendedModel(
    connectionTests: ConnectionTestResult[],
    performanceTests: PerformanceTestResult[]
  ): AIModel {
    // 연결된 모델들 중에서 성능이 가장 좋은 모델 선택
    const connectedModels = connectionTests.filter(test => test.isConnected);
    
    if (connectedModels.length === 0) {
      return AIModel.LLAMA_3_8B; // 기본값
    }

    // 성능 테스트 결과가 있는 모델들 중에서 선택
    const modelsWithPerformance = performanceTests.filter(test => test.successRate > 0);
    
    if (modelsWithPerformance.length === 0) {
      return connectedModels[0].model; // 첫 번째 연결된 모델
    }

    // 성공률과 응답 시간을 고려하여 최적 모델 선택
    const bestModel = modelsWithPerformance.reduce((best, current) => {
      const bestScore = best.successRate * 0.7 + (1000 / Math.max(best.averageResponseTime, 1)) * 0.3;
      const currentScore = current.successRate * 0.7 + (1000 / Math.max(current.averageResponseTime, 1)) * 0.3;
      
      return currentScore > bestScore ? current : best;
    });

    return bestModel.model;
  }

  /**
   * 전체 상태 평가
   */
  private evaluateOverallStatus(
    connectionTests: ConnectionTestResult[],
    performanceTests: PerformanceTestResult[]
  ): 'excellent' | 'good' | 'fair' | 'poor' {
    const connectedCount = connectionTests.filter(test => test.isConnected).length;
    const totalCount = connectionTests.length;
    const connectionRate = (connectedCount / totalCount) * 100;

    if (performanceTests.length === 0) {
      return connectionRate >= 80 ? 'good' : 'fair';
    }

    const averageSuccessRate = performanceTests.reduce((sum, test) => sum + test.successRate, 0) / performanceTests.length;
    const averageResponseTime = performanceTests.reduce((sum, test) => sum + test.averageResponseTime, 0) / performanceTests.length;

    if (connectionRate >= 90 && averageSuccessRate >= 90 && averageResponseTime <= 3000) {
      return 'excellent';
    } else if (connectionRate >= 70 && averageSuccessRate >= 70 && averageResponseTime <= 5000) {
      return 'good';
    } else if (connectionRate >= 50 && averageSuccessRate >= 50) {
      return 'fair';
    } else {
      return 'poor';
    }
  }

  /**
   * 요약 생성
   */
  private generateSummary(
    connectionTests: ConnectionTestResult[],
    performanceTests: PerformanceTestResult[],
    recommendedModel: AIModel,
    overallStatus: string
  ): string {
    const connectedCount = connectionTests.filter(test => test.isConnected).length;
    const totalCount = connectionTests.length;
    
    let summary = `전체 ${totalCount}개 모델 중 ${connectedCount}개 모델이 연결되었습니다. `;
    
    if (performanceTests.length > 0) {
      const averageSuccessRate = performanceTests.reduce((sum, test) => sum + test.successRate, 0) / performanceTests.length;
      const averageResponseTime = performanceTests.reduce((sum, test) => sum + test.averageResponseTime, 0) / performanceTests.length;
      
      summary += `평균 성공률은 ${averageSuccessRate.toFixed(1)}%이고, 평균 응답 시간은 ${averageResponseTime.toFixed(0)}ms입니다. `;
    }
    
    summary += `추천 모델은 ${recommendedModel}이며, 전체 상태는 ${overallStatus}입니다.`;
    
    return summary;
  }

  /**
   * 테스트 결과 조회
   */
  getTestResults(model?: AIModel): ConnectionTestResult[] {
    if (model) {
      return this.testResults.get(model) || [];
    }
    
    const allResults: ConnectionTestResult[] = [];
    this.testResults.forEach(results => {
      allResults.push(...results);
    });
    
    return allResults;
  }

  /**
   * 성능 테스트 결과 조회
   */
  getPerformanceResults(model?: AIModel): PerformanceTestResult | PerformanceTestResult[] {
    if (model) {
      return this.performanceResults.get(model) || null;
    }
    
    const allResults: PerformanceTestResult[] = [];
    this.performanceResults.forEach(result => {
      allResults.push(result);
    });
    
    return allResults;
  }

  /**
   * 테스트 결과 초기화
   */
  clearResults(): void {
    this.testResults.clear();
    this.performanceResults.clear();
    console.log('AIConnectionTestService: 테스트 결과 초기화 완료');
  }

  /**
   * 빠른 연결 테스트
   */
  async quickConnectionTest(): Promise<boolean> {
    try {
      console.log('AIConnectionTestService: 빠른 연결 테스트 시작');
      
      const isConnected = await aiService.checkConnection();
      
      console.log('AIConnectionTestService: 빠른 연결 테스트 완료 -', isConnected ? '성공' : '실패');
      return isConnected;
    } catch (error) {
      console.error('AIConnectionTestService: 빠른 연결 테스트 실패:', error);
      return false;
    }
  }
}

export default new AIConnectionTestService();
