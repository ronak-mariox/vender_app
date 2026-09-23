import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { NavHeader, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { useSupport } from '../../context/SupportContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'EscalateTicket'>;

const ESCALATION_REASONS = [
  'Not getting a response',
  'Resolution unsatisfactory',
  'Urgent financial impact',
  'Other',
];

export function EscalateTicketScreen({ navigation, route }: Props) {
  const { ticketId } = route.params;
  const { getTicket, escalateTicket } = useSupport();
  const ticket = getTicket(ticketId);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [impact, setImpact] = useState('');
  const canConfirm = Boolean(selectedReason);

  function handleBack() {
    navigation.goBack();
  }

  function handleEscalate() {
    if (!ticket || !selectedReason) return;
    const reasonText = impact.trim() ? `${selectedReason} — ${impact.trim()}` : selectedReason;
    escalateTicket(ticket.id, reasonText);
    navigation.goBack();
  }

  if (!ticket) {
    return (
      <ScreenContainer>
        <NavHeader title="Escalate Ticket" onBack={handleBack} />
        <View style={styles.notFoundWrap}>
          <Text style={styles.notFoundText}>Ticket not found.</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <NavHeader title="Escalate Ticket" onBack={handleBack} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.alertBanner}>
          <Icon name="alert-triangle" size={20} color={colors.error} strokeWidth={2} />
          <Text style={styles.alertText}>Escalation is for urgent unresolved issues only.</Text>
        </View>

        <View style={styles.ticketCard}>
          <Text style={styles.ticketCardLabel}>Current Ticket</Text>
          <Text style={styles.ticketCardId}>#{ticket.id}</Text>
          <Text style={styles.ticketCardMeta}>
            {ticket.assignedTeam} · Opened {ticket.openedLabel}
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Escalation Reason</Text>
        <View style={styles.reasonList}>
          {ESCALATION_REASONS.map(reasonOption => {
            const selected = selectedReason === reasonOption;
            return (
              <Pressable
                key={reasonOption}
                style={[styles.reasonRow, selected && styles.reasonRowSelected]}
                onPress={() => setSelectedReason(reasonOption)}
              >
                <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
                  {selected ? <View style={styles.radioInner} /> : null}
                </View>
                <Text style={styles.reasonText}>{reasonOption}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.impactSection}>
          <Text style={styles.label}>Impact Statement</Text>
          <TextInput
            style={styles.textarea}
            value={impact}
            onChangeText={setImpact}
            placeholder="Describe the financial or operational impact..."
            placeholderTextColor="rgba(31,41,55,0.5)"
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Escalated tickets are reviewed by senior support within <Text style={styles.infoTextBold}>4 hours</Text>.
          </Text>
        </View>

        <Pressable
          style={[styles.escalateButton, !canConfirm && styles.escalateButtonDisabled]}
          onPress={handleEscalate}
          disabled={!canConfirm}
        >
          <Text style={styles.escalateButtonText}>Escalate Now</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  notFoundWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
  },
  notFoundText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.huge,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.errorSurface,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  alertText: {
    ...typography.labelSemibold,
    fontFamily: fontFamilies.medium,
    color: colors.error,
    flex: 1,
  },
  ticketCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginTop: spacing.xl,
    gap: 2,
  },
  ticketCardLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  ticketCardId: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  ticketCardMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  sectionLabel: {
    ...typography.labelSemibold,
    fontFamily: fontFamilies.bold,
    color: colors.textPrimary,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
  reasonList: {
    width: '100%',
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  reasonRowSelected: {
    backgroundColor: colors.errorSurface,
    borderRadius: radii.sm,
    paddingLeft: spacing.md,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: radii.full,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: colors.error,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: radii.full,
    backgroundColor: colors.error,
  },
  reasonText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  impactSection: {
    paddingTop: spacing.xl,
    gap: spacing.sm,
  },
  label: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  textarea: {
    ...typography.body,
    color: colors.textPrimary,
    height: 80,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  infoBox: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
  },
  infoText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  infoTextBold: {
    ...typography.captionSemibold,
    color: colors.textPrimary,
  },
  escalateButton: {
    height: 52,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.error,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  escalateButtonDisabled: {
    opacity: 0.5,
  },
  escalateButtonText: {
    ...typography.button,
    color: colors.error,
  },
});
