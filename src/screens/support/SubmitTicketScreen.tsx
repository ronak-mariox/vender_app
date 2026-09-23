import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, Checkbox, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { useSupportDraft } from '../../context/SupportDraftContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'SubmitTicket'>;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatNow(): string {
  const now = new Date();
  const day = now.getDate();
  const month = MONTHS[now.getMonth()];
  const year = now.getFullYear();
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
}

type SummaryRow = { label: string; value: string };

export function SubmitTicketScreen({ navigation }: Props) {
  const { draft, submitTicket, resetDraft } = useSupportDraft();
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const rows: SummaryRow[] = [
    { label: 'Issue', value: draft.issueTitle ?? 'Not specified' },
    ...(draft.orderId ? [{ label: 'Order ID', value: `#${draft.orderId}` }] : []),
    { label: 'Description', value: draft.description || 'No additional details provided.' },
    { label: 'Evidence', value: `${draft.evidence.length} file${draft.evidence.length === 1 ? '' : 's'}` },
    { label: 'Date', value: formatNow() },
  ];

  function handleSubmit() {
    if (!agreed || submitting) return;
    setSubmitting(true);
    const ticket = submitTicket();
    resetDraft();
    navigation.replace('TicketCreated', { ticketId: ticket.id });
  }

  return (
    <ScreenContainer backgroundColor={colors.white}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Icon name="arrow-left" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Review & Submit</Text>
      </View>

      <View style={styles.progressWrap}>
        <View style={styles.progressRow}>
          {[0, 1, 2, 3].map(index => (
            <View key={index} style={[styles.progressSegment, styles.progressSegmentFilled]} />
          ))}
        </View>
        <Text style={styles.stepLabel}>Step 4 of 4</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {rows.map((row, index) => (
            <View key={row.label} style={[styles.row, index < rows.length - 1 && styles.rowDivider]}>
              <Text style={styles.rowLabel}>{row.label}</Text>
              <Text style={styles.rowValue}>{row.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.resolutionNote}>
          <Text style={styles.resolutionText}>
            Estimated resolution: <Text style={styles.resolutionBold}>24–48 hours</Text>
          </Text>
        </View>

        <View style={styles.agreeRow}>
          <Checkbox checked={agreed} onToggle={setAgreed} />
          <Text style={styles.agreeText}>
            By submitting you agree to our <Text style={styles.agreeLink}>Support Terms</Text>.
          </Text>
        </View>

        <View style={styles.buttonGroup}>
          <Button
            label="Submit Ticket"
            onPress={handleSubmit}
            disabled={!agreed}
            loading={submitting}
          />
          <Button label="Edit Details" variant="outline" onPress={() => navigation.goBack()} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  headerTitle: {
    fontFamily: fontFamilies.semibold,
    fontSize: 17,
    lineHeight: 25.5,
    color: colors.textPrimary,
  },
  progressWrap: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
  },
  progressRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  progressSegmentFilled: {
    backgroundColor: colors.primary,
  },
  stepLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  content: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.huge,
    gap: spacing.xl,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  row: {
    paddingHorizontal: spacing.lg + 2,
    paddingVertical: spacing.lg,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  rowValue: {
    ...typography.label,
    fontFamily: fontFamilies.medium,
    color: colors.textPrimary,
    paddingTop: 3,
  },
  resolutionNote: {
    backgroundColor: colors.surface,
    borderRadius: radii.sm + 2,
    paddingHorizontal: spacing.lg + 2,
    paddingVertical: spacing.lg,
  },
  resolutionText: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.textSecondary,
  },
  resolutionBold: {
    fontFamily: fontFamilies.semibold,
    color: colors.textPrimary,
  },
  agreeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg - 2,
  },
  agreeText: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.textSecondary,
    flex: 1,
  },
  agreeLink: {
    fontFamily: fontFamilies.medium,
    color: colors.primary,
  },
  buttonGroup: {
    gap: spacing.md,
  },
});
