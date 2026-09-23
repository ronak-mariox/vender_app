import React, { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, NavHeader } from '../../components';
import { Icon } from '../../icons/Icon';
import { useDisputes } from '../../context/DisputesContext';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'DisputeDecision'>;

// Mirrors the fallback formula used by DisputesContext.issueDecision so this
// screen has decision data to render even before the async state update from
// the useEffect below lands.
function fallbackDecision(claimAmount: number) {
  const amount = Math.round(claimAmount / 2);
  return {
    decisionOutcome: 'Partial Resolution',
    decisionAmount: amount,
    decisionReasoning: 'Evidence inconclusive. Partial responsibility assigned.',
    vendorAdjustment: amount,
  };
}

export function DisputeDecisionScreen({ navigation, route }: Props) {
  const { disputeId } = route.params;
  const { getDispute, issueDecision, acceptDecision, appealDecision } = useDisputes();
  const dispute = getDispute(disputeId);

  const needsDecision = !!dispute && dispute.decisionOutcome === undefined;

  useEffect(() => {
    if (needsDecision) {
      issueDecision(disputeId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsDecision, disputeId]);

  const decision = useMemo(() => {
    if (!dispute) return null;
    if (dispute.decisionOutcome !== undefined && dispute.decisionAmount !== undefined) {
      return {
        decisionOutcome: dispute.decisionOutcome,
        decisionAmount: dispute.decisionAmount,
        decisionReasoning: dispute.decisionReasoning ?? '',
        vendorAdjustment: dispute.vendorAdjustment ?? dispute.decisionAmount,
      };
    }
    return fallbackDecision(dispute.claimAmount);
  }, [dispute]);

  function handleBack() {
    navigation.goBack();
  }

  function handleAccept() {
    acceptDecision(disputeId);
    navigation.navigate('DisputeSettlementAdjustment', { disputeId });
  }

  function handleAppeal() {
    appealDecision(disputeId);
    navigation.navigate('DisputeSupportReview', { disputeId });
  }

  if (!dispute || !decision) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <NavHeader title="Dispute Decision" onBack={handleBack} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Dispute not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isFullRefund = decision.decisionAmount >= dispute.claimAmount;
  const isNoRefund = decision.decisionAmount <= 0;
  const decisionSentencePrefix = isNoRefund
    ? 'a refund'
    : isFullRefund
      ? 'a full refund'
      : 'a partial refund';
  const decisionSentenceSuffix = isNoRefund
    ? 'will not be issued to the customer.'
    : 'will be issued to the customer.';

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <NavHeader title="Dispute Decision" onBack={handleBack} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.outcomeCard}>
          <View style={styles.outcomeChip}>
            <Text style={styles.outcomeChipText}>{decision.decisionOutcome}</Text>
          </View>
          <Text style={styles.outcomeDisputeId}>Dispute {dispute.id}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>DECISION</Text>
          <Text style={styles.decisionSentence}>
            {isNoRefund ? (
              <>
                <Text>{`After reviewing both parties' evidence, `}</Text>
                <Text style={styles.decisionAmountText}>{decisionSentencePrefix}</Text>
                <Text>{` ${decisionSentenceSuffix}`}</Text>
              </>
            ) : (
              <>
                <Text>{`After reviewing both parties' evidence, ${decisionSentencePrefix} of `}</Text>
                <Text style={styles.decisionAmountText}>{`₹${decision.decisionAmount}`}</Text>
                <Text>{` ${decisionSentenceSuffix}`}</Text>
              </>
            )}
          </Text>
          {decision.decisionReasoning ? (
            <View style={styles.reasoningBox}>
              <Text style={styles.reasoningText}>{decision.decisionReasoning}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>BREAKDOWN</Text>
          <View style={styles.breakdownRows}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Customer receives</Text>
              <Text style={[styles.breakdownValue, { color: colors.primary }]}>
                {`₹${decision.decisionAmount}`}
              </Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Vendor adjustment</Text>
              <Text style={[styles.breakdownValue, { color: colors.error }]}>
                {`₹${decision.vendorAdjustment}`}
              </Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Original claim</Text>
              <Text style={[styles.breakdownValue, { color: colors.textSecondary }]}>
                {`₹${dispute.claimAmount}`}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.deadlineNote}>
          <Icon name="clock" size={16} color={colors.error} strokeWidth={2} />
          <Text style={styles.deadlineText}>7-day deadline to accept or appeal this decision.</Text>
        </View>

        <View style={styles.actionRow}>
          <View style={styles.actionButton}>
            <Button label="Accept Decision" onPress={handleAccept} />
          </View>
          <View style={styles.actionButton}>
            <Button label="Appeal Decision" variant="outline" onPress={handleAppeal} />
          </View>
        </View>
        <Text style={styles.appealCaption}>One appeal allowed per dispute</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  scrollContent: {
    padding: spacing.xl,
    gap: spacing.lg + 2,
  },
  outcomeCard: {
    backgroundColor: colors.warningSurface,
    borderWidth: 1,
    borderColor: '#FEC84B',
    borderRadius: radii.md,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  outcomeChip: {
    backgroundColor: '#FDE68A',
    borderRadius: radii.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxs,
  },
  outcomeChipText: {
    ...typography.captionSemibold,
    color: '#92400E',
    textAlign: 'center',
  },
  outcomeDisputeId: {
    ...typography.labelSemibold,
    color: '#92400E',
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.xl,
  },
  cardLabel: {
    ...typography.labelSemibold,
    color: colors.textSecondary,
  },
  decisionSentence: {
    ...typography.body,
    color: colors.textPrimary,
    paddingTop: spacing.lg - 2,
  },
  decisionAmountText: {
    ...typography.bodySemibold,
    fontFamily: typography.body.fontFamily,
    fontWeight: '700',
    color: colors.error,
  },
  reasoningBox: {
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  reasoningText: {
    ...typography.label,
    fontStyle: 'italic',
    color: colors.textSecondary,
  },
  breakdownRows: {
    gap: spacing.lg - 2,
    paddingTop: spacing.lg - 2,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  breakdownLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  breakdownValue: {
    ...typography.bodySemibold,
    fontWeight: '700',
  },
  deadlineNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.errorSurface,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    borderRadius: radii.sm,
    padding: spacing.lg,
  },
  deadlineText: {
    ...typography.label,
    color: colors.error,
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  actionButton: {
    flex: 1,
  },
  appealCaption: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
