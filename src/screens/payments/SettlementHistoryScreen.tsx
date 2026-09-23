import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { NavHeader, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { Settlement, usePayments } from '../../context/PaymentsContext';
import { colors, radii, spacing, typography } from '../../theme';
import { PeriodFilterBar, PaymentsPeriod } from './PeriodFilterBar';
import { SettlementRow } from './SettlementRow';

type Props = NativeStackScreenProps<AuthStackParamList, 'SettlementHistory'>;

const MONTH_NAMES: Record<string, string> = {
  Jan: 'January',
  Feb: 'February',
  Mar: 'March',
  Apr: 'April',
  May: 'May',
  Jun: 'June',
  Jul: 'July',
  Aug: 'August',
  Sep: 'September',
  Oct: 'October',
  Nov: 'November',
  Dec: 'December',
};

const MONTH_INDEX: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

function parseSettlementDate(dateRangeLabel: string): Date | null {
  const tokens = dateRangeLabel.trim().split(/\s+/);
  if (tokens.length < 3) return null;
  const [dayRange, monthAbbr, year] = tokens;
  const endDay = Number(dayRange.split(/[–-]/).pop());
  const monthIndex = MONTH_INDEX[monthAbbr];
  const yearNum = Number(year);
  if (Number.isNaN(endDay) || monthIndex === undefined || Number.isNaN(yearNum)) return null;
  return new Date(yearNum, monthIndex, endDay);
}

function groupKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function formatINR(value: number): string {
  return `₹${Math.round(Math.abs(value)).toLocaleString('en-IN')}`;
}

export function SettlementHistoryScreen({ navigation }: Props) {
  const { settlements } = usePayments();
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState<PaymentsPeriod>('month');

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return settlements;
    return settlements.filter(
      settlement =>
        settlement.id.toLowerCase().includes(query) ||
        settlement.dateRangeLabel.toLowerCase().includes(query),
    );
  }, [settlements, search]);

  const groups = useMemo(() => {
    const map = new Map<string, { date: Date; label: string; items: Settlement[] }>();
    filtered.forEach(settlement => {
      const date = parseSettlementDate(settlement.dateRangeLabel);
      const key = date ? groupKey(date) : 'unknown';
      const label = date ? `${MONTH_NAMES[settlement.dateRangeLabel.split(/\s+/)[1]] ?? ''} ${date.getFullYear()}` : 'Other';
      const existing = map.get(key);
      if (existing) {
        existing.items.push(settlement);
      } else {
        map.set(key, { date: date ?? new Date(0), label, items: [settlement] });
      }
    });
    return Array.from(map.values())
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .map(group => ({
        ...group,
        items: group.items.sort((a, b) => {
          const dateA = parseSettlementDate(a.dateRangeLabel)?.getTime() ?? 0;
          const dateB = parseSettlementDate(b.dateRangeLabel)?.getTime() ?? 0;
          return dateB - dateA;
        }),
      }));
  }, [filtered]);

  return (
    <ScreenContainer scrollable={false} backgroundColor={colors.white}>
      <NavHeader title="Settlement History" onBack={() => navigation.goBack()} />
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.searchWrap}>
          <View style={styles.searchBar}>
            <Icon name="search" size={16} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search settlements..."
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>

        <View style={styles.filterBarWrap}>
          <PeriodFilterBar value={period} onChange={setPeriod} />
        </View>

        {groups.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No settlements found</Text>
          </View>
        ) : (
          groups.map((group, index) => {
            const total = group.items.reduce((sum, item) => sum + item.netPayout, 0);
            return (
              <View key={group.label + index}>
                <View style={styles.groupHeader}>
                  <Text style={styles.groupHeaderText}>
                    {group.label.toUpperCase()}
                    {index > 0 ? ` · ${formatINR(total)} total` : ''}
                  </Text>
                </View>
                {group.items.map(settlement => (
                  <SettlementRow
                    key={settlement.id}
                    settlement={settlement}
                    onPress={() => navigation.navigate('SettlementDetails', { settlementId: settlement.id })}
                  />
                ))}
              </View>
            );
          })
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.huge,
  },
  searchWrap: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.lg,
    height: 42,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    padding: 0,
  },
  filterBarWrap: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  groupHeader: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
  },
  groupHeaderText: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
    letterSpacing: 0.6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.huge,
  },
  emptyStateText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
