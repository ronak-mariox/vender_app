import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { ProductListRow } from '../../components';
import { Icon } from '../../icons/Icon';
import { useProductCatalog, ProductStatus } from '../../context/ProductCatalogContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProductCatalog'>;

type TabKey = 'all' | 'active' | 'inactive' | 'draft' | 'pending';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'inactive', label: 'Inactive' },
  { key: 'draft', label: 'Draft' },
  { key: 'pending', label: 'Pending' },
];

function matchesTab(status: ProductStatus, tab: TabKey) {
  if (tab === 'all') return true;
  if (tab === 'active') return status === 'active' || status === 'low-stock';
  return status === tab;
}

export function ProductCatalogScreen({ navigation }: Props) {
  const { products } = useProductCatalog();
  const [tab, setTab] = useState<TabKey>('all');

  const counts = useMemo(() => {
    const result: Record<TabKey, number> = { all: 0, active: 0, inactive: 0, draft: 0, pending: 0 };
    products.forEach(product => {
      TABS.forEach(({ key }) => {
        if (matchesTab(product.status, key)) result[key] += 1;
      });
    });
    return result;
  }, [products]);

  const filtered = useMemo(
    () => products.filter(product => matchesTab(product.status, tab)),
    [products, tab],
  );

  const activeCount = products.filter(p => p.status === 'active' || p.status === 'low-stock').length;

  function handleMorePress(id: string, name: string, status: ProductStatus) {
    const isActive = status === 'active' || status === 'low-stock';
    Alert.alert(name, 'Choose an action', [
      {
        text: isActive ? 'Deactivate' : 'Activate',
        onPress: () =>
          navigation.navigate(isActive ? 'DeactivateProduct' : 'ActivateProduct', { productId: id }),
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => navigation.navigate('DeleteProduct', { productId: id }),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerTextColumn}>
            <Text style={styles.headerTitle}>My Products</Text>
            <Text style={styles.headerSubtitle}>
              {products.length} products · {activeCount} active
            </Text>
          </View>
          <Pressable style={styles.iconButton} onPress={() => navigation.navigate('CategoryBrowse')}>
            <Icon name="grid" size={16} color={colors.textPrimary} />
          </Pressable>
          <Pressable
            style={[styles.iconButton, styles.addButton]}
            onPress={() => navigation.navigate('AddProduct')}
          >
            <Icon name="plus" size={18} color={colors.white} />
          </Pressable>
        </View>

        <Pressable style={styles.searchBar} onPress={() => navigation.navigate('ProductSearch')}>
          <Icon name="search" size={15} color={colors.textTertiary} />
          <Text style={styles.searchPlaceholder}>Search products, SKU, barcode...</Text>
        </Pressable>

        <View style={styles.tabsRow}>
          {TABS.map(item => {
            const active = item.key === tab;
            return (
              <Pressable key={item.key} onPress={() => setTab(item.key)} style={styles.tab}>
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{item.label}</Text>
                <View style={[styles.tabCount, active && styles.tabCountActive]}>
                  <Text style={[styles.tabCountText, active && styles.tabCountTextActive]}>
                    {counts[item.key]}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.resultsRow}>
        <Text style={styles.resultsText}>Showing {filtered.length} products</Text>
        <Pressable style={styles.sortButton} onPress={() => navigation.navigate('ProductFilters')}>
          <Icon name="sort" size={13} color={colors.primary} />
          <Text style={styles.sortText}>Newest First</Text>
        </Pressable>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        style={styles.list}
        renderItem={({ item }) => (
          <ProductListRow
            product={item}
            onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
            onMorePress={() => handleMorePress(item.id, item.name, item.status)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="package" size={32} color={colors.textTertiary} />
            <Text style={styles.emptyText}>No products in this filter yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
  },
  headerTextColumn: {
    flex: 1,
    gap: 1,
  },
  headerTitle: {
    ...typography.h3,
    fontSize: 18,
    lineHeight: 27,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.xxl,
    marginBottom: spacing.lg,
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
  },
  searchPlaceholder: {
    ...typography.caption,
    fontSize: 13,
    color: colors.textTertiary,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  tabLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  tabLabelActive: {
    color: colors.primary,
    fontFamily: fontFamilies.bold,
  },
  tabCount: {
    backgroundColor: colors.border,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
  },
  tabCountActive: {
    backgroundColor: colors.primary,
  },
  tabCountText: {
    ...typography.tinyBold,
    fontSize: 10,
    color: colors.textSecondary,
  },
  tabCountTextActive: {
    color: colors.white,
  },
  resultsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultsText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sortText: {
    ...typography.captionSemibold,
    color: colors.primary,
  },
  list: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.massive,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
