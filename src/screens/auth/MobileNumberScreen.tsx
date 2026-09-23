import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, IconCircle, InfoBanner, NavHeader, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { useVendorAuth } from '../../context/VendorAuthContext';
import { getApiErrorMessage, getFieldErrors } from '../../services/api';
import { isValidMobile } from '../../utils/validators';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'MobileNumber'>;

export function MobileNumberScreen({ navigation, route }: Props) {
  const { intent } = route.params;
  const { requestOtp } = useVendorAuth();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const isValid = isValidMobile(phone);

  async function handleSendOtp() {
    if (!isValid) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    setError(undefined);
    setSubmitting(true);
    try {
      await requestOtp(phone);
      navigation.navigate('OtpVerification', { mobileNumber: phone, intent });
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      setError(fieldErrors.phone ?? getApiErrorMessage(err, 'Could not send OTP. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScreenContainer scrollable>
      <NavHeader title="Mobile Verification" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <View style={styles.headerBlock}>
          <IconCircle icon="phone" />
          <Text style={styles.heading}>Enter Mobile Number</Text>
          <Text style={styles.subtitle}>
            We'll send a one-time password to verify your number
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Mobile Number</Text>
              <Text style={styles.required}> *</Text>
            </View>
            <View style={styles.phoneRow}>
              <Pressable style={styles.countryCode}>
                <Text style={styles.flag}>🇮🇳</Text>
                <Text style={styles.countryCodeText}>+91</Text>
                <Icon name="chevron-down" size={14} color={colors.textSecondary} />
              </Pressable>
              <View style={[styles.phoneInputWrapper, error && styles.phoneInputError]}>
                <TextInput
                  style={styles.phoneInputText}
                  value={phone}
                  onChangeText={text => setPhone(text.replace(/[^0-9]/g, '').slice(0, 10))}
                  placeholder="98765 43210"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="number-pad"
                  maxLength={10}
                  autoFocus
                />
              </View>
            </View>
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : (
              <Text style={styles.helperText}>Enter your 10-digit mobile number</Text>
            )}
          </View>

          <InfoBanner
            variant="info"
            message="Standard SMS charges may apply. OTP is valid for 10 minutes."
          />
        </View>

        <View style={styles.footer}>
          <Button label="Send OTP" onPress={handleSendOtp} loading={submitting} />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.huge,
  },
  headerBlock: {
    alignItems: 'center',
    gap: spacing.md,
    paddingBottom: spacing.huge,
  },
  heading: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    gap: spacing.xl,
  },
  fieldGroup: {
    gap: spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
  },
  required: {
    ...typography.label,
    color: colors.error,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 52,
    paddingHorizontal: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.white,
  },
  flag: {
    fontSize: 18,
  },
  countryCodeText: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  phoneInputWrapper: {
    flex: 1,
    height: 52,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radii.md,
    backgroundColor: colors.white,
  },
  phoneInputError: {
    borderColor: colors.error,
    backgroundColor: colors.errorSurface,
  },
  phoneInputText: {
    ...typography.phoneDigit,
    color: colors.textPrimary,
    padding: 0,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
  },
  helperText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: spacing.huge,
    paddingBottom: spacing.xl,
  },
});
