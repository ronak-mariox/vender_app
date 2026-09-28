import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { AddProductHeader, Button, FormSectionCard, ScreenContainer } from '../../components';
import { ADD_PRODUCT_TOTAL_STEPS, useProductDraft } from '../../context/ProductDraftContext';
import {
  GST_ON_FEE_PERCENT_LABEL,
  GST_ON_FEE_RATE,
  PLATFORM_FEE_PERCENT_LABEL,
  PLATFORM_FEE_RATE,
} from '../../constants/fees';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProductSellingPrice'>;

export function ProductSellingPriceScreen({ navigation }: Props) {
  const { draft, updatePricing } = useProductDraft();

  const mrp = parseFloat(draft.pricing?.mrp ?? '0') || 0;
  const [sellingPrice, setSellingPrice] = useState(draft.pricing?.sellingPrice ?? '');
  const [error, setError] = useState<string | undefined>();

  const sp = parseFloat(sellingPrice) || 0;
  const savings = useMemo(() => (mrp > sp ? mrp - sp : 0), [mrp, sp]);
  const savingsPercent = useMemo(() => (mrp > 0 && savings > 0 ? (savings / mrp) * 100 : 0), [mrp, savings]);

  const platformFee = sp * PLATFORM_FEE_RATE;
  const gstOnFee = platformFee * GST_ON_FEE_RATE;
  const netPayout = sp - platformFee - gstOnFee;

  function handleContinue() {
    if (!sellingPrice.trim() || sp <= 0) {
      setError('Enter a valid selling price');
      return;
    }
    if (sp > mrp) {
      setError('Selling price cannot exceed MRP');
      return;
    }
    updatePricing({ sellingPrice: sellingPrice.trim() });
    navigation.navigate('ProductDiscount');
  }

  return (
    <ScreenContainer backgroundColor={colors.surface}>
      <AddProductHeader
        title="Selling Price"
        currentStep={6}
        totalSteps={ADD_PRODUCT_TOTAL_STEPS}
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <FormSectionCard>
          <View>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Selling Price (₹)</Text>
              <Text style={styles.required}> *</Text>
            </View>
            <View style={[styles.amountField, error && styles.amountFieldError]}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                value={sellingPrice}
                onChangeText={text => {
                  setSellingPrice(text.replace(/[^0-9.]/g, ''));
                  if (error) setError(undefined);
                }}
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
                keyboardType="decimal-pad"
                style={styles.amountInput}
              />
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <View style={styles.summaryCard}>
            <SummaryRow label="MRP" value={`₹${mrp || 0}`} />
            <SummaryRow label="Selling Price" value={`₹${sp || 0}`} valueColor={colors.primary} bold />
            <View style={styles.divider} />
            <SummaryRow
              label="Customer Saves"
              value={savings > 0 ? `₹${savings.toFixed(0)} (${savingsPercent.toFixed(1)}%)` : '—'}
              valueColor={colors.warningDark}
              bold
            />
          </View>

          <View style={styles.earningsCard}>
            <Text style={styles.earningsTitle}>Your Earnings Estimate</Text>
            <SummaryRow label="Selling Price" value={`₹${sp.toFixed(2)}`} light />
            <SummaryRow label={`Platform Fee (${PLATFORM_FEE_PERCENT_LABEL})`} value={`-₹${platformFee.toFixed(2)}`} valueColor={colors.error} light />
            <SummaryRow label={`GST on Fee (${GST_ON_FEE_PERCENT_LABEL})`} value={`-₹${gstOnFee.toFixed(2)}`} valueColor={colors.error} light />
            <View style={styles.earningsDivider} />
            <SummaryRow label="Net Payout" value={`₹${netPayout.toFixed(2)}`} valueColor={colors.primary} bold />
          </View>
        </FormSectionCard>

        <View style={styles.footer}>
          <Button label="Continue" onPress={handleContinue} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function SummaryRow({
  label,
  value,
  valueColor,
  bold,
  light,
}: {
  label: string;
  value: string;
  valueColor?: string;
  bold?: boolean;
  light?: boolean;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, light && styles.summaryLabelLight]}>{label}</Text>
      <Text
        style={[
          styles.summaryValue,
          bold && styles.summaryValueBold,
          valueColor ? { color: valueColor } : null,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },
  labelRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
  },
  required: {
    ...typography.label,
    color: colors.error,
  },
  amountField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    height: 56,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radii.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.white,
  },
  amountFieldError: {
    borderColor: colors.error,
  },
  currencySymbol: {
    ...typography.h2,
    fontSize: 22,
    color: colors.textSecondary,
  },
  amountInput: {
    flex: 1,
    fontSize: 28,
    fontFamily: fontFamilies.extrabold,
    color: colors.primary,
    padding: 0,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.sm,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
  },
  earningsCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: 2,
  },
  earningsTitle: {
    ...typography.tinyBold,
    color: colors.primaryDark,
    marginBottom: spacing.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  summaryLabelLight: {
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typography.label,
    color: colors.textPrimary,
  },
  summaryValueBold: {
    ...typography.labelSemibold,
    fontFamily: fontFamilies.bold,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  earningsDivider: {
    height: 1,
    backgroundColor: colors.primaryBorder,
    marginVertical: spacing.xs,
  },
  footer: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
});
