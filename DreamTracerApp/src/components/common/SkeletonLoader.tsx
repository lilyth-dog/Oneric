/**
 * Skeleton Loader Component
 * Provides a placeholder loading state with shimmer/pulse effect
 */
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, DimensionValue, ViewStyle } from 'react-native';

interface SkeletonLoaderProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;
  const scale = useRef(new Animated.Value(0.98)).current; // Gentle breathing

  useEffect(() => {
    const animation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
            Animated.timing(opacity, {
            toValue: 0.6,
            duration: 1000,
            useNativeDriver: true,
            }),
            Animated.timing(opacity, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
            }),
        ]),
        Animated.sequence([
            Animated.timing(scale, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
            }),
            Animated.timing(scale, {
            toValue: 0.98,
            duration: 1000,
            useNativeDriver: true,
            }),
        ]),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [opacity, scale]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
          transform: [{ scale }],
          ...style,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});

export default SkeletonLoader;
