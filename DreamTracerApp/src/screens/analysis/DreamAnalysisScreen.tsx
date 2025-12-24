import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigationStore } from '../../stores/navigationStore';
import { useDreamStore } from '../../stores/dreamStore';
import { useAuthStore } from '../../stores/authStore'; // Imported
import { dreamSharingService } from '../../services/dreamSharingService';
import DreamShareCard from '../../components/share/DreamShareCard';
import { hapticService } from '../../services/hapticService';
import { soundService } from '../../services/soundService';
import dreamAnalysisService, { DreamAnalysisRequest, DreamAnalysisResponse } from '../../services/dreamAnalysisService';
import dreamService from '../../services/dreamService';
import aiService, { AIModel } from '../../services/aiService';
import communityService from '../../services/communityService';
import { AnalysisResultView } from '../../components/dream/AnalysisResultView';
import {
  PersonalGreetingStyle,
  SmallFontStyle,
} from '../../styles/fonts';
import AnimatedBackground from '../../components/AnimatedBackground';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import LoadingPortal from '../../components/common/LoadingPortal';

interface DreamAnalysisScreenProps {
  dreamId: string;
  dreamText?: string;
  dreamTitle?: string;
  emotionTags?: string[];
  lucidityLevel?: number;
  sleepQuality?: number;
}

const DreamAnalysisScreen: React.FC<DreamAnalysisScreenProps> = ({
  dreamId,
  dreamText,
  dreamTitle,
  emotionTags,
  lucidityLevel,
  sleepQuality
}) => {
  const { goBack } = useNavigationStore();
  const { user } = useAuthStore(); // Correct store
  
  // Local state for dream data if not provided
  const [localDream, setLocalDream] = useState<any>(null);

  // use dream passed via params or fetched localDream
  const dream = localDream || {
      id: dreamId,
      title: dreamTitle,
      body_text: dreamText, 
      emotion_tags: emotionTags,
      lucidity_level: lucidityLevel,
      created_at: new Date().toISOString() // Fallback
  };

  const [analysisResult, setAnalysisResult] = useState<DreamAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel>(AIModel.LLAMA_3_8B);
  const [availableModels, setAvailableModels] = useState<any[]>([]);

  // Share Ref
  const shareCardRef = useRef(null);

  useEffect(() => {
    loadAvailableModels();
    performAnalysis();
  }, []);

  const loadAvailableModels = async () => {
    try {
      const models = aiService.getAvailableModels();
      setAvailableModels(models);
    } catch (error) {
      console.error('모델 목록 로드 실패:', error);
    }
  };

  const performAnalysis = async () => {
    try {
      setIsLoading(true);

      let textToAnalyze = dreamText;
      let titleToAnalyze = dreamTitle;

      // 텍스트가 없으면 꿈 정보를 조회
      if (!textToAnalyze) {
         try {
           const dreamData = await dreamService.getDream(dreamId);
           setLocalDream(dreamData); // Set local state for sharing
           textToAnalyze = dreamData.body_text;
           titleToAnalyze = dreamData.title;
         } catch (e) {
           console.error('Failed to fetch dream details:', e);
         }
      }

      const request: DreamAnalysisRequest = {
        dreamId,
        dreamText: textToAnalyze || '내용 없음', // Fallback
        dreamTitle: titleToAnalyze,
        emotionTags,
        lucidityLevel,
        sleepQuality
      };

      const result = await dreamAnalysisService.analyzeDream(request);
      setAnalysisResult(result);
    } catch (error) {
      Alert.alert('오류', error instanceof Error ? error.message : '분석에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await performAnalysis();
    setIsRefreshing(false);
  };

  const handleModelChange = async (model: AIModel) => {
    try {
      const success = await aiService.switchModel(model);
      if (success) {
        setSelectedModel(model);
        await performAnalysis();
      } else {
        Alert.alert('오류', '모델 변경에 실패했습니다.');
      }
    } catch (error) {
      Alert.alert('오류', '모델 변경 중 오류가 발생했습니다.');
    }
  };

  const handleShareAnalysis = async () => {
    if (!analysisResult) return;

    Alert.alert(
      '커뮤니티 공유',
      '이 꿈과 분석 결과를 커뮤니티에 공유하시겠습니까? (익명으로 게시됩니다)',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '공유하기',
          onPress: async () => {
            try {
              // 꿈 내용과 분석 요약을 합쳐서 게시
              const content = `✨ [AI 꿈 분석]\n${analysisResult.analysis.summary}\n\n📖 [꿈 내용]\n${dreamText || '내용 없음'}`;

              await communityService.createPost({
                content: content,
                tags: analysisResult.analysis.keywords,
                is_anonymous: true,
                dream_id: dreamId,
              });

              Alert.alert('성공', '커뮤니티에 공유되었습니다!');
            } catch (error) {
              Alert.alert('오류', '공유에 실패했습니다.');
              console.error(error);
            }
          }
        }
      ]
    );
  };

  const handleSaveAnalysis = () => {
    if (analysisResult) {
      // 분석 결과 저장 로직
      Alert.alert('저장', '분석 결과를 저장했습니다.');
    }
  };

  const handleShare = async () => {
    if (!shareCardRef.current || !dream) return;

    hapticService.trigger('medium');

    try {
        await dreamSharingService.shareDreamCard(
            shareCardRef.current,
            `Oneiric: ${dream.title}`,
            '제가 꾼 꿈을 Oneiric에서 확인해보세요! 🌙'
        );
        soundService.play('success');
    } catch (e) {
        Alert.alert('공유 실패', '이미지를 생성하는 중 오류가 발생했습니다.');
    }
  };

  const renderLoadingState = () => (
    <LoadingPortal message="AI가 당신의 꿈을 세밀하게 분석하고 있습니다..." />
  );

  return (
    <AnimatedBackground>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#FFDDA8" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>꿈 분석</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
           <Icon name="share-social-outline" size={20} color="#FFDDA8" />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.content}>
        {isLoading ? (
          renderLoadingState()
        ) : analysisResult ? (
          <AnalysisResultView
            analysisResult={analysisResult}
            dreamTitle={dreamTitle}
            selectedModel={selectedModel}
            availableModels={availableModels}
            onModelChange={handleModelChange}
            onShare={handleShareAnalysis}
            onSave={handleSaveAnalysis}
          />
        ) : null}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Hidden View for Sharing (Rendered off-screen but capture-able) */}
      {dream && (
          <View
            ref={shareCardRef}
            collapsable={false} // Android: Ensure view is not optimized away
            style={styles.hiddenShareCard}
          >
             <DreamShareCard dream={dream} userName={user?.name || 'Dreamer'} />
          </View>
      )}
    </AnimatedBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Background handled by AnimatedBackground
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 15,
    backgroundColor: 'rgba(0,0,0,0.2)', // Semi-transparent header
  },
  headerTitle: {
    ...PersonalGreetingStyle,
    color: '#FFDDA8',
    fontSize: 20,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 14,
    color: '#FFDDA8',
  },
  shareButton: {
      padding: 8,
      backgroundColor: 'rgba(255, 221, 168, 0.1)',
      borderRadius: 12,
  },
  shareButtonText: {
      fontSize: 12,
      color: '#FFDDA8',
      fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    ...PersonalGreetingStyle,
    color: '#FFDDA8',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 18,
  },
  loadingSubtext: {
    marginTop: 8,
  },
  skeletonContainer: {
    marginTop: 32,
    width: '100%',
  },
  bottomSpacer: {
    height: 40,
  },
  hiddenShareCard: {
      position: 'absolute',
      top: 2000,
      left: 0,
      opacity: 1, 
      zIndex: -1,
  }
});

export default DreamAnalysisScreen;