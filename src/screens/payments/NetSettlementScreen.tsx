import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { NavHeader, ScreenContainer } from '../../components';
import { usePayments } from '../../context/PaymentsContext';
import { colors, radii, spacing, typography } from '../../theme';
import { PeriodFilterBar } from './PeriodFilterBar';
import { formatINR, sumBy } from './settlementHelpers';

type Props = NativeStackScreenProps<AuthStackParamList, 'NetSettlement'>;

export function NetSettlementScreen({ navigation }: Props) {
  const { filteredSettlements, periodLabel } = usePayments();

  const totals = useMemo(
    () => ({
      gross: sumBy(filteredSettlements, s => s.grossSales),
      returns: sumBy(filteredSettlements, s => s.returns),
      commission: sumBy(filteredSettlements, s => s.commission),
      gst: sumBy(filteredSettlements, s => s.gstOnCommission),
      adjustments: sumBy(filteredSettlements, s => s.adjustments),
      net: sumBy(filteredSettlements, s => s.netPayout),
    }),
    [filteredSettlements],
  );
  const bankAccountLabel = filteredSettlements.find(s => s.bankAccountLabel)?.bankAccountLabel;

  const totalDeductions = Math.max(0, totals.gross - totals.net);
  const netRatio = totals.gross > 0 ? totals.net / totals.gross : 1;
  const netFlex = Math.max(netRatio, 0.001);
  const deductionFlex = Math.max(1 - netRatio, 0.001);
  const hasDeductions = totalDeductions > 0;

  return (
    <ScreenContainer scrollable={false} backgroundColor={colors.white}>
      <NavHeader title="Net Settlement" onBack={() => navigation.goBack()} />
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.filterBarWrap}>
          <PeriodFilterBar />
        </View>

        <View style={styles.heroBlock}>
          <Text style={styles.heroLabel}>Net Payout · {periodLabel}</Text>
          <Text style={styles.heroAmount}>{formatINR(totals.net)}</Text>
          <Text style={styles.heroSublabel}>
            of {formatINR(totals.gross)} gross sales across {filteredSettlements.length} settlement
            {filteredSettlements.length === 1 ? '' : 's'}
          </Text>
        </View>

        <View style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>Gross → Net Breakdown</Text>
          <View style={styles.barTrack}>
            <View style={[styles.barSegmentNet, { flex: netFlex }]}>
              <Text style={styles.barSegmentNetText} numberOfLines={1}>
                Net {formatINR(totals.net)}
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
            <Text style={[styles.tagText, styles.tagTextCommission]}>Commission: {formatINR(totals.commission)}</Text>
          </View>
          <View style={[styles.tag, styles.tagGst]}>
            <Text style={[styles.tagText, styles.tagTextGst]}>GST: {formatINR(totals.gst)}</Text>
          </View>
          {totals.returns ? (
            <View style={[styles.tag, styles.tagAdjustments]}>
              <Text style={[styles.tagText, styles.tagTextAdjustments]}>Returns: {formatINR(totals.returns)}</Text>
            </View>
          ) : null}
          {totals.adjustments ? (
            <View style={[styles.tag, styles.tagAdjustments]}>
              <Text style={[styles.tagText, styles.tagTextAdjustments]}>Adjustments: {formatINR(totals.adjustments)}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.bankCard}>
          <View style={styles.bankCardRow}>
            <View style={styles.bankCardText}>
              <Text style={styles.bankCardLabel}>Bank Account</Text>
              <Text style={styles.bankCardValue}>{bankAccountLabel ?? 'Not linked to these settlements yet'}</Text>
            </View>
            <Text style={styles.updateLink} onPress={() => navigation.navigate('ProfileBankDetails')}>
              Manage →
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
  bankCardText: {
    flex: 1,
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
