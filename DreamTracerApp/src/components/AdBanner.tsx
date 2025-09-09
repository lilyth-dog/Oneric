import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Fonts } from '../styles/fonts';

interface AdBannerProps {
  onPress?: () => void;
  type?: 'banner' | 'interstitial' | 'rewarded';
}

export const AdBanner: React.FC<AdBannerProps> = ({ 
  onPress, 
  type = 'banner' 
}) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <Text style={styles.title}>광고</Text>
        <Text style={styles.subtitle}>
          {type === 'banner' && '꿈결을 무료로 사용할 수 있게 도와주세요'}
          {type === 'interstitial' && '프리미엄으로 광고 없이 이용하세요'}
          {type === 'rewarded' && '광고 시청으로 프리미엄 기능을 체험하세요'}
        </Text>
        <Text style={styles.cta}>
          {type === 'banner' && '탭하여 자세히 보기'}
          {type === 'interstitial' && '프리미엄 구독하기'}
          {type === 'rewarded' && '광고 시청하기'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    margin: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  content: {
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontFamily: Fonts.primary.medium,
    color: '#6C757D',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: Fonts.primary.regular,
    color: '#495057',
    textAlign: 'center',
    marginBottom: 8,
  },
  cta: {
    fontSize: 12,
    fontFamily: Fonts.primary.bold,
    color: '#4A4063',
    textAlign: 'center',
  },
});
