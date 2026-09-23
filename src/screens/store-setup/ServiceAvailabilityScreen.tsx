import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, FormSectionCard, Input, NavHeader, ProgressSteps, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { useStoreSetup, type DeliverySlot } from '../../context/StoreSetupContext';
import { api, getApiErrorMessage } from '../../services/api';
import { isPositiveNumber, type FormErrors } from '../../utils/validators';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ServiceAvailability'>;

type Errors = FormErrors<'maxOrders'>;

const DEFAULT_SLOTS: DeliverySlot[] = [
  { id: 'morning', label: 'Morning', window: '8:00 AM – 12:00 PM', totalSlots: 20, usedSlots: 12 },
  { id: 'afternoon', label: 'Afternoon', window: '12:00 PM – 4:00 PM', totalSlots: 20, usedSlots: 8 },
  { id: 'evening', label: 'Evening', window: '4:00 PM – 8:00 PM', totalSlots: 25, usedSlots: 19 },
  { id: 'night', label: 'Night', window: '8:00 PM – 10:00 PM', totalSlots: 10, usedSlots: 3 },
];

export function ServiceAvailabilityScreen({ navigation }: Props) {
  const { data, updateServiceAvailability } = useStoreSetup();
  const [slotsEnabled, setSlotsEnabled] = useState(data.serviceAvailability?.slotsEnabled ?? true);
  const [slots] = useState<DeliverySlot[]>(data.serviceAvailability?.slots ?? DEFAULT_SLOTS);
  const [maxOrders, setMaxOrders] = useState(data.serviceAvailability?.maxSimultaneousOrders ?? '25');
  const [autoPause, setAutoPause] = useState(data.serviceAvailability?.autoPauseAtCapacity ?? true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  async function handleContinue() {
    const nextErrors: Errors = {};
    if (!isPositiveNumber(maxOrders)) {
      nextErrors.maxOrders = 'Enter a valid number of orders';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const value = {
      slotsEnabled,
      slots,
      maxSimultaneousOrders: maxOrders,
      autoPauseAtCapacity: autoPause,
    };
    setSaving(true);
    try {
      await api.patch('/vendor/store-setup/availability', value);
      updateServiceAvailability(value);
      navigation.navigate('StoreStatus');
    } catch (err) {
      setErrors({ form: getApiErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScreenContainer backgroundColor={colors.surface} scrollable>
      <NavHeader title="Store Setup" onBack={() => navigation.goBack()} />
      <ProgressSteps currentStep={6} totalSteps={7} label="Service Availability" />
      <View style={styles.content}>
        <View style={styles.headingBlock}>
          <Text style={styles.heading}>Service Availability</Text>
          <Text style={styles.subtitle}>Configure delivery slots and capacity</Text>
        </View>

        <FormSectionCard title="Delivery Slots">
          <View style={styles.toggleRow}>
            <View style={styles.toggleTextColumn}>
              <Text style={styles.toggleTitle}>Enable Delivery Slots</Text>
              <Text style={styles.toggleSubtitle}>Let customers choose a delivery time window</Text>
            </View>
            <Switch
              value={slotsEnabled}
              onValueChange={setSlotsEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          {slotsEnabled ? (
            <View style={styles.slotsList}>
              {slots.map(slot => (
                <View key={slot.id} style={styles.slotRow}>
                  <View style={styles.slotIcon}>
                    <Icon name="clock" size={16} color={colors.primary} />
                  </View>
                  <View style={styles.slotTextColumn}>
                    <Text style={styles.slotLabel}>{slot.label}</Text>
                    <Text style={styles.slotWindow}>{slot.window}</Text>
                  </View>
                  <View style={styles.slotCountColumn}>
                    <Text style={styles.slotCount}>{slot.totalSlots} slots</Text>
                    <Text style={styles.slotUsed}>{slot.usedSlots} used</Text>
                  </View>
                  <Pressable hitSlop={6} onPress={() => Alert.alert(slot.label, 'Editing slots coming soon.')}>
                    <Icon name="edit" size={14} color={colors.textSecondary} />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}
        </FormSectionCard>

        <FormSectionCard title="Order Capacity">
          <Input
            label="Max Simultaneous Orders"
            value={maxOrders}
            onChangeText={text => {
              setMaxOrders(text.replace(/[^0-9]/g, ''));
              if (errors.maxOrders) setErrors(prev => ({ ...prev, maxOrders: undefined }));
            }}
            keyboardType="number-pad"
            placeholder="25"
            helperText={errors.maxOrders ? undefined : 'Store will auto-pause when this limit is reached'}
            error={errors.maxOrders}
          />
          <View style={styles.toggleRow}>
            <View style={styles.toggleTextColumn}>
              <Text style={styles.toggleTitle}>Auto-pause when at capacity</Text>
              <Text style={styles.toggleSubtitle}>Automatically mark store busy</Text>
            </View>
            <Switch
              value={autoPause}
              onValueChange={setAutoPause}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
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
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  toggleTextColumn: {
    flex: 1,
    gap: 2,
  },
  toggleTitle: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  toggleSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  slotsList: {
    gap: spacing.sm,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  slotIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotTextColumn: {
    flex: 1,
    gap: 1,
  },
  slotLabel: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  slotWindow: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  slotCountColumn: {
    alignItems: 'flex-end',
  },
  slotCount: {
    ...typography.captionSemibold,
    color: colors.textPrimary,
  },
  slotUsed: {
    ...typography.tiny,
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
