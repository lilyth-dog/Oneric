import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert, LayoutAnimation, Keyboard, ScrollView, Animated } from 'react-native';
import { useNavigationStore } from '../../stores/navigationStore';
import { useDreamStore } from '../../stores/dreamStore';
import voiceService, { VoiceServiceCallbacks, RealtimeSTTResult } from '../../services/voiceService';
import GlassView from '../../components/common/GlassView';
import DreamCatcher from '../../components/dream/DreamCatcher';
import { DreamRecordTitleStyle, EmotionalSubtitleStyle, ButtonFontStyle, BodyFontStyle, SmallFontStyle } from '../../styles/fonts';
import AITagSuggestion from '../../components/dream/AITagSuggestion';
import Icon from 'react-native-vector-icons/Ionicons';

// Types
type WizardStep = 1 | 2;

const CreateDreamScreen: React.FC = () => {
    const { goBack, navigate } = useNavigationStore();
    const { createDream, isCreating } = useDreamStore();
    
    // Wizard State
    const [step, setStep] = useState<WizardStep>(1);
    const [fadeAnim] = useState(new Animated.Value(1));

    // Data State
    const [bodyText, setBodyText] = useState('');
    const [title, setTitle] = useState('');
    const [dreamDate, setDreamDate] = useState(new Date().toISOString().split('T')[0]);
    const [audioPath, setAudioPath] = useState<string | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [lucidityLevel, setLucidityLevel] = useState(3);
    
    // Recording State
    const [isRecording, setIsRecording] = useState(false);
    const [audioAmplitude, setAudioAmplitude] = useState(0.5);
    const [isInputMode, setIsInputMode] = useState<'voice' | 'text'>('voice');

    // Voice Service Setup (Copied from Legacy)
    useEffect(() => {
        const callbacks: VoiceServiceCallbacks = {
            onRecordingStart: () => setIsRecording(true),
            onRecordingStop: (path) => {
                setIsRecording(false);
                setAudioPath(path);
                // Auto-advance to text review if needed, or stay
            },
            onTranscriptionComplete: (result) => {
                 setBodyText(prev => prev + (prev ? '\n' : '') + result.text);
            },
            onRealtimeSTTResult: (result) => { // Optional: Realtime
                if (result.isFinal) setBodyText(prev => prev + ' ' + result.finalText);
            },
            onError: (err) => Alert.alert('오류', err.message)
        };
        voiceService.setCallbacks(callbacks);
        
        let interval: NodeJS.Timeout;
        if (isRecording) {
            interval = setInterval(async () => {
                const time = await voiceService.getCurrentTime();
                const amp = Math.random() * 0.5 + 0.3; // Simulated amplitude if not available
                setRecordingTime(time);
                setAudioAmplitude(amp);
            }, 100);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    // Handlers
    const toggleRecording = async () => {
        if (isRecording) {
            await voiceService.stopRecording();
        } else {
            await voiceService.startRecording();
            // Also start STT if supported, or handled by separate button?
            // For Simple Flow, let's assume Voice Record IS the input, STT happens in background or on demand.
            // Let's keep it simple: Record Audio. STT is a "Process" button in Step 2 or auto.
            // Actually user wants "Capture".
            // Let's auto-transcribe after stop in V2? Or keep manual?
            // "Dream Catcher" implies catching the voice.
            // Let's stick to simple record first.
        }
    };

    const handleNext = () => {
        if (!bodyText.trim() && !audioPath) {
             Alert.alert('비어있음', '꿈 내용을 기록해주세요 (음성 또는 텍스트).');
             return;
        }
        
        // Validation passed
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setStep(2);
    };

    const handleSave = async () => {
        try {
            await createDream({
                body_text: bodyText || '음성 기록된 꿈',
                title: title || '새로운 꿈',
                dream_date: dreamDate,
                lucidity_level: lucidityLevel,
                audio_file_path: audioPath || undefined,
                dream_type: 'normal',
                is_shared: false,
                emotion_tags: [], // Will be filled by AI Analysis screen or Backend
                sleep_quality: 3,
                characters: [],
                symbols: []
            });
            Alert.alert('저장 완료', '꿈이 안전하게 보관되었습니다.', [
                { text: '확인', onPress: () => goBack() } // Or navigate to Analysis
            ]);
        } catch (e) {
            Alert.alert('오류', '저장 실패');
        }
    };

    // --- RENDER STEP 1: CAPTURE ---
    const renderStep1 = () => (
        <View style={styles.stepContainer}>
            <View style={styles.header}>
                <TouchableOpacity onPress={goBack} style={styles.closeButton}>
                    <Icon name="close" size={24} color="#8F8C9B" />
                </TouchableOpacity>
                <Text style={styles.stepTitle}>꿈 포착하기</Text>
            </View>

            <View style={styles.captureContent}>
                <Text style={styles.questionText}>오늘 어떤 꿈을 꾸셨나요?</Text>
                
                {isInputMode === 'voice' ? (
                    <View style={styles.voiceContainer}>
                        <DreamCatcher 
                            isRecording={isRecording} 
                            onToggleRecording={toggleRecording} 
                            audioLevel={audioAmplitude}
                        />
                         <Text style={styles.timerText}>
                            {isRecording ? voiceService.formatTime(recordingTime) : (audioPath ? '녹음 완료' : '터치하여 기록 시작')}
                        </Text>
                    </View>
                ) : (
                    <GlassView style={styles.textInputContainer}>
                        <TextInput 
                            style={styles.textArea}
                            placeholder="꿈 내용을 자유롭게 적어주세요..."
                            placeholderTextColor="#595566"
                            multiline
                            value={bodyText}
                            onChangeText={setBodyText}
                        />
                    </GlassView>
                )}

                {/* Mode Switcher */}
                <View style={styles.modeSwitcher}>
                    <TouchableOpacity 
                        style={[styles.modeButton, isInputMode === 'voice' && styles.modeButtonActive]}
                        onPress={() => setIsInputMode('voice')}
                    >
                        <Icon name="mic" size={24} color={isInputMode === 'voice' ? '#FFDDA8' : '#8F8C9B'} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.modeButton, isInputMode === 'text' && styles.modeButtonActive]}
                        onPress={() => setIsInputMode('text')}
                    >
                        <Icon name="keypad" size={24} color={isInputMode === 'text' ? '#FFDDA8' : '#8F8C9B'} />
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextButtonText}>다음</Text>
                <Icon name="arrow-forward" size={20} color="#FFDDA8" style={{marginLeft: 8}} />
            </TouchableOpacity>
        </View>
    );

    // --- RENDER STEP 2: REFINE ---
    const renderStep2 = () => (
        <ScrollView style={styles.stepContainer} contentContainerStyle={{ paddingBottom: 40 }}>
             <View style={styles.header}>
                <TouchableOpacity onPress={() => setStep(1)} style={styles.closeButton}>
                    <Icon name="arrow-back" size={24} color="#8F8C9B" />
                </TouchableOpacity>
                <Text style={styles.stepTitle}>꿈 다듬기</Text>
            </View>

            <GlassView style={styles.refineForm}>
                 {/* Auto-Transcription or Text View */}
                 <Text style={styles.label}>내용</Text>
                 <TextInput 
                    style={[styles.input, styles.textAreaSmall]}
                    multiline
                    value={bodyText}
                    onChangeText={setBodyText}
                    placeholder={audioPath ? "음성 메모가 포함되어 있습니다." : "내용"}
                 />

                 <Text style={styles.label}>제목 (AI 추천 예정)</Text>
                 <TextInput 
                    style={styles.input}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="꿈에 제목을 붙여주세요"
                 />

                 <Text style={styles.label}>명료도 ({lucidityLevel})</Text>
                 <View style={styles.sliderRow}>
                    {[1,2,3,4,5].map(v => (
                        <TouchableOpacity 
                            key={v} 
                            style={[styles.sliderDot, lucidityLevel === v && styles.sliderDotActive]}
                            onPress={() => setLucidityLevel(v)}
                        >
                            <Text style={styles.sliderText}>{v}</Text>
                        </TouchableOpacity>
                    ))}
                 </View>

                 {/* AI Tags - Simplified for now, just placeholder or use component */}
                 <Text style={styles.label}>AI 분석 태그</Text>
                 <View style={styles.tagPlaceholder}>
                    <Icon name="sparkles" size={20} color="#8F8C9B" style={{marginBottom: 8}} />
                    <Text style={{color:'#8F8C9B'}}>저장 후 AI가 자동으로 분석합니다.</Text>
                 </View>

            </GlassView>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>{isCreating ? '저장 중...' : '꿈 저장하기'}</Text>
            </TouchableOpacity>
        </ScrollView>
    );

    return (
        <View style={styles.container}>
            {step === 1 ? renderStep1() : renderStep2()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#191D2E' },
    stepContainer: { flex: 1, padding: 24 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 40, marginTop: 20 },
    closeButton: { padding: 8 },
    closeButtonText: { color: '#8F8C9B', fontSize: 24 },
    stepTitle: { ...DreamRecordTitleStyle, color: '#FFDDA8', flex: 1, textAlign: 'center', marginRight: 32 },
    
    captureContent: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    questionText: { ...EmotionalSubtitleStyle, color: '#EAE8F0', marginBottom: 40 },
    voiceContainer: { alignItems: 'center', marginBottom: 40 },
    timerText: { ...BodyFontStyle, color: '#FFDDA8', marginTop: 20 },
    
    textInputContainer: { width: '100%', height: 200, marginBottom: 40 },
    textArea: { color: '#EAE8F0', flex: 1, textAlignVertical: 'top', fontSize: 16 },
    
    modeSwitcher: { flexDirection: 'row', backgroundColor: '#2d2d44', borderRadius: 20, padding: 4 },
    modeButton: { padding: 12, borderRadius: 16, width: 60, alignItems: 'center' },
    modeButtonActive: { backgroundColor: '#4A4063' },
    modeIcon: { fontSize: 24 },

    nextButton: { backgroundColor: '#4A4063', padding: 20, borderRadius: 16, alignItems: 'center', marginTop: 20 },
    nextButtonText: { ...ButtonFontStyle, color: '#FFDDA8' },

    refineForm: { padding: 20 },
    label: { ...SmallFontStyle, color: '#8F8C9B', marginBottom: 8, marginTop: 16 },
    input: { backgroundColor: '#2d2d44', padding: 16, borderRadius: 12, color: '#EAE8F0', fontSize: 16 },
    textAreaSmall: { height: 100, textAlignVertical: 'top' },
    
    sliderRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
    sliderDot: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#2d2d44', alignItems: 'center', justifyContent: 'center', borderWidth:1, borderColor: '#3d3d5c' },
    sliderDotActive: { backgroundColor: '#FFDDA8', borderColor: '#FFDDA8' },
    sliderText: { fontWeight: 'bold', color: '#191D2E' },

    tagPlaceholder: { padding: 16, backgroundColor: 'rgba(74, 64, 99, 0.2)', borderRadius: 12, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#595566' },

    saveButton: { backgroundColor: '#FFDDA8', padding: 20, borderRadius: 16, alignItems: 'center', marginTop: 40, marginBottom: 40 },
    saveButtonText: { ...ButtonFontStyle, color: '#191D2E' }
});

export default CreateDreamScreen;
