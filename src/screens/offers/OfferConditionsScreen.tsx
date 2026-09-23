import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, Input, ScreenContainer, Switch } from '../../components';
import { Icon } from '../../icons/Icon';
import { useOfferDraft } from '../../context/OfferDraftContext';
import { CustomerEligibility, OfferScope } from '../../context/OffersContext';
import { colors, radii, spacing, typography } from '../../theme';
import { OfferWizardHeader } from './OfferWizardHeader';

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

  const [applyOn, setApplyOn] = useState<OfferScope>(draft.conditions.applyOn);
  const [minOrderValueEnabled, setMinOrderValueEnabled] = useState(draft.conditions.minOrderValueEnabled);
  const [minOrderValue, setMinOrderValue] = useState(
    draft.conditions.minOrderValue ? String(draft.conditions.minOrderValue) : '',
  );
  const [customerEligibility, setCustomerEligibility] = useState<CustomerEligibility>(
    draft.conditions.customerEligibility,
  );

  const discountType = draft.type?.discountType ?? 'percentage';
  const offerTypeLabel = discountType === 'percentage' ? 'Percentage Discount' : 'Fixed Amount Off';

  function handleNext() {
    updateConditions({
      applyOn,
      minOrderValueEnabled,
      minOrderValue: minOrderValueEnabled ? Number(minOrderValue) || undefined : undefined,
      customerEligibility,
    });
    navigation.navigate('OfferDiscountValue');
  }

  return (
    <ScreenContainer backgroundColor={colors.white}>
      <OfferWizardHeader title="Offer Details" step={3} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.typeBanner}>
          <Icon name="percent" size={22} color={colors.primary} />
          <View>
            <Text style={styles.typeBannerTitle}>{offerTypeLabel}</Text>
            <Text style={styles.typeBannerCaption}>Selected offer type</Text>
          </View>
        </View>

        <View>
          <Text style={styles.sectionLabel}>Apply discount on</Text>
          <View style={styles.radioGroup}>
            <RadioRow
              label="On selected products"
              selected={applyOn === 'selected-products'}
              onPress={() => setApplyOn('selected-products')}
            />
            <RadioRow
              label="On minimum order value"
              selected={applyOn === 'entire-store'}
              onPress={() => setApplyOn('entire-store')}
            />
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
                onChangeText={text => setMinOrderValue(text.replace(/[^0-9]/g, ''))}
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
