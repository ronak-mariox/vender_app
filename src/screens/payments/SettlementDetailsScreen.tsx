import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, NavHeader, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { usePayments } from '../../context/PaymentsContext';
import { getApiErrorMessage } from '../../services/api';
import { colors, radii, spacing, typography } from '../../theme';
import { SETTLEMENT_STATUS_META, formatINRExact, formatSignedINRExact, settlementBreakdown } from './settlementHelpers';

type Props = NativeStackScreenProps<AuthStackParamList, 'SettlementDetails'>;

export function SettlementDetailsScreen({ navigation, route }: Props) {
  const { settlementId } = route.params;
  const { getSettlement, fetchSettlement } = usePayments();
  const settlement = getSettlement(settlementId);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (settlement) return;
    let cancelled = false;
    fetchSettlement(settlementId).catch(err => {
      if (!cancelled) setLoadError(getApiErrorMessage(err, 'Settlement not found'));
    });
    return () => {
      cancelled = true;
    };
  }, [settlement, settlementId, fetchSettlement]);

  if (!settlement) {
    return (
      <ScreenContainer scrollable={false} backgroundColor={colors.white}>
        <NavHeader title="Settlement Details" onBack={() => navigation.goBack()} />
        <View style={styles.notFound}>
          {loadError ? (
            <Text style={styles.notFoundText}>{loadError}</Text>
          ) : (
            <ActivityIndicator color={colors.primary} />
          )}
        </View>
      </ScreenContainer>
    );
  }

  const status = SETTLEMENT_STATUS_META[settlement.status];
  const breakdownRows = settlementBreakdown(settlement);

  return (
    <ScreenContainer scrollable={false} backgroundColor={colors.white}>
      <NavHeader title="Settlement Details" onBack={() => navigation.goBack()} />
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.settlementId}>{settlement.shortRef}</Text>
            <Text style={styles.dateRange}>{settlement.dateRangeLabel}</Text>
            <Text style={styles.dateRange}>
              {settlement.settlementCount} order{settlement.settlementCount === 1 ? '' : 's'} settled
            </Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: status.background }]}>
            <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
          </View>
        </View>

        {settlement.status === 'failed' && settlement.failureReason ? (
          <View style={styles.failureBox}>
            <Icon name="alert-circle" size={16} color={colors.error} />
            <Text style={styles.failureText}>{settlement.failureReason}</Text>
          </View>
        ) : null}

        <View style={styles.breakdownCard}>
          {breakdownRows.map((row, index) => (
            <View key={row.key} style={[styles.breakdownRow, index < breakdownRows.length - 1 && styles.breakdownRowDivider]}>
              <Text style={styles.rowLabel}>{row.label}</Text>
              <Text style={[styles.rowValue, row.amount < 0 ? { color: colors.error } : null]}>
                {formatSignedINRExact(row.amount)}
              </Text>
            </View>
          ))}
          <View style={styles.netPayoutRow}>
            <Text style={styles.netPayoutLabel}>Net Payout</Text>
            <Text style={styles.netPayoutValue}>{formatINRExact(settlement.netPayout)}</Text>
          </View>
        </View>

        {settlement.bankAccountLabel || settlement.transactionRef ? (
          <View style={styles.bankCard}>
            <Text style={styles.bankCardTitle}>Payout Details</Text>
            {settlement.bankAccountLabel ? (
              <View style={styles.bankRow}>
                <Text style={styles.bankAccountLabel}>{settlement.bankAccountLabel}</Text>
                <Icon name="credit-card" size={20} color={colors.textSecondary} />
              </View>
            ) : null}
            {settlement.transactionRef ? (
              <Text style={styles.transactionRefText}>
                Transaction Ref: <Text style={styles.transactionRefValue}>{settlement.transactionRef}</Text>
              </Text>
            ) : null}
            {settlement.transactionDateLabel ? (
              <Text style={styles.transactionRefText}>
                Paid on: <Text style={styles.transactionRefValue}>{settlement.transactionDateLabel}</Text>
              </Text>
            ) : null}
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="View Invoice"
          onPress={() => navigation.navigate('ViewInvoice', { settlementId })}
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
  failureBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginHorizontal: spacing.xl,
    padding: spacing.md,
    borderRadius: radii.sm,
    backgroundColor: colors.errorSurface,
  },
  failureText: {
    ...typography.caption,
    color: colors.error,
    flex: 1,
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
    flex: 1,
  },
  rowValue: {
    ...typography.bodyMedium,
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
