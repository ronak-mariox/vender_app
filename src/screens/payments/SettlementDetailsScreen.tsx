import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, NavHeader, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { SettlementStatus, usePayments } from '../../context/PaymentsContext';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'SettlementDetails'>;

// Mirrors SettlementRow.tsx's STATUS_META so the status pill here reads identically
// to the settlement history list.
const STATUS_META: Record<SettlementStatus, { label: string; background: string; text: string }> = {
  paid: { label: 'Paid', background: colors.primarySurface, text: colors.primary },
  pending: { label: 'Pending', background: colors.warningSurface, text: colors.warningDark },
  failed: { label: 'Failed', background: colors.errorSurface, text: colors.error },
};

function formatINR(value: number): string {
  return `₹${Math.round(Math.abs(value)).toLocaleString('en-IN')}`;
}

export function SettlementDetailsScreen({ navigation, route }: Props) {
  const { settlementId } = route.params;
  const { getSettlement } = usePayments();
  const settlement = getSettlement(settlementId);

  if (!settlement) {
    return (
      <ScreenContainer scrollable={false} backgroundColor={colors.white}>
        <NavHeader title="Settlement Details" onBack={() => navigation.goBack()} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Settlement not found</Text>
        </View>
      </ScreenContainer>
    );
  }

  const status = STATUS_META[settlement.status];

  const breakdownRows: {
    key: string;
    label: string;
    value: string;
    valueColor?: string;
    emphasize?: boolean;
  }[] = [
    { key: 'gross', label: 'Gross Sales', value: formatINR(settlement.grossSales) },
    { key: 'returns', label: 'Returns', value: `-${formatINR(settlement.returns)}`, valueColor: colors.error },
    { key: 'net', label: 'Net Sales', value: formatINR(settlement.netSales), emphasize: true },
    {
      key: 'commission',
      label: `Commission (${settlement.commissionRate}%)`,
      value: `-${formatINR(settlement.commission)}`,
      valueColor: colors.error,
    },
    {
      key: 'gst',
      label: 'GST on Commission',
      value: `-${formatINR(settlement.gstOnCommission)}`,
      valueColor: colors.error,
    },
  ];

  function handleDownloadInvoice() {
    navigation.navigate('DownloadInvoice', { settlementId });
  }

  return (
    <ScreenContainer scrollable={false} backgroundColor={colors.white}>
      <NavHeader title="Settlement Details" onBack={() => navigation.goBack()} />
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.settlementId}>{settlement.id}</Text>
            <Text style={styles.dateRange}>{settlement.dateRangeLabel}</Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: status.background }]}>
            <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.breakdownCard}>
          {breakdownRows.map((row, index) => (
            <View key={row.key} style={[styles.breakdownRow, index < breakdownRows.length - 1 && styles.breakdownRowDivider]}>
              <Text style={[styles.rowLabel, row.emphasize && styles.rowLabelEmphasize]}>{row.label}</Text>
              <Text
                style={[
                  styles.rowValue,
                  row.emphasize && styles.rowValueEmphasize,
                  row.valueColor ? { color: row.valueColor } : null,
                ]}
              >
                {row.value}
              </Text>
            </View>
          ))}
          <View style={styles.netPayoutRow}>
            <Text style={styles.netPayoutLabel}>Net Payout</Text>
            <Text style={styles.netPayoutValue}>{formatINR(settlement.netPayout)}</Text>
          </View>
        </View>

        <View style={styles.bankCard}>
          <Text style={styles.bankCardTitle}>Bank Details</Text>
          <View style={styles.bankRow}>
            <Text style={styles.bankAccountLabel}>{settlement.bankAccountLabel}</Text>
            <Icon name="credit-card" size={20} color={colors.textSecondary} />
          </View>
          {settlement.transactionRef ? (
            <Text style={styles.transactionRefText}>
              Transaction Ref: <Text style={styles.transactionRefValue}>{settlement.transactionRef}</Text>
            </Text>
          ) : null}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Download Invoice"
          onPress={handleDownloadInvoice}
          icon={<Icon name="file-text" size={18} color={colors.white} />}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  notFoundText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settlementId: {
    ...typography.h3,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  dateRange: {
    ...typography.label,
    color: colors.textSecondary,
    paddingTop: 3,
  },
  statusPill: {
    borderRadius: radii.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  statusText: {
    ...typography.labelSemibold,
  },
  breakdownCard: {
    marginTop: spacing.xl,
    marginHorizontal: spacing.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  breakdownRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  rowLabelEmphasize: {
    ...typography.bodySemibold,
    color: colors.textSecondary,
  },
  rowValue: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  rowValueEmphasize: {
    ...typography.bodySemibold,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  netPayoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.primarySurface,
  },
  netPayoutLabel: {
    ...typography.bodySemibold,
    color: colors.textSecondary,
  },
  netPayoutValue: {
    ...typography.bodySemibold,
    fontWeight: '700',
    color: colors.primary,
  },
  bankCard: {
    marginTop: spacing.xl,
    marginHorizontal: spacing.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.xl,
  },
  bankCardTitle: {
    ...typography.label,
    color: colors.textSecondary,
  },
  bankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
  },
  bankAccountLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  transactionRefText: {
    ...typography.caption,
    color: colors.textSecondary,
    paddingTop: spacing.md,
  },
  transactionRefValue: {
    ...typography.captionSemibold,
    color: colors.textPrimary,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
});
