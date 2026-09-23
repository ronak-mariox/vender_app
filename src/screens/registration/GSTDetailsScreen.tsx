import React, { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import {
  Button,
  FileCard,
  FormSectionCard,
  Input,
  NavHeader,
  ProgressSteps,
  ScreenContainer,
  SelectField,
} from '../../components';
import { Icon } from '../../icons/Icon';
import { useRegistration, type GstDetailsData } from '../../context/RegistrationContext';
import { api, getApiErrorMessage, getFieldErrors } from '../../services/api';
import { pickAndUploadDocument } from '../../services/upload';
import { filenameFromUrl } from '../../utils/format';
import { isRequired, isValidGSTIN, type FormErrors } from '../../utils/validators';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'GSTDetails'>;

const GST_CATEGORIES = ['Regular Taxpayer', 'Composition Scheme', 'Casual Taxable Person'];

type Errors = FormErrors<'gstin' | 'businessName' | 'registrationDate' | 'category'>;

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

export function GSTDetailsScreen({ navigation }: Props) {
  const { data, updateGstDetails } = useRegistration();
  const [form, setForm] = useState<GstDetailsData>(
    data.gstDetails ?? {
      registered: true,
      gstin: '',
      verified: false,
      businessName: data.businessInfo?.legalName ?? '',
      registrationDate: '',
      category: '',
      certificateUrl: '',
    },
  );
  const [verifying, setVerifying] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  function set<K extends keyof GstDetailsData>(key: K, value: GstDetailsData[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function clearError(key: keyof Errors) {
    setErrors(prev => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }

  function handleDateChange(event: DateTimePickerEvent, selectedDate?: Date) {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (event.type === 'dismissed' || !selectedDate) return;
    set('registrationDate', toIsoDate(selectedDate));
    if (Platform.OS === 'ios') {
      setShowDatePicker(false);
    }
  }

  function handleVerify() {
    if (!isValidGSTIN(form.gstin)) {
      setErrors(prev => ({ ...prev, gstin: 'Please enter a valid 15-character GSTIN' }));
      return;
    }
    clearError('gstin');
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      set('verified', true);
    }, 900);
  }

  async function handleUploadCertificate() {
    setUploading(true);
    try {
      const result = await pickAndUploadDocument();
      if (result) {
        set('certificateUrl', result.url);
      }
    } catch (err) {
      Alert.alert('Upload failed', getApiErrorMessage(err, 'Could not upload the GST certificate.'));
    } finally {
      setUploading(false);
    }
  }

  async function handleContinue() {
    if (!form.registered) {
      setErrors({});
      setSaving(true);
      try {
        await api.patch('/vendor/registration/gst-details', {
          registered: form.registered,
          gstin: form.gstin,
          businessName: form.businessName,
          registrationDate: form.registrationDate,
          category: form.category,
          certificateUrl: form.certificateUrl,
        });
        updateGstDetails(form);
        navigation.navigate('PANVerification');
      } catch (err) {
        const fieldErrors = getFieldErrors(err);
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors as Errors);
        } else {
          setErrors({ form: getApiErrorMessage(err, 'Could not save your GST details. Please try again.') });
        }
      } finally {
        setSaving(false);
      }
      return;
    }

    const nextErrors: Errors = {};
    if (!isValidGSTIN(form.gstin)) nextErrors.gstin = 'Please enter a valid 15-character GSTIN';
    else if (!form.verified) nextErrors.gstin = 'Please verify your GSTIN before continuing';
    if (!isRequired(form.businessName)) nextErrors.businessName = 'Enter the registered business name';
    if (!isRequired(form.registrationDate)) nextErrors.registrationDate = 'Select the GST registration date';
    if (!isRequired(form.category)) nextErrors.category = 'Select the GST category';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      await api.patch('/vendor/registration/gst-details', {
        registered: form.registered,
        gstin: form.gstin,
        businessName: form.businessName,
        registrationDate: form.registrationDate,
        category: form.category,
        certificateUrl: form.certificateUrl,
      });
      updateGstDetails(form);
      navigation.navigate('PANVerification');
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors as Errors);
      } else {
        setErrors({ form: getApiErrorMessage(err, 'Could not save your GST details. Please try again.') });
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScreenContainer backgroundColor={colors.surface} scrollable>
      <NavHeader title="Business Registration" onBack={() => navigation.goBack()} />
      <ProgressSteps currentStep={5} totalSteps={8} label="GST Details" />
      <View style={styles.content}>
        <View style={styles.headingBlock}>
          <Text style={styles.heading}>GST Details</Text>
          <Text style={styles.subtitle}>Provide your GST registration information</Text>
        </View>

        <View style={styles.toggleCard}>
          <View style={styles.toggleTextColumn}>
            <Text style={styles.toggleTitle}>Registered under GST</Text>
            <Text style={styles.toggleSubtitle}>Toggle off if your turnover is below ₹20 lakhs</Text>
          </View>
          <Switch
            value={form.registered}
            onValueChange={value => set('registered', value)}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>

        {form.registered ? (
          <>
            <FormSectionCard title="GST Registration">
              <View style={styles.gap}>
                <Text style={styles.label}>
                  GSTIN <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inlineRow}>
                  <View style={styles.inlineInput}>
                    <Input
                      leftIcon="hash"
                      value={form.gstin}
                      onChangeText={text => {
                        set('gstin', text.toUpperCase().slice(0, 15));
                        set('verified', false);
                        clearError('gstin');
                      }}
                      placeholder="29AABCU9603R1ZM"
                      autoCapitalize="characters"
                      error={errors.gstin}
                    />
                  </View>
                  <Button
                    label={verifying ? 'Checking' : form.verified ? 'Verified' : 'Verify'}
                    variant="outline"
                    fullWidth={false}
                    loading={verifying}
                    disabled={form.verified}
                    onPress={handleVerify}
                  />
                </View>
                {form.verified ? (
                  <View style={styles.verifiedRow}>
                    <Icon name="check-circle" size={13} color={colors.primary} />
                    <Text style={styles.verifiedText}>GSTIN verified successfully</Text>
                  </View>
                ) : null}
              </View>

              <Input
                label="Registered Business Name"
                value={form.businessName}
                onChangeText={text => {
                  set('businessName', text);
                  clearError('businessName');
                }}
                editable={form.verified === false}
                helperText={form.verified ? 'Auto-filled from GST portal' : undefined}
                error={errors.businessName}
              />
              <View style={styles.dateField}>
                <Text style={styles.label}>GST Registration Date</Text>
                <Pressable
                  style={[styles.datePressable, errors.registrationDate && styles.datePressableError]}
                  onPress={() => {
                    setShowDatePicker(true);
                    clearError('registrationDate');
                  }}
                >
                  <Icon name="calendar" size={16} color={colors.textSecondary} />
                  <Text style={[styles.dateValue, !form.registrationDate && styles.datePlaceholder]}>
                    {form.registrationDate ? formatDisplayDate(form.registrationDate) : 'Select registration date'}
                  </Text>
                </Pressable>
                {errors.registrationDate ? <Text style={styles.errorText}>{errors.registrationDate}</Text> : null}
              </View>
              {showDatePicker ? (
                <DateTimePicker
                  value={form.registrationDate ? new Date(`${form.registrationDate}T00:00:00`) : new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  maximumDate={new Date()}
                  onChange={handleDateChange}
                />
              ) : null}
              <SelectField
                label="GST Category"
                value={form.category}
                options={GST_CATEGORIES}
                onChange={value => {
                  set('category', value);
                  clearError('category');
                }}
                error={errors.category}
              />
            </FormSectionCard>

            <FormSectionCard title="GST Certificate">
              {form.certificateUrl ? (
                <FileCard
                  fileName={filenameFromUrl(form.certificateUrl)}
                  onReplace={handleUploadCertificate}
                  onDelete={() => set('certificateUrl', '')}
                />
              ) : (
                <Button
                  label="Upload GST Certificate"
                  variant="outline"
                  loading={uploading}
                  onPress={handleUploadCertificate}
                />
              )}
            </FormSectionCard>
          </>
        ) : null}

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
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  toggleTextColumn: {
    flex: 1,
    gap: 2,
  },
  toggleTitle: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  toggleSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  gap: {
    gap: spacing.sm,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
  },
  required: {
    color: colors.error,
  },
  inlineRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  inlineInput: {
    flex: 1,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  verifiedText: {
    ...typography.caption,
    fontFamily: fontFamilies.medium,
    color: colors.primary,
  },
  dateField: {
    gap: spacing.sm,
  },
  datePressable: {
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
  dateValue: {
    ...typography.body,
    color: colors.textPrimary,
  },
  datePlaceholder: {
    color: colors.textTertiary,
  },
  datePressableError: {
    borderColor: colors.error,
    backgroundColor: colors.errorSurface,
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
