import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { NavHeader } from '../../components';
import { Icon } from '../../icons/Icon';
import { usePayments } from '../../context/PaymentsContext';
import { PeriodFilterBar, PaymentsPeriod } from './PeriodFilterBar';
import { SettlementRow } from './SettlementRow';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'PendingSettlement'>;

const AMBER_BG = '#FFFBEB';
const AMBER_BORDER = '#FDE68A';
const AMBER_TEXT = '#92400E';
const AMBER_TEXT_LIGHT = '#B45309';

function formatINR(amount: number) {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

const STATUS_NOTE: Record<string, string> = {
  pending: 'Awaiting settlement',
  failed: 'Settlement failed',
};

export function PendingSettlementScreen({ navigation }: Props) {
  const { settlements } = usePayments();
  const [period, setPeriod] = useState<PaymentsPeriod>('month');

  const pendingSettlements = useMemo(() => settlements.filter(s => s.status !== 'paid'), [settlements]);
  const pendingTotal = useMemo(() => pendingSettlements.reduce((sum, s) => sum + s.netPayout, 0), [pendingSettlements]);
  const earliestDue = useMemo(
    () => pendingSettlements.find(s => s.dueDateLabel) ?? pendingSettlements[0],
    [pendingSettlements],
  );
  const dueDateShort = earliestDue?.dueDateLabel?.replace(/^Due\s*/i, '') ?? '';
  const statusNote = earliestDue
    ? earliestDue.status === 'failed'
      ? earliestDue.failureReason ?? STATUS_NOTE.failed
      : STATUS_NOTE[earliestDue.status] ?? 'Awaiting settlement'
    : '';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <NavHeader title="Pending Settlement" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {pendingSettlements.length > 0 ? (
          <View style={styles.banner}>
            <Icon name="alert-circle" size={20} color={AMBER_TEXT_LIGHT} />
            <View style={styles.bannerTextColumn}>
              <Text style={styles.bannerTitle}>
                {formatINR(pendingTotal)} to be settled{dueDateShort ? ` by ${dueDateShort}` : ''}
              </Text>
              <Text style={styles.bannerSubtitle}>{statusNote}</Text>
            </View>
          </View>
        ) : null}

        <PeriodFilterBar value={period} onChange={setPeriod} />

        <View style={styles.listCard}>
          {pendingSettlements.map(settlement => (
            <SettlementRow
              key={settlement.id}
              settlement={settlement}
              onPress={() => navigation.navigate('SettlementDetails', { settlementId: settlement.id })}
            />
          ))}
          {pendingSettlements.length === 0 ? (
            <Text style={styles.emptyText}>No pending settlements — you&apos;re all caught up.</Text>
          ) : null}
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
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.huge,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: AMBER_BG,
    borderWidth: 1,
    borderColor: AMBER_BORDER,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginBottom: spacing.lg,
  },
  bannerTextColumn: {
    flex: 1,
    gap: 2,
  },
  bannerTitle: {
    ...typography.labelSemibold,
    color: AMBER_TEXT,
  },
  bannerSubtitle: {
    ...typography.caption,
    color: AMBER_TEXT_LIGHT,
  },
  listCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    overflow: 'hidden',
    marginTop: spacing.lg,
  },
  emptyText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.xxl,
  },
});
