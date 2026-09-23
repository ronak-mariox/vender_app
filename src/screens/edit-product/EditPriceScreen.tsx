import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, NavHeader } from '../../components';
import { ProductVariantSummary, useProductCatalog } from '../../context/ProductCatalogContext';
import { getApiErrorMessage } from '../../services/api';
import { type FormErrors } from '../../utils/validators';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'EditPrice'>;

type Errors = FormErrors<'sellingPrice'>;

const PLATFORM_FEE_RATE = 0.08;
const GST_ON_FEE_RATE = 0.18;

export function EditPriceScreen({ navigation, route }: Props) {
  const { productId } = route.params;
  const { products, updateProduct } = useProductCatalog();
  const product = products.find(item => item.id === productId);

  const [sellingPrice, setSellingPrice] = useState(String(product?.sellingPrice ?? ''));
  const [variants, setVariants] = useState<ProductVariantSummary[]>(product?.variants ?? []);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const mrp = product?.mrp ?? 0;
  const sp = parseFloat(sellingPrice) || 0;

  const customerSaves = mrp > sp ? mrp - sp : 0;
  const discountPercent = mrp > 0 && customerSaves > 0 ? (customerSaves / mrp) * 100 : 0;
  const payout = useMemo(() => sp - sp * PLATFORM_FEE_RATE - sp * PLATFORM_FEE_RATE * GST_ON_FEE_RATE, [sp]);

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <NavHeader title="Edit Price & Discount" onBack={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  async function handleSave() {
    if (saving) return;

    const nextErrors: Errors = {};
    if (sp <= 0) {
      nextErrors.sellingPrice = 'Enter a valid selling price';
    } else if (sp > mrp) {
      nextErrors.sellingPrice = 'Selling price cannot exceed MRP';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      await updateProduct(productId, { sellingPrice: sp, variants });
      navigation.goBack();
    } catch (err) {
      setErrors({ form: getApiErrorMessage(err, 'Could not save. Please try again.') });
    } finally {
      setSaving(false);
    }
  }

  function updateVariantPrice(id: string, price: string) {
    const value = parseFloat(price) || 0;
    setVariants(prev => prev.map(variant => (variant.id === id ? { ...variant, sellingPrice: value } : variant)));
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <NavHeader title="Edit Price & Discount" onBack={() => navigation.goBack()} rightLabel="Save" onRightPress={handleSave} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View>
            <Text style={styles.label}>MRP (₹)</Text>
            <View style={styles.lockedField}>
              <Text style={styles.lockedCurrency}>₹</Text>
              <Text style={styles.lockedValue}>{mrp}</Text>
              <Text style={styles.lockedHint}>Cannot change</Text>
            </View>
            <Text style={styles.helperText}>MRP is set during product creation and cannot be changed here.</Text>
          </View>

          <View>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Selling Price (₹)</Text>
              <Text style={styles.required}> *</Text>
            </View>
            <View style={[styles.amountField, errors.sellingPrice && styles.amountFieldError]}>
              <Text style={styles.amountCurrency}>₹</Text>
              <TextInput
                value={sellingPrice}
                onChangeText={text => {
                  setSellingPrice(text.replace(/[^0-9.]/g, ''));
                  if (errors.sellingPrice) setErrors(prev => ({ ...prev, sellingPrice: undefined }));
                }}
                keyboardType="decimal-pad"
                style={styles.amountInput}
              />
            </View>
            {errors.sellingPrice ? <Text style={styles.errorText}>{errors.sellingPrice}</Text> : null}
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Customer Saves</Text>
              <Text style={[styles.metricValue, { color: colors.warning }]}>₹{customerSaves.toFixed(0)}</Text>
            </View>
            <View style={[styles.metricBox, styles.metricBoxDiscount]}>
              <Text style={[styles.metricLabel, { color: '#A16207' }]}>Discount</Text>
              <Text style={[styles.metricValue, { color: colors.warning }]}>{discountPercent.toFixed(1)}%</Text>
            </View>
            <View style={[styles.metricBox, styles.metricBoxPayout]}>
              <Text style={[styles.metricLabel, { color: colors.primary }]}>Your Payout</Text>
              <Text style={[styles.metricValue, { color: colors.primary }]}>₹{payout.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {variants.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.variantsTitle}>Variant Prices</Text>
            {variants.map((variant, index) => {
              const variantDiscount =
                variant.mrp > 0 && variant.mrp > variant.sellingPrice
                  ? Math.round(((variant.mrp - variant.sellingPrice) / variant.mrp) * 100)
                  : 0;
              const isEditing = editingVariantId === variant.id;
              return (
                <View
                  key={variant.id}
                  style={[
                    styles.variantRow,
                    index < variants.length - 1 && styles.variantRowDivider,
                    variant.isPrimary && styles.variantRowPrimary,
                  ]}
                >
                  <View style={[styles.sizeChip, variant.isPrimary && styles.sizeChipPrimary]}>
                    <Text style={[styles.sizeChipText, variant.isPrimary && styles.sizeChipTextPrimary]}>
                      {variant.size}
                    </Text>
                  </View>
                  {isEditing ? (
                    <TextInput
                      value={String(variant.sellingPrice)}
                      onChangeText={text => updateVariantPrice(variant.id, text.replace(/[^0-9.]/g, ''))}
                      keyboardType="decimal-pad"
                      autoFocus
                      style={styles.variantInput}
                      onBlur={() => setEditingVariantId(null)}
                    />
                  ) : (
                    <View style={styles.variantPriceRow}>
                      <Text style={styles.variantLabel}>MRP</Text>
                      <Text style={styles.variantMrp}>₹{variant.mrp}</Text>
                      <Text style={styles.variantArrow}>→</Text>
                      <Text style={styles.variantSp}>₹{variant.sellingPrice}</Text>
                    </View>
                  )}
                  <Text style={styles.variantDiscount}>{variantDiscount}% off</Text>
                  <Pressable onPress={() => setEditingVariantId(isEditing ? null : variant.id)} hitSlop={8}>
                    <Text style={styles.editLink}>{isEditing ? 'Done' : 'Edit'}</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        ) : null}

        {errors.form ? <Text style={styles.errorText}>{errors.form}</Text> : null}

        <View style={styles.footer}>
          <Button label="Save Changes" onPress={handleSave} loading={saving} disabled={saving} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.xl,
    gap: spacing.xl,
  },
  labelRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  required: {
    ...typography.label,
    color: colors.error,
  },
  lockedField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.surface,
  },
  lockedCurrency: {
    ...typography.bodyLarge,
    fontSize: 18,
    color: colors.textSecondary,
  },
  lockedValue: {
    fontSize: 24,
    fontFamily: fontFamilies.bold,
    color: colors.textSecondary,
    flex: 1,
  },
  lockedHint: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  helperText: {
    ...typography.tiny,
    color: colors.textSecondary,
    marginTop: spacing.sm,
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
    backgroundColor: colors.errorSurface,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.sm,
  },
  amountCurrency: {
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
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metricBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  metricBoxDiscount: {
    backgroundColor: colors.warningSurface,
  },
  metricBoxPayout: {
    backgroundColor: colors.primarySurface,
  },
  metricLabel: {
    ...typography.tiny,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 17,
    fontFamily: fontFamilies.extrabold,
    color: colors.textPrimary,
  },
  variantsTitle: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.72,
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
  variantRowPrimary: {},
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
  variantInput: {
    flex: 1,
    ...typography.labelSemibold,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  variantDiscount: {
    ...typography.tinyBold,
    color: colors.warning,
  },
  editLink: {
    ...typography.caption,
    color: colors.primary,
  },
  footer: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
});
