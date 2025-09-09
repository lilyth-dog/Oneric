/**
 * Naver 아이콘 컴포넌트
 * Naver 공식 브랜드 색상 사용
 */
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

interface NaverIconProps {
  size?: number;
}

const NaverIcon: React.FC<NaverIconProps> = ({ size = 20 }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.icon, { width: size, height: size }]}>
        <Text style={[styles.text, { fontSize: size * 0.6 }]}>N</Text>
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
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#03C75A', // Naver Green
    fontWeight: 'bold',
  },
});

export default NaverIcon;
