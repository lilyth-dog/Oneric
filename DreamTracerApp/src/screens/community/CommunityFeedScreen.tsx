/**
 * 커뮤니티 피드 화면
 * 다른 사용자의 꿈을 탐색하고 영감을 얻는 공간
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  FlatList,
  ListRenderItem,
} from 'react-native';
import { useNavigationStore } from '../../stores/navigationStore';
import { 
  EmotionalTitleStyle, 
  EmotionalSubtitleStyle, 
  BodyFontStyle, 
  SmallFontStyle 
} from '../../styles/fonts';
import Colors from '../../styles/colors';
import GlassView from '../../components/common/GlassView';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import { hapticService } from '../../services/hapticService';

import communityService, { FeedItem } from '../../services/communityService';

const PAGE_SIZE = 20;

const CommunityFeedScreen: React.FC = () => {
  const { goBack } = useNavigationStore();
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadFeed = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (page === 0) {
        setLoading(true);
      }

      const currentPage = isRefresh ? 0 : page;
      const posts = await communityService.getPosts(currentPage * PAGE_SIZE, PAGE_SIZE);

      if (isRefresh) {
        setFeedItems(posts);
        setPage(1);
        setHasMore(posts.length === PAGE_SIZE);
      } else {
        setFeedItems(prev => [...prev, ...posts]);
        if (posts.length < PAGE_SIZE) {
          setHasMore(false);
        } else {
          setPage(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Failed to load feed:', error);
      // TODO: Show error toast
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [page]);

  useEffect(() => {
    loadFeed(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = () => {
    setPage(0);
    setHasMore(true);
    loadFeed(true);
  };

  const handleLoadMore = () => {
    if (!hasMore || loadingMore || loading) return;
    setLoadingMore(true);
    loadFeed(false);
  };

  const handlePostPress = (item: FeedItem) => {
    hapticService.trigger('light');
    // Navigate to post detail if exists
  };

  const handleInteraction = (type: 'like' | 'comment' | 'share') => {
    hapticService.trigger('light');
    // Handle interaction
  };

  const renderFeedItem: ListRenderItem<FeedItem> = ({ item }) => (
    <TouchableOpacity 
      key={item.id} 
      activeOpacity={0.9}
      style={styles.cardWrapper}
      onPress={() => handlePostPress(item)}
    >
      <GlassView style={styles.feedCard}>
        <View style={styles.cardHeader}>
          <View style={styles.authorContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.author[0]}</Text>
            </View>
            <View>
              <Text style={styles.authorName}>{item.author}</Text>
              <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.moreButton}
            onPress={() => hapticService.trigger('light')}
          >
            <Text style={styles.moreButtonText}>•••</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardContent} numberOfLines={3}>{item.content}</Text>
        
        {item.imageUrl && (
          <View style={styles.imageContainer}>
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderIcon}>🌠</Text>
            </View>
          </View>
        )}

        <View style={styles.tagsContainer}>
          {item.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.cardFooter}>
          <TouchableOpacity 
            style={styles.interactionButton}
            onPress={() => handleInteraction('like')}
          >
            <Text style={styles.interactionIcon}>❤️</Text>
            <Text style={styles.interactionText}>{item.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.interactionButton}
            onPress={() => handleInteraction('comment')}
          >
            <Text style={styles.interactionIcon}>💬</Text>
            <Text style={styles.interactionText}>{item.comments}</Text>
          </TouchableOpacity>
          <View style={styles.spacer} />
          <TouchableOpacity 
            style={styles.interactionButton}
            onPress={() => handleInteraction('share')}
          >
            <Text style={styles.interactionIcon}>🔗</Text>
          </TouchableOpacity>
        </View>
      </GlassView>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.welcomeBanner}>
      <Text style={styles.welcomeTitle}>꿈속의 여행자들</Text>
      <Text style={styles.welcomeSubtitle}>다른 이들의 꿈을 탐험하고 영감을 얻으세요.</Text>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return <View style={styles.bottomSpacer} />;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backButtonText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>커뮤니티</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFDDA8" />
        </View>
      ) : (
        <FlatList
          data={feedItems}
          renderItem={renderFeedItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary}/>
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    ...EmotionalTitleStyle,
    color: Colors.primary,
    fontSize: 18,
  },
  searchButton: {
    padding: 8,
  },
  searchIcon: {
    fontSize: 20,
  },
  listContent: {
    padding: 16,
  },
  welcomeBanner: {
    padding: 24,
    backgroundColor: Colors.surface,
    marginBottom: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  welcomeTitle: {
    ...EmotionalTitleStyle,
    color: Colors.primary,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    ...BodyFontStyle,
    color: Colors.textPrimary,
  },
  loadingContainer: {
    flex: 1,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  cardWrapper: {
    marginBottom: 16,
  },
  feedCard: {
    borderRadius: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(167, 139, 250, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.3)',
  },
  avatarText: {
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: 18,
  },
  authorName: {
    ...BodyFontStyle,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  date: {
    ...SmallFontStyle,
    color: Colors.textSecondary,
  },
  moreButton: {
    padding: 4,
  },
  moreButtonText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  cardTitle: {
    ...BodyFontStyle,
    fontWeight: 'bold',
    color: Colors.primary,
    fontSize: 18,
    marginBottom: 8,
  },
  cardContent: {
    ...BodyFontStyle,
    color: Colors.textPrimary,
    lineHeight: 22,
    marginBottom: 12,
  },
  imageContainer: {
    height: 150,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  imagePlaceholderIcon: {
    fontSize: 40,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(255, 221, 168, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    ...SmallFontStyle,
    color: Colors.primary,
    fontSize: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  interactionIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  interactionText: {
    ...SmallFontStyle,
    color: Colors.textSecondary,
  },
  spacer: {
    flex: 1,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default CommunityFeedScreen;
