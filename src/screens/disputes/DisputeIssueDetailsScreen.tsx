import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useDisputes, DisputeStatus } from '../../context/DisputesContext';
import { Badge, Button, NavHeader } from '../../components';
import { Icon } from '../../icons/Icon';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'DisputeIssueDetails'>;

// Figma uses bespoke tints with no matching design tokens.
const AMBER_BORDER = '#FEC84B';

type StepState = 'done' | 'active' | 'pending';

function getTimelineSteps(status: DisputeStatus): { key: string; label: string; sublabel?: string; state: StepState }[] {
  const reviewDone = status !== 'issue-raised';
  const decisionDone = status === 'decided' || status === 'resolved' || status === 'accepted';
  const decisionActive = status === 'disputed' || status === 'under-support-review';

  return [
    { key: 'raised', label: 'Issue Raised', state: 'done' },
    {
      key: 'review',
      label: 'Vendor Review',
      sublabel: reviewDone ? undefined : 'In progress',
      state: reviewDone ? 'done' : 'active',
    },
    {
      key: 'decision',
      label: 'Decision',
      sublabel: decisionActive ? 'In progress' : undefined,
      state: decisionDone ? 'done' : decisionActive ? 'active' : 'pending',
    },
  ];
}

export function DisputeIssueDetailsScreen({ navigation, route }: Props) {
  const { disputeId } = route.params;
  const { getDispute } = useDisputes();
  const dispute = getDispute(disputeId);

  if (!dispute) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <NavHeader title="Issue Details" onBack={() => navigation.goBack()} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Dispute not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const timelineSteps = getTimelineSteps(dispute.status);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <NavHeader title="Issue Details" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.smallLabel}>Dispute ID</Text>
              <Text style={styles.disputeIdValue}>{dispute.id}</Text>
            </View>
            <Badge label={dispute.issueType} tone="warning" />
          </View>
          <Text style={styles.inlineLine}>
            <Text style={styles.inlineRegular}>Order </Text>
            <Text style={styles.inlineBold}>{dispute.orderId}</Text>
          </Text>
          <Text style={styles.inlineLine}>
            <Text style={styles.inlineRegular}>Claimed refund: </Text>
            <Text style={styles.inlineBoldRed}>₹{dispute.claimAmount}</Text>
          </Text>
        </View>

        <View style={styles.quoteCard}>
          <Text style={styles.quoteLabel}>CUSTOMER CLAIM</Text>
          <Text style={styles.quoteText}>&ldquo;{dispute.customerStatement}&rdquo;</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Items</Text>
          <View style={styles.itemsBody}>
            <View style={styles.itemRowHighlighted}>
              <View style={styles.itemNameColumn}>
                <Text style={styles.itemName}>{dispute.productName}</Text>
                <Text style={styles.itemSub}>Disputed item</Text>
              </View>
              <Text style={styles.itemPriceRed}>₹{dispute.claimAmount}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dispute Timeline</Text>
          <View style={styles.timeline}>
            {timelineSteps.map((step, index) => {
              const isLast = index === timelineSteps.length - 1;
              return (
                <View key={step.key} style={styles.timelineRow}>
                  <View style={styles.timelineIconColumn}>
                    <View
                      style={[
                        styles.timelineDot,
                        step.state === 'done' && styles.timelineDotDone,
                        step.state === 'active' && styles.timelineDotActive,
                        step.state === 'pending' && styles.timelineDotPending,
                      ]}
                    >
                      {step.state === 'done' ? (
                        <Icon name="check" size={12} color={colors.white} strokeWidth={3} />
                      ) : step.state === 'active' ? (
                        <View style={styles.timelineDotInner} />
                      ) : null}
                    </View>
                    {!isLast ? (
                      <View
                        style={[
                          styles.timelineConnector,
                          step.state === 'done' && styles.timelineConnectorDone,
                        ]}
                      />
                    ) : null}
                  </View>
                  <View style={styles.timelineTextColumn}>
                    <Text
                      style={[
                        styles.timelineLabel,
                        step.state !== 'pending' && styles.timelineLabelEmphasis,
                      ]}
                    >
                      {step.label}
                    </Text>
                    {step.sublabel ? <Text style={styles.timelineSublabel}>{step.sublabel}</Text> : null}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerButton}>
          <Button
            label="Respond to Issue"
            onPress={() => navigation.navigate('DisputeVendorReview', { disputeId })}
          />
        </View>
        <View style={styles.footerButton}>
          <SecondaryButton
            label="Contact Support"
            onPress={() => Alert.alert('Contact Support', 'Support chat is not available in this preview.')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}
    >
      <Text style={styles.secondaryButtonLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
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
  content: {
    padding: spacing.xl,
    gap: 14,
  },
  card: {
    width: '100%',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  smallLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  disputeIdValue: {
    fontFamily: fontFamilies.bold,
    fontSize: 15,
    lineHeight: 22.5,
    color: colors.textPrimary,
    paddingTop: 2,
  },
  inlineLine: {
    paddingTop: spacing.md,
  },
  inlineRegular: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.textSecondary,
  },
  inlineBold: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  inlineBoldRed: {
    fontFamily: fontFamilies.bold,
    fontSize: 13,
    lineHeight: 19.5,
    color: colors.error,
  },
  quoteCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
    borderRadius: radii.sm,
    padding: spacing.xl,
  },
  quoteLabel: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
  },
  quoteText: {
    ...typography.body,
    fontStyle: 'italic',
    color: colors.textPrimary,
    paddingTop: spacing.sm,
  },
  cardTitle: {
    ...typography.labelSemibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemsBody: {
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  itemRowHighlighted: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.warningSurface,
    borderWidth: 1,
    borderColor: AMBER_BORDER,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  itemNameColumn: {
    gap: 2,
  },
  itemName: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  itemSub: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  itemPriceRed: {
    ...typography.bodySemibold,
    color: colors.error,
  },
  timeline: {
    paddingTop: spacing.lg,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  timelineIconColumn: {
    alignItems: 'center',
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  timelineDotDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timelineDotActive: {
    backgroundColor: colors.warningSurface,
    borderColor: colors.warning,
  },
  timelineDotPending: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
  },
  timelineDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.warning,
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    minHeight: 28,
    backgroundColor: colors.border,
  },
  timelineConnectorDone: {
    backgroundColor: colors.primary,
  },
  timelineTextColumn: {
    flex: 1,
    paddingTop: 2,
    paddingBottom: spacing.xl,
  },
  timelineLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  timelineLabelEmphasis: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  timelineSublabel: {
    ...typography.caption,
    color: colors.warningDark,
    paddingTop: 2,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  footerButton: {
    flex: 1,
  },
  secondaryButton: {
    height: 52,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  secondaryButtonPressed: {
    opacity: 0.85,
  },
  secondaryButtonLabel: {
    ...typography.button,
    color: colors.textPrimary,
  },
});
