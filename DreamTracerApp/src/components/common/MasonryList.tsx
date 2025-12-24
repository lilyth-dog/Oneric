import React, { ReactNode } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, ViewStyle } from 'react-native';

interface MasonryListProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => ReactNode;
  numColumns?: number;
  keyExtractor: (item: T) => string;
  contentContainerStyle?: ViewStyle;
  refreshing?: boolean;
  onRefresh?: () => void;
  onEndReached?: () => void;
  ListHeaderComponent?: ReactNode;
  ListEmptyComponent?: ReactNode;
  contentPadding?: number;
}

/**
 * Pinterest-style Masonry Layout
 * Distributes items into columns. Simple implementation: [0, 2, 4...] -> Col 1, [1, 3, 5...] -> Col 2
 * Ideally, we would measure height, but steady 2-col distribution is usually enough for simple cards.
 */
function MasonryList<T>({
  data,
  renderItem,
  numColumns = 2,
  keyExtractor,
  contentContainerStyle,
  refreshing = false,
  onRefresh,
  onEndReached,
  ListHeaderComponent,
  ListEmptyComponent,
  contentPadding = 12,
}: MasonryListProps<T>) {
  
  if (!data || data.length === 0) {
      return (
          <ScrollView 
            contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
            refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> : undefined}
          >
              {ListHeaderComponent}
              {ListEmptyComponent}
          </ScrollView>
      )
  }

  // Distribute data into columns
  const columns: T[][] = Array.from({ length: numColumns }, () => []);
  data.forEach((item, index) => {
    columns[index % numColumns].push(item);
  });

  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }: any) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> : undefined}
      showsVerticalScrollIndicator={false}
      onScroll={({ nativeEvent }) => {
        if (isCloseToBottom(nativeEvent) && onEndReached) {
          onEndReached();
        }
      }}
      scrollEventThrottle={400}
    >
      {ListHeaderComponent}
      
      <View style={[styles.container, { paddingHorizontal: contentPadding }]}>
        {columns.map((col, colIndex) => (
          <View key={`col-${colIndex}`} style={[styles.column, { flex: 1 / numColumns, marginRight: colIndex === numColumns - 1 ? 0 : contentPadding }]}>
             {col.map((item) => {
                 const originalIndex = data.indexOf(item); // Simple lookup, optimization possible
                 return (
                     <View key={keyExtractor(item)} style={{ marginBottom: contentPadding }}>
                         {renderItem(item, originalIndex)}
                     </View>
                 )
             })} 
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
      flexGrow: 1,
  },
  container: {
    flexDirection: 'row',
  },
  column: {
    flexDirection: 'column',
  },
});

export default MasonryList;
