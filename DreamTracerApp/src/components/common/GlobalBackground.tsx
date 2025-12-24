import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop, Rect } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const GlobalBackground: React.FC = () => {
  // Animation for light orbs
  const orb1Anim = useRef(new Animated.Value(0)).current;
  const orb2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createOrbAnimation = (anim: Animated.Value, duration: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: duration,
            useNativeDriver: true,
          }),
        ])
      );
    };

    createOrbAnimation(orb1Anim, 10000).start();
    createOrbAnimation(orb2Anim, 15000).start();
  }, []);

  // Generate random stars
  const stars = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 2 + 0.5,
    opacity: Math.random() * 0.7 + 0.3,
  }));

  return (
    <View style={styles.container}>
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="grad1" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#4A4063" stopOpacity="0.15" />
            <Stop offset="100%" stopColor="#191D2E" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="grad2" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#A78BFA" stopOpacity="0.1" />
            <Stop offset="100%" stopColor="#191D2E" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        
        {/* Base Background */}
        <Rect x="0" y="0" width="100%" height="100%" fill="#191D2E" />

        {/* Ambient Light Orbs (Animated) */}
        <AnimatedCircle 
          cx={width * 0.2} 
          cy={height * 0.3} 
          r={width * 0.6} 
          fill="url(#grad1)"
          opacity={orb1Anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 0.7]
          })}
        />
        <AnimatedCircle 
          cx={width * 0.8} 
          cy={height * 0.7} 
          r={width * 0.5} 
          fill="url(#grad2)"
          opacity={orb2Anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.2, 0.5]
          })}
        />

        {/* Static Stars */}
        {stars.map(star => (
          <Circle 
            key={star.id} 
            cx={star.x} 
            cy={star.y} 
            r={star.size} 
            fill="#FFDDA8" 
            opacity={star.opacity} 
          />
        ))}
      </Svg>
    </View>
  );
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#191D2E',
    zIndex: -1,
  },
});

export default GlobalBackground;
