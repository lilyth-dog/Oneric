import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import GlassView from '../common/GlassView';
import { EmotionalTitleStyle, ButtonFontStyle } from '../../styles/fonts';
import Colors from '../../styles/colors';
import { hapticService } from '../../services/hapticService';
import { soundService } from '../../services/soundService';

const { width } = Dimensions.get('window');

interface QuickActionsProps {
  onAction: (target: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onAction }) => {
  const actions = [
    { id: 'CreateDream', title: '꿈 기록', icon: '✨', primary: true },
    { id: 'Insights', title: '인사이트', icon: '📊' },
    { id: 'VisualizationGallery', title: '시각화', icon: '🎨' },
    { id: 'CommunityFeed', title: '커뮤니티', icon: '🌍' },
  ];

  const handlePress = (id: string) => {
    hapticService.trigger('light');
    soundService.play('click');
    onAction(id);
  };

  return (
    <GlassView style={styles.container}>
      <Text style={styles.sectionTitle}>빠른 작업</Text>
      <View style={styles.grid}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[
              styles.button,
              action.primary && styles.primaryButton
            ]}
            onPress={() => handlePress(action.id)}
          >
            <Text style={styles.icon}>{action.icon}</Text>
            <Text style={[
              styles.text,
              action.primary && styles.primaryText
            ]}>
              {action.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </GlassView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
  },
  sectionTitle: {
    ...EmotionalTitleStyle,
    color: Colors.primary,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  button: {
    width: (width - 84) / 2, // Adjusted for padding/margins
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  icon: {
    fontSize: 28,
    marginBottom: 8,
  },
  text: {
    ...ButtonFontStyle,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  primaryText: {
    color: Colors.textInverse,
    fontWeight: 'bold',
  },
});

export default QuickActions;
