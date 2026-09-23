import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { NavHeader, ScreenContainer } from '../../components';
import { usePayments } from '../../context/PaymentsContext';
import { colors, radii, spacing, typography } from '../../theme';
import { PeriodFilterBar, PaymentsPeriod } from './PeriodFilterBar';

type Props = NativeStackScreenProps<AuthStackParamList, 'NetSettlement'>;

function formatINR(value: number): string {
  return `₹${Math.round(Math.abs(value)).toLocaleString('en-IN')}`;
}

export function NetSettlementScreen({ navigation, route }: Props) {
  const { settlementId } = route.params;
  const { getSettlement } = usePayments();
  const settlement = getSettlement(settlementId);
  const [period, setPeriod] = useState<PaymentsPeriod>('month');

  if (!settlement) {
    return (
      <ScreenContainer scrollable={false} backgroundColor={colors.white}>
        <NavHeader title="Net Settlement" onBack={() => navigation.goBack()} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Settlement not found</Text>
        </View>
      </ScreenContainer>
    );
  }

  const totalDeductions = settlement.grossSales - settlement.netPayout;
  const netRatio = settlement.grossSales > 0 ? settlement.netPayout / settlement.grossSales : 1;
  const netFlex = Math.max(netRatio, 0.001);
  const deductionFlex = Math.max(1 - netRatio, 0.001);
  const hasDeductions = totalDeductions > 0;

  function handleUpdateBank() {
    Alert.alert('Coming soon', 'Updating bank account details will be available soon.');
  }

  return (
    <ScreenContainer scrollable={false} backgroundColor={colors.white}>
      <NavHeader title="Net Settlement" onBack={() => navigation.goBack()} />
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.filterBarWrap}>
          <PeriodFilterBar value={period} onChange={setPeriod} />
        </View>

        <View style={styles.heroBlock}>
          <Text style={styles.heroLabel}>Net Payout</Text>
          <Text style={styles.heroAmount}>{formatINR(settlement.netPayout)}</Text>
          <Text style={styles.heroSublabel}>of {formatINR(settlement.grossSales)} gross sales</Text>
        </View>

        <View style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>Gross → Net Breakdown</Text>
          <View style={styles.barTrack}>
            <View style={[styles.barSegmentNet, { flex: netFlex }]}>
              <Text style={styles.barSegmentNetText} numberOfLines={1}>
                Net {formatINR(settlement.netPayout)}
              </Text>
            </View>
            {hasDeductions ? (
              <View style={[styles.barSegmentDeduction, { flex: deductionFlex }]}>
                <Text style={styles.barSegmentDeductionText} numberOfLines={1}>
                  -{formatINR(totalDeductions)}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.tagRow}>
          <View style={[styles.tag, styles.tagCommission]}>
            <Text style={[styles.tagText, styles.tagTextCommission]}>Commission: {formatINR(settlement.commission)}</Text>
          </View>
          <View style={[styles.tag, styles.tagGst]}>
            <Text style={[styles.tagText, styles.tagTextGst]}>GST: {formatINR(settlement.gstOnCommission)}</Text>
          </View>
          <View style={[styles.tag, styles.tagAdjustments]}>
            <Text style={[styles.tagText, styles.tagTextAdjustments]}>Adjustments: {formatINR(settlement.adjustments)}</Text>
          </View>
        </View>

        {settlement.dueDateLabel ? (
          <View style={styles.nextSettlementCard}>
            <Text style={styles.nextSettlementLabel}>Next Settlement</Text>
            <Text style={styles.nextSettlementValue}>
              {settlement.dueDateLabel} · {formatINR(settlement.netPayout)}
            </Text>
          </View>
        ) : null}

        <View style={styles.bankCard}>
          <View style={styles.bankCardRow}>
            <View>
              <Text style={styles.bankCardLabel}>Bank Account</Text>
              <Text style={styles.bankCardValue}>{settlement.bankAccountLabel}</Text>
            </View>
            <Text style={styles.updateLink} onPress={handleUpdateBank}>
              Update →
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.huge,
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
  filterBarWrap: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  heroBlock: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  heroLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  heroAmount: {
    fontFamily: typography.h1.fontFamily,
    fontSize: 38,
    lineHeight: 57,
    color: colors.primary,
    paddingTop: spacing.xs,
  },
  heroSublabel: {
    ...typography.label,
    color: colors.textSecondary,
    paddingTop: spacing.xs,
  },
  breakdownCard: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.xl,
  },
  breakdownTitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  barTrack: {
    flexDirection: 'row',
    height: 32,
    borderRadius: radii.full,
    overflow: 'hidden',
    marginTop: spacing.lg,
    backgroundColor: colors.errorSurface,
  },
  barSegmentNet: {
    backgroundColor: colors.primary,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  barSegmentNetText: {
    ...typography.tinyBold,
    color: colors.white,
  },
  barSegmentDeduction: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  barSegmentDeductionText: {
    ...typography.tiny,
    color: colors.error,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  tag: {
    borderWidth: 1.5,
    borderRadius: radii.full,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  tagText: {
    ...typography.label,
  },
  tagCommission: {
    borderColor: '#FB923C',
  },
  tagTextCommission: {
    color: '#FB923C',
  },
  tagGst: {
    borderColor: '#A855F7',
  },
  tagTextGst: {
    color: '#A855F7',
  },
  tagAdjustments: {
    borderColor: colors.error,
  },
  tagTextAdjustments: {
    color: colors.error,
  },
  nextSettlementCard: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    backgroundColor: colors.primarySurface,
    borderRadius: radii.md,
    padding: spacing.xl,
  },
  nextSettlementLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  nextSettlementValue: {
    ...typography.h3,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textPrimary,
    paddingTop: spacing.xs,
  },
  bankCard: {
    marginHorizontal: spacing.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.xl,
  },
  bankCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bankCardLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  bankCardValue: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
    paddingTop: 2,
  },
  updateLink: {
    ...typography.label,
    color: colors.primary,
  },
});
