import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { NavHeader } from '../../components';
import { useAnalytics } from '../../context/AnalyticsContext';
import { colors, radii, spacing, typography } from '../../theme';
import { AnalyticsFilterBar, AnalyticsPeriod } from './AnalyticsFilterBar';

type Props = NativeStackScreenProps<AuthStackParamList, 'RevenueAnalytics'>;

// Monthly target, last month's revenue and the offers/net split aren't modeled in
// AnalyticsContext — illustrative constants matching Figma's exact copy.
const MONTHLY_TARGET = 220000;
const LAST_MONTH_REVENUE = 164580;
const OFFERS_APPLIED = 24810;

function formatInr(value: number): string {
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

function parseInr(value: string): number {
  return parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy - r * Math.sin(angleRad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  return `M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`;
}

function TargetGauge({ percent }: { percent: number }) {
  const strokeWidth = 14;
  const r = 70;
  const cx = r + strokeWidth / 2;
  const cy = r + strokeWidth / 2;
  const width = r * 2 + strokeWidth;
  const height = r + strokeWidth;
  const clamped = Math.min(Math.max(percent, 0), 100);
  const progressEndAngle = 180 - (clamped / 100) * 180;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Path
          d={describeArc(cx, cy, r, 180, 0)}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d={describeArc(cx, cy, r, 180, progressEndAngle)}
          stroke={colors.primary}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
      <View style={styles.gaugeLabel} pointerEvents="none">
        <Text style={styles.gaugePercent}>{clamped}%</Text>
        <Text style={styles.gaugeCaption}>of target</Text>
      </View>
    </View>
  );
}

export function RevenueAnalyticsScreen({ navigation }: Props) {
  const { kpiStats, period, setPeriod } = useAnalytics();

  const revenueStat = kpiStats.find(stat => stat.key === 'revenue');
  const achieved = parseInr(revenueStat?.value ?? '0');
  const percentOfTarget = MONTHLY_TARGET > 0 ? Math.round((achieved / MONTHLY_TARGET) * 100) : 0;
  const remaining = Math.max(MONTHLY_TARGET - achieved, 0);
  const thisMonthPct = Math.min((achieved / MONTHLY_TARGET) * 100, 100);
  const lastMonthPct = Math.min((LAST_MONTH_REVENUE / MONTHLY_TARGET) * 100, 100);
  const netRevenue = achieved - OFFERS_APPLIED;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <NavHeader title="Revenue Analytics" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.filterBarWrap}>
          <AnalyticsFilterBar value={period} onChange={setPeriod} />
        </View>

        <View style={styles.heroWrap}>
          <View style={styles.heroCard}>
            <Text style={styles.heroLabel}>Total Revenue</Text>
            <Text style={styles.heroValue}>{revenueStat?.value ?? '—'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.targetCard}>
            <TargetGauge percent={percentOfTarget} />
            <View style={styles.targetStats}>
              <Text style={styles.targetLabel}>Monthly Target</Text>
              <Text style={styles.targetValue}>{formatInr(MONTHLY_TARGET)}</Text>
              <Text style={[styles.targetLabel, styles.targetLabelSpaced]}>Achieved</Text>
              <Text style={[styles.targetValue, { color: colors.primary }]}>{formatInr(achieved)}</Text>
              <Text style={styles.targetRemaining}>{formatInr(remaining)} remaining</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Month-on-Month</Text>
          <View style={styles.monthRow}>
            <View style={styles.monthHeaderRow}>
              <Text style={styles.monthLabel}>This Month</Text>
              <Text style={styles.monthValue}>{formatInr(achieved)}</Text>
            </View>
            <View style={styles.monthTrack}>
              <View style={[styles.monthFill, { width: `${thisMonthPct}%`, backgroundColor: colors.primary }]} />
            </View>
          </View>
          <View style={styles.monthRow}>
            <View style={styles.monthHeaderRow}>
              <Text style={styles.monthLabel}>Last Month</Text>
              <Text style={styles.monthValue}>{formatInr(LAST_MONTH_REVENUE)}</Text>
            </View>
            <View style={styles.monthTrack}>
              <View style={[styles.monthFill, { width: `${lastMonthPct}%`, backgroundColor: '#94A3B8' }]} />
            </View>
          </View>
        </View>

        <View style={[styles.section, styles.lastSection]}>
          <Text style={styles.sectionTitle}>Revenue Breakdown</Text>
          <View style={styles.breakdownList}>
            <View style={[styles.breakdownRow, styles.breakdownRowDivider]}>
              <Text style={styles.breakdownLabel}>Online Orders</Text>
              <Text style={[styles.breakdownValue, { color: colors.primary }]}>{formatInr(achieved)}</Text>
            </View>
            <View style={[styles.breakdownRow, styles.breakdownRowDivider]}>
              <Text style={styles.breakdownLabel}>Offers Applied</Text>
              <Text style={[styles.breakdownValue, { color: colors.error }]}>{`−${formatInr(OFFERS_APPLIED)}`}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Net Revenue</Text>
              <Text style={styles.breakdownValue}>{formatInr(netRevenue)}</Text>
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
    backgroundColor: colors.primarySurface,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xl,
  },
  heroLabel: {
    ...typography.label,
    color: colors.primary,
  },
  heroValue: {
    ...typography.h1,
    fontSize: 30,
    lineHeight: 45,
    letterSpacing: 0,
    color: colors.textPrimary,
    paddingTop: spacing.xs,
  },
  section: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  lastSection: {
    paddingBottom: spacing.xxxl,
  },
  targetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.xl,
  },
  gaugeLabel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 8,
    alignItems: 'center',
  },
  gaugePercent: {
    ...typography.h3,
    fontSize: 20,
    color: colors.textPrimary,
  },
  gaugeCaption: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
  },
  targetStats: {
    flex: 1,
  },
  targetLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  targetLabelSpaced: {
    paddingTop: spacing.md,
  },
  targetValue: {
    ...typography.h3,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  targetRemaining: {
    ...typography.caption,
    color: colors.textSecondary,
    paddingTop: spacing.sm,
  },
  sectionTitle: {
    ...typography.bodySemibold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  monthRow: {
    paddingTop: spacing.lg,
  },
  monthHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthLabel: {
    ...typography.label,
    color: colors.textPrimary,
  },
  monthValue: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  monthTrack: {
    height: 10,
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    marginTop: spacing.xs,
    overflow: 'hidden',
  },
  monthFill: {
    height: 10,
    borderRadius: radii.sm,
  },
  breakdownList: {
    paddingTop: spacing.lg,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
  },
  breakdownRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  breakdownLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  breakdownValue: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
});
