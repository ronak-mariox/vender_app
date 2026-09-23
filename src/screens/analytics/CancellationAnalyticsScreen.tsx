import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { NavHeader, ScreenContainer } from '../../components';
import { useAnalytics } from '../../context/AnalyticsContext';
import { colors, radii, spacing, typography } from '../../theme';
import { AnalyticsFilterBar, AnalyticsPeriod } from './AnalyticsFilterBar';
import { TrendLineChart } from './TrendLineChart';

type Props = NativeStackScreenProps<AuthStackParamList, 'CancellationAnalytics'>;

// Rank-based colors mirroring the Figma design (red -> amber -> purple -> blue -> gray).
const REASON_COLORS = ['#D92D20', '#F59E0B', '#8B5CF6', '#3B82F6', colors.textSecondary];

// Illustrative — Analytics/Inventory contexts don't expose a per-product cancellation
// breakdown, so this mirrors the Figma mock content verbatim (see final report).
const TOP_CANCELLED_PRODUCTS = [
  { name: 'Fresh Paneer 200g', count: 8 },
  { name: 'Amul Butter 500g', count: 6 },
  { name: 'Coriander (bunch)', count: 5 },
];

const REDUCE_TIPS = [
  'Keep inventory updated in real-time',
  'Set realistic delivery time estimates',
  'Enable order modification before dispatch',
];

function parseNumeric(value: string): number {
  const cleaned = value.replace(/[^0-9.]/g, '');
  return cleaned ? Number(cleaned) : 0;
}

function formatINR(value: number): string {
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

export function CancellationAnalyticsScreen({ navigation }: Props) {
  const { kpiStats, cancellationReasons, period, setPeriod } = useAnalytics();

  const cancelledStat = kpiStats.find(stat => stat.key === 'cancelled');
  const ordersStat = kpiStats.find(stat => stat.key === 'orders');
  const avgOrderStat = kpiStats.find(stat => stat.key === 'avgOrder');

  const cancelledCount = cancelledStat ? parseNumeric(cancelledStat.value) : 0;
  const ordersCount = ordersStat ? parseNumeric(ordersStat.value) : 0;
  const avgOrderValue = avgOrderStat ? parseNumeric(avgOrderStat.value) : 0;

  const cancellationRate = useMemo(
    () => (ordersCount > 0 ? (cancelledCount / ordersCount) * 100 : 0),
    [cancelledCount, ordersCount],
  );
  const lostRevenue = cancelledCount * avgOrderValue;

  return (
    <ScreenContainer scrollable={false} backgroundColor={colors.white}>
      <NavHeader title="Cancellations" onBack={() => navigation.goBack()} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.filterWrap}>
          <AnalyticsFilterBar value={period} onChange={setPeriod} />
        </View>

        <View style={styles.heroSection}>
          <View style={styles.heroCard}>
            <Text style={styles.heroLabel}>Total Cancellations</Text>
            <View style={styles.heroRow}>
              <Text style={styles.heroValue}>{cancelledCount}</Text>
              <View style={styles.ratePill}>
                <Text style={styles.ratePillText}>{cancellationRate.toFixed(2)}% rate</Text>
              </View>
            </View>
            {cancelledStat ? (
              <View style={styles.heroChart}>
                <TrendLineChart data={cancelledStat.sparkline} color={colors.error} height={80} />
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>By Cancellation Reason</Text>
          <View style={styles.reasonList}>
            {cancellationReasons.map((reason, index) => {
              const color = REASON_COLORS[index] ?? colors.textSecondary;
              return (
                <View key={reason.reason} style={styles.reasonItem}>
                  <View style={styles.reasonHeaderRow}>
                    <Text style={styles.reasonLabel}>{reason.reason}</Text>
                    <Text style={[styles.reasonPercent, { color }]}>{reason.percent}%</Text>
                  </View>
                  <View style={styles.reasonTrack}>
                    <View
                      style={[
                        styles.reasonFill,
                        { width: `${Math.min(reason.percent, 100)}%`, backgroundColor: color },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.lostRevenueCard}>
            <Text style={styles.lostRevenueLabel}>Lost Revenue from Cancellations</Text>
            <Text style={styles.lostRevenueValue}>{formatINR(lostRevenue)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Cancelled Products</Text>
          <View style={styles.productList}>
            {TOP_CANCELLED_PRODUCTS.map((product, index) => (
              <View
                key={product.name}
                style={[
                  styles.productRow,
                  index === TOP_CANCELLED_PRODUCTS.length - 1 && styles.productRowLast,
                ]}
              >
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productCount}>{product.count} cancelled</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>Reduce Cancellations</Text>
            {REDUCE_TIPS.map(tip => (
              <View key={tip} style={styles.tipRow}>
                <View style={styles.tipDot} />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
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
  heroSection: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  heroCard: {
    backgroundColor: colors.errorSurface,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xl,
  },
  heroLabel: {
    ...typography.label,
    color: colors.error,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingTop: spacing.xs,
  },
  heroValue: {
    ...typography.h1,
    fontSize: 30,
    lineHeight: 45,
    color: colors.textPrimary,
  },
  ratePill: {
    backgroundColor: colors.error,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
  },
  ratePillText: {
    ...typography.captionSemibold,
    color: colors.white,
  },
  heroChart: {
    paddingTop: spacing.lg,
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
  reasonList: {
    paddingTop: spacing.lg,
    gap: 10,
  },
  reasonItem: {
    width: '100%',
  },
  reasonHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reasonLabel: {
    ...typography.label,
    color: colors.textPrimary,
  },
  reasonPercent: {
    ...typography.labelSemibold,
  },
  reasonTrack: {
    marginTop: spacing.xs,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  reasonFill: {
    height: 8,
    borderRadius: 4,
  },
  lostRevenueCard: {
    backgroundColor: colors.errorSurface,
    borderRadius: radii.md,
    padding: 14,
  },
  lostRevenueLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  lostRevenueValue: {
    ...typography.h3,
    fontSize: 20,
    lineHeight: 30,
    color: colors.error,
    paddingTop: spacing.xs,
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
  productCount: {
    ...typography.labelSemibold,
    color: colors.error,
  },
  tipsCard: {
    backgroundColor: colors.primarySurface,
    borderWidth: 1,
    borderColor: 'rgba(28,166,114,0.19)',
    borderRadius: radii.md,
    padding: 14,
  },
  tipsTitle: {
    ...typography.labelSemibold,
    color: colors.primary,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  tipDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
  tipText: {
    ...typography.caption,
    color: colors.textPrimary,
    flex: 1,
  },
});
