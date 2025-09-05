/**
 * 꿈 시각화 서비스
 */
import authService from './authService';

const API_BASE_URL = 'http://localhost:8000/api/v1';

interface VisualizationStyle {
  key: string;
  name: string;
}

interface DreamVisualization {
  id: string;
  dream_id: string;
  image_path: string;
  art_style: string;
  created_at: string;
}

interface VisualizationGallery {
  visualizations: Array<{
    id: string;
    dream_id: string;
    dream_title: string;
    image_path: string;
    art_style: string;
    created_at: string;
  }>;
  total_count: number;
  page: number;
  page_size: number;
}

class VisualizationService {
  private async getAuthHeaders() {
    const token = await authService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  /**
   * 꿈 시각화 생성
   */
  async createDreamVisualization(dreamId: string, artStyle: string): Promise<DreamVisualization> {
    try {
      const token = await authService.getToken();
      
      const response = await fetch(`${API_BASE_URL}/dreams/${dreamId}/visualize?art_style=${artStyle}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || '꿈 시각화 생성에 실패했습니다');
      }

      const result = await response.json();
      return result.visualization;
    } catch (error) {
      console.error('Create dream visualization error:', error);
      throw error;
    }
  }

  /**
   * 꿈의 모든 시각화 조회
   */
  async getDreamVisualizations(dreamId: string): Promise<DreamVisualization[]> {
    try {
      const token = await authService.getToken();
      
      const response = await fetch(`${API_BASE_URL}/dreams/${dreamId}/visualizations`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || '꿈 시각화 조회에 실패했습니다');
      }

      const result = await response.json();
      return result.visualizations;
    } catch (error) {
      console.error('Get dream visualizations error:', error);
      throw error;
    }
  }

  /**
   * 사용 가능한 미술 스타일 목록 조회
   */
  async getVisualizationStyles(): Promise<VisualizationStyle[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/visualization/styles`, {
        method: 'GET',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || '스타일 목록 조회에 실패했습니다');
      }

      const result = await response.json();
      return result.styles;
    } catch (error) {
      console.error('Get visualization styles error:', error);
      throw error;
    }
  }

  /**
   * 시각화 삭제
   */
  async deleteVisualization(visualizationId: string): Promise<void> {
    try {
      const token = await authService.getToken();
      
      const response = await fetch(`${API_BASE_URL}/visualizations/${visualizationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || '시각화 삭제에 실패했습니다');
      }
    } catch (error) {
      console.error('Delete visualization error:', error);
      throw error;
    }
  }

  /**
   * 시각화 갤러리 조회
   */
  async getVisualizationGallery(skip: number = 0, limit: number = 20): Promise<VisualizationGallery> {
    try {
      const token = await authService.getToken();
      
      const response = await fetch(`${API_BASE_URL}/visualizations/gallery?skip=${skip}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || '시각화 갤러리 조회에 실패했습니다');
      }

      return await response.json();
    } catch (error) {
      console.error('Get visualization gallery error:', error);
      throw error;
    }
  }

  /**
   * 이미지 URL 생성 (실제 구현에서는 클라우드 스토리지 URL 사용)
   */
  getImageUrl(imagePath: string): string {
    // 실제 구현에서는 클라우드 스토리지 URL 반환
    // 여기서는 로컬 파일 경로 시뮬레이션
    return `${API_BASE_URL}/static/${imagePath}`;
  }

  /**
   * 스타일별 한국어 이름 매핑
   */
  getStyleKoreanName(styleKey: string): string {
    const styleNames: Record<string, string> = {
      'realistic': '사실적',
      'impressionist': '인상주의',
      'surreal': '초현실주의',
      'watercolor': '수채화',
      'oil_painting': '유화',
      'digital_art': '디지털 아트',
      'anime': '애니메이션',
      'fantasy': '판타지',
      'minimalist': '미니멀리스트',
      'abstract': '추상화'
    };
    
    return styleNames[styleKey] || styleKey;
  }
}

export default new VisualizationService();
