import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import {
  Button,
  FormSectionCard,
  Input,
  NavHeader,
  ProgressSteps,
  ScreenContainer,
  SelectableCard,
  SelectField,
} from '../../components';
import { Icon } from '../../icons/Icon';
import {
  useStoreSetup,
  type DeliverySlab,
  type FulfillmentType,
} from '../../context/StoreSetupContext';
import { api, getApiErrorMessage } from '../../services/api';
import { isPositiveNumber, type FormErrors } from '../../utils/validators';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'DeliverySettings'>;

type Errors = FormErrors<'slabs' | 'minimumOrder' | 'freeDeliveryAbove'>;

const CHARGE_TYPES = ['Distance-based slab', 'Flat rate', 'Free delivery'];
const RADIUS_OPTIONS = [1, 3, 5, 10, 20];

const DEFAULT_SLABS: DeliverySlab[] = [
  { id: 'slab-1', range: '0 – 2 km', charge: '₹ 20' },
  { id: 'slab-2', range: '2 – 5 km', charge: '₹ 40' },
  { id: 'slab-3', range: '5+ km', charge: '₹ 60' },
];

export function DeliverySettingsScreen({ navigation }: Props) {
  const { data, updateDelivery } = useStoreSetup();
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>(
    data.delivery?.fulfillmentType ?? 'delivery',
  );
  const [radius, setRadius] = useState(data.delivery?.deliveryRadiusKm ?? 5);
  const [minimumOrder, setMinimumOrder] = useState(data.delivery?.minimumOrderForDelivery ?? '150');
  const [chargeType, setChargeType] = useState(data.delivery?.chargeType ?? 'Distance-based slab');
  const [slabs, setSlabs] = useState<DeliverySlab[]>(data.delivery?.slabs ?? DEFAULT_SLABS);
  const [freeDeliveryAbove, setFreeDeliveryAbove] = useState(data.delivery?.freeDeliveryAbove ?? '500');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  function updateSlab(id: string, patch: Partial<DeliverySlab>) {
    setSlabs(prev => prev.map(slab => (slab.id === id ? { ...slab, ...patch } : slab)));
    if (errors.slabs) setErrors(prev => ({ ...prev, slabs: undefined }));
  }

  function removeSlab(id: string) {
    setSlabs(prev => prev.filter(slab => slab.id !== id));
  }

  function addSlab() {
    setSlabs(prev => [...prev, { id: `slab-${Date.now()}`, range: '', charge: '' }]);
  }

  async function handleContinue() {
    const nextErrors: Errors = {};
    if (slabs.length === 0) {
      nextErrors.slabs = 'Add at least one delivery slab';
    } else if (slabs.some(slab => !slab.range.trim() || !slab.charge.trim())) {
      nextErrors.slabs = 'Fill in the range and charge for every slab';
    }
    if (!isPositiveNumber(minimumOrder)) {
      nextErrors.minimumOrder = 'Enter a valid amount';
    }
    if (!isPositiveNumber(freeDeliveryAbove)) {
      nextErrors.freeDeliveryAbove = 'Enter a valid amount';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const value = {
      fulfillmentType,
      deliveryRadiusKm: radius,
      minimumOrderForDelivery: minimumOrder,
      chargeType,
      slabs,
      freeDeliveryAbove,
    };
    setSaving(true);
    try {
      await api.patch('/vendor/store-setup/delivery', value);
      updateDelivery(value);
      navigation.navigate('ServiceAvailability');
    } catch (err) {
      setErrors({ form: getApiErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScreenContainer backgroundColor={colors.surface} scrollable>
      <NavHeader title="Store Setup" onBack={() => navigation.goBack()} />
      <ProgressSteps currentStep={5} totalSteps={7} label="Delivery Settings" />
      <View style={styles.content}>
        <View style={styles.headingBlock}>
          <Text style={styles.heading}>Delivery & Fulfillment</Text>
          <Text style={styles.subtitle}>How will customers receive their orders?</Text>
        </View>

        <FormSectionCard title="Fulfillment Type">
          <SelectableCard
            icon="truck"
            title="Home Delivery"
            description="Deliver to customer's address"
            selected={fulfillmentType === 'delivery'}
            onPress={() => setFulfillmentType('delivery')}
          />
          <SelectableCard
            icon="home"
            title="Self Pickup"
            description="Customer collects from store"
            selected={fulfillmentType === 'pickup'}
            onPress={() => setFulfillmentType('pickup')}
          />
          <SelectableCard
            icon="users"
            title="Both Options"
            description="Let customers choose at checkout"
            selected={fulfillmentType === 'both'}
            onPress={() => setFulfillmentType('both')}
          />
        </FormSectionCard>

        <FormSectionCard title="Delivery Zone">
          <View>
            <View style={styles.radiusHeader}>
              <Text style={styles.radiusLabel}>Delivery Radius</Text>
              <Text style={styles.radiusValue}>{radius} km</Text>
            </View>
            <View style={styles.radiusChipsRow}>
              {RADIUS_OPTIONS.map(option => (
                <Pressable
                  key={option}
                  style={[styles.radiusChip, radius === option && styles.radiusChipActive]}
                  onPress={() => setRadius(option)}
                >
                  <Text
                    style={[styles.radiusChipText, radius === option && styles.radiusChipTextActive]}
                  >
                    {option} km
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <Input
            label="Minimum Order for Delivery (₹)"
            value={minimumOrder}
            onChangeText={text => {
              setMinimumOrder(text.replace(/[^0-9]/g, ''));
              if (errors.minimumOrder) setErrors(prev => ({ ...prev, minimumOrder: undefined }));
            }}
            keyboardType="number-pad"
            placeholder="150"
            error={errors.minimumOrder}
          />
        </FormSectionCard>

        <FormSectionCard title="Delivery Charges">
          <SelectField label="Charge Type" value={chargeType} options={CHARGE_TYPES} onChange={setChargeType} />

          {chargeType === 'Distance-based slab' ? (
            <View style={styles.slabsList}>
              {slabs.map(slab => (
                <View key={slab.id} style={styles.slabRow}>
                  <Icon name="truck" size={14} color={colors.textSecondary} />
                  <TextInput
                    style={styles.slabRangeInput}
                    value={slab.range}
                    onChangeText={text => updateSlab(slab.id, { range: text })}
                    placeholder="e.g. 2 – 5 km"
                    placeholderTextColor={colors.textTertiary}
                  />
                  <TextInput
                    style={styles.slabChargeInput}
                    value={slab.charge}
                    onChangeText={text => {
                      const digits = text.replace(/[^0-9]/g, '');
                      updateSlab(slab.id, { charge: digits ? `₹ ${digits}` : '' });
                    }}
                    keyboardType="number-pad"
                    placeholder="₹ 0"
                    placeholderTextColor={colors.textTertiary}
                  />
                  <Pressable hitSlop={6} onPress={() => removeSlab(slab.id)}>
                    <Icon name="x" size={13} color={colors.textSecondary} />
                  </Pressable>
                </View>
              ))}
              <Pressable style={styles.addSlabButton} onPress={addSlab}>
                <Icon name="plus" size={14} color={colors.textSecondary} />
                <Text style={styles.addSlabText}>Add slab</Text>
              </Pressable>
              {errors.slabs ? <Text style={styles.errorText}>{errors.slabs}</Text> : null}
            </View>
          ) : null}

          <Input
            label="Free Delivery Above (₹)"
            value={freeDeliveryAbove}
            onChangeText={text => {
              setFreeDeliveryAbove(text.replace(/[^0-9]/g, ''));
              if (errors.freeDeliveryAbove) setErrors(prev => ({ ...prev, freeDeliveryAbove: undefined }));
            }}
            keyboardType="number-pad"
            placeholder="500"
            helperText={errors.freeDeliveryAbove ? undefined : 'Free delivery for orders above this amount'}
            error={errors.freeDeliveryAbove}
          />
        </FormSectionCard>

        {errors.form ? <Text style={styles.errorText}>{errors.form}</Text> : null}

        <View style={styles.footer}>
          <Button label="Save & Continue" onPress={handleContinue} loading={saving} />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
    gap: spacing.xl,
  },
  headingBlock: {
    gap: spacing.xxs,
  },
  heading: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.textSecondary,
  },
  radiusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.md,
  },
  radiusLabel: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  radiusValue: {
    ...typography.bodySemibold,
    color: colors.primary,
  },
  radiusChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  radiusChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  radiusChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  radiusChipText: {
    ...typography.caption,
    fontFamily: fontFamilies.medium,
    color: colors.textPrimary,
  },
  radiusChipTextActive: {
    color: colors.white,
  },
  slabsList: {
    gap: spacing.sm,
  },
  slabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  slabRangeInput: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.textPrimary,
    flex: 1,
    paddingVertical: 0,
  },
  slabChargeInput: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
    minWidth: 64,
    textAlign: 'right',
    paddingVertical: 0,
  },
  addSlabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: radii.md,
    paddingVertical: spacing.md,
  },
  addSlabText: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.textSecondary,
  },
  footer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
  },
});
