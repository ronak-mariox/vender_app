import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import {
  Button,
  Input,
  NavHeader,
  ScreenContainer,
  SegmentedControl,
} from '../../components';
import { useVendorAuth } from '../../context/VendorAuthContext';
import { getApiErrorMessage } from '../../services/api';
import { resolveVendorEntryRoute } from '../../utils/vendorRouting';
import { colors, fontFamilies, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;
type LoginMethod = 'mobile' | 'email';

export function LoginScreen({ navigation, route }: Props) {
  const { login } = useVendorAuth();
  const forcedLogoutMessage = route.params?.message;

  useEffect(() => {
    if (forcedLogoutMessage) Alert.alert('Signed out', forcedLogoutMessage);
  }, [forcedLogoutMessage]);
  const [method, setMethod] = useState<LoginMethod>('mobile');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    const identifierValue = method === 'mobile' ? mobileNumber : email;
    const nextErrors: typeof errors = {};
    if (!identifierValue.trim()) {
      nextErrors.identifier =
        method === 'mobile' ? 'Enter your mobile number' : 'Enter your email address';
    }
    if (!password.trim()) {
      nextErrors.password = 'Enter your password';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await login(identifierValue.trim(), password);
      // Business registration is mandatory — never drop a vendor straight onto the
      // Dashboard without checking whether it's actually complete and approved.
      const route = await resolveVendorEntryRoute();
      (navigation as unknown as { replace: (name: string, params?: object) => void }).replace(
        route.name,
        route.params,
      );
    } catch (error) {
      setErrors({ password: getApiErrorMessage(error, 'Incorrect mobile number/email or password') });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScreenContainer scrollable>
      <NavHeader title="Login" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <View style={styles.headingBlock}>
          <Text style={styles.heading}>Welcome back</Text>
          <Text style={styles.subtitle}>Login to your Verdant vendor account</Text>
        </View>

        <View style={styles.segmentWrapper}>
          <SegmentedControl
            options={[
              { label: 'Mobile Number', value: 'mobile' },
              { label: 'Email', value: 'email' },
            ]}
            value={method}
            onChange={setMethod}
          />
        </View>

        <View style={styles.form}>
          {method === 'mobile' ? (
            <Input
              label="Mobile Number"
              required
              leftIcon="phone"
              value={mobileNumber}
              onChangeText={setMobileNumber}
              placeholder="+91 98765 43210"
              keyboardType="phone-pad"
              autoCapitalize="none"
              error={errors.identifier}
              helperText={errors.identifier ? undefined : 'Registered mobile number'}
            />
          ) : (
            <Input
              label="Email"
              required
              leftIcon="mail"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.identifier}
            />
          )}

          <View>
            <View style={styles.passwordLabelRow}>
              <Text style={styles.passwordLabel}>
                Password <Text style={styles.required}>*</Text>
              </Text>
              <Text
                style={styles.forgotLink}
                onPress={() => navigation.navigate('MobileNumber', { intent: 'login' })}
              >
                Forgot Password?
              </Text>
            </View>
            <Input
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              isPassword
              autoCapitalize="none"
              error={errors.password}
            />
          </View>
        </View>

        <View style={styles.loginButtonWrapper}>
          <Button label="Login" onPress={handleLogin} loading={submitting} />
        </View>

        <Text style={styles.footerText}>
          Don't have an account?{' '}
          <Text
            style={styles.footerLink}
            onPress={() => navigation.navigate('MobileNumber', { intent: 'create-account' })}
          >
            Create Account
          </Text>
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxxl,
    gap: 0,
  },
  headingBlock: {
    paddingBottom: spacing.xxxl,
    gap: spacing.xs,
  },
  heading: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  segmentWrapper: {
    paddingBottom: spacing.xxxl,
  },
  form: {
    gap: spacing.xl,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  passwordLabel: {
    ...typography.label,
    color: colors.textPrimary,
  },
  required: {
    color: colors.error,
  },
  forgotLink: {
    ...typography.caption,
    color: colors.primary,
    fontFamily: fontFamilies.medium,
  },
  loginButtonWrapper: {
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxl,
  },
  footerText: {
    ...typography.labelSemibold,
    fontFamily: fontFamilies.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingBottom: spacing.xl,
  },
  footerLink: {
    color: colors.primary,
    fontFamily: fontFamilies.semibold,
  },
});
