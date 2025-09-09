/**
 * 통합 음성 서비스
 * 녹음 + STT 기능을 통합한 서비스
 */
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import sttService, { STTResult, RealtimeSTTResult, STTSettings } from './sttService';

// 음성 서비스 상태
export interface VoiceServiceState {
  isRecording: boolean;
  isTranscribing: boolean;
  isRealtimeSTTActive: boolean;
  currentRecordingPath: string | null;
  currentTranscription: string;
  realtimePartialText: string;
  realtimeFinalText: string;
}

// 음성 서비스 콜백
export interface VoiceServiceCallbacks {
  onRecordingStart?: () => void;
  onRecordingStop?: (path: string) => void;
  onTranscriptionStart?: () => void;
  onTranscriptionComplete?: (result: STTResult) => void;
  onRealtimeSTTResult?: (result: RealtimeSTTResult) => void;
  onError?: (error: Error) => void;
}

class VoiceService {
  private state: VoiceServiceState = {
    isRecording: false,
    isTranscribing: false,
    isRealtimeSTTActive: false,
    currentRecordingPath: null,
    currentTranscription: '',
    realtimePartialText: '',
    realtimeFinalText: ''
  };

  private callbacks: VoiceServiceCallbacks = {};
  private recordingStartTime: number = 0;
  private recordingDuration: number = 0;

  constructor() {
    console.log('VoiceService: 초기화 완료');
  }

  /**
   * 콜백 설정
   */
  setCallbacks(callbacks: VoiceServiceCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * 현재 상태 조회
   */
  getState(): VoiceServiceState {
    return { ...this.state };
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

      this.state.isRecording = true;
      this.state.currentRecordingPath = filePath;
      this.recordingStartTime = Date.now();
      this.recordingDuration = 0;

      console.log('VoiceService: 녹음 시작 -', filePath);
      
      // 콜백 호출
      this.callbacks.onRecordingStart?.();
      
      return filePath;
    } catch (error) {
      console.error('녹음 시작 실패:', error);
      this.callbacks.onError?.(error instanceof Error ? error : new Error('녹음 시작 실패'));
      throw error;
    }
  }

  /**
   * 녹음 중지
   */
  async stopRecording(): Promise<string> {
    try {
      if (!this.state.isRecording) {
        throw new Error('현재 녹음 중이 아닙니다.');
      }

      this.state.isRecording = false;
      this.recordingDuration = (Date.now() - this.recordingStartTime) / 1000;
      
      const path = this.state.currentRecordingPath;
      this.state.currentRecordingPath = null;
      this.recordingStartTime = 0;

      console.log('VoiceService: 녹음 중지 -', path, `(${this.recordingDuration.toFixed(1)}초)`);
      
      // 콜백 호출
      this.callbacks.onRecordingStop?.(path || '');
      
      return path || '';
    } catch (error) {
      console.error('녹음 중지 실패:', error);
      this.callbacks.onError?.(error instanceof Error ? error : new Error('녹음 중지 실패'));
      throw error;
    }
  }

  /**
   * 녹음 파일을 텍스트로 변환
   */
  async transcribeRecording(audioPath?: string, settings?: Partial<STTSettings>): Promise<STTResult> {
    try {
      const path = audioPath || this.state.currentRecordingPath;
      if (!path) {
        throw new Error('변환할 녹음 파일이 없습니다.');
      }

      this.state.isTranscribing = true;
      this.state.currentTranscription = '';

      console.log('VoiceService: STT 변환 시작 -', path);
      
      // 콜백 호출
      this.callbacks.onTranscriptionStart?.();

      // STT 서비스 호출
      const result = await sttService.transcribeAudio(path, settings);
      
      this.state.isTranscribing = false;
      this.state.currentTranscription = result.text;

      console.log('VoiceService: STT 변환 완료 -', result.text);
      
      // 콜백 호출
      this.callbacks.onTranscriptionComplete?.(result);
      
      return result;
    } catch (error) {
      this.state.isTranscribing = false;
      console.error('STT 변환 실패:', error);
      this.callbacks.onError?.(error instanceof Error ? error : new Error('STT 변환 실패'));
      throw error;
    }
  }

  /**
   * 실시간 음성 인식 시작
   */
  async startRealtimeSTT(settings?: Partial<STTSettings>): Promise<void> {
    try {
      if (this.state.isRealtimeSTTActive) {
        throw new Error('이미 실시간 음성 인식이 활성화되어 있습니다.');
      }

      this.state.isRealtimeSTTActive = true;
      this.state.realtimePartialText = '';
      this.state.realtimeFinalText = '';

      console.log('VoiceService: 실시간 STT 시작');

      // STT 서비스의 실시간 인식 시작
      await sttService.startRealtimeTranscription(
        (result: RealtimeSTTResult) => {
          this.state.realtimePartialText = result.partialText;
          if (result.isFinal) {
            this.state.realtimeFinalText += result.finalText + ' ';
          }
          
          // 콜백 호출
          this.callbacks.onRealtimeSTTResult?.(result);
        },
        (error: Error) => {
          this.state.isRealtimeSTTActive = false;
          this.callbacks.onError?.(error);
        },
        settings
      );
    } catch (error) {
      this.state.isRealtimeSTTActive = false;
      console.error('실시간 STT 시작 실패:', error);
      this.callbacks.onError?.(error instanceof Error ? error : new Error('실시간 STT 시작 실패'));
      throw error;
    }
  }

  /**
   * 실시간 음성 인식 중지
   */
  async stopRealtimeSTT(): Promise<void> {
    try {
      if (!this.state.isRealtimeSTTActive) {
        throw new Error('실시간 음성 인식이 활성화되어 있지 않습니다.');
      }

      await sttService.stopRealtimeTranscription();
      
      this.state.isRealtimeSTTActive = false;
      this.state.realtimePartialText = '';

      console.log('VoiceService: 실시간 STT 중지');
    } catch (error) {
      console.error('실시간 STT 중지 실패:', error);
      this.callbacks.onError?.(error instanceof Error ? error : new Error('실시간 STT 중지 실패'));
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

      console.log('VoiceService: 재생 시작 -', path);
      
      // 시뮬레이션된 재생
      Alert.alert('재생', '녹음 파일을 재생합니다. (시뮬레이션)');
    } catch (error) {
      console.error('재생 실패:', error);
      this.callbacks.onError?.(error instanceof Error ? error : new Error('재생 실패'));
      throw error;
    }
  }

  /**
   * 녹음 파일 삭제
   */
  async deleteRecording(path: string): Promise<void> {
    try {
      if (!path) return;

      console.log('VoiceService: 파일 삭제 -', path);
      // 시뮬레이션된 파일 삭제
    } catch (error) {
      console.error('파일 삭제 실패:', error);
      this.callbacks.onError?.(error instanceof Error ? error : new Error('파일 삭제 실패'));
      throw error;
    }
  }

  /**
   * 현재 재생 시간 (초)
   */
  async getCurrentTime(): Promise<number> {
    if (this.state.isRecording) {
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

  /**
   * STT 설정 업데이트
   */
  updateSTTSettings(settings: Partial<STTSettings>): void {
    sttService.updateSettings(settings);
  }

  /**
   * 현재 STT 설정 조회
   */
  getSTTSettings(): STTSettings {
    return sttService.getCurrentSettings();
  }

  /**
   * 지원하는 언어 목록 조회
   */
  getSupportedLanguages(): Array<{ code: string; name: string }> {
    return sttService.getSupportedLanguages();
  }

  /**
   * 실시간 STT 결과 초기화
   */
  clearRealtimeResults(): void {
    this.state.realtimePartialText = '';
    this.state.realtimeFinalText = '';
  }

  /**
   * 모든 상태 초기화
   */
  reset(): void {
    this.state = {
      isRecording: false,
      isTranscribing: false,
      isRealtimeSTTActive: false,
      currentRecordingPath: null,
      currentTranscription: '',
      realtimePartialText: '',
      realtimeFinalText: ''
    };
    this.callbacks = {};
    this.recordingStartTime = 0;
    this.recordingDuration = 0;
  }
}

export default new VoiceService();
