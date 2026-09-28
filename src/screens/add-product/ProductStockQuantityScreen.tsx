import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { AddProductHeader, Button, FormSectionCard, Input, ScreenContainer } from '../../components';
import { ADD_PRODUCT_TOTAL_STEPS, useProductDraft, usesVariantPricing } from '../../context/ProductDraftContext';
import { isNonNegativeInteger, type FormErrors } from '../../utils/validators';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProductStockQuantity'>;

type Errors = FormErrors<'opening' | 'reorderLevel' | 'maxStock'>;

export function ProductStockQuantityScreen({ navigation }: Props) {
  const { draft, updateStock } = useProductDraft();
  const perVariant = usesVariantPricing(draft.packSize);
  const variantStockTotal = (draft.packSize?.variants ?? []).reduce(
    (sum, variant) => sum + (parseInt(variant.stock, 10) || 0),
    0,
  );
  const [opening, setOpening] = useState(draft.stock?.opening ?? '');
  const [reorderLevel, setReorderLevel] = useState(draft.stock?.reorderLevel ?? '');
  const [maxStock, setMaxStock] = useState(draft.stock?.maxStock ?? '');
  const [errors, setErrors] = useState<Errors>({});

  function handleContinue() {
    const nextErrors: Errors = {};
    if (!perVariant && !isNonNegativeInteger(opening)) {
      nextErrors.opening = 'Enter the number of units you have in stock';
    }
    if (reorderLevel.trim() && !isNonNegativeInteger(reorderLevel)) {
      nextErrors.reorderLevel = 'Enter a whole number';
    }
    if (maxStock.trim() && !isNonNegativeInteger(maxStock)) {
      nextErrors.maxStock = 'Enter a whole number';
    }
    if (
      !nextErrors.reorderLevel &&
      !nextErrors.maxStock &&
      reorderLevel.trim() &&
      maxStock.trim() &&
      Number(reorderLevel) > Number(maxStock)
    ) {
      nextErrors.maxStock = 'Max stock must be at least the reorder level';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    updateStock({
      opening: perVariant ? '' : opening.trim(),
      reorderLevel: reorderLevel.trim(),
      maxStock: maxStock.trim(),
    });
    navigation.navigate('ReviewProduct');
  }

  return (
    <ScreenContainer backgroundColor={colors.surface}>
      <AddProductHeader
        title="Stock Quantity"
        currentStep={9}
        totalSteps={ADD_PRODUCT_TOTAL_STEPS}
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <FormSectionCard>
          {perVariant ? (
            <View>
              <Text style={styles.label}>Opening Stock</Text>
              <Text style={styles.helperText}>
                {variantStockTotal} units across {draft.packSize?.variants.length ?? 0} variants — set per variant on
                the Pack Size step.
              </Text>
            </View>
          ) : (
            <Input
              label="Opening Stock"
              required
              value={opening}
              onChangeText={text => {
                setOpening(text.replace(/[^0-9]/g, ''));
                if (errors.opening) setErrors(prev => ({ ...prev, opening: undefined }));
              }}
              placeholder="0"
              keyboardType="number-pad"
              error={errors.opening}
              helperText={errors.opening ? undefined : 'Current physical stock count'}
            />
          )}

          <View style={styles.row}>
            <View style={styles.halfField}>
              <Input
                label="Reorder Level"
                value={reorderLevel}
                onChangeText={text => {
                  setReorderLevel(text.replace(/[^0-9]/g, ''));
                  if (errors.reorderLevel) setErrors(prev => ({ ...prev, reorderLevel: undefined }));
                }}
                keyboardType="number-pad"
                helperText={errors.reorderLevel ? undefined : 'Low-stock alert at or below'}
                error={errors.reorderLevel}
              />
            </View>
            <View style={styles.halfField}>
              <Input
                label="Max Stock"
                value={maxStock}
                onChangeText={text => {
                  setMaxStock(text.replace(/[^0-9]/g, ''));
                  if (errors.maxStock) setErrors(prev => ({ ...prev, maxStock: undefined }));
                }}
                keyboardType="number-pad"
                helperText={errors.maxStock ? undefined : 'Optional capacity'}
                error={errors.maxStock}
              />
            </View>
          </View>
        </FormSectionCard>

        <View style={styles.footer}>
          <Button label="Review Product" onPress={handleContinue} />
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
  label: {
    ...typography.label,
    color: colors.textPrimary,
  },
  helperText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  halfField: {
    flex: 1,
  },
  footer: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
});
