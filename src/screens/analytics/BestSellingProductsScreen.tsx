import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { NavHeader, ScreenContainer } from '../../components';
import { useAnalytics } from '../../context/AnalyticsContext';
import { colors, radii, spacing, typography } from '../../theme';
import { AnalyticsFilterBar } from './AnalyticsFilterBar';
import { RankedProductRow } from './RankedProductRow';

type Props = NativeStackScreenProps<AuthStackParamList, 'BestSellingProducts'>;

type MetricTab = 'revenue' | 'units' | 'orders';

const TABS: { key: MetricTab; label: string }[] = [
  { key: 'revenue', label: 'By Revenue' },
  { key: 'units', label: 'By Units' },
  { key: 'orders', label: 'By Orders' },
];

function formatInr(value: number) {
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

export function BestSellingProductsScreen({ navigation }: Props) {
  const { bestSellingProducts, isLoading } = useAnalytics();
  const [metric, setMetric] = useState<MetricTab>('revenue');

  const rankedProducts = useMemo(
    () => [...bestSellingProducts].sort((a, b) => b[metric] - a[metric]),
    [bestSellingProducts, metric],
  );

  return (
    <ScreenContainer scrollable>
      <NavHeader title="Best Sellers" onBack={() => navigation.goBack()} />

      <View style={styles.filterBarWrap}>
        <AnalyticsFilterBar />
      </View>

      <View style={styles.tabsWrap}>
        <View style={styles.tabsContainer}>
          {TABS.map(tab => {
            const active = tab.key === metric;
            return (
              <Pressable
                key={tab.key}
                style={[styles.tab, active && styles.tabActive]}
                onPress={() => setMetric(tab.key)}
              >
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.listSection}>
        {!isLoading && rankedProducts.length === 0 ? (
          <Text style={styles.emptyText}>No products sold in this period.</Text>
        ) : null}
        {rankedProducts.map((product, index) => {
          const rank = index + 1;
          const amount =
            metric === 'revenue'
              ? formatInr(product.revenue)
              : metric === 'units'
                ? `${product.units.toLocaleString('en-IN')} units`
                : `${product.orders.toLocaleString('en-IN')} orders`;
          const subtitle = metric === 'revenue' ? `${product.units.toLocaleString('en-IN')} units` : formatInr(product.revenue);

          return (
            <RankedProductRow
              key={`${product.name}-${index}`}
              rank={rank}
              name={product.name}
              subtitle={subtitle}
              amount={amount}
              trend={product.trend}
            />
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
  tabsWrap: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xs,
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
    backgroundColor: colors.primary,
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
  emptyText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});
