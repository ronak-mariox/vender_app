import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { AddProductHeader, Button, FormSectionCard, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { useProductDraft } from '../../context/ProductDraftContext';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProductSKU'>;

function slug(value: string) {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function ProductSKUScreen({ navigation }: Props) {
  const { draft, updateIdentifiers } = useProductDraft();

  function generateSku() {
    const brand = slug(draft.basicInfo?.brand ?? 'BRAND');
    const name = slug((draft.basicInfo?.name ?? 'PRODUCT').split(' ').slice(0, 2).join(' '));
    const size = draft.packSize ? slug(`${draft.packSize.netWeight}${draft.packSize.unit.split(' ')[0]}`) : '';
    return [brand, name, size].filter(Boolean).join('-');
  }

  const [sku, setSku] = useState(draft.identifiers?.sku || generateSku());
  const [error, setError] = useState<string | undefined>();

  const suggestions = [
    { label: 'BRAND-PRODUCT-SIZE', value: generateSku() },
    {
      label: 'CATEGORY-PRODUCT-VARIANT',
      value: [slug(draft.category?.categoryName ?? 'CATEGORY'), slug(draft.basicInfo?.name?.split(' ')[0] ?? 'PRODUCT')]
        .filter(Boolean)
        .join('-'),
    },
    { label: 'Custom format', value: '' },
  ];

  function handleContinue() {
    if (!sku.trim()) {
      setError('Enter or generate a SKU code');
      return;
    }
    updateIdentifiers({ sku: sku.trim(), barcode: draft.identifiers?.barcode ?? '' });
    navigation.navigate('ProductBarcode');
  }

  return (
    <ScreenContainer backgroundColor={colors.surface}>
      <AddProductHeader
        title="SKU Code"
        currentStep={8}
        onBack={() => navigation.goBack()}
        onSaveDraft={() => navigation.navigate('ProductCatalog')}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <FormSectionCard>
          <View>
            <View style={styles.labelRow}>
              <Text style={styles.label}>SKU Code</Text>
              <Text style={styles.required}> *</Text>
            </View>
            <View style={styles.skuRow}>
              <View style={[styles.skuField, error && styles.skuFieldError]}>
                <Icon name="hash" size={16} color={colors.textSecondary} />
                <TextInput
                  value={sku}
                  onChangeText={text => {
                    setSku(text.toUpperCase());
                    if (error) setError(undefined);
                  }}
                  placeholder="AUTO-GENERATED-SKU"
                  placeholderTextColor={colors.textTertiary}
                  style={styles.skuInput}
                  autoCapitalize="characters"
                />
              </View>
              <Pressable style={styles.regenerateButton} onPress={() => setSku(generateSku())}>
                <Icon name="refresh-cw" size={16} color={colors.textSecondary} />
              </Pressable>
            </View>
            <Text style={error ? styles.errorText : styles.helperText}>
              {error ?? 'Unique identifier for inventory tracking. Auto-generated or enter custom.'}
            </Text>
          </View>

          {sku.trim().length > 0 ? (
            <View style={styles.verifiedBanner}>
              <Icon name="check-circle" size={14} color={colors.primaryDark} />
              <Text style={styles.verifiedText}>SKU is unique and available</Text>
            </View>
          ) : null}

          <View>
            <Text style={styles.suggestionsTitle}>SKU Format Suggestions</Text>
            <View style={styles.suggestionsList}>
              {suggestions.map(suggestion => {
                const used = suggestion.value !== '' && suggestion.value === sku;
                return (
                  <Pressable
                    key={suggestion.label}
                    style={styles.suggestionRow}
                    onPress={() => suggestion.value && setSku(suggestion.value)}
                  >
                    <Text style={styles.suggestionText}>{suggestion.label}</Text>
                    {used ? <Text style={styles.usedLabel}>Used</Text> : null}
                  </Pressable>
                );
              })}
            </View>
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
  skuFieldError: {
    borderColor: colors.error,
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
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.sm,
  },
  verifiedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primarySurface,
    borderRadius: radii.md,
    padding: spacing.lg,
  },
  verifiedText: {
    ...typography.caption,
    color: colors.primaryDark,
  },
  suggestionsTitle: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  suggestionsList: {
    gap: spacing.xs,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  suggestionText: {
    fontFamily: 'Courier',
    fontSize: 12,
    color: colors.textPrimary,
  },
  usedLabel: {
    ...typography.tinyBold,
    color: colors.primary,
  },
  footer: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
});
