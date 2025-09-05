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
import { useNavigation } from '@react-navigation/native';
import { useDreamStore } from '../../stores/dreamStore';
import { DreamCreate, EmotionType, EMOTION_LABELS, DREAM_TYPE_LABELS, LUCIDITY_LABELS, SLEEP_QUALITY_LABELS } from '../../types/dream';
import audioService from '../../services/audioService';

const CreateDreamScreen: React.FC = () => {
  const navigation = useNavigation();
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
  
  // 음성 녹음 상태
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioPath, setAudioPath] = useState<string | null>(null);
  const [characterInput, setCharacterInput] = useState('');
  const [symbolInput, setSymbolInput] = useState('');

  useEffect(() => {
    // 녹음 시간 업데이트
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(async () => {
        const time = await audioService.getCurrentTime();
        setRecordingTime(time);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const handleStartRecording = async () => {
    try {
      const path = await audioService.startRecording();
      setIsRecording(true);
      setAudioPath(path);
    } catch (error) {
      Alert.alert('오류', '녹음을 시작할 수 없습니다.');
    }
  };

  const handleStopRecording = async () => {
    try {
      await audioService.stopRecording();
      setIsRecording(false);
    } catch (error) {
      Alert.alert('오류', '녹음을 중지할 수 없습니다.');
    }
  };

  const handlePlayRecording = async () => {
    if (audioPath) {
      try {
        await audioService.playRecording(audioPath);
      } catch (error) {
        Alert.alert('오류', '녹음을 재생할 수 없습니다.');
      }
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
      Alert.alert('성공', '꿈이 기록되었습니다!', [
        { text: '확인', onPress: () => navigation.goBack() }
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

        {/* 음성 녹음 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>음성 녹음 (선택사항)</Text>
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
                {audioService.formatTime(recordingTime)}
              </Text>
            )}
            
            {audioPath && !isRecording && (
              <TouchableOpacity style={styles.playButton} onPress={handlePlayRecording}>
                <Text style={styles.playButtonText}>▶️ 재생</Text>
              </TouchableOpacity>
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
    backgroundColor: '#1a1a2e',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#3d3d5c',
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
    backgroundColor: '#e94560',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  recordButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  stopButton: {
    backgroundColor: '#ff6b6b',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  stopButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  playButton: {
    backgroundColor: '#4ecdc4',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  playButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  recordingTime: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sliderContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  sliderButton: {
    flex: 1,
    backgroundColor: '#2d2d44',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3d3d5c',
  },
  sliderButtonActive: {
    backgroundColor: '#e94560',
    borderColor: '#e94560',
  },
  sliderButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sliderButtonTextActive: {
    color: '#ffffff',
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
    color: '#ffffff',
    fontSize: 14,
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
    fontSize: 14,
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
    color: '#ffffff',
    fontWeight: 'bold',
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
    color: '#ffffff',
    fontSize: 12,
  },
  saveButton: {
    backgroundColor: '#e94560',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  disabledButton: {
    backgroundColor: '#6b6b6b',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateDreamScreen;
