import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useOrders } from '../../context/OrdersContext';
import { getApiErrorMessage } from '../../services/api';
import { colors, spacing } from '../../theme';
import { OrderActionLayout } from './OrderActionLayout';
import { FlexButton } from './FlexButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'PackingOrders'>;

export function PackingScreen({ navigation }: Props) {
  const { ordersByStatus, markPacked } = useOrders();
  const packingOrders = ordersByStatus(['packing']);

  async function handleMarkPacked(orderId: string) {
    try {
      await markPacked(orderId);
    } catch (err) {
      Alert.alert('Could not update order', getApiErrorMessage(err));
    }
  }

  return (
    <OrderActionLayout
      title="Packing"
      onBack={() => navigation.goBack()}
      pill={{ label: `${packingOrders.length} packing`, color: '#EA580C', background: '#FFF7ED' }}
      banner={{
        variant: 'warning',
        message: 'Pack items securely. Fragile items need extra wrapping.',
      }}
      orders={packingOrders}
      onOrderPress={orderId => navigation.navigate('OrderDetails', { orderId })}
      renderOrderExtra={order => (
        <View style={styles.actionsRow}>
          <FlexButton
            label="Mark as Packed → Ready for Dispatch"
            onPress={() => handleMarkPacked(order.id)}
            background="#0891B2"
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
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
});
