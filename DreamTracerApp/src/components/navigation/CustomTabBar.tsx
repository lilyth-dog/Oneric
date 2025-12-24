import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions, Animated, Keyboard } from 'react-native';
import { useNavigationStore, ScreenName } from '../../stores/navigationStore';
import GlassView from '../common/GlassView';
import { ButtonFontStyle, SmallFontStyle } from '../../styles/fonts';
import Icon from 'react-native-vector-icons/Ionicons';

import Colors from '../../styles/colors';

const { width } = Dimensions.get('window');

interface TabItemData {
  name: ScreenName;
  label: string;
  icon: string;
  activeIcon: string;
}

const TABS: TabItemData[] = [
  { name: 'Home', label: '홈', icon: 'home-outline', activeIcon: 'home' },
  { name: 'DreamHistory', label: '보관함', icon: 'server-outline', activeIcon: 'server' },
  { name: 'CreateDream', label: '기록', icon: 'add', activeIcon: 'add' },
  { name: 'CommunityFeed', label: '커뮤니티', icon: 'planet-outline', activeIcon: 'planet' },
  { name: 'Profile', label: '내 정보', icon: 'person-outline', activeIcon: 'person' },
];

const CustomTabBar: React.FC = () => {
  const { currentScreen, navigate } = useNavigationStore();
  const [visible, setVisible] = React.useState(true);
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
        Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => setVisible(false));
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
        setVisible(true);
        Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start();
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [opacityAnim]);

  if (!visible) return null;

  const handlePress = (tabName: ScreenName) => {
    navigate(tabName);
  };

  const renderTab = (tab: TabItemData) => {
    const isActive = currentScreen === tab.name;
    const isSpecial = tab.name === 'CreateDream';

    if (isSpecial) {
      return (
        <TouchableOpacity
          key={tab.name}
          style={styles.centerButtonContainer}
          onPress={() => handlePress(tab.name)}
          activeOpacity={0.8}
        >
          <View style={styles.centerButton}>
            <Icon name={tab.icon} size={32} color={Colors.background} />
          </View>
          <Text style={styles.centerLabel}>{tab.label}</Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        key={tab.name}
        style={styles.tabButton}
        onPress={() => handlePress(tab.name)}
        activeOpacity={0.7}
      >
        <Icon 
          name={isActive ? tab.activeIcon : tab.icon} 
          size={24} 
          color={isActive ? Colors.primary : Colors.textSecondary} 
          style={isActive ? styles.activeIcon : undefined}
        />
        <Text style={[styles.label, isActive && styles.activeLabel]}>
          {tab.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Animated.View style={[styles.container, { opacity: opacityAnim }]}>
      <GlassView style={styles.glassContainer} intensity="heavy">
        <View style={styles.tabContent}>
          {TABS.map(renderTab)}
        </View>
      </GlassView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    height: 72, 
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  glassContainer: {
    borderRadius: 36,
    overflow: 'hidden',
    height: '100%',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  tabContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: '100%',
    paddingHorizontal: 12,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    flex: 1,
  },
  activeIcon: {
    textShadowColor: Colors.glow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  label: {
    ...SmallFontStyle,
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  activeLabel: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  centerButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    top: -16,
  },
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 4,
    borderColor: Colors.background,
  },
  centerLabel: {
    ...SmallFontStyle,
    fontSize: 10,
    marginTop: 4,
    color: Colors.primary,
    fontWeight: 'bold',
  }
});

export default CustomTabBar;
