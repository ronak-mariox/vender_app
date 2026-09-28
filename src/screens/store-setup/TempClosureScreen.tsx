import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, FormSectionCard, Input, NavHeader, ScreenContainer, SelectField } from '../../components';
import { Icon } from '../../icons/Icon';
import { useStoreSetup, type TempClosureData } from '../../context/StoreSetupContext';
import { TIME_OPTIONS } from '../../utils/time';
import { isRequired, type FormErrors } from '../../utils/validators';
import { formatShortDate, parseShortDate } from './storeSetupHelpers';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'TempClosure'>;

type Errors = FormErrors<'reason' | 'customMessage' | 'fromDate' | 'toDate' | 'closeFromTime' | 'reopenAt'>;
type DateKey = 'fromDate' | 'toDate';

const REASONS = ['Festival / Holiday', 'Maintenance', 'Staff Shortage', 'Personal Emergency', 'Other'];

export function TempClosureScreen({ navigation }: Props) {
  const { data, updateTempClosure } = useStoreSetup();
  const [form, setForm] = useState<TempClosureData>(
    data.tempClosure ?? {
      reason: '',
      customMessage: '',
      fromDate: '',
      toDate: '',
      closeFromTime: '',
      reopenAt: '',
      notifyCustomers: false,
    },
  );
  const [errors, setErrors] = useState<Errors>({});
  const [pickerFor, setPickerFor] = useState<DateKey | null>(null);

  function set<K extends keyof TempClosureData>(key: K, value: TempClosureData[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => (prev[key as keyof Errors] ? { ...prev, [key]: undefined } : prev));
  }

  function handleDateChange(event: DateTimePickerEvent, selectedDate?: Date) {
    const field = pickerFor;
    if (Platform.OS === 'android') setPickerFor(null);
    if (event.type === 'dismissed' || !selectedDate || !field) return;
    set(field, formatShortDate(selectedDate));
    if (Platform.OS === 'ios') setPickerFor(null);
  }

  function handleCloseStore() {
    const from = parseShortDate(form.fromDate);
    const to = parseShortDate(form.toDate);
    const nextErrors: Errors = {};
    if (!isRequired(form.reason)) nextErrors.reason = 'Select a reason';
    if (!isRequired(form.customMessage)) nextErrors.customMessage = 'Add a message for your customers';
    if (!from) nextErrors.fromDate = 'Required';
    if (!to) nextErrors.toDate = 'Required';
    else if (from && to.getTime() < from.getTime()) nextErrors.toDate = 'Must be on or after the start date';
    if (!isRequired(form.closeFromTime)) nextErrors.closeFromTime = 'Required';
    if (!isRequired(form.reopenAt)) nextErrors.reopenAt = 'Required';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    updateTempClosure({ ...form, customMessage: form.customMessage.trim(), notifyCustomers: false });
    navigation.navigate('ClosureConfirmation');
  }

  function renderDateField(key: DateKey, label: string) {
    return (
      <View style={styles.rowItem}>
        <Text style={styles.label}>{label}</Text>
        <Pressable
          style={[styles.datePressable, errors[key] ? styles.datePressableError : null]}
          onPress={() => setPickerFor(key)}
        >
          <Icon name="calendar" size={16} color={colors.textSecondary} />
          <Text style={[styles.dateValue, !form[key] && styles.datePlaceholder]}>{form[key] || 'Select'}</Text>
        </Pressable>
        {errors[key] ? <Text style={styles.errorText}>{errors[key]}</Text> : null}
      </View>
    );
  }

  return (
    <ScreenContainer backgroundColor={colors.surface} scrollable>
      <NavHeader title="Temporary Closure" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <View style={styles.warningBanner}>
          <Icon name="pause-circle" size={20} color="#B45309" />
          <View style={styles.warningTextColumn}>
            <Text style={styles.warningTitle}>Temporarily Close Your Store</Text>
            <Text style={styles.warningBody}>
              Customers won't be able to place new orders during this period. Existing pending
              orders must be fulfilled.
            </Text>
          </View>
        </View>

        <FormSectionCard title="Closure Details">
          <SelectField
            label="Reason for Closure"
            required
            value={form.reason}
            options={REASONS}
            onChange={value => set('reason', value)}
            error={errors.reason}
          />
          <Input
            label="Custom Message for Customers"
            required
            value={form.customMessage}
            onChangeText={text => set('customMessage', text)}
            placeholder="e.g. We're closed for a short break and will be back soon"
            helperText={errors.customMessage ? undefined : 'Shown on your store page during closure'}
            error={errors.customMessage}
          />
        </FormSectionCard>

        <FormSectionCard title="Closure Period">
          <View style={styles.row}>
            {renderDateField('fromDate', 'From')}
            {renderDateField('toDate', 'To')}
          </View>
          {pickerFor ? (
            <DateTimePicker
              value={parseShortDate(form[pickerFor]) ?? new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={pickerFor === 'toDate' ? parseShortDate(form.fromDate) ?? new Date() : new Date()}
              onChange={handleDateChange}
            />
          ) : null}
          <View style={styles.row}>
            <View style={styles.rowItem}>
              <Text style={styles.label}>Close From Time</Text>
              <SelectField
                value={form.closeFromTime}
                options={TIME_OPTIONS}
                onChange={value => set('closeFromTime', value)}
                error={errors.closeFromTime}
              />
            </View>
            <View style={styles.rowItem}>
              <Text style={styles.label}>Reopen At</Text>
              <SelectField
                value={form.reopenAt}
                options={TIME_OPTIONS}
                onChange={value => set('reopenAt', value)}
                error={errors.reopenAt}
              />
            </View>
          </View>
        </FormSectionCard>

        <View style={styles.notifyCard}>
          <View style={styles.notifyTextColumn}>
            <Text style={styles.notifyTitle}>Notify Customers</Text>
            <Text style={styles.notifySubtitle}>Coming soon</Text>
          </View>
          <Switch
            value={false}
            disabled
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>

        <View style={styles.buttonRow}>
          <View style={styles.buttonRowItem}>
            <Button label="Cancel" variant="outline" onPress={() => navigation.goBack()} />
          </View>
          <View style={styles.buttonRowItem}>
            <Button label="Review Closure" onPress={handleCloseStore} />
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    gap: spacing.xl,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
    padding: spacing.xl,
    borderRadius: radii.xl,
    backgroundColor: colors.warningSurface,
    borderWidth: 1.5,
    borderColor: '#FCD34D',
  },
  warningTextColumn: {
    flex: 1,
    gap: 2,
  },
  warningTitle: {
    ...typography.bodySemibold,
    color: colors.warningDark,
  },
  warningBody: {
    ...typography.caption,
    color: '#A16207',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  rowItem: {
    flex: 1,
    gap: spacing.sm,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  datePressable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    height: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  datePressableError: {
    borderColor: colors.error,
  },
  dateValue: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  datePlaceholder: {
    color: colors.textSecondary,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    paddingTop: spacing.xs,
  },
  notifyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  notifyTextColumn: {
    flex: 1,
    gap: 2,
  },
  notifyTitle: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  notifySubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  buttonRowItem: {
    flex: 1,
  },
});
