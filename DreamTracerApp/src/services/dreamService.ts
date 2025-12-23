/**
 * 꿈 서비스
 */
import {
  Dream, DreamCreate, DreamUpdate, DreamListResponse,
  DreamStats, AudioUploadResponse, DreamAnalysis
} from '../types/dream';
import authService from './authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Config from '../config/config';

const { API_BASE_URL } = Config;

class DreamService {
  private async getAuthHeaders() {
    const token = await authService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  /**
   * 꿈 기록 생성
   */
  async createDream(dreamData: DreamCreate): Promise<Dream> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/dreams/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(dreamData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || '꿈 기록 생성에 실패했습니다');
      }

      return await response.json();
    } catch (error) {
      console.error('Create dream error:', error);
      throw error;
    }
  }

  /**
   * 꿈 목록 조회 (필터링 및 페이지네이션)
   */
  async getDreams(params: {
    skip?: number;
    limit?: number;
    start_date?: string;
    end_date?: string;
    dream_type?: string;
    emotion_filter?: string[];
  } = {}): Promise<DreamListResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const queryParams = new URLSearchParams();

      if (params.skip) queryParams.append('skip', params.skip.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.start_date) queryParams.append('start_date', params.start_date);
      if (params.end_date) queryParams.append('end_date', params.end_date);
      if (params.dream_type) queryParams.append('dream_type', params.dream_type);

      if (params.emotion_filter && params.emotion_filter.length > 0) {
        params.emotion_filter.forEach(tag => queryParams.append('emotion_filter', tag));
      }

      const response = await fetch(`${API_BASE_URL}/dreams/?${queryParams.toString()}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || '꿈 목록 조회에 실패했습니다');
      }

      return await response.json();
    } catch (error) {
      console.error('Get dreams error:', error);
      throw error;
    }
  }

  /**
   * 특정 꿈 상세 조회
   */
  async getDream(dreamId: string): Promise<Dream> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/dreams/${dreamId}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        // 404 handled by backend
        const error = await response.json();
        throw new Error(error.detail || '꿈을 찾을 수 없습니다');
      }

      return await response.json();
    } catch (error) {
      console.error('Get dream error:', error);
      throw error;
    }
  }

  /**
   * 꿈 기록 수정
   */
  async updateDream(dreamId: string, dreamUpdate: DreamUpdate): Promise<Dream> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/dreams/${dreamId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(dreamUpdate),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || '꿈 기록 수정에 실패했습니다');
      }

      return await response.json();
    } catch (error) {
      console.error('Update dream error:', error);
      throw error;
    }
  }

  /**
   * 꿈 기록 삭제
   */
  async deleteDream(dreamId: string): Promise<void> {
    try {
      const token = await authService.getToken();

      const response = await fetch(`${API_BASE_URL}/dreams/${dreamId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || '꿈 기록 삭제에 실패했습니다');
      }
    } catch (error) {
      console.error('Delete dream error:', error);
      throw error;
    }
  }

  /**
   * 꿈 AI 분석 요청
   */
  async analyzeDream(dreamId: string): Promise<DreamAnalysis> {
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
      console.error('Analyze dream error:', error);
      throw error;
    }
  }

  /**
   * 꿈 통계 조회
   */
  async getDreamStats(): Promise<DreamStats> {
    try {
      const token = await authService.getToken();

      const response = await fetch(`${API_BASE_URL}/dreams/stats/overview`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || '꿈 통계 조회에 실패했습니다');
      }

      return await response.json();
    } catch (error) {
      console.error('Get dream stats error:', error);
      throw error;
    }
  }

  /**
   * 오디오 파일 업로드
   */
  async uploadAudio(audioFile: any): Promise<AudioUploadResponse> {
    try {
      const token = await authService.getToken();

      const formData = new FormData();
      formData.append('audio_file', {
        uri: audioFile.uri,
        type: audioFile.type || 'audio/wav',
        name: audioFile.name || 'recording.wav',
      } as any);

      const response = await fetch(`${API_BASE_URL}/dreams/upload-audio`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || '오디오 업로드에 실패했습니다');
      }

      return await response.json();
    } catch (error) {
      console.error('Upload audio error:', error);
      throw error;
    }
  }

  /**
   * 꿈 내용 검색
   */
  async searchDreams(query: string, skip: number = 0, limit: number = 20): Promise<DreamListResponse> {
    try {
      const token = await authService.getToken();
      const queryParams = new URLSearchParams({
        q: query,
        skip: skip.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`${API_BASE_URL}/dreams/search?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || '꿈 검색에 실패했습니다');
      }

      return await response.json();
    } catch (error) {
      console.error('Search dreams error:', error);
      throw error;
    }
  }

  // 현대적 꿈 분석 요청
  async requestModernDreamAnalysis(dreamId: string): Promise<any> {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        throw new Error('인증 토큰이 없습니다');
      }

      const response = await fetch(`${API_BASE_URL}/dreams/${dreamId}/modern-analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || '현대적 꿈 분석 요청에 실패했습니다');
      }

      return await response.json();
    } catch (error) {
      console.error('Request modern dream analysis error:', error);
      throw error;
    }
  }

  // 현대적 꿈 분석 결과 조회
  async getModernDreamAnalysis(dreamId: string): Promise<any> {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        throw new Error('인증 토큰이 없습니다');
      }

      const response = await fetch(`${API_BASE_URL}/dreams/${dreamId}/modern-analysis`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || '현대적 꿈 분석 결과 조회에 실패했습니다');
      }

      return await response.json();
    } catch (error) {
      console.error('Get modern dream analysis error:', error);
      throw error;
    }
  }
}

export default new DreamService();
