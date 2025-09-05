/**
 * 온보딩 4단계: 목표 설정
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { OnboardingStep4 as OnboardingStep4Type } from '../../types/auth';

interface Props {
  onComplete: (data: OnboardingStep4Type) => void;
  onBack: () => void;
}

const OnboardingStep4: React.FC<Props> = ({ onComplete, onBack }) => {
  const [primaryGoal, setPrimaryGoal] = useState<string | null>(null);
  const [dreamFrequency, setDreamFrequency] = useState<string | null>(null);

  const goals = [
    {
      id: 'understand_dreams',
      title: '꿈 이해하기',
      description: '꿈의 의미와 메시지를 알고 싶어요',
      icon: '🔍',
    },
    {
      id: 'improve_sleep',
      title: '수면 개선',
      description: '더 좋은 잠을 자고 싶어요',
      icon: '😴',
    },
    {
      id: 'lucid_dreaming',
      title: '자각몽 경험',
      description: '자각몽을 꾸고 싶어요',
      icon: '✨',
    },
    {
      id: 'nightmare_help',
      title: '악몽 극복',
      description: '악몽을 극복하고 싶어요',
      icon: '🛡️',
    },
  ];

  const frequencies = [
    { id: 'daily', label: '매일', description: '매일 꿈을 기록합니다' },
    { id: 'weekly', label: '주 3-4회', description: '주 3-4회 꿈을 기록합니다' },
    { id: 'monthly', label: '월 1-2회', description: '월 1-2회 꿈을 기록합니다' },
    { id: 'rarely', label: '가끔', description: '특별한 꿈만 기록합니다' },
  ];

  const handleComplete = () => {
    if (!primaryGoal) {
      Alert.alert('오류', '주요 목표를 선택해주세요.');
      return;
    }

    if (!dreamFrequency) {
      Alert.alert('오류', '꿈 기록 빈도를 선택해주세요.');
      return;
    }

    onComplete({
      primary_goal: primaryGoal,
      dream_frequency: dreamFrequency,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>목표를 설정해주세요</Text>
          <Text style={styles.subtitle}>더 나은 경험을 위해 필요합니다</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>주요 목표</Text>
          <View style={styles.goalsContainer}>
            {goals.map((goal) => (
              <TouchableOpacity
                key={goal.id}
                style={[
                  styles.goalCard,
                  primaryGoal === goal.id && styles.selectedGoalCard,
                ]}
                onPress={() => setPrimaryGoal(goal.id)}
              >
                <Text style={styles.goalIcon}>{goal.icon}</Text>
                <Text
                  style={[
                    styles.goalTitle,
                    primaryGoal === goal.id && styles.selectedGoalTitle,
                  ]}
                >
                  {goal.title}
                </Text>
                <Text
                  style={[
                    styles.goalDescription,
                    primaryGoal === goal.id && styles.selectedGoalDescription,
                  ]}
                >
                  {goal.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>꿈 기록 빈도</Text>
          <View style={styles.frequencyContainer}>
            {frequencies.map((frequency) => (
              <TouchableOpacity
                key={frequency.id}
                style={[
                  styles.frequencyCard,
                  dreamFrequency === frequency.id && styles.selectedFrequencyCard,
                ]}
                onPress={() => setDreamFrequency(frequency.id)}
              >
                <Text
                  style={[
                    styles.frequencyTitle,
                    dreamFrequency === frequency.id && styles.selectedFrequencyTitle,
                  ]}
                >
                  {frequency.label}
                </Text>
                <Text
                  style={[
                    styles.frequencyDescription,
                    dreamFrequency === frequency.id && styles.selectedFrequencyDescription,
                  ]}
                >
                  {frequency.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>이전</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
            <Text style={styles.completeButtonText}>완료</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#a8a8a8',
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  goalsContainer: {
    gap: 12,
  },
  goalCard: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3d3d5c',
  },
  selectedGoalCard: {
    backgroundColor: '#e94560',
    borderColor: '#e94560',
  },
  goalIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  selectedGoalTitle: {
    color: '#ffffff',
  },
  goalDescription: {
    fontSize: 14,
    color: '#a8a8a8',
    textAlign: 'center',
  },
  selectedGoalDescription: {
    color: '#ffffff',
  },
  frequencyContainer: {
    gap: 8,
  },
  frequencyCard: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3d3d5c',
  },
  selectedFrequencyCard: {
    backgroundColor: '#e94560',
    borderColor: '#e94560',
  },
  frequencyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  selectedFrequencyTitle: {
    color: '#ffffff',
  },
  frequencyDescription: {
    fontSize: 14,
    color: '#a8a8a8',
  },
  selectedFrequencyDescription: {
    color: '#ffffff',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3d3d5c',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  completeButton: {
    flex: 1,
    backgroundColor: '#e94560',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OnboardingStep4;
