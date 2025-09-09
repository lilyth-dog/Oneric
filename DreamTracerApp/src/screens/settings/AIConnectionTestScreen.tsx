/**
 * AI 연결 테스트 화면
 * AI 모델 연결 상태 및 성능 테스트
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigationStore } from '../../stores/navigationStore';
import aiConnectionTestService, { 
  ConnectionTestResult, 
  PerformanceTestResult, 
  ComprehensiveTestResult 
} from '../../services/aiConnectionTest';
import aiService, { AIModel } from '../../services/aiService';
import { 
  EmotionalTitleStyle, 
  EmotionalSubtitleStyle, 
  ButtonFontStyle, 
  BodyFontStyle, 
  SmallFontStyle,
  PersonalGreetingStyle
} from '../../styles/fonts';

const AIConnectionTestScreen: React.FC = () => {
  const { goBack } = useNavigationStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [testResults, setTestResults] = useState<ComprehensiveTestResult | null>(null);
  const [quickTestResult, setQuickTestResult] = useState<boolean | null>(null);
  const [availableModels, setAvailableModels] = useState<any[]>([]);

  useEffect(() => {
    loadAvailableModels();
    performQuickTest();
  }, []);

  const loadAvailableModels = async () => {
    try {
      const models = aiService.getAvailableModels();
      setAvailableModels(models);
    } catch (error) {
      console.error('모델 목록 로드 실패:', error);
    }
  };

  const performQuickTest = async () => {
    try {
      const result = await aiConnectionTestService.quickConnectionTest();
      setQuickTestResult(result);
    } catch (error) {
      console.error('빠른 테스트 실패:', error);
      setQuickTestResult(false);
    }
  };

  const runComprehensiveTest = async () => {
    try {
      setIsLoading(true);
      const result = await aiConnectionTestService.runComprehensiveTest();
      setTestResults(result);
    } catch (error) {
      Alert.alert('오류', error instanceof Error ? error.message : '테스트에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const runConnectionTest = async () => {
    try {
      setIsLoading(true);
      const results = await aiConnectionTestService.testAllConnections();
      
      // 결과를 종합 테스트 형식으로 변환
      const comprehensiveResult: ComprehensiveTestResult = {
        connectionTests: results,
        performanceTests: [],
        recommendedModel: results.find(r => r.isConnected)?.model || AIModel.LLAMA_3_8B,
        overallStatus: results.filter(r => r.isConnected).length > 0 ? 'good' : 'poor',
        summary: `${results.filter(r => r.isConnected).length}/${results.length}개 모델 연결됨`,
        timestamp: new Date().toISOString()
      };
      
      setTestResults(comprehensiveResult);
    } catch (error) {
      Alert.alert('오류', error instanceof Error ? error.message : '연결 테스트에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const runPerformanceTest = async (model: AIModel) => {
    try {
      setIsLoading(true);
      const result = await aiConnectionTestService.runPerformanceTest(model, 3);
      
      Alert.alert(
        '성능 테스트 완료',
        `${model}\n성공률: ${result.successRate.toFixed(1)}%\n평균 응답시간: ${result.averageResponseTime.toFixed(0)}ms`
      );
    } catch (error) {
      Alert.alert('오류', error instanceof Error ? error.message : '성능 테스트에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await performQuickTest();
    setIsRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return '#4ade80';
      case 'good': return '#22c55e';
      case 'fair': return '#eab308';
      case 'poor': return '#ef4444';
      default: return '#8F8C9B';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'excellent': return '우수';
      case 'good': return '양호';
      case 'fair': return '보통';
      case 'poor': return '불량';
      default: return '알 수 없음';
    }
  };

  const renderQuickTestResult = () => (
    <View style={styles.quickTestSection}>
      <Text style={styles.sectionTitle}>빠른 연결 테스트</Text>
      <View style={styles.quickTestContainer}>
        <View style={styles.quickTestStatus}>
          <View style={[
            styles.statusIndicator,
            { backgroundColor: quickTestResult ? '#22c55e' : '#ef4444' }
          ]} />
          <Text style={styles.quickTestText}>
            {quickTestResult === null ? '테스트 중...' : 
             quickTestResult ? 'AI 서버 연결됨' : 'AI 서버 연결 실패'}
          </Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={performQuickTest}>
          <Text style={styles.refreshButtonText}>🔄 새로고침</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTestResults = () => {
    if (!testResults) return null;

    return (
      <View style={styles.resultsSection}>
        <Text style={styles.sectionTitle}>테스트 결과</Text>
        
        {/* 전체 상태 */}
        <View style={styles.overallStatusContainer}>
          <Text style={styles.overallStatusTitle}>전체 상태</Text>
          <View style={styles.overallStatusContent}>
            <View style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(testResults.overallStatus) }
            ]}>
              <Text style={styles.statusBadgeText}>
                {getStatusText(testResults.overallStatus)}
              </Text>
            </View>
            <Text style={styles.overallStatusText}>{testResults.summary}</Text>
          </View>
        </View>

        {/* 추천 모델 */}
        <View style={styles.recommendedModelContainer}>
          <Text style={styles.recommendedModelTitle}>추천 모델</Text>
          <Text style={styles.recommendedModelText}>{testResults.recommendedModel}</Text>
        </View>

        {/* 연결 테스트 결과 */}
        <View style={styles.connectionTestsContainer}>
          <Text style={styles.connectionTestsTitle}>연결 테스트 결과</Text>
          {testResults.connectionTests.map((test, index) => (
            <View key={index} style={styles.connectionTestItem}>
              <View style={styles.connectionTestHeader}>
                <Text style={styles.connectionTestModel}>{test.model}</Text>
                <View style={[
                  styles.connectionTestStatus,
                  { backgroundColor: test.isConnected ? '#22c55e' : '#ef4444' }
                ]}>
                  <Text style={styles.connectionTestStatusText}>
                    {test.isConnected ? '연결됨' : '실패'}
                  </Text>
                </View>
              </View>
              <Text style={styles.connectionTestDetails}>
                응답시간: {test.responseTime}ms
                {test.error && ` | 오류: ${test.error}`}
              </Text>
            </View>
          ))}
        </View>

        {/* 성능 테스트 결과 */}
        {testResults.performanceTests.length > 0 && (
          <View style={styles.performanceTestsContainer}>
            <Text style={styles.performanceTestsTitle}>성능 테스트 결과</Text>
            {testResults.performanceTests.map((test, index) => (
              <View key={index} style={styles.performanceTestItem}>
                <View style={styles.performanceTestHeader}>
                  <Text style={styles.performanceTestModel}>{test.model}</Text>
                  <Text style={styles.performanceTestSuccessRate}>
                    성공률: {test.successRate.toFixed(1)}%
                  </Text>
                </View>
                <Text style={styles.performanceTestDetails}>
                  평균 응답시간: {test.averageResponseTime.toFixed(0)}ms | 
                  성공: {test.successfulTests}/{test.totalTests}
                </Text>
                {test.errors.length > 0 && (
                  <Text style={styles.performanceTestErrors}>
                    오류: {test.errors.join(', ')}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderAvailableModels = () => (
    <View style={styles.modelsSection}>
      <Text style={styles.sectionTitle}>사용 가능한 모델</Text>
      {availableModels.map((model, index) => (
        <View key={index} style={styles.modelItem}>
          <View style={styles.modelInfo}>
            <Text style={styles.modelName}>{model.name}</Text>
            <Text style={styles.modelDescription}>{model.description}</Text>
            <View style={[
              styles.modelAvailability,
              { backgroundColor: model.isAvailable ? '#22c55e' : '#ef4444' }
            ]}>
              <Text style={styles.modelAvailabilityText}>
                {model.isAvailable ? '사용 가능' : '사용 불가'}
              </Text>
            </View>
          </View>
          {model.isAvailable && (
            <TouchableOpacity 
              style={styles.testModelButton}
              onPress={() => runPerformanceTest(model.model)}
            >
              <Text style={styles.testModelButtonText}>테스트</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#FFDDA8']}
            tintColor="#FFDDA8"
          />
        }
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>AI 연결 테스트</Text>
          <Text style={styles.subtitle}>AI 모델 연결 상태 및 성능 확인</Text>
        </View>

        {/* 빠른 테스트 */}
        {renderQuickTestResult()}

        {/* 테스트 버튼 */}
        <View style={styles.testButtonsSection}>
          <TouchableOpacity 
            style={[styles.testButton, styles.connectionTestButton]} 
            onPress={runConnectionTest}
            disabled={isLoading}
          >
            <Text style={styles.testButtonText}>🔗 연결 테스트</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.testButton, styles.comprehensiveTestButton]} 
            onPress={runComprehensiveTest}
            disabled={isLoading}
          >
            <Text style={styles.testButtonText}>🧪 종합 테스트</Text>
          </TouchableOpacity>
        </View>

        {/* 로딩 상태 */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFDDA8" />
            <Text style={styles.loadingText}>테스트 실행 중...</Text>
          </View>
        )}

        {/* 테스트 결과 */}
        {renderTestResults()}

        {/* 사용 가능한 모델 */}
        {renderAvailableModels()}

        {/* 하단 여백 */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
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
    ...EmotionalTitleStyle,
    color: '#FFDDA8',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    ...EmotionalSubtitleStyle,
    color: '#8F8C9B',
    textAlign: 'center',
  },
  quickTestSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...EmotionalSubtitleStyle,
    color: '#FFDDA8',
    marginBottom: 16,
  },
  quickTestContainer: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3d3d5c',
  },
  quickTestStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  quickTestText: {
    ...BodyFontStyle,
    color: '#EAE8F0',
  },
  refreshButton: {
    backgroundColor: '#4A4063',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  refreshButtonText: {
    ...SmallFontStyle,
    color: '#FFDDA8',
  },
  testButtonsSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  testButton: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  connectionTestButton: {
    backgroundColor: '#4A4063',
    borderWidth: 1,
    borderColor: '#595566',
  },
  comprehensiveTestButton: {
    backgroundColor: '#FFDDA8',
    borderWidth: 1,
    borderColor: '#FFDDA8',
  },
  testButtonText: {
    ...ButtonFontStyle,
    color: '#EAE8F0',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    ...BodyFontStyle,
    color: '#FFDDA8',
    marginTop: 12,
  },
  resultsSection: {
    marginBottom: 24,
  },
  overallStatusContainer: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3d3d5c',
  },
  overallStatusTitle: {
    ...BodyFontStyle,
    color: '#FFDDA8',
    fontWeight: '600',
    marginBottom: 8,
  },
  overallStatusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusBadgeText: {
    ...SmallFontStyle,
    color: '#ffffff',
    fontWeight: '600',
  },
  overallStatusText: {
    ...BodyFontStyle,
    color: '#EAE8F0',
    flex: 1,
  },
  recommendedModelContainer: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3d3d5c',
  },
  recommendedModelTitle: {
    ...BodyFontStyle,
    color: '#FFDDA8',
    fontWeight: '600',
    marginBottom: 8,
  },
  recommendedModelText: {
    ...BodyFontStyle,
    color: '#EAE8F0',
  },
  connectionTestsContainer: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3d3d5c',
  },
  connectionTestsTitle: {
    ...BodyFontStyle,
    color: '#FFDDA8',
    fontWeight: '600',
    marginBottom: 12,
  },
  connectionTestItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3d3d5c',
  },
  connectionTestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  connectionTestModel: {
    ...BodyFontStyle,
    color: '#EAE8F0',
    fontWeight: '600',
  },
  connectionTestStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  connectionTestStatusText: {
    ...SmallFontStyle,
    color: '#ffffff',
    fontSize: 10,
  },
  connectionTestDetails: {
    ...SmallFontStyle,
    color: '#8F8C9B',
  },
  performanceTestsContainer: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3d3d5c',
  },
  performanceTestsTitle: {
    ...BodyFontStyle,
    color: '#FFDDA8',
    fontWeight: '600',
    marginBottom: 12,
  },
  performanceTestItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3d3d5c',
  },
  performanceTestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  performanceTestModel: {
    ...BodyFontStyle,
    color: '#EAE8F0',
    fontWeight: '600',
  },
  performanceTestSuccessRate: {
    ...SmallFontStyle,
    color: '#22c55e',
    fontWeight: '600',
  },
  performanceTestDetails: {
    ...SmallFontStyle,
    color: '#8F8C9B',
  },
  performanceTestErrors: {
    ...SmallFontStyle,
    color: '#ef4444',
    marginTop: 4,
  },
  modelsSection: {
    marginBottom: 24,
  },
  modelItem: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3d3d5c',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modelInfo: {
    flex: 1,
  },
  modelName: {
    ...BodyFontStyle,
    color: '#EAE8F0',
    fontWeight: '600',
    marginBottom: 4,
  },
  modelDescription: {
    ...SmallFontStyle,
    color: '#8F8C9B',
    marginBottom: 8,
  },
  modelAvailability: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  modelAvailabilityText: {
    ...SmallFontStyle,
    color: '#ffffff',
    fontSize: 10,
  },
  testModelButton: {
    backgroundColor: '#4A4063',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  testModelButtonText: {
    ...SmallFontStyle,
    color: '#FFDDA8',
  },
  bottomSpacer: {
    height: 40,
  },
});

export default AIConnectionTestScreen;
