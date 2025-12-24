import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDreamStore } from '../../stores/dreamStore';
import dreamService from '../../services/dreamService';
import { Dream } from '../../types/dream';
import AnimatedBackground from '../../components/AnimatedBackground';
import GlassView from '../../components/common/GlassView';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyStateGraphic from '../../components/common/EmptyStateGraphic';
import MasonryList from '../../components/common/MasonryList';
import { hapticService } from '../../services/hapticService';
import { soundService } from '../../services/soundService';
import { 
  DreamRecordTitleStyle, 
  BodyFontStyle, 
  SmallFontStyle, 
  EmotionalSubtitleStyle,
  ButtonFontStyle,
  DreamySubtitleStyle,
  FontWeights
} from '../../styles/fonts';
import Colors from '../../styles/colors';

// Icons (Using Text for now if Icons not strictly verified, but assuming Ionicons available)
// import Ionicons from 'react-native-vector-icons/Ionicons'; 

const FILTERS = [
  { id: 'all', label: '전체' },
  { id: 'lucid', label: '자각몽' },
  { id: 'nightmare', label: '악몽' },
  { id: 'recurring', label: '반복되는 꿈' },
];

const DreamHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 10;

  // Animation values
  const fadeAnims = useRef<Animated.Value[]>([]).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  if (fadeAnims.length < dreams.length) {
    for (let i = fadeAnims.length; i < dreams.length; i++) {
      fadeAnims[i] = new Animated.Value(0);
    }
  }

  useEffect(() => {
    if (dreams.length > 0) {
      const animations = dreams.map((_: Dream, i: number) => 
        Animated.timing(fadeAnims[i], {
          toValue: 1,
          duration: 400,
          delay: (i % 10) * 100,
          useNativeDriver: true,
        })
      );
      
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
        ...animations
      ]).start();
    }
  }, [dreams]);

  useEffect(() => {
    soundService.play('notification');
    fetchDreams(0, true);
  }, [selectedFilter]);

  // Debounce search could be added here
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDreams(0, true);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchDreams = async (pageNum: number, shouldReset: boolean = false) => {
    try {
      if (shouldReset) setIsLoading(true);
      
      let fetchedDreams: any; // Type workaround for List vs Search response

      if (searchQuery.trim().length > 0) {
        // Search functionality
        const response = await dreamService.searchDreams(searchQuery, pageNum * LIMIT, LIMIT);
        fetchedDreams = response.dreams || response; // Adjust based on API structure
      } else {
        // Regular fetch with filters
        const params: any = {
          skip: pageNum * LIMIT,
          limit: LIMIT,
        };
        
        if (selectedFilter === 'lucid') params.dream_type = 'LUCID'; // Check backend enum
        // Add other filter logic based on backend capabilities
        
        const response = await dreamService.getDreams(params);
        fetchedDreams = response.dreams || response; // Adjust based on API structure
      }

      // Backend returns list or object with 'dreams' array? 
      // types/dream.ts DreamListResponse has 'dreams' array and 'total_count'?
      // Assuming response has .dreams for now based on typical service pattern
      const newDreams = Array.isArray(fetchedDreams) ? fetchedDreams : fetchedDreams.dreams || [];

      if (shouldReset) {
        setDreams(newDreams);
      } else {
        setDreams((prev: Dream[]) => [...prev, ...newDreams]);
      }

      setHasMore(newDreams.length === LIMIT);
      setPage(pageNum);

    } catch (error) {
      console.error('Failed to fetch dreams:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDreams(0, true);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchDreams(page + 1, false);
    }
  };

  const renderDreamItem = (item: Dream, index: number) => {
    const fadeAnim = fadeAnims[index] || new Animated.Value(0);

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            hapticService.trigger('light');
            (navigation as any).navigate('DreamAnalysis', { dreamId: item.id });
          }}
          style={styles.cardWrapper}
        >
          <GlassView style={[styles.cardContent, { minHeight: item.body_text && item.body_text.length > 50 ? 200 : 160 }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.dateText}>
                {new Date(item.created_at).toLocaleDateString('ko-KR', { 
                  month: 'numeric', 
                  day: 'numeric'
                })}
              </Text>
              {item.lucidity_level && item.lucidity_level >= 4 && (
                <Text style={styles.lucidIcon}>✨</Text>
              )}
            </View>

            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.title || '무제'}
            </Text>

            <Text style={styles.cardPreview} numberOfLines={4}>
              {item.body_text}
            </Text>

            {item.emotion_tags && item.emotion_tags.length > 0 && (
              <View style={styles.tagsContainer}>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>#{item.emotion_tags[0]}</Text>
                </View>
                {item.emotion_tags.length > 1 && (
                  <Text style={styles.moreTagsText}>+{item.emotion_tags.length - 1}</Text>
                )}
              </View>
            )}
          </GlassView>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.screenTitle}>꿈 기록장</Text>
      <Text style={styles.screenSubtitle}>나의 무의식 갤러리</Text>

      {/* Search Bar (Glass Input) */}
      <View style={styles.searchContainer}>
        <GlassView style={styles.searchInputWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
             style={styles.searchInput}
             placeholder="꿈 내용이나 제목 검색..."
             placeholderTextColor="#8F8C9B"
             value={searchQuery}
             onChangeText={setSearchQuery}
          />
        </GlassView>
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          data={FILTERS}
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedFilter(item.id)}
              style={[
                styles.filterChip,
                selectedFilter === item.id && styles.activeFilterChip
              ]}
            >
              <Text style={[
                styles.filterText,
                selectedFilter === item.id && styles.activeFilterText
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingHorizontal: 4 }}
        />
      </View>
    </View>
  );

  return (
    <AnimatedBackground>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <MasonryList
          data={dreams}
          renderItem={renderDreamItem}
          keyExtractor={(item: Dream) => item.id}
          numColumns={2}
          contentPadding={12}
          ListHeaderComponent={renderHeader()}
          contentContainerStyle={styles.listContent}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          onEndReached={handleLoadMore}
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.emptyState}>
                <EmptyStateGraphic width={180} height={180} />
                <Text style={styles.emptyText}>아직 기록된 꿈이 없어요.</Text>
                <Text style={styles.emptySubText}>오늘 밤, 당신의 무의식을 기록해보세요.</Text>
                
                <TouchableOpacity 
                   style={styles.emptyActionButton}
                   onPress={() => {
                     hapticService.trigger('medium');
                     soundService.play('click');
                     (navigation as any).navigate('CreateDream');
                   }}
                >
                  <Text style={styles.emptyActionText}>첫 번째 꿈 기록하기 🌙</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
        {isLoading && dreams.length === 0 && (
          <View style={styles.initialLoading}>
             <SkeletonLoader width="100%" height={150} borderRadius={16} />
             <View style={{ height: 16 }} />
             <SkeletonLoader width="100%" height={150} borderRadius={16} />
             <View style={{ height: 16 }} />
             <SkeletonLoader width="100%" height={150} borderRadius={16} />
          </View>
        )}
      </View>
    </AnimatedBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  screenTitle: {
    ...DreamRecordTitleStyle,
    fontSize: 28,
    color: Colors.primary,
    marginBottom: 4,
  },
  screenSubtitle: {
    ...EmotionalSubtitleStyle,
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    ...BodyFontStyle,
    color: Colors.textPrimary,
    height: 48,
  },
  filterContainer: {
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeFilterChip: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  filterText: {
    ...SmallFontStyle,
    color: Colors.textSecondary,
    fontSize: 13,
  },
  activeFilterText: {
    color: Colors.background,
    fontWeight: '700',
  },
  cardWrapper: {
    marginBottom: 0,
  },
  cardContent: {
    padding: 16,
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    ...SmallFontStyle,
    color: Colors.textSecondary,
  },
  lucidIcon: {
      fontSize: 12,
  },
  cardTitle: {
    ...DreamRecordTitleStyle,
    fontSize: 18,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  cardPreview: {
    ...SmallFontStyle,
    color: 'rgba(234, 232, 240, 0.8)',
    lineHeight: 18,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(167, 139, 250, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 10,
    color: Colors.primary,
  },
  moreTagsText: {
      ...SmallFontStyle,
      color: Colors.textSecondary,
      fontSize: 10,
      marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    ...DreamySubtitleStyle,
    color: Colors.textPrimary,
    fontSize: 18,
    marginTop: 16,
  },
  emptySubText: {
    ...BodyFontStyle,
    color: Colors.textSecondary,
    marginTop: 8,
    marginBottom: 32,
    textAlign: 'center',
  },
  emptyActionButton: {
    backgroundColor: 'rgba(255, 221, 168, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  emptyActionText: {
    ...ButtonFontStyle,
    color: Colors.primary,
    fontSize: 14,
  },
  initialLoading: {
    position: 'absolute',
    top: 200,
    left: 20,
    right: 20,
  }
});

export default DreamHistoryScreen;
