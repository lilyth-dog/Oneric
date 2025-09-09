/**
 * STT (Speech-to-Text) 서비스
 * 음성 녹음을 텍스트로 변환하는 기능
 */
import { Platform, Alert } from 'react-native';

// STT 결과 타입
export interface STTResult {
  text: string;
  confidence: number;
  duration: number;
  language: string;
  timestamp: string;
}

// STT 설정 타입
export interface STTSettings {
  language: string;
  enablePunctuation: boolean;
  enableProfanityFilter: boolean;
  enableWordTimeOffsets: boolean;
  maxAlternatives: number;
}

// 실시간 STT 결과 타입
export interface RealtimeSTTResult {
  partialText: string;
  finalText: string;
  isFinal: boolean;
  confidence: number;
}

class STTService {
  private isProcessing: boolean = false;
  private currentSettings: STTSettings = {
    language: 'ko-KR',
    enablePunctuation: true,
    enableProfanityFilter: false,
    enableWordTimeOffsets: false,
    maxAlternatives: 1
  };

  constructor() {
    console.log('STTService: 초기화 완료');
  }

  /**
   * 음성 파일을 텍스트로 변환
   */
  async transcribeAudio(audioPath: string, settings?: Partial<STTSettings>): Promise<STTResult> {
    try {
      this.isProcessing = true;
      const startTime = Date.now();

      console.log('STTService: 음성 변환 시작 -', audioPath);

      // 설정 병합
      const finalSettings = { ...this.currentSettings, ...settings };

      // 실제 구현에서는 Google Speech-to-Text API 또는 다른 STT 서비스 사용
      // 현재는 시뮬레이션된 결과 반환
      const result = await this.simulateSTT(audioPath, finalSettings);

      const duration = (Date.now() - startTime) / 1000;
      console.log('STTService: 음성 변환 완료 -', duration.toFixed(2) + '초');

      this.isProcessing = false;
      return result;
    } catch (error) {
      this.isProcessing = false;
      console.error('STT 변환 실패:', error);
      throw new Error('음성을 텍스트로 변환하는데 실패했습니다');
    }
  }

  /**
   * 실시간 음성 인식 시작
   */
  async startRealtimeTranscription(
    onResult: (result: RealtimeSTTResult) => void,
    onError: (error: Error) => void,
    settings?: Partial<STTSettings>
  ): Promise<void> {
    try {
      console.log('STTService: 실시간 음성 인식 시작');

      // 설정 병합
      const finalSettings = { ...this.currentSettings, ...settings };

      // 실제 구현에서는 실시간 STT API 사용
      // 현재는 시뮬레이션된 실시간 인식
      this.simulateRealtimeSTT(onResult, onError, finalSettings);
    } catch (error) {
      console.error('실시간 STT 시작 실패:', error);
      throw error;
    }
  }

  /**
   * 실시간 음성 인식 중지
   */
  async stopRealtimeTranscription(): Promise<void> {
    try {
      console.log('STTService: 실시간 음성 인식 중지');
      // 실제 구현에서는 실시간 STT 중지
    } catch (error) {
      console.error('실시간 STT 중지 실패:', error);
      throw error;
    }
  }

  /**
   * STT 설정 업데이트
   */
  updateSettings(settings: Partial<STTSettings>): void {
    this.currentSettings = { ...this.currentSettings, ...settings };
    console.log('STTService: 설정 업데이트 -', this.currentSettings);
  }

  /**
   * 현재 STT 설정 조회
   */
  getCurrentSettings(): STTSettings {
    return { ...this.currentSettings };
  }

  /**
   * 지원하는 언어 목록 조회
   */
  getSupportedLanguages(): Array<{ code: string; name: string }> {
    return [
      { code: 'ko-KR', name: '한국어' },
      { code: 'en-US', name: '영어 (미국)' },
      { code: 'en-GB', name: '영어 (영국)' },
      { code: 'ja-JP', name: '일본어' },
      { code: 'zh-CN', name: '중국어 (간체)' },
      { code: 'zh-TW', name: '중국어 (번체)' },
    ];
  }

  /**
   * STT 처리 상태 확인
   */
  isCurrentlyProcessing(): boolean {
    return this.isProcessing;
  }

  /**
   * 시뮬레이션된 STT 변환 (실제 구현에서는 실제 STT API 사용)
   */
  private async simulateSTT(audioPath: string, settings: STTSettings): Promise<STTResult> {
    // 시뮬레이션된 지연 시간
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 시뮬레이션된 변환 결과
    const sampleTexts = [
      "어젯밤에 정말 이상한 꿈을 꿨어요. 하늘을 날아다니는 꿈이었는데, 새처럼 자유롭게 날 수 있었어요.",
      "꿈에서 옛날 친구를 만났어요. 초등학교 때 친구였는데, 지금은 연락이 안 되는데 꿈에서 만나서 정말 반가웠어요.",
      "악몽을 꿨어요. 어둠 속에서 누군가 쫓아오는 꿈이었는데, 도망치려고 해도 발이 움직이지 않았어요.",
      "자각몽을 꿨어요. 꿈인 줄 알면서도 꿈 속에서 원하는 대로 할 수 있었어요. 정말 신기한 경험이었어요.",
      "꿈에서 물고기가 되었어요. 바다 속을 헤엄치면서 다른 물고기들과 놀았어요. 물속에서 숨을 쉴 수 있어서 신기했어요."
    ];

    const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    
    return {
      text: randomText,
      confidence: 0.85 + Math.random() * 0.1, // 0.85-0.95
      duration: 15 + Math.random() * 30, // 15-45초
      language: settings.language,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 시뮬레이션된 실시간 STT (실제 구현에서는 실제 실시간 STT API 사용)
   */
  private simulateRealtimeSTT(
    onResult: (result: RealtimeSTTResult) => void,
    onError: (error: Error) => void,
    settings: STTSettings
  ): void {
    const sampleText = "어젯밤에 정말 이상한 꿈을 꿨어요. 하늘을 날아다니는 꿈이었는데, 새처럼 자유롭게 날 수 있었어요.";
    const words = sampleText.split(' ');
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex >= words.length) {
        clearInterval(interval);
        return;
      }

      const partialText = words.slice(0, currentIndex + 1).join(' ');
      const isFinal = currentIndex === words.length - 1;

      onResult({
        partialText: isFinal ? '' : partialText,
        finalText: isFinal ? sampleText : '',
        isFinal,
        confidence: 0.8 + Math.random() * 0.15
      });

      currentIndex++;
    }, 500); // 0.5초마다 단어 추가

    // 10초 후 자동 중지
    setTimeout(() => {
      clearInterval(interval);
    }, 10000);
  }

  /**
   * 오디오 파일 형식 검증
   */
  validateAudioFormat(audioPath: string): boolean {
    const supportedFormats = ['.m4a', '.mp3', '.wav', '.aac', '.ogg'];
    const extension = audioPath.toLowerCase().substring(audioPath.lastIndexOf('.'));
    return supportedFormats.includes(extension);
  }

  /**
   * 오디오 파일 크기 제한 확인
   */
  validateAudioSize(fileSize: number): boolean {
    const maxSize = 10 * 1024 * 1024; // 10MB
    return fileSize <= maxSize;
  }

  /**
   * 오디오 파일 길이 제한 확인
   */
  validateAudioDuration(duration: number): boolean {
    const maxDuration = 300; // 5분
    return duration <= maxDuration;
  }
}

export default new STTService();
