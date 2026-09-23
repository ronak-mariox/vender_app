import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Badge, StatusTimeline, TimelineStep } from '../../components';
import { Icon } from '../../icons/Icon';
import { useDisputes } from '../../context/DisputesContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'DisputeSupportReview'>;

const WHATS_NEXT = [
  'Support team reviews evidence from both parties',
  'May contact the delivery partner for more information',
  'Issues a binding decision within 72 hours',
];

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function DisputeSupportReviewScreen({ navigation, route }: Props) {
  const { disputeId } = route.params;
  const { getDispute } = useDisputes();
  const dispute = getDispute(disputeId);

  // Dispute doesn't track a real submission/expected-decision timestamp, so
  // these are derived at render time from "now" and the 72-hour SLA
  // mentioned on the submit screen.
  const { submittedLabel, expectedLabel } = useMemo(() => {
    const now = new Date();
    const expected = new Date(now.getTime() + 72 * 60 * 60 * 1000);
    return { submittedLabel: formatDate(now), expectedLabel: formatDate(expected) };
  }, []);

  if (!dispute) {
    return (
      <View style={styles.screen}>
        <Header title="Dispute" onBack={() => navigation.goBack()} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>This dispute could not be found.</Text>
        </View>
      </View>
    );
  }

  const timelineSteps: TimelineStep[] = [
    { label: 'Issue Raised', sublabel: dispute.issueRaisedLabel, status: 'done' },
    {
      label: 'Evidence Submitted',
      sublabel: `${dispute.evidence.length} file${dispute.evidence.length === 1 ? '' : 's'} submitted`,
      status: 'done',
    },
    { label: 'Support Review', sublabel: 'In progress', status: 'active' },
    { label: 'Decision', sublabel: 'Pending', status: 'pending' },
  ];

  return (
    <View style={styles.screen}>
      <Header title={`Dispute #${disputeId}`} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.badgeRow}>
          <Badge label="Under Review" tone="warning" />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Review Timeline</Text>
          <View style={styles.timelineWrap}>
            <StatusTimeline steps={timelineSteps} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Review Details</Text>
          <View style={styles.detailRows}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Submitted</Text>
              <Text style={styles.detailValue}>{submittedLabel}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Expected Decision</Text>
              <Text style={styles.detailValue}>{expectedLabel}</Text>
            </View>
          </View>
        </View>

        <View style={styles.tipsCard}>
          <Text style={styles.cardTitle}>What Happens Next</Text>
          <View style={styles.tipsList}>
            {WHATS_NEXT.map(item => (
              <View key={item} style={styles.tipRow}>
                <View style={styles.tipDot} />
                <Text style={styles.tipText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.linksGroup}>
          <Pressable onPress={() => navigation.navigate('DisputeUploadEvidence', { disputeId })}>
            <Text style={styles.linkPrimary}>Add More Evidence</Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate('HelpSupport')}>
            <Text style={styles.linkSecondary}>Contact Support</Text>
          </Pressable>
        </View>
      </ScrollView>
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
  badgeRow: {
    alignItems: 'center',
    width: '100%',
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.xl,
    width: '100%',
  },
  cardTitle: {
    ...typography.labelSemibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timelineWrap: {
    paddingTop: spacing.lg,
  },
  detailRows: {
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailLabel: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.textSecondary,
  },
  detailValue: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  tipsCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.xl,
    width: '100%',
  },
  tipsList: {
    gap: spacing.md,
    paddingTop: spacing.lg,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
  tipText: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.textPrimary,
    flex: 1,
  },
  linksGroup: {
    alignItems: 'center',
    gap: spacing.lg,
    width: '100%',
    paddingTop: spacing.xs,
  },
  linkPrimary: {
    ...typography.bodySemibold,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  linkSecondary: {
    ...typography.bodySemibold,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
});
