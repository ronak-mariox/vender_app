import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, InventoryRow } from '../../components';
import { Icon } from '../../icons/Icon';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { isInventoryCategory } from '../../utils/inventory';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'LowStock'>;

export function LowStockScreen({ navigation }: Props) {
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
        <View style={styles.headerTextColumn}>
          <Text style={styles.headerTitle}>Low Stock</Text>
          <Text style={styles.headerSubtitle}>{lowStockProducts.length} products need restocking</Text>
        </View>
      </View>

      <View style={styles.warningBanner}>
        <Icon name="alert-triangle" size={15} color={colors.warningDark} />
        <Text style={styles.warningText}>
          These products are running low and may go out of stock soon. Restock to avoid losing sales.
        </Text>
      </View>

      <FlatList
        data={lowStockProducts}
        keyExtractor={item => item.id}
        style={styles.list}
        renderItem={({ item }) => {
          const target = Math.max(item.reorderLevel, item.stock, 1);
          const ratio = Math.min(1, item.stock / target);
          return (
            <InventoryRow
              name={item.name}
              sku={item.sku}
              muted={false}
              onPress={() => navigation.navigate('ProductStockDetails', { productId: item.id })}
              subtitle={
                <View style={styles.progressRow}>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${ratio * 100}%` }]} />
                  </View>
                  <Text style={styles.progressText}>
                    {item.stock}/{item.reorderLevel} units
                  </Text>
                </View>
              }
              right={
                <Pressable
                  style={styles.restockButton}
                  onPress={() => navigation.navigate('UpdateQuantity', { productId: item.id })}
                >
                  <Text style={styles.restockButtonText}>Restock</Text>
                </Pressable>
              }
            />
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="check-circle" size={32} color={colors.primary} />
            <Text style={styles.emptyText}>No products are running low</Text>
          </View>
        }
      />

      {lowStockProducts.length > 0 ? (
        <View style={styles.footer}>
          <Button
            label="Bulk Restock All"
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
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.warningSurface,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
  },
  warningText: {
    ...typography.caption,
    color: '#A16207',
    flex: 1,
  },
  list: {
    flex: 1,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.xs,
    width: 220,
  },
  progressTrack: {
    flex: 1,
    maxWidth: 100,
    height: 4,
    borderRadius: radii.full,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: radii.full,
    backgroundColor: colors.warning,
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
    paddingVertical: spacing.massive,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
