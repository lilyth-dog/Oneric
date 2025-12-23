/**
 * AI 서비스
 * OSS AI 모델 (Llama/Mistral) 통합 및 꿈 분석
 */
import { Platform } from 'react-native';
import { API_CONFIG } from '../config/api';

// AI 모델 타입
export enum AIModel {
  LLAMA_3_8B = 'llama-3-8b',
  LLAMA_3_70B = 'llama-3-70b',
  MISTRAL_7B = 'mistral-7b',
  MISTRAL_8X7B = 'mistral-8x7b',
  LOCAL_LLAMA = 'local-llama',
  LOCAL_MISTRAL = 'local-mistral'
}

// AI 분석 결과 타입
export interface DreamAnalysisResult {
  summary: string;
  keywords: string[];
  emotionalTone: string;
  symbols: Array<{
    symbol: string;
    meaning: string;
    confidence: number;
  }>;
  themes: string[];
  insights: string[];
  reflectiveQuestions: string[];
  dreamType: string;
  lucidityScore: number;
  emotionalIntensity: number;
  timestamp: string;
}

// AI 시각화 결과 타입
export interface DreamVisualizationResult {
  imageUrl: string;
  description: string;
  style: string;
  colors: string[];
  elements: string[];
  timestamp: string;
}

// AI 설정 타입
export interface AISettings {
  model: AIModel;
  temperature: number;
  maxTokens: number;
  enableVisualization: boolean;
  enableDetailedAnalysis: boolean;
  language: string;
}

// AI 서비스 상태 타입
export interface AIServiceState {
  isProcessing: boolean;
  currentModel: AIModel;
  isConnected: boolean;
  lastAnalysisTime: number;
  totalAnalyses: number;
}

class AIService {
  private state: AIServiceState = {
    isProcessing: false,
    currentModel: AIModel.LLAMA_3_8B,
    isConnected: false,
    lastAnalysisTime: 0,
    totalAnalyses: 0
  };

  private settings: AISettings = {
    model: AIModel.LLAMA_3_8B,
    temperature: 0.7,
    maxTokens: 2048,
    enableVisualization: true,
    enableDetailedAnalysis: true,
    language: 'ko'
  };

  // private baseUrl = 'https://api.ggumgyeol.com/ai'; // 실제 AI API URL
  private baseUrl = API_CONFIG.baseURL; // 공통 설정 사용

  constructor() {
    console.log('AIService: 초기화 완료');
    this.checkConnection();
  }

  /**
   * AI 모델 연결 상태 확인
   */
  async checkConnection(): Promise<boolean> {
    try {
      console.log('AIService: 연결 상태 확인 중...');

      // 실제 구현에서는 AI 서버에 ping 요청
      // AbortController를 사용한 타임아웃 구현
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      this.state.isConnected = response.ok;
      console.log('AIService: 연결 상태 -', this.state.isConnected ? '연결됨' : '연결 실패');

      return this.state.isConnected;
    } catch (error) {
      this.state.isConnected = false;
      console.error('AIService: 연결 확인 실패:', error);
      return false;
    }
  }

  /**
   * 꿈 분석 실행
   */
  async analyzeDream(dreamText: string, additionalContext?: any): Promise<DreamAnalysisResult> {
    try {
      this.state.isProcessing = true;
      const startTime = Date.now();

      console.log('AIService: 꿈 분석 시작 -', this.settings.model);

      // 연결 상태 확인
      if (!this.state.isConnected) {
        await this.checkConnection();
        if (!this.state.isConnected) {
          throw new Error('AI 서버에 연결할 수 없습니다. 네트워크를 확인해주세요.');
        }
      }

      // 분석 요청 데이터 구성
      const analysisRequest = {
        dream_text: dreamText,
        model: this.settings.model,
        temperature: this.settings.temperature,
        max_tokens: this.settings.maxTokens,
        language: this.settings.language,
        enable_detailed_analysis: this.settings.enableDetailedAnalysis,
        additional_context: additionalContext
      };

      // AI 서버에 분석 요청
      const response = await fetch(`${this.baseUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify(analysisRequest)
      });

      if (!response.ok) {
        throw new Error(`AI 분석 실패: ${response.status}`);
      }

      const result: DreamAnalysisResult = await response.json();

      this.state.isProcessing = false;
      this.state.lastAnalysisTime = Date.now();
      this.state.totalAnalyses++;

      const duration = (Date.now() - startTime) / 1000;
      console.log('AIService: 꿈 분석 완료 -', duration.toFixed(2) + '초');

      return result;
    } catch (error) {
      this.state.isProcessing = false;
      console.error('AIService: 꿈 분석 실패:', error);

      // 오프라인 모드에서 시뮬레이션된 결과 반환
      if (error instanceof Error && error.message.includes('연결')) {
        return this.getSimulatedAnalysis(dreamText);
      }

      throw error;
    }
  }

  /**
   * 꿈 시각화 생성
   */
  async generateVisualization(dreamText: string, analysisResult?: DreamAnalysisResult): Promise<DreamVisualizationResult> {
    try {
      if (!this.settings.enableVisualization) {
        throw new Error('시각화 기능이 비활성화되어 있습니다.');
      }

      this.state.isProcessing = true;
      const startTime = Date.now();

      console.log('AIService: 꿈 시각화 생성 시작');

      // 시각화 요청 데이터 구성
      const visualizationRequest = {
        dream_text: dreamText,
        analysis_result: analysisResult,
        model: this.settings.model,
        style: 'dreamy_artistic',
        resolution: '1024x1024'
      };

      // AI 서버에 시각화 요청
      const response = await fetch(`${this.baseUrl}/visualize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify(visualizationRequest)
      });

      if (!response.ok) {
        throw new Error(`시각화 생성 실패: ${response.status}`);
      }

      const result: DreamVisualizationResult = await response.json();

      this.state.isProcessing = false;

      const duration = (Date.now() - startTime) / 1000;
      console.log('AIService: 꿈 시각화 생성 완료 -', duration.toFixed(2) + '초');

      return result;
    } catch (error) {
      this.state.isProcessing = false;
      console.error('AIService: 시각화 생성 실패:', error);

      // 오프라인 모드에서 시뮬레이션된 결과 반환
      if (error instanceof Error && error.message.includes('연결')) {
        return this.getSimulatedVisualization(dreamText);
      }

      throw error;
    }
  }

  /**
   * AI 모델 변경
   */
  async switchModel(newModel: AIModel): Promise<boolean> {
    try {
      console.log('AIService: 모델 변경 -', newModel);

      this.settings.model = newModel;
      this.state.currentModel = newModel;

      // 새 모델 연결 테스트
      const isConnected = await this.checkConnection();

      if (isConnected) {
        console.log('AIService: 모델 변경 성공');
        return true;
      } else {
        console.warn('AIService: 새 모델 연결 실패, 이전 모델로 복원');
        this.settings.model = this.state.currentModel;
        return false;
      }
    } catch (error) {
      console.error('AIService: 모델 변경 실패:', error);
      return false;
    }
  }

  /**
   * AI 설정 업데이트
   */
  updateSettings(newSettings: Partial<AISettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    console.log('AIService: 설정 업데이트 -', this.settings);
  }

  /**
   * 현재 AI 설정 조회
   */
  getSettings(): AISettings {
    return { ...this.settings };
  }

  /**
   * AI 서비스 상태 조회
   */
  getState(): AIServiceState {
    return { ...this.state };
  }

  /**
   * 지원하는 AI 모델 목록 조회
   */
  getAvailableModels(): Array<{ model: AIModel; name: string; description: string; isAvailable: boolean }> {
    return [
      {
        model: AIModel.LLAMA_3_8B,
        name: 'Llama 3 8B',
        description: '빠른 분석, 일반적인 꿈 해석',
        isAvailable: true
      },
      {
        model: AIModel.LLAMA_3_70B,
        name: 'Llama 3 70B',
        description: '고품질 분석, 상세한 꿈 해석',
        isAvailable: true
      },
      {
        model: AIModel.MISTRAL_7B,
        name: 'Mistral 7B',
        description: '균형잡힌 성능, 빠른 응답',
        isAvailable: true
      },
      {
        model: AIModel.MISTRAL_8X7B,
        name: 'Mistral 8x7B',
        description: '최고 품질, 전문적인 분석',
        isAvailable: true
      },
      {
        model: AIModel.LOCAL_LLAMA,
        name: '로컬 Llama',
        description: '오프라인 분석, 프라이버시 보호',
        isAvailable: false // 로컬 모델은 별도 설정 필요
      },
      {
        model: AIModel.LOCAL_MISTRAL,
        name: '로컬 Mistral',
        description: '오프라인 분석, 프라이버시 보호',
        isAvailable: false // 로컬 모델은 별도 설정 필요
      }
    ];
  }

  /**
   * 시뮬레이션된 분석 결과 (오프라인 모드)
   */
  private getSimulatedAnalysis(dreamText: string): DreamAnalysisResult {
    const keywords = ['꿈', '하늘', '날아다니기', '자유', '평화'];
    const symbols = [
      { symbol: '하늘', meaning: '자유와 무한한 가능성', confidence: 0.9 },
      { symbol: '날개', meaning: '독립과 성장', confidence: 0.8 }
    ];
    const themes = ['자유', '성장', '평화'];
    const insights = [
      '현실에서 자유롭고 싶은 마음이 꿈에 반영되었습니다.',
      '새로운 시작에 대한 기대감이 느껴집니다.'
    ];
    const reflectiveQuestions = [
      '현재 삶에서 자유롭지 못한 부분이 있나요?',
      '새로운 도전을 시작하고 싶은 마음이 있나요?'
    ];

    return {
      summary: '하늘을 날아다니는 꿈으로, 자유와 성장에 대한 열망이 표현되었습니다.',
      keywords,
      emotionalTone: '긍정적이고 희망적',
      symbols,
      themes,
      insights,
      reflectiveQuestions,
      dreamType: '자각몽',
      lucidityScore: 0.7,
      emotionalIntensity: 0.8,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 시뮬레이션된 시각화 결과 (오프라인 모드)
   */
  private getSimulatedVisualization(dreamText: string): DreamVisualizationResult {
    return {
      imageUrl: 'https://via.placeholder.com/1024x1024/4A4063/FFDDA8?text=Dream+Visualization',
      description: '몽환적이고 아름다운 꿈의 시각화',
      style: 'dreamy_artistic',
      colors: ['#4A4063', '#FFDDA8', '#8F8C9B'],
      elements: ['하늘', '구름', '빛'],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 인증 토큰 조회 (실제 구현에서는 authStore에서 가져와야 함)
   */
  private async getAuthToken(): Promise<string> {
    // 실제 구현에서는 authStore에서 토큰을 가져와야 함
    return 'dummy_token';
  }

  /**
   * AI 서비스 초기화
   */
  async initialize(): Promise<void> {
    try {
      console.log('AIService: 초기화 시작');

      // 연결 상태 확인
      await this.checkConnection();

      // 기본 모델 설정
      this.state.currentModel = this.settings.model;

      console.log('AIService: 초기화 완료');
    } catch (error) {
      console.error('AIService: 초기화 실패:', error);
      throw error;
    }
  }

  /**
   * AI 서비스 리셋
   */
  reset(): void {
    this.state = {
      isProcessing: false,
      currentModel: AIModel.LLAMA_3_8B,
      isConnected: false,
      lastAnalysisTime: 0,
      totalAnalyses: 0
    };

    this.settings = {
      model: AIModel.LLAMA_3_8B,
      temperature: 0.7,
      maxTokens: 2048,
      enableVisualization: true,
      enableDetailedAnalysis: true,
      language: 'ko'
    };
  }
}

export default new AIService();
