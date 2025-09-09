/**
 * 애니메이션 배경 컴포넌트
 * "고요한 탐험" 컨셉에 맞는 별빛 애니메이션
 */
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

// const { width, height } = Dimensions.get('window');

interface AnimatedBackgroundProps {
  children: React.ReactNode;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ children }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  // 꿈의 순환 효과
  const dreamCycleAnim = useRef(new Animated.Value(0)).current;
  const dreamGrowthAnim = useRef(new Animated.Value(0.5)).current;
  
  // 별빛 연결 효과
  const starConnectionAnim = useRef(new Animated.Value(0)).current;
  const starPulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 페이드 인 애니메이션
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // 스케일 애니메이션
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();

    // 회전 애니메이션 (무한 반복)
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    );
    rotateAnimation.start();

    // 꿈의 순환 애니메이션 (잠들기 → 꿈꾸기 → 깨어나기)
    const dreamCycleAnimation = Animated.loop(
      Animated.sequence([
        // 잠들기 (중앙에서 시작)
        Animated.timing(dreamCycleAnim, {
          toValue: 0.3,
          duration: 3000,
          useNativeDriver: true,
        }),
        // 꿈꾸기 (중간 단계)
        Animated.timing(dreamCycleAnim, {
          toValue: 0.7,
          duration: 4000,
          useNativeDriver: true,
        }),
        // 깨어나기 (바깥으로 퍼짐)
        Animated.timing(dreamCycleAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        // 다시 잠들기로
        Animated.timing(dreamCycleAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    dreamCycleAnimation.start();

    // 꿈의 성장 애니메이션 (꿈이 기록되고 분석되면서 성장)
    const dreamGrowthAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(dreamGrowthAnim, {
          toValue: 1.2,
          duration: 5000,
          useNativeDriver: true,
        }),
        Animated.timing(dreamGrowthAnim, {
          toValue: 0.5,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );
    dreamGrowthAnimation.start();

    // 별빛 연결 애니메이션 (별들이 꿈과 연결됨)
    const starConnectionAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(starConnectionAnim, {
          toValue: 1,
          duration: 6000,
          useNativeDriver: true,
        }),
        Animated.timing(starConnectionAnim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    );
    starConnectionAnimation.start();

    // 별빛 펄스 애니메이션
    const starPulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(starPulseAnim, {
          toValue: 1.3,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(starPulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    starPulseAnimation.start();

    return () => {
      rotateAnimation.stop();
      dreamCycleAnimation.stop();
      dreamGrowthAnimation.stop();
      starConnectionAnimation.stop();
      starPulseAnimation.stop();
    };
  }, [fadeAnim, scaleAnim, rotateAnim, dreamCycleAnim, dreamGrowthAnim, starConnectionAnim, starPulseAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* 배경 그라데이션 */}
      <View style={styles.gradientBackground} />
      
      {/* 애니메이션 별들 - 꿈과 연결된 별빛 */}
      <Animated.View
        style={[
          styles.starContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { rotate }],
          },
        ]}
      >
        {/* 꿈과 연결된 별들 */}
        <Animated.View
          style={[
            styles.star,
            styles.star1,
            {
              transform: [{ scale: starPulseAnim }],
              opacity: starConnectionAnim,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.star,
            styles.star2,
            {
              transform: [{ scale: Animated.multiply(starPulseAnim, 0.8) }],
              opacity: Animated.multiply(starConnectionAnim, 0.7),
            },
          ]}
        />
        <Animated.View
          style={[
            styles.star,
            styles.star3,
            {
              transform: [{ scale: Animated.multiply(starPulseAnim, 1.2) }],
              opacity: Animated.multiply(starConnectionAnim, 0.9),
            },
          ]}
        />
        <Animated.View
          style={[
            styles.star,
            styles.star4,
            {
              transform: [{ scale: Animated.multiply(starPulseAnim, 0.6) }],
              opacity: Animated.multiply(starConnectionAnim, 0.5),
            },
          ]}
        />
        <Animated.View
          style={[
            styles.star,
            styles.star5,
            {
              transform: [{ scale: starPulseAnim }],
              opacity: starConnectionAnim,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.star,
            styles.star6,
            {
              transform: [{ scale: Animated.multiply(starPulseAnim, 1.1) }],
              opacity: Animated.multiply(starConnectionAnim, 0.8),
            },
          ]}
        />
        <Animated.View
          style={[
            styles.star,
            styles.star7,
            {
              transform: [{ scale: Animated.multiply(starPulseAnim, 0.9) }],
              opacity: Animated.multiply(starConnectionAnim, 0.6),
            },
          ]}
        />
        <Animated.View
          style={[
            styles.star,
            styles.star8,
            {
              transform: [{ scale: Animated.multiply(starPulseAnim, 1.3) }],
              opacity: Animated.multiply(starConnectionAnim, 1),
            },
          ]}
        />
      </Animated.View>

      {/* 꿈의 순환과 성장 애니메이션 */}
      <Animated.View
        style={[
          styles.pulseContainer,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        {/* 꿈의 순환 - 잠들기 → 꿈꾸기 → 깨어나기 */}
        <Animated.View
          style={[
            styles.dreamCycle,
            styles.dreamCycleOuter,
            {
              transform: [{ scale: dreamCycleAnim }],
              opacity: Animated.multiply(dreamCycleAnim, 0.3),
            },
          ]}
        />
        <Animated.View
          style={[
            styles.dreamCycle,
            styles.dreamCycleMiddle,
            {
              transform: [{ scale: Animated.multiply(dreamCycleAnim, 0.7) }],
              opacity: Animated.multiply(dreamCycleAnim, 0.5),
            },
          ]}
        />
        <Animated.View
          style={[
            styles.dreamCycle,
            styles.dreamCycleInner,
            {
              transform: [{ scale: Animated.multiply(dreamCycleAnim, 0.4) }],
              opacity: Animated.multiply(dreamCycleAnim, 0.7),
            },
          ]}
        />
        
        {/* 꿈의 성장 - 꿈이 기록되고 분석되면서 성장 */}
        <Animated.View
          style={[
            styles.dreamGrowth,
            {
              transform: [{ scale: dreamGrowthAnim }],
              opacity: Animated.multiply(dreamGrowthAnim, 0.6),
            },
          ]}
        />
      </Animated.View>

      {/* 메인 콘텐츠 */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#191D2E', // Night Sky Blue
  },
  starContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  star: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: '#FFDDA8', // Starlight Gold
    borderRadius: 2,
    shadowColor: '#FFDDA8',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  star1: {
    top: '15%',
    left: '20%',
  },
  star2: {
    top: '25%',
    right: '30%',
  },
  star3: {
    top: '40%',
    left: '10%',
  },
  star4: {
    top: '60%',
    right: '20%',
  },
  star5: {
    top: '75%',
    left: '30%',
  },
  star6: {
    top: '35%',
    left: '50%',
  },
  star7: {
    top: '55%',
    right: '10%',
  },
  star8: {
    top: '80%',
    right: '40%',
  },
  pulseContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 꿈의 순환 효과
  dreamCycle: {
    position: 'absolute',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 221, 168, 0.4)', // Starlight Gold
    backgroundColor: 'rgba(255, 221, 168, 0.1)',
  },
  dreamCycleOuter: {
    width: 400,
    height: 400,
    borderColor: 'rgba(255, 221, 168, 0.2)',
    backgroundColor: 'rgba(255, 221, 168, 0.05)',
  },
  dreamCycleMiddle: {
    width: 250,
    height: 250,
    borderColor: 'rgba(255, 221, 168, 0.3)',
    backgroundColor: 'rgba(255, 221, 168, 0.08)',
  },
  dreamCycleInner: {
    width: 150,
    height: 150,
    borderColor: 'rgba(255, 221, 168, 0.5)',
    backgroundColor: 'rgba(255, 221, 168, 0.12)',
  },
  
  // 꿈의 성장 효과
  dreamGrowth: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 221, 168, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 221, 168, 0.6)',
    shadowColor: '#FFDDA8',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  content: {
    flex: 1,
    zIndex: 10,
  },
});

export default AnimatedBackground;
