/**
 * 꿈 분석 도우미 유틸리티
 */

export const getEmotionIcon = (tone: string): string => {
    if (tone.includes('불안') || tone.includes('Fear')) return '😰';
    if (tone.includes('슬픔') || tone.includes('Sad')) return '😢';
    if (tone.includes('공포') || tone.includes('Horror')) return '😱';
    if (tone.includes('행복') || tone.includes('기쁨') || tone.includes('설렘') || tone.includes('Happy') || tone.includes('Excited')) return '🥳';
    if (tone.includes('평온') || tone.includes('Calm')) return '😌';
    if (tone.includes('신비') || tone.includes('Mystery')) return '🔮';
    return '✨';
};

export const getMascotMood = (tone: string): 'happy' | 'calm' | 'concerned' => {
    const t = tone.toLowerCase();
    if (t.includes('불안') || t.includes('슬픔') || t.includes('공포') || t.includes('fear') || t.includes('sad')) return 'concerned';
    if (t.includes('행복') || t.includes('기쁨') || t.includes('설렘') || t.includes('happy') || t.includes('excited')) return 'happy';
    return 'calm';
};
