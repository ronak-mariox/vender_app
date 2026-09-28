import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProductSearch'>;

export function ProductSearchScreen({ navigation }: Props) {
  const { products } = useProductCatalog();
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState<string[]>([]);

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const lower = query.trim().toLowerCase();
    return products
      .filter(product =>
        [product.name, product.brand, product.sku, product.barcode ?? ''].some(field =>
          field.toLowerCase().includes(lower),
        ),
      )
      .slice(0, 20);
  }, [products, query]);

  function commitSearch(text: string) {
    if (!text.trim()) return;
    setRecent(prev => [text, ...prev.filter(item => item !== text)].slice(0, 6));
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.searchRow}>
        <View style={styles.searchField}>
          <Icon name="search" size={16} color={colors.textSecondary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search products, SKU, barcode..."
            placeholderTextColor={colors.textTertiary}
            style={styles.input}
            autoFocus
            onSubmitEditing={() => commitSearch(query)}
          />
          {query.length > 0 ? (
            <Pressable onPress={() => setQuery('')} style={styles.clearBubble} hitSlop={8}>
              <Icon name="x" size={11} color={colors.white} />
            </Pressable>
          ) : null}
        </View>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>

      {query.trim().length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suggestions for "{query}"</Text>
          {suggestions.length === 0 ? (
            <Text style={styles.emptyText}>No matching products</Text>
          ) : (
            suggestions.map(product => (
              <Pressable
                key={product.id}
                style={styles.suggestionRow}
                onPress={() => {
                  commitSearch(product.name);
                  navigation.navigate('ProductDetails', { productId: product.id });
                }}
              >
                <Icon name="search" size={14} color={colors.textSecondary} />
                <Text style={styles.suggestionText} numberOfLines={1}>
                  {product.name}
                </Text>
                <Icon name="chevron-right" size={14} color={colors.textTertiary} />
              </Pressable>
            ))
          )}
        </View>
      ) : (
        <View style={styles.section}>
          <View style={styles.recentHeaderRow}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            <Pressable onPress={() => setRecent([])} hitSlop={8}>
              <Text style={styles.clearText}>Clear</Text>
            </Pressable>
          </View>
          <FlatList
            data={recent}
            keyExtractor={item => item}
            ListEmptyComponent={<Text style={styles.emptyText}>Search by product name, brand, SKU or barcode</Text>}
            renderItem={({ item }) => (
              <View style={styles.recentRow}>
                <Icon name="clock" size={14} color={colors.textSecondary} />
                <Text style={styles.recentText} onPress={() => setQuery(item)}>
                  {item}
                </Text>
                <Pressable
                  onPress={() => setRecent(prev => prev.filter(entry => entry !== item))}
                  hitSlop={8}
                >
                  <Icon name="x" size={13} color={colors.textTertiary} />
                </Pressable>
              </View>
            )}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    height: 44,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    shadowColor: colors.primaryFocusRing,
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    padding: 0,
  },
  clearBubble: {
    width: 18,
    height: 18,
    borderRadius: 9999,
    backgroundColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    ...typography.bodySemibold,
    color: colors.primary,
  },
  section: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    flex: 1,
  },
  sectionTitle: {
    ...typography.tinyBold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.66,
  },
  recentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clearText: {
    ...typography.caption,
    fontFamily: fontFamilies.medium,
    color: colors.primary,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  suggestionText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  recentText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    paddingTop: spacing.lg,
  },
});
