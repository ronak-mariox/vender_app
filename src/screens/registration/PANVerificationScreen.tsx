import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
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
import { api, getApiErrorMessage, getFieldErrors } from '../../services/api';
import { pickAndUploadDocument } from '../../services/upload';
import { filenameFromUrl } from '../../utils/format';
import { isRequired, isValidPAN, type FormErrors } from '../../utils/validators';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'PANVerification'>;

const PAN_TYPES = ['Individual (Personal PAN)', 'Business / Firm PAN', 'HUF PAN'];
const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

type Errors = FormErrors<'panNumber' | 'holderName' | 'dob' | 'documentUrl'>;

export function PANVerificationScreen({ navigation }: Props) {
  const { data, updatePanDetails } = useRegistration();
  const [form, setForm] = useState<PanDetailsData>(
    data.panDetails ?? {
      panNumber: data.ownerInfo?.pan ?? '',
      verified: Boolean(data.ownerInfo?.pan && PAN_PATTERN.test(data.ownerInfo.pan)),
      holderName: data.ownerInfo?.fullName?.toUpperCase() ?? '',
      dob: data.ownerInfo?.dob ?? '',
      panType: 'Individual (Personal PAN)',
      documentUrl: '',
    },
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  function set<K extends keyof PanDetailsData>(key: K, value: PanDetailsData[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
    if (key === 'panNumber' && errors.panNumber) setErrors(prev => ({ ...prev, panNumber: undefined }));
    if (key === 'holderName' && errors.holderName) setErrors(prev => ({ ...prev, holderName: undefined }));
    if (key === 'dob' && errors.dob) setErrors(prev => ({ ...prev, dob: undefined }));
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
    if (!isRequired(form.dob)) nextErrors.dob = 'Enter the date of birth linked to PAN';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      await api.patch('/vendor/registration/pan-details', {
        panNumber: form.panNumber,
        holderName: form.holderName,
        dob: form.dob,
        panType: form.panType,
        documentUrl: form.documentUrl,
      });
      updatePanDetails(form);
      navigation.navigate('BusinessProof');
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors as Errors);
      } else {
        setErrors({ form: getApiErrorMessage(err, 'Could not save your PAN details. Please try again.') });
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScreenContainer backgroundColor={colors.surface} scrollable>
      <NavHeader title="Business Registration" onBack={() => navigation.goBack()} />
      <ProgressSteps currentStep={5} totalSteps={8} label="PAN Verification" />
      <View style={styles.content}>
        <View style={styles.headingBlock}>
          <Text style={styles.heading}>PAN Verification</Text>
          <Text style={styles.subtitle}>Verify your PAN for tax compliance and identity</Text>
        </View>

        {form.verified ? (
          <View style={styles.verifiedBanner}>
            <View style={styles.verifiedIcon}>
              <Icon name="shield-check" size={18} color={colors.white} />
            </View>
            <View style={styles.verifiedTextColumn}>
              <Text style={styles.verifiedTitle}>PAN Successfully Verified</Text>
              <Text style={styles.verifiedSubtitle}>Identity confirmed via Income Tax Database</Text>
            </View>
          </View>
        ) : null}

        <FormSectionCard title="PAN Details">
          <View style={styles.gap}>
            <Text style={styles.label}>
              PAN Number <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inlineRow}>
              <View style={styles.inlineInput}>
                <Input
                  leftIcon="hash"
                  value={form.panNumber}
                  onChangeText={text => {
                    const next = text.toUpperCase().slice(0, 10);
                    set('panNumber', next);
                    set('verified', PAN_PATTERN.test(next));
                  }}
                  placeholder="ABCDE1234F"
                  autoCapitalize="characters"
                  error={errors.panNumber}
                />
              </View>
              {form.verified ? <Badge label="Verified" tone="success" icon="check" /> : null}
            </View>
          </View>

          <Input
            label="PAN Holder Name"
            value={form.holderName}
            onChangeText={text => set('holderName', text.toUpperCase())}
            autoCapitalize="characters"
            helperText="Name as per Income Tax records"
            error={errors.holderName}
          />
          <Input
            label="Date of Birth (linked to PAN)"
            leftIcon="calendar"
            value={form.dob}
            onChangeText={text => set('dob', text)}
            placeholder="15 March 1988"
            error={errors.dob}
          />
          <SelectField
            label="PAN Type"
            value={form.panType}
            options={PAN_TYPES}
            onChange={value => set('panType', value)}
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
  verifiedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: colors.primarySurface,
    borderWidth: 1.5,
    borderColor: colors.primaryBorder,
  },
  verifiedIcon: {
    width: 36,
    height: 36,
    borderRadius: 9999,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedTextColumn: {
    flex: 1,
    gap: 1,
  },
  verifiedTitle: {
    ...typography.labelSemibold,
    color: colors.primaryDark,
  },
  verifiedSubtitle: {
    ...typography.caption,
    color: colors.primary,
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
    alignItems: 'center',
  },
  inlineInput: {
    flex: 1,
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
