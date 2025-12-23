import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface ScreenTransitionProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const ScreenTransition: React.FC<ScreenTransitionProps> = ({ children, style }) => {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(15)).current; // Start 15px lower

  useEffect(() => {
    // Reset to initial values (if recycled, though key should prevent)
    fade.setValue(0);
    slide.setValue(15);
    
    Animated.parallel([
      Animated.timing(fade, { 
        toValue: 1, 
        duration: 400, // Smooth duration
        useNativeDriver: true 
      }),
      Animated.spring(slide, { 
        toValue: 0, 
        friction: 8, 
        tension: 50, 
        useNativeDriver: true 
      })
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ flex: 1, opacity: fade, transform: [{ translateY: slide }] }, style]}>
      {children}
    </Animated.View>
  );
};

export default ScreenTransition;
