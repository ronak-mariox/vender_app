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
  const { ordersByStatus, startQualityCheck } = useOrders();
  const preparingOrders = ordersByStatus(['preparing']);

  return (
    <OrderActionLayout
      title="Preparing"
      onBack={() => navigation.goBack()}
      pill={{ label: `${preparingOrders.length} active`, color: colors.warningDark, background: colors.warningSurface }}
      banner={{
        variant: 'warning',
        message: 'Pick items and complete quality check before marking ready.',
      }}
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
            label="Start QC →"
            onPress={() => startQualityCheck(order.id)}
            background="#7C3AED"
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
