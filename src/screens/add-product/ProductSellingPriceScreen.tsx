import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { AddProductHeader, Button, FormSectionCard, ScreenContainer } from '../../components';
import { useProductDraft } from '../../context/ProductDraftContext';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProductSellingPrice'>;

const PLATFORM_FEE_RATE = 0.08;
const GST_ON_FEE_RATE = 0.18;

export function ProductSellingPriceScreen({ navigation }: Props) {
  const { draft, updatePricing } = useProductDraft();
  const { categories } = useProductCatalog();
  const category = categories.find(c => c.id === draft.category?.categoryId);
  const subcategory = category?.subcategories.find(s => s.id === draft.category?.subcategoryId);
  const variantConfig = subcategory?.variantConfig ?? category?.variantConfig;
  const isAttributeKind = variantConfig?.kind === 'attribute';
  const variants = draft.packSize?.variants ?? [];

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
    if (isAttributeKind) {
      // Pricing already fully set per-variant in PackSizeVariantScreen — nothing more to collect here.
      navigation.navigate('ProductDiscount');
      return;
    }
    if (!sellingPrice.trim() || sp <= 0) {
      setError('Enter a valid selling price');
      return;
    }
    if (sp > mrp) {
      setError('Selling price cannot exceed MRP');
      return;
    }
    updatePricing({
      mrp: draft.pricing?.mrp ?? '',
      mrpGstInclusive: draft.pricing?.mrpGstInclusive ?? true,
      sellingPrice: sellingPrice.trim(),
    });
    navigation.navigate('ProductDiscount');
  }

  return (
    <ScreenContainer backgroundColor={colors.surface}>
      <AddProductHeader
        title="Selling Price"
        currentStep={6}
        onBack={() => navigation.goBack()}
        onSaveDraft={() => navigation.navigate('ProductCatalog')}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {isAttributeKind ? (
          <FormSectionCard title={`${variantConfig?.label ?? 'Variant'} Prices`}>
            {variants.map((variant, index) => (
              <View
                key={variant.id}
                style={[styles.variantRow, index < variants.length - 1 && styles.variantRowDivider]}
              >
                <View style={[styles.sizeChip, variant.isPrimary && styles.sizeChipPrimary]}>
                  <Text style={[styles.sizeChipText, variant.isPrimary && styles.sizeChipTextPrimary]}>
                    {variant.size}
                  </Text>
                </View>
                <View style={styles.variantPriceRow}>
                  <Text style={styles.variantLabel}>MRP</Text>
                  <Text style={styles.variantMrp}>₹{variant.mrp || 0}</Text>
                  <Text style={styles.variantArrow}>→</Text>
                  <Text style={styles.variantSp}>₹{variant.sellingPrice || 0}</Text>
                </View>
              </View>
            ))}
          </FormSectionCard>
        ) : (
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
              <SummaryRow label="Platform Fee (8%)" value={`-₹${platformFee.toFixed(2)}`} valueColor={colors.error} light />
              <SummaryRow label="GST on Fee (18%)" value={`-₹${gstOnFee.toFixed(2)}`} valueColor={colors.error} light />
              <View style={styles.earningsDivider} />
              <SummaryRow label="Net Payout" value={`₹${netPayout.toFixed(2)}`} valueColor={colors.primary} bold />
            </View>
          </FormSectionCard>
        )}

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
  variantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  variantRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sizeChip: {
    minWidth: 44,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  sizeChipPrimary: {
    backgroundColor: colors.primarySurface,
    borderColor: colors.primary,
  },
  sizeChipText: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  sizeChipTextPrimary: {
    color: colors.primary,
  },
  variantPriceRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  variantLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  variantMrp: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  variantArrow: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  variantSp: {
    ...typography.labelSemibold,
    color: colors.primary,
  },
});
