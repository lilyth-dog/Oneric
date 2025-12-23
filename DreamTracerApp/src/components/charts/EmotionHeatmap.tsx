/**
 * 감정 히트맵 컴포넌트
 * 사용자의 꿈 감정 패턴을 시각화
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { EmotionalSubtitleStyle, SmallFontStyle, BodyFontStyle } from '../../styles/fonts';

interface EmotionData {
  emotion: string;
  icon: string;
  percentage: number;
  color: string;
}

interface EmotionHeatmapProps {
  emotions?: EmotionData[];
}

const defaultEmotions: EmotionData[] = [
  { emotion: '평온', icon: '😌', percentage: 0, color: '#4ECDC4' },
  { emotion: '불안', icon: '😰', percentage: 0, color: '#FF6B6B' },
  { emotion: '행복', icon: '😊', percentage: 0, color: '#FFD93D' },
  { emotion: '영감', icon: '✨', percentage: 0, color: '#A78BFA' },
  { emotion: '슬픔', icon: '😢', percentage: 0, color: '#60A5FA' },
  { emotion: '흥분', icon: '🤩', percentage: 0, color: '#F472B6' },
];

const { width } = Dimensions.get('window');

export const EmotionHeatmap: React.FC<EmotionHeatmapProps> = ({ 
  emotions = defaultEmotions 
}) => {
  // 최대 percentage로 정규화
  const maxPercentage = Math.max(...emotions.map(e => e.percentage), 1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎭 감정 패턴</Text>
      <View style={styles.emotionsGrid}>
        {emotions.map((emotionData, index) => (
          <View key={index} style={styles.emotionRow}>
            <View style={styles.emotionLabel}>
              <Text style={styles.emotionIcon}>{emotionData.icon}</Text>
              <Text style={styles.emotionName}>{emotionData.emotion}</Text>
            </View>
            <View style={styles.barContainer}>
              <View 
                style={[
                  styles.barFill, 
                  { 
                    width: `${Math.max((emotionData.percentage / 100) * 100, 5)}%`,
                    backgroundColor: emotionData.color,
                  }
                ]} 
              />
              <View 
                style={[
                  styles.barGlow,
                  {
                    width: `${Math.max((emotionData.percentage / 100) * 100, 5)}%`,
                    backgroundColor: emotionData.color,
                  }
                ]}
              />
            </View>
            <Text style={styles.percentageText}>
              {emotionData.percentage}%
            </Text>
          </View>
        ))}
      </View>
      
      {/* 하단 범례 */}
      <View style={styles.legend}>
        <Text style={styles.legendText}>최근 30일 기준</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // GlassView handles padding/background
  },
  title: {
    ...EmotionalSubtitleStyle,
    color: '#FFDDA8',
    marginBottom: 20,
  },
  emotionsGrid: {
    gap: 12,
  },
  emotionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emotionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 70,
  },
  emotionIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  emotionName: {
    ...SmallFontStyle,
    color: '#EAE8F0',
    fontSize: 12,
  },
  barContainer: {
    flex: 1,
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  barGlow: {
    height: '100%',
    borderRadius: 6,
    position: 'absolute',
    left: 0,
    top: 0,
    opacity: 0.3,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  percentageText: {
    ...SmallFontStyle,
    color: '#8F8C9B',
    width: 40,
    textAlign: 'right',
    fontSize: 12,
  },
  legend: {
    marginTop: 16,
    alignItems: 'center',
  },
  legendText: {
    ...SmallFontStyle,
    color: '#595566',
    fontSize: 11,
  },
});

export default EmotionHeatmap;
