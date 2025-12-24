/**
 * 꿈 서비스
 * 꿈 기록 통합 관리 및 AI 분석 연동
 */
import {
  Dream, DreamCreate, DreamUpdate, DreamListResponse,
  DreamStats, AudioUploadResponse, DreamAnalysis
} from '../types/dream';
import apiClient from './apiClient';

class DreamService {
  /**
   * 꿈 기록 생성
   */
  async createDream(dreamData: DreamCreate): Promise<Dream> {
    return apiClient.request<Dream>('/dreams/', {
      method: 'POST',
      body: JSON.stringify(dreamData),
    });
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
    const queryParams = new URLSearchParams();

    if (params.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    if (params.dream_type) queryParams.append('dream_type', params.dream_type);

    if (params.emotion_filter && params.emotion_filter.length > 0) {
      params.emotion_filter.forEach(tag => queryParams.append('emotion_filter', tag));
    }

    const queryString = queryParams.toString();
    return apiClient.request<DreamListResponse>(`/dreams/?${queryString}`, {
      method: 'GET',
    });
  }

  /**
   * 특정 꿈 상세 조회
   */
  async getDream(dreamId: string): Promise<Dream> {
    return apiClient.request<Dream>(`/dreams/${dreamId}`, {
      method: 'GET',
    });
  }

  /**
   * 꿈 기록 수정
   */
  async updateDream(dreamId: string, dreamUpdate: DreamUpdate): Promise<Dream> {
    return apiClient.request<Dream>(`/dreams/${dreamId}`, {
      method: 'PUT',
      body: JSON.stringify(dreamUpdate),
    });
  }

  /**
   * 꿈 기록 삭제
   */
  async deleteDream(dreamId: string): Promise<void> {
    return apiClient.request<void>(`/dreams/${dreamId}`, {
      method: 'DELETE',
    });
  }

  /**
   * 꿈 AI 분석 요청
   */
  async analyzeDream(dreamId: string): Promise<DreamAnalysis> {
    return apiClient.request<DreamAnalysis>(`/dreams/${dreamId}/analyze`, {
      method: 'POST',
    });
  }

  /**
   * 꿈 통계 조회
   */
  async getDreamStats(): Promise<DreamStats> {
    return apiClient.request<DreamStats>('/dreams/stats/overview', {
      method: 'GET',
    });
  }

  /**
   * 오디오 파일 업로드
   */
  async uploadAudio(audioFile: { uri: string; type?: string; name?: string }): Promise<AudioUploadResponse> {
    const formData = new FormData();
    formData.append('audio_file', {
      uri: audioFile.uri,
      type: audioFile.type || 'audio/wav',
      name: audioFile.name || 'recording.wav',
    } as any);

    return apiClient.request<AudioUploadResponse>('/dreams/upload-audio', {
      method: 'POST',
      body: formData,
    });
  }

  /**
   * 꿈 내용 검색
   */
  async searchDreams(query: string, skip: number = 0, limit: number = 20): Promise<DreamListResponse> {
    const queryParams = new URLSearchParams({
      q: query,
      skip: skip.toString(),
      limit: limit.toString(),
    });

    return apiClient.request<DreamListResponse>(`/dreams/search?${queryParams.toString()}`, {
      method: 'GET',
    });
  }

  /**
   * 현대적 꿈 분석 요청
   */
  async requestModernDreamAnalysis(dreamId: string): Promise<any> {
    return apiClient.request<any>(`/dreams/${dreamId}/modern-analyze`, {
      method: 'POST',
    });
  }

  /**
   * 현대적 꿈 분석 결과 조회
   */
  async getModernDreamAnalysis(dreamId: string): Promise<any> {
    return apiClient.request<any>(`/dreams/${dreamId}/modern-analysis`, {
      method: 'GET',
    });
  }
}

export default new DreamService();
