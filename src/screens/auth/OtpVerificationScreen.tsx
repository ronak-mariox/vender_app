import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import axios from 'axios';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, IconCircle, InfoBanner, NavHeader, OtpInput, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { useVendorAuth } from '../../context/VendorAuthContext';
import { colors, fontFamilies, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'OtpVerification'>;

type ViewState = 'default' | 'resent' | 'wrong' | 'expired';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 600;
const INITIAL_RESENDS_REMAINING = 3;

function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function OtpVerificationScreen({ navigation, route }: Props) {
  const { mobileNumber, intent } = route.params;
  const { verifyOtp, requestOtp } = useVendorAuth();
  const [otp, setOtp] = useState('');
  const [viewState, setViewState] = useState<ViewState>('default');
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [resendsRemaining, setResendsRemaining] = useState(INITIAL_RESENDS_REMAINING);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0) {
      setViewState(current => (current === 'wrong' ? current : 'expired'));
      return;
    }
    const timer = setTimeout(() => setSecondsLeft(value => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const formattedTime = useMemo(() => formatCountdown(secondsLeft), [secondsLeft]);

  async function handleVerify() {
    if (otp.length !== OTP_LENGTH || verifying) return;
    setVerifying(true);
    try {
      const result = await verifyOtp(mobileNumber, otp, intent);

      if (intent === 'create-account') {
        if (result.accountExists) {
          // Someone tried to sign up with a number that already has an account.
          navigation.replace('Login');
          return;
        }
        if ('verifiedPhoneToken' in result) {
          navigation.replace('CreateAccount', {
            mobileNumber,
            verifiedPhoneToken: result.verifiedPhoneToken,
          });
        }
        return;
      }

      // intent === 'login' — this OTP path is the forgot-password / account-recovery flow.
      if (result.accountExists && 'resetToken' in result) {
        navigation.replace('ResetPassword', { resetToken: result.resetToken });
      } else {
        navigation.replace('AccountNotFound', { mobileNumber });
      }
    } catch (error) {
      const reason =
        axios.isAxiosError(error) && (error.response?.data as { reason?: string } | undefined)?.reason;
      if (reason === 'incorrect') {
        setViewState('wrong');
      } else {
        // not_found / expired / too_many_attempts, or a network error — treat as expired
        // so the user is guided to request a fresh OTP.
        setSecondsLeft(0);
        setViewState('expired');
      }
    } finally {
      setVerifying(false);
    }
  }

  async function handleResend() {
    if (resendsRemaining <= 0 || resending) return;
    setResending(true);
    try {
      await requestOtp(mobileNumber);
      setOtp('');
      setSecondsLeft(RESEND_SECONDS);
      setResendsRemaining(value => value - 1);
      setViewState('resent');
    } catch {
      // Keep the current view state; the countdown/attempts stay unchanged so the
      // user can simply try the resend action again.
    } finally {
      setResending(false);
    }
  }

  function handleTryAgain() {
    setOtp('');
    setViewState(secondsLeft <= 0 ? 'expired' : 'default');
  }

  const otpStatus = viewState === 'wrong' ? 'error' : viewState === 'expired' ? 'expired' : 'default';

  return (
    <ScreenContainer scrollable>
      <NavHeader title="OTP Verification" onBack={() => navigation.goBack()} />

      {viewState === 'resent' ? (
        <InfoBanner
          variant="success"
          message={`OTP resent successfully to +91 ${formatMobile(mobileNumber)}`}
        />
      ) : null}

      <View style={styles.content}>
        <HeroSection
          viewState={viewState}
          mobileNumber={mobileNumber}
          resendsUsed={INITIAL_RESENDS_REMAINING - resendsRemaining}
          onChangeNumber={() => navigation.goBack()}
        />

        <View style={styles.otpSection}>
          <OtpInput
            value={otp}
            onChange={value => {
              setOtp(value);
              if (viewState === 'wrong' && value.length < OTP_LENGTH) {
                setViewState('default');
              }
            }}
            status={otpStatus}
            editable={viewState !== 'expired'}
            autoFocus
          />

          {viewState === 'wrong' ? (
            <InfoBanner
              bordered
              variant="error"
              title="Incorrect OTP entered"
              message="You have 2 attempts remaining before your account is temporarily locked."
            />
          ) : null}

          {viewState !== 'expired' ? (
            <View style={styles.countdownRow}>
              <Icon name="clock" size={14} color={colors.textSecondary} />
              <Text style={styles.countdownText}>
                Resend OTP in <Text style={styles.countdownValue}>{formattedTime}</Text>
              </Text>
            </View>
          ) : (
            <View style={styles.countdownRow}>
              <Icon name="clock" size={14} color={colors.error} />
              <Text style={styles.expiredText}>00:00 — Expired</Text>
            </View>
          )}

          {viewState === 'resent' ? (
            <InfoBanner
              variant="warning"
              message={`You have ${resendsRemaining} resend attempts remaining. Check your SMS inbox before requesting again.`}
            />
          ) : null}

          {viewState === 'expired' ? (
            <InfoBanner
              variant="neutral"
              title="OTP validity: 10 minutes"
              message="Each OTP is valid for 10 minutes from time of issue. You can request a new OTP at any time."
            />
          ) : null}
        </View>

        <View style={styles.footer}>
          {viewState === 'wrong' ? (
            <>
              <Button label="Try Again" onPress={handleTryAgain} />
              <Button
                label="Resend OTP"
                variant="text"
                onPress={handleResend}
                loading={resending}
                disabled={resendsRemaining <= 0}
              />
            </>
          ) : viewState === 'expired' ? (
            <>
              <Button
                label="Request New OTP"
                onPress={handleResend}
                loading={resending}
                icon={<Icon name="refresh-cw" size={16} color={colors.white} />}
              />
              <Button label="Change mobile number" variant="text" onPress={() => navigation.goBack()} />
            </>
          ) : (
            <>
              <Button
                label="Verify OTP"
                onPress={handleVerify}
                loading={verifying}
                disabled={otp.length !== OTP_LENGTH}
              />
              <Button
                label="Didn't receive? Resend OTP"
                variant="text"
                onPress={handleResend}
                loading={resending}
                disabled={resendsRemaining <= 0}
              />
            </>
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}

function formatMobile(digits: string) {
  return digits.length > 5 ? `${digits.slice(0, 5)} ${digits.slice(5)}` : digits;
}

function HeroSection({
  viewState,
  mobileNumber,
  resendsUsed,
  onChangeNumber,
}: {
  viewState: ViewState;
  mobileNumber: string;
  resendsUsed: number;
  onChangeNumber: () => void;
}) {
  if (viewState === 'wrong') {
    return (
      <View style={styles.hero}>
        <IconCircle icon="x-circle" iconColor={colors.error} backgroundColor={colors.errorSurface} />
        <Text style={styles.heading}>Incorrect OTP</Text>
        <Text style={styles.subtitle}>The OTP you entered doesn't match.{'\n'}Please try again.</Text>
      </View>
    );
  }

  if (viewState === 'expired') {
    return (
      <View style={styles.hero}>
        <IconCircle
          icon="clock"
          size={80}
          iconSize={36}
          iconColor="#F79009"
          backgroundColor={colors.warningSurface}
          badgeLabel="EXPIRED"
          badgeColor="#F79009"
        />
        <Text style={styles.heading}>OTP Expired</Text>
        <Text style={styles.subtitle}>
          Your OTP has expired. Please request{'\n'}a new OTP to continue.
        </Text>
      </View>
    );
  }

  if (viewState === 'resent') {
    return (
      <View style={styles.hero}>
        <IconCircle
          icon="refresh-cw"
          badgeLabel={String(resendsUsed + 1)}
          badgeColor={colors.primary}
        />
        <Text style={styles.heading}>New OTP Sent</Text>
        <Text style={styles.subtitleBold}>A new OTP has been sent to</Text>
        <Text style={styles.subtitleValue}>+91 {formatMobile(mobileNumber)}</Text>
      </View>
    );
  }

  return (
    <View style={styles.hero}>
      <IconCircle icon="message-otp" />
      <Text style={styles.heading}>Verify Your Number</Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit OTP sent to{'\n'}
        <Text style={styles.subtitleValue}>+91 {formatMobile(mobileNumber)}</Text>
      </Text>
      <Text style={styles.changeNumberLink} onPress={onChangeNumber}>
        Change Number
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.huge,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingBottom: spacing.huge,
  },
  heading: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  subtitleBold: {
    ...typography.bodySemibold,
    fontFamily: fontFamilies.bold,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  subtitleValue: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  changeNumberLink: {
    ...typography.caption,
    color: colors.primary,
    fontFamily: fontFamilies.medium,
    marginTop: spacing.xs,
  },
  otpSection: {
    gap: spacing.xxl,
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  countdownText: {
    ...typography.labelSemibold,
    fontFamily: fontFamilies.regular,
    color: colors.textSecondary,
  },
  countdownValue: {
    color: colors.primary,
    fontFamily: fontFamilies.semibold,
  },
  expiredText: {
    ...typography.bodySemibold,
    color: colors.error,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: spacing.huge,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
});
