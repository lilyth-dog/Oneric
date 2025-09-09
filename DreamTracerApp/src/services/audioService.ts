/**
 * 오디오 녹음 서비스
 * 시뮬레이션된 구현 (네이티브 모듈 없이)
 */
import { PermissionsAndroid, Platform, Alert } from 'react-native';

class AudioService {
  private isRecording: boolean = false;
  private currentRecordingPath: string | null = null;
  private recordingStartTime: number = 0;
  private recordingDuration: number = 0;

  constructor() {
    console.log('AudioService: 초기화 완료');
  }

  /**
   * 녹음 권한 요청
   */
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: '오디오 녹음 권한',
            message: '꿈을 음성으로 기록하기 위해 마이크 접근 권한이 필요합니다.',
            buttonNeutral: '나중에',
            buttonNegative: '취소',
            buttonPositive: '허용',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('권한 요청 실패:', err);
        return false;
      }
    }
    return true; // iOS는 Info.plist에서 처리
  }

  /**
   * 녹음 시작
   */
  async startRecording(): Promise<string> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('녹음 권한이 필요합니다.');
      }

      // 시뮬레이션된 녹음 파일 경로 생성
      const timestamp = new Date().getTime();
      const fileName = `dream_recording_${timestamp}.m4a`;
      const filePath = `simulated_${fileName}`;

      this.isRecording = true;
      this.currentRecordingPath = filePath;
      this.recordingStartTime = Date.now();
      this.recordingDuration = 0;

      console.log('AudioService: 녹음 시작 (시뮬레이션) -', filePath);
      
      // 시뮬레이션된 녹음
      return filePath;
    } catch (error) {
      console.error('녹음 시작 실패:', error);
      throw error;
    }
  }

  /**
   * 녹음 중지
   */
  async stopRecording(): Promise<string> {
    try {
      if (!this.isRecording) {
        throw new Error('현재 녹음 중이 아닙니다.');
      }

      this.isRecording = false;
      this.recordingDuration = (Date.now() - this.recordingStartTime) / 1000;
      
      const path = this.currentRecordingPath;
      this.currentRecordingPath = null;
      this.recordingStartTime = 0;

      console.log('AudioService: 녹음 중지 (시뮬레이션) -', path, `(${this.recordingDuration.toFixed(1)}초)`);
      
      return path || '';
    } catch (error) {
      console.error('녹음 중지 실패:', error);
      throw error;
    }
  }

  /**
   * 녹음 재생
   */
  async playRecording(path: string): Promise<void> {
    try {
      if (!path) {
        throw new Error('재생할 파일이 없습니다.');
      }

      console.log('AudioService: 재생 시작 (시뮬레이션) -', path);
      
      // 시뮬레이션된 재생
      Alert.alert('재생', '녹음 파일을 재생합니다. (시뮬레이션)');
    } catch (error) {
      console.error('재생 실패:', error);
      throw error;
    }
  }

  /**
   * 재생 중지
   */
  async stopPlayback(): Promise<void> {
    try {
      console.log('AudioService: 재생 중지');
      // 실제 재생 중지는 네이티브 모듈이 필요
    } catch (error) {
      console.error('재생 중지 실패:', error);
      throw error;
    }
  }

  /**
   * 녹음 파일 삭제
   */
  async deleteRecording(path: string): Promise<void> {
    try {
      if (!path) return;

      console.log('AudioService: 파일 삭제 (시뮬레이션) -', path);
      // 시뮬레이션된 파일 삭제
    } catch (error) {
      console.error('파일 삭제 실패:', error);
      throw error;
    }
  }

  /**
   * 현재 녹음 상태 확인
   */
  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  /**
   * 현재 녹음 파일 경로
   */
  getCurrentRecordingPath(): string | null {
    return this.currentRecordingPath;
  }

  /**
   * 현재 재생 시간 (초)
   */
  async getCurrentTime(): Promise<number> {
    if (this.isRecording) {
      return (Date.now() - this.recordingStartTime) / 1000;
    }
    return this.recordingDuration;
  }

  /**
   * 시간을 MM:SS 형식으로 포맷
   */
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * 녹음 파일 정보 가져오기
   */
  async getRecordingInfo(path: string): Promise<{ size: number; duration: number }> {
    try {
      if (!path) {
        return { size: 0, duration: 0 };
      }

      // 시뮬레이션된 파일 정보
      return {
        size: 1024 * 100, // 100KB 시뮬레이션
        duration: this.recordingDuration,
      };
    } catch (error) {
      console.error('파일 정보 조회 실패:', error);
      return { size: 0, duration: 0 };
    }
  }
}

export default new AudioService();