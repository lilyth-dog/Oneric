import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import BrandLogo from '../common/BrandLogo';
import { 
  DreamRecordTitleStyle, 
  BodyFontStyle, 
  EmotionalSubtitleStyle,
  SmallFontStyle 
} from '../../styles/fonts';
import { Dream } from '../../types/dream';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = CARD_WIDTH * 1.5; // Aspect Ratio for Instagram Stories

interface DreamShareCardProps {
  dream: Dream;
  userName?: string;
}

const DreamShareCard: React.FC<DreamShareCardProps> = ({ dream, userName = 'Dreamer' }) => {
  return (
    <View style={styles.container}>
      {/* Background with Gradient-like color */}
      <View style={styles.background} />
      
      {/* Decorative Overlay */}
      <View style={styles.overlay} />

      {/* Content */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
           <BrandLogo width={60} height={60} />
           <Text style={styles.appName}>꿈결 Oneiric</Text>
        </View>

        {/* Date */}
        <Text style={styles.date}>
           {new Date(dream.created_at).toLocaleDateString('ko-KR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              weekday: 'long'
           })}
        </Text>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
           {dream.title || '무제'}
        </Text>

        {/* Body Text */}
        <Text style={styles.body} numberOfLines={10}>
           {dream.body_text}
        </Text>

        {/* Tags */}
        {dream.emotion_tags && dream.emotion_tags.length > 0 && (
            <View style={styles.tagsContainer}>
                {dream.emotion_tags.map((tag, idx) => (
                    <View key={idx} style={styles.tag}>
                         <Text style={styles.tagText}>#{tag}</Text>
                    </View>
                ))}
            </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
           <Text style={styles.footerText}>
              Recorded by {userName}
           </Text>
           {dream.lucidity_level && dream.lucidity_level >= 4 && (
               <Text style={styles.lucidBadge}>✨ Lucid Dream</Text>
           )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#191D2E', // Night Sky Blue
    overflow: 'hidden',
    // We don't use borderRadius here because capture might cut corners differently on devices
  },
  background: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: '#191D2E',
  },
  overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(74, 64, 99, 0.2)', // Subtle tint
      // Add gradient logic if needed via another library, but solid color is safe for basic ViewShot
  },
  content: {
      flex: 1,
      padding: 32,
      justifyContent: 'space-between',
  },
  header: {
      alignItems: 'center',
      marginBottom: 20,
  },
  appName: {
      ...EmotionalSubtitleStyle,
      color: '#FFDDA8',
      fontSize: 16,
      marginTop: 8,
      letterSpacing: 2,
  },
  date: {
      ...SmallFontStyle,
      color: '#8F8C9B',
      textAlign: 'center',
      marginBottom: 16,
  },
  title: {
      ...DreamRecordTitleStyle,
      fontSize: 28,
      color: '#EAE8F0',
      textAlign: 'center',
      marginBottom: 24,
  },
  body: {
      ...BodyFontStyle,
      color: '#D0CDE1',
      fontSize: 16,
      lineHeight: 26,
      textAlign: 'center',
      flex: 1,
  },
  tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 8,
      marginBottom: 32,
  },
  tag: {
      backgroundColor: 'rgba(255, 221, 168, 0.1)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(255, 221, 168, 0.3)',
  },
  tagText: {
      ...SmallFontStyle,
      color: '#FFDDA8',
  },
  footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 255, 255, 0.1)',
      paddingTop: 16,
  },
  footerText: {
      ...SmallFontStyle,
      color: '#595566',
      fontSize: 12,
  },
  lucidBadge: {
      ...SmallFontStyle,
      color: '#FFDDA8',
      fontWeight: 'bold',
  }

});

export default DreamShareCard;
