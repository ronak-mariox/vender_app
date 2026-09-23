import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { NavHeader, ScreenContainer } from '../../components';
import { usePayments } from '../../context/PaymentsContext';
import { colors, radii, spacing, typography } from '../../theme';
import { PeriodFilterBar, PaymentsPeriod } from './PeriodFilterBar';

type Props = NativeStackScreenProps<AuthStackParamList, 'Taxes'>;

const GST_PURPLE = '#A855F7';

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

export function TaxesScreen({ navigation }: Props) {
  const { weeklyCommission, weeklyTaxes } = usePayments();
  const [period, setPeriod] = useState<PaymentsPeriod>('month');

  const commissionTotal = useMemo(() => sum(weeklyCommission.map(row => row.amount)), [weeklyCommission]);
  const gstTotal = useMemo(() => sum(weeklyTaxes.map(row => row.amount)), [weeklyTaxes]);

  return (
    <ScreenContainer edges={['top', 'left', 'right', 'bottom']}>
      <NavHeader title="Tax Deductions" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.banner, styles.purpleBanner]}>
          <Text style={styles.purpleBannerText}>
            GST on platform commission: <Text style={styles.bold}>18% of commission amount</Text>
          </Text>
        </View>

        <PeriodFilterBar value={period} onChange={setPeriod} />

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>GST This Month</Text>
          <Text style={styles.summaryValue}>₹{gstTotal.toLocaleString('en-IN')}</Text>
          <Text style={styles.formulaText}>
            Commission ₹{commissionTotal.toLocaleString('en-IN')} × 18% ={' '}
            <Text style={styles.formulaHighlight}>₹{gstTotal.toLocaleString('en-IN')}</Text>
          </Text>
        </View>

        <View style={[styles.banner, styles.amberBanner]}>
          <Text style={styles.amberBannerText}>
            GST collected on Verdant&apos;s service fee, not on your product sales.
          </Text>
        </View>

        <View style={[styles.banner, styles.blueBanner]}>
          <Text style={styles.blueBannerText}>
            You may claim input tax credit on this GST. Consult your CA for guidance.
          </Text>
        </View>

        <View style={styles.tdsCard}>
          <Text style={styles.tdsTitle}>TDS Deductions</Text>
          <View style={styles.tdsRow}>
            <Text style={styles.tdsRowLabel}>TDS Deducted This Month</Text>
            <Text style={styles.tdsRowValue}>₹0</Text>
          </View>
          <Text style={styles.tdsCaption}>No TDS applicable — GST registered vendor</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.xl,
    gap: spacing.xl,
    paddingBottom: spacing.huge,
  },
  banner: {
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  purpleBanner: {
    backgroundColor: '#FAF5FF',
    borderColor: '#E9D5FF',
  },
  purpleBannerText: {
    ...typography.label,
    color: '#6B21A8',
  },
  amberBanner: {
    backgroundColor: colors.warningSurface,
    borderColor: '#FDE68A',
  },
  amberBannerText: {
    ...typography.label,
    color: colors.warningDark,
  },
  blueBanner: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  blueBannerText: {
    ...typography.label,
    color: '#1E40AF',
  },
  bold: {
    fontWeight: '700',
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.xl,
    gap: spacing.md,
  },
  summaryLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontFamily: typography.h1.fontFamily,
    fontSize: 28,
    lineHeight: 42,
    color: GST_PURPLE,
  },
  formulaText: {
    ...typography.label,
    color: colors.textSecondary,
  },
  formulaHighlight: {
    ...typography.labelSemibold,
    color: GST_PURPLE,
  },
  tdsCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  tdsTitle: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  tdsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tdsRowLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  tdsRowValue: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  tdsCaption: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
