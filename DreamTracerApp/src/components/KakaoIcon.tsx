/**
 * Kakao 아이콘 컴포넌트
 * Kakao 공식 브랜드 색상 사용
 */
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

interface KakaoIconProps {
  size?: number;
}

const KakaoIcon: React.FC<KakaoIconProps> = ({ size = 20 }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.icon, { width: size, height: size }]}>
        <Text style={[styles.text, { fontSize: size * 0.6 }]}>K</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    backgroundColor: '#000000',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FEE500', // Kakao Yellow
    fontWeight: 'bold',
  },
});

export default KakaoIcon;
