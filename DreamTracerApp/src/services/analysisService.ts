/**
 * AI 분석 서비스
 */
import { DreamAnalysis } from '../types/dream';
import authService from './authService';

// Android 에뮬레이터에서는 localhost 대신 10.0.2.2 사용
const API_BASE_URL = __DEV__ ? 'http://10.0.2.2:8000/api/v1' : 'http://localhost:8000/api/v1';

interface AnalysisTaskStatus {
  task_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message: string;
  progress?: any;
  result?: any;
  error?: string;
}

interface DailyInsight {
  insight: string;
  pattern: string;
  recommendation: string;
}

interface DreamPatterns {
  analysis_period: string;
  total_dreams: number;
  patterns: {
    emotions: Array<{ emotion: string; count: number }>;
    symbols: Array<{ symbol: string; count: number }>;
    characters: Array<{ character: string; count: number }>;
    dream_types: Array<{ type: string; count: number }>;
    average_lucidity: number;
  };
}

interface DreamNetwork {
  network: Array<{
    dream1: { id: string; title: string; date: string };
    dream2: { id: string; title: string; date: string };
    similarity: number;
  }>;
  total_connections: number;
}

class AnalysisService {
  private async getAuthHeaders() {
    const token = await authService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  /**
   * 꿈 분석 결과 조회
   */
  async getDreamAnalysis(dreamId: string): Promise<DreamAnalysis> {
    try {
      const token = await authService.getToken();
      
      const response = await fetch(`${API_BASE_URL}/dreams/${dreamId}/analysis`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || '꿈 분석 결과를 불러오는데 실패했습니다');
      }

      return await response.json();
    } catch (error) {
      console.error('Get dream analysis error:', error);
      throw error;
    }
  }

  /**
   * 꿈 AI 분석 요청
   */
  async requestDreamAnalysis(dreamId: string): Promise<{ task_id: string; status: string }> {
    try {
      const token = await authService.getToken();
      
      const response = await fetch(`${API_BASE_URL}/dreams/${dreamId}/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || '꿈 분석 요청에 실패했습니다');
      }

      return await response.json();
    } catch (error) {
      console.error('Request dream analysis error:', error);
      throw error;
    }
  }

  /**
   * 분석 태스크 상태 조회
   */
  async getAnalysisTaskStatus(taskId: string): Promise<AnalysisTaskStatus> {
    try {
      const response = await fetch(`${API_BASE_URL}/analysis/task/${taskId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || '태스크 상태 조회에 실패했습니다');
      }

      return await response.json();
    } catch (error) {
      console.error('Get task status error:', error);
      throw error;
    }
  }

  /**
   * 일일 인사이트 조회
   */
  async getDailyInsights(): Promise<{ insight: DailyInsight; date: string }> {
    try {
      const token = await authService.getToken();
      
      const response = await fetch(`${API_BASE_URL}/analysis/insights/daily`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || '일일 인사이트 조회에 실패했습니다');
      }

      return await response.json();
    } catch (error) {
      console.error('Get daily insights error:', error);
      throw error;
    }
  }

  /**
   * 꿈 패턴 분석
   */
  async getDreamPatterns(days: number = 30): Promise<DreamPatterns> {
    try {
      const token = await authService.getToken();
      
      const response = await fetch(`${API_BASE_URL}/analysis/patterns?days=${days}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || '꿈 패턴 분석에 실패했습니다');
      }

      return await response.json();
    } catch (error) {
      console.error('Get dream patterns error:', error);
      throw error;
    }
  }

  /**
   * 꿈 네트워크 분석
   */
  async getDreamNetwork(): Promise<DreamNetwork> {
    try {
      const token = await authService.getToken();
      
      const response = await fetch(`${API_BASE_URL}/analysis/network`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || '꿈 네트워크 분석에 실패했습니다');
      }

      return await response.json();
    } catch (error) {
      console.error('Get dream network error:', error);
      throw error;
    }
  }

  /**
   * 분석 상태 폴링 (실시간 업데이트)
   */
  async pollAnalysisStatus(
    taskId: string,
    onUpdate: (status: AnalysisTaskStatus) => void,
    onComplete: (result: any) => void,
    onError: (error: string) => void,
    interval: number = 2000
  ): Promise<void> {
    const poll = async () => {
      try {
        const status = await this.getAnalysisTaskStatus(taskId);
        onUpdate(status);

        if (status.status === 'completed') {
          onComplete(status.result);
          return;
        } else if (status.status === 'failed') {
          onError(status.error || '분석에 실패했습니다');
          return;
        } else if (status.status === 'processing' || status.status === 'pending') {
          // 계속 폴링
          setTimeout(poll, interval);
        }
      } catch (error) {
        onError(error instanceof Error ? error.message : '상태 조회 중 오류가 발생했습니다');
      }
    };

    poll();
  }
}

export default new AnalysisService();
