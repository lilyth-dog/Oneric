import React, { useEffect, useRef } from 'react';
import { Animated, View, Easing } from 'react-native';
import Svg, { Path, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

interface MascotAvatarProps {
  size?: number;
  mood?: 'happy' | 'calm' | 'concerned';
}

const MascotAvatar: React.FC<MascotAvatarProps> = ({ size = 60, mood = 'calm' }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Floating Loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glowing Pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.8,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const colorPrimary = mood === 'concerned' ? '#FFB8B8' : '#A594F9';
  const colorCore = mood === 'concerned' ? '#FF6B6B' : '#6C5DD3';

  return (
    <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
      <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <Defs>
          <RadialGradient id="spiritGlow" cx="50" cy="50" r="50" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={colorCore} stopOpacity="0.8" />
            <Stop offset="0.6" stopColor={colorPrimary} stopOpacity="0.4" />
            <Stop offset="1" stopColor={colorPrimary} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        
        {/* Glow Aura */}
        <AnimatedCircle cx="50" cy="50" r="45" fill="url(#spiritGlow)" opacity={glowAnim} />

        {/* Core Spirit Shape - A cute teardrop/wisp */}
        <Path
          d="M 50 20
             Q 20 50, 20 70
             A 30 30 0 1 0 80 70
             Q 80 50, 50 20 Z"
          fill={colorPrimary}
          opacity="0.9"
        />
        
        {/* Face Elements */}
        {mood === 'happy' ? (
             // ^_^
            <>
              <Path d="M 35 65 Q 40 60, 45 65" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <Path d="M 55 65 Q 60 60, 65 65" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <Circle cx="50" cy="72" r="2" fill="white" opacity="0.6" /> 
            </>
        ) : mood === 'concerned' ? (
             // o_o
             <>
               <Circle cx="40" cy="65" r="3" fill="white" />
               <Circle cx="60" cy="65" r="3" fill="white" />
               <Path d="M 48 75 Q 50 72, 52 75" stroke="white" strokeWidth="2" />
             </>
        ) : (
            // -_- or calm closed eyes
            <>
              <Path d="M 35 65 L 45 65" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <Path d="M 55 65 L 65 65" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </>
        )}
      </Svg>
    </Animated.View>
  );
};

// Animated Circle helper
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default MascotAvatar;
