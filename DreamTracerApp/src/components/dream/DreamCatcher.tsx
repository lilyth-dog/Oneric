import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { hapticService } from '../../services/hapticService';

interface DreamCatcherProps {
  isRecording: boolean;
  onToggleRecording: () => void;
  audioLevel?: number; // 0 to 1
}

const DreamCatcher: React.FC<DreamCatcherProps> = ({ isRecording, onToggleRecording, audioLevel = 0 }) => {
  // Animation Values
  const ripple1 = useRef(new Animated.Value(0)).current;
  const ripple2 = useRef(new Animated.Value(0)).current;
  const ripple3 = useRef(new Animated.Value(0)).current;
  const corePulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording) {
      // Start Ripples
      const createRipple = (anim: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 2000,
              delay: delay,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            })
          ])
        );
      };

      const anim1 = createRipple(ripple1, 0);
      const anim2 = createRipple(ripple2, 600);
      const anim3 = createRipple(ripple3, 1200);

      Animated.parallel([anim1, anim2, anim3]).start();
      
      // Core Pulse (simulated volume reaction if audioLevel is low, or dynamic)
      Animated.loop(
          Animated.sequence([
              Animated.timing(corePulse, { toValue: 1.2, duration: 500, useNativeDriver: true }),
              Animated.timing(corePulse, { toValue: 1, duration: 500, useNativeDriver: true }),
          ])
      ).start();

    } else {
      // Stop/Reset
      ripple1.setValue(0);
      ripple2.setValue(0);
      ripple3.setValue(0);
      corePulse.setValue(1);
    }
  }, [isRecording]);

  const handlePress = () => {
    hapticService.trigger(isRecording ? 'medium' : 'success'); // Vibrate on toggle
    onToggleRecording();
  };

  return (
    <View style={styles.container}>
      {/* Ripples */}
      {isRecording && (
        <>
          <AnimatedRipple anim={ripple1} />
          <AnimatedRipple anim={ripple2} />
          <AnimatedRipple anim={ripple3} />
        </>
      )}

      {/* Core Button */}
      <TouchableOpacity 
        activeOpacity={0.8} 
        onPress={handlePress}
        style={styles.coreContainer}
      >
        <Animated.View style={[
          styles.core, 
          { 
            transform: [{ scale: corePulse }],
            backgroundColor: isRecording ? '#FF6B6B' : '#A594F9', // Red when recording, Purple idle
            shadowColor: isRecording ? '#FF6B6B' : '#A594F9',
          }
        ]}>
           <View style={styles.micIcon}>
             {/* Simple Mic Shape or just a circle */}
             {isRecording ? (
                 <View style={styles.stopSquare} /> 
             ) : (
                 <View style={styles.micCircle} />
             )}
           </View>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const AnimatedRipple = ({ anim }: { anim: Animated.Value }) => (
  <Animated.View
    style={[
      styles.ripple,
      {
        transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 3] }) }],
        opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
      },
    ]}
  />
);

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    // alignSelf: 'center', // Depends on parent
  },
  coreContainer: {
    zIndex: 10,
  },
  core: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  ripple: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#A594F9', // Ripple Color
    backgroundColor: 'rgba(165, 148, 249, 0.1)',
  },
  micIcon: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
  },
  stopSquare: {
      width: 24,
      height: 24,
      borderRadius: 4,
      backgroundColor: 'white',
  },
  micCircle: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: 'white',
  }
});

export default DreamCatcher;
