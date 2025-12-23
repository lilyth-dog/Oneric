/**
 * AI 태그 추천 컴포넌트
 * 꿈 내용 기반 실시간 키워드/감정 태그 추천
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SmallFontStyle, EmotionalSubtitleStyle } from '../../styles/fonts';

// Android에서 LayoutAnimation 활성화
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Tag {
  id: string;
  text: string;
  type: 'keyword' | 'emotion' | 'symbol';
  icon?: string;
}

interface AITagSuggestionProps {
  dreamContent: string;
  selectedTags: string[];
  onTagSelect: (tag: Tag) => void;
  onTagRemove: (tagId: string) => void;
}

// 키워드 패턴 매칭을 위한 규칙
const KEYWORD_PATTERNS: { pattern: RegExp; tags: Tag[] }[] = [
  {
    pattern: /날다|날아|비행|하늘|구름/gi,
    tags: [
      { id: 'flying', text: '비행', type: 'keyword', icon: '🦅' },
      { id: 'freedom', text: '자유', type: 'emotion', icon: '🕊️' },
    ],
  },
  {
    pattern: /바다|물|수영|파도|강|호수/gi,
    tags: [
      { id: 'water', text: '물', type: 'keyword', icon: '💧' },
      { id: 'emotion_flow', text: '감정의 흐름', type: 'symbol', icon: '🌊' },
    ],
  },
  {
    pattern: /쫓기다|도망|추격|쫓아오/gi,
    tags: [
      { id: 'chase', text: '추격', type: 'keyword', icon: '🏃' },
      { id: 'anxiety', text: '불안', type: 'emotion', icon: '😰' },
    ],
  },
  {
    pattern: /떨어지다|추락|낙하|높은 곳/gi,
    tags: [
      { id: 'falling', text: '추락', type: 'keyword', icon: '⬇️' },
      { id: 'loss_control', text: '통제력 상실', type: 'emotion', icon: '😨' },
    ],
  },
  {
    pattern: /집|방|건물|문|창문/gi,
    tags: [
      { id: 'house', text: '집', type: 'keyword', icon: '🏠' },
      { id: 'self', text: '자아', type: 'symbol', icon: '🪞' },
    ],
  },
  {
    pattern: /가족|부모|엄마|아빠|형제|자매/gi,
    tags: [
      { id: 'family', text: '가족', type: 'keyword', icon: '👨‍👩‍👧' },
      { id: 'belonging', text: '소속감', type: 'emotion', icon: '💕' },
    ],
  },
  {
    pattern: /시험|테스트|학교|학생|교실/gi,
    tags: [
      { id: 'exam', text: '시험', type: 'keyword', icon: '📝' },
      { id: 'pressure', text: '압박감', type: 'emotion', icon: '😓' },
    ],
  },
  {
    pattern: /꽃|나무|숲|정원|자연/gi,
    tags: [
      { id: 'nature', text: '자연', type: 'keyword', icon: '🌿' },
      { id: 'growth', text: '성장', type: 'symbol', icon: '🌱' },
    ],
  },
  {
    pattern: /별|달|밤|어둠|빛/gi,
    tags: [
      { id: 'night', text: '밤', type: 'keyword', icon: '🌙' },
      { id: 'mystery', text: '신비', type: 'emotion', icon: '✨' },
    ],
  },
  {
    pattern: /행복|기쁨|웃다|즐겁/gi,
    tags: [
      { id: 'joy', text: '기쁨', type: 'emotion', icon: '😊' },
    ],
  },
  {
    pattern: /슬픔|울다|눈물|슬프/gi,
    tags: [
      { id: 'sadness', text: '슬픔', type: 'emotion', icon: '😢' },
    ],
  },
  {
    pattern: /꿈인 걸 알다|자각|루시드|깨닫/gi,
    tags: [
      { id: 'lucid', text: '자각몽', type: 'keyword', icon: '👁️' },
      { id: 'awareness', text: '의식', type: 'symbol', icon: '🧠' },
    ],
  },
];

const TAG_COLORS = {
  keyword: { bg: '#4A4063', border: '#6B5B95' },
  emotion: { bg: '#3D2F4A', border: '#A78BFA' },
  symbol: { bg: '#2D3A4A', border: '#60A5FA' },
};

export const AITagSuggestion: React.FC<AITagSuggestionProps> = ({
  dreamContent,
  selectedTags,
  onTagSelect,
  onTagRemove,
}) => {
  const [suggestedTags, setSuggestedTags] = useState<Tag[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const analyzeAnimation = useState(new Animated.Value(0))[0];

  // 콘텐츠 분석 함수
  const analyzeDreamContent = useCallback((content: string) => {
    if (!content || content.length < 5) {
      setSuggestedTags([]);
      return;
    }

    setIsAnalyzing(true);
    
    // 애니메이션 시작
    Animated.loop(
      Animated.sequence([
        Animated.timing(analyzeAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(analyzeAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 디바운스된 분석 (실제 API 호출 시뮬레이션)
    const matchedTags: Tag[] = [];
    const tagIds = new Set<string>();

    KEYWORD_PATTERNS.forEach(({ pattern, tags }) => {
      if (pattern.test(content)) {
        tags.forEach(tag => {
          if (!tagIds.has(tag.id) && !selectedTags.includes(tag.id)) {
            tagIds.add(tag.id);
            matchedTags.push(tag);
          }
        });
      }
    });

    // 상위 6개만 표시
    const limitedTags = matchedTags.slice(0, 6);
    
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSuggestedTags(limitedTags);
    setIsAnalyzing(false);
    analyzeAnimation.stopAnimation();
  }, [selectedTags, analyzeAnimation]);

  // 디바운스된 분석
  useEffect(() => {
    const timer = setTimeout(() => {
      analyzeDreamContent(dreamContent);
    }, 500);

    return () => clearTimeout(timer);
  }, [dreamContent, analyzeDreamContent]);

  const handleTagPress = (tag: Tag) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    onTagSelect(tag);
    setSuggestedTags(prev => prev.filter(t => t.id !== tag.id));
  };

  if (!dreamContent || dreamContent.length < 5) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>💡 AI 추천 태그</Text>
        {isAnalyzing && (
          <Animated.Text 
            style={[
              styles.analyzingText,
              {
                opacity: analyzeAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1],
                }),
              }
            ]}
          >
            분석 중...
          </Animated.Text>
        )}
      </View>

      {suggestedTags.length > 0 ? (
        <View style={styles.tagsContainer}>
          {suggestedTags.map((tag, index) => (
            <TouchableOpacity
              key={tag.id}
              style={[
                styles.tagButton,
                {
                  backgroundColor: TAG_COLORS[tag.type].bg,
                  borderColor: TAG_COLORS[tag.type].border,
                },
              ]}
              onPress={() => handleTagPress(tag)}
              activeOpacity={0.7}
            >
              <Text style={styles.tagIcon}>{tag.icon}</Text>
              <Text style={styles.tagText}>{tag.text}</Text>
              <Text style={styles.addIcon}>+</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            {dreamContent.length < 20 
              ? '더 많은 내용을 입력하면 태그가 추천됩니다' 
              : '패턴을 분석 중입니다...'}
          </Text>
        </View>
      )}

      {/* 태그 유형 범례 */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: TAG_COLORS.keyword.border }]} />
          <Text style={styles.legendText}>키워드</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: TAG_COLORS.emotion.border }]} />
          <Text style={styles.legendText}>감정</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: TAG_COLORS.symbol.border }]} />
          <Text style={styles.legendText}>상징</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    ...EmotionalSubtitleStyle,
    color: '#FFDDA8',
    fontSize: 14,
  },
  analyzingText: {
    ...SmallFontStyle,
    color: '#A78BFA',
    fontSize: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  tagIcon: {
    fontSize: 14,
  },
  tagText: {
    ...SmallFontStyle,
    color: '#EAE8F0',
    fontSize: 13,
  },
  addIcon: {
    ...SmallFontStyle,
    color: '#FFDDA8',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  emptyText: {
    ...SmallFontStyle,
    color: '#8F8C9B',
    fontSize: 12,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 16,
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
    color: '#595566',
    fontSize: 10,
  },
});

export default AITagSuggestion;
