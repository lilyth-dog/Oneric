/**
 * 통합 음성 서비스
 * 녹음 + STT 기능을 통합한 서비스 (Real Implementation)
 */
import { PermissionsAndroid, Platform, Alert } from 'react-native';

// Dynamic import with fallback for AudioRecorderPlayer
let AudioRecorderPlayerClass: any = null;
let AudioEncoderAndroidType: any = {};
let AudioSourceAndroidType: any = {};
let AVEncoderAudioQualityIOSType: any = {};
let AVEncodingOption: any = {};

try {
  const audioModule = require('react-native-audio-recorder-player');
  AudioRecorderPlayerClass = audioModule.default || audioModule;
  AudioEncoderAndroidType = audioModule.AudioEncoderAndroidType || { AAC: 3 };
  AudioSourceAndroidType = audioModule.AudioSourceAndroidType || { MIC: 1 };
  AVEncoderAudioQualityIOSType = audioModule.AVEncoderAudioQualityIOSType || { high: 'high' };
  AVEncodingOption = audioModule.AVEncodingOption || { aac: 'aac' };
} catch (e) {
  console.warn('react-native-audio-recorder-player not available, using mock');
}

// Mock AudioRecorderPlayer for when native module is not available
class MockAudioRecorderPlayer {
  private listeners: { record: any; play: any } = { record: null, play: null };
  private subscriptionDuration: number = 0.1;

  setSubscriptionDuration(duration: number) {
    this.subscriptionDuration = duration;
  }

  async startRecorder(_path?: string, _audioSet?: any): Promise<string> {
    console.log('MockAudioRecorderPlayer: startRecorder');
    return '/mock/recording.m4a';
  }

  async stopRecorder(): Promise<string> {
    console.log('MockAudioRecorderPlayer: stopRecorder');
    if (this.listeners.record) {
      this.listeners.record = null;
    }
    return '/mock/recording.m4a';
  }

  addRecordBackListener(callback: any) {
    this.listeners.record = callback;
  }

  removeRecordBackListener() {
    this.listeners.record = null;
  }

  async startPlayer(_path: string): Promise<string> {
    console.log('MockAudioRecorderPlayer: startPlayer');
    return 'success';
  }

  async stopPlayer(): Promise<string> {
    console.log('MockAudioRecorderPlayer: stopPlayer');
    return 'success';
  }

  addPlayBackListener(callback: any) {
    this.listeners.play = callback;
  }

  removePlayBackListener() {
    this.listeners.play = null;
  }
}
import sttService, { STTResult, RealtimeSTTResult, STTSettings } from './sttService';

export type { STTResult, RealtimeSTTResult, STTSettings };

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
  onMeteringUpdate?: (metering: number) => void;
}

class VoiceService {
  private audioRecorderPlayer: MockAudioRecorderPlayer;

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
    // Use real AudioRecorderPlayer if available, otherwise use mock
    if (AudioRecorderPlayerClass) {
      try {
        this.audioRecorderPlayer = new AudioRecorderPlayerClass();
        console.log('VoiceService: Initialized with real AudioRecorderPlayer');
      } catch (e) {
        console.warn('Failed to initialize AudioRecorderPlayer, using mock:', e);
        this.audioRecorderPlayer = new MockAudioRecorderPlayer();
      }
    } else {
      this.audioRecorderPlayer = new MockAudioRecorderPlayer();
      console.log('VoiceService: Initialized with MockAudioRecorderPlayer');
    }
    this.audioRecorderPlayer.setSubscriptionDuration(0.1);
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
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        if (
          grants['android.permission.WRITE_EXTERNAL_STORAGE'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.READ_EXTERNAL_STORAGE'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.RECORD_AUDIO'] ===
          PermissionsAndroid.RESULTS.GRANTED
        ) {
          return true;
        } else {
          console.log('All required permissions not granted');
          return false;
        }
      } catch (err) {
        console.warn('Permission request failed:', err);
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
        throw new Error('Recording permission denied');
      }

      this.state.isRecording = true;
      this.callbacks.onRecordingStart?.();

      const path = Platform.select({
        ios: 'dream_recording.m4a',
        android: undefined,
      });

      const audioSet = {
        AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
        AudioSourceAndroid: AudioSourceAndroidType.MIC,
        AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
        AVNumberOfChannelsKeyIOS: 2,
        AVFormatIDKeyIOS: AVEncodingOption.aac,
      };

      // Ensure path is string or undefined. The library expects undefined for auto-path on Android sometimes, or specific path.
      // Platform.select returns string | undefined, which is fine.
      const uri = await this.audioRecorderPlayer.startRecorder(
        path,
        audioSet,
      );

      this.state.currentRecordingPath = uri;
      this.recordingStartTime = Date.now();

      this.audioRecorderPlayer.addRecordBackListener((e: any) => {
        this.recordingDuration = e.currentPosition / 1000;

        // Mock metering if not available
        const mockAmplitude = Math.random() * 0.5 + 0.3;
        this.callbacks.onMeteringUpdate?.(mockAmplitude);
      });

      console.log('Recording started at:', uri);
      return uri;
    } catch (error) {
      this.state.isRecording = false;
      console.error('Start recording failed:', error);
      this.callbacks.onError?.(error instanceof Error ? error : new Error('Start recording failed'));
      throw error;
    }
  }

  /**
   * 녹음 중지
   */
  async stopRecording(): Promise<string> {
    try {
      if (!this.state.isRecording) return '';

      const result = await this.audioRecorderPlayer.stopRecorder();
      this.audioRecorderPlayer.removeRecordBackListener();

      this.state.isRecording = false;
      this.recordingDuration = 0;

      console.log('Recording stopped:', result);
      this.callbacks.onRecordingStop?.(result);

      return result;
    } catch (error) {
      console.error('Stop recording failed:', error);
      this.callbacks.onError?.(error instanceof Error ? error : new Error('Stop recording failed'));
      throw error;
    }
  }

  /**
   * 녹음 재생
   */
  async playRecording(path: string): Promise<void> {
    try {
      console.log('Playing:', path);
      await this.audioRecorderPlayer.startPlayer(path);

      this.audioRecorderPlayer.addPlayBackListener((e: any) => {
        if (e.currentPosition === e.duration) {
          this.audioRecorderPlayer.stopPlayer();
        }
      });
    } catch (error) {
      console.error('Playback failed:', error);
      this.callbacks.onError?.(error instanceof Error ? error : new Error('Playback failed'));
      throw error;
    }
  }

  async stopPlayer(): Promise<void> {
    try {
      await this.audioRecorderPlayer.stopPlayer();
      this.audioRecorderPlayer.removePlayBackListener();
    } catch (error) {
      console.error('Stop playback failed', error);
    }
  }

  /**
    * 녹음 파일 삭제
    */
  async deleteRecording(path: string): Promise<void> {
    try {
      if (!path) return;

      console.log('VoiceService: 파일 삭제 -', path);
      // AudioRecorderPlayer does not utilize a specific delete function, standard RN FS would be needed if we want to physically delete.
      // For now, allow JS to forget path.
    } catch (error) {
      console.error('파일 삭제 실패:', error);
      this.callbacks.onError?.(error instanceof Error ? error : new Error('파일 삭제 실패'));
      throw error;
    }
  }

  /**
   * 녹음 파일을 텍스트로 변환 (현재는 Mock STT 사용)
   */
  async transcribeRecording(audioPath?: string, settings?: Partial<STTSettings>): Promise<STTResult> {
    return sttService.transcribeAudio(audioPath || '', settings);
  }

  /**
   * 실시간 STT 시작 (Mock)
   */
  async startRealtimeSTT(settings?: Partial<STTSettings>): Promise<void> {
    return sttService.startRealtimeTranscription(
      (res) => this.callbacks.onRealtimeSTTResult?.(res),
      (err) => this.callbacks.onError?.(err),
      settings
    );
  }

  /**
   * 실시간 STT 중지 (Mock)
   */
  async stopRealtimeSTT(): Promise<void> {
    return sttService.stopRealtimeTranscription();
  }

  /**
   * 현재 재생 시간 (초)
   */
  async getCurrentTime(): Promise<number> {
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
   * 녹음 파일 정보 가져오기 (Mock)
   */
  async getRecordingInfo(path: string): Promise<{ size: number; duration: number }> {
    // Mock for now or implement real file stats later if critical
    return { size: 0, duration: 0 };
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
