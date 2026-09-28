import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { AddProductHeader, Button, FormSectionCard, Input, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { ADD_PRODUCT_TOTAL_STEPS, packSizeLabel, useProductDraft } from '../../context/ProductDraftContext';
import { type FormErrors } from '../../utils/validators';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProductSKU'>;

type Errors = FormErrors<'barcode'>;

function slug(value: string) {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function ProductSKUScreen({ navigation }: Props) {
  const { draft, updateIdentifiers } = useProductDraft();

  function suggestSku() {
    const brand = slug(draft.basicInfo?.brand ?? '');
    const name = slug((draft.basicInfo?.name ?? '').split(' ').slice(0, 2).join(' '));
    const size = slug(packSizeLabel(draft.packSize));
    return [brand, name, size].filter(Boolean).join('-');
  }

  const [sku, setSku] = useState(draft.identifiers?.sku ?? '');
  const [barcode, setBarcode] = useState(draft.identifiers?.barcode ?? '');
  const [errors, setErrors] = useState<Errors>({});

  function handleContinue() {
    const trimmedBarcode = barcode.trim();
    const nextErrors: Errors = {};
    if (trimmedBarcode && !/^\d{8,14}$/.test(trimmedBarcode)) {
      nextErrors.barcode = 'Barcodes are 8 to 14 digits (EAN-8, UPC-A, EAN-13, GTIN-14)';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    updateIdentifiers({ sku: sku.trim(), barcode: trimmedBarcode });
    navigation.navigate('ProductStockQuantity');
  }

  return (
    <ScreenContainer backgroundColor={colors.surface}>
      <AddProductHeader
        title="SKU & Barcode"
        currentStep={8}
        totalSteps={ADD_PRODUCT_TOTAL_STEPS}
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <FormSectionCard>
          <View>
            <View style={styles.labelRow}>
              <Text style={styles.label}>SKU Code</Text>
            </View>
            <View style={styles.skuRow}>
              <View style={styles.skuField}>
                <Icon name="hash" size={16} color={colors.textSecondary} />
                <TextInput
                  value={sku}
                  onChangeText={text => setSku(text.toUpperCase())}
                  placeholder="e.g. TATA-SALT-1KG"
                  placeholderTextColor={colors.textTertiary}
                  style={styles.skuInput}
                  autoCapitalize="characters"
                />
              </View>
              <Pressable style={styles.regenerateButton} onPress={() => setSku(suggestSku())}>
                <Icon name="refresh-cw" size={16} color={colors.textSecondary} />
              </Pressable>
            </View>
            <Text style={styles.helperText}>
              Optional. Your own code for tracking this product. Tap the button to fill a suggestion from the brand,
              name and pack size — you can edit it.
            </Text>
          </View>

          <Input
            label="Barcode Number"
            value={barcode}
            onChangeText={text => {
              setBarcode(text.replace(/[^0-9]/g, ''));
              if (errors.barcode) setErrors({});
            }}
            placeholder="e.g. 8901058000356"
            leftIcon="barcode"
            keyboardType="number-pad"
            maxLength={14}
            error={errors.barcode}
            helperText={errors.barcode ? undefined : 'Optional. Type the number printed under the barcode.'}
          />
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
  labelRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
  },
  skuRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  skuField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
  },
  skuInput: {
    flex: 1,
    fontFamily: 'Courier',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.textPrimary,
    padding: 0,
  },
  regenerateButton: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helperText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  footer: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
});
