import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { NavHeader } from '../../components';
import { useAnalytics } from '../../context/AnalyticsContext';
import { colors, radii, spacing, typography } from '../../theme';
import { AnalyticsFilterBar, AnalyticsPeriod } from './AnalyticsFilterBar';

type Props = NativeStackScreenProps<AuthStackParamList, 'OrdersAnalytics'>;

const ORDERS_HERO_BACKGROUND = '#EFF6FF';
const ORDERS_HERO_LABEL_COLOR = '#3B82F6';

// Daily distribution isn't modeled in AnalyticsContext — illustrative shape matching Figma's silhouette.
const DAILY_ORDERS = [
  { day: 'Mon', percent: 55 },
  { day: 'Tue', percent: 92 },
  { day: 'Wed', percent: 78 },
  { day: 'Thu', percent: 65 },
  { day: 'Fri', percent: 85 },
  { day: 'Sat', percent: 100 },
  { day: 'Sun', percent: 72 },
];

// Hourly distribution isn't modeled in AnalyticsContext — illustrative shape matching Figma's silhouette.
const HOURLY_DISTRIBUTION = [
  { hour: 6, weight: 0.3 },
  { hour: 7, weight: 0.7 },
  { hour: 8, weight: 0.9 },
  { hour: 9, weight: 0.6 },
  { hour: 10, weight: 0.4 },
  { hour: 11, weight: 0.35 },
  { hour: 12, weight: 0.4 },
  { hour: 13, weight: 0.35 },
  { hour: 14, weight: 0.3 },
  { hour: 15, weight: 0.35 },
  { hour: 16, weight: 0.4 },
  { hour: 17, weight: 0.5 },
  { hour: 18, weight: 0.75 },
  { hour: 19, weight: 0.95 },
  { hour: 20, weight: 0.85 },
  { hour: 21, weight: 0.55 },
  { hour: 22, weight: 0.35 },
];

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
        <Text style={styles.ringCaption}>Completed</Text>
      </View>
    </View>
  );
}

export function OrdersAnalyticsScreen({ navigation }: Props) {
  const { kpiStats, period, setPeriod } = useAnalytics();

  const ordersStat = kpiStats.find(stat => stat.key === 'orders');
  const cancelledStat = kpiStats.find(stat => stat.key === 'cancelled');
  const total = parseInt((ordersStat?.value ?? '0').replace(/[^0-9]/g, ''), 10) || 0;
  const cancelled = parseInt((cancelledStat?.value ?? '0').replace(/[^0-9]/g, ''), 10) || 0;
  const completed = Math.max(total - cancelled, 0);
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const cancelRate = total > 0 ? ((cancelled / total) * 100).toFixed(2) : '0.00';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <NavHeader title="Orders Analytics" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.filterBarWrap}>
          <AnalyticsFilterBar value={period} onChange={setPeriod} />
        </View>

        <View style={styles.heroWrap}>
          <View style={styles.heroCard}>
            <View>
              <Text style={styles.heroLabel}>Total Orders</Text>
              <Text style={styles.heroValue}>{ordersStat?.value ?? '—'}</Text>
            </View>
            <View style={styles.heroStatsRow}>
              <View style={styles.heroStatCell}>
                <Text style={[styles.heroStatValue, { color: colors.primary }]}>{completed}</Text>
                <Text style={styles.heroStatLabel}>Completed</Text>
              </View>
              <View style={styles.heroStatCell}>
                <Text style={[styles.heroStatValue, { color: colors.error }]}>{cancelled}</Text>
                <Text style={styles.heroStatLabel}>Cancelled</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Orders (Mon–Sun)</Text>
          <View style={styles.barChart}>
            {DAILY_ORDERS.map(bar => (
              <View key={bar.day} style={styles.barColumn}>
                <View style={styles.barTrack}>
                  <View style={[styles.bar, { height: `${bar.percent}%` }]} />
                </View>
                <Text style={styles.barLabel}>{bar.day}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.completionCard}>
            <CompletionRing percent={completionRate} />
            <View style={styles.completionStats}>
              <View style={[styles.completionRow, styles.completionRowDivider]}>
                <Text style={styles.completionLabel}>Completed</Text>
                <Text style={[styles.completionValue, { color: colors.primary }]}>{completed}</Text>
              </View>
              <View style={[styles.completionRow, styles.completionRowDivider]}>
                <Text style={styles.completionLabel}>Cancelled</Text>
                <Text style={[styles.completionValue, { color: colors.error }]}>{cancelled}</Text>
              </View>
              <View style={styles.completionRow}>
                <Text style={styles.completionLabel}>Cancel Rate</Text>
                <Text style={[styles.completionValue, { color: colors.textSecondary }]}>{cancelRate}%</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.section, styles.lastSection]}>
          <Text style={styles.sectionTitle}>Hourly Distribution</Text>
          <View style={styles.hourlyCard}>
            <View style={styles.hourlyRow}>
              {HOURLY_DISTRIBUTION.map(point => (
                <View key={point.hour} style={styles.hourlyColumn}>
                  <View style={styles.hourlyDotTrack}>
                    <View
                      style={[
                        styles.hourlyDot,
                        {
                          width: 6 + point.weight * 12,
                          height: 6 + point.weight * 12,
                          opacity: 0.4 + point.weight * 0.6,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.hourlyLabel}>{point.hour}</Text>
                </View>
              ))}
            </View>
            <View style={styles.hourlyPeakRow}>
              <Text style={styles.hourlyPeakLabel}>Peak: 7–9 AM</Text>
              <Text style={styles.hourlyPeakLabel}>Peak: 6–8 PM</Text>
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
  hourlyCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  hourlyRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 40,
  },
  hourlyColumn: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  hourlyDotTrack: {
    height: 24,
    justifyContent: 'flex-end',
  },
  hourlyDot: {
    borderRadius: radii.full,
    backgroundColor: colors.primary,
  },
  hourlyLabel: {
    fontSize: 8,
    color: colors.textSecondary,
  },
  hourlyPeakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
  },
  hourlyPeakLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
});
