/**
 * GlassView Component
 * Glassmorphism effect container for premium UI look
 */
import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, Platform } from 'react-native';

interface GlassViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: 'light' | 'medium' | 'heavy';
}

export const GlassView: React.FC<GlassViewProps> = ({ 
  children, 
  style, 
  intensity = 'medium' 
}) => {
  const getBackgroundColor = () => {
    switch (intensity) {
      case 'light': return 'rgba(74, 64, 99, 0.2)';
      case 'medium': return 'rgba(74, 64, 99, 0.4)';
      case 'heavy': return 'rgba(74, 64, 99, 0.6)';
    }
  };

  return (
    <View style={[
      styles.container, 
      { backgroundColor: getBackgroundColor() },
      style
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 221, 168, 0.15)', // Subtle gold border
    // Shadow/Elevation
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});

export default GlassView;
