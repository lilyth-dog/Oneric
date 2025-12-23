import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigationStore } from '../../stores/navigationStore';
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
  
  const [analysisResult, setAnalysisResult] = useState<DreamAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel>(AIModel.LLAMA_3_8B);
  const [availableModels, setAvailableModels] = useState<any[]>([]);

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
           const dream = await dreamService.getDream(dreamId);
           textToAnalyze = dream.body_text;
           titleToAnalyze = dream.title;
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

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>AI가 꿈을 분석하고 있습니다...</Text>
      <Text style={styles.loadingSubtext}>약 5-10초 정도 소요됩니다</Text>
      
      <View style={styles.skeletonContainer}>
        {/* Header Skeleton */}
        <SkeletonLoader style={{ width: '60%', height: 32, alignSelf: 'center', marginBottom: 8, borderRadius: 8 }} />
        <SkeletonLoader style={{ width: '40%', height: 20, alignSelf: 'center', marginBottom: 32, borderRadius: 4 }} />
        
        {/* Card Skeletons */}
        <SkeletonLoader style={{ width: '100%', height: 150, borderRadius: 16, marginBottom: 16 }} />
        <SkeletonLoader style={{ width: '100%', height: 100, borderRadius: 16, marginBottom: 16 }} />
        <SkeletonLoader style={{ width: '100%', height: 200, borderRadius: 16, marginBottom: 16 }} />
      </View>
    </View>
  );

  return (
    <AnimatedBackground>
      <View style={styles.container}>
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
      </View>
    </AnimatedBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Background handled by AnimatedBackground
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
  },
  loadingSubtext: {
    marginTop: 8,
  },
  skeletonContainer: {
    marginTop: 32,
    width: '100%',
  },
});

export default DreamAnalysisScreen;