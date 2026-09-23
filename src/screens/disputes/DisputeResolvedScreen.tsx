import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { NavHeader } from '../../components';
import { Icon } from '../../icons/Icon';
import { useDisputes } from '../../context/DisputesContext';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'DisputeResolved'>;

const TIMELINE_STEPS = ['Issue Raised', 'Evidence Submitted', 'Support Review', 'Decision Issued'];

export function DisputeResolvedScreen({ navigation, route }: Props) {
  const { disputeId } = route.params;
  const { getDispute, acceptDecision } = useDisputes();
  const dispute = getDispute(disputeId);
  const [rating, setRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  useEffect(() => {
    // Defensive: this screen can be reached directly (e.g. deep link, or a
    // parallel flow) without going through the settlement-adjustment step
    // that normally calls acceptDecision, so make sure status is settled.
    if (dispute && dispute.status !== 'resolved') {
      acceptDecision(disputeId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispute?.status, disputeId]);

  function handleBack() {
    navigation.goBack();
  }

  function handleBackToDashboard() {
    navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
  }

  function handleContactSupport() {
    navigation.navigate('HelpSupport');
  }

  function handleSubmitRating() {
    if (rating > 0) {
      setRatingSubmitted(true);
    }
  }

  if (!dispute) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <NavHeader title="Dispute Resolved" onBack={handleBack} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Dispute not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const adjustmentAmount = dispute.vendorAdjustment ?? dispute.claimAmount;
  const settlementRef = `STL-2024-${dispute.id.replace(/\D/g, '')}`;
  const decisionLabel = dispute.decisionOutcome ?? 'Accepted';

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <NavHeader title={`Dispute #${dispute.id}`} onBack={handleBack} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.chipRow}>
          <View style={styles.resolvedChip}>
            <Text style={styles.resolvedChipText}>Resolved</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>DISPUTE TIMELINE</Text>
          <View style={styles.timeline}>
            {TIMELINE_STEPS.map((step, index) => (
              <View key={step} style={styles.timelineRow}>
                <View style={styles.timelineMarkerColumn}>
                  <View style={styles.timelineDot}>
                    <Icon name="check" size={14} color={colors.white} strokeWidth={3} />
                  </View>
                  {index < TIMELINE_STEPS.length - 1 ? <View style={styles.timelineLine} /> : null}
                </View>
                <Text style={styles.timelineLabel}>{step}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>RESOLUTION SUMMARY</Text>
          <View style={styles.summaryRows}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Decision</Text>
              <Text style={styles.summaryValue}>{decisionLabel}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Adjustment</Text>
              <Text style={styles.summaryValue}>{`₹${adjustmentAmount}`}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Settlement Ref</Text>
              <Text style={styles.summaryValue}>{settlementRef}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.ratingQuestion}>How was the dispute resolution experience?</Text>
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map(value => (
              <Pressable key={value} onPress={() => setRating(value)} hitSlop={4} style={styles.starButton}>
                <Icon
                  name="star"
                  size={28}
                  color={value <= rating ? colors.warning : colors.border}
                  strokeWidth={2}
                />
              </Pressable>
            ))}
          </View>
          <Pressable
            onPress={handleSubmitRating}
            disabled={rating === 0}
            style={[styles.submitRatingButton, rating > 0 && styles.submitRatingButtonActive]}
          >
            <Text style={[styles.submitRatingText, rating > 0 && styles.submitRatingTextActive]}>
              {ratingSubmitted ? 'Thanks for your feedback' : 'Submit Rating'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.footerLinks}>
          <Pressable onPress={handleBackToDashboard} hitSlop={8}>
            <Text style={styles.viewAllLink}>View All Disputes</Text>
          </Pressable>
          <Text style={styles.supportRow}>
            {'Need to raise another issue? '}
            <Text style={styles.supportLink} onPress={handleContactSupport}>
              Contact Support
            </Text>
          </Text>
        </View>
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
  chipRow: {
    alignItems: 'center',
  },
  resolvedChip: {
    backgroundColor: colors.primarySurface,
    borderRadius: radii.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxs,
  },
  resolvedChipText: {
    ...typography.captionSemibold,
    color: colors.primaryDark,
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
  timeline: {
    paddingTop: spacing.lg,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
  },
  timelineMarkerColumn: {
    alignItems: 'center',
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    width: 2,
    flexGrow: 1,
    minHeight: 24,
    backgroundColor: colors.primary,
    marginVertical: 2,
  },
  timelineLabel: {
    ...typography.body,
    color: colors.textPrimary,
    paddingTop: spacing.xs,
    paddingBottom: spacing.lg,
  },
  summaryRows: {
    gap: spacing.md,
    paddingTop: spacing.lg - 2,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  ratingQuestion: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg - 2,
  },
  starButton: {
    padding: spacing.xxs,
  },
  submitRatingButton: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.sm,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitRatingButtonActive: {
    backgroundColor: colors.primary,
  },
  submitRatingText: {
    ...typography.bodySemibold,
    color: colors.textTertiary,
  },
  submitRatingTextActive: {
    color: colors.white,
  },
  footerLinks: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  viewAllLink: {
    ...typography.bodySemibold,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  supportRow: {
    ...typography.label,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  supportLink: {
    color: colors.primary,
    fontFamily: typography.labelSemibold.fontFamily,
    textDecorationLine: 'underline',
  },
});
