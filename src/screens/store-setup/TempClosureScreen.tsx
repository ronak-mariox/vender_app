import React, { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, FormSectionCard, Input, NavHeader, ScreenContainer, SelectField } from '../../components';
import { Icon } from '../../icons/Icon';
import { useStoreSetup, type TempClosureData } from '../../context/StoreSetupContext';
import { TIME_OPTIONS } from '../../utils/time';
import { isRequired, type FormErrors } from '../../utils/validators';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'TempClosure'>;

type Errors = FormErrors<'reason' | 'fromDate' | 'toDate'>;

const REASONS = ['Festival / Holiday', 'Maintenance', 'Staff Shortage', 'Personal Emergency', 'Other'];

export function TempClosureScreen({ navigation }: Props) {
  const { data, updateTempClosure } = useStoreSetup();
  const [form, setForm] = useState<TempClosureData>(
    data.tempClosure ?? {
      reason: 'Festival / Holiday',
      customMessage: "Closed for Diwali celebrations. We'll be back on 3rd Nov!",
      fromDate: '01 Nov 2024',
      toDate: '02 Nov 2024',
      closeFromTime: '12:00 AM',
      reopenAt: '9:00 AM',
      notifyCustomers: true,
    },
  );
  const [errors, setErrors] = useState<Errors>({});

  function set<K extends keyof TempClosureData>(key: K, value: TempClosureData[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
    if (key === 'reason' && errors.reason) setErrors(prev => ({ ...prev, reason: undefined }));
    if (key === 'fromDate' && errors.fromDate) setErrors(prev => ({ ...prev, fromDate: undefined }));
    if (key === 'toDate' && errors.toDate) setErrors(prev => ({ ...prev, toDate: undefined }));
  }

  function handleCloseStore() {
    const nextErrors: Errors = {};
    if (!isRequired(form.reason)) nextErrors.reason = 'Select a reason';
    if (!isRequired(form.fromDate)) nextErrors.fromDate = 'Required';
    if (!isRequired(form.toDate)) nextErrors.toDate = 'Required';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    updateTempClosure(form);
    navigation.navigate('ClosureConfirmation');
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
            value={form.customMessage}
            onChangeText={text => set('customMessage', text)}
            helperText="Shown on your store page during closure"
          />
        </FormSectionCard>

        <FormSectionCard title="Closure Period">
          <View style={styles.row}>
            <View style={styles.rowItem}>
              <Text style={styles.label}>From</Text>
              <Input
                value={form.fromDate}
                onChangeText={text => set('fromDate', text)}
                leftIcon="calendar"
                error={errors.fromDate}
              />
            </View>
            <View style={styles.rowItem}>
              <Text style={styles.label}>To</Text>
              <Input
                value={form.toDate}
                onChangeText={text => set('toDate', text)}
                leftIcon="calendar"
                error={errors.toDate}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.rowItem}>
              <Text style={styles.label}>Close From Time</Text>
              <SelectField value={form.closeFromTime} options={TIME_OPTIONS} onChange={value => set('closeFromTime', value)} />
            </View>
            <View style={styles.rowItem}>
              <Text style={styles.label}>Reopen At</Text>
              <SelectField value={form.reopenAt} options={TIME_OPTIONS} onChange={value => set('reopenAt', value)} />
            </View>
          </View>
        </FormSectionCard>

        <View style={styles.notifyCard}>
          <View style={styles.notifyTextColumn}>
            <Text style={styles.notifyTitle}>Notify Customers</Text>
            <Text style={styles.notifySubtitle}>Send push notification to recent customers</Text>
          </View>
          <Switch
            value={form.notifyCustomers}
            onValueChange={value => set('notifyCustomers', value)}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>

        <View style={styles.buttonRow}>
          <View style={styles.buttonRowItem}>
            <Button label="Cancel" variant="outline" onPress={() => navigation.goBack()} />
          </View>
          <View style={styles.buttonRowItem}>
            <Button label="Close Store" onPress={handleCloseStore} />
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
