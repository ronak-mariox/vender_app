import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, NavHeader, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { Settlement, SettlementStatus, usePayments } from '../../context/PaymentsContext';
import { colors, radii, spacing, typography } from '../../theme';
import { AnalyticsFilterBar, AnalyticsPeriod } from './AnalyticsFilterBar';

type Props = NativeStackScreenProps<AuthStackParamList, 'SettlementSummary'>;

// Mirrors the status -> {label, color} mapping pattern from
// src/screens/payments/SettlementRow.tsx, kept local to this screen.
const STATUS_META: Record<SettlementStatus, { label: string; color: string }> = {
  paid: { label: 'Paid', color: colors.primary },
  pending: { label: 'Pending', color: colors.warningDark },
  failed: { label: 'Failed', color: colors.error },
};

function formatINR(value: number): string {
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

function settlementDateLabel(settlement: Settlement): string {
  if (settlement.transactionDate) {
    return settlement.transactionDate.split(',')[0].trim();
  }
  return settlement.dateRangeLabel;
}

export function SettlementSummaryScreen({ navigation }: Props) {
  const { settlements } = usePayments();
  const [period, setPeriod] = useState<AnalyticsPeriod>('week');

  const gross = useMemo(() => settlements.reduce((sum, s) => sum + s.grossSales, 0), [settlements]);
  const deductions = useMemo(
    () => settlements.reduce((sum, s) => sum + s.commission + s.gstOnCommission + s.adjustments, 0),
    [settlements],
  );
  const net = useMemo(() => settlements.reduce((sum, s) => sum + s.netPayout, 0), [settlements]);

  const settled = useMemo(
    () => settlements.filter(s => s.status === 'paid').reduce((sum, s) => sum + s.netPayout, 0),
    [settlements],
  );
  const pending = useMemo(
    () => settlements.filter(s => s.status !== 'paid').reduce((sum, s) => sum + s.netPayout, 0),
    [settlements],
  );

  const deductionsWidthPct = gross > 0 ? Math.min((deductions / gross) * 100, 100) : 0;
  const netWidthPct = gross > 0 ? Math.min((net / gross) * 100, 100) : 0;

  return (
    <ScreenContainer scrollable={false} backgroundColor={colors.white}>
      <NavHeader title="Settlement Summary" onBack={() => navigation.goBack()} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.filterWrap}>
          <AnalyticsFilterBar value={period} onChange={setPeriod} />
        </View>

        <View style={styles.section}>
          <View style={styles.breakdownCard}>
            <Text style={styles.sectionTitle}>This Month Breakdown</Text>
            <View style={styles.breakdownBars}>
              <View style={[styles.barRow, styles.barRowFull, { backgroundColor: colors.primary }]}>
                <Text style={styles.barLabelWhite} numberOfLines={1}>
                  Gross Sales {formatINR(gross)}
                </Text>
              </View>
              <View style={styles.barRowWrap}>
                <View
                  style={[
                    styles.barRow,
                    { width: `${Math.max(deductionsWidthPct, 8)}%`, backgroundColor: colors.error },
                  ]}
                />
                <Text style={styles.deductionsLabel} numberOfLines={1}>
                  −{formatINR(deductions)} deductions
                </Text>
              </View>
              <View
                style={[
                  styles.barRow,
                  { width: `${Math.max(netWidthPct, 8)}%`, backgroundColor: colors.primary },
                ]}
              >
                <Text style={styles.barLabelWhite} numberOfLines={1}>
                  Net {formatINR(net)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.primarySurface }]}>
            <Text style={[styles.statLabel, { color: colors.primary }]}>Settled</Text>
            <Text style={[styles.statValue, { color: colors.primary }]}>{formatINR(settled)}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.warningSurface }]}>
            <Text style={[styles.statLabel, { color: colors.warningDark }]}>Pending</Text>
            <Text style={[styles.statValue, { color: colors.warningDark }]}>{formatINR(pending)}</Text>
          </View>
        </View>

        <View style={[styles.section, styles.lastSection]}>
          <Text style={styles.sectionTitle}>Settlement History</Text>
          <View style={styles.tableWrap}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableHeaderCell, styles.colId]}>ID</Text>
              <Text style={[styles.tableHeaderCell, styles.colDate]}>Date</Text>
              <Text style={[styles.tableHeaderCell, styles.colAmount]}>Amount</Text>
              <Text style={[styles.tableHeaderCell, styles.colStatus]}>Status</Text>
            </View>
            {settlements.map((settlement, index) => {
              const status = STATUS_META[settlement.status];
              return (
                <Pressable
                  key={settlement.id}
                  style={[
                    styles.tableRow,
                    index === settlements.length - 1 && styles.tableRowLast,
                  ]}
                  onPress={() => navigation.navigate('SettlementDetails', { settlementId: settlement.id })}
                >
                  <Text style={[styles.cellId, styles.colId]} numberOfLines={1}>
                    {settlement.id}
                  </Text>
                  <Text style={[styles.cellDate, styles.colDate]} numberOfLines={1}>
                    {settlementDateLabel(settlement)}
                  </Text>
                  <Text style={[styles.cellAmount, styles.colAmount]} numberOfLines={1}>
                    {formatINR(settlement.netPayout)}
                  </Text>
                  <Text style={[styles.cellStatus, styles.colStatus, { color: status.color }]} numberOfLines={1}>
                    {status.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Download Report"
          icon={<Icon name="file-text" size={16} color={colors.white} />}
          onPress={() => Alert.alert('Download Report', 'Coming soon.')}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  filterWrap: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
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
  breakdownCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.xl,
  },
  breakdownBars: {
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  barRow: {
    height: 26,
    borderRadius: radii.sm,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  barRowFull: {
    width: '100%',
  },
  barRowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  barLabelWhite: {
    ...typography.captionSemibold,
    color: colors.white,
  },
  deductionsLabel: {
    ...typography.caption,
    color: colors.error,
    flexShrink: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  statLabel: {
    ...typography.tiny,
    fontWeight: '500',
  },
  statValue: {
    ...typography.h3,
    fontSize: 18,
    lineHeight: 27,
    paddingTop: spacing.xs,
  },
  tableWrap: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: spacing.md,
  },
  tableHeaderCell: {
    ...typography.captionSemibold,
    fontSize: 11,
    color: colors.textSecondary,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  colId: {
    flex: 1,
  },
  colDate: {
    flex: 1,
  },
  colAmount: {
    flex: 1,
  },
  colStatus: {
    flex: 1,
  },
  cellId: {
    ...typography.bodyMedium,
    fontSize: 12,
    color: colors.primary,
  },
  cellDate: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
  },
  cellAmount: {
    ...typography.captionSemibold,
    fontSize: 12,
    color: colors.textPrimary,
  },
  cellStatus: {
    ...typography.captionSemibold,
    fontSize: 11,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
});
