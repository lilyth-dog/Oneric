/**
 * 꿈 기록 생성 화면
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigationStore } from '../../stores/navigationStore';
import { useDreamStore } from '../../stores/dreamStore';
import { DreamCreate, EmotionType, EMOTION_LABELS, DREAM_TYPE_LABELS, LUCIDITY_LABELS, SLEEP_QUALITY_LABELS } from '../../types/dream';
import voiceService, { VoiceServiceCallbacks, RealtimeSTTResult } from '../../services/voiceService';
import { 
  DreamRecordTitleStyle, 
  EmotionalSubtitleStyle, 
  ButtonFontStyle, 
  BodyFontStyle, 
  SmallFontStyle,
  PersonalCelebrationStyle
} from '../../styles/fonts';

const CreateDreamScreen: React.FC = () => {
  const { goBack } = useNavigationStore();
  const { createDream, isCreating } = useDreamStore();
  
  // 기본 상태
  const [dreamDate, setDreamDate] = useState(new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [lucidityLevel, setLucidityLevel] = useState<number>(3);
  const [sleepQuality, setSleepQuality] = useState<number>(3);
  const [dreamType, setDreamType] = useState<string>('normal');
  const [location, setLocation] = useState('');
  const [characters, setCharacters] = useState<string[]>([]);
  const [symbols, setSymbols] = useState<string[]>([]);
  const [emotionTags, setEmotionTags] = useState<EmotionType[]>([]);
  
  // 음성 녹음 및 STT 상태
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioPath, setAudioPath] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState<string>('');
  const [isRealtimeSTTActive, setIsRealtimeSTTActive] = useState(false);
  const [realtimeText, setRealtimeText] = useState('');
  const [characterInput, setCharacterInput] = useState('');
  const [symbolInput, setSymbolInput] = useState('');

  useEffect(() => {
    // 음성 서비스 콜백 설정
    const callbacks: VoiceServiceCallbacks = {
      onRecordingStart: () => {
        setIsRecording(true);
      },
      onRecordingStop: (path) => {
        setIsRecording(false);
        setAudioPath(path);
      },
      onTranscriptionStart: () => {
        setIsTranscribing(true);
      },
      onTranscriptionComplete: (result) => {
        setIsTranscribing(false);
        setTranscriptionResult(result.text);
        // STT 결과를 꿈 내용에 자동 추가
        setBodyText(prev => prev + (prev ? '\n\n' : '') + result.text);
      },
      onRealtimeSTTResult: (result: RealtimeSTTResult) => {
        if (result.isFinal) {
          setRealtimeText(prev => prev + result.finalText + ' ');
          // 실시간 STT 결과를 꿈 내용에 자동 추가
          setBodyText(prev => prev + (prev ? ' ' : '') + result.finalText);
        }
      },
      onError: (error) => {
        Alert.alert('오류', error.message);
      }
    };

    voiceService.setCallbacks(callbacks);

    // 녹음 시간 업데이트
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(async () => {
        const time = await voiceService.getCurrentTime();
        setRecordingTime(time);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const handleStartRecording = async () => {
    try {
      const path = await voiceService.startRecording();
      setAudioPath(path);
    } catch (error) {
      Alert.alert('오류', '녹음을 시작할 수 없습니다.');
    }
  };

  const handleStopRecording = async () => {
    try {
      await voiceService.stopRecording();
    } catch (error) {
      Alert.alert('오류', '녹음을 중지할 수 없습니다.');
    }
  };

  const handlePlayRecording = async () => {
    if (audioPath) {
      try {
        await voiceService.playRecording(audioPath);
      } catch (error) {
        Alert.alert('오류', '녹음을 재생할 수 없습니다.');
      }
    }
  };

  const handleTranscribeRecording = async () => {
    if (audioPath) {
      try {
        await voiceService.transcribeRecording(audioPath);
      } catch (error) {
        Alert.alert('오류', '음성 변환에 실패했습니다.');
      }
    }
  };

  const handleStartRealtimeSTT = async () => {
    try {
      await voiceService.startRealtimeSTT();
      setIsRealtimeSTTActive(true);
    } catch (error) {
      Alert.alert('오류', '실시간 음성 인식을 시작할 수 없습니다.');
    }
  };

  const handleStopRealtimeSTT = async () => {
    try {
      await voiceService.stopRealtimeSTT();
      setIsRealtimeSTTActive(false);
    } catch (error) {
      Alert.alert('오류', '실시간 음성 인식을 중지할 수 없습니다.');
    }
  };

  const toggleEmotion = (emotion: EmotionType) => {
    setEmotionTags(prev => 
      prev.includes(emotion) 
        ? prev.filter(e => e !== emotion)
        : [...prev, emotion]
    );
  };

  const addCharacter = () => {
    if (characterInput.trim() && characters.length < 10) {
      setCharacters(prev => [...prev, characterInput.trim()]);
      setCharacterInput('');
    }
  };

  const removeCharacter = (index: number) => {
    setCharacters(prev => prev.filter((_, i) => i !== index));
  };

  const addSymbol = () => {
    if (symbolInput.trim() && symbols.length < 15) {
      setSymbols(prev => [...prev, symbolInput.trim()]);
      setSymbolInput('');
    }
  };

  const removeSymbol = (index: number) => {
    setSymbols(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!bodyText.trim()) {
      Alert.alert('오류', '꿈 내용을 입력해주세요.');
      return;
    }

    try {
      const dreamData: DreamCreate = {
        dream_date: dreamDate,
        title: title.trim() || undefined,
        body_text: bodyText.trim(),
        audio_file_path: audioPath || undefined,
        lucidity_level: lucidityLevel,
        emotion_tags: emotionTags,
        is_shared: false,
        dream_type: dreamType,
        sleep_quality: sleepQuality,
        location: location.trim() || undefined,
        characters,
        symbols,
      };

      await createDream(dreamData);
      Alert.alert('성공', '꿈 조각이 안전하게 보관되었습니다!', [
        { text: '확인', onPress: () => goBack() }
      ]);
    } catch (error) {
      Alert.alert('오류', '꿈 기록에 실패했습니다.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>꿈 기록하기</Text>
        </View>

        {/* 날짜 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>날짜</Text>
          <TextInput
            style={styles.input}
            value={dreamDate}
            onChangeText={setDreamDate}
            placeholder="YYYY-MM-DD"
          />
        </View>

        {/* 제목 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제목 (선택사항)</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="꿈의 제목을 입력하세요"
            maxLength={100}
          />
        </View>

        {/* 꿈 내용 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>꿈 내용 *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bodyText}
            onChangeText={setBodyText}
            placeholder="꿈의 내용을 자세히 기록해주세요..."
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {/* 음성 녹음 및 STT */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>음성 녹음 및 변환 (선택사항)</Text>
          
          {/* 녹음 컨트롤 */}
          <View style={styles.recordingContainer}>
            {!isRecording ? (
              <TouchableOpacity style={styles.recordButton} onPress={handleStartRecording}>
                <Text style={styles.recordButtonText}>🎤 녹음 시작</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.stopButton} onPress={handleStopRecording}>
                <Text style={styles.stopButtonText}>⏹️ 녹음 중지</Text>
              </TouchableOpacity>
            )}
            
            {recordingTime > 0 && (
              <Text style={styles.recordingTime}>
                {voiceService.formatTime(recordingTime)}
              </Text>
            )}
            
            {audioPath && !isRecording && (
              <TouchableOpacity style={styles.playButton} onPress={handlePlayRecording}>
                <Text style={styles.playButtonText}>▶️ 재생</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* STT 변환 */}
          {audioPath && !isRecording && (
            <View style={styles.sttContainer}>
              <TouchableOpacity 
                style={[styles.sttButton, isTranscribing && styles.disabledButton]} 
                onPress={handleTranscribeRecording}
                disabled={isTranscribing}
              >
                <Text style={styles.sttButtonText}>
                  {isTranscribing ? '🔄 변환 중...' : '📝 텍스트로 변환'}
                </Text>
              </TouchableOpacity>
              
              {transcriptionResult && (
                <View style={styles.transcriptionResult}>
                  <Text style={styles.transcriptionLabel}>변환 결과:</Text>
                  <Text style={styles.transcriptionText}>{transcriptionResult}</Text>
                </View>
              )}
            </View>
          )}

          {/* 실시간 STT */}
          <View style={styles.realtimeSTTContainer}>
            <Text style={styles.realtimeSTTTitle}>실시간 음성 인식</Text>
            {!isRealtimeSTTActive ? (
              <TouchableOpacity style={styles.realtimeSTTButton} onPress={handleStartRealtimeSTT}>
                <Text style={styles.realtimeSTTButtonText}>🎙️ 실시간 인식 시작</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.stopRealtimeSTTButton} onPress={handleStopRealtimeSTT}>
                <Text style={styles.stopRealtimeSTTButtonText}>⏹️ 실시간 인식 중지</Text>
              </TouchableOpacity>
            )}
            
            {isRealtimeSTTActive && (
              <View style={styles.realtimeSTTResult}>
                <Text style={styles.realtimeSTTLabel}>인식 중...</Text>
                <Text style={styles.realtimeSTTText}>{realtimeText}</Text>
              </View>
            )}
          </View>
        </View>

        {/* 명료도 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>명료도: {LUCIDITY_LABELS[lucidityLevel]}</Text>
          <View style={styles.sliderContainer}>
            {[1, 2, 3, 4, 5].map(level => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.sliderButton,
                  lucidityLevel === level && styles.sliderButtonActive
                ]}
                onPress={() => setLucidityLevel(level)}
              >
                <Text style={[
                  styles.sliderButtonText,
                  lucidityLevel === level && styles.sliderButtonTextActive
                ]}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 수면 품질 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>수면 품질: {SLEEP_QUALITY_LABELS[sleepQuality]}</Text>
          <View style={styles.sliderContainer}>
            {[1, 2, 3, 4, 5].map(quality => (
              <TouchableOpacity
                key={quality}
                style={[
                  styles.sliderButton,
                  sleepQuality === quality && styles.sliderButtonActive
                ]}
                onPress={() => setSleepQuality(quality)}
              >
                <Text style={[
                  styles.sliderButtonText,
                  sleepQuality === quality && styles.sliderButtonTextActive
                ]}>
                  {quality}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 꿈 타입 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>꿈 타입</Text>
          <View style={styles.typeContainer}>
            {Object.entries(DREAM_TYPE_LABELS).map(([type, label]) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  dreamType === type && styles.typeButtonActive
                ]}
                onPress={() => setDreamType(type)}
              >
                <Text style={[
                  styles.typeButtonText,
                  dreamType === type && styles.typeButtonTextActive
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 감정 태그 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>감정 태그 (최대 5개)</Text>
          <View style={styles.emotionContainer}>
            {Object.entries(EMOTION_LABELS).map(([emotion, label]) => (
              <TouchableOpacity
                key={emotion}
                style={[
                  styles.emotionButton,
                  emotionTags.includes(emotion as EmotionType) && styles.emotionButtonActive
                ]}
                onPress={() => toggleEmotion(emotion as EmotionType)}
              >
                <Text style={[
                  styles.emotionButtonText,
                  emotionTags.includes(emotion as EmotionType) && styles.emotionButtonTextActive
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 장소 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>장소 (선택사항)</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="꿈이 일어난 장소"
            maxLength={100}
          />
        </View>

        {/* 등장 인물 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>등장 인물 (최대 10명)</Text>
          <View style={styles.tagInputContainer}>
            <TextInput
              style={styles.tagInput}
              value={characterInput}
              onChangeText={setCharacterInput}
              placeholder="인물 이름 입력"
              onSubmitEditing={addCharacter}
            />
            <TouchableOpacity style={styles.addButton} onPress={addCharacter}>
              <Text style={styles.addButtonText}>추가</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tagContainer}>
            {characters.map((character, index) => (
              <TouchableOpacity
                key={index}
                style={styles.tag}
                onPress={() => removeCharacter(index)}
              >
                <Text style={styles.tagText}>{character} ×</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 상징 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>상징 (최대 15개)</Text>
          <View style={styles.tagInputContainer}>
            <TextInput
              style={styles.tagInput}
              value={symbolInput}
              onChangeText={setSymbolInput}
              placeholder="상징 입력"
              onSubmitEditing={addSymbol}
            />
            <TouchableOpacity style={styles.addButton} onPress={addSymbol}>
              <Text style={styles.addButtonText}>추가</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tagContainer}>
            {symbols.map((symbol, index) => (
              <TouchableOpacity
                key={index}
                style={styles.tag}
                onPress={() => removeSymbol(index)}
              >
                <Text style={styles.tagText}>{symbol} ×</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 저장 버튼 */}
        <TouchableOpacity
          style={[styles.saveButton, isCreating && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isCreating}
        >
          <Text style={styles.saveButtonText}>
            {isCreating ? '저장 중...' : '꿈 저장하기'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#191D2E', // Night Sky Blue
  },
  scrollView: {
    flex: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  title: {
    ...DreamRecordTitleStyle,
    color: '#FFDDA8', // Starlight Gold
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...EmotionalSubtitleStyle,
    color: '#FFDDA8', // Starlight Gold
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#4A4063', // Dawn Purple
    borderRadius: 12,
    padding: 16,
    ...BodyFontStyle,
    color: '#EAE8F0', // Warm Grey 100
    borderWidth: 1,
    borderColor: '#595566', // Warm Grey 600
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  recordingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recordButton: {
    backgroundColor: '#FFDDA8', // Starlight Gold
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  recordButtonText: {
    ...ButtonFontStyle,
    color: '#191D2E', // Night Sky Blue
  },
  stopButton: {
    backgroundColor: '#e94560',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  stopButtonText: {
    ...ButtonFontStyle,
    color: '#ffffff',
  },
  playButton: {
    backgroundColor: '#4A4063', // Dawn Purple
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  playButtonText: {
    ...ButtonFontStyle,
    color: '#FFDDA8', // Starlight Gold
  },
  recordingTime: {
    ...BodyFontStyle,
    color: '#FFDDA8', // Starlight Gold
    fontSize: 18,
    fontWeight: 'bold',
  },
  sliderContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  sliderButton: {
    flex: 1,
    backgroundColor: '#4A4063', // Dawn Purple
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#595566', // Warm Grey 600
  },
  sliderButtonActive: {
    backgroundColor: '#FFDDA8', // Starlight Gold
    borderColor: '#FFDDA8',
  },
  sliderButtonText: {
    ...BodyFontStyle,
    color: '#EAE8F0', // Warm Grey 100
    fontSize: 18,
    fontWeight: 'bold',
  },
  sliderButtonTextActive: {
    color: '#191D2E', // Night Sky Blue
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    backgroundColor: '#2d2d44',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#3d3d5c',
  },
  typeButtonActive: {
    backgroundColor: '#e94560',
    borderColor: '#e94560',
  },
  typeButtonText: {
    ...SmallFontStyle,
    color: '#ffffff',
  },
  typeButtonTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  emotionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emotionButton: {
    backgroundColor: '#2d2d44',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#3d3d5c',
  },
  emotionButtonActive: {
    backgroundColor: '#e94560',
    borderColor: '#e94560',
  },
  emotionButtonText: {
    ...SmallFontStyle,
    color: '#ffffff',
    fontSize: 12,
  },
  emotionButtonTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  tagInputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tagInput: {
    flex: 1,
    backgroundColor: '#2d2d44',
    borderRadius: 8,
    padding: 12,
    ...SmallFontStyle,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#3d3d5c',
  },
  addButton: {
    backgroundColor: '#4ecdc4',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  addButtonText: {
    ...ButtonFontStyle,
    color: '#ffffff',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#e94560',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    ...SmallFontStyle,
    color: '#ffffff',
    fontSize: 12,
  },
  saveButton: {
    backgroundColor: '#FFDDA8', // Starlight Gold
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 40,
    shadowColor: '#FFDDA8',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: '#595566', // Warm Grey 600
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    ...PersonalCelebrationStyle,
    color: '#191D2E', // Night Sky Blue
    fontSize: 18,
  },
  sttContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3d3d5c',
  },
  sttButton: {
    backgroundColor: '#4A4063',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#595566',
  },
  sttButtonText: {
    ...ButtonFontStyle,
    color: '#FFDDA8',
  },
  transcriptionResult: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4A4063',
  },
  transcriptionLabel: {
    ...SmallFontStyle,
    color: '#8F8C9B',
    marginBottom: 4,
  },
  transcriptionText: {
    ...BodyFontStyle,
    color: '#EAE8F0',
    lineHeight: 20,
  },
  realtimeSTTContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3d3d5c',
  },
  realtimeSTTTitle: {
    ...EmotionalSubtitleStyle,
    color: '#FFDDA8',
    marginBottom: 12,
  },
  realtimeSTTButton: {
    backgroundColor: '#4A4063',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#595566',
  },
  realtimeSTTButtonText: {
    ...ButtonFontStyle,
    color: '#FFDDA8',
  },
  stopRealtimeSTTButton: {
    backgroundColor: '#e94560',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f56565',
  },
  stopRealtimeSTTButtonText: {
    ...ButtonFontStyle,
    color: '#ffffff',
  },
  realtimeSTTResult: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4A4063',
  },
  realtimeSTTLabel: {
    ...SmallFontStyle,
    color: '#8F8C9B',
    marginBottom: 4,
  },
  realtimeSTTText: {
    ...BodyFontStyle,
    color: '#EAE8F0',
    lineHeight: 20,
  },
});

export default CreateDreamScreen;
