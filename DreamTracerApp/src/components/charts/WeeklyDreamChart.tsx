/**
 * 주간 꿈 기록 차트 컴포넌트
 * 최근 7일간의 꿈 기록 패턴을 바 차트로 시각화
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { EmotionalSubtitleStyle, SmallFontStyle } from '../../styles/fonts';

interface DayData {
  day: string;
  count: number;
  lucid: boolean;
}

interface WeeklyDreamChartProps {
  data?: DayData[];
  onDayPress?: (day: DayData) => void;
}

const { width } = Dimensions.get('window');
const CHART_HEIGHT = 100;

// 요일 이름 (한국어)
const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

const getDefaultData = (): DayData[] => {
  const today = new Date();
  const data: DayData[] = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push({
      day: DAYS[date.getDay()],
      count: 0,
      lucid: false,
    });
  }
  
  return data;
};

export const WeeklyDreamChart: React.FC<WeeklyDreamChartProps> = ({ 
  data = getDefaultData(),
  onDayPress
}) => {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📊 이번 주 꿈 기록</Text>
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FFDDA8' }]} />
            <Text style={styles.legendText}>일반몽</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#A78BFA' }]} />
            <Text style={styles.legendText}>자각몽</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.chartContainer}>
        {/* Y축 그리드 라인 */}
        <View style={styles.gridLines}>
          {[0, 1, 2, 3].map((_, i) => (
            <View key={i} style={styles.gridLine} />
          ))}
        </View>
        
        {/* 바 차트 */}
        <View style={styles.barsContainer}>
          {data.map((dayData, index) => {
            const barHeight = dayData.count > 0 
              ? Math.max((dayData.count / maxCount) * CHART_HEIGHT, 8)
              : 4;
            
            return (
              <TouchableOpacity 
                key={index} 
                style={styles.barColumn}
                activeOpacity={0.7}
                onPress={() => onDayPress && onDayPress(dayData)}
              >
                <View style={styles.barWrapper}>
                  {/* 배경 바 (빈 상태) */}
                  <View style={styles.barBackground} />
                  
                  {/* 실제 데이터 바 */}
                  <View 
                    style={[
                      styles.bar,
                      { 
                        height: barHeight,
                        backgroundColor: dayData.lucid ? '#A78BFA' : '#FFDDA8',
                      }
                    ]}
                  >
                    {/* 글로우 효과 */}
                    {dayData.count > 0 && (
                      <View 
                        style={[
                          styles.barGlow,
                          { backgroundColor: dayData.lucid ? '#A78BFA' : '#FFDDA8' }
                        ]} 
                      />
                    )}
                  </View>
                  
                  {/* 카운트 표시 */}
                  {dayData.count > 0 && (
                    <Text style={styles.countLabel}>{dayData.count}</Text>
                  )}
                </View>
                
                {/* 요일 라벨 */}
                <Text style={[
                  styles.dayLabel,
                  index === data.length - 1 && styles.todayLabel
                ]}>
                  {dayData.day}
                  {index === data.length - 1 && '\n(오늘)'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      
      {/* 요약 통계 */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {data.reduce((sum, d) => sum + d.count, 0)}
          </Text>
          <Text style={styles.summaryLabel}>총 기록</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {data.filter(d => d.count > 0).length}
          </Text>
          <Text style={styles.summaryLabel}>기록한 날</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {data.filter(d => d.lucid).length}
          </Text>
          <Text style={styles.summaryLabel}>자각몽</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    ...EmotionalSubtitleStyle,
    color: '#FFDDA8',
  },
  legendContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    ...SmallFontStyle,
    color: '#8F8C9B',
    fontSize: 10,
  },
  chartContainer: {
    height: CHART_HEIGHT + 40,
    position: 'relative',
  },
  gridLines: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: CHART_HEIGHT,
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: CHART_HEIGHT + 40,
    paddingTop: 10,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: CHART_HEIGHT,
    width: '100%',
  },
  barBackground: {
    position: 'absolute',
    bottom: 0,
    width: 20,
    height: CHART_HEIGHT,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 4,
  },
  bar: {
    width: 20,
    borderRadius: 4,
    minHeight: 4,
    position: 'relative',
  },
  barGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    opacity: 0.5,
  },
  countLabel: {
    ...SmallFontStyle,
    color: '#FFDDA8',
    fontSize: 10,
    marginTop: 4,
    position: 'absolute',
    top: -18,
  },
  dayLabel: {
    ...SmallFontStyle,
    color: '#8F8C9B',
    fontSize: 11,
    marginTop: 8,
    textAlign: 'center',
  },
  todayLabel: {
    color: '#FFDDA8',
    fontWeight: '600',
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    ...EmotionalSubtitleStyle,
    color: '#FFDDA8',
    fontSize: 20,
    fontWeight: '700',
  },
  summaryLabel: {
    ...SmallFontStyle,
    color: '#8F8C9B',
    fontSize: 11,
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});

export default WeeklyDreamChart;
