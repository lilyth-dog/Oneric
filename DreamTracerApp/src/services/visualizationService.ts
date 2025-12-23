/**
 * 꿈 시각화 서비스
 */
import apiClient from './apiClient';
import Config from '../config/config';

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
  /**
   * 꿈 시각화 생성
   */
  async createDreamVisualization(dreamId: string, artStyle: string): Promise<DreamVisualization> {
    const result = await apiClient.request<{ visualization: DreamVisualization }>(
      `/dreams/${dreamId}/visualize?art_style=${artStyle}`,
      { method: 'POST' }
    );
    return result.visualization;
  }

  /**
   * 꿈의 모든 시각화 조회
   */
  async getDreamVisualizations(dreamId: string): Promise<DreamVisualization[]> {
    const result = await apiClient.request<{ visualizations: DreamVisualization[] }>(
      `/dreams/${dreamId}/visualizations`,
      { method: 'GET' }
    );
    return result.visualizations;
  }

  /**
   * 사용 가능한 미술 스타일 목록 조회
   */
  async getVisualizationStyles(): Promise<VisualizationStyle[]> {
    const result = await apiClient.request<{ styles: VisualizationStyle[] }>(
      '/visualization/styles',
      { method: 'GET' }
    );
    return result.styles;
  }

  /**
   * 시각화 삭제
   */
  async deleteVisualization(visualizationId: string): Promise<void> {
    await apiClient.request(
      `/visualizations/${visualizationId}`,
      { method: 'DELETE' }
    );
  }

  /**
   * 시각화 갤러리 조회
   */
  async getVisualizationGallery(skip: number = 0, limit: number = 20): Promise<VisualizationGallery> {
    return apiClient.request<VisualizationGallery>(
      `/visualizations/gallery?skip=${skip}&limit=${limit}`,
      { method: 'GET' }
    );
  }

  /**
   * 이미지 URL 생성 (실제 구현에서는 클라우드 스토리지 URL 사용)
   */
  getImageUrl(imagePath: string): string {
    // http로 시작하면 그대로 반환 (이미 전체 URL인 경우)
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `${Config.API_BASE_URL}/static/${imagePath}`;
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
