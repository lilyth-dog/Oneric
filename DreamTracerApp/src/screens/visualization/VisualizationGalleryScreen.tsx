/**
 * 시각화 갤러리 화면
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Image,
  Modal,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import visualizationService from '../../services/visualizationService';

interface VisualizationItem {
  id: string;
  dream_id: string;
  dream_title: string;
  image_path: string;
  art_style: string;
  created_at: string;
}

const VisualizationGalleryScreen: React.FC = () => {
  const navigation = useNavigation();
  
  const [visualizations, setVisualizations] = useState<VisualizationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVisualization, setSelectedVisualization] = useState<VisualizationItem | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadVisualizations();
  }, []);

  const loadVisualizations = async (pageNum: number = 1, refresh: boolean = false) => {
    try {
      if (refresh) {
        setIsLoading(true);
        setPage(1);
      } else if (pageNum === 1) {
        setIsLoading(true);
      }

      const skip = (pageNum - 1) * 20;
      const data = await visualizationService.getVisualizationGallery(skip, 20);
      
      if (refresh || pageNum === 1) {
        setVisualizations(data.visualizations);
      } else {
        setVisualizations(prev => [...prev, ...data.visualizations]);
      }
      
      setHasMore(data.visualizations.length === 20);
      setPage(pageNum);
    } catch (error) {
      Alert.alert('오류', '갤러리를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadVisualizations(1, true);
    } finally {
      setRefreshing(false);
    }
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      loadVisualizations(page + 1);
    }
  };

  const handleImagePress = (visualization: VisualizationItem) => {
    setSelectedVisualization(visualization);
    setSelectedImage(visualization.image_path);
  };

  const handleDeleteVisualization = async (visualizationId: string) => {
    Alert.alert(
      '시각화 삭제',
      '이 시각화를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await visualizationService.deleteVisualization(visualizationId);
              setVisualizations(prev => 
                prev.filter(v => v.id !== visualizationId)
              );
              Alert.alert('성공', '시각화가 삭제되었습니다.');
            } catch (error) {
              Alert.alert('오류', '시각화 삭제에 실패했습니다.');
            }
          }
        }
      ]
    );
  };

  const renderVisualizationItem = ({ item }: { item: VisualizationItem }) => (
    <View style={styles.visualizationCard}>
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={() => handleImagePress(item)}
      >
        <Image
          source={{ uri: visualizationService.getImageUrl(item.image_path) }}
          style={styles.visualizationImage}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay}>
          <Text style={styles.overlayText}>🔍</Text>
        </View>
      </TouchableOpacity>
      
      <View style={styles.visualizationInfo}>
        <Text style={styles.dreamTitle} numberOfLines={1}>
          {item.dream_title}
        </Text>
        <Text style={styles.visualizationStyle}>
          {visualizationService.getStyleKoreanName(item.art_style)}
        </Text>
        <Text style={styles.visualizationDate}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
      
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => (navigation as any).navigate('DreamDetail', { dreamId: item.dream_id })}
        >
          <Text style={styles.viewButtonText}>꿈 보기</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteVisualization(item.id)}
        >
          <Text style={styles.deleteButtonText}>삭제</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderImageModal = () => (
    <Modal
      visible={!!selectedImage}
      transparent
      animationType="fade"
      onRequestClose={() => {
        setSelectedImage(null);
        setSelectedVisualization(null);
      }}
    >
      <View style={styles.imageModalOverlay}>
        <TouchableOpacity
          style={styles.imageModalClose}
          onPress={() => {
            setSelectedImage(null);
            setSelectedVisualization(null);
          }}
        >
          <Text style={styles.imageModalCloseText}>✕</Text>
        </TouchableOpacity>
        
        {selectedImage && (
          <Image
            source={{ uri: visualizationService.getImageUrl(selectedImage) }}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
        )}
        
        {selectedVisualization && (
          <View style={styles.imageModalInfo}>
            <Text style={styles.imageModalTitle}>
              {selectedVisualization.dream_title}
            </Text>
            <Text style={styles.imageModalStyle}>
              {visualizationService.getStyleKoreanName(selectedVisualization.art_style)}
            </Text>
            <Text style={styles.imageModalDate}>
              {new Date(selectedVisualization.created_at).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#e94560" />
      </View>
    );
  };

  if (isLoading && visualizations.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e94560" />
        <Text style={styles.loadingText}>갤러리를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>시각화 갤러리</Text>
        <View style={styles.placeholder} />
      </View>

      {/* 통계 */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          총 {visualizations.length}개의 시각화
        </Text>
      </View>

      {/* 시각화 목록 */}
      {visualizations.length === 0 ? (
        <View style={styles.noVisualizationsContainer}>
          <Text style={styles.noVisualizationsTitle}>시각화가 없습니다</Text>
          <Text style={styles.noVisualizationsText}>
            꿈을 시각화로 변환하면 여기에 표시됩니다.
          </Text>
        </View>
      ) : (
        <FlatList
          data={visualizations}
          renderItem={renderVisualizationItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.visualizationGrid}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      )}

      {/* 이미지 모달 */}
      {renderImageModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d44',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#e94560',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  statsContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d44',
  },
  statsText: {
    color: '#888888',
    fontSize: 14,
  },
  visualizationGrid: {
    padding: 16,
  },
  visualizationCard: {
    flex: 1,
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    margin: 8,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 1,
  },
  visualizationImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: '#ffffff',
    fontSize: 16,
  },
  visualizationInfo: {
    padding: 12,
  },
  dreamTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  visualizationStyle: {
    color: '#e94560',
    fontSize: 12,
    marginBottom: 4,
  },
  visualizationDate: {
    color: '#888888',
    fontSize: 10,
  },
  cardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#3d3d5c',
  },
  viewButton: {
    flex: 1,
    backgroundColor: '#4ecdc4',
    paddingVertical: 8,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#ff6b6b',
    paddingVertical: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  noVisualizationsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noVisualizationsTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  noVisualizationsText: {
    color: '#888888',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  footerLoader: {
    padding: 20,
    alignItems: 'center',
  },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  imageModalCloseText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  fullScreenImage: {
    width: '90%',
    height: '70%',
  },
  imageModalInfo: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    padding: 16,
  },
  imageModalTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  imageModalStyle: {
    color: '#e94560',
    fontSize: 14,
    marginBottom: 4,
  },
  imageModalDate: {
    color: '#888888',
    fontSize: 12,
  },
});

export default VisualizationGalleryScreen;
