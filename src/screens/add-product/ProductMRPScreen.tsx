import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { AddProductHeader, Button, FormSectionCard, InfoBanner, ScreenContainer } from '../../components';
import { ADD_PRODUCT_TOTAL_STEPS, packSizeLabel, useProductDraft } from '../../context/ProductDraftContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProductMRP'>;

export function ProductMRPScreen({ navigation }: Props) {
  const { draft, updatePricing } = useProductDraft();
  const [mrp, setMrp] = useState(draft.pricing?.mrp ?? '');
  const [error, setError] = useState<string | undefined>();
  const sizeLabel = packSizeLabel(draft.packSize);

  function handleContinue() {
    const value = parseFloat(mrp);
    if (!mrp.trim() || Number.isNaN(value) || value <= 0) {
      setError('Enter a valid MRP');
      return;
    }
    updatePricing({ mrp: mrp.trim() });
    navigation.navigate('ProductSellingPrice');
  }

  return (
    <ScreenContainer backgroundColor={colors.surface}>
      <AddProductHeader
        title="Maximum Retail Price"
        currentStep={6}
        totalSteps={ADD_PRODUCT_TOTAL_STEPS}
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <FormSectionCard>
          <View>
            <View style={styles.labelRow}>
              <Text style={styles.label}>MRP (₹)</Text>
              <Text style={styles.required}> *</Text>
            </View>
            {sizeLabel ? (
              <View style={styles.sizeChipRow}>
                <View style={styles.sizeChip}>
                  <Text style={styles.sizeChipText}>Setting price for: {sizeLabel}</Text>
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
              {error ?? 'MRP as printed on the packaging. Your selling price cannot exceed it.'}
            </Text>
          </View>

          <InfoBanner
            variant="warning"
            message="MRP is the maximum price you can legally charge customers. Selling above MRP is prohibited."
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
  footer: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  sizeChipRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
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
  sizeChipText: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
});
