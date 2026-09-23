import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Badge, Button, IconCircle, ScreenContainer, StatusTimeline } from '../../components';
import type { BadgeTone } from '../../components/Badge';
import { Icon } from '../../icons/Icon';
import { useRegistration } from '../../context/RegistrationContext';
import { api, getApiErrorMessage } from '../../services/api';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'KYCPending'>;

type StepReviewStatus = 'pending' | 'verified' | 'rejected';

interface StepReview {
  status: StepReviewStatus;
  note?: string;
}

const STEP_LABELS: Record<string, string> = {
  businessType: 'Business Type',
  businessInfo: 'Business Information',
  ownerInfo: 'Owner Information',
  storeInfo: 'Store Information',
  gstDetails: 'GST Details',
  panDetails: 'PAN Verification',
  businessProof: 'Business Proof',
  bankDetails: 'Bank Details',
};

const STEP_ORDER = Object.keys(STEP_LABELS);

const REVIEW_TONE: Record<StepReviewStatus, BadgeTone> = {
  pending: 'warning',
  verified: 'success',
  rejected: 'error',
};

const REVIEW_LABEL: Record<StepReviewStatus, string> = {
  pending: 'Under Review',
  verified: 'Verified',
  rejected: 'Issue Found',
};

export function KYCPendingScreen({ navigation }: Props) {
  const { data } = useRegistration();
  const [checking, setChecking] = useState(false);
  const [submittedSteps, setSubmittedSteps] = useState<string[]>([]);
  const [stepReviews, setStepReviews] = useState<Partial<Record<string, StepReview>>>({});

  const loadStepStatus = useCallback(async () => {
    try {
      const { data: registration } = await api.get<Record<string, unknown>>('/vendor/registration');
      setSubmittedSteps(STEP_ORDER.filter((key) => registration[key] != null));
      setStepReviews((registration.stepReviews as Partial<Record<string, StepReview>>) ?? {});
    } catch {
      // Best-effort — the screen still works with the timeline/refresh button if this fails.
    }
  }, []);

  useEffect(() => {
    loadStepStatus();
  }, [loadStepStatus]);

  const documents = submittedSteps.map((key) => ({
    label: STEP_LABELS[key],
    review: stepReviews[key]?.status ?? 'pending',
    note: stepReviews[key]?.note,
  }));
  const verifiedCount = documents.filter((d) => d.review === 'verified').length;
  const allVerified = documents.length > 0 && verifiedCount === documents.length;

  const timelineSteps = [
    { label: 'Application Submitted', sublabel: `Reference ${data.referenceId ?? '—'}`, status: 'done' as const },
    {
      label: 'Document Verification',
      sublabel: allVerified ? 'All steps verified' : `${verifiedCount}/${documents.length} steps verified`,
      status: allVerified ? ('done' as const) : ('active' as const),
    },
    { label: 'Final Decision', sublabel: 'Admin approval or rejection', status: 'pending' as const },
  ];

  async function handleRefresh() {
    setChecking(true);
    try {
      const { data: status } = await api.get<{
        status: string;
        kycStatus: string;
        referenceId: string | null;
        rejectionReason: string | null;
      }>('/vendor/registration/status');

      if (status.status === 'active') {
        navigation.replace('KYCApproved');
      } else if (status.status === 'rejected') {
        navigation.replace('KYCRejected', { rejectionReason: status.rejectionReason ?? undefined });
      } else {
        // Otherwise still pending (or suspended) — refresh the per-step checklist and stay.
        await loadStepStatus();
      }
    } catch (error) {
      Alert.alert('Could not refresh status', getApiErrorMessage(error, 'Please try again.'));
    } finally {
      setChecking(false);
    }
  }

  return (
    <ScreenContainer scrollable>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Verification Status</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.hero}>
          <IconCircle
            icon="clock"
            size={80}
            iconSize={36}
            iconColor="#F79009"
            backgroundColor={colors.warningSurface}
            badge={
              <View style={styles.refreshBadge}>
                <Icon name="refresh-cw" size={13} color={colors.white} />
              </View>
            }
          />
          <Text style={styles.heading}>Verification Pending</Text>
          <Text style={styles.subtitle}>Your documents are under review by our verification team</Text>
        </View>

        <View style={styles.referenceRow}>
          <Text style={styles.referenceLabel}>Reference ID:</Text>
          <Text style={styles.referenceValue}>{data.referenceId ?? '—'}</Text>
          <View style={styles.referenceSpacer} />
          <Text
            style={styles.copyText}
            onPress={() => Alert.alert('Copied', `${data.referenceId} copied to clipboard.`)}
          >
            Copy
          </Text>
        </View>

        <View style={styles.warningCard}>
          <View style={styles.warningHeader}>
            <View style={styles.warningDot} />
            <Text style={styles.warningTitle}>Document Verification in Progress</Text>
          </View>
          <Text style={styles.warningBody}>
            Our team is reviewing your GST certificate, PAN, and business proof documents. This
            typically takes 1–2 business days.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Progress</Text>
          <View style={styles.timelineWrapper}>
            <StatusTimeline steps={timelineSteps} />
          </View>
        </View>

        {documents.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Step-by-Step Status</Text>
            <View style={styles.documentsList}>
              {documents.map((doc, index) => (
                <View
                  key={doc.label}
                  style={[styles.documentRow, index < documents.length - 1 && styles.documentRowDivider]}
                >
                  <View style={styles.documentTextColumn}>
                    <Text style={styles.documentLabel}>{doc.label}</Text>
                    {doc.review === 'rejected' && doc.note ? (
                      <Text style={styles.documentNote}>{doc.note}</Text>
                    ) : null}
                  </View>
                  <Badge label={REVIEW_LABEL[doc.review]} tone={REVIEW_TONE[doc.review]} />
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.footer}>
          <Button
            label="Refresh Status"
            loading={checking}
            icon={<Icon name="refresh-cw" size={16} color={colors.white} />}
            onPress={handleRefresh}
          />
          <Button
            label="Contact Support"
            variant="text"
            onPress={() => Alert.alert('Contact Support', 'Support contact coming soon.')}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.labelSemibold,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    gap: spacing.xl,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  refreshBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 9999,
    backgroundColor: '#F79009',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    paddingTop: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  referenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  referenceLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  referenceValue: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  referenceSpacer: {
    flex: 1,
  },
  copyText: {
    ...typography.tiny,
    fontFamily: fontFamilies.medium,
    color: colors.primary,
  },
  warningCard: {
    padding: spacing.xl,
    borderRadius: radii.xl,
    backgroundColor: colors.warningSurface,
    borderWidth: 1.5,
    borderColor: '#FCD34D',
    gap: spacing.xs,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  warningDot: {
    width: 8,
    height: 8,
    borderRadius: 9999,
    backgroundColor: '#F79009',
  },
  warningTitle: {
    ...typography.labelSemibold,
    color: colors.warningDark,
  },
  warningBody: {
    ...typography.caption,
    color: '#A16207',
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.xl,
  },
  cardTitle: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.72,
  },
  timelineWrapper: {
    paddingTop: spacing.lg,
  },
  documentsList: {
    paddingTop: spacing.md,
  },
  documentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  documentRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  documentTextColumn: {
    flex: 1,
    gap: 2,
  },
  documentLabel: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.textPrimary,
  },
  documentNote: {
    ...typography.caption,
    color: colors.error,
  },
  footer: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
