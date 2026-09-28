import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button } from '../../components';
import { useOrders } from '../../context/OrdersContext';
import { getApiErrorMessage } from '../../services/api';
import { colors, spacing } from '../../theme';
import { OrderActionLayout } from './OrderActionLayout';
import { FlexButton } from './FlexButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'NewOrders'>;

export function NewOrdersScreen({ navigation }: Props) {
  const { ordersByStatus, acceptOrder, acceptAllNew, isOrderPending } = useOrders();
  const newOrders = ordersByStatus(['placed']);
  const [acceptingAll, setAcceptingAll] = useState(false);

  async function handleAccept(orderId: string) {
    if (isOrderPending(orderId) || acceptingAll) return;
    try {
      await acceptOrder(orderId);
    } catch (err) {
      Alert.alert('Could not accept order', getApiErrorMessage(err));
    }
  }

  async function handleAcceptAll() {
    if (acceptingAll) return;
    setAcceptingAll(true);
    try {
      await acceptAllNew();
    } catch (err) {
      Alert.alert('Could not accept all orders', getApiErrorMessage(err));
    } finally {
      setAcceptingAll(false);
    }
  }

  return (
    <OrderActionLayout
      title="New Orders"
      onBack={() => navigation.goBack()}
      pill={{ label: `${newOrders.length} NEW`, color: colors.white, background: colors.error }}
      banner={{
        variant: 'info',
        message: 'Accept or reject new orders promptly — customers are waiting for confirmation.',
      }}
      emptyMessage="No new orders right now"
      orders={newOrders}
      onOrderPress={orderId => navigation.navigate('NewOrderReceived', { orderId })}
      renderOrderExtra={order => (
        <View style={styles.actionsRow}>
          <FlexButton
            label="Accept"
            onPress={() => handleAccept(order.id)}
            background={colors.primary}
            textColor={colors.white}
            flex={1.03}
            disabled={isOrderPending(order.id) || acceptingAll}
          />
          <FlexButton
            label="Reject"
            onPress={() => navigation.navigate('RejectReason', { orderId: order.id })}
            disabled={isOrderPending(order.id) || acceptingAll}
            background={colors.errorSurface}
            textColor={colors.error}
            borderColor={colors.errorBorder}
            flex={1}
          />
        </View>
      )}
      footer={
        newOrders.length > 0 ? (
          <Button label="Accept All New Orders" onPress={handleAcceptAll} loading={acceptingAll} disabled={acceptingAll} />
        ) : undefined
      }
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
