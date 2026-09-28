import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { NavHeader, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { LowPerformingProduct, useAnalytics } from '../../context/AnalyticsContext';
import { colors, radii, spacing, typography } from '../../theme';
import { AnalyticsFilterBar } from './AnalyticsFilterBar';
import { formatINR } from './analyticsHelpers';

type Props = NativeStackScreenProps<AuthStackParamList, 'LowPerformingProducts'>;

type SortTab = 'revenue' | 'stale' | 'none';

const TABS: { key: SortTab; label: string }[] = [
  { key: 'revenue', label: 'By Revenue' },
  { key: 'stale', label: 'Longest Unsold' },
  { key: 'none', label: 'No Sales' },
];

function sortProducts(products: LowPerformingProduct[], tab: SortTab) {
  if (tab === 'none') return products.filter(p => p.unitsSold === 0);
  const copy = [...products];
  if (tab === 'revenue') return copy.sort((a, b) => a.revenue - b.revenue);
  // A product that's never sold (null) is treated as the most stale.
  return copy.sort((a, b) => (b.daysSinceLastSale ?? Infinity) - (a.daysSinceLastSale ?? Infinity));
}

function lastSoldLabel(days: number | null): string {
  if (days === null) return 'No sales in this period';
  if (days === 0) return 'Last sold today';
  return `Last sold ${days} day${days === 1 ? '' : 's'} ago`;
}

export function LowPerformingProductsScreen({ navigation }: Props) {
  const { lowPerformingProducts, periodLabel, isLoading } = useAnalytics();
  const [tab, setTab] = useState<SortTab>('revenue');

  const sortedProducts = useMemo(
    () => sortProducts(lowPerformingProducts, tab),
    [lowPerformingProducts, tab],
  );

  function handleTakeAction(product: LowPerformingProduct) {
    Alert.alert(
      product.name,
      `${product.suggestion}\n\nStock on hand: ${product.stock} units · Revenue (${periodLabel}): ${formatINR(product.revenue)}`,
    );
  }

  return (
    <ScreenContainer scrollable>
      <NavHeader title="Low Performers" onBack={() => navigation.goBack()} />

      <View style={styles.filterBarWrap}>
        <AnalyticsFilterBar />
      </View>

      <View style={styles.bannerWrap}>
        <View style={styles.banner}>
          <Icon name="alert-circle" size={18} color={colors.error} />
          <Text style={styles.bannerText}>
            {lowPerformingProducts.length === 0
              ? `No slow-moving active products · ${periodLabel}`
              : `${lowPerformingProducts.length} slowest-selling active product${lowPerformingProducts.length === 1 ? '' : 's'} · ${periodLabel}`}
          </Text>
        </View>
      </View>

      <View style={styles.tabsWrap}>
        <View style={styles.tabsContainer}>
          {TABS.map(item => {
            const active = item.key === tab;
            return (
              <Pressable
                key={item.key}
                style={[styles.tab, active && styles.tabActive]}
                onPress={() => setTab(item.key)}
              >
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.listSection}>
        {!isLoading && sortedProducts.length === 0 ? <Text style={styles.emptyText}>Nothing to show here.</Text> : null}
        {sortedProducts.map((product, index) => {
          const severe = product.unitsSold <= 2;
          return (
            <View key={`${product.name}-${index}`} style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.rowName} numberOfLines={1}>
                  {product.name}
                </Text>
                <Text style={styles.rowSubtitle}>
                  {lastSoldLabel(product.daysSinceLastSale)} · {product.stock} in stock
                </Text>
              </View>
              <View style={styles.rowMeta}>
                <Text style={[styles.rowUnits, { color: severe ? colors.error : colors.warning }]}>
                  {product.unitsSold} units
                </Text>
                <Pressable style={styles.actionChip} onPress={() => handleTakeAction(product)}>
                  <Text style={styles.actionChipText}>Take Action</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>

    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  filterBarWrap: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  bannerWrap: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.errorSurface,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  bannerText: {
    ...typography.label,
    color: colors.error,
    flex: 1,
  },
  tabsWrap: {
    paddingHorizontal: spacing.xl,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  tabActive: {
    backgroundColor: colors.error,
  },
  tabLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  tabLabelActive: {
    ...typography.captionSemibold,
    color: colors.white,
  },
  listSection: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowText: {
    flex: 1,
    gap: 2,
    paddingRight: spacing.md,
  },
  rowName: {
    ...typography.label,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  rowSubtitle: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  rowUnits: {
    ...typography.labelSemibold,
    fontWeight: '700',
  },
  actionChip: {
    backgroundColor: colors.primarySurface,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  actionChipText: {
    ...typography.tinyBold,
    color: colors.primary,
  },
  emptyText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});
