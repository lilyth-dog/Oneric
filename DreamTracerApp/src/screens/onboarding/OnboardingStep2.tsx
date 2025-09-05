/**
 * 온보딩 2단계: 관심사
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
import { OnboardingStep2 as OnboardingStep2Type } from '../../types/auth';

interface Props {
  onNext: (data: OnboardingStep2Type) => void;
  onBack: () => void;
}

const OnboardingStep2: React.FC<Props> = ({ onNext, onBack }) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const interests = [
    { id: 'dream_analysis', label: '꿈 분석', description: '꿈의 의미를 알고 싶어요' },
    { id: 'lucidity', label: '자각몽', description: '자각몽을 경험하고 싶어요' },
    { id: 'nightmares', label: '악몽 관리', description: '악몽을 극복하고 싶어요' },
    { id: 'symbols', label: '꿈의 상징', description: '꿈의 상징을 이해하고 싶어요' },
    { id: 'sleep_quality', label: '수면 품질', description: '더 좋은 잠을 자고 싶어요' },
    { id: 'dream_recall', label: '꿈 기억', description: '꿈을 더 잘 기억하고 싶어요' },
  ];

  const toggleInterest = (interestId: string) => {
    setSelectedInterests(prev => {
      if (prev.includes(interestId)) {
        return prev.filter(id => id !== interestId);
      } else {
        return [...prev, interestId];
      }
    });
  };

  const handleNext = () => {
    if (selectedInterests.length === 0) {
      Alert.alert('오류', '최소 하나의 관심사를 선택해주세요.');
      return;
    }

    onNext({
      interests: selectedInterests,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>관심사를 선택해주세요</Text>
          <Text style={styles.subtitle}>여러 개 선택 가능합니다</Text>
        </View>

        <View style={styles.interestsContainer}>
          {interests.map((interest) => (
            <TouchableOpacity
              key={interest.id}
              style={[
                styles.interestCard,
                selectedInterests.includes(interest.id) && styles.selectedInterestCard,
              ]}
              onPress={() => toggleInterest(interest.id)}
            >
              <View style={styles.interestContent}>
                <Text
                  style={[
                    styles.interestTitle,
                    selectedInterests.includes(interest.id) && styles.selectedInterestTitle,
                  ]}
                >
                  {interest.label}
                </Text>
                <Text
                  style={[
                    styles.interestDescription,
                    selectedInterests.includes(interest.id) && styles.selectedInterestDescription,
                  ]}
                >
                  {interest.description}
                </Text>
              </View>
              <View
                style={[
                  styles.checkbox,
                  selectedInterests.includes(interest.id) && styles.checkedBox,
                ]}
              >
                {selectedInterests.includes(interest.id) && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>이전</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>다음</Text>
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
  interestsContainer: {
    flex: 1,
    marginBottom: 20,
  },
  interestCard: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3d3d5c',
  },
  selectedInterestCard: {
    backgroundColor: '#e94560',
    borderColor: '#e94560',
  },
  interestContent: {
    flex: 1,
  },
  interestTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  selectedInterestTitle: {
    color: '#ffffff',
  },
  interestDescription: {
    fontSize: 14,
    color: '#a8a8a8',
  },
  selectedInterestDescription: {
    color: '#ffffff',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3d3d5c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  checkmark: {
    color: '#e94560',
    fontSize: 16,
    fontWeight: 'bold',
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
  nextButton: {
    flex: 1,
    backgroundColor: '#e94560',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OnboardingStep2;
