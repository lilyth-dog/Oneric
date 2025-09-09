/**
 * 꿈 시각화 화면
 */
import React, { useState, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useDreamStore } from '../../stores/dreamStore';
import visualizationService from '../../services/visualizationService';

interface RouteParams {
  dreamId: string;
}

interface VisualizationStyle {
  key: string;
  name: string;
}

interface DreamVisualization {
  id: string;
  dream_id: string;
  image_path: string;
  art_style: string;
  created_at: string;
}

const DreamVisualizationScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { dreamId } = route.params as RouteParams;
  
  const { dreams } = useDreamStore();
  
  const [visualizations, setVisualizations] = useState<DreamVisualization[]>([]);
  const [availableStyles, setAvailableStyles] = useState<VisualizationStyle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string>('surreal');
  const [showStyleModal, setShowStyleModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // 현재 꿈 정보 찾기
  const currentDream = dreams.find(dream => dream.id === dreamId);

  const loadVisualizations = useCallback(async () => {
    try {
      const data = await visualizationService.getDreamVisualizations(dreamId);
      setVisualizations(data);
    } catch (loadError) {
      console.error('Load visualizations error:', loadError);
    }
  }, [dreamId]);

  const loadAvailableStyles = useCallback(async () => {
    try {
      const styles = await visualizationService.getVisualizationStyles();
      setAvailableStyles(styles);
    } catch (loadError) {
      console.error('Load styles error:', loadError);
    }
  }, []);

  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        loadVisualizations(),
        loadAvailableStyles(),
      ]);
    } catch (loadError) {
      Alert.alert('오류', '데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [loadVisualizations, loadAvailableStyles]);

  useEffect(() => {
    loadInitialData();
  }, [dreamId, loadInitialData]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadInitialData();
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateVisualization = async () => {
    try {
      setIsCreating(true);
      const newVisualization = await visualizationService.createDreamVisualization(
        dreamId, 
        selectedStyle
      );
      
      setVisualizations(prev => [newVisualization, ...prev]);
      setShowStyleModal(false);
      Alert.alert('성공', '꿈 시각화가 생성되었습니다!');
    } catch (error) {
      Alert.alert('오류', '시각화 생성에 실패했습니다.');
    } finally {
      setIsCreating(false);
    }
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

  const renderStyleModal = () => (
    <Modal
      visible={showStyleModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowStyleModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>미술 스타일 선택</Text>
          
          <ScrollView style={styles.styleList}>
            {availableStyles.map((style) => (
              <TouchableOpacity
                key={style.key}
                style={[
                  styles.styleItem,
                  selectedStyle === style.key && styles.selectedStyleItem
                ]}
                onPress={() => setSelectedStyle(style.key)}
              >
                <Text style={[
                  styles.styleItemText,
                  selectedStyle === style.key && styles.selectedStyleItemText
                ]}>
                  {visualizationService.getStyleKoreanName(style.key)}
                </Text>
                <Text style={styles.styleItemDescription}>
                  {style.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowStyleModal(false)}
            >
              <Text style={styles.modalCancelButtonText}>취소</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalCreateButton, isCreating && styles.disabledButton]}
              onPress={handleCreateVisualization}
              disabled={isCreating}
            >
              <Text style={styles.modalCreateButtonText}>
                {isCreating ? '생성 중...' : '시각화 생성'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderImageModal = () => (
    <Modal
      visible={!!selectedImage}
      transparent
      animationType="fade"
      onRequestClose={() => setSelectedImage(null)}
    >
      <View style={styles.imageModalOverlay}>
        <TouchableOpacity
          style={styles.imageModalClose}
          onPress={() => setSelectedImage(null)}
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
      </View>
    </Modal>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e94560" />
        <Text style={styles.loadingText}>시각화를 불러오는 중...</Text>
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
        <Text style={styles.headerTitle}>꿈 시각화</Text>
        <TouchableOpacity 
          style={styles.createButton} 
          onPress={() => setShowStyleModal(true)}
        >
          <Text style={styles.createButtonText}>+ 생성</Text>
        </TouchableOpacity>
      </View>

      {/* 꿈 정보 */}
      {currentDream && (
        <View style={styles.dreamInfo}>
          <Text style={styles.dreamTitle}>
            {currentDream.title || '제목 없음'}
          </Text>
          <Text style={styles.dreamDate}>
            {new Date(currentDream.dream_date).toLocaleDateString()}
          </Text>
        </View>
      )}

      {/* 시각화 목록 */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {visualizations.length === 0 ? (
          <View style={styles.noVisualizationsContainer}>
            <Text style={styles.noVisualizationsTitle}>시각화가 없습니다</Text>
            <Text style={styles.noVisualizationsText}>
              꿈을 시각화로 변환해보세요. 다양한 미술 스타일로 꿈을 표현할 수 있습니다.
            </Text>
            <TouchableOpacity 
              style={styles.createFirstButton} 
              onPress={() => setShowStyleModal(true)}
            >
              <Text style={styles.createFirstButtonText}>첫 시각화 생성하기</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.visualizationGrid}>
            {visualizations.map((visualization) => (
              <View key={visualization.id} style={styles.visualizationCard}>
                <TouchableOpacity
                  style={styles.imageContainer}
                  onPress={() => setSelectedImage(visualization.image_path)}
                >
                  <Image
                    source={{ uri: visualizationService.getImageUrl(visualization.image_path) }}
                    style={styles.visualizationImage}
                    resizeMode="cover"
                  />
                  <View style={styles.imageOverlay}>
                    <Text style={styles.overlayText}>🔍</Text>
                  </View>
                </TouchableOpacity>
                
                <View style={styles.visualizationInfo}>
                  <Text style={styles.visualizationStyle}>
                    {visualizationService.getStyleKoreanName(visualization.art_style)}
                  </Text>
                  <Text style={styles.visualizationDate}>
                    {new Date(visualization.created_at).toLocaleDateString()}
                  </Text>
                </View>
                
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteVisualization(visualization.id)}
                >
                  <Text style={styles.deleteButtonText}>삭제</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* 모달들 */}
      {renderStyleModal()}
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
  createButton: {
    backgroundColor: '#e94560',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  dreamInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d44',
  },
  dreamTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dreamDate: {
    color: '#888888',
    fontSize: 14,
  },
  content: {
    flex: 1,
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
    marginBottom: 24,
    lineHeight: 24,
  },
  createFirstButton: {
    backgroundColor: '#e94560',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  createFirstButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  visualizationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
  },
  visualizationCard: {
    width: '47%',
    backgroundColor: '#2d2d44',
    borderRadius: 12,
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
  visualizationStyle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  visualizationDate: {
    color: '#888888',
    fontSize: 12,
  },
  deleteButton: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#2d2d44',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  styleList: {
    maxHeight: 300,
  },
  styleItem: {
    backgroundColor: '#3d3d5c',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  selectedStyleItem: {
    backgroundColor: '#e94560',
  },
  styleItemText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  selectedStyleItemText: {
    color: '#ffffff',
  },
  styleItemDescription: {
    color: '#cccccc',
    fontSize: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#6b6b6b',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCreateButton: {
    flex: 1,
    backgroundColor: '#e94560',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCreateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#6b6b6b',
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
    height: '80%',
  },
});

export default DreamVisualizationScreen;
