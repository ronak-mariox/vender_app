import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon, IconName } from '../../icons/Icon';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { useInventory } from '../../context/InventoryContext';
import { inventoryCategory } from '../../utils/inventory';
import { formatCurrencyCompact } from '../../utils/format';
import { formatTimeAgo } from '../../utils/time';
import { getApiErrorMessage } from '../../services/api';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'InventoryOverview'>;

export function InventoryOverviewScreen({ navigation }: Props) {
  const { products, refreshProducts, loading, error } = useProductCatalog();
  const { events, refreshEvents } = useInventory();
  const [refreshing, setRefreshing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await Promise.all([refreshProducts(), refreshEvents()]);
      setLastSyncedAt(Date.now());
    } catch (err) {
      Alert.alert('Could not refresh inventory', getApiErrorMessage(err));
    } finally {
      setRefreshing(false);
    }
  }

  const counts = useMemo(() => {
    const result = { 'in-stock': 0, 'low-stock': 0, 'out-of-stock': 0, unavailable: 0 };
    products.forEach(product => {
      result[inventoryCategory(product.status)] += 1;
    });
    return result;
  }, [products]);

  const totalStockValue = useMemo(
    () =>
      products.reduce(
        (sum, product) =>
          sum +
          (product.variants ?? []).reduce((variantSum, variant) => variantSum + variant.sellingPrice * variant.stock, 0),
        0,
      ),
    [products],
  );

  const recentEvents = useMemo(() => events.slice(0, 3), [events]);

  const statCards: { key: string; icon: IconName; iconBg: string; value: string; label: string; meta: string; onPress: () => void }[] = [
    {
      key: 'total',
      icon: 'package',
      iconBg: colors.primarySurface,
      value: String(products.length),
      label: 'Total Products',
      meta: 'across all categories',
      onPress: () => navigation.navigate('ProductCatalog'),
    },
    {
      key: 'in-stock',
      icon: 'check-circle',
      iconBg: colors.primarySurface,
      value: String(counts['in-stock']),
      label: 'In Stock',
      meta: 'products available',
      onPress: () => navigation.navigate('InStock'),
    },
    {
      key: 'low-stock',
      icon: 'alert-triangle',
      iconBg: colors.warningSurface,
      value: String(counts['low-stock']),
      label: 'Low Stock',
      meta: 'need restocking soon',
      onPress: () => navigation.navigate('LowStock'),
    },
    {
      key: 'out-of-stock',
      icon: 'alert-circle',
      iconBg: colors.errorSurface,
      value: String(counts['out-of-stock']),
      label: 'Out of Stock',
      meta: "can't be ordered",
      onPress: () => navigation.navigate('OutOfStock'),
    },
    {
      key: 'unavailable',
      icon: 'package',
      iconBg: colors.surface,
      value: String(counts.unavailable),
      label: 'Unavailable',
      meta: 'inactive / hidden',
      onPress: () => navigation.navigate('Unavailable'),
    },
    {
      key: 'value',
      icon: 'trending-up',
      iconBg: '#EFF8FF',
      value: formatCurrencyCompact(totalStockValue),
      label: 'Total Stock Value',
      meta: 'estimated at selling price',
      onPress: () => Alert.alert('Total Stock Value', `${formatCurrencyCompact(totalStockValue)} across ${products.length} products.`),
    },
  ];

  const quickFilters: { key: string; label: string; dotColor: string; count: number; onPress: () => void }[] = [
    { key: 'in-stock', label: 'In Stock', dotColor: colors.primary, count: counts['in-stock'], onPress: () => navigation.navigate('InStock') },
    { key: 'low-stock-alert', label: 'Low Stock Alert', dotColor: colors.warning, count: counts['low-stock'], onPress: () => navigation.navigate('LowStockAlert') },
    { key: 'out-of-stock', label: 'Out of Stock', dotColor: colors.error, count: counts['out-of-stock'], onPress: () => navigation.navigate('OutOfStock') },
    { key: 'unavailable', label: 'Inactive / Hidden', dotColor: colors.textSecondary, count: counts.unavailable, onPress: () => navigation.navigate('Unavailable') },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.headerTextColumn}>
          <Text style={styles.headerTitle}>Inventory</Text>
          <Text style={styles.headerSubtitle}>
            {error
              ? 'Could not load latest stock'
              : lastSyncedAt
              ? `Last synced: ${formatTimeAgo(lastSyncedAt)}`
              : `${products.length} products`}
          </Text>
        </View>
        <Pressable style={styles.iconButton} onPress={handleRefresh} disabled={refreshing}>
          {refreshing ? (
            <ActivityIndicator size="small" color={colors.textPrimary} />
          ) : (
            <Icon name="refresh-cw" size={15} color={colors.textPrimary} />
          )}
        </Pressable>
        <Pressable
          style={[styles.iconButton, styles.addButton]}
          onPress={() => navigation.navigate('StockAdjustment', {})}
        >
          <Icon name="plus" size={18} color={colors.white} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing || (loading && products.length === 0)} onRefresh={handleRefresh} />}
      >
        <View style={styles.grid}>
          {statCards.map(card => (
            <Pressable key={card.key} style={styles.statCard} onPress={card.onPress}>
              <View style={[styles.statIcon, { backgroundColor: card.iconBg }]}>
                <Icon name={card.icon} size={20} color={colors.textPrimary} />
              </View>
              <Text style={styles.statValue}>{card.value}</Text>
              <Text style={styles.statLabel}>{card.label}</Text>
              <Text style={styles.statMeta}>{card.meta}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderTitle}>Quick Filters</Text>
          </View>
          {quickFilters.map((filter, index) => (
            <Pressable
              key={filter.key}
              style={[styles.filterRow, index < quickFilters.length - 1 && styles.filterRowDivider]}
              onPress={filter.onPress}
            >
              <View style={[styles.filterDot, { backgroundColor: filter.dotColor }]} />
              <Text style={styles.filterLabel}>{filter.label}</Text>
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{filter.count}</Text>
              </View>
              <Icon name="chevron-right" size={14} color={colors.textTertiary} />
            </Pressable>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderTitle}>Recent Updates</Text>
            <Pressable onPress={() => navigation.navigate('InventoryHistory', {})}>
              <Text style={styles.viewAllText}>View All</Text>
            </Pressable>
          </View>
          {recentEvents.length === 0 ? (
            <Text style={styles.emptyText}>No stock updates yet</Text>
          ) : (
            recentEvents.map((event, index) => {
              const isOos = event.afterStock === 0 && event.delta < 0;
              const positive = event.delta > 0;
              return (
                <View
                  key={event.id}
                  style={[styles.updateRow, index < recentEvents.length - 1 && styles.filterRowDivider]}
                >
                  <View
                    style={[
                      styles.updateIcon,
                      { backgroundColor: isOos ? colors.errorSurface : positive ? colors.primarySurface : colors.warningSurface },
                    ]}
                  >
                    <Icon
                      name={isOos ? 'alert-circle' : positive ? 'trending-up' : 'package'}
                      size={14}
                      color={isOos ? colors.error : positive ? colors.primary : colors.warning}
                    />
                  </View>
                  <View style={styles.updateTextColumn}>
                    <Text style={styles.updateName} numberOfLines={1}>
                      {event.productName}
                    </Text>
                    <Text style={styles.updateTime}>{formatTimeAgo(event.timestamp)}</Text>
                  </View>
                  <Text
                    style={[
                      styles.updateDelta,
                      { color: isOos ? colors.error : positive ? colors.primary : colors.warning },
                    ]}
                  >
                    {isOos ? 'OOS' : `${positive ? '+' : ''}${event.delta}`}
                  </Text>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  statCard: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: 2,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: 22,
    fontFamily: fontFamilies.extrabold,
    letterSpacing: -0.66,
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.captionSemibold,
    color: colors.textPrimary,
  },
  statMeta: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cardHeaderTitle: {
    ...typography.captionBold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.72,
  },
  viewAllText: {
    ...typography.caption,
    fontFamily: fontFamilies.medium,
    color: colors.primary,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  filterRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterDot: {
    width: 10,
    height: 10,
    borderRadius: 9999,
  },
  filterLabel: {
    ...typography.label,
    fontFamily: fontFamilies.medium,
    color: colors.textPrimary,
    flex: 1,
  },
  filterBadge: {
    backgroundColor: colors.surface,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 2,
  },
  filterBadgeText: {
    ...typography.tinyBold,
    color: colors.textSecondary,
  },
  updateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  updateIcon: {
    width: 32,
    height: 32,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateTextColumn: {
    flex: 1,
    gap: 1,
  },
  updateName: {
    ...typography.caption,
    fontFamily: fontFamilies.medium,
    color: colors.textPrimary,
  },
  updateTime: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  updateDelta: {
    ...typography.labelSemibold,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    padding: spacing.xl,
  },
});
