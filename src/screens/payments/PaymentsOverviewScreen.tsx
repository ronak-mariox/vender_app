import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { usePayments } from '../../context/PaymentsContext';
import { PeriodFilterBar, PaymentsPeriod } from './PeriodFilterBar';
import { SettlementRow } from './SettlementRow';
import { SummaryStatCard } from './SummaryStatCard';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'PaymentsOverview'>;

const PENDING_COLOR = '#B45309';

function formatINR(amount: number) {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

function currentMonthLabel(): string {
  return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function PaymentsOverviewScreen({ navigation }: Props) {
  const { settlements } = usePayments();
  const [period, setPeriod] = useState<PaymentsPeriod>('month');

  const totalSales = useMemo(() => settlements.reduce((sum, s) => sum + s.grossSales, 0), [settlements]);
  const netPayoutTotal = useMemo(() => settlements.reduce((sum, s) => sum + s.netPayout, 0), [settlements]);

  const paidSettlements = useMemo(() => settlements.filter(s => s.status === 'paid'), [settlements]);
  const paidTotal = useMemo(() => paidSettlements.reduce((sum, s) => sum + s.netPayout, 0), [paidSettlements]);

  const pendingSettlements = useMemo(() => settlements.filter(s => s.status !== 'paid'), [settlements]);
  const pendingTotal = useMemo(() => pendingSettlements.reduce((sum, s) => sum + s.netPayout, 0), [pendingSettlements]);
  const earliestDue = useMemo(
    () => pendingSettlements.find(s => s.dueDateLabel) ?? pendingSettlements[0],
    [pendingSettlements],
  );

  const recentTransactions = useMemo(() => settlements.slice(0, 3), [settlements]);
  const latestSettlementId = settlements[0]?.id ?? '';

  const commissionTotal = useMemo(
    () => settlements.reduce((sum, s) => sum + s.commission + s.gstOnCommission, 0),
    [settlements],
  );
  const adjustmentsTotal = useMemo(() => settlements.reduce((sum, s) => sum + s.adjustments, 0), [settlements]);

  const netRatio = totalSales > 0 ? netPayoutTotal / totalSales : 1;
  const commissionRatio = totalSales > 0 ? commissionTotal / totalSales : 0;
  const adjustmentRatio = totalSales > 0 ? adjustmentsTotal / totalSales : 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.headerBlock}>
        <Text style={styles.title}>Payments & Settlements</Text>
        <Text style={styles.subtitle}>{currentMonthLabel()}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <PeriodFilterBar value={period} onChange={setPeriod} />

        <View style={styles.grid}>
          <Pressable style={styles.gridItem} onPress={() => navigation.navigate('TotalSales')}>
            <SummaryStatCard
              label="Total Sales"
              value={formatINR(totalSales)}
              sublabel={`${settlements.length} settlement${settlements.length === 1 ? '' : 's'}`}
              sublabelColor={colors.primary}
            />
          </Pressable>
          <Pressable style={styles.gridItem} onPress={() => navigation.navigate('PendingSettlement')}>
            <SummaryStatCard
              label="Pending"
              value={formatINR(pendingTotal)}
              sublabel={earliestDue?.dueDateLabel ?? 'No dues'}
              valueColor={PENDING_COLOR}
              sublabelColor={PENDING_COLOR}
            />
          </Pressable>
          <Pressable style={styles.gridItem} onPress={() => navigation.navigate('PaidSettlement')}>
            <SummaryStatCard
              label="Paid"
              value={formatINR(paidTotal)}
              sublabel="This month"
              valueColor={colors.primary}
              sublabelColor={colors.primary}
            />
          </Pressable>
          <Pressable
            style={styles.gridItem}
            onPress={() => navigation.navigate('NetSettlement', { settlementId: latestSettlementId })}
          >
            <SummaryStatCard label="Net Payout" value={formatINR(netPayoutTotal)} sublabel="After deductions" />
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>This Month&apos;s Breakdown</Text>
        <View style={styles.breakdownCard}>
          <View style={styles.barTrack}>
            <View style={[styles.barSegment, { flex: Math.max(netRatio, 0.001), backgroundColor: colors.primary }]} />
            {commissionRatio > 0 ? (
              <View style={[styles.barSegment, { flex: commissionRatio, backgroundColor: '#FB923C' }]} />
            ) : null}
            {adjustmentRatio > 0 ? (
              <View style={[styles.barSegment, { flex: adjustmentRatio, backgroundColor: '#A78BFA' }]} />
            ) : null}
          </View>
          <Text style={styles.breakdownSales}>Sales {formatINR(totalSales)}</Text>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#FB923C' }]} />
            <View style={[styles.legendDot, { backgroundColor: '#A78BFA' }]} />
            <Text style={styles.legendText}>Commission · GST · Adjustments</Text>
          </View>
          <Text style={styles.breakdownNet}>Net {formatINR(netPayoutTotal)}</Text>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <Pressable onPress={() => navigation.navigate('SettlementHistory')} hitSlop={8}>
            <Text style={styles.viewAll}>View All</Text>
          </Pressable>
        </View>
        <View style={styles.listCard}>
          {recentTransactions.map(settlement => (
            <SettlementRow
              key={settlement.id}
              settlement={settlement}
              onPress={() => navigation.navigate('SettlementDetails', { settlementId: settlement.id })}
            />
          ))}
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
  headerBlock: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
    gap: 2,
  },
  title: {
    fontFamily: fontFamilies.bold,
    fontSize: 18,
    lineHeight: 27,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fontFamilies.regular,
    fontSize: 13,
    lineHeight: 19.5,
    color: colors.textSecondary,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.huge,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  gridItem: {
    width: '46.5%',
  },
  sectionTitle: {
    ...typography.bodySemibold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  breakdownCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.xl,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  barTrack: {
    flexDirection: 'row',
    height: 8,
    borderRadius: radii.sm,
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  barSegment: {
    height: '100%',
  },
  breakdownSales: {
    ...typography.tiny,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    ...typography.tiny,
    color: colors.textSecondary,
    marginLeft: 2,
  },
  breakdownNet: {
    ...typography.tinyBold,
    color: colors.primary,
    marginTop: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.md,
  },
  viewAll: {
    ...typography.labelSemibold,
    color: colors.primary,
  },
  listCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
});
