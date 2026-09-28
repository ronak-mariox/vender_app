import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { usePayments } from '../../context/PaymentsContext';
import { PeriodFilterBar } from './PeriodFilterBar';
import { SettlementRow } from './SettlementRow';
import { SummaryStatCard } from './SummaryStatCard';
import { formatINR, sumBy } from './settlementHelpers';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'PaymentsOverview'>;

const PENDING_COLOR = '#B45309';

export function PaymentsOverviewScreen({ navigation }: Props) {
  const { settlements, filteredSettlements, periodLabel, isLoading, error, refresh } = usePayments();

  const totalSales = useMemo(() => sumBy(filteredSettlements, s => s.grossSales), [filteredSettlements]);
  const netPayoutTotal = useMemo(() => sumBy(filteredSettlements, s => s.netPayout), [filteredSettlements]);
  const paidTotal = useMemo(
    () => sumBy(filteredSettlements.filter(s => s.status === 'paid'), s => s.netPayout),
    [filteredSettlements],
  );
  const unpaid = useMemo(() => filteredSettlements.filter(s => s.status !== 'paid'), [filteredSettlements]);
  const pendingTotal = useMemo(() => sumBy(unpaid, s => s.netPayout), [unpaid]);
  const failedCount = unpaid.filter(s => s.status === 'failed').length;
  const feesTotal = useMemo(
    () => sumBy(filteredSettlements, s => s.commission + s.gstOnCommission),
    [filteredSettlements],
  );
  const otherDeductions = Math.max(0, totalSales - feesTotal - netPayoutTotal);

  const recentTransactions = useMemo(() => settlements.slice(0, 3), [settlements]);

  const netRatio = totalSales > 0 ? netPayoutTotal / totalSales : 1;
  const feesRatio = totalSales > 0 ? feesTotal / totalSales : 0;
  const otherRatio = totalSales > 0 ? otherDeductions / totalSales : 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.headerBlock}>
        <Text style={styles.title}>Payments & Settlements</Text>
        <Text style={styles.subtitle}>{periodLabel}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading && settlements.length > 0} onRefresh={refresh} />}
      >
        <PeriodFilterBar />

        {error ? (
          <Pressable style={styles.errorBox} onPress={refresh}>
            <Text style={styles.errorText}>{error} Tap to retry.</Text>
          </Pressable>
        ) : null}

        {isLoading && settlements.length === 0 ? (
          <ActivityIndicator style={styles.loader} color={colors.primary} />
        ) : null}

        <View style={styles.grid}>
          <Pressable style={styles.gridItem} onPress={() => navigation.navigate('TotalSales')}>
            <SummaryStatCard
              label="Total Sales"
              value={formatINR(totalSales)}
              sublabel={`${filteredSettlements.length} settlement${filteredSettlements.length === 1 ? '' : 's'}`}
              sublabelColor={colors.primary}
            />
          </Pressable>
          <Pressable style={styles.gridItem} onPress={() => navigation.navigate('PendingSettlement')}>
            <SummaryStatCard
              label="Pending"
              value={formatINR(pendingTotal)}
              sublabel={
                unpaid.length === 0 ? 'No dues' : failedCount > 0 ? `${failedCount} failed` : `${unpaid.length} awaiting payout`
              }
              valueColor={PENDING_COLOR}
              sublabelColor={PENDING_COLOR}
            />
          </Pressable>
          <Pressable style={styles.gridItem} onPress={() => navigation.navigate('PaidSettlement')}>
            <SummaryStatCard
              label="Paid"
              value={formatINR(paidTotal)}
              sublabel={periodLabel}
              valueColor={colors.primary}
              sublabelColor={colors.primary}
            />
          </Pressable>
          <Pressable style={styles.gridItem} onPress={() => navigation.navigate('NetSettlement')}>
            <SummaryStatCard label="Net Payout" value={formatINR(netPayoutTotal)} sublabel="After deductions" />
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Breakdown · {periodLabel}</Text>
        <View style={styles.breakdownCard}>
          <View style={styles.barTrack}>
            <View style={[styles.barSegment, { flex: Math.max(netRatio, 0.001), backgroundColor: colors.primary }]} />
            {feesRatio > 0 ? (
              <View style={[styles.barSegment, { flex: feesRatio, backgroundColor: '#FB923C' }]} />
            ) : null}
            {otherRatio > 0 ? (
              <View style={[styles.barSegment, { flex: otherRatio, backgroundColor: '#A78BFA' }]} />
            ) : null}
          </View>
          <Text style={styles.breakdownSales}>Sales {formatINR(totalSales)}</Text>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#FB923C' }]} />
            <Text style={styles.legendText}>Commission + GST {formatINR(feesTotal)}</Text>
          </View>
          {otherDeductions > 0 ? (
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: '#A78BFA' }]} />
              <Text style={styles.legendText}>Returns & adjustments {formatINR(otherDeductions)}</Text>
            </View>
          ) : null}
          <Text style={styles.breakdownNet}>Net {formatINR(netPayoutTotal)}</Text>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Settlements</Text>
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
          {!isLoading && recentTransactions.length === 0 ? (
            <Text style={styles.emptyText}>No settlements yet. They appear once delivered orders are settled.</Text>
          ) : null}
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
  errorBox: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radii.sm,
    backgroundColor: colors.errorSurface,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
  },
  loader: {
    marginTop: spacing.lg,
  },
  emptyText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: spacing.xl,
  },
  listCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
});
