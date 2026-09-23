import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { AddProductHeader, Button, FormSectionCard, ScreenContainer, Switch } from '../../components';
import { DiscountMode, useProductDraft } from '../../context/ProductDraftContext';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { type FormErrors } from '../../utils/validators';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProductDiscount'>;

function computeDiscountedPrice(mrp: number, mode: DiscountMode, rawValue: string): number {
  const numeric = parseFloat(rawValue);
  if (!mrp || Number.isNaN(numeric) || numeric <= 0) return mrp;
  const discounted = mode === 'percentage' ? mrp - (mrp * numeric) / 100 : mrp - numeric;
  return Math.max(0, discounted);
}

export function ProductDiscountScreen({ navigation }: Props) {
  const { draft, updatePricing, updateDiscount, computedDiscountPercent } = useProductDraft();
  const { categories } = useProductCatalog();
  const category = categories.find(c => c.id === draft.category?.categoryId);
  const subcategory = category?.subcategories.find(s => s.id === draft.category?.subcategoryId);
  const variantConfig = subcategory?.variantConfig ?? category?.variantConfig;
  const isAttributeKind = variantConfig?.kind === 'attribute';

  const mrp = parseFloat(draft.pricing?.mrp ?? '0') || 0;

  const [mode, setMode] = useState<DiscountMode>(draft.discount.mode);
  const [value, setValue] = useState(
    draft.discount.value || String(computedDiscountPercent() || 0),
  );
  const [limitedTimeOffer, setLimitedTimeOffer] = useState(draft.discount.limitedTimeOffer);
  const [errors, setErrors] = useState<FormErrors<'value'>>({});

  const previewSellingPrice = useMemo(() => computeDiscountedPrice(mrp, mode, value), [mrp, mode, value]);

  function handleContinue() {
    if (isAttributeKind) {
      // Pricing is per-variant (set in PackSizeVariantScreen) — no single MRP to discount from here.
      updateDiscount({ mode: 'percentage', value: '', limitedTimeOffer });
      navigation.navigate('ProductTaxInfo');
      return;
    }

    const trimmed = value.trim();
    const numeric = parseFloat(trimmed);
    const nextErrors: FormErrors<'value'> = {};
    if (trimmed && (Number.isNaN(numeric) || numeric < 0)) {
      nextErrors.value = 'Enter a valid discount amount';
    } else if (mode === 'percentage' && numeric > 100) {
      nextErrors.value = 'Percentage discount cannot exceed 100%';
    } else if (mode === 'fixed' && mrp > 0 && numeric >= mrp) {
      nextErrors.value = 'Fixed discount must be less than the MRP';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const finalSellingPrice = computeDiscountedPrice(mrp, mode, trimmed);
    updatePricing({
      mrp: draft.pricing?.mrp ?? '',
      mrpGstInclusive: draft.pricing?.mrpGstInclusive ?? true,
      sellingPrice: finalSellingPrice.toFixed(2),
    });
    updateDiscount({ mode, value: trimmed, limitedTimeOffer });
    navigation.navigate('ProductTaxInfo');
  }

  return (
    <ScreenContainer backgroundColor={colors.surface}>
      <AddProductHeader
        title="Discount"
        currentStep={6}
        onBack={() => navigation.goBack()}
        onSaveDraft={() => navigation.navigate('ProductCatalog')}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {isAttributeKind ? (
          <FormSectionCard>
            <Text style={styles.previewText}>
              Pricing for this product is set per variant on the Pack Size &amp; Variants step, so a single
              discount doesn't apply here.
            </Text>
          </FormSectionCard>
        ) : (
          <FormSectionCard>
            <View style={styles.modeRow}>
              <Pressable
                style={[styles.modeOption, mode === 'percentage' && styles.modeOptionActive]}
                onPress={() => setMode('percentage')}
              >
                <Text style={[styles.modeText, mode === 'percentage' && styles.modeTextActive]}>
                  Percentage (%)
                </Text>
              </Pressable>
              <Pressable
                style={[styles.modeOption, mode === 'fixed' && styles.modeOptionActive]}
                onPress={() => setMode('fixed')}
              >
                <Text style={[styles.modeText, mode === 'fixed' && styles.modeTextActive]}>
                  Fixed Amount (₹)
                </Text>
              </Pressable>
            </View>

            <View>
              <Text style={styles.label}>Discount ({mode === 'percentage' ? '%' : '₹'})</Text>
              <View style={[styles.amountField, errors.value && styles.amountFieldError]}>
                <TextInput
                  value={value}
                  onChangeText={text => {
                    setValue(text.replace(/[^0-9.]/g, ''));
                    if (errors.value) setErrors({});
                  }}
                  placeholder="0"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="decimal-pad"
                  style={styles.amountInput}
                />
                <Text style={styles.amountSuffix}>{mode === 'percentage' ? '%' : '₹'}</Text>
              </View>
              {errors.value ? <Text style={styles.errorText}>{errors.value}</Text> : null}
            </View>

            <View style={styles.previewRow}>
              <Text style={styles.previewText}>
                MRP ₹{mrp || 0} → Selling ₹{previewSellingPrice.toFixed(2)}
              </Text>
              <Text style={styles.previewBadge}>
                {mrp > 0 && previewSellingPrice < mrp
                  ? `${(((mrp - previewSellingPrice) / mrp) * 100).toFixed(1)}% off`
                  : '—'}
              </Text>
            </View>
          </FormSectionCard>
        )}

        <View style={styles.card}>
          <View style={styles.offerRow}>
            <View style={styles.offerTextColumn}>
              <Text style={styles.offerTitle}>Limited Time Offer</Text>
              <Text style={styles.offerSubtitle}>Add a special discount for a set period</Text>
            </View>
            <Switch value={limitedTimeOffer} onChange={setLimitedTimeOffer} />
          </View>
        </View>

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
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.xl,
  },
  offerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  offerTextColumn: {
    flex: 1,
    gap: 2,
  },
  offerTitle: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  offerSubtitle: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  footer: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
});
