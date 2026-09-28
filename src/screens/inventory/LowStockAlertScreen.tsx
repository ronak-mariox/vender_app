import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button } from '../../components';
import { Icon } from '../../icons/Icon';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { isInventoryCategory } from '../../utils/inventory';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';
import { ProductThumb } from '../../components/ProductThumb';

type Props = NativeStackScreenProps<AuthStackParamList, 'LowStockAlert'>;

export function LowStockAlertScreen({ navigation }: Props) {
  const { products } = useProductCatalog();

  const lowStockProducts = useMemo(
    () => products.filter(product => isInventoryCategory(product, 'low-stock')),
    [products],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.iconButton}>
          <Icon name="arrow-left" size={18} color={colors.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.banner}>
        <View style={styles.bannerIcon}>
          <Icon name="alert-triangle" size={22} color={colors.warning} />
        </View>
        <View style={styles.bannerTextColumn}>
          <Text style={styles.bannerTitle}>Low Stock Alert</Text>
          <Text style={styles.bannerSubtitle}>
            {lowStockProducts.length} product{lowStockProducts.length === 1 ? '' : 's'} need restocking soon
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.toggleCard}>
          <View style={styles.toggleTextColumn}>
            <Text style={styles.toggleTitle}>Low-Stock Alerts</Text>
            <Text style={styles.toggleSubtitle}>
              You get a notification when a variant's stock drops to the product's reorder level. Set the reorder level
              when editing a product.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Products Needing Restock</Text>

        {lowStockProducts.map(product => {
          const target = Math.max(product.maxStock || product.reorderLevel, product.stock, 1);
          const ratio = Math.min(1, product.stock / target);
          const critical = product.stock <= product.reorderLevel / 2;
          return (
            <View
              key={product.id}
              style={[styles.productCard, critical && styles.productCardCritical]}
            >
              <ProductThumb
                imageUrl={product.images?.[0]}
                style={styles.productIcon}
                iconSize={22}
                iconColor={colors.warning}
              />
              <View style={styles.productTextColumn}>
                <Text style={styles.productName} numberOfLines={1}>
                  {product.name}
                </Text>
                <Text style={styles.productMeta}>Reorder level: {product.reorderLevel} units</Text>
                <View style={styles.progressRow}>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${ratio * 100}%`, backgroundColor: critical ? colors.error : colors.warning },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {product.stock} / {target}
                  </Text>
                </View>
              </View>
              <Pressable
                style={styles.restockButton}
                onPress={() => navigation.navigate('UpdateQuantity', { productId: product.id })}
              >
                <Text style={styles.restockButtonText}>Restock</Text>
              </Pressable>
            </View>
          );
        })}

        {lowStockProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="check-circle" size={32} color={colors.primary} />
            <Text style={styles.emptyText}>No products need restocking right now</Text>
          </View>
        ) : null}
      </ScrollView>

      {lowStockProducts.length > 0 ? (
        <View style={styles.footer}>
          <Button
            label={`Bulk Restock (${lowStockProducts.length} product${lowStockProducts.length === 1 ? '' : 's'})`}
            onPress={() =>
              navigation.navigate('BulkUpdate', { productIds: lowStockProducts.map(item => item.id) })
            }
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
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
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: '#FFF7ED',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xl,
  },
  bannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 9999,
    backgroundColor: colors.warningSurface,
    borderWidth: 2,
    borderColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTextColumn: {
    flex: 1,
    gap: 2,
  },
  bannerTitle: {
    ...typography.h3,
    fontSize: 16,
    color: '#A16207',
  },
  bannerSubtitle: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: '#A16207',
  },
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.warningSurface,
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: radii.xl,
    padding: spacing.xl,
  },
  toggleTextColumn: {
    flex: 1,
    gap: 2,
  },
  toggleTitle: {
    ...typography.bodySemibold,
    color: '#A16207',
  },
  toggleSubtitle: {
    ...typography.tiny,
    color: '#A16207',
    opacity: 0.8,
  },
  sectionTitle: {
    ...typography.tinyBold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.66,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.xl,
  },
  productCardCritical: {
    borderColor: '#FDE68A',
  },
  productIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.warningSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productTextColumn: {
    flex: 1,
    gap: 1,
  },
  productName: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  productMeta: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  progressTrack: {
    flex: 1,
    height: 5,
    borderRadius: radii.full,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: 5,
    borderRadius: radii.full,
  },
  progressText: {
    ...typography.tinyBold,
    color: colors.warning,
  },
  restockButton: {
    backgroundColor: colors.warning,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  restockButtonText: {
    ...typography.tinyBold,
    color: colors.white,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.huge,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
