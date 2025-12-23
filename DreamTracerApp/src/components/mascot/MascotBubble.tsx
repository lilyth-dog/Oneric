import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, LayoutAnimation } from 'react-native';
import GlassView from '../common/GlassView';
import MascotAvatar from './MascotAvatar';
import { BodyFontStyle } from '../../styles/fonts';
import { hapticService } from '../../services/hapticService';

interface MascotBubbleProps {
  text: string;
  mood?: 'happy' | 'calm' | 'concerned';
  onPress?: () => void;
}

const MascotBubble: React.FC<MascotBubbleProps> = ({ text, mood = 'calm', onPress }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    // Reset state when text changes
    setDisplayedText('');
    setIsTyping(true);

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText((prev) => prev + text[currentIndex]);
        currentIndex++;
        
        // Haptic Feedback for typing sensation (every 3rd char to avoid buzz overkill)
        if (currentIndex % 3 === 0) {
           hapticService.trigger('light'); 
        }

      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 50); // Typing speed

    return () => clearInterval(interval);
  }, [text]);

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <MascotAvatar size={60} mood={mood} />
      </View>
      
      <View style={styles.bubbleContainer}>
        <GlassView style={styles.bubble} intensity="light">
          <Text style={styles.text}>
            {displayedText}
            {isTyping && <Text style={styles.cursor}>|</Text>}
          </Text>
        </GlassView>
        {/* Triangle arrow for speech bubble */}
        {/* (Optional, simplifying for now as detached bubble looks cleaner) */}
      </View>
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
