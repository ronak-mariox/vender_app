import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useSecurity } from '../../context/SecurityContext';
import { Button, InfoBanner, NavHeader, OtpInput, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { colors, fontFamilies, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'SecurityChangeMobileOtp'>;

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;
const MAX_ATTEMPTS = 3;
// No backend is wired up for this flow — any code except this reserved
// value verifies successfully, so the wrong-OTP state stays reachable for QA.
const MOCK_WRONG_CODE = '000000';

function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function SecurityChangeMobileOtpScreen({ navigation, route }: Props) {
  const { newMobileNumber } = route.params;
  const { changeMobileNumber } = useSecurity();
  const [otp, setOtp] = useState('');
  const [isWrong, setIsWrong] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft(value => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const formattedTime = useMemo(() => formatCountdown(secondsLeft), [secondsLeft]);
  const attemptsRemaining = Math.max(MAX_ATTEMPTS - wrongAttempts, 0);
  const isLocked = attemptsRemaining <= 0;

  function handleVerify() {
    if (otp.length !== OTP_LENGTH || isLocked) return;
    if (otp === MOCK_WRONG_CODE) {
      setIsWrong(true);
      setWrongAttempts(value => value + 1);
      return;
    }
    changeMobileNumber(newMobileNumber);
    Alert.alert('Mobile Number Updated', 'Your mobile number has been changed successfully.', [
      { text: 'OK', onPress: () => navigation.navigate('ProfileSecurity') },
    ]);
  }

  function handleResend() {
    setOtp('');
    setIsWrong(false);
    setWrongAttempts(0);
    setSecondsLeft(RESEND_SECONDS);
  }

  return (
    <ScreenContainer scrollable>
      <NavHeader title="Verify OTP" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <View style={styles.headerBlock}>
          <Text style={styles.caption}>OTP sent to</Text>
          <Text style={styles.numberValue}>{newMobileNumber}</Text>
        </View>

        <View style={styles.otpSection}>
          <OtpInput
            value={otp}
            onChange={value => {
              setOtp(value);
              if (isWrong && value.length < OTP_LENGTH) {
                setIsWrong(false);
              }
            }}
            status={isWrong ? 'error' : 'default'}
            autoFocus
          />

          {isWrong ? (
            <View style={styles.errorRow}>
              <Icon name="alert-circle" size={16} color={colors.error} />
              <Text style={styles.errorText}>
                Incorrect OTP. {attemptsRemaining} attempt{attemptsRemaining === 1 ? '' : 's'} remaining.
              </Text>
            </View>
          ) : null}

          {secondsLeft > 0 ? (
            <Text style={styles.countdownText}>
              Resend in <Text style={styles.countdownValue}>{formattedTime}</Text>
            </Text>
          ) : (
            <Pressable onPress={handleResend} hitSlop={8}>
              <Text style={styles.resendLink}>Resend OTP</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.footer}>
          <Button label="Verify" onPress={handleVerify} disabled={otp.length !== OTP_LENGTH || isLocked} />
        </View>

        <InfoBanner
          variant="warning"
          message="If you didn't request this, secure your account immediately by changing your PIN."
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
    gap: spacing.xxl,
  },
  headerBlock: {
    gap: spacing.sm,
  },
  caption: {
    ...typography.body,
    color: colors.textSecondary,
  },
  numberValue: {
    fontFamily: fontFamilies.semibold,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  otpSection: {
    gap: spacing.xl,
    alignItems: 'center',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  errorText: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.error,
  },
  countdownText: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  countdownValue: {
    fontFamily: fontFamilies.semibold,
    color: colors.primary,
  },
  resendLink: {
    ...typography.labelSemibold,
    color: colors.primary,
  },
  footer: {
    paddingTop: spacing.xs,
  },
});
