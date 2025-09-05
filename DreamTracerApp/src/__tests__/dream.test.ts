/**
 * 꿈 기록 시스템 테스트
 */
import dreamService from '../services/dreamService';
import { useDreamStore } from '../stores/dreamStore';
import { DreamCreate, EmotionType } from '../types/dream';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('DreamService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createDream', () => {
    it('should create dream successfully', async () => {
      const mockDreamData: DreamCreate = {
        dream_date: '2024-01-15',
        title: '테스트 꿈',
        body_text: '이것은 테스트 꿈입니다.',
        lucidity_level: 3,
        emotion_tags: [EmotionType.HAPPY, EmotionType.PEACEFUL],
        is_shared: false,
        dream_type: 'normal',
        sleep_quality: 4,
        characters: ['친구'],
        symbols: ['바다'],
      };

      const mockResponse = {
        id: 'dream-123',
        user_id: 'user-123',
        dream_date: '2024-01-15',
        title: '테스트 꿈',
        body_text: '이것은 테스트 꿈입니다.',
        lucidity_level: 3,
        emotion_tags: ['happy', 'peaceful'],
        analysis_status: 'pending',
        is_shared: false,
        dream_type: 'normal',
        sleep_quality: 4,
        characters: ['친구'],
        symbols: ['바다'],
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await dreamService.createDream(mockDreamData);

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/dreams/',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': expect.any(String),
          }),
          body: JSON.stringify(mockDreamData),
        })
      );
    });

    it('should throw error when creation fails', async () => {
      const mockDreamData: DreamCreate = {
        dream_date: '2024-01-15',
        body_text: '테스트 꿈',
        emotion_tags: [],
        is_shared: false,
        characters: [],
        symbols: [],
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ detail: 'Validation error' }),
      });

      await expect(dreamService.createDream(mockDreamData)).rejects.toThrow('Validation error');
    });
  });

  describe('getDreams', () => {
    it('should fetch dreams with filters', async () => {
      const mockResponse = {
        dreams: [
          {
            id: 'dream-1',
            user_id: 'user-123',
            dream_date: '2024-01-15',
            title: '꿈 1',
            body_text: '첫 번째 꿈',
            emotion_tags: ['happy'],
            analysis_status: 'completed',
            is_shared: false,
            characters: [],
            symbols: [],
            created_at: '2024-01-15T10:00:00Z',
            updated_at: '2024-01-15T10:00:00Z',
          },
        ],
        total_count: 1,
        page: 1,
        page_size: 20,
        has_next: false,
        has_previous: false,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await dreamService.getDreams({
        skip: 0,
        limit: 20,
        dream_type: 'normal',
        emotion_filter: ['happy'],
      });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('http://localhost:8000/api/v1/dreams/'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': expect.any(String),
          }),
        })
      );
    });
  });

  describe('uploadAudio', () => {
    it('should upload audio file successfully', async () => {
      const mockAudioFile = {
        uri: 'file://test-audio.wav',
        type: 'audio/wav',
        name: 'test-audio.wav',
      };

      const mockResponse = {
        audio_file_path: 'audio/user-123/audio-456.wav',
        file_size: 1024000,
        duration: 30.5,
        upload_url: null,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await dreamService.uploadAudio(mockAudioFile);

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/dreams/upload-audio',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': expect.any(String),
            'Content-Type': 'multipart/form-data',
          }),
        })
      );
    });
  });
});

describe('DreamStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have initial state', () => {
    const state = useDreamStore.getState();
    
    expect(state.dreams).toEqual([]);
    expect(state.currentDream).toBe(null);
    expect(state.dreamStats).toBe(null);
    expect(state.isLoading).toBe(false);
    expect(state.isCreating).toBe(false);
    expect(state.error).toBe(null);
  });

  it('should create dream and update state', async () => {
    const mockDreamData: DreamCreate = {
      dream_date: '2024-01-15',
      body_text: '테스트 꿈',
      emotion_tags: [],
      is_shared: false,
      characters: [],
      symbols: [],
    };

    const mockCreatedDream = {
      id: 'dream-123',
      user_id: 'user-123',
      dream_date: '2024-01-15',
      body_text: '테스트 꿈',
      emotion_tags: [],
      analysis_status: 'pending',
      is_shared: false,
      characters: [],
      symbols: [],
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockCreatedDream),
    });

    const { createDream } = useDreamStore.getState();
    
    // 생성 시작
    const createPromise = createDream(mockDreamData);
    
    // 생성 중 상태 확인
    expect(useDreamStore.getState().isCreating).toBe(true);
    
    // 생성 완료 대기
    const result = await createPromise;
    
    // 최종 상태 확인
    const finalState = useDreamStore.getState();
    expect(finalState.dreams).toContain(mockCreatedDream);
    expect(finalState.isCreating).toBe(false);
    expect(result).toEqual(mockCreatedDream);
  });

  it('should handle creation error', async () => {
    const mockDreamData: DreamCreate = {
      dream_date: '2024-01-15',
      body_text: '테스트 꿈',
      emotion_tags: [],
      is_shared: false,
      characters: [],
      symbols: [],
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ detail: 'Creation failed' }),
    });

    const { createDream } = useDreamStore.getState();
    
    try {
      await createDream(mockDreamData);
    } catch (error) {
      // 에러 처리
    }
    
    const finalState = useDreamStore.getState();
    expect(finalState.error).toBe('Creation failed');
    expect(finalState.isCreating).toBe(false);
  });
});
