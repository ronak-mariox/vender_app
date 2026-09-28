import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, FormSectionCard, Input, NavHeader, ProgressSteps, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { useStoreSetup, type DeliverySlot, type ServiceAvailabilityData } from '../../context/StoreSetupContext';
import { api } from '../../services/api';
import { type FormErrors } from '../../utils/validators';
import { handleFormSaveError } from '../registration/registrationHelpers';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ServiceAvailability'>;

const FIELDS = ['slots', 'maxSimultaneousOrders'] as const;
type Errors = FormErrors<(typeof FIELDS)[number]>;

type SlotDraft = { id: string; label: string; window: string; totalSlots: string; usedSlots: number };

function toDrafts(slots: DeliverySlot[] | undefined): SlotDraft[] {
  return (slots ?? []).map(slot => ({ ...slot, totalSlots: String(slot.totalSlots) }));
}

export function ServiceAvailabilityScreen({ navigation }: Props) {
  const { data, updateServiceAvailability } = useStoreSetup();
  const saved = data.serviceAvailability;
  const [slotsEnabled, setSlotsEnabled] = useState(saved?.slotsEnabled ?? false);
  const [slots, setSlots] = useState<SlotDraft[]>(saved?.slotsEnabled ? toDrafts(saved.slots) : []);
  const [maxOrders, setMaxOrders] = useState(saved?.maxSimultaneousOrders ?? '');
  const [autoPause, setAutoPause] = useState(saved?.autoPauseAtCapacity ?? false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (!saved) return;
    setSlotsEnabled(saved.slotsEnabled);
    setSlots(saved.slotsEnabled ? toDrafts(saved.slots) : []);
    setMaxOrders(saved.maxSimultaneousOrders);
    setAutoPause(saved.autoPauseAtCapacity);
  }, [saved]);

  function updateSlot(id: string, patch: Partial<SlotDraft>) {
    setSlots(prev => prev.map(slot => (slot.id === id ? { ...slot, ...patch } : slot)));
    setErrors(prev => (prev.slots ? { ...prev, slots: undefined } : prev));
  }

  function addSlot() {
    setSlots(prev => [...prev, { id: `slot-${Date.now()}`, label: '', window: '', totalSlots: '', usedSlots: 0 }]);
  }

  function removeSlot(id: string) {
    setSlots(prev => prev.filter(slot => slot.id !== id));
  }

  async function handleContinue() {
    const nextErrors: Errors = {};
    const capacity = parseInt(maxOrders, 10);
    if (!Number.isInteger(capacity) || capacity < 1) {
      nextErrors.maxSimultaneousOrders = 'Enter a valid number of orders';
    }
    if (slotsEnabled) {
      if (slots.length === 0) nextErrors.slots = 'Add at least one delivery slot';
      else if (
        slots.some(slot => !slot.label.trim() || !slot.window.trim() || !(parseInt(slot.totalSlots, 10) >= 1))
      ) {
        nextErrors.slots = 'Every slot needs a name, a time window and a capacity of at least 1';
      }
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const hours = data.operatingHours;
    // The backend always expects at least one slot; without slot-based delivery the
    // store's whole opening window is the single slot.
    const payloadSlots: DeliverySlot[] = slotsEnabled
      ? slots.map(slot => ({
          id: slot.id,
          label: slot.label.trim(),
          window: slot.window.trim(),
          totalSlots: parseInt(slot.totalSlots, 10),
          usedSlots: slot.usedSlots,
        }))
      : [
          {
            id: 'slot-all-day',
            label: 'Store hours',
            window: hours ? `${hours.defaultOpen} – ${hours.defaultClose}` : 'Store hours',
            totalSlots: capacity,
            usedSlots: 0,
          },
        ];
    const value: ServiceAvailabilityData = {
      slotsEnabled,
      slots: payloadSlots,
      maxSimultaneousOrders: String(capacity),
      autoPauseAtCapacity: autoPause,
    };
    setSaving(true);
    try {
      await api.patch('/vendor/store-setup/availability', value);
      updateServiceAvailability(value);
      navigation.navigate('StoreStatus');
    } catch (err) {
      handleFormSaveError<Errors>(err, setErrors, 'Could not save service availability. Please try again.', FIELDS);
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
                    <TextInput
                      style={styles.slotInput}
                      value={slot.label}
                      onChangeText={text => updateSlot(slot.id, { label: text })}
                      placeholder="Slot name, e.g. Morning"
                      placeholderTextColor={colors.textTertiary}
                    />
                    <TextInput
                      style={styles.slotInput}
                      value={slot.window}
                      onChangeText={text => updateSlot(slot.id, { window: text })}
                      placeholder="Window, e.g. 8:00 AM – 12:00 PM"
                      placeholderTextColor={colors.textTertiary}
                    />
                    <TextInput
                      style={styles.slotInput}
                      value={slot.totalSlots}
                      onChangeText={text => updateSlot(slot.id, { totalSlots: text.replace(/[^0-9]/g, '') })}
                      placeholder="Orders per slot"
                      keyboardType="number-pad"
                      placeholderTextColor={colors.textTertiary}
                    />
                  </View>
                  <Pressable hitSlop={6} onPress={() => removeSlot(slot.id)}>
                    <Icon name="x" size={14} color={colors.textSecondary} />
                  </Pressable>
                </View>
              ))}
              <Pressable style={styles.addSlotButton} onPress={addSlot}>
                <Icon name="plus" size={14} color={colors.textSecondary} />
                <Text style={styles.addSlotText}>Add slot</Text>
              </Pressable>
              {errors.slots ? <Text style={styles.errorText}>{errors.slots}</Text> : null}
            </View>
          ) : null}
        </FormSectionCard>

        <FormSectionCard title="Order Capacity">
          <Input
            label="Max Simultaneous Orders"
            value={maxOrders}
            onChangeText={text => {
              setMaxOrders(text.replace(/[^0-9]/g, ''));
              setErrors(prev => ({ ...prev, maxSimultaneousOrders: undefined }));
            }}
            keyboardType="number-pad"
            placeholder="e.g. 25"
            helperText={errors.maxSimultaneousOrders ? undefined : 'How many orders you can prepare at once'}
            error={errors.maxSimultaneousOrders}
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
    gap: spacing.xs,
  },
  slotInput: {
    ...typography.caption,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  addSlotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  addSlotText: {
    ...typography.captionSemibold,
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
