import React, { useRef } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  Animated, 
  ViewStyle, 
  TextStyle, 
  StyleProp,
  Platform,
  ActivityIndicator
} from 'react-native';
import { hapticService } from '../../services/hapticService';
import { soundService } from '../../services/soundService';
import { ButtonFontStyle } from '../../styles/fonts';

interface GlassButtonProps {
  onPress: () => void;
  title: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  type?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  onPress,
  title,
  style,
  textStyle,
  type = 'primary',
  disabled = false,
  loading = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (disabled) return;
    hapticService.trigger('light');
    soundService.play('click');
    onPress();
  };

  const getButtonStyle = () => {
    switch (type) {
      case 'primary':
        return styles.primaryButton;
      case 'secondary':
        return styles.secondaryButton;
      case 'outline':
        return styles.outlineButton;
    }
  };

  const getTextStyle = () => {
    switch (type) {
      case 'primary':
        return styles.primaryText;
      case 'secondary':
      case 'outline':
        return styles.secondaryText;
    }
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, styles.wrapper, style]}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled || loading}
        style={[styles.button, getButtonStyle(), (disabled || loading) && styles.disabledButton]}
      >
        {loading ? (
          <ActivityIndicator color={type === 'primary' ? '#191D2E' : '#FFDDA8'} size="small" />
        ) : (
          <Text style={[styles.text, getTextStyle(), textStyle, disabled && styles.disabledText]}>
            {title}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 8,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  primaryButton: {
    backgroundColor: '#FFDDA8', // Starlight Gold
    borderColor: '#FFDDA8',
  },
  secondaryButton: {
    backgroundColor: 'rgba(74, 64, 99, 0.6)', // Dawn Purple Glass
    borderColor: 'rgba(255, 221, 168, 0.2)',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(255, 221, 168, 0.4)',
  },
  text: {
    ...ButtonFontStyle,
    fontSize: 16,
    fontWeight: 'bold',
  },
  primaryText: {
    color: '#191D2E', // Night Sky Blue
  },
  secondaryText: {
    color: '#FFDDA8', // Starlight Gold
  },
  disabledButton: {
    opacity: 0.5,
    backgroundColor: '#3d3d5c',
    borderColor: '#3d3d5c',
  },
  disabledText: {
    color: '#8F8C9B',
  },
});

export default GlassButton;
