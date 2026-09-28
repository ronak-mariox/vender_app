import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, IconCircle, InfoBanner, ScreenContainer, StatusTimeline } from '../../components';
import { Icon } from '../../icons/Icon';
import { useRegistration } from '../../context/RegistrationContext';
import axios from 'axios';
import { api, getApiErrorMessage } from '../../services/api';
import { isRegistrationLockedError, showRegistrationLocked } from '../registration/registrationHelpers';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'KYCSubmission'>;

const STEP_SCREEN: Record<string, keyof AuthStackParamList> = {
  'business-type': 'BusinessType',
  'business-info': 'BusinessInfo',
  'owner-info': 'OwnerInfo',
  'store-info': 'StoreInfo',
  'gst-details': 'GSTDetails',
  'pan-details': 'PANVerification',
  'business-proof': 'BusinessProof',
  'bank-details': 'BankDetails',
};

function formatSubmittedAt(date: Date) {
  return date.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function KYCSubmissionScreen({ navigation }: Props) {
  const { setReferenceId } = useRegistration();
  const [referenceId, setLocalReferenceId] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(true);
  const [submittedAt, setSubmittedAt] = useState<Date | null>(null);

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
        setSubmittedAt(new Date());
      } catch (error) {
        if (cancelled) return;
        if (isRegistrationLockedError(error)) {
          showRegistrationLocked();
          return;
        }
        const missingSteps =
          axios.isAxiosError(error) && error.response?.status === 422
            ? ((error.response.data as { missingSteps?: string[] } | undefined)?.missingSteps ?? [])
            : [];
        const firstMissing = missingSteps.map(step => STEP_SCREEN[step]).find(Boolean);
        if (firstMissing) {
          Alert.alert('Application incomplete', 'Please complete the remaining registration steps before submitting.', [
            { text: 'Continue', onPress: () => navigation.replace(firstMissing as 'BusinessType') },
          ]);
          return;
        }
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

  const timelineSteps = [
    {
      label: 'Application Submitted',
      sublabel: submittedAt ? formatSubmittedAt(submittedAt) : 'Just now',
      status: 'done' as const,
    },
    { label: 'Document Verification', sublabel: 'Reviewed by our team', status: 'active' as const },
    { label: 'Account Activation', sublabel: 'Upon approval', status: 'pending' as const },
  ];

  return (
    <ScreenContainer scrollable>
      <View style={styles.content}>
        <View style={styles.hero}>
          <IconCircle icon="check" size={96} iconSize={52} />
          <Text style={styles.heading}>Application Submitted!</Text>
          <Text style={styles.subtitle}>
            Your KYC application has been received.{'\n'}Our team will review it and update your
            status in the app.
          </Text>
        </View>

        <View style={styles.referenceCard}>
          <View style={styles.referenceHeader}>
            <Text style={styles.referenceLabel}>Reference ID</Text>
          </View>
          <View style={styles.referenceValueBox}>
            <Text style={styles.referenceValue} selectable>
              {referenceId}
            </Text>
          </View>
          <Text style={styles.referenceHint}>Save this ID to track your application status</Text>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Application Status</Text>
          <View style={styles.timelineWrapper}>
            <StatusTimeline steps={timelineSteps} />
          </View>
        </View>

        <InfoBanner
          variant="success"
          message="You can check your verification status in the app at any time."
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
