import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MascotAvatar from '../mascot/MascotAvatar';
import MascotBubble from '../mascot/MascotBubble';
import { SmallFontStyle, PersonalGreetingStyle, SpecialMessageStyle } from '../../styles/fonts';
import Colors from '../../styles/colors';

interface MascotHeaderProps {
  nickname: string;
  message: string;
  mood: 'happy' | 'calm' | 'concerned';
  onMascotPress: () => void;
  onProfilePress: () => void;
}

export const MascotHeader: React.FC<MascotHeaderProps> = ({
  nickname,
  message,
  mood,
  onMascotPress,
  onProfilePress
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return '고요한 새벽이에요,';
    if (hour < 12) return '상쾌한 아침이에요,';
    if (hour < 18) return '포근한 오후네요,';
    return '편안한 저녁 되세요,';
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.userName}>{nickname}님</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.profileButton} onPress={onProfilePress}>
            <Icon name="person-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mascotWelcome}>
        <TouchableOpacity activeOpacity={0.9} onPress={onMascotPress}>
          <MascotAvatar size={70} mood={mood} />
        </TouchableOpacity>
        <View style={styles.mascotSpeech}>
          <MascotBubble text={message} mood={mood} hideAvatar={true} isSmall={true} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 20,
    paddingBottom: 16,
    // Background handled by ScrollView/GlobalBackground
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    marginLeft: 16,
  },
  greeting: {
    ...SmallFontStyle,
    color: Colors.textSecondary,
    fontSize: 13,
    marginBottom: 2,
  },
  userName: {
    ...PersonalGreetingStyle,
    color: Colors.primary,
    fontSize: 22,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mascotWelcome: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 64, 99, 0.3)',
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  mascotSpeech: {
    flex: 1,
    marginLeft: 12,
  },
});

export default MascotHeader;
