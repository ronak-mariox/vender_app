import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Checkbox } from '../../components';
import { Icon } from '../../icons/Icon';
import { useDisputes } from '../../context/DisputesContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'DisputeSubmit'>;

// Used only if this screen is somehow reached without the vendor having gone
// through DisputeIssueDisputeScreen first (e.g. a future deep link), so
// dispute.vendorStatement hasn't been staged yet via setVendorStatementDraft.
const FALLBACK_STATEMENT = 'Vendor disputed this issue.';

export function DisputeSubmitScreen({ navigation, route }: Props) {
  const { disputeId } = route.params;
  const { getDispute, markDisputed, submitDispute } = useDisputes();
  const dispute = getDispute(disputeId);

  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const statementBody = dispute?.vendorStatement ?? null;

  function handleSubmit() {
    if (!agreed || submitting || !dispute) return;
    setSubmitting(true);
    markDisputed(disputeId, statementBody ?? FALLBACK_STATEMENT);
    submitDispute(disputeId);
    navigation.replace('DisputeSupportReview', { disputeId });
  }

  if (!dispute) {
    return (
      <View style={styles.screen}>
        <Header title="Review & Submit" onBack={() => navigation.goBack()} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>This dispute could not be found.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Header title="Review & Submit" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <StepIndicator />

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dispute Summary</Text>
          <View style={styles.summaryRows}>
            <SummaryRow label="Order" value={dispute.orderId} />
            <SummaryRow label="Issue" value={dispute.issueType} />

            <View style={styles.divider}>
              <Text style={styles.subLabel}>Statement</Text>
              <Text style={styles.statementQuote}>
                {statementBody ? `"${statementBody}"` : 'No statement provided.'}
              </Text>
            </View>

            <View>
              <Text style={styles.subLabel}>Evidence</Text>
              <View style={styles.evidenceGroup}>
                {dispute.evidence.length > 0 ? (
                  dispute.evidence.map(file => (
                    <View key={file.id} style={styles.evidenceChip}>
                      <Icon name="file-text" size={16} color={colors.primary} />
                      <Text style={styles.evidenceName} numberOfLines={1}>
                        {file.name}
                      </Text>
                      <Icon name="check-circle" size={16} color={colors.primary} />
                    </View>
                  ))
                ) : (
                  <Text style={styles.noEvidence}>No evidence added.</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteText}>
            Our team will review and respond within <Text style={styles.noteBold}>72 hours</Text>.
          </Text>
        </View>

        <View style={styles.agreeRow}>
          <Checkbox checked={agreed} onToggle={setAgreed} />
          <Text style={styles.agreeText}>
            I confirm my dispute is truthful and accurate to the best of my knowledge.
          </Text>
        </View>

        <View style={styles.actionPair}>
          <Pressable
            style={[styles.submitButton, (!agreed || submitting) && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={!agreed || submitting}
          >
            <Text style={styles.submitLabel}>{submitting ? 'Submitting…' : 'Submit Dispute'}</Text>
          </Pressable>
          <Pressable style={styles.editButton} onPress={() => navigation.goBack()}>
            <Text style={styles.editLabel}>Edit</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.subLabelInline}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} hitSlop={8} style={styles.backButton}>
        <Icon name="arrow-left" size={24} color={colors.textPrimary} />
      </Pressable>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

function StepIndicator() {
  return (
    <View style={styles.stepRow}>
      <View style={[styles.stepCircle, styles.stepCircleDone]}>
        <Icon name="check" size={14} color={colors.white} strokeWidth={3} />
      </View>
      <View style={[styles.stepConnector, styles.stepConnectorDone]} />
      <View style={[styles.stepCircle, styles.stepCircleDone]}>
        <Icon name="check" size={14} color={colors.white} strokeWidth={3} />
      </View>
      <View style={[styles.stepConnector, styles.stepConnectorDone]} />
      <View style={[styles.stepCircle, styles.stepCircleDone]}>
        <Text style={styles.stepNumberActive}>3</Text>
      </View>
      <Text style={styles.stepLabel}>Step 3 of 3</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontFamily: fontFamilies.semibold,
    fontSize: 17,
    lineHeight: 25.5,
    color: colors.textPrimary,
    flex: 1,
  },
  content: {
    padding: spacing.xl,
    gap: spacing.lg + 2,
    paddingBottom: spacing.huge,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  notFoundText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleDone: {
    backgroundColor: colors.primary,
  },
  stepNumberActive: {
    ...typography.captionBold,
    color: colors.white,
  },
  stepConnector: {
    width: 30,
    height: 2,
    backgroundColor: colors.border,
  },
  stepConnectorDone: {
    backgroundColor: colors.primary,
  },
  stepLabel: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.textSecondary,
    paddingLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.xl,
  },
  cardTitle: {
    ...typography.labelSemibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryRows: {
    gap: spacing.lg - 2,
    paddingTop: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  subLabelInline: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typography.labelSemibold,
    fontFamily: fontFamilies.medium,
    color: colors.textPrimary,
    textAlign: 'right',
    flexShrink: 1,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg - 2,
    gap: spacing.xs,
  },
  subLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  statementQuote: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.textPrimary,
    lineHeight: 20.8,
  },
  evidenceGroup: {
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  evidenceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primarySurface,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  evidenceName: {
    ...typography.labelSemibold,
    fontFamily: fontFamilies.medium,
    color: colors.textPrimary,
    flex: 1,
  },
  noEvidence: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.textSecondary,
  },
  noteCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm + 2,
    padding: spacing.lg,
  },
  noteText: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.textSecondary,
  },
  noteBold: {
    fontFamily: fontFamilies.semibold,
    color: colors.textPrimary,
  },
  agreeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
  },
  agreeText: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.textPrimary,
    flex: 1,
  },
  actionPair: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  submitButton: {
    flex: 1,
    backgroundColor: colors.error,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitLabel: {
    ...typography.button,
    color: colors.white,
  },
  editButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editLabel: {
    ...typography.button,
    color: colors.textPrimary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
