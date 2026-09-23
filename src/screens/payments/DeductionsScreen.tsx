import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { NavHeader, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { usePayments } from '../../context/PaymentsContext';
import { colors, radii, spacing, typography } from '../../theme';
import { PeriodFilterBar, PaymentsPeriod } from './PeriodFilterBar';

type Props = NativeStackScreenProps<AuthStackParamList, 'Deductions'>;

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

export function DeductionsScreen({ navigation }: Props) {
  const { weeklyCommission, weeklyTaxes, weeklyAdjustments, settlements } = usePayments();
  const [period, setPeriod] = useState<PaymentsPeriod>('month');

  const commissionTotal = useMemo(() => sum(weeklyCommission.map(row => row.amount)), [weeklyCommission]);
  const taxesTotal = useMemo(() => sum(weeklyTaxes.map(row => row.amount)), [weeklyTaxes]);
  const adjustmentsTotal = useMemo(() => sum(weeklyAdjustments.map(row => row.amount)), [weeklyAdjustments]);
  const grossSalesTotal = useMemo(() => sum(settlements.map(settlement => settlement.grossSales)), [settlements]);

  const totalDeductions = commissionTotal + taxesTotal + adjustmentsTotal;
  const percentOfGross = grossSalesTotal > 0 ? (totalDeductions / grossSalesTotal) * 100 : 0;

  const categories = [
    {
      key: 'commission' as const,
      label: 'Platform Commission',
      sublabel: '8% of sales',
      amount: commissionTotal,
      barColor: '#FB923C',
      amountColor: '#FB923C',
      route: 'Commission' as const,
    },
    {
      key: 'taxes' as const,
      label: 'GST on Commission',
      sublabel: '18% of commission',
      amount: taxesTotal,
      barColor: '#A855F7',
      amountColor: '#A855F7',
      route: 'Taxes' as const,
    },
    {
      key: 'adjustments' as const,
      label: 'Return Adjustments',
      sublabel: '0.5% of sales',
      amount: adjustmentsTotal,
      barColor: colors.error,
      amountColor: colors.error,
      route: 'Adjustments' as const,
    },
  ];

  return (
    <ScreenContainer edges={['top', 'left', 'right', 'bottom']}>
      <NavHeader title="Deductions" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.filterWrap}>
          <PeriodFilterBar value={period} onChange={setPeriod} />
        </View>

        <View style={styles.summaryMargin}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Deductions</Text>
            <Text style={styles.summaryValue}>₹{totalDeductions.toLocaleString('en-IN')}</Text>
            <Text style={styles.summarySublabel}>{percentOfGross.toFixed(2)}% of gross sales</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Breakdown</Text>

        <View style={styles.rowsCard}>
          {categories.map(category => (
            <Pressable
              key={category.key}
              style={styles.row}
              onPress={() => navigation.navigate(category.route)}
            >
              <View style={[styles.rowBar, { backgroundColor: category.barColor }]} />
              <View style={styles.rowTextColumn}>
                <Text style={styles.rowLabel}>{category.label}</Text>
                <Text style={styles.rowSublabel}>{category.sublabel}</Text>
              </View>
              <View style={styles.rowAmountColumn}>
                <Text style={[styles.rowAmount, { color: category.amountColor }]}>
                  ₹{category.amount.toLocaleString('en-IN')}
                </Text>
                <Icon name="info" size={16} color={colors.textTertiary} />
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.infoMargin}>
          <Pressable style={styles.infoButton}>
            <Text style={styles.infoButtonLabel}>How deductions work</Text>
            <Icon name="chevron-down" size={16} color={colors.textPrimary} />
          </Pressable>
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
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
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
  rowsCard: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowBar: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },
  rowTextColumn: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  rowSublabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  rowAmountColumn: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  rowAmount: {
    fontFamily: typography.h3.fontFamily,
    fontSize: 15,
    lineHeight: 22.5,
  },
  infoMargin: {
    padding: spacing.xl,
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  infoButtonLabel: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
});
