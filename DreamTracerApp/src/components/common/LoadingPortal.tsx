import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle, Path, G, Defs, RadialGradient, Stop } from 'react-native-svg';
import { soundService } from '../../services/soundService';
import { DreamySubtitleStyle } from '../../styles/fonts';

interface LoadingPortalProps {
  message?: string;
}

export const LoadingPortal: React.FC<LoadingPortalProps> = ({ message = '무의식 탐험 중...' }) => {
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Play subtle notification sound on entry
    soundService.play('notification');

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.timing(rotationAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  }, []);

  const spin = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const scale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.portalWrapper}>
        <Animated.View style={{ transform: [{ rotate: spin }, { scale: scale }] }}>
          <Svg width="160" height="160" viewBox="0 0 160 160">
            <Defs>
              <RadialGradient id="portalGrad" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop offset="0%" stopColor="#FFDDA8" stopOpacity="0.8" />
                <Stop offset="70%" stopColor="#A78BFA" stopOpacity="0.3" />
                <Stop offset="100%" stopColor="#191D2E" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            
            {/* Outer rings */}
            <Circle cx="80" cy="80" r="70" stroke="#4A4063" strokeWidth="2" strokeDasharray="10 5" opacity="0.4" />
            <Circle cx="80" cy="80" r="55" stroke="#A78BFA" strokeWidth="1" strokeDasharray="5 5" opacity="0.6" />
            
            {/* Core Glow */}
            <Circle cx="80" cy="80" r="40" fill="url(#portalGrad)" />
            
            {/* Moving mystical particles (simplified paths) */}
            <G opacity="0.8">
              <Path d="M80 30 L85 45 L80 40 L75 45 Z" fill="#FFDDA8" />
              <Path d="M130 80 L115 85 L120 80 L115 75 Z" fill="#FFDDA8" />
              <Path d="M80 130 L75 115 L80 120 L85 115 Z" fill="#FFDDA8" />
              <Path d="M30 80 L45 75 L40 80 L45 85 Z" fill="#FFDDA8" />
            </G>
          </Svg>
        </Animated.View>
        
        <Animated.Text style={[styles.message, DreamySubtitleStyle, { opacity: opacity }]}>
          {message}
        </Animated.Text>
        <Text style={styles.subtext}>신비로운 에너지를 모으는 중...</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(25, 29, 46, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  portalWrapper: {
    alignItems: 'center',
  },
  message: {
    marginTop: 24,
    color: '#FFDDA8',
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 2,
  },
  subtext: {
    marginTop: 8,
    color: '#8F8C9B',
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default LoadingPortal;
