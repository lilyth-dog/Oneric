/**
 * API 연결 테스트
 * Android에서 Vercel API 서버 연결 확인
 */
import { API_CONFIG, checkServerHealth, analyzeDream, getAvailableModels } from '../config/api';

export class APITestService {
  /**
   * 서버 상태 확인
   */
  static async testServerHealth(): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      console.log('🏥 서버 상태 확인 중...');
      const response = await checkServerHealth();
      
      return {
        success: true,
        message: '서버 연결 성공!',
        data: response
      };
    } catch (error) {
      console.error('❌ 서버 연결 실패:', error);
      return {
        success: false,
        message: `서버 연결 실패: ${error.message}`
      };
    }
  }

  /**
   * 사용 가능한 모델 확인
   */
  static async testAvailableModels(): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      console.log('🤖 사용 가능한 모델 확인 중...');
      const response = await getAvailableModels();
      
      return {
        success: true,
        message: '모델 목록 조회 성공!',
        data: response
      };
    } catch (error) {
      console.error('❌ 모델 목록 조회 실패:', error);
      return {
        success: false,
        message: `모델 목록 조회 실패: ${error.message}`
      };
    }
  }

  /**
   * 꿈 분석 테스트
   */
  static async testDreamAnalysis(): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      console.log('🔮 꿈 분석 테스트 중...');
      const testDream = "어젯밤에 하늘을 날아다니는 꿈을 꿨어요. 정말 자유롭고 평화로웠습니다.";
      
      const response = await analyzeDream(testDream, 'dialogpt-small');
      
      return {
        success: true,
        message: '꿈 분석 성공!',
        data: response
      };
    } catch (error) {
      console.error('❌ 꿈 분석 실패:', error);
      return {
        success: false,
        message: `꿈 분석 실패: ${error.message}`
      };
    }
  }

  /**
   * 전체 API 테스트
   */
  static async runFullTest(): Promise<{
    serverHealth: { success: boolean; message: string; data?: any };
    availableModels: { success: boolean; message: string; data?: any };
    dreamAnalysis: { success: boolean; message: string; data?: any };
    overallSuccess: boolean;
  }> {
    console.log('🚀 전체 API 테스트 시작...');
    
    const serverHealth = await this.testServerHealth();
    const availableModels = await this.testAvailableModels();
    const dreamAnalysis = await this.testDreamAnalysis();
    
    const overallSuccess = serverHealth.success && availableModels.success && dreamAnalysis.success;
    
    console.log('📊 테스트 결과:', {
      serverHealth: serverHealth.success,
      availableModels: availableModels.success,
      dreamAnalysis: dreamAnalysis.success,
      overallSuccess
    });
    
    return {
      serverHealth,
      availableModels,
      dreamAnalysis,
      overallSuccess
    };
  }

  /**
   * API 설정 정보 출력
   */
  static logAPIConfig(): void {
    console.log('⚙️ API 설정 정보:');
    console.log('Base URL:', API_CONFIG.baseURL);
    console.log('Timeout:', API_CONFIG.timeout);
    console.log('Endpoints:', API_CONFIG.endpoints);
  }
}
