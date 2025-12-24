import React, { useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import Svg, { Circle, Path, Defs, RadialGradient, Stop, Line } from 'react-native-svg';

interface ConstellationMapProps {
  level: number;
  totalDreams: number;
  width?: number;
  height?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Procedural Constellation Generator
 * Connects 'stars' (dreams) into a constellation path.
 */
const ConstellationMap: React.FC<ConstellationMapProps> = ({ 
  level, 
  totalDreams, 
  width = SCREEN_WIDTH - 40, 
  height = 300 
}) => {
  // Generate stable random stars based on level/count
  const stars = useMemo(() => {
    const starList = [];
    const count = Math.min(totalDreams, 30); // Max 30 stars to keep it clean
    const seed = 12345; // Fixed seed for stability (in real app, use user ID)

    // Helper for pseudo-random
    const random = (i: number) => {
        const x = Math.sin(seed + i) * 10000;
        return x - Math.floor(x);
    };

    // Central Path stars (Main Constellation)
    for (let i = 0; i < count; i++) {
      // Create a wandering path
      const progress = i / count;
      const x = width * 0.1 + (width * 0.8) * progress;
      // Sine wave variation for Y
      const y = height * 0.5 + Math.sin(i * 0.5) * (height * 0.3) + (random(i) * 40 - 20);
      
      starList.push({ 
          x, 
          y, 
          size: i % 5 === 0 ? 5 : 3, // Every 5th star is major
          opacity: 0.8 + random(i + 100) * 0.2,
          isMajor: i % 5 === 0
      });
    }
    return starList;
  }, [totalDreams, width, height]);

  // Animation for "drawing" the path
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3000,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false, // SVG props often don't support native driver
    }).start();
  }, [totalDreams]);

  // Create path string
  const pathD = useMemo(() => {
     if (stars.length === 0) return '';
     return stars.reduce((path, star, index) => {
         return index === 0 ? `M${star.x},${star.y}` : `${path} L${star.x},${star.y}`;
     }, '');
  }, [stars]);

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        <Defs>
          <RadialGradient id="starGlow" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#FFF" stopOpacity="1" />
            <Stop offset="100%" stopColor="#FFF" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Constellation Path */}
        <Path 
          d={pathD} 
          stroke="rgba(255, 221, 168, 0.3)" 
          strokeWidth="1" 
          fill="none" 
        />
        
        {/* Animated Progress Line (Simulated by drawing partial path? Too complex for MVP. Just line stroke) */}
        
        {/* Stars */}
        {stars.map((star, index) => (
          <React.Fragment key={index}>
             {/* Glow for Major Stars */}
             {star.isMajor && (
                 <Circle 
                    cx={star.x} 
                    cy={star.y} 
                    r={star.size * 3} 
                    fill="url(#starGlow)" 
                    opacity={0.3}
                 />
             )}
             {/* Star Core */}
             <Circle
               cx={star.x}
               cy={star.y}
               r={star.size}
               fill="#FFDDA8"
               opacity={star.opacity}
             />
          </React.Fragment>
        ))}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ConstellationMap;
