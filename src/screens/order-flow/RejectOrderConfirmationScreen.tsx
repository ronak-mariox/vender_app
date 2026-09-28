import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useOrders } from '../../context/OrdersContext';
import { colors, radii, spacing, typography } from '../../theme';
import { FlowStatusScreen } from './FlowStatusScreen';
import { FlexButton } from './FlexButton';
import { statusEventTime } from '../orders/orderHelpers';

type Props = NativeStackScreenProps<AuthStackParamList, 'RejectOrderConfirmation'>;

export function RejectOrderConfirmationScreen({ navigation, route }: Props) {
  const { orderId, reasonLabel } = route.params;
  const { getOrder } = useOrders();
  const order = getOrder(orderId);
  if (!order) return null;

  const rejectedAt = statusEventTime(order, 'rejected');

  return (
    <FlowStatusScreen
      icon="x-circle"
      iconColor="#374151"
      iconBg="#F3F4F6"
      iconRingColor={colors.border}
      heading="Order Rejected"
      subtitle={`${order.orderNumber} has been rejected and the customer will be notified.`}
      footer={
        <>
          <FlexButton
            label="View All Orders"
            onPress={() => {
              navigation.popToTop();
              navigation.navigate('OrdersList');
            }}
            background={colors.primary}
            textColor={colors.white}
            flex={1}
          />
          <FlexButton
            label="Back to Dashboard"
            onPress={() => navigation.popToTop()}
            background={colors.white}
            textColor={colors.textSecondary}
            borderColor={colors.border}
            flex={1}
          />
        </>
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
          <Text style={styles.label}>Rejected at</Text>
          <Text style={styles.value}>{rejectedAt || '—'}</Text>
        </View>
      </View>
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
    padding: spacing.xl,
    marginTop: spacing.xl,
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
});
