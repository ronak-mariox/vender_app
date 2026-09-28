import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { NavHeader, ScreenContainer } from '../../components';
import { kpiNumber, useAnalytics } from '../../context/AnalyticsContext';
import { colors, radii, spacing, typography } from '../../theme';
import { AnalyticsFilterBar } from './AnalyticsFilterBar';
import { formatINR } from './analyticsHelpers';
import { TrendLineChart } from './TrendLineChart';

type Props = NativeStackScreenProps<AuthStackParamList, 'CancellationAnalytics'>;

// Rank-based colors mirroring the Figma design (red -> amber -> purple -> blue -> gray).
const REASON_COLORS = ['#D92D20', '#F59E0B', '#8B5CF6', '#3B82F6', colors.textSecondary];

export function CancellationAnalyticsScreen({ navigation }: Props) {
  const { kpiStats, cancellationReasons, periodLabel, isLoading } = useAnalytics();

  const cancelledStat = kpiStats.find(stat => stat.key === 'cancelled');
  const cancelledCount = kpiNumber(kpiStats, 'cancelled');
  const ordersCount = kpiNumber(kpiStats, 'orders');
  const avgOrderValue = kpiNumber(kpiStats, 'avgOrder');

  const cancellationRate = ordersCount > 0 ? (cancelledCount / ordersCount) * 100 : 0;
  const estimatedLostRevenue = cancelledCount * avgOrderValue;

  return (
    <ScreenContainer scrollable={false} backgroundColor={colors.white}>
      <NavHeader title="Cancellations" onBack={() => navigation.goBack()} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.filterWrap}>
          <AnalyticsFilterBar />
        </View>

        <View style={styles.heroSection}>
          <View style={styles.heroCard}>
            <Text style={styles.heroLabel}>Cancelled & Rejected · {periodLabel}</Text>
            <View style={styles.heroRow}>
              <Text style={styles.heroValue}>{cancelledCount}</Text>
              <View style={styles.ratePill}>
                <Text style={styles.ratePillText}>{cancellationRate.toFixed(1)}% rate</Text>
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
            {!isLoading && cancellationReasons.length === 0 ? (
              <Text style={styles.emptyText}>No cancellations in this period.</Text>
            ) : null}
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

        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.lostRevenueCard}>
            <Text style={styles.lostRevenueLabel}>Estimated Lost Revenue</Text>
            <Text style={styles.lostRevenueValue}>{formatINR(estimatedLostRevenue)}</Text>
            <Text style={styles.lostRevenueNote}>Cancelled orders × average order value for the period</Text>
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
  lostRevenueNote: {
    ...typography.tiny,
    color: colors.textSecondary,
    paddingTop: spacing.xs,
  },
  emptyText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
