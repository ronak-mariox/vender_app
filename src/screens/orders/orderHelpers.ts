import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import axios from 'axios';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Order, OrderStatus, useOrders } from '../../context/OrdersContext';
import { getApiErrorMessage } from '../../services/api';
import { formatEventTimestamp } from '../../utils/time';

type Navigation = NativeStackNavigationProp<AuthStackParamList, keyof AuthStackParamList>;

export function openOrder(navigation: Navigation, order: Order) {
  if (order.status === 'placed') {
    navigation.navigate('NewOrderReceived', { orderId: order.id });
    return;
  }
  if (order.status === 'cancelled' || order.status === 'rejected') {
    navigation.navigate('CancelledOrderDetails', { orderId: order.id });
    return;
  }
  navigation.navigate('OrderDetails', { orderId: order.id });
}

/** Returns the cached order, fetching it from the backend when it isn't loaded yet
 * (e.g. opened from a notification before the list has refreshed). */
export function useOrder(orderId: string) {
  const { getOrder, fetchOrder } = useOrders();
  const order = getOrder(orderId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await fetchOrder(orderId);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [fetchOrder, orderId]);

  useEffect(() => {
    if (!order && !loading && !error) load().catch(() => undefined);
    // Only kick off a fetch when the order is missing from the cache.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, order]);

  return { order, loading, error, retry: load };
}

export function statusEventTime(order: Order, status: OrderStatus): string {
  const event = [...order.statusHistory].reverse().find(item => item.status === status);
  return event ? formatEventTimestamp(new Date(event.at).getTime()) : '';
}

export function latestEventTime(order: Order): string {
  const event = order.statusHistory[order.statusHistory.length - 1];
  return event ? formatEventTimestamp(new Date(event.at).getTime()) : formatEventTimestamp(new Date(order.updatedAt).getTime());
}

export function placedTime(order: Order): string {
  return formatEventTimestamp(new Date(order.placedAt).getTime());
}

export function formatMoney(value: number): string {
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

export function driverLabel(order: Order): string {
  if (!order.driverId) return '';
  const { driver } = order;
  const parts = [driver?.name ?? 'Partner assigned', driver?.vehicle, driver?.plate].filter(
    (part): part is string => !!part,
  );
  return parts.join(' · ');
}

export type OrderActionKind = 'accept' | 'reject' | 'preparing' | 'ready' | 'cancel';

export const ORDER_ACTION_LABEL: Record<OrderActionKind, string> = {
  accept: 'Accept order',
  reject: 'Reject order',
  preparing: 'Start preparing',
  ready: 'Mark ready for pickup',
  cancel: 'Cancel order',
};

export const MAX_ACTION_ATTEMPTS = 3;

/** Maps an action kind to the OrdersContext call so failure screens can retry the same action. */
export function useRunOrderAction() {
  const { acceptOrder, rejectOrder, startPreparing, markReady, cancelOrder } = useOrders();
  return useCallback(
    (kind: OrderActionKind, orderId: string, note?: string) => {
      switch (kind) {
        case 'accept':
          return acceptOrder(orderId);
        case 'reject':
          return rejectOrder(orderId, note ?? '');
        case 'preparing':
          return startPreparing(orderId);
        case 'ready':
          return markReady(orderId);
        case 'cancel':
          return cancelOrder(orderId, note ?? '');
      }
    },
    [acceptOrder, rejectOrder, startPreparing, markReady, cancelOrder],
  );
}

export type OrderActionTarget =
  | { name: 'ProductPicking'; params: { orderId: string } }
  | { name: 'ReadyForDispatchConfirm'; params: { orderId: string } }
  | { name: 'RejectOrderConfirmation'; params: { orderId: string; reasonLabel: string } }
  | { name: 'CancellationConfirmation'; params: { orderId: string; reasonLabel: string } };

/** Where the vendor lands after an action succeeds. */
export function routeAfterAction(kind: OrderActionKind, orderId: string, note?: string): OrderActionTarget {
  switch (kind) {
    case 'accept':
    case 'preparing':
      return { name: 'ProductPicking', params: { orderId } };
    case 'ready':
      return { name: 'ReadyForDispatchConfirm', params: { orderId } };
    case 'reject':
      return { name: 'RejectOrderConfirmation', params: { orderId, reasonLabel: note ?? '' } };
    case 'cancel':
      return { name: 'CancellationConfirmation', params: { orderId, reasonLabel: note ?? '' } };
  }
}

/** A 4xx means the order moved on (e.g. customer cancelled) — retrying won't help. */
function isRetryable(err: unknown): boolean {
  if (!axios.isAxiosError(err)) return true;
  const status = err.response?.status;
  return status == null || status >= 500 || status === 408 || status === 429;
}

/**
 * Runs an order action with an in-flight guard. On success the vendor is moved
 * (replace) to the next screen for that action; transient failures open
 * OrderActionError (which retries the same action), permanent ones alert and
 * refresh the order.
 */
export function useOrderAction(navigation: Navigation) {
  const run = useRunOrderAction();
  const { fetchOrder } = useOrders();
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

  const perform = useCallback(
    async (kind: OrderActionKind, orderId: string, note?: string) => {
      if (busyRef.current) return;
      busyRef.current = true;
      setBusy(true);
      try {
        await run(kind, orderId, note);
        const target = routeAfterAction(kind, orderId, note);
        navigation.replace(target.name, target.params as never);
      } catch (err) {
        const message = getApiErrorMessage(err);
        if (isRetryable(err)) {
          navigation.navigate('OrderActionError', { orderId, action: kind, note, message });
        } else {
          Alert.alert(`Could not ${ORDER_ACTION_LABEL[kind].toLowerCase()}`, message);
          fetchOrder(orderId).catch(() => undefined);
        }
      } finally {
        busyRef.current = false;
        setBusy(false);
      }
    },
    [run, navigation, fetchOrder],
  );

  return { perform, busy };
}
