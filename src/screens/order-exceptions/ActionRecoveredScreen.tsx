import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useOrders } from '../../context/OrdersContext';
import { colors, radii, spacing, typography } from '../../theme';
import { FlowStatusScreen } from '../order-flow/FlowStatusScreen';
import { FlexButton } from '../order-flow/FlexButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'ActionRecovered'>;

export function ActionRecoveredScreen({ navigation, route }: Props) {
  const { orderId, actionLabel } = route.params;
  const { getOrder } = useOrders();
  const order = getOrder(orderId);
  if (!order) return null;

  const acceptedAt = order.statusHistory[order.statusHistory.length - 1]?.time ?? '';

  return (
    <FlowStatusScreen
      icon="check-circle"
      iconColor={colors.primary}
      iconBg={colors.primarySurface}
      iconRingColor={colors.primaryBorder}
      heading="Recovered!"
      subtitle={`${order.id} has been accepted successfully after retrying. You can now proceed to prepare the order.`}
      footer={
        <View style={styles.footerColumn}>
          <View style={styles.fullWidthRow}>
            <FlexButton
              label="Start Preparing Order →"
              onPress={() => navigation.replace('InventoryCheck', { orderId })}
              background={colors.primary}
              textColor={colors.white}
              flex={1}
            />
          </View>
          <View style={styles.fullWidthRow}>
            <FlexButton
              label="View Order Details"
              onPress={() => navigation.replace('OrderDetails', { orderId })}
              background={colors.white}
              textColor={colors.textSecondary}
              borderColor={colors.border}
              flex={1}
            />
          </View>
        </View>
      }
    >
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Recovery Summary</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Order</Text>
          <Text style={styles.value}>ORD-2026-{order.id.replace('ORD-', '')}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Action</Text>
          <Text style={styles.value}>{actionLabel}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Attempts</Text>
          <Text style={styles.value}>2 (recovered on 2nd)</Text>
        </View>
        <View style={[styles.row, styles.rowLast]}>
          <Text style={styles.label}>Accepted at</Text>
          <Text style={styles.value}>{acceptedAt}</Text>
        </View>
      </View>

      <View style={styles.connectionRow}>
        <View style={styles.connectionDot} />
        <Text style={styles.connectionText}>Connection stable · All systems operational</Text>
      </View>
    </FlowStatusScreen>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    width: '100%',
    backgroundColor: colors.primarySurface,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginTop: spacing.xl,
  },
  summaryTitle: {
    ...typography.captionBold,
    color: colors.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.66,
    paddingBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryBorder,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  label: {
    ...typography.caption,
    color: colors.primaryDark,
    opacity: 0.8,
  },
  value: {
    ...typography.captionSemibold,
    color: colors.primaryDark,
  },
  connectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  connectionText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  footerColumn: {
    gap: spacing.sm,
  },
  fullWidthRow: {
    flexDirection: 'row',
  },
});
