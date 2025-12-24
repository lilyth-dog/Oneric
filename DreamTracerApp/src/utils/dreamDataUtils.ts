import { Dream } from '../types/dream';
import { DayData } from '../components/charts/WeeklyDreamChart';
import { EmotionData } from '../components/charts/EmotionHeatmap';

/**
 * 꿈 데이터를 주간 차트 형식(DayData[])으로 변환
 */
export const getWeeklyChartData = (dreams: Dream[]): DayData[] => {
    const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
    const now = new Date();

    // 최근 7일 초기화
    const data: DayData[] = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        data.push({
            day: DAYS[date.getDay()],
            count: 0,
            lucid: false,
        });
    }

    dreams.forEach(dream => {
        const dreamDate = new Date(dream.created_at);
        const dayStr = DAYS[dreamDate.getDay()];

        const dayItem = data.find(d => d.day === dayStr);
        if (dayItem) {
            dayItem.count++;
            if (dream.dream_type === 'lucid') {
                dayItem.lucid = true;
            }
        }
    });

    return data;
};

/**
 * 꿈 데이터를 감정 히트맵 형식(EmotionData[])으로 변환
 */
export const getEmotionData = (dreams: Dream[]): EmotionData[] => {
    const emotionCounts: { [key: string]: number } = {};
    let totalTags = 0;

    dreams.forEach(dream => {
        if (dream.emotion_tags) {
            dream.emotion_tags.forEach(tag => {
                emotionCounts[tag] = (emotionCounts[tag] || 0) + 1;
                totalTags++;
            });
        }
    });

    const defaultStyleMap: { [key: string]: { icon: string, color: string } } = {
        '평온': { icon: '😌', color: '#4ECDC4' },
        '불안': { icon: '😰', color: '#FF6B6B' },
        '행복': { icon: '😊', color: '#FFD93D' },
        '영감': { icon: '✨', color: '#A78BFA' },
        '슬픔': { icon: '😢', color: '#60A5FA' },
        '흥분': { icon: '🤩', color: '#F472B6' },
        '공포': { icon: '😱', color: '#D32F2F' },
        '분노': { icon: '😠', color: '#FF9800' },
    };

    return Object.entries(emotionCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, count]) => ({
            emotion: name,
            icon: defaultStyleMap[name]?.icon || '😶',
            percentage: totalTags > 0 ? Math.round((count / totalTags) * 100) : 0,
            color: defaultStyleMap[name]?.color || '#8F8C9B',
        }));
};
