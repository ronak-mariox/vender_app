import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, FormSectionCard, Input, NavHeader, ProgressSteps, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { useRegistration, type OwnerInfoData } from '../../context/RegistrationContext';
import { api, getApiErrorMessage, getFieldErrors } from '../../services/api';
import { isAdult, isRequired, isValidPAN, type FormErrors } from '../../utils/validators';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'OwnerInfo'>;

type Errors = FormErrors<'fullName' | 'dob' | 'pan'>;

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(iso: string): string {
  if (!iso) return '';
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}

function VerifiedPill() {
  return (
    <View style={styles.verifiedPill}>
      <Icon name="check" size={12} color={colors.primary} strokeWidth={3} />
      <Text style={styles.verifiedPillText}>Verified</Text>
    </View>
  );
}

export function OwnerInfoScreen({ navigation }: Props) {
  const { data, updateOwnerInfo } = useRegistration();
  const [form, setForm] = useState<OwnerInfoData>(
    data.ownerInfo ?? { fullName: '', mobile: '', email: '', dob: '', pan: '' },
  );
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  function set<K extends keyof OwnerInfoData>(key: K, value: OwnerInfoData[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
    if (key in errors) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  }

  function handleDateChange(event: DateTimePickerEvent, selectedDate?: Date) {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (event.type === 'dismissed' || !selectedDate) return;
    set('dob', toIsoDate(selectedDate));
    if (Platform.OS === 'ios') {
      setShowDatePicker(false);
    }
  }

  async function handleContinue() {
    const nextErrors: Errors = {};
    if (!isRequired(form.fullName)) nextErrors.fullName = 'Enter the owner full name';
    if (!isRequired(form.dob)) nextErrors.dob = 'Select the date of birth';
    else if (!isAdult(form.dob)) nextErrors.dob = 'You must be at least 18 years old';
    if (!isValidPAN(form.pan)) nextErrors.pan = 'Invalid PAN format. Format: AAAAA9999A (e.g. ABCDE1234F)';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      await api.patch('/vendor/registration/owner-info', {
        fullName: form.fullName,
        mobile: form.mobile,
        email: form.email,
        dob: form.dob,
        pan: form.pan,
      });
      updateOwnerInfo(form);
      navigation.navigate('StoreInfo');
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors as Errors);
      } else {
        setErrors({ form: getApiErrorMessage(err, 'Could not save your details. Please try again.') });
      }
    } finally {
      setSaving(false);
    }
  }

  const maxDob = new Date();
  maxDob.setFullYear(maxDob.getFullYear() - 18);

  return (
    <ScreenContainer backgroundColor={colors.surface} scrollable>
      <NavHeader title="Business Registration" onBack={() => navigation.goBack()} />
      <ProgressSteps currentStep={3} totalSteps={8} label="Owner Information" />
      <View style={styles.content}>
        <View style={styles.headingBlock}>
          <Text style={styles.heading}>Owner Information</Text>
          <Text style={styles.subtitle}>Details of the primary business owner / authorized signatory</Text>
        </View>

        <FormSectionCard title="Personal Details">
          <Input
            label="Full Name"
            required
            leftIcon="user"
            value={form.fullName}
            onChangeText={text => set('fullName', text)}
            placeholder="Priya Sharma"
            autoCapitalize="words"
            helperText="As per government-issued ID"
            error={errors.fullName}
          />
          <Input
            label="Mobile Number"
            required
            leftIcon="phone"
            value={form.mobile}
            onChangeText={() => undefined}
            editable={false}
            rightElement={<VerifiedPill />}
          />
          <Input
            label="Email Address"
            required
            leftIcon="mail"
            value={form.email}
            onChangeText={() => undefined}
            editable={false}
            rightElement={<VerifiedPill />}
          />
          <View style={styles.dobField}>
            <View style={styles.labelRow}>
              <Text style={styles.dobLabel}>Date of Birth</Text>
              <Text style={styles.required}> *</Text>
            </View>
            <Pressable
              style={[styles.dobPressable, errors.dob && styles.dobPressableError]}
              onPress={() => setShowDatePicker(true)}
            >
              <Icon name="calendar" size={16} color={colors.textSecondary} />
              <Text style={[styles.dobValue, !form.dob && styles.dobPlaceholder]}>
                {form.dob ? formatDisplayDate(form.dob) : 'Select your date of birth'}
              </Text>
            </Pressable>
            {errors.dob ? (
              <Text style={styles.errorText}>{errors.dob}</Text>
            ) : (
              <Text style={styles.dobHelperText}>Must be 18 years or older</Text>
            )}
          </View>
          {showDatePicker ? (
            <DateTimePicker
              value={form.dob ? new Date(`${form.dob}T00:00:00`) : maxDob}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={maxDob}
              onChange={handleDateChange}
            />
          ) : null}
        </FormSectionCard>

        <FormSectionCard title="Tax Details">
          <Input
            label="PAN Number"
            required
            leftIcon="hash"
            value={form.pan}
            onChangeText={text => set('pan', text.toUpperCase().slice(0, 10))}
            placeholder="ABCDE1234F"
            autoCapitalize="characters"
            error={errors.pan}
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
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primarySurface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  verifiedPillText: {
    ...typography.tinyBold,
    color: colors.primary,
    fontFamily: fontFamilies.semibold,
  },
  dobField: {
    gap: spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
  },
  dobLabel: {
    ...typography.label,
    color: colors.textPrimary,
  },
  required: {
    ...typography.label,
    color: colors.error,
  },
  dobPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
  },
  dobPressableError: {
    borderColor: colors.error,
    backgroundColor: colors.errorSurface,
  },
  dobValue: {
    ...typography.body,
    color: colors.textPrimary,
  },
  dobPlaceholder: {
    color: colors.textTertiary,
  },
  dobHelperText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
  },
  footer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
});
