import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import {
  AddProductHeader,
  Button,
  FormSectionCard,
  Input,
  ScreenContainer,
  SelectField,
  Switch,
} from '../../components';
import { Icon } from '../../icons/Icon';
import { PACK_TYPES, WEIGHT_UNITS } from '../../data/categories';
import { ProductVariant, useProductDraft } from '../../context/ProductDraftContext';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { isNonNegativeInteger, isPositiveNumber, isRequired, type FormErrors } from '../../utils/validators';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'PackSizeVariant'>;

type Errors = FormErrors<'netWeight'>;
type VariantField = 'size' | 'mrp' | 'sellingPrice' | 'stock';
type VariantErrors = Partial<Record<VariantField, string>>;

export function PackSizeVariantScreen({ navigation }: Props) {
  const { draft, updatePackSize } = useProductDraft();
  const { categories } = useProductCatalog();
  const category = categories.find(c => c.id === draft.category?.categoryId);
  const subcategory = category?.subcategories.find(s => s.id === draft.category?.subcategoryId);
  // A subcategory's own variantConfig overrides its category's — e.g. Fashion's
  // "Dresses" needs clothing sizes while its "Watches" subcategory doesn't.
  const variantConfig = subcategory?.variantConfig ?? category?.variantConfig;
  const isAttributeKind = variantConfig?.kind === 'attribute';
  const unitOptions = variantConfig?.kind === 'weight_volume'
    ? variantConfig.units ?? WEIGHT_UNITS
    : WEIGHT_UNITS;
  const attributeOptions = variantConfig?.options ?? [];
  const variantLabel = variantConfig?.label ?? 'Size';

  const [netWeight, setNetWeight] = useState(draft.packSize?.netWeight ?? '');
  const [unit, setUnit] = useState(draft.packSize?.unit ?? unitOptions[0]);
  const [packType, setPackType] = useState(draft.packSize?.packType ?? '');
  const [itemsPerPack, setItemsPerPack] = useState(draft.packSize?.itemsPerPack ?? '1');
  const [variantsEnabled, setVariantsEnabled] = useState(draft.packSize?.variantsEnabled ?? isAttributeKind);
  const [variants, setVariants] = useState<ProductVariant[]>(draft.packSize?.variants ?? []);
  const [errors, setErrors] = useState<Errors>({});
  const [variantErrors, setVariantErrors] = useState<Record<string, VariantErrors>>({});
  const [variantsError, setVariantsError] = useState<string | undefined>();

  function addVariant() {
    setVariants(prev => [
      ...prev,
      {
        id: `v${Date.now()}`,
        size: '',
        mrp: '',
        sellingPrice: '',
        stock: '',
        isPrimary: prev.length === 0,
      },
    ]);
  }

  function updateVariant(id: string, patch: Partial<ProductVariant>) {
    setVariants(prev => prev.map(variant => (variant.id === id ? { ...variant, ...patch } : variant)));
    const touchedFields = Object.keys(patch) as VariantField[];
    if (touchedFields.some(field => variantErrors[id]?.[field])) {
      setVariantErrors(prev => {
        const next = { ...prev[id] };
        touchedFields.forEach(field => delete next[field]);
        return { ...prev, [id]: next };
      });
    }
  }

  function removeVariant(id: string) {
    setVariants(prev => prev.filter(variant => variant.id !== id));
    setVariantErrors(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function setPrimary(id: string) {
    setVariants(prev => prev.map(variant => ({ ...variant, isPrimary: variant.id === id })));
  }

  function handleContinue() {
    const nextErrors: Errors = {};
    if (!isAttributeKind && !netWeight.trim()) {
      nextErrors.netWeight = 'Enter the net weight or volume';
    }

    let nextVariantsError: string | undefined;
    if (isAttributeKind && variants.length === 0) {
      nextVariantsError = `Add at least one ${variantLabel.toLowerCase()}`;
    }

    const nextVariantErrors: Record<string, VariantErrors> = {};
    if (variantsEnabled) {
      variants.forEach(variant => {
        const rowErrors: VariantErrors = {};
        if (!isRequired(variant.size)) rowErrors.size = 'Required';
        if (!isPositiveNumber(variant.mrp)) rowErrors.mrp = 'Invalid';
        if (!isPositiveNumber(variant.sellingPrice)) rowErrors.sellingPrice = 'Invalid';
        if (!isNonNegativeInteger(variant.stock)) rowErrors.stock = 'Invalid';
        if (
          !rowErrors.mrp &&
          !rowErrors.sellingPrice &&
          parseFloat(variant.sellingPrice) > parseFloat(variant.mrp)
        ) {
          rowErrors.sellingPrice = 'SP > MRP';
        }
        if (Object.keys(rowErrors).length > 0) nextVariantErrors[variant.id] = rowErrors;
      });
    }

    setErrors(nextErrors);
    setVariantsError(nextVariantsError);
    setVariantErrors(nextVariantErrors);
    if (
      Object.keys(nextErrors).length > 0 ||
      Object.keys(nextVariantErrors).length > 0 ||
      nextVariantsError
    ) {
      return;
    }

    updatePackSize({
      netWeight: isAttributeKind ? '' : netWeight.trim(),
      unit: isAttributeKind ? '' : unit,
      packType: isAttributeKind ? '' : packType,
      itemsPerPack: isAttributeKind ? '1' : itemsPerPack.trim() || '1',
      variantsEnabled,
      variants,
    });
    navigation.navigate('ProductMRP');
  }

  return (
    <ScreenContainer backgroundColor={colors.surface}>
      <AddProductHeader
        title="Pack Size & Variants"
        currentStep={5}
        onBack={() => navigation.goBack()}
        onSaveDraft={() => navigation.navigate('ProductCatalog')}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {!isAttributeKind ? (
          <FormSectionCard title="Primary Pack Size">
            <View style={styles.row}>
              <View style={styles.weightField}>
                <Input
                  label="Net Weight / Volume"
                  required
                  value={netWeight}
                  onChangeText={text => {
                    setNetWeight(text);
                    if (errors.netWeight) setErrors(prev => ({ ...prev, netWeight: undefined }));
                  }}
                  placeholder="500"
                  keyboardType="numeric"
                  error={errors.netWeight}
                />
              </View>
              <View style={styles.unitField}>
                <SelectField label="Unit" value={unit} options={unitOptions} onChange={setUnit} />
              </View>
            </View>

            <SelectField
              label="Pack Type"
              value={packType}
              options={PACK_TYPES}
              onChange={setPackType}
              placeholder="Select pack type"
            />

            <Input
              label="Items per Pack"
              value={itemsPerPack}
              onChangeText={setItemsPerPack}
              placeholder="1"
              keyboardType="numeric"
              helperText="e.g. 6 for a pack of 6 bottles"
            />
          </FormSectionCard>
        ) : null}

        <View style={styles.card}>
          <View style={styles.variantsHeaderRow}>
            <Text style={styles.cardTitle}>{isAttributeKind ? variantLabel : 'Variants (Optional)'}</Text>
            {isAttributeKind ? null : <Switch value={variantsEnabled} onChange={setVariantsEnabled} />}
          </View>
          <Text style={styles.variantsSubtitle}>
            {isAttributeKind
              ? `Add each ${variantLabel.toLowerCase()} this product is available in`
              : 'Add multiple sizes/weights for the same product'}
          </Text>
          {variantsError ? <Text style={styles.errorText}>{variantsError}</Text> : null}

          {variantsEnabled || isAttributeKind ? (
            <View style={styles.variantsList}>
              {variants.map(variant => (
                <View key={variant.id} style={[styles.variantRow, variant.isPrimary && styles.variantRowPrimary]}>
                  <Pressable
                    style={[styles.sizeChip, variant.isPrimary && styles.sizeChipPrimary]}
                    onPress={() => setPrimary(variant.id)}
                  >
                    <Text style={[styles.sizeChipText, variant.isPrimary && styles.sizeChipTextPrimary]}>
                      {variant.size || `${netWeight || '—'}`}
                    </Text>
                  </Pressable>
                  <View style={styles.variantInputsColumn}>
                    {isAttributeKind ? (
                      <View style={styles.attributeChipsRow}>
                        {attributeOptions.map(option => {
                          const selected = variant.size === option;
                          return (
                            <Pressable
                              key={option}
                              style={[styles.attributeChip, selected && styles.attributeChipSelected]}
                              onPress={() => updateVariant(variant.id, { size: option })}
                            >
                              <Text
                                style={[styles.attributeChipText, selected && styles.attributeChipTextSelected]}
                              >
                                {option}
                              </Text>
                            </Pressable>
                          );
                        })}
                        {variantErrors[variant.id]?.size ? (
                          <Text style={styles.errorText}>Select a {variantLabel.toLowerCase()}</Text>
                        ) : null}
                      </View>
                    ) : null}
                    <View style={styles.variantInputsRow}>
                      {isAttributeKind ? null : (
                        <VariantMiniInput
                          placeholder="Size"
                          value={variant.size}
                          onChangeText={text => updateVariant(variant.id, { size: text })}
                          error={variantErrors[variant.id]?.size}
                        />
                      )}
                      <VariantMiniInput
                        placeholder="MRP"
                        value={variant.mrp}
                        onChangeText={text => updateVariant(variant.id, { mrp: text })}
                        keyboardType="numeric"
                        error={variantErrors[variant.id]?.mrp}
                      />
                      <VariantMiniInput
                        placeholder="SP"
                        value={variant.sellingPrice}
                        onChangeText={text => updateVariant(variant.id, { sellingPrice: text })}
                        keyboardType="numeric"
                        error={variantErrors[variant.id]?.sellingPrice}
                      />
                      <VariantMiniInput
                        placeholder="Stock"
                        value={variant.stock}
                        onChangeText={text => updateVariant(variant.id, { stock: text })}
                        keyboardType="numeric"
                        error={variantErrors[variant.id]?.stock}
                      />
                    </View>
                  </View>
                  {variant.isPrimary ? <Text style={styles.primaryLabel}>Primary</Text> : null}
                  <Pressable onPress={() => removeVariant(variant.id)} hitSlop={8}>
                    <Icon name="trash" size={14} color={colors.error} />
                  </Pressable>
                </View>
              ))}
              <Pressable style={styles.addVariantButton} onPress={addVariant}>
                <Icon name="plus" size={14} color={colors.textSecondary} />
                <Text style={styles.addVariantText}>
                  {isAttributeKind ? `Add another ${variantLabel.toLowerCase()}` : 'Add another size'}
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        <View style={styles.footer}>
          <Button label="Continue" onPress={handleContinue} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function VariantMiniInput({
  placeholder,
  value,
  onChangeText,
  keyboardType,
  error,
}: {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'numeric';
  error?: string;
}) {
  return (
    <View style={styles.miniInputWrapper}>
      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        error={error}
      />
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
  row: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  weightField: {
    flex: 1,
  },
  unitField: {
    width: 132,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.xl,
    gap: spacing.md,
  },
  cardTitle: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.72,
  },
  variantsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  variantsSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  errorText: {
    ...typography.tinyBold,
    color: colors.error,
  },
  variantsList: {
    gap: spacing.md,
  },
  variantRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.lg,
  },
  variantRowPrimary: {
    borderColor: colors.primary,
  },
  sizeChip: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
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
  variantInputsColumn: {
    flex: 1,
    gap: spacing.sm,
  },
  variantInputsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  attributeChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  attributeChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.white,
  },
  attributeChipSelected: {
    backgroundColor: colors.primarySurface,
    borderColor: colors.primary,
  },
  attributeChipText: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  attributeChipTextSelected: {
    color: colors.primary,
  },
  miniInputWrapper: {
    width: 76,
  },
  primaryLabel: {
    ...typography.tinyBold,
    color: colors.primary,
  },
  addVariantButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: radii.md,
    paddingVertical: spacing.lg,
  },
  addVariantText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  footer: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
});
