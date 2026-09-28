import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { NavHeader, ScreenContainer } from '../../components';
import { useAnalytics } from '../../context/AnalyticsContext';
import { useInventory } from '../../context/InventoryContext';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { colors, radii, spacing, typography } from '../../theme';
import { AnalyticsFilterBar } from './AnalyticsFilterBar';
import { formatINR } from './analyticsHelpers';

type Props = NativeStackScreenProps<AuthStackParamList, 'InventoryPerformance'>;

const DAY_MS = 24 * 60 * 60 * 1000;
const BAR_MAX_HEIGHT = 72;
const SELLABLE_STATUSES = new Set(['active', 'low-stock', 'out-of-stock']);

function healthColor(percent: number): string {
  if (percent >= 70) return colors.primary;
  if (percent >= 40) return '#F59E0B';
  return colors.error;
}

export function InventoryPerformanceScreen({ navigation }: Props) {
  const { inventoryPerformance, periodLabel } = useAnalytics();
  const { products } = useProductCatalog();
  const { eventsForProduct } = useInventory();

  const inStockCount = useMemo(() => products.filter(p => p.status === 'active').length, [products]);
  const lowStockCount = useMemo(() => products.filter(p => p.status === 'low-stock').length, [products]);
  const outOfStockCount = useMemo(
    () => products.filter(p => p.status === 'out-of-stock').length,
    [products],
  );

  const categoryHealth = useMemo(() => {
    const map = new Map<string, { name: string; total: number; healthy: number }>();
    products.forEach(product => {
      if (!SELLABLE_STATUSES.has(product.status)) return;
      const entry = map.get(product.categoryId) ?? { name: product.categoryName, total: 0, healthy: 0 };
      entry.total += 1;
      if (product.status === 'active') entry.healthy += 1;
      map.set(product.categoryId, entry);
    });
    return Array.from(map.values()).map(entry => ({
      name: entry.name,
      percent: entry.total > 0 ? Math.round((entry.healthy / entry.total) * 100) : 0,
    }));
  }, [products]);

  const frequentlyOutOfStock = useMemo(() => {
    const now = Date.now();
    return products
      .filter(product => product.status === 'out-of-stock')
      .map(product => {
        const events = eventsForProduct(product.id);
        const zeroEvent = events.find(event => event.afterStock === 0);
        const since = zeroEvent?.timestamp ?? product.updatedAt ?? now;
        const daysOut = Math.max(0, Math.floor((now - since) / DAY_MS));
        return { id: product.id, name: product.name, daysOut };
      })
      .sort((a, b) => b.daysOut - a.daysOut)
      .slice(0, 5);
  }, [products, eventsForProduct]);

  const stockoutTone =
    inventoryPerformance.stockoutIncidents >= 5
      ? 'High'
      : inventoryPerformance.stockoutIncidents >= 2
        ? 'Moderate'
        : 'Low';

  return (
    <ScreenContainer scrollable={false} backgroundColor={colors.white}>
      <NavHeader title="Inventory Performance" onBack={() => navigation.goBack()} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.filterWrap}>
          <AnalyticsFilterBar />
        </View>

        <View style={styles.pillsRow}>
          <View style={[styles.pillCard, { backgroundColor: colors.primarySurface }]}>
            <Text style={[styles.pillValue, { color: colors.primary }]}>{inStockCount}</Text>
            <Text style={[styles.pillLabel, { color: colors.primary }]}>In Stock</Text>
          </View>
          <View style={[styles.pillCard, { backgroundColor: colors.warningSurface }]}>
            <Text style={[styles.pillValue, { color: colors.warningDark }]}>{lowStockCount}</Text>
            <Text style={[styles.pillLabel, { color: colors.warningDark }]}>Low Stock</Text>
          </View>
          <View style={[styles.pillCard, { backgroundColor: colors.errorSurface }]}>
            <Text style={[styles.pillValue, { color: colors.error }]}>{outOfStockCount}</Text>
            <Text style={[styles.pillLabel, { color: colors.error }]}>Out of Stock</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stock Health by Category</Text>
          <View style={styles.barChart}>
            {categoryHealth.length === 0 ? <Text style={styles.emptyText}>No live products yet</Text> : null}
            {categoryHealth.map((category, index) => (
              <View key={`${category.name}-${index}`} style={styles.barColumn}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max((category.percent / 100) * BAR_MAX_HEIGHT, 6),
                      backgroundColor: healthColor(category.percent),
                    },
                  ]}
                />
                <Text style={styles.barLabel} numberOfLines={1}>
                  {category.name || 'Other'}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.statsCardWrap}>
          <View style={styles.statsCard}>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Stock-related Cancels</Text>
              <Text style={[styles.statValue, { color: colors.error }]}>
                {inventoryPerformance.stockoutIncidents}
              </Text>
            </View>
            <View style={styles.stockoutBadge}>
              <Text style={styles.stockoutBadgeText}>{stockoutTone}</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Avg Days to Sell Out</Text>
              <Text style={styles.statValue}>
                {inventoryPerformance.avgDaysToSellOut === null ? '—' : `${inventoryPerformance.avgDaysToSellOut} days`}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Currently Out of Stock</Text>
          <View style={styles.productList}>
            {frequentlyOutOfStock.length === 0 ? (
              <Text style={styles.emptyText}>No products currently out of stock</Text>
            ) : (
              frequentlyOutOfStock.map((product, index) => (
                <View
                  key={product.id}
                  style={[
                    styles.productRow,
                    index === frequentlyOutOfStock.length - 1 && styles.productRowLast,
                  ]}
                >
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productDays}>
                    {product.daysOut === 0 ? 'Out today' : `${product.daysOut} day${product.daysOut === 1 ? '' : 's'} out`}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>

        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.productList}>
            <View style={styles.productRow}>
              <Text style={styles.productName}>Turnover · {periodLabel}</Text>
              <Text style={styles.productDays}>{inventoryPerformance.turnoverRate}×</Text>
            </View>
            <View style={[styles.productRow, styles.productRowLast]}>
              <Text style={styles.productName}>
                Unsold stock value ({inventoryPerformance.deadStockCount} product
                {inventoryPerformance.deadStockCount === 1 ? '' : 's'})
              </Text>
              <Text style={styles.productDays}>{formatINR(inventoryPerformance.deadStockValue)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.huge,
  },
  filterWrap: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  pillCard: {
    flex: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  pillValue: {
    ...typography.h2,
    fontSize: 22,
    lineHeight: 33,
  },
  pillLabel: {
    ...typography.tiny,
    fontWeight: '500',
    paddingTop: 2,
  },
  section: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  lastSection: {
    paddingBottom: spacing.xxxl,
  },
  sectionTitle: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: spacing.lg,
    height: BAR_MAX_HEIGHT + 24,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  bar: {
    width: 28,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  barLabel: {
    ...typography.tiny,
    fontSize: 9,
    color: colors.textSecondary,
  },
  statsCardWrap: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: 14,
  },
  statBlock: {
    gap: spacing.xxs,
  },
  statLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  statValue: {
    ...typography.h2,
    fontSize: 22,
    lineHeight: 33,
    color: colors.textPrimary,
    paddingTop: 2,
  },
  stockoutBadge: {
    backgroundColor: colors.errorSurface,
    borderRadius: radii.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  stockoutBadgeText: {
    ...typography.labelSemibold,
    fontSize: 11,
    color: colors.error,
  },
  productList: {
    paddingTop: 10,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  productRowLast: {
    borderBottomWidth: 0,
  },
  productName: {
    ...typography.label,
    color: colors.textPrimary,
  },
  productDays: {
    ...typography.label,
    fontWeight: '500',
    color: colors.error,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    paddingVertical: spacing.lg,
  },
});
