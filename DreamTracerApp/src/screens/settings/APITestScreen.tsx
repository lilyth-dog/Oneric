import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Fonts } from '../../styles/fonts';
import { APITestService } from '../../services/apiTest';

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
}

export const APITestScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<{
    serverHealth?: TestResult;
    availableModels?: TestResult;
    dreamAnalysis?: TestResult;
    overallSuccess?: boolean;
  }>({});

  const runServerHealthTest = async () => {
    setIsLoading(true);
    try {
      const result = await APITestService.testServerHealth();
      setTestResults(prev => ({ ...prev, serverHealth: result }));
    } catch (error) {
      Alert.alert('오류', '서버 상태 확인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const runModelsTest = async () => {
    setIsLoading(true);
    try {
      const result = await APITestService.testAvailableModels();
      setTestResults(prev => ({ ...prev, availableModels: result }));
    } catch (error) {
      Alert.alert('오류', '모델 목록 조회 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const runDreamAnalysisTest = async () => {
    setIsLoading(true);
    try {
      const result = await APITestService.testDreamAnalysis();
      setTestResults(prev => ({ ...prev, dreamAnalysis: result }));
    } catch (error) {
      Alert.alert('오류', '꿈 분석 테스트 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const runFullTest = async () => {
    setIsLoading(true);
    try {
      const results = await APITestService.runFullTest();
      setTestResults(results);
      
      if (results.overallSuccess) {
        Alert.alert('성공!', '모든 API 테스트가 성공했습니다! 🎉');
      } else {
        Alert.alert('일부 실패', '일부 API 테스트가 실패했습니다. 로그를 확인해주세요.');
      }
    } catch (error) {
      Alert.alert('오류', '전체 테스트 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const TestResultItem: React.FC<{ title: string; result?: TestResult }> = ({ title, result }) => (
    <View style={styles.testResultItem}>
      <Text style={styles.testResultTitle}>{title}</Text>
      {result ? (
        <View style={[styles.testResultContent, { backgroundColor: result.success ? '#E8F5E8' : '#FFE8E8' }]}>
          <Text style={[styles.testResultStatus, { color: result.success ? '#2E7D32' : '#D32F2F' }]}>
            {result.success ? '✅ 성공' : '❌ 실패'}
          </Text>
          <Text style={styles.testResultMessage}>{result.message}</Text>
          {result.data && (
            <Text style={styles.testResultData}>
              {JSON.stringify(result.data, null, 2)}
            </Text>
          )}
        </View>
      ) : (
        <Text style={styles.testResultPending}>테스트 대기 중...</Text>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>API 연결 테스트</Text>
        <Text style={styles.subtitle}>Vercel AI 서버 연결 상태 확인</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.testButton, styles.fullTestButton]}
          onPress={runFullTest}
          disabled={isLoading}
        >
          <Text style={styles.fullTestButtonText}>🚀 전체 테스트 실행</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.testButton}
          onPress={runServerHealthTest}
          disabled={isLoading}
        >
          <Text style={styles.testButtonText}>🏥 서버 상태 확인</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.testButton}
          onPress={runModelsTest}
          disabled={isLoading}
        >
          <Text style={styles.testButtonText}>🤖 모델 목록 조회</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.testButton}
          onPress={runDreamAnalysisTest}
          disabled={isLoading}
        >
          <Text style={styles.testButtonText}>🔮 꿈 분석 테스트</Text>
        </TouchableOpacity>
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A4063" />
          <Text style={styles.loadingText}>테스트 실행 중...</Text>
        </View>
      )}

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>테스트 결과</Text>
        
        <TestResultItem title="서버 상태" result={testResults.serverHealth} />
        <TestResultItem title="사용 가능한 모델" result={testResults.availableModels} />
        <TestResultItem title="꿈 분석" result={testResults.dreamAnalysis} />
        
        {testResults.overallSuccess !== undefined && (
          <View style={styles.overallResult}>
            <Text style={styles.overallResultTitle}>전체 결과</Text>
            <Text style={[
              styles.overallResultStatus,
              { color: testResults.overallSuccess ? '#2E7D32' : '#D32F2F' }
            ]}>
              {testResults.overallSuccess ? '🎉 모든 테스트 성공!' : '⚠️ 일부 테스트 실패'}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  title: {
    fontSize: 24,
    fontFamily: Fonts.primary.bold,
    color: '#2C3E50',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Fonts.primary.regular,
    color: '#6C757D',
  },
  buttonContainer: {
    padding: 20,
  },
  testButton: {
    backgroundColor: '#4A4063',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  fullTestButton: {
    backgroundColor: '#28A745',
    marginBottom: 20,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: Fonts.primary.medium,
  },
  fullTestButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: Fonts.primary.bold,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: Fonts.primary.medium,
    color: '#4A4063',
  },
  resultsContainer: {
    padding: 20,
  },
  resultsTitle: {
    fontSize: 20,
    fontFamily: Fonts.primary.bold,
    color: '#2C3E50',
    marginBottom: 16,
  },
  testResultItem: {
    marginBottom: 16,
  },
  testResultTitle: {
    fontSize: 16,
    fontFamily: Fonts.primary.bold,
    color: '#495057',
    marginBottom: 8,
  },
  testResultContent: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  testResultStatus: {
    fontSize: 14,
    fontFamily: Fonts.primary.bold,
    marginBottom: 4,
  },
  testResultMessage: {
    fontSize: 14,
    fontFamily: Fonts.primary.regular,
    color: '#495057',
    marginBottom: 8,
  },
  testResultData: {
    fontSize: 12,
    fontFamily: Fonts.primary.regular,
    color: '#6C757D',
    backgroundColor: '#F8F9FA',
    padding: 8,
    borderRadius: 4,
  },
  testResultPending: {
    fontSize: 14,
    fontFamily: Fonts.primary.regular,
    color: '#6C757D',
    fontStyle: 'italic',
  },
  overallResult: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  overallResultTitle: {
    fontSize: 18,
    fontFamily: Fonts.primary.bold,
    color: '#2C3E50',
    marginBottom: 8,
  },
  overallResultStatus: {
    fontSize: 16,
    fontFamily: Fonts.primary.medium,
  },
});
