import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { NavHeader } from '../../components';
import { kpiNumber, useAnalytics } from '../../context/AnalyticsContext';
import { colors, radii, spacing, typography } from '../../theme';
import { AnalyticsFilterBar } from './AnalyticsFilterBar';
import { TrendLineChart } from './TrendLineChart';
import { formatDayLabel, formatINR } from './analyticsHelpers';

type Props = NativeStackScreenProps<AuthStackParamList, 'SalesAnalytics'>;

const TOP_PRODUCT_COUNT = 5;

export function SalesAnalyticsScreen({ navigation }: Props) {
  const { kpiStats, revenueTrend, revenueDates, bestSellingProducts, periodLabel } = useAnalytics();
  const revenueStat = kpiStats.find(stat => stat.key === 'revenue');
  const revenue = kpiNumber(kpiStats, 'revenue');

  const quickStats = useMemo(() => {
    let bestIndex = -1;
    revenueTrend.forEach((value, index) => {
      if (value > 0 && (bestIndex === -1 || value > revenueTrend[bestIndex])) bestIndex = index;
    });
    const salesDays = revenueTrend.filter(value => value > 0).length;
    return [
      { label: 'Best Day', value: bestIndex >= 0 ? formatDayLabel(revenueDates[bestIndex]) : '—' },
      { label: 'Avg / Sales Day', value: salesDays > 0 ? formatINR(revenue / salesDays) : '—' },
      { label: 'Days with Sales', value: String(salesDays) },
    ];
  }, [revenueTrend, revenueDates, revenue]);

  const topProducts = bestSellingProducts.slice(0, TOP_PRODUCT_COUNT);
  const maxProductRevenue = Math.max(1, ...topProducts.map(product => product.revenue));

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <NavHeader title="Sales Analytics" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.filterBarWrap}>
          <AnalyticsFilterBar />
        </View>

        <View style={styles.heroWrap}>
          <View style={styles.heroCard}>
            <Text style={styles.heroLabel}>Delivered Revenue · {periodLabel}</Text>
            <View style={styles.heroValueRow}>
              <Text style={styles.heroValue}>{revenueStat?.value ?? '—'}</Text>
            </View>
            {revenueStat?.changeLabel ? <Text style={styles.heroChange}>{revenueStat.changeLabel}</Text> : null}
            <View style={styles.heroChart}>
              <TrendLineChart data={revenueTrend} height={100} />
            </View>
          </View>
        </View>

        <View style={styles.statsRowWrap}>
          <View style={styles.statsRow}>
            {quickStats.map((stat, index) => (
              <View key={stat.label} style={[styles.statCell, index < quickStats.length - 1 && styles.statCellDivider]}>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Top Products by Revenue</Text>
            {bestSellingProducts.length > 0 ? (
              <Pressable hitSlop={8} onPress={() => navigation.navigate('BestSellingProducts')}>
                <Text style={styles.link}>See all</Text>
              </Pressable>
            ) : null}
          </View>
          <View style={styles.categoryList}>
            {topProducts.length === 0 ? (
              <Text style={styles.emptyText}>No product sales in this period.</Text>
            ) : (
              topProducts.map(product => (
                <View key={product.name} style={styles.categoryRow}>
                  <View style={styles.categoryHeaderRow}>
                    <Text style={styles.categoryName} numberOfLines={1}>
                      {product.name}
                    </Text>
                    <Text style={styles.categoryAmount}>
                      {formatINR(product.revenue)} · {product.units} units
                    </Text>
                  </View>
                  <View style={styles.categoryTrack}>
                    <View style={[styles.categoryFill, { width: `${(product.revenue / maxProductRevenue) * 100}%` }]} />
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.huge,
  },
  filterBarWrap: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  heroWrap: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  heroCard: {
    backgroundColor: colors.primarySurface,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  heroLabel: {
    ...typography.label,
    color: colors.primary,
  },
  heroValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingTop: spacing.xs,
  },
  heroValue: {
    ...typography.h1,
    fontSize: 28,
    lineHeight: 42,
    letterSpacing: 0,
    color: colors.textPrimary,
  },
  heroChange: {
    ...typography.captionSemibold,
    color: colors.primary,
  },
  heroChart: {
    paddingTop: spacing.lg,
  },
  statsRowWrap: {
    paddingHorizontal: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  statCellDivider: {
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  statLabel: {
    ...typography.tiny,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statValue: {
    ...typography.bodySemibold,
    fontSize: 14,
    color: colors.textPrimary,
    paddingTop: spacing.xs,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
  },
  lastSection: {
    paddingBottom: spacing.xxxl,
  },
  sectionTitle: {
    ...typography.bodySemibold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  categoryList: {
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  categoryRow: {
    gap: spacing.xs,
  },
  categoryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryName: {
    ...typography.label,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  link: {
    ...typography.labelSemibold,
    color: colors.primary,
  },
  emptyText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  categoryAmount: {
    ...typography.label,
    color: colors.textSecondary,
  },
  categoryTrack: {
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    overflow: 'hidden',
  },
  categoryFill: {
    height: 8,
    borderRadius: radii.sm,
    backgroundColor: colors.primary,
  },
});
