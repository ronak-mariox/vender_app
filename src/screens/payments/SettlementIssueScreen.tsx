import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { usePayments } from '../../context/PaymentsContext';
import { Badge, Button, NavHeader } from '../../components';
import { Icon } from '../../icons/Icon';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'SettlementIssue'>;

// Figma uses a bespoke amber tint (#FDE68A) with no matching design token.
const AMBER_BORDER = '#FDE68A';

type TimelineStatus = 'done' | 'active' | 'pending';

const TIMELINE: { key: string; label: string; sublabel?: string; status: TimelineStatus }[] = [
  { key: 'submitted', label: 'Submitted', status: 'done' },
  { key: 'review', label: 'Under Review', sublabel: 'In progress', status: 'active' },
  { key: 'resolved', label: 'Resolved', status: 'pending' },
];

export function SettlementIssueScreen({ navigation, route }: Props) {
  const { settlementId } = route.params;
  const { getSettlement } = usePayments();
  const settlement = getSettlement(settlementId);

  const expectedLabel = settlement?.dueDateLabel?.replace(/^Due\s*/i, '') ?? '—';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <NavHeader title="Settlement Issue" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.iconCircle}>
            <Icon name="alert-triangle" size={36} color={colors.warningDark} />
          </View>
          <Text style={styles.heading}>Settlement Delayed</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Settlement ID</Text>
            <Text style={styles.cardValue}>{settlement?.id ?? settlementId}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Expected</Text>
            <Text style={styles.expectedValue}>{expectedLabel}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Now Expected</Text>
            <Text style={styles.nowExpectedValue}>Revised date pending confirmation</Text>
          </View>

          <View style={styles.cardNoteWrap}>
            <Text style={styles.cardNote}>Additional verification required by banking partner</Text>
          </View>

          <View style={styles.badgeWrap}>
            <Badge label="Under Review" tone="warning" />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>What&apos;s Happening</Text>
        </View>

        <View style={styles.timelineCard}>
          {TIMELINE.map((step, index) => {
            const isLast = index === TIMELINE.length - 1;
            return (
              <View key={step.key} style={styles.timelineRow}>
                <View style={styles.timelineIconColumn}>
                  <View
                    style={[
                      styles.timelineDot,
                      step.status === 'done' && styles.timelineDotDone,
                      step.status === 'active' && styles.timelineDotActive,
                      step.status === 'pending' && styles.timelineDotPending,
                    ]}
                  >
                    {step.status === 'done' ? (
                      <Icon name="check" size={12} color={colors.white} strokeWidth={3} />
                    ) : step.status === 'active' ? (
                      <View style={styles.timelineDotInner} />
                    ) : null}
                  </View>
                  {!isLast ? <View style={styles.timelineConnector} /> : null}
                </View>
                <View style={styles.timelineTextColumn}>
                  <Text
                    style={[
                      styles.timelineLabel,
                      step.status !== 'pending' && styles.timelineLabelEmphasis,
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

        <Text style={styles.footnote}>Usually resolved within 2–3 business days</Text>

        <View style={styles.actions}>
          <Button
            label="Raise a Ticket"
            onPress={() => Alert.alert('Raise a Ticket', 'Coming soon.')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    paddingBottom: spacing.huge,
  },
  hero: {
    alignItems: 'center',
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: radii.full,
    backgroundColor: colors.warningSurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  heading: {
    ...typography.h2,
    fontSize: 22,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  card: {
    marginHorizontal: spacing.xl,
    backgroundColor: colors.warningSurface,
    borderWidth: 1,
    borderColor: AMBER_BORDER,
    borderRadius: radii.md,
    padding: spacing.xl,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  cardLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  cardValue: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  expectedValue: {
    ...typography.label,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  nowExpectedValue: {
    ...typography.labelSemibold,
    color: colors.warningDark,
  },
  cardNoteWrap: {
    borderTopWidth: 1,
    borderTopColor: AMBER_BORDER,
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
  cardNote: {
    ...typography.caption,
    color: colors.warningDark,
  },
  badgeWrap: {
    paddingTop: spacing.md,
  },
  sectionHeader: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  timelineCard: {
    marginHorizontal: spacing.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.xl,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  timelineIconColumn: {
    alignItems: 'center',
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotDone: {
    backgroundColor: colors.primary,
  },
  timelineDotActive: {
    backgroundColor: colors.warningDark,
  },
  timelineDotPending: {
    backgroundColor: colors.border,
  },
  timelineDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.white,
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    minHeight: 28,
    backgroundColor: colors.primary,
  },
  timelineTextColumn: {
    flex: 1,
    paddingTop: 2,
    paddingBottom: spacing.xl,
  },
  timelineLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  timelineLabelEmphasis: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  timelineSublabel: {
    ...typography.caption,
    color: colors.warningDark,
    paddingTop: 2,
  },
  footnote: {
    ...typography.label,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  actions: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
});
