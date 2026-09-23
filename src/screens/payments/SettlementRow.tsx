import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../../icons/Icon';
import { Settlement, SettlementStatus } from '../../context/PaymentsContext';
import { colors, radii, spacing, typography } from '../../theme';

const STATUS_META: Record<SettlementStatus, { label: string; background: string; text: string }> = {
  paid: { label: 'Paid', background: colors.primarySurface, text: colors.primary },
  pending: { label: 'Pending', background: colors.warningSurface, text: colors.warningDark },
  failed: { label: 'Failed', background: colors.errorSurface, text: colors.error },
};

type Props = {
  settlement: Settlement;
  onPress: () => void;
};

export function SettlementRow({ settlement, onPress }: Props) {
  const status = STATUS_META[settlement.status];
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.textColumn}>
        <Text style={styles.id}>{settlement.id}</Text>
        <Text style={styles.dateRange}>{settlement.dateRangeLabel}</Text>
      </View>
      <View style={styles.amountColumn}>
        <Text style={styles.amount}>₹{settlement.netPayout.toLocaleString('en-IN')}</Text>
        <View style={[styles.statusChip, { backgroundColor: status.background }]}>
          <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
        </View>
      </View>
      <Icon name="chevron-right" size={16} color={colors.textTertiary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  textColumn: {
    flex: 1,
    gap: 2,
  },
  id: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  dateRange: {
    ...typography.caption,
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
  statusChip: {
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
  },
  statusText: {
    ...typography.tinyBold,
    fontSize: 11,
  },
});
