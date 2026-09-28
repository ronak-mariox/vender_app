import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useOrders } from '../../context/OrdersContext';
import { colors, spacing } from '../../theme';
import { OrderActionLayout } from './OrderActionLayout';
import { FlexButton } from './FlexButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'PreparingOrders'>;

export function PreparingOrdersScreen({ navigation }: Props) {
  const { ordersByStatus } = useOrders();
  const preparingOrders = ordersByStatus(['accepted', 'preparing']);

  return (
    <OrderActionLayout
      title="Preparing"
      onBack={() => navigation.goBack()}
      pill={{ label: `${preparingOrders.length} active`, color: colors.warningDark, background: colors.warningSurface }}
      banner={{
        variant: 'warning',
        message: 'Pick and pack all items, then mark the order ready for pickup.',
      }}
      emptyMessage="No orders being prepared"
      orders={preparingOrders}
      onOrderPress={orderId => navigation.navigate('OrderDetails', { orderId })}
      renderOrderExtra={order => (
        <View style={styles.actionsRow}>
          <FlexButton
            label="View Items"
            onPress={() => navigation.navigate('OrderDetails', { orderId: order.id })}
            background={colors.white}
            textColor={colors.warningDark}
            borderColor={colors.warning}
            flex={1}
          />
          <FlexButton
            label={order.status === 'accepted' ? 'Start Preparing →' : 'Continue Packing →'}
            onPress={() => navigation.navigate('ProductPicking', { orderId: order.id })}
            background={colors.primary}
            textColor={colors.white}
            flex={1}
          />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
});
