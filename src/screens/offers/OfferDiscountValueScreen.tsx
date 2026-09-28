import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { useOfferDraft } from '../../context/OfferDraftContext';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { colors, radii, spacing, typography } from '../../theme';
import { OfferWizardHeader } from './OfferWizardHeader';

type Props = NativeStackScreenProps<AuthStackParamList, 'OfferDiscountValue'>;

const PERCENTAGE_QUICK_PICKS = [5, 10, 15, 20, 25];
const FLAT_QUICK_PICKS = [10, 20, 30, 50, 100];

function formatCurrency(value: number) {
  return `₹${value.toFixed(2)}`;
}

export function OfferDiscountValueScreen({ navigation }: Props) {
  const { draft, updateDiscountValue } = useOfferDraft();
  const { products } = useProductCatalog();
  const isPercentage = draft.discountType === 'percentage';

  const [value, setValue] = useState(draft.discountValue);
  const [error, setError] = useState<string | undefined>();

  const quickPicks = isPercentage ? PERCENTAGE_QUICK_PICKS : FLAT_QUICK_PICKS;
  const step = isPercentage ? 1 : 5;
  const maxValue = isPercentage ? 100 : 99999;

  const previewProduct = useMemo(() => {
    if (draft.scope === 'entire-store') return products[0];
    const productIds = new Set(draft.productIds);
    const categoryIds = new Set(draft.categoryIds);
    return products.find(product => productIds.has(product.id) || categoryIds.has(product.categoryId));
  }, [draft.scope, draft.productIds, draft.categoryIds, products]);

  function setClamped(next: number) {
    setValue(Math.min(maxValue, Math.max(0, next)));
    if (error) setError(undefined);
  }

  function handleTextChange(text: string) {
    const digitsOnly = text.replace(/[^0-9]/g, '');
    setClamped(digitsOnly ? Number(digitsOnly) : 0);
  }

  const basePrice = previewProduct?.sellingPrice ?? 0;
  const discountedPrice = isPercentage ? basePrice * (1 - value / 100) : Math.max(basePrice - value, 0);
  const savings = basePrice - discountedPrice;

  function handleNext() {
    if (!(value > 0)) {
      setError('Discount value must be greater than 0');
      return;
    }
    if (isPercentage && value > 100) {
      setError('Percentage discount cannot exceed 100%');
      return;
    }
    updateDiscountValue(value);
    navigation.navigate('OfferStartDate');
  }

  return (
    <ScreenContainer backgroundColor={colors.white}>
      <OfferWizardHeader title="Discount Value" step={3} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.valueSection}>
          <View style={styles.stepperRow}>
            <Pressable
              onPress={() => setClamped(value - step)}
              style={styles.stepperButton}
              hitSlop={8}
            >
              <Icon name="minus" size={18} color={colors.textSecondary} />
            </Pressable>

            <View style={styles.valueDisplay}>
              <TextInput
                value={String(value)}
                onChangeText={handleTextChange}
                keyboardType="number-pad"
                style={styles.valueInput}
                maxLength={isPercentage ? 3 : 5}
              />
              <Text style={styles.valueUnit}>{isPercentage ? '%' : '₹'}</Text>
            </View>

            <Pressable
              onPress={() => setClamped(value + step)}
              style={styles.stepperButton}
              hitSlop={8}
            >
              <Icon name="plus" size={18} color={colors.textSecondary} />
            </Pressable>
          </View>
          <Text style={styles.valueCaption}>
            {isPercentage ? 'Percentage discount' : 'Flat amount off'}
          </Text>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <View style={styles.chipsRow}>
          {quickPicks.map(pick => {
            const selected = value === pick;
            return (
              <Pressable
                key={pick}
                onPress={() => setClamped(pick)}
                style={[styles.chip, selected && styles.chipSelected]}
              >
                <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
                  {isPercentage ? `${pick}%` : `₹${pick}`}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {previewProduct ? (
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>Price Preview</Text>
            <Text style={styles.previewRowLabel} numberOfLines={1}>
              {previewProduct.name}
            </Text>

            <View style={styles.previewRow}>
              <Text style={styles.previewRowLabel}>Selling price</Text>
              <Text style={styles.previewMrp}>{formatCurrency(basePrice)}</Text>
            </View>

            <View style={styles.previewRow}>
              <Text style={styles.previewRowLabelDark}>
                After {isPercentage ? `${value}%` : `₹${value}`} off
              </Text>
              <Text style={styles.previewDiscounted}>{formatCurrency(discountedPrice)}</Text>
            </View>

            <View style={styles.previewDivider} />

            <View style={styles.previewRow}>
              <Text style={styles.previewSavesLabel}>Customer saves</Text>
              <Text style={styles.previewSavesValue}>{formatCurrency(savings)}</Text>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Next: Set Dates" onPress={handleNext} disabled={!(value > 0)} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.sm,
  },
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  valueSection: {
    alignItems: 'center',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxl,
  },
  stepperButton: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueDisplay: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  valueInput: {
    fontFamily: typography.h1.fontFamily,
    fontSize: 64,
    lineHeight: 68,
    color: colors.primary,
    padding: 0,
    minWidth: 80,
    textAlign: 'center',
  },
  valueUnit: {
    ...typography.h2,
    fontSize: 28,
    color: colors.primary,
    marginBottom: 8,
  },
  valueCaption: {
    ...typography.labelSemibold,
    color: colors.textSecondary,
    paddingTop: spacing.md,
  },
  chipsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    paddingTop: spacing.xxxl,
    flexWrap: 'wrap',
  },
  chip: {
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    borderRadius: radii.full,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipLabel: {
    ...typography.labelSemibold,
    color: colors.textSecondary,
  },
  chipLabelSelected: {
    color: colors.white,
  },
  previewCard: {
    marginTop: spacing.xxxl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.xl,
    gap: spacing.md,
  },
  previewTitle: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
    letterSpacing: 0.48,
    textTransform: 'uppercase',
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  previewRowLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  previewRowLabelDark: {
    ...typography.label,
    color: colors.textPrimary,
  },
  previewMrp: {
    ...typography.body,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  previewDiscounted: {
    fontFamily: typography.h3.fontFamily,
    fontSize: 16,
    lineHeight: 24,
    color: colors.primary,
  },
  previewDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: spacing.sm,
  },
  previewSavesLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  previewSavesValue: {
    ...typography.labelSemibold,
    color: colors.primaryDark,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
