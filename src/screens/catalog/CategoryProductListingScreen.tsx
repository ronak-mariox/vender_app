import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { NavHeader, ProductListRow } from '../../components';
import { Icon } from '../../icons/Icon';
import { CATEGORIES } from '../../data/categories';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'CategoryProductListing'>;

export function CategoryProductListingScreen({ navigation, route }: Props) {
  const { categoryId } = route.params;
  const { products } = useProductCatalog();
  const category = CATEGORIES.find(item => item.id === categoryId);

  const categoryProducts = useMemo(
    () => products.filter(product => product.categoryId === categoryId),
    [products, categoryId],
  );

  const breadcrumbHead = category?.name.split(' & ')[0] ?? 'Category';
  const breadcrumbTail = category?.subcategories[0]?.name ?? category?.name ?? '';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <NavHeader title={category?.name ?? 'Category'} onBack={() => navigation.goBack()} />

      <View style={styles.breadcrumbRow}>
        <View style={styles.breadcrumbTextRow}>
          <Text style={styles.breadcrumbText}>{breadcrumbHead}</Text>
          <Icon name="chevron-right" size={12} color={colors.textTertiary} />
          <Text style={styles.breadcrumbActive}>{breadcrumbTail}</Text>
        </View>
        <View style={styles.breadcrumbRight}>
          <Text style={styles.countText}>{categoryProducts.length} products</Text>
          <Pressable style={styles.filterButton} onPress={() => navigation.navigate('ProductFilters')}>
            <Icon name="sliders" size={13} color={colors.textPrimary} />
          </Pressable>
        </View>
      </View>

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
