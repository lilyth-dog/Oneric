import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GlassView from '../common/GlassView';
import { EmotionalTitleStyle, StatisticsStyle } from '../../styles/fonts';
import Colors from '../../styles/colors';
import { Dream } from '../../types/dream';

interface StatsOverviewProps {
  dreams: Dream[];
  recentDreamsCount: number;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ dreams, recentDreamsCount }) => {
  const lucidDreamsCount = dreams.filter(d => (d.lucidity_level || 0) >= 4).length;

  return (
    <GlassView style={styles.container}>
      <Text style={styles.sectionTitle}>통계</Text>
      <View style={styles.grid}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{dreams.length}</Text>
          <Text style={styles.statLabel}>총 꿈</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{recentDreamsCount}</Text>
          <Text style={styles.statLabel}>이번 주</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{lucidDreamsCount}</Text>
          <Text style={styles.statLabel}>자각몽</Text>
        </View>
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
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...StatisticsStyle,
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    ...StatisticsStyle,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});

export default StatsOverview;
