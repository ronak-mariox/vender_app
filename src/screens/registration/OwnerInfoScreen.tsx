import React, { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, FormSectionCard, Input, NavHeader, ProgressSteps, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { useRegistration, type OwnerInfoData } from '../../context/RegistrationContext';
import { useVendorAuth } from '../../context/VendorAuthContext';
import { api } from '../../services/api';
import { formatDisplayDate, handleRegistrationSaveError, isoToDate, toIsoDate } from './registrationHelpers';
import { isAdult, isRequired, isValidEmail, isValidPAN, type FormErrors } from '../../utils/validators';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'OwnerInfo'>;

const FIELDS = ['fullName', 'mobile', 'email', 'dob', 'pan'] as const;
type Errors = FormErrors<(typeof FIELDS)[number]>;

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
  const { vendor } = useVendorAuth();
  const [form, setForm] = useState<OwnerInfoData>(
    data.ownerInfo ?? { fullName: '', mobile: '', email: '', dob: '', pan: '' },
  );

  useEffect(() => {
    if (data.ownerInfo) setForm(data.ownerInfo);
  }, [data.ownerInfo]);

  // Mobile/email are account-level (verified at sign-up); fall back to the
  // signed-in vendor's profile when the registration copy doesn't have them yet.
  useEffect(() => {
    if (!vendor) return;
    setForm(prev => ({
      ...prev,
      fullName: prev.fullName || vendor.fullName || '',
      mobile: prev.mobile || vendor.phone || '',
      email: prev.email || vendor.email || '',
    }));
  }, [vendor]);
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
    if (!isRequired(form.mobile)) nextErrors.mobile = 'Mobile number is missing from your account';
    if (!isValidEmail(form.email)) nextErrors.email = 'A valid email is missing from your account';
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
        pan: form.pan.trim().toUpperCase(),
      });
      updateOwnerInfo(form);
      navigation.navigate('StoreInfo');
    } catch (err) {
      handleRegistrationSaveError<Errors>(err, setErrors, 'Could not save your details. Please try again.', FIELDS);
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
            placeholder="Full name"
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
            error={errors.mobile}
          />
          <Input
            label="Email Address"
            required
            leftIcon="mail"
            value={form.email}
            onChangeText={text => set('email', text.trim())}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
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
              value={isoToDate(form.dob) ?? maxDob}
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
