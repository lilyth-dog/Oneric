/**
 * 오디오 녹음 서비스
 */
import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  OutputFormatAndroidType,
} from 'react-native-audio-recorder-player';
import { PermissionsAndroid, Platform } from 'react-native';

class AudioService {
  private audioRecorderPlayer: any;
  private isRecording: boolean = false;
  private currentRecordingPath: string | null = null;

  constructor() {
    this.audioRecorderPlayer = new (AudioRecorderPlayer as any)();
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
            buttonNegative: '거부',
            buttonPositive: '허용',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Permission request error:', err);
        return false;
      }
    }
    return true; // iOS는 Info.plist에서 설정
  }

  /**
   * 녹음 시작
   */
  async startRecording(): Promise<string> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('녹음 권한이 필요합니다');
      }

      const audioSet = {
        AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
        AudioSourceAndroid: AudioSourceAndroidType.MIC,
        AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
        AVNumberOfChannelsKeyIOS: 2,
        AVFormatIDKeyIOS: 'aac' as any,
        OutputFormatAndroid: OutputFormatAndroidType.AAC_ADTS,
      };

      const uri = await this.audioRecorderPlayer.startRecorder(undefined, audioSet);
      this.isRecording = true;
      this.currentRecordingPath = uri;
      
      console.log('Recording started:', uri);
      return uri;
    } catch (error) {
      console.error('Start recording error:', error);
      throw error;
    }
  }

  /**
   * 녹음 중지
   */
  async stopRecording(): Promise<string> {
    try {
      if (!this.isRecording) {
        throw new Error('녹음이 진행 중이 아닙니다');
      }

      const result = await this.audioRecorderPlayer.stopRecorder();
      this.isRecording = false;
      
      console.log('Recording stopped:', result);
      return result;
    } catch (error) {
      console.error('Stop recording error:', error);
      throw error;
    }
  }

  /**
   * 녹음 재생
   */
  async playRecording(uri: string): Promise<void> {
    try {
      await this.audioRecorderPlayer.startPlayer(uri);
      console.log('Playing recording:', uri);
    } catch (error) {
      console.error('Play recording error:', error);
      throw error;
    }
  }

  /**
   * 재생 중지
   */
  async stopPlaying(): Promise<void> {
    try {
      await this.audioRecorderPlayer.stopPlayer();
      console.log('Stopped playing');
    } catch (error) {
      console.error('Stop playing error:', error);
      throw error;
    }
  }

  /**
   * 녹음 상태 확인
   */
  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  /**
   * 현재 녹음 경로
   */
  getCurrentRecordingPath(): string | null {
    return this.currentRecordingPath;
  }

  /**
   * 녹음 시간 가져오기
   */
  async getCurrentTime(): Promise<number> {
    try {
      return await this.audioRecorderPlayer.getCurrentTime();
    } catch (error) {
      console.error('Get current time error:', error);
      return 0;
    }
  }

  /**
   * 녹음 시간 포맷팅
   */
  formatTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * 녹음 리스너 설정
   */
  addRecordBackListener(callback: (data: any) => void) {
    this.audioRecorderPlayer.addRecordBackListener(callback);
  }

  /**
   * 재생 리스너 설정
   */
  addPlayBackListener(callback: (data: any) => void) {
    this.audioRecorderPlayer.addPlayBackListener(callback);
  }

  /**
   * 리스너 제거
   */
  removeRecordBackListener() {
    this.audioRecorderPlayer.removeRecordBackListener();
  }

  /**
   * 재생 리스너 제거
   */
  removePlayBackListener() {
    this.audioRecorderPlayer.removePlayBackListener();
  }

  /**
   * 정리
   */
  async cleanup() {
    try {
      if (this.isRecording) {
        await this.stopRecording();
      }
      await this.stopPlaying();
      this.removeRecordBackListener();
      this.removePlayBackListener();
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }
}

export default new AudioService();
