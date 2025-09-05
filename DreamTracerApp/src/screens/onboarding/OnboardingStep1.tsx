/**
 * 온보딩 1단계: 기본 정보
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { OnboardingStep1 as OnboardingStep1Type } from '../../types/auth';

interface Props {
  onNext: (data: OnboardingStep1Type) => void;
}

const OnboardingStep1: React.FC<Props> = ({ onNext }) => {
  const [displayName, setDisplayName] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | 'prefer_not_to_say' | null>(null);

  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 100;
  const maxYear = currentYear - 10;

  const handleNext = () => {
    if (!displayName.trim()) {
      Alert.alert('오류', '이름을 입력해주세요.');
      return;
    }

    if (!birthYear || isNaN(Number(birthYear))) {
      Alert.alert('오류', '올바른 출생년도를 입력해주세요.');
      return;
    }

    const year = Number(birthYear);
    if (year < minYear || year > maxYear) {
      Alert.alert('오류', `출생년도는 ${minYear}년부터 ${maxYear}년까지 입력 가능합니다.`);
      return;
    }

    if (!gender) {
      Alert.alert('오류', '성별을 선택해주세요.');
      return;
    }

    onNext({
      display_name: displayName.trim(),
      birth_year: year,
      gender,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>기본 정보를 알려주세요</Text>
          <Text style={styles.subtitle}>더 나은 꿈 분석을 위해 필요합니다</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>이름</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="이름을 입력하세요"
              maxLength={20}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>출생년도</Text>
            <TextInput
              style={styles.input}
              value={birthYear}
              onChangeText={setBirthYear}
              placeholder="예: 1990"
              keyboardType="numeric"
              maxLength={4}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>성별</Text>
            <View style={styles.genderContainer}>
              {[
                { value: 'male', label: '남성' },
                { value: 'female', label: '여성' },
                { value: 'other', label: '기타' },
                { value: 'prefer_not_to_say', label: '선택하지 않음' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.genderButton,
                    gender === option.value && styles.selectedGenderButton,
                  ]}
                  onPress={() => setGender(option.value as any)}
                >
                  <Text
                    style={[
                      styles.genderButtonText,
                      gender === option.value && styles.selectedGenderButtonText,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>다음</Text>
        </TouchableOpacity>
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
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
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
  form: {
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
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
  genderContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  genderButton: {
    backgroundColor: '#2d2d44',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#3d3d5c',
  },
  selectedGenderButton: {
    backgroundColor: '#e94560',
    borderColor: '#e94560',
  },
  genderButtonText: {
    color: '#ffffff',
    fontSize: 14,
  },
  selectedGenderButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  nextButton: {
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

export default OnboardingStep1;
