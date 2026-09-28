import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, Input, ScreenContainer, Switch } from '../../components';
import { Icon } from '../../icons/Icon';
import { useOfferDraft } from '../../context/OfferDraftContext';
import { CustomerEligibility } from '../../context/OffersContext';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { colors, radii, spacing, typography } from '../../theme';
import { OfferWizardHeader } from './OfferWizardHeader';
import { offerScopeLabel } from './offerFormat';

type Props = NativeStackScreenProps<AuthStackParamList, 'OfferConditions'>;

function RadioRow({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.radioRow, selected ? styles.radioRowSelected : styles.radioRowDefault]}
    >
      <Text style={styles.radioRowLabel}>{label}</Text>
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected ? <View style={styles.radioInner} /> : null}
      </View>
    </Pressable>
  );
}

export function OfferConditionsScreen({ navigation }: Props) {
  const { draft, updateConditions } = useOfferDraft();
  const { products, categories } = useProductCatalog();

  const [minOrderValueEnabled, setMinOrderValueEnabled] = useState(draft.minOrderValueEnabled);
  const [minOrderValue, setMinOrderValue] = useState(draft.minOrderValue > 0 ? String(draft.minOrderValue) : '');
  const [customerEligibility, setCustomerEligibility] = useState<CustomerEligibility>(draft.customerEligibility);
  const [minOrderError, setMinOrderError] = useState<string | undefined>();

  const offerTypeLabel = draft.discountType === 'percentage' ? 'Percentage Discount' : 'Fixed Amount Off';
  const scopeLabel = offerScopeLabel(draft, products, categories);

  function handleNext() {
    const parsedMin = Number(minOrderValue);
    if (minOrderValueEnabled && !(parsedMin > 0)) {
      setMinOrderError('Enter a minimum order value greater than 0');
      return;
    }
    updateConditions({
      minOrderValueEnabled,
      minOrderValue: minOrderValueEnabled ? parsedMin : 0,
      customerEligibility,
    });
    navigation.navigate('OfferDiscountValue');
  }

  return (
    <ScreenContainer backgroundColor={colors.white}>
      <OfferWizardHeader title="Offer Details" step={3} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.typeBanner}>
          <Icon name={draft.discountType === 'percentage' ? 'percent' : 'tag'} size={22} color={colors.primary} />
          <View style={styles.typeBannerText}>
            <Text style={styles.typeBannerTitle}>{offerTypeLabel}</Text>
            <Text style={styles.typeBannerCaption} numberOfLines={2}>
              Applies to: {scopeLabel}
            </Text>
          </View>
        </View>

        <View style={styles.divider}>
          <View style={styles.switchRow}>
            <View style={styles.switchTextColumn}>
              <Text style={styles.switchLabel}>Require minimum order</Text>
              <Text style={styles.switchCaption}>Set a minimum cart value</Text>
            </View>
            <Switch value={minOrderValueEnabled} onChange={setMinOrderValueEnabled} />
          </View>
          {minOrderValueEnabled ? (
            <View style={styles.minOrderInput}>
              <Input
                label="Minimum Cart Value (₹)"
                value={minOrderValue}
                onChangeText={text => {
                  setMinOrderValue(text.replace(/[^0-9]/g, ''));
                  if (minOrderError) setMinOrderError(undefined);
                }}
                error={minOrderError}
                placeholder="e.g. 299"
                keyboardType="number-pad"
              />
            </View>
          ) : null}
        </View>

        <View>
          <Text style={styles.sectionLabel}>Apply to</Text>
          <View style={styles.radioGroup}>
            <RadioRow
              label="All customers"
              selected={customerEligibility === 'all'}
              onPress={() => setCustomerEligibility('all')}
            />
            <RadioRow
              label="New customers only"
              selected={customerEligibility === 'new-only'}
              onPress={() => setCustomerEligibility('new-only')}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Next: Discount Value" onPress={handleNext} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.xxl,
  },
  typeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.primarySurface,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: radii.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  typeBannerText: {
    flex: 1,
  },
  typeBannerTitle: {
    ...typography.labelSemibold,
    color: colors.primary,
  },
  typeBannerCaption: {
    ...typography.tiny,
    color: colors.primaryDark,
  },
  sectionLabel: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  radioGroup: {
    gap: spacing.lg,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radii.md,
    borderWidth: 1.5,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  radioRowDefault: {
    backgroundColor: colors.white,
    borderColor: colors.border,
  },
  radioRowSelected: {
    backgroundColor: colors.primarySurface,
    borderColor: colors.primary,
  },
  radioRowLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: radii.full,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  radioInner: {
    width: 7,
    height: 7,
    borderRadius: radii.full,
    backgroundColor: colors.white,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.xl,
    gap: spacing.lg,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchTextColumn: {
    gap: 2,
  },
  switchLabel: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  switchCaption: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  minOrderInput: {
    paddingTop: spacing.xs,
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
