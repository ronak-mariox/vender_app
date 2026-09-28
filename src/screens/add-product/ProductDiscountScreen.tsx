import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { AddProductHeader, Button, FormSectionCard, ScreenContainer } from '../../components';
import { ADD_PRODUCT_TOTAL_STEPS, useProductDraft } from '../../context/ProductDraftContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProductDiscount'>;

type DiscountMode = 'percentage' | 'fixed';

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

function discountFromPrice(mrp: number, price: number, mode: DiscountMode): string {
  if (!mrp || price >= mrp) return '0';
  const off = mode === 'percentage' ? ((mrp - price) / mrp) * 100 : mrp - price;
  return String(round2(off));
}

function priceFromDiscount(mrp: number, mode: DiscountMode, rawValue: string): number {
  const numeric = parseFloat(rawValue);
  if (!mrp || Number.isNaN(numeric) || numeric <= 0) return mrp;
  const discounted = mode === 'percentage' ? mrp - (mrp * numeric) / 100 : mrp - numeric;
  return round2(Math.max(0, discounted));
}

/** Optional helper step: the discount is not stored — it only derives the selling price from the MRP. */
export function ProductDiscountScreen({ navigation }: Props) {
  const { draft, updatePricing } = useProductDraft();
  const mrp = parseFloat(draft.pricing?.mrp ?? '0') || 0;
  const currentPrice = parseFloat(draft.pricing?.sellingPrice ?? '') || mrp;

  const [mode, setMode] = useState<DiscountMode>('percentage');
  const [value, setValue] = useState(() => discountFromPrice(mrp, currentPrice, 'percentage'));
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const previewSellingPrice = useMemo(
    () => (dirty ? priceFromDiscount(mrp, mode, value) : currentPrice),
    [dirty, mrp, mode, value, currentPrice],
  );

  function switchMode(next: DiscountMode) {
    if (next === mode) return;
    setMode(next);
    setValue(discountFromPrice(mrp, previewSellingPrice, next));
    setError(undefined);
  }

  function handleContinue() {
    if (dirty) {
      const trimmed = value.trim();
      const numeric = parseFloat(trimmed || '0');
      if (Number.isNaN(numeric) || numeric < 0) {
        setError('Enter a valid discount');
        return;
      }
      if (mode === 'percentage' && numeric >= 100) {
        setError('Discount must be less than 100%');
        return;
      }
      if (mode === 'fixed' && numeric >= mrp) {
        setError('Discount must be less than the MRP');
        return;
      }
      updatePricing({ sellingPrice: String(previewSellingPrice) });
    }
    navigation.navigate('ProductTaxInfo');
  }

  const percentOff = mrp > 0 && previewSellingPrice < mrp ? ((mrp - previewSellingPrice) / mrp) * 100 : 0;

  return (
    <ScreenContainer backgroundColor={colors.surface}>
      <AddProductHeader
        title="Discount"
        currentStep={6}
        totalSteps={ADD_PRODUCT_TOTAL_STEPS}
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <FormSectionCard>
          <Text style={styles.previewText}>
            Your discount is the difference between MRP and selling price. Adjust it here to update the selling price.
          </Text>
          <View style={styles.modeRow}>
            <Pressable
              style={[styles.modeOption, mode === 'percentage' && styles.modeOptionActive]}
              onPress={() => switchMode('percentage')}
            >
              <Text style={[styles.modeText, mode === 'percentage' && styles.modeTextActive]}>Percentage (%)</Text>
            </Pressable>
            <Pressable
              style={[styles.modeOption, mode === 'fixed' && styles.modeOptionActive]}
              onPress={() => switchMode('fixed')}
            >
              <Text style={[styles.modeText, mode === 'fixed' && styles.modeTextActive]}>Fixed Amount (₹)</Text>
            </Pressable>
          </View>

          <View>
            <Text style={styles.label}>Discount ({mode === 'percentage' ? '%' : '₹'})</Text>
            <View style={[styles.amountField, error && styles.amountFieldError]}>
              <TextInput
                value={value}
                onChangeText={text => {
                  setValue(text.replace(/[^0-9.]/g, ''));
                  setDirty(true);
                  if (error) setError(undefined);
                }}
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
                keyboardType="decimal-pad"
                style={styles.amountInput}
              />
              <Text style={styles.amountSuffix}>{mode === 'percentage' ? '%' : '₹'}</Text>
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <View style={styles.previewRow}>
            <Text style={styles.previewText}>
              MRP ₹{mrp.toFixed(2)} → Selling ₹{previewSellingPrice.toFixed(2)}
            </Text>
            <Text style={styles.previewBadge}>{percentOff > 0 ? `${percentOff.toFixed(1)}% off` : 'No discount'}</Text>
          </View>
        </FormSectionCard>

        <View style={styles.footer}>
          <Button label="Continue" onPress={handleContinue} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },
  modeRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  modeOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  modeOptionActive: {
    backgroundColor: colors.primarySurface,
    borderColor: colors.primary,
  },
  modeText: {
    ...typography.bodySemibold,
    fontFamily: fontFamilies.medium,
    color: colors.textSecondary,
  },
  modeTextActive: {
    color: colors.primary,
    fontFamily: fontFamilies.bold,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  amountField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radii.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.white,
  },
  amountFieldError: {
    borderColor: colors.error,
    backgroundColor: colors.errorSurface,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    paddingTop: spacing.xs,
  },
  amountInput: {
    fontSize: 26,
    fontFamily: fontFamilies.extrabold,
    color: colors.warningDark,
    padding: 0,
    flex: 1,
  },
  amountSuffix: {
    ...typography.h2,
    fontSize: 22,
    color: colors.textSecondary,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
  },
  previewText: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.textSecondary,
  },
  previewBadge: {
    ...typography.labelSemibold,
    color: colors.warningDark,
  },
  footer: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
});
