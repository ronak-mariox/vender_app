import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, NavHeader } from '../../components';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { getApiErrorMessage } from '../../services/api';
import {
  GST_ON_FEE_PERCENT_LABEL,
  GST_ON_FEE_RATE,
  PLATFORM_FEE_PERCENT_LABEL,
  PLATFORM_FEE_RATE,
} from '../../constants/fees';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'EditPrice'>;

type VariantForm = {
  id: string;
  size: string;
  mrp: string;
  sellingPrice: string;
  isPrimary: boolean;
};

type VariantErrors = Partial<Record<'size' | 'mrp' | 'sellingPrice', string>>;

function validateVariant(variant: VariantForm): VariantErrors {
  const errors: VariantErrors = {};
  const mrp = parseFloat(variant.mrp);
  const sp = parseFloat(variant.sellingPrice);
  if (!variant.size.trim()) errors.size = 'Enter a label';
  if (Number.isNaN(mrp) || mrp <= 0) errors.mrp = 'Enter a valid MRP';
  if (Number.isNaN(sp) || sp <= 0) errors.sellingPrice = 'Enter a valid price';
  else if (!errors.mrp && sp > mrp) errors.sellingPrice = 'Cannot exceed MRP';
  return errors;
}

export function EditPriceScreen({ navigation, route }: Props) {
  const { productId } = route.params;
  const { products, updateProduct } = useProductCatalog();
  const product = products.find(item => item.id === productId);

  const [variants, setVariants] = useState<VariantForm[]>(
    (product?.variants ?? []).map(variant => ({
      id: variant.id,
      size: variant.size,
      mrp: String(variant.mrp),
      sellingPrice: String(variant.sellingPrice),
      isPrimary: variant.isPrimary,
    })),
  );
  const [errors, setErrors] = useState<Record<string, VariantErrors>>({});
  const [formError, setFormError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <NavHeader title="Edit Price & Variants" onBack={() => navigation.goBack()} />
        <Text style={styles.emptyText}>This product is no longer available.</Text>
      </SafeAreaView>
    );
  }

  if (variants.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <NavHeader title="Edit Price & Variants" onBack={() => navigation.goBack()} />
        <Text style={styles.emptyText}>
          This product has no variants, so there is no price to edit. Contact support to fix this listing.
        </Text>
      </SafeAreaView>
    );
  }

  function updateVariant(id: string, patch: Partial<VariantForm>) {
    setVariants(prev => prev.map(variant => (variant.id === id ? { ...variant, ...patch } : variant)));
    setErrors(prev => ({ ...prev, [id]: {} }));
    setFormError(undefined);
  }

  function setPrimary(id: string) {
    setVariants(prev => prev.map(variant => ({ ...variant, isPrimary: variant.id === id })));
  }

  async function handleSave() {
    if (saving) return;
    const nextErrors: Record<string, VariantErrors> = {};
    variants.forEach(variant => {
      const rowErrors = validateVariant(variant);
      if (Object.keys(rowErrors).length > 0) nextErrors[variant.id] = rowErrors;
    });
    const labels = variants.map(variant => variant.size.trim().toLowerCase());
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    if (new Set(labels).size !== labels.length) {
      setFormError('Each variant needs a different label');
      return;
    }

    setSaving(true);
    try {
      await updateProduct(productId, {
        variants: variants.map(variant => ({
          id: variant.id,
          size: variant.size.trim(),
          mrp: parseFloat(variant.mrp),
          sellingPrice: parseFloat(variant.sellingPrice),
          isPrimary: variant.isPrimary,
          stock: product!.variants?.find(item => item.id === variant.id)?.stock ?? 0,
        })),
      });
      navigation.goBack();
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Could not save. Please try again.'));
    } finally {
      setSaving(false);
    }
  }

  const multiple = variants.length > 1;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <NavHeader
        title="Edit Price & Variants"
        onBack={() => navigation.goBack()}
        rightLabel="Save"
        onRightPress={handleSave}
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {variants.map(variant => {
          const rowErrors = errors[variant.id] ?? {};
          const mrp = parseFloat(variant.mrp) || 0;
          const sp = parseFloat(variant.sellingPrice) || 0;
          const saves = mrp > sp ? mrp - sp : 0;
          const discount = mrp > 0 && saves > 0 ? (saves / mrp) * 100 : 0;
          const fee = sp * PLATFORM_FEE_RATE;
          const payout = sp - fee - fee * GST_ON_FEE_RATE;
          return (
            <View key={variant.id} style={[styles.card, variant.isPrimary && multiple && styles.cardPrimary]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{multiple ? 'Variant' : 'Price'}</Text>
                {multiple ? (
                  variant.isPrimary ? (
                    <Text style={styles.primaryTag}>Primary</Text>
                  ) : (
                    <Pressable onPress={() => setPrimary(variant.id)} hitSlop={8}>
                      <Text style={styles.link}>Make primary</Text>
                    </Pressable>
                  )
                ) : null}
              </View>

              <Field
                label="Label / Pack size"
                value={variant.size}
                onChangeText={text => updateVariant(variant.id, { size: text })}
                error={rowErrors.size}
              />
              <View style={styles.row}>
                <Field
                  label="MRP (₹)"
                  value={variant.mrp}
                  onChangeText={text => updateVariant(variant.id, { mrp: text.replace(/[^0-9.]/g, '') })}
                  error={rowErrors.mrp}
                  numeric
                />
                <Field
                  label="Selling Price (₹)"
                  value={variant.sellingPrice}
                  onChangeText={text => updateVariant(variant.id, { sellingPrice: text.replace(/[^0-9.]/g, '') })}
                  error={rowErrors.sellingPrice}
                  numeric
                />
              </View>

              <View style={styles.metricsRow}>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Customer Saves</Text>
                  <Text style={styles.metricValue}>₹{saves.toFixed(2)}</Text>
                </View>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Discount</Text>
                  <Text style={styles.metricValue}>{discount.toFixed(1)}%</Text>
                </View>
                <View style={[styles.metricBox, styles.metricBoxPayout]}>
                  <Text style={styles.metricLabel}>Est. Payout</Text>
                  <Text style={[styles.metricValue, styles.metricValuePayout]}>₹{payout.toFixed(2)}</Text>
                </View>
              </View>
            </View>
          );
        })}

        <Text style={styles.helperText}>
          Payout estimate = selling price − {PLATFORM_FEE_PERCENT_LABEL} platform fee − {GST_ON_FEE_PERCENT_LABEL} GST
          on that fee. Stock is managed from Update Stock.
        </Text>

        {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

        <Button label="Save Changes" onPress={handleSave} loading={saving} disabled={saving} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  error,
  numeric,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  numeric?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={numeric ? 'decimal-pad' : 'default'}
        style={[styles.input, error ? styles.inputError : null]}
        placeholderTextColor={colors.textTertiary}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
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
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: spacing.xxl,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  cardPrimary: {
    borderColor: colors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  primaryTag: {
    ...typography.tinyBold,
    color: colors.primary,
  },
  link: {
    ...typography.captionSemibold,
    color: colors.primary,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  field: {
    flex: 1,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  input: {
    ...typography.body,
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    color: colors.textPrimary,
    backgroundColor: colors.white,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
  helperText: {
    ...typography.tiny,
    color: colors.textSecondary,
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
  metricBoxPayout: {
    backgroundColor: colors.primarySurface,
  },
  metricLabel: {
    ...typography.tiny,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 15,
    fontFamily: fontFamilies.bold,
    color: colors.textPrimary,
  },
  metricValuePayout: {
    color: colors.primary,
  },
});
