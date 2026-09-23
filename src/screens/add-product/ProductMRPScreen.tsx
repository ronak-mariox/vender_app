import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { AddProductHeader, Button, FormSectionCard, InfoBanner, ScreenContainer } from '../../components';
import { useProductDraft } from '../../context/ProductDraftContext';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProductMRP'>;

export function ProductMRPScreen({ navigation }: Props) {
  const { draft, updatePricing } = useProductDraft();
  const { categories } = useProductCatalog();
  const category = categories.find(c => c.id === draft.category?.categoryId);
  const subcategory = category?.subcategories.find(s => s.id === draft.category?.subcategoryId);
  const variantConfig = subcategory?.variantConfig ?? category?.variantConfig;
  const isAttributeKind = variantConfig?.kind === 'attribute';
  const variants = draft.packSize?.variants ?? [];

  const [mrp, setMrp] = useState(draft.pricing?.mrp ?? '');
  const [gstInclusive, setGstInclusive] = useState(draft.pricing?.mrpGstInclusive ?? true);
  const [error, setError] = useState<string | undefined>();

  function handleContinue() {
    if (isAttributeKind) {
      // Pricing already fully set per-variant in PackSizeVariantScreen — nothing more to collect here.
      navigation.navigate('ProductSellingPrice');
      return;
    }
    if (!mrp.trim() || parseFloat(mrp) <= 0) {
      setError('Enter a valid MRP');
      return;
    }
    updatePricing({
      mrp: mrp.trim(),
      mrpGstInclusive: gstInclusive,
      sellingPrice: draft.pricing?.sellingPrice ?? '',
    });
    navigation.navigate('ProductSellingPrice');
  }

  return (
    <ScreenContainer backgroundColor={colors.surface}>
      <AddProductHeader
        title="Maximum Retail Price"
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
                <Text style={styles.label}>MRP (₹)</Text>
                <Text style={styles.required}> *</Text>
              </View>
              {draft.packSize?.netWeight ? (
                <View style={styles.sizeChipRow}>
                  <View style={styles.sizeChip}>
                    <Text style={styles.sizeChipText}>
                      Setting price for: {draft.packSize.netWeight} {draft.packSize.unit}
                    </Text>
                  </View>
                </View>
              ) : null}
              <View style={[styles.amountField, error && styles.amountFieldError]}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  value={mrp}
                  onChangeText={text => {
                    setMrp(text.replace(/[^0-9.]/g, ''));
                    if (error) setError(undefined);
                  }}
                  placeholder="0"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="decimal-pad"
                  style={styles.amountInput}
                />
              </View>
              <Text style={error ? styles.errorText : styles.helperText}>
                {error ?? 'MRP as printed on product packaging. Cannot exceed this for selling price.'}
              </Text>
            </View>

            <InfoBanner
              variant="warning"
              message="MRP is the maximum price you can legally charge customers. Selling above MRP is prohibited."
            />
          </FormSectionCard>
        )}

        {isAttributeKind ? null : (
          <FormSectionCard title="MRP Includes">
            <View style={styles.gstRow}>
              <Pressable
                style={[styles.gstOption, gstInclusive && styles.gstOptionActive]}
                onPress={() => setGstInclusive(true)}
              >
                <View style={[styles.radioOuter, gstInclusive && styles.radioOuterActive]}>
                  {gstInclusive ? <View style={styles.radioInner} /> : null}
                </View>
                <Text style={[styles.gstOptionText, gstInclusive && styles.gstOptionTextActive]}>
                  GST Inclusive (MRP includes tax)
                </Text>
              </Pressable>
              <Pressable
                style={[styles.gstOption, !gstInclusive && styles.gstOptionActive]}
                onPress={() => setGstInclusive(false)}
              >
                <View style={[styles.radioOuter, !gstInclusive && styles.radioOuterActive]}>
                  {!gstInclusive ? <View style={styles.radioInner} /> : null}
                </View>
                <Text style={[styles.gstOptionText, !gstInclusive && styles.gstOptionTextActive]}>
                  GST Exclusive (MRP before tax)
                </Text>
              </Pressable>
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
    color: colors.textPrimary,
    padding: 0,
  },
  helperText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.sm,
  },
  gstRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  gstOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
  },
  gstOptionActive: {
    backgroundColor: colors.primarySurface,
    borderColor: colors.primary,
  },
  radioOuter: {
    width: 16,
    height: 16,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioOuterActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  radioInner: {
    width: 6,
    height: 6,
    borderRadius: 9999,
    backgroundColor: colors.white,
  },
  gstOptionText: {
    ...typography.tiny,
    color: colors.textSecondary,
    flex: 1,
  },
  gstOptionTextActive: {
    color: colors.primaryDark,
    fontFamily: fontFamilies.semibold,
  },
  footer: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  sizeChipRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
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
