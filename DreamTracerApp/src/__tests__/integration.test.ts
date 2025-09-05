/**
 * 전체 시스템 통합 테스트
 */
import dreamService from '../services/dreamService';
import analysisService from '../services/analysisService';
import visualizationService from '../services/visualizationService';
import { useDreamStore } from '../stores/dreamStore';
import { useAnalysisStore } from '../stores/analysisStore';
import { EmotionType } from '../types/dream';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Dream Workflow', () => {
    it('should complete full dream workflow', async () => {
      // Mock successful responses
      const mockDream = {
        id: 'dream-123',
        user_id: 'user-123',
        dream_date: '2024-01-15',
        title: '통합 테스트 꿈',
        body_text: '이것은 통합 테스트용 꿈입니다.',
        lucidity_level: 4,
        emotion_tags: [EmotionType.HAPPY, EmotionType.PEACEFUL],
        analysis_status: 'pending',
        is_shared: false,
        dream_type: 'normal',
        sleep_quality: 5,
        characters: ['친구'],
        symbols: ['바다'],
        location: '해변',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
      };

      const mockAnalysis = {
        id: 'analysis-123',
        dream_id: 'dream-123',
        summary_text: '바다에서 친구와 함께 놀던 행복한 꿈',
        keywords: ['바다', '친구', '행복'],
        emotional_flow_text: '평화롭고 행복한 감정이 지속되었습니다',
        symbol_analysis: {
          symbols: [
            {
              symbol: '바다',
              interpretation: '무의식의 깊이와 감정의 흐름을 상징',
              significance: '마음의 평정과 깊은 감정을 나타냄'
            }
          ]
        },
        reflective_question: '이 꿈이 당신에게 어떤 의미를 주나요?',
        deja_vu_analysis: {
          related_dreams: [],
          total_compared: 0
        },
        created_at: '2024-01-15T10:05:00Z'
      };

      const mockVisualization = {
        id: 'viz-123',
        dream_id: 'dream-123',
        image_path: 'visualizations/dream_visualization_123.jpg',
        art_style: 'surreal',
        created_at: '2024-01-15T10:10:00Z'
      };

      // Mock API responses
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockDream),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ task_id: 'task-123', status: 'processing' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockAnalysis),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ visualization: mockVisualization }),
        });

      // 1. 꿈 생성
      const dreamData = {
        dream_date: '2024-01-15',
        title: '통합 테스트 꿈',
        body_text: '이것은 통합 테스트용 꿈입니다.',
        lucidity_level: 4,
        emotion_tags: [EmotionType.HAPPY, EmotionType.PEACEFUL],
        is_shared: false,
        dream_type: 'normal',
        sleep_quality: 5,
        characters: ['친구'],
        symbols: ['바다'],
        location: '해변'
      };

      const createdDream = await dreamService.createDream(dreamData);
      expect(createdDream).toEqual(mockDream);

      // 2. 꿈 분석 요청
      const analysisRequest = await analysisService.requestDreamAnalysis(createdDream.id);
      expect(analysisRequest.task_id).toBe('task-123');

      // 3. 꿈 시각화 생성
      const visualization = await visualizationService.createDreamVisualization(
        createdDream.id, 
        'surreal'
      );
      expect(visualization).toEqual(mockVisualization);

      // 4. 분석 결과 조회
      const analysis = await analysisService.getDreamAnalysis(createdDream.id);
      expect(analysis.summary_text).toBe('바다에서 친구와 함께 놀던 행복한 꿈');

      console.log('✅ 완전한 꿈 워크플로우 테스트 성공!');
    });
  });

  describe('Store Integration', () => {
    it('should integrate dream and analysis stores', async () => {
      const mockDreams = [
        {
          id: 'dream-1',
          user_id: 'user-123',
          dream_date: '2024-01-15',
          title: '첫 번째 꿈',
          body_text: '첫 번째 꿈 내용',
          emotion_tags: [EmotionType.HAPPY],
          analysis_status: 'completed',
          is_shared: false,
          characters: [],
          symbols: [],
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
        },
        {
          id: 'dream-2',
          user_id: 'user-123',
          dream_date: '2024-01-14',
          title: '두 번째 꿈',
          body_text: '두 번째 꿈 내용',
          emotion_tags: ['sad'],
          analysis_status: 'pending',
          is_shared: false,
          characters: [],
          symbols: [],
          created_at: '2024-01-14T10:00:00Z',
          updated_at: '2024-01-14T10:00:00Z',
        }
      ];

      const mockAnalysis = {
        id: 'analysis-1',
        dream_id: 'dream-1',
        summary_text: '첫 번째 꿈 분석',
        keywords: ['키워드1', '키워드2'],
        emotional_flow_text: '감정 흐름 분석',
        symbol_analysis: {},
        reflective_question: '반성적 질문',
        deja_vu_analysis: {},
        created_at: '2024-01-15T10:05:00Z'
      };

      // Mock API responses
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            dreams: mockDreams,
            total_count: 2,
            page: 1,
            page_size: 20,
            has_next: false,
            has_previous: false
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockAnalysis),
        });

      // Dream store 테스트
      const { fetchDreams, setCurrentDream } = useDreamStore.getState();
      await fetchDreams();
      
      const dreamState = useDreamStore.getState();
      expect(dreamState.dreams).toHaveLength(2);
      expect(dreamState.totalCount).toBe(2);

      // Analysis store 테스트
      const { getDreamAnalysis } = useAnalysisStore.getState();
      await getDreamAnalysis('dream-1');
      
      const analysisState = useAnalysisStore.getState();
      expect(analysisState.currentAnalysis).toBeDefined();
      expect(analysisState.currentAnalysis?.summary_text).toBe('첫 번째 꿈 분석');

      console.log('✅ Store 통합 테스트 성공!');
    });
  });

  describe('Service Integration', () => {
    it('should handle service errors gracefully', async () => {
      // Mock error response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ detail: 'Network error' }),
      });

      try {
        await dreamService.getDreams();
      } catch (error) {
        expect((error as Error).message).toBe('Network error');
      }

      // Mock timeout error
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Request timeout'));

      try {
        await analysisService.getDailyInsights();
      } catch (error) {
        expect((error as Error).message).toBe('Request timeout');
      }

      console.log('✅ 에러 처리 통합 테스트 성공!');
    });
  });

  describe('Data Flow Integration', () => {
    it('should maintain data consistency across services', async () => {
      const mockDream = {
        id: 'dream-123',
        user_id: 'user-123',
        dream_date: '2024-01-15',
        title: '데이터 일관성 테스트 꿈',
        body_text: '데이터 일관성을 테스트하는 꿈입니다.',
        emotion_tags: [EmotionType.HAPPY],
        analysis_status: 'pending',
        is_shared: false,
        characters: [],
        symbols: [],
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
      };

      // Mock consistent responses
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockDream),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockDream),
        });

      // 꿈 생성
      const createdDream = await dreamService.createDream({
        dream_date: '2024-01-15',
        title: '데이터 일관성 테스트 꿈',
        body_text: '데이터 일관성을 테스트하는 꿈입니다.',
        emotion_tags: [EmotionType.HAPPY],
        is_shared: false,
        characters: [],
        symbols: []
      });

      // 꿈 조회
      const retrievedDream = await dreamService.getDream(createdDream.id);

      // 데이터 일관성 확인
      expect(createdDream.id).toBe(retrievedDream.id);
      expect(createdDream.title).toBe(retrievedDream.title);
      expect(createdDream.body_text).toBe(retrievedDream.body_text);

      console.log('✅ 데이터 일관성 테스트 성공!');
    });
  });
});
