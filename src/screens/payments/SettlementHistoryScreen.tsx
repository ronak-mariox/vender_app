import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { NavHeader, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { Settlement, usePayments } from '../../context/PaymentsContext';
import { colors, radii, spacing, typography } from '../../theme';
import { PeriodFilterBar } from './PeriodFilterBar';
import { formatINR, sumBy } from './settlementHelpers';
import { SettlementRow } from './SettlementRow';

type Props = NativeStackScreenProps<AuthStackParamList, 'SettlementHistory'>;

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function SettlementHistoryScreen({ navigation }: Props) {
  const { filteredSettlements } = usePayments();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return filteredSettlements;
    return filteredSettlements.filter(
      settlement =>
        settlement.shortRef.toLowerCase().includes(query) ||
        settlement.invoiceNumber.toLowerCase().includes(query) ||
        settlement.dateRangeLabel.toLowerCase().includes(query),
    );
  }, [filteredSettlements, search]);

  const groups = useMemo(() => {
    const sorted = [...filtered].sort((a, b) => b.periodStart.localeCompare(a.periodStart));
    const map = new Map<string, { label: string; items: Settlement[] }>();
    sorted.forEach(settlement => {
      const start = new Date(settlement.periodStart);
      const valid = !Number.isNaN(start.getTime());
      const key = valid ? `${start.getFullYear()}-${start.getMonth()}` : 'unknown';
      const existing = map.get(key);
      if (existing) {
        existing.items.push(settlement);
      } else {
        map.set(key, {
          label: valid ? `${MONTH_NAMES[start.getMonth()]} ${start.getFullYear()}` : 'Other',
          items: [settlement],
        });
      }
    });
    return Array.from(map.entries()).map(([key, group]) => ({ key, ...group }));
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
          <PeriodFilterBar />
        </View>

        {groups.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No settlements found</Text>
          </View>
        ) : (
          groups.map(group => {
            const total = sumBy(group.items, item => item.netPayout);
            return (
              <View key={group.key}>
                <View style={styles.groupHeader}>
                  <Text style={styles.groupHeaderText}>
                    {group.label.toUpperCase()} · {formatINR(total)} total
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
