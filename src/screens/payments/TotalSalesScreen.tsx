import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { NavHeader } from '../../components';
import { usePayments, Settlement } from '../../context/PaymentsContext';
import { PeriodFilterBar } from './PeriodFilterBar';
import { formatINR, sumBy } from './settlementHelpers';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'TotalSales'>;

export function TotalSalesScreen({ navigation }: Props) {
  const { filteredSettlements: settlements, periodLabel } = usePayments();

  const totalSales = useMemo(() => sumBy(settlements, s => s.grossSales), [settlements]);
  const avgPerSettlement = settlements.length ? Math.round(totalSales / settlements.length) : 0;
  const bestSettlement = useMemo<Settlement | undefined>(
    () => settlements.reduce<Settlement | undefined>((best, s) => (!best || s.grossSales > best.grossSales ? s : best), undefined),
    [settlements],
  );

  const breakdown = useMemo(
    () =>
      settlements
        .map(s => ({
          ...s,
          percent: totalSales > 0 ? Math.round((s.grossSales / totalSales) * 100) : 0,
        }))
        .sort((a, b) => b.grossSales - a.grossSales),
    [settlements, totalSales],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <NavHeader title="Total Sales" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <PeriodFilterBar />

        <View style={styles.totalBlock}>
          <Text style={styles.totalValue}>{formatINR(totalSales)}</Text>
          <Text style={styles.totalSublabel}>
            {settlements.length} settlement{settlements.length === 1 ? '' : 's'} · {periodLabel}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <StatTile value={String(settlements.length)} label="Settlements" />
          <StatTile value={formatINR(avgPerSettlement)} label="Avg / Settlement" />
          <StatTile value={bestSettlement ? formatINR(bestSettlement.grossSales) : '—'} label="Best Week" />
        </View>

        <Text style={styles.sectionTitle}>Sales by Settlement</Text>
        <View style={styles.breakdownList}>
          {breakdown.map((item, index) => (
            <View key={item.id} style={[styles.breakdownRow, index < breakdown.length - 1 && styles.breakdownRowDivider]}>
              <View style={styles.breakdownHeaderRow}>
                <Text style={styles.breakdownLabel}>{item.dateRangeLabel}</Text>
                <Text style={styles.breakdownAmount}>{formatINR(item.grossSales)}</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${item.percent}%` }]} />
              </View>
              <Text style={styles.breakdownPercent}>{item.percent}% of sales</Text>
            </View>
          ))}
          {breakdown.length === 0 ? <Text style={styles.emptyText}>No settlements in this period</Text> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statTile}>
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.huge,
  },
  totalBlock: {
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  totalValue: {
    fontSize: 36,
    lineHeight: 54,
    color: colors.textPrimary,
    fontWeight: '800',
  },
  totalSublabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  statTile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    ...typography.bodySemibold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.tiny,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  sectionTitle: {
    ...typography.bodySemibold,
    fontSize: 15,
    color: colors.textPrimary,
    paddingBottom: spacing.md,
  },
  breakdownList: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.xl,
  },
  breakdownRow: {
    paddingVertical: spacing.lg,
  },
  breakdownRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  breakdownHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  breakdownAmount: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  breakdownPercent: {
    ...typography.tiny,
    color: colors.textSecondary,
    marginTop: 3,
  },
  emptyText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});
