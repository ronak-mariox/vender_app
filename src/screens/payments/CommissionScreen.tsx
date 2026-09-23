import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { NavHeader, ScreenContainer } from '../../components';
import { usePayments } from '../../context/PaymentsContext';
import { spacing } from '../../theme';
import { PeriodFilterBar, PaymentsPeriod } from './PeriodFilterBar';
import { DeductionBreakdownBody } from './DeductionBreakdownBody';

type Props = NativeStackScreenProps<AuthStackParamList, 'Commission'>;

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

export function CommissionScreen({ navigation }: Props) {
  const { weeklyCommission } = usePayments();
  const [period, setPeriod] = useState<PaymentsPeriod>('month');

  const commissionTotal = useMemo(() => sum(weeklyCommission.map(row => row.amount)), [weeklyCommission]);
  const onSalesTotal = useMemo(() => sum(weeklyCommission.map(row => row.sales)), [weeklyCommission]);

  return (
    <ScreenContainer edges={['top', 'left', 'right', 'bottom']}>
      <NavHeader title="Platform Commission" onBack={() => navigation.goBack()} />
      <View style={styles.filterWrap}>
        <PeriodFilterBar value={period} onChange={setPeriod} />
      </View>
      <DeductionBreakdownBody
        bannerText={
          <>
            Commission is <Text style={{ fontWeight: '700' }}>8% of net sales</Text>, deducted before settlement.
          </>
        }
        summaryCards={[
          {
            label: 'Commission Charged',
            value: `₹${commissionTotal.toLocaleString('en-IN')}`,
            sublabel: 'This month',
          },
          {
            label: 'On Sales',
            value: `₹${onSalesTotal.toLocaleString('en-IN')}`,
            sublabel: '8% rate',
          },
        ]}
        tableTitle="Weekly Breakdown"
        amountColumnLabel="Commission"
        rows={weeklyCommission}
        footerTitle="Commission Rate History"
        footerBody="Rate unchanged since 1 Jan 2024 · 8%"
        footerLink="Contact us for rate queries →"
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  filterWrap: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
});
