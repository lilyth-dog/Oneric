/**
 * 꿈 서비스
 */
import { 
  Dream, DreamCreate, DreamUpdate, DreamListResponse, 
  DreamStats, AudioUploadResponse, DreamAnalysis 
} from '../types/dream';
import authService from './authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Android 에뮬레이터에서는 localhost 대신 10.0.2.2 사용
const API_BASE_URL = __DEV__ ? 'http://10.0.2.2:8000/api/v1' : 'http://localhost:8000/api/v1';

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
      // 로컬 개발용 - AsyncStorage에 저장
      console.log('Creating dream:', dreamData);
      
      const newDream: Dream = {
        id: 'dream_' + Date.now(),
        user_id: 'user_' + Date.now(),
        title: dreamData.title || '제목 없는 꿈',
        body_text: dreamData.body_text || '',
        dream_date: dreamData.dream_date,
        dream_type: dreamData.dream_type || 'normal',
        lucidity_level: dreamData.lucidity_level || 1,
        sleep_quality: dreamData.sleep_quality || 3,
        emotion_tags: dreamData.emotion_tags || [],
        symbols: dreamData.symbols || [],
        characters: dreamData.characters || [],
        location: dreamData.location || '',
        audio_file_path: dreamData.audio_file_path || undefined,
        analysis_status: 'pending',
        is_shared: dreamData.is_shared || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // 로컬 저장소에 저장
      const existingDreams = await AsyncStorage.getItem('dreams');
      const dreams = existingDreams ? JSON.parse(existingDreams) : [];
      dreams.push(newDream);
      await AsyncStorage.setItem('dreams', JSON.stringify(dreams));

      return newDream;
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
      // 로컬 개발용 - AsyncStorage에서 조회
      const existingDreams = await AsyncStorage.getItem('dreams');
      let dreams = existingDreams ? JSON.parse(existingDreams) : [];

      // 필터링 적용
      if (params.dream_type) {
        dreams = dreams.filter((dream: Dream) => dream.dream_type === params.dream_type);
      }
      
      if (params.emotion_filter && params.emotion_filter.length > 0) {
        dreams = dreams.filter((dream: Dream) => 
          dream.emotion_tags?.some(emotion => params.emotion_filter!.includes(emotion))
        );
      }

      // 날짜 필터링
      if (params.start_date) {
        dreams = dreams.filter((dream: Dream) => dream.dream_date >= params.start_date!);
      }
      if (params.end_date) {
        dreams = dreams.filter((dream: Dream) => dream.dream_date <= params.end_date!);
      }

      // 정렬 (최신순)
      dreams.sort((a: Dream, b: Dream) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      // 페이지네이션
      const skip = params.skip || 0;
      const limit = params.limit || 20;
      const paginatedDreams = dreams.slice(skip, skip + limit);

      return {
        dreams: paginatedDreams,
        total_count: dreams.length,
        total: dreams.length,
        page: Math.floor(skip / limit) + 1,
        page_size: limit,
        has_next: skip + limit < dreams.length,
        has_previous: skip > 0,
      };
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
      // 로컬 개발용 - AsyncStorage에서 조회
      const existingDreams = await AsyncStorage.getItem('dreams');
      const dreams = existingDreams ? JSON.parse(existingDreams) : [];
      
      const dream = dreams.find((d: Dream) => d.id === dreamId);
      if (!dream) {
        throw new Error('꿈을 찾을 수 없습니다');
      }

      return dream;
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
