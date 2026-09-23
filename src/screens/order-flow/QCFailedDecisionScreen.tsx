import React from 'react';
import { Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useOrders } from '../../context/OrdersContext';
import { getApiErrorMessage } from '../../services/api';
import { ItemIssueDecisionView } from './ItemIssueDecisionView';

type Props = NativeStackScreenProps<AuthStackParamList, 'QCFailedDecision'>;

export function QCFailedDecisionScreen({ navigation, route }: Props) {
  const { orderId, itemName, itemPrice, itemQty } = route.params;
  // Same reasoning as MissingItemDecisionScreen: by the QC step the order is already accepted,
  // so cancelling it here must go through the vendor-cancel endpoint, not pre-accept reject.
  const { cancelAcceptedOrder } = useOrders();

  return (
    <ItemIssueDecisionView
      headerTitle="QC Failed"
      onBack={() => navigation.goBack()}
      statusIcon="x-circle"
      heading="Quality Check Failed"
      subtitle="1 item failed quality inspection. You must replace or remove it before proceeding."
      detailIcon="package"
      detailTitle={`${itemName} ×${itemQty}`}
      detailLines={['Failed check: Packaging undamaged', '2 packets have dented lids, may be leaking']}
      prompt="Choose an option below to continue processing this order."
      options={[
        {
          label: 'Replace with fresh stock',
          tone: 'success',
          onPress: () =>
            navigation.navigate('ReplaceItem', { orderId, itemName, itemPrice, itemQty, source: 'qc' }),
        },
        {
          label: 'Remove item from order',
          tone: 'warning',
          onPress: () =>
            navigation.navigate('RemoveItem', { orderId, itemName, itemPrice, itemQty, source: 'qc' }),
        },
        {
          label: 'Cancel this order',
          tone: 'error',
          onPress: async () => {
            try {
              await cancelAcceptedOrder(orderId, `${itemName} failed quality check`);
              navigation.replace('RejectOrderConfirmation', {
                orderId,
                reasonLabel: `${itemName} failed quality check`,
              });
            } catch (err) {
              Alert.alert('Could not cancel order', getApiErrorMessage(err));
            }
          },
        },
      ]}
    />
  );
}
