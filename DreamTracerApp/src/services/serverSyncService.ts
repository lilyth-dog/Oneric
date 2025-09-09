/**
 * 서버 동기화 서비스
 * 분석 결과, 통계, 커뮤니티 공유 데이터를 서버에 저장
 */
import { 
  ServerDreamData, 
  DreamAnalysisResult, 
  CommunityPost, 
  UserPlan, 
  SubscriptionPlan,
  PLAN_LIMITS,
  SyncStatus 
} from '../types/storage';
import { LocalDreamData } from '../types/storage';
import localStorageService from './localStorageService';

class ServerSyncService {
  private baseUrl = 'https://api.ggumgyeol.com'; // 실제 API URL로 변경

  // 꿈 데이터를 서버에 동기화 (원본 텍스트 제외)
  async syncDreamToServer(localDream: LocalDreamData): Promise<ServerDreamData> {
    try {
      // 로컬 데이터를 서버 형식으로 변환 (원본 텍스트 제외)
      const serverDream: Partial<ServerDreamData> = {
        id: localDream.id,
        user_id: localDream.user_id,
        dream_date: localDream.dream_date,
        title: localDream.title,
        // body_text는 서버에 저장하지 않음 (프라이버시 보호)
        lucidity_level: localDream.lucidity_level,
        emotion_tags: localDream.emotion_tags,
        dream_type: localDream.dream_type,
        sleep_quality: localDream.sleep_quality,
        dream_duration: localDream.dream_duration,
        location: localDream.location,
        characters: localDream.characters,
        symbols: localDream.symbols,
        analysis_status: 'pending',
        is_shared: false,
        created_at: localDream.created_at,
        updated_at: localDream.updated_at
      };

      // 서버에 전송
      const response = await fetch(`${this.baseUrl}/api/v1/dreams/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify(serverDream)
      });

      if (!response.ok) {
        throw new Error(`서버 동기화 실패: ${response.status}`);
      }

      const syncedDream: ServerDreamData = await response.json();
      
      // 로컬 동기화 상태 업데이트
      await localStorageService.updateSyncStatus(localDream.id, SyncStatus.SYNCED);
      
      return syncedDream;
    } catch (error) {
      // 동기화 실패 시 상태 업데이트
      await localStorageService.updateSyncStatus(
        localDream.id, 
        SyncStatus.FAILED, 
        error instanceof Error ? error.message : '알 수 없는 오류'
      );
      throw error;
    }
  }

  // 꿈 분석 결과 저장
  async saveAnalysisResult(dreamId: string, analysis: DreamAnalysisResult): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/dreams/${dreamId}/analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify(analysis)
      });

      if (!response.ok) {
        throw new Error(`분석 결과 저장 실패: ${response.status}`);
      }
    } catch (error) {
      console.error('분석 결과 저장 실패:', error);
      throw error;
    }
  }

  // 커뮤니티에 꿈 공유 (글자 수 제한 적용)
  async shareToCommunity(
    dreamId: string, 
    sharedText: string, 
    sharedImage?: string
  ): Promise<CommunityPost> {
    try {
      // 사용자 플랜 확인
      const userPlan = await this.getUserPlan();
      const limits = PLAN_LIMITS[userPlan.plan];

      // 글자 수 제한 확인
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

      const postData = {
        dream_id: dreamId,
        shared_text: sharedText,
        shared_image: sharedImage,
        is_anonymous: true // 기본적으로 익명 공유
      };

      const response = await fetch(`${this.baseUrl}/api/v1/community/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify(postData)
      });

      if (!response.ok) {
        throw new Error(`커뮤니티 공유 실패: ${response.status}`);
      }

      const communityPost: CommunityPost = await response.json();
      
      // 사용량 업데이트
      await this.updateFeatureUsage('image_uploads', sharedImage ? 1 : 0);
      
      return communityPost;
    } catch (error) {
      console.error('커뮤니티 공유 실패:', error);
      throw error;
    }
  }

  // 사용자 플랜 정보 조회
  async getUserPlan(): Promise<UserPlan> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/user/plan`, {
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`플랜 정보 조회 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('플랜 정보 조회 실패:', error);
      // 기본값 반환
      return {
        plan: SubscriptionPlan.FREE,
        features_used: {
          community_posts: 0,
          image_uploads: 0,
          ai_analyses: 0,
          visualizations: 0
        },
        monthly_reset_date: new Date().toISOString()
      };
    }
  }

  // 기능 사용량 업데이트
  async updateFeatureUsage(feature: keyof UserPlan['features_used'], increment: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/user/usage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({
          feature,
          increment
        })
      });

      if (!response.ok) {
        throw new Error(`사용량 업데이트 실패: ${response.status}`);
      }
    } catch (error) {
      console.error('사용량 업데이트 실패:', error);
    }
  }

  // 꿈 통계 조회
  async getDreamStats(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/dreams/stats`, {
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`통계 조회 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('통계 조회 실패:', error);
      throw error;
    }
  }

  // 대기 중인 동기화 실행
  async syncPendingDreams(): Promise<void> {
    try {
      const pendingDreams = await localStorageService.getPendingSyncDreams();
      
      for (const dream of pendingDreams) {
        try {
          await this.syncDreamToServer(dream);
        } catch (error) {
          console.error(`꿈 ${dream.id} 동기화 실패:`, error);
        }
      }
    } catch (error) {
      console.error('대기 중인 동기화 실행 실패:', error);
    }
  }

  // 인증 토큰 조회 (실제 구현에서는 authStore에서 가져와야 함)
  private async getAuthToken(): Promise<string> {
    // 실제 구현에서는 authStore에서 토큰을 가져와야 함
    return 'dummy_token';
  }

  // 네트워크 연결 상태 확인
  async isNetworkAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/health`, {
        method: 'HEAD',
        timeout: 5000
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

export default new ServerSyncService();
