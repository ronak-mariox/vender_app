import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { NavHeader } from '../../components';
import { Icon } from '../../icons/Icon';
import { usePayments } from '../../context/PaymentsContext';
import { PeriodFilterBar } from './PeriodFilterBar';
import { formatINR, sumBy } from './settlementHelpers';
import { SettlementRow } from './SettlementRow';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'PendingSettlement'>;

const AMBER_BG = '#FFFBEB';
const AMBER_BORDER = '#FDE68A';
const AMBER_TEXT = '#92400E';
const AMBER_TEXT_LIGHT = '#B45309';

export function PendingSettlementScreen({ navigation }: Props) {
  const { filteredSettlements } = usePayments();

  const pendingSettlements = useMemo(() => filteredSettlements.filter(s => s.status !== 'paid'), [filteredSettlements]);
  const pendingTotal = useMemo(() => sumBy(pendingSettlements, s => s.netPayout), [pendingSettlements]);
  const failed = pendingSettlements.filter(s => s.status === 'failed');
  const statusNote =
    failed.length > 0
      ? `${failed.length} payout${failed.length === 1 ? '' : 's'} failed${failed[0].failureReason ? ` — ${failed[0].failureReason}` : ''}`
      : `${pendingSettlements.length} weekly settlement${pendingSettlements.length === 1 ? '' : 's'} awaiting payout`;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <NavHeader title="Pending Settlement" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {pendingSettlements.length > 0 ? (
          <View style={styles.banner}>
            <Icon name="alert-circle" size={20} color={AMBER_TEXT_LIGHT} />
            <View style={styles.bannerTextColumn}>
              <Text style={styles.bannerTitle}>
                {formatINR(pendingTotal)} to be settled
              </Text>
              <Text style={styles.bannerSubtitle}>{statusNote}</Text>
            </View>
          </View>
        ) : null}

        <PeriodFilterBar />

        <View style={styles.listCard}>
          {pendingSettlements.map(settlement => (
            <SettlementRow
              key={settlement.id}
              settlement={settlement}
              onPress={() => navigation.navigate('SettlementDetails', { settlementId: settlement.id })}
            />
          ))}
          {pendingSettlements.length === 0 ? (
            <Text style={styles.emptyText}>No pending settlements in this period.</Text>
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
