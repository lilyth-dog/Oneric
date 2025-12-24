import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GlassView from '../../common/GlassView';
import { EmotionalTitleStyle } from '../../../styles/fonts';
import Colors from '../../../styles/colors';

interface ResultSectionProps {
  title: string;
  children: React.ReactNode;
  icon?: string;
}

export const ResultSection: React.FC<ResultSectionProps> = ({ title, children, icon }) => {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <Text style={styles.title}>{title}</Text>
      </View>
      <GlassView style={styles.content}>
        {children}
      </GlassView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 18,
    marginRight: 8,
  },
  title: {
    ...EmotionalTitleStyle,
    fontSize: 18,
    color: Colors.primary,
  },
  content: {
    padding: 16,
    borderRadius: 20,
  },
});
