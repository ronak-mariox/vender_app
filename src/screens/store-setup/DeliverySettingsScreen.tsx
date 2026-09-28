import React, { useEffect, useState } from 'react';
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
  type DeliverySettingsData,
  type DeliverySlab,
  type FulfillmentType,
} from '../../context/StoreSetupContext';
import { api } from '../../services/api';
import { type FormErrors } from '../../utils/validators';
import { handleFormSaveError } from '../registration/registrationHelpers';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'DeliverySettings'>;

const FIELDS = [
  'fulfillmentType',
  'deliveryRadiusKm',
  'minimumOrderForDelivery',
  'chargeType',
  'slabs',
  'flatCharge',
  'freeDeliveryAbove',
] as const;
type Errors = FormErrors<(typeof FIELDS)[number]>;

const SLAB_MODE = 'Distance-based slab';
const FLAT_MODE = 'Flat rate';
const FREE_MODE = 'Free delivery';
const CHARGE_TYPES = [SLAB_MODE, FLAT_MODE, FREE_MODE];
const RADIUS_OPTIONS = [1, 3, 5, 10, 20];
const ALL_DISTANCES = 'All distances';

const isAmount = (value: string) => /^\d+$/.test(value.trim());
const chargeDigits = (charge: string) => charge.replace(/[^0-9]/g, '');

export function DeliverySettingsScreen({ navigation }: Props) {
  const { data, updateDelivery } = useStoreSetup();
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType | null>(
    data.delivery?.fulfillmentType ?? null,
  );
  const [radius, setRadius] = useState<number | null>(data.delivery?.deliveryRadiusKm ?? null);
  const [minimumOrder, setMinimumOrder] = useState(data.delivery?.minimumOrderForDelivery ?? '');
  const [chargeType, setChargeType] = useState(data.delivery?.chargeType ?? '');
  const [slabs, setSlabs] = useState<DeliverySlab[]>(
    data.delivery?.chargeType === SLAB_MODE ? data.delivery.slabs : [],
  );
  const [flatCharge, setFlatCharge] = useState(
    data.delivery?.chargeType === FLAT_MODE ? chargeDigits(data.delivery.slabs[0]?.charge ?? '') : '',
  );
  const [freeDeliveryAbove, setFreeDeliveryAbove] = useState(data.delivery?.freeDeliveryAbove ?? '');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    const delivery = data.delivery;
    if (!delivery) return;
    setFulfillmentType(delivery.fulfillmentType);
    setRadius(delivery.deliveryRadiusKm);
    setMinimumOrder(delivery.minimumOrderForDelivery);
    setChargeType(delivery.chargeType);
    setSlabs(delivery.chargeType === SLAB_MODE ? delivery.slabs : []);
    setFlatCharge(delivery.chargeType === FLAT_MODE ? chargeDigits(delivery.slabs[0]?.charge ?? '') : '');
    setFreeDeliveryAbove(delivery.freeDeliveryAbove);
  }, [data.delivery]);

  function clearError(key: keyof Errors) {
    setErrors(prev => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }

  function updateSlab(id: string, patch: Partial<DeliverySlab>) {
    setSlabs(prev => prev.map(slab => (slab.id === id ? { ...slab, ...patch } : slab)));
    clearError('slabs');
  }

  function removeSlab(id: string) {
    setSlabs(prev => prev.filter(slab => slab.id !== id));
  }

  function addSlab() {
    setSlabs(prev => [...prev, { id: `slab-${Date.now()}`, range: '', charge: '' }]);
    clearError('slabs');
  }

  async function handleContinue() {
    const nextErrors: Errors = {};
    if (!fulfillmentType) nextErrors.fulfillmentType = 'Choose how customers receive their orders';
    if (!radius) nextErrors.deliveryRadiusKm = 'Select a delivery radius';
    if (!isAmount(minimumOrder)) nextErrors.minimumOrderForDelivery = 'Enter a valid amount (0 for no minimum)';
    if (!chargeType) nextErrors.chargeType = 'Select how you charge for delivery';
    if (chargeType === SLAB_MODE) {
      if (slabs.length === 0) {
        nextErrors.slabs = 'Add at least one delivery slab';
      } else if (slabs.some(slab => !slab.range.trim() || !slab.charge.trim())) {
        nextErrors.slabs = 'Fill in the range and charge for every slab';
      }
    }
    if (chargeType === FLAT_MODE && !isAmount(flatCharge)) nextErrors.flatCharge = 'Enter the delivery charge';
    if (chargeType !== FREE_MODE && !isAmount(freeDeliveryAbove)) {
      nextErrors.freeDeliveryAbove = 'Enter a valid amount';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !fulfillmentType || !radius) return;

    const payloadSlabs: DeliverySlab[] =
      chargeType === SLAB_MODE
        ? slabs.map(slab => ({ ...slab, range: slab.range.trim() }))
        : [
            {
              id: 'slab-all',
              range: ALL_DISTANCES,
              charge: chargeType === FLAT_MODE ? `₹ ${flatCharge}` : '₹ 0',
            },
          ];
    const value: DeliverySettingsData = {
      fulfillmentType,
      deliveryRadiusKm: radius,
      minimumOrderForDelivery: minimumOrder,
      chargeType,
      slabs: payloadSlabs,
      freeDeliveryAbove: chargeType === FREE_MODE ? '0' : freeDeliveryAbove,
    };
    setSaving(true);
    try {
      await api.patch('/vendor/store-setup/delivery', value);
      updateDelivery(value);
      navigation.navigate('ServiceAvailability');
    } catch (err) {
      handleFormSaveError<Errors>(err, setErrors, 'Could not save your delivery settings. Please try again.', FIELDS);
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
            onPress={() => {
              setFulfillmentType('delivery');
              clearError('fulfillmentType');
            }}
          />
          <SelectableCard
            icon="home"
            title="Self Pickup"
            description="Customer collects from store"
            selected={fulfillmentType === 'pickup'}
            onPress={() => {
              setFulfillmentType('pickup');
              clearError('fulfillmentType');
            }}
          />
          <SelectableCard
            icon="users"
            title="Both Options"
            description="Let customers choose at checkout"
            selected={fulfillmentType === 'both'}
            onPress={() => {
              setFulfillmentType('both');
              clearError('fulfillmentType');
            }}
          />
          {errors.fulfillmentType ? <Text style={styles.errorText}>{errors.fulfillmentType}</Text> : null}
        </FormSectionCard>

        <FormSectionCard title="Delivery Zone">
          <View>
            <View style={styles.radiusHeader}>
              <Text style={styles.radiusLabel}>Delivery Radius</Text>
              <Text style={styles.radiusValue}>{radius ? `${radius} km` : 'Not set'}</Text>
            </View>
            <View style={styles.radiusChipsRow}>
              {RADIUS_OPTIONS.map(option => (
                <Pressable
                  key={option}
                  style={[styles.radiusChip, radius === option && styles.radiusChipActive]}
                  onPress={() => {
                    setRadius(option);
                    clearError('deliveryRadiusKm');
                  }}
                >
                  <Text
                    style={[styles.radiusChipText, radius === option && styles.radiusChipTextActive]}
                  >
                    {option} km
                  </Text>
                </Pressable>
              ))}
            </View>
            {errors.deliveryRadiusKm ? <Text style={styles.errorText}>{errors.deliveryRadiusKm}</Text> : null}
          </View>
          <Input
            label="Minimum Order for Delivery (₹)"
            value={minimumOrder}
            onChangeText={text => {
              setMinimumOrder(text.replace(/[^0-9]/g, ''));
              clearError('minimumOrderForDelivery');
            }}
            keyboardType="number-pad"
            placeholder="0 for no minimum"
            error={errors.minimumOrderForDelivery}
          />
        </FormSectionCard>

        <FormSectionCard title="Delivery Charges">
          <SelectField
            label="Charge Type"
            value={chargeType}
            options={CHARGE_TYPES}
            onChange={value => {
              setChargeType(value);
              setErrors(prev => ({ ...prev, chargeType: undefined, slabs: undefined, flatCharge: undefined }));
            }}
            error={errors.chargeType}
          />

          {chargeType === FLAT_MODE ? (
            <Input
              label="Delivery Charge (₹)"
              required
              value={flatCharge}
              onChangeText={text => {
                setFlatCharge(text.replace(/[^0-9]/g, ''));
                clearError('flatCharge');
              }}
              keyboardType="number-pad"
              placeholder="Charge per order"
              error={errors.flatCharge}
            />
          ) : null}

          {chargeType === SLAB_MODE ? (
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

          {chargeType && chargeType !== FREE_MODE ? (
            <Input
              label="Free Delivery Above (₹)"
              value={freeDeliveryAbove}
              onChangeText={text => {
                setFreeDeliveryAbove(text.replace(/[^0-9]/g, ''));
                clearError('freeDeliveryAbove');
              }}
              keyboardType="number-pad"
              placeholder="e.g. 500"
              helperText={errors.freeDeliveryAbove ? undefined : 'Free delivery for orders above this amount'}
              error={errors.freeDeliveryAbove}
            />
          ) : null}
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
