/**
 * AI 분석 상태 관리 (Zustand)
 */
import { create } from 'zustand';
import { DreamAnalysis } from '../types/dream';
import analysisService from '../services/analysisService';

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

interface AnalysisStore {
  // State
  currentAnalysis: DreamAnalysis | null;
  dailyInsights: DailyInsight | null;
  dreamPatterns: DreamPatterns | null;
  dreamNetwork: DreamNetwork | null;
  isLoading: boolean;
  isAnalyzing: boolean;
  error: string | null;
  
  // Task tracking
  activeTasks: Map<string, AnalysisTaskStatus>;
  
  // Actions
  getDreamAnalysis: (dreamId: string) => Promise<void>;
  requestDreamAnalysis: (dreamId: string) => Promise<string>;
  getDailyInsights: () => Promise<void>;
  getDreamPatterns: (days?: number) => Promise<void>;
  getDreamNetwork: () => Promise<void>;
  pollAnalysisStatus: (
    taskId: string,
    onComplete: (result: any) => void,
    onError: (error: string) => void
  ) => void;
  setCurrentAnalysis: (analysis: DreamAnalysis | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useAnalysisStore = create<AnalysisStore>((set, get) => ({
  // Initial state
  currentAnalysis: null,
  dailyInsights: null,
  dreamPatterns: null,
  dreamNetwork: null,
  isLoading: false,
  isAnalyzing: false,
  error: null,
  activeTasks: new Map(),

  // Actions
  getDreamAnalysis: async (dreamId: string) => {
    set({ isLoading: true, error: null });
    try {
      const analysis = await analysisService.getDreamAnalysis(dreamId);
      
      set({
        currentAnalysis: analysis,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '꿈 분석 결과를 불러오는데 실패했습니다',
        isLoading: false,
      });
      throw error;
    }
  },

  requestDreamAnalysis: async (dreamId: string) => {
    set({ isAnalyzing: true, error: null });
    try {
      const result = await analysisService.requestDreamAnalysis(dreamId);
      
      set({
        isAnalyzing: false,
      });
      
      return result.task_id;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '꿈 분석 요청에 실패했습니다',
        isAnalyzing: false,
      });
      throw error;
    }
  },

  getDailyInsights: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await analysisService.getDailyInsights();
      
      set({
        dailyInsights: response.insight,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '일일 인사이트를 불러오는데 실패했습니다',
        isLoading: false,
      });
      throw error;
    }
  },

  getDreamPatterns: async (days: number = 30) => {
    set({ isLoading: true, error: null });
    try {
      const patterns = await analysisService.getDreamPatterns(days);
      
      set({
        dreamPatterns: patterns,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '꿈 패턴 분석에 실패했습니다',
        isLoading: false,
      });
      throw error;
    }
  },

  getDreamNetwork: async () => {
    set({ isLoading: true, error: null });
    try {
      const network = await analysisService.getDreamNetwork();
      
      set({
        dreamNetwork: network,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '꿈 네트워크 분석에 실패했습니다',
        isLoading: false,
      });
      throw error;
    }
  },

  pollAnalysisStatus: (
    taskId: string,
    onComplete: (result: any) => void,
    onError: (error: string) => void
  ) => {
    analysisService.pollAnalysisStatus(
      taskId,
      (status) => {
        // 태스크 상태 업데이트
        set((state) => {
          const newTasks = new Map(state.activeTasks);
          newTasks.set(taskId, status);
          return { activeTasks: newTasks };
        });
      },
      (result) => {
        onComplete(result);
        // 태스크 완료 시 제거
        set((state) => {
          const newTasks = new Map(state.activeTasks);
          newTasks.delete(taskId);
          return { activeTasks: newTasks };
        });
      },
      (error) => {
        onError(error);
        // 태스크 실패 시 제거
        set((state) => {
          const newTasks = new Map(state.activeTasks);
          newTasks.delete(taskId);
          return { activeTasks: newTasks };
        });
      }
    );
  },

  setCurrentAnalysis: (analysis: DreamAnalysis | null) => {
    set({ currentAnalysis: analysis });
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set({
      currentAnalysis: null,
      dailyInsights: null,
      dreamPatterns: null,
      dreamNetwork: null,
      isLoading: false,
      isAnalyzing: false,
      error: null,
      activeTasks: new Map(),
    });
  },
}));
