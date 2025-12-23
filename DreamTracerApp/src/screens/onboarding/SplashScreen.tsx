import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import AnimatedBackground from '../../components/AnimatedBackground';
import BrandLogo from '../../components/common/BrandLogo';
import { DreamyLogoStyle, DreamySubtitleStyle } from '../../styles/fonts';

import Sound from 'react-native-sound';

const { width } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish?: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Enable playback in silence mode
    Sound.setCategory('Playback');

    // Load the sound file 'intro_sound.mp3.wav' from the app bundle
    const whoosh = new Sound('intro_sound.mp3.wav', Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('failed to load the sound', error);
        return;
      }
      // loaded successfully
      // Play the sound with an onEnd callback
      whoosh.play((success) => {
        if (success) {
          console.log('successfully finished playing');
        } else {
          console.log('playback failed due to audio decoding errors');
        }
      });
    });

    // Sequence: Logo Fade In & Scale -> Text Fade In -> Hold -> Callback
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.delay(1000), // Hold for a moment
    ]).start(() => {
      // Allow parent to unmount or transition
      if (onFinish) onFinish();
    });

    return () => {
      whoosh.release();
    };
  }, []);

  return (
    <AnimatedBackground>
      <View style={styles.container}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
            alignItems: 'center',
          }}
        >
          <BrandLogo width={180} height={180} />
        </Animated.View>
        
        <Animated.Text 
          style={[
            styles.title, 
            DreamyLogoStyle, 
            { opacity: textFadeAnim, transform: [{ translateY: 0 }] } // Using translateY in style directly works
          ]}
        >
          꿈결
        </Animated.Text>
        
        <Animated.Text 
          style={[
            styles.subtitle, 
            DreamySubtitleStyle, 
            { opacity: textFadeAnim }
          ]}
        >
          무의식의 세계로 떠나는 여행
        </Animated.Text>
      </View>
    </AnimatedBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  title: {
    fontSize: 48,
    marginTop: 24,
    color: '#FFDDA8',
    textShadowColor: 'rgba(255, 221, 168, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 16,
    color: '#D0CDE1',
    letterSpacing: 1.5,
  }
});

export default SplashScreen;
