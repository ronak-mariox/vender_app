import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { NavHeader } from '../../components';
import { kpiNumber, useAnalytics } from '../../context/AnalyticsContext';
import { colors, radii, spacing, typography } from '../../theme';
import { AnalyticsFilterBar } from './AnalyticsFilterBar';
import { formatDayLabel } from './analyticsHelpers';

type Props = NativeStackScreenProps<AuthStackParamList, 'OrdersAnalytics'>;

const ORDERS_HERO_BACKGROUND = '#EFF6FF';
const ORDERS_HERO_LABEL_COLOR = '#3B82F6';

function CompletionRing({ percent, size = 108, strokeWidth = 10 }: { percent: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - percent / 100);

  return (
    <View style={[styles.ringWrap, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={colors.border} strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.primary}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.ringLabel} pointerEvents="none">
        <Text style={styles.ringPercent}>{percent}%</Text>
        <Text style={styles.ringCaption}>Not cancelled</Text>
      </View>
    </View>
  );
}

const MAX_LABELLED_BARS = 7;

export function OrdersAnalyticsScreen({ navigation }: Props) {
  const { kpiStats, revenueDates, periodLabel } = useAnalytics();

  const ordersStat = kpiStats.find(stat => stat.key === 'orders');
  const total = kpiNumber(kpiStats, 'orders');
  const cancelled = kpiNumber(kpiStats, 'cancelled');
  const notCancelled = Math.max(total - cancelled, 0);
  const notCancelledRate = total > 0 ? Math.round((notCancelled / total) * 100) : 0;
  const cancelRate = total > 0 ? ((cancelled / total) * 100).toFixed(1) : '0.0';

  const dailyOrders = useMemo(() => {
    const series = ordersStat?.sparkline ?? [];
    const max = Math.max(1, ...series);
    return series.map((count, index) => ({
      key: revenueDates[index] ?? String(index),
      label: formatDayLabel(revenueDates[index]),
      count,
      percent: (count / max) * 100,
    }));
  }, [ordersStat, revenueDates]);
  const showBarLabels = dailyOrders.length <= MAX_LABELLED_BARS;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <NavHeader title="Orders Analytics" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.filterBarWrap}>
          <AnalyticsFilterBar />
        </View>

        <View style={styles.heroWrap}>
          <View style={styles.heroCard}>
            <View>
              <Text style={styles.heroLabel}>Orders Placed · {periodLabel}</Text>
              <Text style={styles.heroValue}>{ordersStat?.value ?? '—'}</Text>
              {ordersStat?.changeLabel ? <Text style={styles.heroStatLabel}>{ordersStat.changeLabel}</Text> : null}
            </View>
            <View style={styles.heroStatsRow}>
              <View style={styles.heroStatCell}>
                <Text style={[styles.heroStatValue, { color: colors.primary }]}>{notCancelled}</Text>
                <Text style={styles.heroStatLabel}>Not cancelled</Text>
              </View>
              <View style={styles.heroStatCell}>
                <Text style={[styles.heroStatValue, { color: colors.error }]}>{cancelled}</Text>
                <Text style={styles.heroStatLabel}>Cancelled</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Orders per Day</Text>
          {dailyOrders.length === 0 ? (
            <Text style={styles.emptyText}>No orders in this period.</Text>
          ) : (
            <>
              <View style={styles.barChart}>
                {dailyOrders.map(bar => (
                  <View key={bar.key} style={styles.barColumn}>
                    <View style={styles.barTrack}>
                      <View style={[styles.bar, { height: `${Math.max(bar.percent, 2)}%` }]} />
                    </View>
                    {showBarLabels ? <Text style={styles.barLabel}>{bar.label}</Text> : null}
                  </View>
                ))}
              </View>
              {!showBarLabels ? (
                <View style={styles.axisRow}>
                  <Text style={styles.barLabel}>{dailyOrders[0].label}</Text>
                  <Text style={styles.barLabel}>{dailyOrders[dailyOrders.length - 1].label}</Text>
                </View>
              ) : null}
            </>
          )}
        </View>

        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.completionCard}>
            <CompletionRing percent={notCancelledRate} />
            <View style={styles.completionStats}>
              <View style={[styles.completionRow, styles.completionRowDivider]}>
                <Text style={styles.completionLabel}>Not cancelled</Text>
                <Text style={[styles.completionValue, { color: colors.primary }]}>{notCancelled}</Text>
              </View>
              <View style={[styles.completionRow, styles.completionRowDivider]}>
                <Text style={styles.completionLabel}>Cancelled / rejected</Text>
                <Text style={[styles.completionValue, { color: colors.error }]}>{cancelled}</Text>
              </View>
              <View style={styles.completionRow}>
                <Text style={styles.completionLabel}>Cancel Rate</Text>
                <Text style={[styles.completionValue, { color: colors.textSecondary }]}>{cancelRate}%</Text>
              </View>
            </View>
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
    backgroundColor: ORDERS_HERO_BACKGROUND,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroLabel: {
    ...typography.label,
    color: ORDERS_HERO_LABEL_COLOR,
  },
  heroValue: {
    ...typography.h1,
    fontSize: 28,
    lineHeight: 42,
    letterSpacing: 0,
    color: colors.textPrimary,
    paddingTop: spacing.xs,
  },
  heroStatsRow: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  heroStatCell: {
    alignItems: 'center',
  },
  heroStatValue: {
    ...typography.h3,
    fontSize: 18,
    lineHeight: 27,
    textAlign: 'center',
  },
  heroStatLabel: {
    ...typography.tiny,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  lastSection: {
    paddingBottom: spacing.xxxl,
  },
  sectionTitle: {
    ...typography.bodySemibold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  barChart: {
    flexDirection: 'row',
    height: 120,
    paddingTop: spacing.md,
    gap: spacing.xs,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barTrack: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    backgroundColor: '#60A5FA',
    borderRadius: radii.sm,
  },
  barLabel: {
    ...typography.tiny,
    fontSize: 9,
    color: colors.textSecondary,
    paddingTop: spacing.xs,
  },
  completionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.xl,
  },
  ringWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringLabel: {
    position: 'absolute',
    alignItems: 'center',
  },
  ringPercent: {
    ...typography.h3,
    fontSize: 18,
    color: colors.textPrimary,
  },
  ringCaption: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
  },
  completionStats: {
    flex: 1,
  },
  completionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  completionRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  completionLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  completionValue: {
    ...typography.labelSemibold,
  },
  axisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emptyText: {
    ...typography.caption,
    color: colors.textSecondary,
    paddingTop: spacing.md,
  },
});
