/**
 * 로컬 저장소 서비스
 * 꿈 일기 원본 텍스트, 음성 파일을 로컬에만 저장
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocalDreamData, SyncStatus } from '../types/storage';

class LocalStorageService {
  private readonly DREAMS_KEY = 'dreams_local';
  private readonly SYNC_STATUS_KEY = 'sync_status';
  private readonly USER_PLAN_KEY = 'user_plan';

  // 로컬에 꿈 데이터 저장
  async saveDreamLocally(dreamData: LocalDreamData): Promise<void> {
    try {
      const existingDreams = await this.getLocalDreams();
      const updatedDreams = existingDreams.filter(dream => dream.id !== dreamData.id);
      updatedDreams.push(dreamData);
      
      await AsyncStorage.setItem(this.DREAMS_KEY, JSON.stringify(updatedDreams));
      
      // 동기화 상태 업데이트
      await this.updateSyncStatus(dreamData.id, SyncStatus.PENDING);
    } catch (error) {
      console.error('로컬 저장 실패:', error);
      throw new Error('꿈 데이터를 로컬에 저장하는데 실패했습니다');
    }
  }

  // 로컬에서 꿈 데이터 조회
  async getLocalDreams(): Promise<LocalDreamData[]> {
    try {
      const dreamsJson = await AsyncStorage.getItem(this.DREAMS_KEY);
      return dreamsJson ? JSON.parse(dreamsJson) : [];
    } catch (error) {
      console.error('로컬 조회 실패:', error);
      return [];
    }
  }

  // 특정 꿈 데이터 조회
  async getLocalDream(dreamId: string): Promise<LocalDreamData | null> {
    try {
      const dreams = await this.getLocalDreams();
      return dreams.find(dream => dream.id === dreamId) || null;
    } catch (error) {
      console.error('로컬 꿈 조회 실패:', error);
      return null;
    }
  }

  // 로컬에서 꿈 데이터 삭제
  async deleteLocalDream(dreamId: string): Promise<void> {
    try {
      const dreams = await this.getLocalDreams();
      const updatedDreams = dreams.filter(dream => dream.id !== dreamId);
      await AsyncStorage.setItem(this.DREAMS_KEY, JSON.stringify(updatedDreams));
      
      // 동기화 상태도 삭제
      await this.removeSyncStatus(dreamId);
    } catch (error) {
      console.error('로컬 삭제 실패:', error);
      throw new Error('꿈 데이터를 로컬에서 삭제하는데 실패했습니다');
    }
  }

  // 동기화 상태 업데이트
  async updateSyncStatus(dreamId: string, status: SyncStatus, error?: string): Promise<void> {
    try {
      const syncStatuses = await this.getSyncStatuses();
      syncStatuses[dreamId] = { status, error, updated_at: new Date().toISOString() };
      await AsyncStorage.setItem(this.SYNC_STATUS_KEY, JSON.stringify(syncStatuses));
    } catch (error) {
      console.error('동기화 상태 업데이트 실패:', error);
    }
  }

  // 동기화 상태 조회
  async getSyncStatuses(): Promise<Record<string, { status: SyncStatus; error?: string; updated_at: string }>> {
    try {
      const syncStatusesJson = await AsyncStorage.getItem(this.SYNC_STATUS_KEY);
      return syncStatusesJson ? JSON.parse(syncStatusesJson) : {};
    } catch (error) {
      console.error('동기화 상태 조회 실패:', error);
      return {};
    }
  }

  // 동기화 상태 삭제
  async removeSyncStatus(dreamId: string): Promise<void> {
    try {
      const syncStatuses = await this.getSyncStatuses();
      delete syncStatuses[dreamId];
      await AsyncStorage.setItem(this.SYNC_STATUS_KEY, JSON.stringify(syncStatuses));
    } catch (error) {
      console.error('동기화 상태 삭제 실패:', error);
    }
  }

  // 동기화 대기 중인 꿈들 조회
  async getPendingSyncDreams(): Promise<LocalDreamData[]> {
    try {
      const dreams = await this.getLocalDreams();
      const syncStatuses = await this.getSyncStatuses();
      
      return dreams.filter(dream => {
        const status = syncStatuses[dream.id];
        return status?.status === SyncStatus.PENDING || status?.status === SyncStatus.FAILED;
      });
    } catch (error) {
      console.error('동기화 대기 꿈 조회 실패:', error);
      return [];
    }
  }

  // 로컬 데이터 백업 (JSON 파일로 내보내기)
  async exportLocalData(): Promise<string> {
    try {
      const dreams = await this.getLocalDreams();
      const syncStatuses = await this.getSyncStatuses();
      
      const exportData = {
        dreams,
        syncStatuses,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('데이터 내보내기 실패:', error);
      throw new Error('데이터를 내보내는데 실패했습니다');
    }
  }

  // 로컬 데이터 가져오기 (JSON 파일에서 복원)
  async importLocalData(jsonData: string): Promise<void> {
    try {
      const importData = JSON.parse(jsonData);
      
      if (importData.dreams) {
        await AsyncStorage.setItem(this.DREAMS_KEY, JSON.stringify(importData.dreams));
      }
      
      if (importData.syncStatuses) {
        await AsyncStorage.setItem(this.SYNC_STATUS_KEY, JSON.stringify(importData.syncStatuses));
      }
    } catch (error) {
      console.error('데이터 가져오기 실패:', error);
      throw new Error('데이터를 가져오는데 실패했습니다');
    }
  }

  // 로컬 저장소 초기화
  async clearLocalData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.DREAMS_KEY);
      await AsyncStorage.removeItem(this.SYNC_STATUS_KEY);
    } catch (error) {
      console.error('로컬 데이터 초기화 실패:', error);
      throw new Error('로컬 데이터를 초기화하는데 실패했습니다');
    }
  }

  // 저장소 사용량 확인
  async getStorageUsage(): Promise<{ dreams: number; syncStatuses: number; total: number }> {
    try {
      const dreams = await this.getLocalDreams();
      const syncStatuses = await this.getSyncStatuses();
      
      const dreamsSize = JSON.stringify(dreams).length;
      const syncStatusesSize = JSON.stringify(syncStatuses).length;
      
      return {
        dreams: dreamsSize,
        syncStatuses: syncStatusesSize,
        total: dreamsSize + syncStatusesSize
      };
    } catch (error) {
      console.error('저장소 사용량 확인 실패:', error);
      return { dreams: 0, syncStatuses: 0, total: 0 };
    }
  }
}

export default new LocalStorageService();
