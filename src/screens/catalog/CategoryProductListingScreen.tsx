import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { NavHeader, ProductListRow } from '../../components';
import { Icon } from '../../icons/Icon';
import { applyCatalogFilters, useProductCatalog } from '../../context/ProductCatalogContext';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'CategoryProductListing'>;

export function CategoryProductListingScreen({ navigation, route }: Props) {
  const { categoryId } = route.params;
  const { products, categories, catalogFilters } = useProductCatalog();
  const category = categories.find(item => item.id === categoryId);
  const [subcategoryId, setSubcategoryId] = useState<string | null>(null);

  const categoryProducts = useMemo(
    () =>
      applyCatalogFilters(products, { ...catalogFilters, categoryIds: [] }).filter(
        product => product.categoryId === categoryId && (!subcategoryId || product.subcategoryId === subcategoryId),
      ),
    [products, catalogFilters, categoryId, subcategoryId],
  );
  const subcategories = category?.subcategories ?? [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <NavHeader title={category?.name ?? 'Category'} onBack={() => navigation.goBack()} />

      <View style={styles.breadcrumbRow}>
        <View style={styles.breadcrumbTextRow}>
          <Text style={styles.breadcrumbText}>{category?.name ?? 'Category'}</Text>
          {subcategoryId ? (
            <>
              <Icon name="chevron-right" size={12} color={colors.textTertiary} />
              <Text style={styles.breadcrumbActive}>
                {subcategories.find(item => item.id === subcategoryId)?.name ?? ''}
              </Text>
            </>
          ) : null}
        </View>
        <View style={styles.breadcrumbRight}>
          <Text style={styles.countText}>{categoryProducts.length} products</Text>
          <Pressable style={styles.filterButton} onPress={() => navigation.navigate('ProductFilters')}>
            <Icon name="sliders" size={13} color={colors.textPrimary} />
          </Pressable>
        </View>
      </View>

      {subcategories.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.subcategoryBar}
          contentContainerStyle={styles.subcategoryRow}
        >
          {[{ id: null as string | null, name: 'All' }, ...subcategories].map(item => {
            const active = item.id === subcategoryId;
            return (
              <Pressable
                key={item.id ?? 'all'}
                onPress={() => setSubcategoryId(item.id)}
                style={[styles.subcategoryChip, active && styles.subcategoryChipActive]}
              >
                <Text style={[styles.countText, active && styles.subcategoryChipTextActive]}>{item.name}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}

      <FlatList
        data={categoryProducts}
        keyExtractor={item => item.id}
        style={styles.list}
        renderItem={({ item }) => (
          <ProductListRow
            product={item}
            onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="package" size={32} color={colors.textTertiary} />
            <Text style={styles.emptyText}>No products in this category yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  subcategoryBar: {
    flexGrow: 0,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  subcategoryRow: {
    gap: spacing.sm,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
  },
  subcategoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  subcategoryChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySurface,
  },
  subcategoryChipTextActive: {
    color: colors.primary,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  breadcrumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
  },
  breadcrumbTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  breadcrumbText: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  breadcrumbActive: {
    ...typography.tinyBold,
    color: colors.primary,
  },
  breadcrumbRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  countText: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  filterButton: {
    width: 30,
    height: 30,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
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
