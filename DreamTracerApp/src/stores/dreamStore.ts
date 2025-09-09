/**
 * 꿈 상태 관리 (Zustand)
 */
import { create } from 'zustand';
import { Dream, DreamCreate, DreamUpdate, DreamListResponse, DreamStats } from '../types/dream';
import dreamService from '../services/dreamService';

interface DreamStore {
  // State
  dreams: Dream[];
  currentDream: Dream | null;
  dreamStats: DreamStats | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  totalCount: number;

  // Computed
  recentDreams: Dream[];

  // Actions
  fetchDreams: (params?: any) => Promise<void>;
  getDreams: () => Promise<void>;
  fetchDream: (dreamId: string) => Promise<void>;
  createDream: (dreamData: DreamCreate) => Promise<Dream>;
  updateDream: (dreamId: string, dreamUpdate: DreamUpdate) => Promise<Dream>;
  deleteDream: (dreamId: string) => Promise<void>;
  fetchDreamStats: () => Promise<void>;
  searchDreams: (query: string) => Promise<void>;
  setCurrentDream: (dream: Dream | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useDreamStore = create<DreamStore>((set, _get) => ({
  // Initial state
  dreams: [],
  currentDream: null,
  dreamStats: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  currentPage: 1,
  totalPages: 0,
  hasNext: false,
  hasPrevious: false,
  totalCount: 0,

  // Actions
  fetchDreams: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response: DreamListResponse = await dreamService.getDreams(params);
      
      set({
        dreams: response.dreams,
        currentPage: response.page,
        totalPages: Math.ceil(response.total_count / response.page_size),
        hasNext: response.has_next,
        hasPrevious: response.has_previous,
        totalCount: response.total_count,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '꿈 목록을 불러오는데 실패했습니다',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchDream: async (dreamId: string) => {
    set({ isLoading: true, error: null });
    try {
      const dream = await dreamService.getDream(dreamId);
      
      set({
        currentDream: dream,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '꿈을 불러오는데 실패했습니다',
        isLoading: false,
      });
      throw error;
    }
  },

  createDream: async (dreamData: DreamCreate) => {
    set({ isCreating: true, error: null });
    try {
      const newDream = await dreamService.createDream(dreamData);
      
      set((state) => ({
        dreams: [newDream, ...state.dreams],
        isCreating: false,
      }));
      
      return newDream;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '꿈 기록 생성에 실패했습니다',
        isCreating: false,
      });
      throw error;
    }
  },

  updateDream: async (dreamId: string, dreamUpdate: DreamUpdate) => {
    set({ isUpdating: true, error: null });
    try {
      const updatedDream = await dreamService.updateDream(dreamId, dreamUpdate);
      
      set((state) => ({
        dreams: state.dreams.map(dream => 
          dream.id === dreamId ? updatedDream : dream
        ),
        currentDream: state.currentDream?.id === dreamId ? updatedDream : state.currentDream,
        isUpdating: false,
      }));
      
      return updatedDream;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '꿈 기록 수정에 실패했습니다',
        isUpdating: false,
      });
      throw error;
    }
  },

  deleteDream: async (dreamId: string) => {
    set({ isDeleting: true, error: null });
    try {
      await dreamService.deleteDream(dreamId);
      
      set((state) => ({
        dreams: state.dreams.filter(dream => dream.id !== dreamId),
        currentDream: state.currentDream?.id === dreamId ? null : state.currentDream,
        isDeleting: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '꿈 기록 삭제에 실패했습니다',
        isDeleting: false,
      });
      throw error;
    }
  },

  fetchDreamStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const stats = await dreamService.getDreamStats();
      
      set({
        dreamStats: stats,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '꿈 통계를 불러오는데 실패했습니다',
        isLoading: false,
      });
      throw error;
    }
  },

  searchDreams: async (query: string) => {
    set({ isLoading: true, error: null });
    try {
      const response: DreamListResponse = await dreamService.searchDreams(query);
      
      set({
        dreams: response.dreams,
        currentPage: response.page,
        totalPages: Math.ceil(response.total_count / response.page_size),
        hasNext: response.has_next,
        hasPrevious: response.has_previous,
        totalCount: response.total_count,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '꿈 검색에 실패했습니다',
        isLoading: false,
      });
      throw error;
    }
  },

  setCurrentDream: (dream: Dream | null) => {
    set({ currentDream: dream });
  },

  clearError: () => {
    set({ error: null });
  },

  getDreams: async () => {
    set({ isLoading: true });
    try {
      const result = await dreamService.getDreams();
      set({
        dreams: result.dreams,
        currentPage: result.page,
        totalPages: Math.ceil(result.total_count / result.page_size),
        hasNext: result.has_next,
        hasPrevious: result.has_previous,
        totalCount: result.total_count,
        isLoading: false,
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch dreams',
        isLoading: false 
      });
    }
  },

  get recentDreams() {
    const { dreams } = _get();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return dreams.filter(dream => 
      new Date(dream.created_at) >= oneWeekAgo
    ).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  reset: () => {
    set({
      dreams: [],
      currentDream: null,
      dreamStats: null,
      isLoading: false,
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
      error: null,
      currentPage: 1,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
      totalCount: 0,
    });
  },
}));
