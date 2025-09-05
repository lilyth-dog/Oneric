/**
 * 온보딩 3단계: 알림 설정
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { OnboardingStep3 as OnboardingStep3Type } from '../../types/auth';

interface Props {
  onNext: (data: OnboardingStep3Type) => void;
  onBack: () => void;
}

const OnboardingStep3: React.FC<Props> = ({ onNext, onBack }) => {
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [dreamReminderTime, setDreamReminderTime] = useState('22:00');
  const [weeklyInsightEnabled, setWeeklyInsightEnabled] = useState(true);

  const timeOptions = [
    '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'
  ];

  const handleNext = () => {
    onNext({
      notification_enabled: notificationEnabled,
      dream_reminder_time: notificationEnabled ? dreamReminderTime : undefined,
      weekly_insight_enabled: weeklyInsightEnabled,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>알림 설정</Text>
          <Text style={styles.subtitle}>꿈 기록을 도와드릴 알림을 설정해주세요</Text>
        </View>

        <View style={styles.settingsContainer}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>꿈 기록 알림</Text>
              <Text style={styles.settingDescription}>
                매일 꿈을 기록하도록 알림을 받습니다
              </Text>
            </View>
            <Switch
              value={notificationEnabled}
              onValueChange={setNotificationEnabled}
              trackColor={{ false: '#3d3d5c', true: '#e94560' }}
              thumbColor={notificationEnabled ? '#ffffff' : '#a8a8a8'}
            />
          </View>

          {notificationEnabled && (
            <View style={styles.timeSelector}>
              <Text style={styles.timeLabel}>알림 시간</Text>
              <View style={styles.timeOptions}>
                {timeOptions.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeOption,
                      dreamReminderTime === time && styles.selectedTimeOption,
                    ]}
                    onPress={() => setDreamReminderTime(time)}
                  >
                    <Text
                      style={[
                        styles.timeOptionText,
                        dreamReminderTime === time && styles.selectedTimeOptionText,
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>주간 인사이트</Text>
              <Text style={styles.settingDescription}>
                매주 꿈 패턴 분석 결과를 받습니다
              </Text>
            </View>
            <Switch
              value={weeklyInsightEnabled}
              onValueChange={setWeeklyInsightEnabled}
              trackColor={{ false: '#3d3d5c', true: '#e94560' }}
              thumbColor={weeklyInsightEnabled ? '#ffffff' : '#a8a8a8'}
            />
          </View>
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
  settingsContainer: {
    flex: 1,
    marginBottom: 20,
  },
  settingItem: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#a8a8a8',
  },
  timeSelector: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  timeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeOption: {
    backgroundColor: '#3d3d5c',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#3d3d5c',
  },
  selectedTimeOption: {
    backgroundColor: '#e94560',
    borderColor: '#e94560',
  },
  timeOptionText: {
    color: '#ffffff',
    fontSize: 14,
  },
  selectedTimeOptionText: {
    color: '#ffffff',
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

export default OnboardingStep3;
