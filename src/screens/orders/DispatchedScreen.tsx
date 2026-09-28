import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import { useOrders } from '../../context/OrdersContext';
import { colors, radii, spacing, typography } from '../../theme';
import { OrderActionLayout } from './OrderActionLayout';
import { driverLabel } from './orderHelpers';

type Props = NativeStackScreenProps<AuthStackParamList, 'DispatchedOrders'>;

export function DispatchedScreen({ navigation }: Props) {
  const { ordersByStatus } = useOrders();
  const dispatchedOrders = ordersByStatus(['out_for_delivery']);

  return (
    <OrderActionLayout
      title="Out for Delivery"
      onBack={() => navigation.goBack()}
      banner={{
        variant: 'info',
        message: 'Orders en route to customers. No action needed from your end.',
      }}
      emptyMessage="No orders out for delivery"
      orders={dispatchedOrders}
      onOrderPress={orderId => navigation.navigate('OrderDispatched', { orderId })}
      renderOrderExtra={order => {
        const phone = order.driver?.phone;
        return (
          <View style={styles.partnerRow}>
            <View style={styles.partnerIcon}>
              <Icon name="bike" size={18} color="#4338CA" />
            </View>
            <Text style={styles.partnerText} numberOfLines={1}>
              {driverLabel(order) || 'Delivery partner'}
            </Text>
            {phone ? (
              <Pressable style={styles.callButton} onPress={() => Linking.openURL(`tel:${phone}`)}>
                <Icon name="phone" size={15} color={colors.primary} />
              </Pressable>
            ) : null}
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  partnerIcon: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  callButton: {
    width: 32,
    height: 32,
    borderRadius: 9999,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
