/**
 * 음성 파형 시각화 컴포넌트
 * 녹음 중 실시간 오디오 파형 표시
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { SmallFontStyle, EmotionalSubtitleStyle } from '../../styles/fonts';

interface VoiceWaveformProps {
  isRecording: boolean;
  duration: number; // seconds
  amplitude?: number; // 0-1 range
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BAR_COUNT = 40;
const BAR_WIDTH = 3;
const BAR_GAP = 2;
const MAX_BAR_HEIGHT = 60;
const MIN_BAR_HEIGHT = 4;

export const VoiceWaveform: React.FC<VoiceWaveformProps> = ({
  isRecording,
  duration,
  amplitude = 0.5,
}) => {
  const [bars, setBars] = useState<number[]>(Array(BAR_COUNT).fill(MIN_BAR_HEIGHT));
  const animationRef = useRef<number | null>(null);
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  // 녹음 표시 펄스 애니메이션
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnimation.stopAnimation();
      pulseAnimation.setValue(1);
    }

    return () => {
      pulseAnimation.stopAnimation();
    };
  }, [isRecording, pulseAnimation]);

  // 파형 애니메이션
  useEffect(() => {
    if (isRecording) {
      const updateBars = () => {
        setBars(prevBars => {
          const newBars = [...prevBars];
          
          // 기존 바들을 왼쪽으로 이동
          for (let i = 0; i < BAR_COUNT - 1; i++) {
            newBars[i] = newBars[i + 1];
          }
          
          // 새 바 생성 (실제 amplitude 기반 + 랜덤 변화)
          const baseHeight = MIN_BAR_HEIGHT + (amplitude * (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT));
          const randomVariation = (Math.random() - 0.5) * 20;
          const newHeight = Math.max(MIN_BAR_HEIGHT, Math.min(MAX_BAR_HEIGHT, baseHeight + randomVariation));
          newBars[BAR_COUNT - 1] = newHeight;
          
          return newBars;
        });
        
        animationRef.current = requestAnimationFrame(updateBars);
      };

      // 50ms 간격으로 업데이트 (20 FPS)
      const interval = setInterval(() => {
        updateBars();
      }, 50);

      return () => {
        clearInterval(interval);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    } else {
      // 녹음 멈추면 바 초기화 (부드럽게)
      setBars(prev => prev.map(h => Math.max(MIN_BAR_HEIGHT, h * 0.9)));
    }
  }, [isRecording, amplitude]);

  // 시간 포맷
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.statusContainer}>
          {isRecording && (
            <Animated.View 
              style={[
                styles.recordingDot,
                { transform: [{ scale: pulseAnimation }] }
              ]} 
            />
          )}
          <Text style={styles.statusText}>
            {isRecording ? '녹음 중...' : '녹음 대기'}
          </Text>
        </View>
        <Text style={styles.durationText}>{formatDuration(duration)}</Text>
      </View>

      {/* 파형 시각화 */}
      <View style={styles.waveformContainer}>
        <View style={styles.waveformBackground}>
          {/* 중앙 라인 */}
          <View style={styles.centerLine} />
          
          {/* 파형 바들 */}
          <View style={styles.barsContainer}>
            {bars.map((height, index) => (
              <View key={index} style={styles.barWrapper}>
                {/* 상단 바 */}
                <View
                  style={[
                    styles.bar,
                    {
                      height: height / 2,
                      backgroundColor: getBarColor(height, isRecording),
                      opacity: getBarOpacity(index),
                    },
                  ]}
                />
                {/* 하단 바 (미러링) */}
                <View
                  style={[
                    styles.barMirror,
                    {
                      height: height / 2,
                      backgroundColor: getBarColor(height, isRecording),
                      opacity: getBarOpacity(index) * 0.6,
                    },
                  ]}
                />
              </View>
            ))}
          </View>
        </View>

        {/* 데시벨 표시 */}
        <View style={styles.decibelContainer}>
          <Text style={styles.decibelText}>
            {isRecording ? `${Math.round(amplitude * 100)}%` : '--'}
          </Text>
        </View>
      </View>

      {/* 힌트 텍스트 */}
      <Text style={styles.hintText}>
        {isRecording 
          ? '마이크에 대고 꿈 이야기를 들려주세요' 
          : '녹음 버튼을 눌러 시작하세요'}
      </Text>
    </View>
  );
};

// 바 높이에 따른 색상
const getBarColor = (height: number, isRecording: boolean): string => {
  if (!isRecording) return '#4A4063';
  
  const ratio = (height - MIN_BAR_HEIGHT) / (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT);
  
  if (ratio > 0.8) return '#FF6B6B'; // 높음 - 빨강
  if (ratio > 0.5) return '#FFDDA8'; // 중간 - 금색
  return '#A78BFA'; // 낮음 - 보라
};

// 바 위치에 따른 투명도 (최근일수록 진함)
const getBarOpacity = (index: number): number => {
  return 0.3 + (index / BAR_COUNT) * 0.7;
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF6B6B',
  },
  statusText: {
    ...EmotionalSubtitleStyle,
    color: '#FFDDA8',
    fontSize: 14,
  },
  durationText: {
    ...EmotionalSubtitleStyle,
    color: '#EAE8F0',
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  waveformContainer: {
    height: 80,
    position: 'relative',
  },
  waveformBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: BAR_GAP,
  },
  barWrapper: {
    alignItems: 'center',
  },
  bar: {
    width: BAR_WIDTH,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  barMirror: {
    width: BAR_WIDTH,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  decibelContainer: {
    position: 'absolute',
    right: 8,
    top: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  decibelText: {
    ...SmallFontStyle,
    color: '#8F8C9B',
    fontSize: 10,
  },
  hintText: {
    ...SmallFontStyle,
    color: '#595566',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 12,
  },
});

export default VoiceWaveform;
