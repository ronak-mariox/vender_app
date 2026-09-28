import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useOrders } from '../../context/OrdersContext';
import { Icon } from '../../icons/Icon';
import { colors, spacing, typography } from '../../theme';
import { OrderActionLayout } from './OrderActionLayout';
import { driverLabel } from './orderHelpers';

type Props = NativeStackScreenProps<AuthStackParamList, 'ReadyForDispatchOrders'>;

export function ReadyForDispatchScreen({ navigation }: Props) {
  const { ordersByStatus } = useOrders();
  const readyOrders = ordersByStatus(['ready_for_pickup']);

  return (
    <OrderActionLayout
      title="Ready for Pickup"
      onBack={() => navigation.goBack()}
      banner={{
        variant: 'info',
        message: 'A delivery partner is assigned by the platform. Keep packed orders ready at the counter.',
      }}
      emptyMessage="No orders waiting for pickup"
      orders={readyOrders}
      onOrderPress={orderId => navigation.navigate('ReadyForDispatchConfirm', { orderId })}
      renderOrderExtra={order => (
        <View style={styles.partnerRow}>
          <Icon name={order.driverId ? 'bike' : 'clock'} size={14} color="#0891B2" />
          <Text style={styles.partnerText} numberOfLines={1}>
            {order.driverId ? driverLabel(order) : 'Waiting for delivery partner'}
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  partnerText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
});
