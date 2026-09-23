import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, IconCircle, InfoBanner, ScreenContainer, StatusTimeline } from '../../components';
import { Icon } from '../../icons/Icon';
import { useRegistration } from '../../context/RegistrationContext';
import { api, getApiErrorMessage } from '../../services/api';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'KYCSubmission'>;

const TIMELINE_STEPS = [
  { label: 'Application Submitted', sublabel: 'Today, 14:32 IST', status: 'done' as const },
  { label: 'Document Verification', sublabel: 'Est. 1–2 business days', status: 'active' as const },
  { label: 'Background Check', sublabel: 'Est. 1 business day', status: 'pending' as const },
  { label: 'Account Activation', sublabel: 'Upon approval', status: 'pending' as const },
];

export function KYCSubmissionScreen({ navigation }: Props) {
  const { setReferenceId } = useRegistration();
  const [referenceId, setLocalReferenceId] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.post<{ referenceId: string; status: string; kycStatus: string }>(
          '/vendor/registration/submit',
        );
        if (cancelled) return;
        setReferenceId(data.referenceId);
        setLocalReferenceId(data.referenceId);
      } catch (error) {
        if (cancelled) return;
        Alert.alert(
          'Submission failed',
          getApiErrorMessage(error, 'Could not submit your application. Please review your details and try again.'),
          [{ text: 'OK', onPress: () => navigation.replace('KYCReview') }],
        );
      } finally {
        if (!cancelled) setSubmitting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (submitting) {
    return (
      <ScreenContainer scrollable={false}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Submitting your application…</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!referenceId) {
    return null;
  }

  return (
    <ScreenContainer scrollable>
      <View style={styles.content}>
        <View style={styles.hero}>
          <IconCircle icon="check" size={96} iconSize={52} />
          <Text style={styles.heading}>Application Submitted!</Text>
          <Text style={styles.subtitle}>
            Your KYC application has been received.{'\n'}Our team will review it within 2–3 business
            days.
          </Text>
        </View>

        <View style={styles.referenceCard}>
          <View style={styles.referenceHeader}>
            <Text style={styles.referenceLabel}>Reference ID</Text>
            <Text
              style={styles.copyText}
              onPress={() => Alert.alert('Copied', `${referenceId} copied to clipboard.`)}
            >
              Copy
            </Text>
          </View>
          <View style={styles.referenceValueBox}>
            <Text style={styles.referenceValue}>{referenceId}</Text>
          </View>
          <Text style={styles.referenceHint}>Save this ID to track your application status</Text>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Application Status</Text>
          <View style={styles.timelineWrapper}>
            <StatusTimeline steps={TIMELINE_STEPS} />
          </View>
        </View>

        <InfoBanner
          variant="success"
          message="You'll receive SMS and email updates at each verification step. Average approval time is 48 hours."
        />

        <View style={styles.footer}>
          <Button
            label="Track Verification"
            icon={<Icon name="clock" size={16} color={colors.white} />}
            onPress={() => navigation.replace('KYCPending')}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loadingContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xxl,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.huge,
    gap: spacing.xxl,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  heading: {
    ...typography.h1,
    fontSize: 26,
    lineHeight: 39,
    color: colors.textPrimary,
    textAlign: 'center',
    paddingTop: spacing.lg,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingTop: spacing.xs,
  },
  referenceCard: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.xl,
    gap: spacing.md,
  },
  referenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  referenceLabel: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.72,
  },
  copyText: {
    ...typography.caption,
    fontFamily: fontFamilies.medium,
    color: colors.primary,
  },
  referenceValueBox: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: 10,
  },
  referenceValue: {
    ...typography.h3,
    fontSize: 15,
    lineHeight: 22.5,
    letterSpacing: 0.9,
    color: colors.textPrimary,
  },
  referenceHint: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  statusCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.xl,
  },
  statusTitle: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  timelineWrapper: {
    paddingTop: spacing.lg,
  },
  footer: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
