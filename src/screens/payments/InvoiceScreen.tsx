import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { usePayments } from '../../context/PaymentsContext';
import { Badge, NavHeader } from '../../components';
import { Icon } from '../../icons/Icon';
import { PeriodFilterBar, PaymentsPeriod } from './PeriodFilterBar';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Invoice'>;

function formatINR(amount: number) {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function InvoiceScreen({ navigation, route }: Props) {
  const { settlementId } = route.params;
  const { settlements, getSettlement } = usePayments();
  const [period, setPeriod] = useState<PaymentsPeriod>('month');

  const currentSettlement = getSettlement(settlementId);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <NavHeader title="Invoices" onBack={() => navigation.goBack()} />
      <View style={styles.filterWrap}>
        <PeriodFilterBar value={period} onChange={setPeriod} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.listCard}>
          {settlements.map((settlement, index) => {
            const invoiceNumber = settlement.id.replace('STL', 'INV');
            const isCurrent = currentSettlement?.id === settlement.id;
            return (
              <Pressable
                key={settlement.id}
                style={[
                  styles.row,
                  index < settlements.length - 1 && styles.rowDivider,
                  isCurrent && styles.rowHighlighted,
                ]}
                onPress={() => navigation.navigate('ViewInvoice', { settlementId: settlement.id })}
              >
                <View style={styles.iconCircle}>
                  <Icon name="file-text" size={20} color={colors.error} />
                </View>
                <View style={styles.textColumn}>
                  <View style={styles.invoiceTitleRow}>
                    <Text style={styles.invoiceNumber}>{invoiceNumber}</Text>
                    {isCurrent ? <Badge label="Current" tone="info" /> : null}
                  </View>
                  <Text style={styles.invoiceMeta}>{settlement.dateRangeLabel}</Text>
                  <Text style={styles.invoiceDate}>
                    {settlement.transactionDate ?? settlement.dueDateLabel ?? '—'}
                  </Text>
                </View>
                <View style={styles.amountColumn}>
                  <Text style={styles.amount}>{formatINR(settlement.netPayout)}</Text>
                  <Icon name="chevron-down" size={16} color={colors.primary} strokeWidth={2.5} />
                </View>
              </Pressable>
            );
          })}
          {settlements.length === 0 ? <Text style={styles.emptyText}>No invoices yet.</Text> : null}
        </View>

        <Pressable
          style={styles.banner}
          onPress={() => Alert.alert('Contact support', 'Coming soon.')}
        >
          <Icon name="info" size={16} color={colors.textSecondary} />
          <Text style={styles.bannerText}>
            Need a GST invoice? <Text style={styles.bannerLink}>Contact support</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  filterWrap: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  content: {
    paddingBottom: spacing.huge,
  },
  listCard: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowHighlighted: {
    backgroundColor: colors.primarySurface,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: colors.errorSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textColumn: {
    flex: 1,
    gap: 2,
  },
  invoiceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  invoiceNumber: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  invoiceMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  invoiceDate: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  amountColumn: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  amount: {
    ...typography.bodySemibold,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.huge,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  bannerText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  bannerLink: {
    ...typography.captionSemibold,
    color: colors.primary,
  },
});
