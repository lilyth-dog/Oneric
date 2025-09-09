/**
 * 시각화 갤러리 화면
 * 디자인 가이드에 따른 "고요한 탐험" 컨셉 구현
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigationStore } from '../../stores/navigationStore';

const { width } = Dimensions.get('window');
const imageWidth = (width - 48) / 2;

const VisualizationGalleryScreen: React.FC = () => {
  const { goBack } = useNavigationStore();
  const [selectedStyle, setSelectedStyle] = useState<string>('all');

  // 샘플 시각화 데이터 (실제로는 API에서 가져올 데이터)
  const sampleVisualizations = [
    {
      id: '1',
      title: '몽환적 수채화',
      style: 'watercolor',
      imageUrl: 'https://via.placeholder.com/300x300/4A4063/FFDDA8?text=수채화',
      dreamTitle: '바다 위의 꿈',
    },
    {
      id: '2',
      title: '초현실주의 유화',
      style: 'surreal',
      imageUrl: 'https://via.placeholder.com/300x300/FFDDA8/191D2E?text=초현실',
      dreamTitle: '날아다니는 집',
    },
    {
      id: '3',
      title: '디지털 아트',
      style: 'digital',
      imageUrl: 'https://via.placeholder.com/300x300/191D2E/FFDDA8?text=디지털',
      dreamTitle: '미래 도시',
    },
    {
      id: '4',
      title: '인상주의',
      style: 'impressionist',
      imageUrl: 'https://via.placeholder.com/300x300/4A4063/EAE8F0?text=인상주의',
      dreamTitle: '꽃밭에서의 산책',
    },
  ];

  const artStyles = [
    { id: 'all', name: '전체', icon: '🎨' },
    { id: 'watercolor', name: '수채화', icon: '🖌️' },
    { id: 'surreal', name: '초현실주의', icon: '🌌' },
    { id: 'digital', name: '디지털', icon: '💻' },
    { id: 'impressionist', name: '인상주의', icon: '🌻' },
  ];

  const filteredVisualizations = selectedStyle === 'all' 
    ? sampleVisualizations 
    : sampleVisualizations.filter(v => v.style === selectedStyle);

  const renderStyleFilter = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.styleFilter}
    >
      {artStyles.map(style => (
        <TouchableOpacity
          key={style.id}
          style={[
            styles.styleButton,
            selectedStyle === style.id && styles.styleButtonActive
          ]}
          onPress={() => setSelectedStyle(style.id)}
        >
          <Text style={styles.styleIcon}>{style.icon}</Text>
          <Text style={[
            styles.styleText,
            selectedStyle === style.id && styles.styleTextActive
          ]}>
            {style.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderVisualizationGrid = () => (
    <View style={styles.grid}>
      {filteredVisualizations.map((visualization) => (
        <TouchableOpacity
          key={visualization.id}
          style={styles.visualizationCard}
        >
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: visualization.imageUrl }}
              style={styles.visualizationImage}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay}>
              <Text style={styles.styleLabel}>{visualization.title}</Text>
            </View>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.dreamTitle} numberOfLines={1}>
              {visualization.dreamTitle}
            </Text>
            <Text style={styles.dreamDate}>2024.01.15</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🎨</Text>
      <Text style={styles.emptyTitle}>아직 시각화된 꿈이 없습니다</Text>
      <Text style={styles.emptySubtitle}>
        꿈을 기록하고 AI가 아름다운 이미지로 변환해드릴게요
      </Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => goBack()}
      >
        <Text style={styles.createButtonText}>꿈 기록하기</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backButtonText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>꿈 갤러리</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* 스타일 필터 */}
        {renderStyleFilter()}

        {/* 시각화 그리드 또는 빈 상태 */}
        {filteredVisualizations.length > 0 ? (
          renderVisualizationGrid()
        ) : (
          renderEmptyState()
        )}

        {/* 하단 여백 */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#191D2E', // Night Sky Blue
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#4A4063', // Dawn Purple
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#FFDDA8', // Starlight Gold
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#FFDDA8', // Starlight Gold
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  styleFilter: {
    marginBottom: 24,
  },
  styleButton: {
    backgroundColor: '#4A4063', // Dawn Purple
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  styleButtonActive: {
    backgroundColor: '#FFDDA8', // Starlight Gold
  },
  styleIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  styleText: {
    color: '#8F8C9B', // Warm Grey 400
    fontSize: 12,
    fontWeight: '500',
  },
  styleTextActive: {
    color: '#191D2E', // Night Sky Blue
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  visualizationCard: {
    width: imageWidth,
    backgroundColor: '#4A4063', // Dawn Purple
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  visualizationImage: {
    width: '100%',
    height: imageWidth,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
  },
  styleLabel: {
    color: '#FFDDA8', // Starlight Gold
    fontSize: 12,
    fontWeight: '500',
  },
  cardContent: {
    padding: 12,
  },
  dreamTitle: {
    color: '#EAE8F0', // Warm Grey 100
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  dreamDate: {
    color: '#8F8C9B', // Warm Grey 400
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#EAE8F0', // Warm Grey 100
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#8F8C9B', // Warm Grey 400
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#FFDDA8', // Starlight Gold
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  createButtonText: {
    color: '#191D2E', // Night Sky Blue
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpacer: {
    height: 40,
  },
});

export default VisualizationGalleryScreen;