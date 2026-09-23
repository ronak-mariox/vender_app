import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { NavHeader, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { usePayments } from '../../context/PaymentsContext';
import { colors, radii, spacing, typography } from '../../theme';
import { PeriodFilterBar, PaymentsPeriod } from './PeriodFilterBar';

type Props = NativeStackScreenProps<AuthStackParamList, 'Adjustments'>;

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

// Illustrative entries — PaymentsContext only exposes aggregate weekly adjustment
// totals, not individual line items, so these mirror the Figma mock content.
const ADJUSTMENT_ENTRIES = [
  { id: 'VD8821', title: 'Return Refund', reference: 'Order #VD8821', dateLabel: '2 Nov 2024', amount: 248 },
  { id: 'VD8744', title: 'Return Refund', reference: 'Order #VD8744', dateLabel: '31 Oct 2024', amount: 312 },
  { id: 'DSP-441', title: 'Dispute Resolution', reference: 'Case #DSP-441', dateLabel: '28 Oct 2024', amount: 420 },
];

export function AdjustmentsScreen({ navigation }: Props) {
  const { weeklyAdjustments } = usePayments();
  const [period, setPeriod] = useState<PaymentsPeriod>('month');

  const adjustmentsTotal = useMemo(() => sum(weeklyAdjustments.map(row => row.amount)), [weeklyAdjustments]);

  return (
    <ScreenContainer edges={['top', 'left', 'right', 'bottom']}>
      <NavHeader title="Adjustments" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.filterWrap}>
          <PeriodFilterBar value={period} onChange={setPeriod} />
        </View>

        <View style={styles.summaryMargin}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Adjustments</Text>
            <Text style={styles.summaryValue}>-₹{adjustmentsTotal.toLocaleString('en-IN')}</Text>
            <Text style={styles.summarySublabel}>{ADJUSTMENT_ENTRIES.length} entries this period</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Adjustment Entries</Text>

        <View style={styles.entriesCard}>
          {ADJUSTMENT_ENTRIES.map((entry, index) => (
            <View
              key={entry.id}
              style={[styles.entryRow, index < ADJUSTMENT_ENTRIES.length - 1 && styles.entryRowDivider]}
            >
              <View style={styles.entryIcon}>
                <Icon name="alert-circle" size={16} color={colors.error} />
              </View>
              <View style={styles.entryTextColumn}>
                <Text style={styles.entryTitle}>{entry.title}</Text>
                <Text style={styles.entryReference}>{entry.reference}</Text>
                <Text style={styles.entryDate}>{entry.dateLabel}</Text>
              </View>
              <Text style={styles.entryAmount}>-₹{entry.amount.toLocaleString('en-IN')}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footerMargin}>
          <View style={styles.footerCard}>
            <Text style={styles.footerText}>
              Adjustments reflect customer returns and dispute outcomes. Amounts are deducted from your settlement.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.huge,
  },
  filterWrap: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  summaryMargin: {
    paddingHorizontal: spacing.xl,
  },
  summaryCard: {
    backgroundColor: colors.errorSurface,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: radii.md,
    padding: spacing.xl,
  },
  summaryLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontFamily: typography.h1.fontFamily,
    fontSize: 28,
    lineHeight: 42,
    color: colors.error,
    paddingTop: spacing.xxs,
  },
  summarySublabel: {
    ...typography.caption,
    color: colors.textSecondary,
    paddingTop: spacing.xs,
  },
  sectionTitle: {
    ...typography.bodySemibold,
    fontSize: 15,
    color: colors.textPrimary,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  entriesCard: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  entryRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  entryIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: colors.errorSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryTextColumn: {
    flex: 1,
    gap: 2,
  },
  entryTitle: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  entryReference: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  entryDate: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  entryAmount: {
    fontFamily: typography.h3.fontFamily,
    fontSize: 15,
    lineHeight: 22.5,
    color: colors.error,
  },
  footerMargin: {
    padding: spacing.xl,
  },
  footerCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  footerText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
