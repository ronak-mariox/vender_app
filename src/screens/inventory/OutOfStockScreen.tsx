import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { InventoryRow } from '../../components';
import { Icon } from '../../icons/Icon';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { isInventoryCategory } from '../../utils/inventory';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'OutOfStock'>;

export function OutOfStockScreen({ navigation }: Props) {
  const { products } = useProductCatalog();
  const outOfStockProducts = useMemo(
    () => products.filter(product => isInventoryCategory(product, 'out-of-stock')),
    [products],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.iconButton}>
          <Icon name="arrow-left" size={18} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerTextColumn}>
          <Text style={styles.headerTitle}>Out of Stock</Text>
          <Text style={styles.headerSubtitle}>{outOfStockProducts.length} products unavailable to customers</Text>
        </View>
      </View>

      <View style={styles.errorBanner}>
        <Icon name="alert-circle" size={15} color={colors.error} />
        <Text style={styles.errorText}>These products are hidden from customers. Add stock to start receiving orders.</Text>
      </View>

      <FlatList
        data={outOfStockProducts}
        keyExtractor={item => item.id}
        style={styles.list}
        renderItem={({ item }) => (
          <InventoryRow
            name={item.name}
            sku={item.sku}
            onPress={() => navigation.navigate('ProductStockDetails', { productId: item.id })}
            subtitle={
              <View style={styles.statusRow}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Out of Stock · Hidden</Text>
              </View>
            }
            right={
              <Pressable
                style={styles.addStockButton}
                onPress={() => navigation.navigate('UpdateQuantity', { productId: item.id })}
              >
                <Text style={styles.addStockButtonText}>Add Stock</Text>
              </Pressable>
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="check-circle" size={32} color={colors.primary} />
            <Text style={styles.emptyText}>Nothing is out of stock</Text>
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
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.errorSurface,
    borderBottomWidth: 1,
    borderBottomColor: colors.errorBorder,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
  },
  errorText: {
    ...typography.caption,
    color: '#B91C1C',
    flex: 1,
  },
  list: {
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 9999,
    backgroundColor: colors.error,
  },
  statusText: {
    ...typography.tinyBold,
    color: colors.error,
  },
  addStockButton: {
    backgroundColor: colors.error,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  addStockButtonText: {
    ...typography.tinyBold,
    color: colors.white,
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
