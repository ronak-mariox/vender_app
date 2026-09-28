import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, Input, NavHeader, ScreenContainer, SegmentedControl } from '../../components';
import { Icon } from '../../icons/Icon';
import { useProfile } from '../../context/ProfileContext';
import { isRequired, isValidIFSC, type FormErrors } from '../../utils/validators';
import { getApiErrorMessage, getFieldErrors } from '../../services/api';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProfileEditBankDetails'>;

type Errors = FormErrors<
  'accountHolderName' | 'accountNumber' | 'confirmAccountNumber' | 'ifsc' | 'bankName' | 'confirmed'
>;

export function ProfileEditBankDetailsScreen({ navigation }: Props) {
  const { bankDetails, requestBankDetailsChange } = useProfile();

  const [accountHolderName, setAccountHolderName] = useState(bankDetails.accountHolderName);
  const [bankName, setBankName] = useState(bankDetails.bankName);
  const [branch, setBranch] = useState(bankDetails.branch);
  const [ifsc, setIfsc] = useState(bankDetails.ifsc);
  const [accountType, setAccountType] = useState<'Savings' | 'Current'>(
    bankDetails.accountType === 'Current' ? 'Current' : 'Savings',
  );
  const [upiId, setUpiId] = useState(bankDetails.upiId);
  // Account number is left blank rather than pre-filled with the masked value —
  // matches Figma's blank "Enter/Re-enter account number" fields and avoids
  // silently re-saving an already-masked number.
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    if (isSaving) return;
    const nextErrors: Errors = {};
    if (!isRequired(accountHolderName)) nextErrors.accountHolderName = 'Required';
    if (!isRequired(bankName)) nextErrors.bankName = 'Required';
    if (!isRequired(accountNumber)) nextErrors.accountNumber = 'Required';
    if (!isValidIFSC(ifsc)) nextErrors.ifsc = 'Enter a valid IFSC code';
    if (accountNumber !== confirmAccountNumber) nextErrors.confirmAccountNumber = 'Account numbers do not match';
    if (!confirmed) nextErrors.confirmed = 'Please confirm these details are accurate';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSaving(true);
    try {
      await requestBankDetailsChange({
        accountHolderName: accountHolderName.trim(),
        bankName: bankName.trim(),
        branch: branch.trim() || undefined,
        ifsc,
        accountType,
        accountNumber,
        upiId: upiId.trim() || undefined,
      });
      navigation.goBack();
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      setErrors({
        accountHolderName: fieldErrors.accountHolderName,
        accountNumber: fieldErrors.accountNumber,
        ifsc: fieldErrors.ifsc,
        form: getApiErrorMessage(err, 'Could not submit your request.'),
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ScreenContainer scrollable={false} backgroundColor={colors.white}>
      <NavHeader title="Edit Bank Details" onBack={() => navigation.goBack()} />
      <View style={styles.body}>
        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.warningBanner}>
            <Icon name="alert-triangle" size={14} color={colors.warningDark} />
            <Text style={styles.warningText}>
              This submits a change request for admin review. Your current bank details stay active until it's
              approved.
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Account Holder Name"
              required
              value={accountHolderName}
              onChangeText={text => {
                setAccountHolderName(text.toUpperCase());
                if (errors.accountHolderName) setErrors(prev => ({ ...prev, accountHolderName: undefined }));
              }}
              autoCapitalize="characters"
              error={errors.accountHolderName}
            />
            <Input
              label="Account Number"
              required
              value={accountNumber}
              onChangeText={text => {
                setAccountNumber(text.replace(/[^0-9]/g, ''));
                if (errors.accountNumber) setErrors(prev => ({ ...prev, accountNumber: undefined }));
              }}
              placeholder="Enter account number"
              keyboardType="number-pad"
              error={errors.accountNumber}
            />
            <Input
              label="Confirm Account Number"
              required
              value={confirmAccountNumber}
              onChangeText={text => {
                setConfirmAccountNumber(text.replace(/[^0-9]/g, ''));
                if (errors.confirmAccountNumber) setErrors(prev => ({ ...prev, confirmAccountNumber: undefined }));
              }}
              placeholder="Re-enter account number"
              keyboardType="number-pad"
              error={errors.confirmAccountNumber}
            />
            <Input
              label="IFSC Code"
              required
              value={ifsc}
              onChangeText={text => {
                setIfsc(text.toUpperCase().slice(0, 11));
                if (errors.ifsc) setErrors(prev => ({ ...prev, ifsc: undefined }));
              }}
              placeholder="HDFC0001234"
              autoCapitalize="characters"
              rightElement={<Icon name="refresh-cw" size={14} color={colors.primary} />}
              error={errors.ifsc}
            />
            <Input
              label="Bank Name"
              required
              value={bankName}
              onChangeText={text => {
                setBankName(text);
                if (errors.bankName) setErrors(prev => ({ ...prev, bankName: undefined }));
              }}
              error={errors.bankName}
            />
            <Input label="Branch" value={branch} onChangeText={setBranch} placeholder="Optional" />

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Account Type</Text>
              <SegmentedControl
                options={[
                  { label: 'Savings', value: 'Savings' },
                  { label: 'Current', value: 'Current' },
                ]}
                value={accountType}
                onChange={setAccountType}
              />
            </View>

            <Input
              label="UPI ID"
              value={upiId}
              onChangeText={setUpiId}
              placeholder="Optional"
              autoCapitalize="none"
            />

            <Pressable
              style={styles.confirmRow}
              onPress={() => {
                setConfirmed(v => !v);
                if (errors.confirmed) setErrors(prev => ({ ...prev, confirmed: undefined }));
              }}
              hitSlop={8}
            >
              <View
                style={[
                  styles.checkbox,
                  confirmed && styles.checkboxChecked,
                  errors.confirmed && styles.checkboxError,
                ]}
              >
                {confirmed ? <Icon name="check" size={12} color={colors.white} strokeWidth={3} /> : null}
              </View>
              <Text style={styles.confirmText}>I confirm these details are accurate.</Text>
            </Pressable>
            {errors.confirmed ? <Text style={styles.errorText}>{errors.confirmed}</Text> : null}

            {errors.form ? <Text style={styles.errorText}>{errors.form}</Text> : null}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button label="Submit for Review" onPress={handleSave} loading={isSaving} />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    gap: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.md,
    backgroundColor: colors.warningSurface,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  warningText: {
    ...typography.body,
    fontSize: 13,
    lineHeight: 20.8,
    color: colors.warningDark,
    flex: 1,
  },
  form: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  fieldGroup: {
    gap: spacing.sm,
  },
  fieldLabel: {
    ...typography.label,
    color: colors.textPrimary,
  },
  confirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.xs,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxError: {
    borderColor: colors.error,
  },
  confirmText: {
    ...typography.label,
    color: colors.textPrimary,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
});
