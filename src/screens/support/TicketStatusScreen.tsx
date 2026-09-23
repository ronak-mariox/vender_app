import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useSupport, SupportTicket, TicketStatus } from '../../context/SupportContext';
import { NavHeader, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'TicketStatus'>;

type FilterKey = 'all' | 'open' | 'resolved' | 'closed';

const OPEN_STATUSES: TicketStatus[] = ['open', 'in-progress', 'reopened', 'escalated'];

const STATUS_STYLES: Record<TicketStatus, { label: string; color: string; background: string }> = {
  open: { label: 'Open', color: '#1570EF', background: '#EFF8FF' },
  'in-progress': { label: 'In Progress', color: colors.warning, background: colors.warningSurface },
  resolved: { label: 'Resolved', color: colors.primary, background: colors.primarySurface },
  reopened: { label: 'Reopened', color: colors.warning, background: colors.warningSurface },
  escalated: { label: 'Escalated', color: colors.error, background: colors.errorSurface },
  closed: { label: 'Closed', color: colors.textSecondary, background: colors.surfaceAlt },
};

function matchesFilter(ticket: SupportTicket, filter: FilterKey): boolean {
  if (filter === 'all') return true;
  if (filter === 'open') return OPEN_STATUSES.includes(ticket.status);
  if (filter === 'resolved') return ticket.status === 'resolved';
  return ticket.status === 'closed';
}

export function TicketStatusScreen({ navigation }: Props) {
  const { tickets } = useSupport();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [query, setQuery] = useState('');

  const counts = useMemo(
    () => ({
      all: tickets.length,
      open: tickets.filter(t => OPEN_STATUSES.includes(t.status)).length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
      closed: tickets.filter(t => t.status === 'closed').length,
    }),
    [tickets],
  );

  const filteredTickets = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    return tickets.filter(ticket => {
      if (!matchesFilter(ticket, filter)) return false;
      if (!trimmed) return true;
      return (
        ticket.id.toLowerCase().includes(trimmed) ||
        ticket.issueTitle.toLowerCase().includes(trimmed) ||
        ticket.categoryLabel.toLowerCase().includes(trimmed)
      );
    });
  }, [tickets, filter, query]);

  const pills: { key: FilterKey; label: string }[] = [
    { key: 'all', label: `All (${counts.all})` },
    { key: 'open', label: `Open (${counts.open})` },
    { key: 'resolved', label: `Resolved (${counts.resolved})` },
    { key: 'closed', label: `Closed (${counts.closed})` },
  ];

  return (
    <ScreenContainer scrollable={false}>
      <NavHeader title="My Tickets" onBack={() => navigation.goBack()} />

      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <Icon name="search" size={16} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search tickets..."
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      </View>

      <View style={styles.pillsRow}>
        {pills.map(pill => {
          const active = pill.key === filter;
          return (
            <Pressable
              key={pill.key}
              onPress={() => setFilter(pill.key)}
              style={[styles.pill, active && styles.pillActive]}
              hitSlop={4}
            >
              <Text style={[styles.pillLabel, active && styles.pillLabelActive]}>{pill.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={filteredTickets}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <TicketRow ticket={item} onPress={() => navigation.navigate('TicketDetails', { ticketId: item.id })} />}
        ItemSeparatorComponent={ItemSeparator}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Icon name="file-text" size={32} color={colors.textTertiary} />
            <Text style={styles.emptyText}>No tickets found</Text>
          </View>
        }
        contentContainerStyle={filteredTickets.length === 0 ? styles.emptyContent : undefined}
      />
    </ScreenContainer>
  );
}

function ItemSeparator() {
  return <View style={styles.separator} />;
}

function TicketRow({ ticket, onPress }: { ticket: SupportTicket; onPress: () => void }) {
  const statusStyle = STATUS_STYLES[ticket.status];
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={styles.rowContent}>
        <View style={styles.rowTopLine}>
          <Text style={styles.ticketId}>#{ticket.id}</Text>
          <View style={[styles.statusChip, { backgroundColor: statusStyle.background }]}>
            <Text style={[styles.statusChipLabel, { color: statusStyle.color }]}>{statusStyle.label}</Text>
          </View>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryPillLabel}>{ticket.categoryLabel}</Text>
          </View>
        </View>
        <Text style={styles.issueTitle} numberOfLines={1}>
          {ticket.issueTitle}
        </Text>
        <Text style={styles.openedLabel}>{ticket.openedLabel}</Text>
      </View>
      <Icon name="chevron-right" size={16} color={colors.textTertiary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 3,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    padding: 0,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  pill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
  },
  pillActive: {
    backgroundColor: colors.primary,
  },
  pillLabel: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
  },
  pillLabelActive: {
    color: colors.white,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg + 2,
    backgroundColor: colors.white,
  },
  rowContent: {
    flex: 1,
    gap: 4,
  },
  rowTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  ticketId: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  statusChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  statusChipLabel: {
    ...typography.tinyBold,
  },
  categoryPill: {
    backgroundColor: colors.surface,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radii.sm + 2,
  },
  categoryPillLabel: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  issueTitle: {
    fontFamily: fontFamilies.regular,
    fontSize: 13,
    lineHeight: 19.5,
    color: colors.textPrimary,
  },
  openedLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingTop: spacing.massive,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  emptyContent: {
    flexGrow: 1,
  },
});
