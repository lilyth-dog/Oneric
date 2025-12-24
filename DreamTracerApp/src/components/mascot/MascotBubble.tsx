import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, LayoutAnimation, TouchableOpacity } from 'react-native';
import GlassView from '../common/GlassView';
import MascotAvatar from './MascotAvatar';
import { BodyFontStyle } from '../../styles/fonts';
import { hapticService } from '../../services/hapticService';

interface MascotBubbleProps {
  text: string;
  mood?: 'happy' | 'calm' | 'concerned';
  onPress?: () => void;
  hideAvatar?: boolean;
  isSmall?: boolean;
}

const MascotBubble: React.FC<MascotBubbleProps> = ({ text, mood = 'calm', onPress, hideAvatar = false }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Reset state when text changes
    setDisplayedText('');
    setIsTyping(true);

    let currentIndex = 0;
    
    // Clear any existing interval
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText((prev) => prev + text[currentIndex]);
        currentIndex++;
        
        // Haptic Feedback every 3rd char
        if (currentIndex % 3 === 0) {
           hapticService.trigger('light'); 
        }

      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsTyping(false);
      }
    }, 40); // Slightly faster

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text]);

  const handlePress = () => {
    if (isTyping) {
      // Skip typing
      if (intervalRef.current) clearInterval(intervalRef.current);
      setDisplayedText(text);
      setIsTyping(false);
      hapticService.trigger('medium');
    } else if (onPress) {
      onPress();
    }
  };

  return (
    <View style={styles.container}>
      {!hideAvatar && (
        <View style={styles.avatarContainer}>
          <MascotAvatar size={60} mood={mood} />
        </View>
      )}
      
      <TouchableOpacity style={styles.bubbleContainer} activeOpacity={0.9} onPress={handlePress}>
        <GlassView style={styles.bubble} intensity="light">
          <Text style={styles.text}>
            {displayedText}
            {isTyping && <Text style={styles.cursor}>|</Text>}
          </Text>
        </GlassView>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    marginBottom: 8,
  },
  avatarContainer: {
    marginRight: 12,
    marginTop: 4, // Align slightly lower
  },
  bubbleContainer: {
    flex: 1,
  },
  bubble: {
    padding: 16,
    borderRadius: 20,
    borderTopLeftRadius: 4, // Speech bubble pointing/connected
    minHeight: 60,
    justifyContent: 'center',
  },
  text: {
    ...BodyFontStyle,
    color: '#EAE8F0',
    lineHeight: 22,
  },
  cursor: {
    color: '#A594F9',
    opacity: 0.8,
  }
});

export default MascotBubble;
