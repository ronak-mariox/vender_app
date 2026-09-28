import React, { useMemo } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { InventoryRow } from '../../components';
import { Icon } from '../../icons/Icon';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { useInventory } from '../../context/InventoryContext';
import { useInventoryRefresh } from './useInventoryRefresh';
import { isInventoryCategory } from '../../utils/inventory';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'InStock'>;

export function InStockScreen({ navigation }: Props) {
  const { products } = useProductCatalog();
  const { refreshing, onRefresh } = useInventoryRefresh();
  const { categoryFilter } = useInventory();
  const inStockProducts = useMemo(
    () =>
      products.filter(
        product =>
          isInventoryCategory(product, 'in-stock') &&
          (categoryFilter.length === 0 || categoryFilter.includes(product.categoryId)),
      ),
    [products, categoryFilter],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.iconButton}>
          <Icon name="arrow-left" size={18} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerTextColumn}>
          <Text style={styles.headerTitle}>In Stock</Text>
          <Text style={styles.headerSubtitle}>
            {inStockProducts.length} products with healthy stock
            {categoryFilter.length > 0 ? ' · filtered' : ''}
          </Text>
        </View>
        <Pressable
          style={styles.iconButton}
          onPress={() => navigation.navigate('InventoryFilter')}
        >
          <Icon name="sliders" size={15} color={colors.textPrimary} />
        </Pressable>
      </View>

      <Pressable style={styles.searchWrapper} onPress={() => navigation.navigate('InventorySearch')}>
        <View style={styles.searchBar}>
          <Icon name="search" size={15} color={colors.textTertiary} />
          <Text style={styles.searchPlaceholder}>Search in-stock products...</Text>
        </View>
      </Pressable>

      <FlatList
        data={inStockProducts}
        keyExtractor={item => item.id}
        style={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <InventoryRow
            name={item.name}
            imageUrl={item.images?.[0]}
            sku={item.sku}
            onPress={() => navigation.navigate('ProductStockDetails', { productId: item.id })}
            right={
              <View style={styles.rightRow}>
                <View style={styles.stockBadge}>
                  <Text style={styles.stockBadgeText}>{item.stock} units</Text>
                </View>
                <Pressable
                  style={styles.updateButton}
                  onPress={() => navigation.navigate('UpdateQuantity', { productId: item.id })}
                >
                  <Text style={styles.updateButtonText}>Update</Text>
                </Pressable>
              </View>
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="package" size={32} color={colors.textTertiary} />
            <Text style={styles.emptyText}>No products with healthy stock yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextColumn: {
    flex: 1,
    gap: 1,
  },
  headerTitle: {
    ...typography.h3,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  searchWrapper: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
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
  list: {
    flex: 1,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stockBadge: {
    backgroundColor: colors.primarySurface,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  stockBadgeText: {
    ...typography.captionBold,
    color: colors.primary,
  },
  updateButton: {
    backgroundColor: colors.primarySurface,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  updateButtonText: {
    ...typography.tinyBold,
    color: colors.primary,
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
