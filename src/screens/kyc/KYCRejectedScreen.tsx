import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, IconCircle, InfoBanner, ScreenContainer } from '../../components';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';
import { useRegistration } from '../../context/RegistrationContext';
import { api } from '../../services/api';

type Props = NativeStackScreenProps<AuthStackParamList, 'KYCRejected'>;

type EditTarget =
  | 'BusinessType'
  | 'BusinessInfo'
  | 'OwnerInfo'
  | 'StoreInfo'
  | 'GSTDetails'
  | 'PANVerification'
  | 'BusinessProof'
  | 'BankDetails';

const STEP_META: Record<string, { title: string; target: EditTarget }> = {
  businessType: { title: 'Business Type', target: 'BusinessType' },
  businessInfo: { title: 'Business Information', target: 'BusinessInfo' },
  ownerInfo: { title: 'Owner Information', target: 'OwnerInfo' },
  storeInfo: { title: 'Store Information', target: 'StoreInfo' },
  gstDetails: { title: 'GST Details', target: 'GSTDetails' },
  panDetails: { title: 'PAN Verification', target: 'PANVerification' },
  businessProof: { title: 'Business Proof', target: 'BusinessProof' },
  bankDetails: { title: 'Bank Details', target: 'BankDetails' },
};

interface RejectedStep {
  key: string;
  title: string;
  description: string;
  target: EditTarget;
}

export function KYCRejectedScreen({ navigation, route }: Props) {
  const { data } = useRegistration();
  const rejectionReason = route.params?.rejectionReason;
  const [rejectedSteps, setRejectedSteps] = useState<RejectedStep[]>([]);

  useEffect(() => {
    api
      .get<{ stepReviews?: Partial<Record<string, { status: string; note?: string }>> }>('/vendor/registration')
      .then(({ data: registration }) => {
        const reviews = registration.stepReviews ?? {};
        setRejectedSteps(
          Object.entries(reviews)
            .filter(([, review]) => review?.status === 'rejected')
            .map(([key, review]) => ({
              key,
              title: STEP_META[key]?.title ?? key,
              description: review?.note || 'This step needs to be corrected.',
              target: STEP_META[key]?.target ?? 'BusinessType',
            })),
        );
      })
      .catch(() => {
        // Best-effort — falls back to the generic rejectionReason banner below.
      });
  }, []);

  return (
    <ScreenContainer scrollable>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Verification Status</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.hero}>
          <IconCircle
            icon="x-circle"
            size={80}
            iconSize={40}
            iconColor={colors.error}
            backgroundColor={colors.errorSurface}
          />
          <Text style={styles.heading}>Verification Failed</Text>
          <Text style={styles.subtitle}>
            Your application couldn't be approved.{'\n'}Please correct the issues and resubmit.
          </Text>
          <View style={styles.refPill}>
            <Text style={styles.refLabel}>Ref: </Text>
            <Text style={styles.refValue}>{data.referenceId ?? '—'}</Text>
          </View>
        </View>

        {rejectionReason ? (
          <View style={styles.reasonsCard}>
            <Text style={styles.reasonsTitle}>Rejection Reason</Text>
            <Text style={styles.reasonDescription}>{rejectionReason}</Text>
          </View>
        ) : rejectedSteps.length > 0 ? (
          <View style={styles.reasonsCard}>
            <Text style={styles.reasonsTitle}>Rejection Reasons ({rejectedSteps.length})</Text>
            {rejectedSteps.map((reason, index) => (
              <View
                key={reason.key}
                style={[styles.reasonRow, index < rejectedSteps.length - 1 && styles.reasonRowDivider]}
              >
                <View style={styles.reasonHeader}>
                  <Text style={styles.reasonTitle}>{reason.title}</Text>
                  <Pressable onPress={() => navigation.navigate(reason.target)} hitSlop={8}>
                    <Text style={styles.reasonAction}>Correct</Text>
                  </Pressable>
                </View>
                <Text style={styles.reasonDescription}>{reason.description}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.reasonsCard}>
            <Text style={styles.reasonsTitle}>Rejection Reason</Text>
            <Text style={styles.reasonDescription}>
              Your application wasn't approved. Please contact support for details.
            </Text>
          </View>
        )}

        {rejectedSteps.length > 0 ? (
          <View style={styles.fixCard}>
            <Text style={styles.fixTitle}>How to Fix</Text>
            {rejectedSteps.map((step, index) => (
              <View key={step.key} style={styles.fixRow}>
                <View style={styles.fixBadge}>
                  <Text style={styles.fixBadgeText}>{index + 1}</Text>
                </View>
                <Text style={styles.fixText}>Correct your {step.title.toLowerCase()}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <InfoBanner
          variant="info"
          message="After correcting the issues above, resubmit your application for another review."
        />

        <View style={styles.footer}>
          <Button
            label="Correct Details & Resubmit"
            onPress={() => navigation.navigate('KYCReview')}
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
  refPill: {
    flexDirection: 'row',
    backgroundColor: colors.errorSurface,
    paddingHorizontal: spacing.lg,
    paddingVertical: 4,
    borderRadius: 9999,
    marginTop: spacing.md,
  },
  refLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  refValue: {
    ...typography.caption,
    fontFamily: fontFamilies.bold,
    color: colors.error,
  },
  reasonsCard: {
    padding: spacing.xl,
    borderRadius: radii.xl,
    backgroundColor: colors.errorSurface,
    borderWidth: 1.5,
    borderColor: colors.errorBorder,
  },
  reasonsTitle: {
    ...typography.labelSemibold,
    color: colors.error,
    paddingBottom: spacing.lg,
  },
  reasonRow: {
    paddingVertical: spacing.md,
  },
  reasonRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.errorBorder,
  },
  reasonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reasonTitle: {
    ...typography.captionBold,
    color: colors.error,
  },
  reasonAction: {
    ...typography.captionSemibold,
    color: colors.error,
    textDecorationLine: 'underline',
  },
  reasonDescription: {
    ...typography.captionBold,
    fontFamily: fontFamilies.regular,
    color: colors.errorDark,
    paddingTop: spacing.xs,
  },
  fixCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.xl,
    gap: spacing.md,
  },
  fixTitle: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.72,
  },
  fixRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  fixBadge: {
    width: 18,
    height: 18,
    borderRadius: 9999,
    backgroundColor: colors.errorSurface,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  fixBadgeText: {
    ...typography.tinyBold,
    color: colors.error,
    fontSize: 10,
  },
  fixText: {
    ...typography.captionBold,
    fontFamily: fontFamilies.regular,
    color: colors.textPrimary,
    flex: 1,
  },
  footer: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
