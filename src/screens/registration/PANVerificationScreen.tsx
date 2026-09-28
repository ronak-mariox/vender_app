import React, { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import {
  Badge,
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
import { useRegistration, type PanDetailsData } from '../../context/RegistrationContext';
import { api, getApiErrorMessage } from '../../services/api';
import { pickAndUploadDocument } from '../../services/upload';
import { filenameFromUrl } from '../../utils/format';
import { isRequired, isValidPAN, type FormErrors } from '../../utils/validators';
import { formatDisplayDate, handleRegistrationSaveError, isoToDate, toIsoDate } from './registrationHelpers';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'PANVerification'>;

const PAN_TYPES = ['Individual (Personal PAN)', 'Business / Firm PAN', 'HUF PAN'];

const FIELDS = ['panNumber', 'holderName', 'dob', 'panType', 'documentUrl'] as const;
type Errors = FormErrors<(typeof FIELDS)[number]>;

export function PANVerificationScreen({ navigation }: Props) {
  const { data, updatePanDetails } = useRegistration();
  const [form, setForm] = useState<PanDetailsData>(
    data.panDetails ?? {
      panNumber: data.ownerInfo?.pan ?? '',
      holderName: data.ownerInfo?.fullName?.toUpperCase() ?? '',
      dob: data.ownerInfo?.dob ?? '',
      panType: 'Individual (Personal PAN)',
      documentUrl: '',
    },
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (data.panDetails) setForm(data.panDetails);
  }, [data.panDetails]);

  function set<K extends keyof PanDetailsData>(key: K, value: PanDetailsData[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => (prev[key] ? { ...prev, [key]: undefined } : prev));
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

  async function handleUploadDocument() {
    setUploading(true);
    try {
      const result = await pickAndUploadDocument();
      if (result) {
        set('documentUrl', result.url);
      }
    } catch (err) {
      Alert.alert('Upload failed', getApiErrorMessage(err, 'Could not upload the PAN document.'));
    } finally {
      setUploading(false);
    }
  }

  async function handleContinue() {
    const nextErrors: Errors = {};
    if (!isValidPAN(form.panNumber)) nextErrors.panNumber = 'Enter a valid PAN (e.g. ABCDE1234F)';
    if (!isRequired(form.holderName)) nextErrors.holderName = 'Enter the PAN holder name';
    if (!isoToDate(form.dob)) nextErrors.dob = 'Select the date of birth linked to PAN';
    if (!isRequired(form.panType)) nextErrors.panType = 'Select the PAN type';
    if (!isRequired(form.documentUrl)) nextErrors.documentUrl = 'Upload your PAN card';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      await api.patch('/vendor/registration/pan-details', {
        panNumber: form.panNumber.trim().toUpperCase(),
        holderName: form.holderName.trim(),
        dob: form.dob,
        panType: form.panType,
        documentUrl: form.documentUrl,
      });
      updatePanDetails(form);
      navigation.navigate('BusinessProof');
    } catch (err) {
      handleRegistrationSaveError<Errors>(err, setErrors, 'Could not save your PAN details. Please try again.', FIELDS);
    } finally {
      setSaving(false);
    }
  }

  const panLooksValid = isValidPAN(form.panNumber);

  return (
    <ScreenContainer backgroundColor={colors.surface} scrollable>
      <NavHeader title="Business Registration" onBack={() => navigation.goBack()} />
      <ProgressSteps currentStep={6} totalSteps={8} label="PAN Details" />
      <View style={styles.content}>
        <View style={styles.headingBlock}>
          <Text style={styles.heading}>PAN Details</Text>
          <Text style={styles.subtitle}>Your PAN is reviewed by our team along with your uploaded PAN card</Text>
        </View>

        <FormSectionCard title="PAN Details">
          <View style={styles.gap}>
            <Text style={styles.label}>
              PAN Number <Text style={styles.required}>*</Text>
            </Text>
            <Input
              leftIcon="hash"
              value={form.panNumber}
              onChangeText={text => set('panNumber', text.toUpperCase().slice(0, 10))}
              placeholder="ABCDE1234F"
              autoCapitalize="characters"
              error={errors.panNumber}
            />
            {panLooksValid && !errors.panNumber ? (
              <View style={styles.formatRow}>
                <Icon name="check-circle" size={13} color={colors.primary} />
                <Text style={styles.formatText}>Format looks valid</Text>
              </View>
            ) : null}
          </View>

          <Input
            label="PAN Holder Name"
            required
            value={form.holderName}
            onChangeText={text => set('holderName', text.toUpperCase())}
            autoCapitalize="characters"
            helperText="Name exactly as printed on the PAN card"
            error={errors.holderName}
          />
          <View style={styles.gap}>
            <Text style={styles.label}>
              Date of Birth (linked to PAN) <Text style={styles.required}>*</Text>
            </Text>
            <Pressable
              style={[styles.datePressable, errors.dob ? styles.datePressableError : null]}
              onPress={() => setShowDatePicker(true)}
            >
              <Icon name="calendar" size={16} color={colors.textSecondary} />
              <Text style={[styles.dateValue, !form.dob && styles.datePlaceholder]}>
                {form.dob ? formatDisplayDate(form.dob) : 'Select date of birth'}
              </Text>
            </Pressable>
            {errors.dob ? <Text style={styles.errorText}>{errors.dob}</Text> : null}
          </View>
          {showDatePicker ? (
            <DateTimePicker
              value={isoToDate(form.dob) ?? new Date(1990, 0, 1)}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={new Date()}
              onChange={handleDateChange}
            />
          ) : null}
          <SelectField
            label="PAN Type"
            required
            value={form.panType}
            options={PAN_TYPES}
            onChange={value => set('panType', value)}
            error={errors.panType}
          />
        </FormSectionCard>

        <FormSectionCard>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>PAN Document</Text>
            {form.documentUrl ? <Badge label="Uploaded" tone="success" /> : null}
          </View>
          {form.documentUrl ? (
            <FileCard
              fileName={filenameFromUrl(form.documentUrl)}
              onReplace={handleUploadDocument}
              onDelete={() => set('documentUrl', '')}
            />
          ) : (
            <Button label="Upload PAN Card" variant="outline" loading={uploading} onPress={handleUploadDocument} />
          )}
          {errors.documentUrl ? <Text style={styles.errorText}>{errors.documentUrl}</Text> : null}
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
  formatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  formatText: {
    ...typography.caption,
    color: colors.primary,
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.72,
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
