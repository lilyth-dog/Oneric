/**
 * 하이브리드 데이터 매니저
 * 로컬 저장과 서버 동기화를 통합 관리
 */
import { LocalDreamData, ServerDreamData, CommunityPost, UserPlan, SubscriptionPlan } from '../types/storage';
import localStorageService from './localStorageService';
import serverSyncService from './serverSyncService';

class HybridDataManager {
  // 꿈 데이터 생성 (로컬 저장 + 서버 동기화)
  async createDream(dreamData: Omit<LocalDreamData, 'id' | 'created_at' | 'updated_at' | 'is_synced'>): Promise<LocalDreamData> {
    try {
      // 로컬에 먼저 저장
      const localDream: LocalDreamData = {
        ...dreamData,
        id: this.generateId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_synced: false
      };

      await localStorageService.saveDreamLocally(localDream);

      // 네트워크가 사용 가능하면 서버에 동기화
      if (await serverSyncService.isNetworkAvailable()) {
        try {
          await serverSyncService.syncDreamToServer(localDream);
        } catch (error) {
          console.warn('서버 동기화 실패, 로컬에만 저장됨:', error);
        }
      }

      return localDream;
    } catch (error) {
      console.error('꿈 데이터 생성 실패:', error);
      throw error;
    }
  }

  // 꿈 데이터 조회 (로컬에서 조회)
  async getDream(dreamId: string): Promise<LocalDreamData | null> {
    try {
      return await localStorageService.getLocalDream(dreamId);
    } catch (error) {
      console.error('꿈 데이터 조회 실패:', error);
      return null;
    }
  }

  // 꿈 목록 조회 (로컬에서 조회)
  async getDreams(): Promise<LocalDreamData[]> {
    try {
      return await localStorageService.getLocalDreams();
    } catch (error) {
      console.error('꿈 목록 조회 실패:', error);
      return [];
    }
  }

  // 꿈 데이터 수정
  async updateDream(dreamId: string, updates: Partial<LocalDreamData>): Promise<LocalDreamData> {
    try {
      const existingDream = await localStorageService.getLocalDream(dreamId);
      if (!existingDream) {
        throw new Error('꿈 데이터를 찾을 수 없습니다');
      }

      const updatedDream: LocalDreamData = {
        ...existingDream,
        ...updates,
        updated_at: new Date().toISOString(),
        is_synced: false // 수정 후 동기화 필요
      };

      await localStorageService.saveDreamLocally(updatedDream);

      // 네트워크가 사용 가능하면 서버에 동기화
      if (await serverSyncService.isNetworkAvailable()) {
        try {
          await serverSyncService.syncDreamToServer(updatedDream);
        } catch (error) {
          console.warn('서버 동기화 실패:', error);
        }
      }

      return updatedDream;
    } catch (error) {
      console.error('꿈 데이터 수정 실패:', error);
      throw error;
    }
  }

  // 꿈 데이터 삭제
  async deleteDream(dreamId: string): Promise<void> {
    try {
      // 로컬에서 삭제
      await localStorageService.deleteLocalDream(dreamId);

      // 네트워크가 사용 가능하면 서버에서도 삭제
      if (await serverSyncService.isNetworkAvailable()) {
        try {
          // 서버 삭제 API 호출 (구현 필요)
          await fetch(`${serverSyncService['baseUrl']}/api/v1/dreams/${dreamId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${await serverSyncService['getAuthToken']()}`
            }
          });
        } catch (error) {
          console.warn('서버 삭제 실패:', error);
        }
      }
    } catch (error) {
      console.error('꿈 데이터 삭제 실패:', error);
      throw error;
    }
  }

  // 커뮤니티에 꿈 공유 (글자 수 제한 적용)
  async shareDreamToCommunity(
    dreamId: string, 
    sharedText: string, 
    sharedImage?: string
  ): Promise<CommunityPost> {
    try {
      // 사용자 플랜 확인
      const userPlan = await serverSyncService.getUserPlan();
      
      // 글자 수 제한 확인
      const limits = this.getPlanLimits(userPlan.plan);
      if (sharedText.length > limits.communityTextLimit) {
        throw new Error(`글자 수 제한 초과: ${limits.communityTextLimit}자 이하로 입력해주세요`);
      }

      // 이미지 업로드 제한 확인
      if (sharedImage && limits.imageUploadLimit !== -1) {
        const currentUploads = userPlan.features_used.image_uploads;
        if (currentUploads >= limits.imageUploadLimit) {
          throw new Error(`이미지 업로드 제한 초과: ${limits.imageUploadLimit}개 이하로 업로드 가능합니다`);
        }
      }

      // 서버에 공유
      const communityPost = await serverSyncService.shareToCommunity(dreamId, sharedText, sharedImage);
      
      return communityPost;
    } catch (error) {
      console.error('커뮤니티 공유 실패:', error);
      throw error;
    }
  }

  // 꿈 분석 요청
  async requestDreamAnalysis(dreamId: string): Promise<void> {
    try {
      const userPlan = await serverSyncService.getUserPlan();
      const limits = this.getPlanLimits(userPlan.plan);

      // AI 분석 제한 확인
      if (limits.aiAnalysisLimit !== -1) {
        const currentAnalyses = userPlan.features_used.ai_analyses;
        if (currentAnalyses >= limits.aiAnalysisLimit) {
          throw new Error(`AI 분석 제한 초과: ${limits.aiAnalysisLimit}회 이하로 사용 가능합니다`);
        }
      }

      // 서버에 분석 요청
      const response = await fetch(`${serverSyncService['baseUrl']}/api/v1/dreams/${dreamId}/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await serverSyncService['getAuthToken']()}`
        }
      });

      if (!response.ok) {
        throw new Error(`분석 요청 실패: ${response.status}`);
      }

      // 사용량 업데이트
      await serverSyncService.updateFeatureUsage('ai_analyses', 1);
    } catch (error) {
      console.error('꿈 분석 요청 실패:', error);
      throw error;
    }
  }

  // 꿈 시각화 요청
  async requestDreamVisualization(dreamId: string): Promise<string> {
    try {
      const userPlan = await serverSyncService.getUserPlan();
      const limits = this.getPlanLimits(userPlan.plan);

      // 시각화 제한 확인
      if (limits.visualizationLimit !== -1) {
        const currentVisualizations = userPlan.features_used.visualizations;
        if (currentVisualizations >= limits.visualizationLimit) {
          throw new Error(`시각화 제한 초과: ${limits.visualizationLimit}회 이하로 사용 가능합니다`);
        }
      }

      // 서버에 시각화 요청
      const response = await fetch(`${serverSyncService['baseUrl']}/api/v1/dreams/${dreamId}/visualize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await serverSyncService['getAuthToken']()}`
        }
      });

      if (!response.ok) {
        throw new Error(`시각화 요청 실패: ${response.status}`);
      }

      const result = await response.json();
      
      // 사용량 업데이트
      await serverSyncService.updateFeatureUsage('visualizations', 1);
      
      return result.imageUrl;
    } catch (error) {
      console.error('꿈 시각화 요청 실패:', error);
      throw error;
    }
  }

  // 대기 중인 동기화 실행
  async syncPendingData(): Promise<void> {
    try {
      if (await serverSyncService.isNetworkAvailable()) {
        await serverSyncService.syncPendingDreams();
      }
    } catch (error) {
      console.error('대기 중인 동기화 실행 실패:', error);
    }
  }

  // 데이터 백업 (로컬 데이터 내보내기)
  async exportData(): Promise<string> {
    try {
      return await localStorageService.exportLocalData();
    } catch (error) {
      console.error('데이터 백업 실패:', error);
      throw error;
    }
  }

  // 데이터 복원 (로컬 데이터 가져오기)
  async importData(jsonData: string): Promise<void> {
    try {
      await localStorageService.importLocalData(jsonData);
    } catch (error) {
      console.error('데이터 복원 실패:', error);
      throw error;
    }
  }

  // 저장소 사용량 조회
  async getStorageUsage(): Promise<{ local: any; server: any }> {
    try {
      const localUsage = await localStorageService.getStorageUsage();
      // 서버 사용량은 별도 API로 조회 (구현 필요)
      const serverUsage = { total: 0 }; // 임시값
      
      return { local: localUsage, server: serverUsage };
    } catch (error) {
      console.error('저장소 사용량 조회 실패:', error);
      return { local: { total: 0 }, server: { total: 0 } };
    }
  }

  // 플랜별 제한사항 조회
  private getPlanLimits(plan: SubscriptionPlan) {
    const limits = {
      [SubscriptionPlan.FREE]: {
        communityTextLimit: 200,
        imageUploadLimit: 3,
        aiAnalysisLimit: 5,
        visualizationLimit: 2
      },
      [SubscriptionPlan.PLUS]: {
        communityTextLimit: 500,
        imageUploadLimit: 10,
        aiAnalysisLimit: 20,
        visualizationLimit: 10
      },
      [SubscriptionPlan.PREMIUM]: {
        communityTextLimit: 1000,
        imageUploadLimit: -1,
        aiAnalysisLimit: -1,
        visualizationLimit: -1
      }
    };
    
    return limits[plan];
  }

  // 고유 ID 생성
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export default new HybridDataManager();
