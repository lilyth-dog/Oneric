import React, { useEffect, useRef } from 'react';
import { Animated, View, Image, StyleSheet, Easing } from 'react-native';

interface MascotAvatarProps {
  size?: number;
  mood?: 'happy' | 'calm' | 'concerned';
}

const MascotAvatar: React.FC<MascotAvatarProps> = ({ size = 60, mood = 'calm' }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.6)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Floating Loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -6,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
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
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.6,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Slow rotation for ambient feel (very subtle)
    Animated.loop(
        Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 20000, // 20 seconds per rotation
            easing: Easing.linear,
            useNativeDriver: true,
        })
    ).start();
  }, []);

  const getMoodColor = () => {
    switch (mood) {
      case 'happy': return '#FFD93D'; // Gold/Yellow
      case 'concerned': return '#FF6B6B'; // Red/Pink
      default: return '#A594F9'; // Mystic Purple
    }
  };

  const moodColor = getMoodColor();
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <Animated.View style={[styles.container, { width: size, height: size, transform: [{ translateY: floatAnim }] }]}>
      
      {/* 1. Aura / Glow behind */}
      <Animated.View 
        style={[
          styles.glow, 
          { 
            backgroundColor: moodColor,
            opacity: glowAnim,
            transform: [{ scale: 1.2 }]
          }
        ]} 
      />

      {/* 2. Rotating Ring (Optional magical effect) */}
       {/* <Animated.View 
         style={[
           styles.ring,
           { borderColor: moodColor, opacity: 0.3, transform: [{ rotate: spin }] }
         ]} 
       /> */}

      {/* 3. Image Portal (Masked) */}
      <View style={[styles.imageContainer, { borderColor: moodColor }]}>
        <Image 
          source={require('../../assets/images/luna_pixel.jpg')} 
          style={styles.image}
          resizeMode="cover"
        />
        
        {/* 4. Mood Overlay (Tint) */}
        <View style={[styles.overlay, { backgroundColor: moodColor, opacity: 0.15 }]} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 100,
    filter: 'blur(10px)', // Note: standard RN doesn't support filter well without simple-shadow, using opacity for now
    // Fallback shadow
    shadowColor: '#fff',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  ring: {
    position: 'absolute',
    width: '110%',
    height: '110%',
    borderRadius: 100,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: '#191D2E',
  },
  image: {
    width: '100%',
    height: '100%',
    // Crop center focus (usually center is default)
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  }
});

export default MascotAvatar;
