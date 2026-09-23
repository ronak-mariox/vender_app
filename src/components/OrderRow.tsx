import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../icons/Icon';
import { StatusChip } from './StatusChip';
import { Order, ORDER_STATUS_META } from '../context/OrdersContext';
import { colors, radii, spacing, typography } from '../theme';

type Props = {
  order: Order;
  onPress: () => void;
  showChip?: boolean;
};

export function OrderRow({ order, onPress, showChip = true }: Props) {
  const meta = ORDER_STATUS_META[order.status];

  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={[styles.iconBox, { backgroundColor: meta.background }]}>
        <Icon name={meta.icon} size={18} color={meta.color} />
      </View>
      <View style={styles.textColumn}>
        <View style={styles.topRow}>
          <Text style={styles.orderId}>{order.id}</Text>
          <Text style={styles.time}>{order.timeLabel}</Text>
        </View>
        <Text style={styles.customerLine} numberOfLines={1}>
          {order.customerName} · {order.itemsCount} items · {order.location}
        </Text>
      </View>
      <View style={styles.rightColumn}>
        <Text style={styles.amount}>₹{order.amount}</Text>
        {showChip ? <StatusChip label={meta.label} color={meta.color} background={meta.background} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textColumn: {
    flex: 1,
    gap: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderId: {
    fontFamily: 'Courier',
    fontWeight: '700',
    fontSize: 13,
    color: colors.textPrimary,
  },
  time: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  customerLine: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  rightColumn: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  amount: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
});
