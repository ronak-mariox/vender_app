import React, { useMemo } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { colors, radii, spacing, typography } from '../../theme';
import { PricingBackHeader } from './PricingBackHeader';
import { useInventoryRefresh } from '../inventory/useInventoryRefresh';
import { ProductThumb } from '../../components/ProductThumb';

type Props = NativeStackScreenProps<AuthStackParamList, 'CategoryPricingList'>;

export function CategoryPricingListScreen({ navigation, route }: Props) {
  const { categoryId, categoryName } = route.params;
  const { products } = useProductCatalog();
  const { refreshing, onRefresh } = useInventoryRefresh();

  const list = useMemo(
    () => (categoryId ? products.filter(product => product.categoryId === categoryId) : products),
    [products, categoryId],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <PricingBackHeader title={categoryName ?? 'All Products'} onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {list.length === 0 ? <Text style={styles.meta}>No products here yet.</Text> : null}
        {list.map(product => {
          const discount =
            product.mrp > 0 && product.mrp > product.sellingPrice
              ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
              : 0;
          const variantCount = product.variants?.length ?? 0;
          return (
            <Pressable
              key={product.id}
              style={styles.row}
              onPress={() => navigation.navigate('ProductPricingDetail', { productId: product.id })}
            >
              <ProductThumb
                imageUrl={product.images?.[0]}
                style={styles.thumb}
                iconSize={18}
                iconColor={colors.textTertiary}
              />
              <View style={styles.textColumn}>
                <Text style={styles.name} numberOfLines={1}>
                  {product.name}
                </Text>
                <Text style={styles.meta}>
                  MRP ₹{product.mrp} · SP ₹{product.sellingPrice}
                  {variantCount > 1 ? ` · ${variantCount} variants` : ''}
                </Text>
              </View>
              <View style={styles.rightColumn}>
                <Text style={styles.discount}>{discount}% off</Text>
                <Icon name="chevron-right" size={15} color={colors.textTertiary} />
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    padding: spacing.xl,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.lg,
  },
  thumb: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textColumn: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  rightColumn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  discount: {
    ...typography.tinyBold,
    color: colors.primary,
  },
});
