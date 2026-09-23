import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import type { Order } from '../../context/OrdersContext';

type Navigation = NativeStackNavigationProp<AuthStackParamList, keyof AuthStackParamList>;

export function openOrder(navigation: Navigation, order: Order) {
  if (order.status === 'new') {
    navigation.navigate('NewOrderReceived', { orderId: order.id });
    return;
  }
  if (order.status === 'cancelled') {
    navigation.navigate('CancelledOrderDetails', { orderId: order.id });
    return;
  }
  if (order.status === 'failed') {
    navigation.navigate('FailedOrderDetails', { orderId: order.id });
    return;
  }
  navigation.navigate('OrderDetails', { orderId: order.id });
}
