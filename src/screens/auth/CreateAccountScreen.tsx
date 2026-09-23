import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import {
  Button,
  Checkbox,
  Input,
  NavHeader,
  PasswordStrengthMeter,
  ScreenContainer,
} from '../../components';
import { Icon } from '../../icons/Icon';
import { useRegistration } from '../../context/RegistrationContext';
import { useVendorAuth } from '../../context/VendorAuthContext';
import { getApiErrorMessage, getFieldErrors } from '../../services/api';
import { isRequired, isValidEmail, minLength, passwordsMatch, type FormErrors as SharedFormErrors } from '../../utils/validators';
import { colors, fontFamilies, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'CreateAccount'>;

type FormErrors = SharedFormErrors<'fullName' | 'email' | 'password' | 'confirmPassword' | 'terms'>;

export function CreateAccountScreen({ navigation, route }: Props) {
  const { mobileNumber, verifiedPhoneToken } = route.params;
  const { updateOwnerInfo } = useRegistration();
  const { register } = useVendorAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    const nextErrors: FormErrors = {};
    if (!isRequired(fullName)) nextErrors.fullName = 'Enter your full name';
    if (!isRequired(email)) {
      nextErrors.email = 'Enter your email address';
    } else if (!isValidEmail(email)) {
      nextErrors.email = 'Enter a valid email address';
    }
    if (!minLength(password, 8)) nextErrors.password = 'Password must be at least 8 characters';
    if (!passwordsMatch(password, confirmPassword)) nextErrors.confirmPassword = 'Passwords do not match';
    if (!agreed) nextErrors.terms = 'Please accept the Terms of Service and Privacy Policy';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await register({
        verifiedPhoneToken,
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        confirmPassword,
      });
      updateOwnerInfo({
        fullName: fullName.trim(),
        mobile: mobileNumber,
        email: email.trim(),
        dob: '',
        pan: '',
      });
      Alert.alert(
        'Account created',
        "Your vendor account is ready. Let's register your business next.",
        [{ text: 'Continue', onPress: () => navigation.replace('BusinessType') }],
      );
    } catch (error) {
      const fieldErrors = getFieldErrors(error);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors as FormErrors);
      } else {
        setErrors({ form: getApiErrorMessage(error, 'Could not create your account. Please try again.') });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScreenContainer scrollable>
      <NavHeader title="Create Account" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <View style={styles.headingBlock}>
          <Text style={styles.heading}>Set up your account</Text>
          <Text style={styles.subtitle}>Fill in your details to create a vendor account</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Full Name"
            required
            leftIcon="user"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Priya Sharma"
            autoCapitalize="words"
            error={errors.fullName}
          />

          <Input
            label="Mobile Number"
            required
            leftIcon="phone"
            value={formatMobile(mobileNumber)}
            onChangeText={() => undefined}
            editable={false}
            helperText="Verified ✓"
            rightElement={<Icon name="check" size={16} color={colors.primary} />}
          />

          <Input
            label="Email Address"
            required
            leftIcon="mail"
            value={email}
            onChangeText={setEmail}
            placeholder="priya.sharma@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <View style={styles.passwordField}>
            <Input
              label="Password"
              required
              leftIcon="lock"
              isPassword
              value={password}
              onChangeText={setPassword}
              placeholder="Create a password"
              autoCapitalize="none"
              error={errors.password}
            />
            <PasswordStrengthMeter password={password} />
          </View>

          <Input
            label="Confirm Password"
            required
            leftIcon="lock"
            isPassword
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter your password"
            autoCapitalize="none"
            error={errors.confirmPassword}
          />

          <View style={styles.termsRow}>
            <Checkbox checked={agreed} onToggle={setAgreed} />
            <Pressable style={styles.termsTextWrapper} onPress={() => setAgreed(value => !value)}>
              <Text style={styles.termsText}>
                I agree to the <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </Pressable>
          </View>
          {errors.terms ? <Text style={styles.errorText}>{errors.terms}</Text> : null}
          {errors.form ? <Text style={styles.errorText}>{errors.form}</Text> : null}
        </View>

        <View style={styles.footer}>
          <Button label="Create Account" onPress={handleSubmit} loading={submitting} />
          <Text style={styles.footerText}>
            Already have an account?{' '}
            <Text style={styles.footerLink} onPress={() => navigation.replace('Login')}>
              Login
            </Text>
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

function formatMobile(digits: string) {
  return `+91 ${digits.length > 5 ? `${digits.slice(0, 5)} ${digits.slice(5)}` : digits}`;
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
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
    paddingTop: spacing.xxs,
  },
  termsTextWrapper: {
    flex: 1,
  },
  termsText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  termsLink: {
    ...typography.caption,
    fontFamily: fontFamilies.medium,
    color: colors.primary,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
  },
  footer: {
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    ...typography.labelSemibold,
    fontFamily: fontFamilies.regular,
    color: colors.textSecondary,
  },
  footerLink: {
    color: colors.primary,
    fontFamily: fontFamilies.semibold,
  },
});
