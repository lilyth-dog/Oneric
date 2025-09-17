/**
 * 동적 배경 컴포넌트
 * 시간에 따라 변하는 배경색과 별빛 효과
 */
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

interface DynamicBackgroundProps {
  children: React.ReactNode;
}

const DynamicBackground: React.FC<DynamicBackgroundProps> = ({ children }) => {
  const backgroundAnim = useRef(new Animated.Value(0)).current;
  const starOpacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const updateBackground = () => {
      const hour = new Date().getHours();
      let targetValue = 0;

      // 시간대별 배경 변화
      if (hour >= 5 && hour < 8) {
        // 새벽 (5-8시): 보라/핑크 그라데이션
        targetValue = 0.2;
      } else if (hour >= 8 && hour < 17) {
        // 낮 (8-17시): 옅은 하늘색
        targetValue = 0.5;
      } else if (hour >= 17 && hour < 20) {
        // 저녁 (17-20시): 황혼
        targetValue = 0.8;
      } else {
        // 밤 (20-5시): 진한 남색
        targetValue = 1;
      }

      Animated.timing(backgroundAnim, {
        toValue: targetValue,
        duration: 2000,
        useNativeDriver: false,
      }).start();

      // 별빛 효과 (밤 시간대에만)
      if (hour >= 20 || hour < 5) {
        Animated.timing(starOpacityAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(starOpacityAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }).start();
      }
    };

    updateBackground();
    const interval = setInterval(updateBackground, 60000); // 1분마다 업데이트

    return () => clearInterval(interval);
  }, [backgroundAnim, starOpacityAnim]);

  const backgroundColor = backgroundAnim.interpolate({
    inputRange: [0, 0.2, 0.5, 0.8, 1],
    outputRange: [
      '#4A4063', // 새벽 보라
      '#6B5B95', // 새벽 핑크
      '#87CEEB', // 낮 하늘색
      '#8B4513', // 저녁 황혼
      '#191D2E', // 밤 남색
    ],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.background,
          {
            backgroundColor,
          },
        ]}
      />
      
      {/* 별빛 효과 */}
      <Animated.View
        style={[
          styles.starsContainer,
          {
            opacity: starOpacityAnim,
          },
        ]}
      >
        {Array.from({ length: 20 }).map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.star,
              {
                left: Math.random() * width,
                top: Math.random() * height * 0.6, // 상단 60% 영역에만
                opacity: Math.random() * 0.8 + 0.2,
              },
            ]}
          />
        ))}
      </Animated.View>

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  starsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  star: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: '#FFDDA8',
    borderRadius: 1,
    shadowColor: '#FFDDA8',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 3,
  },
});

export default DynamicBackground;