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

type Props = NativeStackScreenProps<AuthStackParamList, 'PaidSettlement'>;

function formatINR(amount: number) {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function PaidSettlementScreen({ navigation }: Props) {
  const { settlements } = usePayments();
  const [period, setPeriod] = useState<PaymentsPeriod>('month');

  const paidSettlements = useMemo(() => settlements.filter(s => s.status === 'paid'), [settlements]);
  const paidTotal = useMemo(() => paidSettlements.reduce((sum, s) => sum + s.netPayout, 0), [paidSettlements]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <NavHeader title="Paid Settlements" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryTextColumn}>
            <Text style={styles.summaryLabel}>Total Settled This Month</Text>
            <Text style={styles.summaryValue}>{formatINR(paidTotal)}</Text>
          </View>
          <Icon name="check-circle" size={24} color={colors.primary} />
        </View>

        <PeriodFilterBar value={period} onChange={setPeriod} />

        <View style={styles.listCard}>
          {paidSettlements.map(settlement => (
            <SettlementRow
              key={settlement.id}
              settlement={settlement}
              onPress={() => navigation.navigate('SettlementDetails', { settlementId: settlement.id })}
            />
          ))}
          {paidSettlements.length === 0 ? <Text style={styles.emptyText}>No paid settlements yet.</Text> : null}
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
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primarySurface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    marginBottom: spacing.lg,
  },
  summaryTextColumn: {
    gap: 2,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.primary,
  },
  summaryValue: {
    fontSize: 22,
    lineHeight: 33,
    fontWeight: '800',
    color: colors.textPrimary,
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
