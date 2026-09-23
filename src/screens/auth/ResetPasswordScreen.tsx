import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, IconCircle, Input, NavHeader, PasswordStrengthMeter, ScreenContainer } from '../../components';
import { useVendorAuth } from '../../context/VendorAuthContext';
import { getApiErrorMessage } from '../../services/api';
import { minLength, passwordsMatch, type FormErrors as SharedFormErrors } from '../../utils/validators';
import { colors, fontFamilies, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

type FormErrors = SharedFormErrors<'newPassword' | 'confirmPassword'>;

export function ResetPasswordScreen({ navigation, route }: Props) {
  const { resetToken } = route.params;
  const { resetPassword } = useVendorAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    const nextErrors: FormErrors = {};
    if (!minLength(newPassword, 8)) nextErrors.newPassword = 'Password must be at least 8 characters';
    if (!passwordsMatch(newPassword, confirmPassword)) nextErrors.confirmPassword = 'Passwords do not match';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await resetPassword(resetToken, newPassword);
      setDone(true);
    } catch (error) {
      setErrors({ form: getApiErrorMessage(error, 'Could not reset your password. Please try again.') });
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <ScreenContainer scrollable>
        <View style={styles.successContent}>
          <IconCircle icon="check" size={96} iconSize={52} />
          <Text style={styles.successHeading}>Password Updated</Text>
          <Text style={styles.successSubtitle}>
            Your password has been reset successfully.{'\n'}Please log in with your new password.
          </Text>
          <View style={styles.successFooter}>
            <Button label="Go to Login" onPress={() => navigation.replace('Login')} />
          </View>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable>
      <NavHeader title="Reset Password" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <View style={styles.headingBlock}>
          <Text style={styles.heading}>Set a new password</Text>
          <Text style={styles.subtitle}>Choose a new password for your vendor account</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.passwordField}>
            <Input
              label="New Password"
              required
              leftIcon="lock"
              isPassword
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Create a new password"
              autoCapitalize="none"
              error={errors.newPassword}
            />
            <PasswordStrengthMeter password={newPassword} />
          </View>

          <Input
            label="Confirm New Password"
            required
            leftIcon="lock"
            isPassword
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter your new password"
            autoCapitalize="none"
            error={errors.confirmPassword}
          />

          {errors.form ? <Text style={styles.errorText}>{errors.form}</Text> : null}
        </View>

        <View style={styles.footer}>
          <Button label="Reset Password" onPress={handleSubmit} loading={submitting} />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
  },
  headingBlock: {
    gap: spacing.xxs,
    paddingBottom: spacing.xxl,
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
  form: {
    gap: spacing.xl,
  },
  passwordField: {
    gap: spacing.md,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
  },
  footer: {
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  successContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.huge,
    gap: spacing.xs,
  },
  successHeading: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    paddingTop: spacing.lg,
  },
  successSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingTop: spacing.xs,
  },
  successFooter: {
    width: '100%',
    paddingTop: spacing.huge,
  },
});
