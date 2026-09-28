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
  UploadDropzone,
} from '../../components';
import { Icon } from '../../icons/Icon';
import { useRegistration, type BusinessProofData } from '../../context/RegistrationContext';
import { api, getApiErrorMessage } from '../../services/api';
import { pickAndUploadDocument } from '../../services/upload';
import { filenameFromUrl } from '../../utils/format';
import { isRequired, type FormErrors } from '../../utils/validators';
import { formatDisplayDate, handleRegistrationSaveError, isoToDate, toIsoDate } from './registrationHelpers';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'BusinessProof'>;

const DOCUMENT_TYPES = [
  'Trade License',
  'Shop & Establishment Certificate',
  'MSME / Udyam Registration',
  'GST Registration Certificate',
  'Certificate of Incorporation',
];

const FIELDS = ['documentType', 'documentNumber', 'issueDate', 'expiryDate', 'frontUrl', 'backUrl'] as const;
type Errors = FormErrors<(typeof FIELDS)[number]>;
type DateField = 'issueDate' | 'expiryDate';

export function BusinessProofScreen({ navigation }: Props) {
  const { data, updateBusinessProof } = useRegistration();
  const [form, setForm] = useState<BusinessProofData>(
    data.businessProof ?? {
      documentType: 'Trade License',
      documentNumber: '',
      issueDate: '',
      expiryDate: '',
      frontUrl: '',
      backUrl: '',
    },
  );
  const [errors, setErrors] = useState<Errors>({});
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [saving, setSaving] = useState(false);
  const [datePickerField, setDatePickerField] = useState<DateField | null>(null);

  useEffect(() => {
    if (data.businessProof) setForm(data.businessProof);
  }, [data.businessProof]);

  function set<K extends keyof BusinessProofData>(key: K, value: BusinessProofData[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
    if (key in errors) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  }

  function handleDateChange(event: DateTimePickerEvent, selectedDate?: Date) {
    const field = datePickerField;
    if (Platform.OS === 'android') {
      setDatePickerField(null);
    }
    if (event.type === 'dismissed' || !selectedDate || !field) return;
    set(field, toIsoDate(selectedDate));
    if (Platform.OS === 'ios') {
      setDatePickerField(null);
    }
  }

  async function handleUploadFront() {
    setUploadingFront(true);
    try {
      const result = await pickAndUploadDocument();
      if (result) set('frontUrl', result.url);
    } catch (err) {
      Alert.alert('Upload failed', getApiErrorMessage(err, 'Could not upload the front side.'));
    } finally {
      setUploadingFront(false);
    }
  }

  async function handleUploadBack() {
    setUploadingBack(true);
    try {
      const result = await pickAndUploadDocument();
      if (result) set('backUrl', result.url);
    } catch (err) {
      Alert.alert('Upload failed', getApiErrorMessage(err, 'Could not upload the back side.'));
    } finally {
      setUploadingBack(false);
    }
  }

  async function handleContinue() {
    const nextErrors: Errors = {};
    if (!isRequired(form.documentType)) nextErrors.documentType = 'Select a document type';
    if (!isRequired(form.documentNumber)) nextErrors.documentNumber = 'Enter the document number';
    if (!isRequired(form.issueDate)) nextErrors.issueDate = 'Enter the issue date';
    if (!isRequired(form.frontUrl)) nextErrors.frontUrl = 'Upload the front side of the document';
    if (form.expiryDate && form.issueDate && form.expiryDate < form.issueDate) {
      nextErrors.expiryDate = 'Expiry date must be after the issue date';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      await api.patch('/vendor/registration/business-proof', {
        documentType: form.documentType,
        documentNumber: form.documentNumber.trim(),
        issueDate: form.issueDate,
        ...(form.expiryDate ? { expiryDate: form.expiryDate } : {}),
        frontUrl: form.frontUrl,
        ...(form.backUrl ? { backUrl: form.backUrl } : {}),
      });
      updateBusinessProof(form);
      navigation.navigate('BankDetails');
    } catch (err) {
      handleRegistrationSaveError<Errors>(
        err,
        setErrors,
        'Could not save your business proof. Please try again.',
        FIELDS,
      );
    } finally {
      setSaving(false);
    }
  }

  const sidesUploaded = (form.frontUrl ? 1 : 0) + (form.backUrl ? 1 : 0);

  return (
    <ScreenContainer backgroundColor={colors.surface} scrollable>
      <NavHeader title="Business Registration" onBack={() => navigation.goBack()} />
      <ProgressSteps currentStep={7} totalSteps={8} label="Business Proof" />
      <View style={styles.content}>
        <View style={styles.headingBlock}>
          <Text style={styles.heading}>Business Proof</Text>
          <Text style={styles.subtitle}>Upload a valid proof of your business existence</Text>
        </View>

        <FormSectionCard title="Document Details">
          <SelectField
            label="Document Type"
            required
            value={form.documentType}
            options={DOCUMENT_TYPES}
            onChange={value => set('documentType', value)}
            error={errors.documentType}
          />
          <Input
            label="Document Number"
            required
            leftIcon="hash"
            value={form.documentNumber}
            onChangeText={text => set('documentNumber', text)}
            placeholder="As printed on the document"
            error={errors.documentNumber}
          />
          <View>
            <Text style={styles.label}>
              Issue Date <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.dateRow}>
              <View style={styles.dateItem}>
                <Pressable
                  style={[styles.datePressable, errors.issueDate && styles.datePressableError]}
                  onPress={() => setDatePickerField('issueDate')}
                >
                  <Icon name="calendar" size={16} color={colors.textSecondary} />
                  <Text style={[styles.dateValue, !form.issueDate && styles.datePlaceholder]} numberOfLines={1}>
                    {form.issueDate ? formatDisplayDate(form.issueDate) : 'Issue date'}
                  </Text>
                </Pressable>
                {errors.issueDate ? <Text style={styles.errorText}>{errors.issueDate}</Text> : null}
              </View>
              <View style={styles.dateItem}>
                <Pressable
                  style={[styles.datePressable, errors.expiryDate && styles.datePressableError]}
                  onPress={() => setDatePickerField('expiryDate')}
                >
                  <Icon name="calendar" size={16} color={colors.textSecondary} />
                  <Text style={[styles.dateValue, !form.expiryDate && styles.datePlaceholder]} numberOfLines={1}>
                    {form.expiryDate ? formatDisplayDate(form.expiryDate) : 'Expiry (if any)'}
                  </Text>
                </Pressable>
                {errors.expiryDate ? <Text style={styles.errorText}>{errors.expiryDate}</Text> : null}
              </View>
            </View>
            <Text style={styles.helperText}>Issue date (required) — Expiry date (leave empty if the document has none)</Text>
            {form.expiryDate ? (
              <Pressable onPress={() => set('expiryDate', '')} hitSlop={8}>
                <Text style={styles.clearText}>Clear expiry date</Text>
              </Pressable>
            ) : null}
          </View>
          {datePickerField ? (
            <DateTimePicker
              value={
                isoToDate(form[datePickerField]) ??
                (datePickerField === 'expiryDate' ? isoToDate(form.issueDate) : null) ??
                new Date()
              }
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={datePickerField === 'issueDate' ? new Date() : undefined}
              minimumDate={datePickerField === 'expiryDate' ? isoToDate(form.issueDate) ?? undefined : undefined}
              onChange={handleDateChange}
            />
          ) : null}
        </FormSectionCard>

        <FormSectionCard>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Document Upload</Text>
            <Badge label={`${sidesUploaded} of 2 sides`} />
          </View>
          {form.frontUrl ? (
            <FileCard
              fileName={filenameFromUrl(form.frontUrl)}
              onReplace={handleUploadFront}
              onDelete={() => set('frontUrl', '')}
            />
          ) : (
            <Button
              label="Upload Front Side"
              variant="outline"
              loading={uploadingFront}
              onPress={handleUploadFront}
            />
          )}
          {errors.backUrl ? <Text style={styles.errorText}>{errors.backUrl}</Text> : null}
          {form.backUrl ? (
            <FileCard
              fileName={filenameFromUrl(form.backUrl)}
              onReplace={handleUploadBack}
              onDelete={() => set('backUrl', '')}
            />
          ) : (
            <UploadDropzone
              label={uploadingBack ? 'Uploading…' : 'Upload back side (optional)'}
              onPress={handleUploadBack}
            />
          )}
          <Text style={styles.requirementsText}>
            Accepted: JPG, PNG, PDF • Max size: 5MB per file
          </Text>
          {errors.frontUrl ? <Text style={styles.errorText}>{errors.frontUrl}</Text> : null}
        </FormSectionCard>

        <FormSectionCard title="Accepted Documents">
          {DOCUMENT_TYPES.map(type => (
            <View key={type} style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>{type}</Text>
            </View>
          ))}
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
  clearText: {
    ...typography.caption,
    fontFamily: fontFamilies.medium,
    color: colors.primary,
    paddingTop: spacing.xs,
  },
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
  label: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  required: {
    color: colors.error,
  },
  dateRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  dateItem: {
    flex: 1,
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
  datePressableError: {
    borderColor: colors.error,
    backgroundColor: colors.errorSurface,
  },
  dateValue: {
    ...typography.body,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  datePlaceholder: {
    color: colors.textTertiary,
  },
  helperText: {
    ...typography.tiny,
    color: colors.textSecondary,
    paddingTop: spacing.xs,
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
  requirementsText: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 9999,
    backgroundColor: colors.primary,
  },
  bulletText: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.textPrimary,
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
