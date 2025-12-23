import React, { useState, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDreamStore } from '../../stores/dreamStore'; // Assuming store handles global state, but manual fetch is cleaner for specific filtering
import dreamService from '../../services/dreamService';
import { Dream } from '../../types/dream';
import AnimatedBackground from '../../components/AnimatedBackground';
import GlassView from '../../components/common/GlassView';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyStateGraphic from '../../components/common/EmptyStateGraphic';
import { hapticService } from '../../services/hapticService';
import { soundService } from '../../services/soundService'; // Imported
import { 
  DreamRecordTitleStyle, 
  BodyFontStyle, 
  SmallFontStyle, 
  EmotionalSubtitleStyle,
  ButtonFontStyle,
  DreamySubtitleStyle 
} from '../../styles/fonts';

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

  useEffect(() => {
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
        setDreams(prev => [...prev, ...newDreams]);
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

  const renderDreamItem = ({ item }: { item: Dream }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => (navigation as any).navigate('DreamAnalysis', { dreamId: item.id })}
      style={styles.cardWrapper}
    >
      <GlassView style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.dateText}>
            {new Date(item.created_at).toLocaleDateString('ko-KR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric', 
              weekday: 'short'
            })}
          </Text>
          {item.lucidity_level && item.lucidity_level >= 4 && (
            <View style={styles.lucidBadge}>
              <Text style={styles.lucidText}>✨ 자각몽</Text>
            </View>
          )}
        </View>

        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.title || '제목 없는 꿈'}
        </Text>

        <Text style={styles.cardPreview} numberOfLines={3}>
          {item.body_text}
        </Text>

        <View style={styles.tagsContainer}>
          {item.emotion_tags?.slice(0, 3).map((tag, idx) => (
            <View key={idx} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      </GlassView>
    </TouchableOpacity>
  );

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
        <FlatList
          data={dreams}
          renderItem={renderDreamItem}
          keyExtractor={item => item.id}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#FFDDA8" />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
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
          ListFooterComponent={
            isLoading && !isRefreshing && dreams.length > 0 ? (
              <ActivityIndicator color="#FFDDA8" style={{ marginVertical: 20 }} />
            ) : null
          }
        />
        {isLoading && dreams.length === 0 && (
          <View style={styles.initialLoading}>
             <SkeletonLoader style={{ width: '100%', height: 150, borderRadius: 16 }} />
             <View style={{ height: 16 }} />
             <SkeletonLoader style={{ width: '100%', height: 150, borderRadius: 16 }} />
             <View style={{ height: 16 }} />
             <SkeletonLoader style={{ width: '100%', height: 150, borderRadius: 16 }} />
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
    color: '#FFDDA8',
    marginBottom: 4,
  },
  screenSubtitle: {
    ...EmotionalSubtitleStyle,
    color: '#EAE8F0',
    marginBottom: 20,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4, // TextInput has own padding
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    ...BodyFontStyle,
    color: '#EAE8F0',
    height: 48,
  },
  filterContainer: {
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeFilterChip: {
    backgroundColor: '#FFDDA8',
    borderColor: '#FFDDA8',
  },
  filterText: {
    ...SmallFontStyle,
    color: '#EAE8F0',
  },
  activeFilterText: {
    color: '#191D2E',
    fontWeight: 'bold',
  },
  cardWrapper: {
    marginBottom: 16,
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    ...SmallFontStyle,
    color: '#8F8C9B',
  },
  lucidBadge: {
    backgroundColor: 'rgba(255, 221, 168, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lucidText: {
    fontSize: 10,
    color: '#FFDDA8',
    fontWeight: 'bold',
  },
  cardTitle: {
    ...DreamRecordTitleStyle,
    fontSize: 18,
    color: '#EAE8F0',
    marginBottom: 8,
  },
  cardPreview: {
    ...BodyFontStyle,
    color: '#D0CDE1',
    lineHeight: 22,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#4A4063',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    color: '#FFDDA8',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyIcon: {
    // Removed
  },
  emptyText: {
    ...DreamySubtitleStyle,
    color: '#EAE8F0',
    fontSize: 18,
    marginTop: 16,
  },
  emptySubText: {
    ...BodyFontStyle,
    color: '#8F8C9B',
    marginTop: 8,
    marginBottom: 32,
    textAlign: 'center',
  },
  emptyActionButton: {
    backgroundColor: 'rgba(255, 221, 168, 0.2)', // Gold with opacity
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#FFDDA8',
  },
  emptyActionText: {
    ...ButtonFontStyle,
    color: '#FFDDA8',
    fontSize: 14,
  },
  initialLoading: {
    position: 'absolute',
    top: 200, // Below header approx
    left: 20,
    right: 20,
  }
});

export default DreamHistoryScreen;
