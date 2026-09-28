import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { InfoBanner } from '../../components';
import { useOrders } from '../../context/OrdersContext';
import { colors, radii, spacing, typography } from '../../theme';
import { FlowStatusScreen } from '../order-flow/FlowStatusScreen';
import { FlexButton } from '../order-flow/FlexButton';
import { statusEventTime } from '../orders/orderHelpers';

type Props = NativeStackScreenProps<AuthStackParamList, 'CancellationConfirmation'>;

export function CancellationConfirmationScreen({ navigation, route }: Props) {
  const { orderId, reasonLabel } = route.params;
  const { getOrder } = useOrders();
  const order = getOrder(orderId);
  if (!order) return null;

  const cancelledAt = statusEventTime(order, 'cancelled');
  const isStockIssue = reasonLabel.toLowerCase().includes('stock');

  return (
    <FlowStatusScreen
      icon="x-circle"
      iconColor="#374151"
      iconBg="#F3F4F6"
      iconRingColor={colors.border}
      heading="Order Cancelled"
      subtitle={`${order.orderNumber} has been cancelled and the customer will be notified.`}
      footer={
        <View style={styles.footerColumn}>
          <View style={styles.fullWidthRow}>
            <FlexButton
              label="Update Inventory"
              onPress={() => navigation.navigate('InventoryOverview')}
              background={colors.primary}
              textColor={colors.white}
              flex={1}
            />
          </View>
          <View style={styles.fullWidthRow}>
            <FlexButton
              label="View All Orders"
              onPress={() => {
                navigation.popToTop();
                navigation.navigate('OrdersList');
              }}
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
        <View style={styles.row}>
          <Text style={styles.label}>Order</Text>
          <Text style={styles.value}>{order.orderNumber}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Reason</Text>
          <Text style={styles.value}>{reasonLabel}</Text>
        </View>
        <View style={[styles.row, styles.rowLast]}>
          <Text style={styles.label}>Cancelled at</Text>
          <Text style={styles.value}>{cancelledAt || '—'}</Text>
        </View>
      </View>

      {isStockIssue ? (
        <InfoBanner
          variant="warning"
          message="Tip: Update your inventory to avoid future cancellations for out-of-stock items."
        />
      ) : null}
    </FlowStatusScreen>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  value: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  footerColumn: {
    gap: spacing.sm,
  },
  fullWidthRow: {
    flexDirection: 'row',
  },
});
