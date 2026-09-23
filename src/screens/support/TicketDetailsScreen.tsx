import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useSupport, EvidenceFile, TicketStatus } from '../../context/SupportContext';
import { NavHeader, ScreenContainer, StatusTimeline } from '../../components';
import { Icon, IconName } from '../../icons/Icon';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'TicketDetails'>;

const STATUS_STYLES: Record<TicketStatus, { label: string; color: string; background: string }> = {
  open: { label: 'Open', color: '#1570EF', background: '#EFF8FF' },
  'in-progress': { label: 'In Progress', color: colors.warning, background: colors.warningSurface },
  resolved: { label: 'Resolved', color: colors.primary, background: colors.primarySurface },
  reopened: { label: 'Reopened', color: colors.warning, background: colors.warningSurface },
  escalated: { label: 'Escalated', color: colors.error, background: colors.errorSurface },
  closed: { label: 'Closed', color: colors.textSecondary, background: colors.surfaceAlt },
};

const ACTIVE_CONVERSATION_STATUSES: TicketStatus[] = ['in-progress', 'reopened', 'escalated'];

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function evidenceIcon(type: EvidenceFile['type']): IconName {
  return type === 'pdf' ? 'file-text' : 'image';
}

export function TicketDetailsScreen({ navigation, route }: Props) {
  const { ticketId } = route.params;
  const { getTicket } = useSupport();
  const ticket = getTicket(ticketId);

  if (!ticket) {
    return (
      <ScreenContainer scrollable={false}>
        <NavHeader title="Ticket" onBack={() => navigation.goBack()} />
        <View style={styles.notFoundWrap}>
          <Icon name="alert-circle" size={36} color={colors.textTertiary} />
          <Text style={styles.notFoundText}>Ticket not found</Text>
        </View>
      </ScreenContainer>
    );
  }

  const statusStyle = STATUS_STYLES[ticket.status];
  const showConversationLink = ACTIVE_CONVERSATION_STATUSES.includes(ticket.status);

  return (
    <ScreenContainer scrollable={false}>
      <NavHeader title={`Ticket #${ticket.id}`} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.metaRow}>
          <View style={[styles.statusChip, { backgroundColor: statusStyle.background }]}>
            <Text style={[styles.statusChipLabel, { color: statusStyle.color }]}>{statusStyle.label}</Text>
          </View>
          <Text style={styles.openedText}>Opened: {ticket.openedLabel}</Text>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryPillLabel}>{ticket.categoryLabel}</Text>
          </View>
        </View>

        <Text style={styles.issueTitle}>{ticket.issueTitle}</Text>

        {showConversationLink ? (
          <Pressable
            style={styles.conversationLink}
            onPress={() => navigation.navigate('SupportResponse', { ticketId: ticket.id })}
            hitSlop={4}
          >
            <Icon name="message-otp" size={14} color={colors.primary} />
            <Text style={styles.conversationLinkText}>View Conversation</Text>
            <Icon name="chevron-right" size={14} color={colors.primary} />
          </Pressable>
        ) : null}

        <Text style={styles.sectionHeading}>Timeline</Text>
        <View style={styles.timelineWrap}>
          <StatusTimeline steps={ticket.timeline} />
        </View>

        <Text style={styles.sectionHeading}>Evidence</Text>
        {ticket.evidence.length > 0 ? (
          <View style={styles.evidenceRow}>
            {ticket.evidence.map(file => (
              <View key={file.id} style={styles.evidenceCard}>
                <Icon name={evidenceIcon(file.type)} size={20} color={colors.textSecondary} />
                <Text style={styles.evidenceName} numberOfLines={2}>
                  {file.name}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noEvidenceText}>No evidence attached</Text>
        )}

        <Pressable
          style={styles.addInfoButton}
          onPress={() => Alert.alert('Add More Info', 'Coming soon.')}
        >
          <Text style={styles.addInfoButtonLabel}>Add More Info</Text>
        </Pressable>

        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ticket ID</Text>
            <Text style={styles.detailValue}>#{ticket.id}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Priority</Text>
            <Text style={styles.detailValue}>{capitalize(ticket.priority)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Assigned Team</Text>
            <Text style={styles.detailValue}>{ticket.assignedTeam}</Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.huge,
  },
  notFoundWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  notFoundText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  statusChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  statusChipLabel: {
    ...typography.tinyBold,
  },
  openedText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  categoryPill: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 2,
    borderRadius: radii.sm + 2,
  },
  categoryPillLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  issueTitle: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    paddingTop: spacing.lg,
  },
  conversationLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: spacing.md,
  },
  conversationLinkText: {
    ...typography.labelSemibold,
    color: colors.primary,
  },
  sectionHeading: {
    fontFamily: fontFamilies.bold,
    fontSize: 13,
    lineHeight: 19.5,
    color: colors.textPrimary,
    paddingTop: spacing.xxl,
  },
  timelineWrap: {
    paddingLeft: spacing.xs,
    paddingTop: spacing.lg,
  },
  evidenceRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  evidenceCard: {
    width: 80,
    height: 80,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: spacing.xs,
  },
  evidenceName: {
    fontFamily: fontFamilies.regular,
    fontSize: 9,
    lineHeight: 13.5,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  noEvidenceText: {
    ...typography.caption,
    color: colors.textSecondary,
    paddingTop: spacing.md,
  },
  addInfoButton: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xxl,
    backgroundColor: colors.white,
  },
  addInfoButtonLabel: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  detailCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  detailLabel: {
    fontFamily: fontFamilies.regular,
    fontSize: 13,
    lineHeight: 19.5,
    color: colors.textSecondary,
  },
  detailValue: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
});
