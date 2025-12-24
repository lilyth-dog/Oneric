import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { DreamAnalysisResponse } from '../../services/dreamAnalysisService';
import { AIModel } from '../../services/aiService';
import { 
  EmotionalTitleStyle, 
  EmotionalSubtitleStyle, 
  BodyFontStyle, 
  SmallFontStyle,
} from '../../styles/fonts';
import GlassView from '../common/GlassView';
import MascotBubble from '../mascot/MascotBubble';
import MascotAvatar from '../mascot/MascotAvatar';
import { hapticService } from '../../services/hapticService';
import { ModelSelector } from './result/ModelSelector';
import { ResultSection } from './result/ResultSection';
import { getEmotionIcon, getMascotMood } from '../../utils/dreamAnalysisUtils';
import Colors from '../../styles/colors';

const { width } = Dimensions.get('window');

export interface AIModelInfo {
  model: AIModel;
  name: string;
  description: string;
  isAvailable: boolean;
}

interface AnalysisResultViewProps {
  analysisResult: DreamAnalysisResponse;
  dreamTitle?: string;
  selectedModel: AIModel;
  availableModels: AIModelInfo[];
  onModelChange: (model: AIModel) => void;
  onShare: () => void;
  onSave: () => void;
}

const ParticleEffect: React.FC = () => {
  const particles = React.useMemo(() => Array.from({ length: 15 }).map(() => ({
    x: Math.random() * 200 - 100,
    y: Math.random() * 200 - 100,
    anim: new Animated.Value(0),
    size: Math.random() * 4 + 2,
    color: Math.random() > 0.5 ? Colors.primary : Colors.secondary,
  })), []);

  useEffect(() => {
    const animations = particles.map(p => 
      Animated.timing(p.anim, {
        toValue: 1,
        duration: 1000 + Math.random() * 500,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      })
    );
    Animated.stagger(20, animations).start();
  }, [particles]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: p.size,
            height: p.size,
            borderRadius: p.size / 2,
            backgroundColor: p.color,
            opacity: p.anim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, 1, 0],
            }),
            transform: [
              { translateX: p.anim.interpolate({ inputRange: [0, 1], outputRange: [0, p.x] }) },
              { translateY: p.anim.interpolate({ inputRange: [0, 1], outputRange: [0, p.y] }) },
              { scale: p.anim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.5] }) },
            ],
          }}
        />
      ))}
    </View>
  );
};

export const AnalysisResultView: React.FC<AnalysisResultViewProps> = ({
  analysisResult,
  dreamTitle,
  selectedModel,
  availableModels,
  onModelChange,
  onShare,
  onSave,
}) => {
  const { analysis, visualization, insights, recommendations } = analysisResult;
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const headerScale = useRef(new Animated.Value(0.95)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(headerScale, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
    hapticService.trigger('success');
  }, [fadeAnim, slideAnim, headerScale]);
  
  const mascotMood = getMascotMood(analysis.emotionalTone);
  const mascotText = `이 꿈은 '${analysis.keywords[0] || '무의식'}'에 관한 이야기네요.\n${insights[0] || analysis.summary.slice(0, 50) + '...'}`;

  return (
    <Animated.ScrollView 
      style={[styles.content, { opacity: fadeAnim }]} 
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Animated.View style={[styles.header, { transform: [{ scale: headerScale }, { translateY: slideAnim }] }]}>
        <View style={styles.headerMascotRow}>
          <TouchableOpacity activeOpacity={0.9} onPress={() => hapticService.trigger('light')}>
            <MascotAvatar size={80} mood={mascotMood} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>꿈 분석 결과</Text>
            <Text style={styles.subtitle}>{dreamTitle || '제목 없음'}</Text>
            <View style={styles.emotionBadge}>
              <Text style={styles.emotionBadgeIcon}>{getEmotionIcon(analysis.emotionalTone)}</Text>
              <Text style={styles.emotionBadgeText}>{analysis.emotionalTone}</Text>
            </View>
          </View>
        </View>
        <View style={styles.mascotBubbleContainer}>
          <MascotBubble text={mascotText} mood={mascotMood} hideAvatar={true} />
        </View>
      </Animated.View>

      <ModelSelector 
        selectedModel={selectedModel} 
        availableModels={availableModels} 
        onModelChange={onModelChange} 
      />

      {visualization && (
        <ResultSection title="꿈 시각화" icon="🖼️">
          <Image source={{ uri: visualization.imageUrl }} style={styles.visualizationImage} />
          <Text style={styles.visualizationDescription}>{visualization.description}</Text>
        </ResultSection>
      )}

      <ResultSection title="꿈 요약" icon="📝">
        <ParticleEffect />
        <Text style={styles.bodyText}>{analysis.summary}</Text>
      </ResultSection>

      <ResultSection title="주요 키워드" icon="🔑">
        <View style={styles.tagGrid}>
          {analysis.keywords.map((keyword: string, i: number) => (
            <View key={i} style={styles.tag}><Text style={styles.tagText}>{keyword}</Text></View>
          ))}
        </View>
      </ResultSection>

      <ResultSection title="상징 분석" icon="🔮">
        {analysis.symbols.map((symbol: { symbol: string; confidence: number; meaning: string }, i: number) => (
          <View key={i} style={styles.symbolItem}>
            <Text style={styles.symbolName}>{symbol.symbol} ({(symbol.confidence * 100).toFixed(0)}%)</Text>
            <Text style={styles.symbolMeaning}>{symbol.meaning}</Text>
          </View>
        ))}
      </ResultSection>

      <ResultSection title="AI 인사이트" icon="💡">
        {insights.map((insight: string, i: number) => (
          <Text key={i} style={styles.listItem}>• {insight}</Text>
        ))}
      </ResultSection>

      <ResultSection title="반성 질문" icon="❓">
        {analysis.reflectiveQuestions.map((q: string, i: number) => (
          <Text key={i} style={styles.listItem}>• {q}</Text>
        ))}
      </ResultSection>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.shareButton} onPress={onShare}>
          <Icon name="share-social-outline" size={20} color={Colors.primary} style={{marginRight: 8}} />
          <Text style={styles.shareButtonText}>공유하기</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={onSave}>
          <Icon name="save-outline" size={20} color={Colors.textInverse} style={{marginRight: 8}} />
          <Text style={styles.saveButtonText}>저장하기</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpacer} />
    </Animated.ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    marginTop: 20,
  },
  headerMascotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  title: {
    ...EmotionalTitleStyle,
    fontSize: 24,
    color: Colors.primary,
  },
  subtitle: {
    ...EmotionalSubtitleStyle,
    color: Colors.textSecondary,
    fontSize: 16,
  },
  emotionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(167, 139, 250, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  emotionBadgeIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  emotionBadgeText: {
    ...SmallFontStyle,
    color: Colors.secondary,
    fontSize: 12,
  },
  mascotBubbleContainer: {
    marginTop: 8,
  },
  visualizationImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: Colors.surface,
  },
  visualizationDescription: {
    ...BodyFontStyle,
    color: Colors.textSecondary,
    fontSize: 13,
  },
  bodyText: {
    ...BodyFontStyle,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: 'rgba(255, 221, 168, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    ...SmallFontStyle,
    color: Colors.primary,
  },
  symbolItem: {
    marginBottom: 12,
  },
  symbolName: {
    ...BodyFontStyle,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  symbolMeaning: {
    ...SmallFontStyle,
    color: Colors.textSecondary,
  },
  listItem: {
    ...BodyFontStyle,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  shareButton: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: Colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  shareButtonText: {
    ...SmallFontStyle,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    ...SmallFontStyle,
    color: Colors.textInverse,
    fontWeight: 'bold',
  },
  bottomSpacer: {
    height: 40,
  },
});
