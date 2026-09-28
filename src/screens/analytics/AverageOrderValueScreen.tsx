import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { NavHeader, ScreenContainer } from '../../components';
import { kpiNumber, useAnalytics } from '../../context/AnalyticsContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';
import { AnalyticsFilterBar } from './AnalyticsFilterBar';
import { TrendLineChart } from './TrendLineChart';
import { formatDayLabel, formatINR } from './analyticsHelpers';

type Props = NativeStackScreenProps<AuthStackParamList, 'AverageOrderValue'>;

export function AverageOrderValueScreen({ navigation }: Props) {
  const { kpiStats, revenueDates, periodLabel } = useAnalytics();

  const avgOrder = kpiStats.find(stat => stat.key === 'avgOrder');
  const aovTrend = useMemo(() => avgOrder?.sparkline ?? [], [avgOrder]);

  const summary = [
    { label: 'Revenue', value: kpiStats.find(stat => stat.key === 'revenue')?.value ?? '—' },
    { label: 'Orders', value: kpiStats.find(stat => stat.key === 'orders')?.value ?? '—' },
    { label: 'Avg Order', value: avgOrder?.value ?? '—' },
  ];

  const dailyAov = useMemo(
    () =>
      aovTrend
        .map((value, index) => ({ key: revenueDates[index] ?? String(index), label: formatDayLabel(revenueDates[index]), value }))
        .filter(day => day.value > 0)
        .reverse(),
    [aovTrend, revenueDates],
  );
  const maxDailyAov = Math.max(1, ...dailyAov.map(day => day.value));
  const hasRevenue = kpiNumber(kpiStats, 'revenue') > 0;

  return (
    <ScreenContainer scrollable>
      <NavHeader title="Avg Order Value" onBack={() => navigation.goBack()} />

      <View style={styles.filterBarWrap}>
        <AnalyticsFilterBar />
      </View>

      <View style={styles.section}>
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Average Order Value · {periodLabel}</Text>
          <View style={styles.heroValueRow}>
            <Text style={styles.heroValue}>{avgOrder?.value ?? '—'}</Text>
          </View>
          {avgOrder?.changeLabel ? <Text style={styles.heroChange}>{avgOrder.changeLabel}</Text> : null}
          <View style={styles.heroChart}>
            <TrendLineChart data={aovTrend} height={60} color={colors.warning} />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.timeRow}>
          {summary.map(item => (
            <View key={item.label} style={styles.timeCard}>
              <Text style={styles.timeLabel}>{item.label}</Text>
              <Text style={styles.timeValue}>{item.value}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.footnote}>Avg order = delivered revenue ÷ orders placed in the period.</Text>
      </View>

      <View style={[styles.section, styles.lastSection]}>
        <Text style={styles.sectionTitle}>AOV by Day</Text>
        {dailyAov.length === 0 ? (
          <Text style={styles.footnote}>{hasRevenue ? 'No daily breakdown available.' : 'No delivered orders in this period.'}</Text>
        ) : (
          <View style={styles.categoryList}>
            {dailyAov.map(day => (
              <View key={day.key} style={styles.categoryRow}>
                <View style={styles.categoryHeaderRow}>
                  <Text style={styles.categoryLabel}>{day.label}</Text>
                  <Text style={styles.categoryValue}>{formatINR(day.value)}</Text>
                </View>
                <View style={styles.categoryTrack}>
                  <View style={[styles.categoryFill, { width: `${(day.value / maxDailyAov) * 100}%` }]} />
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  filterBarWrap: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  section: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  lastSection: {
    paddingBottom: spacing.xxxl,
  },
  heroCard: {
    backgroundColor: colors.warningSurface,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xl,
  },
  heroLabel: {
    ...typography.label,
    color: colors.warningDark,
  },
  heroValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingTop: spacing.xs,
  },
  heroValue: {
    fontFamily: fontFamilies.bold,
    fontSize: 30,
    lineHeight: 45,
    color: colors.textPrimary,
  },
  heroChange: {
    ...typography.captionSemibold,
    color: colors.warningDark,
  },
  heroChart: {
    paddingTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
    paddingBottom: spacing.md,
  },
  timeRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  timeCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: 2,
  },
  timeLabel: {
    ...typography.tinyBold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  timeValue: {
    fontFamily: fontFamilies.bold,
    fontSize: 14,
    lineHeight: 21,
    color: colors.primary,
    textAlign: 'center',
    paddingTop: spacing.xs,
  },
  categoryList: {
    gap: spacing.lg,
  },
  categoryRow: {
    gap: spacing.xs,
  },
  categoryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryLabel: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.textPrimary,
  },
  categoryValue: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  categoryTrack: {
    height: 8,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  categoryFill: {
    height: 8,
    borderRadius: radii.sm,
    backgroundColor: colors.warning,
  },
  footnote: {
    ...typography.caption,
    color: colors.textSecondary,
    paddingTop: spacing.md,
  },
});
