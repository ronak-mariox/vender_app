import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useOrders } from '../../context/OrdersContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';
import { OrderActionLayout } from './OrderActionLayout';

type Props = NativeStackScreenProps<AuthStackParamList, 'CancelledOrders'>;

export function CancelledOrdersScreen({ navigation }: Props) {
  const { ordersByStatus } = useOrders();
  const cancelledOrders = ordersByStatus(['cancelled']);

  return (
    <OrderActionLayout
      title="Cancelled"
      onBack={() => navigation.goBack()}
      banner={{
        variant: 'error',
        message: 'High cancellation rate may affect your store visibility. Review reasons.',
      }}
      orders={cancelledOrders}
      onOrderPress={orderId => navigation.navigate('CancelledOrderDetails', { orderId })}
      renderOrderExtra={order =>
        order.cancelReason ? (
          <View style={styles.reasonRow}>
            <View style={styles.reasonPill}>
              <Text style={styles.reasonText}>{order.cancelReason}</Text>
            </View>
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  reasonRow: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  reasonPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.errorSurface,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  reasonText: {
    ...typography.tiny,
    color: colors.error,
    fontFamily: fontFamilies.semibold,
  },
});
