import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useOrders } from '../../context/OrdersContext';
import { getApiErrorMessage } from '../../services/api';
import { colors, spacing } from '../../theme';
import { OrderActionLayout } from './OrderActionLayout';
import { FlexButton } from './FlexButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'ReadyForDispatchOrders'>;

export function ReadyForDispatchScreen({ navigation }: Props) {
  const { ordersByStatus, handoverToPartner } = useOrders();
  const readyOrders = ordersByStatus(['ready-for-dispatch']);

  async function handleHandover(orderId: string) {
    try {
      await handoverToPartner(orderId);
    } catch (err) {
      Alert.alert('Could not update order', getApiErrorMessage(err));
    }
  }

  return (
    <OrderActionLayout
      title="Ready for Dispatch"
      onBack={() => navigation.goBack()}
      banner={{
        variant: 'info',
        message: 'Delivery partner will be assigned by system. Keep orders ready at counter.',
      }}
      orders={readyOrders}
      onOrderPress={orderId => navigation.navigate('OrderDetails', { orderId })}
      renderOrderExtra={order => (
        <View style={styles.actionsRow}>
          <FlexButton
            label="Awaiting partner"
            onPress={() => undefined}
            background={colors.white}
            textColor="#0891B2"
            borderColor="#0891B2"
            flex={1}
            disabled
          />
          <FlexButton
            label="Handover →"
            onPress={() => handleHandover(order.id)}
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
